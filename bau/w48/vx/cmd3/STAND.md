# CMD3 – Stand (fertig)
Bau: `python3 apply.py <eingang> <ausgang>`. Erlaubter Eingang ist nur 4.88.0 (md5 695af0504463a6385e21dc94e55b00c9). Der Bau ist bitgleich wiederholbar.
Ausgang hier `index.html`, md5 58e7776394b54e05e5e9ebb907813ec1 (7 304 062 B, +3 487 B).
Block `block.js` (/* CMD3-BEGIN/-END */, im Hauptskript direkt nach /* IMP4-END */). Dazu kommen 6 Haken, je einzeilig mit `/* CMD3 */`:
- normTrack: Das Feld `ech` (eigenes Echo einer Synth-Spur, normiert wie fxBus.echo) bleibt beim Speichern, Laden und Rückgängigmachen erhalten.
- applyTrackParams → `cmd3Sync(i)`: Der Echo-Send der Spur geht ins eigene Echo (FX.Echo, maxSec passend zum längsten Notenwert bei 40 BPM) oder zurück ins Projekt-Echo. Gleiche Einstellungen teilen sich ein Echo (Liste je Audio-Kontext, also auch beim Offline-Render); unbenutzte Echos werden nach 4 s abgehängt.
- applyEcho → `cmd3Tempo` (Tempo); echoKill → `cmd3Kill` (Stopp: Fahnen abschneiden wie beim Projekt-Echo).
- xlaProject nach mlg2Echo → `cmd3Echo(c,p)`: Weicht das Echo einer DAW-Spur vom Projekt-Echo ab, bekommt die Spur `t.ech`. Das Projekt-Echo bleibt wie in 4.88.
- imp4Rep: Der Bericht sagt „eigenes Echo X | Y wie in der DAW“ statt „eigenes Delay X → Projekt-Echo Z (eins für alle Spuren)“.
Ohne `ech` sind alle Haken wirkungslos: Alles andere ist bitgleich, auch Import mit „Werksklänge“ und alle Projekte ohne Import.

Befund zum Auftrag: (a) Doppelschläge und (c) Bericht mit übernommenem Klang sind schon in 4.88 (Paket IMP4). Neu ist (b), das Echo je Spur. Dazu passt der Bericht-Text an.
Grenzen:
- Das eigene Echo hat keine eigenen Knöpfe (Aussehen/Bedienung bleiben unverändert). Die Echo-Knöpfe des Projekts wirken nur auf Spuren ohne eigenes Echo. Der Anteil je Spur (Send) wirkt wie bisher.
- Doppelschläge mit sehr hohem Anschlag (v1² + v2² > 1) bleiben bei v = 1 gedeckelt (wie in 4.88).

## Kern-Test
**`cmd3-test.cjs`** (Playwright, 428×926, Touch), Ergebnis in `cmd3-test.out`: 17/17 OK.
Testdatei `tests/imp4-song.cbp` (erzeugt mit `tests/gen_imp4.mjs`): 2 Drum-Spuren mit gleichzeitigen Claps, Synth „Bass“ mit Delay 1/4. und „Lead“ mit Delay 1/8.
Gegen eine andere Fassung laufen lassen:
```
mkdir -p srv/basis srv/neu
cp <alte index.html> srv/basis/
cp <neue index.html> srv/neu/
for d in basis neu; do echo '{"version":"4.88.0"}' > srv/$d/version.json; done
(cd srv && python3 -m http.server <port> --bind 127.0.0.1 &)
NODE_PATH=/opt/node-tools/node_modules node cmd3-test.cjs <port> [basis-ordner] [neu-ordner]
```
Messwerte (Basis → neu):
- Lead-Echo: links 750 → 240 ms, rechts 370 → 110 ms (Soll 250 / 125 ms). Pegel −6,72 → −6,59 dB.
- Bass: unverändert. Projekt sonst bitgleich (ohne `ech`).
- ↶/↷: ein Schritt.
- Clap-Doppelschlag gegen die DAW-Summe: −0,11 / +0,01 dB.
Pflicht: `pflicht.out`. doppelt.js meldet keine neuen Doppel. „MS 2000“ 1×, „  live: true,“ 1×, verbotene Zahlen 0×, keine Emoji oder Markennamen im Block.
Foto: `fotos/cmd3-bericht-hoch.png` (Import-Bericht, Testdatei).
