// IMP1 Schritt 3: Gesamt-Test Audio/MIDI-Import (Touch, echter Datei-Wähler).
// Die App rendert 3 Songs (92 4/4, 120 3/4, 120 6/8; Intro S R S R Bridge R Outro) + Melodie allein (96) → WAV; MP3/M4A/AIFF per ffmpeg.
// Geprüft: WAV/MP3 lesen, Tempo/Taktart/Teile, Gesang-allein fragt mit Vorschlag, Tempo vorweg wird genommen, In Szenen zerschneiden
// (Reihenfolge, Ausschnitt-Start ±10 ms, Song-Ablauf, Wiedergabe), ein ↶ für den ganzen Import, Loop-Klammern → Loop-Clip in der Matrix
// taktgenau, MIDI-Datei, Speichern/Laden + Container mit Audio (frischer Speicher), hochkant/quer ohne Überlappung, ✕ sichtbar.
// Aufruf: node imp1-test.mjs <index.html>   Fotos in ./fotos, Audio-Dateien in ./tmp-audio
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const file = path.resolve(process.argv[2]), here = path.dirname(new URL(import.meta.url).pathname);
const fotos = path.join(here, 'fotos'), aud = path.join(here, 'tmp-audio');
fs.mkdirSync(fotos, {recursive: true}); fs.mkdirSync(aud, {recursive: true});
let bad = 0; const notes = [];
const ok = (c, m, d) => { const s = (c ? 'OK ' : 'FEHLER ') + m + (d != null && d !== '' ? ' – ' + (typeof d === 'string' ? d : JSON.stringify(d)) : ''); if (!c) bad++; console.log(s); };
const info = m => { notes.push(m); console.log('INFO ' + m); };
const T0 = Date.now(), el = () => ((Date.now() - T0) / 1000).toFixed(0) + ' s';
const b = await chromium.launch();
const errs = [];
async function page(w, h) {
  const p = await b.newPage({viewport: {width: w, height: h}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1500);
  p.cdp = await p.context().newCDPSession(p);
  return p;
}
const tch = (p, type, x, y) => p.cdp.send('Input.dispatchTouchEvent', {type, touchPoints: type === 'touchEnd' ? [] : [{x, y, id: 1, radiusX: 4, radiusY: 4, force: 1}]});
async function tap(p, x, y) { await tch(p, 'touchStart', x, y); await p.waitForTimeout(50); await tch(p, 'touchEnd'); await p.waitForTimeout(220); }
const ctr = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height}; }, sel);
async function tapSel(p, sel) { const c = await ctr(p, sel); if (!c) return false; await tap(p, c.x, c.y); return true; }
const cur = p => p.evaluate(() => { const c = window.__imp1.ui.cur(); if (!c) return null; const G = c.st === 'fertig' ? window.__imp1.ui.geo() : null;
  return {st: c.st, err: c.err, bpm: c.bpm, ts: c.ts, t1: c.t1, known: c.known, loop: c.loop, dur: c.dur, org: G && G.org, takt: G && G.takt, nb: G && G.nb,
    parts: c.st === 'fertig' ? window.__imp1.ui.parts().map(x => ({name: x.name, A: x.A, B: x.B})) : [], quelle: c.r && c.r.quelle, frage: c.r && c.r.frage, alt: c.r && c.r.alt}; });
