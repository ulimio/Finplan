export type Risikoprofil = 'konservativ' | 'ausgewogen' | 'dynamisch';
export type Anstellungsart = 'angestellt' | 'selbstaendig' | 'gemischt';

export interface ProfilSnapshot {
  vorname: string;
  nachname: string;
  geburtsdatum: string;
  anstellungsart: Anstellungsart;
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
  risikobereitschaft: Risikoprofil;
  wunschalterFreiheit: number;
  notgroschenZiel: number;
  kurzfristigeZiele: string;
  sectionStatus: Record<string, 'complete' | 'incomplete' | 'skipped'>;
}

export interface Ereignis {
  id: string;
  typ: 'kind' | 'wohneigentum' | 'teilzeit' | 'sabbatical' | 'sonstiges';
  jahr: number;
  label: string;
}

export interface Variante {
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
  risikoprofil: Risikoprofil;
  ereignisse: Ereignis[];
}

export interface VariantenAnalyse {
  endvermoegen: number;
  finanzielleFreiheitAlter: number | null;
  sparquote: number;
  steuernTotal: number;
  erwarteteRendite: number;
  gesamtesSparvolumen30Jahre: number;
  vermoegensverlauf: Array<{ jahr: number; vermoegen: number }>;
}

const DEFAULT_SECTION_STATUS: Record<string, 'complete' | 'incomplete' | 'skipped'> = {
  basis: 'incomplete',
  einkommen: 'incomplete',
  vermoegen: 'incomplete',
  schulden: 'incomplete',
  vorsorge: 'incomplete',
  steuern: 'incomplete',
  risiko: 'incomplete',
  ziele: 'incomplete',
};

export const DEFAULT_PROFILE: ProfilSnapshot = {
  vorname: '',
  nachname: '',
  geburtsdatum: '',
  anstellungsart: 'angestellt',
  bruttoeinkommen: 80000,
  variablesEinkommen: 0,
  einkommensentwicklung: 2,
  liquiditaet: 50000,
  wertschriften: 80000,
  immobilienwert: 0,
  sonstigesVermoegen: 0,
  hypothek: 0,
  konsumkredite: 0,
  pkGuthaben: 120000,
  saule3aGesamt: 35000,
  grenzsteuersatz: 0,
  risikobereitschaft: 'ausgewogen',
  wunschalterFreiheit: 60,
  notgroschenZiel: 15000,
  kurzfristigeZiele: '',
  sectionStatus: DEFAULT_SECTION_STATUS,
};

export function getProfileStorageKey(userId?: string) {
  return `finplan.profil.${userId ?? 'guest'}`;
}

export function getVariantenStorageKey(userId?: string) {
  return `finplan.varianten.${userId ?? 'guest'}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function formatCurrency(value: number) {
  return `${value.toLocaleString('de-CH')} CHF`;
}

export function formatPercent(value: number) {
  return `${value.toLocaleString('de-CH', { maximumFractionDigits: 1 })}%`;
}

function parseGeburtsjahr(geburtsdatum: string) {
  if (!geburtsdatum) return null;
  const parsed = new Date(geburtsdatum);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.getFullYear();
}

export function berechneAlter(geburtsdatum: string) {
  const geburtsjahr = parseGeburtsjahr(geburtsdatum);
  if (!geburtsjahr) return 40;
  return clamp(new Date().getFullYear() - geburtsjahr, 18, 64);
}

export function loadStoredProfile(userId?: string): ProfilSnapshot {
  if (typeof window === 'undefined') {
    return DEFAULT_PROFILE;
  }

  try {
    const raw = window.localStorage.getItem(getProfileStorageKey(userId));
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);

    return {
      ...DEFAULT_PROFILE,
      vorname: typeof parsed.vorname === 'string' ? parsed.vorname : DEFAULT_PROFILE.vorname,
      nachname: typeof parsed.nachname === 'string' ? parsed.nachname : DEFAULT_PROFILE.nachname,
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
      wunschalterFreiheit: Number(parsed.wunschalterFreiheit ?? DEFAULT_PROFILE.wunschalterFreiheit),
      notgroschenZiel: Number(parsed.notgroschenZiel ?? DEFAULT_PROFILE.notgroschenZiel),
      kurzfristigeZiele:
        typeof parsed.kurzfristigeZiele === 'string'
          ? parsed.kurzfristigeZiele
          : DEFAULT_PROFILE.kurzfristigeZiele,
      sectionStatus: {
        ...DEFAULT_SECTION_STATUS,
        ...(parsed.sectionStatus ?? {}),
      },
    };
  } catch (error) {
    console.error('Fehler beim Laden des Profils:', error);
    return DEFAULT_PROFILE;
  }
}

export function createBasisVariante(profile: ProfilSnapshot): Variante {
  const einkommen = profile.bruttoeinkommen + profile.variablesEinkommen;
  const max3a = profile.anstellungsart === 'selbstaendig' ? 35280 : 7258;

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
    ereignisse: [],
  };
}

function normalizeStoredVariante(raw: Partial<Variante>, profile: ProfilSnapshot, index: number): Variante {
  const basis = createBasisVariante(profile);

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
    ereignisse: Array.isArray(raw.ereignisse)
      ? raw.ereignisse.map((ereignis, ereignisIndex) => ({
          id: ereignis.id ?? `e-${index}-${ereignisIndex}`,
          typ: ereignis.typ ?? 'sonstiges',
          jahr: Number(ereignis.jahr ?? new Date().getFullYear() + 1),
          label: typeof ereignis.label === 'string' && ereignis.label.trim() ? ereignis.label : 'Ereignis',
        }))
      : [],
  };
}

export function loadStoredVarianten(userId: string | undefined, profile: ProfilSnapshot): Variante[] {
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

export function analyseVariante(variante: Variante, profile: ProfilSnapshot): VariantenAnalyse {
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
