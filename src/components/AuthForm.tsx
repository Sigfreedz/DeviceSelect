import React, { useEffect, useMemo, useState } from 'react';
import { ItTrack, useAuth } from '../context/AuthContext';
import styles from './AuthForm.module.css';

type AuthMode = 'login' | 'signup';

interface AuthFormProps {
  initialMode?: AuthMode;
  onClose?: () => void;
}

const trackOptions: Array<{ value: ItTrack; label: string }> = [
  { value: 'general', label: 'General' },
  { value: 'web_dev', label: 'Web Development' },
  { value: 'networking', label: 'Networking' },
  { value: 'data', label: 'Data' }
];

const AuthForm: React.FC<AuthFormProps> = ({ initialMode = 'login', onClose }) => {
  const { signIn, signUp, isLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [itTrack, setItTrack] = useState<ItTrack>('general');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
  }, [initialMode]);

  const isSignup = mode === 'signup';
  const title = useMemo(() => (isSignup ? 'Create your account' : 'Welcome back'), [isSignup]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = isSignup
      ? await signUp(email.trim(), password, itTrack)
      : await signIn(email.trim(), password);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onClose?.();
  };

  const isBusy = isLoading || isSubmitting;

  return (
    <div className={styles.card}>
      {onClose && (
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close">
          ×
        </button>
      )}
      <div className={styles.header}>
        <h2>{title}</h2>
        <p>{isSignup ? 'Join IT DeviceSelect to unlock more tools.' : 'Sign in to access your personalized dashboard.'}</p>
      </div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          Email address
          <input
            className={styles.input}
            type="email"
            placeholder="you@plv.edu.ph"
            value={email}
            onChange={event => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label className={styles.label}>
          Password
          <input
            className={styles.input}
            type="password"
            placeholder="Minimum 6 characters"
            value={password}
            onChange={event => setPassword(event.target.value)}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            minLength={6}
            required
          />
        </label>
        {isSignup && (
          <label className={styles.label}>
            IT track
            <select
              className={styles.select}
              value={itTrack}
              onChange={event => setItTrack(event.target.value as ItTrack)}
            >
              {trackOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        )}
        {error && <div className={styles.error}>{error}</div>}
        <button className={styles.submitButton} type="submit" disabled={isBusy}>
          {isBusy ? 'Please wait...' : isSignup ? 'Create account' : 'Sign in'}
        </button>
      </form>
      <div className={styles.toggleRow}>
        <span>{isSignup ? 'Already have an account?' : 'New to IT DeviceSelect?'}</span>
        <button
          type="button"
          className={styles.toggleButton}
          onClick={() => setMode(isSignup ? 'login' : 'signup')}
          disabled={isBusy}
        >
          {isSignup ? 'Sign in instead' : 'Create an account'}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;
