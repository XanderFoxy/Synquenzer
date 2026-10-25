// QA V2e t11: FOLGEN chip „⏸ HÄLT“ over the ruler while playing with a selection: which marks/numbers become untappable (P1, P3, L2)
import { openVp, mk, SETUP, mkCheck } from './v3-qa-v2e-lib.mjs';
const {check, done} = mkCheck();
for (const vp of ['P1', 'P3', 'L2']) {
  const {b, p, errs, cdp} = await openVp(vp);
  const T = mk(p, cdp), {E} = T;
  await E(SETUP(true)); await E(() => window.SYNQUENZER.songView(true)); await p.waitForTimeout(300);
  await E(() => { const Q = window.SYNQUENZER; Q.setBpm(90); Q.songPlay(0); }); await p.waitForTimeout(600);
  await T.tapCv(0 * 36 + 10, 9, 300);      // INTRO → Marken-Blatt (FOLGEN holds)
  const i = await T.info(), fol = await T.rect('.sv-fol');
  // which ruler points (center of each visible bar) are covered by the chip
  const cov = await E(([cx, cy, w, n]) => { const out = []; for (let k = 0; k < n; k++) { const x = cx + k * 36 + 18; if (x > cx + w) break; const e = document.elementFromPoint(x, cy + 9); out.push(k + 1 + ':' + (e && e.closest('.sv-fol') ? 'CHIP' : 'ok')); } return out; }, [i.canvas.x, i.canvas.y, i.canvas.w, 12]);
  console.log(vp, 'chip', JSON.stringify(fol), 'canvas', JSON.stringify(i.canvas), cov.join(' '));
  // tap REFRAIN / STROPHE under the chip
  const covered = cov.filter(x => x.endsWith('CHIP')).map(x => +x.split(':')[0] - 1);
  if (covered.length) {
    const bar = covered[0];
    await E(() => { if (UI.pop) closePop(); }); await p.waitForTimeout(100);
    await E(() => window.SYNQUENZER.songSelect(6, 6)); await p.waitForTimeout(200);
    await T.tapCv(bar * 36 + 18, 9, 300);
    const pop = await T.pop(), m = (await T.info()).mark;
    check(vp + ' Tipp auf die Marke unter dem HÄLT-Chip (Takt ' + (bar + 1) + ') öffnet das Marken-Blatt', /msheet/.test(pop || ''), [pop, m, await E(() => window.SYNQUENZER.viewState('song').follow)]);
  }
  if (vp === 'P3') await p.screenshot({path: 'v3-qa-v2e/fol-P3.png'});
  await E(() => window.SYNQUENZER.songPlay(false));
  await b.close();
}
process.exit(done() ? 1 : 0);
