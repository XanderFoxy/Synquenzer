// T11: Live-Taste mit Vibrato (±30/±50/±70/±100 ct, 5,5 Hz) und Anschleifen: wie oft wechselt die Taste je gehaltener Note? Zeit bis an.
import fs from 'fs';
const html = fs.readFileSync('../dirigent-wt/index.html', 'utf8');
const a = html.indexOf('const ST_WK = `') + 'const ST_WK = `'.length, b = html.indexOf("registerProcessor('synq-stimme', SynqStimme);`;") + "registerProcessor('synq-stimme', SynqStimme);".length;
const SRC = html.slice(a, b);
function make(sr, mpm) {
  let Cls = null; const msgs = [];
  class AWP { constructor() { this.port = {postMessage: m => msgs.push(m), onmessage: null}; } }
  globalThis.currentFrame = 0;
  new Function('AudioWorkletProcessor', 'registerProcessor', 'sampleRate', SRC)(AWP, (n, c) => { Cls = c; }, sr);
  const p = new Cls({processorOptions: {block: 4096, mpm}});
  return {msgs, run(x) { const out = [[new Float32Array(128)]]; for (let i = 0; i + 128 <= x.length; i += 128) { globalThis.currentFrame = i; p.process([[x.subarray(i, i + 128)], [new Float32Array(128)]], out); } }};
}
const SR = 48000, F = [[700, 120, 1], [1150, 150, 0.45], [2500, 200, 0.2]];
const fg = f => { let g = 0.02; for (const [c, bw, a] of F) g += a / Math.sqrt(1 + ((f - c) / (bw / 2)) ** 2); return g; };
for (const vib of [30, 50, 70, 100]) {
  const notes = [57, 60, 64, 62, 59], dur = 1.5, n = Math.ceil((notes.length * dur + 0.5) * SR), x = new Float32Array(n);
  let ph = 0;
  notes.forEach((m, k) => { const a0 = Math.round((0.3 + k * dur) * SR), L = Math.round((dur - 0.05) * SR); for (let j = 0; j < L; j++) { const t = j / SR; let mm = m - 0.8 * Math.exp(-t / 0.03); if (t > 0.25) mm += vib / 100 * Math.min(1, (t - 0.25) / 0.1) * Math.sin(2 * Math.PI * 5.5 * t); const f0 = 440 * Math.pow(2, (mm - 69) / 12); ph += 2 * Math.PI * f0 / SR; let s = 0; for (let h = 1; h * f0 < 7000; h++) s += fg(h * f0) / h * Math.sin(h * ph); x[a0 + j] = 0.12 * s * Math.min(1, t / 0.012) * Math.min(1, (L - j) / SR / 0.025); } });
  const W = make(SR, {src: 'voice', lock: false}); W.run(x);
  const lit = W.msgs.filter(q => q.lit !== undefined);
  const per = notes.map((m, k) => { const a0 = (0.3 + k * dur) * SR, b0 = a0 + dur * SR; const ms = lit.filter(q => q.f >= a0 && q.f < b0); const on = ms.find(q => q.lit === m); const wrong = ms.filter(q => q.lit >= 0 && q.lit !== m).map(q => q.lit); return {m, wechsel: ms.length, an: on ? Math.round((on.f - a0) / SR * 1000) : null, falsch: [...new Set(wrong)].join('/')}; });
  console.log(`Vibrato ±${vib} ct:`, JSON.stringify(per));
}
