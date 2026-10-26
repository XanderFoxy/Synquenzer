// QA MK7 FP-DSP: extremes (Teil F): hot inputs (+12 dBFS noise, DC, full-scale square), all knobs at the stops, 44.1 and 48 kHz, 10 s each
const FILE = new URL('../mk-br-MK7/index.html', import.meta.url).pathname; process.env.MK_FILE = FILE;
const {render, vocP, noise, db} = await import('./v3-mk7-node.mjs');
const sig = (k, sec, sr) => { const n = Math.round(sec * sr), x = new Float32Array(n);
  if (k === 'noise+12') { const z = noise(sec, sr, 4, 11); x.set(z); }
  if (k === 'DC') x.fill(.9);
  if (k === 'square') for (let i = 0; i < n; i++) x[i] = (Math.floor(i * 2 * 3000 / sr) % 2) ? 1 : -1;
  if (k === 'impulses') for (let i = 0; i < n; i += 4800) x[i] = 8;
  return x; };
const vocs = [['alles Anschlag +', {res: 127, msrc: 2, mint: 63, cut: 63, fs: 2, efs: 0, th: 127, gs: 127, hpl: 127, hpg: 0, dir: 127, dist: 1, ins: 127, lvl: 127, vel: 63, kbd: 63}],
  ['alles Anschlag −', {res: 127, msrc: 2, mint: -63, cut: -63, fs: -2, efs: 0, th: 1, gs: 0, hpl: 127, hpg: 0, dir: 127, dist: 1, ins: 127, lvl: 127, vel: -63, kbd: -63}],
  ['FOLGER 127 + Gate 0', {res: 0, efs: 127, dir: 0, hpl: 0, ins: 127}]];
let bad = 0;
for (const sr of [44100, 48000]) for (const [lab, v] of vocs) for (const k of ['noise+12', 'DC', 'square', 'impulses']) {
  const x = sig(k, 10, sr);
  const r = render(vocP(v, {mix: {o1: 127, o2: 0, n: 127}, l1: {w: 1, f: 127, sync: 0, ks: 0}, o1: {w: 3, c1: 127, c2: 127}}), [[0, 'on', 24, 1], [0, 'on', 60, 1], [0, 'on', 96, 1], [0, 'on', 120, 1]], {sr, sec: 10, inputs: {e1: x, e2: x}});
  let nan = 0, pk = 0; for (const y of [r.l, r.r]) for (const s of y) { if (!isFinite(s)) nan++; else if (Math.abs(s) > pk) pk = Math.abs(s); }
  const f = nan || db(pk) > 6; if (f) bad++;
  console.log((f ? 'FAIL ' : 'ok   ') + sr + ' Hz · ' + lab + ' · ' + k + ': NaN/Inf ' + nan + ', Spitze ' + db(pk).toFixed(1) + ' dBFS');
}
// synth wave "Eingang" with hot input, resonance 127
for (const k of ['noise+12', 'DC', 'square']) { const x = sig(k, 5, 48000); const p = vocP({}, {o1: {w: 7, c1: 64, c2: 127}, f: {type: 0, cut: 64, res: 127}, l1: {w: 1, f: 127}}); p.mode = 0;
  const r = render(p, [[0, 'on', 60, 1]], {sec: 5, inputs: {e1: x, e2: x}}); let nan = 0, pk = 0; for (const s of r.l) { if (!isFinite(s)) nan++; else pk = Math.max(pk, Math.abs(s)); }
  console.log('Synth Welle Eingang, RES 127 · ' + k + ': NaN/Inf ' + nan + ', Spitze ' + db(pk).toFixed(1) + ' dBFS'); }
console.log(bad ? 'FEHLER ' + bad : 'OK');
