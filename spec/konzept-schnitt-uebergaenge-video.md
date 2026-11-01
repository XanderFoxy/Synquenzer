# Konzept: Übergänge, Videoschnitt-Ideen, Video zeigt die echte App (Vorschlag, 01.11.2026)

Grundlage: Xanders Nachricht vom 01.11. ~00:00 UTC samt Nachträgen ~00:05 und ~00:15 (fragen-xander-9.md). Dazu kommen drei
Ideen-Listen (Videoschnitt, Photoshop/After Effects/Procreate, Übergänge + Video), die gegen den Code geprüft wurden.

- **Regel 27:** Das hier ist ein Vorschlag. Xander entscheidet, was gebaut wird.
- **Regel 28:** Alles kommt nur dazu. Alte Projekte klingen gleich. Ein Projekt ohne die neuen Daten wird byte-gleich gespeichert.
- **Regel 3 (CLAUDE.md):** Was am Bildschirm anders aussieht oder sich anders bedient, wird vorher im Funk vorgeschlagen.
  Diese Pakete sind mit **[Funk]** markiert.
- **Bildschirm-Tastatur bleibt.** Kein neues Blatt deckt die Transponier-Tastatur dauerhaft zu.
- **Einrasten beim Ziehen ist sichtbar**, nicht nur fühlbar. Laut Geräte-Probe G9 gibt Safari beim Ziehen keine Haptik.
  Ein Tick kommt nur bei Tipp-Aktionen, dazu auf Wunsch ein leiser Klick-Ton.

Belege:
- G = `synq-snapshots/G-GES-analyse-2330.html` (4.25.0)
- V = `synq-snapshots/VIDSTAGE.html` (VV1–VV3 + VC2a, noch nicht in der Hauptlinie)

Die Zahlen hinter G und V sind Zeilennummern.

---

## 0. Kurzfassung für Xander

1. **Übergangs-Bibliothek:** Fill, Tom-Wirbel, Build-up oder Crash auf die Kante zwischen zwei Teilen ziehen. Es klingt mit dem Kit
   der Drum-Spur (z. B. Simmons-Toms), lässt sich nachbearbeiten und als eigener Übergang speichern.
2. **Breaks und Einwürfe:** einen Stopp vor dem Refrain oder Toms mitten im Refrain frei hinlegen, ohne einen Clip anzufassen.
3. **Video zeigt die echte App:** hochkant die ganze App mit Tastatur, dazu Piano-Roll und Drum-Sequenzer wie in der App. Das Video
   zeigt nur, was es in der App wirklich gibt.
4. **Auto-Regie 2:** Das Video erkennt Neues (neuer Clip, die Drums setzen ein, Transposition, Übergang) und zeigt genau das.
5. **Teile schneiden wie im Video:** eine Teil-Kante ziehen macht den Teil länger oder kürzer, der Rest rückt nach. Mit ✂ teilt man
   einen Teil am Taktstrich.
6. **Verknüpfer:** Das Arpeggio der Strophe läuft als Lauf in den ersten Akkord des Refrains und passt sich Tonart und Akkord an.

---

## 1. Paket UE „Übergänge“ (Fill-Bibliothek)

### 1.1 Idee

Übergänge liegen wie Video-Übergänge auf der Schnittkante zwischen zwei Teilen. Sie stehen nicht in einem Clip.
- Sie speichern nur **Noten**, keinen Klang. Darum klingen sie immer mit dem aktuellen Kit der Spur. Wechselt man das Kit, klingt
  der Übergang sofort mit dem neuen Kit.
- Erst wenn man selbst etwas einstellt, gilt ein eigener Klang.
- Breaks (Stopps) und Einwürfe („Adlibs“) liegen in derselben Bibliothek. Einwürfe dürfen überall liegen, nicht nur an einer Kante.
- Wie bei den Yamaha-Styles (Fill AA/AB/BA/BB) richtet sich der Fill nach der Richtung: **aufbauend** von leicht nach voll,
  **abbauend** von voll nach leicht, **gleich** zwischen zwei gleich vollen Teilen.

### 1.2 Was es schon gibt (wird benutzt, nicht neu erfunden)

| Baustein | Stelle |
|---|---|
| Drum-Schritte mit Ratsche (r ≤ 4), Wahrscheinlichkeit, Versatz, Akzent, Locks tune/dec | G 12345 `expandStep`, 12392 |
| Stummschalt-Fenster auf den Schlag genau (wird zu „ersetzt“) | G 20252 `mutedAt` |
| Kit gehört der Spur; Drum-Spur 4; 12 Instrumente inkl. 3 Toms und Becken; „Gated 84“ mit Simmons-Toms | G 17302, 17144, 15965, 16020 |
| `drumHit` spielt mit fremden Kit-Parametern `o.P` (eigenes Kit je Übergang möglich) | G 19046–19052 |
| Musterschrift mit 16 Zeichen (nur 4 Grooves, keine Fills) | G 32858 `DRUM_PATTERNS`, 32864 |
| Zieh-Maschine mit Geist, Einrasten am Taktstrich, Zurückfliegen | G 25222 `drgStart`, 25287, 25355 |
| Teilgrenzen aus `song.marks` | G 17558 |
| Clips je Teil an/aus (für die Richtung leicht/voll) | G 45383 `s0SegSet`, `m.off` |
| Eigene Clips je Takt (für Konsolidieren) | G 23283 `ownEnsure`, 23367 |
| Akkord- und Tonart-Erkennung (für den Verknüpfer) | G 10958 `detectChord`, 26383 `songKeyAtBar` |
| Song-Haken für Zusatzdaten (Vorlage) | V 23385/23396/23478 (`song.video` in `songShift`/`songClear`/tidy) |
| Nutzer-Bibliothek für Klänge (Vorlage für „Eigene“) | G 14012 `SQStore` |
| Riser-Synthklänge „White Riser“, „Downlifter“, „Crash Noise“ (Synth, nicht Kit) | G 6848, 14405 |

Es fehlen: Daten für Übergänge, Kanten als Ablageziel, die Bibliothek, Fill-Inhalte, Stopps auf den Schlag genau, Einwürfe und
Riser aus dem Kit.

### 1.3 Bedienung Schritt für Schritt (iPhone, Song-Ansicht)

**A. Übergang auf eine Kante legen**
1. In der Song-Leiste auf **[Übergänge]** tippen. Unten öffnet sich eine Leiste mit den Reitern [Übergänge] [Breaks] [Einwürfe]
   [Verknüpfer] [Eigene]. Sie liegt über dem Song-Bereich, die Tastatur bleibt sichtbar.
