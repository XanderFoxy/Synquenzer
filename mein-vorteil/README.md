# Mein Vorteil

**Dein Assistent auf einer Seite:** Deals, Preisfehler, Filme, Auftritte (mit Bewerbung), Remix-Contests, Deutschunterricht, Konzerte, Gewinnspiele, Krypto, Spartricks, Essen.
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
**Start · Deals · Woche · Essen · Preisfehler · Filme · Auftritte · Remix · Unterricht · Nebenverdienst · Ausflüge · Konzerte · Gewinnspiele · Krypto · Spartricks · Mehr**
(„Start“ bleibt links stehen, der Rest ist seitlich wischbar). Darunter „Du bist in: …“ mit einer kurzen Zeile.
Es ist immer nur **ein** Bereich zu sehen (kein ewiges Scrollen); je Bereich eine Top-Liste + „weitere zeigen“.
Sprungmarken: `#start`, `#deals` (`#produkte`, `#cashback`, `#snacks` = Ziel im Bereich Deals), `#preisfehler`, `#filme`,
`#auftritte`, `#remix`, `#unterricht`, `#nebenverdienst`, `#konzerte`, `#gewinnspiele`, `#krypto`, `#spartricks`, `#mehr`. Alte Marken: `#angebote` →
`#produkte`, `#vorteile` → `#start`, `#konzerte` bleibt.

