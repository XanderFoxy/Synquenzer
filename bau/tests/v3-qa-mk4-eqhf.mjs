import {render, mkPatch} from './v3-mk1-node.mjs';
import {mKlick, db, rms} from './v3-mk1-ana.mjs';
const SR = 48000, FILE = process.env.MK_FILE;
const FXP = (fx, t) => Object.assign(mkPatch(t || {}), {mfx: {type: 0, spd: 64, dep: 0}, dly: {type: 0, sync: 0, time: 64, note: 8, dep: 0}, eq: {lf: 320, lg: 0, hf: 6000, hg: 0}}, fx || {});
const ev = [[0, 'on', 60, .7], [0, 'on', 64, .6], [0, 'on', 67, .6]];
const T = {e2: {a: 30, d: 64, s: 127, r: 40}};
let seed = 5; const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const nz = new Float32Array(SR * 2.2); for (let i = 0; i < nz.length; i++) nz[i] = (rnd() * 2 - 1) * .15;
for (const [name, from, to, g, key] of [['HF 1k->18k +12', 1000, 18000, 12, 'hf'], ['HF 18k->1k +12', 18000, 1000, 12, 'hf'], ['HF 1k->18k -12', 1000, 18000, -12, 'hf'], ['HF 18k->1k -12', 18000, 1000, -12, 'hf'], ['LF 40->1000 +12', 40, 1000, 12, 'lf'], ['LF 1000->40 +12', 1000, 40, 12, 'lf'], ['HG -12->+12 @1k', 1000, 1000, 0, 'hgj'], ['LG -12->+12 @1000', 1000, 1000, 0, 'lgj']]) {
  let fx, msg;
  if (key === 'hf') { fx = {eq: {lf: 320, lg: 0, hf: from, hg: g}}; msg = {mkSet: {'eq.hf': to}}; }
  else if (key === 'lf') { fx = {eq: {lf: from, lg: g, hf: 6000, hg: 0}}; msg = {mkSet: {'eq.lf': to}}; }
  else if (key === 'hgj') { fx = {eq: {lf: 320, lg: 0, hf: 1000, hg: -12}}; msg = {mkSet: {'eq.hg': 12}}; }
  else { fx = {eq: {lf: 1000, lg: -12, hf: 6000, hg: 0}}; msg = {mkSet: {'eq.lg': 12}}; }
  const r = render(FXP(fx, T), ev, {sec: 2, file: FILE, at: [[1, msg]]});
  const rn = render(FXP(fx), [], {sec: 2, file: FILE, at: [[0, {mkFxIn: {l: nz, r: nz}}], [1, msg]]});
  const seg = y => y.subarray(Math.round(.8 * SR), Math.round(1.3 * SR));
  const kc = mKlick(seg(r.l), SR, []), kn = mKlick(seg(rn.l), SR, []);
  console.log(name.padEnd(20), 'chord M-KLICK', kc.worst.toFixed(1), 'at', (0.8 + kc.at).toFixed(3), '| noise M-KLICK', kn.worst.toFixed(1), 'at', (0.8 + kn.at).toFixed(3));
}
