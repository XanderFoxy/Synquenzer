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

## Auftrag 2/3 (echte Chöre + Tuning ohne Knackser)
Bau zusätzlich: `python3 src/apply2.py <datei>` (Quelle `src/real.js`). Messung: `node src/tune-meas.mjs index.html "" out.json`
(Prüfstimme mit Vokalen/Vibrato/Gleiten/verstimmten Noten/„s“/„t“; Ideal = gleiche Stimme synthetisch an der Ziel-Tonhöhe).
- Chor-Weg G6 v2 war schon für jedes Audio-Stück offen (auch IMP1 „Als Gesang“ = Song-Stimme) – nichts freizuschalten.
- Knackser-Ursache: pYIN überbrückt kurze Konsonanten → Plosiv/Stille mitten in einer stimmhaften Strecke wurde mitverschoben
  (Modell klingt im Loch nach, +45 dB Hochton). Fix `apGate` (YIN-Rest ap ≤ 0,25 → verschieben, ≥ 0,5 → Original) in G2 `render` und
  G6+b `renderMulti` (gleich, bitgleich zueinander). Knackser 5 → 0 in allen Fällen; übrige Zahlen unverändert.
- Echte Chöre: `grp.echt = 1` (neue Chöre aus Stil/Background-Duplikat; alte Projekte ohne Feld unverändert). Plan je Kopie trägt
  `chr2 {ms, f, d, s, r, c}`: Versatz gesamt 10–40 ms, Formant-Faktor 0,955–1,05, Schwanken ± 5 ct (0,2/0,5/3 Hz), Rest im Vokal × 0,3,
  außerhalb × 0,12. Gemessen: Konsonanten der Kopie −18,4 dB gegen den Lead, Schwanken σ 2,6 ct, Formant +2,0 % (Faktor 1,035).
| Fall | LSD ruhig/Übergang dB | Knackser (max dB) | Formant % | Ton ct | Glätte | Anlauf ms |
|---|---|---|---|---|---|---|
| weich vorher → nachher | 2,18/3,15 → 2,18/3,15 | 5 (45,8) → 0 (1,8) | 2,4 → 2,4 | 1,9 | 1,11 | 0 |
| hart | 2,37/4,01 → 2,37/4,02 | 5 (44,1) → 0 (2,5) | 2,5 → 2,6 | 2,1 | 1,21→1,19 | 0 |
| natürlich (nat 0,3) | 2,33/3,30 → gleich | 5 (44,2) → 0 (1,6) | 2,7 | 1,5 | 1,00 | 0 |
| Chor +400 ct | 4,06/7,09 → 4,06/7,08 | 5 (44,0) → 0 (2,2) | 9,3 | 2,3 | 1,34 | 0 |
| Chor −500 ct | 4,00/5,89 → 4,00/5,90 | 5 (45,8) → 0 (2,4) | 6,0 | 0,9 | 0,45 | 50 |
Offen: Formant-Abweichung bei großen Verschiebungen (6–9 %) und LSD an Übergängen (Geist der Original-Tonhöhe im Rest x − Modell,
Hülle an der 7-kHz-Kante); Anlauf −500 ct 50 ms (Schutzzone 15 ms + ap-Rand); Schalter „echt“ im Chor-Blatt; Browser-Hörtest
eines echten Chors (Worker-Weg) und echte MP3/WAV-Aufnahmen; zeitlich schwankender Versatz je Silbe.

