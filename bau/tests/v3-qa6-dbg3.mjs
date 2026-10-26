import { chromium } from 'playwright';
const FILE = process.argv[2];
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await browser.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});
const page = await ctx.newPage();
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
await page.evaluate(() => { SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.setKbMode('play'); SYNQUENZER.openEditor(); });
await page.waitForTimeout(500);
await page.evaluate(() => { SYNQUENZER.keyOn(72); }); await page.waitForTimeout(300); await page.evaluate(() => { SYNQUENZER.keyOff(72); });
const t0 = Date.now();
await page.waitForFunction(() => AU.synth[0] && AU.synth[0].node, null, {timeout: 10000}).catch(() => {});
console.log('synth after', Date.now() - t0, 'ms', await page.evaluate(() => !!(AU.synth[0] && AU.synth[0].node)));
await page.evaluate(() => { const Q = SYNQUENZER; Q.setBpm(120); Q.mkSet(0, 't.0.seq.last', 4); Q.mkSet(0, 't.0.seq.run', 0); Q.keyOn(60); MKUI.setWahl(2, 10); MKUI.viewOpen('schritte'); });
for (let k = 0; k < 6; k++) { await page.waitForTimeout(200); console.log(await page.evaluate(() => { const s = SYNQUENZER.mkScope(0); return s ? JSON.stringify({t: s.t.toFixed(2), seq0: {on: s.seq[0].on, run: s.seq[0].run, step: s.seq[0].step, done: s.seq[0].done}, nv: s.voices.length, eng: R.inputs.api60 && R.inputs.api60.voice && R.inputs.api60.voice.eng}) : 'null'; })); }
await browser.close();
