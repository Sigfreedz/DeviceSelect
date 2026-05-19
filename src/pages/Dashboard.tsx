import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import {
  BarListChart,
  ProgressRing,
  StackedShareChart,
  TrendSparkBars
} from '../components/dashboard/DashboardCharts';
import FeedbackSurvey, { SurveyValues } from '../components/FeedbackSurvey';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { fetchInteractionEvents } from '../utils/interactionTracking';
import styles from '../styles/RoleDashboard.module.css';

interface SavedDevice {
  id: string;
  device_id: string;
  created_at: string;
  device_name: string;
  brand: string;
  price_php: number | null;
}

interface FeedbackResponse {
  id: string;
  rating: number;
  comment: string;
  found_useful: boolean | null;
  most_useful_feature: 'recommendation' | 'compare' | 'lessons' | 'saved_devices' | null;
  recommendation_accuracy: number | null;
  likelihood_to_recommend: number | null;
  plan_to_purchase: 'yes' | 'no' | 'maybe' | null;
  created_at: string;
}

interface InteractionLog {
  event_type: 'recommendation_view' | 'comparison_click';
  created_at: string;
}

const MAX_SAVED_DEVICES = 3;
const yearLevelOptions = ['1st', '2nd', '3rd', '4th', 'graduate'] as const;
type YearLevel = (typeof yearLevelOptions)[number];

