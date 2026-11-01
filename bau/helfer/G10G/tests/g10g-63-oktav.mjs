// G10-63: eingestreuter Oktav-Fehler (Erkennung springt +12 in einer Note) → Hart zieht ≤ 150 ct (mit v = 2).
// (a) Erkennungs-Fehler: in der echten Analyse eines Takes springt f0 in der Mitte einer Note um +12 → Kern-Kurve (G2P.curve) mit dem Plan
//     des Takes (v = 2) bleibt ≤ 150 ct; derselbe Plan ohne v (4.30.0) zieht die Stelle eine Oktave (≈ 1200 ct) – das war der Ausreißer.
// (b) Audio: Take, dessen Ton in einer Note wirklich eine Oktave springt → Hart: keine Verschiebung > 150 ct in dieser Note.
import {launch, open, takeIn, edOpen, sleep, ok, done} from './lib.mjs';
const br = await launch(), p = await open(br, 428, 926);
const mel = [64.2, 65.3, 67.2, 60.4, 62.3].map(m => ({m, d: 0.4}));
const T = await takeIn(p, mel); await edOpen(p, T.ref);
await p.evaluate(r => SYNQUENZER.g2Quantize(r, {q: true, mode: 'hard', str: 1}), T.ref);
const R = await p.evaluate(id => {
  const A = G2.an.get(id), plan = g2Plan(id), k = 2, n = plan.notes[k];
  const f0 = Float32Array.from(A.f0), a = Math.ceil(n.t0 / A.hop), b = Math.floor(n.t1 / A.hop), mid = [a + Math.floor((b - a) * .4), a + Math.floor((b - a) * .6)];
  for (let i = mid[0]; i < mid[1]; i++) if (f0[i] > 0) f0[i] *= 2;                     // Erkennung springt +12
  const an = {n: A.n, hop: A.hop, f0}, mx = c => { let m = 0; for (let i = a; i < b; i++) m = Math.max(m, Math.abs(c[i])); return m; };
  const c2 = G2P.curve(an, plan).c, old = Object.assign({}, plan); delete old.v; delete old.rt;
  const c1 = G2P.curve(an, old).c, c2clean = G2P.curve({n: A.n, hop: A.hop, f0: A.f0}, plan).c, c1clean = G2P.curve({n: A.n, hop: A.hop, f0: A.f0}, old).c;
  let same = true; for (let i = 0; i < A.n; i++) if (i < a || i >= b) { if (Math.abs(c2clean[i] - c1clean[i]) > 1e-9 && plan.rt === 15) same = false; }
  return {v: plan.v, rt: plan.rt, max2: mx(c2), max1: mx(c1), frames: mid[1] - mid[0], same};
}, T.id);
ok(R.v === 2, 'neuer Take: Plan mit v = 2 (Einrast-Zeit ' + R.rt + ' ms)');
ok(R.max2 <= 150, `Erkennung springt +12 in ${R.frames} Frames: Hart zieht höchstens ${R.max2.toFixed(1)} ct (≤ 150)`);
ok(R.max1 > 1000, `Vergleich ohne v (4.30.0-Rechnung): ${R.max1.toFixed(0)} ct – der Ausreißer, den die Klammer abfängt`);
ok(R.same, 'ohne Ausreißer und bei 15 ms: Kurve mit v = 2 gleich der alten (die Klammer greift nur bei Ausreißern)');
// (b) echter Oktav-Sprung im Audio
const mel2 = [64.2, 65.3, 67.2, 60.4].map((m, i) => ({m, d: 0.45, oct: i === 1}));
const T2 = await takeIn(p, mel2); await p.evaluate(() => SYNQUENZER.g2Close()); await edOpen(p, T2.ref);
await p.evaluate(r => SYNQUENZER.g2Quantize(r, {q: true, mode: 'hard', str: 1}), T2.ref);
const R2 = await p.evaluate(id => { const A = G2.an.get(id), plan = g2Plan(id); if (!plan) return {none: true, notes: g2Notes(id)};
  const c = G2P.curve({n: A.n, hop: A.hop, f0: A.f0}, plan).c; let m = 0; for (let i = 0; i < A.n; i++) m = Math.max(m, Math.abs(c[i])); return {max: m, notes: plan.notes.map(n => [n.t0, n.t1, n.m, n.to])}; }, T2.id);
ok(R2.none || R2.max <= 150, `Audio mit Oktav-Sprung in Note 2: größte Verschiebung ${R2.none ? 0 : R2.max.toFixed(1)} ct (≤ 150) · Noten ${JSON.stringify(R2.notes)}`);
ok(!p.errs.length, 'Konsole sauber ' + JSON.stringify(p.errs.slice(0, 2)));
await br.close(); done();
