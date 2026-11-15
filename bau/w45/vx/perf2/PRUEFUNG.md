# PERF2 – unabhängige Prüfung (Teil D `ausliefern.mjs`/`aus.html`, Teil E `index.html` Spektral-Code erst beim Öffnen)

Prüfer-Werkzeuge und Ergebnisse: `pr/` (nichts aus `e/` wiederverwendet; eigene Skripte, eigene Messung).
Geprüfte Dateien (sha256-Anfang): basis.html = rel-4700/index.html (md5 9aa77532…, unverändert), index.html `ff15576c9ef4a504`,
aus.html `9c39eb973243f6f0`, e/aus-e.html `a1b77b7cd37b141c`.

## Urteil
- **Semantik gleich: ja** (Teil D und Teil E). Keine Funktion, kein Klang-Weg, kein Speicher-/Lade-Weg ändert sich; alte Projekte und
  Container mit Spektral-Analysen gehen in beide Richtungen ohne Verlust (4.70 ↔ Kandidat). Aussehen pixelgleich.
- **Pflicht-Marken: alle grün** für index.html, aus.html und aus-e.html.
- **Gewinn real, aber für Teil E kleiner als berichtet.** Robust sind die längste Aufgabe (−360…−440 ms bei 4×), die Sperrzeit und
  −1 MB JS-Speicher. „Bereit“ wird bei mir nur ≈ −3 % schneller (−35 / −83 ms je Serie, gepaart Mittel −85 ms aus 12 Paaren),
  nicht −255 ms (−9 %). Teil D (aus.html) bringt −179 ms bis „bereit“. D und E zusammen (aus-e.html) ergeben −257 ms (−9,4 %) und
  die kürzeste längste Aufgabe.

## Befunde (nach Gewicht)
1. **Mittel – Zahl im Bericht zu hoch.** „bereit −255 ms (−9 %)“ (3 Paare) ist nicht reproduzierbar. Eigene Messung, Chromium 428×926,
   4×, Läufe abwechselnd: Serie 1 (5 Runden) 2 728 → 2 693 ms, Serie 2 (7 Runden) 2 974 → 2 891 ms; die Spannweiten überlappen
   (basis 2 610–3 657, index 2 494–3 331). Gepaart über 12 Runden: 7× schneller, 5× langsamer, Median −127 ms, Mittel −85 ms.
   Belastbar (in beiden Serien gleich): längste Aufgabe 1 317 → 880 / 1 367 → 1 009 ms, Sperrzeit 1 778 → 1 594 / 1 905 → 1 809 ms,
   JS-Heap 17,1 → 16,1 MB. Empfehlung: in NOTES/Funk „bereit ≈ −3 %, Start ruckelt deutlich weniger (längste Aufgabe −30 %)“; der
   große Schritt kommt erst mit Teil D dazu (aus-e: −257 ms).
2. **Klein – stiller Verlust nur im Fehlerfall.** Wenn `sq-spk-src` nicht lädt (z. B. Speicher knapp), läuft `spk1ZipAdd` trotzdem:
   `spk1Call` wirft ReferenceError, die alte Schleife fängt ihn mit `catch (er) { continue; }` → Container **ohne** Spektral-Daten,
   ohne Hinweis. `spk1ZipRead` schreibt in diesem Fall nur `logErr`. `spk1Open` zeigt dagegen einen Toast. Vorschlag (nur im Block
   SPKL, im Normalfall unsichtbar): in beiden Zip-Hüllen bei `!spkLoad()` denselben Toast wie bei `spk1Open` zeigen
   („Spektral-Analysen konnten nicht gesichert/gelesen werden“). Heute nicht auslösbar, weil der Block fehlerfrei lädt.
3. **Klein – Bericht ungenau:** spk7 ist gelaufen (`e/reg/reg.log` 10:41:41 `spk7 … ALLES OK (13)`), der Bericht nennt ihn „nicht gelaufen“.
   Die übrigen fünf habe ich nachgeholt (siehe Regression).
