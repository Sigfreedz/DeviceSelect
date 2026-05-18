import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import styles from '../styles/RoleDashboard.module.css';

const cards = [
  {
    title: 'Saved Devices',
    meta: 'Library',
    description: 'Review your shortlisted laptops and compare them with SAW-ranked recommendations.'
  },
  {
    title: 'IEQ / SQ Surveys',
    meta: 'Surveys',
    description: 'Complete the IEQ and SQ survey links to contribute to the PLV BSIT capstone dataset.'
  },
  {
    title: 'Lesson Progress',
    meta: 'Progress',
    description: 'Track lab readiness, upcoming software requirements, and milestones for your track.'
  }
];

const Dashboard: React.FC = () => {
  return (
    <DashboardLayout
      title="Student Dashboard"
      subtitle="Keep your device shortlist, research surveys, and learning milestones in one place."
      badge="Student Portal"
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
        <strong>Next step:</strong> Finish the surveys to unlock personalized recommendations tailored
        to your BSIT specialization and budget range.
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
