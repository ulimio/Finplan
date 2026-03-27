import React, { useEffect, useMemo, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Copy, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/card';
import { Button } from '../components/button';
import { Select } from '../components/select';
import {
  analyseVariante,
  createBasisVariante,
  formatCurrency,
  formatPercent,
  getVariantenStorageKey,
  loadStoredProfile,
  loadStoredVarianten,
} from '../lib/finance-data';
import type { ProfilSnapshot, Variante } from '../lib/finance-data';

function NumberField({
  label,
  value,
  onChange,
  step = 100,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-foreground">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        step={step}
        className="w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm"
      />
    </label>
  );
}

export function Varianten({ userId }: { isLoggedIn: boolean; userId?: string }) {
  const [profilSnapshot, setProfilSnapshot] = useState<ProfilSnapshot>(() => loadStoredProfile(userId));
  const [varianten, setVarianten] = useState<Variante[]>(() => loadStoredVarianten(userId, loadStoredProfile(userId)));
  const [activeVarianteId, setActiveVarianteId] = useState<string>('basis');

  useEffect(() => {
    const nextProfile = loadStoredProfile(userId);
    setProfilSnapshot(nextProfile);
    setVarianten(loadStoredVarianten(userId, nextProfile));
    setActiveVarianteId('basis');
  }, [userId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const toStore = varianten.filter((variante) => variante.id !== 'basis');
    window.localStorage.setItem(getVariantenStorageKey(userId), JSON.stringify(toStore));
  }, [userId, varianten]);

  useEffect(() => {
    setVarianten((current) => {
      const rest = current.filter((entry) => entry.id !== 'basis');
      return [createBasisVariante(profilSnapshot), ...rest];
    });
  }, [profilSnapshot]);

  const activeVariante = varianten.find((entry) => entry.id === activeVarianteId) ?? varianten[0];
  const activeAnalyse = useMemo(() => analyseVariante(activeVariante, profilSnapshot), [activeVariante, profilSnapshot]);
  const compareData = varianten.map((variante) => ({ variante, analyse: analyseVariante(variante, profilSnapshot) }));

  const updateVariante = <K extends keyof Variante>(key: K, value: Variante[K]) => {
    setVarianten((current) =>
      current.map((entry) => (entry.id === activeVariante.id ? { ...entry, [key]: value } : entry))
    );
  };

  const addVariante = () => {
    const basis = createBasisVariante(profilSnapshot);
    const next: Variante = {
      ...basis,
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
    setVarianten((current) => current.filter((entry) => entry.id !== activeVariante.id));
    setActiveVarianteId('basis');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl text-foreground">Varianten</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Hier modellierst du bewusst die Konflikte zwischen Cashflow, PK-Einkauf, 3a, ETF-Sparen, Immobilie und Frühpensionierung.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={duplicateVariante}>
            <Copy className="mr-2 h-4 w-4" />
            Duplizieren
          </Button>
          <Button variant="outline" onClick={addVariante}>
            <Plus className="mr-2 h-4 w-4" />
            Variante
          </Button>
          {activeVariante.id !== 'basis' && (
            <Button variant="ghost" onClick={deleteVariante} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Löschen
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Aktive Variante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Variante"
              value={activeVariante.id}
              onChange={setActiveVarianteId}
              options={varianten.map((entry) => ({ value: entry.id, label: entry.name }))}
            />
            <label className="block space-y-1">
              <span className="text-sm text-foreground">Name</span>
              <input
                type="text"
                value={activeVariante.name}
                onChange={(event) => updateVariante('name', event.target.value)}
                disabled={activeVariante.id === 'basis'}
                className="w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm text-foreground">Beschreibung</span>
              <textarea
                value={activeVariante.beschreibung}
                onChange={(event) => updateVariante('beschreibung', event.target.value)}
                className="min-h-24 w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm"
              />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hebel der Variante</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <NumberField label="Jahreseinkommen" value={activeVariante.einkommen} onChange={(value) => updateVariante('einkommen', value)} />
            <NumberField label="Einkommenswachstum %" value={activeVariante.einkommenswachstum} onChange={(value) => updateVariante('einkommenswachstum', value)} step={0.5} />
            <NumberField label="Retirement Age" value={activeVariante.retirementAge} onChange={(value) => updateVariante('retirementAge', value)} step={1} />
            <NumberField label="3a p.a." value={activeVariante.sparrate3a} onChange={(value) => updateVariante('sparrate3a', value)} />
            <NumberField label="3b p.a." value={activeVariante.sparrate3b} onChange={(value) => updateVariante('sparrate3b', value)} />
            <NumberField label="ETF / Depot pro Monat" value={activeVariante.sparrateWertschriften} onChange={(value) => updateVariante('sparrateWertschriften', value)} />
            <NumberField label="Amortisation pro Monat" value={activeVariante.amortisation} onChange={(value) => updateVariante('amortisation', value)} />
            <NumberField label="PK-Einkauf Jahr" value={activeVariante.pkEinkaufJahr} onChange={(value) => updateVariante('pkEinkaufJahr', value)} step={1} />
            <NumberField label="PK-Einkauf Betrag" value={activeVariante.pkEinkaufBetrag} onChange={(value) => updateVariante('pkEinkaufBetrag', value)} />
            <NumberField label="Aktienquote %" value={activeVariante.aktienquote} onChange={(value) => updateVariante('aktienquote', value)} step={5} />
            <NumberField label="PK-Kapitalbezug %" value={activeVariante.kapitalbezugPkProzent} onChange={(value) => updateVariante('kapitalbezugPkProzent', value)} step={5} />
            <Select
              label="Risikoprofil"
              value={activeVariante.risikoprofil}
              onChange={(value) => updateVariante('risikoprofil', value as Variante['risikoprofil'])}
              options={[
                { value: 'konservativ', label: 'Konservativ' },
                { value: 'ausgewogen', label: 'Ausgewogen' },
                { value: 'dynamisch', label: 'Dynamisch' },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground">Monatlicher Überschuss</p>
            <p className={`mt-2 text-2xl ${activeAnalyse.monatlicherUeberschussHeute < 0 ? 'text-warning' : 'text-success'}`}>
              {formatCurrency(activeAnalyse.monatlicherUeberschussHeute)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground">Netto-Rente ab Pension</p>
            <p className="mt-2 text-2xl text-foreground">{formatCurrency(activeAnalyse.nettoRenteAbPension)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground">Rentenlücke</p>
            <p className={`mt-2 text-2xl ${activeAnalyse.rentenlueckeAbPension > 0 ? 'text-warning' : 'text-success'}`}>
              {formatCurrency(activeAnalyse.rentenlueckeAbPension)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground">Frühpensionierung</p>
            <p className="mt-2 text-2xl text-foreground">{activeAnalyse.fruehpensionierungMachbar ? 'machbar' : 'kritisch'}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Vermögensverlauf</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={340}>
                <LineChart data={activeAnalyse.vermoegensverlauf}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="jahr" stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Line type="monotone" dataKey="vermoegen" stroke="#1d4ed8" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Priorisierte Massnahmen dieser Variante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeAnalyse.priorisierteMassnahmen.map((massnahme) => (
                <div key={massnahme.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-foreground">{massnahme.label}</p>
                    <span className="text-xs text-muted-foreground">Impact {massnahme.impact}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{massnahme.summary}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Liquiditätsbedarf {formatCurrency(massnahme.liquiditaetsbedarf)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Schweizer Kernauswertung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Steuern heute</p>
                <p className="mt-1 text-lg text-foreground">{formatCurrency(activeAnalyse.steuerHeute)}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Vermögenssteuer</p>
                <p className="mt-1 text-lg text-foreground">{formatCurrency(activeAnalyse.vermoegenssteuerHeute)}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">AHV-Prognose</p>
                <p className="mt-1 text-lg text-foreground">{formatCurrency(activeAnalyse.ahvPrognose)}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">PK-Rente</p>
                <p className="mt-1 text-lg text-foreground">{formatCurrency(activeAnalyse.pkPrognoseRente)}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">PK-Kapital bei Pension</p>
                <p className="mt-1 text-lg text-foreground">{formatCurrency(activeAnalyse.pkKapitalZumPensionierungszeitpunkt)}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Kapitalbezugssteuer</p>
                <p className="mt-1 text-lg text-foreground">{formatCurrency(activeAnalyse.steuerBeiKapitalbezug)}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Tragbarkeit</p>
                <p className="mt-1 text-lg text-foreground">
                  {formatPercent(activeAnalyse.tragbarkeitQuote * 100)} · {activeAnalyse.tragbarkeitStatus}
                </p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">3a-Staffelung</p>
                <p className="mt-1 text-lg text-foreground">{activeAnalyse['3aStaffelungEmpfohlen'] ? 'empfohlen' : 'optional'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variantenvergleich</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {compareData.map(({ variante, analyse }) => (
                <div key={variante.id} className={`rounded-lg border p-3 ${variante.id === activeVariante.id ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <p className="text-sm text-foreground">{variante.name}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span>Endvermögen {formatCurrency(analyse.endvermoegen)}</span>
                    <span>Überschuss {formatCurrency(analyse.monatlicherUeberschussHeute)}</span>
                    <span>Rentenlücke {formatCurrency(analyse.rentenlueckeAbPension)}</span>
                    <span>Tragbarkeit {formatPercent(analyse.tragbarkeitQuote * 100)}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
