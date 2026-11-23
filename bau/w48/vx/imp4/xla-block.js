  /* IMP4-XLA-BEGIN – gleichzeitige Schläge auf demselben Pad: in der DAW klingen zwei übereinander (lauter), der Taktgeber der App
     spielt je Pad und Zeitpunkt nur einen (den lautesten). Darum hier EIN Schlag mit der Summe: Pegel eines Schlags ~ v², gleiche
     Klänge addieren sich → v = √(v1² + v2² …), höchstens 1 (dann so laut wie möglich). */
  function imp4Stack(o) {
    const m = new Map(), out = [];
    for (const x of o) {
      const k = x.t + ':' + x.n, y = m.get(k);
      if (!y) { m.set(k, x); out.push(x); continue; }
      y.s = (y.s || y.v * y.v) + x.v * x.v; if (x.d > y.d) y.d = x.d;
    }
    for (const y of out) if (y.s) { y.v = Math.round(Math.min(1, Math.sqrt(y.s)) * 1000) / 1000; delete y.s; }
    return out;
  }
  function imp4Count(notes) {        // wie viele Schläge fallen mit einem anderen auf dasselbe Pad (für den Bericht)
    const seen = new Set(); let k = 0;
    for (const n of notes) { const key = n.tick + ':' + drumNote(n.n); if (seen.has(key)) k++; else seen.add(key); }
    return k;
  }
  /* IMP4-XLA-END */
