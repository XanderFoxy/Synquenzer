# Vorteils-Radar

Ein Ort für alle Vorteile – ohne selbst suchen zu müssen.
Der Radar schaut jede Stunde nach, rechnet nach und meldet sich nur, wenn sich etwas wirklich lohnt.

**Seite (auch als App auf dem Home-Bildschirm):** https://xanderfoxy.github.io/Synquenzer/vorteile/
(Safari → Teilen → „Zum Home-Bildschirm“)

## Was er macht

| Bereich | Was gesucht wird | Quellen |
|---|---|---|
| **Schnäppchen** | deine Lieblings-Snacks (vom Schnäppchen-Wecker) | Zweig `schnaeppchen-daten` |
| **Konzerte** | deine Bands im Umkreis (vom Konzert-Alarm) | Zweig `konzerte-daten` |
| **Deals** | jeder Deal wird *echt* durchgerechnet: „2 für 1“, „3 zum Preis von 2“, „zweite gratis“, Bündelpreise („2 Tüten für 0,88 €“), „+25 g gratis“, Limits pro Kunde, Markt-Coupons + Cashback (stapelbar), Versand. Ergebnis: Preis pro Packung und pro 100 g. Eine Packung, die pro 100 g teurer ist, wird nie empfohlen. | Schnäppchen-Daten, mydealz-RSS |
| **Erleben** | Therme/Erlebnisbad, Kino, Freizeit, Stadtfeste in der Region – nur wenn ungewöhnlich gut (großer Rabatt, gratis, sehr beliebt) | mydealz-Suche, Google-News-RSS |
| **Reisen** | Flug-, Bahn- und Urlaubs-Knaller ab Leipzig/Dresden/Berlin, Preisfehler | mydealz Reisen, Urlaubspiraten, Urlaubsguru |
| **Musik** | Wunsch-Synths unter Zielpreis oder auf Tiefstpreis; „Bands gesucht“ und Open Calls mit Frist | mydealz-Suche, optional Geizhals, Google-News-RSS |
| **Nebenverdienst** | Deutschunterricht/Nachhilfe (auch online), Übersetzung Deutsch↔Arabisch/Englisch, KI-Bild/Video, kleine kreative Jobs – von zu Hause | Jobsuche-API der Arbeitsagentur |
| **Tests & Gewinnspiele** | Produkttests (Technik, Snacks) und Gewinnspiele mit attraktivem Preis und echten Chancen – Fallen (Gewinnspiel-Services, Abos, SMS, Kosten) fliegen raus | mydealz, Google-News-RSS |
| **Prämien & Freunde werben** | Werbeprämien (Freunde werben), Konto-/Neukundenprämien, Cashback, Strom-/Gas-/Handy-Wechselbonus, Payback-/Coupon-Extrapunkte, Gratis-Produkte, Geld-zurück-Aktionen, App-Startprämien. Pro Eintrag: Prämie, Kosten (Gebühr × Laufzeit, Versand), **netto**, Aufwand in Minuten, Haken (Mindestumsatz, Geldeingang, Laufzeit, Kündigung, Schufa). Sortiert nach **netto pro Stunde Aufwand**. Strikt raus: Schneeball/MLM, Krypto/Trading, Glücksspiel, Abo-Fallen, Vorkasse, fremde Daten, Umfrage-Seiten, Kredite | mydealz-RSS (Freebies + Suchen), gepflegte Liste in `config.json` |
| **Spar-Tipps** | kurze Anleitung: [spartipps.html](spartipps.html) | – |

Jeder Eintrag hat einen direkten Link und eine Zeile **„So geht's“**. Auf der Seite gibt es außerdem
Vorlagen zum Kopieren (Band-Bewerbung, Antwort auf Deutschunterricht, Übersetzungs-Angebot).

Beispiel Deal-Mathe (ist auch ein Test): Crunchips normal 1,99 € (150 g). Kaufland „2 Tüten für 0,88 €“, 5× erlaubt,
Tüten mit +25 g → **10 Tüten für 4,40 € statt 19,90 € (−78 %), ca. 0,25 € statt 1,33 € pro 100 g.**

## Push aufs iPhone (ntfy)

Gleicher Kanal wie der Schnäppchen-Wecker – du brauchst nur **ein** Abo:

1. App **ntfy** aus dem App Store laden.
2. „+“ → Thema `xander-schnaeppchen-b5cbf4442aaa9734f3` → Server `ntfy.sh` → abonnieren.

Zwei Stufen:

- **Sofort** – nur Seltenes: Preisfehler, Geräte unter deinem Zielpreis oder auf Tiefstpreis, Band-Aufrufe mit Frist,
  außergewöhnliche Reise-Deals, Prämien ab 25 € netto oder Gratis-Produkte ohne Haken ab 10 € Wert
  (Prämien: höchstens 1 pro Lauf). **Höchstens 3 pro Tag.**
- **Zusammenfassung** – alles andere **einmal am Tag ab 18 Uhr**, als eine einzige Nachricht. Wenn nichts Neues da ist, kommt nichts.

