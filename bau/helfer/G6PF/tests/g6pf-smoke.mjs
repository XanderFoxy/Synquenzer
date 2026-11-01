// Smoke + Regel 28 + Platz (typische-fehler 1/4/5): Takes-Blatt und Chor-Blatt in P1/P2/P3/L1/L2/926×428
import {open, withTake, ok, done, sleep, APP} from './h.mjs';
import path from 'path'; import url from 'url';
const BASE = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '../../../snapshots/R-4252.html');
const norm = s => { const o = JSON.parse(s); delete o.appVersion; delete o.sum; delete o.saved; if (o.project) { delete o.project.id; delete o.project.name; } return JSON.stringify(o).replace(/[0-9a-v]{10}/g, 'ID').replace(/"created":\d+/g, '"created":0'); };
// (1) Regel 28: Demo, INIT und ein v1-Chor-Projekt aus R-4252 → in G6+f geladen → Zeichen für Zeichen gleich
{
  const B = await open({file: BASE});
  const demo = await B.p.evaluate(() => { SYNQUENZER.loadDemo(); return serialize(); });
  await withTake(B.p, [0]); await B.p.evaluate(() => SYNQUENZER.g6Make({t: stimmeT(), s: 0}, 'barber', 'up', 'pop')); await B.p.evaluate(() => SYNQUENZER.g6Wait({t: stimmeT(), s: 0}));
  const v1 = await B.p.evaluate(() => serialize()); await B.br.close();
  const N = await open();
  const d2 = await N.p.evaluate(() => { SYNQUENZER.loadDemo(); return serialize(); });
  ok(norm(demo) === norm(d2), 'Demo Zeichen für Zeichen gleich zu R-4252 (' + norm(demo).length + ' Zeichen)');
  const v1b = await N.p.evaluate(s => { importJSON(s); return serialize(); }, v1);
  ok(norm(v1) === norm(v1b), 'v1-Chor-Projekt (Barbershop, 3 Stimmen) aus R-4252 geladen = gleich (' + norm(v1).length + ' Zeichen; Format ' + JSON.parse(v1b).format + ')');
  ok(!N.errs.length, 'keine Konsolenfehler beim Laden ' + JSON.stringify(N.errs.slice(0, 2)));
  await N.br.close();
}
// (2) Platz: Takes-Blatt mit [Als Chor-Stimme duplizieren] und Wahl, Herkunftszeile; Chor-Blatt mit [Entkoppeln]
const SIZES = [[320, 568, 'P1'], [375, 667, 'P2'], [390, 844, 'P3'], [568, 320, 'L1'], [844, 390, 'L2'], [926, 428, 'L3']];
const check = async (p, sel, tag) => p.evaluate(([sel, tag]) => {
  const pop = document.querySelector('.tksheet'), out = [], vw = innerWidth, vh = innerHeight;
  if (!pop) return ['kein Blatt'];
  if (document.documentElement.scrollWidth > vw + 1) out.push('Seite breiter als ' + vw);
  for (const b of pop.querySelectorAll(sel)) { const r = b.getBoundingClientRect(); if (r.width === 0) continue;
    if (r.width < 44 - .5 || r.height < 44 - .5) out.push(tag + ' ' + b.textContent.trim().slice(0, 24) + ' ' + r.width.toFixed(0) + '×' + r.height.toFixed(0));
    if (b.scrollWidth > b.clientWidth + 1 || b.scrollHeight > b.clientHeight + 1) out.push(tag + ' abgeschnitten: ' + b.textContent.trim().slice(0, 30));
    if (r.right > vw + .5 || r.left < -.5) out.push(tag + ' außerhalb: ' + b.textContent.trim().slice(0, 30)); }
  return out; }, [sel, tag]);
for (const [w, h, tag] of SIZES) {
  const H = await open({viewport: {width: w, height: h}}); const p = H.p;
  await withTake(p, [0]); await p.evaluate(() => { SYNQUENZER.g6pDuplizieren({t: stimmeT(), s: 0}, false); g2Close(); });
  await p.evaluate(() => SYNQUENZER.tkSheet()); await sleep(300);
  let bad = await check(p, '.tkedrow button, .tkof button', tag);
  const h0 = await p.evaluate(() => document.querySelector('.tksheet').getBoundingClientRect().height);
  await p.click('.tk-dup'); await sleep(200);
  bad = bad.concat(await check(p, '.tkdup button', tag));
  const h1 = await p.evaluate(() => document.querySelector('.tksheet').getBoundingClientRect().height);
  ok(!bad.length && Math.abs(h1 - h0) < 1, `${tag} ${w}×${h}: Takes-Blatt – Treffer ≥ 44 px, nichts abgeschnitten, Wahl ohne Höhensprung (${h0.toFixed(0)} → ${h1.toFixed(0)} px) ${bad.join('; ')}`);
  if (tag === 'P1') { await p.screenshot({path: path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), 'p1-takes-wahl.png')}); }
  await p.click('.tk-dupx'); await sleep(150);
  const lines = await p.evaluate(() => [...document.querySelectorAll('.tkedrow button')].map(b => { const r = document.createRange(); r.selectNodeContents(b); const tops = new Set([...r.getClientRects()].filter(q => q.width > 0).map(q => Math.round(q.top))); return tops.size; }));
  const wp = await p.evaluate(() => { const b = document.querySelector('.tk-wp'); if (!b) return 0; const r = document.createRange(); r.selectNodeContents(b); return new Set([...r.getClientRects()].filter(q => q.width > 0).map(q => Math.round(q.top))).size; }); lines.push(wp);
  ok(lines.every(n => n <= 2), `${tag}: Knöpfe der Zeile höchstens zweizeilig (${lines.join('/')})`);
  if (tag === 'P1') { await sleep(4000); }
  if (tag === 'P1') await p.screenshot({path: path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), 'p1-takes.png')});
  ok(!H.errs.length, `${tag}: keine Konsolenfehler ${JSON.stringify(H.errs.slice(0, 2))}`);
  await H.br.close();
}
// (3) Klick-Weg: [Als Chor-Stimme duplizieren] → [Diese Stelle] öffnet den Noten-Editor der Kopie; Chor-Blatt zeigt [Background]
{
  const H = await open({viewport: {width: 390, height: 844}}); const p = H.p;
  await withTake(p, [0]); await p.evaluate(() => SYNQUENZER.tkSheet()); await sleep(250);
  await p.click('.tk-dup'); await sleep(150); await p.click('.tk-dup1'); await sleep(300);
  const e = await p.evaluate(() => ({ed: !!G2.ed, id: G2.ed && G2.ed.id, lead: S.tracks[stimmeT()].clips[0].audio.take, title: document.querySelector('#wpSheet .qh b, .g2 .qh b') ? document.querySelector('.g2 .qh b').textContent : ''}));
  ok(e.ed && e.id !== e.lead && /Gegenstimme 1/.test(e.title), 'Tipp-Weg: Diese Stelle → Noten-Editor „' + e.title + '“');
  await p.evaluate(() => { g2Close(); SYNQUENZER.g6Sheet(); }); await sleep(250);
  ok(await p.evaluate(() => !!document.querySelector('.g6sheet [data-bg="c1"]')), 'Chor-Blatt: Gegenstimme mit [Background]');
  await p.click('.g6sheet [data-bg="c1"]'); await sleep(150);
  ok(await p.evaluate(() => S.tracks[stimmeT()].clips[0].audio.chor.voices[0].pan === -0.6), '[Background] getippt: Pan links −0,6');
  await H.br.close();
}
done();
