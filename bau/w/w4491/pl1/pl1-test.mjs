// PL1-Test: Parameter-Locks (LAUF / Drum-SCHRITTE / ROLLE / Lock-Modus Klang-Editor + Platte), Render-Spektrum, Speichern/Laden, ↶,
// Lauflichter an/aus (Frames/CPU gemessen), Lage (nichts verschiebt sich gegen die Basis), ✕ sichtbar, Tasten ≥ 44 px, Fotos.
// Prüfung (Befunde 1–4): Mod-Ringe der Platte bei Lauflichtern aus, Doppeltipp im Lock-Modus = Lock weg (Klang-Editor + Platte, „Rückgängig“),
// [🔒 Locks] per Finger-Wischen erreicht (kein scrollIntoView) und nach [Fertig] im Bild, Menü-Text nennt, was weiterläuft.
// Aufruf: node pl1-test.mjs <index.html> <ausgabe-ordner>   (ABSOLUTE Pfade; die Basis wird als ../basis.html neben dem Paket gesucht)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
import path from 'path';
const [file, out] = process.argv.slice(2);
if (!file || !out) { console.log('FEHLER Aufruf: node pl1-test.mjs <index.html> <ausgabe-ordner>'); process.exit(2); }
fs.mkdirSync(out, {recursive: true});
const basis = path.resolve(path.dirname(file), '..', 'basis.html');
const res = []; const ok = (name, pass, info) => { res.push({name, pass: !!pass, info}); console.log((pass ? 'OK ' : 'FEHLER ') + name + (info !== undefined ? '  ' + JSON.stringify(info) : '')); };
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true});
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + path.resolve(file)); await p.waitForTimeout(1500);
const cdp = await ctx.newCDPSession(p);
const W = ms => p.waitForTimeout(ms);
const hideToast = () => p.evaluate(() => { if (EL.toast) EL.toast.style.visibility = 'hidden'; });
const showToast = () => p.evaluate(() => { if (EL.toast) EL.toast.style.visibility = ''; });
const shot = async name => { await W(350); await hideToast(); await p.screenshot({path: path.join(out, name)}); await showToast(); };
const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts.map((q, k) => ({x: q.x, y: q.y, id: q.id != null ? q.id : k + 1, radiusX: 4, radiusY: 4, force: 1}))});
const center = r => ({x: r.x + r.w / 2, y: r.y + r.h / 2});
const rectOf = sel => p.evaluate(s => { const e = typeof s === 'string' ? document.querySelector(s) : null; if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height}; }, sel);

// der Testclip: Synth 1 (VA), Szene 1, 1 Takt, acht gleiche Noten C3 je Achtel; alle anderen Spuren der Szene leer
const SETUP = `stop(); SYNQUENZER.loadDemo(); ensureAudio();
  for (let t = 0; t < NT(); t++) if (S.tracks[t]) for (let s = 0; s < NS(); s++) if (t !== 0) S.tracks[t].clips[s] = null;
  S.tracks[0].clips[0] = {len: 1, key: {root: 0, scale: 'ionian', src: 'user'}, notes: [0, .5, 1, 1.5, 2, 2.5, 3, 3.5].map(t => ({t, d: .2, n: 48, v: .8}))};
  setP(0, 'fx.rev', 0); setP(0, 'fx.dly', 0);   /* ohne Hall/Echo: jeder Schritt wird für sich gemessen */
  for (let t = 0; t < NT(); t++) clipChanged(t, 0); R.selS = 0; UNDO.length = 0; REDO.length = 0;`;

/* ---------- 1) LAUF: Schritt 3 mit einem Finger halten, mit dem zweiten den Filter-Regler drehen (echte Mehrfinger-Geste) ---------- */
await p.evaluate(s => { (new Function(s))(); ROLLP.view = 'lauf'; openRoll(0, 0); }, SETUP); await W(400);
const cell3 = await p.evaluate(() => { const c = ED.lauf.se.cells[2].getBoundingClientRect(); return {x: c.left, y: c.top, w: c.width, h: c.height}; });
const A = Object.assign(center(cell3), {id: 1});
await touch('touchStart', [A]); await W(700);
const pop1 = await p.evaluate(() => ({open: !!(UI.pop && UI.pop.name === 'lf1step'), sect: !!(UI.pop && UI.pop.el.querySelector('.pl1s')), knobs: UI.pop ? [...UI.pop.el.querySelectorAll('.pl1s .knob .kl')].map(x => x.textContent) : [], title: UI.pop ? UI.pop.el.querySelector('h4').textContent : ''}));
ok('LAUF: Schritt 3 lang halten → Schritt-Menü mit „🔒 Regler nur für Schritt 3“ und 4 Reglern (Filter, Reso, Hüllk., Decay)', pop1.open && pop1.sect && pop1.knobs.join() === 'Filter,Reso,Hüllk.,Decay', pop1);
const kF = await p.evaluate(() => { const k = UI.pop.el.querySelector('.pl1s .knob'); const r = k.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height}; });
const u0 = await p.evaluate(() => UNDO.length);
const B0 = Object.assign(center(kF), {id: 2});
await touch('touchStart', [A, B0]); await W(60);
for (let k = 1; k <= 12; k++) { await touch('touchMove', [A, {x: B0.x, y: B0.y - k * 14, id: 2}]); await W(25); }
const mid = await p.evaluate(() => ({held: !!(UI.pop && UI.pop.name === 'lf1step'), lk: S.tracks[0].clips[0].notes[1].lk ? JSON.parse(JSON.stringify(S.tracks[0].clips[0].notes[1].lk)) : null}));
await touch('touchEnd', []); await W(200);
const L1 = await p.evaluate(() => {
  const c = S.tracks[0].clips[0], n = c.notes, x = n[1].lk && n[1].lk.v && n[1].lk.v.cutoff;
  return {x, hz: x != null ? Math.round(lkFromN(LKT.cutoff, x)) : null, others: n.filter((q, i) => i !== 1 && q.lk).length, undo: UNDO.length, last: UNDO.length ? UNDO[UNDO.length - 1].label : '',
    base: S.tracks[0].sound.p.cutoff, dots: ED.lauf.se.cells.map(c => !!(c._pl1d && !c._pl1d.hidden)), chips: [...UI.pop.el.querySelectorAll('.pl1c span')].map(s => s.textContent),
    knobOn: UI.pop.el.querySelector('.pl1s .knob').classList.contains('pl1on')};
});
ok('Zweiter Finger dreht, während der erste hält: der Lock entsteht schon während der Geste (Menü bleibt offen)', mid.held && mid.lk && mid.lk.v && mid.lk.v.cutoff != null, mid.lk);
ok('Lock nur auf Schritt 3 (Note 2), Grundklang unverändert, genau ein ↶-Schritt „Lock · Filter“', L1.x != null && L1.hz > L1.base * 1.5 && L1.others === 0 && L1.undo === u0 + 1 && L1.last === 'Lock · Filter', {hz: L1.hz, base: L1.base, undo: L1.undo - u0, last: L1.last});
ok('Punkt nur am Schritt 3; Lock-Leiste zeigt „Filter …“ mit ✕; Regler markiert', L1.dots.filter(Boolean).length === 1 && L1.dots[2] && L1.chips.length === 1 && /^Filter \d/.test(L1.chips[0]) && L1.knobOn, {chips: L1.chips, dots: L1.dots.map(d => d ? 1 : 0).join('')});
await shot('pl1-lauf-hochkant.png');
const U1 = await p.evaluate(() => { const lk = () => { const n = S.tracks[0].clips[0].notes[1]; return n.lk && n.lk.v ? n.lk.v.cutoff : null; }; const o = {before: lk()}; undo(); o.undone = lk(); o.dotAfterUndo = ED.lauf.se.cells[2]._pl1d ? !ED.lauf.se.cells[2]._pl1d.hidden : false; redo(); o.redone = lk(); o.dotAfterRedo = !ED.lauf.se.cells[2]._pl1d.hidden; return o; });
ok('↶ nimmt den Lock weg (Punkt weg), ↷ bringt ihn wieder', U1.before != null && U1.undone == null && !U1.dotAfterUndo && U1.redone === U1.before && U1.dotAfterRedo, U1);
// quer: derselbe Abschnitt rechts neben dem Schritt-Menü
await p.setViewportSize({width: 926, height: 428}); await W(400);
await p.evaluate(() => { closePop(); safeRebuild(buildRoll); }); await W(300);
await p.evaluate(() => SYNQUENZER.pl1.laufPop(2)); await W(300);
const Q1 = await p.evaluate(() => { const P = UI.pop.el, r = P.getBoundingClientRect(), s = P.querySelector('.pl1s').getBoundingClientRect(), all = [...P.querySelectorAll('button')].map(b => b.getBoundingClientRect());
  return {pop: {x: r.left, y: r.top, w: r.width, h: r.height, sh: P.scrollHeight, ch: P.clientHeight}, sect: {x: s.left, y: s.top, w: s.width, h: s.height}, inside: s.right <= r.right + .5 && s.bottom <= r.bottom + .5, minH: Math.min(...all.filter(q => q.height > 0).map(q => q.height)), vw: innerWidth, vh: innerHeight}; });
