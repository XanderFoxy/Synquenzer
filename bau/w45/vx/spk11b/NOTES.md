# SPK11B – Szenen: Drum-Kit + Bass-Trennreste · NOTES

Paket: `index.html` = 4.69.0 (rel-4690) + Block `/* SPK11B-BEGIN */ … /* SPK11B-END */` direkt nach `/* SPK11-END */` + ein Haken
(Ein-Zeiler mit typeof-Schutz) in `spk11Go` direkt nach der Still-Regel:
`if (typeof spk11bStill === 'function') spk11bStill(U, rows, parts, g, A0);   /* SPK11B */`. Keine vorhandene Zeile geändert.
Hüllen im Block (wie SPK11 um spk2KlRun): `spk11Go` (Zusammenhang während des Anlegens), `spk11Render` (merkt Renderings; zur Drum-Ebene
wird die Bass-Ebene mitgerechnet und später für die Bass-Zeile wiederverwendet – nichts doppelt), `spk11Hits` → `spk11bHits`.
Aussehen/Bedienung/Texte unverändert. Test-Zugang `window.__spk11b` (last, hits, spec).

## (1) Drums → Kit (spk11bHits)
- Bänder und Einsatz-Maß wie SPK11 (tief < 150 Hz, Mitte, hoch > 5 kHz; 5 ms; normiert am 97-%-Wert).
- **Vorlagen aus dem Lied** (spk11bSplit: zwei Häufungen, Otsu auf log-Werten, nur bei klarer Trennung): Kick-Schwelle aus den Tiefen-Einsätzen
  (Kick ~0,9 gegen Snare-/Bass-Reste ~0,3), Snare-Schwelle aus den Höhen-Einsätzen, zweistufig (leise/laute Hi-Hats, darüber die Snare).
  Snare braucht Körper (Tiefen oder Mitten ≥ 0,12). Ohne klare Trennung die alten festen Werte.
- ~~Bass-Ebene als Gegenreferenz~~ (Nachbesserung B6: im Ablauf abgeschaltet – auf 7 Liedern ohne Wirkung; der Parameter `ref.bass` von
  spk11bHits bleibt für Messungen).
- **Anschlag**: Kick braucht Einsatz auch in den Mitten (≥ 0,9× tief) – die Schwebung Kick+Bass 1/16 danach ist nur tief. An Snare-Stellen
  nur ein Kick aus der Kick-Häufung (≥ 0,65× deren Mittel). Abklingform: < 0,6 nach 100 ms (Kick-Häufung ausgenommen).
- **Wiederholung je Takt**: ein schwacher Tiefen-Einsatz (≥ 0,6× untere Schwelle, Anschlag, nicht Snare) zählt, wenn in den ±4 Takten an
  derselben Stelle meist (≥ 60 %) ein Kick ist (Synkopen im dichten Groove).
- Mitten-Snare-Regel nur noch bei Mitten > 0,35 und Tiefen unter der Kick-Schwelle (sonst wurden mittenreiche Kicks zu Snares).
- Leiser Drum-Teil (Pegel-Regel „still“) bleibt, wenn seine Schläge ein Muster bilden (≥ 2 je Takt, ≥ 70 % auf Stellen, die in ≥ der Hälfte
  der Takte wiederkehren) – Intro/Outro mit leiser Hi-Hat im Prüferlied.

## (2) Bass-Trennreste (spk11bStill, nur Ebenen der Art Bass)
Spektrum der Bass-Ebene < 600 Hz (≈ 11 kHz, 2048 Punkte, Sprung 1024), nur Rahmen ganz im Teil. Grundton-Bereich = unteres halbes
Energie-Spektrum (2–50 %) des lautesten nicht stillen Teils. Ein Teil ist Trennrest → still (keine Notensuche, kein MIDI-, kein Audio-Clip), wenn
  gesamt ≤ −8 dB unter dem lautesten Teil UND Grundton-Bereich ≤ −30 dB UND Mindestdauer nicht erreicht (< 35 % der Rahmen über −30 dB).
Gemessen (dB Grundton-Bereich / Anteil Rahmen): Prüferlied Intro −77/0, Outro −77/0 → still; leises echtes Intro (−11 dB gesamt) −16/0,59 → bleibt;
Trennrest-Outro −74/0 → still. Warum nicht einfacher: Pegel allein trennt nicht (Rest −34 dBFS, echtes Intro −32 dBFS); Dominanz gegen
„Original minus Ebene“ trennt nicht (Trennrest liegt allein in seinen Frequenzen, 0,99).
Nachbesserung B1: zusätzlich **Abstand band − ges ≤ −15 dB** (der Grundton-Bereich fehlt auch gegenüber dem eigenen Pegel des Teils).
Grenze (bewusst): ein echtes leises Intro, das ≥ 8 dB leiser ist UND fast nur oberhalb des Grundton-Bereichs des lautesten Teils spielt
(z. B. eine Oktave höher), gilt weiter als Rest. Im selben Register bleibt jedes echte Intro bis zur Basis-Still-Regel (−26 dB).

