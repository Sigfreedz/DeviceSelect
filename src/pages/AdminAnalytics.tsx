import React, { useEffect, useMemo, useState } from 'react';
import {
  BarListChart,
  ProgressRing,
  StackedShareChart
} from '../components/dashboard/DashboardCharts';
import DashboardLayout from '../components/DashboardLayout';
import { supabase } from '../lib/supabase';
import { fetchInteractionEvents } from '../utils/interactionTracking';
import styles from '../styles/RoleDashboard.module.css';

type MostUsefulFeature = 'recommendation' | 'compare' | 'lessons' | 'saved_devices';
type PurchaseIntent = 'yes' | 'no' | 'maybe';

interface FeedbackAnalyticsRow {
  id: string;
  rating: number | null;
  comment: string;
  found_useful: boolean | null;
  most_useful_feature: MostUsefulFeature | null;
  recommendation_accuracy: number | null;
  likelihood_to_recommend: number | null;
  plan_to_purchase: PurchaseIntent | null;
  created_at: string | null;
}

type CommentVisibilityFilter = 'all' | 'with_comment' | 'without_comment';
type CommentSortOrder = 'latest' | 'oldest';

const COMMENTS_BATCH_SIZE = 10;

const toMostUsefulFeature = (value: unknown): MostUsefulFeature | null => {
  if (value === 'recommendation' || value === 'compare' || value === 'lessons' || value === 'saved_devices') {
    return value;
  }
  return null;
};

const toPurchaseIntent = (value: unknown): PurchaseIntent | null => {
  if (value === 'yes' || value === 'no' || value === 'maybe') {
    return value;
  }
  return null;
};

const featureLabelMap: Record<MostUsefulFeature, string> = {
  recommendation: 'Recommendations',
  compare: 'Compare Devices',
  lessons: 'Lessons',
  saved_devices: 'Saved Devices'
};

const purchaseIntentLabelMap: Record<PurchaseIntent, string> = {
  yes: 'Yes',
  no: 'No',
  maybe: 'Maybe'
};

