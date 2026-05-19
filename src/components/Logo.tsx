import React from 'react';
import styles from './Logo.module.css';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showTagline?: boolean;
}

export default function Logo({ size = 'medium', showTagline = false }: LogoProps) {
  return (
    <div className={`${styles.logoContainer} ${styles[size]}`}>
      <div className={styles.logoIcon}>
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M20 2L38 20L20 38L2 20L20 2Z"
            fill="url(#gradient)"
            stroke="#8b5cf6"
            strokeWidth="2"
          />
          <circle cx="20" cy="20" r="6" fill="white" opacity="0.9" />
          <defs>
            <linearGradient id="gradient" x1="2" y1="2" x2="38" y2="38">
              <stop offset="0%" stopColor="#4361ee" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className={styles.logoText}>
        <span className={styles.brandName}>DeviceLabs</span>
        {showTagline && <span className={styles.tagline}>PLV BSIT</span>}
      </div>
    </div>
  );
}
