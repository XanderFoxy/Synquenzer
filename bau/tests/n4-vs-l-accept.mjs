// VS-L Abnahme (Nachtrag 4: Gesang ≥ 16 Takte, Schalter „Melodieerkennung“): node n4-vs-l-accept.mjs <IDs …> (01 … 11, 05s, 05g, 05x)
// Mikro-Attrappe im selben AudioContext (wie VS2/VS3), Ausgang über Analyser an allen Ausgängen (wie v3-vs3-h LOOP)
import {chromium} from 'playwright';
import fs from 'fs';
import {INIT as INIT2} from './v3-vs2-h.mjs';
import {b64, resample, renderVoice, sleep, mel16, deq} from './n4-vs-l-h.mjs';
const DIR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad';
const NEW = process.env.APP || DIR + '/vs-br-VSL/index.html', OLD = DIR + '/vs-base-B.html';
const only = process.argv.slice(2), want = k => !only.length || only.includes(k);
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const LEAD = 0.04;
const OUT = () => {
  window.__outs = [];
  const oc = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (d, ...r) { try { if (typeof AudioDestinationNode !== 'undefined' && d instanceof AudioDestinationNode) window.__outs.push(this); } catch (e) {} return oc.call(this, d, ...r); };
  window.__tap = () => { const ctx = window.__ctx, a = ctx.createAnalyser(); a.fftSize = 4096; for (const n of window.__outs) { try { n.connect(a); } catch (e) {} } window.__an = a; return true; };
  window.__lvl = () => { const a = window.__an; if (!a) return null; const b = new Float32Array(a.fftSize); a.getFloatTimeDomainData(b); let s = 0; for (const v of b) s += v * v; return 10 * Math.log10(s / b.length + 1e-20); };
  window.__toasts = [];
  const watch = () => { const t = document.getElementById('toast'); if (!t) return setTimeout(watch, 50); new MutationObserver(() => { const x = t.textContent.trim(); if (x && window.__toasts[window.__toasts.length - 1] !== x) window.__toasts.push(x); }).observe(t, {subtree: true, childList: true, characterData: true}); };
  document.addEventListener('DOMContentLoaded', watch);
};
async function start(file, bpm, o = {}) {
  const br = o.br || await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await br.newContext({viewport: {width: 390, height: 844}});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(INIT2); await p.addInitScript(OUT);
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version); await sleep(400);
  await p.evaluate(r => { SYNQUENZER.play(); SYNQUENZER.stop(); return SYNQUENZER.stimmeStart({route: r, cal: false}); }, 'wired');
  await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live' && SYNQUENZER.vsClock().ring && SYNQUENZER.vsClock().ring.end > 0, null, {timeout: 8000});
  await sleep(400);
  const sr = await p.evaluate(() => SYNQUENZER.vsClock().sr);
  if (o.demo) await p.evaluate(() => SYNQUENZER.loadDemo());
  await p.evaluate(([bpm, mel]) => { SYNQUENZER.setBpm(bpm); SYNQUENZER.setMetronome(false); SYNQUENZER.setRecOptions({countIn: 0, length: 'auto'}); if (mel != null && SYNQUENZER.vsSet) SYNQUENZER.vsSet({mel}); }, [bpm, o.mel == null ? null : o.mel]);
  return {br, ctx, p, errs, sr, bpm, ver: await p.evaluate(() => SYNQUENZER.version), close: async () => { if (!o.br) await br.close(); else await ctx.close(); }};
}
const sing = (notes, bpm) => renderVoice(notes.map(([b, d, m], k) => ({on: LEAD + b * 60 / bpm, dur: d * 60 / bpm, midi: m, legato: false, rest: k ? 0.1 : 0})), {voice: 'male', seed: 3, sigma: 12, vib: [20, 40], bpm}).x;
// Gesang vorab in die Seite (dekodiert als AudioBuffer), dann genau planen – so verschiebt keine Rechenlast den Einsatz
let PREN = 0;
async function prep(H, x) { const y = resample(x, 16000, H.sr), k = 'g' + (++PREN); await H.p.evaluate(([b, k]) => { const bin = atob(b), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); const x = new Float32Array(u.buffer), ctx = window.__ctx, buf = ctx.createBuffer(1, x.length, ctx.sampleRate); buf.getChannelData(0).set(x); (window.__pre = window.__pre || {})[k] = buf; }, [b64(y), k]); return k; }
async function fire(H, k, beat) { return H.p.evaluate(([k, beat, lead]) => { const c = SYNQUENZER.vsClock(), t = c.start + beat * c.spb - lead, F = window.__fake, src = window.__ctx.createBufferSource(); src.buffer = window.__pre[k]; src.connect(F.bus); src.start(t); F.srcs.push(src); return {t, now: c.now}; }, [k, beat, LEAD]); }
async function playAt(H, x, beat, startPlay) { const k = await prep(H, x); if (startPlay) await H.p.evaluate(() => SYNQUENZER.play()); const r = await fire(H, k, beat); if (r.t < r.now) console.log('! Gesang zu spät geplant', JSON.stringify(r)); return r.t; }
async function waitBeat(p, b) { await p.waitForFunction(b => { const c = SYNQUENZER.vsClock(); return c.playing && (c.now - c.outLat - c.start) / c.spb >= b; }, b, {timeout: 240000, polling: 20}); }
async function idle(p) { await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy && !SYNQUENZER.tkInfo().pend.length && SYNQUENZER.tkInfo().writes === 0, null, {timeout: 60000}); await sleep(200); }
// ● kurz vor dem Takt startBar (0-basiert), Gesang ab dem Takt; ● am Ende (press) oder automatisch
async function recSing(H, {track, scene, startBar, bars, notes, press, key}) {
  const p = H.p, k = key || await prep(H, sing(notes || mel16(bars), H.bpm));
  if (!(await p.evaluate(() => SYNQUENZER.vsClock().playing))) await p.evaluate(() => SYNQUENZER.play());
  await waitBeat(p, startBar * 4 - 3.5);
  const g = await fire(H, k, startBar * 4); if (g.t < g.now) console.log('! Gesang zu spät geplant', JSON.stringify(g));
  await p.evaluate(([t, s]) => { SYNQUENZER.selectSlot(t, s); SYNQUENZER.rec(); }, [track, scene]);
  if (press) { await waitBeat(p, (startBar + bars) * 4 + 0.1); await p.evaluate(() => SYNQUENZER.rec()); }
  await waitBeat(p, (startBar + bars) * 4 + 1.5); await idle(p);
}
const stInfo = (p, scene) => p.evaluate(async s => { const I = SYNQUENZER.tkInfo(), st = I.stimme; const c = st >= 0 ? SYNQUENZER.getClip(st, s) : null, m = SYNQUENZER.getClip(5, s); const tk = c && c.audio ? SYNQUENZER.takes()[c.audio.take] : null;
  return {st, len: c && c.len, audio: c && c.audio ? JSON.parse(JSON.stringify(c.audio)) : null, takeSec: tk && +(tk.len / tk.sr).toFixed(3), sr: tk && tk.sr, mel: m && {len: m.len, n: m.notes.length, notes: m.notes.map(n => [n.t, n.n])}, last: I.last && {late: I.last.late, pre: I.last.pre, src: I.last.src}}; }, scene);
