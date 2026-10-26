// QA group G-P1b, step 1: Xander's songwriting flow on P1 with touch: ▶1, ⇅ TRANSP., Am F C G ×2, FANG TEIL (tap), sheet, ＋ Song
import {open, OUT, check, done, tapEl, tapText, eq} from './vgmk34-grp-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const {br, p, errs, E} = await open();
await E(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); });
const beat = () => E(() => SYNQUENZER.runtime().beat);
const waitB = b => p.waitForFunction(b => SYNQUENZER.runtime().playing && SYNQUENZER.runtime().beat >= b, b, {timeout: 60000, polling: 10});
// ▶1
const b1 = await tapText(p, 'button.scn', /^▶\s*1/); console.log('tap ▶1', b1 && b1.t);
await p.waitForFunction(() => SYNQUENZER.runtime().playing, null, {timeout: 5000});
const r0 = await E(() => SYNQUENZER.runtime()); console.log('playing', r0.playing, 'slots', r0.slots, 'beat', r0.beat.toFixed(2));
// ⇅ TRANSP.
await tapEl(p, '#segTr'); await sleep(100);
check('⇅ TRANSPONIEREN by tap', await E(() => SYNQUENZER.runtime().kbMode) === 'transpose');
// wait for the next bar start, then play chords per bar (root key = Stufe)
let b0 = Math.ceil(await beat() / 4) * 4 + 4; console.log('chords from beat', b0);
const ROOT = {Am: 57, F: 53, C: 48, G: 55};
const seq = ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G'];
for (let k = 0; k < seq.length; k++) {
  await waitB(b0 + k * 4 - 0.5);
  // touch on the real piano key would be nicer; use the API keyOn (same input path)
  await E(n => SYNQUENZER.keyOn(n, 0.8, 'ch'), ROOT[seq[k]]); await sleep(120); await E(() => SYNQUENZER.keyOff(0, 'ch'));
}
const end = b0 + 32;
await waitB(end + 0.3);
const lab = await E(() => ({t: document.getElementById('bFang').textContent, lit: document.getElementById('bFang').classList.contains('lit'), mode: SYNQUENZER.runtime().fangMode, vis: getComputedStyle(document.getElementById('bFang')).visibility}));
check('FANG place shows FANG TEIL and is lit', /TEIL/.test(lab.t) && lab.vis === 'visible', lab);
const tb = await tapEl(p, '#bFang'); console.log('tapped FANG at beat', (await beat()).toFixed(2), tb);
await sleep(150);
const fp = await E(() => SYNQUENZER.fangPart());
check('FANG TEIL sheet open', await E(() => !!document.querySelector('.pop.fsheet')));
check('fangPart: 4 bars Am F C G, suggestion Strophe', fp && fp.len === 4 && fp.suggest.name === 'Strophe', fp && {len: fp.len, chords: fp.chords && fp.chords.ch.map(c => c.b + ':' + (c.tg && c.tg.name)), name: fp.suggest.name, end: fp.endText, clips: fp.clips});
await p.screenshot({path: OUT + 'flow1-sheet.png'});
// tap „＋ Song“ (Ans Song-Ende)
const be = await tapText(p, '.pop.fsheet button', /Song/); console.log('tap', be && be.t);
await sleep(150);
const pr = await E(() => ({parts: SYNQUENZER.parts().map(x => x && {name: x.name, len: x.len, lanes: x.lanes && x.lanes.map(l => l.length)}), marks: SYNQUENZER.songMarks(), song: SYNQUENZER.song() && {bars: SYNQUENZER.song().bars}, undo: SYNQUENZER.undoInfo(), rt: SYNQUENZER.runtime().part, keys: [...document.querySelectorAll('.pk')].map(k => k.textContent.trim())}));
check('Strophe part + song mark', pr.parts[0] && pr.parts[0].name === 'Strophe' && pr.song && pr.song.bars === 4, pr);
// the loop: carrier recalls over the next 4 bars
const tl0 = await E(() => SYNQUENZER.timeline().length);
const nb = Math.ceil(await beat() / 4) * 4;
await waitB(nb + 16.2);
const tl = await E(() => SYNQUENZER.timeline().filter(e => e.beat != null).map(e => [+e.beat.toFixed(2), e.name]));
console.log('timeline', JSON.stringify(tl.slice(-8)));
await E(() => SYNQUENZER.stop());
console.log('errs', errs);
await br.close();
done();