ok('quer 926×428: Lock-Abschnitt rechts im Schritt-Menü, ganz sichtbar, ohne Rollen; alle Tasten ≥ 44 px', Q1.inside && Q1.pop.sh <= Q1.pop.ch + 1 && Q1.pop.y + Q1.pop.h <= Q1.vh && Q1.minH >= 44, Q1);
await shot('pl1-lauf-quer.png');
await p.setViewportSize({width: 926, height: 370}); await W(400);
await p.evaluate(() => { closePop(); safeRebuild(buildRoll); }); await W(250); await p.evaluate(() => SYNQUENZER.pl1.laufPop(2)); await W(300);
await shot('pl1-lauf-quer370.png');
const Q2 = await p.evaluate(() => { const P = UI.pop && UI.pop.el; if (!P) return null; const r = P.getBoundingClientRect(); return {y: r.top, h: r.height, vh: innerHeight, sh: P.scrollHeight, ch: P.clientHeight}; });
ok('quer 926×370 (Safari mit Leisten): Schritt-Menü passt', !!Q2 && Q2.y + Q2.h <= Q2.vh + .5, Q2);
await p.setViewportSize({width: 428, height: 926}); await W(400);
await p.evaluate(() => closePop()); await W(150);

/* ---------- 2) Render (Song als Audio, derselbe Weg wie Export/Video): nur Schritt 3 klingt anders (Spektrum) ---------- */
const spec = async () => p.evaluate(async () => {
  closeRoll(); stop(); SYNQUENZER.songFromChain([{scene: 0, bars: 2}]); VV.cancel = false;
  const r = await vvRenderAudio({range: {a: 0, b: 2}}), x = r.ch[0], sr = r.sr || AU.ctx.sampleRate;
  let on = 0; while (on < x.length && Math.abs(x[on]) < .004) on++;
  const sp = 60 / S.bpm * .5, N = 2048, cent = [], hf = [];
  const fft = (re, im) => { const n = re.length; for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
    for (let len = 2; len <= n; len <<= 1) { const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a); for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let k = 0; k < len / 2; k++) { const ur = re[i + k], ui = im[i + k], vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci, vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr; re[i + k] = ur + vr; im[i + k] = ui + vi; re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } } };
  for (let k = 0; k < 16; k++) {
    const s0 = on + Math.round((k * sp + .004) * sr), re = new Float64Array(N), im = new Float64Array(N);
    for (let i = 0; i < N; i++) re[i] = (x[s0 + i] || 0) * (.5 - .5 * Math.cos(2 * Math.PI * i / (N - 1)));
    fft(re, im); let a = 0, w = 0, h = 0;
    for (let i = 1; i < N / 2; i++) { const m = Math.hypot(re[i], im[i]), f = i * sr / N; a += m; w += m * f; if (f > 1500) h += m * m; }
    let tot = 0; for (let i = 1; i < N / 2; i++) tot += re[i] * re[i] + im[i] * im[i];
    cent.push(Math.round(w / Math.max(1e-12, a))); hf.push(+(10 * Math.log10(Math.max(1e-12, h / Math.max(1e-12, tot)))).toFixed(1));
  }
  return {on, sr, cent, hf};
});
// Prüfung: der Song-Render der Basis 4.48.1 ist selbst ohne Locks nicht ganz gleich (gemessen: in ~1 von 5 Läufen ist der ganze Render um ~8 %
// heller und der letzte Schritt still) – dann wird das Paar mit/ohne Lock neu gerendert (höchstens 3 Paare, die Zahl steht in der Ausgabe)
let R1, R0, ratio, rest, paare = 0;
do {
  R1 = await spec();
  await p.evaluate(() => { const n = S.tracks[0].clips[0].notes[1]; window.__lk = n.lk; delete n.lk; clipChanged(0, 0); }); R0 = await spec(); await p.evaluate(() => { S.tracks[0].clips[0].notes[1].lk = window.__lk; clipChanged(0, 0); });
  ratio = R1.cent.map((c, k) => +(c / R0.cent[k]).toFixed(3)); rest = ratio.filter((r, k) => k % 8 !== 1); paare++;
} while (paare < 3 && !rest.every(r => Math.abs(r - 1) < .05));
ok('Render (Song als Audio = Export-Weg): nur Schritt 3 (in beiden Takten) klingt anders – Spektralschwerpunkt mit/ohne Lock', ratio[1] > 3 && ratio[9] > 3 && rest.every(r => Math.abs(r - 1) < .05), {paare, mitLockHz: R1.cent, ohneLockHz: R0.cent, verhaeltnis: ratio, hfDbMit: R1.hf, hfDbOhne: R0.hf});

