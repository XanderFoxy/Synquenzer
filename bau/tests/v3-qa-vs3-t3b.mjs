// T3b: control for touch scroll (exempt list from guardTouch) + undo staleness with real undo actions
import {launch, open, sleep} from './v3-qa-vs3-h.mjs';
const sine = (sr, sec, f) => { const n = Math.round(sr * sec), x = new Array(n); for (let i = 0; i < n; i++) x[i] = Math.round(Math.sin(2 * Math.PI * f * i / sr) * 9000); return x; };
const br = await launch(null);
for (const [w, h] of [[390, 844], [844, 390]]) {
  const H = await open(br, {viewport: {width: w, height: h}, touch: true, mobile: true}), p = H.p, cdp = await p.context().newCDPSession(p);
  await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });
  let r; for (let k = 0; k < 8; k++) r = await p.evaluate(pc => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 0, len: 1}), sine(48000, 1, 300 + 50 * k));
  console.log(w, 'undo after inject:', JSON.stringify(await p.evaluate(() => SYNQUENZER.undoInfo().top)));
  await p.evaluate(t => SYNQUENZER.openRoll(t, 0), r.track); await sleep(400);
  const drag = async () => { const lb = await p.evaluate(() => { const b = document.querySelector('.pop.tksheet .tklist').getBoundingClientRect(); return {x: b.x + b.width * 0.4, y0: b.y + b.height * 0.85, y1: b.y + b.height * 0.1}; });
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: lb.x, y: lb.y0}]});
    for (let k = 1; k <= 12; k++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: lb.x, y: lb.y0 + (lb.y1 - lb.y0) * k / 12}]}); await sleep(16); }
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await sleep(600);
    return p.evaluate(() => { const l = document.querySelector('.pop.tksheet .tklist'); return [l.scrollTop, l.clientHeight, l.scrollHeight]; }); };
  console.log('  app as built: scrollTop/client/scroll', JSON.stringify(await drag()), 'top row pressed:', await p.evaluate(() => document.querySelector('.pop.tksheet .tkrow.on b').textContent));
  await p.evaluate(() => document.querySelector('.pop.tksheet .tklist').classList.add('pan-x'));
  console.log('  control (list exempt from guardTouch): ', JSON.stringify(await drag()));
  await p.evaluate(() => { document.querySelector('.pop.tksheet .tklist').classList.remove('pan-x'); document.querySelector('.pop.tksheet .tklist').scrollTop = 0; });
  // stale after undo: tap ✕ on row 2 (real UI), then ↶ via the strip undo button
  const rows0 = await p.evaluate(() => document.querySelectorAll('.pop.tksheet .tkrow').length);
  const del = await p.evaluate(() => { const b = document.querySelectorAll('.pop.tksheet .tk-del')[1].getBoundingClientRect(); return {x: b.x + b.width / 2, y: b.y + b.height / 2}; });
  await p.touchscreen.tap(del.x, del.y); await sleep(300);
  const rows1 = await p.evaluate(() => { const e = document.querySelector('.pop.tksheet'); return e ? e.querySelectorAll('.tkrow').length : -1; });
  await p.evaluate(() => SYNQUENZER.undo()); await sleep(400);
  const rows2 = await p.evaluate(() => { const e = document.querySelector('.pop.tksheet'); return e ? e.querySelectorAll('.tkrow').length : -1; });
  const data = await p.evaluate(t => { const c = SYNQUENZER.getClip(t, 0); return 1 + (c.audio.alt || []).length; }, r.track);
  console.log(`  ✕ then undo: sheet rows ${rows0} → ${rows1} → ${rows2}; data has ${data} takes; undo top`, JSON.stringify(await p.evaluate(() => SYNQUENZER.undoInfo().top)));
  // tap row 3 (pick) then undo
  const pk = await p.evaluate(() => { const b = document.querySelectorAll('.pop.tksheet .tk-pick')[2].getBoundingClientRect(); return {x: b.x + b.width / 2, y: b.y + b.height / 2}; });
  const before = await p.evaluate(t => SYNQUENZER.getClip(t, 0).audio.take, r.track);
  await p.touchscreen.tap(pk.x, pk.y); await sleep(300);
  const mid = await p.evaluate(t => SYNQUENZER.getClip(t, 0).audio.take, r.track);
  const lab1 = await p.evaluate(() => document.querySelector('.pop.tksheet .tkrow.on small').textContent);
  await p.evaluate(() => SYNQUENZER.undo()); await sleep(300);
  const aft = await p.evaluate(t => SYNQUENZER.getClip(t, 0).audio.take, r.track);
  const lab2 = await p.evaluate(() => { const e = document.querySelector('.pop.tksheet'); return e ? [...e.querySelectorAll('.tk-pick')].map(b => b.textContent).join('|') : 'closed'; });
  console.log('  pick then undo: top take', before, '→', mid, '→', aft, '; sheet now:', lab2.slice(0, 160));
  console.log('  errs', JSON.stringify(H.errs.slice(0, 3)));
  await p.close();
}
await br.close();
