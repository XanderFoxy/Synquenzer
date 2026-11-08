// KOMBI-Test (KF12 = Basis 4.51.0 + KF1 + KF2): alles zugleich in einem Klang – Saite (KF2) + Vokal-Filter (KF2) + Rauschfarbe (KF1)
// + Ringmod (KF1) + Körnung (KF1) –, Speichern/Laden bit-gleich, altes 4.51-Projekt lädt und rendert bit-gleich wie in der Basis.
// Dazu: Ring mit Saite rechnet die Saite selbst (KF12-Einhängung), und jedes Paket klingt im vereinten Worklet genau wie allein.
// Prüfung (Befund 1, Regel 28): KF1-Werte werden nur gespeichert, wenn sie ≠ 0 sind – alte Klänge/Projekte byte-gleich zur Basis; fehlend = neutral
// überall (Worklet nach Werksklang/Undo, Geste zurück auf 0, Reihenfolge beim Speichern, Klangzustand, Lernen, „Was ist anders?“), Teil 8.
// Aufruf: node kombi.mjs <kf12/index.html> <ordner> [basis.html] [kf1/index.html] [kf2/index.html]   (absolute Pfade)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
import path from 'path';
import vm from 'vm';
const W4520 = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w4520';
const [file, dir, basisArg, kf1Arg, kf2Arg] = process.argv.slice(2);
if (!file || !dir) { console.log('Aufruf: node kombi.mjs <index.html> <ordner> [basis.html] [kf1.html] [kf2.html]'); process.exit(2); }
const basis = basisArg || path.join(W4520, 'basis.html'), kf1f = kf1Arg || path.join(W4520, 'kf1/index.html'), kf2f = kf2Arg || path.join(W4520, 'kf2/index.html');
fs.mkdirSync(dir, {recursive: true});
const res = [], errs = [];
const ok = (name, pass, info) => { res.push({name, pass: !!pass}); console.log((pass ? 'OK     ' : 'FEHLER ') + name + (info !== undefined ? '  ' + JSON.stringify(info) : '')); };
const A = fs.readFileSync(file, 'utf8');

