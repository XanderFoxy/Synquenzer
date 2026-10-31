# Entwurf: „Regulär · Üblich · Tiefst · Jetzt“ für Mein Vorteil

> **Umgesetzt (Zweig `mv-preise`):** `scan/referenz.mjs` + `referenzpreise.json`. Abweichend von diesem Entwurf gibt es
> **kein „unbekannt“** mehr: fehlt ein Wert für die Packung, wird über den Grundpreis umgerechnet oder der recherchierte
> Referenzwert mit Quelle gezeigt („Stand …“ bei Werten älter als 90 Tage). Deal = ≤ üblich und ≤ Tiefst 12 Mon. + 10 %.

Stand: 31.10.2026. Grundlage: `BEFUND.md` (Preis-Sonde, Actions-Lauf 41227676320) und der Code auf `origin/mein-vorteil` (561910f).
Wunsch von Xander: Zu jedem Angebot sollen der reguläre Preis, der übliche Angebotspreis und der Tiefstpreis der letzten Monate oder Jahre stehen. Jeder Wert ist recherchiert und mit Quelle angegeben.

## 0. Grundsätze

1. **Nichts erfinden.** Jeder Wert hat eine Quelle und ein Datum oder den Vermerk „Datum unbekannt“. Fehlt ein Wert, steht „unbekannt“ da. Die Schätzwerte `normalpreis` aus `watchlist.json` (z. B. Knoppers 0,38 €/Stück) erscheinen **nicht mehr als Preis**. Sie bleiben nur intern, um Lesefehler zu erkennen (`unsicher`).
2. **Verglichen wird über den Grundpreis** (€/Stück, €/100 g, €/100 ml), wie heute schon. Angezeigt wird der Packungspreis.
3. **Nur aktuelle Packungsgrößen zählen.**
   - Beispiel Ben & Jerry's: Früher gab es 500-ml-Becher. Kaufland verkaufte sie einmal für 3,33 € (6,66 €/l). Würde dieser Wert zählen, wäre er fälschlich der „Tiefstpreis“ für den heutigen 465-ml-Becher (3,99 € = 8,58 €/l).
   - Werte ohne Packungsangabe fallen weg.
4. **Nur Ketten aus `config.json → maerkte.erlaubt`** zählen für „Üblich“ und „Tiefst“, dazu Online-Angebote. Aldi Süd, Wasgau, Feneberg und Hit gibt es in Döbeln nicht. Ihre Werte bleiben gespeichert, zählen aber nicht.
5. **Keine fremden HTML-Seiten auf öffentlichen Zweigen.** Gespeichert werden nur ausgelesene Einzelwerte mit Quelle und URL. Das Repo ist öffentlich.
6. **Zwei Begriffe auseinanderhalten:**
   - Ein „statt“-Preis im Prospekt ist nach § 11 PAngV höchstens der niedrigste Preis der letzten 30 Tage oder eine UVP.
   - Er ist **kein** langfristiger Tiefstpreis und wird deshalb nie als „Tiefst“ beschriftet.

## 1. Datenmodell

### 1a. `schnaeppchen/watchlist.json`: neue Felder je Produkt (alle optional)

```json
{
  "id": "ben-jerrys",
  "packungen": ["465ml"],
  "standardMl": 465,
  "eans": ["8711327374515"],
  "supermarktcheck": ["78546-ben-jerrys-ice-cream"],
  "regulaerFest": null
}
```

- **`packungen`:** die zulässigen Packungsgrößen (Regel 3).
- **`standardMl`:** fehlt heute bei Ben & Jerry's und wird gebraucht, wenn gerade kein Angebot läuft.
- **`eans`:** für Open Prices. Von Hand eingetragen, nicht gesucht.
- **`supermarktcheck`:** Produkt-IDs, von Hand eingetragen, nicht gesucht oder gecrawlt. Haribo Colorado fehlt noch.
- **`regulaerFest`:** ein Regalpreis, den Xander selbst im Markt gesehen hat, z. B. `{ "p": 6.99, "packung": "465ml", "shop": "Kaufland Döbeln", "stand": "2026-11-02", "quelle": "Xander im Markt" }`. Dieser Wert schlägt alle anderen Quellen.

