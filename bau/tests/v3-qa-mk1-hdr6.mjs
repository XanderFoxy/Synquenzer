import { chromium } from 'playwright';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const FILE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-wt/index.html';
const SA = '#app{padding-left:47px!important;padding-right:47px!important}';
const ctx = await browser.newContext({viewport: {width: 844, height: 390}, hasTouch: true, isMobile: true});
const page = await ctx.newPage(); await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
await page.addStyleTag({content: SA});
// a real FM sound from the factory on track 0 (as a user would load it), then close and open the editor by tapping the track
const fm = await page.evaluate(() => SYNQUENZER.factory().find(f => f.engine === 'fm6'));
await page.evaluate(id => { SYNQUENZER.loadPreset(0, id); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }, fm.id); await page.waitForTimeout(600);
await page.screenshot({path: new URL('./v3-qa-mk1-L1SA-fm-first.png', import.meta.url).pathname, clip: {x: 0, y: 40, width: 844, height: 60}});
const x = await page.evaluate(() => { const b = document.querySelector('#synthSheet .sh-x'); const r = b.getBoundingClientRect(); const hit = document.elementFromPoint(Math.min(innerWidth - 1, r.x + r.width / 2), r.y + r.height / 2); return {x: [Math.round(r.left), Math.round(r.right)], vw: innerWidth, appRight: Math.round(document.getElementById('app').getBoundingClientRect().right - 47), hitIsX: hit === b || b.contains(hit)}; });
console.log('FM sound', fm.name, 'first open: close key', JSON.stringify(x));
await browser.close();
