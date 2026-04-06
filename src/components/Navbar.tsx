import React from 'react';
import styles from '../styles/Navbar.module.css';

const Navbar: React.FC = () => {
  const navigate = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const currentPath = window.location.pathname;

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.logo} onClick={navigate('/')} style={{cursor: 'pointer'}}>
          <span className={styles.logoIcon}>&#9671;</span>
          <span className={styles.logoText}>IT DeviceSelect</span>
        </div>
        <ul className={styles.navLinks}>
          <li><a href="/" onClick={navigate('/')} className={currentPath === '/' ? styles.active : ''}>Home</a></li>
          <li><a href="/top-devices" onClick={navigate('/top-devices')} className={currentPath === '/top-devices' ? styles.active : ''}>Top Devices</a></li>
          <li><a href="/recommend" onClick={navigate('/recommend')} className={currentPath === '/recommend' ? styles.active : ''}>Recommend</a></li>
          <li><a href="/compare" onClick={navigate('/compare')} className={currentPath === '/compare' ? styles.active : ''}>Compare</a></li>
          <li><a href="/guides">Guides</a></li>
          <li><a href="/standards">Standards</a></li>
          <li><a href="/about">About</a></li>
        </ul>
        <div className={styles.navAuth}>
          <button className={styles.loginBtn}>Login</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
