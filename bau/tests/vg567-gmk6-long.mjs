// QA G-MK6: 3 minutes playback (P 390x844, CDP touch) with MS 2000 sequences on 3 tracks, scene switches and SEQ edits while playing.
// Recorded: master + raw worklet outputs of t0, t2, t3. argv: minutes, 'base' (no edits)
import {open, sleep, OUT, check, done} from './vg567-gmk6-tl.mjs';
import {setupProject} from './vg567-gmk6-setup.mjs';
import {recStart, recAnalyse} from './v3-qa-gmk2a-rec.mjs';
import fs from 'fs';
const MIN = +(process.argv[2] || 3), BASE = process.argv[3] === 'base', TAG = BASE ? 'base' : 'long';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
T.knobList = async (k, re, scroll = true) => { await T.tapMk(k, 300); if (scroll) { await E(src => { const rx = new RegExp(src); const b = [...document.querySelectorAll('#popLayer .pop button')].find(b => rx.test(b.textContent.trim())); b && b.scrollIntoView({block: 'center'}); }, re.source); await sleep(150); } const r = await T.tapPop(re); await sleep(650); return r ? 'ok' : 'no list item ' + re + ' ' + JSON.stringify(await T.popTexts()); };
T.matrixSteps = async () => { const k = await E(() => { const e = [...document.querySelectorAll('#synthSheet .mrow2')].find(e => /SCHRITTE/.test(e.textContent)); return e && e.dataset.k; }); if (!k) return 'no SCHRITTE row'; await T.tapMk(k, 400); return (await T.steps()) ? 'ok' : 'not open'; };
T.paint = async (c0, c1, fy) => { const I = await T.steps(); if (!I) return 'no steps'; const a = I.cols[c0], b = I.cols[c1]; const y = a.y + a.h * fy; await T.down(a.x + a.w / 2, y); await sleep(30); await T.glide(a.x + a.w / 2, y, b.x + b.w / 2, b.y + b.h * fy, 14, 25); await T.up(); await sleep(200); return 'ok'; };
T.colDrag = async (c, dy, steps = 30, ms = 30) => { const I = await T.steps(); if (!I) return 'no steps'; const a = I.cols[c]; const x = a.x + a.w / 2, y = a.y + a.h / 2; await T.down(x, y); await sleep(30); await T.glide(x, y, x, y + dy, steps, ms); await T.up(); await sleep(200); return 'ok'; };
const seqS = t => E(t => { const s = SYNQUENZER.mkGet(t); return s ? s.t[0].seq : null; }, t);
const short = s => s ? `on${s.on} L${s.last} ty${s.type} r${s.run} ks${s.ks} res${s.res} ` + s.q.map(q => q.k + (q.m ? 'S' : 'G')).join('/') : '-';
console.log('setup', JSON.stringify(await setupProject(E)).slice(0, 300));
await E(() => { SYNQUENZER.selectTrack(0); });
await T.tapTxt('button.scn', /^▶\s*1/); await sleep(100);
if (!(await E(() => SYNQUENZER.runtime().playing))) await T.tapSel('#bPlay');
await sleep(300);
console.log('rec', JSON.stringify(await recStart(E, MIN * 60 + 40, [0, 2, 3])));
// beat map + seq config poll
await E(() => { const Q = window.__q; Q.bm = []; Q.bpoll = setInterval(() => { const c = AU.ctx.currentTime; Q.bm.push([c, t2b(c), SYNQUENZER.runtime().bpm, [0, 2, 3].map(t => { const m = SYNQUENZER.mkGet(t); return m ? [m.t[0].seq.on, m.t[0].seq.res, m.t[0].seq.ks, m.t[0].seq.q.map(q => q.k * 2 + q.m)] : null; })]); }, 100); });
const res = {};
const act = async (name, fn) => { const t = await E(() => (window.__pn = Math.round(performance.now()), [AU.ctx.currentTime, audBeat(), window.__pn])); let r; try { r = await fn(); } catch (e) { r = 'ERR ' + e.message; } res[name] = r; await E(([n, t, b, r]) => window.__q.acts.push({n, t, b, r, pn: window.__pn, t1: AU.ctx.currentTime}), [name, t[0], t[1], typeof r === 'object' ? JSON.stringify(r).slice(0, 80) : String(r)]); const nm = await E(() => SYNQUENZER.undoInfo().n + ' bpm ' + SYNQUENZER.runtime().bpm); console.log(`[${(t[1] / 4).toFixed(1)}] ${name} → ${typeof r === 'object' ? JSON.stringify(r).slice(0, 200) : r}   ## u${nm} | t2 ${short(await seqS(2))} | t3 ${short(await seqS(3))}`); return r; };
const atBar = bar => p.waitForFunction(x => audBeat() >= x, bar * 4 + 0.3, {timeout: 400000, polling: 10});
if (!BASE) {
await atBar(2); await act('open editor pad (t2) → EDIT-WAHL 2 SEQ → SCHRITTE', async () => { await T.openEd(2); const a = await T.w2(/^11 SEQ/); await sleep(600); return [a, await T.matrixSteps()]; });
await atBar(3); await act('SEQ 1 (gate): paint columns 9–12 at the top (touch)', async () => [await T.paint(8, 11, .12), (await seqS(2)).q[0].v.join(',')]);
await atBar(5); await act('SEQ 2 tab → CUTOFF (Glatt): drag columns 1, 5, 9 slowly up and down while it runs', async () => { await T.tapMk('s1', 300); const out = []; for (const c of [0, 4, 8]) { out.push(await T.colDrag(c, -40, 30, 30)); } out.push(await T.colDrag(4, 60, 30, 30)); return [out.join(','), (await seqS(2)).q[1].v.join(',')]; });
await atBar(7); await act('SEQ 3 tab → PAN: paint all 16 columns in the middle row (≈ 0)', async () => { await T.tapMk('s2', 300); const a = await T.paint(0, 7, .5); const b = await T.paint(8, 15, .5); return [a, b, (await seqS(2)).q[2].v.join(',')]; });
await atBar(9); await act('scene 2 (API, editor open)', () => E(() => { SYNQUENZER.launchScene(1); return 1; }));
await atBar(10); await act('SEQ 2 → ● AUFN. → GERÄT/SPIEL, CUTOFF slow drag ~2.5 s (song notes, KEY SYNC aus)', async () => { await T.tapMk('s1', 300); await T.tapMk('rec', 400); const pn = await T.panel(); await T.sweep('k0', -110, 70, 35); let n = 0; for (let k = 0; k < 30 && !n; k++) { await sleep(150); n = await E(() => AU.synth[2].mkRecN || 0); } return {armed: !!pn.rec, sel: pn.sel, recN: n, last: await E(() => AU.synth[2].mkRecLast), cut: (await E(() => SYNQUENZER.mkGet(2).t[0].f.cut)), top: await E(() => SYNQUENZER.undoInfo().top.label)}; });
await atBar(13); await act('EDIT-WAHL 2 SEQ, SHIFT → AUFLÖSUNG 1/16 → 1/8 (list)', async () => { const a = await T.w2(/^11 SEQ/); await sleep(600); await T.tapMk('shift', 300); return [a, await T.knobList('k3', /^1\/8$/), (await seqS(2)).res]; });
await atBar(15); await act('TYP → Wechsel 1 (list)', async () => [await T.knobList('k0', /^Wechsel 1$/), (await seqS(2)).type]);
await atBar(17); await act('KEY SYNC aus → Timbre → aus (list)', async () => { const a = await T.knobList('k2', /^Timbre$/); await sleep(1500); const b = await T.knobList('k2', /^aus$/); return [a, b, (await seqS(2)).ks]; });
await atBar(19); await act('SHIFT back; SEQ AN → aus, one bar later → an', async () => { await T.tapMk('shift', 300); const a = await T.knobList('k0', /^aus$/); await sleep(2000); const b = await T.knobList('k0', /^an$/); return [a, b, (await seqS(2)).on]; });
await atBar(21); await act('SEQUENZ 1 (gate): BEWEGUNG Stufe → Glatt → Stufe', async () => { const s = await T.knobList('k1', /^SEQ 1$/); const a = await T.knobList('k3', /^Glatt$/); await sleep(1800); const b = await T.knobList('k3', /^Stufe$/); return [s, a, b, (await seqS(2)).q[0].m]; });
await atBar(23); await act('SEQUENZ 3 (pan): ZIEL drag up 50 px through targets, then list → PAN', async () => { await T.knobList('k1', /^SEQ 3$/); await T.sweep('k2', -50, 25, 40); const k1 = (await seqS(2)).q[2].k; const b = await T.knobList('k2', /^PAN/); return [k1, b, (await seqS(2)).q[2].k]; });
await atBar(25); await act('BPM 112 → 124 (setBpm)', () => E(() => { SYNQUENZER.setBpm(124); return SYNQUENZER.runtime().bpm; }));
await atBar(26); await act('scene 3 (API) + editor → lead (t3) SEQ → SCHRITTE: paint SEQ 1 (pitch) columns 1–4 up', async () => { await E(() => SYNQUENZER.launchScene(2)); await T.openEd(3); const a = await T.w2(/^11 SEQ/); await sleep(600); const b = await T.matrixSteps(); const c = await T.paint(0, 3, .3); return [a, b, c, (await seqS(3)).q[0].v.join(',')]; });
await atBar(29); await act('lead: back to GERÄT, LÄNGE drag down (≈ 8)', async () => { await T.tapMk('back', 400); await T.sweep('k4', 45, 25, 30); return (await seqS(3)).last; });
await atBar(31); await act('lead: SHIFT + 5 → Tauschen 1⇄2, then ↶ (header)', async () => { await sleep(700); await T.tapMk('shift', 250); await T.tapMk('n4', 400); const a = await T.tapPop(/^1⇄2$/); await sleep(1500); const k = (await seqS(3)).q.map(q => q.k); await T.tapTxt('#synthSheet .hb.ur', /^↶$/, 300); return [!!a, k, (await seqS(3)).q.map(q => q.k)]; });
await atBar(33); await act('undo ×3 / redo ×3 (header)', async () => { for (let k = 0; k < 3; k++) await T.tapTxt('#synthSheet .hb.ur', /^↶$/, 200); for (let k = 0; k < 3; k++) await T.tapTxt('#synthSheet .hb.ur', /^↷$/, 200); return E(() => SYNQUENZER.undoInfo().n); });
await atBar(35); await act('ECO on (forceNative)', () => E(() => { SYNQUENZER.forceNative(true); return 1; }));
await atBar(37); await act('ECO off', () => E(() => { SYNQUENZER.forceNative(false); return 1; }));
await atBar(39); await act('lead: engine MS 2000 → VA → MS 2000 (header)', async () => { const a = await T.tapTxt('#synthSheet button', /^VA ?▾?$/) || (await (async () => { const c = await T.rectText('#synthSheet button', /^MS ?2000 ▾$/); if (!c) return null; await T.tap(c.cx, c.cy, 400); return T.tapPop(/^VA$/); })()); await sleep(1800); const c2 = await T.rectText('#synthSheet button', /^VA ▾$/); if (c2) { await T.tap(c2.cx, c2.cy, 400); await T.tapPop(/MS ?2000/); } await sleep(500); return [!!a, await E(() => SYNQUENZER.getSound(3).engine), short(await seqS(3))]; });
await atBar(42); await act('scene 4 (API)', () => E(() => { SYNQUENZER.launchScene(3); return 1; }));
await atBar(43); await act('lead: OSZ 1 WELLE → Speicherwelle (list), SEQ 2 ZIEL → OSZ 1 STEUER 2 (wave sequence)', async () => { const a = await T.w('w1', /^3 OSZ 1/); await sleep(600); const b = await T.knobList('k0', /^Speicherwelle/); const c = await T.w2(/^11 SEQ/); await sleep(600); const d = await T.knobList('k1', /^SEQ 2$/); const e = await T.knobList('k2', /^OSZ 1 STEUER 2/); return [a, b, c, d, e, (await E(() => SYNQUENZER.mkGet(3).t[0].o1.w)), short(await seqS(3))]; });
await atBar(46); await act('BPM 124 → 96 (setBpm)', () => E(() => { SYNQUENZER.setBpm(96); return SYNQUENZER.runtime().bpm; }));
await atBar(48); await act('close editor (✕), scene 1 by touch', async () => { await T.closePop(); await T.tapTxt('#synthSheet button', /^✕$/); await sleep(500); return !!(await T.tapTxt('button.scn', /^▶\s*1/)); });
await atBar(50); await act('scene 2 by touch', async () => !!(await T.tapTxt('button.scn', /^▶\s*2/)));
await atBar(52); await act('editor bass (t0): SEQ → SCHRITTE, paint columns 1–8 high (cutoff)', async () => { await T.openEd(0); const a = await T.w2(/^11 SEQ/); await sleep(600); const b = await T.matrixSteps(); const c = await T.paint(0, 7, .15); return [a, b, c, (await seqS(0)).q[0].v.join(',')]; });
await atBar(55); await act('bass: ● AUFN. on SEQ 2, then cancel (● AUFN. again in SCHRITTE)', async () => { await T.tapMk('s1', 300); await T.tapMk('rec', 400); const a = (await T.panel()).rec; await sleep(1500); const b = await T.matrixSteps(); await T.tapMk('rec', 400); const c = (await T.panel()).rec; return [!!a, b, c || null, await E(() => SYNQUENZER.undoInfo().top.label)]; });
await atBar(58); await act('close editor, scene 3 by touch', async () => { await T.closePop(); await T.tapTxt('#synthSheet button', /^✕$/); await sleep(500); return !!(await T.tapTxt('button.scn', /^▶\s*3/)); });
await atBar(62); await act('scene 1 by touch', async () => !!(await T.tapTxt('button.scn', /^▶\s*1/)));
await atBar(64); await act('editor pad: SEQ AN aus (list) while the gate runs, then ↶', async () => { await T.openEd(2); const a = await T.w2(/^11 SEQ/); await sleep(600); const b = await T.knobList('k0', /^aus$/); await sleep(2000); await T.tapTxt('#synthSheet .hb.ur', /^↶$/, 300); return [a, b, (await seqS(2)).on]; });
await atBar(67); await act('pad: SHIFT + 5 → Neu ALLE (sequences silent), then ↶', async () => { await sleep(700); await T.tapMk('shift', 250); await T.tapMk('n4', 400); const a = await T.tapPop(/^ALLE$/); await sleep(2500); await T.tapTxt('#synthSheet .hb.ur', /^↶$/, 300); return [!!a, short(await seqS(2))]; });
await atBar(70); await act('close editor', async () => { await T.closePop(); return !!(await T.tapTxt('#synthSheet button', /^✕$/)); });
}
await atBar(Math.min(76, MIN * 25)); const tStop = await E(() => AU.ctx.currentTime);
await act('■ stop', async () => { await T.closePop(); await E(() => SYNQUENZER.closeEditor && SYNQUENZER.closeEditor()); await sleep(200); return T.tapSel('#bPlay').then(b => !!b); });
await sleep(4500);
const fin = await E(() => ({voices: SYNQUENZER.voices().filter(v => v.state !== 'off'), live: SYNQUENZER.runtime().liveVoices, te: SYNQUENZER.tickErrors(), playing: SYNQUENZER.runtime().playing}));
await E(() => clearInterval(window.__q.bpoll));
const bm = await E(() => window.__q.bm);
const A = await recAnalyse(E, tStop);
// tail level after stop (stuck sound?): master RMS in the last 2 s
const tail = await E(() => new Promise(r => { const a = AU.ctx.createAnalyser(); a.fftSize = 2048; AU.M.ceil.connect(a); const b = new Float32Array(2048); let pk = 0; const iv = setInterval(() => { a.getFloatTimeDomainData(b); for (const v of b) pk = Math.max(pk, Math.abs(v)); }, 20); setTimeout(() => { clearInterval(iv); r(+(20 * Math.log10(pk + 1e-9)).toFixed(1)); }, 1500); }));
// grid explanation: a flag within ±4 ms of a 1/16 (or the seq resolution) grid point of the song while a Stufe seq on AMP/CUTOFF/PAN acts on that track
const beatAt = t => { let lo = 0, hi = bm.length - 1, r = 0; while (lo <= hi) { const m = (lo + hi) >> 1; if (bm[m][0] <= t) { r = m; lo = m + 1; } else hi = m - 1; } const a = bm[r], b = bm[Math.min(bm.length - 1, r + 1)]; const spb = 60 / a[2]; return [a[1] + (t - a[0]) / spb, spb, a]; };
const SRES = [1 / 48, 1 / 32, 1 / 24, 1 / 16, 1 / 12, .09375, .125, 1 / 6, .1875, .25, 1 / 3, .375, .5, 2 / 3, .75, 1];
const onGrid = (t, tr) => { const [b, spb, row] = beatAt(t); const ti = [0, 2, 3].indexOf(tr); const cfgs = ti >= 0 ? [row[3][ti]] : row[3]; const g = [.25]; for (const c of cfgs) if (c) g.push(SRES[c[1]] * 4); return g.some(gb => { const x = b / gb; return Math.abs(x - Math.round(x)) * gb * spb <= .006; }); };
console.log('recorded', A.secs, 's; notes', A.notes, '; fps', A.fps, '; longtasks', JSON.stringify(A.lt), '; stalls', JSON.stringify(A.stall), '; late notes', A.late.length, JSON.stringify(A.late.slice(0, 20)));
const byAct = f => { const a = A.acts.filter(a => f.t >= a.t - .05).pop(); return a ? a.n.slice(0, 60) + ' +' + (f.t - a.t).toFixed(2) : '-'; };
const rem = {};
for (const tap in A.taps) { const X = A.taps[tap]; const tr = tap === 'master' ? null : +tap.slice(1);
  const left = X.flags.filter(f => !onGrid(f.t, tr)), sl = X.sflags.filter(f => !onGrid(f.t, tr)), dl = X.d2f.filter(f => !onGrid(f.t, tr));
  rem[tap] = {flags: left, sflags: sl, d2f: dl};
  console.log(tap, 'peak', X.peakDb, 'NaN', X.nan, 'flags', X.flags.length, 'off-grid', left.length, '| sflags', X.sflags.length, 'off-grid', sl.length, '| d2f', X.d2f.length, 'off-grid', dl.length, '| drops', X.drops.length, JSON.stringify(X.drops.slice(0, 6)));
  const g = {}; for (const f of left.concat(sl.map(x => Object.assign({k: 's'}, x)), dl.map(x => Object.assign({k: 'd'}, x)))) { const k = byAct(f).replace(/ \+[\d.]+$/, ''); (g[k] = g[k] || []).push([f.k || 'f', f.t, f.db, byAct(f).match(/\+([\d.]+)$/)?.[1]]); } for (const k in g) console.log('   ', k.padEnd(62), g[k].length, JSON.stringify(g[k].slice(0, 6))); }
