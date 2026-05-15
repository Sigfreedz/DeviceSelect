import React, { useState } from 'react';
import styles from '../styles/Navbar.module.css';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = (path: string) => (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    setIsMobileMenuOpen(false);
  };

  const currentPath = window.location.pathname;

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.logo} onClick={navigate('/')} style={{cursor: 'pointer'}}>
          <span className={styles.logoIcon}>&#9671;</span>
          <span className={styles.logoText}>IT DeviceSelect</span>
        </div>
        <button
          className={styles.mobileToggle}
          type="button"
          aria-label="Toggle navigation menu"
          aria-controls="primary-navigation"
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((open) => !open)}
        >
          ☰
        </button>
        <div className={`${styles.navMenu} ${isMobileMenuOpen ? styles.navMenuOpen : ''}`}>
          <ul className={styles.navLinks} id="primary-navigation">
            <li><a href="/" onClick={navigate('/')} className={currentPath === '/' ? styles.active : ''}>Home</a></li>
            <li><a href="/top-devices" onClick={navigate('/top-devices')} className={currentPath === '/top-devices' ? styles.active : ''}>Top Devices</a></li>
            <li><a href="/recommend" onClick={navigate('/recommend')} className={currentPath === '/recommend' ? styles.active : ''}>Recommend</a></li>
            <li><a href="/compare" onClick={navigate('/compare')} className={currentPath === '/compare' ? styles.active : ''}>Compare</a></li>
            <li><a href="/guides" onClick={navigate('/guides')} className={currentPath === '/guides' ? styles.active : ''}>Guides</a></li>
            <li><a href="/standards" onClick={navigate('/standards')} className={currentPath === '/standards' ? styles.active : ''}>Standards</a></li>
            <li><a href="/about" onClick={navigate('/about')} className={currentPath === '/about' ? styles.active : ''}>About</a></li>
          </ul>
          <div className={styles.navAuth}>
            <button className={styles.loginBtn} type="button" onClick={() => setIsMobileMenuOpen(false)}>Login</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
