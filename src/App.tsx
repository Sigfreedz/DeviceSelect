import React from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import TopDevices from './pages/TopDevices';
import Recommend from './pages/Recommend';
import Compare from './pages/Compare';
import Lessons from './pages/Lessons';
import LessonDetail from './pages/LessonDetail';
import Dashboard from './pages/Dashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import Faculty from './pages/Faculty';
import FacultyReports from './pages/FacultyReports';
import FacultyMethodology from './pages/FacultyMethodology';
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

const roleLanding: Record<Role, string> = {
  student: '/dashboard',
  faculty: '/faculty',
  admin: '/admin'
};

const AccessDenied: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const role = isRole(profile?.role) ? profile?.role : null;
  const destination = role ? roleLanding[role] : '/';
  const buttonLabel = role ? 'Go to your portal' : 'Return to home';

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
          <button className={styles.actionButton} type="button" onClick={() => navigate(destination)}>
            {buttonLabel}
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

const HomePage: React.FC = () => (
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

const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/recommend" element={<Recommend />} />
      <Route path="/lessons" element={<Lessons />} />
      <Route path="/lessons/:slug" element={<LessonDetail />} />
      <Route path="/guides" element={<Navigate to="/lessons" replace />} />
      <Route
        path="/top-devices"
        element={(
          <ProtectedRoute>
            <TopDevices />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/compare"
        element={(
          <ProtectedRoute>
            <Compare />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/dashboard"
        element={(
          <ProtectedRoute allowedRoles={['student']}>
            <Dashboard />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/faculty"
        element={(
          <ProtectedRoute allowedRoles={['faculty', 'admin']}>
            <FacultyDashboard />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/faculty/overview"
        element={(
          <ProtectedRoute allowedRoles={['faculty', 'admin']}>
            <Faculty />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/faculty/reports"
        element={(
          <ProtectedRoute allowedRoles={['faculty', 'admin']}>
            <FacultyReports />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/faculty/methodology"
        element={(
          <ProtectedRoute allowedRoles={['faculty', 'admin']}>
            <FacultyMethodology />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/admin"
        element={(
          <ProtectedRoute allowedRoles={['admin']}>
            <Admin />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/admin/devices"
        element={(
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDevices />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/admin/analytics"
        element={(
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminAnalytics />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/admin/users"
        element={(
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsers />
          </ProtectedRoute>
        )}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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
