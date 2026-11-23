// ZRL2: Quantisierung ohne log10 gegen die alte Formel – alle float32-Werte in Schwellen-Zellen, sonst Stichprobe; dazu Tempo
import fs from 'node:fs';
const src = fs.readFileSync(new URL('../block-q.js', import.meta.url), 'utf8');
const {zrl2Q, zrl2Qx, zrl2QTab} = new Function(src + ';return{zrl2Q,zrl2Qx,zrl2QTab};')();
const alt = (X, n, Q, o) => { for (let i = 0; i < n; i++) { const v = X[i] > 0 ? Math.round((20 * Math.log10(X[i]) + 90) * 1.6) : 0; Q[o + i] = v < 1 ? (X[i] > 0 ? 1 : 0) : v > 255 ? 255 : v; } };
let t = performance.now(); const T = zrl2QTab(); console.log('Tabelle ms', (performance.now() - t).toFixed(1));
let nTh = 0, nNaN = 0; for (let c = 0; c < T.th.length; c++) { if (T.th[c] !== Infinity) { if (T.th[c] !== T.th[c]) nNaN++; else nTh++; } }
console.log('Schwellen-Zellen', nTh, 'NaN-Zellen', nNaN);
const CH = 1 << 20, U = new Uint32Array(CH), X = new Float32Array(U.buffer), Q1 = new Uint8Array(CH), Q2 = new Uint8Array(CH);
let geprueft = 0, falsch = 0;
function pruef(m) { zrl2Q(X, m, Q1, 0); alt(X, m, Q2, 0); for (let i = 0; i < m; i++) if (Q1[i] !== Q2[i]) { if (falsch++ < 5) console.log('FALSCH', X[i], Q1[i], Q2[i]); } geprueft += m; }
let m = 0;
for (let c = 0; c < 0x4000 + 0x3FC0; c++) {   // positive Zellen + negative (Vorzeichen) Stichprobe
  const voll = c < 0x3FC0 && T.th[c] !== Infinity, st = voll ? 1 : 4093;
  for (let k = 0; k < 0x20000; k += st) { U[m++] = ((c << 17) | k) >>> 0; if (m === CH) { pruef(m); m = 0; } }
  U[m++] = ((c << 17) | 0x1FFFF) >>> 0; if (m === CH) { pruef(m); m = 0; }
}
for (const b of [0x7F800000, 0x7FC00000, 0xFF800000, 0x80000000, 0]) { U[m++] = b; if (m === CH) { pruef(m); m = 0; } }
if (m) pruef(m);
console.log('geprueft', geprueft, 'falsch', falsch);
// Tempo: echte Betrags-Verteilung grob nachgebildet (log-gleichverteilt 1e-6 … 1e3)
const n = 2048 * 467 * 4, Y = new Float32Array(n); let s = 1; for (let i = 0; i < n; i++) { s = (s * 1103515245 + 12345) >>> 0; Y[i] = Math.pow(10, -6 + 9 * (s / 4294967296)); }
const A = new Uint8Array(n), B = new Uint8Array(n);
for (let r = 0; r < 3; r++) { let t0 = performance.now(); alt(Y, n, A, 0); const ta = performance.now() - t0; t0 = performance.now(); zrl2Q(Y, n, B, 0); const tb = performance.now() - t0; let d = 0; for (let i = 0; i < n; i++) if (A[i] !== B[i]) d++; console.log('Runde', r, 'alt ms', ta.toFixed(0), 'neu ms', tb.toFixed(0), 'Abweichungen', d); }
