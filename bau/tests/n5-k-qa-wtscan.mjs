// QA K1: WT factory sounds with Scan (the wave position sweeps on every note): audible live? and the Mod-Übersicht rows
import {launch} from './n5-k-blib.mjs';
const {b, p, errs} = await launch();
const cap = (t, ms) => p.evaluate(([t, ms]) => new Promise(r => { const c = AU.ctx, n = AU.tracks[t] && (AU.tracks[t].trackIn || AU.tracks[t].vol) || AU.synth[t].node; const an = c.createAnalyser(); an.fftSize = 4096; an.smoothingTimeConstant = 0; n.connect(an); const f = new Float32Array(an.frequencyBinCount); const cents = [];
  const iv = setInterval(() => { an.getFloatFrequencyData(f); let s = 0, sw = 0; for (let i = 1; i < f.length; i++) { const pw = Math.pow(10, f[i] / 10); s += pw; sw += pw * i; } cents.push(Math.round(sw / (s + 1e-30) * c.sampleRate / an.fftSize)); }, 50);
  setTimeout(() => { clearInterval(iv); try { n.disconnect(an); } catch (e) {} r(cents); }, ms); }), [t, ms]);
for (const id of ['f-wt-glas', 'f-wt-vokal', 'f-wt-orgel']) {
  const out = {};
  for (const scan of ['stored', 0]) {
    await p.evaluate(([id, scan]) => { const A = SYNQUENZER; A.setEngine(1, 'wt'); loadPreset(1, id); if (scan === 0) { const s = A.getSound(1); s.p.wt.scan = 0; A.setSound(1, s); } A.selectTrack(1); }, [id, scan]); await p.waitForTimeout(400);
    await p.evaluate(() => SYNQUENZER.keyOn(57, .8)); const c = await cap(1, 2000); await p.evaluate(() => SYNQUENZER.keyOff(57)); await p.waitForTimeout(1500);
    const L = c.slice(4); out[scan] = {min: Math.min(...L), max: Math.max(...L)};
  }
  const list = await p.evaluate(id => { loadPreset(1, id); const s = SYNQUENZER.getSound(1); return [s.p.wt.scan, s.p.wt.scanTime, SYNQUENZER.k1Mods(1).map(e => e.src + ' → ' + e.dst)]; }, id);
  console.log(id, 'scan/time', list[0], list[1], 'centroid Hz over the held note: with scan', JSON.stringify(out.stored), 'scan 0', JSON.stringify(out[0]), 'rows', JSON.stringify(list[2]));
}
console.log('errors', JSON.stringify(errs.slice(0, 3)));
await b.close();
