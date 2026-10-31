// Regression checks for the defects found by the independent re-test (Node shim; --chromium adds the MDX.render check).
import {render, makeEngine, prog} from './md-shim.mjs';
import * as M from './md-measure.mjs';
const SR = +(process.argv.find(a => /^\d{5}$/.test(a)) || 48000);
const res = []; const check = (id, ok, d) => { res.push({id, ok: !!ok}); console.log((ok ? 'OK  ' : 'FAIL') + ' ' + id + ' ' + d); };
const R = (x, d = 2) => (+x).toFixed(d);
// R1 saw DC (A3, FREQ 50) at several pitches: |DC| <= 0.005 and <= -40 dB re RMS
for (const pit of [45, 69, 84, 96, 108]) {
  const r = render({sr: SR, chans: {0: {mWav: 'A3', mPit: pit, mFrq: 50, mDec: 50, mDm: 'E1'}}, hits: [{ch: 0, at: 0, v: 1}], sec: 1.2});
  const a = Math.round(0.2 * SR), b = Math.round(1.2 * SR); let dc = 0; for (let i = a; i < b; i++) dc += r.L[i]; dc /= b - a; const rms = M.rms(r.L, a, b);
  check('R1 Säge DC PITCH ' + pit, Math.abs(dc) <= 0.005 && M.db(Math.abs(dc) / rms) <= -40, 'DC ' + dc.toExponential(2) + ' (' + R(M.db(Math.abs(dc) / rms), 1) + ' dB re RMS)');
}
// R2 echo feedback without tone filter: RATE 50 (fractional time), FEEDBACK 20: per repeat -0.265 dB broadband, 10 kHz loss echo 1 -> 11 <= 3 dB
{ const r = render({sr: SR, chans: {0: {mTlv: 0, mClv: 50, mCty: 'P1', mDly: 25}}, kit: {rvT: 'r1', dlR: 50, dlM: 'r', dlF: 20}, hits: [{ch: 0, at: 0, v: 1}], sec: 1.4});
  const T = Math.round(1.15 * Math.pow(0.01 / 1.15, 50 / 99) * SR), seg = k => r.L.subarray(k * T - 40, k * T + 200);
  const e1 = seg(1), e11 = seg(11); const p = M.db(M.peakAbs(e11) / M.peakAbs(e1)) / 10;
  const S1 = M.spectrum(e1, SR, 0, e1.length, 8192, false), S11 = M.spectrum(e11, SR, 0, e11.length, 8192, false), hf = M.db(M.magAt(S11, 10000) / M.magAt(S1, 10000)) - 10 * (-0.2646);
  check('R2 Echo ohne Klangfilter', Math.abs(p + 0.2646) <= 0.05 && Math.abs(hf) <= 3, 'je Wiederholung ' + R(p, 3) + ' dB, 10 kHz Echo 1→11 zusätzlich ' + R(hf, 2) + ' dB'); }
// R3 click level = G(LEVEL) * v, independent of the dynamics curve
for (const crv of ['Li', 'L3', 'O2']) { const lv = v => M.peakAbs(render({sr: SR, chans: {0: {mTlv: 0, mClv: 40, mCty: 'P2', mCrv: crv}}, hits: [{ch: 0, at: 0, v}], sec: 0.02}).L);
  const d = M.db(lv(0.35) / lv(1)); check('R3 Click-Pegel v 0,35 Kurve ' + crv, Math.abs(d - M.db(0.35)) <= 0.1, R(d) + ' dB (Soll ' + R(M.db(0.35)) + ')'); }
// R4 stop: a hit in the same 128-sample block before the stop fades as well
{ const at = 0.5, stopAt = at + 90 / SR; const r = render({sr: SR, chans: {0: {mWav: 'A1', mPit: 57, mDec: 50}}, hits: [{ch: 0, at, v: 1}], msgs: [[at - 0.001, {t: 'stop', at: stopAt, tau: 0.02}]], sec: 1.2});
  const lv = M.db(M.peakAbs(r.L, Math.round((at + 0.4) * SR))); check('R4 Stopp im selben Block', lv <= -90, 'nach 0,4 s ' + R(lv, 1) + ' dBFS'); }
