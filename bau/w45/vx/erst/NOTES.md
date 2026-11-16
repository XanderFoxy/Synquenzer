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

## Messung NACHHER (A/B abwechselnd basis/index, Rate bekannt, je frische Seite; Rohdaten `mess/ab4.jsonl`, `mess/ab4b.jsonl`, `mess/ab1.jsonl`)
**Was belegt ist und was nicht (seit der Prüfung, Befund 1):**
- **Belegt (Aufbau):** makeWaves, der große Blob und der Metall-Puffer laufen nicht mehr in der Tipp-Aufgabe (ERST-12, instr-Läufe,
  Prüfer 2: makeWaves Basis +71…+229 ms im Tipp, ERST erst ab ≈ +1,5 s in Scheiben ≤ 22 ms).
- **Belegt (CPU-Zeit der Tipp-Aufgabe, Trace):** −17 bis −25 % auch unter hoher Last (Prüfer 2: 1× 64,9 → 53,9 ms, ERST in 10 von 10
  Paaren niedriger, Last 15–28; 4× 338 → 252 ms, P = 0,69, Last 22–30). Bei ruhigem Rechner (Prüfung, `nach/n-ab*.jsonl`, Last 3,5–9):
  1× 75,6 → 54,6 ms (P = 0,88), 4× 292 → 233 ms (P = 0,83).
- **Wandzeit und Tipp→Ton:** bei ruhigem Rechner sichtbar (Prüfung, je 6 Paare, Last 3,5–9: 1× Wandzeit 148 → 93 ms, P = 0,97;
  Tipp→Ton 183 → 154 ms, P = 0,83; 4× Wandzeit 342 → 265 ms, P = 0,86; Tipp→Ton 265 → 227 ms, P = 0,64), **unter Rechnerlast 15–30
  nicht belegt** (Prüfer 2: Tipp→Ton P = 0,52 / 0,55, Wandzeit P = 0,65 / 0,50). Tipp→Ton bei 4× ist auch in Ruhe nur schwach
  (P = 0,64). Die Prozentzahlen der Tabelle unten (Bauer, 2–8 Paare) sind darum Stichproben, kein gesichertes Ergebnis; am iPhone
  nachmessen (Offen 5). P = Wahrscheinlichkeit, dass ein Basis-Lauf länger dauert als ein ERST-Lauf (Mann-Whitney).

Tabelle des Bauers (wenige Paare, Last 5–29):
| | Basis | ERST | Δ |
|---|---|---|---|
| 4×, Stapel 1 (Last 7,6–9,5), Tipp-Aufgabe Median (4 Läufe) | 333 ms [331, 394, 318, 335] | 270 ms [288, 396, 251, 224] | −19 % |
| 4×, Stapel 1, Tipp→Ton Median | 289 ms | 252 ms | −13 % |
| 4×, beide Stapel (8 Paare; ERST ohne 1 Lauf bei Last 22) Tipp-Aufgabe | 340 ms | 288 ms | −15 % |
| 4×, beide Stapel, Tipp→Ton | 293 ms | 269 ms | −8 % |
| 1× (Last 5,6–6,7, 2 Paare) Tipp-Aufgabe | 118 ms [136, 99] | 82 ms [85, 79] | −30 % |
| 1×, Tipp→Ton | 160 ms | 136 ms | −15 % |
Direkt gemessen in der Tipp-Aufgabe (instr, 4×): makeWaves 50–208 ms → 0 (nur 0,6–3 ms für die Eingaben, 1,5 s später in
Scheiben ≤ 12 ms, zusammen 26–60 ms); SynthHost.load 13–30 ms → 0,4–3 ms; buildBuffers 20–31 ms → 6–13 ms (nur noch das Rauschen).
Vorarbeit vor dem Tipp: Blob 30–71 ms in 8 Leerlauf-Schritten, Metall 17–50 ms in 4 Schritten (keine lange Aufgabe; Summe je nach Last).
Die Summe der langen Aufgaben in den ersten 2,5 s ändert sich wenig (861 → 775 ms Median): der Rest sind AudioContext, Knoten und
die nativen Stimmen bis zum Worklet (Offen 1–3). Streuung unter Last ±30 %; der Unterschied ist in Stapel 1 und bei 1× in jedem
Paar sichtbar, in Stapel 2 (Lastspitze bis 22) nur im Median.