2. Jede Kachel zeigt ein Mini-Schrittbild und die Länge (¼ · ½ · 1 · 2 · 4 Takte).
3. **Tipp auf eine Kachel:** Sie wird einmal mit dem aktuellen Kit vorgehört.
4. **Kachel halten und ziehen:** Ein Geist folgt dem Finger. Liegt eine Teilgrenze im Umkreis von ±½ Takt, rastet die Kachel
   sichtbar ein: Die Kante leuchtet amber, die betroffenen Schläge sind schraffiert.
5. **Loslassen auf der Kante:** Der Übergang liegt als Chip (◆ + Kurzname) an der Kante in der Drum-Zeile. Ist die Kante schon
   belegt, wird der alte Übergang ersetzt (1 Undo).
6. **Loslassen woanders:** Abbruch, die Kachel fliegt zurück.
7. Danach fragt ein Toast: „Auch an den 2 anderen Kanten Strophe → Refrain? [Überall] [Nur hier]“. Standard ist „nur hier“.
   Kopien bleiben verknüpft, eine Änderung gilt für alle. Mit [Nur hier ändern] löst man eine Kopie. Das ist dasselbe Muster wie
   `markApplyAll` (G 23654).

**B. Verschieben, löschen, Länge ändern**
- Chip halten und auf eine andere Kante ziehen = verschieben.
- Chip aus dem Song ziehen = löschen, mit Toast „Rückgängig“.
- Länge: im Blatt (siehe C) oder am Griff links am Chip ziehen. Der Griff rastet auf ¼ · ½ · 1 · 2 Takte vor der Kante, sichtbar
  mit Längen-Anzeige.

**C. Nachbearbeiten (Tipp auf den Chip öffnet ein Blatt)**
- Länge · Dichte (leicht/mittel/voll) · Richtung (Auto/aufbauend/abbauend) · Modus **ersetzt** (der Groove schweigt in diesem
  Bereich) oder **dazu** · [Crash am Ende] an/aus.
- **[Noten]** öffnet das gewohnte Drum-Schrittraster mit genau den Übergangsnoten, eine Seite je Takt (G 33301). Änderungen hört
  man beim nächsten Durchlauf, ohne Stopp.
- Klang: „Kit der Spur: <Name>“ (Standard) oder [Eigenes Kit …].
- [Als eigenen sichern …] mit Namen · [Entfernen].

**D. Break (Stopp)**
- Die Break-Kachel auf eine Kante oder in einen Teil ziehen.
- Im Blatt wählt man, welche Spuren schweigen. Standard: alle außer Gesang. Dazu der Schalter [Kick bleibt].
- Hall und Echo klingen natürlich aus.

**E. Einwurf („Adlib“)**
- Eine Einwurf-Kachel frei in einen Teil ziehen, zum Beispiel Toms mitten im Refrain. Sie rastet auf 1/16 ein.
- Halten und ziehen = verschieben. Ein Einwurf ist kein Übergang und hängt an keiner Kante.

**F. Verknüpfer (Teilpaket UE-G)**
- Die Kachel „Lauf aufwärts“ auf die Kante Strophe | Refrain ziehen.
- Die Engine nimmt die Töne des Arpeggios bzw. der Sequenz am Ende der Strophe und baut daraus einen Lauf oder ein Glissando.
  Der Lauf endet auf der Eins in einem Ton des ersten Refrain-Akkords (`detectChord` + `songKeyAtBar`).
- Er liegt auf der Spur, deren Clip davor lief, und klingt mit deren Klang.
- Anpassen geht in der Piano-Roll oder, sobald es Magic Scale gibt, durch Malen mit dem Wisch-Raster.
- Weiche Regler-Übergänge zwischen den Teilen baut dieses Paket **nicht**. Laut Xander gibt es sie schon; das gehört zum
  Super-Regler bzw. V6a.

**G. Konsolidieren (Teilpaket UE-H)**
- Im Marken-Blatt [Übergänge einbacken]: Die Übergänge des Teils werden zu eigenen Clips im Teil (`ownEnsure`). Damit lassen sie
  sich als neuer Teil sichern (S2, G 45676).
- Der Ursprung bleibt gespeichert. [Zurückholen] macht wieder Sticker daraus. Wie ein AE-Container: Es wird nichts eingefroren.

### 1.4 Start-Übergänge (Werks-Bibliothek)

| Reiter | Name | Länge | Inhalt (aus vorhandenen Schritt-Daten, keine neue DSP) |
|---|---|---|---|
| Übergänge | Fill kurz | ½ | Snare + Toms in 16teln, letzte 2 Schläge |
| Übergänge | Fill lang | 1 | Snare-Ghosts → Toms, Akzent auf der 4+ |
| Übergänge | Tom-Wirbel | ½ / 1 | TOM HOCH → MITTE → TIEF, 16tel, mit Simmons-Kit im Flippers-Stil |
| Übergänge | Snare-Wirbel | ½ | Ratsche 2–4, Anschlag steigt |
| Übergänge | Build-up | 2 / 4 | Snare 4tel → 8tel → 16tel → Ratsche 4, Tune +0 → +7 st |
| Übergänge | Fill + Crash | 1 | „Fill lang“ + Becken auf der Eins des neuen Teils |
| Übergänge | Crash auf die Eins | – | Becken + Kick auf der Eins |
| Übergänge | Hi-Hat öffnen | ¼ | offene Hi-Hat auf der 4+ |
| Übergänge | Kick-Auftakt | ¼ | Kick 16tel-Doppel vor der Eins |
| Übergänge | Halbzeit-Fill | 1 | Kick/Snare im Halbtempo, Toms am Ende |
| Übergänge | Clap-Treppe | ½ | Clap 8tel → 16tel |
| Übergänge | Rim-Ping | ½ | Rim + Tom hoch im Wechsel |
| Breaks | Stopp 1 Schlag | ¼ | alle außer Gesang schweigen |
| Breaks | Stopp ½ Takt | ½ | dito |
| Breaks | Stopp 1 Takt | 1 | dito, [Kick bleibt] wählbar |
| Breaks | Breakdown | 2 | nur die Drums schweigen |
| Einwürfe | Tom-Doppel | ¼ | Tom mitte + tief |
| Einwürfe | Becken | – | Becken einzeln |
| Einwürfe | Wirbel kurz | ¼ | Snare Ratsche 4 |
| Einwürfe | Clap-Einwurf | ⅛ | Clap mit Akzent |
| Riser (UE-F) | Rise up | 1 / 2 / 4 | Rauschen aus BECKEN des Kits, Filter steigt, endet auf der Eins |
| Riser (UE-F) | Rise down | 1 / 2 | umgekehrt, beginnt auf der Eins |
| Riser (UE-F) | Reverse-Becken | ½ / 1 | Becken rückwärts, saugt in die Eins |
| Verknüpfer (UE-G) | Lauf aufwärts | ½ / 1 | Arp-Töne der Strophe → Akkordton des Refrains |
| Verknüpfer (UE-G) | Lauf abwärts | ½ / 1 | dito, abwärts |
| Verknüpfer (UE-G) | Glissando | ¼ / ½ | Tonleiter-Glissando in den Grundton |
| Verknüpfer (UE-G) | Terzen-Lauf | 1 | Terzen der Tonart aufwärts |

