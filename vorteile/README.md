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
| **Deals** | jeder Deal wird *echt* durchgerechnet: „2 für 1“, „3 zum Preis von 2“, „zweite gratis“, Bündelpreise („2 Tüten für 0,88 €“), „+25 g gratis“, Limits pro Kunde, Markt-Coupons + Cashback (stapelbar), Versand. Ergebnis: Preis pro Packung und pro 100 g. Eine Packung, die pro 100 g teurer ist, wird nie empfohlen. Ohne echte Mehrkauf-Aktion wird **genau 1 Packung** gerechnet. Der mydealz-Preis ist der Endpreis: ein Coupon darin („2,49 € − 1 € Coupon = 1,49 €“) wird nicht noch einmal abgezogen. „Statt“ = Vergleichspreis der mydealz-Deal-Seite, sonst der niedrigste Vergleichswert aus dem Text (nicht die höhere UVP). Amazon ohne Prime: unter 39 € + 3,99 € Versand. Preisfehler nur krasse (`lib/krass.mjs`, Spiele nur ≈ 1 €). Dazu **Geld-zurück-/Cashback-Aktionen** (`grund: 'cashback'`, `extra.art` gzg/cashback; Regeln aus `module.praemien`, `deals.cashback`) für den Abschnitt Cashback – nur Zusammenfassung, kein Sofort-Push. | Schnäppchen-Daten, mydealz-RSS |
| **Erleben** | Therme/Erlebnisbad, Kino, Freizeit, Stadtfeste in der Region – nur wenn ungewöhnlich gut (großer Rabatt, gratis, sehr beliebt) | mydealz-Gruppen (Kino, Freizeitparks, Wellness – mit Stichwörtern, `erleben.mydealz`), Google-News-RSS |
| **Reisen** | Flug-, Bahn- und Urlaubs-Knaller ab Leipzig/Dresden/Berlin, Preisfehler | mydealz Reisen, Urlaubspiraten, Urlaubsguru |
| **Musik** | Wunsch-Synths unter Zielpreis oder auf Tiefstpreis | mydealz neue + heiße Deals (`/rss/alles`, `/rss/trending`, je Gerät nach Suchwort gefiltert, `musik.geraeteMydealz`), optional Geizhals |
| **Remix-Contests** (`remix`, seit 08.11.2026) | laufende Contests mit Stems; Genre-Treffer (Synth-Pop, 80er, Italo, Euro-Disco, Elektro, Dark/New Wave, Pop) = „passt zu deinem Stil“, ohne Genre-Wort trotzdem drin („offen“), raus nur reine Hip-Hop/Metal/Schlager/Trap-Contests; Frist deutsch/englisch/Feld, ohne Frist ≤ 30 Tage alt; Sofort-Push nur passend + Frist ≤ 14 Tage. Dazu **Fundorte** (SKIO, Beatportal, Beatport Greenroom, delamar, Remix64) – immer sichtbar | Google News DE+EN (auch Aufrufe ohne das Wort „Contest“: „Remix Cerrone’s …“), Audius-API, Beatportal-Liste (nur Karten über einem datierten Google-News-Treffer), WordPress-Suchfeeds (Attack, Rekkerd, Dancing Astronaut; EDM Identity seit 403 raus); gleicher Contest aus mehreren Artikeln einmal; passende Stile immer vor offenen |
| **Auftritte** (`auftritte`, seit 08.11.2026) | Bands gesucht, Bandcontests, Open Stage/Open Mic, Stadtfest-/Festival-Bewerbungen – Ort + km ab Döbeln, Frist, Bewerbungsweg (Formular/Mail/Seite), Name (Band-Slot = One Day in Rome, Solo = Xander Fox). Sortiert nah + bald. **Fundorte** mit Saison (Kulturnacht + Stadtfest Döbeln, 7:77 Open Stage Leipzig, WGT per Mail, Fête de la Musique Leipzig, SPH Music Masters, gigmit-Startseite mit „Link prüfen“) – nie leer. Nur echte Aufrufe (gesucht/sucht/bewerben/Anmeldung/mitmachen …); „Bandcontest“ allein, Nachberichte („… starten“, „im Finale“, „sind dabei“) und vergangene Termine („im Oktober 2026“) raus; ohne Frist 60 Tage sichtbar (wie gesucht) | Google News (Orte auch Mitteldeutschland: Bernburg, Köthen, Naumburg …), Seiten mit JSON-LD (config `seiten`, derzeit leer) |
| **Deutschunterricht** (`unterricht`, seit 08.11.2026) | Stellen/Gesuche: Integrationskurse, DaF/DaZ, Nachhilfe, online; Döbeln + Umkreis und von zu Hause. **Fundorte**: Jobbörse-Live-Suche, italki, Preply, Lingoda, BAMF-Zulassung | Jobbörse der Arbeitsagentur (`/pc/v6/jobs`, Ausweich-Adressen; v6-Felder `ergebnisliste`/`stellenlokationen`/`firma` seit 08.11.2026 gelesen: Titel, Arbeitgeber, Ort, km ab Döbeln, Link `arbeitsagentur.de/jobsuche/jobdetail/<refnr>`, „online seit“) – echte Stellen stehen vor den Fundorten; Remotive-API (nur Lehr-Stellen), Google News. **Gesuche aus dem Netz** (seit 14.11.2026, `module/gesuche.mjs`, config `unterricht.gesuche`): Leute, die Hilfe mit Deutsch suchen – **Reddit und Freelancer.com seit 16.11.2026 AUS** (robots.txt „Disallow: /“ bzw. Nutzungsbedingungen; beide in `abruf.agbVerbot`, nur noch als fertige Suche); Filter Gesuch (suche/looking for/[hiring] …) + Deutsch + Art der Hilfe, Angebote ([for hire], biete …) raus, höchstens 14 Tage; Fundorte mit fertiger Suche (Upwork, Fiverr, Kleinanzeigen …). Ausfälle = Hinweis, keine Störung |
| **Nebenverdienst** | Übersetzung Deutsch↔Arabisch/Englisch, KI-Bild/Video, kleine kreative Jobs – von zu Hause | Jobbörse der Arbeitsagentur (`/pc/v6/jobs`; v4 = HTTP 403 seit 11/2026) – **aus seit 16.11.2026** („Gesuche ohne Arbeitsamt“), ersetzt durch `auftraege` |
| **Nebenverdienst – Aufträge** (`auftraege`, seit 16.11.2026) | Gesuche, bei denen Xander allein helfen kann: Unterricht geben (Musik), KI & Apps, Bild & Video – Döbeln + Umkreis (`vorOrtKm`) oder online; Bewertung passt/Aufwand/allein, Betrugsmuster raus oder Warnung, Kontaktdaten werden nie gespeichert | öffentliche Feeds nach Prüfung der robots.txt (hnrss.org „Seeking freelancer“, service.bund.de-Ausschreibungen); Freelancer.com nur als fertige Suche (Nutzungsbedingungen, `agbVerbot`); 21 fertige Suchen in `suchLinks` |
| **Tests & Gewinnspiele** | Produkttests (Technik, Snacks) und Gewinnspiele mit attraktivem Preis und echten Chancen – Fallen (Gewinnspiel-Services, Abos, SMS, Kosten) fliegen raus | mydealz, Google-News-RSS |
| ~~**Prämien & Freunde werben**~~ | **Aus seit 07.11.2026** (`aktiv: false`, Xander: Strom, Bank, Konto, Freunde werben komplett raus; die Seite zeigt den Bereich nie). Früher: Werbeprämien (Freunde werben), Konto-/Neukundenprämien, Cashback, Strom-/Gas-/Handy-Wechselbonus, Payback-/Coupon-Extrapunkte, Gratis-Produkte, Geld-zurück-Aktionen, App-Startprämien. Pro Eintrag: Prämie, Kosten (Gebühr × Laufzeit, Versand), **netto**, Aufwand in Minuten, Haken (Mindestumsatz, Geldeingang, Laufzeit, Kündigung, Schufa). Sortiert nach **netto pro Stunde Aufwand**. Strikt raus: Schneeball/MLM, Krypto/Trading, Glücksspiel, Abo-Fallen, Vorkasse, fremde Daten, Umfrage-Seiten, Kredite | mydealz-RSS (Freebies + Gruppen), gepflegte Liste in `config.json` |
| **Filme & Serien** | Apple TV / iTunes DE alle 3 h: **Wunschliste** (Zielpreis, Standard 4,99 €), Angebote ≤ 3,99 €, neue Filme (Komödie, Action, Thriller, Sci-Fi; ohne Kinderfilme: Titel oder Reihe im Chart „Kinder & Familie“ (Reihen 3 Tage im Zustand, falls das Chart ausfällt), Wikidata-Genre Kinder-/Familienfilm (Animation allein zählt nicht), Apple-Genre – in den anderen Bereichen bleiben sie; `status["apple-charts"].kinderNichtNeu` + `…Titel` mit Grund), 80er & Kult, Disney, Rick and Morty + Star Trek je Staffel – mit Tiefstpreis seit Beobachtung; Horror nie. Übersicht für die Seite (seit 14.11.2026): `fuer399` (Kauf ≤ 3,99 €, mydealz-Sets ≤ 3,99 € je Film, kein mydealz-Tipp zu einem Film, der schon als Apple-Titel dasteht), `action` / `comedy` (Kauf ≤ 7,99 € oder ≤ 70 % des bisherigen Preises), `achtziger` (+ gute Klassiker bis 1999); Chart-Titel nur bekannt oder gut bewertet (Wikidata: Wikipedia-Sprachen, Rotten Tomatoes), nie Horror (Apple-Genre, Wikidata-Genre, Beschreibung – ein schwaches Zeichen reicht, wenn Wikidata den Film nicht kennt); Filmjahr von Wikidata, wenn Apple nur die Wiederveröffentlichung kennt. `status.filme.kurz` für die Start-Kachel: Zahl echter Angebote (≤ 3,99 €, gesenkt, Wunschfilm unter Ziel – kein Normalpreis bis 7,99 €) und die drei besten Titel. Listen in [filme.json](filme.json); eigene Ausgabe `data/filme.json` für den Reiter „Filme“ der Seite. Sofort-Push: Wunschfilm ≤ Ziel oder neuer Tiefstpreis, Staffel ≤ 9,99 €, 80er/Disney ≤ 3,99 €; sonst Zusammenfassung. Apple-Abstand 3,2 s (`abruf.pauseMsJeHost`); Stellschrauben (Abrufe, Suchen, Zeitbudget) in `STANDARD` von `scan/module/filme.mjs`, änderbar unter `module.filme`. **Apple-Nummern** (die iTunes-Filmsuche liefert seit Herbst 2026 immer 0 Treffer): je Titel der erste Erfolg von `de` (Suche DE), `us` (Suche im US-Store mit dem englischen Titel `en`, dann Lookup DE), `wikidata` (P6398 „iTunes movie ID“, dann Lookup DE), `charts` (Titel/Jahr-Abgleich mit den Apple-Charts, dazu Drama/Independent nur zum Finden); „nicht im Store“ erst, wenn alle Wege leer waren (Marke `alle`; ein „fehlt“ der alten Fassung ohne Marke wird sofort mit allen Wegen neu gesucht; offene Titel – Wikidata/Lookup gestört – rücken hinter nie Versuchte, `versucht`); ein Suchweg mit 4 leeren Antworten in Folge ruht, jeder Lauf probiert ihn einmal (Statistik: `status["apple-suche"].wege`, `.leer`, `.ruhend`). **Apple-Aktions-Sammlung** (16.11.2026): Start ist die Startseite `tv.apple.com/de` (`filme.json` → `appleTv.start`); alle Räume und Sammlungen darauf (`/room/…`, `/collection/…`, auch `uts.room.*`/`uts.col.*`) werden am Namen geprüft, eine Sammlung wie „Filme für 3,99 €“ also ohne feste Adresse gefunden; steht ein Preis im Namen, kommen alle ihre Filme vorn in `fuer399` (Marke `raum`). `status["apple-tv-raeume"].gesehen` = Zahl der gefundenen Räume. Stand Roh-Lauf 43793546633: Das Web zeigt nur Apple-TV+-Räume (16), der Store-Reiter mit den 3,99-€-Aktionen kommt nur in der TV-App (UTS `browse/store` 404, `canvases/Roots/store` 406). **Breite Suche** (16.11.2026, `filme.json` → `charts.breit`): zusätzlich Top-Charts JE GENRE (Filme: Anime, Doku, Drama, Ausland, Independent, Musicals, Romanze, Sport, Western, Feiertage, TV-Filme, Konzert/Musik; Staffeln: alle TV-Genres), Genres rotieren (am längsten nicht geholte zuerst, höchstens 18 je Lauf, ein leeres ruht 7 Tage; Apple liefert je Feed höchstens 100 Einträge, auch bei `limit=200`). Der Chart-Preis (= HD-Kaufpreis des Lookups, 25/25 im echten Lauf) filtert vor; der Lookup (≤ 150 Nummern je Abruf) holt nur Kandidaten (Film ≤ 4,99 €, Action/Comedy ≤ 7,99 €, ohne Preis, gesenkt laut eigener Chart-Preis-Historie `zustand.filme.breit.p`); Staffeln nur mit echter Senkung gegenüber dem früher selbst gesehenen Preis (krumme Season-Pass-Preise zählen nicht). Neue Chart-Titel nur mit Wikidata-Daten (bekannt oder gut bewertet). Nur ZUSÄTZLICH: der bisherige Weg macht dieselben Abrufe in derselben Reihenfolge, neue Treffer werden angehängt, Doppel fallen weg, und eine eigene Kappe sorgt dafür, dass kein neuer Treffer einen bisherigen verdrängt (Test `filme-breit.test.mjs`, Beleg aus echten Läufen `fixtures/filme-breit-beleg.json`). Höchstens 40 Apple-Abrufe je Lauf (alles zusammen), Status `status["apple-breit"]` (Genres, Kandidaten, Abrufe). Belege: Apple-Forum „iTunes Search API: media=movie returns 0 results“ (developer.apple.com/forums/thread/848610, auch `country=us`), Wikidata-Eigenschaft P6398 | iTunes Search/Lookup-API (DE + US), Apple-Charts-RSS, Wikidata, mydealz-Gruppen `apple-tv` + `filme-serien` |
| **Most Wanted, Reihen, Advent** (in `filme`, seit 28.11.2026) | **Most Wanted** (`filme.json` → `mostWanted`): Reihen (Jurassic Park komplett, Go Trabi Go 1 + 2 – Teil 2 „Das war der wilde Osten“ von 1992 gibt es –, Star-Trek-Kinofilme) und Serien (Raumschiff Enterprise, Parker Lewis, MacGyver, Knight Rider, Ein Trio mit vier Fäusten, Ein Colt für alle Fälle, Saber Rider, He-Man, BraveStarr, Stingray, Dark Skies, Earth 2, Outer Limits). Gleiche Suchwege wie die Wunschliste (DE, US, Wikidata, Charts; Serien per Staffel-Suche). Je Titel `imStore` (true / false = alle Wege leer / null = noch nicht geprüft), Preis, Tiefst (eigene Beobachtung), üblicher Preis, `alarm`/`unterAlarm`; Serien: Staffeln der gemeinten Serie (`jahr`/`bis` ±1 – gleichnamige Neuauflagen wie MacGyver 2016 zählen nicht, `ausgeblendet`), günstigste Staffel, Tiefst. Sofort-Push: Film ≤ `alarm` (3,99 €), Staffel ≤ `staffelAlarm` (4,99 €). **Reihen** (`filme.json` → `reihen`, z. B. Police Academy 1–7): für „Habe ich / Fehlt mir“ und damit der Lookup eines Teils die Box (collectionId) findet. **Advent**: jedes Tagesangebot (Countdown) bleibt den ganzen Dezember in `zustand.filme.adventTage` → `filme.json` → `advent.tage` (Kalender der Seite; nie ein Tag aus der Zukunft). `filme.json` → `zusatz` nennt die Zahlen von Katalog und Musik (letzter Stand) | wie Filme & Serien |
| **Alle 3,99 € / Staffeln 4,99 €** (`filmkatalog`, seit 28.11.2026) | **Katalog**: jeder Film/jede Staffel, die der Radar je in einem Apple-Chart (alle Genres aus `filme.json` → `charts`, je höchstens 100) oder in einer Box gesehen hat, mit frischem Preis per Lookup (reihum, höchstens `maxLookups` × 150 Nummern je Lauf, die am längsten nicht geprüften zuerst; Filme aus den Charts alle 14 Tage auch per Lookup, damit die Box-Nummer bekannt wird). Ausgabe `data/filmkatalog.json`: Filme ≤ 3,99 € und Staffeln ≤ 4,99 € je Genre (nur Preise ≤ 2 Tage alt; nicht, wenn der Titel in der letzten Lookup-Antwort fehlte – außer er stand heute mit Preis im Chart – oder zuletzt keinen Kaufpreis hatte, Kurzprüfung 28.11.2026), Box-Inhalte (einzelne Teile, Lookup `entity=movie`), Zahlen (bekannt / geprüft). Jede entdeckte Box kommt in `zustand.filme.boxen` (Preis und „deutlich reduziert“ macht weiter `filme`). Ehrlich: Apple hat keine Liste „alle Filme zu einem Preis“ – vollständig nur so weit, wie Apple einen Titel irgendwann zeigt. Chart-Adressen = die von `filme` (im selben Lauf gemerkt, kein zweiter Abruf), höchstens `neueCharts` weitere; die gemeinsame Obergrenze der Apple-Schnittstelle je Lauf beendet die Charts ohne Störung. Stellschrauben: `KATALOG` in `scan/module/filmkatalog.mjs`, änderbar unter `module.filmkatalog` | iTunes-Charts (RSS als JSON), iTunes Lookup |
| **Musik im Store** (`musikstore`, seit 28.11.2026) | Alben bis 4,99 € (günstigste Stufe) und Songs für 0,69 € der Künstler aus [musik.json](musik.json) (Synthpop: Depeche Mode, OMD, Pet Shop Boys …; Heavy Metal: Iron Maiden, Metallica, Judas Priest …), nur die ersten `rangMax` Alben in Apples Reihenfolge (vermutlich die bekanntesten zuerst – im ersten echten Roh-Lauf prüfen), keine Singles/EPs/Karaoke/fremden Sampler; teurere Alben nur, wenn selbst gesenkt gesehen (≥ 20 %). Künstlernummer einmal per Suche (`entity=musicArtist`, eigener Suchbegriff `suche`, Schreibweisen `auch`), sonst Wikidata P2850 (Format im Roh-Lauf prüfen), sonst ehrlich „nicht gefunden“ (14 Tage Pause). Je Lauf `maxKuenstler` reihum (Alben + 25 bekannteste Songs), die übrigen mit ihrem letzten Stand (≤ 3 Tage). Ausgabe `data/musikstore.json`; keine Pushes | iTunes Search (nur Künstlernummer), iTunes Lookup, Wikidata |
| **Wochen-Knaller** (seit 16.11.2026) | Modul `knaller`, alle 6 h: je Markt (Aldi Nord, Lidl, Kaufland, Netto Marken-Discount, Penny, REWE, Marktkauf, EDEKA – Liste in `config.json` → `module.knaller.maerkte`) die kaufDA-Orts-Händlerseite `/<Ort>/<Händler>/p-r<id>` (der Reihe nach Döbeln, Chemnitz, Leipzig – eigene Prospekte je Region, Roh-Lauf 43793492110; `/Geschaefte/<Händler>` ist immer Berlin), erst ohne Ortsseite bundesweit (Hinweis im Status, Angebote `regional`, Seite nennt den Markt im Fuß); nächste Filiale von Döbeln weiter als `maxFilialeKm` (30) = „kein Markt in der Nähe“ (Hinweis, keine Störung), Angebote ab `minProzent` (30 %) Rabatt, je Markt höchstens 40. **Rabatt nur mit Vergleichspreis aus dem Prospekt** (`secondaryPrice`), mit Art `streich` (Streichpreis) oder `uvp`; ab-Preis = `abPreis` („bis zu“), App-/Kartenpreis = `app`. Bild = Prospekt-Ausschnitt (nur https-Link). Kein Eintrag in `aktuell.json` und kein Push; eigene Datei `data/knaller.json` für den Reiter „Woche“ der Seite, Übersicht `status.knaller.kurz` (`ab: {30, 40, 50}`, `top`) für die Start-Kachel. Ausfall eines Markts: dessen noch gültige Angebote aus der letzten Datei bleiben (`maerkte.<id>.alt`). | kaufDA (robots.txt: `/Geschaefte/` erlaubt, crawl-delay 2 -> `abruf.pauseMsJeHost` 2,1 s) |
| **Essen – Lokale** (seit 16.11.2026) | Modul `essen`, alle 3 h, OpenStreetMap höchstens alle 20 h (`osmStunden`): **eine** Overpass-Abfrage (Lokale mit Namen im Umkreis 30 km um Döbeln, Ketten-Filialen bis 70 km, Zeitlimit 100 s). Grundlage ist die gepflegte Liste `vorteile/essen.json` (Lokale mit Küche, Bewertungen = Portal, Wert, Stimmen, Stand; „was Leute sagen“ in eigenen Worten; Ketten mit nächster Filiale, Lieferung nach Döbeln ja/nein, Aktionen = ids aus `mein-vorteil/essen.json`). Ergebnis `data/essen.json`: Lokale + OSM (Öffnungszeiten `opening_hours`, Lage, km Luftlinie, Website), `weitere` = **alle** übrigen OSM-Lokale bis 30 km (ohne Bewertung, knapp: ohne id und leere Felder; echt ~700 Lokale, ~33 KB gzip; Ketten-Filialen über 5 km nur unter „Ketten“), nächste Filiale je Kette, `neu`/`weg` gegenüber den Lokalen der letzten Datei (über 25 = Abfrage geändert, nicht gezählt). Namen: OSM-Name enthält den gepflegten bzw. Ketten-Namen (nicht umgekehrt – „Pizza“ ist nicht Pizza Hut); Punkt + Fläche desselben Lokals zählen einmal; fehlt `addr:city`, steht „bei <Ort>“ vom nächsten Lokal mit Ort (≤ 1,5 km), sonst nichts. Ausfall mit altem Stand = Hinweis. **Push nur für gemerkte Lokale**: Stern auf der Seite (die Seite meldet die ids `{ v: 1, essen: [...] }` an das ntfy-Thema `module.essen.merkThema`, der Radar liest es je Lauf und hält die letzte Liste in `zustand.essen.gemerkt`) und `module.essen.gemerkt` (von Claude gepflegt): am All-you-can-eat- oder festen Aktionstag (Tagesessen/XXL mit Wochentagen) zwischen 9 und 17 Uhr „Heute All-you-can-eat: …“ bzw. „Heute: …“, gültig bis 23:59 Berliner Zeit (Seiten-Daten dann einmal von GitHub, weil der Workflow nur `vorteile/` auscheckt). | OpenStreetMap über overpass-api.de (ODbL, öffentlich, ohne Schlüssel); Merkliste über ntfy.sh |
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
- **`filme.json`** – Wunschliste, Serien, 80er, Disney, **`mostWanted`** (Reihen + Serien mit Alarm-Schwelle `alarm` / `staffelAlarm`,
  je Reihe/Serie änderbar; Serien mit `jahr`/`bis` für die gemeinte Fassung) und **`reihen`** (nur für „Habe ich / Fehlt mir“ und Boxen).
