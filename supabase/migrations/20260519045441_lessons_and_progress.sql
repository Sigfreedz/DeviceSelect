create extension if not exists pgcrypto;

do $$
begin
  create type public.lesson_tier as enum ('Beginner', 'Intermediate', 'Advanced');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  content text not null,
  tier public.lesson_tier not null,
  order_index integer not null check (order_index > 0),
  thumbnail_url text,
  video_url text,
  steps jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lessons_steps_is_array check (jsonb_typeof(steps) = 'array')
);

create unique index if not exists lessons_tier_order_idx on public.lessons (tier, order_index);
create index if not exists lessons_slug_idx on public.lessons (slug);

create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  constraint user_progress_user_lesson_unique unique (user_id, lesson_id)
);

create index if not exists user_progress_user_idx on public.user_progress (user_id);
create index if not exists user_progress_lesson_idx on public.user_progress (lesson_id);

alter table public.lessons enable row level security;
alter table public.user_progress enable row level security;

drop policy if exists "Lessons public read" on public.lessons;
create policy "Lessons public read"
on public.lessons
for select
to anon, authenticated
using (true);

drop policy if exists "Faculty admin manage lessons" on public.lessons;
create policy "Faculty admin manage lessons"
on public.lessons
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('faculty', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('faculty', 'admin')
  )
);

drop policy if exists "Users read own progress" on public.user_progress;
create policy "Users read own progress"
on public.user_progress
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users insert own progress" on public.user_progress;
create policy "Users insert own progress"
on public.user_progress
for insert
to authenticated
with check (auth.uid() = user_id);

insert into public.lessons (slug, title, description, content, tier, order_index, thumbnail_url, video_url, steps)
values
  (
    'choose-the-right-device',
    'Step-by-Step: How to Choose the Right Device',
    'A 5-step decision process from identifying your workload to validating specs before buying.',
    'Start with your actual course workload and move through a fixed evaluation sequence before spending.',
    'Beginner',
    1,
    null,
    null,
    '["Identify your primary workload before checking specs.","Set a realistic budget ceiling and avoid spec compromises.","Decide your portability versus performance priorities.","Validate shortlisted devices against workload minimums.","Compare final options side-by-side before purchasing."]'::jsonb
  ),
  (
    'workloads-to-specs',
    'Workloads → Specs: What Your Track Actually Needs',
    'Maps each BSIT specialization to the hardware specs that matter most.',
    'Map your actual software stack to CPU, RAM, SSD, and GPU requirements before brand comparison.',
    'Beginner',
    2,
    null,
    null,
    '["Map your track to required tools and software.","Prioritize RAM and CPU for concurrent workloads.","Use SSD storage for faster project and VM operations.","Add dedicated GPU only when your track needs it.","Check upgrade paths before final purchase."]'::jsonb
  ),
  (
    'budget-tier-expectations',
    'Budget Tiers: What ₱30k / ₱50k / ₱80k / ₱120k+ Gets You',
    'Set realistic expectations at each price point and prioritize where it matters.',
    'Define practical expectations per budget tier, then optimize value around RAM and CPU generation.',
    'Intermediate',
    1,
    null,
    null,
    '["Start from budget and choose the best balanced option.","Protect RAM and CPU generation before cosmetic features.","Treat entry-tier devices as upgrade-sensitive purchases.","Use mid-tier as default for most students.","Pay premium only if workloads justify it."]'::jsonb
  ),
  (
    'portability-vs-performance',
    'Portability vs. Performance',
    'Understand trade-offs between lightweight, balanced, and high-performance systems.',
    'Choose the right device class by balancing mobility, thermals, battery life, and sustained performance.',
    'Intermediate',
    2,
    null,
    null,
    '["Estimate daily carry requirements and power outlet access.","Pick a device class based on sustained workload needs.","Use balanced systems for mixed student workflows.","Treat tablets as companion devices for most tracks.","Consider desktops for best value when mobility is not required."]'::jsonb
  ),
  (
    'os-and-ecosystem-choice',
    'OS & Ecosystem: Windows, macOS, Linux, and Tablets',
    'Pick an OS that matches tool compatibility for your courses and labs.',
    'Prioritize operating-system compatibility first so required labs and software work without friction.',
    'Advanced',
    1,
    null,
    null,
    '["List required software per subject and lab.","Check native compatibility before buying hardware.","Plan virtualization needs early if using macOS or Linux.","Use tablets only for companion productivity workflows.","Validate long-term ecosystem cost and support options."]'::jsonb
  ),
  (
    'buying-checklist-and-pitfalls',
    'Buying Checklist & Common Pitfalls',
    'Final validation checklist before purchasing and mistakes to avoid.',
    'Run a final quality gate on warranty, upgradeability, and true workload fit before checkout.',
    'Advanced',
    2,
    null,
    null,
    '["Confirm minimum specs and upgrade paths.","Verify warranty and local service center support.","Include accessories and software licenses in budget.","Compare at least two alternatives before checkout.","Avoid tablet-only and under-RAM configurations for heavy tracks."]'::jsonb
  )
on conflict (slug)
do update set
  title = excluded.title,
  description = excluded.description,
  content = excluded.content,
  tier = excluded.tier,
  order_index = excluded.order_index,
  thumbnail_url = excluded.thumbnail_url,
  video_url = excluded.video_url,
  steps = excluded.steps,
  updated_at = now();
