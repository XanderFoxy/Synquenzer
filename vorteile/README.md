# Vorteils-Radar

Ein Ort für alle Vorteile – ohne selbst suchen zu müssen.
Der Radar schaut jede Stunde nach, rechnet nach und meldet sich nur, wenn sich etwas wirklich lohnt.

**Seite (auch als App auf dem Home-Bildschirm):** https://xanderfoxy.github.io/Synquenzer/mein-vorteil/#vorteile
(Safari → Teilen → „Zum Home-Bildschirm“) – eine Seite für Angebote, Preisfehler, Vorteile und Konzerte; die alte
Adresse `…/vorteile/` leitet dorthin weiter.

## Was er macht

| Bereich | Was gesucht wird | Quellen |
|---|---|---|
| **Schnäppchen** | deine Lieblings-Snacks (vom Schnäppchen-Wecker) | Zweig `schnaeppchen-daten` |
| **Konzerte** | deine Bands im Umkreis (vom Konzert-Alarm) | Zweig `konzerte-daten` |
| **Deals** | jeder Deal wird *echt* durchgerechnet: „2 für 1“, „3 zum Preis von 2“, „zweite gratis“, Bündelpreise („2 Tüten für 0,88 €“), „+25 g gratis“, Limits pro Kunde, Markt-Coupons + Cashback (stapelbar), Versand. Ergebnis: Preis pro Packung und pro 100 g. Eine Packung, die pro 100 g teurer ist, wird nie empfohlen. Ohne echte Mehrkauf-Aktion wird **genau 1 Packung** gerechnet. Der mydealz-Preis ist der Endpreis: ein Coupon darin („2,49 € − 1 € Coupon = 1,49 €“) wird nicht noch einmal abgezogen. „Statt“ = Vergleichspreis der mydealz-Deal-Seite, sonst der niedrigste Vergleichswert aus dem Text (nicht die höhere UVP). Amazon ohne Prime: unter 39 € + 3,99 € Versand. | Schnäppchen-Daten, mydealz-RSS |
| **Erleben** | Therme/Erlebnisbad, Kino, Freizeit, Stadtfeste in der Region – nur wenn ungewöhnlich gut (großer Rabatt, gratis, sehr beliebt) | mydealz-Suche, Google-News-RSS |
| **Reisen** | Flug-, Bahn- und Urlaubs-Knaller ab Leipzig/Dresden/Berlin, Preisfehler | mydealz Reisen, Urlaubspiraten, Urlaubsguru |
| **Musik** | Wunsch-Synths unter Zielpreis oder auf Tiefstpreis; „Bands gesucht“ und Open Calls mit Frist | mydealz-Suche, optional Geizhals, Google-News-RSS |
| **Nebenverdienst** | Deutschunterricht/Nachhilfe (auch online), Übersetzung Deutsch↔Arabisch/Englisch, KI-Bild/Video, kleine kreative Jobs – von zu Hause | Jobsuche-API der Arbeitsagentur |
| **Tests & Gewinnspiele** | Produkttests (Technik, Snacks) und Gewinnspiele mit attraktivem Preis und echten Chancen – Fallen (Gewinnspiel-Services, Abos, SMS, Kosten) fliegen raus | mydealz, Google-News-RSS |
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
  außergewöhnliche Reise-Deals. **Höchstens 3 pro Tag.**
- **Zusammenfassung** – alles andere **einmal am Tag ab 18 Uhr**, als eine einzige Nachricht. Wenn nichts Neues da ist, kommt nichts.

Jede Sache wird nur einmal gemeldet. Beim allerersten Lauf kommt nur eine Nachricht „Vorteils-Radar ist aktiv“.

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
- Roh-Mitschnitt für die Fehlersuche: *Run workflow* mit Haken **roh** → alle Module, kein Push, nichts auf den Daten-Zweig; alle Quell-Antworten (je max. 2 MB, Schlüssel geschwärzt) und das berechnete Ergebnis landen auf dem Zweig **`roh-daten`** unter `vorteile/<Lauf-Nr.>/` (`index.json`, `quellen/`, `ausgabe/`). Lokal: `ROH_DIR=/tmp/roh node scan/main.mjs`.
- Die Seite liest ihre Daten von `raw.githubusercontent.com` (Zweige `vorteile-daten`, `schnaeppchen-daten`, `konzerte-daten`).

Lokal testen (ohne Internet, mit aufgezeichneten Antworten):

```sh
cd vorteile
npm test                 # alle Tests
npm run probe            # kompletter Lauf mit Fixtures, nichts wird gesendet
```

