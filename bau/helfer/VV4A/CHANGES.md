# VV4-A „Ganze App hochkant“ (9:16) – Änderungen

Basis: `bau/snapshots/R-4261.html` (App 4.26.1). VERSION unverändert. Nur das Video ändert sich, nicht die App.

## Neu
- **Video-Blatt, Zeile „9:16“:** neben [Kamera] und [Ganz mit Balken] die dritte Wahl **[Ganze App]** (Geräte-Profil `uiPrefs().vv.cam = 'app'`, wie die anderen beiden).
- **Bild 1080 × 1920 ohne Balken** aus dem P-Raster der App (428 × 761 pt, ×2,523). Gezeigt:
  Kopf · Matrix **oder** Song (je nach Regie-Schnitt) · Teil-Leiste · Spur-Zeile · Träger-Zeile · Modusleiste · Tastatur.
  Maße aus `getBoundingClientRect` der App bei 428 × 761 (Tabelle `VV4A_L` / `VV4A_R`, Test ±2 pt).
- **Gezeichnet im Look der App** (Canvas, Offline-Render, kein DOM-Bildschirmfoto): Farben/Schriften aus dem CSS, Logo aus `LOGO_SVG`.
  ▶ ■ ● sowie Schloss und Mikrofon sind gezeichnete Formen (kein Emoji).
- **Bewegt wird nur durch echte Daten:** Songschlag (Takt-Anzeige, Schlag-LEDs, Laufband im Song), spielende Clips (grüner Rahmen,
  Fortschritts-Strich, „1/2“), `song.carrier` (Träger-Anzeige: Name, Verschiebung, „→ Ziel-Tonart“, gedrückte Tasten),
  `song.xp` (gedrückte Taste der Teil-Transposition), Tonart der spielenden Szene (helle Stufen), Noten des Offline-Durchlaufs
  (farbige Geister-Punkte auf den Tasten, wie `paintGhosts`). Keine Regler, keine Deko-Bewegung.
- **Tastatur:** TRANSPONIEREN-Look der App (die Tastatur zeigt dort Tonart und Träger): Tonart-Stufen hell, Töne außerhalb gedämpft,
  Träger-Tasten gedrückt (genau wie die App: nur was im sichtbaren Bereich liegt), Grundton-Punkt, C-Beschriftung, „STUMM · TRÄGER“.
  Bereich wie die App: 11 weiße Tasten ab `12·(R.trOct+1)`.
- **Zeichenfunktion für spätere Pakete:** `vvDrawApp(g, t, rect, o?)` – t = Videozeit im letzten Render, rect in Pixeln,
  `o.view` = 'auto' | 'song' | 'matrix'. Gibt `{sb, v, kb: {pressed, lit}}` zurück.
- **Regie:** Auto-Schnitt wie bisher (`vvCuts`), Blende 300 ms wie bisher; ein Spur-Schnitt zeigt in [Ganze App] die Matrix
  (die App hat an dieser Stelle kein Spur-Bild).
- **Test-Schnittstelle:** `SYNQUENZER.vvAppLayout()`, `vvAppMatrix(t)`, `vvAppKb(t)`, `vvAppKbAtBeat(sb)`, `vvAppProbe()` (Sonde §2.1.4),
  `vvAppPrep()`, `vvDrawAppPng(t, w, h, view)`.

## Unverändert
- 16:9, 9:16 [Kamera], 9:16 [Ganz mit Balken], Spur-Bild: pixelgleich zur Basis (36 Bilder verglichen).
- Beide Kodierwege: WebCodecs und MediaRecorder-Echtzeit (iPhone ohne AudioEncoder) – beide mit [Ganze App] getestet, Ton vorhanden.
- Marken-Regel: keine neuen Namen; „MS 2000“ 1×; `  live: true,` 1×; keine Netzzugriffe; keine Datenbank.

## Eingriffe in alten Code (nur Haken, `patch.diff`)
- `vvPrefs()`: `cam` kennt zusätzlich `'app'`.
- `vvOpen()`: `segC` mit dritter Wahl; lädt beim Wählen das Logo.
- `vvStill()`: lädt bei [Ganze App] einmal das Logo und zeichnet dann neu.
- `vvDrawShot()`: neuer Zweig `rt.cam === 'app'` (nur hochkant; 16:9 unberührt).
- `vvMake()`: wartet bei [Ganze App] auf das Logo vor dem ersten Bild.
- `SYNQUENZER`: + `vv4aApi()`.

## Fragen an Xander
1. **Teil-Transposition (`song.xp`) als gedrückte Taste:** Die App zeigt `song.xp` heute auf der Tastatur gar nicht an.
   Im Video ist sie wie gewünscht „gedrückt“: die Taste Tonart-Grundton + Halbtöne in der ersten Oktave der Tastatur
   (z. B. C-Dur, +2 → D). So richtig?
2. **Modusleiste:** Im Video steht immer **TRANSP.** aktiv (weil die Tastatur Tonart + Transposition zeigt – das ist der
   TRANSPONIEREN-Look der App). Soll stattdessen der Modus erscheinen, in dem die App gerade ist?
3. **Song-Ansicht:** Im Song blendet die App die Teil-Leiste aus (die Teile stehen als gelbe Köpfe im Song) – das Video macht es
   genauso. Oder soll die Teil-Leiste auch im Song-Bild sichtbar sein (gibt es so in der App nicht)?
4. **VV4-04 „bei 428 × 926“:** Das 9:16-Bild ist 428 × 761 pt (Safari-Sichtfläche). Bei 428 × 926 ist die App 165 pt höher
   (Matrix größer) und passt nicht in 9:16 ohne Balken. Gemessen und abgenommen wird deshalb bei 428 × 761 (alle 43 Lagen ±2 pt).
5. Spur-Schnitt der Auto-Regie zeigt in [Ganze App] die Matrix. Später (VV4-B/C) evtl. Piano-Roll im Matrix-Bereich?
