# CHANGES – Nachtrag 5, Zweig V (Video) – ab App 4.23.0 (`vs-base-B.html`)

## VV1 — Song-Video (Bild und Ton getrennt) · App 4.25.0 · Format 5 bleibt · keine Server-Änderung

Stand: Zweig `n5-br-V/index.html` ab 4.23.0. **Version 4.25.0** (APP_CODE 4 025 000), **Format bleibt 5** (das Projekt bekommt
kein Feld; die Einstellungen des Blatts stehen im Geräteprofil `uiPrefs().vv = {fmt, view}`). Die CLOUD-Zeile `live: true,` ist
unverändert. **Am Server offen: `max_app ≥ 4025000`** (Wächter steht auf 4 021 000; Xander hebt ihn selbst, kein Supabase-Aufruf).

### Was neu ist
- **Menü → [Video]** (Abschnitt „Projekt“, unter „Song als Audio“) öffnet das Blatt **„Video“** (ganze Fläche wie das Menü;
  hochkant: Bühne oben, Bedienung unten; quer: Bühne links, Bedienung rechts):
  - **Format [9:16] [16:9]** (1080 × 1920 bzw. 1920 × 1080, 30 fps), **Bild [Auto] [Song] [Matrix]**, **Bereich**: die gelbe
    Auswahl, sonst der ganze Song (als Text mit Taktzahl und Länge, z. B. „ganzer Song · 8 Takte · 0:17“).
  - **[▶ Vorschau]**: der Song spielt live ab dem Bereichsanfang, die Bühne im Blatt läuft mit (Bild + Ton in Echtzeit), [■ Stopp],
    ✕ oder das Ende des Bereichs beenden sie.
  - **[Video erstellen]** mit Fortschrittsbalken („Video wird erstellt · 42 %“) und **[Abbrechen]**; danach **[Teilen]**
    (`navigator.share` mit der Datei, im Tipp) und **[Sichern]** (Datei; in der Claude-App über `downloads`, `.mp4`/`.webm` sind dort
    erlaubt) und die Angabe „0:19 · 9:16 · 2,9 MB“. Unter den Knöpfen steht der **gewählte Weg** („Weg: WebCodecs · H.264 + AAC · MP4“
    bzw. „Weg: Aufnahme in Echtzeit · video/mp4“); geht keiner, ist [Video erstellen] grau und dort steht der Grund.
- **Ton = der fertige Song, offline mit derselben Klangerzeugung wie live.** `vvRenderAudio` baut den ganzen Graphen der App
  (Master mit Kompressoren/Begrenzer, Hall-Worklet, Echo, jede Spur mit Drive/Chorus/Pumpen/Sends, die Worklet-Engines VA/FM/MS 2000
  mit ihren Wellen, Drums mit Kit-Bus, STIMME-Takes) in einem `OfflineAudioContext` und spielt den Song mit dem eigenen Scheduler
  (`songPlayStart` + `tick` an `suspend`-Punkten alle 0,25 s, Vorlauf 0,35 s). Dafür wird der Live-Zustand (AU, R, Träger, XP,
  Song-Gedächtnis, Notenlog, Mitschnitt, Takes, Limiter, FANG-Puffer, Pad-Blitze …) vorher herausgenommen und danach unverändert
  zurückgelegt; der Live-Kontext läuft weiter, nichts wird verstellt. Danach der **Ausklang**: bis der Master in Blöcken von 512
  Samples dauerhaft unter −60 dBFS bleibt, höchstens 10 s; das Ende blendet 30 ms aus (bei 10 s: 1 s). Videozeit 0 = Takt 1 des
  Bereichs (hörbar, die Vorausschau der Kompressoren ist abgezogen).
- **Bild = eigene Video-Bühne** (Canvas, in den Farben und Schriften der App, App-Punkte × 3):
  - **Song**: Lineal mit Taktzahlen, Teile als gelbe Kopfzeilen (Name, laufende Position „3/4“), die Spuren mit den Slots je Takt
    (Startetakt kräftig, eigene Clips weiß umrandet), AKKORDE- und MELODIE-Zeile, grünes Laufband; das Bild läuft mit
    (Laufband bei 35 % der Breite). 16:9 wie die App quer, 9:16 wie die App hochkant.
  - **Matrix**: Spuren × Szenen (die Bank mit den spielenden Clips), spielende Clips grün umrandet und im Takt leuchtend, in jeder
    Zelle die Noten als kleine Rolle, in spielenden Clips mit Positionsstrich (STIMME: die Welle).
  - Welche Clips spielen, kommt aus `R.slot`, wie der Scheduler es beim Offline-Durchlauf gesetzt hat (Zeitstrahl `tl`).
