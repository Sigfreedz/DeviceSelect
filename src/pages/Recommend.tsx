import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import deviceData from '../data/devices.json';
import styles from '../styles/Recommend.module.css';

interface Device {
  id: number;
  name: string;
  brand: string;
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

const Recommend: React.FC = () => {
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({
    track: '',
    budget: 0,
    portability: ''
  });
  const [recommendation, setRecommendation] = useState<Device | null>(null);

  const handleTrackSelect = (track: string) => {
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
    const filtered = (deviceData as Device[]).filter(d => d.price <= finalSelections.budget);
    
    if (filtered.length === 0) {
      // Fallback to closest budget if none found
      const sorted = (deviceData as Device[]).sort((a, b) => a.price - b.price);
      setRecommendation(sorted[0]);
      return;
    }

    // Quantitative Scoring: Sort by track score
    const trackKey = finalSelections.track.toLowerCase().replace(' ', '_');
    const sorted = filtered.sort((a, b) => {
      const scoreA = a.scores[trackKey] || 0;
      const scoreB = b.scores[trackKey] || 0;
      return scoreB - scoreA;
    });

    setRecommendation(sorted[0]);
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
                {['Web Development', 'Networking', 'Multimedia', 'Cybersecurity'].map(t => (
                  <button key={t} className={styles.optionBtn} onClick={() => handleTrackSelect(t)}>
                    <span className={styles.optionIcon}>{t === 'Web Development' ? '🌐' : t === 'Networking' ? '📡' : t === 'Multimedia' ? '🎨' : '🛡️'}</span>
                    {t}
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
                  <p>Based on your <strong>{selections.track}</strong> track, this device offers optimal performance for required software. Its <strong>{recommendation.portability}</strong> build aligns with your portability preference.</p>
                </div>

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
