// MIX3-Test: ein Blatt (D3), Live-Messung + Auto-Nachführen (MX3), Chor sauber (CH1a), Refrain groß (CH1b). Aufruf: node mix3-test.mjs <index.html> <ausgabe-ordner>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
import path from 'path';
const [file, out] = process.argv.slice(2);
if (!file || !out) { console.log('FEHLER Aufruf: node mix3-test.mjs <index.html> <ausgabe-ordner>'); process.exit(2); }
fs.mkdirSync(out, {recursive: true});
const res = []; const ok = (name, pass, info) => { res.push({name, pass: !!pass, info}); console.log((pass ? 'OK ' : 'FEHLER ') + name + (info !== undefined ? '  ' + JSON.stringify(info) : '')); };
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 428, height: 926}});
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + path.resolve(file)); await p.waitForTimeout(1500);
const shot = async (name, w, h) => { await p.setViewportSize({width: w, height: h}); await p.waitForTimeout(400); await p.screenshot({path: path.join(out, name)}); };

/* ---------- 1) D3: FX › MASTER [AUTO-MASTER] / [MIX-ASSISTENT] und der Master-Balken öffnen DAS eine Blatt ---------- */
await p.evaluate(async () => { SYNQUENZER.loadDemo(); SYNQUENZER.songFromChain([{scene: 0, bars: 4}, {scene: 1, bars: 4}]); ensureAudio(); await new Promise(r => setTimeout(r, 300)); openMasterPage(); });
await p.waitForTimeout(500);
const tapSel = async sel => { const e = await p.$(sel); if (!e) return false; await e.click(); await p.waitForTimeout(350); return true; };
const sheetState = () => p.evaluate(() => ({open: !!(UI.pop && UI.pop.name === 'mx2'), focus: (document.querySelector('.mx2s .mx2w .mx3f') || {dataset: {}}).dataset.v || null,
  oldBtns: [...document.querySelectorAll('.pop button')].filter(x => /^(Messen|Übernehmen)$/.test(x.textContent.trim())).length, amOpen: !!(UI.pop && UI.pop.name === 'am'), mixaOpen: !!(UI.pop && UI.pop.name === 'mixa')}));
const t1 = await tapSel('.mxab button[data-a="am"]'), s1 = await sheetState();
await p.evaluate(() => SYNQUENZER.mx2Close()); await p.waitForTimeout(250);
const t2 = await tapSel('.mxab button[data-a="mix"]'), s2 = await sheetState();
await p.evaluate(() => { SYNQUENZER.mx2Close(); try { closeEditor(); } catch (e) {} }); await p.waitForTimeout(400);
const t3 = await p.evaluate(() => { const m = document.querySelector('.mtrm'); if (!m) return false; m.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true})); m.click(); return true; });
await p.waitForTimeout(400);
let s3 = await sheetState();
if (!s3.open) { await tapSel('.mtrm'); s3 = await sheetState(); }
ok('D3: [AUTO-MASTER] öffnet das Mix-&-Master-Blatt (Weg Mastern hervorgehoben), kein Auto-Master-Blatt, kein [Messen]/[Übernehmen]', t1 && s1.open && s1.focus === 'am' && !s1.amOpen && !s1.oldBtns, s1);
ok('D3: [MIX-ASSISTENT] öffnet dasselbe Blatt (Weg Mischen hervorgehoben)', t2 && s2.open && s2.focus === 'mix' && !s2.mixaOpen, s2);
ok('D3: der Master-Pegel-Balken öffnet dasselbe Blatt', t3 && s3.open, s3);
const d15 = await p.evaluate(() => { const rows = [...document.querySelectorAll('.mx2s .mx2fr')].map(r => { const b = r.querySelector('[data-i]'), i = b ? +b.dataset.i : -1, sm = r.querySelector('.mx2fn small'); if (!S.tracks[i] || !sm) return null; const f = fxOfSound(S.tracks[i].sound); return {i, txt: sm.textContent, want: sx4DbTxt(f.vol, f.drive)}; }).filter(Boolean); return {n: rows.length, same: rows.every(r => r.txt.endsWith(r.want)), ex: rows.slice(0, 3)}; });
ok('D15: Spur-Pegel im Blatt = dieselbe dB-Zahl wie Spurkopf/FX › SPUR', d15.n > 0 && d15.same, d15);
await p.evaluate(() => SYNQUENZER.mx2Close());

