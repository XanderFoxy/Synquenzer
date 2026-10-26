// QA MK8: PANIK / double stop end everything (arp, seq, both timbres' delay tails) for MK8 programs played by clips
import {launch, open} from './v3-qa8-lib.mjs';
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info !== undefined ? ' — ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); };
const b = await launch(); const {page: p, errs} = await open(b, 'P1');
await p.evaluate(async () => { await SYNQUENZER.libraryReady(); const Q = SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120);
  Q.setClip(0, 0, {len: 1, notes: [0, 1, 2, 3].map(t => ({t, d: .9, n: 48 + t * 3, v: .9}))});
  Q.setClip(1, 0, {len: 1, notes: [{t: 0, d: 3.5, n: 60, v: .9}, {t: 0, d: 3.5, n: 64, v: .9}, {t: 0, d: 3.5, n: 67, v: .9}]});
  Q.setEngine(0, 'mk'); Q.setEngine(1, 'mk'); Q.selectTrack(0); mkProg.select(6, 6); Q.selectTrack(1); mkProg.select(7, 10);   // F06 (Dual arp+seq+delay), G10 (seq + cross delay)
  window.__lv = ms => new Promise(r => { const a = AU.ctx.createAnalyser(); a.fftSize = 2048; AU.M.ceil.connect(a); const buf = new Float32Array(2048); let pk = 0; const iv = setInterval(() => { a.getFloatTimeDomainData(buf); for (const v of buf) pk = Math.max(pk, Math.abs(v)); }, 15); setTimeout(() => { clearInterval(iv); try { AU.M.ceil.disconnect(a); } catch (e) {} r(+(20 * Math.log10(pk + 1e-9)).toFixed(1)); }, ms); });
});
for (const how of ['stop2:0', 'stop2:60', 'stop2:120', 'stop2:200']) {
  const r = await p.evaluate(async how => { const Q = SYNQUENZER, w = ms => new Promise(r => setTimeout(r, ms));
    Q.launchScene(0); if (!Q.runtime().playing) Q.play(); await w(3000); const before = await __lv(400);
    if (how === 'panic') { Q.stop(); await w(150); Q.keyOn(48, .9, 'k1'); Q.keyOn(55, .9, 'k2'); await w(1500); Q.panic(); } else { const g = +how.split(':')[1]; Q.stop(); if (g) await w(g); Q.stop(); }
    await w(250); const after = await __lv(600); await w(1500); const later = await __lv(500);
    return {before, after, later, voices: Q.voices().length, playing: Q.runtime().playing}; }, how);
  ok(how + ': silent after (≤ 250 ms + 0.6 s window), no voices', r.before > -40 && r.after < -70 && r.later < -80 && r.voices === 0, r);
}
ok('console', errs.length === 0, errs);
console.log(fails ? 'FAIL ' + fails : 'ALL PASS');
await b.close();
