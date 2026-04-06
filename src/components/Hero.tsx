import React, { useState } from 'react';
import styles from '../styles/Hero.module.css';

const Hero: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to Top Devices with a search parameter
      window.history.pushState({}, '', `/top-devices?search=${encodeURIComponent(searchQuery)}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <div className={styles.badge}>
          BSIT Academic Companion
        </div>
        <h1 className={styles.headline}>
          Choose the <span className={styles.gradientText}>Right Device</span> <br />
          for the Right <span className={styles.gradientText}>Workload</span>
        </h1>
        <p className={styles.description}>
          Helping BSIT students select appropriate devices based on academic requirements, 
          software needs, and performance standards. Make informed decisions for your academic journey.
        </p>
        
        <form className={styles.searchBarContainer} onSubmit={handleSearch}>
          <div className={styles.searchIcon}>&#9022;</div>
          <input 
            type="text" 
            placeholder="Search devices by track (Web Dev, Networking, Data Science)..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button type="submit" className={styles.searchBtn}>Search</button>
        </form>

        <div className={styles.ctaGroup}>
          <button className={styles.primaryBtn} onClick={() => {
            window.history.pushState({}, '', '/recommend');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }}>Start Recommendation</button>
          <button className={styles.secondaryBtn} onClick={() => {
            window.history.pushState({}, '', '/top-devices');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }}>View Top Devices</button>
        </div>

        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>50+</span>
            <span className={styles.statLabel}>Devices Verified</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>100%</span>
            <span className={styles.statLabel}>Faculty Aligned</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>BSIT</span>
            <span className={styles.statLabel}>Specialized</span>
          </div>
        </div>
      </div>
      <div className={styles.backgroundVisuals}>
        <div className={styles.blob1}></div>
        <div className={styles.blob2}></div>
      </div>
    </section>
  );
};

export default Hero;
