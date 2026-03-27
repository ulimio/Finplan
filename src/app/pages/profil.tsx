import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/card';
import { Button } from '../components/button';
import { Select } from '../components/select';
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

function NumberField({
  label,
  value,
  onChange,
  step = 100,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  hint?: string;
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
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-foreground">{label}</span>
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
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`rounded-lg border px-3 py-2 text-sm ${checked ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground'}`}
    >
      {label}: {checked ? 'Ja' : 'Nein'}
    </button>
  );
}

export function Profil({ userId }: { isLoggedIn: boolean; userId?: string }) {
  const [profile, setProfile] = useState<ProfilSnapshot>(() => buildInitialProfile(userId));
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
    updateProfile(
      'lebensereignisse',
      profile.lebensereignisse.filter((entry) => entry.id !== id)
    );
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl text-foreground">Profil</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Die Eingaben decken die zehn kritischen Planungslücken ab: Cashflow, Steuern, Vorsorge, Immobilien, Haushalt, Risiko und Priorisierung.
          </p>
        </div>
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-right">
          <p className="text-xs text-muted-foreground">Vollständigkeit</p>
          <p className="text-2xl text-primary">{progress}%</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>1. Basis & Haushalt</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
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
            <NumberField label="Partner-Einkommen p.a." value={profile.partnerEinkommen} onChange={(value) => updateProfile('partnerEinkommen', value)} />
            <NumberField label="Partner-Vermögen" value={profile.partnerVermoegen} onChange={(value) => updateProfile('partnerVermoegen', value)} />
            <NumberField label="Monatsausgaben gesamt" value={profile.monatlicheAusgaben} onChange={(value) => updateProfile('monatlicheAusgaben', value)} />
            <NumberField label="Wohnkosten / Monat" value={profile.wohnkostenMonat} onChange={(value) => updateProfile('wohnkostenMonat', value)} />
            <NumberField label="Krankenkasse / Monat" value={profile.krankenkasseMonat} onChange={(value) => updateProfile('krankenkasseMonat', value)} />
            <NumberField label="Betreuung / Monat" value={profile.betreuungskostenMonat} onChange={(value) => updateProfile('betreuungskostenMonat', value)} />
            <NumberField label="Sonstige Fixkosten / Monat" value={profile.sonstigeFixkostenMonat} onChange={(value) => updateProfile('sonstigeFixkostenMonat', value)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Einkommen & Selbständigkeit</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
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
            <NumberField label="Variables Einkommen p.a." value={profile.variablesEinkommen} onChange={(value) => updateProfile('variablesEinkommen', value)} />
            <NumberField label="Einkommensentwicklung %" value={profile.einkommensentwicklung} onChange={(value) => updateProfile('einkommensentwicklung', value)} step={0.5} />
            <NumberField
              label="Reserve für Selbständigkeit (Monate)"
              value={profile.selbststaendigReserveMonate}
              onChange={(value) => updateProfile('selbststaendigReserveMonate', value)}
              step={1}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Vermögen, Schulden & Immobilie</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <NumberField label="Liquidität" value={profile.liquiditaet} onChange={(value) => updateProfile('liquiditaet', value)} />
            <NumberField label="Wertschriften" value={profile.wertschriften} onChange={(value) => updateProfile('wertschriften', value)} />
            <NumberField label="Immobilienwert" value={profile.immobilienwert} onChange={(value) => updateProfile('immobilienwert', value)} />
            <NumberField label="Sonstiges Vermögen" value={profile.sonstigesVermoegen} onChange={(value) => updateProfile('sonstigesVermoegen', value)} />
            <NumberField label="Säule 3b / freies Vorsorgevermögen" value={profile.saule3bVermoegen} onChange={(value) => updateProfile('saule3bVermoegen', value)} />
            <NumberField label="Hypothek" value={profile.hypothek} onChange={(value) => updateProfile('hypothek', value)} />
            <NumberField label="Hypothekarzins %" value={profile.hypothekZins} onChange={(value) => updateProfile('hypothekZins', value)} step={0.1} />
            <NumberField label="Eigenmietwert p.a." value={profile.eigenmietwert} onChange={(value) => updateProfile('eigenmietwert', value)} />
            <NumberField label="Liegenschaftskosten p.a." value={profile.liegenschaftsKostenJahr} onChange={(value) => updateProfile('liegenschaftsKostenJahr', value)} />
            <NumberField label="Konsumkredite" value={profile.konsumkredite} onChange={(value) => updateProfile('konsumkredite', value)} />
            <NumberField label="Konsumkreditzins %" value={profile.konsumkrediteZins} onChange={(value) => updateProfile('konsumkrediteZins', value)} step={0.5} />
            <div className="flex items-end">
              <ToggleField label="Indirekte Amortisation" checked={profile.indirekteAmortisation} onChange={(value) => updateProfile('indirekteAmortisation', value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Vorsorge, Steuern & Risiko</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
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
            <NumberField label="AHV-Rente p.a. (falls bekannt)" value={profile.ahvRenteJaehrlich} onChange={(value) => updateProfile('ahvRenteJaehrlich', value)} />
            <NumberField label="PK-Guthaben" value={profile.pkGuthaben} onChange={(value) => updateProfile('pkGuthaben', value)} />
            <NumberField label="PK-Einkaufspotenzial" value={profile.pkEinkaufspotenzial} onChange={(value) => updateProfile('pkEinkaufspotenzial', value)} />
            <NumberField label="PK-Umwandlungssatz %" value={profile.pkRenteUmwandlungssatz} onChange={(value) => updateProfile('pkRenteUmwandlungssatz', value)} step={0.1} />
            <NumberField label="PK AN-Beitrag p.a." value={profile.pkBeitragArbeitnehmer} onChange={(value) => updateProfile('pkBeitragArbeitnehmer', value)} />
            <NumberField label="PK AG-Beitrag p.a." value={profile.pkBeitragArbeitgeber} onChange={(value) => updateProfile('pkBeitragArbeitgeber', value)} />
            <NumberField label="Freizügigkeitsguthaben" value={profile.freizuegigkeitsguthaben} onChange={(value) => updateProfile('freizuegigkeitsguthaben', value)} />
            <NumberField label="Säule 3a gesamt" value={profile.saule3aGesamt} onChange={(value) => updateProfile('saule3aGesamt', value)} />
            <NumberField label="3a-Konten Anzahl" value={profile.saule3aKonten.length} onChange={(value) => updateProfile('saule3aKonten', Array.from({ length: Math.max(1, value) }, () => Math.round(profile.saule3aGesamt / Math.max(1, value))))} step={1} />
            <NumberField label="Grenzsteuersatz %" value={profile.grenzsteuersatz} onChange={(value) => updateProfile('grenzsteuersatz', value)} step={0.5} />
            <div className="flex items-end">
              <ToggleField label="Kirchensteuer" checked={profile.kirchensteuer} onChange={(value) => updateProfile('kirchensteuer', value)} />
            </div>
            <NumberField label="Invaliditätsabsicherung p.a." value={profile.invaliditaetsabsicherungJahr} onChange={(value) => updateProfile('invaliditaetsabsicherungJahr', value)} />
            <NumberField label="Todesfallabsicherung p.a." value={profile.todesfallabsicherungJahr} onChange={(value) => updateProfile('todesfallabsicherungJahr', value)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Anlageprofil & Ziele</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
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
            <NumberField label="Notgroschen-Ziel" value={profile.notgroschenZiel} onChange={(value) => updateProfile('notgroschenZiel', value)} />
            <NumberField label="Wunschalter finanzielle Freiheit" value={profile.wunschalterFreiheit} onChange={(value) => updateProfile('wunschalterFreiheit', value)} step={1} />
            <NumberField label="Frühpensionierungsalter" value={profile.fruehpensionierungsAlter} onChange={(value) => updateProfile('fruehpensionierungsAlter', value)} step={1} />
            <NumberField
              label="Gewünschte Ruhestandsausgaben p.a."
              value={profile.gewuenschteJahresausgabenRuhestand}
              onChange={(value) => updateProfile('gewuenschteJahresausgabenRuhestand', value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>6. Lebensereignisse</CardTitle>
            <Button size="sm" onClick={addEvent}>
              <Plus className="mr-2 h-4 w-4" />
              Ereignis
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>
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