/* ---------- 2) MX3: Messung live aus der laufenden Matrix, Auto-Nachführen nach einer Pegeländerung ---------- */
const L1 = await p.evaluate(async () => {
  const o = {}, wait = ms => new Promise(r => setTimeout(r, ms));
  let n = 0; const orig = window.vvRenderAudio; window.vvRenderAudio = function () { n++; return orig.apply(this, arguments); };
  stop(); await wait(200); R.selS = 0; SYNQUENZER.mix3.src('auto'); SYNQUENZER.mx2Sheet(); await wait(150);
  play(); await wait(500); o.matrix = R.playing && !R.songPlay; o.live = SYNQUENZER.mix3.info().live;
  const T0 = performance.now(); o.way = await SYNQUENZER.mx2Way('am'); o.ms = Math.round(performance.now() - T0);
  const I = SYNQUENZER.mix3.info(); o.src = I.cacheSrc; o.cap = I.lastCap; o.renders = n; o.amOn = !!(S.fxBus.am && S.fxBus.am.on && S.fxBus.am.mx2); o.auto = I.auto; o.node = !!(AU.M && AU.M.am && AU.M.am.node && AU.M.am.on);
  o.fit = SYNQUENZER.mx2Info().fit; o.lout = o.fit && o.fit.info.lout; o.gain0 = S.fxBus.am && S.fxBus.am.gain;
  window.__vr = () => n; return o;
});
ok('MX3: Mastern misst live aus der laufenden Szene (kein Song-Render), Master wirkt sofort', L1.way && L1.matrix && L1.live && L1.src === 'live' && L1.renders === 0 && L1.amOn && L1.node && L1.cap && L1.cap.sec >= 4 && L1.cap.sec <= 8, {ms: L1.ms, cap: L1.cap, renders: L1.renders, lout: L1.lout});
ok('MX3: Auto-Nachführen ist an, sobald das Blatt gemastert hat', L1.auto === true);
await shot('mix3-p-blatt.png', 428, 926);
const L2 = await p.evaluate(async () => {
  const o = {}, wait = ms => new Promise(r => setTimeout(r, ms)), I = () => SYNQUENZER.mix3.info();
  const f0 = I().follows, g0 = S.fxBus.am.gain;
  // Pegeländerung: lauteste Spur +6 dB (wie Wischen am Spurkopf)
  let k = -1, vmax = -1; S.tracks.forEach((t, i) => { if (t.sound && t.sound.fx && !t.mute && !t.stimme) { const v = fxOfSound(t.sound).vol; if (v > vmax) { vmax = v; k = i; } } });
  k = 0; const fx = S.tracks[k].sound.fx, v0 = fx.vol == null ? 0.8 : fx.vol; fx.vol = Math.min(1, v0 * Math.pow(10, 6 / 40)); applyTrackParams(k, false); markDirty();
  const T0 = performance.now(); o.dB = +(40 * Math.log10(fx.vol / v0)).toFixed(2);
  await wait(2500); o.at2_5 = {pending: I().pending, follows: I().follows - f0, busy: I().busy};
  let tStart = null; for (let n = 0; n < 200; n++) { await wait(100); const x = I(); if (x.busy && tStart == null) tStart = performance.now() - T0; if (x.follows > f0 && x.rampK >= 1) break; }
  o.tStart = tStart && Math.round(tStart); o.tDone = Math.round(performance.now() - T0); o.follows = I().follows - f0;
  const R0 = I().rampLog; o.ramp = {n: R0.length, ms: R0.length ? R0[R0.length - 1].t : 0, g0: R0.length ? R0[0].g : null, g1: R0.length ? R0[R0.length - 1].g : null, maxStep: +Math.max(0, ...R0.slice(1).map((x, j) => Math.abs(x.g - R0[j].g))).toFixed(3), mono: R0.every((x, j) => !j || (R0[R0.length - 1].g <= R0[0].g ? x.g <= R0[j - 1].g + 1e-6 : x.g >= R0[j - 1].g - 1e-6))};
  o.gain1 = S.fxBus.am.gain; o.dGain = +(o.gain1 - g0).toFixed(2); o.last = I().last; o.renders = window.__vr();
  o.fit = SYNQUENZER.mx2Info().fit; o.lout = o.fit && o.fit.info.lout; o.undoTop = UNDO[UNDO.length - 1] && UNDO[UNDO.length - 1].label;
  // nie während Aufnahme (Selbst singen scharf): Änderung → keine Messung, danach schon
  const f1 = I().follows; G6.arm = {k: 0, t: 0, s: 0, test: 1}; fx.vol = v0; applyTrackParams(k, false); markDirty();
  await wait(5600); o.recHold = {follows: I().follows - f1, pending: I().pending};
  G6.arm = null; for (let n = 0; n < 150; n++) { await wait(100); if (I().follows > f1 && I().rampK >= 1) break; }
  o.afterRec = I().follows - f1; o.gain2 = S.fxBus.am.gain;
  o.undoF = SYNQUENZER.mix3.undoFollow(); await wait(1700); o.gainUndo = S.fxBus.am.gain;
  return o;
});
ok('MX3: entprellt – 2,5 s nach der Änderung noch keine Messung, Start erst nach ≥ 4 s Ruhe', L2.at2_5.pending && L2.at2_5.follows === 0 && !L2.at2_5.busy && L2.tStart >= 3900, {at2_5: L2.at2_5, tStart: L2.tStart, tDone: L2.tDone});
ok('MX3: nachgeführt und gemessen – lautere Spur (+6 dB) → Master-Pegel kleiner, wieder auf Ziel', L2.follows === 1 && L2.dGain < -0.2 && Math.abs(L2.lout - (-14)) < 0.6 && L2.renders === 0, {dB: L2.dB, dGain: L2.dGain, lout: L2.lout, last: L2.last});
ok('MX3: sanft – der Master gleitet ≥ 1,3 s in vielen kleinen Schritten (nie springen)', L2.ramp.n >= 15 && L2.ramp.ms >= 1300 && L2.ramp.maxStep <= 0.6 && L2.ramp.mono, L2.ramp);
ok('MX3: kein eigener ↶-Schritt (Wiederholen bleibt heil), [↶ Nachführen zurück] geht', !/Master|Nachführen/.test(L2.undoTop || '') && L2.undoF && Math.abs(L2.gainUndo - L2.gain1) < 0.02, {undoTop: L2.undoTop, gain1: L2.gain1, gain2: L2.gain2, gainUndo: L2.gainUndo});
ok('MX3: nie während Aufnahme/Selbst-Singen – wartet, misst danach', L2.recHold.follows === 0 && L2.recHold.pending && L2.afterRec === 1, {recHold: L2.recHold, afterRec: L2.afterRec});
await shot('mix3-l-blatt.png', 926, 428);
await p.setViewportSize({width: 428, height: 926});
const L3 = await p.evaluate(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)); stop(); await wait(200); SYNQUENZER.mix3.src('live'); play(); await wait(400); const ok1 = await SYNQUENZER.mx2Way('mix'); stop(); return {ok: ok1, mixLive: SYNQUENZER.mix3.info().mixLive, T: MIXA.res ? MIXA.res.T.length : 0, caps: SYNQUENZER.mix3.info().caps}; });
ok('MX3: Mischen geht auch live (Analyse je Spur am laufenden Klang)', L3.ok && L3.mixLive && L3.T > 0, L3);
await p.evaluate(() => { SYNQUENZER.mix3.src('auto'); SYNQUENZER.mix3.auto(false); SYNQUENZER.mx2Close(); });

