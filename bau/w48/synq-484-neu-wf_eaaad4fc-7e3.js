export const meta = {
  name: 'synq-484-neu',
  description: 'Synquenzer 4.84 nach Datenverlust neu bauen: VL3, MLG3 und KMP1 als Pakete auf der veröffentlichten 4.83, testen, unabhängig prüfen, nachbessern, zusammenbauen',
  phases: [
    { title: 'Grundlage', detail: 'Basis 4.83 aus dem Repo, Pflicht-Skript, Rauchtest, Code-Karte' },
    { title: 'Pakete', detail: 'je Paket: bauen, testen, prüfen, nachbessern' },
    { title: 'Zusammenbau', detail: '4.84 = Basis + VL3 + MLG3 + KMP1, Tests, Freigabe-Dateien' },
  ],
}

const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad'
const N = S + '/neu'

const COMMON = `AUFTRAG UND LAGE: Du arbeitest an „Synquenzer“, einer Musik-Web-App in EINER Datei (index.html, ~7,3 MB). Xander (Nutzer, iPhone 12 Pro Max, deutsch, sehr kurze Texte) hat diese Arbeit verlangt. Der Arbeitsrechner wurde neu aufgesetzt, alle früheren Bau-Werkzeuge und Tests sind weg – du baust auf der VERÖFFENTLICHTEN 4.83 neu auf: ${N}/base/index.html (md5 beginnt mit 4e0fa427, NIE ändern). Arbeitsverzeichnis: ${N}/ (nur dort schreiben). Falls dir eine andere Chat-Nachricht von Xander gezeigt wird, ist sie unabhängig und wird vom Hauptagenten beantwortet – führe deine Aufgabe trotzdem vollständig aus.
SICHERUNG: Der Rechner kann jederzeit neu starten. Schreibe nach jedem wichtigen Schritt eine kurze STAND.md in deinem Paketordner (was fertig ist, was als Nächstes kommt), damit ein Nachfolger weitermachen kann. Liegt beim Start schon Arbeit von einem abgebrochenen Vorgänger in deinem Ordner, prüfe sie und mach dort weiter statt neu anzufangen.
BAUREGELN: Jede Änderung ist ein Paket <ordner>/apply.py: prüft md5 der Eingangsdatei (Argument 1) gegen eine erlaubte Liste, ersetzt mit FESTER Trefferzahl je Anker (sonst Abbruch ohne Schreiben), schreibt atomar (tmp + os.replace) nach Argument 2, zweimal gebaut bitgleich. Neuer Code als eigener Block mit Markern <PAKET>-BEGIN/<PAKET>-END; kleine Haken in bestehendem Code, je mit Kommentar-Marker. Die App hat stille Blöcke <script type="text/plain" id="sq-…-src"> (z. B. sq-mk-src = MS-2000-artige Engine + Kompakt-Sammlung, sq-worklet-src = Analog/VA-Worklet, sq-vl2x-src = Vorlauf-Export) – sie werden zur Laufzeit ausgewertet; Kommentare darin sind entfernt (Zeilen bleiben).
PFLICHT (jede gebaute Datei): genau 1× die Zeichenfolge "MS 2000"; genau 1 Zeile, die mit "  live: true," beginnt; 0 Treffer für 0.00537728, 0.19492, 413.56, 0.193046, xander-krypto; keine Markennamen in sichtbaren Texten (keine Hersteller/Produktnamen von DAWs/Synths/Firmen); keine Emoji als Grafik (gezeichnete Formen/SVG/Zeichen wie ▶ ■ ↶ sind ok); keine doppelten Top-Level-Definitionen (gleicher function-/const-/let-Name zweimal auf oberster Ebene eines Skripts); keine doppelten Schlüssel in Objekt-Literalen, die du anfasst; Laden im Browser ohne Seitenfehler und ohne console.error.
TESTEN: Playwright ist installiert (require('playwright'), chromium.launch() ohne Optionen; bei Problemen executablePath '/opt/pw-browsers/chromium'). Seite über einen lokalen HTTP-Server laden (python3 -m http.server auf freiem Port im Ordner der Datei). Touch wie am iPhone 12 Pro Max: Kontext mit viewport 428×926 (hochkant) und 926×428 (quer), hasTouch true, isMobile true, deviceScaleFactor 1; Bedienung mit echten Touch-Ereignissen (page.touchscreen.tap oder CDP Input.dispatchTouchEvent für Wischen/Ziehen), nicht nur JS-Aufrufe. Audio prüfen über die vorhandenen Render-/Export-Wege der App (Offline-Render) und Messungen (Pegel, Knackser = Sprünge > 0.2 zwischen Samples ohne Signal davor, zeitliche Lage). Fotos als PNG in <ordner>/fotos/.
SPRACHE: Alle sichtbaren Texte deutsch, kurz, wie die vorhandenen Texte der App. Bedienung: große Ziele (≥ 40 px), nichts überdeckt ▶/■, ≡, MIX oder Köpfe; jede Aktion mit ↶ rückgängig (ein ↶ je Geste); Speichern/Laden des Projekts bitgleich; alte Projekte laden und klingen wie vorher.
NIE: in /home/user/Deutsch-Mit-Xander committen oder Dateien ändern; etwas veröffentlichen oder pushen; Netzwerk-Uploads; Ordner außerhalb ${N} löschen.
ERGEBNIS: Antworte am Ende knapp in den Schema-Feldern; die Details stehen in deinen Dateien.`

