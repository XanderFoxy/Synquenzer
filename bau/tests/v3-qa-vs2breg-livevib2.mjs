// QA regression VS2b: live key (worklet synq-stimme) on plain singing cases, base 4.5.1 vs new 4.5.2
// QA regression VS2b: plain singing cases that must keep working (no stress material), App-DSP (VSDSP) base 4.5.1 vs new 4.5.2.
// Formant voice like T15; each case has an expected note list.
import fs from 'fs';
const SCR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const load = f => { const s = fs.readFileSync(f, 'utf8'); const a = s.indexOf('/* VSDSP-BEGIN */'), b = s.indexOf('/* VSDSP-END */'); return new Function(s.slice(a, b) + ';return vsDspMake();')(); };
const WK = f => { const html = fs.readFileSync(f, 'utf8'); const a = html.indexOf('const ST_WK = `') + 'const ST_WK = `'.length, b = html.indexOf("registerProcessor('synq-stimme', SynqStimme);`;") + "registerProcessor('synq-stimme', SynqStimme);".length; return html.slice(a, b); };
const SRCS = {base: WK(SCR + 'synq-snapshots/G-P1b-gruppe-fix.html'), new: WK(SCR + 'dirigent-wt/index.html')};
function make(SRC, sr) { let Cls = null; const msgs = []; class AWP { constructor() { this.port = {postMessage: m => msgs.push(m), onmessage: null}; } }
  globalThis.currentFrame = 0; new Function('AudioWorkletProcessor', 'registerProcessor', 'sampleRate', SRC)(AWP, (n, c) => { Cls = c; }, sr);
  const p = new Cls({processorOptions: {block: 4096, mpm: {src: 'voice', lock: false}}});
  return {p, msgs, run(x) { const out = [[new Float32Array(128)]]; for (let i = 0; i + 128 <= x.length; i += 128) { globalThis.currentFrame = i; p.process([[x.subarray(i, i + 128)], [new Float32Array(128)]], out); } }}; }
const SR = 48000; const up = x => { const y = new Float32Array(x.length * 3); for (let i = 0; i < y.length; i++) { const p = i / 3, k = Math.floor(p), f = p - k; y[i] = (x[k] || 0) * (1 - f) + (x[k + 1] || 0) * f; } return y; };
const FS = 16000, AM = Array.from({length: 12}, (_, k) => [9, 11, 0, 2, 4, 5, 7].includes(k));
const F = [[730, 90, 1], [1090, 110, 0.5], [2440, 170, 0.25]];
const fg = f => { let g = 0.03; for (const [c, bw, aa] of F) g += aa / Math.sqrt(1 + ((f - c) / (bw / 2)) ** 2); return g; };
function render(path, dur, o = {}) {
  const n = Math.ceil(dur * FS), x = new Float32Array(n); let ph = 0, k = 0, seed = o.seed || 5; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < n; i++) {
    const t = i / FS; while (k + 1 < path.length && path[k + 1].t <= t) k++;
    const p0 = path[k], p1 = path[Math.min(k + 1, path.length - 1)], u = p1.t > p0.t ? Math.max(0, Math.min(1, (t - p0.t) / (p1.t - p0.t))) : 0;
    let m = p0.m + (p1.m - p0.m) * u, amp = t < path[0].t ? 0 : p0.amp + (p1.amp - p0.amp) * u;
    if (o.vib && amp > 0) { const ra = o.vibRamp ? Math.max(0, Math.min(1, (t - o.vibOn) / o.vibRamp)) : 1; m += ra * o.vib / 100 * Math.sin(2 * Math.PI * (o.vibHz || 5.5) * (t - (o.vibOn || 0))); }
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

// share of the note time (from 60 ms after onset to the end) during which the right key is lit; lit messages per note
const run = (k, m, t0, dur, o) => { const P = env(t0, t0 + dur, m); P.push({t: t0 + dur + 0.5, m, amp: 0});
  const x = up(render(P, t0 + dur + 0.4, o)); const W = make(SRCS[k], SR); W.run(x); const L = W.msgs.filter(q => q.lit !== undefined);
  let cur = -1, last = 0, right = 0; const A = t0 + 0.06, B = t0 + dur; const seg = (a, b, key) => { const lo = Math.max(a, A), hi = Math.min(b, B); if (hi > lo && key === m) right += hi - lo; };
  for (const q of L) { const tt = q.f / SR; seg(last, tt, cur); cur = q.lit; last = tt; } seg(last, B, cur);
  return {right: right / (B - A), n: L.filter(q => q.lit >= 0).length, wrong: L.filter(q => q.lit >= 0 && q.lit !== m).length}; };
for (const [label, mk] of [['vibrato from onset', (vib, t0) => ({vib, vibOn: t0})], ['vibrato after 150 ms ramp', (vib, t0) => ({vib, vibOn: t0 + 0.1, vibRamp: 0.15})]])
for (const vib of [30, 50, 60, 70, 80, 100]) { const row = {};
  for (const k of ['base', 'new']) { let r = 0, n = 0, w = 0, cnt = 0, never = 0;
    for (let ph = 0; ph < 8; ph++) for (const m of [55, 60, 64, 69]) { const t0 = 0.2 + ph / 8 / 5.5; const o = mk(vib, t0); o.vibOn = (o.vibOn || t0) - ph / 8 / 5.5 * 0; const q = run(k, m, t0, 1.2, Object.assign(o, {vibOn: o.vibOn - ph / 8 / 5.5})); r += q.right; n += q.n; w += q.wrong; cnt++; if (q.right === 0) never++; }
    row[k] = `right key ${(100 * r / cnt).toFixed(0)} % of note time, ${(n / cnt).toFixed(1)} lit msgs/note, ${w} wrong, ${never}/${cnt} notes never right`; }
  console.log(`${label} ±${vib} ct | base: ${row.base} | new: ${row.new}`); }
