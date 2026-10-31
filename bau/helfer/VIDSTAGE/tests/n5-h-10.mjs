// 20-MB-Grenze (Umfang „Ablage“): mit kleiner Test-Grenze — erst Reglerkurven ausdünnen, dann Ereignisse zwischen Keyframes; Keyframes bleiben;
// M-REKON gilt weiter. Dazu Kontext-Ereignisse (Szene, Clip, ▶, ■, Hand-Träger) ohne Daten.
import { launch } from './n5-h-lib.mjs';
const res = []; const ok = (id, pass, info) => { res.push({id, pass: !!pass}); console.log((pass ? 'PASS ' : 'FAIL ') + id + ' ' + JSON.stringify(info)); };
const {b, p, errs} = await launch();
const r = await p.evaluate(async () => {
  const A = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms));
  HIST.chunkMs = 400; HIST.every = 40;
  for (let i = 0; i < 260; i++) {
    const s = A.getSound(i % 4); HIST.cv = {v: Array.from({length: 30}, (_, j) => +(Math.sin(i + j / 4)).toFixed(3)), t: performance.now()}; s.p.cutoff = 500 + (i * 37) % 7000; A.setSound(i % 4, s);
    await sl(0); if (i % 20 === 19) { histDrainNow(); await histFlush(); await sl(450); }
  }
  histDrainNow(); await historyCheck(); await HIST.wq;
  const m0 = JSON.parse(JSON.stringify(await histMetaGet(HIST.pid))), c0 = await historyCheck({detail: true});
  const evAll0 = (await histItems(HIST.pid)).reduce((a, x) => a + x.evs.length, 0);
  // phase 1 only: limit a bit under the total
  HIST.limit = m0.bytes - 40; await histCompact(HIST.pid); await HIST.wq;
  const m1 = JSON.parse(JSON.stringify(await histMetaGet(HIST.pid)));
  const items1 = await histItems(HIST.pid), cLens1 = items1.filter(x => (x.r.thin | 0) === 1).flatMap(x => x.evs.filter(e => e.c).map(e => e.c.length));
  const c1 = await historyCheck({detail: true});
  // phase 2: limit far below → events between keyframes dropped, keyframes stay
  HIST.limit = Math.round(m0.bytes * 0.45); await histCompact(HIST.pid); await HIST.wq;
  const m2 = JSON.parse(JSON.stringify(await histMetaGet(HIST.pid))), c2 = await historyCheck({detail: true});
  const thin = o => Object.values(o.chunks).map(c => c.thin | 0).join('');
  return {chunks: Object.keys(m0.chunks).length, b0: m0.bytes, nk0: m0.nk, ne0: m0.ne, evAll0, b1: m1.bytes, thin1: thin(m1), cMax1: Math.max(...cLens1), b2: m2.bytes, nk2: m2.nk, ne2: m2.ne, thin2: thin(m2), lim2: HIST.limit, c0: c0.ok, c1: c1.ok, c2: c2.ok, bad2: c2.bad};
});
ok('Grenze: Stufe 1 dünnt zuerst die Reglerkurven aus (30 → 15 Werte), M-REKON bleibt', r.b1 < r.b0 && /1/.test(r.thin1) && !/2/.test(r.thin1) && r.cMax1 === 15 && r.c1, r);
ok('Grenze: Stufe 2 verwirft Ereignisse zwischen Keyframes (älteste zuerst, bis zur Grenze oder bis nur Keyframes bleiben), alle Keyframes bleiben, M-REKON bleibt', (r.b2 <= r.lim2 || /^2+[0-2]?0$/.test(r.thin2)) && r.b2 < r.b1 && r.nk2 === r.nk0 && r.ne2 < r.ne0 && /2/.test(r.thin2) && r.c2, r);
// context events
const {b: b2, p: p2, errs: e2} = await launch();
const ctx = await p2.evaluate(async () => {
  const A = SYNQUENZER, n0 = HIST.cur.strs.length, sl = ms => new Promise(r => setTimeout(r, ms));
  A.launchScene(1); await sl(300); slotTap(2, 0); await sl(300); setKbMode('transpose'); A.keyOn(57); await sl(150); A.keyOff(57); setKbMode('play'); await sl(300); A.stop(); await sl(300); A.play(); await sl(200); A.stop(); await sl(2500);
  return HIST.cur.strs.slice(n0).map(s => JSON.parse(s)).map(e => ({u: e.u, c: e.z.c, l: e.l, d: !!e.d}));
});
ok('Kontext-Ereignisse: Szene, Clip, Hand-Träger, ▶, ■ ohne Daten', ['scene', 'clip', 'hand', 'stop', 'play'].every(c => ctx.some(e => e.u === 'ctx' && e.c === c && !e.d)) && ctx.every(e => e.u === 'ctx'), ctx);
ok('keine Konsolenfehler', !errs.length && !e2.length, errs.concat(e2).slice(0, 3));
await b.close(); await b2.close();
console.log(res.every(x => x.pass) ? 'ALLE BESTANDEN' : 'FEHLER');
