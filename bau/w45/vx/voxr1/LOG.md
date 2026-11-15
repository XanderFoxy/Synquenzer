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
