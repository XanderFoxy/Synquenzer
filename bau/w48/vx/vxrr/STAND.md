# VXRR – Gesang reinigen: Regler (fertig)

Bau: `python3 apply.py <rel-4880/index.html> <ausgang.html>` (md5-Prüfung 695af050…, 9 Anker je genau 1×, Block VXRR-BEGIN/-END vor `function vr1BreathTap(E){`, kein CSS nötig – nutzt `.clrow/.cllab/.clr` des Säubern-Blatts).

## Was geändert ist
- Kern `vr1Make().run` (läuft auch im Worker): Schritt-Objekt mit `vxa` < 1 → nach dem Schritt `y = vorher + vxa·(nachher − vorher)`. Ohne `vxa` (Standard) läuft genau der alte Code → bitgleich.
- `vr1Plan` → `vxrrMix`: setzt `vxa = Gesamt × Schritt` in die Schritte (nur wenn < 1). Damit ändert sich der Fassungs-Schlüssel (`vr1Sig` enthält steps) automatisch.
- `vr1Apply`: merkt `take.vr1.vxrr = {g, a:{schritt:wert}}` (nur wenn nicht Standard); das von „Gesang reinigen“ selbst zugeschaltete Säubern (CH5_VR1) folgt Gesamt (0 % = bleibt aus, 50 % = halbe Stufe). Vorhören (▶ 10 s) genauso.
- Laden: eigener `tkExt().take`-Normalisierer übernimmt `vxrr` (begrenzt 0–1); `vxa` bleibt über die vorhandene Schritt-Kopie erhalten.
- Blatt: Zeile „Gesamt“ unter leicht/mittel/stark; in „Mehr ▾“ „Stärke je Schritt“ mit 7 Reglern (aus, solange der Schritt nicht läuft). Hat der Take schon eine Fassung und stehen die Regler anders, zeigt der Knopf wieder „Anwenden“.

## Kern-Test
`node vxrr-test.cjs <neu.html> <alt-4.88.html> [fotos]` – startet eigenen http.server (Port 9000–9099), synthetische 12-s-Gesangsspur mit 7 Klicks, 5 Plopps, 50-Hz-Brumm.
Gegen andere Fassung: erstes Argument = neue Datei, zweites = Bezug 4.88 (für „Standard bitgleich“). Ergebnis zuletzt: 17/17 (`vxrr-test.out`, Messwerte `vxrr-test.json`).
Hinweis Messung: Hochpass 80 Hz nimmt selbst viel vom Stoß/Brumm – Plopps-/Brummen-Einzeltest daher mit Hochpass 0 %.

## Offen / ehrlich
- Ein Regler je Schritt (Stärke als Mischung vorher/nachher), keine zweiten, schrittspezifischen Regler (z. B. Klick-Empfindlichkeit, Brumm-Tiefe).
- Regler wirken auf eine angewandte Fassung erst nach „Anwenden“ (wie die Stufen leicht/mittel/stark).
