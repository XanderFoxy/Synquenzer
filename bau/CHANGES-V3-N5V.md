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

## VV1-fix

Stand: Zweig `n5-br-V/index.html`, **Version bleibt 4.25.0** (APP_CODE 4 025 000), Format 5, CLOUD-Zeile `live: true,` unverändert,
kein Supabase-Aufruf (**am Server offen: `max_app ≥ 4025000`**). Alle sechs gemeldeten Fehler ließen sich nachstellen und sind behoben.

### Was neu ist (behoben)
1. **Tasten unter dem Blatt „Video“** (Leertaste stoppte den Offline-Song → Video ab ~4 s stumm; Notentaste spielte eine Note ins
   Video; Esc schloss das Blatt nicht; Leertaste startete die Wiedergabe unter dem offenen Blatt): Ist das Blatt offen (oder läuft der
   Offline-Durchlauf), sperrt `onKeyDown` die Tastenkürzel wie beim Menü; **Esc schließt das Blatt** (§10.5; während des Erstellens
   bricht es ab wie ✕). Zusätzlich erreicht während des Offline-Durchlaufs **keine gespielte Note** (Tastatur, MIDI) den Offline-Ton
   (`inputDown`).
2. **VV1-05 lange Tasks:** Der Graph-Aufbau (`vvSwapIn`) läuft jetzt **in Häppchen** (Master/Hall, Echo, je Spur eine, Engines) mit
   `vvYield` dazwischen; der Live-Zustand steht ab dem ersten Häppchen in `off.sv` (Abbruch oder Fehler dazwischen legt ihn zurück).
   Die Suche nach dem Ende des Ausklangs (`trim`) gibt nach je ~1 s Ton ab. `vvYield` ist jetzt eine **Warteschlange** (vorher
   überschrieb ein zweiter gleichzeitiger Aufruf den ersten – mit den neuen Häppchen hätte das den Auftrag hängen lassen).
3. **Regel 27:** „Bereich“ zeigt nur noch **„ganzer Song“** bzw. **„gelbe Auswahl“** (ohne Taktzahl/Länge); die Ergebniszeile
   „0:04 · 9:16 · 0,5 MB (· WebM)“ ist entfernt. Nach dem Erstellen: [Teilen] [Sichern] und die Weg-Zeile (wie die Definition).
4. **Matrix-Bild, Szenen aus verschiedenen Bänken (VV1-04):** Die Bank richtet sich nach allen spielenden Clips: liegen sie in einer
   Bank, bleibt es diese Bank (4 Spalten hochkant, 6 quer); passen sie in ein Fenster dieser Breite, wird das Fenster verschoben;
   liegen sie weiter auseinander, zeigt das Bild **alle Szenen von der niedrigsten bis zur höchsten spielenden** (die Spalten werden
   schmaler). Kein spielender Clip fehlt mehr.
5. **Metronom nicht im Video:** `click()` tut während des Offline-Durchlaufs nichts (`UI.vvOff`). Das Video enthält den fertigen Song
   ohne Übungs-Klick; die Metronom-Einstellung bleibt unverändert.
6. **Bildschirm und Seitenwechsel:** `vvMake` hält die Bildschirmsperre für den **ganzen Auftrag** (`wakeAcquire` am Anfang, nach
   dem Wiedersichtbarwerden erneut; `wakeReleaseLater` gibt nicht frei, solange `VV.busy`). Rückfall „Aufnahme in Echtzeit“: wird die
   Seite verborgen (Sperre, App-Wechsel) oder läuft der Kontext nicht, **pausieren Aufnahme und Ton gemeinsam** (`mr.pause()` +
   `ctx.suspend()`), so dass keine Lücke in der Datei entsteht; ist die Seite wieder sichtbar, wird der Kontext fortgesetzt (alle
   0,5 s versucht; am iPhone notfalls mit dem nächsten Tipp irgendwo aufs Blatt) und die Aufnahme läuft weiter bis zum Ende.

### Abnahme (Nachweis je Fehler, danach die berührten VV1-Punkte)
Chromium headless, 4 vCPU; **Last-Mittel 3–20** (die Geschwister-Zweige testen gleichzeitig) – Wandzeiten sind dadurch verrauscht.

