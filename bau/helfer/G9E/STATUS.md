# G9E – Stand (Zweig g9e-lese): 4.25.3 + Songtext sichtbar = **4.25.5**
- **Gebaut, in Chromium getestet** – nicht online (kein main, kein PR). Wartet auf Xanders Prüfung am iPhone.
- Lieferung: `index.html` (4.25.5, APP_CODE 4025005, `live: true` unverändert), `patch.diff` (gegen `bau/snapshots/R-4253.html`),
  `tests/` (`sh tests/alle.sh`), `bilder/`, `CHANGES.md`.
- Neu: Mitlese-Zeile (Karaoke) beim Abspielen/Vorzähler/Einsingen, Vorlage = alter Take-Text beim Neu-Einsingen, Silben an den Noten
  (MELODIE-Rolle, Song-Melodie, G2), G5 gibt Silben mit.
- Tests: t-ly 37/37 · Smoke 12/12 · Take abspielen 4/4 (−23,8 dB wie 4.25.3) · Leistung 95 % ≤ 0,8 ms/Bild bei CPU 4×.
- Bitte prüfen (iPhone 12 Pro Max): (1) Take mit Text abspielen – hoch und quer, passt die Silbe zum Gehörten? (2) [TEXT] aus/an, nach Neustart
  gleich? (3) Auf demselben Platz neu einsingen – Vorlage läuft im Vorzähler und beim Singen mit? (4) MELODIE-Rolle nach „In Melodie umwandeln“.
- Offen: Tasten werden mit Leiste niedriger (P 428×926: 186 px, quer 926×428: 98 px) – falls zu eng, Leiste quer nur bei Wiedergabe zeigen.
  Silben im Takes-Blatt / in der STIMME-Zeile: bewusst nicht (G9 §7.1).
