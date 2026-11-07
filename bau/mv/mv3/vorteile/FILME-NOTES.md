# Film-Radar (Modul „filme“) – Notizen

Stand 07.11.2026. Arbeitskopie ohne git; Vergleich gegen `/home/user/synquenzer` (main, 4.48.0): unter `vorteile/` und
`mein-vorteil/` sind nur die hier genannten Dateien anders.

## Was es macht

Apple TV / iTunes Store Deutschland, alle 3 Stunden:

- **Wunschliste** (immer alle Titel): Mallrats (1995), Shadow und der Fluch des Khan (1994, auch „The Shadow“), Go Trabi Go (1991),
  Manta Manta (1991). Zielpreis 4,99 € (pro Titel änderbar). Nicht im Store: `fehlt: true`, `id: "wunsch:<slug>"`.
- **Angebote**: Filme ≤ 3,99 € (≤ 4,99 € bei Tiefstpreis nach ≥ 7 Tagen oder bei laufender Apple-Aktion laut mydealz), nur
  Wunsch/Kuratiertes oder Chart-Titel, plus mydealz-Aktionen (`quelle: "mydealz"`).
- **Neu**: Apple-Charts Komödie 4404, Action 4401, Thriller 4416, Sci-Fi 4413; ≤ 18 Monate, Top 25 je Genre, nach Chartplatz.
- **80er & Kult** (143 kuratierte Titel), **Disney** (50), **Serien** (Rick and Morty + 10 Star-Trek-Serien, je Staffel).
- Horror ist überall raus (Genre-ID 4408 und Genrename „Horror“, auch mydealz „Horror“).
- Preis-Historie im Zustand, Tiefstpreis/`vorher`/`istTiefst`/`angebot` nach dem Vertrag.

## Dateien

| Datei | Art |
|---|---|
| `vorteile/scan/module/filme.mjs` | neu – das Modul (707 Zeilen) |
| `vorteile/filme.json` | neu – Listen (Wunsch, 80er/Kult, Serien, Disney, Charts, mydealz-Suchen), frei editierbar, mit `_hinweis` |
| `vorteile/scan/test/filme.test.mjs` | neu – 11 Tests |
| `vorteile/scan/test/fixtures/itunes-*.json`, `mydealz-itunes.xml` | neu – Fixtures im echten Format |
| `vorteile/scan/test/fixtures/karte.mjs` | +21 Zeilen am Ende (Apple/mydealz-URLs → Fixtures) |
| `vorteile/scan/main.mjs` | Haken (unten) |
| `vorteile/scan/benachrichtigen.mjs` | Haken (unten) |
| `vorteile/scan/lib/http.mjs` | Pause pro Host (unten) |
| `vorteile/config.json` | Haken (unten) |
| `vorteile/scan/test/benachrichtigen.test.mjs` Z. 60, `roh.test.mjs` Z. 47 + 65 | erwartete Listen um `filme` / `filme.json` ergänzt |
| `mein-vorteil/test/fixtures/filme-scanner.json` | Ausgabe von `npm run probe` (die Seite hatte schon eine eigene `filme.json`) |

Andere Module: unverändert.

## Haken zum Übertragen (genaue Zeilen)

`vorteile/scan/main.mjs`
```js
// Z. 20
import filme from './module/filme.mjs';
// Z. 24–25: in MODULE und MAX_ALTER_TAGE
export const MODULE = { deals, erleben, reisen, musik, nebenverdienst, tests, praemien, filme };
const MAX_ALTER_TAGE = { …, praemien: 14, filme: 3 };
// Z. 35: lauf() bekommt zwei Parameter
export async function lauf({ cfg, wunschliste, filmListen = null, dateienVorher = {}, vorher, zustand, holeText, … }) {
// Z. 41
  const dateien = {};
// Z. 56–57: Modulaufruf + eigene Datei einsammeln
      const r = await mitZeitlimit(fn({ holeText, cfg, wunschliste, zustand, env, jetzt, filmListen, vorherDatei: dateienVorher?.[name] ?? null }), 240000, name);
      if (r.datei) dateien[name] = r.datei;
// Z. 93
  return { aktuell, zustand, alleEintraege, dateien };
// Z. 111 + 113 in main()
  const filmListen = await leseJson(join(basis, 'filme.json'), null);
  const dateienVorher = { filme: await leseJson(join(daten, 'filme.json'), null) };
// Z. 121: lauf({ cfg, wunschliste, filmListen, dateienVorher, vorher, … })
// Z. 140–141 nach dem Schreiben von zustand.json: nicht gelaufen -> alte Datei bleibt
  for (const [name, inhalt] of Object.entries(r.dateien || {})) await writeFile(join(daten, `${name}.json`), JSON.stringify(inhalt) + '\n');
// Z. 145 im Roh-Block
    for (const [name, inhalt] of Object.entries(r.dateien || {})) roh.ausgabe(`${name}.json`, JSON.stringify(inhalt) + '\n');
```

