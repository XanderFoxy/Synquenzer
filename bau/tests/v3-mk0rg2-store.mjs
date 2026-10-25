// QA regression MK0: library (save/delete/restore/export/import, legacy fm2 sound), history (save → Ältere Version → restore),
// park/cloud text of a normal project, KV snapshot shape, undo of sound loads, project ops; base vs new.
import { open, NEW, BASE, OUT } from './v3-mk0rg2-lib.mjs';
import fs from 'fs';
const [which] = process.argv.slice(2);
const {p, errs, close} = await open(which === 'base' ? BASE : NEW, 'P1', true);
const r = {};
try {
  r.lib = await p.evaluate(async () => { const Q = window.SYNQUENZER; const o = {};
    o.n0 = Q.library().length;
    const a = await Q.saveSound(0, 'QA Eins'); o.saved = !!a; o.n1 = Q.library().length;
    const id = (typeof a === 'string' ? a : (a && a.id)) || (Q.library().find(x => x.name === 'QA Eins') || {}).id; o.id = !!id;
    const before = Q.library().find(x => x.id === id);
    o.del = await Q.deleteSound(id); o.n2 = Q.library().length;
    o.rest = await Q.restoreSound(before); o.n3 = Q.library().length;
    
    // legacy fm2 + known engine with an unknown field + a v2-style patch object fed as a sound
    const fm2 = {$: 'snd', v: 1, name: 'Alt FM2', engine: 'fm2', cat: 'fm', p: {fm2: {ratio: 2, index: 3}}, mods: [], fx: {}};
    const va = {$: 'snd', v: 1, name: 'VA plus', engine: 'analog', cat: 'lead', p: {cutoff: .5, mk: {a: 1}}, mods: [], fx: {}, bank: 3};
    const imp = await Q.importSounds({app: 'SYNQUENZER', kind: 'sounds', format: 1, sounds: [fm2, va]}); o.imp = JSON.stringify(imp).slice(0, 200);
    const L = Q.library(); o.fm2 = (L.find(x => x.name === 'Alt FM2') || {}).engine; const v = L.find(x => x.name === 'VA plus'); o.vaKeys = v ? Object.keys(v).sort().join(',') + '|' + Object.keys(v.p).includes('mk') : null;
    o.libJson = JSON.stringify(L.map(x => { const y = JSON.parse(JSON.stringify(x)); delete y.id; delete y.ct; delete y.mt; delete y.loc; return y; }));
    return o; });
  // sound load + undo, engine switch + undo
  r.undo = await p.evaluate(async () => { const Q = window.SYNQUENZER; const s0 = JSON.stringify(Q.getSound(2)); Q.loadPreset(2, (Q.factory().find(f => f.engine === 'analog' && f.name !== Q.getSound(2).name) || {}).id); const s1 = JSON.stringify(Q.getSound(2)); Q.undo(); const s2 = JSON.stringify(Q.getSound(2));
    Q.setEngine(2, 'wt'); const e1 = Q.getSound(2).engine; Q.undo(); return {changed: s0 !== s1, undone: s0 === s2, e1, e2: Q.getSound(2).engine}; });
  // history: save twice → history list → restore older
  r.hist = await p.evaluate(async () => { const Q = window.SYNQUENZER; Q.setBpm(101); await Q.save(); await autosave.snapshotNow(); await new Promise(r => setTimeout(r, 50)); Q.setBpm(102); await Q.save(); await autosave.snapshotNow(); const h = await Q.history(); const older = h.find(x => x) && h[h.length > 1 ? 1 : 0];
    const ok = older ? await Q.restoreHistory(older.key) : null; return {n: h.length, ok, bpm: Q.project().bpm}; });
  await p.waitForTimeout(1500);
  // KV snapshot + park + cloud text of a normal project
  r.kv = await p.evaluate(async () => { const v = await kv.get('project'); return {keys: Object.keys(v).sort().join(','), sameId: v.project.id === S.id, app: typeof v.app}; });
  r.park = await p.evaluate(() => { const fo = parkSnapshot(); return fo ? {kind: fo.kind, format: fo.format, id: fo.project.id === S.id} : null; });
  r.cloudText = await p.evaluate(async () => { if (typeof cloudFileText !== 'function') return 'nofn'; const t = await cloudFileText(S.id); return t ? Object.keys(t).join(',') + ' ' + JSON.stringify(t).length : null; });
  r.nv = await p.evaluate(() => typeof NV === 'undefined' ? 'none' : JSON.stringify(NV.lock));
  r.banner = await p.evaluate(() => !!document.getElementById('nvBan'));
  // project ops
  r.proj = await p.evaluate(async () => { const Q = window.SYNQUENZER; const id0 = Q.project().id; const d = await Q.duplicateProject(id0); const L1 = (await Q.projects()).length;
    const rn = await Q.renameProject(id0, 'QA Umbenannt'); const nm = Q.project().name; await Q.newProject({init: true}); await new Promise(r => setTimeout(r, 500));
    const L2 = await Q.projects(); const op = await Q.openProject(id0); await new Promise(r => setTimeout(r, 500)); return {dup: !!d, L1, rn: !!rn, nm, L2: L2.length, op: !!op, back: Q.project().id === id0, bpm: Q.project().bpm}; });
  r.te = await p.evaluate(() => window.SYNQUENZER.tickErrors());
} catch (e) { r.FAIL = String(e).slice(0, 400); }
r.errs = errs.filter(e => !/Failed to load resource|net::ERR/.test(e));
fs.writeFileSync(OUT + `store-${which}-P1.json`, JSON.stringify(r, null, 1));
console.log(which, 'done'); await close();
