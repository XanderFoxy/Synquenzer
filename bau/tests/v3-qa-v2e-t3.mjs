// QA V2e t3: N7S-37 (cell tap in a mark, ′, Auf alle übertragen incl. own clips/melody kept), N7S-38 (chord via touch + text),
// N7S-39 (label → track, keyboard plays it)
import { openVp, mk, SETUP, mkCheck } from './v3-qa-v2e-lib.mjs';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp('P1');
const T = mk(p, cdp), {E} = T;
await E(SETUP(true));
await E(() => { const Q = window.SYNQUENZER; Q.markAction('M3', 'rep', 2); });   // STROPHE T3–6 and T7–10
await E(() => window.SYNQUENZER.songView(true)); await p.waitForTimeout(400);
const STATES = () => E(() => { const s = window.SYNQUENZER.song(); const out = []; for (let b = 0; b < s.bars; b++) out.push(s.lanes.map(l => { let x = -1; for (const e of l) { if (e.bar > b) break; x = e.own ? 'o' : e.slot; } return x; })); return out; });
const st0 = await STATES();
let i = await T.info();
console.log('marks', JSON.stringify(i.marks), 'rows', i.rows, 'rowH', i.rowH);
// own clip on Synth 2 in the 2nd STROPHE (bar 7 = index 7) + a melody note there, to see whether [Auf alle übertragen] keeps them
await E(() => { const Q = window.SYNQUENZER; Q.makeOwn && Q.makeOwn(1, 7); });
const own0 = await E(() => JSON.stringify(window.SYNQUENZER.song().own));
console.log('own after makeOwn', own0.slice(0, 200));
// cell tap: Synth 1 (row 0) in bar 4 (index 3) inside the first STROPHE
const rowY = r => i.rulerH + i.rowH * (r + .5);
await T.tapCv(3 * 36 + 18, rowY(0));
const st1 = await STATES();
const changed = st1.map((r, k) => JSON.stringify(r) !== JSON.stringify(st0[k]) ? k : -1).filter(k => k >= 0);
i = await T.info();
check('N7S-37 Zellen-Tipp ändert nur Takt 4, Marke zeigt STROPHE′', JSON.stringify(changed) === '[3]' && i.marks.find(m => m.id === 'M3').label === 'STROPHE′', [changed, i.marks.map(m => m.label)]);
// Auf alle übertragen from the first place
await T.tapCv(2 * 36 + 18, 9);
const all = await T.popBtn('Auf alle');
check('[Auf alle 2 „Strophe“ übertragen] aktiv', all && !all.dis, all);
await T.tapPop('Auf alle');
const st2 = await STATES(); i = await T.info(); const s2 = await E(() => window.SYNQUENZER.song());
check('N7S-37 nach Übertragen: kein ′, beide Stellen gleich (Takt 4 = Takt 8)', !i.marks.some(m => /′/.test(m.label) && /STROPHE/.test(m.label)) && JSON.stringify(st2[3]) === JSON.stringify(st2[7].map((x, t) => t === 1 && x === 'o' ? st2[3][1] : x)), [i.marks.map(m => m.label), st2[3], st2[7]]);
const own1 = await E(() => { const s = window.SYNQUENZER.song(); return {own: Object.keys(s.own || {}), lane1: s.lanes[1]}; });
console.log('own after applyAll', JSON.stringify(own1));
check('6.3: eigener Clip (gleicher Slot) bleibt an der Zielstelle nach [Auf alle übertragen]', own1.own.length > 0 && own1.lane1.some(e => e.own && e.bar === 7), own1);
await E(() => window.SYNQUENZER.undo()); await p.waitForTimeout(200);
// N7S-38 chord via touch: chip in AKKORDE row at bar 4 (index 3 → F)
i = await T.info();
await E(() => window.SYNQUENZER.undo()); await p.waitForTimeout(200);   // undo the cell tap too
const carr0 = await E(() => JSON.stringify(window.SYNQUENZER.song().carrier));
await T.tapCv(3 * 36 + 12, rowY(i.rows.length - 3));
console.log('pop after chord tap', await T.pop());
const inp = await T.rect('#popLayer .pop .cp-in');
if (inp) {
  await T.tap(inp.x + inp.w / 2, inp.y + inp.h / 2);
  await p.keyboard.type('Dm7'); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
}
const car1 = await E(() => window.SYNQUENZER.song().carrier.map(c => c.beat + ':' + (c.target ? window.SYNQUENZER.prettyTarget ? '' : '' : 'O') + JSON.stringify(c.target && [c.target.root, c.target.q || c.target.quality || c.target.type])));
console.log('carrier after', JSON.stringify(car1));
const tb = await T.toastBtn('Für alle');
check('N7S-38 Akkord per Tipp + Texteingabe „Dm7“ → Toast [Für alle „Strophe“]', !!tb, await E(() => document.querySelector('#toast') && document.querySelector('#toast').textContent));
const lab = await E(() => window.SYNQUENZER.svLayoutInfo().marks.map(m => m.label));
check('N7S-38 nur diese Stelle: erste STROPHE′, zweite STROPHE', lab.includes('STROPHE′') && lab.includes('STROPHE'), lab);
if (tb) { await T.tap(tb.x, tb.y); }
const lab2 = await E(() => window.SYNQUENZER.svLayoutInfo().marks.map(m => m.label));
const u = await T.undoTop();
check('[Für alle] → beide STROPHE ohne ′, ein Undo group', !lab2.some(l => /STROPHE′/.test(l)) && /^group/.test(u || ''), [lab2, u]);
// audible: Träger at bar 8 (index 7, 2nd STROPHE 2nd bar) is Dm7 → the bass (Sz1, A 45) transposed to D
await E(() => { const Q = window.SYNQUENZER; Q.setBpm(300); Q.clearLog(); Q.songPlay(0); });
await p.waitForFunction(() => { const s = window.SYNQUENZER.runtime().song; return s.beat != null && s.beat >= 32.2; }, null, {timeout: 60000, polling: 10});
const lg = await E(() => window.SYNQUENZER.noteLog(600).filter(n => n.track === 0 && n.beat != null).map(n => [+n.beat.toFixed(2), n.out]));
await E(() => window.SYNQUENZER.songPlay(false));
console.log('bass log', JSON.stringify(lg));
// N7S-39: label tap selects the track; keyboard plays it
await p.waitForTimeout(300);
const lr = await E(() => { const l = [...document.querySelectorAll('.sv-l.trk')].find(x => x.dataset.t === '2'); const r = l.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; });
await T.tap(lr.x, lr.y);
const sel = await E(() => window.SYNQUENZER.runtime().selected ? window.SYNQUENZER.runtime().selected.track : window.SYNQUENZER.runtime().selT);
await E(() => { const Q = window.SYNQUENZER; Q.clearLog(); Q.keyOn(60, .8, 'k'); });
await p.waitForTimeout(150); await E(() => window.SYNQUENZER.keyOff(60, 'k'));
const kl = await E(() => window.SYNQUENZER.noteLog(20).map(n => n.track));
check('N7S-39 Etikett SYN 3 → Spur 3 gewählt, Tastatur spielt Spur 3', sel === 2 && kl.includes(2), [sel, kl]);
check('0 Konsolenfehler', !errs.length, errs);
await b.close();
process.exit(done() ? 1 : 0);
