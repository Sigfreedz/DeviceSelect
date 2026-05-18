import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import TopDevices from './pages/TopDevices';
import Recommend from './pages/Recommend';
import Compare from './pages/Compare';
import Guides from './pages/Guides';
import AuthForm from './components/AuthForm';
import { AuthProvider, useAuth } from './context/AuthContext';
import styles from './styles/AuthGate.module.css';

const AuthGate: React.FC = () => (
  <div className="app-container">
    <Navbar />
    <main className={styles.main}>
      <div className={styles.content}>
        <div>
          <h1 className={styles.title}>Sign in required</h1>
          <p className={styles.subtitle}>
            Log in with your PLV email to access this section of DeviceLabs.
          </p>
        </div>
        <AuthForm initialMode="login" />
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

const LoadingState: React.FC = () => (
  <div className="app-container">
    <Navbar />
    <main className={styles.loading}>
      <p>Loading your account...</p>
    </main>
  </div>
);

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path === '/top-devices') {
        setCurrentPage('top-devices');
      } else if (path === '/recommend') {
        setCurrentPage('recommend');
      } else if (path === '/compare') {
        setCurrentPage('compare');
      } else if (path === '/guides') {
        setCurrentPage('guides');
      } else {
        setCurrentPage('home');
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const renderProtected = (page: React.ReactElement) => {
    if (isLoading) {
      return <LoadingState />;
    }
    if (!user) {
      return <AuthGate />;
    }
    return page;
  };

  if (currentPage === 'guides') {
    return renderProtected(<Guides />);
  }

  if (currentPage === 'top-devices') {
    return renderProtected(<TopDevices />);
  }

  if (currentPage === 'recommend') {
    return <Recommend />;
  }

  if (currentPage === 'compare') {
    return renderProtected(<Compare />);
  }

  return (
    <div className="app-container">
      <Navbar />
      <main>
        <Hero />
        <Features />
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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
