// ND4-02, ND4-06, ND4-07 (Teil): Quelle je Pad, Undo/Redo, Speichern/Laden, Kit-Kopie, Bibliothek, alte Version lädt das Projekt.
// Aufruf: NODE_PATH=/opt/node-tools/node_modules node md4-store.mjs <neu.html> [<alt.html>]
import {createRequire} from 'module';
const {chromium} = createRequire(import.meta.url)('playwright');
const NEW = process.argv[2] || new URL('../index.html', import.meta.url).pathname;
const OLD = process.argv[3] || '/home/user/Synquenzer/bau/werkzeug/vs-base-B.html';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const checks = {}; const ok = (k, v, info) => { checks[k] = info === undefined ? !!v : {ok: !!v, ...info}; };
async function open(file) {
  const p = await b.newPage({viewport: {width: 390, height: 844}}); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version, null, {timeout: 30000}); await p.waitForTimeout(800);
  return {p, errs};
}
const A = await open(NEW);

// ---- ND4-02 / ND4-07: jedes Pad Drum -> md -> Drum -> md, je ein Undo, Undo bis vorher, Redo ----
const r2 = await A.p.evaluate(() => {
  const Q = SYNQUENZER, J = JSON.stringify, KEYS = MDN.KEYS;
  const drumPart = o => { const x = {}; for (const k in o) if (!KEYS.includes(k) && k !== 'src') x[k] = o[k]; return x; };
  const mPart = o => { const x = {}; for (const k of KEYS) if (o && k in o) x[k] = o[k]; return x; };
  const slot = id => deep(drumSnd().p.slots[id] || {});
  const n = () => Q.undoInfo().n;
  const fails = []; const F = (id, what, info) => fails.push({id, what, info});
  const hadMd0 = !!drumSnd().p.md;
  for (const v of DRUM_VOICES) {
    const id = v.id, before = slot(id), spBefore = drumPart(slotParams(id)), n0 = n();
    if (Q.padSource(id) !== 'drum') F(id, 'start nicht drum');
    // 1. Drum -> md
    Q.setPadSource(id, 'md');
    if (n() !== n0 + 1) F(id, 'undo-schritte md', n() - n0);
    if (Q.undoInfo().top.kind !== 'sound') F(id, 'undo-art', Q.undoInfo().top.kind);
    let s1 = slot(id);
    if (s1.src !== 'md') F(id, 'src nicht md');
    if (J(mPart(s1)) !== J(MDN.init())) F(id, 'm* nicht INIT', mPart(s1));
    if (J(drumPart(s1)) !== J(drumPart(before))) F(id, 'drum-felder nach md');
    if (!drumSnd().p.md || J(drumSnd().p.md) !== J(MDN.kitInit()) && !hadMd0 && id === 'kick') F(id, 'p.md fehlt/nicht INIT');
    // ein Wert der Engine geändert (eigener Undo-Schritt), damit „gemerkt“ etwas anderes als INIT ist
    soundEdit(DRUM_T, 'test', () => { const st = drumSnd().p.slots[id]; st.mPit = 30 + v.idx; st.mTdec = 7 + v.idx; st.mDm = 'E2'; st.mName = 'P' + v.idx; drumChanged(id); });
    const mem = mPart(slot(id));
    if (n() !== n0 + 2) F(id, 'undo-schritte edit', n() - n0);
    // 2. md -> Drum
    Q.setPadSource(id, 'drum');
    if (n() !== n0 + 3) F(id, 'undo-schritte drum', n() - n0);
    const s2 = slot(id);
    if (Q.padSource(id) !== 'drum' || ('src' in s2 && s2.src !== 'drum')) F(id, 'src nach drum', s2.src);
    if (J(drumPart(s2)) !== J(drumPart(before))) F(id, 'drum-felder deep-equal', {before: drumPart(before), after: drumPart(s2)});
    if (J(drumPart(slotParams(id))) !== J(spBefore)) F(id, 'slotParams drum-teil');
    if (J(mPart(s2)) !== J(mem)) F(id, 'm* nicht gemerkt');
    // 3. Drum -> md: gemerkte Werte
    Q.setPadSource(id, 'md');
    if (n() !== n0 + 4) F(id, 'undo-schritte md2', n() - n0);
    const s3 = slot(id);
    if (s3.src !== 'md' || J(mPart(s3)) !== J(mem)) F(id, 'zweiter wechsel: gemerkte werte', mPart(s3));
    // gleicher Wechsel nochmal = kein Schritt
    Q.setPadSource(id, 'md'); if (n() !== n0 + 4) F(id, 'no-op legt undo an');
    // Undo bis vor den ersten Wechsel
    for (let k = 0; k < 4; k++) Q.undo();
    const s0 = slot(id);
    if (J(s0) !== J(before)) F(id, 'undo bis vorher', {before, s0});
    if ('src' in s0 || KEYS.some(k => k in s0)) F(id, 'undo: src/m* übrig');
    if (id === 'kick' && !hadMd0 && drumSnd().p.md) F(id, 'undo: p.md übrig');
    // Redo: wieder md mit gemerkten Werten
    for (let k = 0; k < 4; k++) Q.redo();
    const s4 = slot(id);
    if (J(s4) !== J(s3)) F(id, 'redo != nach zweitem wechsel');
    if (n() !== n0 + 4) F(id, 'undo-zahl nach redo', n() - n0);
  }
  return {fails, md: DRUM_VOICES.filter(v => Q.padSource(v.id) === 'md').length, hc: typeof historyCheck === 'function' ? historyCheck() : 'fehlt'};
});
ok('ND4-02_pads_switch_undo_redo', !r2.fails.length && r2.md === 12, {fails: r2.fails.slice(0, 6), md: r2.md});
ok('ND4-07_historyCheck', r2.hc === true || r2.hc === 'fehlt', {historyCheck: r2.hc, note: r2.hc === 'fehlt' ? 'historyCheck() gibt es in dieser Version nicht (VL-R1 nicht gebaut) – nur Undo-Zählung geprüft' : undefined});

