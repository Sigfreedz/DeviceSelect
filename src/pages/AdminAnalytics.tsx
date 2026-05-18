import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import styles from '../styles/RoleDashboard.module.css';

const cards = [
  {
    title: 'IEQ / SQ Responses',
    meta: 'Surveys',
    description: 'Review aggregated IEQ and SQ responses for research reporting.'
  },
  {
    title: 'T-Test Calculator',
    meta: 'Analysis',
    description: 'Run comparative t-tests for pre/post recommendation cohorts.'
  },
  {
    title: 'Dataset Exports',
    meta: 'Export',
    description: 'Download anonymized datasets for capstone documentation.'
  },
  {
    title: 'Cohort Insights',
    meta: 'Trends',
    description: 'Compare recommendation outcomes by track and year level.'
  }
];

const AdminAnalytics: React.FC = () => {
  return (
    <DashboardLayout
      title="Analytics & Research"
      subtitle="Evaluate IEQ/SQ surveys and statistical outputs for the DeviceLabs capstone."
      badge="Admin Analytics"
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
        <strong>Research:</strong> Verify t-test outputs before including results in reports.
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;
