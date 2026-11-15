# TRP1 „Abschnitt transponieren“ – Teil 1/1 (Plan-Schritte 1–4)

Grundlage: basis.html = rel-4680/index.html (4.68.0). index.html = basis + EIN Block `TRP1-BEGIN … TRP1-END` (nach JAM3-END)
+ 10 Ein-Zeilen-Haken `/* TRP1 */` mit typeof-Schutz. Ohne diese Zeilen ist index.html zeilengleich mit basis.html (geprüft).
VERSION unverändert 4.68.0. Größe +20,6 KB (+0,23 %).

## Haken-Liste (Zeilen in index.html)
| Zeile | Funktion | Zweck |
|---|---|---|
| 29088 | marksNorm | `mark.trs` (Stufen, Grundton, Skala) beim Laden behalten |
| 33137 | outPitch | ▶ SONG: Clip-Note in einem Teil mit Stufen (vor der Träger-Abbildung) |
| 40932 | openMarkSheet | Zeile „Wirkt ab hier │ nur dieser Teil │ Mehr ▾“ (Reiter Ablauf) |
| 41640 | openRangeMore | Eintrag „⇅ Transponieren …“ im ⋯ der Bereich-Leiste |
| 41643 | openRangeMore (Tipp) | öffnet das Blatt „Transponieren“ für A–B |
| 54908 | int54MidiClips | MIDI-Export: Stufen (Spuren ab 6, z. B. MELODIE) |
| 54950 | buildMidiSong | MIDI-Export Song: Stufen |
| 75705 | va1MidiSong | MIDI je Spur/Stems: Stufen |
| 78388 | vvkScore | Video-Tastatur/Partitur: Stufen |
| 89990–90241 | Block | Kern, Blatt, Guide, Test-API `SYNQUENZER.trp1` |

## Gebaut
- Kern `trp1Set({a, b, r, deg, oct})`: „nur dieser Teil/Bereich“ ±1…±12 = Knotenpaar in song.xp (Anfang +r, Ende wieder alter Wert),
  Rückungs-Logik wie jam2RkSet: alles außer Drums, auch ⇅ fest (mark.rk/rkx nur in den Takten des Bereichs, je Marke ent-/neu gepackt),
  Song-Melodie in den Daten (Auftakt-Regel ¼ Schlag). Grenze ±12 je Knoten (vorher geprüft, Meldung „Höchstens ±12 Halbtöne“). Ein ↶.
- In der Tonart (`deg`): Stufen der Tonart des Teils (songKeyAtBar beim Setzen) an der Marke `trs`; eine Rechnung `trp1DegN` für
  Wiedergabe, MIDI (3 Wege), Video-Tastatur; Song-Melodie in den Daten. STIMME-Spur, Drums, Perkussion, Drum-Einzelspuren nie.
  Gesang im Teil → Meldung „Gesang bleibt (geht nur in Halbtönen)“. Nur ganze Teile (sonst Meldung).
- Oktavbereich halten: |r| > 6 HT (> 3 Stufen) → Gegenrichtung (+7 → −5). Meldung nennt „+7 → −5“.
- Bedienung: Marken-Blatt › Ablauf: Zeile „Wirkt ab hier │ nur dieser Teil │ Mehr ▾“ (hochkant eigene Zeile, quer in der
  Rückungs-Zeile → Blatt quer nicht höher). „nur dieser Teil“ schaltet die vorhandenen −2…+2 auf „nur Teil“. Mehr ▾ = Blatt
  „Transponieren“ (nur dieser Teil │ ab hier · Halbtöne │ in der Tonart · Oktavbereich halten · −12…+12). Bereich-Leiste › ⋯ ›
  „⇅ Transponieren …“ öffnet dasselbe Blatt für A–B. 3 Tipps: Marke › Mehr ▾ › +3 (oder Marke › nur dieser Teil › ±1/±2).
- Guide „Wo finde ich …?“: „Abschnitt transponieren (nur dieser Teil)“ → öffnet Marken-Blatt (Ablauf) mit „nur dieser Teil“.

## Tests (trp1-test.mjs, 64/64)
Kern Teil 3 von 5 +3 (MIDI: Teil 3 +3, Drums gleich, Teile 1/2/4/5 bit-gleich, ⇅ fest rückt mit, Rückung Teil 5 bleibt), Song-
Wiedergabe (noteLog 59/59, Drums 28/28, Melodie 4/4), Video-Partitur = MIDI, ↶ ganzer Song-JSON bit-gleich, ↷, Speichern/Laden
bit-gleich, Oktavbereich, Grenze ±12, Bereich über Teil-Grenze (rkx), Stufen-Kern (C→D, E→F, H→C, C♯→D♯, a-Moll, −1),
Stufen in MIDI/Wiedergabe/Video, Gesang-Meldung, Bedienung per CDP-Touch in 428×926, 926×428, 926×370 (≥ 44 px, im Bild, 3 Tipps,
Bereich-Leiste, Guide), Long Tasks 0 (Kern 0,7 ms), Blatt neu zeichnen ≤ 0,5 ms, keine Seitenfehler.
Pflicht: topdefs 0 doppelt / 0 Syntaxfehler, dupkeys 0, smoke errors [], „MS 2000“ 1×, „^  live: true,“ 1×, VERSION 4.68.0.

## Entscheidungen
- Stufen nicht als song.xp-Knoten (xp ist an 8+ Stellen reine Halbton-Treppe, normSong verwirft Zusatzfelder), sondern als
  Teil-Eigenschaft `mark.trs` – wandert mit dem Teil wie seine Taktart (`mark.ts` ist schon belegt → `trs`).
- Stufe wirkt auf die Clip-Note VOR der Träger-Abbildung (wie eine andere Note des Clips); song.xp-Halbtöne kommen danach dazu.
- „ab hier“ im Blatt mit Halbtönen = die vorhandene Rückung (jam2RkSet, gegen davor); bei Bereich/Stufe = trp1Set bis Song-Ende.
- Rahmen des Marken-Blatts: links 8 px / Breite = Bild war schon in 4.68.0 so (gemessen, unverändert) – Test prüft oben/unten.

## Offen
- Funk: Plan sagt „kurz ankündigen“ – neue sichtbare Zeile (hochkant „Wirkt …“, +48 px Blatthöhe) und ⋯-Eintrag vor Auslieferung im Funk nennen (Regel 3).
- Taktleiste: Teil nach einem „nur“-Teil zeigt die Rückung gegen davor (z. B. „−3“) – ehrlich, aber evtl. verwirrend; Kennzeichen „nur“ wäre neu/sichtbar → nur auf Wunsch.
- Lücke zwischen zwei Teilen (Takte ohne Marke): der ⇅-feste Stand folgt dort dem Teil davor → bei „nur dieser Teil“ rückt die Lücke für ⇅-feste Spuren mit (song.xp stimmt).
- Stufen: Song-Aufnahme über einem Stufen-Teil (clipNoteFor) und Neu-Stimmen gehaltener Noten an der Teil-Grenze nicht eingehängt; Zusammenfassen/Konsolidieren eines Stufen-Teils (neue Marke) verliert `trs` – nicht geprüft.
- Neuer Code liegt im Hauptskript (nicht nachgeladen); +0,23 % Größe, innerhalb ±1 %.
