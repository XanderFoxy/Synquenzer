import {launch, open, sleep, DIR} from './v3-qa-vs3-h.mjs';
const sine = (sr, sec, f, a = 0.3) => { const n = Math.round(sr * sec), x = new Array(n); for (let i = 0; i < n; i++) x[i] = Math.round(Math.sin(2 * Math.PI * f * i / sr) * a * 32767); return x; };
const br = await launch(null);
for (const [w, h, n] of [[390, 844, 'P1'], [844, 390, 'L1']]) {
  const H = await open(br, {viewport: {width: w, height: h}}), p = H.p;
  await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });
  await p.evaluate(() => document.fonts.ready);
  const r = await p.evaluate(pc => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 0, len: 1}), sine(48000, 1, 440));
  await p.evaluate(t => SYNQUENZER.selectSlot(t, 0), r.track); await sleep(400);
  const m = await p.evaluate(() => { const e = document.getElementById('stSub'), b = e.getBoundingClientRect(), s = getComputedStyle(e); return {t: e.textContent, sw: e.scrollWidth, cw: e.clientWidth, font: s.fontFamily.slice(0, 40), to: s.textOverflow, box: [b.x, b.y, b.width, b.height].map(Math.round)}; });
  // compare: a normal synth track label
  await p.evaluate(() => SYNQUENZER.selectSlot(0, 0)); await sleep(300);
  const m0 = await p.evaluate(() => { const e = document.getElementById('stSub'); return {t: e.textContent, sw: e.scrollWidth, cw: e.clientWidth}; });
  console.log(n, 'STIMME label', JSON.stringify(m), '| Synth 1 label', JSON.stringify(m0));
  await p.evaluate(t => SYNQUENZER.selectSlot(t, 0), r.track); await sleep(300);
  await p.screenshot({path: DIR + '/lab-' + n + '.png', clip: {x: Math.max(0, m.box[0] - 60), y: Math.max(0, m.box[1] - 20), width: 330, height: 60}});
  await p.close();
}
await br.close();