// RMS (dBFS) des Takes in [a, b) Sekunden ab Take-Anfang
const takeDb = (p, id, a, b) => p.evaluate(async ([id, a, b]) => { const m = SYNQUENZER.takes()[id]; const s = await SYNQUENZER.tkPcmRange(id, Math.round(a * m.sr), Math.round(b * m.sr)); if (!s || !s.length) return -200; let q = 0; for (const v of s) q += v * v; return +(10 * Math.log10(q / s.length / 32767 / 32767 + 1e-20)).toFixed(1); }, [id, a, b]);
// Projekt-Schnappschuss mit neutralen Take-IDs (Zeitstempel weg) für deep-equal zwischen Läufen / Fassungen
const snap = p => p.evaluate(() => { const P = SYNQUENZER.project(); return {tracks: P.tracks.map(t => ({clips: t.clips, stimme: t.stimme || false, name: t.name})), song: P.song || null, takes: P.takes || null}; });
function neutral(o) {
  const ids = []; const s = JSON.stringify(o, (k, v) => (k === 'created' ? undefined : v));
  const keys = o.takes ? Object.keys(o.takes) : []; let t = s;
  for (const m of s.matchAll(/"([0-9a-z]{10})"/g)) if (keys.includes(m[1]) && !ids.includes(m[1])) ids.push(m[1]);
  ids.forEach((id, i) => { t = t.split(id).join('T' + (i + 1)); });
  return JSON.parse(t);
}
// deep-equal mit Messrauschen der Tonhöhen-Auswertung zwischen zwei Läufen: Roh-Einsatz o und Dauer d der MELODIE-Noten ± 0,05 Schlag, v ± 0,01
function near(a, b, k) {
  if (typeof a === 'number' && typeof b === 'number') return k === 'o' || k === 'd' ? Math.abs(a - b) <= 0.05 : k === 'v' ? Math.abs(a - b) <= 0.01 : a === b;
  if (Array.isArray(a) || Array.isArray(b)) return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => near(x, b[i]));
  if (a && b && typeof a === 'object' && typeof b === 'object') { const ka = Object.keys(a).sort(), kb = Object.keys(b).sort(); return ka.join() === kb.join() && ka.every(x => near(a[x], b[x], x)); }
  return a === b;
}
function jit(a, b, k, out = {o: 0, d: 0, v: 0, n: 0}) {
  if (typeof a === 'number' && typeof b === 'number' && out[k] != null && k !== 'n') { out[k] = Math.max(out[k], Math.abs(a - b)); return out; }
  if (a && b && typeof a === 'object' && typeof b === 'object') for (const x of Object.keys(a)) jit(a[x], b[x], x, out);
  return out;
}
const toasts = p => p.evaluate(() => window.__toasts.slice());
const runs = p => p.evaluate(() => SYNQUENZER.vsInfo().runs);
const undoN = p => p.evaluate(() => SYNQUENZER.undoInfo().n);
const R = {};   // Ergebnisse für den Changelog
// Hörbarkeit am Ausgang: Szene allein starten, Pegel am Ausgang in Takt 1 und im letzten Takt (Schlag 0,5 / L·4 − 3,5)
async function heard(H, scene, bars) {
  const p = H.p;
  await p.evaluate(s => { SYNQUENZER.stop(); window.__tap(); SYNQUENZER.launchScene(s); SYNQUENZER.play(); }, scene);
  await waitBeat(p, 0.6); const a = await p.evaluate(() => window.__lvl());
  await waitBeat(p, bars * 4 - 3.4); const b = await p.evaluate(() => window.__lvl());
  await waitBeat(p, bars * 4 + 0.6); const c = await p.evaluate(() => window.__lvl());   // Schleife: Takt 1 wieder
  await p.evaluate(() => SYNQUENZER.stop());
  return {bar1: +a.toFixed(1), barL: +b.toFixed(1), loop: +c.toFixed(1)};
}

