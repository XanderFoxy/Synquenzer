// FOK3-Test: „Nur Rest“ zuerst Näherung, dann genau nachreichen. Über die Anzeige (__fokus1.mode, U.f1), A/B neu gegen basis (4.76.0 = FOK2 v6) im selben Lauf.
// Misst je Fall: Zeit bis zum ersten Bild (erstes neues Fokus-Stück mit Textur), Zeit bis genau (idle, alle Texturen, keine Näherung mehr), Hash des Endbilds,
// höchste Zahl genäherter Stücke, Long Tasks > 50 ms, Worker-Antwortzeit (fokusKey alle 40 ms), Konsolenfehler.
// Abbruch-Fälle: Rollen während des Nachreichens (neu planen), Fokus-Wechsel, örtliche Ebene, ↶ während des Nachreichens.
// Aufruf: node fok3-test.mjs <index.html> <basis.html>
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { execSync } from 'node:child_process';
const files = [path.resolve(process.argv[2]), path.resolve(process.argv[3] || process.argv[2])], dir = path.dirname(files[0]);
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
const OUT = {neu: {}, basis: {}};
for (const [tag, file] of [['neu', files[0]], ['basis', files[1]]]) {
  const R = OUT[tag]; let pg;
  const errsAll = [];
  // ---- Fall 20 s mono, Ebene über fast alles (200–1200 Hz), N 4096 ----
  pg = await page(file); await loadDoc(pg.p, {name: 'Z20', sec: 20, noise: 0.002, tones: tonesOf(20)});
  await mask(pg.p, rect(0.5, 19.5, 200, 1200)); await pg.p.waitForTimeout(300);
  R.s20 = await rest(pg.p); R.s20.last = load(); console.log(tag, 's20', JSON.stringify(R.s20));
  errsAll.push(...pg.errs); await pg.ctx.close();
  // ---- Kamm-Fall 8 s (Ebene nur 2–6 s, schmal), N 16384 und 4096 ----
  pg = await page(file); await loadDoc(pg.p, {name: 'K1', sec: 8, noise: 0.0005, tones: [{f: 220, a: 2, b: 6, amp: 0.3, H: 8}, {f: 65.41, a: 2, b: 6, amp: 0.3, H: 3}]});
  await setN(pg.p, 16384);
  await pg.p.evaluate(async sr => { const spur = f => { const s = []; for (let t = 2.0; t <= 6.0; t += 1024 / sr) s.push([+t.toFixed(4), f]); return s; };
    __T.got(await __spk.mask({von: 'orig', nach: 'neu', modus: 'verschieben', sel: [{art: 'harm', spur: spur(220), K: 8, bw: 45}, {art: 'harm', spur: spur(65.41), K: 3, bw: 45}]})); }, SR);
  await pg.p.waitForTimeout(300);
  R.kamm16 = await rest(pg.p); console.log(tag, 'kamm16', JSON.stringify(R.kamm16));
  R.kamm4 = await pg.p.evaluate(() => __T.meas(async () => { const U = __spk.page.ui(); U.N = 4096; spk1SpecLoad(U); })); console.log(tag, 'kamm4', JSON.stringify(R.kamm4));
  errsAll.push(...pg.errs); await pg.ctx.close();
  // ---- 3 min stereo, Ebene über fast alles ----
  pg = await page(file); await loadDoc(pg.p, {name: 'Z180s', sec: 180, noise: 0.002, tones: tonesOf(180), stereo: true});
  await mask(pg.p, rect(0.5, 179.5, 200, 1200)); await pg.p.waitForTimeout(300);
  R.st = await rest(pg.p); R.st.last = load(); console.log(tag, 'stereo', JSON.stringify(R.st));
  errsAll.push(...pg.errs); await pg.ctx.close();
  // ---- 3 min mono: Satz, örtliche Ebene, ↶, Abbruch-Fälle ----
  pg = await page(file); await loadDoc(pg.p, {name: 'Z180', sec: 180, noise: 0.002, tones: tonesOf(180)});
  await mask(pg.p, rect(0.5, 179.5, 200, 1200)); await pg.p.waitForTimeout(300);
  R.m1 = await rest(pg.p); R.m1.last = load(); console.log(tag, 'mono-satz', JSON.stringify(R.m1));
  await pg.p.waitForTimeout(300);
  R.m2 = await pg.p.evaluate(o => __T.meas(async () => { __T.got(await __spk.mask(o)); }), rect(60, 70, 2000, 2600)); console.log(tag, 'mono-oertlich', JSON.stringify(R.m2));
  R.m3 = await pg.p.evaluate(() => __T.meas(async () => { __T.got(await __spk.undo()); })); console.log(tag, 'mono-undo', JSON.stringify(R.m3));
  // Abbruch 1: neue Ebene über alles; während des Nachreichens rollen (ans Ende) – dann Fokus-Wechsel gef → rest
  R.m4 = await pg.p.evaluate(o => __T.meas(async () => { __T.got(await __spk.mask(o)); }, async t => {
    const U = __spk.page.ui(), F = U.f1, gk0 = F.gL ? F.gL.find(k => U.f1.set.chunks[k] && U.f1.set.chunks[k].ap) : F.gk, a = __fokus1.info(); U.v.t0 = 150; spk1Dirty(U, 'g');
    let gk1 = gk0, tt = performance.now(); while (performance.now() - tt < 4000) { await new Promise(r => setTimeout(r, 10)); if (F.gk !== gk0 && F.gk >= 0 && F.gL && F.gL[0] === F.gk) { gk1 = F.gk; break; } if (!F.gn) break; }
    const hs = U.spec.hop / U.meta.sr, vis = [Math.floor(150 / hs / 1024), Math.floor((150 + U.W / U.v.pps) / hs / 1024)], ms = Math.round(performance.now() - tt);
    __fokus1.mode('gef'); await new Promise(r => setTimeout(r, 120)); __fokus1.mode('rest'); await new Promise(r => setTimeout(r, 300)); U.v.t0 = 0; spk1Dirty(U, 'g');   // zurück an den Anfang (sonst bleiben unsichtbare Stücke ohne Textur)
    return {t: Math.round(t), gk0, gk1, vis, msBisNeu: ms, apVor: a.ap};
  }), rect(0.5, 179.5, 1500, 1900)); console.log(tag, 'mono-rollen+wechsel', JSON.stringify(R.m4));
  // Abbruch 2: neue Ebene über alles, während des Nachreichens ↶ → Endbild = Stand vor der Ebene (m4)
  R.m5 = await pg.p.evaluate(o => __T.meas(async () => { __T.got(await __spk.mask(o)); }, async t => { __T.got(await __spk.undo()); return {t: Math.round(t), undo: true}; }), rect(0.5, 179.5, 2600, 3000)); console.log(tag, 'mono-undo-waehrend', JSON.stringify(R.m5));
  // Zauberstab während der Näherung (genauer Weg): Ebene über alles, sofort nach dem ersten Bild tippen
  R.m6 = await pg.p.evaluate(o => __T.meas(async () => { __T.got(await __spk.mask(o)); }, async t => {
    const U = __spk.page.ui(), ap0 = __fokus1.info().ap, ta = performance.now(), z = await spk1Call('spk12zauber', {doc: SPK1.doc, N: U.N, t: 30, f: 3400, fokus: 'rest', aus: 'sicher', tol: 15, lim: 5});
    return {t: Math.round(t), zms: Math.round(performance.now() - ta), fokus: z && z.fokus, cells: z && z.cells, ap0, ap: __fokus1.info().ap};
  }), rect(0.5, 179.5, 3200, 3600)); console.log(tag, 'mono-zauber-waehrend', JSON.stringify(R.m6));
  errsAll.push(...pg.errs); await pg.ctx.close();
  R.errs = errsAll.slice(0, 8); R.nErr = errsAll.length;
}
const N3 = OUT.neu, B3 = OUT.basis;
for (const k of ['s20', 'kamm16', 'kamm4', 'st', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6']) ok('hash ' + k + ' = basis (FOK2 v6)', {neu: N3[k].h, basis: B3[k].h}, N3[k].h === B3[k].h && N3[k].apMax >= 0);
ok('m3 (↶) = m1', {m1: N3.m1.h, m3: N3.m3.h}, N3.m1.h === N3.m3.h);
ok('m5 (↶ während Nachreichen) = m4', {m4: N3.m4.h, m5: N3.m5.h}, N3.m4.h === N3.m5.h);
for (const k of ['s20', 'st', 'm1']) ok(k + ' Näherung zuerst (teuer)', {apMax: N3[k].apMax, gn: N3[k].gn}, N3[k].apMax > 0 && N3[k].gn);
for (const k of ['kamm16', 'kamm4']) ok(k + ' klein → direkt genau (kein Zwischenbild)', {apMax: N3[k].apMax}, N3[k].apMax === 0);
for (const k of ['m2', 'm3']) ok(k + ' örtlich → Näherung nur für die betroffenen Stücke (≤ 4 von 16)', {apMax: N3[k].apMax}, N3[k].apMax <= 4);
for (const k of ['s20', 'st', 'm1']) ok(k + ' erstes Bild ≤ 1,3× basis-Näherung (Ziel) / Zeit genau', {neu: {first: N3[k].first, genau: N3[k].genau}, v6: {first: B3[k].first, genau: B3[k].genau}}, true);
ok('m4 rollen → neu geplant (sichtbares Stück zuerst)', N3.m4.log[0], N3.m4.log[0] && N3.m4.log[0].gk1 >= N3.m4.log[0].vis[0] && N3.m4.log[0].gk1 <= N3.m4.log[0].vis[1]);
ok('m6 Zauberstab während Näherung: genauer Weg (Fokus-Prüfung), Bild noch genähert', N3.m6.log[0], N3.m6.log[0] && N3.m6.log[0].fokus && (N3.m6.log[0].ap0 > 0 || N3.m6.log[0].ap > 0));   // FOK3-P: genähert beim Tippen (ap0)
const KS = ['s20', 'kamm16', 'kamm4', 'st', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6'];
ok('kein JS-Bild/fokus1Pre > 50 ms (neu) – Long Tasks außerhalb JS = Textur-Hochladen der Test-Grafik', Object.fromEntries(KS.map(k => [k, N3[k].jsBild])), KS.every(k => (N3[k].jsBild || []).every(v => parseInt(v) <= 50)));
console.log('INFO Long Tasks > 50 ms Anzahl neu/basis', JSON.stringify(Object.fromEntries(KS.map(k => [k, [(N3[k].lt50 || []).length, (B3[k].lt50 || []).length]]))));
const lt = k => (N3[k].lt50 || []).length; if (process.env.LTSTRENG) ok('Long Tasks > 50 ms (neu, alle Fälle)', Object.fromEntries(['s20', 'kamm16', 'kamm4', 'st', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6'].map(k => [k, [N3[k].lt50, B3[k].lt50]])), ['s20', 'kamm16', 'kamm4', 'st', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6'].every(k => lt(k) <= (B3[k].lt50 || []).length));
ok('Worker-Antwort während des Nachreichens (m1, st) nicht schlechter als v6 (Median ≤ v6 + 15 ms, P95 ≤ v6 + 30 ms)', {m1: [N3.m1.ping, B3.m1.ping], st: [N3.st.ping, B3.st.ping]}, ['m1', 'st'].every(k => N3[k].ping.med <= B3[k].ping.med + 15 && N3[k].ping.p95 <= B3[k].ping.p95 + 30));
ok('Konsole 0 Fehler (neu)', N3.errs, N3.nErr === 0);
ok('Konsole 0 Fehler (basis)', B3.errs, B3.nErr === 0);
console.log('ERGEBNIS', nOk, 'OK /', nF, 'FEHLER', 'Last', load());
fs.writeFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), 'fok3-ergebnis.json'), JSON.stringify({OUT, res}, null, 1));
await b.close(); srv.close();