- **`musik.json`** – Künstler für „Musik im Store“: `name`, `genre` (Spalte der Seite), optional `suche`, `auch`, `id` (Apple-Künstlernummer).
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

- `scan/main.mjs` ruft die fälligen Module auf (Intervalle in `config.json`: Deals stündlich, Reisen 2 h, Filme/Remix/Auftritte/
  Deutschunterricht mit Gesuchen 3 h, Erleben/Musik/Tests 6 h, Nebenverdienst 12 h; Remotive darin höchstens alle 6 h).
  Die Regel steht in `scan/faellig.mjs` und gilt für die Vorprüfung im Workflow und den Lauf gleich.
  Fällt eine Quelle aus, laufen die anderen weiter; die alten Einträge bleiben stehen.
- **Neuversuch nach Quellen-Fehler** (seit 16.11.2026, MV8; Anlass: Lauf 43892154739, Overpass 502 + Ausweich-Server
  Zeitlimit – die Filialen behielten den letzten Stand, galten aber als gelaufen und wären erst nach 168 h wieder dran).
  Behält ein Bereich wegen eines Quellen-Fehlers nur den letzten Stand (Fehler im Status, alte Einträge behalten, Modul
  meldet `letzterStand` wie Filialen/Essen-OSM, oder Absturz), gilt er **nicht** als gelaufen: `zustand.lauf` bleibt der
  letzte Erfolg, dazu `zustand.neuversuch.<bereich> = { ab, n, seit, retryAfterS? }`. Neuversuch nach **3 h**, beim
  2. Fehlschlag in Folge nach **6 h**, beim 3. nach **12 h**, danach im normalen Takt – nie später als der normale Takt
  (Bereiche mit 1–3 h Takt bleiben also bei ihrem Takt). Verlangt die Quelle per `Retry-After` mehr, gilt das für den
  ganzen Bereich nur, wenn er wirklich **nur** den letzten Stand hat (höchstens 24 h bzw. der normale Takt, wenn der länger
  ist; `lib/http.mjs` hängt den Wert an den Fehler, die Drosselung dort bleibt gleich). Hat er frische Einträge aus anderen
  Quellen (Teil-Fehler, Essen mit altem OSM-Stand), hält ihn ein `Retry-After` höchstens bis zu seinem Takt an. Den Server
  selbst schützt die **Ruhe je Host**: über 60 s `Retry-After` (`abruf.retryAfterMaxMs`) → `zustand.hostRuhe.<host>` (ISO,
  höchstens 24 h); bis dahin fragt kein Bereich diesen Host, auch nicht im selben Lauf (Filialen und Essen teilen sich
  overpass-api.de) – der Abruf endet sofort mit „<host> bat um Pause (Retry-After) bis …“. Ein manueller Lauf „alle“
  vor dem gemerkten Neuversuch zählt keine Stufe hoch (er schiebt den Neuversuch nur nach hinten); beschädigte Einträge in
  `neuversuch`/`hostRuhe` fallen weg bzw. werden auf max(Takt, 24 h) gekappt. Erfolg → normaler Takt, Zähler weg. Geprüft wird nur bei den Starts des Zeitplans (Vorprüfung) –
  nie öfter, also kein Overpass-Dauerfeuer. Die Seite zeigt weiter „letzter Stand“ wie bisher; `status.<bereich>.neuversuch`
  nennt nur zusätzlich die Zeit des nächsten Versuchs. Regel-Sperren (robots.txt/Nutzungsbedingungen) sind keine Störung
  und laufen im normalen Takt. Übergang: hat ein älterer Lauf einen Fehlversuch noch als „gelaufen“ gemerkt
  (`lauf` = `status.stand` mit „letzter Stand“/Störung, so am 16.11. 15:03 bei Filialen und Essen), tragen Vorprüfung und Lauf
  den Neuversuch einmal nach (`neuversuchNachtragen`). Tests: `scan/test/neuversuch.test.mjs`.
