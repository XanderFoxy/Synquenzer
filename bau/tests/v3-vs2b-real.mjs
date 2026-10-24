// VS2b: echte Gesangsaufnahmen (vocadito, CC BY 4.0: vocadito_1 mit zwei Noten-Annotationen A1/A2 aus mirdata-Testdaten;
// vocadito_10/14 ohne Noten-Wahrheit aus basic-pitch-Testdaten) durch pYIN-lite + segment der App.
// node v3-vs2b-real.mjs <index.html> [-v]
import fs from 'fs';
import {loadDsp} from './v3-vs2-corpus.mjs';
const DIR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/realvox/dl/';
const D = MAINX() ? loadDsp(process.argv[2] || '../dirigent-wt/index.html') : null;
function MAINX() { return process.argv[1] && process.argv[1].endsWith('v3-vs2b-real.mjs'); }
const V = process.argv.includes('-v');
export function readWav(f) {
  const b = fs.readFileSync(f); let p = 12, sr = 44100, ch = 1, bits = 16, data = null;
  while (p + 8 <= b.length) { const id = b.toString('ascii', p, p + 4), n = b.readUInt32LE(p + 4);
    if (id === 'fmt ') { ch = b.readUInt16LE(p + 10); sr = b.readUInt32LE(p + 12); bits = b.readUInt16LE(p + 22); }
    if (id === 'data') data = b.subarray(p + 8, p + 8 + n); p += 8 + n + (n & 1); }
  const N = data.length / (bits / 8) / ch, x = new Float32Array(N);
  for (let i = 0; i < N; i++) x[i] = data.readInt16LE(i * ch * 2) / 32768;
  return {x, sr};
}
// band-limited resample (Kaiser-ish windowed sinc, cutoff 7 kHz) to fs
export function resample(x, sr, fs) {
  const r = sr / fs, N = Math.floor(x.length / r), y = new Float32Array(N), fc = 7000 / sr, T = 48;
  for (let i = 0; i < N; i++) { const c = i * r, k0 = Math.floor(c); let s = 0;
    for (let k = k0 - T; k <= k0 + T; k++) { if (k < 0 || k >= x.length) continue; const d = k - c, w = 0.5 + 0.5 * Math.cos(Math.PI * d / (T + 1)); s += x[k] * (d === 0 ? 2 * fc : Math.sin(2 * Math.PI * fc * d) / (Math.PI * d)) * w; }
    y[i] = s; }
  return y;
}
const readAnn = f => fs.readFileSync(f, 'utf8').trim().split(/\r?\n/).map(l => l.split(',').map(Number)).map(([on, hz, dur]) => ({on, off: on + dur, m: 69 + 12 * Math.log2(hz / 440)}));
export function evalNotes(ns, ann, tol, tune) {
  const pm = (n, a) => tune == null ? Math.abs(n.m - a.m) <= 0.5 : n.n === Math.round(a.m - tune / 100);
  // mir_eval-artig: Einsatz ±tol, Tonhöhe ±50 ct (gegen die gemessene Höhe m), eins-zu-eins gierig nach Abstand
  const pairs = []; ann.forEach((a, i) => ns.forEach((n, j) => { const d = Math.abs(n.t0 - a.on); if (d <= tol && pm(n, a)) pairs.push([d, i, j]); }));
  pairs.sort((p, q) => p[0] - q[0]); const ua = new Set(), un = new Set();
  for (const [, i, j] of pairs) if (!ua.has(i) && !un.has(j)) { ua.add(i); un.add(j); }
  const hit = ua.size, P = ns.length ? hit / ns.length : 0, R = hit / ann.length;
  // falsche Zwischennoten: erkannte Noten ohne Partner, die innerhalb einer annotierten Note (±30 ms) beginnen
  let inner = 0, outside = 0; ns.forEach((n, j) => { if (un.has(j)) return; if (ann.some(a => n.t0 > a.on + 0.03 && n.t0 < a.off - 0.03)) inner++; else outside++; });
  return {hit, ann: ann.length, det: ns.length, P: +P.toFixed(3), R: +R.toFixed(3), F: +(P + R ? 2 * P * R / (P + R) : 0).toFixed(3), inner, outside};
}
const MAIN = process.argv[1] && process.argv[1].endsWith('v3-vs2b-real.mjs');
const ana = x => { const tr = D.pyin(x, {fs: 16000, fmin: 55, fmax: 1050}); return D.segment(tr, {snap: false, tuning: 'auto'}); };
const out = {};
if (MAIN) {
  const w = readWav(DIR + 'vocadito_1.wav'), x = resample(w.x, w.sr, 16000), t0 = Date.now(), sg = ana(x);
  out.v1 = {sec: +(x.length / 16000).toFixed(1), ms: Date.now() - t0, tune: sg.tuneCt};
  for (const A of ['A1', 'A2']) { const ann = readAnn(DIR + `vocadito_1_notes${A}.csv`); out.v1[A + '_50'] = evalNotes(sg.notes, ann, 0.05); out.v1[A + '_100'] = evalNotes(sg.notes, ann, 0.1); out.v1[A + '_midi100'] = evalNotes(sg.notes, ann, 0.1, sg.tuneCt); }
  out.v1.short = sg.notes.filter(n => n.t1 - n.t0 < 0.1).length;
  if (V) for (const n of sg.notes) console.log(n.t0.toFixed(3), (n.t1 - n.t0).toFixed(3), n.m.toFixed(2), n.n, n.by);
}
if (MAIN) for (const k of ['10', '14']) {
  const w = readWav(DIR + `vocadito_${k}.wav`), x = resample(w.x, w.sr, 16000), sg = ana(x);
  const ns = sg.notes; let same = 0; for (let i = 1; i < ns.length; i++) if (ns[i].n === ns[i - 1].n && ns[i].t0 - ns[i - 1].t1 < 0.02) same++;
  out['v' + k] = {sec: +(x.length / 16000).toFixed(1), det: ns.length, short: ns.filter(n => n.t1 - n.t0 < 0.1).length, sameSplit: same, tune: sg.tuneCt, notes: V ? ns.map(n => [+n.t0.toFixed(2), +(n.t1 - n.t0).toFixed(2), n.n]) : undefined};
}
if (MAIN) console.log(JSON.stringify(out, null, 1));
