// QA V2e t8: N7S-34 at W 844×1180 (SV.x = 0, a = 8, len 4), running mark „3/4“, screenshot
import { openVp, mk, SETUP, mkCheck } from './v3-qa-v2e-lib.mjs';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp('W');
const T = mk(p, cdp), {E} = T;
await E(SETUP(true));
// song after insert has 11 bars; put STROPHE again at bar 8 … use ×: build 16 bars: INTRO 0-1, STROPHE 2-5, break 6, REFRAIN 7-10 → move: place STROPHE at 11 (append), then delete … simpler: setSong with a mark a=8
await E(() => { const Q = window.SYNQUENZER; Q.placePart(0, 11, 'insert'); Q.placePart(0, 8, 'replace'); });
const s = await E(() => window.SYNQUENZER.song());
console.log('marks', JSON.stringify(s.marks), 'bars', s.bars);
await E(() => window.SYNQUENZER.songView(true)); await p.waitForTimeout(400);
const i = await T.info();
const m = i.marks.find(x => x.label.startsWith('STROPHE') && Math.abs(x.x0 - 290) <= 1);
check('N7S-34 STROPHE a=8 len 4: x0 290, x1 430 (±1), Label STROPHE', !!m && Math.abs(m.x1 - 430) <= 1 && m.label === 'STROPHE', i.marks);
const g = async bar => T.grey(bar * 36 + 9, 3, 18, 14);
const v = []; for (const k of [7, 8, 9, 10, 11, 12]) v.push(await g(k));
console.log('grey per bar 8..13', v);
await E(() => { const Q = window.SYNQUENZER; Q.setBpm(60); Q.songPlay(8); });
await p.waitForFunction(() => { const s = window.SYNQUENZER.runtime().song; return s.beat != null && s.beat >= 40.3; }, null, {timeout: 30000, polling: 20});
await p.waitForTimeout(300);
await p.screenshot({path: 'v3-qa-v2e/n7s34-W.png', clip: {x: 0, y: 90, width: 844, height: 60}});
const playing = await E(() => window.SYNQUENZER.runtime().song.beat);
await E(() => window.SYNQUENZER.songPlay(false));
console.log('beat', playing);
check('0 Konsolenfehler', !errs.length, errs);
await b.close();
process.exit(done() ? 1 : 0);
