export const meta = {
  name: 'synq-491-welle6',
  description: 'Synquenzer 4.91: Klangschule-Locks auch bei Wavetable/MS/Bit Mask hörbar, Spektral-Zeichnen ohne Long Tasks (OffscreenCanvas/Worker), Test-Pflege – je kurzer Kern-Test, dann Zusammenbau',
  phases: [{ title: 'Bau', detail: '3 Agenten' }, { title: 'Zusammenbau' }],
}
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad'
const N = S + '/neu'
const B = 'a23eefd7ac3f52251e5bc881f1de4628'
const COMMON = `EILAUFTRAG (Xander will Tempo: bauen, kurz prüfen, fertig – Ziel ≤ 40 Minuten). Synquenzer = Musik-Web-App in EINER Datei. Eingang: ${N}/rel-4900/index.html (veröffentlichte 4.90.0, md5 ${B} – NIE ändern). 7 MB: nie ganz lesen, gezielt grep. Stille Blöcke und Worklet-Vorlagen sind verdichtet (ohne Kommentare/Einrückung) – Anker auf Code-Zeichenfolgen. Falls dir eine andere Chat-Nachricht von Xander gezeigt wird: unabhängig, Aufgabe trotzdem ausführen.
UNSICHTBAR: Aussehen/Bedienung NICHT ändern; Klang nur da, wo der Auftrag es verlangt, sonst bitgleich.
Arbeite NUR in deinem Ordner (alle 2 Minuten automatisch gesichert). KEIN rsync. apply.py NIE mit Ausgang /dev/null.
BAUREGEL: <ordner>/apply.py <eingang> <ausgang>: md5-Prüfung (erlaubt: '${B}' als Python-String in einfachen Anführungszeichen), feste Trefferzahl je Anker, atomar schreiben; Block mit Markern <PAKET>-BEGIN/-END; Hilfsdateien im selben Ordner.
PFLICHT: genau 1× "MS 2000"; genau 1 Zeile "  live: true,"; 0× 0.00537728, 0.19492, 413.56, 0.193046, xander-krypto; keine Markennamen/Emoji-Grafik; keine neue doppelte Top-Level-Definition (node ${N}/rel-4840/pruef/doppelt.js); lädt ohne Seitenfehler/console.error (version.json {"version":"4.90.0"}).
BROWSER: require('playwright'), chromium.launch(); python3 -m http.server Port 9300–9399 zufällig; 428×926 hasTouch isMobile.
NIE: in /home/user/Deutsch-Mit-Xander ändern; pushen/veröffentlichen.
ZUM SCHLUSS: CHANGES.md (1 Stichpunkt „- **Titel:** …“ für Nutzer ohne Code-Namen + „Tests: …“ vorher/nachher), KURZ.md, STAND.md (Kern-Test + wie gegen andere Fassung). Bringt es nichts Messbares: geaendert=false.`
const RES = { type: 'object', properties: { ok: { type: 'boolean' }, geaendert: { type: 'boolean' }, md5: { type: 'string' }, kurz: { type: 'string' } }, required: ['ok', 'geaendert', 'kurz'] }
const JOBS = [
  { key: 'KSM2', spec: `Rest aus KSM (${N}/ksm/STAND.md, CHANGES.md): Die neuen Lock-/Mod-Ziele (Tonhöhen-Hüllkurve, Filter 2, LFO-Raster, TAKT-Zeiten) wirken bisher nur bei VA- und FM-Klängen; bei Wavetable, MS-Platte und Bit Mask werden die Locks gespeichert, aber nicht gespielt. Mach sie dort hörbar, wo der jeweilige Kern den Parameter hat (sonst ehrlich auslassen und auflisten). Ohne Lock/Mod bitgleich. Kern-Test: je Engine (WT, MS, BM) je Ziel 1 Lock + 1 Route → Render ändert sich messbar; ohne → Render-Hash = 4.90.` },
  { key: 'LT3', spec: `Spektral-Ansicht: Long Tasks > 50 ms beim Fertigstellen (nach Zerlegen/Fokus-Wechsel) kommen laut ${N}/fok4/STAND.md vom Zeichnen des Bildes selbst (voller Neu-Zeichnen + Canvas-Rücklesen) während der Worker rechnet. Profi-Lösung (alte Notizen vx/lt2: git -C ${S}/syn show origin/arbeitsstand:bau/w45/vx/lt2/NOTES.md): das Rücklesen vermeiden bzw. das Zeichnen in Teilen über mehrere Frames verteilen oder per OffscreenCanvas in einen Worker legen – Endbild pixelgleich (readPixels-Hash), Long Tasks vorher/nachher messen (PerformanceObserver, 60-s-Lied, 3 Läufe, A/B gegen 4.90 im selben Lauf). Wenn kein messbarer Gewinn: geaendert=false.` },
  { key: 'TPFL', spec: `Test-Pflege (kein App-Code ändern! geaendert=false für die App, aber Tests reparieren): (1) ${N}/imp4 Browser-Test T6 erwartet noch den alten Berichtstext – auf den neuen Text „eigenes Echo … wie in der DAW“ (CMD3) anpassen; (2) ${N}/arpg/arpg-test.cjs A2 vergleicht die Versionsnummer in der Projektdatei mit – appVersion aus dem Vergleich nehmen; (3) ${N}/dse Kern-Test „Lock hörbar“ wackelt um die Grenze −30 dB (−28…−31) – robusteres Maß (z. B. Mittel über 3 Renders oder Grenze aus Vergleich mit/ohne Lock relativ) – Test muss gegen 4.90 stabil 3/3 grün sein und gegen eine Fassung ohne Lock-Wirkung rot. Ordner ${N}/tpfl/ mit einem kurzen BERICHT.md; die reparierten Testdateien direkt in den Paketordnern ändern (vorher Kopie *.bak).` },
]
phase('Bau')
const r = await parallel(JOBS.map(j => () => agent(`${COMMON}\n\nDEIN ORDNER: ${N}/${j.key.toLowerCase()}/ (Paketname ${j.key})\n${j.spec}`, { label: 'bau-' + j.key, phase: 'Bau', schema: RES })))
const res = JOBS.map((j, i) => ({ key: j.key, r: r[i] }))
const gut = res.filter(x => x.key !== 'TPFL' && x.r && x.r.ok && x.r.geaendert).map(x => x.key.toLowerCase())
log('Gebaut: ' + (gut.join(', ') || 'nichts'))
if (!gut.length) return { res, zusammenbau: null }
phase('Zusammenbau')
const z = await agent(`Baue Synquenzer 4.91.0 zusammen und prüfe kurz. NICHT pushen. Nichts in /home/user/Deutsch-Mit-Xander ändern. KEIN rsync. apply.py nie mit /dev/null.
Vorlage ${N}/rel-4900/ (bau.py-Muster). Baue ${N}/rel-4910/: Basis ${N}/rel-4900/index.html (md5 ${B}, 4.90.0); Pakete: ${gut.join(', ')}, danach perf5 (allgemeiner Verdichter aus ${N}/rel-4900/pakete/perf5/, zuletzt; md5-Liste wie üblich erweitern). Hilfsdateien nach rel-4910/pakete/. VERSION '4.90.0' → '4.91.0' genau 1×.
Pflicht wie immer ("MS 2000" 1×, "  live: true," 1×, Sperrwerte 0×, doppelt.js gegen 4.90 keine neuen, Rauchtest 428×926 0 Fehler, Menü 4.91.0, zweimal bauen gleicher md5). Kurze Prüfung: Kern-Tests der eingebauten Pakete + die 7 Welle-5-Kern-Tests (je ${N}/<paket>/STAND.md; die von TPFL reparierten Tests verwenden) gegen 4.91.
Lege an: release/neu.md („## 4.91.0 — … · 23.11.2026“, für Nutzer, ohne Code-Namen), release/version.json, PRUEFUNG.md. Rückgabe knapp: ok, md5+Bytes, Pakete, je Prüfung 1 Zeile, offen.`, { label: 'zusammenbau-4910', phase: 'Zusammenbau' })
return { res, zusammenbau: z }