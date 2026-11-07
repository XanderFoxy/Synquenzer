# Mein Vorteil

**Eine Seite für alles:** Krypto, deine Produkte, krasse Preisfehler, Gewinnspiele, Cashback, Snacks, Auftritte, Remix-Contests.
<https://xanderfoxy.github.io/Synquenzer/mein-vorteil/> (Safari → Teilen → „Zum Home-Bildschirm“, dann wie eine App)

Die alten Seiten `schnaeppchen/`, `vorteile/` und `konzerte/` leiten sofort hierher weiter (`#angebote`,
`#vorteile`, `#konzerte`, absolut auf `/Synquenzer/mein-vorteil/?von=…`). In jedem alten Ordner bleibt ein kleiner
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

## Abschnitte (seit 07.11.2026: eine Seite statt Reitern)

Oben „Heute wichtig“ (höchstens 4 Zeilen), darunter eine Sprung-Leiste (bleibt oben, seitlich wischbar):
**Krypto · Meine Produkte · Preisfehler · Gewinnspiele · Cashback · Snacks · Auftritte · Remix · Mehr**.
Alte Marken zeigen auf den passenden Abschnitt: `#angebote` → Meine Produkte, `#vorteile` → Gewinnspiele,
`#konzerte` → Auftritte.

| Abschnitt | Inhalt | Daten |
|---|---|---|
| **Krypto** | Kurs BTC/ETH live (CoinGecko → Crypto.com → Coinbase, beim Öffnen und alle 60 s), je Coin Käufe (Betrag € inkl. Gebühren + Kurs oder Menge), „aktuelle Menge“ (Auto Earn), Wert, Gewinn/Verlust € und %, Ø-Kaufkurs, Gewinnschwelle; Pop-up bei Gewinn ↔ Verlust, +5 %, +10 %, −10 % | nur `localStorage` (`mein-vorteil-krypto`, Zone in `mein-vorteil-krypto-zone`) |
| **Meine Produkte** | Angebote zu Xanders Produkten (Liste bearbeitbar, nur auf dem Gerät) | `schnaeppchen-daten` + Radar-Deals |
| **Preisfehler** | nur krasse (≥ 75 % und ≥ 20 € unter Vorher-Preis, teures Gerät fast geschenkt, Spiele nur ≈ 1 €) | beide Wecker, Regeln `krass.mjs` |
| **Gewinnspiele** | nur laufende, ohne Kauf/Abo | `vorteile-daten` (tests) |
| **Cashback** | Geld zurück/Cashback nur zu Produkten, Snacks, Musik-Technik | Radar-Modul deals (`grund: 'cashback'`) |
| **Snacks**, **Auftritte** | andere Snack-Deals; Bands gesucht, Konzerte, Neuerscheinungen | Radar, `konzerte-daten` |
| **Remix** | laufende Remix-Contests (Synth-Pop, 80er, Italo, Euro-Disco, Elektro, Dark/New Wave), nach Einsendeschluss | Radar-Modul musik (`extra.art: 'remix'`) |
| **Mehr** | Erleben, Reisen, Nebenverdienst, Spar-Tipps, Vorlagen – eingeklappt | Radar |

„Prämien & Freunde werben“ (Strom, Bank, Konto, Freunde werben) zeigt die Seite nie, auch nicht aus alten Daten;
Deals ohne Bezug zu Produkten/Snacks/Musik-Technik fallen weg.

**Krypto-Import per Link:** `…/mein-vorteil/#krypto=btc:<menge>:<einsatz>,eth:<menge>:<einsatz>` – das Skript im `<head>`
nimmt das Fragment sofort per `history.replaceState` aus der Adresse, speichert nur in `localStorage` und zeigt
„übernommen“. Nichts davon geht ans Netz (Test: keine Anfrage enthält die Zahlen). Push bei geschlossener Seite: siehe
`krypto/` und `.github/workflows/krypto.yml` (Secrets `KRYPTO`, `KRYPTO_NTFY_TOPIC`).

**Platz für weitere Reiter (z. B. „Filme“):** `<a href="#filme" data-reiter="filme">Filme<span class="n"></span></a>` in die
Leiste, `<section id="p-filme" class="reiter-seite" hidden>` nach `</main>`, `REITER_START.filme = el => …` (läuft beim
ersten Öffnen), optional `REITER_NEU.filme` (↻). Abschnitts-Links führen zurück.

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
  Echte Daten vom 31.10.2026 in `test/fixtures/echt-2026-10-31/` (`v1` = damaliges Produktionsformat,
  `v2` = dieselben Rohdaten durch die neuen Scanner), Sonderfälle in `test/fixtures/vertrag/`
  und `test/fixtures/vertrag-b/` (neu bauen: `npm run fixtures` = `werkzeug/baue-vertrag.mjs`; liegt absichtlich
  nicht unter `test/`, sonst führt `node --test` es aus). Bildschirmfotos: `MV_SHOTS=<ordner> npm test`.
