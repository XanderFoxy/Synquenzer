// N8I134 core tests (Playwright + Chromium): Baustein N, I1c data / curves / path / worklet end values / smoothing / undo /
// save-load, I1a scene morph, I3a form + worklet table. node n8-core.mjs [index.html]
import {chromium} from 'playwright';
import path from 'path'; import {fileURLToPath} from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.resolve(process.argv[2] || path.join(HERE, '../index.html'));
let fails = 0; const res = [];
const ok = (id, c, info) => { if (!c) fails++; const l = (c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : ''); res.push(l); console.log(l); };
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true});
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
await p.evaluate(async () => { ensureAudio(); await new Promise(r => setTimeout(r, 800)); });
await p.waitForFunction(() => SynthHost.state === 'ready' && AU.synth[0], null, {timeout: 20000});

// ---- Regel 28 (I1-01 / I3-01 part): a project without the new fields: no need, no new message keys, JSON unchanged by a round trip
const r28 = await p.evaluate(async () => {
  const sent = []; const o = MessagePort.prototype.postMessage;
  MessagePort.prototype.postMessage = function (m) { try { if (m && typeof m === 'object') sent.push(Object.keys(m).join(',')); } catch (e) {} return o.apply(this, arguments); };
  SYNQUENZER.play(); await new Promise(r => setTimeout(r, 2500)); SYNQUENZER.stop();
  syncEngines(); await new Promise(r => setTimeout(r, 200));
  MessagePort.prototype.postMessage = o;
  const j = serializeProject(), back = JSON.stringify(normalizeProject(JSON.parse(j)), stripReplacer);
  return {bad: sent.filter(k => /(^|,)(sr|morph|morphStop|lf)(,|$)/.test(k)), n: sent.length, need: 'need' in JSON.parse(j), same: j === back || JSON.stringify(JSON.parse(j)) === JSON.stringify(JSON.parse(back))};
});
ok('I1-01/I3-01 ohne neue Felder: keine sr/morph/lf-Nachricht', r28.bad.length === 0, r28.n + ' Nachrichten, ' + r28.bad.length + ' neu');
ok('N8-02 Projekt ohne Merkmale: kein need', !r28.need);
ok('I1-01 JSON nach Laden unverändert', r28.same);

// ---- I1-27 curves: SRCore against toNorm/fromNorm at 10001 points
const r27 = await p.evaluate(() => {
  const C = SRCORE, out = {};
  const cases = {cutoff: PD.cutoff, res: PD.res, fmBright: PD.fmBright, level: PD.level, 'drum.kick.tAtk': DPD.tAtk, 'fx.pan': PD['fx.pan'], aR: PD.aR};
  for (const k in cases) { const d = cases[k]; if (!d) continue; const D = srDesc(k) || {law: srLawOf(d), lo: d.min, hi: d.max, kk: d.k || 1}; let m1 = 0, m2 = 0;
    for (let i = 0; i <= 10000; i++) { const n = i / 10000, v = fromNorm(d, n), v2 = C.fromN(D.law, D.lo, D.hi, D.kk, n); m1 = Math.max(m1, Math.abs(v - v2) / Math.max(1e-9, Math.abs(v) || 1)); m2 = Math.max(m2, Math.abs(toNorm(d, v) - C.toN(D.law, D.lo, D.hi, D.kk, v))); }
    out[k] = [D.law, m1, m2]; }
  return out;
});
for (const k in r27) ok('I1-27 Kennlinie ' + k + ' (' + r27[k][0] + ')', r27[k][1] <= 1e-9 && r27[k][2] <= 1e-9, r27[k][1].toExponential(1) + ' / ' + r27[k][2].toExponential(1));

// ---- I1-10 srNorm
const r10 = await p.evaluate(() => {
  const uids = S.tracks.map(t => t.uid), R_ = (a, b) => a + Math.random() * (b - a); let bad = 0, kept = 0;
  for (let n = 0; n < 1000; n++) {
    const z = []; for (let j = 0; j < 6; j++) { const u = {}; u[uids[j % 4]] = {c: {cutoff: R_(-2, 2), res: R_(-1, 1), nope: 1}, d: {o1w: [0, 1, 2, 3, 9][j % 5]}}; z.push({p: R_(-.2, 1.3), u, zz: {a: j}}); }
    const o = srNorm({x: R_(-1, 2), sc: 'track', t: uids[1], z, extra: {q: 1}, f: {v: 1, k: [[0, 0, 1, 0], [768, 1000, 0, 0]]}}, S.tracks);
    if (!o || o.z.length > 3 || o.x < 0 || o.x > 1) bad++;
    for (let i = 0; i < o.z.length; i++) { const q = o.z[i]; if (q.p < .1 || q.p > 1 || (i && q.p - o.z[i - 1].p < .1 - 1e-9)) bad++; for (const u in q.u) { for (const k in q.u[u].c || {}) if (Math.abs(q.u[u].c[k]) > 1 || k === 'nope') bad++; } if (!q.zz) bad++; }
    if (o.extra && o.extra.q === 1 && o.f) kept++;
    if (JSON.stringify(srNorm(o, S.tracks)) !== JSON.stringify(o)) bad++;
  }
  return {bad, kept};
});
ok('I1-10 srNorm 1000 Zufallsfälle', r10.bad === 0, r10.bad + ' Verstöße, unbekannte Felder behalten ' + r10.kept + '/1000');

