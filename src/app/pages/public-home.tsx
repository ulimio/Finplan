import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  Clock3,
  Compass,
  FileSpreadsheet,
  LineChart,
  RefreshCw,
  Target,
  TrendingUp,
} from 'lucide-react'
import { publicHomeCopy, useLanguage } from '../lib/i18n'

const valuePillars = [
  {
    title: 'Finanzen endlich in einer klaren Struktur',
    description:
      'Einkommen, Vermögen, Vorsorge, Wohnen und Ziele werden in einer logischen Oberfläche zusammengeführt statt über Notizen, PDFs und Excel verteilt.',
    icon: Compass,
  },
  {
    title: 'Szenarien statt Bauchgefühl',
    description:
      'Vergleiche Varianten für Sparquote, Säule 3a, Eigenheim, Reserve und Anlageentscheidungen in einer gemeinsamen Sicht.',
    icon: LineChart,
  },
  {
    title: 'Flexible Finanzplanung wie dein Leben',
    description:
      'Wenn sich Einkommen, Familie, Wohnen oder Ziele ändern, passt du deinen Plan einfach an statt wieder bei null zu beginnen.',
    icon: RefreshCw,
  },
  {
    title: 'Lebenslanger Begleiter statt Einmal-Tool',
    description:
      'FinPlan soll dich langfristig begleiten, an wichtige Finanzaufgaben erinnern und aus Vorhaben konkrete nächste Schritte machen.',
    icon: BellRing,
  },
]

const processSteps = [
  {
    step: '01',
    title: 'Situation erfassen',
    description:
      'Du hinterlegst die wichtigsten Eckdaten zu Einkommen, Ausgaben, Vermögen, Vorsorge und Zielen.',
  },
  {
    step: '02',
    title: 'Optionen vergleichen',
    description:
      'Du testest Varianten, bewertest ihre Auswirkungen und passt deinen Plan an, wenn sich deine Lebensumstände verändern.',
  },
  {
    step: '03',
    title: 'Dranbleiben und nachsteuern',
    description:
      'FinPlan begleitet dich langfristig, macht auf offene Finanzaufgaben aufmerksam und unterstützt dich beim Nachfassen wichtiger Themen.',
  },
]

const audienceCards = [
  {
    title: 'Für Berufstätige mit wenig Zeit',
    description:
      'Wenn du gut verdienst, aber Finanzthemen immer wieder vertagst, schafft FinPlan Struktur ohne Komplexitätsballast.',
    icon: Clock3,
  },
  {
    title: 'Für Menschen mit konkreten Zielen',
    description:
      'Ob Pensionsplanung, Eigenheim oder Vermögensaufbau: Du siehst, welche Stellhebel deine Ziele tatsächlich beeinflussen.',
    icon: Target,
  },
  {
    title: 'Für Menschen in Veränderung',
    description:
      'Wenn sich dein Leben bewegt, soll deine Finanzplanung nicht starr bleiben. FinPlan nimmt Ereignisse und neue Prioritäten mit.',
    icon: RefreshCw,
  },
  {
    title: 'Für alle, die Ordnung statt Tools wollen',
    description:
      'FinPlan ersetzt das Springen zwischen Rechnern, Dokumenten und Halbwissen durch einen konsistenten Planungsraum.',
    icon: FileSpreadsheet,
  },
]

const trustPoints = [
  'Demo und Wissensbereich ohne Registrierung zugänglich',
  'Persönliche Daten bleiben im geschützten Bereich',
  'Keine Beratungssprache, kein Tool-Chaos',
  'Planungsstand bleibt beim nächsten Besuch erhalten',
]

const faqItems = [
  {
    question: 'Muss ich mich sofort registrieren?',
    answer:
      'Nein. Die Startseite, der Wissensbereich und die Demo sind öffentlich. Erst wenn du mit deinen eigenen Daten arbeiten willst, wechselst du in den geschützten Bereich.',
  },
  {
    question: 'Ist das nur ein Finanzrechner?',
    answer:
      'Nein. FinPlan ist als Arbeitsumgebung gedacht: Daten strukturieren, Varianten vergleichen, Auswirkungen verstehen, Planung laufend anpassen und daraus konkrete nächste Schritte ableiten.',
  },
  {
    question: 'Warum überzeugender als einzelne Tools?',
    answer:
      'Weil nicht nur gerechnet wird. Die Stärke liegt darin, Informationen, Entscheidungen, Erinnerungen und Orientierung an einem Ort zusammenzuführen.',
  },
  {
    question: 'Bleibt FinPlan auch später relevant?',
    answer:
      'Ja. FinPlan soll kein Tool für einen einmaligen Setup-Moment sein, sondern ein langfristiger Begleiter mit Erinnerungen an wichtige Finanzthemen und offene To-dos.',
  },
]

