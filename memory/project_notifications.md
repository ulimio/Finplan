---
name: Email notifications feature
description: Resend-based email reminder system added May 2026
type: project
---

Email reminders implemented via Supabase Edge Function `check-reminders` (cron: daily 07:00 UTC).
Email provider: Resend (re_* API key stored in Supabase secrets as RESEND_API_KEY).
From address: currently `onboarding@resend.dev` (Resend sandbox — only delivers to the account owner's email until a custom domain is verified).
Four reminder types: annual_review (January), saule3a (November), quarterly (Q starts), pk_einkauf (10 years before retirement age, January).
DB tables: notification_preferences (per-user toggles), notification_log (dedup by user+type+period).
UI: Einstellungen page → "E-Mail-Benachrichtigungen" card.

**Why:** Context for future changes to the notification system.
**How to apply:** When user asks about notifications, emails not arriving, or wants to add new reminder types — check this context first.
