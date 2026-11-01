# STATUS I2f (Zweig i2-br-U)

Stand: alle Abnahme-Punkte I2-47 … I2-52 automatisch grün; **wartet auf Xanders Okay** („Bitte prüfen“ Nr. 8).

| Test (bau/helfer/I2F/tests) | Ergebnis |
|---|---|
| i2-47-fuellhoehe.cjs | 8/8 |
| i2-48-werkzeug.cjs | 12/12 |
| i2-49-hoeren.cjs (I2-49 + I2-51) | 17/17 |
| i2-50-nav.cjs | 26/26 |
| i2-52-speichern-formate.cjs (inkl. Regel 28, 7 Formate) | 27/27 |
| i2f-regression-ab.cjs (Grundlage ↔ I2F) | 12/12 |

Messwerte
- Füllhöhe v 0,5 → 8,0 von 16 px; v 0,05 → 2 px; Namens-Kontrast ≥ 7,78 : 1.
- ⇕ 100 px → +0,50; Fein ×¼ → +0,125 (gemessen 0,13 nach Rundung auf 1/100); Rastpunkte VEL 6 / 127.
- Hören: erstes Audio 17–31 ms nach Zustellung des Zieh-Ereignisses (Soll ≤ 40); ≤ 11 Noten/s (kleinster Abstand 90,8 ms);
  1 s nach Loslassen −∞ dBFS; RMS-Abweichung zur Klang-Kennlinie 0,14–0,65 dB (Soll ± 1).
- Formate P1 P2 P3 L1 L2 W 428×926: ⇕ 44 px breit, Leiste 44 · 96 · 44 px im Bild, Blatthöhe vor/nach ⇕ ± 0 px.
- Größe: +16,3 KB roh / **+5,7 KB gzip** (Budget +7 KB; roh überschritten, v. a. Kommentare und Test-Haken).
- Marken-grep, „MS 2000“ (1×), Supabase-Vorkommen: gleich wie Grundlage; keine neuen Aufrufe.

Offen / Hinweise
- Haptik Tick/Snap aus §6.7 bewusst weggelassen (A.8 H2), Probe-Knopf 7 klärt es am Gerät.
- Chromium stellt Touch-Ereignisse selbst mit ~31 ms Verzug zu (leere Seite gleich) – nicht im 40-ms-Wert enthalten.
- Bilder: `bilder/i2f-rolle-P1.png`, `-XH.png`, `-L1.png`.

Bitte prüfen (Xander): ROLLE öffnen → ⇕ wählen → Note hoch/runter ziehen (hörst du sie lauter/leiser?), ◀ ▶ durch die Noten,
Taste links füllt sich mit; im LAUF Schritt wählen → ◀ ▶.