// ---- I1-11 path over Z_k: ② 0.33 cutoff +.2, ④ 1.0 cutoff +.4 / hall +.3 -> hall straight 0..1
const r11 = await p.evaluate(() => {
  const uid = S.tracks[0].uid;
  SYNQUENZER.sr.target({p: .33, u: {[uid]: {c: {cutoff: .2}}}});
  SYNQUENZER.sr.target({p: 1, u: {[uid]: {c: {cutoff: .4, 'fx.rev': .3}}}});
  let e1 = 0, e2 = 0;
  for (let s = 0; s <= 100; s++) { const x = s / 100;
    const c = SYNQUENZER.sr.path(0, 'cutoff', x), h = SYNQUENZER.sr.path(0, 'fx.rev', x);
    const cs = x <= .33 ? .2 * x / .33 : .2 + .2 * (x - .33) / .67, hs = .3 * x;
    e1 = Math.max(e1, Math.abs(c - cs)); e2 = Math.max(e2, Math.abs(h - hs)); }
  return {e1, e2, need: needCalc(S)};
});
ok('I1-11 Weg Cutoff stückweise linear', r11.e1 <= .001, r11.e1.toExponential(1));
ok('I1-11 Hall läuft gerade durch ② (② legt Hall nicht fest)', r11.e2 <= .001, r11.e2.toExponential(1));
ok('N8-02 need = [sr] aus den Daten', JSON.stringify(r11.need) === '["sr"]', JSON.stringify(r11.need));

// ---- I1-12 end value in the worklet: base cutoff, x = 1 -> fromNorm(toNorm(base) + .4); x 0 -> base exactly
const r12 = await p.evaluate(async () => {
  const base = S.tracks[0].sound.p.cutoff, D = PD.cutoff;
  SYNQUENZER.sr.set(1); await new Promise(r => setTimeout(r, 400));
  const q1 = await SYNQUENZER.sr.eng(0);
  SYNQUENZER.sr.set(0); await new Promise(r => setTimeout(r, 400));
  const q0 = await SYNQUENZER.sr.eng(0);
  return {base, want: fromNorm(D, toNorm(D, base) + .4), got1: q1.P.cutoff, got0: q0.P.cutoff, xs0: q0.xs, keys: q1.keys, heard: heardAt(0, 'cutoff')};
});
ok('I1-12 Endwert im Worklet bei 100 %', Math.abs(toN(r12.got1) - toN(r12.want)) <= .001, Math.round(r12.base) + ' Hz → ' + Math.round(r12.got1) + ' Hz (Soll ' + Math.round(r12.want) + ')');
function toN(v) { return Math.log(v / 20) / Math.log(1000); }
ok('I1-12/I1-25 Stellung 0: Grundwert genau (bitgleich)', r12.got0 === r12.base && r12.xs0 === 0, r12.got0 + ' === ' + r12.base);
ok('I1-12 heardAt bei 0 = Grundwert', r12.heard === r12.base);

// ---- I1-13 smoothing: jump 0 -> 1, per block xs; first step <= 12.5 %, tau 20 ms
const r13 = await p.evaluate(async () => {
  SYNQUENZER.sr.probe(0, true); await new Promise(r => setTimeout(r, 50));
  SYNQUENZER.sr.set(1); await new Promise(r => setTimeout(r, 300));
  const L = SYNQUENZER.sr.probe(0, false).sr; const xs = L.map(e => e.xs);
  let st = 0; for (let i = 1; i < xs.length; i++) st = Math.max(st, xs[i] - xs[i - 1]);
  const i0 = xs.findIndex(v => v > 0), i63 = xs.findIndex(v => v >= 1 - Math.exp(-1));
  return {st, blocks: i63 - i0 + 1, n: xs.length, last: xs[xs.length - 1], a: SRCORE.alpha(AU.ctx.sampleRate), sr: AU.ctx.sampleRate};
});
ok('I1-13 größter Schritt je Block = 1 − e^(−128/(0,02·SR))', r13.st <= r13.a + 1e-9 && (r13.sr > 47000 ? r13.st <= .13 : true), (r13.st * 100).toFixed(1) + ' % bei ' + r13.sr + ' Hz (48 kHz: 12,5 %)');
ok('I1-13 τ ≈ 20 ms (63 % nach 7–9 Blöcken)', r13.blocks >= 6 && r13.blocks <= 9, r13.blocks + ' Blöcke');
ok('I1-25 eingerastet: xs === 1', r13.last === 1);

