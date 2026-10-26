import { chromium } from 'playwright';
const FILE = process.argv[2];
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await browser.newContext({viewport: {width: 844, height: 390}, hasTouch: true, isMobile: true});
const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
await page.waitForTimeout(500);
const r = await page.evaluate(async () => {
  const t0 = {"asg":1,"prio":0,"trig":1,"udet":10,"trans":0,"tune":0,"vib":0,"bend":2,"porta":0,"o1":{"w":3,"c1":42,"c2":0},"o2":{"w":1,"mod":0,"semi":12,"tune":0},"mix":{"o1":32,"o2":100,"n":0},"f":{"type":0,"cut":52,"res":73,"eg":49,"vel":0,"kbd":39},"a":{"lvl":127,"pan":0,"gate":0,"dist":0,"vel":0,"kbd":0},"e1":{"a":9,"d":100,"s":52,"r":38,"rst":1},"e2":{"a":13,"d":80,"s":74,"r":78,"rst":1}};
  const s = JSON.parse(JSON.stringify(SYNQUENZER.getSound(0))); const t = s.p.mk.t[0];
  for (const k in t0) t[k] = typeof t0[k] === 'object' ? Object.assign(t[k], t0[k]) : t0[k];
  const meas = async s => { const x = (await SYNQUENZER.mkRender(s, [[0, 'on', 48, .8], [1, 'off', 48]], {sec: 1.6})).l; let e = 0; for (let i = 0; i < x.length; i++) e += x[i] * x[i]; return 10 * Math.log10(e / x.length + 1e-20); };
  const out = []; for (let k = 0; k < 5; k++) out.push(Math.round(await meas(s)));
  // many renders in a row of random sounds, count exact zeros
  let zeros = 0; const N = 300; for (let k = 0; k < N; k++) { SYNQUENZER.randomize(0); const l = await meas(JSON.parse(JSON.stringify(SYNQUENZER.getSound(0)))); if (l < -150) zeros++; }
  return {out, zeros, mode: s.p.mk.mode};
});
console.log(FILE.split('/').slice(-2).join('/'), JSON.stringify(r), 'errs', errs.length, errs.slice(0, 3).join(' | '));
await browser.close();