**Wichtig:** GitHub führt Zeitpläne (und den „Run workflow“-Knopf) nur für Workflows aus, die auf dem Standardzweig (`main`) liegen.
Der Radar startet also, sobald der Zweig `vorteile` in `main` übernommen ist.

## Enddaten: was abgelaufen ist, fliegt raus

Alles mit einem Ende bekommt `bis` (ISO-Zeit, UTC) und wird beim Scan entfernt, sobald `bis` vorbei ist
(`scan/lib/ende.mjs`). Die Seite blendet zusätzlich alles aus, dessen `bis` oder `sichtbarBis` vorbei ist
(Daten kommen nur stündlich).

- **Woher das Ende kommt** (`bisQuelle`): `feld` = Feld der Quelle (Schnäppchen-Angebot `gueltigBis`, mit Uhrzeit –
  Kaufland endet z. B. 19:00), `deal-seite` = mydealz-Deal-Seite, `text` = aus dem Text („bis 07.11.2026“,
  „Teilnahmeschluss: 19.01.2027“, „läuft nur noch bis zum 8. November“, „bis zum 08.11.2026 um 00:59“).
  Ohne Uhrzeit gilt 23:59 Uhr Berliner Zeit. Ohne Jahr gilt dieses Jahr – liegt das Datum dann mehr als 2 Monate
  zurück, das nächste. Reise- und Aufenthaltszeiträume („Reisezeitraum bis 31.03.“, „für den Zeitraum 13.11. bis
  16.11.“) zählen nicht als Ende, ebenso ein bloßes „bis …“, das mehr als 45 Tage nach dem Beitrag liegt.
- **Ohne bekanntes Ende** gilt ein Höchstalter ab Veröffentlichung (`sichtbarBis`):

  | Art | Höchstalter |
  |---|---|
  | Preisfehler (Deals, Reisen) | **24 Stunden** – echte Deal-Seiten zeigen: Preisfehler sind nach 5 Minuten bis 3 Stunden vorbei |
  | mydealz-Deals (Lebensmittel, Drogerie, Erleben) | 3 Tage |
  | Reise-Deals (mydealz Reisen, Urlaubspiraten) | 4 Tage |
  | Freebies | 7 Tage |
  | mydealz-Gewinnspiele ohne Teilnahmeschluss | 14 Tage |
  | Ticket-Verlosungen ohne Teilnahmeschluss | 6 Tage (enden vor der Veranstaltung) |
  | Google-News-Treffer (Gewinnspiele, Produkttester, Feste) | 14 Tage, Zeile „Teilnahmeschluss unbekannt“ |
  | „Bands gesucht“ ohne Frist | 30 Tage |
  | Stellenanzeigen | 21 Tage |

  Mit bekanntem Ende in der Zukunft bleibt ein Eintrag bis zu diesem Ende stehen – höchstens aber so lange, wie
  `MAX_ALTER_TAGE` in `scan/main.mjs` erlaubt (Deals 7, Reisen 5, Tests 21 Tage).
- **mydealz-Deal-Seite**: Der RSS-Feed hat kein Feld „abgelaufen“ und keinen Altpreis. Darum liest der Radar für
  Einträge, die er zeigen würde, die Deal-Seite (`window.__INITIAL_STATE__.threadDetail`: `isExpired`, `endDate`,
  `price`, `nextBestPrice`, `shipping`, `temperature`) – höchstens **10 Seiten pro Lauf** für alle Bereiche zusammen,
  Preisfehler zuerst. Das Ergebnis steht 7 Tage in `zustand.json` (`dealSeiten`): abgelaufen bleibt abgelaufen,
  laufende Preisfehler werden jede Stunde neu geprüft, andere Deals alle 6 Stunden. Sagt die Seite „abgelaufen“ →
  raus. **Preisfehler ohne lesbare Deal-Seite werden nicht gezeigt** (lieber nichts als etwas Abgelaufenes); das steht
  dann unter `status.<bereich>.fehler`.
- Gleicher Link in zwei Bereichen (z. B. Hotel-Preisfehler in Deals und Reisen): nur im spezielleren Bereich
  (Reisen vor Deals).
- Schnäppchen-Angebote mit `mengeSicher: false` – oder im alten Datenformat ganz ohne `mengeSicher`/`packung` –
  werden nicht gerechnet (keine Prozent-Aussage), Großhandel
  („EDEKA Foodservice … nur für Großhändler“) auch nicht. Ist der Normalpreis nur geschätzt
  (`normalQuelle: "schaetzung"`), steht „Normalpreis geschätzt“ in der Zeile.

