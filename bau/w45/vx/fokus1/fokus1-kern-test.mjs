// FOKUS1 Kern-Test: Worker-Fall 'fokus' (Nur Rest / Nur Gefundenes), Noten finden auf dem Rest, Umlenkung der Werkzeuge.
// Signal im Seiten-Kontext: Ton A (220 Hz, 8 Teiltöne, 2–6 s) + Ton B (311,13 Hz, 8 Teiltöne, 8–12 s) + leises Rauschen.
// Aufruf: node fokus1-kern-test.mjs <abs. index.html>   (LONG=0 → ohne 3-Minuten-Messung)
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const file = path.resolve(process.argv[2]), dir = path.dirname(file);
const srv = http.createServer((q, r) => { const p = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': p.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok)); const url = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(file);
let nOk = 0, nF = 0; const res = {};
const ok = (k, v, c) => { res[k] = {v, ok: !!c}; c ? nOk++ : nF++; console.log((c ? 'OK     ' : 'FEHLER ') + k + ' ' + JSON.stringify(v)); };
const b = await chromium.launch();
const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2}), p = await ctx.newPage(), errs = [];
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
await p.goto(url); await p.waitForFunction(() => window.SYNQUENZER && window.__spk && window.__fokus1, null, {timeout: 90000}); await p.waitForTimeout(500);
await p.evaluate(() => {
  window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push({t: e.startTime, d: e.duration}); }).observe({entryTypes: ['longtask']}); } catch (e) {}
  const PW = new Float64Array(256); for (let b = 1; b < 256; b++) PW[b] = Math.pow(10, (b * 120 / 255 - 120) / 10);
  const fnv = (h, u8) => { for (let i = 0; i < u8.length; i++) { h ^= u8[i]; h = Math.imul(h, 16777619); } return h >>> 0; };
  window.__fkH = {
    hashChunks: got => { let h = 0x811c9dc5; for (const c of got.slice().sort((a, b) => a.k - b.k)) h = fnv(h, c.data); return h.toString(16); },
    hashF32: arrs => { let h = 0x811c9dc5; for (const a of arrs) h = fnv(h, new Uint8Array(a.buffer, a.byteOffset, a.byteLength)); return h.toString(16); },
    // Energie je Teilton-Band (±3 Zeilen ≈ ±37 Cent) in [t0, t1]: dB(got) − dB(orig)
    bands: (O, G, f0, H, t0, t1, sr, half) => {
      const byK = a => { const m = new Map(); for (const c of a) m.set(c.k, c); return m; }, MO = byK(O), MG = byK(G), hop = O[0].hop, out = [];
      for (let h = 1; h <= H; h++) {
        const rc = Math.round((12 * Math.log2(h * f0 / 440) + 69 - 12) * 8); let eo = 0, eg = 0;
        for (let gc = Math.ceil(t0 * sr / hop); gc <= Math.floor(t1 * sr / hop); gc++) {
          const co = MO.get(gc >> 10), cg = MG.get(gc >> 10); if (!co || !cg) continue; const c = gc & 1023;
          for (let r = rc - (half || 3); r <= rc + (half || 3); r++) { eo += PW[co.data[r * co.w + c]]; eg += PW[cg.data[r * cg.w + c]]; }
        }
        out.push(+(10 * Math.log10((eg + 1e-30) / (eo + 1e-30))).toFixed(2));
      }
      return out;
    },
    region: (O, G, f0, f1, t0, t1, sr) => { const MO = new Map(O.map(c => [c.k, c])), MG = new Map(G.map(c => [c.k, c])), hop = O[0].hop, r0 = Math.round((12 * Math.log2(f0 / 440) + 57) * 8), r1 = Math.round((12 * Math.log2(f1 / 440) + 57) * 8); let eo = 0, eg = 0, diff = 0, n = 0;
      for (let gc = Math.ceil(t0 * sr / hop); gc <= Math.floor(t1 * sr / hop); gc++) { const co = MO.get(gc >> 10), cg = MG.get(gc >> 10); if (!co || !cg) continue; const c = gc & 1023; for (let r = r0; r <= r1; r++) { const a = co.data[r * co.w + c], g = cg.data[r * cg.w + c]; eo += PW[a]; eg += PW[g]; n++; if (a !== g) diff++; } }
      return {dB: +(10 * Math.log10((eg + 1e-30) / (eo + 1e-30))).toFixed(3), diff, n}; },
    exp: async () => { const r = await spk1Call('export', {id: SPK1.doc}); const L = JSON.stringify([r.meta.layers.map(l => [l.id, l.name, l.col]), r.meta.teil2 && r.meta.teil2.notes]); let h = 0x811c9dc5; for (const x of r.pcm) h = fnv(h, new Uint8Array(x.buffer)); for (const m of r.masks) h = fnv(h, m.data); h = fnv(h, new TextEncoder().encode(L)); return h.toString(16); }
  };
});
// ---------- Signal laden ----------
const SR = 44100;
const loadSig = (sec, rep) => p.evaluate(async ([sec, rep, sr]) => {
  await __spk.page.open({}); const n = Math.round(sec * sr), x = new Float32Array(n); let s1 = 7; const rnd = () => ((s1 = (s1 * 1103515245 + 12345) >>> 0) / 4294967296) * 2 - 1;
  const tone = (f, a, b) => { const i0 = Math.round(a * sr), i1 = Math.round(b * sr), fd = Math.round(0.01 * sr); for (let i = i0; i < i1 && i < n; i++) { const e = Math.min(1, (i - i0) / fd, (i1 - i) / fd); let v = 0; for (let h = 1; h <= 8; h++) v += 0.3 / h * Math.sin(2 * Math.PI * f * h * i / sr); x[i] += e * v; } };
  for (let r = 0; r < rep; r++) { tone(220, 2 + 14 * r, 6 + 14 * r); tone(311.13, 8 + 14 * r, 12 + 14 * r); }
  for (let i = 0; i < n; i++) x[i] += 0.002 * rnd();
  const r = await __spk.load({name: 'Fokus-Test', sr, ch: [x]}); await __spk.page.open({id: r.meta.id}); return r.meta.id;
}, [sec, rep, SR]);
const ready = () => p.waitForFunction(() => { const i = __spk.page.info(); return i && !i.nodoc && i.chunks > 0 && !/Spektrum \d/.test(i.stat) && !__spk.page.ui().specQ; }, null, {timeout: 300000});
await loadSig(14, 1); await ready(); await p.waitForTimeout(400);
ok('laden', await p.evaluate(() => ({how: __spk.state().how, chunks: __spk.page.info().chunks})), true);
// Original-Stücke (Cache) + Hash vorher
const pre = await p.evaluate(async () => { const s = await __spk.spec(4096); window.__O = s.got; return {n: s.got.length, cached: s.got.every(c => c.cached), h: __fkH.hashChunks(s.got), exp: await __fkH.exp(), aud: __fkH.hashF32((await __spk.render(null)).ch)}; });
ok('original-stuecke', pre, pre.n === 2);
// ---------- Fall A: Noten nur im Original (keine Ebene) ----------
const nA = await p.evaluate(async () => { const r = await __spk.spk2.noten('orig', [{art: 'zeit', t0: 1.5, t1: 6.5}]); const N = r.meta.teil2.notes.orig || []; return N.map(q => ({id: q.id, f: +q.f.toFixed(1), a: +q.a.toFixed(2), b: +q.b.toFixed(2), conf: q.conf != null ? +q.conf.toFixed(2) : null, st: q.st})); });
ok('A noten-gefunden', nA, nA.length >= 1 && nA.some(q => Math.abs(1200 * Math.log2(q.f / 220)) < 60));
const preA = await p.evaluate(async () => ({exp: await __fkH.exp(), aud: __fkH.hashF32((await __spk.render(null)).ch)}));
const A = await p.evaluate(async sr => {
  const r = await __fokus1.get({mode: 'rest', aus: 'alle'}), O = __O, G = r.got;
  const fmt = {k: G.map(c => c.k), w: G.map(c => c.w), R: G[0].R, hop: G[0].hop, same: G.every((c, i) => c.w === O.find(o => o.k === c.k).w && c.R === 984 && c.hop === O[0].hop)};
  const s = await __fokus1.get({mode: 'rest', aus: 'sicher'});
  return {key: r.key, nAus: r.nAus, anteil: r.anteil, stop: r.stop, ms: r.ms, fmt, bA: __fkH.bands(O, G, 220, 8, 2.6, 5.4, sr), bB: __fkH.bands(O, G, 311.13, 8, 8.5, 11.5, sr),
    rest0: __fkH.region(O, G, 30, 16000, 0, 1.7, sr), rest1: __fkH.region(O, G, 30, 16000, 6.5, 13.5, sr), sicher: {nAus: s.nAus, key: s.key}};
}, SR);
ok('A format-wie-spec', A.fmt, A.fmt.same && A.fmt.k.length === 2);
ok('A teiltoene-ausgeblendet>=20dB (nur Noten, keine Ebene)', A.bA, A.bA.every(v => v <= -20));
ok('A andere-baender-gleich+-1dB', A.bB, A.bB.every(v => Math.abs(v) <= 1));
ok('A ausserhalb-byte-gleich', {vor: A.rest0, nach: A.rest1}, A.rest0.diff === 0 && A.rest1.diff === 0);
ok('A status-daten', {nAus: A.nAus, anteil: A.anteil, stop: A.stop, ms: A.ms, sicher: A.sicher}, A.nAus >= 1 && A.anteil > 0 && A.anteil < 1 && !A.stop);
const postA = await p.evaluate(async () => ({exp: await __fkH.exp(), aud: __fkH.hashF32((await __spk.render(null)).ch)}));
ok('A export+audio-unveraendert', {vor: preA, nach: postA}, preA.exp === postA.exp && preA.aud === postA.aud);
// ---------- Fall B: Noten der Ebene zuordnen (Maske + Noten) ----------
const zu = await p.evaluate(async () => { const N = (SPK1.last.meta.teil2.notes.orig || []).filter(q => Math.abs(1200 * Math.log2(q.f / 220)) < 60); const r = await __spk.spk2.zuordnen(N.map(q => ({lid: 'orig', id: q.id})), 'neu', 'lead'); return {nach: r.nach, n: r.n, anteil: r.anteil, layers: r.meta.layers.map(l => l.id + ':' + l.ver)}; });
ok('B zuordnen', zu, zu.n >= 1 && zu.layers.length === 1);
const B = await p.evaluate(async sr => {
  const O = __O, r = await __fokus1.get({mode: 'rest', aus: 'sicher'}), r2 = await __fokus1.get({mode: 'rest', aus: 'sicher'}), g = await __fokus1.get({mode: 'gef', aus: 'sicher'});
  return {key: r.key, nAus: r.nAus, anteil: r.anteil, neu: r.neu, wieder: {key: r2.key, neu: r2.neu, cached: r2.got.every(c => c.cached), gleich: __fkH.hashChunks(r.got) === __fkH.hashChunks(r2.got)},
    bA: __fkH.bands(O, r.got, 220, 8, 2.6, 5.4, sr), bB: __fkH.bands(O, r.got, 311.13, 8, 8.5, 11.5, sr), gA: __fkH.bands(O, g.got, 220, 8, 2.6, 5.4, sr), gB: __fkH.bands(O, g.got, 311.13, 8, 8.5, 11.5, sr), gAnteil: g.anteil};
}, SR);
ok('B neuer-schluessel', {A: A.key, B: B.key, neu: B.neu}, B.key !== A.key && B.neu === 2);
ok('B rest: A-teiltoene>=20dB', B.bA, B.bA.every(v => v <= -20));
ok('B rest: B-baender+-1dB', B.bB, B.bB.every(v => Math.abs(v) <= 1));
ok('B gef: A sichtbar (+-3dB), B weg (<=-20dB)', {gA: B.gA, gB: B.gB}, B.gA.every(v => Math.abs(v) <= 3) && B.gB.every(v => v <= -20));
ok('B zwischenstand (gleicher Schluessel, nichts neu)', B.wieder, B.wieder.key === B.key && B.wieder.neu === 0 && B.wieder.cached && B.wieder.gleich);
ok('B anteil rest+gef ~ 1', {rest: B.anteil, gef: B.gAnteil}, B.anteil > 0 && B.anteil < 1 && B.gAnteil > 0 && B.gAnteil < 1);
// ---------- Ebenen-Änderung → neuer Schlüssel → neue Stücke ----------
const C = await p.evaluate(async sr => {
  const lid = SPK1.last.meta.layers[0].id, k0 = (await __fokus1.key({mode: 'rest', aus: 'sicher'})).key;
  const m = await __spk.mask({von: 'orig', nach: lid, modus: 'verschieben', sel: [{art: 'rect', t0: 8, t1: 12, f0: 280, f1: 345, kt: 0, kf: 0}]});
  const k1 = (await __fokus1.key({mode: 'rest', aus: 'sicher'})).key, r = await __fokus1.get({mode: 'rest', aus: 'sicher'});
  return {k0, k1, key: r.key, neu: r.neu, b1: __fkH.bands(__O, r.got, 311.13, 1, 8.5, 11.5, sr)[0], bH: __fkH.bands(__O, r.got, 311.13, 8, 8.5, 11.5, sr).slice(1), anteil: m.anteil};
}, SR);
ok('C ebene-geaendert → neuer schluessel + neue stuecke', {k0: C.k0, k1: C.k1, neu: C.neu}, C.k0 !== C.k1 && C.key === C.k1 && C.neu === 2);
ok('C verschobener grundton weg, obertoene gleich', {b1: C.b1, bH: C.bH}, C.b1 <= -20 && C.bH.every(v => Math.abs(v) <= 1));
// ---------- Ablösen: neuer Auftrag löst den alten ab ----------
const D = await p.evaluate(async () => { const a = __fokus1.get({mode: 'gef', aus: 'alle'}), c = __fokus1.get({mode: 'rest', aus: 'alle'}); const [ra, rc] = await Promise.all([a, c]); return {a: {stop: ra.stop, n: ra.n}, c: {stop: rc.stop, n: rc.n}}; });
ok('D abloesen', D, D.c.stop === '' && D.c.n === 2 && (D.a.stop === 'abgeloest' || D.a.n === 2));
// ---------- Spektrum-Cache des Originals byte-gleich ----------
const post = await p.evaluate(async () => { const s = await __spk.spec(4096); return {n: s.got.length, cached: s.got.every(c => c.cached), h: __fkH.hashChunks(s.got)}; });
ok('spec-cache byte-gleich vor/nach', {vor: pre.h, nach: post.h, cached: post.cached}, pre.h === post.h && post.cached);
// ---------- Umlenkung (Haken in spk1Call) ----------
const R = await p.evaluate(() => {
  const U = __spk.page.ui(), out = {}; U.f1 = null; out.aus = __fokus1.route('spk12zauber', {t: 1, f: 440});
  U.f1 = {mode: 'rest', aus: 'sicher'};
  const z = __fokus1.route('spk12zauber', {t: 1, f: 440}), h = __fokus1.route('harm', {t: 1, f: 220}), ae = __fokus1.route('aehnlich', {ex: {}}), l = __fokus1.route('spk12trans', {s12src: 'x1'}), n = __fokus1.route('noten', {lid: 'orig'}), nl = __fokus1.route('noten', {lid: 'x1'}), t = __fokus1.route('transfer', {von: 'orig', modus: 'verschieben'}), tk = __fokus1.route('transfer', {von: 'orig', modus: 'kopieren'}), sp = __fokus1.route('spec', {N: 4096});
  out.rest = {z: z && [z[0], z[1].s12src], h: h && [h[0], h[1].s12src], ae: ae && [ae[0], ae[1].s12src], ebene: l, n: n && [n[0], n[1].fokus, n[1].aus], nl, t: t && t[1].von, tk, sp};
  return out;
});
ok('R umlenkung', R, R.aus === null && R.rest.z[0] === 'spk12zauber' && R.rest.z[1] === 'rest' && R.rest.h[0] === 'spk12harm' && R.rest.ae[0] === 'spk12aehnB' && R.rest.ebene === null && R.rest.n[1] === 'rest' && R.rest.nl === null && R.rest.t === 'rest' && R.rest.tk === null && R.rest.sp === null);
// Zauberstab auf dem Rest: Ton A liegt in der Ebene → am Ton A findet er im Rest (fast) nichts, im Original schon
const Z = await p.evaluate(async () => { const U = __spk.page.ui(); U.f1 = {mode: 'rest', aus: 'sicher'}; let zr = null, zo = null;
  try { zr = await spk1Call('spk12zauber', {doc: SPK1.doc, t: 4, f: 440, tol: 15, lim: 5, N: 4096}); } catch (e) { zr = {err: String(e)}; }
  U.f1 = null; try { zo = await spk1Call('spk12zauber', {doc: SPK1.doc, t: 4, f: 440, tol: 15, lim: 5, N: 4096}); } catch (e) { zo = {err: String(e)}; }
  const kurz = z => z && {err: z.err, t0: z.t0, t1: z.t1, f0: z.f0, f1: z.f1, n: z.n != null ? z.n : z.cells, src: z.s12src}; return {rest: kurz(zr), orig: kurz(zo)}; });
