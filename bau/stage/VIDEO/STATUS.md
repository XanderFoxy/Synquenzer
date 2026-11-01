# STATUS Stage VIDEO — App 4.28.0 „Video zeigt die echte App“

**Stand:** zusammengeführt und in Chromium (Playwright, headless) getestet. **Xander hat noch nicht am iPhone geprüft – ohne sein
Okay nicht fertig.**

- Datei: `bau/stage/VIDEO/index.html` (VERSION `4.28.0`), Diff: `stage.diff` (`diff -u bau/snapshots/R-4270.html index.html`).
- Basis (ours) = R-4270 (4.27.0, online); gemeinsame Basis der Pakete = R-4261 (4.26.1).
- Zusammengeführt mit `git merge-file -p R-4270 R-4261 <Paket>/index.html`, nacheinander: VV4A → VV4CE → VV4BD → VV4F → VVLOGO.

## Konflikte und Lösungen

| Stelle | Konflikt | Lösung |
|---|---|---|
| `Object.assign(SYNQUENZER, …)` (VV4A, VV4CE, VV4BD) | dieselbe Zeile wie `G6PB_API` aus 4.27.0 | alle Zeilen behalten |
| `vv4Api()` und `const VV4` | VV4CE **und** VV4BD definieren beide (doppelte Top-Level-Namen) | VV4BD umbenannt: `VV4B` (Zustand `st`, Fokus-`log`) und `vv4bdApi()`; VV4CE behält `VV4`/`vv4Api` |
| `VV_DIRV`, `vvDirSame`, `vvDirNorm`, `vvDirOf`, `vvDirTap`, `vvDrawStripe`, `vvCuts` | VV4CE (nur `'mod'`) und VV4BD (alle neuen Werte, `VV4_TRK`) | VV4BD-Fassung (enthält `'mod'`) |
| `vvDirSet` | VV4CE: Modulation nur bei echter Modulation | VV4BD-Fassung **plus** VV4CE-Prüfung `vv4HasMod` |
| `vv4Tracks('mod')` (VV4BD) | Liste zeigte alle Spuren | gefiltert mit `vv4HasMod` (Regel VV4-E: nur echte Modulation) |
| CSS (Bild-Menü / Modulations-Zeile) | beide Pakete an derselben Stelle | beide Zeilen behalten |
| `vvEncodeWC` Warte-Zeile | VV4F (Meter-Fenster) und VV-LOGO (getrimmte Länge) | beide Bedingungen nacheinander |
| `vvMake` | VV4A (`vvAppPrep`) und VV-LOGO (`vvlOutro`) | beides |
| **Platzhalter VV4BD** | `vvDrawApp`, `vvAppFocus`, `vv4AppLay`, `vv4Keys`, `vvDrawRoll`, `vvDrawDrumSeq`, `vvDrawMod` | Platzhalter gelöscht; echte Zeichner aus VV4A / VV4CE. `vvAppFocus` neu auf dem P-Raster von VV4A (428 × 761 pt): Clip-Zelle / Tastatur in der Matrix-Ansicht, Teil-Kopf / Übergang in der Song-Ansicht; der Fokus gibt die Ansicht mit (`{view}`) |
| Zustand beim Zeichnen | VV4BD zeichnet mit dem Zustand des laufenden Jobs (`VV4B.st`), VV4A/VV4CE lasen `VV.last` (letzter Render, kann beim WebCodecs-Weg noch der alte sein) | `vvDrawApp` und `vv4Into` nehmen `VV4B.st`, wenn gesetzt |
| `vvDrawApp` quer | VV4A zeichnet nur hochkant | in 16:9 steht die App mittig, Rand in Hintergrundfarbe |
| `vvDrawApp` ohne Render | Vorschau-Standbild vor dem ersten Render: `VV.last = null` → TypeError (gefunden durch `vv4a-ui`) | behoben (`vvRun({view})` ohne Bereich) |

Doppelte Top-Level-Definitionen: mit acorn je `<script>` geprüft → **0** (auch kein Parse-Fehler).

## Xanders Präzisierung zum Abspann-Logo (umgesetzt, VV-LOGO machte es anders)
- **Luma-Key statt Screen-Blend:** Alpha aus der Helligkeit (hellster Farbkanal, weiche Schwelle 5 … 20 %), am weichen Rand
  ent-vormultipliziert → Farben satt, Rot nicht ausgewaschen. Gemessen: Rot in der Datei (130, 2, 0) → im Video (131, 2, 1).
