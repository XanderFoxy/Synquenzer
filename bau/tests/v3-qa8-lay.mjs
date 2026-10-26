// QA MK8 layout: Sichern place choice + Bank ▾ + library rows in all formats incl. 428×926 / 926×428; text overflow; page height stable
import {launch, open, FMT} from './v3-qa8-lib.mjs';
import path from 'path';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info !== undefined ? ' — ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); };
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa8/';
const b = await launch();
const popCheck = page => page.evaluate(() => {
  const bad = [], vw = innerWidth, vh = innerHeight, p = document.querySelector('.pop.mk8w'); if (!p) return ['kein Fenster'];
  const pr = p.getBoundingClientRect(); if (pr.left < -.5 || pr.top < -.5 || pr.right > vw + .5 || pr.bottom > vh + .5) bad.push('Fenster außerhalb ' + JSON.stringify([pr.left, pr.top, pr.right, pr.bottom].map(Math.round)));
  const vis = e => !e.hidden && getComputedStyle(e).display !== 'none';
  const bs = [...p.querySelectorAll('button')].filter(vis);
  for (const x of bs) { const r = x.getBoundingClientRect(); if (r.height < 43.5 || r.width < 43.5) bad.push('klein ' + x.textContent.trim() + ' ' + r.width.toFixed(0) + '×' + r.height.toFixed(0));
    if (x.scrollWidth > x.clientWidth + 1) bad.push('abgeschnitten ' + x.textContent.trim()); if (r.bottom > vh + .5 || r.top < 0) bad.push('außerhalb Bild ' + x.textContent.trim()); }
  for (const e of p.querySelectorAll('h4, .mk8i, input')) if (e.scrollWidth > e.clientWidth + 1) bad.push('Text läuft über: ' + (e.textContent || e.value).slice(0, 40));
  const inp = p.querySelector('input'); if (inp) { const r = inp.getBoundingClientRect(); if (r.height < 43.5) bad.push('Eingabe ' + r.height.toFixed(0) + ' px hoch'); if (r.bottom > vh + .5) bad.push('Eingabe außerhalb'); }
  return bad;
});
for (const f of Object.keys(FMT)) {
  const {ctx, page, errs} = await open(b, f);
  await page.evaluate(async () => { await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
  await sleep(500);
  // a place with an own sound so that „Werksklang zurück“ and „Überschreiben“ are visible too (longest button row)
  await page.evaluate(async () => { mkProg.select(6, 16); SYNQUENZER.mkSet(0, 't.0.f.cut', 30); await mkProg.write(6, 16, 'Doppelsirene Neu'); SYNQUENZER.mkSet(0, 't.0.f.cut', 31); });
  await sleep(300);
  const H0 = await page.evaluate(() => [document.documentElement.scrollHeight, document.body.scrollHeight, scrollY]);
  await page.evaluate(() => document.querySelector('#synthSheet .sh-head .hb.sv').click()); await sleep(400);
  const a = await popCheck(page); const H1 = await page.evaluate(() => [document.documentElement.scrollHeight, document.body.scrollHeight, scrollY]);
  const btns = await page.evaluate(() => [...document.querySelectorAll('.pop.mk8w .mk8r button')].filter(x => !x.hidden).map(x => x.textContent));
  await page.screenshot({path: OUT + f + '-sichern.png'});
  await page.evaluate(() => closePop()); await sleep(200);
  await page.evaluate(() => document.querySelector('#synthSheet .sh-head .preset .pv').click()); await sleep(500);
  const rows = await page.evaluate(() => [...document.querySelectorAll('#sndSheet .brow')].map(r => { const q = r.getBoundingClientRect(); const ov = [...r.querySelectorAll('*')].filter(e => e.children.length === 0 && e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible' && getComputedStyle(e).textOverflow !== 'ellipsis').map(e => e.textContent.trim().slice(0, 30));
    const ell = [...r.querySelectorAll('*')].filter(e => e.children.length === 0 && e.scrollWidth > e.clientWidth + 1).map(e => e.textContent.trim().slice(0, 30)); return {id: r.dataset.id, h: Math.round(q.height), ov, ell}; }));
  await page.screenshot({path: OUT + f + '-lib.png'});
  await page.evaluate(() => document.querySelector('#sndSheet .brbank').click()); await sleep(300);
  const bk = await popCheck(page);
  await page.screenshot({path: OUT + f + '-bank.png'});
  const H2 = await page.evaluate(() => [document.documentElement.scrollHeight, document.body.scrollHeight, scrollY]);
  ok(f + ' Sichern place choice', a.length === 0, a.join('; ') || btns.join(' | '));
  ok(f + ' Bank ▾', bk.length === 0, bk.join('; '));
  ok(f + ' library rows ≥ 44 px, no clipped text', rows.every(r => r.h >= 44) && rows.every(r => !r.ov.length), {n: rows.length, minH: Math.min(...rows.map(r => r.h)), clipped: rows.filter(r => r.ov.length).map(r => r.id + ':' + r.ov.join('/')).slice(0, 5), ellipsis: rows.filter(r => r.ell.length).map(r => r.id + ':' + r.ell.join('/')).slice(0, 5)});
  ok(f + ' page height stable', JSON.stringify(H0) === JSON.stringify(H1) && JSON.stringify(H0) === JSON.stringify(H2), {H0, H1, H2});
  ok(f + ' console', errs.length === 0, errs);
  await ctx.close();
}
console.log(fails ? 'FAIL ' + fails : 'ALL PASS');
await b.close();
