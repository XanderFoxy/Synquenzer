// QA V2e t1: ruler gestures via CDP touch (P1): hold → lift → release sheet; hold+move; swipe scrolls; tap into selection; play no jump
import { openVp, mk, SETUP, mkCheck } from './v3-qa-v2e-lib.mjs';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp('P1');
const T = mk(p, cdp), {E} = T;
await E(SETUP(true)); await E(() => window.SYNQUENZER.songView(true)); await p.waitForTimeout(400);
let i = await T.info();
console.log(JSON.stringify(i.marks), i.canvas);
const cx = i.canvas.x, cy = i.canvas.y;
const p0 = await T.proj();
// hold STROPHE (bar 3 → x 3*36+10) for 500 ms: mark lifted before release?
await T.touch('touchStart', cx + 3 * 36 + 10, cy + 9);
await p.waitForTimeout(520);
const lifted = await E(() => window.SYNQUENZER.svLayoutInfo().mark);
const popBefore = await T.pop();
await T.touch('touchEnd', cx + 3 * 36 + 10, cy + 9); await p.waitForTimeout(300);
const popAfter = await T.pop();
check('Halten 450 ms hebt die Marke an (vor dem Loslassen), kein Blatt; Loslassen → Marken-Blatt', lifted === 'M3' && !popBefore && /msheet/.test(popAfter || ''), [lifted, popBefore, popAfter]);
await T.tapPop('✕'); await p.waitForTimeout(200);
// a short hold 380 ms (between tap 350 and hold 450): nothing at all?
await T.touch('touchStart', cx + 3 * 36 + 10, cy + 9); await p.waitForTimeout(390); await T.touch('touchEnd', cx + 3 * 36 + 10, cy + 9); await p.waitForTimeout(300);
console.log('INFO 390 ms press on mark → pop', await T.pop(), 'mark', (await T.info()).mark);
if (await T.pop()) { await E(() => closePop()); await p.waitForTimeout(150); }
// swipe over the ruler starting on a mark: scrolls, no sheet, nothing changed
await T.touch('touchStart', cx + 250, cy + 9);
for (let k = 1; k <= 8; k++) { await T.touch('touchMove', cx + 250 - k * 15, cy + 9); await p.waitForTimeout(16); }
await T.touch('touchEnd', cx + 130, cy + 9); await p.waitForTimeout(600);
i = await T.info();
check('Wischen über die Marke rollt (x0 > 0), kein Blatt, keine Änderung', i.x0 > 0 && !(await T.pop()) && (await T.proj()) === p0, [i.x0, await T.pop()]);
await E(() => { SV.x = 0; UI.dirty.song = true; }); await p.waitForTimeout(200);
// tap a number (bar 7 = break, x 6*36+10) → selected; tap into it → selection off, Positionsmarke stays
await T.tapCv(6 * 36 + 10, 9);
const s1 = (await T.info()).sel, pos1 = (await T.info()).pos;
await T.tapCv(6 * 36 + 20, 9);
const s2 = (await T.info()).sel, pos2 = (await T.info()).pos;
check('Tipp in die Auswahl → Auswahl weg, Positionsmarke bleibt', JSON.stringify(s1) === '{"a":6,"b":6}' && s2 === null && pos1 === 6 && pos2 === 6, [s1, s2, pos1, pos2]);
// tap chosen mark twice: first chosen + sheet, second → bar selection (mark open, numbers visible)
await T.tapCv(4 * 36 + 10, 9); const pa = await T.pop(), ma = (await T.info()).mark;
await T.tapCv(4 * 36 + 10, 9); const pb = await T.pop(), ib = await T.info();
check('Tipp Marke → Blatt; zweiter Tipp → Takt 5 gewählt in der Marke', /msheet/.test(pa || '') && ma === 'M3' && !pb && JSON.stringify(ib.sel) === '{"a":4,"b":4}', [pa, ma, pb, ib.sel]);
// range bar shows
const rb = await T.rect('#rangeBar');
check('Bereich-Leiste sichtbar bei Takt-Auswahl in der Marke', !!rb, rb);
// tap a 3rd bar inside open mark → range
await T.tapCv(5 * 36 + 10, 9);
console.log('INFO third tap in open mark sel', JSON.stringify((await T.info()).sel));
await T.tapCv(5 * 36 + 10, 9);
// while playing: tap a number does not restart
await E(() => { const Q = window.SYNQUENZER; Q.songSelect(null); Q.setBpm(120); Q.clearLog(); Q.songPlay(0); });
await p.waitForFunction(() => { const s = window.SYNQUENZER.runtime().song; return s.beat != null && s.beat >= 2.5; }, null, {timeout: 20000, polling: 10});
const bb = await E(() => window.SYNQUENZER.runtime().song.beat);
await T.tapCv(6 * 36 + 10, 9, 100);
await p.waitForTimeout(400);
const ba = await E(() => window.SYNQUENZER.runtime().song.beat);
check('Tipp auf Taktnummer bei laufendem Song: kein Sprung', ba > bb && ba < bb + 3, [bb, ba]);
// tap a mark while playing: Marken-Blatt, no jump
await T.tapCv(8 * 36 + 10, 9, 100); await p.waitForTimeout(300);
const bc = await E(() => window.SYNQUENZER.runtime().song.beat);
check('Tipp auf Marke bei laufendem Song: Blatt, kein Sprung', /msheet/.test((await T.pop()) || '') && bc > ba && bc < ba + 3, [ba, bc, await T.pop()]);
await E(() => window.SYNQUENZER.songPlay(false)); await p.waitForTimeout(200);
check('0 Konsolenfehler', !errs.length, errs);
await b.close();
process.exit(done() ? 1 : 0);
