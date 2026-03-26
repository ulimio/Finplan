import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/card';
import { Select } from '../components/select';
import { Button } from '../components/button';
import {
  AlertCircle,
  ArrowRight,
  Baby,
  Briefcase,
  CheckCircle2,
  Circle,
  Home,
  Lightbulb,
  Plane,
  Target,
  TrendingUp,
  User,
  Wallet,
} from 'lucide-react';
import {
  analyseVariante,
  berechneAlter,
  formatCurrency,
  formatPercent,
  loadStoredProfile,
  loadStoredVarianten,
} from '../lib/finance-data';
import type { ProfilSnapshot, Variante } from '../lib/finance-data';

const EVENT_ICONS = {
  kind: Baby,
  wohneigentum: Home,
  teilzeit: Briefcase,
  sabbatical: Plane,
  sonstiges: Target,
} as const;

function getGreeting(profile: ProfilSnapshot) {
  if (profile.vorname.trim()) {
    return `Willkommen zurück, ${profile.vorname.trim()}.`;
  }

  return 'Willkommen in deinem Finanz-Dashboard.';
}

function getActiveVariant(varianten: Variante[], selectedVariantId: string) {
  return varianten.find((entry) => entry.id === selectedVariantId) ?? varianten[0];
}

function buildTasks(profile: ProfilSnapshot, activeVariante: Variante) {
  return [
    {
      id: 'profil',
      title: 'Profildaten vervollständigen',
      detail: 'Ergänze offene Profilbereiche, damit Hochrechnung, Vorsorge und Steuern präziser werden.',
      done: Object.values(profile.sectionStatus).every((status) => status !== 'incomplete'),
      href: '/app/profil',
    },
    {
      id: '3a',
      title: 'Säule 3a festlegen',
      detail: 'Die aktive Strategie nutzt das steuerbegünstigte 3a-Potenzial noch nicht vollständig.',
      done: activeVariante.sparrate3a > 0,
      href: '/app/varianten',
    },
    {
      id: 'anlagen',
      title: 'Monatliche Anlagesparrate definieren',
      detail: 'Lege eine Wertschriften-Sparrate fest, damit Vermögensaufbau und Zielerreichung belastbarer werden.',
      done: activeVariante.sparrateWertschriften > 0,
      href: '/app/varianten',
    },
    {
      id: 'reserve',
      title: 'Liquiditätsreserve absichern',
      detail: 'Prüfe, ob deine freie Liquidität dein Notgroschen-Ziel bereits erreicht.',
      done: profile.liquiditaet >= profile.notgroschenZiel,
      href: '/app/profil',
    },
  ];
}

function buildRecommendations(profile: ProfilSnapshot, activeVariante: Variante, endvermoegen: number) {
  const recommendations = [];

  if (activeVariante.sparrate3a === 0) {
    recommendations.push({
      title: '3a in die Strategie aufnehmen',
      body: 'Die aktive Variante verschenkt aktuell steuerbegünstigtes Vorsorgepotenzial.',
      impact: 'Direkter Hebel auf Steuern und Vorsorgevermögen',
      tone: 'warning',
    });
  }

  if (profile.pkGuthaben > 0 && profile.grenzsteuersatz >= 15) {
    recommendations.push({
      title: 'PK-Einkauf fachlich prüfen',
      body: 'Mit vorhandenem PK-Kapital und bekanntem Grenzsteuersatz lohnt sich eine konkrete Einkauf-Prüfung.',
      impact: 'Hoher Hebel auf Steuern und Ruhestandseinkommen',
      tone: 'success',
    });
  }

  if (profile.hypothek > 0 && activeVariante.amortisation === 0) {
    recommendations.push({
      title: 'Amortisationsstrategie ergänzen',
      body: 'Für bestehende Hypotheken fehlt in der aktiven Variante noch eine klare Rückzahlungslogik.',
      impact: 'Verbessert Cashflow und Schuldenabbau',
      tone: 'primary',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: 'Strategie weiter schärfen',
      body: 'Die Grundlogik ist stimmig. Als Nächstes lohnt sich der Vergleich zusätzlicher Szenarien.',
      impact: `Projektion aktuell: ${formatCurrency(endvermoegen)} bis 65`,
      tone: 'success',
    });
  }

  return recommendations.slice(0, 3);
}

