// QA V2e t3b: [Auf alle übertragen] must keep own clips with the same slot at the target places (6.3) — clean case
import { openVp, mk, SETUP, mkCheck } from './v3-qa-v2e-lib.mjs';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp('P1');
const T = mk(p, cdp), {E} = T;
await E(SETUP(true));
await E(() => { const Q = window.SYNQUENZER; Q.markAction('M3', 'rep', 2); });   // STROPHE T3–6 and T7–10
const id = await E(() => window.SYNQUENZER.makeOwn(0, 7));                       // own clip: Bass in bar 8 (2nd STROPHE)
const s0 = await E(() => window.SYNQUENZER.song());
console.log('own id', id, 'lane0', JSON.stringify(s0.lanes[0]), 'from', JSON.stringify(s0.own[id] && s0.own[id].from));
await E(() => { const o = window.SYNQUENZER.song().own; });
await E(() => window.SYNQUENZER.songView(true)); await p.waitForTimeout(300);
await T.tapCv(2 * 36 + 18, 9); await T.tapPop('Auf alle');
const s1 = await E(() => window.SYNQUENZER.song());
console.log('after applyAll lane0', JSON.stringify(s1.lanes[0]), 'own', Object.keys(s1.own));
check('6.3 eigener Clip (Bass, gleicher Slot wie Vorlage) bleibt nach [Auf alle übertragen]', s1.lanes[0].some(e => e.own === id) && s1.own[id], s1.lanes[0]);
// audible: own clip notes in noteLog src own
await E(() => { const Q = window.SYNQUENZER; Q.setBpm(300); Q.clearLog(); Q.songPlay(0); });
await p.waitForFunction(() => { const s = window.SYNQUENZER.runtime().song; return s.beat != null && s.beat >= 32.2; }, null, {timeout: 60000, polling: 10});
const srcs = await E(() => window.SYNQUENZER.noteLog(600).filter(n => n.track === 0).map(n => n.src));
await E(() => window.SYNQUENZER.songPlay(false));
check('hörbar: eigener Clip spielt nach [Auf alle übertragen] noch (noteLog src own)', srcs.includes('own'), [...new Set(srcs)]);
await b.close();
process.exit(done() ? 1 : 0);
