// I1f NEIGEN math in Node (I1-62 / I1-63 by calculation): sensor angles are made from rotation matrices and go through
// NEIGEN.rot (as the browser event would deliver them), θ and the mapping are checked against §6.7.
import {createRequire} from 'module'; const require = createRequire(import.meta.url);
const N = require('../src/neigen.js');
const D = Math.PI / 180;
const mul = (A, B) => { const C = new Float64Array(9); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) C[i * 3 + j] = A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j]; return C; };
const Rx = p => { const c = Math.cos(p * D), s = Math.sin(p * D); return Float64Array.of(1, 0, 0, 0, c, -s, 0, s, c); };
const Ry = p => { const c = Math.cos(p * D), s = Math.sin(p * D); return Float64Array.of(c, 0, s, 0, 1, 0, -s, 0, c); };
const Rz = p => { const c = Math.cos(p * D), s = Math.sin(p * D); return Float64Array.of(c, -s, 0, s, c, 0, 0, 0, 1); };
// matrix -> W3C angles (alpha 0..360, beta -180..180, gamma -90..90)
export function euler(R) {
  let cb = Math.hypot(R[6], R[8]); if (R[8] < 0) cb = -cb;
  const b = Math.atan2(R[7], cb) / D, g = Math.atan2(-R[6] / cb, R[8] / cb) / D; let a = Math.atan2(-R[1] / cb, R[4] / cb) / D; if (a < 0) a += 360;
  return [a, b, g];
}
const viaSensor = R => { const [a, b, g] = euler(R); return N.rot(a, b, g, new Float64Array(9)); };
let fail = 0, n = 0; const ok = (c, m) => { n++; console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
// device frame: x = right, y = top (portrait), z = towards the face. „top edge away from the body“ = rotation about the screen-right axis
const away = (ang, deg) => { const s = Math.sin(ang * D), c = Math.cos(ang * D); return axisRot([c, -s, 0], -deg); };
function axisRot(k, deg) { const [x, y, z] = k, c = Math.cos(deg * D), s = Math.sin(deg * D), C = 1 - c;
  return Float64Array.of(c + x * x * C, x * y * C - z * s, x * z * C + y * s, y * x * C + z * s, c + y * y * C, y * z * C - x * s, z * x * C - y * s, z * y * C + x * s, c + z * z * C); }
const ref0 = mul(mul(Rz(30), Rx(40)), Ry(0));
for (const ang of [0, 90, 270]) {
  const Rref = viaSensor(ref0);
  const up = (ang2 => { const s = Math.sin(ang2 * D), c = Math.cos(ang2 * D); return [s, c, 0]; })(ang);
  for (const d of [15, -15]) {
    const th = N.theta(Rref, viaSensor(mul(ref0, away(ang, d))), ang), x = N.mapX(.5, th);
    ok(Math.abs(x - (.5 + Math.sign(d) * .45)) <= .02, `I1-62 angle ${ang}: ${d > 0 ? '+' : ''}${d}° → θ ${th.toFixed(3)}°, x ${x.toFixed(4)} (Soll ${(.5 + Math.sign(d) * .45).toFixed(2)} ± 0,02)`);
  }
  const yaw = mul(mul(ref0, away(ang, 15)), axisRot(up, 20));
  const th2 = N.theta(Rref, viaSensor(yaw), ang), x2 = N.mapX(.5, th2) - .5;
  ok(Math.abs(x2 - .45) <= .03, `I1-62 angle ${ang}: +15° dann 20° um die Hochachse → Δx ${x2.toFixed(4)} (Soll 0,45 ± 0,03)`);
  const th3 = N.theta(Rref, viaSensor(mul(ref0, axisRot([0, 0, 1], 20))), ang), x3 = N.mapX(.5, th3) - .5;
  ok(Math.abs(x3) <= .02, `I1-62 angle ${ang}: nur 20° um die Bildschirm-Normale → Δx ${x3.toFixed(4)} (Soll 0 ± 0,02), θ ${th3.toFixed(3)}°`);
}
ok(N.mapX(.9, 30) === 1 && N.mapX(.1, -30) === 0, 'I1-62 Klemme bei 0/1: mapX(0,9, +30°) = ' + N.mapX(.9, 30) + ', mapX(0,1, −30°) = ' + N.mapX(.1, -30));
// I1-63: reference at beta 85°, tilt on over 90° (in 0.25° steps) – continuous
{
  const r = mul(mul(Rz(10), Rx(85)), Ry(3)), Rref = viaSensor(r); let prev = null, maxStep = 0, eul = [];
  for (let d = 0; d <= 20; d += .25) {
    const R = mul(r, away(0, -d)); const e = euler(R); eul.push(e[1]);
    const x = N.mapX(.5, N.theta(Rref, N.rot(e[0], e[1], e[2], new Float64Array(9)), 0)); if (prev != null) maxStep = Math.max(maxStep, Math.abs(x - prev)); prev = x;
  }
  ok(maxStep <= .02, `I1-63 Bezug beta 85°, über 90° hinaus (beta ${Math.max(...eul).toFixed(1)}° … gamma springt ±180): größter Schritt ${(maxStep * 100).toFixed(3)} % (Grenze 2 %)`);
}
// work per event (math only)
{ const A = new Float64Array(9), B = new Float64Array(9); N.rot(10, 40, 3, A); const t0 = process.hrtime.bigint(); let s = 0;
  for (let i = 0; i < 100000; i++) { N.rot(10 + i * 1e-4, 40, 3, B); s += N.theta(A, B, 0); }
  const us = Number(process.hrtime.bigint() - t0) / 1e5 / 1e3; ok(us < 200, `Rechnung je Ereignis ${us.toFixed(2)} µs (Grenze 200 µs)`); }
console.log(fail ? `FAIL ${fail}/${n}` : `ALL OK ${n}/${n}`); process.exit(fail ? 1 : 0);