Jeder Fill hat drei Dichten (leicht/mittel/voll). Die Richtung wählt die App automatisch: Sie zählt die aktiven Clips vor und nach
der Kante (`m.off` aus S0). Im Blatt lässt sich die Richtung übersteuern.

### 1.5 Datenmodell (nur ergänzt, Format 5 bleibt)

Das Feld heißt `song.ue`. Der Name `song.tr` (aus der Ideen-Liste) wäre leicht mit `tr` = Spur zu verwechseln, das im Code überall
vorkommt.

```
song.ue = [{
  id,                 // 'U1' …
  m,                  // Marken-ID des FOLGENDEN Teils (Kanten-Übergang); fehlt bei Einwürfen
  at,                 // nur Einwurf: Song-Schlag (Beats)
  a, len,             // Start relativ zur Kante bzw. zu at und Länge, beides in SCHLÄGEN (z. B. a = −2, len = 2)
  k,                  // 'fill'|'tom'|'build'|'crash'|'break'|'adlib'|'riser'|'down'|'rev'|'lauf'
  t,                  // Spur (Standard: Drum-Spur 4; Verknüpfer: Spur des Clips davor)
  notes,              // gleiche Form wie Drum-Clip-Noten {t,d,n,v,a?,r?,lk?} bzw. Synth-Noten
  mode,               // 'ersetzt' | 'dazu'
  stop,               // nur Break: [Spur-Indizes]
  dens, dir,          // Dichte 0–2, Richtung 'auto'|'auf'|'ab'
  g,                  // Verknüpfungs-Gruppe (Kopien „überall“)
  src,                // Bibliotheks-ID (Werk oder Eigene)
  kit,                // optional eigenes Kit (sonst Kit der Spur)
  baked               // optional: eingebacken (Ursprung für [Zurückholen])
}]
```

- **Anker:** Ein Kanten-Übergang hängt an der Marke des folgenden Teils (`m`). Verschiebt man den Teil (V2e′), wandert er mit.
  Wird der Teil gelöscht, verschwindet der Übergang mit, und 1 Undo bringt beides zurück. Einwürfe hängen am Song-Schlag und
  rücken über `songShift` mit.
- **Schläge statt 16tel:** So bleibt `song.ue` für T1 (Taktarten) gültig. Der Takt kommt immer aus den Marken.
- **Haken:** `songShift`, `songClear`, `songCut`, write und tidy wie bei `song.video` (V 23385/23396/23478/23711). Dazu Undo,
  Speichern/Laden, Video (offline).
- **Abspielen:** Der Scheduler mischt beim Planen die UE-Noten in die Ziel-Spur. „Ersetzt“ nutzt ein Fenster wie `mutedAt`.
  Gespielt wird über `drumHit` mit dem Kit der Spur oder mit `o.P`, wenn ein eigenes Kit gewählt ist. Ohne `song.ue` läuft kein
  zusätzlicher Code.
- **Eigene Übergänge:** in `SQStore` (neue Art „ue“) und als Kopie in der Projektdatei. Eine Datei öffnet damit auch auf einem
  fremden Gerät vollständig.
- **Riser (UE-F):** Die Drum-Engine bekommt 2 neue Lock-Werte: Attack bis 8 s und einen Filter-Sweep f0 → f1. Die Standardwerte
  entsprechen dem heutigen Verhalten (Attack heute ≤ 0,05 s, Sweep ≤ 0,5 s, G 16785). Alte Kits klingen also gleich (Regel 28).
- **North:** Gespeichert sind nur Noten. Wenn die Drum-Engine „North“ gemergt ist, spielen Übergänge auch mit North-Kits.

### 1.6 Teilpakete und Aufwand

| Teil | Inhalt | Aufwand |
|---|---|---|
| UE-A | Kern: Daten, Haken, Abspielen, Undo, Video offline | 12 h |
| UE-B | Bibliothek-Leiste, Vorhören, Ziehen auf die Kante, Chip, Verknüpfen „überall“ | 10 h |
| UE-C | 12 Werks-Übergänge in 3 Dichten + Richtung leicht/voll, Abhören in allen 7 Kits | 8 h |
| UE-D | Breaks + Einwürfe | 6 h |
| UE-E | Blatt Nachbearbeiten, [Noten] im Raster, Eigene sichern | 9 h |
| UE-F | Riser, Downlifter, Reverse-Becken aus dem Kit (2 Lock-Werte) | 10 h |
| UE-G | Verknüpfer (Lauf/Glissando in den Ziel-Akkord), Malen erst mit Magic Scale | 12–16 h |
| UE-H | Konsolidieren / Zurückholen | 4–6 h |

**Summe:** A–E ≈ 45 h (Version 4.27.0), F–H ≈ 26–32 h danach. A und B laufen parallel zu C und D (Regel 29).

### 1.7 Abnahme (messbar)

- **UE-01** Fill an Kante 8|9 (½ Takt, ersetzt): Im Noten-Log der Drum-Spur stehen in den Song-Schlägen 30–32 nur Fill-Treffer.
  Außerhalb davon ist der Unterschied 0.
- **UE-02** Kit-Wechsel 808 → Gated 84: Die Treffer-Parameter sind `slotParams` des neuen Kits. Der Hash der UE-Daten bleibt gleich.
- **UE-03** 2 Takte vor der Kante einfügen verschiebt die Kante von 8|9 auf 10|11, der Übergang geht mit.
  - Den folgenden Teil ziehen: Der Übergang wandert mit.
  - Den Teil löschen: Der Übergang ist weg, 1 Undo stellt beides bit-gleich her.
- **UE-04** Undo/Redo und Speichern/Laden geben bit-gleich zurück. Ein Projekt ohne Übergänge ergibt eine byte-gleiche Datei.
- **UE-05** Noten im Video (offline) = Noten live: gleiche Anzahl, ±1 ms.
- **UE-06** Scheduler-Zeit (perfProbe) ohne Übergänge bleibt gleich (±5 %), mit 8 Übergängen höchstens +10 %.
- **UE-07** Kacheln und Chips messen mindestens 44×44 pt.
  - Bei 428×926 und 926×428 ist nichts abgeschnitten, nichts rollt, und die Tastatur bleibt sichtbar.
