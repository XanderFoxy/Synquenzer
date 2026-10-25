// QA V2e t5: N7S-36 M-ANSICHT – with the Bereich-Leiste nothing outside it moves (all viewports), plus Marken-Blatt open
import { openVp, mk, SETUP, mkCheck, VPS } from './v3-qa-v2e-lib.mjs';
const {check, done} = mkCheck();
const SNAP = `(() => { const out = {}; let k = 0; for (const e of document.querySelectorAll('button, canvas, input, .partbar, #carrier, #side > *, #top, #modes, #kb, .kb')) { if (!e.offsetWidth || e.closest('#rangeBar') || e.closest('#carrier') || e.closest('#popLayer') || e.closest('#toast')) continue; const r = e.getBoundingClientRect(); const key = (e.id || e.className || e.tagName).toString().slice(0, 40) + '#' + (e.textContent || '').trim().slice(0, 12) + '#' + (k++); out[key] = [+r.x.toFixed(1), +r.y.toFixed(1), +r.width.toFixed(1), +r.height.toFixed(1)]; } return out; })()`;
for (const vp of (process.argv[2] ? [process.argv[2]] : Object.keys(VPS))) {
  const {b, p, errs, cdp} = await openVp(vp);
  const T = mk(p, cdp), {E} = T;
  await E(SETUP(true)); await E(() => window.SYNQUENZER.songView(true)); await p.waitForTimeout(400);
  const a = await E(SNAP);
  if (vp === 'P3') { await T.tapCv(3 * 36 + 10, 8); await T.tapCv(3 * 36 + 10, 8); await E(() => { if (UI.pop) closePop(); }); } else await T.tapCv(6 * 36 + 10, 8); await p.waitForTimeout(300);
  const on = await E(() => document.getElementById('app').classList.contains('rangebar'));
  const c = await E(SNAP);
  const moved = [];
  for (const k of Object.keys(a)) { const x = a[k], y = c[k]; if (!y) { moved.push(k + ' gone'); continue; } if (x.some((v, j) => Math.abs(v - y[j]) > 2)) moved.push(k + ' ' + JSON.stringify(x) + '→' + JSON.stringify(y)); }
  for (const k of Object.keys(c)) if (!a[k]) moved.push(k + ' new');
  const rb = await T.rect('#rangeBar'), car = await E(() => { const e = document.getElementById('carrier'); const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height, e.offsetWidth > 0]; });
  console.log(vp, 'rangebar', JSON.stringify(rb), 'carrier now', JSON.stringify(car));
  check(vp + ' N7S-36 Bereich-Leiste an: kein Element außerhalb verschiebt sich (±2 px)', on && moved.length === 0, moved.slice(0, 8));
  await b.close();
}
process.exit(done() ? 1 : 0);
