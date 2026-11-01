// I2-50 ◀ ▶: Reihenfolge Zeit, dann Tonhöhe (Akkordtöne einzeln); jeder Schritt wählt, spielt, holt ins Bild; Enden blass;
// in ROLLE (Synth-Clip, MELODIE, eigener Song-Clip) und LAUF. Bedienung über echte Touch-Tipps auf die Knöpfe.
const L = require('./lib.cjs');
const rows = [], ok = (id, c, txt) => rows.push({id, ok: !!c, txt});
// Noten absichtlich unsortiert; Akkord bei t 1 (67, 60, 64); eine Note weit oben/rechts (n 93, t 7) muss ins Bild geholt werden
const NOTES = [{t: 1, n: 67, v: .6}, {t: 0, n: 62, v: .4}, {t: 1, n: 60, v: .7}, {t: 1, n: 64, v: .5}, {t: 7, n: 93, v: .9}, {t: 3, n: 48, v: .3}];
const WANT = NOTES.slice().sort((a, b) => a.t - b.t || a.n - b.n).map(n => n.t + ':' + n.n);
async function spy(p) { await p.evaluate(() => { window.__AU = []; const f = window.auditionStart; window.auditionStart = function (t, n, v) { __AU.push({n, v}); return f.apply(this, arguments); }; }); }
const btnBox = (p, sel) => p.evaluate(s => { const b = document.querySelector(s); if (!b || b.hidden) return null; const r = b.getBoundingClientRect(), cs = getComputedStyle(b);
  return {x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, dis: b.disabled, op: +cs.opacity}; }, sel);
