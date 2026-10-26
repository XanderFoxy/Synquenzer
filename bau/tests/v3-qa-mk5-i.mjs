// QA MK5 probe I: transport start (▶) while a held chord arpeggiates on the free grid: no burst / double step, no long gap
import { browser, T, ok, J } from './v3-qa-mk5-lib.mjs';
await T('Start', async page => {
  const r = await page.evaluate(async () => {
    const out = [];
    for (let k = 0; k < 4; k++) {
      H.reset(); H.Q.setBpm(120); H.arp({on: 1, res: 1, gate: 50, ks: k % 2}); await H.sl(40 + 37 * k); H.keys([60, 64, 67]); await H.sl(430 + 41 * k);
      const tPlay = H.now(); H.Q.play(); await H.sl(900); H.up([60, 64, 67]); await H.sl(60); H.Q.stop();
      const L = H.log(); const d = L.slice(1).map((x, j) => +((x.t - L[j].t) * 1000).toFixed(1));
      out.push({ks: k % 2, d, tPlay: +((tPlay - L[0].t) * 1000).toFixed(0), notes: L.map(x => x.note).join(' ')});
    }
    return out;
  });
  for (const x of r) ok('Transport-Start bei gehaltenem Akkord (KEY SYNC ' + x.ks + '): kein Abstand < ½ Schritt, keiner > 1½ Schritte', x.d.length > 8 && x.d.every(v => v >= 62.5 && v <= 187.5), 'Abstände ' + x.d.join(' ') + ' (▶ bei ' + x.tPlay + ' ms) Noten ' + x.notes);
});
await browser.close();