export function PublicHome() {
  const { language } = useLanguage()
  const heroCopy = publicHomeCopy[language]

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh' }}>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div
          className="mx-auto px-6 py-20 lg:px-8 lg:py-28"
          style={{ maxWidth: 1280 }}
        >
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            {/* Left: copy */}
            <div className="space-y-8">
              <div
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium"
                style={{
                  borderColor: 'rgba(196,242,90,0.3)',
                  color: 'var(--primary)',
                  background: 'var(--accent-soft)',
                }}
              >
                <span
                  className="inline-block rounded-full"
                  style={{ width: 6, height: 6, background: 'var(--primary)' }}
                />
                {heroCopy.badge}
              </div>

              <div className="space-y-5">
                <h1
                  className="text-foreground"
                  style={{
                    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                    fontWeight: 500,
                    lineHeight: 1.1,
                    letterSpacing: '-0.03em',
                  }}
                >
                  Dein Geld.{' '}
                  <span style={{ color: 'var(--primary)' }}>Strukturiert.</span>
                  <br />
                  30 Jahre vorausgedacht.
                </h1>
                <p
                  className="text-muted-foreground"
                  style={{ fontSize: '1.0625rem', lineHeight: 1.75, maxWidth: 500 }}
                >
                  {heroCopy.heroBody}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/login">
                  <button
                    className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                    style={{
                      background: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                    }}
                  >
                    {heroCopy.ctaPrimary}
                    <ArrowRight size={16} />
                  </button>
                </Link>
                <Link to="/demo">
                  <button
                    className="rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors hover:text-foreground"
                    style={{
                      borderColor: 'var(--border-strong)',
                      color: 'var(--muted-foreground)',
                      background: 'transparent',
                    }}
                  >
                    {heroCopy.ctaSecondary}
                  </button>
                </Link>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {trustPoints.map((point) => (
                  <div key={point} className="flex items-start gap-2.5">
                    <CheckCircle2
                      size={15}
                      className="mt-0.5 shrink-0"
                      style={{ color: 'var(--success)' }}
                    />
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: mini preview card */}
            <div className="flex justify-center lg:justify-end">
              <div
                className="w-full rounded-2xl border p-6"
                style={{
                  maxWidth: 420,
                  background: 'var(--card)',
                  borderColor: 'var(--border-strong)',
                }}
              >
                {/* Fake topbar */}
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Nettovermögen</span>
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{ background: 'var(--accent-soft)', color: 'var(--primary)' }}
                  >
                    +12.4%
                  </span>
                </div>
                <div className="mb-1">
                  <span
                    className="mono-num"
                    style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--foreground)', letterSpacing: '-0.04em' }}
                  >
                    CHF 380 000
                  </span>
                </div>
                <p className="mb-6 text-xs" style={{ color: 'var(--fg-dim)' }}>
                  Prognose für Pensionierung mit 63
                </p>

                {/* Fake sparkline area */}
                <svg viewBox="0 0 380 80" className="w-full" style={{ overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="ph-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c4f25a" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#c4f25a" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,70 C40,65 70,55 110,45 C150,35 180,40 220,30 C260,20 300,15 380,5"
                    fill="none"
                    stroke="#c4f25a"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M0,70 C40,65 70,55 110,45 C150,35 180,40 220,30 C260,20 300,15 380,5 L380,80 L0,80 Z"
                    fill="url(#ph-grad)"
                  />
                </svg>

                <div
                  className="mt-5 grid grid-cols-3 gap-3 rounded-xl p-4"
                  style={{ background: 'var(--bg-elev)' }}
                >
                  {[
                    { label: 'AHV', value: '2 645/Mt.' },
                    { label: 'PK', value: '1 890/Mt.' },
                    { label: 'Säule 3a', value: '87 000' },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs" style={{ color: 'var(--fg-dim)' }}>{item.label}</p>
                      <p className="mono-num mt-1 text-sm font-medium text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Value Pillars ─────────────────────────────────────────── */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="mx-auto px-6 py-16 lg:px-8 lg:py-20" style={{ maxWidth: 1280 }}>
          <div className="mb-10 space-y-3">
            <p className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--primary)' }}>
              Warum FinPlan
            </p>
            <h2
              className="text-foreground"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.25, maxWidth: 640 }}
            >
              Viele wissen, dass sie ihre Finanzen besser strukturieren sollten. Wenige haben dafür ein gutes System.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {valuePillars.map((pillar) => {
              const Icon = pillar.icon
              return (
                <div
                  key={pillar.title}
                  className="rounded-2xl border p-6"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                >
                  <div
                    className="mb-4 inline-flex rounded-xl p-2.5"
                    style={{ background: 'var(--accent-soft)' }}
                  >
                    <Icon size={18} style={{ color: 'var(--primary)' }} />
                  </div>
                  <h3
                    className="mb-2 text-sm font-medium text-foreground"
                    style={{ lineHeight: 1.4 }}
                  >
                    {pillar.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    {pillar.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Process / How it works ────────────────────────────────── */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="mx-auto px-6 py-16 lg:px-8 lg:py-20" style={{ maxWidth: 1280 }}>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-start">
            <div className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--primary)' }}>
                So funktioniert der Einstieg
              </p>
              <h2
                className="text-foreground"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.3 }}
              >
                Vom ersten Überblick zum persönlichen Finanzfahrplan
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)', maxWidth: 360 }}>
                Die App ist so aufgebaut, dass du nicht mit Fachbegriffen hängen bleibst,
                sondern zügig zu einer belastbaren und anpassbaren Entscheidungsgrundlage kommst.
              </p>
            </div>

            <div className="space-y-3">
              {processSteps.map((step) => (
                <div
                  key={step.step}
                  className="flex gap-5 rounded-2xl border p-5"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                >
                  <div
                    className="mono-num flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-semibold"
                    style={{ background: 'var(--accent-soft)', color: 'var(--primary)' }}
                  >
                    {step.step}
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-foreground">{step.title}</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Audience ─────────────────────────────────────────────── */}
      <section style={{ background: 'var(--bg-elev)', borderBottom: '1px solid var(--border)' }}>
        <div className="mx-auto px-6 py-16 lg:px-8 lg:py-20" style={{ maxWidth: 1280 }}>
          <p className="mb-8 text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--fg-dim)' }}>
            Für wen
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {audienceCards.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border p-6"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                >
                  <Icon size={18} className="mb-4" style={{ color: 'var(--muted-foreground)' }} />
                  <h3 className="mb-2 text-sm font-medium text-foreground">{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    {item.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="mx-auto px-6 py-16 lg:px-8 lg:py-20" style={{ maxWidth: 1280 }}>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--primary)' }}>
                Häufige Fragen
              </p>
              <h2
                className="text-foreground"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.3 }}
              >
                Erst verstehen, dann registrieren
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)', maxWidth: 380 }}>
                Besucher sollen zuerst verstehen, warum FinPlan relevant ist, wie die App hilft und was sie im geschützten Bereich erwartet.
              </p>

              {/* KPI strip */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                {[
                  { label: 'Berechnungstiefe', value: '30 Jahre' },
                  { label: 'Schweizer Kantone', value: '26' },
                  { label: 'Säulen abgedeckt', value: '3' },
                  { label: 'Szenarien je Plan', value: 'unbegrenzt' },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-xl border p-4"
                    style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                  >
                    <p
                      className="mono-num text-lg font-semibold"
                      style={{ color: 'var(--primary)', letterSpacing: '-0.03em' }}
                    >
                      {kpi.value}
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: 'var(--fg-dim)' }}>{kpi.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {faqItems.map((item) => (
                <div
                  key={item.question}
                  className="rounded-2xl border p-5"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                >
                  <p className="mb-2 text-sm font-medium text-foreground">{item.question}</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section>
        <div className="mx-auto px-6 py-16 lg:px-8 lg:py-20" style={{ maxWidth: 1280 }}>
          <div
            className="rounded-2xl border p-10 lg:p-14"
            style={{
              background: 'var(--card)',
              borderColor: 'rgba(196,242,90,0.2)',
              boxShadow: '0 0 80px rgba(196,242,90,0.04)',
            }}
          >
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} style={{ color: 'var(--primary)' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
                    Nächster sinnvoller Schritt
                  </span>
                </div>
                <h2
                  className="text-foreground"
                  style={{
                    fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                    fontWeight: 500,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.25,
                    maxWidth: 560,
                  }}
                >
                  Wenn du deine Finanzplanung geordnet, flexibel und langfristig angehen willst, ist das der richtige Einstieg.
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)', maxWidth: 520 }}>
                  Sieh dir zuerst die Demo an oder wechsle direkt in den geschützten Bereich,
                  wenn du mit deinen eigenen Daten arbeiten möchtest.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 lg:flex-col">
                <Link to="/login">
                  <button
                    className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90"
                    style={{
                      background: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Kostenlos anmelden
                    <ArrowRight size={15} />
                  </button>
                </Link>
                <Link to="/demo">
                  <button
                    className="rounded-xl border px-6 py-3 text-sm font-medium transition-colors hover:text-foreground"
                    style={{
                      borderColor: 'var(--border-strong)',
                      color: 'var(--muted-foreground)',
                      background: 'transparent',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Demo öffnen
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
