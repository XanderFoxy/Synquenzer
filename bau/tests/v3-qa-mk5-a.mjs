// QA MK5 probes A: MK5-13 / MK5-14 with the DEFAULT arp settings (KEY SYNC off = INIT), Random repeats
import { browser, T, ok, J } from './v3-qa-mk5-lib.mjs';

await T('MK5-13 default', async page => {
  const r = await page.evaluate(async () => {
    const out = {};
    for (const o of [{on: 1}, {on: 1, type: 4}]) {
      H.reset(); H.Q.setBpm(150); H.arp(o);
      const a = sndOf(0).p.mk.arp; const def = {ks: a.ks, type: a.type, range: a.range, res: a.res, gate: a.gate};
      const ch = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]], notes = []; ch.forEach((c, b) => c.forEach(n => notes.push({t: b * 4, d: 4, n, v: .8})));
      H.Q.setClip(0, 0, {len: 4, notes}); H.Q.launchClip(0, 0); await H.sl(100); if (!R.playing) H.Q.play();
      await H.sl((32 * 60 / 150 + .3) * 1000);
      const nl = H.Q.noteLog(800).filter(e => e.src === 'arp' && e.beat != null);
      const pass = k => nl.filter(e => e.beat >= 16 * k - 1e-3 && e.beat < 16 * (k + 1) - 1e-3).map(e => e.out);
      out[o.type === 4 ? 'random' : 'up'] = {def, p1: pass(0), p2: pass(1)};
      H.Q.stop(); await H.sl(200);
    }
    return out;
  });
  for (const k in r) {
    const x = r[k], same = J(x.p1) === J(x.p2);
    let firstDiff = -1; for (let i = 0; i < Math.min(x.p1.length, x.p2.length); i++) if (x.p1[i] !== x.p2[i]) { firstDiff = i; break; }
    ok(`MK5-13 4-Takt-Akkord-Clip, Arp mit INIT-Werten ${J(x.def)} (${k}): zwei Durchläufe = dieselbe Folge`, x.p1.length >= 50 && same,
      `n ${x.p1.length}/${x.p2.length}; 1. Abweichung bei Note ${firstDiff}; Lauf 1 ${x.p1.slice(0, 12).join(' ')} | Lauf 2 ${x.p2.slice(0, 12).join(' ')}`);
  }
});

await T('MK5-14 default ks', async page => {
  // ● with arp (Random, INIT KEY SYNC off): played chords, then playback: same arp order per chord?
  const r = await page.evaluate(async () => {
    H.reset(); H.Q.setBpm(120); H.arp({on: 1, type: 4, gate: 50});
    const ks = sndOf(0).p.mk.arp.ks;
    R.selS = 0; H.Q.rec(); await H.sl(200);
    while (!(rec.state === 'recording')) await H.sl(20);
    const b0 = Math.ceil(t2b(H.now()) + 1e-9); await H.sl((b2t(b0) - H.now()) * 1000 + 2);
    H.keys([60, 64, 67, 71]); await H.sl(1500); H.up([60, 64, 67, 71]); await H.sl(150);
    const liveLog = H.log().map(x => x.note);
    await H.sl(600); H.Q.rec(); await H.sl(400); H.Q.stop(); await H.sl(200);
    const clip = H.Q.getClip(0, 0);
    ARPC.clearLog(0); H.Q.launchClip(0, 0); if (!R.playing) H.Q.play(); await H.sl(2 * (clip ? clip.len : 1) * 4 * .5 * 1000 + 300); H.Q.stop(); await H.sl(100);
    const playLog = ARPC.arpLog(0).map(x => x.note);
    return {ks, liveLog, playLog, clipNotes: clip ? clip.notes.map(n => [n.t, n.n]) : null, len: clip && clip.len};
  });
  const n = Math.min(r.liveLog.length, 10);
  ok('MK5-14 Abspielen der Aufnahme mit INIT KEY SYNC (' + r.ks + '), Zufall: dieselbe Arp-Folge wie beim Spielen', n >= 8 && J(r.liveLog.slice(0, n)) === J(r.playLog.slice(0, n)),
    'live ' + r.liveLog.slice(0, 12).join(' ') + ' | Abspielen ' + r.playLog.slice(0, 12).join(' ') + ' | Clip ' + J(r.clipNotes) + ' len ' + r.len);
});

await browser.close();