// R5 after stop (tau 0.02 / 0.03) no voice later than 200 ms
for (const tau of [0.02, 0.03]) { const E = makeEngine(SR); E.send({t: 'ch', ch: 0, p: prog({mWav: 'C1', mDec: 50, mPit: 60})}); E.send({t: 'reset'}); E.send({t: 'hit', list: [{ch: 0, at: 0.01, v: 1}]}); E.run(Math.round(0.3 * SR));
  E.send({t: 'stop', at: E.frame / SR, tau}); const t0 = E.frame; let end = -1; for (let k = 0; k < 400 && end < 0; k++) { E.run(128); if (!E.P.chs[0].v.some(v => v.on)) end = (E.frame - t0) / SR; }
  check('R5 Stimme aus nach Stopp τ ' + tau, end >= 0 && end <= 0.2, 'nach ' + R(end * 1000, 0) + ' ms'); }
// R8 ND3 programs: mono only where the spec marks it (Zu, Offen, Pedal, Ring-Metall)
{ const fs = await import('node:fs'); const src = fs.readFileSync(new URL('../src/md-progs.js', import.meta.url), 'utf8'); const mono = [...src.matchAll(/C\('(\w+)', '([^']+)', (Object\.assign\(\{\}, kZu[^)]*\)|\{[^}]*\})/g)].filter(m => /mMono: 1/.test(m[3]) || /kZu/.test(m[3])).map(m => m[2]);
  check('R8 Mono-Gruppe nur laut Tabelle', JSON.stringify(mono.sort()) === JSON.stringify(['Offen', 'Pedal', 'Ring-Metall', 'Zu']), mono.join(', ')); }
// DIST TYPE change on a sounding channel: no jump (largest sample step around the change vs steady state of both types)
for (const [ta, tb] of [['dr', 'rn'], ['rn', 'dr'], ['dr', 'SA']]) {
  const P0 = {mWav: 'A1', mPit: 69, mDec: 50, mDst: 30, mDty: ta};
  const r = render({sr: SR, chans: {0: P0}, hits: [{ch: 0, at: 0.01, v: 1}], msgs: [[0.5, {t: 'ch', ch: 0, p: prog(Object.assign({}, P0, {mDty: tb}))}]], sec: 1});
  const ref = render({sr: SR, chans: {0: Object.assign({}, P0, {mDty: tb})}, hits: [{ch: 0, at: 0.01, v: 1}], sec: 1});
  const step = (x, a, b) => { let m = 0; for (let i = Math.round(a * SR) + 1; i < Math.round(b * SR); i++) m = Math.max(m, Math.abs(x[i] - x[i - 1])); return m; };
  const lim = Math.max(step(r.L, 0.3, 0.49), step(ref.L, 0.3, 0.75)), around = step(r.L, 0.49, 0.75);
  check('R-DIST-Typwechsel ' + ta + '→' + tb, around <= lim * 1.05, 'größter Schritt ' + R(around, 4) + ' (stationär beider Typen ' + R(lim, 4) + ')'); }
// hall sleeps within about 0.5 s after the tail falls below -100 dBFS
{ const E = makeEngine(SR); E.send({t: 'kit', p: {rvT: 'hA'}}); E.send({t: 'ch', ch: 0, p: prog({mTlv: 0, mClv: 50, mCty: 'P3', mRvb: 50})}); E.send({t: 'reset'}); E.send({t: 'hit', list: [{ch: 0, at: 0.01, v: 1}]});
  let below = -1, slept = -1; for (let k = 0; k < Math.round(20 * SR / 128) && slept < 0; k++) { const o = E.run(128); const pk = M.peakAbs(o.L); if (below < 0 && k > 100 && pk < 1e-5) below = E.frame / SR; if (below >= 0 && pk < 1e-5 && E.P.hsleep > 0.5 * SR / 128) slept = E.frame / SR; if (pk >= 1e-5) below = -1; }
  check('R-Hall schläft unter −100 dBFS', slept > 0 && slept - below <= 0.7, 'unter −100 dBFS ab ' + R(below, 2) + ' s, schläft ab ' + R(slept, 2) + ' s'); }
// ---- second round (verification workflow) ----
function mKlick(x, hitsS, a, b) { let y = Float64Array.from(x); for (let st = 0; st < 2; st++) { const w = 2 * Math.PI * 5000 / SR, cs = Math.cos(w), al = Math.sin(w) / (2 * Math.SQRT1_2), a0 = 1 + al, b0 = (1 + cs) / 2 / a0, b1 = -(1 + cs) / a0, b2 = b0, a1 = -2 * cs / a0, a2 = (1 - al) / a0; let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < y.length; i++) { const v = y[i], o = b0 * v + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = v; y2 = y1; y1 = o; y[i] = o; } }
  const wN = Math.round(0.002 * SR), E = []; for (let i = 0; i + wN <= y.length; i += wN) { let q = 0; for (let k = 0; k < wN; k++) q += y[i + k] ** 2; E.push(10 * Math.log10(q / wN + 1e-24)); }
  let worst = -99; for (let j = 0; j < E.length; j++) { const t = j * 0.002; if (t < a || t > b || E[j] <= -80) continue; if (hitsS.some(h => t >= h - 0.002 && t <= h + 0.003)) continue; const nb = []; for (let k = Math.max(0, j - 10); k <= Math.min(E.length - 1, j + 10); k++) if (k !== j) nb.push(E[k]); nb.sort((p, q) => p - q); worst = Math.max(worst, E[j] - nb[nb.length >> 1]); } return worst; }
