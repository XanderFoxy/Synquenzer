import { chromium } from 'playwright';
const FILE = process.argv[2];
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const page = await (await browser.newContext({viewport: {width: 844, height: 390}})).newPage(); const errs = [];
page.on('pageerror', e => errs.push(String(e)));
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
const r = await page.evaluate(async () => {
  const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); ensureAudio(); await sl(1200);
  Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.setBpm(240); mkSetP(0, 'arp.on', 1, false); mkSetP(0, 'arp.type', 4, false); mkSetP(0, 'arp.ks', 1, false); mkSetP(0, 'arp.res', 0, false);
  const runs = [];
  for (let k = 0; k < 2; k++) { ARPC.clearLog(); for (const n of [60, 64, 67, 71]) Q.keyOn(n, .8, 'k' + n); await sl(600); for (const n of [60, 64, 67, 71]) Q.keyOff(n, 'k' + n); await sl(150); runs.push(Q.arpLog(0).map(x => x.c + ':' + x.note).join(' ')); }
  return runs;
});
console.log(JSON.stringify(r, null, 1), errs);
await browser.close();
