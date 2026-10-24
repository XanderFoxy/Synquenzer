// QA group G-P1b: 3 minutes ▶ SONG (P1, touch, 🎤 on, wired) with part taps, scene switches, ↩ SONG, song edits (rep, place,
// copy, applyAll), clip edits, undo/redo, FANG TEIL over the song (discarded and accepted), Stimme-FANG – all while playing.
// Master output recorded in the page: M-KLICK (HP 5 kHz, 2 ms, +6 dB over the ±20 ms median, ≤ 3 ms after planned onsets
// excluded), dropouts (digital silence between sound), peak/NaN; voices after ■ (stuck notes), tickErrors, longtasks, console.
import {open, OUT, check, done, tapEl, tapText, eq} from './v3-qa-grp-lib.mjs';
import {micOn, resample, b64} from './v3-vs2-h.mjs';
import {renderVoice} from './v3-vs2-corpus.mjs';
import fs from 'fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const MIN = +(process.argv[2] || 3);
const {br, p, errs, E} = await open();
const proj = JSON.parse(fs.readFileSync(OUT + 'flow4-project.json', 'utf8'));
await E(pj => SYNQUENZER.importJSON(JSON.stringify({app: 'SYNQUENZER', kind: 'project', format: 4, project: pj})), proj);
await sleep(400);
await E(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); });
if (process.argv[3] !== 'echo') { await E(() => SYNQUENZER.setBusFx('echo.ret', 0)); console.log('echo return 0 (measurement)', JSON.stringify(await E(() => SYNQUENZER.getBusFx().echo.ret))); }
if (process.argv[4] === 'clean') {   // measurement variant: soft pads (40 ms attack, cutoff 1.5 kHz) on all synth tracks, drums muted
  console.log('clean', JSON.stringify(await E(() => { const out = []; for (const t of [0, 1, 2, 3, 5]) { try { SYNQUENZER.loadPreset(t, 'f-juno-pad'); SYNQUENZER.setParam(t, 'aA', 0.04); SYNQUENZER.setParam(t, 'cutoff', 1500); out.push([t, SYNQUENZER.getParam(t, 'aA'), SYNQUENZER.getParam(t, 'cutoff')]); } catch (e) { out.push([t, String(e)]); } } SYNQUENZER.setMute(4, true); return out; })));
}
const mic = await micOn(p, 'wired');
await E(() => SYNQUENZER.stop()); await sleep(1300);
// recorder + monitors
await E(async () => {
  const c = AU.ctx;
  const src = `class R extends AudioWorkletProcessor{process(i){const x=i[0]&&i[0][0];this.port.postMessage({f:currentFrame,d:x?x.slice(0):null,nc:i[0]?i[0].length:-1});return true;}}registerProcessor('qa-rec3',R);`;
  try { await c.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src)); } catch (e) { await c.audioWorklet.addModule(URL.createObjectURL(new Blob([src], {type: 'application/javascript'}))); }
  const n = new AudioWorkletNode(c, 'qa-rec3'); const Q = window.__q = {buf: new Float32Array(c.sampleRate * 200), n: 0, f0: null, sr: c.sampleRate, node: n, notes: new Map(), acts: [], vc: [], lt: [], frames: 0};
  Q.nulls = []; Q.gaps = []; Q.lastF = null;
  Q.k = 0; n.port.onmessage = e => { const {f, d, nc} = e.data; if (Q.f0 == null) Q.f0 = f; if (Q.lastF != null && f !== Q.lastF + 128) Q.gaps.push([Q.lastF, f]); Q.lastF = f; const i = (Q.k++) * 128;   // message order (currentFrame repeats now and then in Chromium)
    if (!d) { Q.nulls.push({f, nc, t: +(f / c.sampleRate).toFixed(4)}); return; }
    if (i >= 0 && i + d.length <= Q.buf.length) { Q.buf.set(d, i); Q.n = Math.max(Q.n, i + d.length); } };
  AU.M.ceil.connect(n); const g = c.createGain(); g.gain.value = 0; n.connect(g); g.connect(c.destination);
  Q.poll = setInterval(() => { for (const x of SYNQUENZER.noteLog(4096)) Q.notes.set(x.seq, x); Q.vc.push([+c.currentTime.toFixed(2), SYNQUENZER.voices().length]); }, 1000);
  try { new PerformanceObserver(l => { for (const e of l.getEntries()) Q.lt.push([Math.round(e.duration), Math.round(e.startTime)]); }).observe({entryTypes: ['longtask']}); } catch (e) {}
  const raf = () => { Q.frames++; Q.raf = requestAnimationFrame(raf); }; raf();
  return 1;
});
const act = async (name, fn) => { const t = await E(() => (window.__pn = Math.round(performance.now()), [AU.ctx.currentTime, audBeat(), window.__pn])); let r; try { r = await fn(); } catch (e) { r = 'ERR ' + e.message; } await E(([n, t, b, r]) => window.__q.acts.push({n, t, b, r, pn: window.__pn}), [name, t[0], t[1], typeof r === 'object' ? JSON.stringify(r).slice(0, 80) : String(r)]); console.log(`[${t[1].toFixed(1)}] ${name} → ${typeof r === 'object' ? JSON.stringify(r).slice(0, 120) : r}`); return r; };
const atBar = bar => p.waitForFunction(x => audBeat() >= x, bar * 4 + 0.3, {timeout: 400000, polling: 10});
const marks = () => E(() => SYNQUENZER.songMarks());
// singing material
const SB = 0.5, LEAD = 0.04;
const MEL = [[0, 1, 64], [1, 1, 67], [2, 2, 69], [4, 1, 67], [5, 1, 64], [6, 2, 62], [8, 1, 60], [9, 1, 62], [10, 2, 64], [12, 2, 62], [14, 2, 57]];
const sig = renderVoice(MEL.map(([b, d, m], k) => ({on: LEAD + b * SB, dur: d * SB, midi: m, legato: false, rest: k ? 0.1 : 0})), {voice: 'male', seed: 7, sigma: 12, vib: [20, 40], bpm: 120});
const y = b64(resample(sig.x, 16000, mic.sr));
// ---- go
await E(() => { SYNQUENZER.songLoop(true); SYNQUENZER.songView(true); }); await sleep(200);
await act('▶ SONG (touch)', () => tapEl(p, '.sv-play').then(b => !!b));
const T0 = await E(() => R.songPlay ? R.songPlay.off : null); console.log('song off', T0);
await E(() => SYNQUENZER.songView(false));
await atBar(5); await act('tap REFRAIN (jump)', () => tapText(p, '.pk', /REFRAIN/).then(b => !!b));
await atBar(9); await act('tap STROPHE (jump)', () => tapText(p, '.pk', /STROPHE/).then(b => !!b));
await atBar(13); await act('edit clip Synth 1 Sz1 (+ note)', () => E(() => { const c = SYNQUENZER.getClip(0, 0); c.notes.push({t: 3.5, d: .25, n: 43, v: .9}); SYNQUENZER.setClip(0, 0, c); return c.notes.length; }));
await atBar(17); await act('markAction Strophe ×2', async () => { const m = (await marks()).find(x => x.name === 'Strophe'); return E(id => SYNQUENZER.markAction(id, 'rep', 2), m.id); });
await atBar(21); await act('undo (×2)', () => E(() => { SYNQUENZER.undo(); return SYNQUENZER.song().bars; }));
await atBar(23); await act('redo (×2)', () => E(() => { SYNQUENZER.redo(); return SYNQUENZER.song().bars; }));
await atBar(27); await act('placePart Refrain at end', () => E(() => { const s = SYNQUENZER.song(); return SYNQUENZER.placePart('P2', s.bars); }));
await atBar(31); await act('songRange copy bars 1–4 to 4', () => E(() => SYNQUENZER.songRange('copy', 0, 3, 4)));
await atBar(35); await act('▶3 (touch, hand takes over)', () => tapText(p, 'button.scn', /^▶\s*3/).then(b => !!b));
await atBar(39); await act('↩ SONG', () => E(() => { SYNQUENZER.backToSong(); return SYNQUENZER.runtime().song.override; }));
await atBar(41); await act('markAction applyAll (first Strophe)', async () => { const m = (await marks()).find(x => x.name === 'Strophe'); return E(id => SYNQUENZER.markAction(id, 'applyAll'), m.id); });
// sing bars 44–47, FANG 🎤 at bar 48 + 0.3
await atBar(42); await act('voice scheduled (bars 44–47)', () => E(([b, beat, lead]) => { const c = SYNQUENZER.vsClock(); const t = c.start + beat * c.spb - lead; window.__fake.play(b, t); return +(t - window.__ctx.currentTime).toFixed(2); }, [y, 44 * 4, LEAD]));
await p.waitForFunction(() => audBeat() >= 48 * 4 + 0.3, null, {timeout: 60000, polling: 5});
await act('FANG 🎤 (touch)', async () => { const m = await E(() => SYNQUENZER.vsInfo().fangMode); await tapEl(p, '#bFang'); await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy, null, {timeout: 20000}); await sleep(100); const r = await E(() => SYNQUENZER.vsResult()); return {mode: m, notes: r && r.notes.length, len: r && r.len}; });
await act('result OK (touch)', () => tapText(p, '.pop.vsres button', /OK/).then(b => !!b));
await atBar(51); await act('tap STROPHE (jump)', () => tapText(p, '.pk', /STROPHE/).then(b => !!b));
// ⇅ chords over the song (hand) for 4 bars, FANG TEIL, Verwerfen
await atBar(53); await act('⇅ TRANSP. (touch)', () => tapEl(p, '#segTr').then(b => !!b));
await E(() => { const c = document.querySelector('#coach button'); if (c && c.getClientRects().length) c.click(); });
await act('chords Dm G Dm G (hand)', () => E(([seq, b0]) => new Promise(res => { let k = 0; const iv = setInterval(() => { const b = audBeat(); if (k < seq.length && b >= b0 + 4 * k + .04) { SYNQUENZER.keyOn(seq[k], .8, 'h' + k); const kk = k; setTimeout(() => SYNQUENZER.keyOff(0, 'h' + kk), 100); k++; } if (k >= seq.length) { clearInterval(iv); res(seq.length); } }, 2); }), [[50, 55, 50, 55, 50, 55, 50, 55], 54 * 4]));
await p.waitForFunction(() => audBeat() >= 62 * 4 + 0.3, null, {timeout: 60000, polling: 5});
await act('FANG TEIL (touch)', async () => { await tapEl(p, '#bFang'); await sleep(100); const f = await E(() => SYNQUENZER.fangPart()); return f && {len: f.len, name: f.suggest.name}; });
await atBar(64); await act('Verwerfen (touch)', () => tapText(p, '.pop.fsheet button', /Verwerfen|✕/).then(b => b && b.t));
await atBar(66); await act('↩ SONG', () => E(() => { SYNQUENZER.backToSong(); return SYNQUENZER.runtime().song; }).then(s => ({play: s.play, ov: s.override})));
await act('♪ SPIELEN (touch)', () => tapEl(p, '#segPlay').then(b => !!b));
await atBar(70); await act('▶1 (touch)', () => tapText(p, 'button.scn', /^▶\s*1/).then(b => !!b));
await atBar(74); await act('undo ×3 / redo ×3', () => E(() => { for (let k = 0; k < 3; k++) SYNQUENZER.undo(); for (let k = 0; k < 3; k++) SYNQUENZER.redo(); return SYNQUENZER.undoInfo().n; }));
await atBar(76); await act('↩ SONG', () => E(() => { SYNQUENZER.backToSong(); return SYNQUENZER.runtime().song.play; }));
await atBar(80); await act('markAction delete last mark', async () => { const ms = await marks(); return E(id => SYNQUENZER.markAction(id, 'delete'), ms[ms.length - 1].id); });
await atBar(84); await act('tap REFRAIN (jump)', () => tapText(p, '.pk', /REFRAIN/).then(b => !!b));
await atBar(MIN * 30); const tStop = await E(() => AU.ctx.currentTime);
await act('■ stop (touch)', () => tapEl(p, '#bPlay').then(b => !!b));
await sleep(4000);
const fin = await E(() => ({voices: SYNQUENZER.voices().filter(v => v.state !== 'off'), live: SYNQUENZER.runtime().liveVoices, te: SYNQUENZER.tickErrors(), playing: SYNQUENZER.runtime().playing}));
// analysis in the page
const A = await E(tStop => {
  const Q = window.__q; clearInterval(Q.poll); cancelAnimationFrame(Q.raf); for (const x of SYNQUENZER.noteLog(4096)) Q.notes.set(x.seq, x);
  try { AU.M.ceil.disconnect(Q.node); } catch (e) {}
  const sr = Q.sr, N = Q.n, x = Q.buf.subarray(0, N), t0 = Q.f0 / sr;
  let nan = 0, peak = 0; for (let i = 0; i < N; i++) { const v = x[i]; if (v !== v) nan++; else if (Math.abs(v) > peak) peak = Math.abs(v); }
  const hp = (inp, f, q) => { const w = 2 * Math.PI * f / sr, a = Math.sin(w) / (2 * q), cw = Math.cos(w), b0 = (1 + cw) / 2, b1 = -(1 + cw), b2 = b0, a0 = 1 + a, a1 = -2 * cw, a2 = 1 - a; const y = new Float32Array(inp.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < inp.length; i++) { const v = (b0 * inp[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = inp[i]; y2 = y1; y1 = v; y[i] = v; } return y; };
  const h = hp(hp(x, 5000, .5412), 5000, 1.3066);
  const W = Math.round(sr * .002), e = []; for (let i = 0; i + W <= N; i += W) { let s = 0; for (let k = i; k < i + W; k++) s += h[k] * h[k]; e.push(s / W + 1e-20); }
  // planned onsets: drums (track 4) excluded 40 ms after the hit (noise tails), synth notes and re-pitches 8 ms; everything else counts
  const onD = [...Q.notes.values()].filter(n => n.time != null && n.track === 4).map(n => n.time).sort((a, b) => a - b), onS = [...Q.notes.values()].filter(n => n.time != null && n.track !== 4).map(n => n.time).sort((a, b) => a - b);
  const last = (arr, t) => { let lo = 0, hi = arr.length - 1, r = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (arr[m] <= t + .0025) { r = m; lo = m + 1; } else hi = m - 1; } return r < 0 ? -1e9 : arr[r]; };
  const nearOn = t => t - last(onD, t) <= .040 || t - last(onS, t) <= .008;
  const flags = [];
  for (let j = 10; j < e.length - 10; j++) { const t = t0 + j * .002; if (t > tStop) break; const nb = e.slice(j - 10, j + 11).filter((_, k) => k !== 10).sort((a, b) => a - b), med = nb[10]; const db = 10 * Math.log10(e[j] / med); if (db > 6 && e[j] > 1e-9 && !nearOn(t)) flags.push({t: +t.toFixed(3), b: +t2b(t).toFixed(2), db: +db.toFixed(1), lv: +(10 * Math.log10(e[j])).toFixed(1)}); }
  // dropouts: 5-ms windows < -70 dBFS between sound (mean of 10 windows before and after > -35 dBFS)
  const W5 = Math.round(sr * .005), r5 = []; for (let i = 0; i + W5 <= N; i += W5) { let s = 0; for (let k = i; k < i + W5; k++) s += x[k] * x[k]; r5.push(10 * Math.log10(s / W5 + 1e-20)); }
  const drops = []; const mean = a => 10 * Math.log10(a.reduce((s, v) => s + Math.pow(10, v / 10), 0) / a.length);
  for (let j = 10; j < r5.length - 10; j++) { const t = t0 + j * .005; if (t > tStop) break; if (r5[j] < -70 && mean(r5.slice(j - 10, j)) > -35 && mean(r5.slice(j + 1, j + 11)) > -35) drops.push({t: +t.toFixed(3), b: +t2b(t).toFixed(2), db: +r5[j].toFixed(0)}); }
  // exact-zero runs (≥ 32 samples) with sound in the 10 ms before
  const zr = []; for (let i = 0; i < N; i++) { if (x[i] !== 0) continue; let j = i; while (j < N && x[j] === 0) j++; const L = j - i; if (L >= 32 && i > 441) { let s = 0; for (let k = i - 441; k < i; k++) s += x[k] * x[k]; const pre = 10 * Math.log10(s / 441 + 1e-20); if (pre > -45 && (t0 + i / sr) < tStop) zr.push({t: +(t0 + i / sr).toFixed(4), b: +t2b(t0 + i / sr).toFixed(2), len: L, fmod: (Q.f0 + i) % 128, pre: +pre.toFixed(1)}); } i = j; }
  Q.zr = zr;
  const secs = N / sr;
  const gapsT = Q.gaps.map(([a, b]) => ({t: +(a / sr).toFixed(3), b: +t2b(a / sr).toFixed(2), q: (b - a) / 128 - 1})); return {gapsT, nulls: Q.nulls.length, nullEx: Q.nulls.slice(0, 5), gaps: Q.gaps.length, zr, secs: +secs.toFixed(1), nan, peakDb: +(20 * Math.log10(peak + 1e-12)).toFixed(1), flags, drops, notes: Q.notes.size, acts: Q.acts, vc: Q.vc, lt: Q.lt, fps: +(Q.frames / secs).toFixed(1)};
}, tStop);
console.log('recorded', A.secs, 's; notes', A.notes, '; peak', A.peakDb, 'dBFS; NaN', A.nan, '; fps', A.fps, '; longtasks', JSON.stringify(A.lt));
console.log('voice counts', JSON.stringify(A.vc.filter((_, i) => i % 10 === 0)));
console.log('click flags', A.flags.length, JSON.stringify(A.flags.slice(0, 40)));
console.log('dropouts', A.drops.length, JSON.stringify(A.drops.slice(0, 20)));
console.log('recorder: input without channels', A.nulls, JSON.stringify(A.nullEx), 'frame gaps', A.gaps);
console.log('gaps', JSON.stringify(A.gapsT.slice(0, 60)));
const gAct = {}; for (const g of A.gapsT) { const a = A.acts.filter(a => g.t >= a.t - .05).pop(); const k = a ? a.n + ' +' + Math.round(g.t - a.t) + 's' : '-'; gAct[k] = (gAct[k] || 0) + 1; } console.log('gaps after actions', JSON.stringify(gAct));
console.log('zero runs', A.zr.length, JSON.stringify(A.zr.slice(0, 20)));
// flags near actions
const nearAct = A.flags.map(f => { const a = A.acts.filter(a => f.t >= a.t - .05 && f.t <= a.t + 8.5).pop(); return a ? a.n : '-'; });
const byAct = {}; nearAct.forEach(n => byAct[n] = (byAct[n] || 0) + 1); console.log('flags by preceding action (≤ 8.5 s after)', JSON.stringify(byAct));
check('3 min: recorded ≥ ' + (MIN * 60 - 5) + ' s', A.secs >= MIN * 60 - 5, A.secs);
check('no NaN, no clipping (peak < 0 dBFS)', A.nan === 0 && A.peakDb < 0, {nan: A.nan, peak: A.peakDb});
check('M-KLICK: no flagged window outside planned onsets', A.flags.length === 0, A.flags.length);
check('no dropouts (digital silence between sound)', A.drops.length === 0, A.drops.length);
check('no stuck notes 4 s after ■', fin.voices.length === 0 && fin.live === 0, fin);
check('tickErrors 0', fin.te === 0, fin.te);
check('no console errors', errs.length === 0, errs.slice(0, 5));
check('no longtask > 50 ms', !A.lt.some(x => x[0] > 50), A.lt.map(([d, st]) => { const a = A.acts.filter(a => a.pn != null && a.pn <= st + 5).pop(); return d + ' ms after ' + (a ? a.n + ' +' + (st - a.pn) + 'ms' : '?'); }));
fs.writeFileSync(OUT + 'long-result.json', JSON.stringify({A, fin, errs}, null, 1));
fs.writeFileSync(OUT + 'long-project.json', JSON.stringify(await E(() => SYNQUENZER.project())));
await br.close(); done();
