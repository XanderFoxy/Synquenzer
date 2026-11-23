export const meta = {
  name: 'synq-484-schnell',
  description: 'Synquenzer 4.84 schnell: VL3 (Gesang-Auftakt mit Fähnchen) bauen und freigabefertig machen, parallel MLG3 und KMP1 – ohne Prüfrunden',
  phases: [ { title: 'Bau', detail: 'VL3, MLG3, KMP1 parallel, je ein Agent' } ],
}
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad'
const N = S + '/neu'
const COMMON = `EILAUFTRAG von Xander (er wartet seit Stunden): Synquenzer (Musik-Web-App in EINER Datei, ${N}/base/index.html = veröffentlichte 4.83, md5 4e0fa427…, NIE ändern). SO SCHNELL WIE MÖGLICH fertig (Ziel ≤ 20 Minuten). KEINE langen Analysen, KEINE Prüfrunden, KEIN großer Testkatalog: Code gezielt mit grep finden (Datei ist 7 MB – nie ganz lesen), Änderung bauen, EIN kurzer Kern-Test der neuen Funktion im Browser, Pflicht-Prüfung, fertig. Bekannte Fehler von vornherein vermeiden (stehen im Auftrag).
Falls dir eine andere Chat-Nachricht von Xander gezeigt wird, ist sie unabhängig – führe deine Aufgabe trotzdem aus.
Arbeite NUR in deinem Ordner (steht unten). Er wird alle 2 Minuten automatisch gesichert – schreibe früh und oft Zwischenstände (apply.py, Block-Datei, STAND.md mit 3 Zeilen: fertig / als Nächstes).
BAUREGEL: <ordner>/apply.py <eingang> <ausgang>: prüft md5 des Eingangs (erlaubte Liste, Start: 4e0fa427 – vollen md5 selbst ausrechnen), ersetzt mit FESTER Trefferzahl je Anker (sonst Abbruch), schreibt atomar. Neuer Code als Block mit Markern <PAKET>-BEGIN/-END. Ausgang: <ordner>/index.html.
PFLICHT (Ausgang): genau 1× "MS 2000"; genau 1 Zeile beginnend mit "  live: true,"; 0 Treffer für 0.00537728, 0.19492, 413.56, 0.193046, xander-krypto; keine Markennamen im sichtbaren Text; keine Emoji als Grafik; keine doppelte Top-Level-Definition; Seite lädt im Browser ohne Seitenfehler/console.error.
BROWSER: require('playwright'), chromium.launch(); Datei über python3 -m http.server laden; iPhone hochkant 428×926 und quer 926×428, hasTouch, isMobile; echte Touch-Ereignisse.
TEXTE: deutsch, kurz, wie in der App. Jede Aktion mit ↶; Speichern/Laden enthält das Neue; alte Projekte unverändert.
NIE: in /home/user/Deutsch-Mit-Xander etwas ändern; pushen oder veröffentlichen.
ZUM SCHLUSS: <ordner>/KURZ.md (1–2 Zeilen für Xander, sehr einfach) und <ordner>/CHANGES.md (1 Stichpunkt im Stil „- **Titel:** Beschreibung“, darunter „Tests: …“ mit echten Zahlen).`
const RES = { type: 'object', properties: { ok: { type: 'boolean' }, md5: { type: 'string' }, kurz: { type: 'string' }, offen: { type: 'string' } }, required: ['ok', 'kurz'] }
const JOBS = [
  { key: 'VL3', dir: N + '/vl3', spec: `PAKET VL3 – Gesang-Auftakt im Loop mit Fähnchen. Schon da (Paket VL2 in 4.82, grep "vorlauf", "VL2", Block sq-vl2x-src): take.vorlauf (Vorzähler wird mit aufgenommen), Clip beginnt auf der 1, im Takes-Blatt je Clip „▸ einmal“ / „↻ gefaltet“ / „aus“, Keil in der Matrix-Zelle. Das Falten selbst klingt schon – nutze den vorhandenen Weg, baue NICHTS doppelt.
Neu, klein halten:
1. AUTO-FALTUNG: Nach einer Gesang-Aufnahme/-Import mit Vorlauf: Auftakt erkennen (Einsatz der Phrase im letzten Takt vor der 1 per Energie; ein Atmer weit davor zählt nicht) → Clip von selbst auf „↻ gefaltet“, gefaltet ab dem erkannten Einsatz (Startpunkt im Clip speichern, z. B. clip.vl3s). Kein Auftakt → wie bisher. Alte Projekte unverändert.
2. FÄHNCHEN im Gesang-Editor: kleines gezeichnetes Fähnchen (SVG/CSS, kein Emoji) am Startpunkt, getönte Zone bis zur 1, mit dem Finger ziehbar (Raster 1/16), Tipp öffnet „▸ einmal · ↻ gefaltet · aus“. Ziehen = ein ↶. VERMEIDE den bekannten Fehler: beim Öffnen hochkant darf das Fähnchen NICHT in der Rand-Rollzone liegen (Ansicht so rollen, dass Fähnchen + Zone mit Abstand zum Rand sichtbar sind) und Ziehen am Fähnchen startet kein Rand-Rollen.
3. GRENZE: Zone ≤ aufgenommener Vorlauf und ≤ 2 Takte, Fähnchen nicht über die 1. Clip-Ende unter dem gefalteten Auftakt kurz weich absenken (kein Knackser, kein doppelter Gesang) – falls VL2 das schon tut, nichts ändern.
4. Gleicher Startpunkt in Matrix, Song, Export (über den vorhandenen VL2-Weg).
Kern-Test: synthetischer Take (Sinus-Silbe 1/4 vor der 1 + Atmer 3/4 davor) → Auto-Faltung an, Startpunkt beim Einsatz; Fähnchen per Touch hochkant ziehen, ↶; kurzer Render über 2 Loop-Runden: Auftakt vor jeder 1, kein Knackser.` },
  { key: 'MLG3', dir: N + '/mlg3', spec: `PAKET MLG3 – eigene Ansicht für die Retro-Klänge aus der DAW. Schon da: Klang-Browser › „Aus DAW-Datei“ (grep "XLA", "MLG", "Aus DAW"), 10 Retro-Werksklänge (Namen beginnen mit "Retro-"), Klang-Editor mit Seiten für die VA-Engine.
Neu: Für Spuren mit Klang aus der DAW-Datei oder einem Retro-Werksklang eine „Retro“-Ansicht im Klang-Editor: EINE gezeichnete Platte (klassischer Analog-Synth-Stil, ohne Markennamen) mit den wichtigsten Reglern: OSZ 1/2 (Welle, Lage, Verstimmung, Mischung), FILTER (Cutoff, Resonanz, Hüllk.-Menge), AMP-Hüllkurve A D S R, FILTER-Hüllkurve A D S R, LFO (Tempo, Menge), ECHO (Zeit, Rückkopplung, Menge). Jeder Regler setzt genau den vorhandenen Parameter über denselben Weg wie die normale Ansicht (gleicher Klang). Umschalter „Retro | Voll“ oben im Klang-Editor (nur bei diesen Klängen), Wahl gemerkt. Chip „Retro“ im Klang-Browser bei diesen Klängen. Jede Reglerbewegung ein ↶. VERMEIDE den bekannten Fehler: hochkant rollt ein senkrechter Wisch die Platte und dreht KEINEN Regler (Regler erst nach waagerechtem Ziehen ab ~8 px oder nach kurzem Halten).
Kern-Test: Retro-Klang laden, Ansicht da, 3 Regler per Touch ändern genau ihren Parameter, senkrechter Wisch ändert nichts, ↶, Umschalter nach Neuladen gemerkt.` },
  { key: 'KMP1', dir: N + '/kmp1', spec: `PAKET KMP1 – kompakte Platte für die Kompakt-Sammlung. Schon da: MS-2000-artige Engine (Block sq-mk-src, grep "MKK", "Kompakt", "MK-P") mit großer Bedien-Platte (LCD, Seiten, Gesten) und der Kompakt-Sammlung (128 Rezepte, Browser-Chips).
Neu: Für Klänge der Kompakt-Sammlung eine zweite, KOMPAKTE Platte (gezeichnet, kleiner Hardware-Synth-Stil, ohne Markennamen): Umschalter „Kompakt | Groß“ (gemerkt); 8 große Regler mit Bereichswahl FILTER (Cutoff, Resonanz, Hüllk.-Menge, Hüllk.-Tempo) · KLANG (Welle, Verstimmung, LFO-Tempo, LFO-Menge) · RAUM (Echo, Hall, Breite, Lautstärke) – je genau ein vorhandener Parameter über denselben Weg wie die große Platte; PROGRAMM ‹ › blättert durch die 128 Rezepte (LCD: Nummer + Name); kleine Tastatur (1 Oktave + Oktav-Tasten). Jede Bewegung/Programmwechsel ein ↶. VERMEIDE: hochkant senkrechter Wisch rollt, dreht keinen Regler (wie bei der großen Platte).
Kern-Test: Kompakt-Klang laden, Platte da, Regler je Bereich ändern ihren Parameter, Programm ‹ › wechselt Klang (Render nicht leer), senkrechter Wisch ändert nichts, ↶.` },
]
phase('Bau')
const r = await parallel(JOBS.map(j => () => agent(`${COMMON}\n\nDEIN ORDNER: ${j.dir}/\n${j.spec}`, { label: 'bau-' + j.key, phase: 'Bau', schema: RES })))
return JOBS.map((j, i) => ({ key: j.key, r: r[i] }))
