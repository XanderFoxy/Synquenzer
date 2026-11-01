import { open, sing, style, sleep } from './lib.mjs';
const {b, p, errs} = await open();
await sing(p); await p.evaluate(() => { R.selS = 0; });
await style(p, 'pop');
await p.evaluate(() => g2Open({t: stimmeT(), s: 0})); await sleep(1200);
const E = await p.evaluate(() => SYNQUENZER.chsEd()); console.log(JSON.stringify(E));
// Tipp aufs Lineal bei Takt 3 (Schlag 8)
const tx = E.t0 + 4 * E.sp, x = E.cv.x + (tx - E.view.a) / E.view.W * E.cv.w, y = E.rul.y + E.rul.h / 2;
await p.touchscreen.tap(x, y); await sleep(700);
console.log(JSON.stringify(await p.evaluate(() => ({playing: R.playing, cs: R.cstart.slice(), slot: R.slot.slice(), info: SYNQUENZER.chsInfo().run, log: SYNQUENZER.chsInfo().log, src: TK.src.filter(r => !r.dead).map(r => ({i: r.i, off: r.off, start: r.start - R.startTime, ch: (r.ch || []).length})), pt: SYNQUENZER.chsEd().pt, nl: SYNQUENZER.noteLog ? SYNQUENZER.noteLog().slice(0, 4) : null}))));
await p.screenshot({path: '/tmp/claude-0/play.png'});
await p.evaluate(() => SYNQUENZER.chsStop()); await sleep(200);
console.log('stopped', await p.evaluate(() => R.playing));
console.log(errs); await b.close();
