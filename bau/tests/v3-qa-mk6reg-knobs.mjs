// QA regression MK6: MS 2000 knob gestures (drag, fine, list knob drag), undo per gesture, SHIFT 1/2/4 tools, ⋯ menu,
// SPIEL wheels; base 4.12.0 vs new 4.14.0 (P1 + L1); same gestures must give the same values
import { chromium } from 'playwright';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const BASE = S + 'mk6-base-4.12.0.html', APP = S + 'mk-br-MK6/index.html';
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const res = {};
const getP = (p, path) => p.evaluate(path => { const m = window.SYNQUENZER.mkGet(0); let x = m; for (const s of path.split('.')) x = x == null ? x : x[s]; return x; }, path);
for (const [id, w, h] of [['P1', 390, 844], ['L1', 844, 390]]) for (const [name, file] of [['base', BASE], ['new', APP]]) {
  const ctx = await br.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 1});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await p.waitForTimeout(400);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.openEditor(); });
  await p.waitForTimeout(1300);
  const r = {};
  const drag = async (path, wahl, dy, steps = 12, dx = 0) => {
    const kn = await p.evaluate(([path, wahl]) => { const M = window.MKUI; const n = wahl === 1 ? M.SEC1.length : M.SEC2.length;
      for (let pos = 0; pos < n; pos++) { M.setWahl(wahl, pos); const i = M.knobs().findIndex(d => d && d.p === path); if (i >= 0) return i; } return -1; }, [path, wahl]);
    if (kn < 0) return 'no knob';
    await p.waitForTimeout(80);
    const bb = await p.locator('.mkk[data-k="k' + kn + '"]').boundingBox();
    const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
    const v0 = await getP(p, path), u0 = await p.evaluate(() => (window.SYNQUENZER.undoInfo ? JSON.stringify(window.SYNQUENZER.undoInfo()) : null));
    await p.mouse.move(x, y); await p.mouse.down();
    for (let k = 1; k <= steps; k++) { await p.mouse.move(x + dx * k / steps, y + dy * k / steps); await p.waitForTimeout(16); }
    await p.mouse.up(); await p.waitForTimeout(150);
    const v1 = await getP(p, path);
    const lcd = await p.evaluate(() => { const e = document.querySelector('.mkbody .lcd, .mklcd, .mkx.mlcd'); return e ? e.textContent.trim().slice(0, 60) : null; });
    await p.evaluate(() => window.SYNQUENZER.undo()); await p.waitForTimeout(150);
    const v2 = await getP(p, path);
    await p.evaluate(() => window.SYNQUENZER.redo && window.SYNQUENZER.redo()); await p.waitForTimeout(100);
    const v3 = await getP(p, path);
    await p.evaluate(() => window.SYNQUENZER.undo()); await p.waitForTimeout(100);
    return {v0, v1, v2, v3, lcd};
  };
  r.cut = await drag('t.0.f.cut', 1, 60);
  r.res = await drag('t.0.f.res', 1, -80);
  r.e2a = await drag('t.0.e2.a', 1, -40, 20);
  r.cutFine = await drag('t.0.f.cut', 1, -40, 12, 120);
  r.o1w = await drag('t.0.o1.w', 1, -50);
  r.l1f = await drag('t.0.l1.f', 1, -100);
  r.pi0 = await drag('t.0.p.0.i', 2, -70);
  r.mfxDep = await drag('mfx.dep', 2, -90);
  r.dlyNote = await p.evaluate(() => window.SYNQUENZER.mkSet(0, 'dly.sync', 1)) || await drag('dly.note', 2, -60);
  r.skey = await drag('skey', 2, -60);
  // SHIFT tools via the number keys (DOM): SHIFT then 2 (T-TAUSCH) and 4 (T-NEU) after switching to dual, with undo
  r.shift = await p.evaluate(async () => { const Q = window.SYNQUENZER, M = window.MKUI; const sl = ms => new Promise(r => setTimeout(r, ms)); Q.mkSet(0, 'mode', 1); Q.mkSet(0, 't.0.f.cut', 33); Q.mkSet(0, 't.1.f.cut', 99); M.render(); await sl(100);
    const before = [Q.mkGet(0).t[0].f.cut, Q.mkGet(0).t[1].f.cut];
    M.timSwap(); await sl(100); const sw = [Q.mkGet(0).t[0].f.cut, Q.mkGet(0).t[1].f.cut]; Q.undo(); await sl(100); const un = [Q.mkGet(0).t[0].f.cut, Q.mkGet(0).t[1].f.cut];
    M.timInit(); await sl(100); const ini = [Q.mkGet(0).t[0].f.cut, Q.mkGet(0).t[1].f.cut]; Q.undo(); await sl(100); const un2 = [Q.mkGet(0).t[0].f.cut, Q.mkGet(0).t[1].f.cut];
    return {before, sw, un, ini, un2}; });
  // ⋯ menu entries for the MK track and a VA track
  r.more = await p.evaluate(async () => { const sl = ms => new Promise(r => setTimeout(r, ms)); const b = [...document.querySelectorAll('.edm, button')].find(x => x.textContent.trim() === '⋯' && x.offsetParent); if (!b) return 'no ⋯';
    b.click(); await sl(400); const pop = [...document.querySelectorAll('.pop')].find(e => e.offsetParent); const t = pop ? [...pop.querySelectorAll('button')].map(x => x.textContent.trim().slice(0, 30)) : null; document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'})); await sl(200); return t; });
  r.errs = errs.slice();
  res[id + '-' + name] = r; await ctx.close();
}
for (const id of ['P1', 'L1']) { const A = res[id + '-base'], B = res[id + '-new'];
  for (const k of Object.keys(B)) { const same = JSON.stringify(A[k]) === JSON.stringify(B[k]); console.log(id, k, same ? 'same' : 'DIFF', JSON.stringify(B[k]).slice(0, 500), same ? '' : '\n     base ' + JSON.stringify(A[k]).slice(0, 500)); } }
await br.close();
