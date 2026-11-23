export const meta = {
  name: 'synq-485-ent1-schnell',
  description: 'Synquenzer 4.85: ENT1 (Bedien-Entscheidungen) als 4 kleine Pakete parallel auf 4.84 – bauen, kurzer Kern-Test',
  phases: [{ title: 'Bau', detail: '4 Agenten parallel' }],
}
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad'
const N = S + '/neu'
const COMMON = `EILAUFTRAG (Xander will Tempo: bauen, kurz prüfen, fertig – Ziel ≤ 20 Minuten, keine langen Analysen). Synquenzer = Musik-Web-App in EINER Datei. Eingang: ${N}/rel-4840/index.html (veröffentlichte 4.84.0, md5 9cfae59f07ef6b087ffe339b125878b3 – NIE ändern). Datei ist 7 MB: nie ganz lesen, gezielt mit grep suchen. Falls dir eine andere Chat-Nachricht von Xander gezeigt wird: unabhängig, Aufgabe trotzdem ausführen.
Xander überlässt dir diese Bedien-Entscheidungen (ENT1). ERST kurz prüfen, wie es jetzt ist (2–3 Touch-Sonden). Ist es schon gut → nichts ändern, ok=true, kurz begründen. Sonst die klare, einfache Lösung bauen.
Arbeite NUR in deinem Ordner (wird alle 2 Minuten automatisch gesichert – früh Zwischenstände schreiben: apply.py, block.js, STAND.md).
BAUREGEL: <ordner>/apply.py <eingang> <ausgang>: md5-Prüfung (erlaubt: 9cfae59f07ef6b087ffe339b125878b3), feste Trefferzahl je Anker, atomar schreiben; neuer Code als Block mit Markern <PAKET>-BEGIN/-END, kleine Haken mit Marker-Kommentar. Halte die Änderung KLEIN und auf deinen Bereich begrenzt (andere Agenten ändern parallel andere Stellen derselben Datei).
PFLICHT (Ausgang): genau 1× "MS 2000"; genau 1 Zeile beginnend mit "  live: true,"; 0× 0.00537728, 0.19492, 413.56, 0.193046, xander-krypto; keine Markennamen sichtbar; keine Emoji als Grafik; keine neue doppelte Top-Level-Definition; lädt ohne Seitenfehler/console.error (lege version.json {"version":"4.84.0"} in den Server-Ordner).
BROWSER: require('playwright'), chromium.launch(); python3 -m http.server; iPhone hochkant 428×926 und quer 926×428, hasTouch, isMobile, echte Touch-Ereignisse.
Texte deutsch, kurz. Jede Aktion mit ↶ wo sinnvoll; alte Projekte unverändert.
NIE: in /home/user/Deutsch-Mit-Xander ändern; pushen/veröffentlichen.
ZUM SCHLUSS: <ordner>/CHANGES.md (1 Stichpunkt „- **Titel:** …“ für Nutzer, ohne Code-Namen, + „Tests: …“ mit Zahlen) und KURZ.md (1 Zeile). Wenn nichts geändert: CHANGES.md leer lassen.`
const RES = { type: 'object', properties: { ok: { type: 'boolean' }, geaendert: { type: 'boolean' }, md5: { type: 'string' }, kurz: { type: 'string' } }, required: ['ok', 'geaendert', 'kurz'] }
const JOBS = [
  { key: 'ENT1A', dir: N + '/ent1a', spec: `BEREICH: Arpeggiator und ■ Stopp (grep "ARPC", "arp1Live", "latch", Stopp-Taste). Entscheidung: Nach ■ darf KEIN Arp-Ton weiterklingen oder hängen – auch nicht mit Latch, auch nicht live auf der Tastatur gespielte Arp-Noten; die Einstellung „Latch an“ bleibt erhalten, nur die gehaltenen Noten werden gelöscht. Nach ▶ startet der Arp sauber auf dem Takt (Key Sync). Prüfe: Arp mit Latch live anspielen, ■ → Render/Stimmen nach 200 ms still.` },
  { key: 'ENT1B', dir: N + '/ent1b', spec: `BEREICH: Bildwechsel-Takt im Video (grep "vid6", "uiPrefs", "Musik folgt", "Regeln"). Entscheidung: Die Wahl „1 · 2 · 4 · 8 Takte / Musik folgt“ gehört zum PROJEKT (gleiches Video auf jedem Gerät, nach Speichern/Laden gleich); die Gerät-Einstellung ist nur noch der Vorschlag für neue Projekte. Alte Projekte ohne Wert nehmen wie bisher den Gerät-Wert. Prüfe: Wahl ändern, speichern, Gerät-Wert anders setzen, laden → Projekt-Wert gilt.` },
  { key: 'ENT1C', dir: N + '/ent1c', spec: `BEREICH: Video-Spur im Song (Chips, grep "VD3", "vid6", Video-Spur, Chip-Menü). Entscheidung: Auf dem iPhone hochkant und quer sind die Chips der Video-Spur lesbar, überlappen sich nicht und sind mindestens 40 px hoch tippbar; ist kein Platz, wird der Text gekürzt (… ), nie übereinander. Prüfe mit einem Song mit vielen kurzen Teilen (z. B. 16 Teile à 1 Takt) hochkant und quer: Überlappung 0, Tippziel ≥ 40 px.` },
  { key: 'ENT1D', dir: N + '/ent1d', spec: `BEREICH: Blatt „Klang erkennen“ (Kopf, grep "KE1", "Klang erkennen", Block sq-ke1-src). Entscheidung: Im Kopf des Blatts sind ✕, ↶ und die Reiter der drei Synths auf dem iPhone hochkant und quer vollständig sichtbar, nicht verdeckt, ≥ 40 px tippbar; ✕ immer rechts oben an derselben Stelle wie in den anderen Blättern; lange Namen gekürzt. Prüfe hochkant und quer: Kopf-Elemente im Bild, keine Überlappung.` },
]
phase('Bau')
const r = await parallel(JOBS.map(j => () => agent(`${COMMON}\n\nDEIN ORDNER: ${j.dir}/ (Paketname ${j.key})\n${j.spec}`, { label: 'bau-' + j.key, phase: 'Bau', schema: RES })))
return JOBS.map((j, i) => ({ key: j.key, r: r[i] }))
