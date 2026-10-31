// BM6-02 (Daten-Teil), BM6-03, BM6-08, BM6-09: Engine-Wechsel hin/zurück, normBm, Speichern/Laden, Kopien, ältere Version, Bibliothek.
// Aufruf: node bm6-store.mjs [neu.html] [alt.html]
import {createRequire} from 'module';
const {chromium} = createRequire(import.meta.url)('playwright');
const NEW = process.argv[2] || new URL('../index.html', import.meta.url).pathname;
const OLD = process.argv[3] || '/home/user/Synquenzer/bau/werkzeug/vs-base-B.html';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await b.newContext({viewport: {width: 390, height: 844}});
const checks = {}; const ok = (k, v, info) => { checks[k] = info === undefined ? !!v : {ok: !!v, ...info}; };
const errs = [];
async function open(file, c) {
  const p = await (c || ctx).newPage(); p.on('pageerror', e => errs.push(file.slice(-12) + ': ' + e)); p.on('console', m => { if (m.type() === 'error') errs.push(file.slice(-12) + ': ' + m.text()); });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 30000}); await p.waitForTimeout(500); return p;
}
const A = await open(NEW);

// BM6-03 normBm: 1000 Zufalls-Programme
const n = await A.evaluate(() => {
  let s = 12345; const R = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
  const junk = () => { const r = R(); return r < .2 ? (R() - .5) * 1e4 : r < .35 ? String(Math.round((R() - .5) * 600)) : r < .45 ? null : r < .55 ? 'quatsch' : r < .6 ? {x: 1} : r < .65 ? NaN : Math.round((R() - .2) * 300); };
  const L = SQBM.L, bad = [], I = SQBM.init();
  const rnd = o => { const x = {}; for (const k in o) { if (o[k] && typeof o[k] === 'object') x[k] = R() < .05 ? 'kaputt' : rnd(o[k]); else x[k] = typeof o[k] === 'string' ? (R() < .5 ? junk() : Object.values(L).flat()[Math.floor(R() * 200)]) : junk(); } if (R() < .3) x['neu' + Math.floor(R() * 9)] = {z: R()}; return x; };
  let unk = 0, unkKept = 0, idem = 0;
  const walk = (o, path, chk) => { for (const k in o) { const p = path ? path + '.' + k : k; if (o[k] && typeof o[k] === 'object' && !Array.isArray(o[k])) walk(o[k], p, chk); else chk(p, o[k]); } };
  for (let k = 0; k < 1000; k++) {
    const raw = {v: junk(), ly: rnd(I.ly), a: rnd(I.a), b: R() < .5 ? rnd(I.a) : null}; if (R() < .3) raw.zukunft = {f: [1, 2]};
    const o = SQBM.normBm(raw);
    walk(o, '', (p, v) => { const r = SQBM.range(p); if (!r) return; if (typeof r[0] === 'string' ? !r.includes(v) : !(Number.isInteger(v) && v >= r[0] && v <= r[1])) bad.push(p + '=' + v); });
    // fehlende Schlüssel = INIT, Reihenfolge fest
    if (JSON.stringify(Object.keys(o.a).slice(0, Object.keys(I.a).length)) !== JSON.stringify(Object.keys(I.a))) bad.push('order a');
    // unbekannte Schlüssel bleiben
    const chkU = (x, y, p) => { if (!x || typeof x !== 'object' || Array.isArray(x)) return; for (const kk in x) { if (/^neu\d$|^zukunft$/.test(kk)) { unk++; if (JSON.stringify(y && y[kk]) === JSON.stringify(x[kk])) unkKept++; } else if (x[kk] && typeof x[kk] === 'object') chkU(x[kk], y && y[kk], p + '.' + kk); } };
    chkU(raw, o, '');
    if (JSON.stringify(SQBM.normBm(JSON.parse(JSON.stringify(o)))) === JSON.stringify(o)) idem++;
  }
  return {bad: bad.slice(0, 10), nbad: bad.length, unk, unkKept, idem};
});
ok('BM6-03_normBm_1000', n.nbad === 0 && n.unk > 100 && n.unk === n.unkKept && n.idem === 1000, n);

