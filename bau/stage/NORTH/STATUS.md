# Status STAGE NORTH (Zweig stage-north) – North auf App 4.27.0 → 4.30.0

- Ergebnis: `index.html` = `bau/snapshots/R-4270.html` (4.27.0) + North (Paket `north-4261`), `VERSION = '4.30.0'`.
  `stage.diff` = `diff -u` gegen R-4270 (53 Stücke). Größe 4 240 866 B → 4 414 347 B (**+173 481 B**, gleich wie North auf 4.26.1).
- Merge: `git merge-file -p ours base theirs` mit ours = R-4270, base = R-4261, theirs = `bau/helfer/NORTH/index.html`.
- Engine-Quellen in `src/` (aus dem Paket). `node src/build.mjs` auf die Stage-Datei ändert nichts, die Engine-Blöcke sind also
  bitgleich mit den Quellen.
- Tests in `tests/` (aus `NORTH/tests`, das ND13/ND42/NDSTAGE schon enthält). Sie zeigen auf `../index.html`, „alt“ ist R-4270.
  Ergebniszeilen liegen in `ergebnisse/`.

## Konflikte (7, alle Text) – jeweils 4.27.0 behalten

Beide Seiten hatten dieselben Stellen markenfrei umformuliert. Behalten wurde immer die Fassung aus 4.27.0, gemäß Vorgabe
„neutrale Markentexte aus 4.27.0 bleiben“:

1. Werks-Klang `sync-lead`: Vorbild-Zeile („…, 90er-Lead“)
2. Kommentar Kit „Resonanz-Perc“ (Werks-Kits)
3. Tipp-Text Kit „Resonanz-Perc“
4. Kommentar-Kopf DrumSynth v2
5. Kommentar Kit „FM Labor“
6. `KIT_REF` Vorbild-Zeilen „FM Labor“ / „Resonanz-Perc“
7. `fxAbout()` ⓘ Vorbild des FM-Felds (4.27.0 hat den Hinweis „Marken gehören ihren Inhabern“)

Sonst 0 Konflikte. Der Video-Render mit den Haken `mdVvSave/Boot/Rest/Flush` sitzt sauber neben dem G6-Chor-Zustand aus 4.27.0
in `vvSwapIn/vvSwapOut`.

**Doppelte Top-Level-Definitionen ausgeschlossen:** Für jeden Namen (`function/const/let/var/class` am Zeilenanfang) gilt:
Anzahl Stage = 4.27.0 + North − 4.26.1. Kein Name ist auf beiden Seiten neu dazugekommen.

## Regeln

Geprüft auf `index.html`:
- `grep -ciE 'korg|microkorg|radias|dwgs|kodamo|mask1|kompakt'` = 0, `nord` = 0
- „MS 2000“ genau 1×, Zeile `  live: true,` genau 1×
- Tasten ≥ 44 px: tap44 mit 84 Ansichten in 7 Formaten, md2-shots ohne Überlauf

In `tests/` und `src/` werden die Prüfmuster für den Markennamen jetzt aus Teilen zusammengesetzt, damit das Wort nirgends steht.
Keine Handbücher/PDFs, keine Datenbank-Zugriffe, nichts an main.

## Tests (Chromium headless, 4 Kerne, Stage-Datei)

