import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarListChart,
  ProgressRing,
  StackedShareChart,
  TrendSparkBars
} from '../components/dashboard/DashboardCharts';
import DashboardLayout from '../components/DashboardLayout';
import { supabase } from '../lib/supabase';
import { fetchInteractionEvents, InteractionEvent } from '../utils/interactionTracking';
import styles from './FacultyDashboard.module.css';

type InteractionType = 'recommendation_view' | 'comparison_click';
type DateRange = '7d' | '30d' | 'all';
type TrackFilter = 'all' | 'general' | 'web_dev' | 'networking' | 'data';
type YearFilter = 'all' | '1st' | '2nd' | '3rd' | '4th' | 'graduate' | 'not_set';

interface TopDevice {
  id: string;
  name: string;
  brand: string;
  saveCount: number;
  ramGb: number | null;
  storageGb: number | null;
  storageType: string | null;
}

interface ProfileFilterRow {
  id: string;
  role: 'student' | 'faculty' | 'admin';
  it_track: TrackFilter | null;
  year_level: YearFilter | null;
}

interface SavedRow {
  device_id: string | null;
  user_id: string | null;
  created_at: string | null;
}

interface FeedbackRow {
  rating: number | null;
  user_id: string | null;
  created_at: string | null;
}

const DEFAULT_STORAGE_TYPE = 'SSD';
const DEVICE_UNAVAILABLE_LABEL = 'Device information unavailable';
const dateRangeCutoffDays: Record<'7d' | '30d', number> = {
  '7d': 7,
  '30d': 30
};

const isInteractionType = (value: unknown): value is InteractionType => {
  return value === 'recommendation_view' || value === 'comparison_click';
};

const inDateRange = (createdAt: string | null | undefined, range: DateRange) => {
  if (!createdAt) return false;
  const eventDate = new Date(createdAt);
  if (Number.isNaN(eventDate.getTime())) return false;
  if (range === 'all') return true;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - dateRangeCutoffDays[range]);
  return eventDate >= cutoff;
};

const FacultyDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [trackFilter, setTrackFilter] = useState<TrackFilter>('all');
  const [yearFilter, setYearFilter] = useState<YearFilter>('all');
  const [topDevices, setTopDevices] = useState<TopDevice[]>([]);
  const [savedRows, setSavedRows] = useState<SavedRow[]>([]);
  const [feedbackRows, setFeedbackRows] = useState<FeedbackRow[]>([]);
  const [interactionEvents, setInteractionEvents] = useState<InteractionEvent[]>([]);
  const [profiles, setProfiles] = useState<ProfileFilterRow[]>([]);
  const [interactionCounts, setInteractionCounts] = useState<Record<InteractionType, number>>({
    recommendation_view: 0,
    comparison_click: 0
  });

  const loadFacultyDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [savedDevicesResult, feedbackResult, profilesResult, interactionsResult] = await Promise.all([
        supabase.from('saved_devices').select('device_id, user_id, created_at'),
        supabase.from('feedback_responses').select('rating, user_id, created_at'),
        supabase.from('profiles').select('id, role, it_track, year_level'),
        fetchInteractionEvents()
      ]);

      if (savedDevicesResult.error) throw savedDevicesResult.error;
      if (feedbackResult.error) throw feedbackResult.error;
      if (profilesResult.error) throw profilesResult.error;

      const normalizedSavedRows = (savedDevicesResult.data ?? []) as SavedRow[];
      const normalizedFeedbackRows = (feedbackResult.data ?? []) as FeedbackRow[];
      const normalizedProfiles = (profilesResult.data ?? []) as ProfileFilterRow[];

      const distinctSavedDeviceIds = Array.from(
        new Set(normalizedSavedRows.map(row => row.device_id).filter((value): value is string => Boolean(value)))
      );

      let deviceMap = new Map<
        string,
        { name: string; brand: string; ram_gb: number | null; storage_gb: number | null; storage_type: string | null }
      >();
      if (distinctSavedDeviceIds.length > 0) {
        const devicesResult = await supabase
          .from('devices')
          .select('id, name, brand, ram_gb, storage_gb, storage_type')
          .in('id', distinctSavedDeviceIds);
        if (devicesResult.error) throw devicesResult.error;

        deviceMap = new Map(
          (devicesResult.data ?? []).map(device => [
            String(device.id),
            {
              name: String(device.name ?? DEVICE_UNAVAILABLE_LABEL),
              brand: String(device.brand ?? ''),
              ram_gb: typeof device.ram_gb === 'number' ? device.ram_gb : null,
              storage_gb: typeof device.storage_gb === 'number' ? device.storage_gb : null,
              storage_type: typeof device.storage_type === 'string' ? device.storage_type : null
            }
          ])
        );
      }

      const deviceCountMap = normalizedSavedRows.reduce<Map<string, number>>((accumulator, row) => {
        if (!row.device_id) return accumulator;
        accumulator.set(row.device_id, (accumulator.get(row.device_id) ?? 0) + 1);
        return accumulator;
      }, new Map());

      const topDeviceEntries = Array.from(deviceCountMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      setTopDevices(
        topDeviceEntries.map(([deviceId, saveCount]) => {
          const details = deviceMap.get(deviceId);
          return {
            id: deviceId,
            name: details?.name ?? DEVICE_UNAVAILABLE_LABEL,
            brand: details?.brand ?? '',
            saveCount,
            ramGb: details?.ram_gb ?? null,
            storageGb: details?.storage_gb ?? null,
            storageType: details?.storage_type ?? null
          };
        })
      );

      const normalizedCounts = interactionsResult.reduce<Record<InteractionType, number>>(
        (accumulator, event) => {
          if (!isInteractionType(event.event_type)) return accumulator;
          accumulator[event.event_type] += 1;
          return accumulator;
        },
        {
          recommendation_view: 0,
          comparison_click: 0
        }
      );

      setSavedRows(normalizedSavedRows);
      setFeedbackRows(normalizedFeedbackRows);
      setProfiles(normalizedProfiles);
      setInteractionEvents(interactionsResult);
      setInteractionCounts(normalizedCounts);
    } catch (error: any) {
      setErrorMessage(error?.message ?? 'Unable to load anonymized faculty trends.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFacultyDashboard();
  }, [loadFacultyDashboard]);

  const filteredStudentIds = useMemo(() => {
    return new Set(
      profiles
        .filter(profile => profile.role === 'student')
        .filter(profile => (trackFilter === 'all' ? true : profile.it_track === trackFilter))
        .filter(profile => {
          if (yearFilter === 'all') return true;
          if (yearFilter === 'not_set') return !profile.year_level;
          return profile.year_level === yearFilter;
        })
        .map(profile => profile.id)
    );
  }, [profiles, trackFilter, yearFilter]);

  const filteredSavedRows = useMemo(() => {
    return savedRows.filter(row => {
      if (!row.user_id) return false;
      if (!filteredStudentIds.has(row.user_id)) return false;
      return inDateRange(row.created_at, dateRange);
    });
  }, [dateRange, filteredStudentIds, savedRows]);

  const filteredFeedbackRows = useMemo(() => {
    return feedbackRows.filter(row => {
      if (!row.user_id) return false;
      if (!filteredStudentIds.has(row.user_id)) return false;
      return inDateRange(row.created_at, dateRange);
    });
  }, [dateRange, feedbackRows, filteredStudentIds]);

  const filteredInteractionEvents = useMemo(() => {
    return interactionEvents.filter(event => {
      if (event.user_id && !filteredStudentIds.has(event.user_id)) return false;
      if (!event.user_id && (trackFilter !== 'all' || yearFilter !== 'all')) return false;
      return inDateRange(event.created_at, dateRange);
    });
  }, [dateRange, filteredStudentIds, interactionEvents, trackFilter, yearFilter]);

  const filteredTopDevices = useMemo(() => {
    const countMap = filteredSavedRows.reduce<Map<string, number>>((accumulator, row) => {
      if (!row.device_id) return accumulator;
      accumulator.set(row.device_id, (accumulator.get(row.device_id) ?? 0) + 1);
      return accumulator;
    }, new Map());

    return topDevices
      .map(device => ({
        ...device,
        saveCount: countMap.get(device.id) ?? 0
      }))
      .filter(device => device.saveCount > 0)
      .sort((a, b) => b.saveCount - a.saveCount)
      .slice(0, 5);
  }, [filteredSavedRows, topDevices]);

  const topSaveCount = filteredTopDevices[0]?.saveCount ?? 0;
  const ratings = filteredFeedbackRows
    .map(row => Number(row.rating))
    .filter(value => Number.isFinite(value) && value >= 1 && value <= 5);
  const averageRating =
    ratings.length > 0
      ? Number((ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(2))
      : null;

  const filteredInteractionCounts = filteredInteractionEvents.reduce<Record<InteractionType, number>>(
    (accumulator, event) => {
      if (!isInteractionType(event.event_type)) return accumulator;
      accumulator[event.event_type] += 1;
      return accumulator;
    },
    {
      recommendation_view: 0,
      comparison_click: 0
    }
  );

  const ratingDistribution = useMemo(
    () =>
      [1, 2, 3, 4, 5].map(score => ({
        label: `${score}★`,
        value: ratings.filter(rating => rating === score).length,
        color: '#8b5cf6'
      })),
    [ratings]
  );

  const specPreference = useMemo(() => {
    const ramTierCounts = filteredTopDevices.reduce<Record<string, number>>((accumulator, device) => {
      const label = device.ramGb ? `${device.ramGb}GB RAM` : 'Unknown RAM';
      accumulator[label] = (accumulator[label] ?? 0) + device.saveCount;
      return accumulator;
    }, {});

    const storageTypeCounts = filteredTopDevices.reduce<Record<string, number>>((accumulator, device) => {
      const label = device.storageType ?? DEFAULT_STORAGE_TYPE;
      accumulator[label] = (accumulator[label] ?? 0) + device.saveCount;
      return accumulator;
    }, {});

    return {
      ram: Object.entries(ramTierCounts).map(([label, value]) => ({ label, value, color: '#22c55e' })),
      storageType: Object.entries(storageTypeCounts).map(([label, value]) => ({ label, value, color: '#06b6d4' }))
    };
  }, [filteredTopDevices]);

  const interactionTrend = useMemo(() => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 14;
    const dayLabels = Array.from({ length: days }).map((_, index) => {
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - (days - 1 - index));
      return {
        key: day.toISOString().slice(0, 10),
        label: day.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
      };
    });

    const counts = filteredInteractionEvents.reduce<Record<string, number>>((accumulator, event) => {
      const eventDate = new Date(event.created_at);
      if (Number.isNaN(eventDate.getTime())) return accumulator;
      const key = eventDate.toISOString().slice(0, 10);
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    }, {});

    return dayLabels.map((day, index) => ({
      label: days > 14 ? `${index + 1}` : day.label,
      value: counts[day.key] ?? 0,
      color: '#a855f7'
    }));
  }, [dateRange, filteredInteractionEvents]);

  const conversionRate =
    filteredInteractionCounts.recommendation_view > 0
      ? Math.min(
          100,
          Number(((filteredSavedRows.length / filteredInteractionCounts.recommendation_view) * 100).toFixed(1))
        )
      : 0;

  const primaryInsight = useMemo(() => {
    const mostSaved = filteredTopDevices[0];
    if (mostSaved?.ramGb && mostSaved?.storageGb) {
      return `Top preference: ${mostSaved.ramGb}GB RAM + ${mostSaved.storageGb}GB ${mostSaved.storageType ?? DEFAULT_STORAGE_TYPE}.`;
    }
    return 'Not enough complete specification data yet to derive a dominant hardware trend.';
  }, [filteredTopDevices]);

  const handleExportSummary = () => {
    const lines = [
      ['Range', dateRange],
      ['Track Filter', trackFilter],
      ['Year Filter', yearFilter],
      ['Saved Devices', `${filteredSavedRows.length}`],
      ['Recommendation Views', `${filteredInteractionCounts.recommendation_view}`],
      ['Comparison Clicks', `${filteredInteractionCounts.comparison_click}`],
      ['Average Rating', averageRating ? `${averageRating}/5` : 'No data'],
      ['Recommendation-to-Save Conversion %', `${conversionRate}`]
    ];
    const csv = ['Metric,Value', ...lines.map(([metric, value]) => `${metric},${value}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `faculty-summary-${dateRange}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <DashboardLayout
      title="Faculty Dashboard"
      subtitle="Read-only anonymized trends for curriculum validation and capstone defense evidence."
      badge="Faculty Insights"
    >
      {isLoading && (
        <section className={styles.grid} aria-label="Loading faculty dashboard">
          {Array.from({ length: 4 }).map((_, index) => (
            <article key={`skeleton-${index}`} className={`${styles.card} ${styles.skeletonCard}`}>
              <div className={styles.skeletonLine} />
              <div className={`${styles.skeletonLine} ${styles.skeletonLineWide}`} />
              <div className={styles.skeletonLine} />
            </article>
          ))}
        </section>
      )}

      {!isLoading && errorMessage && (
        <section className={styles.stateCard}>
          <p>{errorMessage}</p>
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => { void loadFacultyDashboard(); }}
            aria-label="Retry loading dashboard data"
          >
            Retry
          </button>
        </section>
      )}

      {!isLoading && !errorMessage && (
        <>
          <section className={styles.controls}>
            <label>
              Date Range
              <select value={dateRange} onChange={event => setDateRange(event.target.value as DateRange)}>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="all">All time</option>
              </select>
            </label>
            <label>
              Track
              <select value={trackFilter} onChange={event => setTrackFilter(event.target.value as TrackFilter)}>
                <option value="all">All tracks</option>
                <option value="general">General</option>
                <option value="web_dev">Web Development</option>
                <option value="networking">Networking</option>
                <option value="data">Data</option>
              </select>
            </label>
            <label>
              Year level
              <select value={yearFilter} onChange={event => setYearFilter(event.target.value as YearFilter)}>
                <option value="all">All year levels</option>
                <option value="1st">1st</option>
                <option value="2nd">2nd</option>
                <option value="3rd">3rd</option>
                <option value="4th">4th</option>
                <option value="graduate">Graduate</option>
                <option value="not_set">Not set</option>
              </select>
            </label>
            <button type="button" className={styles.actionButton} onClick={handleExportSummary}>
              Export Summary CSV
            </button>
          </section>

          <section className={styles.grid}>
            <article className={styles.card}>
              <BarListChart
                title="Top Saved Devices"
                points={filteredTopDevices.map(device => ({
                  label: [device.brand, device.name].filter(Boolean).join(' '),
                  value: device.saveCount,
                  color: '#8b5cf6'
                }))}
              />
            </article>
            <article className={styles.card}>
              <TrendSparkBars title="Interaction Trend" points={interactionTrend} color="#a855f7" />
            </article>
            <article className={styles.card}>
              <BarListChart title="Rating Distribution" points={ratingDistribution} maxValue={Math.max(1, ratings.length)} />
            </article>
            <article className={styles.card}>
              <StackedShareChart
                title="Interaction Mix"
                points={[
                  {
                    label: 'Recommendation Views',
                    value: filteredInteractionCounts.recommendation_view,
                    color: '#8b5cf6'
                  },
                  {
                    label: 'Comparison Clicks',
                    value: filteredInteractionCounts.comparison_click,
                    color: '#06b6d4'
                  },
                  { label: 'Saved Devices', value: filteredSavedRows.length, color: '#22c55e' }
                ]}
              />
            </article>
          </section>

          <section className={styles.grid}>
            <article className={styles.card}>
              <ProgressRing
                title="Recommendation-to-Save Conversion"
                current={Math.round(conversionRate)}
                total={100}
                subtitle={`${filteredSavedRows.length} saves from ${filteredInteractionCounts.recommendation_view} views`}
              />
            </article>
            <article className={styles.card}>
              <BarListChart title="RAM Preference" points={specPreference.ram} />
            </article>
            <article className={styles.card}>
              <BarListChart title="Storage Type Preference" points={specPreference.storageType} />
            </article>
            <article className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Primary Insight</h2>
                <span className={styles.cardMeta}>Trend</span>
              </div>
              <p className={styles.mutedText}>{primaryInsight}</p>
              <p className={styles.mutedText}>
                Average rating: <strong>{averageRating ? `${averageRating}/5` : 'No data'}</strong>
              </p>
              <p className={styles.mutedText}>
                Range total interactions: <strong>{filteredInteractionEvents.length}</strong>
              </p>
              <p className={styles.mutedText}>
                Baseline all-time interactions: <strong>{interactionCounts.recommendation_view + interactionCounts.comparison_click}</strong>
              </p>
            </article>
          </section>

          <section className={styles.methodologySection}>
            <h2 className={styles.sectionTitle}>Methodology & Reports</h2>
            <div className={styles.actionsRow}>
              <button type="button" className={styles.actionButton} onClick={() => navigate('/faculty/methodology')}>
                Open Methodology
              </button>
              <button type="button" className={styles.actionButton} onClick={() => navigate('/faculty/reports')}>
                Open Reports
              </button>
            </div>
          </section>

          <section className={styles.methodologySection}>
            <h2 className={styles.sectionTitle}>Top Device Snapshot</h2>
            {filteredTopDevices.length === 0 ? (
              <p className={styles.mutedText}>No saved device activity yet for the selected filters.</p>
            ) : (
              <ul className={styles.metricList}>
                {filteredTopDevices.map(device => (
                  <li key={device.id} className={styles.metricItem}>
                    <div>
                      <p className={styles.metricTitle}>{[device.brand, device.name].filter(Boolean).join(' ')}</p>
                      <p className={styles.mutedText}>{device.saveCount} saves</p>
                    </div>
                    <div className={styles.progressWrap} aria-hidden="true">
                      <span
                        className={styles.progressBar}
                        style={{
                          width: `${Math.max(10, Math.round((device.saveCount / Math.max(topSaveCount, 1)) * 100))}%`
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </DashboardLayout>
  );
};

export default FacultyDashboard;
