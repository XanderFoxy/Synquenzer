# ERST – NOTES (OFFEN-1611 A2: erster Tipp / erstes ▶ ohne Stocken)

`index.html` = 4.76.1 (rel-4761) + Block `/* ERST-BEGIN */ … /* ERST-END */` (nach PERF1B-END) + 4 Ein-Zeilen-Haken `/* ERST */`.
VERSION bleibt '4.76.1'. Aussehen und Bedienung unverändert. Bau: `python3 bau.py` (Block-Quelle `erst-block.js`).
Nicht angefasst: LT2 (Spektral/Import), SPKK, IMPK – keine ihrer Stellen.

## Messaufbau
`mess/mess.mjs <html> <drossel> <warteMs> [instr]`: Chromium 428×926, Touch, CPU-Drosselung per CDP, ▶ als CDP-Touch 3 s nach
„bereit“. Gemessen: Long Tasks ab dem Tipp, Event Timing, **Tipp→Ton** = Zeit vom pointerdown bis zum Ausgabezeitpunkt der ersten
geloggten Note (getOutputTimestamp-Abbildung der Audio-Uhr auf performance.now). `instr=1` umhüllt die globalen Funktionen
(ensureAudio, buildBuffers, SynthHost.load, makeWaves, …) und misst ihre Zeit. Alle Vergleiche mit `SR=44100` (synq.perf1b.sr
gesetzt = „Rate bekannt“ wie am iPhone; ohne das baut Chromium mit 44,1 kHz die PERF1B-Trommeln im Tipp neu – eine reine
Test-Falle, s. Nebenbefund). A/B mit `mess/ab.sh` (abwechselnd basis/index, je eine frische Seite, Last je Lauf mitgeschrieben).

## Ist-Messung VORHER (Basis 4.76.1, 4×, Last 5–13)
- Erste Aufgabe nach dem Tipp (pointerdown → ensureAudio + togglePlay): **282–639 ms** (Median der A/B-Läufe 333–403 ms).
- Tipp→Ton: 219–516 ms (Median 289–307 ms). 1×: Tipp-Aufgabe 99–136 ms, Tipp→Ton 154–166 ms.
- Zerlegung der Tipp-Aufgabe (instr, 4×): ensureAudio 121–407 ms = new AudioContext 31–111 · SynthHost.load 13–236 (davon
  new Blob über 421 876 Zeichen 10–55 ms; einmal 236 ms unter Last) · buildBuffers 20–31 · buildTrack 22–63 · rebuildNativeLfos
  6–24 · buildFx 3–36 · measureFx 4–9. togglePlay 152–211 ms = erster Planer-Schritt mit **makeWaves 50–98 ms** · drumBusBuild
  23–60 (Faltungshall der Trommeln) · native Stimmen (spawnClipVoice) und Trommelschläge.
- Danach bis 2,5 s weitere lange Aufgaben 50–200 ms (Planer mit nativen Stimmen, bis das Worklet bereit ist; FX.Echo 17–50 ms nach
  der Latenzmessung; convWarm 16–32 ms; Worklet-Wechsel upgradeHall/syncEngines).

## Ursachen (mit Beleg)
1. **WT-Wellen im Tipp** – größter vermeidbarer Posten. Aufrufkette (Error-Stack in `mess.mjs`): `AU.waves`-Getter < spawnVoice
   (Z 32061) < spawnClipVoice < scheduleTrack, +77…356 ms nach dem Tipp, also mitten in der Tipp-Aufgabe. spawnVoice übergab
   `waves: AU.waves` für JEDE native Stimme; gelesen wird `o.waves` in NativeVoice.source nur bei `engine === 'wt'` (Z 25552).
   Weil vor dem fertigen Worklet alle Stimmen nativ laufen, baute schon die erste VA-/FM-Note alle 16 PeriodicWaves (50–98 ms).
2. **Worklet-Quelltext als Blob** im Tipp (SynthHost.load, Ladeweg 'blob'): `new Blob([src])` über 421 876 Zeichen = 10–55 ms
   (`mess/probe-wk.mjs`: Blob 11,6/15,5 ms bei 4× in Ruhe; addModule selbst synchron 0,1 ms, das Übersetzen läuft im
   Worklet-Faden 70–127 ms und stört den Hauptfaden nicht).
3. **Metall-Puffer** in buildBuffers: 6 Rechteckwellen × 2 s (≈ 0,5 Mio. Schritte) = Hauptteil von 20–31 ms; braucht keine Umgebung.
4. Nicht verschiebbar ohne AudioContext vor dem Tipp: new AudioContext (31–111 ms), Knoten-Aufbau (buildFx/buildTrack/LFOs),
   Trommel-Faltungshall (ConvolverNode.buffer, drumBusBuild 23–60 ms), native Stimmen im ersten Planer-Schritt.
5. Nebenbefund (nur Test, kein Gerätefehler): ohne gespeicherte Rate nimmt PERF1B 48 kHz an; Chromium läuft mit 44,1 kHz → die
   vorgebauten Trommel-Puffer passen nicht, drumBufs baut im Tipp neu (72–129 ms). Am iPhone (48 kHz) greift PERF1B schon beim
   ersten Start; ab dem zweiten Start überall.

