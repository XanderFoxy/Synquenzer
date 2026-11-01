# VK3 – Video-Ansicht „Klavier“ (Konzept V3)

## 1. Für Xander

- Neu im Video: **Klavier**. Unten liegt eine Tastatur, von oben fallen die Noten als Balken auf die grüne Jetzt-Linie. Jede Spur hat ihre Farbe. Leise Töne sind heller und kühler, laute satter und wärmer, und Akzente glühen. Die Taste, die gerade klingt, leuchtet in derselben Farbe.
- Drums erscheinen nicht als Noten. Über der Tastatur liegt eine Leiste mit KICK · TOMS · SNARE · HATS, und jedes Feld glüht bei einem Schlag kurz auf: je fester der Schlag, desto heller.
- So wählst du es: Teil oder Taktbereich antippen und in der Zeile „Video“ die zweite Reihe öffnen, dort **[Klavier]**. Wählst du nichts, nimmt die Auto-Regie Klavier ab und zu von selbst: bei jedem zweiten Teil, der eine Song-Melodie hat.
- 16:9 und 9:16 werden beide sauber gezeichnet. In der ▶ Vorschau und im Standbild siehst du Klavier auch schon, dann mit den Noten aus dem Song.

## 2. Technische Änderungen (nur `index.html`, Kürzel VK3)

**Eigener Block** `/* VK3-BEGIN … VK3-END */` direkt nach `/* VV4CE-END */`:

- **Ansicht registrieren:** `VV_DIRV.push('klav')`, `VV4_OWN.add('klav')` und `VV4_NAME.klav = 'Klavier'`. Das geschieht zur Laufzeit am Ende der Listen, damit die Listenzeilen selbst unverändert bleiben (weniger Merge-Konflikte).
- **`vvkDraw(g, W, H, st, vt)`:** zeichnet das ganze Bild in App-Punkten (kurze Seite = 360). Kopfzeile: wer spielt (Farbe + Kurzname), Teil-Chip, TAKT n. Darunter die Fallfläche mit Oktavlinien, Schlag-/Taktlinien, Taktnummern und den kommenden Teilanfängen (gelb mit Namen). Dann Notenbalken (lange zuerst, kurze darüber, 1,5 pt Lücke zur nächsten Note auf derselben Taste, Notenname im Balken), die Jetzt-Linie (wird beim Kick heller), die Drum-Leiste und die Tastatur.
  - Die unbeleuchtete Tastatur wird einmal je Layout in eine eigene Leinwand gezeichnet und pro Bild nur kopiert. Danach kommen die leuchtenden Tasten samt Anschlag-Licht.
- **Notenquelle:**
  - Im Video `vvkGather`: die Noten des Offline-Durchlaufs (`src.nt`, dasselbe Log wie VV3/VV4). Damit ist alles so, wie es klingt: Träger, `song.xp`, Skala, Arp, eigene Song-Clips, Song-Melodie.
  - Ohne Durchlauf (Vorschau, Standbild) `vvkScore`: die Noten aus Song-Spuren, Clips, Träger (`mapOut`), `song.xp` und Song-Melodie, so wie `buildMidiSong` sie liest. Gecacht nach Song-/Clip-Version.
- **Tastaturbereich `vvkRange`:**
  - Basis sind die Song-Noten des Video-Bereichs.
  - Im Video kommen alle gerenderten Noten bis t + Vorschauzeit dazu. Der Bereich wächst nur und springt nicht hin und her.
  - Er umfasst ganze Oktaven C…B, mindestens zwei. Ohne Noten gilt C3–B4.
- **Anschlagfarbe `vvkCol`:** in HSL innerhalb der Spurfarbe. Leise wird heller und Richtung kühl verschoben, laut satter und Richtung warm (±16°). In 16 Stufen gecacht. Ab v ≥ 0,88 bekommt der Balken einen Lichthof.
- **Vorschauzeit:** `vvkFut` = 6 Schläge, begrenzt auf 2–3,5 s.
- **Auto-Regie `vvkAuto`:** ersetzt nur das „App“ eines Teilanfangs, und zwar beim 2., 4., … Teil mit Song-Melodie. Der Bereichsanfang bleibt App. Neue Clips oder Drums haben weiter Vorrang. Ohne Song-Melodie bleibt die Schnittliste unverändert (Hash gleich).
- **`vvkWait(job, f)`:** Ein Bild **innerhalb einer Klavier-Einstellung** (oder in den 300 ms Blende danach) wartet beim WebCodecs-Bau, bis die Noten seiner nächsten Sekunden gerechnet sind. Sonst würden Noten fehlen und zwei Renders sähen verschieden aus. Alle anderen Bilder laufen wie bisher.
- **Test-API:** `vvkApi()` liefert `vvkShot`, `vvkScoreShot`, `vvkProbe`, `vvkScore` und `vvkAuto`.

**Einhänge-Zeilen (je 1 Zeile, `// VK3`):**

- `vv4StripeCol`: Farbe für 'klav' im Regie-Streifen (`#c77dff`).
- `vvDirRow`: `[Klavier]` am Ende der zweiten Zeile. Das ist die einzige geänderte bestehende Zeile (`+ \`</div>\`` ist in die neue Zeile gewandert).
- `vvCuts`: `want = vvkAuto(song, x, A) || want;` im Teilanfang-Zweig.
- `vv4Pic`: `else if (v === 'klav') vvkDraw(...)`.
- `vvEncodeWC`: die Warte-Zeile `vvkWait`.
- `SYNQUENZER`: `Object.assign(SYNQUENZER, vvkApi())`.
- **`vvRenderAudio0`, Fund in der Basis:** Seit G10a-5 standen `log, ms, wk, nt, t0` des Render-Ergebnisses **im Kommentar** der Zeile `lead: … // G10a-5: lead log: …`. Deshalb hatte `VV.last` keine Noten. Eine Zeile danach setzt sie wieder: `if (!r.nt) Object.assign(r, {log, ms, wk, nt, t0})`.
  - Folge: Bilder, die gezeichnet werden, nachdem der Ton fertig ist, haben jetzt dieselben Noten wie die davor. Das gilt auch für Piano-Roll und Drum-Sequenzer (VV3/VV4).
  - Ohne diese Zeile wäre Klavier im hinteren Teil eines Videos auf die Song-Noten umgesprungen.

