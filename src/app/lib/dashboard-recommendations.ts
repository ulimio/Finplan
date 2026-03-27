import { formatCurrency, formatPercent } from './finance-data';
import type { ProfilSnapshot, Variante } from './finance-data';

export const AHV_ESCAL_URL = 'https://www.ahv-iv.ch/de/Formulare/Online-Rentensch%C3%A4tzung-ESCAL';

export type RecommendationTone = 'warning' | 'success' | 'primary';
export type RecommendationCategory = 'vorsorge' | 'steuern' | 'liquiditaet' | 'vermoegen' | 'schulden';

export interface DashboardRecommendation {
  id: string;
  title: string;
  body: string;
  impact: string;
  tone: RecommendationTone;
  priority: number;
  category: RecommendationCategory;
  checks: string[];
  productHints?: string[];
  href?: string;
  actionLabel?: string;
  externalUrl?: string;
  externalLabel?: string;
}

export interface RecommendationContext {
  profile: ProfilSnapshot;
  activeVariante: Variante;
  endvermoegen: number;
  yearsToRetirement: number;
  emergencyReserveGap: number;
  variantCount: number;
}

export interface RecommendationRule {
  id: string;
  description: string;
  when: (context: RecommendationContext) => boolean;
  build: (context: RecommendationContext) => DashboardRecommendation;
}

export const DASHBOARD_RECOMMENDATION_UI = {
  featured: {
    title: 'Top-Empfehlung',
    sections: ['impact', 'checks', 'productHints', 'actions'],
  },
  secondary: {
    title: 'Weitere Empfehlungen',
    sections: ['impact', 'checks', 'productHints', 'actions'],
  },
  labels: {
    checks: 'Konkrete Prüfungen',
    productHints: 'Produkt- und Lösungsansätze',
    nextSteps: 'Nächste Schritte',
    priority: 'Priorität',
  },
} as const;

export const DASHBOARD_RECOMMENDATION_JSON_SCHEMA = {
  type: 'object',
  required: ['id', 'title', 'body', 'impact', 'tone', 'priority', 'category', 'checks'],
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    body: { type: 'string' },
    impact: { type: 'string' },
    tone: { enum: ['warning', 'success', 'primary'] },
    priority: { type: 'number', minimum: 0, maximum: 100 },
    category: { enum: ['vorsorge', 'steuern', 'liquiditaet', 'vermoegen', 'schulden'] },
    checks: {
      type: 'array',
      items: { type: 'string' },
    },
    productHints: {
      type: 'array',
      items: { type: 'string' },
    },
    href: { type: 'string' },
    actionLabel: { type: 'string' },
    externalUrl: { type: 'string' },
    externalLabel: { type: 'string' },
  },
} as const;

