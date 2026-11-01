// Bilder für Xander: ROLLE mit Füllhöhe, Werkzeug ⇕, Anschlag-Leiste [◀] [VEL ⇕] [▶] und gefüllter Taste (P1, 428×926, L1)
const L = require('./lib.cjs'), path = require('path');
(async () => {
  const b = await L.launch();
  for (const f of ['P1', 'XH', 'L1']) {
    const p = await L.open(b, f, {dpr: 2});
    await L.rollWith(p, [{t: 0, n: 60, v: .3}, {t: .5, n: 62, v: .55}, {t: 1, n: 64, v: .8}, {t: 1.5, n: 65, v: 1}, {t: 2, n: 67, v: .5, d: 1}, {t: 3, n: 64, v: .1}]);
    await p.waitForTimeout(300);
    await p.evaluate(() => { ED.roll.setTool('vel'); ED.roll.centerOn(64); ED.roll.select([S.tracks[1].clips[0].notes[2]]); });
    await p.waitForTimeout(250);
    const out = path.resolve(__dirname, '..', 'bilder', 'i2f-rolle-' + f + '.png');
    require('fs').mkdirSync(path.dirname(out), {recursive: true});
    await p.screenshot({path: out}); console.log(out);
    await p.ctx.close();
  }
  await b.close();
})();
