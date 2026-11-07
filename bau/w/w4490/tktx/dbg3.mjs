import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const [file] = process.argv.slice(2);
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 926, height: 428}});
await p.goto('file://' + file); await p.waitForTimeout(1500);
await p.evaluate(async () => { SYNQUENZER.loadDemo(); ensureAudio(); await new Promise(r => setTimeout(r, 300)); SYNQUENZER.tkt.rackOpen(0); });
await p.waitForTimeout(400);
console.log(await p.evaluate(() => { const e = UI.pop.el, r = e.getBoundingClientRect(), h = e.querySelector('.ms-h').getBoundingClientRect(), x = e.querySelector('.ms-x').getBoundingClientRect(), cs = getComputedStyle(e); return JSON.stringify({pop: [r.left, r.right, r.width], bs: cs.boxSizing, w: e.style.width, cw: e.clientWidth, sw: e.scrollWidth, head: [h.left, h.right], x: [x.left, x.right], iw: innerWidth}); }));
await b.close();
