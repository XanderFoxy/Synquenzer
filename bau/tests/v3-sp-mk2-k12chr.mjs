// MK2-12 "gespielt" for 61-64 through the app's own SYNQUENZER.mkRender (Chromium OfflineAudioContext): partials 1-16 against
// the traced envelope in Hz (compact trace, private build place), gain by least squares over partials >= -40 dB
import {chromium} from 'playwright';
import fs from 'fs';
const FILE = new URL('../synq-snapshots/MK2.html', import.meta.url).pathname;
const C = JSON.parse(fs.readFileSync(new URL('../dwgs-trace/dwgs-64-compact.json', import.meta.url), 'utf8')).waves;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const page = await (await browser.newContext()).newPage();
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
const db = x => 20 * Math.log10(Math.max(1e-15, x));
const env = (w, f) => { const L = w.a.map(a => db(a)), h = f / 220.27; if (h <= 1) return L[0] - 12 * Math.log2(1 / h); const m = Math.floor(h), t = Math.log(h / m) / Math.log((m + 1) / m); return L[m - 1] + (L[m] - L[m - 1]) * t; };
for (const F of [187.5, 220.27]) {
  const res = [];
  for (const n of [61, 62, 63, 64]) {
    const P = await page.evaluate(async ([n, F]) => {
      SYNQUENZER.setEngine(0, 'mk'); const snd = SYNQUENZER.getSound(0);
      const s = JSON.parse(JSON.stringify(snd)); s.p.mk = SQMK.normMk({t: [{o1: {w: 5, c1: 0, c2: 2 * (n - 1)}, f: {type: 0, cut: 127, res: 0}, a: {gate: 1}}]});
      const note = 69 + 12 * Math.log2(F / 440); const r = await SYNQUENZER.mkRender(s, [[0, 'on', note, .8]], {sec: .6});
      const x = r.l, N = 14400, i0 = 9600, out = []; let ws = 0; const W = new Float64Array(N); for (let i = 0; i < N; i++) { W[i] = .42 - .5 * Math.cos(2 * Math.PI * i / (N - 1)) + .08 * Math.cos(4 * Math.PI * i / (N - 1)); ws += W[i]; }
      for (let k = 1; k <= 16; k++) { let a = 0, b = 0; const w = 2 * Math.PI * k * F / 48000; for (let i = 0; i < N; i++) { a += x[i0 + i] * W[i] * Math.cos(w * i); b += x[i0 + i] * W[i] * Math.sin(w * i); } out.push(2 * Math.hypot(a, b) / ws); }
      return out; }, [n, F]);
    const w = C[n - 1], ref = []; for (let k = 1; k <= 16; k++) ref.push(env(w, k * F));
    const mx = Math.max(...ref), idx = ref.map((x, i) => i).filter(i => ref[i] - mx >= -40), Pd = P.map(db);
    const g = idx.reduce((s, i) => s + Pd[i] - ref[i], 0) / idx.length; let worst = 0, wk = 0; for (const i of idx) { const d = Math.abs(Pd[i] - ref[i] - g); if (d > worst) { worst = d; wk = i + 1; } }
    res.push(n + ': ' + worst.toFixed(1) + ' dB (k ' + wk + ')');
  }
  console.log('mkRender', F, 'Hz, 61-64 max deviation from the envelope in Hz:', res.join(', '));
}
await browser.close();
