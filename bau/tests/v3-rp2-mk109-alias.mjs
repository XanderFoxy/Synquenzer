// Independent reproduction of MK1-09 folded energy (B.6 Nr. 12) at C6 for Sync / Ring+Sync, semitones 0..24 incl. even ones.
// Renders through the app's own B.7 mkRender in Chromium (OfflineAudioContext + real worklet), two analysis windows
// (start 0.5 s and 1.0 s) with an own FFT, plus the folded energy of an ideal reference (16x oversampled hard sync,
// band-limited by brickwall in the FFT domain) to show the measurement floor.
import { chromium } from 'playwright';
const FILE = process.argv[2] || new URL('../mk-wt/index.html', import.meta.url).pathname;
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 390, height: 844}});
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
const SEMIS = Array.from({length: 25}, (_, i) => i);
const N = 32768, OFFS = [24000, 48000];
const raw = await p.evaluate(async ({SEMIS, N, OFFS}) => {
  const D = SYNQUENZER, out = {};
  const base = factorySound('f-init-am');
  out.base = JSON.stringify(base.p.mk.t[0]);
  const mk = (mod, semi) => { const s = JSON.parse(JSON.stringify(base)); const t = s.p.mk.t[0];
    t.o1.w = 0; t.o2.w = 0; t.o2.semi = semi; t.o2.mod = mod; t.o2.tune = 0; t.mix.o1 = 0; t.mix.o2 = 127; t.mix.n = 0;
    t.f.type = 0; t.f.cut = 127; t.f.res = 0; t.f.eg = 0; t.f.kbd = 0; t.a.gate = 1; t.a.dist = 0; return s; };
  for (const mod of [2, 3]) for (const semi of SEMIS) {
    const r = await D.mkRender(mk(mod, semi), [[0, 'on', 84, .8]], {sec: 1.8});
    out[mod + ':' + semi] = OFFS.map(o => Array.from(r.l.subarray(o, o + N)));
  }
  return out;
}, {SEMIS, N, OFFS});
await b.close();
function fft(re, im) { const n = re.length; for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) { const a = -2 * Math.PI / len; for (let i = 0; i < n; i += len) for (let k = 0; k < len / 2; k++) {
    const cr = Math.cos(a * k), ci = Math.sin(a * k), xr = re[i + k + len / 2], xi = im[i + k + len / 2], vr = xr * cr - xi * ci, vi = xr * ci + xi * cr;
    re[i + k + len / 2] = re[i + k] - vr; im[i + k + len / 2] = im[i + k] - vi; re[i + k] += vr; im[i + k] += vi; } } }
const SR = 48000, f0 = 440 * Math.pow(2, 15 / 12), BIN = SR / N;
function folded(x) {
  let m = 0; for (let i = 0; i < N; i++) m += x[i]; m /= N; const re = new Float64Array(N), im = new Float64Array(N);
  for (let i = 0; i < N; i++) re[i] = (x[i] - m) * (0.42 - 0.5 * Math.cos(2 * Math.PI * i / N) + 0.08 * Math.cos(4 * Math.PI * i / N));
  fft(re, im); let h = 0, o = 0, top = 0, topF = 0;
  for (let k = 1; k < N / 2; k++) { const f = k * BIN; if (f < 20 || f > 10000 || f < f0 / 2) continue; const pw = re[k] ** 2 + im[k] ** 2;
    const kh = Math.round(f / f0); if (kh >= 1 && Math.abs(f - kh * f0) <= 6 * BIN) h += pw; else { o += pw; if (pw > top) { top = pw; topF = f; } } }
  return {db: 10 * Math.log10(o / h), topF};
}
// ideal reference: naive hard-sync saw (slave semi s) [x master saw for ring+sync] at 16x, then brickwall to 24 kHz by
// sinc-free decimation through FFT of 16N points is too big; use exact Fourier synthesis instead: slave reset each master
// period => periodic with f0, so the ideal band-limited output has only harmonics k*f0 (k*f0 < 24 kHz).
function ideal(mod, s) {
  const r = Math.pow(2, s / 12), P = 2048; const per = new Float64Array(P); // one master period, oversampled
  for (let i = 0; i < P; i++) { const ph = i / P; const sl = ((ph * r) % 1) * 2 - 1; const ms = ph * 2 - 1; per[i] = mod === 3 ? sl * ms : sl; }
  const K = Math.floor(23999 / f0), A = [], B = [];
  for (let k = 1; k <= K; k++) { let a = 0, c = 0; for (let i = 0; i < P; i++) { const w = 2 * Math.PI * k * i / P; a += per[i] * Math.cos(w); c += per[i] * Math.sin(w); } A.push(2 * a / P); B.push(2 * c / P); }
  const x = new Float64Array(N); for (let n = 0; n < N; n++) { let v = 0; for (let k = 1; k <= K; k++) { const w = 2 * Math.PI * k * f0 * n / SR; v += A[k - 1] * Math.cos(w) + B[k - 1] * Math.sin(w); } x[n] = v; }
  return x;
}
console.log('timbre', raw.base);
const res = {2: [], 3: []};
for (const mod of [2, 3]) for (const s of SEMIS) { const [w1, w2] = raw[mod + ':' + s].map(folded); res[mod].push([s, w1.db, w2.db, w1.topF]); }
for (const mod of [2, 3]) {
  console.log((mod === 2 ? 'Sync' : 'Ring+Sync') + ' C6 (window @0.5 s / @1.0 s, strongest non-harmonic bin):');
  console.log('  ' + res[mod].map(([s, a, c, f]) => `+${s} ${a.toFixed(1)}/${c.toFixed(1)} (${f.toFixed(0)} Hz)`).join(', '));
  const bad = res[mod].filter(([s, a, c]) => s >= 1 && s <= 19 && Math.max(a, c) > -50);
  console.log('  over -50 dB in +1..+19: ' + (bad.length ? bad.map(([s, a, c]) => '+' + s + ' ' + Math.max(a, c).toFixed(1)).join(', ') : 'none'));
}
console.log('ideal reference (measurement floor): ' + [[2, 7], [2, 17], [3, 11], [3, 19]].map(([m, s]) => (m === 2 ? 'S' : 'RS') + s + ' ' + folded(ideal(m, s)).db.toFixed(1)).join(', '));
console.log('errors', JSON.stringify(errs));