- **Einmal, mittig**, 60 % der kürzeren Bildseite, nicht gekachelt, kein Kasten, kein Rand.
- **Einblenden ab 50 % Abdunklung:** Abblende 1 s linear; Logo ab 0,5 s nach Song-Ende, 0,5 s Einblenden.
  Videolänge = Song + 0,5 s + Logo + 0,5 s (`res.logo.in` neu).
- **Ton:** die Musik klingt bis < −60 dBFS aus (wie VV-LOGO), der Abspann ist digital still (gemessen −200 dB).

## Testzahlen (gegen `bau/stage/VIDEO/index.html`, Tests unter `tests/<Paket>/`, Start: `sh tests/alle.sh`)

| Paket | Ergebnis |
|---|---|
| VV4A | render WebCodecs 10/10 · render Aufnahme 10/10 · kb-live 3/3 · layout 43/43 · ui 40/40 · layer 2/2 · perf 2/2 (3-min-Song [Ganze App] 2,11× Echtzeit) · alt 2/2 |
| VV4CE | abn 19/19 · mk 6/6 · ui 14/14 |
| VV4BD | regie · menue · layout (7 Formate) · bild: alle „GESAMT GRÜN“, 0 Konsolenfehler |
| VV4F | t-app 24/24 (428×926) · 24/24 (926×428) · t-layout 35/35 · t-video 15/15 (u. a. Bit-Gleichheit mit/ohne Meter) · t-speed 4/4 (3,6× / 3,5× Echtzeit) |
| VVLOGO | Export WebCodecs 16:9 / 9:16 / 1:1 / .mov je 21/21 · Export Aufnahme 16:9 / 9:16 / 1:1 je 21/21 · ui 40/40 · regress 22/22 · cancel 4/4 |
| Ende-zu-Ende `tests/e2e-video.mjs` | WebCodecs **26/26** · Aufnahme-Weg (iPhone-Weg) **26/26** (mit Zeit-Toleranz, siehe unten) |
| Rauchtests | `smoke.mjs` 0 Fehler · `orch-mk-check.mjs` 4.28.0, initAm gleich wie 4.27.0 (rms 0,0705 / peak 0,177) · `v3-mk2-wellen.mjs` OFFEN „Bezug am Bau-Ort fehlt“ (bei R-4270 genauso); der Wellen-Datenblock `/*MKD{*/…/*}MKD*/` ist zeichengleich mit 4.27.0 · `v3-mk8-smoke`, `v3-mk8b-smoke` 0 Fehler |
| Regeln | „MS 2000“ 1× · `  live: true,` 1× · Korg/microKORG/RADIAS/DWGS/Kodamo/Mask1/Nord/„Kompakt“ 0× · keine Netz-/Datenbank-Zugriffe neu (nur das Logo von der eigenen Seite, wie VV-LOGO) |

**Ende-zu-Ende** (Song 8 Takte, 120 BPM: Melodie-Clips Spur 2/3, Drums mit 2 Clips, Teil-Transposition +2 ab Takt 7, STIMME-Take mit
Chor-Gruppe „pop“ v2 (3 Stimmen), echtes Logo 952×952/10 s; je 16:9 und 9:16 [Ganze App], Auto-Regie, Abspann):
Version · Chor-Gruppe v2 · Logo geladen · Video gebaut · Schnittliste mit neuen Bildern (roll+Fokus Zelle, drum) · Piano-Roll im
Video = Zeichner (16 Noten = `clip.notes`) · Drum: Kick/Snare-Wechsel nur bei Treffer, ≤ 1 je Schlag · Pegel im Render und im
Song-Bild · Logo einmal mittig · gekeyt, außen schwarz · Rot satt · Logo schon während des Abdunkelns · Ton da, Abspann still ·
**Chor im Video-Ton** (Differenz mit/ohne Chor −9,6 dB gegen Render-Rauschen −114 dB) · 0 Konsolenfehler.

**Aufnahme-Weg (MediaRecorder, Echtzeit):** im Test-Chromium liegt die Datei-Zeit bis ~0,3 s neben der Zeichen-Zeit (Software-Kodierer;
VV-LOGO hatte dafür schon ±0,2–0,3 s Toleranz), und WebM macht dunkle Flächen reines Schwarz. Die Prüfungen dieses Wegs vergleichen
deshalb mit Zeit- und Helligkeits-Toleranz; die Bildfolge ist per Auge geprüft (Logo erscheint über dem noch sichtbaren Drum-Bild).

