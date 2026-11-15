// FOK2: „Noten finden“ auf dem Rest mit STEREO-Dokument – neu (Rest der Mitte) gegen basis (Mitte der Rest-Kanäle): gleiche Noten?
// Aufruf: node fok2-stereo-noten.mjs <index.html> <basis.html>
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const files = [path.resolve(process.argv[2]), path.resolve(process.argv[3])], dir = path.dirname(files[0]);
const srv = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': 'text/html; charset=utf-8'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok)); const base = 'http://127.0.0.1:' + srv.address().port + '/';
const b = await chromium.launch(), out = {};
for (const [tag, file] of [['neu', files[0]], ['basis', files[1]]]) {
  const ctx = await b.newContext({viewport: {width: 428, height: 926}}), p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto(base + path.basename(file)); await p.waitForFunction(() => window.SYNQUENZER && window.__spk && window.__fokus1, null, {timeout: 120000});
  out[tag] = await p.evaluate(async () => {
    await __spk.page.open({}); const sr = 44100, n = 14 * sr, L = new Float32Array(n), R = new Float32Array(n); let s1 = 7; const rnd = () => ((s1 = (s1 * 1103515245 + 12345) >>> 0) / 4294967296) * 2 - 1;
    const tone = (f, a, b2, pl, pr) => { for (let i = Math.round(a * sr); i < Math.round(b2 * sr); i++) { const e = Math.min(1, (i - a * sr) / 441, (b2 * sr - i) / 441); let v = 0; for (let h = 1; h <= 8; h++) v += 0.3 / h * Math.sin(2 * Math.PI * f * h * i / sr); L[i] += pl * e * v; R[i] += pr * e * v; } };
    tone(220, 2, 6, 1, 0.4); tone(311.13, 8, 12, 0.3, 1); tone(392, 3, 11, 0.5, 0.5); for (let i = 0; i < n; i++) { L[i] += 0.002 * rnd(); R[i] += 0.002 * rnd(); }
    const r = await __spk.load({name: 'Stereo-Rest', sr, ch: [L, R]}); await __spk.page.open({id: r.meta.id}); await new Promise(z => setTimeout(z, 1500));
    await __spk.mask({von: 'orig', nach: 'neu', modus: 'verschieben', sel: [{art: 'rect', t0: 1.9, t1: 6.1, f0: 150, f1: 2200, kt: 0, kf: 0}]});
    const U = __spk.page.ui(); U.f1 = {mode: 'rest', aus: 'alle'}; const t0 = performance.now();
    const rr = await __spk.spk2.noten('orig', []); U.f1 = null; const ms = performance.now() - t0, N = rr.meta.teil2.notes.orig || [];
    const F = await __fokus1.get({mode: 'rest', aus: 'alle', N: 4096});
    return {fokus: rr.fokus, ms: +ms.toFixed(0), notes: N.map(q => [+q.f.toFixed(1), +q.a.toFixed(2), +q.b.toFixed(2), q.st, q.conf != null ? +q.conf.toFixed(2) : null]), anteil: F.anteil};
  });
  out[tag].errs = errs; console.log(tag, JSON.stringify(out[tag])); await ctx.close();
}
const gleich = JSON.stringify(out.neu.notes) === JSON.stringify(out.basis.notes);
console.log((gleich ? 'OK    ' : 'FEHLER') + ' noten-auf-rest stereo gleich neu/basis', out.neu.notes.length, 'Noten; Zeit neu', out.neu.ms, 'ms, basis', out.basis.ms, 'ms; Fehler', out.neu.errs.length + out.basis.errs.length);
fs.writeFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), 'fok2-stereo-noten.json'), JSON.stringify({out, gleich}, null, 1));
await b.close(); srv.close();