const PAKETE = [
  { key: 'VL3', dir: N + '/vl3', spec: `PAKET VL3 – Gesang-Auftakt im Loop mit Fähnchen (Xander hat das ausdrücklich verlangt).
Hintergrund (in 4.82/4.83 schon da, Paket VL2, Block sq-vl2x-src + Haken im Hauptcode, suche nach "vorlauf", "VL2"): Beim Einsingen wird der Vorzähler mit aufgenommen (take.vorlauf); der Clip beginnt auf der 1; im Takes-Blatt je Clip „▸ einmal“ / „↻ gefaltet“ / „aus“; Keil in der Matrix-Zelle; Export „Mit Vorlauf“ / „Loop rund“.
Xander will: Der gesungene Auftakt soll im Loop von selbst mitlaufen und im Gesang-Editor sichtbar und verstellbar sein.
Baue:
1. AUTO-FALTUNG: Nach jeder Gesang-Aufnahme bzw. jedem Gesang-Import mit Vorlauf erkennt die App den Auftakt (Einsatz der Phrase direkt vor der 1, Energie/Onset im letzten Takt vor der 1; ein Atmer weit davor zählt nicht) und stellt den Clip von selbst auf „↻ gefaltet“, gefaltet wird nur ab dem erkannten Einsatz. Kein Auftakt erkannt → bleibt wie bisher. Bestehende Projekte bleiben unverändert (nur neue Aufnahmen/Importe).
2. FÄHNCHEN im Gesang-Editor (und in der MELODIE-Notenrolle, wenn sie Audio zeigt): ein kleines gezeichnetes Fähnchen (kein Emoji) am Beginn des gefalteten Auftakts, mit Finger nach links/rechts ziehbar (Raster 1/16, fein ohne Raster beim Halten), dazwischen bis zur 1 eine getönte ZONE. Ein Tipp aufs Fähnchen zeigt ein kleines Menü: „▸ einmal · ↻ gefaltet · aus“. Ziehen = ein ↶. WICHTIG (Fehler aus dem ersten Bau): Das Fähnchen darf beim Öffnen hochkant NICHT in der Rand-Rollzone des Editors liegen – sonst rollt die Ansicht beim ersten Ziehen davon; Editor so öffnen bzw. rollen, dass Fähnchen und Zone mit Abstand zum Rand sichtbar sind, und Ziehen am Fähnchen löst kein Rand-Rollen aus, solange der Finger nicht deutlich in den Rand geht.
3. GRENZE: Die Zone ist höchstens so lang wie der aufgenommene Vorlauf und höchstens 2 Takte; beim Falten überlappt der Auftakt das Ende des Clips: dort wird das Clip-Ende unter dem Auftakt weich abgesenkt (kurze Blende, kein Knackser, kein doppelter Gesang). Fähnchen kann nicht über die 1 hinaus nach rechts.
4. ÜBERALL GLEICH: Matrix-Loop, Szenenwechsel (passt nur ein Teil des Auftakts, klingt der Teil direkt vor der 1), Song-Wiedergabe, WAV-Export, Einzelspuren, Video-Export und MIDI (Auftakt-Noten der Melodie) – überall derselbe Startpunkt. Der Keil in der Matrix-Zelle zeigt ↻ beim gefalteten Clip.
5. Speichern/Laden: Startpunkt des Auftakts im Clip gespeichert; alte Projekte bitgleich.
Abnahme: Test mit synthetischem „Gesang“ (z. B. Sinus-Silben mit Hüllkurve, Auftakt 1/4 vor der 1 plus Atmer 3/4 davor): Auto-Faltung greift, Atmer nicht gefaltet; Fähnchen per Touch hochkant/quer ziehen, Zone folgt, ↶ stellt zurück; Render über 3 Loop-Runden: Auftakt vor jeder 1 an derselben Probe (±1 ms), 0 Knackser; Export und Song gleiche Lage; Speichern/Laden.` },
  { key: 'MLG3', dir: N + '/mlg3', spec: `PAKET MLG3 – eigene Ansicht für die Retro-Klänge aus der DAW.
Hintergrund (in der App): Klang-Browser › „Aus DAW-Datei“ (liest Synth-Spuren eines DAW-Projekts .cbp, Block sq-xla-src und Haken, suche "XLA", "MLG"), 10 Retro-Werksklänge (Retro-Bass Rund/Tief, Retro-Lead Hell/Weich, Retro-Fläche Warm/Hauch, Retro-Pluck, Retro-Stab, Retro-Sequenz, Retro-Resonanz), Klang-Editor mit Seiten (OSZ, FILTER, HÜLLK., LFO, FX …) für die VA-Engine.
Baue: Für Spuren, deren Klang aus der DAW-Datei oder aus den Retro-Werksklängen kommt, eine eigene, übersichtliche „Retro-Ansicht“ im Klang-Editor: eine Platte im Stil eines klassischen analogen Synths (gezeichnet, ohne Markennamen) mit den wichtigsten Reglern in einer Seite – Oszillator 1/2 (Welle, Lage, Verstimmung, Mischung), Filter (Cutoff, Resonanz, Hüllkurvenmenge), Hüllkurve Amp (A D S R), Filter-Hüllkurve (A D S R), LFO (Tempo, Menge, Ziel), Echo (Zeit, Rückkopplung, Menge). Jeder Regler steuert genau den passenden vorhandenen Parameter (gleicher Klang wie in der normalen Ansicht). Umschalter „Retro | Voll“ oben im Klang-Editor (nur bei diesen Klängen sichtbar), Wahl gemerkt. Im Klang-Browser bei diesen Klängen ein kleiner Chip „Retro“. A/B zum vorherigen Klang; jede Reglerbewegung ein ↶. Eintrag in der Hilfe („Wo finde ich …?“). WICHTIG (Fehler aus dem ersten Bau): hochkant muss ein normaler senkrechter Wisch die Platte rollen und darf KEINEN Regler drehen – Regler drehen erst nach waagerechtem/kreisendem Ziehen ab einer Schwelle oder nach kurzem Halten; ein Tipp auf einen Regler zeigt Name und Wert.
Abnahme: Touch hochkant/quer (Rollen ohne Regler-Änderung, jeder Regler ändert genau seinen Parameter, ↶, A/B, Umschalter gemerkt nach Neuladen), Render-Vergleich: Klang über Retro-Ansicht eingestellt = bitgleich zum gleichen Wert in der Voll-Ansicht; Werksklänge bitgleich; Speichern/Laden.` },
  { key: 'KMP1', dir: N + '/kmp1', spec: `PAKET KMP1 – eigene kompakte Platte für die Kompakt-Sammlung.
Hintergrund (in der App): Die MS-2000-artige Engine (Block sq-mk-src, suche "MK", "MKK", "Kompakt") hat eine große Bedien-Platte (Paket MK-P: Platte mit LCD, Seiten, Gesten, Spiel-Ansicht) und die Kompakt-Sammlung (Paket MK8b: 128 Rezepte, Browser-Chips, Modul MKK).
Baue: Eine zweite, KOMPAKTE Platte für Klänge der Kompakt-Sammlung: kleiner, aufgeräumt, im Stil eines kleinen Hardware-Synths (gezeichnet, ohne Markennamen): Umschalter „Kompakt | Groß“ (Wahl gemerkt), 8 große Regler mit Bereichswahl (z. B. Bereich FILTER: Cutoff, Resonanz, Hüllk.-Menge, Hüllk.-Tempo; Bereich KLANG: Welle, Verstimmung, LFO-Tempo, LFO-Menge; Bereich RAUM: Echo, Hall, Breite, Lautstärke) – jeder Regler steuert genau einen vorhandenen Parameter; ein PROGRAMM-Knopf (Drehen/Tippen ‹ › blättert durch die 128 Rezepte der Sammlung, Anzeige Nummer + Name im kleinen LCD); eine kleine Tastatur (eine Oktave + Oktav-Tasten) zum Anspielen. Hilfe-Eintrag. Jede Reglerbewegung und jeder Programmwechsel ein ↶. Hochkant: senkrechter Wisch rollt, dreht keinen Regler (Schwelle/Halten wie bei der großen Platte).
Abnahme: Touch hochkant/quer, jeder Regler × jeder Bereich ändert genau seinen Parameter, Programmknopf durch alle 128 (Render jedes Programms nicht leer, nicht übersteuert), ↶, Umschalter gemerkt, Render-Vergleich gleicher Parameterstand = bitgleich zur großen Platte, Werksklänge bitgleich, Speichern/Laden.` },
]

