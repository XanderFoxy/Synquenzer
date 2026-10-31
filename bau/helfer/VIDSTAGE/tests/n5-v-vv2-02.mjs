// VV2-02: Takte einfügen/löschen vor einem Eintrag verschiebt bzw. kürzt ihn; Undo → deep-equal; Speichern/Laden behält ihn;
// ein Projekt ohne song.video bleibt Zeichen für Zeichen gleich
import { open } from './n5-v-lib.mjs';
import fs from 'fs';
const SONG16 = {bars: 16, lanes: [[{bar: 0, slot: 0}, {bar: 8, slot: 1}], [{bar: 0, slot: 0}], [{bar: 2, slot: 0}, {bar: 14, slot: -1}], [], [{bar: 0, slot: 0}, {bar: 8, slot: 1}], []],
  carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 8, name: 'Strophe'}, {id: 'm2', a: 8, len: 8, name: 'Refrain'}]};
const res = {};
// 1) the base app (before VV2) and this one: the same project without song.video serializes to the same characters
{
  const pre = '/home/user/Synquenzer/bau/snapshots/VV1.html';
  process.env.APP = pre; const A = await import('./n5-v-lib.mjs?pre'); const h0 = await A.open();
  const s0 = await h0.p.evaluate(s => { SYNQUENZER.setSong(s); return serialize(); }, SONG16); await h0.b.close();
  const strip = x => x.replace(/"sum":"[0-9a-f]+"/g, '').replace(/"id":"p-[a-z0-9-]+"/g, '');
  const {b, p} = await open();
  const r = await p.evaluate(s0 => { const s1 = serialize(); applyProject(normalizeProject(projFromFile(JSON.parse(s0))), {}); const s2 = serialize(); applyProject(normalizeProject(projFromFile(JSON.parse(s2))), {}); return {s2, s3: serialize(), has: !!(S.song && 'video' in S.song)}; }, s0);
  res.ohneVideo = {len: s0.length, gleichAlt: strip(r.s2) === strip(s0), gleichZweimal: strip(r.s2) === strip(r.s3), keinFeld: !r.has, ok: strip(r.s2) === strip(s0) && strip(r.s2) === strip(r.s3) && !r.has};
  if (!res.ohneVideo.gleichAlt) { let k = 0; while (k < s0.length && s0[k] === r.s2[k]) k++; res.ohneVideo.ab = [s0.slice(k - 60, k + 60), r.s2.slice(k - 60, k + 60)]; }
  await b.close();
}
const {b, p, errs} = await open();
await p.evaluate(s => SYNQUENZER.setSong(s), SONG16);
const step = async (name, fn, want) => {
  const r = await p.evaluate(fn);
  res[name] = Object.assign(r, {soll: want, ok: JSON.stringify(r.dir) === JSON.stringify(want) && r.undoEq !== false});
};
// the entry: Refrain → Matrix (bars 9–16), bars 9–12 → Spur 3
await step('setzen', () => { const b0 = JSON.stringify(S.song); SYNQUENZER.vvDirSet(8, 16, 'matrix'); SYNQUENZER.vvDirSet(8, 12, 'spur', 2); const d = SYNQUENZER.vvDirGet(); undo(); undo(); const eq = JSON.stringify(S.song) === b0; redo(); redo(); return {dir: SYNQUENZER.vvDirGet(), undoEq: eq && JSON.stringify(SYNQUENZER.vvDirGet()) === JSON.stringify(d)}; },
  [{a: 8, b: 12, v: 'spur', t: 2}, {a: 12, b: 16, v: 'matrix'}]);
await step('einfuegen2vor', () => { const b0 = JSON.stringify(S.song); songRange('insertEmpty', 3, 4); const d = SYNQUENZER.vvDirGet(); undo(); const eq = JSON.stringify(S.song) === b0; redo(); const ok2 = JSON.stringify(SYNQUENZER.vvDirGet()) === JSON.stringify(d); undo(); return {dir: d, undoEq: eq && ok2}; },
  [{a: 10, b: 14, v: 'spur', t: 2}, {a: 14, b: 18, v: 'matrix'}]);
