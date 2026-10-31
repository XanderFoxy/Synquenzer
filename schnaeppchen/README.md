# Schnäppchen-Wecker

Ein persönlicher Preisalarm. Er sucht **jede Stunde von selbst** nach deinen Lieblingsprodukten –
in den Prospekten der Märkte in Döbeln (04720) und online – und schickt dir **nur dann** eine
Push-Nachricht aufs iPhone, wenn etwas **wirklich günstig** ist. In der Nachricht steckt der direkte Link.

- **Übersicht:** <https://xanderfoxy.github.io/Synquenzer/mein-vorteil/#angebote> – eine Seite für Angebote,
  Preisfehler, Vorteile und Konzerte (Safari → Teilen → „Zum Home-Bildschirm“, dann wie eine App).
  Die alte Adresse `…/schnaeppchen/` leitet dorthin weiter.
- **Push-Thema (ntfy):** `xander-schnaeppchen-b5cbf4442aaa9734f3`

## Push-Nachrichten einrichten (3 Schritte)

1. Im App Store die kostenlose App **„ntfy“** laden und öffnen, Mitteilungen erlauben.
2. Unten auf **„+“** tippen, als Thema eingeben: `xander-schnaeppchen-b5cbf4442aaa9734f3`
   (Server bleibt `ntfy.sh`), dann **„Subscribe“**.
3. Fertig. Tippst du auf eine Nachricht, öffnet sich direkt das Angebot.

Tipp: Wer das Thema kennt, kann mitlesen. Deshalb ist der Name lang und zufällig. Soll es geheim
bleiben, ein eigenes Thema als Actions-Secret `NTFY_TOPIC` hinterlegen und in der App dieses abonnieren.

## Was er macht

- **Märkte in Döbeln:** Prospekt-Angebote für die PLZ 04720 über marktguru. Gezählt werden die Ketten aus
  `config.json` → `maerkte.erlaubt` (Kaufland, Lidl, Aldi Nord, Netto Marken-Discount, Penny, Rewe, Edeka, …).
  marktguru liefert nur Märkte, die es rund um die PLZ wirklich gibt – eine Kette ohne Filiale in Döbeln
  taucht einfach nicht auf. Großhandel zählt nie (`maerkte.ausgeschlossen`, z. B. „EDEKA Foodservice“ mit
  „NUR FÜR GROSSHÄNDLER“).
- **Abgelaufen = weg:** ein Prospekt-Angebot verschwindet in dem Moment, in dem es endet (z. B. Kaufland Sa 19:00),
  nicht erst Stunden später. Angebote, die erst später beginnen, stehen mit „ab …“ da.
- **Online:** mydealz-Feeds (neu, heiß, Gruppe „Preisfehler“, Lebensmittel), darin auch Amazon. (Die mydealz-Suche als
  RSS gibt es seit Oktober 2026 nicht mehr – HTTP 404 –, deshalb ist sie aus.) Deals aus Läden („[Penny] …“) zählen
  wie Prospekt-Angebote, ohne Versand. Sammeldeals („Ben Jerrys 3,49 / Kartoffeln 7,5 kg 4,44 / …“) zählen nur mit
  ihrem eigenen Teil und ohne sichere Menge.
  Versandkosten werden mitgerechnet: Amazon ab 39 € kostenlos (sonst 3,99 €, siehe `config.json` → `versand`),
  andere Shops nur ohne Aufpreis, wenn der Deal „versandkostenfrei“ sagt – sonst 4,95 € dazu.
  Ist es danach kein Deal mehr, kommt keine Nachricht.
- **Fair verglichen:** immer **pro Stück**, **pro 100 g** oder **pro 100 ml** – ein 24er-Knoppers-Karton
  gegen vier 5er-Packungen wird also richtig bewertet. Deshalb gibt es pro Produkt **eine** Karte (z. B. „Knoppers
  Schnitte“), und beim Angebot steht seine echte Packung („15 × 25 g“).
