// independent repro: stale Bereich-Leiste after undo of ⧉ Kopie (via ↶ button) and after „Demo laden“ (via ≡ menu), touch only
import { open } from './v3-v2d-pw.mjs';
const FILE = process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-wt/index.html';
const VP = (process.argv[3] || '390x844').split('x').map(Number);
const SHOT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-rep-rbstale-';
const tag = (process.argv[4] || 'new') + '-' + VP.join('x');
const st = () => { const vis = e => !!(e && e.offsetWidth && e.offsetHeight); const c = document.getElementById('carrier'), r = document.getElementById('rangeBar'); const s = window.SYNQUENZER.song();
  return {car: vis(c), rng: vis(r), appRb: document.getElementById('app').classList.contains('rangebar'), sel: window.SYNQUENZER.songSelect(), bars: s ? s.bars : null, playing: window.SYNQUENZER.runtime().playing,
    fol: (() => { const h = document.querySelector('#songView .sv-fol'); return h && !h.hidden && h.offsetWidth ? h.textContent.trim() : ''; })()}; };
async function setup(p) {
  const cdp = await p.context().newCDPSession(p);
  const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, id: 1}]});
  const tap = async (x, y, wait = 400) => { await touch('touchStart', x, y); await p.waitForTimeout(40); await touch('touchEnd', x, y); await p.waitForTimeout(wait); };
  const tapSel = async (s, wait) => { const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e || !e.offsetWidth) return null; const q = e.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; }, s); if (r) await tap(r[0], r[1], wait); return !!r; };
  const tapText = async (t, wait = 400) => { const r = await p.evaluate(t => { const bb = [...document.querySelectorAll('button')].find(x => x.offsetWidth && x.textContent.trim().startsWith(t)); if (!bb) return null; const q = bb.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; }, t); if (r) await tap(r[0], r[1], wait); return !!r; };
  return {tap, tapSel, tapText};
}
const selectBars = async (p, tap, bars) => {
  // tap each bar on the ruler; if a mark is chosen first (scene mark), tap again so the bar itself gets selected
  for (const bar of bars) {
    const i = await p.evaluate(() => window.SYNQUENZER.svLayoutInfo());
    const x = i.canvas.x + i.cellW * (bar + .5) - i.x0, y = i.canvas.y + Math.min(8, i.rulerH / 2);
    await tap(x, y);
    const s = await p.evaluate(() => window.SYNQUENZER.songSelect());
    if (!s || s.b < bar) await tap(x, y);
  }
};
const out = [];
const log = (k, v) => { out.push([k, v]); console.log(tag.padEnd(14), k.padEnd(26), JSON.stringify(v)); };

// ===== A: ⧉ Kopie, then ↶ =====
{
  const {b, p, errs} = await open({width: VP[0], height: VP[1]}, FILE, true);
  const {tap, tapSel, tapText} = await setup(p);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120); const K = {root: 9, scale: 'aeolian'};
    Q.setClip(0, 0, {len: 1, key: K, notes: [{t: 0, d: .4, n: 57, v: .8}]}); Q.setClip(0, 1, {len: 1, key: K, notes: [{t: 0, d: .4, n: 60, v: .8}]});
    Q.songFromChain([{scene: 0, bars: 1}, {scene: 1, bars: 1}]); Q.songView(true); });
  await p.waitForTimeout(500);
  log('A start', await p.evaluate(st));
  await selectBars(p, tap, [0, 1]);
  log('A selected', await p.evaluate(st));
  const cp = await tapSel('#rangeBar [data-a="copy"]');
  log('A after ⧉ Kopie (' + cp + ')', await p.evaluate(st));
  const un = await tapSel('#bUndo', 600);
  log('A after ↶ (' + un + ')', await p.evaluate(st));
  await p.screenshot({path: SHOT + tag + '-A-undo.png'});
  const del = await tapSel('#rangeBar [data-a="del"]');
  log('A after ✕ (' + del + ')', await p.evaluate(st));
  const pl = await tapSel('#rangeBar [data-a="play"]', 700);
  log('A after ▶ Ab hier (' + pl + ')', await p.evaluate(st));
  await p.evaluate(() => window.SYNQUENZER.stop()); await p.waitForTimeout(300);
  const sp = await tapSel('#songView .sv-play', 1500);
  log('A after ▶ SONG (' + sp + ')', await p.evaluate(st));
  await p.screenshot({path: SHOT + tag + '-A-play.png'});
  await tapSel('#songView .sv-play', 500);
  log('A after ■', await p.evaluate(st));
  log('A errs', errs);
  await b.close();
}
// ===== B: ≡ → Demo laden =====
{
  const {b, p, errs} = await open({width: VP[0], height: VP[1]}, FILE, true);
  const {tap, tapSel, tapText} = await setup(p);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120); const K = {root: 9, scale: 'aeolian'};
    Q.setClip(0, 0, {len: 1, key: K, notes: [{t: 0, d: .4, n: 57, v: .8}]}); Q.songFromChain([{scene: 0, bars: 4}]); Q.songView(true); });
  await p.waitForTimeout(500);
  await selectBars(p, tap, [1]);
  log('B selected', await p.evaluate(st));
  const m = await tapText('≡');
  const d1 = await tapText('Demo laden');
  const d2 = await tapText('Projekt ersetzen?') || false;
  await p.waitForTimeout(900);
  log('B after Demo (' + [m, d1, d2] + ')', await p.evaluate(st));
  await p.evaluate(() => { try { window.SYNQUENZER.closeMenu(); } catch (e) {} }); await p.waitForTimeout(400);
  await p.waitForTimeout(3000);
  log('B +3s', await p.evaluate(st));
  await p.screenshot({path: SHOT + tag + '-B-demo.png'});
  const pl = await tapSel('#rangeBar [data-a="play"]', 700);
  log('B after ▶ Ab hier (' + pl + ')', await p.evaluate(st));
  log('B errs', errs);
  await b.close();
}
