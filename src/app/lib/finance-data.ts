export type Risikoprofil = 'konservativ' | 'ausgewogen' | 'dynamisch';
export type Anstellungsart = 'angestellt' | 'selbstaendig' | 'gemischt';
export type Zivilstand = 'ledig' | 'verheiratet' | 'geschieden' | 'verwitwet';
export type Haushaltsmodell = 'single' | 'paar' | 'konkubinat';
export type Einkommenssicherheit = 'stabil' | 'mittel' | 'volatil';
export type Anlagehorizont = 'kurz' | 'mittel' | 'lang';
export type Verlusttoleranz = 'niedrig' | 'mittel' | 'hoch';
export type EsgPraeferenz = 'wichtig' | 'neutral' | 'egal';

export interface ProfilSnapshot {
  vorname: string;
  nachname: string;
  geburtsdatum: string;
  zivilstand: Zivilstand;
  kanton: string;
  staatsangehoerigkeit: string;
  haushaltsmodell: Haushaltsmodell;
  anzahlKinder: number;
  partnerEinkommen: number;
  partnerVermoegen: number;
  anstellungsart: Anstellungsart;
  bruttoeinkommen: number;
  variablesEinkommen: number;
  einkommensentwicklung: number;
  einkommenssicherheit: Einkommenssicherheit;
  selbststaendigReserveMonate: number;
  monatlicheAusgaben: number;
  wohnkostenMonat: number;
  krankenkasseMonat: number;
  betreuungskostenMonat: number;
  sonstigeFixkostenMonat: number;
  liquiditaet: number;
  wertschriften: number;
  immobilienwert: number;
  sonstigesVermoegen: number;
  hypothek: number;
  hypothekZins: number;
  indirekteAmortisation: boolean;
  eigenmietwert: number;
  liegenschaftsKostenJahr: number;
  konsumkredite: number;
  konsumkrediteZins: number;
  ahvLuecke: 'ja' | 'nein' | 'unbekannt';
  ahvRenteJaehrlich: number;
  pkGuthaben: number;
  pkEinkaufspotenzial: number;
  pkRenteUmwandlungssatz: number;
  pkBeitragArbeitnehmer: number;
  pkBeitragArbeitgeber: number;
  freizuegigkeitsguthaben: number;
  saule3aGesamt: number;
  saule3aKonten: number[];
  mehrere3a: boolean;
  saule3bVermoegen: number;
  kirchensteuer: boolean;
  grenzsteuersatz: number;
  risikobereitschaft: Risikoprofil;
  anlagehorizont: Anlagehorizont;
  verlusttoleranz: Verlusttoleranz;
  esgPraeferenz: EsgPraeferenz;
  invaliditaetsabsicherungJahr: number;
  todesfallabsicherungJahr: number;
  wunschalterFreiheit: number;
  fruehpensionierungsAlter: number;
  notgroschenZiel: number;
  gewuenschteJahresausgabenRuhestand: number;
  lebensereignisse: Ereignis[];
  sectionStatus: Record<string, 'complete' | 'incomplete' | 'skipped'>;
}

export interface Ereignis {
  id: string;
  typ: 'kind' | 'wohneigentum' | 'teilzeit' | 'sabbatical' | 'pensionierung' | 'sonstiges';
  jahr: number;
  label: string;
  details?: {
    kindName?: string;
    kaufpreis?: number;
    eigenmittel?: number;
    hypothek?: number;
    wohnform?: 'eigenheim' | 'rendite';
    teilzeitPensum?: number;
    sabbaticalMonate?: number;
  };
}

