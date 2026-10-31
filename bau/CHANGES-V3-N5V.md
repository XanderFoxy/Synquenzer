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