/* ---------- 3) CH1a: Chor sauber – Silben-Anfänge der eigenen Chor-Aufnahme an den Lead ---------- */
const C1 = await p.evaluate(async () => {
  const o = {}, wait = ms => new Promise(r => setTimeout(r, ms)), sr = 48000, N = Math.round(4 * sr);
  const ON = [0.30, 0.80, 1.30, 1.80, 2.45, 2.95, 3.45], MI = [64, 67, 69, 67, 64, 62, 60], JIT = [0.028, -0.032, 0.018, -0.036, 0.025, -0.022, 0.034];
  const syl = (jit, ct, gain) => { const x = new Float32Array(N); ON.forEach((t0, k) => { const f0 = 440 * Math.pow(2, (MI[k] - 69 + ct / 100) / 12), a = Math.round((t0 + jit[k]) * sr), n = Math.round(0.34 * sr);
    for (let i = 0; i < n && a + i < N; i++) { const t = i / sr, env = Math.min(1, t / 0.006) * (t > 0.3 ? Math.max(0, 1 - (t - 0.3) / 0.04) : 1); let s = 0; for (let h = 1; h * f0 < 4000; h++) { const f = h * f0, w = Math.exp(-Math.pow((f - 750) / 260, 2)) + 0.6 * Math.exp(-Math.pow((f - 1200) / 300, 2)) + 0.25 * Math.exp(-Math.pow((f - 2600) / 500, 2)); s += w * Math.sin(2 * Math.PI * f * t) / Math.sqrt(h); } x[a + i] += gain * env * s; } });
    let m = 0; for (const v of x) m = Math.max(m, Math.abs(v)); return Int16Array.from(x, v => Math.round(v / m * 0.5 * 32767)); };
  const lead = syl(ON.map(() => 0), 0, 1), voice = syl(JIT, 18, 1);
  const L = await SYNQUENZER.tkInject({pcm: Array.from(lead), sr, scene: 2, len: 2}); const r = {t: L.track, s: L.scene}; o.lead = L.id;
  const vid = await SYNQUENZER.mix3.testTake(Array.from(voice), sr); o.voice = vid;
  const st = stimmeT(); S.tracks[st].chor = {lanes: [{id: 'c1', role: 'free', name: 'Chor eigene Stimme'}]};
  const len = +(N / sr).toFixed(6);
  SYNQUENZER.g6pPut(r, {v: 2, grp: {below: 8, hp: 120, mid: -2, midF: 400, air: 2, sib: 0, rev: 0.3, pre: 'aus', dly: 0.1}, voices: [{lane: 'c1', rule: 'free', n: ON.map((t, k) => ({t0: t, t1: t + 0.34, m: MI[k], d: 0, iv: 0})), db: -3, pan: 0.5, w: 0.2, dbl: [{ms: 0, ct: 0, p: 0}], take: {take: vid, in: 0, out: len, at: 0}, dblOff: true}]});
  await wait(300);
  o.before = await SYNQUENZER.mix3.dev(r, 0, false);
  const n0 = UNDO.length; o.clean = await SYNQUENZER.mix3.clean(r); o.undoSteps = UNDO.length - n0; o.label = UNDO[UNDO.length - 1] && UNDO[UNDO.length - 1].label;
  const m = S.takes[vid], a = tkRef(r).a; o.warp = m.warp ? {mode: m.warp.mode, n: m.warp.map.src.length} : null; o.cl = m.cl | 0; o.pitch = m.pitch ? {q: m.pitch.q, str: m.pitch.str, nat: m.pitch.nat, mode: m.pitch.mode} : null; o.ch1 = m.ch1 || null;
  o.grp = {hp: a.chor.grp.hp, sib: a.chor.grp.sib, rev: a.chor.grp.rev, pre: a.chor.grp.pre, ch1: a.chor.grp.ch1, leadRev: fxOfSound(S.tracks[st].sound).rev};
  o.after = await SYNQUENZER.mix3.dev(r, 0, true); o.last = SYNQUENZER.mix3.ch1().last;
  undo(); await wait(200); const m2 = S.takes[vid], a2 = tkRef(r).a; o.undone = {warp: !!m2.warp, cl: m2.cl | 0, pitch: !!m2.pitch, hp: a2.chor.grp.hp, ch1: a2.chor.grp.ch1 || null};
  redo(); await wait(200); o.redo = {warp: !!S.takes[vid].warp, hp: tkRef(r).a.chor.grp.hp};
  window.__r1 = r; return o;
});
ok('CH1a: Chor sauber richtet die Silben-Anfänge an den Lead aus (Onset-Abweichung vorher → nachher, gemessen am gehörten Take)', C1.clean && C1.before && C1.after && C1.before.ms > 15 && C1.after.ms < C1.before.ms * 0.4 && C1.after.max <= 15 && C1.warp && C1.warp.mode === 'stretch', {vorher: C1.before, nachher: C1.after, warp: C1.warp, ch1: C1.ch1});
ok('CH1a: Tonhöhe enger aber natürlich (G2 weich, Raster, natürlich 40), Säubern 60 %, Low-Cut ≥ 160 Hz, Zischlaute leiser, Chor hinter dem Lead', C1.cl === 60 && C1.grp.hp >= 160 && C1.grp.sib === -12 && C1.grp.rev > C1.grp.leadRev && C1.grp.pre !== 'aus' && (!C1.pitch || (C1.pitch.q && C1.pitch.mode === 'soft' && C1.pitch.nat === 40)), {pitch: C1.pitch, grp: C1.grp});
ok('CH1a: ein ↶ für alles (Takes + Stelle), ↷ wieder', C1.undoSteps === 1 && C1.label === 'Chor sauber' && !C1.undone.warp && C1.undone.cl === 0 && C1.undone.hp === 120 && C1.redo.warp && C1.redo.hp >= 160, {undone: C1.undone, redo: C1.redo});

