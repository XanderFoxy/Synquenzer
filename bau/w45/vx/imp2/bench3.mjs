// Stufe 1 Varianten: Aufrollen ×2, Float32-Tabelle, inkrementelle Phase
const sr = +process.argv[2] || 48000, fo = 22050, x = new Float32Array(sr * 180); for (let k = 0; k < x.length; k++) x[k] = Math.sin(k * .01) * .3 + Math.sin(k * .37) * .1;
const T = 14, P = 147, num = Math.round(sr / 150), L = x.length, n = Math.floor(L * fo / sr), K = 7;
const tab = new Float32Array(P * T); for (let k = 0; k < tab.length; k++) tab[k] = Math.random() / T;
const di = Math.floor(num / P), dp = num - di * P;
const v1 = () => { const y = new Float32Array(n); let n0 = 0, p = 0; for (let j = 0; j < n; j++) { const a = n0 - K + 1, o = p * T; let s = 0; if (a >= 0 && a + T <= L) for (let m = 0; m < T; m++) s += x[a + m] * tab[o + m]; y[j] = s; n0 += di; p += dp; if (p >= P) { p -= P; n0++; } } return y; };
const v2 = () => { const y = new Float32Array(n); let n0 = 0, p = 0; for (let j = 0; j < n; j++) { const a = n0 - K + 1, o = p * T; let s = 0, s2 = 0; if (a >= 0 && a + T <= L) for (let m = 0; m < T; m += 2) { s += x[a + m] * tab[o + m]; s2 += x[a + m + 1] * tab[o + m + 1]; } y[j] = s + s2; n0 += di; p += dp; if (p >= P) { p -= P; n0++; } } return y; };
const v3 = () => { const y = new Float32Array(n); let n0 = 0, p = 0; for (let j = 0; j < n; j++) { let a = n0 - K + 1, o = p * T; const e = o + T; let s = 0; if (a >= 0 && a + T <= L) for (; o < e; o += 2, a += 2) s += x[a] * tab[o] + x[a + 1] * tab[o + 1]; y[j] = s; n0 += di; p += dp; if (p >= P) { p -= P; n0++; } } return y; };
for (let r = 0; r < 3; r++) for (const [nm, f] of [['v1', v1], ['v2', v2], ['v3', v3]]) { const t = Date.now(); f(); console.log(nm, Date.now() - t); }