const Dashboard: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [yearLevel, setYearLevel] = useState<YearLevel | ''>('');
  const [isSavingYearLevel, setIsSavingYearLevel] = useState(false);
  const [yearLevelMessage, setYearLevelMessage] = useState<string | null>(null);
  const [yearLevelError, setYearLevelError] = useState<string | null>(null);
  const [savedDevices, setSavedDevices] = useState<SavedDevice[]>([]);
  const [interactionLogs, setInteractionLogs] = useState<InteractionLog[]>([]);
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);

  useEffect(() => {
    const nextYearLevel = profile?.year_level && yearLevelOptions.includes(profile.year_level) ? profile.year_level : '';
    setYearLevel(nextYearLevel);
  }, [profile?.year_level]);

  useEffect(() => {
    let isMounted = true;

    const loadStudentDashboard = async () => {
      if (!user?.id) {
        if (isMounted) {
          setSavedDevices([]);
          setInteractionLogs([]);
          setFeedback(null);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const { data: savedRows, error: savedError } = await supabase
          .from('saved_devices')
          .select('id, device_id, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (savedError) throw savedError;

        const savedDeviceIds = (savedRows ?? []).map(row => row.device_id).filter(Boolean);
        let deviceMap = new Map<string, { name: string; brand: string; price_php: number | null }>();

        if (savedDeviceIds.length > 0) {
          const { data: devicesData, error: devicesError } = await supabase
            .from('devices')
            .select('id, name, brand, price_php')
            .in('id', savedDeviceIds);

          if (devicesError) throw devicesError;

          deviceMap = new Map(
            (devicesData ?? []).map(device => [
              String(device.id),
              {
                name: String(device.name ?? 'Unknown Device'),
                brand: String(device.brand ?? 'Unknown Brand'),
                price_php: typeof device.price_php === 'number' ? device.price_php : null
              }
            ])
          );
        }

        const normalizedSavedDevices: SavedDevice[] = (savedRows ?? []).map(row => {
          const details = deviceMap.get(String(row.device_id));
          return {
            id: String(row.id),
            device_id: String(row.device_id),
            created_at: String(row.created_at ?? ''),
            device_name: details?.name ?? 'Device information not found',
            brand: details?.brand ?? 'Unknown Brand',
            price_php: details?.price_php ?? null
          };
        });

        const { data: feedbackData, error: feedbackError } = await supabase
          .from('feedback_responses')
          .select(
            'id, rating, comment, found_useful, most_useful_feature, recommendation_accuracy, likelihood_to_recommend, plan_to_purchase, created_at'
          )
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (feedbackError) throw feedbackError;

        const normalizedFeedback = feedbackData
          ? {
              id: String(feedbackData.id),
              rating: Number(feedbackData.rating),
              comment: String(feedbackData.comment ?? ''),
              found_useful: typeof feedbackData.found_useful === 'boolean' ? feedbackData.found_useful : null,
              most_useful_feature:
                feedbackData.most_useful_feature === 'recommendation' ||
                feedbackData.most_useful_feature === 'compare' ||
                feedbackData.most_useful_feature === 'lessons' ||
                feedbackData.most_useful_feature === 'saved_devices'
                  ? feedbackData.most_useful_feature
                  : null,
              recommendation_accuracy:
                typeof feedbackData.recommendation_accuracy === 'number'
                  ? feedbackData.recommendation_accuracy
                  : null,
              likelihood_to_recommend:
                typeof feedbackData.likelihood_to_recommend === 'number'
                  ? feedbackData.likelihood_to_recommend
                  : null,
              plan_to_purchase:
                feedbackData.plan_to_purchase === 'yes' ||
                feedbackData.plan_to_purchase === 'no' ||
                feedbackData.plan_to_purchase === 'maybe'
                  ? feedbackData.plan_to_purchase
                  : null,
              created_at: String(feedbackData.created_at ?? '')
            }
          : null;

        const normalizedInteractions: InteractionLog[] = (await fetchInteractionEvents(user.id)).map(row => ({
          event_type: row.event_type,
          created_at: row.created_at
        }));

        if (!isMounted) return;

        setSavedDevices(normalizedSavedDevices);
        setFeedback(normalizedFeedback);
        setInteractionLogs(normalizedInteractions);
      } catch (error: any) {
        if (!isMounted) return;
        setErrorMessage(error?.message ?? 'Unable to load dashboard analytics.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadStudentDashboard();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const stats = useMemo(() => {
    const recommendationViews = interactionLogs.filter(
      log => log.event_type === 'recommendation_view'
    ).length;
    const comparisonClicks = interactionLogs.filter(
      log => log.event_type === 'comparison_click'
    ).length;
    const trackedActions = recommendationViews + comparisonClicks + savedDevices.length + (feedback ? 1 : 0);
    const activityDates = [
      ...savedDevices.map(device => device.created_at),
      ...interactionLogs.map(log => log.created_at),
      ...(feedback ? [feedback.created_at] : [])
    ]
      .filter(Boolean)
      .map(value => new Date(value).getTime())
      .filter(value => !Number.isNaN(value));
    const latestActivity = activityDates.length > 0 ? new Date(Math.max(...activityDates)) : null;

    return {
      savedCount: savedDevices.length,
      recommendationViews,
      comparisonClicks,
      trackedActions,
      latestActivity
    };
  }, [feedback, interactionLogs, savedDevices]);

  const activityTrend = useMemo(() => {
    const dailyLabels = Array.from({ length: 7 }).map((_, index) => {
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - (6 - index));
      return {
        key: day.toISOString().slice(0, 10),
        label: day.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
      };
    });

    const allEventDates = [
      ...savedDevices.map(device => device.created_at),
      ...interactionLogs.map(log => log.created_at),
      ...(feedback?.created_at ? [feedback.created_at] : [])
    ];

    const counts = allEventDates.reduce<Record<string, number>>((accumulator, dateString) => {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return accumulator;
      const key = date.toISOString().slice(0, 10);
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    }, {});

    return dailyLabels.map(day => ({
      label: day.label,
      value: counts[day.key] ?? 0
    }));
  }, [feedback?.created_at, interactionLogs, savedDevices]);

  const yearLevelUnchanged = (profile?.year_level ?? '') === (yearLevel || '');

  const handleYearLevelSave = async () => {
    setYearLevelMessage(null);
    setYearLevelError(null);
    setIsSavingYearLevel(true);
    const { error } = await updateProfile({
      year_level: (yearLevel || null) as '1st' | '2nd' | '3rd' | '4th' | 'graduate' | null
    });
    setIsSavingYearLevel(false);

    if (error) {
      setYearLevelError(error);
      return;
    }
    setYearLevelMessage('Year level updated.');
  };

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleRemoveSavedDevice = async (savedId: string) => {
    if (!user?.id) return;

    const { error } = await supabase
      .from('saved_devices')
      .delete()
      .eq('id', savedId)
      .eq('user_id', user.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSavedDevices(previous => previous.filter(device => device.id !== savedId));
  };

  const handleSubmitFeedback = async (values: SurveyValues) => {
    if (!user?.id) return;

    if (values.rating < 1 || values.rating > 5) {
      setFeedbackMessage('Please choose a rating from 1 to 5 before submitting.');
      return;
    }

    setIsSubmitting(true);
    setFeedbackMessage(null);

    try {
      if (feedback?.id) {
        const { data, error } = await supabase
          .from('feedback_responses')
          .update({
            rating: values.rating,
            comment: values.comment.trim(),
            found_useful: values.found_useful,
            most_useful_feature: values.most_useful_feature,
            recommendation_accuracy: values.recommendation_accuracy,
            likelihood_to_recommend: values.likelihood_to_recommend,
            plan_to_purchase: values.plan_to_purchase
          })
          .eq('id', feedback.id)
          .eq('user_id', user.id)
          .select(
            'id, rating, comment, found_useful, most_useful_feature, recommendation_accuracy, likelihood_to_recommend, plan_to_purchase, created_at'
          )
          .single();

        if (error) throw error;

        const updatedFeedback: FeedbackResponse = {
          id: String(data.id),
          rating: Number(data.rating),
          comment: String(data.comment ?? ''),
          found_useful: typeof data.found_useful === 'boolean' ? data.found_useful : null,
          most_useful_feature:
            data.most_useful_feature === 'recommendation' ||
            data.most_useful_feature === 'compare' ||
            data.most_useful_feature === 'lessons' ||
            data.most_useful_feature === 'saved_devices'
              ? data.most_useful_feature
              : null,
          recommendation_accuracy:
            typeof data.recommendation_accuracy === 'number' ? data.recommendation_accuracy : null,
          likelihood_to_recommend:
            typeof data.likelihood_to_recommend === 'number' ? data.likelihood_to_recommend : null,
          plan_to_purchase:
            data.plan_to_purchase === 'yes' || data.plan_to_purchase === 'no' || data.plan_to_purchase === 'maybe'
              ? data.plan_to_purchase
              : null,
          created_at: String(data.created_at ?? '')
        };

        setFeedback(updatedFeedback);
        setFeedbackMessage('Survey updated. Thank you for improving the study dataset.');
        return;
      }

      const { data, error } = await supabase
        .from('feedback_responses')
        .insert({
          user_id: user.id,
          rating: values.rating,
          comment: values.comment.trim(),
          found_useful: values.found_useful,
          most_useful_feature: values.most_useful_feature,
          recommendation_accuracy: values.recommendation_accuracy,
          likelihood_to_recommend: values.likelihood_to_recommend,
          plan_to_purchase: values.plan_to_purchase
        })
        .select(
          'id, rating, comment, found_useful, most_useful_feature, recommendation_accuracy, likelihood_to_recommend, plan_to_purchase, created_at'
        )
        .single();

      if (error) throw error;

      const createdFeedback: FeedbackResponse = {
        id: String(data.id),
        rating: Number(data.rating),
        comment: String(data.comment ?? ''),
        found_useful: typeof data.found_useful === 'boolean' ? data.found_useful : null,
        most_useful_feature:
          data.most_useful_feature === 'recommendation' ||
          data.most_useful_feature === 'compare' ||
          data.most_useful_feature === 'lessons' ||
          data.most_useful_feature === 'saved_devices'
            ? data.most_useful_feature
            : null,
        recommendation_accuracy:
          typeof data.recommendation_accuracy === 'number' ? data.recommendation_accuracy : null,
        likelihood_to_recommend:
          typeof data.likelihood_to_recommend === 'number' ? data.likelihood_to_recommend : null,
        plan_to_purchase:
          data.plan_to_purchase === 'yes' || data.plan_to_purchase === 'no' || data.plan_to_purchase === 'maybe'
            ? data.plan_to_purchase
            : null,
        created_at: String(data.created_at ?? '')
      };

      setFeedback(createdFeedback);
      setFeedbackMessage('Survey submitted. Your response is now part of the research evidence.');
    } catch (error: any) {
      setFeedbackMessage(error?.message ?? 'Unable to submit feedback right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cards = [
    {
      title: 'Saved Devices',
      meta: 'Required',
      description: `${stats.savedCount}/${MAX_SAVED_DEVICES} devices saved`,
      value: `${stats.savedCount}`
    },
    {
      title: 'Recommendation Views',
      meta: 'Analytics',
      description: 'How often you completed recommendation runs.',
      value: `${stats.recommendationViews}`
    },
    {
      title: 'Comparison Clicks',
      meta: 'Analytics',
      description: 'How often you clicked devices in compare mode.',
      value: `${stats.comparisonClicks}`
    },
    {
      title: 'Survey Status',
      meta: 'Research',
      description: feedback ? 'Your latest multi-question survey response.' : 'Submit your first response.',
      value: feedback ? 'Submitted' : 'Pending'
    }
  ];

  const renderSavedDevice = (device: SavedDevice) => {
    const priceLabel = device.price_php
      ? `₱${device.price_php.toLocaleString('en-PH')}`
      : 'Price unavailable';
    const savedDateLabel = device.created_at
      ? new Date(device.created_at).toLocaleDateString()
      : 'Unknown date';

    return (
      <article key={device.id} className={styles.savedItem}>
        <div>
          <h3 className={styles.savedTitle}>{`${device.brand} ${device.device_name}`.trim()}</h3>
          <p className={styles.savedMeta}>{priceLabel} · Saved on {savedDateLabel}</p>
        </div>
        <button
          type="button"
          className={styles.removeButton}
          onClick={() => {
            handleRemoveSavedDevice(device.id);
          }}
        >
          Remove
        </button>
      </article>
    );
  };

  return (
    <DashboardLayout
      title="Student Dashboard"
      subtitle="Track your shortlist, usage analytics, and feedback indicators supporting the research paper."
      badge="Student Portal"
    >
      {isLoading && <p className={styles.note}>Loading your dashboard analytics...</p>}
      {!isLoading && errorMessage && <p className={styles.note}>{errorMessage}</p>}
      <div className={styles.grid}>
        {cards.map(card => (
          <article className={styles.card} key={card.title}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <span className={styles.cardMeta}>{card.meta}</span>
            </div>
            <p className={styles.cardValue}>{card.value}</p>
            <p className={styles.cardDescription}>{card.description}</p>
          </article>
        ))}
      </div>

      {!isLoading && (
        <>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Profile Settings</h2>
            </div>
            <div className={styles.profileSettingsRow}>
              <label className={styles.profileFieldLabel} htmlFor="year-level-select">
                Year Level
              </label>
              <select
                id="year-level-select"
                className={styles.profileFieldSelect}
                value={yearLevel}
                onChange={event => {
                  setYearLevel(event.target.value as YearLevel | '');
                  setYearLevelMessage(null);
                  setYearLevelError(null);
                }}
              >
                <option value="">Not set</option>
                {yearLevelOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <p className={styles.savedMeta}>
                Current profile value: <strong>{profile?.year_level ?? 'Not set'}</strong>
              </p>
              <button
                type="button"
                className={styles.inlineButton}
                onClick={() => { void handleYearLevelSave(); }}
                disabled={isSavingYearLevel || yearLevelUnchanged}
              >
                {isSavingYearLevel ? 'Saving...' : 'Save Year Level'}
              </button>
              {yearLevelMessage && <p className={styles.noteCompact}>{yearLevelMessage}</p>}
              {yearLevelError && <p className={styles.noteCompact}>{yearLevelError}</p>}
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Activity Visualization</h2>
            <div className={styles.analyticsGrid}>
              <article className={styles.card}>
                <StackedShareChart
                  title="Activity Mix"
                  meta={`${stats.trackedActions} tracked actions`}
                  points={[
                    { label: 'Recommendation Views', value: stats.recommendationViews, color: '#8b5cf6' },
                    { label: 'Comparison Clicks', value: stats.comparisonClicks, color: '#a855f7' },
                    { label: 'Saved Devices', value: stats.savedCount, color: '#22c55e' }
                  ]}
                />
              </article>
              <article className={styles.card}>
                <ProgressRing
                  title="Saved Device Progress"
                  subtitle="Student shortlist completion"
                  current={stats.savedCount}
                  total={MAX_SAVED_DEVICES}
                />
              </article>
              <article className={styles.card}>
                <TrendSparkBars
                  title="Recent Activity (7 days)"
                  points={activityTrend}
                />
              </article>
              <article className={styles.card}>
                <BarListChart
                  title="Survey Snapshot"
                  points={[
                    { label: 'Submitted', value: feedback ? 1 : 0, color: '#22c55e' },
                    { label: 'Pending', value: feedback ? 0 : 1, color: '#f59e0b' },
                    {
                      label: 'Rating',
                      value: feedback?.rating ?? 0,
                      color: '#06b6d4'
                    }
                  ]}
                  maxValue={5}
                />
              </article>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Saved Devices (max {MAX_SAVED_DEVICES})</h2>
              <div className={styles.sectionActions}>
                <button type="button" className={styles.inlineButton} onClick={() => navigate('/recommend')}>
                  Get Recommendation
                </button>
                <button type="button" className={styles.inlineButton} onClick={() => navigate('/compare')}>
                  Compare Devices
                </button>
              </div>
            </div>
            {savedDevices.length === 0 ? (
              <p className={styles.sectionEmpty}>
                No devices saved yet. Save up to {MAX_SAVED_DEVICES} from your recommendations.
              </p>
            ) : (
              <div className={styles.savedList}>
                {savedDevices.map(renderSavedDevice)}
              </div>
            )}
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Research Effectiveness Snapshot</h2>
            <div className={styles.grid}>
              <article className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Total Tracked Actions</h3>
                  <span className={styles.cardMeta}>Engagement</span>
                </div>
                <p className={styles.cardValue}>{stats.trackedActions}</p>
                <p className={styles.cardDescription}>
                  Combined saved devices, interaction logs, and feedback submission.
                </p>
              </article>
              <article className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Latest Activity</h3>
                  <span className={styles.cardMeta}>Timeline</span>
                </div>
                <p className={styles.cardValue}>
                  {stats.latestActivity ? stats.latestActivity.toLocaleDateString() : 'No activity yet'}
                </p>
                <p className={styles.cardDescription}>
                  Helps evaluate recency and continuity of student interaction.
                </p>
              </article>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>DeviceSelect Usefulness Survey</h2>
            <p className={styles.sectionDescription}>
              One response per student. Submitting again updates your existing response.
            </p>
            <FeedbackSurvey
              initialValues={{
                rating: feedback?.rating ?? 0,
                found_useful: feedback?.found_useful ?? null,
                most_useful_feature: feedback?.most_useful_feature ?? null,
                recommendation_accuracy: feedback?.recommendation_accuracy ?? null,
                likelihood_to_recommend: feedback?.likelihood_to_recommend ?? null,
                plan_to_purchase: feedback?.plan_to_purchase ?? null,
                comment: feedback?.comment ?? ''
              }}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmitFeedback}
            />
            {feedbackMessage && <p className={styles.note}>{feedbackMessage}</p>}
          </section>
        </>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
