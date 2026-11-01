# SYNQUENZER v3 — Nachtrag 9, Paket G10: Gesang-Studio (Einsingen hören, Clip einzäunen, Takes, Warp-Platzierer, Tonhöhe, Chor)

## 0. Kurz für Xander

1. Dass du beim Singen keine Musik hörst, hat zwei Ursachen. Erstens schickt das iPhone die Musik auf die leise Hörmuschel oben, sobald 🎤 an
   ist. Zweitens startet ● die Szene nicht mit, und ● SONG schaltet die gewählte Spur stumm. Bis zum Fix: Kabel-Kopfhörer vor 🎤 einstecken und die Szene zuerst mit ▶ starten.
2. Der Hotfix 4.25.1 kommt direkt nach 4.25.0 und noch vor dem Video. Danach startet ● die Begleitung mit, und nach dem Vorzähler ist der Klick aus. Den Vorzähler gibt es dann auch bei laufender Musik und im Song.
   ● schaltet 🎤 selbst ein, und ● SONG mit 🎤 nimmt nur den Gesang auf. Die alte Stimme kannst du als Vorlage hören. Im Einzähler aus dem Stopp hörst du nur
   den Klick, die Musik setzt genau mit der Aufnahme ein (wie in jedem Studio-Programm). Deine Frage zum Auftakt: Was du im Vorzähler ansingst (bis 2 Takte), wird schon heute
   mitgeschnitten. Es klingt beim Einstieg des Clips und im Song vor dem Teil, aber nicht bei jeder Wiederholung der Schleife (G3).
3. Danach kommen erst das Video (4.26.0), der Songtext G9 (4.27.0) und die Chor-Gruppe G6+ (4.28.0), dann G10 „Gesang-Studio“ in drei Stufen (4.29.0–4.31.0). Kleine
   Gesangs-Fehler (abgeschnittener Ausklang, versehentlich verschobene Marken, Take-Nummern) kommen schon vorher mit 4.25.2. Am Gesangs-Clip ziehst du Klammern und kannst den Gesang rücken. Jeder Take bekommt eine Wellenform, einen Namen, eine Farbe und einen ★. Die „7 Takes“ sind
   7 getrennte Aufnahmen in denselben Clip. Der Warp-Editor zoomt bis ins Wort und verschiebt nichts mehr aus Versehen. Beim Einrasten siehst du einen Magneten, und ein Platzierer schneidet statt zu dehnen.
4. Die Tonhöhe rastet schon heute nur auf Töne der Tonart, und Konsonanten bleiben unberührt. Neu: Die Tonart ist wählbar, der Gesang wird im gewohnten Notenfenster bearbeitet,
   Chorstimmen erscheinen farbig als Schatten (Terz rot, Quinte grün …), und es gibt eine Vorlage zum Nachsingen. Eigene Chor-Spuren kommen mit G6+.
5. Alte Projekte klingen danach genau wie vorher. Von dir brauche ich nur drei Dinge: einen 5-Minuten-Gerätetest nach 4.25.1, die Freigabe für das Sprachmodell
   (Songtext erkennen) und, wenn du willst, eine Antwort zur Geldfrage Apple-Konto (Haptik beim Ziehen).

---

Status: **Entwurf, Fassung 2** (31.10. ~23:45 UTC; Fassung 2 = Prüfung gegen Xanders Punkte und den Code, 01.11., siehe §5). Grundlage ist Xanders lange Nachricht vom 31.10. ~23:30 UTC, Punkte 1–13 wörtlich in
`fragen-xander-9.md`, Abschnitt „31.10. ~23:30 UTC – Einsingen ‚sperrig‘“. Die Code-Analyse bezieht sich auf 4.25.0 im Merge-Stand
`synq-snapshots/G-GES-analyse-2330.html` (45 815 Zeilen). **Alle Zeilennummern (Z.) beziehen sich auf diese Datei** und verschieben sich beim Bau.
Bezüge: Nachtrag 5 (G1–G8), Nachtrag 8 + `n8/G9.md` (G9 Songtext), `n8/G9-probe-ergebnis.md` (Haptik-Probe 01.11.), `typische-fehler.md`.

**Kennzeichen:** **[A]** Annahme dieser Spec (wird so gebaut) · **[V]** sichtbare Neuerung, wird mit der Auslieferung im Funk angesagt ·
**[V-Funk]** ändert, was Xander bewusst festgelegt hat (Aussehen/Größe), wird **vorher** im Funk vorgeschlagen (CLAUDE.md Regel 3) ·
**[K]** nur aus dem Code gelesen, nicht gemessen · **[S]** Schätzung, wird gemessen · **[W]** Fakt aus Recherche.

**Regeln, die hier besonders gelten** (`typische-fehler.md`, CLAUDE.md):
- **27** Gebaut wird nur, was Xander besprochen hat (Punkte 1–13) und was hier steht. **Nicht** im Umfang: Mix/Mastering-Ketten, neue Effekte,
  Songtext-Erkennung (das ist G9), Taktarten (T1), Magic Scale.
- **28** Alte Projekte bleiben **Zeichen für Zeichen** gleich und klingen gleich. Jede Render-Änderung (Dehnen, Schleifenfüllung, Tonhöhe) hängt an
  einem **Versionsfeld**, das nur neue Bearbeitungen setzen. Bestehende `take.warp`/`take.pitch` ohne Feld rendern bitgleich wie in 4.25.0.
- **30** Professionell entscheiden, nicht fragen. Gefragt wird nur nach Geld und Zugängen (§4).
- **1/4/5** Treffer mindestens 44 × 44 px, nichts abgeschnitten, kein Layout-Sprung, geprüft in P1, P2, P3, L1, L2 und 926 × 428.
- **7/8/9** Eine Geste = ein Undo. Speichern → Laden deep-equal (neue Take- und Clip-Felder in Normalisieren, Kopien, ZIP und Online).
- **24** Keine Hersteller-, Produkt- oder DAW-Namen in Oberfläche, Hilfe, Bezeichnern und Testnamen. Vergleiche mit Profi-Programmen stehen nur in dieser Spec.
- **20** Kein Supabase-Aufruf. Bei Versionen über 4.30.0 muss Xander `max_app` anheben (§4).
- **29** Zweige parallel (§3). **CLAUDE.md-Vorrang:** schnelle Seite und flüssige Bedienung. Nichts lädt beim App-Start, Wellenformen/Render im
  Worker, kein langer Task > 50 ms im Haupt-Faden. **WebGL bringt hier nichts:** Wellenformen und Notenblöcke zeichnet Canvas 2D schnell genug.
  Der Engpass ist das Rendern im Worker, nicht das Zeichnen.

---

## Übersicht: Xanders Punkte → Befund → wo gelöst

| Nr. | Wunsch (31.10. ~23:30) | Stand 4.25.0 | Gelöst in |
|---|---|---|---|
| 1 | Instrumental beim Singen hören | **Fehler**: iOS-Hörmuschel + 4 Fallen im Ablauf | H1, H2, H5, H6, H8 · G10a |
| 1 | Vorlage-Spur beim Ersetzen / Solo nachsingen | teilweise (versteckt: Overdub, „Selbst singen“) | H7 · G10j |
| 2 | Nach dem Vorzähler kein Klick | **Fehler**: `metroInRec` ab Werk An | H3 |
| 3 | Wann geht es los? Auftakt im Vorzähler? | teilweise / Auftakt vorhanden (G3) | H4 · G10a, G10b |
| 4 | Clip-/Loop-Klammern am Gesang, rücken, abgeschnittene Wörter | teilweise (nur Länge ±1 Takt) | K1, K3 · G10b |
| 5 | Einschnappen, Zoom ins Wort, nichts versehentlich verschieben, Kontrolle | teilweise / **Fehler** (Gesten) | K2 · G10e, G10f |
| 6 | Warp-Marker als Platzierer: schneiden statt dehnen | fehlt | G10f |
| 7 | Tonhöhe hart nach Tonart, Konsonanten unberührt | vorhanden (Tonart nicht wählbar) | G10g |
| 8 | Wie im MIDI-Notenfenster, Chor entkoppeln | teilweise / fehlt | G10h · G6+ |
| 9 | Was sind die 7 Takes, Wellenform, Name/Tag, Status | teilweise | K4 · G10c, G10d |
| 10 | Songtext nicht erkannt | fehlt (Modell, Netzfreigabe) | G9 (Nachtrag 8) + §2.11 · §4 F-1 |
| 11 | Chor-Schatten farbig, Vorlage zum Nachsingen | fehlt / teilweise | G10i, G10j |
| 12 | Wo stehen wir, wann das nächste Ergebnis | — | §3 |
| 13 | Haptik-Probe: nur echter Label-Tipp | bekannt | G10e/G10f (sichtbar + Klick-Ton), §4 F-2 |

**Korrekturen zum Analyse-Befund (selbst im Code nachgeprüft):**
- **1c ist schlimmer als „stumm“.** `songRecEndOver` Z. 20393 → `songCommitNotes` Z. 20361–20382 löscht bei „Überschreiben“/„Ersetzen“ im ersten
  Durchgang **alle** alten Noten der NOTEN-Spur in `[from, Ende)` (Z. 20366–20372). Dazu gehören `song.mel[t]` und bei Synth-Spuren mit Spur-Clip das eigene
  Clip über `ownClearBar` Z. 23310–23317. Das passiert auch dann, wenn keine einzige Note gespielt wurde. Ist z. B. Bass gewählt, löscht eine reine Gesangsaufnahme die
  Basslinie in den gesungenen Takten. ↶ holt sie zurück, im Toast steht aber nur „0 Noten BA · 🎤 Stimme“. [K]
- **Der Sofort-Tipp in 1c (STIMME-Spur wählen) stimmt.** (Fassung 1 behauptete das Gegenteil; nachgeprüft 01.11.) Die STIMME-Spur ist eine Synth-Spur
  mit Merker: `tkEnsureTrack` Z. 40374 legt sie mit `newSynthTrack` an, Normalisieren verlangt `t.kind === 'synth'` (Z. 39809, Z. 17332), `g2SongScene`
  Z. 44233 filtert sie deshalb eigens mit `tr.stimme` aus. Also ist `isSynthT(STIMME)` (Z. 17149) wahr, `recNoteTrack` Z. 20197–20201 liefert bei gewählter
  STIMME-Spur die STIMME-Spur selbst, und „Noten auf ▾“ (`synthTracks()`, Z. 24591) listet sie als „STI“. Folge: `sr.mute` trifft nur die STIMME-Spur, deren
  Wiedergabe `scheduleTrack` Z. 19463 vor jeder Stummschaltung abzweigt (die alte Stimme schweigt im Bereich über `tkSongMute`, wie gewollt).
  `songCommitNotes` findet in `song.mel[STIMME]` nichts und `ownClearBar` Z. 23314 in einem Audio-Clip keine Noten, also wird nichts gelöscht. Beide Wege
  stehen unten in „Bis 4.25.1“. H2 bleibt nötig, weil ● SONG mit 🎤 nicht von der gerade gewählten Spur abhängen darf.
- `stop()` Z. 20779ff lässt `R.slot` stehen (nur `R.pend` wird übernommen). Nach ▶ n und ■ startet ● die zuletzt laufenden Spuren also wieder.
  „Nichts hörbar“ gilt deshalb vor allem nach dem App-Start bzw. nach dem Laden (`R.slot` = −1, Z. 19134).
- Die App rechnet selbst mit einer Kopplung von −20 dB für den Lautsprecher (`VS_BLEED_DEF` Z. 39251–39252). Gemessen wurden −31/−32 dB. Das stützt die
  Hörmuschel-These (Befund 1, [S] bis zum Gerätetest H6).

**Bis 4.25.1: so geht es heute** (für die Funk-Antwort)
1. Kabel-Kopfhörer (EarPods) einstecken, **bevor** 🎤 an geht. AirPods/Bluetooth meiden, denn mit Mikro gibt es Telefonklang und Verzögerung.
2. Szene: zuerst ▶ n (Szenen-Knopf), dann die STIMME-Zelle derselben Szene antippen, 🎤 an, ●.
3. Klick: Menü (≡) → Aufnahme → „Metronom bei Aufnahme“ → **Aus**. Der Einzähler bleibt hörbar.
4. Song: Im Song die Takte markieren (gelb), ● SONG **halten**, Modus **„Overdub“** wählen, START. Dann schweigt nichts, und es wird nichts gelöscht. Der
   neue Gesang ersetzt den alten im Bereich, der alte bleibt in den Takes. **Nicht** „Überschreiben“ mit einer anderen gewählten Spur: Das löscht in den gesungenen
   Takten die Noten der NOTEN-Spur (↶ holt sie zurück).
   Ohne markierte Takte geht es auch so: zuerst die **STIMME-Zeile** antippen (damit zielt NOTEN auf die STIMME-Spur, Chip „NOTEN · Stimme“), dann ● SONG. Dann
   schweigt nur die alte Stimme ab dem Start, und keine Noten werden gelöscht (siehe Korrektur oben).
5. ● nur mit 🎤 an drücken. Im 🎤-Blatt muss „● hört zu“ stehen.

---

## 1. Hotfix 4.25.1 — Einsingen entsperren (sofort nach 4.25.0, vor dem Video)

**Rahmen.** Zweig `hf-4251` ab der Hauptlinie 4.25.0 (nach dem G-GES-Merge). `VERSION '4.25.1'`, APP_CODE 4 025 001. `max_app` liegt heute bei
4 030 000 und reicht. **Kein neues Projekt-Feld:** Neue Schalter liegen im Geräteprofil (`uiPrefs`/`setUiPref` Z. 34762/34772, wie „Haptik“
Z. 34498) oder sind reiner Laufzeit-Zustand. Kein Eingriff in Klangerzeugung, Effekte oder Render. Nur Punkte, die das Einsingen blockieren.
Auslieferung wie gewohnt (Sonden, SPIELSYSTEM.md, Werkstatt, Changelog-Abschnitt, Snapshot, Funk-Antwort mit „Bitte prüfen“).

**Begriff Gesangs-Aufnahme** (neu, `vocalTake(ti)`): Die Zielspur ist die STIMME-Spur (`S.tracks[ti].stimme`, vgl. `stimmeT` Z. 39816), **oder** 🎤 ist an
(`ST.on && ST.phase !== 'off'`). Das Ergebnis wird beim Druck auf ● als `rec.vox` gemerkt; bei der Song-Aufnahme gilt `sr.vox` bzw. 🎤 an. Reine
MIDI-Aufnahmen ohne 🎤 verhalten sich in **allen** Punkten wie 4.25.0 (Regel 27).

