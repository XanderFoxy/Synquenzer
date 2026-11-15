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
const b = await chromium.launch(), errs = [];
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
await run(async () => { window.__loaf = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) if (e.duration > 45) window.__loaf.push({t: Math.round(e.startTime), d: Math.round(e.duration), bl: Math.round(e.blockingDuration || 0), rs: Math.round(e.renderStart - e.startTime), sl: Math.round(e.styleAndLayoutStart - e.startTime), sc: (e.scripts || []).filter(q => q.duration > 4).map(q => ({inv: q.invoker, it: q.invokerType, fn: q.sourceFunctionName, cp: q.sourceCharPosition, d: Math.round(q.duration), fl: Math.round(q.forcedStyleAndLayoutDuration || 0)}))}); }).observe({type: 'long-animation-frame', buffered: false}); } catch (e) { window.__loaf.push({err: String(e)}); } }, null);
await run(async () => { window.__fx = []; for (const k of ['vr1Q16', 'vr1Prune', 'vr1Marks', 'vr1WegMake', 'tkPlayBuf', 'clResync', 'clPaint', 'vr1Status', 'wpClChanged', 'vr1Job', 'vr1Plan', 'tkBuffer', 'g4Call', 'clSync']) { const f = window[k]; if (typeof f !== 'function') continue; window[k] = function () { const t = performance.now(), r = f.apply(this, arguments), d = performance.now() - t; if (d > 15) window.__fx.push({k, d: Math.round(d), t: Math.round(t)}); return r; }; } }, null);
const mark = async k => run(async o => ({lt: window.__lt.length, gapMax: Math.round(window.__gap.max), big: window.__gap.big.length, k: o.k, rst: (window.__gap.max = 0, 0)}), {k});
const ltSince = async i0 => run(async o => { const r = {lt: window.__lt.slice(o.i0), gapMax: Math.round(window.__gap.max), big: window.__gap.big.slice(), fx: window.__fx.slice()}; window.__fx = []; return r; }, {i0});
const h0 = await run(async o => ({raw: await SYNQUENZER.tkPcmHash(o.id), play: o.pl, undo: UNDO.length, sheet: !!(UI.pop && UI.pop.name === 'takes'), row: !!document.querySelector('.vr1')}), {id, pl: await settle()});
ok(h0.sheet && h0.row, 'Takes-Blatt mit Zeile „Gesang reinigen“ offen (3-min-Take, 48 kHz)', h0);

// VOXR1E-Trace: Chrome-Trace über Prüfen + Anwenden, lange Aufgaben (RunTask > 40 ms) des Hauptfadens mit Inhalt
const chunks = []; cdp.on('Tracing.dataCollected', e => { for (const v of e.value) chunks.push(v); });
const done = new Promise(r => cdp.once('Tracing.tracingComplete', r));
if (process.env.TR) await cdp.send('Tracing.start', {transferMode: 'ReportEvents', traceConfig: {recordMode: 'recordAsMuchAsPossible', includedCategories: ['devtools.timeline', 'toplevel', 'disabled-by-default-devtools.timeline', 'v8.execute']}});
const T0 = await run(async () => performance.timeOrigin + performance.now(), null);
let m0 = await mark('pruefen'); await tapSel('[data-vr1="mittel"]');
const P1 = await until(async () => { const s = document.querySelector('.vr1st'); return {ok: /Befund/.test(s && s.textContent || ''), st: s && s.textContent}; }, null, 60000);
const L1 = await ltSince(m0.lt); console.log('PRUEFEN', JSON.stringify({vx: await run(async () => ({last: VXR1.last, w: VXR1.w ? 'lebt' : String(VXR1.w), slices: VXR1.slices}), null), ms: P1.waitMs, lt: L1.lt, gap: L1.gapMax, big: L1.big, fx: L1.fx}));
await p.waitForTimeout(800);
m0 = await mark('anwenden'); const tAp = await run(async () => performance.now(), null); await tapSel('[data-vr1a="ap"]');
const A1 = await until(async o => { const v = SYNQUENZER.vr1Ver(o.id); return {ok: v.ready && !v.busy}; }, {id}, 120000);
const tRd = await run(async () => performance.now(), null);
await p.waitForTimeout(1500); const hh = await settle();
const L3 = await ltSince(m0.lt); console.log('ANWENDEN', JSON.stringify({ms: A1.waitMs, tAp: Math.round(tAp), tReady: Math.round(tRd), lt: L3.lt, gap: L3.gapMax, big: L3.big.slice(-12), fx: L3.fx, hash: hh, hi: await run(async () => SYNQUENZER.vr1HashInfo ? SYNQUENZER.vr1HashInfo() : null, null), vx: await run(async () => ({last: VXR1.last, w: VXR1.w ? 'lebt' : String(VXR1.w), slices: VXR1.slices, runs: VXR1.runs, g4: typeof G4 !== 'undefined' ? G4.how : null, wp: typeof WP !== 'undefined' ? WP.how : null}), null)}));
if (process.env.TR) { await cdp.send('Tracing.end'); await done; }
fs.writeFileSync(OUT, JSON.stringify(chunks));
console.log('LOAF', JSON.stringify(await run(async () => window.__loaf, null)));
await b.close();