export const DASHBOARD_RECOMMENDATION_RULES: RecommendationRule[] = [
  {
    id: 'reserve-gap',
    description: 'Priorisiert den Aufbau der Liquiditätsreserve, wenn der Notgroschen noch nicht erreicht ist.',
    when: ({ emergencyReserveGap }) => emergencyReserveGap > 0,
    build: ({ emergencyReserveGap }) => ({
      id: 'reserve-gap',
      title: 'Liquiditätsreserve zuerst stabilisieren',
      body: 'Dein Notgroschen-Ziel ist noch nicht erreicht. Bevor du zusätzliche Risiken erhöhst, sollte die frei verfügbare Reserve sauber stehen.',
      impact: `${formatCurrency(emergencyReserveGap)} bis zum Reserveziel fehlen aktuell.`,
      tone: 'warning',
      priority: 100,
      category: 'liquiditaet',
      checks: [
        'Monatlichen Aufbauplan für die Reserve definieren',
        'Fixkosten und freie Liquidität für sechs bis zwölf Monate prüfen',
        'Zusätzliche Wertschriftenkäufe erst nach dem Schliessen der Reserve neu gewichten',
      ],
      productHints: ['Sparkonto oder Cash-Reserve für den Sicherheitsbaustein prüfen'],
      href: '/app/profil',
      actionLabel: 'Reserve im Profil prüfen',
    }),
  },
  {
    id: '3a',
    description: 'Hebt ungenutztes 3a-Potenzial als direkten Vorsorge- und Steuerhebel hervor.',
    when: ({ activeVariante }) => activeVariante.sparrate3a === 0,
    build: () => ({
      id: '3a',
      title: 'Säule 3a systematisch nutzen',
      body: 'Die aktive Variante nutzt aktuell kein steuerbegünstigtes 3a-Potenzial. Das ist einer der direktesten Hebel für Vorsorge und Steuerentlastung.',
      impact: 'Verbessert Vorsorgeaufbau und kann die Steuerbelastung jedes Jahr senken.',
      tone: 'warning',
      priority: 95,
      category: 'vorsorge',
      checks: [
        'Maximalbeitrag für deine Erwerbssituation festlegen',
        'Jährliche Einzahlung in die aktive Variante einbauen',
        'Bezug und Staffelung frühzeitig mit der Pensionsplanung abstimmen',
      ],
      productHints: ['3a-Konto oder 3a-Wertschriftenlösung als Produktkategorien vergleichen'],
      href: '/app/varianten',
      actionLabel: '3a in Varianten ergänzen',
    }),
  },
  {
    id: 'ahv-check',
    description: 'Fordert einen AHV-Check bei Teilzeit, Sabbatical oder näherer Pensionierung an.',
    when: ({ profile, yearsToRetirement }) =>
      yearsToRetirement <= 20 ||
      profile.lebensereignisse.some((ereignis) => ereignis.typ === 'teilzeit' || ereignis.typ === 'sabbatical'),
    build: () => ({
      id: 'ahv-check',
      title: 'AHV-Risiko- und Handlungs-Check ergänzen',
      body: 'Bei Teilzeit, Sabbatical oder näher rückender Pensionierung lohnt sich ein strukturierter AHV-Check besonders. So werden mögliche Lücken nicht erst kurz vor dem Ruhestand sichtbar.',
      impact: 'Hilft, Vorsorgelücken früh zu erkennen und die Planung mit echten Prüfschritten zu verbinden.',
      tone: 'warning',
      priority: 92,
      category: 'vorsorge',
      checks: [
        'AHV-Kontoauszug bestellen und fehlende Jahre prüfen',
        'Teilzeit-, Auszeit- oder Auslandphasen separat überprüfen',
        'Die spätere AHV-Rente zuerst grob schätzen und danach mit FinPlan-Massnahmen verknüpfen',
      ],
      productHints: ['Offiziellen ESCAL-Rentenschätzer für eine erste AHV-Schätzung verwenden'],
      href: '/app/wissen',
      actionLabel: 'AHV-Wissen öffnen',
      externalUrl: AHV_ESCAL_URL,
      externalLabel: 'Offiziellen AHV-Rentenschätzer öffnen',
    }),
  },
  {
    id: 'pk-einkauf',
    description: 'Zeigt einen möglichen PK-Einkauf bei vorhandenem Grenzsteuersatz und PK-Guthaben.',
    when: ({ profile }) => profile.pkGuthaben > 0 && profile.grenzsteuersatz >= 15,
    build: ({ profile }) => ({
      id: 'pk-einkauf',
      title: 'PK-Einkauf fachlich prüfen',
      body: 'Mit vorhandenem PK-Guthaben und bekanntem Grenzsteuersatz lohnt sich eine konkrete Prüfung, ob ein Einkauf steuerlich und planerisch sinnvoll ist.',
      impact: `Mit ${formatPercent(profile.grenzsteuersatz)} Grenzsteuersatz kann der Hebel auf Steuern und Ruhestand relevant sein.`,
      tone: 'success',
      priority: 88,
      category: 'steuern',
      checks: [
        'Einkaufspotenzial im Vorsorgeausweis prüfen',
        'Geplanten Kapitalbezug und Pensionierungszeitpunkt einbeziehen',
        'PK-Einkauf zusammen mit 3a, Liquidität und Ruhestandsplanung bewerten',
      ],
      productHints: ['PK-Einkauf als Vorsorge- und Steuerhebel prüfen'],
      href: '/app/profil',
      actionLabel: 'Vorsorgebasis prüfen',
    }),
  },
  {
    id: 'amortisation',
    description: 'Fordert eine klare Amortisationsstrategie bei Hypothek ohne Tilgungsplan.',
    when: ({ profile, activeVariante }) => profile.hypothek > 0 && activeVariante.amortisation === 0,
    build: () => ({
      id: 'amortisation',
      title: 'Amortisationsstrategie definieren',
      body: 'Für die bestehende Hypothek fehlt in der aktiven Variante noch eine klare Rückzahlungslogik. Das erschwert Cashflow- und Zinsplanung.',
      impact: 'Mehr Klarheit bei Schuldenabbau, Liquidität und Tragbarkeit.',
      tone: 'primary',
      priority: 84,
      category: 'schulden',
      checks: [
        'Direkte und indirekte Amortisation vergleichen',
        'Zinsbelastung und Tragbarkeit gegen andere Sparziele stellen',
        'Laufzeiten und Anschlussfinanzierung rechtzeitig prüfen',
      ],
      productHints: ['SARON-Hypothek, Festhypothek oder indirekte Amortisation als Kategorien prüfen'],
      href: '/app/varianten',
      actionLabel: 'Hypothek in Varianten modellieren',
    }),
  },
  {
    id: 'investing',
    description: 'Schlägt systematischen Vermögensaufbau vor, wenn die Reserve steht, aber kein Wertschriftensparen läuft.',
    when: ({ profile, activeVariante }) =>
      profile.liquiditaet >= profile.notgroschenZiel && activeVariante.sparrateWertschriften === 0,
    build: ({ endvermoegen }) => ({
      id: 'investing',
      title: 'Wertschriftenaufbau definieren',
      body: 'Die Sicherheitsreserve steht bereits vernünftig. Der nächste logische Schritt ist ein systematischer Vermögensaufbau über die aktive Variante.',
      impact: `Aktuell ist bis 65 ein Vermögen von ${formatCurrency(endvermoegen)} modelliert.`,
      tone: 'primary',
      priority: 76,
      category: 'vermoegen',
      checks: [
        'Monatliche Sparrate festlegen und in die Variante übernehmen',
        'Aktienquote mit Risikoprofil und Zeithorizont abgleichen',
        'Freies Vermögen nach Kosten und Diversifikation strukturieren',
      ],
      productHints: ['ETF-Sparplan oder breit diversifizierte Wertschriftenlösung prüfen'],
      href: '/app/varianten',
      actionLabel: 'Anlagestrategie ergänzen',
    }),
  },
  {
    id: 'second-variant',
    description: 'Empfiehlt mindestens eine Gegenvariante, wenn nur eine Strategie vorhanden ist.',
    when: ({ variantCount }) => variantCount < 2,
    build: () => ({
      id: 'second-variant',
      title: 'Mindestens eine Gegenvariante bauen',
      body: 'Eine einzige Strategie zeigt eine Richtung, aber keine Entscheidung. Der Mehrwert von FinPlan entsteht vor allem im Vergleich unterschiedlicher Szenarien.',
      impact: 'Mehr Klarheit bei Entscheidungen und bei grossen Lebensereignissen.',
      tone: 'success',
      priority: 68,
      category: 'vermoegen',
      checks: [
        'Eine vorsichtige und eine ambitionierte Variante anlegen',
        'Lebensereignisse je Variante unterschiedlich timen',
        'Unterschiede bei Vermögen, Freiheit und Liquidität vergleichen',
      ],
      href: '/app/varianten',
      actionLabel: 'Gegenvariante erstellen',
    }),
  },
];

