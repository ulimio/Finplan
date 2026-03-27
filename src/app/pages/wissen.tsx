import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/card'
import { Badge } from '../components/badge'
import { Button } from '../components/button'
import {
  BookOpen,
  TrendingUp,
  Shield,
  PiggyBank,
  Home,
  FileText,
  Calculator,
  Landmark,
  Users,
  ChevronRight,
  Search,
  X,
} from 'lucide-react'

interface WissensAbschnitt {
  titel: string
  inhalt: string[]
}

interface WissensArtikel {
  id: string
  titel: string
  beschreibung: string
  kategorie: 'vorsorge' | 'steuern' | 'vermoegen' | 'immobilien' | 'grundlagen'
  lesedauer: number
  schwierigkeitsgrad: 'einfach' | 'mittel' | 'fortgeschritten'
  icon: React.ComponentType<{ className?: string }>
  kernpunkte: string[]
  abschnitte: WissensAbschnitt[]
  naechsteSchritte: string[]
}

const artikelTeil1: WissensArtikel[] = [
  {
    id: 'saule-3a-basics',
    titel: 'Säule 3a: Grundlagen der privaten Vorsorge',
    beschreibung: 'Was die gebundene Selbstvorsorge leistet, wer einzahlen darf und warum die Säule 3a steuerlich so wichtig ist.',
    kategorie: 'vorsorge',
    lesedauer: 7,
    schwierigkeitsgrad: 'einfach',
    icon: PiggyBank,
    kernpunkte: [
      'Die Säule 3a ist die gebundene private Vorsorge innerhalb des Schweizer Drei-Säulen-Systems.',
      'Einzahlungen können in der Steuererklärung abgezogen werden, solange die gesetzlichen Voraussetzungen erfüllt sind.',
      'Für 2026 bleiben die Höchstabzüge gemäss ESTV unverändert.',
    ],
    abschnitte: [
      {
        titel: 'Worum es geht',
        inhalt: [
          'Die Säule 3a ergänzt AHV und berufliche Vorsorge. Sie soll helfen, Versorgungslücken im Alter, bei Invalidität oder im Todesfall zu schliessen.',
          'Der grosse Unterschied zu normalem Sparen liegt in der Bindung: Das Geld ist nicht frei verfügbar, dafür wird die Vorsorge steuerlich gefördert.',
        ],
      },
      {
        titel: 'Wie die 3a praktisch funktioniert',
        inhalt: [
          'Einzahlen dürfen Personen mit AHV-pflichtigem Erwerbseinkommen. Wer angestellt ist und einer Pensionskasse angeschlossen ist, hat einen anderen Höchstbetrag als Selbstständigerwerbende ohne Pensionskasse.',
          'Für das Steuerjahr 2026 bleiben die Maximalbeträge gemäss ESTV unverändert. In der Praxis ist die 3a deshalb einer der direktesten Hebel, um steuerbares Einkommen zu reduzieren und gleichzeitig Vorsorgevermögen aufzubauen.',
          'Das Guthaben kann als Konto, Wertschriftenlösung oder Versicherungslösung geführt werden. Für viele Nutzer ist ein 3a-Konto oder eine kostengünstige Wertschriftenlösung transparenter als ein komplexes Versicherungsprodukt.',
        ],
      },
      {
        titel: 'Wann ein Bezug möglich ist',
        inhalt: [
          'Die Säule 3a ist nicht beliebig verfügbar. Vorzeitige Bezüge sind nur in gesetzlich definierten Fällen vorgesehen, zum Beispiel für selbstbewohntes Wohneigentum, den Schritt in die Selbstständigkeit, den endgültigen Wegzug aus der Schweiz oder bei Invalidität.',
          'Beim Bezug wird das Guthaben separat vom übrigen Einkommen besteuert. Gerade deshalb lohnt sich bei mehreren 3a-Gefässen oft eine gestaffelte Auszahlung über mehrere Jahre.',
        ],
      },
    ],
    naechsteSchritte: [
      'Prüfe, ob du den 3a-Höchstbetrag dieses Jahr ausschöpfen willst.',
      'Vergleiche Konto- und Wertschriftenlösungen nach Kosten, Anlagestrategie und Flexibilität.',
      'Plane mehrere 3a-Gefässe, wenn du einen späteren gestaffelten Bezug offenhalten willst.',
    ],
  },
  {
    id: 'bvg-verstehen',
    titel: 'BVG-Guthaben verstehen und optimieren',
    beschreibung: 'Wie die zweite Säule aufgebaut ist, was dein PK-Guthaben aussagt und welche Stellhebel du wirklich beeinflussen kannst.',
    kategorie: 'vorsorge',
    lesedauer: 8,
    schwierigkeitsgrad: 'mittel',
    icon: Shield,
    kernpunkte: [
      'Die berufliche Vorsorge ist die zweite Säule und soll zusammen mit der AHV die Fortsetzung der gewohnten Lebenshaltung unterstützen.',
      'Nicht nur das Guthaben zählt, sondern auch Sparbeiträge, Risikoleistungen, Umwandlungssatz und Einkaufspotenzial.',
      'Die Pensionskasse ist oft einer der grössten Vermögensbausteine, wird aber in der persönlichen Planung unterschätzt.',
    ],
    abschnitte: [
      {
        titel: 'Was dein PK-Guthaben bedeutet',
        inhalt: [
          'Das BVG-Guthaben ist nicht einfach ein Sparkonto. Es ist Teil eines Vorsorgesystems, das Altersleistungen sowie je nach Reglement auch Leistungen bei Invalidität und Todesfall abdeckt.',
          'Wer nur auf den aktuellen Kontostand schaut, übersieht oft wichtige Punkte: versicherter Lohn, Arbeitgeberbeiträge, Einkaufsmöglichkeiten, Verzinsung und die Frage, ob wesentliche Teile im Überobligatorium liegen.',
        ],
      },
      {
        titel: 'Worauf du in deinem Vorsorgeausweis achten solltest',
        inhalt: [
          'Relevant sind vor allem Altersguthaben, projected Altersrente, Sparbeiträge, Risikoleistungen, Freizügigkeitsleistung und ein mögliches Einkaufspotenzial.',
          'Ebenso wichtig ist die Trennung zwischen obligatorischem und überobligatorischem Teil. Gerade bei höherem Einkommen beeinflusst diese Unterscheidung die spätere Leistung und die Flexibilität beim Kapitalbezug.',
        ],
      },
      {
        titel: 'Wie du die zweite Säule sinnvoll einordnest',
        inhalt: [
          'Die Pensionskasse sollte nicht isoliert betrachtet werden. Sie gehört in die Gesamtplanung mit Liquidität, Wertschriften, Wohneigentum, Säule 3a und Steuerstrategie.',
          'Wenn du früh erkennst, wie gross deine PK im Verhältnis zum übrigen Vermögen wird, kannst du Anlageentscheidungen ausserhalb der Vorsorge ausgewogener treffen.',
        ],
      },
    ],
    naechsteSchritte: [
      'Lies deinen aktuellen Vorsorgeausweis nicht nur auf den Endbetrag, sondern auf Struktur und Leistungen.',
      'Prüfe, wie hoch dein Vorsorgeanteil im Verhältnis zu deinem frei verfügbaren Vermögen ist.',
      'Halte fest, ob du später eher Rente, Kapital oder eine Kombination bevorzugen würdest.',
    ],
  },
  {
    id: 'ahv-luecken',
    titel: 'AHV-Beitragslücken erkennen und schliessen',
    beschreibung: 'Warum AHV-Lücken teuer werden können und wie du sie früh erkennst, vermeidest oder innerhalb der Regeln nachzahlst.',
    kategorie: 'vorsorge',
    lesedauer: 7,
    schwierigkeitsgrad: 'einfach',
    icon: Users,
    kernpunkte: [
      'Für eine volle AHV-Altersrente sind volle Beitragsjahre entscheidend.',
      'Fehlende Beitragsjahre können zu einer Kürzung der Altersrente führen.',
      'Nicht bezahlte Beiträge können grundsätzlich nur für die letzten fünf Jahre nachgefordert werden.',
    ],
    abschnitte: [
      {
        titel: 'Warum AHV-Lücken so relevant sind',
        inhalt: [
          'Die AHV deckt den Existenzgrundbedarf und ist die Basis der Altersvorsorge in der Schweiz. Gerade deshalb wirken sich Lücken stärker aus, als viele vermuten.',
          'Wer nicht in jedem massgebenden Jahr Beiträge entrichtet oder angerechnet bekommt, riskiert eine gekürzte Altersrente. Laut BSV wird die Rente bei fehlenden Beitragsjahren anteilmässig gekürzt.',
        ],
      },
      {
        titel: 'Wie Lücken entstehen',
        inhalt: [
          'Typische Auslöser sind längere Auszeiten, fehlende Anmeldung als Nichterwerbstätige, nicht korrekt erfasste Selbstständigkeit oder der Zuzug in die Schweiz nach dem 20. Altersjahr.',
          'Wichtig ist die Unterscheidung zwischen Versicherungslücke und Beitragslücke. Nicht jede tiefere spätere Rente bedeutet, dass jemand etwas falsch gemacht hat; bei Einwanderung kann auch schlicht keine frühere Versicherung bestanden haben.',
        ],
      },
      {
        titel: 'Wie du vorbeugst und reagierst',
        inhalt: [
          'Praktisch heisst das: Kontoauszug anfordern, Erwerbspausen aktiv prüfen und bei Nichterwerbstätigkeit die Beitragspflicht nicht einfach als erledigt annehmen.',
          'Wenn eine Kasse feststellt, dass Beiträge fehlen, können diese in der Regel nur für die letzten fünf Jahre nachgefordert werden. Wer zu spät hinschaut, verliert also Gestaltungsspielraum.',
        ],
      },
    ],
    naechsteSchritte: [
      'Bestelle regelmässig einen AHV-Kontoauszug und prüfe ihn auf Vollständigkeit.',
      'Melde dich bei längeren Auszeiten oder Studienphasen aktiv als Nichterwerbstätige oder Nichterwerbstätiger an, falls nötig.',
      'Dokumentiere Erwerbsunterbrüche früh, damit du fehlende Jahre nicht erst kurz vor der Pension entdeckst.',
    ],
  },
  {
    id: 'pk-einkauf',
    titel: 'PK-Einkauf: Wann lohnt es sich?',
    beschreibung: 'Wann freiwillige Einkäufe in die Pensionskasse steuerlich attraktiv sind und wann sie eher Liquidität binden als echten Nutzen stiften.',
    kategorie: 'vorsorge',
    lesedauer: 9,
    schwierigkeitsgrad: 'fortgeschritten',
    icon: Calculator,
    kernpunkte: [
      'PK-Einkäufe können steuerlich attraktiv sein, weil sie das steuerbare Einkommen reduzieren.',
      'Ein Einkauf ist nur sinnvoll, wenn Reglement, Kapitalbezugshorizont und Gesamtvermögen dazu passen.',
      'Steuerersparnis allein genügt nicht als Entscheidungsgrundlage.',
    ],
    abschnitte: [
      {
        titel: 'Warum PK-Einkäufe beliebt sind',
        inhalt: [
          'Freiwillige Einkäufe erhöhen dein Vorsorgekapital und reduzieren im Einkaufsjahr das steuerbare Einkommen. Für Personen mit hohem Grenzsteuersatz kann das sehr attraktiv sein.',
          'Gleichzeitig ist das Geld nach dem Einkauf deutlich stärker gebunden als bei freiem Vermögen. Genau deshalb ist ein Einkauf nie nur eine Steuerfrage.',
        ],
      },
      {
        titel: 'Wann ein Einkauf eher sinnvoll ist',
        inhalt: [
          'Ein PK-Einkauf passt oft zu Personen mit hohem steuerbarem Einkommen, stabiler Liquidität, längerem Planungshorizont und einer Pensionskasse mit nachvollziehbaren Leistungen.',
          'Weniger überzeugend ist er, wenn du in naher Zukunft Wohneigentum finanzieren, ins Ausland ziehen oder einen grösseren Kapitalbezug planen möchtest. Auch ein schwaches Reglement oder tiefe Transparenz der Kasse können gegen einen Einkauf sprechen.',
        ],
      },
      {
        titel: 'Worauf du besonders achten solltest',
        inhalt: [
          'Wesentlich sind Einkaufspotenzial, Reglement, geplante Bezugsform, Sperrfristen rund um Kapitalbezüge sowie deine gesamte Vermögensstruktur.',
          'Wer fast sein gesamtes Vermögen in gebundenen Vorsorgegefässen aufbaut, kann steuerlich effizient, aber finanziell unflexibel unterwegs sein. Gute Planung verbindet deshalb Steuerersparnis, Liquidität und spätere Bezugsstrategie.',
        ],
      },
    ],
    naechsteSchritte: [
      'Prüfe dein offizielles Einkaufspotenzial und lies das Reglement deiner Vorsorgeeinrichtung.',
      'Vergleiche einen PK-Einkauf mit alternativen Verwendungen wie 3a, Wertschriftenaufbau oder Schuldentilgung.',
      'Plane Einkäufe nie isoliert, sondern zusammen mit deiner späteren Bezugsstrategie.',
    ],
  },
  {
    id: 'wef-vorbezug',
    titel: 'WEF-Vorbezug für Wohneigentum',
    beschreibung: 'Wie du Pensionskassengeld für selbstbewohntes Wohneigentum nutzen kannst und welche Folgen das für Vorsorge und Rückzahlung hat.',
    kategorie: 'vorsorge',
    lesedauer: 8,
    schwierigkeitsgrad: 'mittel',
    icon: Home,
    kernpunkte: [
      'WEF ist nur für selbstbewohntes Wohneigentum vorgesehen, nicht für eine Zweitwohnung.',
      'Ein Vorbezug ist grundsätzlich nur periodisch möglich und nach Alter 50 begrenzt.',
      'Ein Vorbezug schwächt in der Regel die Vorsorgeleistung und kann eine Rückzahlungspflicht auslösen.',
    ],
    abschnitte: [
      {
        titel: 'Was WEF ermöglicht',
        inhalt: [
          'Die Wohneigentumsförderung mit Mitteln der beruflichen Vorsorge erlaubt es, BVG-Gelder für den Erwerb oder die Erstellung von selbstbewohntem Wohneigentum einzusetzen.',
          'Gemäss BSV sind neben dem Vorbezug auch Verpfändungen möglich. Damit lässt sich entweder direkt Eigenkapital einbringen oder die Finanzierung gegenüber der Bank verbessern.',
        ],
      },
      {
        titel: 'Die wichtigsten Bedingungen',
        inhalt: [
          'Gefördert wird nur selbstgenutztes Wohneigentum. Ein Feriendomizil oder eine reine Kapitalanlage fällt nicht darunter.',
          'Der Vorbezug ist nicht beliebig oft möglich. Das BSV nennt insbesondere die Fünfjahresregel, Einschränkungen nach dem 50. Altersjahr und die Frist vor Entstehung des Anspruchs auf Altersleistungen.',
        ],
      },
      {
        titel: 'Welche Folgen du einrechnen musst',
        inhalt: [
          'Wer BVG-Kapital bezieht, reduziert typischerweise das Altersguthaben und damit oft auch spätere Rentenleistungen. Der Hauskauf fühlt sich dadurch kurzfristig leichter an, die Vorsorge wird aber empfindlicher.',
          'Beim Verkauf des Objekts kann eine Rückzahlungspflicht entstehen. Auch steuerlich ist der Vorbezug relevant, weil er separat besteuert wird und im Grundbuch eine Veräusserungsbeschränkung angemerkt werden kann.',
        ],
      },
    ],
    naechsteSchritte: [
      'Kläre mit deiner Pensionskasse, wie hoch ein zulässiger Vorbezug oder eine Verpfändung konkret ausfallen darf.',
      'Rechne die Auswirkung auf Altersleistungen nicht nur beim Hauskauf, sondern über den ganzen Planungshorizont.',
      'Prüfe, ob mehr freies Eigenkapital langfristig besser ist als ein tieferes Vorsorgeguthaben.',
    ],
  },
  {
    id: 'steuererklaerung-basics',
    titel: 'Steuererklärung optimieren: Die wichtigsten Abzüge',
    beschreibung: 'Welche Abzüge in der Praxis oft relevant sind und warum eine gute Steuererklärung mehr ist als das blosse Sammeln von Belegen.',
    kategorie: 'steuern',
    lesedauer: 7,
    schwierigkeitsgrad: 'einfach',
    icon: FileText,
    kernpunkte: [
      'Die Wirkung eines Abzugs hängt vom Grenzsteuersatz ab.',
      'Nicht jeder theoretische Abzug bringt in jedem Kanton oder in jeder Lebenslage denselben Nutzen.',
      'Strukturierte Unterlagen sind oft wertvoller als hektische Optimierung kurz vor Fristablauf.',
    ],
    abschnitte: [
      {
        titel: 'Worauf es in der Steuererklärung ankommt',
        inhalt: [
          'Steueroptimierung beginnt nicht bei exotischen Tricks, sondern bei den regelmässig relevanten Positionen: Berufskosten, Vorsorge, Schuldzinsen, Unterhaltskosten, Spenden oder Betreuungskosten, soweit sie in der jeweiligen Situation zulässig sind.',
          'Entscheidend ist, dass du deine Situation konsistent deklarierst. Viele gute Abzüge gehen nicht verloren, weil sie verboten wären, sondern weil Belege fehlen oder Sachverhalte unklar dargestellt sind.',
        ],
      },
      {
        titel: 'Welche Abzüge typischerweise relevant sind',
        inhalt: [
          'Für viele Haushalte sind Beiträge an die Säule 3a, Schuldzinsen, Fahr- oder Berufskosten, Versicherungsprämien im zulässigen Rahmen, Kinder- und Betreuungskosten oder werterhaltende Liegenschaftskosten die grossen Hebel.',
          'Welche Positionen tatsächlich greifen, hängt aber immer vom Kanton, vom Familienstand, vom Wohneigentum und von der Erwerbssituation ab. Gute Steuerplanung ist deshalb immer konkret und nicht rein allgemein.',
        ],
      },
      {
        titel: 'Warum gute Vorbereitung so viel bringt',
        inhalt: [
          'Wenn du Belege, Vermögensnachweise, PK- und 3a-Ausweise, Schuldensalden und Liegenschaftsdokumente laufend geordnet hältst, wird die Steuererklärung schneller, sauberer und belastbarer.',
          'Genau hier passt FinPlan als Arbeitsstruktur: Nicht nur am Ende deklarieren, sondern während des Jahres erkennen, welche Entscheidungen steuerlich relevant werden.',
        ],
      },
    ],
    naechsteSchritte: [
      'Lege für jedes Steuerjahr einen klaren Ablageort für Belege und Nachweise an.',
      'Identifiziere die zwei bis drei wichtigsten Abzüge in deiner persönlichen Situation.',
      'Nutze die Steuererklärung nicht nur rückblickend, sondern als Input für das nächste Finanzjahr.',
    ],
  },
]
const artikelTeil2: WissensArtikel[] = [
  {
    id: 'grenzsteuersatz',
    titel: 'Grenz- vs. Durchschnittssteuersatz',
    beschreibung: 'Warum gerade der Grenzsteuersatz für Vorsorge, Bonus, Zusatzeinkommen und steuerliche Entscheidungen so wichtig ist.',
    kategorie: 'steuern',
    lesedauer: 6,
    schwierigkeitsgrad: 'mittel',
    icon: Calculator,
    kernpunkte: [
      'Der Durchschnittssteuersatz sagt, wie stark das gesamte Einkommen im Schnitt belastet ist.',
      'Der Grenzsteuersatz zeigt, wie stark der nächste zusätzliche Franken oder ein zusätzlicher Abzug wirkt.',
      'Für Planung und Optimierung ist meist der Grenzsteuersatz relevanter als die Durchschnittsquote.',
    ],
    abschnitte: [
      {
        titel: 'Die zwei Sätze nicht verwechseln',
        inhalt: [
          'Viele Menschen überschätzen oder unterschätzen Steuereffekte, weil sie Durchschnitts- und Grenzsteuersatz verwechseln. Das führt zu schlechten Entscheidungen bei 3a, PK-Einkauf oder Bonusplanung.',
          'Der Durchschnittssteuersatz ist die Gesamtsteuer geteilt durch das gesamte steuerbare Einkommen. Der Grenzsteuersatz beschreibt dagegen die Belastung auf dem zusätzlichen Einkommen am Rand der Progression.',
        ],
      },
      {
        titel: 'Warum der Grenzsteuersatz praktisch wichtiger ist',
        inhalt: [
          'Wenn du 1\'000 Franken in die Säule 3a einzahlst oder 1\'000 Franken Zusatzlohn erhältst, ist für den unmittelbaren Effekt vor allem der Grenzsteuersatz relevant.',
          'Darum kann derselbe Abzug für zwei Personen ganz unterschiedlich wertvoll sein, obwohl beide nominell denselben Betrag abziehen.',
        ],
      },
      {
        titel: 'Wie du den Satz nutzen solltest',
        inhalt: [
          'Der Grenzsteuersatz ist kein Selbstzweck. Er ist ein Werkzeug, um Steuerwirkung, Liquidität und Vermögensbindung gemeinsam zu beurteilen.',
          'Eine steuerlich starke Massnahme bleibt nur dann gut, wenn sie auch zu deiner Vorsorge, deinem Cashflow und deinen Zielen passt.',
        ],
      },
    ],
    naechsteSchritte: [
      'Halte in FinPlan einen realistischen Grenzsteuersatz fest statt nur eine grobe Bauchzahl.',
      'Bewerte 3a, PK-Einkauf und Bonusplanung immer mit dem Grenzsteuersatz.',
      'Triff keine Entscheide nur wegen der Steuerersparnis, sondern im Gesamtbild.',
    ],
  },
  {
    id: 'kapitalbezug-steuern',
    titel: 'Kapitalbezug aus der Vorsorge: Steuern minimieren',
    beschreibung: 'Wie Kapitalleistungen aus PK und Säule 3a besteuert werden und warum die Staffelung von Bezügen so oft entscheidend ist.',
    kategorie: 'steuern',
    lesedauer: 10,
    schwierigkeitsgrad: 'fortgeschritten',
    icon: TrendingUp,
    kernpunkte: [
      'Kapitalleistungen aus Vorsorge werden getrennt vom übrigen Einkommen besteuert.',
      'Die Steuer ist reduziert, aber weiterhin progressiv; hohe Einmalbezüge können deshalb teuer werden.',
      'Gestaffelte Bezüge sind oft wirksamer als punktuelle Optimierung kurz vor der Pensionierung.',
    ],
    abschnitte: [
      {
        titel: 'Wie Kapitalbezüge steuerlich behandelt werden',
        inhalt: [
          'Kapitalleistungen aus der zweiten Säule und aus der Säule 3a werden in der Schweiz grundsätzlich getrennt vom übrigen Einkommen besteuert. Das ist ein zentraler Unterschied zur normalen Einkommensbesteuerung.',
          'Getrennt besteuert heisst aber nicht steuerfrei. Die Tarife sind reduziert, bleiben jedoch in vielen Kantonen progressiv. Wer viel in einem Jahr bezieht, erhöht deshalb die Steuer auf diesem Bezug deutlich.',
        ],
      },
      {
        titel: 'Warum Staffelung oft so viel bringt',
        inhalt: [
          'Wenn mehrere 3a-Konten oder unterschiedliche Vorsorgegefässe vorhanden sind, kann eine Verteilung über mehrere Steuerjahre die Progressionswirkung mindern.',
          'Das ist einer der Gründe, warum es sich oft lohnt, die Bezugsphase viele Jahre vor der Pensionierung zu planen und nicht erst kurz vor dem Austritt aus dem Erwerbsleben.',
        ],
      },
      {
        titel: 'Was ausser den Steuern ebenfalls wichtig ist',
        inhalt: [
          'Steueroptimierung ist nur ein Teil der Frage. Kapitalbezug versus Rente beeinflusst Langlebigkeitsrisiko, Anlageverantwortung, Erbschaftsplanung und Flexibilität.',
          'Eine gute Entscheidung verbindet deshalb Steuerperspektive, Ausgabenbedarf, übriges Vermögen und die Bereitschaft, Kapital selbst zu verwalten.',
        ],
      },
    ],
    naechsteSchritte: [
      'Führe mehrere 3a-Gefässe, wenn du später Staffelungsmöglichkeiten offenhalten willst.',
      'Plane Kapitalbezüge frühzeitig kantons- und jahresbezogen statt erst kurz vor der Pension.',
      'Vergleiche Steuerwirkung, Einkommenssicherheit und Flexibilität gemeinsam.',
    ],
  },
  {
    id: 'vermoegenssteuern',
    titel: 'Vermögenssteuern in der Schweiz',
    beschreibung: 'Wie Vermögenssteuern funktionieren, welche Vermögenswerte typischerweise erfasst werden und warum der Wohnkanton stark ins Gewicht fällt.',
    kategorie: 'steuern',
    lesedauer: 7,
    schwierigkeitsgrad: 'mittel',
    icon: Landmark,
    kernpunkte: [
      'Die Vermögenssteuer ist in der Schweiz kantonal und kommunal, nicht auf Bundesebene.',
      'Bewertet wird das Nettovermögen, also Vermögen minus abzugsfähige Schulden.',
      'Kanton und Gemeinde machen in der Praxis einen grossen Unterschied.',
    ],
    abschnitte: [
      {
        titel: 'Was überhaupt besteuert wird',
        inhalt: [
          'Zur Vermögenssteuer gehören typischerweise Bankguthaben, Wertschriften, Liegenschaften zum massgebenden Steuerwert und weitere Vermögenswerte. Schulden werden davon grundsätzlich abgezogen.',
          'Entscheidend ist also nicht der Blick auf einzelne Konten, sondern auf dein gesamtes steuerbares Nettovermögen.',
        ],
      },
      {
        titel: 'Warum der Wohnort so wichtig ist',
        inhalt: [
          'Die Vermögenssteuer wird von Kantonen und Gemeinden erhoben. Dadurch unterscheiden sich Tarife, Freibeträge und Bewertungsregeln teilweise deutlich.',
          'Wer viel Vermögen aufgebaut hat oder einen späteren Wohnsitzwechsel plant, sollte diese Unterschiede nicht nur bei der Pensionierung, sondern bereits während der Vermögensaufbauphase im Blick haben.',
        ],
      },
      {
        titel: 'Was in der Planung oft übersehen wird',
        inhalt: [
          'Viele fokussieren nur auf Einkommen und unterschätzen die laufende Wirkung steigenden Vermögens. Gerade bei hohen liquiden Mitteln, grossen Depots oder zusätzlichem Wohneigentum wird die Vermögenssteuer spürbar.',
          'Die richtige Reaktion ist meist nicht blinder Steuerdruck, sondern saubere Vermögensstruktur, Liquiditätsplanung und ein realistischer Blick auf die Standortfrage.',
        ],
      },
    ],
    naechsteSchritte: [
      'Führe dein Nettovermögen sauber und nicht nur die Summe deiner Vermögenswerte.',
      'Beobachte ab einem grösseren Depot oder bei mehreren Immobilien die laufende Vermögenssteuer bewusst.',
      'Prüfe Standortfragen nur dann, wenn sie wirklich in dein Lebensmodell passen.',
    ],
  },
  {
    id: 'asset-allocation',
    titel: 'Asset Allocation: Die richtige Vermögensaufteilung',
    beschreibung: 'Warum die Verteilung über Anlageklassen oft wichtiger ist als die Auswahl einzelner Produkte.',
    kategorie: 'vermoegen',
    lesedauer: 8,
    schwierigkeitsgrad: 'mittel',
    icon: TrendingUp,
    kernpunkte: [
      'Asset Allocation bestimmt Rendite, Schwankung und Krisenfestigkeit stärker als Einzelwetten.',
      'Eine gute Aufteilung muss zu Zeithorizont, Liquidität und Risikotragfähigkeit passen.',
      'Die beste Strategie ist meist diejenige, die du auch in unruhigen Phasen durchhältst.',
    ],
    abschnitte: [
      {
        titel: 'Was Asset Allocation eigentlich bedeutet',
        inhalt: [
          'Asset Allocation ist die Verteilung des Vermögens auf unterschiedliche Anlageklassen wie Liquidität, Obligationen, Aktien, Immobilien oder weitere Bausteine.',
          'Die Kernfrage lautet nicht: Welches Produkt ist im Moment am spannendsten? Sondern: Welche Struktur trägt dein Ziel über viele Jahre?',
        ],
      },
      {
        titel: 'Wie du eine passende Aufteilung findest',
        inhalt: [
          'Entscheidend sind Anlagehorizont, Einkommen, Sicherheitsbedarf, Notgroschen, bereits gebundenes Vorsorgevermögen und deine psychologische Reaktion auf Verluste.',
          'Wer sehr viel Vermögen in der Pensionskasse hat, trägt oft bereits implizit ein konservativeres Profil im frei investierbaren Vermögen. Auch das gehört in die Gesamtbetrachtung.',
        ],
      },
      {
        titel: 'Typische Fehler',
        inhalt: [
          'Häufige Fehler sind fehlende Liquiditätsreserve, zu hohe Einzelrisiken, hektisches Umschichten nach Kursbewegungen und Strategien, die nur in ruhigen Märkten angenehm wirken.',
          'Eine gute Allokation ist nicht spektakulär. Sie ist nachvollziehbar, wiederholbar und hält auch dann, wenn Märkte zwischenzeitlich unbequem werden.',
        ],
      },
    ],
    naechsteSchritte: [
      'Lege zuerst Notgroschen und gebundene Vorsorge offen, bevor du dein freies Anlageprofil definierst.',
      'Bestimme eine Zielallokation und halte schriftlich fest, warum sie zu dir passt.',
      'Vermeide Produktkäufe ohne klare Rolle im Gesamtportfolio.',
    ],
  },
  {
    id: 'risikoprofil',
    titel: 'Dein persönliches Risikoprofil bestimmen',
    beschreibung: 'Wie du zwischen theoretischer Risikobereitschaft und echter Risikotragfähigkeit unterscheidest.',
    kategorie: 'vermoegen',
    lesedauer: 6,
    schwierigkeitsgrad: 'einfach',
    icon: Shield,
    kernpunkte: [
      'Risikobereitschaft und Risikofähigkeit sind nicht dasselbe.',
      'Ein gutes Risikoprofil verbindet Zahlen, Verhalten und Zeithorizont.',
      'Zu aggressiv ist genauso problematisch wie zu defensiv.',
    ],
    abschnitte: [
      {
        titel: 'Warum Selbsteinschätzung oft nicht reicht',
        inhalt: [
          'Viele bezeichnen sich als dynamisch, solange Märkte steigen. Erst in echten Rückgängen zeigt sich, ob die Strategie mental und finanziell tragbar ist.',
          'Darum ist ein gutes Risikoprofil nie nur ein Bauchgefühl. Es verbindet Einkommen, Reserven, Verpflichtungen, Anlagehorizont und Verhalten unter Stress.',
        ],
      },
      {
        titel: 'Die zwei Ebenen des Risikos',
        inhalt: [
          'Risikofähigkeit beschreibt, wie viel Schwankung du dir objektiv leisten kannst. Risikobereitschaft beschreibt, wie viel Schwankung du subjektiv aushältst.',
          'Wenn diese beiden Ebenen stark auseinanderlaufen, entstehen schlechte Strategien: entweder zu ängstlich für die Ziele oder zu aggressiv für die Realität.',
        ],
      },
      {
        titel: 'Wie du dein Profil belastbar machst',
        inhalt: [
          'Stelle dir nicht nur die Frage nach der Wunschrendite, sondern auch nach dem Verhalten in einem Marktverlust von 20 oder 30 Prozent.',
          'Wer ein Profil sauber definiert, trifft später weniger impulsive Entscheidungen und kann die Asset Allocation disziplinierter durchhalten.',
        ],
      },
    ],
    naechsteSchritte: [
      'Beurteile dein Profil nicht nur nach Renditewunsch, sondern nach Verlusttoleranz.',
      'Verbinde Risikoprofil und Zeithorizont konsequent.',
      'Passe das Profil an, wenn sich Familie, Liquidität oder berufliche Stabilität verändern.',
    ],
  },
  {
    id: 'etf-vs-fonds',
    titel: 'ETFs vs. aktive Fonds: Was passt zu dir?',
    beschreibung: 'Ein nüchterner Vergleich zwischen passivem und aktivem Investieren aus Sicht von Kosten, Steuerung und Erwartung.',
    kategorie: 'vermoegen',
    lesedauer: 8,
    schwierigkeitsgrad: 'mittel',
    icon: TrendingUp,
    kernpunkte: [
      'ETFs sind häufig kostengünstig, transparent und breit diversifiziert.',
      'Aktive Fonds können sinnvoll sein, müssen ihren Mehrwert aber nach Kosten tatsächlich liefern.',
      'Für viele Privatanleger ist die Produktwahl weniger wichtig als die Disziplin beim Sparen und Durchhalten.',
    ],
    abschnitte: [
      {
        titel: 'Was ETFs stark macht',
        inhalt: [
          'ETFs bilden meist einen Index nach und bieten dadurch transparente Regeln, tiefe Kosten und breite Streuung. Gerade für langfristigen Vermögensaufbau ist das oft ein überzeugender Ausgangspunkt.',
          'Ihr grösster Vorteil ist nicht, dass sie immer am besten performen, sondern dass sie strukturell einfach, nachvollziehbar und effizient sind.',
        ],
      },
      {
        titel: 'Wann aktive Fonds Sinn machen können',
        inhalt: [
          'Aktive Fonds können sinnvoll sein, wenn ein Markt wirklich ineffizient ist, spezielle Risikosteuerung gewünscht wird oder ein Manager nachweisbar einen Mehrwert bringt.',
          'In der Praxis bleibt nach Gebühren und Steuern aber oft weniger Mehrwert übrig als auf Marketingfolien versprochen wird. Genau deshalb gehört die Kostenfrage immer an den Anfang.',
        ],
      },
      {
        titel: 'Die wichtigere Frage dahinter',
        inhalt: [
          'Viele Anleger verlieren zu viel Energie bei ETF versus Fonds und zu wenig bei Sparquote, Diversifikation und Durchhaltefähigkeit.',
          'Wenn die Portfolioarchitektur stimmt und die Kosten sauber kontrolliert sind, wird das Ergebnis langfristig oft stärker von Verhalten als vom Produktetikett bestimmt.',
        ],
      },
    ],
    naechsteSchritte: [
      'Vergleiche Produkte immer nach Gesamtkosten, Indexnähe, Komplexität und Rolle im Portfolio.',
      'Kaufe keinen aktiven Fonds nur wegen vergangener Outperformance.',
      'Setze zuerst die Strategie, dann erst die Produktwahl.',
    ],
  },
]
const artikelTeil3: WissensArtikel[] = [
  {
    id: 'rebalancing',
    titel: 'Portfolio-Rebalancing: Disziplin zahlt sich aus',
    beschreibung: 'Warum Rebalancing weniger mit Marktprognosen als mit sauberem Risikomanagement zu tun hat.',
    kategorie: 'vermoegen',
    lesedauer: 7,
    schwierigkeitsgrad: 'fortgeschritten',
    icon: Calculator,
    kernpunkte: [
      'Rebalancing bringt das Portfolio zurück auf die Zielallokation.',
      'Es ist ein Risikomanagement-Werkzeug, kein Versuch, den Markt zu timen.',
      'Zu häufiges Rebalancing kann unnötige Kosten und Komplexität erzeugen.',
    ],
    abschnitte: [
      {
        titel: 'Warum ein Portfolio aus der Balance gerät',
        inhalt: [
          'Wenn einzelne Anlageklassen stark steigen oder fallen, verschiebt sich dein Portfolio automatisch. Ein ursprünglich ausgewogenes Verhältnis kann dadurch viel riskanter oder viel defensiver werden als geplant.',
          'Genau deshalb reicht es nicht, einmal eine Allokation festzulegen und sie danach zu vergessen.',
        ],
      },
      {
        titel: 'Was Rebalancing leisten soll',
        inhalt: [
          'Beim Rebalancing verkaufst du relativ stark gelaufene Teile und stockst relativ schwache Teile auf, um die Zielstruktur wiederherzustellen.',
          'Der Sinn liegt nicht in Marktprognosen, sondern darin, dass dein Portfolio zu deinem Risikoprofil zurückkehrt. Das ist vor allem in längeren Hausse- oder Baissephasen entscheidend.',
        ],
      },
      {
        titel: 'Wie viel Rebalancing sinnvoll ist',
        inhalt: [
          'In der Praxis funktionieren klare Regeln meist besser als spontane Bauchentscheide, etwa periodisch oder bei definierten Abweichungen.',
          'Zu häufiges Rebalancing ist aber nicht automatisch besser. Gebühren, Steuern und Umsetzungsaufwand müssen im Verhältnis zum Nutzen stehen.',
        ],
      },
    ],
    naechsteSchritte: [
      'Lege eine einfache Rebalancing-Regel fest, die du tatsächlich umsetzt.',
      'Kontrolliere nicht täglich, sondern nach Plan.',
      'Verbinde Rebalancing mit deinem Risikoprofil und nicht mit kurzfristigen Schlagzeilen.',
    ],
  },
  {
    id: 'eigenheim-finanzierung',
    titel: 'Eigenheimfinanzierung: Die 4 goldenen Regeln',
    beschreibung: 'Worauf es bei Eigenkapital, Tragbarkeit, Reserven und Vorsorge wirklich ankommt, bevor du ein Haus oder eine Wohnung kaufst.',
    kategorie: 'immobilien',
    lesedauer: 9,
    schwierigkeitsgrad: 'einfach',
    icon: Home,
    kernpunkte: [
      'Nicht der maximal finanzierbare Kaufpreis ist entscheidend, sondern die langfristig tragbare Lösung.',
      'Eigenmittel, Tragbarkeit, Reserve und Vorsorge gehören immer zusammen.',
      'Ein Eigenheim kann Vermögensaufbau sein, aber auch Liquidität dauerhaft binden.',
    ],
    abschnitte: [
      {
        titel: 'Regel 1: Genügend echte Eigenmittel',
        inhalt: [
          'Banken prüfen bei Hypotheken sehr genau, wie solide die Eigenmittel sind. In der Praxis zählen nicht nur die Höhe, sondern auch Herkunft und Puffer nach dem Kauf.',
          'Wer beim Erwerb fast jede Reserve einsetzt, ist nach dem Eigentumsübergang oft verletzlicher als vorher. Darum ist Restliquidität mindestens so wichtig wie die Finanzierung selbst.',
        ],
      },
      {
        titel: 'Regel 2: Tragbarkeit mit Sicherheitsmarge',
        inhalt: [
          'Eine Hypothek muss nicht nur zum aktuellen Zins tragbar sein. Banken prüfen typischerweise mit kalkulatorischen Annahmen, weil die Finanzierung auch bei höherem Zinsumfeld funktionieren muss.',
          'Wenn der Kauf nur mit optimistischen Annahmen aufgeht, ist das kein starkes Argument für Eigentum, sondern ein Warnsignal.',
        ],
      },
      {
        titel: 'Regel 3 und 4: Unterhalt, Vorsorge und Lebensmodell',
        inhalt: [
          'Zum Eigentum gehören Nebenkosten, Unterhalt, Sanierungen und oft höhere gebundene Mittel. Diese Lasten werden in Kaufentscheidungen regelmässig unterschätzt.',
          'Gleichzeitig sollte die Finanzierung nicht dazu führen, dass du deine Vorsorge zu stark entleerst oder andere Lebensziele komplett blockierst. Ein gutes Eigenheim passt in dein Leben, nicht nur in die Bankberechnung.',
        ],
      },
    ],
    naechsteSchritte: [
      'Rechne den Kauf mit konservativer Tragbarkeit statt mit aktuellem Lockzins.',
      'Plane nach dem Erwerb einen spürbaren Liquiditätspuffer ein.',
      'Prüfe den Hauskauf immer zusammen mit Vorsorge, Familie und beruflicher Flexibilität.',
    ],
  },
  {
    id: 'hypothek-strategie',
    titel: 'Hypothekarstrategien im Vergleich',
    beschreibung: 'Was Festhypothek, SARON und Kombinationen leisten und welche Strategie zu welchem Risikoprofil passt.',
    kategorie: 'immobilien',
    lesedauer: 8,
    schwierigkeitsgrad: 'mittel',
    icon: Landmark,
    kernpunkte: [
      'Festhypotheken geben Planbarkeit, SARON-Hypotheken reagieren schneller auf das Zinsumfeld.',
      'Die richtige Strategie hängt von Budgetstabilität, Risikotoleranz und Planungshorizont ab.',
      'Mischmodelle können sinnvoll sein, wenn du nicht alles auf ein Zinsszenario setzen willst.',
    ],
    abschnitte: [
      {
        titel: 'Festhypothek: Sicherheit gegen Aufpreis',
        inhalt: [
          'Eine Festhypothek schafft Planbarkeit über die Laufzeit. Das ist besonders hilfreich, wenn dein Budget eng ist oder du Zinsschwankungen schlecht tragen kannst.',
          'Der Preis für diese Sicherheit ist, dass du in Phasen sinkender Zinsen nicht ohne Weiteres profitierst und dich für die Laufzeit bindest.',
        ],
      },
      {
        titel: 'SARON: Flexibler, aber nicht entspannter',
        inhalt: [
          'SARON-Lösungen reagieren deutlich direkter auf das Zinsumfeld. Das kann vorteilhaft sein, wenn Zinsen tief bleiben oder sinken.',
          'FINMA weist jedoch seit den jüngsten Zinsanstiegen ausdrücklich darauf hin, dass SARON-gebundene Finanzierungen Kreditnehmende einem erhöhten Zinsrisiko aussetzen können. Diese Strategie verlangt also echte Budgetreserven.',
        ],
      },
      {
        titel: 'Kombinationen als Mittelweg',
        inhalt: [
          'Viele Eigentümer fahren mit einer Aufteilung auf mehrere Tranchen sinnvoller als mit einer Alles-oder-nichts-Entscheidung.',
          'Eine Kombination kann Zinsrisiken streuen, ersetzt aber keine saubere Tragbarkeit. Auch die beste Struktur hilft wenig, wenn das Objekt nur unter Idealbedingungen finanzierbar ist.',
        ],
      },
    ],
    naechsteSchritte: [
      'Ordne deine Hypothek zuerst deinem Budget und erst dann deiner Zinsmeinung zu.',
      'Prüfe, ob eine Tranchierung dein Risiko besser abfedert.',
      'Teste dein Budget auch unter höheren Zinsen, bevor du dich für SARON-lastige Lösungen entscheidest.',
    ],
  },
  {
    id: 'amortisation',
    titel: 'Direkte vs. indirekte Amortisation',
    beschreibung: 'Wie sich die beiden Amortisationswege auf Steuern, Liquidität, Vorsorge und Zinsbelastung auswirken.',
    kategorie: 'immobilien',
    lesedauer: 7,
    schwierigkeitsgrad: 'mittel',
    icon: Calculator,
    kernpunkte: [
      'Direkte Amortisation reduziert die Hypothek laufend und senkt die Zinslast sofort.',
      'Indirekte Amortisation hält die Schuld länger bestehen, kann aber steuerlich und vorsorgeseitig interessant sein.',
      'Die bessere Lösung hängt von Steuersatz, Liquidität und Vorsorgestruktur ab.',
    ],
    abschnitte: [
      {
        titel: 'Was direkte Amortisation leistet',
        inhalt: [
          'Bei der direkten Amortisation zahlst du die Hypothek schrittweise zurück. Dadurch sinken Schuld und Zinskosten fortlaufend.',
          'Das ist einfach, transparent und reduziert die Verschuldung sichtbar. Gleichzeitig sinkt damit aber auch der steuerliche Schuldzinsenabzug.',
        ],
      },
      {
        titel: 'Wie indirekte Amortisation funktioniert',
        inhalt: [
          'Bei der indirekten Amortisation wird das Geld meist in die Säule 3a eingezahlt und später zur Tilgung verwendet. Die Hypothek bleibt währenddessen länger bestehen.',
          'Das kann steuerlich attraktiv sein, weil sowohl 3a-Abzug als auch höhere Schuldzinsen im Spiel bleiben. Gleichzeitig bleibt mehr Verschuldung bestehen und das Kapital ist gebunden.',
        ],
      },
      {
        titel: 'Wie du die richtige Wahl triffst',
        inhalt: [
          'Je höher dein Grenzsteuersatz und je solider deine Liquidität, desto interessanter kann indirekte Amortisation werden.',
          'Wenn dir Einfachheit, tieferes Schuldengefühl und sofort sinkende Zinslast wichtiger sind, ist direkte Amortisation oft überzeugender. Es ist keine Glaubensfrage, sondern eine Frage deiner Finanzarchitektur.',
        ],
      },
    ],
    naechsteSchritte: [
      'Vergleiche beide Varianten mit deinem realen Grenzsteuersatz und deiner Vorsorgesituation.',
      'Bewerte nicht nur Steuerersparnis, sondern auch gebundene Liquidität und Risikogefühl.',
      'Halte deine Amortisationsstrategie schriftlich fest statt sie Jahr für Jahr zufällig neu zu entscheiden.',
    ],
  },
  {
    id: '3-saulen-system',
    titel: 'Das Schweizer 3-Säulen-System erklärt',
    beschreibung: 'Wie AHV, berufliche Vorsorge und private Vorsorge zusammenwirken und warum keine Säule für sich allein genügt.',
    kategorie: 'grundlagen',
    lesedauer: 7,
    schwierigkeitsgrad: 'einfach',
    icon: BookOpen,
    kernpunkte: [
      'Die erste Säule deckt den Existenzbedarf, die zweite stützt den bisherigen Lebensstandard, die dritte ergänzt individuell.',
      'Eine gute Finanzplanung betrachtet alle drei Säulen gemeinsam.',
      'Viele Fehlentscheide entstehen, weil gebundene und freie Vermögensteile nicht zusammen gedacht werden.',
    ],
    abschnitte: [
      {
        titel: 'Die erste Säule',
        inhalt: [
          'Die AHV ist die staatliche Grundvorsorge. Sie soll den Existenzbedarf im Alter abdecken und funktioniert im Umlageverfahren.',
          'Ihre Stärke ist die breite Basis, ihre Grenze liegt in der begrenzten Leistungsfähigkeit. Für viele Haushalte reicht sie allein nicht, um den bisherigen Lebensstandard zu halten.',
        ],
      },
      {
        titel: 'Die zweite Säule',
        inhalt: [
          'Die berufliche Vorsorge ergänzt die AHV und soll zusammen mit ihr die Fortsetzung der gewohnten Lebenshaltung in angemessener Weise ermöglichen.',
          'Sie funktioniert kapitalgedeckt. Dadurch wird während des Erwerbslebens Vermögen aufgebaut, das später in Renten- oder Kapitalleistungen mündet.',
        ],
      },
      {
        titel: 'Die dritte Säule',
        inhalt: [
          'Die dritte Säule schafft individuellen Spielraum. Hier entscheidest du stärker selbst über Beiträge, Risiko, Anlageform und spätere Flexibilität.',
          'Gerade deshalb ist sie ein gutes Bindeglied zwischen Vorsorge und persönlicher Finanzplanung. Sie verbindet Steueroptimierung, Vermögensaufbau und langfristige Freiheit.',
        ],
      },
    ],
    naechsteSchritte: [
      'Betrachte AHV, PK und 3a nie isoliert.',
      'Unterscheide in deiner Planung klar zwischen gebundenem und frei verfügbarem Vermögen.',
      'Nutze die dritte Säule dort, wo sie deine Gesamtstrategie ergänzt und nicht nur steuerlich gut aussieht.',
    ],
  },
  {
    id: 'finanzplanung-schritte',
    titel: 'Die 5 Schritte der Finanzplanung',
    beschreibung: 'Ein praxistauglicher Ablauf von der Bestandsaufnahme bis zur laufenden Anpassung deines Plans.',
    kategorie: 'grundlagen',
    lesedauer: 6,
    schwierigkeitsgrad: 'einfach',
    icon: FileText,
    kernpunkte: [
      'Finanzplanung ist ein Prozess, kein einmaliges Dokument.',
      'Die Reihenfolge der Themen ist entscheidend: Überblick vor Optimierung.',
      'Ein guter Plan bleibt anpassbar, wenn sich das Leben verändert.',
    ],
    abschnitte: [
      {
        titel: 'Schritt 1 und 2: Überblick und Ziele',
        inhalt: [
          'Am Anfang stehen Zahlen und Prioritäten. Ohne saubere Bestandsaufnahme von Einkommen, Vermögen, Schulden, Vorsorge und Fixkosten bleibt jede Optimierung unscharf.',
          'Danach kommen Ziele: Sicherheit, Eigenheim, Flexibilität, Familienplanung, finanzielle Freiheit oder frühe Pensionierung. Ein Zielsystem ordnet Entscheidungen, statt nur Produkte zu sammeln.',
        ],
      },
      {
        titel: 'Schritt 3 und 4: Strategie und Umsetzung',
        inhalt: [
          'Erst wenn Ausgangslage und Ziele klar sind, wird die Strategie sinnvoll: Liquiditätsreserve, Anlagestruktur, Vorsorgebeiträge, Schuldenabbau und Steuerplanung.',
          'Dann folgt die Umsetzung in konkrete Regeln. Genau hier scheitern viele Pläne, weil sie zu abstrakt bleiben. Gute Planung endet nicht bei Einsichten, sondern bei Entscheidungen mit Termin und Betrag.',
        ],
      },
      {
        titel: 'Schritt 5: Überprüfen und anpassen',
        inhalt: [
          'Ein Finanzplan veraltet schnell, wenn Einkommen, Familie, Wohnen oder Steuersituation sich ändern. Deshalb braucht es periodische Reviews.',
          'Nicht jeder Monat verlangt eine Neuausrichtung. Aber wer nie überprüft, merkt Veränderungen oft erst dann, wenn sie teuer geworden sind.',
        ],
      },
    ],
    naechsteSchritte: [
      'Führe deine Zahlen in einer Struktur zusammen, bevor du an Feinoptimierung denkst.',
      'Leite aus jedem Ziel mindestens eine konkrete Regel oder Massnahme ab.',
      'Plane feste Review-Zeitpunkte, statt nur situativ zu reagieren.',
    ],
  },
  {
    id: 'notgroschen',
    titel: 'Der Notgroschen: Wie viel ist genug?',
    beschreibung: 'Warum der Notgroschen nicht einfach eine Faustregel ist, sondern zur Lebenslage und Risikostruktur passen muss.',
    kategorie: 'grundlagen',
    lesedauer: 5,
    schwierigkeitsgrad: 'einfach',
    icon: PiggyBank,
    kernpunkte: [
      'Der Notgroschen ist keine Anlage, sondern eine Sicherheitsreserve.',
      'Die richtige Höhe hängt von Einkommen, Jobstabilität, Familie und Verpflichtungen ab.',
      'Zu wenig Reserve zwingt oft zum Verkauf oder zur Verschuldung im falschen Moment.',
    ],
    abschnitte: [
      {
        titel: 'Wofür der Notgroschen da ist',
        inhalt: [
          'Ein Notgroschen fängt unerwartete Belastungen ab: Jobverlust, Krankheit, grössere Reparaturen, Umzug, Selbstbehalte oder Einkommensunterbrüche.',
          'Sein Zweck ist nicht Rendite, sondern Handlungsfähigkeit. Genau deshalb gehört er nicht in hochvolatile Anlagen.',
        ],
      },
      {
        titel: 'Wie viel sinnvoll sein kann',
        inhalt: [
          'Oft wird mit mehreren Monatsausgaben gerechnet. Das ist als Startpunkt brauchbar, aber keine perfekte Universallösung.',
          'Wer sehr stabiles Einkommen und tiefe Verpflichtungen hat, kommt oft mit weniger Reserve aus als ein Haushalt mit Kindern, Hypothek oder unsicherem Einkommen.',
        ],
      },
      {
        titel: 'Wo der Fehler oft liegt',
        inhalt: [
          'Viele bauen entweder gar keinen Puffer auf oder halten so viel Liquidität, dass langfristiger Vermögensaufbau blockiert wird.',
          'Gute Planung hält die Balance: genug Reserve für Stressphasen, aber nicht so viel ungenutztes Kapital, dass Ziele unnötig hinausgeschoben werden.',
        ],
      },
    ],
    naechsteSchritte: [
      'Berechne deinen Notgroschen anhand echter Monatskosten und nicht nur nach Gefühl.',
      'Passe die Reserve an, wenn Kinder, Wohneigentum oder berufliche Risiken zunehmen.',
      'Trenne Notgroschen klar von Investitionskapital.',
    ],
  },
]