export function Dashboard({ isLoggedIn, userId }: { isLoggedIn: boolean; userId?: string }) {
  const [profile, setProfile] = useState<ProfilSnapshot>(() => loadStoredProfile(userId));
  const [varianten, setVarianten] = useState<Variante[]>(() => loadStoredVarianten(userId, loadStoredProfile(userId)));
  const [selectedVariantId, setSelectedVariantId] = useState('basis');

  useEffect(() => {
    const nextProfile = loadStoredProfile(userId);
    const nextVarianten = loadStoredVarianten(userId, nextProfile);

    setProfile(nextProfile);
    setVarianten(nextVarianten);
    setSelectedVariantId((current) => (nextVarianten.some((entry) => entry.id === current) ? current : nextVarianten[0]?.id ?? 'basis'));
  }, [userId]);

  const activeVariante = useMemo(() => getActiveVariant(varianten, selectedVariantId), [selectedVariantId, varianten]);
  const activeAnalyse = useMemo(() => analyseVariante(activeVariante, profile), [activeVariante, profile]);

  const profileSections = Object.values(profile.sectionStatus);
  const completedSections = profileSections.filter((status) => status === 'complete' || status === 'skipped').length;
  const profileProgress = Math.round((completedSections / profileSections.length) * 100);
  const totalAssets =
    profile.liquiditaet +
    profile.wertschriften +
    profile.immobilienwert +
    profile.sonstigesVermoegen +
    profile.pkGuthaben +
    profile.saule3aGesamt;
  const totalLiabilities = profile.hypothek + profile.konsumkredite;
  const netWorth = totalAssets - totalLiabilities;
  const annualSaving =
    activeVariante.sparrate3a +
    activeVariante.sparrateWertschriften * 12 +
    activeVariante.amortisation * 12;
  const yearsToRetirement = Math.max(1, 65 - berechneAlter(profile.geburtsdatum));
  const emergencyReserveGap = Math.max(0, profile.notgroschenZiel - profile.liquiditaet);
  const tasks = buildTasks(profile, activeVariante);
  const completedTasks = tasks.filter((task) => task.done).length;
  const recommendations = buildRecommendations(profile, activeVariante, activeAnalyse.endvermoegen);
  const variantOptions = varianten.map((entry) => ({ value: entry.id, label: entry.name }));
  const chartData = activeAnalyse.vermoegensverlauf.map((entry, index) => ({
    jahr: entry.jahr,
    vermoegen: entry.vermoegen,
    vorsorge: profile.pkGuthaben + profile.saule3aGesamt + index * activeVariante.sparrate3a,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm text-primary">{getGreeting(profile)}</p>
              <div>
                <h1 className="text-3xl text-foreground">Dashboard</h1>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                  Hier siehst du deine aktuelle finanzielle Ausgangslage, die aktive Strategie und die nächsten sinnvollen Schritte im Überblick.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to={isLoggedIn ? '/app/profil' : '/login'}>
                <Button variant="outline">
                  <User className="mr-2 h-4 w-4" />
                  Profil öffnen
                </Button>
              </Link>
              <Link to={isLoggedIn ? '/app/varianten' : '/login'}>
                <Button>
                  <Wallet className="mr-2 h-4 w-4" />
                  Varianten öffnen
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className={profileProgress >= 75 ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'}>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Profil-Fortschritt</p>
              <p className="text-2xl text-foreground">{profileProgress}%</p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-all" style={{ width: `${profileProgress}%` }} />
            </div>
            <p className="text-sm text-muted-foreground">
              {completedSections} von {profileSections.length} Bereichen sind sauber ausgefüllt.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground">Aktuelles Nettovermögen</p>
            <p className="mt-2 text-2xl text-foreground">{formatCurrency(netWorth)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Vermögen {formatCurrency(totalAssets)} minus Schulden {formatCurrency(totalLiabilities)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground">Jährliche Spar- & Tilgungsleistung</p>
            <p className="mt-2 text-2xl text-primary">{formatCurrency(annualSaving)}</p>
            <p className="mt-1 text-xs text-muted-foreground">3a, Wertschriften-Sparen und Amortisation zusammen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground">Projiziertes Vermögen mit 65</p>
            <p className="mt-2 text-2xl text-success">{formatCurrency(activeAnalyse.endvermoegen)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Basierend auf der aktuell gewählten Strategie</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground">Jahre bis Pension</p>
            <p className="mt-2 text-2xl text-foreground">{yearsToRetirement}</p>
            <p className="mt-1 text-xs text-muted-foreground">Modell bis Alter 65</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.8fr_1fr]">
        <div className="space-y-8">
          <Card>
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <CardTitle>Vermögens- und Vorsorgeentwicklung</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Die Projektion basiert direkt auf deiner aktiven Variante.
                </p>
              </div>
              <div className="w-full max-w-sm">
                <Select
                  label="Aktive Variante"
                  value={activeVariante.id}
                  onChange={setSelectedVariantId}
                  options={variantOptions}
                />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={360}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="jahr" stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Line type="monotone" dataKey="vermoegen" name="Gesamtvermögen" stroke="#1d4ed8" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="vorsorge" name="PK + 3a" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-8 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Finanzübersicht heute</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">Jahreseinkommen brutto</p>
                    <p className="mt-1 text-lg text-foreground">{formatCurrency(profile.bruttoeinkommen + profile.variablesEinkommen)}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">Freie Liquidität</p>
                    <p className="mt-1 text-lg text-foreground">{formatCurrency(profile.liquiditaet)}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">Vorsorgevermögen</p>
                    <p className="mt-1 text-lg text-foreground">{formatCurrency(profile.pkGuthaben + profile.saule3aGesamt)}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">Notgroschen-Status</p>
                    <p className="mt-1 text-lg text-foreground">
                      {emergencyReserveGap === 0 ? 'Ziel erreicht' : `Noch ${formatCurrency(emergencyReserveGap)}`}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground">Lebensereignisse</p>
                  {profile.lebensereignisse.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {profile.lebensereignisse.map((ereignis) => {
                        const Icon = EVENT_ICONS[ereignis.typ] ?? Target;
                        return (
                          <div key={ereignis.id} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm text-foreground">
                            <Icon className="h-4 w-4 text-primary" />
                            <span>{ereignis.label}</span>
                            <span className="text-muted-foreground">{ereignis.jahr}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-foreground">Noch keine Lebensereignisse erfasst.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aktive Strategie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">Variante</p>
                    <p className="mt-1 text-lg text-foreground">{activeVariante.name}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">Risikoprofil / Aktienquote</p>
                    <p className="mt-1 text-lg text-foreground capitalize">
                      {activeVariante.risikoprofil} · {formatPercent(activeVariante.aktienquote)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">Säule 3a pro Jahr</p>
                    <p className="mt-1 text-lg text-foreground">{formatCurrency(activeVariante.sparrate3a)}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">Wertschriften pro Monat</p>
                    <p className="mt-1 text-lg text-foreground">{formatCurrency(activeVariante.sparrateWertschriften)}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">Amortisation pro Monat</p>
                    <p className="mt-1 text-lg text-foreground">{formatCurrency(activeVariante.amortisation)}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">Erwartete Rendite</p>
                    <p className="mt-1 text-lg text-foreground">{activeAnalyse.erwarteteRendite.toFixed(1)}% p.a.</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground">Strategie-Beschreibung</p>
                  <p className="mt-2 text-sm text-foreground">{activeVariante.beschreibung}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Optimierungsvorschläge</CardTitle>
              <p className="text-sm text-muted-foreground">
                Diese Hinweise leiten sich aus deinem Profil und der aktiven Variante ab.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.map((recommendation) => (
                <div
                  key={recommendation.title}
                  className={`rounded-lg border p-4 ${
                    recommendation.tone === 'warning'
                      ? 'border-warning/30 bg-warning/5'
                      : recommendation.tone === 'success'
                        ? 'border-success/30 bg-success/5'
                        : 'border-primary/30 bg-primary/5'
                  }`}
                >
                  <div className="flex gap-4">
                    <Lightbulb
                      className={`mt-1 h-5 w-5 shrink-0 ${
                        recommendation.tone === 'warning'
                          ? 'text-warning'
                          : recommendation.tone === 'success'
                            ? 'text-success'
                            : 'text-primary'
                      }`}
                    />
                    <div>
                      <h3 className="text-foreground">{recommendation.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{recommendation.body}</p>
                      <div className="mt-3 flex items-center gap-2 text-sm text-foreground">
                        <TrendingUp className="h-4 w-4 text-success" />
                        <span>{recommendation.impact}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Umsetzungsstand</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Erledigte Tasks</p>
                <p className="text-xl text-primary">
                  {completedTasks}/{tasks.length}
                </p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.round((completedTasks / tasks.length) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Die Tasks zeigen, was aus finanzplanerischer Sicht als Nächstes umgesetzt werden sollte.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.map((task) => (
                <Link
                  key={task.id}
                  to={isLoggedIn ? task.href : '/login'}
                  className="block rounded-lg border border-border p-3 transition-colors hover:bg-accent"
                >
                  <div className="flex items-start gap-3">
                    {task.done ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                    ) : (
                      <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm ${task.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{task.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{task.detail}</p>
                    </div>
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Finanzfahrplan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground">Heute</p>
                <p className="mt-1 text-lg text-foreground">
                  {berechneAlter(profile.geburtsdatum)} Jahre · Nettovermögen {formatCurrency(netWorth)}
                </p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground">Ziel finanzielle Freiheit</p>
                <p className="mt-1 text-lg text-foreground">{profile.wunschalterFreiheit} Jahre</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Modelliert mit aktiver Variante: {activeAnalyse.finanzielleFreiheitAlter ? `${activeAnalyse.finanzielleFreiheitAlter} Jahre` : 'noch nicht erreicht'}
                </p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground">Pensionierung</p>
                <p className="mt-1 text-lg text-foreground">In {yearsToRetirement} Jahren</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Erwartetes Vermögen bis 65: {formatCurrency(activeAnalyse.endvermoegen)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className={profile.grenzsteuersatz > 0 ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'}>
            <CardContent className="flex gap-3">
              <AlertCircle className={profile.grenzsteuersatz > 0 ? 'mt-1 h-5 w-5 shrink-0 text-success' : 'mt-1 h-5 w-5 shrink-0 text-warning'} />
              <div>
                <p className="text-sm text-foreground">
                  {profile.grenzsteuersatz > 0 ? 'Steuerdaten vorhanden' : 'Steuerdaten fehlen noch'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {profile.grenzsteuersatz > 0
                    ? `Der aktuelle Grenzsteuersatz ist mit ${formatPercent(profile.grenzsteuersatz)} im Profil hinterlegt.`
                    : 'Ergänze im Profil deinen Grenzsteuersatz oder lade die Steuerdaten hoch, damit Empfehlungen belastbarer werden.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {!isLoggedIn && (
            <Card className="border-warning/30 bg-warning/5">
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-warning" />
                  <p className="text-sm text-foreground">Demo-Modus</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  In der Demo werden keine persönlichen Daten geladen. Mit Login werden Profil und Varianten dauerhaft verbunden.
                </p>
                <Link to="/login">
                  <Button size="sm">Anmelden</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
