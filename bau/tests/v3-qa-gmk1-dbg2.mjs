import {open, sleep, OUT, check, done, eq} from './v3-qa-gmk1-tl.mjs';
const T = await open(); const {p, E, errs} = T;
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(500);
const mkb = await T.rectText('button', /^MS ?2000$/); await T.tap(mkb.cx, mkb.cy, 700);
const st = () => E(() => ({prog: document.querySelector('.mkx[data-k="prog"]').textContent, disp: SYNQUENZER.mkPanel().disp, name: SYNQUENZER.getSound(0).name, origin: SYNQUENZER.getSound(0).origin, n0: document.querySelector('.mkx[data-k="n0"]').className, title: document.querySelector('.mkx[data-k="n0"]').title}));
console.log('0', JSON.stringify(await st()));
// header Sichern
const sv = await T.rectText('button', /^Sichern$/); await T.tap(sv.cx, sv.cy, 400);
console.log('pop', JSON.stringify(await T.popTexts()));
await E(() => { const i = document.querySelector('#popLayer .pop input'); i.value = 'Alpha Bass'; i.dispatchEvent(new Event('input', {bubbles: true})); });
const sb = await T.rectText('#popLayer .pop button', /^Sichern$/); await T.tap(sb.cx, sb.cy, 300); await sleep(1200);
console.log('1 after header Sichern', JSON.stringify(await st()));
// re-render via SHIFT twice
await T.tapMk('shift'); await T.tapMk('shift'); await sleep(200);
console.log('2 after SHIFT×2', JSON.stringify(await st()));
// second sound via WRITE (different name), then check after
await T.dragMk('k0', 40, 8);
await T.tapMk('write', 400);
console.log('write pop', JSON.stringify(await T.popTexts()), await E(() => document.querySelector('#popLayer .pop') && document.querySelector('#popLayer .pop').innerText));
const an = await T.rectText('#popLayer .pop button', /neu|Neu|Kopie/); console.log('an', JSON.stringify(an)); if (an) { await T.tap(an.cx, an.cy, 400); console.log('pop2', JSON.stringify(await T.popTexts())); }
await E(() => { const i = document.querySelector('#popLayer .pop input'); if (i) { i.value = 'Beta Lead'; i.dispatchEvent(new Event('input', {bubbles: true})); } });
const sb2 = await T.rectText('#popLayer .pop button', /^Sichern$/); if (sb2) await T.tap(sb2.cx, sb2.cy, 300); await sleep(1200);
console.log('3 after WRITE Beta', JSON.stringify(await st()), 'lib', JSON.stringify(await E(() => SYNQUENZER.library().filter(s => s.engine === 'mk').map(s => s.name))));
await T.tapMk('shift'); await T.tapMk('shift'); await sleep(200);
console.log('4 after SHIFT×2', JSON.stringify(await st()));
await p.screenshot({path: OUT + 'dbg2-after.png'});
// tap key 1 (Alpha Bass) → loads; key 2 → Beta
await T.tapMk('n0', 400); console.log('5 n0', JSON.stringify(await st()), await T.toast());
await T.tapMk('n1', 400); console.log('6 n1', JSON.stringify(await st()), await T.toast());
console.log('errs', errs);
await T.br.close();
