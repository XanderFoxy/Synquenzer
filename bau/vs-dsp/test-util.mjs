// test-util.mjs — kleine Prüfhilfen für die Node-Tests (nur Tests)
export function suite(name) {
  const res = [];
  const check = (id, cond, detail) => { res.push({id, ok: !!cond, detail}); console.log((cond ? 'OK   ' : 'FAIL ') + id + (detail != null ? '  ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) : '')); };
  const info = (id, detail) => { res.push({id, ok: null, detail}); console.log('INFO ' + id + '  ' + (typeof detail === 'string' ? detail : JSON.stringify(detail))); };
  const done = () => {
    const fail = res.filter(r => r.ok === false);
    console.log(`\n${name}: ${res.filter(r => r.ok).length} OK, ${fail.length} FAIL`);
    console.log('SUMMARY ' + JSON.stringify({suite: name, ok: res.filter(r => r.ok).length, fail: fail.map(f => f.id), results: res}));
    if (fail.length) process.exitCode = 1;
  };
  return {check, info, done};
}
export const maxJump = (x, a = 1, b = x.length) => { let m = 0; for (let i = Math.max(1, a); i < b; i++) { const d = Math.abs(x[i] - x[i - 1]); if (d > m) m = d; } return m; };
// Grundfrequenz sehr genau (normierte Autokorrelation + parabolische Interpolation), Mittel über Fenster
export function f0Of(x, sr, a, b, fmin = 80, fmax = 600) {
  const W = Math.round(0.06 * sr), hop = Math.round(0.02 * sr), tMin = Math.floor(sr / fmax), tMax = Math.ceil(sr / fmin), out = [];
  for (let s = a; s + W + tMax < b; s += hop) {
    const r = new Float64Array(tMax + 2);
    let e0 = 0; for (let i = 0; i < W; i++) e0 += x[s + i] * x[s + i];
    for (let t = tMin - 1; t <= tMax + 1; t++) { let c = 0, e1 = 0; for (let i = 0; i < W; i++) { c += x[s + i] * x[s + i + t]; e1 += x[s + i + t] * x[s + i + t]; } r[t] = c / Math.sqrt(e0 * e1 + 1e-20); }
    let bt = tMin; for (let t = tMin; t <= tMax; t++) if (r[t] > r[bt]) bt = t;
    // erstes Maximum ≥ 0,9·max (Oktavfehler vermeiden)
    for (let t = tMin; t <= tMax; t++) if (r[t] >= 0.9 * r[bt] && r[t] >= r[t - 1] && r[t] >= r[t + 1]) { bt = t; break; }
    const y0 = r[bt - 1], y1 = r[bt], y2 = r[bt + 1], den = y0 - 2 * y1 + y2, tf = den < 0 ? bt + 0.5 * (y0 - y2) / den : bt;
    out.push(sr / tf);
  }
  out.sort((p, q) => p - q);
  return out.length ? out[out.length >> 1] : NaN;
}
export const cents = (a, b) => 1200 * Math.log2(a / b);