- **Kodierung:** WebCodecs `VideoEncoder` H.264 (High 4.0, 5 Mbit/s, Schlüsselbild alle 2 s) + `AudioEncoder` AAC-LC 192 kbit/s
  in MP4 über einen **eigenen kleinen Muxer** (`VVMP4`, ~70 Zeilen, keine fremde Bibliothek: moov vor mdat, 1-s-Verschachtelung,
  ctts + Edit-Liste falls der Kodierer Bilder umsortiert, Edit-Liste für AAC-Vorlauf). Die Bilder laufen **gleichzeitig** mit dem
  Offline-Ton (jedes Bild, sobald der Ton bis dorthin gerechnet ist), werden einzeln gezeichnet, kodiert und sofort freigegeben
  (nie alle im Speicher); der Hauptfaden gibt alle ~12 ms ab. **Rückfall:** fehlt `VideoEncoder`/`AudioEncoder` oder AAC → der
  Offline-Ton wird mit der Bühne in Echtzeit über `MediaRecorder` aufgenommen (Typwahl wie VC2c: `video/mp4;codecs=avc1,mp4a`,
  `video/webm;codecs=vp8,opus`, `video/mp4`), 30 Bilder/s per `requestFrame`.
- Test-API: `vvOpen/vvClose/vvInfo/vvPath/vvPrefs/vvRender/vvPcm/vvMake/vvBlob/vvCancel/vvGo/vvPreview/vvStateAt/vvMatrixCells/vvMux`,
  `vvTest({noVE, noAE, noAAC, noMR, opus, step})` (nur für Tests: Wege abschalten bzw. Opus statt AAC erlauben).

### Abnahme
Alle Läufe in Chromium (Playwright, headless, 4 vCPU; Last-Mittel 5,5–8,9, weil die Geschwister-Zweige gleichzeitig testen), Skripte
in `dirigent-test/`, Ausgaben in `dirigent-test/n5-v-out/`. Test-Song = Demo-Clips als Song (8 Takte, „Strophe“ + „Refrain“, 112 BPM;
für VV1-03 mit einem 2-s-Take auf der STIMME-Spur ab Takt 3).

| ID | Ergebnis | Messung / Skript |
|---|---|---|
| VV1-01 | **bestanden** (Hauptweg) | `n5-v-a1.mjs`: 16:9 → MP4 1920×1080, `r_frame_rate` 30/1, h264 + Tonspur, Datei 19,50 s, Bild 19,47 s, Ton 19,50 s, Soll 19,47 s (17,14 s Song + 2,33 s Ausklang); 9:16 → 1080×1920, sonst gleich. ffprobe liest beide (mov/mp4). Hier mit Opus (Test-Schalter, s. Abweichungen); der AAC-Zweig des Muxers: `n5-v-aacmux.mjs` (AAC-LC von ffmpeg → `VVMP4`) → ffprobe aac/LC/48 kHz/2 ch, 3,029 s = 142 × 1024 / 48000, dekodiert ohne Fehler. Rückfall: webm vp8/opus 1080×1920, dekodiert 11,42 s gegen Soll 11,30 s (+0,12 s, s. Abweichungen). |
| VV1-02 | **bestanden** | `n5-v-a1.mjs` (Hall 6 s, Echo-Rückkopplung 0,55, alle Sends hoch): Ausklang 4,98 s (≤ 10 s, nicht gekappt), Spitze am Song-Ende −12,6 dBFS, Spitze der letzten 60 ms −59,9 dBFS, Ende mit 30-ms-Blende – kein harter Schnitt. |
| VV1-03 | **bestanden** | `n5-v-a3.mjs`, Lautheit BS.1770 (`n5-v-lufs.mjs`), Echtzeit = Mitschnitt am Master: Song live −14,34 LUFS, offline −14,36 (Δ −0,02 LU); Noten: 254 = 254, gleich (Spur, Ton, Schlag, Stärke). Je Spur solo (Takte 3–6): Synth 1 −0,09, Synth 2 −0,09, Synth 3 +0,12, Drums +0,19, **STIMME-Take** +0,08 LU, alle hörbar (−15,5 … −21,7 LUFS). |
| VV1-04 | **bestanden** | `n5-v-a4.mjs` (Bilder aus dem MP4 per ffmpeg): Laufband an Taktanfang und Taktmitte von 8 Takten (16 Proben), größte Abweichung 0,67 Bild (2,24 px je Bild). Matrix 9:16: in 8/8 Takten sind genau die Zellen grün umrandet, die bei einem Live-Lauf desselben Songs `R.slot`/`visualSlots` zeigen. |
| VV1-05 | **teilweise** | `n5-v-a5.mjs`, 3-min-Song (84 Takte = 180 s, Video 182,6 s), 9:16, WebCodecs: **105,7 s → 1,73 × schneller als Echtzeit** (Ton offline 69,0 s, gleichzeitig mit den Bildern). Lange Tasks > 50 ms: 28, davon 24 im Kodier-Häppchen eines Bildes (`VideoFrame` aus der Bühne + `encode`, im Mittel 12,2 ms, Spitzen bis 174 ms unter Last), **4 außerhalb: 1 × 69 ms am Ende des Offline-Tons, 3 × 59–73 ms ohne Zuordnung** (vermutlich Speicherbereinigung). Scheduler-Schritte ≤ 19 ms, Graph-Aufbau 37 ms, MP4 in 4-MB-Stücken (kein langer Task). Abbrechen: während der Bilder 7 ms, während des Offline-Tons 25 ms; danach Live-Kontext, Takt-Timer und ein neuer Render wieder da. |
| VV1-06 | **bestanden** (s. Abweichung „bitgleich“) | `n5-v-a3.mjs`: `serialize()` vor/nach einem ganzen Video-Auftrag zeichengleich; alle Live-Knoten (Kontext, Master, Hall, Echo, Kit, Spuren, Engines) dieselben Objekte; `E.sent` aller Engines gleich; Live-Wiedergabe vorher/nachher: 254 = 254 gleiche Noten, −14,34 / −14,33 LUFS. |
| VV1-07 | **bestanden** | `n5-v-a7.mjs` mit der echten App-Schrift (Barlow/JetBrains Mono aus `fonts/`): P1, P2, P3, L1, L2, 926×428 je ruhend / beim Erstellen / fertig: 0 Knöpfe < 44 × 44, nichts abgeschnitten oder außerhalb, keine Seitenüberlänge, Lage aller Zeilen und der Bühne in allen drei Zuständen gleich (kein Layout-Sprung). ▶ Vorschau spielt (Song läuft, Bild läuft mit), ■ stoppt. |
| VV1-08 | **bestanden** | `n5-v-a1.mjs`: ohne `VideoEncoder` → Weg „Aufnahme in Echtzeit · video/webm“ (Typ `video/webm;codecs=vp8,opus`, Reihenfolge wie VC2c), Datei mit vp8 + opus; ohne beides → [Video erstellen] grau, Zeile „Video hier nicht möglich (kein Video-Kodierer im Browser)“. |

