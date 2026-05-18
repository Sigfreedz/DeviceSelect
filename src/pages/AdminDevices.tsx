import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import styles from '../styles/RoleDashboard.module.css';

const cards = [
  {
    title: 'Add New Devices',
    meta: 'Create',
    description: 'Register new laptop models with SAW-ready specifications.'
  },
  {
    title: 'Bulk Imports',
    meta: 'Upload',
    description: 'Upload device spreadsheets for faster catalog updates.'
  },
  {
    title: 'Spec Normalization',
    meta: 'Quality',
    description: 'Standardize CPU, GPU, and storage labels for consistent rankings.'
  },
  {
    title: 'Archive Entries',
    meta: 'Lifecycle',
    description: 'Retire outdated devices without losing historical data.'
  }
];

const AdminDevices: React.FC = () => {
  return (
    <DashboardLayout
      title="Device Catalog Management"
      subtitle="Create, update, and maintain the laptop database that powers DeviceLabs."
      badge="Admin Devices"
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
        <strong>Data quality:</strong> Keep weights and specs aligned with the latest SAW inputs.
      </div>
    </DashboardLayout>
  );
};

export default AdminDevices;
