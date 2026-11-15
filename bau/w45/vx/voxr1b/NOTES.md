# VOXR1B – VOX-R1 auf Basis 4.70.0 + Plopp-Abnahme (15.11.2026)

## Übernahme
- basis.html = Kandidat 4.70.0 (rel-4700/index.html). index.html = `git merge-file -p basis.html rel-4680/index.html vx/voxr1/index.html`:
  **konfliktfrei** (0 Konflikte). Größe = 4.70.0 + genau der VOXR1-Anteil (91 506 Byte) vor den Änderungen unten.
- Außerhalb Block VOXR1-BEGIN…END + 7 Haken-Zeilen `/* VOXR1 */` ist index.html gleich basis.html (geprüft).
- Alle neuen Änderungen nur im Block (Kern `vr1Make`), jeweils mit Kommentar `VOXR1B`. Kein neues Aussehen, keine neue Bedienung.

## Plopps – was geändert wurde
1. **Erkennung** (`plopFind`): Bezug ist jetzt das Tiefband < 70 Hz selbst (Median 250–30 ms davor und 100–300 ms danach, das größere),
   nicht mehr das Verhältnis zu 300–3000 Hz. Das Verhältnis sprang neben Pausen (dort fehlt die Mitte) und verdeckte 4 von 10 Stößen.
   Schwelle: Anstieg ≥ 15 dB (Empfindlichkeit 8), Stoß trägt ≥ −10 dB der Energie, ≥ Spitze − 20 dB. Lücken ≤ 25 ms = ein Stoß.
   Ränder ≤ 5 ms nachgezogen, solange das Tiefband ≥ 6 dB über dem Bezug liegt (`c0/c1` = Kern, `s0/s1` = mit Rand).
2. **Reparatur** (`plop` + neu `plopSin`): Grenze fest 250 Hz (statt unter dem Grundton ≥ 120 Hz – dort blieben ~10 % des Stoßes
   oberhalb der Grenze, Abzug höchstens ≈ 10 dB). Das Tiefband über dem Stoß wird aus **Teiltönen** neu gebaut: Grundton + Obertöne unter
   der Grenze, je Seite 25 ms per kleinsten Fehlerquadraten gemessen, Frequenz und Stärke linear, Phase kubisch von Rand zu Rand;
   eine Seite ohne Ton → nur 5 ms ein-/ausklingen (kein Vor-Echo). Die AR-Interpolation ließ den Ton in 50-ms-Lücken abklingen
   (Obertöne bis −7 dB). AR bleibt wählbar (`{ar: 1}`), alte Grenze mit `{fix: 0}`. Rand der Lücke 10 ms. Band über 250 Hz bitgleich.

## Die 11 (jetzt 13) fraglichen Funde im sauberen Take A – Ergebnis: echte Tiefstöße, keine Fehlalarme
Nachweis `plopp-wahrheit.mjs` → `plopp-wahrheit.json`:
- 12 von 13 Funden liegen in Rahmen ohne Grundton (Annotation des Takes), 11 von 13 liegen **13–34 ms vor einem annotierten
  Noten-Einsatz** (Lage eines Verschlusslauts b/p/d vor dem Stimmeinsatz); 1 × 24 ms nach einem Einsatz, 1 × 207 ms davor.
- Im Fund trägt das Band < 70 Hz −1 … −7 dB der Gesamtenergie (40–65 ms), obwohl der tiefste annotierte Grundton 107 Hz ist –
  dort kann keine Stimme liegen.
- **Gegenprobe:** Take A nullphasig ohne < 70 Hz (Stimmband 100 Hz–4 kHz ändert sich −0,01 dB) → **0 Funde**. Jeder Fund wird also
  allein vom Tiefband < 70 Hz ausgelöst, kein Stimmeinsatz und kein Konsonant löst ihn aus.
- **Wahrheit nur aus eingesetzten Stößen** (Take A ohne < 70 Hz + 10 Stöße wie im Test): **10/10 gefunden, 0 Fehlalarme**.
  Bei −6 dB Stoßpegel 5/10, ab −12 dB 0/10 (immer 0 Fehlalarme). Takes B und C: 0 Funde.
- Test-Wahrheit daher: eingesetzte Stöße + eigene Tiefstöße von Take A (verschwinden ohne < 70 Hz und liegen stimmlos bzw. ≤ 40 ms vor
  einem Noten-Einsatz). Prüfen zählt 23 = 10 + 13.

## Messwerte (voxr1-test.mjs auf index.html, 76/83)
| Messung | vorher (voxr1) | jetzt | Ziel |
|---|---|---|---|
| Plopps gefunden / Fehlalarme (Take A roh) | 6/10, 11 fraglich | **10/10, 0** (13 eigene Tiefstöße als Wahrheit) | ≥ 9, 0 |
| Plopps in Take A ohne < 70 Hz | – | **10/10, 0 Fehlalarme** | ≥ 9, 0 |
| Abzug je Stoß (Band < 250 Hz) | 9–13 dB (gefundene) | 24,1 · **5,9** · 23,2 · 16,8 · 22,2 · 15,8 · 13,1 · 14,0 · 22,2 · 23,5 | ≥ 12 |
| Obertöne an den Stellen (Summe) | bis 3,7 dB | 0,25 · **−2,28** · −0,05 · −0,45 · 0,07 · −0,20 · −0,48 · **−2,19** · −0,14 · −0,10 | ≤ 1 |
| Saubere Takes B/C Plopps | 0 / 0 | 0 / 0 | 0 |
| Klicks A gefunden / Überstand A, B | 16 / 7,5, 3,2 dB | unverändert | ≥ 18 / ≤ 3 |
| Raumton Pegel / Klangfarbe | 2/5 bzw. 3/5 außerhalb | unverändert | ±3 / ±4 dB |

## Offen
1. **Plopps an 2 von 10 Stellen** (3,85 s und 21,94 s, Grundton gleitet in 70 ms um 10–15 %): Obertöne −2,2 dB, an 3,85 s Abzug 5,9 dB.
   Ursache: die lineare Frequenz zwischen den Rändern trifft den Tonverlauf nicht. Nächster Schritt: Phase des Grundtons in der Lücke
   aus dem 2. Oberton im (unberührten) Band über 250 Hz verfolgen statt linear raten. Die Werte schwanken stark mit Rand und
   Messfenster (6–8 von 10) – das jetzige Setting ist das beste der Messreihe.
2. **Klicks** (laute tiefe Vokale, Take A 16/20, Überstand 7,5 / 3,2 dB): nicht bearbeitet (Zeit).
3. **Raumton** (5 Lücken): ein Versuch (Leistungsmittel statt Median, Klangfarbe aus einzelnen 10-ms-Rahmen) brachte nichts
   (−1,3/−2,9/−4,7/−1,1/−0,7 dB) und wurde zurückgenommen. Die Nachbarn sind leiser/dumpfer als der Raumton, der vorher in der Lücke lag;
   Raumton aus anderen Pausen des Takes ist noch nicht gebaut.
4. Funk-Vorschlag für die sichtbar neue Zeile „Gesang reinigen“ steht weiter aus (aus VOXR1).
