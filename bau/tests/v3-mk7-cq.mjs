import { chromium } from 'playwright';
import path from 'path';
const FILE = path.resolve(process.argv[2] || new URL('../mk-br-MK7/index.html', import.meta.url).pathname);
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const page = await browser.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
const r = await page.evaluate(async () => {
  const S_ = SYNQUENZER; S_.setEngine(0, 'mk'); const snd = S_.getSound(0); snd.p.mk.mode = 3;
  const vox = S_.mkVowel({f0: 110, v: 'a', sec: 1, sr: 48000, rms: -20});
  const o = await S_.mkRender(snd, [[0, 'on', 48, .8], [0, 'on', 55, .8]], {sec: 1, inputs: {e2: vox}});
  const rms = (x, a, b) => { let e = 0; for (let i = a; i < b; i++) e += x[i] * x[i]; return 20 * Math.log10(Math.sqrt(e / (b - a)) + 1e-12); };
  snd.p.mk.mode = 0; snd.p.mk.t[0].o1.w = 7;
  const sine = new Float32Array(48000); for (let i = 0; i < 48000; i++) sine[i] = .5 * Math.sin(2 * Math.PI * 440 * i / 48000);
  const o2 = await S_.mkRender(snd, [[0, 'on', 60, .8]], {sec: 1, inputs: {e1: sine}});
  return {voc: rms(o.l, 24000, 48000), vox: vox.length, eing: rms(o2.l, 24000, 48000)};
});
console.log(r, errs);
await browser.close();