Für Technik kommen in `technik[]` zusätzlich `geizhals` (ID), `idealo` (ID) und `asins` hinzu. Sie dienen nur für Links (siehe Abschnitt 5).

### 1b. `schnaeppchen/preisbasis.json`: Startwerte im Hauptzweig, von Hand geprüft

Diese Datei wird einmalig befüllt (Abschnitt 2a) und liegt versioniert im Git. Sie wird nie automatisch überschrieben. Geht `history.json` verloren, lässt sich der Stand daraus wieder aufbauen.

```json
{ "version": 1, "produkte": { "ben-jerrys": [
  { "art": "regal",  "p": 6.99, "packung": "465ml", "shop": "Globus", "datum": null,
    "quelle": "supermarktcheck.de (Nutzermeldung)", "url": "https://www.supermarktcheck.de/product/78546-ben-jerrys-ice-cream", "abgerufen": "2026-10-31" },
  { "art": "aktion", "p": 3.99, "statt": 6.99, "packung": "465ml", "shop": "Kaufland", "datum": null,
    "quelle": "supermarktcheck.de (abgelaufenes Angebot)", "url": "…", "abgerufen": "2026-10-31" },
  { "art": "aktion", "p": 0.99, "packung": "150g", "shop": "Netto", "datum": "2026-08-17", "ort": "Strausberg",
    "quelle": "Open Prices (ODbL)", "url": "https://prices.openfoodfacts.org/api/v1/prices?product_code=4018077004377", "id": 311595 }
] } }
```

- **`datum: null`** bedeutet „Datum unbekannt“.
  - Solche Werte zählen nie für „12 Monate“.
  - Sie dürfen nur als Ersatz erscheinen, deutlich markiert (siehe 1e).

### 1c. `history.json` Version 3 (Datenzweig `schnaeppchen-daten`)

- **Punkt:** `{ tag, p, shop, q, art, ort }`.
  - `p` ist der Grundpreis.
  - `q` ist die Quelle: `mg` (marktguru), `md` (mydealz), `op` (Open Prices), `kp` (Keepa).
  - `art` ist `aktion` oder `regal`.
  - `ort` ist `doebeln`, `bundesweit` oder `online`.
- **Je Gruppe neu:**
  - `seit`: der erste Tag mit eigenen Daten.
  - `tiefst`: bekommt zusätzlich `q`.
- **Umstellung von v2 auf v3:**
  - Die Punkte bleiben erhalten (`q: 'mg'`, `art: 'aktion'`, `ort` aus `online`). Sie werden **nicht** verworfen.
  - Nur v1 wird verworfen, wie bisher.
- **Schutz vor Datenverlust:** Fehlt `history.json` oder ist sie nicht lesbar, weil der Download scheitert, dann bricht der Lauf ab. Er schreibt dann **keinen** leeren Verlauf.
- Open-Prices-Punkte werden über ihre `id` nur einmal eingetragen. Die 400-Tage-Aufräumregel gilt weiter, `tiefst` und `seit` bleiben stehen.

### 1d. `current.json` Version 3: neues Objekt `preise` je Produkt

Die alten Felder bleiben für die Verträglichkeit (`normalpreis`, `tiefst`, `tiefstpreis` …).

```json
"preise": {
  "basis": "100ml", "packung": "465ml", "umgerechnet": false,
  "jetzt":       { "pack": 3.99, "p": 0.858, "shop": "Lidl", "ab": "2026-11-01", "bis": null },
  "regulaer":    { "pack": 6.99, "p": 1.503, "art": "median-ketten", "werte": ["Globus 6,99", "Rewe 6,99", "EDEKA 8,39"],
                   "quelle": "supermarktcheck.de (Nutzermeldung)", "stand": null, "url": "…" },
  "ueblich":     { "pack": 4.44, "p": 0.955, "anzahl": 5, "zeitraum": "unbekannt", "quelle": "supermarktcheck.de (abgelaufene Angebote)" },
  "tiefst12":    null,
  "tiefstBekannt": { "pack": 3.99, "p": 0.858, "shop": "Kaufland", "tag": null, "quelle": "supermarktcheck.de" },
  "tiefstGesamt":  null,
  "stufe": "top", "stufeText": "so günstig wie der bekannte Tiefstpreis",
  "datenlage": "undatiert"
}
```