const live = (P0, changes, sec, kit) => { const E = makeEngine(SR); if (kit) E.send({t: 'kit', p: kit}); E.send({t: 'ch', ch: 0, p: prog(P0)}); E.send({t: 'reset'}); E.send({t: 'hit', list: [{ch: 0, at: 0.01, v: 1}]});
  const n = Math.round(sec * SR), L = new Float32Array(n); const oL = new Float32Array(128), oR = new Float32Array(128); let ci = 0;
  for (let i = 0; i < n; i += 128) { const t = E.frame / SR; while (ci < changes.length && changes[ci][0] <= t) { E.send(changes[ci][1]); ci++; } E.ctx.currentFrame = E.frame; E.P.process([], [[oL, oR]], {}); L.set(oL.subarray(0, Math.min(128, n - i)), i); E.frame += 128; } return {L, E}; };
// saw DC after the trapezoid constant: raw level
{ let worst = 0; for (const pit of [69, 96, 108, 127.5]) { const r = render({sr: SR, chans: {0: {mWav: 'A3', mPit: pit, mFrq: 50, mDec: 50}}, hits: [{ch: 0, at: 0, v: 1}], sec: 1.2}); let dc = 0; const a = Math.round(0.2 * SR); for (let i = a; i < r.L.length; i++) dc += r.L[i]; worst = Math.max(worst, Math.abs(dc / (r.L.length - a))); }
  check('R11 Säge DC (Trapez-Konstante)', worst <= 5e-5, 'größter |DC| ' + worst.toExponential(2) + ' (PITCH 69/96/108/127.5)'); }
