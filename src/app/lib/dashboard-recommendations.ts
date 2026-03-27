import { formatCurrency, formatPercent } from './finance-data';
import type { ProfilSnapshot, Variante, VariantenAnalyse } from './finance-data';

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
  activeAnalyse: VariantenAnalyse;
  yearsToRetirement: number;
  emergencyReserveGap: number;
  variantCount: number;
}

export interface RecommendationRule {
  id: string;
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

export const DASHBOARD_RECOMMENDATION_RULES: RecommendationRule[] = [
  {
    id: 'cashflow-gap',
    when: ({ activeAnalyse }) => activeAnalyse.monatlicherUeberschussHeute < 0,
    build: ({ activeAnalyse }) => ({
      id: 'cashflow-gap',
      title: 'Haushalts-Cashflow zuerst stabilisieren',
      body: 'Die laufende Rechnung ist negativ. Ohne positiven Monatsüberschuss werden Vorsorge, Immobilienstrategie und Vermögensaufbau rechnerisch instabil.',
      impact: `Aktueller modellierter Monatsüberschuss: ${formatCurrency(activeAnalyse.monatlicherUeberschussHeute)}.`,
      tone: 'warning',
      priority: 100,
      category: 'liquiditaet',
      checks: [
        'Monatsausgaben und Fixkosten im Profil realistisch erfassen',
        'Sparraten und Amortisation nur aus echtem Überschuss finanzieren',
        'Variable Ausgaben, Betreuung und Krankenkasse separat prüfen',
      ],
      href: '/app/profil',
      actionLabel: 'Cashflow im Profil schärfen',
    }),
  },
  {
    id: 'reserve-gap',
    when: ({ emergencyReserveGap }) => emergencyReserveGap > 0,
    build: ({ emergencyReserveGap, profile }) => ({
      id: 'reserve-gap',
      title: 'Liquiditätsreserve zuerst stabilisieren',
      body: 'Die freie Reserve passt noch nicht sauber zur Haushalts- und Risikosituation. Das ist vor allem bei Familie, Hypothek oder volatilem Einkommen kritisch.',
      impact: `${formatCurrency(emergencyReserveGap)} bis zum aktuellen Reserveziel fehlen.`,
      tone: 'warning',
      priority: profile.einkommenssicherheit === 'volatil' ? 98 : 92,
      category: 'liquiditaet',
      checks: [
        'Reserve an echten Monatsausgaben ausrichten statt pauschal schätzen',
        'Bei Selbständigkeit eher neun bis zwölf Monate Reserve prüfen',
        'Zusätzliche Investments erst nach Erreichen des Sicherheitsniveaus erhöhen',
      ],
      productHints: ['Sparkonto oder Tagesgeld für den Sicherheitsbaustein prüfen'],
      href: '/app/profil',
      actionLabel: 'Reserve im Profil prüfen',
    }),
  },
  {
    id: 'retirement-gap',
    when: ({ activeAnalyse }) => activeAnalyse.rentenlueckeAbPension > 0,
    build: ({ activeAnalyse }) => ({
      id: 'retirement-gap',
      title: 'Ruhestands-Einkommen statt nur Endvermögen planen',
      body: 'Die Projektion zeigt noch eine Lücke zwischen gewünschtem Ruhestandsbudget und modellierten AHV-, PK- und Kapitalleistungen.',
      impact: `Modellierte Rentenlücke ab Pension: ${formatCurrency(activeAnalyse.rentenlueckeAbPension)} pro Jahr.`,
      tone: 'warning',
      priority: 96,
      category: 'vorsorge',
      checks: [
        'AHV, PK-Rente und Kapitalbezug gemeinsam statt isoliert betrachten',
        'Frühpensionierung und gewünschte Ruhestandsausgaben abstimmen',
        '3a- und PK-Bezüge zeitlich staffeln und steuerlich modellieren',
      ],
      href: '/app/varianten',
      actionLabel: 'Pensionsvariante ausbauen',
      externalUrl: AHV_ESCAL_URL,
      externalLabel: 'AHV-Rentenschätzer öffnen',
    }),
  },
  {
    id: '3a',
    when: ({ profile, activeVariante }) => activeVariante.sparrate3a < (profile.anstellungsart === 'selbstaendig' ? 35280 : 7258) * 0.8,
    build: ({ profile, activeVariante }) => ({
      id: '3a',
      title: 'Säule 3a systematisch nutzen',
      body: 'Die aktive Variante lässt noch steuerbegünstigtes 3a-Potenzial liegen. Für die Schweiz ist das einer der direktesten Hebel auf Steuern und Vorsorge.',
      impact: `Aktuell geplant: ${formatCurrency(activeVariante.sparrate3a)} pro Jahr bei ${formatPercent(profile.grenzsteuersatz || 18)} Grenzsteuersatz.`,
      tone: 'warning',
      priority: 90,
      category: 'vorsorge',
      checks: [
        'Jahresbeitrag an Erwerbssituation und Liquidität anpassen',
        'Mehrere 3a-Konten für spätere Staffelung prüfen',
        '3a gegen PK-Einkauf und freies Sparen sauber priorisieren',
      ],
      productHints: ['3a-Konto oder 3a-Wertschriftenlösung vergleichen'],
      href: '/app/varianten',
      actionLabel: '3a in Varianten ergänzen',
    }),
  },
  {
    id: 'pk-einkauf',
    when: ({ profile, activeAnalyse }) =>
      profile.pkEinkaufspotenzial > 0 &&
      profile.grenzsteuersatz >= 15 &&
      activeAnalyse.monatlicherUeberschussHeute > 0,
    build: ({ profile, activeAnalyse }) => ({
      id: 'pk-einkauf',
      title: 'PK-Einkauf im Gesamtbild prüfen',
      body: 'Der PK-Einkauf sollte nicht nur wegen der Steuer attraktiv wirken. Entscheidend sind auch Bezugsstrategie, Liquidität und die bereits gebundene Vermögensquote.',
      impact: `Potenzial laut Profil: ${formatCurrency(profile.pkEinkaufspotenzial)}. Modellierter Monatsüberschuss: ${formatCurrency(activeAnalyse.monatlicherUeberschussHeute)}.`,
      tone: 'success',
      priority: 84,
      category: 'steuern',
      checks: [
        'Einkaufspotenzial, Reglement und Sperrfristen verifizieren',
        'PK-Einkauf gegen 3a, ETF-Sparen und Hypo-Amortisation vergleichen',
        'Kapitalbezug und Pensionierungsalter in derselben Variante mitrechnen',
      ],
      href: '/app/profil',
      actionLabel: 'PK-Daten prüfen',
    }),
  },
  {
    id: 'home-affordability',
    when: ({ profile, activeAnalyse }) => profile.hypothek > 0 && activeAnalyse.tragbarkeitStatus !== 'stabil',
    build: ({ activeAnalyse, profile }) => ({
      id: 'home-affordability',
      title: 'Tragbarkeit und Amortisation neu kalibrieren',
      body: 'Die Immobilienlogik ist angespannt. Für die Schweiz muss Tragbarkeit gegen Steuern, Liquidität und Amortisationsform gleichzeitig bewertet werden.',
      impact: `Modellierte Tragbarkeit: ${formatPercent(activeAnalyse.tragbarkeitQuote * 100)} (${activeAnalyse.tragbarkeitStatus}).`,
      tone: 'warning',
      priority: 88,
      category: 'schulden',
      checks: [
        `${profile.indirekteAmortisation ? 'Indirekte' : 'Direkte'} Amortisation mit Steuerwirkung vergleichen`,
        'Eigenmietwert, Zinsen und Unterhaltskosten gemeinsam beurteilen',
        'Refinanzierung und SARON/Festhypothek nicht isoliert entscheiden',
      ],
      productHints: ['Hypothekarmodell und 3a-Nutzung zusammen prüfen'],
      href: '/app/profil',
      actionLabel: 'Immobilienbasis prüfen',
    }),
  },
  {
    id: 'household',
    when: ({ profile }) => profile.partnerEinkommen > 0 || profile.haushaltsmodell !== 'single' || profile.anzahlKinder > 0,
    build: ({ profile }) => ({
      id: 'household',
      title: 'Haushalts- statt Einzelsicht sauber abbilden',
      body: 'Bei Paaren, Konkubinat oder Kindern sind Vermögen, Ausgaben und Risiken nur gemeinsam belastbar planbar.',
      impact: `Haushaltsmodell: ${profile.haushaltsmodell}. Kinder im Profil: ${profile.anzahlKinder}.`,
      tone: 'primary',
      priority: 82,
      category: 'vermoegen',
      checks: [
        'Partner-Einkommen und gemeinsame Vermögen vollständig erfassen',
        'Kinder- und Betreuungskosten im Cashflow hinterlegen',
        'Begünstigung und Todesfallabsicherung für den Haushalt mitdenken',
      ],
      href: '/app/profil',
      actionLabel: 'Haushaltsdaten ergänzen',
    }),
  },
  {
    id: 'risk-cover',
    when: ({ activeAnalyse }) => activeAnalyse.risikoHinweise.length > 0,
    build: ({ activeAnalyse }) => ({
      id: 'risk-cover',
      title: 'Risikoplanung ergänzen',
      body: 'Die Planung enthält noch offene Erwerbs-, Todesfall- oder Liquiditätsrisiken. Ohne diese Sicht ist der Plan nur für den Idealfall robust.',
      impact: `${activeAnalyse.risikoHinweise[0] ?? 'Mehrere Risikofelder sind noch offen.'}`,
      tone: 'warning',
      priority: 86,
      category: 'vorsorge',
      checks: [
        'Erwerbsunfähigkeits- und Todesfallleistungen grob quantifizieren',
        'Reserve, Haushalt und Absicherung gemeinsam statt separat prüfen',
        'Vor allem bei Kindern oder Einverdiener-Situationen Mindestschutz definieren',
      ],
      href: '/app/profil',
      actionLabel: 'Risikoschutz ergänzen',
    }),
  },
  {
    id: 'investing',
    when: ({ profile, activeVariante, activeAnalyse }) =>
      profile.liquiditaet >= profile.notgroschenZiel &&
      activeVariante.sparrateWertschriften === 0 &&
      activeAnalyse.monatlicherUeberschussHeute > 0,
    build: ({ activeAnalyse }) => ({
      id: 'investing',
      title: 'Freies Vermögen systematisch investieren',
      body: 'Die Reserve steht. Ohne laufende Wertschriften-Sparrate bleibt freies Vermögen im Modell untergenutzt.',
      impact: `Aktuell frei investierbares Vermögen: ${formatCurrency(activeAnalyse.freiesInvestierbaresVermoegen)}.`,
      tone: 'primary',
      priority: 74,
      category: 'vermoegen',
      checks: [
        'Monatliche ETF- oder Depot-Sparrate aus echtem Überschuss definieren',
        'Gebundenes Vermögen aus PK/3a gegen freies Vermögen balancieren',
        'Aktienquote mit Horizont und Verlusttoleranz abgleichen',
      ],
      productHints: ['ETF-Sparplan oder breit diversifizierte Depotlösung prüfen'],
      href: '/app/varianten',
      actionLabel: 'Anlagestrategie ergänzen',
    }),
  },
  {
    id: 'self-employed',
    when: ({ profile }) => profile.anstellungsart === 'selbstaendig',
    build: ({ profile }) => ({
      id: 'self-employed',
      title: 'Selbständigkeit separat modellieren',
      body: 'Bei Selbständigkeit reichen Standardannahmen für AHV, Reserve und Vorsorge meist nicht. Die Planungslogik muss Schwankungen und fehlende PK mitdenken.',
      impact: `Aktuell hinterlegte Reserve für Selbständigkeit: ${profile.selbststaendigReserveMonate} Monate.`,
      tone: 'warning',
      priority: 80,
      category: 'liquiditaet',
      checks: [
        'Geschäfts- und Privatliquidität sauber trennen',
        '3a- und Vorsorgebedarf ohne Arbeitgeberbeiträge neu bewerten',
        'Volatilität des Einkommens direkt in die Reservehöhe übersetzen',
      ],
      href: '/app/profil',
      actionLabel: 'Selbständigkeit prüfen',
    }),
  },
  {
    id: 'second-variant',
    when: ({ variantCount }) => variantCount < 2,
    build: () => ({
      id: 'second-variant',
      title: 'Mindestens eine Gegenvariante bauen',
      body: 'Eine einzige Strategie zeigt eine Richtung, aber keine Entscheidung. Die neue Modelllogik wird erst im Vergleich richtig nützlich.',
      impact: 'Mehr Klarheit bei Cashflow, Ruhestand, Steuern und Tragbarkeit.',
      tone: 'success',
      priority: 68,
      category: 'vermoegen',
      checks: [
        'Defensive und ambitionierte Variante nebeneinander aufsetzen',
        'PK-Einkauf, 3a, ETF-Sparen und Amortisation gegeneinander testen',
        'Frühpensionierung und Kapitalbezug separat modellieren',
      ],
      href: '/app/varianten',
      actionLabel: 'Gegenvariante erstellen',
    }),
  },
];

const FALLBACK_RECOMMENDATION: DashboardRecommendation = {
  id: 'refine',
  title: 'Strategie weiter schärfen',
  body: 'Die Ausgangslage ist stimmig. Jetzt lohnt sich die Verfeinerung von Cashflow, Vorsorgebezug, Haushaltslogik und den priorisierten Massnahmen.',
  impact: 'Die aktuelle Projektion ist breiter als zuvor, lebt aber von guten Eingaben.',
  tone: 'success',
  priority: 50,
  category: 'vermoegen',
  checks: [
    'Cashflow und Monatsausgaben regelmässig aktualisieren',
    'AHV, PK und 3a nicht nur auf Endvermögen reduzieren',
    'Empfehlungen nach grösseren Lebensereignissen neu rechnen',
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
        impact: `Aktuelle Projektion bis ${context.activeVariante.retirementAge}: ${formatCurrency(context.activeAnalyse.endvermoegen)}.`,
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
