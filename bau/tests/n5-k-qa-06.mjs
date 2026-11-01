// QA K1-06: the way into the Mod-Übersicht by finger: hit area of ⋯ (elementFromPoint grid, 1 px), of the menu row
// „Modulationen (n)“, of each row and ✕ in the pop; clipping (scrollWidth), page height before/after, all 6 formats, VA/FM/WT/MS 2000
import {launch, OUT} from './n5-k-blib.mjs';
const VPS = [[390, 844], [375, 667], [320, 568], [844, 390], [667, 375], [926, 428]];
const hitBox = (sel) => { // the box of points whose elementFromPoint is inside the element
  const e = typeof sel === 'string' ? document.querySelector(sel) : sel; if (!e) return null;
  const r = e.getBoundingClientRect(), cx = r.x + r.width / 2, cy = r.y + r.height / 2;
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (let y = Math.floor(cy - 40); y <= cy + 40; y++) for (let x = Math.floor(cx - 40); x <= cx + 40; x++) {
    const h = document.elementFromPoint(x, y); if (h && (h === e || e.contains(h))) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }
  return x1 < 0 ? [0, 0] : [x1 - x0 + 1, y1 - y0 + 1];
};
const out = [];
for (const [w, h] of VPS) {
  const {b, p, errs} = await launch({viewport: {width: w, height: h}, touch: true, mobile: true, dpr: 2});
  await p.evaluate(async () => { mkLoad(); for (let i = 0; i < 60 && !mkLoaded(); i++) await new Promise(r => setTimeout(r, 100)); });
  for (const [t, id] of [[3, 'f-moog-bass'], [2, 'f-dx-tines'], [1, 'f-init-tabelle'], [0, 'f-mk-d05']]) {
    const ok = await p.evaluate(([t, id]) => { if (!FACTORY_BY_ID.has(id)) return false; loadPreset(t, id); selectTrack(t); ED.tab = id.startsWith('f-mk') ? 'geraet' : 'osc'; openEditor(); return true; }, [t, id]);
    if (!ok) { out.push({vp: w + 'x' + h, id, err: 'no preset'}); continue; }
    await p.waitForTimeout(600);
    const H0 = await p.evaluate(() => [document.documentElement.scrollHeight, window.scrollY]);
    const more = await p.evaluate((hb) => { const hitBox = eval(hb); const bs = [...EL.synthSheet.querySelectorAll('.edm, .mkqmore')].filter(x => { const r = x.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(x).visibility !== 'hidden'; });
      const x = bs[0]; if (!x) return null; const r = x.getBoundingClientRect(); return {cls: x.className, box: [Math.round(r.width), Math.round(r.height)], hit: hitBox(x), c: [r.x + r.width / 2, r.y + r.height / 2]}; }, hitBox.toString());
    if (!more) { out.push({vp: w + 'x' + h, id, err: 'no ⋯'}); continue; }
    await p.touchscreen.tap(more.c[0], more.c[1]); await p.waitForTimeout(250);
    const row = await p.evaluate((hb) => { const hitBox = eval(hb); const x = document.querySelector('.pop button[data-a="k1m"]'); if (!x) return null; x.scrollIntoView({block: 'nearest'}); const r = x.getBoundingClientRect();
      const cl = [...x.querySelectorAll('b, small')].filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent); return {hit: hitBox(x), c: [r.x + r.width / 2, r.y + r.height / 2], clip: cl, text: x.innerText}; }, hitBox.toString());
    if (!row) { out.push({vp: w + 'x' + h, id, more, err: 'no row'}); await p.evaluate(() => closePop()); continue; }
    await p.touchscreen.tap(row.c[0], row.c[1]); await p.waitForTimeout(300);
    const pop = await p.evaluate((hb) => { const hitBox = eval(hb); const pp = document.querySelector('.pop.k1pop'); if (!pp) return null; const r = pp.getBoundingClientRect();
      const rows = [...pp.querySelectorAll('.k1mr')].slice(0, 3).map(m => { m.scrollIntoView({block: 'nearest'}); return [hitBox(m.querySelector('.k1go')), hitBox(m.querySelector('.k1x'))]; });
      const clip = [...pp.querySelectorAll('h4, .k1go b, .k1go small, .k1empty')].filter(e => e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1).map(e => e.textContent);
      return {inside: r.left >= 0 && r.top >= 0 && r.right <= innerWidth + .5 && r.bottom <= innerHeight + .5, rect: [r.left, r.top, r.right, r.bottom].map(Math.round), rows, clip, H: [document.documentElement.scrollHeight, window.scrollY]}; }, hitBox.toString());
    out.push({vp: w + 'x' + h, id, more: more.cls + ' box ' + more.box + ' hit ' + more.hit, row: row.hit, rowClip: row.clip, pop: pop && {inside: pop.inside, rect: pop.rect, rows: JSON.stringify(pop.rows), clip: pop.clip, Hsame: pop.H.join() === H0.join()}});
    await p.screenshot({path: OUT + '/n5-k-qa-06-' + w + 'x' + h + '-' + id + '.png'});
    await p.evaluate(() => closePop());
  }
  if (errs.length) out.push({vp: w + 'x' + h, errs: errs.slice(0, 3)});
  await b.close();
}
for (const o of out) console.log(JSON.stringify(o));