4. **Hinweis – Teil-D-Tabelle:** gzip der ganzen Datei 3 054 966 → 2 315 508 (Tabelle Teil D) gegenüber `gzip -6` hier
   3 042 282 → 2 298 440 (= Zahl in Teil E). Anderer Kompressor, gleiche Ersparnis (≈ −744 KB). Nur Schreibweise.
5. **Hinweis – künftiges Risiko der Getter:** `SYNQUENZER.spk1/.spk5` und `window.__spk/__spk6/__spk11/__spk12` sind aufzählbare Getter.
   Heute liest nur die Schleife Z 109854 alle Felder, und die steht davor. Jede künftige Schleife oder Hilfe, die nach SPKL alle Werte
   von `SYNQUENZER`/`window` liest, lädt den Block still beim Start und der Gewinn wäre weg, ohne dass ein Test rot wird. Vorschlag:
   `e/probe.mjs` (Prüfung `start-ohne-block`) fest in jede Release-Regression.
6. **Hinweis – Offen 1 bestätigt und unbedenklich:** aus-e.html ist gzip 2 350 810 statt 2 298 440 (+52 KB). Kommentare in `sq-spk-src`
   zu entfernen ist sicher: `blockLoad` liest nur `textContent`, kein Code sucht per Text darin, und die einzige Stelle, die
   Funktions-Text hasht (`clCoreVer` → `vsCleanMake`), liegt nicht im Block.
7. **Lücke dieser Prüfung:** Container mit SPK6-Ebenen (m*.bin, Ebenen-Audio über `spk6ZipAdd`) habe ich nicht selbst geprüft (meine
   Analyse hatte 0 Ebenen). Der Weg ist derselbe (Block lädt vor dem Aufruf, `typeof spk6ZipAdd` wird erst danach ausgewertet).

## Was geprüft wurde (alles nacheinander)
### Teil E – Semantik
- **Reines Verschieben** (`pr/vgl.cjs`): Block 6 682 Zeilen + Rest 103 986 Zeilen = alle 110 668 Zeilen von basis, in Reihenfolge,
  0 Abweichungen. Neu nur: 23 Zeilen SPKL, 5 Notiz-Zeilen `/* SPKL: … */`, 3 Zeilen Rahmen (110 699 gesamt).
- **Laufzeit-Fingerabdruck aller 7 664 obersten Namen** (`pr/laufzeit.mjs`, basis ↔ index, je Name Typ + Hash des Funktions-Quelltexts
  bzw. Objekt-Schlüssel/Array-Inhalt):
  - beim Start: genau die 410 Block-Namen fehlen; sonst gleich bis auf die gewollten SPKL/spkLoad/spkLazy, die 3 Hüllen
    (spk1Open/ZipAdd/ZipRead) und das Feld `SYNQUENZER.spkl`; Guide-Einträge gleich, alle Knöpfe im ≡-Menü gleich;
  - nach `spkLoad()`: **alle 7 664 Namen gleich** (auch SPK1_TOOLS, SPK1_API, die SPK11-Hülle um spk2KlRun) bis auf dieselben gewollten
    Unterschiede; `window`-Schlüssel gleich + spkLoad/spkLazy; 0 Konsolenfehler in beiden.
- **Zugriffe von außen** (`pr/zugriff.cjs`, acorn + eslint-scope, alle ausführbaren Skripte + die per blockLoad geladenen Blöcke):
  410 Block-Namen, 0 doppelt; 14 Anweisungen mit Seiteneffekt im Block (Test-Zugänge, Erweiterungen von SPK1_API, SPK1_TOOLS/ICON,
  SPK11-Hülle; alle nur auf Block-Objekte oder über die Getter); 77 Zugriffe von außen, **0 auf oberster Ebene beim Start**. Einordnung:
  onKeyDown (nur bei SPK1.open), KI1 (nur mit SPK1.doc/ui oder typeof), die drei Hüllen-Funktionen, SPK7-Bedienung (alle Funktionen
  mit `U = SPK1.ui`, `spk7Name`-Rückfall nur in der offenen Seite), typeof-geschützt (spk2Name, spk2MxOk, spk5KiOrder, spk5Run,
  spk6ZipAdd/ZipRead, spk6DspMake im Rechen-Worker). Keine aufgefangenen Verweise auf die alten spk1Open/Zip-Funktionen
  (überall Aufruf beim Namen).
