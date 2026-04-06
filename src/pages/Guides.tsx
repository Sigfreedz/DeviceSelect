import React from 'react';
import Navbar from '../components/Navbar';
import styles from '../styles/Guides.module.css';

const Guides: React.FC = () => {
  const navigate = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className={styles.main}>
      <Navbar />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.badge}>📚 BSIT Academic Companion</span>
          <h1 className={styles.heroTitle}>
            How to Choose the{' '}
            <span className={styles.gradientText}>Right Device</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Step-by-step tutorials to help you pick hardware that matches your
            actual BSIT workloads — no overspending, no underpowering.
          </p>
          <div className={styles.heroCtas}>
            <a href="/recommend" onClick={navigate('/recommend')} className={styles.primaryBtn}>
              🎯 Get a Recommendation
            </a>
            <a href="/top-devices" onClick={navigate('/top-devices')} className={styles.secondaryBtn}>
              💻 Browse Top Devices
            </a>
            <a href="/compare" onClick={navigate('/compare')} className={styles.secondaryBtn}>
              ⚖️ Compare Devices
            </a>
          </div>
        </div>
      </section>

      <div className={styles.content}>

        {/* Decision Flow */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🗺️ Start Here: Your Decision Flow</h2>
          <p className={styles.sectionSubtitle}>
            Follow these five steps before you buy anything.
          </p>
          <div className={styles.stepsRow}>
            {[
              { num: '1', icon: '🎓', label: 'Identify your track', desc: 'Know your BSIT specialization (Web Dev, Networking, Multimedia, Cybersecurity).' },
              { num: '2', icon: '💰', label: 'Set a budget tier', desc: 'Decide entry (₱30k), mid (₱50k), high (₱80k), or premium (₱120k+).' },
              { num: '3', icon: '⚖️', label: 'Portability vs power', desc: 'Will you carry it daily or mostly work at a desk?' },
              { num: '4', icon: '🔧', label: 'Match specs to tasks', desc: 'Map CPU, RAM, storage, and GPU needs to your real workload.' },
              { num: '5', icon: '✅', label: 'Validate & buy', desc: 'Use the Compare page to check your final shortlist side-by-side.' },
            ].map((step) => (
              <div key={step.num} className={styles.stepCard}>
                <div className={styles.stepNum}>{step.num}</div>
                <div className={styles.stepIcon}>{step.icon}</div>
                <h3 className={styles.stepLabel}>{step.label}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Workloads */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🖥️ Workload Guides by Track</h2>
          <p className={styles.sectionSubtitle}>
            Each BSIT track has different demands. Find yours below.
          </p>
          <div className={styles.cardGrid}>
            {[
              {
                icon: '💻',
                track: 'Programming / Web Dev',
                color: '#8b5cf6',
                tasks: 'IDEs, local servers, browser testing, Git, Docker',
                priorities: 'CPU speed · RAM · fast SSD',
                minSpecs: '8-core CPU · 16 GB RAM · 512 GB SSD',
                comfySpecs: '10-core CPU · 32 GB RAM · 1 TB NVMe SSD',
                tip: 'More RAM = smoother browser + IDE + Docker at the same time.',
              },
              {
                icon: '🌐',
                track: 'Networking / Virtualization',
                color: '#f59e0b',
                tasks: 'VMs (GNS3, VirtualBox), Wireshark, packet analysis',
                priorities: 'RAM (most critical) · CPU cores · SSD',
                minSpecs: '8-core CPU · 16 GB RAM · 512 GB SSD',
                comfySpecs: '12-core CPU · 32 GB RAM · 1 TB SSD',
                tip: 'Running 3+ VMs simultaneously demands 32 GB. 16 GB is the hard floor.',
              },
              {
                icon: '🛡️',
                track: 'Cybersecurity',
                color: '#ef4444',
                tasks: 'Kali Linux VMs, security tools, pen-test labs',
                priorities: 'RAM · CPU cores · SSD speed',
                minSpecs: '8-core CPU · 16 GB RAM · 512 GB SSD',
                comfySpecs: '12-core CPU · 32 GB RAM · dual-drive setup',
                tip: 'You will run VMs alongside the host OS — plan your RAM accordingly.',
              },
              {
                icon: '🎨',
                track: 'Multimedia / Design',
                color: '#10b981',
                tasks: 'Photoshop, Premiere, Blender, After Effects',
                priorities: 'GPU · CPU · RAM · display quality',
                minSpecs: 'Quad-core CPU · dedicated GPU · 16 GB RAM · 512 GB SSD',
                comfySpecs: '10-core CPU · 6 GB+ GPU · 32 GB RAM · color-accurate display',
                tip: 'A dedicated GPU matters here more than for any other track.',
              },
              {
                icon: '📋',
                track: 'General BSIT / Productivity',
                color: '#3b82f6',
                tasks: 'Office apps, research, light coding, online classes',
                priorities: 'Battery life · weight · balanced CPU',
                minSpecs: 'Quad-core CPU · 8 GB RAM · 256 GB SSD',
                comfySpecs: 'Hexa-core CPU · 16 GB RAM · 512 GB SSD',
                tip: 'Do not buy an 8 GB device if you plan to upgrade your specialization later.',
              },
            ].map((card) => (
              <div key={card.track} className={styles.workloadCard}>
                <div className={styles.workloadHeader} style={{ borderColor: card.color }}>
                  <span className={styles.workloadIcon}>{card.icon}</span>
                  <h3 className={styles.workloadTrack}>{card.track}</h3>
                </div>
                <div className={styles.workloadBody}>
                  <p className={styles.workloadRow}><span className={styles.label}>What you run:</span> {card.tasks}</p>
                  <p className={styles.workloadRow}><span className={styles.label}>Priorities:</span> {card.priorities}</p>
                  <p className={styles.workloadRow}><span className={styles.label}>Minimum:</span> {card.minSpecs}</p>
                  <p className={styles.workloadRow}><span className={styles.label}>Comfortable:</span> {card.comfySpecs}</p>
                  <div className={styles.tipBox}>💡 {card.tip}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Spec Cheat Sheet */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🔩 Spec Cheat Sheet</h2>
          <p className={styles.sectionSubtitle}>
            What each component does and what to aim for as a BSIT student.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.specTable}>
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Minimum</th>
                  <th>Recommended</th>
                  <th>Why it matters</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { comp: '⚙️ CPU', min: 'Quad-core (8th gen+)', rec: '8–12 core (12th/13th gen)', why: 'Handles compiling, VMs, and multitasking.' },
                  { comp: '🧠 RAM', min: '8 GB', rec: '16–32 GB', why: '16 GB is the baseline for any VM or dev work. 8 GB will bottleneck you fast.' },
                  { comp: '💾 Storage', min: '256 GB SSD', rec: '512 GB NVMe SSD', why: 'SSD only — HDD is too slow for dev tools and OS snapshots.' },
                  { comp: '🎮 GPU', min: 'Integrated (Intel/AMD)', rec: 'Dedicated 4–6 GB (Multimedia/3D)', why: 'Integrated is fine unless you do Blender, video editing, or ML.' },
                  { comp: '🖥️ Display', min: '1080p 13–14"', rec: '1080p/1440p 14–16"', why: 'Bigger = more code visible. 1080p minimum; no 768p screens.' },
                  { comp: '🔋 Battery', min: '6 hours', rec: '8–12 hours', why: 'Critical if you commute or attend long on-campus sessions.' },
                  { comp: '🔌 Ports', min: 'USB-A × 2, HDMI', rec: '+ USB-C, SD card, ethernet (or dongle)', why: 'Labs often need wired networking and external displays.' },
                ].map((row) => (
                  <tr key={row.comp}>
                    <td className={styles.compCell}>{row.comp}</td>
                    <td>{row.min}</td>
                    <td className={styles.recCell}>{row.rec}</td>
                    <td className={styles.whyCell}>{row.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Budget Tiers */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>💰 Budget Tier Guide</h2>
          <p className={styles.sectionSubtitle}>
            Know what you are getting — and giving up — at each price point.
          </p>
          <div className={styles.budgetGrid}>
            {[
              {
                tier: 'Entry',
                price: '~₱30,000',
                color: '#64748b',
                bestFor: 'General productivity, light coding, online classes',
                expect: 'Quad-core CPU, 8 GB RAM, 256–512 GB SSD, integrated GPU',
                warnings: 'Avoid if you plan to run VMs or heavy design tools. May feel slow after 2 years.',
              },
              {
                tier: 'Mid-Range',
                price: '~₱50,000',
                color: '#10b981',
                bestFor: '✨ Sweet spot — covers most BSIT tracks comfortably',
                expect: 'Hexa/octa-core CPU, 16 GB RAM, 512 GB SSD, optional dedicated GPU',
                warnings: 'Best value for most students. Covers Web Dev, Networking, and Cybersecurity.',
              },
              {
                tier: 'High-End',
                price: '~₱80,000',
                color: '#8b5cf6',
                bestFor: 'Multimedia, heavy virtualization, future-proofing',
                expect: '10–12 core CPU, 16–32 GB RAM, 1 TB NVMe SSD, dedicated GPU',
                warnings: 'Worth it if you plan to stay on the same device for 4+ years.',
              },
              {
                tier: 'Premium',
                price: '₱120,000+',
                color: '#f59e0b',
                bestFor: 'Pro multimedia, deep ML/AI work, maxed-out virtualization',
                expect: 'Top-tier CPU, 32 GB+ RAM, large NVMe SSD, high-end GPU',
                warnings: 'Only buy if your specific coursework genuinely demands it.',
              },
            ].map((tier) => (
              <div key={tier.tier} className={styles.budgetCard} style={{ borderTopColor: tier.color }}>
                <div className={styles.budgetHeader}>
                  <span className={styles.budgetTier}>{tier.tier}</span>
                  <span className={styles.budgetPrice} style={{ color: tier.color }}>{tier.price}</span>
                </div>
                <p className={styles.budgetBestFor}>{tier.bestFor}</p>
                <p className={styles.budgetExpect}><span className={styles.label}>What to expect:</span> {tier.expect}</p>
                <div className={styles.budgetWarn}>⚠️ {tier.warnings}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Portability vs Performance */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🎒 Portability vs Performance</h2>
          <p className={styles.sectionSubtitle}>
            Pick the profile that fits your daily routine.
          </p>
          <div className={styles.portGrid}>
            {[
              {
                icon: '🪶',
                title: 'Lightweight',
                subtitle: 'Battery · carry · everyday commute',
                color: '#3b82f6',
                points: [
                  'Under 1.5 kg, thin chassis',
                  '10+ hour battery',
                  'Best for commuters & campus use',
                  'Trade-off: less raw power',
                ],
                choose: 'Choose this if you travel daily and prioritize battery life over heavy tasks.',
              },
              {
                icon: '⚖️',
                title: 'Balanced',
                subtitle: 'Power · battery · everyday carry',
                color: '#8b5cf6',
                points: [
                  '1.5–2 kg, moderate thickness',
                  '6–9 hour battery',
                  'Handles most BSIT workloads',
                  'Best all-rounder for students',
                ],
                choose: 'Choose this if you want a single device that does everything reasonably well.',
              },
              {
                icon: '🔥',
                title: 'High Performance',
                subtitle: 'Power · specs · desk use',
                color: '#ef4444',
                points: [
                  '2 kg+, larger form factor',
                  '4–6 hour battery under load',
                  'Maximum CPU/GPU headroom',
                  'Ideal for Multimedia & heavy VMs',
                ],
                choose: 'Choose this if your device mostly stays on a desk and raw performance matters more.',
              },
            ].map((p) => (
              <div key={p.title} className={styles.portCard} style={{ borderTopColor: p.color }}>
                <div className={styles.portIcon}>{p.icon}</div>
                <h3 className={styles.portTitle}>{p.title}</h3>
                <p className={styles.portSubtitle}>{p.subtitle}</p>
                <ul className={styles.portList}>
                  {p.points.map((pt) => <li key={pt}>{pt}</li>)}
                </ul>
                <div className={styles.portChoose}>{p.choose}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Common Pitfalls */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>⚠️ Common Pitfalls</h2>
          <p className={styles.sectionSubtitle}>
            Mistakes BSIT students frequently make — avoid these.
          </p>
          <div className={styles.pitfallGrid}>
            {[
              { icon: '🚫', text: "Don't buy 8 GB RAM if you plan to run VMs or heavy dev tools — you'll hit the ceiling within a semester." },
              { icon: '💿', text: 'Avoid HDD-only systems. A slow drive will throttle your entire workflow regardless of CPU or RAM.' },
              { icon: '🔒', text: 'Beware soldered/non-upgradable RAM. If 8 GB is soldered and you can\'t upgrade, you\'re stuck.' },
              { icon: '🎮', text: 'A gaming laptop ≠ always the best choice. Gaming chassis are often heavy, loud, and have poor battery life for class.' },
              { icon: '🏷️', text: "Don't pay for a premium brand name alone. Verify the actual specs — a ₱50k device can outperform a ₱80k one with the right specs." },
              { icon: '🔌', text: 'Check port selection before buying. Missing USB-A or HDMI in lab environments is a real problem.' },
              { icon: '🛠️', text: 'Confirm local warranty and service availability. A device with no local service center is a risk.' },
            ].map((p, i) => (
              <div key={i} className={styles.pitfallCard}>
                <span className={styles.pitfallIcon}>{p.icon}</span>
                <p className={styles.pitfallText}>{p.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Buying Checklist */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>✅ Pre-Purchase Checklist</h2>
          <p className={styles.sectionSubtitle}>
            Run through this list before you swipe your card.
          </p>
          <div className={styles.checklistBox}>
            {[
              'Confirmed required software list for your BSIT track',
              'Minimum specs met (RAM, CPU, SSD)',
              'Comfortable specs reached if budget allows',
              'Portability profile chosen based on your daily routine',
              'Upgrade path considered (RAM slots, SSD slots)',
              'Warranty and local service center verified',
              'Budget accounts for accessories (mouse, external storage, case)',
              'Compared at least 2–3 devices side-by-side',
              'Read user reviews for long-term reliability',
              'Battery life tested or reviewed under real-use conditions',
            ].map((item, i) => (
              <label key={i} className={styles.checkItem}>
                <input type="checkbox" className={styles.checkbox} />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Bottom CTAs */}
        <section className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>Ready to find your device?</h2>
          <p className={styles.ctaSubtitle}>Use our tools to put this guide into action.</p>
          <div className={styles.ctaButtons}>
            <a href="/recommend" onClick={navigate('/recommend')} className={styles.primaryBtn}>
              🎯 Get a Recommendation
            </a>
            <a href="/top-devices" onClick={navigate('/top-devices')} className={styles.secondaryBtn}>
              💻 Browse Top Devices
            </a>
            <a href="/compare" onClick={navigate('/compare')} className={styles.secondaryBtn}>
              ⚖️ Compare Devices
            </a>
          </div>
        </section>

      </div>

      <footer>
        <div className="footer-content">
          <p>&copy; 2026 Web-Based Device Selection Platform for IT Students. All rights reserved.</p>
          <p>Designed for BSIT Academic Excellence.</p>
        </div>
      </footer>
    </div>
  );
};

export default Guides;