check('recorded ≥ ' + Math.round(MIN * 56 - 5) + ' s', A.secs >= MIN * 56 - 5, A.secs);
check('no NaN, master peak < 0 dBFS', Object.values(A.taps).every(x => x.nan === 0) && A.taps.master.peakDb < 0, Object.fromEntries(Object.entries(A.taps).map(([k, x]) => [k, [x.nan, x.peakDb]])));
check('no dropouts', Object.values(A.taps).every(x => x.drops.length === 0), Object.fromEntries(Object.entries(A.taps).map(([k, x]) => [k, x.drops.length])));
check('no stuck notes 4.5 s after ■ (voices, master tail)', fin.voices.length === 0 && !fin.live && tail < -60, {fin, tail});
check('tickErrors 0', !fin.te, fin.te);
check('no late notes (scheduled ≥ 3 ms ahead)', A.late.length === 0, A.late.slice(0, 10));
check('no console errors', errs.length === 0, errs.slice(0, 5));
check('no longtask > 50 ms / main-thread stall > 60 ms', !A.lt.some(x => x[0] > 50) && !A.stall.length, {lt: A.lt.map(([d, st]) => { const a = A.acts.filter(a => a.pn != null && a.pn <= st + 5).pop(); return d + ' ms after ' + (a ? a.n.slice(0, 40) + ' +' + (st - a.pn) + 'ms' : '?'); }), stall: A.stall.map(([d, st]) => { const a = A.acts.filter(a => a.pn != null && a.pn <= st + 5).pop(); return d + ' ms after ' + (a ? a.n.slice(0, 40) + ' +' + (st - a.pn) + 'ms' : '?'); })});
check('all actions ran (no ERR / missing item)', !Object.values(res).some(r => /ERR|no /.test(JSON.stringify(r))), Object.entries(res).filter(([k, r]) => /ERR|no /.test(JSON.stringify(r))));
check('M-KLICK: flags not on the note / seq grid (per tap)', Object.values(rem).every(x => x.flags.length === 0), Object.fromEntries(Object.entries(rem).map(([k, x]) => [k, x.flags.length])));
check('raw taps: sustained-zone / discontinuity detectors off the grid', ['t0', 't2', 't3'].every(k => !rem[k] || (rem[k].sflags.length === 0 && rem[k].d2f.length === 0)), Object.fromEntries(Object.entries(rem).map(([k, x]) => [k, [x.sflags.length, x.d2f.length]])));
fs.writeFileSync(OUT + TAG + '-result.json', JSON.stringify({A: Object.assign({}, A, {taps: Object.fromEntries(Object.entries(A.taps).map(([k, x]) => [k, Object.assign({}, x, {snips: undefined})]))}), fin, errs, res, rem, bm: bm.filter((_, i) => i % 5 === 0)}, null, 1));
fs.writeFileSync(OUT + TAG + '-project.json', await E(() => SYNQUENZER.serialize()));
const NS = await E(() => window.__q.n); const CH = 1 << 20;
for (let j = 0; j < 4; j++) { const parts = []; for (let o = 0; o < NS; o += CH) parts.push(Buffer.from(await E(([o, CH, j]) => { const x = window.__q.bufs[j].subarray(o, Math.min(o + CH, window.__q.n)); let s = ''; const u = new Uint8Array(x.buffer, x.byteOffset, x.byteLength); for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); return btoa(s); }, [o, CH, j]), 'base64')); fs.writeFileSync(OUT + TAG + '-tap' + j + '.f32', Buffer.concat(parts)); }
fs.writeFileSync(OUT + TAG + '-meta.json', JSON.stringify(await E(() => { const Q = window.__q; return {sr: Q.sr, f0: Q.f0, n: Q.n, taps: Q.taps, notes: [...Q.notes.values()].map(n => [n.time, n.track, n.src, n.out, n.dur]), acts: Q.acts}; })));
await T.br.close(); done();