| ID | Ergebnis | Messung / Skript |
|---|---|---|
| Fehler 1 Leertaste | **behoben** | `n5-v-abn-10b.mjs` (2 Läufe): Leertaste bei 4,17 s gerechnetem Ton → Video 19,474 s, Ausklang 2,331 s (wie ohne Taste); Pegel je Sekunde −16 … −23 dB bis zum Ende, −31/−52 im Ausklang (vorher ab 5 s Stille). |
| Fehler 1 Notentaste | **behoben** | `n5-v-abn-10c.mjs` (2 Läufe): Taste A bei 1,9 s in den stillen Takten 1–4 → erste 8 s alle −120 dB (vorher −28/−47 dB). |
| Fehler 1 Esc/Leertaste ruhend | **behoben** | `n5-v-abn-10d.mjs` (2 Läufe): Esc schließt das Blatt (`VV.open` false, Blatt `display:none`); `n5-v-fx-keys.mjs`: bei offenem Blatt Leertaste, A, M → keine Wiedergabe, keine Stimme, Metronom unverändert; Esc schließt; danach startet die Leertaste die Wiedergabe wie gewohnt. |
| Fehler 2 / VV1-05 | **bestanden nach CPU-Zeit** (Wandzeit unter Last s. Abweichungen) | `n5-v-abn-05.mjs fx1` (Last 8,4–8,9): 182,6 s Video in 114,7 s = **1,59 × schneller als Echtzeit**; Häppchen: swapIn max 19 ms (10 Stück), trim max 11 ms (7), Scheduler-Schritt max 24 ms; 3 Tasks 54–68 ms Wandzeit ohne jedes App-Häppchen darin. `n5-v-fx-05t.mjs` (Chrome-Trace, Last 6,4→11,2): **0 Tasks mit > 50 ms CPU-Zeit** (größter 44 ms CPU, am Auftragsbeginn). `n5-v-abn-05r.mjs fx` (nur Ton, Last 10→14): swapIn 15 ms, trim 28 ms (vorher 66 bzw. 35–76 ms). `n5-v-fx-swap.mjs` (8 Takte, ruhiger): Häppchen-Kosten je Stufe ≤ 15 ms (Drums-Spur). Abbrechen: `n5-v-abn-05c.mjs` 195 ms / 130 ms Tipp → Blatt frei. |
| Fehler 3 / Regel 27 | **behoben** | `n5-v-abn-07.mjs fx`: Texte im Blatt (P1 … W) „Bereich · ganzer Song“, mit Auswahl „gelbe Auswahl“, nach dem Erstellen keine Ergebniszeile. |
| Fehler 4 / VV1-04 Matrix | **behoben** | `n5-v-qm-bank.mjs`, `n5-v-qm-bank2.mjs` FMT=9:16 und 16:9: bei 1 s spielen T1:S1, T2:S6, T5:S1 → gezeigt Szenen 1–6, fehlend: keine; bei 5,5 s (+T3:S7) Szenen 1–7, fehlend: keine. Bild: `dirigent-test/n5-v-fx-bank-916.png` (Köpfe „▶ 1 … ▶ 7“ lesbar, nichts abgeschnitten). |
| Fehler 5 Metronom | **behoben** | `n5-v-qm-metro.mjs`: Metronom an → 0 Klicks im Render-Log, Ton auf den Schlägen −46,6 … −59,9 dB, **identisch** mit Metronom aus (vorher −32,8 … −34,8 dB). |
| Fehler 6 Bildschirm | **behoben** | `n5-v-qm-wake2.mjs` BARS=36: alle 5 s „awake“ vom Tipp bis zum Ende (105 s, Rückfall-Weg). |
| Fehler 6 verborgen | **behoben** | `n5-v-qm-wake.mjs` BARS=36 WAITMS=150000: 35 s verborgen bei 27 % → pausiert (Fortschritt steht), Bildschirmsperre bleibt; wieder sichtbar → fertig nach 80,8 s ohne Tipp, Datei 79,86 s gegen Soll 79,89 s, **keine stillen halben Sekunden** im Ton. |
| VV1-01 | bestanden | `n5-v-abn-01.mjs fx`: 16:9 und 9:16 je 1920×1080 / 1080×1920, 30/1, 584 Bilder, Bild 19,467 s, Ton 19,50 s, Soll 19,474 s; dekodiert ohne Fehler. Rückfall webm vp8/opus vorhanden (unter Last 16–18 nur ~22 Bilder – gleich mit der Fassung VV1.html unter derselben Last, s. Abweichungen VV1). |
| VV1-03 | bestanden | `n5-v-a3.mjs`: Song live −14,34 / offline −14,36 LUFS, Noten 254 = 254 gleich; solo Synth 1 −0,10, Synth 2 −0,11, Synth 3 −0,05, Drums +0,18, Stimme-Take +0,08 LU. |
| VV1-04 | bestanden | `n5-v-abn-04.mjs fx`: Laufband an Takt 2 und 6 je ±0,007 Schläge zum Soll (< 1 Bild). Die Zeile „matrixRange“ dieses Skripts erwartet Slot 2 auf Synth 1, wo die Demo keinen Clip hat (R.slot = −1) – gleiches Ergebnis mit `synq-snapshots/VV1.html`, kein Fehler des Bildes. |
| VV1-06 | bestanden (Projekt/Knoten/Werte) | `n5-v-abn-06.mjs fx`: Projekt unverändert, Unterschiede nur Laufzeit-Messwerte (LIM.load, WAKE, SYNC-Schnappschuss, Engine-Last) – dieselben wie vor dem Fix. `n5-v-a3.mjs`/`n5-v-fx-06.mjs` (3 Läufe): Projekt gleich, alle Live-Knoten dieselben, Engine-Werte gleich, Takt-Timer da, Live-Lautheit vor/nach −14,34 / −14,34 LUFS; Notenvergleich s. Abweichungen (gleich wie vor dem Fix). |
| VV1-07 | bestanden | `n5-v-abn-07.mjs fx`: P1, P2, P3, L1, L2, 926×428 je ruhend / beim Erstellen / fertig / Vorschau: 0 Knöpfe < 44 × 44, nichts abgeschnitten, keine Seitenüberlänge, Layout-Sprung: keiner. |
| VV1-08 | bestanden | `n5-v-abn-01.mjs fx`: ohne `VideoEncoder` Weg „Aufnahme in Echtzeit · video/webm“; ohne beides Knopf grau mit Grund. |

Weitere Läufe: `smoke.mjs` ohne Fehler; `gmk8b-reg.mjs` (APP = dieser Zweig) **ALL PASS**; Konsole in allen Läufen ohne Fehler.

### Abweichungen
- **VV1-05 unter Last:** Bei Last-Mittel 10–14 (4 vCPU, Geschwister-Tests) gibt es noch einzelne Tasks 50–90 ms **Wandzeit**, darunter
  einzelne Scheduler-Schritte (bis 77 ms Wand). Im Chrome-Trace hat kein Task > 50 ms **CPU-Zeit**; die Häppchen selbst sind ≤ 19 ms
  (swapIn), ≤ 11 ms (trim), Scheduler ≤ 24 ms bei Last 9. Eine Messung auf einem ruhigen Rechner steht noch aus.
- **VV1-06 Live-Notenvergleich:** bei Last 11–18 hört die *Live*-Wiedergabe vor dem Auftrag je eine Note weniger (253, nach dem Auftrag
  254 = alle Noten, LUFS −14,34 / −14,34). Mit der Fassung **vor** dem Fix (`synq-snapshots/VV1.html`) unter derselben Last genau gleich
  (253 / 254, `APP=…/VV1.html node n5-v-fx-06.mjs`) – die Live-Wiedergabe lässt unter dieser Last eine Note aus, das Video ändert nichts.
  Bei Last 17–20 ließ die Live-Wiedergabe sogar 50 Noten aus (204). Der Vergleich gehört auf einen ruhigen Rechner.