const FALLBACK_RECOMMENDATION: DashboardRecommendation = {
  id: 'refine',
  title: 'Strategie weiter schärfen',
  body: 'Die Ausgangslage ist stimmig. Jetzt lohnt sich die Verfeinerung von Varianten, Vorsorgehebeln und der zeitlichen Planung deiner Lebensereignisse.',
  impact: 'Die aktuelle Projektion ist belastbar, kann aber noch mit Alternativszenarien geprüft werden.',
  tone: 'success',
  priority: 50,
  category: 'vermoegen',
  checks: [
    'Bestehende Variante gegen eine defensivere Alternative testen',
    'Pensionierung, 3a und Vorsorgebezug zeitlich aufeinander abstimmen',
    'Empfehlungen regelmässig nach Profiländerungen neu prüfen',
  ],
  href: '/app/varianten',
  actionLabel: 'Varianten verfeinern',
};

export function buildDashboardRecommendations(context: RecommendationContext) {
  const recommendations = DASHBOARD_RECOMMENDATION_RULES.filter((rule) => rule.when(context)).map((rule) => rule.build(context));

  if (recommendations.length === 0) {
    return [
      {
        ...FALLBACK_RECOMMENDATION,
        impact: `Aktuelle Projektion bis 65: ${formatCurrency(context.endvermoegen)}.`,
      },
    ];
  }

  return recommendations.sort((left, right) => right.priority - left.priority).slice(0, 5);
}

export function getRecommendationToneClasses(tone: RecommendationTone) {
  if (tone === 'warning') {
    return { card: 'border-warning/30 bg-warning/5', icon: 'text-warning', badge: 'bg-warning/10 text-warning' };
  }

  if (tone === 'success') {
    return { card: 'border-success/30 bg-success/5', icon: 'text-success', badge: 'bg-success/10 text-success' };
  }

  return { card: 'border-primary/30 bg-primary/5', icon: 'text-primary', badge: 'bg-primary/10 text-primary' };
}

export function getRecommendationCategoryLabel(category: RecommendationCategory) {
  switch (category) {
    case 'vorsorge':
      return 'Vorsorge';
    case 'steuern':
      return 'Steuern';
    case 'liquiditaet':
      return 'Liquidität';
    case 'schulden':
      return 'Schulden';
    default:
      return 'Vermögen';
  }
}
