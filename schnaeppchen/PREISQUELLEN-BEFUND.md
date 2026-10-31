# Befund: Quellen für regulären Preis und Tiefstpreis (Preis-Sonde)

Stand: 31.10.2026. Lauf: GitHub Actions 41227676320, Zweig `preis-sonde`, Commit 7bc34f9. Gestartet 18:05 UTC, Ergebnis „success“.
Rohdaten: Zweig `roh-daten`, Ordner `preis-sonde/41227676320/` (`index.json` mit Status, Kopfzeilen und Hinweisen je Anfrage; `quellen/` mit höchstens 1 MB Inhalt je Anfrage).
Lokale Kopie: `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/ph/ergebnis/preis-sonde/41227676320/`

## Kurzfassung

- **Keine Quelle liefert für Lebensmittel automatisch und sauber einen datierten Tiefstpreis über Monate oder Jahre.**
  - prospektangebote.de hatte die Tabelle „Preisverlauf“. Die Seite blockt Abrufe aus GitHub Actions mit einer AWS-WAF-Challenge.
  - Open Prices hat datierte Preise, aber für die Watchlist in Deutschland nur 0 bis 3 Werte je Produkt.
- **Regulärer Preis:** Brauchbar ist nur supermarktcheck.de. Dort steht je Kette der zuletzt gemeldete Regalpreis, aber **ohne Datum**. Alle Werte der 3 geprüften Produkte sind als „schon etwas länger her“ markiert.
- **marktguru** (Döbeln und zum Vergleich Berlin) hat bei allen 5 Treffern `oldPrice: null`. Bei den 4 Treffern vom Vormittag war es genauso. marktguru taugt also nur für den eigenen Verlauf ab jetzt.
- **Technik:**
  - geizhals.de ist hinter Cloudflare gesperrt (403). Die Preisverlauf-Seite kam zwar durch, enthält aber keine Zahlen; die werden per Skript nachgeladen.
  - idealo sperrt schon die robots.txt (403).
  - Amazon und camelcamelcamel verbieten automatisches Auslesen in ihren Bedingungen.
  - Sauber geht nur Keepa (bezahlt, Schlüssel `KEEPA_KEY` ist **nicht** gesetzt).
  - Dazu kommt der mydealz-„Vergleichspreis“ (`nextBestPrice`), den es schon gibt.
- **Empfehlung:**
  - Lebensmittel: Tiefstpreis und üblichen Angebotspreis aus dem eigenen marktguru-Verlauf, dazu einmalig von Hand recherchierte Startwerte mit Quelle und Datum in der Watchlist. Den Regalpreis von supermarktcheck.de als „Nutzermeldung, Datum unbekannt“ daneben, Open Prices als Ergänzung.
  - Technik: Vergleichspreis von mydealz, Keepa nur nach Xanders Entscheidung (Kosten), sonst nur Links auf die Preisverläufe.

## So wurde geprüft

- **Skript und Workflow:**
  - Skript: `schnaeppchen/scan/sonde-historie.mjs`.
  - `.github/workflows/schnaeppchen.yml` ist nur auf dem Zweig `preis-sonde` geändert. Er läuft nur per Hand: kein Zeitplan, kein Push-Auslöser, kein ntfy, kein Daten-Zweig.
  - Das Ergebnis geht nur nach `roh-daten/preis-sonde/<Lauf>/`. `schnaeppchen-daten` wurde nicht angefasst.
- **Höflichkeit:**
  - Ehrlicher User-Agent: `Mozilla/5.0 (compatible; MeinVorteil/1.0; +https://xanderfoxy.github.io/Synquenzer/)`.
  - robots.txt je Host zuerst. Verbotene Pfade wurden nicht abgerufen.
  - Höchstens 1 Anfrage pro 1,1 s insgesamt. Crawl-delay wurde beachtet (kaufDA: 2 s).
  - Keine Anmeldung und keine Challenge gelöst.
