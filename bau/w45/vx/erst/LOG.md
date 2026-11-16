# ERST – LOG (OFFEN-1611 A2: erster Tipp / erstes ▶ ohne Stocken)

Basis: rel-4761/index.html (4.76.1, md5 e4dc1b9599eef2656308cb990e407f37) = `basis.html`. VERSION bleibt '4.76.1'.
Bau: `python3 bau.py` (basis.html + erst-block.js → index.html; Block nach PERF1B-END, 4 Ein-Zeilen-Haken mit `/* ERST */`).

- 06:00 Paketordner angelegt, Basis kopiert. PERF1-NOTES gelesen (ensureAudio 310–370 ms bei 4× als größter Posten nach PERF1B).
- 06:02 Mess-Skript `mess/mess.mjs` (428×926, Touch per CDP, CPU 4× per CDP, Long Tasks + Event Timing + Tipp→Ton über
  getOutputTimestamp, optional Zeit je Teilschritt durch Umhüllen der globalen Funktionen) – Basis gemessen (Last 5,0–5,5).
- 06:04 `mess/probe-wk.mjs`: Worklet-Laden zerlegt (Blob 11–15 ms, addModule synchron 0,1 ms, asynchron 70–127 ms im Worklet-Faden).
- 06:06 Zweite Rate-Falle gefunden: Chromium läuft mit 44,1 kHz, PERF1B baut ohne gespeicherte Rate für 48 kHz → Trommel-Puffer
  werden im Tipp neu gebaut (drumBufs 72–129 ms). Am iPhone (48 kHz) greift PERF1B → alle weiteren Messungen mit SR=44100
  (localStorage synq.perf1b.sr, „Rate bekannt“ wie am Gerät).
- 06:08 Block ERST gebaut: (1) Worklet-Blob-Adresse vorab in Scheiben, (2) Metall-Puffer vorab in Scheiben, (3) WT-Wellen in Scheiben.
- 06:10 erst-test.mjs geschrieben; Rauschen bleibt im Tipp (gleiche Math.random-Folge, mit Zufalls-Startwert byte-gleich belegt).
  noteLog-Vergleich erst ab Schlag 2: Basis gegen Basis ist in den ersten Schlägen nicht gleich (Hauptfaden-Zeit beim Start).
- 06:16 Stapel der Aufrufe belegt: makeWaves (16 PeriodicWaves, 50–100 ms bei 4×) läuft IM TIPP über
  AU.waves-Getter < spawnVoice < spawnClipVoice < scheduleTrack – für jede native Stimme, gelesen wird es aber nur bei engine 'wt'.
  → Haken (4): Wellen als Getter übergeben. (3) neu an den bisherigen 1,5-s-Leerlauf gehängt (vorher eigener 250-ms-Start, der
  gegen den 1,5-s-Leerlauf verlor und die Wellen doppelt baute).
- 06:21 erst-test 13/13 OK; Pflicht: topdefs/dupkeys/smoke OK, „MS 2000“ 1×, live 1×.
- 06:21 A/B-Stapel (abwechselnd basis/index, je frische Seite, Last je Lauf in `mess/ab4.jsonl`, `mess/ab1.jsonl`); parallel lief
  zeitweise erst-test (gleich für A und B, Last steht je Lauf dabei). Rechnerlast insgesamt 9–13 (viele Agenten).
- Erster A/B-Stapel (`mess/ab4-v1.jsonl`) war vor Haken (4) – nur Puffer/Blob: kein Unterschied im Rauschen sichtbar
  (Tipp-Aufgabe Median 403 → 393 ms, Streuung 282–686 ms).