**Gemeinsame Messverfahren (Playwright, Chromium, `dirigent-test/`):**
- **Fake-Mikro:** `--use-fake-device-for-media-stream --use-file-for-fake-audio-capture=<k-g10-sing.wav>%noloop` und
  `--autoplay-policy=no-user-gesture-required`. `k-g10-sing.wav` ist synthetisch (48 kHz, 16 Takte bei 120 BPM, Vokale aus Obertönen mit Einsätzen
  und Rausch-Konsonanten) und wird per Skript erzeugt wie die VS-Testdateien. `navigator.audioSession` ist im Test eine Attrappe, die jede Zuweisung von
  `type` mitschreibt. Das Einmess-Profil wird vor dem Test gesetzt (`stimmeCal`/`stimmeRoute`, Test-API Z. 44892ff).
- **Testprojekt `g10-demo`:** Szene 1 mit Clips auf Drums, Bass, Synth 1 und MELODIE; STIMME-Spur leer; Szene 2 mit anderen Clips; Song mit 8
  Takten aus Szene 1, Melodie-Noten auf MELODIE und eigener Basslinie auf Bass; zweites Projekt `g10-vox` mit Song-Stimme in Takt 1–8.
- **M-BEGL (Begleitung hörbar):** `noteLog(4096)` (Z. 45132): Einträge mit `track` ≠ STIMME, `removed` ≠ true, `beat` im Take-Fenster. Für jede Spur
  mit Clip ist mindestens 1 Note je Takt Pflicht. Dazu kommt die Test-Hilfe `g10OutRms(a, b)` (neu, nur Tests: AnalyserNode an `AU.M.ceil`). Sie misst den RMS im
  Take-Fenster, der mindestens −30 dBFS betragen und höchstens ±1 dB von derselben Szene ohne Aufnahme abweichen darf.
- **M-KLICK:** `noteLog` mit `src === 'click'` und `removed` ≠ true. Gewertet werden Schläge (`beat`) und Betonung (`out`).
- **M-OVL:** Alle 40 ms werden `#countin.show` sowie die Texte von `#ciNum`, `#ciTgt` und `#ciHint` gelesen.
- **M-DATA:** `SYNQUENZER.state().project` vorher/nachher deep-equal.
- **M-G28:** Golden-Prüfung: Demo-Projekt und alle Projekte in `synq-snapshots/` laden → normalisiertes JSON Zeichen für Zeichen gleich wie 4.25.0;
  Offline-Render (VV1-Weg) bitgleich (max |Δ| = 0).
- **M-PLATZ:** typische-fehler 1/4/5 mit der echten App-Schrift.

### H1 — ● startet die Begleitung mit (Szene) · 1,5 h

**Ursache.** In `recPress` Z. 21124–21165 setzt der Stopp-Zweig für einen neuen Clip nur `R.slot[ti] = -1` (Z. 21156) und ruft `startTransport` (Z. 21157)
auf. Der Overdub-Stopp-Zweig (Z. 21149–21150) setzt nur die eigene Spur. `startTransport` Z. 20758–20777 startet nur Spuren mit `R.slot`/`R.pend`. Nach
dem App-Start oder dem Laden ist jede Spur −1 (Z. 19134). `launchScene` Z. 19616–19626 wird von ● nie aufgerufen. Ohne vorher gestartete Szene läuft
deshalb nur der Klick. Im Einzähler (Schlag < 0) spielt auch danach keine Spur: `tick` plant Clips erst ab `Math.max(b0, 0)` (Z. 19435). Das bleibt so
(Musik setzt mit der Aufnahme ein, wie üblich); H1 ändert nur, **welche** Spuren ab Schlag 0 laufen.

**Änderung.** Die neue Funktion `recWithScene(ti, si)` wird in **beiden** Stopp-Zweigen vor `startTransport` aufgerufen, und zwar nur, wenn `vocalTake(ti)` gilt:
- Für jede Spur `j ≠ ti` mit `S.tracks[j].clips[si]`, `R.slot[j] === -1` und ohne `R.pend[j]` gilt `launch(j, si)`. Das ist der Stopp-Weg in `launch` Z. 19610 (setzt
  `slot`, `cstart = 0`). Spuren, die schon belegt sind (zuletzt gespielt oder angetippt), bleiben unverändert.
- Hat die Szene eine Akkordzeile und läuft keine Zeile, kommt `sceneRowStart(si, 0)` dazu, wie in `launchScene` Z. 19620. Damit stimmen Träger und Transponieren wie bei ▶ n.
- `rec.withScene = [{t: j, s}, …]` merkt sich das für die Anzeige.
- Läuft der Transport schon, ändert sich nichts. Die Aufnahme beginnt wie heute am nächsten Takt (Z. 21160).

**Anzeige [V].** Die Zeile `#ciTgt` (Z. 26984, HTML Z. 3882) lautet „Stimme · Szene 3 · Begleitung: Drums, Bass, Synth 1“. Höchstens 3 Namen, danach „+n“;
die Zeile darf auf 2 Zeilen umbrechen und wird nie abgeschnitten. Läuft keine andere Spur, steht dort „Ohne Begleitung – Szene 3 ist leer“, zusätzlich als Toast.
Bei Overdub auf einem STIMME-Clip steht dort „alter Take läuft als Vorlage“.

**Abnahme.**
- [ ] **H-01** Frischer Start von `g10-demo` (alle `R.slot` −1): STIMME-Zelle Szene 1, 🎤 (Fake), ● aus dem Stopp → M-BEGL im Take (ab Schlag 0; im Einzähler
  nur Klicks, keine Clip-Noten wie in 4.25.0): Drums, Bass, Synth 1, MELODIE je Takt mindestens 1 Note; `g10OutRms` ≥ −30 dBFS; der Take ist aufgenommen (neuer Eintrag in `S.takes`, Länge ≥ 4 Takte).
- [ ] **H-02** ▶ Szene 2, ■, dann ● auf der STIMME-Zelle Szene 1 → Spuren mit `R.slot` = 1 (Szene 2) bleiben so. Nur Spuren ohne Belegung bekommen Szene 1.
  M-OVL zeigt die richtigen Namen.
- [ ] **H-03** MIDI-Aufnahme auf Synth 1 (🎤 aus) aus dem Stopp: `R.slot` aller anderen Spuren vorher = nachher. Alle bisherigen REC-Tests sind grün.
- [ ] **H-04** Läuft der Transport, ist `R.slot` aller Spuren außer der Aufnahmespur vor und nach ● gleich.
- [ ] **H-05** Undo: Die Aufnahme ist wie bisher genau ein Schritt. `recWithScene` legt keinen Undo-Schritt an. Nach ■ entspricht `R.slot` dem Zustand nach ▶ n.
- [ ] **H-06** Szene ohne Clips → Overlay und Toast „Ohne Begleitung …“, die Aufnahme läuft trotzdem.

**Risiko:** gering. Betroffen ist nur der Stopp-Weg bei Gesangs-Aufnahmen. Die Akkordzeile startet genau wie bei ▶ n. **Regel 28:** `R.slot` ist Laufzeit, Projekt
und Klang bleiben unberührt.

### H2 — Song-Aufnahme mit 🎤: Ziel „Gesang“, nichts stumm, nichts gelöscht · 2 h

**Ursache.** `recTargets` Z. 20159–20162 setzt bei einem vorhandenen Song ab Werk nur NOTEN als Ziel. NOTEN geht auf die gewählte Synth-Spur, sonst auf die
Melodie (`recNoteTrack` Z. 20197). In `songRecStartOver` Z. 20237 schaltet `sr.mute` diese Spur bei „Überschreiben“ bis zum Song-Ende stumm, bei
„Ersetzen“ im Bereich. Beim Ende löscht `songCommitNotes` Z. 20366–20372 dort die alten Noten, auch wenn keine Note gespielt wurde (siehe Korrektur
oben). Eine reine Gesangsaufnahme ohne Ziel lehnt Z. 20205 ab („Erst ein Ziel wählen“).

**Änderung.**
1. **Ziel „Gesang“:** Neben `REC_TG_KEYS` (Z. 20153, bleibt) kommt der Schlüssel `vox` in `UI.recTg`. `recTargets()`: Ist 🎤 an und hat Xander die Ziele in dieser
   App-Sitzung mit 🎤 noch nicht selbst gewählt, gilt `{clips: false, chords: false, mel: false, vox: true}`. Ohne 🎤 bleibt alles wie heute.
2. Z. 20205 lässt die Aufnahme auch mit `tg.vox && ST.on` zu. `tkSongBegin` Z. 40464 nimmt die Stimme nur auf, wenn `tg.vox !== false`. Das ist ab Werk
   wahr, sobald 🎤 an ist. Wer NOTEN anlässt und 🎤 an hat, bekommt also dasselbe wie heute.
3. **Schutz:** In `songCommitNotes` wird nichts gelöscht, wenn `sr.vox` gesetzt ist und im ersten Durchgang **keine** Note auf der Zielspur gespielt wurde
   (`mine.length === 0`). Mit mindestens einer gespielten Note und für alle Aufnahmen ohne 🎤 bleibt K2-21 unverändert.
4. **Start-Blatt** `openRecStart` Z. 24562ff, Ziele-Zeile Z. 24590–24594 [V]: Ist 🎤 an, gibt es einen vierten Chip **[🎤 GESANG]** (mindestens 44 px). Der Modus-Text
   (`mTx` Z. 24581–24586) nennt bei reinem Gesang „Gesang ersetzt Takt 5–8; alles andere spielt weiter.“ und dazu, was stumm ist: „stumm: alte Stimme
   Takt 5–8“ bzw. „nichts stumm“ (mit H7). Bei 320 px Breite wird nur der ▾-Chip schmaler (M-PLATZ).
5. **`vox` überall mitführen** (sonst geht das Ziel unterwegs verloren oder zeigt „–“): `setRecTargets` Z. 20163–20169 und die Ziel-Übernahme aus `o.targets`
   in `songRecStartOver` Z. 20204 kennen nur `REC_TG_KEYS`, sie übernehmen `vox` zusätzlich. `recTgShort`/`recTgLong` Z. 20172–20173 nennen `vox` als „🎤“ bzw.
   „Gesang“; sonst stünde auf ● SONG (Z. 22453–22463) und im Aufnahme-Banner (Z. 22525) bei reinem Gesang „–“. Im Start-Blatt zählt `vox` bei `any`
   (Z. 24578), sonst bleibt START gesperrt (Z. 24599). Test-API `songRecTargets` (Z. 44973) nimmt `vox` an. `UI.recTg` wird wie heute beim Löschen des Songs
   und beim Laden zurückgesetzt (Z. 20752, Z. 34797); der Merker „selbst gewählt“ ebenso.

**Abnahme.**
- [ ] **H-10** `g10-demo`, Bass gewählt, 🎤 an, kurzer Tipp auf ● SONG ab Takt 1, 4 Takte singen, ■ → `song.mel` und eigene Clips von Bass und MELODIE
  deep-equal zu vorher. `song.vox` hat ein Stück in Takt 1–4. M-BEGL: Bass und MELODIE klingen in Takt 1–4 (mindestens 1 Note je Takt).
- [ ] **H-11** Dasselbe mit 🎤 aus und Ziel NOTEN verhält sich wie 4.25.0 (Stummschaltung und Löschen). V2d′-Tests N7S-27…32 sind grün.
- [ ] **H-12** NOTEN und GESANG mit 🎤 von Hand gewählt, 0 Noten gespielt: nichts gelöscht (deep-equal). 3 Noten in Takt 2 gespielt: Ergebnis wie 4.25.0.
- [ ] **H-13** Start-Blatt mit 4 Chips in allen Formaten nach M-PLATZ. 🎤 an/aus wechseln ergibt keinen Layout-Sprung.
- [ ] **H-14** Ein Undo „Song-Aufnahme“ stellt alles wieder her (Stimme, Noten, Takte). Speichern → Laden deep-equal.

**Risiko:** mittel-gering. Der Song-Aufnahme-Weg ist gut getestet; der Schutz greift nur, wenn eine Stimme aufgenommen wird. **Regel 28:** Kein Klang und kein Format
ändert sich, denn `UI.recTg` ist Laufzeit.

### H3 — Klick beim Singen: „Nur Einzähler“ · 1 h

**Ursache.** `S.settings.metroInRec` ist ab Werk `true` (Z. 17103, normalisiert Z. 17350). Der Scheduler klickt bei
`S.settings.metro || (recClickOn(b) && S.settings.metroInRec)` (Z. 19420), und `recClickOn` Z. 21118 ist während des ganzen Takes wahr. Der Schalter steht nur unter Menü →
Aufnahme (Z. 34484) und fehlt im ●-Halten-Blatt (`popRecOpts` Z. 26561–26575). Der Einzähler-Klick (Z. 19419, `b < 0 && R.countIn`) ist davon unabhängig.

**Änderung.** Neue Geräte-Einstellung `vocClick` (`setUiPref`) mit `'ci'` = **Nur Einzähler** (Standard) | `'always'` = **Immer**. Im Scheduler gilt:
`else if (S.settings.metro || (recClickOn(b) && (rec.vox ? UI.vocClick === 'always' : S.settings.metroInRec)))`. Das Projekt-Feld `metroInRec` bleibt
unverändert und gilt weiter für MIDI-Aufnahmen. Mit ♩ an klickt es wie bisher immer. [V] Unter Menü → Aufnahme kommt nach „Metronom bei Aufnahme“ die Zeile
**„Klick beim Singen [Nur Einzähler] [Immer]“**. Dieselbe Zeile steht im ●-Halten-Blatt nach „Einzähler“. Am Take-Ende bleibt `cancelRecClicks` (Z. 21267) wie
es ist. `UI.vocClick` wird beim Start aus `uiPrefs()` gelesen (Muster `UI.haptics` Z. 45765; `uiPrefs` behält beliebige Schlüssel, Z. 34762–34772).
`rec.vox` wird in `recPress` vor `startTransport` gesetzt und gilt bis `rec.state === 'off'`. Song-Aufnahmen klicken nach dem Vorlauf schon heute nicht
(`recClickOn` Z. 21118 hängt an `rec.state`, das bei ● SONG `'off'` bleibt); H3 ändert dort nichts.

**Abnahme.**
- [ ] **H-20** STIMME-Take aus dem Stopp, Einzähler 1, ♩ aus, Standard → M-KLICK: genau 4 Klicks auf Schlag −4…−1 (Betonung auf −4), **0** Klicks in [0, Ende).
- [ ] **H-21** „Immer“ → ein Klick auf jedem Schlag des Takes wie in 4.25.0. Mit ♩ an klickt es in beiden Fällen auf jedem Schlag.
- [ ] **H-22** MIDI-Take auf Synth 1 (🎤 aus) in einem alten Projekt mit `metroInRec: true` → Klicks wie 4.25.0.
- [ ] **H-23** Umschalten ändert das Projekt nicht (M-DATA). Die Wahl übersteht ein Neuladen der App. M-PLATZ der beiden neuen Zeilen.

**Risiko:** gering. **Regel 28:** Der Klick ist nicht Teil von Render oder Export, das Projekt bleibt unverändert.

### H4 — Vorzähler sichtbar und hörbar, auch bei laufender Musik und im Song-Vorlauf · 2 h