- **Strikt-Modus:** Haupt-Skript und Block ohne Direktive (das `'use strict'` in Zeile 3 steht nach `const LOGO_SVG`) → beide locker, gleich.
- **Service-Worker/Update:** `sw.js` behandelt index.html als Ganzes (Netz zuerst, Kopie offline), Update über `version.json`. Der Block
  steckt in der Seite → kein zusätzlicher Abruf, offline gleich, Update-Weg unberührt. Kein Code liest die eigene HTML per Text.
- **Speichern/Laden alter Projekte** (`pr/kreuz.mjs`, ALLES OK 9/9): in 4.70 Analyse anlegen, verknüpfen, Projekt sichern → dieselbe
  Herkunft mit dem Kandidaten öffnen: `S.spk` und Projekt-JSON gleich **ohne** Laden des Blocks, Sichern lädt nicht, Container lädt
  vorher und schreibt `spektral/<id>/doc.json` + `p0.wav` **bytegleich** zu 4.70, alte Analyse öffnet sich; Container 4.70 → Kandidat
  (frischer Speicher) und Kandidat → 4.70 liefern die Analyse und `S.spk`; 0 Konsolenfehler.
- **Aussehen** (`pr/bild.mjs`, `pr/bild2.mjs`): Start und ≡-Menü 428×926 + 926×428, Spektral-Seite 428×926 + 926×370 → **0 Pixel**
  Unterschied (Fotos `pr/bild-*.png`).

### Teil D – ausliefern.mjs / aus.html
- **AST-Vergleich** (`pr/astvgl.cjs`, eigener Code): 24/24 Skripte AST gleich (mit raw-Texten), jede Knoten-Startzeile gleich;
  9/9 text/plain bytegleich; HTML außerhalb der Skripte/Stile gleich; CSS ohne Kommentare; 0 Kommentare in den Skripten;
  Zeilenzahl gleich (110 668).
- **Text-Anker:** einzige Laufzeit-Suchen in Quelltext (`/*MKW{*/`, `// V0d (A.4b 3)`) lesen `sq-worklet-src` (text/plain, unberührt).
  Einzige Hash-Stelle über Funktions-Text: `clCoreVer` → `vsCleanMake`; dessen Text ist in allen vier Dateien gleich
  (22 278 Zeichen, sha256 a41fe3b4…; die Funktion enthält gar keine Kommentare – der Schutz ist harmlos).
- Kleinigkeit: `const VERSION = 'g9a-1'` (Hilfs-Skript) steht in aus.html ohne Leerzeichen; nur die Haupt-VERSION-Zeile ist Schutz-Zeile.
  Kein Code sucht die Hilfs-Zeile per Text.

### Pflicht (`pr/pflicht.log`)
| Datei | topdefs | dupkeys | MS 2000 | `^  live: true,` | VERSION | Rauchtest |
|---|---|---|---|---|---|---|
| index.html | 26 Skripte, 7 382 Namen, 0 doppelt, 0 Syntax | 0 | 1× | 1× | '4.70.0' | errors [] |
| aus.html | 26 Skripte, 7 789 Namen, 0 doppelt, 0 Syntax | 0 | 1× | 1× | '4.70.0' | errors [] |
| e/aus-e.html | 26 Skripte, 7 382 Namen, 0 doppelt, 0 Syntax | 0 | 1× | 1× | '4.70.0' | errors [] |