- Die Spalten-Regel des Matrix-Bilds bei weit auseinanderliegenden Szenen ist die kleinste Änderung, die VV1-04 erfüllt (s. Frage 3).

### Fragen an Xander
1. „Bereich“ zeigt nur „ganzer Song“ / „gelbe Auswahl“. Möchtest du dort Taktzahl und Länge sehen (z. B. „8 Takte · 0:17“)?
2. Nach dem Erstellen stand früher „0:19 · 9:16 · 2,9 MB“ unter den Knöpfen – entfernt, weil nicht beschrieben. Soll Länge/Größe dort stehen?
3. Matrix-Bild: spielen Clips aus Szenen, die weiter als eine Bank auseinanderliegen (z. B. Szene 1 und 6), zeigt das Bild alle Szenen
   dazwischen in schmaleren Spalten. Lieber nur die Szenen mit spielenden Clips nebeneinander?
4. Rückfall „Aufnahme in Echtzeit“: Bei Bildschirmsperre/App-Wechsel pausiert die Aufnahme und läuft danach weiter. Kann Safari danach
   nicht von selbst weiter, genügt ein Tipp aufs Blatt – soll dafür ein Hinweis im Blatt stehen?

### iPhone (Xander)
1. Blatt „Video“ offen mit Bluetooth-Tastatur: Leertaste/Tasten tun nichts, Esc schließt das Blatt.
2. Metronom an, [Video erstellen]: im Video kein Klick.
3. Langer Song, [Video erstellen], dann kurz zum Home-Bildschirm und zurück: der Auftrag läuft weiter bzw. nach einem Tipp aufs Blatt;
   das Video hat keine Lücke; der Bildschirm geht während des Erstellens nicht aus.
4. Song mit Clips aus Szene 1 und Szene 6, Bild „Matrix“: beide Clips sind im Video zu sehen.

### Für das Zusammenführen
- **Einzeilige Haken (neu):** `onKeyDown` (nach `if (e.repeat) return;`: `if (VV.open || UI.vvOff) { … vvClose(); return; }`),
  `inputDown` (1. Zeile `if (UI.vvOff) return;`), `click` (1. Zeile `if (UI.vvOff) return;`), `wakeReleaseLater` (Bedingung `|| VV.busy`).
- **Im VV1-Block geändert:** `vvSwapIn` (jetzt `async`, Parameter `off`, Häppchen mit `vvYield`), `vvRenderAudio` (Aufruf `await
  vvSwapIn(oc, wk, off)`, trim in Häppchen), `vvYield` (Warteschlange), `vvMatrixLayout` (Bank aus allen spielenden Clips),
  `vvEncodeMR` (Pause bei verborgener Seite/stehendem Kontext, `VV.mrCtx`), `vvMake` (Bildschirmsperre, visibilitychange),
  `vvOpen` (kein `dInfo`, pointerdown-Fortsetzen), `vvSync` (Bereich-Text, keine Ergebniszeile), `vvGo` (Kommentar);
  `vvFmtTime`/`vvMB` entfernt (unbenutzt).
- Keine Änderung an CSS, Format, Speichern/Laden, Engines, Worklet oder Server.

## VV2 — Video-Regie (optional, im Song vorbereitet) + 9:16-Kamera · App 4.25.0 · Format 5 bleibt · keine Server-Änderung

Stand: Zweig `n5-br-V/index.html` (auf VV1-fix). **Version bleibt 4.25.0** (APP_CODE 4 025 000), **Format 5** (nur das additive,
optionale Feld `song.video`), CLOUD-Zeile `live: true,` unverändert, kein Supabase-Aufruf (**am Server offen: `max_app ≥ 4025000`**).

### Was neu ist
- **Regie im Song** `song.video = [{a, b, v: 'auto'|'song'|'matrix'|'spur', t?}]` (Takte a ≤ x < b, Spur t), nur wenn es Einträge
  gibt (ein Song ohne Regie bleibt Zeichen für Zeichen gleich). Eine Zeile **„Video“ [Auto] [Song] [Matrix] [Spur …]** in den
  vorhandenen Blättern:
  - Tipp auf die **gelbe Kopfzeile eines Teils** → im vorhandenen Blatt dieses Tipps (Marken-Blatt) unten die Zeile „Video“ für die
    Takte des Teils.
  - **Gelbe Taktauswahl** → Bereich-Leiste **[⋯]** → dieselbe Zeile für genau diese Takte.
  - **[Spur …]** öffnet die Liste der Spuren, die in diesen Takten spielen; die gewählte steht als Farbpunkt im Knopf.
  - **Lane-Eintrag halten** (Zell-Blatt) → **„Im Video zeigen“** = Spur-Bild dieser Spur für die Takte des Eintrags; nochmal = wieder Auto.
  - [Auto] nimmt die Einträge dort weg (dann entscheidet der Auto-Regisseur); die gewählte Taste ist umrandet. Jede Wahl = ein Undo-Schritt
    „Video Takt 9–12: Matrix“ (wie alle Song-Änderungen), dazu eine Meldung mit [Rückgängig].
  - **Takte einfügen/löschen, Teil verschieben/tauschen/kopieren/×2** verschiebt bzw. kürzt die Einträge mit (Haken in `songShift`,
    `songClear`, `songCut`, `songWrite`, `songTidy`; ein Eintrag über einer Einfügestelle wird dort geteilt wie `song.vox`).
  - **Streifen in der Song-Ansicht:** nur wenn Einträge existieren ein 8 px schmaler Streifen unter den gelben Kopfzeilen, je Eintrag in
    der Farbe des Bilds (Song hellgrau, Matrix grün, Spur = Spurfarbe) mit einem **gezeichneten Kamera-Symbol** (Körper + Objektiv, kein
    Zeichen/Emoji) am Anfang. Die Taktleiste wird dafür um 8 px höher, Kopfzeilen und Spuren rücken darunter (nichts wird verdeckt);
    die Beschriftungsspalte geht mit.
