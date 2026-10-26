// QA MK7-01 band separation at 44.1 and 48 kHz and two noise seeds (builder's band-energy method: edges = geometric means of neighbours)
const FILE = new URL('../mk-br-MK7/index.html', import.meta.url).pathname; process.env.MK_FILE = FILE;
const {render, vocP, sine, spectrum, bandE} = await import('./v3-mk7-node.mjs');
for (const [sr, seed] of [[48000, 1], [48000, 7], [44100, 1]]) {
  const W = render(vocP({}, {}), [], {sec: .01, sr}).MKW, R = W.VR, C = k => R[k + 4], edge = (k, s) => Math.sqrt(C(k) * (s > 0 ? R[k + 5] : R[k + 3])), N = 65536;
  let w1 = 99, w3 = 99, wk1 = '', wk3 = '';
  for (let k = 0; k < 16; k++) {
    const r = render(vocP({res: 64}, {mix: {o1: 0, o2: 0, n: 127}}), [[0, 'on', 60, .8]], {sr, seed, sec: 2, inputs: {e2: sine(C(k), 2, sr, .3)}}), a = Math.round(2 * sr) - N - 100, P = spectrum(r.l, a, N);
    const E = j => (j < 0 || j > 15 ? null : bandE(P, sr, N, edge(j, -1), edge(j, 1))), ek = E(k);
    for (const d of [-3, -1, 1, 3]) { const e = E(k + d); if (e == null) continue; const x = 10 * Math.log10(ek / e); if (Math.abs(d) === 1) { if (x < w1) { w1 = x; wk1 = 'Band ' + (k + 1) + (d > 0 ? '/+1' : '/−1'); } } else if (x < w3) { w3 = x; wk3 = 'Band ' + (k + 1) + (d > 0 ? '/+3' : '/−3'); } }
  }
  console.log(sr + ' Hz, Rausch-Seed ' + seed + ': k±1 schlechtestes ' + w1.toFixed(1) + ' dB (' + wk1 + ', ≥ 12) · k±3 schlechtestes ' + w3.toFixed(1) + ' dB (' + wk3 + ', ≥ 30)');
}
