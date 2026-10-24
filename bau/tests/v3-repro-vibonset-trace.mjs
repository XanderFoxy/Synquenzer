// trace of lit messages for one held C4 (60) with ±80 ct 5.5 Hz vibrato from onset, both versions
import fs from 'fs';
const SCR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const wk = f => { const h = fs.readFileSync(f, 'utf8'), A = 'const ST_WK = `', a = h.indexOf(A) + A.length, E = "registerProcessor('synq-stimme', SynqStimme);"; return h.slice(a, h.indexOf(E, a) + E.length); };
const SR = 48000;
for (const [k, f] of [['4.5.1', 'synq-snapshots/G-P1b-gruppe-fix.html'], ['4.5.2', 'dirigent-wt/index.html']]) for (const phi of [0, Math.PI]) {
  let C; const out = []; class AWP { constructor() { this.port = {postMessage: m => out.push(m)}; } }
  new Function('AudioWorkletProcessor', 'registerProcessor', 'sampleRate', wk(SCR + f))(AWP, (n, c) => { C = c; }, SR);
  const p = new C({processorOptions: {block: 4096, mpm: {src: 'voice', lock: false}}});
  const n = SR * 2, x = new Float32Array(n); let ph = 0; const t0 = 0.2;
  for (let i = 0; i < n; i++) { const t = i / SR, a = t < t0 ? 0 : t < t0 + 0.015 ? (t - t0) / 0.015 : t < 1.7 ? 1 : 0; const m = 60 + 0.8 * Math.sin(2 * Math.PI * 5.5 * (t - t0) + phi), f0 = 440 * 2 ** ((m - 69) / 12); ph += 2 * Math.PI * f0 / SR; let v = 0; for (let h = 1; h * f0 < 6000; h++) v += Math.sin(h * ph) / h; x[i] = 0.1 * a * v; }
  const o = [[new Float32Array(128)]], z = new Float32Array(128); for (let i = 0; i + 128 <= n; i += 128) { globalThis.currentFrame = i; p.process([[x.subarray(i, i + 128)], [z]], o); }
  const L = out.filter(m => m.lit !== undefined).map(m => `${((m.f / SR - t0) * 1000).toFixed(0)}ms:${m.lit}`);
  console.log(`${k} phase ${phi.toFixed(2)} (sung 60): ` + L.join(' '));
}