`vorteile/scan/benachrichtigen.mjs` Z. 7 (KATEGORIEN): `praemien: 'Prämien & Freunde werben', filme: 'Filme & Serien',`

`vorteile/scan/lib/http.mjs` Z. 14 und 17 (Pause pro Host; `pauseMs` 0 = Tests ohne Pause):
```js
    const pause = abruf.pauseMs > 0 ? Math.max(abruf.pauseMs, abruf.pauseMsJeHost?.[host] ?? 0) : 0;
      if (seit < pause) await warte(pause - seit);
```

`vorteile/config.json` Z. 24–26 (in `abruf`) und Z. 185–189 (in `module`):
```json
    "pauseMs": 2000,
    "pauseMsJeHost": { "itunes.apple.com": 3200 },
    "_pauseMsJeHost": "Apple erlaubt etwa 20 Abrufe pro Minute -> 3,2 s Abstand."
…
    "filme": { "aktiv": true, "intervallStunden": 3, "_hinweis": "…" }
```
Weitere Stellschrauben (optional in `module.filme`, Standard in `STANDARD` von filme.mjs): `maxAppleAbrufe` 45, `maxSuchen` 25,
`zeitBudgetSek` 170, `wiederholenTage` 7, `serienNeuTage` 14, `historieTage` 400, `vergessenTage` 60, `maxEintraege` 25.

`.github/workflows/vorteile.yml`: keine Änderung nötig – `sparse-checkout: vorteile` enthält `vorteile/filme.json`; die Ausgabe
landet über `--data daten/vorteile/data` und `git add -A` als `vorteile/data/filme.json` auf dem Zweig `vorteile-daten`
(genau die Adresse, die die Seite liest).

## Datei filme.json (Vertrag)

Wie vereinbart (`version`, `aktualisiert`, `gruppen.{wunsch,angebot,neu,achtziger,serien,disney}`, `status`, `hinweis`).
Zusätzliche Felder (die Seite nutzt sie, andere Leser können sie ignorieren):
- Staffeln: `serie` (Name aus der Liste, z. B. „Star Trek: Das nächste Jahrhundert“) und `nr`.
- Wunschliste: `ziel` (Zielpreis) – die Seite zeigt „dein Ziel: 4,99 €“.
- `status[quelle]`: zusätzlich `abrufe` (apple-preise), `offen` und `nichtGefunden` (apple-suche).
- mydealz-Titel ohne Präfix „[iTunes / Apple TV]“ (nur in filme.json; der Push-Eintrag behält den Originaltitel).

## Ablauf eines Laufs (Apple-Abrufe)

1. Lookup aller gemerkten IDs (bis 150 pro Abruf) → 1–2 Abrufe.
2. 6 Chart-Feeds (4 „neu“ + Klassiker 4403 + Kinder & Familie 4410), dann 1 Lookup für Kauf-/Leih-Preise der Chart-Titel.
3. Suchen nach noch unbekannten Titeln: höchstens 25 pro Lauf, Reihenfolge Wunsch → Serien → 80er/Disney abwechselnd;
   Ergebnis Titel → Apple-Nummer in `zustand.filme.ids` (fest). Nicht gefunden: frühestens nach 7 Tagen neu; Staffel-Listen
   alle 14 Tage frisch (neue Staffeln). Zwei Suchfehler in Folge → Rest im nächsten Lauf.
4. mydealz: 4 Suchfeeds (über `mydealzSuche`/`sammleFeeds`), nur Apple-Film-Aktionen.

