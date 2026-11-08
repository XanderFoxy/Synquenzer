# BEG1 – Begleiter (Live-Begleitautomatik) · Basis 4.52.0

## Für Xander
- **AKKORD ▾** über der Tastatur › **BEGLEITER** (oder ≡ › Bedienung › Begleiter An). Dann liegt eine Leiste über der Tastatur.
- Du spielst einen Akkord oder nur den Grundton. Die Band startet sofort am Taktstrich, mit deinen Spuren und Klängen. Ein neuer Akkord wechselt am nächsten Schlag (mit WECHSEL am Takt), und lässt du los, bleibt er stehen.
- INTRO · A schlicht · B voll · FILL am Taktende · SCHLUSS (Schlusstakt, dann Stopp). Unter STIL ▾ wählst du Stil, Spuren und Figur (Akkorde, Fläche oder Arp).
- ● AUFN. legt das Gespielte als neue Szene an, mit Akkord-Zeile und auf Wunsch auch ans Song-Ende. Ein ↶ nimmt alles zurück; das ↶ sitzt jetzt auch in der Leiste.
- Die große ● AUTO-Taste nimmt die Band bei einem neuen Song jetzt mit: Der Song spielt hinterher genau das, was du gehört hast.
- ✕ schließt die Leiste. Danach sieht und klingt alles wie vorher, auch die Spuren, die beim Start still waren.

## Technik
- Alles steht im Block `/* ===== BEG1-BEGIN … BEG1-END */` direkt hinter SND1-END. Dazu kommen 5 Einhänge-Stellen (7 Zeilen, alle mit „BEG1“ markiert):
  - `transposerOpts` → `beg1Opts`: Leiste offen = AKKORD, Latch an, Wechsel Schlag oder Takt.
  - `osActive` → `beg1OsOff`.
  - `scheduleTrack` → `beg1Sched`: Ziel-Spuren spielen die Band, ihre Clips nur außerhalb des Laufs.
  - `popHMode` → `beg1HmRow`.
  - `openMenu` → `beg1MenuRow`.
  - Im Block umhüllt sind `T.onCommit` (Sync-Start, Akkord-Mitschrift), `T.tick` (derselbe Akkord startet nach ■ wieder; der Träger meldet in dem Fall keinen Wechsel) und seit der Prüfung `songRecEnd` (● AUTO nimmt die Band mit, siehe Prüfung 6). `songRecEnd` wird überall über seinen Namen gerufen; die Hülle ruft das Original unverändert auf.
- Wiederverwendet statt doppelt gebaut:
  - Akkord folgen: Träger (Transposer, detectChord), Wechsel quantisiert, Latch. Klingende Töne beim Wechsel übernimmt `applyCarrierChange`.
  - Muster: die eine Stil-Liste `gr2Order` (GR1/GR2/GEN3, Taktart-Stile nur passend zur Projekt-Taktart). Daraus kommen `gr1DrumNotes`/`gr1Thin` (Drums B/A), `gr1BassNotes` und der Übersetzen-Kern `gr2Translate` (Bass, Akkord- und Flächen-Raster) sowie `x.seq` (Arp).
  - Stimmführung und Lage aus dem Werkzeugkasten: `hm1Pcs`, `bb1Voice`, `bb1Root`.
  - Fill = Genre-Fill aus der einen Fill-Bibliothek (UE_LIB/GEN3).
  - Gespielt wird über `spawnClipVoice`/`drumHit`, also mit Arp der Spur, Swing und „Drums mittransponieren“. Die Töne stehen im noteLog mit src `beg`.
- Aufnahme: Neue leere Szene mit einem Clip je Ziel-Spur (Stufe I, genau die gespielten Noten) und `normChordRow` als Akkord-Zeile. Wahlweise kommt sie per `sceneChunk`/`opInsert` ans Song-Ende. Alles ist ein Undo-Schritt (Gruppe). Es gibt keine neuen Projekt-Felder; die Einstellungen liegen je Gerät in `uiPrefs.beg1`.
- In diesem Lauf fertiggestellt bzw. behoben:
  - Sync-Start mit demselben Akkord nach dem Stopp (`T.tick`-Hülle).
  - Lange Jams vergessen alte Takte (über 96 Takte; eine laufende Aufnahme behält ihre).
  - „SCHLUSS“ passt quer bei 370 px in die Taste.
  - Testskript korrigiert: Basis-Vergleich nach dem ersten Ton, Öffnen während eine Szene läuft, Zählung der Einhänge-Zeilen, zufällige id/uid, Trefferfläche des Blatt-✕.
  - Neue Testabschnitte: Ein-Finger, Ausgang (Summe), altes Projekt laden.

