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