- **Bremse nach HTTP 429** (seit 17.11.2026, Runde 9; Anlass: Läufe 43970348817 und 44004388489 – Google News antwortete
  mitten im Lauf 429 ohne `Retry-After`, die Wiederholung 3 s später ebenso, Sekunden danach wieder 200; Erleben bzw. Remix
  galten dadurch als gestört): meldet ein Host 429, verdoppelt `lib/http.mjs` für den Rest des Laufs den Abstand zu genau
  diesem Host (`abruf.bremse429MaxMs`, höchstens 15 s), und die eine Wiederholung kommt frühestens nach
  `abruf.wiederhol429Ms` (20 s) bzw. nach dem längeren `Retry-After`. Andere Hosts und 5xx bleiben unverändert; ohne die
  beiden Werte (und mit `pauseMs` 0 in Tests) gilt das alte Verhalten. Das Protokoll nennt „nach HTTP 429 gebremst: …“.
  Tests: `scan/test/bremse429.test.mjs`.
- `scan/rechnen.mjs` – die Deal-Mathe. `scan/benachrichtigen.mjs` – Sofort/Zusammenfassung, Dedupe, Tageslimit.
- `scan/module/*.mjs` – ein Modul pro Bereich. `scan/lib/` – Abruf (höflich: eigener User-Agent, Pause pro Server), RSS, Text.
  Gleiches Muster und gleiches Datenformat wie `schnaeppchen/scan/` und `konzerte/scan/`.
