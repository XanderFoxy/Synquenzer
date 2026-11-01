// VV4-B Layout: Zeile „Video“ (zwei Zeilen) im Marken-Blatt und im ⋯ der Bereich-Leiste, Listen „Spur …“ / „Fokus …“ und die
// Spur-Wahl: jede Taste ≥ 44 × 44, nichts abgeschnitten, alles im Bild, Treffer landen auf der Taste; keine Konsolenfehler
import { open, SONG, OUT } from './lib.mjs';
import fs from 'fs';
const SZ = {I12: [428, 926], I12q: [926, 428], P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375]};
const sizes = (process.argv[2] || Object.keys(SZ).join(',')).split(',');
const meas = (p, sel) => p.evaluate(sel => {
  const vis = e => { if (!e.getClientRects().length) return false; const cs = getComputedStyle(e); return cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const out = {small: [], bad: [], hits: [], n: 0};
  for (const e of [...document.querySelectorAll(sel)].filter(vis)) {
    out.n++; const q = e.getBoundingClientRect(), nm = (e.textContent || e.getAttribute('aria-label')).trim().slice(0, 24);
    if (q.width < 44 - .5 || q.height < 44 - .5) out.small.push(nm + ' ' + q.width.toFixed(1) + 'x' + q.height.toFixed(1));
    if (q.right > innerWidth + .5 || q.bottom > innerHeight + .5 || q.left < -.5 || q.top < -.5) out.bad.push('out:' + nm);
    if (e.scrollWidth > e.clientWidth + 1) out.bad.push('clipX:' + nm + ' ' + e.scrollWidth + '>' + e.clientWidth);
    for (const c of e.querySelectorAll('b')) if (c.scrollWidth > c.clientWidth + 1 && getComputedStyle(c).display !== 'inline') out.bad.push('clipX:' + c.textContent.slice(0, 30));
    const cx = q.left + q.width / 2, cy = q.top + q.height / 2, h = document.elementFromPoint(cx, cy);
    if (!h || (h !== e && !e.contains(h))) out.hits.push(nm + ' → ' + (h ? h.tagName + '.' + h.className : 'null'));
  }
  const pop = document.querySelector('.pop'); if (pop) { const q = pop.getBoundingClientRect(); if (q.bottom > innerHeight + .5 || q.right > innerWidth + .5 || q.top < -.5 || q.left < -.5) out.bad.push('pop out'); }
  out.ok = out.n > 0 && !out.small.length && !out.bad.length && !out.hits.length;
  return out;
}, sel);
const res = {};
for (const n of sizes) {
  const [w, h] = SZ[n], r = {};
  const {b, p, errs} = await open({w, h, touch: true, dpr: 3});
  await p.evaluate(s => { SYNQUENZER.setSong(s); setSongView(true); }, SONG); await p.waitForTimeout(400);
  const docH0 = await p.evaluate(() => document.documentElement.scrollHeight);
  await p.evaluate(() => openMarkSheet(S.song.marks[1].id)); await p.waitForTimeout(300);
  r.marke = await meas(p, '.pop .vvdr button');
  await p.screenshot({path: `${OUT}/vv4-layout-${n}-marke.png`});
  await p.tap('.pop .vvdr button[data-a="vv-spur"]'); await p.waitForTimeout(300);
  r.spurArten = await meas(p, '.pop button[data-v]');
  await p.screenshot({path: `${OUT}/vv4-layout-${n}-spur.png`});
  await p.tap('.pop button[data-v="roll"]'); await p.waitForTimeout(300);
  r.spurWahl = await meas(p, '.pop button[data-t]');
  await p.evaluate(() => closePop()); await p.waitForTimeout(200);
  await p.evaluate(() => SYNQUENZER.songSelect(4, 7)); await p.waitForTimeout(250);
  await p.tap('#rangeBar button[data-a="more"]'); await p.waitForTimeout(300);
  r.bereich = await meas(p, '.pop .vvdr button');
  await p.screenshot({path: `${OUT}/vv4-layout-${n}-bereich.png`});
  await p.tap('.pop .vvdr button[data-a="vv-fokus"]'); await p.waitForTimeout(300);
  r.fokusArten = await meas(p, '.pop button[data-v]:not(:disabled)');
  await p.screenshot({path: `${OUT}/vv4-layout-${n}-fokus.png`});
  await p.evaluate(() => { closePop(); SV.sel = null; rangeBarSync(); }); await p.waitForTimeout(200);
  r.seiteSpringtNicht = {vorher: docH0, nachher: await p.evaluate(() => document.documentElement.scrollHeight)}; r.seiteSpringtNicht.ok = r.seiteSpringtNicht.vorher === r.seiteSpringtNicht.nachher;
  r.errs = errs.slice(); r.ok = Object.values(r).every(x => !x || x.ok !== false) && !errs.length;
  res[n] = r; await b.close();
  console.log(n, r.ok ? 'OK' : 'FEHLER ' + JSON.stringify(r).slice(0, 1500));
}
res.ok = Object.values(res).every(r => r.ok);
fs.mkdirSync(OUT, {recursive: true}); fs.writeFileSync(OUT + '/vv4-layout.json', JSON.stringify(res, null, 1));
console.log('GESAMT', res.ok ? 'GRÜN' : 'ROT');
