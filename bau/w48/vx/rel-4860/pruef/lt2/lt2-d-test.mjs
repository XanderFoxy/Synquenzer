// LT2 Fall d: Fokus Nur Rest → Alles → Nur Gefundenes → Alles per Tipp (Fokus-Lied mit einer Ebene, Tönung an), A/B, frischer Kontext je Lauf.
// node lt2-d-test.mjs <index> <basis>   ENV: VIEWS=926x428,428x926 REPS=2
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os'; import crypto from 'node:crypto';
const A = path.resolve(process.argv[2]), B = path.resolve(process.argv[3]);
const files = {'/a.html': A, '/b.html': B};
const srv = http.createServer((q, r) => { const u = q.url.split('?')[0]; if (u === '/version.json') { r.writeHead(200, {'content-type': 'application/json'}); r.end(/\/[aA]\.html/.test(q.headers.referer || '') ? '{"version":"4.86.0"}' : '{"version":"4.85.0"}'); return; } const p = files[u]; if (!p) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': 'text/html; charset=utf-8'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok)); const base = 'http://127.0.0.1:' + srv.address().port;
const VIEWS = (process.env.VIEWS || '926x428,428x926').split(',').map(s => s.split('x').map(Number)), REPS = +(process.env.REPS || 2);
const br = await chromium.launch({args: ['--disable-renderer-backgrounding']});
const OBS = () => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push({t: e.startTime, d: e.duration}); }).observe({type: 'longtask', buffered: true}); } catch (e) {} };
const HOOK = () => { window.__h = []; window.__fr = []; const fr = window.spk1Frame; window.spk1Frame = function (U) { const t = performance.now(), dg = U.dg; const r = fr.apply(this, arguments); window.__fr.push({t: Math.round(t), d: Math.round(performance.now() - t), dg, run: typeof LT2S !== 'undefined' ? LT2S.run + ':' + LT2S.i + '/' + LT2S.n + ' f' + LT2S.nFull + ' p' + LT2S.nPres + ' a' + LT2S.nAbort : '', tint: U.tintOn, mode: U.f1 && U.f1.mode}); return r; }; const f = window.spk1GlDraw; window.spk1GlDraw = function (U) { const inner = typeof LT2S !== 'undefined' && LT2S.inner, c0 = typeof LT2S !== 'undefined' ? LT2S.nFull + LT2S.nPres : 0; const r = f.apply(this, arguments);
  const pres = typeof LT2S === 'undefined' ? true : (!inner && LT2S.nFull + LT2S.nPres !== c0);
  if (pres && window.__hashOn && U.gl) { const gl = U.gl.gl, px = new Uint8Array(U.cw * U.ch * 4); gl.readPixels(0, 0, U.cw, U.ch, gl.RGBA, gl.UNSIGNED_BYTE, px); let h = 0x811c9dc5; for (let i = 0; i < px.length; i++) { h ^= px[i]; h = Math.imul(h, 16777619); } window.__last = (h >>> 0).toString(16); window.__h.push(window.__last); }
  return r; }; };
