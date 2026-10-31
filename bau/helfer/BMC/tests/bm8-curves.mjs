// BM8 Abnahme: Aufnahme, Wiedergabe, Overdub = Berühren, Undo, Live-Vorrang, Andere Engines, Größe (Platzhalter BmHost.ctl)
import { open, ok, summary } from './lib.mjs';
const {b, p, errs} = await open();
const sleep = ms => p.waitForTimeout(ms);
// ---------- setup: Spur 0 = Bit-Mask-Platzhalter, 240 BPM, feste Länge 4 Takte, kein Einzähler ----------
await p.evaluate(() => {
  const A = SYNQUENZER; ensureAudio(); A.setBpm(240); A.setRecOptions({length: 4, countIn: 0, quantize: '1/16'});
  A.bmcFake(0, true); A.selectTrack(0);
  const tr = S.tracks[0]; let s = tr.clips.findIndex(c => !c); A.selectSlot(0, s); window.__s = s;
  // Eingabe-Treiber: alle 8 ms ein Wert; der Verlauf wird mitgeschrieben (Schlag wie die App: t2b(now − outLat))
  window.__drive = (kinds, f, durS) => new Promise(res => {
    const t0 = performance.now(), log = [];
    for (const k of kinds) A.bmcLive(0, k, null, {touch: true});
    const id = setInterval(() => {
      const x = (performance.now() - t0) / 1000; if (x > durS) { clearInterval(id); for (const k of kinds) A.bmcLive(0, k, null, {touch: false}); res(log); return; }
      for (const k of kinds) { const v = f(k, x); A.bmcLive(0, k, v); const b = bmcBeatNow(); log.push([k, b, k === 'bd' ? mkWheelVal(0, 'bend') : k === 'mw' ? mkWheelVal(0, 'mod') : v]); }
    }, 8);
  });
});
const f = `(k, x) => k === 'bd' ? .8 * Math.sin(2 * Math.PI * .7 * x) : k === 'mw' ? .5 + .4 * Math.sin(2 * Math.PI * .9 * x + 1) : .5 + .45 * Math.sin(2 * Math.PI * 1.3 * x)`;
// ---------- BM8-01 Aufnahme ----------
const u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
await p.evaluate(() => SYNQUENZER.rec());
await p.waitForFunction(() => rec.state === 'recording', null, {timeout: 5000});
const inLog = await p.evaluate(`window.__drive(['bd','mw','at'], ${f}, 3.6)`);
await p.waitForFunction(() => rec.state === 'off', null, {timeout: 8000});
const r1 = await p.evaluate(({inLog}) => {
  const c = S.tracks[0].clips[window.__s], cv = c && c.cv, B0 = 0, L = c.len * 4, out = {len: c.len, keys: cv ? Object.keys(cv) : [], n: {}, start: {}, dev: {}, rate: {}};
  for (const k of ['bd', 'mw', 'at']) {
    const a = cv[k]; out.n[k] = a.length; out.start[k] = a[0][0];
    // Eingabe = what the app received (its own history, straight lines between the events), at the 10-ms sampling points
    // (§5.4: Abtastung ≤ 100/s, then thinned); devRaw: at the raw events themselves (information)
    const H = BMC.h[0], st = BMC.ST / spb(); let dev = 0, devRaw = 0;
    for (let bb = 0; bb < Math.min(L, H[k][H[k].length - 1][0]); bb += st) dev = Math.max(dev, Math.abs(cvAt(a, bb) - bmcVal(H, k, bb)));
    for (const q of H[k]) if (!q[3] && q[0] >= 0 && q[0] < L) devRaw = Math.max(devRaw, Math.abs(cvAt(a, q[0]) - q[1]));
    out.dev[k] = +dev.toFixed(5); (out.devRaw || (out.devRaw = {}))[k] = +devRaw.toFixed(5);
    // points per second (max in any 1-s window)
    const sp = spb(); let mx = 0; for (let j = 0; j < a.length; j++) { let n = 0; for (let q = j; q < a.length && (a[q][0] - a[j][0]) * sp < 1; q++) n++; mx = Math.max(mx, n); } out.rate[k] = mx;
  }
  out.sorted = Object.values(cv).every(a => a.every((p, j) => !j || p[0] > a[j - 1][0]));
  return out;
}, {inLog});
ok('BM8-01 cv.bd/mw/at im Behälter', r1.keys.join() === 'bd,mw,at', r1.keys);
ok('BM8-01 Startpunkt bei t = 0', Object.values(r1.start).every(x => x === 0), r1.start);
ok('BM8-01 ≤ 100 Punkte/s', Object.values(r1.rate).every(x => x <= 101), r1.rate);
ok('BM8-01 Abweichung zur Eingabe ≤ 0,005 (an den Abtastpunkten)', Object.values(r1.dev).every(x => x <= .005), {dev: r1.dev, anRohEreignissen: r1.devRaw});
ok('BM8-01 aufsteigend', r1.sorted);
const u1 = await p.evaluate(() => SYNQUENZER.undoInfo());
ok('BM8-07 eine Aufnahme = ein Undo (mit Noten)', u1.n === u0 + 1 && /Aufnahme/.test(u1.top.label), u1.top);
// ---------- BM8-02 Wiedergabe (der Clip läuft jetzt in Schleife) ----------
await p.evaluate(() => SYNQUENZER.bmcLog(true));
const lp = await p.evaluate(() => ({cs: R.cstart[0], L: S.tracks[0].clips[window.__s].len * 4, now: t2b(AU.ctx.currentTime)}));
await sleep(4600);                                               // > eine Schleife (4 Takte bei 240 = 4 s)
const r2 = await p.evaluate(({inLog, lp}) => {
  const log = SYNQUENZER.bmcLog(), c = S.tracks[0].clips[window.__s], L = lp.L, sp = spb(), out = {n: log.length, corr: {}, lag: {}, loopStart: {}};
  // loop starts inside the logged range
  const cs = R.cstart[0], b0 = Math.min(...log.map(e => t2b(e.at))), b1 = Math.max(...log.map(e => t2b(e.at)));
  let nL = Math.ceil((b0 - cs) / L), B = cs + nL * L;
  for (const k of ['bd', 'mw', 'at']) {
    const ev = log.filter(e => e.k === k).sort((x, y) => x.at - y.at);
    out.loopStart[k] = B < b1 ? ev.some(e => Math.abs(t2b(e.at) - B) < 1e-6 && Math.abs(e.v - c.cv[k][0][1]) < 1e-9) : 'n/a';
    // step-function of the ctl stream vs the recorded input, 1 ms grid over one loop
    const inp = BMC.h[0] && BMC.h[0][k].length ? BMC.h[0][k].filter(q => q[0] >= 0 && q[0] < L).map(q => [q[0], q[1]]) : inLog.filter(x => x[0] === k).map(x => [x[1], x[2]]);   // what the app received
    const val = (arr, b) => { let v = arr.length ? arr[0][1] : 0; for (const [bb, vv] of arr) { if (bb > b) break; v = vv; } return v; };
    const evB = ev.map(e => [((t2b(e.at) - cs) % L + L) % L + 0, e.v]).sort((x, y) => x[0] - y[0]);
    const N = Math.floor(Math.min(L, inp[inp.length - 1][0]) * sp * 1000), a = [], q = [];   // over the recorded part
    for (let j = 0; j < N; j++) { const t = j / 1000 / sp; a.push(val(evB, t)); q.push(val(inp, t)); }
    const corr = (x, y) => { const n = x.length, mx = x.reduce((s, v) => s + v, 0) / n, my = y.reduce((s, v) => s + v, 0) / n; let sxy = 0, sxx = 0, syy = 0; for (let j = 0; j < n; j++) { sxy += (x[j] - mx) * (y[j] - my); sxx += (x[j] - mx) ** 2; syy += (y[j] - my) ** 2; } return sxy / Math.sqrt(sxx * syy); };
    out.corr[k] = +corr(a, q).toFixed(4);
    // Zeitlage: each ctl event against the input (straight lines between the input events) — the shift (0.25 ms steps) with the
    // smallest mean error; a moving regulator only (the flat part says nothing about time)
    const lin = (arr, t) => { if (t <= arr[0][0]) return arr[0][1]; for (let j = 1; j < arr.length; j++) if (arr[j][0] >= t) { const [t0, v0] = arr[j - 1], [t1, v1] = arr[j]; return t1 - t0 < 1e-12 ? v1 : v0 + (v1 - v0) * (t - t0) / (t1 - t0); } return arr[arr.length - 1][1]; };
    const mov = evB.filter(([t], j) => t > .05 && t < inp[inp.length - 1][0] - .05 && j && Math.abs(evB[j][1] - evB[j - 1][1]) > 1e-4);
    let best = Infinity, bl = 0; for (let l = -40; l <= 40; l++) { const d = l / 4000 / sp; let e = 0; for (const [t, v] of mov) e += Math.abs(lin(inp, t + d) - v); if (e < best - 1e-12) { best = e; bl = l / 4; } } out.lag[k] = bl;
  }
  return out;
}, {inLog, lp});
ok('BM8-02 Korrelation Wiedergabe ↔ Eingabe ≥ 0,99', Object.values(r2.corr).every(x => x >= .99), r2.corr);
ok('BM8-02 Zeitlage ± 1 ms', Object.values(r2.lag).every(x => Math.abs(x) <= 1), r2.lag);
ok('BM8-02 Schleifen-Beginn nimmt den Startwert', Object.values(r2.loopStart).every(x => x === true), r2.loopStart);
// ---------- BM8-09 Live-Berührung gewinnt, danach folgt die Kurve ----------
await p.evaluate(() => SYNQUENZER.bmcLog(true));
await p.evaluate(() => SYNQUENZER.bmcLive(0, 'bd', .3, {touch: true}));
await sleep(1200);
const tMid = await p.evaluate(() => AU.ctx.currentTime);
await p.evaluate(() => SYNQUENZER.bmcLive(0, 'bd', 0, {touch: false}));
await sleep(1200);
const r9 = await p.evaluate(({tMid}) => { const log = SYNQUENZER.bmcLog(); const bd = log.filter(e => e.k === 'bd');
  return {during: bd.filter(e => e.at > tMid - .9 && e.at < tMid).length, after: bd.filter(e => e.at > tMid + .2).length, other: log.filter(e => e.k === 'mw' && e.at > tMid - .9 && e.at < tMid).length}; }, {tMid});