// silent tone becomes audible: no spike (TONE LVL 0 -> 40; SOLO other channel off)
for (const w of ['A3', 'r2', 'C2', 'A2', 'F1']) { const P0 = {mWav: w, mPit: 57, mDec: 50, mTlv: 0}; const r = live(P0, [[0.5, {t: 'ch', ch: 0, p: prog(Object.assign({}, P0, {mTlv: 40}))}]], 0.7).L;
  const ref = render({sr: SR, chans: {0: Object.assign({}, P0, {mTlv: 40})}, hits: [{ch: 0, at: 0.01, v: 1}], sec: 0.7}).L; const pk = M.peakAbs(r, Math.round(0.5 * SR)), pr = M.peakAbs(ref, Math.round(0.5 * SR));
  check('R12 stummer Ton wird hörbar ' + w, pk <= pr * 1.12, 'Spitze ' + R(M.db(pk), 1) + ' dBFS (Bezug ' + R(M.db(pr), 1) + ')'); }
// TONE LVL / NOISE LVL / SOLO glide (no 16-sample stairs)
{ const P0 = {mWav: 'A1', mPit: 83, mDec: 50, mTlv: 50}; const r = live(P0, [[0.3, {t: 'ch', ch: 0, p: prog(Object.assign({}, P0, {mTlv: 10}))}], [0.6, {t: 'ch', ch: 0, p: prog(P0)}]], 0.9).L;
  check('R13 TONE LVL 50→10→50 auf 1 kHz', mKlick(r, [0.01], 0.1, 0.85) <= 6, 'M-KLICK ' + R(mKlick(r, [0.01], 0.1, 0.85), 1) + ' dB');
  const r2 = live(P0, [[0.3, {t: 'mute', ch: 5, solo: 'all'}], [0.6, {t: 'mute', ch: -1, solo: null}]], 0.9).L; check('R13 SOLO anderer Kanal an/aus', mKlick(r2, [0.01], 0.1, 0.85) <= 6, 'M-KLICK ' + R(mKlick(r2, [0.01], 0.1, 0.85), 1) + ' dB'); }
// high bend keeps the modes for the whole hit
{ const E = makeEngine(SR); E.send({t: 'ch', ch: 0, p: prog({mWav: 'H1', mPit: 69, mBnd: 50, mBt: 30, mDec: 40})}); E.send({t: 'reset'}); E.send({t: 'hit', list: [{ch: 0, at: 0, v: 1}]}); E.run(256);
  const v = E.P.chs[0].v.find(x => x.on); check('R14 BEND +50 behält die Moden (H1 P69)', v && v.nm === 32, 'Moden ' + (v ? v.nm : '-') + ' (ohne Bend 32)'); }
// DIST type switch to rn while sounding: no dip / click
for (const D of [20, 50]) { const P0 = {mWav: 'A1', mPit: 69, mDec: 50, mDst: D, mDty: 'dr'}; const r = live(P0, [[0.4, {t: 'ch', ch: 0, p: prog(Object.assign({}, P0, {mDty: 'rn'}))}]], 1).L;
  check('R15 DIST dr→rn bei ' + D, mKlick(r, [0.01], 0.2, 0.95) <= 6, 'M-KLICK ' + R(mKlick(r, [0.01], 0.2, 0.95), 1) + ' dB'); }
// asleep channel: CH LEVEL / PAN / DIST type changed while asleep apply at once on the next hit
{ const P0 = {mWav: 'A1', mPit: 69, mDec: 10, mLvl: 50}; const E = makeEngine(SR); E.send({t: 'ch', ch: 0, p: prog(P0)}); E.send({t: 'reset'}); E.send({t: 'hit', list: [{ch: 0, at: 0.01, v: 1}, {ch: 0, at: 0.7, v: 1}]}); E.run(Math.round(0.5 * SR));
  E.send({t: 'ch', ch: 0, p: prog(Object.assign({}, P0, {mLvl: 0}))}); const o = E.run(Math.round(0.4 * SR)); check('R16 CH LEVEL im Schlaf auf 0', M.peakAbs(o.L) === 0, 'Spitze danach ' + R(M.db(M.peakAbs(o.L)), 1) + ' dBFS'); }
