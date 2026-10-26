import { chromium } from 'playwright';
const FILE = process.argv[2];
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await browser.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});
const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.setKbMode('play'); SYNQUENZER.openEditor(); });
await page.waitForTimeout(600);
const r = await page.evaluate(async () => {
  const Q = SYNQUENZER, D = x => JSON.parse(JSON.stringify(x));
  const s = D(Q.getSound(0)); const t = s.p.mk.t[0]; t.o1.w = 5; t.o1.c1 = 0; t.o1.c2 = 0; t.mix.o1 = 127; t.mix.o2 = 0; t.f.cut = 127; t.f.res = 0; t.a.gate = 1;
  const V = Array.from({length: 16}, (_, i) => i & 1 ? 120 : 0);
  t.seq = {on: 1, last: 16, type: 0, run: 1, ks: 1, res: 6, q: [{k: 5, m: 0, v: V}, {k: 0, m: 1, v: new Array(16).fill(0)}, {k: 0, m: 1, v: new Array(16).fill(0)}]};
  const ev = [[0, 'on', 57, .8]];
  const a = await Q.mkRender(s, ev, {sec: 1}), info1 = Q.mkInfo();
  const b = await Q.mkRender(s, ev, {sec: 1, waves: Array.from({length: 64}, (_, i) => i + 1)}), info2 = Q.mkInfo();
  const c = await Q.mkRender(s, ev, {sec: 1});
  let dab = 0, dcb = 0; for (let i = 0; i < a.l.length; i++) { dab = Math.max(dab, Math.abs(a.l[i] - b.l[i])); dcb = Math.max(dcb, Math.abs(c.l[i] - b.l[i])); }
  // waveform snapshot in the middle of step 1 (wave ~ 16 at c2 = 30) : rms of the difference there
  const seg = (x, y, i0, n) => { let e = 0, f = 0; for (let i = i0; i < i0 + n; i++) { e += (x[i] - y[i]) ** 2; f += y[i] * y[i]; } return 10 * Math.log10(e / f + 1e-30); };
  return {dab, dcb, mid1: seg(a.l, b.l, 2000, 4000), mid1c: seg(c.l, b.l, 2000, 4000), tables1: info1.tables, tables2: info2.tables};
});
console.log(JSON.stringify(r), errs.join(' / '));
await browser.close();
