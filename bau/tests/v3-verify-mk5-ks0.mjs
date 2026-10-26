// Verify (independent): KEY SYNC off (INIT) with Random through a recorded take that loops; live take vs playback passes.
// Control: the same with KEY SYNC on. Usage: node v3-verify-mk5-ks0.mjs [index.html]
import { browser, T, ok, J } from './v3-qa-mk5-lib.mjs';

for (const ks of [0, 1]) {
  await T('verify ks' + ks, async page => {
    const r = await page.evaluate(async ks => {
      const Q = H.Q;
      H.reset(); Q.setBpm(120); H.arp({on: 1, type: 4, gate: 50, ks});
      Q.setRecOptions({length: 1, countIn: false});
      R.selS = 0; ARPC.clearLog(0); Q.rec(); let w = 0; while (rec.state !== 'recording' && w++ < 400) await H.sl(10);
      const sb = rec.startBeat;
      // press the chord 60 ms before beat 1 of the take is due, hold 1.6 s (just over 3 beats), release before the bar ends
      const target = b2t(sb) - .06; while (H.now() < target - .03) await H.sl(4); while (H.now() < target) {}
      H.keys([60, 64, 67, 71]); await H.sl(1600); H.up([60, 64, 67, 71]);
      const liveL = Q.arpLog(0).map(e => ({b: +(t2b(e.t) - sb).toFixed(2), n: e.note}));
      await H.sl(700); const st1 = rec.state; Q.stop(); await H.sl(300);
      const clip = Q.getClip(0, 0);
      ARPC.clearLog(0); clearLog();
      Q.launchClip(0, 0); if (!R.playing) Q.play();
      await H.sl(4 * 4 * .5 * 1000 + 400); Q.stop(); await H.sl(150);
      const L = Q.arpLog(0).map(e => ({b: t2b(e.t), n: e.note}));
      const b0 = L.length ? Math.floor(L[0].b / 4) * 4 : 0;
      const passes = [0, 1, 2, 3].map(k => L.filter(e => e.b >= b0 + 4 * k - 1e-3 && e.b < b0 + 4 * (k + 1) - 1e-3).map(e => +(e.b - b0 - 4 * k).toFixed(2) + ':' + e.n));
      return {ks: sndOf(0).p.mk.arp.ks, st1, sb, clip: clip && clip.notes.map(n => [n.n, +n.t.toFixed(3), +n.d.toFixed(2)]), len: clip && clip.len,
        live: liveL.filter(e => e.b >= -0.01 && e.b < 4).map(e => e.b + ':' + e.n), passes};
    }, ks);
    console.log(JSON.stringify(r));
    const lv = r.live.map(x => x.split(':')[1]).join(' ');
    r.passes.forEach((p, k) => console.log(`ks ${ks} pass ${k + 1}: ` + p.map(x => x.split(':')[1]).join(' ')));
    console.log(`ks ${ks} live  : ` + lv);
    const pn = r.passes.map(p => p.map(x => x.split(':')[1]).join(' '));
    ok(`ks ${ks}: all playback passes equal`, pn.every(x => x === pn[0]), '');
  });
}

// MK5-13: 4-bar chord clip, INIT arp, Random and Up, 2 passes; control ks 1
await T('verify 13', async page => {
  const r = await page.evaluate(async () => {
    const out = {};
    for (const o of [{on: 1}, {on: 1, type: 4}, {on: 1, ks: 1}, {on: 1, type: 4, ks: 1}]) {
      H.reset(); H.Q.setBpm(240); H.arp(o);
      const a = sndOf(0).p.mk.arp;
      const ch = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]], notes = []; ch.forEach((c, b) => c.forEach(n => notes.push({t: b * 4, d: 4, n, v: .8})));
      H.Q.setClip(0, 0, {len: 4, notes}); H.Q.launchClip(0, 0); await H.sl(100); if (!R.playing) H.Q.play();
      await H.sl((32 * 60 / 240 + .4) * 1000);
      const nl = H.Q.noteLog(800).filter(e => e.src === 'arp' && e.beat != null);
      const pass = k => nl.filter(e => e.beat >= 16 * k - 1e-3 && e.beat < 16 * (k + 1) - 1e-3).map(e => e.out);
      out[JSON.stringify({ks: a.ks, type: a.type})] = {p1: pass(0).join(' '), p2: pass(1).join(' ')};
      H.Q.stop(); await H.sl(200);
    }
    return out;
  });
  for (const k in r) { console.log(k, '\n p1', r[k].p1.slice(0, 60), '\n p2', r[k].p2.slice(0, 60)); ok('MK5-13 ' + k + ' passes equal', r[k].p1 === r[k].p2 && r[k].p1.length > 0, ''); }
});
await browser.close();
