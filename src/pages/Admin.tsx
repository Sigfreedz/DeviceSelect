import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { supabase } from '../lib/supabase';
import styles from '../styles/RoleDashboard.module.css';

interface ProfileSummary {
  role: 'student' | 'faculty' | 'admin';
  is_approved: boolean;
  it_track: 'general' | 'web_dev' | 'networking' | 'data' | null;
  created_at: string;
}

interface FeedbackSummary {
  rating: number;
  created_at: string;
}

interface InteractionSummary {
  event_type: 'recommendation_view' | 'comparison_click';
  created_at: string;
}

const trackLabels: Record<'general' | 'web_dev' | 'networking' | 'data', string> = {
  general: 'General',
  web_dev: 'Web Development',
  networking: 'Networking',
  data: 'Data'
};

const Admin: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deviceCount, setDeviceCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [feedbackResponses, setFeedbackResponses] = useState<FeedbackSummary[]>([]);
  const [interactionLogs, setInteractionLogs] = useState<InteractionSummary[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadAdminDashboard = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [
          devicesResult,
          savedDevicesResult,
          profilesResult,
          feedbackResult,
          interactionsResult
        ] = await Promise.all([
          supabase.from('devices').select('*', { count: 'exact', head: true }),
          supabase.from('saved_devices').select('*', { count: 'exact', head: true }),
          supabase
            .from('profiles')
            .select('role, is_approved, it_track, created_at')
            .order('created_at', { ascending: false }),
          supabase.from('feedback_responses').select('rating, created_at'),
          supabase.from('interaction_logs').select('event_type, created_at')
        ]);

        if (devicesResult.error) throw devicesResult.error;
        if (savedDevicesResult.error) throw savedDevicesResult.error;
        if (profilesResult.error) throw profilesResult.error;
        if (feedbackResult.error) throw feedbackResult.error;
        if (interactionsResult.error) throw interactionsResult.error;

        if (!isMounted) return;

        setDeviceCount(devicesResult.count ?? 0);
        setSavedCount(savedDevicesResult.count ?? 0);
        setProfiles((profilesResult.data ?? []) as ProfileSummary[]);
        setFeedbackResponses((feedbackResult.data ?? []) as FeedbackSummary[]);
        setInteractionLogs(
          ((interactionsResult.data ?? []) as InteractionSummary[]).filter(
            log => log.event_type === 'recommendation_view' || log.event_type === 'comparison_click'
          )
        );
      } catch (error: any) {
        if (!isMounted) return;
        setErrorMessage(error?.message ?? 'Unable to load admin dashboard analytics.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadAdminDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const approvedUsers = profiles.filter(profile => profile.is_approved).length;
    const pendingUsers = profiles.length - approvedUsers;
    const studentCount = profiles.filter(profile => profile.role === 'student').length;
    const facultyCount = profiles.filter(profile => profile.role === 'faculty').length;
    const adminCount = profiles.filter(profile => profile.role === 'admin').length;
    const averageRating =
      feedbackResponses.length > 0
        ? feedbackResponses.reduce((sum, response) => sum + response.rating, 0) / feedbackResponses.length
        : 0;
    const recommendationViews = interactionLogs.filter(
      log => log.event_type === 'recommendation_view'
    ).length;
    const comparisonClicks = interactionLogs.filter(
      log => log.event_type === 'comparison_click'
    ).length;
    const trackedActions = savedCount + feedbackResponses.length + interactionLogs.length;
    const activityTimestamps = [
      ...profiles.map(profile => profile.created_at),
      ...feedbackResponses.map(response => response.created_at),
      ...interactionLogs.map(log => log.created_at)
    ]
      .filter(Boolean)
      .map(value => new Date(value).getTime())
      .filter(value => !Number.isNaN(value));
    const latestActivity = activityTimestamps.length > 0 ? new Date(Math.max(...activityTimestamps)) : null;
    const trackCounts = profiles.reduce<Record<string, number>>((accumulator, profile) => {
      if (profile.role !== 'student' || !profile.it_track) return accumulator;
      accumulator[profile.it_track] = (accumulator[profile.it_track] ?? 0) + 1;
      return accumulator;
    }, {});
    const topTrackEntry = Object.entries(trackCounts).sort((a, b) => b[1] - a[1])[0];
    const topTrack =
      topTrackEntry && topTrackEntry[0] in trackLabels
        ? `${trackLabels[topTrackEntry[0] as keyof typeof trackLabels]} (${topTrackEntry[1]})`
        : 'No student track data';

    return {
      approvedUsers,
      pendingUsers,
      studentCount,
      facultyCount,
      adminCount,
      averageRating,
      recommendationViews,
      comparisonClicks,
      trackedActions,
      latestActivity,
      topTrack
    };
  }, [feedbackResponses, interactionLogs, profiles, savedCount]);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const cards = [
    {
      title: 'Registered Users',
      meta: 'Users',
      value: `${profiles.length}`,
      description: 'Total profiles currently visible to the admin console.'
    },
    {
      title: 'Catalog Devices',
      meta: 'Inventory',
      value: `${deviceCount}`,
      description: 'Laptop entries powering recommendation outputs.'
    },
    {
      title: 'Saved Devices',
      meta: 'Research',
      value: `${savedCount}`,
      description: 'Shortlist actions captured for recommendation effectiveness.'
    },
    {
      title: 'Feedback Responses',
      meta: 'Research',
      value: `${feedbackResponses.length}`,
      description: 'One-response-per-student satisfaction submissions.'
    },
    {
      title: 'Average Rating',
      meta: 'Effectiveness',
      value: feedbackResponses.length > 0 ? `${metrics.averageRating.toFixed(2)}/5` : 'No data',
      description: 'Overall perceived system effectiveness across submitted feedback.'
    },
    {
      title: 'Tracked Interactions',
      meta: 'Usage',
      value: `${interactionLogs.length}`,
      description: 'Recommendation views and comparison clicks captured in the platform.'
    }
  ];

  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle="Monitor DeviceLabs operations, research evidence, and platform-wide adoption from one console."
      badge="Admin Console"
    >
      {isLoading && <p className={styles.note}>Loading platform analytics...</p>}
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
              <h2 className={styles.sectionTitle}>Platform Health Snapshot</h2>
              <div className={styles.sectionActions}>
                <button
                  type="button"
                  className={styles.inlineButton}
                  onClick={() => navigate('/admin/analytics')}
                >
                  Open Analytics
                </button>
                <button
                  type="button"
                  className={styles.inlineButton}
                  onClick={() => navigate('/admin/devices')}
                >
                  Manage Devices
                </button>
                <button
                  type="button"
                  className={styles.inlineButton}
                  onClick={() => navigate('/admin/users')}
                >
                  Manage Users
                </button>
              </div>
            </div>

            <div className={styles.grid}>
              <article className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Recommendation Views</h3>
                  <span className={styles.cardMeta}>Engagement</span>
                </div>
                <p className={styles.cardValue}>{metrics.recommendationViews}</p>
                <p className={styles.cardDescription}>
                  Completed recommendation results viewed by signed-in users.
                </p>
              </article>

              <article className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Comparison Clicks</h3>
                  <span className={styles.cardMeta}>Engagement</span>
                </div>
                <p className={styles.cardValue}>{metrics.comparisonClicks}</p>
                <p className={styles.cardDescription}>
                  Device comparison selections supporting usage analysis.
                </p>
              </article>

              <article className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Tracked Actions</h3>
                  <span className={styles.cardMeta}>Evidence</span>
                </div>
                <p className={styles.cardValue}>{metrics.trackedActions}</p>
                <p className={styles.cardDescription}>
                  Combined saves, feedback, and interaction logs for research reporting.
                </p>
              </article>

              <article className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Latest Activity</h3>
                  <span className={styles.cardMeta}>Timeline</span>
                </div>
                <p className={styles.cardValue}>
                  {metrics.latestActivity ? metrics.latestActivity.toLocaleDateString() : 'No activity'}
                </p>
                <p className={styles.cardDescription}>
                  Most recent user or research event seen by the admin dashboard.
                </p>
              </article>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>User Governance Overview</h2>
            <div className={styles.savedList}>
              <article className={styles.savedItem}>
                <div>
                  <h3 className={styles.savedTitle}>Approvals</h3>
                  <p className={styles.savedMeta}>
                    {metrics.approvedUsers} approved · {metrics.pendingUsers} pending review
                  </p>
                </div>
              </article>
              <article className={styles.savedItem}>
                <div>
                  <h3 className={styles.savedTitle}>Role Distribution</h3>
                  <p className={styles.savedMeta}>
                    {metrics.studentCount} students · {metrics.facultyCount} faculty · {metrics.adminCount} admins
                  </p>
                </div>
              </article>
              <article className={styles.savedItem}>
                <div>
                  <h3 className={styles.savedTitle}>Top Student Track</h3>
                  <p className={styles.savedMeta}>{metrics.topTrack}</p>
                </div>
              </article>
            </div>
          </section>

          <div className={styles.note}>
            <strong>Operations:</strong> Use saved devices, feedback, and interaction totals as your current
            research-paper evidence for adoption and perceived effectiveness.
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Admin;
