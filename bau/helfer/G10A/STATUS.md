# G10a – Stand

**Automatische Tests grün, aber erst fertig, wenn Xander auf dem iPhone sein Okay gibt.** Basis 4.30.0, VERSION unverändert.

## Testergebnisse (`tests/alle.sh`, Chromium + Fake-Mikro)
| Test | Ergebnis | Kern |
|---|---|---|
| statisch | grün | 1× `live: true`, verbotene Wörter 0, „MS 2000“ 1×, VERSION 4.30.0, Format 5 |
| G10-01 Hörmuschel | 12/12 | −31 dB → `ear`, „Hörmuschel?“ + Hinweis; Neustart behält `ear`; −12 dB / Kabel → kein `ear`; Blatt in 428×926, 926×428, 428×650 nicht abgeschnitten |
| G10-02 Erster Durchgang | 17/17 | 8 Takte → `song.vox` Takt 1–8 (16,0 s), ein Undo (Spur + Take + Song), ↶/↷, Laden deep-equal, Take enthält Gesang; Abbruch → kein Take; ohne 🎤 wie bisher |
| G10-03 Pegel | 21/21 | Korrelation Balken ↔ Mikro-RMS **0,996**, 14,6 Bilder/s, Kosten p95 **0,1 ms**, nur `transform`, Übersteuern rot; deckt die Noten-Fläche exakt in 3 Größen |
| G10-04 Wort über dem Ende | 15/15 | echter Weg (● REC, Fake-Mikro): Toast, [Ja] → +1 Takt, `out = post.out + post.sec`, ein Undo; PCM-Fall 0,6 Takte → Toast, 0,2 → keiner; Wiedergabe-Puffer = Take-Samples bitgleich; Render spielt in Takt 2 das Wortende |
| G10-05 Anlauf | 9/9 | Vorlauf 2 Schläge, Takt 1 = jetzt + 0,06 s + 2 Schläge (exakt); Anlauf live −22,5 dB über Stille; Render: Vorlauf 1,0 s, Takt 1 bei 0,99 s, Bild bis Takt 1 am Anfang; ohne Anlauf Start + Render = 4.30.0 |
| Regel 28 | 6/6 | Demo und Projekt mit STIMME/Take/`song.vox` aus 4.30.0: Laden + Speichern Zeichen für Zeichen gleich |
| Rauchtests bau/tests | grün | `smoke.mjs`, `v3-mk8-smoke.mjs` ohne Fehler; `gmkp8-voc-mic.mjs` 8/8 |

Hinweis G10-04 (echter Weg): Wo das Wort zum Taktstrich liegt, ist mit der Fake-Datei zufällig; der Test nimmt bis zu 6 Takes (bisher immer beim 1. Versuch).
Die Bitgleichheit ist am Wiedergabe-Puffer geprüft; der Mix (Pegel, Hall) macht den Render selbst nicht bitgleich – dort ist Tonhöhe/Pegel geprüft.

## Abnahme
- [x] G10-01 (automatisch) · [ ] Xander
- [x] G10-02 (automatisch) · [ ] Xander
- [x] G10-03 (automatisch) · [ ] Xander
- [x] G10-04 (automatisch) · [ ] Xander
- [x] G10-05 (automatisch) · [ ] Xander

## Bitte prüfen (iPhone, Safari)
1. 🎤 an **ohne Kopfhörer**, Einmessen: steht unter „Weg“ jetzt „🔈 Hörmuschel?“ mit dem gelben Hinweis? Welcher Wert steht bei „Lautsprecher im Mikro … dB“? (Schwelle −26 dB)
2. Neuer Song, 🎤 an, ● SONG, 8 Takte singen, ■: Ist deine Stimme danach im Song (▶ SONG)? Nimmt ↶ einmal Song und Stimme zusammen weg?
3. ● REC auf einer Szene mit 🎤: Zeigt die rote Aufnahme-Leiste den grünen Pegel-Balken, der mit deiner Stimme mitgeht? Wird er rot, wenn du laut ins Mikro rufst? Ruckelt etwas?
4. Ein Wort über das Ende der Aufnahme ziehen (REC oder FANG): Kommt „Letztes Wort ragt über das Ende – Clip +1 Takt?“, und hört man nach [Ja] das ganze Wort?
5. Song, dessen erster Gesang mit Auftakt vor Takt 1 beginnt: ▶ SONG – hörst du den Auftakt, und sitzt Takt 1 im Takt? Dasselbe im Video.
6. Gerätetest B-3 (H6): `?stsess=auto` / `?stsess=none` – welche Variante spielt laut unten? (siehe CHANGES.md, Fragen)
