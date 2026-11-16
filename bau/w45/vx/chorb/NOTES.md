# CHORB – Chor als Einzelstücke (KONZEPT D.1/D.2/D.4/D.5, Paket für 4.77)

`index.html` = 4.76.1 (`basis.html` = rel-4761) + Block `/* CHORB-BEGIN … CHORB-END */` (239 Zeilen, direkt nach `/* VA1-END */`)
+ 10 Ein-Zeilen-Haken mit Kennung `CHORB`. Diff gegen basis: +249 / −0. VERSION bleibt '4.76.1'. Nicht veröffentlicht.
Bau: `python3 bau.py` (Block-Quelle `chorb-block.js`, prüft jeden Anker auf genau 1 Treffer).

## Was es tut
- Export-Blatt, Abschnitt „Audio · WAV“ unter „Nur Chor“: Zeile **Chor als Einzelstücke** („nur die Stellen mit Ton · am Takt
  geschnitten · Takt im Dateinamen · ZIP“), darunter Umschalter **je Stimme | alle zusammen** (gemerkt in `uiPrefs().chbJe`) und
  Knopf **Gesang aus deiner DAW holen** (öffnet die Hilfe). Tipp = Rechnen mit Fortschritt/Abbrechen wie die anderen Exporte
  (`VA1.job`, `va1Prog`, `VV.cancel`), danach „Fertig … · Teilen“ (`deliver`, ZIP `Chor-Stuecke-<Song>.zip`).
- Chor-Blatt (v2): Knopf **Als Einzelstücke speichern** unter der Status-Zeile → Export-Blatt, an die Zeile gerollt.
- Import-Blatt (IMP1): Knopf **Gesang aus deiner DAW holen** → Hilfe. Guide: 2 Einträge (`chbstk`, `chbhelp`).
- Hilfe-Blatt „Gesang aus Cubasis holen“: die 6 Schritte aus KONZEPT D.4 (Anleitung, darum dort der App-Name) + [Audio/MIDI importieren] [OK].
- Rechnen: je Chor-Spur ein `va1Pass({tracks:{STIMME}, vox:'chor', lane:'cN'})` (Haken in `va1OnlyApply`: `G6.solo = 'cN'`, Lead stumm
  wie bei jedem Chor-Solo), „alle zusammen“ = ein Durchlauf wie „Nur Chor“. Stimmen nacheinander, Stücke sofort als Blob, `r = null`.
- `chbFind` (ohne DOM, Regeln D.2): RMS 50 ms > min(−50 dBFS, Spitze − 35 dB) = Ton; Anfang rückwärts bis unter −60 dBFS (5-ms-Blöcke,
  dann probengenau), abgerundet auf den Taktstrich (±3 Proben vor dem Strich zählen als auf dem Strich); Ende = 50 ms unter −60 dBFS
  (≤ 10 s Ausklang), aufgerundet; Stücke, die sich danach berühren/überlappen, werden eins (getrennt nur mit ganzem stillem Takt);
  Stücke < −45 dBFS fallen weg; Anlauf vor Takt 1 → Takt 1 + Satz im Begleittext.
- `chbWav24`: 24 Bit Stereo, TPDF-Dither (±1 LSB; digitale Stille bleibt 0), Blenden 2 ms / 10 ms linear beim Schreiben (keine Kopie).
- Namen `Chor-<Stimme>-Takt<NN>.wav` (Stimme = Spur-Name durch `va1Safe`, führendes „Chor-“ weg: „Chor Terz oben“ → `Chor-Terz-oben-Takt05.wav`;
  gleiche Namen + Spur-Kennung; alle zusammen `Chor-Alle-…`), NN = Stellen des letzten Song-Takts, mind. 2.
- `Chor-Stuecke.txt`: Tempo, Taktart, Abtastrate; je Stück Datei · Takt von–bis · Länge (Takte, s) · Sekunden ab Takt 1 · Teil (Marke,
  bei Szenen-Teil der Szenen-Name) · Stimme; Hinweise; 3 Sätze für die DAW-Anleitung.
- Test-API: `chbExport(je)`, `chorBlocks(opts)` → `[{datei, a, b, lane, name, peakDb, s0, s1}]`, `chbInfo()`, `chbFind(L, R, sr, grid)`, `chbOpen()`, `chbHelp()`.

## Haken (je 1 Zeile, Anker = Zeile davor)
`va1OnlyApply` (only.lane → Solo) · `va1Run` (chorblk → chbRun) · `va1Html` (Zeile) · `va1Tap` (Umschalter/Hilfe) · `g6pePaint` (Knopf)
· `g6peTap` (data-chb) · `ui1Entries` nach `kf2Guide` · `imp1Html` nach der Tempo-Zeile · `imp1Tap` (chbhelp) · nach `Object.assign(SYNQUENZER, va1Api())`.
`VA1_KIND.chorblk` wird im Block gesetzt (Fortschritts-Text „Chor als Einzelstücke wird berechnet · n %“).

