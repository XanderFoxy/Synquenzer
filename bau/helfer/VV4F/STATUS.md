# STATUS VV4-F „Mäusekino“

**Stand:** fertig gebaut, alle Tests grün. **Xanders Okay fehlt noch** (Blick am iPhone 12 Pro Max).

## Testzahlen (Playwright + Chromium, `sh tests/alle.sh`)

| Test | Ergebnis | Inhalt |
|---|---|---|
| `t-app.mjs` 428×926 | **24/24** | Sinus −6 dBFS → −6,02 dB (VV4-11), RMS −9,03 dB, andere Spuren leer · LED an bei −0,1 dBFS, aus bei −0,5 dBFS · Spitzenhalten 1,526 s (Soll 1,5 ±0,1) · Spur stumm → 0, andere spielen weiter · keine Langaufgabe ≥ 50 ms in 6 s Spielen · Meter-Arbeit 0,09 ms je Bild (Soll ≤ 0,3) · keine verlorenen Fenster · CPU-Stufe 2 → aus (0 Nachrichten, 0 Bild-Arbeit, Balken leer), Stufe 0 → wieder an · Seite verdeckt → aus · Tipp Master → MASTER-Seite (Matrix und Song) · Spurname im Song wählt weiter · SONG ⇄ schaltet weiter · 0 Konsolenfehler |
| `t-app.mjs` 926×428 | **24/24** | dasselbe quer |
| `t-layout.mjs` | **35/35** | 428×926, 926×428, 390×844, 844×390, 375×667, 667×375, 320×568, je Matrix und Song: alle Rechtecke gleich wie die Basis, Seitenhöhe gleich, kein Name stärker gekürzt, jeder Balken in seiner Zelle und über keinem Text, 0 Konsolenfehler |
| `t-video.mjs` | **15/15** | Bit-Gleichheit mit/ohne Meter (siehe unten) · Meter-Fenster im Song-Render vollständig (9515/9515 Blöcke, 0 verloren) · **VV4-12** Master-Balken = Offline-RMS je Bild, größte Abweichung 0,9 dB über 24 Bilder (Soll ±1) · Spur 3 setzt im Video bei 4,333 s ein (Soll 4,286 s; das ist das erste Bild danach) · leere Spur bleibt leer · Song- und Matrix-Bild in 16:9 und 9:16 zeigen Balken · **fertiges MP4**: Song- und Matrix-Bild zeigen die Balken · 0 Konsolenfehler |
| `t-speed.mjs` | **4/4** | Video ≥ 1,5× Echtzeit (16:9: 2,8×, 9:16: 2,4×) · `vvDrawMeters` 0,04 ms je Bild · 0 Konsolenfehler |
| **Summe** | **102/102** | `bilder/testlauf.txt` |

Rauchtests `bau/tests/`, je gegen Basis und neu:

- `smoke.mjs`, `v3-mk8-smoke.mjs`, `v3-mk8b-smoke.mjs`, `v3-qa-mk5reg-smoke.mjs`: 0 Fehler, wie die Basis.
- `v3-qmkp-smoke.mjs` (8 Größen): Maße und Rahmen gleich wie die Basis, 0 Fehler.
- `n5-v-vv2-01.mjs`: alle ok, wie die Basis.
- `n5-v-vv2-02.mjs`: lief nicht, weil die Vergleichsdatei `n5-v-pre-vv2.html` hier fehlt. Bei der Basis ist es genauso.

Regeln:

- Gleiche Anzahl wie in der Basis:
  - „MS 2000“: 1×
  - `  live: true,`: 1×
  - `VERSION = '4.26.1'`: 1×
  - Korg, microKORG, RADIAS, DWGS, Mask1, Kompakt: 0×
- Keine neuen Netzzugriffe.
- Keine Emojis.
- Der Worklet-Text ist ASCII.

## Bit-Gleichheit (Regel 28)

- **Am App-Graphen geprüft:** Der echte Offline-Graph aus `vvSwapIn` wurde mit festen Quellen gerendert. Dazu gehören Master mit Kompressoren, Begrenzer und Decke, die Spurketten, das Hall-Worklet, das Echo und die Synth-Knoten.
  - **Zwei Spuren laut**, der Begrenzer arbeitet: **mit und ohne Meter bit-gleich**, 0 abweichende Werte.
  - **Alle Spuren mit Hall und Echo:** Mit/ohne Meter liegt nicht weiter auseinander als zwei Läufe ohne Meter, nämlich −106 … −112 dB.
- **Warum nicht der ganze Song:** Der Song-Render ist schon in R-4261 nicht reproduzierbar, auch ohne Meter.
  - Ursachen: Zufall im Klang und Zustand von Render zu Render (`tests/nachweis-render-basis.mjs`).
  - Dazu summiert Chromium ab 3 klingenden Eingängen in wechselnder Reihenfolge (`tests/nachweis-summe-chromium.mjs`).
  - Der stumme Meter-Ausgang ist eine exakte Null und ändert keine Summe.

## Bildschirmfotos (`bilder/`)

- App vorher: `basis-matrix-428x926.png`, `basis-song-428x926.png`
- App mit Pegel beim Spielen: `live-matrix-428x926.png`, `live-song-428x926.png`, quer `live-matrix-926x428.png`, `live-song-926x428.png`
- Tipp auf Master: `app-master-seite-428x926.png`
- Video-Bilder: `video-song16x9.png`, `video-matrix16x9.png`, `video-song9x16.png`, `video-matrix9x16.png`
- Aus dem fertigen MP4: `mp4-song.png`, `mp4-matrix.png`

## Nicht hier prüfbar

- **iPhone (Safari/WebKit):** Hauptthread ≤ 0,3 ms je Bild mit perfProbe, das Gefühl beim Tippen, WebKit-Verhalten des Meter-Knotens.
- **Bitte prüfen**, am besten am iPhone:
  1. Demo-Szene spielen: Bewegen sich die Balken je Spur im Takt?
  2. Spur stumm: Bleibt ihr Balken leer?
  3. Tipp auf den Master-Balken (Matrix: linker Rand von „SONG ⇄“, Song: neben „TAKT“): Geht die MASTER-Seite auf?
  4. Ein Video im Song: Sind die Balken in der Namen-Spalte zu sehen?
- Offene Fragen: siehe `CHANGES.md` → „Fragen an Xander“.
