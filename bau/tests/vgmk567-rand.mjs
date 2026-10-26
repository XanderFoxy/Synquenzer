// vgmk567: 🎲 randomize N times, render each, list silent ones with the deciding fields. Usage: node vgmk567-rand.mjs <file> [N]
import { chromium } from 'playwright';
const FILE = process.argv[2], N = +(process.argv[3] || 200);
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await browser.newContext({viewport: {width: 844, height: 390}, hasTouch: true, isMobile: true});
const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
await page.waitForTimeout(500);
const r = await page.evaluate(async (N) => {
  const res = []; for (let k = 0; k < N; k++) { SYNQUENZER.randomize(0); res.push(JSON.parse(JSON.stringify(SYNQUENZER.getSound(0)))); }
  const meas = async s => { const x = (await SYNQUENZER.mkRender(s, [[0, 'on', 48, .8], [1, 'off', 48]], {sec: 1.6})).l; let e = 0; for (let i = 0; i < x.length; i++) e += x[i] * x[i]; return 10 * Math.log10(e / x.length + 1e-20); };
  const out = []; const lv = [];
  for (let k = 0; k < N; k++) { const l = await meas(res[k]); lv.push(l); if (l < -60) { const m = res[k].p.mk; out.push({k, l: Math.round(l), mode: m.mode, arp: m.arp, t0: m.t[0], voc: m.voc ? {hold: !!m.voc.hold} : null, mfx: m.mfx, dly: m.dly, eq: m.eq}); } }
  lv.sort((a, b) => a - b);
  return {out, low: lv.slice(0, 8).map(x => Math.round(x))};
}, N);
console.log(FILE.split('/').slice(-2).join('/'), 'silent', r.out.length, 'lowest', JSON.stringify(r.low));
for (const s of r.out) console.log(JSON.stringify(s));
console.log('errs', errs.length);
await browser.close();
