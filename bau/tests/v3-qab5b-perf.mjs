// QA VS5b: 2nd repro of title/info cuts (P3, P1), layout jump on open/Text/mode, FP-IPHONE longtasks with a 60-s take
import {launch, open5, sleep, toI16, clickTone, SR} from './v3-vs5b-h.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const br = await launch(null);
const T2 = [0.55, 0.67, 0.95, 1.27, 1.52, 1.74], x2 = clickTone(T2, 2.6, {toneFrom: 0.2});
for (const [n, w, h] of [['P3', 320, 568], ['P1', 390, 844], ['L2', 667, 375]]) {
  const H = await open5(br, {touch: true, viewport: {width: w, height: h}}), p = H.p;
  await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
  const r = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 1, len: 2}), toI16(x2));
  const det = await p.evaluate(id => SYNQUENZER.wpDetect(id), r.id);
  for (let k = det.length - 1; k >= 0; k--) if (!T2.some(t => Math.abs(t - det[k].t) < 0.005)) await p.evaluate(([id, k]) => SYNQUENZER.wpMark(id, 'del', k), [r.id, k]);
  const page = () => p.evaluate(() => ({sh: document.scrollingElement.scrollHeight, sw: document.scrollingElement.scrollWidth, st: document.scrollingElement.scrollTop, vh: innerHeight, top: Math.round(document.querySelector('#top').getBoundingClientRect().top)}));
  const g0 = await page();
  await p.evaluate(r => { SYNQUENZER.selectSlot(r.track, 1); return SYNQUENZER.tkSheet({t: r.track, s: 1}); }, r); await sleep(300);
  await (await p.$('.tksheet button[data-a="wp"]')).tap(); await sleep(500);
  const g1 = await page();
  await (await p.$('#wpSheet .qchips button[data-v="1/8"]')).tap(); await sleep(200);
  await p.evaluate(id => SYNQUENZER.wpPlayed(id, 0, 1), r.id); await p.evaluate(() => SYNQUENZER.wpPaint && SYNQUENZER.wpPaint()); await sleep(200);
  await (await p.$('#wpSheet .wpmode button[data-m="slice"]')).tap(); await sleep(200);
  await (await p.$('#wpSheet .wpmode button[data-m="stretch"]')).tap(); await sleep(300);
  const g2 = await page();
  await (await p.$('#wpSheet .wptx')).tap(); await sleep(250);
  const g3 = await page();
  const t = await p.evaluate(() => { const b = document.querySelector('#wpSheet .qh b'), i = document.querySelector('#wpSheet .wpinfo'); return {title: b.textContent, tsw: b.scrollWidth, tcw: b.clientWidth, info: i.textContent, isw: i.scrollWidth, icw: i.clientWidth}; });
  console.log(' ', n, JSON.stringify(t));
  ok(t.tsw <= t.tcw + 1, n + ': editor title not cut (' + t.tsw + ' > ' + t.tcw + ')');
  ok(t.isw <= t.icw + 1, n + ': info line not cut (' + t.isw + ' > ' + t.icw + ')');
  ok([g1, g2, g3].every(g => g.sh === g0.sh && g.sw === g0.sw && g.top === g0.top), n + ': no layout jump (open, mode, Text) ' + JSON.stringify([g0, g1, g2, g3]));
  await H.ctx.close();
}
// FP-IPHONE: 60-s take, longtasks
{
  const H = await open5(br, {touch: true, viewport: {width: 390, height: 844}}), p = H.p;
  await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
  const T = []; for (let k = 0; k < 230; k++) T.push(0.5 + k * 0.25 + (((k * 37) % 9) - 4) * 0.007);
  const x = clickTone(T, 60);
  const r = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 1, len: 30}), toI16(x));
  await p.evaluate(() => { window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({entryTypes: ['longtask']}); });
  await p.evaluate(r => { SYNQUENZER.selectSlot(r.track, 1); return SYNQUENZER.tkSheet({t: r.track, s: 1}); }, r); await sleep(300);
  await (await p.$('.tksheet button[data-a="wp"]')).tap();
  await p.waitForFunction(id => { const i = SYNQUENZER.wpInfo(id); return (i.marks || i.det || []).length > 100; }, r.id, {timeout: 30000});
  const t0 = Date.now();
  await (await p.$('#wpSheet .qchips button[data-v="1/16"]')).tap();
  await p.waitForFunction(id => SYNQUENZER.wpInfo(id).ready, r.id, {timeout: 30000});
  const tr = Date.now() - t0, last = (await p.evaluate(id => SYNQUENZER.wpInfo(id), r.id)).last;
  for (const m of ['slice', 'stretch', 'slice', 'stretch']) { await (await p.$('#wpSheet .wpmode button[data-m="' + m + '"]')).tap(); await sleep(150); }
  await p.waitForFunction(id => SYNQUENZER.wpInfo(id).ready, r.id, {timeout: 30000});
  await (await p.$('#wpSheet .wptx')).tap(); await sleep(200);
  await (await p.$('.pop.wplyr input')).fill(Array.from({length: 130}, (_, k) => 'la-' + 'li').join(' ').slice(0, 400)); await (await p.$('.pop.wplyr button[data-a="ok"]')).tap(); await sleep(300);
  for (const z of [0, 1, 2, 3]) { await (await p.$('#wpSheet .wpz')).tap(); await sleep(120); }
  await p.evaluate(() => SYNQUENZER.play()); await sleep(1500); await p.evaluate(() => SYNQUENZER.stop());
  const lt = await p.evaluate(() => window.__lt);
  console.log('  render 60 s Dehnen', tr, 'ms (wall), last', JSON.stringify(last), 'longtasks', JSON.stringify(lt));
  ok(last.mode === 'stretch' && last.how === 'worker', '60-s take rendered in the worker');
  ok(!lt.some(d => d > 50), 'no longtask > 50 ms (open, quantize, 4 × mode, 400-char lyrics, zoom, play): ' + JSON.stringify(lt));
  ok(!H.errs.length, 'no console errors ' + JSON.stringify(H.errs.slice(0, 3)));
  await H.ctx.close();
}
await br.close(); console.log(fail ? 'FAIL ' + fail : 'ALL OK');