async function openSheet(p) {
  await p.evaluate(() => { closePop(); va1Sheet(); }); await p.waitForTimeout(300);
  await tapSel(p, 'button[data-va="midiin"]'); await p.waitForTimeout(300);
  return p.evaluate(() => !!(UI.pop && UI.pop.name === 'imp1'));
}
async function pick(p, name, mimeType, buffer) {
  await p.evaluate(() => { window.__pc = window.__imp1.ui.cur(); });
  const fc = p.waitForEvent('filechooser', {timeout: 5000});
  await tapSel(p, '.imp1 button[data-i="pick"]');
  const ch = await fc.catch(() => null); if (!ch) return null;
  await ch.setFiles({name, mimeType, buffer});
  let c = null; for (let k = 0; k < 240; k++) { await p.waitForTimeout(250); if (await p.evaluate(() => window.__imp1.ui.cur() === window.__pc)) continue; c = await cur(p); if (c && (c.st === 'fertig' || c.st === 'fehler')) break; }
  return c;
}
// Maße im offenen Blatt: ✕ sichtbar, Tasten ≥ 44, nichts außerhalb, keine Überlappung (Knöpfe, Felder, Wellenform, Zeilen)
const measure = p => p.evaluate(() => {
  const P = UI.pop.el, r = P.getBoundingClientRect(), vis = e => e.offsetParent && e.getClientRects().length;
  const bt = [...P.querySelectorAll('button')].filter(vis), small = bt.filter(b => { const q = b.getBoundingClientRect(); return q.height < 43.5 || q.width < 43.5; }).map(b => b.textContent.trim().slice(0, 16));
  const x = bt.find(b => /✕/.test(b.textContent)), xr = x && x.getBoundingClientRect();
  const items = [...P.querySelectorAll('button, input, canvas, .imp1st, .imp1bpm, .lbl')].filter(vis);
  const out = items.filter(e => { const q = e.getBoundingClientRect(); return q.right > innerWidth + .5 || q.left < -.5; }).length;
  const ov = []; for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) { const a = items[i], c = items[j]; if (a.contains(c) || c.contains(a)) continue;
    const A = a.getBoundingClientRect(), B = c.getBoundingClientRect(), w = Math.min(A.right, B.right) - Math.max(A.left, B.left), h = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
    if (w > 1 && h > 1) ov.push((a.textContent || a.tagName).trim().slice(0, 12) + '×' + (c.textContent || c.tagName).trim().slice(0, 12)); }
  return {pop: [r.left, r.top, r.width, r.height].map(Math.round), xVis: !!xr && xr.top >= 0 && xr.bottom <= innerHeight && xr.right <= innerWidth && xr.left >= 0, small: small.slice(0, 5), out, ov: ov.slice(0, 5), n: items.length};
});
async function layouts(p, tag, setup) {
  for (const [w, h] of [[428, 926], [926, 428], [926, 370]]) {
    await p.setViewportSize({width: w, height: h}); await p.waitForTimeout(250);
    if (setup) await setup(); else await p.evaluate(() => { closePop(); window.__imp1.ui.sheet(); });   // die App schließt Blätter beim Drehen (wie überall)
    await p.waitForTimeout(350);
    const m = await measure(p);
    ok(m.xVis && !m.small.length && !m.out && !m.ov.length && m.pop[0] >= 0 && m.pop[0] + m.pop[2] <= w, tag + ' ' + w + '×' + h + ': ✕ sichtbar, Tasten ≥ 44, nichts außerhalb, keine Überlappung', m);
    await p.screenshot({path: path.join(fotos, 'imp1t-' + tag.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '-' + w + 'x' + h + '.png')});
  }
  await p.setViewportSize({width: 428, height: 926}); await p.waitForTimeout(250);
  await p.evaluate(() => { closePop(); window.__imp1.ui.sheet(); }); await p.waitForTimeout(300);
}

