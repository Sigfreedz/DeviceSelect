import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import styles from '../styles/RoleDashboard.module.css';

const cards = [
  {
    title: 'Role Assignment',
    meta: 'Roles',
    description: 'Promote student accounts to faculty or admin roles as needed.'
  },
  {
    title: 'Profile Approvals',
    meta: 'Approvals',
    description: 'Approve new PLV profiles and verify official email domains.'
  },
  {
    title: 'Access Audits',
    meta: 'Audit',
    description: 'Review recent access changes and compliance checkpoints.'
  },
  {
    title: 'Account Status',
    meta: 'Support',
    description: 'Suspend or reinstate accounts while keeping audit logs intact.'
  }
];

const AdminUsers: React.FC = () => {
  return (
    <DashboardLayout
      title="User Access Management"
      subtitle="Assign roles, approve profiles, and ensure compliance with DeviceLabs access policies."
      badge="Admin Users"
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
        <strong>Security:</strong> Keep role changes auditable to meet research governance.
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