async function rollRun(p, name, notesOf) {
  await p.evaluate(() => { ED.roll.setTool('vel'); ED.roll.select([]); ED.roll.centerOn(50); });
  await p.waitForTimeout(150); await spy(p);
  const seen = [], heard = [], vis = [];
  const b0 = await btnBox(p, '.vnav[aria-label="Vorige Note"]');
  for (let k = 0; k < WANT.length; k++) {
    const nb = await btnBox(p, '.vnav[aria-label="Nächste Note"]');
    if (!nb) { ok('I2-50', false, name + ': ▶ nicht sichtbar'); return; }
    await L.tap(p, nb.x, nb.y); await p.waitForTimeout(90);
    const r = await p.evaluate(notesOf);
    seen.push(r.sel); heard.push(r.au); vis.push(r.vis);
  }
  const endN = await btnBox(p, '.vnav[aria-label="Nächste Note"]'), endP0 = await btnBox(p, '.vnav[aria-label="Vorige Note"]');
  ok('I2-50', JSON.stringify(seen) === JSON.stringify(WANT), `${name}: ▶ × ${WANT.length} → ${seen.join(' ')} (Soll ${WANT.join(' ')})`);
  ok('I2-50', heard.every((h, k) => h && h.n === +WANT[k].split(':')[1]), `${name}: jeder Schritt spielt die gewählte Note (${heard.map(h => h ? h.n + '@' + Math.round(h.v * 127) : '–').join(' ')})`);
  ok('I2-50', vis.every(v => v), `${name}: jede gewählte Note im Bild (Taste und Block sichtbar): ${vis.map(v => v ? '✓' : '✗').join('')}`);
  ok('I2-50', b0 && b0.dis && b0.op < .6 && endN.dis && endN.op < .6 && !endP0.dis,
    `${name}: Enden blass — ◀ ohne Auswahl ${b0 && b0.dis} (Deckkraft ${b0 && b0.op}), ▶ am Ende ${endN.dis} (${endN.op}); ◀ dort aktiv ${!endP0.dis}`);
  ok('I2-50', b0 && b0.w >= 44 && b0.h >= 36 && endN.w >= 44, `${name}: ◀ ▶ ${b0 && b0.w.toFixed(0)}×${b0 && b0.h.toFixed(0)} px (≥ 44 breit, Leistenhöhe)`);
  // zurück ◀ bis zum Anfang
  const back = [];
  for (let k = 0; k < WANT.length - 1; k++) { const pb = await btnBox(p, '.vnav[aria-label="Vorige Note"]'); await L.tap(p, pb.x, pb.y); await p.waitForTimeout(70); back.push((await p.evaluate(notesOf)).sel); }
  const pe = await btnBox(p, '.vnav[aria-label="Vorige Note"]');
  ok('I2-50', JSON.stringify(back) === JSON.stringify(WANT.slice(0, -1).reverse()) && pe.dis, `${name}: ◀ rückwärts ${back.join(' ')}; am Anfang blass ${pe.dis}`);
}
(async () => {
  const b = await L.launch(); const p = await L.open(b, 'P1');
  // gemeinsamer Auswerter: gewählte Note (genau eine), letzte Vorhör-Note, Sichtbarkeit von Taste und Block
  const notesOf = () => {
    const R = ED.roll, sel = R.selection;
    const n = sel[0], au = __AU[__AU.length - 1] || null; __AU.length = 0;
    if (sel.length !== 1) return {sel: 'Auswahl ' + sel.length, au, vis: false};
    const k = R._keyRow(n.n), xy = R._xy(n.t + Math.min(n.d, .25) / 2, n.n), cv = R.el.main.getBoundingClientRect();
    return {sel: n.t + ':' + n.n, au, vis: k.vis && xy.x >= cv.left && xy.x <= cv.right && xy.y >= cv.top && xy.y <= cv.bottom};
  };
  // 1) ROLLE, Synth-Clip (2 Takte)
  await L.rollWith(p, NOTES, {len: 2}); await p.waitForTimeout(250);
  await rollRun(p, 'ROLLE Synth', notesOf);
  // 2) MELODIE
  await p.evaluate(ns => { closeSheets(); openMelodyRoll(); const m = curMel(S.song); m.len = 2; m.notes = ns.map(n => Object.assign({d: .5}, n)); songChanged(); ED.roll.refresh(); }, NOTES);
  await p.waitForTimeout(250);
  await rollRun(p, 'ROLLE MELODIE', notesOf);
  // 3) eigener Song-Clip
  const own = await p.evaluate(ns => {
    closeSheets(); const t = 1; S.tracks[t].clips[0] = {len: 2, key: {root: 0, scale: 'ionian', src: 'auto'}, notes: ns.map(n => Object.assign({d: .5}, n))}; clipChanged(t, 0);
    S.song = newSongRaw(); S.song.bars = 2; S.song.lanes[t] = [{bar: 0, slot: 0}]; songChanged();
    const id = makeOwn(t, 0, true); if (!id) return 'kein eigener Clip';
    const ok = openOwnRoll(t, 0); return ok ? id : 'öffnen fehlgeschlagen';
  }, NOTES);
  await p.waitForTimeout(250);
  const head = await p.evaluate(() => ED.rollAt && ED.rollAt.own ? 'own ' + ED.rollAt.own : JSON.stringify(ED.rollAt));
  ok('I2-50', /^own /.test(head), 'eigener Clip offen: ' + head + ' (' + own + ')');
  await rollRun(p, 'ROLLE eigener Clip', notesOf);
  // 4) LAUF (Synth-Clip, 1/16-Raster): ◀ ▶ erscheinen erst mit gewähltem Schritt
  const lf = await p.evaluate(() => {
    closeSheets(); const t = 1;
    S.tracks[t].clips[0] = {len: 1, key: {root: 0, scale: 'ionian', src: 'auto'}, notes: [{t: 0, n: 60, v: .5, d: .25}, {t: .5, n: 64, v: .6, d: .25}, {t: 1.25, n: 67, v: .7, d: .25}, {t: 3.75, n: 72, v: .8, d: .25}]};
    clipChanged(t, 0); ROLLP.view = 'lauf'; openRoll(t, 0); LAUF.sel = -1; laufNavUpd();
    return {lauf: !!ED.lauf, hid: LNAV && LNAV.p.hidden && LNAV.n.hidden};
  });
  ok('I2-50', lf.lauf && lf.hid, `LAUF offen ${lf.lauf}; ohne gewählten Schritt ◀ ▶ verborgen ${lf.hid}`);
  await p.evaluate(() => { LAUF.sel = 0; laufNavUpd(); }); await spy(p);
  const lbox = async dir => p.evaluate(d => { const b = d < 0 ? LNAV.p : LNAV.n, r = b.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, dis: b.disabled, op: +getComputedStyle(b).opacity, hid: b.hidden}; }, dir);
  const p0 = await lbox(-1);
  const ls = [], la = [], pg = [];
  for (let k = 0; k < 3; k++) { const n = await lbox(1); await L.tap(p, n.x, n.y); await p.waitForTimeout(80);
    const r = await p.evaluate(() => { const a = __AU[__AU.length - 1] || null; __AU.length = 0; return {sel: LAUF.sel, page: LAUF.page, per: ED.lauf.per, au: a}; });
    ls.push(r.sel); la.push(r.au ? r.au.n : null); pg.push(Math.floor(r.sel / r.per) === r.page); }
  const nE = await lbox(1);
  ok('I2-50', JSON.stringify(ls) === '[2,5,15]' && JSON.stringify(la) === '[64,67,72]', `LAUF ▶: Schritte ${ls.join(' ')} (Soll 2 5 15), gespielt ${la.join(' ')}`);
  ok('I2-50', pg.every(Boolean), 'LAUF: Seite folgt dem gewählten Schritt (ins Bild): ' + pg.map(x => x ? '✓' : '✗').join(''));
  ok('I2-50', p0.dis && p0.op < .6 && nE.dis && nE.op < .6, `LAUF Enden blass: ◀ am Anfang ${p0.dis} (${p0.op}), ▶ am Ende ${nE.dis} (${nE.op})`);
  ok('I2-50', p0.w >= 44 && p0.h >= 36, `LAUF ◀ ▶ ${p0.w.toFixed(0)}×${p0.h.toFixed(0)} px`);
  const bk = await lbox(-1); await L.tap(p, bk.x, bk.y); await p.waitForTimeout(80);
  const s2 = await p.evaluate(() => LAUF.sel); ok('I2-50', s2 === 5, 'LAUF ◀ von 15 → ' + s2 + ' (Soll 5)');
  ok('I2-50', !p.errs.length, 'Konsolenfehler: ' + p.errs.length + ' ' + p.errs.slice(0, 2).join(' | '));
  await b.close(); process.exitCode = L.report('I2-50', rows) ? 1 : 0;
})();
