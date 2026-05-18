import React from 'react';
import Navbar from './Navbar';
import styles from '../styles/RoleDashboard.module.css';

interface DashboardLayoutProps {
  title: string;
  subtitle: string;
  badge?: string;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  subtitle,
  badge,
  children
}) => {
  return (
    <div className="app-container">
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <header className={styles.header}>
            {badge && <span className={styles.badge}>{badge}</span>}
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>
          </header>
          {children}
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

export default DashboardLayout;
