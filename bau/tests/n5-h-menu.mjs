// Menü → Projekt → Verlauf: an/aus, Größe, [Verlauf dieses Projekts löschen], Projektdatei [mit Verlauf]; 6 Formate:
// alles sichtbar, nichts abgeschnitten, Tasten ≥ 44 × 44, kein Layout-Sprung; Bedienung per Tipp (an/aus, löschen zweistufig)
import { launch, OUT } from './n5-h-lib.mjs';
const res = []; const ok = (id, pass, info) => { res.push({id, pass: !!pass}); console.log((pass ? 'PASS ' : 'FAIL ') + id + ' ' + JSON.stringify(info)); };
const VPS = [[390, 844], [375, 667], [320, 568], [844, 390], [667, 375], [926, 428]];
for (const [w, h] of VPS) {
  const {b, p, errs} = await launch({viewport: {width: w, height: h}, touch: true, mobile: true});
  const H0 = await p.evaluate(() => [document.documentElement.scrollHeight, document.documentElement.scrollWidth]);
  await p.evaluate(() => openMenu()); await p.waitForTimeout(400);
  const m = await p.evaluate(() => {
    const rows = [...document.querySelectorAll('#menu .mrow')].filter(r => /Verlauf|Projektdatei/.test(r.textContent));
    const els = rows.flatMap(r => [...r.querySelectorAll('button, .mval, .lbl')]);
    const vis = el => { const r = el.getBoundingClientRect(); return {t: el.textContent.trim().slice(0, 34), w: Math.round(r.width), h: Math.round(r.height), clip: el.scrollWidth > el.clientWidth + 1, btn: el.tagName === 'BUTTON'}; };
    rows[0] && rows[0].scrollIntoView({block: 'center'});
    return {n: rows.length, items: els.map(vis), rowsW: rows.map(r => [Math.round(r.getBoundingClientRect().left), Math.round(r.getBoundingClientRect().right)]), vw: innerWidth};
  });
  await p.waitForTimeout(200);
  await p.screenshot({path: `${OUT}/n5-h-menu-${w}x${h}.png`});
  const small = m.items.filter(x => x.btn && (x.w < 44 || x.h < 44)), clipped = m.items.filter(x => x.clip), out = m.rowsW.filter(([l, r]) => l < 0 || r > m.vw);
  ok(`Menü Verlauf ${w}x${h}: 3 Zeilen, nichts abgeschnitten, Tasten ≥ 44`, m.n === 3 && !small.length && !clipped.length && !out.length, {small, clipped, out, items: m.items.map(x => `${x.t} ${x.w}x${x.h}`)});
  // Bedienung: Aus → Ein, Löschen zweistufig
  const t = await p.evaluate(async () => {
    const row = [...document.querySelectorAll('#menu .mrow')].find(r => /^Verlauf/.test(r.textContent));
    const btn = txt => [...document.querySelectorAll('#menu button')].find(x => x.textContent.trim() === txt);
    const r = {};
    r.size0 = row.querySelector('.mval').textContent;
    return r;
  });
  const tap = async txt => { const l = p.locator('#menu button', {hasText: new RegExp('^' + txt + '$')}).first(); await l.scrollIntoViewIfNeeded(); await l.tap(); await p.waitForTimeout(150); };
  await tap('Aus'); const off = await p.evaluate(() => SYNQUENZER.history().on);
  await p.evaluate(() => SYNQUENZER.setClip(1, 3, {len: 1, notes: [{p: 61, s: 0, l: 1, v: .8}]})); await p.waitForTimeout(100);
  await tap('An'); const on = await p.evaluate(() => SYNQUENZER.history().on);
  const c1 = await p.evaluate(() => historyCheck());
  await tap('Verlauf dieses Projekts löschen'); const armed = await p.evaluate(() => [...document.querySelectorAll('#menu button')].some(x => x.textContent === 'Wirklich löschen?'));
  await p.waitForTimeout(500); await tap('Wirklich löschen\\?'); await p.waitForTimeout(800);
  const after = await p.evaluate(async () => ({h: SYNQUENZER.history(), c: await historyCheck(), size: [...document.querySelectorAll('#menu .mval')].map(x => x.textContent).find(x => /Größe/.test(x))}));
  ok(`Menü Verlauf ${w}x${h}: Aus/An per Tipp, Löschen zweistufig`, off === false && on === true && c1 && armed && after.c && after.h.keyframes === 1 && after.h.events === 0, {size0: t.size0, off, on, c1, armed, after});
  await p.evaluate(() => closeMenu()); await p.waitForTimeout(300);
  const H1 = await p.evaluate(() => [document.documentElement.scrollHeight, document.documentElement.scrollWidth]);
  ok(`Menü Verlauf ${w}x${h}: kein Layout-Sprung, keine Fehler`, H0[0] === H1[0] && H0[1] === H1[1] && H1[1] <= w && !errs.length, {H0, H1, errs: errs.slice(0, 3)});
  await b.close();
}
console.log(res.every(x => x.pass) ? 'ALLE BESTANDEN' : 'FEHLER');