/* ---------- 4) CH1b: Refrain groß – Breite, Lautheit, keine Clips, ↶ ---------- */
const C2 = await p.evaluate(async () => {
  const o = {}, wait = ms => new Promise(r => setTimeout(r, ms)), sr = 48000, N = Math.round(4 * sr);
  const ON = [0.30, 0.80, 1.30, 1.80, 2.45, 2.95, 3.45], MI = [64, 67, 69, 67, 64, 62, 60];
  const x = new Float32Array(N); ON.forEach((t0, k) => { const f0 = 440 * Math.pow(2, (MI[k] - 69) / 12), a = Math.round(t0 * sr), n = Math.round(0.34 * sr);
    for (let i = 0; i < n && a + i < N; i++) { const t = i / sr, env = Math.min(1, t / 0.006) * (t > 0.3 ? Math.max(0, 1 - (t - 0.3) / 0.04) : 1); let s = 0; for (let h = 1; h * f0 < 4000; h++) { const f = h * f0, w = Math.exp(-Math.pow((f - 750) / 260, 2)) + 0.6 * Math.exp(-Math.pow((f - 1200) / 300, 2)); s += w * Math.sin(2 * Math.PI * f * (t + 0.002 * Math.sin(2 * Math.PI * 5.5 * t))) / Math.sqrt(h); } x[a + i] += env * s; } });
  let mx = 0; for (const v of x) mx = Math.max(mx, Math.abs(v)); const pcm = Int16Array.from(x, v => Math.round(v / mx * 0.5 * 32767));
  const L = await SYNQUENZER.tkInject({pcm: Array.from(pcm), sr, scene: 3, len: 2}); const r = {t: L.track, s: L.scene}, st = L.track;
  S.scenes[3].name = 'Refrain'; SYNQUENZER.songFromChain([{scene: 3, bars: 2}]);
  // nur der Gesang im Render (die anderen Spuren stumm), damit Breite und Lautheit den Gesang zeigen
  S.tracks.forEach((t, i) => { if (i !== st) { t.mute = true; try { applyTrackParams(i, false); } catch (e) {} } });
  o.places = SYNQUENZER.mix3.ch1().places;
  const D = mixaDspMake(), meas = async () => { const rr = await vvRenderAudio({range: {a: 0, b: S.song.bars, sel: false}}); const Lc = rr.ch[0], Rc = rr.ch[1]; let m = 0, s = 0, pk = 0;
    for (let i = 0; i < Lc.length; i++) { const a = (Lc[i] + Rc[i]) / 2, d = (Lc[i] - Rc[i]) / 2; m += a * a; s += d * d; pk = Math.max(pk, Math.abs(Lc[i]), Math.abs(Rc[i])); }
    return {side: +(s / (m + s + 1e-20)).toFixed(4), I: +D.integ(D.kblocks([Lc, Rc], rr.sr)).toFixed(2), tp: +D.truePeak([Lc, Rc], 8, 32).toFixed(2), peak: +pk.toFixed(4)}; };
  o.before = await meas(); const fx0 = fxOfSound(S.tracks[st].sound); o.sends0 = {rev: fx0.rev, dly: fx0.dly};
  const snap0 = JSON.stringify(tkRef(r).a.chor || null), n0 = UNDO.length;
  o.big = await SYNQUENZER.mix3.big(null, null); o.undoSteps = UNDO.length - n0; o.label = UNDO[UNDO.length - 1] && UNDO[UNDO.length - 1].label;
  const c = tkRef(r).a.chor; o.chor = c ? {v: c.v, voices: c.voices.map(v => ({rule: v.rule, dbl: v.dbl.length, ms: v.dbl.map(d => d.ms), ct: v.dbl.map(d => d.ct), p: v.dbl.map(d => d.p), db: v.db, n: v.n.length})), grp: c.grp} : null;
  const fx1 = fxOfSound(S.tracks[st].sound); o.sends1 = {rev: fx1.rev, dly: fx1.dly};
  o.ready = await SYNQUENZER.g6pWait(r);
  const n1 = SYNQUENZER.mix3.ch1().throws; o.after = await meas(); o.throws = SYNQUENZER.mix3.ch1().throws - n1;
  undo(); await wait(300); o.undone = {chor: JSON.stringify(tkRef(r).a.chor || null) === snap0, rev: fxOfSound(S.tracks[st].sound).rev, dly: fxOfSound(S.tracks[st].sound).dly};
  redo(); await wait(300); o.redone = !!(tkRef(r).a.chor && tkRef(r).a.chor.grp.ch1 && tkRef(r).a.chor.grp.ch1.rg);
  S.tracks.forEach((t, i) => { if (t.mute && i !== st) { t.mute = false; try { applyTrackParams(i, false); } catch (e) {} } });
  window.__r2 = r; return o;
});
const v = C2.chor ? C2.chor.voices : [], uni = v.find(x => x.rule === 'uni'), oct = v.find(x => x.rule === 'oct-1'), chs = v.filter(x => /^ch\+/.test(x.rule));
ok('CH1b: Refrain groß setzt aus EINER Lead-Aufnahme die Chor-Gruppe: 3 enge Dopplungen (±5–12 ct, 10–30 ms, L/R), Oktave tiefer, Akkordtöne (Terz/Quinte)', C2.big && C2.places.length === 1 && uni && uni.dbl === 3 && uni.ct.every(q => Math.abs(q) >= 5 && Math.abs(q) <= 12) && uni.ms.every(q => q >= 10 && q <= 30) && uni.p.some(q => q < 0) && uni.p.some(q => q > 0) && oct && chs.length === 2 && C2.chor.grp.ch1 && C2.chor.grp.ch1.rg === 1, {voices: v.map(x => x.rule + '×' + x.dbl + ' n' + x.n), grp: C2.chor && C2.chor.grp});
ok('CH1b: Render – breiter (Seiten-Anteil), lauter, keine Clips (True-Peak ≤ 0 dBTP, Spitze < 1)', C2.ready && C2.after.side > C2.before.side + 0.03 && C2.after.I > C2.before.I + 1 && C2.after.peak < 1 && C2.after.tp <= 0, {vorher: C2.before, nachher: C2.after, wuerfe: C2.throws});
ok('CH1b: Echo-Würfe am Zeilenende geplant, Strophe trocken (STIMME-Sends klein)', C2.throws >= 1 && C2.sends1.rev <= 0.08 && C2.sends1.dly <= 0.04, {throws: C2.throws, sends0: C2.sends0, sends1: C2.sends1});
ok('CH1b: ein ↶ (Stelle + Chor-Spuren + Sends), ↷ wieder', C2.undoSteps === 1 && C2.label === 'Refrain groß' && C2.undone.chor && C2.undone.rev === C2.sends0.rev && C2.redone, {undone: C2.undone, redone: C2.redone});

