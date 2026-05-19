export type LessonTier = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Lesson {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  tier: LessonTier;
  order_index: number;
  thumbnail_url: string | null;
  video_url: string | null;
  steps: string[];
}

export const LESSONS_SEED: Lesson[] = [
  {
    id: 'seed-lesson-1',
    slug: 'choose-the-right-device',
    title: 'Step-by-Step: How to Choose the Right Device',
    description: 'A 5-step decision process from identifying your workload to validating specs before buying.',
    tier: 'Beginner',
    order_index: 1,
    thumbnail_url: null,
    video_url: null,
    steps: [
      'Identify your primary workload before checking specs.',
      'Set a realistic budget ceiling and avoid spec compromises.',
      'Decide your portability versus performance priorities.',
      'Validate shortlisted devices against workload minimums.',
      'Compare final options side-by-side before purchasing.'
    ],
    content: `Start with your **actual course workload**. Your device should match the software and intensity you use every week.

## Core flow
1. Define your track needs (Programming, Networking, Cybersecurity, Multimedia, or General IT).
2. Set budget first to avoid emotional overspending.
3. Balance portability and sustained performance.
4. Confirm RAM, CPU generation, and SSD fit your track.
5. Compare your final shortlist and check warranty availability.

Use this as your baseline before exploring higher-end options.`
  },
  {
    id: 'seed-lesson-2',
    slug: 'workloads-to-specs',
    title: 'Workloads → Specs: What Your Track Actually Needs',
    description: 'Maps each BSIT specialization to the hardware specs that matter most.',
    tier: 'Beginner',
    order_index: 2,
    thumbnail_url: null,
    video_url: null,
    steps: [
      'Map your track to required tools and software.',
      'Prioritize RAM and CPU for concurrent workloads.',
      'Use SSD storage for faster project and VM operations.',
      'Add dedicated GPU only when your track needs it.',
      'Check upgrade paths before final purchase.'
    ],
    content: `Different BSIT tracks stress hardware in different ways.

## Quick mapping
- **Programming/Web Dev:** multi-core CPU + 16 GB RAM minimum.
- **Networking/VM Labs:** 32 GB RAM recommended, large SSD for VM images.
- **Cybersecurity:** strong CPU and enough RAM for security tools + VMs.
- **Multimedia/Design:** dedicated GPU and color-accurate display.
- **General Productivity:** balanced CPU, 16 GB RAM, reliable SSD.

Choose hardware based on your toolchain, not brand perception.`
  },
  {
    id: 'seed-lesson-3',
    slug: 'budget-tier-expectations',
    title: 'Budget Tiers: What ₱30k / ₱50k / ₱80k / ₱120k+ Gets You',
    description: 'Set realistic expectations at each price point and prioritize where it matters.',
    tier: 'Intermediate',
    order_index: 1,
    thumbnail_url: null,
    video_url: null,
    steps: [
      'Start from budget and choose the best balanced option.',
      'Protect RAM and CPU generation before cosmetic features.',
      'Treat entry-tier devices as upgrade-sensitive purchases.',
      'Use mid-tier as default for most students.',
      'Pay premium only if workloads justify it.'
    ],
    content: `Budget determines feasible performance ceilings.

## Tier framing
- **₱30k:** entry setups; verify RAM upgradeability.
- **₱50k:** strongest value for most BSIT workloads.
- **₱80k:** high-end comfort for heavy multi-app or VM use.
- **₱120k+:** premium, often overkill unless specialized workloads demand it.

At boundary pricing, prioritize RAM and CPU generation over branding.`
  },
  {
    id: 'seed-lesson-4',
    slug: 'portability-vs-performance',
    title: 'Portability vs. Performance',
    description: 'Understand trade-offs between lightweight, balanced, and high-performance systems.',
    tier: 'Intermediate',
    order_index: 2,
    thumbnail_url: null,
    video_url: null,
    steps: [
      'Estimate daily carry requirements and power outlet access.',
      'Pick a device class based on sustained workload needs.',
      'Use balanced systems for mixed student workflows.',
      'Treat tablets as companion devices for most tracks.',
      'Consider desktops for best value when mobility is not required.'
    ],
    content: `No device maximizes portability and performance at the same time.

## Category trade-offs
- **Lightweight:** great battery life, lower sustained performance.
- **Balanced:** practical middle ground for most students.
- **High-performance:** strongest output, lowest portability.

Use a desktop-first setup only if your learning setup does not require constant mobility.`
  },
  {
    id: 'seed-lesson-5',
    slug: 'os-and-ecosystem-choice',
    title: 'OS & Ecosystem: Windows, macOS, Linux, and Tablets',
    description: 'Pick an OS that matches tool compatibility for your courses and labs.',
    tier: 'Advanced',
    order_index: 1,
    thumbnail_url: null,
    video_url: null,
    steps: [
      'List required software per subject and lab.',
      'Check native compatibility before buying hardware.',
      'Plan virtualization needs early if using macOS or Linux.',
      'Use tablets only for companion productivity workflows.',
      'Validate long-term ecosystem cost and support options.'
    ],
    content: `Operating system choice controls compatibility and workflow friction.

## Practical summary
- **Windows:** widest compatibility for networking and security labs.
- **macOS:** excellent for development and design; check VM constraints.
- **Linux:** great for servers/security workflows, fewer mainstream app options.
- **Tablet OS:** useful companions, weak as primary BSIT workstations.

Pick the OS that minimizes toolchain workarounds for your track.`
  },
  {
    id: 'seed-lesson-6',
    slug: 'buying-checklist-and-pitfalls',
    title: 'Buying Checklist & Common Pitfalls',
    description: 'Final validation checklist before purchasing and mistakes to avoid.',
    tier: 'Advanced',
    order_index: 2,
    thumbnail_url: null,
    video_url: null,
    steps: [
      'Confirm minimum specs and upgrade paths.',
      'Verify warranty and local service center support.',
      'Include accessories and software licenses in budget.',
      'Compare at least two alternatives before checkout.',
      'Avoid tablet-only and under-RAM configurations for heavy tracks.'
    ],
    content: `Use a final quality gate before payment.

## Pre-purchase checks
- Confirm CPU generation, RAM, and SSD meet your workload.
- Ensure serviceability and local warranty support.
- Account for accessories and recurring software costs.
- Re-compare top options for value and reliability.

Avoid short-term deals that create long-term performance limits.`
  }
];
