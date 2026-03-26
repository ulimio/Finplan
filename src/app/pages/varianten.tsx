import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../components/card';
import { SliderInput } from '../components/slider-input';
import { Select } from '../components/select';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { InfoTooltip } from '../components/info-tooltip';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import {
  TrendingUp, Copy, Trash2, Plus, BarChart3, Settings, Calendar,
  CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownRight, Target,
  Home, Users, Edit2, X
} from 'lucide-react';

interface Variante {
  id: string;
  name: string;
  beschreibung: string;
  status: 'default' | 'dupliziert' | 'manuell';
  einkommen: number;
  einkommenswachstum: number;
  sparrate3a: number;
  sparrateWertschriften: number;
  amortisation: number;
  aktienquote: number;
  risikoprofil: 'konservativ' | 'ausgewogen' | 'dynamisch';
  ereignisse: Ereignis[];
}

interface Ereignis {
  id: string;
  typ: 'kind' | 'wohneigentum' | 'teilzeit' | 'sabbatical' | 'pensionierung' | 'sonstiges';
  jahr: number;
  label: string;
}

interface ProfilSnapshot {
  geburtsdatum: string;
  anstellungsart: 'angestellt' | 'selbstaendig' | 'gemischt';
  bruttoeinkommen: number;
  variablesEinkommen: number;
  einkommensentwicklung: number;
  liquiditaet: number;
  wertschriften: number;
  immobilienwert: number;
  sonstigesVermoegen: number;
  hypothek: number;
  konsumkredite: number;
  pkGuthaben: number;
  saule3aGesamt: number;
  grenzsteuersatz: number;
  risikobereitschaft: 'konservativ' | 'ausgewogen' | 'dynamisch';
  lebensereignisse: Ereignis[];
}

interface VariantenAnalyse {
  endvermoegen: number;
  finanzielleFreiheitAlter: number | null;
  sparquote: number;
  steuernTotal: number;
  erwarteteRendite: number;
  gesamtesSparvolumen30Jahre: number;
  vermoegensverlauf: Array<{ jahr: number; vermoegen: number }>;
}

const RISIKO_OPTIONS = [
  { value: 'konservativ', label: 'Konservativ' },
  { value: 'ausgewogen', label: 'Ausgewogen' },
  { value: 'dynamisch', label: 'Dynamisch' },
];

const EREIGNIS_TYPES: Array<{ value: Ereignis['typ']; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { value: 'kind', label: 'Kind', icon: Users },
  { value: 'wohneigentum', label: 'Wohneigentum', icon: Home },
  { value: 'teilzeit', label: 'Teilzeit', icon: Calendar },
  { value: 'sabbatical', label: 'Sabbatical', icon: Calendar },
  { value: 'pensionierung', label: 'Pensionierung', icon: Calendar },
  { value: 'sonstiges', label: 'Sonstiges', icon: Calendar },
];

const EREIGNIS_SYMBOLS: Record<Ereignis['typ'], string> = {
  kind: '👶',
  wohneigentum: '🏠',
  teilzeit: '🕒',
  sabbatical: '🌴',
  pensionierung: '🏁',
  sonstiges: '✨',
};

const DEFAULT_PROFILE: ProfilSnapshot = {
  geburtsdatum: '',
  anstellungsart: 'angestellt',
  bruttoeinkommen: 80000,
  variablesEinkommen: 0,
  einkommensentwicklung: 1.5,
  liquiditaet: 10000,
  wertschriften: 5000,
  immobilienwert: 0,
  sonstigesVermoegen: 0,
  hypothek: 0,
  konsumkredite: 0,
  pkGuthaben: 25000,
  saule3aGesamt: 5000,
  grenzsteuersatz: 0,
  risikobereitschaft: 'ausgewogen',
  lebensereignisse: [],
};

function getProfileStorageKey(userId?: string) {
  return `finplan.profil.${userId ?? 'guest'}`;
}

