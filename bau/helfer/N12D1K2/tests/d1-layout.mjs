// D1-04: the [Länge n] button and the popover (Länge, Richtung ×4, Startwert, ×2) in all formats: inside the screen, not cut, hit ≥ 44 px
// where the app's row allows it; the footer does not overflow; the page height does not change (no layout jump)
import {app, report} from './touch-lib.mjs';
const FILE = process.argv[2] || undefined, res = [];
for (const [w, h] of [[390, 844], [375, 667], [320, 568], [844, 390], [667, 375], [926, 428]]) {
  const A = await app({width: w, height: h}, FILE), {p, tap} = A, tag = `${w}×${h}`;
  await p.evaluate(() => { const S = window.SYNQUENZER; S.setClip(4, 0, {len: 2, key: {root: 0, scale: 'ionian'}, notes: [{t: 0, d: .1, n: 42, v: .8}], lanes: {42: {len: 12, dir: 'rnd', seed: 3}}}); S.openRoll(4, 0); });
  await p.waitForTimeout(400); await p.evaluate(() => { ED.dVoice = DRUM_VOICES.findIndex(v => v.gm === 42); safeRebuild(buildDrumEd); }); await p.waitForTimeout(300);
  const H0 = await p.evaluate(() => document.documentElement.scrollHeight);
  const m = await p.evaluate(() => { const b = document.querySelector('.d1b'); b.scrollIntoView({inline: 'end', block: 'nearest'}); const r = b.getBoundingClientRect(), side = b.closest('.pgside') || b.parentElement, sr = side.getBoundingClientRect(), foot = b.closest('.foot') || side;
    // nothing of the footer outside the screen; the pager and the tool row do not overlap (the tool row may scroll: P2 with pager)
    const T = document.querySelector('.dtools').getBoundingClientRect(), N = document.querySelector('.pgnav'), nr = N && N.getBoundingClientRect();
    const over = [T.right > innerWidth + .5, !!nr && !!N.offsetParent && nr.right > T.left + .5 && nr.left < T.right - .5 && nr.bottom > T.top + .5 && nr.top < T.bottom - .5, ...[...document.querySelectorAll('.dtools .mbtn')].map(e => e.scrollWidth > e.clientWidth + 1)];
    return {x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, in: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight, cut: b.scrollWidth > b.clientWidth + 1, over: over.some(Boolean), txt: b.textContent}; });
  res.push({id: `D1-04 ${tag} Knopf`, pass: m.in && !m.cut && !m.over && m.w >= 44, info: `„${m.txt}“ ${Math.round(m.w)}×${Math.round(m.h)} px, im Bild ${m.in}, abgeschnitten ${m.cut}, Fuß-Überlauf ${m.over}`});
  await tap(m.x, m.y); await p.waitForTimeout(300);
  const q = await p.evaluate(() => { const pop = document.querySelector('.pop.d1p'); if (!pop) return null; const pr = pop.getBoundingClientRect();
    const bs = [...pop.querySelectorAll('button')].map(b => { const r = b.getBoundingClientRect(); return {t: b.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height), cut: b.scrollWidth > b.clientWidth + 1}; });
    const knobs = [...pop.querySelectorAll('.knob, .ctl')].map(k => { const r = k.getBoundingClientRect(); return {w: Math.round(r.width), h: Math.round(r.height), vis: getComputedStyle(k.closest('[style*="visibility"]') || k).visibility}; });
    return {in: pr.left >= 0 && pr.top >= 0 && pr.right <= innerWidth && pr.bottom <= innerHeight, bs, knobs, scroll: pop.scrollHeight > pop.clientHeight + 1}; });
  const okB = q && q.bs.every(b => b.h >= 44 && b.w >= 44 && !b.cut);
  res.push({id: `D1-04 ${tag} Blatt`, pass: !!q && q.in && okB && !q.scroll, info: q ? `im Bild ${q.in}, Tasten ${q.bs.map(b => b.t + ' ' + b.w + '×' + b.h + (b.cut ? ' ABGESCHN.' : '')).join(' · ')}` : 'kein Blatt'});
  await tap(5, 5); await p.waitForTimeout(250);
  const H1 = await p.evaluate(() => document.documentElement.scrollHeight);
  res.push({id: `D1-04 ${tag} Höhe`, pass: H0 === H1 && A.errs.length === 0, info: `Seitenhöhe ${H0} → ${H1}, Fehler ${A.errs.length}`});
  await A.b.close();
}
report('D1-Bedienung', res);
