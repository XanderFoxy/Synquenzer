import { chromium } from 'playwright';
import fs from 'fs';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'});
const page = await browser.newPage(); page.on('pageerror', e => console.log('ERR', String(e)));
await page.goto('file://' + process.argv[2]); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
await page.evaluate(fs.readFileSync(new URL('./v3-mk8-mess.js', import.meta.url), 'utf8'));
const r = await page.evaluate(async (code) => { mkLoad(); return await (new Function('return (async () => {' + code + '})()'))(); }, process.argv[3]);
console.log(JSON.stringify(r)); await browser.close();
