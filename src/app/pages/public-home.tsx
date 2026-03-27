import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  BookOpen,
  CheckCircle2,
  Clock3,
  Compass,
  FileSpreadsheet,
  LineChart,
  LockKeyhole,
  PiggyBank,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react'
import { Button } from '../components/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/card'

const valuePillars = [
  {
    title: 'Finanzen endlich in einer klaren Struktur',
    description:
      'Einkommen, Vermoegen, Vorsorge, Wohnen und Ziele werden in einer logischen Oberflaeche zusammengefuehrt statt ueber Notizen, PDFs und Excel verteilt.',
    icon: Compass,
  },
  {
    title: 'Szenarien statt Bauchgefuehl',
    description:
      'Vergleiche Varianten fuer Sparquote, Saeule 3a, Eigenheim, Reserve und Anlageentscheidungen in einer gemeinsamen Sicht.',
    icon: LineChart,
  },
  {
    title: 'Flexible Finanzplanung wie dein Leben',
    description:
      'Wenn sich Einkommen, Familie, Wohnen oder Ziele aendern, passt du deinen Plan einfach an statt wieder bei null zu beginnen.',
    icon: RefreshCw,
  },
  {
    title: 'Lebenslanger Begleiter statt Einmal-Tool',
    description:
      'FinPlan soll dich langfristig begleiten, an wichtige Finanzaufgaben erinnern und aus Vorhaben konkrete naechste Schritte machen.',
    icon: BellRing,
  },
]

const outcomeStats = [
  { label: 'Weniger verstreute Finanzinfos', value: '1 zentraler Arbeitsbereich' },
  { label: 'Mehr Klarheit bei Entscheidungen', value: 'Mehrere Varianten vergleichbar' },
  { label: 'Nicht statisch, sondern anpassbar', value: 'Plan laufend weiterentwickelbar' },
]

const audienceCards = [
  {
    title: 'Fuer Berufstaetige mit wenig Zeit',
    description:
      'Wenn du grundsaetzlich gut verdienst, aber deine Finanzthemen immer wieder vertagst, schafft FinPlan Struktur ohne Komplexitaetsballast.',
    icon: Clock3,
  },
  {
    title: 'Fuer Menschen mit konkreten Zielen',
    description:
      'Ob Pensionsplanung, Eigenheim, Vermoegensaufbau oder Vorsorge: Du siehst, welche Stellhebel deine Ziele tatsaechlich beeinflussen.',
    icon: Target,
  },
  {
    title: 'Fuer Menschen in Veraenderung',
    description:
      'Wenn sich dein Leben bewegt, soll deine Finanzplanung nicht starr bleiben. FinPlan ist darauf ausgelegt, Ereignisse und neue Prioritaeten mitzunehmen.',
    icon: RefreshCw,
  },
  {
    title: 'Fuer alle, die Ordnung statt Toolsammlung wollen',
    description:
      'FinPlan ersetzt das Springen zwischen Rechnern, Dokumenten, Kalender-Notizen und Halbwissen durch einen konsistenten Planungsraum.',
    icon: FileSpreadsheet,
  },
]

const processSteps = [
  {
    step: '1',
    title: 'Situation erfassen',
    description:
      'Du hinterlegst die wichtigsten Eckdaten zu Einkommen, Ausgaben, Vermoegen, Vorsorge und Zielen.',
  },
  {
    step: '2',
    title: 'Optionen vergleichen und flexibel anpassen',
    description:
      'Du testest Varianten, bewertest ihre Auswirkungen und passt deinen Plan an, wenn sich Einkommen, Familie oder Wohnsituation veraendern.',
  },
  {
    step: '3',
    title: 'Dranbleiben, erinnert werden, nachsteuern',
    description:
      'FinPlan soll dich langfristig begleiten, auf offene Finanzaufgaben aufmerksam machen und dich beim Nachfassen wichtiger Themen unterstuetzen.',
  },
]

const trustPoints = [
  'Oeffentlich zugaengliche Produktseite ohne harte Login-Wand',
  'Persoenliche Daten und gespeicherte Varianten bleiben im geschuetzten Bereich',
  'Demo und Wissensbereich geben Orientierung, bevor du dich registrierst',
  'Die App ist auf praktische Entscheidungen und wiederkehrende Finanztasks ausgelegt',
]