## Tests (alle grün)
- `node beg1-test.mjs <index.html> <ordner>` → **OK BEG1: 59/59 bestanden** (Laufzeit ca. 4 min; Lauf-Protokoll `beg1-test-lauf.log`). Die 12 neuen Prüfungen stehen unten unter „Prüfung“.
  - Aus: pixelgleich zur Basis, auch nach Öffnen und ✕ (hochkant und quer). Szene 1 klingt laut noteLog gleich.
  - C–Am–F–G per Tastatur: Wechsel jeweils auf dem nächsten Schlag. Bass 100 % Akkordton mit Grundton auf jeder Eins. Begleitung 100 % Akkordton (Fläche, Akkorde, Arp). Die Drums sind genau das Stil-Grundmuster.
  - Wechsel am Takt: richtig. Ein Finger: A = a-Moll, D = d-Moll; F+A = F, E+G = Em.
  - Intro, A↔B, Fill und Schluss klingen messbar verschieden. Nach dem Stopp: 0 Stimmen, kein Ton mehr.
  - Aufnahme = Live: 185 zu 185 Töne gleich. Ein ↶, ↷, Speichern und Laden gleich.
  - Öffnen im Lauf: die Band übernimmt am nächsten Taktstrich. ✕ im Lauf: der Takt spielt zu Ende, danach laufen wieder die Clips.
  - CPU: Ø 63 µs je Spur und Fenster, Spitze 8,8 ms (einzelner Ausreißer im Lauf nach der Prüfung, vorher 2,5–3,0 ms), 0 lange Aufgaben, keine Planer-Fehler.
  - Ausgang (Summe, Echtzeit): kein Übersteuern, keine Aussetzer. Der Ausklang fällt gleichmäßig auf −84 dBFS nach 3,5 s.
  - Touch hochkant 428×926 sowie quer 926×428 und 926×370: Tasten ≥ 44 px, ✕ frei, kein Layout-Springen.
  - Lauflichter, Guide, Menü und 3/4-Walzer: OK. Pflichtwörter OK, ein altes Projekt lädt und klingt gleich, keine Konsolenfehler.
- `topdefs.cjs`: 0 doppelt / 0 Syntaxfehler. `dupkeys.cjs`: 0. `smoke.mjs`: errors [].
- Fotos in `fotos/`: Leiste (jetzt mit ↶), Blatt und spielender Zustand hochkant, quer und quer-370, dazu der Zustand nach Schluss; aus der Prüfung `beg1-pruef-undo-verlauf-hochkant.png` und `beg1-pruef-ohne-stil-5-4-hochkant.png`.

## Offen
- Echt-iPhone (Safari) noch nicht angefasst. Gemessen wurde in Chromium (Playwright).
- Töne, die der Träger beim Akkordwechsel neu anschlägt, stehen im noteLog als src `clip` statt `beg`. Sie entstehen in `applyCarrierChange`, außerhalb des Blocks. Der Klang ist richtig, nur das Etikett im Protokoll weicht ab.
- Ein-Finger-Grundton zeigt „A“, wie der Träger in der ganzen App schreibt. Mit Harmonie „Stufe der Tonart“ klingt er in C-Dur als a-Moll; das erklärt das Blatt.
- ● AUTO über einen schon vorhandenen Song (Aufnahme „über den Song“, `songRecStartOver`) nimmt die Band noch nicht mit. Das ist ein eigener Weg mit Durchgängen, Einfügen und Ersetzen. Dafür ist ● AUFN. der Leiste da. Ein neuer Song (● AUTO ohne Song) nimmt sie mit.
- Wechselt eine Ziel-Spur während einer Aufnahme, zählt die Spur, die am Ende Ziel ist (wie bei ● AUFN.).
- SCHLUSS: Ist das Metronom an, kann sein Klick auf der Eins nach dem Schlusstakt noch kommen. Die Spuren planen dort nichts mehr; der Klick liegt außerhalb des Blocks.
- Für die Zusammenführung:
  - Die Einhänge-Zeilen liegen in `transposerOpts`, `osActive`, `scheduleTrack` (erste Zeile), `popHMode` und `openMenu` (hinter `jam2MenuRow`).
  - Neue GEN4-Stile erscheinen automatisch über `gr2Order`.
  - Taktart-Prüfung: `tsBeats(st.ts)` gegen `t1SceneBB()`.