- **UE-08** Vorhören startet höchstens 50 ms nach dem Tipp.
- **UE-09** Einrasten ist im selben Bild sichtbar (amber Kante + Schraffur), der Fangbereich ist ±½ Takt.
  - Ablegen daneben: Die Kachel fliegt zurück, 0 Änderungen im Song.
- **UE-10** Ablegen auf einer belegten Kante = ersetzen, genau 1 Undo-Schritt.
- **UE-11** Chip aus dem Song ziehen = löschen + Toast „Rückgängig“. Rückgängig stellt bit-gleich her.
- **UE-12** Alle 12 Werks-Übergänge, gerendert in allen 7 Kits:
  - Spitze ≤ −1 dBFS
  - Lautheit ±3 LU zum Groove davor
  - kein Treffer außerhalb der gewählten Länge
- **UE-13** Build-up: Treffer je Schlag und Tune steigen monoton.
- **UE-14** Richtung: In einem Testsong (S0) wählt eine Kante mit 2 → 5 aktiven Clips „aufbauend“ und eine mit 5 → 2 „abbauend“.
  Der Chip zeigt die Richtung.
- **UE-15** Break 1 Takt:
  - Die gewählten Spuren haben 0 Noten.
  - Hall und Echo klingen aus.
  - Kein Klick über −40 dBFS an Anfang und Ende.
- **UE-16** Einwurf:
  - auf 1/16 genau (±1 ms bei 120 BPM)
  - wandert mit, wenn man davor Takte einfügt
- **UE-17** Eine Änderung im [Noten]-Raster wirkt beim nächsten Durchlauf ohne Stopp. Ohne eigenes Kit zeigt das Blatt
  „Kit der Spur: <Name>“.
- **UE-18** Ein eigener Übergang steht nach Neuladen in „Eigene“, auch in einem anderen Projekt. Die Projektdatei öffnet in einem
  frischen Browser mit dem Übergang.
- **UE-19** [Überall] legt n Kopien an, eine Änderung ändert alle n. [Nur hier ändern] löst eine Kopie. Jede Aktion = 1 Undo.
- **UE-20** Riser über 2 Takte:
  - Der Klangschwerpunkt steigt monoton von unter 1 kHz auf über 5 kHz, der Pegel steigt monoton.
  - Ende auf der Eins ±5 ms.
  - Das Reverse-Becken ist nach der Eins in 20 ms unter −60 dB.
  - Der Downlifter läuft umgekehrt.
  - Ein Kit-Wechsel ändert die Farbe.
  - Höchstens 1 zusätzliche Stimme.
  - Kits ohne Riser klingen bit-gleich wie vorher.
- **UE-21** Verknüpfer:
  - Der letzte Ton ist ein Ton des Ziel-Akkords (`detectChord`) und liegt auf der Eins ±5 ms.
  - Kein Ton liegt außerhalb der Tonart (`songKeyAtBar`).
  - Nach Transposition des Teils (`song.xp`) folgt der Lauf.
- **UE-22** Konsolidieren:
  - Der Render des Teils ist vorher und nachher bit-gleich.
  - [Zurückholen] gibt die Sticker bit-gleich zurück.
- **UE-23** (sobald North gemergt ist) Derselbe Übergang spielt mit einem North-Kit. Das Noten-Log ist gleich.

---

## 2. Paket VV4 „Video zeigt die echte App“

**Voraussetzung:** VIDSTAGE (VV1–VV3) ist in der Hauptlinie, und V-A (Video ohne Ton) ist behoben. Beides gehört zu 4.26.0.

**Name:** Im Entwurf zu Nachtrag 5 heißt „VV4“ noch „Aufbau-Video wie Procreate“ (`roadmap-nachtrag-5-entwurf.md` Z. 37).
Vorschlag: Das Aufbau-Video wird **VV5**, damit es den Namen nicht zweimal gibt.

### 2.1 Regel „nichts Erfundenes“ (gilt für jedes Video-Bild)

1. Im Video erscheint nur ein Element, das es in der App in dieser Form gibt: Regler, Zelle, Taste, Raster, Leiste, Mod-Ring.
2. Ein Element bewegt sich nur durch echte Daten:
   - Noten
   - Transposition
   - `sound.mods` mit amt ≠ 0
   - Filter-HK-Intensität ≠ 0
   - MS-2000-Patch
   - Mod-Sequenz
   - Clip-Kurven
   - gemessener Pegel
3. Werte kommen aus derselben Rechnung wie der Klang. Es gibt keine Deko-Bewegung, kein Oszilloskop, keine Filterkurve und keinen
   PEGEL-Regler, der die Amp-Hüllkurve nachläuft. Das sind die Fehler, die Xander gesehen hat (V 44093ff, V 44097:
   `PEGEL … vs.amp`).
4. Eine **Sonde** listet jedes gezeichnete Element mit seinem App-Gegenstück. Ein Element ohne Gegenstück lässt den Test scheitern.

### 2.2 Teile

**VV4-E Echte Modulationen (behebt V-B), zuerst**
- Wahl über [Spur …] → [Modulation], oder automatisch, aber nur wenn die Spur eine echte Modulation hat.
- Gezeigt werden die echten App-Regler mit Mod-Ring (`.kmr`, G 1042) und die K1-Mod-Übersicht (G 1160).
- VV3 rechnet LFO und Hüllkurve schon exakt nach (V ab 43667). Das bleibt. Weg kommen die Panels, die die App nicht hat.
- Aufwand 7 h.

**VV4-A „Ganze App hochkant“ (9:16)**
- Im Video-Blatt gibt es bei 9:16 neben [Kamera] und [Ganz mit Balken] die neue Wahl **[Ganze App]**.
- Das Bild zeigt Kopf, Matrix oder Song, Teil-Leiste, Träger-Zeile, Modusleiste und Tastatur (`#carrier`, `#partBar`, `#modebar`,
  `#kb`).
- Die Tastatur zeigt die Tonart-Stufen hell und die echten Transpositionen aus `song.carrier`/`song.xp` als gedrückt.
- Maße aus dem P-Raster der App: Der Bildbereich ist 428×761 pt und ergibt 1080×1920 ohne Balken.
- Heute ist 9:16 nur ein Kamera-Fenster über einer quer gezeichneten 640×360-Ansicht (V 43286 `VV_AR = 360`, 43533).
- Das ändert nur das Video, nicht die App. Ein Funk-Vorschlag ist nicht nötig.
- Aufwand 16 h.

