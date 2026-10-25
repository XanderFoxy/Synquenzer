// QA V2e t9: ⧉ Kopie waiting state: other taps (transport, label, SCHLEIFE) end it? a later cell tap must not copy
import { openVp, mk, SETUP, mkCheck } from './v3-qa-v2e-lib.mjs';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp('P1');
const T = mk(p, cdp), {E} = T;
await E(SETUP(true)); await E(() => window.SYNQUENZER.songView(true)); await p.waitForTimeout(300);
const p0 = await T.proj();
await T.tapCv(3 * 36 + 10, 9); await T.tapPop('Kopie');
const hint = await E(() => document.querySelector('.sv-hint').textContent);
console.log('hint', hint, 'copy', await E(() => SV.copy));
// tap a track label (SYN 3) → should end the waiting state
const lr = await E(() => { const l = [...document.querySelectorAll('.sv-l.trk')].find(x => x.dataset.t === '2'); const r = l.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; });
await T.tap(lr.x, lr.y);
const st1 = await E(() => ({copy: SV.copy, hint: document.querySelector('.sv-hint').className + '|' + document.querySelector('.sv-hint').textContent}));
console.log('after label tap', JSON.stringify(st1));
// ⏮ tap
await T.tapSel('#songView .sv-home');
const st2 = await E(() => ({copy: SV.copy}));
console.log('after ⏮', JSON.stringify(st2));
// now a cell tap: Synth 3 in bar 2 (index 1) — Xander wants to change that clip
const i = await T.info();
await T.tapCv(1 * 36 + 18, i.rulerH + i.rowH * 2.5);
const s = await E(() => window.SYNQUENZER.song());
console.log('after cell tap marks', JSON.stringify(s.marks), 'bars', s.bars, 'undo', await T.undoTop());
check('⧉ Kopie wartet; Tipp auf Etikett/⏮ beendet das Warten – ein späterer Zellen-Tipp kopiert nicht', s.bars === 11 && s.marks.length === 3, [s.bars, s.marks.length, await T.undoTop()]);
check('0 Konsolenfehler', !errs.length, errs);
await b.close();
process.exit(done() ? 1 : 0);
