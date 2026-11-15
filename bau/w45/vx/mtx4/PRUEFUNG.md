# PRÜFUNG MTX4 „Mehrere Clips zugleich“ (Teil 1+2), 15.11.2026, 05:41–06:00

Ich habe unabhängig geprüft und nichts repariert. Geprüft wurde `index.html` gegen `basis.html` (4.68.0) und gegen Plan §5 P2 / §8 [K].

**Methode:**
- eigene Sonden in `pruef/` (`sonde.mjs` A–F, `sonde2` … `sonde6.mjs`)
- Touch über CDP in 428×926, 926×428 und 926×370, dazu Drehen im laufenden Modus
- Wiedergabe-Protokoll (`LOG`) in Achteln
- MIDI aus `buildMidi({mode:'song'})`, selbst ausgewertet
- Laden über `applyProject`, Container-ZIP über `tkZipBytes`/`tkImportZip`
- Leistung mit dichten Clips bei 1× und 4× CPU

Kopflos-Chromium auf einer geteilten VM (load 2–3). Alle Zeiten sind darum eher pessimistisch.

**Urteil:** Kern und Musik-Logik sind solide:
- ±, Stufe, Dorisch & Co., Quantisieren und Länge wirken richtig.
- „Am nächsten Takt“ hält, auch bei ▶ SONG.
- Speichern/Laden, ZIP und MIDI sind sauber.

**Nicht abnahmefähig ist die Bedienung des ↶ im Modus (Befund 1, schwer).** Dazu kommen 4 mittlere Befunde.

---

## Befunde

### 1 · schwer: ↶ ist im Modus per Touch nicht erreichbar, und ein Tipp darauf löst stattdessen einen Leisten-Knopf aus
Die Leiste (z-index 71) liegt über der Spur-Leiste und damit über dem ↶ der App (`#bUndo`), in allen 3 Größen. Der Toast „Rückgängig“, den `mtx4Run` nach jeder Aktion anbietet, liegt hochkant und in 926×370 ebenfalls unter der Leiste.

| Größe | Leiste | ↶ `#bUndo` | Tipp auf die Mitte von ↶ trifft | Toast-Knopf „Rückgängig“ |
|---|---|---|---|---|
| 428×926 | [0,510,428,610] | [376,513,420,557] | **✕**: „Auswahl beendet“, UNDO bleibt 1 | verdeckt, Mitte trifft die Zeile der Leiste |
| 926×428 | [627,86,926,282] | [884,235,925,279] | **Quant. ▾**: UNDO bleibt 1 | erreichbar [822,51,916,83] |
| 926×370 | [627,48,926,244] | [884,197,925,241] | **Quant. ▾**: UNDO bleibt 1 | verdeckt, Mitte trifft den Zähler |

**Fehltipp gemessen (Sonde A3, hochkant):** Ich habe +1 per Touch ausgelöst und danach per Touch auf „Rückgängig“ im Toast getippt. Die App meldete „**Länge ×2 · 3 Clips**“, danach standen 2 Schritte im ↶-Stapel statt 0. Der Wunsch „rückgängig“ führt also eine **weitere Änderung** aus.

**Weitere verdeckte Bedienelemente:**
- hochkant: KLANG, ✎, ⇅, M, AKKORD ▾, TRÄGER, LATCH, ORIGINAL
- quer: dieselben Elemente sowie „＋“ der rechten Spalte

NOTES.md und der Funk-Entwurf nennen nur „AKKORD/TRÄGER“. Der Bauer-Test ruft `undo()` nur per JavaScript auf und misst darum nicht, ob ↶ per Touch erreichbar ist. Die Abnahme „Ein ↶ macht alles rückgängig“ gilt per Touch nur in 926×428 über den Toast, solange er steht.

Vorschlag (nicht gebaut): ↶ und ↷ in die Leiste aufnehmen, oder das ↶ der Spur-Leiste frei lassen und den Toast über die Leiste legen. Weil das sichtbar ist, gehört es in den Funk-Vorschlag.

### 2 · mittel: Leistung, bei dichten Clips gibt es Long Tasks über 50 ms
Der Bauer hat mit Clips aus 8 Noten und 1 Takt gemessen (6–13 ms, 0 Long Tasks). Ich habe 64 Clips × 64 Noten (4 Takte, 4096 Noten) gewählt, bei laufender Wiedergabe.