## Tests
`node erst-test.mjs index.html basis.html` → **16/16 OK** bei Last 14–15,5 (Fassung nach der Prüfung, index md5
bb817396b41d1e598b6378079773eca0 unverändert; `erst-test.out`, `erst-test.json`); zweiter Lauf gleichzeitig mit der Pflicht
(Last 13–15) ebenfalls 16/16, 06 im 2. Versuch (`nach/neu-lauf2.out`):
01 kein (Offline)AudioContext vor dem Tipp · 02 Vorarbeit fertig · 03 Worklet über die vorbereitete Adresse ('blob', ready),
Metall übernommen · 04 Metall byte-gleich zur Basis (FNV 6fe0a136) · 05 Rauschen bei gleicher Zufallsfolge ab dem Tipp byte-gleich
(222a6644) · 06a Kontrolle Basis=Basis · 06 noteLog Schläge 2–8 gleich (61 Noten, Spur/Quelle/Ton/Schlag/Dauer/Stärke/Zeit ab
Start) · 06b in keinem Versuch eine geänderte oder zusätzliche Note · 07 Wellen in Scheiben = dieselben 16 Eingaben in derselben
Reihenfolge wie makeWaves · 08 keine Seitenfehler · 09 andere Rate → alter Weg, Metall byte-gleich · 10 geänderter Worklet-Text →
alter Weg · 11 Tipp sofort bei bereit → spielt, keine Fehler · 12 WT-Wellen nicht mehr im Tipp (Basis: über den Getter in
spawnVoice; Index: erst ab ≈ +1,5 s aus den Scheiben) · 13 alle Synth-Spuren WT beim ersten Tipp: Wellen wie in der Basis sofort
über den Getter, jede WT-Stimme bekommt PeriodicWaves (0 ohne), spielt · 14 WT-Note mitten in den Wellen-Scheiben: Getter baut alle
16, Scheiben hören auf, keine Fehler.
**Zufall im noteLog-Vergleich (seit der Prüfung):** bis das Rauschen steht dieselbe Folge ab dem Tipp (für 05), danach liefert
Math.random im Test fest 0,5. Vorher hing die Folge für Humanize/Wahrscheinlichkeit davon ab, wie viele native Stimmen vor dem
Worklet ihre Startphase gezogen hatten (Hauptfaden-Zeit) – darum war schon Basis gegen Basis (06a) ungleich. Fehlen Noten nur
(Planer-Aussetzer unter Last: Lücke > LOOKAHEAD 0,1 s + RETRO_MAX 0,2 s) oder sind sie verschoben (t = jetzt), wird das Trio
höchstens zweimal wiederholt. 06b ist rot, wenn eine Index-Note in jedem Versuch anders ist und in keinem Basis-Lauf vorkommt
(eine echte Änderung durch ERST wäre immer da; ein Last-Ausfall nicht).

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
6. ~~erst-test ERST-06/06a unter Last wackelig~~ → in der Prüfung behoben (Zufall nach dem Rauschen fest, Wiederholung nur bei
   fehlenden Noten, 06b). Bleibt: unter sehr hoher Last (Stress-Probe mit 2×/4× Drosselung, Last 12–26) verliert der Planer auch in
   der Basis bis zu 27 Noten je Lauf – dann bleiben 06/06a nach 3 Versuchen rot; maßgeblich ist dann 06b.

## Pflicht (Endfassung nach der Prüfung, `pflicht.log`, Last 14–16)
topdefs: Skripte 26, Namen 7998, doppelt 0, Syntaxfehler 0 · dupkeys: 0 doppelte Schlüssel · smoke: `title SYNQUENZER errors []`
(`smoke.png`) · „MS 2000“ 1× · `^  live: true,` 1× · VERSION '4.76.1' · md5 vorher = nachher.
md5: basis.html e4dc1b9599eef2656308cb990e407f37 · index.html bb817396b41d1e598b6378079773eca0 (unverändert seit dem Bau)

## Prüfung (Prüfer 2 → Nachbessern)
Sicherung vorher: `sicherung-0828/`. Eigene Läufe und Skripte: `nach/` (Prüfer-Dateien in `pruef/` unverändert).