// ---- I1-22 undo of a gesture, save / load deep-equal, need
const r22 = await p.evaluate(async () => {
  const a = JSON.stringify(S.sr); SYNQUENZER.sr.set(.5); const b = JSON.stringify(S.sr);
  undo(); const c = JSON.stringify(S.sr); redo(); const d = JSON.stringify(S.sr);
  const j = JSON.parse(serializeProject()); const back = normalizeProject(JSON.parse(JSON.stringify(j)));
  return {undoOk: a === c && b === d && a !== b, need: j.need, eq: JSON.stringify(back.sr) === JSON.stringify(j.sr), hc: typeof historyCheck === 'function' ? await historyCheck() : 'n/a'};
});
ok('I1-22 Balken-Geste = 1 Undo-Schritt, ↶ ↷ deep-equal', r22.undoOk);
ok('I1-10 Speichern → Laden deep-equal', r22.eq);
ok('N8-02 need beim Speichern = [sr]', JSON.stringify(r22.need) === '["sr"]', JSON.stringify(r22.need));
ok('A.12 historyCheck()', r22.hc === true || r22.hc === 'n/a', String(r22.hc));

// ---- I1-28 / N8-02 lock: need ['zz'] -> locked
const r28b = await p.evaluate(() => { const j = JSON.parse(serializeProject()); j.need = ['sr', 'zz']; const q = normalizeProject(j); return {lock: !!nvLockOf(q), n: q._newer && q._newer.n}; });
ok('I1-28 need [zz] → gesperrt (Hinweisband wie VO-R1)', r28b.lock, JSON.stringify(r28b.n));

// ---- I1-32 teach-in core: x .67, change cutoff + fx.rev on track 0, keep -> exactly these two keys, sound deep-equal
const r32 = await p.evaluate(async () => {
  SYNQUENZER.sr.clear(); SYNQUENZER.sr.set(.67);
  const snd0 = JSON.stringify(S.tracks[0].sound), u0 = UNDO.length;
  const c = SYNQUENZER.sr.capture('track', 0); if (!c.ok) return {err: c.why};
  setP(0, 'cutoff', S.tracks[0].sound.p.cutoff * 2); setP(0, 'fx.rev', .4);
  const k = SYNQUENZER.sr.keep(); await new Promise(r => setTimeout(r, 300));
  const z = S.sr.z[0], keys = Object.keys(z.u[S.tracks[0].uid].c || {}).sort();
  const q = await SYNQUENZER.sr.eng(0);
  return {p: z.p, keys, same: JSON.stringify(S.tracks[0].sound) === snd0, undo: UNDO.length - u0, eff: heardAt(0, 'cutoff'), eng: q.P.cutoff, want: JSON.parse(snd0).p.cutoff * 2};
});
ok('I1-32 Vormachen: Ziel bei 67 % mit genau cutoff + fx.rev', !r32.err && Math.abs(r32.p - .67) < 1e-4 && JSON.stringify(r32.keys) === '["cutoff","fx.rev"]', r32.err || JSON.stringify(r32.keys));
ok('I1-32 track.sound deep-equal nach Merken', r32.same);
ok('I1-32 genau ein Undo-Schritt', r32.undo === 1, String(r32.undo));
ok('I1-32 gehörter Klang = Kopie (Worklet-Endwert)', Math.abs(toN(r32.eng) - toN(r32.want)) < .002, Math.round(r32.eng) + ' / ' + Math.round(r32.want));

