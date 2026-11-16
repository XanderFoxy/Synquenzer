// ZRL2 (Muster ZRL1): Zerlegen-Tempo A/B im Test-Chromium (Spektral-Worker der Seite), 20 s + 3 min, Ergebnis-Vergleich (SDR je Ebene, Energie je Ebene), Speicher-Spitze
// Aufruf: node zrl2-test.mjs <index.html> <basis.html>   Umgebung: RUNDEN=3 (20 s), RUNDEN3=1 (3 min), NUR=20|180, ZIEL_MS=2500
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { execSync } from 'node:child_process';
const E = process.env, A = path.resolve(process.argv[2]), B = path.resolve(process.argv[3] || ''), here = path.dirname(new URL(import.meta.url).pathname);
const MESS = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vx/spk/mess';
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); const p = u === '/A.html' ? A : u === '/B.html' ? B : u.startsWith('/mess/') ? path.join(MESS, path.basename(u)) : null;
  if (!p || !fs.existsSync(p)) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': p.endsWith('.html') ? 'text/html' : 'application/octet-stream'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok)); const base = 'http://127.0.0.1:' + srv.address().port;
const last = () => { try { return fs.readFileSync('/proc/loadavg', 'utf8').split(' ').slice(0, 3).join(' '); } catch (e) { return '?'; } };
// Speicher: RSS aller Renderer-Prozesse dieses Browsers (Nachkommen des Browser-Prozesses, Kind dieses Node-Prozesses)
function kids() { const m = new Map(); for (const d of fs.readdirSync('/proc')) { if (!/^\d+$/.test(d)) continue; try { const s = fs.readFileSync('/proc/' + d + '/stat', 'utf8'); const pp = +s.slice(s.lastIndexOf(')') + 2).split(' ')[1]; m.set(+d, pp); } catch (e) {} } return m; }
function rendRss() { const m = kids(), mine = new Set([process.pid]); let grow = true; while (grow) { grow = false; for (const [p, pp] of m) if (!mine.has(p) && mine.has(pp)) { mine.add(p); grow = true; } }
  let s = 0; for (const p of mine) { if (p === process.pid) continue; try { const c = fs.readFileSync('/proc/' + p + '/cmdline', 'utf8'); if (!/--type=renderer/.test(c)) continue; const st = fs.readFileSync('/proc/' + p + '/status', 'utf8'); const v = /VmRSS:\s+(\d+)/.exec(st); if (v) s += +v[1]; } catch (e) {} } return s / 1024; }
