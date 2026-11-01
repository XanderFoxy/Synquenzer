// V6A Rechenlast (M-CPU sinngemäß, Chromium-Worklet): eine Fläche (3 Stimmen) einmal ohne Fahrt, einmal während einer 16-Schläge-Fahrt
// über 10 Regler (heiße je 16 Samples). Ruhe- und Fahrt-Abschnitte wechseln sich dreimal ab; Worklet-Last (Anteil der Echtzeit) als
// Median der Sekunden-Berichte. Ziel ≤ Ruhe + 1 %.
// Haupt-Faden: Dauer von v6aTick je Aufruf (Ziel < 0,05 ms im Mittel).
import { open, setup, ok, done } from './v6a-lib.mjs';
const { b, p, errs } = await open();
const t = await setup(p, { scenes: 2, len: 4, notes: [57, 60, 64].map(n => ({t: 0, d: 15.9, n, v: .7})) });
const r = await p.evaluate(async (t) => {
  const Q = window.SYNQUENZER, wait = ms => new Promise(r => setTimeout(r, ms));
  const st = {p: {cutoff: 300, res: .6, level: .2, o1lvl: .3, o2lvl: .9, o1pw: .2, aA: .3, aD: .9, fenv: .5, uniDet: .7}, x: 'free', n: 16};
  Q.setBpm(60);
  const meas = async ms => { const E = AU.synth[t], L = []; E.onRep = m => L.push(m.load); await wait(ms); E.onRep = null; return L.slice(1); };
  Q.launchScene(0); if (!R.playing) Q.play(); await wait(1200);
  const stA = Object.assign({}, st, {eng: 'analog'}), stB = {eng: 'analog', p: {cutoff: 5000, res: .1, level: .4, o1lvl: 1, o2lvl: .1, o1pw: .6, aA: .01, aD: .2, fenv: 0, uniDet: .1}};
  const idle = [], move = [];
  for (let k = 0; k < 3; k++) {                                    // idle and gliding phases alternate (the machine's noise hits both)
    idle.push(...await meas(3300));
    const now = nowT(); v6aGo(t, k % 2 ? stB : stA, now + .05, now + 3.4, now + 3.4, 0);
    move.push(...await meas(3300));
    await wait(200);
  }
  // main thread: v6aTick cost
  const T0 = performance.now(); let n = 0; for (; n < 2000; n++) v6aTick(R.schedBeat, R.schedBeat + .1); const tick = (performance.now() - T0) / n;
  Q.stop(); return {idle, move, tick, info: Q.v6aInfo().cur[t]};
}, t);
const avg = a => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
const med = a => { const x = a.slice().sort((p, q) => p - q); return x[x.length >> 1] || 0; }, i = med(r.idle), m = med(r.move);
console.log(JSON.stringify(r));
ok('CPU-1 Worklet-Last während einer Fahrt ≤ Ruhe + 1 %', m - i <= .01, `Ruhe ${(i * 100).toFixed(2)} % · Fahrt ${(m * 100).toFixed(2)} %`);
ok('CPU-2 v6aTick im Haupt-Faden < 0,05 ms', r.tick < .05, r.tick.toFixed(4) + ' ms');
ok('CPU-E keine Fehler', !errs.length, errs.join(' | ').slice(0, 300));
await b.close(); process.exit(done() ? 1 : 0);
