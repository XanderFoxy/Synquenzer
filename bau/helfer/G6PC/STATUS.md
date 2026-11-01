# STATUS G6+c – Chor-Gruppe im Klangweg (Zweig g6p-c)

**Stand:** gebaut und gezielt getestet, Basis 4.25.2 (`R-4252.html`), VERSION unverändert. Nicht abgenommen – Hörprobe am iPhone fehlt.

| Abnahme | Ergebnis (Chromium, Abgriff am Ausgang, BS.1770) |
|---|---|
| G6P-20 Abstand je Stil | ✓ alle 9 Stile ±0,05 LU (Soll ±0,5); Hall-Rückweg ×2 ändert 0,00 LU |
| G6P-21 Regler | ✓ 8→12 LU ⇒ 11,98; Terz +3 dB ⇒ Chor gesamt 0,00, Terz relativ +3,0; STIMME −6 dB ⇒ Lead −6,00 / Chor −6,00; STIMME stumm ⇒ Chor/Hall still |
| G6P-22 Pan | ✓ Fehler ≤ 3e−8 (44 Kopien, Knotenwerte); M-PAN aus Rauschen nicht gemessen |
| G6P-23 Versatz | ✓ 0,00 ms (Startzeiten je Kopie) |
| G6P-24 Solo/Stumm/aus/Vorlage | ✓ Solo ⇒ Lead still; Spur stumm; Chor aus ⇒ 0; Blatt zu ⇒ Solo aus; Vorlage ×2 ⇒ +6,02 dB, zurück ⇒ gleich |
| G6P-25 Sends | ✓ Hall 0 ⇒ still; Vorverzögerung 1/32 @120 = 62,5 ms (Impuls); Chor aus ⇒ Hall still; `S.fxBus` unverändert |
| G6P-26 Klang | ✓ Tiefschnitt −3,01 dB bei Soll-Hz, Mitte = Soll, Kuhschwanz nach Formel (Kochbuch: +n/2 dB bei 10 kHz) |
| G6P-27 Live = Offline | ✓ Chor 0,07 LU, Lead 0,06 LU; vor „fertig“ keine Kopie (kein Platzhalter), Einsatz mit 10-ms-Blende |
| G6P-28 Leistung | ✓ (gekürzt: 30 s, 3 Szenen) Knoten danach 0, keine langen Tasks |
| **G6P-K1 Kopplung** | ✓ an: Lead −6 ⇒ Chor −5,99; aus: Chor 0,00; wieder an: Sprung 0,00, Abstand bleibt, danach +6 ⇒ +6 |
| v1-Smoke (Regel 28) | ✓ 4.25-Chor läuft über den alten Weg, keine Gruppe |

Rohdaten: `tests/lauf-final.txt`, `tests/ergebnis.json`. Aufruf: `NODE_PATH=/opt/node-tools/node_modules node tests/abnahme.mjs [nur=20,K1]`.

**Offen / Hinweise**
- Puffer und gA kommen im Bau-Stand aus dem Rückfall (v1-Rechenweg, eigene Messung); mit G6+b (`g6pBuf`, `g6pLoud`) zusammenführen. Daten-Rückfall `g6pcNorm2` bis G6+a (`g6pNorm2`) da ist – `grp.below` bitte mit 0,01 speichern (sonst Sprung beim Wieder-Koppeln).
- Undo-Art `chorlanes` hier eingebaut (sonst wäre ↶ in `restoreFx` gelaufen) – beim Merge mit G6+a nur einmal behalten.
- Nicht gemessen: iPhone-CPU, M-KLICK formal, 3-min-Lauf, Song-Stellen, M-G28 auf allen Snapshots (Patch ändert v1-Weg nur an `g6Drop`/`g6Refresh`/Blatt-Schließen).

**Bitte prüfen:** (nach Merge mit G6+a/b) Refrain mit Chor-Stil spielen → STIMME-Regler runter: Chor geht mit; [Gekoppelt] aus → Chor bleibt stehen; wieder an → kein Sprung.
