import React, { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/card';
import { SliderInput } from '../components/slider-input';
import { Select } from '../components/select';
import { FileUpload, ExtractedDataChip } from '../components/upload';
import { InfoTooltip } from '../components/info-tooltip';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion';
import { Progress } from '../components/ui/progress';
import { supabase } from '../../lib/supabase';
import { extractSwissTaxDocumentText } from '../../lib/tax-document';
import { 
  User, Wallet, PiggyBank, Shield, TrendingUp, Building2, FileText, Target,
  CheckCircle2, Circle, ChevronRight, AlertCircle 
} from 'lucide-react';

// ============================================
// CONSTANTS & OPTIONS
// ============================================

interface ExtractedTaxField {
  fieldKey: keyof ProfileState;
  label: string;
  value: string;
  confidence: 'high' | 'medium' | 'low';
  status: 'pending' | 'accepted' | 'rejected';
}

type TaxUploadStatus = 'idle' | 'processing' | 'success' | 'empty' | 'error';
type TaxExtractionMode = 'pdf-text' | 'ocr' | 'empty' | null;

const KANTONE = [
  { value: 'ag', label: 'Aargau' },
  { value: 'ai', label: 'Appenzell Innerrhoden' },
  { value: 'ar', label: 'Appenzell Ausserrhoden' },
  { value: 'be', label: 'Bern' },
  { value: 'bl', label: 'Basel-Landschaft' },
  { value: 'bs', label: 'Basel-Stadt' },
  { value: 'fr', label: 'Freiburg' },
  { value: 'ge', label: 'Genf' },
  { value: 'gl', label: 'Glarus' },
  { value: 'gr', label: 'Graubünden' },
  { value: 'ju', label: 'Jura' },
  { value: 'lu', label: 'Luzern' },
  { value: 'ne', label: 'Neuenburg' },
  { value: 'nw', label: 'Nidwalden' },
  { value: 'ow', label: 'Obwalden' },
  { value: 'sg', label: 'St. Gallen' },
  { value: 'sh', label: 'Schaffhausen' },
  { value: 'so', label: 'Solothurn' },
  { value: 'sz', label: 'Schwyz' },
  { value: 'tg', label: 'Thurgau' },
  { value: 'ti', label: 'Tessin' },
  { value: 'ur', label: 'Uri' },
  { value: 'vd', label: 'Waadt' },
  { value: 'vs', label: 'Wallis' },
  { value: 'zg', label: 'Zug' },
  { value: 'zh', label: 'Zürich' },
];

const ZIVILSTAND_OPTIONS = [
  { value: 'ledig', label: 'Ledig' },
  { value: 'verheiratet', label: 'Verheiratet' },
  { value: 'geschieden', label: 'Geschieden' },
  { value: 'verwitwet', label: 'Verwitwet' },
];

const ANSTELLUNGSART_OPTIONS = [
  { value: 'angestellt', label: 'Angestellt' },
  { value: 'selbstaendig', label: 'Selbstständig' },
  { value: 'gemischt', label: 'Gemischt' },
];

const RISIKO_OPTIONS = [
  { value: 'konservativ', label: 'Konservativ' },
  { value: 'ausgewogen', label: 'Ausgewogen' },
  { value: 'dynamisch', label: 'Dynamisch' },
];

const ANLAGEHORIZONT_OPTIONS = [
  { value: 'kurz', label: '< 3 Jahre' },
  { value: 'mittel', label: '3-10 Jahre' },
  { value: 'lang', label: '> 10 Jahre' },
];

const VERLUSTTOLERANZ_OPTIONS = [
  { value: 'niedrig', label: 'Niedrig (verkaufen)' },
  { value: 'mittel', label: 'Mittel (abwarten)' },
  { value: 'hoch', label: 'Hoch (nachkaufen)' },
];

const ESG_OPTIONS = [
  { value: 'wichtig', label: 'Sehr wichtig' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'egal', label: 'Nicht relevant' },
];

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

const DEFAULT_PROFILE_STATE = {
  profilMode: 'simple' as 'simple' | 'erweitert',
  simpleStep: 1,
  sectionStatus: DEFAULT_SECTION_STATUS,
  vorname: '',
  nachname: '',
  geburtsdatum: '',
  zivilstand: 'ledig',
  kanton: 'zh',
  staatsangehoerigkeit: 'CH',
  anzahlKinder: 0,
  anstellungsart: 'angestellt',
  bruttoeinkommen: 80000,
  variablesEinkommen: 0,
  einkommensentwicklung: 2,
  liquiditaet: 50000,
  wertschriften: 80000,
  immobilienwert: 0,
  sonstigesVermoegen: 0,
  hypothek: 0,
  hypothekZins: 1.5,
  konsumkredite: 0,
  konsumkrediteZins: 5.0,
  ahvLuecke: 'unbekannt' as 'ja' | 'nein' | 'unbekannt',
  pkGuthaben: 120000,
  pkEinkaufspotenzial: 0,
  saule3aGesamt: 35000,
  saule3aKonten: [35000] as number[],
  mehrere3a: false,
  kirchensteuer: false,
  grenzsteuersatz: 0,
  steuererklaerungUploaded: false,
  steuererklaerungDaten: [] as ExtractedTaxField[],
  steuererklaerungProfilVorschlag: null as Partial<ProfileState> | null,
  risikobereitschaft: 'ausgewogen',
  anlagehorizont: 'lang',
  verlusttoleranz: 'mittel',
  esgPraeferenz: 'neutral',
  ausschluesse: [] as string[],
  wunschalterFreiheit: 60,
  notgroschenZiel: 15000,
  kurzfristigeZiele: '',
};

const TAX_READER_URL = import.meta.env.VITE_TAX_READER_URL?.trim();

type ProfileState = typeof DEFAULT_PROFILE_STATE;

function parseSwissNumber(value: string) {
  const normalized = value
    .replace(/CHF/gi, '')
    .replace(/[’']/g, '')
    .replace(/\s+/g, '')
    .replace(/,(?=\d{1,2}$)/g, '.')
    .replace(/,/g, '');

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatCurrency(value: number) {
  return `${value.toLocaleString('de-CH')} CHF`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function pushExtractedField(
  fields: ExtractedTaxField[],
  fieldKey: keyof ProfileState,
  label: string,
  value: string,
  confidence: 'high' | 'medium' | 'low' = 'medium'
) {
  if (!fields.some((entry) => entry.fieldKey === fieldKey && entry.value === value)) {
    fields.push({ fieldKey, label, value, confidence, status: 'pending' });
  }
}

function findContextualMatch(text: string, expressions: RegExp[]) {
  for (const expression of expressions) {
    const match = text.match(expression);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return null;
}

function findFirstKeywordIndex(text: string, keywords: string[]) {
  return keywords.reduce<number>((bestIndex, keyword) => {
    const index = text.indexOf(keyword);
    if (index === -1) {
      return bestIndex;
    }

    return bestIndex === -1 ? index : Math.min(bestIndex, index);
  }, -1);
}

function detectSwissCanton(text: string) {
  const contextualPatterns = [
    /(?:wohnkanton|kanton des wohnsitzes|steuerdomizil|steuerkanton|veranlagungskanton|wohnsitzkanton)\s*[:\-]?\s*([A-Za-zÄÖÜäöü.\- ]{2,40})/i,
    /(?:wohnort|wohnsitz|domizil)\s*[:\-]?\s*[A-Za-zÄÖÜäöü.\- ]+,\s*([A-Za-zÄÖÜäöü.\- ]{2,40})/i,
    /kanton\s+([A-Za-zÄÖÜäöü.\- ]{2,40})/i,
  ];

  const contextualCandidate = findContextualMatch(text, contextualPatterns)?.toLowerCase() ?? null;

  if (contextualCandidate) {
    const directMatch = KANTONE.find((entry) => {
      const label = entry.label.toLowerCase();
      return contextualCandidate === label || contextualCandidate.includes(label);
    });

    if (directMatch) {
      return directMatch;
    }
  }

  const rankedMatches = KANTONE
    .map((entry) => {
      const label = entry.label.toLowerCase();
      const pattern = new RegExp(`\\b${escapeRegExp(label)}\\b`, 'i');
      if (!pattern.test(text)) {
        return null;
      }

      const keywordIndex = findFirstKeywordIndex(text, [
        `wohnkanton ${label}`,
        `kanton ${label}`,
        `steuerdomizil ${label}`,
        `wohnsitzkanton ${label}`,
      ]);

      return {
        entry,
        score: keywordIndex !== -1 ? 0 : label === 'uri' ? 10 : 5,
      };
    })
    .filter((value): value is { entry: (typeof KANTONE)[number]; score: number } => value !== null)
    .sort((a, b) => a.score - b.score);

  return rankedMatches[0]?.entry ?? null;
}

function buildPillar3aAccounts(profile: Partial<ProfileState> | null | undefined) {
  const storedAccounts = Array.isArray(profile?.saule3aKonten)
    ? profile.saule3aKonten
        .map((entry) => Number(entry))
        .filter((entry) => Number.isFinite(entry) && entry >= 0)
    : [];

  if (storedAccounts.length > 0) {
    return storedAccounts;
  }

  const fallbackTotal = Number(profile?.saule3aGesamt ?? DEFAULT_PROFILE_STATE.saule3aGesamt);
  return [Number.isFinite(fallbackTotal) ? Math.max(0, fallbackTotal) : 0];
}

function findAmount(text: string, expressions: RegExp[]) {
  for (const expression of expressions) {
    const match = text.match(expression);
    const parsed = match?.[1] ? parseSwissNumber(match[1]) : null;

    if (parsed !== null) {
      return parsed;
    }
  }

  return null;
}

function findLabeledAmount(text: string, labels: string[]) {
  const escapedLabels = labels.map((label) => escapeRegExp(label));
  return findAmount(text, [
    new RegExp(`(?:${escapedLabels.join('|')})\\D{0,40}([\\d'.,\\s]+)\\s*CHF`, 'i'),
    new RegExp(`(?:${escapedLabels.join('|')})\\D{0,40}([\\d'.,\\s]+)`, 'i'),
  ]);
}

function getAmountConfidence(
  fieldKey: keyof ProfileState,
  value: number
): { allowed: boolean; confidence: 'high' | 'medium' | 'low' } {
  if (!Number.isFinite(value)) {
    return { allowed: false, confidence: 'low' };
  }

  switch (fieldKey) {
    case 'anzahlKinder':
      if (value < 0 || value > 10) return { allowed: false, confidence: 'low' };
      return { allowed: true, confidence: value <= 4 ? 'high' : 'medium' };
    case 'bruttoeinkommen':
      if (value < 10000 || value > 2000000) return { allowed: false, confidence: 'low' };
      return { allowed: true, confidence: value >= 30000 ? 'high' : 'medium' };
    case 'variablesEinkommen':
      if (value < 500 || value > 1000000) return { allowed: false, confidence: 'low' };
      return { allowed: true, confidence: 'medium' };
    case 'liquiditaet':
      if (value < 500 || value > 20000000) return { allowed: false, confidence: 'low' };
      return { allowed: true, confidence: value >= 5000 ? 'high' : 'medium' };
    case 'wertschriften':
      if (value < 500 || value > 50000000) return { allowed: false, confidence: 'low' };
      return { allowed: true, confidence: 'medium' };
    case 'immobilienwert':
      if (value < 50000 || value > 50000000) return { allowed: false, confidence: 'low' };
      return { allowed: true, confidence: 'high' };
    case 'sonstigesVermoegen':
      if (value < 500 || value > 50000000) return { allowed: false, confidence: 'low' };
      return { allowed: true, confidence: 'medium' };
    case 'hypothek':
      if (value < 10000 || value > 50000000) return { allowed: false, confidence: 'low' };
      return { allowed: true, confidence: 'high' };
    case 'pkGuthaben':
      if (value < 1000 || value > 10000000) return { allowed: false, confidence: 'low' };
      return { allowed: true, confidence: 'medium' };
    case 'saule3aGesamt':
      if (value < 500 || value > 2000000) return { allowed: false, confidence: 'low' };
      return { allowed: true, confidence: 'medium' };
    case 'grenzsteuersatz':
      if (value <= 0 || value > 50) return { allowed: false, confidence: 'low' };
      return { allowed: true, confidence: 'medium' };
    default:
      return { allowed: true, confidence: 'medium' };
  }
}

function applyExtractedTaxProfile(profile: Partial<ProfileState>, setters: {
  setKanton: (value: ProfileState['kanton']) => void;
  setZivilstand: (value: ProfileState['zivilstand']) => void;
  setAnzahlKinder: (value: number) => void;
  setKirchensteuer: (value: boolean) => void;
  setBruttoeinkommen: (value: number) => void;
  setVariablesEinkommen: (value: number) => void;
  setLiquiditaet: (value: number) => void;
  setWertschriften: (value: number) => void;
  setImmobilienwert: (value: number) => void;
  setSonstigesVermoegen: (value: number) => void;
  setHypothek: (value: number) => void;
  setPkGuthaben: (value: number) => void;
  setSaule3aGesamt: (value: number) => void;
  setSaule3aKonten: (value: number[]) => void;
  setGrenzsteuersatz: (value: number) => void;
}) {
  if (profile.kanton) {
    setters.setKanton(profile.kanton);
  }
  if (profile.zivilstand) {
    setters.setZivilstand(profile.zivilstand);
  }
  if (typeof profile.anzahlKinder === 'number') {
    setters.setAnzahlKinder(profile.anzahlKinder);
  }
  if (typeof profile.kirchensteuer === 'boolean') {
    setters.setKirchensteuer(profile.kirchensteuer);
  }
  if (typeof profile.bruttoeinkommen === 'number') {
    setters.setBruttoeinkommen(profile.bruttoeinkommen);
  }
  if (typeof profile.variablesEinkommen === 'number') {
    setters.setVariablesEinkommen(profile.variablesEinkommen);
  }
  if (typeof profile.liquiditaet === 'number') {
    setters.setLiquiditaet(profile.liquiditaet);
  }
  if (typeof profile.wertschriften === 'number') {
    setters.setWertschriften(profile.wertschriften);
  }
  if (typeof profile.immobilienwert === 'number') {
    setters.setImmobilienwert(profile.immobilienwert);
  }
  if (typeof profile.sonstigesVermoegen === 'number') {
    setters.setSonstigesVermoegen(profile.sonstigesVermoegen);
  }
  if (typeof profile.hypothek === 'number') {
    setters.setHypothek(profile.hypothek);
  }
  if (typeof profile.pkGuthaben === 'number') {
    setters.setPkGuthaben(profile.pkGuthaben);
  }
  if (typeof profile.saule3aGesamt === 'number') {
    setters.setSaule3aGesamt(profile.saule3aGesamt);
    setters.setSaule3aKonten([profile.saule3aGesamt]);
  }
  if (typeof profile.grenzsteuersatz === 'number') {
    setters.setGrenzsteuersatz(profile.grenzsteuersatz);
  }
}

function extractTaxProfileData(text: string): { profile: Partial<ProfileState>; fields: ExtractedTaxField[] } {
  const normalizedText = text.replace(/\0/g, ' ').replace(/\s+/g, ' ').trim();
  const lowerText = normalizedText.toLowerCase();
  const profile: Partial<ProfileState> = {};
  const fields: ExtractedTaxField[] = [];

  const canton = detectSwissCanton(lowerText);
  if (canton) {
    profile.kanton = canton.value;
    pushExtractedField(fields, 'kanton', 'Wohnkanton', canton.label, 'high');
  }

  const zivilstandMap: Array<{ value: ProfileState['zivilstand']; keywords: string[]; label: string }> = [
    { value: 'verheiratet', keywords: ['verheiratet'], label: 'Verheiratet' },
    { value: 'geschieden', keywords: ['geschieden'], label: 'Geschieden' },
    { value: 'verwitwet', keywords: ['verwitwet'], label: 'Verwitwet' },
    { value: 'ledig', keywords: ['ledig'], label: 'Ledig' },
  ];

  const detectedZivilstand = zivilstandMap.find((entry) => entry.keywords.some((keyword) => lowerText.includes(keyword)));
  if (detectedZivilstand) {
    profile.zivilstand = detectedZivilstand.value;
    pushExtractedField(fields, 'zivilstand', 'Zivilstand', detectedZivilstand.label, 'high');
  }

  const childrenMatch = normalizedText.match(/(?:anzahl kinder|kinder)\D{0,20}(\d{1,2})/i);
  if (childrenMatch?.[1]) {
    const children = Number(childrenMatch[1]);
    const validation = getAmountConfidence('anzahlKinder', children);

    if (validation.allowed) {
      profile.anzahlKinder = children;
      pushExtractedField(fields, 'anzahlKinder', 'Kinder', childrenMatch[1], validation.confidence);
    }
  }

  if (/(?:nicht kirchensteuerpflichtig|ohne kirchensteuer|keine kirchensteuer)/i.test(normalizedText)) {
    profile.kirchensteuer = false;
    pushExtractedField(fields, 'kirchensteuer', 'Kirchensteuer', 'Nein', 'high');
  } else if (/kirchensteuer/i.test(normalizedText)) {
    profile.kirchensteuer = true;
    pushExtractedField(fields, 'kirchensteuer', 'Kirchensteuer', 'Ja', 'medium');
  }

  const bruttoeinkommen = findLabeledAmount(normalizedText, [
    'bruttolohn',
    'jahreslohn',
    'bruttoeinkommen',
    'einkünfte aus unselbständiger erwerbstätigkeit',
    'nettolohn gemäss lohnausweis',
  ]);
  if (bruttoeinkommen !== null) {
    const validation = getAmountConfidence('bruttoeinkommen', bruttoeinkommen);
    if (validation.allowed) {
      profile.bruttoeinkommen = bruttoeinkommen;
      pushExtractedField(fields, 'bruttoeinkommen', 'Bruttoeinkommen', formatCurrency(bruttoeinkommen), validation.confidence);
    }
  }

  const variablesEinkommen = findLabeledAmount(normalizedText, [
    'bonus',
    'gratifikation',
    'provisionen',
    'nebeneinkünfte',
  ]);
  if (variablesEinkommen !== null) {
    const validation = getAmountConfidence('variablesEinkommen', variablesEinkommen);
    if (validation.allowed) {
      profile.variablesEinkommen = variablesEinkommen;
      pushExtractedField(fields, 'variablesEinkommen', 'Variables Einkommen', formatCurrency(variablesEinkommen), validation.confidence);
    }
  }

  const liquiditaet = findLabeledAmount(normalizedText, [
    'bankguthaben',
    'kontoguthaben',
    'flüssige mittel',
    'liquidität',
    'guthaben bei banken',
  ]);
  if (liquiditaet !== null) {
    const validation = getAmountConfidence('liquiditaet', liquiditaet);
    if (validation.allowed) {
      profile.liquiditaet = liquiditaet;
      pushExtractedField(fields, 'liquiditaet', 'Liquidität', formatCurrency(liquiditaet), validation.confidence);
    }
  }

  const wertschriften = findLabeledAmount(normalizedText, [
    'wertschriften',
    'depotwert',
    'schriftliche guthaben',
    'vermögensertrag wertschriften',
  ]);
  if (wertschriften !== null) {
    const validation = getAmountConfidence('wertschriften', wertschriften);
    if (validation.allowed) {
      profile.wertschriften = wertschriften;
      pushExtractedField(fields, 'wertschriften', 'Wertschriften', formatCurrency(wertschriften), validation.confidence);
    }
  }

  const immobilienwert = findLabeledAmount(normalizedText, [
    'steuerwert der liegenschaft',
    'steuerwert liegenschaft',
    'amtlicher wert',
    'immobilienwert',
    'liegenschaft',
  ]);
  if (immobilienwert !== null) {
    const validation = getAmountConfidence('immobilienwert', immobilienwert);
    if (validation.allowed) {
      profile.immobilienwert = immobilienwert;
      pushExtractedField(fields, 'immobilienwert', 'Immobilienwert', formatCurrency(immobilienwert), validation.confidence);
    }
  }

  const sonstigesVermoegen = findLabeledAmount(normalizedText, [
    'übriges vermögen',
    'sonstiges vermögen',
    'übrige vermögenswerte',
  ]);
  if (sonstigesVermoegen !== null) {
    const validation = getAmountConfidence('sonstigesVermoegen', sonstigesVermoegen);
    if (validation.allowed) {
      profile.sonstigesVermoegen = sonstigesVermoegen;
      pushExtractedField(fields, 'sonstigesVermoegen', 'Sonstiges Vermögen', formatCurrency(sonstigesVermoegen), validation.confidence);
    }
  }

  const hypothek = findLabeledAmount(normalizedText, [
    'hypothekarschulden',
    'hypothek',
    'hypotheken',
    'grundpfandschulden',
  ]);
  if (hypothek !== null) {
    const validation = getAmountConfidence('hypothek', hypothek);
    if (validation.allowed) {
      profile.hypothek = hypothek;
      pushExtractedField(fields, 'hypothek', 'Hypothek', formatCurrency(hypothek), validation.confidence);
    }
  }

  const pkGuthaben = findLabeledAmount(normalizedText, [
    'pensionskassenguthaben',
    'guthaben berufliche vorsorge',
    'freizügigkeitsguthaben',
    '2. säule',
  ]);
  if (pkGuthaben !== null) {
    const validation = getAmountConfidence('pkGuthaben', pkGuthaben);
    if (validation.allowed) {
      profile.pkGuthaben = pkGuthaben;
      pushExtractedField(fields, 'pkGuthaben', 'Pensionskasse', formatCurrency(pkGuthaben), validation.confidence);
    }
  }

  const saule3aGesamt = findLabeledAmount(normalizedText, [
    'säule 3a',
    '3a-guthaben',
    'gebundene vorsorge',
    'vorsorgekonto 3a',
  ]);
  if (saule3aGesamt !== null) {
    const validation = getAmountConfidence('saule3aGesamt', saule3aGesamt);
    if (validation.allowed) {
      profile.saule3aGesamt = saule3aGesamt;
      pushExtractedField(fields, 'saule3aGesamt', 'Säule 3a', formatCurrency(saule3aGesamt), validation.confidence);
    }
  }

  const grenzsteuersatz = findAmount(normalizedText, [
    /(?:grenzsteuersatz|marginaler steuersatz)\D{0,20}(\d{1,2}(?:[.,]\d{1,2})?)\s*%/i,
    /(?:steuersatz)\D{0,20}(\d{1,2}(?:[.,]\d{1,2})?)\s*%/i,
  ]);
  if (grenzsteuersatz !== null) {
    const validation = getAmountConfidence('grenzsteuersatz', grenzsteuersatz);
    if (validation.allowed) {
      profile.grenzsteuersatz = grenzsteuersatz;
      pushExtractedField(fields, 'grenzsteuersatz', 'Steuersatz', `${grenzsteuersatz.toLocaleString('de-CH')} %`, validation.confidence);
    }
  }

  return { profile, fields };
}

async function extractTaxDataFromCloudRun(file: File): Promise<{
  profile: Partial<ProfileState>;
  fields: ExtractedTaxField[];
  mode: TaxExtractionMode;
}> {
  if (!TAX_READER_URL) {
    throw new Error('Cloud Run tax reader is not configured.');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${TAX_READER_URL.replace(/\/$/, '')}/extract-tax`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Cloud Run extraction failed with status ${response.status}.`);
  }

  const data = await response.json();

  return {
    profile: data.profile ?? {},
    fields: Array.isArray(data.fields) ? data.fields : [],
    mode: data.mode ?? 'empty',
  };
}

function getProfileStorageKey(userId?: string) {
  return `finplan.profil.${userId ?? 'guest'}`;
}

function loadStoredProfile(userId?: string) {
  if (typeof window === 'undefined') {
    return DEFAULT_PROFILE_STATE;
  }

  try {
    const raw = window.localStorage.getItem(getProfileStorageKey(userId));

    if (!raw) {
      return DEFAULT_PROFILE_STATE;
    }

    const parsed = JSON.parse(raw);

    return {
      ...DEFAULT_PROFILE_STATE,
      ...parsed,
      sectionStatus: {
        ...DEFAULT_SECTION_STATUS,
        ...(parsed.sectionStatus ?? {}),
      },
      saule3aKonten: buildPillar3aAccounts(parsed),
      ausschluesse: Array.isArray(parsed.ausschluesse) ? parsed.ausschluesse : [],
      steuererklaerungDaten: Array.isArray(parsed.steuererklaerungDaten) ? parsed.steuererklaerungDaten : [],
      steuererklaerungProfilVorschlag:
        parsed.steuererklaerungProfilVorschlag && typeof parsed.steuererklaerungProfilVorschlag === 'object'
          ? parsed.steuererklaerungProfilVorschlag
          : null,
    };
  } catch (error) {
    console.error('Fehler beim Laden des gespeicherten Profils:', error);
    return DEFAULT_PROFILE_STATE;
  }
}

function normalizeProfileState(profile: Partial<ProfileState> | null | undefined): ProfileState {
  return {
    ...DEFAULT_PROFILE_STATE,
    ...(profile ?? {}),
    sectionStatus: {
      ...DEFAULT_SECTION_STATUS,
      ...((profile?.sectionStatus as Record<string, 'complete' | 'incomplete' | 'skipped'> | undefined) ?? {}),
    },
    saule3aKonten: buildPillar3aAccounts(profile),
    ausschluesse: Array.isArray(profile?.ausschluesse) ? profile.ausschluesse : [],
    steuererklaerungDaten: Array.isArray(profile?.steuererklaerungDaten) ? profile.steuererklaerungDaten : [],
    steuererklaerungProfilVorschlag:
      profile?.steuererklaerungProfilVorschlag && typeof profile.steuererklaerungProfilVorschlag === 'object'
        ? profile.steuererklaerungProfilVorschlag
        : null,
  };
}

// ============================================
// MAIN COMPONENT
// ============================================

export function Profil({ isLoggedIn, userId }: { isLoggedIn: boolean; userId?: string }) {
  const initialProfile = useRef(loadStoredProfile(userId)).current;
  const isHydratingProfile = useRef(false);
  const hasLoadedRemoteProfile = useRef(false);
  // ============================================
  // PROFIL MODE
  // ============================================
  const [profilMode, setProfilMode] = useState<'simple' | 'erweitert'>(initialProfile.profilMode);

  // ============================================
  // SIMPLE PROFIL - STEP TRACKING
  // ============================================
  const [simpleStep, setSimpleStep] = useState(initialProfile.simpleStep);
  const totalSimpleSteps = 5;

  // ============================================
  // SECTION COMPLETION TRACKING (ERWEITERT)
  // ============================================
  const [sectionStatus, setSectionStatus] = useState<Record<string, 'complete' | 'incomplete' | 'skipped'>>(initialProfile.sectionStatus);

  // ============================================
  // DATA - SECTION 1: BASIS
  // ============================================
  const [vorname, setVorname] = useState(initialProfile.vorname);
  const [nachname, setNachname] = useState(initialProfile.nachname);
  const [geburtsdatum, setGeburtsdatum] = useState(initialProfile.geburtsdatum);
  const [zivilstand, setZivilstand] = useState(initialProfile.zivilstand);
  const [kanton, setKanton] = useState(initialProfile.kanton);
  const [staatsangehoerigkeit, setStaatsangehoerigkeit] = useState(initialProfile.staatsangehoerigkeit);
  const [anzahlKinder, setAnzahlKinder] = useState(initialProfile.anzahlKinder);

  // ============================================
  // DATA - SECTION 2: EINKOMMEN
  // ============================================
  const [anstellungsart, setAnstellungsart] = useState(initialProfile.anstellungsart);
  const [bruttoeinkommen, setBruttoeinkommen] = useState(initialProfile.bruttoeinkommen);
  const [variablesEinkommen, setVariablesEinkommen] = useState(initialProfile.variablesEinkommen);
  const [einkommensentwicklung, setEinkommensentwicklung] = useState(initialProfile.einkommensentwicklung); // % jährlich

  // ============================================
  // DATA - SECTION 3: VERMÖGEN
  // ============================================
  const [liquiditaet, setLiquiditaet] = useState(initialProfile.liquiditaet);
  const [wertschriften, setWertschriften] = useState(initialProfile.wertschriften);
  const [immobilienwert, setImmobilienwert] = useState(initialProfile.immobilienwert);
  const [sonstigesVermoegen, setSonstigesVermoegen] = useState(initialProfile.sonstigesVermoegen);

  // ============================================
  // DATA - SECTION 4: SCHULDEN
  // ============================================
  const [hypothek, setHypothek] = useState(initialProfile.hypothek);
  const [hypothekZins, setHypothekZins] = useState(initialProfile.hypothekZins);
  const [konsumkredite, setKonsumkredite] = useState(initialProfile.konsumkredite);
  const [konsumkrediteZins, setKonsumkrediteZins] = useState(initialProfile.konsumkrediteZins);

  // ============================================
  // DATA - SECTION 5: VORSORGE
  // ============================================
  const [ahvLuecke, setAhvLuecke] = useState<'ja' | 'nein' | 'unbekannt'>(initialProfile.ahvLuecke);
  const [pkGuthaben, setPkGuthaben] = useState(initialProfile.pkGuthaben);
  const [pkEinkaufspotenzial, setPkEinkaufspotenzial] = useState(initialProfile.pkEinkaufspotenzial);
  const [saule3aGesamt, setSaule3aGesamt] = useState(initialProfile.saule3aGesamt);
  const [saule3aKonten, setSaule3aKonten] = useState<number[]>(initialProfile.saule3aKonten);
  const [mehrere3a, setMehrere3a] = useState(initialProfile.mehrere3a);

  // ============================================
  // DATA - SECTION 6: STEUERN
  // ============================================
  const [kirchensteuer, setKirchensteuer] = useState(initialProfile.kirchensteuer);
  const [grenzsteuersatz, setGrenzsteuersatz] = useState(initialProfile.grenzsteuersatz);
  const [steuererklaerungUploaded, setSteuererklaerungUploaded] = useState(initialProfile.steuererklaerungUploaded);
  const [steuererklaerungDaten, setSteuererklaerungDaten] = useState<ExtractedTaxField[]>(initialProfile.steuererklaerungDaten);
  const [steuererklaerungProfilVorschlag, setSteuererklaerungProfilVorschlag] = useState<Partial<ProfileState> | null>(
    initialProfile.steuererklaerungProfilVorschlag
  );
  const [taxExtractionMode, setTaxExtractionMode] = useState<TaxExtractionMode>(null);
  const [taxUploadStatus, setTaxUploadStatus] = useState<TaxUploadStatus>(
    initialProfile.steuererklaerungUploaded
      ? initialProfile.steuererklaerungDaten.length > 0
        ? 'success'
        : 'empty'
      : 'idle'
  );

  // ============================================
  // DATA - SECTION 7: RISIKO
  // ============================================
  const [risikobereitschaft, setRisikobereitschaft] = useState(initialProfile.risikobereitschaft);
  const [anlagehorizont, setAnlagehorizont] = useState(initialProfile.anlagehorizont);
  const [verlusttoleranz, setVerlusttoleranz] = useState(initialProfile.verlusttoleranz);
  const [esgPraeferenz, setEsgPraeferenz] = useState(initialProfile.esgPraeferenz);
  const [ausschluesse, setAusschluesse] = useState<string[]>(initialProfile.ausschluesse);

  // ============================================
  // DATA - SECTION 8: ZIELE
  // ============================================
  const [wunschalterFreiheit, setWunschalterFreiheit] = useState(initialProfile.wunschalterFreiheit);
  const [notgroschenZiel, setNotgroschenZiel] = useState(initialProfile.notgroschenZiel);
  const [kurzfristigeZiele, setKurzfristigeZiele] = useState(initialProfile.kurzfristigeZiele);

  const collectProfileState = (): ProfileState => ({
    profilMode,
    simpleStep,
    sectionStatus,
    vorname,
    nachname,
    geburtsdatum,
    zivilstand,
    kanton,
    staatsangehoerigkeit,
    anzahlKinder,
    anstellungsart,
    bruttoeinkommen,
    variablesEinkommen,
    einkommensentwicklung,
    liquiditaet,
    wertschriften,
    immobilienwert,
    sonstigesVermoegen,
    hypothek,
    hypothekZins,
    konsumkredite,
    konsumkrediteZins,
    ahvLuecke,
    pkGuthaben,
    pkEinkaufspotenzial,
    saule3aGesamt,
    saule3aKonten,
    mehrere3a,
    kirchensteuer,
    grenzsteuersatz,
    steuererklaerungUploaded,
    steuererklaerungDaten,
    steuererklaerungProfilVorschlag,
    risikobereitschaft,
    anlagehorizont,
    verlusttoleranz,
    esgPraeferenz,
    ausschluesse,
    wunschalterFreiheit,
    notgroschenZiel,
    kurzfristigeZiele,
  });

  const applyProfileState = (profile: Partial<ProfileState>) => {
    const normalized = normalizeProfileState(profile);

    isHydratingProfile.current = true;

    setProfilMode(normalized.profilMode);
    setSimpleStep(normalized.simpleStep);
    setSectionStatus(normalized.sectionStatus);
    setVorname(normalized.vorname);
    setNachname(normalized.nachname);
    setGeburtsdatum(normalized.geburtsdatum);
    setZivilstand(normalized.zivilstand);
    setKanton(normalized.kanton);
    setStaatsangehoerigkeit(normalized.staatsangehoerigkeit);
    setAnzahlKinder(normalized.anzahlKinder);
    setAnstellungsart(normalized.anstellungsart);
    setBruttoeinkommen(normalized.bruttoeinkommen);
    setVariablesEinkommen(normalized.variablesEinkommen);
    setEinkommensentwicklung(normalized.einkommensentwicklung);
    setLiquiditaet(normalized.liquiditaet);
    setWertschriften(normalized.wertschriften);
    setImmobilienwert(normalized.immobilienwert);
    setSonstigesVermoegen(normalized.sonstigesVermoegen);
    setHypothek(normalized.hypothek);
    setHypothekZins(normalized.hypothekZins);
    setKonsumkredite(normalized.konsumkredite);
    setKonsumkrediteZins(normalized.konsumkrediteZins);
    setAhvLuecke(normalized.ahvLuecke);
    setPkGuthaben(normalized.pkGuthaben);
    setPkEinkaufspotenzial(normalized.pkEinkaufspotenzial);
    setSaule3aGesamt(normalized.saule3aGesamt);
    setSaule3aKonten(normalized.saule3aKonten);
    setMehrere3a(normalized.mehrere3a);
    setKirchensteuer(normalized.kirchensteuer);
    setGrenzsteuersatz(normalized.grenzsteuersatz);
    setSteuererklaerungUploaded(normalized.steuererklaerungUploaded);
    setSteuererklaerungDaten(normalized.steuererklaerungDaten);
    setSteuererklaerungProfilVorschlag(normalized.steuererklaerungProfilVorschlag);
    setTaxExtractionMode(normalized.steuererklaerungDaten.length > 0 ? 'pdf-text' : null);
    setTaxUploadStatus(
      normalized.steuererklaerungUploaded
        ? normalized.steuererklaerungDaten.length > 0
          ? 'success'
          : 'empty'
        : 'idle'
    );
    setRisikobereitschaft(normalized.risikobereitschaft);
    setAnlagehorizont(normalized.anlagehorizont);
    setVerlusttoleranz(normalized.verlusttoleranz);
    setEsgPraeferenz(normalized.esgPraeferenz);
    setAusschluesse(normalized.ausschluesse);
    setWunschalterFreiheit(normalized.wunschalterFreiheit);
    setNotgroschenZiel(normalized.notgroschenZiel);
    setKurzfristigeZiele(normalized.kurzfristigeZiele);
  };

  // ============================================
  // CALCULATED VALUES
  // ============================================
  const gesamtVermoegen = liquiditaet + wertschriften + immobilienwert + sonstigesVermoegen + pkGuthaben + saule3aGesamt;
  const gesamtSchulden = hypothek + konsumkredite;
  const nettoVermoegen = gesamtVermoegen - gesamtSchulden;

  // Calculate progress for erweitert profile
  const completedSections = Object.values(sectionStatus).filter(s => s === 'complete').length;
  const totalSections = Object.keys(sectionStatus).length;
  const progressPercent = Math.round((completedSections / totalSections) * 100);
  const pendingTaxFields = steuererklaerungDaten.filter((entry) => entry.status === 'pending');
  const acceptedTaxFields = steuererklaerungDaten.filter((entry) => entry.status === 'accepted');

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  const markSectionComplete = (section: string) => {
    setSectionStatus({ ...sectionStatus, [section]: 'complete' });
  };

  const markSectionSkipped = (section: string) => {
    setSectionStatus({ ...sectionStatus, [section]: 'skipped' });
  };

  const toggleAusschluss = (item: string) => {
    if (ausschluesse.includes(item)) {
      setAusschluesse(ausschluesse.filter(e => e !== item));
    } else {
      setAusschluesse([...ausschluesse, item]);
    }
  };

  const setSingle3aTotal = (value: number) => {
    setSaule3aGesamt(value);
    setSaule3aKonten([value]);
    setMehrere3a(false);
  };

  const update3aKonto = (index: number, value: number) => {
    setSaule3aKonten((current) => current.map((entry, entryIndex) => (entryIndex === index ? value : entry)));
  };

  const add3aKonto = () => {
    setSaule3aKonten((current) => [...current, 0]);
    setMehrere3a(true);
  };

  const remove3aKonto = (index: number) => {
    setSaule3aKonten((current) => {
      if (current.length <= 1) {
        return current;
      }

      return current.filter((_, entryIndex) => entryIndex !== index);
    });
  };

  const handleMehrere3aChange = (enabled: boolean) => {
    if (!enabled) {
      setSaule3aKonten([saule3aKonten.reduce((sum, entry) => sum + entry, 0)]);
      setMehrere3a(false);
      return;
    }

    setSaule3aKonten((current) => (current.length > 1 ? current : [...current, 0]));
    setMehrere3a(true);
  };

  const handleSteuererklaerungUpload = async (file: File) => {
    setTaxUploadStatus('processing');

    try {
      const remoteResult = TAX_READER_URL ? await extractTaxDataFromCloudRun(file) : null;
      const fallbackExtraction = remoteResult ? null : await extractSwissTaxDocumentText(file);
      const localResult = fallbackExtraction ? extractTaxProfileData(fallbackExtraction.text) : null;
      const profile = remoteResult?.profile ?? localResult?.profile ?? {};
      const fields = remoteResult?.fields ?? localResult?.fields ?? [];
      const mode = remoteResult?.mode ?? fallbackExtraction?.mode ?? 'empty';

      setSteuererklaerungUploaded(true);
      setSteuererklaerungDaten(fields);
      setSteuererklaerungProfilVorschlag(profile);
      setTaxExtractionMode(mode);

      setTaxUploadStatus(fields.length > 0 ? 'success' : 'empty');
    } catch (error) {
      console.error('Fehler beim Verarbeiten der Steuererklärung:', error);
      setSteuererklaerungUploaded(false);
      setSteuererklaerungDaten([]);
      setSteuererklaerungProfilVorschlag(null);
      setTaxExtractionMode(null);
      setTaxUploadStatus('error');
    }
  };

  const applyReviewedTaxFields = (fieldKeys: Array<keyof ProfileState>) => {
    if (!steuererklaerungProfilVorschlag) {
      return;
    }

    const acceptedProfile = fieldKeys.reduce<Partial<ProfileState>>((result, fieldKey) => {
      const value = steuererklaerungProfilVorschlag[fieldKey];
      if (value !== undefined) {
        result[fieldKey] = value as never;
      }
      return result;
    }, {});

    if (Object.keys(acceptedProfile).length === 0) {
      return;
    }

    applyExtractedTaxProfile(acceptedProfile, {
      setKanton,
      setZivilstand,
      setAnzahlKinder,
      setKirchensteuer,
      setBruttoeinkommen,
      setVariablesEinkommen,
      setLiquiditaet,
      setWertschriften,
      setImmobilienwert,
      setSonstigesVermoegen,
      setHypothek,
      setPkGuthaben,
      setSaule3aGesamt,
      setSaule3aKonten,
      setGrenzsteuersatz,
    });

    setSteuererklaerungDaten((current) =>
      current.map((entry) =>
        fieldKeys.includes(entry.fieldKey)
          ? { ...entry, status: 'accepted' }
          : entry
      )
    );
  };

  const rejectTaxField = (fieldKey: keyof ProfileState) => {
    setSteuererklaerungDaten((current) =>
      current.map((entry) =>
        entry.fieldKey === fieldKey ? { ...entry, status: 'rejected' } : entry
      )
    );
  };

  const acceptTaxField = (fieldKey: keyof ProfileState) => {
    applyReviewedTaxFields([fieldKey]);
  };

  const acceptAllPendingTaxFields = () => {
    const pendingFieldKeys = steuererklaerungDaten
      .filter((entry) => entry.status === 'pending')
      .map((entry) => entry.fieldKey);

    applyReviewedTaxFields(Array.from(new Set(pendingFieldKeys)));
  };

  useEffect(() => {
    const total = saule3aKonten.reduce((sum, entry) => sum + entry, 0);

    if (total !== saule3aGesamt) {
      setSaule3aGesamt(total);
    }

    if (mehrere3a !== (saule3aKonten.length > 1)) {
      setMehrere3a(saule3aKonten.length > 1);
    }
  }, [mehrere3a, saule3aGesamt, saule3aKonten]);

  useEffect(() => {
    if (!userId) {
      hasLoadedRemoteProfile.current = true;
      return;
    }

    let isMounted = true;

    const loadRemoteProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('data')
        .eq('user_id', userId)
        .maybeSingle();

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error('Fehler beim Laden des Profils aus Supabase:', error.message);
        hasLoadedRemoteProfile.current = true;
        return;
      }

      if (data?.data) {
        applyProfileState(data.data as Partial<ProfileState>);
      }

      hasLoadedRemoteProfile.current = true;
    };

    loadRemoteProfile();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const profileState = collectProfileState();

    window.localStorage.setItem(getProfileStorageKey(userId), JSON.stringify(profileState));
  }, [
    userId,
    profilMode,
    simpleStep,
    sectionStatus,
    vorname,
    nachname,
    geburtsdatum,
    zivilstand,
    kanton,
    staatsangehoerigkeit,
    anzahlKinder,
    anstellungsart,
    bruttoeinkommen,
    variablesEinkommen,
    einkommensentwicklung,
    liquiditaet,
    wertschriften,
    immobilienwert,
    sonstigesVermoegen,
    hypothek,
    hypothekZins,
    konsumkredite,
    konsumkrediteZins,
    ahvLuecke,
    pkGuthaben,
    pkEinkaufspotenzial,
    saule3aGesamt,
    saule3aKonten,
    mehrere3a,
    kirchensteuer,
    grenzsteuersatz,
    steuererklaerungUploaded,
    steuererklaerungDaten,
    steuererklaerungProfilVorschlag,
    risikobereitschaft,
    anlagehorizont,
    verlusttoleranz,
    esgPraeferenz,
    ausschluesse,
    wunschalterFreiheit,
    notgroschenZiel,
    kurzfristigeZiele,
  ]);

  useEffect(() => {
    if (!userId || !hasLoadedRemoteProfile.current) {
      return;
    }

    if (isHydratingProfile.current) {
      isHydratingProfile.current = false;
      return;
    }

    const profileState = collectProfileState();
    const timeoutId = window.setTimeout(async () => {
      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: userId,
            data: profileState,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (error) {
        console.error('Fehler beim Speichern des Profils in Supabase:', error.message);
      }
    }, 800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    userId,
    profilMode,
    simpleStep,
    sectionStatus,
    vorname,
    nachname,
    geburtsdatum,
    zivilstand,
    kanton,
    staatsangehoerigkeit,
    anzahlKinder,
    anstellungsart,
    bruttoeinkommen,
    variablesEinkommen,
    einkommensentwicklung,
    liquiditaet,
    wertschriften,
    immobilienwert,
    sonstigesVermoegen,
    hypothek,
    hypothekZins,
    konsumkredite,
    konsumkrediteZins,
    ahvLuecke,
    pkGuthaben,
    pkEinkaufspotenzial,
    saule3aGesamt,
    saule3aKonten,
    mehrere3a,
    kirchensteuer,
    grenzsteuersatz,
    steuererklaerungUploaded,
    steuererklaerungDaten,
    steuererklaerungProfilVorschlag,
    risikobereitschaft,
    anlagehorizont,
    verlusttoleranz,
    esgPraeferenz,
    ausschluesse,
    wunschalterFreiheit,
    notgroschenZiel,
    kurzfristigeZiele,
  ]);

  const taxUploadPanel = (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle>Steuererklärung zuerst hochladen</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Wir lesen die letzte Steuererklärung aus und schlagen passende Angaben vor. Du prüfst die Treffer vor der Übernahme ins Profil.
        </p>

        <FileUpload
          label="Letzte Steuererklärung hochladen (PDF)"
          onUpload={handleSteuererklaerungUpload}
          microcopy="Erkannte Angaben wie Wohnkanton, Zivilstand, Kinder, Einkommen, Liquidität, Wertschriften, Liegenschaft, Hypothek, Pensionskasse, Säule 3a und Steuersatz werden automatisch übernommen."
        />

        {taxUploadStatus === 'processing' && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-primary">
            Steuererklärung wird verarbeitet. Bei gescannten PDFs kann der OCR-Schritt etwas länger dauern...
          </div>
        )}

        {taxUploadStatus === 'success' && (
          <div className="rounded-lg border border-success/30 bg-success/5 p-4">
            <p className="mb-3 flex items-center gap-2 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" />
              Steuerdaten erkannt. Bitte vor der Übernahme prüfen.
            </p>
            <p className="mb-3 text-xs text-muted-foreground">
              {taxExtractionMode === 'ocr'
                ? 'Die Datei wurde per OCR verarbeitet.'
                : 'Die Datei wurde direkt aus dem PDF-Text verarbeitet.'}
            </p>
            {pendingTaxFields.length > 0 && (
              <>
                <div className="mb-4 flex flex-wrap gap-2">
                  <Button onClick={acceptAllPendingTaxFields}>Alle Vorschläge übernehmen</Button>
                </div>
                <div className="space-y-3">
                  {pendingTaxFields.map((entry) => (
                    <div key={`${entry.fieldKey}-${entry.value}`} className="rounded-lg border border-border bg-background p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-foreground">{entry.label}</span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs ${
                                entry.confidence === 'high'
                                  ? 'bg-success/15 text-success'
                                  : entry.confidence === 'medium'
                                    ? 'bg-warning/15 text-warning'
                                    : 'bg-destructive/15 text-destructive'
                              }`}
                            >
                              {entry.confidence === 'high'
                                ? 'Hohe Sicherheit'
                                : entry.confidence === 'medium'
                                  ? 'Mittlere Sicherheit'
                                  : 'Niedrige Sicherheit'}
                            </span>
                          </div>
                          <p className="text-base text-foreground">{entry.value}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => rejectTaxField(entry.fieldKey)}>
                            Verwerfen
                          </Button>
                          <Button onClick={() => acceptTaxField(entry.fieldKey)}>
                            Übernehmen
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {acceptedTaxFields.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs text-muted-foreground">Bereits übernommen</p>
                <div className="flex flex-wrap gap-2">
                  {acceptedTaxFields.map((entry) => (
                    <ExtractedDataChip key={`${entry.label}-${entry.value}`} label={entry.label} value={entry.value} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {taxUploadStatus === 'empty' && (
          <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 text-sm text-warning">
            Die Datei wurde hochgeladen, aber es konnten noch keine Felder sicher erkannt werden. Bei gescannten PDFs ohne eingebetteten Text ist oft zuerst OCR oder ein exportiertes Steuer-PDF nötig.
          </div>
        )}

        {taxUploadStatus === 'error' && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            Die Steuererklärung konnte nicht verarbeitet werden.
          </div>
        )}
      </CardContent>
    </Card>
  );

  // ============================================
  // SIMPLE PROFILE RENDER
  // ============================================
  if (profilMode === 'simple') {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl text-foreground">Schnell-Profil</h1>
          <p className="mb-6 text-muted-foreground">
            In 5 Minuten zu deinem ersten Finanzplan - verfeinern kannst du später jederzeit
          </p>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Schritt {simpleStep} von {totalSimpleSteps}</span>
              <span className="text-sm text-primary">{Math.round((simpleStep / totalSimpleSteps) * 100)}%</span>
            </div>
            <Progress value={(simpleStep / totalSimpleSteps) * 100} />
          </div>

          {/* Mode Switcher */}
          <button
            onClick={() => setProfilMode('erweitert')}
            className="text-sm text-primary hover:underline"
          >
              Zum erweiterten Profil wechseln →
          </button>
        </div>

        <div className="mb-8">
          {taxUploadPanel}
        </div>

        {/* Step 1: Basis */}
        {simpleStep === 1 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Persönliche Basis</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <SliderInput
                label="Alter"
                value={geburtsdatum ? new Date().getFullYear() - new Date(geburtsdatum).getFullYear() : 35}
                onChange={(val) => {
                  const year = new Date().getFullYear() - val;
                  setGeburtsdatum(`${year}-01-01`);
                }}
                min={18}
                max={70}
                step={1}
                suffix="Jahre"
              />

              <Select
                label="Zivilstand"
                value={zivilstand}
                onChange={setZivilstand}
                options={ZIVILSTAND_OPTIONS}
              />

              <Select
                label="Wohnkanton"
                value={kanton}
                onChange={setKanton}
                options={KANTONE}
              />

              <Button onClick={() => setSimpleStep(2)} className="w-full">
                Weiter <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Einkommen */}
        {simpleStep === 2 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                <CardTitle>Einkommen</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Select
                label="Anstellungsart"
                value={anstellungsart}
                onChange={setAnstellungsart}
                options={ANSTELLUNGSART_OPTIONS}
              />

              <SliderInput
                label="Bruttojahreseinkommen"
                value={bruttoeinkommen}
                onChange={setBruttoeinkommen}
                min={0}
                max={300000}
                step={5000}
                suffix="CHF"
              />

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setSimpleStep(1)} className="flex-1">
                  Zurück
                </Button>
                <Button onClick={() => setSimpleStep(3)} className="flex-1">
                  Weiter <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Vermögen Quick-Check */}
        {simpleStep === 3 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle>Vermögen (grob)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <SliderInput
                label="Liquide Mittel (Cash, Konten)"
                value={liquiditaet}
                onChange={setLiquiditaet}
                min={0}
                max={500000}
                step={10000}
                suffix="CHF"
              />

              <SliderInput
                label="Wertschriften / Depots"
                value={wertschriften}
                onChange={setWertschriften}
                min={0}
                max={1000000}
                step={10000}
                suffix="CHF"
              />

              <div>
                <label className="mb-2 block text-sm">Schulden vorhanden?</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setHypothek(0)}
                    className={`flex-1 rounded-lg border px-4 py-2 ${
                      hypothek === 0
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-card-foreground'
                    }`}
                  >
                    Nein
                  </button>
                  <button
                    onClick={() => setHypothek(400000)}
                    className={`flex-1 rounded-lg border px-4 py-2 ${
                      hypothek > 0
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-card-foreground'
                    }`}
                  >
                    Ja
                  </button>
                </div>
              </div>

              {hypothek > 0 && (
                <SliderInput
                  label="Höhe Hypothek / Schulden"
                  value={hypothek}
                  onChange={setHypothek}
                  min={0}
                  max={2000000}
                  step={50000}
                  suffix="CHF"
                />
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setSimpleStep(2)} className="flex-1">
                  Zurück
                </Button>
                <Button onClick={() => setSimpleStep(4)} className="flex-1">
                  Weiter <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Vorsorge Quick-Check */}
        {simpleStep === 4 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-primary" />
                <CardTitle>Vorsorge</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <SliderInput
                label="Pensionskasse (BVG)"
                value={pkGuthaben}
                onChange={setPkGuthaben}
                min={0}
                max={1000000}
                step={10000}
                suffix="CHF"
              />

              <SliderInput
                label="Säule 3a"
                value={saule3aGesamt}
                onChange={setSingle3aTotal}
                min={0}
                max={200000}
                step={5000}
                suffix="CHF"
              />

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm">
                  AHV-Beitragslücke bekannt?
                  <InfoTooltip content="Fehlende AHV-Beitragsjahre können die Rente um bis zu 2.3% pro Jahr kürzen" />
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['ja', 'nein', 'unbekannt'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setAhvLuecke(option as any)}
                      className={`rounded-lg border px-4 py-2 capitalize ${
                        ahvLuecke === option
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card text-card-foreground'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setSimpleStep(3)} className="flex-1">
                  Zurück
                </Button>
                <Button onClick={() => setSimpleStep(5)} className="flex-1">
                  Weiter <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Risiko-Kurzprofil */}
        {simpleStep === 5 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Risikoprofil</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Select
                label="Risikobereitschaft"
                value={risikobereitschaft}
                onChange={setRisikobereitschaft}
                options={RISIKO_OPTIONS}
              />

              <Select
                label="Anlagehorizont"
                value={anlagehorizont}
                onChange={setAnlagehorizont}
                options={ANLAGEHORIZONT_OPTIONS}
              />

              <div className="rounded-lg bg-primary/5 p-4">
                <p className="mb-2 text-sm text-muted-foreground">Dein geschätztes Nettovermögen</p>
                <p className="text-2xl text-primary">{nettoVermoegen.toLocaleString('de-CH')} CHF</p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setSimpleStep(4)} className="flex-1">
                  Zurück
                </Button>
                <Button onClick={() => setProfilMode('erweitert')} className="flex-1">
                    Profil verfeinern →
                </Button>
              </div>

              <div className="rounded-lg border border-success/30 bg-success/5 p-4 text-center">
                <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-success" />
                <p className="mb-1 text-foreground">Basis-Profil vollständig!</p>
                <p className="text-xs text-muted-foreground">
                  Verfeinere jetzt dein Profil für präzisere Empfehlungen
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ============================================
  // ERWEITERT PROFILE RENDER
  // ============================================
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl text-foreground">Erweitertes Profil</h1>
        <p className="mb-4 text-muted-foreground">
          Vollständige Erfassung für präzise Finanzplanung und individuelle Empfehlungen
        </p>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Profil zu {progressPercent}% vollständig</span>
            <span className="text-sm text-primary">{completedSections} von {totalSections} Bereichen</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </div>

        {/* Mode Switcher */}
        <button
          onClick={() => setProfilMode('simple')}
          className="text-sm text-primary hover:underline"
        >
          ← Zurück zum Schnell-Profil
        </button>
      </div>

      <div className="mb-8">
        {taxUploadPanel}
      </div>

      {/* Accordion Sections */}
      <Accordion type="single" collapsible defaultValue="basis" className="space-y-4">
        
        {/* SECTION 1: Persönliche Basisdaten */}
        <Card>
          <AccordionItem value="basis" className="border-0">
            <AccordionTrigger className="px-6">
              <div className="flex items-center gap-3">
                {sectionStatus.basis === 'complete' ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <User className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <h3 className="text-base text-foreground">Persönliche Basisdaten</h3>
                  <p className="text-xs text-muted-foreground">Name, Geburtsdatum, Wohnsituation</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm">Vorname</label>
                    <input
                      type="text"
                      value={vorname}
                      onChange={(e) => setVorname(e.target.value)}
                      className="w-full rounded-lg border border-border bg-input-background px-4 py-2"
                      placeholder="Max"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm">Nachname</label>
                    <input
                      type="text"
                      value={nachname}
                      onChange={(e) => setNachname(e.target.value)}
                      className="w-full rounded-lg border border-border bg-input-background px-4 py-2"
                      placeholder="Muster"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm">Geburtsdatum</label>
                  <input
                    type="date"
                    value={geburtsdatum}
                    onChange={(e) => setGeburtsdatum(e.target.value)}
                    className="w-full rounded-lg border border-border bg-input-background px-4 py-2"
                  />
                </div>

                <Select
                  label="Zivilstand"
                  value={zivilstand}
                  onChange={setZivilstand}
                  options={ZIVILSTAND_OPTIONS}
                />

                <Select
                  label="Wohnkanton"
                  value={kanton}
                  onChange={setKanton}
                  options={KANTONE}
                />

                <div>
                  <label className="mb-2 block text-sm">Staatsangehörigkeit</label>
                  <input
                    type="text"
                    value={staatsangehoerigkeit}
                    onChange={(e) => setStaatsangehoerigkeit(e.target.value)}
                    className="w-full rounded-lg border border-border bg-input-background px-4 py-2"
                    placeholder="CH"
                  />
                </div>

                <SliderInput
                  label="Anzahl Kinder"
                  value={anzahlKinder}
                  onChange={setAnzahlKinder}
                  min={0}
                  max={10}
                  step={1}
                  suffix=""
                />

                
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Card>

        {/* SECTION 2: Einkommen & Arbeit */}
        <Card>
          <AccordionItem value="einkommen" className="border-0">
            <AccordionTrigger className="px-6">
              <div className="flex items-center gap-3">
                {sectionStatus.einkommen === 'complete' ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <Wallet className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <h3 className="text-base text-foreground">Einkommen & Arbeit</h3>
                  <p className="text-xs text-muted-foreground">Anstellung, Gehalt, Entwicklung</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="space-y-6">
                <Select
                  label="Anstellungsart"
                  value={anstellungsart}
                  onChange={setAnstellungsart}
                  options={ANSTELLUNGSART_OPTIONS}
                />

                <SliderInput
                  label="Bruttojahreseinkommen"
                  value={bruttoeinkommen}
                  onChange={setBruttoeinkommen}
                  min={0}
                  max={500000}
                  step={5000}
                  suffix="CHF"
                />

                <SliderInput
                  label="Variables Einkommen (Bonus, Nebenverdienst)"
                  value={variablesEinkommen}
                  onChange={setVariablesEinkommen}
                  min={0}
                  max={200000}
                  step={5000}
                  suffix="CHF"
                />

                <div className="flex items-center gap-2">
                  <SliderInput
                    label="Erwartete jährliche Einkommenssteigerung"
                    value={einkommensentwicklung}
                    onChange={setEinkommensentwicklung}
                    min={0}
                    max={10}
                    step={0.5}
                    suffix="%"
                  />
                    <InfoTooltip content="Durchschnittliche jährliche Gehaltssteigerung aufgrund von Karriereentwicklung, Inflation etc." />
                </div>

                <div className="rounded-lg bg-primary/5 p-4">
                  <p className="mb-1 text-sm text-muted-foreground">Gesamteinkommen (jährlich)</p>
                  <p className="text-2xl text-primary">
                    {(bruttoeinkommen + variablesEinkommen).toLocaleString('de-CH')} CHF
                  </p>
                </div>

                <div className="flex gap-3 border-t border-border pt-4">
                  
                  
                </div>
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Card>

        {/* SECTION 3: Vermögen */}
        <Card>
          <AccordionItem value="vermoegen" className="border-0">
            <AccordionTrigger className="px-6">
              <div className="flex items-center gap-3">
                {sectionStatus.vermoegen === 'complete' ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <TrendingUp className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <h3 className="text-base text-foreground">Vermögen</h3>
                  <p className="text-xs text-muted-foreground">Liquidität, Wertschriften, Immobilien</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="space-y-6">
                <div>
                  <p className="mb-4 text-sm text-muted-foreground">Liquide Mittel</p>
                  <SliderInput
                    label="Konten, Cash, Notgroschen"
                    value={liquiditaet}
                    onChange={setLiquiditaet}
                    min={0}
                    max={500000}
                    step={5000}
                    suffix="CHF"
                  />
                </div>

                <div className="border-t border-border pt-6">
                  <p className="mb-4 text-sm text-muted-foreground">Wertschriften & Depots</p>
                  <SliderInput
                    label="Gesamtwert Wertschriftendepots"
                    value={wertschriften}
                    onChange={setWertschriften}
                    min={0}
                    max={2000000}
                    step={10000}
                    suffix="CHF"
                  />
                </div>

                <div className="border-t border-border pt-6">
                  <p className="mb-4 text-sm text-muted-foreground">Immobilien</p>
                  <SliderInput
                    label="Wert Immobilien (Verkehrswert)"
                    value={immobilienwert}
                    onChange={setImmobilienwert}
                    min={0}
                    max={5000000}
                    step={50000}
                    suffix="CHF"
                  />
                </div>

                <div className="border-t border-border pt-6">
                  <SliderInput
                    label="Sonstiges Vermögen"
                    value={sonstigesVermoegen}
                    onChange={setSonstigesVermoegen}
                    min={0}
                    max={1000000}
                    step={10000}
                    suffix="CHF"
                  />
                </div>

                <div className="rounded-lg bg-primary/5 p-4">
                  <p className="mb-1 text-sm text-muted-foreground">Gesamtvermögen (exkl. Vorsorge)</p>
                  <p className="text-2xl text-primary">
                    {(liquiditaet + wertschriften + immobilienwert + sonstigesVermoegen).toLocaleString('de-CH')} CHF
                  </p>
                </div>

                <div className="flex gap-3 border-t border-border pt-4">
                  
                  
                </div>
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Card>

        {/* SECTION 4: Schulden */}
        <Card>
          <AccordionItem value="schulden" className="border-0">
            <AccordionTrigger className="px-6">
              <div className="flex items-center gap-3">
                {sectionStatus.schulden === 'complete' ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <Building2 className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <h3 className="text-base text-foreground">Schulden & Verpflichtungen</h3>
                  <p className="text-xs text-muted-foreground">Hypotheken, Kredite</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="space-y-6">
                <div>
                  <p className="mb-4 text-sm text-muted-foreground">Hypotheken</p>
                  <SliderInput
                    label="Hypothek (Gesamtsumme)"
                    value={hypothek}
                    onChange={setHypothek}
                    min={0}
                    max={3000000}
                    step={50000}
                    suffix="CHF"
                  />

                  {hypothek > 0 && (
                    <div className="mt-4">
                      <SliderInput
                        label="Durchschnittlicher Zinssatz"
                        value={hypothekZins}
                        onChange={setHypothekZins}
                        min={0}
                        max={10}
                        step={0.1}
                        suffix="%"
                      />
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-6">
                  <p className="mb-4 text-sm text-muted-foreground">Konsumkredite & Leasing</p>
                  <SliderInput
                    label="Konsumkredite (Auto, etc.)"
                    value={konsumkredite}
                    onChange={setKonsumkredite}
                    min={0}
                    max={200000}
                    step={5000}
                    suffix="CHF"
                  />

                  {konsumkredite > 0 && (
                    <div className="mt-4">
                      <SliderInput
                        label="Durchschnittlicher Zinssatz"
                        value={konsumkrediteZins}
                        onChange={setKonsumkrediteZins}
                        min={0}
                        max={10}
                        step={0.1}
                        suffix="%"
                      />
                    </div>
                  )}
                </div>

                {(hypothek > 0 || konsumkredite > 0) && (
                  <div className="rounded-lg bg-warning/10 p-4">
                    <p className="mb-1 text-sm text-muted-foreground">Gesamtschulden</p>
                    <p className="text-2xl text-warning">
                      {gesamtSchulden.toLocaleString('de-CH')} CHF
                    </p>
                    {hypothek > 0 && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Jährliche Hypothekzinsen: ca. {((hypothek * hypothekZins) / 100).toLocaleString('de-CH')} CHF
                      </p>
                    )}
                    {konsumkredite > 0 && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Jährliche Konsumkreditzinsen: ca. {((konsumkredite * konsumkrediteZins) / 100).toLocaleString('de-CH')} CHF
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-3 border-t border-border pt-4">
                  
                  
                </div>
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Card>

        {/* SECTION 5: Vorsorge */}
        <Card>
          <AccordionItem value="vorsorge" className="border-0">
            <AccordionTrigger className="px-6">
              <div className="flex items-center gap-3">
                {sectionStatus.vorsorge === 'complete' ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <PiggyBank className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <h3 className="text-base text-foreground">Vorsorge (1. & 2. & 3. Säule)</h3>
                  <p className="text-xs text-muted-foreground">AHV, Pensionskasse, Säule 3a</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="space-y-6">
                {/* AHV */}
                <div>
                  <p className="mb-4 text-sm text-muted-foreground">AHV (1. Säule)</p>
                  
                  <div className="mb-4 rounded-lg bg-warning/10 p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 shrink-0 text-warning" />
                      <div>
                        <p className="text-sm text-foreground">
                          Beitragslücken können die AHV-Rente um bis zu 2.3% pro Jahr kürzen
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm">AHV-Beitragslücke bekannt?</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['ja', 'nein', 'unbekannt'].map((option) => (
                        <button
                          key={option}
                          onClick={() => setAhvLuecke(option as any)}
                          className={`rounded-lg border px-4 py-2 capitalize ${
                            ahvLuecke === option
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-card text-card-foreground'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button variant="outline" className="mt-4 w-full">
                    AHV-Checker starten
                  </Button>
                </div>

                {/* Pensionskasse */}
                <div className="border-t border-border pt-6">
                  <p className="mb-4 text-sm text-muted-foreground">Pensionskasse (2. Säule / BVG)</p>
                  
                  <SliderInput
                    label="Aktuelles Altersguthaben"
                    value={pkGuthaben}
                    onChange={setPkGuthaben}
                    min={0}
                    max={1500000}
                    step={10000}
                    suffix="CHF"
                  />

                  <div className="mt-4">
                    <SliderInput
                      label="Einkaufspotenzial (falls bekannt)"
                      value={pkEinkaufspotenzial}
                      onChange={setPkEinkaufspotenzial}
                      min={0}
                      max={500000}
                      step={5000}
                      suffix="CHF"
                    />
                  </div>
                </div>

                {/* Säule 3a */}
                <div className="border-t border-border pt-6">
                  <p className="mb-4 text-sm text-muted-foreground">Säule 3a</p>
                  
                  <div className="mb-4">
                    <label className="mb-2 block text-sm">Mehrere 3a-Konten vorhanden?</label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleMehrere3aChange(false)}
                        className={`flex-1 rounded-lg border px-4 py-2 ${
                          !mehrere3a
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-card text-card-foreground'
                        }`}
                      >
                        Nein
                      </button>
                      <button
                        onClick={() => handleMehrere3aChange(true)}
                        className={`flex-1 rounded-lg border px-4 py-2 ${
                          mehrere3a
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-card text-card-foreground'
                        }`}
                      >
                        Ja
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {saule3aKonten.map((konto, index) => (
                      <div key={`3a-konto-${index}`} className="rounded-lg border border-border p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <p className="text-sm text-foreground">3a-Konto {index + 1}</p>
                          {saule3aKonten.length > 1 && (
                            <Button variant="outline" onClick={() => remove3aKonto(index)}>
                              Entfernen
                            </Button>
                          )}
                        </div>
                        <SliderInput
                          label="Kontostand"
                          value={konto}
                          onChange={(value) => update3aKonto(index, value)}
                          min={0}
                          max={250000}
                          step={5000}
                          suffix="CHF"
                        />
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" onClick={add3aKonto} className="mt-4 w-full">
                    Weiteres 3a-Konto hinzufügen
                  </Button>

                  {mehrere3a && (
                    <div className="mt-4 rounded-lg bg-secondary/10 p-3">
                      <p className="text-xs text-muted-foreground">
                        Mehrere 3a-Konten ermöglichen gestaffelten Bezug und Steueroptimierung.
                      </p>
                    </div>
                  )}
                </div>

                <div className="rounded-lg bg-primary/5 p-4">
                  <p className="mb-1 text-sm text-muted-foreground">Gesamtes Vorsorgevermögen</p>
                  <p className="text-2xl text-primary">
                    {(pkGuthaben + saule3aGesamt).toLocaleString('de-CH')} CHF
                  </p>
                </div>

                <div className="flex gap-3 border-t border-border pt-4">
                  
                  
                </div>
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Card>

        {/* SECTION 6: Steuern */}
        <Card>
          <AccordionItem value="steuern" className="border-0">
            <AccordionTrigger className="px-6">
              <div className="flex items-center gap-3">
                {sectionStatus.steuern === 'complete' ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <FileText className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <h3 className="text-base text-foreground">Steuern</h3>
                  <p className="text-xs text-muted-foreground">Kirchensteuer, Grenzsteuersatz</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm">Kirchensteuerpflichtig</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setKirchensteuer(false)}
                      className={`flex-1 rounded-lg border px-4 py-2 ${
                        !kirchensteuer
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card text-card-foreground'
                      }`}
                    >
                      Nein
                    </button>
                    <button
                      onClick={() => setKirchensteuer(true)}
                      className={`flex-1 rounded-lg border px-4 py-2 ${
                        kirchensteuer
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card text-card-foreground'
                      }`}
                    >
                      Ja
                    </button>
                  </div>
                </div>

                <SliderInput
                  label="Grenzsteuersatz (falls bekannt)"
                  value={grenzsteuersatz}
                  onChange={setGrenzsteuersatz}
                  min={0}
                  max={50}
                  step={1}
                  suffix="%"
                />

                {steuererklaerungUploaded && (
                  <div className="rounded-lg border border-success/30 bg-success/5 p-4">
                    <p className="flex items-center gap-2 text-sm text-success">
                      <CheckCircle2 className="h-4 w-4" />
                      Steuerdaten wurden geprüft und übernommen
                    </p>
                    {acceptedTaxFields.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {acceptedTaxFields.map((entry) => (
                          <ExtractedDataChip key={`steuer-section-${entry.label}-${entry.value}`} label={entry.label} value={entry.value} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3 border-t border-border pt-4">
                  
                  
                </div>
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Card>

        {/* SECTION 7: Risiko & Präferenzen */}
        <Card>
          <AccordionItem value="risiko" className="border-0">
            <AccordionTrigger className="px-6">
              <div className="flex items-center gap-3">
                {sectionStatus.risiko === 'complete' ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <Shield className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <h3 className="text-base text-foreground">Risiko & Präferenzen</h3>
                  <p className="text-xs text-muted-foreground">Anlagebereitschaft, ESG, Ausschlüsse</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="space-y-6">
                <Select
                  label="Risikobereitschaft"
                  value={risikobereitschaft}
                  onChange={setRisikobereitschaft}
                  options={RISIKO_OPTIONS}
                />

                <Select
                  label="Anlagehorizont"
                  value={anlagehorizont}
                  onChange={setAnlagehorizont}
                  options={ANLAGEHORIZONT_OPTIONS}
                />

                <Select
                  label="Verlusttoleranz"
                  value={verlusttoleranz}
                  onChange={setVerlusttoleranz}
                  options={VERLUSTTOLERANZ_OPTIONS}
                />

                <div className="border-t border-border pt-6">
                  <Select
                  label="Nachhaltigkeit / ESG-Präferenz"
                    value={esgPraeferenz}
                    onChange={setEsgPraeferenz}
                    options={ESG_OPTIONS}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm">Anlage-Ausschlüsse</label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {['Krypto', 'Waffen', 'Tabak', 'Fossile Energien'].map((item) => (
                      <button
                        key={item}
                        onClick={() => toggleAusschluss(item)}
                        className={`rounded-lg border px-3 py-2 text-sm ${
                          ausschluesse.includes(item)
                            ? 'border-destructive bg-destructive/10 text-destructive'
                            : 'border-border bg-card text-card-foreground'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  {ausschluesse.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Ausgeschlossen: {ausschluesse.join(', ')}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 border-t border-border pt-4">
                  
                  
                </div>
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Card>

        {/* SECTION 8: Ziele & Constraints */}
        <Card>
          <AccordionItem value="ziele" className="border-0">
            <AccordionTrigger className="px-6">
              <div className="flex items-center gap-3">
                {sectionStatus.ziele === 'complete' ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <Target className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <h3 className="text-base text-foreground">Ziele & Constraints</h3>
                  <p className="text-xs text-muted-foreground">Finanzielle Freiheit, Notgroschen, Wünsche</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="space-y-6">
                <SliderInput
                    label="Wunschalter für finanzielle Freiheit"
                  value={wunschalterFreiheit}
                  onChange={setWunschalterFreiheit}
                  min={40}
                  max={75}
                  step={1}
                  suffix="Jahre"
                />

                <SliderInput
                    label="Ziel Liquiditäts-Notgroschen"
                  value={notgroschenZiel}
                  onChange={setNotgroschenZiel}
                  min={0}
                  max={100000}
                  step={5000}
                  suffix="CHF"
                />

                <div>
                  <label className="mb-2 block text-sm">Kurzfristige Ziele (optional)</label>
                  <textarea
                    value={kurzfristigeZiele}
                    onChange={(e) => setKurzfristigeZiele(e.target.value)}
                    className="w-full rounded-lg border border-border bg-input-background px-4 py-2"
                    rows={3}
                    placeholder="z.B. Hauskauf in 5 Jahren, Sabbatical, etc."
                  />
                </div>

                <div className="flex gap-3 border-t border-border pt-4">
                  
                  
                </div>
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Card>
      </Accordion>

      {/* Summary Card */}
      {progressPercent === 100 && (
        <Card className="mt-8 border-success/30 bg-success/5">
          <CardContent className="py-6 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-success" />
            <h3 className="mb-2 text-xl text-foreground">Profil vollständig!</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Alle Bereiche erfasst - du erhältst jetzt maximale Präzision in deinen Finanzplänen
            </p>
            <Button size="lg">
                Zum Dashboard →
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

