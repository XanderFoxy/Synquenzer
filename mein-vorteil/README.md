# Mein Vorteil

**Dein Assistent auf einer Seite:** Deals, Preisfehler, Filme, Auftritte (mit Bewerbung), Remix-Contests, Deutschunterricht, Konzerte, Gewinnspiele, Krypto.
<https://xanderfoxy.github.io/Synquenzer/mein-vorteil/> (Safari → Teilen → „Zum Home-Bildschirm“, dann wie eine App)

Die alten Seiten `schnaeppchen/`, `vorteile/` und `konzerte/` leiten sofort hierher weiter (`#angebote`,
`#vorteile`, `#konzerte`, absolut auf `/Synquenzer/mein-vorteil/?von=…`; die Seite macht daraus `#produkte`, `#start`, `#konzerte`). In jedem alten Ordner bleibt ein kleiner
Service Worker angemeldet: er löscht den alten Zwischenspeicher, lädt alte offene Seiten neu und gibt Seitenaufrufe
ans Netz weiter (ohne Netz antwortet er selbst mit der Weiterleitung). So sieht der SYNQUENZER-Worker im
Wurzelordner diese Adressen nie und speichert keine Weiterleitung als Offline-Kopie des Synthesizers. Wer über eine
alte Adresse kommt, sieht einmal den Hinweis „Teilen → Zum Home-Bildschirm“ für das neue Symbol.

**SYNQUENZER-Offline-Kopie:** Der SYNQUENZER-Worker (`sw.js` im Wurzelordner) speichert jede Seite unter
`/Synquenzer/` als seine Offline-Kopie. Deshalb (ohne Änderung an der Wurzel):
- Die alten Adressen melden **zuerst den Worker von Mein Vorteil** an (höchstens 3 s warten), dann erst leiten sie
  weiter – der Aufruf von `/mein-vorteil/` geht so nie durch den SYNQUENZER-Worker.
- Kam Mein Vorteil trotzdem einmal über ihn (Push-Link beim allerersten Besuch), merkt die Seite das 1,5 s nach dem
  Laden (Titel der Kopie ist „Mein Vorteil“, „Vorteile“, „Schnäppchen…“, „Konzert…“) und legt die echte Startseite
  des Synthesizers wieder hin (dieselbe Antwort, die sein Worker beim nächsten Start holen würde).
- Bleibt offen (nur mit Xanders OK): Beim allerersten Besuch über einen Push-Link bei schwachem Netz (> 3 s) zeigt
  der SYNQUENZER-Worker statt Mein Vorteil seine Kopie. Die Ein-Zeilen-Lösung dort: nur `rest === '' ||
  rest === 'index.html'` als Seite behandeln.
- Im alten Home-Bildschirm-Symbol (eigenes Fenster ohne Safari-Leiste) nennt der Umzug-Hinweis die Adresse mit
  „Adresse kopieren“, weil es dort kein „Teilen“ gibt.

## Bereiche (seit 08.11.2026, Fassung 5: Leiste oben, immer nur ein Bereich)

Dunkles, warmes Design – immer, auch wenn das iPhone hell eingestellt ist (`color-scheme: dark`). Jeder Bereich hat seine
Farbe (`.f-<bereich>` setzt `--f`/`--f-hell`; `--akzent` folgt, so passen alle Karten von selbst).

Oben bleibt eine Leiste mit gezeichneten Symbolen (SVG, keine Emojis) und Zähler stehen:
**Start · Deals · Preisfehler · Filme · Auftritte · Remix · Unterricht · Konzerte · Gewinnspiele · Krypto · Mehr**
(„Start“ bleibt links stehen, der Rest ist seitlich wischbar). Darunter „Du bist in: …“ mit einer kurzen Zeile.
Es ist immer nur **ein** Bereich zu sehen (kein ewiges Scrollen); je Bereich eine Top-Liste + „weitere zeigen“.
Sprungmarken: `#start`, `#deals` (`#produkte`, `#cashback`, `#snacks` = Ziel im Bereich Deals), `#preisfehler`, `#filme`,
`#auftritte`, `#remix`, `#unterricht`, `#konzerte`, `#gewinnspiele`, `#krypto`, `#mehr`. Alte Marken: `#angebote` →
`#produkte`, `#vorteile` → `#start`, `#konzerte` bleibt.

