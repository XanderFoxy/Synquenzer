# MTX3b – Prüfung (unabhängig, nichts repariert)

Geprüft: `mtx3b/index.html` (md5 bd3d03b9) gegen `mtx3b/basis.html` (4.68.0, md5 d51aae93). Alle Läufe nacheinander, Rechner-Last 0,2–1,4.
Prüfer-Sonden: `/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vx/mtx3b/pruef/`
(`a-remix.mjs` … `j-ver.mjs`, Fotos in `pruef/fotos/`, Lauf des Bauer-Tests in `pruef/bauer-test.log`).
Messgrößen: „Treffer je Pad“ = Song-Noten über `int54MidiClips` (dieselbe Quelle wie der MIDI-Export), „Doppel“ = gleiches Pad an derselben
Stelle auf zwei Spuren, Summe = Song-Render mit festem Zufall, Differenz in dB (Grenze −60 dB).

## Ergebnis in einem Satz
Der gemessene Hauptweg stimmt: Remix mit voll aufgeteilten Pads ist ohne Doppel, MIDI liegt auf Kanal 10, Auslagern/↶/↷ läuft während der
Wiedergabe lückenlos, Fills und Bedingungen bleiben gleich, und die Pflicht-Checks sind sauber. Daneben gibt es drei schwere Fehler:
- **„Nur diese Schritte“ und danach ein Remix** ergibt wieder doppelte Hi-Hats.
- **Zusammenführen nach einem Remix** löscht die Hi-Hats im Song.
- **Speichern/Laden** verliert Saat, Chance und Wirbel in den Versionen der Einzelspur.

## Befunde

### 1 [schwer] Teil-Auslagern („Nur diese Schritte“) und danach Remix oder GEN4: Hi-Hats doppelt
- **Ablauf:**
  1. Drum-Editor › Auslagern ▾ › Nur diese Schritte: 2 von 6 HH der Szene 1 → neue Spur HH ZU.
  2. DRUMS behält 4 HH in Szene 1 (`e-partial.mjs`).
- **Messung:**
  - GR2 Stil-Muster „italo“: hatC **80 statt 48**, **32 Doppel-Schläge** (DRUMS 48 + HH ZU 32).
  - GEN4 Szene: HH 12 statt 6 (DRUMS 6 + HH ZU 6).
- **Ursache:** `mtx3bPads` für DRUMS (index.html Z. 95367 f.) nimmt ein Pad nur weg, wenn es im DRUMS-Quell-Clip **nicht mehr** liegt
  (`!here.has(...)`). Beim Teil-Auslagern liegt es auf beiden Spuren, darum erzeugen beide das ganze Stil-HH.
- **Einordnung:** Genau dieser Zustand entsteht durch das neue L7-Blatt. Der Bauer-Test prüft den Remix erst, nachdem auch der Rest ausgelagert ist.

### 2 [schwer] Zusammenführen nach Remix löscht die Hi-Hats im Song
- **Ablauf:**
  1. Aufteilen (HH ZU + SNARE).
  2. GR2 Stil-Muster: hatC 48 (alles in Versionen von HH ZU), snare 6.
  3. „Einzelspuren zusammenführen“: hatC **0**, snare **2**. MIDI-Export und Song-Render folgen dem.
- **Gegenprobe Basis 4.68.0, gleicher Ablauf:** hatC 64 → 48. Dort verschwinden nur die Doppel.
- **Ursache:**
  - Der Remix legt jetzt Versionen (`song.own`, hier 3) auf den Einzelspuren an.
  - `mtx3Merge` führt nur die Clips zurück und entfernt die Song-Zeile der Einzelspur (Z. 95075). Damit verwaisen deren Versionen.
  - Die DRUMS-Versionen haben das Pad nicht (`mtx3bPads`).
- **Rückweg:** ↶ holt alles zurück. Einen Hinweis gibt es nicht.

### 3 [schwer] Speichern/Laden: Versionen der Einzelspur verlieren Saat, Chance, Wirbel und Akzent
- **Messung** (`j-ver.mjs`):
  - Nach dem Remix an den Versionen gesetzt: DRUMS 6× Chance + 4× Wirbel, HH ZU 8× Chance + 6× Wirbel.
  - Nach Speichern + Laden (`sx14Put`): DRUMS bleibt **6/4 mit Saat**, HH ZU hat **0/0 und keine Saat**.
  - Song vorher ↔ nachher: **−33,6 dB** (hörbar anders).