await step('loeschen2vor', () => { const b0 = JSON.stringify(S.song); songRange('delete', 2, 3); const d = SYNQUENZER.vvDirGet(); undo(); const eq = JSON.stringify(S.song) === b0; return {dir: d, undoEq: eq}; },
  [{a: 6, b: 10, v: 'spur', t: 2}, {a: 10, b: 14, v: 'matrix'}]);
await step('loeschenImEintrag', () => { const b0 = JSON.stringify(S.song); songRange('delete', 9, 10); const d = SYNQUENZER.vvDirGet(); undo(); const eq = JSON.stringify(S.song) === b0; return {dir: d, undoEq: eq}; },
  [{a: 8, b: 10, v: 'spur', t: 2}, {a: 10, b: 14, v: 'matrix'}]);
await step('einfuegenImEintrag', () => { const b0 = JSON.stringify(S.song); songRange('insertEmpty', 10, 10); const d = SYNQUENZER.vvDirGet(); undo(); const eq = JSON.stringify(S.song) === b0; return {dir: d, undoEq: eq}; },
  [{a: 8, b: 10, v: 'spur', t: 2}, {a: 11, b: 13, v: 'spur', t: 2}, {a: 13, b: 17, v: 'matrix'}]);
await step('teilVerschieben', () => { const b0 = JSON.stringify(S.song); markAction(S.song.marks.find(m => m.name === 'Refrain').id, 'swapL'); const d = SYNQUENZER.vvDirGet(); undo(); const eq = JSON.stringify(S.song) === b0; return {dir: d, undoEq: eq}; },
  [{a: 0, b: 4, v: 'spur', t: 2}, {a: 4, b: 8, v: 'matrix'}]);
await step('teilLoeschen', () => { const b0 = JSON.stringify(S.song); markAction(S.song.marks.find(m => m.name === 'Refrain').id, 'delete'); const d = SYNQUENZER.vvDirGet(); undo(); const eq = JSON.stringify(S.song) === b0; return {dir: d, undoEq: eq}; }, null);
await step('auto', () => { const b0 = JSON.stringify(S.song); SYNQUENZER.vvDirSet(8, 16, 'auto'); const d = SYNQUENZER.vvDirGet(); undo(); const eq = JSON.stringify(S.song) === b0; return {dir: d, undoEq: eq}; }, null);
// save → load (the file string and the browser store)
res.speichernLaden = await p.evaluate(() => { const s1 = serialize(), d0 = SYNQUENZER.vvDirGet(); applyProject(normalizeProject(projFromFile(JSON.parse(s1))), {}); const d1 = SYNQUENZER.vvDirGet(); return {d0, d1, gleich: JSON.stringify(d0) === JSON.stringify(d1) && serialize().replace(/"sum":"[0-9a-f]+"/g, '').replace(/"id":"p-[a-z0-9-]+"/g, '') === s1.replace(/"sum":"[0-9a-f]+"/g, '').replace(/"id":"p-[a-z0-9-]+"/g, ''), inDatei: /"video":\[/.test(s1)}; });
res.speichernLaden.ok = res.speichernLaden.gleich && res.speichernLaden.inDatei;
await p.evaluate(() => SYNQUENZER.save()); await p.waitForTimeout(1500);
console.log(JSON.stringify(res)); const P0 = await p.evaluate(() => (S.song || {}).video); await p.reload(); await p.waitForTimeout(2500);
const P1 = await p.evaluate(() => (S.song || {}).video);
res.neuLaden = {P0, P1, ok: JSON.stringify(P0) === JSON.stringify(P1) && !!P1};
res.ok = Object.values(res).every(x => x.ok);
console.log(JSON.stringify(res, null, 1)); console.log('errors', errs);
fs.writeFileSync('n5-v-out/vv2-02.json', JSON.stringify(res, null, 1));
await b.close();