| Lauf | Aktion | Rechenzeit (synchron) | Long Tasks danach |
|---|---|---|---|
| 1×, mit Song (64 Versionen) | +1 | 19–21 ms | 76 / 77 / 52 ms |
| 1×, mit Song | ×2 | 12–34 ms | 65 ms |
| 1×, mit Song | ↶ | 9 ms | 60 ms (in einem von zwei Läufen) |
| 1×, ohne Song | +1 | 27 ms | **183 ms** |
| 1×, ohne Song | ×2 | 48 ms | 52 + 103 ms |
| 4× (Grenzfall langsames Gerät) | alle Aktionen | 42–80 ms | bis 217 ms, Frames bis 283 ms |

Wofür die Zeit gebraucht wurde (Sonde 3, Funktionen umwickelt):
- `renderGrid` direkt nach der Aktion: bis 29–36 ms, weil die Vorschaubilder aller geänderten Clips neu gezeichnet werden
- `scheduleTrack` / `afterClipEdit`: Jeder laufende Clip wird neu geplant
- ×2/÷2 rufen `afterClipEdit` **doppelt** je Clip auf (128× bei 64 Clips: einmal in `clipLength`, einmal in `mtx4Run`)
- `cleanClip` + `JSON.stringify` laufen 2–3× je Clip

Die Vorgabe lautet „Hauptfaden ohne Long Task > 50 ms (schwere Rechnung im Worker, blockweise)“. Bei realistisch dichtem Material ist sie nicht erfüllt. Der Bauer hat in seinem eigenen Lauf 4 schon einmal 60 ms gesehen.

Vorschlag: blockweise (z. B. 8 Clips je Aufgabe), `afterClipEdit` nur einmal aufrufen und die Vorschaubilder gestaffelt zeichnen.

Im Dauerlauf mit Auswahl ist das Bild in Ordnung (siehe unten).

### 3 · mittel: Pentatonik verschiebt Töne, die schon in der Pentatonik liegen
Ich habe die C-Dur-Tonleiter C4–C5 `[60,62,64,65,67,69,71,72]` mit Tonart C-Dur (fest) auf Pentatonik eingepasst. Ergebnis: **`[57,60,62,64,67,69,72,74]`**.
- C→A, D→C, E→D, H→C′, C′→D′
- 5 von 8 Tönen ändern sich, obwohl C, D und E schon in C-Dur-Pentatonik liegen
- Der Umfang wächst von 12 auf 17 Halbtöne, der Lauf beginnt jetzt auf A statt auf C.

Zufallsprüfung mit 3 Grundtönen × 480 Noten: 65 / 96 / 69 Noten (14–20 %) springen um 3 Halbtöne oder mehr.

Ursache ist die injektive Ein-Skala-Abbildung („Doppel vermeiden“). Eine einfache Melodie wie E D C D E E E bleibt richtig, ein Cmaj7 ergibt C E G C′ (in Ordnung).

Musikalisch erwartet man: Leitereigene Töne bleiben stehen, fremde gehen zum Nachbarn, und dabei entstehende Doppel werden zusammengelegt. Die Plan-Abnahme „jede Note in der Leiter“ ist erfüllt, das Spielgefühl nicht. Der Bauer hat das unter „Offen“ nur als „anhören“ geführt.

### 4 · mittel: Automatische Versionen belegen die 8 Versionsplätze, danach geht das eigene ＋ nicht mehr
Sonde E: 9 Sitzungen auf Clip 0:0 (im Song) mit je „Quantisieren + 1“.
- Verlauf: `2 → 23 → 234 → … → 2345678`, ab der 8. Sitzung „Versionen voll (v8)“
- Danach liefert das manuelle ＋ im Song (`sx9Add`) `null` mit der Meldung „Höchstens 8 Versionen je Clip“.
- Jede Auswahl-Sitzung legt eine Version an, auch wenn nur quantisiert wurde.

Damit verdrängen automatische Sicherungen die bewusst angelegten Versionen („Refrain 2 mit anderem Bass“, SX9). Das hängt mit der offenen Entscheidung „alte Fassung = vN, Song spielt v1“ zusammen.

Vorschlag für den Funk: höchstens eine Auto-Version je Clip, die ersetzt wird; oder Auto-Versionen kennzeichnen bzw. aufräumen.

