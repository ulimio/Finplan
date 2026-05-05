import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowRight, Bell, Lightbulb, Search, Shield, Zap } from 'lucide-react';
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
  getRecommendationCategoryLabel,
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

function chf(n: number) {
  if (!n && n !== 0) return '—';
  const abs = Math.abs(n);
  const sign = n < 0 ? '−' : '';
  if (abs >= 1_000_000) return `${sign}CHF ${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 2)} M`;
  if (abs >= 1_000) return `${sign}CHF ${Math.round(abs / 1000)}'${String(abs % 1000).padStart(3, '0')}`;
  return `${sign}CHF ${abs}`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Guten Morgen';
  if (h < 18) return 'Guten Tag';
  return 'Guten Abend';
}

// ─── KPI tile ────────────────────────────────────────────────
function KpiTile({ label, value, hint, toneColor }: { label: string; value: string; hint: string; toneColor?: string }) {
  return (
    <div
      className="rounded-2xl border p-4"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p
        className="mono-num mt-1 text-xl font-medium leading-tight"
        style={{ color: toneColor || 'var(--foreground)' }}
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
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
    setSelectedVariantId((current) => (nextVarianten.some((e) => e.id === current) ? current : nextVarianten[0]?.id ?? 'basis'));
  }, [userId]);

  const activeVariante = useMemo(() => getActiveVariant(varianten, selectedVariantId), [selectedVariantId, varianten]);
  const activeAnalyse = useMemo(() => analyseVariante(activeVariante, profile), [activeVariante, profile]);

  const profileSections = Object.values(profile.sectionStatus);
  const completedSections = profileSections.filter((s) => s === 'complete' || s === 'skipped').length;
  const profileProgress = Math.round((completedSections / profileSections.length) * 100);

  const totalAssets =
    profile.liquiditaet + profile.wertschriften + profile.immobilienwert +
    profile.sonstigesVermoegen + profile.pkGuthaben + profile.saule3aGesamt +
    profile.saule3bVermoegen + profile.partnerVermoegen;
  const netWorth = totalAssets - (profile.hypothek + profile.konsumkredite);

  const lastProjection = activeAnalyse.vermoegensverlauf.at(-1);
  const pensionProjected = lastProjection?.vermoegen ?? 0;

  const yearsToRetirement = Math.max(1, activeVariante.retirementAge - berechneAlter(profile.geburtsdatum));
  const emergencyReserveGap = Math.max(0, profile.notgroschenZiel - profile.liquiditaet);
  const tasks = buildTasks(profile, activeVariante, activeAnalyse.monatlicherUeberschussHeute);
  const completedTasks = tasks.filter((t) => t.done).length;

  const recommendations = buildDashboardRecommendations({
    profile, activeVariante, activeAnalyse, yearsToRetirement, emergencyReserveGap, variantCount: varianten.length,
  });
  const featuredRec = recommendations[0];

  const retirementGoal = profile.gewuenschteJahresausgabenRuhestand * 20;
  const targetPct = retirementGoal > 0 ? Math.min(100, Math.round((pensionProjected / retirementGoal) * 100)) : null;

  const incompleteTasks = tasks.filter((t) => !t.done).slice(0, 3);

  const displayName = [profile.vorname, profile.nachname].filter(Boolean).join(' ');
  const greeting = `${getGreeting()}${displayName ? `, ${displayName}.` : '.'}`;

  const variantOptions = varianten.map((e) => ({ value: e.id, label: e.name }));

  // Chart data
  const chartData = activeAnalyse.vermoegensverlauf.map((p) => ({ ...p, v: p.vermoegen }));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {/* ── Topbar ── */}
      <div
        className="flex items-center justify-between px-8"
        style={{ height: 64, borderBottom: '1px solid var(--border)', background: 'var(--background)' }}
      >
        <div className="flex flex-col justify-center">
          {activeVariante && (
            <p className="text-[11px]" style={{ color: 'var(--fg-dim)' }}>
              Planung · Aktive Variante: {activeVariante.name}
            </p>
          )}
          <p className="text-lg font-medium leading-tight text-foreground" style={{ letterSpacing: '-0.01em' }}>{greeting}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-xl border p-2 text-muted-foreground transition-colors hover:text-foreground" style={{ borderColor: 'var(--border-strong)', background: 'var(--card)' }}>
            <Search size={15} />
          </button>
          <button className="relative rounded-xl border p-2 text-muted-foreground transition-colors hover:text-foreground" style={{ borderColor: 'var(--border-strong)', background: 'var(--card)' }}>
            <Bell size={15} />
            {recommendations.length > 0 && (
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full" style={{ background: 'var(--primary)' }} />
            )}
          </button>
          <Link to={isLoggedIn ? '/app/varianten' : '/login'}>
            <button
              className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-all"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              Variante prüfen <ArrowRight size={14} />
            </button>
          </Link>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-8 py-7" style={{ maxWidth: 1280 }}>

        {/* Hero row */}
        <div className="mb-5 grid gap-5" style={{ gridTemplateColumns: '1fr 360px' }}>

          {/* Wealth hero */}
          <div
            className="rounded-2xl border p-6"
            style={{
              background: 'linear-gradient(180deg, var(--card), var(--bg-card-2))',
              borderColor: 'var(--border-strong)',
            }}
          >
            {/* Variant tabs + pill */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium"
                style={{ background: 'var(--accent-soft)', borderColor: 'rgba(196,242,90,0.25)', color: 'var(--primary)' }}
              >
                <Zap size={11} />
                {recommendations.length > 0 ? `${recommendations.length} Optimierungshinweis${recommendations.length > 1 ? 'e' : ''}` : 'Alles gut'}
              </div>
              <div className="flex gap-1 rounded-xl border p-1" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                {variantOptions.map((v) => (
                  <button
                    key={v.value}
                    onClick={() => setSelectedVariantId(v.value)}
                    className="rounded-lg px-3 py-1.5 text-xs transition-all"
                    style={selectedVariantId === v.value ? { background: 'var(--bg-card-2)', color: 'var(--foreground)' } : { color: 'var(--muted-foreground)' }}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* KPIs */}
            <div className="flex items-end gap-6">
              <div className="flex flex-col gap-1">
                <p className="text-[11px] text-muted-foreground">Nettovermögen heute</p>
                <p className="mono-num text-4xl font-medium leading-none text-foreground" style={{ letterSpacing: '-0.03em' }}>
                  {chf(netWorth)}
                </p>
              </div>
              <div className="h-12 w-px" style={{ background: 'var(--border)' }} />
              <div className="flex flex-col gap-1">
                <p className="text-[11px] text-muted-foreground">Bei Pension ({activeVariante.retirementAge} J.)</p>
                <p className="mono-num text-2xl font-medium leading-none text-foreground">{chf(pensionProjected)}</p>
                <p className="text-[11px]" style={{ color: 'var(--fg-dim)' }}>prognostiziert</p>
              </div>
              {targetPct !== null && (
                <>
                  <div className="h-12 w-px" style={{ background: 'var(--border)' }} />
                  <div className="flex flex-col gap-1">
                    <p className="text-[11px] text-muted-foreground">Ziel-Erreichung</p>
                    <p className="mono-num text-2xl font-medium leading-none" style={{ color: 'var(--primary)' }}>{targetPct}%</p>
                    <div className="h-1.5 w-28 overflow-hidden rounded-full" style={{ background: 'var(--muted)' }}>
                      <div className="h-full rounded-full" style={{ width: `${targetPct}%`, background: 'var(--primary)' }} />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mini chart */}
            {chartData.length > 2 && (
              <div className="mt-5">
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="wealthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c4f25a" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#c4f25a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="jahr" hide />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ background: 'var(--card)', border: '1px solid var(--border-strong)', borderRadius: 10, fontSize: 12 }}
                      labelStyle={{ color: 'var(--fg-dim)', fontSize: 11 }}
                      formatter={(val: number) => [formatCurrency(val), 'Vermögen']}
                    />
                    <Area type="monotone" dataKey="v" stroke="#c4f25a" strokeWidth={2} fill="url(#wealthGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="mt-1 flex justify-between font-mono text-[10px]" style={{ color: 'var(--fg-dim)' }}>
                  {chartData.filter((_, i) => i === 0 || i === Math.floor(chartData.length / 2) || i === chartData.length - 1).map((p) => (
                    <span key={p.jahr}>{p.jahr}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile completeness */}
          <div
            className="rounded-2xl border p-5"
            style={{ background: 'linear-gradient(160deg, rgba(122,166,255,0.07), var(--card))', borderColor: 'rgba(122,166,255,0.2)' }}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">Profil-Vollständigkeit</p>
              <p className="mono-num text-lg font-medium" style={{ color: 'var(--info)' }}>{profileProgress}%</p>
            </div>
            <div className="mb-3 h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--muted)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${profileProgress}%`, background: 'var(--info)' }} />
            </div>
            <p className="mb-3 text-[11px] text-muted-foreground">
              {completedSections} von {profileSections.length} Bereichen vollständig · beeinflusst die Prognose
            </p>
            <div className="flex flex-col gap-2">
              {incompleteTasks.length > 0 ? incompleteTasks.map((t) => (
                <Link key={t.id} to={isLoggedIn ? t.href : '/login'} style={{ textDecoration: 'none' }}>
                  <div
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors"
                    style={{ background: 'var(--bg-elev)', borderRadius: 10 }}
                  >
                    <span className="text-sm text-foreground">{t.title}</span>
                    <ArrowRight size={13} className="shrink-0 text-muted-foreground" />
                  </div>
                </Link>
              )) : (
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--success)' }}>
                  <Shield size={14} />
                  <span>Alle Bereiche vollständig</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KPI strip */}
        <div className="mb-5 grid grid-cols-4 gap-3">
          <KpiTile
            label="Mtl. Überschuss"
            value={chf(activeAnalyse.monatlicherUeberschussHeute)}
            hint="nach Steuern und Haushalt"
            toneColor={activeAnalyse.monatlicherUeberschussHeute >= 0 ? 'var(--success)' : 'var(--warning)'}
          />
          <KpiTile
            label="Rentenlücke p.a."
            value={activeAnalyse.rentenlueckeAbPension > 0 ? chf(-activeAnalyse.rentenlueckeAbPension) : '— keine'}
            hint={`vs. Ziel ${formatCurrency(profile.gewuenschteJahresausgabenRuhestand)}`}
            toneColor={activeAnalyse.rentenlueckeAbPension > 0 ? 'var(--warning)' : 'var(--success)'}
          />
          <KpiTile
            label="Tragbarkeit"
            value={profile.hypothek > 0 ? formatPercent(activeAnalyse.tragbarkeitQuote * 100) : '—'}
            hint={activeAnalyse.tragbarkeitStatus}
            toneColor={activeAnalyse.tragbarkeitStatus === 'kritisch' ? 'var(--warning)' : undefined}
          />
          <KpiTile
            label="Steuern & AHV"
            value={chf(activeAnalyse.steuerHeute)}
            hint={`Kanton ${profile.kanton?.toUpperCase() ?? '—'}`}
          />
        </div>

        {/* Recommendation hero */}
        {featuredRec && (
          <div
            className="mb-5 rounded-2xl border p-6"
            style={{
              background: 'linear-gradient(180deg, var(--card), var(--bg-card-2))',
              borderColor: 'rgba(196,242,90,0.25)',
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium"
                  style={{ background: 'var(--accent-soft)', borderColor: 'rgba(196,242,90,0.25)', color: 'var(--primary)' }}
                >
                  <Lightbulb size={11} />
                  Prio {featuredRec.priority} · {getRecommendationCategoryLabel(featuredRec.category)}
                </div>
                <span className="text-[11px]" style={{ color: 'var(--fg-dim)' }}>
                  Auf Cashflow & 30-Jahres-Sicht geprüft
                </span>
              </div>
              {recommendations.length > 1 && (
                <span className="text-[11px] text-muted-foreground">
                  {recommendations.length - 1} weitere Vorschläge
                </span>
              )}
            </div>

            <div className="flex items-start gap-8">
              <div className="min-w-0 flex-1">
                <p className="text-lg font-medium text-foreground" style={{ letterSpacing: '-0.01em' }}>{featuredRec.title}</p>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground" style={{ lineHeight: 1.65 }}>{featuredRec.body}</p>
                {featuredRec.impact && (
                  <p className="mt-3 text-sm text-foreground">{featuredRec.impact}</p>
                )}
              </div>
              <div className="flex shrink-0 flex-col gap-2" style={{ minWidth: 180 }}>
                {featuredRec.href && featuredRec.actionLabel && (
                  <Link to={isLoggedIn ? featuredRec.href : '/login'}>
                    <button
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
                      style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                    >
                      {featuredRec.actionLabel} <ArrowRight size={13} />
                    </button>
                  </Link>
                )}
                <button
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  style={{ border: 'none', background: 'transparent' }}
                >
                  Begründung lesen
                </button>
              </div>
            </div>

            {featuredRec.checks.length > 0 && (
              <div
                className="mt-5 grid gap-3 pt-5"
                style={{ borderTop: '1px solid var(--border)', gridTemplateColumns: 'repeat(3, 1fr)' }}
              >
                {featuredRec.checks.slice(0, 3).map((check) => (
                  <div key={check}>
                    <p className="text-[11px] text-muted-foreground">Geprüft</p>
                    <p className="mt-1 text-sm text-foreground">{check}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chart + sidebar */}
        <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 360px' }}>

          {/* Wealth chart */}
          <div className="rounded-2xl border p-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="font-medium text-foreground">Vermögensverlauf bis Pension</p>
                <p className="mt-1 text-[11px]" style={{ color: 'var(--fg-dim)' }}>
                  {chartData[0]?.jahr ?? '—'} → {chartData.at(-1)?.jahr ?? '—'} · inkl. Cashflow, Vorsorge und Lebensereignisse
                </p>
              </div>
              <select
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className="rounded-xl border px-3 py-2 text-xs text-foreground"
                style={{ background: 'var(--bg-elev)', borderColor: 'var(--border-strong)' }}
              >
                {variantOptions.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c4f25a" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#c4f25a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="jahr"
                  stroke="var(--fg-dim)"
                  tick={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fill: 'var(--fg-dim)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--fg-dim)"
                  tick={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fill: 'var(--fg-dim)' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                  width={48}
                />
                <Tooltip
                  contentStyle={{ background: 'var(--card)', border: '1px solid var(--border-strong)', borderRadius: 10, fontSize: 12 }}
                  labelStyle={{ color: 'var(--fg-dim)', fontSize: 11 }}
                  formatter={(val: number) => [formatCurrency(val), 'Vermögen']}
                />
                <Area type="monotone" dataKey="v" stroke="#c4f25a" strokeWidth={2} fill="url(#chartGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div
              className="mt-4 grid gap-3 pt-4"
              style={{ borderTop: '1px solid var(--border)', gridTemplateColumns: 'repeat(4, 1fr)' }}
            >
              {[
                { label: 'Freies Vermögen', value: chf(profile.liquiditaet + profile.wertschriften), color: 'var(--primary)' },
                { label: 'PK-Kapital', value: chf(activeAnalyse.pkKapitalZumPensionierungszeitpunkt), color: 'var(--info)' },
                { label: 'Säule 3a', value: chf(profile.saule3aGesamt), color: 'var(--success)' },
                { label: 'Immobilie netto', value: chf(Math.max(0, profile.immobilienwert - profile.hypothek)), color: 'var(--warning)' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center gap-1.5">
                    <span className="block h-1.5 w-1.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-[11px] text-muted-foreground">{item.label}</span>
                  </div>
                  <p className="mono-num mt-1 text-sm font-medium text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar cards */}
          <div className="flex flex-col gap-4">

            {/* Tasks */}
            <div className="rounded-2xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="mb-3 flex items-center justify-between">
                <p className="font-medium text-foreground">Tasks</p>
                <span
                  className="rounded-full border px-2.5 py-0.5 text-[11px] text-muted-foreground"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-card-2)' }}
                >
                  {completedTasks} / {tasks.length} erledigt
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {tasks.map((t) => (
                  <Link key={t.id} to={isLoggedIn ? t.href : '/login'} style={{ textDecoration: 'none' }}>
                    <div
                      className="flex items-start gap-3 rounded-xl px-3 py-2.5"
                      style={{ background: 'var(--bg-elev)', borderRadius: 10 }}
                    >
                      <div
                        className="mt-0.5 grid shrink-0 place-items-center rounded"
                        style={{
                          width: 16, height: 16, borderRadius: 5,
                          background: t.done ? 'var(--primary)' : 'transparent',
                          border: t.done ? 'none' : '1.5px solid var(--border-strong)',
                          color: 'var(--primary-foreground)',
                        }}
                      >
                        {t.done && (
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm" style={{ color: t.done ? 'var(--fg-dim)' : 'var(--foreground)', textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</p>
                        <p className="mt-0.5 text-[11px]" style={{ color: 'var(--fg-dim)' }}>{t.detail}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Risk check */}
            <div
              className="rounded-2xl border p-4"
              style={{
                background: activeAnalyse.risikoHinweise.length > 0
                  ? 'linear-gradient(160deg, rgba(240,184,90,0.06), var(--card))'
                  : 'linear-gradient(160deg, rgba(92,224,168,0.05), var(--card))',
                borderColor: activeAnalyse.risikoHinweise.length > 0
                  ? 'rgba(240,184,90,0.2)'
                  : 'rgba(92,224,168,0.18)',
              }}
            >
              <div className="flex gap-3">
                <div
                  className="mt-0.5 shrink-0 rounded-lg p-2"
                  style={{
                    background: activeAnalyse.risikoHinweise.length > 0 ? 'rgba(240,184,90,0.12)' : 'rgba(92,224,168,0.12)',
                    color: activeAnalyse.risikoHinweise.length > 0 ? 'var(--warning)' : 'var(--success)',
                  }}
                >
                  <Shield size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {activeAnalyse.risikoHinweise.length > 0 ? 'Risiko-Hinweise' : 'Risiko-Check ist grün'}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground" style={{ lineHeight: 1.55 }}>
                    {activeAnalyse.risikoHinweise.length > 0
                      ? activeAnalyse.risikoHinweise[0]
                      : 'Notgroschen, Versicherungen und Cashflow-Puffer wirken konsistent.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Pension quick facts */}
            <div className="rounded-2xl border p-4" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <p className="mb-3 text-sm font-medium text-foreground">Pension & Vorsorge</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'AHV-Prognose', value: chf(activeAnalyse.ahvPrognose) },
                  { label: 'PK-Rente', value: chf(activeAnalyse.pkPrognoseRente) },
                  { label: 'Netto ab Pension', value: chf(activeAnalyse.nettoRenteAbPension) },
                  { label: 'Frühpensionierung', value: activeAnalyse.fruehpensionierungMachbar ? 'machbar' : 'offen' },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl p-2.5" style={{ background: 'var(--bg-elev)' }}>
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                    <p className="mono-num mt-0.5 text-sm font-medium text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
