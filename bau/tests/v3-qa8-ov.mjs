// QA MK8: Sichern popup „Überschreiben“ / „Ohne Platz“ on an own program place – place kept, undo?
import {launch, open} from './v3-qa8-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await launch(); const {ctx, page: p, errs} = await open(b, 'P1');
const cdp = await ctx.newCDPSession(p);
const tap = async (x, y, w = 400) => { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id: 1}]}); await sleep(40); await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await sleep(w); };
const tapSel = async s => { const r = await p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(e => e.offsetWidth); const q = e.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; }, s); await tap(r[0], r[1]); };
await p.evaluate(async () => { await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); mkProg.select(2, 5); SYNQUENZER.mkSet(0, 't.0.f.cut', 40); await mkProg.write(2, 5, 'Mein B05'); });
await sleep(400);
await p.evaluate(() => SYNQUENZER.mkSet(0, 't.0.f.cut', 99)); await sleep(200);
const s0 = await p.evaluate(() => ({u: SYNQUENZER.undoInfo().n, rec: JSON.stringify(MKF.ownAt(2, 5)), cut: MKF.ownAt(2, 5).p.mk.t[0].f.cut}));
await tapSel('#synthSheet .sh-head .hb.sv'); await tapSel('.pop.mk8w [data-a="ov"]'); await sleep(400);
const s1 = await p.evaluate(() => ({u: SYNQUENZER.undoInfo().n, top: SYNQUENZER.undoInfo().top && SYNQUENZER.undoInfo().top.label, own: MKF.ownAt(2, 5) && {name: MKF.ownAt(2, 5).name, cut: MKF.ownAt(2, 5).p.mk.t[0].f.cut}, cur: mkProg.current(), toast: (document.getElementById('toast') || {}).innerText}));
console.log('Überschreiben:', JSON.stringify({before: {u: s0.u, cut: s0.cut}, after: s1}));
await p.evaluate(() => SYNQUENZER.undo()); await sleep(300);
const s2 = await p.evaluate(() => ({u: SYNQUENZER.undoInfo().n, cut: MKF.ownAt(2, 5).p.mk.t[0].f.cut, trackCut: S.tracks[0].sound.p.mk.t[0].f.cut}));
console.log('after one undo:', JSON.stringify(s2), '→ place content', s2.cut === s0.cut ? 'restored' : 'NOT restored (still ' + s2.cut + ')');
console.log('errs', errs);
await b.close();
