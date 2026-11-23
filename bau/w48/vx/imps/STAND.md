# IMPS – Stand (fertig)
Bau: `python3 apply.py <eingang> <ausgang>` (Eingang md5 a7515b98…, Ausgang hier `index.html`, md5 74e7f025a65581cc38f5ea7a9ef8d53d).
Block `block.js` (/* IMPS-BEGIN/-END */ direkt vor `function imp1Geo`), Haken mit `/* IMPS */`:
- imp1Run: Analyse über `impsAnalyse(c,…)` statt `imp1Analyse(c.x.slice(),…)`; Teile über `impsSeg(r,c)` statt `spk11Seg(r,c.x,c.sr)`.
- imp1Geo: Auftakt-Zahl k ab der ersten hörbaren Probe (`zs = impsZs(c)`); ohne Stille vorn (zs = 0) Rechnung wie bisher.

## Was
- Führende digitale Stille (Proben, die im 16-bit-Take 0 sind, |x| < 0,5 LSB) wird vor der Takt-/Teile-Analyse abgeschnitten → die Analyse sieht genau
  denselben Inhalt wie ohne Stille; alle Zeiten (t1, start, ende, dauer, takte, teile, Teile aus spk11Seg) werden um z/sr verschoben.
- Song-Takt 0 = „1“ − k Takte mit k ab der ersten hörbaren Probe → die Stille fällt weg, der Take (Szenen/Spur/Gesang/Loop) ist ab der ersten
  hörbaren Probe probengleich zum Import ohne Stille, darum auch Gesang-Stückwahl (vxr2/vx2) gleich.
- Ohne Stille vorn bitgleich zu 4.86 (T7). Schalter für Tests: `__imps.on(false)`, `__imps.last()`.

## Tests
- **Kern-Test-Datei: `imps-test.cjs`** (`node imps-test.cjs <port>`, Server-Wurzel `srv/` mit basis/ und neu/, je version.json; IMPS_SR=44100 für
  44,1-kHz-Dateien). Echte Datei-Wahl, 428×926 Touch, je Fassung 3 Importe (0 / 137 ms / 1,3 s Stille) → „Als Gesang“ → Gesang-Editor-Analyse.
  - 48 kHz (`imps-test-48000.out`): **ALLE OK (7/7)**. Takt-Lage erster Einsatz Basis 0,50417 / 0,50292 / 1,50417 Takte → neu 0,50417 ×3;
    Auftakt k Basis 1/1/2 → neu 1/1/1; Teile Basis bei 1,3 s um 1 Takt verschoben → neu gleich; Gesang-Stücke Basis max. Abw. 0 / 152 / 2410 ms
    → neu 0 / 0 / 0 (143 Stücke je); Take probengleich.
  - 44,1 kHz (`imps-test-44100.out`, App rechnet auf 48 kHz um): k, Teile, „1“ gleich; Takt-Lage 0,50417 / 0,50430 / 0,50430 (15 Proben = 0,31 ms,
    Vorschwinger des Umrechners vor dem Einsatz); Stückzahl 143/133/134 – **genauso in Basis** (hängt am umgerechneten Inhalt, nicht an der Stille).
- Pflicht (`pflicht.out`): doppelt.js neu [], „MS 2000“ 1×, „  live: true,“ 1×, verbotene Zahlen 0×, neuer Code nur ASCII + „–“ im Kommentar.

## Offen / Grenzen
- Dateien mit anderer Abtastrate als die App (44,1 → 48 kHz): ±0,3 ms Rest und Gesang-Stückwahl reagiert auf die Umrechnung (wie 4.86).
- Tempo-Anpassung beim Import (nx1ImpView, Projekt hat schon Audio in anderem Tempo): k zählt ab der ersten hörbaren Probe des gedehnten Audios; nicht eigens geprüft.
- Import über den Instrumental-Export-Weg (ggbImportBuf, Gesang an Export-Vorzähler gebunden) absichtlich unverändert: dort gehört die Stille zur Lage.
