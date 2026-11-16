# NST1 – „Je Note weiterschalten“ (Notizen, 16.11.2026)

index.html = basis.html (Synquenzer 4.78.0, rel-4780, md5 68e92c03…) + Block `/* NST1-BEGIN … NST1-END */` hinter `/* LT2-END */`
+ Worklet-Teil `/* NST1W-BEGIN … NST1W-END */` (in der Klasse des Analog-Kerns) + 9 einzeilige Haken (alle mit „NST1“/„NST1W“).
Keine vorhandene Zeile geändert (diff zu basis.html: nur `a`-Zeilen). VERSION bleibt 4.78.0. Bauen: `python3 apply.py`
(basis.html + nst1-block.js + worklet.py → index.html). nst1-block.js = der Block, identisch mit dem in index.html (geprüft).

## Was es kann (Xanders Idee, 16.11.)
Jede neue Note – egal welche Tonhöhe – schaltet einen Oszillator-Wert einen Schritt weiter.
- **Ziele** je Engine: Analog: Welle, Intervall (HT), Fußlage, Verstimmung, Pulsbreite, Anteil (je Osz 1–3), Filter (Cutoff).
  FM: Verhältnis, Fein, Pegel je Operator. Engine mk (Platte): Wellen-Form (Steuer 1/2, T2), Intervall Osz 2, Verstimmung Osz 2,
  Anteil (Osz 1/2/Rauschen), Filter. Wavetable: Position, Filter. Bit Mask / Perkussion: nicht (kein Je-Stimme-Weg).
- **Muster**: Hoch · Runter · Hoch-Runter (ohne doppelte Spitze) · Zufall (nie zweimal dieselbe Stufe hintereinander; mit Saat →
  Song, Video und Datei-Render klingen gleich) · Fest (eigene Folge, Stufe je Schritt antippen). **2–8 Schritte**, Bereich von/bis je Bahn.
- **Verbund** (2–3 Bahnen = Oszillatoren/Operatoren): gleich · gegenläufig (Bahn 2 gespiegelt → einer hoch, einer runter, sie kreuzen
  sich; Bahn 3 um die halbe Treppe versetzt; bei Zufall würfelt jede Bahn selbst) · Ping-Pong (Note 1 setzt alle, danach geht je Note
  genau eine Bahn, reihum) · spreizen (Mitte │ Tiefe │ Höhe: getrennte Bereiche, Tiefe läuft abwärts, Höhe aufwärts – nie derselbe
  Wert; bei Wellen/Fußlagen: immer verschiedene Stufen). Bahnen dürfen verschiedene Ziele haben (Sendersuche: Intervall + Verstimmung).
- **Schnellwahl** (ein Tipp, ein ↶): Analog: **Sendersuche** (Osz 2 Intervall ±12 + Verstimmung ±50 ct, Zufall, 8 Schritte; dazu
  Osz 2 hörbar, Rauschen ≥ 10 %, Hüllk. 2 → Osz-2-Tonhöhe 0,12 = Gleiten in den Ton – nur wenn noch keine Route auf Osz 2 liegt),
  Gegenläufig (Osz 2 / Osz 3 ±7 HT), Fächer (3 Sägen, Verstimmung gespreizt), Wellen-Zufall (Osz 1+2 nie dieselbe Welle),
  Pulsbreiten-Treppe. FM: Sendersuche (OP 2 Verhältnis + Fein), Verhältnis-Treppe, Gegenläufig. mk: Sendersuche, Form-Treppe,
  Osz-Wechsel. WT: Positions-Treppe, Sendersuche. Was eine Schnellwahl am Klang mit ändert, steht im Toast (mit Rückgängig).

## Regeln (festgelegt und getestet)
- **Akkord-Regel**: Töne einer Spur, die innerhalb von 35 ms beginnen (dieselbe Gruppe wie beim Glide), sind **ein Schritt** – alle
  Töne des Akkords bekommen denselben Wert. Schalter „Akkord: jede Note“ = jeder Ton ein eigener Schritt (Treppe im Akkord, in der
  Reihenfolge, in der die Töne geplant werden).
- **Zählen**: Clip, Song, Live-Tasten, Melodie, Arp, Begleiter, Video-/Datei-Render. Nicht: Browser-Vorschau, Vorhören im Noten-Editor.
- **Rückstellen**: ▶ beginnt immer bei Schritt 1 (ebenso jeder neue Render). „Neu ab Clip: Start“ (Standard) = jeder Clip-/Szenenstart
  der Spur beginnt bei Schritt 1; „weiterzählen“ = der Zähler läuft über Clip- und Szenenwechsel weiter. Jede Änderung der Einstellung
  beginnt bei Schritt 1.
- **Neu-Planung**: FILL, Arp-Neuplanung, Clip-Wechsel im Lauf rufen cancelTrackFrom – der Zähler geht auf den Stand vor der ersten
  gestrichenen Note zurück (kein Sprung). Dieselbe Note noch einmal geplant (gleiche Zeit + Taste, z. B. applySound) = derselbe Schritt.