const wissensartikel: WissensArtikel[] = [...artikelTeil1, ...artikelTeil2, ...artikelTeil3]

const kategorien = [
  { id: 'alle', label: 'Alle Themen', icon: BookOpen },
  { id: 'grundlagen', label: 'Grundlagen', icon: BookOpen },
  { id: 'vorsorge', label: 'Vorsorge', icon: PiggyBank },
  { id: 'steuern', label: 'Steuern', icon: FileText },
  { id: 'vermoegen', label: 'Vermögen', icon: TrendingUp },
  { id: 'immobilien', label: 'Immobilien', icon: Home },
] as const

function getSchwierigkeitColor(grad: WissensArtikel['schwierigkeitsgrad']) {
  switch (grad) {
    case 'einfach':
      return 'success'
    case 'mittel':
      return 'info'
    case 'fortgeschritten':
      return 'warning'
    default:
      return 'secondary'
  }
}

function getSchwierigkeitLabel(grad: WissensArtikel['schwierigkeitsgrad']) {
  switch (grad) {
    case 'einfach':
      return 'Einfach'
    case 'mittel':
      return 'Mittel'
    case 'fortgeschritten':
      return 'Fortgeschritten'
    default:
      return grad
  }
}

function getSearchText(artikel: WissensArtikel) {
  return [
    artikel.titel,
    artikel.beschreibung,
    ...artikel.kernpunkte,
    ...artikel.abschnitte.flatMap((abschnitt) => [abschnitt.titel, ...abschnitt.inhalt]),
    ...artikel.naechsteSchritte,
  ]
    .join(' ')
    .toLowerCase()
}