- Workflow `.github/workflows/vorteile.yml`: acht Zeitpläne je Stunde (:04 :11 :19 :26 :34 :41 :49 :56), dazu ein Start nach
  jedem Lauf von Schnäppchen-Wecker und Konzert-Alarm, plus manuell (*Actions → Vorteils-Radar → Run workflow*,
  mit „digest“ für eine Zusammenfassung sofort oder „alle“, um alles neu abzufragen).
  **Warum so viele?** GitHub startet geplante Läufe hier nur etwa alle 7 Stunden (gemessen 31.10.–14.11.2026: 53 von 335
  stündlichen Läufen = 16 %, zu beliebigen Minuten). Ob mehr Zeitpläne mehr Starts bringen, ist nicht belegt; sie kosten
  dank Vorprüfung fast nichts. Wichtiger ist der Start nach den anderen Weckern (`workflow_run`, nur Läufe auf `main`):
  alle geplanten Starts der drei Wecker zusammen lagen im Median 2,1 h auseinander (p90 4,7 h) – erwartet also etwa alle
  1–2 Stunden frische Daten; gemessen wird nach der Übernahme (Alter von `aktuell.json`; „cancelled“-Läufe getrennt zählen).
  Jeder Start fragt zuerst `node scan/faellig.mjs --data …`: ist kein Bereich und keine Zusammenfassung dran, endet er
  nach Sekunden – ohne Abruf, ohne Tests, ohne Commit (eine gescheiterte Zusammenfassung erst nach 1 h wieder). Am Ende
  stößt er Schnäppchen-Wecker (Daten > 70 Min. alt) und Konzert-Alarm (> 190 Min.) per `gh workflow run` an, frühestens
  30 Min. nach deren letztem Lauf – nur mit dem eingebauten Token (`permissions: actions: write`), kein Geheimnis.
  Folge: Schnäppchen fragt mydealz/kaufDA/Keepa dann etwa stündlich statt alle ~7 h (so war es ursprünglich geplant).
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

