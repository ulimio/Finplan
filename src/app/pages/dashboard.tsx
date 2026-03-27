import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertCircle, ArrowRight, CheckCircle2, ExternalLink, Lightbulb, ShieldAlert, User, Wallet } from 'lucide-react';
import { Button } from '../components/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/card';
import { Select } from '../components/select';
import {
  analyseVariante,
  berechneAlter,
  formatCurrency,
  formatPercent,
  loadStoredProfile,
  loadStoredVarianten,
} from '../lib/finance-data';
import type { ProfilSnapshot, Variante } from '../lib/finance-data';
import {
  buildDashboardRecommendations,
  DASHBOARD_RECOMMENDATION_UI,
  getRecommendationCategoryLabel,
  getRecommendationToneClasses,
} from '../lib/dashboard-recommendations';

function getActiveVariant(varianten: Variante[], selectedVariantId: string) {
  return varianten.find((entry) => entry.id === selectedVariantId) ?? varianten[0];
}

function buildTasks(profile: ProfilSnapshot, activeVariante: Variante, monthlySurplus: number) {
  return [
    {
      id: 'haushalt',
      title: 'Haushalts-Cashflow vervollständigen',
      detail: 'Monatsausgaben, Krankenkasse, Wohnen und Betreuung sauber erfassen.',
      done: profile.monatlicheAusgaben > 0 && profile.wohnkostenMonat > 0 && profile.krankenkasseMonat > 0,
      href: '/app/profil',
    },
    {
      id: 'vorsorge',
      title: 'Ruhestandsziel konkretisieren',
      detail: 'Ruhestandsausgaben, Frühpensionierung und PK-/AHV-Logik ergänzen.',
      done: profile.gewuenschteJahresausgabenRuhestand > 0 && profile.fruehpensionierungsAlter > 0,
      href: '/app/profil',
    },
    {
      id: 'variante',
      title: 'Variante mit PK / 3a / ETF schärfen',
      detail: '3a, PK-Einkauf, Wertschriften und Kapitalbezug gegeneinander modellieren.',
      done: activeVariante.sparrate3a > 0 && activeVariante.sparrateWertschriften > 0,
      href: '/app/varianten',
    },
    {
      id: 'cashflow',
      title: 'Positiven Monatsüberschuss sichern',
      detail: 'Die Strategie sollte nicht auf dauerhaft negativem Cashflow laufen.',
      done: monthlySurplus >= 0,
      href: '/app/profil',
    },
  ];
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
    profile.saule3aGesamt +
    profile.saule3bVermoegen +
    profile.partnerVermoegen;
  const totalLiabilities = profile.hypothek + profile.konsumkredite;
  const netWorth = totalAssets - totalLiabilities;
  const yearsToRetirement = Math.max(1, activeVariante.retirementAge - berechneAlter(profile.geburtsdatum));
  const emergencyReserveGap = Math.max(0, profile.notgroschenZiel - profile.liquiditaet);
  const tasks = buildTasks(profile, activeVariante, activeAnalyse.monatlicherUeberschussHeute);
  const completedTasks = tasks.filter((task) => task.done).length;
  const recommendations = buildDashboardRecommendations({
    profile,
    activeVariante,
    activeAnalyse,
    yearsToRetirement,
    emergencyReserveGap,
    variantCount: varianten.length,
  });
  const featuredRecommendation = recommendations[0];
  const additionalRecommendations = recommendations.slice(1);
  const variantOptions = varianten.map((entry) => ({ value: entry.id, label: entry.name }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm text-primary">{profile.vorname.trim() ? `Willkommen zurück, ${profile.vorname.trim()}.` : 'Willkommen in deinem Finanz-Dashboard.'}</p>
              <div>
                <h1 className="text-3xl text-foreground">Dashboard</h1>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                  Fokus auf Cashflow, Vorsorge, Steuern, Tragbarkeit und Umsetzbarkeit für die Schweiz.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to={isLoggedIn ? '/app/profil' : '/login'}>
                <Button variant="outline">
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </Button>
              </Link>
              <Link to={isLoggedIn ? '/app/varianten' : '/login'}>
                <Button>
                  <Wallet className="mr-2 h-4 w-4" />
                  Varianten
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
            <p className="text-xs text-muted-foreground">Nettovermögen heute</p>
            <p className="mt-2 text-2xl text-foreground">{formatCurrency(netWorth)}</p>
            <p className="mt-1 text-xs text-muted-foreground">inkl. Vorsorge, freiem Vermögen und Partnervermögen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground">Monatlicher Überschuss</p>
            <p className={`mt-2 text-2xl ${activeAnalyse.monatlicherUeberschussHeute < 0 ? 'text-warning' : 'text-success'}`}>
              {formatCurrency(activeAnalyse.monatlicherUeberschussHeute)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">nach Modellsteuern, Wohnen und Haushalt</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground">Rentenlücke ab Pension</p>
            <p className={`mt-2 text-2xl ${activeAnalyse.rentenlueckeAbPension > 0 ? 'text-warning' : 'text-success'}`}>
              {formatCurrency(activeAnalyse.rentenlueckeAbPension)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">jährliche Differenz zum Ruhestandsziel</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground">Tragbarkeit Immobilie</p>
            <p className={`mt-2 text-2xl ${activeAnalyse.tragbarkeitStatus === 'kritisch' ? 'text-warning' : 'text-foreground'}`}>
              {formatPercent(activeAnalyse.tragbarkeitQuote * 100)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground capitalize">{activeAnalyse.tragbarkeitStatus}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Optimierungsvorschläge</CardTitle>
            <p className="text-sm text-muted-foreground">Die Hinweise basieren auf Cashflow, Ruhestand, Haushalt, Tragbarkeit und Risikologik.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {featuredRecommendation && (
              <div className={`rounded-2xl border p-6 ${getRecommendationToneClasses(featuredRecommendation.tone).card}`}>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getRecommendationToneClasses(featuredRecommendation.tone).badge}`}>
                        {getRecommendationCategoryLabel(featuredRecommendation.category)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {DASHBOARD_RECOMMENDATION_UI.labels.priority} {featuredRecommendation.priority}
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <Lightbulb className={`mt-1 h-6 w-6 shrink-0 ${getRecommendationToneClasses(featuredRecommendation.tone).icon}`} />
                      <div>
                        <h3 className="text-xl text-foreground">{featuredRecommendation.title}</h3>
                        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{featuredRecommendation.body}</p>
                        <p className="mt-4 text-sm text-foreground">{featuredRecommendation.impact}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full flex-col gap-3 lg:max-w-xs">
                    {featuredRecommendation.href && featuredRecommendation.actionLabel && (
                      <Link to={isLoggedIn ? featuredRecommendation.href : '/login'}>
                        <Button className="w-full">{featuredRecommendation.actionLabel}</Button>
                      </Link>
                    )}
                    {featuredRecommendation.externalUrl && featuredRecommendation.externalLabel && (
                      <a href={featuredRecommendation.externalUrl} target="_blank" rel="noreferrer">
                        <Button variant="outline" className="w-full">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          {featuredRecommendation.externalLabel}
                        </Button>
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-border/70 bg-background/80 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{DASHBOARD_RECOMMENDATION_UI.labels.checks}</p>
                    <div className="mt-3 space-y-2">
                      {featuredRecommendation.checks.map((check) => (
                        <div key={check} className="flex gap-2 text-sm text-foreground">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                          <span>{check}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-background/80 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{DASHBOARD_RECOMMENDATION_UI.labels.productHints}</p>
                    <div className="mt-3 space-y-2">
                      {(featuredRecommendation.productHints ?? ['Kein Produktfokus, zuerst die Planungslogik sauber machen.']).map((hint) => (
                        <div key={hint} className="flex gap-2 text-sm text-foreground">
                          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span>{hint}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {additionalRecommendations.length > 0 && (
              <div className="grid gap-4 xl:grid-cols-2">
                {additionalRecommendations.map((recommendation) => {
                  const toneClasses = getRecommendationToneClasses(recommendation.tone);
                  return (
                    <div key={recommendation.id} className={`rounded-xl border p-5 ${toneClasses.card}`}>
                      <div className="space-y-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${toneClasses.badge}`}>
                              {getRecommendationCategoryLabel(recommendation.category)}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {DASHBOARD_RECOMMENDATION_UI.labels.priority} {recommendation.priority}
                            </span>
                          </div>
                          <h3 className="mt-3 text-lg text-foreground">{recommendation.title}</h3>
                          <p className="mt-2 text-sm text-muted-foreground">{recommendation.body}</p>
                          <p className="mt-3 text-sm text-foreground">{recommendation.impact}</p>
                        </div>
                        <div className="space-y-2">
                          {recommendation.checks.map((check) => (
                            <div key={check} className="flex gap-2 text-sm text-foreground">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                              <span>{check}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.8fr_1fr]">
        <div className="space-y-8">
          <Card>
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <CardTitle>Vermögensverlauf bis Pension</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">Die Kurve nutzt Cashflow, Vorsorge, Steuern und Lebensereignisse.</p>
              </div>
              <div className="w-full max-w-sm">
                <Select label="Aktive Variante" value={activeVariante.id} onChange={setSelectedVariantId} options={variantOptions} />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={340}>
                <LineChart data={activeAnalyse.vermoegensverlauf}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="jahr" stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Line type="monotone" dataKey="vermoegen" name="Gesamtvermögen" stroke="#1d4ed8" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-8 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Steuern & Vorsorge heute</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-xs text-muted-foreground">Steuern + Sozialabgaben</p>
                  <p className="mt-1 text-lg text-foreground">{formatCurrency(activeAnalyse.steuerHeute)}</p>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-xs text-muted-foreground">Vermögenssteuer</p>
                  <p className="mt-1 text-lg text-foreground">{formatCurrency(activeAnalyse.vermoegenssteuerHeute)}</p>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-xs text-muted-foreground">AHV-Prognose</p>
                  <p className="mt-1 text-lg text-foreground">{formatCurrency(activeAnalyse.ahvPrognose)}</p>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-xs text-muted-foreground">PK-Rente prognostiziert</p>
                  <p className="mt-1 text-lg text-foreground">{formatCurrency(activeAnalyse.pkPrognoseRente)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pension & Bezug</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-xs text-muted-foreground">Netto-Einkommen ab Pension</p>
                  <p className="mt-1 text-lg text-foreground">{formatCurrency(activeAnalyse.nettoRenteAbPension)}</p>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-xs text-muted-foreground">Steuer auf Kapitalbezug</p>
                  <p className="mt-1 text-lg text-foreground">{formatCurrency(activeAnalyse.steuerBeiKapitalbezug)}</p>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-xs text-muted-foreground">PK-Kapital bei Pension</p>
                  <p className="mt-1 text-lg text-foreground">{formatCurrency(activeAnalyse.pkKapitalZumPensionierungszeitpunkt)}</p>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-xs text-muted-foreground">Frühpensionierung</p>
                  <p className="mt-1 text-lg text-foreground">{activeAnalyse.fruehpensionierungMachbar ? 'machbar' : 'noch nicht robust'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
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
                <div className="h-full bg-primary transition-all" style={{ width: `${Math.round((completedTasks / tasks.length) * 100)}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">Der Fokus liegt auf belastbaren Eingaben statt kosmetischen Häkchen.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.map((task) => (
                <Link key={task.id} to={isLoggedIn ? task.href : '/login'} className="block rounded-lg border border-border p-3 transition-colors hover:bg-accent">
                  <div className="flex items-start gap-3">
                    {task.done ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                    ) : (
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
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
              <CardTitle>Priorisierte Massnahmen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeAnalyse.priorisierteMassnahmen.map((massnahme) => (
                <div key={massnahme.id} className="rounded-lg border border-border p-3">
                  <p className="text-sm text-foreground">{massnahme.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{massnahme.summary}</p>
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>Impact {massnahme.impact}</span>
                    <span>Bedarf {formatCurrency(massnahme.liquiditaetsbedarf)}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className={activeAnalyse.risikoHinweise.length > 0 ? 'border-warning/30 bg-warning/5' : 'border-success/30 bg-success/5'}>
            <CardContent className="flex gap-3">
              <ShieldAlert className={activeAnalyse.risikoHinweise.length > 0 ? 'mt-1 h-5 w-5 shrink-0 text-warning' : 'mt-1 h-5 w-5 shrink-0 text-success'} />
              <div>
                <p className="text-sm text-foreground">Risiko-Check</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {activeAnalyse.risikoHinweise.length > 0
                    ? activeAnalyse.risikoHinweise.join(' ')
                    : 'Reserve, Haushaltslogik und Absicherung wirken aktuell konsistent.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