/* =============== Teil 0: Worklet im Node-Prüfstand (wie kf1-test: nachgebauter AudioWorkletGlobalScope, Zufall fest) =============== */
function wkLoad(src, name) {
  const a = src.indexOf('<script type="text/plain" id="sq-worklet-src">'), b = src.indexOf('</script>', a), code = src.slice(src.indexOf('>', a) + 1, b), procs = {};
  const M = Object.create(Math); let s = 0; M.random = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const ctx = {sampleRate: 48000, currentFrame: 0, currentTime: 0, console, Math: M, Float64Array, Float32Array, Int32Array, Uint32Array, Int16Array, Int8Array, Uint8Array, Uint16Array, Array, Object, Map, Set, JSON, Number, String, isFinite, isNaN, Infinity, NaN, Error, Symbol, Promise, Date, ArrayBuffer,
    AudioWorkletProcessor: class { constructor() { this.port = {postMessage: () => {}, onmessage: null}; } }, registerProcessor: (n, c) => { procs[n] = c; }};
  ctx.globalThis = ctx; vm.createContext(ctx); vm.runInContext(code, ctx, {filename: name});
  return {ctx, procs, seed: () => { s = 0x9E3779B9 | 0; }};
}
const BASE = {o1w: 0, o1lvl: 1, o2lvl: 0, o3lvl: 0, subLvl: 0, noise: 0, cutoff: 20000, res: 0, drive: 0, fenv: 0, kt: 0, aA: .001, aD: 10, aS: 1, aR: .1, level: .5, analog: 0, spread: 0, eng: 0, ftype: 1};
// notes: [[t0, t1, midi, vel], ...]; sec Sekunden; liefert L, R (Float32) + Hash + Subnormale
function wkRun(W, patch, notes, sec, mods) {
  W.seed();
  const node = new W.procs['dirigent-analog']({processorOptions: {patch: Object.assign({}, BASE, patch), mods: mods || []}});
  const ev = []; notes.forEach(([t0, t1, n, v], k) => { ev.push([t0, 1, k + 1, n, v, -1]); if (t1 != null) ev.push([t1, 2, k + 1]); });
  node.port.onmessage({data: {ev}});
  const blocks = Math.ceil(sec * 48000 / 128), Lo = new Float32Array(blocks * 128), Ro = new Float32Array(blocks * 128);
  const L = new Float32Array(128), R = new Float32Array(128), out = [[L, R]]; let sub = 0;
  for (let k = 0; k < blocks; k++) {
    W.ctx.currentFrame = k * 128; W.ctx.currentTime = k * 128 / 48000; L.fill(0); R.fill(0);
    node.process([[]], out); Lo.set(L, k * 128); Ro.set(R, k * 128);
    for (let i = 0; i < 128; i++) { const v = Math.abs(L[i]); if (v !== 0 && v < 1.18e-38) sub++; }
  }
  let h = 0x811c9dc5 >>> 0; const uL = new Uint32Array(Lo.buffer), uR = new Uint32Array(Ro.buffer);
  for (let i = 0; i < uL.length; i++) { h ^= uL[i]; h = Math.imul(h, 0x01000193) >>> 0; h ^= uR[i]; h = Math.imul(h, 0x01000193) >>> 0; }
  return {L: Lo, R: Ro, h: h.toString(16), sub};
}
const rmsDb = (x, a, b) => { let e = 0; a = Math.round(a * 48000); b = Math.round(b * 48000); for (let i = a; i < b; i++) e += x[i] * x[i]; return +(10 * Math.log10(e / Math.max(1, b - a) + 1e-30)).toFixed(2); };
const finite = x => { for (let i = 0; i < x.length; i++) if (!Number.isFinite(x[i])) return false; return true; };
const peak = x => { let m = 0; for (let i = 0; i < x.length; i++) { const v = Math.abs(x[i]); if (v > m) m = v; } return +m.toFixed(4); };
{
  const WK = wkLoad(A, 'kf12'), W1 = wkLoad(fs.readFileSync(kf1f, 'utf8'), 'kf1'), W2 = wkLoad(fs.readFileSync(kf2f, 'utf8'), 'kf2'), WB = wkLoad(fs.readFileSync(basis, 'utf8'), 'basis');
  // Vokal „a“ als Cutoff (wie SYNQUENZER.kf2.vowelHz('a')): KF_NA = 69 + 12 log2(632.4555 / 440) − 36
  const vowA = 440 * Math.pow(2, (12 * Math.log2(632.4555 / 440) - 36) / 12);
  const KOMBI = {o1w: 4, o1lvl: .8, strDmp: .35, strHel: .6, strAnr: .3, o2w: 0, o2lvl: .3, ftype: 6, cutoff: vowA, res: .3, noise: .25, kfNc: 1, kfRm: .6};
  const chord = [[.01, 1.6, 48, .9], [.01, 1.6, 55, .7], [.01, 1.6, 64, .8], [.8, 1.6, 67, .8]];
  const k = wkRun(WK, KOMBI, chord, 2.2);
  const lv = rmsDb(k.L, .02, 1.6), pk = peak(k.L);
  ok('Node: Kombi-Klang (Saite + VOKAL a + Rauschen rosa + Ring 60 %) klingt: kein NaN/Inf, keine Subnormalen, Pegel plausibel (−45 … −6 dB RMS, Spitze < 1)', finite(k.L) && finite(k.R) && !k.sub && lv > -45 && lv < -6 && pk < 1, {rmsDb: lv, spitze: pk, sub: k.sub});
  const off = [['Ring 0', {kfRm: 0}], ['Rauschen weiß', {kfNc: 0}], ['Filter LP12 statt VOKAL', {ftype: 1}], ['Säge statt Saite', {o1w: 0}]].map(([n, o]) => [n, wkRun(WK, Object.assign({}, KOMBI, o), chord, 2.2).h !== k.h]);
  ok('Node: jede der vier Klang-Funktionen wirkt im Kombi-Klang mit (eine weg → anderer Klang)', off.every(x => x[1]), off);
  // KF12-Einhängung: Ring mit Saite = die Saite selbst × Osz 2 (klingt aus wie die Saite), nicht ein Sinus (bleibt stehen)
  const RS = {o1lvl: 0, o2w: 3, o2lvl: 0, kfRm: 1, strDmp: .6, strHel: .6, strAnr: 0};
  const sS = wkRun(WK, Object.assign({o1w: 4}, RS), [[.01, null, 57, .9]], 2), sN = wkRun(WK, Object.assign({o1w: 3}, RS), [[.01, null, 57, .9]], 2);
  const s2 = wkRun(WK, Object.assign({}, RS, {o1w: 3, o2w: 4}), [[.01, null, 57, .9]], 2);
  const ringStr = {saite1: [rmsDb(sS.L, .02, .2), rmsDb(sS.L, 1.6, 1.95)], sinus1: [rmsDb(sN.L, .02, .2), rmsDb(sN.L, 1.6, 1.95)], saite2: [rmsDb(s2.L, .02, .2), rmsDb(s2.L, 1.6, 1.95)]};
  ok('Node (KF12): Ring mit Saite auf Osz 1 bzw. Osz 2 (Anteil 0) klingt mit der Saite – laut beim Anzupfen, klingt ≥ 10 dB aus; mit Sinus bleibt der Ring stehen (±2 dB)',
    ringStr.saite1[0] > -50 && ringStr.saite1[0] - ringStr.saite1[1] >= 10 && ringStr.saite2[0] > -50 && ringStr.saite2[0] - ringStr.saite2[1] >= 10 && Math.abs(ringStr.sinus1[0] - ringStr.sinus1[1]) <= 2 && finite(sS.L) && finite(s2.L), ringStr);
  const sL = wkRun(WK, Object.assign({o1w: 4}, RS, {o1lvl: .5}), [[.01, null, 57, .9]], 1.2), sL0 = wkRun(WK, Object.assign({o1w: 4}, RS, {o1lvl: .5, kfRm: 0}), [[.01, null, 57, .9]], 1.2);
  ok('Node (KF12): Saite hörbar (Anteil 50 %) + Ring: Ring 0 → nur die Saite, Ring an → anders (die Saite wird nur einmal je Block gerechnet, der Ring liest sie)', sL.h !== sL0.h && finite(sL.L), {mitRing: rmsDb(sL.L, .02, 1), ohneRing: rmsDb(sL0.L, .02, 1)});
  // jedes Paket allein: im vereinten Worklet genau wie im eigenen (bit-gleich), alte Klänge wie die Basis
  const same = [
    ['alt: Säge + Puls + Rauschen + LP24', WB, {o1w: 0, o2w: 1, o2lvl: .6, noise: .2, cutoff: 1500, res: .3, ftype: 0, fenv: .4, aS: .8}],
    ['alt: Sync + Unison 3', WB, {o1w: 1, o2w: 0, o2sync: 1, o2lvl: .5, o1uni: 3, uniDet: .3, analog: .5, spread: .5}],
    ['KF1: Ring 70 % + Rauschen braun', W1, {o1w: 0, o2w: 2, o2lvl: .4, kfRm: .7, noise: .5, kfNc: 2, cutoff: 3000}],
    ['KF1: Ring + Sync', W1, {o1w: 1, o2w: 0, o2sync: 1, o2lvl: .5, kfRm: .5}],
    ['KF2: Saite hell (Unison 3)', W2, {o1w: 4, strDmp: .45, strHel: .85, o1uni: 3, uniDet: .2}],
    ['KF2: Säge + VOKAL i', W2, {o1w: 0, ftype: 6, cutoff: 632.4555, res: .4}],
    ['KF2: Saite auf Osz 2 mit Sync', W2, {o1w: 0, o2w: 4, o2sync: 1, o2lvl: .6, strDmp: .3}],
  ].map(([n, W, p]) => { const a = wkRun(W, p, chord, 1.8), b = wkRun(WK, p, chord, 1.8); return [n, a.h, b.h, a.h === b.h]; });
  ok('Node: alte Klänge wie die Basis, KF1-Klänge wie in KF1, KF2-Klänge wie in KF2 (bit-gleich, 7 Patches × 1,8 s)', same.every(x => x[3]), same);
}

