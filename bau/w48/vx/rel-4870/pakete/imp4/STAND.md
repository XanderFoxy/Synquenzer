# IMP4 – Stand (fertig)
Bau: `python3 apply.py <eingang> <ausgang>` (Eingang md5 a7515b98…, bitgleich wiederholbar; Ausgang hier `index.html`, md5 4e8506a9d44f95f4a1f6b67ff093e27c).
Blöcke: `xla-block.js` (/* IMP4-XLA-BEGIN/-END */ im Import-Kern sq-xla-src, vor toProject), `block.js` (/* IMP4-BEGIN/-END */ im Hauptskript nach `window.MLG2=…`).
Haken (je eine Stelle, Kommentar `/* IMP4 */`): notesIn → `imp4Stack` (nur Drums), toProject → Bericht-Zeile „DRUMS: n Schläge gleichzeitig …“ in `al.merged`,
xlaHtml → `res.report.tracks.map(r=>imp4Rep(c,res,r))` vor dem vorhandenen Zeilen-Template.

## Was
- (a) Gleichzeitige Drum-Schläge auf demselben Pad (nach Pad-Zuordnung, z. B. zwei DAW-Spuren mit Clap): der Taktgeber spielt je (Zeit, Pad) nur einen
  (max v) – darum im Import EIN Schlag mit v = √(Σv²) (DrumSynth-Pegel ∝ v², gleiche Klänge addieren sich), höchstens 1. Grenze: liegen beide Schläge
  schon hoch (v1² + v2² > 1, z. B. 2× Anschlag 127), wird es nur so laut wie möglich (v = 1), nicht ganz +6 dB.
- (b) NICHT gebaut: die Engine hat ein Echo je Projekt (fxBus.echo); der Anteil je Spur (`fx.dly`) kommt schon heute je Spur aus der DAW. Der Bericht
  sagt jetzt je Spur „Echo X wie in der DAW“ bzw. „eigenes Delay Y → Projekt-Echo X (eins für alle Spuren)“.
- (c) Bericht je Spur (vorhandene Zeile): bei „Klänge aus der DAW übernehmen“ Status „Klang aus der DAW · EQ … · Echo …“ und Zählung/Liste aus dem
  übernommenen Klang (mlToVa-Bericht); der überholte Hinweis „Ein Echo für alle Spuren: …“ fällt dort weg. „Werksklänge“ → Bericht wie bisher.

## Tests
- **Kern-Test-Datei: `imp4-test.cjs`** (Browser, 428×926 Touch, Basis gegen neu; `node imp4-test.cjs <port>`, Server-Wurzel `srv/` mit basis/ und neu/) → `imp4-test.out`: 9/9 OK.
  Clap-Pegel (echte Engine, Offline-Render) gegen DAW-Summe: Basis −4,07 dB, neu −0,31 dB. Bericht vorher/nachher, Werksklänge unverändert, Echo/Anteile unverändert, keine Fehler.
- `imp4-kern-test.mjs` (Node, Import-Kern aus beiden Dateien) → `kern-test.out`: 7/7 OK (Synth-Spuren, Song, Szenen und übrige Drum-Noten bitgleich).
- Testdatei `tests/imp4-song.cbp` aus `tests/gen_imp4.mjs` (synthetisch, neutrale Namen, 2 Drum-Spuren + 2 Synth-Spuren mit Delay 1/4. und 1/8).
- Pflicht (`pflicht.out`): doppelt.js keine neuen Doppel, „MS 2000“ 1×, „  live: true,“ 1×, verbotene Zahlen 0×, keine Markennamen/Emoji im neuen Code.
- Foto: `fotos/imp4-bericht-hoch.png` (Bericht mit Testdatei).
