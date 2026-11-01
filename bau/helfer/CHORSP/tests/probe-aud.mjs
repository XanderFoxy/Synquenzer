import { open, sing, style, sleep } from './lib.mjs';
const {b, p, errs} = await open();
await sing(p); await p.evaluate(() => { R.selS = 0; }); await style(p, 'pop');
await p.evaluate(() => g2Open({t: stimmeT(), s: 0})); await sleep(1500);
console.log(await p.evaluate(() => ({P: !!S.takes[G2.ed.id].pitch, n: (g2Notes(G2.ed.id) || []).length, ready: g2Ready(G2.ed.id, tkRef(G2.ed.r).a)})));
await p.evaluate(() => { const E = G2.ed; E.sel = 2; g2Paint(); window._h0 = tkHeard(E.id, tkRef(E.r).a); });
await p.evaluate(() => document.querySelector('#wpSheet .g2chips [data-v=up]').click());
for (let i = 0; i < 30; i++) { await sleep(150); const r = await p.evaluate(() => ({ready: g2Ready(G2.ed.id, tkRef(G2.ed.r).a), same: tkHeard(G2.ed.id, tkRef(G2.ed.r).a) === window._h0, aud: CHS.lastAud, sh: S.takes[G2.ed.id].pitch && S.takes[G2.ed.id].pitch.notes[2].sh})); if (i % 5 === 0 || r.aud) console.log(JSON.stringify(r)); if (r.aud) break; }
// WP pinch
await p.evaluate(() => wpOpen({t: stimmeT(), s: 0})); await sleep(900);
const c = await p.context().newCDPSession(p); const tt = (type, pts) => c.send('Input.dispatchTouchEvent', {type, touchPoints: pts.map((q, i) => ({x: q[0], y: q[1], id: i}))});
const E = await p.evaluate(() => SYNQUENZER.chsEd()); const cy = E.cv.y + E.cv.h * .55, cx = E.cv.x + E.cv.w / 2;
console.log(await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e.tagName + '.' + e.className; }, [cx - 30, cy]));
p.on('console', m => { if (m.text().startsWith('PD')) console.log(m.text()); });
await p.evaluate(() => { WP.ed.cvw.addEventListener('pointerdown', e => console.log('PD ' + e.pointerId + ' ' + e.target.tagName + ' ' + CHS.pts.size), true); });
await tt('touchStart', [[cx - 30, cy]]); await sleep(20); await tt('touchStart', [[cx - 30, cy], [cx + 30, cy]]);
for (let k = 1; k <= 8; k++) { await tt('touchMove', [[cx - 30 - k * 12, cy], [cx + 30 + k * 12, cy]]); await sleep(20); }
console.log(await p.evaluate(() => ({pinch: !!CHS.pinch, pts: CHS.pts.size, ed: SYNQUENZER.chsEd().view, w: WP.ed.chsW, z: WP.ed.zoom, z0: WP.ed.chsZ0})));
await tt('touchEnd', [[cx + 126, cy]]); await tt('touchEnd', []);
console.log(errs); await b.close();
