// Unabhängige App-Prüfung VOXR1B: 3-min-Take (48 kHz, Take C mit eigenen Fehlern), Touch über CDP: Stufe, Anwenden, Abbrechen, ↶/↷,
// Speicher (Fassungs-Zähler, JS-Heap nach GC), Speichern/Laden, Long Tasks + Takt-Lücke während Prüfen und Anwenden.
import fs from 'fs';
const file = process.argv[2], OUT = process.argv[3];
const RV = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/realvox/';
const wav = f => { const b = fs.readFileSync(f); let o = 12, sr = 0, d = null; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'fmt ') sr = b.readUInt32LE(o + 12); if (id === 'data') d = b.subarray(o + 8, o + 8 + n); o += 8 + n + (n & 1); } return {pcm: new Int16Array(d.buffer.slice(d.byteOffset, d.byteOffset + d.length)), sr}; };
const {pcm: c16, sr} = wav(RV + 'imp2rs/vocadito_14@48000.wav'), TAU = 2 * Math.PI, res = [], R = {};
const ok = (c, name, info) => { res.push({ok: !!c, name, info}); console.log((c ? 'OK ' : 'FEHLER ') + name + (info != null ? ' – ' + JSON.stringify(info) : '')); };
// eigene Fehler: Brumm 60 Hz (−26 dB), alle 1,7 s ein Tiefstoß 40 ms, alle 0,9 s ein Mundklick
const n = c16.length, x = new Int16Array(n); { let s2 = 7; const r = () => { s2 = (Math.imul(s2, 1664525) + 1013904223) >>> 0; return s2 / 4294967296; };
  for (let i = 0; i < n; i++) { let h = 0; for (let k = 1; k <= 7; k++) h += Math.sin(TAU * 60 * k * i / sr + k) / k; x[i] = Math.max(-32768, Math.min(32767, c16[i] + 300 * h)); }
  for (let t = 0.8; t < n / sr - 0.3; t += 1.7) { const i0 = Math.round(t * sr), f = 30 + 30 * r(); for (let i = 0; i < 0.04 * sr; i++) x[i0 + i] = Math.max(-32768, Math.min(32767, x[i0 + i] + 6000 * Math.sin(TAU * f * i / sr) * Math.exp(-i / (0.012 * sr)))); }
  for (let t = 0.5; t < n / sr - 0.3; t += 0.9) { const i0 = Math.round(t * sr), f = 2000 + 5000 * r(); for (let i = 0; i < 0.0015 * sr; i++) x[i0 + i] = Math.max(-32768, Math.min(32767, x[i0 + i] + 5000 * Math.exp(-i / (0.0004 * sr)) * Math.sin(TAU * f * i / sr))); } }
const { chromium } = await import('/opt/node-tools/node_modules/playwright/index.mjs');
const b = await chromium.launch({args: ['--js-flags=--expose-gc', '--enable-precise-memory-info']}), errs = [];
const p = await b.newPage({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true});
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + file); await p.waitForTimeout(1500);
const run = (fn, arg) => p.evaluate('(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)); return (' + fn.toString() + ')(' + JSON.stringify(arg == null ? null : arg) + '); })()');
const cdp = await p.context().newCDPSession(p);
const tap = async (xx, yy) => { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: xx, y: yy}]}); await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); };
const tapSel = async s => { const g = await run(async o => { const e = document.querySelector(o.s); if (!e) return null; e.scrollIntoView({block: 'center'}); await wait(120); const r = e.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, t: e.textContent}; }, {s}); if (g) await tap(g.x, g.y); return g; };
const until = async (fn, arg, ms) => { const t0 = Date.now(); let r; while (Date.now() - t0 < (ms || 30000)) { r = await run(fn, arg); if (r && r.ok) return Object.assign(r, {waitMs: Date.now() - t0}); await p.waitForTimeout(100); } return r; };
// 3-min-Take: 12-s-Stück mit Fehlern hinein, im Browser auf 180 s gekachelt
const id = await run(async o => { const s = atob(o.b), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); const q = new Int16Array(u.buffer), L = 180 * o.sr, pcm = new Int16Array(L); for (let i = 0; i < L; i++) pcm[i] = q[i % q.length];
  const r = await SYNQUENZER.tkInject({pcm, sr: o.sr, scene: 0, at: 0, len: 2}); await wait(500); window.__tk = r; tkSheet({t: r.track, s: r.scene}); await wait(600);
  // Beobachter: Long Tasks + 16-ms-Takt (Chat-ähnliche Arbeit)
  window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push({d: Math.round(e.duration), t: Math.round(e.startTime)}); }).observe({entryTypes: ['longtask']}); } catch (e) {}
  window.__gap = {max: 0, last: performance.now(), big: []}; setInterval(() => { const t = performance.now(), g = t - window.__gap.last; if (g > window.__gap.max) window.__gap.max = g; if (g > 60) window.__gap.big.push(Math.round(g)); window.__gap.last = t; }, 16);
  return r.id; }, {b: Buffer.from(x.buffer).toString('base64'), sr});
