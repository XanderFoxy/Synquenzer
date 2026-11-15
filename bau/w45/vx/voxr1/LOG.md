# VOX-R1 Teil 1/3 – Log (15.11.2026)

- basis.html = Kopie Kandidat 4.68.0, index.html = Arbeitskopie. Neuer Code nur im Block VOXR1-BEGIN … VOXR1-END (vor VS5a),
  ein Haken: `if (typeof VXR1_API === 'object') Object.assign(SYNQUENZER, VXR1_API);   /* VOXR1 */` hinter `Object.assign(SYNQUENZER, CL_API)`.
- Namenskonflikt behoben: `VR1` gab es schon (Notenrolle) → eigener Zustand heißt `VXR1`, `VXR1_API`, `VXR1_ORDER`.
- Plopp-Reparatur zuerst per STFT-Begrenzung auf das Spektrum vor/nach dem Stoß: zu wenig Abzug (9–12 dB) und Obertöne bis 6 dB
  verändert → ersetzt durch AR-Interpolation des dezimierten tiefen Bandes (Band über der Grenze bleibt bitgleich).
- Brumm-Kerben zuerst mit fester Güte 30: 60 Hz änderte das Gesangsband um 1,2 dB (Oberton der Stimme bei ~294 Hz neben der Kerbe
  300 Hz) → Güte wächst mit √k, jetzt −0,09 / −0,11 dB.
- Prüfen im 3-min-Take: Brumm-Suche lief in der Kette über den ganzen Take (5 s) → immer nur der ruhigste 10-s-Ausschnitt (1,9 s).
- Pflicht: topdefs 26 Skripte / 7575 Namen / 0 doppelt / 0 Syntaxfehler; dupkeys 0; smoke errors []; „MS 2000“ 1×; „  live: true,“ 1×;
  VERSION 4.68.0 unverändert.
- Test: `node voxr1-test.mjs <abs index.html>` → 22/27 (offen: Plopp-Erkennung, s. NOTES).

# VOX-R1 Teil 2/3 – Log (15.11.2026)

- Klicks: erst nur AR-Rest (Ordnung 16, Band > 2 kHz) → weich einsetzende, ausklingende Klicks unsichtbar (AR sagt sie voraus) →
  zweiter Hinweis Band-Hüllkurve. Allein-stehend-Test zuerst „größter Nachbar“ → zwei Klicks nah beieinander verdeckten sich →
  „zweitgrößte örtliche Spitze in ±25 ms“. Konsonanten (t/k/p) wurden repariert → Längen-Grenze 5 ms + Einsatz-Schutz (Band danach
  > 15 dB über davor). Reparatur des ganzen Bandes machte laute Vokale schlechter (Fehler bis −10 dB) → nur über 1,5 kHz neu rechnen.
- Versuch „Klick zwischen Stimmlippen-Pulsen“ (Periode aus Autokorrelation der Rahmen-Maxima): +1 Treffer, aber +3 neue Fehlalarme →
  zurückgenommen.
- Atmer: NACF-Stimmhaftigkeit hielt Atem-Rauschen für Ton (0,85) → Periodizität des LPC-Rests (Atem 0,19, Gesang Median 0,88).
  Test-Zufall war eine Gleitkomma-LCG mit kurzer Periode (periodisches „Rauschen“) → neue Teile nutzen Math.imul.
- Raumton: Perzentil-Lernen griff in Takes mit Tor/ohne Pausen leisen Gesang → ruhigste 200-ms-Fenster (Median) + Abstand ≥ 25 dB
  zum Gesang; Pegel und Klangfarbe von daneben, sonst gelernt; neben digitaler Stille wird nichts erfunden.
- Tempo: feats je Band als enge Schleife (1,7 s → 0,44 s für 3 min), Klick-Rest ausgeschrieben (Ordnung 10), Allein-Test vor Median.
- Pflicht: topdefs 26 Skripte / 7578 Namen / 0 doppelt / 0 Syntaxfehler; dupkeys 0 (mit NODE_PATH); smoke errors []; „MS 2000“ 1×;
  „  live: true,“ 1×; VERSION 4.68.0. Außerhalb Block + 2 Haken-Zeilen = basis.html (geprüft).