// ---- ND4-06: Projekt mit 12 Modell-Pads + p.md -> Datei -> laden: deep-equal ----
const r6 = await A.p.evaluate(async () => {
  const Q = SYNQUENZER, J = JSON.stringify;
  soundEdit(DRUM_T, 'kit-fx', () => { Object.assign(drumSnd().p.md, {rvT: 'hA', rvC: -3, dlR: 77, dlM: 'b', dlB: 120, dlF: 20, fremd: 'bleibt'}); drumChanged(); });
  soundEdit(DRUM_T, 'kanal', () => { const st = drumSnd().p.slots.snare; Object.assign(st, {mWav: 'C2', mPan: -9, mDcrv: 'L3', mChlv: 33, mMono: 1, mCat: 'Sn', mName: 'Sechzehn Zeichen'}); drumChanged('snare'); });
  const snd0 = deep(drumSnd()), proj0 = JSON.parse(serializeProject());
  const text = JSON.stringify(projectFileObj(S, false, true)), pr = parseAny(text);
  const ddiff = (x, y, path = '', out = []) => { if (J(x) === J(y)) return out; if (x && y && typeof x === 'object' && typeof y === 'object') { for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) ddiff(x[k], y[k], path + '.' + k, out); } else out.push(path + ': ' + J(x) + ' -> ' + J(y)); return out; };
  const parsedEq = pr.ok && J(pr.project.tracks[DRUM_T].sound) === J(proj0.tracks[DRUM_T].sound);
  const parsedDiff = pr.ok ? ddiff(proj0.tracks[DRUM_T].sound, pr.project.tracks[DRUM_T].sound).slice(0, 8) : 'parse';
  // laden wie „Datei öffnen“ (importJSON) – neues Projekt anlegen und dann die Datei
  Q.newProject(); await new Promise(r => setTimeout(r, 200));
  const away = Q.padSource('kick');
  const imp = Q.importJSON(text); await new Promise(r => setTimeout(r, 300));
  const snd1 = deep(drumSnd()), strip = s => { const x = deep(s); delete x.origin; delete x.id; return x; };
  const loadedEq = J(strip(snd1)) === J(strip(snd0));
  const tracksEq = J(JSON.parse(serializeProject()).tracks.map(t => t.clips)) === J(proj0.tracks.map(t => t.clips));
  const md = DRUM_VOICES.filter(v => Q.padSource(v.id) === 'md').length;
  return {parsedEq, away, imp, loadedEq, tracksEq, md, pmd: snd1.p.md, snare: deep(snd1.p.slots.snare), text, parsedDiff, diff: loadedEq ? null : ddiff(strip(snd0), strip(snd1)).slice(0, 8)};
});
ok('ND4-06_file_parse_deepEqual', r6.parsedEq, {diff: r6.parsedDiff});
ok('ND4-06_load_deepEqual', r6.imp && r6.loadedEq && r6.tracksEq && r6.md === 12 && r6.away === 'drum', {imp: r6.imp, loadedEq: r6.loadedEq, tracksEq: r6.tracksEq, md: r6.md, diff: r6.diff});
ok('ND4-06_unknown_kit_field_kept', r6.pmd && r6.pmd.fremd === 'bleibt' && r6.pmd.rvT === 'hA' && r6.pmd.dlF === 20, {pmd: r6.pmd});


