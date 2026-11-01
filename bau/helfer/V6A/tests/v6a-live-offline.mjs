// V6A live = offline: derselbe Song einmal live (▶ SONG) und einmal im Offline-Render (Video / GarageBand-Weg). Gleich müssen sein:
// (1) jede Fahrt (Ziel, Beginn, Ende, Kurve in Schlägen ab Song-Start, exakt); (2) die gemessene Cutoff-Kurve je Block (±1 Block).
import { open, setup, ok, done } from './v6a-lib.mjs';
const { b, p, errs } = await open();
const t = await setup(p, { scenes: 2, len: 2 });
const r = await p.evaluate(async (t) => {
  const Q = window.SYNQUENZER;
  setP(t, 'cutoff', 2400);
  Q.v6aSetState(t, 1, {p: {cutoff: 400, res: .4}, fx: {vol: .5}});
  Q.songFromChain([0, 1, 0, 1].map(s => ({scene: s, bars: 2})));
  const id = a => S.song.marks.find(m => m.a === a).id;
  Q.v6aMarkGlide(id(4), {x: 'bar1'});
  const plan = [], og = window.v6aGo;
  window.v6aGo = function (i, st, t0, t1, at, c) { const s = spb(), z = R.startTime; plan.push([i, v6aSig(st), +((t0 - z) / s).toFixed(9), +((t1 - z) / s).toFixed(9), +((at - z) / s).toFixed(9), c]); return og.apply(this, arguments); };
  Q.v6aProbeAll(t, ['cutoff']);
  await Q.vvRender({range: {a: 0, b: 6}});
  const off = {plan: plan.splice(0), log: Q.v6aProbeLog(t), st: Q.v6aStart()};
  // live
  Q.v6aProbeAll(t, ['cutoff']); syncEngine(t, true);
  songPlayStart(0); await new Promise(r => setTimeout(r, 50));
  while (R.playing && t2b(nowT()) < 21) await new Promise(r => setTimeout(r, 30));
  const live = {plan: plan.splice(0).filter(x => x[2] < 21), log: Q.v6aProbeLog(t), st: Q.v6aStart()};
  Q.stop(); window.v6aGo = og;
  return {off, live};
}, t);
const curve = o => o.log.map(x => ({b: (x.f / o.st.sr - o.st.t) / o.st.spb, v: x.v[0]})).filter(x => x.b >= 0 && x.b < 21);
const A = curve(r.off), B = curve(r.live);
const val = (L, bb) => { let k = L.findIndex(x => x.b > bb); if (k <= 0) return k === 0 ? L[0].v : L[L.length - 1].v; const a = L[k - 1], c = L[k]; return a.v + (c.v - a.v) * (bb - a.b) / (c.b - a.b); };
const blk = 128 / r.off.st.sr / r.off.st.spb;
let worst = 0, wb = 0;
for (let bb = .5; bb < 20.5; bb += .01) { const x = val(A, bb), y = val(B, bb), sl = Math.max(Math.abs(val(A, bb + blk) - x), Math.abs(x - val(A, bb - blk))), d = Math.abs(x - y) - 1.5 * sl; if (d > worst) { worst = d; wb = bb; } }
const pl = x => JSON.stringify(x.filter(q => q[0] === t));
console.log('offline', pl(r.off.plan), '\nlive   ', pl(r.live.plan));
ok('LO-1 Fahrten-Plan live = offline (Ziel, Beginn, Ende, Kurve in Schlägen)', pl(r.off.plan.filter(q => q[2] < 21)) === pl(r.live.plan) && r.live.plan.length >= 2, r.live.plan.length + ' Fahrten');
ok('LO-2 Cutoff-Kurve live = offline (±1 Block)', worst <= 1e-6 * 2400 && A.length > 100 && B.length > 100, 'größte Abweichung über der Block-Toleranz ' + worst.toExponential(2) + ' bei Schlag ' + wb.toFixed(2) + ' · ' + A.length + '/' + B.length + ' Blöcke');
ok('LO-E keine Fehler', !errs.length, errs.join(' | ').slice(0, 300));
await b.close(); process.exit(done() ? 1 : 0);
