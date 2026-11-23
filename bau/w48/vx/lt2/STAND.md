# LT2 STAND
- 15:2x block.js + apply.py gebaut (Stückweise-Vorzeichnen bei Tönung), Test folgt
- 15:3x erster Lauf: Endbild/Bildschirm gleich (926x428), basis bei Last <1 ohne LT; großer Lauf run1.out läuft
- 15:4x Blit durch Kopier-Shader ersetzt + Zaun (fenceSync) vor dem Zeigen; Schnelltest: Bilder gleich, Bildabstand alles 23/19 statt 31/39 ms; großer A/B-Lauf run2.out läuft (index md5 43e05a35…)
## Aufbau (index md5 43e05a3592d31884bf73f8e2eb67d3c8, Eingang 9c7f63cf…)
- Block LT2-BEGIN…LT2-END vor spk1CpuDraw + 1 Haken-Zeile in spk1GlDraw (`/*LT2*/`). Neue Namen: LT2S, LT2S_FS, LT2S_VS, LT2S_P, lt2sId, lt2sSig, lt2sFree, lt2sStop, lt2sMeasure, lt2sProg, lt2sCopy, lt2sStep, lt2sDraw.
- Ablauf: Vollbild mit Tönung bei unveränderter Ansicht, neuer Inhalt (Fokus Alles/Gefundenes, Ebenen-Farben an), alle Kacheln da, Gerät zuletzt langsam
  (Bildabstand nach Vollbild mit Tönung > 34 ms): in eigenes Bild (Textur + Framebuffer) streifenweise zeichnen (n = Kosten/20 ms, 2–6), je Bild ein Streifen,
  Leinwand bleibt solange unverändert; Zaun (fenceSync) abwarten (max 8 Bilder), dann Kopier-Shader (texelFetch) aufs sichtbare Bild. Jeder andere Anlass
  (Ansicht bewegt, Inhalt wechselt erneut, > 400 ms Pause) → Abbruch, sofort wie bisher zeichnen. Fehler → LT2S.on=false (alter Weg).
- Verworfen: blitFramebuffer (Software-Grafik langsam: Zeige-Bild 60–70 ms Long Task).
- Test: lt2-d-test.mjs <index> <basis> (A/B, Fokus-Lied, rest/alles/gef/alles2 per Tipp; Long Tasks, max. Bildabstand, readPixels-Hash des zuletzt gezeigten Bildes je Stufe, Bildschirmfoto je Stufe, Flacker-Prüfung mitten im Streifen-Zeichnen).
## Ergebnis (run2.out, lt2-d-test.json; Last 0,8–1,4; index 43e05a35… gegen Eingang 9c7f63cf…)
- Endbild: readPixels-Hash des zuletzt gezeigten Bildes je Stufe und Bildschirmfoto je Stufe A = B in beiden Lagen; Flacker-Prüfung (Halt nach Streifen 1): Bildschirm unverändert.
- Max. Bildabstand (Median über 6 Läufe) basis → index: rest 31 → 37 (Schritt ohne Tönung, Code nicht beteiligt, Rauschen?), alles 31 → 22, gef 31 → 30 (vom Hochladen bestimmt), alles2 27 → 20 (max 55 → 23).
- Long Tasks > 50: basis 1 (alles2 54), index 2 (beide im rest-Schritt 57/58, ein Lauf, ohne Tönung). In gefärbten Schritten 1 → 0.
- Pflicht: MS 2000 1×, live 1×, verbotene Zahlen 0, Marken-Wörter = Eingang, topdefs doppelt 0 / Syntaxfehler 0 (+13 Namen), smoke 428×926 + 926×428 ohne Fehler. Diff +84/−0.
## Offen
- Am iPhone nicht gemessen: dort entscheidet die Bildabstand-Messung (> 34 ms nach Vollbild mit Tönung), ob überhaupt stückweise gezeichnet wird; schnelle Grafik → alter Weg.
- Bei langsamer Grafik erscheint die Tönung nach dem Tipp ~3 Streifen + Zaun (≈ 5–6 Bilder) statt im nächsten (dafür langen) Bild.
- rest-Schritt (FOKUS1-Hochladen ohne Tönung) nicht angefasst.