- **Auto-Regisseur** (Bild „Auto“ im Blatt Video): Schnittliste aus dem Song (gleiche Eingabe → gleiche Liste, Hash `vvCutHash`).
  Schnitte nur auf Taktstrichen; Teilanfang → **Song**; ≥ 2 Spuren wechseln → **Matrix**; genau eine Spur setzt neu ein bzw. spielt
  allein → **Spur-Bild**; die gezeigte Spur hört auf → Song; nie kürzer als 2 Takte (auch der Rest bis zur nächsten festen Grenze);
  spätestens nach 8 Takten ohne Schnitt wechselt das Bild (Song ↔ Matrix). Einträge aus `song.video` gelten genau für ihre Takte.
  Zwei gleiche Bilder hintereinander sind ein Schnitt-Stück (kein unsichtbarer Schnitt, die Kamera fährt weiter).
  **Übergang:** Blende 300 ms ab dem Taktstrich (weich, monoton, kein Flackern).
- **Spur-Bild** (bis VV3 ohne Innenleben): Kopf mit Spurfarbe, Name und „Szene n“/„eigener Clip“, darunter der spielende Clip groß
  (Noten als Rolle mit Taktgitter, klingende Noten hell umrandet; STIMME: die Welle) mit Laufstrich.
- **9:16:** neue Zeile **„9:16“ [Kamera] [Ganz mit Balken]** im Blatt Video (Gerätprofil `uiPrefs().vv.cam`, Standard Kamera; bei 16:9
  grau, steht aber an ihrem Platz – kein Layout-Sprung). Beide zeichnen die **quer** gezeichnete Ansicht (640 × 360 App-Punkte):
  - **[Kamera]:** ein 9:16-Fenster fährt mit gedämpfter Feder (ω 3/s) über die Ansicht, Zoom 1–3×; Tempo ≤ 4,2 % der Bildbreite je
    Bild, Beschleunigung begrenzt; nie außerhalb der Ansicht. Ziel: Song = das Laufband (bei ~45 % des Fensters; am Anfang mit den
    Spurnamen), Matrix = die spielenden Clips (Zoom so, dass sie hineinpassen; liegen sie links, bleiben die Spurnamen im Bild),
    Spur-Bild = der Laufstrich (ganze Höhe mit Kopf). Bei einem Schnitt beginnt die neue Kamera auf ihrem Ziel.
  - **[Ganz mit Balken]:** die ganze Ansicht, oben/unten Balken in der Hintergrundfarbe.
  - Die frühere hochkant gezeichnete 9:16-Ansicht aus VV1 wird damit nicht mehr benutzt (VV2 legt 9:16 so fest).
- Vorschau (▶) und Standbild im Blatt zeigen dasselbe (Auto mit Blenden, Kamera).
- Test-API: `vvDirSet/vvDirGet/vvDirOf/vvCuts/vvShot/vvCamTrace/vvRunLog`, `vvPrefs({cam})`, `vvMake` liefert `cam` und `cuts` (Hash).

### Abnahme
Chromium headless, 4 vCPU, **Last-Mittel 9–14** (Geschwister-Zweige testen gleichzeitig). Skripte in `dirigent-test/`, Ausgaben in
`dirigent-test/n5-v-out/`. Bilder werden per Bildnummer aus dem MP4 geholt (ffmpeg `select=eq(n,…)`), Vergleich = mittlere
Pixel-Abweichung (0–255) gegen von der App gezeichnete Vergleichsbilder.

| ID | Ergebnis | Messung / Skript |
|---|---|---|
| VV2-01 | **bestanden** | `n5-v-vv2-01.mjs` (16 Takte, Strophe 1–8, Refrain 9–16; Refrain → Matrix über das Marken-Blatt-API, Takte 9–12 → Spur 3): Schnittliste 1–2 Song, 3–12 Spur 3 (ab Takt 3 neu eingesetzt, 9–12 Eintrag), 13–16 Matrix. Je Schnitt Mitte und 0,5 s nach dem Schnitt: **16:9** Abweichung zum Soll-Bild 1,5–3,3, zu den anderen Bildern 8–35 (immer richtig erkannt); **9:16 Kamera** 1,5–2,1 (gegen das Bild mit der Kamera des Auftrags), andere 8,4–41; **9:16 Balken** 1,2–1,9, andere 3,4–11,8. |
| VV2-02 | **bestanden** | `n5-v-vv2-02.mjs`: Einfügen 2 Takte vor dem Eintrag → [8,12)/[12,16) wird [10,14)/[14,18); Löschen 2 Takte davor → [6,10)/[10,14); Löschen im Eintrag → gekürzt; Einfügen im Eintrag → geteilt; Teil tauschen → Einträge wandern mit; Teil löschen → weg; [Auto] → weg; nach jedem Schritt Undo → `S.song` zeichengleich, Redo gleich. Datei speichern → laden: `song.video` gleich, Datei-Text gleich; Speichern im Browser → Seite neu laden: gleich. **Ohne `song.video`:** dasselbe Projekt aus der Fassung vor VV2 (`n5-v-pre-vv2.html`) gespeichert, hier geladen und wieder gespeichert → Zeichen für Zeichen gleich (ohne die zufällige Projekt-ID und ihre Prüfsumme), kein Feld `video`. |
| VV2-03 | **bestanden** | `n5-v-vv2-03.mjs` (30 Takte: Intro 4, Strophe 12, Refrain 10, Outro 4): Schnitte 1–8 Song, 9–16 Spur 3 (neu), 17–24 Song (Teil), 25–26 Matrix (8 Takte), 27–28 Song (Teil), 29–30 Drums (allein); alle auf Taktstrichen, kleinster Abstand 2 Takte, längste Strecke ohne Schnitt in Strophe/Refrain 8 Takte. Hash zweimal `e75d329c`, zwei Video-Aufträge: gleicher Hash, Kamera in allen 1967 Bildern gleich. Erstes Bild jedes Schnitts 0–0,72 Bild nach dem Taktstrich. Blende (16:9 und 9:16): Abweichung zum neuen Bild fällt monoton (z. B. 31,7 → 27,8 → 22,8 → 16,7 → 11,3 → 6,9 → 3,3 → 2,7), fertig nach 7–8 Bildern (≈ 0,27 s ≤ 400 ms). |
| VV2-04 | **bestanden** | `n5-v-vv2-03.mjs` FMT=9:16: 1967 Bilder, **0 außerhalb** der Ansicht, größter Schritt je Bild **4,2 %** der Bildbreite (Grenze 5 %), größte Änderung des Tempos 2,1 % je Bild, Sprünge nur an den 5 Schnitten. `n5-v-vv2-04z.mjs` (Matrix, ein spielender Clip): Zoom fährt weich 1,00 → 1,84, größter Schritt 3,4 %, 0 außerhalb. |
| VV2-05 | **bestanden** | `n5-v-vv2-05.mjs` in P1, P2, P3, L1, L2, 926×428 (Touch, dpr 2): Zeile „Video“ im Marken-Blatt und im ⋯ der Bereich-Leiste je 4 Knöpfe, Spur-Liste, „Im Video zeigen“: **0 Knöpfe < 44 × 44**, 0 außerhalb, nichts abgeschnitten, Trefferprobe (Mitte, ±20 px) alle auf dem Knopf, Blätter rollen nicht; Tipp setzt jeweils den Eintrag. Streifen: Kopfzeile bleibt 20 (16) px, Spuren beginnen 8 px tiefer, Beschriftungsspalte bündig, Marken sichtbar. Blatt Video mit der neuen Zeile: `n5-v-abn-07.mjs vv2` alle sechs Formate ruhend/beim Erstellen/fertig/Vorschau/16:9: 0 Knöpfe < 44, nichts außerhalb, Bedienung rollt nicht (quer dafür Abstände 4 px, Knöpfe 44 px), kein Layout-Sprung. |

