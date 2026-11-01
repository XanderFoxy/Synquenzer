// HARM: Eingrenzung des Bezug-Fehlers über alle Snapshots (auch ältere als R-4*): C-Dur-Lauf mit langem chromatischem
// Durchgang F → F♯ → G; nach der Tonart-Analyse: Bezug des Clips und wie C D E F F♯ G A unter E-Dur klingen (Eine Skala an)
import fs from 'fs';
import path from 'path';
import { open, ROOT } from './lib.mjs';
const files = process.argv.slice(2).map(f => path.resolve(f));
const out = [];
const one = async f => {
  const {b, p, errs} = await open(f);
  const r = await p.evaluate(async () => {
    const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); Q.newProject({init: true});
    if (Q.setHarmony) Q.setHarmony({oneScale: true});
    Q.setClip(0, 0, {len: 1, key: {root: 0, scale: 'ionian'}, notes: [{t: 0, d: .4, n: 60, v: .8}, {t: .5, d: .4, n: 62, v: .8}, {t: 1, d: .4, n: 64, v: .8}, {t: 1.5, d: .4, n: 65, v: .8}, {t: 2, d: .9, n: 66, v: .8}, {t: 3, d: .4, n: 67, v: .8}, {t: 3.5, d: .4, n: 69, v: .8}]});
    await sl(800); try { applySceneKeys(0); } catch (e) {}
    const c = S.tracks[0].clips[0]; ensureAudio(); T.recall(Q.parseChord('E'), nowT(), grid());
    const outs = [60, 62, 64, 65, 66, 67, 69].map(n => Q.outPitch(0, n, nowT(), c.key));
    return {v: Q.version, key: c.key.scale, outs: outs.join(',')};
  }).catch(e => ({v: '?', err: String(e).slice(0, 80)}));
  await b.close(); return {f: path.relative(ROOT, f), ...r};
};
for (let i = 0; i < files.length; i += 4) out.push(...await Promise.all(files.slice(i, i + 4).map(one)));
for (const r of out) console.log(`| ${r.v} | ${r.f} | ${r.key || r.err} | ${r.outs || ''} |`);