const RES = { type: 'object', properties: {
  ok: { type: 'boolean' }, md5_index: { type: 'string' }, zusammenfassung: { type: 'string' },
  offen: { type: 'array', items: { type: 'string' } } }, required: ['ok', 'zusammenfassung'] }
const BEF = { type: 'object', properties: {
  befunde: { type: 'array', items: { type: 'object', properties: {
    titel: { type: 'string' }, schwere: { type: 'string', enum: ['hoch', 'mittel', 'klein'] }, beleg: { type: 'string' } }, required: ['titel', 'schwere', 'beleg'] } },
  urteil: { type: 'string' } }, required: ['befunde', 'urteil'] }

phase('Grundlage')
const grund = await agent(`${COMMON}

AUFGABE GRUNDLAGE: Richte ${N}/werkzeug/ ein:
1. pflicht.py <datei>: prüft alle PFLICHT-Punkte, die sich statisch prüfen lassen (MS 2000 1×, live-Zeile 1×, Krypto-Werte 0, doppelte Top-Level-Definitionen je Skript, Emoji-Zeichen in neuen sichtbaren Texten grob), gibt JSON aus und Exit-Code 0/1.
2. rauch.mjs <datei>: lädt die Datei per HTTP in Chromium hochkant (428×926, Touch), wartet bis die App bereit ist, tippt ▶ und ■, öffnet ≡, prüft 0 Seitenfehler und 0 console.error, misst Zeit bis „bereit“; gibt JSON aus.
3. KARTE.md: kurze Code-Karte der App für die Paket-Bauer (wo liegen: Gesang-Editor/Takes-Blatt/VL2-Vorlauf, Klang-Editor-Seiten und Klang-Browser, MK-Platte MK-P und Kompakt-Sammlung MK8b, Undo-System, Projekt speichern/laden, Hilfe „Wo finde ich …?“, Offline-Render/WAV-Export, Test-Haken wie window.__… falls vorhanden) – mit Suchbegriffen und Zeilennummern in base/index.html.
Prüfe base/index.html mit beiden Werkzeugen (muss grün sein).`, { label: 'grundlage', phase: 'Grundlage', schema: RES })
log('Grundlage: ' + (grund && grund.zusammenfassung || 'kein Ergebnis'))

