// QA regression MK6: MS 2000 panel, every EDIT-WAHL 1/2 position (and SHIFT level), base 4.12.0 vs new 4.14.0, pixel diff + overlap/clip
import { chromium } from 'playwright';
import fs from 'fs';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const BASE = S + 'mk6-base-4.12.0.html', APP = S + 'mk-br-MK7/index.html', OUT = S + 'dirigent-test/v3-qa-mk7reg/panelvoc/';
fs.mkdirSync(OUT, {recursive: true});
const VPS = (process.env.VPS || 'P1:390:844,P3:320:568,L1:844:390,L2:667:375,W:844:1180').split(',').map(s => s.split(':')).map(([a, b, c]) => [a, +b, +c]);
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const measure = () => {
  const root = document.querySelector('.mkp, #mkPanel, .mk-panel') || document.body;
  const vw = innerWidth, vh = innerHeight, bad = [], vis = [];
  for (const e of document.querySelectorAll('button, .mkx, canvas, .lcd, [role=button]')) {
    const cs = getComputedStyle(e); if (cs.visibility !== 'visible' || cs.display === 'none') continue;
    const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
    let p = e, hid = false; while (p) { const c = getComputedStyle(p); if (c.display === 'none' || +c.opacity === 0) { hid = true; break; } p = p.parentElement; } if (hid) continue;
    const cx = Math.min(vw - 1, Math.max(0, r.left + r.width / 2)), cy = Math.min(vh - 1, Math.max(0, r.top + r.height / 2));
    const top = document.elementFromPoint(cx, cy); const covered = !!(top && !e.contains(top) && !top.contains(e));
    if (covered) continue;
    const key = (e.id ? '#' + e.id : e.tagName + '.' + [...e.classList].join('.')) + (e.dataset && e.dataset.k ? '[' + e.dataset.k + ']' : '') + '|' + (e.textContent || '').trim().slice(0, 14).replace(/\s+/g, ' ');
    if (r.left < -1 || r.top < -1 || r.right > vw + 1 || r.bottom > vh + 1) bad.push('off ' + key);
    vis.push([key, r, e]);
  }
  const ov = [];
  for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++) {
    const [ka, a, ea] = vis[i], [kb, b, eb] = vis[j];
    if (ea.contains(eb) || eb.contains(ea)) continue;
    const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left), iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    if (ix > 2 && iy > 2) ov.push(ka + ' X ' + kb);
  }
  return {bad, ov, docW: document.documentElement.scrollWidth, docH: document.documentElement.scrollHeight, lcd: (document.querySelector('.mk-lcd, .mklcd, [class*=lcd]') || {}).textContent};
};
const res = {};
for (const [id, w, h] of VPS) for (const [name, file] of [['base', APP], ['new', APP]]) {
  const ctx = await br.newContext({viewport: {width: w, height: h}, hasTouch: id !== 'W', isMobile: id !== 'W', deviceScaleFactor: 1});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  if (name === 'new') await p.addInitScript(() => { window.__voc = 1; }); await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await p.waitForTimeout(500);
  await p.evaluate(async () => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setEngine(0, 'mk'); if (window.__voc) { const s = Q.getSound(0); s.p.mk.mode = 3; applySound(0, s); } Q.selectTrack(0); Q.openEditor(); });
  await p.waitForTimeout(1200);
  const n = await p.evaluate(() => [window.MKUI.SEC1.length, window.MKUI.SEC2.length]);
  for (const [wahl, cnt] of [[1, n[0]], [2, n[1]]]) for (let pos = 0; pos < cnt; pos++) for (const sh of [0, 1]) {
    const k = id + '-w' + wahl + '-' + pos + (sh ? '-sh' : '');
    try {
      await p.evaluate(([wahl, pos, sh]) => { const M = window.MKUI; M.setWahl(wahl, pos); if (sh) { M.P.shift = 1; M.render(); } }, [wahl, pos, sh]);
      await p.waitForTimeout(120);
      const m = await p.evaluate(measure);
      m.knobs = await p.evaluate(() => window.MKUI.knobs().map(d => d ? d.l : '-').join(','));
      const buf = await p.screenshot();
      fs.writeFileSync(OUT + k + '-' + name + '.png', buf);
      m.png = buf.toString('base64');
      (res[k] = res[k] || {})[name] = m;
    } catch (e) { (res[k] = res[k] || {})[name] = {fail: String(e)}; }
  }
  (res[id + '-errs'] = res[id + '-errs'] || {})[name] = errs.slice();
  await ctx.close();
}
// pixel diff in a blank page
const ctx = await br.newContext(); const dp = await ctx.newPage();
const diff = (a, b) => dp.evaluate(async ([a, b]) => {
  const ld = async s => { const im = await createImageBitmap(await (await fetch('data:image/png;base64,' + s)).blob()); const c = new OffscreenCanvas(im.width, im.height); const g = c.getContext('2d'); g.drawImage(im, 0, 0); return g.getImageData(0, 0, im.width, im.height); };
  const A = await ld(a), B = await ld(b); if (A.width !== B.width || A.height !== B.height) return {size: true};
  let n = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let i = 0; i < A.data.length; i += 4) { if (Math.abs(A.data[i] - B.data[i]) + Math.abs(A.data[i + 1] - B.data[i + 1]) + Math.abs(A.data[i + 2] - B.data[i + 2]) > 30) { n++; const px = (i / 4) % A.width, py = Math.floor(i / 4 / A.width); x0 = Math.min(x0, px); y0 = Math.min(y0, py); x1 = Math.max(x1, px); y1 = Math.max(y1, py); } }
  return {n, box: n ? [x0, y0, x1, y1] : null};
}, [a, b]);
for (const k of Object.keys(res)) {
  if (k.endsWith('-errs')) { console.log(k, JSON.stringify(res[k])); continue; }
  const {base: A, new: B} = res[k];
  if (!A || !B || A.fail || B.fail) { console.log(k, 'FAIL', A && A.fail, B && B.fail); continue; }
  const d = await diff(A.png, B.png);
  const newOv = B.ov.filter(o => !A.ov.includes(o)), newBad = B.bad.filter(o => !A.bad.includes(o));
  const flag = d.n || newOv.length || newBad.length || A.knobs !== B.knobs || A.docW !== B.docW || A.docH !== B.docH;
  console.log(k, flag ? 'DIFF' : 'same', 'px', d.n, d.box ? JSON.stringify(d.box) : '', A.knobs === B.knobs ? '' : 'knobs ' + A.knobs + ' -> ' + B.knobs, newOv.length ? 'newOv ' + JSON.stringify(newOv.slice(0, 6)) : '', newBad.length ? 'newBad ' + JSON.stringify(newBad.slice(0, 6)) : '', B.docW + 'x' + B.docH, B.ov.length ? 'ovN ' + B.ov.length : '');
}
await br.close();
