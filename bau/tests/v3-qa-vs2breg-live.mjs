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
    if (o.vib && amp > 0) m += o.vib / 100 * Math.sin(2 * Math.PI * (o.vibHz || 5.5) * t);
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
const cases = [];
// 1 staccato 1/16 at 140 BPM (107 ms grid, 75 ms sung)
{ const ms = [57, 60, 64, 60, 57, 60, 64, 67, 64, 60, 57, 55], P = []; ms.forEach((m, k) => { const t0 = 0.2 + k * 0.107; P.push(...env(t0, t0 + 0.075, m)); }); P.push({t: 3, m: 55, amp: 0}); cases.push(['staccato 1/16 @140 (75 ms)', P, 1.8, ms]); }
// 2 octave leaps legato, glide 60 ms
{ const L = legato([[57, 0.4], [69, 0.4], [57, 0.4], [69, 0.4]], 0.06); cases.push(['octave leaps legato', L.P, L.end, [57, 69, 57, 69]]); }
// 3 long held note 4 s, slow drift ±40 ct and light vibrato
{ cases.push(['held 4 s, drift ±40 ct', env(0.2, 4.2, 62), 4.5, [62], {drift: 40, vib: 25}]); }
// 4 neighbour ornament (whole step up) legato, 120/150/200 ms, glide 30 ms
for (const d of [0.12, 0.15, 0.2]) { const L = legato([[60, 0.4], [62, d], [60, 0.4]], 0.03); cases.push([`neighbour 62 ${d * 1000} ms legato`, L.P, L.end, [60, 62, 60]]); }
// 5 lower neighbour (half step) legato 150 ms
{ const L = legato([[64, 0.4], [63, 0.15], [64, 0.4]], 0.03); cases.push(['lower half-step neighbour 150 ms', L.P, L.end, [64, 63, 64]]); }
// 6 phrase ending on a short lower note (deliberate), 150 ms, 3 dB softer
{ const L = legato([[67, 0.3], [64, 0.15, 0.7]], 0.03); cases.push(['ends on short lower note 150 ms (-3 dB)', L.P, L.end, [67, 64]]); }
// 7 isolated short syllable 80 ms between pauses
{ const P = [...env(0.2, 0.5, 60), ...env(0.7, 0.78, 64), ...env(1.0, 1.3, 62)]; P.push({t: 2, m: 62, amp: 0}); cases.push(['isolated 80 ms note', P, 1.6, [60, 64, 62]]); }
// 8 legato thirds 1/8 at 100 BPM with 50 ms glide, slight vibrato
{ const L = legato([[60, 0.3], [64, 0.3], [67, 0.3], [64, 0.3], [60, 0.3], [64, 0.3]], 0.05); cases.push(['legato thirds 1/8 @100', L.P, L.end, [60, 64, 67, 64, 60, 64], {vib: 30}]); }
// 9 repeated same pitch legato with soft re-articulation 4 dB (a "dah-dah" without real dip) – stays one or two? (report only)
// 10 legato semitone steps 1/8 @ 120 (250 ms), glide 40 ms
{ const L = legato([[60, 0.25], [61, 0.25], [62, 0.25], [63, 0.25], [64, 0.25]], 0.04); cases.push(['chromatic legato 1/8 @120', L.P, L.end, [60, 61, 62, 63, 64]]); }
// 11 high soprano register, 1/8 @ 100
{ const L = legato([[76, 0.3], [79, 0.3], [81, 0.3], [84, 0.6]], 0.04); cases.push(['soprano E5-C6', L.P, L.end, [76, 79, 81, 84], {vib: 40}]); }
// 12 low bass register
{ const L = legato([[43, 0.4], [45, 0.4], [48, 0.4], [43, 0.6]], 0.05); cases.push(['bass G2-C3', L.P, L.end, [43, 45, 48, 43]]); }
// 13 quick grace note (acciaccatura) 60 ms before main note, legato
{ const L = legato([[62, 0.06], [60, 0.5]], 0.02); cases.push(['grace 62 (60 ms) → 60 (report)', L.P, L.end, null]); }
// 14 two notes a whole step apart, each 1/16 @ 100 (150 ms), alternating (slow trill)
{ const ns = []; for (let k = 0; k < 8; k++) ns.push([k % 2 ? 62 : 60, 0.15]); const L = legato(ns, 0.03); cases.push(['whole-step alternation 150 ms', L.P, L.end, ns.map(x => x[0])]); }
// 15 note with wide vibrato then a legato step of 1 semitone
{ const L = legato([[64, 0.8], [65, 0.8]], 0.05); cases.push(['vib ±60 then +1 st legato', L.P, L.end, [64, 65], {vib: 60}]); }

// expected spans from the path: each note = [m, start, end] taken from the case definition via segment of the 'new' DSP is circular;
// instead use the lit stream: report the sequence of lit keys (collapsed) and the time each key came on
for (const [name, P, dur, exp, o] of cases) {
  const x = up(render(P, dur, o || {})); const out = {};
  for (const k of ['base', 'new']) { const W = make(SRCS[k], SR); W.run(x); const L = W.msgs.filter(m => m.lit !== undefined);
    out[k] = L.filter(m => m.lit >= 0).map(m => m.lit + '@' + (m.f / SR).toFixed(2)).join(' '); out[k + 'N'] = L.filter(m => m.lit >= 0).length; }
  console.log(name.padEnd(42) + ' exp ' + (exp ? exp.join(',') : '-') + '\n   new  (' + out.newN + ') ' + out.new + '\n   base (' + out.baseN + ') ' + out.base);
}
