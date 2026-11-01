import { chromium } from 'playwright';
const f = process.argv[2];
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 428, height: 926}, hasTouch: true});
await p.goto('file://' + f); await p.waitForTimeout(1500);
const keys = await p.evaluate(() => Object.keys(window.SYNQUENZER));
console.log(keys.join(' '));
const st = await p.evaluate(() => { const S = window.SYNQUENZER; return {tracks: S.state ? 'state' : null}; });
await b.close();
