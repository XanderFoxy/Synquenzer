# notensatz – Stand

Dateien: `app/js/modell.js`, `app/js/einlesen.js`, `app/js/notensatz.js`, `app/beispiele/*.musicxml`
Werkzeug (nicht Teil der App): `werkzeug/notensatz-beispiele.mjs` (erzeugt die Beispiele), `werkzeug/notensatz-test.mjs` (Node), `werkzeug/notensatz-test.html` + `werkzeug/notensatz-foto.mjs` (Chrome, Fotos).

## Was über den Vertrag hinausgeht (die anderen Module nutzen das bitte)
- `takt.dauer` (Viertel; ein Auftakt ist kürzer), `takt.schluessel = {oben:'G'|'F', unten:'G'|'F'}`.
- `note.bindung = {start?, ende?}` (Haltebogen). **Wiedergabe/Analyse:** eine Note mit `bindung.ende` NICHT neu anschlagen → `klingendeNoten(stück)` aus modell.js liefert die zusammengefassten Töne `{id, ids[], t, dauer, midi, system, …}`.
- `note.typ`/`punkte`/`tupel` aus MusicXML (nur für das Notenbild), `note.finger` (Fingersatz wird gezeichnet).
- `stück.pausen` (MusicXML); fehlt es (MIDI), rechnet der Notensatz die Pausen selbst.
- `ROLLEN_FARBE` in modell.js: grundton rot, terz orange, quinte grün, septime blau, option lila, fremd grau.
- modell.js außerdem: `deutscherName(sw, {mitOktave})` (Cis, Es, B, H; c1 = Mitte), `schreibweiseAus(midi, tonart)` (Leitton in Moll erhöht), `taktAn`, `pruefe`.

## notensatz.js
- `zeichne(svg, stück, {von, bis, farben, markiert, beiTipp, beiTaktTipp, schleife:{von,bis}, abstand})` – Breite = Elternelement; bricht bei Größenänderung (hoch/quer) selbst neu um.
- Schnell ohne Neuzeichnen (für die Wiedergabe): `markiere(svg, set)`, `faerbe(svg, map)`, `positionBei(t, svg)` → `{x, y1, y2, zeile}` für einen Zeiger.
- `noteBox(id, svg?)`, `taktBox(nr, svg?)`; `setze(stück, {breite})` ist rein (Node-tauglich).
- Farben über `currentColor` → hell/dunkel automatisch; Markierungs-Farbe `--ns-markiert`, Schleife `--ns-schleife`.

## einlesen.js
- MusicXML partwise/timewise, .mxl (eigene ZIP-Lesung + DecompressionStream), MIDI (Spurnamen/Tonhöhe → Hände; eine Spur → Aufteilung nach Spielbarkeit mit Glättung; Quantisierung 16tel/Triole; Noten über Taktstriche werden gebunden).
- PDF/Foto → wirft ehrlich `{art:'nicht-verfuegbar', text:'Notenerkennung aus Bildern kommt über Claude: Datei über die Ton-Post schicken'}`.

## Beispiele (Noten gegen Akkordfolge geprüft)
- Bach, Präludium C-Dur BWV 846, T. 1–8: C · Dm7/C · G7/H · C · Am/C · D7/C · G/H · Cmaj7/H (drei Stimmen, Haltebögen).
- Beethoven, Für Elise, Auftakt + T. 1–8 (1. Schluss endet mit E-Dis → läuft im Loop nahtlos weiter). Linke Hand Am/E-Brechungen mit Fingersatz 5-2-1. T. 9–16 habe ich bewusst weggelassen, weil ich mir dort nicht sicher genug bin.
- Übung (selbst geschrieben): a-Moll Grundstellung → 1. Umk. → 2. Umk., d-Moll, d-Moll 1. Umk., E/Gis, E7, a-Moll – linke Hand im Bassschlüssel mit Fingersätzen.

## Test
`node werkzeug/notensatz-test.mjs` → alle drei lesen ohne Probleme (144/55/39 Noten), Satz ohne NaN, MIDI-Rundweg ok, PDF wird ehrlich abgelehnt.
Fotos: `fotos/notensatz-hoch.png`, `-quer.png`, `-hoch-dunkel.png`, `-dunkel-nah.png`, `-bach-nah.png` (428 hoch / 926 quer, keine waagrechte Rolle, Tipp auf Note löst beiTipp aus).

## Offen / Grenzen
- Wiederholungszeichen/Volten werden linear gelesen (nicht aufgefaltet), Vorschlagsnoten übersprungen, Schlüsselwechsel innerhalb einer Zeile nicht gezeichnet (Höhe bleibt aber richtig).
- Bei mehrstimmigen MIDI-Händen kann das Notenbild unruhig sein (eine Stimme je Hand).
