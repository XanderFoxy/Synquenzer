// G-MK567-merge-fix: vocoder output of two files bit-compared (Node harness), incl. FC-MOD, limiter switch, pan
import fs from 'fs';
const [A, B] = process.argv.slice(2);
async function go(file) {
  process.env.MK_FILE = file;
  const m = await import('./v3-mk7-node.mjs?' + encodeURIComponent(file));
  const src = fs.readFileSync(file, 'utf8'), a = src.indexOf('/*MKV{*/'), b = src.indexOf('/*}MKV*/');
  const W = m.render(m.vocP({}, {}), [], {sec: .01, file}).MKW, mkVowel = new Function('W', src.slice(a, b) + '\n;return mkVowel;')();
  const vox = mkVowel({f0: 110, v: ['a', 'e', 'i', 'o', 'u'], seg: .5, sec: 4, sr: 48000, rms: -20}, W);
  const ev = []; for (let t = 0; t < 4; t += .5) for (const nt of [48, 55, 60, 64]) { ev.push([t, 'on', nt, .8]); ev.push([t + .45, 'off', nt]); }
  const out = [];
  const chp = Array.from({length: 16}, (_, i) => (i * 9) % 127 - 63);
  for (const [nm, p, o] of [['voc', m.vocP({res: 64, msrc: 2, mint: 30}, {f: {type: 0, cut: 127}}), {}],
    ['pan', m.vocP({res: 30, msrc: 2, mint: -40, chp, efs: 90}, {}), {}],
    ['lim', m.vocP({res: 64, msrc: 2, mint: 30}, {}), {at: [[1, {set: {mkLim: 1}}], [2.5, {set: {mkLim: 0}}]]}]]) {
    const r = m.render(p, ev, Object.assign({sec: 4, inputs: {e2: vox}, file}, o)); out.push([nm, r.l, r.r]);
  }
  return out;
}
const x = await go(A), y = await go(B);
for (let i = 0; i < x.length; i++) { let d = 0, e = 0; for (let n = 0; n < x[i][1].length; n++) { d = Math.max(d, Math.abs(x[i][1][n] - y[i][1][n]), Math.abs(x[i][2][n] - y[i][2][n])); e = Math.max(e, Math.abs(x[i][1][n])); } console.log(x[i][0], 'maxDiff', d, 'peak', e.toFixed(3)); }
