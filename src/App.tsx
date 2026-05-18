import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import TopDevices from './pages/TopDevices';
import Recommend from './pages/Recommend';
import Compare from './pages/Compare';
import Guides from './pages/Guides';
import Dashboard from './pages/Dashboard';
import Faculty from './pages/Faculty';
import FacultyMethodology from './pages/FacultyMethodology';
import FacultyReports from './pages/FacultyReports';
import Admin from './pages/Admin';
import AdminDevices from './pages/AdminDevices';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminUsers from './pages/AdminUsers';
import AuthForm from './components/AuthForm';
import { AuthProvider, useAuth } from './context/AuthContext';
import styles from './styles/AuthGate.module.css';

type Role = 'student' | 'faculty' | 'admin';

const isRole = (value: string | null | undefined): value is Role => {
  return value === 'student' || value === 'faculty' || value === 'admin';
};

const AuthGate: React.FC = () => (
  <div className="app-container">
    <Navbar />
    <main className={styles.main}>
      <div className={styles.content}>
        <div>
          <h1 className={styles.title}>Sign in required</h1>
          <p className={styles.subtitle}>
            Log in with your PLV email to access this section of IT DeviceSelect.
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

const roleLanding: Record<Role, string> = {
  student: '/dashboard',
  faculty: '/faculty',
  admin: '/admin'
};

const AccessDenied: React.FC = () => {
  const { profile } = useAuth();
  const role = isRole(profile?.role) ? profile?.role : null;
  const destination = role ? roleLanding[role] : '/';

  const handleNavigate = () => {
    window.history.pushState({}, '', destination);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="app-container">
      <Navbar />
      <main className={styles.main}>
        <div className={styles.content}>
          <div>
            <h1 className={styles.title}>Access restricted</h1>
            <p className={styles.subtitle}>
              {role
                ? `Your account is set to the ${role} role, which does not grant access here.`
                : 'Your profile is still pending a valid role assignment.'}
            </p>
          </div>
          <button className={styles.actionButton} type="button" onClick={handleNavigate}>
            Go to your portal
          </button>
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

const ProtectedRoute: React.FC<{
  allowedRoles?: Role[];
  children: React.ReactElement;
}> = ({ allowedRoles, children }) => {
  const { user, profile, isLoading } = useAuth();
  const role = isRole(profile?.role) ? profile?.role : null;

  if (isLoading) {
    return <LoadingState />;
  }
  if (!user) {
    return <AuthGate />;
  }
  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <AccessDenied />;
  }
  return children;
};

const AppContent: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const normalizedPath = currentPath.replace(/\/+$/, '') || '/';

  if (normalizedPath === '/recommend') {
    return <Recommend />;
  }

  if (normalizedPath === '/guides') {
    return <Guides />;
  }

  if (normalizedPath === '/top-devices') {
    return (
      <ProtectedRoute>
        <TopDevices />
      </ProtectedRoute>
    );
  }

  if (normalizedPath === '/compare') {
    return (
      <ProtectedRoute>
        <Compare />
      </ProtectedRoute>
    );
  }

  if (normalizedPath === '/dashboard') {
    return (
      <ProtectedRoute allowedRoles={['student']}>
        <Dashboard />
      </ProtectedRoute>
    );
  }

  if (normalizedPath === '/faculty') {
    return (
      <ProtectedRoute allowedRoles={['faculty']}>
        <Faculty />
      </ProtectedRoute>
    );
  }

  if (normalizedPath === '/faculty/methodology') {
    return (
      <ProtectedRoute allowedRoles={['faculty']}>
        <FacultyMethodology />
      </ProtectedRoute>
    );
  }

  if (normalizedPath === '/faculty/reports') {
    return (
      <ProtectedRoute allowedRoles={['faculty']}>
        <FacultyReports />
      </ProtectedRoute>
    );
  }

  if (normalizedPath === '/admin') {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <Admin />
      </ProtectedRoute>
    );
  }

  if (normalizedPath === '/admin/devices') {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminDevices />
      </ProtectedRoute>
    );
  }

  if (normalizedPath === '/admin/analytics') {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminAnalytics />
      </ProtectedRoute>
    );
  }

  if (normalizedPath === '/admin/users') {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminUsers />
      </ProtectedRoute>
    );
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
