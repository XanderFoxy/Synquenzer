# Reiter „Filme“ – Notizen zur Seite

Stand 07.11.2026. Vierter Reiter neben Angebote/Vorteile/Konzerte. Die ganze Film-Logik und das CSS stehen in **`filme.js`**
(klassisches Script, eigenes Präfix `.fi-…`, nutzt nur die CSS-Variablen der Seite). `index.html` hat nur kleine Haken.

## Dateien

| Datei | Art |
|---|---|
| `mein-vorteil/filme.js` | neu (405 Zeilen): Laden, Lesen, Zeichnen, CSS, `window.MeinVorteilFilme = { start, lade, gestartet, _intern }` |
| `mein-vorteil/index.html` | Haken (unten) |
| `mein-vorteil/sw.js` | `filme.js` in den Zwischenspeicher, wie die Seite „erst Netz, nach 3 s Kopie“ |
| `mein-vorteil/test/filme.test.mjs` | neu: 14 Tests (statisch + Playwright, Fotos) |
| `mein-vorteil/test/fixtures/filme.json` | Seiten-Fixture nach Vertrag (4 Wunsch, 6 Angebote, 6 Neu, 10 Achtziger, 14 Staffeln, 8 Disney) |
| `mein-vorteil/test/fixtures/filme-scanner.json` | echte Ausgabe des Scanners (`npm run probe` im Vorteils-Radar) |
| `mein-vorteil/test/seite.test.mjs` Z. 557–571 | nicht filmbezogen: der Test las den Cache-Namen `synq-app-1` fest; die App nutzt seit 01.11. `synq-app-2` → jetzt aus `../sw.js` gelesen (auf main schlägt dieser Test sonst fehl) |

## Haken in index.html (genaue Zeilen)

1. **CSS** Z. 96–105 (im `<style>` nach `.segment button[aria-selected="true"] .n { … }`) – vier Reiter auf dem iPhone hochkant:
   die Zahl steht als kleines Abzeichen oben rechts am Knopf, sonst passt „Angebote 12“ nicht mehr.
   ```css
   @media (max-width: 540px) {
     .segment button { position: relative; padding: 0 4px; }
     .segment .n { position: absolute; top: -7px; right: -5px; min-width: 19px; height: 19px; padding: 0 5px; font-size: 11px;
       background: var(--akzent); color: var(--akzent-text); box-shadow: 0 0 0 2px var(--bg); }
     .segment button[aria-selected="true"] .n { background: var(--akzent-text); color: var(--akzent); box-shadow: 0 0 0 2px var(--akzent); }
   }
   ```
   Hinweis für Xander (sichtbare Änderung an den bestehenden Reitern, nur hochkant): bitte im Funk bestätigen; quer bleibt alles wie bisher.
2. **Reiter-Knopf** Z. 278 (nach dem Konzerte-Knopf in `.segment`):
   ```html
   <button type="button" role="tab" id="t-filme" data-reiter="filme" aria-controls="p-filme" aria-selected="false" tabindex="-1">Filme</button>
   ```
3. **Bereich** Z. 286 (nach `<section id="p-konzerte" …>`):
   ```html
   <section id="p-filme" role="tabpanel" aria-labelledby="t-filme" hidden><p class="leer">Lade Filme …</p></section>
   ```
4. **Liste der Reiter** Z. 313 (nach `const REITER = …`): `const TABS = [...REITER, 'filme'];`
   und `REITER` → `TABS` in `zeigeReiter` (Z. 1082, 1085), `reiterAusHash` (Z. 1098) und den Pfeiltasten (Z. 1108–1110).
   `REITER` selbst bleibt bei den drei Daten-Reitern (Laden, Zahlen, Stand-Zeile unverändert).
5. **↻ / Rückkehr zur Seite** Z. 423, in `lade()` direkt nach `$('neu').setAttribute('aria-busy', 'true');`: `filmeNeu();`
6. **Skript erst beim ersten Öffnen** Z. 1065–1078 (vor `function zeigeReiter`):
   ```js
   let filmeSkript = null;
   function starteFilme() {
     if (filmeSkript) return;
     filmeSkript = document.createElement('script');
     filmeSkript.src = 'filme.js';
     filmeSkript.onload = () => window.MeinVorteilFilme?.start($('p-filme'));
     filmeSkript.onerror = () => {
       filmeSkript.remove(); filmeSkript = null; // ↻ versucht es noch einmal
       $('p-filme').innerHTML = '<p class="leer">Filme gerade nicht erreichbar. Später noch einmal auf ↻ tippen.</p>';
     };
     document.head.appendChild(filmeSkript);
   }
   function filmeNeu() { if (window.MeinVorteilFilme?.gestartet) MeinVorteilFilme.lade(); else if (aktiv === 'filme') starteFilme(); }
   ```
7. In `zeigeReiter` Z. 1084, nach `aktiv = r;`: `if (r === 'filme') starteFilme();` (wirkt auch für `#filme` in der Adresse).

