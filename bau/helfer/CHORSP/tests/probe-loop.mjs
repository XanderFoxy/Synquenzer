import { open, sing, style, sleep } from './lib.mjs';
const {b, p, errs} = await open();
await sing(p); await p.evaluate(() => { R.selS = 0; });
await style(p, 'pop');
await p.evaluate(() => g2Open({t: stimmeT(), s: 0})); await sleep(1200);
const E = await p.evaluate(() => SYNQUENZER.chsEd());
// Loop ziehen auf dem Lineal von Schlag 4 bis 8 (Takt 2) per CDP-Touch
const X = t => E.cv.x + (t - E.view.a) / E.view.W * E.cv.w, y = E.rul.y + 22;
const cdp = await p.context().newCDPSession(p);
const touch = async (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts.map((q, i) => ({x: q[0], y: q[1], id: i}))});
await touch('touchStart', [[X(2.02), y]]); for (let k = 1; k <= 8; k++) { await touch('touchMove', [[X(2.02 + k * 2 / 8 * .98), y]]); await sleep(16); } await touch('touchEnd', []); await sleep(200);
console.log('loop', JSON.stringify(await p.evaluate(() => SYNQUENZER.chsEd().loop)));
await p.tap ? 0 : 0;
await p.evaluate(() => { const b = document.querySelector('.chsrul [data-a=play]'); b.click(); }); 
const t0 = Date.now(); const seen = [];
for (let i = 0; i < 30; i++) { await sleep(150); seen.push(await p.evaluate(() => { const r = TK.src.filter(r => !r.dead && r.i === stimmeT()); return {b: +audBeat().toFixed(2), pt: SYNQUENZER.chsEd().pt, src: r.map(x => +x.off.toFixed(2) + '@' + +((x.start - R.startTime) / spb()).toFixed(2))}; })); }
console.log(seen.filter((_, i) => i % 3 === 0).map(s => JSON.stringify(s)).join('\n'));
console.log(JSON.stringify(await p.evaluate(() => SYNQUENZER.chsInfo().run)));
await p.evaluate(() => SYNQUENZER.chsStop());
console.log(errs); await b.close();
