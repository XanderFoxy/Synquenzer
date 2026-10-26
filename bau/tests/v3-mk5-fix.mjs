// MK5-fix: KEY SYNC aus (INIT) counted from the bar line of the chord, late first step for a chord heard on the beat.
// Usage: node v3-mk5-fix.mjs [index.html]   (ONLY=<regex>)
import { browser, T, ok, J } from './v3-qa-mk5-lib.mjs';

// 1) MK5-13 with the INIT arp (KEY SYNC aus): 1-bar and 4-bar triad clips, Up and Zufall, three passes identical
await T('MK5-13 INIT', async page => {
  const r = await page.evaluate(async () => {
    const out = {};
    for (const [bars, type] of [[1, 0], [1, 4], [4, 0], [4, 4]]) {
      H.reset(); H.Q.setBpm(240); H.arp({on: 1, type});
      const ch = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]].slice(0, bars), notes = [];
      ch.forEach((c, b) => c.forEach(n => notes.push({t: b * 4, d: 4, n, v: .8})));
      H.Q.setClip(0, 0, {len: bars, notes}); clearLog(); H.Q.launchClip(0, 0); await H.sl(80); if (!R.playing) H.Q.play();
      await H.sl((3 * bars * 4 * 60 / 240 + .4) * 1000);
      const nl = H.Q.noteLog(1000).filter(e => e.src === 'arp' && e.beat != null), L = 4 * bars;
      const pass = k => nl.filter(e => e.beat >= L * k - 1e-3 && e.beat < L * (k + 1) - 1e-3).map(e => e.out).join(',');
      out[bars + ':' + type] = {ks: sndOf(0).p.mk.arp.ks, p: [pass(0), pass(1), pass(2)]};
      H.Q.stop(); await H.sl(200);
    }
    return out;
  });
  for (const k in r) { const p = r[k].p; ok(`MK5-13 INIT (KEY SYNC ${r[k].ks}) ${k.split(':')[0]} Takt, ${k.endsWith(':4') ? 'Zufall' : 'Auf'}: drei Durchläufe gleich`, r[k].ks === 0 && p[0].length > 10 && p[0] === p[1] && p[1] === p[2], p[0].slice(0, 48) + ' | ' + p[1].slice(0, 48)); }
});

// 2) MK5-07 (KEY SYNC aus) still: two runs with different key times in the same bar give the same pattern from the next bar
await T('MK5-07 aus', async page => {
  const r = await page.evaluate(async () => {
    const runs = [];
    for (const dl of [130, 460]) { H.reset(); H.Q.setBpm(120); H.arp({on: 1, res: 1, ks: 0, gate: 40}); H.Q.play(); await H.sl(dl); H.keys([60, 64, 67]); await H.sl(4300 - dl); H.up([60, 64, 67]); await H.sl(40);
      runs.push(H.Q.noteLog(400).filter(e => e.src === 'arp' && e.beat >= 4 - 1e-3 && e.beat < 8 - 1e-3).map(e => [Math.round(e.beat * 4), e.out])); H.Q.stop(); }
    return runs;
  });
  ok('MK5-07 KEY SYNC aus: zwei Anschläge im selben Takt = dasselbe Muster ab dem nächsten Takt', r[0].length >= 14 && J(r[0]) === J(r[1]), J(r[0].slice(0, 5)));
});