**VV4-B Bild-Menü je Taktbereich**
- Die vorhandene Zeile „Video“ (Marken-Blatt, ⋯ der Bereich-Leiste, V 43371 `vvDirRow`) wird erweitert:
  - [Auto] [App] [Song] [Matrix] [Spur …] [Tastatur] [Fokus …]
  - „Spur …“ öffnet [Piano-Roll] [Drum-Sequenzer] [Modulation].
  - „Fokus …“ öffnet die Liste: Clip-Zelle, Tastatur, Teil-Kopf, Übergang.
- Der Streifen im Song zeigt die Wahl in Farbe.
- Heute kennt `VV_DIRV` nur auto, song, matrix und spur (V 43286). Neue Werte kommen nur dazu, alte Einträge bleiben.
- Aufwand 6 h.

**VV4-C Piano-Roll-Bild und Drum-Sequenzer-Bild wie in der App**
- Piano-Roll: die echten Noten des laufenden Clips im Look des Roll-Editors, mit Laufstrich. Klingende Noten sind umrandet.
- Drum-Sequenzer:
  - Gezeigt wird das Schritt-Raster der App (G 33301), nicht 12 Pads (heute V 44151 `vv3DrawDrums`).
  - Das gezeigte Instrument wechselt zwischen Kick und Snare, nur bei einem Treffer und höchstens einmal je Schlag.
  - Darunter läuft die Hi-Hat-Zeile mit.
- `vvDrawSpur` (V 43488) zeichnet schon Noten wie eine Roll, ist aber seit VV3 abgehängt. Er wird wieder benutzt und an den Look
  der App angepasst.
- Aufwand 12 h.

**VV4-D Auto-Regie 2: „erkennt Neues“**

`vvCuts` (V 43419) kennt heute: Teilanfang → Song, mindestens 2 Clipwechsel → Matrix, Spur setzt ein → Spur-Bild. Dazu kommen
2 Takte Minimum, 8 Takte Maximum und ein Hash.

Neue Regeln:
- Clip spielt zum ersten Mal: kurzer Fokus auf seine Zelle, dann Piano-Roll mit seinen Noten (mindestens 2 Takte). Der zweite
  Auftritt desselben Clips bekommt keinen Fokus.
- Die Drums setzen ein oder der Drum-Clip ist neu: Drum-Sequenzer.
- Transposition: Tastatur, 1–2 Takte.
- Teilanfang: ganze App.
- Übergang (`song.ue`) an der Kante: Drum-Sequenzer über die Länge des Übergangs.

Aufwand 8 h.

**VV4-F „Mäusekino“: Pegel erst in der App, dann im Video [Funk]**
- App: schmale Pegelbalken je Spur in der Spurnamen-Spalte (Matrix und Song) plus Master.
  - Spitzenhalten 1,5 s und rote Übersteuerungs-LED.
  - Tipp auf den Master-Balken öffnet die MASTER-Seite.
- Technik:
  - Ein Meter-Worklet für alle Spuren schickt 30 Hz Spitze/RMS. Kein FFT im Hauptthread.
  - Ist die Anzeige verdeckt oder der CPU-Begrenzer auf Stufe ≥ 2, ist sie aus.
  - Fürs Video läuft dasselbe Worklet im Offline-Render.
- Heute gibt es nur den Master-Analyser (G 15601), die GR-Anzeige und die Spitzen-LED auf MASTER (G 31622). `g4MixMeasure`
  (G 43648) misst nur kurz für [Auto].
- Aufwand 12 h (App 8 h, Video 4 h).

**Summe VV4:** 61 h.

### 2.3 Abnahme

- **VV4-00** (Voraussetzung, 4.26.0) Jedes Video hat eine Tonspur. Lautheit live und offline ±0,1 LU.
- **VV4-01** Klang ohne Modulation: 0 bewegte Pixel in allen Reglern über 8 Takte.
- **VV4-02** LFO → Cutoff 50 %: Der Mod-Ring folgt der LFO-Phase ±2°.
- **VV4-03** Die Sonde meldet 0 Bild-Elemente ohne App-Gegenstück. Kein Oszilloskop, keine Filterkurve, kein PEGEL-Folger.
- **VV4-04** [Ganze App]:
  - Alle 6 Bereiche sind im Bild (Pixel-Probe je Bereich nicht leer).
  - Lage je Bereich ±2 pt zu `getBoundingClientRect` der App bei 428×926.
- **VV4-05** Tastatur: An 20 Zeitpunkten sind genau die Tasten hell bzw. gedrückt, die die App beim selben Songschlag zeigt (20/20).
- **VV4-06** Ein 3-min-Song in 9:16 [Ganze App] rendert mindestens 1,5× schneller als Echtzeit (heute 2,39× mit Spur-Bild).
- **VV4-07** Bild-Menü:
  - Jede Wahl landet als `{a,b,v,t?}` mit 1 Undo.
  - Alte Projekte laden unverändert.
  - Takte einfügen oder löschen verschiebt die Einträge.
  - Das Video zeigt im Takt genau das gewählte Bild (Bild-Erkennung wie VV2-01).
- **VV4-08** Piano-Roll-Bild: Noten = `clip.notes` (Anzahl und Lage ±1 px) an 10 Zeitpunkten. Klingende Noten sind umrandet.
- **VV4-09** Drum-Bild:
  - Der leuchtende Schritt = Schritt im Noten-Log, 100 % über 4 Takte bei 120 BPM.
  - Kick/Snare wechseln nur bei einem Treffer, höchstens 1× je Schlag.
  - Die Hi-Hat-Zeile leuchtet bei jedem Treffer ±1 Bild.
- **VV4-10** Auto-Regie 2, Testsong:
  - Clip A ab Takt 9 ergibt einen Schnitt bei Takt 9 mit Grund „neu-clip“. In Takt 25 gibt es keinen Fokus.
  - Drums ab Takt 5 → Drum-Bild in Takt 5–6.
  - Transposition in Takt 13 → Tastatur.
  - Übergang an 16|17 → Drum-Bild über die Übergangslänge.
  - VV2-02 bleibt grün. Gleicher Song ergibt gleichen Hash.
- **VV4-11** Mäusekino App:
  - Sinus −6 dBFS auf Spur 1 zeigt −6 ±0,5 dB.
  - LED an über −0,3 dBFS.
  - Spitzenhalten 1,5 ±0,1 s.
  - Hauptthread ≤ 0,3 ms je Bild am iPhone (perfProbe), 0 ms bei verdeckter Anzeige oder Begrenzer-Stufe ≥ 2.