Weitere Läufe: `smoke.mjs` ohne Fehler; `gmk8b-reg.mjs` (APP = dieser Zweig) **ALL PASS**; VV1-Läufe `n5-v-abn-01.mjs` (16:9 und 9:16
1920×1080 / 1080×1920, 30/1, 584 Bilder, Soll 19,474 s; Rückfall webm; ohne beides grau), `n5-v-abn-04.mjs` (Laufband kreuzt Takt 2 bei
2,1417 s / Soll 2,1429 s, Takt 6 bei 10,7133 / 10,7143 s), `n5-v-abn-06.mjs` (Projekt unverändert; Unterschiede nur Laufzeit-Messwerte wie
vor VV2) – Ergebnisse wie VV1-fix. Bild-Kosten je Bild (`n5-v-vv2-perf.mjs`, gleiche Last, 12 Takte): VV1 16:9 18,3 ms / 9:16 23,5 ms,
VV2 16:9 Song 23,5 / Auto 17,6 ms, 9:16 Kamera Song 14,3 / Auto 14,2 ms – innerhalb des Lastrauschens gleich. Konsole in allen Läufen ohne Fehler.

### Abweichungen
- **„Teil-Blatt“:** In der Song-Ansicht öffnet der Tipp auf die gelbe Kopfzeile das **Marken-Blatt**; die Zeile „Video“ steht dort (das
  Teil-Blatt der Teil-Leiste gilt für die Vorlage, nicht für eine Song-Stelle).
- **„Bereichs-Blatt“:** Die Bereich-Leiste ist eine feste Leiste mit 6 Knöpfen; eine Zeile darin hätte ihre Höhe geändert. Die Zeile
  steht deshalb in ihrem vorhandenen Blatt **[⋯]** (gleiche Takte).
- **„Im Video zeigen“** gilt für die Takte des gehaltenen Lane-Eintrags (vom Eintrag bis zum nächsten), nicht nur für einen Durchlauf.
- **[Auto]** wird nicht als Eintrag gespeichert, sondern entfernt die Einträge dort (gleiche Wirkung; ein geladenes `'auto'` wird gelesen).
- **Teilgrenze ohne sichtbaren Schnitt:** folgt auf einen Teil, der schon das Song-Bild zeigt, ein Teilanfang (→ Song), läuft das Bild
  weiter (ein Schnitt von Song auf Song wäre unsichtbar). Im Test: Intro → Strophe.
- **Zwei Offline-Renders** sind im Ton nicht bitgleich (Rauschen der Engines, s. VV1); der Ausklang kann um wenige ms abweichen. Schnittliste
  und Kamera sind in allen gemeinsamen Bildern gleich.
- **9:16 Kamera bei schnellem Laufstrich:** bei 1-Takt-Clips über 100 BPM läuft der Laufstrich im Spur-Bild schneller als die Kamera
  fahren darf (≤ 4,2 % je Bild) und kann kurz aus dem Bild laufen; am Clip-Anfang fährt die Kamera weich zurück.
- Die VV1-Test-API `vvMatrixCells('9:16')` liefert noch die alte Hochkant-Anordnung (nur Test-API; das Matrix-Bild ist jetzt die quer
  gezeichnete Ansicht unter der Kamera).
- Der Streifen macht die Taktleiste der Song-Ansicht 8 px höher, sobald es den ersten Eintrag gibt (vorgegeben: „nur wenn Einträge
  existieren“, „verdeckt nichts“); die Seitenhöhe ändert sich nicht.
- Unter Last gemessen (Last 9–14): Abbrechen 300–640 ms Wandzeit über das Test-Polling, wie in den VV1-Läufen mit derselben Methode.

### Fragen an Xander
1. Farben des Streifens: Song hellgrau, Matrix grün, Spur = Spurfarbe – passt das, oder alle in einer Farbe?
2. Soll an **jedem** Teilanfang sichtbar geschnitten werden (z. B. kurzer Zoom/Blende auch von Song auf Song)?
3. 9:16 [Kamera] im Song-Bild: die Spurnamen links sind nur am Anfang im Bild (die Kamera folgt dem Laufband). Sollen sie stehen bleiben?
4. Spur-Bild im 9:16: Fenster folgt dem Laufstrich in voller Höhe. Lieber näher heran (Zoom) und dafür ohne Kopf mit dem Namen?
5. Wenn das Bild im Blatt auf „Song“ oder „Matrix“ steht, gilt die Regie im Song nicht (nur bei „Auto“). Richtig so?
6. Bei Einfügen mitten in einem Eintrag wird er geteilt (die neuen Takte bekommen Auto) – oder soll er sich verlängern?