- **Produkte:** Knoppers Schnitte, Lorenz Crunchips, Ben & Jerry's 465 ml, Haribo Colorado.
- **Technik:**
  - Zotac RTX 5070 Twin Edge OC aus `technik[]` der Produktionsdaten (MediaMarkt, 165 €).
  - WD Elements Portable 6 TB (WDBNEF0060BBK-EESN) aus dem mydealz-„heiß“-Feed desselben Tages (MediaMarkt, 189,99 €). Gewählt wegen der eindeutigen Modellnummer. Der Preisfehler-Feed hatte sonst nur unscharfe Technik wie das ThinkPad T16 „kostenlos (Gewerbe)“.
- **Umfang:** 61 Anfragen in etwa 71 s, davon 15 auf robots.txt. 7 Anfragen wurden wegen robots.txt übersprungen: 2× mydealz `/search`, 4× Open-Food-Facts-Suche `/cgi`, 1× heisse-preise.io.

### Fehler der Sonde (offen benannt)

1. **prospektangebote.de und geizhals.de:** robots.txt war hinter Bot-Schutz und deshalb nicht lesbar:
   - prospektangebote.de: HTTP 202 mit `x-amzn-waf-action: challenge`.
   - geizhals.de: HTTP 403 mit `cf-mitigated: challenge`.

   Die Sonde hat das wie eine fehlende robots.txt behandelt und trotzdem abgerufen: 5 Seiten bei prospektangebote (alle wieder Challenge) und 3 bei geizhals. Richtig wäre gewesen, dort aufzuhören.
   - Behoben in Commit 646cabf auf `preis-sonde`: Challenge, 202, 401, 403, 429 oder HTML statt robots.txt gilt jetzt als „alles verboten“. Offline getestet; nicht erneut gestartet.
   - Ausgewertet wurde von dort nichts außer der Tatsache der Sperre und dem leeren Seitengerüst.
2. **Öffentlicher Zweig:** Das Repo `XanderFoxy/Synquenzer` ist **öffentlich**. Die Rohkopien fremder Seiten (supermarktcheck, discounto, kaufDA, das geizhals-Gerüst) liegen damit öffentlich auf `roh-daten`, auch im Git-Verlauf. Für einen dauerhaften Betrieb sollten fremde HTML-Seiten nicht routinemäßig dort abgelegt werden. Gespeichert werden sollten nur die ausgelesenen Einzelwerte mit Quellenangabe.

## Ergebnis je Quelle

| Quelle | Aus Actions erreichbar? | HTTP | Gesperrt / Challenge? | Regulärer Preis | Frühere Angebote (Datum / Händler / Preis) | Wie weit zurück |
|---|---|---|---|---|---|---|
| marktguru (API) | ja | 200 | nein | nein (`oldPrice` immer null) | nur laufende Angebote mit Gültigkeit | keine Historie |
| prospektangebote.de | **nein** | 202 | **ja, AWS-WAF-Challenge** | – | – | – |
| supermarktcheck.de | ja | 200 | nein | **ja, je Kette, ohne Datum** | ja, Händler und Preis, teils „statt“, **ohne Datum** | unbekannt |
| discounto.de | ja | 200 (410 bei falschem Slug) | nein | „statt“ bei laufenden Angeboten | Liste „verpasst“: Händler und Link, Preis nur auf Einzelseite | Bildpfade bis 2024 |
| kaufDA | ja | 200 (404 Döbeln-URL) | nein | UVP/„statt“ bei laufenden Angeboten | nein, nur aktuelle KW | keine |
| mydealz | ja | 200 / 404 | nein (`/search` per robots verboten) | `nextBestPrice` (Vergleichspreis) je Deal | nur über alte Deals; Gruppen-Seite/-RSS „knoppers“ gibt es nicht | – |
| Open Prices | ja | 200 | nein | `price_without_discount` bei Aktionen | **ja, mit Datum, Markt, Ort, Beleg** | DE-Werte 2024–2026, sehr dünn |
| Open Food Facts (Suche) | robots verbietet `/cgi` | – | – | – | – | – |
| geizhals.de | **nein** (403) | 403 / 200 | **ja, Cloudflare** | – | Verlauf-Seite ohne Zahlen im HTML | (90 Tage … „Alles“) |
| Amazon.de | nur robots.txt geholt | 200 | – | nicht abgerufen (Bedingungen) | – | – |
| camelcamelcamel | nur robots.txt geholt | 200 | – | nicht abgerufen (Bedingungen) | – | – |
| idealo.de | **nein** | 403 (schon robots.txt) | ja, Akamai | – | – | – |
| Keepa | nicht abgefragt | – | – | – | – | Secret fehlt |
| heisse-preise.io | **nein** | 500 (robots.txt) | – | – | – | – |

