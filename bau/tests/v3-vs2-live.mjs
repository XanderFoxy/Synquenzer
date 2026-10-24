// VS2 Live-Weg im Node: Worklet „synq-stimme“ aus index.html mit Attrappe (N7V-14 Leuchten ≤ 60 ms, N7V-15 Rechenzeit ≤ 3 %),
// Maske (Zustand halten), Oktave sperren live, ASCII.
import fs from 'fs';
import {melody, renderVoice, renderSynth} from './v3-vs2-corpus.mjs';
const html = fs.readFileSync(process.argv[2] || '../dirigent-wt/index.html', 'utf8');
const a = html.indexOf('const ST_WK = `') + 'const ST_WK = `'.length, b = html.indexOf("registerProcessor('synq-stimme', SynqStimme);`;") + "registerProcessor('synq-stimme', SynqStimme);".length;
const SRC = html.slice(a, b);
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
ok(![...SRC].some(c => c.charCodeAt(0) > 127) && !SRC.includes('</script'), 'Worklet ASCII, ohne </script');
function make(sr, mpm) {
  let Cls = null; const msgs = [];
  class AWP { constructor() { this.port = {postMessage: m => msgs.push(m), onmessage: null}; } }
  globalThis.currentFrame = 0;
  new Function('AudioWorkletProcessor', 'registerProcessor', 'sampleRate', SRC)(AWP, (n, c) => { Cls = c; }, sr);
  const p = new Cls({processorOptions: {block: 4096, mpm}});
  return {p, msgs, run(x, ref) { const out = [[new Float32Array(128)]]; for (let i = 0; i + 128 <= x.length; i += 128) { globalThis.currentFrame = i; p.process([[x.subarray(i, i + 128)], [ref ? ref.subarray(i, i + 128) : new Float32Array(128)]], out); } }};
}
const SR = 48000;
// upsample 16 kHz corpus signal to 48 kHz (linear) for the worklet input
const up = x => { const y = new Float32Array(x.length * 3); for (let i = 0; i < y.length; i++) { const p = i / 3, k = Math.floor(p), f = p - k; y[i] = (x[k] || 0) * (1 - f) + (x[k + 1] || 0) * f; } return y; };
// N7V-14: stable tone → key on; harmonic voice-like tone at 220/440/110 Hz after 0.5 s noise floor
for (const f of [110, 220, 440, 660]) {
  const n = SR * 1.5, x = new Float32Array(n), T0 = SR * 0.5;
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5;
  for (let i = 0; i < n; i++) { let v = rnd() * 0.0006; if (i >= T0) { const t = (i - T0) / SR; for (let k = 1; k <= 12; k++) v += 0.1 / k * Math.sin(2 * Math.PI * k * f * t); v *= Math.min(1, t / 0.01); } x[i] = v; }
  const W = make(SR, {src: 'voice', lock: false}); W.run(x);
  const lit = W.msgs.filter(m => m.lit !== undefined), first = lit.find(m => m.lit >= 0);
  const want = Math.round(69 + 12 * Math.log2(f / 440)), dt = first ? (first.f - T0) / SR * 1000 : null;
  ok(first && first.lit === want && dt <= 60, `N7V-14 ${f} Hz → Taste ${first && first.lit} (soll ${want}) nach ${dt != null ? dt.toFixed(1) : '–'} ms (≤ 60)`);
  ok(lit.filter(m => m.lit >= 0).length === 1, `  genau eine Meldung (kein Flackern): ${lit.length}`);
}
// off after the tone stops (≤ 60 ms)
{
  const n = SR * 1.2, x = new Float32Array(n);
  for (let i = 0; i < SR * 0.8; i++) { const t = i / SR; x[i] = 0.2 * Math.sin(2 * Math.PI * 220 * t) + 0.1 * Math.sin(2 * Math.PI * 440 * t); }
  const W = make(SR, {src: 'voice'}); W.run(x);
  const off = W.msgs.find(m => m.lit === -1), dt = off ? (off.f - SR * 0.8) / SR * 1000 : null;
  ok(off && dt <= 80, `Taste aus nach dem Ende: ${dt != null ? dt.toFixed(1) : '–'} ms (≤ 80)`);
}
// mask: hops overlapping a mask interval hold the state (a click burst in the middle of a note changes nothing)
{
  const n = SR * 1.5, x = new Float32Array(n), C = SR * 0.8;
  for (let i = 0; i < n; i++) { const t = i / SR; x[i] = 0.15 * Math.sin(2 * Math.PI * 220 * t) + 0.08 * Math.sin(2 * Math.PI * 440 * t); }
  for (let j = 0; j < SR * 0.03; j++) x[C + j] += 0.9 * Math.sin(2 * Math.PI * 1500 * j / SR) * Math.exp(-j / (0.004 * SR));
  const W1 = make(SR, {src: 'voice'}); W1.run(x);
  const W2 = make(SR, {src: 'voice'}); W2.p.port.onmessage && 0; W2.p.mk.push([C - 240, C + SR * 0.035]); W2.run(x);
  const ch1 = W1.msgs.filter(m => m.lit !== undefined).length, ch2 = W2.msgs.filter(m => m.lit !== undefined).length;
  ok(ch2 === 1, `Maske: Klick mitten in der Note → mit Maske ${ch2} Meldung (ohne Maske ${ch1})`);
}
// N2-VS2-02 live: saw with sine sub −1 oct, octave lock on → lit = played note; off → one octave down
{
  const mel = [{on: 0.2, dur: 1.0, midi: 57, legato: false}], sig = renderSynth(mel, {sub: 'sine', subAmp: 0.6}), x = up(sig.x);
  const W1 = make(SR, {src: 'inst', lock: true}); W1.run(x); const W0 = make(SR, {src: 'inst', lock: false}); W0.run(x);
  const l1 = W1.msgs.find(m => m.lit >= 0), l0 = W0.msgs.find(m => m.lit >= 0);
  ok(l1 && l1.lit === 57, `Oktave sperren live: ${l1 && l1.lit} (soll 57); ohne: ${l0 && l0.lit} (Unteroktave 45 erwartet)`);
}
// FP-DSP: NaN/Inf im Eingang (20 ms) → keine Ausnahme, keine NaN-Meldung, die Taste kommt danach zurück
{
  const n = SR * 1.5, x = new Float32Array(n), A = SR * 0.6, B = A + SR * 0.02;
  for (let i = 0; i < n; i++) { const t = i / SR; x[i] = 0.15 * Math.sin(2 * Math.PI * 220 * t) + 0.08 * Math.sin(2 * Math.PI * 440 * t); }
  for (let i = A; i < B; i++) x[i] = i % 2 ? NaN : Infinity;
  const W = make(SR, {src: 'voice'}); let ex = null; try { W.run(x); } catch (e) { ex = e; }
  const after = W.msgs.filter(m => m.lit !== undefined && m.f > B), back = after.find(m => m.lit === 57);
  ok(!ex && W.msgs.every(m => m.lit === undefined || Number.isFinite(m.lit)) && (W.msgs.filter(m => m.lit !== undefined).pop() || {}).lit === 57, `NaN/Inf 20 ms: keine Ausnahme, Meldungen endlich, am Ende wieder Taste 57${back ? ' (nach ' + ((back.f - B) / SR * 1000).toFixed(0) + ' ms)' : ''}`);
}
// N7V-15: CPU of the live path (decimation + MPM-FFT + mask) on 20 s of singing, vs. the VS1 worklet without MPM
{
  const mel = melody(5, 57, 69), sig = renderVoice(mel, {voice: 'male', seed: 3}), x = up(sig.x), secs = x.length / SR;
  const tm = mpm => { const W = make(SR, mpm); for (let k = 0; k < 2; k++) W.run(x.subarray(0, SR * 2)); const W2 = make(SR, mpm); const t0 = process.hrtime.bigint(); W2.run(x); return {ms: Number(process.hrtime.bigint() - t0) / 1e6, msgs: W2.msgs.filter(m => m.lit !== undefined).length}; };
  const r0 = tm(null), r1 = tm({src: 'voice'});
  const pct = r1.ms / 1000 / secs * 100, add = (r1.ms - r0.ms) / 1000 / secs * 100;
  ok(pct <= 3, `N7V-15 Live-Weg gesamt ${pct.toFixed(2)} % Echtzeit (MPM-Anteil ${add.toFixed(2)} %), ${r1.msgs} Tasten-Meldungen in ${secs.toFixed(1)} s`);
  // spike per render quantum: worst block time with MPM
  const blk = mpm => { const W = make(SR, mpm), ds = [], out = [[new Float32Array(128)]], z = new Float32Array(128);
    for (let i = 0; i + 128 <= x.length; i += 128) { globalThis.currentFrame = i; const t0 = process.hrtime.bigint(); W.p.process([[x.subarray(i, i + 128)], [z]], out); if (i > SR) ds.push(Number(process.hrtime.bigint() - t0) / 1e6); }
    ds.sort((p, q) => p - q); return {p999: ds[Math.floor(ds.length * 0.999)], max: ds[ds.length - 1], p99: ds[Math.floor(ds.length * 0.99)]}; };
  const b0 = blk(null), b1 = blk({src: 'voice'});
  ok(b1.p999 < 0.5, `  Render-Block mit MPM: p99 ${b1.p99.toFixed(3)} / p99,9 ${b1.p999.toFixed(3)} / max ${b1.max.toFixed(3)} ms; ohne MPM p99,9 ${b0.p999.toFixed(3)} / max ${b0.max.toFixed(3)} ms (Budget 2,67 ms)`);
}
console.log(fail ? 'FAIL ' + fail : 'ALLE OK');
process.exit(fail ? 1 : 0);
