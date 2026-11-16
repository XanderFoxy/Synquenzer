// FOK3-P Nachbesserung – Test zu Befund 1 (Neu-Planen beim schnellen Hin-und-Her-Rollen) und „noch aktuell“ nach abgebrochenem Satz.
// Aufruf: node fok3p-test.mjs <neu.html> <basis.html>. Kopf (Seite, Wächter, meas) aus pruef/p2.mjs (Prüfer) übernommen.
// Fälle: A Zoom/Rollen während Nachreichen, B schnelles Hin-/Herschalten der Modi, C Ebene löschen während Nachreichen, D ↶ / ↷ (↷ während Nachreichen),
// E Dauer-Rollen (Neu-Planen-Grenze guard 40), F N 1024 / 16384. Je Fall: Endhash, ap/idle am Ende, „veraltet“-Wächter (genaues Stück → später Näherung
// gleichen Stands, gezeichnet), sichtbare Stücke am Ende genau + Textur, Long Tasks, Konsole.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const files = [path.resolve(process.argv[2]), path.resolve(process.argv[3])], SEC = +(process.argv[4] || 180);
const srv = http.createServer((q, r) => { const p = path.join('/', decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': p.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok)); const base = 'http://127.0.0.1:' + srv.address().port;
const load = () => fs.readFileSync('/proc/loadavg', 'utf8').split(' ').slice(0, 3).join(' ');
const b = await chromium.launch(); const SR = 44100;
async function page(file) {
  const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}), p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.goto(base + file); await p.waitForFunction(() => window.SYNQUENZER && window.__spk && window.__fokus1, null, {timeout: 120000}); await p.waitForTimeout(400);
  await p.evaluate(() => {
    window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push({t: e.startTime, d: e.duration}); }).observe({entryTypes: ['longtask']}); } catch (e) {}
    const fnv = (h, u8) => { for (let i = 0; i < u8.length; i++) { h ^= u8[i]; h = Math.imul(h, 16777619); } return h >>> 0; };
    const U = () => __spk.page.ui();
    window.__W = {bad: [], seen: new Map(), nList: 0, nCall: 0};
    { const c0 = window.spk1Call; window.spk1Call = function (op, m) { if (op === 'fokus') { __W.nCall++; if (m && Array.isArray(m.list)) __W.nList++; } return c0.apply(this, arguments); }; }
    { const p0 = window.fokus1Pre; window.fokus1Pre = function (u) {   // nach fokus1Pre: was wird gezeichnet?
        const r = p0.apply(this, arguments);
        try { const F = u.f1, S = F && F.set; if (S && F.sw && F.mode === 'rest') { const arr = u.spec.chunks, hs = u.spec.hop / u.meta.sr;
          for (let k = 0; k < arr.length; k++) { const c = arr[k]; if (!c || !S.chunks.includes(c)) continue; const xa = ((c.x0 - 0.5) * hs - u.v.t0) * u.v.pps, xb = ((c.x0 + c.w - 0.5) * hs - u.v.t0) * u.v.pps; if (xb < 0 || xa > u.W) continue;
            const pk = __W.seen.get(k); if (!c.ap) __W.seen.set(k, c.key); else if (pk === c.key) __W.bad.push({k, key: c.key, t: Math.round(performance.now())}); } } } catch (e) {}
        return r; }; }
    window.__T = {
      hash: () => { let h = 0x811c9dc5; for (const c of __fokus1.chunks().sort((a, b) => a.k - b.k)) h = fnv(h, c.data); return h.toString(16); },
      got: r => { const u = U(); spk1Got(u, r); spk1TintLoad(u); return r; },
      done: () => { const i = __fokus1.info(), S = U().f1.set; return __fokus1.idle() && i.n > 0 && S && i.n >= (S.info.chunks || 0) && !i.ap; },
      visOk: () => { const u = U(), S = u.f1.set; if (!S) return 'kein Satz'; const hs = S.hop / u.meta.sr, out = []; for (let k = 0; k < S.chunks.length; k++) { const c = S.chunks[k]; if (!c) { out.push(k + ':fehlt'); continue; } const xa = ((c.x0 - 0.5) * hs - u.v.t0) * u.v.pps, xb = ((c.x0 + c.w - 0.5) * hs - u.v.t0) * u.v.pps; if (xb < 0 || xa > u.W) continue; if (c.ap) out.push(k + ':ap'); if (u.gl && !c.tex) out.push(k + ':ohneTex'); if (c.key !== S.key) out.push(k + ':key'); } return out.length ? out.join(',') : 'ok'; },
      meas: async (trig, mid, midAt) => {
        const t0 = performance.now(); let first = 0, apMax = 0, gn = false, midDone = !mid, midRes = null; __W.bad = []; __W.seen = new Map(); __W.nList = 0; __W.nCall = 0;
        const k0 = __fokus1.info() && __fokus1.info().key;
        await trig();
        for (;;) {
          await new Promise(r => setTimeout(r, 5)); const i = __fokus1.info(), t = performance.now() - t0;
          if (!first && i.n > 0 && i.tex > 0 && (i.key !== k0 || !k0)) first = t;
          apMax = Math.max(apMax, i.ap || 0); if (i.gn) gn = true;
          if (!midDone && ((i.gn && i.ap > 0) || (!('gn' in i) && first && t > first + (midAt || 300)) || (('gn' in i) && !i.gn && first && t > first + 2500))) { midDone = true; midRes = await mid(t); }
          if (t > 60 && midDone && __T.done()) break;
          if (t > 90000) { midRes = Object.assign({timeout: true}, midRes || {}); break; }
        }
        const i = __fokus1.info();
        await new Promise(r => setTimeout(r, 400));   // ein paar Bilder zeichnen lassen
        const lt = __lt.filter(e => e.t >= t0).map(e => Math.round(e.d)).filter(d => d > 50);
        return {first: Math.round(first), ms: Math.round(performance.now() - t0 - 400), apMax, gn, h: __T.hash(), apEnd: __fokus1.info().ap, idle: __fokus1.idle(), vis: __T.visOk(), bad: __W.bad.length, badEx: __W.bad.slice(0, 3), nCall: __W.nCall, nList: __W.nList, lt50: lt.length, stat: U().st.textContent, mid: midRes};
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
const tonesOf = SEC => { const t = []; for (let a = 1; a + 3 < SEC; a += 4) t.push({f: [220, 261.63, 329.63, 392][(a / 4 | 0) % 4], a, b: a + 3, amp: 0.25, H: 6}); return t; };

let nOk = 0, nF = 0; const res = {};
const ok = (k, v, c) => { res[k] = {v, ok: !!c}; c ? nOk++ : nF++; console.log((c ? 'OK     ' : 'FEHLER ') + k + ' ' + JSON.stringify(v)); };
const OUT = {neu: {}, basis: {}};
for (const [tag, file] of [['neu', files[0]], ['basis', files[1]]]) {
  const R = OUT[tag]; const pg = await page(file), P = pg.p;
  await loadDoc(P, {name: 'Q' + SEC, sec: SEC, noise: 0.002, tones: tonesOf(SEC)});
  // P1: N 16384, Ebene über alles, „Nur Rest“; beim Nachreichen 12 s lang alle 270 ms zwischen Anfang und Ende kippen
  await setN(P, 16384);
  await P.evaluate(async o => { __T.got(await __spk.mask(o)); }, rect(0.5, SEC - 0.5, 200, 1200)); await P.waitForTimeout(300);
  R.P1 = await P.evaluate(SEC => __T.meas(async () => { __fokus1.mode('rest'); }, async t => { const U = __spk.page.ui(), F = U.f1; U.v.pps = U.W / 10; let n = 0, apZero = 0; const t1 = performance.now();
    while (performance.now() - t1 < 12000) { U.v.t0 = n % 2 ? 2 : SEC - 12; spk1Dirty(U, 'g'); n++; await new Promise(r => setTimeout(r, 270)); const i = __fokus1.info(); if (!apZero && !i.ap) apZero = Math.round(performance.now() - t1); }
    const i = __fokus1.info(); return {t: Math.round(t), flips: n, list: __W.nList, ap: i.ap, apZero, rpn: i.rpn, chunks: U.f1.set ? U.f1.set.chunks.length : 0}; }), SEC);
  console.log(tag, 'P1', JSON.stringify(R.P1));
  R.P1b = await P.evaluate(() => ({info: __fokus1.info(), idle: __fokus1.idle(), stat: __spk.page.ui().st.textContent}));
  // P2: N 4096 („Nur Rest“ fertig), dann örtliche Ebene 60–70 s; sobald der neue Satz läuft → Alles → Nur Rest; Endbild = frischer Satz?
  await P.evaluate(() => __fokus1.mode('alles')); await setN(P, 4096);
  R.P2a = await P.evaluate(() => __T.meas(async () => { __fokus1.mode('rest'); }, null));
  R.P2 = await P.evaluate(async o => {
    const U = __spk.page.ui(), F = U.f1, k0 = __fokus1.info().key; __T.got(await __spk.mask(o)); const t0 = performance.now(); let hit = false, kNew = false;
    for (;;) { await new Promise(r => setTimeout(r, 2)); if (F.run && F.sig === fokus1Sig(U)) { hit = true; kNew = __fokus1.chunks().some(c => U.f1.set.chunks[c.k] && U.f1.set.chunks[c.k].key && U.f1.set.chunks[c.k].key !== k0); __fokus1.mode('alles'); break; } if (performance.now() - t0 > 5000) break; }
    await new Promise(r => setTimeout(r, 150)); __fokus1.mode('rest');
    const t1 = performance.now(); for (;;) { await new Promise(r => setTimeout(r, 20)); if (__T.done() || performance.now() - t1 > 60000) break; }
    await new Promise(r => setTimeout(r, 300));
    const h = __T.hash(), st = U.st.textContent;
    __fokus1.mode('gefunden'); await new Promise(r => setTimeout(r, 50)); __fokus1.mode('rest');   // anderer Modus → Satz verworfen → frisch gerechnet
    const t2 = performance.now(); for (;;) { await new Promise(r => setTimeout(r, 20)); if ((__T.done() && __fokus1.info().key) || performance.now() - t2 > 90000) break; }
    await new Promise(r => setTimeout(r, 300));
    return {hit, kNew, h, hRef: __T.hash(), st, ap: __fokus1.info().ap};
  }, rect(60, 70, 300, 900));
  console.log(tag, 'P2', JSON.stringify(R.P2));
  R.errs = pg.errs.slice(0, 6); console.log(tag, 'errs', JSON.stringify(R.errs), 'Last', load());
  await pg.ctx.close();
}
const N1 = OUT.neu, B1 = OUT.basis, nCk = N1.P1.mid ? N1.P1.mid.chunks : 0;
ok('P1 Hin-und-Her-Rollen: Nachreichen kommt voran (alle Stücke genau, während noch gerollt wird)', {apZero: N1.P1.mid && N1.P1.mid.apZero, flips: N1.P1.mid && N1.P1.mid.flips}, N1.P1.mid && N1.P1.mid.apZero > 0 && N1.P1.mid.ap === 0);
ok('P1 Neu-Planungen begrenzt (Listen-Aufträge ≤ Stücke + 2, Ablösungen ≤ Stücke)', {list: N1.P1.nList, rpn: N1.P1b.info.rpn, stuecke: nCk}, N1.P1.nList <= nCk + 2 && N1.P1b.info.rpn <= nCk);
ok('P1 Endbild byte-gleich v6', [N1.P1.h, B1.P1.h], N1.P1.h === B1.P1.h);
ok('P1 Ende: keine Näherung, idle, Status Endergebnis', {ap: N1.P1b.info.ap, idle: N1.P1b.idle, stat: N1.P1b.stat}, !N1.P1b.info.ap && N1.P1b.idle && /^Fokus: Rest/.test(N1.P1b.stat));
ok('P1 kein veraltetes Stück gezeichnet, sichtbare genau', {bad: N1.P1.bad, vis: N1.P1.vis}, !N1.P1.bad && N1.P1.vis === 'ok');
ok('P2 abgebrochener Satz (Alles → Nur Rest) gilt nicht als aktuell: Endbild = frischer Satz', {neu: [N1.P2.h, N1.P2.hRef], basis: [B1.P2.h, B1.P2.hRef], hit: N1.P2.hit}, N1.P2.hit && N1.P2.h === N1.P2.hRef && !N1.P2.ap);
ok('P2 frischer Satz byte-gleich v6', [N1.P2.hRef, B1.P2.hRef], N1.P2.hRef === B1.P2.hRef);
ok('Konsole 0 Fehler (neu, basis)', [N1.errs, B1.errs], !N1.errs.length && !B1.errs.length);
console.log(`\nERGEBNIS fok3p: ${nOk} OK / ${nF} FEHLER`);
fs.writeFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), 'fok3p-ergebnis.json'), JSON.stringify({res, OUT}, null, 1));
await b.close(); srv.close();
