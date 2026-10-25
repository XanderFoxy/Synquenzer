import fs from 'fs'; import { OUT, launch } from './v3-mk0rg2-lib.mjs';
const A = JSON.parse(fs.readFileSync(OUT + 'lay-base.json')), B = JSON.parse(fs.readFileSync(OUT + 'lay-new.json'));
const br = await launch(); const pg = await br.newPage();
for (const k of Object.keys(B)) {
  const a = A[k], b = B[k];
  if (b.FAIL || a.FAIL) { console.log(k, 'FAIL', b.FAIL, a.FAIL); continue; }
  const ra = new Set(a.rects), rb = new Set(b.rects); const onlyB = b.rects.filter(x => !ra.has(x)), onlyA = a.rects.filter(x => !rb.has(x));
  const [vp, ...st] = k.split('-');
  const pa = fs.readFileSync(OUT + `lay-base-${k}.png`).toString('base64'), pb = fs.readFileSync(OUT + `lay-new-${k}.png`).toString('base64');
  const d = await pg.evaluate(async ([pa, pb]) => { const ld = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + s; }); const [ia, ib] = await Promise.all([ld(pa), ld(pb)]);
    const w = ia.width, h = ia.height; if (ib.width !== w || ib.height !== h) return {size: [w, h, ib.width, ib.height]};
    const c = new OffscreenCanvas(w, h), x = c.getContext('2d'); x.drawImage(ia, 0, 0); const da = x.getImageData(0, 0, w, h).data; x.clearRect(0, 0, w, h); x.drawImage(ib, 0, 0); const db = x.getImageData(0, 0, w, h).data;
    let n = 0, x0 = w, y0 = h, x1 = -1, y1 = -1; for (let i = 0; i < da.length; i += 4) if (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) > 24) { n++; const px = (i / 4) % w, py = Math.floor(i / 4 / w); x0 = Math.min(x0, px); y0 = Math.min(y0, py); x1 = Math.max(x1, px); y1 = Math.max(y1, py); }
    return {n, box: n ? [x0, y0, x1, y1] : null}; }, [pa, pb]);
  const flag = (b.sw > b.iw || b.outside.length || b.clipped.length || b.overlap.length) ? ' NEWISSUES' : '';
  console.log(k, 'px', JSON.stringify(d), 'rects onlyNew', onlyB.length, 'onlyBase', onlyA.length, 'sw', b.sw + '/' + b.iw, 'out', b.outside.length + '/' + a.outside.length, 'clip', b.clipped.length + '/' + a.clipped.length, 'ovl', b.overlap.length + '/' + a.overlap.length, 'errs', b.errs.length + '/' + a.errs.length, flag);
  if (onlyB.length && onlyB.length < 12) console.log('   new:', onlyB.join(' ; '), '\n   base:', onlyA.join(' ; '));
  if (JSON.stringify(b.outside) !== JSON.stringify(a.outside)) console.log('   outside new', b.outside, 'base', a.outside);
  if (JSON.stringify(b.clipped) !== JSON.stringify(a.clipped)) console.log('   clipped new', b.clipped, 'base', a.clipped);
  if (JSON.stringify(b.overlap) !== JSON.stringify(a.overlap)) console.log('   overlap new', b.overlap, 'base', a.overlap);
  if (b.errs.length) console.log('   errs', b.errs);
}
await br.close();
