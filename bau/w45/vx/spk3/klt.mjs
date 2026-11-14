// SPK3 Auftrag 3: bekannte App-Klänge → Nachbau mit Basis (vorher) und neuer Fassung (nachher); beide Ergebnisse mit DEMSELBEN Maß bewertet
// Aufruf: node spk3-klang-probe.mjs <vorher.html> <nachher.html>   (NUR=va2,fm,pad,lead)
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const A = path.resolve(process.argv[2]), Bf = path.resolve(process.argv[3]), dir = path.dirname(Bf);
const srv = http.createServer((q, r) => { const p = decodeURIComponent(q.url.split('?')[0]); const f = p === '/a.html' ? A : p === '/b.html' ? Bf : path.join(dir, p); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': f.endsWith('.html') ? 'text/html' : 'application/octet-stream'}); fs.createReadStream(f).pipe(r); });
await new Promise(ok => srv.listen(0, ok)); const base = 'http://127.0.0.1:' + srv.address().port + '/';
const b = await chromium.launch(), errs = [];
const page = async f => { const ctx = await b.newContext({viewport: {width: 428, height: 926}}); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(f + ': ' + e)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(f + ': ' + m.text()); }); await p.goto(base + f); await p.waitForFunction(() => window.SYNQUENZER && window.__spk, null, {timeout: 90000}); await p.waitForTimeout(500); return p; };
const lg = (v, a, b) => Math.log(v / a) / Math.log(b / a);
const uva = o => [lg(o.cut, 30, 18000), o.res, (o.fenv + 1) / 2, lg(o.fD, 0.005, 4), lg(o.aA, 0.001, 2), lg(o.aD, 0.005, 4), o.aS, lg(o.aR, 0.005, 4), o.mix, 0, 0.5];
const CASES = {
  va2: {eng: 'va', fix: {o1: 0, o2: 1}, u: uva({cut: 1200, res: 0.3, fenv: 0.4, fD: 0.25, aA: 0.005, aD: 0.3, aS: 0.6, aR: 0.2, mix: 0.5}), patch: {p: {o2fine: 9}}, m: 45, dur: 0.8, wahr: 'Säge + Rechteck 50 % +9 ct'},
  fm: {eng: 'fm', fix: {r: 2}, u: [75 / 99, 40 / 99, 60 / 99, lg(0.003, 0.001, 2), lg(0.4, 0.005, 4), 0.5, lg(0.3, 0.005, 4), 1], m: 57, dur: 0.7, wahr: 'FM 1:2'},
  pad: {eng: 'va', fix: {o1: 0, o2: 0}, u: uva({cut: 2500, res: 0.1, fenv: 0, fD: 0.3, aA: 0.2, aD: 1, aS: 0.8, aR: 0.6, mix: 0}), patch: {p: {o1uni: 5, uniDet: 0.3, uniMix: 0.6, uniWidth: 0}}, m: 57, dur: 1.2, wahr: 'Säge Unison 5 · 0,3'},
  lead: {eng: 'va', fix: {o1: 0, o2: 0}, u: uva({cut: 3000, res: 0.2, fenv: 0, fD: 0.3, aA: 0.01, aD: 0.5, aS: 0.9, aR: 0.2, mix: 0}), patch: {p: {l1shape: 0, l1rate: 5.5, l1sync: 0, l1retrig: 1}, mods: [{src: 'lfo1', dst: 'pitch', amt: 25 / 2400}]}, m: 64, dur: 1.0, wahr: 'Säge · Vibrato 5,5 Hz 25 ct'},
};
const only = (process.env.NUR || '').split(',').filter(Boolean), keys = Object.keys(CASES).filter(k => !only.length || only.includes(k));
const runOpt = (p, C) => p.evaluate(async C => {
  if (!window.__tm) { window.__tm = {r: 0, f: 0}; const R0 = spk2KlRender; window.spk2KlRender = async (...a) => { const t = performance.now(), r = await R0(...a); __tm.r += performance.now() - t; return r; }; const C0 = spk1Call; window.spk1Call = async (op, m) => { const t = performance.now(), r = await C0(op, m); if (op === 'klangFeat') __tm.f += performance.now() - t; return r; }; }
  __tm.r = 0; __tm.f = 0;
  const s0 = __spk.spk2.klang.snd(C.eng, C.fix, C.u), snd = JSON.parse(JSON.stringify(s0)); Object.assign(snd.p, (C.patch && C.patch.p) || {}); if (C.patch && C.patch.mods) snd.mods = C.patch.mods;
  const sr = 48000, on = 0.03, off = on + C.dur, len = off + 0.5, m = C.m, f = 440 * Math.pow(2, (m - 69) / 12);
  const [x] = await spk2KlRender([SQStore.normalizeSound(snd)], m, on, off, len, sr); const r = await spk1Call('klangFeat', {pcs: [x], sr, f, on, off, est: true});
  const src = {x, sr, m, on, off, len, feat: r.fs[0], est: r.est}, t0 = performance.now(), R = await spk2KlOpt(src, {n: 50, seed: 7});
  return {k: R.ketten, tm: {r: Math.round(__tm.r), f: Math.round(__tm.f)}, truth: snd, best: spk2KlSnd(R.best), txt: spk2KlTxt(R.best), dist: R.best.dist, d0: R.d0, ms: Math.round(performance.now() - t0), x3: r.fs[0].x3 || null, P: spk2KlP(R.best)};
}, C);
const res = {};
const pa = await page('a.html'), RA = {}; for (const k of keys) RA[k] = await runOpt(pa, CASES[k]); await pa.context().close();
const pb = await page('b.html'), RB = {}; for (const k of keys) RB[k] = await runOpt(pb, CASES[k]);
for (const k of keys) {
  const C = CASES[k], ev = await pb.evaluate(async ([C, t, a, bb]) => {
    const sr = 48000, on = 0.03, off = on + C.dur, len = off + 0.5, f = 440 * Math.pow(2, (C.m - 69) / 12);
    const pcs = await spk2KlRender([t, a, bb].map(s => SQStore.normalizeSound(s)), C.m, on, off, len, sr), r = await spk1Call('klangFeat', {pcs, sr, f, on, off});
    const [T, FA, FB] = r.fs; return {altA: spk2KlDist(T, FA), altB: spk2KlDist(T, FB), neuA: spk3KlDist(T, FA), neuB: spk3KlDist(T, FB), x3T: T.x3, x3B: FB.x3};
  }, [C, RB[k].truth, RA[k].best, RB[k].best]);
  res[k] = {wahr: C.wahr, vorher: {txt: RA[k].txt.join(' | '), ms: RA[k].ms, tm: RA[k].tm}, nachher: {txt: RB[k].txt.join(' | '), ms: RB[k].ms, tm: RB[k].tm}, abstandAlt: [+ev.altA.toFixed(2), +ev.altB.toFixed(2)], abstandNeu: [+ev.neuA.toFixed(2), +ev.neuB.toFixed(2)], x3: {det: ev.x3T.det, cv: ev.x3T.cv.slice(0, 6), b: ev.x3T.b.slice(0, 6)}};
  console.log(k, JSON.stringify(res[k]));
}
res.fehler = errs.slice(0, 5); console.log('Fehler', JSON.stringify(errs.slice(0, 5)));
fs.writeFileSync(process.env.OUT || '/dev/null', JSON.stringify(res, null, 1));
await b.close(); srv.close();
