# QF1 – Querformat: Mess-Durchlauf vorher / nachher

Basis `../basis.html` (= 4.42.0) gegen Arbeitskopie `index.html`. Werkzeug: `mess/qf1-full.mjs` + `mess/qf1-lib.js`
(Aufruf `node mess/qf1-full.mjs <html> <out.json> [größen] [ansicht]`, Fotos mit `QF1_SHOTS=dir`). Rohdaten `mess/vor.json`, `mess/nach.json`,
Fotos der Befunde `mess/shots-vor/`, `mess/shots-nach/`.

**Was gemessen wird.** Je Größe (quer 926×428, 926×370, 844×390, 667×375; hochkant 428×926, 390×844) 236 Ansichten: jede Seite und
Unterseite des Synth-Editors für VA, FM, WT, FM2, MS 2000 (Platte GERÄT/SPIEL), North (Seite NORTH, North-Platte GERÄT/SPIEL), Bit Mask;
Drum-Editor mit Drums und mit North (Pad 1 und 8, alle Reiter/Unterreiter), North-Platte der Drum-Spur (GERÄT, SPIEL, jede Sektion im
Zoom); Clip-, Roll-, Quantisier- und Sound-Blatt; Song mit Teil-, Teil-Name-, Farb-, Marken-, Zellen-, Als-Teil-, Summen-, Block-,
Akkordzeilen- und Akkord-Blatt; Mix (Mix-Assistent, Auto-Master, Master-Seite); Menü ≡ (auch aufgeklappt) und seine Blätter (Video,
Online, Anmelden, Mikro-Check, Leistungs-Probe, Text, Verlauf); rund 45 Popups (Spur, Stop, FANG, Loop, Akkorde, Kette, BPM, Verlauf,
Mikro, Takes …, im Editor Mehr, Modulation, Sichern, Form, Algorithmus, FM-Fenster, North-Kit/-Programm, Euklid, Muster …).
Gemeldet wird jedes sichtbare Bedienelement/jeder Text, dessen Unterkante abgeschnitten ist **und** das man nicht per Finger erreicht:
`clip` = ein nicht rollender Rahmen oder der Schirm schneidet ab; `noscroll` = liegt in einer rollenden Fläche, die der Finger nicht
bewegen kann (touch-action oder ein Touch-Wächter schluckt den Wisch – geprüft mit einem echten `touchstart`). Dazu: ✕ der obersten
Ebene sichtbar und nicht verdeckt (vor und nach Rollen ans Ende), ob die App als Ganzes rollt, JS-Fehler.

## Ergebnis

| Größe | Ansichten | vorher: Ansichten mit Befund / Elemente (clip · noscroll) | nachher | ✕ fehlt/verdeckt v→n | App scrollt v→n | JS-Fehler v→n |
|---|---|---|---|---|---|---|
| 926x428 | 236 | 1 / 9 (0 · 9) | 0 / 0 (0 · 0) | 0 → 0 | 0 → 0 | 0 → 0 |
| 926x370 | 236 | 34 / 141 (124 · 17) | 0 / 0 (0 · 0) | 0 → 0 | 0 → 0 | 0 → 0 |
| 844x390 | 236 | 1 / 9 (0 · 9) | 0 / 0 (0 · 0) | 0 → 0 | 0 → 0 | 0 → 0 |
| 667x375 | 236 | 1 / 17 (0 · 17) | 0 / 0 (0 · 0) | 0 → 0 | 0 → 0 | 0 → 0 |
| 428x926 | 236 | 0 / 0 (0 · 0) | 0 / 0 (0 · 0) | 3 → 0 | 0 → 0 | 0 → 0 |
| 390x844 | 236 | 0 / 0 (0 · 0) | 0 / 0 (0 · 0) | 5 → 0 | 0 → 0 | 0 → 0 |