// echo time changed while idle: the next first echo comes at the new time (no stray glide)
{ const r = render({sr: SR, chans: {0: {mTlv: 0, mClv: 50, mCty: 'P1', mDly: 25}}, kit: {rvT: 'r1', dlR: 50}, msgs: [[0.3, {t: 'kit', p: {rvT: 'r1', dlR: 99}}], [0.4, {t: 'hit', list: [{ch: 0, at: 0.4, v: 1}]}]], sec: 0.6});
  let i0 = -1, i1 = -1; for (let i = Math.round(0.39 * SR); i < r.L.length; i++) { if (Math.abs(r.L[i]) > 1e-3) { if (i0 < 0) i0 = i; else if (i - i0 > 48) { i1 = i; break; } } } const ms = (i1 - i0) / SR * 1000;
  check('R17 Echozeit im Leerlauf geändert', Math.abs(ms - 10) <= 0.1, 'erstes Echo nach ' + R(ms, 2) + ' ms (Soll 10,0)'); }
// echo off and on again: no stale echo comes back
{ const r = render({sr: SR, chans: {0: {mTlv: 0, mClv: 50, mCty: 'P3', mDly: 25}}, kit: {rvT: 'r1', dlR: 0}, hits: [{ch: 0, at: 0.01, v: 1}],
    msgs: [[0.3, {t: 'ch', ch: 0, p: prog({mTlv: 0, mClv: 50, mCty: 'P3', mDly: 0})}], [2.9, {t: 'ch', ch: 0, p: prog({mTlv: 0, mClv: 50, mCty: 'P3', mDly: 25})}]], sec: 4});
  const lv = M.peakAbs(r.L, Math.round(3.0 * SR)); check('R18 kein Geister-Echo', lv === 0, 'nach 3 s ' + R(M.db(lv), 1) + ' dBFS'); }
// FEEDBACK and COLOR changes on sounding material
{ const P0 = {mWav: 'A1', mPit: 83, mDec: 50, mDly: 25, mRvb: 25}; const kit = {rvT: 'r1', dlR: 60, dlF: 0, rvC: 0};
  const r = live(P0, [[0.3, {t: 'kit', p: Object.assign({}, kit, {dlF: 20})}], [0.7, {t: 'kit', p: kit}]], 1.4, kit).L; check('R19 FEEDBACK 0→20→0', mKlick(r, [0.01], 0.1, 1.35) <= 6, 'M-KLICK ' + R(mKlick(r, [0.01], 0.1, 1.35), 1) + ' dB');
  for (const [c1, c2] of [[0, -9], [-9, 0], [0, 9], [9, 0], [-1, 1], [-9, 9]]) { const k1 = Object.assign({}, kit, {rvC: c1}); const r2 = live(P0, [[0.4, {t: 'kit', p: Object.assign({}, kit, {rvC: c2})}]], 1.0, k1).L;
    const mk = mKlick(r2, [0.01], 0.2, 0.95); check('R19 COLOR ' + c1 + '→' + c2, mk <= 6, 'M-KLICK ' + R(mk, 1) + ' dB'); } }
// CPU limiter stage 2 switches early reflections without a jump
{ const P0 = {mWav: 'A1', mPit: 83, mDec: 50, mRvb: 50}; const r = live(P0, [[0.4, {t: 'lim', s: 2}], [0.8, {t: 'lim', s: 0}]], 1.2, {rvT: 'ti'}).L; check('R20 Begrenzer ER aus/an', mKlick(r, [0.01], 0.2, 1.15) <= 6, 'M-KLICK ' + R(mKlick(r, [0.01], 0.2, 1.15), 1) + ' dB'); }
// more than 512 hits ahead (queue 4096)
{ const E = makeEngine(SR); E.send({t: 'ch', ch: 0, p: prog({mTlv: 0, mClv: 50, mCty: 'P1'})}); E.send({t: 'reset'}); const L = []; for (let k = 0; k < 2000; k++) L.push({ch: 0, at: 0.01 + k * 0.002, v: 1}); E.send({t: 'hit', list: L});
  const r = E.run(Math.round(4.1 * SR)); let n = 0; for (let i = 1; i < r.L.length; i++) if (r.L[i] > 0.1 && r.L[i - 1] <= 0.1) n++; check('R21 2000 Schläge voraus', n === 2000, n + ' Schläge gehört'); }
