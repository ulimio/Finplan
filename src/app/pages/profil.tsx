import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/card';
import { Button } from '../components/button';
import { Select } from '../components/select';
import { InfoTooltip } from '../components/info-tooltip';
import { supabase } from '../../lib/supabase';
import { DEFAULT_PROFILE, formatCurrency, getProfileStorageKey, loadStoredProfile } from '../lib/finance-data';
import type { Ereignis, ProfilSnapshot } from '../lib/finance-data';

const KANTONE = [
  { value: 'ag', label: 'Aargau' },
  { value: 'be', label: 'Bern' },
  { value: 'bs', label: 'Basel-Stadt' },
  { value: 'ge', label: 'Genf' },
  { value: 'lu', label: 'Luzern' },
  { value: 'sg', label: 'St. Gallen' },
  { value: 'sz', label: 'Schwyz' },
  { value: 'vd', label: 'Waadt' },
  { value: 'zg', label: 'Zug' },
  { value: 'zh', label: 'Zürich' },
];

type SectionId = 'basis' | 'einkommen' | 'vermoegen' | 'vorsorge' | 'ziele' | 'ereignisse';

function sectionStatus(profile: ProfilSnapshot) {
  return {
    basis: profile.geburtsdatum && profile.kanton && profile.zivilstand ? 'complete' : 'incomplete',
    einkommen: profile.bruttoeinkommen > 0 && profile.monatlicheAusgaben > 0 ? 'complete' : 'incomplete',
    vermoegen: profile.liquiditaet >= 0 && profile.wertschriften >= 0 ? 'complete' : 'incomplete',
    schulden: profile.hypothek >= 0 && profile.konsumkredite >= 0 ? 'complete' : 'incomplete',
    vorsorge: profile.pkGuthaben >= 0 && profile.saule3aGesamt >= 0 && profile.gewuenschteJahresausgabenRuhestand > 0 ? 'complete' : 'incomplete',
    steuern: profile.kanton && (profile.grenzsteuersatz > 0 || profile.kirchensteuer !== undefined) ? 'complete' : 'incomplete',
    risiko: profile.invaliditaetsabsicherungJahr >= 0 && profile.todesfallabsicherungJahr >= 0 ? 'complete' : 'incomplete',
    ziele: profile.notgroschenZiel > 0 && profile.fruehpensionierungsAlter > 0 ? 'complete' : 'incomplete',
  } as ProfilSnapshot['sectionStatus'];
}

function buildInitialProfile(userId?: string): ProfilSnapshot {
  return {
    ...DEFAULT_PROFILE,
    ...loadStoredProfile(userId),
  };
}

function FieldLabel({ label, info }: { label: string; info?: string }) {
  return (
    <span className="flex items-center gap-2 text-sm text-foreground">
      <span>{label}</span>
      {info ? <InfoTooltip content={info} /> : null}
    </span>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step = 100,
  hint,
  info,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  hint?: string;
  info?: string;
}) {
  return (
    <label className="block space-y-1">
      <FieldLabel label={label} info={info} />
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        step={step}
        className="w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm"
      />
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = 'text',
  info,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  info?: string;
}) {
  return (
    <label className="block space-y-1">
      <FieldLabel label={label} info={info} />
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm"
      />
    </label>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
  info,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  info?: string;
}) {
  return (
    <div className="space-y-2">
      <FieldLabel label={label} info={info} />
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`rounded-lg border px-3 py-2 text-sm ${checked ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground'}`}
      >
        {checked ? 'Ja' : 'Nein'}
      </button>
    </div>
  );
}