926×370 „34 Ansichten“ enthält 16-mal dieselbe Seite FX › MASTER unter einem geöffneten Editor-Popup; eindeutig sind es 18 Seiten
(FX › MASTER bei VA/FM/WT/FM2/North/BM, FM › FELD, Seite NORTH, Drum TIEF › TON/FM/RAUSCHEN/KLICK/AUSGANG für Pad 1 und 8).
Matrix und Song (Hauptansichten) sind in allen Größen ohne Befund und rollen weiterhin nicht senkrecht; die App rollt nirgends.

### Vorher – was genau abgeschnitten war

- **Seite NORTH der Perkussionsspur** (alle vier Quer-Größen): rollt seit 4.40.0 innen, aber der Touch-Wächter des Synth-Blatts
  schluckte jeden Wisch – auf dem iPhone kam man an die unteren Kanäle (HH, Toms, Becken, Perc, Shaker) nicht heran. Echter Touch-Test:
  Basis 0 px gerollt, jetzt 89 px.
- **FX › MASTER** (926×370, jede Klangerzeugung): AUTO-MASTER / MIX-ASSISTENT 3 px abgeschnitten (auch in fit3).
- **FM › FELD** (926×370): unterste Kachel-Reihe (Op 1/3) 8 px, Werte-Zeile Op 5/6 14 px abgeschnitten.
- **Drum TIEF** (926×370, alle Schichten): die Werte unter den Reglern 5 px abgeschnitten.
- **✕ hochkant** (428 und 390): Drums mit North auf SCHRITTE (auch Roll der Drum-Spur) – die Kopfzeile ist zu breit, ↷ und ✕ lagen
  rechts außerhalb des Bildes (428: ✕ bei x = 457–501).
- **✕ quer wandert** (nicht in der Tabelle, eigene Messung `mess/probe10.mjs`): das ✕ des Editors stand je nach Klang an anderer Stelle –
  926 px: VA x = 857, FM/WT/BM 882, North 714, Drums 684; 667 px: VA 577, FM 618, North 608. Die Regel „↶ ↷ ✕ am rechten Rand“ (§2.3)
  griff nicht mehr, sobald ⋯/Platte davor eingefügt wurden.

### Nachher



keine – 0 abgeschnittene, nicht erreichbare Elemente in allen Größen.


✕-Lage quer nachher: VA, FM, WT, North, Drums, BM: x = 880–882 (926 px), 621–625 (667 px); hochkant unverändert 376 (428 px).
MS 2000- und North-Platte: ✕ quer weiter links oben (Platten-Design, nicht angefasst – Vorschlag für den Funk).

### Wo es nachher innen rollt (nur dort, wo sonst etwas abgeschnitten wäre)



- **926x428**: synth:north(north):perc (pg.rest.percpg +36)
- **926x370**: synth:analog(analog):fx:master (sh-body.rest.fit1 +3); synth:fm6(fm6):osc:feld (fxv.scr +14); synth:fm6(fm6):fx:master (sh-body.rest.fit1 +3); synth:wt(wt):fx:master (sh-body.rest.fit1 +3); synth:fm2(fm2):fx:master (sh-body.rest.fit1 +3); synth:north(north):perc (pg.rest.percpg +94); synth:north(north):fx:master (sh-body.rest.fit1 +3); ndp-perc(true):geraet (sh-body.rest.fit1 +3); ndp-perc(true):spiel (sh-body.rest.fit1 +3); synth:bm(bm):fx:master (sh-body.rest.fit1 +3); drum:drum:pad1:tief:ton (sh-body.rest.fit1 +6); drum:drum:pad1:tief:fm (sh-body.rest.fit1 +6); drum:drum:pad1:tief:noise (sh-body.rest.fit1 +6); drum:drum:pad1:tief:click (sh-body.rest.fit1 +6); drum:drum:pad1:tief:out (sh-body.rest.fit1 +6); drum:drum:pad8:tief:ton (sh-body.rest.fit1 +6); drum:drum:pad8:tief:fm (sh-body.rest.fit1 +6); drum:drum:pad8:tief:noise (sh-body.rest.fit1 +6); drum:drum:pad8:tief:click (sh-body.rest.fit1 +6); drum:drum:pad8:tief:out (sh-body.rest.fit1 +6)
- **844x390**: synth:north(north):perc (pg.rest.percpg +74)
- **667x375**: synth:north(north):perc (pg.rest.percpg +89)
- **428x926**: nirgends
- **390x844**: nirgends

