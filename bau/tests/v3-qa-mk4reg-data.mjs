// QA regression MK4: data paths with an MS 2000 track that uses the effects (save/load, serialize/import, file save/open,
// library save+apply, export/import sounds, MIDI zip, engine switch away and back, undo), and an MK2-made project in MK4
import { open, APP } from './v3-qa-mk4reg-pw.mjs';
import fs from 'fs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/MK2.html';
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-mk4reg/';
const FX = {'mfx.type': 2, 'mfx.spd': 30, 'mfx.dep': 90, 'dly.type': 1, 'dly.sync': 1, 'dly.note': 9, 'dly.time': 77, 'dly.dep': 64, 'eq.lf': 120, 'eq.lg': 4.5, 'eq.hf': 9000, 'eq.hg': -3.5};
// 1) an MK2 project with an MS 2000 track (patch/wave edits), saved by 4.10.0
{ const {b, p, errs} = await open({width: 390, height: 844}, BASE);
  const s = await p.evaluate(async () => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setEngine(0, 'mk'); await new Promise(r => setTimeout(r, 300));
    Q.mkSet(0, 't.0.o1.w', 1); Q.mkSet(0, 't.0.o1.c1', 40); Q.mkSet(0, 't.0.f.cut', 80); Q.mkSet(0, 't.0.p.1.i', 20);
    Q.setClip(0, 0, {len: 1, key: {root: 9, scale: 'aeolian'}, notes: [{t: 0, d: .5, n: 57, v: .9}, {t: 2, d: .5, n: 60, v: .9}]}); return Q.serialize(); });
  fs.writeFileSync(D + 'mk2-project.json', s); console.log('MK2 project saved', s.length, 'errs', errs); await b.close(); }
const {b, p, errs} = await open({width: 390, height: 844}, APP);
const r = await p.evaluate(async ({FX, old}) => { const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)), out = {};
  // MK2 project in MK4
  const ok = Q.importJSON(old); await sl(300); const o = JSON.parse(old); const tr = (o.project || o).tracks[0];
  out.mk2 = {ok, eng: Q.getSound(0).engine, same: JSON.stringify(Q.getSound(0).p.mk) === JSON.stringify(tr.sound.p.mk), fx: JSON.stringify({m: Q.getSound(0).p.mk.mfx, d: Q.getSound(0).p.mk.dly, e: Q.getSound(0).p.mk.eq})};
  // effects on
  for (const k in FX) Q.mkSet(0, k, FX[k]);
  const g1 = Q.getSound(0).p.mk; out.set = JSON.stringify({m: g1.mfx, d: g1.dly, e: g1.eq});
  // serialize / import
  const s1 = Q.serialize(); await Q.newProject({init: true}); Q.importJSON(s1); await sl(200); const g2 = Q.getSound(0).p.mk;
  out.importSame = JSON.stringify({m: g2.mfx, d: g2.dly, e: g2.eq}) === out.set;
  // save / load (storage)
  await Q.save(); const pid = Q.project().id; await Q.newProject({init: true}); await sl(200); out.ld = await Q.openProject(pid); await sl(400); const g3 = Q.getSound(0).p.mk || {};
  out.loadSame = JSON.stringify({m: g3.mfx, d: g3.dly, e: g3.eq}) === out.set;
  // library: save sound, apply to track 1
  try { await Q.libraryReady(); const sv = await Q.saveSound(0, 'QA FX Sound'); out.saved = !!sv; const lib = Q.library(); const rec = lib.find(x => x.name === 'QA FX Sound');
    out.libHasFx = !!(rec && rec.p && rec.p.mk && rec.p.mk.dly && rec.p.mk.dly.dep === 64);
    if (rec) { Q.setSound(1, rec); await sl(200); const g4 = Q.getSound(1); out.applied = g4.engine === 'mk' && JSON.stringify({m: g4.p.mk.mfx, d: g4.p.mk.dly, e: g4.p.mk.eq}) === out.set; }
    const ex = await Q.exportSounds(rec ? [rec.id] : undefined); out.export = typeof ex === 'string' ? ex.length : (ex && typeof ex === 'object' ? Object.keys(ex).join(',') : String(ex));
  } catch (e) { out.libErr = String(e); }
  // engine away and back
  Q.setEngine(0, 'analog'); await sl(150); Q.setEngine(0, 'mk'); await sl(150); const g5 = Q.getSound(0).p.mk; out.engBack = JSON.stringify({m: g5.mfx, d: g5.dly, e: g5.eq});
  // undo of an effect edit
  Q.mkSet(0, 'dly.dep', 100); const u1 = Q.getSound(0).p.mk.dly.dep; Q.undo(); const u2 = Q.getSound(0).p.mk.dly.dep; Q.redo(); const u3 = Q.getSound(0).p.mk.dly.dep; out.undo = [u1, u2, u3];
  // MIDI zip with the MS 2000 track
  const got = []; window.claude = {use: async k => (k === 'downloads' ? {save: async ({filename, data}) => { got.push({filename, n: (await data.arrayBuffer()).byteLength}); }} : null)};
  await Q.exportMidi({mode: 'scene', scene: 0}); await sl(800); out.midi = got;
  // play it: notes come out, no tick errors
  Q.setBpm(200); Q.clearLog(); Q.launchScene(0); await sl(3000); out.notes = Q.noteLog(400).filter(n => n.track === 0).length; out.te = Q.tickErrors(); Q.stop();
  out.fxBytes = Q.mkInfo().fxBytes;
  return out; }, {FX, old: fs.readFileSync(D + 'mk2-project.json', 'utf8')});
// file save / open through the menu (standalone download)
await p.evaluate(() => window.SYNQUENZER.openMenu()); await p.waitForTimeout(400);
const dlP = p.waitForEvent('download', {timeout: 8000}).catch(() => null);
await p.locator('button', {hasText: 'Als Datei sichern'}).filter({visible: true}).first().click();
const dl = await dlP; r.dl = dl ? dl.suggestedFilename() : null;
if (dl) { const path = D + 'mk4-fx-project.json'; await dl.saveAs(path); const o = JSON.parse(fs.readFileSync(path, 'utf8')); const t0 = (o.project || o).tracks[0]; r.fileFx = t0 && t0.sound && t0.sound.p && t0.sound.p.mk ? JSON.stringify({m: t0.sound.p.mk.mfx, d: t0.sound.p.mk.dly, e: t0.sound.p.mk.eq}) : 'missing'; r.fileApp = [o.appVersion, o.format];
  await p.evaluate(() => { window.SYNQUENZER.closeMenu && window.SYNQUENZER.closeMenu(); window.SYNQUENZER.newProject({init: true}); });
  await p.setInputFiles('#fileIn', path); await p.waitForTimeout(2000);
  r.reopen = await p.evaluate(() => { const g = window.SYNQUENZER.getSound(0); return g.engine + ' ' + JSON.stringify({m: g.p.mk && g.p.mk.mfx, d: g.p.mk && g.p.mk.dly, e: g.p.mk && g.p.mk.eq}); }); }
r.errs = errs;
console.log(JSON.stringify(r, null, 1));
await b.close();