// BM6-02 Daten: VA -> Bit Mask -> VA, je ein Undo, VA-Felder deep-equal, p.bm gemerkt; unberührtes INIT wird aufgeräumt
const sw = await A.evaluate(() => {
  const Q = SYNQUENZER, t = synthTracks()[0], out = {};
  const va0 = JSON.stringify(sndOf(t)), u0 = UNDO.length;
  soundEdit(t, 'Klangerzeugung', () => setEngine(t, 'bm'));
  out.u1 = UNDO.length - u0; out.eng1 = sndOf(t).engine; out.init = JSON.stringify(sndOf(t).p.bm) === JSON.stringify(SQBM.init());
  soundEdit(t, 'Klangerzeugung', () => setEngine(t, 'analog'));
  out.u2 = UNDO.length - u0; out.cleanBack = JSON.stringify(sndOf(t)) === va0 && !('bm' in sndOf(t).p);
  // mit Änderung: Maske 078 merken
  soundEdit(t, 'Klangerzeugung', () => setEngine(t, 'bm')); Q.bmSet(t, 'a.o1.m', 78); Q.bmSet(t, 'ly.md', 'sch'); Q.bmSet(t, 'b.o2.e.l', 55);
  const bm1 = JSON.stringify(sndOf(t).p.bm), uA = UNDO.length;
  soundEdit(t, 'Klangerzeugung', () => setEngine(t, 'analog'));
  out.uBack = UNDO.length - uA;
  const s2 = deep(sndOf(t)); delete s2.p.bm; const v0 = JSON.parse(va0);
  out.vaFields = JSON.stringify(s2.p) === JSON.stringify(v0.p) && JSON.stringify(s2.mods) === JSON.stringify(v0.mods) && JSON.stringify(s2.fx) === JSON.stringify(v0.fx);
  out.kept = JSON.stringify(sndOf(t).p.bm) === bm1;
  soundEdit(t, 'Klangerzeugung', () => setEngine(t, 'bm')); out.back = JSON.stringify(sndOf(t).p.bm) === bm1;
  Q.undo(); out.undoVA = sndOf(t).engine === 'analog'; Q.redo(); out.redoBM = sndOf(t).engine === 'bm' && JSON.stringify(sndOf(t).p.bm) === bm1;
  out.bmSetUndo = (() => { const b0 = JSON.stringify(sndOf(t).p.bm), u = UNDO.length; Q.bmSet(t, 'a.f.cu', 40); const one = UNDO.length - u === 1; Q.undo(); return one && JSON.stringify(sndOf(t).p.bm) === b0; })();
  return out;
});
ok('BM6-02_engine_switch_data', sw.u1 === 1 && sw.u2 === 2 && sw.eng1 === 'bm' && sw.init && sw.cleanBack && sw.uBack === 1 && sw.vaFields && sw.kept && sw.back && sw.undoVA && sw.redoBM && sw.bmSetUndo, sw);

// BM6-03 Speichern -> Laden, Kopien
const st = await A.evaluate(async () => {
  const Q = SYNQUENZER, t = synthTracks()[0], t2 = synthTracks()[1], out = {};
  for (const [p, v] of [['a.o1.m', 200], ['a.o2.ds', -40], ['a.l1.ds', 'o1m'], ['a.l1.am', 33], ['a.mo.vd', 'peg'], ['a.mo.va', -20], ['a.fx.t2', 'DL7'], ['a.ar.t', 'pon2'], ['a.g.tm', 'arab'], ['ly.sp', 48], ['b.f.md', 'notch']]) Q.bmSet(t, p, v);
  const snd = deep(sndOf(t)); snd.p.bm.zukunft = {x: 1};   // unbekannter Schlüssel
  applySound(t, SQStore.normalizeSound(snd));
  const ref = JSON.stringify(sndOf(t).p.bm); out.unknownInSound = /zukunft/.test(ref);
  const f = JSON.stringify(projectFileObj(S, true, false)), r = parseAny(f);
  out.fileRT = r.ok && JSON.stringify(r.project.tracks[t].sound.p.bm) === ref;
  out.projRT = (() => { switchProject(JSON.parse(JSON.stringify(r.project)), {}); return JSON.stringify(sndOf(t).p.bm) === ref; })();
  // Kopie auf andere Spur (setSound mit getSound)
  Q.setSound(t2, Q.getSound(t)); out.copyTrack = JSON.stringify(sndOf(t2).p.bm) === ref && sndOf(t2).engine === 'bm';
  // Bibliothek: sichern, Duplikat, laden
  const s = await Q.saveSound(t, 'BM Test', 'new'); out.libSaved = JSON.stringify(LIB.lib.get(s.id).p.bm) === ref;
  const d = await LIB.lib.duplicate(s.id); libChanged(); out.libDup = JSON.stringify(LIB.lib.get(d.id).p.bm) === ref;
  Q.loadPreset(t2, d.id); out.libLoad = JSON.stringify(sndOf(t2).p.bm) === ref;
  // Klang-Datei (Export) -> Import
  const sf = SQStore.buildSoundsFile ? JSON.stringify(SQStore.buildSoundsFile([LIB.lib.get(s.id)])) : null;
  if (sf) { const rr = parseAny(sf); out.soundFile = rr.ok && rr.kind === 'sounds' && JSON.stringify(rr.sounds[0].p.bm) === ref; } else out.soundFile = 'n/a';
  out.ownId = s.id; out.file = f; out.ref = ref;
  return out;
});
ok('BM6-03_save_load_copy', st.unknownInSound && st.fileRT && st.projRT && st.copyTrack && st.libSaved && st.libDup && st.libLoad && st.soundFile !== false, Object.fromEntries(Object.entries(st).filter(([k]) => !['file', 'ref'].includes(k))));

