// VS2-fix: Uebersprech-Sperre im Worklet (Node-Attrappe): nur Uebersprechen -> keine Taste; Stimme + Uebersprechen -> Stimme; Rechenzeit.
import fs from 'fs';
const html = fs.readFileSync(process.argv[2] || '../dirigent-wt/index.html', 'utf8');
const a = html.indexOf('const ST_WK = `') + 'const ST_WK = `'.length, b = html.indexOf("registerProcessor('synq-stimme', SynqStimme);`;") + "registerProcessor('synq-stimme', SynqStimme);".length;
const SRC = html.slice(a, b);
let fail = 0; const ok = (c, m) => { console.log((c ? 'OK  ' : 'FAIL ') + m); if (!c) fail++; };
ok(![...SRC].some(c => c.charCodeAt(0) > 127), 'Worklet ASCII');
const SR = 48000;
function make(mpm) {
  let Cls = null; const msgs = [];
  class AWP { constructor() { this.port = {postMessage: m => msgs.push(m), onmessage: null}; } }
  globalThis.currentFrame = 0;
  new Function('AudioWorkletProcessor', 'registerProcessor', 'sampleRate', SRC)(AWP, (n, c) => { Cls = c; }, SR);
  const p = new Cls({processorOptions: {block: 4096, mpm}}); const ts = [];
  return {p, msgs, ts, run(x, ref) { const out = [[new Float32Array(128)]]; for (let i = 0; i + 128 <= x.length; i += 128) { globalThis.currentFrame = i; const t0 = performance.now(); p.process([[x.subarray(i, i + 128)], [ref.subarray(i, i + 128)]], out); ts.push(performance.now() - t0); } }};
}
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
function tone(n, notes, amp, harm = 8) { const x = new Float32Array(n); for (const [t0, dur, m] of notes) { const f = hz(m), a0 = Math.round(t0 * SR), L = Math.round(dur * SR); for (let j = 0; j < L && a0 + j < n; j++) { const t = j / SR; let v = 0; for (let k = 1; k <= harm; k++) v += Math.sin(2 * Math.PI * k * f * t) / k; x[a0 + j] += amp * v * Math.min(1, t / 0.01, (L - j) / SR / 0.02); } } return x; }
const N = SR * 8, bass = [], mel = [];
for (let i = 0; i < 16; i++) bass.push([i * 0.5, 0.45, [36, 33, 48, 43][i % 4]]);
for (let i = 0; i < 16; i++) mel.push([i * 0.5, 0.45, [60, 64, 67, 72][i % 4]]);
const ref = tone(N, bass, 0.3); { const m2 = tone(N, mel, 0.15); for (let i = 0; i < N; i++) ref[i] += m2[i]; }
const lat = 0.06, D = Math.round(lat * SR);
const leak = (g) => { const y = new Float32Array(N); for (let i = D; i < N; i++) y[i] = ref[i - D] * g; let s = 12345; for (let i = 0; i < N; i++) { s = (s * 16807) % 2147483647; y[i] += (s / 2147483647 - 0.5) * 0.0008; } return y; };
for (const gdb of [-30, -20]) {
  const g = Math.pow(10, gdb / 20), bl = Math.pow(10, (gdb + 10) / 10), bb = Math.pow(10, (gdb + 3) / 10);
  for (const unc of [10, 50]) {
    const W0 = make({src: 'voice', lock: false}); W0.run(leak(g), ref);
    const W = make({src: 'voice', lock: false, bl, bb, lat: lat * 1000, unc}); W.run(leak(g), ref);
    const on0 = W0.msgs.filter(m => m.lit >= 0).length, on = W.msgs.filter(m => m.lit >= 0).length;
    ok(on === 0, `nur Uebersprechen ${gdb} dB unc ${unc}: Taste an ${on}x (ohne Sperre ${on0}x)`);
    // voice (other pitches, -20 dBFS-ish) + bleed
    const vn = [[1, 0.8, 62], [2, 0.8, 65], [3, 0.8, 69], [4, 0.8, 60], [5, 0.8, 72]];
    const v = tone(N, vn, 0.08, 6), x = leak(g); for (let i = 0; i < N; i++) x[i] += v[i];
    const W2 = make({src: 'voice', lock: false, bl, bb, lat: lat * 1000, unc}); W2.run(x, ref);
    const got = W2.msgs.filter(m => m.lit >= 0).map(m => m.lit);
    const W3 = make({src: 'voice', lock: false}); W3.run(x, ref); console.log('   ohne Sperre:', W3.msgs.filter(m => m.lit >= 0).map(m => m.lit).join(','));
    const refOnly = [36, 33, 48, 43, 64, 67];
    ok(vn.every(([, , m]) => got.includes(m)) && !got.some(m => refOnly.includes(m)), `Stimme + Uebersprechen ${gdb} dB unc ${unc}: Tasten ${got.join(',')} (soll ${vn.map(q => q[2]).join(',')}, keine reine Begleit-Taste)`);
    const ts = W2.ts.slice().sort((p, q) => p - q);
    console.log(`   Render-Block p99 ${ts[Math.floor(ts.length * 0.99)].toFixed(3)} / p99.9 ${ts[Math.floor(ts.length * 0.999)].toFixed(3)} / max ${ts[ts.length - 1].toFixed(3)} ms, Summe ${(ts.reduce((p, q) => p + q, 0) / (N / SR) / 10).toFixed(2)} % Echtzeit`);
  }
}
console.log(fail ? 'FAIL ' + fail : 'ALLE OK');