| Bereich | Inhalt | Nie leer, weil … |
|---|---|---|
| **Start „Heute für dich“** | „Heute wichtig“ (höchstens 4 Zeilen) + je Bereich eine Kachel mit 1–3 besten Treffern; Tippen öffnet den Bereich | jede Kachel nennt den nächstbesten Treffer bzw. den Grund |
| **Deals** | Meine Produkte (Jetzt/Bald/Weitere, kaufDA-Region mit „in Döbeln prüfen“), Musik-Technik, Cashback, andere Snacks | ohne Angebot steht die Liste „zuletzt gesehen 0,99 € (225 g) bei Penny, Okt. 2026“ offen; beginnen alle Angebote erst später (Sonntag), nennt die Start-Kachel sie („ab morgen · 0,66 € bei Netto“, „11 Angebote starten bald“) statt „gerade kein Angebot“ |
| **Preisfehler** | nur krasse (Regel unverändert) | sonst: wo sie zuerst auftauchen (mydealz-Gruppe Preisfehler, heiße Deals) |
| **Filme** | Reiter aus `filme.js` (faul geladen): Wunschliste · Für 3,99 € · Action & Thriller · Comedy · 80er & Kult · Neu · Serien · Disney, mit Apple-TV-Angebotsräumen („Filme für 3,99 €“) | Start-Kachel: Push-Treffer aus `aktuell.json` → `filme`, dann die Übersicht `status.filme.kurz` (Zahl echter Angebote + beste Titel, höchstens 2 Zeilen) |
| **Auftritte** | frische Ausschreibungen (nah + bald zuerst) mit **Bewerben**, darunter feste Adressen (Döbeln, Leipzig, Dresden, Chemnitz, deutschlandweit) | feste Adressen immer (gigmit nur noch die Startseite, Zeile „Link prüfen“); ältere Daten: dieselben Adressen aus der Seite (`FUNDORTE`, Test gegen `vorteile/config.json`) |
| **Remix** | laufende Contests (was zuerst endet, oben) mit **Mitmachen** (Frist, Stems, Text) | Fundorte mit laufenden Contests weltweit |
| **Unterricht** | oben **Gesuche im Netz** (neueste zuerst, mit Auszug; Reddit und Freelancer.com seit 16.11.2026 nur als fertige Suche – robots.txt/AGB), darunter Stellen (Döbeln + online zuerst) – alles mit **Melden** als „Deutsch mit Xander“ | Jobbörse-Live-Suche, italki, Preply, Lingoda, BAMF; Gesuche: Upwork, Fiverr, Kleinanzeigen, Freelancer, Reddit |
| **Nebenverdienst** (seit 16.11.2026) | Gesuche ohne Arbeitsamt aus der Radar-Kategorie `auftraege`, drei Felder: Unterricht geben (Klavier, Keyboard, Gitarre, Synthese & Sounddesign), KI & Apps, Bild & Video; je Karte passt/Aufwand/allein machbar, Ort + km ab Döbeln oder online, Vergütung falls genannt, Warnung bei Betrugsmustern, **Antworten**-Vorlage; Kachel heißt „Aufträge“ | 21 fertige Suchen (Kleinanzeigen-Gesuche um Döbeln, Upwork, Fiverr, Freelancer, Reddit, freelancermap, service.bund.de) stehen immer da |
| **Konzerte** | in der Nähe (bis `pushRadiusKm`), darunter **je Band der nächste Termin, auch weit weg, mit km**; Tourdaten-Links je Band (`../konzerte/artists.json`, erst beim Öffnen) | nächster Termin bzw. Tourdaten-Links |
| **Gewinnspiele** | nur laufende ohne Kauf/Abo | sonst mydealz-Gruppen Gewinnspiele/Gratis |
| **Krypto** | wie bisher (nur `localStorage`); Push-Kasten mit Feld „ntfy-Thema“ (nur auf dem Gerät) | Kurs immer |
| **Ausflüge** | eigener Reiter (`ausfluege.js`, Daten `events.json` vom Radar-Modul `events`): **Termine** (Filter Art Fest/Gratis/Mitmachen/Testen · bis 30/60 km/egal · Diese Woche/Wochenende/Monat/Alle) und **Regelmäßig** (jedes Jahr / immer, zum Planen); jede Karte mit Datum, Ort, km ab Döbeln, ≈ Fahrzeit, Vorteil, Quelle + Stand; Tests mit „seriös“/„Vorsicht“ | Start-Kachel aus `status.events.kurz` (nächste Feste/Gratis-Tage bis 60 km); ohne Radar-Datei liest der Reiter die Liste `../vorteile/ausfluege.json` |
| **Essen** | eigener Reiter (`essen.js`, Daten `essen.json`): Heute · Lokale · Regelmäßig · Fastfood & Ketten · Pizza & Abholen · All-you-can-eat · XXL & Challenges · Gratis-Tage (+ „Aktuell“, sobald der Radar Einträge der Kategorie `essen` liefert) | Start-Kachel: bester belegter Treffer des Tages (Aktionstag heute, Wochentags-Aktion, nächster Aktionstag ≤ 14 Tage, dauerhaft gratis), sobald der Reiter einmal offen war; vorher „Gratis-Tage, Aktionen, Buffets“ |
| **Spartricks** | eigener Reiter (`spartricks.js`, Daten `spartricks.json`): Top 10 · Geld zurück · Clever einkaufen · Gratis & Proben · Geburtstag gratis · Freizeit & Reisen · Gewinnspiele, Suche, Stern | Start-Kachel: „Tipp des Tages“ (wechselt täglich) + nächste Frist, sobald der Reiter einmal offen war; vorher „Geld zurück, Gratis, Geburtstag“ |
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
„übernommen“. Nichts davon geht ans Netz (Test: keine Anfrage enthält die Zahlen).

**Push bei geschlossener Seite (Krypto):** Der Wecker läuft auf einem privaten Server (stündlich, mit Xanders Werten)
und schreibt in sein privates ntfy-Thema – den Namen bekommt er im Chat. Die Seite hat dafür nur noch das Feld
„ntfy-Thema“ (`localStorage` `mein-vorteil-krypto-thema`, nie im Repo), das den Link „In ntfy öffnen“
(`https://ntfy.sh/<thema>`) füllt; ein eingefügter ntfy-Link wird auf den Namen gekürzt. Per Link geht es auch:
`…/mein-vorteil/#ntfy=<thema>` – das Skript im `<head>` nimmt das Fragment sofort aus der Adresse, merkt das Thema nur
auf dem Gerät, öffnet Krypto mit dem Push-Kasten und zeigt „übernommen“. Die alte Anleitung mit GitHub-Secrets ist weg.