## Prüfung (BEG1-P, unabhängiger Prüfer, Prüfskripte in `pruef/`)
Alle sechs Befunde habe ich mit den Skripten des Prüfers nachgestellt (Kopien in `../beg1tools/rp/`, damit seine Fotos bleiben) und bestätigt. Alle sechs sind behoben, nur im BEG1-Block; die Einhänge-Zeilen außerhalb sind unverändert (5 Stellen, 7 Zeilen). Pflicht: topdefs 0 doppelt / 0 Syntaxfehler, dupkeys 0, smoke errors [], Pflichtwörter nicht mehr als in basis.html, „MS 2000“ 1×, „  live: true,“ 1×, basis.html unverändert (md5 wie in `pruef/md5-vorher.txt`).

1. **SCHLUSS ließ noch Töne der übrigen Spuren durch.** Bestätigt mit p1/p1b: „Synth 2“ auf Schlag 16; der Stopp kam bei 16,015–16,191.
   - Behoben: `beg1Decide` merkt den Schlusstaktstrich als `run.stopB`. `beg1Sched` (der Haken in `scheduleTrack`) kürzt danach das Planfenster aller Spuren auf `stopB`, nicht nur das der Ziel-Spuren. Dahinter plant keine Spur mehr.
   - Der Stopp selbst kommt aus einem eigenen Zeitgeber genau am Taktstrich, sobald er näher als 0,3 s ist. Vorher kam er aus dem 120-ms-Takt.
   - Gemessen (p1 4×, p1b 3×): danach 0 Töne, Stopp bei Schlag 16,004–16,029. Test: Prüfung 1 (120 und 157 BPM).
2. **Ziel-Spur im Lauf ändern.** Bestätigt mit p7b: Mit „Drums: aus“ spielten danach 28 eigene Clip-Schläge; beim Bass auf Spur 4 gab es zwei Basslinien.
   - Behoben: Ein Start über den Begleiter („nur die Band“, erster Akkord oder ▶ der Leiste) merkt sich seinen Lauf (`soloRun`).
   - Verliert eine Spur in diesem Lauf ihre Rolle, wird sie still (`beg1Hush`), genau wie beim Start. Ihr Szenen-Stand wird für ✕ gemerkt.
   - Läuft dagegen eine Szene und der Begleiter wurde dazu geöffnet, spielen die übrigen Spuren ohnehin ihre Clips. Dann kehrt die alte Ziel-Spur zu ihrem Clip zurück, wie eine Spur, die vor dem Start kein Ziel war.
   - Gemessen (p7b): Drums danach 0 Schläge. Alte Bass-Spur danach 0 Töne, Spur 4 hat 16 Band-Bass-Töne. Test: Prüfung 2 (2 Zeilen).
3. **Nach ✕ fehlte der Startzustand der Szene.** Bestätigt mit p10: `R.slot` war [0,-1,0,…], ▶ spielte nur 0,2,4.
   - Behoben: `beg1Alone` merkt sich den Stand jeder Spur, die es still stellt (`BEG1.solo`, mit einer Signatur aller Slots danach). ✕ (`beg1Restore`) holt ihn zurück: gestoppt sofort; im Lauf als vorgemerkter Start (`R.pend`) genau an dem Taktstrich, an dem die Band aufhört, in der Phase seit ▶.
   - Hat Xander inzwischen selbst eine Szene oder einen Clip gestartet oder gestoppt, stimmt die Signatur nicht mehr, und sein Stand bleibt.
   - Gemessen (p10): `R.slot` nach ✕ = vorher, ▶ spielt 0,1,2,4. Test: Prüfung 3 (gestoppt; im Lauf: Synth 2 setzt ab Schlag 8 ein, davor 0 Töne; selbst angetippte Szene 2 bleibt).