/* ===== 1. Songs rendern (die App rendert eigene Songs) → WAV ===== */
const NAMES = ['Intro', 'Strophe 1', 'Refrain 1', 'Strophe 2', 'Refrain 2', 'Bridge', 'Refrain 3', 'Outro'];
const pr = await page(428, 926);
const songs = {};
for (const c of ['92 4/4', '120 3/4', '120 6/8', 'm96']) {
  const r = await pr.evaluate(async c => {
    const mel = c[0] === 'm', bpm = mel ? +c.slice(1) : +c.split(' ')[0], ts = mel ? '4/4' : c.split(' ')[1];
    setBpm(bpm); if (ts === '4/4') delete S.ts; else S.ts = tsNorm(ts); tkBump();
    const q = tsBeats(S.ts), six = ts === '6/8';
    for (const tr of S.tracks) for (let s = 0; s < tr.clips.length; s++) tr.clips[s] = null;
    const CH = {Am: [57, 60, 64], F: [53, 57, 60], C: [48, 52, 55], G: [55, 59, 62], Dm: [50, 53, 57], Em: [52, 55, 59]};
    const mk = (kind, len, notes) => { const cl = normClip({len, key: Object.assign({}, S.key, {src: 'auto'}), notes, ts: S.ts || undefined}, kind, S.key); if (S.ts) cl.ts = S.ts; return cl; };
    const pad = pg => pg.flatMap((ch, j) => CH[ch].map(n => ({t: j * q, d: q - .1, n: n + 12, v: .6})));
    const bass = pg => pg.flatMap((ch, j) => { const o = [], st = six ? 1.5 : 1; for (let h = 0; h < q - 1e-9; h += st) o.push({t: j * q + h, d: st * .8, n: CH[ch][0] - 12, v: .9}); return o; });
    const drums = (lv, hatOnly) => { const o = [], K = ts === '4/4' ? [0, 2] : [0], Sn = ts === '4/4' ? [1, 3] : ts === '3/4' ? [1, 2] : [1.5];
      if (!hatOnly) { for (const k of K) o.push({t: k, d: .1, n: 36, v: .95}); for (const k of Sn) o.push({t: k, d: .1, n: 38, v: .85 * lv}); }
      for (let h = 0; h < q - 1e-9; h += .5) o.push({t: h, d: .1, n: 42, v: .5 * lv}); return o; };
    const arp = pg => pg.flatMap((ch, j) => { const o = []; for (let h = 0; h < q - 1e-9; h += .5) o.push({t: j * q + h, d: .4, n: CH[ch][(h * 2) % 3] + 24, v: .7}); return o; });
    const V = ['Am', 'F', 'C', 'G'], C2 = ['F', 'G', 'C', 'Am'], BR = ['Dm', 'Em', 'F', 'G'];
    let sec;
    if (mel) {
      const pat = [[0, 1, 1.5, 2, 3], [0, .5, 1, 2, 2.5, 3.5], [0, 1, 2, 3], []], notes = [];
      for (let bar = 0; bar < 4; bar++) for (const h of pat[bar]) notes.push({t: bar * 4 + h, d: .35, n: 64 + ((bar * 3 + h * 2) % 7), v: .8});
      S.tracks[5].clips[0] = mk('synth', 4, notes); clipChanged(5, 0); sec = [[0, 16]];
    } else {
      const put = (t, s, kind, len, notes) => { S.tracks[t].clips[s] = mk(kind, len, notes); clipChanged(t, s); };
      put(2, 0, 'synth', 1, pad(['Am'])); put(4, 0, 'drum', 1, drums(.5, true));
      put(0, 1, 'synth', 4, bass(V)); put(2, 1, 'synth', 4, pad(V)); put(4, 1, 'drum', 1, drums(.7));
      put(0, 2, 'synth', 4, bass(C2)); put(2, 2, 'synth', 4, pad(C2)); put(4, 2, 'drum', 1, drums(1)); put(1, 2, 'synth', 4, arp(C2));
      put(0, 3, 'synth', 4, bass(BR)); put(2, 3, 'synth', 4, pad(BR)); put(4, 3, 'drum', 1, drums(.8));
      put(2, 4, 'synth', 2, pad(['Am', 'G']));
      sec = [[0, 4], [1, 8], [2, 8], [1, 8], [2, 8], [3, 8], [2, 8], [4, 4]];
    }
    let bar = 0; const lanes = S.tracks.map(() => []), truth = [];
    for (const [s, n] of sec) { truth.push(bar); S.tracks.forEach((tr, t) => lanes[t].push({bar, slot: tr.clips[s] ? s : -1})); bar += n; }
    S.song = normSong({bars: bar, lanes}, S.key); songChanged();
    const rr = await vvRenderAudio({range: {a: 0, b: bar}});
    for (const tr of S.tracks) for (let s = 0; s < tr.clips.length; s++) { tr.clips[s] = null; clipChanged(S.tracks.indexOf(tr), s); }
    S.song = null; delete S.ts; setBpm(120); tkBump(); UNDO.length = 0; REDO.length = 0; UI.dirty.all = true;
    const n = Math.floor(rr.ch[0].length / 2), sr = rr.sr / 2, ab = new ArrayBuffer(44 + n * 2), dv = new DataView(ab), w = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); dv.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true); dv.setUint32(24, sr, true); dv.setUint32(28, sr * 2, true); dv.setUint16(32, 2, true); dv.setUint16(34, 16, true); w(36, 'data'); dv.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) { const v = (rr.ch[0][2 * i] + rr.ch[1][2 * i]) / 2; dv.setInt16(44 + 2 * i, Math.max(-32768, Math.min(32767, Math.round(v * 32767))), true); }
    const u = new Uint8Array(ab); let s = ''; for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768));
    return {b64: btoa(s), lead: rr.lead || 0, dur: rr.dur, sr, truth, bpm, ts, barSec: tsBeats(tsNorm(ts)) * 60 / bpm};
  }, c);
  const buf = Buffer.from(r.b64, 'base64'); delete r.b64; r.wav = buf;
  const fn = path.join(aud, c.replace(/[^0-9a-z]/gi, '_') + '.wav'); fs.writeFileSync(fn, buf); r.fn = fn;
  songs[c] = r; info('Song ' + c + ' gerendert: ' + r.dur.toFixed(1) + ' s, ' + (buf.length / 1e6).toFixed(1) + ' MB (' + el() + ')');
}
await pr.close();
// MP3 / M4A / AIFF per ffmpeg (falls vorhanden)
const enc = (src, dst, args) => { try { execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', src, ...args, dst], {timeout: 120000}); return fs.readFileSync(dst); } catch (e) { return null; } };
const mp3 = enc(songs['92 4/4'].fn, path.join(aud, '92_4_4.mp3'), ['-codec:a', 'libmp3lame', '-b:a', '192k']);
const m4a = enc(songs['m96'].fn, path.join(aud, 'm96.m4a'), ['-codec:a', 'aac', '-b:a', '128k']);
const aif = enc(songs['m96'].fn, path.join(aud, 'm96.aif'), ['-f', 'aiff']);
if (!mp3) info('MP3: kein Kodierer im System – MP3-Teil übersprungen'); else info('MP3 kodiert (ffmpeg libmp3lame 192k): ' + (mp3.length / 1e6).toFixed(1) + ' MB');

/* ===== 2. Import über das Blatt: 3 Songs (WAV), dazu MP3 ===== */
const p = await page(428, 926);
ok(await openSheet(p), 'Export-Blatt → „Audio/MIDI importieren“ öffnet das Import-Blatt');
function checkSong(c, sg, tag) {
  if (!c || c.st !== 'fertig') { ok(false, tag + ': Analyse fertig', c); return false; }
  const det = c.parts.map(x => c.org + x.A * c.takt), tru = sg.truth.map(t => sg.lead + t * sg.barSec);
  const off = det.map((d, i) => tru[i] != null ? Math.round((d - tru[i]) * 1000) : null), names = c.parts.map(x => x.name);
  const okT = Math.abs(c.bpm - sg.bpm) < 1 && c.ts === sg.ts, okP = det.length === tru.length && off.every(v => v != null && Math.abs(v) < sg.barSec * 500), okN = names.join() === NAMES.join();
  ok(okT, tag + ': Tempo/Taktart', c.bpm + ' ' + c.ts + ' (soll ' + sg.bpm + ' ' + sg.ts + ')');
  ok(okP && okN, tag + ': Teile (Anzahl, Grenzen ±½ Takt, Namen)', names.map((n, i) => n + '@' + c.parts[i].A + ' ' + off[i] + 'ms').join(' | '));
  return okT && okP && okN;
}
for (const k of ['120 3/4', '120 6/8']) { const c = await pick(p, k.replace(/\W+/g, '-') + '.wav', 'audio/wav', songs[k].wav); checkSong(c, songs[k], 'WAV ' + k); }
if (mp3) {
  const c = await pick(p, 'demo-92.mp3', 'audio/mpeg', mp3);
  if (c && c.st === 'fehler') ok(false, 'MP3 lesen', c.err);
  else { checkSong(c, songs['92 4/4'], 'MP3 92 4/4'); info('MP3: Dauer ' + (c && c.dur.toFixed(3)) + ' s (WAV ' + songs['92 4/4'].dur.toFixed(3) + ' s), erste 1 bei ' + (c && c.t1) + ' s'); }
}
for (const [nm, mime, bf, lab] of [['m96.m4a', 'audio/mp4', m4a, 'M4A'], ['m96.aif', 'audio/aiff', aif, 'AIFF']]) {
  if (!bf) { info(lab + ': nicht kodiert – übersprungen'); continue; }
  const c = await pick(p, nm, mime, bf);
  if (c && c.st === 'fertig') ok(true, lab + ' gelesen und erkannt', c.bpm + ' ' + c.ts);
  else if (c && c.st === 'fehler') { ok(/MP3, WAV, M4A, AIFF, CAF oder MID/.test(c.err), lab + ': Testbrowser kann es nicht lesen → klare Meldung (iPhone-Safari liest ' + lab + ')', c.err); info(lab + ': im Test-Chromium nicht dekodierbar (Safari kann es) – Meldung geprüft'); }
  else ok(false, lab + ': Antwort', c);
}
const W = songs['92 4/4'];
let c = await pick(p, 'demo-92.wav', 'audio/wav', W.wav);
checkSong(c, W, 'WAV 92 4/4');
await p.screenshot({path: path.join(fotos, 'imp1t-1-erkannt-hochkant.png')});
await layouts(p, 'Blatt Song', null);
console.log('INFO Abschnitt 2 fertig (' + el() + ')');

/* ===== 3. In Szenen zerschneiden: Reihenfolge, Ausschnitte ±10 ms, Song-Ablauf, Wiedergabe ===== */
const before = await p.evaluate(() => ({st: sx14State(), bpm: S.bpm, ts: S.ts || '4/4', nt: NT(), undo: UNDO.length}));
ok(await tapSel(p, '.imp1 button[data-i="scenes"]'), 'Knopf „In Szenen zerschneiden“ im Blatt'); await p.waitForTimeout(300);
const sc = await p.evaluate(async () => {
  const c = window.__imp1.ui.cur(), G = window.__imp1.ui.geo(), P = window.__imp1.ui.parts(), o = S.tracks.findIndex(t => t.orig), tr = S.tracks[o];
  const lane = S.song.lanes[o], clips = tr.clips.map(x => x && x.audio ? {len: x.len, ts: x.ts || '4/4', in: x.audio.in, out: x.audio.out, take: x.audio.take} : null);
  const take = clips[0] && clips[0].take, pcm = take ? await tkPcm(take) : null, m = S.takes[take], sr = m && m.sr;
  // Bit-Probe: Take an „in“ = Datei an org + in (der Ausschnitt ist wirklich die Stelle in der Datei)
  const probe = clips.filter(Boolean).map(x => { const a = Math.round(x.in * sr), f = Math.round((G.org + x.in) * c.sr); let d = 0; for (let k = 0; k < 2000; k++) d = Math.max(d, Math.abs(pcm[a + k] - c.pcm[f + k])); return d; });
  return {o, name: tr.name, clips, lane, P: P.map(x => ({name: x.name, A: x.A, B: x.B})), org: G.org, takt: G.takt, nb: G.nb, bpm: S.bpm, ts: S.ts || '4/4', marks: (S.song.marks || []).map(x => x.name + '@' + x.a), bars: S.song.bars, undo: UNDO.length, label: UNDO[UNDO.length - 1].label, probe, imp: m && m.imp, sr};
});
ok(sc.o >= 0 && sc.name === 'Original', 'Spur „Original“ angelegt', sc.o + ' ' + sc.name);
const used = sc.clips.map((x, i) => x ? i : -1).filter(i => i >= 0);
ok(used.length === 8 && used.join() === '0,1,2,3,4,5,6,7', 'je Teil eine Szene, in Reihenfolge (Szene 1–8)', used.join());
{ const st = sc.P.map((x, i) => { const cl = sc.clips[i]; return cl ? Math.round((sc.org + cl.in - (W.lead + W.truth[i] * W.barSec)) * 1e4) / 10 : null; });
  ok(st.every(v => v != null && Math.abs(v) <= 10), 'Ausschnitt-Start je Szene = Teil-Anfang im Audio ±10 ms', st.map((v, i) => NAMES[i] + ' ' + v + ' ms').join(' | '));
  const ln = sc.P.map((x, i) => { const cl = sc.clips[i]; return cl && cl.len === x.B - x.A && Math.abs(cl.out - cl.in - (x.B - x.A) * sc.takt) < .002; });
  ok(ln.every(Boolean), 'Ausschnitt-Länge je Szene = Takte des Teils', sc.P.map((x, i) => (sc.clips[i] && sc.clips[i].len) + '/' + (x.B - x.A)).join(' '));
  ok(sc.probe.every(d => d === 0), 'Ausschnitt-Inhalt = Datei an derselben Stelle (Proben bitgleich)', sc.probe.join(','));
}
ok(sc.lane.length === 9 && sc.lane.slice(0, 8).every((e, i) => e.slot === i && e.bar === sc.P[i].A) && sc.lane[8].slot === -1 && sc.lane[8].bar === sc.nb, 'Song-Ablauf: Szene 1–8 an den Teil-Takten, dann Ende', sc.lane.map(e => e.bar + ':' + e.slot).join(' '));
ok(sc.marks.join(' ') === sc.P.map(x => x.name + '@' + x.A).join(' '), 'Teil-Namen als Song-Marken', sc.marks.join(' '));
ok(sc.bpm === 92 && sc.ts === '4/4' && sc.imp && sc.imp.bpm === 92, 'Projekt-Tempo/Taktart = erkannt (92, 4/4), Raster am Take', sc.bpm + ' ' + sc.ts + ' ' + JSON.stringify(sc.imp));
ok(sc.undo === before.undo + 1 && sc.label === 'In Szenen zerschnitten', 'genau ein ↶-Schritt', sc.label);
// Song-Ablauf spielt den richtigen Ausschnitt (ab Teil 3 gestartet)
const pl = await p.evaluate(async A => {
  const o = S.tracks.findIndex(t => t.orig), L = []; const f0 = tkStartSrc; window.tkStartSrc = x => { if (x.i === o) L.push({when: x.when, off: x.off, end: x.end}); return f0(x); };
  closePop(); const n0 = AU.ctx ? AU.ctx.currentTime : 0; songPlayStart(A); await new Promise(r => setTimeout(r, 1500)); stop(); window.tkStartSrc = f0;
  return {L, n0, in2: S.tracks[o].clips[2].audio.in};
}, sc.P[2].A);
ok(pl.L.length >= 1 && Math.abs(pl.L[0].off - pl.in2) < .002 && pl.L[0].when - pl.n0 < .5, 'Song ab Teil 3: die Spur spielt sofort den Ausschnitt von Szene 3', {when_ab_start: pl.L[0] && +(pl.L[0].when - pl.n0).toFixed(3), off: pl.L[0] && pl.L[0].off, in: pl.in2});
await p.screenshot({path: path.join(fotos, 'imp1t-2-szenen-hochkant.png')});

/* ===== 4. ↶ nimmt den ganzen Import zurück, ↷ bringt ihn wieder ===== */
const un = await p.evaluate(b0 => { undo(); const a = {same: sx14State() === b0.st, bpm: S.bpm, ts: S.ts || '4/4', orig: S.tracks.some(t => t.orig), nt: NT(), song: !!(S.song && S.song.bars)}; redo(); const r = {orig: S.tracks.some(t => t.orig), bpm: S.bpm}; return {a, r}; }, before);
ok(un.a.same && un.a.bpm === before.bpm && un.a.ts === before.ts && !un.a.orig && un.a.nt === before.nt, '↶: Stand wie vor dem Import (Spuren, Szenen, Song, Tempo ' + before.bpm + ')', un.a);
ok(un.r.orig && un.r.bpm === 92, '↷: Import wieder da', un.r);

/* ===== 5. Loop-Klammern → Loop-Clip läuft in der Matrix taktgenau ===== */
await p.evaluate(() => { closePop(); window.__imp1.ui.sheet(); }); await p.waitForTimeout(400);
{ const cv = await ctr(p, '.imp1 canvas.imp1cv'), g = await p.evaluate(() => window.__imp1.ui.geo()), dur = (await cur(p)).dur;
  const xb = bar => cv.x - cv.w / 2 + (g.org + bar * g.takt) / dur * cv.w, y = cv.y + cv.h / 2 - 10, x0 = xb(12.5), x1 = xb(14.2);
  await tch(p, 'touchStart', x0, y); for (let k = 1; k <= 8; k++) { await tch(p, 'touchMove', x0 + (x1 - x0) * k / 8, y); await p.waitForTimeout(16); } await tch(p, 'touchEnd'); await p.waitForTimeout(250); }
c = await cur(p); ok(c.loop && c.loop[0] === 12 && c.loop[1] === 14, 'Loop-Klammern per Finger auf Takt 13–14 gezogen', c.loop);
await p.screenshot({path: path.join(fotos, 'imp1t-3-loop-hochkant.png')});
const u0 = await p.evaluate(() => UNDO.length);
await tapSel(p, '.imp1 button[data-i="loop"]');
const lp = await p.evaluate(() => { const l = window.__imp1.ui.last(), x = S.tracks[l.track].clips[l.scene], e = S.song.lanes[l.track][2], ow = e && e.own && S.song.own[e.own];
  return {l, len: x.len, in: x.audio.in, out: x.audio.out, undo: UNDO.length, label: UNDO[UNDO.length - 1].label, songTeil3: ow ? {len: ow.len, in: ow.audio.in, slot: e.slot} : null}; });
ok(lp.l.kind === 'loop' && lp.l.scene === 2 && lp.len === 2 && Math.abs(lp.in - 12 * c.takt) < .001 && Math.abs(lp.out - lp.in - 2 * c.takt) < .001 && lp.undo === u0 + 1,
  'Als Loop in die Matrix (alle 8 Szenen belegt): Szene 3 = Refrain 1 bekommt den Loop Takt 13–14, ein ↶', lp);
ok(lp.songTeil3 && lp.songTeil3.len === 8 && Math.abs(lp.songTeil3.in - sc.clips[2].in) < 1e-6, 'der Song behält den ganzen Refrain 1 (eigener Song-Clip)', lp.songTeil3);
{ const r = await p.evaluate(o => { undo(); const a = {len: S.tracks[o].clips[2].len, own: !!S.song.lanes[o][2].own}; redo(); const b2 = {len: S.tracks[o].clips[2].len, own: !!S.song.lanes[o][2].own}; return {a, b: b2}; }, lp.l.track);
  ok(r.a.len === 8 && !r.a.own && r.b.len === 2 && r.b.own, '↶ nimmt den Loop ganz zurück (Szene 3 wieder der ganze Refrain), ↷ bringt ihn', r); }
const mx = await p.evaluate(async ({o, s}) => {
  const L = []; const f0 = tkStartSrc; window.tkStartSrc = x => { if (x.i === o) L.push({when: x.when, off: x.off, end: x.end}); return f0(x); };
  closePop(); launchScene(s); await new Promise(r => setTimeout(r, 7000));
  const z = b2t(0), sp = spb(), cs = R.cstart[o], slot = R.slot[o], bb = clipBarB(S.tracks[o].clips[s]); stop(); window.tkStartSrc = f0;
  return {L, z, sp, cs, slot, bb};
}, {o: lp.l.track, s: lp.l.scene});
{ const bar = mx.bb * mx.sp, per = 2 * bar, ws = mx.L.map(x => x.when), d = ws.slice(1).map((w, i) => w - ws[i]), ph = ws.map(w => ((w - mx.z) / bar) - Math.round((w - mx.z) / bar));
  ok(mx.slot === lp.l.scene && ws.length >= 2 && d.every(v => Math.abs(v - per) < .002) && ph.every(v => Math.abs(v * bar) < .002) && mx.L.every(x => Math.abs(x.off - lp.in) < .001) && mx.cs % mx.bb === 0,
    'Loop-Clip läuft in der Matrix: Start auf dem Taktstrich, Wiederholung alle 2 Takte (±2 ms), immer ab Takt 13', {n: ws.length, abstand: d.map(v => +(v * 1000).toFixed(1)), soll: +(per * 1000).toFixed(1), phase_ms: ph.map(v => +(v * bar * 1000).toFixed(2)), off: mx.L.map(x => +x.off.toFixed(3))}); }

/* ===== 6. Speichern/Laden + Container mit Audio (frischer Speicher) ===== */
const sv = await p.evaluate(async () => {
  const o = S.tracks.findIndex(t => t.orig), take = S.tracks[o].clips[0].audio.take, fo = SQStore.buildProjectFile(S, null, VERSION);
  const q = normalizeProject(projFromFile(JSON.parse(JSON.stringify(fo)))), qo = q.tracks.findIndex(t => t.orig);
  const D = window.SYNQUENZER, h = await D.tkPcmHash(take), box = await D.va1BoxB64();
  return {o, take, h, box, rt: {o: qo, clips: qo >= 0 ? q.tracks[qo].clips.filter(x => x && x.audio).length : 0, imp: !!(q.takes && q.takes[take] && q.takes[take].imp), lane: qo >= 0 ? q.song.lanes[qo].length : 0, bpm: q.bpm}};
});
ok(sv.rt.o === sv.o && sv.rt.clips === 8 && sv.rt.imp && sv.rt.lane === 9 && sv.rt.bpm === 92, 'Speichern/Laden: Spur „Original“, 8 Szenen (eine mit Loop), Take mit Raster, Song-Ablauf', sv.rt);
const p2 = await page(428, 926);
const ct = await p2.evaluate(async ({b64, take, h}) => {
  const D = window.SYNQUENZER, r = await D.va1BoxImport(b64); await new Promise(x => setTimeout(x, 2500));
  const loaded = await D.tkLoadAll(), h2 = await D.tkPcmHash(take), o = S.tracks.findIndex(t => t.orig);
  const L = []; const f0 = tkStartSrc; window.tkStartSrc = x => { if (x.i === o) L.push({off: x.off, when: x.when}); return f0(x); };
  closePop(); launchScene(1); await new Promise(x => setTimeout(x, 1500)); const z = b2t(R.cstart[o]); stop(); window.tkStartSrc = f0;
  return {ok: r.ok, note: r.note, same: h2 === h, loaded: loaded.includes(take), o, clips: o >= 0 ? S.tracks[o].clips.filter(x => x && x.audio).length : 0, bpm: S.bpm, plays: L.length, in1: o >= 0 && S.tracks[o].clips[1].audio.in, off: L[0] && L[0].off, lag: L[0] && L[0].when - z};
}, {b64: sv.box, take: sv.take, h: sv.h});
ok(ct.ok && ct.same && ct.loaded && ct.clips === 8 && ct.bpm === 92, 'Container (ZIP Projekt + Audio) in frischem Speicher: Audio bitgleich, Spur und Clips da', {ok: ct.ok, same: ct.same, loaded: ct.loaded, clips: ct.clips, bpm: ct.bpm, note: ct.note});
ok(ct.plays >= 1 && Math.abs(ct.off - ct.in1 - ct.lag) < .002, 'nach dem Öffnen spielt Szene 2 den Ausschnitt der Strophe im Takt (Einstieg an der laufenden Stelle)', {plays: ct.plays, off: ct.off, in: ct.in1, einstieg_ms: +(ct.lag * 1000).toFixed(1)});
await p2.close();
console.log('INFO Abschnitt 3–6 fertig (' + el() + ')');
await p.close();

/* ===== 7. Gesang allein: fragt mit Vorschlag; Tempo vorweg wird genommen ===== */
const g = await page(428, 926);
ok(await openSheet(g), 'Import-Blatt (zweites Projekt)');
const M = songs['m96'];
c = await pick(g, 'gesang-96.wav', 'audio/wav', M.wav);
const q1 = await g.evaluate(() => { const P = UI.pop.el, w = [...P.querySelectorAll('.imp1st.warn')].map(e => e.textContent), bt = [...P.querySelectorAll('button[data-i="setbpm"]')].map(b => b.textContent.trim()); return {w, bt}; });
ok(c && c.st === 'fertig' && c.quelle === 'gesang' && c.frage && Math.round(c.bpm) === 96, 'Gesang allein: Tempo aus Silben-Einsätzen 96, Quelle Gesang', c && {bpm: c.bpm, quelle: c.quelle, frage: c.frage, alt: c.alt});
ok(q1.w.some(t => /^Aus Gesang geschätzt – 96 oder 48 \/ 192\?$/.test(t)) && q1.bt.join() === '96 BPM,48 BPM,192 BPM', 'Blatt fragt ehrlich mit Vorschlag', q1);
await g.screenshot({path: path.join(fotos, 'imp1t-4-gesang-frage-hochkant.png')});
await layouts(g, 'Blatt Gesang-Frage', null);
await tapSel(g, '.imp1 button[data-i="setbpm"][data-v="48"]'); c = await cur(g);
ok(c.bpm === 48, 'Vorschlag 48 angetippt → Raster 48 BPM', c.bpm);
// Tempo vorweg: Feld antippen, 96 tippen, dann Datei wählen
{ const f = await ctr(g, '.imp1 input.imp1bpmin'); await tap(g, f.x, f.y); await g.keyboard.press('Control+A'); await g.keyboard.type('96'); await g.keyboard.press('Tab'); await g.waitForTimeout(150); }
c = await pick(g, 'gesang-96.wav', 'audio/wav', M.wav);
const q2 = await g.evaluate(() => ({w: [...UI.pop.el.querySelectorAll('.imp1st.warn')].length, kn: UI.pop.el.querySelector('.imp1bpmin').value}));
ok(c && c.st === 'fertig' && c.known === 96 && c.bpm === 96 && !c.frage && !q2.w && q2.kn === '96', 'Tempo vorweg eingetragen (96) wird genommen, keine Rückfrage, Feld bleibt', c && {known: c.known, bpm: c.bpm, frage: c.frage, warn: q2.w, feld: q2.kn});
{ const f = await ctr(g, '.imp1 input.imp1bpmin'); await tap(g, f.x, f.y); await g.keyboard.press('Control+A'); await g.keyboard.type('46'); await g.keyboard.press('Tab'); await g.waitForTimeout(150); }
await tapSel(g, '.imp1 button[data-i="again"]'); for (let k = 0; k < 80; k++) { await g.waitForTimeout(200); c = await cur(g); if (c.st === 'fertig') break; }
ok(c.st === 'fertig' && c.bpm === 46 && c.known === 46, '„Erkennen“ mit neuem Wert (46) nimmt ihn', {bpm: c.bpm, known: c.known});
await g.close();

/* ===== 8. MIDI-Datei über denselben Wähler ===== */
const q = await page(428, 926);
const mid = (() => { const ev = [0, 0xFF, 0x51, 3, 0x09, 0x27, 0xC0, 0, 0xFF, 0x58, 4, 3, 2, 24, 8]; for (let k = 0; k < 6; k++) ev.push(0, 0x90, 60 + k, 100, 0x83, 0x60, 0x80, 60 + k, 0); ev.push(0, 0xFF, 0x2F, 0);
  const hd = [0x4D, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, 1, 0xE0], tk = [0x4D, 0x54, 0x72, 0x6B, 0, 0, 0, ev.length]; return Buffer.from(hd.concat(tk, ev)); })();
const qb = await q.evaluate(() => { for (const tr of S.tracks) for (let s = 0; s < tr.clips.length; s++) tr.clips[s] = null; S.song = null; UNDO.length = 0; return {bpm: S.bpm, ts: S.ts || '4/4'}; });
ok(await openSheet(q), 'Import-Blatt für MIDI');
{ const fc = q.waitForEvent('filechooser', {timeout: 5000}); await tapSel(q, '.imp1 button[data-i="pick"]'); const ch = await fc.catch(() => null); if (ch) await ch.setFiles({name: 'test.mid', mimeType: 'audio/midi', buffer: mid}); await q.waitForTimeout(800); }
const mr = await q.evaluate(() => { const n = S.tracks.reduce((a, t) => a + t.clips.filter(x => x && x.notes && x.notes.length).length, 0), notes = S.tracks.reduce((a, t) => a + t.clips.reduce((b2, x) => b2 + (x && x.notes ? x.notes.length : 0), 0), 0);
  const r = {clips: n, notes, bpm: S.bpm, ts: S.ts || '4/4', undo: UNDO.length, label: UNDO.length && UNDO[UNDO.length - 1].label}; undo(); r.after = {bpm: S.bpm, ts: S.ts || '4/4', clips: S.tracks.reduce((a, t) => a + t.clips.filter(Boolean).length, 0)}; return r; });
ok(mr.clips >= 1 && mr.notes === 6 && mr.bpm === 100 && mr.ts === '3/4' && mr.undo === 1 && mr.label === 'MIDI importiert', 'MIDI über den Wähler: 6 Noten, Tempo 100 und 3/4 aus der Datei, ein ↶', mr);
ok(mr.after.bpm === qb.bpm && mr.after.ts === qb.ts && mr.after.clips === 0, '↶ nimmt den MIDI-Import ganz zurück (Tempo, Taktart, Clips)', mr.after);
await q.close();

ok(!errs.length, 'keine Fehler in der Konsole', errs.slice(0, 3).join(' | '));
await b.close();
fs.writeFileSync(path.join(here, 'imp1-test.info.txt'), notes.join('\n') + '\n');
console.log((bad ? 'FEHLER ' + bad : 'ALLE OK') + ' (' + el() + ')');
