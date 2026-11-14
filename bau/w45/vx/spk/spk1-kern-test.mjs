// SPK1 Kern-Test (Schritt 2/4): Rekonstruktion, Anzeige-Stücke, Ebenen-Summe = Original, Undo, Speichern/Laden, ZIP, Aufräumen, Start
// Aufruf: node spk1-kern-test.mjs <index.html>
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const file = path.resolve(process.argv[2] || 'index.html');
const srv = http.createServer((q, r) => { const p = path.join(path.dirname(file), decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, {'content-type': p.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream'}); fs.createReadStream(p).pipe(r); });
await new Promise(ok => srv.listen(0, ok));
const url = 'http://127.0.0.1:' + srv.address().port + '/' + path.basename(file);
const b = await chromium.launch();
const p = await b.newPage({viewport: {width: 428, height: 926}});
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.addInitScript(() => { const W = window.Worker; window.__wk = []; window.Worker = function (u, o) { window.__wk.push(String(u)); return new W(u, o); }; window.Worker.prototype = W.prototype; });
const t0 = Date.now();
await p.goto(url); await p.waitForFunction(() => window.SYNQUENZER && window.__spk, null, {timeout: 60000}); await p.waitForTimeout(1500);
const res = {};
const ok = (k, v, cond) => { res[k] = {v, ok: !!cond}; console.log((cond ? 'OK  ' : 'FEHL') + ' ' + k + ' ' + JSON.stringify(v)); };
// 0) Start: kein Spektral-Worker, keine spk-Daten, kein Verweis im Projekt
const st0 = await p.evaluate(async () => ({state: __spk.state(), workers: __wk.length, ser: SYNQUENZER.serialize().includes('"spk"')}));
ok('start-ohne-worker', st0, st0.state.how === '' && !st0.state.worker && !st0.ser);
const ser0 = await p.evaluate(() => SYNQUENZER.serialize());
// 1) Rekonstruktion STFT → ISTFT
const rt = await p.evaluate(async () => {
  const out = []; let s = 7;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647 * 2 - 1; };
  const x = new Float32Array(48000 * 3); for (let i = 0; i < x.length; i++) x[i] = 0.3 * rnd() + 0.4 * Math.sin(2 * Math.PI * 220 * i / 48000) + (i % 9000 === 0 ? 0.9 : 0);
  for (const N of [1024, 4096, 16384]) out.push(await __spk.stft(x, N));
  return out;
});
ok('rekonstruktion', rt.map(r => ({N: r.N, max: +r.maxDb.toFixed(1), rms: +r.rmsDb.toFixed(1)})), rt.every(r => r.maxDb < -80 && r.rmsDb < -100));
// 2) Quelle laden (Stereo 8 s): Bass 55 Hz, Klicks, Ton 440 Hz mit Vibrato
const ld = await p.evaluate(async () => {
  const sr = 48000, n = sr * 8, L = new Float32Array(n), R = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr, f = 440 * Math.pow(2, 0.3 / 12 * Math.sin(2 * Math.PI * 5.5 * t)); ph += 2 * Math.PI * f / sr;
    const bass = 0.35 * Math.sin(2 * Math.PI * 55 * t), tone = (t > 1 && t < 6 ? 0.2 : 0) * Math.sin(ph), click = (i % 12000) < 40 ? 0.5 * (1 - (i % 12000) / 40) * (((i * 7919) % 13) / 6.5 - 1) : 0;
    L[i] = bass + tone + click; R[i] = bass + 0.7 * tone + click;
  }
  const t = performance.now(); const r = await __spk.load({name: 'Prüfsignal', sr, ch: [L, R]}); return {id: r.meta.id, n: r.meta.n, ch: r.meta.ch, F: r.F, NS: r.NS, ms: Math.round(performance.now() - t), how: __spk.state().how, grid: r.meta.grid};
});
ok('laden', ld, ld.n === 384000 && ld.ch === 2 && ld.how === 'worker' && ld.grid && ld.grid.bpm > 0);
// 3) Anzeige-Stücke (log-Frequenz) – Spitzen an der richtigen Zeile; zweiter Lauf aus dem Speicher
const sp = await p.evaluate(async () => {
  const t = performance.now(), I = await __spk.spec(4096), ms = Math.round(performance.now() - t);
  const c0 = I.got[0], col = Math.round(3 * 48000 / I.hop), W = c0.w, R = c0.R, peak = (lo, hi) => { let best = -1, br = -1; for (let r = lo; r < hi; r++) { const v = c0.data[r * W + col]; if (v > best) { best = v; br = r; } } return {row: br, v: best}; };
  const t2 = performance.now(), I2 = await __spk.spec(4096), ms2 = Math.round(performance.now() - t2);
  return {cols: I.cols, rows: I.rows, hop: I.hop, chunks: I.chunks, got: I.got.length, ms, ms2, cached: I2.got.every(c => c.cached), bass: peak(100, 300), tone: peak(400, 520)};
});
// 55 Hz = MIDI 33 → Zeile (33 − 12)·8 = 168; 440 Hz = MIDI 69 → Zeile 456 (Vibrato ±0,3 Halbton → ±3 Zeilen)
ok('anzeige-stuecke', sp, sp.rows === 984 && sp.got === sp.chunks && Math.abs(sp.bass.row - 168) <= 1 && Math.abs(sp.tone.row - 456) <= 4 && sp.cached);
// 4) Ebenen: Bass (Frequenz-Auswahl) und Lead (Rechteck mit weicher Kante), Teil von Lead → Bass verschieben, Kopie
const ly = await p.evaluate(async () => {
  const a = await __spk.mask({von: 'orig', nach: {art: 'bass'}, sel: {art: 'freq', f0: 0, f1: 150, kf: 100}});
  const b = await __spk.mask({von: 'orig', nach: {art: 'lead'}, sel: {art: 'rect', t0: 1, t1: 6, f0: 300, f1: 2500, kt: 0.05, kf: 60}});
  const c = await __spk.mask({von: 'L2', nach: 'L1', modus: 'verschieben', sel: {art: 'rect', t0: 2, t1: 3, f0: 300, f1: 600}});
  const s = await __spk.sum(); const L = await __spk.layers();
  return {a: a.nach, b: b.nach, anteil: [a.anteil, b.anteil, c.anteil], layers: L.layers.map(l => [l.id, l.name, l.art, l.col]), sum: s, undo: c.nu};
});
ok('ebenen', ly, ly.a === 'L1' && ly.b === 'L2' && ly.sum.over === 0 && ly.layers.length === 2 && ly.undo === 3);
// 5) Summe aller Ebenen (L1 + L2 + Rest) = Original; Standard-Mischung = Original
const sm = await p.evaluate(async () => {
  const n = 48000 * 8, o = await __spk.render('orig', 0, n), parts = [await __spk.render('L1', 0, n), await __spk.render('L2', 0, n), await __spk.render('rest', 0, n)], all = await __spk.render(null, 0, n);
  const err = (ys) => { let pk = 1e-9, e = 0, e2 = 0, s2 = 0; for (let c = 0; c < 2; c++) for (let i = 0; i < n; i++) { const x = o.ch[c][i]; const y = ys(c, i); pk = Math.max(pk, Math.abs(x)); e = Math.max(e, Math.abs(y - x)); e2 += (y - x) ** 2; s2 += x * x; } return {max: +(20 * Math.log10(e / pk + 1e-30)).toFixed(1), rms: +(10 * Math.log10(e2 / s2 + 1e-30)).toFixed(1)}; };
  const rms = ch => { let s = 0; for (let i = 0; i < ch.length; i++) s += ch[i] * ch[i]; return +Math.sqrt(s / ch.length).toFixed(4); };
  return {summe: err((c, i) => parts[0].ch[c][i] + parts[1].ch[c][i] + parts[2].ch[c][i]), standard: err((c, i) => all.ch[c][i]), rms: {orig: rms(o.ch[0]), bass: rms(parts[0].ch[0]), lead: rms(parts[1].ch[0]), rest: rms(parts[2].ch[0])}};
});
ok('summe-gleich-original', sm, sm.summe.max < -80 && sm.standard.max < -80 && sm.rms.bass > 0.2 && sm.rms.lead > 0.05);
// 6) Undo / Redo: Kacheln bitgleich
const ud = await p.evaluate(async () => {
  const pts = [['L1', 100, 2], ['L1', 120, 30], ['L2', 150, 60], ['L2', 300, 40]], read = async () => { const r = []; for (const [l, m, k] of pts) r.push(await __spk.maskAt(l, m, k)); return r; };
  const before = await read();
  const s0 = await __spk.sum();
  const t = await __spk.mask({von: 'orig', nach: 'neu', art: 'pads', sel: {art: 'zeit', t0: 1.5, t1: 4, kt: 0.1}});
  const mid = await read(), s1 = await __spk.sum();
  const u = await __spk.undo(); const after = await read(); const s2 = await __spk.sum();
  const r = await __spk.redo(); const again = await read();
  const u2 = await __spk.undo();
  return {before, mid, after, again, label: u.label, layersAfterUndo: u.meta.layers.length, layersRedo: r.meta.layers.length, same: JSON.stringify(s0) === JSON.stringify(s2), s1over: s1.over, nach: t.nach, u2: u2.label};
});
ok('undo-redo', ud, JSON.stringify(ud.before) === JSON.stringify(ud.after) && JSON.stringify(ud.mid) === JSON.stringify(ud.again) && JSON.stringify(ud.before) !== JSON.stringify(ud.mid) && ud.same && ud.layersAfterUndo === 2 && ud.layersRedo === 3 && ud.s1over === 0);
// 7) Ebene: Name/Farbe (Undo-Schritt), Lautstärke/Solo (kein Schritt) → Mischung wirkt
const lv = await p.evaluate(async () => {
  const a = await __spk.layer('name', 'L1', 'Tiefbass'); const nu1 = a.nu;
  const b = await __spk.layer('vol', 'L1', -6); const nu2 = b.nu;
  const c = await __spk.layer('solo', 'L2', true);
  const n = 48000 * 2, mix = await __spk.render(null, 48000, 48000 + n), l2 = await __spk.render('L2', 48000, 48000 + n);
  let e = 0; for (let i = 0; i < n; i++) e = Math.max(e, Math.abs(mix.ch[0][i] - l2.ch[0][i]));
  await __spk.layer('solo', 'L2', false); await __spk.layer('vol', 'L1', 0);
  const u = await __spk.undo();
  return {name: a.meta.layers[0].name, nu1, nu2, soloErr: e, undoLabel: u.label, nameAfter: u.meta.layers[0].name};
});
ok('ebene-optionen', lv, lv.name === 'Tiefbass' && lv.nu2 === lv.nu1 && lv.soloErr < 1e-6 && lv.nameAfter === 'Bass');
// 8) Speichern / Neu öffnen (IDB) → gleiche Masken
const sv = await p.evaluate(async () => {
  const s0 = await __spk.sum(), v0 = await __spk.maskAt('L2', 150, 60), sv = await __spk.save(); await __spk.close();
  const id = __spk.state().doc, r = await __spk.open(id), s1 = await __spk.sum(), v1 = await __spk.maskAt('L2', 150, 60);
  const ks = await new Promise(res => { const q = indexedDB.open('synquenzer', 2); q.onsuccess = () => { const t = q.result.transaction('audio').objectStore('audio').getAllKeys(); t.onsuccess = () => res(t.result.map(String).filter(k => k.startsWith('spk:' + id))); }; });
  return {bytes: sv.bytes, same: JSON.stringify(s0) === JSON.stringify(s1), v0, v1, layers: r.meta.layers.length, keys: ks.length, maskKeys: ks.filter(k => /:mL/.test(k)).length, specKeys: ks.filter(k => /:v4096:/.test(k)).length};
});
ok('speichern-laden', sv, sv.same && sv.v0 === sv.v1 && sv.layers === 2 && sv.maskKeys > 0 && sv.specKeys > 0);
// 9) Aufräumen löscht keine Spektral-Daten
const gc = await p.evaluate(async () => { const n = await SYNQUENZER.tkGc(); await __spk.close(); const r = await __spk.open(__spk.state().doc); const s = await __spk.sum(); return {deleted: n, layers: r.meta.layers.length, tiles: s.tiles}; });
ok('aufraeumen', gc, gc.layers === 2 && gc.tiles > 0);
// 10) Projekt-Verweis + ZIP-Container (selbsttragend): Daten löschen → ZIP zurück → gleich
const zp = await p.evaluate(async () => {
  const id = __spk.state().doc, ref = (await __spk.render(null, 0, 96000)).ch[0];
  __spk.link(); const ser = SYNQUENZER.serialize(), info = await SYNQUENZER.tkZipInfo();
  const z = await SYNQUENZER.tkZipBytes();
  await __spk.remove(id); let gone = false; try { await __spk.open(id); } catch (e) { gone = true; }
  const back = await SYNQUENZER.tkImportZip(z);
  const r = await __spk.open(id), y = (await __spk.render(null, 0, 96000)).ch[0]; let e = 0; for (let i = 0; i < y.length; i++) e = Math.max(e, Math.abs(y[i] - ref[i]));
  return {ser: ser.includes('"spk":[{"id":"' + id + '"'), files: info.files.filter(f => f.name.startsWith('spektral/')).map(f => f.name + ':' + f.n), gone, back: back.ok, layers: r.meta.layers.length, maxErr: e, serAfter: SYNQUENZER.serialize().includes('"spk":[{"id":"' + id + '"')};
});
ok('zip-container', zp, zp.ser && zp.files.length >= 4 && zp.gone && zp.back && zp.layers === 2 && zp.maxErr === 0 && zp.serAfter);
// 11) Alte Projekte: ohne Verweis bleibt die Datei gleich (Feld nur, wenn benutzt)
const old = await p.evaluate(s0 => { SYNQUENZER.importJSON(s0); return {same: SYNQUENZER.serialize() === s0, spk: SYNQUENZER.serialize().includes('"spk"')}; }, ser0);
ok('alte-projekte', old, old.same && !old.spk);
// 12) Wiedergabe gestreamt (Blöcke kommen an, Stopp räumt auf)
const pl = await p.evaluate(async () => { const ok1 = __spk.play(0.5); await new Promise(r => setTimeout(r, 900)); const s = __spk.state(); __spk.stop(); await new Promise(r => setTimeout(r, 100)); return {ok1, playing: s.playing, after: __spk.state().playing}; });
ok('wiedergabe', pl, pl.ok1 && pl.playing && !pl.after);
ok('keine-fehler', errs, errs.length === 0);
console.log('ZEIT', Date.now() - t0, 'ms');
fs.writeFileSync(path.join(path.dirname(file), 'spk1-kern-test.json'), JSON.stringify(res, null, 1));
await b.close(); srv.close();
const bad = Object.entries(res).filter(([, v]) => !v.ok).map(([k]) => k);
console.log(bad.length ? 'FEHLER: ' + bad.join(', ') : 'ALLE OK');
process.exit(bad.length ? 1 : 0);