// VS-L-01 — 120 BPM, leerer Platz, ● REC mit 🎤, 16 Takte singen → STIMME 16 Takte, hörbar Takt 1 und 16; MELODIE Takt 1–16
if (want('01')) {
  const H = await start(NEW, 120), p = H.p;
  await recSing(H, {track: 3, scene: 2, startBar: 1, bars: 16});
  const r = await stInfo(p, 2);
  const d1 = await takeDb(p, r.audio.take, r.audio.in, r.audio.in + 2), d16 = await takeDb(p, r.audio.take, r.audio.in + 30, r.audio.in + 32);
  ok(r.len === 16 && r.audio.out - r.audio.in > 31.99 && r.takeSec >= 32.25 && r.last.late === 0, `VS-L-01 STIMME-Clip ${r.len} Takte, Take ${r.takeSec} s (in ${r.audio.in} … out ${r.audio.out}), late ${r.last.late}`);
  ok(d1 > -40 && d16 > -40, `VS-L-01 Gesang im Take: Takt 1 ${d1} dBFS, Takt 16 ${d16} dBFS`);
  const mn = r.mel ? r.mel.notes : [];
  ok(r.mel && r.mel.len === 16 && mn.some(n => n[0] < 4) && mn.some(n => n[0] >= 60), `VS-L-01 Melodieerkennung An: MELODIE-Clip ${r.mel && r.mel.len} Takte, ${r.mel && r.mel.n} Noten, erste t=${mn.length && mn[0][0]}, letzte t=${mn.length && mn[mn.length - 1][0]}`);
  await p.evaluate(t => { SYNQUENZER.selectTrack(t); SYNQUENZER.selectSlot(t, 2); }, r.st); await sleep(600);
  const w = await p.evaluate(t => { const c = document.querySelector('.slot[data-t="' + t + '"][data-s="2"] .mini svg path'); if (!c) return null; const seg = [...c.getAttribute('d').matchAll(/M([\d.]+) ([\d.]+)V([\d.]+)/g)].map(m => [+m[1], +m[3] - +m[2]]); return {n: seg.length, firstX: seg[0] && seg[0][0], lastX: seg.length && seg[seg.length - 1][0], tail: seg.filter(s => s[0] > 90).map(s => +s[1].toFixed(1))}; }, r.st);
  ok(w && w.n === 64 && w.lastX > 99 && w.tail.some(h => h > 10), `VS-L-01 (L.1.6) Wellenform über die ganze Länge: ${JSON.stringify(w)}`);
  const h = await heard(H, 2, 16);
  ok(h.bar1 > -45 && h.barL > -45 && h.loop > -45, `VS-L-01 hörbar am Ausgang (Szene allein): Takt 1 ${h.bar1} dB, Takt 16 ${h.barL} dB, nach der Schleife Takt 1 ${h.loop} dB`);
  R['01'] = {len: r.len, takeSec: r.takeSec, d1, d16, mel: r.mel && {len: r.mel.len, n: r.mel.n}, heard: h};
  ok(!H.errs.length, 'VS-L-01 keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.close();
}

// VS-L-02 + VS-L-11 — Overdub: 4-Takt-STIMME-Clip, neue Aufnahme 16 Takte → Clip 16, neuer Take oben, alter in alt; ein Undo
async function overdub(file, bars2, bpm = 120, sb2 = 6) {
  const H = await start(file, bpm), p = H.p;
  await p.evaluate(() => { SYNQUENZER.setRecOptions({length: 4}); });
  const k2 = await prep(H, sing(mel16(bars2).map(([b, d, m]) => [b, d, m + 2]), bpm));
  await recSing(H, {track: 3, scene: 2, startBar: 1, bars: 4});
  const r4 = await stInfo(p, 2), s4 = await snap(p), u4 = await undoN(p);
  await p.evaluate(() => SYNQUENZER.setRecOptions({length: 'auto'}));
  await recSing(H, {track: 3, scene: 2, startBar: sb2, bars: bars2, press: bars2 < 16, key: k2});
  const r = await stInfo(p, 2), s = await snap(p), u = await undoN(p);
  return {H, r4, s4, u4, r, s, u};
}
if (want('02')) {
  const A = await overdub(NEW, 16), p = A.H.p;
  const old = A.r4.audio.take, nw = A.r.audio;
  ok(A.r4.len === 4 && A.r4.takeSec < 9, `VS-L-02 vorher: STIMME-Clip ${A.r4.len} Takte (Take ${A.r4.takeSec} s)`);
  ok(A.r.len === 16 && nw.take !== old && nw.alt && nw.alt[0].take === old && nw.out - nw.in > 31.99 && nw.at === 0, `VS-L-02 Overdub 16 Takte: Clip ${A.r.len} Takte, neuer Take oben (${(nw.out - nw.in).toFixed(3)} s), alter in alt[0] ${JSON.stringify(nw.alt && nw.alt.map(x => [x.take === old, x.in, x.out, x.at]))}`);
  const d16 = await takeDb(p, nw.take, nw.in + 30, nw.in + 32), d1 = await takeDb(p, nw.take, nw.in, nw.in + 2);
  ok(d1 > -40 && d16 > -40, `VS-L-02 neuer Take: Takt 1 ${d1} dBFS, Takt 16 ${d16} dBFS`);
  // läuft phasengleich: Phase der STIMME-Spur = Anfang der Aufnahme (Takt 7 = Schlag 24)
  await p.waitForFunction(st => !SYNQUENZER.state().runtime.queued[st], A.r.st, {timeout: 10000}).catch(() => {});
  const ph = await p.evaluate(st => SYNQUENZER.state().runtime.cstart[st], A.r.st);
  ok(ph === 24, `VS-L-02 der längere Clip läuft ab dem Takt der Aufnahme (Phase Schlag ${ph})`);
  ok(A.u === A.u4 + 1, `VS-L-11 Overdub 16 Takte = genau ein Undo-Schritt (${A.u4} → ${A.u})`);
  await p.evaluate(() => SYNQUENZER.stop());
  await p.evaluate(() => SYNQUENZER.undo()); const su = await snap(p);
  ok(deq(su, A.s4), 'VS-L-11 Undo → Projekt deep-equal zum 4-Takt-Stand');
  await p.evaluate(() => SYNQUENZER.redo()); const sr = await snap(p);
  ok(deq(sr, A.s), 'VS-L-11 Redo → deep-equal zum 16-Takt-Stand');
  const h = await heard(A.H, 2, 16);
  ok(h.bar1 > -45 && h.barL > -45, `VS-L-02 hörbar (Szene allein): Takt 1 ${h.bar1} dB, Takt 16 ${h.barL} dB`);
  R['02'] = {before: A.r4.len, after: A.r.len, take: +(nw.out - nw.in).toFixed(3), alt: nw.alt ? nw.alt.length : 0, d1, d16, heard: h};
  ok(!A.H.errs.length, 'VS-L-02 keine Konsolenfehler ' + JSON.stringify(A.H.errs.slice(0, 2)));
  await A.H.close();
  // 3 Takte auf 4-Takt-Clip: wie 4.23.0 (deep-equal, neutrale Take-IDs)
  const B = await overdub(NEW, 3); await B.H.close(); const C = await overdub(OLD, 3); await C.H.close(); const D = await overdub(OLD, 3);
  const nb = neutral(B.s), nc = neutral(C.s), nd = neutral(D.s), stOf = x => x.tracks.filter(t => t.stimme);
  ok(B.r.len === 4 && deq(stOf(nb), stOf(nc)) && deq(nb.takes, nc.takes) && near(nb, nc), `VS-L-02 neue Aufnahme 3 Takte: Clip ${B.r.len} Takte, STIMME-Spur + Takes deep-equal zu 4.23.0 (${C.H.ver}), Rest deep-equal bis auf Messrauschen der Noten (neu↔alt ${JSON.stringify(jit(nb, nc))}, alt↔alt ${JSON.stringify(jit(nc, nd))}) – Take ${(B.r.audio.out - B.r.audio.in).toFixed(3)} s, at ${B.r.audio.at}`);
  if (!deq(nb, nc)) fs.writeFileSync('n4-vs-l-02-diff.json', JSON.stringify({neu: nb, alt: nc}, null, 1));
  await D.H.close();
}

// VS-L-03 — ● REC mit 🎤 über einem vorhandenen 4-Takt-MELODIE-Clip (Demo-Szene) → STIMME-Take 16 Takte
if (want('03')) {
  const H = await start(NEW, 120, {demo: true}), p = H.p;
  await p.evaluate(() => SYNQUENZER.setClip(5, 0, {len: 4, notes: [{t: 0, d: 1, n: 60, v: .8}, {t: 8, d: 1, n: 64, v: .8}]}));
  await recSing(H, {track: 5, scene: 0, startBar: 1, bars: 16, press: true});
  const r = await stInfo(p, 0), d16 = await takeDb(p, r.audio.take, r.audio.in + 30, r.audio.in + 32);
  ok(r.len === 16 && r.audio.out - r.audio.in > 31.99 && d16 > -40, `VS-L-03 STIMME-Take ${r.len} Takte (${(r.audio.out - r.audio.in).toFixed(3)} s), Takt 16 ${d16} dBFS; MELODIE-Clip bleibt ${r.mel.len} Takte (${r.mel.n} Noten, wie 4.23.0)`);
  R['03'] = {len: r.len, take: +(r.audio.out - r.audio.in).toFixed(3), d16, mel: {len: r.mel.len, n: r.mel.n}};
  ok(!H.errs.length, 'VS-L-03 keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.close();
}

// VS-L-04 + VS-L-11 — Länge 16: Aufnahme endet nach genau 16 Takten; Speichern/Laden behält 16; ein Undo
if (want('04')) {
  const H = await start(NEW, 120), p = H.p;
  const k18 = await prep(H, sing(mel16(18), 120));
  await p.evaluate(() => { SYNQUENZER.setRecOptions({length: 16}); SYNQUENZER.play(); });
  const u0 = await undoN(p), s0 = await snap(p);
  await waitBeat(p, 1.5); await p.evaluate(() => { SYNQUENZER.selectSlot(3, 2); SYNQUENZER.rec(); });
  await fire(H, k18, 4);
  const st0 = await p.evaluate(() => SYNQUENZER.state().runtime.rec);
  await waitBeat(p, 4 + 63.5); const stA = await p.evaluate(() => SYNQUENZER.state().runtime.rec.state);
  await waitBeat(p, 4 + 64.3); const stB = await p.evaluate(() => SYNQUENZER.state().runtime.rec.state);
  await waitBeat(p, 4 + 72 + 1); await idle(p);
  const r = await stInfo(p, 2), u1 = await undoN(p), s1 = await snap(p);
  ok(st0.length === 16 && stA === 'recording' && stB === 'off', `VS-L-04 Länge 16: läuft bei Schlag 67,5 (${stA}), aus bei 68,3 (${stB}) – endet nach genau 16 Takten`);
  ok(r.len === 16 && Math.abs(r.audio.out - r.audio.in - 32) < 1e-3, `VS-L-04 STIMME-Clip ${r.len} Takte, Take genau ${(r.audio.out - r.audio.in).toFixed(4)} s (= 64 Schläge), obwohl 18 Takte gesungen`);
  ok(u1 === u0 + 1, `VS-L-11 Länge-16-Aufnahme = ein Undo-Schritt (${u0} → ${u1})`);
  await p.evaluate(() => SYNQUENZER.stop()); await p.evaluate(() => SYNQUENZER.undo());
  ok(deq(await snap(p), s0), 'VS-L-11 Undo → deep-equal zu vorher'); await p.evaluate(() => SYNQUENZER.redo()); ok(deq(await snap(p), s1), 'VS-L-11 Redo → deep-equal');
  const rl = await p.evaluate(() => { const t = SYNQUENZER.serialize(); SYNQUENZER.newProject(); const a = SYNQUENZER.project().settings.recLength; SYNQUENZER.importJSON(t); return {fresh: a, loaded: SYNQUENZER.project().settings.recLength, file: JSON.parse(t).project.settings.recLength}; });
  ok(rl.file === 16 && rl.loaded === 16 && rl.fresh === 'auto', `VS-L-04 Speichern/Laden behält 16 ${JSON.stringify(rl)}`);
  R['04'] = {take: +(r.audio.out - r.audio.in).toFixed(4), rl};
  ok(!H.errs.length, 'VS-L-04 keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.close();
}

// VS-L-05 — langsamstes Tempo (40 BPM): 16 Takte + Vorlauf ganz im Ringpuffer (late = 0) – ● REC, Overdub-Wachsen, FANG, SONG
if (want('05')) {
  const H = await start(NEW, 40), p = H.p;
  const ring = await p.evaluate(() => SYNQUENZER.stimme().ring);
  await recSing(H, {track: 3, scene: 2, startBar: 1, bars: 16});
  const r = await stInfo(p, 2), d16 = await takeDb(p, r.audio.take, r.audio.in + 94, r.audio.in + 96);
  ok(r.len === 16 && r.last.late === 0 && r.last.pre === 0.25 && r.takeSec >= 96.25 && d16 > -40, `VS-L-05 40 BPM ● REC: ${r.len} Takte, Take ${r.takeSec} s, Vorlauf ${r.last.pre} s, late ${r.last.late}, Takt 16 ${d16} dBFS (Ringpuffer ${ring.sec} s)`);
  R['05'] = {rec: {len: r.len, takeSec: r.takeSec, late: r.last.late}, ring: ring.sec};
  ok(!H.errs.length, 'VS-L-05 keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.close();
}
if (want('05g')) {   // FANG bei 40 BPM (16-Takt-Phrase)
  const H = await start(NEW, 40), p = H.p;
  await playAt(H, sing(mel16(16), 40), 4, true);
  await waitBeat(p, 4 + 64 + 0.3); const okF = await p.evaluate(() => SYNQUENZER.vsFang({})); await idle(p);
  const v = await p.evaluate(() => SYNQUENZER.vsResult()), r = v ? await stInfo(p, v.scene) : null;
  ok(okF && v && v.len === 16 && r.len === 16 && r.last.late === 0 && r.takeSec >= 96.25, `VS-L-05 40 BPM Stimme-FANG: MELODIE ${v && v.len}, STIMME ${r && r.len} Takte, Take ${r && r.takeSec} s, late ${r && r.last.late}`);
  ok(!H.errs.length, 'VS-L-05 FANG keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.close();
}
if (want('05o')) {   // Overdub-Wachsen bei 40 BPM: 4-Takt-Clip, dann 16 Takte
  const A = await overdub(NEW, 16, 40, 7), p = A.H.p, nw = A.r.audio;
  const last = await p.evaluate(() => SYNQUENZER.tkInfo().last), d16 = await takeDb(p, nw.take, nw.in + 94, nw.in + 96);
  ok(A.r.len === 16 && nw.out - nw.in > 95.99 && last.late === 0 && d16 > -40, `VS-L-05 40 BPM Overdub: Clip ${A.r.len} Takte, Take ${(nw.out - nw.in).toFixed(2)} s, late ${last.late}, Takt 16 ${d16} dBFS`);
  await A.H.close();
}
async function song(H, bars, mode = 'over') {
  const p = H.p;
  await p.evaluate(b => SYNQUENZER.setSong({bars: b, lanes: [[{bar: 0, slot: 0}], [{bar: 0, slot: 0}], [], [], [{bar: 0, slot: 0}], []], carrier: [], mel: {}}), Math.max(16, bars));
  const k = await prep(H, sing(mel16(bars), H.bpm));
  await p.evaluate(m => SYNQUENZER.songRecFrom({from: 0, mode: m, targets: {clips: false, chords: false, mel: true}, preroll: false}), mode);
  await p.waitForFunction(() => SYNQUENZER.runtime().song.play && SYNQUENZER.vsClock().playing, null, {timeout: 5000});
  const off = await p.evaluate(() => SYNQUENZER.runtime().song.off || 0);
  const g = await fire(H, k, off); if (g.t < g.now) console.log('! Gesang zu spät geplant', JSON.stringify(g));
  await waitBeat(p, off + bars * 4 + 0.2); await p.evaluate(b => SYNQUENZER.songRecEnd({beat: b}), off + bars * 4); await idle(p);
  const vox = await p.evaluate(() => SYNQUENZER.tkInfo().vox), last = await p.evaluate(() => SYNQUENZER.tkInfo().last);
  return {vox, last, off};
}
if (want('05s')) {   // SONG bei 40 BPM, 16 Takte
  const H = await start(NEW, 40), p = H.p;
  const s = await song(H, 16), v = s.vox && s.vox[0];
  const d16 = v ? await takeDb(p, v.take, v.in + 94, v.in + 96) : -200;
  ok(v && v.len === 16 && s.last.late === 0 && v.out - v.in > 95.99 && d16 > -40, `VS-L-05 40 BPM ● SONG: song.vox ${v && v.len} Takte (${v && (v.out - v.in).toFixed(2)} s), late ${s.last.late}, Takt 16 ${d16} dBFS`);
  ok(!H.errs.length, 'VS-L-05 SONG keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.close();
}
if (want('05x')) {   // Grenze: ● SONG bei 40 BPM über 21 Takte (126 s) → der Anfang liegt nicht mehr im Ringpuffer (late > 0)
  const H = await start(NEW, 40), p = H.p;
  const s = await song(H, 21), v = s.vox && s.vox[0];
  ok(v && s.last.late > 0, `VS-L-05 Grenze: SONG 21 Takte bei 40 BPM (126 s) → late ${s.last.late && s.last.late.toFixed(2)} s (Take beginnt später; Grenze = Ringpuffer 120 s)`);
  R['05x'] = {late: s.last.late};
  await H.close();
}

// VS-L-06 — Stimme-FANG, 16-Takt-Phrase ohne Pause ≥ 1 Takt → MELODIE-Clip und STIMME-Take je 16 Takte
if (want('06')) {
  const H = await start(NEW, 120), p = H.p;
  await playAt(H, sing(mel16(16), 120), 4, true);
  await waitBeat(p, 4 + 64 + 0.3);
  const okF = await p.evaluate(() => SYNQUENZER.vsFang({})); await idle(p);
  const v = await p.evaluate(() => SYNQUENZER.vsResult()), r = v ? await stInfo(p, v.scene) : null;
  const d16 = r ? await takeDb(p, r.audio.take, r.audio.in + 30, r.audio.in + 32) : -200;
  ok(okF && v && v.len === 16 && r.mel.len === 16 && r.len === 16 && r.audio.out - r.audio.in > 31.99 && r.audio.take === (await p.evaluate(s => SYNQUENZER.getClip(5, s).take, v.scene)) && d16 > -40,
    `VS-L-06 FANG: MELODIE ${r && r.mel.len} Takte (${v && v.notes.length} Noten), STIMME ${r && r.len} Takte (${r && (r.audio.out - r.audio.in).toFixed(3)} s, gleiche take-ID), Takt 16 ${d16} dBFS`);
  R['06'] = {mel: v && v.len, st: r && r.len, n: v && v.notes.length};
  ok(!H.errs.length, 'VS-L-06 keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.close();
}

// VS-L-07 — ● SONG mit 🎤 über 16 Takte → song.vox 16 Takte, hörbar bis zum Ende
if (want('07')) {
  const H = await start(NEW, 120), p = H.p;
  const s = await song(H, 16), v = s.vox && s.vox[0];
  const dB = v ? await takeDb(p, v.take, v.in + 30, v.in + 32) : -200;
  ok(v && v.bar === 0 && v.len === 16 && v.out - v.in > 31.99 && s.last.late === 0 && dB > -40, `VS-L-07 song.vox ${v && v.len} Takte (${v && (v.out - v.in).toFixed(3)} s), letzter Takt ${dB} dBFS`);
  // hörbar bis zum Ende: Song von Takt 15 abspielen, Pegel in Takt 16
  await p.evaluate(() => { SYNQUENZER.stop(); window.__tap(); for (let t = 0; t < 8; t++) try { SYNQUENZER.setMute && SYNQUENZER.setMute(t, t !== SYNQUENZER.tkInfo().stimme); } catch (e) {} });
  const can = await p.evaluate(() => typeof SYNQUENZER.songPlay === 'function');
  if (can) {
    await p.evaluate(() => SYNQUENZER.songPlay(14));
    await sleep(200);
    const lv = []; for (let k = 0; k < 16; k++) { await sleep(250); lv.push(await p.evaluate(() => { const c = SYNQUENZER.vsClock(), off = SYNQUENZER.runtime().song.off || 0; return [+(window.__lvl()).toFixed(1), Math.floor(((c.now - c.outLat - c.start) / c.spb - off) / 4)]; })); }
    await p.evaluate(() => SYNQUENZER.stop());
    const b16 = lv.filter(x => x[1] === 15).map(x => x[0]);
    ok(b16.length && Math.max(...b16) > -45, `VS-L-07 hörbar am Ausgang in Takt 16 (STIMME allein): ${JSON.stringify(b16)} dB`);
    R['07'] = {len: v && v.len, last: dB, out16: b16};
  }
  ok(!H.errs.length, 'VS-L-07 keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.close();
}

// VS-L-08 + VS-L-11 — Melodieerkennung Aus: ● REC, Stimme-FANG, ● SONG nur STIMME; MELODIE unverändert; Zähler 0; Meldung. An: wie 4.23.0
const PH2 = [[0, 1.6, 60], [2, 1.6, 62], [4, 1.6, 64], [6, 1.6, 62]];   // 2 Takte, dann Pause 2 Takte, dann 4 Takte
const PH4 = []; for (let b = 0; b < 4; b++) { PH4.push([16 + b * 4, 1.6, 57 + b * 2]); PH4.push([16 + b * 4 + 2, 1.6, 64 - b]); }
async function fangRun(file, mel) {
  const H = await start(file, 120, {mel}), p = H.p;
  const m0 = await p.evaluate(() => SYNQUENZER.project().tracks[5]), u0 = await undoN(p), s0 = await snap(p);
  await playAt(H, sing(PH2.concat(PH4), 120), 4, true);
  await waitBeat(p, 4 + 32 + 0.3);
  const okF = await p.evaluate(() => SYNQUENZER.vsFang({})); await idle(p);
  const lf = await p.evaluate(() => SYNQUENZER.vsInfo().lastFang), vr = await p.evaluate(() => SYNQUENZER.vsResult());
  const st = await p.evaluate(() => SYNQUENZER.tkInfo().stimme), sc = lf && lf.si != null ? lf.si : null;
  const r = sc != null ? await stInfo(p, sc) : null;
  return {H, okF, lf, vr, r, m0, m1: await p.evaluate(() => SYNQUENZER.project().tracks[5]), u0, u1: await undoN(p), s0, s1: await snap(p), runs: await runs(p), toasts: await toasts(p), st};
}
async function recRun(file, mel) {
  const H = await start(file, 120, {mel}), p = H.p;
  const m0 = await p.evaluate(() => SYNQUENZER.project().tracks[5]), u0 = await undoN(p), s0 = await snap(p);
  await recSing(H, {track: 3, scene: 2, startBar: 1, bars: 4, press: true});
  const r = await stInfo(p, 2);
  return {H, r, m0, m1: await p.evaluate(() => SYNQUENZER.project().tracks[5]), u0, u1: await undoN(p), s0, s1: await snap(p), runs: await runs(p), toasts: await toasts(p), res: await p.evaluate(() => SYNQUENZER.vsResult()), sheet: await p.evaluate(() => !!document.querySelector('.vsres'))};
}
async function songRun(file, mel) {
  const H = await start(file, 120, {mel}), p = H.p;
  const m0 = await p.evaluate(() => SYNQUENZER.project().tracks[5]);
  const s = await song(H, 4);
  return {H, s, m0, m1: await p.evaluate(() => SYNQUENZER.project().tracks[5]), runs: await runs(p), snap: await snap(p), toasts: await toasts(p)};
}
if (want('08')) {
  // Aus
  const A = await recRun(NEW, false), F = await fangRun(NEW, false), G = await songRun(NEW, false);
  ok(A.r.len === 4 && A.r.audio && !A.r.mel && deq(A.m0, A.m1) && A.runs === 0 && !A.res && !A.sheet, `VS-L-08 Aus ● REC: STIMME-Clip ${A.r.len} Takte, kein MELODIE-Clip, MELODIE-Spur deep-equal, Zähler ${A.runs}, kein Ergebnis-Blatt`);
  ok(A.toasts.includes('Gesang aufgenommen · 4 Takte') && !A.toasts.some(t => /Kein Gesang/.test(t)), `VS-L-08 Aus ● REC Meldung: ${JSON.stringify(A.toasts)}`);
  ok(A.u1 === A.u0 + 1, `VS-L-11 Aus ● REC = ein Undo-Schritt (${A.u0} → ${A.u1})`);
  await A.H.p.evaluate(() => SYNQUENZER.stop()); await A.H.p.evaluate(() => SYNQUENZER.undo()); const au = await snap(A.H.p);
  await A.H.p.evaluate(() => SYNQUENZER.redo()); const ar = await snap(A.H.p);
  ok(deq(au, A.s0) && deq(ar, A.s1), 'VS-L-11 Aus ● REC: Undo → deep-equal vorher, Redo → deep-equal nachher');
  ok(F.okF && F.lf && F.lf.mel === false && F.lf.len === 4 && F.r && F.r.len === 4 && F.r.audio && !F.r.mel && deq(F.m0, F.m1) && F.runs === 0 && !F.vr,
    `VS-L-08 Aus Stimme-FANG: STIMME-Clip ${F.r && F.r.len} Takte ab Takt ${F.lf && F.lf.start + 1} (Phrase nach der Pause ≥ 1 Takt), MELODIE deep-equal, Zähler ${F.runs}, kein Ergebnis ${JSON.stringify(F.lf)}`);
  ok(F.toasts.includes('Gesang aufgenommen · 4 Takte'), `VS-L-08 Aus FANG Meldung: ${JSON.stringify(F.toasts)}`);
  ok(F.u1 === F.u0 + 1, `VS-L-11 Aus FANG = ein Undo-Schritt (${F.u0} → ${F.u1})`);
  await F.H.p.evaluate(() => SYNQUENZER.stop()); await F.H.p.evaluate(() => SYNQUENZER.undo()); const fu = await snap(F.H.p);
  await F.H.p.evaluate(() => SYNQUENZER.redo()); const fr = await snap(F.H.p);
  ok(deq(fu, F.s0) && deq(fr, F.s1), 'VS-L-11 Aus FANG: Undo → deep-equal vorher, Redo → deep-equal nachher');
  const gv = G.s.vox && G.s.vox[0];
  ok(gv && gv.len === 4 && deq(G.m0, G.m1) && G.runs === 0, `VS-L-08 Aus ● SONG: song.vox ${gv && gv.len} Takte, MELODIE deep-equal, Zähler ${G.runs}`);
  R['08'] = {rec: {len: A.r.len, toasts: A.toasts}, fang: F.lf, song: gv && gv.len, level: await F.H.p.evaluate(() => SYNQUENZER.vsVoiceOnly())};
  for (const X of [A, F, G]) ok(!X.H.errs.length, 'VS-L-08 Aus keine Konsolenfehler ' + JSON.stringify(X.H.errs.slice(0, 2)));
  await A.H.close(); await F.H.close(); await G.H.close();
  // An: deep-equal zu 4.23.0 (gleiche Abläufe auf beiden Fassungen, neutrale Take-IDs)
  const An = await recRun(NEW, true); await An.H.close(); const Ao = await recRun(OLD, null);
  ok(near(neutral(An.s1), neutral(Ao.s1)) && An.r.mel && An.r.mel.n > 0, `VS-L-08 An ● REC deep-equal zu 4.23.0 (Noten-Rohzeiten ± Messrauschen ${JSON.stringify(jit(neutral(An.s1), neutral(Ao.s1)))}) (MELODIE ${An.r.mel && An.r.mel.n} Noten, STIMME ${An.r.len} Takte; Zähler ${An.runs}/${Ao.runs})`);
  if (!deq(neutral(An.s1), neutral(Ao.s1))) fs.writeFileSync('n4-vs-l-08-rec-diff.json', JSON.stringify({neu: neutral(An.s1), alt: neutral(Ao.s1)}, null, 1));
  await Ao.H.close();
  const Fn = await fangRun(NEW, true); await Fn.H.close(); const Fo = await fangRun(OLD, null);
  ok(near(neutral(Fn.s1), neutral(Fo.s1)) && Fn.vr, `VS-L-08 An Stimme-FANG deep-equal zu 4.23.0 (MELODIE ${Fn.vr && Fn.vr.len} Takte ab Takt ${Fn.vr && Fn.vr.start + 1}, ${Fn.vr && Fn.vr.notes.length} Noten); Aus gab dieselbe Phrase (Takt ${F.lf && F.lf.start + 1}, ${F.lf && F.lf.len} Takte)`);
  ok(Fn.vr && F.lf && Fn.vr.len === F.lf.len && Fn.vr.start === F.lf.start, `VS-L-08 Pausen-Regel: Aus (Pegel) = An (Noten): Anfang ${F.lf && F.lf.start} / ${Fn.vr && Fn.vr.start}, Länge ${F.lf && F.lf.len} / ${Fn.vr && Fn.vr.len}`);
  if (!deq(neutral(Fn.s1), neutral(Fo.s1))) fs.writeFileSync('n4-vs-l-08-fang-diff.json', JSON.stringify({neu: neutral(Fn.s1), alt: neutral(Fo.s1)}, null, 1));
  await Fo.H.close();
  const Gn = await songRun(NEW, true); await Gn.H.close(); const Go = await songRun(OLD, null);
  ok(deq(neutral(Gn.snap), neutral(Go.snap)), `VS-L-08 An ● SONG deep-equal zu 4.23.0`);
  await Go.H.close();
}

// VS-L-09 — Schalter bleibt nach Neuladen (Gerät), steht nicht im Projekt; Claude-App unverändert
if (want('09')) {
  const br = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await br.newContext({viewport: {width: 390, height: 844}});
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.addInitScript(INIT2);
  await p.goto('file://' + NEW); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version); await sleep(400);
  await p.evaluate(() => SYNQUENZER.setBpm(117)); await sleep(2500);   // ein geändertes (gespeichertes) Projekt, damit Neuladen dasselbe öffnet
  const j0 = await p.evaluate(() => SYNQUENZER.serialize()), m0 = await p.evaluate(() => SYNQUENZER.vsInfo().cfg.mel);
  await p.evaluate(() => SYNQUENZER.stimmeSheet()); await sleep(200);
  await p.click('.pop.stpop #vsMel button[data-v="0"]'); await sleep(200);
  const j1 = await p.evaluate(() => SYNQUENZER.serialize()), ls = await p.evaluate(() => JSON.parse(localStorage.getItem('synq-stimme-v1')));
  ok(m0 === true && ls && ls.vs && ls.vs.mel === false, `VS-L-09 Standard An; Tipp „Aus“ → Geräteprofil vs.mel = false ${JSON.stringify(ls && ls.vs)}`);
  ok(j0 === j1 && !/"mel":false/.test(j1), `VS-L-09 Projekt-JSON Zeichen für Zeichen gleich (${j0.length} Zeichen), kein Schalter im Projekt`);
  await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version); await sleep(400);
  const m2 = await p.evaluate(() => SYNQUENZER.vsInfo().cfg.mel); await p.evaluate(() => SYNQUENZER.stimmeSheet()); await sleep(200);
  const on2 = await p.evaluate(() => (document.querySelector('.pop.stpop #vsMel button.on') || {}).textContent);
  ok(m2 === false && on2 === 'Aus', `VS-L-09 nach Neuladen: Aus (${m2}, Knopf „${on2}“)`);
  const j2 = await p.evaluate(() => SYNQUENZER.serialize());
  ok(j2 === j0, 'VS-L-09 Projekt nach Neuladen deep-equal (Zeichen für Zeichen)');
  // altes Profil ohne Feld (4.23.0) → An
  await p.evaluate(() => { const o = JSON.parse(localStorage.getItem('synq-stimme-v1')); delete o.vs.mel; localStorage.setItem('synq-stimme-v1', JSON.stringify(o)); });
  await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version); await sleep(300);
  ok(await p.evaluate(() => SYNQUENZER.vsInfo().cfg.mel) === true, 'VS-L-09 Profil aus 4.23.0 (ohne Feld) → An');
  ok(!errs.length, 'VS-L-09 keine Fehler ' + JSON.stringify(errs.slice(0, 2)));
  // Claude-App: sandbox ohne allow-same-origin (Speicher wirft), kein Mikro
  const FR = DIR + '/dirigent-test/n4-vs-l-frame.html';
  fs.writeFileSync(FR, `<!doctype html><iframe id="f" src="file://${NEW}" sandbox="allow-scripts" style="width:390px;height:844px;border:0"></iframe>`);
  const q = await ctx.newPage(); const e2 = []; q.on('pageerror', e => e2.push(String(e))); q.on('console', m => { if (m.type() === 'error' && !/storage|localStorage|indexedDB|SecurityError|Failed to read/i.test(m.text())) e2.push(m.text()); });
  await q.goto('file://' + FR); await sleep(2500);
  const f = q.frames().find(fr => fr.url().includes('index.html'));
  const ci = f ? await f.evaluate(() => ({v: SYNQUENZER.version, avail: SYNQUENZER.stimme().avail, mel: SYNQUENZER.vsInfo().cfg.mel, sheet: SYNQUENZER.stimmeSheet(), mic: !!document.querySelector('.pop.stpop')})) : null;
  ok(ci && ci.v === '4.24.0' && ci.avail === false && ci.sheet === false && !ci.mic, `VS-L-09 Claude-App (iframe, ohne Speicher): läuft, kein Mikro, kein Mikro-Blatt ${JSON.stringify(ci)}`);
  ok(!e2.length, 'VS-L-09 Claude-App ohne Seitenfehler ' + JSON.stringify(e2.slice(0, 2)));
  await br.close();
}

fs.writeFileSync('n4-vs-l-accept-' + (only.join('-') || 'alle') + '.json', JSON.stringify(R, null, 1));
console.log(fail ? `FEHLER: ${fail}` : 'ALLE OK');
