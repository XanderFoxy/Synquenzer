# FOK4 – Stand: gebaut, Test läuft
Bau: `python3 apply.py <eingang 4.88.0> <ausgang.html>` (block.js mit FOK4-BEGIN/-END vor `function fokus1Post`, 2 Haken `/*FOK4*/` in fokus1Pre).
Kern-Test: `node test/fok4-test.cjs <neu.html> <basis.html> [RUNS]` (A = neu, B = basis, abwechselnd; 60-s-Lied, 428×926 Touch).
Zwischenstand: index.html md5 22ab2c830720f2b66264382eea08eb61 (Zaun-Wartegrenze ≈ 60 ms). Erste A/B-Läufe (4 Runden, vorige Fassung): Bilder 16/16 gleich, F 0 Long Tasks (Basis 2 von 4 Läufen), G 0 (Basis 2 von 4).
