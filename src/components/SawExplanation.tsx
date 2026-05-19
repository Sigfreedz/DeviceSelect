import React from 'react';
import styles from '../styles/Guides.module.css';

const SawExplanation: React.FC = () => {
  const handleWhyMatchesClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.history.pushState({}, '', '/recommend');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <section className={styles.sawSection} aria-labelledby="saw-explanation-title">
      <header className={styles.sawHeader}>
        <p className={styles.sawEyebrow}>SAW Scoring Guide</p>
        <h2 id="saw-explanation-title" className={styles.sawTitle}>
          How SAW ranks your device options
        </h2>
        <p className={styles.sawLead}>
          DeviceSelect uses a simple three-step process so your recommendation is easier to audit, not a black box.
        </p>
      </header>

      <ol className={styles.sawSteps}>
        <li className={styles.sawStepItem}>
          <h3>1. Normalize</h3>
          <p>Convert each device value into a comparable 0 to 1 score ({'N'}<sub>i</sub>).</p>
        </li>
        <li className={styles.sawStepItem}>
          <h3>2. Weight</h3>
          <p>Apply importance weights ({'W'}<sub>i</sub>) based on your track, budget, and preference profile.</p>
        </li>
        <li className={styles.sawStepItem}>
          <h3>3. Rank</h3>
          <p>Add weighted values and sort by total score so higher-fit devices appear first.</p>
        </li>
      </ol>

      <div className={styles.sawFormulaBox} role="note" aria-label="SAW formula">
        <p className={styles.sawFormulaLabel}>Core formula</p>
        <p className={styles.sawFormula}>
          Score = Σ({'W'}<sub>i</sub> × {'N'}<sub>i</sub>)
        </p>
      </div>

      <article className={styles.sawExample} aria-labelledby="saw-example-title">
        <h3 id="saw-example-title" className={styles.sawExampleTitle}>
          Concrete example: Web Dev student, ₱50k budget
        </h3>
        <p className={styles.sawExampleText}>
          Suppose one candidate has normalized scores of Price = 0.88, RAM = 0.85, and SSD = 1.00.
        </p>
        <div className={styles.sawExampleGrid}>
          <div className={styles.sawExampleCard}>
            <h4>Weights</h4>
            <ul className={styles.sawMiniList}>
              <li>Price: 0.40</li>
              <li>RAM: 0.35</li>
              <li>SSD: 0.25</li>
            </ul>
          </div>
          <div className={styles.sawExampleCard}>
            <h4>Computation</h4>
            <p className={styles.sawCalc}>
              (0.40 × 0.88) + (0.35 × 0.85) + (0.25 × 1.00) = 0.90
            </p>
          </div>
        </div>
      </article>

      <p className={styles.sawTransparency}>
        Transparency note: open{' '}
        <a href="/recommend" onClick={handleWhyMatchesClick}>
          Why this matches you
        </a>{' '}
        in the recommendation result to see how weighted factors contribute to your final pick.
      </p>
    </section>
  );
};

export default SawExplanation;
