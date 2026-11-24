# daten – The Wall für den Gesangstrainer (24.11.2026)

## 1. app/daten/the-wall.json (öffentlich, nur The Wall)
- 10 Teile (in, s1, r1, s2, r2, tag, ueb, zt, r3, out) mit start/ende/takte/akkorde/merkmale, 26 Zeilen, 160 Silben.
- Silbe: {text, t, dauer, midi, wort, wortende} + optional gesprochen:true (midi null, 18 Silben im Zwischenteil),
  sprache:'de' (deutsche Wörter in englischer Zeile), notiert (MIDI-Notation weicht ab), quelle:'notation' (Messung unsicher),
  noten:[{t,dauer,midi}] (zwei gehaltene Töne in einer Silbe, z. B. „your" im Tag As3→B3).
- t = Einsatz der Silbe (Silbenkarte wall/werkzeug/lied.json), dauer = stimmhafter Lauf bis zur nächsten Silbe.
- midi = Median der Tonhöhe im ruhigen Teil des Vokals (ohne Anschleifen/Ausklang) in projekt7/Haupt-3-trocken-v7.wav,
  auf Halbton gerundet, auf die es-dorische Leiter gezogen (Spur ist gestimmt, liegt im Mittel +2 Cent).
  155 von 160 Silben gleich oder 1–2 Halbtöne neben der Notation (werkstatt lied.json); 5 echte Abweichungen
  (of 56/58, Sheep 51/49, no 56/58, What 51/53, low 54/56) → gemessener Wert steht, Notation unter „notiert".
  „Why" (S2) und „Wach" (ZT) zu kurz/unsicher gemessen → Notation.
- umfang C3–Des4 (48–61); Refrains F3–B3, Strophen C3–As3, Outro bis Des4 („your").
- Skripte: werkzeug/daten/f0.py (YIN 10 ms, Pegel, Schwerpunkt, Höhenanteil), bau.py (baut die JSON), stimme.py.

## 2. Xanders Stimmlage (NUR hier und in notiz/profil-xander.json – nicht in die App)
Gemessen aus Haupt v7, Doppel v7, Gegengesang-eigen-7, original/Gesang-3 und Doppel-4 (stabile Töne ≥ 150 ms):
- Tiefster sicherer Ton: B2 (46, ~117 Hz, Gegengesang, 4 s gehalten). C3 in allen Melodiespuren.
- Höchster sicherer Ton: B3 (58, ~233 Hz) – 98. Perzentil in allen Melodiespuren. Kurz darüber: Des4 (61) im Outro
  („your", Haupt 60,6 / Doppel 60,9). Einzelne E4–A4-Rahmen in Doppel-4 (35–60 s) sind Oktavfehler der Messung.
- Kernbereich (80 % aller gesungenen Rahmen, alle Spuren): Des3–B3 (49–58); nur Melodie: Es3–B3, Median As3/Ges3.
- Sprechstimme (Zwischenteil „we know it all… siehst du mich nicht"): Median 103–108 Hz (≈ As2/A2).
- Klang gegen Tonhöhe (nur ungestimmte eigene Aufnahmen + Gegengesang):
  | Ton | Höhenanteil 2–5k/80–1k | Schwerpunkt | Aperiodizität (Luft) | Pegel |
  | Des3–Es3 | −20…−17 dB | 460–480 Hz | 0,018–0,020 | −20 dB |
  | F3 | −13 dB | 680 Hz | 0,047 | −24 dB |
  | Ges3 | −12,5 dB | 750 Hz | 0,069 | −30 dB (Einbruch) |
  | As3 | −12,7 dB | 790 Hz | 0,056 | −23 dB |
  | B3 | −9,5 dB | 1030 Hz | 0,065 | −23 dB |
  → Wechsel zwischen Es3 und Ges3: Klang deutlich heller und 2–3× luftiger, bei Ges3 leiser. Vorsicht: vermischt mit
  Vokal und Liedteil (Strophen tief, Refrains hoch), also Hinweis, kein Beweis. Zweite Grenze B3: oberer Rand des
  sicheren Bereichs, genau dort liegen die Refrain-Spitzen (We/claim/Who/Don't/wait).
- Vermutlicher Typ: (hoher) Bariton – Schätzung. Gründe: Sprechlage ~105 Hz, Kern Des3–B3, Klangwechsel ab Ges3,
  sichere Höhe endet bei B3. Tenor nicht ausgeschlossen, weil das Lied oberhalb Des4 nichts prüft.
- profil-xander.json: tief 46, hoch 58, kern [49,58], uebergaenge [54,58], typ „Bariton (Schätzung)".

## 3. Merkmale je Teil
In teile[].merkmale (höchster/tiefster Ton mit Wörtern, größter Sprung, längster Bogen ohne Pause, 120 BPM + Pause
zwischen den Zeilen, lange Haltetöne, gesprochene Silben). Größte Sprünge: S2 „no"→„tised" −7, S1 „of"→„Sheep" −5,
Outro „pen"→„your" +5. Längster Bogen: S2 „Are we hypnotised" 4,7 s.
