// Independent repro of the MK2-12 "gespielt" finding for waves 61-64: render through the live app (mk-wt/index.html,
// SYNQUENZER.mkRender in Chromium), measure partials 1-16 with a rectangular-window DFT over an exact integer number of
// periods (no window leakage), compare to the envelope in Hz built from the compact trace. Also: the spectral peak (formant)
// position in Hz across a chromatic scale A2..A4 - with a fixed envelope in Hz it should stay put.
import {chromium} from 'playwright';
import fs from 'fs';
const FILE = new URL('../mk-wt/index.html', import.meta.url).pathname;
const C = JSON.parse(fs.readFileSync(new URL('../dwgs-trace/dwgs-64-compact.json', import.meta.url), 'utf8')).waves;
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const page = await (await browser.newContext()).newPage();
const errs = []; page.on('pageerror', e => errs.push(String(e)));
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
console.log('version', await page.evaluate(() => typeof VERSION !== 'undefined' ? VERSION : '?'));
const db = x => 20 * Math.log10(Math.max(1e-15, x));
const env = (w, f) => { const L = w.a.map(a => db(a)), h = f / 220.27; if (h <= 1) return L[0] - 12 * Math.log2(1 / h); const m = Math.floor(h), t = Math.log(h / m) / Math.log((m + 1) / m); return L[m - 1] + (L[m] - L[m - 1]) * t; };
async function play(n, F, K) {
  return page.evaluate(async ([n, F, K]) => {
    SYNQUENZER.setEngine(0, 'mk'); const s = JSON.parse(JSON.stringify(SYNQUENZER.getSound(0)));
    s.p.mk = SQMK.normMk({t: [{o1: {w: 5, c1: 0, c2: 2 * (n - 1)}, f: {type: 0, cut: 127, res: 0}, a: {gate: 1}}]});
    const note = 69 + 12 * Math.log2(F / 440), r = await SYNQUENZER.mkRender(s, [[0, 'on', note, .8]], {sec: .8});
    const x = r.l, P = Math.max(1, Math.round(0.25 * F)), N = Math.round(P * 48000 / F), i0 = 14400, out = [];  // ~0.25 s of whole periods
    for (let k = 1; k <= K; k++) { let a = 0, b = 0; const w = 2 * Math.PI * k * F / 48000; for (let i = 0; i < N; i++) { a += x[i0 + i] * Math.cos(w * i); b += x[i0 + i] * Math.sin(w * i); } out.push(2 * Math.hypot(a, b) / N); }
    return out; }, [n, F, K]);
}
function cmp(n, F, P) {
  const w = C[n - 1], ref = []; for (let k = 1; k <= 16; k++) ref.push(env(w, k * F));
  const mx = Math.max(...ref), idx = ref.map((_, i) => i).filter(i => ref[i] - mx >= -40), Pd = P.slice(0, 16).map(db);
  const g = idx.reduce((s, i) => s + Pd[i] - ref[i], 0) / idx.length; let worst = 0, wk = 0, ss = 0;
  for (const i of idx) { const d = Pd[i] - ref[i] - g; ss += d * d; if (Math.abs(d) > worst) { worst = Math.abs(d); wk = i + 1; } }
  return {worst, wk, rms: Math.sqrt(ss / idx.length), cnt: idx.length};
}
for (const F of [130.8128, 187.5, 220.27, 261.6256]) {
  const row = [];
  for (const n of [61, 62, 63, 64]) { const c = cmp(n, F, await play(n, F, 16)); row.push(`${n}: max ${c.worst.toFixed(1)} dB (k ${c.wk}), rms ${c.rms.toFixed(1)} dB`); }
  console.log(F.toFixed(2).padStart(7), 'Hz |', row.join(' | '));
}
// control: a non-octave wave (19) at 187.5 Hz against its own trace partials
{ const n = 19, w = C[n - 1], P = (await play(n, 187.5, 16)).map(db), am = Math.max(...w.a), ref = w.a.slice(0, 16).map(a => db(a / am));
  const idx = ref.map((_, i) => i).filter(i => ref[i] >= -40), g = idx.reduce((s, i) => s + P[i] - ref[i], 0) / idx.length;
  console.log('control wave 19 @187.5 Hz: max', Math.max(...idx.map(i => Math.abs(P[i] - ref[i] - g))).toFixed(3), 'dB'); }
// formant tracking: strongest partial above partial 2 -> its frequency in Hz, per semitone A2..A4, wave 61 and 63
for (const n of [61, 63]) {
  const w = C[n - 1]; const line = [];
  for (let m = 45; m <= 69; m += 2) { const F = 440 * Math.pow(2, (m - 69) / 12), K = Math.floor(5000 / F), P = await play(n, F, K);
    let bi = 2; for (let k = 3; k <= K; k++) if (P[k - 1] > P[bi - 1]) bi = k;
    let ri = 3; for (let k = 3; k <= K; k++) if (env(w, k * F) > env(w, ri * F)) ri = k;
    line.push(`${m}:${Math.round(bi * F)}/${Math.round(ri * F)}`); }
  console.log('wave', n, 'strongest partial >=3 in Hz (played/envelope) per MIDI note:', line.join(' '));
}
console.log('page errors', errs.length);
await browser.close();
