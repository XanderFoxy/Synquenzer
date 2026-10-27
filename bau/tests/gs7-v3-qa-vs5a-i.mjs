// QA VS5a I: with the mark sheet [✕ Löschen][Abbrechen] open, a tap elsewhere on the canvas – what happens? (touch via CDP)
import {launch, open5, sleep, clicks, toI16} from './gs7-v3-qa-vs5a-h2.mjs';
const br = await launch(null);
const H = await open5(br, {touch: true, mobile: true}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
const OFF = [12, -18, 30, -8, 45, -40, 20, 0, 22, -26, 15, -5];
const r = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 2}), toI16(clicks(OFF.map((o, k) => 0.5 + k * 0.25 + o / 1000), 3.6)));
await p.evaluate(id => SYNQUENZER.wpDetect(id), r.id); await sleep(2500);
await p.evaluate(() => SYNQUENZER.wpOpen({t: SYNQUENZER.tkInfo().stimme, s: 0})); await sleep(400);
const cdp = await p.context().newCDPSession(p);
const tap = async (x, y) => { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id: 1}]}); await sleep(60); await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await sleep(350); };
for (const where of ['empty canvas', 'another mark', 'outside the editor (grid)']) {
  const G = await p.evaluate(() => SYNQUENZER.wpGeom()), y = G.y + G.h * 0.55;
  const ms = G.marks.filter(mx => mx > G.x + 30 && mx < G.x + G.w - 80); if (!ms.length) { console.log('G', JSON.stringify(G)); break; }
  const st0 = await p.evaluate(id => ({n: SYNQUENZER.wpInfo(id).marks ? SYNQUENZER.wpInfo(id).marks.length : SYNQUENZER.wpInfo(id).det.length, u: SYNQUENZER.undoInfo().n}), r.id);
  await tap(ms[0], y);
  const pop = await p.evaluate(() => !!document.querySelector('.pop.wpsel'));
  const pr = await p.evaluate(() => { const q = document.querySelector('.pop.wpsel'); if (!q) return null; const R = q.getBoundingClientRect(); return {pop: [R.left, R.top, R.width, R.height].map(Math.round), btn: [...q.querySelectorAll('button')].map(b => { const r = b.getBoundingClientRect(); return b.textContent.trim() + ' ' + [r.left, r.top, r.width, r.height].map(Math.round).join(','); })}; });
  let ex = null; for (let xx = G.x + 250; xx < G.x + G.w - 10; xx += 3) if (G.marks.every(m => Math.abs(m - xx) > 19)) { ex = xx; break; }
  if (where === 'empty canvas') await tap(ex, y); else if (where === 'another mark') await tap(ms[2], y); else await tap(200, 120);
  const st1 = await p.evaluate(id => ({n: SYNQUENZER.wpInfo(id).marks ? SYNQUENZER.wpInfo(id).marks.length : SYNQUENZER.wpInfo(id).det.length, u: SYNQUENZER.undoInfo().n, top: SYNQUENZER.undoInfo().top && SYNQUENZER.undoInfo().top.label, pop: !!document.querySelector('.pop.wpsel'), ed: !!SYNQUENZER.wpInfo(id).editor}), r.id);
  console.log('  canvas', [G.x, G.y, G.w, G.h].map(Math.round).join(','), 'mark tapped at', Math.round(ms[0]), 'pop', JSON.stringify(pr), 'second tap at', where === 'empty canvas' ? Math.round(ex) + ',' + Math.round(y) : where);
  console.log('sheet open', pop, '→ tap on', where, ':', JSON.stringify(st0), '→', JSON.stringify(st1));
  await p.evaluate(() => { if (!SYNQUENZER.wpInfo().editor) SYNQUENZER.wpOpen({t: SYNQUENZER.tkInfo().stimme, s: 0}); }); await sleep(300);
}
console.log('errors', JSON.stringify(H.errs));
await br.close();