// 3) MK5-14: ● REC 1 bar, chord pressed when beat 2 of the take is HEARD; live arp = playback arp (KEY SYNC an/aus, Q auto/off, Auf/Zufall)
for (const [ks, q, type] of [[1, null, 0], [0, null, 0], [1, 'off', 0], [0, 'off', 0], [0, null, 4], [1, 'off', 4]]) {
  await T(`MK5-14 ks${ks} q${q} t${type}`, async page => {
    const r = await page.evaluate(async ([ks, q, type]) => {
      const Q = H.Q; H.reset(); H.arp({on: 1, res: 1, ks, gate: 50, type}); Q.setBpm(120);
      Q.setRecOptions(Object.assign({length: 1, countIn: false}, q ? {quantize: q} : {}));
      R.selS = 0; Q.rec(); while (rec.state !== 'recording') await H.sl(10);
      const sb = rec.startBeat, B = sb + 1, target = b2t(B) + AU.outLat;
      while (AU.ctx.currentTime < target - .03) await H.sl(5); while (AU.ctx.currentTime < target) {}
      for (const n of [60, 64, 67]) Q.keyOn(n, .8, 'k' + n); await H.sl(1100); for (const n of [60, 64, 67]) Q.keyOff(n, 'k' + n);
      await H.sl(2600); Q.stop(); await H.sl(200);
      const L = Q.noteLog(600).filter(e => e.src === 'arp' && e.track === 0);
      const live = L.filter(e => e.beat - sb < 4), play = L.filter(e => e.beat - sb >= 4 && e.beat - sb < 8);
      return {live: live.map(e => e.out), play: play.map(e => e.out), late: live.length ? !!live[0].late : null,
        first: live.length ? +(live[0].beat - B).toFixed(3) : null, second: live.length > 1 ? +(live[1].beat - B).toFixed(3) : null};
    }, [ks, q, type]);
    const n = Math.min(r.live.length, r.play.length);
    ok(`MK5-14 KEY SYNC ${ks}, Q ${q || 'auto'}, ${type ? 'Zufall' : 'Auf'}: Abspielen = Spielen (Folge), erster Schritt sofort nach dem Anschlag, zweiter auf dem Raster`,
      n >= 7 && J(r.live.slice(0, n)) === J(r.play.slice(0, n)) && r.late === true && r.first > 0 && r.first < .2 && Math.abs(r.second - .25) < .002,
      'live ' + r.live.slice(0, 8).join(' ') + ' | play ' + r.play.slice(0, 8).join(' ') + ` | 1. Note +${r.first} Schlag (late ${r.late}), 2. +${r.second}`);
  });
}

// 4) FP-SONG: a chord heard on the beat (−20 … +20 ms) starts the arp with step 1 of that beat (KEY SYNC an: N1 first), not one step later
await T('FP-SONG Anschlag', async page => {
  const r = await page.evaluate(async () => {
    const out = [];
    for (const res of [1, 5]) for (const off of [-.02, 0, .02]) {
      H.reset(); H.Q.setBpm(120); H.arp({on: 1, res, ks: 1, gate: 50}); H.Q.play(); await H.sl(400);
      const B = Math.ceil(t2b(H.now() + .3)), target = b2t(B) + AU.outLat + off;
      while (H.now() < target - .03) await H.sl(4); while (H.now() < target) {}
      for (const n of [60, 64, 67]) H.Q.keyOn(n, .8, 'k' + n); await H.sl(1300); for (const n of [60, 64, 67]) H.Q.keyOff(n, 'k' + n); await H.sl(50);
      const L = H.log(); out.push({res, off, B, c: L.map(x => x.c).slice(0, 3), n: L.map(x => x.note).slice(0, 3), t1: L[0] ? +(t2b(L[0].t) - B).toFixed(3) : null, t2: L[1] ? +(t2b(L[1].t) - B).toFixed(3) : null});
      H.Q.stop(); await H.sl(100);
    }
    return out;
  });
  for (const x of r) { const sb = x.res === 1 ? .25 : 1;
    ok(`FP-SONG ${x.res === 1 ? '1/16' : '1/4'} Anschlag ${x.off * 1000} ms zum gehörten Schlag: Schritt 1 = dieser Schlag (C zuerst, sofort), Schritt 2 auf dem Raster`,
      J(x.c) === '[0,1,2]' && x.n[0] === 60 && x.t1 > 0 && x.t1 < sb && Math.abs(x.t2 - sb) < .002, J(x)); }
});
await browser.close();
