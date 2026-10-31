import {launch} from './n5-k-blib.mjs';
const {b, p, errs} = await launch({});
const r = await p.evaluate(async () => {
  const out = {api: Object.keys(SYNQUENZER).length};
  const list = () => S.tracks.map((t, i) => t.kind === 'synth' ? [i, t.sound.name, t.sound.engine, SYNQUENZER.k1Mods(i).map(e => e.src + ' → ' + e.dst + ' [' + e.amt + ']')] : [i, t.kind, t.sound && t.sound.name]);
  out.init = list();
  applyProject(newProject(null), {}); await new Promise(r => setTimeout(r, 300));
  out.std = list();
  // INIT of each engine via initSound
  const t = 0; out.inits = {};
  for (const id of ['f-init-analog', 'f-init-fm', 'f-init-tabelle', 'f-init-am']) {
    if (id === 'f-init-am') { mkLoad(); for (let k = 0; k < 60 && !mkLoaded(); k++) await new Promise(r => setTimeout(r, 100)); }
    loadPreset(t, id); initSound(t); out.inits[id] = [sndOf(t).name, sndOf(t).engine, SYNQUENZER.k1Mods(t).map(e => e.src + ' → ' + e.dst + ' [' + e.amt + ']'), JSON.stringify(sndOf(t).p).slice(0, 400)];
  }
  return out;
});
console.log(JSON.stringify(r, null, 1)); console.log('errs', errs);
await b.close();
