// IMP1 Schritt 2: Import-Blatt per Touch. Die App rendert einen Demo-Song (92 BPM 4/4, Intro/S/R/S/R/Outro) → WAV → Datei-Wähler
// (Tipp „Datei wählen“) → Analyse → Blatt (Wellenform, Raster, Teile) → Tempo ±, Taktart, Loop-Klammern ziehen → Ziele + ↶ → quer → MIDI.
// Aufruf: node imp-test.mjs <index.html>   Fotos in ./fotos
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
import fs from 'node:fs';
const file = path.resolve(process.argv[2]), fotos = path.join(path.dirname(new URL(import.meta.url).pathname), 'fotos');
fs.mkdirSync(fotos, {recursive: true});
let bad = 0;
const ok = (c, m, d) => { if (c) console.log('OK ' + m + (d ? ' – ' + d : '')); else { bad++; console.log('FEHLER ' + m + (d ? ' – ' + d : '')); } };
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
const cur = p => p.evaluate(() => { const c = window.__imp1.ui.cur(); return c ? {st: c.st, bpm: c.bpm, ts: c.ts, t1: c.t1, loop: c.loop, pt: (c.parts || []).map(x => x.ta.toFixed(2)).join(), parts: (c.parts ? window.__imp1.ui.parts() : []).map(x => x.name + '@' + x.A + '-' + x.B), quelle: c.r && c.r.quelle} : null; });
// 1 Demo-Song rendern → WAV (mono 24 kHz)
const p = await page(428, 926);
const wav = await p.evaluate(async () => {
  setBpm(92); delete S.ts; tkBump();
  for (const tr of S.tracks) for (let s = 0; s < tr.clips.length; s++) tr.clips[s] = null;
  const CH = {Am: [57, 60, 64], F: [53, 57, 60], C: [48, 52, 55], G: [55, 59, 62], Dm: [50, 53, 57], Em: [52, 55, 59]}, q = 4;
  const mk = (kind, len, notes) => normClip({len, key: Object.assign({}, S.key, {src: 'auto'}), notes}, kind, S.key);
  const pad = pr => pr.flatMap((ch, j) => CH[ch].map(n => ({t: j * q, d: q - .1, n: n + 12, v: .6})));
  const bass = pr => pr.flatMap((ch, j) => [0, 1, 2, 3].map(h => ({t: j * q + h, d: .8, n: CH[ch][0] - 12, v: .9})));
  const drums = (lv, hat) => { const o = []; if (!hat) { o.push({t: 0, d: .1, n: 36, v: .95}, {t: 2, d: .1, n: 36, v: .95}, {t: 1, d: .1, n: 38, v: .85 * lv}, {t: 3, d: .1, n: 38, v: .85 * lv}); } for (let h = 0; h < 4; h += .5) o.push({t: h, d: .1, n: 42, v: .5 * lv}); return o; };
  const arp = pr => pr.flatMap((ch, j) => { const o = []; for (let h = 0; h < 4; h += .5) o.push({t: j * q + h, d: .4, n: CH[ch][(h * 2) % 3] + 24, v: .7}); return o; });
  const put = (t, s, kind, len, notes) => { S.tracks[t].clips[s] = mk(kind, len, notes); clipChanged(t, s); };
  const V = ['Am', 'F', 'C', 'G'], C2 = ['F', 'G', 'C', 'Am'];
  put(2, 0, 'synth', 1, pad(['Am'])); put(4, 0, 'drum', 1, drums(.5, true));
  put(0, 1, 'synth', 4, bass(V)); put(2, 1, 'synth', 4, pad(V)); put(4, 1, 'drum', 1, drums(.7));
  put(0, 2, 'synth', 4, bass(C2)); put(2, 2, 'synth', 4, pad(C2)); put(4, 2, 'drum', 1, drums(1)); put(1, 2, 'synth', 4, arp(C2));
  put(2, 4, 'synth', 2, pad(['Am', 'G']));
  const sec = [[0, 4], [1, 8], [2, 8], [1, 8], [2, 8], [4, 4]];
  let bar = 0; const lanes = S.tracks.map(() => []);
  for (const [s, n] of sec) { S.tracks.forEach((tr, t) => lanes[t].push({bar, slot: tr.clips[s] ? s : -1})); bar += n; }
  S.song = normSong({bars: bar, lanes}, S.key); songChanged();
  const rr = await vvRenderAudio({range: {a: 0, b: bar}});
  // danach leeres Projekt (wie ein neues Projekt vor dem Import)
  for (const tr of S.tracks) for (let s = 0; s < tr.clips.length; s++) { tr.clips[s] = null; clipChanged(S.tracks.indexOf(tr), s); }
  S.song = null; setBpm(120); UNDO.length = 0; REDO.length = 0; UI.dirty.all = true;
  const n = Math.floor(rr.ch[0].length / 2), sr = rr.sr / 2, ab = new ArrayBuffer(44 + n * 2), dv = new DataView(ab), w = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); dv.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true); dv.setUint32(24, sr, true); dv.setUint32(28, sr * 2, true); dv.setUint16(32, 2, true); dv.setUint16(34, 16, true); w(36, 'data'); dv.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) { const v = (rr.ch[0][2 * i] + rr.ch[1][2 * i]) / 2; dv.setInt16(44 + 2 * i, Math.max(-32768, Math.min(32767, Math.round(v * 32767))), true); }
  const u = new Uint8Array(ab); let s = ''; for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768));
  return {b64: btoa(s), lead: rr.lead || 0, dur: rr.dur};
});
const wavBuf = Buffer.from(wav.b64, 'base64');
console.log('INFO Demo-WAV ' + (wavBuf.length / 1e6).toFixed(1) + ' MB, ' + wav.dur.toFixed(1) + ' s');
// 2 Blatt öffnen (Export → Audio/MIDI importieren), Datei wählen per Tipp
await p.evaluate(() => va1Sheet());
await p.waitForTimeout(300);
ok(await tapSel(p, 'button[data-va="midiin"]'), 'Export-Blatt: Knopf „Audio/MIDI importieren“');
await p.waitForTimeout(300);
ok(await p.evaluate(() => !!(UI.pop && UI.pop.name === 'imp1')), 'Import-Blatt offen');
await p.screenshot({path: path.join(fotos, 'imp1-1-leer-hochkant.png')});
const fc = p.waitForEvent('filechooser', {timeout: 5000});
await tapSel(p, '.imp1 button[data-i="pick"]');
const ch = await fc.catch(() => null);
ok(!!ch, 'Datei-Wähler öffnet sich beim Tipp');
if (ch) await ch.setFiles({name: 'demo-92.wav', mimeType: 'audio/wav', buffer: wavBuf});
let c = null; for (let k = 0; k < 120; k++) { await p.waitForTimeout(250); c = await cur(p); if (c && (c.st === 'fertig' || c.st === 'fehler')) break; }
ok(c && c.st === 'fertig', 'Analyse fertig', JSON.stringify(c));
ok(c && Math.abs(c.bpm - 92) < 1 && c.ts === '4/4', 'Tempo/Taktart erkannt', c && c.bpm + ' ' + c.ts);
ok(c && c.parts.length >= 4 && c.parts.length <= 7, 'Teile erkannt', c && c.parts.join(' '));
await p.waitForTimeout(200);
await p.screenshot({path: path.join(fotos, 'imp1-2-erkannt-hochkant.png')});
// 3 Touch: Tempo ±, Taktart, Loop-Klammern ziehen
await tapSel(p, '.imp1 button[data-i="bpm+"]'); c = await cur(p); ok(c.bpm === 93, 'Tempo + → 93', c.bpm);
await tapSel(p, '.imp1 button[data-i="bpm-"]'); c = await cur(p); ok(c.bpm === 92, 'Tempo − → 92', c.bpm);
await tapSel(p, '.imp1 button[data-i="ts"][data-v="3/4"]'); c = await cur(p); ok(c.ts === '3/4', 'Taktart 3/4');
await tapSel(p, '.imp1 button[data-i="ts"][data-v="4/4"]'); c = await cur(p); ok(c.ts === '4/4' && c.parts.length >= 4, 'Taktart zurück 4/4', c.parts.join(' '));
{ const n1 = c.parts.length; await tapSel(p, '.imp1 button[data-i="part"][data-k="1"]'); await tapSel(p, '.imp1 button[data-i="split"]'); c = await cur(p); ok(c.parts.length === n1 + 1, 'Teil teilen (Takt-Raster)', c.parts.join(' '));
  await p.fill('.imp1 input.imp1nm', 'Strophe 1'); await p.dispatchEvent('.imp1 input.imp1nm', 'change'); await p.waitForTimeout(150); c = await cur(p); ok(c.parts[1].startsWith('Strophe 1@'), 'Teil umbenennen', c.parts.join(' '));
  await tapSel(p, '.imp1 button[data-i="part"][data-k="1"]'); await tapSel(p, '.imp1 button[data-i="merge"]'); c = await cur(p); ok(c.parts.length === n1, 'Teile zusammenlegen', c.parts.join(' '));
  await tapSel(p, '.imp1 button[data-i="part"][data-k="1"]'); await tapSel(p, '.imp1 button[data-i="split"]'); c = await cur(p); }