// BM6-09 Bibliothek: Engine-Chip, Kategorien, Werk schreibgeschützt; Neuladen behält eigene Klänge
const lib = await A.evaluate(async id => {
  const t = synthTracks()[0], out = {};
  SYNQUENZER.openBrowser(t); await new Promise(r => setTimeout(r, 300));
  out.engChip = !!document.querySelector('.brse') && document.querySelector('.brse').textContent.includes(BM_NAME);
  out.rows = brList(t, {all: false, eng: null, role: 'alle'}).map(r => r.name);
  out.roles = brRoles(t, {all: false, eng: 'bm'}).map(r => r[1]);
  // Kategorie-Chips erscheinen mit Werks-Klängen dieser Rolle (BM7 liefert sie): Probe mit einer Werks-Zeile je Rolle
  const fake = BM_ROLES.slice(0, 8).map(([r]) => ({id: 'f-bmtest-' + r, name: 'Test ' + r, cat: 'eigene', role: r, engine: 'bm', ev: 1, p: {bm: SQBM.init()}, mods: [], fx: {}}));
  SYNTH_LIB.push(...fake); out.rolesWith = brRoles(t, {all: false, eng: 'bm'}).map(r => r[1]); SYNTH_LIB.splice(SYNTH_LIB.length - fake.length, fake.length);
  out.allEngines = brPool(t, {all: true}).fac.some(f => f.engine === 'bm');
  out.delFactory = await deleteSound('f-init-bm').then(r => r, e => 'err');
  out.factoryStill = !!factorySound('f-init-bm');
  out.ownThere = !!LIB.lib.get(id);
  closeBrowser(false);
  return out;
}, st.ownId);
const A2 = await open(NEW);   // gleiche Ablage (Kontext) = Neuladen
const kept = await A2.evaluate(async ([id, ref]) => { await libReady(); const r = LIB.lib.get(id); return !!r && JSON.stringify(r.p.bm) === ref; }, [st.ownId, st.ref]);
ok('BM6-09_library', lib.engChip && lib.rows.some(x => /INIT Bit Mask/.test(x)) && lib.roles.join() === 'Alle Bit Mask,Init,Eigene' &&
  lib.rolesWith.join() === 'Alle Bit Mask,Bass,Lead,Pad,Keys,Blech/Streicher,Pluck/Glocke,Orgel/Chor,FX/Arp,Init,Eigene' && lib.allEngines && lib.delFactory !== true && lib.factoryStill && lib.ownThere && kept, {...lib, keptAfterReload: kept});

// BM6-08 ältere Version (4.23.0) öffnet das Bit-Mask-Projekt: gesperrt, Klang unverändert, zurück deep-equal
const ctxO = await b.newContext({viewport: {width: 390, height: 844}});
const O = await open(OLD, ctxO);
// VERSION bleibt in diesem Zweig 4.23.0; die Veröffentlichung bekommt eine neue Nummer (Dirigent). Die Datei trägt sie als appVersion:
// so wie sie die neue Version schreibt, hier als 4.30.0 nachgestellt (ohne neuere Nummer gilt 'bm' für 4.23.0 als entfernte Engine).
const fileRel = JSON.stringify(Object.assign(JSON.parse(st.file), {appVersion: '4.30.0'}));
const old = await O.evaluate(async f => {
  const ok_ = importJSON(f); await new Promise(r => setTimeout(r, 800));
  const tr = S.tracks.find(t => t.kind === 'synth' && t.sound._nv);
  const nb = document.getElementById('nvBan'), bar = !!nb && nb.getBoundingClientRect().height > 0;
  const out = {imported: ok_, lock: !!NV.lock, nvTrack: !!tr, bar, plays: tr ? tr.sound.engine : null};
  out.back = JSON.stringify(projectFileObj(S, false, false));
  return out;
}, fileRel);
const back = await A2.evaluate(([f, ref]) => { const r = parseAny(f); if (!r.ok) return {ok: false}; const t = r.project.tracks.find(x => x.sound && x.sound.engine === 'bm'); return {ok: true, eq: !!t && JSON.stringify(t.sound.p.bm) === ref}; }, [old.back, st.ref]);
ok('BM6-08_older_version', old.imported && old.lock && old.bar && old.nvTrack && old.plays === 'analog' && back.ok && back.eq, {imported: old.imported, lock: old.lock, nvTrack: old.nvTrack, leiste: old.bar, spieltINIT: old.plays, zurueckDeepEqual: back.eq});
ok('no_page_errors', !errs.length, {errs: errs.slice(0, 5)});
const pass = Object.values(checks).every(v => v === true || (v && v.ok === true));
console.log(JSON.stringify({test: 'bm6-store', pass, checks}, null, 1));
await b.close();
process.exit(pass ? 0 : 1);
