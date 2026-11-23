// TON1 Kern-Test (Node): spk7CoreMake aus index.html, Stimme startet ohne Quelle, Quelle kommt nach 150 ms
const fs = require('fs');
const f = process.argv[2], s = fs.readFileSync(f, 'utf8');
const a = s.indexOf('function spk7CoreMake(SR){'), b = s.indexOf('\nconst SPK7={', a);
const make = new Function(s.slice(a, b) + ';return spk7CoreMake;')();
const SR = 48000, sec = 3, x = new Float32Array(sec * SR); for (let i = 0; i < x.length; i++) x[i] = 0.5 * Math.sin(2 * Math.PI * 220 * i / SR);
const run = (lateMs, offMs, p) => {
  const C = make(SR); C.msg({t: 'p', p: Object.assign({a: 0.02, d: 0.3, s: 0.8, r: 0.4}, p || {})});
  if (!lateMs) C.msg({t: 'src', x, sr: SR, f0: 220});
  C.msg({t: 'on', id: 1, m: 57, v: 0.9, at: 0}); if (offMs != null) C.msg({t: 'off', id: 1, at: offMs / 1000});
  const N = Math.round(0.8 * SR), L = new Float32Array(N), R = new Float32Array(N); let fr = 0;
  while (fr < N) { if (lateMs && fr >= lateMs / 1000 * SR && !run.fed) { C.msg({t: 'src', x, sr: SR, f0: 220}); run.fed = 1; } const l = new Float32Array(128), r = new Float32Array(128); C.render(l, r, 128, fr); L.set(l.subarray(0, Math.min(128, N - fr)), fr); R.set(r.subarray(0, Math.min(128, N - fr)), fr); fr += 128; }
  run.fed = 0;
  let nan = 0, jmp = 0; for (let i = 1; i < N; i++) { if (L[i] !== L[i]) nan++; jmp = Math.max(jmp, Math.abs(L[i] - L[i - 1])); }
  const rms = (t0, t1) => { let q = 0, n = 0; for (let i = Math.round(t0 * SR); i < Math.round(t1 * SR); i++) { q += L[i] * L[i]; n++; } return +Math.sqrt(q / n).toFixed(4); };
  return {nan, jmp: +jmp.toFixed(4), r160_200: rms(.16, .2), r250_300: rms(.25, .3), r400_450: rms(.4, .45)};
};
const out = {
  sofort: run(0, null), spaet150: run(150, null),
  sofortAus100: run(0, 100), spaet150Aus100: run(150, 100),
  padSofort: run(0, null, {a: 0.5}), padSpaet150: run(150, null, {a: 0.5}),
};
console.log(JSON.stringify(out));
