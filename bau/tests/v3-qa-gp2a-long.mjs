// QA G-P2a: 3 minutes ▶ SONG (P1, CDP touch, SCHLEIFE Song) with the new actions while playing: ◧ Glas, hold cell → own clip,
// ROLLE note in the own clip, mark ×2, drag a part key into the running song (insert), ▶2/▶1 (hand) + ↩ SONG, undo/redo,
// Eine Skala off/on/Stärke, ⇅ chords over the song, ● Overdub of a bar ahead, mark delete + undo, mark ⧉ copy by drag,
// [Zurück zum Szenen-Clip], scene clip edit, [Ganzer Block] + undo. Master recorded in the page: M-KLICK, dropouts, NaN/peak,
// stuck voices after ■, tickErrors, longtasks, console errors (analysis as in v3-qa-grp-long.mjs).
import {open, OUT, sleep, check, done, eq} from './v3-qa-gp2a-lib.mjs';
import fs from 'fs';
const MIN = +(process.argv[2] || 3), BASE = process.argv[3] === 'base', TAG = BASE ? 'base' : 'long';
const T = await open({mic: false}); const {p, E, errs} = T;
const proj = JSON.parse(fs.readFileSync(OUT + 'flow-P1-final.json', 'utf8'));
await E(s => SYNQUENZER.importJSON(s), JSON.stringify(proj)); await sleep(400);
await E(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); SYNQUENZER.setBusFx('echo.ret', 0); });
await E(() => { SYNQUENZER.songLoop(true); SYNQUENZER.songView(true); }); await sleep(250);
await T.tapSel('.sv-home'); await sleep(100);
// recorder + monitors (same as v3-qa-grp-long.mjs)
await E(async () => {
  const c = AU.ctx;
  const src = `class R extends AudioWorkletProcessor{process(i){const x=i[0]&&i[0][0];this.port.postMessage({f:currentFrame,d:x?x.slice(0):null,nc:i[0]?i[0].length:-1});return true;}}registerProcessor('qa-rec4',R);`;
  try { await c.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src)); } catch (e) { await c.audioWorklet.addModule(URL.createObjectURL(new Blob([src], {type: 'application/javascript'}))); }
  const n = new AudioWorkletNode(c, 'qa-rec4'); const Q = window.__q = {buf: new Float32Array(c.sampleRate * 230), n: 0, f0: null, sr: c.sampleRate, node: n, notes: new Map(), acts: [], vc: [], lt: [], frames: 0};
  Q.nulls = []; Q.gaps = []; Q.lastF = null; Q.k = 0;
  n.port.onmessage = e => { const {f, d, nc} = e.data; if (Q.f0 == null) Q.f0 = f; if (Q.lastF != null && f !== Q.lastF + 128) Q.gaps.push([Q.lastF, f]); Q.lastF = f; const i = (Q.k++) * 128;
    if (!d) { Q.nulls.push({f, nc}); return; }
    if (i >= 0 && i + d.length <= Q.buf.length) { Q.buf.set(d, i); Q.n = Math.max(Q.n, i + d.length); } };
  AU.M.ceil.connect(n); const g = c.createGain(); g.gain.value = 0; n.connect(g); g.connect(c.destination);
  Q.poll = setInterval(() => { for (const x of SYNQUENZER.noteLog(4096)) Q.notes.set(x.seq, x); Q.vc.push([+c.currentTime.toFixed(2), SYNQUENZER.voices().length]); }, 1000);
  try { new PerformanceObserver(l => { for (const e of l.getEntries()) Q.lt.push([Math.round(e.duration), Math.round(e.startTime)]); }).observe({entryTypes: ['longtask']}); } catch (e) {}
  const raf = () => { Q.frames++; Q.raf = requestAnimationFrame(raf); }; raf();
  return 1;
});
const res = {};
const act = async (name, fn) => { const t = await E(() => (window.__pn = Math.round(performance.now()), [AU.ctx.currentTime, audBeat(), window.__pn])); let r; try { r = await fn(); } catch (e) { r = 'ERR ' + e.message; } res[name] = r; await E(([n, t, b, r]) => window.__q.acts.push({n, t, b, r, pn: window.__pn}), [name, t[0], t[1], typeof r === 'object' ? JSON.stringify(r).slice(0, 80) : String(r)]); console.log(`[${t[1].toFixed(1)}] ${name} → ${typeof r === 'object' ? JSON.stringify(r).slice(0, 160) : r}`); return r; };
const atBar = bar => p.waitForFunction(x => audBeat() >= x, bar * 4 + 0.3, {timeout: 400000, polling: 10});
const ensureSong = async () => { if (!(await T.songOn())) { await E(() => SYNQUENZER.songView(true)); await sleep(200); } };
// first fully visible bar right of the left edge (+k)
const visBar = async (k = 1) => { const i = await T.info(); return Math.ceil(i.x0 / 36) + k; };
const closePop = async () => { if (await T.pop()) { await T.tapTxt('#popLayer .pop button', /^✕$/); await sleep(150); } if (await T.pop()) { await E(() => document.querySelector('#popLayer .pop') && SYNQUENZER.closeMenu && 0); } };
// ---- go
await act('▶ SONG (touch)', () => T.tapSel('.sv-play').then(b => !!b));
if (!BASE) {
await atBar(2); await act('◧ Glas (touch)', async () => { await T.tapSel('.sv-gl'); await sleep(100); return (await T.info()).view; });
let ownBar = null;
await atBar(4); await act('hold S1 cell → [Eigener Clip]', async () => { await ensureSong(); const b = await visBar(1); const c = await T.cell('S1', b); await T.down(c.x, c.y); await sleep(520); await T.up(); await sleep(250); const pt = await T.popTexts(); if (!pt) return 'no sheet'; await T.tapPop(/^Eigener Clip/); await sleep(200); ownBar = b; return {b, own: !!(await E(b => SYNQUENZER.ownClip(0, b), b))}; });
await atBar(7); await act('tap own cell → ROLLE, draw note, ✕', async () => { await ensureSong(); const c = await T.cell('S1', ownBar); if (!c || c.x < 80 || c.x > 380) return 'not visible ' + JSON.stringify(c); await T.tap(c.x, c.y, 400); const n0 = await E(b => (SYNQUENZER.ownClip(0, b) || {notes: []}).notes.length, ownBar); await T.tap(160, 400, 250); const n1 = await E(b => (SYNQUENZER.ownClip(0, b) || {notes: []}).notes.length, ownBar); await T.tapTxt('button', /^✕$/); await sleep(200); return {n0, n1}; });
await atBar(10); await act('tap mark → ×2', async () => { await ensureSong(); await closePop(); const i = await T.info(); const m = i.marks.find(m => m.x1 > 40 && m.x0 < 260); if (!m) return 'no mark'; await T.tap(i.canvas.x + Math.max(m.x0, 4) + 10, i.canvas.y + 9, 250); if (!/msheet/.test(await T.pop() || '')) return 'no msheet ' + await T.pop(); await T.tapPop(/^×2$/); await sleep(200); await closePop(); return {m: m.label, bars: await E(() => SYNQUENZER.song().bars)}; });
await atBar(13); await act('drag REFRAIN key → SONG ⇄ → insert', async () => { await closePop(); await T.tapSel('.sv-sw'); await sleep(250); const k = await E(() => { const k = document.querySelectorAll('#partBar .pk')[1]; const r = k.getBoundingClientRect(); return {cx: r.x + r.width / 2, cy: r.y + r.height / 2}; }); const cn = await T.rect('.corner.sw'); await T.down(k.cx, k.cy); await sleep(480); await T.glide(k.cx, k.cy, cn.cx, cn.cy, 8, 16); const i = await T.info(); const b = Math.ceil(i.x0 / 36) + 3; await T.glide(cn.cx, cn.cy, i.canvas.x + b * 36 - i.x0 + 3, i.canvas.y + 150, 12, 16); const d = (await T.info()).drag; await T.up(); await sleep(300); if (/plsheet/.test(await T.pop() || '')) { await T.tapPop(/^Einfügen/); await sleep(200); } return {n: d && d.n, bars: await E(() => SYNQUENZER.song().bars)}; });
await atBar(17); await act('CLIPS ⇄ + ▶2 (touch, hand)', async () => { await closePop(); if (await T.songOn()) { await T.tapSel('.sv-sw'); await sleep(200); } return !!(await T.tapTxt('button.scn', /^▶\s*2/)); });
await atBar(20); await act('▶1 (touch)', () => T.tapTxt('button.scn', /^▶\s*1/).then(b => !!b));
await atBar(22); await act('↩ SONG', () => E(() => { SYNQUENZER.backToSong(); return SYNQUENZER.runtime().song.override; }));
await atBar(25); await act('undo ×3 / redo ×3', () => E(() => { for (let k = 0; k < 3; k++) SYNQUENZER.undo(); for (let k = 0; k < 3; k++) SYNQUENZER.redo(); return SYNQUENZER.undoInfo().n; }));
await atBar(28); await act('Eine Skala aus', () => E(() => { SYNQUENZER.setHarmony({oneScale: false}); return SYNQUENZER.runtime().harmony.oneScale; }));
await atBar(30); await act('Eine Skala an, Stärke 50 %', () => E(() => { SYNQUENZER.setHarmony({oneScale: true, osAmt: .5}); return [SYNQUENZER.runtime().harmony.oneScale, SYNQUENZER.runtime().harmony.osAmt]; }));
await atBar(32); await act('Stärke 100 %, Drums mittransponieren', () => E(() => { SYNQUENZER.setHarmony({osAmt: 1, drums: true}); return SYNQUENZER.runtime().harmony.drums; }));
await atBar(34); await act('⇅ TRANSP. (touch) + chords Dm G Em A (hand over song)', async () => { await T.tapSel('#segTr'); await E(() => { const c = document.querySelector('#coach button'); if (c && c.getClientRects().length) c.click(); }); return E(([seq, b0]) => new Promise(res => { let k = 0; const iv = setInterval(() => { const b = audBeat(); if (k < seq.length && b >= b0 + 4 * k + .04) { SYNQUENZER.keyOn(seq[k], .8, 'h' + k); const kk = k; setTimeout(() => SYNQUENZER.keyOff(0, 'h' + kk), 100); k++; } if (k >= seq.length) { clearInterval(iv); res(seq.length); } }, 2); }), [[50, 55, 52, 57], 35 * 4]); });
await atBar(40); await act('↩ SONG + ♪ SPIELEN', async () => { await E(() => SYNQUENZER.backToSong()); await T.tapSel('#segPlay'); return E(() => [SYNQUENZER.runtime().song.override, SYNQUENZER.runtime().kbMode]); });
await atBar(42); await act('select bar ahead (ruler) → ● → Overdub NOTEN → START', async () => { await ensureSong(); await closePop(); const sp = await E(() => SYNQUENZER.runtime().song.beat); const i = await T.info(); let b = Math.floor(sp / 4) + 2; const x = i.canvas.x + b * 36 - i.x0 + 18; if (x > 380) return 'bar not visible ' + b; await T.tap(x, i.canvas.y + 9, 200); if ((await T.info()).mark) await T.tap(x, i.canvas.y + 9, 200); await closePop(); const sel = (await T.info()).sel; await T.tapSel('.sv-rec'); await sleep(250); const pt = await T.popTexts(); if (!pt) return 'no sheet'; await T.tapSel('.pop.rstart .rs-m[data-m="overdub"]'); await sleep(80); for (const nm of ['CLIPS', 'AKKORDE']) { const on = await E(n => { const b = [...document.querySelectorAll('.pop.rstart .rs-t')].find(b => b.textContent.trim().replace('✓', '') === n); return b && b.classList.contains('on'); }, nm); if (on) await T.tapTxt('.pop.rstart .rs-t', new RegExp(nm)); } const head = await E(() => document.querySelector('.pop.rstart .rs-h b').textContent); await T.tapSel('.pop.rstart .rs-go'); return {sel, head, b}; });
await atBar(43); await act('play 2 notes in the take', async () => { const st = await E(() => SYNQUENZER.runtime().song); const b = res['select bar ahead (ruler) → ● → Overdub NOTEN → START'].b; if (b == null) return 'skip'; await p.waitForFunction(x => SYNQUENZER.runtime().song.beat >= x, b * 4 + .9, {timeout: 20000, polling: 5}); await E(() => SYNQUENZER.keyOn(84, .8, 'q1')); await sleep(150); await E(() => SYNQUENZER.keyOff(84, 'q1')); await p.waitForFunction(x => SYNQUENZER.runtime().song.beat >= x, b * 4 + 2.9, {timeout: 20000, polling: 5}); await E(() => SYNQUENZER.keyOn(86, .8, 'q2')); await sleep(150); await E(() => SYNQUENZER.keyOff(86, 'q2')); await p.waitForFunction(x => SYNQUENZER.runtime().song.beat >= x || SYNQUENZER.runtime().song.beat < x - 8, b * 4 + 4.5, {timeout: 20000, polling: 5}); return E(() => ({rec: SYNQUENZER.runtime().song.rec, top: SYNQUENZER.undoInfo().top && SYNQUENZER.undoInfo().top.label})); });
await atBar(48); await act('◧ → ▦ (touch)', async () => { await ensureSong(); await closePop(); await T.tapSel('.sv-gl'); return (await T.info()).view; });
await atBar(50); await act('mark sheet ✕ Löschen', async () => { await ensureSong(); await closePop(); const i = await T.info(); const m = i.marks.find(m => m.x1 > 40 && m.x0 < 260); if (!m) return 'no mark'; await T.tap(i.canvas.x + Math.max(m.x0, 4) + 10, i.canvas.y + 9, 250); if (!/msheet/.test(await T.pop() || '')) return 'no msheet'; await T.tapPop(/Löschen/); await sleep(150); await closePop(); return {m: m.label, bars: await E(() => SYNQUENZER.song().bars)}; });
await atBar(52); await act('undo (Löschen)', () => E(() => { SYNQUENZER.undo(); return SYNQUENZER.song().bars; }));
await atBar(55); await act('mark drag over ⧉ → copy', async () => { await ensureSong(); await closePop(); const i = await T.info(); const m = i.marks.find(m => m.x1 > 40 && m.x0 < 200); if (!m) return 'no mark'; const sx = i.canvas.x + Math.max(m.x0, 4) + 12, sy = i.canvas.y + 9; await T.down(sx, sy); await sleep(500); await T.glide(sx, sy, sx, sy + 30, 4, 16); const cp = await T.rect('.sv-sw'); await T.glide(sx, sy + 30, cp.cx, cp.cy, 8, 16); await sleep(320); const i2 = await T.info(); const b = Math.ceil(i2.x0 / 36) + 6; await T.glide(cp.cx, cp.cy, i2.canvas.x + b * 36 - i2.x0 + 3, i2.canvas.y + 120, 12, 16); const d = (await T.info()).drag; await T.up(); await sleep(300); if (/plsheet/.test(await T.pop() || '')) { await T.tapPop(/^Einfügen/); await sleep(200); } return {m: m.label, d: d && {n: d.n, copy: d.copy}, bars: await E(() => SYNQUENZER.song().bars)}; });
await atBar(59); await act('hold own cell → [Zurück zum Szenen-Clip]', async () => { await ensureSong(); await closePop(); const s = await E(() => SYNQUENZER.song()); const i = await T.info(); const L = s.lanes[0].filter(e => e.own); const vis = L.find(e => e.bar * 36 - i.x0 > 4 && e.bar * 36 - i.x0 < 290); if (!vis) return 'no visible own clip ' + JSON.stringify(L.map(e => e.bar)) + ' x0 ' + i.x0; const c = await T.cell('S1', vis.bar); await T.down(c.x, c.y); await sleep(520); await T.up(); await sleep(250); await T.tapPop(/Zurück zum Szenen-Clip/); await sleep(150); return {bar: vis.bar, own: await E(b => !!SYNQUENZER.ownClip(0, b), vis.bar)}; });
await atBar(63); await act('edit scene clip Synth 1 Sz1 (+ note)', () => E(() => { const c = SYNQUENZER.getClip(0, 0); c.notes.push({t: 3.5, d: .25, n: 43, v: .9}); SYNQUENZER.setClip(0, 0, c); return c.notes.length; }));
await atBar(66); await act('hold S3 cell → [Ganzer Block]', async () => { await ensureSong(); await closePop(); const b = await visBar(2); const c = await T.cell('S3', b); await T.down(c.x, c.y); await sleep(520); await T.up(); await sleep(250); if (!/csheet/.test(await T.pop() || '')) return 'no csheet ' + await T.pop(); await T.tapPop(/^Ganzer Block/); await sleep(150); return E(() => Object.keys(SYNQUENZER.song().own || {}).length); });
await atBar(70); await act('undo (Ganzer Block)', () => E(() => { SYNQUENZER.undo(); return Object.keys(SYNQUENZER.song().own || {}).length; }));
await atBar(74); await act('Drums bleiben', () => E(() => { SYNQUENZER.setHarmony({drums: false}); return SYNQUENZER.runtime().harmony.drums; }));
}
await atBar(MIN * 30); const tStop = await E(() => AU.ctx.currentTime);
await act('■ stop (touch)', async () => { await closePop(); return T.tapSel('#bPlay').then(b => !!b); });
await sleep(4000);
const fin = await E(() => ({voices: SYNQUENZER.voices().filter(v => v.state !== 'off'), live: SYNQUENZER.runtime().liveVoices, te: SYNQUENZER.tickErrors(), playing: SYNQUENZER.runtime().playing}));
const A = await E(tStop => {
  const Q = window.__q; clearInterval(Q.poll); cancelAnimationFrame(Q.raf); for (const x of SYNQUENZER.noteLog(4096)) Q.notes.set(x.seq, x);
  try { AU.M.ceil.disconnect(Q.node); } catch (e) {}
  const sr = Q.sr, N = Q.n, x = Q.buf.subarray(0, N), t0 = Q.f0 / sr;
  let nan = 0, peak = 0; for (let i = 0; i < N; i++) { const v = x[i]; if (v !== v) nan++; else if (Math.abs(v) > peak) peak = Math.abs(v); }
  const hp = (inp, f, q) => { const w = 2 * Math.PI * f / sr, a = Math.sin(w) / (2 * q), cw = Math.cos(w), b0 = (1 + cw) / 2, b1 = -(1 + cw), b2 = b0, a0 = 1 + a, a1 = -2 * cw, a2 = 1 - a; const y = new Float32Array(inp.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < inp.length; i++) { const v = (b0 * inp[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = inp[i]; y2 = y1; y1 = v; y[i] = v; } return y; };
  const h = hp(hp(x, 5000, .5412), 5000, 1.3066);
  const W = Math.round(sr * .002), e = []; for (let i = 0; i + W <= N; i += W) { let s = 0; for (let k = i; k < i + W; k++) s += h[k] * h[k]; e.push(s / W + 1e-20); }
  const onD = [...Q.notes.values()].filter(n => n.time != null && n.track === 4).map(n => n.time).sort((a, b) => a - b), onS = [...Q.notes.values()].filter(n => n.time != null && n.track !== 4).map(n => n.time).sort((a, b) => a - b);
  const last = (arr, t) => { let lo = 0, hi = arr.length - 1, r = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (arr[m] <= t + .0025) { r = m; lo = m + 1; } else hi = m - 1; } return r < 0 ? -1e9 : arr[r]; };
  const nearOn = t => t - last(onD, t) <= .040 || t - last(onS, t) <= .008;
  const flags = [];
  for (let j = 10; j < e.length - 10; j++) { const t = t0 + j * .002; if (t > tStop) break; const nb = e.slice(j - 10, j + 11).filter((_, k) => k !== 10).sort((a, b) => a - b), med = nb[10]; const db = 10 * Math.log10(e[j] / med); if (db > 6 && e[j] > 1e-9 && !nearOn(t)) flags.push({t: +t.toFixed(3), b: +t2b(t).toFixed(2), db: +db.toFixed(1), lv: +(10 * Math.log10(e[j])).toFixed(1)}); }
  const W5 = Math.round(sr * .005), r5 = []; for (let i = 0; i + W5 <= N; i += W5) { let s = 0; for (let k = i; k < i + W5; k++) s += x[k] * x[k]; r5.push(10 * Math.log10(s / W5 + 1e-20)); }
  const drops = []; const mean = a => 10 * Math.log10(a.reduce((s, v) => s + Math.pow(10, v / 10), 0) / a.length);
  for (let j = 10; j < r5.length - 10; j++) { const t = t0 + j * .005; if (t > tStop) break; if (r5[j] < -70 && mean(r5.slice(j - 10, j)) > -35 && mean(r5.slice(j + 1, j + 11)) > -35) drops.push({t: +t.toFixed(3), b: +t2b(t).toFixed(2), db: +r5[j].toFixed(0)}); }
  const zr = []; for (let i = 0; i < N; i++) { if (x[i] !== 0) continue; let j = i; while (j < N && x[j] === 0) j++; const L = j - i; if (L >= 32 && i > 441) { let s = 0; for (let k = i - 441; k < i; k++) s += x[k] * x[k]; const pre = 10 * Math.log10(s / 441 + 1e-20); if (pre > -45 && (t0 + i / sr) < tStop) zr.push({t: +(t0 + i / sr).toFixed(4), b: +t2b(t0 + i / sr).toFixed(2), len: L, pre: +pre.toFixed(1)}); } i = j; }
  // 1-s RMS curve (to see level jumps / silence stretches)
  const rms1 = []; for (let i = 0; i + sr <= N; i += sr) { let s = 0; for (let k = i; k < i + sr; k++) s += x[k] * x[k]; rms1.push(+(10 * Math.log10(s / sr + 1e-20)).toFixed(1)); }
  const secs = N / sr;
  return {nulls: Q.nulls.length, gaps: Q.gaps.length, zr, secs: +secs.toFixed(1), nan, peakDb: +(20 * Math.log10(peak + 1e-12)).toFixed(1), flags, drops, notes: Q.notes.size, acts: Q.acts, vc: Q.vc, lt: Q.lt, fps: +(Q.frames / secs).toFixed(1), rms1};
}, tStop);
const NS = await E(() => window.__q.n), CH = 1 << 20; const parts = [];
for (let o = 0; o < NS; o += CH) parts.push(Buffer.from(await E(([o, CH]) => { const x = window.__q.buf.subarray(o, Math.min(o + CH, window.__q.n)); let s = ''; const u = new Uint8Array(x.buffer, x.byteOffset, x.byteLength); for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); return btoa(s); }, [o, CH]), 'base64'));
fs.writeFileSync(OUT + TAG + '-audio.f32', Buffer.concat(parts));
fs.writeFileSync(OUT + TAG + '-meta.json', JSON.stringify(await E(() => { const Q = window.__q; return {sr: Q.sr, f0: Q.f0, n: Q.n, notes: [...Q.notes.values()].map(n => [n.time, n.track, n.src, n.out, n.dur]), acts: Q.acts, spb: 60 / SYNQUENZER.runtime().bpm}; })));
console.log('recorded', A.secs, 's; notes', A.notes, '; peak', A.peakDb, 'dBFS; NaN', A.nan, '; fps', A.fps, '; longtasks', JSON.stringify(A.lt));
console.log('rms per s', JSON.stringify(A.rms1));
console.log('click flags', A.flags.length, JSON.stringify(A.flags.slice(0, 40)));
console.log('dropouts', A.drops.length, JSON.stringify(A.drops.slice(0, 20)));
console.log('zero runs', A.zr.length, JSON.stringify(A.zr.slice(0, 20)), 'recorder gaps', A.gaps, 'nulls', A.nulls);
const nearAct = A.flags.map(f => { const a = A.acts.filter(a => f.t >= a.t - .05 && f.t <= a.t + 8.5).pop(); return a ? a.n : '-'; });
const byAct = {}; nearAct.forEach(n => byAct[n] = (byAct[n] || 0) + 1); console.log('flags by preceding action (≤ 8.5 s after)', JSON.stringify(byAct));
check('3 min: recorded ≥ ' + (MIN * 60 - 5) + ' s', A.secs >= MIN * 60 - 5, A.secs);
check('no NaN, no clipping (peak < 0 dBFS)', A.nan === 0 && A.peakDb < 0, {nan: A.nan, peak: A.peakDb});
check('M-KLICK: no flagged window outside planned onsets', A.flags.length === 0, A.flags.length);
check('no dropouts (digital silence between sound)', A.drops.length === 0 && A.zr.length === 0, [A.drops.length, A.zr.length]);
check('no stuck notes 4 s after ■', fin.voices.length === 0 && !fin.live, fin);
check('tickErrors 0', !fin.te, fin.te);
check('no console errors', errs.length === 0, errs.slice(0, 5));
check('no longtask > 50 ms', !A.lt.some(x => x[0] > 50), A.lt.map(([d, st]) => { const a = A.acts.filter(a => a.pn != null && a.pn <= st + 5).pop(); return d + ' ms after ' + (a ? a.n + ' +' + (st - a.pn) + 'ms' : '?'); }));
check('all actions ran (no ERR / missing sheet)', !Object.values(res).some(r => typeof r === 'string' && /ERR|no |not visible/.test(r)), Object.entries(res).filter(([k, r]) => typeof r === 'string' && /ERR|no |not visible/.test(r)));
const cons = await E(() => { const s = SYNQUENZER.song(), bad = []; if (!s) return ['no song'];
  s.lanes.forEach((l, t) => { for (let k = 1; k < l.length; k++) if (l[k].bar <= l[k - 1].bar) bad.push('lane ' + t + ' not strictly sorted at ' + l[k].bar); l.forEach(e => { if (e.own && !(s.own && s.own[e.own])) bad.push('lane ' + t + ' bar ' + e.bar + ' own ' + e.own + ' missing'); if (e.bar >= s.bars) bad.push('lane ' + t + ' entry behind the end ' + e.bar); }); });
  const used = new Set(s.lanes.flat().filter(e => e.own).map(e => e.own)); for (const k in (s.own || {})) if (!used.has(k)) bad.push('orphan own ' + k);
  const ms = s.marks.slice().sort((a, b) => a.a - b.a); ms.forEach((m, k) => { if (m.a + m.len > s.bars) bad.push('mark ' + m.id + ' behind the end'); if (k && ms[k - 1].a + ms[k - 1].len > m.a) bad.push('marks overlap ' + ms[k - 1].id + '/' + m.id); });
  return bad; });
check('Song-Daten nach allen Aktionen konsistent (Lanes sortiert, eigene Clips vorhanden, keine Waisen, Marken ohne Überlappung)', cons.length === 0 || BASE, cons);
fs.writeFileSync(OUT + TAG + '-result.json', JSON.stringify({A, fin, errs, res}, null, 1));
fs.writeFileSync(OUT + TAG + '-project.json', JSON.stringify(await E(() => SYNQUENZER.project())));
await T.br.close(); done();
