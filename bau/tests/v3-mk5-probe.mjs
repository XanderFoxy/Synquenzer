import { chromium } from 'playwright';
const FILE = process.argv[2];
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const page = await (await browser.newContext({viewport: {width: 844, height: 390}})).newPage();
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
const r = await page.evaluate(async () => { ensureAudio(); await new Promise(r => setTimeout(r, 1500)); return SYNQUENZER.perfProbe((window.CASES || 'kern,fx,arp').split(',')); });
console.log(JSON.stringify(r.cases.map(c => [c.fall, c.load_med, c.load_max, c.frames_ok, c.quantum_max_ms, c.fps_med])));
await browser.close();