| Bereich | Inhalt | Nie leer, weil … |
|---|---|---|
| **Start „Heute für dich“** | „Heute wichtig“ (höchstens 4 Zeilen) + je Bereich eine Kachel mit 1–3 besten Treffern; Tippen öffnet den Bereich | jede Kachel nennt den nächstbesten Treffer bzw. den Grund |
| **Deals** | Meine Produkte (Jetzt/Bald/Weitere, kaufDA-Region mit „in Döbeln prüfen“), Musik-Technik, Cashback, andere Snacks | ohne Angebot steht die Liste „zuletzt gesehen 0,99 € (225 g) bei Penny, Okt. 2026“ offen; beginnen alle Angebote erst später (Sonntag), nennt die Start-Kachel sie („ab morgen · 0,66 € bei Netto“, „11 Angebote starten bald“) statt „gerade kein Angebot“ |
| **Preisfehler** | nur krasse (Regel unverändert) | sonst: wo sie zuerst auftauchen (mydealz-Gruppe Preisfehler, heiße Deals) |
| **Filme** | Reiter aus `filme.js` (faul geladen), jetzt mit Apple-TV-Angebotsräumen („Filme für 3,99 €“) | Start-Kachel aus `aktuell.json` → `filme` |
| **Auftritte** | frische Ausschreibungen (nah + bald zuerst) mit **Bewerben**, darunter feste Adressen (Döbeln, Leipzig, Dresden, Chemnitz, deutschlandweit) | feste Adressen immer (gigmit nur noch die Startseite, Zeile „Link prüfen“); ältere Daten: dieselben Adressen aus der Seite (`FUNDORTE`, Test gegen `vorteile/config.json`) |
| **Remix** | laufende Contests (was zuerst endet, oben) mit **Mitmachen** (Frist, Stems, Text) | Fundorte mit laufenden Contests weltweit |
| **Unterricht** | Stellen/Anfragen (Döbeln + online zuerst) mit **Melden** als „Deutsch mit Xander“ | Jobbörse-Live-Suche, italki, Preply, Lingoda, BAMF |
| **Konzerte** | in der Nähe (bis `pushRadiusKm`), darunter **je Band der nächste Termin, auch weit weg, mit km**; Tourdaten-Links je Band (`../konzerte/artists.json`, erst beim Öffnen) | nächster Termin bzw. Tourdaten-Links |
| **Gewinnspiele** | nur laufende ohne Kauf/Abo | sonst mydealz-Gruppen Gewinnspiele/Gratis |
| **Krypto** | wie bisher (nur `localStorage`) | Kurs immer |
| **Mehr** | Erleben, Reisen, Nebenverdienst, Spar-Tipps, Vorlage Übersetzung, Quellen | – |

**Echter Lauf 08.11.2026** (`test/fixtures/echt-0811/`): die Ausgaben der drei Wecker unverändert (`satz: 'echt0811'`)
und dieselben echten Antworten neu gerechnet mit dem reparierten Radar (`echt0811neu`) – Tests „Echter Lauf 08.11.“ in
`test/seite.test.mjs` (428 × 926 und 926 × 428). Geräte („Apple TV 4K (2026)“) zeigt die Seite nie als Film, auch aus
älteren Daten (gleiche Regel in Seite, `filme.js` und Radar, `test/regeln.test.mjs`); lange Arbeitgeber-Namen werden in
der Marke gekürzt statt die Karte zu verbreitern.