### Messung (`pr/mess.mjs`, `pr/mess4.json`, `pr/mess4b.json`; Chromium 428×926, CPU 4×, Median, Läufe abwechselnd)
| ms ab Navigation | basis | index (E) | aus (D) | aus-e (D+E) |
|---|---:|---:|---:|---:|
| bereit – Serie 1 (5 Runden) | 2 728 | 2 693 | 2 549 | **2 471** |
| bereit – Serie 2 (7 Runden, nur basis/index) | 2 974 | 2 891 | – | – |
| domInteractive S1 / S2 | 2 222 / 2 312 | 2 055 / 2 315 | 1 977 | 1 914 |
| DOMContentLoaded S1 / S2 | 2 407 / 2 538 | 2 291 / 2 532 | 2 162 | 2 136 |
| längste Aufgabe bis bereit S1 / S2 | 1 317 / 1 367 | **880 / 1 009** | 1 131 | **877** |
| Sperrzeit bis bereit S1 / S2 | 1 778 / 1 905 | 1 594 / 1 809 | 1 630 | 1 452 |
| JS-Heap (MB) | 17,1 | 16,1 | 15,2 | 14,3 |
Größe gzip -6: basis 3 042 282, index 3 043 149, aus 2 298 440, aus-e 2 350 810 B.

### Regression (in Teil E nicht gelaufen, hier nachgeholt auf index.html, `pr/reg/reg.log`)
| Sonde | index.html (hier) | r4700 (vx/r4700) |
|---|---|---|
| spk7 | lief schon in Teil E: ALLES OK (13) (`e/reg/reg.log`) | – |
| spk12b | **ALLES OK 72 / 0** | 69 / 3 (nur Long-Task-Zeitgrenzen unter Volllast) |
| spk12c | **47 / 0** | 45 / 2 (nur Long-Task-Zeitgrenzen) |
| spk12d | **28 / 0** | 28 / 0 |
| spk6p | ALLES OK | ALLES OK |
| spk4 | 3 FEHLER von 23: pflicht (Test erwartet VERSION 4.60.0), a2-verfeinern-plus-1db (gleiche Werte), reg-ki1-test (dieselben bekannten Fehler) | 5 FEHLER: dieselben 3 + a3-nachbau-zeit und reg-spk3-test (Zeit unter Last) |
Damit sind alle Sonden aus `e/reg.sh` auf index.html gelaufen. Ergebnisse gleich wie r4700 oder besser, kein neuer Fehler.

## Werkzeuge (pr/)
pflicht.sh/.log · vgl.cjs · zugriff.cjs/.txt · fn.cjs · namen.cjs/.json · laufzeit.mjs/.json · astvgl.cjs · vsclean.cjs · strikt.cjs ·
mess.mjs, mess4.json, mess4b.json · kreuz.mjs/.json · bild.mjs, bild2.mjs, bild-*.png · reg.sh, reg/*.log · smoke-*.png

## Stand nach PERF2 F (Befunde behoben, 15.11. ab 11:24)
| Befund | Stand |
|---|---|
| 1 Zahl zu hoch | NOTES Teil-E-Tabelle berichtigt („≈ −3 %“), Funk-Satz neu (NOTES, Abschnitt PERF2 F); neue Messung `f/mess-f.json` |
| 2 stiller Verlust im Fehlerfall | behoben im Block SPKL (`e/spkl.js` → `e/bau.cjs`): `spkLHint` – Hinweis beim Sichern sofort, beim Öffnen nach 3,8 s; Probe `zip-fehlerfall-hinweis` (grün auf index/aus-f, rot auf dem alten Stand = Gegenprobe) |
| 3 spk7 „nicht gelaufen“ | NOTES berichtigt (ALLES OK 13); auf der Auslieferung aus-f erneut ALLES OK (13) |
| 4 gzip-Zahlen | NOTES Teil D auf `gzip -6` vereinheitlicht |
| 5 Getter-Risiko | `e/probe.mjs` ist Pflicht-Schritt in `freigabe.sh` (auf der Auslieferung) |
| 6 Offen 1 (+52 KB) | `ausliefern.mjs` behandelt `sq-spk-src` wie ein Skript (AST-Prüfung + Wächter „nur id + blockLoad“); aus-f gzip 2 299 184 B |
| 7 Lücke SPK6-Ebenen | Probe `spk6-ebenen-container`: mL1/mL2/aA1.bin über frische Seiten ohne Block, Render-Hash Mix + Ebene gleich |