Kein festes `<script src="filme.js">`, kein Film-CSS und keine Daten-Adresse in index.html (prüft der Test).

## Haken in sw.js

- Z. 8: `const FILME = new URL('filme.js', self.registration.scope).href;`
- Z. 13: `addAll([SEITE, 'filme.js', 'icon-192.png', …])`
- Z. 27–35: `filme.js` wird wie die Seite behandelt (Netz zuerst, nach 3 s die letzte gute Kopie unter dem Schlüssel `FILME`),
  damit Seite und filme.js nach einer neuen Fassung zusammenpassen.

## Verhalten

- **Lazy**: filme.js und filme.json werden erst geholt, wenn der Reiter geöffnet wird (oder `#filme`). Andere Reiter laden
  nichts davon (Test: Request-Mitschnitt). Danach holt nur ↻ / Rückkehr frisch, nicht jeder Reiterwechsel.
- **Daten**: `https://raw.githubusercontent.com/XanderFoxy/Synquenzer/vorteile-daten/vorteile/data/filme.json`.
  Letzter Stand im localStorage (`mein-vorteil-daten-filme`, `{ d, holZeit }` wie die anderen Daten) → sofort sichtbar, auch offline.
  Stand-Zeile „Stand: heute 14:05“, bei Störung „· Quelle gerade gestört – du siehst den letzten Stand“ bzw. „· offline“.
  404 (Datei gibt es noch nicht) → „Die Filmliste wird gerade zum ersten Mal erstellt – schau später noch einmal rein.“
- **Chips** (waagrecht scrollbar, nicht umbrechend, ≥ 44 px, `role=tablist`, Pfeiltasten): Wunschliste · Angebote · Neu ·
  80er & Kult · Serien · Disney, mit Anzahl. Start: Wunschliste, wenn dort ein neues Angebot ist; sonst der gemerkte Chip
  (`mein-vorteil-filme-chip`), sonst Angebote.
- **Karte**: Poster 56 × 84 (Staffel 84 × 84), Platz reserviert, `loading=lazy`, Bild `200x200bb`, kaputtes Bild → Initialen.
  Titel (Jahr), Genre · Chartplatz, großer Preis, Abzeichen „Tiefstpreis“ / „Angebot“ / „unter deinem Ziel“ / „nicht im Apple-Store“,
  klein „statt 9,99 €“ und „Tiefstpreis 3,99 € (seit 07.11.)“, „dein Ziel: 4,99 €“, „Tipp von mydealz“.
  Ganze Karte tippbar (`target=_blank rel=noopener`) → TV-App. Ohne Link (Wunschfilm nicht im Store) ein `div`.
- **Serien**: nach Serie gruppiert (Feld `serie` des Scanners, sonst aus dem Titel), Serien mit Angebot zuerst, darin Angebote zuerst.
- **Leerzustände** je Bereich, z. B. „Gerade keine Angebote – du bekommst eine Nachricht, sobald einer deiner Filme günstig ist.“
- **Fußnote**: „Tiefstpreis = niedrigster Preis seit Beobachtung (seit 07.11.). Tippen öffnet die TV-App.“ + aufklappbare Quellen.
- Ein Rendern pro Chip-Wechsel (Chips nur umschalten, Liste einmal per innerHTML), keine Fremdbibliotheken.

## Tests und Fotos

`cd mein-vorteil && npm test` → 52/52 grün (38 alte + 14 neue). Geprüft u. a.: Vertrag der Fixture, tolerantes Lesen (Einzelobjekt,
Preis -1, ohne Titel, Text-Zahlen, `javascript:`-Links), echte Scanner-Ausgabe, Haken, Lazy-Laden, gemerkter Chip, Offline-Kopie,
Leerzustände, 428×926 und 926×428: kein seitliches Scrollen, Chips ≥ 44 px, CLS < 0,01 trotz spät kommender Bilder, andere Reiter
laufen weiter, Kontrast ≥ 4,5 : 1 im Dunkeln, keine Konsolenfehler.

Fotos in `mein-vorteil/test/fotos-filme/`: `hoch-*.png` / `quer-*.png` je Chip (wunsch, angebot, neu, achtziger, serien, disney),
`hoch-dunkel-wunsch.png`, `hoch-dunkel-serien.png`, `*-reiter-angebote.png`, sowie `scanner-{hoch,quer}-{wunsch,angebot,serien}.png`
(dunkel, mit der echten Scanner-Ausgabe; Skript außerhalb des Projekts unter `scratchpad/pruef-filme/scanner-blick.cjs`).

Bei der Fortsetzung behoben: Serienname aus „Star Trek: Discovery (Staffel 5)“ (Klammer blieb hängen) und zwei Test-Helfer
(geschütztes Leerzeichen in „3,99 €“, Vergleich von Objekten aus `vm`).
