// N8I134 build: bau/snapshots/R-4300.html (4.30.0) + the hunks below + the sources in src/ -> index.html.
// Every hunk must match exactly once (else the build stops), so a changed base never builds silently wrong.
// node mk.mjs [--out <file>]
import fs from 'fs'; import path from 'path'; import {fileURLToPath} from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = path.join(HERE, '../../snapshots/R-4300.html');
const oi = process.argv.indexOf('--out'), OUT = oi > 0 ? path.resolve(process.argv[oi + 1]) : path.join(HERE, 'index.html');
const src = f => { let s = fs.readFileSync(path.join(HERE, 'src', f), 'utf8').replace(/\s+$/, '') + '\n'; s = s.replace(/^if \(typeof module[^\n]*\n/m, ''); if (/<\/script/i.test(s)) throw new Error(f + ': enthält </script'); return s; };
const ascii = (f, s) => { const m = s.match(/[^\x00-\x7f]/); if (m) throw new Error(f + ': nicht ASCII: ' + JSON.stringify(m[0]) + ' bei ' + s.slice(Math.max(0, m.index - 40), m.index + 10)); return s; };
let s = fs.readFileSync(BASE, 'utf8');
let n = 0;
function rep(a, b, label) {
  const i = s.indexOf(a); if (i < 0) throw new Error('Stelle fehlt: ' + (label || a.slice(0, 80)));
  if (s.indexOf(a, i + 1) >= 0) throw new Error('Stelle nicht eindeutig: ' + (label || a.slice(0, 80)));
  s = s.slice(0, i) + (typeof b === 'function' ? b(a) : b) + s.slice(i + a.length); n++;
}
const before = (a, ins, l) => rep(a, x => ins + x, l), after = (a, ins, l) => rep(a, x => x + ins, l);
const block = (name, body) => `/*@@${name}@@*/\n${body}/*@@/${name}@@*/\n`;

/* ---------- worklet 'dirigent-analog' (A.3, B.1 5.2-5.4, B.3 4.2) ---------- */
before("registerProcessor('dirigent-analog', AnalogCore);",
  block('SRCORE', ascii('srcore.js', src('srcore.js'))) + block('LFWK', ascii('lfwk.js', src('lfwk.js'))) + block('N8WK', ascii('n8wk.js', src('n8wk.js'))), 'registerProcessor analog');
before("    if (m.set) this.setReq(m.set, !!m.xf, m.fm6 || null);      // V4a: a whole sound = params + FM patch in one crossfade",
  "    // Nachtrag 8 (A.3): mkSong (above) -> lf -> morphStop -> morph -> sr -> set; the set of a table / morph key is its base\n" +
  "    if (m.lf !== undefined) this.lfMsg(m.lf);\n" +
  "    if (m.morphStop) { this.srInit(); for (const k of m.morphStop.keys || []) this.moDrop(k); }\n" +
  "    if (m.morph) this.moMsg(m.morph);\n" +
  "    if ('sr' in m) this.srMsg(m.sr);\n" +
  "    if (m.set && (this.srOn || this.mo)) this.srSetIn(m.set, !!m.xf);\n" +
  "    if (m.srProbe != null) { this.srInit(); this.srPrb = !!m.srProbe; }\n" +
  "    if (m.moProbe != null) { this.srInit(); this.moPrb = !!m.moProbe; }\n" +
  "    if (m.n8q) this.port.postMessage({n8q: {lfMiss: this.lfMiss || 0, lf: [!!this.lf1, !!this.lf2], srOn: !!this.srOn, xs: this.srXs || 0, x: this.srX || 0, mo: !!this.mo, defer: this.srDefer || 0, n: this.srN || 0, keys: this.srTab ? this.srTab.map(e => e.k) : [], P: Object.assign({}, this.P)}});\n", 'onMsg set');
before("    if (this.xfHeld && this.xfNeedFm && --this.xfWait <= 0) { this.xfNeedFm = false; this.xfTry(); }   // the FM patch did not come: start with the current one",
  "    if (this.srOn || this.mo) this.srBlock(f0);                   // Nachtrag 8 I1a/I1c: only with a table or a morph\n", 'process srBlock');
before("    let fv = null;\n    if (this.scopeOn) for (const v of this.V)",
  "    if ((P.l1shape | 0) === 5) { const q = this.lfSongPh(frame, P.l1sync); this.g51 = q >= 0 ? q : this.gl1; }   // I3a: TAKT form at the song beat\n" +
  "    if ((P.l2shape | 0) === 5) { const q = this.lfSongPh(frame, P.l2sync); this.g52 = q >= 0 ? q : this.gl2; }\n", 'control g51');
rep("      src[S_LFO1] = this.lfoVal(P.l1shape | 0, p1, P.l1retrig ? v.sh1 : this.gsh1) * fade1; src[S_LFO2] = this.lfoVal(P.l2shape | 0, p2, P.l2retrig ? v.sh2 : this.gsh2) * fade2;",
  "      const sh1_ = P.l1shape | 0, sh2_ = P.l2shape | 0;   // I3a: 5 = drawn (table lf), the free phase at the song beat\n" +
  "      src[S_LFO1] = (sh1_ === 5 ? this.lf5(1, P.l1retrig ? p1 : this.g51, P.l1sync) : this.lfoVal(sh1_, p1, P.l1retrig ? v.sh1 : this.gsh1)) * fade1;\n" +
  "      src[S_LFO2] = (sh2_ === 5 ? this.lf5(2, P.l2retrig ? p2 : this.g52, P.l2sync) : this.lfoVal(sh2_, p2, P.l2retrig ? v.sh2 : this.gsh2)) * fade2;", 'control lfo');
rep("sc[S_LFO1] = this.lfoVal(this.P.l1shape | 0, this.gl1, this.gsh1); sc[S_LFO2] = this.lfoVal(this.P.l2shape | 0, this.gl2, this.gsh2);",
  "sc[S_LFO1] = (this.P.l1shape | 0) === 5 ? this.lf5(1, this.g51 || 0, this.P.l1sync) : this.lfoVal(this.P.l1shape | 0, this.gl1, this.gsh1); sc[S_LFO2] = (this.P.l2shape | 0) === 5 ? this.lf5(2, this.g52 || 0, this.P.l2sync) : this.lfoVal(this.P.l2shape | 0, this.gl2, this.gsh2);", 'scope lfo');

/* ---------- SynthHost: one more argument for the riders, a plain sender, the probe answers ---------- */
rep("    E.set = (diff, xf, fm6, mods, mk) => { Object.assign(E.sent, diff); E.flush(); const m = xf ? {set: diff, xf: true} : {set: diff}; if (mods) m.mods = mods; if (fm6) m.fm6 = fm6; if (mk) m.mk = mk; post(m); };",
  "    E.set = (diff, xf, fm6, mods, mk, ex) => { Object.assign(E.sent, diff); E.flush(); const m = xf ? {set: diff, xf: true} : {set: diff}; if (mods) m.mods = mods; if (fm6) m.fm6 = fm6; if (mk) m.mk = mk; if (ex) Object.assign(m, ex); post(m); };   // N8: ex = lf / morph / sr riders (A.3)\n" +
  "    E.n8 = m => { E.flush(); post(m); };                           // N8: {sr} / {morph} / {lf} alone (one send path per engine)", 'E.set');
after("      if (m.mkHold) { const f = E.holdQ; E.holdQ = []; for (const cb of f || []) cb(m.mkHold); }\n",
  "      if (m.srp) { if (E.srpLog && E.srpLog.length < 20000) E.srpLog.push(m.srp); }                 // N8 test hooks (__srProbe / __morphProbe)\n" +
  "      if (m.mop) { if (E.mopLog && E.mopLog.length < 20000) E.mopLog.push(m.mop); }\n" +
  "      if (m.n8q) { E.n8qLast = m.n8q; E.lfMiss = m.n8q.lfMiss; const cb = E.n8qCb; E.n8qCb = null; if (cb) cb(m.n8q); }\n", 'onmessage');

/* ---------- the form core before SQStore (normSynthP keeps l1f / l2f) ---------- */
before("<script>\n/* ===== SQStore — embedded", '<script>\n' + block('FORM', src('form.js')) + '</script>\n', 'SQStore script');
rep("    l1shape: [0, 4, 1], l1rate: [.01, 40], l1sync: [0, 64], l1retrig: [0, 1, 1], l1fade: [0, 10],\n    l2shape: [0, 4, 1],",
  "    l1shape: [0, 5, 1], l1rate: [.01, 40], l1sync: [0, 64], l1retrig: [0, 1, 1], l1fade: [0, 10],      // I3: 5 = drawn (needs l1f)\n    l2shape: [0, 5, 1],", 'AN l1shape');
after("    const o = normAnalog(bare ? Object.assign({}, FM_BASE, flat) : flat);\n",
  "    // I3 (Nachtrag 8 3.2): the drawn LFO forms l1f / l2f (formNorm); shape 5 needs its form (else 1) and a TAKT length (else 1/1)\n" +
  "    for (const n of [1, 2]) { const f = p['l' + n + 'f'] && G.FORM ? G.FORM.norm(p['l' + n + 'f']) : null; if (f) o['l' + n + 'f'] = f;\n" +
  "      if (o['l' + n + 'shape'] === 5) { if (!f) o['l' + n + 'shape'] = 1; else if (!(o['l' + n + 'sync'] > 0)) o['l' + n + 'sync'] = 4; } }\n", 'normSynthP');
rep("pd('l1shape l2shape', 'Form', {vals: [0, 1, 2, 3, 4], def: [0, 1]});", "pd('l1shape l2shape', 'Form', {vals: [0, 1, 2, 3, 4, 5], def: [0, 1]});   // I3: 5 = Gemalt", 'PD l1shape');
rep("const LFO_SHAPE_ICO = ['∿', '∧', '⟋', '⊓', 'S&H'], LFO_SHAPE_NAME = ['Sinus', 'Dreieck', 'Säge', 'Rechteck', 'Sample & Hold'];",
  "const LFO_SHAPE_ICO = ['∿', '∧', '⟋', '⊓', 'S&H', '✎'], LFO_SHAPE_NAME = ['Sinus', 'Dreieck', 'Säge', 'Rechteck', 'Sample & Hold', 'Gemalt'];   // I3: 5 ✎", 'LFO_SHAPE_ICO');

/* ---------- data (Z3): clip.st, S.sr, song.sr, S.need ---------- */
before("  return out;\n}\nfunction normTrack(t, def, pk, warns) {", "  if (c.st) { const st = stNorm(c.st); if (st) out.st = st; }                                  // N8 I1a: Klangzustand (V6a)\n", 'normClip');
after("  if (c.pre) o.pre = c.pre.map(n => ({t: n.t, d: n.d, n: n.n, v: n.v}));   /* G3 */\n", "  if (c.st) o.st = JSON.parse(JSON.stringify(c.st));             // N8 I1a\n", 'cleanClip');
rep("    const nvE = p.tracks.filter(t => t.sound && t.sound._nv).map(t => t.sound._nv.engine);\n    if (nvF > SQStore.PROJECT_FORMAT_READ || nvE.length) Object.defineProperty(p, '_newer', {value: Object.defineProperty({f: nvF, e: nvE, w: nv0.w || 0}",
  "    if (obj.sr) { const sr = srNorm(obj.sr, p.tracks); if (sr) p.sr = sr; }        // N8 I1c: Super-Regler\n" +
  "    const nvN = needNorm(obj, p);                                                    // N8 Baustein N (A.4): S.need, unknown features lock\n" +
  "    const nvE = p.tracks.filter(t => t.sound && t.sound._nv).map(t => t.sound._nv.engine);\n    if (nvF > SQStore.PROJECT_FORMAT_READ || nvE.length || nvN.length) Object.defineProperty(p, '_newer', {value: Object.defineProperty({f: nvF, e: nvE, w: nv0.w || 0, n: nvN}", 'normalizeProject');
rep("  const gb = ggbNorm(o.gb); if (gb) v4.gb = gb; ", "  const gb = ggbNorm(o.gb); if (gb) v4.gb = gb; { const ss = srSongNorm(o.sr, bars); if (ss) v4.sr = ss; }   /* N8 I1e: Fahrten im Song (F3) */ ", 'normSong');
rep("function nvLockOf(p) { const N = p && p._newer; return N && (N.f > SQStore.PROJECT_FORMAT_READ || (N.e.length && !nvOld(N.w))) ? N : null; }",
  "function nvLockOf(p) { const N = p && p._newer; return N && (N.f > SQStore.PROJECT_FORMAT_READ || (N.e.length && !nvOld(N.w)) || (N.n && N.n.length)) ? N : null; }   // N8 A.4: + unknown S.need", 'nvLockOf');
rep("function serializeProject() { syncUi(); return JSON.stringify(S, stripReplacer); }", "function serializeProject() { syncUi(); return needWith(S, () => JSON.stringify(S, stripReplacer)); }   // N8 A.4: need from the data, S unchanged", 'serializeProject');
rep("  const o = SQStore.buildProjectFile(p, lib ? (LIB.ok ? LIB.lib.all() : []) : null, VERSION);", "  const o = needWith(p, () => SQStore.buildProjectFile(p, lib ? (LIB.ok ? LIB.lib.all() : []) : null, VERSION));   // N8 A.4", 'projectFileObj');

/* ---------- undo 'sr' (Z8) ---------- */
rep("  if (e.kind === 'group') return null;                     // V2a: the items carry their own states\n", x => x + "  if (e.kind === 'sr') return srSnap();                   // N8 I1c\n", 'undoState');
rep("  else if (e.kind === 'part') partRestore(JSON.parse(val));\n", x => "  else if (e.kind === 'sr') srRestore(JSON.parse(val));            // N8 I1c\n" + x, 'undoApply');
rep("  volatile: ['ui', 'settings.coach'], kinds: new Map(),", "  volatile: ['ui', 'settings.coach', 'need'], kinds: new Map(),   // N8 A.4: need is derived from the data", 'HIST volatile');
rep("HIST.kind('fx', () => [['fxBus']]);\n", x => x + "HIST.kind('sr', () => [['sr']]);                            // N8 I1c\n", 'HIST sr');

/* ---------- engines (Z2) ---------- */
rep("    if (!AU.synth[i]) { AU.synth[i] = newEngine(A.trackIn, tr.sound); if (UI.fmxLvT === i) AU.synth[i].fmxLv(true); }",
  "    if (!AU.synth[i]) { AU.synth[i] = newEngine(A.trackIn, tr.sound); if (UI.fmxLvT === i) AU.synth[i].fmxLv(true); const rd = n8Riders(i, false); if (rd) AU.synth[i].n8(rd); }   // N8: lf / morph / sr of a new engine", 'syncEngine new');
rep("      AU.synth[i].set(wkFlat(tr.sound), true, fp, wkMods(tr.sound), tr.sound.engine === 'mk' ? tr.sound.p.mk : null);",
  "      AU.synth[i].set(n8Flat(i, wkFlat(tr.sound)), true, fp, wkMods(tr.sound), tr.sound.engine === 'mk' ? tr.sound.p.mk : null, n8Riders(i, true));   // N8 (A2): sr / morph / lf ride along, taken before set", 'syncEngine full');
rep("  return UI.fmSolo && UI.fmSolo.t === i ? fmSoloPatch(snd.p.fm6, UI.fmSolo.k, snd.p.fmx) : wkFmOf(snd.p);",
  "  return UI.fmSolo && UI.fmSolo.t === i ? fmSoloPatch(snd.p.fm6, UI.fmSolo.k, snd.p.fmx) : srFmPatch(i, wkFmOf(snd.p));   // N8: operator keys of the super-regler", 'wkFm6Patch');
rep("  if ('poly' in d && L.polyH) d.polyH = L.polyH;                         /* K2 */\n  E.set(d);",
  "  if ('poly' in d && L.polyH) d.polyH = L.polyH;                         /* K2 */\n  if (R.st[i]) n8Flat(i, d, true);                                       // N8 I1a: a held state stays the base\n  E.set(d);", 'wkFlush');
rep("function liveUpdate(i, key) {\n  const c = AU.ctx; if (!c) return;\n  const tr = S.tracks[i]; if (!tr || tr.kind !== 'synth') return;\n  if (key.startsWith('fx.')) { applyTrackParams(i, false); return; }\n  const snd = tr.sound, P = snd.p, now = c.currentTime;",
  "function liveUpdate(i, key, Pov) {                                   // N8: Pov = the effective values (native steps of the super-regler / state)\n  const c = AU.ctx; if (!c) return;\n  const tr = S.tracks[i]; if (!tr || tr.kind !== 'synth') return;\n  if (!Pov && R.st[i]) stHand(i, key);                               // N8 KZ6: who touches, takes over\n  if (key.startsWith('fx.')) { applyTrackParams(i, false); return; }\n  const snd = tr.sound, P = Pov || snd.p, now = c.currentTime;", 'liveUpdate');
rep("function trackFx(tr) { return g4Fx(tr, fxOfSound(tr.sound)); }", "function trackFx(tr) { return srFx(tr, g4Fx(tr, fxOfSound(tr.sound))); }   // G4; N8: state and super-regler on the track values", 'trackFx');
rep("  const P0 = o && o.P ? o.P : slotParams(sl.id), P = ex && ex.lk ?", "  const P0 = o && o.P ? o.P : srDrumP(sl.id, slotParams(sl.id), t), P = ex && ex.lk ?", 'drumHit');
rep("  const snd = snd0.engine === 'mk' ? mkEco(snd0, i) : snd0, P = snd.p, eng = snd.engine === 'fm6' && !P.fm6 ? 'analog' : snd.engine;",
  "  const snd = snd0.engine === 'mk' ? mkEco(snd0, i) : (o.sound || !(S.sr || R.st[i]) || (isWkEngine(snd0.engine) && AU.synth[i]) ? snd0 : srEffSnd(i, t0)), P = snd.p, eng = snd.engine === 'fm6' && !P.fm6 ? 'analog' : snd.engine;   // N8: native = effective sound", 'spawnVoice');
rep("      const p = R.pend[i];\n      if (p && p.beat < b1) {", "      try { stTick(i, now); } catch (e) { tickErr(e); }            // N8 I1a: scene morph (KZ1)\n      const p = R.pend[i];\n      if (p && p.beat < b1) {", 'tick stTick');
rep("    if (R.songPlay) { try { songTick(b0, b1); } catch (e) { tickErr(e); } }", x => "    if (R.sr.drive) { try { srDriveTick(); } catch (e) { tickErr(e); } }   // N8 I1c\n" + x, 'tick drive');
rep("  for (let i = 0; i < MAX_T; i++) { R.slot[i] = S.tracks[i] && S.tracks[i].clips[0] ? 0 : -1; R.own[i] = null; R.pend[i] = null; R.cstart[i] = 0; R.prev[i] = null; }",
  x => x + "\n  srOnLoad();                                                // N8 I1c: the knob opens at S.sr.x", 'applyProject');

/* ---------- K1 rows (Z7) ---------- */
rep("function k1Mods(i) {\n  const s = sndOf(i); if (!s || s._nv) return [];", "function k1Mods(i) { const o = k1ModsBase(i); return S.tracks[i] && !(sndOf(i) && sndOf(i)._nv) ? n8K1Rows(i, o) : o; }   // N8 A.11: + state and super-regler rows\nfunction k1ModsBase(i) {\n  const s = sndOf(i); if (!s || s._nv) return [];", 'k1Mods');
rep("function k1Del(i, key) {\n  const e = k1Mods(i).find(x => x.key === key); if (!e) return false;", "function k1Del(i, key) {\n  const e = k1Mods(i).find(x => x.key === key); if (!e) return false;\n  if (e.kind === 'sr' || e.kind === 'st') return n8K1Del(i, e);       // N8: one undo ('sr' / 'clip')", 'k1Del');

/* ---------- I3c: LFO page ✎, preview, close paths (ported from i3-br-U) ---------- */
rep("  const shape = sSeg(pre + 'shape', LFO_SHAPE_ICO.map((ic, k) => [k, ic, LFO_SHAPE_NAME[k]]), 'wv', 'LFO ' + n + ' Form');",
  "  // I3c (Nachtrag 8 6.2): the 6th form ✎ (5 = drawn). First tap without a form: shape 5, TAKT 1/1 if FREI, the start triangle,\n" +
  "  // one undo, then the form sheet opens; with a form it only switches. The other forms as before (setP)\n" +
  "  let lfOpen = false;\n" +
  "  const shape = makeSeg(LFO_SHAPE_ICO.map((ic, k) => [k, ic, LFO_SHAPE_NAME[k]]), () => sndGet(S.tracks[i].sound, pre + 'shape'), v => {\n" +
  "    if (v !== 5) { setP(i, pre + 'shape', v); return; }\n" +
  "    lfOpen = !P()[pre + 'f']; lfoDrawn(i, n, lfOpen ? FORM.START() : null);\n" +
  "  }, 'wv', {undo: {snap: () => soundSnapshot(i), commit: (b, l) => commitSound(i, b, l + (P()[pre + 'shape'] === 5 ? ' Gemalt' : ''))}, label: 'LFO ' + n + ' Form'});\n" +
  "  shape.dataset.key = pre + 'shape';\n" +
  "  onTap(shape, () => { if (lfOpen) { lfOpen = false; formOpen({kind: 'lfo', i, n}); } }, 'button');", 'pageLfo shape');
rep("  pv.innerHTML = `<svg viewBox=\"0 0 120 56\" preserveAspectRatio=\"none\"><line x1=\"0\" y1=\"28\" x2=\"120\" y2=\"28\" class=\"ax\"/><path class=\"lw\"/><circle r=\"4\" class=\"ld\"/></svg>`;\n  const path = pv.querySelector('.lw'), dot = pv.querySelector('.ld');\n  const drawShape = () => { const sh = LFO_FX_SHAPE[P()[pre + 'shape'] | 0]; let d = ''; for (let x = 0; x <= 120; x += 2) { const ph = (x / 120 * 2) % 1, cyc = Math.floor(x / 60); d += (x ? 'L' : 'M') + x + ' ' + (28 - 22 * FX.lfoShape(sh, ph, cyc, 1)).toFixed(1); } path.setAttribute('d', d); };\n  drawShape();\n  ED.lfoPrev = {n, dot, draw: drawShape};\n",
  "  pv.innerHTML = `<svg viewBox=\"0 0 120 56\" preserveAspectRatio=\"none\"><line x1=\"0\" y1=\"28\" x2=\"120\" y2=\"28\" class=\"ax\"/><path class=\"lw\"/><circle r=\"4\" class=\"ld\"/></svg><span class=\"lfn\"></span>`;\n" +
  "  const path = pv.querySelector('.lw'), dot = pv.querySelector('.ld'), pvName = pv.querySelector('.lfn');\n" +
  "  // I3c (6.2): at ✎ the preview shows ONE cycle of the form, its name below, and is a key that opens the form sheet\n" +
  "  const drawShape = () => {\n" +
  "    const drawn = (P()[pre + 'shape'] | 0) === 5 && P()[pre + 'f'], f = drawn ? P()[pre + 'f'] : null;\n" +
  "    const sh = LFO_FX_SHAPE[P()[pre + 'shape'] | 0]; let d = '';\n" +
  "    for (let x = 0; x <= 120; x += 2) { const ph = (x / 120 * 2) % 1, cyc = Math.floor(x / 60); d += (x ? 'L' : 'M') + x + ' ' + (28 - 22 * (f ? FORM.sharp(f, Math.min(x / 120, .99999)) : FX.lfoShape(sh, ph, cyc, 1))).toFixed(1); }\n" +
  "    path.setAttribute('d', d); pv.classList.toggle('drawn', !!f);\n" +
  "    const nm = f ? (f.n || 'Gemalt') : ''; if (pvName.textContent !== nm) pvName.textContent = nm;\n" +
  "    if (f) { pv.setAttribute('role', 'button'); pv.setAttribute('aria-label', 'LFO ' + n + ' Form öffnen'); } else { pv.removeAttribute('role'); pv.removeAttribute('aria-label'); }\n" +
  "  };\n" +
  "  onTap(pv, () => { if ((P()[pre + 'shape'] | 0) === 5 && P()[pre + 'f']) formOpen({kind: 'lfo', i, n}); });\n" +
  "  drawShape();\n  ED.lfoPrev = {n, dot, draw: drawShape};\n" +
  "  const modeUpd = () => { const fb = mode.querySelector('button'), on5 = (P()[pre + 'shape'] | 0) === 5;   // I3c: FREI grey at ✎\n" +
  "    if (fb && fb.disabled !== on5) { fb.disabled = on5; fb.classList.toggle('inert', on5); fb.title = on5 ? 'Gemalte Formen laufen im Takt' : ''; } };\n" +
  "  modeUpd(); ED.refreshers.push(modeUpd);\n", 'pageLfo preview');
rep("  const sh = LFO_FX_SHAPE[P['l' + L.n + 'shape'] | 0], y = 28 - 22 * FX.lfoShape(sh, ph, Math.floor(cyc), 1);\n  L.dot.setAttribute('cx', (ph * 60).toFixed(1)); L.dot.setAttribute('cy', y.toFixed(1));",
  "  const f = (P['l' + L.n + 'shape'] | 0) === 5 ? P['l' + L.n + 'f'] : null;     // I3c: one cycle of the drawn form\n" +
  "  const sh = LFO_FX_SHAPE[P['l' + L.n + 'shape'] | 0], y = 28 - 22 * (f ? FORM.sharp(f, ph) : FX.lfoShape(sh, ph, Math.floor(cyc), 1));\n" +
  "  L.dot.setAttribute('cx', (ph * (f ? 120 : 60)).toFixed(1)); L.dot.setAttribute('cy', y.toFixed(1));", 'lfoPrevFrame');
rep("function launchScene(s) {\n", x => x + "  formAbort('szene');                                     // I3c (6.3): a scene change closes the form sheet\n", 'launchScene');
rep("function panic() {\n", x => x + "  formAbort('panik');                                     // I3c (5.5): panic drops a running stroke or wipe\n", 'panic');
rep("function closeSheets() {\n", x => x + "  formAbort('zu');                                        // I3c: the form sheet closes with the editor\n", 'closeSheets');

/* ---------- blocks loaded on first need (A.13) ---------- */
before('<script type="text/plain" id="sq-mk-src">',
  '<script type="text/plain" id="sq-form-src">\n/* ===== I3b-d (Nachtrag 8 B.3): block sq-form-src, evaluated on first need (formLoad): FORMCLEAN and the form sheet ===== */\n' + block('FORMCLEAN', src('formclean.js')) + block('FORMUI', src('formui.js')) + '</script>\n' +
  '<script type="text/plain" id="sq-sr-src">\n/* ===== I1f (Nachtrag 8 B.1 6.7): block sq-sr-src, evaluated on first need (srLoad): the TILT logic ===== */\n' + block('NEIGEN', src('neigen.js')) + '</script>\n', 'sq-mk-src');
/* ---------- main thread: the always-loaded part and the test API ---------- */
after("window.SYNQUENZER = SYNQUENZER; window.DIRIGENT = SYNQUENZER;\n", block('SRCORE_MAIN', src('srcore.js')) + block('N8MAIN', src('n8main.js')) + block('TAPN', src('tapmain.js')) + block('API', src('api.js')), 'window.SYNQUENZER');
/* ---------- I4c: tapNotes in the VS2 block (DOM-free) ---------- */
if (fs.existsSync(path.join(HERE, 'src', 'tapnotes.js'))) for (const h of JSON.parse(fs.readFileSync(path.join(HERE, 'src', 'tapnotes.hunks.json'), 'utf8'))) {
  if (h.file) { const body = src(h.file); h.op === 'before' ? before(h.at, body, h.file) : after(h.at, body, h.file); } else rep(h.at, h.to, h.label);
}
fs.writeFileSync(OUT, s);
console.log('gebaut →', OUT, (s.length / 1024).toFixed(0) + ' KB,', n, 'Stellen');
