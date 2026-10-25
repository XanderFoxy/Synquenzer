// QA V2e′: the FANG sheet's ⠿ part chip got an invisible 7-px hit band above/below (::before). Does it cover other controls
// (✕, mini timeline, rows below) so that a tap there lands on the chip? elementFromPoint on a grid, base vs new, P1 P3 L1 L2
import { open, NEW, BASE, OUT } from './v3-qa-v2e2reg-pw.mjs';
const res = {};
for (const [name, file] of [['base', BASE], ['new', NEW]]) for (const [vp, w, h] of [['P1', 390, 844], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375]]) {
  const {b, p, errs} = await open({width: w, height: h}, file, true);
  await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.setBpm(240); Q.setMetronome(false); Q.launchScene(0); });
  await p.waitForFunction(() => window.SYNQUENZER.runtime().beat >= 9, null, {polling: 5});
  await p.evaluate(() => window.SYNQUENZER.launchClip(1, 1));
  await p.waitForFunction(() => window.SYNQUENZER.runtime().beat >= 17.3, null, {polling: 5});
  await p.evaluate(() => window.SYNQUENZER.fangTeil());
  await p.waitForTimeout(400);
  const r = await p.evaluate(() => {
    const sh = document.querySelector('.pop.fsheet'); if (!sh) return {sheet: false};
    const chip = sh.querySelector('.fs-chip'), cr = chip.getBoundingClientRect();
    const out = {sheet: true, chip: [cr.left, cr.top, cr.width, cr.height].map(Math.round), stolen: []};
    // every button/control of the sheet: sample points inside it; who gets the hit?
    for (const el of sh.querySelectorAll('button, input')) {
      const q = el.getBoundingClientRect(); if (!q.width) continue;
      let lost = 0, n = 0;
      for (let fx = .1; fx < 1; fx += .2) for (let fy = .05; fy < 1; fy += .15) { const x = q.left + q.width * fx, y = q.top + q.height * fy; const hit = document.elementFromPoint(x, y); n++; if (hit && !el.contains(hit) && chip.contains(hit)) lost++; }
      if (lost) out.stolen.push(el.textContent.trim().slice(0, 14) + ' ' + lost + '/' + n + ' rect ' + [q.left, q.top, q.width, q.height].map(Math.round).join(','));
    }
    return out; });
  await p.screenshot({path: OUT + `chipband-${name}-${vp}.png`});
  r.errs = errs.slice(); res[name + vp] = r; await b.close();
}
for (const k of Object.keys(res)) console.log(k, JSON.stringify(res[k]));
