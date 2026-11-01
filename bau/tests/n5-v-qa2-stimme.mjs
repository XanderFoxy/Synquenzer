// VV2-02: „Im Video zeigen“ on the STIMME-Spur (always an added track, index ≥ 6) → reload / file load
import { open } from './n5-v-lib.mjs';
const {b, p, errs} = await open({w: 390, h: 844, touch: true, dpr: 2});
const r = {};
r.add = await p.evaluate(() => { const ok = tkAudioOk(); tkAddTrack(); return {ok, st: stimmeT(), nt: S.tracks.length, name: S.tracks[stimmeT()] && S.tracks[stimmeT()].name}; });
const st = r.add.st;
// a song where the STIMME-Spur plays a clip (scene 1) in bars 5–8
r.song = await p.evaluate(st => {
  S.tracks[st].clips[0] = JSON.parse(JSON.stringify(S.tracks[0].clips[0]));
  const lanes = [[{bar: 0, slot: 0}], [{bar: 0, slot: 0}], [], [], [{bar: 0, slot: 0}], []]; lanes[st] = [{bar: 4, slot: 0}];
  SYNQUENZER.setSong({bars: 8, lanes, carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 4, name: 'Strophe'}, {id: 'm2', a: 4, len: 4, name: 'Refrain'}]});
  setSongView(true);
  return {lane: JSON.stringify(S.song.lanes[st])};
}, st);
// hold the lane entry → Zell-Blatt → tap „Im Video zeigen“
await p.evaluate(st => openCellSheet(st, 5), st); await p.waitForTimeout(400);
const c = await p.evaluate(() => { const e = document.querySelector('.pop button[data-a="vvshow"]'); if (!e) return null; const q = e.getBoundingClientRect(); return [q.left + q.width / 2, q.top + q.height / 2]; });
r.btn = !!c; if (c) { await p.touchscreen.tap(c[0], c[1]); await p.waitForTimeout(400); }
r.dir = await p.evaluate(() => SYNQUENZER.vvDirGet());
const file = await p.evaluate(() => serialize());
await p.evaluate(() => SYNQUENZER.save()); await p.waitForTimeout(1500);
await p.reload(); await p.waitForTimeout(3000);
r.afterReload = await p.evaluate(() => ({st: stimmeT(), lane: S.song && JSON.stringify(S.song.lanes[stimmeT()]), video: S.song ? (S.song.video || null) : 'nosong'}));
await b.close();
const h = await open();
r.fileInFresh = await h.p.evaluate(f => { applyProject(normalizeProject(projFromFile(JSON.parse(f))), {}); return {st: stimmeT(), video: SYNQUENZER.vvDirGet()}; }, file);
await h.b.close();
console.log(JSON.stringify(r)); console.log('errs', errs);