## Auftrag 3/3 (Gesamt-Test)
Test `chr2-test.mjs` (neben index.html; Aufruf `node chr2-test.mjs [index.html] [basis.html]`, ~2,5 min, Fotos `fotos/chr2t-*.png`,
Läufe `src/run3.txt`). Die App-Datei wurde in Auftrag 3/3 nicht geändert (nur Test + Messung).
1. Kern der Datei in Node (2/3/4 Vokal-Stimmen, Tonhöhe der Verfolgung, Tonhöhe der getrennten Welle (YIN), Pegel-Abstand).
2. Browser/Touch: Gesang-WAV über den Datei-Wähler → „Als Gesang“ → Chor „Pop modern“ (echt) → Kopien mit/ohne echt gerechnet und gemessen;
   Takes-Blatt › Stimmen trennen (3) mit Abbrechen; Speichern/Laden; Container in frischem Speicher; Blätter 428×926/926×428/926×370.
3. `src/tune-meas.mjs` auf Basis (vorher) und Datei (nachher).
Ergebnis: 72/82 OK. Alle 10 FEHLER sind die bekannten Grenzen beim Trennen (unten).
| Prüfung | Ergebnis |
|---|---|
| 2 Stimmen Terz | Verfolgung 100/100 %, Welle 100/100 %, 31/32 dB |
| 3 Stimmen Terz + Quinte | Verfolgung 100/98,6/100 %, Welle 100/99,5/**67,2** %, 24/28/29 dB (App gleich) |
| 4 Stimmen eng | Verfolgung 98/**64/78/63** %, Welle 99/**65/65/68** %, 22/**6/7**/13 dB |
| Auto-Zahl (3 Stimmen) | 3 |
| Chor aus importiertem Gesang | 3 Stimmen auf c1–c3, echt = 1, ein ↶, ↶/↷ ganz |
| Versatz je Kopie (Plan/gemessen) | 6/7 · 12/12,2 · 9/9,7 · 17/18,5 · 15/16,5 · 16/17,2 ms; gegen den Lead 15–36,5 ms |
| Schwankung je Kopie | σ 2,3–3,6 ct (ohne echt 0) |
| Formant Kopie 1 gegen 2 | uni +3,1 % · Terz +2,7 % · Oktave unten +1,9 % (ohne echt −0,2…+0,4 %) |
| Konsonanten der Kopie (Kern) | −18,4 dB gegen den Lead |
| Tuning-Knackser vorher → nachher | 5 → 0 in allen 5 Fällen (max +44…46 dB → +1,6…2,5 dB), LSD/Formant/Ton/Glätte gleich |
| Trennen in der App | Abbrechen ändert nichts, eigene Chor-Spuren c4–c6 neben dem Import-Chor, Rest/alt, Summe −78 dB, ein ↶/↷ |
| Speichern/Laden | Herkunft der Takes, Rest, alt, 6 Chor-Spuren, echt bleibt; alter Chor ohne Feld bleibt ohne |
| Container frisch | alle Takes bitgleich, beide Chöre da, fester Pegel (unity) |
| Blätter | Szene + Song-Stimme, offen/zu, 3 Lagen: ✕ sichtbar, Tasten ≥ 44, keine Überlappung, nichts außerhalb |
| Konsole | keine Fehler |
| Regression | vx1-test 61/61 (reg/vx1.txt), imp1-test ALLE OK (reg/imp1.txt) |
Mess-Befunde (Test, nicht App): Formant-Lage ist bei hohen Stimmen (Teiltöne ~800 Hz auseinander) mit dem Spektral-Schwerpunkt nicht
messbar (Vorzeichen zufällig) → Import-Lead im Test eine Oktave tiefer (C4–G4); Vergleich „echt gegen ohne echt“ ist durch Rest × 0,3
verfälscht → verglichen werden zwei echte Sänger derselben Stimme. Versatz per Hüllkurve: ±1,5 ms Genauigkeit, Toleranz ±4 ms.
Offen (für das nächste Paket): Unterstimme bei Terz + Quinte (Teiltöne 3/6/9 gehen an die Oberstimme → YIN springt auf 2·f0) und
4 enge Stimmen (Verfolgung 63–78 %) – Weg: Kollisions-Teilung über die eigene Hülle der Stimme über die Zeit; Oktav-Verdopplung bleibt Grenze.
