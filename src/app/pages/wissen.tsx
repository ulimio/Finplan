import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/card';
import { Badge } from '../components/badge';
import { Button } from '../components/button';
import {
  BookOpen, TrendingUp, Shield, PiggyBank, Home, FileText,
  Calculator, Landmark, Users, ChevronRight, Search, Filter
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface WissensArtikel {
  id: string;
  titel: string;
  beschreibung: string;
  kategorie: 'vorsorge' | 'steuern' | 'vermoegen' | 'immobilien' | 'grundlagen';
  lesedauer: number;
  schwierigkeitsgrad: 'einfach' | 'mittel' | 'fortgeschritten';
  icon: any;
}

// ============================================
// MOCK DATA
// ============================================

const wissensartikel: WissensArtikel[] = [
  // Vorsorge
  {
    id: 'saule-3a-basics',
    titel: 'Säule 3a: Grundlagen der privaten Vorsorge',
    beschreibung: 'Alles Wichtige zur Säule 3a – Beiträge, Limits, Steuervorteile und Bezugsmöglichkeiten.',
    kategorie: 'vorsorge',
    lesedauer: 5,
    schwierigkeitsgrad: 'einfach',
    icon: PiggyBank,
  },
  {
    id: 'bvg-verstehen',
    titel: 'BVG-Guthaben verstehen und optimieren',
    beschreibung: 'So funktioniert die 2. Säule: Obligatorium, Überobligatorium und Einkaufsmöglichkeiten.',
    kategorie: 'vorsorge',
    lesedauer: 7,
    schwierigkeitsgrad: 'mittel',
    icon: Shield,
  },
  {
    id: 'ahv-luecken',
    titel: 'AHV-Beitragslücken erkennen und schließen',
    beschreibung: 'Fehlende Beitragsjahre können die Rente kürzen – wie Sie Lücken vermeiden oder füllen.',
    kategorie: 'vorsorge',
    lesedauer: 6,
    schwierigkeitsgrad: 'einfach',
    icon: Users,
  },
  {
    id: 'pk-einkauf',
    titel: 'PK-Einkauf: Wann lohnt es sich?',
    beschreibung: 'Steuern sparen durch freiwillige Einkäufe in die Pensionskasse – Timing und Strategie.',
    kategorie: 'vorsorge',
    lesedauer: 8,
    schwierigkeitsgrad: 'fortgeschritten',
    icon: Calculator,
  },
  {
    id: 'wef-vorbezug',
    titel: 'WEF-Vorbezug für Wohneigentum',
    beschreibung: 'Vorsorgegelder für Eigenheim nutzen: Möglichkeiten, Risiken und Rückzahlungspflicht.',
    kategorie: 'vorsorge',
    lesedauer: 7,
    schwierigkeitsgrad: 'mittel',
    icon: Home,
  },

  // Steuern
  {
    id: 'steuererklaerung-basics',
    titel: 'Steuererklärung optimieren: Die wichtigsten Abzüge',
    beschreibung: 'Berufskosten, Versicherungen, Spenden – diese Abzüge sollten Sie kennen.',
    kategorie: 'steuern',
    lesedauer: 6,
    schwierigkeitsgrad: 'einfach',
    icon: FileText,
  },
  {
    id: 'grenzsteuersatz',
    titel: 'Grenz- vs. Durchschnittssteuersatz',
    beschreibung: 'Verstehen Sie, wie die Progression funktioniert und was das für Ihre Planung bedeutet.',
    kategorie: 'steuern',
    lesedauer: 5,
    schwierigkeitsgrad: 'mittel',
    icon: Calculator,
  },
  {
    id: 'kapitalbezug-steuern',
    titel: 'Kapitalbezug aus der Vorsorge: Steuern minimieren',
    beschreibung: 'Gestaffelte Bezüge, Wohnsitzwechsel und weitere Strategien zur Steueroptimierung.',
    kategorie: 'steuern',
    lesedauer: 9,
    schwierigkeitsgrad: 'fortgeschritten',
    icon: TrendingUp,
  },
  {
    id: 'vermoegenssteuern',
    titel: 'Vermögenssteuern in der Schweiz',
    beschreibung: 'Kantonale Unterschiede, Freibeträge und wie Vermögenswerte bewertet werden.',
    kategorie: 'steuern',
    lesedauer: 6,
    schwierigkeitsgrad: 'mittel',
    icon: Landmark,
  },

  // Vermögen
  {
    id: 'asset-allocation',
    titel: 'Asset Allocation: Die richtige Vermögensaufteilung',
    beschreibung: 'Aktien, Obligationen, Immobilien – wie Sie Ihr Vermögen sinnvoll diversifizieren.',
    kategorie: 'vermoegen',
    lesedauer: 7,
    schwierigkeitsgrad: 'mittel',
    icon: TrendingUp,
  },
  {
    id: 'risikoprofil',
    titel: 'Ihr persönliches Risikoprofil bestimmen',
    beschreibung: 'Konservativ, ausgewogen oder dynamisch? So finden Sie die passende Anlagestrategie.',
    kategorie: 'vermoegen',
    lesedauer: 5,
    schwierigkeitsgrad: 'einfach',
    icon: Shield,
  },
  {
    id: 'etf-vs-fonds',
    titel: 'ETFs vs. aktive Fonds: Was passt zu Ihnen?',
    beschreibung: 'Kosten, Performance, Flexibilität – ein objektiver Vergleich der beiden Ansätze.',
    kategorie: 'vermoegen',
    lesedauer: 8,
    schwierigkeitsgrad: 'mittel',
    icon: TrendingUp,
  },
  {
    id: 'rebalancing',
    titel: 'Portfolio-Rebalancing: Disziplin zahlt sich aus',
    beschreibung: 'Warum und wie oft Sie Ihr Portfolio anpassen sollten, um Ihr Risiko zu kontrollieren.',
    kategorie: 'vermoegen',
    lesedauer: 6,
    schwierigkeitsgrad: 'fortgeschritten',
    icon: Calculator,
  },

  // Immobilien
  {
    id: 'eigenheim-finanzierung',
    titel: 'Eigenheimfinanzierung: Die 4 goldenen Regeln',
    beschreibung: 'Eigenkapital, Tragbarkeit, Amortisation – was Sie vor dem Hauskauf wissen müssen.',
    kategorie: 'immobilien',
    lesedauer: 8,
    schwierigkeitsgrad: 'einfach',
    icon: Home,
  },
  {
    id: 'hypothek-strategie',
    titel: 'Hypothekarstrategien im Vergleich',
    beschreibung: 'Festhypothek, SARON, Kombination – welches Modell passt zu Ihrer Situation?',
    kategorie: 'immobilien',
    lesedauer: 7,
    schwierigkeitsgrad: 'mittel',
    icon: Landmark,
  },
  {
    id: 'amortisation',
    titel: 'Direkte vs. indirekte Amortisation',
    beschreibung: 'Vor- und Nachteile der beiden Amortisationsarten aus steuerlicher und finanzieller Sicht.',
    kategorie: 'immobilien',
    lesedauer: 6,
    schwierigkeitsgrad: 'mittel',
    icon: Calculator,
  },

  // Grundlagen
  {
    id: '3-saulen-system',
    titel: 'Das Schweizer 3-Säulen-System erklärt',
    beschreibung: 'AHV, BVG und private Vorsorge – so funktioniert das Vorsorgesystem der Schweiz.',
    kategorie: 'grundlagen',
    lesedauer: 6,
    schwierigkeitsgrad: 'einfach',
    icon: BookOpen,
  },
  {
    id: 'finanzplanung-schritte',
    titel: 'Die 5 Schritte der Finanzplanung',
    beschreibung: 'Von der Bestandsaufnahme bis zur Umsetzung – so gehen Sie strukturiert vor.',
    kategorie: 'grundlagen',
    lesedauer: 5,
    schwierigkeitsgrad: 'einfach',
    icon: FileText,
  },
  {
    id: 'notgroschen',
    titel: 'Der Notgroschen: Wie viel ist genug?',
    beschreibung: '3-6 Monatsausgaben als Reserve – warum Liquidität so wichtig ist.',
    kategorie: 'grundlagen',
    lesedauer: 4,
    schwierigkeitsgrad: 'einfach',
    icon: PiggyBank,
  },
];

// ============================================
// KATEGORIEN
// ============================================

const kategorien = [
  { id: 'alle', label: 'Alle Themen', icon: BookOpen },
  { id: 'grundlagen', label: 'Grundlagen', icon: BookOpen },
  { id: 'vorsorge', label: 'Vorsorge', icon: PiggyBank },
  { id: 'steuern', label: 'Steuern', icon: FileText },
  { id: 'vermoegen', label: 'Vermögen', icon: TrendingUp },
  { id: 'immobilien', label: 'Immobilien', icon: Home },
];

// ============================================
// MAIN COMPONENT
// ============================================

export function Wissen() {
  const [selectedKategorie, setSelectedKategorie] = useState<string>('alle');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter articles
  const filteredArtikel = wissensartikel.filter((artikel) => {
    const matchesKategorie = selectedKategorie === 'alle' || artikel.kategorie === selectedKategorie;
    const matchesSearch = 
      artikel.titel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artikel.beschreibung.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesKategorie && matchesSearch;
  });

  // Group by category
  const artikelByKategorie = kategorien
    .filter(k => k.id !== 'alle')
    .map(kat => ({
      kategorie: kat,
      artikel: filteredArtikel.filter(a => a.kategorie === kat.id),
    }))
    .filter(group => group.artikel.length > 0);

  const getSchwierigkeitColor = (grad: string) => {
    switch (grad) {
      case 'einfach': return 'success';
      case 'mittel': return 'info';
      case 'fortgeschritten': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="mb-2 text-3xl text-foreground">Wissen</h1>
            <p className="text-muted-foreground">
              Fundiertes Wissen rund um Finanzplanung, Vorsorge und Vermögensaufbau in der Schweiz
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Artikel durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Kategorie Filter */}
          <div className="flex flex-wrap gap-2">
            {kategorien.map((kat) => {
              const Icon = kat.icon;
              const isActive = selectedKategorie === kat.id;
              return (
                <button
                  key={kat.id}
                  onClick={() => setSelectedKategorie(kat.id)}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {kat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {filteredArtikel.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
              <p className="mb-2 text-foreground">Keine Artikel gefunden</p>
              <p className="text-sm text-muted-foreground">
                Versuchen Sie einen anderen Suchbegriff oder wählen Sie eine andere Kategorie
              </p>
            </CardContent>
          </Card>
        ) : selectedKategorie === 'alle' ? (
          // Grouped view
          <div className="space-y-8">
            {artikelByKategorie.map((group) => {
              const KatIcon = group.kategorie.icon;
              return (
                <div key={group.kategorie.id}>
                  <div className="mb-4 flex items-center gap-2">
                    <KatIcon className="h-5 w-5 text-primary" />
                    <h2 className="text-xl text-foreground">{group.kategorie.label}</h2>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {group.artikel.map((artikel) => {
                      const ArtikelIcon = artikel.icon;
                      return (
                        <Card key={artikel.id} className="transition-shadow hover:shadow-md">
                          <CardContent className="p-6">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                              <ArtikelIcon className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="mb-2 text-base text-foreground">{artikel.titel}</h3>
                            <p className="mb-4 text-sm text-muted-foreground">
                              {artikel.beschreibung}
                            </p>
                            <div className="mb-4 flex items-center gap-2">
                              <Badge variant={getSchwierigkeitColor(artikel.schwierigkeitsgrad)} className="capitalize">
                                {artikel.schwierigkeitsgrad}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {artikel.lesedauer} Min.
                              </span>
                            </div>
                            <Button variant="ghost" size="sm" className="w-full">
                              Artikel lesen
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Single category view
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredArtikel.map((artikel) => {
              const ArtikelIcon = artikel.icon;
              return (
                <Card key={artikel.id} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <ArtikelIcon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-base text-foreground">{artikel.titel}</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {artikel.beschreibung}
                    </p>
                    <div className="mb-4 flex items-center gap-2">
                      <Badge variant={getSchwierigkeitColor(artikel.schwierigkeitsgrad)} className="capitalize">
                        {artikel.schwierigkeitsgrad}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {artikel.lesedauer} Min.
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full">
                      Artikel lesen
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