Rechnung: ≤ 45 Apple-Abrufe × 3,2 s Abstand = 144 s < Zeitbudget 170 s < Modul-Limit 240 s. Bei 208 Listen-Einträgen sind nach
etwa 8–12 Läufen (1–2 Tage) alle einmal gesucht; danach meist nur 1 Lookup + 7 Chart-Abrufe pro Lauf.

## Pushes (kategorien.filme, höchstens 25)

- Wunschfilm ≤ Zielpreis → sofort (Wert 95); Wunschfilm mit neuem Tiefstpreis → sofort (88).
- Staffel gesenkt auf ≤ 9,99 € → sofort (80); um ≥ 30 % gesenkt → Zusammenfassung.
- 80er/Disney gesenkt auf ≤ 3,99 € → sofort (80); sonst bei ≥ 30 % oder neuem Tiefstpreis → Zusammenfassung.
- Chart-Film gesenkt in den Angeboten → Zusammenfassung.
- mydealz-Aktion mit einem Wunschfilm im Text → sofort; sonst Zusammenfassung.
- Nur bei echter Preissenkung gegenüber dem letzten Lauf (keine Pushes für Dauerpreise, keine aus altem Stand); Dedupe über
  die Eintrags-ID (Titel-ID + Preis) in benachrichtigen.mjs; erster Filme-Lauf in einem laufenden Radar meldet nichts nach.

## Tests

`cd vorteile && npm test` → 66/66 grün (55 alte + 11 neue). `npm run probe` → filme: 4 Einträge, filme.json mit
Wunsch 4 (Go Trabi Go `fehlt`), Angebote 9, Neu 6, 80er 3, Serien 10, Disney 2 (erster Lauf, 25 Suchen); der
„Kinder & Familie“-Feed ist in der Fixture absichtlich tot (Status-Meldung).

Geprüft: Zuordnung (Shadow 1994 ≠ Shadow 2018/Shadow Man/Shadow in the Cloud; Go Trabi Go ≠ Teil 2; Manta Manta 1991 ≠ Zwoter
Teil 2023; Doku/Neuverfilmung/Fortsetzung), Staffeln ohne „The Anime“, Preisfelder fehlen/0/-1/Text, Einzelobjekt-Feed, Horror,
mydealz-Filter (Hardware, TV+-Abo, Geschenkkarte, Prime Video, Horror), Vertrag, Tiefstpreis/vorher über 10 Läufe mit
`jetzt`, Historie ≤ 400 Tage, Such-/Abrufgrenzen, 7-Tage-Wiederholung, tote Quelle → alter Stand, Modul nicht fällig → Datei
bleibt, keine Push-Flut beim ersten Lauf.

## Offene Unsicherheiten der Quellen (erst der Roh-Lauf auf GitHub zeigt es)

- Container erreicht itunes.apple.com nicht: Fixtures sind nach dem bekannten Format gebaut, nicht mitgeschnitten.
- Legacy-Charts `…/rss/topmovies/…/json`: Apple hat die alten RSS-Feeds teils abgeschaltet. Ist der Feed tot, steht das im
  `status['apple-charts']`, „Neu“ bleibt dann leer (bzw. 3 Tage alter Stand) – Ersatz wäre der neue Feed-Generator
  (`rss.applemarketingtools.com`, hat aber keine Film-Genres). Ob `im:price` dort Kauf- oder Leihpreis ist, bitte im Roh-Lauf prüfen;
  der Lookup danach liefert ohnehin die echten Kauf-/Leihpreise.
- Search-API: deutsche Titel und Jahreszahlen im DE-Store weichen manchmal ab (Wiederveröffentlichung, „Director's Cut“).
  Bei ±1 Jahr Toleranz kann ein Klassiker als `fehlt` enden → in `vorteile/filme.json` Jahr anpassen oder `"id"` (Apple-Nummer)
  eintragen; die Liste `status['apple-suche'].nichtGefunden` zeigt, welche.
- `trackHdPrice` fehlt bei manchen Filmen; dann gilt der SD-Preis.
- Schlimmster Fall Zeit: hängt Apple bei jedem Abruf bis zum Zeitlimit (20 s), reichen 240 s nicht für Lookup + Charts + mydealz;
  dann bricht main das Modul ab und Einträge/Datei des letzten Laufs bleiben stehen (kein Datenverlust).
- Datenschutz: das Modul berührt keine Krypto-Daten und kein privates Topic; Pushes laufen über den normalen Weg des Radars.