Das Beispiel nutzt **echte Werte aus der Sonde**:
- Lidl 3,99 € ab 01.11.2026 kommt von marktguru für Döbeln.
- Alle anderen Werte kommen von supermarktcheck.de vom 31.10.2026.
- `tiefst12` und `tiefstGesamt` sind leer. Es gibt noch keinen datierten Punkt: Der eigene Verlauf beginnt bei null, und laufende Angebote werden erst ab ihrem Starttag eingetragen. Open Prices hat für Ben & Jerry's in Deutschland nur 1 Wert.
- „Üblich“ ist der Median der 465-ml-Aktionen bei erlaubten Ketten: Kaufland 3,99 €, EDEKA 4,44 €, Marktkauf 4,44 €, Penny 4,49 €, Rewe 4,79 € ergeben 4,44 €. Aldi Süd mit 4,44 € zählt nicht, weil es Aldi Süd in Döbeln nicht gibt.

### 1e. Rechenregeln (neu in `schnaeppchen/scan/preise.mjs`)

| Feld | Regel, in dieser Reihenfolge | Fehlt alles |
|---|---|---|
| **Regulär** | (1) `regulaerFest`. (2) Open Prices, nicht reduziert, Deutschland, höchstens 12 Monate alt, der neueste Wert, mit Datum. (3) Regalpreis von supermarktcheck in der Kette des aktuellen Angebots; sonst der Median aller Ketten für **dieselbe Packung**, mit „Datum unbekannt“. (4) „statt“-Preis aus dem Prospekt, beschriftet „Streichpreis im Prospekt (30-Tage-Preis)“. | „Regulär: unbekannt“ |
| **Üblich im Angebot** | Aus dem Verlauf werden „Aktionen“ gebildet: gleicher Shop, gleicher Preis und Tage mit höchstens 2 Tagen Lücke zählen als **1** Aktion. Eine Kaufland-Woche zählt also einmal, nicht siebenmal. Davon der Median über die Aktionen der letzten 365 Tage, wenn es mindestens 3 sind. Sonst der Median der undatierten Startwerte, mindestens 3, beschriftet „Zeitraum unbekannt“. | „Üblich: noch zu wenige Angebote (N)“ |
| **Tiefst 12 Mon.** | `tiefstSeit(…, 365)` nur über **datierte** Punkte, also eigener Verlauf, Open Prices und datierte Startwerte, nur von erlaubten Ketten oder online. Angezeigt mit Shop und Monat. | Ersatz `tiefstBekannt` (undatiert, mit Vermerk); sonst „Verlauf unbekannt“ |
| **Tiefst gesamt** | Das Minimum aller datierten Punkte. Dazu `seit` = der früheste datierte Punkt, damit „seit 05/2024“ ehrlich dasteht. | wird weggelassen |
| **Packungspreis** | Grundpreis × Packung des aktuellen Angebots. Für „Regulär“ gilt das **nur bei gleicher Packung**, weil größere Packungen je Stück billiger sind: Knoppers 8er kostet 2,79 €, der 15er 3,49 € und nicht 5,23 €. Ohne gleiche Packung wird der Grundpreis gezeigt, z. B. „0,35 €/Stück“. | – |

`datenlage` ist `datiert` (alle drei Werte haben ein Datum), `undatiert` (mindestens ein Ersatzwert) oder `unbekannt`.

## 2. Befüllen

### 2a. Einmalig: Startwerte (Workflow-Eingabe `startwerte=true`, nur von Hand)

1. **Neues Skript `schnaeppchen/scan/startwerte.mjs`:**
   - Es nutzt die robots-Prüfung der Sonde (Commit 646cabf: Sperrseite gilt als „alles verboten“).
   - Ehrlicher User-Agent, höchstens 1 Anfrage pro 1,1 s.
2. **Was es holt:**
   - **Open Prices:** `GET /api/v1/prices?product_code=<EAN>&size=100&order_by=-date`, nur Treffer mit Land Deutschland. Offizielle API, ODbL.
   - **supermarktcheck.de:** je Produkt-ID **1** Seite. Ausgelesen werden `tr` mit `td.priceUnitText`, `class="expired-offer"` und `<strike>`.
     - **Vorher die Nutzungsbedingungen lesen.** Verbieten sie das Auslesen, trägt Claude dieselben Werte einmal von Hand ein, mit Quelle.
   - **Optional, nur nach Prüfung der Nutzungsbedingungen: discounto-Einzelseiten** `/Angebot/<Slug>-<id>/` aus dem Block „verpasst“, höchstens 40 je Produkt und einmalig.
     - Das wäre die einzige gefundene Quelle für **datierte** frühere Angebote mit Preis.
     - Zuerst 3 Seiten im Modus `roh=true` prüfen.
