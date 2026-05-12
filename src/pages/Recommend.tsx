import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import deviceData from '../data/devices.json';
import { Device as SawDevice, rankDevices } from '../utils/saw';
import styles from '../styles/Recommend.module.css';

interface CatalogDevice {
  id: number;
  name: string;
  brand: string;
  type: string;
  specs: {
    cpu: string;
    ram: number;
    storage: number;
    gpu: string;
    display: string;
  };
  price: number;
  category: string;
  portability: string;
  badge: { text: string; type: string };
  scores: { [key: string]: number };
}

type TrackOption = 'web_dev' | 'networking' | 'data' | 'general';

const trackLabelMap: Record<TrackOption, string> = {
  web_dev: 'Web Development',
  networking: 'Networking',
  data: 'Data',
  general: 'General',
};

const parseStorageType = (details: string): 'SSD' | 'HDD' =>
  /hdd/i.test(details) ? 'HDD' : 'SSD';

const hasDedicatedGpu = (gpu: string): boolean => /(rtx|gtx|rx|nvidia)/i.test(gpu);

const inferOs = (device: CatalogDevice): SawDevice['os'] =>
  /macbook/i.test(device.name) ? 'macOS' : 'Windows';

const inferBatteryHours = (device: CatalogDevice): number => {
  if (device.type === 'Desktop') return 1;
  if (device.type === 'Tablet') return 11;
  if (device.portability.toLowerCase().includes('light')) return 10;
  if (device.portability.toLowerCase().includes('high performance')) return 6;
  return 8;
};

const inferWeight = (device: CatalogDevice): number => {
  if (device.type === 'Desktop') return 3.5;
  if (device.type === 'Tablet') return 0.7;
  if (device.portability.toLowerCase().includes('light')) return 1.3;
  if (device.portability.toLowerCase().includes('high performance')) return 2.7;
  return 2.1;
};

const toSawDevice = (device: CatalogDevice): SawDevice => {
  const scoreValues = Object.values(device.scores);
  const avgScore =
    scoreValues.length > 0
      ? scoreValues.reduce((sum, value) => sum + value, 0) / scoreValues.length
      : 0;

  return {
    id: String(device.id),
    name: device.name,
    price: device.price,
    ram: device.specs.ram,
    storage: device.specs.storage,
    storage_type: parseStorageType(`${device.specs.cpu} ${device.specs.gpu}`),
    battery_hrs: inferBatteryHours(device),
    weight_kg: inferWeight(device),
    has_dedicated_gpu: hasDedicatedGpu(device.specs.gpu),
    os: inferOs(device),
    track_scores: {
      web_dev: device.scores.web_dev ?? avgScore,
      networking: device.scores.networking ?? avgScore,
      data: device.scores.multimedia ?? avgScore,
      general: avgScore,
    },
  };
};

const Recommend: React.FC = () => {
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({
    track: '' as TrackOption | '',
    budget: 0,
    portability: ''
  });
  const [recommendation, setRecommendation] = useState<CatalogDevice | null>(null);

  const handleTrackSelect = (track: TrackOption) => {
    setSelections({ ...selections, track });
    setStep(2);
  };

  const handleBudgetSelect = (budget: number) => {
    setSelections({ ...selections, budget });
    setStep(3);
  };

  const handlePortabilitySelect = (portability: string) => {
    const finalSelections = { ...selections, portability };
    setSelections(finalSelections);
    calculateRecommendation(finalSelections);
    setStep(4);
  };

  const calculateRecommendation = (finalSelections: typeof selections) => {
    const allDevices = deviceData as CatalogDevice[];
    const sawDevices = allDevices.map(toSawDevice);
    const ranked = rankDevices(sawDevices, {
      budget_max: finalSelections.budget,
      track: finalSelections.track || undefined,
      preferred_os: 'Windows'
    });

    if (ranked.length === 0) {
      const sorted = [...allDevices].sort((a, b) => a.price - b.price);
      setRecommendation(sorted[0]);
      return;
    }

    const topRawDevice = allDevices.find(d => String(d.id) === ranked[0].id);
    setRecommendation(topRawDevice || allDevices[0]);
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
                  <button key={p.label} className={styles.optionBtn} onClick={() => handlePortabilitySelect(p.value)}>
                    <span className={styles.optionIcon}>{p.icon}</span>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && recommendation && (
            <div className={styles.resultContainer}>
              <div className={styles.matchBadge}>98% Match Found</div>
              <h2 className={styles.resultTitle}>Your Perfect Academic Companion</h2>

              <div className={styles.recommendationCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.recImage}>💻</div>
                  <div className={styles.recBasicInfo}>
                    <span className={styles.recBrand}>{recommendation.brand}</span>
                    <h3 className={styles.recName}>{recommendation.name}</h3>
                    <div className={styles.recBadge}>{recommendation.badge.text}</div>
                  </div>
                  <div className={styles.recPrice}>₱{recommendation.price.toLocaleString()}</div>
                </div>

                <div className={styles.recSpecs}>
                  <div className={styles.specItem}><strong>CPU:</strong> {recommendation.specs.cpu}</div>
                  <div className={styles.specItem}><strong>RAM:</strong> {recommendation.specs.ram}GB</div>
                  <div className={styles.specItem}><strong>Storage:</strong> {recommendation.specs.storage}GB SSD</div>
                  <div className={styles.specItem}><strong>Display:</strong> {recommendation.specs.display}</div>
                  <div className={styles.specItem}><strong>GPU:</strong> {recommendation.specs.gpu}</div>
                </div>

                <div className={styles.whyText}>
                  <h4>Why this matches you:</h4>
                  <p>Based on your <strong>{selections.track ? trackLabelMap[selections.track] : 'selected'}</strong> track, this device offers strong fit for required software. Its <strong>{recommendation.portability}</strong> build aligns with your portability preference.</p>
                </div>
                <ScoreBreakdown device={toSawDevice(recommendation)} />

                <div className={styles.actionGroup}>
                  <button className={styles.primaryBtn}>Download Full Report</button>
                  <button className={styles.secondaryBtn} onClick={() => setStep(1)}>Restart Quiz</button>
                </div>
              </div>
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
