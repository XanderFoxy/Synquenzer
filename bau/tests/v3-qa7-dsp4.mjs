import * as Q from './v3-qa7-lib.mjs';
const {SR, render, vocSnd, sine, noise, rms, peak, db, welch, bandE, R, ok, centroid} = Q;
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const T = async (id, f) => { if (ONLY && !ONLY.test(id)) return; try { await f(); } catch (e) { ok(id, false, 'Fehler ' + String(e.stack || e).slice(0, 500)); } };
const br = await Q.launch(); const {page, errs} = await Q.openApp(br);
const base = await Q.baseMk(page);
const mf = n => 440 * Math.pow(2, (n - 69) / 12);
await T('MK7-08', async () => {
  const sec = 1.5, mod = noise(sec, .3, 21);
  const names = ['Säge', 'Puls', 'Dreieck', 'Sinus', 'Stimmwelle', 'Speicherwelle', 'Rauschen', 'Eingang'];
  const lv = [];
  for (let w = 0; w < 8; w++) {
    const s = vocSnd(base, {res: 64}, {o1: {w, c1: 0, c2: w === 5 ? 10 : 0}, mix: {o1: 127, o2: 0, n: 0}});
    const out = await render(page, s, [[0, 'on', 60, .8]], {sec, inputs: {e2: mod, e1: w === 7 ? sine(300, sec, .3) : null}});
    lv.push(db(rms(out.l, 12000)));
  }
  ok('MK7-08 jede OSZ-1-Welle hörbar (> −50 dBFS)', lv.every(x => x > -50), lv.map((x, i) => names[i] + ' ' + x.toFixed(1)).join(', '));
  // chord C-E-G-B (C4)
  {
    const notes = [60, 64, 67, 71], sec2 = 3;
    const out = await render(page, vocSnd(base, {res: 64}, {mix: {o1: 127, o2: 0, n: 0}}), notes.map(n => [0, 'on', n, .8]), {sec: sec2, inputs: {e2: noise(sec2, .3, 4)}});
    const N = 32768, P = welch(out.l, 24000, sec2 * SR, N);
    const pk = f => bandE(P, N, f * .99, f * 1.01), gap = bandE(P, N, 280, 300) / ((300 - 280) / (f => f)(1) ) ;
    const fs = notes.map(mf), vals = fs.map(f => db(Math.sqrt(pk(f) / (bandE(P, N, 270, 290) + 1e-30))));
    ok('MK7-08 Akkord C-E-G-H: 4 Tonhöhen', vals.every(v => v > 20), vals.map(v => v.toFixed(1)).join(' / ') + ' dB über der Lücke 270–290 Hz');
  }
  // EINGANG 1 mixes E1 into the carrier
  {
    const e1 = sine(1000, sec, .3);
    const a = await render(page, vocSnd(base, {res: 64, ins: 127}, {mix: {o1: 127, o2: 0, n: 0}}), [[0, 'on', 48, .8]], {sec, inputs: {e2: mod, e1}});
    const b = await render(page, vocSnd(base, {res: 64, ins: 0}, {mix: {o1: 127, o2: 0, n: 0}}), [[0, 'on', 48, .8]], {sec, inputs: {e2: mod, e1}});
    const N = 16384, ea = bandE(welch(a.l, 12000, sec * SR, N), N, 995, 1005), eb = bandE(welch(b.l, 12000, sec * SR, N), N, 995, 1005);
    ok('MK7-08 EINGANG 1 mischt E1 in den Träger', db(Math.sqrt(ea / eb)) > 20, '1 kHz +' + db(Math.sqrt(ea / eb)).toFixed(1) + ' dB');
  }
  // sine carrier C1 0 -> 127: M-SP +1/3 oct
  {
    const sc = async c1 => { const o = await render(page, vocSnd(base, {res: 64}, {o1: {w: 3, c1, c2: 0}, mix: {o1: 127, o2: 0, n: 0}}), [[0, 'on', 48, .8]], {sec, inputs: {e2: noise(sec, .3, 8)}}); const N = 8192; return centroid(welch(o.l, 12000, sec * SR, N), N); };
    const c0 = await sc(0), c1 = await sc(127), d = Math.log2(c1 / c0);
    ok('MK7-08 Sinus STEUER 1 0→127 hebt M-SP ≥ ⅓ Okt', d >= 1 / 3, `${c0.toFixed(0)} → ${c1.toFixed(0)} Hz (${d.toFixed(2)} Okt)`);
    // C2 127 with LFO1 slow: centroid wanders
    const sec3 = 4, o = await render(page, vocSnd(base, {res: 64}, {o1: {w: 3, c1: 0, c2: 127}, l1: {w: 2, ks: 0, sync: 0, f: 50, note: 6}, mix: {o1: 127, o2: 0, n: 0}}), [[0, 'on', 48, .8]], {sec: sec3, inputs: {e2: noise(sec3, .3, 8)}});
    const o0 = await render(page, vocSnd(base, {res: 64}, {o1: {w: 3, c1: 0, c2: 0}, l1: {w: 2, ks: 0, sync: 0, f: 50, note: 6}, mix: {o1: 127, o2: 0, n: 0}}), [[0, 'on', 48, .8]], {sec: sec3, inputs: {e2: noise(sec3, .3, 8)}});
    const track = x => { const N = 4096, cs = []; for (let s = 12000; s + N < x.length; s += 2400) cs.push(centroid(Q.spectrum(x, s, N), N)); return cs; };
    const A = track(o.l), B = track(o0.l), rng = a => Math.log2(Math.max(...a) / Math.min(...a));
    ok('MK7-08 Sinus STEUER 2 127 mit LFO1: M-SP wandert', rng(A) > rng(B) + .2, `Spanne ${rng(A).toFixed(2)} Okt (ohne C2: ${rng(B).toFixed(2)})`);
  }
});
await T('MK7-09', async () => {
  const sec = 1.5, synth = (t0) => { const s = JSON.parse(JSON.stringify(base)); const t = s.p.mk.t[0]; for (const k in t0) { if (typeof t0[k] === 'object' && !Array.isArray(t0[k])) Object.assign(t[k], t0[k]); else t[k] = t0[k]; } return s; };
  // filter curve: E1 sine 440 through 24LPF cutoff 40 vs the internal sine oscillator at A4 through the same filter
  const e1 = sine(440, sec, .5);
  const lvl = async (t0, inp) => { const o = await render(page, synth(t0), [[0, 'on', 69, .8]], {sec, inputs: inp}); return db(rms(o.l, 24000)); };
  const inOpen = await lvl({o1: {w: 7, c1: 0, c2: 0}, f: {type: 0, cut: 127}}, {e1}), inCut = await lvl({o1: {w: 7, c1: 0, c2: 0}, f: {type: 0, cut: 40}}, {e1});
  const sOpen = await lvl({o1: {w: 3, c1: 0, c2: 0}, f: {type: 0, cut: 127}}), sCut = await lvl({o1: {w: 3, c1: 0, c2: 0}, f: {type: 0, cut: 40}});
  ok('MK7-09 Eingang durch 24LPF Cutoff 40 nach Filterkurve (± 1 dB gegen Sinus-Osz.)', Math.abs((inCut - inOpen) - (sCut - sOpen)) <= 1 && inCut - inOpen < -10, `Eingang ${(inCut - inOpen).toFixed(1)} dB, Sinus-Osz. ${(sCut - sOpen).toFixed(1)} dB`);
  // balance
  const e2 = sine(1000, sec, .5), N = 16384;
  const sep = async c1 => { const o = await render(page, synth({o1: {w: 7, c1, c2: 0}}), [[0, 'on', 60, .8]], {sec, inputs: {e1, e2}}); const P = welch(o.l, 12000, sec * SR, N); return [bandE(P, N, 430, 450), bandE(P, N, 990, 1010)]; };
  const [a1, b1] = await sep(0), [a2, b2] = await sep(127);
  ok('MK7-09 BALANCE 0 nur E1 (≥ 40 dB)', db(Math.sqrt(a1 / b1)) >= 40, db(Math.sqrt(a1 / b1)).toFixed(1) + ' dB');
  ok('MK7-09 BALANCE 127 nur E2 (≥ 40 dB)', db(Math.sqrt(b2 / a2)) >= 40, db(Math.sqrt(b2 / a2)).toFixed(1) + ' dB');
  // transpose / fine no effect
  const r0 = await render(page, synth({o1: {w: 7, c1: 0, c2: 0}}), [[0, 'on', 60, .8]], {sec, inputs: {e1}});
  const r1 = await render(page, synth({o1: {w: 7, c1: 0, c2: 0}, trans: 12, tune: 40}), [[0, 'on', 60, .8]], {sec, inputs: {e1}});
  let md = 0; for (let i = 0; i < r0.l.length; i++) md = Math.max(md, Math.abs(r0.l[i] - r1.l[i]));
  ok('MK7-09 TRANSP./FEIN wirkungslos', md < 1e-6, 'max |Δ| ' + md);
  // pitch of key has no effect either (different keys same level)
  const k1 = await render(page, synth({o1: {w: 7, c1: 0, c2: 0}}), [[0, 'on', 48, .8]], {sec, inputs: {e1}});
  const P1 = welch(k1.l, 12000, sec * SR, N); const harm = bandE(P1, N, 120, 140);
  ok('MK7-09 Taste ohne Tonhöhe (kein C3 im Ausgang)', db(Math.sqrt(harm / bandE(P1, N, 430, 450))) < -60, db(Math.sqrt(harm / bandE(P1, N, 430, 450))).toFixed(1) + ' dB');
});
await T('MK7-11', async () => {
  // limiter stage 1: switch at 1.0 s while a noise carrier and noise modulator play; M-PEGEL and neighbour-band attenuation
  const sec = 3, s = vocSnd(base, {res: 64}, {mix: {o1: 0, o2: 0, n: 127}});
  const flat = await page.evaluate(() => null);
  const a = await render(page, s, [[0, 'on', 48, .8]], {sec, inputs: {e2: noise(sec, .3, 2)}, at: [[1.0, {set: {mkLim: 1}}]]});
  const b = await render(page, s, [[0, 'on', 48, .8]], {sec, inputs: {e2: noise(sec, .3, 2)}});
  const lA = db(rms(a.l, 2 * SR, 3 * SR)), lB = db(rms(b.l, 2 * SR, 3 * SR)), pre = db(rms(a.l, .5 * SR, SR));
  let md = 0; for (let i = 2 * SR; i < 3 * SR; i++) md = Math.max(md, Math.abs(a.l[i] - b.l[i]));
  ok('MK7-11 Stufe 1 schaltet um (Ausgang ändert sich)', md > 1e-4, 'max |Δ| ' + md.toExponential(2));
  ok('MK7-11 Stufe 1 M-PEGEL ± 1 dB', Math.abs(lA - lB) <= 1, `${(lA - lB).toFixed(2)} dB`);
  // neighbour band: sine at band 8 centre, stage 1 from the start
  const C = k => R[k + 3], edge = (x, y) => Math.sqrt(x * y), reg = k => [edge(R[k + 2], R[k + 3]), edge(R[k + 3], R[k + 4])];
  let worst = 99;
  for (const k of [3, 8, 13]) {
    const o = await render(page, s, [[0, 'on', 48, .8]], {sec: 3, inputs: {e2: sine(C(k), 3, .3)}, at: [[0.0, {set: {mkLim: 1}}]]});
    const N = 8192, P = welch(o.l, 1.5 * SR, 3 * SR, N), E = j => { const [x, y] = reg(j); return bandE(P, N, x, y); };
    for (const d of [-1, 1]) worst = Math.min(worst, db(Math.sqrt(E(k) / E(k + d))));
  }
  ok('MK7-11 Stufe 1 Nachbarband ≥ 8 dB', worst >= 8, worst.toFixed(1) + ' dB');
  // M-KLICK around the switch (HP 5 kHz, 2 ms windows, +6 dB over median ±20 ms)
  const hp = x => { const y = new Float64Array(x.length); const fc = 5000, g = Math.tan(Math.PI * fc / SR); let z1 = 0, z2 = 0, z3 = 0, z4 = 0;
    for (let i = 0; i < x.length; i++) { // two 2nd-order TPT HP in cascade
      let v = x[i]; { const k = Math.SQRT2, a1 = 1 / (1 + g * (g + k)); const v3 = v - z2, v1 = a1 * z1 + g * a1 * v3, v2 = z2 + g * a1 * z1 + g * g * a1 * v3; z1 = 2 * v1 - z1; z2 = 2 * v2 - z2; v = v - k * v1 - v2; }
      { const k = Math.SQRT2, a1 = 1 / (1 + g * (g + k)); const v3 = v - z4, v1 = a1 * z3 + g * a1 * v3, v2 = z4 + g * a1 * z3 + g * g * a1 * v3; z3 = 2 * v1 - z3; z4 = 2 * v2 - z4; v = v - k * v1 - v2; }
      y[i] = v; } return y; };
  const h = hp(a.l), W = 96, E = []; for (let i = 0; i + W <= h.length; i += W) { let s2 = 0; for (let j = i; j < i + W; j++) s2 += h[j] * h[j]; E.push(10 * Math.log10(s2 / W + 1e-30)); }
  let worstK = -99; const i0 = Math.round(.9 * SR / W), i1 = Math.round(1.2 * SR / W);
  for (let i = i0; i < i1; i++) { const nb = E.slice(i - 10, i + 11).slice().sort((x, y) => x - y), med = nb[10]; worstK = Math.max(worstK, E[i] - med); }
  ok('MK7-11 Stufe 1 M-KLICK (≤ +6 dB)', worstK <= 6, '+' + worstK.toFixed(1) + ' dB');
});
console.log('errs', errs.slice(0, 5));
Q.summary(); await br.close();