ok('BM8-09 Live gewinnt (keine Bend-Kurve während der Berührung)', r9.during === 0 && r9.other > 0, r9);
ok('BM8-09 danach folgt wieder die Kurve', r9.after > 0, r9);
// ---------- BM8-02 ■ → Bend 0, Druck 0, Rad = Radstellung ----------
await p.evaluate(() => SYNQUENZER.bmcLog(true));
const r2s = await p.evaluate(() => { SYNQUENZER.stop(); const log = SYNQUENZER.bmcLog(), now = AU.ctx.currentTime; const g = k => log.filter(e => e.k === k && e.at <= now + 1e-6).pop();
  return {bd: g('bd') && g('bd').v, at: g('at') && g('at').v, mw: g('mw') && g('mw').v, wheel: mkWheelVal(0, 'mod'), cut: log.some(e => e.cut)}; });
ok('BM8-02 ■: Bend 0, Druck 0, Rad = Radstellung', r2s.bd === 0 && r2s.at === 0 && Math.abs(r2s.mw - r2s.wheel) < 1e-9 && r2s.cut, r2s);
// ---------- BM8-05 Overdub = Berühren: Rad nur in Takt 2 ----------
const before = await p.evaluate(() => JSON.parse(JSON.stringify(S.tracks[0].clips[window.__s].cv)));
await p.evaluate(() => { SYNQUENZER.selectSlot(0, window.__s); SYNQUENZER.launchClip(0, window.__s); SYNQUENZER.play(); });
await p.waitForFunction(() => R.playing && R.slot[0] === window.__s && t2b(AU.ctx.currentTime - AU.outLat) > .2, null, {timeout: 5000});
await p.evaluate(() => SYNQUENZER.rec());
await p.waitForFunction(() => rec.state === 'overdub', null, {timeout: 5000});
// wait until clip beat 4.25 (inside bar 2), move the wheel until 7.6
const odw = await p.evaluate(async () => {
  const L = 16, pos = () => ((t2b(AU.ctx.currentTime - AU.outLat) - R.cstart[0]) % L + L) % L;
  while (!(pos() > 4.3 && pos() < 5)) await new Promise(r => setTimeout(r, 5));
  const t0 = performance.now(); SYNQUENZER.bmcLive(0, 'mw', null, {touch: true}); const a = pos();
  while (pos() < 7.5) { SYNQUENZER.bmcLive(0, 'mw', .5 + .4 * Math.sin((performance.now() - t0) / 150)); await new Promise(r => setTimeout(r, 8)); }
  SYNQUENZER.bmcLive(0, 'mw', null, {touch: false}); const e = pos();
  while (pos() < 12) await new Promise(r => setTimeout(r, 10));
  SYNQUENZER.rec(); return {a, e};
});
await sleep(200);
const r5 = await p.evaluate(({before}) => {
  const cv = S.tracks[0].clips[window.__s].cv, out = {};
  const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
  const inR = (a, lo, hi) => a.filter(p => p[0] >= lo && p[0] < hi);
  out.bdSame = same(cv.bd, before.bd); out.atSame = same(cv.at, before.at);
  out.bar1 = same(inR(cv.mw, 0, 4), inR(before.mw, 0, 4)); out.bar34 = same(inR(cv.mw, 8, 16), inR(before.mw, 8, 16));
  out.bar2changed = !same(inR(cv.mw, 4, 8), inR(before.mw, 4, 8));
  out.undo = SYNQUENZER.undoInfo().top.label;
  return out;
}, {before});
ok('BM8-05 Takt 1, 3, 4 unverändert; Takt 2 neu; Bend/Druck unverändert', r5.bar1 && r5.bar34 && r5.bar2changed && r5.bdSame && r5.atSame, Object.assign(r5, odw));
ok('BM8-07 Overdub = ein Undo', r5.undo === 'Overdub', r5.undo);
const r7 = await p.evaluate(({before}) => { SYNQUENZER.stop(); SYNQUENZER.undo(); const a = JSON.stringify(S.tracks[0].clips[window.__s].cv) === JSON.stringify(before); SYNQUENZER.redo(); return {a, hc: SYNQUENZER.historyCheck()}; }, {before});
ok('BM8-07 Undo stellt die alten Kurven her', r7.a, r7);
ok('BM8-07 historyCheck() = true', r7.hc === true, r7);
ok('Konsole ohne Fehler, kein Supabase-Aufruf', !errs.length, errs);
await b.close(); process.exit(summary());
