// independent repro: MS 2000 panel edits vs header row 2 (name dot + A/B), touch only for the edits
import {open, sleep, OUT, check, done} from './v3-qa-gmk2a-tl.mjs';
const L = process.argv[2] === 'L';
const T = await open({viewport: L ? {width: 926, height: 428} : {width: 428, height: 926}}); const {p, E} = T;
const hd = () => E(() => { const H = ED.hdr; return H ? {pn: H.pName.innerHTML.replace(/ title="[^"]*"/, ''), abHidden: H.ab.hidden, abVis: !!H.ab.offsetWidth, ed: SYNQUENZER.soundEdited(R.selT), dirtyEdHead: UI.dirty.edHead, name: S.tracks[R.selT].sound.name, eng: S.tracks[R.selT].sound.engine} : null; });
await E(() => SYNQUENZER.setMetronome(false));
await T.openEd(0); await sleep(400);
const eb = await T.rectText('button', /^MS ?2000$/); console.log('engine key', JSON.stringify(eb));
await T.tap(eb.cx, eb.cy, 1200);
const h0 = await hd(); console.log('after engine switch', JSON.stringify(h0));
// make it clean through the UI-free route: load the MK factory INIT / or save under a new name
if (h0.ed) { await E(() => SYNQUENZER.saveSound(0, 'Probe MK', 'new')); await sleep(300); await E(() => { SYNQUENZER.selectTrack(2); }); await sleep(300); await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(600); }
const h1 = await hd(); console.log('clean', JSON.stringify(h1));
// 1) touch drag on SPIEL knob k1 (not the CUTOFF used by the report)
const r1 = await T.dragMk('k1', -45, 14); console.log('drag k1', JSON.stringify(r1 && r1.cls));
await sleep(2500);
const h2 = await hd(); console.log('after k1 drag +2.5s', JSON.stringify(h2));
// 2) run the transport 2 s, play a keyboard note
await E(() => SYNQUENZER.play()); await sleep(2000); const h3 = await hd(); await E(() => SYNQUENZER.stop()); await sleep(300);
console.log('after 2 s playback', JSON.stringify(h3));
const kk = await T.key(14); if (kk) await T.tap(kk.cx, kk.cy, 600);
const h4 = await hd(); console.log('after a keyboard note', JSON.stringify(h4));
// 3) drag back to the start? no - second knob k3
await T.dragMk('k3', 40, 14); await sleep(800); const h5 = await hd(); console.log('after k3 drag', JSON.stringify(h5));
await p.screenshot({path: OUT + 'rp-indep-' + (L ? 'L' : 'P') + '.png'});
// 4) the only cure: rebuild (track switch)
await E(() => { SYNQUENZER.selectTrack(2); }); await sleep(300); await E(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(600);
const h6 = await hd(); console.log('after track switch', JSON.stringify(h6));
// VA control: same flow on track 1 with the VA editor
await T.openEd(1); await sleep(400);
const v0 = await hd(); if (v0.ed) { await E(() => SYNQUENZER.saveSound(1, 'Probe VA', 'new')); await sleep(300); await E(() => { SYNQUENZER.selectTrack(2); }); await sleep(300); await E(() => { SYNQUENZER.selectTrack(1); SYNQUENZER.openEditor(); }); await sleep(600); }
const v1 = await hd();
const kn = await E(() => { const k = [...document.querySelectorAll('.knob')].find(e => e.offsetWidth && e.getBoundingClientRect().y > 250); const r = k.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height / 2}; });
await T.down(kn.cx, kn.cy); await T.glide(kn.cx, kn.cy, kn.cx, kn.cy - 45, 14, 16); await T.up(); await sleep(800);
const v2 = await hd(); console.log('VA clean', JSON.stringify(v1), '→ after drag', JSON.stringify(v2));
check('MK: clean before edit', h1 && !h1.ed && h1.abHidden, h1);
check('MK: edit registered (soundEdited)', h2.ed, h2);
check('MK: header dot + A/B after edit', /chg/.test(h2.pn) && !h2.abHidden, h2);
check('MK: header dot + A/B after playback/note', /chg/.test(h4.pn) && !h4.abHidden, h4);
check('MK: header ok after rebuild', /chg/.test(h6.pn) && !h6.abHidden, h6);
check('VA: header dot + A/B after edit', /chg/.test(v2.pn) && !v2.abHidden, v2);
await T.br.close(); done();
