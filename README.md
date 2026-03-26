
## FinPlan

FinPlan ist eine Vite/React-Webapp mit Supabase fuer Login und Datenspeicherung.

## Lokal starten

1. Abhaengigkeiten installieren:

```powershell
npm install
```

2. `.env.local` aus `.env.example` erstellen und die echten Supabase-Werte eintragen.

3. Entwicklungsserver starten:

```powershell
npm run dev
```

## Free-Deployment mit Vercel

Diese App laeuft fuer den Start gut mit:

- `Vercel Hobby` fuer das Frontend
- `Supabase Free` fuer Datenbank und Auth

### Was bereits vorbereitet ist

- `.gitignore` ignoriert Build-Artefakte, lokale Secrets und `node_modules`
- `.env.example` zeigt, welche Umgebungsvariablen benoetigt werden
- `vercel.json` sorgt dafuer, dass React-Routes wie `/login` oder `/app/dashboard` auch nach Reload funktionieren

### Schritt fuer Schritt

1. GitHub-Konto erstellen, falls du noch keines hast:
   [https://github.com](https://github.com)

2. Neues leeres Repository auf GitHub anlegen, zum Beispiel `finplan`.

3. Lokales Projekt einmal sauber committen:

```powershell
git add .
git commit -m "Prepare FinPlan for cloud deployment"
```

4. GitHub-Remote verbinden:

```powershell
git remote add origin https://github.com/DEIN-NAME/finplan.git
git push -u origin main
```

5. Vercel-Konto erstellen:
   [https://vercel.com](https://vercel.com)

6. In Vercel:
   - `Add New Project`
   - GitHub verbinden
   - Repository `finplan` importieren

7. Build-Einstellungen in Vercel pruefen:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

8. In Vercel die Environment-Variablen setzen:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

9. Deploy ausloesen.

10. In Supabase unter Authentication die URLs setzen:
   - `Site URL`: deine Vercel-Domain, z. B. `https://finplan.vercel.app`
   - ggf. dieselbe URL auch bei Redirect URLs eintragen

## Versionierung

Fuer einen sicheren Start gilt:

- nur Quellcode in Git einchecken
- niemals `.env.local` committen
- `node_modules` und `dist` nie versionieren
- jede groessere Aenderung mit eigenem Commit sichern

Empfohlene Routine:

```powershell
git add .
git commit -m "Kurze Beschreibung der Aenderung"
git push
```

## Wichtige Umgebungsvariablen

Die App benoetigt:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Diese Werte bekommst du in Supabase im Projekt unter:

- `Project Settings`
- `API`
  