/* ---------- 3) Speichern / Laden ---------- */
const Rpre = await spec();
const U3 = await p.evaluate(async () => {
  const o = {}; const lk = () => { const n = S.tracks[0].clips[0].notes[1]; return n.lk && n.lk.v ? n.lk.v.cutoff : null; };
  o.before = lk();
  const json = SYNQUENZER.serialize(); const fn = JSON.parse(json).project.tracks[0].clips[0].notes; o.inFile = (fn[1][4] && fn[1][4].lk) || null; o.inFileOthers = fn.filter((q, i) => i !== 1 && q[4] && q[4].lk).length;
  SYNQUENZER.loadDemo(); o.gone = lk(); o.imp = importJSON(json); await new Promise(r => setTimeout(r, 300)); o.loaded = lk();
  o.others = S.tracks[0].clips[0].notes.filter((q, i) => i !== 1 && q.lk).length;
  return o;
});
ok('Speichern/Laden: der Lock steht in der Datei (nur an Note 2) und kommt gleich zurück', U3.inFile && U3.inFile.v && U3.inFile.v.cutoff === U3.before && !U3.inFileOthers && U3.imp && U3.loaded === U3.before && U3.others === 0, {inFile: U3.inFile, loaded: U3.loaded});
const R2 = await spec();
const med = a => { const q = a.filter((c, k) => k % 8 !== 1).sort((x, y) => x - y); return q[q.length >> 1]; };
ok('nach dem Laden spielt der Lock gleich (Schritt 3 in beiden Takten > 3× heller als der Rest, wie vor dem Speichern)', R2.cent[1] > 3 * med(R2.cent) && R2.cent[9] > 3 * med(R2.cent) && Rpre.cent[1] > 3 * med(Rpre.cent) && Math.abs(med(R2.cent) - med(Rpre.cent)) <= med(Rpre.cent) * .03, {vorher: Rpre.cent, nachher: R2.cent});
// Lock-Leiste: ✕ am Chip löscht nur diesen Lock (ein ↶), „Locks löschen“ alle
const C3 = await p.evaluate(async () => {
  const o = {}; ROLLP.view = 'lauf'; openRoll(0, 0); await new Promise(r => setTimeout(r, 300));
  SYNQUENZER.pl1.set(0, 0, [1], 'res', .9); SYNQUENZER.pl1.laufPop(2); await new Promise(r => setTimeout(r, 200));
  o.chips = [...UI.pop.el.querySelectorAll('.pl1c span')].map(s => s.textContent); const u = UNDO.length;
  const ch = [...UI.pop.el.querySelectorAll('.pl1c')].find(b => b.textContent.startsWith('Reso')); ch.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, pointerId: 9, clientX: 1, clientY: 1})); ch.dispatchEvent(new PointerEvent('pointerup', {bubbles: true, pointerId: 9, clientX: 1, clientY: 1})); ch.click();
  await new Promise(r => setTimeout(r, 100));
  o.after = Object.keys((S.tracks[0].clips[0].notes[1].lk || {}).v || {}); o.undo1 = UNDO.length - u;
  return o;
});
ok('Lock-Leiste: zwei Chips (Filter, Reso); ✕ an „Reso“ löscht nur Reso, ein ↶', C3.chips.length === 2 && C3.after.join() === 'cutoff' && C3.undo1 === 1, C3);
await p.evaluate(() => closePop());

/* ---------- 4) Drum-SCHRITTE: gesetzten Schritt lang drücken → Tune / Decay / Pegel / Drive; Punkt; Locks löschen ---------- */
await p.evaluate(() => { S.tracks[DRUM_T].clips[0] = {len: 1, key: {root: 0, scale: 'ionian', src: 'auto'}, notes: [0, 1, 2, 3].map(t => ({t, d: .1, n: 36, v: .9}))}; clipChanged(DRUM_T, 0); ED.dVoice = 0; ED.page = 0; ED.dTab = 'steps'; openRoll(DRUM_T, 0); });
await W(400);
const dc = await p.evaluate(() => { const c = ED.step.cells[4].getBoundingClientRect(); return {x: c.left + c.width / 2, y: c.top + c.height / 2}; });
await p.mouse.move(dc.x, dc.y); await p.mouse.down(); await W(650); await p.mouse.up(); await W(200);
const D1 = await p.evaluate(() => ({pop: !!(UI.pop && UI.pop.name === 'pl1'), title: UI.pop ? UI.pop.el.querySelector('h4').textContent : '', knobs: UI.pop ? [...UI.pop.el.querySelectorAll('.pl1s .knob .kl')].map(x => x.textContent) : [], step5: S.tracks[DRUM_T].clips[0].notes.length}));
ok('SCHRITTE: Schritt 5 (KICK) lang drücken → Fenster „KICK · Schritt 5“ mit Tune, Decay, Pegel, Drive; der Schritt bleibt an', D1.pop && /KICK · Schritt 5/.test(D1.title) && D1.knobs.join() === 'Tune,Decay,Pegel,Drive' && D1.step5 === 4, D1);
const tk = await p.evaluate(() => { const k = UI.pop.el.querySelectorAll('.pl1s .knob')[0].getBoundingClientRect(); return {x: k.left + k.width / 2, y: k.top + k.height / 2}; });
const u4 = await p.evaluate(() => UNDO.length);
await p.mouse.move(tk.x, tk.y); await p.mouse.down(); for (let k = 1; k <= 8; k++) { await p.mouse.move(tk.x, tk.y - k * 12); await W(20); } await p.mouse.up(); await W(200);
const D2 = await p.evaluate(() => { const n = S.tracks[DRUM_T].clips[0].notes; return {lk: n.map(q => q.lk ? JSON.stringify(q.lk) : '').join('|'), undo: UNDO.length, dots: ED.step.cells.map(c => !!(c._pl1d && !c._pl1d.hidden) ? 1 : 0).join(''), P: DrumSeq.lockParams({frq: 55, mTun: 1, nFrq: 1, tfFrq: 1, tDec: .4, nDec: .1, mDec: .1}, n[1].lk, 'kick').frq}; });
ok('Tune drehen: Lock lk.tune nur auf Schritt 5, ein ↶; der Kern stimmt den Schlag um; Punkt am Schritt 5', /^\|\{"tune":\d+\}\|\|$/.test(D2.lk) && D2.undo === u4 + 1 && D2.P > 55 && D2.dots[4] === '1' && (D2.dots.match(/1/g) || []).length === 1, D2);
await shot('pl1-schritte-hochkant.png');
const DX = await p.evaluate(() => { const P = UI.pop.el, x = P.querySelector('.ux1-px'), t = P.querySelector('.pl1t'); if (!x) return {x: null}; const a = x.getBoundingClientRect(), c = t.getBoundingClientRect(); return {x: {y: a.top, b: a.bottom, l: a.left}, title: {y: c.top, r: c.right}, overlap: a.bottom > c.top && a.left < c.right}; });
ok('hochkant: ✕ des Fensters sichtbar und frei (nicht über der Überschrift des Lock-Abschnitts)', DX.x && !DX.overlap, DX);
await p.setViewportSize({width: 926, height: 428}); await W(400);
await p.evaluate(() => { closePop(); SYNQUENZER.pl1.drumPop(4); }); await W(300);
const DQ = await p.evaluate(() => { const r = UI.pop.el.getBoundingClientRect(); return {y: r.top, h: r.height, vh: innerHeight, sh: UI.pop.el.scrollHeight, ch: UI.pop.el.clientHeight}; });
ok('quer: Fenster „KICK · Schritt 5“ ganz im Bild', DQ.y >= 0 && DQ.y + DQ.h <= DQ.vh, DQ);
await shot('pl1-schritte-quer.png');
await p.setViewportSize({width: 428, height: 926}); await W(400);
await p.evaluate(() => { closePop(); SYNQUENZER.pl1.drumPop(4); }); await W(250);
const DM = await p.evaluate(async () => {
  const o = {}; SYNQUENZER.pl1.modeGoTop(); await new Promise(r => setTimeout(r, 500));
  o.ed = R.editor; o.tab = ED.dTab; o.voice = DRUM_VOICES[ED.dVoice].id; o.mode = SYNQUENZER.pl1.mode();
  const base = slotParams('kick').tDec; UI.pl1.pt = performance.now(); drumSet('kick', 'tDec', 1.5); pl1Flush();
  o.base = base; o.after = slotParams('kick').tDec; o.shown = dSlotGet('kick', 'tDec'); o.lk = S.tracks[DRUM_T].clips[0].notes[1].lk;
  UI.pl1.pt = performance.now(); drumSet('snare', 'tDec', .9); o.snareSay = document.querySelector('.pl1ban .pl1bv').textContent; o.snareLk = S.tracks[DRUM_T].clips[0].notes.some(n => n.lk && n.lk.v && n.lk.v['drum.snare.tDec'] != null);
  SYNQUENZER.pl1.modeEnd(true); await new Promise(r => setTimeout(r, 300)); o.back = R.editor + '/' + ED.dTab; o.shownAfter = dSlotGet('kick', 'tDec');
  return o; });