## Überholte Erwartungen (Regel 26), angepasst
- VV4A `vv4a-render`: rendert jetzt `view: 'matrix'` – in `auto` zeigt die Auto-Regie 2 (VV4-D) gewollt Piano-Roll / Tastatur statt der App.
- VV4A `vv4a-alt` (Vergleich mit 4.27.0): Auto und Spur-Bild gewollt neu (VV4-D / VV4-C, 20 Bilder); Song/Matrix unterscheiden sich
  nur durch die Pegel-Leiste von VV4-F (14 Bilder, Sichtvergleich `bilder/vergleich-4270-oben-4280-unten-song.png`); Rest pixelgleich.
- VV4CE `vv4ce-ui`: Weg zur Modulation jetzt über das VV4-B-Menü ([Spur …] → [Modulation] → Spur).
- VVLOGO: Länge = Song + 0,5 + Logo + 0,5; „Ecken schwarz“ erst ab 1 s nach Song-Ende (davor liegt gewollt das abdunkelnde Bild);
  Screen-Key-Prüfung gilt jetzt dem Luma-Key; Vergleichsbasis R-4270 statt R-4261.

## Beispielbilder (`bilder/`)
- `e2e-16x9-wc-roll.png`, `e2e-9x16-app-wc-roll.png` – Piano-Roll mit den echten Noten, klingende Note umrandet
- `e2e-16x9-wc-drum.png`, `e2e-9x16-app-wc-drum.png` – Drum-Sequenzer (Kick, Hi-Hat-Zeile)
- `e2e-*-mr-*.png` – dieselben Bilder aus dem Aufnahme-Weg (WebM)
- `e2e-*-logo-ueber-abblende.png` – Logo blendet über dem abdunkelnden letzten Bild ein; `e2e-*-logo.png` – Logo (8 s) mit Rot
- `wahl-<bild>-9x16.png` / `-16x9.png` – App, Tastatur, Fokus Clip-Zelle / Tastatur / Teil-Kopf / Übergang
- `vergleich-4270-oben-4280-unten-song.png` – Song-Bild: einziger Unterschied ist die Pegel-Leiste

## Offene Punkte / Fragen an Xander
1. **iPhone-Prüfung fehlt** (Safari, MediaRecorder-Weg): Tempo, Schärfe, Logo-Zeitpunkt, Pegel in der App (≤ 0,3 ms je Bild).
2. **[Ganze App] und Auto-Regie 2:** in kurzen Songs zeigt die Auto-Regie fast nur Piano-Roll / Drum-Sequenzer (neue Clips), die ganze
   App erst bei einem Teilanfang. Soll [Ganze App] die App öfter zeigen (z. B. Roll/Drum nur als Fokus-Ausschnitt)?
3. **Ausklang:** nach dem letzten Takt zeigt ein Piano-Roll-Schnitt eine leere Rolle („–“), bis das Bild abdunkelt. Soll dort das
   letzte volle Bild stehen bleiben?
4. **„Musik blendet aus“:** heute klingt die Musik natürlich aus (bis −60 dBFS), dann erst dunkelt das Bild ab. Soll die Musik
   stattdessen zusammen mit dem Bild in 1 s ausgeblendet werden?
5. Transposition im Test-Song fiel auf den Takt eines neuen Drum-Clips – der Drum-Sequenzer hatte Vorrang (Regel VV4-D).
6. Alte Fragen der Pakete bleiben offen (siehe deren CHANGES.md): Modusleiste immer TRANSP., `song.xp` als gedrückte Taste,
   Fokus-Länge, Tastatur-Länge, Master-Balken-Ort.

## Für Xanders Funk (sichtbare Änderungen, kurz)
- Pegel-Balken je Spur in Matrix und Song, Master-Balken öffnet MASTER.
- Bild-Menü je Taktbereich: App, Song, Matrix, Spur (Piano-Roll / Drum-Sequenzer / Modulation), Tastatur, Fokus.
- Video: echte Piano-Roll, echter Drum-Sequenzer, echte Modulationen, 9:16 [Ganze App], Pegel im Bild.
- Auto-Regie erkennt Neues: neuer Clip, Drums, Teilanfang, Transposition, Übergang.
- Abspann: dein Logo einmal mittig, ohne Kasten, blendet schon beim Abdunkeln ein; Abspann still.