3. **Ausgabe:** nur die ausgelesenen Werte als `preisbasis.json` auf den Zweig `startwerte-vorschlag`. Kein HTML, kein ntfy, `schnaeppchen-daten` bleibt unberührt.
4. **Prüfung:** Claude prüft die Werte auf Packung, Kette und Plausibilität. Danach kommen sie per Commit nach `mein-vorteil`.
5. **Nicht verwendet:**
   - prospektangebote.de (AWS-WAF-Sperre).
   - geizhals und idealo (gesperrt).
   - Amazon und camelcamelcamel (laut Bedingungen verboten).
   - kaufDA (nur die aktuelle Woche).
   - heisse-preise.io (gestört).

### 2b. Laufend (bestehender Zeitplan, jede Stunde um :17)

| Quelle | Wie oft | Wohin |
|---|---|---|
| marktguru (PLZ 04720) und mydealz-RSS | jede Stunde, wie bisher | Punkte in `history.json` (`q: mg/md`) |
| Open Prices (je EAN) | 1-mal am Tag, im Lauf mit `jetzt.getUTCHours() === 3` | neue Punkte nach `id`, und Regulär-Kandidaten |
| supermarktcheck (je ID) | 1-mal pro Woche (montags 03:17 UTC), nur wenn die Nutzungsbedingungen es erlauben | `schnaeppchen-daten:schnaeppchen/data/quellen-cache.json` mit `abgerufen` |
| Keepa (nur ASINs) | jede Stunde, wenn `KEEPA_KEY` gesetzt ist | `tiefst12` = `stats.minInInterval` bei `stats=365`; `tiefstGesamt` = `stats.min`. **Zeitstempel behalten:** ms = (keepaMinuten + 21564000) × 60000. Laut Keepa-Doku; beim Einbau prüfen. |

- **Fehler einer Quelle:** Der letzte Wert bleibt mit seinem alten `stand` stehen. In `quellen[]` steht der Fehler.
  - Regalpreise älter als 180 Tage werden als „alt“ markiert.
  - Werte älter als 365 Tage fallen weg.

## 3. Anzeige (`mein-vorteil/index.html`, `produktKarte`)

Die Zeilen „Tiefstpreis?“ und „Normalpreis …“ in `<dl class="fakten">` werden durch **eine** Preiszeile ersetzt. „Gültig“ bleibt.

- **Mit Angebot (Format nach Xanders Wunsch):**
  `Regulär 6,99 € · Üblich im Angebot 4,44 €* · Tiefst 3,99 € (Kaufland)* · Jetzt 3,99 € (Lidl)`
- **Darunter eine Zeile `.klein` mit den Quellen:**
  `* Nutzermeldungen supermarktcheck.de, ohne Datum · eigener Verlauf Döbeln seit 01.11.2026`
- **Mit datierten Werten:**
  `Regulär 4,49 € · Üblich im Angebot 2,99 € · Tiefst 12 Mon. 2,49 € (Kaufland, 3/2026) · Jetzt 2,79 €`
- **Stufen-Pill**, mit den bestehenden Pill-Klassen:
  - „Top: Tiefstpreis“
  - „Gut: unter üblich“
  - „Normales Angebot“
  - „Verlauf unbekannt“
- **„Jetzt“** ist fett. Bei umgerechneten Werten steht einmal „auf diese Packung (15 St.) umgerechnet“.
- **Produkt ohne Angebot** (`produktZeile`): dieselbe Zeile ohne „Jetzt“, also „Gerade kein Angebot · Regulär … · Üblich … · Tiefst …“.
- **Fehlende Werte** werden ausgeschrieben, z. B. „Regulär unbekannt“ oder „Tiefst: Verlauf unbekannt“. Es gibt keine leeren Lücken und keine Schätzung.
- **Ladezeit:** Es kommen keine neuen Anfragen hinzu. `preise` macht `current.json` um etwa 0,5 KB je Produkt größer. `history.json` lädt die Seite weiterhin nicht.
- **Sichtbare Änderung:** Xander hat sie selbst verlangt. Aufbau, Größe und CSS der Karte bleiben, es wird nur eine Faktenzeile getauscht.

