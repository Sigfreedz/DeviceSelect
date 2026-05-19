import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import styles from '../styles/RoleDashboard.module.css';

const cards = [
  {
    title: 'SAW Scoring Flow',
    meta: 'Algorithm',
    description: 'Trace how criteria scores are normalized and aggregated for each device.'
  },
  {
    title: 'Criteria Weighting',
    meta: 'Weights',
    description: 'Review weight assignments for budget, portability, and track fit.'
  },
  {
    title: 'Curriculum Mapping',
    meta: 'NICTEF',
    description: 'Map device requirements to BSIT outcomes and track competencies.'
  },
  {
    title: 'Survey Instruments',
    meta: 'IEQ/SQ',
    description: 'Reference IEQ and SQ survey questions used for data collection.'
  }
];

const FacultyMethodology: React.FC = () => {
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <DashboardLayout
      title="Methodology & SAW"
      subtitle="Document the SAW algorithm, curriculum alignment, and survey instruments used in DeviceLabs."
      badge="Faculty Methodology"
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
        <strong>Reminder:</strong> Keep all methodology notes in sync with the latest SAW
        weights and NICTEF alignment tables.
      </div>
      <div className={styles.sectionActions}>
        <button type="button" className={styles.inlineButton} onClick={() => navigate('/faculty')}>
          Open Faculty Analytics
        </button>
        <button type="button" className={styles.inlineButton} onClick={() => navigate('/faculty/overview')}>
          Open Faculty Overview
        </button>
        <button type="button" className={styles.inlineButton} onClick={() => navigate('/faculty/reports')}>
          Open Reports
        </button>
      </div>
    </DashboardLayout>
  );
};

export default FacultyMethodology;