### iPhone (Xander)
1. Song mit Teilen: auf die gelbe Kopfzeile tippen → unten Zeile „Video“ → [Matrix]; der Streifen mit Kamera erscheint unter der
   Kopfzeile; Undo nimmt ihn wieder weg.
2. Takte gelb wählen → [⋯] → Video [Spur …] → Spur wählen. Lane-Eintrag halten → „Im Video zeigen“.
3. Menü → Video, 9:16, Bild „Auto“, [Kamera]: [▶ Vorschau] – Schnitte auf den Taktstrichen, weiche Blende, die Kamera fährt ruhig;
   dann [Video erstellen] und in Fotos ansehen. Dasselbe mit [Ganz mit Balken] und mit 16:9.
4. Blatt Video quer: alles ohne Rollen sichtbar, die neue Zeile „9:16“ gut treffbar.

### Für das Zusammenführen
- **Neuer Block** direkt nach `/* VV1-END */`: „VV2 (Nachtrag 5): Video-Regie …“ bis `/* VV2-END */` (`vvDirNorm/vvDirTidy/vvDirClear/
  vvDirShift/vvDirCutTo/vvDirWrite/vvDirAt/vvDirOf/vvDirSet/vvDirTracks/vvDirRow/vvDirTap/vvCellOpt/vvCellTap/vvDrawStripe/vvCuts/
  vvCutHash/vvRun/vvShotAt/vvSpurLayout/vvPhase/vvDrawSpur/vvDrawView/vvCamTarget/vvCamClamp/vvCamAt/vvDrawShot/vvDrawRun/vv2Api`).
- **CSS-Block** „VV2 (Nachtrag 5): Zeile „Video“ …“ direkt nach dem VV1-CSS-Block (nach `.vvctl>:last-child{margin-bottom:auto}\n}`).
- **Einzeilige Haken:** `normSong` (`vvDirNorm(o.video, bars)` nach der vox-Zeile), `songShift` (`vvDirShift`), `songClear`
  (`vvDirClear`, nicht bei keepMarks), `songCut` (Rückgabe über `vvDirCutTo(…)`), `songWrite` (`vvDirWrite` am Ende), `songTidy`
  (`vvDirTidy` am Ende), `svLayout` (`SV.vvS`, `SV.rulerH` + Streifen, `avail` ohne Streifen), `svDraw` (1. Zeile nach dem Guard:
  `svLayout()` wenn der Streifen kommt/geht; `ch` und `svDrawMarks` mit Kopfhöhe ohne Streifen; `vvDrawStripe` nach den Marken),
  `openMarkSheet` (Zeile `vvDirRow` am Ende des HTML, `vvDirTap` im Tipp), `openRangeMore` (`vvDirRow`, `vvDirTap` vor `closePop`),
  `openCellSheet` (`vvCellOpt`, `vvCellTap`), Test-API (`Object.assign(SYNQUENZER, vv2Api());` nach der VV1-Zeile).
- **Im VV1-Block geändert:** `vvPrefs` (+`cam`), `vvDraw` (ruft `vvDrawRun`, Parameter `rt`), `vvViewOf` (Auto bleibt Auto),
  `vvEncodeWC/vvEncodeMR` (`job.rt`), `vvMake` (`VV.lastRt = vvRun(…)`, `res.cam/cuts`), `vvOpen` (Zeile „9:16“ `segC`), `vvSync`
  (`segC`), `vvStill`/`vvPrevStart` (Run der Vorschau), `vvApi.vvPrefs` (+`cam`).
- Keine Änderung an Engines, Worklet, Ton, Speichern-Format (nur additiv) oder Server.

## VV2-fix

Stand: Zweig `n5-br-V/index.html` (auf VV2). **Version bleibt 4.25.0** (APP_CODE 4 025 000), **Format 5** (nur `song.video`, additiv),
CLOUD-Zeile `live: true,` unverändert, kein Supabase-Aufruf (**am Server offen: `max_app ≥ 4025000`**). Alle 8 gemeldeten Fehler
selbst nachgestellt (alle echt) und behoben.

### Was neu ist (Fehlerbehebungen)
1. **Regie für STIMME / Spur 7–8 ging beim Laden verloren** (VV2-02, 2 Meldungen): `vvDirNorm` prüfte die Spur gegen die Spurzahl der
   gerade offenen Sitzung (`curNT()`), nicht gegen die des geladenen Projekts. Jetzt bekommt sie die Spurzahl des Songs (`normSong` gibt
   `nt` weiter, `vvDirTidy` nimmt `song.lanes.length`). Neu laden und Datei in frischer Sitzung: `[{a:4,b:8,spur,t:6}]` bleibt.
2. **9:16-Kamera schräg > 5 % je Bild** (VV2-04): Tempo war je Achse begrenzt, schräg + Zoom ergab bis 6,8 %. Jetzt wird je Bild die ganze
   Bewegung des Bildinhalts (Fensterecken, Zoom eingerechnet, `vvCamDisp`) auf ≤ 4,5 % der Bildbreite begrenzt (Feder und Beschleunigungsgrenze
   unverändert).
3. **Auto-Regisseur: Eintrag + gleiches Auto-Bild = bis 17 Takte ohne Schnitt; 1-Takt-Schnitt neben einem Eintrag** (VV2-03): Jeder Schnitt
   kennt jetzt den Anfang dessen, was als *ein* Bild zu sehen ist (Eintrag und gleiches Auto-Bild davor/danach zählen zusammen). Die 8-Takt-Regel
   und die 2-Takt-Regel zählen von dort; ein Eintrag direkt dahinter mit gleichem Bild wird mitgezählt. Bleibt vor/nach einem Eintrag nur
   1 Takt frei, zeigt dieser Takt das Bild des Nachbar-Eintrags (kein 1-Takt-Schnitt). Nach einem Eintrag beginnt Auto mit dem anderen Bild,
   wenn nichts Neues passiert.
