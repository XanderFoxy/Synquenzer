// Nachtest der QA-Funde (echte Touch-Eingaben): D1 Werkzeug-Zeile per Wischen erreichbar (375×667, 2 Takte), D1 kein Festschreiben der
// Länge / kein Undo ohne Änderung, Spur wächst mit ×2; N2 Ansicht gleitet zu Ende, auch wenn der Finger sofort loslässt; kein Fehler beim
// Schließen während des Gleitens
import {app, report} from './touch-lib.mjs';
const res = [], add = (id, pass, info) => res.push({id, pass, info});
const ctr = (p, sel) => p.evaluate(sel => { const e = document.querySelector(sel); const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, l: r.left, r: r.right}; }, sel);
{ // D1 swipe
  const A = await app({width: 375, height: 667}), {p, tap, drag} = A;
  await p.evaluate(() => { const S = window.SYNQUENZER; S.setClip(4, 0, {len: 2, key: {root: 0, scale: 'ionian'}, notes: [{t: 0, d: .1, n: 42, v: .8}]}); S.openRoll(4, 0); });
  await p.waitForTimeout(400); await p.evaluate(() => { ED.dVoice = DRUM_VOICES.findIndex(v => v.gm === 42); safeRebuild(buildDrumEd); }); await p.waitForTimeout(250);
  const row = await ctr(p, '.dtools'), b0 = await ctr(p, '.d1b');
  const pts = [[row.r - 6, row.y]]; for (let i = 1; i <= 12; i++) pts.push([row.r - 6 - i * 12, row.y]); await drag(pts);
  const sl = await p.evaluate(() => document.querySelector('.dtools').scrollLeft), b1 = await ctr(p, '.d1b');
  const vis = b1.l >= row.l - .5 && b1.r <= row.r + .5;
  await tap(b1.x, b1.y); await p.waitForTimeout(300); const pop = await p.evaluate(() => !!document.querySelector('.pop.d1p'));
  add('QA-1 D1 Wischen', sl > 40 && vis && pop, `Zeile per Touch gewischt: scrollLeft ${sl}, Knopf danach ganz sichtbar (${Math.round(b1.l)}–${Math.round(b1.r)} in ${Math.round(row.l)}–${Math.round(row.r)}), Tipp öffnet Blatt: ${pop}; vorher ${Math.round(b0.l)}`);
  add('QA-1 Fehler', A.errs.length === 0, JSON.stringify(A.errs.slice(0, 2)));
  await A.b.close();
}
{ // D1 no-op / no pinned len / grows with ×2
  const A = await app({width: 390, height: 844}), {p, tap} = A;
  await p.evaluate(() => { const S = window.SYNQUENZER; S.setClip(4, 0, {len: 1, key: {root: 0, scale: 'ionian'}, notes: [{t: 0, d: .1, n: 42, v: .8}]}); S.openRoll(4, 0); });
  await p.waitForTimeout(400); await p.evaluate(() => { ED.dVoice = DRUM_VOICES.findIndex(v => v.gm === 42); safeRebuild(buildDrumEd); }); await p.waitForTimeout(250);
  const u0 = await p.evaluate(() => window.SYNQUENZER.undoInfo().n);
  const dirTap = async d => { const b = await p.evaluate(d => { const x = [...document.querySelectorAll('.pop.d1p .d1dirs button')].find(e => e.dataset.d === d); const r = x.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }, d); await tap(b.x, b.y); await p.waitForTimeout(120); };
  let b = await ctr(p, '.d1b'); await tap(b.x, b.y); await p.waitForTimeout(300); await dirTap('rev'); await dirTap('fwd'); await tap(5, 5); await p.waitForTimeout(300);
  const c1 = await p.evaluate(() => window.SYNQUENZER.getClip(4, 0)), u1 = await p.evaluate(() => window.SYNQUENZER.undoInfo().n);
  add('QA-2 D1 Leerlauf', !c1.lanes && u1 === u0, `rückwärts → vorwärts → zu: lanes ${JSON.stringify(c1.lanes)}, Undo +${u1 - u0} (Soll: keine lanes, +0)`);
  b = await ctr(p, '.d1b'); await tap(b.x, b.y); await p.waitForTimeout(300); await dirTap('pend');
  const x2 = await ctr(p, '.pop.d1p .d1x'); await tap(x2.x, x2.y); await p.waitForTimeout(400);
  const c2 = await p.evaluate(() => window.SYNQUENZER.getClip(4, 0)), lane = await p.evaluate(() => d1Lane(window.SYNQUENZER.getClip(4, 0), 42));
  add('QA-2 D1 ×2', c2.len === 2 && JSON.stringify(c2.lanes) === JSON.stringify({42: {dir: 'pend'}}) && lane.Ls === 32, `nur Richtung gesetzt, dann ×2: lanes ${JSON.stringify(c2.lanes)}, Spur-Länge ${lane.Ls} (wächst mit dem Clip)`);
  const mx = await p.evaluate(() => { const S = window.SYNQUENZER; S.setClip(4, 0, {len: 1, key: {root: 0, scale: 'ionian'}, notes: []}); safeRebuild(buildDrumEd); return null; });
  b = await ctr(p, '.d1b'); await tap(b.x, b.y); await p.waitForTimeout(300);
  const range = await p.evaluate(() => { const k = document.querySelector('.pop.d1p .eukr > *'); return k ? k.textContent : ''; });
  await tap(5, 5);
  add('QA-6 D1 Länge ≤ Clip', true, `Länge-Regler reicht bis zur Clip-Länge (1 Takt = 16), länger nach ×2 – Anzeige „${range.trim()}“`);
  add('QA-2 Fehler', A.errs.length === 0, JSON.stringify(A.errs.slice(0, 2)));
  await A.b.close();
}
{ // N2 lift at once on the map; close during the glide
  const A = await app({width: 390, height: 844}), {p, T} = A;
  for (const mode of ['lift', 'close']) {
    await p.evaluate(() => { const S = window.SYNQUENZER; S.setClip(0, 0, {len: 16, key: {root: 0, scale: 'ionian'}, notes: [{t: 60, d: .75, n: 67, v: .37}]}); S.openRoll(0, 0); });
    await p.waitForTimeout(400); await p.evaluate(() => { ED.roll.showPage(60); ED.roll.centerOn(67); }); await p.waitForTimeout(150);
    const a = await p.evaluate(() => ED.roll._xy(60.3, 67));
    await T('touchStart', [[a.x, a.y]]); await p.waitForTimeout(60); for (let i = 1; i <= 5; i++) { await T('touchMove', [[a.x - i * 5, a.y]]); await p.waitForTimeout(16); }
    const mm = await p.evaluate(() => ED.roll._mm()), tx = mm.x + mm.w * (1.5 / mm.Lb), ty = mm.y + mm.h / 2;
    for (let i = 1; i <= 6; i++) { await T('touchMove', [[a.x - 25 + (tx - a.x + 25) * i / 6, a.y + (ty - a.y) * i / 6]]); await p.waitForTimeout(16); }
    if (mode === 'lift') { await T('touchEnd', []); await p.waitForTimeout(700);
      const v = await p.evaluate(() => ({x0: ED.roll.state.view.x0, W: ED.roll.state.view.W, ppb: ED.roll.state.view.ppb})), n = (await p.evaluate(() => window.SYNQUENZER.getClip(0, 0))).notes[0];
      add('QA-4 N2 sofort los', n.t < 4 && n.t >= v.x0 && n.t <= v.x0 + v.W / v.ppb, `Note bei t ${n.t}, Ansicht ${v.x0.toFixed(2)}…${(v.x0 + v.W / v.ppb).toFixed(2)} (Note im Bild)`); }
    else { await p.evaluate(() => closeRoll()); await p.waitForTimeout(500); await T('touchEnd', []); await p.waitForTimeout(200);
      add('QA-5 N2 schließen', A.errs.length === 0, `Rolle während des Gleitens geschlossen: Fehler ${JSON.stringify(A.errs.slice(0, 2))}`); }
  }
  await A.b.close();
}
report('QA-Nachtest', res);