**Bewerbungs-Assistent** (`<dialog id="blatt">`): fertiger Betreff + Text (Kurz-Bio, Genre, Links-Platzhalter,
Besetzung, Set-Länge, Technik), Auswahl **One Day in Rome │ Xander Fox │ beides** („One Day in Rome (Xander Fox)“) mit
Hinweis (Band-Auftritt → Bandname, solo/DJ/Live-Set → Künstlername), **Text kopieren**, **Per Mail öffnen** (`mailto:` mit
Betreff und Text, an die Adresse aus der Ausschreibung) bzw. **Formular öffnen** (kopiert den Text vorher). Text je
Eintrag und Name, Links und Kontakt („Deine Links & Kontakt“) nur im `localStorage` (`mein-vorteil-bewerbung`).

„Prämien & Freunde werben“ (Strom, Bank, Konto, Freunde werben) zeigt die Seite nie, auch nicht aus alten Daten;
Deals ohne Bezug zu Produkten/Snacks/Musik-Technik fallen weg.

**Krypto-Import per Link:** `…/mein-vorteil/#krypto=btc:<menge>:<einsatz>,eth:<menge>:<einsatz>` – das Skript im `<head>`
nimmt das Fragment sofort per `history.replaceState` aus der Adresse, speichert nur in `localStorage` und zeigt
„übernommen“. Nichts davon geht ans Netz (Test: keine Anfrage enthält die Zahlen). Push bei geschlossener Seite: siehe
`krypto/` und `.github/workflows/krypto.yml` (Secrets `KRYPTO`, `KRYPTO_NTFY_TOPIC`).

**Weitere Reiter:** `<a href="#name" data-reiter="name">Name<span class="n"></span></a>` in die Leiste,
`<section id="p-name" class="reiter-seite breite" hidden>` nach `</main>`, `REITER_START.name = el => …` (läuft beim
ersten Öffnen), optional `REITER_NEU.name` (↻ und Rückkehr zur Seite nach > 5 min, für jeden schon geöffneten Reiter).
Antippen blendet die Bereiche aus (main hidden) und springt unter die Leiste; jeder Bereichs-Link führt zurück.

**Reiter „Filme“ (Film-Radar, `filme.js`):** letzter Link der Leiste, `#filme` öffnet ihn direkt. Skript, CSS (`.fi-…`) und
Daten (`vorteile-daten/vorteile/data/filme.json`) kommen erst beim ersten Öffnen; vorher lädt die Seite nichts davon.
Chips Wunschliste · Angebote · Neu · 80er & Kult · Serien · Disney, Tiefstpreis, „dein Ziel“, letzter Stand offline.
Film-Einträge aus `aktuell.json` (Kategorie `filme`, für die Pushes) stehen nur dort, nicht noch einmal unter „Mehr“.
Der Service Worker hält `filme.js` wie die Seite (erst Netz, nach 3 s die letzte gute Kopie). Tests: `test/filme.test.mjs`.

## Was eine Angebotskarte zeigt

- Überschrift = das Produkt, das du verfolgst (ohne Packungsgröße, wenn das Angebot eine andere Packung ist).
- Darunter der **eigene Titel des Angebots** und seine **Packung** („15 × 25 g“), Preis, Laden, Preis pro Stück / 100 g.
- **Preis-Kontext** (Daten ab Scanner-Version 3): kleine Tabelle **Jetzt · Regulär · Üblich im Angebot · Tiefst 12 Mon.**,
  je mit Laden, Monat und Quellenname; „Quellen der Preise“ klappt die Links auf (Tippflächen ≥ 44 px). Neben dem Preis
  „statt regulär 3,49 €“, oben rechts „−20 %“ – **nur gegen den recherchierten regulären Preis** (grün nur bei einem Deal,
  sonst grau). Darunter das Urteil: „Deal“ (≤ üblich und nah am 12-Monats-Tief), „üblich“ oder „teurer“.
