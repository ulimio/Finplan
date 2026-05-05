import React, { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Copy, Layers, Plus, Settings, Trash2 } from 'lucide-react';
import { Button } from '../components/button';
import { Select } from '../components/select';
import { supabase } from '../../lib/supabase';
import {
  analyseVariante,
  createBasisVariante,
  formatCurrency,
  formatPercent,
  getVariantenStorageKey,
  loadStoredProfile,
  loadStoredVarianten,
} from '../lib/finance-data';
import type { Ereignis, ProfilSnapshot, Variante } from '../lib/finance-data';

/* ─── Shared style tokens ───────────────────────────────────── */
const card: React.CSSProperties = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '20px',
};

const cardAccent: React.CSSProperties = {
  background: 'linear-gradient(180deg, rgba(26,74,44,0.04), var(--card))',
  border: '1px solid var(--primary)',
  borderRadius: 'var(--radius)',
  padding: '20px',
  position: 'relative',
};

const mono: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
  fontVariantNumeric: 'tabular-nums',
  letterSpacing: '-0.02em',
};

const microLabel: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--muted-foreground)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

/* ─── Slider ────────────────────────────────────────────────── */
function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{label}</span>
        <span style={{ ...mono, fontSize: 13 }}>{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--primary)' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted-foreground)', ...mono }}>
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

/* ─── NumberField ───────────────────────────────────────────── */
function NumberField({
  label,
  value,
  onChange,
  step = 100,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        step={step}
        style={{
          background: 'var(--input-background)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '8px 12px',
          fontSize: 13,
          color: 'var(--foreground)',
          fontFamily: 'inherit',
          width: '100%',
        }}
      />
    </label>
  );
}