**Ursache.** Das große Overlay erscheint nur bei `R.ciRun && bAud < 0` (`renderTakt` Z. 26980–26985). Läuft der Transport schon (Zustand `armed`, Start am
nächsten Takt, Z. 21160), sieht man nur klein „START IN n“ (Aufnahme-Leiste Z. 26062–26066) und „in n“ in der Zelle (Z. 22184–22188). Vor dem Start klickt nichts
(Z. 19419 nur `b < 0`; `recClickOn` bei `armed` erst ab `startBeat`). Beim Song-Punch ab Takt > 1 läuft 1 Takt Vorlauf (Z. 20214, Z. 20229–20230) ohne Klick
und ohne Countdown.

**Änderung (nur Gesangs-Aufnahmen):**
1. `recCdLeft(bAud)` (neu) gibt die Schläge bis zum Aufnahme-Start zurück. In der Szene ist das bei `rec.state === 'armed'` `rec.startBeat − bAud`. Im Song gilt es bei
   `R.songRec`, Durchgang 0 und hörbarem Song-Schlag vor `from·4` und ist `(from·4 + R.songPlay.off) − bAud`.
2. Das Overlay `#countin` erscheint auch, wenn `0 < recCdLeft ≤ 4·max(1, countIn)`. Die Zahl ist `ceil(recCdLeft)`, dazu kommen Ziel (H1) und Hinweis (H6). Am Startschlag
   blendet für 0,5 s „●“ mit der vorhandenen Klasse `.n.go` ein (CSS Z. 282), danach verschwindet das Overlay. [V] Das Overlay liegt ≤ 1 Takt über der
   laufenden Matrix und sieht aus wie der Einzähler aus dem Stopp.
3. Klicks: Bei `armed` klickt jeder noch kommende Schlag in `[startBeat − 4·countIn, startBeat)`, die 1 des Takts betont. Im Song-Vorlauf klickt der Vorlauf-Takt
   genauso. Bei Einzähler „Aus“ gibt es keine Klicks, nur das Overlay.
4. MIDI-Aufnahmen ohne 🎤 bleiben wie heute (kein Overlay bei `armed`, keine Zusatz-Klicks).

**Abnahme.**
- [ ] **H-30** Szene läuft (120 BPM), ● auf STIMME bei Schlag 5,5 → Start 8. M-OVL zeigt Overlay bei 5,5–8 mit 3, 2, 1, dann „●“. M-KLICK: Klicks auf 6 und 7,
  keiner ab 8 (H3 Standard). Die Aufnahme beginnt bei 8 ±1 ms (`rec.startBeat`).
- [ ] **H-31** Song-Punch ab Takt 5 mit Vorlauf: Overlay zählt im Takt 4 4…1, 4 Klicks (betont auf der 1 von Takt 4), `sr.startBeat` = Takt 5, danach kein Klick.
- [ ] **H-32** Vorlauf aus und Einzähler aus → kein Klick und kein Overlay. MIDI-Take bei laufendem Transport → wie 4.25.0.
- [ ] **H-33** Leistung: `renderTakt` ändert nur Klasse und Text. Bildzeit p95 bleibt bis +0,2 ms gleich, kein langer Task in 3 min Wiedergabe mit 3 Takes.

**Risiko:** gering bis mittel (Scheduler-Tick, deshalb H-33). **Regel 28:** nichts im Projekt.

### H5 — ● auf STIMME ohne 🎤: Mikro einschalten statt stiller Leer-Aufnahme · 1 h

**Ursache.** `recPress` prüft 🎤 nicht. `vsRecBegin` Z. 39456 setzt bei `!ST.on` stumm `VS.rec = null`. Einzähler, Klick und REC laufen, am Ende kommt
„Nichts aufgenommen“.

**Änderung.** In `recPress` wird vor dem Start geprüft, ob `S.tracks[ti].stimme && !ST.on` gilt. Dann gibt es vier Fälle:
- Kein Mikrofon (`micAvail()` falsch): Toast „Kein Mikrofon – Gesang braucht 🎤 (Pages-Seite in Safari)“. Nichts startet.
- Für den letzten Weg gibt es eine Einmessung (`stProf().prof[route]`, Z. 38280/38582): `stStart({})` läuft im selben Tipp (Erlaubnis/`resume` brauchen die Geste),
  dazu der Toast „🎤 an – gleich geht's los“. **Transport und Einzähler starten erst, wenn das Mikro bereit ist:** `ST.phase === 'live'`, Ringpuffer ≥ 0,5 s
  (`go` in `stGot` Z. 38420–38426) **und keine Kurz-Einmessung läuft** (`ST.cal` null). Grund: Auf dem Weg „Lautsprecher“ startet `stGot` bei jedem
  Mikro-Start die Kurz-Einmessung (`cal = 'kurz'`, Z. 38419/38423, `stCal` Z. 38532ff, `ST_CAL.kurz` Z. 38045: 3 Pieptöne, fertig ≈ 2,2 s nach `go`). Sie misst
  die Verzögerung neu (iOS-Puffersprung 5,3 ms, `fragen-xander-9.md` Z. 16) und darf deshalb nicht übersprungen werden; liefe der Einzähler sofort, lägen
  die Pieptöne im Einzähler bzw. im Anlauf des Takes (G3 schneidet bis 2 Takte davor mit) und `ST.phase` stünde während des Takes auf `'cal'`. Gewartet wird
  höchstens 4 s (Anzeige im Overlay „🎤 wird bereit …“), danach Abbruch mit „Mikro noch nicht bereit – ● noch einmal“, statt leer zu laufen. Läuft der
  Transport schon, gilt dasselbe für `rec.startBeat`: Die Aufnahme beginnt am ersten Taktstrich nach „bereit“.
- Es gibt noch keine Einmessung: Nur `stStart` läuft (öffnet das Einmessen wie heute, Z. 38419 und 38423), dazu der Toast „Erst einmessen, dann ●“. Es wird nicht aufgenommen.
- `stFail` (Erlaubnis verweigert, Gerät weg): Die Aufnahme bricht ab. Hat dieses ● den Transport gestartet, stoppt er.

**Abnahme.**
- [ ] **H-40** Fake-Mikro, eingemessen, 🎤 aus, STIMME-Zelle, ● aus dem Stopp → `stimme().on` wird wahr, der Transport startet erst nach `phase 'live'` und
  Ende der Kurz-Einmessung, ein Take ist aufgenommen (Länge ≥ 1 Takt), Toast-Text wie oben. Weg „Lautsprecher“: Im Take-PCM (inkl. Anlauf) liegt kein
  Piepton (Kreuzkorrelation mit `micChirp` unter der Erkennungsschwelle von `stRefPeak`).
- [ ] **H-41** Ohne `getUserMedia` (im Test gelöscht) → `R.playing` falsch, `rec.state 'off'`, Toast.
- [ ] **H-42** Profil ohne Einmessung → Einmess-Blatt offen, `R.playing` falsch, keine Aufnahme.
- [ ] **H-43** Erlaubnis verweigert (Attrappe wirft) → nach ≤ 1 s gilt `rec.state 'off'` und der Transport steht. Es erscheint kein „Nichts aufgenommen“.

**Risiko:** gering bis mittel (asynchron). **Regel 28:** unberührt.

### H6 — Ausgang beim Singen: Hinweis bei jeder Aufnahme + Gerätetest-Schalter · 1 h

**Ursache.** Beim Einschalten von 🎤 setzt die App `navigator.audioSession.type = 'play-and-record'` (`stStart` Z. 38379, `micTapGet` Z. 18207), sonst `'playback'`
(`ensureAudio` Z. 17706). Auf Xanders iPhone liegt die Ausgabe dann auf der Hörmuschel („leise, links“, gemessen 19.10., `fragen-xander-9.md` Z. 13). Die
Kopplung liegt bei −31/−32 dB (Z. 17). `stGuessRoute` Z. 38295–38300 rät den Weg nur aus dem Mikro-Namen. Der Kopfhörer-Hinweis erscheint einmal pro App-Start
(`ST.hinted` Z. 38425) und nicht beim ersten vollen Einmessen. Im Web kann die App den Ausgang nicht wählen.

**Änderung.**
1. [V] Neue Zeile `#ciHint` (12 px, höchstens 2 Zeilen) im Overlay, bei **jeder** Gesangs-Aufnahme, auch im Vorzähler bei laufender Musik und im Song-Vorlauf (H4).
   Bei `ST.route` = `'speaker'` steht dort „🔈 Ohne Kopfhörer kommt die Musik leise aus der Hörmuschel – Kabel-Kopfhörer einstecken“, bei
   `'bt'` „Bluetooth: Telefonklang und Verzögerung – besser Kabel-Kopfhörer“. Bei `'wired'` erscheint nichts.
2. Diagnose ohne sichtbare Oberfläche: Der URL-Parameter `?stsess=par|auto|none` (dazu Test-API `stimmeSess(v)`) wählt die Sitzungsart für `stStart`/`micTapGet`.
   `par` ist heute und bleibt Standard. Bei `auto` gilt `navigator.audioSession.type = 'auto'`, bei `none` wird nichts gesetzt. Der Wert wird nur gespeichert, wenn der Parameter
   in der Adresse steht, und zwar mit `setUiPref('stsess', v)` (Z. 34772). **Nicht** in `stProf()`: dessen Einlesen Z. 38283–38288 übernimmt nur bekannte Felder und
   würde den Wert beim nächsten Start verwerfen. Beim Ausschalten bleibt `'playback'` wie heute.
3. **Gerätetest mit Xander** (5 min, „Bitte prüfen“ B-3): drei Läufe, einmal normal, einmal mit `?stsess=auto`, einmal mit `?stsess=none`. Jeweils gilt: ▶ Szene, 🎤 an, ohne
   Kopfhörer anhören, ob die Musik laut unten oder leise oben kommt, dann „Einmessen“ und den Wert „Lautsprecher im Mikro … dB“ ablesen (Z. 38747). Die Variante, die laut
   über den unteren Lautsprecher spielt, wird in G10a-1 Standard (eine Zeile in Z. 38379/18207). [S] Ob es sie gibt, ist offen.

**Abnahme.**
- [ ] **H-50** Weg „Lautsprecher“: Der Hinweis steht in drei Takes nacheinander jedes Mal im Overlay. Bei „Kabel“ steht keiner, bei „Bluetooth“ der BT-Text.
- [ ] **H-51** Mit `?stsess=auto` zeichnet die Attrappe beim Start `'auto'` auf, ohne Parameter `'play-and-record'` (wie 4.25.0). Beim Ausschalten steht sie auf `'playback'`.
- [ ] **H-52** M-PLATZ: Overlay mit Ziel + Hinweis bei 320 × 568 und 926 × 428, nichts abgeschnitten.

**Risiko:** gering. Ohne Parameter ändert sich am Audio-Weg nichts. **Regel 28:** unberührt.

### H7 — Vorlage beim Song-Ersetzen: alte Stimme hörbar · 0,5 h

**Ursache.** `tkSongMute` Z. 40289–40293 schaltet die alte Stimme bei Überschreiben/Einfügen/Ersetzen in `[from, to)` stumm. Hörbar bleibt sie nur bei
„Overdub“, und das geht nur mit markiertem Bereich. Einen Schalter gibt es nicht. In der Szene ist die Vorlage schon da: ● auf einen vorhandenen STIMME-Clip ist ein
Overdub, der alte Take läuft hörbar weiter (Z. 21137–21149, `tkVoiceTake` Z. 40396ff).

**Änderung.** [V] Im Start-Blatt steht, wenn 🎤 an ist und im Bereich eine alte Stimme liegt, die Zeile **„Alte Stimme [stumm] [hören]“** (`segHTML` wie „Vorlauf“,
mindestens 44 px). Der Wert gilt nur für die Sitzung (`UI.recGuide`), Standard ist „stumm“ wie heute. `sr.guide = true` → `tkSongMute` gibt `null` zurück. Das Ergebnis der Aufnahme
bleibt wie heute: Der neue Gesang ersetzt den alten im Bereich. Über den Lautsprecher zieht der Echo-Abzug die Vorlage ab, denn sie steckt in `AU.M.ceil`.
Die volle Vorlage-Funktion (beliebige Spur, lauter/leiser) kommt in G10j.

**Abnahme.**
- [ ] **H-60** `g10-vox`, Bereich Takt 3–4, Ersetzen, „hören“ → Während des Takes sind die alten Stimm-Stücke in Takt 3–4 eingeplant (`tkPlace`-Register/Log). Danach ist
  `song.vox` in Takt 3–4 der neue Take, und ↶ stellt den alten Zustand her.
- [ ] **H-61** Standard „stumm“ → identisch zu 4.25.0 (VS3-, G8-Tests grün).

**Risiko:** gering. **Regel 28:** unberührt.

### H8 — ● SONG auf leerem Song mit 🎤: Hinweis statt stillem Verlust · 0,3 h

**Ursache.** `songRecStart` Z. 19724–19742 und `songRecEnd` Z. 19768ff rufen nie `tkSongBegin`/`tkSongCommit` auf (die gibt es nur in Z. 20239/20439). Der Gesang beim
ersten Song-Durchgang geht still verloren.

**Änderung.** Ist 🎤 an und der Song leer (`songHasContent` Z. 20064 falsch), erscheint beim Start der Toast „🎤 Gesang wird beim ersten Song-Durchgang nicht
aufgenommen – erst den Song anlegen, dann ● SONG zum Einsingen“. Die volle Lösung kommt in G10a-2.

**Abnahme.** [ ] **H-70** Mit 🎤 an kommt der Toast, mit 🎤 aus nicht. Der Song-Aufnahme-Ablauf bleibt sonst gleich (bestehende Tests grün).

### Gemeinsame Abnahme 4.25.1

- [ ] **H-90** M-G28 grün (Demo + alle Snapshots).
- [ ] **H-91** Regression: REC (MIDI, Overdub, AUTO-Länge), Stimme-FANG, VS3, G3-01…06, G8, V2d′ N7S-27…32, Smoke.
- [ ] **H-92** 3 min Wiedergabe mit Szenenwechseln und 3 Gesangs-Takes: keine Aussetzer, keine hängenden Noten, keine Konsolen-Fehler, kein Task > 50 ms.
- [ ] **H-93** M-PLATZ für Overlay, Start-Blatt, Menü-Zeile und ●-Halten-Blatt in P1, P2, P3, L1, L2 und 926 × 428.

**Aufwand 4.25.1:** H1–H8 ≈ 9,3 h + gemeinsame Abnahme ≈ 1,5 h = **≈ 11 h**. Mit zwei Helfern (H1/H4/H5/H6 ‖ H2/H3/H7/H8) dauert es **≈ 5–6 h Kalenderzeit**.