const settle = async () => run(async o => { const t0 = Date.now(); let h = null; while (Date.now() - t0 < 60000) { h = SYNQUENZER.clPlayHash(o.id); await wait(200); const busy = (typeof G4 !== 'undefined' && (G4.job.has(o.id) || G4.dq.has(o.id))) || SYNQUENZER.vr1Ver(o.id).busy; if (!busy && SYNQUENZER.clPlayHash(o.id) === h) { await wait(300); if (SYNQUENZER.clPlayHash(o.id) === h) return h; } } return 'timeout:' + h; }, {id});
await settle();
await run(async () => { window.__fx = []; for (const k of ['vr1Q16', 'vr1Prune', 'vr1Marks', 'vr1WegMake', 'tkPlayBuf', 'clResync', 'clPaint', 'vr1Status', 'wpClChanged', 'vr1Job', 'vr1Plan', 'tkBuffer', 'g4Call', 'clSync']) { const f = window[k]; if (typeof f !== 'function') continue; window[k] = function () { const t = performance.now(), r = f.apply(this, arguments), d = performance.now() - t; if (d > 15) window.__fx.push({k, d: Math.round(d), t: Math.round(t)}); return r; }; } }, null);
const mark = async k => run(async o => ({lt: window.__lt.length, gapMax: Math.round(window.__gap.max), big: window.__gap.big.length, k: o.k, rst: (window.__gap.max = 0, 0)}), {k});
const ltSince = async i0 => run(async o => { const r = {lt: window.__lt.slice(o.i0), gapMax: Math.round(window.__gap.max), big: window.__gap.big.slice(), fx: window.__fx.slice()}; window.__fx = []; return r; }, {i0});
const h0 = await run(async o => ({raw: await SYNQUENZER.tkPcmHash(o.id), play: o.pl, undo: UNDO.length, sheet: !!(UI.pop && UI.pop.name === 'takes'), row: !!document.querySelector('.vr1')}), {id, pl: await settle()});
ok(h0.sheet && h0.row, 'Takes-Blatt mit Zeile „Gesang reinigen“ offen (3-min-Take, 48 kHz)', h0);
// 1) „mittel“ per Touch → Prüfen im Worker
let m0 = await mark('pruefen'); await tapSel('[data-vr1="mittel"]');
const P1 = await until(async () => { const s = document.querySelector('.vr1st'); return {ok: /Befund/.test(s && s.textContent || ''), st: s && s.textContent}; }, null, 60000);
const L1 = await ltSince(m0.lt); R.pruefen = {P1, L1};
ok(P1 && P1.ok, 'Touch „mittel“: Prüfen des 3-min-Takes fertig, Befund in der Zustandszeile', {ms: P1 && P1.waitMs, st: P1 && P1.st});
ok(!L1.lt.some(q => q.d > 50) && L1.gapMax < 60, 'Prüfen (3 min): Hauptfaden ohne Long Task > 50 ms, 16-ms-Takt ohne Lücke > 60 ms', {longTasks: L1.lt.map(q => q.d), maxLueckeMs: L1.gapMax, langsam: L1.fx});
// 2) Anwenden → nach 800 ms Abbrechen (derselbe Knopf, Touch)
m0 = await mark('abbrechen'); await tapSel('[data-vr1a="ap"]');
const B1 = await until(async o => ({ok: SYNQUENZER.vr1Ver(o.id).busy, t: document.querySelector('[data-vr1a="ap"]').textContent}), {id}, 10000);
await p.waitForTimeout(800); const tA = Date.now(); await tapSel('[data-vr1a="ap"]');
const C1 = await until(async o => { const v = SYNQUENZER.vr1Ver(o.id); return {ok: !v.busy, applied: v.applied, knopf: document.querySelector('[data-vr1a="ap"]').textContent, st: document.querySelector('.vr1st').textContent, undo: UNDO.length, w: window.__vr1.st.w ? 'lebt' : String(window.__vr1.st.w)}; }, {id}, 5000);
const cMs = Date.now() - tA; await p.waitForTimeout(3000); const plC = await settle();
const C2 = await run(async o => { const v = SYNQUENZER.vr1Ver(o.id); return {busy: v.busy, renders: v.renders, ready: v.ready, applied: v.applied, play: o.pl}; }, {id, pl: plC});
R.abbrechen = {B1, C1, cMs, C2};
ok(B1 && B1.ok && B1.t === 'Abbrechen', 'Anwenden startet die Rechnung, Knopf wird „Abbrechen“', B1);
ok(C1 && C1.ok && !C1.applied && C1.knopf === 'Anwenden' && C1.undo === h0.undo && cMs < 1000, 'Touch „Abbrechen“: Rechnung steht < 1 s, keine Fassung, kein ↶-Eintrag', {ms: cMs, knopf: C1 && C1.knopf, undo: C1 && C1.undo, worker: C1 && C1.w});
ok(!C2.busy && !C2.applied && C2.play === h0.play, 'Nach Abbrechen: kein Neustart (3 s), es spielt die vorige Fassung', C2);
// 3) Anwenden bis fertig: Zeit, Long Tasks, Takt
await run(async () => { if (window.gc) window.gc(); }, null); const heap0 = await run(async () => performance.memory ? performance.memory.usedJSHeapSize : null, null);
m0 = await mark('anwenden'); const tB = Date.now(); await tapSel('[data-vr1a="ap"]');
const A1 = await until(async o => { const v = SYNQUENZER.vr1Ver(o.id); return {ok: v.ready && !v.busy, applied: v.applied && v.applied.lv, steps: v.applied && Object.keys(v.applied.steps), bytes: v.bytes, vers: v.vers}; }, {id}, 120000);
const aMs = Date.now() - tB; await p.waitForTimeout(1500); const play1s = await settle();
const L3 = await ltSince(m0.lt); const play1 = play1s;
R.anwenden = {A1, aMs, L3};
ok(A1 && A1.ok && play1 !== h0.play, 'Touch „Anwenden“ (3 min): neue Fassung fertig und spielt', {ms: aMs, steps: A1 && A1.steps, bytes: A1 && A1.bytes});
ok(3 * aMs <= 60000, 'Anwenden 3-min-Take im Browser: Zeit (Info, × 3)', {ms: aMs});
ok(!L3.lt.some(q => q.d > 50) && L3.gapMax < 60, 'Anwenden (3 min, inkl. Fassung bauen): Hauptfaden ohne Long Task > 50 ms, Takt ohne Lücke > 60 ms', {longTasks: L3.lt.map(q => q.d), maxLueckeMs: L3.gapMax, luecken: L3.big.slice(-8), langsam: L3.fx});
// 4) ↶ / ↷ per Kopfleiste-Logik (undo/redo), 3 Runden; Speicher
const U = []; for (let k = 0; k < 3; k++) {
  await run(async () => { undo(); await wait(300); }, null);
  const u = await until(async o => { const v = SYNQUENZER.vr1Ver(o.id); return {ok: !v.applied && !v.busy, vers: v.vers, bytes: v.bytes}; }, {id}, 20000); u.play = await settle(); await run(async () => { if (window.gc) window.gc(); }, null); u.heap = await run(async () => performance.memory.usedJSHeapSize, null);
  await run(async () => { redo(); await wait(300); }, null);
  const r = await until(async o => { SYNQUENZER.clPlayHash(o.id); const v = SYNQUENZER.vr1Ver(o.id); return {ok: !!v.applied && v.ready && !v.busy, renders: v.renders, vers: v.vers, bytes: v.bytes}; }, {id}, 120000); r.play = await settle(); await run(async () => { if (window.gc) window.gc(); }, null); r.heap = await run(async () => performance.memory.usedJSHeapSize, null);
  U.push({heapNachUndoMB: Math.round(u.heap / 1e6), heapNachRedoMB: Math.round(r.heap / 1e6), undoPlayGleich: u && u.play === h0.play, redoPlayGleich: r && r.play === play1, renders: r && r.renders, bytes: r && r.bytes, vers: r && r.vers, redoMs: r && r.waitMs}); }
