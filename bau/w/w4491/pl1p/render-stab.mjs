import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const file = process.argv[2];
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await (await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true})).newPage();
await p.goto('file://' + file); await p.waitForTimeout(1500);
const SETUP = `stop(); SYNQUENZER.loadDemo(); ensureAudio();
  for (let t = 0; t < NT(); t++) if (S.tracks[t]) for (let s = 0; s < NS(); s++) if (t !== 0) S.tracks[t].clips[s] = null;
  S.tracks[0].clips[0] = {len: 1, key: {root: 0, scale: 'ionian', src: 'user'}, notes: [0, .5, 1, 1.5, 2, 2.5, 3, 3.5].map(t => ({t, d: .2, n: 48, v: .8}))};
  setP(0, 'fx.rev', 0); setP(0, 'fx.dly', 0);   /* ohne Hall/Echo: jeder Schritt wird für sich gemessen */
  for (let t = 0; t < NT(); t++) clipChanged(t, 0); R.selS = 0; UNDO.length = 0; REDO.length = 0;`;


await p.evaluate(s => { (new Function(s))(); }, SETUP); await p.waitForTimeout(300);
const spec = async () => p.evaluate(async () => {
  closeRoll(); stop(); SYNQUENZER.songFromChain([{scene: 0, bars: 2}]); VV.cancel = false;
  const r = await vvRenderAudio({range: {a: 0, b: 2}}), x = r.ch[0], sr = r.sr || AU.ctx.sampleRate;
  let on = 0; while (on < x.length && Math.abs(x[on]) < .004) on++;
  const sp = 60 / S.bpm * .5, N = 2048, cent = [], hf = [];
  const fft = (re, im) => { const n = re.length; for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
    for (let len = 2; len <= n; len <<= 1) { const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a); for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let k = 0; k < len / 2; k++) { const ur = re[i + k], ui = im[i + k], vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci, vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr; re[i + k] = ur + vr; im[i + k] = ui + vi; re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } } };
  for (let k = 0; k < 16; k++) {
    const s0 = on + Math.round((k * sp + .004) * sr), re = new Float64Array(N), im = new Float64Array(N);
    for (let i = 0; i < N; i++) re[i] = (x[s0 + i] || 0) * (.5 - .5 * Math.cos(2 * Math.PI * i / (N - 1)));
    fft(re, im); let a = 0, w = 0, h = 0;
    for (let i = 1; i < N / 2; i++) { const m = Math.hypot(re[i], im[i]), f = i * sr / N; a += m; w += m * f; if (f > 1500) h += m * m; }
    let tot = 0; for (let i = 1; i < N / 2; i++) tot += re[i] * re[i] + im[i] * im[i];
    cent.push(Math.round(w / Math.max(1e-12, a))); hf.push(+(10 * Math.log10(Math.max(1e-12, h / Math.max(1e-12, tot)))).toFixed(1));
  }
  return {on, sr, cent, hf};
});

const runs = [];
for (let k = 0; k < 5; k++) { const r = await spec(); runs.push(r.cent); }
const base = runs[0];
for (const c of runs) console.log(JSON.stringify(c), JSON.stringify(c.map((x, k) => +(x / base[k]).toFixed(3)).filter(r => Math.abs(r - 1) >= .05).length));
await b.close();
