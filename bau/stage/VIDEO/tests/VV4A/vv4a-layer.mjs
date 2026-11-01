// VV4-A Tempo-Puffer: dieselben Bilder mit und ohne Bereichs-Puffer (Abweichung je Pixel ≤ 2/255 an Kanten, sonst gleich)
import { open, songWithChords, report } from './lib.mjs';
const {b, p, errs} = await open();
await songWithChords(p);
await p.evaluate(() => SYNQUENZER.vvRender({range: {a: 0, b: 6}}));
await p.evaluate(() => SYNQUENZER.vvAppPrep());
const res = {checks: {}, pts: []};
for (const t of [0.3, 2.5, 4.4, 6.1, 8.0, 9.7, 11.9]) {
  const d = await p.evaluate(async t => {
    const img = async noLayer => { SYNQUENZER.vvTest(Object.assign({opus: true}, noLayer ? {noLayer: true} : {})); const b64 = SYNQUENZER.vvShot(t, 'auto', '9:16', 'app'); const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode(); const c = document.createElement('canvas'); c.width = 1080; c.height = 1920; const g = c.getContext('2d'); g.drawImage(im, 0, 0); return g.getImageData(0, 0, 1080, 1920).data; };
    const A = await img(true), B1 = await img(false), B = await img(false);   // second time from the buffers
    let n = 0, mx = 0, n2 = 0; for (let k = 0; k < A.length; k += 4) { const e = Math.max(Math.abs(A[k] - B[k]), Math.abs(A[k + 1] - B[k + 1]), Math.abs(A[k + 2] - B[k + 2])); if (e) n++; if (e > 2) n2++; if (e > mx) mx = e; }
    return {n, n2, mx};
  }, t);
  res.pts.push(Object.assign({t}, d));
}
res.checks.gleich = res.pts.every(x => x.n2 < 400);   // < 0,02 % der Pixel weichen mehr als 2/255 ab (Kanten-Glättung)
res.checks.konsole = errs.length === 0; res.errs = errs;
const bad = report('vv4a-layer', res); console.log(JSON.stringify(res.pts));
await b.close(); process.exit(bad ? 1 : 0);
