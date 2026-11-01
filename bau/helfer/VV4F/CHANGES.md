# VV4-F „Mäusekino“ – Pegel je Spur in der App und im Video

Basis: `bau/snapshots/R-4261.html` (App 4.26.1). VERSION unverändert. Vollständige Änderung: `patch.diff` (diff -u gegen die Basis).
Spec: `spec/konzept-schnitt-uebergaenge-video.md` §2.2 VV4-F, Abnahme §2.3 VV4-11 / VV4-12.

## App

- **Pegelbalken je Spur**
  - Matrix: senkrecht, 3 px breit, direkt neben dem Farbstreifen im Spurkopf (im vorhandenen Innenabstand).
  - Song: waagrecht, 3 px hoch, unter dem Spurnamen. Rechts neben dem Namen ist bei 375×667 nur 4,5 px frei, darunter überall mindestens 7 px.
- **Master-Balken**
  - Matrix: am linken Rand der Ecke „SONG ⇄“ (2 px breit, Tippfläche 14 px).
  - Song: waagrecht in der TAKT-Zelle rechts neben „TAKT“.
  - **Tipp auf den Master-Balken öffnet die MASTER-Seite:** Klang-Editor der gewählten Spur → FX › MASTER, bei Drums FX › MASTER des Drum-Editors.
  - Ist eine STIMME-Spur gewählt, wird vorher die erste andere Spur gewählt, denn die STIMME-Spur hat keinen Klang-Editor.
- **Anzeige**
  - RMS als volle Füllung, Spitze als blasse Füllung darüber.
  - Haltelinie: die höchste Spitze der letzten 1,5 s.
  - Rote LED, solange in den letzten 1,5 s eine Spitze über −0,3 dBFS lag.
  - Skala −48 … 0 dBFS. Farben in festen Stufen wie im Video: Grün bis −12 dB, Gelb bis −2,4 dB, darüber Rot (App-Farben `--play` und `--amber`).
- **Zeitgleich mit dem Ton:** Der Master wird um die Geräte-Latenz verzögert angezeigt, die Spuren zusätzlich um die Latenz der Master-Kompressoren (`AU.devLat`, `AU.outLat`).
- **Aus, wenn niemand hinsieht**
  - Seite unsichtbar (`document.hidden`).
  - Matrix bzw. Song zugedeckt, z. B. vom Klang-Editor. Das prüft die App höchstens 4× pro Sekunde mit einem Treffertest auf Master-Balken bzw. Spurkopf.
  - CPU-Begrenzer auf Stufe ≥ 2.
  - Ist die Anzeige aus, rechnet das Worklet nicht mehr und schickt keine Nachrichten. Die Balken sind leer. Bei Begrenzer-Stufe ≥ 2 kehrt `mtrFrame` sofort zurück (0 ms).
- **Nichts verschoben:** Alle Balken liegen absolut in vorhandenen Zellen. Gemessen in 7 Größen gegen die Basis: alle Rechtecke gleich, Seitenhöhe gleich, kein Name stärker gekürzt, kein Balken über Text.

## Technik

- **Ein Meter-Worklet `synq-meter`** im vorhandenen Worklet-Modul (`sq-worklet-src`, ASCII).
  - 9 Eingänge: Spur 0…7 nach dem Fader (`N.cut`, vor den Sends) und der Master-Ausgang (`AU.M.ceil`).
  - Live: ein Fenster je 12 Blöcke (1536 Werte bei 48 kHz, ≈ 31 Hz) mit Spitze und RMS je Eingang.
  - Kein FFT. Im Audio-Thread keine Allokation: Nachricht und Float32Array werden einmal angelegt, `postMessage` kopiert.
  - Meldungen `{on}` und `{dispose}`.
- **Der Klang bleibt gleich (Regel 28)**
  - Die Abgriffe sind reine Verzweigungen; der Signalweg ist unverändert.
  - Der stille Ausgang des Meters geht an `destination`, damit Chromium und WebKit den Knoten sicher rechnen.
  - Eine exakte Null ändert keine Summe, egal in welcher Reihenfolge summiert wird.
  - Geprüft: bit-gleich, siehe STATUS.
- **Hauptthread**
  - Die Nachricht wird nur in einen Ring mit 160 Fenstern kopiert.
  - Gezeichnet wird im vorhandenen rAF (`uiFrame` → `mtrFrame`): `clip-path`, Haltelinie und LED-Klasse, und nur bei Änderung.
  - Gemessen in Chromium: im Mittel 0,09 ms je Bild. Keine Langaufgabe.
