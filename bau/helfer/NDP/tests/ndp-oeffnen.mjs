// Platte öffnen/schließen in 428×926, 926×428, 428×650: über den Kopf-Knopf (echter Touch), alles im Bild, Treffer ≥ 44 px,
// kein waagrechtes Scrollen, in jeder Ansicht (GERÄT, jede Sektion normal + ZOOM, SPIEL); ✕ zurück zum Drum-Editor; Drehen baut neu
import {launch, open, info, tap, ctr, hit, tapA, shot, report, FMT} from './ndp-lib.mjs';
const b = await launch(), rows = [];
const check = (I, tag) => {
  const bad = I.hits.filter(h => h.w < 44 - .01 || h.h < 44 - .01).map(h => h.a + (h.k ? ':' + h.k : '') + ' ' + h.w + '×' + h.h);
  const out = I.hits.filter(h => h.x < -.5 || h.y < -.5 || h.x + h.w > I.frame.w + .5 || h.y + h.h > I.frame.h + .5).map(h => h.a);
  const scroll = I.docScrollW > I.frame.w + .5 || I.scrollW > I.clientW + .5;
  rows.push({n: tag + ': Treffer ≥ 44 px', ok: !bad.length, d: bad.slice(0, 4).join(', ')});
  rows.push({n: tag + ': alles im Bild, kein waagrechtes Scrollen', ok: !out.length && !scroll, d: out.join(',') + (scroll ? ' scroll ' + I.docScrollW : '')});
};
// Überlappung: kein Bedienelement liegt über einem anderen
const overlap = I => { const H = I.hits.filter(h => h.a !== 'free'), o = []; for (let i = 0; i < H.length; i++) for (let j = i + 1; j < H.length; j++) { const a = H[i], c = H[j];
  const ix = Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x), iy = Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y); if (ix > 1 && iy > 1) o.push(a.a + '/' + c.a); } return o; };
for (const f of Object.keys(FMT)) {
  const p = await open(b, f), tag = f + ' ' + FMT[f].join('×');
  const t0 = await p.evaluate(() => ({ndp: typeof NDP, loaded: SYNQUENZER.ndpInfo().loaded}));
  rows.push({n: tag + ': Block erst beim Öffnen ausgewertet', ok: t0.ndp === 'undefined' && !t0.loaded});
  await p.evaluate(() => { SYNQUENZER.selectTrack(4); SYNQUENZER.openEditor(); }); await p.waitForTimeout(200);
  const hk = await p.evaluate(() => { const e = document.querySelector('#drumSheet .ndpk'); const r = e.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height}; });
  rows.push({n: tag + ': Kopf-Knopf im Drum-Editor ≥ 44 px', ok: hk.w >= 44 && hk.h >= 44, d: hk.w + '×' + hk.h});
  await shot(p, 'editor-kopf-' + f);
  await tap(p, ...ctr(hk)); await p.waitForTimeout(400);
  let I = await info(p);
  rows.push({n: tag + ': Kopf-Knopf öffnet die Platte', ok: I.open && I.view === 'geraet'});
  const vis = await p.evaluate(() => getComputedStyle(document.getElementById('app')).visibility);
  rows.push({n: tag + ': Hauptschirm unter der Platte verdeckt (nicht gemalt)', ok: vis === 'hidden'});
  check(I, tag + ' GERÄT'); const ov = overlap(I); rows.push({n: tag + ' GERÄT: nichts überlappt', ok: !ov.length, d: ov.slice(0, 3).join(' ')});
  await shot(p, 'platte-' + f);
  for (const s of ['tone', 'noise', 'click', 'mix', 'kit']) for (const z of [false, true]) {
    I = await p.evaluate(o => SYNQUENZER.ndpView(o), {sec: s, zoom: z}); await p.waitForTimeout(60); I = await info(p);
    check(I, tag + ' ' + s + (z ? ' ZOOM' : '')); const o2 = overlap(I); if (o2.length) rows.push({n: tag + ' ' + s + (z ? ' ZOOM' : '') + ': Überlappung', ok: false, d: o2.slice(0, 3).join(' ')});
    if (f !== 'K' || s === 'tone' || s === 'kit') await shot(p, 'platte-' + f + '-' + s + (z ? '-zoom' : ''));
  }
  await p.evaluate(() => SYNQUENZER.ndpView({sec: 'tone', zoom: false}));
  await tapA(p, 'SPIEL'); await p.waitForTimeout(150).catch(() => {});
  I = await info(p); if (I.view !== 'spiel') { await p.evaluate(() => SYNQUENZER.ndpView({view: 'spiel'})); I = await info(p); }
  check(I, tag + ' SPIEL'); await shot(p, 'spiel-' + f);
  await p.evaluate(() => SYNQUENZER.ndpView({view: 'geraet'}));
  // ✕
  const x = (await info(p)).hits.find(h => h.a === 'ndpx'); await tap(p, ...ctr(x)); await p.waitForTimeout(250);
  const after = await p.evaluate(() => ({open: SYNQUENZER.ndpInfo().open, ed: document.getElementById('drumSheet').classList.contains('open'), vis: getComputedStyle(document.getElementById('app')).visibility}));
  rows.push({n: tag + ': ✕ schließt, Drum-Editor wieder da', ok: !after.open && after.ed && after.vis === 'visible', d: JSON.stringify(after)});
  // Knopf „North-Platte“ auf der SOUND-Seite eines Modell-Pads
  const np = await p.evaluate(() => { const e = document.querySelector('#drumSheet .ndpopen'); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height, iw: innerWidth}; });
  rows.push({n: tag + ': Knopf „North-Platte“ im Drum-Editor sichtbar, ≥ 44 px', ok: !!np && np.w >= 44 && np.h >= 44 && np.x + np.w <= np.iw + .5, d: JSON.stringify(np)});
  await shot(p, 'editor-sound-' + f);
  if (np) { await tap(p, np.x + np.w / 2, np.y + np.h / 2); await p.waitForTimeout(300); rows.push({n: tag + ': „North-Platte“ öffnet', ok: (await info(p)).open}); }
  // Drehen: neu aufgebaut im anderen Format
  const [w, h] = FMT[f]; await p.setViewportSize({width: h, height: w}); await p.waitForTimeout(400);
  I = await info(p); rows.push({n: tag + ': Drehen → ' + (I.land ? 'Querformat' : 'Hochformat') + ' neu aufgebaut', ok: I.open && I.land === (h > w)}); check(I, tag + ' gedreht');
  await p.keyboard.press('Escape'); await p.waitForTimeout(150); rows.push({n: tag + ': Esc schließt', ok: !(await info(p)).open});
  rows.push({n: tag + ': keine Konsolenfehler', ok: !p.errs.length, d: p.errs.join(' | ').slice(0, 300)});
  await p.ctx.close();
}
await b.close();
process.exit(report(rows) ? 0 : 1);