**Preisfehler: vorher → jetzt.** `preis` = jetzt (Deal-Seite, sonst Feed), `preisVorher` = Vergleichspreis der
Deal-Seite (`vorherQuelle: "Vergleichspreis laut mydealz"`), sonst eine eindeutige Stelle im Text („UVP 115,55“,
„Preisvergleich liegt bei 54 €“, „Normalerweise kostet es 75,99 €“, „statt 18,90 €“ – Versandkosten, Prozentangaben
und Monatsgebühren zählen nicht) und nur, wenn höher als jetzt – sonst `null`. Push und Zeile beginnen mit
**„vorher 96,99 € → jetzt 23,99 € (−75 %)“**, ohne Altpreis mit „jetzt 165,00 € (Preis vorher unbekannt)“.

**Ausgefallene Quellen (Stand 31.10.2026, echter Mitschnitt):** Die mydealz-Suche als RSS (`/rss/search?q=…`) gibt
es nicht mehr (HTTP 404) – Erleben (Deals) und Musik (Geräte) liefern darüber nichts. Urlaubsguru antwortet mit 401,
die Jobbörse der Arbeitsagentur mit 403 (Nebenverdienst leer). Die mydealz-Gruppe „drogerie“ liefert nur Beiträge
von 2019/2020 (fallen über das Höchstalter raus).

## Datenformat (`vorteile/data/aktuell.json`)

```text
{ version: 1, aktualisiert: ISO, ort, namen: { <bereich>: Anzeigename },
  sofort: [id …],                       // Sofort-würdige Einträge, nach wert sortiert
  kategorien: { deals: [Eintrag …], erleben, reisen, musik, nebenverdienst, tests },
  status: { <bereich>: { ok, anzahl, fehler: [Text …], ms, stand, uebersprungen? } } }
```

| Feld (Eintrag) | Typ | Bedeutung |
|---|---|---|
| `id` | Text | stabil je Bereich + Link + Titel |
| `kategorie` | Text | `deals`, `erleben`, `reisen`, `musik`, `nebenverdienst`, `tests` |
| `titel` | Text (≤ 160) | Titel der Quelle (ohne „123° - “ des Hot-Feeds); Schnäppchen: „<Produkt> bei <Laden>“ |
| `zeile` | Text | eine Zeile; Preisfehler beginnen mit „vorher X € → jetzt Y € (−Z %)“; „ab TT.MM.JJJJ · …“ wenn erst später gültig |
| `soGehts` | Text | nächster Schritt |
| `link`, `quelle` | Text | Link zum Angebot, Name der Quelle |
| `wert` | 0–100 | Reihenfolge |
| `sofort` | bool | Sofort-Push-würdig |
| `grund` | Text | z. B. `Preisfehler`, `Aktion durchgerechnet`, `Schnäppchen`, `gewinnspiel`, `test` |
| `datum` | ISO \| null | Veröffentlichung (Schnäppchen-Angebote: Zeit des Laufs) |
| `bis` | ISO \| null | Ende (UTC); `null` = Ende unbekannt → Seite zeigt „Ende unbekannt“ |
| `bisQuelle` | `feld` \| `deal-seite` \| `text` \| null | woher `bis` kommt |
| `ab` | ISO \| null | Beginn, nur wenn noch in der Zukunft (z. B. Angebot ab Mo 02.11.) |
| `sichtbarBis` | ISO \| null | ab dann nicht mehr zeigen: `bis`, sonst `datum` + Höchstalter (Preisfehler ≤ 24 h) |
| `frist` | `JJJJ-MM-TT` \| null | Kalendertag von `bis` in Berlin (für ältere Seiten) |
| `preisfehler` | bool | als Preisfehler gemeldet |
| `preis`, `preisVorher`, `vorherQuelle`, `ersparnisEuro`, `ersparnisProzent` | Zahl/Text \| null | nur bei Einträgen mit Preis (Deals, Reisen, Erleben, Musik-Geräte). `ersparnisProzent` ganzzahlig 0–100, `ersparnisEuro` auf Cent; ohne gesicherten Altpreis alle drei `null` |
| `extra` | Objekt (optional) | je Bereich: Deals `{ schritte, pro100, ersparnis (0–1), shop, produkt, angebotTitel, packung, normalQuelle }`; Preisfehler `{ shop, versand, temperatur, geprueft }`; Musik-Geräte `{ geraet, preis, tiefst }`; Nebenverdienst `{ art }` |

`zustand.json` (nur für den Radar): `lauf`, `gemeldet`, `sofortTage`, `digestTag`, `musik` (Preisverlauf Geräte),
`dealSeiten` (geprüfte Deal-Seiten, 7 Tage).
