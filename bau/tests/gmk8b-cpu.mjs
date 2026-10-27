// QA C16 proxy: offline render time of a 4-note chord (3 s) per program, Micro (128) vs MK8 factory (A01-H16)
import { chromium } from 'playwright';
const FILE = process.argv[2];
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const page = await browser.newPage();
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
await page.evaluate(() => { mkLoad(); return MKK.decodeAll(); });
const r = await page.evaluate(async () => {
  const ev = []; for (const n of [48, 52, 55, 59]) ev.push([0, 'on', n, .8], [3, 'off', n]);
  const run = async id => { const snd = factorySound(id); await SYNQUENZER.mkRender(snd, ev, {sec: 3.2, seed: 1}); const t0 = performance.now(); await SYNQUENZER.mkRender(snd, ev, {sec: 3.2, seed: 1}); return performance.now() - t0; };
  const K = [], F = [];
  for (let g = 1; g <= 8; g++) for (let s = 1; s <= 16; s++) K.push([MKK.rec(g, s).name, await run(MKK.rec(g, s).id)]);
  for (let b = 1; b <= 8; b++) for (let s = 1; s <= 16; s++) { const rec = MKF.facRec(b, s); F.push([rec.name, await run(rec.id)]); }
  return {K, F};
});
const st = a => { const v = a.map(x => x[1]).sort((x, y) => x - y); return {med: v[v.length >> 1].toFixed(0), max: v[v.length - 1].toFixed(0)}; };
console.log('Micro render ms (3.2 s audio):', JSON.stringify(st(r.K)), 'top:', r.K.sort((a, b) => b[1] - a[1]).slice(0, 6).map(x => x[0] + ' ' + x[1].toFixed(0)).join(', '));
console.log('MK8 factory render ms:', JSON.stringify(st(r.F)), 'top:', r.F.sort((a, b) => b[1] - a[1]).slice(0, 6).map(x => x[0] + ' ' + x[1].toFixed(0)).join(', '));
await browser.close();