- **Ohne Chance/Wirbel** (`a-remix.mjs`): Die Rundreise ist nicht mehr byte-gleich, `seed` der HH-ZU-Version fehlt.
- **Container:** trägt dasselbe Projekt-JSON, also gleiche Folge erwartet (nicht einzeln gemessen).
- **Ursache:** L5 (`mtx3bNormTr`) behandelt nur `tr.clips`. Die Versionen einer Einzelspur werden weiter wie ein Synth-Clip normalisiert.
- **Einordnung:** Die Aussage „Rundreise byte-gleich“ im Bericht gilt nur für Clips.

### 4 [mittel] „→ HH ZU dazu“ in eine Einzelspur mit kürzerem Clip: Schläge verschwinden still
- **Ablauf** (`b-out.mjs` B2):
  - DRUMS Szene 1 auf 2 Takte, in Takt 2 drei neue HH (Beat 3 / 3¼ / 3½).
  - HH ZU hat dort noch einen 1-Takt-Clip.
  - Auslagern › Ganze Töne.
- **Messung:**
  - Der Toast meldet „3 Schläge → HH ZU“, aber alle 3 liegen bei t ≥ 4 **hinter dem Clip-Ende**.
  - Summe vorher ↔ nachher **−32,4 dB**: die Schläge fehlen.
- **Zweiter Fall:** Liegt die Stelle (modulo Clip-Länge) schon belegt, wird der Schlag ohne Hinweis verworfen. Er ist dann von DRUMS
  gelöscht und nicht übertragen; gemessen −31,1 dB.
- **Ursache:** Z. 95492 f.
- **Vergleich:** MTX3 gibt für „in vorhandene Spur“ einen Hinweis, dieser Weg nicht.

### 5 [mittel] Duplizierte Szene + Grundmuster (GR1) auf DRUMS: Hi-Hats doppelt
- **Ablauf:**
  1. Szene 1 duplizieren (die Saat bleibt gleich).
  2. HH aufteilen.
  3. Grundmuster (Stil 1) auf DRUMS Szene 1.
- **Messung:** DRUMS **16 HH** und HH ZU 6 HH in derselben Szene. Ohne Aufteilen sind es 16 auf DRUMS; erwartet waren 0 auf DRUMS.
- **Ursache:**
  - Der gr1Pattern-Haken (Z. 84743) gibt `before` (eine Kopie) als Quelle.
  - `mtx3bPartner` findet zwei Partner mit gleicher Saat und kann ohne Szene (`indexOf` = −1) nicht wählen. Ergebnis: kein Filter.
- **Gegenprobe:** GR2 Remix im selben Fall ist ohne Doppel (`i-dup.mjs`).

### 6 [mittel] Erst Remix, dann Hi-Hats auslagern: im Song spielen die HH weiter auf DRUMS
- **Messung:**
  - GR2 Stil 70 %, danach Auslagern › Ganze Töne HH. Der Toast meldet „10 Schläge → HH ZU“.
  - Im Song: HH **16× auf DRUMS, 0× auf HH ZU**. Die Remix-Versionen bleiben auf DRUMS, die neue Song-Zeile hat dort Stopp.
  - In der Matrix wirkt das Auslagern.
- **Hinweis im Blatt:** keiner.
- **Einordnung:** Das ist MTX3-Bestand („eigene Clips bleiben auf DRUMS“). Mit dem neuen Blatt „alle Szenen“ erwartet Xander es aber anders.

### 7 [mittel] Schritt-Editor der Einzelspur ignoriert die D1-Spurlänge: man kann Schläge setzen, die nie klingen
- **Messung:** HH-ZU-Clip mit D1-Länge 12.
  - Zelle 14 gesetzt: Render **identisch (−300 dB)**, nicht hörbar.
  - Zelle 4 gesetzt: +3,2 dB, hörbar.
  - Alle 16 Zellen sind gleich dargestellt, keine ist als außerhalb markiert.
- **Vergleich:** Der DRUMS-Editor nutzt die Länge (Z. 49726).
- **Einordnung:** „D1-Länge fehlt“ steht als offen im Bericht, diese Folge nicht.

### 8 [mittel] Tastatur-Aufnahme auf der Einzelspur: mehrere Tasten werden gestapelte Schläge
- **Messung:** Overdub auf HH ZU, zweimal 3 Tasten gleichzeitig.
  - Ergebnis: 6 neue Noten (GM 42).
  - **2 Schritte haben 4 gleiche Schläge** (3 aus dem Akkord + der vorhandene).
- **Ursache:** Jede der Tasten ist derselbe Schlag, ein Zusammenfassen je Schritt fehlt. Am Schritt wird es bis etwa +12 dB lauter.

