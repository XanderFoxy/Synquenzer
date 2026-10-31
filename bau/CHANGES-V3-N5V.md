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

ABNAHME_PLATZHALTER
