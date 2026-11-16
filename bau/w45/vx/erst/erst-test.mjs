// ERST-Test: erster Tipp auf ▶ – Vorarbeit ohne AudioContext vor dem Tipp, gleiche Klänge/Zeitpunkte wie die Basis.
// node erst-test.mjs <index.html> <basis.html>   (428x926, Touch; Prüfungen bei 1x, Zeiten misst mess/mess.mjs)
import http from 'http'; import fs from 'fs'; import path from 'path'; import { chromium } from 'playwright';
const [IDX, BAS] = process.argv.slice(2).map(f => path.resolve(f));
const files = {'/i/': fs.readFileSync(IDX), '/b/': fs.readFileSync(BAS)};
const srv = http.createServer((q, r) => { const u = q.url.split('?')[0]; const k = Object.keys(files).find(k => u === k + 'Synquenzer/');
  if (k) { r.writeHead(200, {'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store'}); return r.end(files[k]); } r.writeHead(404); r.end(); });
await new Promise(res => srv.listen(0, '127.0.0.1', res));
const BASE = `http://127.0.0.1:${srv.address().port}`;
const b = await chromium.launch({args: ['--autoplay-policy=user-gesture-required']});
const res = []; const ok = (n, c, d) => { res.push({n, ok: !!c, d}); console.log((c ? 'OK     ' : 'FEHLER ') + n + (d != null ? '  ' + (typeof d === 'string' ? d : JSON.stringify(d)) : '')); };
const INIT = () => {
  window.__t = {ac: 0, oac: 0, tap: false, ab: 0};
  const wrapC = (name, key) => { const C = window[name]; if (!C) return; window[name] = class extends C { constructor(...a) { if (!window.__t.tap) window.__t[key]++; super(...a); } }; };
  wrapC('AudioContext', 'ac'); wrapC('webkitAudioContext', 'ac'); wrapC('OfflineAudioContext', 'oac');
  addEventListener('pointerdown', () => { window.__t.tap = true; }, true);
};
const fnvJs = `(a => { const u = new Uint8Array(a.buffer, a.byteOffset, a.byteLength); let h = 0x811c9dc5; for (let i = 0; i < u.length; i++) { h ^= u[i]; h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16); })`;
async function lauf(dir, o = {}) {
  const ctx = await b.newContext({viewport: {width: 428, height: 926}, deviceScaleFactor: 2, isMobile: true, hasTouch: true});
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await p.addInitScript(INIT);
  if (o.sr) await p.addInitScript(sr => { try { localStorage.setItem('synq.perf1b.sr', sr); } catch (e) {} }, o.sr);
  await p.goto(BASE + dir + 'Synquenzer/');
  await p.waitForFunction(() => document.getElementById('app') && !document.getElementById('app').classList.contains('loading') && document.readyState === 'complete', null, {timeout: 120000});
  const r = {};
  if (!o.sofort) {
    await p.waitForFunction(() => typeof ERST === 'undefined' || ((ERST.wk.url || !ERST.wk.parts) && (!ERST.mt.buf || ERST.mt.i >= ERST.mt.buf.length)), null, {timeout: 60000}).catch(() => {});
    await p.waitForTimeout(500);
  }
  if (o.wkAnders) await p.evaluate(() => { const el = document.getElementById('sq-worklet-src'); el.textContent = '/* anders */\n' + el.textContent; });
  r.vor = await p.evaluate(() => ({ac: window.__t.ac, oac: window.__t.oac, ctx: !!AU.ctx, erst: typeof ERST !== 'undefined' ? {url: !!ERST.wk.url, mt: ERST.mt.buf ? ERST.mt.i === ERST.mt.buf.length : null, sr: ERST.mt.sr} : null}));
  if (o.seed) await p.evaluate(() => { let s = 12345; Math.random = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; });   // gleiche Zufallsfolge ab dem Tipp (Rauschen, Groove)
  const box = await p.locator('#bPlay').boundingBox();
  await p.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await p.waitForTimeout(o.warte || 3000);
  r.nach = await p.evaluate(new Function('fnv', `return (${(fnvS => {
    const fnv = eval(fnvS);
    const rel = LOG.n ? (() => { const out = []; for (let i = 0; i < Math.min(LOG.n, 4096); i++) { const e = LOG.buf[i]; if (!e || e.removed) continue; out.push(e); } return out; })() : [];
    const notes = rel.filter(e => e.beat != null && e.beat >= 2 && e.beat < 8).map(e => ({tr: e.track, src: e.src, cn: e.clipNote, out: e.out, beat: e.beat, dur: +(+e.dur).toFixed(6), vel: +(+e.vel).toFixed(6), rt: +((e.time - R.startTime)).toFixed(6), late: !!e.late, bpm: S.bpm}))
      .sort((a, c) => a.rt - c.rt || a.tr - c.tr || a.out - c.out || String(a.src).localeCompare(String(c.src)));
    const nd = AU.noise ? AU.noise.getChannelData(0) : []; let nmin = 1, nmax = -1; const nd0 = AU.noise ? AU.noise.getChannelData(0) : []; for (let i = 0; i < nd.length; i++) { if (nd[i] < nmin) nmin = nd[i]; if (nd[i] > nmax) nmax = nd[i]; }
    return {playing: R.playing, state: AU.ctx && AU.ctx.state, sr: AU.ctx && AU.ctx.sampleRate, how: SynthHost.how, wk: SynthHost.state, synth: AU.synth.filter(Boolean).length,
      metal: AU.metal ? {h: fnv(AU.metal.getChannelData(0)), n: AU.metal.length, sr: AU.metal.sampleRate} : null, noise: AU.noise ? {h: fnv(nd), n: AU.noise.length, sr: AU.noise.sampleRate, min: nmin, max: nmax} : null,
      notes, late: notes.filter(x => x.late).length, waves: typeof WAVES_T !== 'undefined' && !!WAVES_T,
      erst: typeof ERST !== 'undefined' ? {wk: ERST.wk.took, mt: ERST.mt.took, wv: ERST.wv.done, url: ERST.wk.url, src: ERST.wk.src == null} : null};
  }).toString()})(fnv)`), fnvJs);
  if (o.wellen) r.wellen = await p.evaluate(new Function('fnv', `return (${(async fnvS => {
    const fnv = eval(fnvS), c = AU.ctx, A = [], B = [], orig = c.createPeriodicWave.bind(c); let L = A;
    c.createPeriodicWave = (re, im, k) => { L.push(fnv(re) + ':' + fnv(im) + ':' + (k ? JSON.stringify(k) : '')); return orig(re, im, k); };
    const ref = makeWaves(c); L = B;
    WAVES_T = null; ERST.wv = {c, jobs: null, T: null, k: 0, done: false}; const t0 = performance.now(); erstWvIdle();
    for (let i = 0; i < 200 && !ERST.wv.done; i++) await new Promise(r => setTimeout(r, 25));
    c.createPeriodicWave = orig;
    const T = WAVES_T, shape = o => Object.keys(o).map(k => k + o[k].length).join(',');
    return {a: A.length, b: B.length, gleich: A.join('|') === B.join('|'), shape: T ? shape(T) === shape(ref) : false, alle: T ? Object.values(T).every(g => g.every(w => w instanceof PeriodicWave)) : false, ms: Math.round(performance.now() - t0), ms2: ERST.ms.wv};
  }).toString()})(fnv)`), fnvJs);
  r.errs = errs; await ctx.close(); return r;
}
// 1) Hauptlauf Index (Rate wie am iPhone bekannt) und Basis
const I = await lauf('/i/', {sr: '44100', wellen: true, warte: 5000, seed: true}), B = await lauf('/b/', {sr: '44100', warte: 5000, seed: true}), B2 = await lauf('/b/', {sr: '44100', warte: 5000, seed: true});
ok('ERST-01 vor dem Tipp kein AudioContext (auch kein OfflineAudioContext) im Index', I.vor.ac === 0 && I.vor.oac === 0 && !I.vor.ctx, I.vor);
ok('ERST-02 Vorarbeit fertig vor dem Tipp (Blob-Adresse, Metall-Puffer)', I.vor.erst && I.vor.erst.url && I.vor.erst.mt === true, I.vor.erst);
ok('ERST-03 nach dem Tipp: spielt, Worklet über die vorbereitete Adresse geladen, Metall übernommen', I.nach.playing && I.nach.wk === 'ready' && I.nach.how === 'blob' && I.nach.erst.wk && I.nach.erst.mt && I.nach.erst.src, {playing: I.nach.playing, wk: I.nach.wk, how: I.nach.how, erst: I.nach.erst, synth: I.nach.synth});
ok('ERST-04 Metall-Puffer byte-gleich zur Basis (FNV über Float32)', I.nach.metal && B.nach.metal && I.nach.metal.h === B.nach.metal.h && I.nach.metal.n === B.nach.metal.n && I.nach.metal.sr === B.nach.metal.sr, {i: I.nach.metal, b: B.nach.metal});
ok('ERST-05 Rauschen wie bisher im Tipp: bei gleicher Zufallsfolge ab dem Tipp byte-gleich zur Basis', I.nach.noise && B.nach.noise && I.nach.noise.h === B.nach.noise.h && I.nach.noise.n === B.nach.noise.n && I.nach.noise.sr === B.nach.noise.sr && I.nach.noise.min >= -1 && I.nach.noise.max <= 1 && I.nach.noise.max > .99 && I.nach.noise.min < -.99, {i: I.nach.noise, b: B.nach.noise});
const key = n => JSON.stringify(n.filter(x => !x.late).map(x => [x.tr, x.src, x.cn, x.out, x.beat, x.dur, x.vel, x.rt]));
const diff = (x, y) => { const ky = new Set(y.filter(q => !q.late).map(q => JSON.stringify(q))); return x.filter(q => !q.late && !ky.has(JSON.stringify(q))); };
const nIdx = I.nach.notes.filter(x => !x.late).length, nBas = B.nach.notes.filter(x => !x.late).length;
const ctl = key(B.nach.notes) === key(B2.nach.notes);
ok('ERST-06a Kontrolle: Basis gegen Basis gleich, Schläge 2–8 (die ersten Schläge hängen schon in der Basis von der Hauptfaden-Zeit ab)', ctl, {b: nBas, b2: B2.nach.notes.length});
ok('ERST-06 noteLog Schläge 2–8 gleich (Spur, Quelle, Ton, Schlag, Dauer, Stärke, Zeit ab Start; ohne späte)', nIdx > 0 && key(I.nach.notes) === key(B.nach.notes), {idx: nIdx, basis: nBas, spaet: [I.nach.late, B.nach.late], nurIdx: diff(I.nach.notes, B.nach.notes).slice(0, 4), nurBasis: diff(B.nach.notes, I.nach.notes).slice(0, 4)});
ok('ERST-07 WT-Wellen in Scheiben: dieselben 16 Eingaben in derselben Reihenfolge wie makeWaves, gleicher Aufbau', I.wellen && I.wellen.a === 16 && I.wellen.b === 16 && I.wellen.gleich && I.wellen.shape && I.wellen.alle, I.wellen);
ok('ERST-08 keine Seitenfehler (Index/Basis)', !I.errs.length && !B.errs.length && !B2.errs.length, I.errs.concat(B.errs).slice(0, 3));
// 2) Rückfälle
const R48 = await lauf('/i/', {sr: '48000'});
ok('ERST-09 andere Rate (Vorarbeit 48 kHz, Umgebung ' + R48.nach.sr + '): alter Weg, Metall byte-gleich zur Basis', !R48.nach.erst.mt && R48.nach.metal && R48.nach.metal.h === B.nach.metal.h && R48.nach.playing && !R48.errs.length, {mt: R48.nach.erst.mt, metal: R48.nach.metal});
const RW = await lauf('/i/', {sr: '44100', wkAnders: true});
ok('ERST-10 geänderter Worklet-Text: vorbereitete Adresse nicht genommen, Worklet lädt wie bisher', !RW.nach.erst.wk && RW.nach.wk === 'ready' && RW.nach.how === 'blob' && RW.nach.erst.url == null && RW.nach.playing && !RW.errs.length, {wk: RW.nach.wk, how: RW.nach.how, erst: RW.nach.erst});
const RS = await lauf('/i/', {sr: '44100', sofort: true});
ok('ERST-11 Tipp sofort bei bereit (Vorarbeit evtl. unfertig): spielt, Worklet bereit, keine Fehler', RS.nach.playing && RS.nach.wk === 'ready' && RS.nach.metal && RS.nach.metal.h === B.nach.metal.h && !RS.errs.length, {vor: RS.vor.erst, erst: RS.nach.erst});
await b.close(); srv.close();
const f = res.filter(x => !x.ok).length;
console.log(`\nERST-Test: ${res.length - f}/${res.length} OK`);
fs.writeFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), 'erst-test.json'), JSON.stringify({res, I: {vor: I.vor, nach: Object.assign({}, I.nach, {notes: I.nach.notes.length}), wellen: I.wellen}}, null, 1));
process.exit(f ? 1 : 0);