const b = await chromium.launch();
async function lauf(which, sek, sdr) {
  const ctx = await b.newContext({viewport: {width: 428, height: 926}}); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.goto(base + '/' + which + '.html'); await p.waitForFunction(() => window.SYNQUENZER && typeof spk1Call === 'function', null, {timeout: 90000}); await p.waitForTimeout(800);
  // Arbeiter-Heap über CDP (Worker-Ziel, nicht flach), falls möglich
  const cdp = await ctx.newCDPSession(p); let wsid = null, mid = 1; const pend = new Map(); let heapMax = 0;
  cdp.on('Target.attachedToTarget', e => { if (e.targetInfo.type === 'worker') wsid = e.sessionId; });
  cdp.on('Target.receivedMessageFromTarget', e => { try { const m = JSON.parse(e.message); if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); } } catch (er) {} });
  try { await cdp.send('Target.setAutoAttach', {autoAttach: true, waitForDebuggerOnStart: false, flatten: false}); } catch (e) {}
  const heap = () => new Promise(ok => { if (!wsid) return ok(null); const id = mid++; pend.set(id, ok); cdp.send('Target.sendMessageToTarget', {sessionId: wsid, message: JSON.stringify({id, method: 'Runtime.getHeapUsage'})}).catch(() => ok(null)); setTimeout(() => { if (pend.has(id)) { pend.delete(id); ok(null); } }, 500); });
  const doc = await p.evaluate(async ([sek]) => {
    const rd = async n => new Float32Array(await (await fetch('/mess/' + n + '.f32')).arrayBuffer());
    const st = {bass: await rd('spur0'), lead: await rd('spur1'), pad: await rd('spur2'), drums: await rd('spur4')};
    const n0 = Math.max(...Object.values(st).map(x => x.length / 2)), n = sek ? Math.round(sek * 44100) : n0, ch = [new Float32Array(n), new Float32Array(n)];
    for (const k in st) { const x = st[k], m = x.length / 2; for (let i = 0; i < n; i++) { const j = i % n0; if (j >= m) continue; ch[0][i] += x[2 * j]; ch[1][i] += x[2 * j + 1]; } }
    let pk = 0; for (const c of ch) for (const v of c) pk = Math.max(pk, Math.abs(v)); const g = pk > 0.98 ? 0.98 / pk : 1; window.__zg = {g, n, n0};
    if (g < 1) for (const c of ch) for (let i = 0; i < n; i++) c[i] *= g;
    const r = await spk1Call('create', {name: 'ZRL2', sr: 44100, ch, grid: {bpm: 112, off: 0, ts: '4/4', from: 'test'}}, [ch[0].buffer, ch[1].buffer]);
    window.__zst = st; return r.meta ? r.meta.id : r.id;
  }, [sek === 20 ? 0 : sek]);
  await heap(); const rss0 = rendRss(); let rssMax = rss0, h0 = null; { const h = await heap(); if (h) h0 = h.usedSize; }
  let go = true; const smp = (async () => { while (go) { rssMax = Math.max(rssMax, rendRss()); const h = await heap(); if (h) heapMax = Math.max(heapMax, h.usedSize); await new Promise(r => setTimeout(r, 120)); } })();
  const t = await p.evaluate(async id => { const t0 = performance.now(); const z = await spk1Call('zerlegen', {doc: id}); window.__zl = z.lids; return {ms: Math.round(performance.now() - t0), kern: z.ms}; }, doc);
  go = false; await smp;
  let res = {which, sek, ms: t.ms, kernMs: t.kern, rss0: Math.round(rss0), rssMax: Math.round(rssMax), heap0MB: h0 ? Math.round(h0 / 1048576) : null, heapMaxMB: heapMax ? Math.round(heapMax / 1048576) : null, last: last()};
  if (sdr) res = Object.assign(res, await p.evaluate(async id => {
    const {g, n, n0} = window.__zg, st = window.__zst, L = window.__zl;
    const S = k => { const x = st[k], m = x.length / 2, o = [new Float32Array(n), new Float32Array(n)]; for (let i = 0; i < n; i++) { const j = i % n0; if (j >= m) continue; o[0][i] = x[2 * j] * g; o[1][i] = x[2 * j + 1] * g; } return o; };
    const rend = async mix => (await spk1Call('render', {doc: id, mix, a: 0, b: n})).ch;
    const Y = {drums: await rend(L.drums), bass: await rend(L.bass), gesang: await rend(L.gesang), rest: await rend('rest')};
    const sdr = (ref, est) => { let e = 0, s = 0; for (let c = 0; c < 2; c++) for (let i = 0; i < n; i++) { const r = ref[c][i]; e += (est[c][i] - r) ** 2; s += r * r; } return +(10 * Math.log10(s / Math.max(e, 1e-12))).toFixed(3); };
    const add = (a, b) => [0, 1].map(c => { const o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = a[c][i] + b[c][i]; return o; });
    const en = {}; for (const k in Y) { let s = 0, w = 0; for (let c = 0; c < 2; c++) for (let i = 0; i < n; i++) { s += Y[k][c][i] ** 2; w += Y[k][c][i] * ((i % 9973) - 4986); } en[k] = [s, w]; }
    const lead = S('lead'), pad = S('pad');
    return {sdr: {drums: sdr(S('drums'), Y.drums), bass: sdr(S('bass'), Y.bass), tonal: sdr(add(lead, pad), add(Y.gesang, Y.rest))}, energie: en};
  }, doc));
  if (sek === 180) res.trans = await p.evaluate(async id => {   // ZRL2: langer Transient über das ganze Stück – Treffer gleich, Fortschritt gemeldet
    const pr = []; const t0 = performance.now(); const r = await spk1Call('spk12trans', {doc: id, t0: 0, t1: 180, hg: 0, del: 3}, undefined, {prog: (p, st) => pr.push([+p.toFixed(3), st, Math.round(performance.now() - t0)])});
    return {ms: Math.round(performance.now() - t0), n: r.hits.length, hits: r.hits.join(','), nF: r.nF, prog: pr.length, erster: pr[0] || null, letzter: pr[pr.length - 1] || null};
  }, doc);
  if (sek === 180 && E.EBENE) res.ebene = await p.evaluate(async id => {   // ZRL2: „Alle Ebenen abtasten“ aus (s12src = Gesang-Ebene) + langer Transient – beide Fortschritte
    const st = {}; const t0 = performance.now(); const r = await spk1Call('spk12trans', {doc: id, t0: 0, t1: 180, hg: 0, del: 3, s12src: window.__zl.gesang}, undefined, {prog: (p, s) => { const e = st[s] || (st[s] = {n: 0, erster: null, letzter: null}); e.n++; const v = [+p.toFixed(3), Math.round(performance.now() - t0)]; if (!e.erster) e.erster = v; e.letzter = v; }});
    return {ms: Math.round(performance.now() - t0), n: r.hits.length, s12src: r.s12src || null, stufen: st};
  }, doc);
  res.errs = errs; await ctx.close(); return res;
}
const out = {A, B, runden: []}, R20 = +(E.RUNDEN || 3), R180 = +(E.RUNDEN3 || 1);
const seq = []; if (E.NUR !== '180') for (let r = 0; r < R20; r++) seq.push([20, r]); if (E.NUR !== '20') for (let r = 0; r < R180; r++) seq.push([180, r]);
for (const [sek, r] of seq) {
  const order = r % 2 ? ['B', 'A'] : ['A', 'B'];
  for (const w of order) { if (w === 'B' && !fs.existsSync(B)) continue; const x = await lauf(w, sek, r === 0); out.runden.push(x); console.log(JSON.stringify(x)); }
}
const med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? (s.length & 1 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };
const sum = {}; for (const sek of [20, 180]) for (const w of ['A', 'B']) { const xs = out.runden.filter(x => x.sek === sek && x.which === w); if (!xs.length) continue; sum[w + sek] = {ms_median: med(xs.map(x => x.ms)), ms: xs.map(x => x.ms), rssMax: Math.max(...xs.map(x => x.rssMax)), rssDelta: Math.max(...xs.map(x => x.rssMax - x.rss0)), heapMaxMB: Math.max(...xs.map(x => x.heapMaxMB || 0)), sdr: (xs.find(x => x.sdr) || {}).sdr}; }
out.sum = sum;
const chk = {}; const ok = (k, v, c) => { chk[k] = {ok: !!c, v}; console.log((c ? 'OK   ' : 'FEHL ') + k + ' ' + JSON.stringify(v)); };
const Z = +(E.ZIEL_MS || 2500);
if (sum.A20) ok('zerlegen-20s-ziel', {A: sum.A20.ms_median, B: sum.B20 && sum.B20.ms_median, ziel: Z}, sum.A20.ms_median <= Z);
if (sum.A20 && sum.B20) ok('zerlegen-20s-schneller', {faktor: +(sum.B20.ms_median / sum.A20.ms_median).toFixed(2)}, sum.A20.ms_median < sum.B20.ms_median);
if (sum.A180 && sum.B180) ok('zerlegen-3min-schneller', {A: sum.A180.ms_median, B: sum.B180.ms_median, faktor: +(sum.B180.ms_median / sum.A180.ms_median).toFixed(2)}, sum.A180.ms_median < sum.B180.ms_median);
for (const sek of [20, 180]) { const a = sum['A' + sek], bb = sum['B' + sek]; if (!a || !bb || !a.sdr || !bb.sdr) continue;
  const d = {}; let good = true; for (const k in a.sdr) { d[k] = +(a.sdr[k] - bb.sdr[k]).toFixed(3); if (d[k] < -0.1) good = false; } ok('sdr-gleich-' + sek + 's', {A: a.sdr, B: bb.sdr, diff: d}, good);
  const ea = out.runden.find(x => x.sek === sek && x.which === 'A' && x.energie).energie, eb = out.runden.find(x => x.sek === sek && x.which === 'B' && x.energie).energie; const rel = {};
  for (const k in ea) rel[k] = +(Math.abs(ea[k][0] - eb[k][0]) / Math.max(1e-12, eb[k][0])).toExponential(2); out['energie' + sek] = rel; console.log('Energie-Abweichung je Ebene (' + sek + ' s): ' + JSON.stringify(rel));
  ok('energie-bitgleich-' + sek + 's', rel, Object.keys(ea).every(k => ea[k][0] === eb[k][0] && ea[k][1] === eb[k][1])); }
