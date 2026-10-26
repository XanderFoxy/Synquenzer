import { chromium } from 'playwright';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'});
const page = await browser.newPage();
await page.goto('file://' + process.argv[2]); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
const r = await page.evaluate(() => { mkLoad(); const out = {};
  for (const v of ['a', 'i']) { const x = MKUI.mkVowel({f0: 110, v, sec: 1, sr: 48000}); const N = 16384, o = 20000;
    const bands = [125, 270, 530, 1150, 2070, 2780, 3800]; out[v] = bands.map(f => { let re = 0, im = 0, best = 0; for (let h = Math.max(1, Math.round(f / 110) - 1); h <= Math.round(f / 110) + 1; h++) { re = 0; im = 0; const w = 2 * Math.PI * h * 110 / 48000; for (let i = 0; i < N; i++) { re += x[o + i] * Math.cos(w * i); im += x[o + i] * Math.sin(w * i); } best = Math.max(best, Math.hypot(re, im) / N * 2); } return Math.round(20 * Math.log10(best + 1e-12)); }); }
  return out; });
console.log(JSON.stringify(r)); await browser.close();
