import fs from 'node:fs';
const H = fs.readFileSync('index.html', 'utf8'), i = H.indexOf('  /* IMP2-BEGIN'), j = H.indexOf('/* IMP2-END */');
const src = H.slice(i, j);
const M = new Function(src + '\nreturn {imp2Rs, imp2Down, imp2Kai};')();
for (const sr of [44100, 48000, 96000]) {
  const x = new Float32Array(sr * 180); for (let k = 0; k < x.length; k++) x[k] = Math.sin(k * .01) * .3 + Math.sin(k * .37) * .1;
  for (let rep = 0; rep < 2; rep++) {
  let t = Date.now(); const y = M.imp2Rs(x, sr, 22050, 11025, 12050); const t1 = Date.now() - t;
  t = Date.now(); M.imp2Down(y, 22050); const t2 = Date.now() - t;
  t = Date.now(); M.imp2Down(x, sr); const t3 = Date.now() - t;
  console.log(sr, 'stufe1', t1, 'stufe2', t2, 'gesamt', t3);
  }
}
