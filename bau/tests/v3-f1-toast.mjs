import {launch, open, tap, el, ctr} from './v3-mkp-lib.mjs';
const FILE = process.argv[2];
const b = await launch(); const page = await open(b, FILE, process.argv[3] || 'L1');
await page.evaluate(async () => { await SYNQUENZER.libraryReady(); MKUI.view({ansicht: 'ganz'}); mkProg.select(1, 1); MKUI.P.mode = 'spiel'; MKUI.render(); });
await page.waitForTimeout(300);
for (const id of ['bank.u', 's5']) { const e = await el(page, id); const [x, y] = ctr(e); await tap(page, x, y); await page.waitForTimeout(160); }
console.log(JSON.stringify(await page.evaluate(() => { const t = document.querySelector('#toast'), q = t.getBoundingClientRect(); return {cls: t.className, txt: t.innerText, w: Math.round(q.width), l: Math.round(q.left), btns: [...t.querySelectorAll('button')].map(b => ({al: b.getAttribute('aria-label'), w: b.getBoundingClientRect().width, h: b.getBoundingClientRect().height}))}; })));
await page.screenshot({path: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-f1-toast.png'});
await b.close();
