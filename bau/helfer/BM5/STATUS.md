# BM5 – Status (31.10.)

**Fertig gebaut, wartet auf Xanders Okay** (Zweig `helfer-bm5`, Datei `bau/helfer/BM5/index.html`, Snapshot `bau/snapshots/BM5.html`).

- Bedienfeld „wie das Gerät“ (Block `sq-bm-src`, bei Bedarf geladen), Bedienung §3.3, Räder, Druck-Geste §3.4.
- Platzhalter für BM6/BM7 klar markiert (`BM6-PLATZHALTER`, `BM7-PLATZHALTER`): `BM_NAME`, `SQBM`, Engine 'bm' in den Listen,
  Prozessor 'synq-bm' (nur Maske 31), `bmHost`, P00 = INIT, Write über `saveSound`, INIT-Varianten.
- Tests (`tests/`): `bm5-ui.mjs` 104/104 in XW, XP, P1, P2, P3, L1, L2 · `bm5-look.mjs` 176/176 (9 Formate inkl. Safe-Area, Drehen) ·
  `bm5-regel.mjs` 7/7 (Regel 28 gegen 4.23.0, Marke, BM_NAME-Austausch).
- Unabhängige Prüfung: 16 Befunde, 13 behoben, 3 Info (siehe CHANGES.md).
- Offen: Vergleich mit der Handbuch-Zeichnung (privat), iPhone-Leistung am Gerät, Budget +40 KB überschritten (Block 60 KB), Fragen an Xander in CHANGES.md.

Beim Merge: Platzhalter durch BM6 (Daten, Engine-Wahl, Bibliothek, Host) und BM1–BM4 (Prozessor) ersetzen; Schnittstellen §2.1/§5.1 eingehalten
(`{t:'prog'|'set'|'ly'|'gl'|'on'|'off'|'ctl'}`, `ctl` k = bd/mw/at). Haken für Arp: `window.BMARP.stop(i)`, Startklänge: `window.BMFAC.list()`.
