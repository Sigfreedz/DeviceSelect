import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import styles from '../styles/RoleDashboard.module.css';

const cards = [
  {
    title: 'Methodology Documentation',
    meta: 'SAW',
    description: 'Review the SAW algorithm workflow, criteria weights, and validation steps.'
  },
  {
    title: 'NICTEF Alignment',
    meta: 'Curriculum',
    description: 'Confirm device requirements are aligned with NICTEF learning outcomes.'
  },
  {
    title: 'Aggregated Insights',
    meta: 'Reports',
    description: 'Monitor anonymized trends from student recommendations and track demand.'
  }
];

const Faculty: React.FC = () => {
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <DashboardLayout
      title="Faculty Dashboard"
      subtitle="Access methodology resources, curriculum alignment, and anonymized recommendation insights."
      badge="Faculty Access"
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
        <strong>Research focus:</strong> Use the aggregated insights to validate device coverage
        across BSIT tracks before finalizing curriculum updates.
      </div>
      <div className={styles.sectionActions}>
        <button type="button" className={styles.inlineButton} onClick={() => navigate('/faculty')}>
          Open Faculty Analytics
        </button>
        <button type="button" className={styles.inlineButton} onClick={() => navigate('/faculty/reports')}>
          Open Reports
        </button>
        <button type="button" className={styles.inlineButton} onClick={() => navigate('/faculty/methodology')}>
          Open Methodology
        </button>
      </div>
    </DashboardLayout>
  );
};

export default Faculty;
