// I2-48 Werkzeug ⇕: 100 px → +0,50; VEL-Feld 100 px → +0,50; Fein-Modus ×¼; drei gewählte Noten gleiches Δ (geklemmt);
// kein Verschieben; ein Undo „Anschlag“; Rastpunkte VEL 6 / 127; Tippen = wählen (Auswahl bleibt) + hören
const L = require('./lib.cjs');
const rows = [], ok = (id, c, txt) => rows.push({id, ok: !!c, txt});
const f2 = x => +x.toFixed(3);
(async () => {
  const b = await L.launch(); const p = await L.open(b, 'P1');
  await L.rollWith(p, [{t: 0, n: 60, v: .3, d: 1}, {t: 1, n: 64, v: .8, d: 1}, {t: 2, n: 67, v: .1, d: 1}, {t: 3, n: 62, v: .5, d: 1}]);
  await p.waitForTimeout(300);
  await p.evaluate(() => { ED.roll.setTool('vel'); ED.roll.centerOn(63); });
  await p.waitForTimeout(200);
  const xy = (beat, n) => p.evaluate(([b2, n2]) => ED.roll._xy(b2, n2), [beat, n]);
  const st = () => p.evaluate(() => ({notes: S.tracks[1].clips[0].notes.map(n => ({t: n.t, n: n.n, v: n.v, d: n.d})), undo: UNDO.length, lbl: UNDO.length ? UNDO[UNDO.length - 1].label : null, sel: ED.roll.state.sel}));
  // 1) 100 px hoch auf Note 0 (v .3)
  let a = await xy(0.4, 60), s0 = await st();
  await L.touch(p, L.line(a.x, a.y, a.x, a.y - 100, 20));
  await p.waitForTimeout(150); let s1 = await st();
  const n0 = s1.notes.find(n => n.n === 60);
  ok('I2-48', Math.abs(n0.v - .3 - .5) <= .01, `100 px hoch: v ${s0.notes[0].v} → ${n0.v} (Δ ${f2(n0.v - .3)}, Soll +0,50 ± 0,01)`);
  ok('I2-48', s1.undo === s0.undo + 1 && /Anschlag/.test(s1.lbl), `ein Undo-Schritt: ${s0.undo} → ${s1.undo}, Bezeichnung „${s1.lbl}“`);
  ok('I2-48', JSON.stringify(s1.notes.map(n => [n.t, n.n, n.d])) === JSON.stringify(s0.notes.map(n => [n.t, n.n, n.d])), 'kein Verschieben (t, n, d unverändert)');
  await p.evaluate(() => undo()); await p.waitForTimeout(100);
  const su = await st(); ok('I2-48', su.notes.find(n => n.n === 60).v === .3, 'Undo stellt v 0,3 wieder her: ' + su.notes.find(n => n.n === 60).v);
  // 2) Fein-Modus: erst 70 px waagrecht, dann 100 px hoch → ×¼
  a = await xy(0.4, 60);
  const pts = L.line(a.x, a.y, a.x + 70, a.y, 7).concat(L.line(a.x + 70, a.y, a.x + 70, a.y - 100, 20).slice(1));
  await L.touch(p, pts); await p.waitForTimeout(150); s1 = await st();
  const nf = s1.notes.find(n => n.n === 60);
  ok('I2-48', Math.abs(nf.v - .3 - .125) <= .01, `Fein-Modus (70 px seitlich, 100 px hoch): Δ ${f2(nf.v - .3)} (Soll +0,125 ± 0,01)`);
  await p.evaluate(() => undo());
  // 3) drei gewählte Noten (v .3 .8 .1): +0,5 → 0,8 / 1,0 (geklemmt) / 0,6
  await p.evaluate(() => { const ns = S.tracks[1].clips[0].notes; ED.roll.select(ns.filter(n => n.n !== 62)); });
  a = await xy(1.4, 64); const b3 = await st();
  await L.touch(p, L.line(a.x, a.y, a.x, a.y - 100, 20)); await p.waitForTimeout(150); s1 = await st();
  const g = n => s1.notes.find(x => x.n === n).v;
  ok('I2-48', g(60) === .8 && g(64) === 1 && g(67) === .6 && g(62) === .5 && s1.sel === 3 && s1.undo === b3.undo + 1,
    `drei gewählte: 0,3→${g(60)} · 0,8→${g(64)} (geklemmt) · 0,1→${g(67)}; ungewählt 0,5→${g(62)}; Auswahl ${s1.sel}; Undo +${s1.undo - b3.undo}`);
  // 4) VEL-Feld 100 px hoch (gleiche Skala) auf die drei: 1,0 bleibt, 0,8→1,0, 0,6→1,0 … daher erst Undo und dann runter
  await p.evaluate(() => { undo(); const ns = S.tracks[1].clips[0].notes; ED.roll.select(ns.filter(n => n.n !== 62)); }); await p.waitForTimeout(80);   // Undo ersetzt die Noten-Objekte: neu wählen
  const fr = await p.evaluate(() => { const r = ED.roll.el.acts.querySelector('.vfld').getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height}; });
  const b4 = await st();
  await L.touch(p, L.line(fr.x, fr.y, fr.x, fr.y - 100, 20)); await p.waitForTimeout(150); s1 = await st();
  ok('I2-48', g(60) === .8 && g(67) === .6 && g(64) === 1 && s1.undo === b4.undo + 1 && /Anschlag/.test(s1.lbl),
    `VEL-Feld 100 px hoch: 0,3→${g(60)} (Δ ${f2(g(60) - .3)}), 0,1→${g(67)}, 0,8→${g(64)}; ein Undo „${s1.lbl}“; Feld ${fr.w.toFixed(0)}×${fr.h.toFixed(0)} px`);
  const fTxt = await p.evaluate(() => ED.roll.el.acts.querySelector('.vfld').textContent);
  ok('I2-48', fTxt === 'VEL ' + Math.round(.8 * 127) + ' ⇕', 'Feld zeigt die erste gewählte Note: „' + fTxt + '“');
  // 5) Rastpunkte: weit hoch → VEL 127, weit runter → VEL 6
  await p.evaluate(() => { ED.roll.select([S.tracks[1].clips[0].notes.find(n => n.n === 62)]); });
  a = await xy(3.4, 62);
  await L.touch(p, L.line(a.x, a.y, a.x, Math.max(5, a.y - 260), 26)); await p.waitForTimeout(120); s1 = await st();
  const hi = g(62);
  a = await xy(3.4, 62);
  await L.touch(p, L.line(a.x, a.y, a.x, a.y + 300, 30)); await p.waitForTimeout(120); s1 = await st();
  const lo = g(62);
  ok('I2-48', Math.round(hi * 127) === 127 && Math.round(lo * 127) === 6, `Rastpunkte: hoch → VEL ${Math.round(hi * 127)} (v ${hi}), runter → VEL ${Math.round(lo * 127)} (v ${lo})`);
  // 6) Tippen auf eine gewählte Note: Auswahl bleibt; auf eine ungewählte: nur sie
  await p.evaluate(() => { const ns = S.tracks[1].clips[0].notes; ED.roll.select(ns.filter(n => n.n === 60 || n.n === 64)); });
  a = await xy(0.4, 60); await L.tap(p, a.x, a.y); await p.waitForTimeout(120); const sa = (await st()).sel;
  a = await xy(2.4, 67); await L.tap(p, a.x, a.y); await p.waitForTimeout(120); const sb = (await st()).sel;
  ok('I2-48', sa === 2 && sb === 1, `Tippen: Teil der Auswahl → Auswahl bleibt (${sa}); andere Note → nur sie (${sb})`);
  // 7) Haptik nie aus dem Ziehen (A.8 H2): Spion
  await p.evaluate(() => { window.__H = 0; const h = window.haptic; window.haptic = k => { __H++; return h(k); }; });
  a = await xy(2.4, 67); await L.touch(p, L.line(a.x, a.y, a.x, a.y - 80, 16)); await p.waitForTimeout(100);
  const hN = await p.evaluate(() => __H); ok('I2-48', hN === 0, 'haptic-Aufrufe beim Anschlag-Ziehen: ' + hN);
  ok('I2-48', !p.errs.length, 'Konsolenfehler: ' + p.errs.length + ' ' + p.errs.slice(0, 2).join(' | '));
  await b.close(); process.exitCode = L.report('I2-48', rows) ? 1 : 0;
})();