ok('Z zauberstab auf dem rest (info)', Z, !(Z.rest && Z.rest.err) && Z.rest && Z.rest.src && Z.rest.src.lid === 'rest');
// Noten finden auf dem Rest (Original): B wird gefunden, A nicht noch einmal (liegt in der Ebene / ist gefunden)
const NR = await p.evaluate(async () => { const U = __spk.page.ui(); U.f1 = {mode: 'rest', aus: 'alle'}; const vor = (SPK1.last.meta.teil2.notes.orig || []).length;
  const r = await __spk.spk2.noten('orig', []); U.f1 = null; const N = r.meta.teil2.notes.orig || [];
  const u = await __spk.undo(); const nachUndo = (u.meta.teil2.notes.orig || []).length; await __spk.redo();
  return {fokus: r.fokus, vor, nachUndo, notes: N.map(q => +q.f.toFixed(1)), nA: N.filter(q => Math.abs(1200 * Math.log2(q.f / 220)) < 60).length, nB: N.filter(q => Math.abs(1200 * Math.log2(q.f / 311.13)) < 60 || Math.abs(1200 * Math.log2(q.f / 622.26)) < 60).length}; });
ok('N noten auf dem rest: B gefunden, A nicht', NR, NR.fokus && NR.fokus.rest && NR.nA === 0 && NR.nB >= 1 && NR.nachUndo === NR.vor);
// ---------- 3 Minuten: Zeit je Stück, Long Tasks im Hauptfaden ----------
if (process.env.LONG !== '0') {
  await loadSig(182, 13); await ready(); await p.waitForTimeout(400);
  const L = await p.evaluate(async () => {
    const r0 = await __spk.spk2.noten('orig', [{art: 'zeit', t0: 0, t1: 30}]); const N = (r0.meta.teil2.notes.orig || []).filter(q => q.st === 'ok');
    await __spk.spk2.zuordnen(N.slice(0, 2).map(q => ({lid: 'orig', id: q.id})), 'neu', 'lead');
    const runs = [];
    for (const mode of ['rest', 'rest', 'gef']) {
      __lt.length = 0; const T0 = performance.now(); let first = 0;
      const r = await __fokus1.get({mode, aus: 'alle'}, {chunk: () => { if (!first) first = performance.now() - T0; }});
      runs.push({mode, n: r.n, neu: r.neu, ms: r.ms, msJeStueck: +(r.ms / Math.max(1, r.n)).toFixed(1), erstesStueck: +first.toFixed(0), wand: +(performance.now() - T0).toFixed(0), lt: __lt.map(e => +e.d.toFixed(0)), nAus: r.nAus, anteil: r.anteil});
      if (mode === 'rest' && runs.length === 1) { await __fokus1.key({mode: 'gef'}); }
    }
    return {chunks: runs[0].n, runs, how: __spk.state().how};
  });
  const r1 = L.runs[0], mx = Math.max(0, ...L.runs.flatMap(r => r.lt));
  ok('3min fokus im worker (zeiten)', L, L.chunks >= 16 && r1.neu === L.chunks && L.runs[1].neu <= L.chunks);
  ok('3min keine long tasks > 50 ms im hauptfaden', {max: mx}, mx <= 50);
}
ok('keine Fehler', errs.slice(0, 5), errs.length === 0);
await b.close(); srv.close();
fs.writeFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), 'fokus1-kern-ergebnis.json'), JSON.stringify({nOk, nF, res}, null, 1));
console.log(`\n${nOk} OK, ${nF} FEHLER`); process.exit(nF ? 1 : 0);
