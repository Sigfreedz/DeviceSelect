import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { LESSONS_SEED, Lesson, LessonTier } from '../data/lessonsSeed';
import styles from '../styles/LessonDetail.module.css';

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

const LessonDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [tierLessons, setTierLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadLesson = async () => {
      if (!slug) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setActionMessage(null);

      const { data, error } = await supabase.from('lessons').select('*').eq('slug', slug).maybeSingle();
      const resolvedLesson = !error && data ? normalizeLesson(data) : LESSONS_SEED.find((entry) => entry.slug === slug) ?? null;

      if (!isMounted) return;

      setLesson(resolvedLesson);

      if (!resolvedLesson) {
        setTierLessons([]);
        setIsCompleted(false);
        setIsLoading(false);
        return;
      }

      const tierResult = await supabase
        .from('lessons')
        .select('*')
        .eq('tier', resolvedLesson.tier)
        .order('order_index', { ascending: true });

      const resolvedTierLessons = !tierResult.error && tierResult.data && tierResult.data.length > 0
        ? tierResult.data.map(normalizeLesson)
        : LESSONS_SEED.filter((entry) => entry.tier === resolvedLesson.tier).sort((a, b) => a.order_index - b.order_index);

      if (!isMounted) return;

      setTierLessons(resolvedTierLessons);

      if (!user) {
        setIsCompleted(false);
        setIsLoading(false);
        return;
      }

      const progressResult = await supabase
        .from('user_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('lesson_id', resolvedLesson.id)
        .maybeSingle();

      if (!isMounted) return;

      setIsCompleted(Boolean(progressResult.data));
      setIsLoading(false);
    };

    void loadLesson();

    return () => {
      isMounted = false;
    };
  }, [slug, user]);

  const nextLesson = useMemo(() => {
    if (!lesson) return null;
    const currentIndex = tierLessons.findIndex((entry) => entry.id === lesson.id);
    return currentIndex >= 0 ? tierLessons[currentIndex + 1] ?? null : null;
  }, [lesson, tierLessons]);

  const handleComplete = async () => {
    if (!user || !lesson || isCompleted) return;

    setIsCompleting(true);
    setActionMessage(null);

    const { error } = await supabase.from('user_progress').insert({
      user_id: user.id,
      lesson_id: lesson.id
    });

    if (error && error.code !== '23505') {
      setActionMessage('Unable to save completion right now.');
      setIsCompleting(false);
      return;
    }

    setIsCompleted(true);
    setActionMessage(error?.code === '23505' ? 'Already completed.' : 'Module marked complete.');
    setIsCompleting(false);
  };

  if (isLoading) {
    return (
      <div className="app-container">
        <Navbar />
        <main className={styles.loading}>Loading lesson…</main>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="app-container">
        <Navbar />
        <main className={styles.loading}>
          <div className={styles.notFoundCard}>
            <h1>Lesson not found</h1>
            <button type="button" onClick={() => navigate('/lessons')} className={styles.backButton}>
              Back to lessons
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.breadcrumbs}>
            <Link to="/lessons">Lessons</Link>
            <span>/</span>
            <span>{lesson.title}</span>
          </div>

          <header className={styles.header}>
            <div>
              <span className={styles.tier}>{lesson.tier}</span>
              <h1>{lesson.title}</h1>
              <p>{lesson.description}</p>
            </div>
            <div className={styles.headerMeta}>
              <span>Module {lesson.order_index}</span>
              {isCompleted && <span className={styles.mastery}>Mastered</span>}
            </div>
          </header>

          <div className={styles.layout}>
            <section className={styles.contentColumn}>
              <div className={styles.videoPanel}>
                <h2>Tutorial Video</h2>
                {lesson.video_url ? (
                  <div className={styles.videoFrameWrap}>
                    <iframe
                      className={styles.videoFrame}
                      src={lesson.video_url}
                      title={`${lesson.title} video`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className={styles.videoPlaceholder}>Video coming soon. Add a tutorial URL later to show it here.</div>
                )}
              </div>

              <div className={styles.quickStart}>
                <h2>Quick Start Guide</h2>
                <ol>
                  {lesson.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>

              <article className={styles.markdownBody}>
                <ReactMarkdown>{lesson.content}</ReactMarkdown>
              </article>

              {user ? (
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.completeButton}
                    onClick={handleComplete}
                    disabled={isCompleted || isCompleting}
                  >
                    {isCompleted ? 'Module completed' : isCompleting ? 'Saving…' : 'Complete Module'}
                  </button>
                  {nextLesson && (
                    <Link className={styles.nextButton} to={`/lessons/${nextLesson.slug}`}>
                      Next Module
                    </Link>
                  )}
                </div>
              ) : (
                <p className={styles.authHint}>Sign in to track completion.</p>
              )}

              {actionMessage && <p className={styles.actionMessage}>{actionMessage}</p>}
            </section>

            <aside className={styles.sidebar}>
              <h3>{lesson.tier} Curriculum</h3>
              <ul>
                {tierLessons.map((entry) => (
                  <li key={entry.id} className={entry.id === lesson.id ? styles.activeLesson : ''}>
                    <Link to={`/lessons/${entry.slug}`}>
                      <span>Module {entry.order_index}</span>
                      <strong>{entry.title}</strong>
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
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

export default LessonDetail;