**Schnitt-Regel (damit der Hotfix klein und sicher bleibt):** Pflicht für 4.25.1 sind H1, H2, H3, H6 (Hinweis + `?stsess`), H7, H8. Sie laufen synchron, ändern
keinen Scheduler-Takt und kein Projekt-Feld. H4 (berührt `tick` Z. 19416–19421 und `renderTakt`) und H5 (asynchroner Mikro-Start) gehen nur mit, wenn
H-30…33 bzw. H-40…43 grün sind; sonst wandern sie ohne Wartezeit in 4.25.2. Gemeinsame Abnahme H-90…93 gilt für das, was ausgeliefert wird.

**Bitte prüfen (Xander, iPhone, Pages-Seite):**
- **B-1** Kabel-Kopfhörer einstecken, App frisch öffnen, STIMME-Zelle in Szene 1 antippen, 🎤 an, ● drücken: Im Einzähler nur der Klick, ab der Aufnahme die ganze
  Szene hörbar, danach kein Klick mehr?
- **B-2** Ohne Kopfhörer: Steht der Hinweis jedes Mal im Einzähl-Bild?
- **B-3** Gerätetest H6 mit drei Läufen (normal, `…/Synquenzer/?stsess=auto`, `…/Synquenzer/?stsess=none`). Je Lauf bitte melden: „laut unten“ oder „leise oben“ und den dB-Wert.
- **B-4** ● SONG mit 🎤 über einen vorhandenen Song: Hörst du alles, und ist danach nichts gelöscht?

### 1.2 Nachschub 4.25.2 — kleine Gesangs-Fehler (kein Einsingen-Blocker, parallel zum Video-Zweig, vor 4.26.0)

Diese Punkte blockieren das Einsingen nicht, zerstören aber Arbeit oder klingen falsch. Deshalb kommen sie klein und sicher **vor** dem Video und nicht erst mit G10.
Zweig `hf-4252`, ≈ 5 h.

- **K1 G3-Ausklang nach Kürzen/Punch (Befund 4e) · 1,5 h.** `g3Exit` Z. 43098 prüft `segB` gegen `L`, und `segB` ist schon auf `L` geklemmt. Nach „Länge −1“
  spielt der Ausklang deshalb ab dem alten `a.out` und springt einen Takt nach vorn. `g3VoxSeg` Z. 43108 setzt `full` mit `≥`, und so läuft das linke Reststück eines Punch
  bis zu 1 Takt in die neue Aufnahme. **Änderung:** In `g3Exit` und `g3PostDraw` Z. 43156 wird geprüft, ob `|segA + (a.out − a.in)/sp − L| > 1e-3` gilt, dann `return`.
  In `g3VoxSeg` wird `full` als Gleichheit (±1e-3) gerechnet. `tkVoxTrim` Z. 40510 kürzt `out` mit (`out = min(out, in + (len·4 − at)·sp)`).
  **Abnahme:** K-01 Länge −1, danach am Ende des Song-Teils kein Ausklang (G3-Log leer). K-02 Punch „Überschreiben“ in Takt 3 einer Stimme mit `post` überlappt nicht.
  K-03 Undo und Laden deep-equal. **Regel 28:** Das betrifft nur Zustände, die es erst seit 4.25.0 gibt. M-G28 muss grün bleiben. Ist ein Snapshot betroffen, wird er
  im Changelog genannt, mit der Frage, ob er umgestellt werden soll.
- **K2 Marken-Editor: Sperre gegen versehentliches Verschieben (Befund 5c, Hotfix-Teil) · 2 h.** `wpHit` Z. 42792–42796 fängt ±16 px über die
  ganze Höhe, `wpGest` Z. 42800–42827 nimmt nur einen Zeiger, nach 8 px wird daraus „move“ (Z. 42810), und beim Loslassen kommt `wpMarkMove` (Z. 42818).
  **Änderung:** (1) Setzt ein zweiter Finger auf, wird der laufende Zug verworfen (Geist weg, kein `wpMarkMove`), danach wird geschwenkt. Heute wird der zweite
  Zeiger nur ignoriert (`if (… E.p …) return` Z. 42803), der erste zieht weiter. (2) Der Fangradius ist höchstens 16 px und höchstens der halbe Abstand zum Nachbarn.
  Liegen zwei Kandidaten näher als 6 px beieinander, wird geschwenkt. (3) Einen Strich greift man nur im oberen Streifen (**44 px** hoch, Regel 4; dieselbe
  Griff-Leiste nutzt G10e). Auf der Welle schwenkt ein Finger immer. Ein kurzer Tipp auf die Welle verhält sich wie heute (Tipp ins Leere setzt eine Marke,
  Z. 42823); das ändert erst G10e. [V] Die Bedienung ändert sich, das wird im Funk angesagt.
  **G9-Hinweis:** G9 (4.27.0) baut den Text-Modus im selben `wpGest`. G9-Zweige setzen deshalb auf 4.25.2 auf, nicht auf 4.25.0 (`n8/G9.md` Bestandstabelle
  „Marken-Editor“ beschreibt noch das alte Ziehen).
  **Abnahme:** K-04 Auf der Welle bei „Ganz“ werden 500 synthetische Wisch-Gesten (CDP-Touch) ausgeführt: 0 Marken bewegt, die Ansicht ist verschoben. K-05 Zweiter Finger während eines Zugs → 0
  Marken bewegt, 0 Undo-Schritte. K-06 Im Streifen ziehen → Marke bewegt, genau 1 Undo.
- **K3 Clip-Blatt beim STIMME-Clip (Befund 4f) · 1 h.** Z. 34216 sperrt +1/×2 schon ab 16 Takten; sie wird auf `>= 64` gesetzt (G8). Das gilt für alle Clips,
  denn `clipLength` Z. 34253 erlaubt schon 64; nur der Knopf war hinter G8 zurückgeblieben. Bei `tr.stimme` öffnet „Quantisieren…“ den
  Marken-Editor (`wpOpen`) statt „Keine Noten zum Quantisieren“ (`openQuantSheet` Z. 34081–34085). Der Untertitel lautet „N Takte · Gesang · K Takes“. ×2 heißt bei STIMME
  „Doppelte Länge (Gesang einmal, danach Stille)“. **Abnahme:** K-07 32-Takt-Clip +1 → 33. K-08 Quantisieren… öffnet den Marken-Editor. K-09 M-PLATZ.
- **K4 Feste Take-Nummern (Befund 9c) · 0,5 h.** `tkSheetPaint` Z. 40614–40615 nummeriert nach Listenplatz (`Take ${segs.length - k}`). Neu wird nach
  `S.takes[id].created` gezählt (Z. 39765; bei Gleichstand nach `in`): Take 1 ist die älteste Aufnahme **in diesem Clip**. Der aktive Take ist nur am ● und am Rahmen
  zu erkennen. Es ist nur die Anzeige betroffen, kein neues Feld. Ohne Feld lässt sich eine Nummer über das Löschen hinweg nicht halten (gelöschte Takes fallen aus
  `alt`, `tkPick` Z. 40562); jüngere rücken dann nach. Feste Nummern auch nach dem Löschen kommen mit G10c (`no`, additiv).
  **Abnahme:** K-10 Sieben Takes, Take 3 nach oben geholt (`tkPick` Z. 40556) → Er heißt weiter „Take 3“, alle anderen behalten ihre Nummer. Take 3 gelöscht →
  Take 1, 2 bleiben, 4…7 heißen danach 3…6 (Reihenfolge nach Alter bleibt).

---

## 2. Pakete G10a … G10j

Gemeinsam für alle Pakete: Format bleibt 5, nur additive Felder in `tkNormTake`/`tkNormSeg` (Z. 39758ff/39776ff) bzw. über `tkExt().take.push`.
Alte Projekte bleiben Zeichen für Zeichen gleich (M-G28), Render-Änderungen hängen an Versionsfeldern. Jede Geste ist ein Undo (`pushUndo`, bei der Song-Stimme
`pushSongUndo` über `tkRef({vox})`). Neue Blätter und Modi nutzen das vorhandene `#wpSheet`. Abnahme-Nummern **G10-NN**.

**Segment-Felder (gilt für G10b, G10c, G10d).** Was zu einem Stück gehört und nicht zum ganzen Take (`preU`/`postU`, Runde `r`, `no`, `name`, `tag`, `fav`), liegt
am **Segment** `{take, in, out, at, …}`. Heute gehen solche Felder auf drei Wegen verloren oder wandern zum falschen Take: (1) `tkNormSeg` Z. 39775–39780
baut `alt`-Einträge ohne Erweiterungs-Haken neu (`tkExt().audio` Z. 39788 gilt nur für das oberste Stück); (2) `tkPick` Z. 40564 tauscht nur
`take/in/out/at`, Felder am obersten Stück blieben also am neu gewählten Take hängen; (3) `tkVoiceTake` Z. 40423 (`prev`), `g6Took` Z. 44715,
`tkSegTrim`/`tkVoxTrim` Z. 40506–40513 und `tkSongCommit` Z. 40492 bauen Segmente aus vier Feldern. Deshalb: neuer Haken `tkExt().seg` in `tkNormSeg`
(gilt oben und in `alt`), und die genannten Stellen kopieren die Segment-Felder mit. Fehlen sie, ist alles wie 4.25.0 (Regel 28).

**Taktarten (T1) nicht verbauen.** T1 (Xander 17:35) kommt erst nach Gesang/Video und muss heute jede feste 4 suchen (`grid()` Z. 19149 `beatsPerBar: 4`).
Neue Rechnungen in H1–H8, K1–K4 und G10 verwenden für „Schläge je Takt“ eine Hilfsfunktion (heute fest 4), nie die Zahl 4 direkt.

### 2.1 G10a — Einsingen fertig (Rest von Punkt 1 und 3) · ≈ 6 h

**Ziel.** Musik beim Singen laut und richtig, Gesang auch beim ersten Song-Durchgang, Pegel sichtbar.

**Bedienung (iPhone):**
1. 🎤 an, ohne Kopfhörer. Erkennt die App beim Einmessen die Hörmuschel, zeigt das 🎤-Blatt den Weg „🔈 Hörmuschel?“ mit dem Hinweis „Musik leise – Kabel-Kopfhörer“, statt
   „Lautsprecher“ zu raten.
2. ● SONG auf einem leeren Song mit 🎤 an: Der Gesang wird gleich beim ersten Durchgang mit aufgenommen (H8-Toast entfällt).
3. Während eines Gesangs-Takes zeigt die Aufnahme-Leiste den Pegel der Stimme (Balken + Übersteuern rot) statt der Noten.
4. Ragt das letzte Wort nach REC oder FANG über das Clip-Ende, fragt eine Meldung „Letztes Wort ragt über das Ende – Clip +1 Takt? [Ja]“.

**Technik / Daten:**
- **G10a-1 Ausgang:** Die Sitzungsart, die im Gerätetest H6 gewonnen hat, wird Standard. Hörmuschel-Erkennung: Ist nach dem vollen Einmessen auf dem Weg „speaker“ `gainDb < −26 dB`
  (Hörmuschel ≈ −31 dB gemessen, unterer Lautsprecher deutlich höher [S]), setzt die App `prof.speaker.ear = true` (Geräteprofil, nicht im Projekt). Das Einlesen
  von `stProf` Z. 38285–38286 übernimmt je Weg nur bekannte Felder und bekommt `ear` dazu, sonst ist der Wert nach dem Neustart weg. Die Weg-Anzeige
  wird zu „Hörmuschel?“ und der Hinweis aus H6 bleibt. Die Schwelle prüft Xander per „Bitte prüfen“.
- **G10a-2 Erster Song-Durchgang:** Nicht über `tkSongBegin`: Das verlangt `sr.over` und `R.songPlay` (Z. 40465), beides gibt es beim ersten Durchgang nicht
  (`songRecStart` Z. 19737–19738 startet nur `play()`, `sr.pending` bis zum Taktstrich). Stattdessen setzt `songRecBegin` Z. 19744 mit 🎤 (`ST.on`, `tkAudioOk()`)
  `sr.vox = {passes: [{a: 0, T: sr.startBeat}]}` und ruft `tkQ('song', true)` und `g8Begin(sr)`. `songRecEnd` ruft vor `pushSongUndo` Z. 19788
  `tkSongCommit(sr, song.bars, 0)` mit `sr.mode = 'over'`, `sr.from = 0` und danach `tkSongUndoFix(sr, true)`: ein Undo für Song und Stimme. Bricht die Aufnahme
  ab (Z. 19777), wird kein Take angelegt.
- **G10a-3 Pegel:** `ST.lvl` (gibt es schon) in der Aufnahme-Leiste Z. 26062ff, höchstens 15 Bilder/s, ohne Layout-Arbeit (nur `transform: scaleX`).
- **G10a-4 Wort über dem Ende:** Nach `tkVoiceTake`/FANG mit `post.sec > ⅓ Takt` (Felder `pre/post` Z. 42959–42962) erscheint ein Toast mit Aktion. Die Aktion setzt `clip.len + 1` und
  `a.out = post.out + post.sec`, in einem Undo.
- **G10a-5 Anlauf am Song-Anfang [V]:** Hat der Teil in Takt 1 einen Anlauf (`g3PreOf > 0`), startet ▶ SONG ab Takt 1 mit einem stillen Vorlauf von
  `ceil(pre/spb)` Schlägen (höchstens 2 Takte), damit der Auftakt hörbar bleibt (Befund 3b, `g3Entry` Z. 43029). Ohne Anlauf startet ▶ SONG wie heute.
  Der Offline-Render (VV1, Video und WAV des Songs) beginnt dann ebenso mit dem Vorlauf (Bild zeigt bis Takt 1 den Anfang), sonst fehlt der Auftakt im Video.
  Das betrifft nur Songs mit G3-Anlauf in Takt 1 (gibt es erst seit 4.25.0) und wird mit der Auslieferung angesagt.

**Abnahme.**
- [ ] **G10-01** Einmessen mit Attrappe `gainDb = −31` → `ear` wahr, Weg-Anzeige „Hörmuschel?“. Bei `−12` ist `ear` falsch.
- [ ] **G10-02** Leerer Song, 🎤, ● SONG, 8 Takte singen, ■ → `song.vox` mit 8 Takten, Undo entfernt Song und Stimme in einem Schritt, Laden deep-equal.
- [ ] **G10-03** Der Pegel-Balken folgt dem Fake-Mikro (Korrelation des Balkens mit dem RMS ≥ 0,9), Bildzeit p95 +≤ 0,2 ms.
- [ ] **G10-04** Take mit Wort 0,6 Takte über dem Ende → Toast. [Ja] → `clip.len + 1`, hörbar bis zum Wortende (Offline-Render des Clips enthält die Samples bitgleich zum Take).
- [ ] **G10-05** Song mit Anlauf vor Takt 1 → ▶ SONG: Der Anlauf klingt (RMS im Vorlauf > Rauschboden + 20 dB), Takt 1 liegt genau auf dem Raster. Ohne Anlauf startet es wie 4.25.0.

**Abhängigkeiten:** H6-Gerätetest (B-3), G3 (`g3PreOf`, `g3PostOf`), G8 (Ringpuffer, lange Takes).

