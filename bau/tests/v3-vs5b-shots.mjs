import {launch, open5, sleep, toI16, clickTone, OUTB} from './v3-vs5b-h.mjs';
const VP = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], XL: [926, 428]};
const br = await launch(null); const T6 = [0.52, 0.77, 1.01, 1.24, 1.53, 1.71], x = clickTone(T6, 2.4, {toneFrom: 0.1});
const res = {};
for (const [name, [w, h]] of Object.entries(VP)) {
  const H = await open5(br, {touch: true, viewport: {width: w, height: h}}), p = H.p;
  await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(200);
  const r = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 1}), toI16(x));
  await p.evaluate(id => SYNQUENZER.wpDetect(id), r.id);
  await p.evaluate(r => { SYNQUENZER.selectSlot(r.track, 0); SYNQUENZER.wpOpen({t: r.track, s: 0}); }, r); await sleep(300);
  await p.evaluate(r => SYNQUENZER.wpQuantize({t: r.track, s: 0}, {grid: '1/8', strength: 0.7, mode: 'stretch'}), r);
  await p.evaluate(id => SYNQUENZER.wpLyrics(id, 'Lie-be ist ein Feu-er'), r.id);
  await p.evaluate(id => SYNQUENZER.wpPlayed(id, 0, 1), r.id); await sleep(300);
  await p.evaluate(() => document.querySelectorAll('.toast, #toast').forEach(e => e.remove()));
  await p.screenshot({path: OUTB + '/ed-' + name + '.png'});
  res[name] = await p.evaluate(() => { const sh = document.getElementById('wpSheet').getBoundingClientRect(), bad = [];
    for (const b of document.querySelectorAll('#wpSheet button')) { const r = b.getBoundingClientRect(); if (r.right > sh.right + .5 || r.bottom > sh.bottom + .5 || r.left < sh.left - .5 || b.scrollWidth > b.clientWidth + 1) bad.push(b.textContent); }
    return {sheet: [Math.round(sh.top), Math.round(sh.bottom), innerHeight], bad, page: [document.documentElement.scrollWidth, innerWidth]}; });
  await H.ctx.close();
}
console.log(JSON.stringify(res));
await br.close();
