# Probelauf CBPIMP mit „The Wall“ (lokal)

**PRIVAT – nur lokal.** Enthält Angaben aus Xanders Projekt (Struktur, Zahlen, Preset-Namen), **keine Noten, keine Texte**.
Nicht in Repos, Commits oder öffentliche Seiten. Quelle: `cubasis/roh/the-wall.cbp` (nur gelesen). Stand 16.11.2026.
Aufruf: `node tests/probe.cjs ../../cubasis/roh/the-wall.cbp` bzw. mit `'{"maxT":24,"maxS":16}'`.

## Zahlen

| | Wert |
|---|---|
| Datei | 636 592 Byte, Cubasis 3080603, 120 BPM, 4/4, 132 Takte, keine Tempo-/Taktartwechsel |
| Zeit (Node, Server) | Lesen 6–16 ms warm, ganzer Import 17–30 ms warm, 57–100 ms kalt |
| Spuren | 43: 17 klingende Synth (15 Micrologue, MicroSonic String + Bass), 3 Drum-Spuren (MicroSonic-Kit + 2× Classic Machines), 4 Audio, 5 Hilfsspuren (AKKORDE, TEXT, 2× MIDI für Live-Chor, 1 ohne Instrument), 9 stumm, 5 leer |
| Noten | 8 700 gesamt, 7 628 gespielt, 196 außerhalb ihrer Region (fallen weg, wie in SCHEMA belegt) |
| Tonart (Krumhansl) | Des-Dur-Tonvorrat (= es-dorisch, passt zu Ebm/Gb/Db/Ab/C), Sicherheit 0,78 |

## Teile → Szenen

| Takt (ab 0) | Länge | Vorschlag | Szene | Handanalyse (`ANALYSE-THE-WALL.md`) |
|---|---|---|---|---|
| 0 | 16 | Intro | 1 | Intro ✔ |
| 16 | 16 | Strophe | 2 | Strophe 1 ✔ |
| 32 | 16 | Refrain | 3 | Refrain 1 ✔ |
| 48 | 16 | Strophe (~0,93) | 2 | Strophe 2 ✔ (gleiche Szene) |
| 64 | 16 | Refrain (~0,99) | 3 | Refrain 2 ✔ |
| 80 | 8 | Bridge | 4 | Zwischenspiel 1 ✔ (Name anders) |
| 88 | 8 | Teil A | 5 | Übergang ✔ (Name anders) |
| 96 | 16 | Intro (~0,95) | 1 | Zwischenspiel 2 – gleiche Akkord-Blöcke AA wie das Intro → gleiche Szene ist musikalisch richtig |
| 112 | 16 | Refrain (~0,93) | 3 | Refrain 3 ✔ |
| 128 | 4 | Outro | 6 | Ausklang ✔ |

- **Grenzen 9/9 getroffen, keine falsche.** 10 Teile → **6 Szenen** (passt in 8).
- Erste Fassung ohne Phrasen-Bildung lieferte 4-Takt-Stücke (33 Stücke, 13 Gruppen, 50 eigene Clips) – deshalb die Phrasen-Regel.
  Zweiter Fund: die benannten Gesangs-Regionen sind Platzhalter „ganze Datei“ und liegen 15,7 Takte vor dem echten Teil → als
  Namensquelle ausgeschlossen (sonst hieß das Intro „Strophe“).

## Song exakt

| Grenze | Spuren übernommen | Noten im Song = Original | eigene Song-Clips |
|---|---|---|---|
| 8 Spuren (App heute) | 7 Synth + DRUMS (3 Drum-Spuren zusammengelegt) | 3 228 / 3 228 ✔ | 8 |
| 24 Spuren (Vorschlag) | alle 17 Synth + DRUMS | 3 566 / 3 566 ✔ | 15 |

Bei 8 Spuren fehlen 10 Micrologue-Spuren (wenigste Noten zuerst), Zusammenlegen gleicher Klänge greift hier nicht (alle Patches verschieden).

## Klang-Bericht

- Micrologue (15): je ≈ 20 Werte übernommen, 8–12 angenähert (Filterkurve, Resonanz-Kennlinie, Rauschen, LFO-Tiefen, Hüllkurven über
  10/15 s an der Grenze, Delay → Projekt-Echo), 1 fehlt (Vibrato LFO2 × Mod-Rad).
- MicroSonic String/Bass → Werksklang Fläche/Moog-Bass (angenähert); Drums → ein Werks-Kit (angenähert, Pad-Belegung OFFEN).
- 4 Audio-Spuren (Gesang/Chor) und 5 Hilfsspuren nicht als Instrument übernommen (Hinweis im Bericht).