- **Packungsgröße ehrlich:** zuerst aus den Daten des Prospekts (Packung in kg/l, gegengeprüft mit Preis ÷ Grundpreis),
  sonst aus dem Text. Grundpreis-Angaben („1 kg = 7,44“, „100 g = 0,99 €“) sind nie die Packung. Stückzahlen nur aus
  klaren Angaben („15 St.“, „15er“, „15 x 25 g“) oder aus dem sicheren Gewicht. Ist die Menge unklar, steht
  „Menge unklar“ da – dann gibt es **keine Prozentangabe und keine Nachricht**.
- **Normalpreis** = Median der letzten 8 Wochen (pro Tag der niedrigste gesehene Preis). Solange noch
  weniger als 5 Tage Verlauf da sind, gilt der geschätzte `normalpreis` aus `watchlist.json` – das steht dann
  ausdrücklich da („normal ca. 0,30 € (geschätzt)“, `normalQuelle: "schaetzung"`). Die Schätzung kann je
  Packungsgröße verschieden sein (`normalpreisStaffel`, z. B. Knoppers: einzeln ca. 0,55 €, 15er-Familienpackung ca.
  0,30 € pro Stück) – dann zählt die Stufe der Packung des Angebots. Gegen eine Schätzung kommt die Nachricht nie mit
  höchster Dringlichkeit.
- **Deal**, wenn der Grundpreis **mindestens 25 % unter dem Normalpreis** liegt, oder (sobald genug Verlauf da ist)
  auf/unter dem **bisherigen Tiefstpreis** und mindestens 10 % günstiger als normal. Gegen einen nur **geschätzten**
  Normalpreis zählt es nur, wenn es das **günstigste aktuelle Angebot** ist und nicht unglaubwürdig weit darunter
  liegt (> 60 % = eher ein Lesefehler).
- **„Ist das der Tiefstpreis?“** steht bei jedem Produkt als kurzer Satz (`tiefst.text`), z. B. „Günstigstes von
  3 gefundenen Angeboten in deiner Nähe · Verlauf erst seit 1 Tag“ („gefunden“: geprüft sind nur marktguru und mydealz), „… · so günstig wie nie in 30 Tagen“ oder
  „Schon günstiger gesehen: 0,17 € pro Stück am 12.10. bei Lidl“. marktguru liefert keinen Preisverlauf; der
  eigene Verlauf wächst jede Stunde. Am Anfang heißt die ehrliche Antwort deshalb „unbekannt“. Gezählt werden **alle**
  Angebote: ist eines mit unklarer Packung im Ganzen billiger, steht genau das da („PENNY hat 3,49 € (mit App, ab Mo
  2.11.) – Packungsgröße dort nicht sicher“), nie „Einziges gefundenes Angebot“. Daten wie auf der Seite: „Mo 2.11.“.
- **mydealz-Angebote für die Merkliste** (z. B. aus Sammeldeals): Beginn („Ab Montag den 2.11.“), Ende („bis 7.11.“,
  „nur am Donnerstag 29.10.“) und „mit App“ („3,49 Euro mit App bzw. 3,99 Euro ohne App“) werden aus dem Text gelesen;
  ohne Ende höchstens 72 Stunden ab Veröffentlichung bzw. Beginn (wie beim Vorteils-Radar). Laden-Wochenangebote mit
  Beginn („[Penny] … ab Montag“) bleiben ohne Ende bis Samstag dieser Woche sichtbar. Ein Vorher-Preis aus dem eigenen
  Satz („Der reguläre Preis sind inzwischen 6,99 Euro“) steht als `preisVorher` dabei.
- **Zwei Packungen zum selben Preis** („465/4x100ml“): beide werden genannt („465 ml oder 4 × 100 ml“), gerechnet wird
  mit der teureren pro 100 ml; `einheitspreisVarianten` nennt beide Grundpreise (Karte und Push: „1,00 € pro 100 ml
  (bei 4 × 100 ml; 465 ml: 0,86 €)“ – der Prospekt rechnet mit 465 ml).
- **Technik-Preisfehler:** Fernseher, Konsolen, Kopfhörer usw. aus mydealz – Nachricht, wenn als Preisfehler
  gemeldet oder **mindestens 60 % unter dem Vergleichspreis** (Titel der Nachricht: „Preisfehler? …“ bzw.
  „Technik-Deal: …“). Immer mit **vorher → jetzt**: „vorher 96,99 € →
  jetzt 23,99 € (−75 %)“. „Vorher“ ist der Vergleichspreis von mydealz (von der Deal-Seite), sonst UVP/„statt“
  aus dem Deal-Text (mit Quelle dabei), sonst „Vorher-Preis unbekannt“.