(+n = so viele Pixel lassen sich rollen; `ndp-perc`/`edpop:*` = dieselbe Master-Seite unter der Platte bzw. einem Popup.)
Hochkant rollt kein Editor-Körper; dort ändert sich nur die zu breite Drum-Kopfzeile (kurzer FOLGT-Chip, 4 px Abstand; bei Drums+North
bleibt das ✕ fest rechts, die Zeile davor wischt seitlich).

### ✕-Prüfung (oberste Ebene, vor und nach Rollen ans Ende)



- vorher 428x926: drum:md:pad1:steps, drum:md:pad8:steps, roll:drum
- vorher 390x844: drum:drum:pad1:steps, drum:drum:pad8:steps, drum:md:pad1:steps, drum:md:pad8:steps, roll:drum

- nachher: keine.

### Nicht geöffnet



clip:leer, menu:hilfe, song, song:platz, song:bereich, song:vorlage, pop:g4, pop:takes, pop:chor, pop:s1

(`song` ist die Hauptansicht, keine Ebene; Bereich/Platz/Vorlage, Chor/Takes/G4/S1 brauchen eine Auswahl bzw. eine Gesangsaufnahme,
`clip:leer` öffnet kein Blatt, `menu:hilfe` klappt im Menü auf. Sie laufen über dieselben Rahmen `.pop`/`.sheet`, die gemessen sind.)

### MS-Platte



Teile der Platte, die ihr Rahmen verdeckt (Platte unter der SPIEL-Ansicht oder die andere Hälfte, per Wischen/Zoom erreichbar): 926x428 synth:mk(mk):spiel, 926x370 synth:mk(mk):spiel, 844x390 synth:mk(mk):spiel, 667x375 synth:mk(mk):spiel, 428x926 synth:mk(mk):spiel, 390x844 synth:mk(mk):spiel

## Fotos

- FM › FELD 926×370 vorher / nachher: `mess/shots/feld-vor.png`, `mess/shots/feld-nach.png`
- Drum-Editor quer 926×428 (✕-Lage) vorher / nachher: `mess/shots/vor-drum-926x428.png`, `mess/shots/nach-drum-926x428.png`; North: `mess/shots/vor-north-926x428.png`, `mess/shots/nach-north-667x375.png`
- Hochkant Drums+North SCHRITTE vorher / nachher: `mess/shots-vor/vor-428x926-drum_md_pad1_steps.png`, `mess/shots/hd-428-md-steps.png`
- alle Befund-Fotos vorher: `mess/shots-vor/`

## Weitere Prüfungen

- Echter Finger-Wisch (CDP-Touch, `mess/touch1.mjs`, `mess/touch2.mjs`): Seite NORTH rollt (0 → 89 px), Drum TIEF rollt (0 → 6 px),
  ein Regler im rollenden Körper dreht bei senkrechtem Ziehen weiter (50 Hz → 144 Hz, Körper bleibt stehen), Seite rollt nie;
  hochkant Drums+North: Kopfzeile wischt seitlich (26 px), Tipp aufs feste ✕ schließt.
- Scroll-Stand bleibt beim Neuaufbau derselben Seite (`mess/keep1.mjs`: NORTH 60 px, TIEF 6 px bleiben; anderer Reiter beginnt oben).
- In den rollenden Seiten haben alle Elemente mit Ziehen `touch-action:none`; mit `touch-action:auto` gibt es dort nur Tipp-Tasten
  (`mess/probe9.mjs`, CDP-Listener-Abfrage).
- topdefs 0 Syntaxfehler / 0 doppelt; smoke errors []; Markenwörter 0, „MS 2000“ 1×, „  live: true,“ 1×.