**Ausgefallene Quellen (Stand 07.11.2026, echter Mitschnitt):** Die mydealz-Suche als RSS (`/rss/search?q=…`) gibt
es nicht mehr (HTTP 404, alle 20 Suchen im Lauf vom 07.11.). Ersatz für alle Module (zentral in `scan/module/gemeinsam.mjs`):
Gruppen-Feeds `/rss/gruppe/<name>` (Name = Adresse der Gruppenseite `mydealz.de/gruppe/<name>`) bzw. `/rss/alles` und
`/rss/trending`, jeweils mit Stichwortfilter (`stichwoerter`); eine alte Such-Adresse in der config wird automatisch auf
`/rss/alles` + Stichwort umgestellt. Die iTunes-Filmsuche liefert immer 0 Treffer (Lookup und Charts gehen) – siehe
Filme & Serien oben. Urlaubsguru antwortet mit 401,
die Jobbörse der Arbeitsagentur mit 403 (Nebenverdienst leer). **Stand 08.11.2026:** Die Jobbörse v6 liefert Treffer (Felder siehe `scan/lib/ba.mjs`, beachtet `veroeffentlichtseit` nicht – Alter prüft der Radar); Urlaubsguru antwortet mit 401 → Status `gesperrt` (kein Fehler), eine Woche lang nicht mehr gefragt; gigmit-Stadtseiten 404 → raus, nur die Startseite als Fundort mit „Link prüfen“; EDM Identity 403 → raus. Echte Antworten dieses Laufs: `scan/test/fixtures/echt-0811/` (Tests `scan/test/echt-0811.test.mjs`). Die mydealz-Gruppe „drogerie“ liefert nur Beiträge
von 2019/2020 (fallen über das Höchstalter raus).

## Datenformat (`vorteile/data/knaller.json`, seit 16.11.2026)

```text
{ version: 1, aktualisiert: ISO, ort: "Döbeln", standort: "Döbeln"|"Döbeln/Leipzig"|"Döbeln/bundesweit"|"bundesweit" (Prospekt-Orte der Märkte; je Markt maerkte.<id>.ort, .filiale {adresse, km, von}, .keinMarkt), minProzent, stufen: [30, 40, 50],
  maerkte: { <id>: { name, link, anzahl, prospektBis?, alt? } },
  angebote: [ { id, markt, titel, info, preis, vorher, vorherArt: 'streich'|'uvp'|'unbekannt', pct, abPreis?, app, bedingung,
                bild (https|null), prospekt?, link, gueltigAb, gueltigBis, regional: true, region, bereich: 'lebensmittel'|'nonfood'|null } ],
  status: { kaufda: { ok, anzahl, fehler[], abrufe, seiten: { <id>: n }, roh?: { <id>: n }, hinweise?, alt? } } }
```

Nachbesserung nach der Datenprüfung (16.11.2026): `pct` ist **abgerundet** (29,5 % ist nicht „ab 30 %“); `vorherArt` nur aus
`secondaryPriceIsUVP` (true = `uvp`, false = `streich`, fehlt = `unbekannt` – kein Goldrahmen); Doppel aus parallelen
(regionalen) Prospekten desselben Markts werden über dieselbe Bilddatei oder Marke + erstes Titelwort + Preis + Vergleichspreis +
Ende erkannt (echter REWE-Mitschnitt Berlin: 8 -> 2), `prospekt` = Prospekt-id bei kaufDA; eine Händlerseite **ohne ein einziges
Angebot** ist ein Hinweis (alte Angebote bleiben; echter Lauf 16.11.: Marktkauf ohne Prospekt am Standort), mehrere/alle leer
= Störung (Aufbau geändert?) statt still „0“, `roh` = gelesene Angebote des Markts (echter Lauf: je Seite 16); `standort` nennt
die Stadt nur, wenn ihre Seite die Angebote wirklich geliefert hat; App-/Kartenpreise erkennen auch DeutschlandCard, REWE Bonus,
Mitgliederpreis; `kurz.top` zeigt erst, was jetzt gilt, Späteres mit `ab`.

