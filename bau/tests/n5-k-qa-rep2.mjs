// QA repro run 2: (a) OSC 1 CONTROL 2 as LFO 1 depth (WFM/PWM/X-LFO/WFM/BAL-LFO on waves 0,1,2,3,4,7) in factory programs vs the list,
// render Streichsatz / Atemfläche against CONTROL 2 = 0; (b) the ⋯ hit area in 375x667, 320x568, 667x375 (elementFromPoint)
import {launch, seedWorklet, renderIn, dbDiff} from './n5-k-blib.mjs';
{
  const {b, p, errs} = await launch({});
  await seedWorklet(p);
  const L = await p.evaluate(async () => { mkLoad(); for (let i = 0; i < 60 && !mkLoaded(); i++) await new Promise(r => setTimeout(r, 100));
    const out = []; for (const [id, f] of FACTORY_BY_ID) if (f.engine === 'mk') { const s = factorySound(id), m = s.p.mk; if (m.mode === 3) continue; const dual = m.mode === 1 || m.mode === 2;
      for (let k = 0; k < (dual ? 2 : 1); k++) { const o = m.t[k].o1; if ([0, 1, 2, 3, 4, 7].includes(o.w) && o.c2 > 0) { loadPreset(2, id); out.push([id, s.name, 'T' + (k + 1), 'w' + o.w, 'c2 ' + o.c2, SYNQUENZER.k1Mods(2).filter(e => /Osz 1|Steuer|WFM|PWM|X-LFO|BAL/.test(e.src + e.dst)).length]); } } }
    return out; });
  console.log('programs:', L.length, 'with a CONTROL 2 entry in the list:', L.filter(x => x[5] > 0).length); console.log(JSON.stringify(L));
  const ev = [[0, 'on', 57, .8, 'n'], [2.8, 'off', 57, .8, 'n']];
  for (const id of ['f-mk-a11', 'f-mk-e03']) { const s = await p.evaluate(id => factorySound(id), id); const a = await renderIn(p, s, ev, {sec: 3, seed: 1}); const z = JSON.parse(JSON.stringify(s)); z.p.mk.t[0].o1.c2 = 0; const c = await renderIn(p, z, ev, {sec: 3, seed: 1});
    const empty = await p.evaluate(id => { loadPreset(2, id); SYNQUENZER.k1Open(2); const t = (document.querySelector('.pop.k1pop') || {}).innerText; closePop(); return t; }, id);
    console.log(JSON.stringify({id, name: s.name, vsC2zero: +dbDiff(c, a).toFixed(1), popText: empty.replace(/\n/g, ' | ')})); }
  console.log('errs', errs); await b.close();
}
for (const [w, h] of [[375, 667], [320, 568], [667, 375]]) {
  const {b, p} = await launch({viewport: {width: w, height: h}, touch: true, mobile: true, dpr: 2});
  await p.evaluate(() => { loadPreset(3, 'f-moog-bass'); selectTrack(3); ED.tab = 'osc'; openEditor(); }); await p.waitForTimeout(600);
  const r = await p.evaluate(() => { const x = [...EL.synthSheet.querySelectorAll('.edm')].find(x => x.getBoundingClientRect().width > 0); const q = x.getBoundingClientRect(), cx = q.x + q.width / 2, cy = q.y + q.height / 2;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (let y = Math.floor(cy - 40); y <= cy + 40; y++) for (let xx = Math.floor(cx - 40); xx <= cx + 40; xx++) { const e = document.elementFromPoint(xx, y); if (e && (e === x || x.contains(e))) { x0 = Math.min(x0, xx); x1 = Math.max(x1, xx); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }
    return {cls: x.className, box: [Math.round(q.width), Math.round(q.height)], hit: [x1 - x0 + 1, y1 - y0 + 1], at: [Math.round(q.x), Math.round(q.y)]}; });
  console.log(JSON.stringify({vp: w + 'x' + h, more: r}));
  await b.close();
}