// ---- ND4-06: Kit-Kopie (eigenes Kit sichern + laden), Pad-Klang aus anderem Kit laden ----
const rk = await A.p.evaluate(async () => {
  const J = JSON.stringify, snd0 = deep(drumSnd());
  const saved = await saveSound(DRUM_T, 'MD Kit Test');
  const recOk = J(saved.p.slots) === J(snd0.p.slots) && J(saved.p.md) === J(snd0.p.md);
  loadKit('808');
  const away = drumSnd().p.slots.kick && drumSnd().p.slots.kick.src;
  const ks = kitSound('MD Kit Test'); applyDrumSound(ks);
  const back = deep(drumSnd()), backOk = J(back.p.slots) === J(snd0.p.slots) && J(back.p.md) === J(snd0.p.md);
  const cp = soundCopy(LIB.lib.get(saved.id)), cpOk = J(cp.p.slots) === J(snd0.p.slots) && J(cp.p.md) === J(snd0.p.md);
  // Pad-Klang aus einem anderen Kit laden (Sound laden): Quelle und Felder der Engine bleiben
  const src = slotSources('tomL').find(x => x.kit === '909'), mBefore = MDN.pick(drumSnd().p.slots.tomL);
  loadSlotSound('tomL', src.P);
  const after = drumSnd().p.slots.tomL, padOk = J(MDN.pick(after)) === J(mBefore) && after.frq === src.P.frq;
  return {recOk, away: away || null, backOk, cpOk, padOk};
});
ok('ND4-06_kit_copy_carries_src_m_pmd', rk.recOk && rk.backOk && rk.cpOk && !rk.away, rk);
ok('ND4-06_pad_sound_load_keeps_md', rk.padOk);

