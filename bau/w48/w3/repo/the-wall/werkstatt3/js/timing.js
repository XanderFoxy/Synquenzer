// Werkstatt 3 – timing.js
// Transienten finden, auf das Raster ziehen (Zeitkarte) und die Aufnahme danach zeitlich verbiegen (Warp).
// Reines JavaScript, läuft im Hauptfaden und im Worker. Alles lokal – die Datei verlässt nie das Gerät.
//
// export function transienten(x, sr, opt={})  → [{peak, onset, staerke, pegel, anstieg}]  (Sekunden)
//        peak  = höchster Punkt der Anschlags-Hüllkurve (erste Spitze nach dem steilsten Anstieg)
//        onset = Beginn des Aufbaus davor (dort, wo die Hüllkurve aus der Pause/dem Tal heraussteigt)
// export function zeitkarte(tr, raster={})     → Anker [{src, dst, typ, i}] (Sekunden, in beiden Spalten streng steigend)
//        raster: {bpm=120, offset=0, teilung:'1/16'|'1/8'|'1/4'|'1/32'|'frei', staerke=1, fenster=Raster/2,
//                 minStaerke=0.12, vor=0.02, nach=0.025, manuell:{index: Ziel-Spitze in s}}
//        Jede (genügend starke) Spitze landet auf der nächsten Rasterlinie; der Vorlauf onset→peak bleibt
//        links daneben in Originallänge (1:1 kopiert), gedehnt/gestaucht wird nur dazwischen. Kein Überholen:
//        geht es zwischen zwei Spitzen nicht auf (zu eng, Dehnung > 4×), bleibt die schwächere frei.
//        Ergebnis-Array trägt zusätzlich .pins (die gezogenen Transienten) und .raster (Schritt in s).
// export function warp(x, sr, anker, opt={})   → Float32Array (gleiche Länge wie x, außer opt.laenge)
//        WSOLA mit festen Ankern: Rahmen spielen immer mit Tempo 1 (gleiche Tonhöhe); an jedem Anker und in
//        jedem 1:1-Abschnitt liegt die Quelle exakt (Spitzen auf die Probe genau), dazwischen sucht WSOLA
//        die ähnlichste Stelle (±8 ms) für knackfreie Übergänge.
// export function bpmSchaetzen(tr, opt = {}) {
  const lo = opt.min ?? 70, hi = opt.max ?? 180;
  const t = (tr || []).filter(e => (e.staerke ?? 1) >= 0.1 && Number.isFinite(e.peak));
  if (t.length < 8) return { bpm: opt.standard ?? 120, offset: 0, guete: 0 };
  const P = Float64Array.from(t, e => e.peak), W = Float64Array.from(t, e => e.staerke ?? 1);
  let wsum = 0; for (const w of W) wsum += w;
  // Phasen-Zusammenhalt der Spitzen bei Periode T; stueck > 0: nur innerhalb von Stücken (grob, breite Gipfel)
  const zus = (T, stueck) => {
    let summe = 0, re = 0, im = 0, s0 = stueck ? Math.floor(P[0] / stueck) : 0;
    for (let k = 0; k < P.length; k++) {
      if (stueck) { const s = Math.floor(P[k] / stueck); if (s !== s0) { summe += Math.hypot(re, im); re = im = 0; s0 = s; } }
      const a = 2 * Math.PI * P[k] / T; re += W[k] * Math.cos(a); im += W[k] * Math.sin(a);
    }
    return (summe + Math.hypot(re, im)) / wsum;
  };
  const wert = (bpm, stueck) => {
    const T = 60 / bpm;
    const sc = zus(T, stueck) + zus(T / 2, stueck) + 0.5 * zus(T / 4, stueck);
    return sc * (1 - 0.15 * Math.abs(Math.log2(bpm / 120)));   // leichte Vorliebe für übliche Tempi
  };
  // grob (20-s-Stücke, unempfindlich gegen kleine Tempo-Fehler), dann fein über die ganze Aufnahme
  const grob = [];
  for (let bpm = lo; bpm <= hi + 1e-9; bpm += 0.1) grob.push([bpm, wert(bpm, 20)]);
  const gipfel = grob.filter((g, i) => (i === 0 || g[1] >= grob[i - 1][1]) && (i === grob.length - 1 || g[1] >= grob[i + 1][1]))
    .sort((a, b) => b[1] - a[1]).slice(0, 6);
  let best = null;
  for (const [b0] of gipfel) for (let bpm = b0 - 0.15; bpm <= b0 + 0.15; bpm += 0.005) {
    const sc = wert(bpm, 0);
    if (!best || sc > best.sc) best = { sc, bpm };
  }
  const rund = Math.round(best.bpm);
  if (Math.abs(best.bpm - rund) < 0.05 && wert(rund, 0) >= 0.97 * best.sc) best = { sc: wert(rund, 0), bpm: rund };
  // Versatz: Phase der Achtel, auf den Schlag gelegt
  const T = 60 / best.bpm, T2 = T / 2;
  let re = 0, im = 0;
  for (let k = 0; k < P.length; k++) { const a = 2 * Math.PI * P[k] / T2; re += W[k] * Math.cos(a); im += W[k] * Math.sin(a); }
  let off = (Math.atan2(im, re) / (2 * Math.PI)) * T2;
  off = ((off % T) + T) % T;
  return { bpm: Math.round(best.bpm * 1000) / 1000, offset: off, guete: Math.min(1, best.sc / 2.5) };
}