## Treffer vorher → nachher (Szenen anlegen per Touch, 428×926; Wahrheit ±50 ms)
| Lied | Kick | Snare | Hi-Hat | Bass ohne Bass in der Wahrheit |
|---|---|---|---|---|
| Bauer (spk11-test) | 63/64 +26 → 63/64 +0 | 42/64 +1 → 63/64 +0 | – | – |
| Prüferlied | 75/80 +14 → 80/80 +0 | 64/64 +5 → 64/64 +0 | 247/288 → 288/288 | Intro 10, Outro 10 → 0, 0 |
| dicht (neu) | 111/119 +10 → 117/119 +0 | 48/48 +7 → 48/48 +2 | 238/380 → 373/380 | – |
| intro (neu) | 32/32 +8 → 32/32 +0 | 32/32 +4 → 32/32 +0 | 136/144 → 144/144 | Outro 7 → 0; echtes Intro 14/12 bleibt |
Offline auf den Ebenen (work/eval.mjs, alle 4 Lieder): Kick 95,9 % +19,9 % → 98,3 % +0 % · Snare 89,4 % +7,2 % → 99,5 % +1,0 % · HH 80,8 % → 98,8 %.

## Tests
- `spk11b-test.mjs` (neu): 9 OK / 0 FEHLER auf index.html; basis.html 4 OK / 5 FEHLER (work/spk11b-test-basis.out).
- `spk11-test.mjs` (Kopie): 41 OK / 0 FEHLER, alle drei Größen (vorher 38/3, drums-auf-kit).
- Pflicht: topdefs 26 Skripte / 0 doppelt / 0 Syntax · dupkeys 0 · smoke errors [] · „MS 2000“ 1× · „live: true,“ 1× · VERSION 4.69.0.

## Offen / Beobachtet (nicht SPK11B)
- IMP1-Teile: im dichten 4/4-Kick-Groove liegt die „1“ einen Schlag daneben (off 1,02 statt 0,50) und die Namen sind schief
  („Refrain 1 | Bridge | Refrain 2“ für S8 R8 S8, ebenso Intro/Outro im Lied „intro“) – Erkennung/Namensregel des Imports, eigener Auftrag.
- Bass-Noten in den Teilen selbst (Oktavfehler 3–4 je Strophe im Prüferlied) unverändert – Notenerkennung der Ebene.

## Nachbesserung nach PRUEFUNG.md (B1–B8, Nummern wie dort)
Gleicher Block `/* SPK11B-BEGIN … END */` (175 Zeilen) + derselbe eine Haken; Diff gegen basis.html nur Zusätze (176 +, 0 −). Aussehen,
Bedienung, Texte unverändert. Prüfstand vor der Nachbesserung: work/index.v1.html.