/* ---------- 5) Bedienung: Chor-Blatt (Zeile „Gesang“), Marken-Blatt (Refrain), Ziele ≥ 44 px, ✕ sichtbar ---------- */
const U = await p.evaluate(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms)), o = {};
  SYNQUENZER.g6Sheet(window.__r2); await wait(400);
  const row = document.querySelector('.ch1row'); o.chorRow = row ? [...row.querySelectorAll('button')].map(b => ({t: b.textContent.trim(), h: Math.round(b.getBoundingClientRect().height), w: Math.round(b.getBoundingClientRect().width)})) : null;
  const pop = UI.pop && UI.pop.el, rc = pop && pop.getBoundingClientRect(); o.chorFits = !!(rc && rc.right <= innerWidth + 0.5 && rc.left >= -0.5);
  return o;
});
await shot('mix3-p-chor.png', 428, 926);
const U2 = await p.evaluate(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms)), o = {}; closePop(); await wait(200);
  try { setView('song'); } catch (e) { try { toggleSongView(true); } catch (e2) {} } await wait(300);
  const m = S.song.marks[0]; openMarkSheet(m.id); await wait(400);
  const bs = [...document.querySelectorAll('.msheet .ch1-ms button')]; o.mark = bs.map(b => ({t: b.textContent.trim(), h: Math.round(b.getBoundingClientRect().height)}));
  const x = document.querySelector('.msheet .ms-x'), r = x && x.getBoundingClientRect(); o.xVisible = !!(r && r.width >= 30 && r.top >= 0 && r.bottom <= innerHeight && r.right <= innerWidth);
  return o;
});
await shot('mix3-l-marke.png', 926, 428);
const U3 = await p.evaluate(() => { const x = document.querySelector('.msheet .ms-x'), r = x && x.getBoundingClientRect(); return {xVisibleL: !!(r && r.width >= 30 && r.top >= 0 && r.bottom <= innerHeight && r.right <= innerWidth)}; });
ok('Bedienung: Chor-Blatt hat die Zeile Gesang [Chor sauber] [Refrain groß] [Refrain 2× singen], Tasten ≥ 44 px, Blatt passt hochkant', U.chorRow && U.chorRow.length === 3 && U.chorRow.every(b => b.h >= 44) && U.chorFits, U);
ok('Bedienung: Marken-Blatt eines Refrain-Teils mit [Refrain groß] [Refrain 2× singen] (≥ 44 px), ✕ sichtbar hochkant und quer', U2.mark.length === 2 && U2.mark.every(b => b.h >= 44) && U2.xVisible && U3.xVisibleL, Object.assign({}, U2, U3));
// Speichern/Laden: die neuen Felder bleiben (additiv), Auto-Nachführen aus bleibt aus
const RT = await p.evaluate(async () => { const j = SYNQUENZER.exportJSON ? SYNQUENZER.exportJSON() : JSON.stringify(S); const o = JSON.parse(typeof j === 'string' ? j : JSON.stringify(j)); const am = o.fxBus && o.fxBus.am, tk = Object.values(o.takes || {}).find(m => m.ch1); return {amMx3: am ? am.mx3 || null : null, takeCh1: tk ? tk.ch1 : null}; });
ok('Speichern: fxBus.am.mx3 = {af: 0} und take.ch1 bleiben im Projekt', RT.amMx3 && RT.amMx3.af === 0 && RT.takeCh1 && RT.takeCh1.al === 1, RT);
ok('Keine Fehler in der Konsole', !errs.length, errs.slice(0, 5));
fs.writeFileSync(path.join(out, 'mix3-test-ergebnis.json'), JSON.stringify({res, L1, L2, L3, C1, C2, U, U2, U3, RT, errs}, null, 1));
const bad = res.filter(r => !r.pass).length; console.log((bad ? 'FEHLER ' : 'OK ') + 'gesamt ' + (res.length - bad) + '/' + res.length);
await b.close(); process.exit(bad ? 1 : 0);