## Test `chorb-test.mjs` (Chromium, 428×926 Touch + quer 926×428) – 35/35 OK, 166 s (Last ~8)
Projekt: 112 BPM, Song Strophe|Refrain|Strophe|Refrain (16 Takte), Gesang nur im Refrain (1,5 Takte ab der Eins), Stil „Pop modern“ = 3 Chor-Spuren.
- 6 WAV + Text (3 Stimmen × 2 Refrains), Namen `Chor-Unisono/-Terz-oben/-Oktave-unten-Takt05/-Takt13`, ZIP: CRC (eigene Rechnung) + Python `zipfile.testzip` ok.
- WAV 24 Bit / Stereo / Blockgröße 6 / RIFF-Länge / Rate = Durchlauf (44,1 kHz in Chromium).
- Start jedes Stücks = eigene Taktrechnung, Abweichung **0 Proben**; erste Probe über −60 dBFS liegt im Takt des Namens (Takt05/13);
  Länge ganze Takte (3), letzte 50 ms still.
- Summe der Stücke an ihren Takten gegen genau den Export-Durchlauf je Stimme: Rest außerhalb der Blenden −90…−94 dB, in den Blenden
  −93…−99 dB (< −60 gefordert); während des Durchlaufs Solo = genau diese Spur; die 3 Durchläufe klingen verschieden.
- „alle zusammen“: 1 Durchlauf (Solo −1) → `Chor-Alle-Takt05/13`. Kern-Fälle: Eins → Takt05, Atmer davor → Takt04, Anlauf → Takt 1 + pre,
  ohne/mit stillem Takt 1/2 Stücke, Hallrest −48 dBFS fällt weg, 2 Proben vor dem Strich = auf dem Strich.
- Abbrechen: keine Datei, nichts hängt. Regression „Nur Chor“ = 1 WAV. Bedienweg per Touch: Umschalter gemerkt, Tipp auf die Zeile →
  „Fertig: Chor als Einzelstücke (6 WAV) · 9,7 MB“, Hilfe 6 Schritte, Chor-Blatt-Knopf, Import-Knopf, Guide, quer. Live-Zustand danach
  unverändert, keine Seiten-/Konsolen-Fehler. Fotos `aus/*.png`, Ergebnis `aus/chorb-test.json`, Beispiel `aus/Chor-Stuecke.txt`.

## Pflicht (`pflicht.log`)
topdefs 26 Skripte, doppelt 0, Syntax 0 · dupkeys 0 · smoke `title SYNQUENZER errors []` (`smoke.png`) · „MS 2000“ 1× (= basis) ·
„^  live: true,“ 1× · VERSION '4.76.1' · Markenwörter (Liste claude … webgl, safari, nord, elektron, kompakt) = basis · **„Cubasis“ 3× (basis 0)**:
nur in der Anleitung (Titel des Hilfe-Blatts, Schritt 1, Satz „In Cubasis: …“ im Begleittext) – erlaubte Ausnahme „Export-Anleitung“;
alle Knöpfe/Guide sagen „deine DAW“ · keine Emojis/Bildzeichen in Block und Haken.

## Nicht gebaut (bewusst, für die Hauptsitzung)
- KONZEPT D.3 (Import): Schalter „Beginnt bei Takt 1“, Hinweis leeres Projekt + [Neues Projekt dafür], Gesang an den Songteilen teilen,
  Tempo aus MIDI. Gehört an IMP1/`imp1Geo`/`imp1Place` und war nicht Teil dieses Auftrags. Ohne „Gesang teilen“ setzt „Refrain groß“
  bei einem importierten Gesang über den ganzen Song den Chor überall – die Einzelstücke folgen dann eben diesen Stellen.
- Gegenprobe gegen die Notenzeiten (`voices[].n`) und Warnung im Text.
- Abtastraten-Wandlung je Stück: Stücke haben die Rate des Durchlaufs (Telefon meist 48 kHz). Die DAW wandelt beim Import; Taktlage
  bleibt, weil alles in Sekunden ab Takt 1 stimmt.
- Knopf im Background-Mischpult (`chsMixPaint`).
- Rendern nur der Chor-Bereiche (heute ganzer Song je Stimme, wie „Nur Chor“): 16 Takte × 3 Stimmen ≈ 29 s in Chromium.

## Nachbesserung 16.11. (Fakten-Prüfung N7–N11), nicht veröffentlicht
- N11 Begleittext `Chor-Stuecke.txt`: „In Cubasis:“ → „In deiner DAW:“ (App-Name nur noch in der Anleitung: Hilfe-Titel + Schritt 1, 2×).
- N9 Begleittext: Weg aus dem ZIP (in der Dateien-App antippen = entpacken, in der DAW importieren) und „andere Abtastrate → umwandeln (Ja)“.
- N7 Hilfe Schritt 3: zusätzlich „Include effect tail aus, Mono downmix aus“ + Tipp „andere Spuren stumm → nur die Gesangsdatei“.
- N8 Hilfe Schritt 5: „Neu ▾ › Leer (Init)“ statt „Neues Projekt“ (Beschriftung wie in 4.76.1).
- N10 Pflicht neu ohne grep-Fehler (`pflicht2.log`): Bildzeichen in neuen Zeilen nur „●“/„▾“ (wie in der Basis-Bedienung), keine Emojis.
- Test `chorb-test.mjs` prüft jetzt auch: Begleittext ohne App-Namen, mit ZIP-Weg und Abtastraten-Satz. Lauf 5: 35/35 OK (`aus/lauf5.out`).
- Prüfsummen siehe `pflicht2.log` (index.html f8a2de86…, chorb-block.js 727149ac…, chorb-test.mjs 490f2953…). Diff gegen basis +251/−0.
