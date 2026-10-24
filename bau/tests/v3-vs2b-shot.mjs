import {open, micOn, b64} from './v3-vs2-h.mjs';
for (const [nm, w, h] of [['P1', 390, 844], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375]]) {
  const H = await open({viewport: {width: w, height: h}}), p = H.p; const m = await micOn(p);
  const n = m.sr * 2, y = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { const t = i / m.sr; ph += 2 * Math.PI * 220 * Math.pow(2, (t > 0.2 ? 0.9 : 0) / 12 * Math.sin(2 * Math.PI * 5.5 * t)) / m.sr; let v = 0; for (let k = 1; k <= 8; k++) v += 0.08 / k * Math.sin(k * ph); y[i] = v * Math.min(1, t / 0.01); }
  await p.evaluate(b => window.__fake.play(b, window.__ctx.currentTime + 0.05), b64(y));
  await p.waitForTimeout(900);
  const vi = await p.evaluate(() => SYNQUENZER.vsInfo());
  await p.screenshot({path: `v3-vs2b-${nm}.png`});
  const ov = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  console.log(nm, 'lit', vi.lit, 'litN', vi.litN, 'hscroll', ov, 'errs', H.errs.length);
  await H.br.close();
}
