# kern – Wünsche an fremde Dateien (für den Zusammenbau)

## 1. sw.js (Offline-Vorrat) – Pflicht

- Datei: `neu/ticke/sw.js`, Zeilen `const V = '0.2.1';` sowie `DATEIEN` / `PRUEF` (werden laut Kommentar von `test/sw-liste.mjs` erzeugt – das Skript liegt nicht in der Arbeitskopie).
- Neu in `DATEIEN`: `"./antworten.js"` (Kern-Seite „Deine Antworten“, in index.html per modulepreload) und alle Dateien von `module/muster/` (modul.js, quellen.js, stil.css, aeste.js, fragen.js, verbindungen.js, … – was der Muster-Agent anlegt).
- `PRUEF` für **alle** geänderten Dateien neu berechnen (Format: erste 8 Byte SHA-256 als Hex, wie `summe()` in sw.js). Sonst scheitert die Einrichtung, weil die Prüfsummen von kern.js, seiten.js, ui.js, stil.css, quellen.js, index.html (und `./`) nicht mehr stimmen.
- `V` hochzählen und **gleich** `export const VERSION` in `kern.js` (Zeile 9, steht noch auf `'0.2.1'`) setzen – `offlineBereit()` sucht den Cache `ticke-schale-<VERSION>`.

Hilfs-Code (Node, im Ordner `neu/ticke`), falls `test/sw-liste.mjs` fehlt:
```js
import fs from 'fs'; import crypto from 'crypto'; import path from 'path';
const alle = []; (function lauf(d) { for (const n of fs.readdirSync(d)) { const p = path.join(d, n); if (fs.statSync(p).isDirectory()) lauf(p); else if (!/^(sw\.js|.*\.md)$/.test(n)) alle.push('./' + path.relative('.', p).split(path.sep).join('/')); } })('.');
alle.sort(); const D = ['./', ...alle];
const summe = (f) => crypto.createHash('sha256').update(fs.readFileSync(f === './' ? 'index.html' : f)).digest().subarray(0, 8).toString('hex');
const PRUEF = Object.fromEntries(D.map((d) => [d, summe(d)]));
let sw = fs.readFileSync('sw.js', 'utf8').replace(/\/\*DATEIEN\*\/.*?\/\*ENDE\*\//, '/*DATEIEN*/' + JSON.stringify(D) + '/*ENDE*/').replace(/\/\*PRUEF\*\/.*?\/\*ENDE\*\//, '/*PRUEF*/' + JSON.stringify(PRUEF) + '/*ENDE*/');
fs.writeFileSync('sw.js', sw);
```

## 2. Hinweise an Module (kein Muss)

- `module/muster/*`: Zum Sammeln gibt es jetzt `kern.exporte(id)` (alle benannten Exporte, nach Schema-Umzug/`start()`); eigenes `import()` geht weiter. Die frühere Kern-Test-Seite `#muster?test=1` heißt jetzt `#bausteine?test=1`, `#muster` gehört ganz dem Modul. Kopf-Titel vor dem Modul: „Dein Muster“.
- `module/passt/*`: Profil und Was passt teilen sich jetzt einen Reiter „Profil“; der Kern zeigt oben einen Unterreiter „Profil | Was passt zu mir“ (eigene Zeile außerhalb von `#inhalt`). Ein eigener Knopf „Was passt zu mir“ auf `#profil` ist damit doppelt, schadet aber nicht.
- `module/bigfive`, `passt`, `training`, `spiel`, `interessen`: Statt `band()` gibt es `ui.richtung()` und `kern.mass.richtung(stufe, pole)` (Beschreibung in kern.md). `mass.wort(stufe)` liefert keine Vergleichs-Wörter mehr („die meisten“) – wer es nutzte, bekommt „leicht zur einen Seite“ o. ä.; besser `mass.wort(stufe, [polA, polB])`.
- `module/textspiegel`: Beim Test gab es noch kein `antwortListe` – „Deine Antworten“ zeigt dann einen Hinweis mit Link auf `#text`.