const faqItems = [
  {
    question: 'Muss ich mich sofort registrieren?',
    answer:
      'Nein. Die Startseite, der Wissensbereich und die Demo sind oeffentlich. Erst wenn du mit deinen eigenen Daten arbeiten willst, wechselst du in den geschuetzten Bereich.',
  },
  {
    question: 'Ist das nur ein Finanzrechner?',
    answer:
      'Nein. FinPlan ist als Arbeitsumgebung gedacht: Daten strukturieren, Varianten vergleichen, Auswirkungen verstehen, Planung laufend anpassen und daraus konkrete naechste Schritte ableiten.',
  },
  {
    question: 'Warum ist das ueberzeugender als einzelne Tools?',
    answer:
      'Weil nicht nur gerechnet wird. Die Staerke liegt darin, Informationen, Entscheidungen, Erinnerungen und Orientierung an einem Ort zusammenzufuehren.',
  },
  {
    question: 'Bleibt FinPlan auch spaeter relevant?',
    answer:
      'Ja, genau das ist die Richtung. FinPlan soll kein Tool fuer einen einmaligen Setup-Moment sein, sondern ein langfristiger Begleiter mit Erinnerungen an wichtige Finanzthemen und offene To-dos.',
  },
]

export function PublicHome() {
  return (
    <div className="min-h-[calc(100vh-4rem)] overflow-hidden bg-background">
      <section className="relative border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,76,117,0.18),_transparent_36%),radial-gradient(circle_at_80%_20%,_rgba(50,130,184,0.14),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_32%),linear-gradient(180deg,_rgba(255,255,255,0.86),_rgba(248,249,251,1))]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-24">
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-1.5 text-sm text-primary">
                <Sparkles className="h-4 w-4" />
                Finanzplanung fuer die Schweiz, verstaendlich gemacht
              </span>
              <h1 className="max-w-4xl text-4xl leading-tight text-foreground sm:text-5xl lg:text-6xl">
                Weniger Unsicherheit. Mehr Ueberblick. Ein Finanzplan, der mit deinem Leben mitgeht.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                FinPlan hilft dir, deine finanzielle Situation sauber zu erfassen, Varianten
                zu vergleichen und bessere Entscheidungen zu treffen. Die Planung bleibt
                anpassbar, wenn sich dein Leben veraendert, und soll dich langfristig bei
                wichtigen Finanzaufgaben begleiten. Ohne Beratungssprache, ohne Tool-Chaos,
                ohne Login-Zwang auf der ersten Seite.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/login">
                <Button size="lg" className="shadow-lg shadow-primary/15">
                  Jetzt starten
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="outline" size="lg">
                  Demo ansehen
                </Button>
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {trustPoints.map((point) => (
                <div
                  key={point}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-card/75 px-4 py-4 backdrop-blur"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <p className="text-sm leading-6 text-foreground">{point}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="rounded-[2rem] border-primary/10 bg-card/90 p-0 shadow-2xl shadow-primary/10 backdrop-blur">
              <CardContent className="space-y-6 p-8">
                <div className="flex items-start justify-between gap-4 rounded-3xl bg-primary/5 p-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Was FinPlan liefert</p>
                    <p className="text-3xl leading-tight text-primary">
                      Klarheit fuer finanzielle Entscheidungen und naechste Schritte
                    </p>
                    <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                      Statt reaktiv zu handeln, siehst du Optionen, Prioritaeten, anpassbare
                      Plaene und spaeter auch Erinnerungen an wichtige Finanzthemen.
                    </p>
                  </div>
                  <div className="rounded-3xl bg-success/10 p-4 text-success">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {outcomeStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-border bg-background p-4 sm:min-h-32"
                    >
                      <p className="text-sm leading-6 text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="mt-2 break-words text-lg leading-7 text-foreground">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="rounded-3xl border border-border bg-[linear-gradient(135deg,rgba(15,76,117,0.06),rgba(50,130,184,0.02))] p-6">
                  <div className="flex items-center gap-3">
                    <BadgeCheck className="h-5 w-5 text-primary" />
                    <p className="text-sm text-primary">Oeffentlicher Einstieg, geschuetzter Arbeitsbereich</p>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-card p-4">
                      <p className="text-sm text-muted-foreground">Oeffentlich sichtbar</p>
                      <p className="mt-2 text-sm leading-6 text-foreground">
                        Nutzen, Demo, Wissensbereich und Produktverstaendnis ohne Registrierung.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-card p-4">
                      <p className="text-sm text-muted-foreground">Geschuetzt nach Login</p>
                      <p className="mt-2 text-sm leading-6 text-foreground">
                        Persoenliche Angaben, gespeicherte Varianten, Profilinformationen und
                        dein individueller Planungsstand.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground">
            Warum diese App relevant ist
          </span>
          <h2 className="text-3xl leading-tight text-foreground sm:text-4xl">
            Viele Menschen wissen, dass sie ihre Finanzen besser strukturieren sollten. Wenige haben dafuer ein gutes System.
          </h2>
          <p className="text-lg leading-8 text-muted-foreground">
            Genau hier setzt FinPlan an: weniger Reibung, weniger Unsicherheit und ein
            klarer Ablauf, der dich vom Ueberblick zur Entscheidung fuehrt und bei
            Veraenderungen nicht aus der Kurve traegt.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          {valuePillars.map((pillar) => {
            const Icon = pillar.icon
            return (
              <Card key={pillar.title} className="rounded-[1.75rem] border-border/80 bg-card">
                <CardHeader className="space-y-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{pillar.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-7 text-muted-foreground">{pillar.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="border-y border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {audienceCards.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="rounded-[1.75rem] border border-border bg-background px-6 py-7"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl text-foreground">{item.title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-4">
            <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
              So funktioniert der Einstieg
            </span>
            <h2 className="text-3xl leading-tight text-foreground sm:text-4xl">
              Vom ersten Ueberblick bis zum persoenlichen Finanzfahrplan
            </h2>
            <p className="text-lg leading-8 text-muted-foreground">
              Die App ist so aufgebaut, dass du nicht mit Fachbegriffen haengen bleibst,
              sondern zuegig zu einer belastbaren und veraenderbaren Entscheidungsgrundlage kommst.
            </p>
          </div>

          <div className="space-y-5">
            {processSteps.map((step) => (
              <div
                key={step.step}
                className="flex gap-4 rounded-[1.75rem] border border-border bg-card px-6 py-6"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  {step.step}
                </div>
                <div>
                  <h3 className="text-xl text-foreground">{step.title}</h3>
                  <p className="mt-2 leading-7 text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-[linear-gradient(180deg,rgba(15,76,117,0.04),rgba(248,249,251,0.7))]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-[2rem] border-primary/10 bg-card/95 p-0 shadow-lg shadow-primary/5">
              <CardContent className="space-y-6 p-8">
                <div className="flex items-center gap-3">
                  <LockKeyhole className="h-5 w-5 text-primary" />
                  <p className="text-sm text-primary">Vertrauen entsteht durch klare Trennung</p>
                </div>
                <h2 className="text-3xl leading-tight text-foreground">
                  Erst verstehen, dann registrieren
                </h2>
                <p className="leading-8 text-muted-foreground">
                  Gute Nutzerfuehrung beginnt nicht mit einem Formular. Besucher sollen zuerst
                  verstehen, warum FinPlan relevant ist, wie die App hilft und was sie im
                  geschuetzten Bereich erwartet: eine flexible Finanzplanung und ein System,
                  das langfristig beim Dranbleiben hilft.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-background p-5">
                    <PiggyBank className="h-6 w-6 text-success" />
                    <p className="mt-4 text-lg text-foreground">Mehr Relevanz</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Besucher steigen ueber echten Nutzen ein statt ueber Technik oder Pflichtfelder.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background p-5">
                    <BookOpen className="h-6 w-6 text-primary" />
                    <p className="mt-4 text-lg text-foreground">Mehr Langfristigkeit</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      FinPlan soll nicht nach dem Setup enden, sondern dich ueber Zeit mit Planung, Aufgaben und Erinnerungen begleiten.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {faqItems.map((item) => (
                <div
                  key={item.question}
                  className="rounded-[1.5rem] border border-border bg-card px-6 py-6"
                >
                  <h3 className="text-xl text-foreground">{item.question}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-primary/10 bg-[linear-gradient(135deg,rgba(15,76,117,0.98),rgba(50,130,184,0.9))] px-6 py-10 text-primary-foreground sm:px-10 lg:px-12 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-4">
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm">
                Naechster sinnvoller Schritt
              </span>
              <h2 className="text-3xl leading-tight sm:text-4xl">
                Wenn du deine Finanzplanung geordnet, flexibel und langfristig angehen willst, ist das der richtige Einstieg.
              </h2>
              <p className="max-w-2xl text-base leading-8 text-primary-foreground/85">
                Sieh dir zuerst die Demo an oder wechsle direkt in den geschuetzten Bereich,
                wenn du mit deinen eigenen Daten arbeiten und daraus einen anpassbaren Finanzplan entwickeln moechtest.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link to="/demo">
                <Button
                  size="lg"
                  className="border border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Demo oeffnen
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  Kostenlos anmelden
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