## Änderung (Block ERST + Haken)
| Was | Wo | Haken |
|---|---|---|
| (4) WT-Wellen erst, wenn eine WT-Stimme sie liest | spawnVoice | `{t0, noise: AU.noise, get waves() { return AU.waves; }}` statt `waves: AU.waves` |
| (3) die 16 WT-Wellen des 1,5-s-Leerlaufs in Scheiben (je Leerlauf-Schritt einige createPeriodicWave, ≤ 12 ms) | ensureAudio | `if (!(typeof erstWv === 'function' && erstWv(AU.ctx))) void AU.waves;` |
| (1) Worklet-Blob-Adresse vorab: 7 Teil-Blobs à 64 K Zeichen + Sammel-Blob (gleiche Bytes) in Leerlauf-Schritten nach `load` | SynthHost.load | `(typeof erstWkUrl === 'function' && erstWkUrl(src)) \|\| URL.createObjectURL(…)` |
| (2) Metall-Puffer vorab als `new AudioBuffer` bei perf1bRate() in 4 Scheiben (Phase fortgeführt) | buildBuffers | `if (typeof erstBufs === 'function' && erstBufs(AU.ctx)) return;` |

Regeln: vor dem Tipp **kein** AudioContext und auch kein OfflineAudioContext (Test ERST-01 zählt die Konstruktoren). Das Rauschen
entsteht weiter im Tipp, damit die Math.random-Folge exakt wie bisher bleibt. makeWaves wird unverändert benutzt (mit einer
Sammel-Umgebung für die Eingaben) – keine doppelte Wellen-Definition. Rückfälle: andere Rate → alter buildBuffers-Weg; anderer
Worklet-Text → alter Blob-Weg (Adresse wird freigegeben); Tipp vor fertiger Vorarbeit → alter Weg; WT-Note vor fertigen Scheiben
→ Getter baut wie bisher alles auf einmal, die Scheiben hören auf; Offline-Render (VV) → Scheiben hören auf. Eine nie genommene
Adresse (z. B. „nur nativ“) wird 15 s nach dem Start freigegeben. Neue Namen: ERST, ERST_MT_F, erstStart, erstIdle, erstStep,
erstFree, erstWkUrl, erstBufs, erstWv, erstWvIdle. Kosten vor dem Tipp: ≈ 420 KB Blob + 345–384 KB Puffer.

## Messung NACHHER (A/B abwechselnd, Rate bekannt; Zahlen siehe unten „A/B“)
Siehe Abschnitt A/B am Ende (wird mit dem Stapel `mess/ab4.jsonl`, `mess/ab4b.jsonl`, `mess/ab1.jsonl` gefüllt).

## Tests
`node erst-test.mjs index.html basis.html` → **13/13 OK** (`erst-test.out`, `erst-test.json`):
01 kein (Offline)AudioContext vor dem Tipp · 02 Vorarbeit fertig · 03 Worklet über die vorbereitete Adresse ('blob', ready),
Metall übernommen · 04 Metall byte-gleich zur Basis (FNV 6fe0a136) · 05 Rauschen bei gleicher Zufallsfolge ab dem Tipp byte-gleich
(222a6644) · 06a Kontrolle Basis=Basis · 06 noteLog Schläge 2–8 gleich (61 Noten, Spur/Quelle/Ton/Schlag/Dauer/Stärke/Zeit ab
Start) · 07 Wellen in Scheiben = dieselben 16 Eingaben in derselben Reihenfolge wie makeWaves · 08 keine Seitenfehler · 09 andere
Rate → alter Weg, Metall byte-gleich · 10 geänderter Worklet-Text → alter Weg · 11 Tipp sofort bei bereit → spielt, keine Fehler ·
12 WT-Wellen nicht mehr im Tipp (Basis: +77 ms über den Getter in spawnVoice; Index: erst +1585 ms aus den Scheiben).
Zum noteLog: die ersten Schläge sind schon Basis gegen Basis nicht gleich (Trommeln am Start hängen von der Hauptfaden-Zeit ab) –
darum Schläge 2–8 mit Kontrolle.

## Offen
1. **AudioContext/Knoten im Tipp** (new AudioContext 31–111 ms, Graph, Trommel-Faltungshall 23–60 ms) bleiben – das geht nur mit
   einer Umgebung. Vorschlag (nicht gebaut, braucht Xanders Okay, berührt die iOS-Regel): die Tipp-Arbeit teilen – im Tipp nur
   AudioContext + resume (Geste), Graph + ▶ eine Aufgabe später (Bild kann dazwischen zeichnen). Tipp→Ton bliebe gleich, aber
   ensureAudio wird an ~60 Stellen synchron erwartet → eigenes Paket.
2. Trommel-Faltungshall (ROOM/GATE-ConvolverNode) im ersten Planer-Schritt: könnte vor dem ersten Trommelschlag in einer eigenen
   Aufgabe direkt nach dem Tipp entstehen – nur sinnvoll zusammen mit 1.
3. Nach dem Tipp bis zum fertigen Worklet: Planer-Aufgaben 50–200 ms mit nativen Stimmen, FX.Echo 17–50 ms, convWarm 16–32 ms
   (Faltungs-IR, obwohl das Worklet-Hall kurz danach kommt) → A1/LT-Liste.
4. Test-Falle PERF1B bei 44,1 kHz (Nebenbefund 5): für Messungen immer synq.perf1b.sr setzen; am Gerät prüfen, ob die iPhone-Rate
   wirklich 48 kHz ist (sonst greift PERF1B erst ab dem 2. Start).
5. Am iPhone bestätigen (Chromium ist nur Näherung): erster ▶ nach Kaltstart fühlbar schneller, Ton sofort, kein Unterschied im Klang.