await run(async () => { if (window.gc) window.gc(); await wait(300); if (window.gc) window.gc(); }, null); const heap1 = await run(async () => performance.memory ? performance.memory.usedJSHeapSize : null, null);
R.undo = U; R.heap = {vorAnwenden: heap0, nach3Runden: heap1, wachstumMB: heap0 && heap1 ? +((heap1 - heap0) / 1e6).toFixed(1) : null};
ok(U.every(q => q.undoPlayGleich && q.redoPlayGleich), '↶ nimmt „Gesang reinigen“ zurück (spielt die vorige Fassung), ↷ bringt dieselbe Fassung wieder – 3 Runden', U);
ok(U.every(q => q.vers <= 1 && q.bytes <= 160e6), 'Speicher: je Take höchstens 1 Fassung im Zähler, ≤ 160 MB', U.map(q => [q.vers, q.bytes]));
ok(R.heap.wachstumMB == null || R.heap.wachstumMB < 120, 'Speicher: JS-Heap nach 3 Runden ↶/↷ (nach GC) wächst < 120 MB', R.heap);
// 5) Speichern/Laden
const S1 = await run(async o => { const j = serializeProject(), has = /"vr1":\{"lv":"/.test(j); const q = normalizeProject(typeof projFromFile === 'function' ? projFromFile(JSON.parse(j)) : JSON.parse(j)); applyProject(q, {ui: true}); await wait(800);
  const t0 = Date.now(); let v; while (Date.now() - t0 < 90000) { try { tkPlayBuf(o.id, null); } catch (e) {} v = SYNQUENZER.vr1Ver(o.id); if (v.ready && !v.busy) break; await wait(300); } return {has, applied: v && v.applied && v.applied.lv, ready: v && v.ready, raw: await SYNQUENZER.tkPcmHash(o.id), kB: Math.round(j.length / 1024)}; }, {id}); S1.play = await settle(); S1.playWieAngewandt = S1.play === play1;
R.speichern = S1;
ok(S1.has && S1.applied === 'mittel' && S1.ready && S1.raw === h0.raw, 'Speichern/Laden: Stufe im Projekt, nach dem Laden wieder angewandt, Roh-Take bitgleich', S1);
ok(!errs.length, 'keine Konsolenfehler', errs.slice(0, 5));
await b.close();
console.log(`ERGEBNIS ${res.filter(q => q.ok).length}/${res.length}`);
fs.writeFileSync(OUT, JSON.stringify({R, res}, null, 1));