async function run(f, W, H, mode) {
  const ctx = await br.newContext({viewport: {width: W, height: H}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}), p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.goto(base + '/' + f + '.html'); await p.evaluate(OBS);
  await p.waitForFunction(() => window.SYNQUENZER && window.__spk && window.__fokus1, null, {timeout: 90000}); await p.waitForTimeout(500);
  await p.evaluate(HOOK);
  await p.evaluate(async () => { const sr = 44100, n = 14 * sr, x = new Float32Array(n); let s1 = 7; const rnd = () => ((s1 = (s1 * 1103515245 + 12345) >>> 0) / 4294967296) * 2 - 1;
    const tone = (f, a, b) => { const i0 = Math.round(a * sr), i1 = Math.round(b * sr), fd = Math.round(0.01 * sr); for (let i = i0; i < i1 && i < n; i++) { const e = Math.min(1, (i - i0) / fd, (i1 - i) / fd); let v = 0; for (let h = 1; h <= 8; h++) v += 0.3 / h * Math.sin(2 * Math.PI * f * h * i / sr); x[i] += e * v; } };
    tone(220, 2, 6); tone(311.13, 8, 12); for (let i = 0; i < n; i++) x[i] += 0.002 * rnd();
    await __spk.page.open({}); const r = await __spk.load({name: 'Fokus-Lied', sr, ch: [x]}); await __spk.page.open({id: r.meta.id}); });
  await p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc && i.chunks > 0 && !/Spektrum \d/.test(i.stat) && !__spk.page.ui().specQ; }, null, {timeout: 300000});
  await p.evaluate(async () => { const u = __spk.page.ui(); const got = r => { spk1Got(u, r); spk1TintLoad(u); return r; };
    const r = got(await __spk.spk2.noten('orig', [{art: 'zeit', t0: 1.5, t1: 6.5}])), N = (r.meta.teil2.notes.orig || []).filter(q => Math.abs(1200 * Math.log2(q.f / 220)) < 60);
    got(await __spk.spk2.zuordnen(N.map(q => ({lid: 'orig', id: q.id})), 'neu', 'lead')); });
  await p.waitForFunction(() => { const U = __spk.page.ui(); return U.tint && U.tint.ids && U.tint.ids.length === U.meta.layers.length; }, null, {timeout: 30000});
  await p.waitForTimeout(1500);
  await p.evaluate(() => document.querySelector('#spk1Sheet .spk1-st').click()); await p.waitForTimeout(1200);
  if (mode === 'img') await p.evaluate(() => { window.__hashOn = true; });
  const idle = () => p.waitForFunction(() => { const f = __fokus1.info(); return (__fokus1.idle() && (f.mode === 'alles' || f.tex >= f.n) && f.n > 0 || (f && f.mode === 'alles')) && !(typeof LT2S !== 'undefined' && LT2S.run); }, null, {timeout: 60000});
  const box = await p.evaluate(() => { const r = __spk.page.ui().gcv.getBoundingClientRect(); return {x: r.x, y: r.y, width: r.width, height: r.height}; });
  const shot = async () => crypto.createHash('md5').update(await p.screenshot({clip: box})).digest('hex').slice(0, 10);
  const res = {lt: [], steps: {}, hashes: [], shots: [], flk: null};
  for (const [i, name] of [[1, 'rest'], [0, 'alles'], [2, 'gef'], [0, 'alles2']]) {
    if (!(await p.evaluate(() => !!__spk.page.ui().dd))) await p.evaluate(() => document.querySelector('#spk1Sheet [data-a="view"]').click());
    await p.waitForTimeout(400);
    let pre = null; if (mode === 'img' && name === 'alles' && f === 'a') { await p.evaluate(() => { const s = document.createElement('style'); s.id = 'lt2hide'; s.textContent = '#spk1Sheet .spk1-dd,#spk1Sheet .spk1-ov{visibility:hidden!important}'; document.head.appendChild(s); }); await p.waitForTimeout(200); pre = await shot(); await p.evaluate(() => { LT2S.hold = true; }); }
    const t0 = await p.evaluate(() => { window.__gap = 0; window.__rafOn = true; let last = performance.now(); const f = () => { const n = performance.now(); window.__gap = Math.max(window.__gap, n - last); last = n; if (window.__rafOn) requestAnimationFrame(f); }; requestAnimationFrame(f); return performance.now(); });
    await p.evaluate(i => document.querySelectorAll('#spk1Sheet .spk1-dd .spk1-f1 button')[i].click(), i);
    if (pre) { await p.waitForTimeout(300); const mid = await shot(); await p.evaluate(() => document.getElementById('lt2hide').remove()); const st = await p.evaluate(() => ({run: LT2S.run, i: LT2S.i, n: LT2S.n})); await p.evaluate(() => { LT2S.hold = false; spk1Dirty(__spk.page.ui(), 'g'); }); res.flk = {pre, mid, st, gleich: pre === mid}; }
    await idle(); await p.waitForTimeout(600);
    const lt = await p.evaluate(t0 => window.__lt.filter(e => e.t >= t0 && e.d > 50).map(e => Math.round(e.d)), t0); res.steps[name] = lt; (res.gaps = res.gaps || {})[name] = await p.evaluate(() => { window.__rafOn = false; return Math.round(window.__gap); }); if (process.env.DIAG && name === 'alles') { const lts = await p.evaluate(t0 => window.__lt.filter(e => e.t >= t0).map(e => [Math.round(e.t), Math.round(e.d)]), t0); const fr = await p.evaluate(t0 => window.__fr.filter(e => e.t >= t0 - 5), t0); console.log('DIAG', f, 'lt', JSON.stringify(lts)); for (const x of fr) console.log('  fr', JSON.stringify(x)); } res.lt.push(...lt);
    await p.evaluate(() => spk1Dd(__spk.page.ui(), null)); await p.waitForTimeout(400);
    if (mode === 'img') { res.hashes.push(name + ':' + await p.evaluate(() => window.__last)); res.shots.push(name + ':' + await shot()); }
  }
  res.st = await p.evaluate(() => typeof LT2S !== 'undefined' ? {slow: LT2S.slow, cost: Math.round(LT2S.cost), seq: LT2S.nSeq, step: LT2S.nStep, pres: LT2S.nPres, abort: LT2S.nAbort, full: LT2S.nFull, err: LT2S.err, on: LT2S.on} : null);
  res.errs = errs.slice(0, 3); res.load = os.loadavg()[0].toFixed(2); await ctx.close(); return res;
}
const out = [];
for (const [W, H] of VIEWS) for (let rep = 0; rep < REPS; rep++) for (const f of rep % 2 ? ['b', 'a'] : ['a', 'b']) for (const mode of (rep === 0 ? ['img', 'lt'] : ['lt'])) {
  let r; try { r = await run(f, W, H, mode); } catch (e) { r = {err: String(e).slice(0, 300), lt: []}; }
  const row = {file: f === 'a' ? 'index' : 'basis', view: W + 'x' + H, rep, mode, ...r}; out.push(row);
  console.log(`${row.view} ${mode} rep${rep} ${row.file.padEnd(5)} max=${Math.max(0, ...(r.lt || []))} gaps=${JSON.stringify(r.gaps)} steps=${JSON.stringify(r.steps)} ${mode === 'img' ? 'hash=' + r.hashes.join(' ') + ' shots=' + r.shots.join(' ') + (r.flk ? ' flk=' + JSON.stringify(r.flk) : '') : ''} st=${JSON.stringify(r.st)} errs=${JSON.stringify(r.errs)} last=${r.load}${r.err ? ' ERR ' + r.err : ''}`);
}
await br.close(); srv.close();
fs.writeFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), process.env.OUT || 'lt2-d-test.json'), JSON.stringify(out, null, 1));
for (const v of VIEWS.map(x => x.join('x'))) { const I = out.filter(o => o.view === v && o.file === 'index' && o.mode === 'img'), Bb = out.filter(o => o.view === v && o.file === 'basis' && o.mode === 'img');
  const gleich = I.length && Bb.length && I[0].hashes && Bb[0].hashes && I[0].hashes.join() === Bb[0].hashes.join(); const sg = I.length && Bb.length && I[0].shots && Bb[0].shots && I[0].shots.join() === Bb[0].shots.join();
  const L = fl => out.filter(o => o.view === v && o.file === fl && o.mode === 'lt').map(o => Math.max(0, ...(o.lt || []))), N = fl => out.filter(o => o.view === v && o.file === fl && o.mode === 'lt').reduce((s, o) => s + (o.lt || []).length, 0);
  console.log(`ERGEBNIS ${v}: basis max je Lauf ${JSON.stringify(L('basis'))} (${N('basis')}× >50) | index ${JSON.stringify(L('index'))} (${N('index')}× >50) | Endbild (readPixels je Stufe) gleich: ${gleich} | Bildschirm gleich: ${sg}`); }