/* =============== Teil 0b: Quelltext – jede neue Zeile gehört zu KF1, KF2 oder KF12; nichts doppelt; Listen gleich =============== */
{
  // jede Zeile, die nicht in der Basis steht, kommt wörtlich aus KF1 oder KF2 (dort von deren eigenem Test geprüft) oder gehört zu KF12
  // (Block KF12-WK oder Marke KF12); dazu die vereinten Zeilen (PVA, pv-layout, VA_R), die beide Marken tragen
  const Bs = fs.readFileSync(basis, 'utf8'), bl = new Set(Bs.split('\n')), l1 = new Set(fs.readFileSync(kf1f, 'utf8').split('\n')), l2 = new Set(fs.readFileSync(kf2f, 'utf8').split('\n'));
  let inb = false; const bad = [], kf12 = [];
  for (const l of A.split('\n')) {
    if (/KF12-WK-BEGIN/.test(l)) inb = true;
    if (!bl.has(l) && !l1.has(l) && !l2.has(l)) { if (inb || /KF12/.test(l) || (/KF1/.test(l) && /KF2/.test(l))) kf12.push(l.slice(0, 60)); else bad.push(l.slice(0, 120)); }
    if (/KF12-WK-END/.test(l)) inb = false;
  }
  const wk = (/<script type="text\/plain" id="sq-worklet-src">([\s\S]*?)<\/script>/.exec(A) || [])[1] || '';
  const pva = (/const PVA = '([^']*)'/.exec(wk) || [])[1].split(' '), pvl = JSON.parse((/\/\*PVL\{\*\/(\{.*?\})\/\*\}PVL\*\//.exec(A) || [])[1]);
  const pvaB = (/const PVA = '([^']*)'/.exec(Bs) || [])[1].split(' '), pva_a = +(/const PV_A = (\d+)/.exec(wk) || [])[1];
  const at = pvaB.indexOf('fmx.trans') + 1, want = pvaB.slice(0, at).concat(['kfNc', 'kfRm'], pvaB.slice(at), ['kfSh1', 'kfSh2', 'strDmp', 'strHel', 'strAnr']);
  const dup = pva.filter((x, i) => pva.indexOf(x) !== i);
  ok('Quelltext: jede neue Zeile gegenüber der Basis kommt wörtlich aus KF1 oder KF2 oder ist als KF12 markiert (vereinte Zeilen tragen KF1 und KF2)', !bad.length && kf12.length > 0 && kf12.length < 30, {fremd: bad.slice(0, 5), kf12Zeilen: kf12.length});
  ok('Plätze: Worklet-Liste PVA = pv-layout (PV_LAYOUT.A), keine doppelt; = Basis + kfNc kfRm nach fmx.trans (Stimmen-Plätze, PV_A 272) + Reihen kfSh1 kfSh2 strDmp strHel strAnr hinten',
    JSON.stringify(pva) === JSON.stringify(pvl.A) && !dup.length && JSON.stringify(pva) === JSON.stringify(want) && pva_a === 272 && pva.indexOf('kfRm') === 271 && pva.slice(-5).join(' ') === 'kfSh1 kfSh2 strDmp strHel strAnr', {n: pva.length, PV_A: pva_a, hinten: pva.slice(-5), doppelt: dup});
  const kf2HookOk = /kf2Osc\(v, k, t, dt, gl, gr, st, rec, wb\)/.test(wk) && /if \(kfR\) this\.kf1Ring\(v, D, st\);/.test(wk) && /this\.kf12Str\(v, c1, z\[9\], v\.inc\[c1\], A\)/.test(wk) && !/[^\x00-\x7f]/.test(wk);
  ok('Worklet: beide Erweiterungen eingehängt (KF1 Ring/Rauschen/S&H, KF2 Saite/VOKAL), KF12-Einhängung Ring × Saite, nur ASCII', kf2HookOk);
}

