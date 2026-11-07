import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const [file] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 428, height: 926}});
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + file); await p.waitForTimeout(1500);
const o = await p.evaluate(async () => {
  const o = {}, wait = ms => new Promise(r => setTimeout(r, ms)), sr = 48000, N = Math.round(4 * sr);
  SYNQUENZER.loadDemo(); ensureAudio(); await wait(300);
  const ON = [0.30, 0.80, 1.30, 1.80, 2.45, 2.95, 3.45], MI = [64, 67, 69, 67, 64, 62, 60], JIT = [0.028, -0.032, 0.018, -0.036, 0.025, -0.022, 0.034];
  const syl = (jit, ct) => { const x = new Float32Array(N); ON.forEach((t0, k) => { const f0 = 440 * Math.pow(2, (MI[k] - 69 + ct / 100) / 12), a = Math.round((t0 + jit[k]) * sr), n = Math.round(0.34 * sr);
    for (let i = 0; i < n && a + i < N; i++) { const t = i / sr, env = Math.min(1, t / 0.006) * (t > 0.3 ? Math.max(0, 1 - (t - 0.3) / 0.04) : 1); let s = 0; for (let h = 1; h * f0 < 4000; h++) { const f = h * f0, w = Math.exp(-Math.pow((f - 750) / 260, 2)) + 0.6 * Math.exp(-Math.pow((f - 1200) / 300, 2)) + 0.25 * Math.exp(-Math.pow((f - 2600) / 500, 2)); s += w * Math.sin(2 * Math.PI * f * t) / Math.sqrt(h); } x[a + i] += env * s; } });
    let m = 0; for (const v of x) m = Math.max(m, Math.abs(v)); return Int16Array.from(x, v => Math.round(v / m * 0.5 * 32767)); };
  const L = await SYNQUENZER.tkInject({pcm: Array.from(syl(ON.map(() => 0), 0)), sr, scene: 2, len: 2}); const r = {t: L.track, s: L.scene};
  const vid = await SYNQUENZER.mix3.testTake(Array.from(syl(JIT, 18)), sr);
  o.mL = (await wpDetect(L.id)).map(k => [+k.t.toFixed(3), k.conf, k.word ? 1 : 0, k.voiced ? 1 : 0]); o.mV = (await wpDetect(vid)).map(k => [+k.t.toFixed(3), k.conf, k.word ? 1 : 0]); const raw = await wpCall({op: "det", x: tkBuffer(vid).getChannelData(0), sr: 48000}); o.raw = raw.slice(0, 4);
  return o;
});
console.log(JSON.stringify(o)); console.log(errs.slice(0, 3)); await b.close();
