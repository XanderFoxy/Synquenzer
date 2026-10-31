// VV2-05 Bedienung: neue Zeilen in den vorhandenen Blättern ≥ 44 × 44, in allen Formaten im Bild; Streifen in der Song-Ansicht verdeckt nichts
import { open } from './n5-v-lib.mjs';
import fs from 'fs';
const SONG16 = {bars: 16, lanes: [[{bar: 0, slot: 0}, {bar: 8, slot: 1}], [{bar: 0, slot: 0}], [{bar: 2, slot: 0}, {bar: 14, slot: -1}], [], [{bar: 0, slot: 0}, {bar: 8, slot: 1}], []],
  carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 8, name: 'Strophe'}, {id: 'm2', a: 8, len: 8, name: 'Refrain'}]};
const SZ = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [926, 428]};
const sizes = (process.argv[2] || 'P1,P2,P3,L1,L2,W').split(',');
const meas = (p, sel) => p.evaluate(sel => {
  const vis = e => { if (!e.getClientRects().length) return false; const cs = getComputedStyle(e); return cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const out = {small: [], bad: [], hits: [], n: 0, txt: []};
  for (const e of [...document.querySelectorAll(sel)].filter(vis)) {
    out.n++; const q = e.getBoundingClientRect(), nm = (e.textContent || e.getAttribute('aria-label')).trim().slice(0, 24); out.txt.push(nm);
    if (q.width < 44 - .5 || q.height < 44 - .5) out.small.push(nm + ' ' + q.width.toFixed(1) + 'x' + q.height.toFixed(1));
    if (q.right > innerWidth + .5 || q.bottom > innerHeight + .5 || q.left < -.5 || q.top < -.5) out.bad.push('out:' + nm);
    if (e.scrollWidth > e.clientWidth + 1) out.bad.push('clipX:' + nm + ' ' + e.scrollWidth + '>' + e.clientWidth);
    for (const c of e.querySelectorAll('b,small')) if (c.scrollWidth > c.clientWidth + 1 && getComputedStyle(c).display !== 'inline') out.bad.push('clipX:' + c.textContent.slice(0, 30));
    const cx = q.left + q.width / 2, cy = q.top + q.height / 2;
    for (const [x, y] of [[cx, cy], [cx - 20, cy - 20], [cx + 20, cy + 20]]) { const h = document.elementFromPoint(x, y); if (!h || (h !== e && !e.contains(h))) out.hits.push(nm + ' → ' + (h ? h.tagName + '.' + h.className : 'null')); }
  }
  const pop = document.querySelector('.pop'); if (pop) { const q = pop.getBoundingClientRect(); if (q.bottom > innerHeight + .5 || q.right > innerWidth + .5 || q.top < -.5) out.bad.push('pop out ' + [q.left, q.top, q.right, q.bottom].map(Math.round)); if (pop.scrollHeight > pop.clientHeight + 1) out.bad.push('pop scrolls ' + pop.scrollHeight + '>' + pop.clientHeight); }
  return out;
}, sel);
const res = {};
for (const n of sizes) {
  const [w, h] = SZ[n], r = {};
  const {b, p, errs} = await open({w, h, touch: true, dpr: 2});
  await p.evaluate(s => { SYNQUENZER.setSong(s); setSongView(true); }, SONG16); await p.waitForTimeout(400);
  const L0 = await p.evaluate(() => svLayoutInfo());
  // 1) Marken-Blatt of „Refrain“: the row „Video“, tap [Matrix]
  await p.evaluate(() => openMarkSheet(S.song.marks.find(m => m.name === 'Refrain').id)); await p.waitForTimeout(300);
  r.marke = await meas(p, '.pop .vvdr button');
  r.markeAlle = await meas(p, '.pop button');
  await p.screenshot({path: `n5-v-out/vv2-05-${n}-marke.png`});
  await p.tap('.pop .vvdr button[data-a="vv-matrix"]'); await p.waitForTimeout(250);
  r.markeSetzt = await p.evaluate(() => ({dir: SYNQUENZER.vvDirGet(), on: !!document.querySelector('.pop .vvdr button.on[data-a="vv-matrix"]')}));
  await p.evaluate(() => closePop()); await p.waitForTimeout(250);
  // 2) the stripe: header without it, rows below it (nothing covered)
  const L1 = await p.evaluate(() => ({li: svLayoutInfo(), vvS: SV.vvS, marks: SV.markGeo, labTop: (() => { const e = document.querySelector('.sv-lr'); return e ? e.getBoundingClientRect().height : null; })()}));
  r.streifen = {rulerVorher: L0.rulerH, rulerNachher: L1.li.rulerH, streifen: L1.vvS, kopf: L1.li.rulerH - L1.vvS, markenSichtbar: (L1.marks || []).length, zeilenAb: L1.li.rulerH, beschriftungKopf: L1.labTop,
    ok: L1.vvS === 8 && L1.li.rulerH - L1.vvS === L0.rulerH && (L1.marks || []).length >= 1 && Math.abs((L1.labTop || 0) - L1.li.rulerH) < 1};
  await p.screenshot({path: `n5-v-out/vv2-05-${n}-streifen.png`});
  // 3) Bereich: bars 9–12 → ⋯ → row „Video“ → [Spur …] → Synth 3
  await p.evaluate(() => { SYNQUENZER.songSelect(8, 11); }); await p.waitForTimeout(250);
  await p.tap('#rangeBar button[data-a="more"]'); await p.waitForTimeout(300);
  r.bereich = await meas(p, '.pop .vvdr button');
  await p.screenshot({path: `n5-v-out/vv2-05-${n}-bereich.png`});
  await p.tap('.pop .vvdr button[data-a="vv-spur"]'); await p.waitForTimeout(300);
  r.spurListe = await meas(p, '.pop button[data-t]');
  await p.tap('.pop button[data-t="2"]'); await p.waitForTimeout(250);
  r.bereichSetzt = await p.evaluate(() => SYNQUENZER.vvDirGet());
  await p.evaluate(() => { SV.sel = null; rangeBarSync(); closePop(); }); await p.waitForTimeout(200);
  // 4) Zell-Blatt (Lane-Eintrag halten) of Synth 2 → „Im Video zeigen“
  await p.evaluate(() => openCellSheet(1, 2)); await p.waitForTimeout(300);
  r.zelle = await meas(p, '.pop button[data-a="vvshow"]');
  r.zelleAlle = await meas(p, '.pop button');
  await p.screenshot({path: `n5-v-out/vv2-05-${n}-zelle.png`});
  await p.tap('.pop button[data-a="vvshow"]'); await p.waitForTimeout(250);
  r.zelleSetzt = await p.evaluate(() => SYNQUENZER.vvDirGet());
  r.ok = ['marke', 'bereich', 'spurListe', 'zelle'].every(k => r[k].n > 0 && !r[k].small.length && !r[k].bad.length && !r[k].hits.length) && r.streifen.ok && !r.markeAlle.bad.length && !r.zelleAlle.bad.length
    && r.markeSetzt.on && JSON.stringify(r.zelleSetzt).includes('"v":"spur","t":1') && JSON.stringify(r.bereichSetzt).includes('"a":8,"b":12,"v":"spur","t":2');
  r.errs = errs.slice();
  res[n] = r; await b.close();
  console.log(n, r.ok, JSON.stringify({marke: r.marke, bereich: r.bereich, spur: r.spurListe, zelle: r.zelle, streifen: r.streifen, mAll: r.markeAlle.bad, zAll: r.zelleAlle.bad, set: [r.markeSetzt, r.bereichSetzt, r.zelleSetzt], errs}).slice(0, 2500));
}
fs.writeFileSync('n5-v-out/vv2-05.json', JSON.stringify(res, null, 1));
