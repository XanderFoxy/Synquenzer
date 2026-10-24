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


// legato phrase, vibrato continues through the note changes (no per-note delay)
const phrase = [[60, 0.6], [62, 0.6], [64, 0.6], [65, 0.6], [67, 0.6], [65, 0.6], [64, 0.6], [62, 0.6]];
for (const [vib, hz] of [[70, 5], [70, 6.5], [80, 5], [80, 6.5]]) { const row = {};
  for (const k of ['base', 'new']) { let right = 0, tot = 0, msgs = 0, wrong = 0, never = 0, cnt = 0;
    for (let ph = 0; ph < 6; ph++) for (const tr of [-5, 0, 5]) {
      const ns = phrase.map(([m, d]) => [m + tr, d]); const L0 = legato(ns, 0.06, 0.2 + ph / 6 / 5.5);
      const x = up(render(L0.P, L0.end + 0.2, {vib, vibOn: 0.2, vibHz: hz})); const W = make(SRCS[k], SR); W.run(x);
      const L = W.msgs.filter(q => q.lit !== undefined); msgs += L.filter(q => q.lit >= 0).length;
      let t = 0.2 + ph / 6 / 5.5; for (const [m, d] of ns) { const A = t + 0.1, B = t + d - 0.06; let cur = -1, last = 0, r = 0;
        const add = (a, b, n) => { const lo = Math.max(a, A), hi = Math.min(b, B); if (hi > lo && n === m) r += hi - lo; };
        for (const q of L) { add(last, q.f / SR, cur); cur = q.lit; last = q.f / SR; } add(last, B, cur);
        right += r; tot += B - A; cnt++; if (r === 0) never++; t += d; }
      wrong += L.filter(q => q.lit >= 0 && !ns.some(([m]) => m === q.lit)).length; }
    row[k] = `right key ${(100 * right / tot).toFixed(0)} % of sung time, ${(msgs / cnt).toFixed(1)} msgs/note, ${wrong} keys never sung, ${never}/${cnt} notes never right`; }
  console.log(`legato + continuous vibrato ±${vib} ct ${hz} Hz | base: ${row.base}\n${' '.repeat(38)}new : ${row.new}`); }
