// Varianten Stufe 1: inkrementelle Phase, Float64-Tabelle
const sr = 48000, fo = 22050, x = new Float32Array(sr * 180); for (let k = 0; k < x.length; k++) x[k] = Math.sin(k * .01) * .3 + Math.sin(k * .37) * .1;
const T = 14, P = 147, num = 320, L = x.length, n = Math.floor(L * fo / sr);
for (const Tab of [Float32Array, Float64Array]) {
  const tab = new Tab(P * T); for (let k = 0; k < tab.length; k++) tab[k] = Math.random() / T;
  for (let rep = 0; rep < 3; rep++) {
    let t = Date.now(); const y = new Float32Array(n), K = 7;
    const di = Math.floor(num / P), dp = num - di * P; let n0 = 0, p = 0;
    for (let j = 0; j < n; j++) {
      const a = n0 - K + 1, o = p * T; let s = 0;
      if (a >= 0 && a + T <= L) for (let m = 0; m < T; m++) s += x[a + m] * tab[o + m];
      y[j] = s; n0 += di; p += dp; if (p >= P) { p -= P; n0++; }
    }
    const t1 = Date.now() - t; t = Date.now();
    let z = 0; for (let k = 0; k < L; k++) z += x[k] * x[k]; const t2 = Date.now() - t;
    console.log(Tab.name, 'inkrementell', t1, 'ms; reines Skalarprodukt über', L, 'Proben', t2, 'ms', z > 0);
  }
}
