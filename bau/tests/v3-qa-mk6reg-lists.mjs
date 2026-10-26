// QA regression MK6: MS 2000 list popups (tap on a list knob) incl. the 15-entry DELAY NOTE list that now scrolls (.mklong);
// base 4.12.0 vs new 4.14.0 in P1 P3 L1 L2 W: popup in view, entries reachable, pick sets the value, one undo
import { chromium } from 'playwright';
import fs from 'fs';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const BASE = S + 'mk6-base-4.12.0.html', APP = S + 'mk-br-MK6/index.html', OUT = S + 'dirigent-test/v3-qa-mk6reg/lists/';
fs.mkdirSync(OUT, {recursive: true});
const VPS = [['P1', 390, 844], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375], ['W', 844, 1180]];
const CASES = [['dly.note', 2, 5, {'dly.sync': 1}, 14], ['scale', 2, 9, {}, 8], ['skey', 2, 9, {}, 11], ['t.0.o1.w', 1, null, {}, 6], ['t.0.p.0.d', 2, 0, {}, 7]];
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const res = {};
for (const [id, w, h] of VPS) for (const [name, file] of [['base', BASE], ['new', APP]]) {
  const ctx = await br.newContext({viewport: {width: w, height: h}, hasTouch: id !== 'W', isMobile: id !== 'W', deviceScaleFactor: 1});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await p.waitForTimeout(400);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.openEditor(); });
  await p.waitForTimeout(1200);
  for (const [path, wahl, pos0, pre, pickIdx] of CASES) {
    const k = id + ' ' + path;
    try {
      const kn = await p.evaluate(([path, wahl, pos0, pre]) => { const Q = window.SYNQUENZER, M = window.MKUI; for (const [a, v] of Object.entries(pre)) Q.mkSet(0, a, v);
        const n = wahl === 1 ? M.SEC1.length : M.SEC2.length;
        for (let pos = pos0 == null ? 0 : pos0; pos < (pos0 == null ? n : pos0 + 1); pos++) { M.setWahl(wahl, pos); const i = M.knobs().findIndex(d => d && d.p === path); if (i >= 0) return i; }
        return -1; }, [path, wahl, pos0, pre]);
      if (kn < 0) { (res[k] = res[k] || {})[name] = {fail: 'knob not found'}; continue; }
      await p.waitForTimeout(100);
      const box = await p.locator('.mkk[data-k="k' + kn + '"]').boundingBox();
      if (id === 'W') await p.mouse.click(box.x + box.width / 2, box.y + box.height / 2); else await p.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
      await p.waitForTimeout(400);
      const m = await p.evaluate(() => { const pop = [...document.querySelectorAll('.pop')].find(e => e.offsetParent); if (!pop) return null; const r = pop.getBoundingClientRect(), L = pop.querySelector('.plist');
        const lr = L.getBoundingClientRect(); const bs = [...L.querySelectorAll('button')];
        const items = bs.map(b => { const q = b.getBoundingClientRect(); return {t: b.textContent.trim().slice(0, 16), y: Math.round(q.top), h: Math.round(q.height), w: Math.round(q.width), vis: q.top >= Math.max(0, lr.top) - 1 && q.bottom <= Math.min(innerHeight, lr.bottom) + 1, on: b.classList.contains('on')}; });
        return {pop: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], inView: r.left >= -1 && r.top >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1, list: [Math.round(lr.top), Math.round(lr.height)], scroll: L.scrollHeight > L.clientHeight + 1, cls: L.className, n: items.length, nVis: items.filter(x => x.vis).length, onVis: (items.find(x => x.on) || {}).vis, small: items.filter(x => x.h < 44 || x.w < 44).map(x => x.t + ' ' + x.w + 'x' + x.h)}; });
      await p.screenshot({path: OUT + id + '-' + path + '-' + name + '.png'});
      let picked = null;
      if (m) {
        const loc = p.locator('.pop .plist button').nth(pickIdx);
        await loc.scrollIntoViewIfNeeded().catch(() => {});
        const bb = await loc.boundingBox();
        if (bb) { if (id === 'W') await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); else await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); }
        await p.waitForTimeout(300);
        picked = await p.evaluate(path => { const Q = window.SYNQUENZER; const m = Q.mkGet(0); const ks = path.split('.'); let x = m; for (const s of ks) x = x == null ? x : x[s]; return x; }, path);
        // undo once -> back to default
        await p.evaluate(() => { const Q = window.SYNQUENZER; Q.undo && Q.undo(); });
        await p.waitForTimeout(200);
        m.afterUndo = await p.evaluate(path => { const Q = window.SYNQUENZER; const m = Q.mkGet(0); const ks = path.split('.'); let x = m; for (const s of ks) x = x == null ? x : x[s]; return x; }, path);
        m.popOpen = await p.evaluate(() => !![...document.querySelectorAll('.pop')].find(e => e.offsetParent));
        if (m.popOpen) { await p.keyboard.press('Escape'); await p.waitForTimeout(200); }
      }
      (res[k] = res[k] || {})[name] = {m, picked};
    } catch (e) { (res[k] = res[k] || {})[name] = {fail: String(e).slice(0, 200)}; }
  }
  (res[id + ' errs'] = res[id + ' errs'] || {})[name] = errs.slice();
  await ctx.close();
}
for (const k of Object.keys(res)) { const {base: A, new: B} = res[k]; const same = JSON.stringify(A) === JSON.stringify(B);
  console.log(k, same ? 'same' : 'DIFF', JSON.stringify(B).slice(0, 700), same ? '' : '\n    base ' + JSON.stringify(A).slice(0, 700)); }
await br.close();