- **Keine abgelaufenen Preisfehler:** Preisfehler sind oft nach Minuten vorbei. Deshalb nur Meldungen der letzten
  24 Stunden (wie beim Vorteils-Radar), und jede wird auf ihrer mydealz-Seite geprüft (höchstens 10 Seiten pro Lauf,
  gemerkt in `dealseiten.json`): steht dort „abgelaufen“ oder „vielleicht abgelaufen“, liegt das Ende der Deal-Seite
  schon in der Vergangenheit oder ist die Seite nicht lesbar, wird sie nicht gezeigt. Steckt der Versand schon im Preis
  („0,99 € + VSK“, Deal-Preis 6,98 €), steht `versand: 0` und `versandInklusive: true`.
- **Keine Doppel-Nachrichten:** jedes Angebot (Produkt, Shop, Preis, Gültigkeit) meldet sich nur einmal,
  höchstens 8 Nachrichten pro Stunde.
- **TikTok Shop** ist nicht dabei: es gibt keine offene Schnittstelle, und Abgreifen der App wäre gegen die Regeln.

## Produkt hinzufügen

In `watchlist.json` einen Block kopieren und anpassen, z. B.:

```json
{
  "id": "milka-alpenmilch",
  "name": "Milka Alpenmilch",
  "suche": ["Milka Alpenmilch"],
  "muss": ["milka", "alpenmilch"],
  "nicht": ["riegel"],
  "basis": "100g",
  "standardGramm": 100,
  "normalpreis": 1.49
}
```

| Feld | Bedeutung |
|---|---|
| `id` | kurzer eindeutiger Name (klein, ohne Leerzeichen) |
| `name` | so steht es auf der Seite und in der Nachricht – ohne Packungsgröße, die steht beim Angebot |
| `suche` | Suchwörter für die Prospekte (marktguru, mydealz-Suche) |
| `muss` | diese Wörter müssen im Angebot stehen; `"a\|b"` = eins von beiden. Kurze Wörter (bis 4 Buchstaben) zählen nur am Wortanfang („eis“ trifft „Eiscreme“, nicht „Preis“) |
| `sorte` | Sorte (z. B. „rote fruechte“); Angebote mit „versch. Sorten“ zählen trotzdem |
| `nicht` | Angebote mit diesen Wörtern werden ignoriert – für andere Sorten/Formen desselben Namens (z. B. Knoppers `mini`, `riegel`) |
| `basis` | `stueck`, `100g` oder `100ml` – womit verglichen wird |
| `stueckGramm` | Gewicht eines Stücks (rechnet Gramm ↔ Stück um) |
| `stueckMin` / `stueckMax` | nur Packungen mit so vielen Stück (z. B. 24er ≥ 15) |
| `standardGramm` / `standardMl` / `standardStueck` | Packungsgröße, falls das Angebot sie nicht nennt |
| `normalpreis` | geschätzter Normalpreis **pro Basis** (z. B. € pro Stück), bis genug Verlauf da ist |
| `normalpreisFest` | `true` = immer diesen Normalpreis nehmen statt des Verlaufs |
| `gruppe` | gleicher Wert = gemeinsamer Preisverlauf (z. B. Knoppers 5er und 24er) |
| `asins` | Amazon-ASINs (nur mit Keepa-Schlüssel), z. B. `["B0..."]` |

Umlaute in `muss`/`nicht`/`sorte` als ae/oe/ue/ss schreiben. Nach dem Speichern auf `main` läuft die Suche sofort einmal.
Technik-Suchwörter stehen unter `technik.woerter`.

## Optional: Keepa (Amazon-Preisverlauf)

