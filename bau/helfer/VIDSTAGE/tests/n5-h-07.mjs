// VC2a-07: Projektdatei ohne Verlauf unverändert (Format, Prüfsumme, gleiche Hülle wie 4.23.0); mit Verlauf → Import → historyCheck true
import fs from 'fs';
import { launch, OUT } from './n5-h-lib.mjs';
const S = '/home/user/Synquenzer/bau/helfer/VIDSTAGE/tests/out/';
const res = []; const ok = (id, pass, info) => { res.push({id, pass: !!pass}); console.log((pass ? 'PASS ' : 'FAIL ') + id + ' ' + JSON.stringify(info)); };
const setup = p => p.evaluate(async () => { const A = SYNQUENZER; A.loadDemo(); await new Promise(r => setTimeout(r, 300));
  for (let i = 0; i < 20; i++) { A.setClip(1, i % 4, {len: 1, notes: [{p: 60 + i, s: (i % 4) / 2, l: .5, v: .8}]}); const s = A.getSound(2); s.p.cutoff = 900 + i * 50; A.setSound(2, s); }
  A.setBpm(97); undo(); await new Promise(r => setTimeout(r, 50)); });
const fileOf = p => p.evaluate(() => { const o = JSON.parse(SYNQUENZER.serialize()); return o; });
// 1) file without history: new == base (except appVersion), format 5, same sum; saveFile path (download) has no `history`
const base = await launch(), neu = await launch();
const pj = await (async () => { await setup(neu.p); return neu.p.evaluate(() => JSON.parse(serializeProject())); })();
await base.p.evaluate(pj => { SYNQUENZER.importJSON(JSON.stringify(SQStore.buildProjectFile(pj, [], '4.25.0'))); }, pj);
await neu.p.evaluate(pj => { SYNQUENZER.importJSON(JSON.stringify(SQStore.buildProjectFile(pj, [], '4.25.0'))); }, pj);
await base.p.waitForTimeout(400); await neu.p.waitForTimeout(400);
const fb = await fileOf(base.p), fn = await fileOf(neu.p);
const strip = o => { const c = JSON.parse(JSON.stringify(o)); delete c.appVersion; delete c.saved; return c; };
ok('VC2a-07 ohne Verlauf: Hülle gleich 4.23.0 (ohne appVersion), Format 5, gleiche Prüfsumme, kein Feld history', JSON.stringify(strip(fb)) === JSON.stringify(strip(fn)) && fn.format === 5 && fn.sum === fb.sum && !('history' in fn),
  {format: [fb.format, fn.format], sum: [fb.sum, fn.sum], keys: Object.keys(fn)});
const [dl0] = await Promise.all([neu.p.waitForEvent('download'), neu.p.evaluate(() => { UI.histFile = false; return SYNQUENZER.exportProject(); })]);
const f0p = OUT + '/n5-h-07-ohne.json'; await dl0.saveAs(f0p); const f0 = JSON.parse(fs.readFileSync(f0p, 'utf8'));
ok('VC2a-07 Als Datei sichern (Standard aus): ohne history, Prüfsumme = serialize', !('history' in f0) && f0.sum === fn.sum && f0.format === 5, {keys: Object.keys(f0), sum: f0.sum});
await base.b.close();
// 2) with history: menu option → file → import into a fresh browser → historyCheck true, same events
const hv = await neu.p.evaluate(async () => { await historyCheck(); return SYNQUENZER.history(); });
await neu.p.evaluate(() => { openMenu(); });
await neu.p.waitForTimeout(300);
const segBtn = neu.p.locator('#menu .mrow', {hasText: 'Projektdatei'}).locator('button', {hasText: 'mit Verlauf'});
await segBtn.click();
const [dl1] = await Promise.all([neu.p.waitForEvent('download'), neu.p.locator('#menu button', {hasText: 'Als Datei sichern'}).click()]);
const f1p = OUT + '/n5-h-07-mit.json'; await dl1.saveAs(f1p); const raw = fs.readFileSync(f1p, 'utf8'), f1 = JSON.parse(raw);
ok('VC2a-07 mit Verlauf: Feld history, Projekt-Prüfsumme unverändert', f1.history && f1.history.chunks && f1.history.chunks.length >= 1 && f1.sum === fn.sum, {chunks: f1.history && f1.history.chunks.length, bytes: raw.length, sum: f1.sum});
await neu.b.close();
const fresh = await launch();
await fresh.p.evaluate(() => openMenu());
await fresh.p.setInputFiles('#fileIn, input[type=file]', f1p).catch(async () => { await fresh.p.evaluate(raw => { const f = new File([raw], 'p.json', {type: 'application/json'}); onFilePicked(f); }, raw); });
await fresh.p.waitForTimeout(2500);
const after = await fresh.p.evaluate(async () => ({c: await historyCheck({detail: true}), h: SYNQUENZER.history(), name: S.name, bpm: S.bpm}));
ok('VC2a-07 Import mit Verlauf → historyCheck true, Verlauf übernommen', after.c.ok && after.h.events >= hv.events && after.c.keyframes >= 2, {before: hv, after});
ok('VC2a-07 keine Konsolenfehler', !fresh.errs.length && !neu.errs.length, fresh.errs.concat(neu.errs).slice(0, 4));
await fresh.b.close();
console.log(res.every(x => x.pass) ? 'ALLE BESTANDEN' : 'FEHLER');
