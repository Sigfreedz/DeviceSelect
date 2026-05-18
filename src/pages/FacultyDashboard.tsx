import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { supabase } from '../lib/supabase';
import styles from './FacultyDashboard.module.css';

type InteractionType = 'recommendation_view' | 'comparison_click';

interface TopDevice {
  id: string;
  name: string;
  brand: string;
  saveCount: number;
  ramGb: number | null;
  storageGb: number | null;
  storageType: string | null;
}

const MIN_VISIBLE_PROGRESS_BAR_WIDTH_PERCENT = 12;
const MIN_RATING = 1;
const MAX_RATING = 5;
const DEFAULT_STORAGE_TYPE = 'SSD';
const DEVICE_UNAVAILABLE_LABEL = 'Device information unavailable';

const isInteractionType = (value: unknown): value is InteractionType => {
  return value === 'recommendation_view' || value === 'comparison_click';
};

const getInteractionType = (row: Record<string, unknown>): InteractionType | null => {
  const candidates = [row.event_type, row.interaction_type, row.action_type];
  for (const candidate of candidates) {
    if (isInteractionType(candidate)) {
      return candidate;
    }
  }
  return null;
};

const FacultyDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [topDevices, setTopDevices] = useState<TopDevice[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState(0);
  const [interactionCounts, setInteractionCounts] = useState<Record<InteractionType, number>>({
    recommendation_view: 0,
    comparison_click: 0
  });

  const loadFacultyDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [savedDevicesResult, feedbackResult, interactionsResult] = await Promise.all([
        supabase.from('saved_devices').select('device_id'),
        supabase.from('feedback_responses').select('rating'),
        supabase.from('interaction_logs').select('event_type, interaction_type, action_type')
      ]);

      if (savedDevicesResult.error) throw savedDevicesResult.error;
      if (feedbackResult.error) throw feedbackResult.error;
      if (interactionsResult.error) throw interactionsResult.error;

      const savedRows = (savedDevicesResult.data ?? []) as Array<{ device_id: string | null }>;
      const deviceCountMap = savedRows.reduce<Map<string, number>>((accumulator, row) => {
        if (!row.device_id) return accumulator;
        accumulator.set(row.device_id, (accumulator.get(row.device_id) ?? 0) + 1);
        return accumulator;
      }, new Map());

      const topDeviceEntries = Array.from(deviceCountMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      const topDeviceIds = topDeviceEntries.map(([deviceId]) => deviceId);

      let deviceMap = new Map<
        string,
        { name: string; brand: string; ram_gb: number | null; storage_gb: number | null; storage_type: string | null }
      >();
      if (topDeviceIds.length > 0) {
        const devicesResult = await supabase
          .from('devices')
          .select('id, name, brand, ram_gb, storage_gb, storage_type')
          .in('id', topDeviceIds);
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

      const ratings = ((feedbackResult.data ?? []) as Array<{ rating: number | null }>)
        .map(row => Number(row.rating))
        .filter(rating => Number.isFinite(rating) && rating >= MIN_RATING && rating <= MAX_RATING);
      setRatingCount(ratings.length);
      setAverageRating(
        ratings.length > 0
          ? Number((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(2))
          : null
      );

      const interactions = (interactionsResult.data ?? []) as Array<Record<string, unknown>>;
      const normalizedCounts = interactions.reduce<Record<InteractionType, number>>(
        (accumulator, row) => {
          const interactionType = getInteractionType(row);
          if (!interactionType) return accumulator;
          accumulator[interactionType] += 1;
          return accumulator;
        },
        {
          recommendation_view: 0,
          comparison_click: 0
        }
      );
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

  const topSaveCount = topDevices[0]?.saveCount ?? 0;
  const primaryInsight = useMemo(() => {
    const mostSaved = topDevices[0];
    if (mostSaved?.ramGb && mostSaved?.storageGb) {
      return `Most students prioritized ${mostSaved.ramGb}GB RAM + ${mostSaved.storageGb}GB ${mostSaved.storageType ?? DEFAULT_STORAGE_TYPE}.`;
    }
    return 'Not enough complete specification data yet to derive a dominant hardware trend.';
  }, [topDevices]);

  const methodologyCards = [
    {
      title: 'How SAW Works',
      detail: 'Simple Additive Weighting ranks devices by weighted academic criteria (budget, performance, portability, and track fit).'
    },
    {
      title: 'NICTEF Alignment',
      detail: 'Aggregate trends support course-level validation of device readiness without exposing student identities.'
    },
    {
      title: 'BSIT Spec Baseline',
      detail: '16GB RAM and SSD-first configurations are prioritized to reduce classroom troubleshooting and improve tool reliability.'
    }
  ];

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
          <section className={styles.grid}>
            <article className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Top Saved Devices</h2>
                <span className={styles.cardMeta}>Top 5</span>
              </div>
              {topDevices.length === 0 ? (
                <p className={styles.mutedText}>No saved device activity yet.</p>
              ) : (
                <ul className={styles.metricList}>
                  {topDevices.map(device => (
                    <li key={device.id} className={styles.metricItem}>
                      <div>
                        <p className={styles.metricTitle}>
                          {[device.brand, device.name].filter(Boolean).join(' ')}
                        </p>
                        <p className={styles.mutedText}>{device.saveCount} saves</p>
                      </div>
                      <div className={styles.progressWrap} aria-hidden="true">
                        <span
                          className={styles.progressBar}
                          style={{
                            width: `${Math.max(
                              MIN_VISIBLE_PROGRESS_BAR_WIDTH_PERCENT,
                              Math.round((device.saveCount / Math.max(topSaveCount, 1)) * 100)
                            )}%`
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Average System Rating</h2>
                <span className={styles.cardMeta}>Feedback</span>
              </div>
              <p className={styles.metricValue}>{averageRating ? `${averageRating}/5` : 'No data'}</p>
              <p className={styles.mutedText}>
                {ratingCount > 0
                  ? `${ratingCount} anonymized responses submitted.`
                  : 'Waiting for the first anonymized rating response.'}
              </p>
            </article>

            <article className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Interaction Snapshot</h2>
                <span className={styles.cardMeta}>Usage</span>
              </div>
              <p className={styles.mutedText}>
                Recommendation views: <strong>{interactionCounts.recommendation_view}</strong>
              </p>
              <p className={styles.mutedText}>
                Comparison clicks: <strong>{interactionCounts.comparison_click}</strong>
              </p>
            </article>

            <article className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Primary Insight</h2>
                <span className={styles.cardMeta}>Trend</span>
              </div>
              <p className={styles.mutedText}>{primaryInsight}</p>
            </article>
          </section>

          <section className={styles.methodologySection}>
            <h2 className={styles.sectionTitle}>Methodology & Alignment</h2>
            <div className={styles.grid}>
              {methodologyCards.map(card => (
                <article key={card.title} className={styles.card}>
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                  <p className={styles.mutedText}>{card.detail}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </DashboardLayout>
  );
};

export default FacultyDashboard;