- Test: `node voxr1-test.mjs <abs index.html>` → 41/51.

# VOX-R1 Teil 3/3 – Log (15.11.2026)

- Entzischer zuerst nur mit Schwelle −6 dB in der Erkennung: 1 von 10 „s“ (auf einem Vokal-Ende) nur −2,9 dB → Erkennung 4 dB
  empfindlicher als die Senkung (−3,2 dB, Rest offen). Messfenster im Test auf genau das eingesetzte „s“ gesetzt (vorher mit Umgebung).
- Gesangs-Effekte: der Worker baut seinen Quelltext aus `g4DspMake.toString()` → im Block `g4DspMake.toString` so gesetzt, dass der
  spektrale Kern davor steht (kein Umschreiben vorhandener Zeilen); Hauptfaden und Worker liefern dasselbe.
- Takes-Blatt ließ sich im Test nicht öffnen (Teil 1) → `tkSheet({t, s})` mit Spur/Szene aus tkInject.
- „Anwenden“: die Fassung war da, gespielt wurde aber noch die alte G4-Fassung (G4 rechnet erst, wenn jemand tkPlayBuf fragt, und sucht
  vorher Marken) → nach dem Rechnen `tkPlayBuf(id)` anstoßen; Test wartet auf G4-Auftrag und Marken-Suche.
- Pflicht: topdefs 26 Skripte / 7600 Namen / 0 doppelt / 0 Syntaxfehler; dupkeys 0 (NODE_PATH=/opt/node-tools/node_modules); smoke
  errors []; „MS 2000“ 1×; „  live: true,“ 1×; VERSION 4.68.0. Außerhalb Block + 5 Haken-Zeilen = basis.html (geprüft).
- Test: `node voxr1-test.mjs <abs index.html>` → 57/67 (Rest aus Teil 1/2).

# VOX-R1 Prüfung – Log (15.11.2026)

- Befunde 1–17 aus PRUEFUNG.md nachgearbeitet (Tabelle in NOTES.md „Prüfung“). Prüfer-Skript `voxr1-pruef/p-node.mjs` als Gegenprobe mitlaufen lassen.
- Zischen erst mit Gesangspegel je ±4,5 s: „s“ an leisen Stellen nur −2,6 dB (lauter Gesang daneben) → Gesangspegel des ganzen Takes; „s“ bis 22 kHz:
  Band bis 16 kHz zählte nur ⅔ der S-Energie → bis 20 kHz. Atem (1–6 kHz) galt als Zischlaut → Spektralform-Bedingung (über 5 kHz ≥ 6 dB über 2–5 kHz).
- Plopps im Band < 70 Hz: zuerst 33 Funde im sauberen Take A (tiefes Rauschen in Pausen) → Pegel ≥ Spitze − 20 dB → 11, alle mit Band < 70 Hz nur
  2–5 dB unter dem Gesamtpegel (echte Tiefstöße). Reparatur-Grenze erst fest 160 Hz (Abzug zu klein) → unter dem Grundton der Umgebung, ≥ 120 Hz.
- topdefs fand `vr1Key` doppelt (Notenrolle) → `vr1VerKey`. App lud vorher nicht (SYNQUENZER fehlte) – erst nach topdefs gesehen.
- Plopp-Grenze unter dem Grundton (Goertzel 90–400 Hz) kostete in der 3-min-Kette 1,5 s → 2048er-Fenster, 8-Hz-Schritte: Kette 4,6 → 3,1 s.
- Formgrenze Zischen 6 dB ließ jedes Prüf-„s“ des Prüfers ungesenkt → 0 dB (Befund 12 dadurch nur teilweise).
- Test: `node voxr1-test.mjs <abs index.html>` → 70/81 (10 DSP-Abnahmen aus Teil 1/2 + 1 Long Task unter Last). Regression vx1/vx2/vx3/chr2 alle OK.
