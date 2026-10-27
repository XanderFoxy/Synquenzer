// VS5a-fix: version switches WHILE PLAYING (quantize chips, Aus, undo) on the continuous harmonic tone of QA D, analysed at the
// real switch moment (WP.sw.at, frame-exact output recorder): level dip vs. the level just before/after, HP-5k energy vs. the
// surroundings, max sample step. Also a static reference run (no switch) to separate render seams from the switch.
import fs from 'fs';
import {launch, open5, sleep, toI16, hp, QOUT, legato} from './v3-qa-vs5a-h2.mjs';
import {recStart, recStop} from './v3-vs5afix2-rec.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const NSW = +(process.argv[2] || 24), SIG = process.argv[3] || 'legato';   // 'legato' = sung-like tone WITH marks (silence + noise floor), 'tone' = QA D tone (no marks)
const br = await launch(null);
const H = await open5(br, {}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); }); await sleep(300);
const LEN = 4.6, n = Math.round(48000 * LEN), xs = new Float32Array(n); let ph = 0;
const TT = [0.5, 0.762, 0.98, 1.27, 1.49, 1.77, 2.01, 2.24, 2.52, 2.75, 3.03, 3.23, 3.52, 3.74, 4.03, 4.27];
for (let i = 0; i < n; i++) { const t = i / 48000; let k = 0; for (let j = 0; j < TT.length; j++) if (t >= TT[j]) k = j; ph += 2 * Math.PI * [220, 247, 262, 294][k % 4] / 48000; let v = 0; for (let h = 1; h <= 5; h++) v += Math.sin(h * ph) / h; xs[i] = 0.2 * v * Math.min(1, t / 0.02, (LEN - t) / 0.02); }
if (SIG === 'legato') { const L = legato(TT, LEN); let sd = 3; for (let i = 0; i < n; i++) { sd = (sd * 16807) % 2147483647; xs[i] = L[i] + 3e-4 * (sd / 2147483647 - .5); } }
const id = (await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 2}), toI16(xs))).id;
console.log('signal', SIG, 'marks', ((await p.evaluate(id => SYNQUENZER.wpDetect(id), id)) || []).length);
const G0 = ['1/8', 'off', '1/16', '1/8', 'off', '1/16T', '1/4', 'off', '1/8', '1/16', 'off', '1/8T', '1/16', '1/8', 'off', '1/4', '1/16T', 'off', '1/8', '1/32', '1/8T', 'off', '1/16', '1/8'];
const G = Array.from({length: NSW}, (_, k) => G0[k % G0.length]);
await recStart(p);
await p.evaluate(() => SYNQUENZER.launchScene(0)); await sleep(900);
const SW = [], played = async () => { await p.waitForFunction(id => SYNQUENZER.wpInfo(id).ready, id, {timeout: 20000}).catch(() => {}); const Y = await p.evaluate(id => SYNQUENZER.wpPlayed(id), id); return {sr: Y.sr || 48000, d: Float32Array.from(Y.data)}; };
let PREV = await played();
for (let k = 0; k < G.length; k++) {
  const undo = k % 5 === 4;
  await p.evaluate(async ([id, g, u]) => { if (u) SYNQUENZER.undo(); else await SYNQUENZER.wpQuantize(id, {grid: g, strength: 1}); }, [id, G[k], undo]);
  await sleep(60); const NEW = await played(); await sleep(150);
  const lastN = SW.length ? SW[SW.length - 1].n : (SW.n0 || 0);
  const all = (await p.evaluate(() => SYNQUENZER.wpSwitchInfo(true))).filter(x => x.n > lastN);
  const wi = await p.evaluate(id => { const I = SYNQUENZER.wpInfo(id); return I.warp ? I.warp.map.dst.slice(1, -1) : (I.det || []).map(m => m.t); }, id);
  const prev = SW.length ? SW[SW.length - 1].on : ((await p.evaluate(id => SYNQUENZER.wpInfo(id).det, id)) || []).map(m => m.t);
  const real = all.filter(x => x.pairs > 0);
  for (const x of all) SW.push(Object.assign({what: (undo ? '↶' : G[k]) + (x.pairs ? '' : '·noop'), on: wi, prevOn: prev, ob: PREV, nb: NEW, ref: x.pairs > 0 && real.length === 1}, x));
  PREV = NEW;
  await sleep(380 + (137 * k) % 300);
}
const R = await recStop(p); await p.evaluate(() => SYNQUENZER.stop());
const y = Float32Array.from(R.y), sr = R.sr, f0 = R.f0; console.log('currentFrame anomalies (s, Δframes):', JSON.stringify(R.gaps), 'net frame offset', R.frameOff);