ok('Drum: [Alle Regler ›] → Drum-Editor SOUND im Lock-Modus (KICK); Decay schreibt nur den Lock, Anzeige zeigt ihn; anderes Pad sagt es; [Fertig] → SCHRITTE', DM.ed === 'drum' && DM.tab === 'sound' && DM.voice === 'kick' && DM.after === DM.base && Math.abs(DM.shown - 1.5) < .02 && DM.lk && DM.lk.v && DM.lk.v['drum.kick.tDec'] != null && !DM.snareLk && /KICK/.test(DM.snareSay) && DM.back === 'drum/steps' && DM.shownAfter === DM.base, DM);
await p.evaluate(() => SYNQUENZER.pl1.drumPop(4)); await W(250);
const D3 = await p.evaluate(async () => { SYNQUENZER.pl1.set(DRUM_T, 0, [1], 'drum.kick.lvl', .4); const u = UNDO.length; const b = UI.pop.el.querySelector('.pl1clr');
  b.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, pointerId: 8, clientX: 1, clientY: 1})); b.dispatchEvent(new PointerEvent('pointerup', {bubbles: true, pointerId: 8, clientX: 1, clientY: 1})); b.click();
  await new Promise(r => setTimeout(r, 100)); return {lk: S.tracks[DRUM_T].clips[0].notes.filter(q => q.lk).length, undo: UNDO.length - u, dots: ED.step.cells.filter(c => c._pl1d && !c._pl1d.hidden).length}; });
ok('„Locks löschen“: alle Locks des Schritts weg (Tune, Pegel, Decay), ein ↶, kein Punkt mehr', D3.lk === 0 && D3.undo === 1 && D3.dots === 0, D3);
// leerer Schritt: langer Druck öffnet nichts, der Tipp setzt wie bisher einen Schlag
await p.evaluate(() => closePop()); await W(150);
const ec = await p.evaluate(() => { const c = ED.step.cells[2].getBoundingClientRect(); return {x: c.left + c.width / 2, y: c.top + c.height / 2}; });
await p.mouse.move(ec.x, ec.y); await p.mouse.down(); await W(650); await p.mouse.up(); await W(150);
const D4 = await p.evaluate(() => ({pop: !!UI.pop, n: S.tracks[DRUM_T].clips[0].notes.length}));
ok('SCHRITTE: leerer Schritt lang drücken = wie bisher (kein Fenster, Tipp setzt den Schlag)', !D4.pop && D4.n === 5, D4);
await p.evaluate(() => { undo(); closeEditor(); });

/* ---------- 5) ROLLE: Note wählen → [🔒 Locks] → [Alle Regler ›] = Klang-Editor im Lock-Modus ---------- */
await p.evaluate(() => { ROLLP.view = 'roll'; openRoll(0, 0); }); await W(400);
await p.evaluate(() => { ED.roll.selectIdx([4]); ED.roll.el.acts.scrollLeft = 0; }); await W(150);
// Prüfung 3: per Finger wischen (wie auf dem iPhone), nicht per Skript ins Bild holen – gezählt wird, wie oft
const lockVis = () => p.evaluate(() => { const a = ED.roll.el.acts, ar = a.getBoundingClientRect(), b = a.querySelector('.pl1rb'), br = b.getBoundingClientRect(); return {vis: br.left >= ar.left - 1 && br.right <= ar.right + 1, row: {l: ar.left, r: ar.right, y: ar.top + ar.height / 2, sw: a.scrollWidth}}; });
let swipes = 0, lv = await lockVis();
while (!lv.vis && swipes < 8) { const y = lv.row.y, x0 = lv.row.r - 20; await touch('touchStart', [{x: x0, y}]); for (let k = 1; k <= 6; k++) { await touch('touchMove', [{x: x0 - k * 60, y}]); await W(16); } await touch('touchEnd', []); await W(450); swipes++; lv = await lockVis(); }
const rb = await p.evaluate(() => { const b = ED.roll.el.acts.querySelector('.pl1rb'), r = b.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height}; });
const hit0 = await p.evaluate(({x, y}) => { const b = [...ED.roll.el.acts.children].find(q => q.textContent === '🔒 Locks'), h = [...ED.roll.el.acts.children].find(q => q.textContent === 'Harmonie'); const span = (el, cx) => { let n = 0; for (let dy = -30; dy <= 30; dy++) if (document.elementFromPoint(cx, y + dy) === el) n++; return n; }; const hr = h ? h.getBoundingClientRect() : null; return {px: span(b, x), harmoniePx: hr ? span(h, hr.left + hr.width / 2) : null}; }, rb);
await p.mouse.click(rb.x, rb.y); await W(300);
const RL = await p.evaluate(() => ({pop: !!(UI.pop && UI.pop.name === 'pl1'), title: UI.pop ? UI.pop.el.querySelector('h4').textContent : ''}));
const hit = hit0;
ok('ROLLE hochkant: [🔒 Locks] am Ende der Aktionszeile per Finger erreicht (' + swipes + '× wischen, Zeile ' + Math.round(lv.row.sw) + ' px)', lv.vis && swipes <= 6, {swipes, breite: Math.round(lv.row.sw)});
ok('ROLLE: Note wählen, [🔒 Locks] (Trefferfläche ≥ 44 px wie [Harmonie]) → Fenster „1 Note“', RL.pop && RL.title === '1 Note' && hit.px >= 44, {RL, h: rb.h, hit});
const allB = await p.evaluate(() => { const r = UI.pop.el.querySelector('.pl1all').getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
await p.mouse.click(allB.x, allB.y); await W(500);
const M1 = await p.evaluate(() => ({mode: SYNQUENZER.pl1.mode(), ed: R.editor, selT: R.selT, ban: (() => { const b = document.querySelector('.pl1ban'); if (!b || b.hidden) return null; const r = b.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height, t: b.textContent}; })(),
  x: (() => { const x = document.querySelector('#synthSheet .sh-x, #synthSheet button[aria-label="Editor schließen"]'); if (!x) return null; const r = x.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height}; })()}));