function getVariantenStorageKey(userId?: string) {
  return `finplan.varianten.${userId ?? 'guest'}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatCurrency(value: number) {
  return `${value.toLocaleString('de-CH')} CHF`;
}

function formatPercent(value: number) {
  return `${value.toLocaleString('de-CH', { maximumFractionDigits: 1 })}%`;
}

function parseGeburtsjahr(geburtsdatum: string) {
  if (!geburtsdatum) return null;
  const parsed = new Date(geburtsdatum);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.getFullYear();
}

function berechneAlter(geburtsdatum: string) {
  const geburtsjahr = parseGeburtsjahr(geburtsdatum);
  if (!geburtsjahr) return 40;
  return clamp(new Date().getFullYear() - geburtsjahr, 18, 64);
}

function normalizeProfileEreignisse(raw: unknown, legacyText?: unknown): Ereignis[] {
  if (Array.isArray(raw)) {
    return raw.map((ereignis, index) => ({
      id: ereignis?.id ?? `e-${index}`,
      typ: ereignis?.typ ?? 'sonstiges',
      jahr: Number(ereignis?.jahr ?? new Date().getFullYear() + 1),
      label:
        typeof ereignis?.label === 'string' && ereignis.label.trim()
          ? ereignis.label
          : EREIGNIS_TYPES.find((entry) => entry.value === ereignis?.typ)?.label ?? 'Ereignis',
    }));
  }

  if (typeof legacyText === 'string' && legacyText.trim()) {
    return [
      {
        id: 'legacy-ziel',
        typ: 'sonstiges',
        jahr: new Date().getFullYear() + 1,
        label: legacyText.trim(),
      },
    ];
  }

  return [];
}

function buildPensionierungsEreignis(geburtsdatum: string): Ereignis {
  const aktuellesJahr = new Date().getFullYear();
  const pensionierungsJahr = aktuellesJahr + Math.max(1, 65 - berechneAlter(geburtsdatum));

  return {
    id: 'pensionierung',
    typ: 'pensionierung',
    jahr: pensionierungsJahr,
    label: 'Pensionierung',
  };
}

function loadStoredProfile(userId?: string): ProfilSnapshot {
  if (typeof window === 'undefined') {
    return DEFAULT_PROFILE;
  }

  try {
    const raw = window.localStorage.getItem(getProfileStorageKey(userId));
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);

    return {
      ...DEFAULT_PROFILE,
      geburtsdatum: typeof parsed.geburtsdatum === 'string' ? parsed.geburtsdatum : DEFAULT_PROFILE.geburtsdatum,
      anstellungsart: parsed.anstellungsart ?? DEFAULT_PROFILE.anstellungsart,
      bruttoeinkommen: Number(parsed.bruttoeinkommen ?? DEFAULT_PROFILE.bruttoeinkommen),
      variablesEinkommen: Number(parsed.variablesEinkommen ?? DEFAULT_PROFILE.variablesEinkommen),
      einkommensentwicklung: Number(parsed.einkommensentwicklung ?? DEFAULT_PROFILE.einkommensentwicklung),
      liquiditaet: Number(parsed.liquiditaet ?? DEFAULT_PROFILE.liquiditaet),
      wertschriften: Number(parsed.wertschriften ?? DEFAULT_PROFILE.wertschriften),
      immobilienwert: Number(parsed.immobilienwert ?? DEFAULT_PROFILE.immobilienwert),
      sonstigesVermoegen: Number(parsed.sonstigesVermoegen ?? DEFAULT_PROFILE.sonstigesVermoegen),
      hypothek: Number(parsed.hypothek ?? DEFAULT_PROFILE.hypothek),
      konsumkredite: Number(parsed.konsumkredite ?? DEFAULT_PROFILE.konsumkredite),
      pkGuthaben: Number(parsed.pkGuthaben ?? DEFAULT_PROFILE.pkGuthaben),
      saule3aGesamt: Number(parsed.saule3aGesamt ?? DEFAULT_PROFILE.saule3aGesamt),
      grenzsteuersatz: Number(parsed.grenzsteuersatz ?? DEFAULT_PROFILE.grenzsteuersatz),
      risikobereitschaft: parsed.risikobereitschaft ?? DEFAULT_PROFILE.risikobereitschaft,
      lebensereignisse: normalizeProfileEreignisse(parsed.lebensereignisse, parsed.kurzfristigeZiele),
    };
  } catch (error) {
    console.error('Fehler beim Laden des Profils für Varianten:', error);
    return DEFAULT_PROFILE;
  }
}

function createBasisVariante(profile: ProfilSnapshot): Variante {
  const einkommen = profile.bruttoeinkommen + profile.variablesEinkommen;
  const max3a = profile.anstellungsart === 'selbstaendig' ? 35280 : 7258;
  const profilEreignisse = normalizeProfileEreignisse(profile.lebensereignisse).filter((ereignis) => ereignis.typ !== 'pensionierung');

  return {
    id: 'basis',
    name: 'Basis (Profil)',
    beschreibung: 'Aus deinem Profil abgeleitete Ausgangslage',
    status: 'default',
    einkommen,
    einkommenswachstum: profile.einkommensentwicklung,
    sparrate3a: profile.saule3aGesamt > 0 ? Math.min(7056, max3a) : 0,
    sparrateWertschriften: 0,
    amortisation: profile.hypothek > 0 ? 500 : 0,
    aktienquote: profile.risikobereitschaft === 'dynamisch' ? 80 : profile.risikobereitschaft === 'konservativ' ? 30 : 55,
    risikoprofil: profile.risikobereitschaft,
    ereignisse: [...profilEreignisse, buildPensionierungsEreignis(profile.geburtsdatum)],
  };
}

function normalizeStoredVariante(raw: Partial<Variante>, profile: ProfilSnapshot, index: number): Variante {
  const basis = createBasisVariante(profile);
  const normalizedEvents = Array.isArray(raw.ereignisse)
    ? raw.ereignisse.map((ereignis, ereignisIndex) => ({
        id: ereignis.id ?? `e-${index}-${ereignisIndex}`,
        typ: ereignis.typ ?? 'sonstiges',
        jahr: Number(ereignis.jahr ?? new Date().getFullYear() + 1),
        label: typeof ereignis.label === 'string' && ereignis.label.trim() ? ereignis.label : 'Ereignis',
      }))
    : basis.ereignisse;
  const ereignisseMitPension = normalizedEvents.some((ereignis) => ereignis.typ === 'pensionierung')
    ? normalizedEvents
    : [...normalizedEvents, buildPensionierungsEreignis(profile.geburtsdatum)];

  return {
    ...basis,
    ...raw,
    id: raw.id && raw.id !== 'basis' ? raw.id : `var-${Date.now()}-${index}`,
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name : `Variante ${index + 1}`,
    beschreibung: typeof raw.beschreibung === 'string' && raw.beschreibung.trim() ? raw.beschreibung : 'Individuelles Szenario',
    status: raw.status === 'dupliziert' || raw.status === 'manuell' ? raw.status : 'manuell',
    einkommen: Number(raw.einkommen ?? basis.einkommen),
    einkommenswachstum: Number(raw.einkommenswachstum ?? basis.einkommenswachstum),
    sparrate3a: Number(raw.sparrate3a ?? basis.sparrate3a),
    sparrateWertschriften: Number(raw.sparrateWertschriften ?? basis.sparrateWertschriften),
    amortisation: Number(raw.amortisation ?? basis.amortisation),
    aktienquote: Number(raw.aktienquote ?? basis.aktienquote),
    risikoprofil: raw.risikoprofil ?? basis.risikoprofil,
    ereignisse: ereignisseMitPension,
  };
}

function loadStoredVarianten(userId: string | undefined, profile: ProfilSnapshot): Variante[] {
  const basis = createBasisVariante(profile);

  if (typeof window === 'undefined') {
    return [basis];
  }

  try {
    const raw = window.localStorage.getItem(getVariantenStorageKey(userId));
    if (!raw) return [basis];
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [basis];
    }

    const rest = parsed
      .filter((entry) => entry && typeof entry === 'object' && entry.id !== 'basis')
      .map((entry, index) => normalizeStoredVariante(entry, profile, index));

    return [basis, ...rest];
  } catch (error) {
    console.error('Fehler beim Laden gespeicherter Varianten:', error);
    return [basis];
  }
}

function analyseVariante(variante: Variante, profile: ProfilSnapshot): VariantenAnalyse {
  const aktuellesJahr = new Date().getFullYear();
  const startAlter = berechneAlter(profile.geburtsdatum);
  const jahreBis65 = Math.max(1, 65 - startAlter);
  const startvermoegen = Math.max(
    0,
    profile.liquiditaet +
      profile.wertschriften +
      profile.immobilienwert +
      profile.sonstigesVermoegen +
      profile.pkGuthaben +
      profile.saule3aGesamt -
      profile.hypothek -
      profile.konsumkredite
  );
  const steuerquote = clamp(profile.grenzsteuersatz > 0 ? profile.grenzsteuersatz / 100 : 0.22, 0.08, 0.45);
  const rendite = variante.aktienquote / 100 * 0.06 + (1 - variante.aktienquote / 100) * 0.02;
  const jahresbeitragBasis = variante.sparrate3a + variante.sparrateWertschriften * 12 + variante.amortisation * 12;
  const vermoegensverlauf: Array<{ jahr: number; vermoegen: number }> = [];

  let vermoegen = startvermoegen;
  let einkommen = variante.einkommen;
  let steuernTotal = 0;
  let finanzielleFreiheitAlter: number | null = null;

  for (let index = 0; index <= jahreBis65; index += 1) {
    const jahr = aktuellesJahr + index;
    const alter = startAlter + index;
    const relevanteEreignisse = variante.ereignisse.filter((ereignis) => ereignis.jahr === jahr);

    let einkommensFaktor = 1;
    let zusatzkosten = 0;
    let einmalEffekt = 0;

    for (const ereignis of relevanteEreignisse) {
      if (ereignis.typ === 'kind') zusatzkosten += 12000;
      if (ereignis.typ === 'teilzeit') einkommensFaktor *= 0.8;
      if (ereignis.typ === 'sabbatical') {
        einkommensFaktor *= 0.5;
        zusatzkosten += 15000;
      }
      if (ereignis.typ === 'wohneigentum') einmalEffekt -= 60000;
    }

    const effektivesEinkommen = einkommen * einkommensFaktor;
    const steuern = Math.max(0, effektivesEinkommen * steuerquote - variante.sparrate3a * steuerquote * 0.8);
    const jahresbeitrag = Math.max(-40000, jahresbeitragBasis - zusatzkosten);

    vermoegen = Math.max(0, vermoegen * (1 + rendite) + jahresbeitrag + einmalEffekt);
    steuernTotal += steuern;

    if (finanzielleFreiheitAlter === null) {
      const zielvermoegen = Math.max(effektivesEinkommen * 20, 600000);
      if (vermoegen >= zielvermoegen) {
        finanzielleFreiheitAlter = alter;
      }
    }

    vermoegensverlauf.push({
      jahr,
      vermoegen: Math.round(vermoegen),
    });

    einkommen *= 1 + variante.einkommenswachstum / 100;
  }

  return {
    endvermoegen: Math.round(vermoegen),
    finanzielleFreiheitAlter,
    sparquote: Math.round((jahresbeitragBasis / Math.max(variante.einkommen, 1)) * 100),
    steuernTotal: Math.round(steuernTotal),
    erwarteteRendite: rendite * 100,
    gesamtesSparvolumen30Jahre: Math.round(jahresbeitragBasis * 30),
    vermoegensverlauf,
  };
}

function ProfilReferenz({
  original,
  aktuell,
  format,
}: {
  original: number | string;
  aktuell: number | string;
  format: (value: number | string) => string;
}) {
  const geaendert = original !== aktuell;

  return (
    <p className={`mt-2 text-xs ${geaendert ? 'text-primary' : 'text-muted-foreground'}`}>
      Profilwert: {format(original)}
      {geaendert ? ' · aktuell angepasst' : ''}
    </p>
  );
}

export function Varianten({ isLoggedIn, userId }: { isLoggedIn: boolean; userId?: string }) {
  const [profilSnapshot, setProfilSnapshot] = useState<ProfilSnapshot>(() => loadStoredProfile(userId));
  const [varianten, setVarianten] = useState<Variante[]>(() => loadStoredVarianten(userId, loadStoredProfile(userId)));
  const [activeVarianteId, setActiveVarianteId] = useState<string>('basis');
  const [compareOpen, setCompareOpen] = useState(false);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>(['basis']);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  useEffect(() => {
    const nextProfile = loadStoredProfile(userId);
    setProfilSnapshot(nextProfile);
    setVarianten(loadStoredVarianten(userId, nextProfile));
    setActiveVarianteId('basis');
    setSelectedCompareIds(['basis']);
  }, [userId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const toStore = varianten.filter((variante) => variante.id !== 'basis');
    window.localStorage.setItem(getVariantenStorageKey(userId), JSON.stringify(toStore));
  }, [userId, varianten]);

  const analysedVarianten = varianten.map((variante) => ({
    variante,
    analyse: analyseVariante(variante, profilSnapshot),
  }));

  const activeVarianteEntry = analysedVarianten.find((entry) => entry.variante.id === activeVarianteId) ?? analysedVarianten[0];
  const activeVariante = activeVarianteEntry.variante;
  const activeAnalyse = activeVarianteEntry.analyse;
  const chartEreignisse = activeVariante.ereignisse
    .map((ereignis) => {
      const punkt = activeAnalyse.vermoegensverlauf.find((entry) => entry.jahr === ereignis.jahr);
      if (!punkt) return null;

      return {
        ...ereignis,
        vermoegen: punkt.vermoegen,
        symbol: EREIGNIS_SYMBOLS[ereignis.typ] ?? EREIGNIS_SYMBOLS.sonstiges,
      };
    })
    .filter((ereignis): ereignis is Ereignis & { vermoegen: number; symbol: string } => ereignis !== null);
  const compareEntries = analysedVarianten.filter((entry) => selectedCompareIds.includes(entry.variante.id));
  const basisVariante = createBasisVariante(profilSnapshot);

  const handleDuplicate = (id: string) => {
    if (!isLoggedIn) {
      alert('Bitte melden Sie sich an, um Varianten zu speichern.');
      return;
    }

    const varianteToDuplicate = varianten.find((entry) => entry.id === id);
    if (!varianteToDuplicate) return;

    const newVariante: Variante = {
      ...varianteToDuplicate,
      id: `var-${Date.now()}`,
      name: `${varianteToDuplicate.name} (Kopie)`,
      status: 'dupliziert',
    };

    setVarianten((current) => [...current, newVariante]);
    setActiveVarianteId(newVariante.id);
    setSelectedCompareIds((current) => Array.from(new Set([...current, newVariante.id])));
  };

  const handleDelete = (id: string) => {
    if (id === 'basis') return;

    setVarianten((current) => current.filter((variante) => variante.id !== id));
    setSelectedCompareIds((current) => {
      const next = current.filter((entry) => entry !== id);
      return next.length > 0 ? next : ['basis'];
    });

    if (activeVarianteId === id) {
      setActiveVarianteId('basis');
    }
  };

  const handleCreateNew = () => {
    const newVariante: Variante = {
      ...basisVariante,
      id: `var-${Date.now()}`,
      name: `Variante ${varianten.length}`,
      beschreibung: 'Neue Variante basierend auf deinem Profil',
      status: 'manuell',
    };

    setVarianten((current) => [...current, newVariante]);
    setActiveVarianteId(newVariante.id);
    setSelectedCompareIds((current) => Array.from(new Set([...current, newVariante.id])));
  };

  const updateVariante = (updates: Partial<Variante>) => {
    setVarianten((current) =>
      current.map((variante) =>
        variante.id === activeVarianteId
          ? { ...variante, ...updates, status: variante.id === 'basis' ? 'default' : 'manuell' }
          : variante
      )
    );
  };

  const addEreignis = () => {
    const neuesEreignis: Ereignis = {
      id: `e-${Date.now()}`,
      typ: 'sonstiges',
      jahr: new Date().getFullYear() + 1,
      label: 'Neues Ereignis',
    };

    updateVariante({
      ereignisse: [...activeVariante.ereignisse, neuesEreignis],
    });
  };

  const updateEreignis = (ereignisId: string, updates: Partial<Ereignis>) => {
    updateVariante({
      ereignisse: activeVariante.ereignisse.map((ereignis) =>
        ereignis.id === ereignisId ? { ...ereignis, ...updates } : ereignis
      ),
    });
  };

  const removeEreignis = (ereignisId: string) => {
    const target = activeVariante.ereignisse.find((ereignis) => ereignis.id === ereignisId);
    if (target?.typ === 'pensionierung') {
      return;
    }

    updateVariante({
      ereignisse: activeVariante.ereignisse.filter((ereignis) => ereignis.id !== ereignisId),
    });
  };

  const startEditingName = () => {
    setEditedName(activeVariante.name);
    setIsEditingName(true);
  };

  const saveEditedName = () => {
    if (!editedName.trim()) return;
    updateVariante({ name: editedName.trim() });
    setIsEditingName(false);
  };

  const toggleCompareSelection = (id: string) => {
    setSelectedCompareIds((current) => {
      if (current.includes(id)) {
        const next = current.filter((entry) => entry !== id);
        return next.length > 0 ? next : current;
      }

      return [...current, id];
    });
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl text-foreground">Varianten bauen</h1>
              <p className="text-sm text-muted-foreground">
                Jede neue Variante startet aus deinem gespeicherten Profil. Veränderte Slider zeigen den Profilwert weiterhin an.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                Neue Variante
              </Button>
              <Button onClick={() => setCompareOpen(true)}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Vergleichen
              </Button>
            </div>
          </div>

          <Tabs value={activeVarianteId} onValueChange={setActiveVarianteId}>
            <div className="flex items-center gap-3 overflow-x-auto">
              <TabsList className="h-auto w-auto flex-none p-1">
                {varianten.map((variante) => (
                  <TabsTrigger key={variante.id} value={variante.id} className="relative px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span>{variante.name}</span>
                      {variante.status === 'manuell' && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                          Angepasst
                        </Badge>
                      )}
                      {variante.status === 'dupliziert' && <Copy className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="ml-auto flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleDuplicate(activeVarianteId)}>
                  <Copy className="h-4 w-4" />
                </Button>
                {activeVarianteId !== 'basis' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(activeVarianteId)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </Tabs>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-start gap-3">
            {isEditingName ? (
              <div className="flex flex-1 items-center gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(event) => setEditedName(event.target.value)}
                  className="flex-1 rounded-lg border border-border bg-input-background px-3 py-2 text-lg"
                  autoFocus
                />
                <Button size="sm" onClick={saveEditedName}>
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditingName(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-1 items-center gap-2">
                <h2 className="text-xl text-foreground">{activeVariante.name}</h2>
                {activeVarianteId !== 'basis' && (
                  <Button variant="ghost" size="sm" onClick={startEditingName}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{activeVariante.beschreibung}</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Zusammenfassung</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-primary/5 p-4">
                <p className="mb-1 text-xs text-muted-foreground">Vermögen bei 65 Jahren</p>
                <p className="text-2xl text-primary">{formatCurrency(activeAnalyse.endvermoegen)}</p>
              </div>

              <div className="rounded-lg bg-card p-4">
                <p className="mb-1 text-xs text-muted-foreground">Finanzielle Freiheit</p>
                {activeAnalyse.finanzielleFreiheitAlter ? (
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl text-success">{activeAnalyse.finanzielleFreiheitAlter} J.</p>
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl text-muted-foreground">-</p>
                    <AlertCircle className="h-5 w-5 text-warning" />
                  </div>
                )}
              </div>

              <div className="rounded-lg bg-card p-4">
                <p className="mb-1 text-xs text-muted-foreground">Ø Sparquote</p>
                <p className="text-2xl text-foreground">{activeAnalyse.sparquote}%</p>
              </div>

              <div className="rounded-lg bg-card p-4">
                <p className="mb-1 text-xs text-muted-foreground">Risikoprofil</p>
                <Badge
                  variant={
                    activeVariante.risikoprofil === 'dynamisch'
                      ? 'warning'
                      : activeVariante.risikoprofil === 'ausgewogen'
                        ? 'info'
                        : 'secondary'
                  }
                  className="text-base capitalize"
                >
                  {activeVariante.risikoprofil}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <CardTitle>Annahmen & Stellschrauben</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="mb-3 text-sm text-muted-foreground">Einkommen</p>
                <SliderInput
                  label="Bruttojahreseinkommen"
                  value={activeVariante.einkommen}
                  onChange={(value) => updateVariante({ einkommen: value })}
                  min={0}
                  max={350000}
                  step={5000}
                  suffix="CHF"
                  referenceValue={basisVariante.einkommen}
                />
                <ProfilReferenz original={basisVariante.einkommen} aktuell={activeVariante.einkommen} format={(value) => formatCurrency(Number(value))} />
                <div className="mt-3">
                  <SliderInput
                    label="Jährliches Wachstum"
                    value={activeVariante.einkommenswachstum}
                    onChange={(value) => updateVariante({ einkommenswachstum: value })}
                    min={0}
                    max={10}
                    step={0.5}
                    suffix="%"
                    referenceValue={basisVariante.einkommenswachstum}
                  />
                  <ProfilReferenz original={basisVariante.einkommenswachstum} aktuell={activeVariante.einkommenswachstum} format={(value) => formatPercent(Number(value))} />
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <p className="mb-3 text-sm text-muted-foreground">Sparraten</p>
                <SliderInput
                  label="Säule 3a (jährlich)"
                  value={activeVariante.sparrate3a}
                  onChange={(value) => updateVariante({ sparrate3a: value })}
                  min={0}
                  max={profilSnapshot.anstellungsart === 'selbstaendig' ? 35280 : 7258}
                  step={100}
                  suffix="CHF"
                  referenceValue={basisVariante.sparrate3a}
                />
                <ProfilReferenz original={basisVariante.sparrate3a} aktuell={activeVariante.sparrate3a} format={(value) => formatCurrency(Number(value))} />
                <div className="mt-3">
                  <SliderInput
                    label="Wertschriften (monatlich)"
                    value={activeVariante.sparrateWertschriften}
                    onChange={(value) => updateVariante({ sparrateWertschriften: value })}
                    min={0}
                    max={6000}
                    step={50}
                    suffix="CHF"
                    referenceValue={basisVariante.sparrateWertschriften}
                  />
                  <ProfilReferenz original={basisVariante.sparrateWertschriften} aktuell={activeVariante.sparrateWertschriften} format={(value) => formatCurrency(Number(value))} />
                </div>
                <div className="mt-3">
                  <SliderInput
                    label="Hypothek-Amortisation (monatlich)"
                    value={activeVariante.amortisation}
                    onChange={(value) => updateVariante({ amortisation: value })}
                    min={0}
                    max={5000}
                    step={50}
                    suffix="CHF"
                    referenceValue={basisVariante.amortisation}
                  />
                  <ProfilReferenz original={basisVariante.amortisation} aktuell={activeVariante.amortisation} format={(value) => formatCurrency(Number(value))} />
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <div className="mb-3 flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Asset Allocation</p>
                  <InfoTooltip content="Aufteilung zwischen Aktien und festverzinslichen Anlagen." />
                </div>
                <SliderInput
                  label="Aktienquote"
                  value={activeVariante.aktienquote}
                  onChange={(value) => updateVariante({ aktienquote: value })}
                  min={0}
                  max={100}
                  step={5}
                  suffix="%"
                  referenceValue={basisVariante.aktienquote}
                />
                <ProfilReferenz original={basisVariante.aktienquote} aktuell={activeVariante.aktienquote} format={(value) => formatPercent(Number(value))} />
                <div className="mt-2 flex gap-2 text-xs">
                  <div className="flex-1 rounded bg-primary/10 px-2 py-1">
                    <span className="text-muted-foreground">Aktien:</span>{' '}
                    <span className="text-foreground">{activeVariante.aktienquote}%</span>
                  </div>
                  <div className="flex-1 rounded bg-muted px-2 py-1">
                    <span className="text-muted-foreground">Obligationen:</span>{' '}
                    <span className="text-foreground">{100 - activeVariante.aktienquote}%</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <Select
                  label="Risikoprofil"
                  value={activeVariante.risikoprofil}
                  onChange={(value) => updateVariante({ risikoprofil: value as Variante['risikoprofil'] })}
                  options={RISIKO_OPTIONS}
                />
                <p className={`mt-2 text-xs ${activeVariante.risikoprofil === basisVariante.risikoprofil ? 'text-muted-foreground' : 'text-primary'}`}>
                  Profilwert: {RISIKO_OPTIONS.find((option) => option.value === basisVariante.risikoprofil)?.label}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <CardTitle>Lebensereignisse</CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={addEreignis}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {activeVariante.ereignisse.length === 0 ? (
                <div className="py-12 text-center">
                  <Calendar className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
                  <p className="mb-1 text-sm text-foreground">Keine Ereignisse definiert</p>
                  <p className="text-xs text-muted-foreground">
                    Ergänze Kind, Wohneigentum, Teilzeit oder andere Änderungen direkt in der Variante.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeVariante.ereignisse
                    .slice()
                    .sort((a, b) => a.jahr - b.jahr)
                    .map((ereignis) => {
                      const eventType = EREIGNIS_TYPES.find((entry) => entry.value === ereignis.typ);
                      const EreignisIcon = eventType?.icon ?? Calendar;

                      return (
                        <div key={ereignis.id} className="rounded-lg border border-border p-3">
                          <div className="mb-3 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <EreignisIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <Select
                                value={ereignis.typ}
                                onChange={(value) => updateEreignis(ereignis.id, { typ: value as Ereignis['typ'] })}
                                options={EREIGNIS_TYPES.map((entry) => ({ value: entry.value, label: entry.label }))}
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEreignis(ereignis.id)}
                              className="text-destructive hover:text-destructive"
                              disabled={ereignis.typ === 'pensionierung'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                            <input
                              type="text"
                              value={ereignis.label}
                              onChange={(event) => updateEreignis(ereignis.id, { label: event.target.value })}
                              className="rounded-lg border border-border bg-input-background px-3 py-2 text-sm"
                              placeholder="Beschreibung"
                            />
                            <input
                              type="number"
                              value={ereignis.jahr}
                              onChange={(event) => updateEreignis(ereignis.id, { jahr: Number(event.target.value) || new Date().getFullYear() })}
                              className="rounded-lg border border-border bg-input-background px-3 py-2 text-sm"
                              min={new Date().getFullYear()}
                              max={2100}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Auswirkungen & Prognose</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-8">
              <p className="mb-4 text-sm text-muted-foreground">Vermögensverlauf bis Pensionierung</p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={activeAnalyse.vermoegensverlauf} margin={{ top: 36, right: 16, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                  <XAxis dataKey="jahr" stroke="#6b7280" fontSize={12} tick={{ fill: '#6b7280' }} />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    tick={{ fill: '#6b7280' }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Vermögen']}
                    labelStyle={{ color: '#111827' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="vermoegen"
                    stroke="#1e40af"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  {chartEreignisse
                    .slice()
                    .sort((a, b) => a.jahr - b.jahr)
                    .map((ereignis) => (
                      <React.Fragment key={`chart-event-${ereignis.id}`}>
                        <ReferenceLine
                          x={ereignis.jahr}
                          stroke={ereignis.typ === 'pensionierung' ? '#16a34a' : '#f59e0b'}
                          strokeDasharray="4 4"
                          ifOverflow="extendDomain"
                          isFront
                        />
                        <ReferenceDot
                          x={ereignis.jahr}
                          y={ereignis.vermoegen}
                          r={10}
                          fill={ereignis.typ === 'pensionierung' ? '#16a34a' : '#f59e0b'}
                          stroke="#ffffff"
                          strokeWidth={3}
                          ifOverflow="extendDomain"
                          isFront
                          label={{
                            value: `${ereignis.symbol} ${ereignis.label}`,
                            position: 'insideTop',
                            fill: ereignis.typ === 'pensionierung' ? '#166534' : '#92400e',
                            fontSize: 12,
                            offset: 18,
                          }}
                        />
                      </React.Fragment>
                    ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border p-4">
                <p className="mb-2 text-xs text-muted-foreground">Gesamtes Sparvolumen</p>
                <p className="text-xl text-foreground">{formatCurrency(activeAnalyse.gesamtesSparvolumen30Jahre)}</p>
                <p className="mt-1 text-xs text-muted-foreground">über 30 Jahre</p>
              </div>

              <div className="rounded-lg border border-border p-4">
                <p className="mb-2 text-xs text-muted-foreground">Steuern bezahlt (Total)</p>
                <p className="text-xl text-foreground">{formatCurrency(activeAnalyse.steuernTotal)}</p>
                <p className="mt-1 text-xs text-muted-foreground">modellierte Lebenszeit</p>
              </div>

              <div className="rounded-lg border border-border p-4">
                <p className="mb-2 text-xs text-muted-foreground">Ø Rendite (erwartet)</p>
                <p className="text-xl text-foreground">{activeAnalyse.erwarteteRendite.toFixed(1)}%</p>
                <p className="mt-1 text-xs text-muted-foreground">p.a. nominal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Varianten vergleichen
            </DialogTitle>
            <DialogDescription>
              Wähle die Varianten aus, die du vergleichen möchtest.
            </DialogDescription>
          </DialogHeader>

          <div className="mb-4 flex flex-wrap gap-2">
            {varianten.map((variante) => (
              <button
                key={variante.id}
                onClick={() => toggleCompareSelection(variante.id)}
                className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                  selectedCompareIds.includes(variante.id)
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-card-foreground hover:bg-accent'
                }`}
              >
                {variante.name}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 pr-4 text-left text-sm text-muted-foreground">Kriterium</th>
                  {compareEntries.map((entry) => (
                    <th key={entry.variante.id} className="px-4 py-3 text-left text-sm text-foreground">
                      {entry.variante.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-3 pr-4 text-sm text-foreground">Endvermögen (65 J.)</td>
                  {compareEntries.map((entry) => {
                    const maxValue = Math.max(...compareEntries.map((item) => item.analyse.endvermoegen));
                    const isMax = entry.analyse.endvermoegen === maxValue;
                    return (
                      <td key={entry.variante.id} className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${isMax ? 'text-success' : 'text-foreground'}`}>
                            {formatCurrency(entry.analyse.endvermoegen)}
                          </span>
                          {isMax && <ArrowUpRight className="h-4 w-4 text-success" />}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                <tr className="border-b border-border">
                  <td className="py-3 pr-4 text-sm text-foreground">Finanzielle Freiheit</td>
                  {compareEntries.map((entry) => {
                    const withFreiheit = compareEntries.filter((item) => item.analyse.finanzielleFreiheitAlter !== null);
                    const minAlter = withFreiheit.length > 0
                      ? Math.min(...withFreiheit.map((item) => item.analyse.finanzielleFreiheitAlter as number))
                      : null;
                    const isMin = entry.analyse.finanzielleFreiheitAlter !== null && entry.analyse.finanzielleFreiheitAlter === minAlter;

                    return (
                      <td key={entry.variante.id} className="px-4 py-3">
                        {entry.analyse.finanzielleFreiheitAlter ? (
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${isMin ? 'text-success' : 'text-foreground'}`}>
                              {entry.analyse.finanzielleFreiheitAlter} Jahre
                            </span>
                            {isMin && <CheckCircle2 className="h-4 w-4 text-success" />}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                <tr className="border-b border-border">
                  <td className="py-3 pr-4 text-sm text-foreground">Ø Sparquote</td>
                  {compareEntries.map((entry) => (
                    <td key={entry.variante.id} className="px-4 py-3 text-sm text-foreground">
                      {entry.analyse.sparquote}%
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-border">
                  <td className="py-3 pr-4 text-sm text-foreground">Steuern (Total)</td>
                  {compareEntries.map((entry) => {
                    const minSteuern = Math.min(...compareEntries.map((item) => item.analyse.steuernTotal));
                    const isMin = entry.analyse.steuernTotal === minSteuern;
                    return (
                      <td key={entry.variante.id} className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${isMin ? 'text-success' : 'text-foreground'}`}>
                            {formatCurrency(entry.analyse.steuernTotal)}
                          </span>
                          {isMin && <ArrowDownRight className="h-4 w-4 text-success" />}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                <tr className="border-b border-border">
                  <td className="py-3 pr-4 text-sm text-foreground">Risikoprofil</td>
                  {compareEntries.map((entry) => (
                    <td key={entry.variante.id} className="px-4 py-3">
                      <Badge
                        variant={
                          entry.variante.risikoprofil === 'dynamisch'
                            ? 'warning'
                            : entry.variante.risikoprofil === 'ausgewogen'
                              ? 'info'
                              : 'secondary'
                        }
                        className="capitalize"
                      >
                        {entry.variante.risikoprofil}
                      </Badge>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 pr-4 text-sm text-foreground">Aktienquote</td>
                  {compareEntries.map((entry) => (
                    <td key={entry.variante.id} className="px-4 py-3 text-sm text-foreground">
                      {entry.variante.aktienquote}%
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={() => setCompareOpen(false)}>Schliessen</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
