// QA K1-03 „INIT/neues Projekt ohne Modulation, 0 Cent“: the new project „Neu ▾ → Mit Startsounds“ (newProject() without init):
// entries in the Mod-Übersicht per synth track and the pitch of a held A3 (sound reduced to a sine on osc 1, routes/drift kept)
import {launch, seedWorklet, renderIn, freqZC} from './n5-k-blib.mjs';
const {b, p, errs} = await launch({init: false});
await seedWorklet(p);
await p.evaluate(() => SYNQUENZER.newProject());
await p.waitForTimeout(400);
const tr = await p.evaluate(() => S.tracks.map((t, i) => t.kind === 'synth' ? {i, name: t.sound.name, eng: t.sound.engine, mods: SYNQUENZER.k1Mods(i).map(e => e.src + ' → ' + e.dst + ' [' + e.amt + ']'), s: deep(t.sound), selT: R.selT} : null).filter(Boolean));
const sr = 48000;
for (const t of tr) {
  if (t.eng !== 'analog') { console.log(JSON.stringify({track: t.i, name: t.name, eng: t.eng, entries: t.mods.length})); continue; }
  const s = JSON.parse(JSON.stringify(t.s)); Object.assign(s.p, {o1w: 3, o1uni: 1, o2lvl: 0, o3lvl: 0, subLvl: 0, noise: 0, ftype: 0, cutoff: 20000, res: 0, drive: 0, o1oct: 0, o1semi: 0, o1fine: 0, mode: 0, glide: 0, aA: .002, aS: 1});
  s.fx = {drive: 0, chorus: {mode: 'off', mix: 0, rate: 1, depth: 1}, rev: 0, dly: 0, vol: .8, pan: 0};
  // one held note 2.4 s, windows of 40 ms
  const x = await renderIn(p, s, [[0, 'on', 57, .8, 'h'], [2.4, 'off', 57, .8, 'h']], {sec: 2.5, seed: 1});
  const ct = []; for (let k = 0; k < 22; k++) { const i0 = Math.round((.2 + k * .1) * sr); const f = freqZC(x, sr, i0, i0 + Math.round(.04 * sr)); ct.push(1200 * Math.log2(f / 220)); }
  // 8 short notes: the per-note offset (drift)
  const ev = []; for (let k = 0; k < 8; k++) ev.push([k * .3, 'on', 57, .8, 'n' + k], [k * .3 + .27, 'off', 57, .8, 'n' + k]);
  const y = await renderIn(p, s, ev, {sec: 2.6, seed: 1});
  const dn = []; for (let k = 0; k < 8; k++) { const f = freqZC(y, sr, Math.round((k * .3 + .12) * sr), Math.round((k * .3 + .26) * sr)); dn.push(+(1200 * Math.log2(f / 220)).toFixed(2)); }
  console.log(JSON.stringify({track: t.i, name: t.name, selected: t.selT === t.i, entries: t.mods, heldNoteCents: [+Math.min(...ct).toFixed(2), +Math.max(...ct).toFixed(2)], perNoteCents: dn}));
}
console.log('errs', errs);
await b.close();
