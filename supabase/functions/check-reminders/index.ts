import { createClient } from 'jsr:@supabase/supabase-js@2'

const RESEND_API_URL = 'https://api.resend.com/emails'

type ReminderType = 'annual_review' | 'saule3a' | 'quarterly' | 'pk_einkauf'

interface NotificationPreferences {
  user_id: string
  email_enabled: boolean
  reminder_annual_review: boolean
  reminder_saule3a: boolean
  reminder_quarterly: boolean
  reminder_pk_einkauf: boolean
}

interface ProfileData {
  vorname?: string
  geburtsdatum?: string
  wunschalterFreiheit?: number
  fruehpensionierungsAlter?: number
  saule3aGesamt?: number
  pkEinkaufspotenzial?: number
}

function getCurrentAge(geburtsdatum: string): number {
  const birth = new Date(geburtsdatum)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function getSentPeriod(type: ReminderType): string {
  const now = new Date()
  const year = now.getFullYear()
  if (type === 'quarterly') {
    const quarter = Math.floor(now.getMonth() / 3) + 1
    return `${year}-Q${quarter}`
  }
  return String(year)
}

function shouldSendToday(type: ReminderType, profile: ProfileData): boolean {
  const now = new Date()
  const month = now.getMonth() // 0-indexed
  const day = now.getDate()

  switch (type) {
    case 'annual_review':
      // January
      return month === 0

    case 'saule3a':
      // November — remind before the Dec 31 deadline
      return month === 10

    case 'quarterly':
      // First 7 days of Jan, Apr, Jul, Oct
      return [0, 3, 6, 9].includes(month) && day <= 7

    case 'pk_einkauf': {
      // January only, when 9–10 years before retirement age
      if (!profile.geburtsdatum) return false
      const retirementAge = profile.wunschalterFreiheit ?? profile.fruehpensionierungsAlter
      if (!retirementAge) return false
      const yearsToRetirement = retirementAge - getCurrentAge(profile.geburtsdatum)
      return month === 0 && yearsToRetirement >= 9 && yearsToRetirement <= 10
    }
  }
}

function buildEmail(
  type: ReminderType,
  vorname: string,
  profile: ProfileData,
  appUrl: string,
): { subject: string; html: string } {
  const greeting = vorname ? `Hallo ${vorname}` : 'Hallo'
  const btnStyle =
    'display:inline-block;background:#1e3a5f;color:#ffffff;padding:10px 22px;border-radius:6px;text-decoration:none;font-size:14px;margin-top:8px'
  const footerStyle = 'color:#888888;font-size:12px;margin-top:24px'

  switch (type) {
    case 'annual_review':
      return {
        subject: 'Zeit für deine jährliche FinPlan-Überprüfung',
        html: `
          <p>${greeting}</p>
          <p>Ein neues Jahr beginnt – ein guter Moment, deinen Finanzplan zu aktualisieren.</p>
          <p>Hat sich dein Einkommen, deine Vorsorgesituation oder dein Lebensplan verändert? Halte dein Profil aktuell, damit deine Planung verlässlich bleibt.</p>
          <a href="${appUrl}/app/profil" style="${btnStyle}">Profil jetzt aktualisieren</a>
          <p style="${footerStyle}">Du erhältst diese E-Mail, weil du jährliche Erinnerungen in FinPlan aktiviert hast.
          <a href="${appUrl}/app/einstellungen">Benachrichtigungen anpassen</a></p>
        `,
      }

    case 'saule3a': {
      const maxBeitrag = 7258
      return {
        subject: 'Säule 3a: Jahresbeitrag vor dem 31. Dezember einzahlen',
        html: `
          <p>${greeting}</p>
          <p>Der steuerlich abzugsfähige Säule-3a-Maximalbeitrag beträgt in diesem Jahr <strong>CHF ${maxBeitrag.toLocaleString('de-CH')}</strong>.</p>
          <p>Hast du deinen Beitrag bereits vollständig einbezahlt? Die Einzahlung muss bis zum <strong>31. Dezember</strong> erfolgen.</p>
          ${profile.saule3aGesamt !== undefined ? `<p>Dein erfasstes Säule-3a-Guthaben: <strong>CHF ${profile.saule3aGesamt.toLocaleString('de-CH')}</strong></p>` : ''}
          <a href="${appUrl}/app/profil" style="${btnStyle}">Profil öffnen</a>
          <p style="${footerStyle}">Du erhältst diese E-Mail, weil du Säule-3a-Erinnerungen in FinPlan aktiviert hast.
          <a href="${appUrl}/app/einstellungen">Benachrichtigungen anpassen</a></p>
        `,
      }
    }

    case 'quarterly':
      return {
        subject: 'Quartalsüberprüfung – wie steht deine Finanzplanung?',
        html: `
          <p>${greeting}</p>
          <p>Ein neues Quartal beginnt. Eine gute Gelegenheit, kurz innezuhalten und deine Finanzplanung zu überprüfen.</p>
          <p>Haben sich Einkommen, Ausgaben oder Lebenspläne verändert? Kleine Anpassungen heute vermeiden grosse Überraschungen morgen.</p>
          <a href="${appUrl}/app/varianten" style="${btnStyle}">Varianten ansehen</a>
          <p style="${footerStyle}">Du erhältst diese E-Mail, weil du Quartals-Erinnerungen in FinPlan aktiviert hast.
          <a href="${appUrl}/app/einstellungen">Benachrichtigungen anpassen</a></p>
        `,
      }

    case 'pk_einkauf': {
      const retirementAge = profile.wunschalterFreiheit ?? profile.fruehpensionierungsAlter ?? 65
      const yearsLeft = profile.geburtsdatum
        ? retirementAge - getCurrentAge(profile.geburtsdatum)
        : 10
      return {
        subject: `Noch ${yearsLeft} Jahre bis zur Pension – jetzt Pensionskasse optimieren`,
        html: `
          <p>${greeting}</p>
          <p>Du planst, mit <strong>${retirementAge} Jahren</strong> in Rente zu gehen. Das ist der ideale Zeitpunkt, einen freiwilligen <strong>Pensionskassen-Einkauf</strong> zu prüfen.</p>
          <ul>
            <li>Einkäufe in die PK sind <strong>vollständig vom steuerbaren Einkommen abziehbar</strong>.</li>
            <li>Das eingekaufte Kapital wächst <strong>steuerlich begünstigt</strong> bis zur Rente.</li>
            <li>Je früher du einzahlst, desto länger profitierst du vom Zinseszins-Effekt.</li>
          </ul>
          ${profile.pkEinkaufspotenzial ? `<p>Dein erfasstes Einkaufspotenzial: <strong>CHF ${profile.pkEinkaufspotenzial.toLocaleString('de-CH')}</strong></p>` : ''}
          <p><strong>Tipp:</strong> Fordere bei deiner Pensionskasse eine aktuelle Bescheinigung über dein Einkaufspotenzial an.</p>
          <a href="${appUrl}/app/profil" style="${btnStyle}">PK-Daten aktualisieren</a>
          <p style="${footerStyle}">Du erhältst diese E-Mail, weil du PK-Einkauf-Erinnerungen in FinPlan aktiviert hast.
          <a href="${appUrl}/app/einstellungen">Benachrichtigungen anpassen</a></p>
        `,
      }
    }
  }
}

Deno.serve(async () => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? ''
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') ?? 'FinPlan <onboarding@resend.dev>'
    const appUrl = Deno.env.get('APP_URL') ?? 'https://finplan.app'

    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not configured')
      return new Response(JSON.stringify({ error: 'Email service not configured' }), { status: 500 })
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: prefs, error: prefsError } = await admin
      .from('notification_preferences')
      .select('*')
      .eq('email_enabled', true)

    if (prefsError) throw prefsError

    let sent = 0
    let skipped = 0

    for (const pref of (prefs ?? []) as NotificationPreferences[]) {
      const {
        data: { user },
        error: userError,
      } = await admin.auth.admin.getUserById(pref.user_id)

      if (userError || !user?.email) continue

      const { data: profileRow } = await admin
        .from('profiles')
        .select('data')
        .eq('user_id', pref.user_id)
        .maybeSingle()

      const profile: ProfileData = (profileRow?.data as ProfileData) ?? {}

      const reminderMap: Record<ReminderType, boolean> = {
        annual_review: pref.reminder_annual_review,
        saule3a: pref.reminder_saule3a,
        quarterly: pref.reminder_quarterly,
        pk_einkauf: pref.reminder_pk_einkauf,
      }

      for (const [type, enabled] of Object.entries(reminderMap) as [ReminderType, boolean][]) {
        if (!enabled || !shouldSendToday(type, profile)) {
          skipped++
          continue
        }

        const sentPeriod = getSentPeriod(type)

        const { data: existing } = await admin
          .from('notification_log')
          .select('id')
          .eq('user_id', pref.user_id)
          .eq('reminder_type', type)
          .eq('sent_period', sentPeriod)
          .maybeSingle()

        if (existing) {
          skipped++
          continue
        }

        const { subject, html } = buildEmail(type, profile.vorname ?? '', profile, appUrl)

        const resendRes = await fetch(RESEND_API_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ from: fromEmail, to: [user.email], subject, html }),
        })

        if (!resendRes.ok) {
          console.error(`Resend error for ${user.email} (${type}): ${await resendRes.text()}`)
          continue
        }

        await admin.from('notification_log').insert({
          user_id: pref.user_id,
          reminder_type: type,
          sent_period: sentPeriod,
        })

        console.log(`Sent ${type} to ${user.email}`)
        sent++
      }
    }

    return new Response(JSON.stringify({ sent, skipped }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('check-reminders failed:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500 },
    )
  }
})