const cv = await ctr(p, '.imp1 canvas.imp1cv');
const g = await p.evaluate(() => window.__imp1.ui.geo());
const xb = bar => cv.x - cv.w / 2 + (g.org + bar * g.takt) / wav.dur * cv.w;
{ const y = cv.y + cv.h / 2 - 10, x0 = xb(12.5), x1 = xb(20.2); await tch(p, 'touchStart', x0, y); for (let k = 1; k <= 8; k++) { await tch(p, 'touchMove', x0 + (x1 - x0) * k / 8, y); await p.waitForTimeout(16); } await tch(p, 'touchEnd'); await p.waitForTimeout(250); }
c = await cur(p); ok(c.loop && c.loop[0] === 12 && c.loop[1] === 20, 'Loop-Klammern auf Takt-Raster gezogen', JSON.stringify(c.loop));
await p.screenshot({path: path.join(fotos, 'imp1-3-loop-hochkant.png')});
{ const cv2 = await ctr(p, '.imp1 canvas.imp1cv'), x0 = cv2.x - cv2.w / 2 + c.t1 / wav.dur * cv2.w + 1, y = cv2.y - cv2.h / 2 + 26, dx = 8 * 0.5 * 60 / 92 / wav.dur * cv2.w;
  await tch(p, 'touchStart', x0, y); for (let k = 1; k <= 6; k++) { await tch(p, 'touchMove', x0 + dx * k / 6, y); await p.waitForTimeout(16); } await tch(p, 'touchEnd'); await p.waitForTimeout(250);
  const c2 = await cur(p); ok(Math.abs(c2.t1 - c.t1 - .326) < .03 && c2.pt === c.pt, '„1“-Marke fein gezogen (½ Schlag, Teile bleiben an ihrer Zeit)', c.t1 + ' → ' + c2.t1);
  await p.evaluate(t => { window.__imp1.ui.cur().t1 = t; }, c.t1); }
{ const tb = await ctr(p, '.imp1 button[data-i="tap"]'), T0 = Date.now(); for (let k = 0; k < 5; k++) { while (Date.now() < T0 + k * 600) await new Promise(r => setTimeout(r, 5)); await tch(p, 'touchStart', tb.x, tb.y); await p.waitForTimeout(40); await tch(p, 'touchEnd'); }
  await p.waitForTimeout(250);
  const c3 = await cur(p); ok(Math.abs(c3.bpm - 100) <= 6, 'Tippen-Tempo ≈ 100', c3.bpm); await p.evaluate(() => window.__imp1.ui.regrid(92)); c = await cur(p); ok(c.bpm === 92 && c.parts[2] === 'Strophe 1 b@12-20' && c.pt === c3.pt, 'Tempo zurück 92, Teile unverändert', c.parts.join(' ')); }
