import {launch} from './n5-k-blib.mjs';
const {b, p, errs} = await launch({});
const r = await p.evaluate(async () => {
  const out = [];
  for (const [id, f] of FACTORY_BY_ID) if (f.engine === 'wt') { loadPreset(2, id); const s = sndOf(2);
    out.push({id, name: s.name, routes: s.mods.map(m => m.src + '→' + m.dst + (nativeRoute(m) ? '' : ' (gestrichelt)')), list: SYNQUENZER.k1Mods(2).map(e => e.src + ' → ' + e.dst)}); }
  // a WT sound with a non-native route (Anschlag → Cutoff): listed? hatched in MOD?
  loadPreset(2, 'f-init-tabelle'); const s = SYNQUENZER.getSound(2); s.mods = [{src: 'vel', dst: 'cutoff', amt: .5}]; SYNQUENZER.setSound(2, s);
  out.push({probe: 'INIT Tabelle + Anschlag → Cutoff', list: SYNQUENZER.k1Mods(2).map(e => e.src + ' → ' + e.dst + ' [' + e.amt + ']'), native: nativeRoute(s.mods[0])});
  return out;
});
for (const o of r) console.log(JSON.stringify(o)); console.log('errs', errs);
await b.close();
