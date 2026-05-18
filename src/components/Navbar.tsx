import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthForm from './AuthForm';
import styles from '../styles/Navbar.module.css';

type AuthMode = 'login' | 'signup';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const { user, profile, isLoading, signOut } = useAuth();

  const navigate = (path: string) => (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    setIsMobileMenuOpen(false);
  };

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
    setIsMobileMenuOpen(false);
  };

  const closeAuth = () => setIsAuthOpen(false);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error(error);
    }
  };

  const currentPath = window.location.pathname;

  return (
    <>
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
              {user ? (
                <>
                  <div className={styles.userInfo}>
                    <span className={styles.userLabel}>Signed in as</span>
                    <span className={styles.userEmail}>{profile?.email ?? user.email ?? 'User'}</span>
                  </div>
                  <button
                    className={styles.logoutBtn}
                    type="button"
                    onClick={handleSignOut}
                    disabled={isLoading}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={styles.loginBtn}
                    type="button"
                    onClick={() => openAuth('login')}
                    disabled={isLoading}
                  >
                    Login
                  </button>
                  <button
                    className={styles.signupBtn}
                    type="button"
                    onClick={() => openAuth('signup')}
                    disabled={isLoading}
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      {isAuthOpen && (
        <div className={styles.authOverlay} onClick={closeAuth}>
          <div
            className={styles.authModal}
            role="dialog"
            aria-modal="true"
            aria-label="Authentication"
            onClick={e => e.stopPropagation()}
          >
            <AuthForm initialMode={authMode} onClose={closeAuth} />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
