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
if (process.argv.includes('--chromium')) {
  const {createRequire} = await import('node:module'); const {chromium} = createRequire(import.meta.url)('playwright'); const path = await import('node:path'); const url = await import('node:url');
  const b = await chromium.launch(); const p = await b.newPage(); await p.goto('file://' + path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..', 'index.html')); await p.waitForTimeout(1500);
  const v = await p.evaluate(async () => { const r = await MDX.render({sr: 48000, sec: 0.6, chans: {0: {mWav: 'A1', mPit: 69, mDec: 40}, 1: {mWav: 'A1', mPit: 76, mDec: 40}}, msgs: [[0.2, {t: 'hit', list: [{ch: 0, at: 0.2, v: 1}]}], [0.2, {t: 'hit', list: [{ch: 1, at: 0.2, v: 1}]}]]});
    const S = x => { let m = 0; for (let i = 9600; i < 28000; i++) m = Math.max(m, Math.abs(x[i])); return m; }; return S(r.l); });
  check('R6 MDX.render: zwei Nachrichten zur selben Zeit', v > 0.4, 'Spitze ' + R(v, 3) + ' (beide Kanäle klingen)'); await b.close();
}
const bad = res.filter(r => !r.ok); console.log('\n' + (res.length - bad.length) + '/' + res.length + ' bestanden (' + SR + ' Hz)' + (bad.length ? '\nFEHLT: ' + bad.map(b => b.id).join(', ') : ''));