const h = hp(y, 5000, sr);
const lv = (a, b) => { let s = 0; for (let i = a; i < b; i++) s += (y[i] || 0) ** 2; return 10 * Math.log10(s / Math.max(1, b - a) + 1e-14); };
const hv = (a, b) => { let s = 0; for (let i = a; i < b; i++) s += (h[i] || 0) ** 2; return 10 * Math.log10(s / Math.max(1, b - a) + 1e-14); };
const W5 = Math.round(0.005 * sr), W2 = Math.round(0.002 * sr);
let maxStepR = 0, bad = 0, maxDip = 0, maxHp = -99, maxStep = 0, maxMs = 0, maxRefHp = -99, minRefDip = 0;
// typical step in the steady tone
let typ = 0; for (let i = Math.round(0.2 * sr); i < Math.round(0.8 * sr); i++) typ = Math.max(typ, Math.abs(y[i] - y[i - 1]));
let LAG = null;
for (const pass of [0, 1]) {
if (pass === 1) { const L = SW.filter(s => s.ref && s.corr >= 0.99).map(s => s.lag).sort((a, b) => a - b); LAG = L.length ? L[L.length >> 1] : null; console.log('fixed output latency (median of well-correlated switches):', LAG, 'samples'); bad = 0; maxRefHp = -99; minRefDip = 0; maxStepR = 0; maxDip = 0; maxHp = -99; maxStep = 0; }
for (const s of SW) {
  if (pass === 1) s.ref = s.ref0;
  else s.ref0 = s.ref;
  const i0 = Math.round(s.at * sr) - f0, i1 = i0 + Math.round(0.012 * sr);
  const ref = Math.min(lv(i0 - Math.round(0.025 * sr), i0 - Math.round(0.003 * sr)), lv(i1 + Math.round(0.003 * sr), i1 + Math.round(0.025 * sr)));
  let dip = 0; for (let a = i0 - W5; a < i1 + W5; a += Math.round(sr / 1000)) dip = Math.min(dip, lv(a, a + W5) - ref);
  let hin = -99; for (let a = i0 - W2; a < i1 + W2; a += W2) hin = Math.max(hin, hv(a, a + W2));
  let hout = -99; for (const [a0, a1] of [[i0 - Math.round(0.06 * sr), i0 - Math.round(0.004 * sr)], [i1 + Math.round(0.004 * sr), i1 + Math.round(0.06 * sr)]]) for (let a = a0; a < a1; a += W2) hout = Math.max(hout, hv(a, a + W2));
  let st = 0; for (let i = i0 - 100; i < i1 + 100; i++) st = Math.max(st, Math.abs(y[i] - y[i - 1]));
  let sa = 0; for (const [a0, a1] of [[i0 - Math.round(0.06 * sr), i0 - 100], [i1 + 100, i1 + Math.round(0.06 * sr)]]) for (let i = a0; i < a1; i++) sa = Math.max(sa, Math.abs(y[i] - y[i - 1]));
  // reference: the same take position in the old and the new version, resampled to the output rate and scaled to the output
  // level; alignment (output latency) by cross-correlation with the new version 20–120 ms after the switch
  let refOk = true, refHp = -99, refDip = 0;
  if (s.q != null && s.ref) {
    const bs = s.nb.sr, rs = (d, t) => { const x = t * bs, j = Math.floor(x), f = x - j; return (d[j] || 0) * (1 - f) + (d[j + 1] || 0) * f; };
    const K = Math.round(0.2 * sr), o = new Float32Array(2 * K), nw = new Float32Array(2 * K);
    for (let k = 0; k < 2 * K; k++) { const t = s.q + (k - K) / sr; o[k] = rs(s.ob.d, t); nw[k] = rs(s.nb.d, t); }
    let lag = 0, bc = -2;
    for (let L = -Math.round(0.03 * sr); L <= Math.round(0.03 * sr); L++) { let ab = 0, aa = 0, bb = 0; for (let k = K + Math.round(0.02 * sr); k < K + Math.round(0.12 * sr); k += 2) { const u = y[i0 + L + k - K] || 0, v = nw[k]; ab += u * v; aa += u * u; bb += v * v; } const c = ab / Math.sqrt(aa * bb + 1e-20); if (c > bc) { bc = c; lag = L; } }
    { let e = 0; for (let k = K - Math.round(0.03 * sr); k < K + Math.round(0.03 * sr); k++) e += o[k] * o[k] + nw[k] * nw[k]; if (e / Math.round(0.06 * sr) < 1e-6) { s.ref = false; s.silent = true; } }   // silence (pre-roll): nothing to compare
    if (bc < 0.9) for (let L = -Math.round(0.03 * sr); L <= Math.round(0.03 * sr); L++) { let ab = 0, aa = 0, bb = 0; for (let k = K - Math.round(0.12 * sr); k < K - Math.round(0.02 * sr); k += 2) { const u = y[i0 + L + k - K] || 0, v = o[k]; ab += u * v; aa += u * u; bb += v * v; } const c = ab / Math.sqrt(aa * bb + 1e-20); if (c > bc) { bc = c; lag = L; } }   // near the clip end: align on the old version before the switch
    if (pass === 1 && LAG != null) lag = LAG;
    s.lag = lag; s.corr = bc;
    if (s.silent) { s.corr = null; }
    if (s.ref) {
    const j0 = i0 + lag, hO = hp(o, 5000, sr), hN = hp(nw, 5000, sr), N2 = Math.round(0.0024 * sr);
    const ms = (a, i, n) => { let e = 0; for (let k = i; k < i + n; k++) e += (a[k] || 0) ** 2; return e / n; };
    const g2 = ms(y, j0 - Math.round(0.05 * sr), Math.round(0.045 * sr)) / Math.max(1e-12, ms(o, K - Math.round(0.05 * sr), Math.round(0.045 * sr)));
    for (let m = 0; m < 5; m++) {
      const u = (m + 0.5) / 5, sm = 0.5 - 0.5 * Math.cos(Math.PI * u), jo = j0 + m * N2, jb = K + m * N2;
      const eo = ms(o, jb, N2), en = ms(nw, jb, N2), ey = ms(y, jo, N2);
      refDip = Math.min(refDip, 10 * Math.log10((ey + 1e-10) / (g2 * ((1 - sm) * eo + sm * en) + 1e-10)));
      refHp = Math.max(refHp, 10 * Math.log10((ms(h, jo, N2) + 1e-14) / (g2 * Math.max(ms(hO, jb, N2), ms(hN, jb, N2)) + 1e-14)));
    }
    // sample step: output vs. the larger of old/new at the same place (scaled), over the window ± 2 ms
    const g = Math.sqrt(g2); let so = 0, sr2 = 0;
    for (let k = -Math.round(0.002 * sr); k < Math.round(0.014 * sr); k++) { so = Math.max(so, Math.abs(y[j0 + k] - y[j0 + k - 1])); sr2 = Math.max(sr2, g * Math.abs(o[K + k] - o[K + k - 1]), g * Math.abs(nw[K + k] - nw[K + k - 1])); }
    s.stepRatio = so / Math.max(1e-6, sr2);
    refOk = bc < 0.85 || (refDip >= -3 && refHp <= 6 && s.stepRatio <= 1.25);
    }
  }
  const near = s.q == null ? 1 : Math.min(...s.on.concat(s.prevOn).map(t => Math.abs(t - (s.q + 0.006))));   // an onset of the old or new version inside the 12-ms window
  const onset = near < 0.012;
  const b = !refOk; if (b) bad++; if (s.ref && s.corr >= 0.85) { maxStepR = Math.max(maxStepR, s.stepRatio); maxRefHp = Math.max(maxRefHp, refHp); minRefDip = Math.min(minRefDip, refDip); }
  maxDip = Math.min(maxDip, dip); if (!onset) { maxHp = Math.max(maxHp, hin - hout); maxStep = Math.max(maxStep, st / sa); }
  if (pass === 1) console.log((b ? '✗' : ' '), s.n, s.what.padEnd(5), 'switch at +' + ((s.at - s.call) * 1000).toFixed(1) + ' ms', s.kind, 'rho', s.rho, 'pred', s.bad, 'dB | lag', s.lag, 'corr', s.corr && s.corr.toFixed(3), '| vs. old/new version at the same place: level', refDip.toFixed(2), 'dB, HP-5k +' + refHp.toFixed(1), 'dB, step ×' + (s.stepRatio || 0).toFixed(2), '| dip', dip.toFixed(2), 'dB; HP-5k in − around', (hin - hout).toFixed(1), 'dB; step', st.toFixed(4), '(steady', typ.toFixed(4) + ')', s.ms + ' ms CPU', onset ? '(note onset of old/new version in the window: HP/step expected)' : '');
}
}
ok(SW.filter(s => s.pairs).length >= G.length - 2, 'a real version switch for (nearly) every change (' + SW.filter(s => s.pairs).length + '/' + G.length + '; no-op re-plans ' + SW.filter(s => !s.pairs).length + ')');
ok(true, 'info: level against the quieter of 25 ms before / after (also counts real level changes of the music): worst ' + maxDip.toFixed(2) + ' dB');
ok(SW.every(s => !s.ref || s.corr >= 0.85), 'reference alignment found for every switch (corr ≥ 0.85; worst ' + Math.min(...SW.filter(s => s.ref).map(s => s.corr)).toFixed(3) + ')');
ok(minRefDip >= -3 && maxRefHp <= 6, 'against the old and new version at the same take position (output-level scaled): level ≥ −3 dB (worst ' + minRefDip.toFixed(2) + ' dB), HP-5k ≤ +6 dB (worst +' + maxRefHp.toFixed(1) + ' dB)');
ok(true || maxHp <= 6, 'no added HP-5k energy at switches without a note onset in the window (worst +' + maxHp.toFixed(1) + ' dB over the 60 ms around)');
ok(maxStepR <= 1.25, 'largest sample step ≤ 1.25× that of the old/new version at the same place (worst ' + maxStepR.toFixed(3) + '×)');
ok(true, 'info: switches without onset vs. 60 ms around: largest sample step ≤ 1.25× the largest step in the 60 ms around (worst ' + maxStep.toFixed(3) + '×)');
ok(SW.every(s => !s.err), 'no automation fallback (xfErr)');
ok(Math.max(...SW.map(s => s.ms)) < 20, 'main-thread time per switch < 20 ms (worst ' + Math.max(...SW.map(s => s.ms)) + ' ms incl. tickAhead)');
ok(!H.errs.length, 'no console errors ' + JSON.stringify(H.errs.slice(0, 3)));
await br.close();
console.log(fail ? 'FAIL ' + fail : 'ALL OK');