## 4. Deal und Push

Die Stufe wird je Produkt aus dem Grundpreis berechnet (`schnaeppchen/scan/deals.mjs`, neue Funktion `stufe()`):

| Stufe | Bedingung | Seite | Push (ntfy) |
|---|---|---|---|
| **top** | Jetzt ≤ Üblich **und** Jetzt ≤ Tiefst 12 Mon. × 1,05 (sonst `tiefstBekannt`) | grün „Top“ | **ja** |
| **gut** | Jetzt ≤ Üblich **und** Jetzt ≤ Tiefst × 1,10 | „Gut“ | ja, wenn `push.auchGut` gesetzt ist (Standard: nein) |
| **angebot** | Jetzt < Regulär, aber über Üblich | „Normales Angebot“ | nein |
| **unbekannt** | Üblich und Tiefst fehlen | „Verlauf unbekannt“ | nur wenn Jetzt ≥ 35 % unter einem Regulär-Preis **mit Quelle** liegt **und** es das günstigste sichere Angebot ist; der Text sagt dann „Verlauf unbekannt“ |

- **Neue Einstellungen in `config.json → push`:**
  - `nahTiefst: 0.05`
  - `gutNahTiefst: 0.10`
  - `minAktionen: 3`
  - `ohneVerlaufMinRabatt: 0.35`
  - `auchGut: false`
- **Was bleibt:** Die bisherige Regel 25 % unter Referenz bleibt nur für das Abzeichen auf der Seite, solange es keine Stufe gibt. Die Sperre gegen doppelte Pushes (`sent`) bleibt, ebenso `maxProLauf`.
- **Pushtext** (`notify.mjs`):
  `Ben & Jerry's 3,99 € bei Lidl (ab 01.11.) – Top: so günstig wie der bekannte Tiefstpreis. Regulär 6,99 € · üblich 4,44 € · Tiefst 3,99 € (Kaufland, Datum unbekannt)`

## 5. Technik und Preisfehler

- **Ehrliche Lage:** Für einen automatischen Verlauf ist **keine freie Quelle** nutzbar.
  - geizhals ist per Cloudflare gesperrt, idealo per Akamai.
  - Amazon und camelcamelcamel verbieten das Auslesen in ihren Bedingungen.
- **„Vorher“:** wie heute `nextBestPrice`, beschriftet „Vergleichspreis laut mydealz (idealo)“, oder UVP/„statt“ aus dem Text. Nie „Tiefstpreis“ nennen.
- **Neue Zeile `Tiefst`:**
  - **Nur über Keepa** (Amazon-ASINs) mit Datum, also „Tiefst 12 Mon. 159,99 € (Amazon, 2/2026)“.
  - Ohne Keepa steht dort „Tiefst: Verlauf unbekannt“.
  - Steht im Deal-Text eine Angabe wie „schon einmal für 159,99 €“, wird sie als Zitat gezeigt: „laut Deal-Text (ungeprüft)“.
- **Links „Preisverlauf ansehen“:** geizhals `?phist=<ID>` (oder `?fs=<Modellnummer>`), idealo, `amazon.de/dp/<ASIN>` und camelcamelcamel `/product/<ASIN>`.
  - Es sind nur Links. Sie werden nie abgerufen.
  - Die IDs trägt man von Hand ein; die Modellnummer liest der Code aus dem Titel.
- **Push-Regel für Technik** bleibt wie bisher (Preisfehler-Logik). Neu ist nur die Zeile mit Quelle.

## 6. Ersatzregeln, kurz

- Keine Quelle für einen Wert: Der Wert heißt „unbekannt“ und wird nicht geschätzt. Die Stufe ist dann höchstens „unbekannt“.
- Nur undatierte Werte: Sie werden gezeigt mit „*“ und „Datum unbekannt“. „12 Mon.“ steht nie bei undatierten Werten.
- Andere Packung als bei der Quelle: „Regulär“ wird im Grundpreis gezeigt, nicht als erfundener Packungspreis.
- Quelle ausgefallen: Der alte Wert bleibt mit „Stand TT.MM.“. Nach 365 Tagen fällt er weg.
- Der eigene Verlauf ist jung (weniger als 5 Tage): Es steht „eigener Verlauf erst seit …“. Die Startwerte tragen bis dahin.

