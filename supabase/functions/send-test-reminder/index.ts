import { createClient } from 'jsr:@supabase/supabase-js@2'

const RESEND_API_URL = 'https://api.resend.com/emails'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type ReminderType = 'annual_review' | 'saule3a' | 'quarterly' | 'pk_einkauf'

const VALID_TYPES: ReminderType[] = ['annual_review', 'saule3a', 'quarterly', 'pk_einkauf']

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

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await request.json() as { reminder_type?: string }
    const reminderType = body.reminder_type as ReminderType

    if (!VALID_TYPES.includes(reminderType)) {
      return new Response(JSON.stringify({ error: 'Invalid reminder_type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? ''
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') ?? 'FinPlan <onboarding@resend.dev>'
    const appUrl = Deno.env.get('APP_URL') ?? 'https://finplan.app'

    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify the user making the request
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: userError } = await authClient.auth.getUser()
    if (userError || !user?.email) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Load profile for personalised content
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { data: profileRow } = await admin
      .from('profiles')
      .select('data')
      .eq('user_id', user.id)
      .maybeSingle()

    const profile: ProfileData = (profileRow?.data as ProfileData) ?? {}
    const { subject, html } = buildEmail(reminderType, profile.vorname ?? '', profile, appUrl)

    const resendRes = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [user.email],
        subject: `[Test] ${subject}`,
        html,
      }),
    })

    if (!resendRes.ok) {
      const err = await resendRes.text()
      console.error(`Resend error: ${err}`)
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('send-test-reminder failed:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