| Test | Ergebnis |
|---|---|
| `bau/tests/smoke.mjs` | ✓ keine Fehler |
| `bau/tests/orch-mk-check.mjs` | ✓ 4.30.0, initAm rms 0,0705 / Spitze 0,177, gleich wie 4.27.0 |
| `bau/tests/v3-mk2-wellen.mjs` | **OFFEN**: Der private Bezug `bau/dwgs-trace` fehlt im Container, das gilt auch für R-4270. Ersatzprüfung: Wellenblock `MKD` und Tabellenbau `MKT` sind zeichengleich mit R-4270, 0 Markenwörter, „MS 2000“ 1× |
| `smoke.mjs` (North) | ✓ |
| `md1-node.mjs` 48 kHz / 44,1 kHz | ✓ 195/195 · 195/195 |
| `md1-retest.mjs` Node / `--chromium` | ✓ 40/40 · 44/44 |
| `md3-kits.mjs` | ✓ 53/53 |
| `md1-gc.mjs` | ✓ 60 s ohne GC, Heap +0,68 MB |
| `md4-store.mjs` (ND4-02/06/07) | ✓ alle, `historyCheck()` ok (144 Ereignisse) |
| `md4-int.mjs` (ND4-03/04/05) | ✓ alle |
| `md4-quick.mjs` | ✓ |
| `md4-golden.mjs` (Regel 28 gegen **4.27.0**) | Kits deep-equal (9), Render −143…−156 dB (= alt/alt), ohne North-Pad kein Modul ✓ · **✗ Größe +173 KB** (Budget 100 KB, Q9, unverändert) |
| `md2-ui.mjs` (gegen 4.27.0) | ✓ 371/0 |
| `md2-fix.mjs` · `md2-shots.mjs` | ✓ · ✓ 6 Formate, kein Überlauf |
| `ndstage-tap44.mjs` | ✓ 84 Ansichten |
| `north-songs.mjs` (9 Projekte aus 4.27.0) | ✓ laden + speichern unverändert, ohne North-Modul; Video-Ton gleiche 356 Noten, −0,07 dB |
| `north-video.mjs` (ND4-08) | ✓ zweimal bitgleich (−300 dB), live ↔ Video Korrelation 1,00, Live-Knoten unberührt |
| `north-chor-songs.mjs` (**neu**, Song mit Chor-Gruppe 80 + Gospel aus 4.27.0) | Datei deep-equal ✓, Chor-Gruppe v2 + Stile erhalten ✓, kein North-Modul ✓, gleiche 48 Noten ✓. Video-Pegel −2,44 dB und „Chor im Video nicht fertig (2)“ ✗ – **genauso in 4.27.0 → 4.27.0** (Gegenlauf, gleiche Zahlen) = Altlast 4.27.0, nicht North (siehe Offen 3) |
| `north-chor-play3min.mjs` (**neu**, 180 s: North-Kit „Schräg“ + Chor-Gruppe an 5 Stellen, Stile 80/Gospel/Pop/Barbershop/Rock + Synth) | 0 Knackser, Engine-Mitschnitt = Offline-Render (−349 dB), 2 788 Schläge, 0 verspätet, 0 Lücken am Master (179,8 s), 0 Konsolenfehler, 0 lange Tasks, alle 5 Chor-Stellen fertig vor dem Einsatz, Drift −0,19 s · formal ✗ nur wegen **10 Ausgabe-Unterläufen** (0,10 s) |
| `ndstage-play3min.mjs` (180 s, nur North) | 0 Knackser, −349 dB, 0 verspätet, 0 Fehler · formal ✗ wegen 13 Unterläufen |
| `play3min-basis.mjs` (Vergleich ohne North, Kit 808) | 4.27.0: **5** und **10** Unterläufe (zwei Läufe) · Stage ohne North-Pad: 21 → die Unterläufe kommen aus dem Container und streuen stark, North + Chor liegen darin |

## CPU (Container, schwankt stark)

- Gleicher Container, gleicher Test `md1-chromium.mjs` (Echtzeit):
  - Stage: schlimmster Fall 13,1 % / typischer Groove 3,9 %
  - North-Paket auf 4.26.1: 12,8 % / 3,8 %
  - Ergebnis: Durch den Merge kommt keine Last dazu. Der Container ist langsamer als der des Pakets (dort 10,2 % / 2,8 %).
- `md1-cpu.mjs`: schlimmster Fall 9,85 %, mit Begrenzer Stufe 1 8,83 %, Stufe 2 7,04 %; 10/23 Einzelgrenzen (Paket: 15/23 im schnelleren Container).
- 3-Minuten-Lauf North + Chor:
  - Engine-Last je Sekunde max. 8,3 %, Median 2,0 %
  - Hauptthread 17,1 % (davon Skript 2,4 %), Begrenzer blieb auf Stufe 0

## Offen (Xander/Dirigent)

1. **Gerätetest iPhone 12 Pro Max**: Kit „Schräg“ + Song mit Chor-Gruppe, 3 Minuten; Hörprobe der 45 Programme. Entscheidet Q3.
2. **Q3 CPU-Rahmen** (Einzelgrenzen je Stimme überschritten, Begrenzer greift) und **Q9 Größe** (+173 KB statt ≤ 100 KB): unverändert offen.
3. **Altlast 4.27.0, nicht North:** Ein Song mit Chor-Gruppe, der per `importJSON` in eine **frisch geöffnete Seite** geladen wird,
   bekommt fürs Video seinen Chor nicht fertig (`g6pWaitAll` wartet 180 s, miss 2). Das Video hat dann keinen Chor (−2,4 dB).
   R-4270 → R-4270 zeigt dasselbe. Am Gerät prüfen (Schritt 9–10 in CHANGES). Nicht angefasst, weil 4.27.0-Code.
4. Chor-Stile wave / ballade / disco greifen mit dem synthetischen Test-Lead nicht (`g6pStyle` → false), in 4.27.0 genauso.
   Vermutlich passt der Lead-Umfang nicht. Nur Testaufbau, kein Befund an North.
5. Master-Spitze im 3-Minuten-Lauf 1,25 (+1,9 dBFS) vor dem Master-Limiter (Kit „Schräg“ + Chor) – gehört zu **Q2** (Pegelschutz).
6. `v3-mk2-wellen.mjs` am Bau-Ort mit Bezug laufen lassen (hier nur Ersatzprüfung).
7. Aus dem Paket weiter offen: Q6 E1-Abklingen; ND42-Fragen 1–4 (SOLO PART nur North-Pads, Würfel bei North-Pads, Unter-Reiter-Höhe, ✕ für eigene Programme).
