// QA regression VS2b: plain singing cases that must keep working (no stress material), App-DSP (VSDSP) base 4.5.1 vs new 4.5.2.
// Formant voice like T15; each case has an expected note list.
import fs from 'fs';
const SCR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const load = f => { const s = fs.readFileSync(f, 'utf8'); const a = s.indexOf('/* VSDSP-BEGIN */'), b = s.indexOf('/* VSDSP-END */'); return new Function(s.slice(a, b) + ';return vsDspMake();')(); };
const DS = {base: load(SCR + 'synq-snapshots/G-P1b-gruppe-fix.html'), new: load(SCR + 'dirigent-wt/index.html')};
const FS = 16000, AM = Array.from({length: 12}, (_, k) => [9, 11, 0, 2, 4, 5, 7].includes(k));
const F = [[730, 90, 1], [1090, 110, 0.5], [2440, 170, 0.25]];
const fg = f => { let g = 0.03; for (const [c, bw, aa] of F) g += aa / Math.sqrt(1 + ((f - c) / (bw / 2)) ** 2); return g; };
function render(path, dur, o = {}) {
  const n = Math.ceil(dur * FS), x = new Float32Array(n); let ph = 0, k = 0, seed = o.seed || 5; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < n; i++) {
    const t = i / FS; while (k + 1 < path.length && path[k + 1].t <= t) k++;
    const p0 = path[k], p1 = path[Math.min(k + 1, path.length - 1)], u = p1.t > p0.t ? Math.max(0, Math.min(1, (t - p0.t) / (p1.t - p0.t))) : 0;
    let m = p0.m + (p1.m - p0.m) * u, amp = t < path[0].t ? 0 : p0.amp + (p1.amp - p0.amp) * u;
    if (o.vib && amp > 0) m += o.vib / 100 * Math.sin(2 * Math.PI * (o.vibHz || 5.5) * (t - 0.2));
    if (o.drift && amp > 0) m += o.drift / 100 * Math.sin(2 * Math.PI * 0.4 * t);
    const f0 = 440 * Math.pow(2, (m - 69) / 12); ph += 2 * Math.PI * f0 / FS;
    let v = 0; for (let h = 1; h * f0 < 7000; h++) v += fg(h * f0) / h * Math.sin(h * ph);
    x[i] = 0.1 * amp * v + (rnd() - 0.5) * 0.0004;
  }
  return x;
}
const env = (t0, t1, m, a = 1) => [{t: t0, m, amp: 0}, {t: t0 + 0.012, m, amp: a}, {t: t1 - 0.02, m, amp: a}, {t: t1, m, amp: 0}];
// legato line: [[midi, dur, amp]] with glide g s between notes
const legato = (ns, g, t0 = 0.2) => { const P = [{t: t0, m: ns[0][0], amp: 0}, {t: t0 + 0.012, m: ns[0][0], amp: ns[0][2] || 1}]; let t = t0;
  ns.forEach(([m, d, a], k) => { if (k) P.push({t: t - g / 2, m: ns[k - 1][0], amp: ns[k - 1][2] || 1}, {t: t + g / 2, m, amp: a || 1}); t += d; });
  const L = ns[ns.length - 1]; P.push({t: t - 0.02, m: L[0], amp: L[2] || 1}, {t, m: L[0], amp: 0}, {t: t + 1, m: L[0], amp: 0}); return {P, end: t + 0.3}; };

const ns = [[60, 0.6], [62, 0.6], [64, 0.6], [65, 0.6], [67, 0.6], [65, 0.6], [64, 0.6], [62, 0.6]];
for (const vib of [60, 80, 100]) { const L = legato(ns, 0.06); const x = render(L.P, L.end, {vib});
  for (const k of ['base', 'new']) { const D = DS[k]; const r = D.segment(D.pyin(x, {fs: FS}), {snap: false, scale: AM, root: 0, tuning: 'auto'}); console.log('vib', vib, k, r.notes.map(q => q.n).join(',')); } }
