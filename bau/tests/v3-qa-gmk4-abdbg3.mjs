import {open, sleep, OUT} from './v3-qa-gmk4-tl.mjs';
const T = await open({viewport: {width: 428, height: 926}}); const {p, E, errs} = T;
const st = async l => console.log(l, JSON.stringify(await E(() => ({eng: SYNQUENZER.getSound(0).engine, ed: SYNQUENZER.soundEdited(0), ab: [...document.querySelectorAll('#synthSheet button.abb')].map(b => !b.hidden), dot: !!document.querySelector('#synthSheet .pv .chg'), editor: R.editor}))));
// VA reference: the demo sound (factory) on track 0, edit one VA control by touch
await E(() => { ensureAudio(); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(700);
await st('VA start');
const k = await E(() => { const e = [...document.querySelectorAll('#synthSheet .sh-body .knob, #synthSheet .sh-body [class*="knob"], #synthSheet .sh-body input[type=range]')].find(e => e.offsetWidth); if (!e) return null; const r = e.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height / 2, c: e.className}; });
console.log('VA control', JSON.stringify(k));
if (k) { await T.down(k.cx, k.cy); await T.glide(k.cx, k.cy, k.cx, k.cy - 40, 10, 20); await T.up(); await sleep(600); }
await st('VA after drag');
// MS 2000: engine switch, save, edit on the panel
await T.tapTxt('button', /^MS ?2000$/); await sleep(800);
await E(async () => { await SYNQUENZER.saveSound(0, 'AB Basis', 'new'); }); await sleep(500);
await st('MK saved');
await T.sweep('k0', 40, 10, 20); await sleep(800); await st('MK after CUTOFF drag');
await E(() => { UI.dirty.edHead = true; }); await sleep(300); await st('MK after forcing UI.dirty.edHead');
await T.br.close();
