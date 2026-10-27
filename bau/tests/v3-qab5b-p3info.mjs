// QA VS5b: 2nd repro – P3 info line with the N7V-29 warning (and title) cut
import {launch, open5, sleep, toI16, clickTone, OUTB} from './v3-vs5b-h.mjs';
const br = await launch(null);
const T2 = [0.55, 0.67, 0.95, 1.27, 1.52, 1.74], x2 = clickTone(T2, 2.6, {toneFrom: 0.2});
for (const [n, w, h] of [['P3', 320, 568], ['P2', 375, 667]]) {
  const H = await open5(br, {touch: true, viewport: {width: w, height: h}}), p = H.p;
  await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
  const r = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 1, len: 2}), toI16(x2));
  const det = await p.evaluate(id => SYNQUENZER.wpDetect(id), r.id);
  for (let k = det.length - 1; k >= 0; k--) if (!T2.some(t => Math.abs(t - det[k].t) < 0.005)) await p.evaluate(([id, k]) => SYNQUENZER.wpMark(id, 'del', k), [r.id, k]);
  await p.evaluate(r => { SYNQUENZER.selectSlot(r.track, 1); return SYNQUENZER.tkSheet({t: r.track, s: 1}); }, r); await sleep(300);
  await (await p.$('.tksheet button[data-a="wp"]')).tap(); await sleep(500);
  // by touch: Scheiben (strength → 100 %), chip 1/8, back to Dehnen (user strength 100 % stays) → factor 2.08 → warning
  await (await p.$('#wpSheet .wpmode button[data-m="slice"]')).tap(); await sleep(150);
  await (await p.$('#wpSheet .qchips button[data-v="1/8"]')).tap(); await sleep(300);
  await (await p.$('#wpSheet .wpmode button[data-m="stretch"]')).tap(); await sleep(200);
  await p.evaluate(() => { const i = document.querySelector('#wpSheet .qrow input[type=range]'); i.value = 100; i.dispatchEvent(new Event('input', {bubbles: true})); i.dispatchEvent(new Event('change', {bubbles: true})); }); await sleep(200);
  await p.evaluate(id => SYNQUENZER.wpPlayed(id, 0, 1), r.id); await sleep(300);
  const t = await p.evaluate(() => { const i = document.querySelector('#wpSheet .wpinfo'), b = document.querySelector('#wpSheet .qh b'); return {info: i.textContent, isw: i.scrollWidth, icw: i.clientWidth, to: getComputedStyle(i).textOverflow, title: b.textContent, tsw: b.scrollWidth, tcw: b.clientWidth}; });
  const W = await p.evaluate(id => SYNQUENZER.wpInfo(id), r.id);
  console.log(n, JSON.stringify(t), 'mode', W.warp.mode, W.warp.strength, 'warn', JSON.stringify(W.warn));
  await p.screenshot({path: OUTB + '/qa-' + n + '-info-warn.png'});
  await H.ctx.close();
}
await br.close();