const ergebnisse = await pipeline(PAKETE,
  p => agent(`${COMMON}

Werkzeuge: ${N}/werkzeug/ (pflicht.py, rauch.mjs, KARTE.md – zuerst lesen).
${p.spec}

AUFGABE BAU ${p.key}: Code lesen, dann Paket in ${p.dir}/ bauen: apply.py (Eingang base/index.html md5 4e0fa427…), Block, ${p.dir}/index.html gebaut (2× bitgleich), pflicht.py grün, rauch.mjs grün. Schreibe ${p.dir}/NOTES.md (was, wo, Anker) und STAND.md.`, { label: 'bau-' + p.key, phase: 'Pakete', schema: RES }),
  (bau, p) => agent(`${COMMON}

Werkzeuge: ${N}/werkzeug/. Paket ${p.key} in ${p.dir}/ (NOTES.md, apply.py, index.html). Ergebnis des Baus: ${JSON.stringify(bau)}
${p.spec}

AUFGABE TEST ${p.key}: Schreibe ${p.dir}/test.mjs, der ALLE Abnahme-Punkte per Touch und Messung prüft, und lass ihn voll laufen. Fehler im Paket behebst du selbst (apply.py + Block, neu bauen, 2× bitgleich, Pflicht, Rauchtest). Zusätzlich: Rauchtest der Basis-Funktionen in der Nähe (z. B. Aufnahme/Takes bei VL3, Klang-Browser/Editor bei MLG3, große MK-Platte bei KMP1) ohne Rückschritt gegen base/index.html. Bericht ${p.dir}/TEST.md mit Zahlen (x/y), Fotos.`, { label: 'test-' + p.key, phase: 'Pakete', schema: RES }),
  (test, p) => agent(`${COMMON}

Du bist UNABHÄNGIGER PRÜFER für Paket ${p.key} (gebaut von jemand anderem) in ${p.dir}/ (index.html, NOTES.md, TEST.md). Werkzeuge: ${N}/werkzeug/.
${p.spec}

AUFGABE: Prüfe skeptisch wie Xander am iPhone: eigene Touch-Sonden hochkant UND quer (eigene Skripte in ${p.dir}/pruef/), Klang/Render messen, ↶, Speichern/Laden, alte Projekte, Überdeckungen, Texte. Glaube TEST.md nicht ungeprüft. Ändere NICHTS am Paket. Schreibe ${p.dir}/PRUEFUNG.md. Melde nur echte, belegte Befunde (Beleg = Skript + Ausgabe/Foto).`, { label: 'pruef-' + p.key, phase: 'Pakete', schema: BEF }),
  (pr, p) => agent(`${COMMON}

Paket ${p.key} in ${p.dir}/. Prüfer-Befunde: ${JSON.stringify(pr)}
${p.spec}

AUFGABE NACHBESSERN ${p.key}: Jeden Befund mit der Sonde des Prüfers nachstellen; echte beheben (apply.py + Block, neu bauen 2× bitgleich), dann Sonden des Prüfers + test.mjs erneut voll, pflicht.py, rauch.mjs. Begründe nicht behobene Befunde. Aktualisiere NOTES.md, TEST.md, STAND.md und schreibe ${p.dir}/KURZ.md (2–4 Zeilen für Xander, sehr einfach, was neu ist und wo).`, { label: 'nach-' + p.key, phase: 'Pakete', schema: RES })
)
log('Pakete: ' + ergebnisse.map((e, i) => PAKETE[i].key + '=' + (e ? (e.ok ? 'ok' : 'NICHT ok') : 'fehlt')).join(', '))