**Auf Amazon ansehen (Deals):** Unter jedem Markt-Angebot (Meine Produkte, Deals zu deinen Produkten im Laden, andere
Snacks) steht dezent „Auf Amazon ansehen“ – eine fertige Suche `https://www.amazon.de/s?k=<Produktname>` ohne Mengen
(„200 g“, „6x“, „24er-Pack“), Preise, Shopnamen und Klammern, ohne Partner-Tag. Ist das Angebot schon bei Amazon, fehlt
der Link. Einen Amazon-Preis zeigt die Seite nur, wenn ein laufendes Amazon-Angebot schon in den Daten steht (mydealz/
Keepa im Schnäppchen-Wecker): „Amazon: 10,48 € (24 × 25 g) · 0,44 € pro Stück – Markt günstiger“ (je Einheit, sonst nur
bei gleicher Packung). Amazon selbst wird nie abgefragt (Bedingungen verbieten das Auslesen, siehe
`schnaeppchen/PREISQUELLEN-BEFUND.md`; aus dieser Umgebung ist amazon.de ohnehin gesperrt). Regel:
`vorteile/scan/lib/amazon.mjs`, Wort für Wort auch in der Seite (`test/regeln.test.mjs`).

**Weitere Reiter:** `<a href="#name" data-reiter="name">Name<span class="n"></span></a>` in die Leiste,
`<section id="p-name" class="reiter-seite breite" hidden>` nach `</main>`, `REITER_START.name = el => …` (läuft beim
ersten Öffnen), optional `REITER_NEU.name` (↻ und Rückkehr zur Seite nach > 5 min, für jeden schon geöffneten Reiter).
Antippen blendet die Bereiche aus (main hidden) und springt unter die Leiste; jeder Bereichs-Link führt zurück.

**Reiter „Filme“ (Film-Radar, `filme.js`):** letzter Link der Leiste, `#filme` öffnet ihn direkt. Skript, CSS (`.fi-…`) und
Daten (`vorteile-daten/vorteile/data/filme.json`) kommen erst beim ersten Öffnen; vorher lädt die Seite nichts davon.
Chips Wunschliste · Für 3,99 € · Action & Thriller · Comedy · 80er & Kult · Neu · Serien · Disney („Angebote“ nur, wenn dort
etwas steht, das in keinem anderen Bereich vorkommt), Tiefstpreis, „dein Ziel“, letzter Stand offline (ein Stand vom Scanner vor
dem 14.11.2026, 23:39 – ohne Horror-/Qualitätsfilter – wird nicht aus dem Gerätespeicher gezeigt). Reihenfolge in den drei
Angebots-Chips: deine Listen, Top-Filme (≥ 55 Wikipedia-Sprachen oder Rotten Tomatoes ≥ 80 % und ≥ 30 Sprachen), Kinderfilme, Rest.
Die Infozeile bleibt einzeilig (bei schmalen Handys kürzt sich das Genre), ein mydealz-Tipp zu einem Film, der schon als
Apple-Karte dasteht, fällt weg.
Film-Einträge aus `aktuell.json` (Kategorie `filme`, für die Pushes) stehen nur dort, nicht noch einmal unter „Mehr“.
Der Service Worker hält `filme.js` wie die Seite (erst Netz, nach 3 s die letzte gute Kopie). Tests: `test/filme.test.mjs`.

