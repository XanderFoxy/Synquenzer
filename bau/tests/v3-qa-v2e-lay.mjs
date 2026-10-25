// V2e layout (N7S-33, N7S-36, N7S-40, K2-25, K2-26, 6.5): rows/Spurbank, transport, Marken-Blatt, Bereich-Leiste,
// Ersetzen/Einfügen-Blatt, Start-Blatt, Akkord-Quantisieren-Blatt in P1–P3, L1, L2, W (M-PLATZ); screenshots
import { openVp, mk, SETUP } from './v3-qa-v2e-lib.mjs';
import { mkCheck } from './v3-v2d-lib.mjs';
const {check, done} = mkCheck();
const only = process.argv[2];
const MEAS = `(sel => { const s = document.querySelector(sel); if (!s || !s.offsetWidth) return null; const r = s.getBoundingClientRect(), bad = [], small = [], P = innerHeight > innerWidth;
  for (const x of s.querySelectorAll('button')) { const q = x.getBoundingClientRect(); if (!q.width || !q.height) continue;
    if (q.left < -.5 || q.right > innerWidth + .5 || q.top < -.5 || q.bottom > innerHeight + .5) bad.push(x.textContent + ' out');
    if (x.scrollWidth > x.clientWidth + 1 || x.scrollHeight > x.clientHeight + 2) bad.push(x.textContent + ' clipped ' + x.scrollWidth + '/' + x.clientWidth);
    // the hit area: the button itself or its ::before extension (ms-x reaches 12 px up)
    const ext = parseFloat(getComputedStyle(x, '::before').top) < 0 ? -parseFloat(getComputedStyle(x, '::before').top) : 0;
    if (!x.disabled && (P ? (q.width < 43.5 || q.height + ext < 43.5) : (q.width < 39.5 || q.height + ext < 35.5))) small.push(x.textContent + ' ' + q.width.toFixed(1) + 'x' + q.height.toFixed(1)); }
  return {x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1), bad, small, hs: document.documentElement.scrollWidth > innerWidth + .5}; })`;
