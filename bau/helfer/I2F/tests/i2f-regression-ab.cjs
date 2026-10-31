// I2f-Regression A/B: dieselben Gesten in der Grundlage (G-T-merge-fix, 4.24.0) und in I2F → gleiche Clips.
// ROLLE ✎ zeichnen, ⬚ verschieben, Länge, ⌫ radieren, VEL-Leiste ziehen; Undo; keine Konsolenfehler.
const L = require('./lib.cjs'), path = require('path');
const BASE = path.resolve(__dirname, '..', '..', '..', 'snapshots', 'G-T-merge-fix.html');
const rows = [], ok = (id, c, txt) => rows.push({id, ok: !!c, txt});
async function run(b, file, f) {
  const p = await L.open(b, f, {file}), log = [];
  await L.rollWith(p, [{t: 0, n: 60, v: .5, d: 1}, {t: 2, n: 64, v: .7, d: 1}]); await p.waitForTimeout(250);
  await p.evaluate(() => { ED.roll.centerOn(62); ED.roll.setGrid && ED.roll.setGrid(.25); }); await p.waitForTimeout(120);
  const xy = (bt, n) => p.evaluate(([x, y]) => ED.roll._xy(x, y), [bt, n]);
  const snap = () => p.evaluate(() => JSON.stringify(S.tracks[1].clips[0].notes.map(n => [n.t, n.n, n.d, n.v])));
  // ✎ Tipp auf leere Stelle
  await p.evaluate(() => ED.roll.setTool('draw')); let a = await xy(1.1, 62); await L.tap(p, a.x, a.y); await p.waitForTimeout(120); log.push(await snap());
  // ⬚ verschieben (Note 64 um ~1 Schlag nach rechts, 2 Zeilen hoch)
  await p.evaluate(() => ED.roll.setTool('select')); a = await xy(2.3, 64); const a2 = await xy(3.3, 65);
  await L.touch(p, L.line(a.x, a.y, a2.x, a2.y, 14)); await p.waitForTimeout(150); log.push(await snap());
  // VEL-Leiste: Ziehen auf der Stufe von Note 60
  const v = await p.evaluate(() => ED.roll._vel(0, .5));
  await p.evaluate(() => ED.roll.select([]));
  await L.touch(p, L.line(v.x, v.y, v.x, v.y - 12, 6)); await p.waitForTimeout(120); log.push(await snap());
  // ⌫ radieren auf Note 60
  await p.evaluate(() => ED.roll.setTool('erase')); a = await xy(.3, 60); await L.tap(p, a.x, a.y); await p.waitForTimeout(120); log.push(await snap());
  // Undo × 2
  await p.evaluate(() => { undo(); undo(); }); await p.waitForTimeout(120); log.push(await snap());
  const errs = p.errs.slice(); await p.ctx.close(); return {log, errs};
}
(async () => {
  const b = await L.launch();
  for (const f of ['P1', 'L1']) {
    const A = await run(b, BASE, f), B = await run(b, L.FILE, f);
    const names = ['✎ zeichnen', '⬚ verschieben', 'VEL-Leiste', '⌫ radieren', 'Undo ×2'];
    names.forEach((nm, k) => ok('R28', A.log[k] === B.log[k], `${f} ${nm}: Grundlage ${A.log[k]} · I2F ${B.log[k] === A.log[k] ? 'gleich' : B.log[k]}`));
    ok('R28', !A.errs.length && !B.errs.length, `${f} Konsolenfehler Grundlage ${A.errs.length}, I2F ${B.errs.length} ${B.errs.slice(0, 2).join(' | ')}`);
  }
  await b.close(); process.exitCode = L.report('I2f-Regression A/B', rows) ? 1 : 0;
})();