Nicht angefasst: `VERSION`, CHANGES, Aussehen und Bedienung der übrigen Ansichten.

## 3. Tests und Zeiten

Alle Tests liefen in Headless-Chromium (Playwright). Die Datei wurde per `file://` geladen. Song: 12 Takte, 112 BPM, Bass, Synth 2, Akkorde, Drums, Song-Melodie mit Anschlag 0,3–1, Strophe/Refrain/Strophe und +2 ab Takt 11.

- **`vk3-test.mjs`** (Aufruf: `node vk3-test.mjs <index.html> <out> full`): **ALLE OK, 18 Prüfungen, 0 Seitenfehler.** Geprüft wurde:
  - Regie-Zeile, Liste, Antippen und Zurücksetzen.
  - Auto-Regie: Klavier nur beim Refrain (Takt 5); App bei Takt 3 und 9; ohne Melodie kein Klavier.
  - Standbilder 16:9 und 9:16 aus dem Durchlauf, mit Noten, leuchtenden Tasten und Drum-Leiste.
  - Tastatur in ganzen Oktaven (C2–B5).
  - Transposition wie gehört: ab Takt 11 fallen die Akkorde als D–F♯–A statt C–E–G, siehe `vk3-klavier-16x9-transponiert.png`. Die Song-Melodie folgt der Transposition nicht, wie in der App.
  - Anschlagfarben.
  - Zwei Durchläufe ergeben gleiche Bilder (PNG bitgleich).
  - Vorschau und Standbild im Video-Blatt mit Song-Noten.
  - Grenzfälle: ohne Song und nur Drums.
  - Echter Video-Render 16:9 und 9:16.
- **Determinismus des echten Videos (`vk3-det.mjs`):** Jedes Bild wurde beim Kodieren als Leinwand-Hash mitgeschnitten.
  - 16:9, Takt 3–7 (App → Klavier): **0 von 406 Bildern verschieden.**
  - 9:16, Takt 3–10 (App → Klavier → App, mit Blenden): **0 von 595 verschieden.**
  - Die MP4-Dateien selbst sind nicht bitgleich, weil der H.264-Kodierer nicht deterministisch arbeitet. Das gilt auch für die Basis.
  - Zum Vergleich die Basis mit demselben Song (Auto zeigt dort Matrix): 276 von 406 Bildern verschieden. Das ist ein vorhandenes Verhalten und wurde nicht angefasst.
- **Video-Render, Zeit:** `vk3-zeit.mjs`. Basis und VK3 liefen abwechselnd in einem Browser, je 4 Läufe, Median. Takt 3–7, also 13,5 s Video. Der Rechner war stark ausgelastet (andere Helfer rechneten parallel, Last ~6 auf 4 Kernen), die Werte streuen deshalb um ±30 %.

  | Auftrag | Basis | VK3 |
  |---|---|---|
  | 16:9 Auto (Basis: App + Matrix, VK3: App + Klavier) | 11,4 s | 12,1 s |
  | 16:9 Song (kein Klavier) | 8,2 s | 8,8 s (Rauschen, gleicher Code-Pfad) |
  | 9:16 Auto | 11,2 s | 10,9 s |

  Mehrkosten mit Klavier am Videoende: etwa +0,6 s. Das sind die letzten ~3 s Bilder, die auf ihre Noten warten. Ohne Klavier gibt es keine Wartezeit.
- **Zeichenzeit je Bild** (40 Bilder, gleicher Lauf, ruhiger Rechner):

  | Ansicht | 1920×1080 | 1080×1920 |
  |---|---|---|
  | Klavier | 3,0 ms | 5,1 ms |
  | App | 11,4 ms | 24,7 ms |
  | Piano-Roll | 1,7 ms | 2,1 ms |

  Unter Last schwanken alle Werte gemeinsam. Klavier lag nie über App.
  - Vorher lag Klavier bei 10,5 ms. Ein Verlauf über die ganze Fläche kostete ~5 ms in der Software-Leinwand und wurde ersetzt; die Tastatur ist jetzt vorgezeichnet.
- **Pflicht-Prüfungen:**
  - `topdefs.cjs`: Skripte 26, doppelt 0, Syntaxfehler 0 (Basis: ebenfalls 0 doppelt).
  - `smoke.mjs`: errors [].
  - Markenwörter 0 (auch ohne Groß-/Kleinschreibung).
  - `MS 2000` = 1, `^  live: true,` = 1.
- **Dateien hier:**
  - Bilder: `vk3-klavier-16x9-refrain.png`, `vk3-klavier-16x9-transponiert.png`, `vk3-klavier-9x16-strophe.png`, `vk3-klavier-9x16-refrain.png`, `vk3-video-16x9-frame.png` (Bild aus dem echten MP4), `vk3-blatt-vorschau-9x16.png` (Video-Blatt mit laufender ▶ Vorschau).
  - Video: `vk3-video-16x9-takt3-7.mp4` (WebCodecs; Opus nur im Test-Chromium).
  - Skripte: `vk3-test.mjs`, `vk3-det.mjs`, `vk3-zeit.mjs`.
