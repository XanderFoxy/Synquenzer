// QA VV2-02: a Spur entry on an added track (Spur 7) after save → load / reload
import { open } from './n5-v-lib.mjs';
const SONG = {bars: 8, lanes: [[{bar: 0, slot: 0}], [{bar: 0, slot: 0}], [], [], [{bar: 0, slot: 0}], [], [{bar: 4, slot: 0}]], carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 4, name: 'Strophe'}, {id: 'm2', a: 4, len: 4, name: 'Refrain'}]};
const {b, p, errs} = await open();
const r = {};
r.add = await p.evaluate(() => SYNQUENZER.addTrack());
r.nt = await p.evaluate(() => S.tracks.length);
// give the new track a clip in scene 1
r.clip = await p.evaluate(() => { const t = S.tracks[6]; t.clips[0] = {len: 1, notes: [{t: 0, n: 60, d: 1, v: 100}]}; try { return !!normClip; } catch (e) { return 'x'; } });
await p.evaluate(s => SYNQUENZER.setSong(s), SONG);
r.lanes6 = await p.evaluate(() => JSON.stringify(S.song.lanes[6]));
r.set = await p.evaluate(() => SYNQUENZER.vvDirSet(4, 8, 'spur', 6));
r.dir0 = await p.evaluate(() => SYNQUENZER.vvDirGet());
// file: serialize → load into a fresh 6-track session
const file = await p.evaluate(() => serialize());
r.inFile = /"video":\[\{"a":4,"b":8,"v":"spur","t":6\}\]/.test(file);
// same session, load the file back (current = 7 tracks)
r.sameSession = await p.evaluate(f => { applyProject(normalizeProject(projFromFile(JSON.parse(f))), {}); return {nt: S.tracks.length, dir: SYNQUENZER.vvDirGet()}; }, file);
// save to browser storage and reload the page
await p.evaluate(() => SYNQUENZER.save()); await p.waitForTimeout(1500);
await p.reload(); await p.waitForTimeout(3000);
r.afterReload = await p.evaluate(() => ({nt: S.tracks.length, lane6: S.song && JSON.stringify(S.song.lanes[6]), dir: S.song ? (S.song.video || null) : 'nosong'}));
await b.close();
// a fresh browser (6 tracks) loads the file
const h = await open();
r.freshBefore = await h.p.evaluate(() => S.tracks.length);
r.freshLoad = await h.p.evaluate(f => { applyProject(normalizeProject(projFromFile(JSON.parse(f))), {}); return {nt: S.tracks.length, lane6: JSON.stringify(S.song.lanes[6]), dir: SYNQUENZER.vvDirGet()}; }, file);
await h.b.close();
console.log(JSON.stringify(r, null, 1)); console.log('errs', errs);
