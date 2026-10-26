// Independent repro in Chromium: app worklet via OfflineAudioContext (mkRender), app INIT AM sound in Vocoder mode, limiter stage 1 mid-note.
import { chromium } from 'playwright';
import path from 'path';
const FILE = path.resolve(new URL('../mk-br-MK7/index.html', import.meta.url).pathname);
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const page = await browser.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
const r = await page.evaluate(async () => {
  const S_ = SYNQUENZER; S_.setEngine(0, 'mk'); const base = S_.getSound(0); base.p.mk.mode = 3;
  const db = (x, a, b) => { let e = 0; for (let i = a; i < b; i++) e += x[i] * x[i]; return 20 * Math.log10(Math.sqrt(e / (b - a)) + 1e-12); };
  const sr = 48000, out = [];
  const voc0 = JSON.stringify(base.p.mk.voc);
  for (const [lab, vo] of [['INIT voc', {}], ['probe res64 efs40', {res: 64, efs: 40}]]) for (const v of ['a', 'i', 'u']) for (const n of [48, 60, 72]) {
    const snd = JSON.parse(JSON.stringify(base)); Object.assign(snd.p.mk.voc, vo);
    const e2 = S_.mkVowel({f0: 110, v, sec: 3, sr, rms: -20});
    const a = await S_.mkRender(snd, [[0, 'on', n, .8]], {sec: 3, inputs: {e2}});
    const b = await S_.mkRender(snd, [[0, 'on', n, .8]], {sec: 3, inputs: {e2}, at: [[1, {set: {mkLim: 1}}]]});
    const L4 = db(a.l, 1.5 * sr, 2.9 * sr), L2 = db(b.l, 1.5 * sr, 2.9 * sr), pre = db(b.l, .5 * sr, .95 * sr) - db(a.l, .5 * sr, .95 * sr);
    out.push(lab + ' vowel ' + v + ' note ' + n + ': 4th ' + L4.toFixed(1) + ' dBFS, stage1 ' + L2.toFixed(1) + ' dBFS, diff ' + (L2 - L4 >= 0 ? '+' : '') + (L2 - L4).toFixed(2) + ' dB (pre-switch diff ' + pre.toFixed(2) + ')');
  }
  return {voc0, out};
});
console.log('INIT voc:', r.voc0); console.log(r.out.join('\n')); console.log('errors:', errs);
await browser.close();
