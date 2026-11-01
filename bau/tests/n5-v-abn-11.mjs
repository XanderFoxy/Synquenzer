// the sheet's own toasts (after [Sichern] / [Abbrechen]) over the sheet's buttons: hit test of every sheet button while the toast shows
import { open, SONG8, OUT } from './n5-v-abn-lib.mjs';
const SZ = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [926, 428]};
const res = {};
const hitAll = p => p.evaluate(() => { const o = []; const t = document.getElementById('toast'); const tq = t.getBoundingClientRect();
  for (const e of document.querySelectorAll('#vvSheet button')) { if (!e.getClientRects().length || getComputedStyle(e).visibility === 'hidden') continue; const q = e.getBoundingClientRect(), h = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); if (h && h !== e && !e.contains(h)) o.push(e.textContent.trim() + ' → #' + (h.closest('#toast') ? 'toast' : h.tagName)); }
  return {toast: t.textContent.trim().slice(0, 60), shown: t.classList.contains('show'), rect: [tq.left, tq.top, tq.width, tq.height].map(Math.round), covered: o}; });
for (const n of (process.argv[2] || 'P1,P2,P3,L1,L2,W').split(',')) {
  const {b, p, errs} = await open({w: SZ[n][0], h: SZ[n][1], touch: true, dpr: 2});
  await p.evaluate(s => { SYNQUENZER.setSong(s); SYNQUENZER.vvTest({opus: true}); SYNQUENZER.songSelect(0, 0); SYNQUENZER.vvOpen(); }, SONG8);
  await p.waitForTimeout(6000);   // the setSong toast is gone
  await p.tap('.vvacts .go');
  await p.waitForFunction(() => !SYNQUENZER.vvInfo().busy && SYNQUENZER.vvInfo().res, null, {timeout: 120000});
  await p.waitForTimeout(300);
  await p.tap('.vvdone .vvbtn:not(.go)'); await p.waitForTimeout(400);
  const a = await hitAll(p);
  // a tap on the covered 16:9 button while the toast shows
  const f0 = await p.evaluate(() => SYNQUENZER.vvPrefs().fmt);
  const q = await p.evaluate(() => { const e = document.querySelectorAll('#vvSheet .vvseg')[0].children[1]; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await p.touchscreen.tap(q[0], q[1]); await p.waitForTimeout(300);
  const f1 = await p.evaluate(() => SYNQUENZER.vvPrefs().fmt);
  res[n] = Object.assign(a, {tap169: f0 + ' → ' + f1});
  console.log(n, JSON.stringify(res[n]));
  await b.close();
}
