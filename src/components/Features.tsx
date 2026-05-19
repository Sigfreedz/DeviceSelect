import React from 'react';
import styles from '../styles/Features.module.css';

const Features: React.FC = () => {
  const features = [
    {
      icon: '🎯',
      title: 'Personalized Recommendation',
      description: 'Our logic engine analyzes your academic track and software requirements to suggest the most compatible devices.',
      href: '/recommend'
    },
    {
      icon: '📊',
      title: 'Device Comparison',
      description: 'Compare technical specifications side-by-side, specifically focused on benchmarks relevant to IT workloads like virtualization and compilation.',
      href: '/compare'
    }
  ];

  return (
    <section className={styles.features}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Designed for BSIT Excellence</h2>
          <p className={styles.subtitle}>Streamlining the hardware selection process so you can focus on your studies.</p>
        </div>
        <div className={styles.grid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.icon}>{feature.icon}</div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardDescription}>{feature.description}</p>
              <a href={feature.href} className={styles.learnMore}>
                Learn more &rarr;
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
