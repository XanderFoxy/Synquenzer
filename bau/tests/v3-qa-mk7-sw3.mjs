import fs from 'fs';
const D = new URL('..', import.meta.url).pathname, FILE = D + 'mk-br-MK7/index.html'; process.env.MK_FILE = FILE;
const {render, vocP} = await import('./v3-mk7-node.mjs');
const sr = 48000, W = render(vocP({}, {}), [], {sec: .01}).MKW, src = fs.readFileSync(FILE, 'utf8');
const mkVowel = new Function('W', src.slice(src.indexOf('/*MKV{*/'), src.indexOf('/*}MKV*/')) + '\n;return mkVowel;')();
const vox = mkVowel({f0: 110, v: 'a', sec: 4, sr, rms: -20}, W);
const ch = [[0, 'on', 48, .8], [0, 'on', 52, .8], [0, 'on', 55, .8], [0, 'on', 59, .8]];
function hp(x) { // 4th order HP 5 kHz (two biquads)
  const out = Float64Array.from(x); for (const Q of [.5412, 1.3066]) { const w = 2 * Math.PI * 5000 / sr, c = Math.cos(w), al = Math.sin(w) / (2 * Q), b0 = (1 + c) / 2, b1 = -(1 + c), b2 = b0, a0 = 1 + al, a1 = -2 * c, a2 = 1 - al; let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < out.length; i++) { const xi = out[i], y = (b0 * xi + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = xi; y2 = y1; y1 = y; out[i] = y; } } return out; }
for (const [lab, m0, m1] of [['Single → Vocoder', 0, 3], ['Vocoder → Single', 3, 0]]) {
  const p = vocP({efs: 40, res: 64}, {}); p.mode = m0;
  const r = render(p, ch, {sec: 2, at: [[1.5, {mkSet: {mode: m1}}]], inputs: {e2: vox}}), h = hp(r.l);
  const row = []; for (let t = 1.44; t < 1.6; t += .004) { let e = 0; const a = Math.round(t * sr); for (let i = a; i < a + 96; i++) e += h[i] * h[i]; row.push(t.toFixed(3) + ':' + (10 * Math.log10(e / 96 + 1e-20)).toFixed(0)); }
  console.log(lab + ' HF (>5 kHz) dB je 2 ms: ' + row.join(' '));
}
