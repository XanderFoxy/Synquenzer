// VQ1-Sonde: Video-Blatt öffnen (≡-Menü → Video per Finger), Rechtecke aller Tasten vor/nach „Video erstellen“ (per Finger)
// Aufruf: node probe.mjs <index.html> <out-ordner> [p,q,q2]
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs'; import path from 'path';
const [fileArg, outArg, which] = process.argv.slice(2);
const FILE = path.resolve(fileArg), OUT = path.resolve(outArg || '.'); fs.mkdirSync(OUT, {recursive: true});
const VP = {p: [428, 926], q: [926, 428], q2: [926, 370]};
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch();
const all = {};
for (const vk of (which || 'p,q,q2').split(',')) {
  const [w, h] = VP[vk];
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 90000}); await sleep(900);
  const cdp = await ctx.newCDPSession(p);
  const tap = async (x, y) => { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id: 1}]}); await sleep(60); await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await sleep(250); };
  await p.evaluate(() => { SYNQUENZER.loadDemo(); SYNQUENZER.songFromChain([{scene: 0, bars: 1}, {scene: 1, bars: 1}]); }); await sleep(300);
  // ≡-Menü → Video (per Finger)
  await p.evaluate(() => openMenu()); await sleep(500);
  const mv = await p.evaluate(() => { const e = document.querySelector('#menu button[aria-label="Video des Songs erstellen"]'); if (!e) return null; e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
  if (mv) await tap(mv.x, mv.y); else await p.evaluate(() => vvOpen());
  await sleep(800);
  const M = () => p.evaluate(() => {
    const R = e => { if (!e || !e.getClientRects().length) return null; const r = e.getBoundingClientRect(); return {t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right), h: Math.round(r.height), w: Math.round(r.width)}; };
    const sh = document.querySelector('#vvSheet'), ctl = sh.querySelector('.vvctl'), cr = ctl.getBoundingClientRect();
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
    const bs = [...sh.querySelectorAll('button')].filter(vis).map(x => {
      const r = x.getBoundingClientRect();
      // sichtbarer Teil: Viewport ∩ (Spalte, falls darin)
      let t = Math.max(r.top, 0), bt = Math.min(r.bottom, innerHeight), l = Math.max(r.left, 0), rr = Math.min(r.right, innerWidth);
      if (ctl.contains(x)) { t = Math.max(t, cr.top); bt = Math.min(bt, cr.bottom); }
      const vh = Math.max(0, Math.round(bt - t)), vw = Math.max(0, Math.round(rr - l));
      const e = vh > 0 ? document.elementFromPoint((l + rr) / 2, (t + bt) / 2) : null;
      return {n: (x.textContent || x.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 22), t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height), vh, vw, hit: !!(e && (e === x || x.contains(e)))};
    });
    // Überlappung sichtbarer Tasten untereinander
    const ov = []; for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) { const a = bs[i], c = bs[j]; if (a.l < c.l + c.w - .5 && a.l + a.w > c.l + .5 && a.t < c.b - .5 && a.b > c.t + .5 && a.vh && c.vh) ov.push(a.n + '×' + c.n); }
    return {stage: R(sh.querySelector('.vvstage')), cv: R(sh.querySelector('.vvcv')), video: R(sh.querySelector('.vid5-v')), ctl: R(ctl), sH: ctl.scrollHeight, cH: ctl.clientHeight, sT: ctl.scrollTop, bs, ov, has: sh.classList.contains('has'),
      kids: [...ctl.children].map(c => [c.className.slice(0, 18), R(c)]), body: [...sh.querySelector('.vvb').children].map(c => [c.className.slice(0, 18), R(c)])};
  });
  const A = await M();
  await p.screenshot({path: `${OUT}/vq-${vk}-vor.png`});
  // [Video erstellen] per Finger (ohne Rollen: nur wenn ganz sichtbar; sonst Mitte des sichtbaren Teils)
  const mk = A.bs.find(x => x.n === 'Video erstellen');
  if (mk && mk.vh) { const ctlTop = A.ctl ? A.ctl.t : 0; const y0 = Math.max(mk.t, vk === 'p' ? 0 : ctlTop), y1 = Math.min(mk.b, A.ctl && vk !== 'p' ? A.ctl.b : h); await tap(mk.l + mk.w / 2, (y0 + y1) / 2); }
  await p.waitForFunction(() => VV.busy, null, {timeout: 5000}).catch(() => {});
  await p.waitForFunction(() => !VV.busy && VV.res && VV.res.blob, null, {timeout: 120000}).catch(() => {});
  await sleep(900);
  const Z = await M();
  await p.screenshot({path: `${OUT}/vq-${vk}-nach.png`});
  all[vk] = {A, Z, errs: errs.slice(0, 3), menu: !!mv, res: await p.evaluate(() => !!(VV.res && VV.res.blob))};
  const S = x => x.bs.map(q => `${q.n}[${q.t}-${q.b} h${q.h} sicht${q.vh}${q.hit ? '' : ' VERDECKT'}]`).join(' ');
  console.log(`== ${vk} menü=${!!mv} video=${all[vk].res} errs=${JSON.stringify(errs.slice(0, 2))}`);
  for (const [k, x] of [['vor', A], ['nach', Z]]) console.log(`  ${k}: Bühne h${x.stage && x.stage.h} Bild h${x.cv && x.cv.h} Video ${x.video ? 'h' + x.video.h : '-'} Spalte ${x.ctl && x.ctl.t}-${x.ctl && x.ctl.b} scroll ${x.sH}/${x.cH} ov=${JSON.stringify(x.ov)}\n    ${S(x)}`);
  await ctx.close();
}
fs.writeFileSync(`${OUT}/probe.json`, JSON.stringify(all, null, 1));
await b.close();