export interface Variante {
  id: string;
  name: string;
  beschreibung: string;
  status: 'default' | 'dupliziert' | 'manuell';
  einkommen: number;
  einkommenswachstum: number;
  sparrate3a: number;
  sparrate3b: number;
  sparrateWertschriften: number;
  amortisation: number;
  pkEinkaufJahr: number;
  pkEinkaufBetrag: number;
  aktienquote: number;
  risikoprofil: Risikoprofil;
  retirementAge: number;
  kapitalbezugPkProzent: number;
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
  monatlicherUeberschussHeute: number;
  freiesInvestierbaresVermoegen: number;
  tragbarkeitQuote: number;
  tragbarkeitStatus: 'kritisch' | 'angespannt' | 'stabil';
  nettoRenteAbPension: number;
  rentenlueckeAbPension: number;
  fruehpensionierungMachbar: boolean;
  steuerHeute: number;
  vermoegenssteuerHeute: number;
  steuerBeiKapitalbezug: number;
  ahvPrognose: number;
  pkPrognoseRente: number;
  pkKapitalZumPensionierungszeitpunkt: number;
  '3aStaffelungEmpfohlen': boolean;
  risikoScore: number;
  risikoHinweise: string[];
  umsetzungsScore: number;
  priorisierteMassnahmen: Array<{ id: string; label: string; impact: number; liquiditaetsbedarf: number; summary: string }>;
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

const CANTON_TAX_MULTIPLIER: Record<string, number> = {
  ag: 1.02,
  ai: 0.9,
  ar: 0.96,
  be: 1.08,
  bl: 1.0,
  bs: 1.1,
  fr: 1.04,
  ge: 1.12,
  gl: 0.98,
  gr: 0.92,
  ju: 1.03,
  lu: 0.93,
  ne: 1.04,
  nw: 0.89,
  ow: 0.88,
  sg: 0.98,
  sh: 1.0,
  so: 1.01,
  sz: 0.84,
  tg: 0.95,
  ti: 1.02,
  ur: 0.91,
  vd: 1.06,
  vs: 0.96,
  zg: 0.8,
  zh: 1,
};

export const DEFAULT_PROFILE: ProfilSnapshot = {
  vorname: '',
  nachname: '',
  geburtsdatum: '',
  zivilstand: 'ledig',
  kanton: 'zh',
  staatsangehoerigkeit: 'CH',
  haushaltsmodell: 'single',
  anzahlKinder: 0,
  partnerEinkommen: 0,
  partnerVermoegen: 0,
  anstellungsart: 'angestellt',
  bruttoeinkommen: 80000,
  variablesEinkommen: 0,
  einkommensentwicklung: 1.5,
  einkommenssicherheit: 'mittel',
  selbststaendigReserveMonate: 6,
  monatlicheAusgaben: 4500,
  wohnkostenMonat: 1800,
  krankenkasseMonat: 450,
  betreuungskostenMonat: 0,
  sonstigeFixkostenMonat: 1200,
  liquiditaet: 10000,
  wertschriften: 5000,
  immobilienwert: 0,
  sonstigesVermoegen: 0,
  hypothek: 0,
  hypothekZins: 1.5,
  indirekteAmortisation: true,
  eigenmietwert: 0,
  liegenschaftsKostenJahr: 0,
  konsumkredite: 0,
  konsumkrediteZins: 5,
  ahvLuecke: 'unbekannt',
  ahvRenteJaehrlich: 0,
  pkGuthaben: 25000,
  pkEinkaufspotenzial: 0,
  pkRenteUmwandlungssatz: 5.2,
  pkBeitragArbeitnehmer: 4500,
  pkBeitragArbeitgeber: 4500,
  freizuegigkeitsguthaben: 0,
  saule3aGesamt: 5000,
  saule3aKonten: [5000],
  mehrere3a: false,
  saule3bVermoegen: 0,
  kirchensteuer: false,
  grenzsteuersatz: 0,
  risikobereitschaft: 'ausgewogen',
  anlagehorizont: 'lang',
  verlusttoleranz: 'mittel',
  esgPraeferenz: 'neutral',
  invaliditaetsabsicherungJahr: 0,
  todesfallabsicherungJahr: 0,
  wunschalterFreiheit: 65,
  fruehpensionierungsAlter: 63,
  notgroschenZiel: 10000,
  gewuenschteJahresausgabenRuhestand: 65000,
  lebensereignisse: [],
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
  return clamp(new Date().getFullYear() - geburtsjahr, 18, 75);
}

function normalizeEreignisDetails(raw: unknown): Ereignis['details'] {
  if (!raw || typeof raw !== 'object') {
    return undefined;
  }

  const details = raw as Record<string, unknown>;

  return {
    kindName: typeof details.kindName === 'string' ? details.kindName : undefined,
    kaufpreis: typeof details.kaufpreis === 'number' ? details.kaufpreis : Number(details.kaufpreis ?? 0) || undefined,
    eigenmittel: typeof details.eigenmittel === 'number' ? details.eigenmittel : Number(details.eigenmittel ?? 0) || undefined,
    hypothek: typeof details.hypothek === 'number' ? details.hypothek : Number(details.hypothek ?? 0) || undefined,
    wohnform: details.wohnform === 'rendite' ? 'rendite' : details.wohnform === 'eigenheim' ? 'eigenheim' : undefined,
    teilzeitPensum: typeof details.teilzeitPensum === 'number' ? details.teilzeitPensum : Number(details.teilzeitPensum ?? 0) || undefined,
    sabbaticalMonate: typeof details.sabbaticalMonate === 'number' ? details.sabbaticalMonate : Number(details.sabbaticalMonate ?? 0) || undefined,
  };
}

function buildEreignisLabel(typ: Ereignis['typ'], details?: Ereignis['details']) {
  if (typ === 'kind') {
    return details?.kindName?.trim() ? `Kind: ${details.kindName.trim()}` : 'Kind';
  }

  if (typ === 'wohneigentum') {
    const formLabel = details?.wohnform === 'rendite' ? 'Renditeobjekt' : 'Hauskauf';
    return details?.kaufpreis ? `${formLabel} · ${formatCurrency(details.kaufpreis)}` : formLabel;
  }

  if (typ === 'teilzeit') {
    return details?.teilzeitPensum ? `Teilzeit · ${details.teilzeitPensum}% Pensum` : 'Teilzeit';
  }

  if (typ === 'sabbatical') {
    return details?.sabbaticalMonate ? `Sabbatical · ${details.sabbaticalMonate} Monate` : 'Sabbatical';
  }

  if (typ === 'pensionierung') {
    return 'Pensionierung';
  }

  return 'Lebensereignis';
}

function normalizeStoredEreignis(raw: Partial<Ereignis>, index: number): Ereignis {
  const typ = raw.typ ?? 'sonstiges';
  const details = normalizeEreignisDetails(raw.details);

  return {
    id: raw.id ?? `e-${index}`,
    typ,
    jahr: Number(raw.jahr ?? new Date().getFullYear() + 1),
    label: typeof raw.label === 'string' && raw.label.trim() ? raw.label : buildEreignisLabel(typ, details),
    details,
  };
}

function normalizeProfileEreignisse(raw: unknown, legacyText?: unknown): Ereignis[] {
  if (Array.isArray(raw)) {
    return raw
      .filter((entry): entry is Partial<Ereignis> => Boolean(entry) && typeof entry === 'object')
      .map((entry, index) => normalizeStoredEreignis(entry, index));
  }

  if (typeof legacyText === 'string' && legacyText.trim()) {
    return [
      normalizeStoredEreignis(
        {
          id: 'legacy-ziel',
          typ: 'sonstiges',
          jahr: new Date().getFullYear() + 1,
          label: legacyText.trim(),
        },
        0
      ),
    ];
  }

  return [];
}

function buildPensionierungsEreignis(geburtsdatum: string, retirementAge = 65): Ereignis {
  const aktuellesJahr = new Date().getFullYear();
  const pensionierungsJahr = aktuellesJahr + Math.max(1, retirementAge - berechneAlter(geburtsdatum));

  return {
    id: 'pensionierung',
    typ: 'pensionierung',
    jahr: pensionierungsJahr,
    label: 'Pensionierung',
  };
}

function normalizeSaule3aKonten(raw: unknown, fallbackTotal: number) {
  if (Array.isArray(raw)) {
    const konten = raw.map((entry) => Number(entry)).filter((entry) => Number.isFinite(entry) && entry >= 0);
    if (konten.length > 0) {
      return konten;
    }
  }

  return [Math.max(0, fallbackTotal)];
}

export function loadStoredProfile(userId?: string): ProfilSnapshot {
  if (typeof window === 'undefined') {
    return DEFAULT_PROFILE;
  }

  try {
    const raw = window.localStorage.getItem(getProfileStorageKey(userId));
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    const saule3aGesamt = Number(parsed.saule3aGesamt ?? DEFAULT_PROFILE.saule3aGesamt);

    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      vorname: typeof parsed.vorname === 'string' ? parsed.vorname : DEFAULT_PROFILE.vorname,
      nachname: typeof parsed.nachname === 'string' ? parsed.nachname : DEFAULT_PROFILE.nachname,
      geburtsdatum: typeof parsed.geburtsdatum === 'string' ? parsed.geburtsdatum : DEFAULT_PROFILE.geburtsdatum,
      zivilstand: parsed.zivilstand ?? DEFAULT_PROFILE.zivilstand,
      kanton: parsed.kanton ?? DEFAULT_PROFILE.kanton,
      staatsangehoerigkeit: parsed.staatsangehoerigkeit ?? DEFAULT_PROFILE.staatsangehoerigkeit,
      haushaltsmodell: parsed.haushaltsmodell ?? DEFAULT_PROFILE.haushaltsmodell,
      anzahlKinder: Number(parsed.anzahlKinder ?? DEFAULT_PROFILE.anzahlKinder),
      partnerEinkommen: Number(parsed.partnerEinkommen ?? DEFAULT_PROFILE.partnerEinkommen),
      partnerVermoegen: Number(parsed.partnerVermoegen ?? DEFAULT_PROFILE.partnerVermoegen),
      anstellungsart: parsed.anstellungsart ?? DEFAULT_PROFILE.anstellungsart,
      bruttoeinkommen: Number(parsed.bruttoeinkommen ?? DEFAULT_PROFILE.bruttoeinkommen),
      variablesEinkommen: Number(parsed.variablesEinkommen ?? DEFAULT_PROFILE.variablesEinkommen),
      einkommensentwicklung: Number(parsed.einkommensentwicklung ?? DEFAULT_PROFILE.einkommensentwicklung),
      einkommenssicherheit: parsed.einkommenssicherheit ?? DEFAULT_PROFILE.einkommenssicherheit,
      selbststaendigReserveMonate: Number(parsed.selbststaendigReserveMonate ?? DEFAULT_PROFILE.selbststaendigReserveMonate),
      monatlicheAusgaben: Number(parsed.monatlicheAusgaben ?? DEFAULT_PROFILE.monatlicheAusgaben),
      wohnkostenMonat: Number(parsed.wohnkostenMonat ?? DEFAULT_PROFILE.wohnkostenMonat),
      krankenkasseMonat: Number(parsed.krankenkasseMonat ?? DEFAULT_PROFILE.krankenkasseMonat),
      betreuungskostenMonat: Number(parsed.betreuungskostenMonat ?? DEFAULT_PROFILE.betreuungskostenMonat),
      sonstigeFixkostenMonat: Number(parsed.sonstigeFixkostenMonat ?? DEFAULT_PROFILE.sonstigeFixkostenMonat),
      liquiditaet: Number(parsed.liquiditaet ?? DEFAULT_PROFILE.liquiditaet),
      wertschriften: Number(parsed.wertschriften ?? DEFAULT_PROFILE.wertschriften),
      immobilienwert: Number(parsed.immobilienwert ?? DEFAULT_PROFILE.immobilienwert),
      sonstigesVermoegen: Number(parsed.sonstigesVermoegen ?? DEFAULT_PROFILE.sonstigesVermoegen),
      hypothek: Number(parsed.hypothek ?? DEFAULT_PROFILE.hypothek),
      hypothekZins: Number(parsed.hypothekZins ?? DEFAULT_PROFILE.hypothekZins),
      indirekteAmortisation: typeof parsed.indirekteAmortisation === 'boolean' ? parsed.indirekteAmortisation : DEFAULT_PROFILE.indirekteAmortisation,
      eigenmietwert: Number(parsed.eigenmietwert ?? DEFAULT_PROFILE.eigenmietwert),
      liegenschaftsKostenJahr: Number(parsed.liegenschaftsKostenJahr ?? DEFAULT_PROFILE.liegenschaftsKostenJahr),
      konsumkredite: Number(parsed.konsumkredite ?? DEFAULT_PROFILE.konsumkredite),
      konsumkrediteZins: Number(parsed.konsumkrediteZins ?? DEFAULT_PROFILE.konsumkrediteZins),
      ahvLuecke: parsed.ahvLuecke ?? DEFAULT_PROFILE.ahvLuecke,
      ahvRenteJaehrlich: Number(parsed.ahvRenteJaehrlich ?? DEFAULT_PROFILE.ahvRenteJaehrlich),
      pkGuthaben: Number(parsed.pkGuthaben ?? DEFAULT_PROFILE.pkGuthaben),
      pkEinkaufspotenzial: Number(parsed.pkEinkaufspotenzial ?? DEFAULT_PROFILE.pkEinkaufspotenzial),
      pkRenteUmwandlungssatz: Number(parsed.pkRenteUmwandlungssatz ?? DEFAULT_PROFILE.pkRenteUmwandlungssatz),
      pkBeitragArbeitnehmer: Number(parsed.pkBeitragArbeitnehmer ?? DEFAULT_PROFILE.pkBeitragArbeitnehmer),
      pkBeitragArbeitgeber: Number(parsed.pkBeitragArbeitgeber ?? DEFAULT_PROFILE.pkBeitragArbeitgeber),
      freizuegigkeitsguthaben: Number(parsed.freizuegigkeitsguthaben ?? DEFAULT_PROFILE.freizuegigkeitsguthaben),
      saule3aGesamt,
      saule3aKonten: normalizeSaule3aKonten(parsed.saule3aKonten, saule3aGesamt),
      mehrere3a: typeof parsed.mehrere3a === 'boolean' ? parsed.mehrere3a : DEFAULT_PROFILE.mehrere3a,
      saule3bVermoegen: Number(parsed.saule3bVermoegen ?? DEFAULT_PROFILE.saule3bVermoegen),
      kirchensteuer: typeof parsed.kirchensteuer === 'boolean' ? parsed.kirchensteuer : DEFAULT_PROFILE.kirchensteuer,
      grenzsteuersatz: Number(parsed.grenzsteuersatz ?? DEFAULT_PROFILE.grenzsteuersatz),
      risikobereitschaft: parsed.risikobereitschaft ?? DEFAULT_PROFILE.risikobereitschaft,
      anlagehorizont: parsed.anlagehorizont ?? DEFAULT_PROFILE.anlagehorizont,
      verlusttoleranz: parsed.verlusttoleranz ?? DEFAULT_PROFILE.verlusttoleranz,
      esgPraeferenz: parsed.esgPraeferenz ?? DEFAULT_PROFILE.esgPraeferenz,
      invaliditaetsabsicherungJahr: Number(parsed.invaliditaetsabsicherungJahr ?? DEFAULT_PROFILE.invaliditaetsabsicherungJahr),
      todesfallabsicherungJahr: Number(parsed.todesfallabsicherungJahr ?? DEFAULT_PROFILE.todesfallabsicherungJahr),
      wunschalterFreiheit: Number(parsed.wunschalterFreiheit ?? DEFAULT_PROFILE.wunschalterFreiheit),
      fruehpensionierungsAlter: Number(parsed.fruehpensionierungsAlter ?? DEFAULT_PROFILE.fruehpensionierungsAlter),
      notgroschenZiel: Number(parsed.notgroschenZiel ?? DEFAULT_PROFILE.notgroschenZiel),
      gewuenschteJahresausgabenRuhestand: Number(parsed.gewuenschteJahresausgabenRuhestand ?? DEFAULT_PROFILE.gewuenschteJahresausgabenRuhestand),
      lebensereignisse: normalizeProfileEreignisse(parsed.lebensereignisse, parsed.kurzfristigeZiele),
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

function estimatedMax3a(profile: ProfilSnapshot) {
  return profile.anstellungsart === 'selbstaendig' ? 35280 : 7258;
}

export function createBasisVariante(profile: ProfilSnapshot): Variante {
  const einkommen = profile.bruttoeinkommen + profile.variablesEinkommen + profile.partnerEinkommen;
  const profilEreignisse = normalizeProfileEreignisse(profile.lebensereignisse).filter((ereignis) => ereignis.typ !== 'pensionierung');

  return {
    id: 'basis',
    name: 'Basis (Profil)',
    beschreibung: 'Aus deinem Profil abgeleitete Ausgangslage',
    status: 'default',
    einkommen,
    einkommenswachstum: profile.einkommensentwicklung,
    sparrate3a: Math.min(estimatedMax3a(profile), Math.max(0, profile.saule3aGesamt > 0 ? profile.saule3aGesamt : estimatedMax3a(profile) * 0.4)),
    sparrate3b: 0,
    sparrateWertschriften: Math.max(0, Math.round((profile.bruttoeinkommen * 0.04) / 12)),
    amortisation: profile.hypothek > 0 ? 500 : 0,
    pkEinkaufJahr: 0,
    pkEinkaufBetrag: 0,
    aktienquote: profile.risikobereitschaft === 'dynamisch' ? 80 : profile.risikobereitschaft === 'konservativ' ? 30 : 55,
    risikoprofil: profile.risikobereitschaft,
    retirementAge: 65,
    kapitalbezugPkProzent: 30,
    ereignisse: [...profilEreignisse, buildPensionierungsEreignis(profile.geburtsdatum, 65)],
  };
}

function normalizeStoredVariante(raw: Partial<Variante>, profile: ProfilSnapshot, index: number): Variante {
  const basis = createBasisVariante(profile);
  const normalizedEvents = Array.isArray(raw.ereignisse)
    ? raw.ereignisse.map((ereignis, ereignisIndex) =>
        normalizeStoredEreignis({ ...ereignis, id: ereignis.id ?? `e-${index}-${ereignisIndex}` }, ereignisIndex)
      )
    : basis.ereignisse;
  const retirementAge = Number(raw.retirementAge ?? basis.retirementAge);
  const ereignisseMitPension = normalizedEvents.some((ereignis) => ereignis.typ === 'pensionierung')
    ? normalizedEvents
    : [...normalizedEvents, buildPensionierungsEreignis(profile.geburtsdatum, retirementAge)];

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
    sparrate3b: Number(raw.sparrate3b ?? basis.sparrate3b),
    sparrateWertschriften: Number(raw.sparrateWertschriften ?? basis.sparrateWertschriften),
    amortisation: Number(raw.amortisation ?? basis.amortisation),
    pkEinkaufJahr: Number(raw.pkEinkaufJahr ?? basis.pkEinkaufJahr),
    pkEinkaufBetrag: Number(raw.pkEinkaufBetrag ?? basis.pkEinkaufBetrag),
    aktienquote: Number(raw.aktienquote ?? basis.aktienquote),
    risikoprofil: raw.risikoprofil ?? basis.risikoprofil,
    retirementAge,
    kapitalbezugPkProzent: Number(raw.kapitalbezugPkProzent ?? basis.kapitalbezugPkProzent),
    ereignisse: ereignisseMitPension,
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

function baseMarginalRate(profile: ProfilSnapshot) {
  if (profile.grenzsteuersatz > 0) {
    return clamp(profile.grenzsteuersatz / 100, 0.08, 0.45);
  }

  const cantonFactor = CANTON_TAX_MULTIPLIER[profile.kanton] ?? 1;
  const householdDiscount = profile.zivilstand === 'verheiratet' ? 0.88 : profile.haushaltsmodell !== 'single' ? 0.94 : 1;
  const childrenDiscount = Math.max(0.8, 1 - profile.anzahlKinder * 0.04);
  const churchFactor = profile.kirchensteuer ? 1.03 : 1;
  const incomeFactor = clamp((profile.bruttoeinkommen + profile.variablesEinkommen + profile.partnerEinkommen) / 160000, 0.45, 1.5);

  return clamp(0.16 * cantonFactor * householdDiscount * childrenDiscount * churchFactor * incomeFactor, 0.08, 0.42);
}

function annualSocialContributions(profile: ProfilSnapshot, income: number) {
  const ahvIveo = income * (profile.anstellungsart === 'selbstaendig' ? 0.1 : 0.055);
  const alv = profile.anstellungsart === 'selbstaendig' ? 0 : income * 0.011;
  return ahvIveo + alv + profile.pkBeitragArbeitnehmer;
}

function annualHouseholdExpenses(profile: ProfilSnapshot) {
  const explicit = profile.monatlicheAusgaben * 12;
  const derived =
    (profile.wohnkostenMonat + profile.krankenkasseMonat + profile.betreuungskostenMonat + profile.sonstigeFixkostenMonat) * 12 +
    profile.anzahlKinder * 6000;

  return Math.max(explicit, derived);
}

function annualDebtAndHousingCosts(profile: ProfilSnapshot) {
  const hypoInterest = profile.hypothek * (profile.hypothekZins / 100);
  const consumerInterest = profile.konsumkredite * (profile.konsumkrediteZins / 100);
  return hypoInterest + consumerInterest + profile.liegenschaftsKostenJahr;
}

function estimateTaxToday(profile: ProfilSnapshot, variante: Variante, annualIncome: number, annualExpenses: number, pkPurchase = 0) {
  const debtInterest = annualDebtAndHousingCosts(profile);
  const childcareDeduction = profile.betreuungskostenMonat * 10;
  const effectiveRate = baseMarginalRate(profile);
  const deductible = variante.sparrate3a + pkPurchase + debtInterest + childcareDeduction;
  const taxableIncome = Math.max(0, annualIncome - deductible + profile.eigenmietwert);
  const incomeTax = taxableIncome * effectiveRate;
  const wealthBase =
    profile.liquiditaet + profile.wertschriften + profile.sonstigesVermoegen + profile.partnerVermoegen + profile.saule3bVermoegen +
    Math.max(0, profile.immobilienwert - profile.hypothek) -
    profile.konsumkredite;
  const wealthTaxRate = clamp(0.0015 * (CANTON_TAX_MULTIPLIER[profile.kanton] ?? 1), 0.0008, 0.0045);
  const wealthTax = Math.max(0, wealthBase) * wealthTaxRate;
  const social = annualSocialContributions(profile, annualIncome);
  const total = Math.max(0, incomeTax + wealthTax + social);

  return {
    total,
    incomeTax,
    wealthTax,
    social,
    effectiveRate,
    taxableIncome,
    annualExpenses,
  };
}

function estimateAHV(profile: ProfilSnapshot, annualIncome: number) {
  if (profile.ahvRenteJaehrlich > 0) {
    return profile.ahvRenteJaehrlich;
  }

  const base = clamp(annualIncome * 0.18, 16000, 35280);
  const lueckenFactor = profile.ahvLuecke === 'ja' ? 0.9 : profile.ahvLuecke === 'unbekannt' ? 0.96 : 1;
  return Math.round(base * lueckenFactor);
}

function estimatePKRente(profile: ProfilSnapshot, pkCapitalAtRetirement: number) {
  return Math.round(pkCapitalAtRetirement * (profile.pkRenteUmwandlungssatz / 100));
}

function estimateCapitalWithdrawalTax(profile: ProfilSnapshot, capital: number, numberOfBuckets: number) {
  const bucketCount = Math.max(1, numberOfBuckets);
  const stagedCapital = capital / bucketCount;
  const stageRate = clamp((0.045 + (CANTON_TAX_MULTIPLIER[profile.kanton] ?? 1) * 0.015) * (profile.zivilstand === 'verheiratet' ? 0.92 : 1), 0.025, 0.12);
  const effectiveRate = clamp(stageRate * (bucketCount > 1 ? 0.82 : 1), 0.02, 0.12);
  return Math.round(stagedCapital * bucketCount * effectiveRate);
}

function homeAffordabilityQuote(profile: ProfilSnapshot, annualIncome: number) {
  if (profile.hypothek <= 0 && profile.immobilienwert <= 0) {
    return 0;
  }

  const imputedInterest = profile.hypothek * 0.05;
  const annualCosts = imputedInterest + profile.liegenschaftsKostenJahr + Math.max(profile.immobilienwert * 0.01, 0);
  return annualIncome <= 0 ? 0 : annualCosts / annualIncome;
}

function affordabilityStatus(quote: number): VariantenAnalyse['tragbarkeitStatus'] {
  if (quote >= 0.34) return 'kritisch';
  if (quote >= 0.28) return 'angespannt';
  return 'stabil';
}

function riskHints(profile: ProfilSnapshot, annualExpenses: number) {
  const hints: string[] = [];
  const reserveTarget = Math.max(profile.notgroschenZiel, annualExpenses / 12 * (profile.einkommenssicherheit === 'volatil' ? 9 : 6));
  if (profile.liquiditaet < reserveTarget) {
    hints.push('Notreserve deckt den Haushalt noch nicht ausreichend ab.');
  }
  if (profile.invaliditaetsabsicherungJahr < annualExpenses * 0.6) {
    hints.push('Erwerbsunfähigkeitsrisiko ist nur teilweise abgesichert.');
  }
  if ((profile.partnerEinkommen > 0 || profile.anzahlKinder > 0) && profile.todesfallabsicherungJahr < annualExpenses * 0.8) {
    hints.push('Todesfallabsicherung ist für Haushalt oder Kinder knapp.');
  }
  if (profile.anstellungsart === 'selbstaendig' && profile.selbststaendigReserveMonate < 9) {
    hints.push('Für Selbständigkeit ist die Liquiditätsreserve eher kurz.');
  }
  return hints;
}

function buildPrioritisedMeasures(
  profile: ProfilSnapshot,
  variante: Variante,
  annualExpenses: number,
  monthlySurplus: number,
  affordabilityQuote: number,
  rentGap: number,
  reserveTarget: number
): VariantenAnalyse['priorisierteMassnahmen'] {
  const measures: VariantenAnalyse['priorisierteMassnahmen'] = [];

  if (profile.liquiditaet < reserveTarget) {
    measures.push({
      id: 'reserve',
      label: 'Notgroschen aufbauen',
      impact: Math.round((reserveTarget - profile.liquiditaet) / 1000),
      liquiditaetsbedarf: Math.max(0, reserveTarget - profile.liquiditaet),
      summary: 'Haushalt zuerst gegen Einkommens- und Gesundheitsrisiken stabilisieren.',
    });
  }

  if (variante.sparrate3a < estimatedMax3a(profile)) {
    measures.push({
      id: '3a',
      label: '3a erhöhen',
      impact: Math.round((estimatedMax3a(profile) - variante.sparrate3a) * baseMarginalRate(profile)),
      liquiditaetsbedarf: Math.max(0, estimatedMax3a(profile) - variante.sparrate3a),
      summary: 'Direkter Steuerhebel mit klarer Wirkung auf die Vorsorge.',
    });
  }

  if (profile.pkEinkaufspotenzial > 0 && variante.pkEinkaufBetrag <= 0 && monthlySurplus > 0) {
    measures.push({
      id: 'pk',
      label: 'PK-Einkauf prüfen',
      impact: Math.round(Math.min(profile.pkEinkaufspotenzial, monthlySurplus * 12) * baseMarginalRate(profile)),
      liquiditaetsbedarf: Math.min(profile.pkEinkaufspotenzial, monthlySurplus * 12),
      summary: 'Steuerlich attraktiv, aber nur sinnvoll bei freier Liquidität und passender Bezugsstrategie.',
    });
  }

  if (profile.hypothek > 0) {
    measures.push({
      id: 'hypo',
      label: profile.indirekteAmortisation ? 'Indirekte Amortisation schärfen' : 'Direkte Amortisation prüfen',
      impact: Math.round(profile.hypothek * (profile.hypothekZins / 100) * 0.15),
      liquiditaetsbedarf: variante.amortisation * 12,
      summary: affordabilityQuote >= 0.28 ? 'Tragbarkeit zuerst stabilisieren.' : 'Hypothek gegen Steuer- und Anlagelogik abwägen.',
    });
  }

  if (rentGap > 0) {
    measures.push({
      id: 'retirement',
      label: 'Bezugs- und Rentenplan bauen',
      impact: Math.round(rentGap / 1000),
      liquiditaetsbedarf: 0,
      summary: 'AHV, PK und 3a reichen für das Ruhestandsziel noch nicht sauber zusammen.',
    });
  }

  if (profile.partnerEinkommen > 0 || profile.haushaltsmodell !== 'single' || profile.anzahlKinder > 0) {
    measures.push({
      id: 'household',
      label: 'Haushalt und Absicherung koordinieren',
      impact: Math.round(annualExpenses * 0.05),
      liquiditaetsbedarf: 0,
      summary: 'Paar-, Kinder- und Ausfallrisiken brauchen gemeinsame Regeln statt Einzelsicht.',
    });
  }

  return measures.sort((left, right) => right.impact - left.impact).slice(0, 5);
}

export function analyseVariante(variante: Variante, profile: ProfilSnapshot): VariantenAnalyse {
  const aktuellesJahr = new Date().getFullYear();
  const startAlter = berechneAlter(profile.geburtsdatum);
  const retirementAge = clamp(variante.retirementAge || 65, Math.max(58, startAlter + 1), 70);
  const jahreBisPension = Math.max(1, retirementAge - startAlter);
  const annualIncomeNow = variante.einkommen;
  const annualExpensesNow = annualHouseholdExpenses(profile);
  const reserveTarget = Math.max(profile.notgroschenZiel, (annualExpensesNow / 12) * (profile.einkommenssicherheit === 'volatil' ? 9 : 6));
  const startvermoegen = Math.max(
    0,
    profile.liquiditaet +
      profile.wertschriften +
      profile.immobilienwert +
      profile.sonstigesVermoegen +
      profile.saule3bVermoegen +
      profile.partnerVermoegen +
      profile.pkGuthaben +
      profile.saule3aGesamt +
      profile.freizuegigkeitsguthaben -
      profile.hypothek -
      profile.konsumkredite
  );
  const rendite = variante.aktienquote / 100 * 0.06 + (1 - variante.aktienquote / 100) * 0.02;
  const vermoegensverlauf: Array<{ jahr: number; vermoegen: number }> = [];

  let vermoegen = startvermoegen;
  let freiVerfuegbaresVermoegen =
    profile.liquiditaet + profile.wertschriften + profile.sonstigesVermoegen + profile.saule3bVermoegen + profile.partnerVermoegen - profile.konsumkredite;
  let gebundenesVermoegen = profile.pkGuthaben + profile.saule3aGesamt + profile.freizuegigkeitsguthaben;
  let einkommen = annualIncomeNow;
  let pkKapital = profile.pkGuthaben + profile.freizuegigkeitsguthaben;
  let steuernTotal = 0;
  let finanzielleFreiheitAlter: number | null = null;

  for (let index = 0; index <= jahreBisPension; index += 1) {
    const jahr = aktuellesJahr + index;
    const alter = startAlter + index;
    const relevanteEreignisse = variante.ereignisse.filter((ereignis) => ereignis.jahr === jahr);

    let einkommensFaktor = 1;
    let zusatzkosten = 0;
    let einmalEffekt = 0;
    let zusatzHypothek = 0;

    for (const ereignis of relevanteEreignisse) {
      if (ereignis.typ === 'kind') {
        zusatzkosten += 12000;
      }
      if (ereignis.typ === 'teilzeit') {
        einkommensFaktor *= Math.max(0.2, Math.min(1, (ereignis.details?.teilzeitPensum ?? 80) / 100));
      }
      if (ereignis.typ === 'sabbatical') {
        const monate = Math.max(1, Math.min(24, ereignis.details?.sabbaticalMonate ?? 6));
        einkommensFaktor *= Math.max(0, 1 - monate / 12);
        zusatzkosten += monate * (profile.monatlicheAusgaben * 0.75);
      }
      if (ereignis.typ === 'wohneigentum') {
        const eigenmittel = ereignis.details?.eigenmittel ?? (ereignis.details?.kaufpreis ? ereignis.details.kaufpreis * 0.2 : 60000);
        einmalEffekt -= eigenmittel;
        zusatzHypothek += ereignis.details?.hypothek ?? (ereignis.details?.kaufpreis ? ereignis.details.kaufpreis - eigenmittel : 0);
      }
    }

    const effektivesEinkommen = einkommen * einkommensFaktor;
    const annualExpenses = annualExpensesNow + zusatzkosten;
    const pkPurchase = variante.pkEinkaufJahr === jahr ? Math.min(profile.pkEinkaufspotenzial, variante.pkEinkaufBetrag) : 0;
    const taxes = estimateTaxToday(profile, variante, effektivesEinkommen, annualExpenses, pkPurchase);
    const housingDebtCosts = annualDebtAndHousingCosts({ ...profile, hypothek: profile.hypothek + zusatzHypothek });
    const savings =
      variante.sparrate3a +
      variante.sparrate3b +
      variante.sparrateWertschriften * 12 +
      variante.amortisation * 12 +
      pkPurchase;
    const netCashflow = effektivesEinkommen - taxes.total - annualExpenses - housingDebtCosts - savings;

    steuernTotal += taxes.total;
    freiVerfuegbaresVermoegen = Math.max(0, freiVerfuegbaresVermoegen * (1 + rendite * 0.75) + Math.max(-50000, netCashflow) + einmalEffekt);
    gebundenesVermoegen = Math.max(0, gebundenesVermoegen * (1 + 0.02) + variante.sparrate3a + pkPurchase);
    pkKapital = Math.max(0, pkKapital * 1.02 + profile.pkBeitragArbeitnehmer + profile.pkBeitragArbeitgeber + pkPurchase);
    vermoegen = Math.max(0, freiVerfuegbaresVermoegen + gebundenesVermoegen + profile.immobilienwert - (profile.hypothek + zusatzHypothek));

    if (finanzielleFreiheitAlter === null) {
      const targetPortfolio = Math.max(profile.gewuenschteJahresausgabenRuhestand * 25, annualExpenses * 22, 600000);
      if (freiVerfuegbaresVermoegen + profile.saule3bVermoegen >= targetPortfolio) {
        finanzielleFreiheitAlter = alter;
      }
    }

    vermoegensverlauf.push({
      jahr,
      vermoegen: Math.round(vermoegen),
    });

    einkommen *= 1 + variante.einkommenswachstum / 100;
  }

  const ahvPrognose = estimateAHV(profile, annualIncomeNow);
  const pkKapitalZumPensionierungszeitpunkt = Math.round(pkKapital);
  const pkPrognoseRente = estimatePKRente(profile, pkKapitalZumPensionierungszeitpunkt * (1 - variante.kapitalbezugPkProzent / 100));
  const kapitalbezugPk = pkKapitalZumPensionierungszeitpunkt * (variante.kapitalbezugPkProzent / 100);
  const vorsorge3aBisPension = profile.saule3aGesamt + jahreBisPension * variante.sparrate3a;
  const steuerBeiKapitalbezug = estimateCapitalWithdrawalTax(profile, kapitalbezugPk + vorsorge3aBisPension, profile.saule3aKonten.length);
  const nettoRenteAbPension = ahvPrognose + pkPrognoseRente + Math.round((kapitalbezugPk + vorsorge3aBisPension - steuerBeiKapitalbezug) * 0.04);
  const rentenlueckeAbPension = Math.max(0, profile.gewuenschteJahresausgabenRuhestand - nettoRenteAbPension);
  const steuerHeuteData = estimateTaxToday(profile, variante, annualIncomeNow, annualExpensesNow);
  const monatlicherUeberschussHeute = Math.round((annualIncomeNow - steuerHeuteData.total - annualExpensesNow - annualDebtAndHousingCosts(profile)) / 12);
  const freiesInvestierbaresVermoegen = Math.round(freiVerfuegbaresVermoegen);
  const tragbarkeitQuote = homeAffordabilityQuote(profile, annualIncomeNow);
  const risikoHinweise = riskHints(profile, annualExpensesNow);
  const risikoScore = clamp(100 - risikoHinweise.length * 18 - (profile.einkommenssicherheit === 'volatil' ? 10 : 0), 25, 95);
  const umsetzungsScore = clamp(
    100 -
      (monatlicherUeberschussHeute < 0 ? 35 : monatlicherUeberschussHeute < 1000 ? 15 : 0) -
      (tragbarkeitQuote >= 0.34 ? 20 : tragbarkeitQuote >= 0.28 ? 10 : 0) -
      (rentenlueckeAbPension > 0 ? 15 : 0),
    20,
    95
  );

  return {
    endvermoegen: Math.round(vermoegen),
    finanzielleFreiheitAlter,
    sparquote: Math.round(((variante.sparrate3a + variante.sparrate3b + variante.sparrateWertschriften * 12 + variante.amortisation * 12) / Math.max(variante.einkommen, 1)) * 100),
    steuernTotal: Math.round(steuernTotal),
    erwarteteRendite: rendite * 100,
    gesamtesSparvolumen30Jahre: Math.round((variante.sparrate3a + variante.sparrate3b + variante.sparrateWertschriften * 12 + variante.amortisation * 12) * 30),
    vermoegensverlauf,
    monatlicherUeberschussHeute,
    freiesInvestierbaresVermoegen,
    tragbarkeitQuote,
    tragbarkeitStatus: affordabilityStatus(tragbarkeitQuote),
    nettoRenteAbPension,
    rentenlueckeAbPension,
    fruehpensionierungMachbar: (finanzielleFreiheitAlter ?? 999) <= profile.fruehpensionierungsAlter && rentenlueckeAbPension < profile.gewuenschteJahresausgabenRuhestand * 0.2,
    steuerHeute: Math.round(steuerHeuteData.incomeTax + steuerHeuteData.social),
    vermoegenssteuerHeute: Math.round(steuerHeuteData.wealthTax),
    steuerBeiKapitalbezug,
    ahvPrognose,
    pkPrognoseRente,
    pkKapitalZumPensionierungszeitpunkt,
    '3aStaffelungEmpfohlen': profile.saule3aKonten.length < 3 && vorsorge3aBisPension > 50000,
    risikoScore,
    risikoHinweise,
    umsetzungsScore,
    priorisierteMassnahmen: buildPrioritisedMeasures(
      profile,
      variante,
      annualExpensesNow,
      monatlicherUeberschussHeute,
      tragbarkeitQuote,
      rentenlueckeAbPension,
      reserveTarget
    ),
  };
}