Mit einem Keepa-API-Schlüssel (kostenpflichtig, <https://keepa.com/#!api>) werden Amazon-Preise samt Verlauf direkt
geprüft. Dazu im Repo unter **Settings → Secrets and variables → Actions → New repository secret** den Namen
`KEEPA_KEY` mit dem Schlüssel anlegen und bei den Produkten `asins` eintragen. Ohne Schlüssel läuft alles weiter
über mydealz und den eigenen Preisverlauf.

## Technik (für Entwickler)

- `scan/main.mjs` – ein Lauf: Quellen abfragen → zuordnen → Grundpreise → Verlauf → Deals → `current.json` → ntfy
- `scan/sources/` – marktguru, mydealz, Keepa. Jede Quelle für sich: fällt eine aus, laufen die anderen weiter,
  der Fehler steht in `current.json` (`fehler`, `quellen`) und unten auf der Seite.
- Workflow `.github/workflows/schnaeppchen.yml` – stündlich um :17, manuell (mit „dry run“) und bei Änderungen
  an `watchlist.json`/`config.json`/`scan/` auf `main`. Zeitpläne laufen bei GitHub nur vom Standardzweig (`main`).
- Daten (`current.json`, `history.json`, `sent.json`, `dealseiten.json`) liegen auf dem Zweig **`schnaeppchen-daten`**
  (ein einziger Commit, wird jede Stunde ersetzt), damit GitHub Pages nicht stündlich neu baut.
  Die Seite liest sie von `raw.githubusercontent.com`.
- Tests: `cd schnaeppchen && npm test` (Node ≥ 20, keine Abhängigkeiten).
  Probelauf ohne Netz mit aufgezeichneten Antworten: `node scan/main.mjs --fixtures --data /tmp/probe`.
  Einen echten Roh-Mitschnitt offline nachrechnen: `node scan/main.mjs --wiedergabe <roh-ordner> --data /tmp/probe --jetzt 2026-10-31T16:35:00Z`
  (ein Auszug vom 31.10.2026 liegt in `scan/test/fixtures/echt-2026-10-31/`, ohne marktguru-Startseite → dafür
  `MARKTGURU_API_KEY=x MARKTGURU_CLIENT_KEY=y` setzen; `scan/test/echt.test.mjs` prüft damit Knoppers & Co.).
- `current.json` (Version 2) pro Angebot: `titel`, `packung` („15 × 25 g“), `menge`, `mengeSicher`, `mengeQuelle`
  (`grundpreis`/`text`/`vorgabe`), `preisVorher`, `ab`/`bis` (ISO), `zeile` (fertiger Satz); pro Produkt `tiefst`
  (`status` ja/nein/unbekannt, `text`, `heuteGuenstigstes`, `tage`, `tiefst30`, `anzahl` = alle glaubhaften
  Angebote, `anzahlSicher`), `normalQuelle`, `normalGeschaetzt`, `normalJePackung`; pro Angebot außerdem `unsicher`
  (unplausibel – nie als Hauptkarte), `hinweis`/`nurMitApp`/`preisOhneApp` und bei mydealz `datum`/`sichtbarBis`;
  pro Preisfehler `preis`, `preisVorher`, `vorherQuelle`, `ersparnisEuro`, `ersparnisProzent`, `datum`, `bis`,
  `versandInklusive`. `scan/ende.mjs` ist eine Kopie von `vorteile/scan/lib/ende.mjs` (gleiche Regeln).
- `history.json` Version 2: Verläufe der Version 1 (vor dem 31.10.2026, mit falschen Packungsgrößen wie Knoppers
  0,07 €/Stück) werden beim ersten Lauf einmal verworfen.
  Echter Lauf ohne Push: `node scan/main.mjs --dry-run`.
- Roh-Mitschnitt für die Fehlersuche: *Run workflow* mit Haken **roh** → kein Push, nichts auf den Daten-Zweig; alle Quell-Antworten (je max. 2 MB, Schlüssel geschwärzt) und das berechnete Ergebnis landen auf dem Zweig **`roh-daten`** unter `schnaeppchen/<Lauf-Nr.>/` (`index.json`, `quellen/`, `ausgabe/`). Lokal: `ROH_DIR=/tmp/roh node scan/main.mjs`.
- Höflich abfragen: eigener User-Agent, 1,5 s Pause pro Server, eine Suche pro Produkt und Stunde, keine Logins,
  keine Amazon-Produktseiten.
- Seite lokal: `cd schnaeppchen && python3 -m http.server`, dann `http://localhost:8000/?lokal` (liest `data/current.json`).