- **VV4-12** Mäusekino Video: Balken = Offline-RMS je Bild ±1 dB.
- **VV4-13** Video-Blatt bei 428×926 und 926×428: alle Knöpfe ≥ 44 pt, nichts abgeschnitten, die Bedienung rollt nicht.

---

## 3. Weitere Schnitt- und Ebenen-Ideen als Pakete (streng bewertet)

**Maßstab:** Ein Paket kommt nur in die Liste, wenn es den Workflow auf dem iPhone wirklich einfacher macht. Die Tastatur bleibt.
Alter Klang bleibt (Regel 28). Sortiert nach Nutzen ÷ Aufwand. Alle Pakete sind Vorschläge (Regel 27).

| Rang | Paket | Nutzen | Aufwand | Funk nötig |
|---|---|---|---|---|
| 1 | SX1 Song-Ende ausblenden | 5 | 3–4 h | nein (Zeile im Blatt) |
| 2 | SX2 Klinge ✂ (Teil am Taktstrich teilen) | 3 | 3–5 h | klein |
| 3 | SX3 Teil-Kante ziehen (Ripple-Trim) | 4 | 6–9 h | ja |
| 4 | SX4 Spurkopf: Solo + Lautstärke (+ Pegel aus VV4-F) | 4 | 6–10 h | ja |
| 5 | SX5 Synth-Ausklang über die Kante (nur wenn nötig) | 4 | 1 h prüfen + 4–6 h | nein |
| 6 | SX6 Form-Vorlage für neue Songs | 3 | 4–6 h | nein |
| 7 | SX7 Scrubbing (beim Wischen mithören) | 4 | 7–10 h | ja (Schalter 🔊) |
| 8 | SX8 Pinch-Zoom und Übersicht im Song | 4 | 8–12 h | ja |
| 9 | SX9 Versionen eines Clips (v1 · v2) | 4 | 8–10 h | klein |
| 10 | SX10 Block/Container (Teile zusammenfassen, hineingehen) | 4 | 8–12 h | ja |
| 11 | SX11 Teil-Varianten „leicht/voll“ | 4 | 10–14 h | ja |
| 12 | SX12 Clip-Kurven (Keyframes im Clip) | 5 | 20–30 h (≈ 12 h davon ohnehin in Innovation 2+3) | ja |
| 13 | SX13 Noten formen: dehnen ×½/×2, Anker | 3 | 5–8 h | klein |
| 14 | SX14 Verlauf-Liste und Schnappschüsse | 4 | 10–14 h | ja |
| 15 | SX15 Farbe für alle Marken + Merk-Pins | 3 | 5–7 h | ja |

### SX1 Song-Ende ausblenden
- **Bedienung:** Im Marken-Blatt des letzten Teils oder im Video-Blatt gibt es die Zeile „Ausblenden am Ende: [aus] [2] [4]
  [8 Takte]“. Bei einer Video-Auswahl gilt es für das Ende der Auswahl. Das ist für die 30-s- und 60-s-Fassungen, die Xander
  „eigens geschnitten“ haben will.
- **Nutzen 5:** Jedes Social-Video und jeder Export braucht ein sauberes Ende. Heute gibt es nur den Ausklang von Hall und Echo.
- **Aufwand:** 3–4 h. Additiv `song.fade = {out: Schläge}`, eine Rampe am Master. Live, Export und Video nutzen dieselbe Rampe.
- **Schon da:** Ausklang bis < −60 dBFS (VV1-02, Z3). Ein Ausblenden gibt es nicht (keine Treffer in G und V).
- **Abnahme:** Der Pegel fällt monoton und liegt am Ende ±1 Schlag unter −60 dB. Ohne Wert ist die Datei byte-gleich.

### SX2 Klinge ✂
- **Bedienung:**
  - In einer geöffneten Marke auf einen Taktstrich tippen. Auf dem Strich erscheint ✂, ein Tipp darauf teilt den Teil
    („Refrain A | B“).
  - Im Marken-Blatt gibt es dazu [✂ Bei Takt …].
- **Nutzen 3:** Danach kann man eine Hälfte ersetzen, einen Übergang dazwischen legen oder in einer Hälfte die Drums ausschalten
  (S0). Es klingt gleich.
- **Aufwand:** 3–5 h.
- **Abhängigkeit:** keine.
- **Schon da:** `marksCut(song,a,b,split)` (G 23176), heute nur über „Als Teil …“ (`rangeAsPart`, G 23714).

### SX3 Teil-Kante ziehen (Ripple-Trim)
- **Bedienung:**
  - Erst die Marke antippen (gewählt), dann erscheinen Griffe an beiden Kanten (Trefferfläche 44 px). Ohne Wahl gibt es keine
    Griffe, damit sie nicht mit dem UE-Chip an der Kante und mit „Marke anheben“ kollidieren.
  - Ziehen rastet auf Takte ein, sichtbar mit „+2 Takte“. Alles dahinter rückt mit (Animation `svShiftAnim`).
- **Musik:** Die Strophe wird von 8 auf 10 Takte länger, der Inhalt läuft als Schleife weiter. Oder das Intro wird einen Takt
  kürzer. Der Umweg über Löschen und Einfügen fällt weg.
- **Aufwand:** 6–9 h.
- **Abhängigkeit:** nach SX2 (gleiche Stelle im Code).
- **Schon da:** `markAction 'move'` (G 23624), `songRange 'insertEmpty'` (G 23700), Löschen mit Nachrücken, `drgStart`.
  `svBindGestures` (G 24801) kennt nur die Schleifen-Griffe und das Anheben einer Marke.

### SX4 Spurkopf: Solo + Lautstärke (+ Pegel)
- **Bedienung:** Am Spurnamen (Matrix und Song):
  - Tipp = stumm (wie heute).
  - Halten = **Solo**.
  - Waagrecht schieben = Lautstärke mit dB-Anzeige.
  - Der Pegelbalken kommt aus VV4-F.
- **Nutzen 4:** Schnell mischen, ohne in FX › SPUR zu wechseln. Ein **Spur-Solo fehlt heute ganz**. Es gibt nur Solo für einen
  FM-Operator (G 31251) und für eine Chor-Stimme (G 44701). Die Videoschnitt-Liste sagt fälschlich, Solo gäbe es schon.
- **Aufwand:** 6–10 h (ohne Pegel).
- **Abhängigkeit:** Pegel erst mit VV4-F.
- **Schon da:** `tr.mute` (G 17304), `fx.vol` (G 31557).
- „Sperren 🔒“ und „Gruppen“ sind gestrichen. Gesang bleibt ohnehin fest, weil G3 ihn beim Verschieben mitnimmt (G 43164). Die
  Chor-Gruppe kommt mit G6+.