/* =============== Teil 1: im Browser (Offline-Render der App) =============== */
const TOOLS = `(() => {
  const T = {};
  T.hash = x => { let h = 2166136261 >>> 0; const u = new Uint8Array(x.buffer, x.byteOffset, x.byteLength); for (let i = 0; i < u.length; i++) { h ^= u[i]; h = Math.imul(h, 16777619) >>> 0; } return h.toString(16); };
  T.db = (x, a, b) => { a = a || 0; b = b || x.length; let e = 0; for (let i = a; i < b; i++) e += x[i] * x[i]; return +(10 * Math.log10(e / Math.max(1, b - a) + 1e-30)).toFixed(2); };
  T.fin = x => { for (let i = 0; i < x.length; i++) if (!Number.isFinite(x[i])) return false; return true; };
  T.pk = x => { let m = 0; for (let i = 0; i < x.length; i++) { const v = Math.abs(x[i]); if (v > m) m = v; } return +m.toFixed(4); };
  T.kombi = () => { const s = deep(SQStore.normalizeSound(factorySound('f-init-analog')));
    Object.assign(s.p, {o1w: 4, o1lvl: .8, strDmp: .35, strHel: .6, strAnr: .3, o2w: 0, o2lvl: .3, ftype: 6, cutoff: SYNQUENZER.kf2.vowelHz('a'), res: .3, noise: .25, kfNc: 1, kfRm: .6, analog: 0, spread: 0, aA: .002, aD: 1.5, aS: .7, aR: .4, level: .8});
    return SQStore.normalizeSound(s); };
  // Song-Render (Video-Ton-Weg: ganze Spur-Kette mit Körnung, Drive, Hall …) beider Kanäle
  T.song = async () => { if (window.__seed) window.__seed(); const r = await vvRenderAudio({range: {a: 0, b: S.song.bars, sel: false}}); const L = r.ch[0], R = r.ch[1];
    let h = 0x811c9dc5; for (const d of [L, R]) { const u = new Uint32Array(d.buffer, d.byteOffset, d.length); for (let i = 0; i < u.length; i++) { h ^= u[i]; h = Math.imul(h, 0x01000193) >>> 0; } }
    return {h: (h >>> 0).toString(16), n: L.length, db: T.db(L), pk: T.pk(L), fin: T.fin(L) && T.fin(R)}; };
  T.until = async (want, n) => { const rs = []; for (let k = 0; k < (n || 6); k++) { const r = await T.song(); rs.push(r); if (want ? r.h === want : rs.filter(x => x.h === r.h).length >= 2) break; } return rs; };
  return T;
})()`;
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const open = async (f, tag) => {
  const p = await b.newPage({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  p.on('pageerror', e => errs.push(tag + String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(tag + m.text()); });
  await p.addInitScript(`(() => { let s = 0x9E3779B9; window.__seed = () => { s = 0x9E3779B9; }; Math.random = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();`);
  await p.goto('file://' + f); await p.waitForTimeout(1500); return p;
};
const modal = rs => { const c = {}; for (const r of rs) c[r.h] = (c[r.h] || 0) + 1; return Object.entries(c).sort((x, y) => y[1] - x[1])[0]; };
{
  const pk = await open(file, 'kf12: ');
  const K = await pk.evaluate(async src => {
    const T = eval(src), o = {}, wait = ms => new Promise(r => setTimeout(r, ms));
    // 1 der Kombi-Klang allein durch das App-Worklet (mkRender): klingt, jede Funktion wirkt
    const ev = [[.01, 'on', 48, .9], [.01, 'on', 55, .7], [.01, 'on', 64, .8], [1.2, 'off', 48], [1.2, 'off', 55], [1.2, 'off', 64]];
    const s = T.kombi(); o.keys = {o1w: s.p.o1w, ftype: s.p.ftype, kfNc: s.p.kfNc, kfRm: s.p.kfRm, str: [s.p.strDmp, s.p.strHel, s.p.strAnr]};
    const R = await mkRender(s, ev, {sec: 1.8}); o.mk = {db: T.db(R.l), pk: T.pk(R.l), fin: T.fin(R.l) && T.fin(R.r), h: T.hash(R.l)};
    o.mkOff = [];
    for (const [n, x] of [['Ring 0', {kfRm: 0}], ['weiß', {kfNc: 0}], ['LP12', {ftype: 1}], ['Säge', {o1w: 0}]]) { const t = deep(s); Object.assign(t.p, x); o.mkOff.push([n, T.hash((await mkRender(t, ev, {sec: 1.8})).l) !== o.mk.h]); }
    // 2 als Projekt mit Körnung (Spur-Effekt): Song-Render der ganzen Kette
    SYNQUENZER.newProject(); await wait(200); setBpm(120);
    SYNQUENZER.setClip(0, 0, {len: 1, notes: [{t: .05, n: 48, d: 1.5, v: .9}, {t: .05, n: 55, d: 1.5, v: .7}, {t: 2, n: 60, d: 1.5, v: .8}, {t: 2, n: 67, d: 1.5, v: .7}]});
    SYNQUENZER.setSound(0, T.kombi());
    for (let t = 0; t < S.tracks.length; t++) { try { setTrackFx(t, 'rev', 0); setTrackFx(t, 'dly', 0); } catch (e) {} }
    setTrackFx(0, 'kfBits', 6); setTrackFx(0, 'kfRate', 1 / 4); setTrackFx(0, 'kfMix', 1);
    SYNQUENZER.songFromChain([{scene: 0, bars: 2}]); window.__seed(); ensureAudio(); await wait(1500);
    o.korn = SYNQUENZER.kf1.korn(0); o.song = await T.song();
    const fx = S.tracks[0].sound.fx; o.fx = [fx.kfBits, fx.kfRate, fx.kfMix];
    // 3 Speichern / Laden: Datei gleich, Klang gleich, Render gleich
    const ser1 = serializeProject(), snd1 = JSON.stringify(S.tracks[0].sound), rs1 = await T.until(null, 4);
    applyProject(normalizeProject(JSON.parse(ser1)), {ui: true}); window.__seed(); await wait(1200);
    const ser2 = serializeProject(), snd2 = JSON.stringify(S.tracks[0].sound), rs2 = await T.until(modal(rs1), 6);
    function modal(rs) { const c = {}; for (const r of rs) c[r.h] = (c[r.h] || 0) + 1; return Object.entries(c).sort((x, y) => y[1] - x[1])[0][0]; }
    o.load = {datei: ser1 === ser2, klang: snd1 === snd2, len: [ser1.length, ser2.length], vor: rs1.map(r => r.h), nach: rs2.map(r => r.h), treffer: rs2.some(r => r.h === modal(rs1))};
    if (ser1 !== ser2) { let i = 0; while (i < ser1.length && ser1[i] === ser2[i]) i++; o.load.ab = [ser1.slice(Math.max(0, i - 60), i + 60), ser2.slice(Math.max(0, i - 60), i + 60)]; }
    // 4 Körnung aus → anderer Render (sie wirkt in der Kette)
    setTrackFx(0, 'kfBits', 16); setTrackFx(0, 'kfRate', 1); await wait(300); o.ohneKorn = await T.song();
    return o;
  }, TOOLS);
  await pk.close();
  ok('Browser: Kombi-Klang durch das App-Worklet (mkRender, Akkord, Rohpegel des Kerns vor der Spur-Kette): kein NaN, Pegel plausibel (−45 … −6 dB RMS, Spitze < 1,25 – derselbe Akkord mit LP12 statt VOKAL 1,13, Werksklang „Saite hell“ 0,99); Werte gespeichert (Saite, VOKAL, rosa, Ring)', K.mk.fin && K.mk.db > -45 && K.mk.db < -6 && K.mk.pk < 1.25 && K.keys.o1w === 4 && K.keys.ftype === 6 && K.keys.kfNc === 1 && K.keys.kfRm === .6 && K.keys.str.every(x => typeof x === 'number'), {mk: K.mk, keys: K.keys});
  ok('Browser: jede Funktion wirkt im Kombi-Klang (Ring, Rauschfarbe, VOKAL, Saite: je eine weg → anderer Render)', K.mkOff.every(x => x[1]), K.mkOff);
  ok('Browser: Projekt mit Kombi-Klang + Körnung (6 Bit, 1/4) – Song-Render der ganzen Spur-Kette: kein NaN, Pegel plausibel; Körnung-Knoten da; Körnung aus → anderer Render',
    K.song.fin && K.song.db > -50 && K.song.db < -3 && K.song.pk <= 1.001 && K.korn && K.korn.node && JSON.stringify(K.fx) === '[6,0.25,1]' && K.ohneKorn.fin && K.ohneKorn.h !== K.song.h, {song: K.song, ohneKorn: K.ohneKorn, fx: K.fx, korn: K.korn});
  ok('Browser: Speichern/Laden bit-gleich (Datei gleich, Klang gleich, Song-Render nach dem Laden = Hash davor)', K.load.datei && K.load.klang && K.load.treffer, K.load);
}
{
  // 5 altes Projekt: in der Basis (4.51.0) gebaut und gespeichert, in KF12 geladen – Render bit-gleich
  const SETUP = async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    SYNQUENZER.newProject(); await wait(200); setBpm(118);
    SYNQUENZER.setClip(0, 0, {len: 1, notes: [{t: .05, n: 36, d: 1.9, v: .9}, {t: 2, n: 43, d: 1.9, v: .7}]});
    const s0 = deep(S.tracks[0].sound); Object.assign(s0.p, {noise: .2, o2w: 1, o2lvl: .5, ftype: 0, cutoff: 1800, res: .35, fenv: .3}); SYNQUENZER.setSound(0, s0);
    for (let t = 0; t < S.tracks.length; t++) { try { setTrackFx(t, 'rev', 0); setTrackFx(t, 'dly', 0); } catch (e) {} }
    SYNQUENZER.songFromChain([{scene: 0, bars: 2}]); window.__seed(); ensureAudio(); await wait(1500);
  };
  const pb = await open(basis, 'basis: ');
  const BA = await pb.evaluate(async ([src, s1]) => { const T = eval(src), SETUP = eval('(' + s1 + ')'); await SETUP(); const proj = serializeProject(); const rs = await T.until(null, 6);
    SYNQUENZER.loadDemo(); await new Promise(r => setTimeout(r, 500)); ensureAudio(); await new Promise(r => setTimeout(r, 600));
    if (!S.song || !S.song.bars) { const ch = []; for (let s = 0; s < Math.min(2, NS()); s++) ch.push({scene: s, bars: 2}); SYNQUENZER.songFromChain(ch); await new Promise(r => setTimeout(r, 200)); }
    const demo = serializeProject(), ds = await T.until(null, 4);
    return {proj, rs, demo, ds}; }, [TOOLS, SETUP.toString()]);
  await pb.close();
  const want = modal(BA.rs)[0], wantD = modal(BA.ds)[0];
  const pk = await open(file, 'kf12: ');
  const KA = await pk.evaluate(async ([src, proj, want, demo, wantD]) => {
    const T = eval(src), wait = ms => new Promise(r => setTimeout(r, ms)), o = {};
    applyProject(normalizeProject(JSON.parse(proj)), {ui: true}); window.__seed(); ensureAudio(); await wait(1500);
    const P = S.tracks[0].sound.p, P0 = JSON.parse(proj).tracks[0].sound.p; o.neutral = [P.kfNc, P.kfRm, P.kfSh1, P.kfSh2].map(v => v === undefined ? 'fehlt' : v).concat(['strDmp' in P, P.o1w === P0.o1w && P.o2w === P0.o2w && P.ftype === P0.ftype && P.noise === P0.noise]);
    o.rs = await T.until(want, 6);
    // die gespeicherte Form: wie die Basis (Prüfung, Regel 28: KF1 legt keine neutralen Werte mehr an, KF2 keine Saiten-Werte); strip zählt nur noch nach
    const a = JSON.parse(proj), c = JSON.parse(serializeProject()), strip = x => { for (const t of x.tracks || []) { const p = t.sound && t.sound.p; if (p) for (const k of ['kfNc', 'kfRm', 'kfSh1', 'kfSh2']) if (p[k] === 0) delete p[k]; } return x; };
    const ign = k => ['saved', 'savedAt', 'ts', 'modified', 'version', 'appVersion'].includes(k), cmp = (x, y, pth, out) => { if (out.length > 4) return; if (typeof x !== typeof y || Array.isArray(x) !== Array.isArray(y)) { out.push(pth); return; } if (x && typeof x === 'object') { for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) if (!ign(k)) cmp(x[k], y[k], pth + '.' + k, out); } else if (x !== y) out.push(pth + ' ' + JSON.stringify(x) + ' ≠ ' + JSON.stringify(y)); };
    o.diff = []; cmp(a, c, '', o.diff); o.diff0 = []; cmp(a, strip(JSON.parse(JSON.stringify(c))), '', o.diff0);
    o.kfKeys = (c.tracks || []).filter(t => t.sound && t.sound.p && 'kfNc' in t.sound.p).length;
    applyProject(normalizeProject(JSON.parse(demo)), {ui: true}); window.__seed(); await wait(1200); o.ds = await T.until(wantD, 4);
    return o;
  }, [TOOLS, BA.proj, want, BA.demo, wantD]);
  await pk.close();
  ok('Altes 4.51-Projekt (VA-Spur: Säge + Puls + Rauschen + LP24) lädt neutral (Rauschfarbe weiß, Ring 0, S&H Tonart aus = Schlüssel fehlt, keine Saiten-Werte, Welle/Filter wie gespeichert)', JSON.stringify(KA.neutral) === '["fehlt","fehlt","fehlt","fehlt",false,true]', {werte: KA.neutral});
  ok('Altes 4.51-Projekt: Song-Render bit-gleich zur Basis (Hash der Basis = der zweimal gekommene; KF12 trifft ihn)', modal(BA.rs)[1] >= 2 && KA.rs.some(r => r.h === want), {basis: BA.rs.map(r => r.h), kf12: KA.rs.map(r => r.h)});
  ok('Altes 4.51-Projekt neu gespeichert: gleich der Basis, ohne Abzug (Regel 28: keine Spur trägt KF1-Werte)', KA.diff.length === 0 && KA.diff0.length === 0 && KA.kfKeys === 0, {abweichend: KA.diff, spurenMitKf1Werten: KA.kfKeys});
  const dOk = KA.ds.some(r => r.h === wantD), dB = modal(BA.ds);
  ok('Demo-Song (alle Spuren) aus der Basis: Render in KF12 bit-gleich (oder, wenn die Basis selbst nicht gleich rendert: RMS ±0,05 dB)', dOk || (dB[1] < 2 && Math.abs(KA.ds[0].db - BA.ds[0].db) <= .05), {basis: BA.ds.map(r => [r.h, r.db]), kf12: KA.ds.map(r => [r.h, r.db])});
}
{
  // 6 gespeicherte Form + Worklet-Nachricht aller alten Werksklänge: byte-gleich zur Basis (Regel 28, wie kf2-test; Prüfung Befund 1: KF1 legt
  // die vier neutralen Werte nicht mehr an)
  const FORM = async (f, tag) => { const p = await open(f, tag); const r = await p.evaluate(() => { const out = {};
    for (const fd of FACTORY) { if (/^f-kf2-/.test(fd.id)) continue; let s; try { s = factorySound(fd.id); } catch (e) { continue; } if (!s || s.kind === 'drum' || s.engine === 'drum') continue;
      const n = SQStore.normalizeSound(s); out[fd.id] = {j: JSON.stringify(n), w: JSON.stringify(wkFlat(n))}; }
    return {out, kf2: FACTORY.filter(x => /^f-kf2-/.test(x.id)).map(x => x.id)}; }); await p.close(); return r; };
  const FB = await FORM(basis, 'basis: '), FK = await FORM(file, 'kf12: ');
  const KF1K = ['kfNc', 'kfRm', 'kfSh1', 'kfSh2'], strip = (js, flat) => { const o = JSON.parse(js), q = flat ? o : o.p; if (q) for (const k of KF1K) if (q[k] === 0) delete q[k]; return JSON.stringify(o); };
  const ids = Object.keys(FB.out), dj = [], dw = [], raw = [];
  for (const id of ids) { const a = FB.out[id], c = FK.out[id]; if (!c) { dj.push(id + ' fehlt'); continue; } if (a.j !== strip(c.j, false)) raw.push(id); if (a.j !== c.j) dj.push(id); if (a.w !== c.w) dw.push(id); }
  ok('Alte Werksklänge (' + ids.length + '): gespeicherte Form (normalizeSound) und Worklet-Nachricht (wkFlat) byte-gleich zur Basis (Regel 28); die drei Saiten-Klänge von KF2 sind da',
    ids.length > 50 && !dj.length && !dw.length && !raw.length && FK.kf2.length === 3, {form: dj.slice(0, 5), nachricht: dw.slice(0, 5), auchMitAbzugVerschieden: raw.length, kf2Klaenge: FK.kf2});
}
{
  // 7 Bedienung: der Kombi-Klang im Klang-Editor – alle neuen Bedienteile beider Pakete zugleich, hochkant / quer / quer 370:
  // in der Seite, ✕ sichtbar, kein waagerechtes Rollen, nichts überlappt, Regler/Fader ≥ 44 px; Fotos
  const fotos = path.join(dir, 'fotos'); fs.mkdirSync(fotos, {recursive: true});
  const LAY = [];
  for (const [w, h, nm] of [[428, 926, 'hochkant'], [926, 428, 'quer'], [926, 370, 'quer370']]) {
    const p = await open(file, nm + ': '); await p.setViewportSize({width: w, height: h}); await p.reload(); await p.waitForTimeout(1500);
    await p.evaluate(async () => { const ms = t => new Promise(r => setTimeout(r, t)); SYNQUENZER.newProject({init: true}); await ms(300); selectTrack(0); loadPreset(0, 'f-init-analog');
      for (const [k, v] of [['o1w', 4], ['ftype', 6], ['noise', .25], ['kfNc', 1], ['kfRm', .6], ['o2lvl', .3]]) setP(0, k, v); setP(0, 'cutoff', SYNQUENZER.kf2.vowelHz('a')); });
    // sel = die neuen Bedienteile (Größe ≥ 44 px, in der Seite), all = alle Regler/Fader der Seite (keine Überlappung)
    for (const [tab, sub, sel, all] of [['osc', 'o1', '.kf2s .knob', '.pg:not([hidden]) .knob, .pg:not([hidden]) .seg.wv'], ['osc', 'mix', '.fader[data-key="kfRm"], .knob[data-key="kfNc"]', '.faders .fader, .mixk .knob'],
      ['filter', 'ctl', '.knob[data-key="cutoff"], .knob[data-key="kf1vc"]', '.pg:not([hidden]) .knob'], ['fx', 'korn', '.pg.kf1korn [data-key^="fx.kf"]', '.pg.kf1korn [data-key^="fx.kf"], .pg.kf1korn .seg.chm']]) {
      const r = await p.evaluate(async ([tab, sub, sel, all]) => { ED.tab = tab; ED.sub[tab] = sub; SYNQUENZER.openEditor(); safeRebuild(buildSynthEd); await new Promise(r => setTimeout(r, 400));
        const pg = EL.synthSheet.querySelector('.pg:not([hidden])') || EL.synthSheet, pr = pg.getBoundingClientRect(), x = EL.synthSheet.querySelector('.sh-x'), xr = x && x.getBoundingClientRect();
        const vis = q => [...EL.synthSheet.querySelectorAll(q)].filter(e => e.offsetParent !== null), els = vis(sel), R = els.map(e => e.getBoundingClientRect()), E2 = vis(all), R2 = E2.map(e => e.getBoundingClientRect());
        const inV = R.every(q => q.width > 0 && q.right <= innerWidth + 1 && q.bottom <= innerHeight + 1 && q.left >= -1), big = R.every(q => q.width >= 44 && q.height >= 44);
        let ov = 0; for (let i = 0; i < R2.length; i++) for (let j = i + 1; j < R2.length; j++) { const a = R2[i], c = R2[j]; if (E2[i].contains(E2[j]) || E2[j].contains(E2[i])) continue; const ix = Math.min(a.right, c.right) - Math.max(a.left, c.left), iy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top); if (ix > 2 && iy > 2) ov++; }
        const cut = EL.synthSheet.querySelector('.knob[data-key="cutoff"]');
        return {n: els.length, inV, big, ov, x: !!xr && xr.width >= 36 && xr.right <= innerWidth + 1 && xr.top >= 0 && xr.bottom <= innerHeight, scroll: document.documentElement.scrollWidth > innerWidth + 1,
          saite: tab === 'osc' && sub === 'o1' ? !!EL.synthSheet.querySelector('.kf2s:not([hidden])') : null, vokal: tab === 'filter' && cut ? cut.textContent.replace(/\s+/g, ' ').trim().slice(0, 40) : null,
          min: R.length ? Math.round(Math.min(...R.map(q => Math.min(q.width, q.height)))) : 0}; }, [tab, sub, sel, all]);
      await p.screenshot({path: path.join(fotos, 'kf12-' + nm + '-' + tab + '-' + sub + '.png')});
      LAY.push([nm, tab + '/' + sub, r]);
    }
    await p.close();
  }
  const bad = LAY.filter(([, , r]) => !(r.n > 0 && r.inV && r.big && !r.ov && r.x && !r.scroll && r.saite !== false && (r.vokal == null || /Vokal/.test(r.vokal))));
  ok('Bedienung mit dem Kombi-Klang (hochkant 428 × 926, quer 926 × 428 und 926 × 370): Zeile SAITE, Ring-Fader, Rausch-Farbe, Regler „Vokal“ + „Anschl. ±“, Körnung – in der Seite, ✕ sichtbar, nichts überlappt, ≥ 44 px, kein waagerechtes Rollen',
    !bad.length, bad.length ? bad : LAY.map(([a, t, r]) => [a, t, r.n, r.min, r.vokal || '']));
}
{
  // 8 Prüfung Befund 1 (Regel 28): KF1-Werte nur gespeichert, wenn ≠ 0; fehlend = neutral an jeder Stelle, die sie liest oder schickt
  const p = await open(file, 'kf12-r28: ');
  const R = await p.evaluate(async () => {
    const ms = t => new Promise(r => setTimeout(r, t)), o = {}, K = ['kfNc', 'kfRm', 'kfSh1', 'kfSh2'];
    const wP = i => new Promise(res => { const E = AU.synth[i]; E.flush(); E.n8qCb = q => res(K.map(k => q.P[k])); E.node.port.postMessage({n8q: 1}); setTimeout(() => res('timeout'), 1500); });
    SYNQUENZER.newProject(); await ms(300); ensureAudio(); await ms(1200); selectTrack(0);
    const P = () => S.tracks[0].sound.p, has = () => K.filter(k => k in P());
    loadPreset(0, 'f-moog-bass'); await ms(200);
    o.alt = {keys: has(), liest: K.map(k => sndGet(S.tracks[0].sound, k)), wk: await wP(0)};
    // Werksklang laden nach Ring/Rauschfarbe: der Worklet geht auf neutral (die Nachricht des alten Klangs trägt die Schlüssel nicht)
    setP(0, 'kfRm', .6); setP(0, 'kfNc', 2); await ms(150); o.an = await wP(0);
    loadPreset(0, 'f-sub-bass'); await ms(250); o.laden = {keys: has(), wk: await wP(0)};
    // Undo / Redo vom neutralen Klang aus
    UNDO.length = 0; REDO.length = 0; { const u = soundUndo(0), b0 = u.snap(); setP(0, 'kfRm', .7); u.commit(b0, 'Ring'); }
    await ms(150); undo(); await ms(250); o.undo = {keys: has(), wk: await wP(0)}; redo(); await ms(250); o.redo = {rm: P().kfRm, wk: await wP(0)};
    // eine Geste hin und zurück auf 0: kein ↶-Schritt, Schlüssel weg, Worklet 0
    loadPreset(0, 'f-moog-bass'); await ms(200); UNDO.length = 0; REDO.length = 0;
    { const u = soundUndo(0), b0 = u.snap(); setP(0, 'kfRm', .5); setP(0, 'kfRm', 0); o.zurueck = {schritt: u.commit(b0, 'Ring'), undo: UNDO.length, keys: has()}; }
    await ms(150); o.zurueck.wk = await wP(0);
    // per Regler gesetzt = dieselbe Form (auch Reihenfolge) wie nach dem Laden; Speichern → Laden → Speichern Zeichen für Zeichen gleich (Saite: str… hinten, FM: fm6 hinten)
    const form = () => { const s = S.tracks[0].sound, n = SQStore.normalizeSound(JSON.parse(JSON.stringify(s))); return JSON.stringify(s) === JSON.stringify(n); };
    o.form = [];
    for (const id of ['f-kf2-saite-hell', (FACTORY.find(x => x.engine === 'fm6') || {}).id, 'f-moog-bass']) {
      loadPreset(0, id); await ms(150); for (const [k, v] of [['kfSh2', 1], ['kfRm', .4], ['kfNc', 3], ['kfSh1', 1]]) setP(0, k, v);
      const a = form(); setP(0, 'kfNc', 0); const c = form(); const s1 = serializeProject(); applyProject(normalizeProject(JSON.parse(s1)), {ui: true}); await ms(300);
      o.form.push([id, a, c, s1 === serializeProject(), has().join(' ')]);
    }
    // Klangzustand auf neutralem Grundklang: aufnehmen (v6aDiff), anwenden (v6aApply), Morph-Ziel (v6aGet); Abweichung „Ring 0“ auf Ring 0,5
    loadPreset(0, 'f-moog-bass'); await ms(150);
    const B = S.tracks[0].sound, W = JSON.parse(JSON.stringify(B)); W.p.kfRm = .8; W.p.kfNc = 1;
    const B2 = JSON.parse(JSON.stringify(B)); B2.p.kfRm = .5; const W2 = JSON.parse(JSON.stringify(B2)); delete W2.p.kfRm;
    o.zust = {diff: (v6aDiff(B, W) || {}).p, apply: (x => [x.p.kfRm, x.p.kfNc])(v6aApply(B, {p: {kfRm: .8, kfNc: 1}})), get: v6aGet(B, 'kfRm'), diff0: (v6aDiff(B2, W2) || {}).p};
    // Zustand live (v6aGo): Ring gleitet auf 0,8 und zurück auf neutral (Grundklang ohne Schlüssel)
    { const c = AU.ctx, t = c.currentTime; v6aGo(0, {p: {kfRm: .8}}, t, t + .05, t, 1); await ms(400); o.zust.go = [(await wP(0))[1]];
      const t2 = c.currentTime; v6aGo(0, null, t2, t2 + .05, t2, 1); await ms(400); o.zust.go.push((await wP(0))[1]); }
    // ein Zustand „Ring 0“ auf Ring 0,5 bleibt nach Speichern/Laden (clip.st ist kein Klang: 0 wird dort gespeichert)
    setP(0, 'kfRm', .5); SYNQUENZER.setClip(0, 0, {len: 1, notes: [{t: 0, n: 48, d: .5, v: .8}]}); S.tracks[0].clips[0].st = {p: {kfRm: 0}};
    { const s1 = serializeProject(); applyProject(normalizeProject(JSON.parse(s1)), {ui: true}); await ms(300); const c0 = S.tracks[0].clips[0]; o.zust.gespeichert = [S.tracks[0].sound.p.kfRm, c0 && c0.st && c0.st.p ? c0.st.p.kfRm : 'fehlt']; }
    // Lernen (Super-Regler) kennt die vier Werte auch ohne Schlüssel; „Was ist anders?“ zeigt keinen Punkt
    loadPreset(0, 'f-moog-bass'); await ms(150);
    o.lernen = srKeysOf(S.tracks[0]).filter(k => K.includes(k)); o.wia = K.filter(k => wiaDiffers(S.tracks[0].sound, k));
    return o;
  });
  await p.close();
  const z4 = '[0,0,0,0]', J = x => JSON.stringify(x);
  ok('Regel 28: alter Werksklang ohne KF1-Schlüssel, liest sich neutral (0), Worklet 0', !R.alt.keys.length && J(R.alt.liest) === z4 && J(R.alt.wk) === z4, R.alt);
  ok('Regel 28: Ring 60 % + Rauschfarbe braun, dann Werksklang geladen → Worklet wieder neutral (ein ganzer Klang ohne KF1-Schlüssel = 0)', J(R.an) === '[2,0.6,0,0]' && !R.laden.keys.length && J(R.laden.wk) === z4, {an: R.an, laden: R.laden});
  ok('Regel 28: Ring vom neutralen Klang aus, ↶ = Schlüssel weg und Worklet 0, ↷ = Ring 70 % wieder (auch im Worklet)', !R.undo.keys.length && J(R.undo.wk) === z4 && R.redo.rm === .7 && J(R.redo.wk) === '[0,0.7,0,0]', {undo: R.undo, redo: R.redo});
  ok('Regel 28: Ring in einer Geste hoch und zurück auf 0 = kein ↶-Schritt, kein Schlüssel, Worklet 0', R.zurueck.schritt === false && R.zurueck.undo === 0 && !R.zurueck.keys.length && J(R.zurueck.wk) === z4, R.zurueck);
  ok('Regel 28: per Regler gesetzte KF1-Werte haben die Form wie nach dem Laden (auch Reihenfolge: Saite, FM, VA); zurück auf 0 = Schlüssel weg; Speichern → Laden → Speichern Zeichen für Zeichen gleich', R.form.length === 3 && R.form.every(r => r[0] && r[1] && r[2] && r[3] && r[4] === 'kfRm kfSh1 kfSh2'), R.form);
  ok('Regel 28: Klangzustand auf neutralem Grundklang – aufgenommen, angewendet, Morph-Ziel 0; „Ring 0“ als Abweichung von 0,5; live gleitet Ring auf 0,8 und zurück auf 0; der Zustand „Ring 0“ bleibt nach Speichern/Laden',
    J(R.zust.diff) === '{"kfNc":1,"kfRm":0.8}' && J(R.zust.apply) === '[0.8,1]' && R.zust.get === 0 && J(R.zust.diff0) === '{"kfRm":0}' && Math.abs(R.zust.go[0] - .8) < 1e-6 && R.zust.go[1] === 0 && J(R.zust.gespeichert) === '[0.5,0]', R.zust);
  ok('Regel 28: Lernen (Super-Regler) kennt die vier KF1-Werte auch ohne Schlüssel; „Was ist anders?“ ohne Punkt', J(R.lernen) === J(['kfNc', 'kfRm', 'kfSh1', 'kfSh2']) && !R.wia.length, {lernen: R.lernen, wia: R.wia});
}
await b.close();
ok('Keine Konsolen- oder Seitenfehler', !errs.length, errs.slice(0, 5));
const n = res.filter(r => r.pass).length;
console.log((n === res.length ? 'OK' : 'FEHLER') + ' KOMBI: ' + n + '/' + res.length + ' bestanden');
fs.writeFileSync(path.join(dir, 'kombi-ergebnis.json'), JSON.stringify(res, null, 1));
process.exit(n === res.length ? 0 : 1);