- **Lock gewinnt**: hat eine Note einen Noten-Lock (oder Reihen-Startwert) auf demselben Regler, bleibt der Lock.
- **Je Note gehört zum Klang** (sound.nst): wandert mit „Sichern“, Klang-Datei, Spur duplizieren; bei Klang-Editor im ◆-Zustand eines
  Clips (AK1) landet es im Grundklang, nicht im ◆.

## Technik / Entscheidung „Kern im Worklet?“
Der Auftrag nannte „Kern im Worklet je Engine“. Gebaut ist: **Schritt-Wahl im Haupt-Faden beim Note-an** (Haken in spawnVoice, vor
allen Engine-Abzweigen), Transport in den Worklet über den vorhandenen **I2b-Weg** (Je-Stimme-Paare wie Noten-Locks), **Worklet-Teil
nur für das klickfreie Umschalten**. Gründe: (1) ein Weg für alle Engines (Analog, FM6 – FM-Feld über dieselben Pfade, nicht eigens gemessen –, mk, WT nativ) statt drei Kernen;
(2) im Audio-Faden 0 zusätzliche Arbeit je Block, wenn nichts umschaltet (Paare werden nur beim Stimmstart gelesen, Tafeln im
Nachrichtenweg angelegt); (3) Zähler im Haupt-Faden kann bei Neu-Planung zurückgenommen werden und ist deterministisch (Saat).
Klasse n (Welle, Fußlage, HT, FM-Verhältnis) gilt ab dem ersten Sample der neuen Stimme (Hüllkurve startet bei 0 = klickfrei);
Klasse b (Fein, PW, Anteil, Cutoff) gleitet bei Legato 5 ms (vorhanden).
**NST1W (Worklet)**: Mono/Legato + neuer Wellen-Wert an einer klingenden Stimme sprang hart (gemessen Spitze 17,7 × Sinus-Steigung).
Jetzt: n1Hold (in monoOn) hält die neue Welle zurück, n1Blk (Steuer-Block) blendet die Stimme 6 Blöcke (96 Samples) aus, wechselt bei
Pegel 0, blendet 96 Samples ein (wie der XF-Dip des Kerns). Nur Zahlen an der Stimme, keine Zuweisung; ohne Wellen-Wechsel läuft nur
`if (v.n1d)`. Gilt auch für Noten-Locks der Welle bei Mono/Legato (vorher dort derselbe Knack). Worklet-Quelltext bleibt reines ASCII
(Pflicht: der data:-Weg des Ladens nutzt btoa – Fund unterwegs, siehe LOG).

## Haken (je eine neue Zeile)
| Stelle | Haken |
|---|---|
| SQStore normalizeSound | `G.nst1Norm(o, s)` – Feld sound.nst (additiv, bereinigt) |
| spawnVoice nach `snd0` | `o = nst1Voice(i, out, t0, o, snd0)` – Schritt dieser Note → `o.lk` (Worklet) / `o.lkP` (nativ) |
| cancelTrackFrom | `nst1Cancel(i, t)` – Zähler zurücknehmen |
| pickerOpen | `opts = nst1Pick(anchor, opts)` – Chip „Je Note“ an passenden Reglern |
| openEdMore (HTML) | `nst1MoreBtn(t)` – Eintrag im ⋯-Menü |
| openEdMore (Tipp) | `nst1MoreTap(p, anchor, t)` |
| buildSynthEd | `nst1EdMark([em1, emL, em2], i)` – Strich am ⋯, solange Je Note an |
| Worklet monoOn | `this.n1Hold(v, this.lkEv)` (NST1W) |
| Worklet control | `if (v.n1d) this.n1Blk(v)` (NST1W) |
Andere Pakete (XLA Import, XLB 24 Spuren, LAGE1) nicht berührt; nächster XLB-Haken liegt 4 Zeilen vor dem spawnVoice-Haken (getrennte Hunks).

## Bedienung (Fotos in fotos/)
- Klang-Editor › **⋯ › Je Note weiterschalten** (alle Synth-Engines außer Bit Mask/Perkussion; Untertitel = Zusammenfassung, wenn an).
- **Regler lange drücken › Chip „Je Note“** (Analog: Intervall, Fein, Pulsbreite, Anteil, Cutoff; WT: Position): schaltet Je Note für
  diesen Regler an (ein ↶) und öffnet das Blatt; ein zweiter Regler derselben Art kommt als Bahn dazu (Verbund on the fly, max. 3).
- Blatt: An/Aus · Zusammenfassung · **Treppen-Bild der nächsten 8 Noten** (eine Farbe je Bahn) · Schnellwahl · Ziel · Welche (Osz /
  Operator) · Muster als **Bild-Knöpfe der Treppe** (SVG, keine Emojis) · Verbund · Schritte 2–8 · Bereich von/bis je Bahn · Fest-Folge ·
  Akkord · Neu ab Clip · **▶ 8 Noten** (hören, ab Schritt 1; nur wenn nichts läuft). Jede Änderung = ein ↶. Hochkant passt das Blatt
  ganz, quer rollt es innen. Alle Tasten ≥ 44 px.