**Reiter „Essen“ (seit 15.11.2026, `essen.js` + `essen.json`):** Xanders Wunsch vom 15.11. („kostenlos essen, besondere Tage,
Gutscheine, Aktionen bei McDonald's oder Subway, Abholpizza zum halben Preis, XXL-Restaurants, wann All-you-can-eat ist“). Daten aus zwei
Recherchen (Ketten bundesweit, Lokale bis ca. 60 km um Döbeln; 55 Einträge, nach der Fakten-Prüfung vom 15.11. korrigiert). Jeder Eintrag: `quellen` (nur https), `geprueft`, `sicher`
(`ja` = offiziell oder mehrere datierte Quellen; `pruefen` = Portal/Stadtmagazin/Bewertung → Marke „bitte vor Ort prüfen“; alle Lokale),
Zeiten und Preise wörtlich wie in der Quelle (`wann`, `preis`, `zeit.text`), bei Lokalen `km` (Luftlinie ab Döbeln Obermarkt), Adresse und
Stand der Quelle. `gratis: true` nur ohne Kauf/Abo (derzeit nur das IKEA-Family-Heißgetränk); sonst Marken „nur mit App“/„Abholung“.
Regeln der Seite (Berliner Zeit): `bis` vorbei → weg; Aktionstag ohne `bis` nie aktuell; `ab` in der Zukunft → „Als Nächstes“;
`wochentage` (1 = Mo … 7 = So) zählen nur an dem Tag, mit `zeit` „läuft“ (nur mit `von` und `bis`, nicht in `zeit.pause`) / „heute ab …“ /
„heute bis …“ / „heute vorbei · nächster: …“ (neu gezeichnet zum nächsten Wechsel und um Mitternacht, die Start-Kachel ebenso);
`nurHinweis` (z. B. Domino's und Freddy Fresh Abhol-Pizza, einzelne Brunch-Termine, Sommer-Aktionen) nur unter „Kommt immer wieder“, nie
mit `wochentage`/`zeit`; „Gratis-Tage“: erst „Ohne Kauf gratis“, dann „Tage mit Sonderpreis (beim Kauf)“; „gratis“ im Titel nur bei `gratis: true`;
`geprueft` älter als 45 Tage → „Stand … – bitte prüfen“ und nicht auf der Kachel. „Heute“: Aktionen des Tages, „Als Nächstes“ (Aktionstage
≤ 35 Tage, „Morgen“), „Die Woche“ (feste Tage), „Täglich“ (aufklappbar), Döbeln-Hinweis. Geburtstag und Gratis-Proben stehen nicht doppelt
hier: „Geburtstag gratis ›“/„Gratis & Proben ›“ und „Ausführlich in Spartricks ›“ öffnen Spartricks im passenden Chip
(`MeinVorteilSpartricks.zeige(chip, id)`). Start-Kachel nur aus dem kleinen Auszug `mein-vorteil-essen-kachel` (nur `sicher: 'ja'`; höchstens ein „ab …“-Aktionstag, dann was ohne Kauf gratis ist);
letzter Stand im Cache Storage `mv-essen`. Der Service Worker (Cache `mein-vorteil-3`) hält `essen.js` wie die Seite, `essen.json` nicht.
Radar: noch kein eigenes Modul (die mydealz-Gruppen `restaurant`/`lieferservice` sind von hier aus nicht als RSS belegt) – die Seite
zeigt Einträge der Kategorie `essen` aber schon unter „Aktuell“. Tests: `test/essen.test.mjs`.

**Lokale und Regelmäßig (seit 16.11.2026):** Xanders Wunsch vom 16.11. („die besten Italiener, Griechen, Inder, Türken … nach
Bewertung und was die Leute sagen, in der Nähe von Döbeln; wann All-you-can-eat; Domino's in der Nähe?; wiederkehrende Muster
zum Planen“). Chip **Lokale**: Filter Küche, Umkreis (5/15/30/70 km), Bewertung ab 4,0/4,5, Heute offen, All-you-can-eat und
XXL (dann bis 70 km), Gemerkt; Beste zuerst (wenige Stimmen zur Mitte gezogen) oder Nächste zuerst. Karte: Küche, Ort · km,
heute offen/Ruhetag (OSM-Öffnungszeiten), Bewertungen mit Portal/Stimmen/Stand, „Leute sagen“, Karte (OpenStreetMap) und Apple
Karten, Merken-Stern (`mein-vorteil-essen-gemerkt`; die ids gehen als `{ v: 1, essen: [...] }` an das ntfy-Thema
`…-merken` = `vorteile/config.json` `module.essen.merkThema`, beim Öffnen erneut, wenn älter als 6 h – der Radar erinnert am
All-you-can-eat- oder Aktionstag), „Ketten in der Nähe“ (nächste Filiale laut OSM – fehlt dort der Ort, kein Ort aus der
gepflegten Liste; Lieferung nach Döbeln, Aktionen mit Sprung in den passenden Chip). Lokale aus OSM: alle bis 30 km (ohne id in
der Datei, die Seite bildet `osm-<typ>-<nr>`); bei „bis 70 km“ sagt die Kopfzeile, dass darüber nur All-you-can-eat/XXL kommen. Daten erst beim Öffnen: Radar-Datei `vorteile-daten/vorteile/data/essen.json`,
sonst die gepflegte Liste `../vorteile/essen.json`; letzter Stand in `mv-essen` (Schlüssel `essen-lokale.json`). Filter in
`mein-vorteil-essen-filter`. Chip **Regelmäßig**: 7 Tage ab heute mit festen Wochentagen aus allen Bereichen (All-you-can-eat,
Tagesessen, Ketten-Aktionen, Subway-Tagesplan, Ruhetage der Lokale bis 15 km – in OSM nicht genannte Tage sind zu), „Fast täglich“ einmal darunter.

**Reiter „Spartricks“ (seit 15.11.2026, `spartricks.js` + `spartricks.json`):** komprimiertes Wissen aus drei Recherchen
(Geld zurück, Einkaufen & Gratis, Geburtstag & Freizeit; 133 Einträge → 94 Tipps: Doppelte vereint, Prämien-Themen Strom/Bank/Konto
nach Xanders Regel vom 07.11. raus, Unsicheres ohne Mehrwert raus). Chips **Top 10 · Geld zurück · Clever einkaufen · Gratis & Proben ·
Geburtstag gratis · Freizeit & Reisen · Gewinnspiele** (dazu „Gemerkt“, sobald ein Stern gesetzt ist). Jede Karte: Titel, „Bringt“,
„So geht’s“, Quellen als Links (`rel="noopener noreferrer"`; heißen zwei Knöpfe gleich, steht das Thema dabei), Stand, „Erfahrung aus
der Community“ wo nicht amtlich bzw. vom Anbieter belegt (reine Deal-Portale = Community), „Anleitung“ bei Plan-Tipps, Region
(Döbeln/Leipzig/Dresden/Chemnitz/Sachsen = wo es ist; bundesweit nur unter „Geburtstag gratis“ ausgeschrieben), Frist mit „noch N Tage“ –
nach der Frist rückt der nächste Top-Tipp nach, ein jährlicher Tipp steht dann am Ende seines Bereichs („Frist für dieses Jahr vorbei“),
ein einmaliger (`einmalig: true`, z. B. Steuer 2022) verschwindet. `aktionBis`: befristete Aktion im Tipp („Aktion bis …“, danach
„Aktion vorbei? Beim Anbieter prüfen“). Top 10: Fristen zuerst, dann nach Geld. „Geburtstag gratis“: Feld „Dein nächster Geburtstag“
(nur `localStorage`, ohne Jahr gemerkt) → an jeder Karte „Am besten anmelden bis TT.MM. (Faustregel N Wochen vorher)“ bzw.
„Ohne Anmeldung“ – der Vorlauf ist eine Faustregel, keine Frist des Anbieters.
Suchfeld oben: alle Wörter müssen passen, Umlaute egal (Döbeln = Doebeln = Dobeln), Zahl je Chip zeigt die Treffer.
Laden (lazy): Skript, CSS (`.sp-…`) und Daten erst beim Öffnen des Reiters – die Startseite holt `spartricks.json` nie selbst.
Letzter Stand im Cache Storage `mv-spartricks` (nicht im localStorage, den sich die Seite mit dem Synquenzer teilt; sofort gezeigt,
dann frisch mit `cache: no-cache`). Die Start-Kachel liest nur einen Auszug (`mein-vorteil-spartricks-kachel`, wenige KB): vor dem
ersten Öffnen steht dort „Geld zurück, Gratis, Geburtstag“, danach „Tipp des Tages“ + nächste Frist. Der alte Stand
`mein-vorteil-daten-spartricks` (ganze Datei, ~107 000 Zeichen) wird einmal übernommen und gelöscht. Chip, Sterne, Geburtstag:
`mein-vorteil-spartricks-chip`, `-spartricks-gemerkt`, `-spartricks-geburtstag`. Neue Daten-Fassung (> 1) oder kaputte Datei: der Reiter
sagt „Seite neu laden“ statt „nicht erreichbar“.
Kein Tracking, keine fremden Skripte. **Pflege:** `spartricks.json` ist die Quelle und wird direkt bearbeitet (die einmalige
Zusammenführung der Recherchen liegt nicht im Repo); `version` gleich lassen (Seite liest bis Fassung 1), `stand` setzen. Die Tests
zählen nicht fest, sondern prüfen Regeln: Pflichtfelder, Quellen (kein Umfrage-/Provisionsportal, keine fremde Länderseite,
„belegt“ nie nur mit Deal-Portalen), Top 10 mit Fristen zuerst, Geburtstag ohne Nicht-Angebote.
Tests: `test/spartricks.test.mjs` (Schema, tolerantes Lesen, Chips, Suche, Stern, Geburtstag, Frist, Kachel, 428 × 926 und 926 × 428).

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
  `raw.githubusercontent.com` gehen nie durch den Worker. Cache-Stufe `mein-vorteil-10` (16.11.2026, MV7).
- „Quellen & Hinweise (Vorteile)“ (unter „Mehr“): je Bereich Zahl und Stand, darunter klein je Quelle die Regel aus
  `status.<bereich>.quellen` des Radars – „Schnittstelle“ (Programm-Schnittstelle trotz robots.txt, Xanders Entscheidung
  vom 16.11.2026, siehe `vorteile/README.md`) bzw. „gesperrt (Regeln)“ (robots.txt/Nutzungsbedingungen). Ältere Daten
  ohne diese Angabe: Zeile wie bisher.
- Liest ältere Datenformate mit (ohne `packung`/`mengeSicher`/`tiefst`/`bis`): dann ohne Prozent und Packung,
  Tiefstpreis „unklar“.
- Tests: `cd mein-vorteil && npm test` (Node ≥ 20, Playwright mit Chromium; ohne Playwright werden sie übersprungen).
  Fassung 5 in `test/fixtures/v5/` (`npm run fixtures:v5` = `werkzeug/baue-v5.mjs`: echte Scanner-Läufe mit ihren Fixtures). Echte Daten vom 31.10.2026 in `test/fixtures/echt-2026-10-31/` (`v1` = damaliges Produktionsformat,
  `v2` = dieselben Rohdaten durch die neuen Scanner), Sonderfälle in `test/fixtures/vertrag/`
  und `test/fixtures/vertrag-b/` (neu bauen: `npm run fixtures` = `werkzeug/baue-vertrag.mjs`; liegt absichtlich
  nicht unter `test/`, sonst führt `node --test` es aus). Bildschirmfotos: `MV_SHOTS=<ordner> npm test`.

**Reiter „Woche“ (seit 16.11.2026, `woche.js` + `knaller.json` vom Vorteils-Radar):** Xanders Wunsch vom 16.11. („je Markt die
krassesten Angebote der Woche – Aldi, Netto, Marktkauf, Kaufland, Penny, Lidl, Rewe – ab 30 / 40 / 50 %, als Kacheln mit
Produktbild“). Stufen-Wahl `ab 30 % · ab 40 % · ab 50 %` (gemerkt in `mein-vorteil-woche-stufe`) und Markt-Chips (gemerkt in
`mein-vorteil-woche-markt`), Gruppen „ab 50 %“, „40 bis 49 %“, „30 bis 39 %“ und „Ab Montag“. Kachel: Prospekt-Ausschnitt auf
hellem Grund (lazy, feste Maße, ohne Referrer, Fehler -> Platzhalter mit Marktname), Rabatt-Plakette, Preis, „statt“, Titel,
Marken „nur mit App/Karte“, „ab-Preis“, „ab Mo …“, Markt · gültig bis. **Goldring nur bei echtem Streichpreis**; gegen UVP
graue Plakette und „UVP“ hinter dem Vorher-Preis. Rabatt nur mit Vergleichspreis aus dem Prospekt – die Seite rechnet die %
selbst nach. Skript und Daten erst beim ersten Öffnen; letzter Stand im Cache Storage `mv-woche` (offline sofort da).
Start-Kachel „Woche“ und die Zahl in der Leiste kommen aus `status.knaller.kurz` in `aktuell.json` (kein eigener Abruf).
Service Worker: Cache `mein-vorteil-5` hält `woche.js` wie die Seite, `knaller.json` und Bilder nicht.
Nachbesserung nach der Prüfung (16.11.2026): Bildfeld fest quadratisch, das Bild liegt absolut darin (ein Hochformat-Foto wie
eine Flasche sprengt die Kachel nicht mehr, kein Sprung beim Nachladen); Rabatt abgerundet wie beim Radar; Ende um 00:00 des
Folgetags (Penny) zählt zum Vortag („bis Sa“); Vergleichspreis ohne Art-Angabe grau und ohne „UVP“; Start-Kachel nennt „ab …“,
wenn das Top-Angebot erst später gilt. Deals: das Produktbild steht an der Karte nur, wenn das gezeigte Angebot auch dieses
Produkt ist (Karte „Haribo Colorado“ mit Angebot „Haribo Harry Potter“ -> kein fremdes Foto).

**Woche, 2. Runde (Xander 16.11.2026: „gelten die Angebote wirklich für die Woche? … anhaken/merken … Crunchips fehlen“):**
Stufen `ab 20 · 30 · 40 · 50 %` (Start bleibt 30). Was heute gilt, steht normal in den Rabatt-Gruppen; was erst ab Do/Fr/Sa
(oder als Wochenend-Angebot) beginnt, steht in der eigenen Gruppe **„Kommt diese Woche“** – Kachel gestrichelt, Marke „ab Do …“,
„Wochenende“ –, was erst nächste Woche beginnt unter „Ab Montag“. Sprung-Leiste unter den Markt-Chips: „Gilt jetzt n ·
Kommt diese Woche n · Ab Montag n · Gemerkt n“ (nur, wenn es mehr als „Gilt jetzt“ gibt). Start-Kachel: „+ n kommen diese Woche
noch“. Abgelaufenes fällt raus. `vorherArt: 'geschaetzt'` (kein Vergleichspreis im Prospekt, sondern derselbe Artikel im
selben Markt aus einem früheren Prospekt) -> hellgraue Plakette „≈ −n %“ und „statt ~… geschätzt“. **Merken:** Haken oben rechts
an jeder Kachel (44 px) oder lange drücken (550 ms, ohne zu wischen; öffnet dann nicht) -> Gruppe „Gemerkt“ oben, gespeichert in
`mein-vorteil-woche-gemerkt`; die Seite schickt die Liste (id, Titel, Markt, Preise, Gültigkeit – nichts Persönliches) als
einfache Anfrage an das ntfy-Thema `…-merken` (öffentlich wie das Push-Thema), bei jeder Änderung und spätestens alle 6 h; der
Radar erinnert per Push am ersten Gültigkeitstag ab 7 Uhr. Fuß: „Gelesen: Aldi Nord n von 359 …“.

**Produktbilder (seit 16.11.2026):** Angebotskarten der eigenen Produkte zeigen `bild` (marktguru/mydealz, aus `current.json`)
als 64-px-Bild links neben Kopf, Titel und Preis (die Karte wird dadurch nicht höher); „weitere Angebote“ und „Andere Snacks“
ein 40-px-Bild, sobald der Radar `bild` mitliefert. Nur https, nur als Link (wie die Filmbilder), lazy, ohne Referrer.

**Filme (16.11.2026):** „Für 3,99 €“ zeigt nur einzelne Filme bis 3,99 € (mydealz-Sets wandern zu den Boxen).
„Boxen im Angebot“: oben nur Film-/Serien-Boxen, die deutlich reduziert sind (≥ 20 % unter dem üblichen Preis bzw. dem
Vergleichspreis von mydealz); Tipps ohne (oder mit kleinem) Vergleichspreis eingeklappt darunter, ohne Rahmen.
Beides nur mit Daten, die „boxen“ kennen – eine alte Datei bleibt wie vorher.