phase('Zusammenbau')
const fertig = PAKETE.filter((p, i) => ergebnisse[i] && ergebnisse[i].ok)
const zus = await agent(`${COMMON}

Werkzeuge: ${N}/werkzeug/. Fertige Pakete: ${fertig.map(p => p.key + ' (' + p.dir + ')').join(', ') || 'keine'}. Ergebnisse: ${JSON.stringify(ergebnisse)}

AUFGABE ZUSAMMENBAU 4.84.0 in ${N}/rel-4840/:
1. bau.py: base/index.html → nacheinander die apply.py der fertigen Pakete (md5-Liste per Kopie erweitern, wo ein Paket auf der vorigen Stufe statt auf base läuft; Anker-Konflikte auflösen und dokumentieren) → Versionsnummer überall auf 4.84.0 (suche wie 4.83.0 in der App steht: Anzeige, Projektdatei-Fassung nur wenn nötig, Service-Worker-Cache-Name falls vorhanden) → rel-4840/index.html, 2× bitgleich.
2. pflicht.py + rauch.mjs grün; test.mjs jedes Pakets gegen rel-4840/index.html (Kopien in rel-4840/pruef/, Pfade anpassen); Zusammenspiel per Touch (VL3 Fähnchen, Retro-Ansicht, Kompakt-Platte, dazu ▶/■ Matrix und Song, Speichern/Laden).
3. Startzeit gegen base (≥5 Läufe im Wechsel), Größe gegen base.
4. Freigabe-Dateien: rel-4840/release/version.json ({"version": "4.84.0"}), rel-4840/release/CHANGES-V3.md = neuer Abschnitt "## 4.84.0 — … · 23.11.2026" im Stil der vorhandenen bau/CHANGES-V3.md (liegt im Klon ${S}/syn: git -C ${S}/syn show HEAD:bau/CHANGES-V3.md) mit Fett-Stichpunkten je Neuerung und einer Tests-Zeile mit echten Zahlen, gefolgt vom kompletten alten Inhalt. rel-4840/KURZ.md: 1 Zeile für Xander (was neu ist). LOG.md.
Ein Paket, das im Zusammenbau Fehler macht, das du nicht sauber lösen kannst: weglassen und begründen.`, { label: 'zusammenbau-4840', phase: 'Zusammenbau', schema: RES })
return { grund, ergebnisse, zus }