- Guide: „Je Note weiterschalten“ (Suche: sendersuche, je note, treppe, gegenläufig, ping pong …), Sprung öffnet Editor + Blatt.

## Messung (Endlauf nst1-test 70/70, test-ergebnis.txt)
- Klang je Engine über den Worklet (App-Render): Analog Intervall 0/4/8/12 HT exakt; gegenläufig Osz 2 steigt 0…+12, Osz 3 fällt
  0…−12, Kreuzung bei Note 3; mk Osz 2 Intervall 0/4/8/12; FM OP 1 ×1/×2/×3/×4 = 0/12/19,02/24 HT; WT (nativ) Helligkeit 1→4,3.
- Klickfrei: Spitze/Sinus-Steigung POLY 0,87 · MONO 1,0 · LEGATO 1,0 (ohne NST1W: 17,7).
- CPU: Haupt-Faden je Note im Mittel 0,014 ms (max 1 ms beim ersten Aufruf: Tafeln). Render 4 Takte / 192 Noten (6er-Akkorde, Median
  aus 3): Basis 2009 ms · NST1 aus 1998 ms · NST1 an (3 Bahnen, jede Note ein Schritt) 2030 ms (+1 %, im Rauschen der 4 geteilten Kerne).
- golden.mjs (vx/perf2) basis gegen index: **bitgleich** (12 Werksklänge aller Engines über das App-Worklet, geseedet).
- Start-Bild hochkant/quer pixelgleich zur Basis; Startzeit nicht schlechter (Median im Rauschen); Konsole ohne Fehler.
- Speichern/Laden bitgleich; Klang ohne Feld = Format wie 4.78.0; MIDI-Export aller Szenen mit/ohne Je Note bytegleich.
- Pflicht: topdefs 0 doppelt / 0 Syntaxfehler, dupkeys 0, smoke errors [], „MS 2000“ 1×, „^  live: true,“ 1×, VERSION 4.78.0.

## Hörbeispiele (hoeren/, je 8,6 s, App-Render → MP3 160 kbit/s, auf −1 dBFS gezogen)
1-sendersuche (Riff in c-Moll, Achtel) · 2-gegenlaeufig-2-osz (Viertel auf C3, Osz 2 hoch / Osz 3 runter) · 3-spreizen-3-saegen
(c-Moll-Akkorde, Fächer) · 4-zufall-wellen (Sechzehntel-Arpeggio, Osz 1/2 nie dieselbe Welle). Schnellwahl jeweils auf INIT Analog.

## Grenzen / offen
- Reihenfolge: gezählt wird in Planungs-Reihenfolge. Live-Töne während ein Clip auf derselben Spur läuft, werden zwischen die schon
  ~100 ms vorausgeplanten Clip-Noten gezählt; an einer Clip-Schleifengrenze innerhalb eines Planungsfensters kann die erste Note der
  nächsten Runde vor letzten Noten gezählt werden (selten, nur in einem Fenster von ~25 ms).
- Engine mk: Welle von OSZ 1/2 ist Struktur (nicht im Je-Stimme-Raum M) → dort „Wellen-Form“ über Steuer 1/2. Echte Welle je Note
  bräuchte einen Anhang an das eingefrorene PV-Layout + Worklet (Phase 2).
- „Geändert“-Punkt am Klangnamen und das Doppel-Erkennen beim Bibliotheks-Import (soundHash) sehen Je Note nicht.
- FM-Operator-Regler haben (noch) keinen Chip „Je Note“ – dort über ⋯.
- Ideen Phase 2: Modus „LFO halten“ (LFO läuft frei, Wert wird je Note festgehalten – Elektron-HLD-Vorbild aus der Recherche),
  Gleiten je Bahn direkt im Worklet (statt über Hüllk. 2), Bedienung auf der Platte der Engine mk.

## Funk-Entwurf (sichtbare Änderungen – vor Auslieferung vorschlagen)
„Xander, ‚Je Note weiterschalten‘ ist gebaut (noch nicht ausgeliefert): jede neue Note schaltet einen Oszillator-Wert eine Stufe
weiter – Welle, Intervall, Verstimmung, Pulsbreite … wie ein Arpeggiator, nur auf den Klang. Muster hoch/runter/hoch-runter/Zufall/fest,
mit 2–3 Oszillatoren gegenläufig (kreuzen sich), Ping-Pong oder gespreizt (nie gleich). Schnellwahl ‚Sendersuche‘ = Radio-Effekt.
Neu sichtbar wäre: (1) im Klang-Editor unter ⋯ der Eintrag ‚Je Note weiterschalten‘, (2) ein orangener Strich unter ⋯, solange es an
ist, (3) beim langen Drücken auf HT/Fein/PW/Anteil/Cutoff ein Chip ‚Je Note‘, (4) das Blatt mit Treppen-Bild. Hörbeispiele liegen
bei. Passt das so?“
