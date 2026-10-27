// QA MK8b-06 layout: chips/tabs hit areas, text clipping (incl. ellipsis), finger scroll of chip row/column, vocoder hint,
// place pop, layout jump across Micro on/off + tabs + ⋯ + pop
import {launch, open, tapSel, swipe, mkOk, sleep, DIR, FMT} from './gmk8b-h.mjs';
const {ok, fails} = mkOk();
const br = await launch(false);
const measure = page => page.evaluate(() => {
  const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden'; };
  const hitBox = b => { const q = b.getBoundingClientRect(), cx = q.left + q.width / 2, cy = q.top + q.height / 2;
    const hit = (x, y) => { const e = document.elementFromPoint(x, y); return e && (e === b || b.contains(e)); };
    const ext = (dx, dy) => { let n = 0; for (let k = 1; k <= 80; k++) { if (!hit(cx + dx * k * .5, cy + dy * k * .5)) break; n = k * .5; } return n; };
    return [ext(-1, 0) + ext(1, 0) + .5, ext(0, -1) + ext(0, 1) + .5]; };
  const sh = document.querySelector('#sndSheet'), cats = sh.querySelector('.brcats'), cr = cats.getBoundingClientRect();
  const chips = [];
  for (const c of cats.querySelectorAll('.chip')) { if (!vis(c)) continue; const r = c.getBoundingClientRect(); const inView = r.left >= cr.left - .5 && r.right <= cr.right + .5 && r.top >= cr.top - .5 && r.bottom <= cr.bottom + .5;
    const sp = [...c.querySelectorAll('span')].filter(vis); const clip = sp.some(s => s.scrollWidth > s.clientWidth + 1) || c.scrollWidth > c.clientWidth + 1;
    const hb = inView ? hitBox(c) : null;
    chips.push({t: sp.map(s => s.textContent).join('/') || c.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height), hit: hb && hb.map(x => Math.round(x)), clip, inView, kp: c.classList.contains('brkp') || c.classList.contains('brkg')}); }
  const list = sh.querySelector('.brlist'), lr = list.getBoundingClientRect();
  const ell = [];
  for (const t of list.querySelectorAll('.brow .bmain b, .brow .bmain span, .brow .bmain small')) { const r = t.getBoundingClientRect(); if (r.bottom < lr.top || r.top > lr.bottom || !vis(t)) continue; if (t.scrollWidth > t.clientWidth + 1) ell.push(t.textContent.trim()); }
  const v = list.querySelector('.mkkvoc'); const voc = v && {clip: v.scrollWidth > v.clientWidth + 1 || v.scrollHeight > v.clientHeight + 1, h: Math.round(v.getBoundingClientRect().height)};
  const shr = sh.getBoundingClientRect();
  return {chips, ell, voc, docH: document.documentElement.scrollHeight, docW: document.documentElement.scrollWidth, bodyH: document.body.scrollHeight, sheet: [shr.top, shr.height, shr.width].map(Math.round), list: [lr.top, lr.height].map(Math.round), cats: [cr.top, cr.left, cr.width, cr.height].map(Math.round), vw: innerWidth, vh: innerHeight, sx: scrollX, sy: scrollY};
});
for (const fmt of (process.env.FMTS || Object.keys(FMT).join(',')).split(',')) {
  const {ctx, page, errs} = await open(br, {fmt});
  await page.evaluate(async () => { await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); mkLoad(); await MKK.decodeAll(); });
  await page.evaluate(() => SYNQUENZER.openBrowser(0)); await sleep(400);
  const m0 = await measure(page);
  await tapSel(page, '#sndSheet .brkp'); await sleep(200);
  const all = []; const jumps = []; const small = new Set(), clip = new Set(), ell = new Set();
  for (let g = 1; g <= 8; g++) {
    // the tab may be scrolled out: bring it into view by scrollIntoView (simulates finger scroll)
    await tapSel(page, `#sndSheet .brkg[data-g="${g}"]`);
    const m = await measure(page); all.push(m);
    for (const c of m.chips) { if (c.kp && c.hit && (c.hit[0] < 44 || c.hit[1] < 44)) small.add(c.t + ' ' + c.hit.join('×')); if (c.clip) clip.add(c.t); }
    for (const e of m.ell) ell.add(e);
    if (m.docH !== m0.docH || m.docW !== m0.docW || m.sheet.join() !== m0.sheet.join() || m.sx || m.sy) jumps.push('G' + g + ' ' + JSON.stringify([m.docH, m.docW, m.sheet, m.sx, m.sy]));
    if (g === 8) { await page.screenshot({path: DIR + '/lay-' + fmt + '-voc.png'}); ok(fmt + ' vocoder hint not clipped', m.voc && !m.voc.clip, JSON.stringify(m.voc)); }
  }
  ok(fmt + ' Micro chip + genre tabs hit area ≥ 44×44', small.size === 0, [...small].join('; '));
  ok(fmt + ' no clipped chip labels', clip.size === 0, [...clip].join('; '));
  ok(fmt + ' no truncated (ellipsis) row texts', ell.size === 0, [...ell].slice(0, 12).join(' | '));
  ok(fmt + ' 0 px layout jump over Micro + 8 tabs', jumps.length === 0, jumps.slice(0, 3).join(' ') || 'doc ' + m0.docW + '×' + m0.docH + ' sheet ' + m0.sheet);
  // finger scroll of the chip row/column
  const land = fmt[0] !== 'P';
  const c0 = await page.evaluate(() => { const c = document.querySelector('#sndSheet .brcats'); c.scrollLeft = 0; c.scrollTop = 0; const r = c.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height, sw: c.scrollWidth, sh: c.scrollHeight}; });
  const o0 = await page.evaluate(() => ({o: S.tracks[0].sound.origin, kp: BR.kp}));
  if (!land) await swipe(page, c0.x + c0.w * .85, c0.y + c0.h / 2, c0.x + c0.w * .2, c0.y + c0.h / 2);
  else await swipe(page, c0.x + c0.w / 2, c0.y + c0.h * .85, c0.x + c0.w / 2, c0.y + c0.h * .2);
  const c1 = await page.evaluate(() => { const c = document.querySelector('#sndSheet .brcats'); return {sl: c.scrollLeft, st: c.scrollTop, o: S.tracks[0].sound.origin, kp: BR.kp}; });
  const can = land ? c0.sh > c0.h + 2 : c0.sw > c0.w + 2;
  ok(fmt + ' chip ' + (land ? 'column' : 'row') + ' scrolls by finger, no tap side effect', !can || ((land ? c1.st : c1.sl) > 20 && c1.o === o0.o && c1.kp === o0.kp), JSON.stringify({can, c0, c1}));
  // list finger scroll in genre 8
  const lr = await page.evaluate(() => { const l = document.querySelector('#sndSheet .brlist'); l.scrollTop = 0; const r = l.getBoundingClientRect(); return {x: r.left + r.width * .45, y0: r.top + r.height * .8, y1: r.top + r.height * .15}; });
  await swipe(page, lr.x, lr.y0, lr.x, lr.y1);
  const ls = await page.evaluate(() => ({st: document.querySelector('#sndSheet .brlist').scrollTop, pv: PV.on, o: S.tracks[0].sound.origin}));
  ok(fmt + ' list scrolls by finger without load/preview', ls.st > 30 && !ls.pv && ls.o === o0.o, JSON.stringify(ls));
  // ⋯ + place pop jump and pop fit
  await page.evaluate(() => { document.querySelector('#sndSheet .brlist').scrollTop = 0; });
  await tapSel(page, '#sndSheet .brow[data-id="f-mk-k816"] .bmore, #sndSheet .brow .bmore');
  const ma = await measure(page);
  await tapSel(page, '#sndSheet .bacts [data-act="kpw"]'); await sleep(300);
  const pp = await page.evaluate(() => { const p = document.querySelector('.pop.mk8w'); if (!p) return {err: 'no pop'}; const r = p.getBoundingClientRect(); const bad = [];
    if (r.left < 0 || r.top < 0 || r.right > innerWidth + .5 || r.bottom > innerHeight + .5) bad.push('pop outside ' + [r.left, r.top, r.right, r.bottom].map(Math.round));
    for (const b of p.querySelectorAll('button, input')) { const q = b.getBoundingClientRect(); if (q.height < 43.5 || q.width < 43.5) bad.push('small ' + (b.textContent || b.value).trim() + ' ' + Math.round(q.width) + '×' + Math.round(q.height)); if (b.scrollWidth > b.clientWidth + 1) bad.push('clip ' + b.textContent.trim());
      if (q.bottom > r.bottom + .5 || q.right > r.right + .5) bad.push('outside pop ' + b.textContent.trim()); }
    const inf = p.querySelector('.mk8i'); if (inf.scrollWidth > inf.clientWidth + 1) bad.push('info clipped');
    return {bad, rect: [r.left, r.top, r.width, r.height].map(Math.round), docH: document.documentElement.scrollHeight, sy: scrollY}; });
  await page.screenshot({path: DIR + '/lay-' + fmt + '-pop.png'});
  ok(fmt + ' place pop fits, all ≥ 44 px', pp.bad && pp.bad.length === 0, JSON.stringify(pp));
  ok(fmt + ' 0 px jump ⋯ + pop', ma.docH === m0.docH && pp.docH === m0.docH && !pp.sy, JSON.stringify([m0.docH, ma.docH, pp.docH, pp.sy]));
  await page.evaluate(() => closePop()); await sleep(100);
  // Micro off again
  await page.evaluate(() => { const c = document.querySelector('#sndSheet .brkp'); c.scrollIntoView({block: 'nearest', inline: 'nearest'}); });
  await tapSel(page, '#sndSheet .brkp');
  const off = await page.evaluate(() => ({kp: BR.kp, rows: document.querySelectorAll('#sndSheet .brow').length}));
  const mOff = await measure(page);
  ok(fmt + ' Micro off → role list, no jump', !off.kp && mOff.docH === m0.docH && mOff.sheet.join() === m0.sheet.join(), JSON.stringify([off, mOff.docH, mOff.sheet]));
  console.log('   chips ' + fmt + ': ' + all[0].chips.filter(c => c.kp).map(c => c.t + ' ' + c.w + '×' + c.h + (c.hit ? ' hit ' + c.hit.join('×') : '')).join(' | '));
  ok(fmt + ' console', errs.length === 0, errs.slice(0, 3).join(' | '));
  await ctx.close();
}
await br.close();
console.log(fails() ? 'FAIL ' + fails() : 'ALL PASS');
