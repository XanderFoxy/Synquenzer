# TRP1 „Abschnitt transponieren“ – Teil 1/1 (Plan-Schritte 1–4)

Grundlage: basis.html = rel-4680/index.html (4.68.0). index.html = basis + EIN Block `TRP1-BEGIN … TRP1-END` (nach JAM3-END)
+ 10 Ein-Zeilen-Haken `/* TRP1 */` mit typeof-Schutz. Ohne diese Zeilen ist index.html zeilengleich mit basis.html (geprüft).
VERSION unverändert 4.68.0. Größe +20,6 KB (+0,23 %).

## Haken-Liste (Zeilen in index.html, Stand nach der Prüfung)
| Zeile | Funktion | Zweck |
|---|---|---|
| 28736 | t1Shift | `song.trf` (Versatz fester Spuren ohne Marke) wandert beim Takte einfügen/löschen mit (Taktkarte) – Prüfung |
| 29038 | normSong | `song.trf` beim Laden behalten – Prüfung |
| 29090 | marksNorm | `mark.trs` (Stufen, auch je Takt im Teil) und `mark.trn` (Sprung des „nur“-Teils davor) beim Laden behalten |
| 33139 | outPitch | ▶ SONG: Clip-Note in einem Teil mit Stufen (vor der Träger-Abbildung) |
| 33561 | restoreSong | ↶ ↷ während ▶ SONG: Transposition + feste Spuren ab dem nächsten Takt (`gr1XpLive`, `jam3FtLive`) – Prüfung |
| 38002 | songShift | `song.trf` wandert mit – Prüfung |
| 38010 | songClear | `song.trf` im geleerten Bereich weg – Prüfung |
| 40937 | openMarkSheet | Zeile „Wirkt ab hier │ nur dieser Teil │ Mehr ▾“ (Reiter Ablauf) |
| 41645 | openRangeMore | Eintrag „⇅ Transponieren …“ im ⋯ der Bereich-Leiste |
| 41648 | openRangeMore (Tipp) | öffnet das Blatt „Transponieren“ für A–B |
| 54913 | int54MidiClips | MIDI-Export: Stufen |
| 54955 | buildMidiSong | MIDI-Export Song: Stufen |
| 75710 | va1MidiSong | MIDI je Spur/Stems: Stufen |
| 78393 | vvkScore | Video-Tastatur/Partitur: Stufen |
| 82289 / 82292 | s2Sum (vor/nach) | Zusammenfassen: Stufen je Takt und Stand der festen Spuren (mit trf) an die neue Marke – Prüfung |
| 82445 / 82458 | konDo (vor/nach) | Konsolidieren: dasselbe – Prüfung |
| 89263 | jam3LvAt | mit `song.trf`: Stand je Takt aus TRP1 (sonst unverändert JAM3) – Prüfung |
| 89713 | jam3FestL | mit `song.trf`: Treppe der festen Spuren aus TRP1 (sonst unverändert JAM3) – Prüfung |
| 91332 | tktModeDo | Dur ↔ Moll: die Stufen rechnen danach in der neuen Tonart – Prüfung |
| 90001–90404 | Block | Kern, Blatt, Guide, Test-API `SYNQUENZER.trp1` |

21 Haken-Zeilen, alle Ein-Zeiler mit `/* TRP1 */` und typeof-Schutz; ohne Block und Haken ist index.html zeilengleich mit basis.html (diff geprüft).
Größe 8 985 093 B gegen 8 952 219 B (+32,9 KB, +0,37 %).

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