if (sum.A180) ok('speicher-3min-500mb', {rssMax: sum.A180.rssMax, rssDelta: sum.A180.rssDelta, heapMaxMB: sum.A180.heapMaxMB, basis: sum.B180 && {rssMax: sum.B180.rssMax, rssDelta: sum.B180.rssDelta, heapMaxMB: sum.B180.heapMaxMB}}, sum.A180.rssMax <= 500);
{ const ta = out.runden.find(x => x.which === 'A' && x.trans), tb = out.runden.find(x => x.which === 'B' && x.trans);
  if (ta && tb) ok('transient-3min-gleich+fortschritt', {A: {ms: ta.trans.ms, n: ta.trans.n, prog: ta.trans.prog, erster: ta.trans.erster, letzter: ta.trans.letzter}, B: {ms: tb.trans.ms, n: tb.trans.n, prog: tb.trans.prog}}, ta.trans.hits === tb.trans.hits && ta.trans.prog >= 10 && tb.trans.prog === 0); }
const errs = out.runden.flatMap(x => x.errs); ok('keine-konsolenfehler', errs.slice(0, 5), !errs.length);
out.chk = chk; fs.writeFileSync(path.join(path.dirname(A), 'zrl2-test.json'), JSON.stringify(out, null, 1));
console.log(Object.values(chk).every(c => c.ok) ? 'ALLE OK' : 'FEHLER: ' + Object.keys(chk).filter(k => !chk[k].ok).join(', '));
await b.close(); srv.close();
