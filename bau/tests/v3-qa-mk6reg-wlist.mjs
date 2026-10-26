// QA regression MK6: EDIT-WAHL 1/2 selection lists (tap on the selector) in all formats, base vs new (rows, in view, clipping)
import { chromium } from 'playwright';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/', OUT = S + 'dirigent-test/v3-qa-mk6reg/lists/';
const files = {base: S + 'mk6-base-4.12.0.html', new: S + 'mk-br-MK6/index.html'};
const VPS = [['P1', 390, 844], ['P2', 375, 667], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375], ['W', 844, 1180]];
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const res = {};
for (const [id, w, h] of VPS) for (const [name, file] of Object.entries(files)) {
  const ctx = await br.newContext({viewport: {width: w, height: h}}); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.openEditor(); }); await p.waitForTimeout(1200);
  for (const k of ['w1', 'w2']) {
    const el = p.locator('.mkx[data-k="' + k + '"]').first(); if (!(await el.count())) { (res[id + ' ' + k] = res[id + ' ' + k] || {})[name] = 'no ' + k; continue; }
    const bb = await el.boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(400);
    const m = await p.evaluate(() => { const pop = [...document.querySelectorAll('.pop')].find(e => e.offsetParent); if (!pop) return null; const r = pop.getBoundingClientRect(); const L = pop.querySelector('.plist');
      const rows = [...pop.querySelectorAll('.plist button')].map(b => { const q = b.getBoundingClientRect(); return [b.textContent.replace(/\s+/g, ' ').trim().slice(0, 40), Math.round(q.height), q.top >= -1 && q.bottom <= innerHeight + 1 && q.top >= L.getBoundingClientRect().top - 1 && q.bottom <= L.getBoundingClientRect().bottom + 1, b.scrollWidth > b.clientWidth + 1]; });
      return {pop: [r.left, r.top, r.width, r.height].map(Math.round), inView: r.left >= -1 && r.top >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1, n: rows.length, small: rows.filter(x => x[1] < 44).length, hidden: rows.filter(x => !x[2]).map(x => x[0].slice(0, 12)), clipped: rows.filter(x => x[3]).map(x => x[0].slice(0, 12)), last: rows[rows.length - 1] && rows[rows.length - 1][0]}; });
    await p.screenshot({path: OUT + 'wlist-' + id + '-' + k + '-' + name + '.png'});
    await p.keyboard.press('Escape'); await p.evaluate(() => { try { closePop(); } catch (e) {} }); await p.waitForTimeout(200);
    (res[id + ' ' + k] = res[id + ' ' + k] || {})[name] = m;
  }
  (res[id + ' errs'] = res[id + ' errs'] || {})[name] = errs;
  await ctx.close();
}
for (const k of Object.keys(res)) { const A = res[k].base, B = res[k].new, same = JSON.stringify(A) === JSON.stringify(B); console.log(k, same ? 'same' : 'DIFF', JSON.stringify(B).slice(0, 400), same ? '' : '\n   base ' + JSON.stringify(A).slice(0, 400)); }
await br.close();
