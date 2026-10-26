// QA G-MK4: 3 minutes playback (P 428x926, CDP touch) with MS 2000 program effects on 4 tracks, scene switches and effect edits
// while playing. Recorded: master + raw worklet outputs of t1, t2, t3. argv: minutes, 'base' (no edits)
import {open, sleep, OUT, check, done} from './v3-qa-gmk4-tl.mjs';
import {setupProject} from './v3-qa-gmk4-setup.mjs';
import {recStart, recAnalyse} from './v3-qa-gmk2a-rec.mjs';
import fs from 'fs';
const MIN = +(process.argv[2] || 3), BASE = process.argv[3] === 'base', TAG = BASE ? 'base' : 'long';
const T = await open(); const {p, E, errs} = T;
// short list delay to avoid the tap-through shield (a drag ≤ 500 ms after a list pick on the same spot is eaten)
T.knobList = async (k, re) => { await T.tapMk(k, 300); const r = await T.tapPop(re); await sleep(600); return r ? 'ok' : 'no list item ' + re + ' ' + JSON.stringify(await T.popTexts()); };
console.log('setup', JSON.stringify(await setupProject(E)));
await E(() => { SYNQUENZER.selectTrack(0); });
await T.tapTxt('button.scn', /^▶\s*1/); await sleep(100);
if (!(await E(() => SYNQUENZER.runtime().playing))) await T.tapSel('#bPlay');
await sleep(300);
console.log('rec', JSON.stringify(await recStart(E, MIN * 60 + 40, [1, 2, 3])));
// delay-state poll for the echo-aware analysis
await E(() => { const Q = window.__q; Q.dl = []; Q.dpoll = setInterval(() => { const bpm = SYNQUENZER.runtime().bpm; const row = [AU.ctx.currentTime, bpm]; for (const t of [0, 1, 2, 3]) { const m = SYNQUENZER.mkGet(t); row.push(m ? [m.dly.dep, m.dly.sync ? MKUI_DS(m.dly.note, bpm) : Math.pow(2, 10.45 * m.dly.time / 127) / 1000] : null); } Q.dl.push(row); }, 100); window.MKUI_DS = (n, bpm) => [1/32, 1/24, 1/16, 1/12, 3/32, 1/8, 1/6, 3/16, 1/4, 1/3, 3/8, 1/2, 2/3, 3/4, 1][Math.round(n)] * 4 * 60 / bpm; });
const res = {};
const act = async (name, fn) => { const t = await E(() => (window.__pn = Math.round(performance.now()), [AU.ctx.currentTime, audBeat(), window.__pn])); let r; try { r = await fn(); } catch (e) { r = 'ERR ' + e.message; } res[name] = r; await E(([n, t, b, r]) => window.__q.acts.push({n, t, b, r, pn: window.__pn, t1: AU.ctx.currentTime}), [name, t[0], t[1], typeof r === 'object' ? JSON.stringify(r).slice(0, 80) : String(r)]); const nm = await E(() => [0, 1, 2, 3].map(t => { const m = SYNQUENZER.mkGet(t); return SYNQUENZER.getSound(t).name + ':' + (m ? m.mfx.type + '/' + m.mfx.dep + ' d' + m.dly.type + '/' + m.dly.dep + (m.dly.sync ? 'n' + m.dly.note : 't' + m.dly.time) + ' eq' + m.eq.lg + '/' + m.eq.hg : '-'); }).join(' | ') + ' · u' + SYNQUENZER.undoInfo().n + ' bpm ' + SYNQUENZER.runtime().bpm); console.log(`[${(t[1] / 4).toFixed(1)}] ${name} → ${typeof r === 'object' ? JSON.stringify(r).slice(0, 160) : r}   ## ${nm}`); return r; };
const atBar = bar => p.waitForFunction(x => audBeat() >= x, bar * 4 + 0.3, {timeout: 400000, polling: 10});
const pm = t => E(t => { const m = SYNQUENZER.mkGet(t); return {mfx: m.mfx, dly: m.dly, eq: m.eq}; }, t);
if (!BASE) {
await atBar(2); await act('open editor Synth 2 (pluck, delay 1/8) → EDIT-WAHL 2 DELAY', async () => { await T.openEd(1); return T.w2(/^6 DELAY/); });
await atBar(3); await act('DELAY TIEFE slow sweep up to ~127 and back to ~60 (touch)', async () => { await T.sweep('k3', -90, 60, 30); const a = (await pm(1)).dly.dep; await T.sweep('k3', 90, 60, 30); return [a, (await pm(1)).dly.dep]; });
await atBar(7); await act('NOTE list → 1/4 (echo ringing)', async () => [await T.knobList('k2', /^1\/4$/), (await pm(1)).dly]);
await atBar(9); await act('NOTE list → 1/16', async () => [await T.knobList('k2', /^1\/16$/), (await pm(1)).dly]);
await atBar(10); await act('NOTE drag (continuous knob) 1/16 → ~3/8', async () => { await T.sweep('k2', -60, 40, 25); return (await pm(1)).dly; });
await atBar(12); await act('TYP Stereo → Kreuz → L/R → Stereo', async () => { const a = await T.knobList('k0', /^Kreuz$/); await sleep(1200); const b = await T.knobList('k0', /^L\/R$/); await sleep(1200); const c = await T.knobList('k0', /^Stereo$/); return [a, b, c, (await pm(1)).dly]; });
await atBar(15); await act('TEMPO SYNC aus → ZEIT sweep → an', async () => { const a = await T.knobList('k1', /^aus$/); await T.sweep('k2', -50, 40, 25); await T.sweep('k2', 30, 30, 25); const z = (await pm(1)).dly; const b = await T.knobList('k1', /^an$/); return [a, z, b, (await pm(1)).dly]; });
await atBar(18); await act('scene 2 (API, editor open)', () => E(() => { SYNQUENZER.launchScene(1); return 1; }));
await atBar(19); await act('BPM 112 → 124 (setBpm) while echoes ring', () => E(() => { SYNQUENZER.setBpm(124); return SYNQUENZER.runtime().bpm; }));
await atBar(21); await act('MOD-FX: TYP Cho/Flg → Ensemble, TIEFE sweep up', async () => { await T.w2(/^5 MOD-FX/); const a = await T.knobList('k0', /^Ensemble$/); await T.sweep('k2', -70, 50, 25); return [a, (await pm(1)).mfx]; });
await atBar(24); await act('MOD-FX TYP → Phaser → Cho/Flg (flanger at high TIEFE)', async () => { const a = await T.knobList('k0', /^Phaser$/); await sleep(1500); const b = await T.knobList('k0', /^Chorus\/Flanger$/); return [a, b, (await pm(1)).mfx]; });
await atBar(26); await act('MOD-FX TEMPO sweep up and down', async () => { await T.sweep('k1', -60, 40, 25); await T.sweep('k1', 60, 40, 25); return (await pm(1)).mfx; });
await atBar(28); await act('MOD-FX TIEFE sweep to 0 (aus)', async () => { await T.sweep('k2', 200, 40, 20); return (await pm(1)).mfx; });
await atBar(30); await act('scene 3 (API) + editor → Synth 3 pad (Ensemble + Kreuz delay)', async () => { await E(() => SYNQUENZER.launchScene(2)); return T.openEd(2); });
await atBar(31); await act('pad EQ: HOCH-GAIN sweep −6 → +6 → −8, TIEF-FREQ sweep', async () => { await T.w2(/^7 EQ/); await T.sweep('k3', -50, 40, 25); await T.sweep('k3', 70, 40, 25); await T.sweep('k0', -60, 40, 25); return (await pm(2)).eq; });
await atBar(34); await act('pad EQ: SHIFT + OKT ▲ ×2 (last value +0.5 dB each)', async () => { await T.tapMk('shift'); await T.tapMk('octu'); await T.tapMk('shift'); await T.tapMk('octu'); return (await pm(2)).eq; });
await atBar(35); await act('pad DELAY TIEFE sweep to 0 and back up', async () => { await T.w2(/^6 DELAY/); await T.sweep('k3', 150, 30, 20); const a = (await pm(2)).dly.dep; await sleep(1500); await T.sweep('k3', -60, 30, 20); return [a, (await pm(2)).dly]; });
await atBar(38); await act('undo ×3 / redo ×3 (header)', async () => { for (let k = 0; k < 3; k++) await T.tapTxt('.hb.ur', /^↶$/, 150); for (let k = 0; k < 3; k++) await T.tapTxt('.hb.ur', /^↷$/, 150); return E(() => SYNQUENZER.undoInfo().n); });
await atBar(40); await act('editor Synth 2: number key → "Pluck Trocken" (program change while echo rings)', async () => { await T.openEd(1); let nm = null; for (let k = 0; k < 8 && nm !== 'Pluck Trocken'; k++) { await T.tapMk('n' + k, 250); nm = await E(() => SYNQUENZER.getSound(1).name); } return [nm, (await pm(1)).dly]; });
await atBar(43); await act('Synth 2: number key → "Pluck Echo" (delay back)', async () => { let nm = null; for (let k = 0; k < 8 && nm !== 'Pluck Echo'; k++) { await T.tapMk('n' + k, 250); nm = await E(() => SYNQUENZER.getSound(1).name); } return [nm, (await pm(1)).dly]; });
await atBar(46); await act('Synth 2: SHIFT + 3 (Init) then undo', async () => { await T.tapMk('shift'); await T.tapMk('n2', 200); const a = (await pm(1)).dly.dep; await sleep(1500); await T.tapTxt('.hb.ur', /^↶$/, 200); return [a, (await pm(1)).dly]; });
await atBar(48); await act('scene 4 (API)', () => E(() => { SYNQUENZER.launchScene(3); return 1; }));
await atBar(49); await act('editor Synth 4 lead (Phaser + L/R delay): DELAY ZEIT sweep while playing', async () => { await T.openEd(3); await T.w2(/^6 DELAY/); await T.sweep('k2', -40, 40, 25); await T.sweep('k2', 40, 40, 25); return (await pm(3)).dly; });
await atBar(52); await act('lead: TEMPO SYNC an, NOTE list 1/6', async () => { const a = await T.knobList('k1', /^an$/); const b = await T.knobList('k2', /^1\/6$/); return [a, b, (await pm(3)).dly]; });
await atBar(54); await act('ECO on (forceNative)', () => E(() => { SYNQUENZER.forceNative(true); return 1; }));
await atBar(57); await act('ECO off', () => E(() => { SYNQUENZER.forceNative(false); return 1; }));
await atBar(59); await act('lead: engine MS 2000 → VA → MS 2000 (header) while the delay rings', async () => { const a = await T.tapTxt('button', /^VA$/); await sleep(1800); const b = await T.tapTxt('button', /^MS ?2000$/); await sleep(300); return [!!a, !!b, await E(() => SYNQUENZER.getSound(3).engine), (await pm(3)).dly]; });
await atBar(62); await act('lead: 🎲', async () => { await T.closePop(); await T.tapTxt('.hb', /^🎲$/); return pm(3); });
await atBar(64); await act('BPM 124 → 96 (setBpm)', () => E(() => { SYNQUENZER.setBpm(96); return SYNQUENZER.runtime().bpm; }));
await atBar(66); await act('close editor (✕), scene 1 by touch', async () => { await T.closePop(); await T.tapTxt('button', /^✕$/); await sleep(500); return !!(await T.tapTxt('button.scn', /^▶\s*1/)); });
await atBar(68); await act('scene 2 by touch', async () => !!(await T.tapTxt('button.scn', /^▶\s*2/)));
await atBar(70); await act('editor Synth 3 pad: MOD-FX TYP Ensemble → Phaser, TIEFE sweep', async () => { await T.openEd(2); await T.w2(/^5 MOD-FX/); const a = await T.knobList('k0', /^Phaser$/); await T.sweep('k2', 60, 40, 25); await T.sweep('k2', -60, 40, 25); return [a, (await pm(2)).mfx]; });
await atBar(73); await act('close editor, scene 3 by touch', async () => { await T.closePop(); await T.tapTxt('button', /^✕$/); await sleep(500); return !!(await T.tapTxt('button.scn', /^▶\s*3/)); });
await atBar(76); await act('scene 1 by touch', async () => !!(await T.tapTxt('button.scn', /^▶\s*1/)));
}
await atBar(MIN * 28 * 112 / 112); const tStop = await E(() => AU.ctx.currentTime);
await act('■ stop', async () => { await T.closePop(); await E(() => SYNQUENZER.closeEditor && SYNQUENZER.closeEditor()); await sleep(200); return T.tapSel('#bPlay').then(b => !!b); });
await sleep(4500);
const fin = await E(() => ({voices: SYNQUENZER.voices().filter(v => v.state !== 'off'), live: SYNQUENZER.runtime().liveVoices, te: SYNQUENZER.tickErrors(), playing: SYNQUENZER.runtime().playing}));
await E(() => clearInterval(window.__q.dpoll));
const dl = await E(() => window.__q.dl);
const A = await recAnalyse(E, tStop);
// echo-aware filter: a flag on a track tap (or master) at time t is explained by an echo if some onset o of a track with delay
// dep > 0 satisfies |t − (o + k·D(o))| ≤ 12 ms for k = 1…16 (D = delay time at the onset; L/R and Kreuz: same D)
const notes = await E(() => [...window.__q.notes.values()].filter(n => n.time != null).map(n => [n.time, n.track, n.dur]));
const dAt = (tr, t) => { let lo = 0, hi = dl.length - 1, r = 0; while (lo <= hi) { const m = (lo + hi) >> 1; if (dl[m][0] <= t) { r = m; lo = m + 1; } else hi = m - 1; } const x = dl[r][2 + tr]; return x && x[0] > 0 ? x[1] : 0; };
const echoT = {}; for (const tr of [0, 1, 2, 3]) { echoT[tr] = []; for (const [t, ntr, d] of notes) if (ntr === tr) { const D = dAt(tr, t); if (D > 0) for (let k = 1; k <= 16; k++) { echoT[tr].push(t + k * D); if (d != null) echoT[tr].push(t + d + k * D); } } echoT[tr].sort((a, b) => a - b); }
const nearEcho = (trs, t) => trs.some(tr => { const a = echoT[tr]; let lo = 0, hi = a.length - 1; while (lo <= hi) { const m = (lo + hi) >> 1; if (Math.abs(a[m] - t) <= .015) return true; if (a[m] < t) lo = m + 1; else hi = m - 1; } return false; });
console.log('recorded', A.secs, 's; notes', A.notes, '; fps', A.fps, '; longtasks', JSON.stringify(A.lt), '; stalls', JSON.stringify(A.stall), '; late notes', A.late.length, JSON.stringify(A.late.slice(0, 20)));
const byAct = f => { const a = A.acts.filter(a => f.t >= a.t - .05).pop(); return a ? a.n.slice(0, 50) + ' +' + (f.t - a.t).toFixed(2) : '-'; };
const rem = {};
for (const tap in A.taps) { const X = A.taps[tap]; const trs = tap === 'master' ? [0, 1, 2, 3] : [+tap.slice(1)]; const left = X.flags.filter(f => !nearEcho(trs, f.t)); rem[tap] = left; console.log(tap, 'peak', X.peakDb, 'NaN', X.nan, 'flags', X.flags.length, 'not echo', left.length, 'drops', X.drops.length, JSON.stringify(X.drops.slice(0, 6))); const g = {}; for (const f of left) { const k = byAct(f).replace(/ \+[\d.]+$/, ''); (g[k] = g[k] || []).push([f.t, f.db, f.lv, byAct(f).match(/\+([\d.]+)$/)?.[1]]); } for (const k in g) console.log('   ', k.padEnd(52), g[k].length, JSON.stringify(g[k].slice(0, 6))); }
check('recorded ≥ ' + (MIN * 56 - 5) + ' s', A.secs >= MIN * 56 - 5, A.secs);
check('no NaN, master peak < 0 dBFS', Object.values(A.taps).every(x => x.nan === 0) && A.taps.master.peakDb < 0, Object.fromEntries(Object.entries(A.taps).map(([k, x]) => [k, [x.nan, x.peakDb]])));
check('no dropouts', Object.values(A.taps).every(x => x.drops.length === 0), Object.fromEntries(Object.entries(A.taps).map(([k, x]) => [k, x.drops.length])));
check('no stuck notes 4.5 s after ■', fin.voices.length === 0 && !fin.live, fin);
check('tickErrors 0', !fin.te, fin.te);
check('no late notes (scheduled ≥ 3 ms ahead)', A.late.length === 0, A.late.slice(0, 10));
check('no console errors', errs.length === 0, errs.slice(0, 5));
check('no longtask > 50 ms / main-thread stall > 60 ms', !A.lt.some(x => x[0] > 50) && !A.stall.length, {lt: A.lt.map(([d, st]) => { const a = A.acts.filter(a => a.pn != null && a.pn <= st + 5).pop(); return d + ' ms after ' + (a ? a.n.slice(0, 40) + ' +' + (st - a.pn) + 'ms' : '?'); }), stall: A.stall.map(([d, st]) => { const a = A.acts.filter(a => a.pn != null && a.pn <= st + 5).pop(); return d + ' ms after ' + (a ? a.n.slice(0, 40) + ' +' + (st - a.pn) + 'ms' : '?'); })});
check('all actions ran (no ERR / missing item)', !Object.values(res).some(r => /ERR|no /.test(JSON.stringify(r))), Object.entries(res).filter(([k, r]) => /ERR|no /.test(JSON.stringify(r))));
check('M-KLICK: flags not explained by note onsets / offsets / echoes (per tap)', Object.values(rem).every(x => x.length === 0), Object.fromEntries(Object.entries(rem).map(([k, x]) => [k, x.length])));
fs.writeFileSync(OUT + TAG + '-result.json', JSON.stringify({A, fin, errs, res, rem, dl: dl.filter((_, i) => i % 10 === 0)}, null, 1));
fs.writeFileSync(OUT + TAG + '-project.json', await E(() => SYNQUENZER.serialize()));
// keep the raw taps for a closer look
const NS = await E(() => window.__q.n); const CH = 1 << 20;
for (let j = 0; j < 4; j++) { const parts = []; for (let o = 0; o < NS; o += CH) parts.push(Buffer.from(await E(([o, CH, j]) => { const x = window.__q.bufs[j].subarray(o, Math.min(o + CH, window.__q.n)); let s = ''; const u = new Uint8Array(x.buffer, x.byteOffset, x.byteLength); for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); return btoa(s); }, [o, CH, j]), 'base64')); fs.writeFileSync(OUT + TAG + '-tap' + j + '.f32', Buffer.concat(parts)); }
fs.writeFileSync(OUT + TAG + '-meta.json', JSON.stringify(await E(() => { const Q = window.__q; return {sr: Q.sr, f0: Q.f0, n: Q.n, taps: Q.taps, notes: [...Q.notes.values()].map(n => [n.time, n.track, n.src, n.out, n.dur]), acts: Q.acts}; })));
await T.br.close(); done();
