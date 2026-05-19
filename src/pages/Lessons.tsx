import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { LESSONS_SEED, Lesson, LessonTier } from '../data/lessonsSeed';
import styles from '../styles/Lessons.module.css';

const TIERS: LessonTier[] = ['Beginner', 'Intermediate', 'Advanced'];

const normalizeSteps = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item : null))
    .filter((item): item is string => Boolean(item));
};

const normalizeLesson = (item: any): Lesson => ({
  id: String(item.id),
  slug: String(item.slug),
  title: String(item.title),
  description: String(item.description),
  content: String(item.content ?? ''),
  tier: item.tier as LessonTier,
  order_index: Number(item.order_index),
  thumbnail_url: typeof item.thumbnail_url === 'string' ? item.thumbnail_url : null,
  video_url: typeof item.video_url === 'string' ? item.video_url : null,
  steps: normalizeSteps(item.steps)
});

const Lessons: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>(LESSONS_SEED);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [failedThumbnails, setFailedThumbnails] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let isMounted = true;

    const loadLessons = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('tier', { ascending: true })
        .order('order_index', { ascending: true });

      if (!isMounted) return;

      if (error || !data || data.length === 0) {
        setLessons(LESSONS_SEED);
        setLoadError(error ? 'Using offline lesson content for now.' : null);
      } else {
        setLessons(data.map(normalizeLesson));
        setLoadError(null);
      }
      setFailedThumbnails({});

      setIsLoading(false);
    };

    void loadLessons();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadProgress = async () => {
      if (!user) {
        setCompletedLessonIds(new Set());
        return;
      }

      const { data, error } = await supabase
        .from('user_progress')
        .select('lesson_id')
        .eq('user_id', user.id);

      if (!isMounted) return;

      if (error || !data) {
        setCompletedLessonIds(new Set());
        return;
      }

      const next = new Set<string>(data.map((entry: { lesson_id: string }) => String(entry.lesson_id)));
      setCompletedLessonIds(next);
    };

    void loadProgress();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const groupedLessons = useMemo(() => {
    return TIERS.map((tier) => ({
      tier,
      lessons: lessons
        .filter((lesson) => lesson.tier === tier)
        .sort((a, b) => a.order_index - b.order_index)
    })).filter((group) => group.lessons.length > 0);
  }, [lessons]);

  return (
    <div className="app-container">
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <section className={styles.hero}>
            <p className={styles.badge}>Public Learning Modules</p>
            <h1 className={styles.title}>Device Lessons</h1>
            <p className={styles.subtitle}>
              Follow structured tutorials for selecting the right BSIT device, then mark each completed module once.
            </p>
            <div className={styles.heroActions}>
              <button type="button" className={styles.primaryButton} onClick={() => navigate('/recommend')}>
                Get Recommendation
              </button>
              <button type="button" className={styles.secondaryButton} onClick={() => navigate('/compare')}>
                Compare Devices
              </button>
            </div>
          </section>

          {loadError && <p className={styles.infoBanner}>{loadError}</p>}

          {isLoading ? (
            <div className={styles.loadingState}>Loading lessons…</div>
          ) : (
            <div className={styles.groupList}>
              {groupedLessons.map((group) => (
                <section key={group.tier} className={styles.groupSection}>
                  <header className={styles.groupHeader}>
                    <span className={`${styles.tierPill} ${styles[group.tier.toLowerCase()]}`}>{group.tier}</span>
                    <h2>{group.tier} Modules</h2>
                  </header>

                  <div className={styles.cardGrid}>
                    {group.lessons.map((lesson) => {
                      const isCompleted = completedLessonIds.has(lesson.id);

                      return (
                        <article key={lesson.id} className={styles.lessonCard}>
                          <div className={styles.thumbnailWrap}>
                            {lesson.thumbnail_url && !failedThumbnails[lesson.id] ? (
                              <img
                                src={lesson.thumbnail_url}
                                alt={`${lesson.title} thumbnail`}
                                className={styles.thumbnailImage}
                                onError={() =>
                                  setFailedThumbnails((prev) => ({
                                    ...prev,
                                    [lesson.id]: true
                                  }))
                                }
                              />
                            ) : (
                              <div className={styles.thumbnailPlaceholder} aria-label={`${lesson.title} branded placeholder`}>
                                <span className={styles.placeholderBadge}>DeviceSelect</span>
                                <strong>{lesson.title}</strong>
                              </div>
                            )}
                          </div>
                          <div className={styles.cardMeta}>
                            <span>Module {lesson.order_index}</span>
                            {user && isCompleted && <span className={styles.completeBadge}>Completed</span>}
                          </div>
                          <h3>{lesson.title}</h3>
                          <p>{lesson.description}</p>
                          <div className={styles.cardFooter}>
                            <span className={styles.videoBadge}>{lesson.video_url ? 'Watch Tutorial' : 'Video coming soon'}</span>
                            <Link to={`/lessons/${lesson.slug}`} className={styles.openLink}>
                              Open Lesson
                            </Link>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>
      <footer>
        <div className="footer-content">
          <p>&copy; 2026 Web-Based Device Selection Platform for IT Students. All rights reserved.</p>
          <p>Designed for BSIT Academic Excellence.</p>
        </div>
      </footer>
    </div>
  );
};

export default Lessons;
