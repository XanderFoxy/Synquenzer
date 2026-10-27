// QA VS5b regression: FANG (capture) by touch after playing a phrase, then undo; portrait
import {launch, open5, sleep} from './v3-vs5b-h.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const br = await launch(null);
const H = await open5(br, Object.assign({touch: true, mobile: true}, process.argv[2] ? {url: 'file://' + process.argv[2]} : {})), p = H.p;
await p.evaluate(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); });
const T = await p.evaluate(() => { const P = SYNQUENZER.project(); const t = P.tracks.findIndex(x => x.kind === 'synth'); const s = P.tracks[t].clips.findIndex(c => !c); SYNQUENZER.selectSlot(t, s); return {t, s}; });
await p.evaluate(() => SYNQUENZER.play()); await sleep(600);
for (const n of [60, 62, 64, 65, 67, 65, 64, 62]) { await p.evaluate(n => { SYNQUENZER.keyOn(n, .8, 'play'); setTimeout(() => SYNQUENZER.keyOff(n, 'play'), 200); }, n); await sleep(250); }
await sleep(300);
const lit = await p.evaluate(() => document.querySelector('#bFang').classList.contains('lit'));
const u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
await (await p.$('#bFang')).tap(); await sleep(400);
const c = await p.evaluate(T => SYNQUENZER.getClip(T.t, T.s), T);
ok(lit && c && c.notes && c.notes.length >= 6, 'FANG lit and caught the phrase into a clip: ' + (c && c.notes ? c.notes.length + ' notes, len ' + c.len : JSON.stringify(c)));
await p.evaluate(() => SYNQUENZER.undo()); await sleep(200);
ok(!(await p.evaluate(T => SYNQUENZER.getClip(T.t, T.s), T)), 'one undo removes the caught clip');
await p.evaluate(() => SYNQUENZER.stop());
ok(!H.errs.length, 'no console errors ' + JSON.stringify(H.errs.slice(0, 3)));
await br.close(); console.log(fail ? 'FAIL ' + fail : 'ALL OK');