4. **Die Leiste verdeckt ↶ und weitere Bedienelemente.** Bestätigt mit p11. Dass Spur-Leiste und Träger-Zeile unter der Leiste liegen, ist so gebaut:
   - Die Träger-Einstellungen (AKKORD, Latch, Wechsel) übernimmt der Begleiter, solange er offen ist. ORIGINAL würde die Band auf Stufe I zurücksetzen.
   - KLANG, ✎, M und ⇅ erreicht man nach ✕ oder über den Spurkopf in der Matrix.
   - Behoben ist der eigentliche Mangel: In der Leiste gibt es jetzt ein ↶. Es ruft dieselben Funktionen wie das ↶ der Spur-Leiste: Tipp = `undo()`, Halten = Verlauf (`sx14Open`). Es ist ausgegraut wie dieses.
   - Platz (nur die neue Leiste, sonst nichts umgestaltet): hochkant 7 statt 6 Spalten (Zeile 1 „STIL · AKKORD · WECHSEL · AUFN. · ↶ · ✕“, Zeile 2 „INTRO A B FILL SCHLUSS ▶▶“, ▶ zwei Felder breit). Quer belegt das ↶ das zweite Feld von ● AUFN.
   - Alle Tasten sind ≥ 44 px (hochkant 56×44, quer 54×73 bzw. 54×60). „SCHLUSS“ passt (52 px Text in 54 px); quer bleibt alles wie vorher. Fotos: `fotos/beg1-leiste-*.png`, `fotos/beg1-pruef-undo-verlauf-hochkant.png`. Test: Prüfung 4 (Tipp per Touch nimmt die Aufnahme zurück, Halten öffnet den Verlauf, die Leiste bleibt offen) und Abschnitt 9 (alle Tasten frei und ≥ 44 px in allen drei Lagen).
5. **In 5/4, 7/8 und 12/8 ohne passenden Stil startete der erste Akkord trotzdem.** Bestätigt mit p9c.
   - Behoben: Ohne Stil startet weder der erste Akkord noch ▶ der Leiste (`beg1Go`, `beg1SyncGo`), und es wird keine Spur still gestellt.
   - Ein Hinweis sagt warum: „Begleiter: noch kein Stil für den 5/4-Takt · der Akkord startet nichts · ▶ oben spielt deine Spuren wie sonst“. Er kommt beim Öffnen und, höchstens alle 4 s, beim Akkord.
   - Sobald GEN4 Stile für diese Taktarten bringt, erscheinen sie über `gr2Order`, und alles startet normal.
   - Gemessen (p9c): kein Start, Slots unverändert, 0 Töne. Foto `fotos/beg1-pruef-ohne-stil-5-4-hochkant.png`. Test: Prüfung 5.
6. **● AUTO nahm die Band nicht auf.** Bestätigt mit p13/p13b: Nur 48 von 81 Tönen stimmten.
   - Behoben für einen neuen Song: `songRecEnd` ist im Block umhüllt. Nach einer gültigen Aufnahme werden die Band-Takte im Song zu neuen Szenen (`beg1Scene`, derselbe Kern wie ● AUFN.; je höchstens 16 Takte, mit Akkord-Zeile).
   - Die Song-Spuren der Ziel-Spuren spielen dort genau diese Szenen (`beg1Lane`). Ziel-Spuren ohne Töne sind dort still. Danach spielt wieder, was vorher lief, in seiner Phase (`ph`).
   - Läufe, die während der Aufnahme mit ✕ enden, bleiben dafür gemerkt (`srRuns`). Im Song kann der Begleiter also auch nur eine Weile spielen.
   - Alles gehört zum ↶-Schritt der Song-Aufnahme: Der Eintrag wird zur Gruppe, wie bei der Stimme (`tkSongUndoFix`).
   - Gemessen (p13b): 81 von 81 Tönen gleich. Test: Prüfung 6 (101 von 101 Tönen der Ziel-Spuren gleich, mit A→B und 3 Akkorden; ein ↶ nimmt Song und Szene zurück, ↷ bringt beides klanggleich wieder, Speichern/Laden klingt gleich). Dazu „nur eine Weile“: im Lauf geöffnet, ✕ vor dem Song-Ende, alle Spuren 210 von 210 Tönen gleich.
   - Offen bleibt die Aufnahme über einen vorhandenen Song (siehe „Offen“).
- Danach liefen: das Testskript mit 59/59 (die alten 47 unverändert grün, dazu 12 neue), topdefs 0/0, dupkeys 0 und smoke errors [].