- **Ohne Angebot** steht in „Deine Liste“: „Gerade kein Angebot · Üblich 1,99 € · Tiefst 1,69 € (Kaufland, März 2026)
  · je 150 g“, darunter Regulär und Quellen.
- Ältere Daten (ohne `preise`): wie bisher **„Tiefstpreis?“** mit ja / nein / unklar und dem ehrlichen Satz aus den Daten (`tiefst.text`). Steht auf derselben
  Karte ein im Ganzen billigeres Angebot (z. B. mit unklarer Packung), sagt die Seite nie „ja“ oder „Einziges
  Angebot“, sondern nennt es.
- Angebote, die erst später beginnen, stehen unter **„Bald günstig“** (nicht unter „Jetzt günstig“, nicht im Zähler).
- **„Normalpreis geschätzt“** nur noch bei älteren Daten.
- **Gültig** („bis heute, 19:00 Uhr“, „ab Mo 2.11.“) – in Berliner Zeit.
- Ist die Packungsgröße unsicher (`mengeSicher: false`), gibt es **keine Prozentangabe** und keinen Preis pro Stück.

**Preisfehler:** „vorher 96,99 € → jetzt 23,99 €“, „du sparst 73,00 € (−75 %)“, darunter klein die Quelle des
Vorher-Preises. Ohne bekannten Vorher-Preis steht „Originalpreis unbekannt“ – nie eine erfundene Zahl.

## Abgelaufenes

Die Daten kommen nur stündlich (Konzerte alle 3 h). Deshalb blendet die Seite selbst aus:

- alles mit `bis` / `gueltigBis` / `sichtbarBis` in der Vergangenheit (auch während die Seite offen ist – sie zeichnet
  sich zum nächsten Ende neu),
- Preisfehler und Technik-Deals 24 Stunden nach dem Melden – auch wenn die Deal-Seite ein späteres Ende nennt
  („bis …“ steht nur dabei, wenn dieses Ende vorher kommt),
- Vorteile alter Daten mit `frist` vor heute, Konzerte mit `datum` vor heute.

## Technik

- Eine Datei `index.html` (kein Framework), Symbole, `manifest.webmanifest`, `sw.js`.
- Alle Daten werden parallel geholt; der letzte Stand liegt im `localStorage` und erscheint sofort beim Öffnen.
  Ohne Netz bleibt er stehen (Stand-Zeile: „offline“). Ist nur eine Quelle gestört, steht „letzter Stand von
  17:35 Uhr – Quelle gerade gestört“ (auch oben im Reiter). Konzerte und Neuerscheinungen laden unabhängig.
- `sw.js` (nur `/mein-vorteil/`): Seite erst aus dem Netz, nach 3 s oder ohne Netz die letzte Kopie; Daten von
  `raw.githubusercontent.com` gehen nie durch den Worker.
- Liest ältere Datenformate mit (ohne `packung`/`mengeSicher`/`tiefst`/`bis`): dann ohne Prozent und Packung,
  Tiefstpreis „unklar“.
- Tests: `cd mein-vorteil && npm test` (Node ≥ 20, Playwright mit Chromium; ohne Playwright werden sie übersprungen).
  Fassung 5 in `test/fixtures/v5/` (`npm run fixtures:v5` = `werkzeug/baue-v5.mjs`: echte Scanner-Läufe mit ihren Fixtures). Echte Daten vom 31.10.2026 in `test/fixtures/echt-2026-10-31/` (`v1` = damaliges Produktionsformat,
  `v2` = dieselben Rohdaten durch die neuen Scanner), Sonderfälle in `test/fixtures/vertrag/`
  und `test/fixtures/vertrag-b/` (neu bauen: `npm run fixtures` = `werkzeug/baue-vertrag.mjs`; liegt absichtlich
  nicht unter `test/`, sonst führt `node --test` es aus). Bildschirmfotos: `MV_SHOTS=<ordner> npm test`.