Weitere Läufe: `smoke.mjs` ohne Fehler; `gmk8b-reg.mjs` (APP = dieser Zweig: Clip aufnehmen, FANG TEIL, Szenen, Song, Transponieren,
MS 2000, Speichern → Laden deep-equal, Layout) ALL PASS; Konsole in allen VV1-Läufen ohne Fehler; keine Marken-Wörter neu (MS 2000
weiter nur über `MK_LABEL`), Szenen-▶ auf der Bühne als gezeichnetes Dreieck.

### Abweichungen
- **Kein AAC-Kodierer in diesem Chromium** (`AudioEncoder.isConfigSupported('mp4a.40.2')` = false; H.264 ja). Die App nimmt
  WebCodecs nur mit AAC, sonst den Rückfall – wie die Spec. Damit VV1-01/04/05 den WebCodecs-Weg messen, erlaubt der Test-Schalter
  `vvTest({opus: true})` Opus in MP4 (dOps); der AAC-Zweig des Muxers ist mit ffmpeg-AAC geprüft (s. VV1-01). Ob Safari am iPhone
  AAC per WebCodecs kann, zeigt die Weg-Zeile im Blatt (iPhone-Prüfpunkt).
- **„Auto“** zeigt bis zum Auto-Regisseur (VV2, nächstes Paket in diesem Zweig) das Song-Bild.
- **Rückfall in Echtzeit, hier gemessen:** Dauer +0,12 s (Stopp-Verzug des Recorders; der Hauptweg hält ±0,1 s) und der VP8-Software-
  Kodierer lässt bei 1080×1920 unter Last Bilder aus (189 Pakete in 11,3 s im Matrix-Bild; beim mitlaufenden Song-Bild weniger).
  Am iPhone nimmt Safari mp4 mit dem Hardware-Kodierer auf.
- **VV1-05 lange Tasks:** 4 Tasks zu 59–73 ms außerhalb der Kodier-Häppchen (oben); die Bild-Häppchen selbst haben unter Last Spitzen
  bis 174 ms (Auslesen der Bühne für `VideoFrame`).
