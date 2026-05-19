import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import styles from '../styles/RoleDashboard.module.css';

const cards = [
  {
    title: 'Recommendation Trends',
    meta: 'Insights',
    description: 'Analyze anonymized device trends across BSIT specializations.'
  },
  {
    title: 'Budget Distribution',
    meta: 'Finance',
    description: 'Monitor student budget tiers and affordability insights.'
  },
  {
    title: 'Track Demand',
    meta: 'Tracks',
    description: 'Compare recommendation volume across web, networking, data, and general tracks.'
  }
];

const FacultyReports: React.FC = () => {
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <DashboardLayout
      title="Faculty Reports"
      subtitle="Review anonymized recommendation patterns to support evidence-based curriculum planning."
      badge="Faculty Reports"
    >
      <div className={styles.grid}>
        {cards.map(card => (
          <article className={styles.card} key={card.title}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <span className={styles.cardMeta}>{card.meta}</span>
            </div>
            <p className={styles.cardDescription}>{card.description}</p>
          </article>
        ))}
      </div>
      <div className={styles.note}>
        <strong>Privacy note:</strong> All reports remain anonymized to protect student identities.
      </div>
      <div className={styles.sectionActions}>
        <button type="button" className={styles.inlineButton} onClick={() => navigate('/faculty')}>
          Open Faculty Analytics
        </button>
        <button type="button" className={styles.inlineButton} onClick={() => navigate('/faculty/overview')}>
          Open Faculty Overview
        </button>
        <button type="button" className={styles.inlineButton} onClick={() => navigate('/faculty/methodology')}>
          Open Methodology
        </button>
      </div>
    </DashboardLayout>
  );
};

export default FacultyReports;
