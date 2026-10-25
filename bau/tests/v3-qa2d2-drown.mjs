// QA N7S-32 on the DRUMS track: own clip plays at its place, the changed scene clip elsewhere (noteLog src own/clip)
import { openT, waitSong, mk, SETUP, playLog } from './v3-qa2d2-lib.mjs';
const {check, done} = mk();
const {b, p, errs} = await openT({width: 390, height: 844}, false);
await p.evaluate(() => ensureAudio()); await p.waitForTimeout(300);
await p.evaluate(SETUP(true));
const id = await p.evaluate(() => window.SYNQUENZER.makeOwn(4, 4));     // Drums Sz1 (1-bar) at T5
await p.evaluate(() => window.SYNQUENZER.setClip(4, 0, {len: 1, notes: [{t: 0, d: .1, n: 37, v: .9}, {t: 2, d: .1, n: 37, v: .9}]}));
const L = (await playLog(p, 23.8, 4)).map(n => [+n.beat.toFixed(2), n.src, n.clipNote]);
check('drums own clip: T5 own 36, T3/T4/T6 the changed scene clip 37', L.some(x => Math.abs(x[0] - 16) < .02 && x[1] === 'own' && x[2] === 36) && L.some(x => Math.abs(x[0] - 12) < .02 && x[1] === 'clip' && x[2] === 37) && L.some(x => Math.abs(x[0] - 20) < .02 && x[2] === 37) && !L.some(x => x[0] >= 16 && x[0] < 20 && x[2] === 37), {id, L});
check('0 console errors', !errs.length, errs);
await b.close(); process.exit(done() ? 1 : 0);