### 1. marktguru (bisherige Quelle, inoffizielle JSON-API)

- **robots.txt:**
  - `api.marktguru.de`: `Allow: /api/`, sonst `Disallow: /`. Die API-Abrufe sind also ausdrücklich erlaubt.
  - `www.marktguru.de`: keine Sperren.
- **Treffer, PLZ 04720 (Döbeln):**
  - Knoppers: 1 Treffer, Penny „Storck Knoppers Minis“ 1,99 €, gültig 26.–31.10.2026, Grundpreis 9,95 €/kg.
  - Crunchips: 0 Treffer.
  - Ben & Jerry's: 1 Treffer, Lidl 3,99 €, gültig ab 01.11.2026, 8,58 €/l.
  - Haribo Colorado: 0 Treffer.
  - Das Kaufland-Angebot von heute Vormittag (Knoppers 15 St. 2,79 €) war um 18:00 UTC abgelaufen und fehlte deshalb.
- **Treffer, PLZ 10115 (Berlin, Vergleich):** REWE und nahkauf Knoppers Nussriegel 1,69 €, Penny Knoppers Minis 1,99 €.
- **`oldPrice`:** In allen 5 Treffern `null`, im Mitschnitt vom Vormittag ebenso (4 von 4). Döbeln ist also kein Sonderfall.
- **Felder:** `price`, `referencePrice` (Grundpreis €/kg bzw. €/l), `validityDates`, `advertisers`, `product.id`, `brand`.
- **Bewertung:** Liefert den Ortsbezug und den aktuellen Aktionspreis. Für Tiefstpreis und „üblich“ braucht es den eigenen Verlauf (`schnaeppchen-daten`). Der beginnt nach der Umstellung auf Format v2 bei null.

### 2. prospektangebote.de – nicht nutzbar

- Alle 6 Anfragen, robots.txt eingeschlossen, bekamen **HTTP 202** mit 2011 Bytes.
  - Die Antwort ist eine JavaScript-Challenge von AWS WAF (`x-amzn-waf-action: challenge`, `server: CloudFront`).
  - Die Seite wird erst nach dem Lösen der Challenge im Browser geliefert.