### SX5 Synth-Ausklang über die Kante
- Erst 1 h messen: Werden Synth-Noten heute an der Teilkante abgeschnitten?
- Nur wenn ja: Noten klingen über die Kante aus (Release läuft weiter), Auftakt-Noten der Melodie lassen sich vor den Teil ziehen.
- Gesang (J-/L-Schnitt am Schwänzchen) ist **G10 Nr. 3/4** („einzäunen“) und wird hier nicht doppelt geplant. G10 muss die
  Schwänzchen in `svBindGestures` greifbar machen (G 43126 `g3SvDraw` zeichnet sie nur).

### SX6 Form-Vorlage
- **Bedienung:** Neuer Song → [Aus Vorlage]: „Synthpop 84: Intro 4 · Strophe 8 · Refrain 8 · Strophe 8 · Refrain 8 · Bridge 4 ·
  Refrain 8 · Outro 4“. Das legt leere, benannte Marken an.
- **Nutzen 3**, **Aufwand** 4–6 h.
- **Schon da:** `partSuggest` (G 22939), Teile an jeden Taktstrich legen (V2e).

### SX7 Scrubbing
- **Bedienung:** Den Schalter 🔊 in der Song-Leiste einschalten, dann die Zeitleiste unter einer festen Linie wischen:
  - Der Schlag unter der Linie klingt kurz an.
  - Am Taktstrich kommt ein sichtbarer Blitz, keine Haptik (G9-Probe).
  - Nach dem Loslassen bleibt die Marke ▼ dort.
- **Nutzen 4:** Man findet schnell den Einsatz oder einen falschen Ton.
- **Aufwand:** 7–10 h. Kurzes Abspielen auf den Schlag genau; die Schleife ist heute nur taktgenau.
- **Schon da:** `audition` (Piano-Roll, G 12186), `songPlayFrom` (G 25030). `svRulerTap` (G 20695) wählt nur aus.

### SX8 Pinch-Zoom im Song
- **Bedienung:**
  - Zwei Finger zoomen von „Schläge sehen“ bis „ganzer Song“; ganz weit draußen werden die Teile zu Farbblöcken.
  - Doppeltipp mit zwei Fingern = ganzer Song.
  - Beim weiten Ziehen einer Marke erscheint die Mini-Karte.
- **Nutzen 4:** Wichtig für lange Songs (G8, mehr als 16 Takte).
- **Aufwand:** 8–12 h.
- **Schon da:** Pinch-Zoom und Mini-Karte in der Piano-Roll (G 11573, 12156, N2 11592). Im Song ist `SV.cellW = 36` fest
  (G 22282).
- **Abhängigkeit:** vor SX10 bauen (der Container braucht die Übersicht).

### SX9 Versionen eines Clips
- **Bedienung:**
  - Im Halte-Blatt der Song-Zelle gibt es eine Reihe „Versionen: v1 · v2 · v3“.
  - Ein Tipp setzt diese Version hier, [Überall v2] setzt sie im ganzen Song.
  - Auf der Zelle steht ein Schild „v2“.
- **Nutzen 4:** Xanders Wunsch vom 24.10. (d): Refrain 2 mit anderem Bass, ohne das Original zu verlieren.
- **Aufwand:** 8–10 h.
- **Schon da:** Verweis ↔ eigener Clip, [Zurück zum Szenen-Clip] (G 25570ff), „Auf alle übertragen“ (G 25781).

### SX10 Block/Container
- **Bedienung:**
  - Bereich über „Strophe + Refrain“ wählen, dann [▣ Als Block].
  - Über der Taktleiste erscheint eine dünne Zeile „Block A“. Block halten verschiebt oder kopiert ihn als Ganzes.
  - Doppeltipp = hineingehen: Schleife auf dem Block, oben der Pfad „Song › Block A“, ← führt hinaus.
- **Musik:** Xanders Wunsch (d) vom 01.11. und vom 31.10. 12:10 („zwei verkettete Teile zu einem“).
- **Aufwand:** 8–12 h.
- **Daten:** eigene Ebene `song.blocks`, weil sich Marken nicht überlappen dürfen (G 17558).
- **Schon da:** S2 Zusammenfassen (`s2SumMark`, G 45676), Drag mit Nachrücken. „Hineingehen“ gibt es nicht.
- **Abhängigkeit:** UE-H Konsolidieren nutzt dasselbe „Ursprung bleibt zurückholbar“.

### SX11 Teil-Varianten „leicht/voll“ (Yamaha Main A/B)
- **Bedienung:** Im Marken-Blatt gibt es [Leicht] [Voll]. Ein Tipp setzt eine gespeicherte Auswahl, welche Clips im Teil an sind
  (S0). Mit [Variante kopieren → einfügen] überträgt man sie auf andere Teile.
- **Nutzen 4:** Dynamik im Arrangement mit einem Tipp, und UE-C kann daraus die Richtung des Fills lesen.
- **Aufwand:** 10–14 h.
- **Schon da:** `s0SegSet`/`m.off` (G 45383), Chor-Mischung „80er großer Refrain“ (G 44482).
- **Gestrichen:** volle „Looks“ mit Effekt-Änderungen. Das wäre doppelt zum Super-Regler.

### SX12 Clip-Kurven (Keyframes im Clip)
- **Bedienung:**
  - Neben jedem Regler gibt es eine Raute ◆: Ein Tipp beim Abspielen setzt einen Punkt.
  - Alternativ [◆ REC] einschalten und den Regler im Lauf bewegen; die Punkte werden ausgedünnt.
  - In der Piano-Roll liegt unter den Noten eine Kurven-Leiste: Punkte ziehen, Halten bietet „weich · gerade · Stufe“.
  - [Kurve löschen] je Clip.
- **Musik:** Filter geht über 8 Takte auf, Lautstärke-Fahrten, Hall-Fahne.
- **Wichtig:** Xander will Kurven **fest im Clip**, beim Kopieren immer mitkopiert, keine Extra-Daten wie in vielen DAWs (31.10.,
  Bit Mask F9). Darum gibt es **keine Song-Keyframes** (Idee „Kurven je Spur im Song“ verworfen). Nur das Ausblenden am Ende ist
  Song-Sache (SX1).
- **Aufwand:** 20–30 h. Gleiche Datenbasis wie P-Locks (Innovation 2 / V5) und Mal-LFO (Innovation 3), also zusammen bauen.
- **Schon da:** Locks nur tune/dec bei Drums (G 12392). `normClip` kennt keine Kurven (G 17274–17300).

