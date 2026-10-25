// ✕ on an MS 2000 track: does the editor close? (P 428x926; L 926x428)
import {open, sleep, OUT, check, done} from './v3-qa-gmk1-tl.mjs';
const L = process.argv[2] === 'L', mode = process.argv[3] || 'touch';
const T = await open({viewport: L ? {width: 926, height: 428} : {width: 428, height: 926}}); const {p, E, errs} = T;
const state = () => E(() => { const s = document.getElementById('synthSheet'); return {editor: SYNQUENZER.runtime().editor, cls: s && s.className, disp: s && getComputedStyle(s).display}; });
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(500);
console.log('VA open', JSON.stringify(await state()));
let x = await T.rectText('button', /^✕$/); await T.tap(x.cx, x.cy, 600);
console.log('VA after ✕', JSON.stringify(await state()));
await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(500);
await T.tapTxt('button', /^MS ?2000$/); await sleep(600);
console.log('MK open', JSON.stringify(await state()));
x = await T.rectText('button', /^✕$/);
if (mode === 'click') await p.mouse.click(x.cx, x.cy); else await T.tap(x.cx, x.cy, 0);
await sleep(600);
const s1 = await state(); console.log('MK after ✕', JSON.stringify(s1));
await p.screenshot({path: OUT + 'close-' + (L ? 'L' : 'P') + '-' + mode + '.png'});
x = await T.rectText('button', /^✕$/); if (x) { await T.tap(x.cx, x.cy, 600); }
const s2 = await state(); console.log('MK after 2nd ✕', JSON.stringify(s2));
// API close
await E(() => SYNQUENZER.closeEditor()); await sleep(400); const s3 = await state(); console.log('MK after closeEditor()', JSON.stringify(s3));
// reopen the MS 2000 track and close again
await E(() => { SYNQUENZER.openEditor(); }); await sleep(600); x = await T.rectText('button', /^✕$/); await T.tap(x.cx, x.cy, 600); const s4 = await state(); console.log('MK reopened, after ✕', JSON.stringify(s4));
check('C1 ✕ closes the editor of an MS 2000 track (sheet hidden)', !/open/.test(s1.cls) && s1.disp === 'none', s1);
console.log('errs', errs);
await T.br.close(); done();