**2. Runde (16.11.2026, Xander: „Bei Aldi Nord sind diese Woche die Crunchips mit 50 % – die finde ich nicht“).** Befund
(Roh-Läufe 43797380195, 43818792502): die Döbelner Händlerseite zeigt je Markt nur 16 Angebote (`totalItems` Aldi Nord 359,
Lidl 1000, Kaufland 491, Netto 483, Penny 297, Marktkauf 424; `?page=2` wirkt nicht); die Crunchips standen auf Seite 20 des
Döbelner Aldi-Prospekts und nie auf der Händlerseite. Neu: Stichwortseiten `/Angebote/<Begriff>` (`stichworte`, je Lauf
`maxStichwortSeiten`, die am längsten nicht gelesenen zuerst, 404 = 7 Tage Pause), Angebote zählen nur aus den Prospekten der
Döbelner Seite (`prospekt` = `parentContent.id`) – oder, bei Lidl/Penny/Kaufland/Netto (dort zeigen die Stichwortseiten die
Berliner Prospekte), wenn marktguru für PLZ 04720 dasselbe Angebot (Markt, Preis, Marke) nennt (`bestaetigt: 'marktguru'`,
Roh-Lauf 43821908194: Lidl Pepsi Zero 0,99 statt 1,79 UVP ab Do 19.11.). Gültigkeit je Angebot: kaufDA kennt nur die
Prospektwoche; „ab Donnerstag“/„Fr. + Sa.“/„Wochenende“ im Text (`abQuelle: 'text'`, `wochenende`) und der Starttag aus
marktguru (`abQuelle: 'marktguru'`) setzen `gueltigAb`. Sammeln über die Läufe der Woche (Pool), `vorherArt: 'geschaetzt'` aus
`zustand.knaller.preise`, Staffel `minProzent` 20 / `stufen` [20, 30, 40, 50], `maxJeMarkt` 60, `maerkte.<id>.gesamt/gelesen/
mitVergleich/prospekte`, `kurz.ab` zählt nur, was heute gilt, `kurz.kommt` das, was diese Woche noch beginnt. Merkliste:
`lib/merken.mjs` (ntfy-Thema `merkThema`, `merkworte` in der config), Erinnerung am ersten Gültigkeitstag ab
`erinnerungStunde` (7), einmal je Angebot; Pushes allgemein nur für Einträge, die schon gelten (`plane`: `ab` in der Zukunft
bleibt ungemeldet).

