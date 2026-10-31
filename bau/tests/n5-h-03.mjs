// VC2a-03 (nach 450 Ereignissen ≥ 3 Keyframes mit format und appVersion), VC2a-04 (1000 typische Ereignisse ≤ 40 KB gzip)
import { launch } from './n5-h-lib.mjs';
const res = []; const ok = (id, pass, info) => { res.push({id, pass: !!pass}); console.log((pass ? 'PASS ' : 'FAIL ') + id + ' ' + JSON.stringify(info)); };
// typical session mix (Simulation wie R6-I7 verlauf-sim): 40 % Reglerzug mit Kurve, 20 % Noten im Clip, 10 % Drum-Schritt,
// 12 % Kontext (Szene/Clip/▶/■/Hand), 6 % Effekt, 5 % Song-Akkord, 4 % Teil, 3 % Undo/Redo
async function sim(p, n) {
  return p.evaluate(async n => {
    const A = SYNQUENZER; let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const knobs = ['cutoff', 'res', 'env', 'decay', 'o1lvl', 'o2lvl', 'det', 'rel', 'att'];
    const start = HIST.cur.strs.length, kf0 = HIST.cur.kf.length; let ev = 0;
    A.songFromChain([{scene: 0, bars: 4}, {scene: 1, bars: 4}]);
    while (HIST.cur.strs.length - start < n) {
      const r = rnd(), t = Math.floor(rnd() * 4);
      if (r < .40) { const s = A.getSound(t), k = knobs[Math.floor(rnd() * knobs.length)]; if (typeof s.p[k] !== 'number') continue; const v0 = s.p[k];
        HIST.cv = {v: Array.from({length: 8 + Math.floor(rnd() * 12)}, (_, i) => +(v0 * (1 + 0.3 * Math.sin(i / 3))).toPrecision(4)), t: performance.now()};
        s.p[k] = +(v0 * (0.7 + 0.6 * rnd())).toPrecision(6); A.setSound(t, s); }
      else if (r < .60) { const c = A.getClip(t, 0) || {len: 1, notes: []}; c.notes = (c.notes || []).slice(); if (rnd() < .6 || !c.notes.length) c.notes.push({p: 55 + Math.floor(rnd() * 20), s: Math.floor(rnd() * 16) / 4, l: .25, v: .8}); else c.notes[Math.floor(rnd() * c.notes.length)].p += 1; A.setClip(t, 0, c); }
      else if (r < .70) A.toggleStep(Math.floor(rnd() * 8), Math.floor(rnd() * 16), 0);
      else if (r < .82) { const q = rnd(); if (q < .3) launchScene(Math.floor(rnd() * 4)); else if (q < .55) histCtx('clip', {t, s: 0}); else if (q < .7) histCtx('play', null, '▶'); else if (q < .85) histCtx('stop', null, '■'); else histCtx('hand', {tg: 'Am'}, 'Am'); }
      else if (r < .88) setBusFx('hall.decay', +(1 + rnd() * 5).toFixed(2));
      else if (r < .93) songSetChord(Math.floor(rnd() * 8), ['Am', 'F', 'C', 'G', 'Dm'][Math.floor(rnd() * 5)]);
      else if (r < .97) A.setPart(1 + Math.floor(rnd() * 3), {name: 'Teil ' + Math.floor(rnd() * 9)});
      else { if (rnd() < .6) undo(); else redo(); }
      await new Promise(r => setTimeout(r, 0));
    }
    if (R.playing) A.stop();
    histDrainNow(); histSweep();
    const strs = HIST.cur.strs.slice(start, start + n);
    const gz = async t => (await new Response(new Blob([t]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer()).byteLength;
    const evBytes = await gz('[' + strs.join(',') + ']');
    const evs = strs.map(s => JSON.parse(s)), kinds = {}; for (const e of evs) kinds[e.u] = (kinds[e.u] || 0) + 1;
    await histFlush();
    const kfs = HIST.cur.kf.slice(kf0); let kfBytes = 0; for (const k of kfs) kfBytes += histSize(k.b);
    return {n: strs.length, raw: strs.join(',').length, evBytes, kfN: kfs.length, kfBytes, kinds, withC: evs.filter(e => e.c).length, avgOps: +(evs.reduce((a, e) => a + (e.d ? e.d.length : 0), 0) / evs.length).toFixed(2)};
  }, n);
}
{ // VC2a-03
  const {b, p, errs} = await launch();
  const r = await sim(p, 450);
  const h = await p.evaluate(() => SYNQUENZER.history());
  const kfs = await p.evaluate(async () => { const o = []; await histWalk((K, k) => { o.push({w: k.w, format: K.format, appVersion: K.appVersion, hasP: !!(K.p && K.p.tracks)}); }); return o; });
  const c = await p.evaluate(() => historyCheck({detail: true}));
  ok('VC2a-03 nach 450 Ereignissen ≥ 3 Keyframes, jeder mit format und appVersion', h.keyframes >= 3 && kfs.length >= 3 && kfs.every(k => k.format === 5 && k.appVersion === '4.25.0' && k.hasP) && c.ok, {events: h.events, keyframes: h.keyframes, kfs, check: c.ok, bad: c.bad});
  ok('VC2a-03 keine Konsolenfehler', !errs.length, errs.slice(0, 3));
  await b.close();
}
{ // VC2a-04
  const {b, p, errs} = await launch();
  const r = await sim(p, 1000);
  const c = await p.evaluate(() => historyCheck({detail: true}));
  ok('VC2a-04 1000 typische Ereignisse ≤ 40 KB gzip', r.evBytes <= 40 * 1024 && c.ok, Object.assign({KB: +(r.evBytes / 1024).toFixed(1), mitKeyframesKB: +((r.evBytes + r.kfBytes) / 1024).toFixed(1), rawKB: +(r.raw / 1024).toFixed(1), check: c.ok}, r));
  ok('VC2a-04 keine Konsolenfehler', !errs.length, errs.slice(0, 3));
  await b.close();
}
console.log(res.every(x => x.pass) ? 'ALLE BESTANDEN' : 'FEHLER');