- **Neue Spurketten:** `buildTrack` hängt die neue Kette an (`mtrTap`), die alte wird abgehängt.
- **Gebaut wird das Meter**, sobald das Worklet geladen ist (`loadWorklet` → `mtrBuild`). Ohne Worklet (`forceNative`, Laden fehlgeschlagen) gibt es kein Meter, und die Balken bleiben leer.

## Video

- **Messen im Offline-Render:** `vvSwapIn` baut dasselbe Meter auf dem `OfflineAudioContext`.
  - Ein Fenster je 128er-Block, in Paketen zu 16 Blöcken. Der letzte Block schickt den Rest.
  - `vvRenderAudio` wartet, bis alle Pakete da sind (höchstens 1,5 s), und legt sie in `r.mtr` ab.
  - Abschalten nur für Tests: `VV.noMtr = true`.
- **Bilder hinter dem Render:** `vvEncodeWC` zeichnet Bilder, während der Render noch läuft. Dafür steht das Meter auch in `live.mtr`. Ein Bild wartet, bis die Meter-Fenster seiner Zeit da sind.
- **Neuer Zeichner `vvDrawMeters(g, t, rect)`**
  - `rect = {src, bars: [{k, x, y, w, h, hz?}]}`, `k` = Spur (`MAX_T` = Master).
  - Werte zur Videozeit t, zeitgenau:
    - Master: Kontextzeit `r.off + t`.
    - Spuren: zusätzlich minus die Master-Latenz `gl`.
  - RMS und Spitze über die Fenster der Bilddauer (1/30 s), Halten und LED über 1,5 s.
  - Ohne Messwerte bleiben die Balken leer (Regel „nichts Erfundenes“).
  - Sonde für Tests: `VV.mtrProbe`.
- **Aufrufe:**
  - `vvDrawSong`: Balken unter den Spurnamen, Master in der TAKT-Zeile rechts neben dem Wort.
  - `vvDrawMatrix`: Balken neben dem Farbstreifen, Master links in der Szenenkopf-Zeile, so wie in der App.
- **Kosten:** 0,04 ms je Bild für 7 Balken. Video-Tempo 2,4–3,0× Echtzeit (Soll ≥ 1,5×).

## Schnittstelle (nur Tests)

`SYNQUENZER.mtrInfo()`: Zustand und Anzeige je Eingang in dBFS. `SYNQUENZER.mtrOpenMaster()` öffnet die MASTER-Seite.

## Fragen an Xander

1. **Skala und Farben:** −48 dB unten. Grün bis −12 dB, Gelb bis −2,4 dB, Rot darüber. Ist das so recht?
2. **Wie lange leuchtet die LED?** Sie leuchtet wie die Haltelinie 1,5 s nach der letzten Übersteuerung. Die Spec sagt nur „LED an über −0,3 dBFS“; ohne Nachleuchten sähe man die LED nicht.
3. **Wo sitzen die Balken?**
   - Song: waagrecht unter dem Namen, weil rechts neben dem Namen bei 375×667 zu wenig Platz ist.
   - Matrix: senkrecht neben dem Farbstreifen.
   - Ist das so recht?
4. **Gesangs-Chor (G6):** Seine Stimmen gehen nicht durch die Spurkette und erscheinen deshalb nur im Master-Balken, nicht im Balken der STIMME-Spur.

## Gefunden, nicht geändert (Regel 27)

- **Der Song-Render ist nicht reproduzierbar, schon in R-4261:** Zwei Offline-Renders desselben Songs weichen voneinander ab. Bei einer einzelnen Spur sind es bis −9 dB (`tests/nachweis-render-basis.mjs`).
  - Teilweise ist es Zufall (`Math.random`: S&H, Drift-Saat im Worklet).
  - Teilweise ändert sich der Zustand von Render zu Render: Der 1. und der 4. Lauf sind oft gleich.
  - Dazu kommt Chromium-Rundung, sobald ein Knoten ab 3 klingende Eingänge summiert (≈ −110 dB, `tests/nachweis-summe-chromium.mjs`).
  - Für Golden-Renders nach Regel 28 wäre eine feste Saat je Render nötig. Eigenes Paket?