for (const vp of ['P1', 'P2', 'P3', 'L1', 'L2', 'W']) {
  if (only && only !== vp) continue;
  const {b, p, errs, cdp} = await openVp(vp);
  const T = mk(p, cdp), {E} = T, P = vp[0] === 'P';
  await E(SETUP(true)); await E(() => window.SYNQUENZER.songView(true)); await p.waitForTimeout(350);
  let i = await T.info();
  console.log(vp, JSON.stringify(i));
  // rows (6.5): 6 tracks
  const exp = {P1: [8, 38.9, false], P2: [8, 28.1, false], P3: [7, 28.7, true], L1: [7, 27.3, true], L2: [7, 25.9, true]}[vp];
  if (exp) check(vp + ' N7S-33 Zeilen ' + exp[0] + ' à ' + exp[1] + ' px, Spurbank ' + (exp[2] ? 'ja' : 'nein'), i.rows.length - 1 === exp[0] && Math.abs(i.rowH - exp[1]) <= .6 && (i.banks > 1) === exp[2], [i.rows, i.rowH, i.banks]);
  if (exp && exp[2]) check(vp + ' Spurbank Seite 1 = Synth 1–4, DRUMS, AKK, MEL', JSON.stringify(i.rows) === JSON.stringify(['TAKT', 'S1', 'S2', 'S3', 'S4', 'DR', 'AKKORDE', 'MELODIE']), i.rows);
  check(vp + ' Zeilen ≥ 26 px (L2 ≥ 25,4)', i.rowH >= (vp === 'L2' ? 25.4 : 26), i.rowH);
  // transport widths (K2-26 / 6.5)
  const tw = await E(() => [...document.querySelectorAll('#songView .sv-top > button')].filter(x => x.offsetWidth).map(x => { const r = x.getBoundingClientRect(); return [x.className.replace(/rb |sv-b /g, '').split(' ')[0], +r.width.toFixed(1), +r.height.toFixed(1), x.scrollWidth <= x.clientWidth + 1]; }));
  console.log(vp, 'transport', JSON.stringify(tw));
  const W = Object.fromEntries(tw.map(x => [x[0], x[1]]));
  if (vp === 'P1') check('P1 Transport [CLIPS ⇄ 64][● ▾ 76][▶ SONG 76][⟲ Song ▾ ≥ 86, füllt den Rest][⏮ 44] (±3)', Math.abs(W['sv-sw'] - 64) <= 3 && Math.abs(W['sv-rec'] - 76) <= 3 && Math.abs(W['sv-play'] - 76) <= 3 && W['sv-loop'] >= 86 - 3 && Math.abs(W['sv-home'] - 44) <= 3 && !('sv-bank' in W), W);
  if (vp === 'P2') check('P2 Transport [CLIPS ⇄ 56][● ▾ 64][▶ 64][⟲ ▾ ≥ 56][⏮ 44][▲▼ 44] (±3)', Math.abs(W['sv-sw'] - 56) <= 3 && Math.abs(W['sv-rec'] - 64) <= 3 && Math.abs(W['sv-play'] - 64) <= 3 && W['sv-loop'] >= 56 - 3 && Math.abs(W['sv-home'] - 44) <= 3 && Math.abs(W['sv-bank'] - 44) <= 3, W);
  if (vp !== 'P1' && vp !== 'P2' && vp !== 'W') check(vp + ' [▲▼] in der Transport-Spalte', 'sv-bank' in W, W);
  const col = vp === 'P3' || vp[0] === 'L';     // the transport column (6.5): [● ▾][▶] and [⏮][▲▼] share a row → ≥ 29 wide, ≥ 44 high
check(vp + ' Transport: Texte passen, Treffer ' + (col ? 'Spalte ≥ 29 × 44' : P ? '≥ 44×40' : '≥ 40×34'), tw.every(x => x[3] && (col ? x[1] >= 29 && x[2] >= 43.5 : x[1] >= (P ? 43.5 : 39.5) && x[2] >= (P ? 39.5 : 33.5))), tw);
  if (i.banks > 1) {
    await T.tapSel('#songView .sv-bank'); i = await T.info();
    check(vp + ' [▲▼] → Seite 2: MELODIE-Spur, DRUMS bleibt; Zeilen gleich hoch', i.bank === 1 && i.rows.includes('MEL') && i.rows.includes('DR') && i.rows.includes('AKKORDE'), i.rows);
    await T.tapSel('#songView .sv-bank'); i = await T.info();
  }
  await p.screenshot({path: `v3-qa-v2e/lay-${vp}-a.png`});
  // Marken-Blatt
  const cvB = i.canvas.y + i.canvas.h, carR = await T.rect('#carrier');
  await T.tapCv(3 * 36 + 10, 8);
  let m = await E(`${MEAS}('#popLayer .pop.msheet')`);
  console.log(vp, 'msheet', JSON.stringify(m));
  check(vp + ' Marken-Blatt im Bild, nichts abgeschnitten, Treffer ok', m && !m.bad.length && !m.small.length && !m.hs, m);
  const eh = {P1: 208, P2: 208, P3: 252, L1: 116, L2: 116, W: 116}[vp];
  if (vp !== 'W') check(vp + ' Marken-Blatt Höhe ' + eh + ' px (±2), unten angedockt', m && Math.abs(m.h - eh) <= 2.5 && Math.abs(m.y + m.h - (await E(() => innerHeight))) <= 1.5, m && [m.y, m.h]);
  if (vp === 'P3') check('P3 Marken-Blatt ab y 316, der Song-Canvas (bis ' + cvB + ') bleibt frei', m && Math.abs(m.y - 316) <= 2 && m.y >= cvB, [m && m.y, cvB]);
  await p.screenshot({path: `v3-qa-v2e/lay-${vp}-b.png`});
  // second tap → bar selection in the mark → Bereich-Leiste
  await T.tapCv(4 * 36 + 10, 8);
  m = await E(`${MEAS}('#rangeBar')`);
  console.log(vp, 'rangeBar', JSON.stringify(m));
  check(vp + ' Bereich-Leiste im Bild, Texte passen, Treffer ok', m && !m.bad.length && !m.small.length && !m.hs, m);
  if (P) check(vp + ' N7S-36 Bereich-Leiste so hoch wie die Träger-Leiste (P1 56 px ±1), gleiche Stelle', m && Math.abs(m.h - carR.h) <= 1 && Math.abs(m.y - carR.y) <= 1 && (vp !== 'P1' || Math.abs(m.h - 56) <= 1), [m && m.y, m && m.h, carR]);
  if (P) { const bw = await E(() => [...document.querySelectorAll('#rangeBar button')].filter(x => x.offsetWidth).map(x => +x.getBoundingClientRect().width.toFixed(1)));
    const ew = {P1: [6, 58], P2: [6, 56], P3: [5, 52]}[vp]; check(vp + ' Bereich-Leiste ' + ew[0] + ' × ≥ ' + ew[1] + ' px', bw.length === ew[0] && bw.every(x => x >= ew[1] - 3), bw); }
  await p.screenshot({path: `v3-qa-v2e/lay-${vp}-c.png`});
  // ⋯ → Akkorde quantisieren …
  await T.tapSel('#rangeBar [data-a="more"]');
  m = await E(`${MEAS}('#popLayer .pop')`);
  check(vp + ' ⋯-Menü im Bild, Treffer ok', m && !m.bad.length && !m.small.length, m);
  await T.tapPop('Akkorde quantisieren');
  m = await E(`${MEAS}('#popLayer .pop')`);
  console.log(vp, 'quant', JSON.stringify(m), await T.pop());
  check(vp + ' Akkord-Quantisieren-Blatt im Bild, Treffer ok', m && !m.bad.length && !m.small.length && !m.hs, m);
  await p.screenshot({path: `v3-qa-v2e/lay-${vp}-d.png`});
  await E(() => window.SYNQUENZER.closePop ? window.SYNQUENZER.closePop() : null);
  await E(() => { const x = document.querySelector('#popLayer .pop .rb[data-a="x"], #popLayer .pop .ms-x'); if (x) x.click(); });
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  // Start-Blatt (selection T5)
  await E(() => { window.SYNQUENZER.songSelect(4, 4); });
  await E(() => window.SYNQUENZER.openRecStart()); await p.waitForTimeout(250);
  m = await E(`${MEAS}('#popLayer .pop.rstart')`);
  console.log(vp, 'rstart', JSON.stringify(m));
  check(vp + ' Start-Blatt im Bild, Treffer ok', m && !m.bad.length && !m.small.length && !m.hs, m);
  await p.screenshot({path: `v3-qa-v2e/lay-${vp}-e.png`});
  await p.keyboard.press('Escape'); await E(() => { const x = document.querySelector('.pop.rstart .rs-x'); if (x) x.click(); }); await p.waitForTimeout(200);
  // Ersetzen/Einfügen-Blatt (Strophe at bar 7: content behind)
  await E(() => { window.SYNQUENZER.songSelect(null); window.SYNQUENZER.placeAt('P1', 6); }); await p.waitForTimeout(250);
  m = await E(`${MEAS}('#popLayer .pop.plsheet')`);
  console.log(vp, 'plsheet', JSON.stringify(m));
  check(vp + ' Ersetzen/Einfügen-Blatt im Bild, Treffer ok', m && !m.bad.length && !m.small.length && !m.hs, m);
  await p.screenshot({path: `v3-qa-v2e/lay-${vp}-f.png`});
  check(vp + ' 0 Konsolenfehler', !errs.length, errs);
  await b.close();
}
process.exit(done() ? 1 : 0);