- **„Bitgleich“ (VV1-06)** ist bei einer Echtzeit-Wiedergabe nicht messbar (Startzeit gegen den Audio-Block, Rauschquellen); geprüft
  wurde stattdessen: gleiche Knoten, gleiche Engine-Werte, gleiche Noten, gleiche Lautheit (±0,01 LU). Zwei Offline-Renders sind
  ebenfalls nicht bitgleich (Zufalls-Rauschen der Engines), ihre Lautheit schon.
- **Wiedergabe beim Erstellen:** läuft beim Tipp auf [Video erstellen] der Song, wird er angehalten (der Offline-Durchlauf braucht den
  Transport); ✕ während des Erstellens bricht ab.
- Die App-Ansicht selbst wird während des Offline-Tons nicht neu gezeichnet (`uiFrame` wartet, das Blatt deckt sie ab).

### Fragen an Xander
1. Ist live der CPU-Begrenzer aktiv (Anzeige „CPU 1–3“), rechnet das Video heute **wie live** (gleiche Stufe). Soll das Video immer in
   voller Qualität gerechnet werden (offline gibt es keine Aussetzer)?
2. Bereich: Gibt es eine gelbe Auswahl, nimmt das Video **nur die Auswahl**. Möchtest du im Blatt eine Wahl [Ganzer Song] [Auswahl]?
3. Im Song-Bild wird der Teil-Name am linken Rand beim Mitlaufen abgeschnitten (wie in der App). Soll er im Video stehen bleiben, bis
   der Teil vorbei ist?

### iPhone (Xander)
1. Safari (GitHub Pages): Menü → [Video]. Welche **Weg-Zeile** steht unten? („WebCodecs · H.264 + AAC · MP4“ oder „Aufnahme in Echtzeit · …“)
2. 9:16, Bild „Song“, [Video erstellen] bei einem echten Song mit Gesang: Fortschritt läuft, die App reagiert, kein Knacken im Video;
   danach [Teilen] → „Video sichern“ in Fotos und einmal in TikTok/Instagram öffnen. Ton = wie live, Ausklang am Ende, Laufband synchron.
3. 16:9 + „Matrix“ ebenso; [Abbrechen] mitten drin → Blatt ist sofort wieder bedienbar, ▶ in der App spielt normal.
4. [▶ Vorschau] → Song mit Bild im Blatt, [■ Stopp]. Blatt in hochkant und quer: alles im Bild, alle Knöpfe gut treffbar.
5. In der Claude-App: [Sichern] speichert die .mp4 (bzw. .webm).

### Für das Zusammenführen
- **Neuer Block** (zusammenhängend) direkt vor `const SYNQUENZER = {`: von „VV1 (Nachtrag 5): Song-Video“ bis `/* VV1-END */`
  (`VV`, `vvPrefs`, `vvSnap/vvRest`, `vvAddModule`, `vvRange`, `vvTakesReady`, `vvSwapIn/vvSwapOut`, `vvRenderAudio`, Bühne
  `vvCols/vvClip/vvRows/vvRoll/vvDrawSong/vvMatrixLayout/vvDrawMatrix/vvDraw/vvStateAt/vvLiveState/vvViewOf`, Muxer `VVMP4`,
  `vvPath/vvMrType/vvYield/vvEncodeWC/vvEncodeMR/vvMake/vvFileName/vvDeliver`, Blatt `vvMenuRow/vvOpen/vvClose/vvFit/vvStill/vvSync/
  vvPrevStart/vvPrevStop/vvGo`, `vvApi`).
- **Einzeilige Haken:** `uiFrame` (1. Zeile `if (UI.vvOff) return;`), `toast` (1. Zeile), `ensureAudio` (1. Zeile `return AU.ctx`),
  `openMenu` (`vvMenuRow(s1, row, btn);` nach „Song als Audio“), Test-API (`Object.assign(SYNQUENZER, vvApi());` vor `const NO_SYNC`).
- **CSS-Block** „VV1 (Nachtrag 5): Blatt Video“ direkt nach `#menu.open{display:flex}`.
- `VERSION` 4.23.0 → 4.25.0. Keine Änderung an Format, Speichern/Laden, Engines, Worklet oder Server.
- Der Offline-Durchlauf nimmt den Live-Zustand je Objekt heraus (`vvSwapIn`: AU, R, T, XP, MEM, LOG, PERF, TK, CAP, LIM, MEL, TICKERR,
  SONGCAR, WKSET, VOICES, HITS, CLICKS, RECENT, PADQ, `SV.lastStop`, `S.song.loop`, `WAVES_T`). **Kommt in einem anderen Zweig neuer
  Zustand dazu, den der Transport ändert (z. B. Nachtrag 4: Auto-Pegel der Stimme), gehört er beim Zusammenführen in diese Liste.**