4. **Teilanfang ohne sichtbaren Schnitt** (VV2-03, Spec „Schnitt … an Teilgrenzen“): steht das Bild an einem Teilanfang schon auf Song,
   zeigt Auto dort, was neu ist – ≥ 2 Wechsel → Matrix, genau eine neue Spur → Spur-Bild, sonst Matrix (nur die vorhandenen Bilder, keine neue
   Gestaltung). Damit ist jede Teilgrenze ein sichtbarer Schnitt, wo die 2-Takt-Regel es erlaubt.
5. **Meldung [Rückgängig] lag über der Zeile „Format“ im Blatt Video** (Hochkant, Tipp auf [16:9] ging verloren): Öffnen des Blatts Video
   blendet eine noch stehende Meldung mit Knopf aus (`vvOpen`). Rückgängig bleibt über ↶ erreichbar.
6. **9:16 [Kamera] im Spur-Bild verlor den Laufstrich** (1-Takt-Clips, 112 BPM: nur 35–39 % im Bild): ein 1-Takt-Laufstrich läuft schneller,
   als eine ruhige Kamera fahren darf, und springt am Clip-Anfang 600 Punkte zurück. Das Spur-Bild wird in 9:16 [Kamera] jetzt im 9:16-Fenster
   selbst angeordnet (Kopf mit Farbe/Name/Szene, der ganze Clip, Laufstrich) – Laufstrich und klingende Noten immer im Bild, die Kamera steht
   in dieser Einstellung still. Der Name im Kopf wird bei Bedarf kleiner (17 → 11 px) bzw. mit „…“ gekürzt, nie über „Szene n“.
   16:9 und [Ganz mit Balken] unverändert.
7. **„Auf alle „Refrain“ übertragen“ löschte die Regie der anderen Refrains** (ebenso FANG TEIL ⟳ und „Ersetzen durch …“): Ersetzen ändert
   den Inhalt eines Teils, nicht wohin das Video schaut – die Regie-Einträge der ersetzten Stelle bleiben (auf die neue Länge gekürzt).
   Gleich behandelt: Ersetzen-Blatt (Teil auf Takte → Ersetzen, `placePart` 'replace').
8. Typischer Fehler A4 dabei gefunden: die Liste **[Spur …]** für einen kurzen Bereich (z. B. 1 Takt, 4 Spuren) hatte Knöpfe 42,3 px breit →
   jetzt je Spur ≥ 44 px.

### Abnahme
Chromium headless, 4 vCPU, Last 1,5–5. Skripte in `dirigent-test/`.

| ID | Ergebnis | Messung / Skript |
|---|---|---|
| Fehler 1/4 (VV2-02) | **behoben** | `n5-v-qa2-stimme.mjs`: nach Neuladen und Datei in frischer Sitzung `video = [{a:4,b:8,spur,t:6}]` (vorher `null`). `n5-v-q2-save2.mjs` (APP = Zweig): nach Neuladen beide Einträge (`t:1`, `t:6`). `n5-v-q2-save.mjs` **ALL PASS** (Hash `2cdb1f7b` vor/nach Neuladen gleich). |
| Fehler 2 (VV2-04) | **behoben** | `n5-v-qa2-cam.mjs diag`: 800 Bilder, **0 über 5 %**, größte Bewegung 4,49 % (vorher 65 Bilder, bis 6,83 %), 0 außerhalb. MP4-Prüfung `n5-v-qa2-reg.mjs` Bilder 273/275/538/540: 3,4–3,7 % (vorher 5,76/5,79 %). |
| Fehler 3 (VV2-03) | **behoben** | `n5-v-qa2-cuts2.mjs`: A 1–8 Song, 9–13 Matrix (vorher 1–13); B 1–4 Song, 5–12 Matrix, 13–16 Song (vorher 1–12); C 1–8 Matrix, 9–16 Song (kein 1-Takt-Stück mehr). `n5-v-qa2-cuts.mjs 300 {11,7,3} user` und `300 5` (ohne Einträge): je **0 Fehler**, längste Strecke ohne Schnitt in Teilen > 8 Takte **8**. |
| Fehler 8 (VV2-03) | **behoben** | `n5-v-q2-auto.mjs 12`: 1–2 Song, 3–6 Matrix, 7–8 Song, 9–10 Stimme, 11–12 … (vorher 1–8 Song). `n5-v-q2-auto2.mjs`: 1–4 Song, 5–12 Matrix, 13–20 Song, 21–24 Matrix – Schnitt an jedem Teilanfang. `n5-v-vv2fix.mjs` (300 Zufallssongs): 566 Teilanfänge, 393 mit Schnitt, 173 durch die 2-Takt-Regel gesperrt, **0 verpasst**. |
| Fehler 5 | **behoben** | `n5-v-q2-toast.mjs P`: keine Meldung über dem Blatt, Tipp [16:9] → `fmt 16:9` (vorher 9:16). (L: das Skript erreicht den Menü-Eintrag „Video“ quer nicht – er liegt unterhalb des sichtbaren Menüs; gleiches Ergebnis mit dem VV2-Stand, kein App-Fehler dieses Pakets.) |
| Fehler 6 | **behoben** | `n5-v-vv2fix.mjs 112`: SYN 4 (3–6, 257 Bilder) und STIMME (7, 64 Bilder) Laufstrich **100 %** im Bild (vorher 35/39 %), Kamera bewegt 0×; Bilder `n5-v-out/vv2fix-spur-syn4-112.png`, `…-stimme-112.png` (Kopf, ganzer Clip, Laufstrich, klingende Note umrandet). |
| Fehler 7 | **behoben** | `n5-v-q2-edit.mjs`: „Auf alle Refrain übertragen (from 2nd)“ → Regie unverändert (vorher Matrix [6,10) weg); „Refrain2 Ersetzen durch Strophe“ → Spur-Eintrag bleibt. `n5-v-q2-ui2.mjs P` (Touch): `v2 = [{6,10,matrix}]` nach „Auf alle 2 Refrain übertragen“. Undo → `song.video` gleich (`n5-v-vv2fix-undo.mjs`). |
| Spur-Liste ≥ 44 | **behoben** | `n5-v-q2-ui2.mjs P`: 1-Takt-Liste 4 × 44,0 × 44,0 (vorher 42,3 breit). |
| VV2-01 | **bestanden** | `n5-v-vv2-01.mjs` 16:9, 9:16 Kamera, 9:16 Balken: je 10/10 Bilder richtig erkannt (Soll 1,2–2,1 gegen das Bild mit der Kamera des Auftrags, andere ≥ 2,3). Schnittliste jetzt 1–2 Song, 3–6 Spur 3, 7–8 Song (8-Takt-Regel greift jetzt mit dem Eintrag 9–12 zusammen), 9–12 Spur 3, 13–16 Matrix. |
| VV2-02 | **bestanden** | `n5-v-vv2-02.mjs` alle Schritte ok (Einfügen/Löschen/Teil tauschen/Undo/Redo/Datei/Neuladen/ohne `song.video` zeichengleich). |
| VV2-03 | **bestanden** | `n5-v-vv2-03.mjs` (9:16): Schnitte 1–4 Song, 5–8 Spur 2, 9–16 Spur 3, 17–24 Song, 25–26 Matrix, 27–28 Song, 29–30 Drums; alle Teilgrenzen geschnitten, kleinster Abstand 2, längste Strecke 8; Hash zweimal `44b13e35`, Kamera in allen 1972 Bildern gleich; Blenden monoton, fertig nach 6–8 Bildern. |
| VV2-04 | **bestanden** | `n5-v-vv2-03.mjs`: 0 außerhalb, größter Schritt 0,37 %, Sprünge nur an den 6 Schnitten; `n5-v-vv2-04z.mjs` Zoom 1,00 → 1,84, 3,39 %, 0 außerhalb; `n5-v-qa2-cam.mjs diag` s. o. |
| VV2-05 | **bestanden** | `n5-v-vv2-05.mjs` P1/P2/P3/L1/L2/926×428: 0 Knöpfe < 44, nichts außerhalb, Streifen ok. `n5-v-abn-07.mjs vv2` alle sechs Formate: 0 < 44, nichts außerhalb. |