const overlap = (a, c) => a && c && a.x < c.x + c.w && c.x < a.x + a.w && a.y < c.y + c.h && c.y < a.y + a.h;
ok('[Alle Regler ›] → Klang-Editor im Lock-Modus, Leiste „🔒 LOCK · 1 Note … Fertig“ über der Anzeige; ✕ des Editors frei', M1.mode && M1.mode.live && M1.ed === 'synth' && M1.ban && /LOCK · 1 Note/.test(M1.ban.t) && M1.ban.h >= 44 && (!M1.x || !overlap(M1.ban, M1.x)), M1);
// FILTER-Seite, Cutoff mit dem Finger drehen → nur die Note 5, der Klang bleibt
await p.evaluate(() => { const t = [...document.querySelectorAll('#synthSheet button, #synthSheet .tab')].find(x => x.textContent.trim() === 'FILTER'); if (t) { t.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, pointerId: 7})); t.dispatchEvent(new PointerEvent('pointerup', {bubbles: true, pointerId: 7})); t.click(); } }); await W(400);
const ck = await p.evaluate(() => { const k = [...document.querySelectorAll('#synthSheet .knob')].find(x => x.dataset.key === 'cutoff'); if (!k) return null; const r = k.querySelector('svg').getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
const m0 = await p.evaluate(() => ({cut: S.tracks[0].sound.p.cutoff, undo: UNDO.length}));
if (ck) { await p.mouse.move(ck.x, ck.y); await p.mouse.down(); for (let k = 1; k <= 10; k++) { await p.mouse.move(ck.x, ck.y + k * 10); await W(20); } }
const mMid = await p.evaluate(() => { const k = [...document.querySelectorAll('#synthSheet .knob')].find(x => x.dataset.key === 'cutoff'); return {shown: k ? k.querySelector('.kn').textContent : null, ban: document.querySelector('.pl1ban .pl1bv').textContent}; });
if (ck) await p.mouse.up(); await W(300);
const M2 = await p.evaluate(() => { const n = S.tracks[0].clips[0].notes; return {cut: S.tracks[0].sound.p.cutoff, lk: n[4].lk && n[4].lk.v ? Math.round(lkFromN(LKT.cutoff, n[4].lk.v.cutoff)) : null, others: n.filter((q, i) => i !== 4 && i !== 1 && q.lk).length, undo: UNDO.length, last: UNDO[UNDO.length - 1].label}; });
ok('Lock-Modus: Cutoff im Editor ziehen schreibt nur in Note 5 (Regler und Leiste zeigen den Lock-Wert), Klang unverändert, ein ↶', !!ck && M2.cut === m0.cut && M2.lk != null && M2.lk < m0.cut && M2.others === 0 && M2.undo === m0.undo + 1 && /Lock · Filter|Lock · Cutoff/.test(M2.last) && mMid.ban.startsWith('Filter') && mMid.shown === mMid.ban.replace(/^Filter /, ''), {m0, M2, mMid});
await shot('pl1-lockmodus-hochkant.png');
// Prüfung 2: Doppeltipp auf den Regler im Lock-Modus = der Lock geht weg (wie im Schritt-Menü), eigener ↶, „Rückgängig“ holt ihn zurück
const lkHz = () => p.evaluate(() => { const n = S.tracks[0].clips[0].notes[4]; return {lk: n.lk && n.lk.v && n.lk.v.cutoff != null ? Math.round(lkFromN(LKT.cutoff, n.lk.v.cutoff)) : null, cut: S.tracks[0].sound.p.cutoff, undo: UNDO.length, last: UNDO.length ? UNDO[UNDO.length - 1].label : '', redo: REDO.map(r => r.label), toast: EL.toast ? EL.toast.textContent : '', ban: document.querySelector('.pl1ban .pl1bv').textContent, shown: (() => { const k = [...document.querySelectorAll('#synthSheet .knob')].find(x => x.dataset.key === 'cutoff'); return k ? k.querySelector('.kn').textContent : null; })()}; });
const dt0 = await lkHz();
if (ck) { await W(450); await p.mouse.dblclick(ck.x, ck.y); await W(300); }
const dt1 = await lkHz();
const tb = await p.evaluate(() => { const b = EL.toast ? [...EL.toast.querySelectorAll('button')].find(x => /Rückgängig/.test(x.textContent)) : null; if (!b) return null; const r = b.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
if (tb) { await p.mouse.click(tb.x, tb.y); await W(400); }
const dt2 = await lkHz();
ok('Lock-Modus: Doppeltipp auf Cutoff = Lock weg (Klang bleibt, ein ↶ „Lock · Filter weg“, Hinweis „Filter: Lock weg · Rückgängig“); „Rückgängig“ bringt genau den Lock zurück, ↷ hat ihn',
  dt0.lk != null && dt1.lk == null && dt1.cut === dt0.cut && dt1.undo === dt0.undo + 1 && dt1.last === 'Lock · Filter weg' && /Filter: Lock weg/.test(dt1.toast) && /Rückgängig/.test(dt1.toast) && dt1.shown !== dt0.shown && !!tb && dt2.lk === dt0.lk && dt2.cut === dt0.cut && dt2.undo === dt0.undo && dt2.redo.slice(-1)[0] === 'Lock · Filter weg' && dt2.shown === dt0.shown,
  {vorher: {lk: dt0.lk, cut: dt0.cut, shown: dt0.shown}, doppeltipp: {lk: dt1.lk, last: dt1.last, toast: dt1.toast, shown: dt1.shown}, rueckgaengig: {lk: dt2.lk, redo: dt2.redo.slice(-1), shown: dt2.shown}});
// ein Wert, der nur für den ganzen Klang geht (Filtertyp / Welle): bleibt, die Leiste sagt es
const M3 = await p.evaluate(() => { const o = {}; const before = JSON.stringify(S.tracks[0].sound); UI.pl1.pt = performance.now(); o.r = setP(0, 'mode', 1); o.same = JSON.stringify(S.tracks[0].sound) === before; o.say = document.querySelector('.pl1ban .pl1bv').textContent; o.warn = document.querySelector('.pl1ban .pl1bv').classList.contains('warn'); return o; });
ok('Lock-Modus: Klang-Struktur (z. B. Mono/Poly) wird kein Lock und bleibt – die Leiste sagt es', M3.same && M3.warn && /ganzen Klang/.test(M3.say), M3);
await p.setViewportSize({width: 926, height: 428}); await W(500);
const MQ = await p.evaluate(() => { const b = document.querySelector('.pl1ban').getBoundingClientRect(), x = document.querySelector('#synthSheet .sh-x, #synthSheet button[aria-label="Editor schließen"]'), xr = x ? x.getBoundingClientRect() : null; return {ban: {x: b.left, y: b.top, w: b.width, h: b.height}, x: xr ? {x: xr.left, y: xr.top, w: xr.width, h: xr.height} : null, vw: innerWidth}; });
ok('quer: Lock-Leiste liegt über der Anzeige, im Bild, ✕ frei', MQ.ban.x >= 0 && MQ.ban.x + MQ.ban.w <= MQ.vw && MQ.ban.h >= 44 && (!MQ.x || !overlap(MQ.ban, MQ.x)), MQ);
await shot('pl1-lockmodus-quer.png');
await p.setViewportSize({width: 428, height: 926}); await W(400);
const fb = await p.evaluate(() => { const r = document.querySelector('.pl1ban .pl1bf').getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
await p.mouse.click(fb.x, fb.y); await W(500);
const M4 = await p.evaluate(() => {
  const o = {ed: R.editor, mode: SYNQUENZER.pl1.mode(), ban: !!(document.querySelector('.pl1ban') && !document.querySelector('.pl1ban').hidden), sel: ED.roll ? ED.roll.selection.length : -1};
  // der Punkt an Note 5 in der ROLLE (Pixel rechts oben in der Note)
  const nt = S.tracks[0].clips[0].notes[4], xy = ED.roll._xy(nt.t, nt.n), cv = ED.roll.el.main, r = cv.getBoundingClientRect(), d = cv.width / r.width;
  const V = ED.roll.state.view, w = nt.d * V.ppb, px = cv.getContext('2d').getImageData(Math.round((xy.x - r.left + w - 6) * d), Math.round((xy.y - r.top - V.rowH / 2 + 7) * d), 1, 1).data;
  o.px = [...px]; o.amber = px[0] > 200 && px[1] > 130 && px[2] < 110;
  { const a = ED.roll.el.acts, ar = a.getBoundingClientRect(), br = a.querySelector('.pl1rb').getBoundingClientRect(); o.lockVis = br.left >= ar.left - 1 && br.right <= ar.right + 1; }
  return o;
});
ok('[Fertig] → zurück in die ROLLE (Note bleibt gewählt, [🔒 Locks] gleich im Bild), Lock-Modus aus; amberfarbener Punkt an der Note', M4.ed === 'roll' && !M4.mode && !M4.ban && M4.sel === 1 && M4.amber && M4.lockVis, M4);
await shot('pl1-rolle-hochkant.png');

/* ---------- 6) Platte (MS-Spur) im Lock-Modus: F.CUT schreibt nur den Lock, die Anzeige zeigt ihn ---------- */
const MK = await p.evaluate(async () => {
  const o = {}; closeRoll(); setEngine(2, 'mk'); await new Promise(r => setTimeout(r, 400));
  S.tracks[2].clips[0] = {len: 1, key: {root: 0, scale: 'ionian', src: 'user'}, notes: [0, 1, 2, 3].map(t => ({t, d: .4, n: 60, v: .8}))}; clipChanged(2, 0);
  const tg = pl1Tg(2, 0, 'rolle', [S.tracks[2].clips[0].notes[1]], '1 Note'); pl1ModeGo(tg); await new Promise(r => setTimeout(r, 900));
  const base = SQMK.mkPathGet(S.tracks[2].sound.p.mk, 't.0.f.cut'); UI.pl1.pt = performance.now();
  mkSetP(2, 't.0.f.cut', 20, true); pl1Flush();
  o.base = base; o.after = SQMK.mkPathGet(S.tracks[2].sound.p.mk, 't.0.f.cut'); o.lk = S.tracks[2].clips[0].notes[1].lk; o.shown = kv1Ov(2, 'mk.t.0.f.cut'); o.mode = SYNQUENZER.pl1.mode();
  o.panelShown = typeof MKUI !== 'undefined' && MKUI.get ? MKUI.get({p: 'f.cut'}) : null;
  return o;
});
ok('Platte im Lock-Modus: F.CUT → Lock nur auf der Note, Klang bleibt, Anzeige zeigt 20', MK.after === MK.base && MK.lk && MK.lk.v && MK.lk.v['mk.t.0.f.cut'] != null && Math.round(MK.shown) === 20, MK);
await shot('pl1-platte-hochkant.png');
// Prüfung 2 (Platte): Doppeltipp auf F.CUT im Lock-Modus = Lock weg, Klang bleibt, ↶ holt ihn zurück (erst in den Halt zoomen, wie mit dem Finger)
{
  const kr = () => p.evaluate(() => { const k = document.querySelector('#synthSheet [data-k="f.cut"]'); if (!k) return null; const r = k.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
  const tapT = async (q, w) => { await touch('touchStart', [q]); await W(40); await touch('touchEnd', []); await W(w); };
  let q = await kr(); if (q) { await tapT(q, 600); q = await kr(); await tapT(q, 600); q = await kr(); await tapT(q, 90); await tapT(q, 400); }
  const PD_ = await p.evaluate(() => { const o = {lk: S.tracks[2].clips[0].notes[1].lk || null, cut: SQMK.mkPathGet(S.tracks[2].sound.p.mk, 't.0.f.cut'), last: UNDO.length ? UNDO[UNDO.length - 1].label : '', ban: document.querySelector('.pl1ban .pl1bv').textContent}; undo(); o.back = S.tracks[2].clips[0].notes[1].lk || null; return o; });
  ok('Platte im Lock-Modus: Doppeltipp auf F.CUT = Lock weg (Klang bleibt, ein ↶ „Lock · Filter weg“), ↶ bringt ihn zurück', !!q && PD_.lk === null && PD_.cut === MK.base && PD_.last === 'Lock · Filter weg' && PD_.back && PD_.back.v && PD_.back.v['mk.t.0.f.cut'] != null, PD_);
}
await p.evaluate(() => { pl1ModeEnd(false); closeEditor(); });
// Prüfung 1: Lauflichter aus – die Mod-Ringe der Platte (VIRTUAL PATCH) zeigen weiter und folgen den Wegen; nur die LEDs ruhen
const MA = await p.evaluate(async () => {
  const w = ms => new Promise(r => setTimeout(r, ms)), n = () => document.querySelectorAll('#synthSheet .ma1mk').length, o = {};
  pl1LlSet(false); mkSetP(2, 't.0.p.1.i', 40, false); R.selT = 2; openEditor(); await w(1200); o.aus = n(); o.ringCut = !!document.querySelector('#synthSheet [data-k="f.cut"] .ma1mk');
  mkSetP(2, 't.0.p.1.i', 0, false); await w(600); o.wegAus = n();
  mkSetP(2, 't.0.p.1.i', 40, false); pl1LlSet(true); await w(600); o.an = n();
  mkSetP(2, 't.0.p.1.i', 0, false); closeEditor(); return o;
});
ok('Lauflichter aus: Mod-Ring (LFO 1 → Cutoff) auf der Platte bleibt sichtbar, Weg auf 0 = Ring weg; an wie vorher', MA.aus === 1 && MA.ringCut && MA.wegAus === 0 && MA.an === 1, MA);

/* ---------- 7) Lauflichter: Menü › Bedienung, an/aus, gemessen (Frames, DOM-Änderungen, CPU) ---------- */
await p.evaluate(() => { stop(); SYNQUENZER.loadDemo(); ensureAudio(); openMenu(); }); await W(500);
const menu = await p.evaluate(() => { const r = [...EL.menu.querySelectorAll('.mrow')].find(x => x.querySelector('.lbl') && x.querySelector('.lbl').textContent === 'Lauflichter'); if (!r) return null; r.scrollIntoView({block: 'center'}); const bs = [...r.querySelectorAll('button')]; const o = bs.find(x => x.textContent.trim() === 'Aus').getBoundingClientRect(); return {txt: bs.map(x => x.textContent.trim()), x: o.left + o.width / 2, y: o.top + o.height / 2, h: o.height, on: pl1Ll()}; });
ok('Menü › Bedienung: Zeile „Lauflichter“ [An | Aus], Standard an', menu && menu.txt.join() === 'An,Aus' && menu.on === true, menu);
const mtx = await p.evaluate(() => { const r = [...EL.menu.querySelectorAll('.mrow')].find(x => x.querySelector('.lbl') && x.querySelector('.lbl').textContent === 'Lauflichter'), t = r && r.nextElementSibling; return t ? t.textContent : ''; });
ok('Menü-Text nennt, was bei „Aus“ weiterläuft (Aufnahme, Pegel, Ton-Punkte der Tastatur) – kein „alles steht still“', /Es bleiben: Aufnahme, Pegel, Ton-Punkte der Tastatur/.test(mtx) && !/alles steht still/.test(mtx), mtx);
await shot('pl1-menu-hochkant.png');
await W(300);
const mb = await p.evaluate(() => { const r = [...EL.menu.querySelectorAll('.mrow')].find(x => x.querySelector('.lbl') && x.querySelector('.lbl').textContent === 'Lauflichter'); const o = [...r.querySelectorAll('button')].find(x => x.textContent.trim() === 'Aus').getBoundingClientRect(); return {x: o.left + o.width / 2, y: o.top + o.height / 2}; });
await p.mouse.click(mb.x, mb.y); await W(200);
const LL0 = await p.evaluate(() => ({ll: pl1Ll(), pref: uiPrefs().pl1ll}));
ok('„Aus“ antippen: Lauflichter aus, gemerkt (Gerät)', LL0.ll === false && LL0.pref === false, LL0);
await p.evaluate(() => { if (EL.menu.classList.contains('open')) { const x = EL.menu.querySelector('.sh-x, button[aria-label="Menü schließen"]'); if (x) x.click(); } });
// Messung: je Ansicht 4 s Wiedergabe mit an und aus; Zähler: Bilder mit Änderung (rAF), DOM-Änderungen, Stil/Layout, Skriptzeit
await cdp.send('Performance.enable');
const measure = async (view, on) => {
  await p.evaluate(async ({view, on}) => {
    stop(); closeRoll(); closeEditor(); if (EL.menu.classList.contains('open')) closeMenu();
    pl1LlSet(on); await new Promise(r => setTimeout(r, 100));
    if (view === 'song') { SYNQUENZER.songFromChain([{scene: 0, bars: 4}, {scene: 1, bars: 4}]); setSongView(true); await new Promise(r => setTimeout(r, 200)); songPlayStart(0); }
    else { setSongView(false); if (view === 'lauf') { ROLLP.view = 'lauf'; openRoll(0, 0); } if (view === 'steps') { ED.dTab = 'steps'; openRoll(DRUM_T, 0); } await new Promise(r => setTimeout(r, 200)); play(); }
    await new Promise(r => setTimeout(r, 700));
    window.__pl1m = {mut: 0, frames: 0, dirty: 0, sv: 0}; const M = window.__pl1m;
    if (!window.__svD0) { window.__svD0 = window.svDraw; window.svDraw = function () { if (window.__pl1m) window.__pl1m.sv++; return window.__svD0.apply(this, arguments); }; }
    M.mo = new MutationObserver(l => { M.mut += l.length; M.dirty++; }); M.mo.observe(document.body, {subtree: true, attributes: true, childList: true, characterData: true});
  }, {view, on});
  const m0 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x => [x.name, x.value]));
  await W(4000);
  const m1 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x => [x.name, x.value]));
  const dom = await p.evaluate(() => { const M = window.__pl1m; M.mo.disconnect(); const o = {mut: M.mut, batches: M.dirty, sv: M.sv}; stop(); return o; });
  const lights = await p.evaluate(() => ({ph: document.querySelectorAll('.se-cell.ph').length, led: UI.leds.filter(l => l.classList.contains('on')).length}));
  const d = k => +((m1[k] || 0) - (m0[k] || 0)).toFixed(3);
  return {view, on, domMut: dom.mut, batches: dom.batches, songDraws: dom.sv, style: d('RecalcStyleCount'), layout: d('LayoutCount'), scriptMs: Math.round(d('ScriptDuration') * 1000), taskMs: Math.round(d('TaskDuration') * 1000), styleMs: Math.round(d('RecalcStyleDuration') * 1000), ...lights};
};
const meas = [];
for (const view of ['matrix', 'song', 'lauf', 'steps']) for (const on of [true, false]) meas.push(await measure(view, on));
console.log('MESSUNG ' + JSON.stringify(meas));
for (const view of ['matrix', 'song', 'lauf', 'steps']) {
  const a = meas.find(m => m.view === view && m.on), z = meas.find(m => m.view === view && !m.on);
  const crit = view === 'song' ? z.songDraws * 4 <= a.songDraws && z.style < a.style : z.domMut < a.domMut * .7 && z.style < a.style;
  ok('Lauflichter aus (' + view + '): ' + (view === 'song' ? 'Song-Bild nur je Takt statt ~30/s' : 'weniger DOM-Änderungen und Stil-Rechnungen') + ', keine laufende Marke/LED', crit && z.ph === 0 && z.led === 0,
    {an: {dom: a.domMut, songBilder: a.songDraws, stil: a.style, layout: a.layout, skriptMs: a.scriptMs, taskMs: a.taskMs}, aus: {dom: z.domMut, songBilder: z.songDraws, stil: z.style, layout: z.layout, skriptMs: z.scriptMs, taskMs: z.taskMs}});
}
const LL1 = await p.evaluate(async () => { pl1LlSet(true); ROLLP.view = 'lauf'; setSongView(false); openRoll(0, 0); play(); await new Promise(r => setTimeout(r, 1500)); const o = {ph: document.querySelectorAll('.se-cell.ph').length, led: UI.leds.filter(l => l.classList.contains('on')).length}; stop(); closeRoll(); return o; });
ok('wieder an: LAUF-Marke und Takt-LED laufen wie vorher', LL1.ph === 1 && LL1.led === 1, LL1);

/* ---------- 8) nichts verschiebt sich (gegen die Basis), alte Projekte gleich, Guide ---------- */
const lay = async (pg, vw, vh) => {
  await pg.setViewportSize({width: vw, height: vh}); await pg.waitForTimeout(300);
  return pg.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms)), R_ = e => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)].join(','); };
    stop(); SYNQUENZER.loadDemo(); closeRoll(); closeEditor(); setSongView(false); await wait(150);
    const o = {};
    ROLLP.view = 'lauf'; openRoll(0, 0); await wait(250); o.lauf = [...document.querySelectorAll('#rollSheet button, #rollSheet .se-cell')].map(R_).join(';');
    lf1StepPop(0, 0, 2, ED.lauf.se.cells[2]); await wait(150); o.lf1 = [...UI.pop.el.querySelectorAll('button[data-a]')].map(e => { const r = e.getBoundingClientRect(), P = UI.pop.el.getBoundingClientRect(); return [Math.round(r.left - P.left), Math.round(r.top - P.top), Math.round(r.width), Math.round(r.height)].join(','); }).join(';'); closePop();
    ROLLP.view = 'roll'; openRoll(0, 0); await wait(250); o.roll = [...ED.roll.el.acts.children].filter(b => b.textContent !== '🔒 Locks' && !b.hidden).map(R_).join(';');
    ED.dTab = 'steps'; openRoll(DRUM_T, 0); await wait(250); o.steps = [...document.querySelectorAll('#drumSheet button, #drumSheet .se-cell')].map(R_).join(';');
    closeEditor(); R.selT = 0; openEditor(); await wait(250); o.synth = [...document.querySelectorAll('#synthSheet button, #synthSheet .knob')].map(R_).join(';');
    closeEditor(); o.data = JSON.stringify(S.tracks.map(t => t.clips)) + JSON.stringify(S.tracks.map(t => t.sound));
    openMenu(); await wait(250); const rows = [...EL.menu.querySelectorAll('.mrow')]; const gl = rows.find(r => r.querySelector('.lbl') && r.querySelector('.lbl').textContent === 'Leucht-Look'), lim = gl ? gl.getBoundingClientRect().bottom : Infinity;
    o.menu = rows.filter(r => r.getBoundingClientRect().top < lim).map(R_).join(';'); closeMenu();
    return o;
  });
};
const pb = await ctx.newPage(); await pb.goto('file://' + basis); await pb.waitForTimeout(1500);
const pn = await ctx.newPage(); await pn.goto('file://' + path.resolve(file)); await pn.waitForTimeout(1500);
for (const [vw, vh] of [[428, 926], [926, 428]]) {
  const A_ = await lay(pb, vw, vh), B_ = await lay(pn, vw, vh);
  const diff = Object.keys(A_).filter(k => k !== 'lf1' || vw < 600 ? A_[k] !== B_[k] : false);
  ok('nichts verschiebt sich ' + vw + '×' + vh + ' (LAUF, Schritt-Menü, ROLLE-Aktionen, SCHRITTE, Klang-Editor, Menü bis „Lauflichter“; Daten gleich)', !diff.length, {diff});
  if (vw > 600) { const a = A_.lf1.split(';'), c = B_.lf1.split(';'); ok('quer: Knöpfe des Schritt-Menüs an derselben Stelle und gleich groß', a.join(';') === c.join(';'), {basis: a.slice(0, 3), pl1: c.slice(0, 3)}); }
}
await pb.close(); await pn.close();
await p.setViewportSize({width: 428, height: 926}); await W(300);
const G = await p.evaluate(async () => { const a = ui1Search('lock'), c = ui1Search('lauflicht'); const j = ui1Jump('lauflicht'); await new Promise(r => setTimeout(r, 1200)); const o = {lock: a.map(e => e.id).slice(0, 3), ll: c.map(e => e.id).slice(0, 2), jump: UI1.lastJump}; if (EL.menu.classList.contains('open')) closeMenu(); return o; });
ok('Guide „Wo finde ich …?“: „Lock“ → Parameter-Locks, „Lauflicht“ → Lauflichter (Sprung zeigt die Zeile)', G.lock[0] === 'locks' && G.ll[0] === 'lauflicht' && G.jump && G.jump.ok && G.jump.target, G);

/* ---------- 9) Pflicht ---------- */
const src = fs.readFileSync(file, 'utf8');
const bad = ['Korg', 'microKORG', 'RADIAS', 'DWGS', 'Kodamo', 'Mask1', 'Clavia', 'Kompakt'].filter(w => new RegExp(w, 'i').test(src)).concat(/\bNord\b/.test(src) ? ['Nord'] : []);
ok('Pflicht: Markenwörter 0, „MS 2000“ genau 1, „  live: true,“ genau 1', !bad.length && src.split('MS 2000').length === 2 && src.split('  live: true,').length === 2, {bad});
ok('keine Fehler in der Konsole', errs.length === 0, errs.slice(0, 5));
fs.writeFileSync(path.join(out, 'pl1-test-ergebnis.json'), JSON.stringify({res, meas}, null, 1));
const n = res.filter(r => r.pass).length; console.log(`\n${n}/${res.length} OK`);
await b.close();
