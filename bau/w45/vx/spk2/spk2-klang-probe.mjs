// SPK2 Auftrag 4 Prüfung: bekannte App-Klänge (VA, FM, Werksklang) rendern → analysieren → nachbauen → Parameter nah dran, Abstand klein.
// Aufruf: node spk2-klang-probe.mjs <index.html>
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const file = path.resolve(process.argv[2] || 'index.html'), dir = path.dirname(file);
const srv = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': p.endsWith('.html') ? 'text/html' : 'application/octet-stream'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok));
const url = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(file);
const res = {}, errs = [];
const ok = (k, v, cond) => { res[k] = {v, ok: !!cond}; console.log((cond ? 'OK  ' : 'FEHL') + ' ' + k + ' ' + JSON.stringify(v)); };
const b = await chromium.launch();
const ctx = await b.newContext({viewport: {width: 428, height: 926}});
const p = await ctx.newPage();
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
await p.goto(url); await p.waitForFunction(() => window.SYNQUENZER && window.__spk, null, {timeout: 60000}); await p.waitForTimeout(800);
const only = process.env.NUR || '';
// Wahrheit im selben Raster wie der Optimierer (u ∈ [0,1]) → Klang der App
const lg = (v, a, b) => Math.log(v / a) / Math.log(b / a);
const VA = {cut: 1200, res: 0.3, fenv: 0.4, fD: 0.25, aA: 0.005, aD: 0.3, aS: 0.6, aR: 0.2, mix: 0.3, noise: 0, pw: 0.5};
const uVA = [lg(VA.cut, 30, 18000), VA.res, (VA.fenv + 1) / 2, lg(VA.fD, 0.005, 4), lg(VA.aA, 0.001, 2), lg(VA.aD, 0.005, 4), VA.aS, lg(VA.aR, 0.005, 4), VA.mix, VA.noise / 0.6, (VA.pw - 0.05) / 0.9];
const FM = {ol: 75, mD: 40, mS: 60, aA: 0.003, aD: 0.4, aS: 0.5, aR: 0.3, cut: 20000};
const uFM = [FM.ol / 99, FM.mD / 99, FM.mS / 99, lg(FM.aA, 0.001, 2), lg(FM.aD, 0.005, 4), FM.aS, lg(FM.aR, 0.005, 4), 1];
const run = (snd, m, dur, o) => p.evaluate(([s, m, d, o]) => __spk.spk2.klang.probe(s, m, d, o), [snd, m, dur, o]);
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const lr = (a, b) => Math.abs(Math.log2(a / b));
if (!only || only === 'va') {
  const snd = await p.evaluate(u => __spk.spk2.klang.snd('va', {o1: 0, o2: 1}, u), uVA);
  const r = await run(snd, 45, 0.6, {n: 50});
  console.log('VA Schätzung', JSON.stringify({va: r.est.va, fm: r.est.fm, adsr: r.est.adsr, fenv: r.est.fenv, noise: r.est.noise}));
  console.log('VA Nachbau', JSON.stringify(r.best), 'Start', r.d0.toFixed(2), r.ms + ' ms');
  const P = r.best.P;
  ok('va-engine', r.best.eng, r.best.eng === 'va');
  ok('va-wellen', [P.o1, P.o2, +P.mix.toFixed(2)], P.o1 === 0);
  ok('va-filter', {cut: Math.round(P.cut), res: +P.res.toFixed(2), fenv: +P.fenv.toFixed(2)}, lr(P.cut, VA.cut) < 1.2);
  ok('va-adsr', {aA: +P.aA.toFixed(3), aD: +P.aD.toFixed(2), aS: +P.aS.toFixed(2), aR: +P.aR.toFixed(2)}, near(P.aS, VA.aS, 0.25) && lr(P.aD, VA.aD) < 1.3 && lr(P.aR, VA.aR) < 1.3);
  ok('va-abstand', {d: +r.best.dist.toFixed(2), start: +r.d0.toFixed(2), n: r.n}, r.best.dist < 3 && r.best.dist <= r.d0);
  ok('va-versuche', r.n, r.n >= 45 && r.n <= 55);
}
if (!only || only === 'fm') {
  const snd = await p.evaluate(u => __spk.spk2.klang.snd('fm', {r: 2}, u), uFM);
  const r = await run(snd, 57, 0.7, {n: 50});
  console.log('FM Schätzung', JSON.stringify({va: r.est.va, fm: r.est.fm, adsr: r.est.adsr}));
  console.log('FM Nachbau', JSON.stringify(r.best), 'Start', r.d0.toFixed(2), r.ms + ' ms');
  const P = r.best.P;
  ok('fm-verhaeltnis', {est: r.est.fm, eng: r.best.eng, r: P.r}, r.est.fm.r === 2 && r.best.eng === 'fm' && P.r === 2);
  ok('fm-index', {ol: P.ol, mS: P.mS, mD: P.mD}, near(P.ol, FM.ol, 12));
  ok('fm-adsr', {aD: +P.aD.toFixed(2), aS: +P.aS.toFixed(2), aR: +P.aR.toFixed(2)}, near(P.aS, FM.aS, 0.25) && lr(P.aR, FM.aR) < 1.3);
  ok('fm-abstand', {d: +r.best.dist.toFixed(2), start: +r.d0.toFixed(2)}, r.best.dist < 3 && r.best.dist <= r.d0);
}
if (!only || only === 'werk') {
  const snd = await p.evaluate(() => factorySound('f-moog-bass'));
  const r = await run(snd, 36, 0.5, {n: 50});
  console.log('Werk Nachbau', JSON.stringify(r.best), 'Start', r.d0.toFixed(2), r.ms + ' ms');
  ok('werk-abstand', {d: +r.best.dist.toFixed(2), start: +r.d0.toFixed(2), eng: r.best.eng, txt: r.best.txt}, r.best.dist < 4.5 && r.best.dist <= r.d0);
}
ok('keine-fehler', errs.slice(0, 5), errs.length === 0);
fs.writeFileSync(path.join(dir, 'spk2-klang-probe.json'), JSON.stringify(res, null, 1));
const bad = Object.entries(res).filter(([, v]) => !v.ok).map(([k]) => k);
console.log(bad.length ? 'FEHLER: ' + bad.join(', ') : 'ALLE OK (' + Object.keys(res).length + ')');
await b.close(); srv.close();