Weitere Läufe: `smoke.mjs` ohne Fehler (`n5-v-out/vv2fix-smoke.png`); `gmk8b-reg.mjs` (APP = Zweig) **ALL PASS**; Konsole in allen Läufen ohne Fehler.

### Abweichungen
- **Überholte Test-Erwartung:** `n5-v-q2-cam.mjs` misst den Laufstrich gegen die 640 Punkte breite Ansicht; das Spur-Bild ist in 9:16 [Kamera]
  jetzt im Fenster selbst angeordnet – gemessen wird mit `n5-v-vv2fix.mjs` (Anordnung in Fensterbreite). Das Kamera-Protokoll schreibt für
  Spur-Bilder ein festes Fenster mit `fit: 1`.
- **Schnittlisten ändern sich** gegenüber VV2 (andere Hashes), weil Teilanfänge und die 8-Takt-Regel mit Einträgen jetzt greifen (s. VV2-01/03).
- Ein Eintrag von 7 Takten mit 1 freien Takt davor wird zu 8 Takten eines Bildes; ein Eintrag länger als 8 Takte bleibt ungeschnitten
  (Xanders Wahl).
- `n5-v-q2-save2.mjs`, Teil „Datei in frischer Seite“: das Skript gibt `importProject` einen Text statt eines Objekts (Skriptfehler); derselbe
  Weg mit `applyProject(normalizeProject(projFromFile(…)))` in `n5-v-qa2-stimme.mjs` behält den Eintrag.
- Gesehen, nicht Teil dieses Pakets: nach Undo von „Auf alle übertragen“ steht `song.mel[5].len` 17 statt 16 (gleich im VV2-Stand, betrifft
  keine Regie).

### Fragen an Xander
1. 9:16 [Kamera], Spur-Bild: die Spur wird jetzt hochkant im Bild gezeigt (Kopf, ganzer Clip, Laufstrich) statt die Kamera über die breite
   Ansicht fahren zu lassen – so bleibt der Laufstrich immer sichtbar. Passt das, oder lieber anders?
2. Teilanfang, der schon das Song-Bild zeigt: Auto schneidet jetzt auf Matrix bzw. das Spur-Bild der neuen Spur. Einverstanden?
3. (offen aus VV2) Fragen 1, 3, 5, 6 von VV2 gelten weiter; Frage 2 von VV2 ist mit Punkt 4 oben beantwortet, falls du zustimmst.

### iPhone (Xander)
1. Takt-Eintrag auf der STIMME-Spur halten → „Im Video zeigen“ → Speichern, App neu laden: der Streifen ist noch da.
2. Refrain auf [Matrix], dann beim zweiten Refrain „Auf alle übertragen“: der Streifen über dem ersten Refrain bleibt.
3. Gleich danach Menü → Video: [16:9] lässt sich sofort tippen.
4. 9:16 Kamera, Video mit einem 1-Takt-Clip im Spur-Bild: Laufstrich immer zu sehen; Kamera fährt ruhig (auch schräg mit Zoom).

### Für das Zusammenführen
- Nur im **VV2-Block**: `vvDirNorm` (+Parameter `nt`), `vvDirTidy`, `vvCuts` (neu geschrieben), neu `vvCamDisp`, `vvCamAt` (Begrenzung je Bild),
  `vvDrawShot` (Zweig Spur-Bild in 9:16 Kamera), `vvDrawSpur` (Kopfzeile passt sich an), `vvDirTap` (Klasse `vvsp`).
- **VV2-CSS-Block:** eine Zeile `.pop.plpick .plp.vvsp{…}`.
- **Im VV1-Block:** `vvOpen` eine Zeile (`hideToast`).
- **Einzeilige Haken in geteilten Funktionen:** `normSong` (`vvDirNorm(o.video, bars, nt)`), `markReplaceAll` (`vvKeep` vor dem Ersetzen,
  `vvDirWrite` danach), `markAction` Zweig `replaceBy`, `placePart` (`vk` vor/nach `opReplace`).
