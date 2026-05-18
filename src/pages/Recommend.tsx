import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { isUuid } from '../utils/isUuid';
import { Device, rankDevices } from '../utils/saw';
import styles from '../styles/Recommend.module.css';

type TrackOption = keyof Device['track_scores'];

const trackLabelMap: Record<TrackOption, string> = {
  web_dev: 'Web Development',
  networking: 'Networking',
  data: 'Data',
  general: 'General'
};

const testConnection = async () => {
  const { count, error } = await supabase
    .from('devices')
    .select('*', { count: 'exact', head: true });

  if (error) {
    alert(`Connection failed: ${error.message}`);
  } else {
    alert(`Connected! Found ${count} devices in database`);
  }
};

const Recommend: React.FC = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({
    track: '' as TrackOption | '',
    budget: 0,
    portability: ''
  });
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Device[]>([]);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const recommendation = recommendations[0] || null;

  const logInteraction = async (
    eventType: 'recommendation_view' | 'comparison_click',
    deviceId?: string
  ) => {
    if (!user?.id) return;
    const safeDeviceId = deviceId && isUuid(deviceId) ? deviceId : null;
    const { error } = await supabase.from('interaction_logs').insert({
      user_id: user.id,
      event_type: eventType,
      device_id: safeDeviceId
    });
    if (error) {
      console.error('Unable to log interaction:', error.message);
    }
  };

  const fetchDevices = async (): Promise<Device[]> => {
    try {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .order('price_php', { ascending: true });

      if (error) throw error;
      return (data || []) as Device[];
    } catch (error) {
      console.error('Error fetching devices:', error);
      return [];
    }
  };

  const handleGetRecommendation = async (formData: {
    budgetMax: number;
    track: TrackOption;
    osPreference?: string;
    portability?: 'light' | 'medium' | 'heavy';
  }) => {
    setLoading(true);
    setSaveMessage(null);

    const allDevices = await fetchDevices();
    const ranked = rankDevices(allDevices, {
      budget_max: formData.budgetMax,
      track: formData.track,
      preferred_os: formData.osPreference || 'Windows'
    });

    setRecommendations(ranked.slice(0, 5));
    const topRecommendation = ranked[0];
    if (topRecommendation) {
      await logInteraction('recommendation_view', topRecommendation.id);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && window.location.search.includes('testConnection=true')) {
      void testConnection();
    }
  }, []);

  const handleTrackSelect = (track: TrackOption) => {
    setSelections({ ...selections, track });
    setStep(2);
  };

  const handleBudgetSelect = (budget: number) => {
    setSelections({ ...selections, budget });
    setStep(3);
  };

  const handlePortabilitySelect = async (portability: string) => {
    const finalSelections = { ...selections, portability };
    setSelections(finalSelections);
    setStep(4);

    const selectedTrack: TrackOption = finalSelections.track === '' ? 'general' : finalSelections.track;
    await handleGetRecommendation({
      budgetMax: finalSelections.budget,
      track: selectedTrack,
      portability: portability === 'Lightweight' ? 'light' : portability === 'High Performance' ? 'heavy' : 'medium',
      osPreference: 'Windows'
    });
  };

  const restartQuiz = () => {
    setSelections({
      track: '',
      budget: 0,
      portability: ''
    });
    setRecommendations([]);
    setSaveMessage(null);
    setStep(1);
  };

  const handleSaveRecommendation = async () => {
    setSaveMessage(null);

    if (!user?.id) {
      setSaveMessage('Please sign in to save a recommendation.');
      return;
    }

    if (!recommendation) {
      setSaveMessage('No recommendation available to save yet.');
      return;
    }

    if (!isUuid(recommendation.id)) {
      setSaveMessage('This recommendation cannot be saved because it is not linked to a Supabase device.');
      return;
    }

    try {
      const { count, error: countError } = await supabase
        .from('saved_devices')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) throw countError;

      if ((count ?? 0) >= 3) {
        setSaveMessage('You can only save up to 3 devices. Remove one from the dashboard to continue.');
        return;
      }

      const { error: saveError } = await supabase.from('saved_devices').insert({
        user_id: user.id,
        device_id: recommendation.id
      });

      if (saveError) {
        if ((saveError as any).code === '23505') {
          setSaveMessage('This device is already in your saved list.');
          return;
        }
        throw saveError;
      }

      setSaveMessage('Device saved successfully. Check your Student Dashboard.');
    } catch (error: any) {
      setSaveMessage(error?.message ?? 'Unable to save this recommendation right now.');
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          {step < 4 && (
            <div className={styles.progress}>
              <div className={styles.progressBar} style={{ width: `${(step / 3) * 100}%` }}></div>
              <span className={styles.stepText}>Step {step} of 3</span>
            </div>
          )}

          {step === 1 && (
            <div className={styles.wizardStep}>
              <h2 className={styles.question}>What is your BSIT Specialization?</h2>
              <div className={styles.optionsGrid}>
                {([
                  { key: 'web_dev', label: 'Web Development', icon: '🌐' },
                  { key: 'networking', label: 'Networking', icon: '📡' },
                  { key: 'data', label: 'Data', icon: '📊' },
                  { key: 'general', label: 'General', icon: '💼' }
                ] as const).map(t => (
                  <button key={t.key} className={styles.optionBtn} onClick={() => handleTrackSelect(t.key)}>
                    <span className={styles.optionIcon}>{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.wizardStep}>
              <h2 className={styles.question}>What is your maximum budget?</h2>
              <div className={styles.optionsGrid}>
                {[
                  { label: 'Entry (₱30k)', value: 30000 },
                  { label: 'Mid-range (₱50k)', value: 50000 },
                  { label: 'High-end (₱80k)', value: 80000 },
                  { label: 'Premium (₱120k+)', value: 150000 }
                ].map(b => (
                  <button key={b.label} className={styles.optionBtn} onClick={() => handleBudgetSelect(b.value)}>
                    <span className={styles.optionPrice}>₱{b.value.toLocaleString()}</span>
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.wizardStep}>
              <h2 className={styles.question}>Prioritize Portability or Performance?</h2>
              <div className={styles.optionsGrid}>
                {[
                  { label: 'Lightweight (Easy to carry)', value: 'Lightweight', icon: '☁️' },
                  { label: 'Balanced (Daily driver)', value: 'Balanced', icon: '⚖️' },
                  { label: 'High Performance (Power user)', value: 'High Performance', icon: '🚀' }
                ].map(p => (
                  <button key={p.label} className={styles.optionBtn} onClick={() => { void handlePortabilitySelect(p.value); }}>
                    <span className={styles.optionIcon}>{p.icon}</span>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className={styles.resultContainer}>
              <h2 className={styles.resultTitle}>Your Perfect Academic Companion</h2>

              {loading && <p>Loading recommendations from Supabase...</p>}

              {!loading && recommendation && (
                <div className={styles.recommendationCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.recImage}>💻</div>
                    <div className={styles.recBasicInfo}>
                      <span className={styles.recBrand}>{recommendation.brand}</span>
                      <h3 className={styles.recName}>{recommendation.name}</h3>
                    </div>
                    <div className={styles.recPrice}>₱{recommendation.price_php.toLocaleString()}</div>
                  </div>

                  <div className={styles.recSpecs}>
                    <div className={styles.specItem}><strong>RAM:</strong> {recommendation.ram_gb}GB</div>
                    <div className={styles.specItem}><strong>Storage:</strong> {recommendation.storage_gb}GB {recommendation.storage_type}</div>
                    <div className={styles.specItem}><strong>Battery:</strong> {recommendation.battery_hrs} hrs</div>
                    <div className={styles.specItem}><strong>Weight:</strong> {recommendation.weight_kg} kg</div>
                    <div className={styles.specItem}><strong>GPU:</strong> {recommendation.has_gpu ? 'Dedicated GPU' : 'Integrated GPU'}</div>
                    <div className={styles.specItem}><strong>OS:</strong> {recommendation.os}</div>
                  </div>

                  <div className={styles.whyText}>
                    <h4>Why this matches you:</h4>
                    <p>Based on your <strong>{selections.track ? trackLabelMap[selections.track] : 'selected'}</strong> track, this device fits your chosen budget and profile.</p>
                  </div>

                  <ScoreBreakdown device={recommendation} />

                  <div className={styles.actionGroup}>
                    <button className={styles.primaryBtn} onClick={handleSaveRecommendation}>
                      Save to Dashboard
                    </button>
                    <button className={styles.secondaryBtn} onClick={restartQuiz}>Restart Quiz</button>
                  </div>
                  {saveMessage && <p className={styles.statusText}>{saveMessage}</p>}
                </div>
              )}

              {!loading && !recommendation && (
                <div className={styles.wizardStep}>
                  <p>No devices matched your filters. Try a higher budget or another track.</p>
                  <button className={styles.secondaryBtn} onClick={restartQuiz}>Restart Quiz</button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <footer>
        <div className="footer-content">
          <p>&copy; 2026 Web-Based Device Selection Platform for IT Students. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Recommend;
