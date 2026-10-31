# STATUS Helfer BMK (Zweig `helfer-bmk`, Bit Mask Zweig A „Klang“)

| Paket | Stand | Tests |
|---|---|---|
| BM1 Masken-Oszillator 16-fach, Dezimierer, Steuertakt | **fertig** (31.10.) | bm1-node 27/27, bm1-cpu 3/3, bm1-browser 4/4, bmk-regel28 8/8 |
| BM2 Stimme, Hüllkurven, LFOs, Modulation, Spielweisen, Global | offen | – |
| BM3 FX1/FX2 + SYNC | offen | – |
| BM4 Layer/Split, Arp (`sq-arp-src`) | offen | – |

Basis: vs-base-B.html (App 4.23.0). VERSION/CLOUD unverändert. Neu: Block `sq-bm-src` (Prozessor als `BM_WK` + Test-Teil BMK-TEST).
Bauen: `node bau/helfer/BMK/werkzeug/bau.mjs`. Tests: `node bau/helfer/BMK/tests/<name>.mjs` (CPU: `node --expose-gc …/bm1-cpu.mjs`).
