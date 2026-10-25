// QA G-MK1: 3 minutes playback (P 428x926, CDP touch) of a project with 3 MS 2000 tracks + FM + drums, scene switches and
// panel edits while playing; master recorded in the page: M-KLICK, dropouts, NaN/peak, stuck voices after ■, tickErrors,
// longtasks, console errors. argv: minutes, 'base' (no edits)
import {open, sleep, OUT, check, done, recStart} from './v3-qa-gmk1-tl.mjs';
import {setupProject} from './v3-qa-gmk1-setup.mjs';
import fs from 'fs';
const MIN = +(process.argv[2] || 3), BASE = process.argv[3] === 'base', TAG = BASE ? 'base' : 'long2';
const T = await open(); const {p, E, errs} = T;
console.log('setup', JSON.stringify(await setupProject(E)));
await E(() => { SYNQUENZER.selectTrack(0); });
await T.tapTxt('button.scn', /^▶\s*1/); await sleep(100);   // queue scene 1 / start? (touch)
const playing0 = await E(() => SYNQUENZER.runtime().playing);
if (!playing0) { await T.tapSel('#bPlay'); }
await sleep(300);
await recStart(E, MIN * 60 + 40);
const res = {};
const act = async (name, fn) => { const t = await E(() => (window.__pn = Math.round(performance.now()), [AU.ctx.currentTime, audBeat(), window.__pn])); let r; try { r = await fn(); } catch (e) { r = 'ERR ' + e.message; } res[name] = r; await E(([n, t, b, r]) => window.__q.acts.push({n, t, b, r, pn: window.__pn}), [name, t[0], t[1], typeof r === 'object' ? JSON.stringify(r).slice(0, 80) : String(r)]); const nm = await E(() => [0, 2, 3].map(t => SYNQUENZER.getSound(t).name).join(' | ') + ' · u' + SYNQUENZER.undoInfo().n + ' · toast ' + ((document.getElementById('toast') && document.getElementById('toast').offsetWidth) ? document.getElementById('toast').textContent : '-')); console.log(`[${(t[1] / 4).toFixed(1)}] ${name} → ${typeof r === 'object' ? JSON.stringify(r).slice(0, 160) : r}   ## ${nm}`); return r; };
const atBar = bar => p.waitForFunction(x => audBeat() >= x, bar * 4 + 0.3, {timeout: 400000, polling: 10});
const closePop = async () => { if (await T.pop()) { await E(() => { const b = [...document.querySelectorAll('#popLayer .pop button')].find(b => /^✕$|Abbrechen/.test(b.textContent.trim())); if (b) b.click(); }); await sleep(120); } };
const openEd = async t => { await E(t => { SYNQUENZER.selectTrack(t); SYNQUENZER.openEditor(); }, t); await sleep(400); const pn = await T.panel(); return pn && pn.fmt; };
const w1 = async re => { await closePop(); await T.tapMk('w1', 250); const r = await T.tapPop(re); await sleep(150); const pn = await T.panel(); return r ? pn.sel : 'no row ' + re; };
const knobList = async (k, re) => { const r0 = await T.tapMk(k, 250); const r = await T.tapPop(re); await sleep(120); return r ? 'ok' : 'no list item ' + re + ' ' + JSON.stringify(await T.popTexts()); };
const sweep = async (k, dy, steps = 60) => { const r = await T.mk(k); await T.down(r.cx, r.cy); await T.glide(r.cx, r.cy, r.cx, r.cy + dy, steps, 30); await T.up(); await sleep(100); return 'ok'; };
const wheel = async (w, frac, hold = 600) => { const r = await E(w => { const e = document.querySelector('#mkWh .mkwheel[data-w="' + w + '"] .mwell'); if (!e || !e.getClientRects().length) return null; const r = e.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height / 2, h: r.height}; }, w); if (!r) return 'no wheel'; const y0 = w === 'bend' ? r.cy : r.cy + r.h / 2 - 4; await T.down(r.cx, y0); await T.glide(r.cx, y0, r.cx, y0 - frac * r.h / 2, 20, 25); await sleep(hold); await T.glide(r.cx, y0 - frac * r.h / 2, r.cx, y0 - frac * r.h / 4, 10, 25); await T.up(); await sleep(150); return E(w => SYNQUENZER.mkWheel(SYNQUENZER.runtime().selected != null ? SYNQUENZER.runtime().selected : 0, w), w); };
if (!BASE) {
await atBar(2); await act('open editor Synth 1 (MS 2000)', () => openEd(0));
await atBar(4); await act('SPIEL CUTOFF slow sweep down/up (touch)', async () => { await sweep('k0', 70, 50); await sweep('k0', -70, 50); return E(() => SYNQUENZER.mkGet(0).t[0].f.cut); });
await atBar(6); await act('SPIEL RESO up', async () => { await sweep('k1', -50, 30); return E(() => SYNQUENZER.mkGet(0).t[0].f.res); });
await atBar(8); await act('scene 2 (API, editor open)', () => E(() => { SYNQUENZER.launchScene(1); return 1; }));
await atBar(10); await act('EDIT-WAHL 1 list → OSZ 2, MOD → Ring', async () => { const s = await w1(/^4 OSZ 2/); return [s, await knobList('k1', /^Ring$/), await E(() => SYNQUENZER.mkGet(0).t[0].o2.mod)]; });
await atBar(12); await act('MOD → Ring+Sync, HALBTON sweep', async () => { const a = await knobList('k1', /^Ring\+Sync$/); await sweep('k2', -40, 30); return [a, await E(() => SYNQUENZER.mkGet(0).t[0].o2)]; });
await atBar(14); await act('FILTER TYP → 12HPF → 24LPF', async () => { await w1(/^6 FILTER/); const a = await knobList('k0', /^12HPF$/); await sleep(1500); const b = await knobList('k0', /^24LPF$/); return [a, b, await E(() => SYNQUENZER.mkGet(0).t[0].f.type)]; });
await atBar(16); await act('STIMME: ZUWEISUNG Mono → Unison → Poly, AUSLÖSUNG Einzeln', async () => { await w1(/^1 STIMME/); const a = await knobList('k2', /^Mono$/); await sleep(1500); const b = await knobList('k2', /^Unison$/); await sleep(1500); const c = await knobList('k2', /^Poly$/); const d = await knobList('k3', /^Einzeln$/); return [a, b, c, d, await E(() => { const t = SYNQUENZER.mkGet(0).t[0]; return [t.asg, t.trig]; })]; });
await atBar(18); await act('scene 3 (API) + editor → Synth 4 lead (panel rebuild while playing)', async () => { await E(() => SYNQUENZER.launchScene(2)); return openEd(3); });
await atBar(20); await act('Synth 4: BEND wheel up+hold, MOD wheel up', async () => { const b = await wheel('bend', .9, 900); const m = await wheel('mod', 1, 300); return [b, m]; });
await atBar(22); await act('AMP: VERZERR. aus/an; SHIFT → HK│GATE Gate', async () => { await w1(/^8 AMP/); const a = await knobList('k2', /^aus$/); await sleep(1000); const b = await knobList('k2', /^an$/); await T.tapMk('shift'); const c = await knobList('k0', /^Gate$/); return [a, b, c, await E(() => SYNQUENZER.mkGet(3).t[0].a)]; });
await atBar(24); await act('LFO 1: TEMPO SYNC an, KEY SYNC Timbre; LFO 2 FREQ sweep', async () => { await w1(/^10 LFO 1/); const a = await knobList('k2', /^an$/); const b = await knobList('k1', /^Timbre$/); await w1(/^11 LFO 2/); await sweep('k3', -60, 30); return [a, b, await E(() => [SYNQUENZER.mkGet(3).t[0].l1, SYNQUENZER.mkGet(3).t[0].l2])]; });
await atBar(26); await act('🎲 on Synth 4', async () => { await closePop(); await T.tapTxt('.hb', /^🎲$/); return E(() => SYNQUENZER.mkGet(3).t[0].o1); });
await atBar(28); await act('undo ×3 / redo ×3 (header)', async () => { for (let k = 0; k < 3; k++) { await T.tapTxt('.hb.ur', /^↶$/, 120); } for (let k = 0; k < 3; k++) { await T.tapTxt('.hb.ur', /^↷$/, 120); } return E(() => SYNQUENZER.undoInfo().n); });
await atBar(30); await act('editor Synth 3 pad: engine MS 2000 → VA (header)', async () => { await openEd(2); const r = await T.tapTxt('#sheet button, .sheet button', /^VA$/); if (!r) { const c = await T.tapTxt('button', /▾$/); await T.tapPop(/^VA/); } await sleep(200); return E(() => SYNQUENZER.getSound(2).engine); });
await atBar(33); await act('Synth 3 pad: VA → MS 2000 (header)', async () => { const r = await T.tapTxt('button', /^MS ?2000$/); if (!r) { await T.tapTxt('button', /▾$/); await T.tapPop(/MS ?2000/); } await sleep(300); return E(() => SYNQUENZER.getSound(2).engine); });
await atBar(35); await act('Synth 1: number key 1 loads program (Seite B)', async () => { await openEd(0); await T.tapMk('n0', 300); return E(() => SYNQUENZER.getSound(0).name); });
await atBar(37); await act('Synth 1: number key 2 loads Lead Sync', async () => { await T.tapMk('n1', 300); return E(() => SYNQUENZER.getSound(0).name); });
await atBar(39); await act('Synth 1: undo (back to Bass A)', async () => { await T.tapTxt('.hb.ur', /^↶$/, 200); return E(() => SYNQUENZER.getSound(0).name); });
await atBar(41); await act('Synth 1: SHIFT + 3 (Init) then undo', async () => { await T.tapMk('shift'); await T.tapMk('n2', 200); const a = await E(() => SYNQUENZER.getSound(0).name); await sleep(2000); await T.tapTxt('.hb.ur', /^↶$/, 200); return [a, await E(() => SYNQUENZER.getSound(0).name)]; });
await atBar(44); await act('OKT ▲ ▲ ▼ (panel)', async () => { await T.tapMk('octu'); await T.tapMk('octu'); await T.tapMk('octd'); return E(() => (SYNQUENZER.project().project || SYNQUENZER.project()).tracks[0].kbOct); });
await atBar(46); await act('✕ editor, ▶4 (touch)', async () => { await closePop(); await T.tapTxt('button', /^✕$/); await sleep(200); return !!(await T.tapTxt('button.scn', /^▶\s*4/)); });
await atBar(50); await act('▶1 (touch)', async () => !!(await T.tapTxt('button.scn', /^▶\s*1/)));
await atBar(54); await act('▶2 (touch)', async () => !!(await T.tapTxt('button.scn', /^▶\s*2/)));
await atBar(56); await act('editor Synth 3 pad: VOLUME sweep, A-HK RELEASE sweep', async () => { await openEd(2); await sweep('vol', 40, 30); await sweep('vol', -40, 30); await w1(/^9 A-HK/); await sweep('k3', -40, 30); return E(() => [SYNQUENZER.getSound(2).fx.vol, SYNQUENZER.mkGet(2).t[0].e2.r]); });
await atBar(60); await act('ECO on (forceNative)', () => E(() => { SYNQUENZER.forceNative(true); return SYNQUENZER.engineInfo().mode || 1; }));
await atBar(64); await act('ECO off', () => E(() => { SYNQUENZER.forceNative(false); return SYNQUENZER.engineInfo().mode || 1; }));
await atBar(66); await act('SPIEL TEMPO knob 112 → ~124 (touch)', async () => { await E(() => 0); const pn = await T.panel(); if (pn.sel.wahl !== 0) { await T.tapMk('n7', 100); } const r = await T.mk('k4'); await T.down(r.cx, r.cy); await T.glide(r.cx, r.cy, r.cx, r.cy - 12, 12, 30); await T.up(); return E(() => SYNQUENZER.runtime().bpm); });
await atBar(70); await act('Synth 3: OSZ 1 Welle → Säge → Dreieck, STEUER 1 sweep', async () => { await w1(/^3 OSZ 1/); const a = await knobList('k0', /^Säge$/); await sleep(1500); const b = await knobList('k0', /^Dreieck$/); await sweep('k1', -50, 30); return [a, b, await E(() => SYNQUENZER.mkGet(2).t[0].o1)]; });
await atBar(74); await act('Synth 3: MIXER RAUSCHEN up/down', async () => { await w1(/^5 MIXER/); await sweep('k2', -40, 30); await sweep('k2', 40, 30); return E(() => SYNQUENZER.mkGet(2).t[0].mix); });
await atBar(78); await act('▶3 (API) + editor ‹ track switch', async () => { await E(() => SYNQUENZER.launchScene(2)); const r = await T.tapTxt('button', /^‹$/); await sleep(300); return E(() => SYNQUENZER.runtime().selected); });
}
await atBar(MIN * 28); const tStop = await E(() => AU.ctx.currentTime);
await act('■ stop', async () => { await closePop(); await E(() => SYNQUENZER.closeEditor && SYNQUENZER.closeEditor()); await sleep(200); return T.tapSel('#bPlay').then(b => !!b); });
await sleep(4500);
const fin = await E(() => ({voices: SYNQUENZER.voices().filter(v => v.state !== 'off'), live: SYNQUENZER.runtime().liveVoices, te: SYNQUENZER.tickErrors(), playing: SYNQUENZER.runtime().playing, eng: SYNQUENZER.engineInfo().perTrack && SYNQUENZER.engineInfo().perTrack.map(x => x && x.voices)}));
const A = await E(tStop => {
  const Q = window.__q; clearInterval(Q.poll); cancelAnimationFrame(Q.raf); for (const x of SYNQUENZER.noteLog(4096)) Q.notes.set(x.seq, x);
  try { AU.M.ceil.disconnect(Q.node); } catch (e) {}
  const sr = Q.sr, N = Q.n, x = Q.buf.subarray(0, N), t0 = Q.f0 / sr;
  let nan = 0, peak = 0; for (let i = 0; i < N; i++) { const v = x[i]; if (v !== v) nan++; else if (Math.abs(v) > peak) peak = Math.abs(v); }
  const hp = (inp, f, q) => { const w = 2 * Math.PI * f / sr, a = Math.sin(w) / (2 * q), cw = Math.cos(w), b0 = (1 + cw) / 2, b1 = -(1 + cw), b2 = b0, a0 = 1 + a, a1 = -2 * cw, a2 = 1 - a; const y = new Float32Array(inp.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < inp.length; i++) { const v = (b0 * inp[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = inp[i]; y2 = y1; y1 = v; y[i] = v; } return y; };
  const h = hp(hp(x, 5000, .5412), 5000, 1.3066);
  const W = Math.round(sr * .002), e = []; for (let i = 0; i + W <= N; i += W) { let s = 0; for (let k = i; k < i + W; k++) s += h[k] * h[k]; e.push(s / W + 1e-20); }
  const onD = [...Q.notes.values()].filter(n => n.time != null && n.track === 4).map(n => n.time).sort((a, b) => a - b), onS = [...Q.notes.values()].filter(n => n.time != null && n.track !== 4).map(n => n.time).sort((a, b) => a - b);
  const offS = [...Q.notes.values()].filter(n => n.time != null && n.dur != null && n.track !== 4).map(n => n.time + n.dur).sort((a, b) => a - b);
  const last = (arr, t) => { let lo = 0, hi = arr.length - 1, r = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (arr[m] <= t + .0025) { r = m; lo = m + 1; } else hi = m - 1; } return r < 0 ? -1e9 : arr[r]; };
  const gapT = Q.gaps.filter(([a, b]) => b - a > 128).map(([a, b]) => [(a + 128 - Q.f0) / sr + t0 - .012, (b - Q.f0) / sr + t0 + .012]);
  const inGap = t => gapT.some(([a, b]) => t >= a && t <= b);
  const nearOn = t => t - last(onD, t) <= .040 || t - last(onS, t) <= .008 || inGap(t);
  const flags = [];
  for (let j = 10; j < e.length - 10; j++) { const t = t0 + j * W / sr; if (t > tStop) break; const nb = e.slice(j - 10, j + 11).filter((_, k) => k !== 10).sort((a, b) => a - b), med = nb[10]; const db = 10 * Math.log10(e[j] / med); if (db > 6 && e[j] > 1e-9 && !nearOn(t)) flags.push({t: +t.toFixed(3), b: +t2b(t).toFixed(2), db: +db.toFixed(1), lv: +(10 * Math.log10(e[j])).toFixed(1), off: +(t - last(offS, t)).toFixed(3)}); }
  const W5 = Math.round(sr * .005), r5 = []; for (let i = 0; i + W5 <= N; i += W5) { let s = 0; for (let k = i; k < i + W5; k++) s += x[k] * x[k]; r5.push(10 * Math.log10(s / W5 + 1e-20)); }
  const drops = []; const mean = a => 10 * Math.log10(a.reduce((s, v) => s + Math.pow(10, v / 10), 0) / a.length);
  for (let j = 10; j < r5.length - 10; j++) { const t = t0 + j * W5 / sr; if (t > tStop) break; if (!inGap(t) && r5[j] < -70 && mean(r5.slice(j - 10, j)) > -35 && mean(r5.slice(j + 1, j + 11)) > -35) drops.push({t: +t.toFixed(3), b: +t2b(t).toFixed(2), db: +r5[j].toFixed(0)}); }
  const zr = []; for (let i = 0; i < N; i++) { if (x[i] !== 0) continue; let j = i; while (j < N && x[j] === 0) j++; const L = j - i; if (L >= 32 && i > 441 && !inGap(t0 + i / sr) && !inGap(t0 + (i + L) / sr)) { let s = 0; for (let k = i - 441; k < i; k++) s += x[k] * x[k]; const pre = 10 * Math.log10(s / 441 + 1e-20); if (pre > -45 && (t0 + i / sr) < tStop) zr.push({t: +(t0 + i / sr).toFixed(4), b: +t2b(t0 + i / sr).toFixed(2), len: L, pre: +pre.toFixed(1)}); } i = j; }
  const rms1 = []; for (let i = 0; i + sr <= N; i += sr) { let s = 0; for (let k = i; k < i + sr; k++) s += x[k] * x[k]; rms1.push(+(10 * Math.log10(s / sr + 1e-20)).toFixed(1)); }
  const secs = N / sr;
  return {nulls: Q.nulls.length, gaps: Q.gaps.length, gapLost: gapT.length, zr, secs: +secs.toFixed(1), nan, peakDb: +(20 * Math.log10(peak + 1e-12)).toFixed(1), flags, drops, notes: Q.notes.size, acts: Q.acts, vc: Q.vc, lt: Q.lt, fps: +(Q.frames / secs).toFixed(1), rms1};
}, tStop);
const NS = await E(() => window.__q.n), CH = 1 << 20; const parts = [];
for (let o = 0; o < NS; o += CH) parts.push(Buffer.from(await E(([o, CH]) => { const x = window.__q.buf.subarray(o, Math.min(o + CH, window.__q.n)); let s = ''; const u = new Uint8Array(x.buffer, x.byteOffset, x.byteLength); for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); return btoa(s); }, [o, CH]), 'base64'));
fs.writeFileSync(OUT + TAG + '-audio.f32', Buffer.concat(parts));
fs.writeFileSync(OUT + TAG + '-meta.json', JSON.stringify(await E(() => { const Q = window.__q; return {sr: Q.sr, f0: Q.f0, n: Q.n, notes: [...Q.notes.values()].map(n => [n.time, n.track, n.src, n.out, n.dur]), acts: Q.acts, spb: 60 / SYNQUENZER.runtime().bpm}; })));
console.log('recorded', A.secs, 's; notes', A.notes, '; peak', A.peakDb, 'dBFS; NaN', A.nan, '; fps', A.fps, '; longtasks', JSON.stringify(A.lt));
console.log('rms per s', JSON.stringify(A.rms1));
console.log('click flags', A.flags.length, JSON.stringify(A.flags.slice(0, 60)));
console.log('dropouts', A.drops.length, JSON.stringify(A.drops.slice(0, 20)));
console.log('zero runs', A.zr.length, JSON.stringify(A.zr.slice(0, 20)), 'recorder gaps', A.gaps, 'nulls', A.nulls);
const nearAct = A.flags.map(f => { const a = A.acts.filter(a => f.t >= a.t - .05 && f.t <= a.t + 8.5).pop(); return a ? a.n : '-'; });
const byAct = {}; nearAct.forEach(n => byAct[n] = (byAct[n] || 0) + 1); console.log('flags by preceding action (≤ 8.5 s after)', JSON.stringify(byAct, null, 0));
check('3 min: recorded ≥ ' + (MIN * 56 - 5) + ' s', A.secs >= MIN * 56 - 5, A.secs);
check('no NaN, no clipping (peak < 0 dBFS)', A.nan === 0 && A.peakDb < 0, {nan: A.nan, peak: A.peakDb});
check('M-KLICK: no flagged window outside planned onsets', A.flags.length === 0, A.flags.length);
check('no dropouts (digital silence between sound)', A.drops.length === 0 && A.zr.length === 0, [A.drops.length, A.zr.length]);
check('no stuck notes 4.5 s after ■', fin.voices.length === 0 && !fin.live, fin);
check('tickErrors 0', !fin.te, fin.te);
check('no console errors', errs.length === 0, errs.slice(0, 5));
check('no longtask > 50 ms', !A.lt.some(x => x[0] > 50), A.lt.map(([d, st]) => { const a = A.acts.filter(a => a.pn != null && a.pn <= st + 5).pop(); return d + ' ms after ' + (a ? a.n + ' +' + (st - a.pn) + 'ms' : '?'); }));
check('all actions ran (no ERR / missing item)', !Object.values(res).some(r => /ERR|no /.test(JSON.stringify(r))), Object.entries(res).filter(([k, r]) => /ERR|no /.test(JSON.stringify(r))));
fs.writeFileSync(OUT + TAG + '-result.json', JSON.stringify({A, fin, errs, res}, null, 1));
fs.writeFileSync(OUT + TAG + '-project.json', await E(() => SYNQUENZER.serialize()));
await T.br.close(); done();
