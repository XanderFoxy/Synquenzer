// QA MK7-01: band separation with the noise-carrier variance averaged out (band energies summed over 8 seeds before the ratio), 48 kHz
const FILE = new URL('../mk-br-MK7/index.html', import.meta.url).pathname; process.env.MK_FILE = FILE;
const {render, vocP, sine, spectrum, bandE} = await import('./v3-mk7-node.mjs');
const sr = 48000, W = render(vocP({}, {}), [], {sec: .01, sr}).MKW, R = W.VR, C = k => R[k + 4], edge = (k, s) => Math.sqrt(C(k) * (s > 0 ? R[k + 5] : R[k + 3])), N = 65536;
const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8]; let w1 = 99, w3 = 99, wk1 = '', wk3 = ''; const perSeed = {};
for (let k = 0; k < 16; k++) {
  const acc = new Float64Array(16);
  for (const seed of SEEDS) {
    const r = render(vocP({res: 64}, {mix: {o1: 0, o2: 0, n: 127}}), [[0, 'on', 60, .8]], {sr, seed, sec: 2, inputs: {e2: sine(C(k), 2, sr, .3)}}), P = spectrum(r.l, 96000 - N - 100, N);
    for (let j = 0; j < 16; j++) acc[j] += bandE(P, sr, N, edge(j, -1), edge(j, 1));
    for (const d of [-3, 3]) { const j = k + d; if (j < 0 || j > 15) continue; const x = 10 * Math.log10(bandE(P, sr, N, edge(k, -1), edge(k, 1)) / bandE(P, sr, N, edge(j, -1), edge(j, 1))); perSeed[seed] = Math.min(perSeed[seed] == null ? 99 : perSeed[seed], x); }
  }
  for (const d of [-3, -1, 1, 3]) { const j = k + d; if (j < 0 || j > 15) continue; const x = 10 * Math.log10(acc[k] / acc[j]); if (Math.abs(d) === 1) { if (x < w1) { w1 = x; wk1 = 'Band ' + (k + 1) + '/' + (d > 0 ? '+1' : '−1'); } } else if (x < w3) { w3 = x; wk3 = 'Band ' + (k + 1) + '/' + (d > 0 ? '+3' : '−3'); } }
}
console.log('gemittelt über 8 Seeds: k±1 schlechtestes ' + w1.toFixed(2) + ' dB (' + wk1 + ', ≥ 12) · k±3 schlechtestes ' + w3.toFixed(2) + ' dB (' + wk3 + ', ≥ 30)');
console.log('k±3 schlechtestes je Seed: ' + Object.entries(perSeed).map(([s, v]) => s + ':' + v.toFixed(1)).join(' '));
