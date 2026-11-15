# VOXR1B – Log (15.11.2026)

- Paket angelegt: basis.html = rel-4700/index.html; index.html = git merge-file (Basis rel-4680, VOXR1) → 0 Konflikte.
- Pflicht direkt nach dem Merge: topdefs 26 Skripte / 7836 Namen / 0 doppelt / 0 Syntax, dupkeys 0, „MS 2000“ 1×, „^  live: true,“ 1×.
- Plopp-Erkennung: Verschiedene Schwellen (Anstieg 0–12 dB) → eingesetzte Stöße immer 10/10, B/C 0; Take A 10–15 eigene Funde.
  Gewählt Anstieg ≥ 15 dB (Empf. 8).
- Plopp-Reparatur: AR mit kürzerer Umgebung/Ordnung (0,08–0,3 s, 12–40) → höchstens 5/10 im Ziel; Teiltöne (`plopSin`) mit fester Grenze
  250 Hz → 7/10; Messfenster 25/40/60 ms, Rand 2–12 ms, Randzug 0–4 Rahmen → bestes 8/10 (25 ms, Rand 10 ms, Randzug 1).
- Wahrheit der Take-A-Funde: Annotation (Grundton, Noten-Einsätze) + Gegenprobe ohne < 70 Hz (0 Funde) + eingesetzte Stöße (10/10, 0).
- Raumton-Versuch zurückgenommen (keine Verbesserung).
- Test: voxr1-test.mjs (Kopie, Plopp-Wahrheit ergänzt: 2 neue Prüfungen, 3 angepasst) → **76/83** (vorher 70/81) in 75 s.
- Regression: vx1 61/61, vx2 14/14, vx3 15/15, chr2-imp2b 82/82 (123 s). Smoke: errors [].
- Pflicht am Ende: topdefs 26 / 7836 / 0 / 0; dupkeys 0; „MS 2000“ 1×; „^  live: true,“ 1×; VERSION 4.70.0 unverändert;
  außerhalb Block + 7 Haken = basis.html.