function SectionShell({
  title,
  subtitle,
  status,
  open,
  onToggle,
  children,
}: {
  title: string;
  subtitle: string;
  status: 'complete' | 'incomplete' | 'skipped';
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <button type="button" onClick={onToggle} className="w-full text-left">
        <CardHeader className="mb-0 flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs ${status === 'complete' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
              {status === 'complete' ? 'vollständig' : 'offen'}
            </span>
            {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </CardHeader>
      </button>
      {open ? <CardContent className="mt-4">{children}</CardContent> : null}
    </Card>
  );
}

export function Profil({ userId }: { isLoggedIn: boolean; userId?: string }) {
  const [profile, setProfile] = useState<ProfilSnapshot>(() => buildInitialProfile(userId));
  const [activeSection, setActiveSection] = useState<SectionId>('basis');

  const progress = useMemo(() => {
    const values = Object.values(profile.sectionStatus);
    return Math.round((values.filter((entry) => entry === 'complete').length / values.length) * 100);
  }, [profile.sectionStatus]);

  const updateProfile = <K extends keyof ProfilSnapshot>(key: K, value: ProfilSnapshot[K]) => {
    setProfile((current) => {
      const next = { ...current, [key]: value };
      return { ...next, sectionStatus: sectionStatus(next) };
    });
  };

  const updateEvent = (id: string, updates: Partial<Ereignis>) => {
    setProfile((current) => {
      const lebensereignisse = current.lebensereignisse.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry));
      const next = { ...current, lebensereignisse };
      return { ...next, sectionStatus: sectionStatus(next) };
    });
  };

  const addEvent = () => {
    const event: Ereignis = {
      id: `e-${Date.now()}`,
      typ: 'sonstiges',
      jahr: new Date().getFullYear() + 1,
      label: 'Neues Ereignis',
    };
    updateProfile('lebensereignisse', [...profile.lebensereignisse, event]);
  };

  const removeEvent = (id: string) => {
    updateProfile('lebensereignisse', profile.lebensereignisse.filter((entry) => entry.id !== id));
  };

  useEffect(() => {
    const next = buildInitialProfile(userId);
    setProfile({ ...next, sectionStatus: sectionStatus(next) });
  }, [userId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(getProfileStorageKey(userId), JSON.stringify(profile));
    }
  }, [profile, userId]);

  useEffect(() => {
    if (!userId) return;
    const timeoutId = window.setTimeout(async () => {
      await supabase.from('profiles').upsert(
        {
          user_id: userId,
          data: profile,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
    }, 600);

    return () => window.clearTimeout(timeoutId);
  }, [profile, userId]);

  const hasPartnerContext = profile.haushaltsmodell !== 'single';
  const hasPropertyContext = profile.hypothek > 0 || profile.immobilienwert > 0;
  const hasMortgage = profile.hypothek > 0;
  const hasConsumerDebt = profile.konsumkredite > 0;
  const hasPkContext = profile.anstellungsart !== 'selbstaendig' || profile.pkGuthaben > 0;
  const selfEmploymentRelevant = profile.anstellungsart !== 'angestellt';
  const familyRiskRelevant = hasPartnerContext || profile.anzahlKinder > 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl text-foreground">Profil</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Die Eingabe ist jetzt geführt. Öffne jeweils nur den nächsten relevanten Bereich. Nicht passende Felder blenden wir aus.
          </p>
        </div>
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-right">
          <p className="text-xs text-muted-foreground">Vollständigkeit</p>
          <p className="text-2xl text-primary">{progress}%</p>
        </div>
      </div>

      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="py-5">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'basis', label: '1. Basis' },
              { id: 'einkommen', label: '2. Einkommen' },
              { id: 'vermoegen', label: '3. Vermögen' },
              { id: 'vorsorge', label: '4. Vorsorge' },
              { id: 'ziele', label: '5. Ziele' },
              { id: 'ereignisse', label: '6. Ereignisse' },
            ].map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id as SectionId)}
                className={`rounded-full px-4 py-2 text-sm ${activeSection === section.id ? 'bg-primary text-primary-foreground' : 'border border-border bg-background text-foreground'}`}
              >
                {section.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Tipp: Die kleinen `i`-Symbole erklären unklare Begriffe direkt im Formular.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <SectionShell
          title="1. Basis & Haushalt"
          subtitle="Starte mit den Angaben, die fast alle brauchen."
          status={profile.sectionStatus.basis}
          open={activeSection === 'basis'}
          onToggle={() => setActiveSection(activeSection === 'basis' ? 'einkommen' : 'basis')}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Vorname" value={profile.vorname} onChange={(value) => updateProfile('vorname', value)} />
            <TextField label="Nachname" value={profile.nachname} onChange={(value) => updateProfile('nachname', value)} />
            <TextField label="Geburtsdatum" type="date" value={profile.geburtsdatum} onChange={(value) => updateProfile('geburtsdatum', value)} />
            <Select
              label="Zivilstand"
              value={profile.zivilstand}
              onChange={(value) => updateProfile('zivilstand', value as ProfilSnapshot['zivilstand'])}
              options={[
                { value: 'ledig', label: 'Ledig' },
                { value: 'verheiratet', label: 'Verheiratet' },
                { value: 'geschieden', label: 'Geschieden' },
                { value: 'verwitwet', label: 'Verwitwet' },
              ]}
            />
            <Select label="Wohnkanton" value={profile.kanton} onChange={(value) => updateProfile('kanton', value)} options={KANTONE} />
            <Select
              label="Haushaltsmodell"
              value={profile.haushaltsmodell}
              onChange={(value) => updateProfile('haushaltsmodell', value as ProfilSnapshot['haushaltsmodell'])}
              options={[
                { value: 'single', label: 'Single' },
                { value: 'paar', label: 'Paar' },
                { value: 'konkubinat', label: 'Konkubinat' },
              ]}
            />
            <NumberField label="Kinder" value={profile.anzahlKinder} onChange={(value) => updateProfile('anzahlKinder', value)} step={1} />
            {hasPartnerContext ? (
              <NumberField
                label="Partner-Einkommen p.a."
                value={profile.partnerEinkommen}
                onChange={(value) => updateProfile('partnerEinkommen', value)}
                info="Bruttoeinkommen des Partners oder der Partnerin pro Jahr. Nur nötig, wenn ihr gemeinsam plant."
              />
            ) : null}
            {hasPartnerContext ? (
              <NumberField
                label="Partner-Vermögen"
                value={profile.partnerVermoegen}
                onChange={(value) => updateProfile('partnerVermoegen', value)}
                info="Nur das Vermögen, das für eure gemeinsame Planung relevant ist."
              />
            ) : null}
            <NumberField
              label="Monatsausgaben gesamt"
              value={profile.monatlicheAusgaben}
              onChange={(value) => updateProfile('monatlicheAusgaben', value)}
              info="Gesamte laufende Haushaltsausgaben pro Monat. Ideal sind alle regelmässigen Kosten zusammen: Wohnen, Krankenkasse, Essen, Mobilität, Versicherungen, Freizeit und Kinderkosten."
              hint="Wenn du es einfach halten willst: grobe echte Monatskosten des Haushalts eintragen."
            />
            <NumberField
              label="Wohnkosten / Monat"
              value={profile.wohnkostenMonat}
              onChange={(value) => updateProfile('wohnkostenMonat', value)}
              info="Miete oder laufende Wohnkosten. Bei Wohneigentum eher die laufende Belastung ohne Amortisation."
            />
            <NumberField
              label="Krankenkasse / Monat"
              value={profile.krankenkasseMonat}
              onChange={(value) => updateProfile('krankenkasseMonat', value)}
              info="Monatliche Prämien für Grund- und relevante Zusatzversicherungen."
            />
            <NumberField
              label="Betreuung / Monat"
              value={profile.betreuungskostenMonat}
              onChange={(value) => updateProfile('betreuungskostenMonat', value)}
              info="Krippe, Hort, Tagesmutter oder andere regelmässige Kinderbetreuung."
            />
            <NumberField
              label="Sonstige Fixkosten / Monat"
              value={profile.sonstigeFixkostenMonat}
              onChange={(value) => updateProfile('sonstigeFixkostenMonat', value)}
              info="Zum Beispiel Strom, Internet, Mobilität, Abos, Versicherungen oder wiederkehrende Verpflichtungen."
            />
          </div>
        </SectionShell>

        <SectionShell
          title="2. Einkommen & Erwerb"
          subtitle="Nur die Felder zeigen, die zu deiner Erwerbssituation passen."
          status={profile.sectionStatus.einkommen}
          open={activeSection === 'einkommen'}
          onToggle={() => setActiveSection(activeSection === 'einkommen' ? 'vermoegen' : 'einkommen')}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Anstellungsart"
              value={profile.anstellungsart}
              onChange={(value) => updateProfile('anstellungsart', value as ProfilSnapshot['anstellungsart'])}
              options={[
                { value: 'angestellt', label: 'Angestellt' },
                { value: 'selbstaendig', label: 'Selbständig' },
                { value: 'gemischt', label: 'Gemischt' },
              ]}
            />
            <Select
              label="Einkommenssicherheit"
              value={profile.einkommenssicherheit}
              onChange={(value) => updateProfile('einkommenssicherheit', value as ProfilSnapshot['einkommenssicherheit'])}
              options={[
                { value: 'stabil', label: 'Stabil' },
                { value: 'mittel', label: 'Mittel' },
                { value: 'volatil', label: 'Volatil' },
              ]}
            />
            <NumberField label="Bruttoeinkommen p.a." value={profile.bruttoeinkommen} onChange={(value) => updateProfile('bruttoeinkommen', value)} />
            <NumberField
              label="Variables Einkommen p.a."
              value={profile.variablesEinkommen}
              onChange={(value) => updateProfile('variablesEinkommen', value)}
              info="Bonus, Provision, Gewinnanteile oder andere schwankende Einkommensbestandteile."
            />
            <NumberField
              label="Einkommensentwicklung %"
              value={profile.einkommensentwicklung}
              onChange={(value) => updateProfile('einkommensentwicklung', value)}
              step={0.5}
              info="Erwartete jährliche Entwicklung. Lieber konservativ ansetzen."
            />
            {selfEmploymentRelevant ? (
              <NumberField
                label="Reserve für Selbständigkeit (Monate)"
                value={profile.selbststaendigReserveMonate}
                onChange={(value) => updateProfile('selbststaendigReserveMonate', value)}
                step={1}
                info="Wie viele Monate der Haushalt ohne neues Einkommen tragbar bleiben sollte."
              />
            ) : null}
          </div>
        </SectionShell>

        <SectionShell
          title="3. Vermögen, Schulden & Immobilie"
          subtitle="Schulden- und Immobilienfelder erscheinen nur, wenn sie relevant sind."
          status={profile.sectionStatus.vermoegen}
          open={activeSection === 'vermoegen'}
          onToggle={() => setActiveSection(activeSection === 'vermoegen' ? 'vorsorge' : 'vermoegen')}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <NumberField label="Liquidität" value={profile.liquiditaet} onChange={(value) => updateProfile('liquiditaet', value)} info="Girokonto, Sparkonto und sofort verfügbare Mittel." />
            <NumberField label="Wertschriften" value={profile.wertschriften} onChange={(value) => updateProfile('wertschriften', value)} info="Depotwerte ausserhalb von PK und 3a." />
            <NumberField label="Immobilienwert" value={profile.immobilienwert} onChange={(value) => updateProfile('immobilienwert', value)} info="Heutiger realistischer Wert oder Steuerwert der Immobilie." />
            <NumberField label="Sonstiges Vermögen" value={profile.sonstigesVermoegen} onChange={(value) => updateProfile('sonstigesVermoegen', value)} />
            <NumberField
              label="Säule 3b / freies Vorsorgevermögen"
              value={profile.saule3bVermoegen}
              onChange={(value) => updateProfile('saule3bVermoegen', value)}
              info="Freie Vorsorge oder Versicherungs-/Anlagewerte ausserhalb von PK und 3a."
            />
            <NumberField label="Hypothek" value={profile.hypothek} onChange={(value) => updateProfile('hypothek', value)} info="Nur ausfüllen, wenn tatsächlich eine Hypothek besteht." />
            {hasMortgage ? (
              <NumberField
                label="Hypothekarzins %"
                value={profile.hypothekZins}
                onChange={(value) => updateProfile('hypothekZins', value)}
                step={0.1}
                info="Aktueller Durchschnittszins deiner Hypothek."
              />
            ) : null}
            {hasPropertyContext ? (
              <NumberField
                label="Eigenmietwert p.a."
                value={profile.eigenmietwert}
                onChange={(value) => updateProfile('eigenmietwert', value)}
                info="Steuerlicher Eigenmietwert. Nur für Wohneigentum relevant."
              />
            ) : null}
            {hasPropertyContext ? (
              <NumberField
                label="Liegenschaftskosten p.a."
                value={profile.liegenschaftsKostenJahr}
                onChange={(value) => updateProfile('liegenschaftsKostenJahr', value)}
                info="Unterhalt, Nebenkosten, Rückstellungen oder wiederkehrende Immobilienkosten."
              />
            ) : null}
            {hasMortgage ? (
              <ToggleField
                label="Indirekte Amortisation"
                checked={profile.indirekteAmortisation}
                onChange={(value) => updateProfile('indirekteAmortisation', value)}
                info="Typisch via 3a. Relevanter Unterschied für Steuern und Liquidität."
              />
            ) : null}
            <NumberField label="Konsumkredite" value={profile.konsumkredite} onChange={(value) => updateProfile('konsumkredite', value)} />
            {hasConsumerDebt ? (
              <NumberField
                label="Konsumkreditzins %"
                value={profile.konsumkrediteZins}
                onChange={(value) => updateProfile('konsumkrediteZins', value)}
                step={0.5}
              />
            ) : null}
          </div>
        </SectionShell>

        <SectionShell
          title="4. Vorsorge, Steuern & Risiko"
          subtitle="Nur die Vorsorgefelder zeigen, die wirklich gebraucht werden."
          status={profile.sectionStatus.vorsorge}
          open={activeSection === 'vorsorge'}
          onToggle={() => setActiveSection(activeSection === 'vorsorge' ? 'ziele' : 'vorsorge')}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="AHV-Lücke bekannt"
              value={profile.ahvLuecke}
              onChange={(value) => updateProfile('ahvLuecke', value as ProfilSnapshot['ahvLuecke'])}
              options={[
                { value: 'ja', label: 'Ja' },
                { value: 'nein', label: 'Nein' },
                { value: 'unbekannt', label: 'Unbekannt' },
              ]}
            />
            <NumberField
              label="AHV-Rente p.a. (falls bekannt)"
              value={profile.ahvRenteJaehrlich}
              onChange={(value) => updateProfile('ahvRenteJaehrlich', value)}
              info="Nur wenn du schon eine Schätzung oder einen Auszug hast."
            />
            {hasPkContext ? <NumberField label="PK-Guthaben" value={profile.pkGuthaben} onChange={(value) => updateProfile('pkGuthaben', value)} /> : null}
            {hasPkContext ? (
              <NumberField
                label="PK-Einkaufspotenzial"
                value={profile.pkEinkaufspotenzial}
                onChange={(value) => updateProfile('pkEinkaufspotenzial', value)}
                info="Nur ausfüllen, wenn du das Potenzial aus dem Vorsorgeausweis kennst."
              />
            ) : null}
            {hasPkContext ? <NumberField label="PK-Umwandlungssatz %" value={profile.pkRenteUmwandlungssatz} onChange={(value) => updateProfile('pkRenteUmwandlungssatz', value)} step={0.1} /> : null}
            {hasPkContext ? <NumberField label="PK AN-Beitrag p.a." value={profile.pkBeitragArbeitnehmer} onChange={(value) => updateProfile('pkBeitragArbeitnehmer', value)} /> : null}
            {hasPkContext ? <NumberField label="PK AG-Beitrag p.a." value={profile.pkBeitragArbeitgeber} onChange={(value) => updateProfile('pkBeitragArbeitgeber', value)} /> : null}
            <NumberField label="Freizügigkeitsguthaben" value={profile.freizuegigkeitsguthaben} onChange={(value) => updateProfile('freizuegigkeitsguthaben', value)} />
            <NumberField label="Säule 3a gesamt" value={profile.saule3aGesamt} onChange={(value) => updateProfile('saule3aGesamt', value)} />
            {profile.saule3aGesamt > 0 ? (
              <NumberField
                label="3a-Konten Anzahl"
                value={profile.saule3aKonten.length}
                onChange={(value) =>
                  updateProfile(
                    'saule3aKonten',
                    Array.from({ length: Math.max(1, value) }, () => Math.round(profile.saule3aGesamt / Math.max(1, value)))
                  )
                }
                step={1}
                info="Mehrere Konten können später für gestaffelte Bezüge sinnvoll sein."
              />
            ) : null}
            <NumberField label="Grenzsteuersatz %" value={profile.grenzsteuersatz} onChange={(value) => updateProfile('grenzsteuersatz', value)} step={0.5} />
            <ToggleField label="Kirchensteuer" checked={profile.kirchensteuer} onChange={(value) => updateProfile('kirchensteuer', value)} />
            <NumberField
              label="Invaliditätsabsicherung p.a."
              value={profile.invaliditaetsabsicherungJahr}
              onChange={(value) => updateProfile('invaliditaetsabsicherungJahr', value)}
              info="Jährliche Leistung, falls du nicht mehr arbeiten kannst."
            />
            {familyRiskRelevant ? (
              <NumberField
                label="Todesfallabsicherung p.a."
                value={profile.todesfallabsicherungJahr}
                onChange={(value) => updateProfile('todesfallabsicherungJahr', value)}
                info="Vor allem relevant, wenn Partner oder Kinder finanziell von dir abhängen."
              />
            ) : null}
          </div>
        </SectionShell>

        <SectionShell
          title="5. Anlageprofil & Ziele"
          subtitle="Zum Schluss: Zielbild, Risiko und Ruhestandswunsch."
          status={profile.sectionStatus.ziele}
          open={activeSection === 'ziele'}
          onToggle={() => setActiveSection(activeSection === 'ziele' ? 'ereignisse' : 'ziele')}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Risikoprofil"
              value={profile.risikobereitschaft}
              onChange={(value) => updateProfile('risikobereitschaft', value as ProfilSnapshot['risikobereitschaft'])}
              options={[
                { value: 'konservativ', label: 'Konservativ' },
                { value: 'ausgewogen', label: 'Ausgewogen' },
                { value: 'dynamisch', label: 'Dynamisch' },
              ]}
            />
            <Select
              label="Anlagehorizont"
              value={profile.anlagehorizont}
              onChange={(value) => updateProfile('anlagehorizont', value as ProfilSnapshot['anlagehorizont'])}
              options={[
                { value: 'kurz', label: '< 3 Jahre' },
                { value: 'mittel', label: '3-10 Jahre' },
                { value: 'lang', label: '> 10 Jahre' },
              ]}
            />
            <Select
              label="Verlusttoleranz"
              value={profile.verlusttoleranz}
              onChange={(value) => updateProfile('verlusttoleranz', value as ProfilSnapshot['verlusttoleranz'])}
              options={[
                { value: 'niedrig', label: 'Niedrig' },
                { value: 'mittel', label: 'Mittel' },
                { value: 'hoch', label: 'Hoch' },
              ]}
            />
            <Select
              label="ESG-Präferenz"
              value={profile.esgPraeferenz}
              onChange={(value) => updateProfile('esgPraeferenz', value as ProfilSnapshot['esgPraeferenz'])}
              options={[
                { value: 'wichtig', label: 'Wichtig' },
                { value: 'neutral', label: 'Neutral' },
                { value: 'egal', label: 'Egal' },
              ]}
            />
            <NumberField
              label="Notgroschen-Ziel"
              value={profile.notgroschenZiel}
              onChange={(value) => updateProfile('notgroschenZiel', value)}
              info="Ziel für sofort verfügbare Reserve. Meist ein Mehrfaches der Monatsausgaben."
            />
            <NumberField label="Wunschalter finanzielle Freiheit" value={profile.wunschalterFreiheit} onChange={(value) => updateProfile('wunschalterFreiheit', value)} step={1} />
            <NumberField label="Frühpensionierungsalter" value={profile.fruehpensionierungsAlter} onChange={(value) => updateProfile('fruehpensionierungsAlter', value)} step={1} />
            <NumberField
              label="Gewünschte Ruhestandsausgaben p.a."
              value={profile.gewuenschteJahresausgabenRuhestand}
              onChange={(value) => updateProfile('gewuenschteJahresausgabenRuhestand', value)}
              info="Wie viel dein Haushalt im Ruhestand pro Jahr ungefähr brauchen soll."
            />
          </div>
        </SectionShell>

        <SectionShell
          title="6. Lebensereignisse"
          subtitle="Optional: nur ergänzen, wenn ein Ereignis die Planung wirklich verändert."
          status={profile.lebensereignisse.length > 0 ? 'complete' : 'incomplete'}
          open={activeSection === 'ereignisse'}
          onToggle={() => setActiveSection(activeSection === 'ereignisse' ? 'basis' : 'ereignisse')}
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Kinder, Teilzeit, Sabbatical oder Wohneigentum können die Planung stark verschieben.</p>
            <Button size="sm" onClick={addEvent}>
              <Plus className="mr-2 h-4 w-4" />
              Ereignis
            </Button>
          </div>
          <div className="space-y-3">
            {profile.lebensereignisse.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch keine Ereignisse erfasst.</p>
            ) : (
              profile.lebensereignisse.map((event) => (
                <div key={event.id} className="grid gap-3 rounded-xl border border-border p-4 md:grid-cols-4">
                  <Select
                    label="Typ"
                    value={event.typ}
                    onChange={(value) => updateEvent(event.id, { typ: value as Ereignis['typ'], label: value })}
                    options={[
                      { value: 'kind', label: 'Kind' },
                      { value: 'wohneigentum', label: 'Wohneigentum' },
                      { value: 'teilzeit', label: 'Teilzeit' },
                      { value: 'sabbatical', label: 'Sabbatical' },
                      { value: 'sonstiges', label: 'Sonstiges' },
                    ]}
                  />
                  <TextField label="Label" value={event.label} onChange={(value) => updateEvent(event.id, { label: value })} />
                  <NumberField label="Jahr" value={event.jahr} onChange={(value) => updateEvent(event.id, { jahr: value })} step={1} />
                  <div className="flex items-end">
                    <Button variant="ghost" size="sm" onClick={() => removeEvent(event.id)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Entfernen
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionShell>
      </div>

      <Card className="mt-6 border-primary/20 bg-primary/5">
        <CardContent className="grid gap-4 py-6 md:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Haushaltsreserve</p>
            <p className="mt-1 text-lg text-foreground">{formatCurrency(profile.liquiditaet)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Gebundene Vorsorge</p>
            <p className="mt-1 text-lg text-foreground">{formatCurrency(profile.pkGuthaben + profile.saule3aGesamt + profile.freizuegigkeitsguthaben)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Hypothek</p>
            <p className="mt-1 text-lg text-foreground">{formatCurrency(profile.hypothek)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ruhestandsziel</p>
            <p className="mt-1 text-lg text-foreground">{formatCurrency(profile.gewuenschteJahresausgabenRuhestand)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
