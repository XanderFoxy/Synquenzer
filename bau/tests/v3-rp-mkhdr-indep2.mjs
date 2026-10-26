// landscape: save (no rebuild) -> header clean -> touch drag -> header stale; then set the flag by hand -> header right
import {open, sleep, OUT, check, done} from './v3-qa-gmk2a-tl.mjs';
const L = process.argv[2] !== 'P';
const T = await open({viewport: L ? {width: 926, height: 428} : {width: 428, height: 926}}); const {p, E} = T;
const hd = () => E(() => { const H = ED.hdr; return {pn: H.pName.innerHTML.replace(/ title="[^"]*"/, ''), abHidden: H.ab.hidden, ed: SYNQUENZER.soundEdited(R.selT), name: S.tracks[R.selT].sound.name}; });
await E(() => SYNQUENZER.setMetronome(false));
await T.openEd(0); await sleep(400);
const eb = await T.rectText('button', /^MS ?2000$/); await T.tap(eb.cx, eb.cy, 1200);
await E(() => SYNQUENZER.saveSound(0, 'Quer MK', 'new')); await sleep(600);
const h1 = await hd(); console.log('after save (no rebuild)', JSON.stringify(h1));
const ks = await E(() => [...document.querySelectorAll('.mkx[data-k]')].filter(e => e.getClientRects().length).map(e => e.dataset.k).join(','));
console.log('visible panel keys', ks);
await T.dragMk('k2', -40, 14); await sleep(1500);
const h2 = await hd(); console.log('after k2 drag', JSON.stringify(h2));
await E(() => { UI.dirty.edHead = true; }); await sleep(300);
const h3 = await hd(); console.log('after setting UI.dirty.edHead by hand', JSON.stringify(h3));
// A/B now works?
const ab = await E(() => { const r = ED.hdr.ab.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height / 2}; });
await T.tap(ab.cx, ab.cy, 600); const h4 = await hd(); console.log('after A/B tap', JSON.stringify(h4), await E(() => JSON.stringify(UI.ab && {t: UI.ab.t, side: UI.ab.side})));
check('L: clean after save', !h1.ed && h1.abHidden && !/chg/.test(h1.pn), h1);
check('L: dot + A/B right after touch drag', h2.ed && /chg/.test(h2.pn) && !h2.abHidden, h2);
check('L: setting the flag fixes the header (root cause)', /chg/.test(h3.pn) && !h3.abHidden, h3);
await T.br.close(); done();
