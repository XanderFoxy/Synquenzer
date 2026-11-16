// FOK3-Zeit (nur s20 + m1, mehrere Dateien, RUNS abwechselnd): „Nur Rest“ zuerst Näherung, dann genau nachreichen. Über die Anzeige (__fokus1.mode, U.f1), A/B neu gegen basis (4.76.0 = FOK2 v6) im selben Lauf.
// Misst je Fall: Zeit bis zum ersten Bild (erstes neues Fokus-Stück mit Textur), Zeit bis genau (idle, alle Texturen, keine Näherung mehr), Hash des Endbilds,
// höchste Zahl genäherter Stücke, Long Tasks > 50 ms, Worker-Antwortzeit (fokusKey alle 40 ms), Konsolenfehler.
// Abbruch-Fälle: Rollen während des Nachreichens (neu planen), Fokus-Wechsel, örtliche Ebene, ↶ während des Nachreichens.
// Aufruf: node fok3-test.mjs <index.html> <basis.html>
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { execSync } from 'node:child_process';
const files = process.argv.slice(2).map(f => path.resolve(f)), dir = path.dirname(files[0]);
const srv = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': p.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok)); const base = 'http://127.0.0.1:' + srv.address().port + '/';
const load = () => fs.readFileSync('/proc/loadavg', 'utf8').split(' ').slice(0, 3).join(' ');
let nOk = 0, nF = 0; const res = {};
const ok = (k, v, c) => { res[k] = {v, ok: !!c}; c ? nOk++ : nF++; console.log((c ? 'OK     ' : 'FEHLER ') + k + ' ' + JSON.stringify(v)); };
const b = await chromium.launch(); const SR = 44100;
async function page(file) {
  const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}), p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.goto(base + path.basename(file)); await p.waitForFunction(() => window.SYNQUENZER && window.__spk && window.__fokus1, null, {timeout: 120000}); await p.waitForTimeout(400);
  await p.evaluate(() => {
    window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push({t: e.startTime, d: e.duration}); }).observe({entryTypes: ['longtask']}); } catch (e) {}
    const fnv = (h, u8) => { for (let i = 0; i < u8.length; i++) { h ^= u8[i]; h = Math.imul(h, 16777619); } return h >>> 0; };
    const U = () => __spk.page.ui();
    { const f0 = window.spk1Frame, p0 = window.fokus1Pre; window.__fr = [];   // JS-Zeit je Bild (Zeichnen inkl. fokus1Pre/Hochladen-Aufruf)
      window.spk1Frame = function (u) { const t = performance.now(), r = f0.apply(this, arguments), d = performance.now() - t; if (d > 8) __fr.push({t, d}); return r; };
      window.fokus1Pre = function (u) { const t = performance.now(), r = p0.apply(this, arguments), d = performance.now() - t; if (d > 8) __fr.push({t, d, w: 'pre'}); return r; }; }
    window.__T = {
      hash: () => { let h = 0x811c9dc5; for (const c of __fokus1.chunks().sort((a, b) => a.k - b.k)) h = fnv(h, c.data); return h.toString(16); },
      got: r => { const u = U(); spk1Got(u, r); spk1TintLoad(u); return r; },
      fertig: () => { const i = __fokus1.info(); return __fokus1.idle() && i.n > 0 && (!U().gl || i.tex >= i.n) && !i.ap; },
      // misst ab jetzt (trig = Auslöser), mid = optionaler Eingriff während des Nachreichens
      meas: async (trig, mid) => {
        const t0 = performance.now(), k0 = __fokus1.info() && __fokus1.info().key; let first = 0, apMax = 0, done = false, gnSeen = false; const pings = [], log = [];
        const pinger = (async () => { while (!done) { const a = performance.now(); try { await spk1Call('fokusKey', {doc: SPK1.doc, N: U().N, mode: 'rest', aus: 'sicher'}); } catch (e) {} pings.push(performance.now() - a); await new Promise(r => setTimeout(r, 40)); } })();
        await trig();
        let midDone = !mid;
        for (;;) {
          await new Promise(r => setTimeout(r, 5)); const i = __fokus1.info(), t = performance.now() - t0;
          if (!first && i.n > 0 && i.tex > 0 && (i.key !== k0 || !k0)) first = t;
          apMax = Math.max(apMax, i.ap || 0); if (i.gn) gnSeen = true;
          if (!midDone && ((i.gn && i.ap > 0) || (i.gn === undefined && first && t > first + 300))) { midDone = true; log.push(await mid(t)); }
          if (t > 30 && __T.fertig() && midDone) break;
          if (t > 60000) { log.push('timeout'); break; }
        }
        const genau = performance.now() - t0; done = true; await pinger; pings.sort((a, b) => a - b);
        const lt = __lt.filter(e => e.t >= t0).map(e => Math.round(e.d)), fr = __fr.filter(e => e.t >= t0).map(e => Math.round(e.d) + (e.w ? 'p' : ''));
        return {first: Math.round(first), genau: Math.round(genau), apMax, gn: gnSeen, h: __T.hash(), lt50: lt.filter(d => d > 50), jsBild: fr, ping: {n: pings.length, med: +(pings[pings.length >> 1] || 0).toFixed(1), p95: +(pings[Math.floor(pings.length * 0.95)] || 0).toFixed(1), max: +(pings[pings.length - 1] || 0).toFixed(1)}, stat: U().st.textContent, log};
      }
    };
  });
  return {p, ctx, errs};
}
const ready = p => p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc && i.chunks > 0 && !/Spektrum \d/.test(i.stat) && !__spk.page.ui().specQ; }, null, {timeout: 300000});
const loadDoc = async (p, spec) => { await p.evaluate(async ([spec, sr]) => {
  const n = Math.round(spec.sec * sr), x = new Float32Array(n); let s1 = 7; const rnd = () => ((s1 = (s1 * 1103515245 + 12345) >>> 0) / 4294967296) * 2 - 1;
  for (const t of spec.tones) { const i0 = Math.round(t.a * sr), i1 = Math.round(t.b * sr), fd = Math.round(0.01 * sr); for (let i = i0; i < i1 && i < n; i++) { const e = Math.min(1, (i - i0) / fd, (i1 - i) / fd); let v = 0; for (let h = 1; h <= (t.H || 1); h++) v += t.amp / h * Math.sin(2 * Math.PI * t.f * h * i / sr); x[i] += e * v; } }
  for (let i = 0; i < n; i++) x[i] += (spec.noise || 0) * rnd();
  const r = await __spk.load({name: spec.name, sr, ch: spec.stereo ? [x, x.map((v, i) => 0.8 * v + 0.001 * Math.sin(i * 0.37))] : [x]}); await __spk.page.open({id: r.meta.id});
}, [spec, SR]); await ready(p); await p.waitForTimeout(300); };
const setN = async (p, N) => { await p.evaluate(N => { const U = __spk.page.ui(); if (U.N !== N) { U.N = N; spk1SpecLoad(U); } }, N); await p.waitForTimeout(200); await ready(p); await p.waitForTimeout(200); };
const rect = (t0, t1, f0, f1) => ({von: 'orig', nach: 'neu', modus: 'verschieben', sel: [{art: 'rect', t0, t1, f0, f1, kt: 0, kf: 0}]});
const mask = (p, o) => p.evaluate(async o => { __T.got(await __spk.mask(o)); }, o);
const rest = (p, mid) => p.evaluate(mid => __T.meas(async () => { __fokus1.mode('rest'); }, mid ? eval(mid) : null), mid || null);
const tonesOf = SEC => { const t = []; for (let a = 1; a + 3 < SEC; a += 4) t.push({f: [220, 261.63, 329.63, 392][(a / 4 | 0) % 4], a, b: a + 3, amp: 0.25, H: 6}); return t; };
const OUT = {}; const RUNS = +(process.env.RUNS || 1);
for (let run = 0; run < RUNS; run++) for (const file of (run % 2 ? files.slice().reverse() : files)) {
  const tag = path.basename(file); const R = OUT[tag] = OUT[tag] || {s20: [], m1: []}; let pg; const errsAll = [];
  // ---- Fall 20 s mono, Ebene über fast alles (200–1200 Hz), N 4096 ----
  pg = await page(file); await loadDoc(pg.p, {name: 'Z20', sec: 20, noise: 0.002, tones: tonesOf(20)});
  await mask(pg.p, rect(0.5, 19.5, 200, 1200)); await pg.p.waitForTimeout(300);
  { const r = await rest(pg.p); r.last = load(); R.s20.push(r); console.log(tag, 's20', JSON.stringify(r)); }
  errsAll.push(...pg.errs); await pg.ctx.close();
  // ---- 3 min mono: Satz, örtliche Ebene, ↶, Abbruch-Fälle ----
  pg = await page(file); await loadDoc(pg.p, {name: 'Z180', sec: 180, noise: 0.002, tones: tonesOf(180)});
  await mask(pg.p, rect(0.5, 179.5, 200, 1200)); await pg.p.waitForTimeout(300);
  { const r = await rest(pg.p); r.last = load(); R.m1.push(r); console.log(tag, 'm1', JSON.stringify(r)); }
  await pg.ctx.close();
}
fs.writeFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), 'fok3-zeit.json'), JSON.stringify(OUT, null, 1));
await b.close(); srv.close();