### 5 · mittel (Ablauf): Die sichtbare neue Bedienung ist gebaut, aber noch nicht im Funk vorgeschlagen
Plan P2 sagt „Funk: Vorschlag (neue Auswahl-Geste)“, CLAUDE.md Regel 3 sagt: vorher vorschlagen. Neu sichtbar sind:
- [Mehrere wählen]
- die Leiste
- der Szenen-Kopf im Modus
- die Auto-Versionen

Das Paket darf erst ausgeliefert werden, wenn Xander zugestimmt hat. Der Entwurf in NOTES.md ist zu korrigieren: Die Leiste deckt auch ↶, KLANG, ✎, ⇅, M, LATCH und ORIGINAL (Befund 1).

### 6 · leicht: ↷ (und ↶ nach dem Taktstrich) greifen sofort, mitten im Takt
- Sonde B2: ↷ bei Schlag 8,05, der nächste Takt beginnt bei 12, die erste 61 klingt schon bei **8,5**.
- Sonde C2 (▶ SONG): ↶ bei 11,92, Takt 16, die erste 60 klingt bei **12,5**.

Das ist der vorhandene `clipRestored`-Weg. Für eine Sammel-Transposition über mehrere Spuren heißt das aber: Die Tonart springt mitten im Takt, während die Aktion selbst sauber am Takt greift.

↶ **vor** dem Taktstrich ist sauber (B1: nie 61, 0 fehlende Achtel; B3: ÷2 + ↶, der 2. Takt bleibt 62).

### 7 · leicht: ÷2 bei ungerader Länge wirft mehr als die Hälfte weg
Sonde 6 mit einem 3-Takt-Clip (Töne 60, 64, 68 je Takt):
- ÷2 ergibt **1 Takt**, nur noch 60, die Meldung lautet nur „Länge ÷2“.
- ×2 danach ergibt 2 Takte statt 3.

Ursache ist `clipLength`: `floor(len/2)` (index.html:51756). Das ist das vorhandene Verhalten von ½ im Clip-Blatt, ↶ hilft. Vorschlag: ungerade Längen als „am Rand“ überspringen oder es in der Meldung sagen.

### 8 · leicht: Hochkant-Zeile 2 ist eng
- 8 Knöpfe zu je ≈ 46 px (gerade über 44)
- Das kleine Wort „Stufe“/„Länge“ ist **10,5 px** groß.
- Gemessen ist alles im Bild, und es verdeckt keine Zelle (0 Zellen).

Ich empfehle, das am iPhone anzusehen, wie der Bauer schon notiert hat.

### 9 · leicht: Die Versionen decken die Plan-Zeile „Alle Änderungen erzeugen neue Clip-Versionen“ nur teilweise ab
- Clips, die nicht im Song spielen, bekommen keine Version. Das passt zu SX9, das Versionen nur im Song kennt, sollte aber im Funk so gesagt werden.
- Spielt ein Clip im Song nur als v2, legt eine Änderung an v1 trotzdem eine neue Version an (Code-Lesung `mtx4InSong` → `sx9At`, das jede Version als „im Song“ zählt).

### 10 · leicht: Der Hinweis-Toast deckt hochkant die Szenen-Köpfe 1–3 ab
Der Toast „n Clips gewählt – weitere antippen“ liegt bei [107,58,321,109], Szenen-Kopf 1 bei [117,56,180,100].
- Er hat `pointer-events: none`. Ein Tipp auf den Kopf darunter wirkt also (gemessen: Szene 1 wurde dazugenommen).
- Nur die Szenen-Nummern und Tonarten sind nach jedem Tipp etwa 2 s nicht zu sehen.

---

## Nachgemessen und in Ordnung (Plan §5 P2 + Allgemeine Abnahme)