// ---- I1a scene morph: state on clip slot 1 of track 0, launch while playing -> monotonic, >= 10 values
const rM = await p.evaluate(async () => {
  SYNQUENZER.sr.clear();
  const tr = S.tracks[0]; if (!tr.clips[1]) tr.clips[1] = deep(tr.clips[0]);
  const base = tr.sound.p.cutoff; SYNQUENZER.st.set(0, 1, {p: {cutoff: Math.min(18000, base * 4)}, x: 'flow'});
  SYNQUENZER.play(); await new Promise(r => setTimeout(r, 600));
  SYNQUENZER.sr.probe(0, true);
  launchScene(1); await new Promise(r => setTimeout(r, 2600));
  const L = SYNQUENZER.sr.probe(0, false).mo, v = L.map(e => e.keys.cutoff).filter(x => typeof x === 'number');
  let mono = true; for (let i = 1; i < v.length; i++) if (v[i] < v[i - 1] - 1e-6) mono = false;
  const distinct = new Set(v.map(x => x.toFixed(2))).size, run = SYNQUENZER.st.run(0);
  SYNQUENZER.stop();
  return {n: v.length, distinct, mono, first: v[0], last: v[v.length - 1], base, run};
});
ok('I1a/V6a-03 Szenen-Morph Cutoff monoton mit ≥ 10 Zwischenwerten', rM.mono && rM.distinct >= 10, rM.distinct + ' Werte, ' + Math.round(rM.first || 0) + ' → ' + Math.round(rM.last || 0) + ' Hz');

// ---- I3a form: norm, ✎ via API, worklet table, lfMiss 0
const rF = await p.evaluate(async () => {
  const f = SYNQUENZER.form.set(0, 1, FORM.lib().Pumpen); const snd = S.tracks[0].sound; snd.p.l1shape = 5; snd.p.l1sync = 4; syncEngine(0, true);
  await new Promise(r => setTimeout(r, 200)); const q = await SYNQUENZER.sr.eng(0);
  const need = needCalc(S), j = JSON.parse(serializeProject()), back = normalizeProject(j);
  return {lf: q.lf, miss: q.lfMiss, need, eq: JSON.stringify(back.tracks[0].sound.p.l1f) === JSON.stringify(f), shape: back.tracks[0].sound.p.l1shape};
});
ok('I3-37 Tabelle im Worklet', rF.lf && rF.lf[0] === true, JSON.stringify(rF.lf));
ok('I3-02 l1f Speichern → Laden deep-equal, Form 5 bleibt', rF.eq && rF.shape === 5);
ok('I3-02 need enthält lf', rF.need.includes('lf'), JSON.stringify(rF.need));


// ---- I1b native (forceNative): a new native voice plays the effective cutoff; track volume (fx.vol) and a drum slot (drum.kick.tDec)
// follow the knob on the main thread; I1-17 drums per hit at 0 / 0.5 / 1
const rN = await p.evaluate(async () => {
  SYNQUENZER.sr.clear(); const uid = S.tracks[0].uid, du = S.tracks[DRUM_T].uid;
  SYNQUENZER.sr.target({p: 1, u: {[uid]: {c: {cutoff: .3, 'fx.vol': -.2}}, [du]: {c: {'drum.kick.tDec': .2}}}});
  UI.forceNative = true; syncEngines(); await new Promise(r => setTimeout(r, 150));
  const out = {wk: !!AU.synth[0]};
  const dec = x => { R.sr.x = x; return srDrumP('kick', slotParams('kick'), AU.ctx.currentTime).tDec; };
  const D = DPD.tDec, b = slotParams('kick').tDec;
  out.d0 = dec(0) === b; out.d1 = Math.abs(toNorm(D, dec(1)) - toNorm(D, b) - .2) < 1e-6; out.d5 = Math.abs(toNorm(D, dec(.5)) - toNorm(D, b) - .1) < 1e-6;
  SYNQUENZER.sr.set(1); await new Promise(r => setTimeout(r, 120));
  const v = spawnVoice(0, 60, .8, AU.ctx.currentTime + .05, {src: 'audition'});
  out.vP = v ? v.P.cutoff : null; out.want = heardAt(0, 'cutoff'); out.base = S.tracks[0].sound.p.cutoff;
  out.vol = trackFx(S.tracks[0]).vol; out.volWant = fromNorm(PD['fx.vol'], toNorm(PD['fx.vol'], fxOfSound(S.tracks[0].sound).vol) - .2);
  if (v) v.release(AU.ctx.currentTime + .2);
  UI.forceNative = false; SYNQUENZER.sr.clear(); syncEngines(); await new Promise(r => setTimeout(r, 150));
  out.back = !!AU.synth[0] && trackFx(S.tracks[0]).vol === fxOfSound(S.tracks[0].sound).vol;
  return out;
});
ok('I1-18 nativ: neue Stimme spielt den gehörten Cutoff', !rN.wk && rN.vP != null && Math.abs(rN.vP - rN.want) < 1e-6 && rN.vP !== rN.base, Math.round(rN.base) + ' → ' + Math.round(rN.vP || 0) + ' Hz');
ok('I1b Spur-Lautstärke folgt dem Super-Regler (Hauptfaden)', Math.abs(rN.vol - rN.volWant) < 1e-9, rN.vol.toFixed(3));
ok('I1-17 Drums je Schlag: 0 / 0,5 / 1 = Grund / Mitte / Ziel', rN.d0 && rN.d5 && rN.d1);
ok('I1b ohne Super-Regler wieder Grundwerte, Worklet zurück', rN.back);

