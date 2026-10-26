// MK6-fix helper: are the app fonts really loaded (not a fallback) for a file? Usage: node v3-mk6fix-font.mjs <index.html>
import { chromium } from 'playwright';
import path from 'path';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const page = await (await browser.newContext({viewport: {width: 390, height: 844}})).newPage();
await page.goto('file://' + path.resolve(process.argv[2])); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
await page.evaluate(() => cloudPagesExtras()); await page.waitForTimeout(1500);
console.log(JSON.stringify(await page.evaluate(async () => { await document.fonts.ready; return [...document.fonts].map(f => f.family + ' ' + f.weight + ' ' + f.status); })));
await browser.close();
