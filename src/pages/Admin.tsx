import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import styles from '../styles/RoleDashboard.module.css';

const cards = [
  {
    title: 'Platform Analytics',
    meta: 'Insights',
    description: 'Monitor recommendation activity, survey completion, and usage trends.'
  },
  {
    title: 'Device Catalog',
    meta: 'Inventory',
    description: 'Maintain the laptop database that powers SAW recommendations.'
  },
  {
    title: 'User Management',
    meta: 'Access',
    description: 'Approve profiles, assign roles, and keep access policies up to date.'
  }
];

const Admin: React.FC = () => {
  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle="Oversee analytics, device data, and user approvals across DeviceLabs."
      badge="Admin Console"
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
        <strong>Operations:</strong> Validate catalog updates before publishing new recommendations.
      </div>
    </DashboardLayout>
  );
};

export default Admin;