## 7. Tests (`node --test`, ohne Netz)

- **`history.test.mjs`:**
  - Umstellung von v2 auf v3 behält die Punkte.
  - `seit` wird gesetzt.
  - Der Open-Prices-Punkt mit gleicher `id` kommt nur einmal hinein.
  - Kein leerer Verlauf, wenn der Download scheitert.
- **`preise.test.mjs`:**
  - Aktionen werden zusammengefasst (7 Kaufland-Tage = 1 Aktion).
  - Median ab 3 Aktionen.
  - `tiefst12` ignoriert undatierte Werte.
  - Der 500-ml-Becher fällt bei `packungen: ["465ml"]` raus.
  - Aldi Süd fällt raus.
  - Regulär-Reihenfolge `regulaerFest` → Open Prices → supermarktcheck → statt.
  - Kein Regulär-Packungspreis bei anderer Packung.
  - Die Schätzung `normalpreis` taucht nie in `preise` auf.
- **`deals.test.mjs`:**
  - Jede Zeile der Stufen-Tabelle.
  - Kein Push bei „angebot“.
  - Push ohne Verlauf nur bei ≥ 35 % unter einer Quelle; die bisherigen Fälle in Zeilen 70–97 werden angepasst.
- **Parser mit Fixtures:**
  - Open Prices: echte JSON-Antwort (ODbL, mit Namensnennung).
  - supermarktcheck: ein **nachgebauter** kleiner HTML-Ausschnitt mit derselben Struktur, keine Kopie der Seite.
  - Keepa-Zeitstempel.
- **Seite:**
  - `mein-vorteil/test/seite.test.mjs`: neue Texte, ersetzt Zeilen 125, 126, 150 und 208. Geprüft werden alle Ersatzfälle und „12 Mon.“ nur mit Datum.
  - Vertrag `baue-vertrag.mjs` → `vertrag/schnaeppchen-current.json` mit `preise`.
- **Echt-Test:** `echt.test.mjs` mit dem marktguru-Mitschnitt vom 31.10. ergibt `datenlage: unbekannt` und keinen Push.
- **Doku:** `schnaeppchen/README.md` (Vertrag) und `mein-vorteil/README.md`.

## 8. Aufwand und Reihenfolge

| Schritt | Aufwand |
|---|---|
| Verlauf v3, `preise.mjs` (Aktionen, Median, Tiefst, Regulär, Packung) | 4 h |
| Open Prices und supermarktcheck als Quellen, Cache, Takt | 4 h |
| Startwerte: Skript, ein Lauf, Prüfung von 10 Produkten, EANs und IDs von Hand | 3 h |
| Seite: Preiszeile, Quellenzeile, Stufen, Ersatztexte | 3 h |
| Stufe und Push, Pushtext | 2 h |
| Technik: Links, Zitat aus dem Deal-Text, Keepa-Zeitstempel | 2 h |
| Tests, Doku, Auslieferung (Sonden, SPIELSYSTEM.md, Werkstatt, Funk) | 3 h |
| **Summe** | **etwa 21 h** (2–3 Arbeitstage) |

**Entscheidungen von Xander** (der Rest geht ohne ihn):
1. **Keepa** für den Technik-Tiefstpreis: laut Drittquelle ab etwa 49 €/Monat, Preis nicht geprüft. Ja oder nein?
2. **Push auch bei „Gut“**, also unter üblich, aber nicht ganz am Tiefstpreis? Standard ist nein.
3. **Optional:** Kassenbons aus Döbeln bei Open Prices eintragen. Dann wächst dort genau sein Verlauf.

Quellen der Beispielwerte (abgerufen am 31.10.2026 aus GitHub Actions):
- https://api.marktguru.de/api/v1/offers/search (PLZ 04720)
- https://www.supermarktcheck.de/product/78546-ben-jerrys-ice-cream
- https://www.supermarktcheck.de/product/12061-storck-knoppers-milch-haselnuss-schnitte-
- https://prices.openfoodfacts.org/api/v1/prices?product_code=4018077004377
- § 11 PAngV
