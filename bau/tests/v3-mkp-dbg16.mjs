import {launch} from './v3-mkp-lib.mjs';
import path from 'path';
const b = await launch();
const ctx = await b.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true, deviceScaleFactor: +process.argv[3] || 1});
const page = await ctx.newPage(); page.on('crash', () => console.log('CRASH')); page.on('pageerror', e => console.log('ERR', String(e)));
await page.goto('file://' + path.resolve(process.argv[2])); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
const r = await page.evaluate(async () => { const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); await Q.loadDemo(); Q.setBpm(120); ensureAudio(); await sl(1200);
    const CH = [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]];
    for (let t = 0; t < 2; t++) { Q.setEngine(t, 'mk'); const notes = []; CH.forEach((c, k) => c.forEach(n => notes.push({t: k * 4, d: 4, n: n + 12 * t, v: .8}))); Q.setClip(t, 0, {len: 4, notes});
      Q.mkSet(t, 'arp.on', 1); Q.mkSet(t, 'arp.res', 2); Q.mkSet(t, 't.0.seq.on', 1); Q.mkSet(t, 't.0.seq.q.0.k', 11); }
    Q.selectTrack(0); Q.openEditor(); await sl(500); Q.clearLog(); Q.launchScene(0); await sl(3000); return Q.noteLog(100).length; });
console.log('ok', r);
const r2 = await page.evaluate(async () => { const sl = ms => new Promise(r => setTimeout(r, ms)); clearInterval(AU.timer); AU.timer = setInterval(() => tick(), TICK_MS); await sl(3000); return 1; });
console.log('ok2', r2);
await b.close();