| Punkt | Meine Messung |
|---|---|
| 3 Clips in 2 Szenen, +1 per Touch, Rest bit-gleich | Änderung per Touch bestätigt (A3). Der Bauer-Test (45 Clips bit-gleich) ist plausibel, die diff-Struktur habe ich geprüft. |
| Ein ↶ (Daten) | Ein Gruppen-Schritt `clip,clip,clip,song` (C1: `clip,song`). `undoRedoCheck` = true (B). **Per Touch siehe Befund 1.** |
| Dorisch auf C-Dur-Clip | Zufallsprüfung mit 3 Grundtönen × 6 Modi × 480 Noten: **0** Noten außerhalb der Leiter. Tonleiter-Lauf C→C-Dorisch: E♭ und B, sonst gleich. Phrygisch: D♭ E♭ A♭ B. |
| Bild ≤ 16 ms (8×8 mit Auswahl) | Dauerlauf mit 64 dichten Clips gewählt: `renderGrid` Median 0,8 ms, Maximum 2,7 ms. Ohne Auswahl 0,3 / 0,9 ms. Nur direkt nach einer Aktion bis 36 ms (Befund 2). |
| Am nächsten Takt, nichts stockt | B1, B3, B4 und C1: in allen Fenstern **0** fehlende oder doppelte Achtel. Unter ▶ SONG: +1 greift bei Takt 8, v2 wird angelegt, der Song läuft weiter. |
| Speichern/Laden | Echt über `applyProject`: einziger Unterschied `song.loop.b 0→1`, weil der Test-Song über `songEdit` nicht normalisiert war (gleiches Artefakt wie beim Bauer). MIDI nach dem Laden identisch. |
| Container-ZIP | `tkZipBytes` → `tkImportZip` → `serialize`: **identisch**, `song.own` (Versionen) identisch. |
| MIDI-Export | Spur 0 und 1: alle Noten +1 (32 bzw. 64 Noten), Spur 2 unverändert. `song.xp` +2 ab Takt 4 bleibt. „Überall v2“ ergibt wieder exakt die alten MIDI-Noten. |
| Zusammenspiel Rückung/Teil-Transposition | `song.xp` (Daten der Rückung) wirkt im MIDI weiter über den Clip-Änderungen (siehe oben). TRP1 ist in 4.68 noch nicht enthalten. |
| Zusammenspiel Matrix-Gesten | Im Modus starten Tipps nichts, Halten und Ziehen sind gesperrt. Nach ✕ öffnet Halten wieder das Clip-Blatt (A6). Szenen-Kopf und Szenen-Blättern funktionieren. |
| Zusammenspiel Spektral-Werkzeuge | Code-Lesung SPK11 „Spektral → Szenen“: Audio-Clips (`imp1Clip`, Spur Original) sind ausgeschlossen, MIDI-Clips sind normale Noten-Clips und wählbar. Nicht live mit Audio geprüft. |
| Drehen im Modus | 428×926 → 926×428 → 926×370 → 428×926: Leiste je ganz im Bild, alle Knöpfe ≥ 44 px, 0 Zellen verdeckt, Lage P/L wechselt richtig. |
| Guide | Eintrag „Mehrere Clips zugleich (…, Länge)“ ist vorhanden (Bauer-Test, Code bestätigt). |

## Pflichtprüfungen (selbst ausgeführt)
- **topdefs:** Skripte 26, doppelt 0, Syntaxfehler 0 (mit `NODE_PATH=/opt/node-tools/node_modules`)
- **dupkeys:** 0
- **smoke:** `errors []` (`pruef/smoke-pruef.png`)
- „MS 2000“ 1×, „^  live: true,“ 1×, VERSION 4.68.0 in beiden Dateien
- **diff basis → index:** 0 entfernte Zeilen, nur 3 Haken und der Block
- `block.js` ist identisch mit dem Block.
- Keine Marken- oder Produktnamen im Block. ✕ und ♭ stehen nur als Schriftzeichen, nicht als Emoji-Grafik.
- Konsole in allen Sonden ohne Fehler.

## Dateien
- Sonden: `pruef/sonde.mjs` (A Touch/Drehen, B ↶↷ im Lauf, C ▶ SONG, D Laden/MIDI, E Versionen voll, F Leistung), `pruef/sonde2.mjs` (↶ erreichbar, 3 Größen + Basis), `pruef/sonde3.mjs` (Ursachen der Long Tasks), `pruef/sonde4.mjs` (ZIP, Einpassen-Zufall, Bild im Dauerlauf), `pruef/sonde5.mjs` (Pentatonik-Lauf), `pruef/sonde6.mjs` (÷2 bei 3 Takten)
- Ergebnisse: `pruef/sonde-ergebnis.json` enthält nur den letzten Lauf (F). Die Zahlen aus A–E und den Sonden 2–6 stehen in diesem Bericht und lassen sich mit `node pruef/sonde.mjs <index.html> <ordner> A,B,C,D,E` neu erzeugen.
- Fotos: `pruef/pruef-undo-428x926.png`, `-926x428.png`, `-926x370.png`, `pruef/pruef-926x370-gedreht.png`