/* ─── FeasibilityPill ───────────────────────────────────────── */
function FeasibilityPill({ feasible }: { feasible: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 500,
        background: feasible ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
        color: feasible ? 'var(--success)' : 'var(--warning)',
        border: `1px solid ${feasible ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
        whiteSpace: 'nowrap',
      }}
    >
      ● {feasible ? 'machbar' : 'kritisch'}
    </span>
  );
}

/* ─── Ghost button ──────────────────────────────────────────── */
function GhostBtn({
  children,
  onClick,
  style: extraStyle,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        borderRadius: 8,
        border: '1px solid var(--border-strong)',
        background: 'transparent',
        color: 'var(--muted-foreground)',
        fontSize: 12,
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
        ...extraStyle,
      }}
    >
      {children}
    </button>
  );
}

/* ─── CompareTab ────────────────────────────────────────────── */
const CHART_COLORS = [
  'var(--primary)',
  'var(--info)',
  'var(--warning)',
  'var(--success)',
  'var(--destructive)',
];

function CompareTab({
  varianten,
  compareData,
  activeVarianteId,
  setActiveVarianteId,
  onSwitchToEdit,
}: {
  varianten: Variante[];
  compareData: { variante: Variante; analyse: ReturnType<typeof analyseVariante> }[];
  activeVarianteId: string;
  setActiveVarianteId: (id: string) => void;
  onSwitchToEdit: () => void;
}) {
  const allYears = compareData[0]?.analyse.vermoegensverlauf.map((p) => p.jahr) ?? [];
  const chartData = allYears.map((jahr) => {
    const row: Record<string, number | string> = { jahr };
    compareData.forEach(({ variante, analyse }) => {
      const point = analyse.vermoegensverlauf.find((p) => p.jahr === jahr);
      row[variante.id] = point?.vermoegen ?? 0;
    });
    return row;
  });

  return (
    <>
      {/* Variant cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(varianten.length, 3)}, 1fr)`,
          gap: 14,
          marginBottom: 20,
        }}
      >
        {compareData.map(({ variante, analyse }, i) => {
          const isActive = variante.id === activeVarianteId;
          return (
            <div
              key={variante.id}
              style={{ ...(isActive ? cardAccent : card), cursor: 'pointer' }}
              onClick={() => setActiveVarianteId(variante.id)}
            >
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    top: -1,
                    left: 20,
                    right: 20,
                    height: 2,
                    background: 'var(--primary)',
                    borderRadius: '0 0 2px 2px',
                  }}
                />
              )}

              {/* Card header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={microLabel}>{isActive ? 'AKTIVE VARIANTE' : (variante.status?.toUpperCase() ?? 'VARIANTE')}</span>
                  <span style={{ fontSize: 16, fontWeight: 500 }}>{variante.name}</span>
                </div>
                <FeasibilityPill feasible={analyse.fruehpensionierungMachbar} />
              </div>

              {/* Key metrics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={microLabel}>Endvermögen</div>
                  <div style={{ ...mono, fontSize: 24, fontWeight: 500, marginTop: 2 }}>
                    {formatCurrency(analyse.endvermoegen)}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <div style={microLabel}>Rentenlücke</div>
                    <div
                      style={{
                        ...mono,
                        fontSize: 14,
                        marginTop: 2,
                        color: analyse.rentenlueckeAbPension > 5000 ? 'var(--warning)' : 'var(--foreground)',
                      }}
                    >
                      {formatCurrency(analyse.rentenlueckeAbPension)}
                    </div>
                  </div>
                  <div>
                    <div style={microLabel}>Mtl. Überschuss</div>
                    <div
                      style={{
                        ...mono,
                        fontSize: 14,
                        marginTop: 2,
                        color: analyse.monatlicherUeberschussHeute < 500 ? 'var(--warning)' : 'var(--success)',
                      }}
                    >
                      {formatCurrency(analyse.monatlicherUeberschussHeute)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />

              {/* Parameters */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  ['Pensionsalter', `${variante.retirementAge} J.`],
                  ['3a p.a.', formatCurrency(variante.sparrate3a)],
                  ['ETF / Monat', formatCurrency(variante.sparrateWertschriften)],
                  ['Aktienquote', formatPercent(variante.aktienquote)],
                ].map(([l, val]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{l}</span>
                    <span style={{ ...mono, fontSize: 13 }}>{val}</span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <GhostBtn
                  onClick={(e) => { (e as React.MouseEvent).stopPropagation(); setActiveVarianteId(variante.id); onSwitchToEdit(); }}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Settings size={12} />
                  Bearbeiten
                </GhostBtn>
                {!isActive && (
                  <GhostBtn
                    onClick={(e) => { (e as React.MouseEvent).stopPropagation(); setActiveVarianteId(variante.id); }}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Aktivieren
                  </GhostBtn>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison chart */}
      <div style={{ ...card, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>Vermögensverlauf — alle Varianten überlagert</div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>Real, nach Inflation</div>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {compareData.map(({ variante }, i) => (
              <div key={variante.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 16, height: 2, background: CHART_COLORS[i % CHART_COLORS.length], display: 'block', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{variante.name}</span>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="jahr"
              stroke="var(--muted-foreground)"
              tick={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
              tickLine={false}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              tick={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
              tickLine={false}
              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
              width={52}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                const found = compareData.find((d) => d.variante.id === name);
                return [formatCurrency(value), found?.variante.name ?? name];
              }}
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border-strong)',
                borderRadius: 10,
                fontSize: 12,
              }}
            />
            {compareData.map(({ variante }, i) => (
              <Line
                key={variante.id}
                type="monotone"
                dataKey={variante.id}
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth={variante.id === activeVarianteId ? 2.5 : 1.5}
                strokeOpacity={variante.id === activeVarianteId ? 1 : 0.6}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

/* ─── EditTab ───────────────────────────────────────────────── */
const EVENT_TONES: Record<string, string> = {
  pensionierung: 'var(--success)',
  kind: 'var(--warning)',
  wohneigentum: 'var(--info)',
  teilzeit: 'var(--info)',
  sabbatical: 'var(--warning)',
  sonstiges: 'var(--muted-foreground)',
};

function EditTab({
  activeVariante,
  activeAnalyse,
  chartEvents,
  updateVariante,
  addEreignis,
  updateEreignis,
  deleteEreignis,
}: {
  activeVariante: Variante;
  activeAnalyse: ReturnType<typeof analyseVariante>;
  chartEvents: (Ereignis & { vermoegen: number })[];
  updateVariante: <K extends keyof Variante>(key: K, value: Variante[K]) => void;
  addEreignis: () => void;
  updateEreignis: (id: string, updates: Partial<Ereignis>) => void;
  deleteEreignis: (id: string) => void;
}) {
  return (
    <>
      {/* Active variant header */}
      <div
        style={{
          background: 'linear-gradient(90deg, rgba(26,74,44,0.05), var(--card))',
          border: '1px solid var(--primary)',
          borderRadius: 'var(--radius)',
          padding: '14px 20px',
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 10px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 500,
              background: 'rgba(26,74,44,0.08)',
              color: 'var(--primary)',
              border: '1px solid rgba(26,74,44,0.2)',
              whiteSpace: 'nowrap',
            }}
          >
            ● aktiv bearbeitet
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 15, fontWeight: 500 }}>{activeVariante.name}</span>
            <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
              Änderungen wirken sofort auf KPIs · Auto-gespeichert
            </span>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Mtl. Überschuss', value: activeAnalyse.monatlicherUeberschussHeute, warn: activeAnalyse.monatlicherUeberschussHeute < 0 },
          { label: 'Netto-Rente', value: activeAnalyse.nettoRenteAbPension, warn: false },
          { label: 'Rentenlücke', value: activeAnalyse.rentenlueckeAbPension, warn: activeAnalyse.rentenlueckeAbPension > 5000 },
          { label: 'Endvermögen', value: activeAnalyse.endvermoegen, warn: false },
        ].map(({ label, value, warn }) => (
          <div
            key={label}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '12px 14px',
            }}
          >
            <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 4 }}>{label}</div>
            <div style={{ ...mono, fontSize: 18, fontWeight: 500, color: warn ? 'var(--warning)' : 'var(--foreground)' }}>
              {formatCurrency(value)}
            </div>
          </div>
        ))}
      </div>

      {/* Live chart */}
      <div style={{ ...card, padding: 24, marginBottom: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 500 }}>Vermögensverlauf — Live-Vorschau</div>
          <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>
            Hebel unten beeinflussen den Verlauf · Lebensereignisse als Marker
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={activeAnalyse.vermoegensverlauf}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="jahr"
              stroke="var(--muted-foreground)"
              tick={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
              tickLine={false}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              tick={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
              tickLine={false}
              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
              width={52}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Vermögen']}
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border-strong)',
                borderRadius: 10,
                fontSize: 12,
              }}
            />
            <Line type="monotone" dataKey="vermoegen" stroke="var(--primary)" strokeWidth={2.5} dot={false} />
            {chartEvents.map((ereignis) => (
              <React.Fragment key={ereignis.id}>
                <ReferenceLine
                  x={ereignis.jahr}
                  stroke={EVENT_TONES[ereignis.typ] ?? 'var(--muted-foreground)'}
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                />
                <ReferenceDot
                  x={ereignis.jahr}
                  y={ereignis.vermoegen}
                  r={5}
                  fill="var(--card)"
                  stroke={EVENT_TONES[ereignis.typ] ?? 'var(--muted-foreground)'}
                  strokeWidth={2}
                  label={{ value: ereignis.label, position: 'top', fill: 'var(--muted-foreground)', fontSize: 10 }}
                />
              </React.Fragment>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Sliders + Events (two-column) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        {/* Left: Sliders */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <span style={{ fontSize: 15, fontWeight: 500 }}>Hebel</span>
            <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>6 Stellschrauben</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Slider label="Pensionsalter" value={activeVariante.retirementAge} min={58} max={70} step={1} format={(v) => `${v} J.`} onChange={(v) => updateVariante('retirementAge', v)} />
            <Slider label="Säule 3a / Jahr" value={activeVariante.sparrate3a} min={0} max={7056} step={500} format={formatCurrency} onChange={(v) => updateVariante('sparrate3a', v)} />
            <Slider label="ETF / Monat" value={activeVariante.sparrateWertschriften} min={0} max={5000} step={100} format={formatCurrency} onChange={(v) => updateVariante('sparrateWertschriften', v)} />
            <Slider label="Aktienquote" value={activeVariante.aktienquote} min={0} max={100} step={5} format={(v) => `${v}%`} onChange={(v) => updateVariante('aktienquote', v)} />
            <Slider label="Amortisation / Monat" value={activeVariante.amortisation} min={0} max={3000} step={100} format={formatCurrency} onChange={(v) => updateVariante('amortisation', v)} />
            <Slider label="PK-Einkauf Betrag" value={activeVariante.pkEinkaufBetrag} min={0} max={80000} step={1000} format={formatCurrency} onChange={(v) => updateVariante('pkEinkaufBetrag', v)} />
          </div>

          <div style={{ height: 1, background: 'var(--border)', margin: '20px 0' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <NumberField label="Jahreseinkommen" value={activeVariante.einkommen} onChange={(v) => updateVariante('einkommen', v)} />
            <NumberField label="Einkommenswachstum %" value={activeVariante.einkommenswachstum} onChange={(v) => updateVariante('einkommenswachstum', v)} step={0.5} />
            <NumberField label="PK-Einkauf Jahr" value={activeVariante.pkEinkaufJahr} onChange={(v) => updateVariante('pkEinkaufJahr', v)} step={1} />
            <NumberField label="PK-Kapitalbezug %" value={activeVariante.kapitalbezugPkProzent} onChange={(v) => updateVariante('kapitalbezugPkProzent', v)} step={5} />
            <NumberField label="3b p.a." value={activeVariante.sparrate3b} onChange={(v) => updateVariante('sparrate3b', v)} />
            <Select
              label="Risikoprofil"
              value={activeVariante.risikoprofil}
              onChange={(v) => updateVariante('risikoprofil', v as Variante['risikoprofil'])}
              options={[
                { value: 'konservativ', label: 'Konservativ' },
                { value: 'ausgewogen', label: 'Ausgewogen' },
                { value: 'dynamisch', label: 'Dynamisch' },
              ]}
            />
          </div>
        </div>

        {/* Right: Life events + Swiss analysis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Life events */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 15, fontWeight: 500 }}>Lebensereignisse</span>
              <GhostBtn onClick={addEreignis}>
                <Plus size={12} />
                Hinzufügen
              </GhostBtn>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activeVariante.ereignisse.filter((e) => e.typ !== 'pensionierung').length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--muted-foreground)', margin: 0 }}>
                  Noch keine Lebensereignisse in dieser Variante.
                </p>
              ) : (
                activeVariante.ereignisse
                  .filter((e) => e.typ !== 'pensionierung')
                  .map((ereignis) => (
                    <div
                      key={ereignis.id}
                      style={{
                        padding: '10px 12px',
                        background: 'var(--secondary)',
                        borderRadius: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ ...mono, fontSize: 12, color: EVENT_TONES[ereignis.typ] ?? 'var(--muted-foreground)' }}>
                          {ereignis.jahr}
                        </span>
                        <button
                          onClick={() => deleteEreignis(ereignis.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: 2, display: 'flex', alignItems: 'center' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <Select
                          label="Typ"
                          value={ereignis.typ}
                          onChange={(v) => updateEreignis(ereignis.id, { typ: v as Ereignis['typ'] })}
                          options={[
                            { value: 'kind', label: 'Kind' },
                            { value: 'wohneigentum', label: 'Wohneigentum' },
                            { value: 'teilzeit', label: 'Teilzeit' },
                            { value: 'sabbatical', label: 'Sabbatical' },
                            { value: 'sonstiges', label: 'Sonstiges' },
                          ]}
                        />
                        <NumberField label="Jahr" value={ereignis.jahr} onChange={(v) => updateEreignis(ereignis.id, { jahr: v })} step={1} />
                      </div>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Label</span>
                        <input
                          type="text"
                          value={ereignis.label}
                          onChange={(e) => updateEreignis(ereignis.id, { label: e.target.value })}
                          style={{
                            background: 'var(--input-background)',
                            border: '1px solid var(--border)',
                            borderRadius: 8,
                            padding: '6px 10px',
                            fontSize: 13,
                            color: 'var(--foreground)',
                            fontFamily: 'inherit',
                          }}
                        />
                      </label>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Swiss core analysis */}
          <div style={card}>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 14 }}>Schweizer Kernauswertung</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                ['Steuern heute', formatCurrency(activeAnalyse.steuerHeute)],
                ['Vermögenssteuer', formatCurrency(activeAnalyse.vermoegenssteuerHeute)],
                ['AHV-Prognose', formatCurrency(activeAnalyse.ahvPrognose)],
                ['PK-Rente', formatCurrency(activeAnalyse.pkPrognoseRente)],
                ['PK-Kapital bei Pension', formatCurrency(activeAnalyse.pkKapitalZumPensionierungszeitpunkt)],
                ['Kapitalbezugssteuer', formatCurrency(activeAnalyse.steuerBeiKapitalbezug)],
                ['Tragbarkeit', `${formatPercent(activeAnalyse.tragbarkeitQuote * 100)} · ${activeAnalyse.tragbarkeitStatus}`],
                ['3a-Staffelung', activeAnalyse['3aStaffelungEmpfohlen'] ? 'empfohlen' : 'optional'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '7px 0',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{label}</span>
                  <span style={{ ...mono, fontSize: 13 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Varianten (main export) ───────────────────────────────── */
export function Varianten({ userId }: { isLoggedIn: boolean; userId?: string }) {
  const [tab, setTab] = useState<'compare' | 'edit'>('compare');
  const [profilSnapshot, setProfilSnapshot] = useState<ProfilSnapshot>(() => loadStoredProfile(userId));
  const [varianten, setVarianten] = useState<Variante[]>(() => loadStoredVarianten(userId, loadStoredProfile(userId)));
  const [activeVarianteId, setActiveVarianteId] = useState<string>('basis');

  useEffect(() => {
    const nextProfile = loadStoredProfile(userId);
    setProfilSnapshot(nextProfile);
    setVarianten(loadStoredVarianten(userId, nextProfile));
    setActiveVarianteId('basis');

    if (!userId) return;
    supabase
      .from('user_variants')
      .select('data')
      .eq('user_id', userId)
      .single()
      .then(({ data }) => {
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          window.localStorage.setItem(getVariantenStorageKey(userId), JSON.stringify(data.data));
          const profile = loadStoredProfile(userId);
          setProfilSnapshot(profile);
          setVarianten(loadStoredVarianten(userId, profile));
        }
      });
  }, [userId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const toStore = varianten.filter((v) => v.id !== 'basis');
    window.localStorage.setItem(getVariantenStorageKey(userId), JSON.stringify(toStore));
  }, [userId, varianten]);

  useEffect(() => {
    if (!userId) return;
    const toStore = varianten.filter((v) => v.id !== 'basis');
    const timeoutId = window.setTimeout(async () => {
      await supabase.from('user_variants').upsert(
        { user_id: userId, data: toStore, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
    }, 1000);
    return () => window.clearTimeout(timeoutId);
  }, [userId, varianten]);

  useEffect(() => {
    setVarianten((current) => {
      const rest = current.filter((v) => v.id !== 'basis');
      return [createBasisVariante(profilSnapshot), ...rest];
    });
  }, [profilSnapshot]);

  const activeVariante = varianten.find((v) => v.id === activeVarianteId) ?? varianten[0];
  const activeAnalyse = useMemo(() => analyseVariante(activeVariante, profilSnapshot), [activeVariante, profilSnapshot]);
  const compareData = varianten.map((v) => ({ variante: v, analyse: analyseVariante(v, profilSnapshot) }));

  const chartEvents = activeVariante.ereignisse
    .map((ereignis) => {
      const point = activeAnalyse.vermoegensverlauf.find((e) => e.jahr === ereignis.jahr);
      return point ? { ...ereignis, vermoegen: point.vermoegen } : null;
    })
    .filter((e): e is Ereignis & { vermoegen: number } => e !== null);

  const updateVariante = <K extends keyof Variante>(key: K, value: Variante[K]) => {
    setVarianten((current) => current.map((v) => (v.id === activeVariante.id ? { ...v, [key]: value } : v)));
  };

  const updateEreignisse = (ereignisse: Ereignis[]) => updateVariante('ereignisse', ereignisse);

  const addEreignis = () => {
    const nextEvent: Ereignis = {
      id: `ev-${Date.now()}`,
      typ: 'sonstiges',
      jahr: new Date().getFullYear() + 1,
      label: 'Neues Ereignis',
    };
    updateEreignisse([
      ...activeVariante.ereignisse.filter((e) => e.typ !== 'pensionierung'),
      nextEvent,
      ...activeVariante.ereignisse.filter((e) => e.typ === 'pensionierung'),
    ]);
  };

  const updateEreignis = (id: string, updates: Partial<Ereignis>) => {
    updateEreignisse(activeVariante.ereignisse.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const deleteEreignis = (id: string) => {
    updateEreignisse(activeVariante.ereignisse.filter((e) => e.id !== id));
  };

  const addVariante = () => {
    const next: Variante = {
      ...createBasisVariante(profilSnapshot),
      id: `var-${Date.now()}`,
      name: `Variante ${varianten.length}`,
      status: 'manuell',
      beschreibung: 'Neue Gegenvariante',
    };
    setVarianten((current) => [...current, next]);
    setActiveVarianteId(next.id);
  };

  const duplicateVariante = () => {
    const duplicate: Variante = {
      ...activeVariante,
      id: `var-${Date.now()}`,
      name: `${activeVariante.name} Kopie`,
      status: 'dupliziert',
    };
    setVarianten((current) => [...current, duplicate]);
    setActiveVarianteId(duplicate.id);
  };

  const deleteVariante = () => {
    if (activeVariante.id === 'basis') return;
    setVarianten((current) => current.filter((v) => v.id !== activeVariante.id));
    setActiveVarianteId('basis');
  };

  return (
    <div style={{ padding: '28px 32px 60px' }}>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
            Planung · Szenarien
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}>Varianten</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="outline" onClick={duplicateVariante}>
            <Copy className="mr-2 h-4 w-4" />
            Duplizieren
          </Button>
          <Button
            onClick={addVariante}
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', border: 'none' }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Neue Variante
          </Button>
          {activeVariante.id !== 'basis' && (
            <Button variant="ghost" onClick={deleteVariante} style={{ color: 'var(--destructive)' }}>
              <Trash2 className="mr-2 h-4 w-4" />
              Löschen
            </Button>
          )}
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div
          style={{
            display: 'inline-flex',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: 4,
            gap: 2,
          }}
        >
          {[
            { id: 'compare' as const, Icon: Layers, label: 'Vergleichen', count: varianten.length },
            { id: 'edit' as const, Icon: Settings, label: 'Erstellen / Bearbeiten', count: null },
          ].map(({ id, Icon, label, count }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 7,
                border: 0,
                cursor: 'pointer',
                background: tab === id ? 'var(--primary)' : 'transparent',
                color: tab === id ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                fontSize: 13,
                fontWeight: 500,
                fontFamily: 'inherit',
                transition: 'all 120ms ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={13} />
              <span>{label}</span>
              {count !== null && (
                <span style={{ ...mono, fontSize: 11, opacity: 0.6 }}>{count}</span>
              )}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
          {tab === 'compare'
            ? 'Alle Varianten gegenüberstellen — Vermögen, Lücke, Überschuss.'
            : `Aktive Variante: ${activeVariante.name}`}
        </span>
      </div>

      {/* Tab content */}
      {tab === 'compare' ? (
        <CompareTab
          varianten={varianten}
          compareData={compareData}
          activeVarianteId={activeVarianteId}
          setActiveVarianteId={setActiveVarianteId}
          onSwitchToEdit={() => setTab('edit')}
        />
      ) : (
        <EditTab
          activeVariante={activeVariante}
          activeAnalyse={activeAnalyse}
          chartEvents={chartEvents}
          updateVariante={updateVariante}
          addEreignis={addEreignis}
          updateEreignis={updateEreignis}
          deleteEreignis={deleteEreignis}
        />
      )}
    </div>
  );
}