if (process.argv.includes('--chromium')) {
  const {createRequire} = await import('node:module'); const {chromium} = createRequire(import.meta.url)('playwright'); const path = await import('node:path'); const url = await import('node:url');
  const b = await chromium.launch(); const p = await b.newPage(); await p.goto('file://' + path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..', 'index.html')); await p.waitForTimeout(1500);
  const v = await p.evaluate(async () => { const r = await MDX.render({sr: 48000, sec: 0.6, chans: {0: {mWav: 'A1', mPit: 69, mDec: 40}, 1: {mWav: 'A1', mPit: 76, mDec: 40}}, msgs: [[0.2, {t: 'hit', list: [{ch: 0, at: 0.2, v: 1}]}], [0.2, {t: 'hit', list: [{ch: 1, at: 0.2, v: 1}]}]]});
    const S = x => { let m = 0; for (let i = 9600; i < 28000; i++) m = Math.max(m, Math.abs(x[i])); return m; }; return S(r.l); });
  check('R6 MDX.render: zwei Nachrichten zur selben Zeit', v > 0.4, 'Spitze ' + R(v, 3) + ' (beide Kanäle klingen)');
  const u = await p.evaluate(async () => { const out = []; for (const off of [0, 63, 64, 100]) { const t = (9600 + off) / 48000; const r = await MDX.render({sr: 48000, sec: 0.4, chans: {0: {mWav: 'A1', mPit: 69, mDec: 30}}, msgs: [[t, {t: 'hit', list: [{ch: 0, at: t, v: 1}]}]]}); let f = -1; for (let i = 0; i < r.l.length; i++) if (r.l[i] !== 0) { f = i; break; } out.push(f - 9601 - off); } return out; });
  check('R22 MDX.render: Nachricht mitten im Quantum', u.every(x => x === 0), 'Abweichung in Samples ' + u.join(' / '));
  const lp = await p.evaluate(async () => { const hits = []; for (let k = 0; k < 128; k++) for (let c = 0; c < 6; c++) hits.push({ch: c, at: 0.05 + k * 0.125, v: 1}); const chans = {}; for (let c = 0; c < 6; c++) chans[c] = {mTlv: 0, mClv: 50, mCty: 'P1', mPan: -9};
    const r = await MDX.render({sr: 48000, sec: 16.3, chans, hits}); let n = 0; for (let i = 1; i < r.l.length; i++) if (r.l[i] > 0.1 && r.l[i - 1] <= 0.1) n++; return n; });
  check('R23 MDX.render 768 Schläge (8 Takte × 6 Pads)', lp === 128, lp + ' von 128 Schritten gehört');
  const tq = await p.evaluate(async () => { const ac = new OfflineAudioContext(2, 48000, 48000); await MDX.load(ac); const E = MDX.node(ac, ac.destination); const a = await Promise.race([E.test({tap: 1}), new Promise(r => setTimeout(() => r('timeout'), 3000))]);
    window.LIM = window.LIM || {level: 0}; const lim0 = LIM.level; LIM.level = 2; const E2 = MDX.node(ac, ac.destination); LIM.level = lim0; return {tap: a && a.ok, off: E.offline, lim: E2.lastLim, inNodes: MDX.nodes.has(E2)}; });
  check('R24 Test-API und Offline-Knoten', tq.tap === true && tq.off === true && tq.lim === 0 && tq.inNodes === false, JSON.stringify(tq));
  await b.close();
}
const bad = res.filter(r => !r.ok); console.log('\n' + (res.length - bad.length) + '/' + res.length + ' bestanden (' + SR + ' Hz)' + (bad.length ? '\nFEHLT: ' + bad.map(b => b.id).join(', ') : ''));