| Befund | Änderung | Wirkung (gemessen) |
|---|---|---|
| B1 leises echtes Bass-Intro gelöscht | Trennrest nur noch, wenn zusätzlich `band − ges ≤ −15 dB` (Grundton-Bereich fehlt auch gegenüber dem eigenen Pegel) | p80-Intro: Abstand −7,9 dB → bleibt bei +0/+3/+6/+10 dB (work/introsweep2.out); alle Trennreste (−25 … −98 dB Abstand) weiter still; per Touch p80 Intro `rest: false`, Notensuche läuft (1/8 Noten = Notenerkennung, wie basis) |
| B2 Zusatz-Kicks 1/16 nach dem Kick (Sub-Bass) | „Ausklang“: Schritt direkt nach einem Kick ohne eigenen Mitten-Anschlag (< 0,9× tief) und < 0,8× so stark ist kein Kick – auch nicht über die Kick-Häufung (`strong`) | offline wahres Raster: p174 +16 → +1, p128 +3 → +0; Paket-Lieder unverändert (Kick 98,3 % +0 %) |
| B3 leise 16tel-Hats im Ausklang | zweites Höhen-Maß: Pegel minus fortgeschriebenes Abklingen davor (`Q` in spk11bEnv), gleiche Schwelle 0,12 | p128 HH 170 → 186/384 (offline, ohne Intro-Anteil), p174 285 → 287, dicht 374 → 375, nirgends Zusatz. Tiefer als 0,12 kommen Ghost-Snares/Ausklang als Hi-Hat (0,08: p174 +18) → **bleibt teilweise offen** |
| B4 ganzes Intro −22 dB ohne Drum-Treffer | leiser Abschnitt (≥ 2 Takte, −12 … −26 dB) mit gleich viel leiseren Bändern (Einsätze je Band innerhalb 6 dB) wird mit den Vorlagen des ganzen Lieds, um den Pegel verschoben, neu gesucht; Kick dort nur aus der Kick-Häufung; gilt nur mit Muster (≥ 2/Takt, ≥ 70 % wiederkehrend, ≥ 1 Höhen-Schlag/Takt) | p128 Kick 80 → 96/96 +0, Snare 40 → 48/48, HH → 219/384; Phantome 0 (Paket-Lied intro: Kandidat −15/−18/−45 dB abgelehnt, work/leise.out). Zwei verworfene Fassungen: ohne Band-Gleichheit +10/+8/+10 Phantome im Paket-Lied intro; mit eigener Normierung und eigenen Schwellen im Abschnitt +8/+9 Kicks (Intro-Bass liegt dort in der Drum-Ebene) |
| B5 Ghost-Notes | nichts (Info: keine Falschnoten) | – |
| B6 Aufwand Gegenreferenz | Bass-Ebene als Gegenreferenz aus dem Ablauf genommen (auf 7 Liedern ohne jede Wirkung): kein Zusatz-Rendern, kein Zwischenspeicher, keine ~42 MB je 4 min | spk11bHits offline (Endstand, mit B3/B4) p80 27,1 → 18,7 ms, p128 18,6 → 14,4 ms, p174 30,4 → 14,2 ms (basis 13,0/11,2/13,5 ms; Median 5, unter Last) |
| B7 Haupt-Faden | `spk11bSpecA`: Spektrum in Stücken (~10 ms, Freigabe über MessageChannel wie vvYield) | Werte gleich (Abweichung 0, work/specA.out); längstes Stück 15–32 ms statt 53–98 ms am Stück |
| B8 kosmetisch | Kommentar über spk11bFft richtig; `tK2 = 0.3` fest und benannt; Band-Angabe in `SPK11B.last.band[Zeile]` (JSON-fähig), diag je Teil mit `abst` | – |

Nicht SPK11B (unverändert, wie Prüfer): Tempo 174 → 87, Teilnamen, Bass-Oktavfehler, Intro-Bass, den das Zerlegen nicht in die Bass-Ebene legt.
Grenzen: B4 greift nicht, wenn das Intro anders klingt (z. B. gefiltert: Bänder nicht gleich leiser); eine echte Doppel-Kick 1/16 nach dem
Kick ohne eigenen Anschlag in den Mitten fiele unter B2 (in keinem der 7 Lieder).

### Treffer per Touch nach der Nachbesserung (Prüfer-Lieder, 428×926, Wahrheit ±50 ms; basis → Prüfstand → jetzt)
| Lied | Kick | Snare | Hi-Hat | Bass |
|---|---|---|---|---|
| p80 | 46/64 +0 → 64/64 +0 → **64/64 +0** | 32/32 +21 → 32/32 +0 → **32/32 +0** | 218 → 248 → **248/248** | Intro: 1/8 → still (B1) → **bleibt, 1/8** |
| p128 | 47/96 +17 → 80/96 +3 → **96/96 +0** | 40/48 +12 → 40/48 +1 → **48/48 +1** | 153 → 167 → **217/384** | Outro ohne Bass: 12 → 0 → **0** |
| p174 (87 BPM) | 67/71 +4 → 71/71 +0 → **71/71 +0** | 72/72 +6 → 71/72 +0 → **71/72 +0** | 240 → 283 → **286/286** | wie basis (Tempo 87, Teile gemischt) |
Paket-Lieder per Touch unverändert (dicht 117/119 +0 · 48/48 +2 · 374/380; intro und pruef 100 %).

## Tests (Nachbesserung)
- `spk11b-test.mjs` erweitert (+ p80, p128, p174 aus lieder-pruef.mjs): **17 OK / 0 FEHLER** (spk11b-test.out). Alter Stand work/spk11b-test.v1.*.
- `spk11-test.mjs` alle drei Größen **41 OK / 0 FEHLER** · spk6-test **ALLES OK** · spk8-seite **14 OK / 0 FEHLER** (braucht mess/, Kopie von spk11/mess) · smoke errors [].
- Pflicht: topdefs 26 Skripte / 7615 Namen / 0 doppelt / 0 Syntax · dupkeys 0 · „MS 2000“ 1× · „  live: true,“ 1× · VERSION = basis (4.69.0) · basis.html = rel-4690 · keine Emojis/Marken im Block.
