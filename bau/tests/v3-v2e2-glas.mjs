// V2e′ acceptance – Glas and eigener Clip (CDP touch, P1 or L1): N7S-46, N7S-47 (K2-24), N7S-48; hörbar (Mitschnitt): eine
// in ROLLE gezeichnete Note eines eigenen Clips klingt nur in T5; PE1 ≥ 55 fps mit 8 Spuren in Glas
import { openVp, mk2, SETUP, sleep } from './v3-v2e2-lib.mjs';
import { eq, mkCheck } from './v3-v2d-lib.mjs';
const VP = process.argv[2] || 'P1';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp(VP);
const T = mk2(p, cdp), {E} = T;
const noUi = j => { const o = JSON.parse(j); delete o.ui; return JSON.stringify(o); };
await E(SETUP(true)); await E(() => window.SYNQUENZER.songView(true)); await sleep(250);
const C0 = await T.clips(), P0 = noUi(await T.full());
// ---------- N7S-46: the switch, one tile per Durchlauf, same row height, no data change
const gl = await T.rect('.sv-gl');
const P = VP[0] === 'P';
check(`${VP} N7S-46 Umschalter ▦│◧ ${P ? '44×40 in der Transportzeile' : 'in der Transport-Spalte'}`, gl && (P ? Math.abs(gl.w - 44) <= .5 && Math.abs(gl.h - 40) <= .5 : gl.w >= 36 && gl.h >= 36), gl);
const i0 = await T.info();
await T.tap(gl.x + gl.w / 2, gl.y + gl.h / 2);
let inf = await T.info();
check(`${VP} N7S-46 Tipp → Glas; Zeilenhöhe, Taktbreite, Zeilen gleich`, inf.view === 'glass' && inf.rowH === i0.rowH && inf.cellW === i0.cellW && eq(inf.rows, i0.rows), [inf.view, inf.rowH, i0.rowH]);
check(`${VP} N7S-46 Umschalten ändert keine Daten, kein Undo`, noUi(await T.full()) === P0);
// tiles: Bass (Synth 1) 1-bar clip Sz1 in T3–6 → 4 tiles of 1 bar; Fläche (Synth 2) 4-bar clip → one tile T3–6
const tl = inf.tiles, bass = tl.filter(x => x.t === 0 && x.a >= 2 && x.a < 6), pad = tl.filter(x => x.t === 1 && x.a === 2);
check(`${VP} N7S-46 je Durchlauf eine Kachel (Bass 4 × 1 Takt, Fläche 1 × 4 Takte)`, bass.length === 4 && bass.every(x => x.b - x.a === 1) && pad.length === 1 && pad[0].b === 6, [bass, pad]);
// the note rectangles per tile = the notes of that Durchlauf, counted from the real playback (noteLog, synth tracks)
await E(() => { const Q = window.SYNQUENZER; Q.setBpm(240); Q.clearLog(); Q.songPlay(0); });
await p.waitForFunction(() => { const s = window.SYNQUENZER.runtime().song; return s.beat != null && s.beat >= 36.5; }, null, {timeout: 30000, polling: 20});
const log = await E(() => window.SYNQUENZER.noteLog(2000).map(n => ({t: n.track, b: n.beat})));
await E(() => window.SYNQUENZER.songPlay(false)); await sleep(200);
const vis = tl.filter(x => x.t <= 3 && x.b <= 9);
const bad = vis.filter(x => x.n !== log.filter(n => n.t === x.t && n.b >= x.a * 4 - 1e-3 && n.b < x.b * 4 - 1e-3).length);
check(`${VP} N7S-46 Noten-Rechtecke je Kachel = Noten des Durchlaufs (${vis.length} Kacheln)`, vis.length >= 8 && !bad.length, bad.slice(0, 4));
// ≤ 160: a 4-bar clip with 300 notes
await T.tapSel('.sv-home'); await sleep(150);
await E(() => { const Q = window.SYNQUENZER, ns = []; for (let k = 0; k < 300; k++) ns.push({t: k * 16 / 300, d: .04, n: 60 + (k % 12), v: .7}); Q.setClip(1, 1, {len: 4, key: {root: 9, scale: 'aeolian'}, notes: ns}); });
await sleep(150); inf = await T.info();
const big = inf.tiles.find(x => x.t === 1 && x.a === 2);
check(`${VP} N7S-46 höchstens 160 Mini-Noten je Kachel`, big && big.n === 160, big);
await E(() => window.SYNQUENZER.undo()); await sleep(100);
await p.screenshot({path: `v3-v2e2-glas-${VP}.png`});
// ---------- PE1: 8 tracks, glass, the song playing → ≥ 55 fps, no long task > 50 ms
const pe = await E(async () => {
  const Q = window.SYNQUENZER; Q.addTrack(); Q.addTrack();
  const K = {root: 9, scale: 'aeolian'};
  for (const t of [6, 7]) { const ns = []; for (let k = 0; k < 16; k++) ns.push({t: k / 4, d: .2, n: 60 + k % 7, v: .7}); Q.setClip(t, 0, {len: 1, key: K, notes: ns}); }
  const s = Q.song(); s.lanes[6] = [{bar: 0, slot: 0}]; s.lanes[7] = [{bar: 2, slot: 0}]; Q.setSong(s);
  Q.songViewMode('glass'); Q.setBpm(120); Q.songPlay(0);
  await new Promise(r => setTimeout(r, 400));
  let lt = 0; const po = new PerformanceObserver(l => { for (const e of l.getEntries()) if (e.duration > 50) lt++; }); try { po.observe({entryTypes: ['longtask']}); } catch (e) {}
  const fr = []; let last = performance.now(); const t0 = last;
  await new Promise(r => { const f = () => { const n = performance.now(); fr.push(n - last); last = n; if (n - t0 < 4000) requestAnimationFrame(f); else r(); }; requestAnimationFrame(f); });
  po.disconnect(); Q.songPlay(false);
  const i = Q.svLayoutInfo();
  return {fps: +(1000 / (fr.reduce((a, b) => a + b, 0) / fr.length)).toFixed(1), worst: +Math.max(...fr).toFixed(1), lt, rows: i.rows.length, tiles: (i.tiles || []).length};
});
check(`${VP} PE1 8 Spuren in Glas: ≥ 55 fps, keine longtask > 50 ms`, pe.fps >= 55 && pe.lt === 0, pe);
await E(() => { const Q = window.SYNQUENZER; Q.undo(); Q.removeTrack && Q.removeTrack(); Q.removeTrack && Q.removeTrack(); });
// fresh setup for the own clips
await E(SETUP(true)); await E(() => { window.SYNQUENZER.songView(true); window.SYNQUENZER.songViewMode('squares'); }); await sleep(250);
const S0 = await E(() => JSON.stringify(window.SYNQUENZER.song())), C1 = await T.clips();
inf = await T.info();
const cell = (t, bar) => { const r = inf.rows.indexOf(['S1', 'S2', 'S3', 'S4'][t]) - 1; return {x: inf.canvas.x + bar * 36 + 18 - inf.x0, y: inf.canvas.y + inf.rulerH + r * inf.rowH + inf.rowH / 2}; };
const holdCell = async (t, bar, ms = 520) => { const c = cell(t, bar); await T.down(c.x, c.y); await sleep(ms); await T.up(); await sleep(250); };
// ---------- N7S-47 (a): hold Synth 1 in T5 → Zell-Blatt (L4: only at the release) → [Eigener Clip] → own clip T5 only
if (inf.bank) { await T.tapSel('.sv-bank'); await sleep(150); inf = await T.info(); }
let c5 = cell(0, 4);
await T.down(c5.x, c5.y); await sleep(520);
check(`${VP} N7S-47 Halten: noch kein Blatt, Zelle angehoben (weißer Rand)`, !(await T.pop()) && (await T.info()).cell && (await T.info()).cell.a === 4);
await T.up(); await sleep(250);
let pc = await T.pop(), acts = await E(() => [...document.querySelectorAll('#popLayer .pop button[data-a]')].map(b => b.dataset.a));
check(`${VP} N7S-47 Loslassen → Zell-Blatt [Eigener Clip (dieser Durchlauf)] [Ganzer Block] [Abbrechen]`, (pc || '').includes('csheet') && eq(acts, ['x', 'own', 'whole', 'x']), acts);
check(`${VP} K2-24 erst der Tipp ändert Daten`, (await E(() => JSON.stringify(window.SYNQUENZER.song()))) === S0);
await T.tapPop('Abbrechen'); await sleep(150);
check(`${VP} [Abbrechen] → nichts`, (await E(() => JSON.stringify(window.SYNQUENZER.song()))) === S0 && !(await T.pop()));
// hold + move > 8 px = scroll, never an own clip
await T.down(c5.x, c5.y); await sleep(520); await T.glide(c5.x, c5.y, c5.x - 40, c5.y, 4, 12); await T.up(); await sleep(250);
check(`${VP} K2-24 Halten + Bewegung > 8 px = Rollen, kein Blatt, keine Änderung`, !(await T.pop()) && (await E(() => JSON.stringify(window.SYNQUENZER.song()))) === S0);
inf = await T.info(); await E(() => { const i = window.SYNQUENZER.svLayoutInfo(); return i; });
if (inf.x0) { await T.tapSel('.sv-home'); await sleep(150); inf = await T.info(); }
const n0 = await T.undoN();
await holdCell(0, 4); await T.tapPop('Eigener Clip'); await sleep(250);
let oc4 = await E(() => window.SYNQUENZER.ownClip(0, 4)), oc3 = await E(() => window.SYNQUENZER.ownClip(0, 3)), oc5 = await E(() => window.SYNQUENZER.ownClip(0, 5));
check(`${VP} N7S-47 (a) eigener Clip nur T5 (1 Takt)`, oc4 && oc4.len === 1 && !oc3 && !oc5, [oc4 && oc4.len, !!oc3, !!oc5]);
const tb = await E(() => [...document.querySelectorAll('#toast button')].map(b => b.textContent));
check(`${VP} N7S-47 Toast „Takt 5: eigener Clip (aus Szene 1)“ [Bearbeiten] [Rückgängig]`, /Takt 5: eigener Clip \(aus Szene 1\)/.test(await E(() => document.getElementById('toast').textContent)) && tb.some(x => /Bearbeiten/.test(x)) && tb.some(x => /Rückgängig/.test(x)), tb);
check(`${VP} N7S-47 (a) Szenen-Clips deep-equal, ein Undo`, (await T.clips()) === C1 && (await T.undoN()) === n0 + 1);
const SA = await E(() => JSON.stringify(window.SYNQUENZER.song()));
// (b): Synth 1 in T9 (2-bar clip Sz3 from T8) → own T8–9; [Ganzer Block] → T8–11
await holdCell(0, 8); await T.tapPop('Eigener Clip'); await sleep(250);
let o7 = await E(() => window.SYNQUENZER.ownClip(0, 7)), o8 = await E(() => window.SYNQUENZER.ownClip(0, 8)), o9 = await E(() => window.SYNQUENZER.ownClip(0, 9));
check(`${VP} N7S-47 (b) eigener Clip T8–9 (der ganze Durchlauf)`, o7 && o8 && o7.id === o8.id && o7.len === 2 && !o9, [o7 && o7.len, o8 && o8.id, !!o9]);
check(`${VP} N7S-47 (b) Szenen-Clips deep-equal, ein Undo`, (await T.clips()) === C1 && (await T.undoN()) === n0 + 2);
await E(() => window.SYNQUENZER.undo()); await sleep(100);
await holdCell(0, 8); await T.tapPop('Ganzer Block'); await sleep(250);
o7 = await E(() => window.SYNQUENZER.ownClip(0, 7)); const o10 = await E(() => window.SYNQUENZER.ownClip(0, 10));
check(`${VP} N7S-47 [Ganzer Block] bei (b) → eigener Clip T8–11`, o7 && o10 && o7.id === o10.id && o7.len === 4, [o7 && o7.len, o10 && o10.id]);
await E(() => window.SYNQUENZER.undo()); await sleep(100);
check(`${VP} Undo → wie nach (a)`, (await E(() => JSON.stringify(window.SYNQUENZER.song()))) === SA);
// squares: the own clip has a white 1,5-px frame
const fr = await T.px(4 * 36 + 1.5 - inf.x0, inf.rulerH + 0 * inf.rowH + inf.rowH / 2);
check(`${VP} 9.1 Kästchen: eigener Clip mit weißem Rand`, fr[0] > 200 && fr[1] > 200 && fr[2] > 200, fr);
// ---------- N7S-48: tap the own clip → ROLLE on it; a drawn note sounds only in T5; undo kind own
c5 = cell(0, 4); await T.tap(c5.x, c5.y); await sleep(500);
const ro = await E(() => window.SYNQUENZER.roll());
const ttl = await E(() => (document.querySelector('#rollSheet .sh-title') || {}).textContent);
const inf2 = await E(() => (document.querySelector('#rollSheet .rinfo') || {}).textContent);
check(`${VP} N7S-48 Tipp → ROLLE auf dem eigenen Clip („Synth 1 · Song Takt 5“, „eigener Clip“)`, ro && ro.own === oc4.id && /Song Takt 5/.test(ttl) && /eigener Clip/.test(inf2), [ro && ro.own, ttl, inf2]);
await E(() => window.SYNQUENZER.rollApi().centerOn(57)); await sleep(100);
const xy = await E(() => window.SYNQUENZER.rollApi()._xy(1.0, 57));
await T.tap(xy.x, xy.y, 300);
const ocN = await E(() => window.SYNQUENZER.ownClip(0, 4)), ut = await E(() => window.SYNQUENZER.undoInfo().top);
check(`${VP} N7S-48 Note gezeichnet (57 bei Schlag 2), Undo-Art own`, ocN.notes.some(n => n.n === 57 && Math.abs(n.t - 1) < .01) && ut.kind === 'own', [ocN.notes, ut.kind]);
check(`${VP} N7S-48 Szenen-Clips deep-equal`, (await T.clips()) === C1);
await T.tapSel('#rollSheet .sh-x'); await sleep(250);
// hörbar: noteLog + Mitschnitt — the drawn note only in T5 (beats 16–20), not in T3, T4, T6
const run = () => E(async () => {
  const Q = window.SYNQUENZER; ensureAudio(); const c = AU.ctx;
  if (!window.__recN) { const src = `class R extends AudioWorkletProcessor{process(i){const x=i[0]&&i[0][0];if(x)this.port.postMessage(x.slice(0));return true;}}registerProcessor('v2e2-rec',R);`; await c.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src)); window.__recN = 1; }
  const n = new AudioWorkletNode(c, 'v2e2-rec'); const buf = new Float32Array(c.sampleRate * 9); let k = 0, on = false, t0 = 0;
  n.port.onmessage = e => { if (!on) return; const d = e.data; for (let i = 0; i < d.length && k < buf.length; i++) buf[k++] = d[i]; };
  AU.analyser.connect(n);
  Q.setBpm(240); Q.clearLog(); Q.songPlay(0);
  await new Promise(r => setTimeout(r, 30)); on = true; t0 = c.currentTime; const st = R.startTime;
  await new Promise(r => setTimeout(r, 7200)); on = false; Q.songPlay(false); AU.analyser.disconnect(n);
  const log = Q.noteLog(400).filter(x => x.track === 0).map(x => ({b: +x.beat.toFixed(2), src: x.src, cn: x.clipNote, out: x.out}));
  const x = buf.subarray(0, k), sr = c.sampleRate, off = Math.round((st - t0) * sr);
  const lvl = bar => { const a = off + Math.round((bar + .3) * sr), e = off + Math.round((bar + .45) * sr); let s = 0, m = 0; for (let i = Math.max(0, a); i < Math.min(x.length, e); i++) { s += x[i] * x[i]; m++; } return m ? +(10 * Math.log10(s / m + 1e-12)).toFixed(1) : null; };
  let d2 = 0; for (let i = 2; i < x.length; i++) d2 = Math.max(d2, Math.abs(x[i] - 2 * x[i - 1] + x[i - 2]));
  return {log, lv: [2, 3, 4, 5].map(lvl), d2: +d2.toFixed(4)};
});
const withN = await run();
const own57 = withN.log.filter(x => x.cn === 57);
check(`${VP} N7S-48 die Note erklingt nur in T5 (noteLog, Quelle own)`, own57.length === 1 && own57[0].b >= 16 && own57[0].b < 20 && own57[0].src === 'own', own57);
// [Zurück zum Szenen-Clip] via the hold sheet → the reference is back (deep-equal to before N7S-47)
await holdCell(0, 4);
acts = await E(() => [...document.querySelectorAll('#popLayer .pop button[data-a]')].map(b => b.dataset.a));
check(`${VP} 9.2 Halten auf eigenen Clip → [Bearbeiten] [Zurück zum Szenen-Clip] [Ganzer Block]`, eq(acts.filter(x => x !== 'x'), ['edit', 'back', 'whole']), acts);
await T.tapPop('Zurück zum Szenen-Clip'); await sleep(250);
check(`${VP} N7S-48 [Zurück zum Szenen-Clip] → deep-equal zum Zustand vor N7S-47`, (await E(() => JSON.stringify(window.SYNQUENZER.song()))) === S0);
const without = await run();
console.log('Pegel T3–T6 (Schlag 1,2–1,8) mit Note', withN.lv, 'ohne', without.lv);
check(`${VP} hörbar: T5 mit der gezeichneten Note ≥ 6 dB lauter als ohne, T3/T4/T6 gleich (±1 dB)`, withN.lv[2] - without.lv[2] >= 6 && [0, 1, 3].every(i => Math.abs(withN.lv[i] - without.lv[i]) <= 1), [withN.lv, without.lv]);
check(`${VP} M-KLICK: größte 2. Differenz mit eigenem Clip ≤ 1,5 × ohne`, withN.d2 <= 1.5 * without.d2 + 1e-4, [withN.d2, without.d2]);
check(`${VP} 0 Konsolenfehler`, errs.length === 0, errs);
await b.close();
process.exit(done() ? 1 : 0);
