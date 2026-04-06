import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import styles from '../styles/Guides.module.css';

const navigate = (path: string) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

const Guides: React.FC = () => {
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    workload: false,
    budget: false,
    portability: false,
    specs: false,
    warranty: false,
    future: false,
  });

  const toggleCheck = (key: string) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const checklistItems: { key: string; label: string }[] = [
    { key: 'workload', label: 'I have identified my primary workloads (programming, networking labs, multimedia, etc.)' },
    { key: 'budget', label: 'I have set a realistic budget range for my device' },
    { key: 'portability', label: 'I know whether I prioritize portability or raw performance' },
    { key: 'specs', label: 'I verified the baseline specs meet my track requirements (CPU, RAM, storage)' },
    { key: 'warranty', label: 'I checked the warranty and after-sales support available locally' },
    { key: 'future', label: 'I considered future-proofing (at least 2–3 years of academic use)' },
  ];

  const checkedCount = Object.values(checklist).filter(Boolean).length;

  return (
    <div className="app-container">
      <Navbar />
      <main className={styles.main}>

        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>Student Guide</span>
            <h1 className={styles.heroTitle}>How to Choose the Right Device for Your Studies</h1>
            <p className={styles.heroSubtitle}>
              A practical guide for BSIT students at PLV — learn what specs actually matter for
              your track, how to match your budget, and what mistakes to avoid.
            </p>
            <div className={styles.ctaRow}>
              <button className={styles.ctaPrimary} onClick={() => navigate('/recommend')}>
                Get a Recommendation
              </button>
              <button className={styles.ctaSecondary} onClick={() => navigate('/top-devices')}>
                Browse Top Devices
              </button>
            </div>
          </div>
        </section>

        <div className={styles.content}>

          {/* Section 1: Workloads */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>💻</span>
              <h2 className={styles.sectionTitle}>Understanding Your Workloads</h2>
            </div>
            <p className={styles.sectionIntro}>
              Your BSIT track shapes which tasks you'll run most. Each track stresses different
              hardware components — know yours before buying.
            </p>
            <div className={styles.workloadGrid}>
              <div className={styles.workloadCard}>
                <div className={styles.workloadIcon}>⌨️</div>
                <h3>Web & Software Development</h3>
                <p>Running IDEs (VS Code, Android Studio), local servers, multiple browser tabs, and build tools. CPU single-core speed and RAM are critical. 16 GB RAM is the sweet spot.</p>
                <div className={styles.workloadTags}>
                  <span className={styles.tag}>CPU-heavy</span>
                  <span className={styles.tag}>RAM-hungry</span>
                  <span className={styles.tag}>Fast SSD</span>
                </div>
              </div>
              <div className={styles.workloadCard}>
                <div className={styles.workloadIcon}>🌐</div>
                <h3>Networking & Infrastructure Labs</h3>
                <p>Running virtual machines (VirtualBox, VMware), GNS3 network simulations, and packet tracers simultaneously. RAM and multi-core CPU matter most here — 16 GB+ RAM strongly recommended.</p>
                <div className={styles.workloadTags}>
                  <span className={styles.tag}>Multi-core</span>
                  <span className={styles.tag}>16 GB+ RAM</span>
                  <span className={styles.tag}>Virtualization</span>
                </div>
              </div>
              <div className={styles.workloadCard}>
                <div className={styles.workloadIcon}>🎨</div>
                <h3>Multimedia & Design</h3>
                <p>Video editing (DaVinci Resolve, Premiere Pro), graphic design (Photoshop, Illustrator), and 3D modeling (Blender). Needs a capable GPU, a color-accurate display, and fast storage for large project files.</p>
                <div className={styles.workloadTags}>
                  <span className={styles.tag}>GPU matters</span>
                  <span className={styles.tag}>Display quality</span>
                  <span className={styles.tag}>Large storage</span>
                </div>
              </div>
              <div className={styles.workloadCard}>
                <div className={styles.workloadIcon}>🔒</div>
                <h3>Cybersecurity & Ethical Hacking</h3>
                <p>Running Kali Linux (dual-boot or VM), Wireshark, Metasploit, and other security tools. Needs solid CPU performance, ample RAM for VMs, and a good amount of storage.</p>
                <div className={styles.workloadTags}>
                  <span className={styles.tag}>VM support</span>
                  <span className={styles.tag}>CPU + RAM</span>
                  <span className={styles.tag}>Dual-boot ready</span>
                </div>
              </div>
              <div className={styles.workloadCard}>
                <div className={styles.workloadIcon}>📚</div>
                <h3>General Productivity</h3>
                <p>Attending online classes, writing reports, browsing the web, and using cloud tools (Google Workspace, MS Office). Any modern mid-range device handles this well. Focus on battery life and portability.</p>
                <div className={styles.workloadTags}>
                  <span className={styles.tag}>Battery life</span>
                  <span className={styles.tag}>Lightweight</span>
                  <span className={styles.tag}>Any modern CPU</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Baseline Specs */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>📋</span>
              <h2 className={styles.sectionTitle}>Recommended Baseline Specs</h2>
            </div>
            <p className={styles.sectionIntro}>
              These are the minimum and recommended specifications for a BSIT student's device in 2025–2026.
            </p>
            <div className={styles.specsTable}>
              <div className={styles.specsHeader}>
                <div className={styles.specsCol}>Component</div>
                <div className={styles.specsCol}>Minimum</div>
                <div className={styles.specsCol}>Recommended</div>
                <div className={styles.specsCol}>Why It Matters</div>
              </div>
              <div className={styles.specsRow}>
                <div className={styles.specsCol}><strong>CPU</strong></div>
                <div className={styles.specsCol}>Intel Core i5 / Ryzen 5 (8th gen+)</div>
                <div className={styles.specsCol}>Intel Core i5/i7 12th gen+ or Ryzen 5/7 5000+</div>
                <div className={styles.specsCol}>Faster compilation, smoother VMs, better multitasking</div>
              </div>
              <div className={styles.specsRow}>
                <div className={styles.specsCol}><strong>RAM</strong></div>
                <div className={styles.specsCol}>8 GB</div>
                <div className={styles.specsCol}>16 GB (32 GB for Networking/Cybersecurity)</div>
                <div className={styles.specsCol}>Running multiple apps/VMs simultaneously without slowdowns</div>
              </div>
              <div className={styles.specsRow}>
                <div className={styles.specsCol}><strong>Storage</strong></div>
                <div className={styles.specsCol}>256 GB SSD</div>
                <div className={styles.specsCol}>512 GB SSD (1 TB for Multimedia)</div>
                <div className={styles.specsCol}>SSD dramatically speeds up boot, app launch, and builds vs HDD</div>
              </div>
              <div className={styles.specsRow}>
                <div className={styles.specsCol}><strong>GPU</strong></div>
                <div className={styles.specsCol}>Integrated graphics</div>
                <div className={styles.specsCol}>Dedicated GPU (Multimedia / Game Dev tracks)</div>
                <div className={styles.specsCol}>Required for 3D rendering, video export acceleration, ML tasks</div>
              </div>
              <div className={styles.specsRow}>
                <div className={styles.specsCol}><strong>Display</strong></div>
                <div className={styles.specsCol}>1080p (1920×1080)</div>
                <div className={styles.specsCol}>1080p IPS / 1440p (Multimedia: color-accurate panel)</div>
                <div className={styles.specsCol}>Comfortable for long coding sessions and design work</div>
              </div>
              <div className={styles.specsRow}>
                <div className={styles.specsCol}><strong>Battery</strong></div>
                <div className={styles.specsCol}>6 hours real-world</div>
                <div className={styles.specsCol}>8–10+ hours (all-day campus use)</div>
                <div className={styles.specsCol}>Avoids depending on power outlets during long school days</div>
              </div>
            </div>
          </section>

          {/* Section 3: Budget Tiers */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>💰</span>
              <h2 className={styles.sectionTitle}>Budget Tiers</h2>
            </div>
            <p className={styles.sectionIntro}>
              Here's what to expect at each price point, aligned with the ranges used in DeviceSelect.
            </p>
            <div className={styles.budgetGrid}>
              <div className={styles.budgetCard}>
                <div className={styles.budgetBadge} style={{ background: '#374151' }}>Entry</div>
                <div className={styles.budgetPrice}>Under ₱30,000</div>
                <div className={styles.budgetDesc}>
                  <p>Best for general productivity and light coding. Expect older-gen processors, 8 GB RAM, and 256 GB storage. Good for 1st–2nd year coursework.</p>
                  <ul className={styles.budgetList}>
                    <li>✅ Word processing, spreadsheets, online classes</li>
                    <li>✅ Light coding (HTML, CSS, Python scripts)</li>
                    <li>❌ Running VMs or video editing</li>
                    <li>❌ Multiple heavy apps simultaneously</li>
                  </ul>
                </div>
              </div>
              <div className={styles.budgetCard}>
                <div className={styles.budgetBadge} style={{ background: '#1d4ed8' }}>Mid-Range</div>
                <div className={styles.budgetPrice}>₱30,000 – ₱50,000</div>
                <div className={styles.budgetDesc}>
                  <p>The sweet spot for most BSIT students. Modern processors, 8–16 GB RAM, 512 GB SSD. Handles most tracks comfortably.</p>
                  <ul className={styles.budgetList}>
                    <li>✅ Full-stack development with IDEs</li>
                    <li>✅ Light VM use (1–2 VMs)</li>
                    <li>✅ Graphic design basics</li>
                    <li>❌ Heavy simultaneous VMs (Networking labs)</li>
                  </ul>
                </div>
              </div>
              <div className={styles.budgetCard}>
                <div className={styles.budgetBadge} style={{ background: '#047857' }}>High-End</div>
                <div className={styles.budgetPrice}>₱50,000 – ₱80,000</div>
                <div className={styles.budgetDesc}>
                  <p>For demanding tracks. 16–32 GB RAM, dedicated GPU options, fast processors. Networking and Cybersecurity students will appreciate the extra headroom.</p>
                  <ul className={styles.budgetList}>
                    <li>✅ Running multiple VMs (GNS3, VMware)</li>
                    <li>✅ Video editing and rendering</li>
                    <li>✅ Complex security tool setups</li>
                    <li>✅ Future-proof for 3–4 years</li>
                  </ul>
                </div>
              </div>
              <div className={styles.budgetCard}>
                <div className={styles.budgetBadge} style={{ background: '#7c3aed' }}>Premium</div>
                <div className={styles.budgetPrice}>₱80,000+</div>
                <div className={styles.budgetDesc}>
                  <p>Professional-grade workstations and premium thin-and-lights. Overkill for most coursework, but ideal for students doing freelance work or advanced research.</p>
                  <ul className={styles.budgetList}>
                    <li>✅ 4K video production</li>
                    <li>✅ 3D modeling and rendering</li>
                    <li>✅ Machine learning experiments</li>
                    <li>✅ Maximum portability + performance</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Portability vs Performance */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>⚖️</span>
              <h2 className={styles.sectionTitle}>Portability vs. Performance</h2>
            </div>
            <p className={styles.sectionIntro}>
              This is the most common trade-off students face. There's no universal right answer —
              it depends on your lifestyle and track.
            </p>
            <div className={styles.tradeoffGrid}>
              <div className={styles.tradeoffCard}>
                <h3 className={styles.tradeoffTitle}>🎒 Prioritize Portability If…</h3>
                <ul className={styles.tradeoffList}>
                  <li>You commute long distances daily and carry your device everywhere</li>
                  <li>You attend back-to-back classes without access to power outlets</li>
                  <li>Your track is mainly Web Dev or General Productivity</li>
                  <li>You value a device under 1.5 kg with 8–10 hour battery life</li>
                  <li>You can supplement with a cloud or desktop machine at home</li>
                </ul>
                <div className={styles.tradeoffNote}>
                  💡 Look for ultrabooks and thin-and-lights: Dell XPS, Lenovo ThinkPad X1, ASUS ZenBook series.
                </div>
              </div>
              <div className={styles.tradeoffCard}>
                <h3 className={styles.tradeoffTitle}>🖥️ Prioritize Performance If…</h3>
                <ul className={styles.tradeoffList}>
                  <li>Your track is Networking, Cybersecurity, or Multimedia</li>
                  <li>You frequently run virtual machines or render video</li>
                  <li>You mainly use the device at home or in a lab setting</li>
                  <li>You want maximum specs per peso (heavier = cheaper per spec)</li>
                  <li>You have access to charging throughout the day</li>
                </ul>
                <div className={styles.tradeoffNote}>
                  💡 Look for performance laptops: ASUS ROG Zephyrus, Lenovo Legion, HP Omen, or a desktop workstation.
                </div>
              </div>
            </div>
            <div className={styles.tradeoffTip}>
              <strong>Balanced option:</strong> Mid-weight laptops (1.6–2 kg) in the ₱40k–₱60k range
              (e.g., ASUS VivoBook 16, Lenovo IdeaPad 5, HP Envy) hit a solid middle ground for most BSIT students.
            </div>
          </section>

          {/* Section 5: Pitfalls & Tips */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>⚠️</span>
              <h2 className={styles.sectionTitle}>Common Pitfalls & Buying Tips</h2>
            </div>
            <div className={styles.pitfallsGrid}>
              <div className={styles.pitfallCard}>
                <div className={styles.pitfallIcon}>🚫</div>
                <h3>Don't buy a device with only 8 GB soldered RAM if you plan to use VMs</h3>
                <p>Many budget ultrabooks have RAM soldered to the motherboard with no upgrade path. If your track involves virtualization, non-upgradeable 8 GB will bottleneck you within a year.</p>
              </div>
              <div className={styles.pitfallCard}>
                <div className={styles.pitfallIcon}>🚫</div>
                <h3>Avoid HDD-only laptops for primary storage</h3>
                <p>An SSD makes a bigger real-world difference than CPU generation. A Ryzen 5 with an SSD will always feel faster than a Core i7 with an HDD for typical student workloads.</p>
              </div>
              <div className={styles.pitfallCard}>
                <div className={styles.pitfallIcon}>🚫</div>
                <h3>Don't over-invest in GPU if you're not in Multimedia or Game Dev</h3>
                <p>A dedicated GPU adds cost and reduces battery life. For Web Dev, Networking, and most Cybersecurity work, integrated graphics (AMD Radeon or Intel Iris Xe) is completely sufficient.</p>
              </div>
              <div className={styles.pitfallCard}>
                <div className={styles.pitfallIcon}>🚫</div>
                <h3>Beware of "refurbished" devices without warranty</h3>
                <p>Buying second-hand can save money, but ensure the seller provides at least a 3-month warranty. Battery degradation in used laptops is a common hidden cost.</p>
              </div>
              <div className={styles.pitfallCard}>
                <div className={styles.pitfallIcon}>💡</div>
                <h3>Always check local after-sales support</h3>
                <p>A brand with a service center in your city is much safer than a gray-market import. Check if the vendor has an authorized repair center near PLV or in Metro Manila.</p>
              </div>
              <div className={styles.pitfallCard}>
                <div className={styles.pitfallIcon}>💡</div>
                <h3>Consider buying during sale seasons</h3>
                <p>Back-to-school (June–July), 11.11, 12.12, and year-end sales on Lazada/Shopee often offer 10–20% discounts. Plan your purchase around these if your timeline allows.</p>
              </div>
            </div>
          </section>

          {/* Section 6: Decision Checklist */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>✅</span>
              <h2 className={styles.sectionTitle}>Your Decision Checklist</h2>
            </div>
            <p className={styles.sectionIntro}>
              Before making your purchase, make sure you can check off all of these:
            </p>
            <div className={styles.checklistContainer}>
              <div className={styles.checklistProgress}>
                <div
                  className={styles.checklistProgressBar}
                  style={{ width: `${(checkedCount / checklistItems.length) * 100}%` }}
                />
              </div>
              <p className={styles.checklistProgressText}>{checkedCount} of {checklistItems.length} completed</p>
              <ul className={styles.checklist}>
                {checklistItems.map(item => (
                  <li
                    key={item.key}
                    className={`${styles.checklistItem} ${checklist[item.key] ? styles.checked : ''}`}
                    onClick={() => toggleCheck(item.key)}
                  >
                    <span className={styles.checkboxIcon}>{checklist[item.key] ? '☑' : '☐'}</span>
                    <span className={styles.checklistLabel}>{item.label}</span>
                  </li>
                ))}
              </ul>
              {checkedCount === checklistItems.length && (
                <div className={styles.checklistComplete}>
                  🎉 You're ready to pick your device! Use our tools below to find the best match.
                </div>
              )}
            </div>
          </section>

          {/* CTA Section */}
          <section className={styles.ctaSection}>
            <h2 className={styles.ctaSectionTitle}>Ready to Find Your Device?</h2>
            <p className={styles.ctaSectionSubtitle}>
              Use DeviceSelect's tools to narrow down the perfect device for your track and budget.
            </p>
            <div className={styles.ctaCards}>
              <div className={styles.ctaCard} onClick={() => navigate('/recommend')}>
                <div className={styles.ctaCardIcon}>🎯</div>
                <h3>Get a Recommendation</h3>
                <p>Answer 3 quick questions and get a personalized device match.</p>
                <button className={styles.ctaCardBtn}>Start Wizard →</button>
              </div>
              <div className={styles.ctaCard} onClick={() => navigate('/top-devices')}>
                <div className={styles.ctaCardIcon}>📱</div>
                <h3>Browse Top Devices</h3>
                <p>Filter by budget, specialization, and portability to explore options.</p>
                <button className={styles.ctaCardBtn}>Browse Devices →</button>
              </div>
              <div className={styles.ctaCard} onClick={() => navigate('/compare')}>
                <div className={styles.ctaCardIcon}>🔍</div>
                <h3>Compare Devices</h3>
                <p>Put two or three devices side-by-side to see which wins for your needs.</p>
                <button className={styles.ctaCardBtn}>Compare Now →</button>
              </div>
            </div>
          </section>

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

export default Guides;
