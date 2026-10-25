// Independent repro: newer (format 5) project through backup / file-export / backup-restore paths in 4.8.1
import {setup, go, boot, idb, server, ok, finish} from './v3-mk0qa/h.mjs';
const APP = process.argv[2];
const MK = {$: 'snd', v: 1, id: null, name: 'AM Lead', cat: 'lead', engine: 'mk', ev: 3,
  p: {mk: {v: 1, mode: 0, t: [{o1: {w: 1}, f: {cut: 80}}]}}, mods: [], fx: {vol: .8}, origin: null};
const cap = page => page.evaluate(() => { window.__got = []; window.deliver = (name, bytes, kind, msg) => { window.__got.push({name, o: JSON.parse(new TextDecoder().decode(bytes))}); return Promise.resolve('download'); }; });
const sum = pj => pj && ({format: pj.format, mkIn: pj.tracks && pj.tracks[0] && pj.tracks[0].mkIn || null, t1: pj.tracks && pj.tracks[1] && pj.tracks[1].sound && pj.tracks[1].sound.engine});

// ---- A: 4.8.1 with a locked format-5 project from the KV autosave ----
let A = await setup(server(), {file: APP}); await go(A.page);
const base = JSON.parse(await A.page.evaluate(() => SYNQUENZER.serialize()));
const p5 = JSON.parse(JSON.stringify(base.project)); p5.id = 'p-new5'; p5.name = 'Aus 4.9'; p5.format = 5;
p5.tracks[1].sound = MK; p5.tracks[0].mkIn = {e1: 'mic', e2: null, e1Dry: 1, e2Dry: 1};
await idb(A.page, 'put', 'project', {mt: Date.now() + 5000, app: 4009000, project: p5});
await A.page.reload(); await boot(A.page);
const lk = await A.page.evaluate(() => ({lock: SYNQUENZER.nvState().lock, ban: !!document.getElementById('nvBan'), id: S.id}));
console.log('A lock state', JSON.stringify(lk));
await cap(A.page);
await A.page.evaluate(() => saveFile()); await A.page.evaluate(() => backupAll());
const got = await A.page.evaluate(() => window.__got);
const file = got[0].o, bak = got[1].o;
const kvp = await idb(A.page, 'get', 'project');
console.log('A KV original after both:', JSON.stringify(sum(kvp.project)));
console.log('A "Als Datei sichern":', JSON.stringify({format: file.format, appVersion: file.appVersion, ...sum(file.project)}));
const bp = bak.projects.find(x => x.project.id === 'p-new5');
console.log('A backup entry:', JSON.stringify({format: bp.format, appVersion: bp.appVersion, ...sum(bp.project)}), 'entries', bak.projects.length);
ok('A0 lock active + banner', lk.lock && lk.ban);
ok('A1 KV original kept (format 5, mkIn)', kvp.project.format === 5 && kvp.project.tracks[0].mkIn);
ok('A2 backup holds the newer original', bp.project.format === 5 && bp.project.tracks[0].mkIn);
ok('A3 file export holds the newer original', file.project.format === 5 && file.project.tracks[0].mkIn);
await A.ctx.close();

// ---- B: fresh storage (new device / cleared), 4.8.1 restores backups via the real file picker path ----
async function restore(label, backupObj) {
  const B = await setup(server(), {file: APP}); await go(B.page);
  await B.page.evaluate(t => onFilePicked(new File([t], 'synquenzer-alles.json', {type: 'application/json'})), JSON.stringify(backupObj));
  await B.page.waitForTimeout(800);
  const pk = await idb(B.page, 'get', 'proj:p-new5');
  console.log(label, 'parked:', pk ? JSON.stringify({format: pk.format, appVersion: pk.appVersion, ...sum(pk.project)}) : 'none');
  await B.page.evaluate(() => openProject('p-new5')); await B.page.waitForTimeout(800);
  const st = await B.page.evaluate(() => ({lock: SYNQUENZER.nvState().lock, ban: !!document.getElementById('nvBan'), id: S.id}));
  await B.page.evaluate(() => { S.bpm = 133; markDirty(); }); await B.page.evaluate(() => saveNow()); await B.page.waitForTimeout(400);
  const kv2 = await idb(B.page, 'get', 'project');
  console.log(label, 'opened:', JSON.stringify(st), 'autosave KV after edit:', JSON.stringify({app: kv2.app, ...sum(kv2.project)}));
  ok(label + ' restored newer project opens locked with banner', st.lock && st.ban);
  ok(label + ' restored copy keeps format 5 + mkIn', pk && pk.project.format === 5 && pk.project.tracks[0].mkIn);
  await B.ctx.close();
}
await restore('B1 (backup made by 4.8.1 in A)', bak);
const bak49 = {app: 'SYNQUENZER', kind: 'backup', format: 1, saved: new Date().toISOString(), appVersion: '4.9.0',
  projects: [{app: 'SYNQUENZER', kind: 'project', format: 5, saved: new Date().toISOString(), appVersion: '4.9.0', project: p5}], sounds: []};
await restore('B2 (backup made by 4.9.0)', bak49);
await finish();
