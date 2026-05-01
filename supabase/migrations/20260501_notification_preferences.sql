-- Stores per-user email reminder preferences
create table public.notification_preferences (
  user_id                  uuid    primary key references auth.users(id) on delete cascade,
  email_enabled            boolean not null default true,
  reminder_annual_review   boolean not null default true,
  reminder_saule3a         boolean not null default true,
  reminder_quarterly       boolean not null default false,
  reminder_pk_einkauf      boolean not null default true,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;

create policy "Users can manage own notification preferences"
  on public.notification_preferences
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Prevents duplicate sends; one row per user + reminder_type + period
-- Annual reminders use period like '2026'; quarterly use '2026-Q2'
create table public.notification_log (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references auth.users(id) on delete cascade,
  reminder_type text        not null,
  sent_period   text        not null,
  sent_at       timestamptz not null default now(),
  unique (user_id, reminder_type, sent_period)
);

alter table public.notification_log enable row level security;

-- Users can read their own log; only service role writes
create policy "Users can view own notification log"
  on public.notification_log
  for select
  using (auth.uid() = user_id);
