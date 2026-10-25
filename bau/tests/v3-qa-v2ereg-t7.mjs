// QA (V2e): song view, bars selected (Bereich-Leiste instead of Träger) → ≡ → „Demo laden“ (UI, armed tap) or „Neu ▾ → Neues Projekt“:
// is the Träger bar back, or does a dead Bereich-Leiste stay? Persistence over time, after a canvas tap, after ▶
import { open, APP } from './v3-v2d-pw.mjs';
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2ereg/';
const st = () => { const c = document.getElementById('carrier'), r = document.getElementById('rangeBar'); const sv = document.getElementById('songView');
  return {car: !!(c && c.offsetWidth && c.offsetHeight), rng: !!(r && r.offsetWidth && r.offsetHeight), appRb: document.getElementById('app').classList.contains('rangebar'), songView: !!(sv && sv.offsetWidth), sel: window.SYNQUENZER.songSelect(), song: !!window.SYNQUENZER.song(), menu: (document.getElementById('menu') || {}).className || ''}; };
for (const [vp, w, h] of [['P1', 390, 844], ['L1', 844, 390]]) for (const how of ['demo', 'neu']) {
  const {b, p, errs} = await open({width: w, height: h}, APP, true);
  const cdp = await p.context().newCDPSession(p);
  const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, id: 1}]});
  const tap = async (x, y, wait = 300) => { await touch('touchStart', x, y); await p.waitForTimeout(40); await touch('touchEnd', x, y); await p.waitForTimeout(wait); };
  const tapText = async (t, scope = 'body') => { const r = await p.evaluate(([t, s]) => { const bb = [...document.querySelectorAll(s + ' button')].find(x => x.offsetWidth && x.textContent.trim().startsWith(t)); if (!bb) return null; const q = bb.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; }, [t, scope]); if (r) await tap(r[0], r[1], 400); return !!r; };
  const out = {};
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(240); const K = {root: 9, scale: 'aeolian'};
    Q.setClip(0, 0, {len: 1, key: K, notes: [{t: 0, d: .4, n: 57, v: .8}]}); Q.songFromChain([{scene: 0, bars: 4}]); Q.songView(true); });
  await p.waitForTimeout(400);
  // select a bar via the ruler: first tap opens the mark sheet (scene mark), second selects the bar
  const i = await p.evaluate(() => window.SYNQUENZER.svLayoutInfo());
  await tap(i.canvas.x + i.cellW * 1.5, i.canvas.y + 8); await tap(i.canvas.x + i.cellW * 1.5, i.canvas.y + 8);
  out.before = await p.evaluate(st);
  // ≡ menu
  out.menuBtn = await tapText('≡');
  if (!out.menuBtn) { await p.evaluate(() => window.SYNQUENZER.openMenu()); await p.waitForTimeout(300); }
  if (how === 'demo') { out.t1 = await tapText('Demo laden'); out.t2 = await tapText('Projekt ersetzen?') || await tapText('Demo laden'); }
  else { out.t1 = await tapText('Neu ▾'); out.t2 = await tapText('Neues Projekt'); }
  await p.waitForTimeout(800);
  out.after = await p.evaluate(st);
  // close the menu if still open
  if (/open/.test(out.after.menu)) { await p.evaluate(() => window.SYNQUENZER.closeMenu()); await p.waitForTimeout(300); }
  out.afterMenu = await p.evaluate(st);
  await p.screenshot({path: D + `t7-${vp}-${how}.png`});
  await p.waitForTimeout(3000);
  out.after3s = await p.evaluate(st);
  // the dead buttons: tap ▶ Ab hier in the range bar
  const rb = await p.evaluate(() => { const e = document.querySelector('#rangeBar [data-a="play"]'); if (!e || !e.offsetWidth) return null; const q = e.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; });
  if (rb) { await tap(rb[0], rb[1], 500); out.afterRangePlay = await p.evaluate(() => ({playing: window.SYNQUENZER.runtime().playing})); await p.evaluate(() => window.SYNQUENZER.stop()); }
  out.errs = errs.slice();
  console.log('==', vp, how); for (const k of Object.keys(out)) console.log('  ' + k, JSON.stringify(out[k]));
  await b.close();
}