const AdminAnalytics: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackRows, setFeedbackRows] = useState<FeedbackAnalyticsRow[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [recommendationViews, setRecommendationViews] = useState(0);
  const [commentVisibility, setCommentVisibility] = useState<CommentVisibilityFilter>('all');
  const [minimumRating, setMinimumRating] = useState<number | null>(null);
  const [commentSortOrder, setCommentSortOrder] = useState<CommentSortOrder>('latest');
  const [commentSearch, setCommentSearch] = useState('');
  const [visibleCommentCount, setVisibleCommentCount] = useState(COMMENTS_BATCH_SIZE);

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [feedbackResult, savedResult, interactionRows] = await Promise.all([
          supabase
            .from('feedback_responses')
            .select(
              'id, rating, comment, found_useful, most_useful_feature, recommendation_accuracy, likelihood_to_recommend, plan_to_purchase, created_at'
            )
            .order('created_at', { ascending: false }),
          supabase.from('saved_devices').select('*', { count: 'exact', head: true }),
          fetchInteractionEvents()
        ]);

        if (feedbackResult.error) throw feedbackResult.error;
        if (savedResult.error) throw savedResult.error;
        if (!isMounted) return;

        const normalizedRows = ((feedbackResult.data ?? []) as Array<Record<string, unknown>>).map(row => ({
          id: String(row.id ?? ''),
          rating: typeof row.rating === 'number' ? row.rating : null,
          comment: typeof row.comment === 'string' ? row.comment.trim() : '',
          found_useful: typeof row.found_useful === 'boolean' ? row.found_useful : null,
          most_useful_feature: toMostUsefulFeature(row.most_useful_feature),
          recommendation_accuracy:
            typeof row.recommendation_accuracy === 'number' ? row.recommendation_accuracy : null,
          likelihood_to_recommend:
            typeof row.likelihood_to_recommend === 'number' ? row.likelihood_to_recommend : null,
          plan_to_purchase: toPurchaseIntent(row.plan_to_purchase),
          created_at: typeof row.created_at === 'string' ? row.created_at : null
        }));

        const recommendationViewCount = interactionRows.filter(
          row => row.event_type === 'recommendation_view'
        ).length;

        setFeedbackRows(normalizedRows);
        setSavedCount(savedResult.count ?? 0);
        setRecommendationViews(recommendationViewCount);
      } catch (error: any) {
        if (!isMounted) return;
        setErrorMessage(error?.message ?? 'Unable to load admin analytics data.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const ratings = feedbackRows
      .map(row => row.rating)
      .filter((value): value is number => typeof value === 'number' && value >= 1 && value <= 5);
    const recommendationAccuracyScores = feedbackRows
      .map(row => row.recommendation_accuracy)
      .filter((value): value is number => typeof value === 'number' && value >= 1 && value <= 5);
    const likelihoodScores = feedbackRows
      .map(row => row.likelihood_to_recommend)
      .filter((value): value is number => typeof value === 'number' && value >= 1 && value <= 5);
    const foundUsefulCount = feedbackRows.filter(row => row.found_useful === true).length;

    const featureCounts = feedbackRows.reduce<Record<MostUsefulFeature, number>>(
      (accumulator, row) => {
        if (!row.most_useful_feature) return accumulator;
        accumulator[row.most_useful_feature] += 1;
        return accumulator;
      },
      {
        recommendation: 0,
        compare: 0,
        lessons: 0,
        saved_devices: 0
      }
    );

    const purchaseIntentCounts = feedbackRows.reduce<Record<PurchaseIntent, number>>(
      (accumulator, row) => {
        if (!row.plan_to_purchase) return accumulator;
        accumulator[row.plan_to_purchase] += 1;
        return accumulator;
      },
      {
        yes: 0,
        no: 0,
        maybe: 0
      }
    );

    const safeAverage = (values: number[]) =>
      values.length > 0 ? Number((values.reduce((sum, current) => sum + current, 0) / values.length).toFixed(2)) : 0;

    return {
      responseCount: feedbackRows.length,
      averageRating: safeAverage(ratings),
      averageRecommendationAccuracy: safeAverage(recommendationAccuracyScores),
      averageLikelihood: safeAverage(likelihoodScores),
      usefulPercent:
        feedbackRows.length > 0 ? Number(((foundUsefulCount / feedbackRows.length) * 100).toFixed(1)) : 0,
      featureCounts,
      purchaseIntentCounts
    };
  }, [feedbackRows]);

  useEffect(() => {
    setVisibleCommentCount(COMMENTS_BATCH_SIZE);
  }, [commentVisibility, minimumRating, commentSearch, commentSortOrder, feedbackRows]);

  const filteredCommentRows = useMemo(() => {
    const normalizedSearch = commentSearch.trim().toLowerCase();
    const rows = feedbackRows
      .filter(row => {
        const hasComment = Boolean(row.comment);
        if (commentVisibility === 'with_comment') return hasComment;
        if (commentVisibility === 'without_comment') return !hasComment;
        return true;
      })
      .filter(row => (minimumRating ? row.rating !== null && row.rating >= minimumRating : true))
      .filter(row => {
        if (!normalizedSearch) return true;
        return row.comment.toLowerCase().includes(normalizedSearch);
      });

    return rows.sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return commentSortOrder === 'latest' ? bTime - aTime : aTime - bTime;
    });
  }, [commentSearch, commentSortOrder, commentVisibility, feedbackRows, minimumRating]);

  const visibleCommentRows = filteredCommentRows.slice(0, visibleCommentCount);
  const hasMoreComments = filteredCommentRows.length > visibleCommentCount;

  const metricCards = [
    {
      title: 'Survey Responses',
      meta: 'Feedback',
      value: `${metrics.responseCount}`,
      description: 'Total submitted usefulness survey responses.'
    },
    {
      title: 'Average Rating',
      meta: 'Quality',
      value: metrics.responseCount > 0 ? `${metrics.averageRating}/5` : 'No data',
      description: 'Overall student rating across submitted surveys.'
    },
    {
      title: 'Avg Recommendation Accuracy',
      meta: 'Quality',
      value: metrics.responseCount > 0 ? `${metrics.averageRecommendationAccuracy}/5` : 'No data',
      description: 'Perceived recommendation fit for user needs.'
    },
    {
      title: 'Avg Likelihood to Recommend',
      meta: 'Advocacy',
      value: metrics.responseCount > 0 ? `${metrics.averageLikelihood}/5` : 'No data',
      description: 'How likely users are to recommend this app.'
    },
    {
      title: 'Found Useful',
      meta: 'Outcome',
      value: metrics.responseCount > 0 ? `${metrics.usefulPercent}%` : 'No data',
      description: 'Share of respondents who said the app helped them choose a device.'
    }
  ];

  const maxFeatureCount = Math.max(...Object.values(metrics.featureCounts), 0);
  const featureChartPoints = (Object.keys(featureLabelMap) as MostUsefulFeature[]).map(feature => ({
    label: featureLabelMap[feature],
    value: metrics.featureCounts[feature],
    color: '#8b5cf6'
  }));
  const purchaseIntentChartPoints = (Object.keys(purchaseIntentLabelMap) as PurchaseIntent[]).map(intent => ({
    label: purchaseIntentLabelMap[intent],
    value: metrics.purchaseIntentCounts[intent],
    color: intent === 'yes' ? '#22c55e' : intent === 'maybe' ? '#f59e0b' : '#ef4444'
  }));
  return (
    <DashboardLayout
      title="Analytics & Research"
      subtitle="View survey feedback trends and recommendation funnel metrics for admin research reporting."
      badge="Admin Analytics"
    >
      {isLoading && <p className={styles.note}>Loading analytics...</p>}
      {!isLoading && errorMessage && <p className={styles.note}>{errorMessage}</p>}

      {!isLoading && !errorMessage && (
        <>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Visual Overview</h2>
            <div className={styles.analyticsGrid}>
              <article className={styles.card}>
                <StackedShareChart title="Most Useful Feature Share" points={featureChartPoints} />
              </article>
              <article className={styles.card}>
                <BarListChart title="Purchase Intent Distribution" points={purchaseIntentChartPoints} />
              </article>
              <article className={styles.card}>
                <ProgressRing
                  title="Usefulness Rate"
                  current={Math.round(metrics.usefulPercent)}
                  total={100}
                  subtitle={`${metrics.usefulPercent}% marked as useful`}
                />
              </article>
            </div>
          </section>

          <div className={styles.grid}>
            {metricCards.map(card => (
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

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Recommendation Funnel</h2>
            <div className={styles.grid}>
              <article className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Recommendation Views</h3>
                  <span className={styles.cardMeta}>Top Funnel</span>
                </div>
                <p className={styles.cardValue}>{recommendationViews}</p>
                <p className={styles.cardDescription}>Completed recommendation results viewed by users.</p>
              </article>
              <article className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Saved Devices</h3>
                  <span className={styles.cardMeta}>Action</span>
                </div>
                <p className={styles.cardValue}>{savedCount}</p>
                <p className={styles.cardDescription}>Devices shortlisted after recommendations.</p>
              </article>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Most Useful Feature</h2>
            <BarListChart title="Feature Votes" points={featureChartPoints} maxValue={Math.max(1, maxFeatureCount)} />
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Purchase Intent</h2>
            <StackedShareChart title="Intent Split" points={purchaseIntentChartPoints} />
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Feedback Comments</h2>
            <p className={styles.sectionDescription}>
              Review full-text student feedback with optional filters for faster moderation and analysis.
            </p>

            <div className={styles.commentFilters}>
              <label className={styles.profileFieldLabel}>
                Visibility
                <select
                  className={styles.profileFieldSelect}
                  value={commentVisibility}
                  onChange={event => setCommentVisibility(event.target.value as CommentVisibilityFilter)}
                >
                  <option value="all">All responses</option>
                  <option value="with_comment">With comments only</option>
                  <option value="without_comment">No comment only</option>
                </select>
              </label>

              <label className={styles.profileFieldLabel}>
                Minimum rating
                <select
                  className={styles.profileFieldSelect}
                  value={minimumRating ?? 'all'}
                  onChange={event => {
                    const next = event.target.value;
                    setMinimumRating(next === 'all' ? null : Number(next));
                  }}
                >
                  <option value="all">All ratings</option>
                  <option value="5">5 and up</option>
                  <option value="4">4 and up</option>
                  <option value="3">3 and up</option>
                  <option value="2">2 and up</option>
                  <option value="1">1 and up</option>
                </select>
              </label>

              <label className={styles.profileFieldLabel}>
                Sort
                <select
                  className={styles.profileFieldSelect}
                  value={commentSortOrder}
                  onChange={event => setCommentSortOrder(event.target.value as CommentSortOrder)}
                >
                  <option value="latest">Latest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </label>

              <label className={styles.profileFieldLabel}>
                Search comment
                <input
                  className={styles.fieldInput}
                  value={commentSearch}
                  onChange={event => setCommentSearch(event.target.value)}
                  placeholder="Search text in comments"
                />
              </label>
            </div>

            {filteredCommentRows.length === 0 ? (
              <p className={styles.commentEmptyState}>No feedback comments match the current filters.</p>
            ) : (
              <>
                <div className={styles.commentList}>
                  {visibleCommentRows.map((row, index) => (
                    <article className={styles.commentItem} key={row.id || `comment-row-${index}`}>
                      <div className={styles.commentHeader}>
                        <span className={styles.commentMeta}>
                          {row.created_at ? new Date(row.created_at).toLocaleDateString() : 'Unknown date'}
                        </span>
                        <span className={styles.commentMeta}>{row.rating ? `${row.rating}/5` : 'Rating N/A'}</span>
                      </div>
                      <p className={styles.commentText}>{row.comment || 'No comment provided.'}</p>
                      <p className={styles.commentMeta}>
                        Useful: {row.found_useful === null ? 'N/A' : row.found_useful ? 'Yes' : 'No'} · Feature:{' '}
                        {row.most_useful_feature ? featureLabelMap[row.most_useful_feature] : 'N/A'}
                      </p>
                    </article>
                  ))}
                </div>
                {hasMoreComments && (
                  <div className={styles.sectionActions}>
                    <button
                      type="button"
                      className={styles.inlineButton}
                      onClick={() => setVisibleCommentCount(previous => previous + COMMENTS_BATCH_SIZE)}
                    >
                      Load More
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Recent Survey Responses</h2>
            <p className={styles.sectionDescription}>
              Structured snapshot of latest responses. Use the Feedback Comments section for full-text review.
            </p>
            {feedbackRows.length === 0 ? (
              <p className={styles.sectionEmpty}>No survey responses yet.</p>
            ) : (
              <div className={styles.responseTable}>
                <div className={styles.responseTableHeader}>
                  <span>Date</span>
                  <span>Rating</span>
                  <span>Useful?</span>
                  <span>Most Useful Feature</span>
                </div>
                {feedbackRows.slice(0, 10).map((row, index) => (
                  <div className={styles.responseTableRow} key={row.id || `row-${index}`}>
                    <span>{row.created_at ? new Date(row.created_at).toLocaleDateString() : 'Unknown'}</span>
                    <span>{row.rating ? `${row.rating}/5` : 'N/A'}</span>
                    <span>{row.found_useful === null ? 'N/A' : row.found_useful ? 'Yes' : 'No'}</span>
                    <span>
                      {row.most_useful_feature ? featureLabelMap[row.most_useful_feature] : 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminAnalytics;
