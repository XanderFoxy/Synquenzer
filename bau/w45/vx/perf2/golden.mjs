// PERF2 D – Golden-Render: Quelle gegen Auslieferung, bitgleich?
// Je Fassung eine frische Seite (file://). Vor jedem Render: Math.random im Hauptfaden geseedet (wie mtx3-test) und dieselbe
// geseedete Math.random-Zeile vor die Worklet-Texte (sq-worklet-src, sq-mk-src, sq-bm-src, sq-md-src) gesetzt (wie n5-k-golden).
// Gerendert: (1) der ganze Demo-Song über vvRenderAudio (Haupt-Planer + alle Worklets + Trommeln + FX, OfflineAudioContext),
// (2) mkRender für 6 Werksklänge (Analog/FM/MS 2000 je nach Werk). Verglichen: FNV-1a über die Float32-Bytes jedes Kanals.
// Kontrolle: die Quelle wird zweimal (zwei Seiten) gerendert – nur wenn Quelle == Quelle, sagt Quelle == Auslieferung etwas.
// Dazu clCoreVer() (Schlüssel des Reinigungs-Zwischenspeichers, aus vsCleanMake.toString()) in beiden Fassungen.
// Aufruf: node golden.mjs <quelle.html> <auslieferung.html>
import { createRequire } from 'node:module'; import path from 'node:path';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
const [Q, A] = process.argv.slice(2).map(f => path.resolve(f));
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
async function run(file) {
  const p = await b.newPage({viewport: {width: 428, height: 926}, deviceScaleFactor: 2, hasTouch: true, isMobile: true}); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version, null, {timeout: 60000}); await p.waitForTimeout(1500);
  const r = await p.evaluate(async () => {
    const SEED = 'Math.random = (() => { let s = 12345; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; })();\n';
    for (const id of ['sq-worklet-src', 'sq-mk-src', 'sq-bm-src', 'sq-md-src']) { const el = document.getElementById(id); if (el && !el.dataset.g) { el.dataset.g = 1; el.textContent = SEED + el.textContent; } }
    const fnv = a => { const u = new Uint8Array(a.buffer, a.byteOffset, a.byteLength); let h = 0x811c9dc5; for (let i = 0; i < u.length; i++) { h ^= u[i]; h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16); };
    const rms = a => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * a[i]; return +Math.sqrt(s / Math.max(1, a.length)).toFixed(6); };
    const seed = () => { let s = 777; Math.random = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };
    const MR = Math.random, out = {version: SYNQUENZER.version, cl: typeof clCoreVer === 'function' ? clCoreVer() : null};
    try {
      if (!S.song) SYNQUENZER.songFromChain(Array.from({length: Math.min(4, NS())}, (_, k) => ({scene: k, bars: 2})));   // Demo ohne Song: alle Szenen, je 2 Takte (wie mtx3-test)
      ensureAudio(); drumBufs(); seed(); VV.cancel = false;
      const s = await vvRenderAudio({range: {a: 0, b: S.song.bars, sel: false}});
      out.song = {bars: S.song.bars, n: s.ch[0].length, sr: s.sr, h: [fnv(s.ch[0]), fnv(s.ch[1])], rms: [rms(s.ch[0]), rms(s.ch[1])]};
    } catch (e) { out.song = {err: String(e)}; } finally { Math.random = MR; }
    // (1b) wie mtx3-test: nur die Trommel-Spur, Math.random fest – der Song-Render mit allen Spuren ist schon Quelle gegen Quelle
    // nicht bitgleich (Worklet-Nachrichten kommen je nach Zeit in verschiedenen Render-Blöcken an), dort zählt nur der Pegel
    try {
      for (let i = 0; i < NT(); i++) if (i !== DRUM_T) S.tracks[i].clips = S.tracks[i].clips.map(() => null);
      SYNQUENZER.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]); ensureAudio(); drumBufs(); Math.random = () => .3125; VV.cancel = false;
      const s = await vvRenderAudio({range: {a: 0, b: S.song.bars, sel: false}});
      out.drums = {bars: S.song.bars, n: s.ch[0].length, h: [fnv(s.ch[0]), fnv(s.ch[1])], rms: [rms(s.ch[0]), rms(s.ch[1])]};
    } catch (e) { out.drums = {err: String(e)}; } finally { Math.random = MR; }
    const ev = [[0, 'on', 48, .9], [0, 'on', 55, .8], [0, 'on', 64, .7], [1.0, 'off', 48], [1.0, 'off', 55], [1.0, 'off', 64], [1.1, 'on', 67, .8], [1.6, 'off', 67]];
    out.mk = [];
    const ids = []; for (const [id, f] of FACTORY_BY_ID) if (f && f.engine && f.engine !== 'drum') ids.push(id);
    const pick = []; const eng = new Set(); for (const id of ids) { const e = FACTORY_BY_ID.get(id).engine; if (!eng.has(e) || pick.length < 8) { eng.add(e); pick.push(id); } if (pick.length >= 16) break; }
    for (const id of pick) {
      try { seed(); const rec = FACTORY_BY_ID.get(id); const snd = typeof soundCopy === 'function' ? soundCopy(rec) : SQStore.soundFromFactory(rec);
        const x = await SYNQUENZER.mkRender(snd, ev, {sec: 2, seed: 1}); out.mk.push({id, engine: rec.engine, h: [fnv(x.l), fnv(x.r || x.l)], rms: rms(x.l)}); }
      catch (e) { out.mk.push({id, err: String(e).slice(0, 120)}); } finally { Math.random = MR; }
    }
    return out;
  });
  r.errs = errs; await p.close(); return r;
}
const q1 = await run(Q), a1 = await run(A), q2 = await run(Q);
await b.close();
const key = r => JSON.stringify({mk: r.mk});
const pegel = (x, y) => ['song', 'drums'].every(f => x[f] && y[f] && x[f].rms && y[f].rms && Math.abs(x[f].n - y[f].n) <= 0.02 * x[f].n && x[f].rms.every((v, k) => Math.abs(v - y[f].rms[k]) <= 0.01 * v));
const kontrolle = key(q1) === key(q2), gleich = key(q1) === key(a1), cl = q1.cl === a1.cl && q1.cl != null;
const laut = q1.song && q1.song.rms && q1.song.rms[0] > 1e-3 && q1.drums && q1.drums.rms && q1.drums.rms[0] > 1e-3 && q1.mk.length && q1.mk.every(m => m.rms > 1e-4);
console.log(JSON.stringify({quelle: q1, auslieferung: a1, quelle2: q2}, null, 1));
console.log((kontrolle ? 'OK ' : 'FEHLER ') + 'Kontrolle Quelle == Quelle (zwei Seiten)');
console.log((laut ? 'OK ' : 'FEHLER ') + 'Render nicht still (Song rms ' + (q1.song.rms || []).join('/') + ', ' + q1.mk.length + ' Klänge)');
console.log((gleich ? 'OK ' : 'FEHLER ') + 'Quelle == Auslieferung bitgleich: ' + q1.mk.length + ' Werksklänge (' + [...new Set(q1.mk.map(m => m.engine))].join('/') + ') über das App-Worklet (mkRender), je 2 Kanäle');
const pg = pegel(q1, a1) && pegel(q1, q2); console.log((pg ? 'OK ' : 'FEHLER ') + 'Song-Render (alle Spuren / nur Trommeln; schon Quelle gegen Quelle nicht bitgleich wiederholbar): Länge ±2 %, Pegel je Kanal ±1 % (' + [q1, a1, q2].map(r => (r.song.rms || []).join('/') + ' ' + ((r.drums && r.drums.rms) || []).join('/')).join(' | ') + ')');
console.log((cl ? 'OK ' : 'FEHLER ') + 'clCoreVer gleich (' + q1.cl + ' / ' + a1.cl + ')');
const fe = [...q1.errs, ...a1.errs, ...q2.errs]; console.log((fe.length ? 'FEHLER ' : 'OK ') + 'Konsole ohne Fehler ' + JSON.stringify(fe.slice(0, 5)));
console.log(kontrolle && laut && gleich && cl && pg && !fe.length ? 'ERGEBNIS bitgleich' : 'ERGEBNIS NICHT bitgleich');