// 4 In Szenen zerschneiden
const n0 = await p.evaluate(() => UNDO.length);
await tapSel(p, '.imp1 button[data-i="scenes"]');
let s = await p.evaluate(() => { const o = S.tracks.findIndex(t => t.orig); const tr = S.tracks[o]; return {o, name: tr && tr.name, nt: NT(), clips: tr ? tr.clips.map(c => c && c.audio ? c.len + ':' + c.audio.in.toFixed(2) : null) : [], lane: o >= 0 ? S.song.lanes[o] : null, bars: S.song && S.song.bars, bpm: S.bpm, marks: (S.song.marks || []).map(m => m.name + '@' + m.a), undo: UNDO.length, label: UNDO.length && UNDO[UNDO.length - 1].label, takes: Object.keys(S.takes || {}).length}; });
ok(s.o >= 6 && s.name === 'Original', 'Spur „Original“ angelegt', JSON.stringify(s));
ok(s.clips.filter(Boolean).length === c.parts.length && s.lane.length === c.parts.length + 1 && s.bpm === 92, 'je Teil eine Szene + Song-Ablauf', s.clips.join(' ') + ' / ' + JSON.stringify(s.lane));
ok(s.marks.length === c.parts.length, 'Teil-Namen als Marken im Song', s.marks.join(' '));
ok(s.undo === n0 + 1, 'ein ↶ für den Import', s.label);
// Wiedergabe: die Spur spielt das Audio (Take-Wiedergabe)
const pl = await p.evaluate(async () => { const o = S.tracks.findIndex(t => t.orig); const st0 = TK.starts; songPlayStart(0); await new Promise(r => setTimeout(r, 2500)); const n = TK.starts - st0, live = TK.src.filter(r => r.i === o).length; stop(); return {n, live}; });
ok(pl.n > 0, 'Song spielt das Original-Audio', JSON.stringify(pl));
// ↶ / ↷
const u = await p.evaluate(() => { undo(); const a = {nt: NT(), orig: S.tracks.some(t => t.orig), bars: S.song ? S.song.bars : 0}; redo(); const b2 = {nt: NT(), orig: S.tracks.some(t => t.orig), bars: S.song ? S.song.bars : 0}; return {a, b: b2}; });
ok(!u.a.orig && u.b.orig, '↶ nimmt den ganzen Import zurück, ↷ bringt ihn wieder', JSON.stringify(u));
// Speichern/Laden: Spur-Flag + Audio-Clips bleiben
const rt = await p.evaluate(() => { const fo = SQStore.buildProjectFile(S, null, VERSION); const q = normalizeProject(projFromFile(JSON.parse(JSON.stringify(fo)))); const o = q.tracks.findIndex(t => t.orig); return {o, clips: o >= 0 ? q.tracks[o].clips.filter(c => c && c.audio).length : 0, takes: Object.keys(q.takes || {}).length, imp: o >= 0 && q.takes ? Object.values(q.takes).some(t => t.imp) : false}; });
ok(rt.o >= 0 && rt.clips === c.parts.length && rt.takes >= 1 && rt.imp, 'Speichern/Laden: Original-Spur, Clips, Take', JSON.stringify(rt));
// 5 Loop in die Matrix (Blatt neu öffnen, Stand bleibt)
await p.evaluate(() => { closePop(); window.__imp1.ui.sheet(); });
await p.waitForTimeout(300);
await tapSel(p, '.imp1 button[data-i="loop"]');
const lp = await p.evaluate(() => window.__imp1.ui.last());
ok(lp && lp.kind === 'loop' && lp.a === 12 && lp.b === 20, 'Als Loop in die Matrix', JSON.stringify(lp));
const lc = await p.evaluate(lp => { const c = S.tracks[lp.track].clips[lp.scene]; return c && {len: c.len, in: c.audio.in, out: c.audio.out}; }, lp);
ok(lc && lc.len === 8 && Math.abs(lc.out - lc.in - 8 * 4 * 60 / 92) < .01, 'Loop-Clip 8 Takte, Ausschnitt passt', JSON.stringify(lc));
// 6 Als eine Spur, Als Gesang
await tapSel(p, '.imp1 button[data-i="track"]');
const tr1 = await p.evaluate(() => { const o = S.tracks.findIndex(t => t.orig); return {own: S.song.lanes[o].filter(e => e.own).length, lane: S.song.lanes[o].length}; });
ok(tr1.own === c.parts.length && tr1.lane === c.parts.length + 1, 'Als eine Spur: eigene Song-Clips in Reihenfolge', JSON.stringify(tr1));
await tapSel(p, '.imp1 button[data-i="vox"]');
const vx = await p.evaluate(() => ({st: stimmeT(), vox: (S.song.vox || []).length, label: UNDO[UNDO.length - 1].label}));
ok(vx.st >= 0 && vx.vox >= 1 && vx.label === 'Als Gesang importiert', 'Als Gesang: STIMME-Spur mit Song-Stück', JSON.stringify(vx));
// 7 Maße: hochkant + quer, ✕ sichtbar, Tasten ≥ 44 px, nichts außerhalb
for (const [w, h] of [[428, 926], [926, 428], [926, 370]]) {
  await p.setViewportSize({width: w, height: h}); await p.waitForTimeout(250);
  await p.evaluate(() => { closePop(); window.__imp1.ui.sheet(); }); await p.waitForTimeout(350);
  const m = await p.evaluate(() => { const P = UI.pop.el, r = P.getBoundingClientRect(), bt = [...P.querySelectorAll('button')].filter(b => b.offsetParent), small = bt.filter(b => { const q = b.getBoundingClientRect(); return q.height < 43.5 || q.width < 43.5; }).map(b => b.textContent.trim().slice(0, 16));
    const x = [...P.querySelectorAll('button')].find(b => /✕/.test(b.textContent)), xr = x && x.getBoundingClientRect();
    const out = bt.filter(b => { const q = b.getBoundingClientRect(); return q.right > innerWidth + .5 || q.left < -.5; }).length;
    return {pop: [r.left, r.top, r.width, r.height].map(Math.round), x: xr ? [xr.left, xr.top].map(Math.round) : null, xVis: !!xr && xr.top >= 0 && xr.bottom <= innerHeight && xr.right <= innerWidth, small: small.slice(0, 5), out}; });
  ok(m.xVis && !m.small.length && !m.out && m.pop[0] >= 0 && m.pop[0] + m.pop[2] <= w, 'Maße ' + w + '×' + h + ': ✕ sichtbar, Tasten ≥ 44, nichts außerhalb', JSON.stringify(m));
  await p.screenshot({path: path.join(fotos, 'imp1-4-blatt-' + w + 'x' + h + '.png')});
}
await p.close();
// 8 MIDI über denselben Weg: Tempo 100, 3/4 aus der Datei (leeres Projekt)
const q = await page(428, 926);
const mid = (() => { const ev = [0, 0xFF, 0x51, 3, 0x09, 0x27, 0xC0, 0, 0xFF, 0x58, 4, 3, 2, 24, 8]; for (let k = 0; k < 6; k++) ev.push(0, 0x90, 60 + k, 100, 0x83, 0x60, 0x80, 60 + k, 0); ev.push(0, 0xFF, 0x2F, 0);
  const hd = [0x4D, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, 1, 0xE0], tk = [0x4D, 0x54, 0x72, 0x6B, 0, 0, 0, ev.length]; return Buffer.from(hd.concat(tk, ev)); })();
const mr = await q.evaluate(async b64 => { for (const tr of S.tracks) for (let s = 0; s < tr.clips.length; s++) tr.clips[s] = null; S.song = null; UNDO.length = 0;
  const u = Uint8Array.from(atob(b64), ch => ch.charCodeAt(0)); const r = await window.__imp1.ui.file(u.buffer, 'test.mid'); return {r: !!r, bpm: S.bpm, ts: S.ts || '4/4', undo: UNDO.length, label: UNDO.length && UNDO[UNDO.length - 1].label}; }, mid.toString('base64'));
ok(mr.r && mr.bpm === 100 && mr.ts === '3/4' && mr.undo === 1, 'MIDI: Noten + Tempo 100 + 3/4 aus der Datei, ein ↶', JSON.stringify(mr));
await q.close();
ok(!errs.length, 'keine Fehler in der Konsole', errs.slice(0, 3).join(' | '));
await b.close();
console.log(bad ? 'FEHLER ' + bad : 'ALLE OK');