### 2.2 G10b — Clip-Fenster Audio: Klammern, Anlauf/Ausklang, Rücken (Punkt 4) · ≈ 12 h

**Ziel.** Gesang „einzäunen“ wie in jedem Studio: Anfang und Ende ziehen, abgeschnittene Wörter zurückholen, den Gesang im Clip rücken. Die Klammer ist
zugleich die Schleife der Szene (Xanders Bild: Klammer = Clip = Schleife).

**Bedienung (iPhone):**
1. STIMME-Clip antippen → Takes-Blatt → **[✎ Clip]** (oder Clip-Blatt → **[✎ Clip-Fenster]**). Es öffnet sich `#wpSheet` im Modus „Clip“.
2. Die Welle zeigt in der Zoomstufe **„Ganzer Take“** auch 2 Takte Anlauf und 1 Takt Ausklang. Was außerhalb des Clips liegt, ist **grau** gezeichnet, man sieht also,
   was abgeschnitten ist.
3. Oben liegt ein eigener **Klammerstreifen** (30 px, Trefferfläche 44 px) mit **[** und **]**, links davor **▸** (Anlauf) und rechts dahinter **◂** (Ausklang).
4. **]** ziehen ändert das Ende in ganzen Takten. Die Ansicht friert beim Anfassen ein und scrollt am Rand mit, die Taktstriche ziehen magnetisch (G10f-Magnet),
   leuchten auf und geben einen leisen Einrast-Klick. **Halten** auf dem Griff schaltet auf 1/16 fein. Ein längerer Clip holt das Ausgesungene zurück.
