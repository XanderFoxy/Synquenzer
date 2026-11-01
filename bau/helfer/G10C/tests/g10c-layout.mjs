// Layout: 428×926, 926×428, 428×650 (und 390×844, 375×667, 320×568) – ✕ immer sichtbar, Ziele ≥ 44 px, nichts abgeschnitten, GarageBand-Feld und Duplizieren erreichbar
import {boot, ok, inject, sheet} from './lib.mjs';
const OUT = process.env.OUT || '.';
for (const [w, h] of [[428, 926], [926, 428], [428, 650], [390, 844], [375, 667], [320, 568]]) {
  const {b, p, errs} = await boot({width: w, height: h});
  await p.evaluate(() => SYNQUENZER.setSong({bars: 8, lanes: []}));
  await inject(p, 7);
  await p.evaluate(() => { const st = SYNQUENZER.tkInfo().stimme, a = S.tracks[st].clips[0].audio; a.name = 'Refrain ganz lang benannt'; a.tag = 2; a.fav = true; a.alt[1].tag = 3; a.alt[0].name = 'gut'; const id = a.take; S.takes[id].cl = 60; S.takes[id].lyrics = 'la la'; S.takes[id].warp = wpNormWarp({mode: 'slice', res: '1/16', map: {src: [0, 1, 2], dst: [0, 1.1, 2]}}); });
  await sheet(p); await p.waitForTimeout(250);
  const r = await p.evaluate(() => {
    const q = document.querySelector('.pop.tksheet'), R = q.getBoundingClientRect(), x = q.querySelector('.g10c-x').getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
    const small = [...q.querySelectorAll('.g10c-hd button, .tklist button, .g10c-foot button, .savrow button')].filter(e => e.offsetParent).map(e => { const r = e.getBoundingClientRect(); return {c: e.className, w: r.width, h: r.height}; }).filter(o => o.w < 44 || o.h < 44);
    const cut = [...q.querySelectorAll('.g10c-pick b, .g10c-chips, .g10c-st, .g10c-chip, .g10c-foot button, .g10c-sum')].filter(e => e.offsetParent && e.scrollWidth > e.clientWidth + 1).map(e => e.className + ':' + e.textContent);
    const rows = [...q.querySelectorAll('.g10c-row')].map(e => e.getBoundingClientRect().height);
    return {in: R.top >= 0 && R.bottom <= vh + .5 && R.left >= 0 && R.right <= vw + .5, x: x.top >= 0 && x.bottom <= vh && x.right <= vw && x.width >= 44 && x.height >= 44, small, cut, hx: q.scrollWidth <= q.clientWidth + 1, rows: Math.min(...rows), page: document.documentElement.scrollWidth <= vw};
  });
  const tag = w + '×' + h;
  ok(r.in, tag + ': Blatt ganz im Bild');
  ok(r.x, tag + ': ✕ sichtbar, 44 px');
  ok(!r.small.length, tag + ': Touch-Ziele ≥ 44 px ' + JSON.stringify(r.small));
  ok(!r.cut.length, tag + ': nichts abgeschnitten ' + JSON.stringify(r.cut));
  ok(r.rows >= 44, tag + ': Zeilen ≥ 44 px (' + r.rows + ')');
  ok(r.hx && r.page, tag + ': kein waagrechtes Überlaufen');
  const chipsTop = await p.$$eval('.tksheet .g10c-row[data-k="0"] .g10c-chip', cs => cs.filter(c => !c.hidden).map(c => c.textContent));
  ok(chipsTop.length >= 2 && (chipsTop.includes('Q 1/16') || chipsTop.some(c => /^\+\d/.test(c))), tag + ': Chips oben ' + JSON.stringify(chipsTop));
  await p.screenshot({path: OUT + '/g10c-' + w + 'x' + h + '.png'});
  // GarageBand-Feld und „Als Chor-Stimme duplizieren“ per Bildlauf erreichbar
  for (const sel of ['.tksheet .ggb button', '.tksheet button[data-a="dup"]']) {
    const vis = await p.evaluate(sel => { const e = document.querySelector(sel); if (!e) return 'fehlt'; e.scrollIntoView({block: 'nearest'}); const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.height >= 44 ? 'ok' : JSON.stringify([r.top, r.bottom, r.height]); }, sel);
    ok(vis === 'ok', tag + ': erreichbar ' + sel + ' ' + vis);
  }
  ok(await p.evaluate(() => { const x = document.querySelector('.tksheet .g10c-x').getBoundingClientRect(); return x.top >= 0 && x.bottom <= innerHeight; }), tag + ': ✕ bleibt nach dem Bildlauf sichtbar');
  if (w === 428 && h === 650) {
    await p.evaluate(() => { document.querySelector('.tksheet .g10c-bd').scrollTop = 1e6; }); await p.waitForTimeout(80);
    await p.screenshot({path: OUT + '/g10c-428x650-unten.png'});
    await p.tap('.tksheet .g10c-row[data-k="1"] button[data-a="g10c-ed"]').catch(() => {}); await p.evaluate(() => { const e = document.querySelector('.tksheet .g10c-ed'); if (e) e.scrollIntoView({block: 'nearest'}); }); await p.waitForTimeout(80);
    await p.screenshot({path: OUT + '/g10c-428x650-bearbeiten.png'});
    const es = await p.$$eval('.tksheet .g10c-ed button, .tksheet .g10c-name', es => es.map(e => { const r = e.getBoundingClientRect(); return Math.min(r.width, r.height); }));
    ok(es.length >= 9 && Math.min(...es) >= 44, tag + ': Bearbeiten-Ziele ≥ 44 px (' + Math.min(...es) + ')');
  }
  // Schließen über ✕ (Touch)
  await p.tap('.tksheet .g10c-x'); await p.waitForTimeout(80);
  ok(await p.$('.tksheet') == null, tag + ': ✕ schließt');
  ok(errs.length === 0, tag + ': keine Fehler ' + JSON.stringify(errs));
  await b.close();
}
