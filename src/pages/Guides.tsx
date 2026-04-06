import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import styles from '../styles/Guides.module.css';

/* ─── Types ─────────────────────────────────────────────────────────── */
interface Tutorial {
  id: number;
  icon: string;
  title: string;
  summary: string;
  content: React.ReactNode;
}

/* ─── CTA helper ─────────────────────────────────────────────────────── */
const navigate = (path: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

/* ─── Tutorial content ───────────────────────────────────────────────── */
const tutorials: Tutorial[] = [
  /* ── 1. Step-by-step decision flow ── */
  {
    id: 1,
    icon: '🗺️',
    title: 'Step-by-Step: How to Choose the Right Device',
    summary: 'A 5-step decision process — from identifying your workload to validating specs before you buy.',
    content: (
      <>
        <p className={styles.tutorialIntro}>
          Before opening any product listing, follow these five steps in order.
          Skipping ahead is the most common reason students end up with a device that
          underperforms by the second year of their program.
        </p>

        <ul className={styles.stepList}>
          <li>
            <span className={styles.stepNum}>1</span>
            <div>
              <strong>Identify your primary workload</strong>
              What does your BSIT track actually require you to run? Programming involves
              a code editor + browser + localhost server. Networking involves multiple VMs.
              Cybersecurity involves forensic tools and packet analyzers. Multimedia involves
              video/audio editors. Answer this before looking at specs — workload determines
              everything else.
            </div>
          </li>
          <li>
            <span className={styles.stepNum}>2</span>
            <div>
              <strong>Set a realistic budget ceiling</strong>
              Decide your maximum spend before browsing. The app uses four tiers:
              ₱30k (entry), ₱50k (mid), ₱80k (high), ₱120k+ (premium). Be honest
              about what you can afford — it's better to buy a well-configured mid-range
              device than a stripped premium one.
            </div>
          </li>
          <li>
            <span className={styles.stepNum}>3</span>
            <div>
              <strong>Choose portability vs. performance</strong>
              Will you carry this device every day across campus? If yes, weight and battery
              life matter. If it stays mostly on a desk or lab, you can trade those for more
              RAM and a larger display. There's a real trade-off — thin-and-light laptops
              sacrifice sustained performance under load.
            </div>
          </li>
          <li>
            <span className={styles.stepNum}>4</span>
            <div>
              <strong>Match specs to your workload minimums</strong>
              Use the Workloads → Specs guide (Tutorial 2 below) to verify that your
              shortlisted device meets the minimums for your track. Pay attention to RAM and
              CPU generation — these are the two specs that age fastest over a 4-year program.
            </div>
          </li>
          <li>
            <span className={styles.stepNum}>5</span>
            <div>
              <strong>Validate with the Compare page before purchasing</strong>
              Put your top 2–3 candidates side-by-side in the Compare page. Check price,
              RAM, storage, and GPU. Then verify warranty availability in your city.
              A device with no local service center is a risk not worth taking.
            </div>
          </li>
        </ul>

        <p className={styles.tutorialIntro} style={{ marginBottom: 0 }}>
          <strong>Quick tip:</strong> Use the Recommend tool to get a pre-matched suggestion
          based on track, budget, and portability — then use this checklist to confirm it
          before committing.
        </p>
      </>
    ),
  },

  /* ── 2. Workloads → Specs ── */
  {
    id: 2,
    icon: '⚙️',
    title: 'Workloads → Specs: What Your Track Actually Needs',
    summary: 'Maps each BSIT specialization to the hardware components that matter most.',
    content: (
      <>
        <p className={styles.tutorialIntro}>
          Not all BSIT tracks are equal in hardware demand. Use this breakdown to
          understand <strong>why</strong> certain specs matter for your specific courses
          — not just what the minimum numbers are.
        </p>

        <div className={styles.workloadGrid}>
          <div className={styles.workloadCard}>
            <div className={styles.workloadCardIcon}>💻</div>
            <div className={styles.workloadCardTitle}>Programming / Web Dev</div>
            <ul className={styles.workloadCardList}>
              <li>Runs: VS Code / JetBrains IDE, Node.js / Python runtimes, local dev servers (Webpack, Vite), browser DevTools, Docker</li>
              <li><span className={styles.specTag}>CPU</span> Multi-core is key — compilation and hot-reload stress all cores</li>
              <li><span className={styles.specTag}>RAM</span> 16 GB minimum; 32 GB if running Docker containers simultaneously</li>
              <li><span className={styles.specTag}>SSD</span> NVMe SSD required — cold-start times and node_modules I/O are painful on HDDs</li>
              <li><span className={styles.specTag}>GPU</span> Integrated graphics sufficient for most web dev; dedicated GPU only if doing ML locally</li>
            </ul>
          </div>

          <div className={styles.workloadCard}>
            <div className={styles.workloadCardIcon}>🌐</div>
            <div className={styles.workloadCardTitle}>Networking / VM Labs</div>
            <ul className={styles.workloadCardList}>
              <li>Runs: VirtualBox / VMware / Hyper-V with 2–4 simultaneous VMs, Cisco Packet Tracer, Wireshark, GNS3</li>
              <li><span className={styles.specTag}>RAM</span> 32 GB strongly recommended — each VM consumes 2–4 GB, plus host OS overhead</li>
              <li><span className={styles.specTag}>CPU</span> High core count + hardware virtualization support (Intel VT-x / AMD-V) is mandatory</li>
              <li><span className={styles.specTag}>SSD</span> Large SSD (512 GB+) for storing multiple VM disk images</li>
              <li><span className={styles.specTag}>GPU</span> Not critical unless running GPU-accelerated VMs</li>
            </ul>
          </div>

          <div className={styles.workloadCard}>
            <div className={styles.workloadCardIcon}>🛡️</div>
            <div className={styles.workloadCardTitle}>Cybersecurity</div>
            <ul className={styles.workloadCardList}>
              <li>Runs: Kali Linux VM, Metasploit, Wireshark, John the Ripper, Nmap, Burp Suite, CTF toolchains</li>
              <li><span className={styles.specTag}>RAM</span> 16–32 GB — security tools + Kali VM running in parallel demand memory</li>
              <li><span className={styles.specTag}>CPU</span> Strong single-thread + multi-thread performance for cracking tasks</li>
              <li><span className={styles.specTag}>GPU</span> Dedicated GPU accelerates password hash cracking significantly (hashcat)</li>
              <li><span className={styles.specTag}>SSD</span> Fast SSD for VM disk images and large wordlist/dataset storage</li>
            </ul>
          </div>

          <div className={styles.workloadCard}>
            <div className={styles.workloadCardIcon}>🎨</div>
            <div className={styles.workloadCardTitle}>Multimedia / Design</div>
            <ul className={styles.workloadCardList}>
              <li>Runs: Adobe Premiere / DaVinci Resolve, Photoshop / Illustrator, Blender, After Effects</li>
              <li><span className={styles.specTag}>GPU</span> Dedicated GPU is a hard requirement — video encoding and 3D rendering are GPU-bound</li>
              <li><span className={styles.specTag}>RAM</span> 16 GB minimum; 32 GB for Premiere + Photoshop open simultaneously</li>
              <li><span className={styles.specTag}>CPU</span> High single-thread speed matters for real-time preview rendering</li>
              <li><span className={styles.specTag}>Display</span> Color-accurate display (sRGB coverage) is important for design work</li>
            </ul>
          </div>

          <div className={styles.workloadCard}>
            <div className={styles.workloadCardIcon}>📚</div>
            <div className={styles.workloadCardTitle}>General Productivity / BSIT Core</div>
            <ul className={styles.workloadCardList}>
              <li>Runs: Microsoft Office / Google Docs, web browser (10–20 tabs), Zoom / Google Meet, PDF readers, light coding tools</li>
              <li><span className={styles.specTag}>RAM</span> 8 GB is survivable, 16 GB is comfortable with many browser tabs open</li>
              <li><span className={styles.specTag}>CPU</span> Any modern-generation processor (Intel 12th gen+ / AMD Ryzen 5000+) is fine</li>
              <li><span className={styles.specTag}>SSD</span> 256 GB SSD minimum; 512 GB preferred once you accumulate project files</li>
              <li><span className={styles.specTag}>Battery</span> Battery life is more impactful than raw performance for class use</li>
            </ul>
          </div>
        </div>

        <p className={styles.tutorialIntro} style={{ marginBottom: 0 }}>
          <strong>Note on device types:</strong> Tablets (iPads / Android) can handle productivity and
          light design workloads but are unsuitable for VM labs, Networking, and Cybersecurity tracks due
          to OS restrictions. Desktops are ideal for power-heavy workloads (VM labs, Multimedia) but offer
          zero portability. Most students benefit most from a capable laptop as their primary machine.
        </p>
      </>
    ),
  },

  /* ── 3. Budget tiers ── */
  {
    id: 3,
    icon: '💰',
    title: 'Budget Tiers: What ₱30k / ₱50k / ₱80k / ₱120k+ Gets You',
    summary: 'Realistic expectations at each price point — what to prioritize and what compromises to expect.',
    content: (
      <>
        <p className={styles.tutorialIntro}>
          Price is not always proportional to suitability for your track. Here's what each
          tier realistically delivers for a BSIT student — and the hidden costs at each level.
        </p>

        <div className={styles.budgetGrid}>
          <div className={`${styles.budgetCard} ${styles.tier1}`}>
            <div className={styles.budgetPrice}>₱30,000</div>
            <div className={styles.budgetLabel}>Entry Tier</div>
            <ul className={styles.budgetList}>
              <li>Intel Core i5 (11th–12th gen) or Ryzen 5</li>
              <li>8 GB RAM (often single-channel)</li>
              <li>256–512 GB SSD</li>
              <li>Integrated graphics only</li>
              <li className={styles.warn}>No dedicated GPU — skip Multimedia track</li>
              <li className={styles.warn}>8 GB limits VM performance</li>
              <li className={styles.warn}>Check if RAM is upgradeable before buying</li>
            </ul>
          </div>

          <div className={`${styles.budgetCard} ${styles.tier2}`}>
            <div className={styles.budgetPrice}>₱50,000</div>
            <div className={styles.budgetLabel}>Mid-Range Tier</div>
            <ul className={styles.budgetList}>
              <li>Intel Core i5/i7 (12th–13th gen) or Ryzen 5/7</li>
              <li>16 GB RAM — suitable for most tracks</li>
              <li>512 GB NVMe SSD</li>
              <li>Some models include entry-level dedicated GPU</li>
              <li>Handles Programming, General, and light Networking</li>
              <li className={styles.warn}>Verify thermals — budget gaming laptops throttle under load</li>
            </ul>
          </div>

          <div className={`${styles.budgetCard} ${styles.tier3}`}>
            <div className={styles.budgetPrice}>₱80,000</div>
            <div className={styles.budgetLabel}>High-End Tier</div>
            <ul className={styles.budgetList}>
              <li>Intel Core i7/i9 or Ryzen 7/9</li>
              <li>16–32 GB RAM — VM labs comfortable</li>
              <li>512 GB–1 TB NVMe SSD</li>
              <li>Dedicated GPU (RTX 3060 class or equivalent)</li>
              <li>Handles all BSIT tracks comfortably</li>
              <li>Better build quality and thermals</li>
            </ul>
          </div>

          <div className={`${styles.budgetCard} ${styles.tier4}`}>
            <div className={styles.budgetPrice}>₱120,000+</div>
            <div className={styles.budgetLabel}>Premium Tier</div>
            <ul className={styles.budgetList}>
              <li>Intel Core i9 / Ryzen 9 / Apple M-series</li>
              <li>32–64 GB RAM — no compromises</li>
              <li>1 TB+ NVMe SSD</li>
              <li>High-refresh, color-accurate display</li>
              <li>Pro-grade thermals and sustained performance</li>
              <li className={styles.warn}>Overkill for pure productivity — justify by workload</li>
            </ul>
          </div>
        </div>

        <p className={styles.tutorialIntro}>
          <strong>Budget tip:</strong> If your budget is at a tier boundary, don't compromise
          on RAM or CPU generation just to get a recognizable brand. A lesser-known brand with
          16 GB RAM at ₱50k outperforms a flagship brand with 8 GB RAM at ₱55k for student workloads.
        </p>

        <h3 className={styles.subHeading}>Device Type vs. Budget</h3>
        <div className={styles.deviceTypeRow}>
          <div className={styles.deviceTypeCard}>
            <h4>💻 Laptop</h4>
            <p>Best all-around for BSIT students. Portable for classes, powerful enough for all tracks when spec'd correctly. Primary recommendation at all budget tiers.</p>
          </div>
          <div className={styles.deviceTypeCard}>
            <h4>📱 Tablet</h4>
            <p>Best for note-taking, reading, productivity, and light design. Limited for programming IDEs or VM labs. Consider as a secondary companion device, not a primary workstation.</p>
          </div>
          <div className={styles.deviceTypeCard}>
            <h4>🖥️ Desktop</h4>
            <p>Best performance-per-peso at ₱30k–₱50k. Ideal if you have a stable workspace at home and don't need to bring your machine to school. Best for Networking / VM and Multimedia tracks.</p>
          </div>
        </div>
      </>
    ),
  },

  /* ── 4. Portability vs. performance ── */
  {
    id: 4,
    icon: '⚖️',
    title: 'Portability vs. Performance: Lightweight, Balanced & High-Performance',
    summary: 'Understanding the real trade-offs across device categories — plus where tablets and desktops fit.',
    content: (
      <>
        <p className={styles.tutorialIntro}>
          Every device sits on a spectrum between maximum portability and maximum performance.
          No single device excels at both — understanding these trade-offs helps you make a
          decision you won't regret after a semester.
        </p>

        <div className={styles.portabilityGrid}>
          <div className={styles.portCard}>
            <div className={styles.portIcon}>🪶</div>
            <div className={styles.portTitle}>Lightweight</div>
            <ul className={styles.portList}>
              <li>Weight: under 1.5 kg</li>
              <li>Battery: 10–15 hrs</li>
              <li>Thin chassis, limited cooling</li>
              <li>Often no dedicated GPU</li>
              <li>Best for: daily campus carry, productivity, general BSIT</li>
              <li>Not ideal for: VM labs, 3D rendering, long compilation</li>
            </ul>
          </div>

          <div className={styles.portCard}>
            <div className={styles.portIcon}>⚖️</div>
            <div className={styles.portTitle}>Balanced</div>
            <ul className={styles.portList}>
              <li>Weight: 1.5–2.2 kg</li>
              <li>Battery: 6–10 hrs</li>
              <li>Room for better thermals</li>
              <li>Entry-to-mid GPU available</li>
              <li>Best for: Programming, Cybersecurity, mixed use</li>
              <li>The sweet spot for most BSIT students</li>
            </ul>
          </div>

          <div className={styles.portCard}>
            <div className={styles.portIcon}>🔥</div>
            <div className={styles.portTitle}>High Performance</div>
            <ul className={styles.portList}>
              <li>Weight: 2.2 kg+</li>
              <li>Battery: 3–6 hrs under load</li>
              <li>Full cooling system</li>
              <li>Dedicated mid-to-high GPU</li>
              <li>Best for: VM labs, Multimedia, Cybersecurity GPU tools</li>
              <li>Heavy for daily carry — consider proximity to outlets</li>
            </ul>
          </div>
        </div>

        <h3 className={styles.subHeading}>Tablets: Where They Fit</h3>
        <div className={styles.calloutList}>
          <div className={`${styles.callout} ${styles.info}`}>
            <span className={styles.calloutEmoji}>📱</span>
            <span>
              <strong>iPad (iPadOS):</strong> Excellent for note-taking with Apple Pencil, PDF annotation, and light Procreate design work. Not suitable for programming IDEs, running local dev servers, VM labs, or cybersecurity toolchains. Best used as a companion device.
            </span>
          </div>
          <div className={`${styles.callout} ${styles.info}`}>
            <span className={styles.calloutEmoji}>🤖</span>
            <span>
              <strong>Android Tablets:</strong> Similar limitations to iPadOS for academic IT work. USB-C connectivity allows peripherals. Not recommended as a primary device for any BSIT track beyond general productivity.
            </span>
          </div>
          <div className={`${styles.callout} ${styles.info}`}>
            <span className={styles.calloutEmoji}>🪟</span>
            <span>
              <strong>Windows Tablets / 2-in-1s (Surface Pro, etc.):</strong> Run full Windows, so they can technically run any software. However, RAM and thermal constraints limit sustained workloads. Acceptable for Programming and Productivity; not recommended for Networking/VM labs.
            </span>
          </div>
        </div>

        <h3 className={styles.subHeading}>Desktops: The Underrated Option</h3>
        <p className={styles.tutorialIntro}>
          If you have a dedicated workspace at home and your school has computer labs, a desktop is
          the best performance-per-peso option. At ₱30k–₱50k, a desktop with a discrete GPU and 32 GB RAM
          will outperform a ₱70k laptop. The trade-off is zero mobility. Best suited for Networking / VM
          lab students and Multimedia students who do heavy rendering.
        </p>
      </>
    ),
  },

  /* ── 5. OS & ecosystem ── */
  {
    id: 5,
    icon: '🖥️',
    title: 'OS & Ecosystem: Windows, macOS, Linux, and Tablets',
    summary: 'Which operating system suits each BSIT track — and compatibility notes for lab software.',
    content: (
      <>
        <p className={styles.tutorialIntro}>
          The operating system is often overlooked when students focus on specs, but it determines
          which tools run natively, which require workarounds, and whether you can use your device
          for all lab sessions without a VM dependency.
        </p>

        <div className={styles.osGrid}>
          <div className={styles.osCard}>
            <h4>🪟 Windows</h4>
            <ul>
              <li>Widest software compatibility for BSIT courses</li>
              <li>Hyper-V, VirtualBox, VMware run natively</li>
              <li>Cisco Packet Tracer has native Windows build</li>
              <li>Wireshark, Metasploit, Nmap all supported</li>
              <li>Office, Visual Studio, most IDEs</li>
              <li>Recommended OS for Networking & Cybersecurity tracks</li>
            </ul>
          </div>

          <div className={styles.osCard}>
            <h4>🍎 macOS</h4>
            <ul>
              <li>Excellent for web development (Unix terminal, Homebrew)</li>
              <li>Native support for Docker, Node.js, Python, Ruby</li>
              <li>Best-in-class for UI/UX design (Figma, Sketch, Final Cut)</li>
              <li>Limited virtualization on Apple Silicon (Parallels required)</li>
              <li>Some cybersecurity tools (Kismet, certain drivers) unavailable on macOS ARM</li>
              <li>Best for: Programming/Web Dev, Multimedia</li>
            </ul>
          </div>

          <div className={styles.osCard}>
            <h4>🐧 Linux</h4>
            <ul>
              <li>Best environment for Networking and Cybersecurity coursework</li>
              <li>Kali Linux: purpose-built for security tools</li>
              <li>Ubuntu / Debian: widely used in server admin, DevOps</li>
              <li>Free and open-source — no license cost</li>
              <li>Recommended as a dual-boot option on Windows for advanced students</li>
              <li>Some consumer apps (MS Office, Adobe) don't run natively</li>
            </ul>
          </div>

          <div className={styles.osCard}>
            <h4>📱 iPadOS / Android</h4>
            <ul>
              <li>Suitable for note-taking, reading, and light design</li>
              <li>No native support for VMs, IDEs, or security tools</li>
              <li>Limited terminal access (iSH on iPadOS provides basic shell)</li>
              <li>Good as companion devices for portable note-taking</li>
              <li>Not recommended as standalone devices for BSIT coursework</li>
            </ul>
          </div>
        </div>

        <h3 className={styles.subHeading}>Compatibility Checklist by Track</h3>
        <div className={styles.calloutList}>
          <div className={`${styles.callout} ${styles.info}`}>
            <span className={styles.calloutEmoji}>💡</span>
            <span><strong>Programming/Web Dev:</strong> Windows, macOS, and Linux all work well. macOS is often preferred for its UNIX-like environment and smooth developer tooling.</span>
          </div>
          <div className={`${styles.callout} ${styles.info}`}>
            <span className={styles.calloutEmoji}>💡</span>
            <span><strong>Networking/VM Labs:</strong> Windows is most compatible (Hyper-V, Packet Tracer native). Linux is a great second option. Avoid macOS Apple Silicon for heavy VMware usage until support matures.</span>
          </div>
          <div className={`${styles.callout} ${styles.warn}`}>
            <span className={styles.calloutEmoji}>⚠️</span>
            <span><strong>Cybersecurity:</strong> Windows + Kali VM (dual-boot or virtual) is the standard setup. Pure macOS limits access to several offensive security tools. Check tool compatibility before committing.</span>
          </div>
          <div className={`${styles.callout} ${styles.info}`}>
            <span className={styles.calloutEmoji}>💡</span>
            <span><strong>Multimedia/Design:</strong> macOS is king for Final Cut Pro and Logic Pro. Windows is fine for Adobe CC and DaVinci Resolve with a dedicated GPU. Linux has limited Adobe support (GIMP/Kdenlive as alternatives).</span>
          </div>
        </div>
      </>
    ),
  },

  /* ── 6. Buying checklist & pitfalls ── */
  {
    id: 6,
    icon: '✅',
    title: 'Buying Checklist & Common Pitfalls',
    summary: 'Verify these before you purchase — and the mistakes that catch students off guard.',
    content: (
      <>
        <p className={styles.tutorialIntro}>
          Even after choosing the right spec tier, students make avoidable purchase mistakes.
          Use this checklist as your final gate before paying.
        </p>

        <h3 className={styles.subHeading}>Pre-Purchase Checklist</h3>
        <div className={styles.checklistGrid}>
          <div className={styles.checkItem}>
            <span className={styles.checkIcon}>☑️</span>
            <div><strong>Minimum specs confirmed</strong> CPU generation, RAM amount, and storage type match your track's requirements.</div>
          </div>
          <div className={styles.checkItem}>
            <span className={styles.checkIcon}>☑️</span>
            <div><strong>RAM is upgradeable (or already sufficient)</strong> Soldered RAM at 8 GB with no upgrade path is a 4-year liability.</div>
          </div>
          <div className={styles.checkItem}>
            <span className={styles.checkIcon}>☑️</span>
            <div><strong>SSD, not HDD</strong> Any device with an HDD as the primary drive should be skipped. Boot times, app load times, and VM disk I/O are all severely impacted.</div>
          </div>
          <div className={styles.checkItem}>
            <span className={styles.checkIcon}>☑️</span>
            <div><strong>Local warranty & service center available</strong> Check that the brand has an authorized service center in your city. A 1-year warranty is standard; 2 years is better.</div>
          </div>
          <div className={styles.checkItem}>
            <span className={styles.checkIcon}>☑️</span>
            <div><strong>Required software license cost accounted for</strong> Windows 11 Home, Microsoft Office 365, or Adobe CC subscriptions add to total cost. Check if your school provides licenses.</div>
          </div>
          <div className={styles.checkItem}>
            <span className={styles.checkIcon}>☑️</span>
            <div><strong>Ports match your needs</strong> USB-A for peripherals, HDMI or USB-C DisplayPort for external monitors in labs, and SD card if relevant to your track.</div>
          </div>
          <div className={styles.checkItem}>
            <span className={styles.checkIcon}>☑️</span>
            <div><strong>Accessories budget included</strong> Mouse (₱500–₱2k), external storage (₱1.5k–₱3k), laptop bag (₱800–₱2k). Total accessory cost can exceed ₱5k.</div>
          </div>
          <div className={styles.checkItem}>
            <span className={styles.checkIcon}>☑️</span>
            <div><strong>Compared at least 2 alternatives</strong> Use the Compare page to verify your choice is genuinely the best option in your budget before purchasing.</div>
          </div>
        </div>

        <h3 className={styles.subHeading}>Common Pitfalls</h3>
        <div className={styles.calloutList}>
          <div className={`${styles.callout} ${styles.warn}`}>
            <span className={styles.calloutEmoji}>⚠️</span>
            <span><strong>8 GB RAM for Networking/VM track:</strong> You will run out of memory the first time you spin up two VMs simultaneously. Don't compromise on RAM for this track — 16 GB is the practical minimum, 32 GB is the target.</span>
          </div>
          <div className={`${styles.callout} ${styles.warn}`}>
            <span className={styles.calloutEmoji}>⚠️</span>
            <span><strong>Gaming laptop = best performance is a myth:</strong> Gaming laptops have powerful GPUs but often throttle CPU performance to preserve battery under sustained workloads. The battery life (3–4 hrs) is also impractical for a full school day.</span>
          </div>
          <div className={`${styles.callout} ${styles.warn}`}>
            <span className={styles.calloutEmoji}>⚠️</span>
            <span><strong>Buying tablet-only for BSIT:</strong> Tablets are productivity companions, not workstations. A ₱30k laptop outperforms a ₱30k tablet for every programming, networking, or security task you'll face.</span>
          </div>
          <div className={`${styles.callout} ${styles.warn}`}>
            <span className={styles.calloutEmoji}>⚠️</span>
            <span><strong>Ignoring thermal performance:</strong> Thin, fanless, or single-fan designs that throttle under sustained load will be noticeably slower after 10–15 minutes of compilation, rendering, or hash cracking. Check thermal reviews, not just peak benchmark scores.</span>
          </div>
          <div className={`${styles.callout} ${styles.warn}`}>
            <span className={styles.calloutEmoji}>⚠️</span>
            <span><strong>Buying based on brand alone:</strong> Brand reputation is not a proxy for value at a specific price point. Compare the spec sheet and read local user reviews. A lesser-known brand at ₱50k with 16 GB RAM and an NVMe SSD can outperform a premium brand at the same price with 8 GB RAM.</span>
          </div>
          <div className={`${styles.callout} ${styles.warn}`}>
            <span className={styles.calloutEmoji}>⚠️</span>
            <span><strong>No local service center:</strong> Importing or buying a grey-market device may save ₱2k–₱5k upfront but can cost ₱10k+ in repairs if something fails outside warranty coverage. Always confirm local service availability.</span>
          </div>
        </div>
      </>
    ),
  },
];

/* ─── Guides Page Component ──────────────────────────────────────────── */
const Guides: React.FC = () => {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggle = (id: number) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  return (
    <div className="app-container">
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>

          {/* ── Hero ── */}
          <section className={styles.hero}>
            <div className={styles.badge}>BSIT Academic Companion</div>
            <h1 className={styles.heroTitle}>
              Device <span>Guides</span>
            </h1>
            <p className={styles.heroSub}>
              Tutorials to help you choose the right device for your workload — covering
              laptops, tablets, and desktops across every BSIT track and budget.
            </p>
            <div className={styles.ctaRow}>
              <button className={`${styles.ctaBtn} ${styles.ctaPrimary}`} onClick={navigate('/recommend')}>
                🎯 Get a Recommendation
              </button>
              <button className={`${styles.ctaBtn} ${styles.ctaSecondary}`} onClick={navigate('/top-devices')}>
                📋 Browse Top Devices
              </button>
              <button className={`${styles.ctaBtn} ${styles.ctaSecondary}`} onClick={navigate('/compare')}>
                ⚡ Compare Devices
              </button>
            </div>
          </section>

          {/* ── Tutorial accordion list ── */}
          <div>
            <p className={styles.sectionLabel}>Tutorial Modules</p>
            <h2 className={styles.sectionTitle}>Pick a topic to expand</h2>
            <p className={styles.sectionSub}>
              Click any module below to read the full tutorial inline.
            </p>

            <div className={styles.accordionList}>
              {tutorials.map(t => {
                const isOpen = openId === t.id;
                return (
                  <div
                    key={t.id}
                    className={`${styles.accordionItem} ${isOpen ? styles.open : ''}`}
                  >
                    <button
                      className={styles.accordionHeader}
                      onClick={() => toggle(t.id)}
                      aria-expanded={isOpen}
                    >
                      <span className={styles.accordionIcon}>{t.icon}</span>
                      <span className={styles.accordionMeta}>
                        <span className={styles.accordionNumber}>Tutorial {t.id}</span>
                        <span className={styles.accordionTitle}>{t.title}</span>
                        <span className={styles.accordionSummary}>{t.summary}</span>
                      </span>
                      <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>
                        ▼
                      </span>
                    </button>

                    {isOpen && (
                      <div className={styles.accordionBody}>
                        {t.content}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Bottom CTA ── */}
          <div className={styles.bottomCta}>
            <h3>Ready to find your device?</h3>
            <p>
              Use the tools below to apply what you've learned and find the best
              device for your track and budget.
            </p>
            <div className={styles.bottomCtaRow}>
              <button className={`${styles.ctaBtn} ${styles.ctaPrimary}`} onClick={navigate('/recommend')}>
                🎯 Start Recommend Wizard
              </button>
              <button className={`${styles.ctaBtn} ${styles.ctaSecondary}`} onClick={navigate('/top-devices')}>
                📋 Browse Top Devices
              </button>
              <button className={`${styles.ctaBtn} ${styles.ctaSecondary}`} onClick={navigate('/compare')}>
                ⚡ Compare Side-by-Side
              </button>
            </div>
          </div>

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
