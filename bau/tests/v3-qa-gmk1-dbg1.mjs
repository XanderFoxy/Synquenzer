import {open, sleep, OUT, check, done, eq} from './v3-qa-gmk1-tl.mjs';
const T = await open(); const {p, E, errs} = T;
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(500);
const mkb = await T.rectText('button', /^MS ?2000$/); await T.tap(mkb.cx, mkb.cy, 700);
const wb = await E(() => { const e = document.querySelector('#mkWh .mkwheel[data-w="bend"] .mwell'); const r = e.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height / 2, h: r.height}; });
// A: one finger on BEND, up, release
await T.down(wb.cx, wb.cy); await T.glide(wb.cx, wb.cy, wb.cx, wb.cy - 50, 8, 16);
const a1 = await E(() => SYNQUENZER.mkWheel(0, 'bend')); await T.up(); await sleep(200);
const a2 = await E(() => SYNQUENZER.mkWheel(0, 'bend'));
console.log('A one finger', a1, '→ after release', a2);
// B: key held (id 1), then wheel (id 2), lift the wheel finger first by touchMove with only id 1
const k0 = await T.key(0);
await T.send('touchStart', [{x: k0.cx, y: k0.cy, id: 1}]); await sleep(100);
await T.send('touchStart', [{x: k0.cx, y: k0.cy, id: 1}, {x: wb.cx, y: wb.cy, id: 2}]);
for (let k = 1; k <= 8; k++) { await T.send('touchMove', [{x: k0.cx, y: k0.cy, id: 1}, {x: wb.cx, y: wb.cy - k * 8, id: 2}]); await sleep(16); }
const b1 = await E(() => SYNQUENZER.mkWheel(0, 'bend'));
await E(() => { window.__pe = []; for (const t of ['pointerup', 'pointercancel', 'touchend', 'lostpointercapture']) document.addEventListener(t, e => window.__pe.push(t + ':' + (e.pointerId || '') + ':' + (e.target.className || e.target.id || e.target.tagName)), true); });
await T.send('touchMove', [{x: k0.cx, y: k0.cy, id: 1}]); await sleep(200);
const b2 = await E(() => SYNQUENZER.mkWheel(0, 'bend')); const v2 = await E(() => SYNQUENZER.voices().length);
console.log('B wheel lifted via touchMove(only key)', b1, '→', b2, 'voices', v2, await E(() => window.__pe));
await T.send('touchEnd', []); await sleep(300);
console.log('B all lifted', await E(() => SYNQUENZER.mkWheel(0, 'bend')), await E(() => window.__pe));
// WRITE → prog row text right after save
await T.tapMk('write', 400);
await E(() => { const i = document.querySelector('#popLayer .pop input'); i.value = 'Xanders Bass'; i.dispatchEvent(new Event('input', {bubbles: true})); });
const sb = await T.rectText('#popLayer .pop button', /^Sichern$/); await T.tap(sb.cx, sb.cy, 300);
await sleep(1500);
const pr = await E(() => ({prog: document.querySelector('.mkx[data-k="prog"]').textContent, disp: SYNQUENZER.mkPanel().disp, name: SYNQUENZER.getSound(0).name, hdr: document.querySelector('.pv') && document.querySelector('.pv').textContent, n0: document.querySelector('.mkx[data-k="n0"]').className}));
console.log('after WRITE (1.5 s):', JSON.stringify(pr));
await p.screenshot({path: OUT + 'dbg-write.png'});
// ⋯ Init then ↶
const dots = await T.rectText('button', /^⋯$/); await T.tap(dots.cx, dots.cy, 300); await T.tapPop(/Init/); await sleep(400);
console.log('after init', await E(() => SYNQUENZER.getSound(0).name), await T.undoN(), JSON.stringify(await T.undoTop()));
const un = await E(() => [...document.querySelectorAll('button')].filter(b => b.textContent.trim() === '↶').map(b => { const r = b.getBoundingClientRect(); return [b.className, Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height), b.disabled, getComputedStyle(b).visibility]; }));
console.log('undo buttons', JSON.stringify(un), 'pop', await T.pop(), 'toast', await T.toast());
const hit = await E(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + '.' + e.className + ' ' + e.textContent.trim().slice(0, 20) : null; }, [un[0][1] + 20, un[0][2] + 20]);
console.log('elementFromPoint at ↶', hit);
await T.tapTxt('button', /^↶$/); await sleep(400);
console.log('after ↶', await E(() => SYNQUENZER.getSound(0).name), await T.undoN());
console.log('errs', errs);
await T.br.close();