**Befund 1 (mittel) – Gewinne bei Tipp→Ton und Wandzeit unter Last nicht nachweisbar: bestätigt, behoben (Bericht/NOTES).**
Nachgeprüft mit den Skripten von Prüfer 2 (`nach/p2-ab.sh`, abwechselnd, Reihenfolge je Paar gewechselt) bei ruhigem Rechner:
| Last 3,5–9, je 6 Paare | Basis | ERST | P(Basis > ERST) |
|---|---|---|---|
| 1× CPU-Zeit Tipp-Aufgabe | 75,6 ms | 54,6 ms | 0,88 |
| 1× Wandzeit Tipp-Aufgabe | 148 ms | 93 ms | 0,97 |
| 1× Tipp→Ton | 183 ms | 154 ms | 0,83 |
| 4× CPU-Zeit | 292 ms | 233 ms | 0,83 |
| 4× Wandzeit | 342 ms | 265 ms | 0,86 |
| 4× Tipp→Ton | 265 ms | 227 ms | 0,64 |
Zusammen mit Prüfer 2 (Last 15–30: CPU-Zeit belegt, Wandzeit/Tipp→Ton P = 0,50–0,65): Der Aufbau-Gewinn und die CPU-Zeit sind
belegt; Wandzeit und Tipp→Ton nur bei ruhigem Rechner, unter Last nicht. „Messung NACHHER“ sagt das jetzt so; die alte Tabelle ist
als Stichprobe markiert. Für die Funk-Antwort: „Der erste Tipp auf ▶ hat weniger Arbeit (Wellen, Blob, Metall-Puffer vorher bzw.
später in kleinen Scheiben); bei ruhigem Rechner ist er spürbar schneller, am iPhone bitte nachfühlen.“ Keine Prozentzahl für
Tipp→Ton nennen.

**Befund 2 (klein) – erst-test ERST-06/06a wackelt: bestätigt, Ursache im Test, behoben (Test).**
- Nachgeprüft: alter Test 4× unter Last 12–25 (2×/4× Drosselung, 4 Tests gleichzeitig): jedes Mal 06 und 06a rot (10–11/13).
- Ursache wie vom Prüfer beschrieben: phase() der nativen Stimmen zieht Math.random; die Zahl bis zum Worklet hängt von der
  Hauptfaden-Zeit ab → Humanize/Wahrscheinlichkeit verschieben sich (Basis gegen Basis). Auch der eine fehlende Kick auf Schlag 2
  (p2-tick, ERST 1 von 5) ist dieselbe Note, die im alten Test auch Basis gegen Basis fehlt (alt-thr2: `nurIdx` Kick 36 Schlag 2).
- Behoben: Zufall nach dem Rauschen fest 0,5; neuer Versuch bei Ungleichheit (≤ 3); 06b; dazu zwei weitere Test-Fallen aus dem
  Stresstest beseitigt: ERST-07 zählte eine Pulse-Welle (pulseWave, 96 Werte) einer nativen Stimme mit → nur 33-Werte-Wellen ohne
  Optionen zählen; vom Planer verspätete Noten (t = jetzt) galten als „anders“ → Paarung „verschoben“ (≤ 0,35 s).
- Neue Tests aus den Proben von Prüfer 2: ERST-13 (alle Synth-Spuren WT beim ersten Tipp) und ERST-14 (WT-Note mitten in den
  Wellen-Scheiben).
- Ergebnis: Last 3,96 16/16 · Last 14–15,5 16/16 · zweiter Lauf gleichzeitig mit der Pflicht 16/16 (06 im 2. Versuch: im 1. Versuch
  fehlten dem Index 13 Noten um Schlag 3 = ein Planer-Aussetzer während der Rauchtest parallel lief; keine geänderte Note).
  Unter Stress mit Drosselung (Last 22–26) bleiben 06/06a rot – dort verliert auch Basis gegen Basis bis zu 27 Noten; 06b war in
  einem von zwei Läufen rot (eine Hi-Hat Schlag 2,25, die der Basis in allen drei Versuchen fehlte, weil die schwerere Basis-
  Tipp-Aufgabe früh Noten verliert) → 06b danach gegen alle Basis-Läufe aller Versuche geprüft (aktuelle Fassung).

**Am Produkt (index.html) nichts geändert** – beide Befunde betrafen Bericht und Test. Code-Durchsicht wie Prüfer 2 (Getter nur in
NativeVoice.source gelesen, Adresse einmal und nur bei gleichem Text, erstBufs nur live/gleiche Rate/fertig, Scheiben nur bei
AU.ctx === c und ohne vvOff) – keine weiteren Befunde.

**Offen nach der Prüfung:** 5 (iPhone: erster ▶ nach Kaltstart fühlbar schneller?) bleibt der eigentliche Nachweis für Wandzeit
und Tipp→Ton. Stress-Läufe in `nach/alt-thr*.out`, `nach/neu-thr*.out`, Last in `nach/last-thr2.log`.
