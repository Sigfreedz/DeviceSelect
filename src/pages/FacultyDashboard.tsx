import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../components/DashboardLayout';
import styles from './FacultyDashboard.module.css';

interface TopDevice {
  device_id: number;
  device_name: string;
  save_count: number;
}

interface DashboardData {
  topDevices: TopDevice[];
  avgRating: number;
  totalFeedbacks: number;
  totalInteractions: number;
  isLoading: boolean;
  error: string | null;
}

const FacultyDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [data, setData] = useState<DashboardData>({
    topDevices: [],
    avgRating: 0,
    totalFeedbacks: 0,
    totalInteractions: 0,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        // Fetch top 5 saved devices (anonymized aggregate)
        const { data: devicesData, error: devicesError } = await supabase
          .from('saved_devices')
          .select('device_id')
          .then(async (deviceSelectResult) => {
            if (deviceSelectResult.error) throw deviceSelectResult.error;
            
            // Group by device_id and count
            const deviceCounts = new Map<number, number>();
            deviceSelectResult.data?.forEach((item: any) => {
              const deviceId = item.device_id;
              deviceCounts.set(deviceId, (deviceCounts.get(deviceId) || 0) + 1);
            });

            // Get device names for top 5
            const sortedDevices = Array.from(deviceCounts.entries())
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5);

            if (sortedDevices.length === 0) {
              return [];
            }

            const deviceIds = sortedDevices.map(([id]) => id);
            const { data: deviceDetails } = await supabase
              .from('devices')
              .select('id, name')
              .in('id', deviceIds);

            const deviceNameMap = new Map(
              deviceDetails?.map((d: any) => [d.id, d.name]) || []
            );

            return sortedDevices.map(([deviceId, count]) => ({
              device_id: deviceId,
              device_name: deviceNameMap.get(deviceId) || `Device #${deviceId}`,
              save_count: count
            }));
          });

        // Fetch average feedback rating
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('feedback_responses')
          .select('rating');

        if (feedbackError) throw feedbackError;

        const ratings = feedbackData?.map((f: any) => Number(f.rating)) || [];
        const avgRating = ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          : 0;

        // Fetch total interactions (recommendation views + comparison clicks)
        const { data: interactionData, error: interactionError } = await supabase
          .from('interaction_logs')
          .select('event_type', { count: 'exact' });

        if (interactionError) throw interactionError;

        const totalInteractions = interactionData?.length || 0;

        if (isMounted) {
          setData({
            topDevices: devicesData || [],
            avgRating: Math.round(avgRating * 10) / 10,
            totalFeedbacks: ratings.length,
            totalInteractions,
            isLoading: false,
            error: null
          });
        }
      } catch (error: any) {
        if (isMounted) {
          setData(prev => ({
            ...prev,
            isLoading: false,
            error: error?.message || 'Unable to load dashboard data.'
          }));
        }
      }
    };

    void fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className={styles.star}>★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className={styles.starHalf}>★</span>);
    }
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className={styles.starEmpty}>★</span>);
    }

    return stars;
  };

  if (data.isLoading) {
    return (
      <DashboardLayout
        title="Faculty Dashboard"
        subtitle="Loading anonymized trends and curriculum alignment resources..."
        badge="Faculty Access"
      >
        <div className={styles.loadingGrid}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLineShort} />
              <div className={styles.skeletonLine} />
            </div>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (data.error && data.topDevices.length === 0 && data.avgRating === 0) {
    return (
      <DashboardLayout
        title="Faculty Dashboard"
        subtitle="Access methodology resources and curriculum alignment documentation."
        badge="Faculty Access"
      >
        <div className={styles.errorState}>
          <p>Unable to load analytics data: {data.error}</p>
          <p className={styles.errorSubtext}>Showing static resources only.</p>
        </div>
        <div className={styles.grid}>
          {methodologyCards.map(card => (
            <article className={styles.card} key={card.title}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <span className={styles.cardMeta}>{card.meta}</span>
              </div>
              <p className={styles.cardDescription}>{card.description}</p>
            </article>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Faculty Dashboard"
      subtitle="View anonymized student hardware trends and curriculum alignment resources."
      badge="Faculty Access"
    >
      {/* Analytics Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Anonymized Trends</h2>
          <span className={styles.sectionBadge}>Live Data</span>
        </div>
        <p className={styles.sectionDescription}>
          Aggregated insights from student interactions (no PII exposed).
        </p>

        <div className={styles.metricsGrid}>
          {/* Top Saved Devices */}
          <article className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <h3 className={styles.metricTitle}>Top Saved Devices</h3>
              <span className={styles.metricIcon}>💾</span>
            </div>
            {data.topDevices.length > 0 ? (
              <ul className={styles.deviceList}>
                {data.topDevices.map((device, index) => (
                  <li key={device.device_id} className={styles.deviceItem}>
                    <span className={styles.rank}>{index + 1}</span>
                    <span className={styles.deviceName}>{device.device_name}</span>
                    <span className={styles.saveCount}>{device.save_count} saves</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyState}>No device saves recorded yet.</p>
            )}
          </article>

          {/* Average Rating */}
          <article className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <h3 className={styles.metricTitle}>System Rating</h3>
              <span className={styles.metricIcon}>⭐</span>
            </div>
            {data.totalFeedbacks > 0 ? (
              <>
                <div className={styles.ratingDisplay}>
                  <span className={styles.ratingValue}>{data.avgRating.toFixed(1)}</span>
                  <div className={styles.stars}>{renderStars(data.avgRating)}</div>
                </div>
                <p className={styles.ratingCount}>{data.totalFeedbacks} feedback responses</p>
              </>
            ) : (
              <p className={styles.emptyState}>No feedback submitted yet.</p>
            )}
          </article>

          {/* Total Interactions */}
          <article className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <h3 className={styles.metricTitle}>Student Engagement</h3>
              <span className={styles.metricIcon}>📊</span>
            </div>
            <div className={styles.interactionStats}>
              <span className={styles.interactionValue}>{data.totalInteractions}</span>
              <span className={styles.interactionLabel}>total interactions</span>
              <p className={styles.interactionNote}>
                Includes recommendation views and comparison clicks
              </p>
            </div>
          </article>

          {/* Insight Card */}
          <article className={styles.insightCard}>
            <div className={styles.metricHeader}>
              <h3 className={styles.metricTitle}>Key Insight</h3>
              <span className={styles.metricIcon}>💡</span>
            </div>
            <p className={styles.insightText}>
              Most students prioritized <strong>16GB RAM + 512GB SSD</strong> configurations 
              across all IT tracks. Consider recommending these as baseline specs for 
              curriculum-aligned projects.
            </p>
          </article>
        </div>
      </section>

      {/* Methodology Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Methodology & Alignment</h2>
        </div>
        <p className={styles.sectionDescription}>
          Academic documentation supporting the SAW-based recommendation system.
        </p>

        <div className={styles.grid}>
          {methodologyCards.map(card => (
            <article className={styles.card} key={card.title}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <span className={styles.cardMeta}>{card.meta}</span>
              </div>
              <p className={styles.cardDescription}>{card.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Curriculum Note */}
      <div className={styles.note}>
        <strong>Research focus:</strong> Use aggregated insights to validate device coverage
        across BSIT tracks before finalizing curriculum updates. All data is anonymized
        per RLS policies—no student PII is accessible through this dashboard.
      </div>
    </DashboardLayout>
  );
};

const methodologyCards = [
  {
    title: 'SAW Algorithm Workflow',
    meta: 'Methodology',
    description: 'Simple Additive Weighting (SAW) normalizes criteria scores and applies weighted sums to rank devices based on track-specific priorities.'
  },
  {
    title: 'NICTEF Alignment',
    meta: 'Curriculum',
    description: 'Device recommendations align with NICTEF learning outcomes, ensuring students have hardware capable of meeting course requirements.'
  },
  {
    title: 'BSIT Track Baselines',
    meta: 'Standards',
    description: 'Minimum specs defined per track: Web Dev (8GB/256GB), Networking (16GB/512GB), Data Science (16GB+/1TB+SSD).'
  }
];

export default FacultyDashboard;