Jede Sache wird nur einmal gemeldet. Beim allerersten Lauf kommt nur eine Nachricht „Vorteils-Radar ist aktiv“.
Kommt ein neuer Bereich dazu (z. B. Prämien), wird beim ersten Lauf nichts nachgemeldet – die Einträge stehen nur auf der Seite.

**Ein Kanal für alle drei Wecker:** Wenn du lieber ein eigenes, geheimes Thema willst, lege im Repo unter
*Settings → Secrets and variables → Actions* das Secret `NTFY_TOPIC` an. Schnäppchen-Wecker, Konzert-Alarm und
Vorteils-Radar benutzen es dann alle. (Achtung: Der Konzert-Alarm hat ohne Secret ein eigenes Thema.)

## Listen ändern

Alles in normalen Textdateien – auf GitHub die Datei öffnen, auf den Stift tippen, ändern, „Commit changes“.

- **`wunschliste.json`** – deine Wunsch-Geräte. Pro Gerät:
  `name`, `suche` (Suchwort), `zielpreis` (ab hier kommt sofort ein Push), `normalpreis` (grobe Schätzung),
  optional `geizhals` (Adresse der Geizhals-Seite des Geräts) und `nicht` (Wörter, die Zubehör aussortieren).
  Mit `"aktiv": false` pausierst du ein Gerät. Die eingetragenen Preise sind Schätzungen – bitte anpassen.
- **`config.json`** – Wörter und Suchen pro Bereich, z. B.:
  - `region` – Orte, die als „in der Nähe“ gelten,
  - `module.reisen.abflug` – deine Abflughäfen,
  - `module.musik.aufrufe` – Suchen für „Bands gesucht“,
  - `module.nebenverdienst.ba.suchen` – Job-Suchen (`arbeitszeit: "ho"` = Homeoffice, `"mj"` = Minijob),
  - `module.tests.fallenWoerter` – was nie vorkommen darf,
  - `module.praemien.programme` – gepflegte Liste seriöser Programme (Prämie als **Richtwert**, Aufwand, Haken, Link) –
    vor dem Abschluss immer die aktuellen Bedingungen auf der Seite prüfen,
  - `module.praemien.ausschluss` – was bei Prämien nie vorkommen darf; `sofortAbNetto` (25 €) und `gratisSofortAbWert` (10 €) für Pushes,
  - `ntfy.maxSofortProTag` und `ntfy.digestStunde`,
  - `module.<bereich>.aktiv: false` schaltet einen Bereich aus.
  `"a|b"` heißt in allen Wort-Listen: a oder b.

## API-Schlüssel

Es wird **kein** Schlüssel gebraucht. Die Jobsuche der Arbeitsagentur nutzt den öffentlichen Schlüssel `jobboerse-jobsuche`
(steht schon in `config.json`). Optional:

| Secret | Wofür | Woher |
|---|---|---|
| `NTFY_TOPIC` | eigenes Push-Thema für alle drei Wecker | frei ausdenken (lang und zufällig) |
| `NTFY_TOKEN` | nur bei geschütztem/eigenem ntfy-Server | ntfy-Konto → Access Tokens |

Preis-Historie für Synths: Ohne Schlüssel führt der Radar seine eigene Tiefstpreis-Liste (ab 7 Tagen Verlauf zählt „Tiefstpreis“).
Wer mehr will, trägt bei einem Gerät die Geizhals-Adresse ein (wird höchstens alle 6 Stunden einmal abgerufen).

## Technik

- `scan/main.mjs` ruft die fälligen Module auf (Intervalle in `config.json`, z. B. Deals stündlich, Jobs alle 12 Stunden).
  Fällt eine Quelle aus, laufen die anderen weiter; die alten Einträge bleiben stehen.
- `scan/rechnen.mjs` – die Deal-Mathe. `scan/benachrichtigen.mjs` – Sofort/Zusammenfassung, Dedupe, Tageslimit.
- `scan/module/*.mjs` – ein Modul pro Bereich. `scan/lib/` – Abruf (höflich: eigener User-Agent, Pause pro Server), RSS, Text.
  Gleiches Muster und gleiches Datenformat wie `schnaeppchen/scan/` und `konzerte/scan/`.
- Workflow `.github/workflows/vorteile.yml`: stündlich um :41, plus manuell (*Actions → Vorteils-Radar → Run workflow*,
  mit „digest“ für eine Zusammenfassung sofort oder „alle“, um alles neu abzufragen).
  Die Daten landen auf dem Zweig **`vorteile-daten`** (`vorteile/data/aktuell.json`, `zustand.json`), nicht auf `main`.
- Die Seite liest ihre Daten von `raw.githubusercontent.com` (Zweige `vorteile-daten`, `schnaeppchen-daten`, `konzerte-daten`).

Lokal testen (ohne Internet, mit aufgezeichneten Antworten):

```sh
cd vorteile
npm test                 # alle Tests
npm run probe            # kompletter Lauf mit Fixtures, nichts wird gesendet
```

**Wichtig:** GitHub führt Zeitpläne (und den „Run workflow“-Knopf) nur für Workflows aus, die auf dem Standardzweig (`main`) liegen.
Der Radar startet also, sobald der Zweig `vorteile` in `main` übernommen ist.