### 9 [leicht] Auslagern-Blatt wählt KICK vor, wenn im Drum-Editor KICK gewählt ist (Standard)
- **Messung:** Drum-Editor frisch geöffnet (Pad KICK) › [Auslagern ▾]:
  - Vorgewählt sind [kick] und „Ganze Töne“.
  - Der Knopf zeigt „5 Schläge · 1 neue Spur“. Ein Tipp lagert die Kick aus.
- **Vergleich:** MTX3 lässt KICK auf DRUMS und schlägt HH zuerst vor (Xanders Beispiel).

### 10 [leicht] Quer 926×370, „Nur diese Schritte“ mit 16 HH: [Auf eigene Spur] liegt unter dem Rand
- **Messung:** Knopf-Oberkante bei 451 px, Bildhöhe 370 px. Das Blatt scrollt (352 von 506 px), Wischen ist nötig.
- **Dazu:** Das Blatt verdeckt die Schritt-Zeile des Drum-Editors.
- **Foto:** `pruef/fotos/c-auslagern-schritte-926x370.png`.
- **Erreichbarkeit:** per Touch erreichbar und ausführbar (neue Spur, quer auf Seite 2 umgeblättert).

### 11 [leicht] Neuer Knopf [Pad-Klang] ist 90×36 px ohne Trefferflächen-Erweiterung (< 44 px)
- **Messung:** hochkant und quer gleich.
- **Kein Befund für die übrigen Leistenknöpfe:** [SCHRITTE] hat `::after`. ↶ ↷ ⌨ sind 40×30 (quer) bzw. 40×36 (hochkant), genau wie in LAUF (Bestand).

## Ohne Befund gemessen
- **Remix mit voll aufgeteilten Pads:**
  - Stil-Muster: kick 12 · hatC 48 · hatO 8 · snare 6 · clap 6, gleich wie ohne Aufteilen, 0 Doppel. Basis: hatC 64 / hatO 12, 16 Doppel.
  - Stil 70 % auf Stil-Muster (zweimal) gleich wie ohne, 0 Doppel. Basis: clap 4 statt 2.
  - Bei duplizierter Szene gleich.
- **MIDI-Export nach Remix:** alle Drum-Noten auf Kanal 10, Anzahl je Note gleich wie ohne Aufteilen (36:12, 42:48, 46:8, 38:6, 39:6).
  Basis: 42:64, 46:12.
- **Auslagern → ↶ → ↷ während Matrix-Wiedergabe:** 4 Zyklen, 0 fehlende, 0 doppelte HH-Schritte. Spur 6 → 4 → 6 im Takt.
- **Fill „Snare-Lauf“ (ersetzt) + Auslagern HH/SNARE:** −122,6 dB. Bedingungen 1:2 / !fill an HH gehen mit, −125 dB.
- **Touch 428×926 und 926×370:**
  - Blatt, 16 Schritt-Knöpfe ≥ 44 px, Ausführen per Touch, Drum-Editor bleibt offen.
  - Nach 4 Neubauten genau ein [Auslagern ▾].
  - Toast-↶ bei offenem Drum-Editor zeigt die 6 HH-Zellen wieder.
- **Schritt-Editor der Einzelspur (2 Takte):**
  - Takt-Wahl.
  - Tipp in Takt 2 während der Wiedergabe ist im nächsten Durchlauf gehört (Log).
  - ↶/↷ in der Leiste während der Wiedergabe: Blatt bleibt offen, Takt 2 bleibt, Zelle folgt, Musik läuft.
- **Song-Ansicht nach Auslagern:** Zeilen „HH ZU“ / „SNARE“ mit Song-Zeile.
- **CPU:** 4 Einzelspuren sind nicht möglich (MAX_T 8 − 6 Grundspuren = höchstens 2). Mit 2 Einzelspuren:
  - Planer 7,4 ms je Takt gegen 6,1 ms zusammengeführt (+21 %, etwa +0,64 ms je Einzelspur, größter Einzelaufruf 0,7 ms).
  - Lauflicht-Haken 0,016 ms je Bild.
  - Hochgerechnet auf 4 Spuren etwa 8,7 ms je Takt.
- **Pflicht (selbst gelaufen):**
  - topdefs: 26 Skripte, 0 doppelt, 0 Syntaxfehler. dupkeys 0. smoke errors [].
  - „MS 2000“ 1×, „^  live: true,“ 1×, VERSION 4.68.0.
  - diff Basis → index nur Zusätze (0 `<`-Zeilen), `block.js` = Block.
- **Bauer-Test `mtx3b-test.mjs`** auf index.html neu gelaufen: **67/67 OK** in 66 s (`pruef/bauer-test.log`). Er deckt die Befunde 1–8 nicht ab.
