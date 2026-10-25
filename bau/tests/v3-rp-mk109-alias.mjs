// Reproduction MK1-09 folded energy at C6 (B.6 Nr. 12), independent: renders through the app's own mkRender (OfflineAudioContext
// in Chromium) and analyses with an own radix-2 FFT (no shared helper code).
import { chromium } from 'playwright';
const FILE = process.argv[2] || new URL('../mk-wt/index.html', import.meta.url).pathname;
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 390, height: 844}});
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
const SEMIS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
const raw = await p.evaluate(async (SEMIS) => {
  const D = SYNQUENZER, out = {};
  const base = factorySound('f-init-am');
  const mk = (mod, semi) => { const s = JSON.parse(JSON.stringify(base)); const t = s.p.mk.t[0];
    t.o1.w = 0; t.o2.w = 0; t.o2.semi = semi; t.o2.mod = mod; t.o2.tune = 0; t.mix.o1 = 0; t.mix.o2 = 127; t.mix.n = 0; t.f.cut = 127; t.f.res = 0; t.f.eg = 0; t.f.kbd = 0; t.a.gate = 1; t.a.dist = 0; return s; };
  out.base = JSON.stringify(base.p.mk.t[0]);
  for (const mod of [0, 2, 3]) for (const semi of (mod === 0 ? [0, 7, 19] : SEMIS)) {
    const r = await D.mkRender(mk(mod, semi), [[0, 'on', 84, .8]], {sec: 1.6});
    out[mod + ':' + semi] = Array.from(r.l.subarray(24000, 24000 + 32768));
  }
  return out;
}, SEMIS);
await b.close();
// own FFT
function fft(re, im) { const n = re.length; for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) { const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a);
    for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let k = 0; k < len / 2; k++) { const ur = re[i + k], ui = im[i + k], xr = re[i + k + len / 2], xi = im[i + k + len / 2];
      const vr = xr * cr - xi * ci, vi = xr * ci + xi * cr; re[i + k] = ur + vr; im[i + k] = ui + vi; re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } } }
const SR = 48000, N = 32768, f0 = 440 * Math.pow(2, (84 - 69) / 12), BIN = SR / N;
function folded(x) {
  let m = 0; for (const v of x) m += v; m /= N; const re = new Float64Array(N), im = new Float64Array(N);
  for (let i = 0; i < N; i++) re[i] = (x[i] - m) * (0.42 - 0.5 * Math.cos(2 * Math.PI * i / N) + 0.08 * Math.cos(4 * Math.PI * i / N));
  fft(re, im); let h = 0, o = 0, rms = 0; for (const v of x) rms += v * v;
  for (let k = 1; k < N / 2; k++) { const f = k * BIN; if (f < 20 || f > 10000 || f < f0 / 2) continue; const pw = re[k] ** 2 + im[k] ** 2;
    const kh = Math.round(f / f0); (kh >= 1 && Math.abs(f - kh * f0) <= 6 * BIN) ? h += pw : o += pw; }
  return {db: 10 * Math.log10(o / h), rmsDb: 10 * Math.log10(rms / N)};
}
const lines = {};
for (const k of Object.keys(raw)) { if (k === 'base') continue; const [mod, semi] = k.split(':'); const r = folded(raw[k]); (lines[mod] ||= []).push(`+${semi} ${r.db.toFixed(1)} (${r.rmsDb.toFixed(1)} dBFS)`); }
console.log('timbre', raw.base);
console.log('Aus (control) C6: ' + lines[0].join(', '));
console.log('Sync C6: ' + lines[2].join(', '));
console.log('Ring+Sync C6: ' + lines[3].join(', '));
const worst = m => Math.max(...lines[m].filter(s => !s.startsWith('+0 ')).map(s => parseFloat(s.split(' ')[1])));
console.log('worst +1..+19: Sync ' + worst(2).toFixed(1) + ' dB, Ring+Sync ' + worst(3).toFixed(1) + ' dB (limit -50)');
console.log('errors', JSON.stringify(errs));
