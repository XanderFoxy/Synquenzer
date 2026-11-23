# FOK4 – Stand: gebaut, Test läuft
Bau: `python3 apply.py <eingang 4.88.0> <ausgang.html>` (block.js mit FOK4-BEGIN/-END vor `function fokus1Post`, 2 Haken `/*FOK4*/` in fokus1Pre).
Kern-Test: `node test/fok4-test.cjs <neu.html> <basis.html> [RUNS]` (A = neu, B = basis, abwechselnd; 60-s-Lied, 428×926 Touch).
