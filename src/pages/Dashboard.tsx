import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
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
  created_at: string;
}

interface InteractionLog {
  event_type: 'recommendation_view' | 'comparison_click';
  created_at: string;
}

const MAX_SAVED_DEVICES = 3;

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [savedDevices, setSavedDevices] = useState<SavedDevice[]>([]);
  const [interactionLogs, setInteractionLogs] = useState<InteractionLog[]>([]);
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

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
            device_name: details?.name ?? 'Device details unavailable',
            brand: details?.brand ?? 'Unknown Brand',
            price_php: details?.price_php ?? null
          };
        });

        const { data: feedbackData, error: feedbackError } = await supabase
          .from('feedback_responses')
          .select('id, rating, comment, created_at')
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
        setRating(normalizedFeedback?.rating ?? 0);
        setComment(normalizedFeedback?.comment ?? '');
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
      feedbackRating: feedback?.rating ?? null,
      latestActivity
    };
  }, [feedback, interactionLogs, savedDevices]);

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

  const handleSubmitFeedback = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.id) return;

    if (rating < 1 || rating > 5) {
      setFeedbackMessage('Please choose a rating from 1 to 5 before submitting.');
      return;
    }

    setIsSubmitting(true);
    setFeedbackMessage(null);

    try {
      if (feedback?.id) {
        const { data, error } = await supabase
          .from('feedback_responses')
          .update({ rating, comment: comment.trim() })
          .eq('id', feedback.id)
          .eq('user_id', user.id)
          .select('id, rating, comment, created_at')
          .single();

        if (error) throw error;

        const updatedFeedback: FeedbackResponse = {
          id: String(data.id),
          rating: Number(data.rating),
          comment: String(data.comment ?? ''),
          created_at: String(data.created_at ?? '')
        };

        setFeedback(updatedFeedback);
        setRating(updatedFeedback.rating);
        setComment(updatedFeedback.comment);
        setFeedbackMessage('Feedback updated. Thank you for improving the study dataset.');
        return;
      }

      const { data, error } = await supabase
        .from('feedback_responses')
        .insert({
          user_id: user.id,
          rating,
          comment: comment.trim()
        })
        .select('id, rating, comment, created_at')
        .single();

      if (error) throw error;

      const createdFeedback: FeedbackResponse = {
        id: String(data.id),
        rating: Number(data.rating),
        comment: String(data.comment ?? ''),
        created_at: String(data.created_at ?? '')
      };

      setFeedback(createdFeedback);
      setFeedbackMessage('Feedback submitted. Your response is now part of the research evidence.');
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
      title: 'Feedback Rating',
      meta: 'Research',
      description: feedback ? 'Your latest system effectiveness rating.' : 'Submit your first rating.',
      value: stats.feedbackRating ? `${stats.feedbackRating}/5` : 'Pending'
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
          <h3 className={styles.savedTitle}>{device.brand} {device.device_name}</h3>
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
                You have not saved a device yet. Generate a recommendation and save up to {MAX_SAVED_DEVICES} devices.
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
            <h2 className={styles.sectionTitle}>Rate DeviceLabs Effectiveness</h2>
            <p className={styles.sectionDescription}>
              One response per student. Submitting again updates your existing response.
            </p>
            <form className={styles.feedbackForm} onSubmit={handleSubmitFeedback}>
              <label className={styles.fieldLabel} htmlFor="feedback-rating">Rating (1 to 5)</label>
              <select
                id="feedback-rating"
                className={styles.fieldInput}
                value={rating}
                onChange={event => setRating(Number(event.target.value))}
                required
              >
                <option value={0}>Select a rating</option>
                <option value={1}>1 - Very Poor</option>
                <option value={2}>2 - Poor</option>
                <option value={3}>3 - Fair</option>
                <option value={4}>4 - Good</option>
                <option value={5}>5 - Excellent</option>
              </select>

              <label className={styles.fieldLabel} htmlFor="feedback-comment">
                Comment (optional)
              </label>
              <textarea
                id="feedback-comment"
                className={styles.fieldInput}
                value={comment}
                onChange={event => setComment(event.target.value)}
                rows={4}
                placeholder="Share what helped or what should improve."
              />

              <div className={styles.sectionActions}>
                <button type="submit" className={styles.inlineButton} disabled={isSubmitting}>
                  {feedback ? 'Update Feedback' : 'Submit Feedback'}
                </button>
              </div>
            </form>
            {feedbackMessage && <p className={styles.note}>{feedbackMessage}</p>}
          </section>
        </>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
