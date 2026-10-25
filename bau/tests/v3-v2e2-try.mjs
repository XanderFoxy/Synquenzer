import { openVp, mk, SETUP } from './v3-v2e-lib.mjs';
const {b, p, errs, cdp} = await openVp(process.argv[2] || 'P1');
const T = mk(p, cdp), {E, touch} = T;
await E(SETUP(false));          // song 5.5 without insert
await p.waitForTimeout(300);
const key = await E(() => { const k = document.querySelector('#partBar .pk'); const r = k.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, txt: k.textContent}; });
console.log('key', key);
const t0 = Date.now();
await touch('touchStart', key.x, key.y);
let opened = null;
for (let k = 0; k < 80; k++) { await p.waitForTimeout(10); const o = await E(() => !!document.querySelector('#gridArea.song')); if (o && !opened) { opened = Date.now() - t0; break; } }
console.log('opened at', opened);
const st = await E(() => window.SYNQUENZER.svLayoutInfo().drag); console.log(st);
await p.screenshot({path: 'v3-v2e2-try-open.png'});
// move 20 px then to bar 3
const i = await T.info();
for (let k = 1; k <= 8; k++) { await touch('touchMove', key.x + (i.canvas.x + 118 - key.x) * k / 8, key.y + (i.canvas.y + 150 - key.y) * k / 8); await p.waitForTimeout(20); }
console.log(await E(() => window.SYNQUENZER.svLayoutInfo().drag), await E(() => window.SYNQUENZER.svLayoutInfo().pv));
await p.screenshot({path: 'v3-v2e2-try-drag.png'});
await touch('touchEnd', 0, 0); await p.waitForTimeout(300);
console.log('pop', await T.pop());
await p.screenshot({path: 'v3-v2e2-try-drop.png'});
await T.tapPop('Einfügen'); await p.waitForTimeout(100);
console.log(await E(() => window.SYNQUENZER.svLayoutInfo().unfold));
await p.waitForTimeout(400);
await p.screenshot({path: 'v3-v2e2-try-done.png'});
console.log(await E(() => window.SYNQUENZER.song().marks), errs);
await b.close();
