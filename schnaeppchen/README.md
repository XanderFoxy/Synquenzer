# Schnäppchen-Wecker

Ein persönlicher Preisalarm. Er sucht **jede Stunde von selbst** nach deinen Lieblingsprodukten –
in den Prospekten der Märkte in Döbeln (04720) und online – und schickt dir **nur dann** eine
Push-Nachricht aufs iPhone, wenn etwas **wirklich günstig** ist. In der Nachricht steckt der direkte Link.

- **Übersicht:** <https://xanderfoxy.github.io/Synquenzer/schnaeppchen/>
  (Safari → Teilen → „Zum Home-Bildschirm“, dann wie eine App)
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
  taucht einfach nicht auf.
- **Online:** mydealz-Feeds (neu, heiß, Gruppe „Preisfehler“, Lebensmittel, Suche je Produkt), darin auch Amazon.
  Versandkosten werden mitgerechnet: Amazon ab 39 € kostenlos (sonst 3,99 €, siehe `config.json` → `versand`),
  andere Shops nur ohne Aufpreis, wenn der Deal „versandkostenfrei“ sagt – sonst 4,95 € dazu.
  Ist es danach kein Deal mehr, kommt keine Nachricht.
- **Fair verglichen:** immer **pro Stück**, **pro 100 g** oder **pro 100 ml** – ein 24er-Knoppers-Karton
  gegen vier 5er-Packungen wird also richtig bewertet.
- **Normalpreis** = Median der letzten 8 Wochen (pro Tag der niedrigste gesehene Preis). Solange noch
  weniger als 5 Tage Verlauf da sind, gilt der geschätzte `normalpreis` aus `watchlist.json` (auf der Seite mit „≈“).
- **Deal**, wenn der Grundpreis **mindestens 25 % unter dem Normalpreis** liegt, oder (sobald genug Verlauf da ist)
  auf/unter dem **bisherigen Tiefstpreis** und mindestens 10 % günstiger als normal.
- **Technik-Preisfehler:** Fernseher, Konsolen, Kopfhörer usw. aus mydealz – Nachricht, wenn als Preisfehler
  gemeldet oder **mindestens 60 % unter dem Normalpreis**.
- **Keine Doppel-Nachrichten:** jedes Angebot (Produkt, Shop, Preis, Gültigkeit) meldet sich nur einmal,
  höchstens 8 Nachrichten pro Stunde.
- **TikTok Shop** ist nicht dabei: es gibt keine offene Schnittstelle, und Abgreifen der App wäre gegen die Regeln.

## Produkt hinzufügen

In `watchlist.json` einen Block kopieren und anpassen, z. B.:

```json
{
  "id": "milka-alpenmilch",
  "name": "Milka Alpenmilch 100 g",
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
| `name` | so steht es auf der Seite und in der Nachricht |
| `suche` | Suchwörter für die Prospekte (marktguru, mydealz-Suche) |
| `muss` | diese Wörter müssen im Angebot stehen; `"a\|b"` = eins von beiden |
| `sorte` | Sorte (z. B. „rote fruechte“); Angebote mit „versch. Sorten“ zählen trotzdem |
| `nicht` | Angebote mit diesen Wörtern werden ignoriert |
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
- Daten (`current.json`, `history.json`, `sent.json`) liegen auf dem Zweig **`schnaeppchen-daten`**
  (ein einziger Commit, wird jede Stunde ersetzt), damit GitHub Pages nicht stündlich neu baut.
  Die Seite liest sie von `raw.githubusercontent.com`.
- Tests: `cd schnaeppchen && npm test` (Node ≥ 20, keine Abhängigkeiten).
  Probelauf ohne Netz mit aufgezeichneten Antworten: `node scan/main.mjs --fixtures --data /tmp/probe`.
  Echter Lauf ohne Push: `node scan/main.mjs --dry-run`.
- Roh-Mitschnitt für die Fehlersuche: *Run workflow* mit Haken **roh** → kein Push, nichts auf den Daten-Zweig; alle Quell-Antworten (je max. 2 MB, Schlüssel geschwärzt) und das berechnete Ergebnis landen auf dem Zweig **`roh-daten`** unter `schnaeppchen/<Lauf-Nr.>/` (`index.json`, `quellen/`, `ausgabe/`). Lokal: `ROH_DIR=/tmp/roh node scan/main.mjs`.
- Höflich abfragen: eigener User-Agent, 1,5 s Pause pro Server, eine Suche pro Produkt und Stunde, keine Logins,
  keine Amazon-Produktseiten.
- Seite lokal: `cd schnaeppchen && python3 -m http.server`, dann `http://localhost:8000/?lokal` (liest `data/current.json`).