**Merkliste mit Produkten (22.11.2026, Musiker: „Produkte auswählen und in eine Merkliste legen … am Start-Tag morgens ‚Heute
ab: …, bis …, Markt, Preis' – nicht vorher, nicht jeden Tag“):** Die Seite schickt im ersten Teil der Merkliste auch die gemerkten
Produkte `worte: [{ w, sorte, seit }]` (höchstens 12, streng gelesen: Buchstaben/Ziffern/`& ' . - + / ,`, `seit` nie nach der
Nachricht). Ohne `worte` (ältere Seite) bleibt die letzte Liste in `zustand.knaller.merkWorte`, `worte: []` vergisst sie. Der
Knaller liest die Merkliste jetzt VOR den Modulen und läuft sofort (Vorprüfung `faellig.mjs` und Lauf), wenn ein Produkt nach
seinem letzten Lauf mit Produkten (`zustand.knaller.worteLauf`) gemerkt wurde – nicht während eines Neuversuchs und nicht bei
kaufDA-Ruhe. Die Produkte sind wie die `merkworte` immer Stichwortseiten (vor den übrigen Begriffen, auch für marktguru); ein
Treffer zählt in **allen** Angeboten der Döbelner Prospekte, auch ohne Vergleichspreis/Rabatt (aus einem anderen Prospekt nur mit
marktguru-Bestätigung). Regel `wortPasst` (gleich auf der Seite, Test): alle Teile des Produkts im Titel/Info (Umlaute, Zeichen,
Leerzeichen egal), aber an Wortgrenzen (Prüfer 22.11.2026: vorher traf „Eis“ „Rundreise“, „Gusseiserner“, „teilweise“, „Cola“
„Chocolate“, „Tee“ „Beste Ernte“): ganzes Wort, auch mit Endung (Weine, Eier) oder über Leerzeichen („Jerry's“ = „Jerrys“),
Wort-Ende = Grundwort (Stiel|eis, Likör|wein, Kartoffel|chips), Wort-Anfang nur mit Form-Teil (Eis|creme, Eis|riegel,
Cola|kasten) oder ab 5 Buchstaben (Chips|frisch), mitten im Wort erst ab 6 Buchstaben; Wörter, die nur so enden (Aktions|preis,
Milch|reis, Rund|reise, Wild|schwein), zählen nicht. Mit Sorte: eine der Sorten (Komma, „oder“, „/“) steht drin -> `sorte: 'ja'`, das Angebot nennt nur „versch.
Sorten“/„sortiert“ -> `'pruefen'` (Push: „Sorte im Markt prüfen“), andere Sorte -> kein Treffer. Ergebnis: `knaller.json`
`merkTreffer` (höchstens `maxMerkTreffer` 40, die nächsten zuerst, `wort`, `sorte`, `fern` = Markt ohne Filiale in der Nähe; noch
gültige Treffer der letzten Datei bleiben wie der Pool), `merkWorte` und `status.knaller.kurz.merk` (die nächsten 6 Treffer und
Haken für die Start-Kachel); Knaller-Angebote tragen `merkwort`. **Push:** nur zwischen `erinnerungStunde` und
`erinnerungBisStunde` (7–12 Uhr Berlin), je Angebot genau einmal, am Start-Tag („Heute ab: Lorenz Crunchips“ / „bis Sa 28.11.,
Aldi Nord, 0,99 € statt 1,99 € (−50 %)“; mehrere: je Zeile „• Heute ab: …, bis …, Markt, Preis“); ging der Start-Tag durch
(Radar aus, Angebot erst später gefunden), am nächsten Morgen „Seit Mo 23.11.: …“, solange es gilt. Kein Push für Wort-Treffer,
die schon vor dem Merken begannen (genaue Uhrzeit, nicht nur der Tag: Angebot ab Mo 00:00, Produkt Mo 13:00 gemerkt -> kein Push;
es stand beim Merken auf der Seite unter „Heute“), für Produkte, die nicht mehr gemerkt sind (× auf der Seite: `merkRadar` vom
letzten Knaller-Lauf zählt nur, solange das Wort in `merkWorte` bzw. den `merkworte` der config steht und das Angebot nach der
Regel passt) und für ferne Märkte. Der Vermerk „erinnert“ bleibt, solange das Angebot noch gemerkt/gefunden ist und gilt (vorher
nach 30 Tagen weg: Dauer-Angebote wie ein Puzzle 19.10.–24.12. kamen dann ein zweites Mal). Tests: `scan/test/merkliste.test.mjs`.

Einträge in `aktuell.json` haben seit 16.11.2026 optional `bild` (https-Link: mydealz-RSS, marktguru aus den Schnäppchen-Daten).
mydealz-Box-Tipps in `filme.json` bekommen `vorher`/`ersparnis`, wenn der Deal-Text („statt …“, UVP) oder die Deal-Seite
(`nextBestPrice`, gemeinsames Budget der Deal-Seiten) einen Vergleichspreis nennt.

## Datenformat (`vorteile/data/aktuell.json`)

```text
{ version: 1, aktualisiert: ISO, ort, namen: { <bereich>: Anzeigename },
  sofort: [id …],                       // Sofort-würdige Einträge, nach wert sortiert
  kategorien: { deals: [Eintrag …], erleben, reisen, musik, nebenverdienst, tests, praemien, filme, remix, auftritte, unterricht },
  status: { <bereich>: { ok, anzahl, fehler: [Text …], ms, stand, uebersprungen?, hinweise?: [Text …], neuversuch?: ISO } } }
```

| Feld (Eintrag) | Typ | Bedeutung |
|---|---|---|
| `id` | Text | stabil je Bereich + Link + Titel |
| `kategorie` | Text | `deals`, `erleben`, `reisen`, `musik`, `nebenverdienst`, `tests`, `filme`, `remix`, `auftritte`, `unterricht` |
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
| `extra` | Objekt (optional) | je Bereich: Deals `{ schritte, pro100, ersparnis (0–1), shop, produkt, angebotTitel, packung, normalQuelle }`; Preisfehler `{ shop, versand, temperatur, geprueft }`; Musik-Geräte `{ geraet, preis, tiefst }`; Nebenverdienst `{ art }`; **Remix/Auftritte/Unterricht** (Vertrag 08.11.2026) `{ ort, km (ab Döbeln, null = unbekannt/online), frist (ISO \| null), bewerbung: { art: 'formular'\|'mail'\|'seite', ziel }, quelle, typ, online, bewerbenAls: { name, warum }, sortWert, fundort?, saison?, saisonOffen?, linkOk? }` – Remix zusätzlich `{ art: 'remix', stems, passt, genreTreffer, eingereicht? }`, Gig `{ termin }`, Unterricht `{ arbeitgeber, refnr, seit }`, Gesuch (`typ: 'gesuch'`) `{ gesuch: true, was ('nachhilfe'\|'korrektur'\|'uebersetzung'\|'konversation'\|'pruefung'\|'behoerde'\|'bewerbung'), auszug }`; `linkPruefen: true` = Fundort-Adresse nicht durch einen Abruf belegt (Zeile „Link prüfen“). `fundort: true` = feste Adresse ohne Datum (läuft nie ab, steht unter den frischen Funden) |

`zustand.json` (nur für den Radar): `lauf` (letzter erfolgreicher Lauf je Bereich), `neuversuch` (nach Quellen-Fehler, siehe Technik), `hostRuhe` (Retry-After je Host), `gemeldet`, `sofortTage`, `digestTag`, `musik` (Preisverlauf Geräte),
`dealSeiten` (geprüfte Deal-Seiten, 7 Tage).

## Ausflüge & Aktionen (Modul `events`, seit 16.11.2026)

Recherchierte Liste `ausfluege.json` (jeder Eintrag mit Quelle + Prüfdatum; `termine` = feste Daten, `muster` = Regel
für jedes Jahr: `wochentag` (n-ter Wochentag im Monat), `sonntagBis`, `ostern` (+Tage), `advent` (n-ter Advent), `datum`;
`dauerhaft` = immer) plus Google-News-Suchen je Art (`config.module.events.nachrichten`: fest, gratis, mitmachen,
testen). Fest/Gratis/Mitmachen nur mit Ort bis `maxKm` (60 km Luftlinie ab Döbeln), Testen nur mit Test-Wort +
Technik-Thema; Gebühr/Abo/Vorkasse = „Vorsicht“. Vergangenes und Doppel raus (auch Meldungen zu Listen-Einträgen über
`stichwoerter`). Ausgabe `<data>/events.json` (termine, regelmaessig) für den Reiter „Ausflüge“; Push nur für
Gratis-Tag morgen bis `pushKm` und neuen seriösen Produkttest Musiktechnik. Tests: `scan/test/events.test.mjs`.

## Regel-Wache: Nutzungsbedingungen und robots.txt (seit 16.11.2026)

Xanders Regel: nur Quellen, deren AGB/robots.txt das automatische Lesen erlauben; keine Sperren umgehen, keine nachgeahmten
App-Clients. `scan/lib/robots.mjs` → `macheRegelWache` liegt in `main.mjs` um **jeden** Abruf eines Moduls:

1. `abruf.agbVerbot` (Host + Grund): verboten → gar kein Abruf, auch nicht die robots.txt (Freelancer.com, Reddit).
2. robots.txt des Hosts vor dem ersten Abruf (je Host einmal je Lauf, gemerkt höchstens 24 Stunden in `zustand.robots`
   wie RFC 9309 2.4 es verlangt; alle Regeln, keine Kürzung – mehr als 5000 = „nicht prüfbar“, Quelle nicht gelesen; eigene
   Gruppe „meinvorteil-radar“ (erster Teil des User-Agents, bis MV6 „vorteils-radar“) vor „*“, längste Regel gewinnt). Pfad verboten → Quelle übersprungen, **Hinweis** im Status
   („robots.txt von host: nicht gelesen – robots.txt: Disallow: /pfad“), keine Störung. Nicht lesbar (5xx/429/keine
   Antwort) → dieses Mal nicht gelesen, wie ein Ausfall (alter Stand bleibt). Keine robots.txt (4xx) = erlaubt.
3. `abruf.robotsAusnahmen` nur für eigene Dienste (ntfy-Thema der Seite). `abruf.robotsPruefen: false` schaltet nur Schritt 2 ab.
4. **Programm-Schnittstellen** (seit MV7, siehe unten): genau fünf API-Pfade werden trotz robots-Sperre gelesen – gedrosselt
   und gemerkt nach den Regeln des Dienstes. Schritt 1 gilt ohne Ausnahme, alle anderen Pfade bleiben unter Schritt 2.

**Ergebnis des ersten echten Laufs mit der Wache** (Roh-Lauf 43868228532 auf Zweig mv6, 16.11.2026, 20 Hosts, alle
robots.txt im Mitschnitt): gesperrt sind `overpass-api.de` („Disallow: /api/“ → Filialen und Essen werden nicht mehr
aufgefrischt, der letzte Stand bleibt), `news.google.com` („Disallow: /“, nur Start-/Themen-Seiten erlaubt → alle
News-Suchen in Erleben, Tests, Remix, Auftritte, Unterricht, Ausflüge), `itunes.apple.com` („/*/rss/*“, „/search*“ →
Filme-Charts und -Suche; Lookup bleibt erlaubt) und `remotive.com` („/api/*“, „/*search=“ → Unterricht); im Lauf
43869290803 auf main zusätzlich `query.wikidata.org` („Disallow: /sparql“ → Filme). Erlaubt u. a.: kaufDA, marktguru-API
(„Allow: /api/“), mydealz, tv.apple.com, Audius, service.bund.de, hnrss.

### Ausnahme für Programm-Schnittstellen (MV7, Xanders Entscheidung vom 16.11.2026)

Xander: „mach das, was für die Seite am besten ist“. robots.txt richtet sich an Crawler, die Webseiten einsammeln; die fünf
Dienste oben bieten daneben eine Schnittstelle an, die ausdrücklich für Abrufe durch Programme gebaut ist (API, RSS-Feed,
SPARQL-Endpunkt) – ihre robots.txt sperrt diese Pfade trotzdem pauschal. Darum gilt **nur für genau diese Pfade** eine
Ausnahme. Die Liste steht absichtlich **nur im Code** (`scan/lib/schnittstellen.mjs`, eingefroren, nicht in `config.json`):

| Dienst | Host | Pfad (genau) | Abstand | höchstens je Lauf | gemerkt | Regeln des Dienstes / unsere Häufigkeit |
| --- | --- | --- | --- | --- | --- | --- |
| OpenStreetMap (Overpass) | `overpass-api.de` | `/api/interpreter` | 10 s | 3 | – | unter 10 000 Abfragen und 1 GB am Tag, eine Abfrage zur Zeit; Filialen 1×/Woche, Essen-Lokale alle 20 h. Ausweich-Server (`overpass.private.coffee`) nur, wenn dessen eigene robots.txt es erlaubt (dort keine robots.txt = erlaubt; keine Ausnahme) |
| Google News (RSS) | `news.google.com` | `/rss/search` | 3 s | 60 | 6 h | RSS-Suchfeed für Feed-Leser: selten, jede Suche höchstens alle 6 Stunden (dazwischen die gemerkte Antwort) |
| Apple iTunes | `itunes.apple.com` | `/search` und `/<land>/rss/topmovies…/json`, `/<land>/rss/toptvseasons…/json` | 3,2 s | 60 | – | Search API etwa 20 Abrufe pro Minute; Filme-Bereich ohnehin höchstens 45 Apple-Abrufe je Lauf |
| Wikidata (SPARQL) | `query.wikidata.org` | `/sparql` | 2 s | 20 | 24 h | eigener User-Agent, eine Abfrage zur Zeit, höchstens 60 s Rechenzeit pro Minute |
| Remotive (API) | `remotive.com` | `/api/remote-jobs` | 30 s | 2 | – | laut API-Doku nur wenige Abrufe am Tag, Treffer verlinken auf Remotive und nennen Remotive als Quelle; Bereich Unterricht holt höchstens alle 6 h (`remotive.intervallStunden`) |

So funktioniert es (`macheRegelWache`): Nutzungsbedingungen zuerst (Reddit, Freelancer.com: **nie**, auch nicht über eine
Ausnahme – `NIE` in `schnittstellen.mjs`, die Liste darf diese Hosts nicht enthalten). Dann wird die robots.txt trotzdem
gelesen (für die Anzeige und die Regel im Status), sperrt aber nur alles **außer** dem genauen Pfad: z. B.
`news.google.com/rss/topics/…`, `itunes.apple.com/de/lookup?…`, `overpass-api.de/api/status` oder `remotive.com/jobs/…`
bleiben gesperrt; Unterdomains (`z.overpass-api.de`), `http:`, ein anderer Port (`:8443`) und ein Punkt am Host-Ende
(`overpass-api.de.`) zählen nicht. Für die Ausnahme gilt: Abstand je Host
(`macheAbruf`, der größere von `abruf.pauseMsJeHost` und Schnittstelle), harte Obergrenze je Lauf (darüber: Fehler „Rest im
nächsten Lauf“, kein weiterer Abruf), dieselbe Adresse nie zweimal im Lauf und – nur in echten Läufen, nicht im Roh-Lauf und
nicht in Tests – die gemerkte Antwort aus `zustand.schnittstellen.cache` (gzip, höchstens 600 KB, Abgelaufenes fliegt jeden
Lauf). `zustand.schnittstellen.lauf` zeigt je Host Abrufe, gemerkte Antworten und die robots-Regel des letzten Laufs.
Nachbesserung nach der Prüfung MV7: die eine Wiederholung nach 429/5xx zählt mit gegen die Obergrenze (Overpass also
höchstens 3 Anfragen je Lauf, nicht 6); bei 429/503 wartet sie mindestens so lange, wie der Dienst per `Retry-After`
verlangt – verlangt er mehr als 60 s (`abruf.retryAfterMaxMs`), gibt es in diesem Lauf keine Wiederholung. Ein Punkt am
Ende des Hostnamens (`www.reddit.com.`) umgeht die Nutzungsbedingungs-Sperre nicht.

**User-Agent** (`abruf.userAgent`): „MeinVorteil-Radar/1.0 (privates Spar- und Freizeit-Radar; wenige Abrufe mit Pausen
und Cache)“ – ehrlich, ohne Personennamen, ohne E-Mail und ohne persönliche Adresse. Wikidata bittet um Kontaktangaben im
User-Agent; wir lassen sie bewusst weg. Antwortet Wikidata deshalb einmal mit 403, ist das eine Störung im Status (alter
Stand bleibt) – dann eine neutrale Projekt-Adresse ergänzen, keine persönliche.

**Roh-Lauf 43887290010** (Zweig mv7, 16.11.2026, roh+alle+still): 166 Abrufe bei 20 Hosts, 0 Reddit/Freelancer, alle 16
Bereiche ok. Google News 47 Suchen (213 Meldungen), Apple 25 über die Ausnahme (+ Lookups), Wikidata 5, Remotive 1,
Overpass 2 (einmal „at capacity“ 502, Wiederholung jetzt frühestens nach dem Host-Abstand von 10 s statt 3 s). Filialen
1468 → 1743 (EDEKA 275 erstmals dabei), Essen-OSM-Stand 09:28 → 14:40 Uhr, Filme-Charts 0 → 673 (Serien 0 → 322, Filme
für 3,99 € 31 → 62), Tests 0 → 3, Remix 11 → 16, Auftritte 7 → 8; Erleben und Musik 0 wie schon vor der Sperre.

**Quellen-Liste der Seite**: `status.<bereich>.quellen = [{ host, name?, art }]` – je Quelle kurz „Schnittstelle“
(über die Ausnahme gelesen) bzw. „gesperrt (Regeln)“ (robots.txt/Nutzungsbedingungen); ein Host, der als Schnittstelle
gelesen wurde, steht nicht zusätzlich als gesperrt da. Module, die eine gesperrte Quelle selbst auslassen (Nebenverdienst:
Freelancer.com), melden sie in `regelSperren`. Tests: `scan/test/schnittstellen.test.mjs` (genaue Pfade, andere
gesperrte Pfade bleiben gesperrt, Reddit/Freelancer nie, Obergrenze, Lauf-Memo, Cache 6 h/24 h, Abstände, User-Agent,
ganzer Lauf und `main()` mit zwei Läufen).

Fundort-Links, die die robots.txt sperrt, heißen „nicht geprüft“ (nicht „Link gerade nicht erreichbar“). Gemerkte
Forenbeiträge (`zustand.gesuche`) von Hosts mit Verbot werden verworfen und gelöscht, ebenso Gesuche von dort aus dem
letzten Stand (Prüfung Runde 6: zwei Reddit-Beiträge vom 09./15.11. wären sonst bis Anfang Dezember stehen geblieben). Tests:
`scan/test/regeln.test.mjs` (u. a. ganzer Lauf: Reddit/Freelancer.com nie abgerufen, jeder Host erst nach seiner robots.txt).