// ---- Bibliothek: eigenes Programm engine 'mdp', übersteht Neuladen der LIB, nicht im Synth-Browser ----
const rl = await A.p.evaluate(async () => {
  const J = JSON.stringify;
  const st = drumSnd().p.slots.kick; soundEdit(DRUM_T, 'p', () => { st.mPit = 52.5; st.mWav = 'A3'; drumChanged('kick'); });
  const rec = await mdLibSave('kick', 'Mein Kick', 'bd');
  const L2 = SQStore.Library(kv, factoryNames); await L2.load();
  const r2 = L2.get(rec.id);
  const kept = !!r2 && r2.engine === 'mdp' && J(r2.p) === J(rec.p) && r2.p.mPit === 52.5 && r2.p.mWav === 'A3' && r2.p.mCat === 'bd' && r2.p.mDec === MDN.spec(st).mDec;
  const pools = [0, 1, 2, 3].map(t => brPool(t, {all: true})), inPool = pools.some(P => P.fac.concat(P.own).some(s => s.engine === 'mdp' || s.id === rec.id));
  const listed = mdLibList().some(s => s.id === rec.id);
  const kits = kitList().some(k => k.id === rec.id);
  // Laden ins Pad snare: Spec-Werte -> gespeicherte Schlüssel, Mono/Kurve bleiben beim Kanal
  const sn = drumSnd().p.slots.snare, keep = {mMono: sn.mMono, mDcrv: sn.mDcrv};
  mdLoadProgram('snare', r2.p, r2.name);
  const s2 = drumSnd().p.slots.snare, loadOk = s2.mPit === 52.5 && s2.mWav === 'A3' && s2.mMono === keep.mMono && s2.mDcrv === keep.mDcrv && s2.mName === 'Mein Kick';
  // Projektdatei mit Bibliothek (enthält jetzt das mdp-Programm) für die alte Version
  const text = JSON.stringify(projectFileObj(S, false, true));
  return {rec: {engine: rec.engine, name: rec.name, keys: Object.keys(rec.p).length}, kept, inPool, listed, kits, loadOk, text};
});
ok('lib_mdp_record_survives_reload', rl.kept && rl.rec.engine === 'mdp', {...rl.rec});
ok('lib_mdp_not_in_synth_browser', !rl.inPool && rl.listed && !rl.kits, {inPool: rl.inPool, listed: rl.listed, inKits: rl.kits});
ok('lib_mdp_load_program', rl.loadOk);
const PROJ_TEXT = rl.text;
// Hinweis (zählt nicht zum Ergebnis): eigenes mdp-Programm über deleteSound löschen – mdp gilt für SQStore als „fremde Engine“
const info = await A.p.evaluate(async () => { const r = await mdLibSave('kick', 'Wegwerf', 'bd'); const d = await deleteSound(r.id); const still = !!LIB.lib.get(r.id); if (still) await LIB.lib.remove(r.id); return {mdpDeleteSound: d, stillThere: still}; });
ok('new_no_page_errors', !A.errs.length, {errs: A.errs.slice(0, 4)});

// ---- ND4-06: alte Version (4.23.0 Basis) lädt das Projekt ohne Fehler, Drum-Stimme spielt, src/m* bleiben ----
const B = await open(OLD);
const ro = await B.p.evaluate(async text => {
  const Q = SYNQUENZER, imp = Q.importJSON(text); await new Promise(r => setTimeout(r, 400));
  const sl = drumSnd().p.slots, kept = DRUM_VOICES.every(v => sl[v.id] && sl[v.id].src === 'md' && 'mPit' in sl[v.id]);
  ensureAudio(); for (let k = 0; k < 40 && !(AU.ctx && AU.ctx.state === 'running' && drumBufs() && AU.kit); k++) await new Promise(r => setTimeout(r, 100));
  const t = AU.ctx.currentTime + .05, h = drumHit(36, .9, t, 'pad');
  const plays = !!(h && h.srcs && h.srcs.length);
  // Speichern in der alten Version: src/m* bleiben (p.md geht dort verloren, Spec)
  const back = JSON.parse(serializeProject()).tracks[DRUM_T].sound.p;
  const lib = LIB.ok ? LIB.lib.all().filter(s => s.engine === 'mdp').length : -1;
  return {imp, kept, plays, keptOnSave: back.slots.kick.src === 'md' && back.slots.kick.mTdec != null, pmdOld: !!back.md, lib, ver: Q.version};
}, PROJ_TEXT);
await B.p.waitForTimeout(500);
ok('ND4-06_old_build_loads', ro.imp && ro.kept && ro.plays && ro.keptOnSave && !B.errs.length, {...ro, errs: B.errs.slice(0, 4)});
ok('old_build_keeps_mdp_in_library', ro.lib >= 1, {lib: ro.lib});

const pass = Object.values(checks).every(v => v === true || (v && v.ok === true));
console.log(JSON.stringify({test: 'md4-store', ids: ['ND4-02', 'ND4-06', 'ND4-07'], pass, checks, info}));
await b.close();
process.exit(pass ? 0 : 1);