## Prüfung (TRP1-P, 2026-11-15 04:28–05:00) – PRUEFUNG.md, Befunde 1–12
| # | Befund | Stand | Wie |
|---|---|---|---|
| 1 | ⇅-feste Spuren in Takten ohne Marke / Song ohne Marken | behoben | `song.trf` = [[Takt, Versatz]] nur in Takten ohne Marke, relativ zum Stand, den JAM3 dort sieht (Teil davor bzw. 0). `trp1Lv` rechnet jetzt den ganzen Song je Takt (Marken: rk/rkx, Lücken: trf). jam3LvAt/jam3FestL fragen TRP1 nur, wenn es trf gibt (sonst JAM3 unverändert). Laden, Takte einfügen/löschen, Leeren gehakt. Gemessen: Song ohne Marken MELODIE 4/4 +3, übrige 59 +3, Drums/übrige Takte gleich; Lücke nach „nur Teil 3“: MELODIE 4/4 wie vorher; spätere Rückung „ab hier“ nimmt die Lücke mit. |
| 2 | Zusammenfassen/Konsolidieren löscht Stufen | behoben | Haken vor/nach dem Schnitt in s2Sum und konDo: Stufen je Takt an die neue Marke. Gemischte Bereiche: `trs[3]` = [[Takt im Teil, Stufen, Grundton, Skala]] (wie rkx). Mit trf auch rk/rkx aus dem gemerkten Stand. Gemessen: 0/363 bzw. 0/375 Noten anders (Teil 3 allein, Bereich Teil 2+3, Lücke mit Versatz), Laden bitgleich. |
| 3 | ↶ während ▶: Rest bleibt transponiert | behoben | restoreSong-Haken ruft `jam3FtLive` + `gr1XpLive` (nur bei ▶ SONG). Wirkt auch für die vorhandene Rückung (Ursache lag in 4.68.0). Gemessen: ↶ bei Schlag 17,3 → Teil 4 31/31 wie Teil 2. |
| 4 | Dur↔Moll nach Stufen-Teil | behoben | tktModeDo-Haken: Stufen danach in der neuen Tonart. Gemessen: Teil 3 0/83 Töne außerhalb c-Moll (wie Teil 1); ↶ stellt ionian wieder her. |
| 5 | „nur dieser Teil“ bleibt dauerhaft an | behoben | Zustand nur am offenen Blatt dieser Marke (`p._trp1o`); Guide schaltet nur für sein Blatt. Andere Marken: gewohnte Zeile, Rückung +2 markiert. |
| 6 | Teil nach „nur“ zeigt −3, 0/+1 zerstören das Ergebnis | behoben (Blatt), offen (Taktleiste) | Die Marke danach merkt den Sprung (`mark.trn`). Passt er noch, rechnet die Rückungs-Zeile dort gegen vor dem „nur“-Teil: Kleinschrift „nach „nur““, 0 markiert und ohne Wirkung, +1 = Teil 4 absolut +1 (auch ⇅ fest). Passt er nicht mehr (Rückung am „nur“-Teil geändert, Teil verschoben), gilt die gewohnte Zeile. Die Taktleiste zeigt weiter „−3“ (gegen davor, Basis-Zeichnung) – ein eigenes Kennzeichen wäre sichtbar neu → im Funk vorschlagen. |
| 7 | Blatt „Transponieren“ springt beim Umschalten | behoben | Umschalten ruft `popFit` statt `popDock`: Blatt bleibt, wo es aufging (hochkant oben 255 → 255 px, quer 113 → 113, quer-370 84 → 84), im Bild, ✕ im Bild. Der 8-px-Überstand gedockter Basis-Blätter ist Basis (nicht angefasst). |
| 8 | Stufen über halbe Teile: Meldung nennt den Bereich | behoben | Meldung nennt die geänderten Teile mit Takt + „· in der Tonart nur ganze Teile“. |
| 9 | „in der Tonart“ gemerkt, Ablehnung klingt wie Erfolg | behoben | Blatt wählt „in der Tonart“ nur vor, wenn der Bereich einen ganzen Teil enthält; Ablehnung: „… – nichts geändert (hier gehen nur Halbtöne)“. |
| 10 | Leiterfremde Töne fallen zusammen (D♯/E → F) | offen (Entscheidung) | Ohne freien Halbton zwischen zwei Stufen (E–F, H–C in Dur) gibt es keinen eigenen Zielton: „Abstand zur Stufe darunter“ trifft die Stufe darüber, „Abstand zur Stufe darüber“ trifft die Stufe darunter. Eine verlustfreie Abbildung bräuchte Ziele außerhalb (D♯ → F♯) – musikalisch falsch. Bleibt so; nur Durchgangstöne betroffen. |
| 11 | Texte | behoben (TRP1), offen (Basis) | „Halbtöne“ an allen TRP1-Stellen; „danach wie vorher“ nicht beim letzten Teil; Blattkopf und Meldungen mit Takt („Szene 1 (Takt 5–6)“). Die 2 „Halbtone“ in JAM2 sind vorhandene Zeilen (Regel: nicht umschreiben) → eigenes kleines Paket. |
| 12 | Code im Hauptskript | offen (Hinweis) | Wie JAM2/JAM3/MTX3/SPK11; Auslagern in einen nachgeladenen Teil = eigener Schritt für alle diese Blöcke. |

Tests: trp1-test.mjs 81/81 (Teil 7 „Prüfung“ mit 17 neuen Punkten, Befunde 1–9, 11 gemessen, 3 Größen für Befund 7/9).
Regression (nacheinander, je basis 4.68.0 gegen index, Ordner reg/):
- JAM3-Test (w4530): basis 64/67, index 63/67 – dieselben 3 Fehler wie die Basis (alter 4.52-Testsong, 926×370-Zeilenhöhe); neu nur
  „alle Einhänge-Zeilen tragen JAM3“ (prüft gegen eine 4.68-Basis; die TRP1-Zeilen tragen TRP1) → erwartet.
- JAM2-Test (w4510): basis 104/105, index 103/105 – neu nur „Rückungs-Zeile hat genau 5 Tasten“ quer: TRP1 legt seit dem Bau ab hier │ nur
  dieser Teil │ Mehr ▾ in dieselbe Zeile (Blatt quer nicht höher); alle 8 Tasten ≥ 44 px → Test-Annahme, kein Rückschritt.
- Prüfer-Sonde pruef/pruef-daten.mjs nachher (reg/pruef-daten-nachher.json): Lücke MELODIE 4/4 + Rest 27/27 gleich; ohne Marken MELODIE 4/4
  und Rest 59/59 +3; s2Sum/konDo Stufen 0/103 bzw. 0/111 anders, trs bleibt; Dur→Moll 0 leiterfremd, trs aeolian; ZIP/Laden bitgleich;
  Matrix 0/78; trp1P 0,38 µs; trp1Set 64 Takte 0,7 / 1,3 ms; MIDI 0,76 ms.
- smoke: errors []. ↶ während ▶: 1,4–8,3 ms je ↶, trp1Live < 0,1 ms, 0 Long Tasks (eigene Messung, 3 Läufe).
Fotos: fotos/trp1p-blatt-{hochkant,quer,quer-370}.png (Blatt nach dem Umschalten), fotos/trp1p-nach-nur-hochkant.png, fotos/smoke-trp1p.png.

Offen (weiter): Funk-Ankündigung (Zeile „Wirkt …“ hochkant +48 px, ⋯-Eintrag, neu: Kleinschrift „nach „nur““ an der Marke nach einem „nur“-Teil);
Song-Aufnahme über einem Stufen-Teil und gehaltene Noten an der Teil-Grenze weiter ungemessen; Takte kopieren/einsetzen nimmt `song.trf` nicht mit
(eingesetzte Takte ohne Marke haben dann den Stand des Teils davor).