// ---- I4c one note source: taps in an analysis -> tap notes in vsNotesOf's form; without taps vsNotesOf as before (I4-28)
const rT = await p.evaluate(() => {
  const hop = 80, fs = 16000, dt = hop / fs, n = Math.round(2 / dt), f0 = new Float64Array(n), rms = new Float64Array(n).fill(-200);
  for (let i = 0; i < n; i++) { f0[i] = 440 * Math.pow(2, (69 + (i * dt >= 1 ? 3 : 0) - 69) / 12); rms[i] = -20; }
  const tr = {f0, rms, n, hop, fs}, A = {tr, fs, hop, beatOf: s => s * 2, key: {root: 9, scale: 'aeolian'}};
  const without = JSON.stringify(vsNotesOf(Object.assign({}, A), {snap: true}));
  const A2 = Object.assign({}, A, {tips: [0, .5, 1, 1.5].map(s => ({s0: s + .01, s1: s + .4}))});
  const w = vsNotesOf(A2, {snap: true}), again = vsNotesOf(A2, {snap: true});
  return {n: w.notes.length, pitches: w.notes.map(x => x.n).join(','), form: w.notes.every(x => 'b' in x && 'd' in x && 'v' in x && 'raw' in x), tip: w.tip, cached: w === again,
    stimme: vsNotesOf(A2, {snap: true, rh: 'stimme'}).notes.length, without: without === JSON.stringify(vsNotesOf(Object.assign({}, A), {snap: true})), line: tipLine(w.tip)};
});
ok('I4-33 eine Notenquelle: 4 Tipps → 4 Noten in derselben Form', rT.n === 4 && rT.form && rT.pitches === '69,69,72,72', rT.pitches + ' · ' + rT.line);
ok('I4c Ergebnis je Analyse zwischengespeichert', rT.cached);
ok('I4-28 ohne Tipps bzw. rh „stimme“: VS2 wie vorher', rT.without && rT.stimme === 2, 'VS2: ' + rT.stimme + ' Noten');

// ---- I1-14 (part) stepped key: wave 3 at target 0.5; x 1 -> 3, x 0 -> base; pendulum +-0.015 around the middle 0.25 (10x) -> at most 1 switch
const rD = await p.evaluate(async () => {
  SYNQUENZER.sr.clear(); const uid = S.tracks[0].uid, base = S.tracks[0].sound.p.o1w, w = base === 3 ? 1 : 3;
  SYNQUENZER.sr.target({p: .5, u: {[uid]: {d: {o1w: w}}}});
  const q = async x => { SYNQUENZER.sr.set(x); await new Promise(r => setTimeout(r, 250)); return (await SYNQUENZER.sr.eng(0)).P.o1w; };
  const at1 = await q(1), at0 = await q(0);
  SYNQUENZER.sr.set(.235); await new Promise(r => setTimeout(r, 250));
  const seen = []; for (let k = 0; k < 10; k++) { SYNQUENZER.sr.set(k % 2 ? .235 : .265); await new Promise(r => setTimeout(r, 60)); seen.push((await SYNQUENZER.sr.eng(0)).P.o1w); }
  let sw = 0; for (let k = 1; k < seen.length; k++) if (seen[k] !== seen[k - 1]) sw++;
  SYNQUENZER.sr.clear(); await new Promise(r => setTimeout(r, 100));
  return {base, w, at1, at0, sw, after: (await SYNQUENZER.sr.eng(0)).P.o1w};
});
ok('I1-14 stufig: bei 100 % der Ziel-Wert, bei 0 % der Grundwert', rD.at1 === rD.w && rD.at0 === rD.base, rD.base + ' → ' + rD.at1 + ' → ' + rD.at0);
ok('I1-14 Pendeln ± 0,015 um die Mitte (10×) → höchstens 1 Wechsel', rD.sw <= 1, rD.sw + ' Wechsel');
ok('I1c Super-Regler gelöscht → Grundwert im Worklet', rD.after === rD.base);

ok('Konsole ohne Fehler', errs.length === 0, errs.slice(0, 3).join(' | '));
await b.close();
console.log(fails ? 'FEHLER: ' + fails : 'ALLES GRÜN', '(' + res.length + ' Punkte)');
process.exit(fails ? 1 : 0);