- Damit sind von dort keine Daten zu bekommen, ohne die Sperre zu umgehen. Das kommt nicht in Frage.
- Die Werte aus der Recherche (z. B. Ben & Jerry's 465 ml bei Lidl regulär 6,99 €, Aktion 3,99 €) bleiben **ungeprüft**.
- **Empfehlung:** nicht automatisieren. Höchstens als Link für Xander zum Nachschauen.

### 3. supermarktcheck.de – bester Hinweis auf den Regalpreis, aber ohne Datum

- **robots.txt:** `User-agent: *` mit leerem `Disallow:`, also alles erlaubt. Keine Sperre, normale HTML-Seiten (80–90 KB).
- **Felder je Produktseite:**
  - „Zuletzt gemeldeter Preis“ je Kette und Packung mit Grundpreis.
  - Zahl der Meldungen.
  - Abgelaufene „Sonderangebote“ je Kette mit Aktionspreis und teils durchgestrichenem Vorher-Preis (`<strike>`).
  - Der Abschnitt „Inflations-Check“ sagt bei allen drei „Noch nicht genügend Daten“.
- **Kein Datum:**
  - Weder Meldungen noch abgelaufene Angebote haben ein Datum im HTML.
  - Alle Regalpreise tragen den Hinweis „Die letzte Preis-Meldung ist hier schon etwas länger her. Der Preis könnte sich zwischenzeitlich geändert haben.“
  - Das einzige Datum auf der Knoppers-Seite gehört zu einer Bewertung (10.02.2021).
- **Werte (31.10.2026 abgerufen):**
  - **Knoppers Schnitte 200 g / 8er** (152 Meldungen):
    - Regal: REWE, Globus und EDEKA 2,79 €, Rossmann 2,19 €; 375 g / 15er bei REWE und Globus 3,49 €.
    - Abgelaufene Aktionen: Aldi Süd 1,39 € (statt 2,19 € bzw. 1,89 €), Feneberg und Kaufland 1,39 €, Kaufland 1,49 € statt 1,99 €, Globus 1,22 €, Marktkauf 1,49 €, Hit 1,51 €, Wasgau 1,59 €.
    - Netto MD Big Spender 375 g 2,99 €.
  - **Lorenz Crunchips Paprika 150 g** (176 Meldungen):
    - Regal: REWE und Globus 1,99 €, EDEKA 2,39 €.
    - Abgelaufene Aktionen: EDEKA und Aldi Süd 0,99 €, Netto MD 1,11 €.
    - 200-g-Beutel: Lidl 0,99 € statt 1,19 €, Marktkauf 0,99 € statt 1,49 €, Kaufland 1,11 € statt 1,89 €.
  - **Ben & Jerry's 465 ml (Cookie Dough)** (108 Meldungen):
    - Regal: Globus und REWE 6,99 €, EDEKA 8,39 €.
    - Abgelaufene Aktionen: Kaufland 3,99 € statt 6,99 €, Aldi Süd 4,44 € statt 6,99 €, Penny 4,49 € statt 6,99 €, EDEKA 4,44 € statt 6,49 €, Marktkauf 4,44 € statt 5,99 €, REWE 4,79 €.
  - **Haribo Colorado:** Die Produkt-ID ist unbekannt. Auf der Seite fand sich kein Suchformular, deshalb wurde nicht gesucht. Die ID muss einmal von Hand gesucht werden.
  - **Marktseite Netto MD Döbeln:** nur 2 Filialen (Grimmaische Straße, Unnaer Straße) mit Öffnungszeiten, **keine Preise vor Ort**.
- **Auslesen:**
  - Tabellenzeilen `<tr>` mit `td.priceUnitText`.
  - Kette aus dem ersten Link, Packung nach dem `<br>`.
  - `class="expired-offer"` markiert abgelaufene Angebote, `<strike>` den Vorher-Preis.
  - `title="…länger her…"` markiert veraltete Werte.
  - Produkt-IDs von Hand in `watchlist.json`, kein Suchen oder Crawlen.
- **Recht:**
  - Nutzungsbedingungen nicht geprüft. Die Seite verlinkt „Nutzungsbedingungen von SupermarktCheck.de“; vor dem Dauerbetrieb lesen.
  - Die Daten sind Nutzermeldungen. Einzelwerte mit Quellenangabe sind etwas anderes als das systematische Übernehmen der Datenbank (§ 87b UrhG).
  - Höchstens 1 Abruf je Produkt und Tag, oder besser seltener (wöchentlich), weil sich die Werte selten ändern.

### 4. discounto.de – laufende Angebote mit „statt“, Archiv nur über Einzelseiten

- **robots.txt:** gesperrt sind `/Suche/`, `/rpg/` und `/Prospekte/Angebot-Datum:*`. `/Aktuelle-Angebote/<Marke>/` und `/Angebot/…` sind erlaubt.
- **Erreichbarkeit:** Knoppers, Lorenz und Haribo HTTP 200. `Ben-Jerrys` und `Ben-und-Jerrys` HTTP 410 (Slug unbekannt).
- **Felder laufender Angebote:**
  - Händler (`data-retailer`), Preis, durchgestrichener Preis, Gültigkeit.
  - Beispiele:
    - Kaufland „KNOPPERS Milch-Haselnuss-Schnitte, 15 St. = 375-g-Packg.“ 2,49 € statt 2,79 €.
    - Penny Knoppers Minis 1,99 € statt 2,99 €.
    - Penny Knoppers Riegel 1,49 €, 06.–07.11.2026, „nur in der Filiale“.
    - Kaufland „HARIBO Color-Rado oder Phantasia“ 3,69 € statt 4,69 €.
- **Abgelaufene Angebote:**
  - Block „Diese Angebote hast du leider verpasst“, bei Knoppers 37 Stück.
  - Je Eintrag nur Händler, Titel und Link `/Angebot/<Slug>-<id>/`, **kein Preis in der Liste**.
  - Ein ungefähres Datum steckt nur im Bildpfad (z. B. `/pics/Angebote/2026/08/23/…`).
  - Preis und Datum gäbe es nur über je eine Einzelseite. Das wären viele Abrufe; nicht geprüft.
- **Bewertung:** Als Gegenprobe für den „statt“-Preis laufender Angebote geeignet. Für einen Tiefstpreis über Monate zu aufwendig. Nutzungsbedingungen nicht geprüft.

### 5. kaufDA (Bonial) – nur die aktuelle Woche

- **robots.txt:** `crawl-delay: 2`. Gesperrt sind `/search`, `/api/frontend/`, `/dyn/` usw., `/Angebote/<Begriff>` ist erlaubt.
- **Erreichbarkeit:** `/Angebote/Knoppers` und `/Angebote/Haribo` HTTP 200. `/Doebeln/Angebote/Knoppers` HTTP 404.
- **Standort:** Ohne Standort zeigt die Seite Berlin 10178.
- **Felder:**
  - Aktuelle KW 44: Händler, Preis, „UVP“/Vorher-Preis, Grundpreis, Rabatt, Gültigkeit. Ein `__NEXT_DATA__`-JSON enthält `price`, `validFrom` und `validUntil`.
  - Beispiele:
    - Penny Knoppers Minis 1,99 € (UVP 2,99 €).
    - Penny Knoppers Riegel ab 1,49 € (UVP 2,19 €, bis 08.11.2026).
    - Netto Nussriegel 1,79 € statt 2,79 €.
    - Haribo: 18 Angebote, günstigstes 0,99 € bei Action.
  - **Kein Verlauf.**
- **Bewertung:** Gegenüber marktguru kein Mehrwert für den Tiefstpreis.

### 6. mydealz – nur Vergleichspreis und Freitext

- **robots.txt:** `Allow: /`, aber `Disallow: /search`. Die Suche wurde deshalb nicht abgerufen.
- **Gruppen:** `/gruppe/knoppers` und `/rss/gruppe/knoppers` liefern HTTP 404 („Ups…“). Diese Gruppe gibt es nicht.
- **Deal-Seite WD Elements 6 TB:**
  - HTTP 200, `price` 189,99 €, `nextBestPrice` 209,99 € (Vergleichspreis).
  - `priceComparison.service = "idealo"`, für diesen Deal abgeschaltet.
  - **Kein Preisverlauf-Feld.**
  - Ein Tiefstpreis steht nur im Text des Erstellers: „Im Februar gab es sie schon einmal für 159,99 €, also kein Tiefstpreis, aber aktuell der beste Preis.“
- Der Treffer „captcha“ in `index.json` ist ein Fehlalarm: Er kommt vom eingebetteten reCAPTCHA-Schlüssel und ist keine Sperre.
- **Bewertung:** RSS bleibt die Quelle für Deals. Für Technik `nextBestPrice` als „Vergleichspreis laut mydealz“ anzeigen; das macht der Code schon. Einen Verlauf gibt es nicht.

### 7. Open Prices (Open Food Facts) – offen und datiert, aber dünn

- **robots.txt:**
  - `prices.openfoodfacts.org` liefert eine leere robots.txt, also keine Sperren.
  - `world.openfoodfacts.org` verbietet `/cgi`. Die dortige Produktsuche wurde deshalb nicht benutzt; die EANs kamen aus der Open-Prices-API selbst.
- **API:**
  - `/api/v1/products?product_name__ilike=…&brands__ilike=…&price_count__gte=1&order_by=-price_count` funktioniert (200, JSON mit `items/total`).
  - `/api/v1/prices?product_code=<EAN>&size=50&order_by=-date` liefert je Preis `date`, `price`, `currency`, `price_is_discounted`, `price_without_discount`, `location` (OSM-Name, Ort, Land) und den Belegtyp (`PRICE_TAG`/`RECEIPT`).
- **Werte für Deutschland:**
  - Crunchips Paprika 150 g (EAN 4018077004377), 3 Preise:
    - 17.08.2026 Netto, Strausberg: 0,99 € (Aktion).
    - 27.12.2025 REWE, Bad Westernkotten: 1,99 €.
    - 10.05.2024 Netto, Strausberg: 1,19 € statt 1,99 €.
  - Crunchips Western Style 150 g (4018077004117):
    - 17.08.2026 Netto: 0,99 € (Aktion).
    - 03.08.2026 EDEKA Berlin: 1,99 €.
    - 27.01.2025 EDEKA Wennigsen: 1,00 € statt 1,99 €.
  - Haribo Color-Rado 340 g (4001686011249):
    - 17.01.2026 Lidl, **Hainichen** (etwa 25 km von Döbeln): 1,49 €.
    - 28.04.2025 Netto MD, Dahme/Mark: 1,11 € statt 1,49 €.
    - 18.01.2025 Netto MD, Strausberg: 1,49 €.
  - Color-Rado 750 g (4001686002513): 4,99 € (Netto, 08.01.2025), 4,79 € (EDEKA Münster, 20.04.2024).
  - EAN 4001686721483 (Color-Rado laut rossmann.de): 0 Preise.
- **Werte, die für Deutschland nichts taugen:**
  - Knoppers: Die 3 meistgemeldeten EANs haben 18, 12 und 8 Preise. Davon kommt 1 aus Deutschland (Nussriegel 5er, Bayern, 10.06.2025, 1,49 €), alle anderen aus Frankreich.
  - Ben & Jerry's: Die 3 meistgemeldeten EANs haben 144 Preise. Davon kommt 1 aus Deutschland, der Rest aus Frankreich und Norwegen (teils NOK).
  - Döbeln: `locations?osm_address_city__like=Döbeln` gibt 0 Orte zurück.
- **Recht:** ODbL 1.0, also Namensnennung („Open Prices / Open Food Facts“) und Weitergabe unter gleichen Bedingungen. Eine offizielle, frei nutzbare API.
- **Bewertung:** Die einzige saubere Quelle mit **Datum, Markt und „statt“-Preis**, aber für Deutschland zu dünn, um allein zu tragen. Als Ergänzung mit Filter `osm_address_country = Deutschland` sinnvoll. Xander könnte eigene Döbelner Kassenbons beitragen; dann wächst sie genau für seine Märkte.

### 8. geizhals.de – gesperrt

- **Sperre:**
  - robots.txt: HTTP 403 „Sichere Verbindung wird überprüft“ (Cloudflare, `cf-mitigated: challenge`).
  - Suche `/?fs=`: 403 Challenge.
  - Produktseite `a3524924.html` (WD Elements 6 TB): 403 „Geblockt“.
- **Verlauf `/?phist=3524924`:**
  - HTTP 200, aber nur das Seitengerüst: „Preisentwicklung für Western Digital WD Elements portable (90 Tage)“, Zeiträume 1 Woche bis „Alles“ und der Hinweis „Die angezeigte Preisänderung wird auf Basis der letzten 30 Tage berechnet“.
  - **Keine Preiswerte im HTML**; die Kurve wird nachgeladen. Nicht weiter verfolgt (siehe Fehler oben).
- **Zotac RTX 5070 Twin Edge OC:** keine geizhals-ID gefunden. Die Websuche ergab keine, und die geizhals-Suche ist gesperrt.
- **Bewertung:** Nicht automatisieren. Nur einen Link „Preisverlauf bei Geizhals“ (`https://geizhals.de/?phist=<ID>`) anzeigen, mit von Hand eingetragener ID.

### 9. Amazon.de, camelcamelcamel, idealo, Keepa, heisse-preise.io

- **Amazon.de:**
  - robots.txt: HTTP 200, `/dp/` ist für `*` nicht gesperrt.
  - Die Nutzungsbedingungen verbieten Data-Mining und Robots, deshalb **keine Produktseite abgerufen**.
  - Den Preisverlauf („Preisverlauf“-Knopf) nur als Link `https://www.amazon.de/dp/<ASIN>` anbieten.
- **camelcamelcamel:**
  - robots.txt: HTTP 200, `User-agent: *` mit `Allow: /` und `Content-Signal: search=yes, ai-train=no, use=reference`. KI-Crawler sind ausgesperrt.
  - Die Nutzungsbedingungen (Stand 09.04.2024) verbieten Scraping und Weiterveröffentlichung, deshalb nur ein Link `https://de.camelcamelcamel.com/product/<ASIN>`.
- **idealo.de:** Schon die robots.txt kam mit HTTP 403 (Akamai). Nur als Link.
- **Keepa:**
  - `api.keepa.com/robots.txt` ist `Disallow: /` für Crawler; die API ist für Abrufe mit Schlüssel gedacht.
  - Das Secret `KEEPA_KEY` ist **nicht gesetzt**, deshalb gab es keine Abfrage.
  - Keepa wäre die einzige saubere Quelle für Amazon mit Verlauf, Minimum und Durchschnitt mit Zeitstempel. `keepa.mjs` ist vorbereitet.
  - Kosten laut Drittquelle ab etwa 49 €/Monat (nicht geprüft).
- **heisse-preise.io:** robots.txt kam mit HTTP 500. Nach RFC 9309 gilt dann alles als verboten, deshalb wurde die Startseite nicht abgerufen. Die Seite wirkt gestört.

## Empfehlung

### Lebensmittel (Watchlist)

1. **Aktueller Aktionspreis in Döbeln:** wie bisher marktguru.
2. **Tiefstpreis und üblicher Angebotspreis:**
   - Aus dem **eigenen marktguru-Verlauf** (`history.json`), getrennt beschriftet:
     - „Tiefstpreis seit <Datum> (eigener Verlauf)“.
     - „Tiefstpreis 12 Monate“ über `tiefstSeit(…, 365)`.
     - „Üblicher Angebotspreis“ (bisher `statistik.normal`, steht heute fälschlich als „Normalpreis“ auf der Seite).
   - Weil der Verlauf bei null beginnt, braucht jedes Watchlist-Produkt einmalig einen **recherchierten Startwert mit Quelle und Datum**, z. B. `tiefstBekannt: {p, packung, shop, datum|null, quelle, url}`.
   - Gefundene Kandidaten:
     - Knoppers 8er/200 g: 1,39 € (Aldi Süd, Kaufland, Feneberg; supermarktcheck, ohne Datum).
     - Crunchips 150 g: 0,99 € (Netto, 17.08.2026; Open Prices), dazu laut mydealz Kaufland 0,88 € (29.–31.10.2026).
     - Ben & Jerry's 465 ml: 3,99 € (Kaufland; supermarktcheck, ohne Datum). Lidl 3,99 € ab 01.11.2026 kommt ohnehin per marktguru.
     - Color-Rado 340 g: 1,11 € (Netto MD, 28.04.2025; Open Prices).
3. **Regulärer Preis jetzt:**
   - Regalpreis von **supermarktcheck.de** je Kette, ausdrücklich als „Regalpreis laut Nutzermeldung (supermarktcheck.de), Meldedatum unbekannt“.
   - Bei Märkten in Döbeln bevorzugt die passende Kette (Kaufland, Netto MD, Marktkauf, EDEKA, Lidl, Aldi Nord).
   - Produkt-IDs einmal von Hand, Abruf höchstens wöchentlich. Vorher die Nutzungsbedingungen lesen.
   - Falls diese das Auslesen ausschließen: denselben Wert von Hand in `watchlist.json` pflegen (`normalpreisFest` mit `quelle` und `stand`).
4. **Ergänzung Open Prices** (offen, ODbL): datierte Einzelpreise aus Deutschland mit Ort als „gesehen am … in …“. Wenig Daten, aber sauber.
5. **Nicht verwenden:**
   - prospektangebote.de (WAF-Sperre).
   - kaufDA (nur aktuelle Woche, Standort Berlin).
   - discounto-Archiv (ein Abruf je altem Angebot).
   - heisse-preise.io (gestört).

### Technik / Amazon

1. **Vergleichspreis:** `nextBestPrice` der mydealz-Deal-Seite, schon im Code. Beschriftung „Vergleichspreis laut mydealz“, nicht „Tiefstpreis“.
2. **Echter Verlauf und Tiefstpreis:** nur über **Keepa**. Dafür braucht es Xanders Entscheidung wegen der Kosten, dann das Secret `KEEPA_KEY` und die ASINs in der Watchlist. `keepa.mjs` sollte dann den Zeitstempel von `stats.min` behalten.
3. **Ohne Keepa:** nur Links „Preisverlauf ansehen“ zu geizhals (`?phist=<ID>`), Amazon (`/dp/<ASIN>`) und camelcamelcamel, **nichts auslesen**.

### Beschriftung auf der Seite (rechtlicher Hinweis)

- Ein „statt“- oder UVP-Preis aus dem Prospekt ist nach § 11 PAngV höchstens der niedrigste Preis der letzten 30 Tage oder eine UVP. Er ist kein langfristiger Tiefstpreis.
- Deshalb drei Zeilen getrennt halten:
  - „Regalpreis (Quelle, Stand)“.
  - „Üblicher Angebotspreis (eigener Verlauf, N Tage)“.
  - „Tiefstpreis (Wert, Datum, Händler, Quelle)“.

## Dateien

- Sonden-Skript: `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/ph/sonde/schnaeppchen/scan/sonde-historie.mjs`. Zweig `preis-sonde`, Commits 7bc34f9 und 646cabf.
- Workflow (nur auf `preis-sonde`): `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/ph/sonde/.github/workflows/schnaeppchen.yml`
- Rohdaten: `roh-daten:preis-sonde/41227676320/`. Lokale Kopie: `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/ph/ergebnis/preis-sonde/41227676320/`

Quellen (abgerufen am 31.10.2026 aus GitHub Actions):
- https://api.marktguru.de/api/v1/offers/search
- https://www.supermarktcheck.de/product/12061-storck-knoppers-milch-haselnuss-schnitte-
- https://www.supermarktcheck.de/product/435077-lorenz-crunchips-
- https://www.supermarktcheck.de/product/78546-ben-jerrys-ice-cream
- https://www.discounto.de/Aktuelle-Angebote/Knoppers/
- https://www.discounto.de/Aktuelle-Angebote/Haribo/
- https://www.kaufda.de/Angebote/Knoppers
- https://www.mydealz.de/deals/wd-elements-portable-6-tb-externe-25-festplatte-wdbnef0060bbk-eesn-usb-30-2862243
- https://prices.openfoodfacts.org/api/v1/prices
- https://geizhals.de/?phist=3524924
- robots.txt von allen genannten Hosts

Ohne eigenen Abruf, nur zitiert: § 11 PAngV, Nutzungsbedingungen camelcamelcamel (09.04.2024), Keepa-Preise (RevenueGeeks).
