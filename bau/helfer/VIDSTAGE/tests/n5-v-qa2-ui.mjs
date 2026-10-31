// QA VV2-05 by real taps: header tap → Marken-Blatt row „Video“, [Matrix]; range ⋯ → Video [Spur …] → list; cell sheet „Im Video zeigen“
import { open } from './n5-v-lib.mjs';
import fs from 'fs';
const SONG16 = {bars: 16, lanes: [[{bar: 0, slot: 0}, {bar: 8, slot: 1}], [{bar: 0, slot: 0}], [{bar: 2, slot: 0}, {bar: 14, slot: -1}], [], [{bar: 0, slot: 0}, {bar: 8, slot: 1}], []],
  carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 8, name: 'Strophe'}, {id: 'm2', a: 8, len: 8, name: 'Refrain'}]};
const SZ = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [926, 428]};
const sizes = (process.argv[2] || 'P1,P2,P3,L1,L2,W').split(',');
const OUT = '/home/user/Synquenzer/bau/helfer/VIDSTAGE/tests/out/n5-v-qa2-out/';
const meas = (p, sel) => p.evaluate(sel => {
  const out = {n: 0, small: [], out: [], clip: [], hit: [], txt: []};
  for (const e of document.querySelectorAll(sel)) {
    if (!e.getClientRects().length) continue;
    out.n++; const q = e.getBoundingClientRect(), nm = (e.textContent || '').trim().slice(0, 20); out.txt.push(nm + ' ' + q.width.toFixed(1) + 'x' + q.height.toFixed(1));
    if (q.width < 43.5 || q.height < 43.5) out.small.push(nm + ' ' + q.width.toFixed(1) + 'x' + q.height.toFixed(1));
    if (q.left < -.5 || q.top < -.5 || q.right > innerWidth + .5 || q.bottom > innerHeight + .5) out.out.push(nm + ' ' + [q.left, q.top, q.right, q.bottom].map(Math.round));
    if (e.scrollWidth > e.clientWidth + 1) out.clip.push(nm + ' sw ' + e.scrollWidth + '>' + e.clientWidth);
    // text content wider than the box (overflow hidden): measure with a range
    const rg = document.createRange(); rg.selectNodeContents(e); const tr = rg.getBoundingClientRect(); const cs = getComputedStyle(e);
    const inner = q.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth);
    if (tr.width > inner + 1) out.clip.push(nm + ' text ' + tr.width.toFixed(1) + '>' + inner.toFixed(1));
    // hit test: centre and a 44×44 square around the centre (inside the box)
    const cx = q.left + q.width / 2, cy = q.top + q.height / 2;
    for (const [dx, dy] of [[0, 0], [-21, -21], [21, -21], [-21, 21], [21, 21]]) { const h = document.elementFromPoint(cx + dx, cy + dy); if (!h || (h !== e && !e.contains(h))) out.hit.push(nm + ' @' + dx + ',' + dy + ' → ' + (h ? h.tagName + '.' + h.className : 'null')); }
  }
  const lab = document.querySelector('.pop .vvdl, .msheet .vvdl'); if (lab && lab.getClientRects().length) { const rg = document.createRange(); rg.selectNodeContents(lab); const w = rg.getBoundingClientRect().width; if (w > lab.getBoundingClientRect().width + .5) out.clip.push('label Video ' + w.toFixed(1) + '>' + lab.getBoundingClientRect().width.toFixed(1)); }
  const pop = document.querySelector('.pop'); if (pop) { const q = pop.getBoundingClientRect(); out.pop = [q.left, q.top, q.right, q.bottom].map(Math.round); out.popScroll = pop.scrollHeight > pop.clientHeight + 1 ? pop.scrollHeight + '>' + pop.clientHeight : null; if (q.bottom > innerHeight + .5 || q.top < -.5 || q.right > innerWidth + .5 || q.left < -.5) out.out.push('pop ' + out.pop); }
  out.docH = document.documentElement.scrollHeight; out.scrollY = scrollY;
  return out;
}, sel);
const res = {};
for (const n of sizes) {
  const [w, h] = SZ[n], r = {};
  const {b, p, errs} = await open({w, h, touch: true, dpr: 3});
  await p.evaluate(s => { SYNQUENZER.setSong(s); setSongView(true); }, SONG16); await p.waitForTimeout(500);
  await p.waitForTimeout(300); const L0 = await p.evaluate(() => { UI.dirty.song = true; return svLayoutInfo(); });
  r.docH0 = await p.evaluate(() => document.documentElement.scrollHeight);
  const mk = L0.marks.find(m => m.label && /Strophe/i.test(m.label)) || {x0: 2, x1: 200, none: true};
  // tap the yellow header of „Refrain“
  const tx = L0.canvas.x + Math.max(0, mk.x0) + 24, ty = L0.canvas.y + 10;
  await p.touchscreen.tap(tx, ty); await p.waitForTimeout(400);
  r.sheetOpen = await p.evaluate(() => !!document.querySelector('.msheet .vvdr'));
  if (!r.sheetOpen) { r.hdrTap = {tx, ty, mk, L0m: L0.marks}; }
  r.marke = await meas(p, '.msheet .vvdr button');
  r.markeAll = await meas(p, '.msheet button');
  await p.screenshot({path: OUT + `ui-${n}-marke.png`});
  // tap [Matrix] by its centre
  const bm = await p.evaluate(() => { const e = document.querySelector('.msheet .vvdr button[data-a="vv-matrix"]'); if (!e) return null; const q = e.getBoundingClientRect(); return [q.left + q.width / 2, q.top + q.height / 2]; });
  if (bm) { await p.touchscreen.tap(bm[0], bm[1]); await p.waitForTimeout(400); }
  r.afterMatrix = await p.evaluate(() => ({dir: SYNQUENZER.vvDirGet(), on: !!document.querySelector('.msheet .vvdr button.on[data-a="vv-matrix"]'), still: !!document.querySelector('.msheet')}));
  r.marke2 = await meas(p, '.msheet .vvdr button');
  await p.evaluate(() => closePop()); await p.waitForTimeout(300);
  const L1 = await p.evaluate(() => svLayoutInfo());
  r.rows = {before: {rulerH: L0.rulerH, rowH: L0.rowH, rows: L0.rows.length}, after: {rulerH: L1.rulerH, rowH: L1.rowH, rows: L1.rows.length}};
  r.docH1 = await p.evaluate(() => document.documentElement.scrollHeight);
  await p.screenshot({path: OUT + `ui-${n}-streifen.png`});
  // range bars 9–12 → ⋯
  await p.evaluate(() => SYNQUENZER.songSelect(8, 11)); await p.waitForTimeout(300);
  const more = await p.evaluate(() => { const e = document.querySelector('#rangeBar button[data-a="more"]'); if (!e) return null; const q = e.getBoundingClientRect(); return [q.left + q.width / 2, q.top + q.height / 2]; });
  if (more) { await p.touchscreen.tap(more[0], more[1]); await p.waitForTimeout(400); }
  r.bereich = await meas(p, '.pop .vvdr button');
  await p.screenshot({path: OUT + `ui-${n}-bereich.png`});
  const sp = await p.evaluate(() => { const e = document.querySelector('.pop .vvdr button[data-a="vv-spur"]'); if (!e) return null; const q = e.getBoundingClientRect(); return [q.left + q.width / 2, q.top + q.height / 2]; });
  if (sp) { await p.touchscreen.tap(sp[0], sp[1]); await p.waitForTimeout(400); }
  r.spurListe = await meas(p, '.pop button[data-t]');
  await p.screenshot({path: OUT + `ui-${n}-spurliste.png`});
  const t3 = await p.evaluate(() => { const e = document.querySelector('.pop button[data-t="2"]'); if (!e) return null; const q = e.getBoundingClientRect(); return [q.left + q.width / 2, q.top + q.height / 2]; });
  if (t3) { await p.touchscreen.tap(t3[0], t3[1]); await p.waitForTimeout(400); }
  r.afterSpur = await p.evaluate(() => SYNQUENZER.vvDirGet());
  // the ⋯ sheet again: does [Spur …] show the dot now?
  await p.evaluate(() => { closePop(); }); await p.waitForTimeout(200);
  if (more) { const m2 = await p.evaluate(() => { const e = document.querySelector('#rangeBar button[data-a="more"]'); if (!e || !e.getClientRects().length) return null; const q = e.getBoundingClientRect(); return [q.left + q.width / 2, q.top + q.height / 2]; }); if (m2) { await p.touchscreen.tap(m2[0], m2[1]); await p.waitForTimeout(400); } }
  r.bereich2 = await meas(p, '.pop .vvdr button');
  await p.screenshot({path: OUT + `ui-${n}-bereich2.png`});
  await p.evaluate(() => { closePop(); SV.sel = null; rangeBarSync(); }); await p.waitForTimeout(250);
  // cell sheet
  await p.evaluate(() => openCellSheet(1, 2)); await p.waitForTimeout(400);
  r.zelle = await meas(p, '.pop button[data-a="vvshow"]');
  await p.screenshot({path: OUT + `ui-${n}-zelle.png`});
  r.errs = errs.slice();
  res[n] = r; await b.close();
  const bad = k => r[k] && (r[k].small.length || r[k].out.length || r[k].clip.length || r[k].hit.length || r[k].popScroll);
  console.log(n, JSON.stringify({open: r.sheetOpen, hdr: r.hdrTap, marke: r.marke, matrix: r.afterMatrix, marke2: bad('marke2') ? r.marke2 : 'ok', rows: r.rows, docH: [r.docH0, r.docH1], bereich: r.bereich, liste: r.spurListe, spur: r.afterSpur, bereich2: r.bereich2, zelle: r.zelle, errs}));
}
fs.writeFileSync(OUT + 'ui.json', JSON.stringify(res, null, 1));