export function Wissen() {
  const [selectedKategorie, setSelectedKategorie] = useState<string>('alle')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArtikelId, setSelectedArtikelId] = useState<string | null>(wissensartikel[0]?.id ?? null)

  const filteredArtikel = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return wissensartikel.filter((artikel) => {
      const matchesKategorie = selectedKategorie === 'alle' || artikel.kategorie === selectedKategorie
      const matchesSearch =
        normalizedSearch.length === 0 || getSearchText(artikel).includes(normalizedSearch)

      return matchesKategorie && matchesSearch
    })
  }, [searchTerm, selectedKategorie])

  const artikelByKategorie = kategorien
    .filter((kategorie) => kategorie.id !== 'alle')
    .map((kategorie) => ({
      kategorie,
      artikel: filteredArtikel.filter((artikel) => artikel.kategorie === kategorie.id),
    }))
    .filter((gruppe) => gruppe.artikel.length > 0)

  const selectedArtikel =
    wissensartikel.find((artikel) => artikel.id === selectedArtikelId) ?? filteredArtikel[0] ?? null

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="mb-2 text-3xl text-foreground">Wissen</h1>
            <p className="text-muted-foreground">
              Fundiertes Wissen rund um Finanzplanung, Vorsorge und Vermögensaufbau in der Schweiz
            </p>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Artikel durchsuchen..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-lg border border-border bg-background py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {kategorien.map((kategorie) => {
              const Icon = kategorie.icon
              const isActive = selectedKategorie === kategorie.id

              return (
                <button
                  key={kategorie.id}
                  onClick={() => setSelectedKategorie(kategorie.id)}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {kategorie.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {selectedArtikel && (
          <Card className="mb-8 border-primary/20">
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <selectedArtikel.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl leading-tight">{selectedArtikel.titel}</CardTitle>
                    <p className="mt-3 max-w-3xl text-muted-foreground">{selectedArtikel.beschreibung}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getSchwierigkeitColor(selectedArtikel.schwierigkeitsgrad)}>
                    {getSchwierigkeitLabel(selectedArtikel.schwierigkeitsgrad)}
                  </Badge>
                  <Badge variant="secondary">{selectedArtikel.lesedauer} Min. Lesezeit</Badge>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedArtikelId(null)}>
                    <X className="mr-2 h-4 w-4" />
                    Schliessen
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <p className="mb-3 text-sm text-muted-foreground">Kernaussagen</p>
                <div className="grid gap-3 md:grid-cols-3">
                  {selectedArtikel.kernpunkte.map((punkt) => (
                    <div key={punkt} className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-foreground">
                      {punkt}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {selectedArtikel.abschnitte.map((abschnitt) => (
                  <div key={abschnitt.titel} className="rounded-2xl border border-border p-5">
                    <h3 className="text-lg text-foreground">{abschnitt.titel}</h3>
                    <div className="mt-3 space-y-3">
                      {abschnitt.inhalt.map((absatz) => (
                        <p key={absatz} className="leading-7 text-muted-foreground">
                          {absatz}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <p className="mb-3 text-sm text-muted-foreground">Sinnvolle nächste Schritte</p>
                <div className="space-y-3">
                  {selectedArtikel.naechsteSchritte.map((schritt) => (
                    <div key={schritt} className="rounded-xl border border-border bg-background p-4 text-sm text-foreground">
                      {schritt}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {filteredArtikel.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
              <p className="mb-2 text-foreground">Keine Artikel gefunden</p>
              <p className="text-sm text-muted-foreground">
                Versuche einen anderen Suchbegriff oder wähle eine andere Kategorie.
              </p>
            </CardContent>
          </Card>
        ) : selectedKategorie === 'alle' ? (
          <div className="space-y-8">
            {artikelByKategorie.map((gruppe) => {
              const KategorieIcon = gruppe.kategorie.icon

              return (
                <div key={gruppe.kategorie.id}>
                  <div className="mb-4 flex items-center gap-2">
                    <KategorieIcon className="h-5 w-5 text-primary" />
                    <h2 className="text-xl text-foreground">{gruppe.kategorie.label}</h2>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {gruppe.artikel.map((artikel) => {
                      const ArtikelIcon = artikel.icon

                      return (
                        <Card
                          key={artikel.id}
                          className={`transition-shadow hover:shadow-md ${
                            selectedArtikelId === artikel.id ? 'border-primary/40 shadow-md' : ''
                          }`}
                        >
                          <CardContent className="p-6">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                              <ArtikelIcon className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="mb-2 text-base text-foreground">{artikel.titel}</h3>
                            <p className="mb-4 text-sm text-muted-foreground">{artikel.beschreibung}</p>
                            <div className="mb-4 flex items-center gap-2">
                              <Badge variant={getSchwierigkeitColor(artikel.schwierigkeitsgrad)}>
                                {getSchwierigkeitLabel(artikel.schwierigkeitsgrad)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{artikel.lesedauer} Min.</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full"
                              onClick={() => setSelectedArtikelId(artikel.id)}
                            >
                              Artikel lesen
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredArtikel.map((artikel) => {
              const ArtikelIcon = artikel.icon

              return (
                <Card
                  key={artikel.id}
                  className={`transition-shadow hover:shadow-md ${
                    selectedArtikelId === artikel.id ? 'border-primary/40 shadow-md' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <ArtikelIcon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-base text-foreground">{artikel.titel}</h3>
                    <p className="mb-4 text-sm text-muted-foreground">{artikel.beschreibung}</p>
                    <div className="mb-4 flex items-center gap-2">
                      <Badge variant={getSchwierigkeitColor(artikel.schwierigkeitsgrad)}>
                        {getSchwierigkeitLabel(artikel.schwierigkeitsgrad)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{artikel.lesedauer} Min.</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => setSelectedArtikelId(artikel.id)}
                    >
                      Artikel lesen
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
