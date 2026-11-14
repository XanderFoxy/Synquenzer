# CHR2 – Chorstimmen aus einem Take · NOTES (Stand Auftrag 1/3)

Datei: `vx/chr/index.html` = basis2 (4.57.0) + Block `CHR2-BEGIN … CHR2-END` direkt nach `/* VOX2-END */`. Bau: `python3 src/apply.py <basis2> <ziel>`
(Quellen `src/core.js` Kern, `src/ui.js` App-Teil). Einhänge-Zeilen (alle „CHR2“): tkSheetPaint (Abschnitt), Tipp-Weiche im Takes-Blatt,
g6pGA (fester Pegel für getrennte Stimmen), CSS `.tk-chr2`/`.chr2`. VERSION/CHANGES unberührt.

## Kern `chr2Core().sep(x, sr, {n}, prog)` (Worker aus toString, Hauptfaden-Rückfall)
- STFT 4096/Hop 1024 (Hann). Je Rahmen bis 5 Grundtöne: Harmonischen-Summe auf 20-Cent-Log-Raster (Max ±1 Feld), Gewicht (f0+20)/(h·f0+320);
  ohne Grundton ×0,25; Oktav-Prüfung (liegt eine Stimme eine Oktave tiefer mit ungeraden Teiltönen → die); verfeinern über Teiltöne 1–6
  (parabolisch); nur echte Stimmen (Grundton-Spitze > 2 % des Rahmen-Maximums, bei < 150 Hz auch Teilton 2); abziehen (Hann-Keule, Breite
  wächst mit der Frequenz; Teilton-Stärke = min(Spitze, 1,6 × Nachbarn) → geteilte Teiltöne bleiben); Sperre ±80 Cent um Gefundene;
  Rest-Oktave/Duodezime einer gefundenen Stimme nur, wenn deutlich stärker (1,2×).
- Stimmen: Zahl Auto (≥ 40 % der Rahmen) oder 2/3/4; Schwelle 4 % des 95-%-Werts; Zuordnung hoch → tief (keine Kreuzung), gekreuzt nur bei
  klar besserer Stetigkeit (< 0,3 × Kosten und > 300 Cent gespart); Median 5, Lücken ≤ 3 Rahmen, Inseln < 4 Rahmen weg.
- Masken: je Stimme Teiltöne bis 11 kHz als Gauß (σ = 1 + 0,008·Bin), Stärke = Spitze, bei Kollision mit anderer Stimme Nachbar-Mittel;
  Modell-Wiener P_v / (ΣP + max(|X|²−ΣP, 0) + 2 %·|X|²); OLA im Ring, PCM16 heraus; Rest = x − Σ Stimmen (Summe = Original bis Rundung).
- Zeit: 8,6 s Gemisch, 3 Stimmen ≈ 0,7–0,8 s (Node und Browser-Worker).

## Ablage in der App (`chr2Sep`)
Takes-Blatt › „Stimmen trennen …“ → Abschnitt [Auto|2|3|4] [Trennen] [Schließen]; während des Rechnens wird [Trennen] zu „Abbrechen · n %“
(Worker beenden → „nichts geändert“). Getrennt wird der Roh-Take im Fenster des Stücks (−0,25 s/+0,5 s). Je Stimme `tkAddPcmTake` (name „Stimme n“,
`chr2 {of, k, n}` bleibt beim Normalisieren) als selbst gesungene Chor-Stimme auf neuer freier Chor-Spur (`g6pLaneFor`, Name „Stimme n“), Gruppe
CHR2_GRP neutral, Pegel fest √2 (Mono-Panner-Gesetz) über `chr2Unity` in g6pGA; Rest-Take („Rest“) wird das hörbare Stück, das Original rutscht nach
alt (A/B im Takes-Blatt). Ein ↶ (`g6pfCommit`: takes + Stück/Song + chorlanes). Stücke mit Chor-Stimmen: Hinweis, kein Trennen.
Test-API `SYNQUENZER.chr2` = sep, cancel, busy, last, core, unity.

## Messung
Node `src/node-test.mjs` (Vokal-Klänge mit Formanten + Vibrato 18 Cent, Melodie C-Dur; Tonhöhe = YIN auf der getrennten Stimme ±30 Cent;
Ziel/fremd = Projektion je 50 ms):
| Fall | Tonhöhe je Stimme | Ziel/fremd |
|---|---|---|
| 2 Vokal Terz | 100 / 100 % | 31 / 32 dB |
| 2 Vokal Quinte | 86,5 / 100 % | 21 / 28 dB |
| 3 Vokal Terz + Quinte | 100 / 99,5 / **67** % | 24 / 28 / 29 dB |
| 3 Sinus | 100 / 100 / 100 % | 29 / 26 / 28 dB |
| 4 Vokal eng (Septakkord) | 99 / **65 / 65 / 71** % | 21 / 6 / 7 / 12 dB |
| 4 Vokal mit Oktav-Verdopplung | ✗ (Grenze: Oktave = gleiche Teiltöne) | – |
Browser `src/chr2-test.mjs` (Touch über CDP, 3 Vokal-Stimmen): 25/26 OK – Fortschritt/Abbrechen, 3 Takes auf c1–c3, Rest/alt, Gruppe neutral, ein ↶/↷,
Summe = Original −78 dB, Rest −26 dB, Tasten 44 px + ✕ in 428×926/926×428/926×370, keine Konsolen-Fehler. FEHLER: Stimme 3 Tonhöhe 67 %.
Fotos: `fotos/chr2-*.png`.

## Befunde
1. Gehörte Fassung (`tkPlayBuf`) ≠ Roh-Take auch ohne Bearbeitung (Verstärkung 0,79, Rest −2,6 dB) → getrennt wird jetzt der Roh-Take; die neuen
   Takes laufen durch dieselbe Abspiel-Kette. Folge: Tonhöhen-/Zeitkarten-/Säubern-Bearbeitungen des Originals gehen nicht auf Rest/Stimmen über.
2. Stimme 3 (Quinte unter der Melodie) verliert ihre Teiltöne 3, 6, 9 an die Oberstimme (die Oberstimme ist 3/2 der Unterstimme → Teilton 2 der
   Oberstimme = Teilton 3 der Unterstimme). Die Verfolgung trifft (0 von 308 Rahmen falsch), nur die getrennte Welle klingt „oktavig“ (YIN springt
   auf 2·f0). Weg: Kollisions-Teilung über die Hüllkurve der eigenen Stimme über die Zeit (Formant-Modell je Stimme) statt Nachbar-Mittel je Rahmen.

## Offen (Auftrag 2/3, 3/3)
- Befund 2 beheben (Ziel ≥ 90 % auch für die Unterstimme und 4 Stimmen eng), Oktav-Verdopplung als Grenze melden.
- Zugang auch im Chor-Bereich (Chor-Blatt / Background-Mischpult), Konsonanten/Atem: heute im Rest (evtl. auf alle Stimmen verteilen, wählbar).
- Bearbeitungen des Originals (pitch/marks/warp/cl) auf Rest/Stimmen übertragen (ganze Take-Länge statt Fenster, dann gleiche Zeitachse).
- Wiedergabe-Pegel im echten Klangweg messen (Rest + Stimmen gegen Original, gA = √2 prüfen), Container/Speichern-Rundlauf, Song-Stimme {vox}.
- Echte Aufnahmen (Hall, Atem, Live-Chor) prüfen; Guide-Eintrag.
