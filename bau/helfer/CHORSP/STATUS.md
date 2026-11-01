# STATUS CHORSP – CHOR-SPUREN (Zweig `chor-spuren`)

**Stand: gebaut, alle eigenen Tests grün. Wartet auf Xanders Prüfung am iPhone.** Ohne Xanders Okay ist es nicht fertig.

## Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | App 4.30.0 + CHORSP (VERSION unverändert `4.30.0`) |
| `patch.diff` | Unterschied zu `bau/snapshots/R-4300.html`: CSS-Block, JS-Block `CHS-BEGIN…CHS-END`, 34 Einhängepunkte (je eine Zeile) |
| `bau.py` | baut `index.html` aus R-4300 + `src/chs.js` + `src/chs.css` (jeder Einhängepunkt muss genau 1× passen → leichter Merge mit 4.30.1/G10e) |
| `src/chs.js`, `src/chs.css` | der Paket-Code (Präfix `chs`) |
| `tests/chorsp.mjs` | Abnahme (Touch per CDP): 60 Prüfungen → `tests/ergebnis-chorsp.txt` |
| `tests/regel28.mjs` | Basis ↔ CHORSP: Klang, Knoten, Speichern, Laden, Pixel → `tests/ergebnis-regel28.txt` |
| `tests/ergebnis-pflicht.txt` | smoke.mjs, orch-mk-check.mjs, v3-mk2-wellen.mjs (Basis und CHORSP) |
| `tests/shots/` | Bildschirmfotos 428×926 (P), 926×428 (L), 428×650 (K) |

Aufruf: `python3 bau.py && node tests/chorsp.mjs && node tests/regel28.mjs`. Playwright kommt aus der globalen Installation.

## Ergebnisse

- **chorsp.mjs: alles grün.**
  - Background-Gruppe in Matrix und Song nach Stil-Tipp und nach „Spur teilen“.
  - Kopplung: −6/−6 gekoppelt, 0 entkoppelt, Wieder-Koppeln ohne Sprung (0,005 dB); Summenregler; Spur-Pegel und Pan im laufenden Knoten.
  - Undo/Redo, Speichern/Laden.
  - Lineal-Tipp ab Takt 2 mit Begleitung (Noten-Log), Gesang (Versatz 2,0 s) und Chor (6 Kopien).
  - Laufstrich, Loop, Probehören nach Tonhöhen-Ziehen und bei einer Chorstimme.
  - Zoom mit zwei Fingern und Doppeltipp, Schwenken, „Wischen über nicht gewählte Note verschiebt nichts“.
  - Wellen-Editor: Lineal und Zoom. Song-Stück: Song ab Takt.
  - Auge: Unisono, Lead-Chip, je Clip gemerkt.
  - Video: Chor folgt Background −6 dB / Gesang gesamt −6 dB.
  - GarageBand-Instrumental ohne Gesang (Bytes gleich).
  - Layout in 3 Formaten.
- **regel28.mjs: alles grün.**
  - Ohne neue Felder sind die Formeln bitgenau wie in 4.30.0 (Lead-Faktor, Stimmen-Pegel, Pan, Spur-Effekte).
  - Kopien und Pan sind über zwei Läufe bitgleich.
  - Gespeichertes Projekt ist zeichengleich, ein Projekt aus 4.30.0 lädt unverändert, die Matrix ohne Chor ist pixelgleich.
  - Hinweis: Die Chor-Lautheitsmessung gA (Worker, G6+b) schwankt schon zwischen zwei Läufen der **Basis** um ≈ 1e-8 bis 1e-6 relativ. Darum wird der Video-Ton über Läufe mit < 1e-5 (−100 dB) verglichen.
- **smoke.mjs / orch-mk-check.mjs:** grün, Ausgabe gleich wie die Basis (`initAm rms 0.0705, peak 0.177`, keine Fehler).
- **v3-mk2-wellen.mjs:** **OFFEN** (Exit 2) in Basis und CHORSP gleich: „Bezug am Bau-Ort fehlt“, weil die private Wellen-Spur `bau/dwgs-trace` nicht im Repo liegt. Der Datenblock MKD/MK_WD ist von diesem Paket nicht berührt (siehe `patch.diff`).
- **Regeln:**
  - „MS 2000“ genau 1×, `  live: true,` genau 1×, VERSION unverändert.
  - Keine der verbotenen Markenwörter im neuen Code.
  - Keine Emojis als Grafik: Play-, Stopp-, Loop- und Mischpult-Symbol sind SVG.
  - Keine Datenbank-Zugriffe.

## Offen / bitte prüfen (Xander)

1. **Bitte prüfen:**
   - STIMME-Clip ✎ → [Chor] → Gospel → schließen: Steht BACKGROUND mit 3 farbigen Spuren unter STIMME?
   - Lead-Regler im Mischpult ziehen: Geht der Chor mit?
   - [Gekoppelt] aus: Bleibt der Chor stehen?
2. **Bitte prüfen:**
   - Im Noten-Editor aufs Lineal bei Takt 2 tippen: Läuft es ab dort mit Begleitung?
   - Bereich ziehen: Loop?
   - Note wählen + ▲: Hörst du sie gleich?
3. **Bitte prüfen:** In einer Chorstimme das Auge bei „L Lead“: Verschwinden die grauen Balken? Beim grauen Chip „1 Unisono“: Verschwindet der gestrichelte Rahmen?
4. **Touch-Ziele:** Mischpult, Lineal und Knöpfe sind ≥ 44 px. Die Matrix-Zeilen der Gruppe folgen der Zeilenhöhe der Matrix: hochkant 42 px, quer ≈ 29 px, wie alle Matrix-Zeilen (App-Minimum 40/30 px). Wer größere Zeilen will: Gruppe zuklappen oder über das Mischpult arbeiten.
5. **Merge-Hinweise:**
   - **4.30.1** bringt Transport ▶/■/⏮ in alle Blatt-Köpfe; das Lineal-▶/■ hier sitzt in der Leinwand, nicht im Kopf (kein Konflikt).
   - **G10e** (Warp-Editor-Zoom) ändert vermutlich `wpView`/`wpGest`. Hier gibt es dort genau zwei Zeilen: `chsViewW` in `wpView` und `chsEdPaint` am Ende von `wpPaint`. Beim Merge die Zoom-Breite aus G10e mit `E.chsW` zusammenlegen.
6. „**Spur teilen**“ gibt es in 4.30.0 nicht unter diesem Namen. Im Takes-Blatt heißt es „Als Chor-Stimme duplizieren → Ganze Spur“, im neuen Mischpult „Spur teilen · Gegenstimme“. Beides legt die Spur sichtbar in Matrix und Song an.
7. Eine Kopplung je Stelle (G6+e, Chor-Blatt [Gekoppelt]) gibt es weiterhin. Ist eine Stelle dort getrennt, bleibt sie ganz stehen, auch bei „Gesang gesamt“. Die neue Kopplung im Mischpult gilt für die ganze Gruppe.