5. **[** nach rechts schneidet den Anfang ab (vorne Stille). Nach links holt es Audio zurück, bis in den Anlauf.
6. **▸**/**◂** ziehen legt fest, wie viel Anlauf (0–2 Takte) bzw. Ausklang (0–1 Takt) klingt. Das ersetzt den automatisch gemessenen Wert.
7. Unten gibt es den Schalter **[⇆ Rücken]**. Ist er an, verschiebt ein Finger auf der Welle den Gesang unter festen Klammern (1/16-Raster; Halten = frei, ms-genau). Ist er aus,
   schwenkt ein Finger nur. Marken kann man hier nie greifen.
8. Während des Ziehens hört man die laufende Szene mit dem neuen Stand (alle ≤ 150 ms neu eingeplant, 5-ms-Blenden).

**Daten (additiv):**
- Vorhanden: `clip.audio = {take, in, out, at, gain, fadeIn, fadeOut, alt}` (Z. 39740–39748), `tkSched` Z. 40295–40309 spielt `[in, out]` ab `at`.
- **]**: `clip.len` ganzzahlig in Takten; `a.out = min(Take-Ende, a.in + (len·4 − at)·spb)`. Fein: Nur `a.out` innerhalb des letzten Takts.
- **[**: `at += Δ`, `in += Δ·spb`. Nach links bis `at = 0`, darüber hinaus in den Anlauf.
- **▸/◂** neu am Segment: `preU` / `postU` (Sekunden, `undefined` = gemessen; Segment-Felder nach §2 „Segment-Felder“, also auch in `alt` und beim Take-Wechsel
  richtig zugeordnet). `g3PreOf`/`g3PostOf` Z. 42974–42975 nehmen den Wert, wenn er gesetzt ist, **ohne** ihren Gleichheits-Test `|p.in − a.in| < 1e-4` bzw.
  `|p.out − a.out| < 1e-4`, geklemmt auf `a.in` bzw. die Rest-Länge des Takes.
- **G3-Falle:** Der gemessene Anlauf/Ausklang gilt heute nur, solange `in`/`out` genau an der gemessenen Stelle liegen (siehe oben). **[** und Rücken ändern `in`,
  **]** und Rücken ändern `out`; ohne Gegenmaßnahme verschwände der Anlauf/Ausklang still. Deshalb schreiben **[** und Rücken den bisher wirksamen Anlauf als
  `preU` und Rücken den bisher wirksamen Ausklang als `postU` fest (im selben Undo), sofern der Nutzer sie nicht schon gesetzt hat. **]** dagegen setzt `postU = 0`
  (K1-Regel: Ein verlängertes Ende hat den Ausklang schon im Clip, ein gekürztes Ende darf nicht in einen alten Ausklang springen). Liegt das Ende wieder genau
  auf der gemessenen Stelle, wird `postU` gelöscht, und der gemessene Ausklang gilt wieder.
- Rücken: `in` und `out` verschieben sich gemeinsam, mit den Grenzen `in ≥ 0` und `out ≤ Take-Länge`. Marken und Zeitkarte liegen in Take-Sekunden und wandern deshalb
  hörbar mit, ohne Umrechnung. G9-Silben-Anker (Take-Sekunden) bleiben gültig. VS-P misst je Puffer (Z. 39971ff), Rücken und Klammern ändern den Puffer nicht,
  der Auto-Pegel bleibt also gleich.
- Für `song.vox` gilt dasselbe Fenster über `tkRef({vox})`.

**Abnahme.**
- [ ] **G10-10** **]** auf einem Clip mit 1 Takt gespeichertem Ausklang um +1 Takt → `clip.len + 1`, `a.out` nach Formel. Der Offline-Render des Clips enthält die zuvor
  abgeschnittenen Samples bitgleich zum Take.
- [ ] **G10-11** **]** fein (Halten) → `a.out` auf 1/16 genau, `clip.len` unverändert. Danach gibt es keinen Ausklang mehr (K1-Regel).
- [ ] **G10-12** **[** +1 Schlag → Stille vorn genau 1 Schlag (±1 Sample). **[** −2 Takte über den Anfang → Anlauf hörbar, `preU` gesetzt.
- [ ] **G10-13** Rücken +1/16 → alle Einsätze (`wpMarks`) klingen 1/16 später ±1 Sample, `take.marks` und `take.warp` unverändert (deep-equal).
- [ ] **G10-14** 100 synthetische Gesten im Klammerstreifen und auf der Welle → nie eine Marke bewegt.
- [ ] **G10-15** Jede Geste ist genau 1 Undo. Speichern → Laden deep-equal. Kopieren/Duplizieren übernimmt `preU`/`postU`.
- [ ] **G10-16** Alte Projekte ohne `preU`/`postU` → M-G28 bitgleich.
- [ ] **G10-16a** Take mit gemessenem Anlauf ½ Takt: Rücken +1/16 und **[** +1 Schlag → Anlauf klingt weiter (G3-Log `pre` vorhanden, Länge wie vorher ±1 ms).
  Overdub danach und `tkPick` auf den alten Take → `preU` gehört weiter zum alten Take, der neue hat keinen (deep-equal der Segmente).
- [ ] **G10-17** Wiedergabe beim Ziehen: Klick-Detektor (wie VS3) findet 0 Knackser in 60 s Ziehen bei laufender Szene. Kein Task > 50 ms.
- [ ] **G10-18** M-PLATZ: Klammerstreifen und Griffe ≥ 44 × 44 in allen Formaten.

**Abhängigkeiten:** K1 (Ausklang-Regel) zuerst; G3 (pre/post), G1 (Zeitkarte in Take-Sekunden), G8 (lange Takes), G9 (Anker in Take-Sekunden, nur Prüfung),
G10e (gleiches Blatt, Zoom, Magnet aus G10f). Profi-Vorbild: Region-Ränder ziehen + Inhalt in der Region schieben.

### 2.3 G10c — Takes-Verwaltung (Punkt 9) · ≈ 12 h

**Ziel.** Klar sehen, was ein Take ist und wie er klingt, ihn benennen, markieren und aufräumen. Jede Loop-Runde einer Aufnahme wird ein Take.

**Bedienung (iPhone):**
1. STIMME-Clip antippen → Takes-Blatt. Oben steht die Zeile **„7 Aufnahmen in Szene 3 · oben = hörbar · neu oben“**.
2. Jede Zeile zeigt eine **Mini-Welle** über die volle Breite (64 Punkte, 20 px), darunter „Take 3 · REC · Runde 2 · 0:32 · 23:14 · 🎧“. Dazu kommen
   **Status-Chips** („Q 1/16“, „Säubern 60“, „♪“, „⇅“, „Text“, „Chor“; grau = roh), ein **Farbpunkt** und ein **★**.
3. Ein Tipp macht den Take aktiv (wie heute). **Halten** öffnet ein kleines Blatt: [Name ✎] · 5 Farben (grün = gut, gelb = vielleicht, rot = raus, blau, grau) ·
   [★ Favorit] · [✕ Löschen]. Ein Wisch nach links löscht ebenfalls, ✕ bleibt.
4. Unten stehen **„Andere Takes löschen (★ bleiben)“** (ein Undo) und [Aufräumen] mit der Größe, die frei wird.
5. Mikro-Blatt → **„Durchgänge als Takes [An] [Aus]“** (Geräte-Einstellung, Standard An): Singt man mit ● REC über 4 Loop-Runden **eines Clips mit fester Länge**,
   gibt es 4 Takes, der letzte liegt oben.
   **Vorrang VS-L (Xanders Wunsch „mindestens 16 Takte“, Nachtrag 4 L.1.2, Code `tkVoiceTake` Z. 40407–40410):** Steht „Länge“ auf AUTO, wächst der Clip wie heute
   auf die ganze Aufnahme (ein Take, bis 64 Takte). Durchgänge werden nur zu Takes, wenn „Länge“ fest gewählt ist (1…64, `rec.fixedLen` Z. 21135) oder der Clip
   in dieser Aufnahme nicht wächst (`nb ≤ old.len`). VS-L-01…11 bleiben grün.

**Daten (additiv):** `name` (≤ 24 Zeichen), `tag` (0–5), `fav` (bool), Runde `r` und feste Nummer `no` sind **Segment-Felder** (§2 „Segment-Felder“), nicht
Take-Felder: Die Runden eines Durchgangs teilen sich eine Take-id, und jede soll eigen benannt und markiert werden. Undo-Art wie die Stelle (`pushUndo` bzw.
`pushSongUndo`). `no` wird beim Anlegen vergeben (1 + größte Nummer im Clip) und ersetzt die K4-Zählung; fehlt es (alte Takes), gilt K4. Mini-Wellen kommen aus dem
PCM16 in IndexedDB (`tkPcm`, im Leerlauf/Worker, **ohne** AudioBuffer; Cache `pk:<id>:<in>:<out>`, 64 Byte, nicht im Projekt). Bei bearbeiteten Takes wird die
Zeitachse über die Zeitkarte (`take.warp.map`, wie `tkHeardMap`) umgerechnet; Tonhöhe, G4 und VS-P ändern die Hüllkurve kaum und werden für die Mini-Welle nicht
gerechnet. Durchgänge als Takes: Es entsteht **kein** neues Audio. Jede Runde ist ein Segment `{take: gleiche id, in, out, at, r}` in `audio.alt` (heute nimmt
`tkVoiceTake` Z. 40403–40411 nur die jüngste Runde; `alt` ist auf 16 begrenzt, Z. 40425/39786). Im Song gilt dasselbe über `tkSongWrap`/`passes` (Z. 40470).
Herkunft aus `take.src` (FANG/REC/SONG/Datei, Z. 39765).

**Abnahme.**
- [ ] **G10-20** 16 Takes à 32 s: alle Mini-Wellen in ≤ 1,5 s im Hintergrund. Der Heap wächst um ≤ 2 MB (kein AudioBuffer je Take). Blatt öffnen ≤ 16 ms Haupt-Faden.
- [ ] **G10-21** Mini-Welle = Ausschnitt `[in, out]`. Ein quantisierter Take zeigt die Einsätze an der gehörten Stelle (Vergleich mit `tkPeaks` Z. 39896 der gehörten
  Fassung: Korrelation der Hüllkurven ≥ 0,95, Einsatz-Lage ±1 Punkt).
- [ ] **G10-22** Name, Farbe und ★ überstehen Speichern/Laden, ZIP, Kopie und Online-Abgleich (deep-equal), auch für Takes in `alt`. Der WAV-Dateiname enthält den
  Namen des gewählten Segments.
- [ ] **G10-23** „Andere Takes löschen“ → ★ und der aktive Take bleiben, genau 1 Undo, [Aufräumen] meldet die freie Größe ±5 %.
- [ ] **G10-24** Länge 4 fest, Overdub über 4 Loop-Runden mit ● REC → 4 Segmente, jedes `[in, out]` = genau eine Runde am Clip-Raster (±1 Sample), Speicher gleich
  wie bei einer Aufnahme. Länge AUTO, 16 Takte über einen 4-Takt-Clip → wie VS-L-02 (Clip 16 Takte, ein Take). „Aus“ → wie 4.25.0.
- [ ] **G10-24a** Runde 2 benannt „gut“ und ★, Runde 3 rot → nach Wählen, Löschen, Speichern/Laden, ZIP und Kopie hat jede Runde ihre eigenen Felder (deep-equal).
- [ ] **G10-25** Die Status-Chips stimmen mit den Feldern überein (warp, cl, pitch, follow, lyrics/ly, chor), und zwar für jede Zeile, nicht nur für die oberste.
- [ ] **G10-26** M-PLATZ: Zeilen ≥ 44 px hoch, Chips brechen nie ab (bei Platzmangel „+2“).

**Abhängigkeiten:** K4; G1/G2/G7 (Chips), G9 (Chip „Text“ aus `take.ly`/`lyrics`), G6/G6+ (Chip „Chor“; sind die Stimmen eigene Spuren, heißt er „Chor-Gruppe“).

### 2.4 G10d — Comping: das Beste aus mehreren Takes (Punkt 9, Ausbau) · ≈ 24 h

**Ziel.** Aus mehreren Takes einen zusammensetzen, wie es Studios mit Wisch-Comping und Take-Bahnen tun.

**Bedienung (iPhone, nur quer im Clip-Fenster):**
1. Clip-Fenster → **[Takes]**. Bis zu 4 Takes stehen als Bahnen untereinander (scrollbar), jede mit ihrer Welle.
2. Waagrecht über eine Bahn wischen wählt diesen Bereich. Er rastet an Wort-Einsätzen (`wpMarks`) bzw. auf 1/8 ein, sichtbar mit Magnet und Klick.
3. Die oberste Leiste „Ergebnis“ zeigt in Farbe, welcher Take wo klingt. An den Nähten liegen automatisch 10-ms-Blenden.
4. **[Zusammenfügen]** macht aus der Auswahl einen neuen Take (für Quantisieren, Säubern und Tonhöhe, die pro Take rechnen), mit Undo.

**Daten (additiv):** `audio.comp = [{take, in, out, at}, …]`. Ist das Feld gesetzt, plant `tkSched` mehrere `tkPlace` je Durchgang ein. Fehlt es, bleibt alles wie heute.

**Zusammenspiel (sonst klingt es anders als gedacht):**
- **VS-P:** Jedes Stück bekommt den Auto-Pegel seines eigenen Takes (`vpGet(o.buf)` in `tkStartSrc` Z. 40201–40202), der zusammengefügte Take wird als Ganzes
  neu gemessen. [Zusammenfügen] schreibt deshalb die VS-P-Ausgleiche der Quell-Takes in die Samples (Begrenzer nicht), damit Comp und Ergebnis gleich laut sind.
- **G3:** Anlauf nur am ersten, Ausklang nur am letzten Stück des Comps.
- **G6/G7:** Chor (`audio.chor`) und „folgt Transponieren“ (`g7Follows`, je Take) gehören zum Lead-Take. Solange `comp` gesetzt ist, spielt der Chor nicht (Hinweis
  „Chor erst nach Zusammenfügen“); nach [Zusammenfügen] gilt er für den neuen Take.
- **Take-Wechsel:** `tkPick` (Tipp auf einen Take, A/B) und ein neuer Overdub entfernen `comp` im selben Undo, sonst hätte der Tipp keine hörbare Wirkung.

**Abnahme.**
- [ ] **G10-30** Comp aus 3 Takes: Nähte ohne Knacks (Klick-Detektor 0), Blende 10 ms ±1 ms.
- [ ] **G10-31** Comp-Wiedergabe gegen „Zusammenfügen“, beide live mit VS-P: Lautheit ±0,2 LU, Pegel je Stück ±0,2 dB, Hüllkurven-Korrelation ≥ 0,99. (Bitgleich
  geht nicht: VS-P misst den neuen Take als Ganzes neu.) Vor VS-P (Samples) ist das Ergebnis außerhalb der Nähte gleich den Quell-Stücken × ihrem Ausgleich (≤ −90 dB).
- [ ] **G10-32** Undo je Wisch. Speichern/Laden deep-equal. Alte Clips ohne `comp` bitgleich.
- [ ] **G10-33** Querformat 926 × 428: 4 Bahnen sichtbar, jede ≥ 44 px hoch. Im Hochformat ist [Takes] grau mit Hinweis „Quer drehen“.

**Abhängigkeiten:** G10b (Clip-Fenster), G10c (Wellen), G10e (Zoom/Gesten), G1/G2/G7 (Bearbeitung pro Take → Zusammenfügen).

### 2.5 G10e — Warp-Editor: Zoom ins Wort, Gesten ohne Versehen, Kontrolle (Punkt 5) · ≈ 14 h

**Ziel.** Bis in ein Wort hineinzoomen, prüfen, ob die Striche wirklich sitzen, und nie aus Versehen etwas verschieben.

**Bedienung (iPhone):**
1. Takes-Blatt → [✎ Marken · Quantisieren]. Ein Finger auf der Welle **schwenkt** immer, zwei Finger **zoomen** stufenlos vom ganzen Take bis ≈ 0,25 ms/px. Der Punkt
   unter den Fingern bleibt stehen. **Doppeltipp** zwischen zwei Strichen zoomt genau auf diese Silbe (±15 % Rand), ein zweiter Doppeltipp geht zurück.
2. Oben liegt eine **Mini-Karte** (48 px) mit dem Sichtfenster; Wischen auf ihr springt dorthin. Die Zoom-Taste bleibt und bekommt die Stufe „Wort“.
3. Striche greift man nur in der **Griff-Leiste** oben (Trefferfläche 44 px, aus K2). Beim Ziehen erscheint über dem Finger eine **Lupe** (±40 ms).
4. Eine neue Marke setzt man nur mit dem Werkzeug **[+ Strich]** oder mit 450 ms Halten in der Griff-Leiste, nie mehr per Tipp ins Leere.
5. **Prüfen:** Ein Tipp auf einen Strich öffnet [▶] [✕ Löschen]. [▶] spielt von 80 ms davor bis zum nächsten Strich, auf Wunsch mit einem Klick genau auf der Rasterlinie
   (Schalter „Klick“). Eine Abspielmarke läuft im Editor mit, „Folgen“ blättert seitenweise. Ab Zoom „1 Takt“ steht an jedem Strich der Versatz zum Raster
   („+23“: grün ≤ 10 ms, bernstein 10–40 ms, rot > 40 ms). Unten liegt blass die Einsatz-Kurve. **[Prüf-Lauf]** springt mit Klick von Strich zu Strich.
6. **Quantisieren fein:** Schalter **„Nur Wortanfänge“** (nur dicke Wort-Striche rasten, die Silben folgen anteilig) und **„Bereich“** (Q-Bereich: nur Einsätze, die
   mehr als X ms neben der Linie liegen, rücken; Standard aus). Tonwechsel-Marken mitten im Vokal werden bei neuen Erkennungen nicht mehr quantisiert.
7. **Studio-Ansicht [V-Funk]:** Quer belegt der Editor die volle Breite (heute höchstens 380 px, CSS Z. 2100). Hochkant lassen sich die Regler einklappen, sodass die Welle
   ≥ 200 px hoch wird (heute ≈ 115 px). Das wird **vorher im Funk** vorgeschlagen; ohne Xanders Ja bleibt die Größe wie heute, alles andere wird trotzdem gebaut.

**Technik / Daten:**
- Pinch nach dem Muster der Klavierrolle (`pinch()` Z. 12156–12164; ein zweiter Finger bricht die erste Geste ab, Z. 12016–12022) und des Hüllkurven-Editors
  (`toPinch` Z. 30537ff). Ab ≈ 2 Samples/px wird die Welle als Sample-Linie gezeichnet; der Spitzen-Cache `E.wc` bleibt.
- `take.marks[k].src` (`'on'|'pitch'`, additiv) wird beim Einfrieren mitgespeichert (heute verwirft `wpNormMarks` Z. 42150 die Herkunft).
  `take.warp.wo` (nur Wortanfänge) und `take.warp.qr` (Q-Bereich, ms) sind additiv. Fehlen sie, verhält sich `wpQuant` wie heute. Bestehende Zeitkarten rendern unverändert.
- Haptik: Laut Probe (`n8/G9-probe-ergebnis.md`: Tick per Code nein, beim Ziehen nein, nur ein echter Label-Tipp ja) werden Raster-Chips, [A/B] und Modus als
  `<label for=hapSw>` gebaut (Muster G9 §7.9). Beim Ziehen ersetzen der sichtbare Magnet und der Einrast-Klick die Haptik (G10f).

**Abnahme.**
- [ ] **G10-35** Pinch: Der Punkt unter den Fingern bleibt auf ±2 px stehen. Zoombereich ganzer Take ↔ 0,25 ms/px. 60 Bilder/s beim Pinch auf einem 32-s-Take (Chromium, 4× CPU-Bremse:
  p95 ≤ 16,7 ms).
- [ ] **G10-36** 1000 synthetische Ein-Finger-Gesten auf der Welle in allen Zoomstufen → 0 Marken bewegt, 0 Marken neu. 200 Zwei-Finger-Gesten → 0 Marken bewegt.
- [ ] **G10-37** Doppeltipp → Silbe füllt 70 ± 5 % der Breite. Zweiter Doppeltipp → vorherige Ansicht ±1 px.
- [ ] **G10-38** [▶] spielt `next − mark + 80 ms` ±5 ms. Der Klick liegt auf der Rasterlinie ±1 ms.
- [ ] **G10-39** Versatz-Zahlen = `wpGeom`-Werte ±1 ms. Farben nach Schwelle.
- [ ] **G10-40** „Nur Wortanfänge“ auf dem Korpus: Silben-Abstände innerhalb eines Worts bleiben im Verhältnis ±2 %. Wort-Einsätze liegen auf dem Raster ±1 ms.
- [ ] **G10-41** Q-Bereich 15 ms: Einsätze mit |Abstand| ≤ 15 ms bleiben bitgleich an ihrer Stelle.
- [ ] **G10-42** Alte Takes ohne `src`/`wo`/`qr` → `wpQuant` ergibt dieselbe Karte wie 4.25.0 (deep-equal), Render bitgleich.
- [ ] **G10-43** M-PLATZ inklusive Mini-Karte und Griff-Leiste. Kein Layout-Sprung beim Zoomen.

**Abhängigkeiten:** K2 (Sperre), G1 (`wpPaint`, A/B), G9 (G9c baut den Text-Modus im selben `#wpSheet` mit derselben 44-px-Treffer-Regel; G10e setzt auf den
G9-Stand auf), N2 (Mini-Karte), G10f (Magnet, Ziel-Ziehen).

### 2.6 G10f — Platzierer + Einrasten beim Ziehen (Punkt 5 und 6) · ≈ 18 h

**Ziel.** Ein Wort auf einen Schlag legen. Bei großen Wegen wird im Hintergrund geschnitten und verschoben statt gedehnt, ohne Blubbern. Die Bedienung bleibt ein Marker-Griff.

**Bedienung (iPhone):**
1. [V] Ein Strich am Dreieck (Griff-Leiste) gezogen verschiebt sein **Ziel**, also wo der Einsatz klingt. Heute verschiebt er die Quelle (`wpGest` Z. 42818 → `wpSrcT`).
   Die Geste bleibt (Xander: „Bedienung bleibt Marker-Ziehen“), ihre Wirkung ändert sich; das wird mit der Auslieferung im Funk angesagt, das alte Verhalten liegt
   auf „450 ms halten + ziehen“ (Schritt 4).
2. **Magnet:** Kommt das Ziel bis auf 10 px bzw. 20 % des Rasterschritts an eine Linie, springt der Strich darauf und klebt dort, bis der Finger ≥ 14 px weiter ist. Taktstriche
   ziehen 1,5-mal stärker. Die Linie leuchtet 150 ms bernstein, der Strich wird dicker, eine Blase zeigt „Takt 3 · 2 · 1/16“ bzw. frei „+12 ms“, und ein leiser
   **Einrast-Klick** ertönt (Einstellung „Einrast-Klick“, Standard An, nie während einer Aufnahme).
3. Ein **dicker Wort-Strich** nimmt das ganze Wort bis zum nächsten Wort-Strich mit. Ein dünner Silben-Strich bewegt nur seine Grenze.
4. **Fein:** Ein ruhender zweiter Finger schaltet den Magneten aus. **Audio-Stelle korrigieren:** 450 ms halten + ziehen, oder in [A/B] „Original“ ziehen.
5. Ein Punkt am Dreieck heißt „gepinnt“. Doppeltipp auf das Dreieck löst den Pin, der Strich folgt dann wieder dem Raster.
6. Unter der Welle liegt je Abschnitt ein Farbbalken: grün = Pause angepasst, blau = gedehnt (≤ 1,25), orange = 1,25–1,6, rot = > 1,6, ✂ = geschnitten.

**Hintergrund-Regel je Abschnitt (Worker, neuer Render-Modus `'auto'`):**
1. |Δ| ≤ 8 ms → nur kopieren/verschieben.
2. Liegt im Abschnitt eine Pause ≥ 60 ms (Energie < Rauschboden + 6 dB, aus `active` von `detectMarks`), nimmt sie Δ ganz auf (mindestens 20 ms bleiben). Die Stimme behält Faktor 1,0.
3. Liegt der Restfaktor bei 0,8–1,25, dehnt WSOLA nur den stimmhaften Kern. Die Konsonanten-Sperre (20 ms + WP_LEAD 4 ms, Z. 42280) bleibt.
4. Sonst wird geschnitten + verschoben. Der Schnitt liegt am Nulldurchgang 3–4 ms vor dem Einsatz. Bei einer Lücke wird der Vokal bis 1,25 gedehnt, danach folgen 40 ms gleichleistender Ausklang +
   Stille/Raumrauschen (aus der nächsten Pause kopiert). Die Perioden-Schleife ist auf **höchstens 30 ms** begrenzt (heute unbegrenzt, Z. 42051–42070 und `renderSlices`
   Z. 41919–41938). Bei einer Überlappung wird bis 0,8 gestaucht, den Rest blendet das Ende des vorigen Blocks über 15–30 ms gleichleistend unter den neuen Einsatz. Der Einsatz selbst wird nie geblendet.
5. Hysterese: hinein bei 1,25/0,8, heraus bei 1,18/0,85.

**Daten (additiv, Regel 28):** `take.marks[k].at` = festes Ziel in Schlägen ab `warp.t0` (gepinnt). `take.warp.mode = 'auto'` (neu, Standard für **neue**
Quantisierungen von Gesang). `take.warp.v = 2` aktiviert die Schleifen-Grenze und die engeren Dehngrenzen. `'slice'` und `'stretch'` ohne `v` rendern bitgleich wie
4.25.0 (`wpNormWarp` Z. 42163). `wpQuant` lässt gepinnte Marken stehen und quantisiert nur die übrigen. Die Karte entsteht wie heute mit `makeWarp` Z. 41870.
Einrast-Klick: 3 ms, −30 dBFS über `AU.ctx`, wie das Metronom-`click()` Z. 19071.

**Abnahme.**
- [ ] **G10-50** Ein Wort per Ziehen auf Schlag 3 → Einsatz klingt bei Schlag 3 ±5 ms (Onset-Messung im Render).
- [ ] **G10-51** Modus `'auto'` auf dem Korpus: kein Abschnitt außerhalb 0,8–1,25 ohne Schnitt. Schleifenfüllung ≤ 30 ms. Klick-Detektor 0. Formanten ±1 dB bis 4 kHz in gedehnten Abschnitten.
- [ ] **G10-52** Pause vorhanden → Stimme im Abschnitt bitgleich zum Original (nur verschoben).
- [ ] **G10-53** Hysterese: 100 Hin-und-her-Züge über die Schwelle → Moduswechsel des Abschnitts ≤ 2-mal.
- [ ] **G10-54** Magnet: Ziel springt bei ≤ 10 px auf die Linie, löst sich erst nach ≥ 14 px. Blase zeigt Takt · Schlag · Raster richtig. Klick-Ton genau einmal je Einrasten, nie bei laufender Aufnahme.
- [ ] **G10-55** Rendern nach einem Zug: ≤ 150 ms für 16 Takte im Worker, **gemessen bis zum hörbaren Wechsel**. Der Wechsel wartet, bis VS-P die neue Fassung
  gemessen hat (`wpSwitch` Z. 42364 `vpReady`, Häppchen ≤ 6 ms im Haupt-Faden); diese Zeit zählt mit. Wechsel ohne Knacks (`wpSwitch` Z. 42353, 12-ms-Blende).
  Haupt-Faden ohne Task > 50 ms.
- [ ] **G10-56** Undo je Zug, Pin lösen = 1 Undo. Speichern/Laden deep-equal. Alte Takes (ohne `v`, ohne `at`) → M-G28 bitgleich.
- [ ] **G10-57** G4-Silben-Dynamik unverändert (Marken-Zeiten `t` bleiben; `at` ist nur das Ziel). G9-Silben folgen der gehörten Fassung (`tkHeardMap`).

**Abhängigkeiten:** G10e (Griff-Leiste, Lupe, Zoom), G1 (`makeWarp`, `wpRender`, A/B), G4 (Silben-Dynamik), G9d (`tkHeardMap`), G2/G7 (Tonhöhe auf der gehörten Fassung wie heute).
Reihenfolge nach Xanders „mach erstmal das fertig, was du hast“: K2 → G10e → G10f.

### 2.7 G10g — Tonhöhe nach Tonart: wählbar, sauber, Konsonanten sichtbar geschützt (Punkt 7) · ≈ 9 h

**Ziel.** Hart quantisieren rastet heute schon nur auf Töne der Tonart (`g2Snap` Z. 44111–44115) und lässt stimmlose Teile bitgleich (`render()` mit Randschutz).
Neu: Die Tonart ist wählbar bzw. wird aus dem Gesang erkannt, Verschieben bleibt in der Tonart, und es gibt keine Oktav-Ausreißer.

**Bedienung (iPhone):**
1. Takes-Blatt → [♪ Tonhöhe · Noten]. Im Kopf steht der Chip **„Tonart: E-Moll · Auto ▾“**. Ein Tipp öffnet eine Leiste mit [Auto (Szene)] [Aus dem Gesang] [Projekt], den 12 Grundtönen,
   Dur/Moll/Dorisch/Mixolydisch/Phrygisch sowie [Pentatonik Dur] [Pentatonik Moll] [Harm. Moll] [Chromatisch]. Ist die Erkennung unsicher (< 0,25), zeigt der Chip beide
   Vorschläge.
2. Ist Quantisieren an, verschieben ▲/▼ und senkrechtes Ziehen **stufenweise in der Tonart**. Halten + Ziehen geht frei in Halbtönen.
3. Der Regler **„Einrast-Zeit“** (0–100 ms) ersetzt die festen 15/40 ms (Hart ≈ 0–15, Weich ≥ 40).
4. Halten auf einer Note → „nicht rastern“ (für Blue Notes und Schleifer).
5. Stimmlose Teile (s, t, k, Atem) liegen als graue Schraffur unter den Noten. Man sieht, dass sie unberührt bleiben.

**Daten (additiv, Regel 28):** `take.pitch.key.src = 'auto'|'user'`. Bei `'auto'` wird die Tonart bei jedem Weich/Hart und jeder Szenen-Änderung neu gelesen, heute ist sie
in `g2Edit` Z. 44239 eingefroren und `g2SetQ` übernimmt keine neue (`if (!P.key)` Z. 44257). `take.pitch.notes[k].nq` (nicht rastern), `take.pitch.rt` (Einrast-Zeit ms),
`take.pitch.v = 2` aktiviert die Oktav-Klammer in `curve()` Z. 43934ff (weicht `fm[i]` mehr als 1,5 Halbtöne von `n.m` ab, gilt `n.m`) und die einstellbare Zeit. Ohne `v`
bleibt der Render bitgleich wie 4.25.0. Die zusätzlichen Leitern liegen in einer **eigenen** Liste `G2_SCALES`, `Harmony.SCALES` (Z. 10925–10929) bleibt unangetastet, damit
Tonart-Erkennung und Eine Skala nicht anders werden. Song-Stimme: Jede Note bekommt die Tonart der Szene an ihrem Takt (heute gilt eine Tonart für den ganzen Take,
`g2SongScene(v.bar)` Z. 44233). G7 nutzt dieselbe Quelle wie G2 (heute `g7Key` Z. 44802 ≠ `g2KeyAt` Z. 44225).
„Aus dem Gesang“ = `KeyDetect.detectKey` (Z. 11326–11360) über die Take-Noten, gewichtet nach Dauer.
**Regel-28-Schranke für G10g:** Alles Neue (Neu-Lesen bei `'auto'`, Tonart je Note im Song, gemeinsame Quelle G2/G7, neue Leitern) gilt nur für Takes mit
`pitch.v = 2` bzw. gesetztem `key.src`. Fehlen beide (alle Takes bis 4.25.x), bleibt `P.key` eingefroren wie heute, und G7 rechnet weiter mit `g7Key` Z. 44802;
sonst klänge ein alter, transponierter Take nach dem Update anders. Die neuen Leitern brauchen zwei Stellen, die heute nur `Harmony.SCALES` kennen:
`g2NormPitch` Z. 44105 (würde eine unbekannte Leiter beim Speichern/Laden verwerfen) und `g2Snap` Z. 44112 (fiele auf Dur zurück). Beide lesen
zuerst `G2_SCALES`, dann `Harmony.SCALES`.

**Abnahme.**
- [ ] **G10-60** 100 Noten in C-Dur, Hart 100 % → jedes Ziel liegt in der Leiter (Tabelle). Mit [Pentatonik Moll A] liegen nur noch A C D E G.
- [ ] **G10-61** „Aus dem Gesang“ auf 20 synthetischen Melodien mit bekannter Tonart → ≥ 80 % richtig. Unsicher → zwei Vorschläge.
- [ ] **G10-62** ▲ von E in C-Dur mit Quantisieren an → F. Halten + Ziehen → F♯ möglich. Ohne Quantisieren wie heute.
- [ ] **G10-63** Eingestreuter Oktav-Fehler (Erkennung springt +12 in einer Note) → Hart zieht ≤ 150 ct (mit `v = 2`).
- [ ] **G10-64** Stimmlose Strecken bei Hart 100 % bitgleich zum Original (Sample-Vergleich außerhalb der stimmhaften Fenster).
- [ ] **G10-65** Alte Takes ohne `v` → Render bitgleich (M-G28). Tonart-Erkennung und Eine Skala anderer Spuren unverändert (Regression).
- [ ] **G10-66** M-PLATZ des Tonart-Chips und der Leiste (≥ 44 px, quer und hoch).

**Abhängigkeiten:** G2, G7 (gleiche Tonart-Quelle), G6 (Chor folgt dem Lead → G10i), später Magic Scale (dieselbe Tonart-Erkennung).

### 2.8 G10h — Gesang im gewohnten Notenfenster (Punkt 8) · ≈ 24 h (Phase 1 ≈ 10 h, Phase 2 ≈ 14 h)

**Ziel.** Den Gesang mit derselben Bedienung bearbeiten wie MIDI-Noten, ohne Extra-Layout. **[V-Funk]:** Das ersetzt das heutige Tonhöhe-Canvas-Blatt (`g2Open`
Z. 44292). Xander hat es mit „kein Extra-Layout“ im Grundsatz gewünscht. Die Anordnung wird trotzdem vorher im Funk gezeigt.

**Bedienung (iPhone):**
1. Takes-Blatt → [♪ Noten]. Es öffnet sich die **Klavierrolle** mit allem, was sie kann: Auswahl-Rahmen, ALLE, Pinch-Zoom waagrecht/senkrecht, Tasten-Spalte mit
   Vorhören, Lineal mit Taktnummern und Loop-Bereich, Raster-Chip, Abspielkopf mit FOLGEN, Mini-Karte, Undo je Geste.
2. Hinter den Noten liegen blass die Welle, die dünne Tonhöhenlinie und die Schraffur der stimmlosen Teile.
3. Die Velocity-Spur heißt hier **Pegel**: Lautstärke je Note bzw. Silbe.
4. Die Aktionsleiste enthält Tonhöhe Aus/Weich/Hart, Stärke, den Tonart-Chip (G10g), Teilen, Verbinden, A/B und WAV.
5. **Phase 2:** Noten in der Zeit ziehen und ihre Länge ändern. Das setzt bzw. verschiebt Zeitkarten-Marker an den Notengrenzen, mit der Platzierer-Technik aus G10f.

**Technik / Daten:** `PianoRoll.create` (Z. 11638) bekommt einen Audio-Modus und den Hintergrund-Hook `opts.under` (nach Zeilen/Raster, vor den Noten; `draw` Z. 11771–11850).
Ein Modell-Adapter macht aus `take.pitch.notes` Noten-Objekte `{t, d}` in Schlägen über die Zeitkarte, `n` = gehörte Höhe, `v` = Notenpegel. Höhe wird als `sh` zurückgeschrieben,
mit Leiterstufen nach G10g. Additiv kommt `take.pitch.notes[k].g` (dB, Pegel je Note) dazu, mit Render-Version `v = 2`. Ohne `g` bleibt alles bitgleich.
**Wo `g` wirkt:** Die Kette je Take ist Säubern → G4 (inkl. Silben-Dynamik, die leise Silben anhebt) → G2 → Zeitkarte (Reihenfolge der Liste `tkExt().proc`:
`wpProc` vorn Z. 42182, `g4Proc` Z. 43781 und `g2Proc` Z. 44134 dahinter, Säubern zuletzt; der erste Eintrag mit Ergebnis gewinnt, `tkPlayBuf` Z. 39887–39889),
danach misst VS-P die ganze Fassung (`vpKick`, Z. 39971ff). Läge `g` davor, würde die G4-Silben-Dynamik eine abgesenkte Note wieder anheben, und VS-P würde den ganzen Take nachregeln (alle
Nachbarn würden lauter). Deshalb wirkt `g` **nach** G4 und wird von VS-P **nicht** mitgemessen: VS-P misst die Fassung ohne `g`, `g` wird danach als
Pegel-Hüllkurve (10-ms-Rampen) auf dieselbe Fassung gelegt. So hält G10-72.

**Abnahme.**
- [ ] **G10-70** Dieselben Höhen-Änderungen im alten Blatt und im neuen Fenster ergeben deep-equal `take.pitch` und einen bitgleichen Render.
- [ ] **G10-71** Alle Rollen-Funktionen der Liste in Schritt 1 gehen per Touch (CDP), jede Geste ist 1 Undo.
- [ ] **G10-72** Pegel −6 dB auf einer Note → RMS der Note −6 ± 0,3 dB, Nachbarn unverändert (≤ −90 dB Unterschied außerhalb von 10-ms-Blenden).
- [ ] **G10-73** Phase 2: Note um 1/8 verschoben → Einsatz 1/8 später ±5 ms, Konsonant davor unverändert.
- [ ] **G10-74** Bildzeit beim Pinch p95 ≤ 16,7 ms auf einem 32-s-Take. M-PLATZ. Kein Layout-Sprung.

**Abhängigkeiten:** G2, G10g (Leiterstufen, Tonart-Chip), G10f (Phase 2), G10i (Schatten über `opts.under`), G6+ (entkoppelte Stimmen öffnen im selben Fenster), N2 (Mini-Karte).

### 2.9 G10i — Chor sichtbar und in der Tonart (Punkt 8 und 11) · ≈ 8 h

**Ziel.** Alle Chorstimmen farbig als Schatten hinter dem Lead, und der Chor bleibt in der Tonart, wenn der Lead geändert wird.

**Bedienung (iPhone):**
1. Im Noten-Fenster des Leads liegen alle Chorstimmen halbtransparent hinter den Lead-Blöcken. Die Farbe richtet sich nach dem Intervall: **Terz rot, Quinte grün, Sexte
   blau, Oktave violett, Unisono/Doppel grau**. In jedem Block steht eine Ziffer („3“, „5“, „6“, „8“), damit es auch bei Farbschwäche lesbar ist. Zusätzlich gibt es je Stimme eine dünne farbige
   Tonhöhenlinie.
2. Oben liegen Legenden-Chips je Stimme mit Auge (zeigen/ausblenden) und Solo. Ein Tipp auf einen Schatten macht diese Stimme zur bearbeiteten, der Lead bleibt grau sichtbar.
   Das heutige Extra-Fenster (Chor-Blatt → [♪ Noten]) entfällt.
3. Chornoten außerhalb der Tonart bekommen einen roten Rand.
4. Unter dem STIMME-Clip in Spur und Song-Ansicht liegt optional ein dünnes Chor-Band (Einstellung, Standard aus).

**Technik / Daten:** Die Daten sind da (`x.a.chor.voices[].n` mit `iv`, `g6NormChor` Z. 44485). **Chor folgt dem Lead (Befund 11c):** Bei jeder Lead-Änderung
(`g2Edit`, `g7Changed`) werden die `iv` aus dem gespeicherten Rezept und der gehörten Höhe neu berechnet (heute fest seit `g6Build` Z. 44552–44558). Von Hand geänderte
Chornoten bleiben als `own` (Versatz in Leiterstufen, additiv) erhalten. Das passiert im selben Undo wie die Lead-Änderung. **Regel 28:** Neu gerechnet wird nur bei einer Lead-Änderung
**nach** G10i, nie beim Laden. Alte Projekte bleiben deshalb bitgleich, bis man den Lead bearbeitet. **Selbst gesungene Stimmen** (`voice.take`, gesetzt von
`g6Took` Z. 44715) werden nie neu gerechnet: Sie sind Audio und keine verschobene Kopie des Leads; der Schatten zeigt ihre eigene Tonhöhe.
**Entkoppeln (Befund 8b) gehört zu G6+** (Chor-Gruppe: jede Stimme eine eigene Spur, „Als Chor-Stimme duplizieren“, Umbau `stimmeT()` auf mehrere STIMME-Spuren;
heute lässt das Normalisieren nur **eine** STIMME-Spur zu, Z. 39809). G10i liest die Schatten dann aus den Gruppen-Spuren statt aus `audio.chor`.
**Achtung:** Eine G6+-Spec gibt es noch nicht (Stand 01.11., `v3-ideen/` enthält nur die Wünsche in `fragen-xander-9.md` 22:05/22:35). Sie muss vor 4.28.0
geschrieben werden und Xanders Punkt 8 („Chor entkoppeln“) ausdrücklich abdecken, sonst hängt dieser Punkt an keinem Paket.

**Abnahme.**
- [ ] **G10-80** C-Dur, Terz oben: Lead E → ▲ F ⇒ Chorstimme A (nicht G♯). Tabelle mit 30 Fällen ist zu 100 % richtig.
- [ ] **G10-81** Von Hand geänderte Chornote bleibt nach einer Lead-Änderung als Stufen-Versatz erhalten.
- [ ] **G10-82** Farbe und Ziffer je Intervall richtig (Tabelle). Leiterfremde Chornote rot umrandet.
- [ ] **G10-83** Tipp auf einen Schatten → diese Stimme bearbeitbar, der Lead grau. Auge/Solo wirken (Solo: nur diese Stimme hörbar, RMS anderer Stimmen < −90 dBFS).
- [ ] **G10-84** Alte Projekte mit Chor → M-G28 bitgleich. Lead-Änderung + Chor-Neuberechnung = 1 Undo.
- [ ] **G10-85** Zeichnen von 4 Schattenstimmen kostet p95 +≤ 2 ms Bildzeit.

**Abhängigkeiten:** G6 (Chor-Daten), G6+ (Gruppe/Entkoppeln, kommt vorher), G10h (Notenfenster) bzw. übergangsweise `g2Paint` Z. 44360ff, G10g (Tonart-Quelle).

### 2.10 G10j — Vorlage-Spur beim Nachsingen und Ersetzen (Punkt 1 und 11) · ≈ 11 h

**Ziel.** Beim Einsingen eine Vorlage hören, z. B. den Original-Bass oder die alte Stimme, im Doppel nachsingen und danach den Take tauschen. Eine Chorstimme lässt sich
sichtbar nachsingen.

**Bedienung (iPhone):**
1. ● halten (Szene) bzw. ● SONG halten (Song) → Zeile **„Vorlage [aus] [alte Stimme] [Spur ▾]“**. Unter ▾ stehen Bass, Melodie, Synth …, Chorstimme. Dazu kommen
   **„Vorlage lauter“** (+6 dB) und **„Rest leiser“** (−10 dB).
2. Die Vorlage klingt nur während des Takes. Sie wird nie mit aufgenommen oder exportiert, und nach dem Take ist alles automatisch wieder normal.
3. Im Song heißt der Modus für Gesang **„Ersetzen (Vorlage hörbar)“** statt „Overdub“ (in H7 schon als Schalter da).
4. Takes-Blatt → [A/B] tauscht Vorlage und neuen Take (gibt es schon).
5. **Selbst singen (Chor):** Das Aufnahme-Overlay zeigt eine schmale **Vorlage-Leiste**. Darin stehen die Zielstimme farbig (Farbe wie G10i), der Lead grau, ein laufender Abspielkopf und ein
   **Live-Punkt** der eigenen Tonhöhe (grün bei ±25 ct, sonst gelb/rot mit Pfeil ↑/↓). Es gibt den Regler „Vorlage-Pegel“ und den Schalter „Lead leise mithören“. Das geht auch für
   Song-Stimmen (heute bricht `g6Arm` Z. 44705 bei `r.vox` ab).

**Technik / Daten:** Nichts kommt ins Projekt. Die Vorlage ist eine vorübergehende Verstärkung an den Spur-Ausgängen (`AU.tracks[i]`) und wird beim Take-Ende und bei ■ exakt
zurückgesetzt. Dafür bekommt jede Spur einen **eigenen** GainNode `guide` (Wert 1, also bitgleich) zwischen `post` und `cut` (`buildTrack`-Kette Z. 17902–17905),
vor den Post-Fader-Sends, damit auch Hall/Echo der Spur mitgehen. **Nicht** `vol` (Spur-Pegel, den der Nutzer während des Takes bewegen kann) und **nicht**
`cut` (gehört MK7: `mkDryCut` Z. 18325–18327 schaltet darüber den trockenen Weg von Vocoder-Eingängen ab). Die Pegel stehen im Geräteprofil.
Song-Stimme: „Selbst singen“ braucht den Haken auch im Song-Weg, denn `g6Took` wird heute nur aus `tkVoiceTake` Z. 40427 aufgerufen, nicht aus
`tkSongCommit` Z. 40472ff. Der Live-Punkt kommt aus dem vorhandenen MPM-Weg im Worklet „synq-stimme“ (VSDSP-Kopf Z. 38797).
Mit 🔈 zieht der Echo-Abzug die Vorlage ab (Referenz `AU.M.ceil`).

**Abnahme.**
- [ ] **G10-87** Während des Takes: Vorlage-Spur +6 ± 0,5 dB, Rest −10 ± 0,5 dB (Gain-Knoten gemessen). Nach dem Take und nach ■ ist jede Verstärkung bitgleich zum Ausgangswert.
- [ ] **G10-88** Video-Render (VV1) und WAV-Export mit aktiver Vorlage = ohne Vorlage (bitgleich).
- [ ] **G10-89** Live-Punkt: Fake-Mikro mit Sinus 440 Hz gegen das Ziel A4 → grün. Bei 460 Hz gelb mit ↓. Verzögerung ≤ 60 ms.
- [ ] **G10-90** Selbst singen mit Song-Stimme geht, und die Aufnahme ersetzt die Chorstimme (wie `g6Took` Z. 44712).
- [ ] **G10-91** M-PLATZ der Vorlage-Zeile und -Leiste. Kein Layout-Sprung beim Einblenden.

**Abhängigkeiten:** H7, H1 (Begleitung), G6 (`g6Arm`, `g6Solo`), G6+ (Chor-Spuren als Vorlage), G10i (Farben), G10a (Ausgang).

### 2.11 Punkt 10 (Songtext) — kein G10-Paket, zwei Zusätze zu G9

Die Erkennung gesungener Wörter ist G9 (Nachtrag 8, `n8/G9.md`) und braucht die Freigabe F-1 (§4). Aus der Code-Analyse kommen zwei Zusätze zu G9:
- **G9-Z1 Text beginnt im unsichtbaren Vorlauf [K]:** `wpPaint` Z. 42670/42735 verteilt die Silben ab der ersten Marke des ganzen Takes, also auch im
  2-Takt-Vorlauf (`g3PreCap` Z. 42895–42897). Die Ansicht beginnt aber erst kurz vor `a.in` (`wpView` Z. 42658–42662). In G9a/`g9View` beginnt die Zählung bei der ersten
  Marke ≥ `a.in − g3PreOf(a)`, die Ansicht ebenso (G9 §7.2). Da sich die Anzeige alter Takes ändert, wird das mit der Auslieferung im Funk angesagt.
- **G9-Z2 Diktat als Weg ohne Modell:** Kein Bau mit der Spracherkennungs-Schnittstelle des Browsers (G9 §4.1). Im Text-Modus und in [Ganzer Text] steht ein Hilfe-Satz: „Text mit der
  Mikrofon-Taste der Tastatur einsprechen; die Silben verteilt die App selbst“. G9a (`g9Syl` + `g9Align`) macht daraus ohne Modell silbengenauen Text.

---

## 3. Reihenfolge und Zeitplan

| Schritt | Version (Vorschlag) | Inhalt | Aufwand | Kalender (Zweige) |
|---|---|---|---|---|
| 0 | **4.25.0** | G-GES-Merge (läuft) | — | — |
| 1 | **4.25.1** | Hotfix Einsingen H1–H8 (H4/H5 nach Schnitt-Regel §1), danach sofort Gerätetest B-3 mit Xander (5 min) | ≈ 11 h | ≈ 5–6 h (2 Helfer) |
| 2 | **4.25.2** | Gesangs-Fehler K1–K4 (+ H4/H5, falls aus 4.25.1 verschoben; parallel zum Video-Zweig, vor 4.26.0) | ≈ 5 h | ≈ 3 h (1 Helfer) |
| 3 | **4.26.0** | Video (Nachtrag 5, VV-Wellen) | laut Video-Plan | — |
| 4 | **4.27.0** | G9 Songtext (Nachtrag 8) + G9-Z1/Z2; [Erkennen] nur nach F-1 | ≈ 37–47 h | ≈ 18–24 h (3 Zweige) |
| 5 | **4.28.0** | G6+ Genre-Chöre, Chor-Gruppe, „Als Chor-Stimme duplizieren“ (enthält Entkoppeln, Befund 8b ≈ 18 h) | laut G6+-Spec | — |
| 6 | **4.29.0** | **G10 Welle 1:** A `g10-br-C` G10a + G10b · B `g10-br-T` G10c · C `g10-br-W` G10e | 6 + 12 · 12 · 14 = 44 h | ≈ 18 h |
| 7 | **4.30.0** | **G10 Welle 2:** D G10f (nach G10e) · E G10g → G10h Phase 1 · F G10i + G10j (nach G6+) | 18 · 9 + 10 · 8 + 11 = 56 h | ≈ 20 h |
| 8 | **4.31.0** | **G10 Welle 3:** G10h Phase 2 (nach G10f) · G10d Comping (nach G10b/c/e) | 14 · 24 = 38 h | ≈ 24 h |

**Summe G10 ≈ 138 h** Bauzeit, dazu ≈ 10 h Zusammenführung und Regression. Mit drei Zweigen je Welle sind das ≈ 60–65 h Kalenderzeit. Jede Welle wird einzeln
ausgeliefert (Changelog, Snapshot, „Bitte prüfen“). Fertige Teilstände gehen sofort als Vorschau raus (Regel 31).

**Begründung der Reihenfolge.** Hotfix zuerst, denn er blockiert das Einsingen und ändert keine Funktion von G9/G6+. Danach kleine Fehler vor dem Video, damit nichts
Kaputtes mitwandert. G9 vor allen neuen Funktionen (Xander 31.10. ~19:45). G6+ vor G10, weil G10i/G10j und G10h die Chor-Spuren brauchen (Xander 22:05/22:35). In G10 gilt
Xanders „mach erstmal das fertig, was du hast“: erst die Werkzeuge rund um das Vorhandene (Klammern, Takes, Warp-Editor), dann der Platzierer, zuletzt Comping.

**Nächstes spruchreifes Ergebnis (Punkt 12):** 4.25.1. Damit hörst du beim Singen die Musik, und nach dem Vorzähler ist Ruhe. Das kommt etwa 5–6 h nach dem Start des Hotfix-Zweigs,
gleich nach 4.25.0.

---

## 4. Offene Punkte (nur Geld und Zugang)

- **F-1 Netzfreigabe für das Sprachmodell (Zugang, betrifft Punkt 10 / G9b).** Der Bau muss einmal Modell und Prüfkorpus holen. Das blockiert heute der Proxy
  der Cloud-Sitzung (huggingface.co: CONNECT 403). Die App selbst braucht später kein Internet dafür. Weg (≈ 2 min, einmalig): Titelleiste der Claude-Sitzung →
  Cloud-Umgebung → Bearbeiten → Netzwerkzugriff → Erlaubte Domains „huggingface.co“ und „*.hf.co“ eintragen, „Paketmanager erlauben“ angehakt lassen. Danach darf
  die Freigabe wieder weg. Ohne Freigabe: G9 Stopp-Punkt 1. Text einfügen, Silben verteilen, Korrigieren und Diktat (G9-Z2) gehen trotzdem, nur [Erkennen] fehlt.
- **F-2 Apple-Entwicklerkonto (Geld, ≈ 99 €/Jahr [W]), optional.** Echte Haptik **beim Ziehen** (Einrasten am Taktstrich) geht in Safari nicht (Probe 01.11.).
  Sie wäre nur in einer eigenen App-Hülle möglich (WKWebView + System-Haptik, Verteilung über TestFlight). Ohne Konto bauen G10e/G10f den sichtbaren Magneten, den leisen
  Einrast-Klick und echte Haptik bei Tipps (Label-Muster). Die Frage ist an Xander gestellt, gebaut wird ohne Antwort die Fassung ohne Konto.
- **F-3 `max_app` anheben (Zugang, Supabase, Regel 20).** Heute 4 030 000. Für 4.31.0 (G10 Welle 3) muss Xander den Wert vor der Auslieferung anheben. Der Dirigent
  erinnert rechtzeitig, ruft Supabase aber nie selbst auf.

## 5. Prüfvermerk Fassung 2 (01.11., nur Code gelesen, nichts gemessen [K])

**Abdeckung Xander 31.10. ~23:30:** Punkte 1–13 haben je ein Paket (Übersicht oben). Punkt 3 (Auftakt) und Punkt 12 (Zeitplan) sind jetzt auch in §0
beantwortet; §0 Nr. 3 nennt die echte Reihenfolge (Video → G9 → G6+ → G10).

**In Fassung 2 berichtigt:** Korrektur 2 (STIMME ist eine Synth-Spur, der Sofort-Tipp stimmt) · H-01/B-1 (keine Musik im Einzähler, Z. 19435) · H2 `vox` in
`setRecTargets`/`recTgShort`/START-Knopf · H3 Laden von `vocClick` · H5 wartet auf die Kurz-Einmessung (sonst Pieptöne im Take) · H6/G10a-1 Speicherort
(`stProf` verwirft unbekannte Felder) · Schnitt-Regel 4.25.1 · K2 Griff-Streifen 44 px, Tipp unverändert, G9-Basis · K3 gilt für alle Clips · K4 Nummern beim
Löschen · §2 Segment-Felder (`tkNormSeg`-Haken, `tkPick`) und Taktarten-Hilfsfunktion · G10a-2 eigener Weg statt `tkSongBegin` · G10a-5 Video ·
G10b G3-Gleichheitstest bei Klammern/Rücken · G10c Vorrang VS-L, Felder je Segment, Mini-Welle · G10d VS-P/G3/G6/`tkPick` · G10f [V] und VS-P-Wartezeit ·
G10g Regel-28-Schranke, `g2NormPitch`/`g2Snap` · G10h `g` nach G4, außerhalb VS-P · G10i selbst gesungene Stimmen, fehlende G6+-Spec · G10j eigener `guide`-Knoten
(MK7 nutzt `cut`), Song-Weg für `g6Took`.

**Noch offen:**
1. **G6+-Spec fehlt.** Punkt 8 „Chor entkoppeln“ (≈ 18 h) und G10h/i/j hängen daran; vor 4.28.0 schreiben.
2. **Klick bei MIDI-Aufnahmen:** H3 ändert nur Gesang. Xanders „läuft weiter, obwohl aus“ kann auch MIDI meinen; „Metronom bei Aufnahme“ (Projekt-Feld, ab Werk An)
   bleibt dafür unverändert. Ein Wechsel des Werks-Standards wäre sichtbar anders → nur als Funk-Vorschlag (CLAUDE.md Regel 3), nicht bauen.
3. **Durchgänge als Takes bei fester Länge** ersetzt dort das VS-L-Wachsen (AUTO bleibt wie VS-L). Mit der Auslieferung ansagen [V].
4. **Gerätewerte [S]:** Hörmuschel-Schwelle −26 dB (G10a-1) und die beste Sitzungsart (H6) hängen am Gerätetest B-3.
5. **Versionsnummern** 4.26–4.31 kollidieren möglicherweise mit parallelen App-Paketen (North, Bit Mask, Innovation, T1, Magic Scale); der Dirigent vergibt
   sie beim Zusammenführen.
6. Alle Zeilen-Befunde sind gelesen, nicht gemessen; die Abnahmen H-/K-/G10- sind die Messung.

## Quellen (kurz, eigene Worte)

- Code 4.25.0 (`synq-snapshots/G-GES-analyse-2330.html`), Zeilen wie oben. Gerätewerte: `fragen-xander-9.md` Z. 11–17 (19.10.: Hörmuschel, −31/−32 dB),
  `n8/G9-probe-ergebnis.md` (Haptik nur bei echtem Label-Tipp).
- Profi-Abläufe, nur zum Vergleich in dieser Spec: Session-Aufnahme mit Szenenstart, Klick „nur Einzähler“, Region-Ränder und Inhalt schieben, Take-Ordner und
  Wisch-Comping, Flex-Marker mit Q-Bereich und Schneiden/Dehnen nach Abschnitt, Tonleiter-Einrasten in der Tonhöhen-Bearbeitung, Referenz-Spuren als Schatten. [W]
- iOS-Audio-Sitzung im Web: Typen `auto`, `playback`, `play-and-record` u. a. Die Ausgabe-Wahl (Lautsprecher/Hörmuschel) ist im Web nicht steuerbar, deshalb der Gerätetest H6. [W]/[S]