### SX13 Noten formen
- [⤢ Formen] in der Piano-Roll legt einen Rahmen mit Anker um die Auswahl.
  - Waagrecht ziehen rastet bei ×½, ×⅔, ×1,5 und ×2.
  - Senkrecht ziehen spreizt den Tonumfang in der Tonart.
  - Spiegeln geht um den Anker-Ton.
- **Nutzen 3:** „doppelte Länge“ (31.10.).
- **Aufwand:** 5–8 h.
- **Schon da:** Spiegeln/Umdrehen (G 11687–11689), D1 Länge je Drum-Spur (G 17628).

### SX14 Verlauf-Liste und Schnappschüsse
- **Bedienung:**
  - Die Verlauf-Leiste waagrecht schieben spielt einen früheren Stand vor.
  - Dann [Nur diese Spur zurückholen] · [Nur Klang] · [Ganzer Stand].
  - [📌 Schnappschuss] gibt einem Stand einen Namen.
- **Nutzen 4**, **Aufwand** 10–14 h.
- **Abhängigkeit:** erst nach dem Merge von VC2a (V 20701ff, heute nur im Staging).
- Zwei-/Drei-Finger-Tipp für ↶/↷ nur nach Funk-Vorschlag, weil zwei Finger heute zoomen (G 34519).

### SX15 Farbe für alle Marken + Merk-Pins
- **Bedienung:**
  - „Farbe“ geht auch für Szenen-Marken (heute nur P1–P8, G 25065).
  - Taktnummer antippen → [⚑], dann eine Farbe und eine kurze Notiz. ⏭ springt zum nächsten Pin.
  - Blaue Pins nutzt die Auto-Regie als Fokus-Punkt.
- **Nutzen 3**, **Aufwand** 5–7 h.

### Nicht als eigenes Paket (gibt es schon oder ist schon geplant)

| Idee | Wohin |
|---|---|
| Klang-Blende über die Kante, Szenen-Morph | Super-Regler (Innovation 1) bzw. V6a. Xander 01.11. ~00:15: „weiche Regler-Übergänge gibt es schon“ |
| Effekt-Ebene über einem Bereich (Filter auf/zu, Tape-Stop, Stotter) | Filter-Fahrt = Super-Regler „bis zum nächsten Teil fahren“. Tape-Stop/Stotter später als UE-Kacheln, erst nach Wunsch |
| Song-Keyframes je Spur | verworfen, Kurven gehören in den Clip (SX12) |
| J-/L-Schnitt Gesang, Zeit-Maske/Radierer, Klammern am Gesang | G10 Nr. 3/4 („einzäunen“) |
| Referenz-/Vorlage-Spur, farbige Chor-Schatten | G10 Nr. 1 und 11 |
| Chor-Gruppe, Stimme duplizieren | G6+ |
| Frequenz-Maske malen, EQ gegen Maskierung | M1 Auto-Mix |
| Gate/Schnittmaske, Ausweichen | Pumpen gibt es (G 31613, 17876); Gate-Formen kommen mit dem Mal-LFO (Bibliothek „Pumpen, Gate, Triller“) |
| Licks/Melodie-Antworten malen | Magic Scale (nach G9); Vorlagen als UE-Einwurf-Reiter, wenn Magic Scale steht |
| Zeitraffer/Aufbau-Video | VV5 (bisher „VV4“ im Entwurf), braucht VC2a |
| Spur-Bild/Innenansicht | VV3, wird durch VV4-E bereinigt |

### Zurückgestellt (Nutzen zu klein für den Aufwand oder unklar)

- **Gruppen/Bus allgemein** (10–14 h): höchstens 8 Spuren (G 17144). Erst wenn G6+ zeigt, wie die Chor-Gruppe genutzt wird.
- **Spuren sperren 🔒:** kein echter Bedarf. Gesang geht beim Verschieben mit.
- **Verschachtelte Blöcke** (Block in Block): SX10 reicht.

---

## 4. Empfohlene Reihenfolge NACH den laufenden Paketen

Laufend: 4.25.0 Gesang → 4.25.1 Hotfix → 4.26.0 Video (VIDSTAGE + V-A) → G9 Songtext → G6+ Chor → G10 Gesang-Studio.

Zugesagt und in der Planung zu berücksichtigen:
- Magic Scale (nach G9)
- Innovation 1–4 (Super-Regler, P-Locks, Mal-LFO, Tipp-Summen)
- North, Bit Mask
- T1 Taktarten (nach Gesang, Video und North)

1. **VV4-E „nichts Imaginäres“** (7 h). Es behebt Xanders Befund V-B. Am besten noch in 4.26.0, sonst sofort danach.
2. **SX1 Song-Ende ausblenden** (3–4 h). Klein, und Xander braucht es für die 30-s- und 60-s-Videos.
3. **UE-A bis UE-E Übergänge** (≈ 45 h, Version 4.27.0), in zwei Zweigen parallel: Kern + Ziehen | Werks-Inhalt + Breaks/Einwürfe.
4. **VV4-B, VV4-C, VV4-D** (26 h), parallel zu 3 in einem eigenen Zweig. Die Übergangs-Regel von VV4-D kommt nach UE-A.
5. **VV4-A Ganze App hochkant** (16 h).
6. **SX2 Klinge + SX3 Teil-Kante ziehen** (≈ 12 h) [Funk für die Griffe].
7. **UE-F Riser/Downlifter/Reverse + UE-H Konsolidieren** (≈ 15 h).
8. **SX4 Spurkopf (Solo, Lautstärke) + VV4-F Mäusekino** (≈ 20 h) [Funk]. Erst der App-Teil, dann der Video-Teil.
9. **UE-G Verknüpfer** (12–16 h), sobald Magic Scale steht (Malen mit dem Wisch-Raster).
10. **SX5** (erst messen) · **SX6 Form-Vorlage** · **SX7 Scrubbing** [Funk] · **SX8 Pinch-Zoom** [Funk].
11. **SX9 Versionen · SX10 Block/Container · SX11 leicht/voll** [Funk].
12. **SX12 Clip-Kurven** zusammen mit Innovation 2 + 3 (P-Locks, Mal-LFO), nicht getrennt.
13. Später: SX13, SX14 (nach dem VC2a-Merge), SX15.

**T1 Taktarten:** UE speichert alle Positionen in Schlägen, damit T1 nichts kaputt macht. T1 sollte trotzdem erst nach
UE-A–E kommen, weil beide den Scheduler berühren.

**Summen:**

| Bereich | Aufwand |
|---|---|
| Übergänge | ≈ 71–77 h |
| VV4 | 61 h |
| SX1–SX15 | ≈ 108–158 h (davon ≈ 12 h ohnehin in Innovation 2 + 3) |
