const fs = require('fs');
const get = f => { const s = fs.readFileSync(f, 'utf8'), a = s.indexOf('function spk7CoreMake(SR){'), b = s.indexOf('\nconst SPK7={', a); return new Function(s.slice(a, b) + ';return spk7CoreMake;')(); };
const SR = 48000, x = new Float32Array(2 * SR); for (let i = 0; i < x.length; i++) x[i] = 0.4 * Math.sin(2 * Math.PI * 196 * i / SR) + 0.1 * Math.sin(2 * Math.PI * 1234 * i / SR);
const NF = 8, FL = 2048, frz = new Float32Array(NF * FL); for (let i = 0; i < frz.length; i++) frz[i] = 0.3 * Math.sin(2 * Math.PI * 3 * (i % FL) / FL);
const go = (mk, p) => { const C = mk(SR); C.msg({t: 'p', p}); C.msg({t: 'src', x, sr: SR, f0: 196, frz, FL, fk: 1}); for (let k = 0; k < 6; k++) { C.msg({t: 'on', id: k + 1, m: 55 + k * 2, v: 0.8, at: k * 0.05}); C.msg({t: 'off', id: k + 1, at: 0.3 + k * 0.05}); }
  const N = SR, L = new Float32Array(N), R = new Float32Array(N); for (let fr = 0; fr < N; fr += 128) { const l = new Float32Array(128), r = new Float32Array(128); C.render(l, r, 128, fr); L.set(l, fr); R.set(r, fr); } return [L, R]; };
const A = get(process.argv[2]), B = get(process.argv[3]); let diff = 0, tot = 0;
for (const p of [{}, {art: 'frz'}, {bew: 1.2, spo: 0.5, fc: 0.5, q: 0.6}, {poly: 3, a: 0.3}]) { const [l1, r1] = go(A, p), [l2, r2] = go(B, p); for (let i = 0; i < l1.length; i++) { tot++; if (l1[i] !== l2[i] || r1[i] !== r2[i]) diff++; } }
console.log(JSON.stringify({proben: tot, abweichend: diff}));
