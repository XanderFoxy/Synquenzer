// QA K1: new project [Leer (Init)] and engine switches: the Mod-Übersicht stays empty (0 cent)?
import {launch} from './n5-k-blib.mjs';
const {b, p, errs} = await launch();
const r = await p.evaluate(async () => {
  const A = SYNQUENZER, out = {};
  mkLoad(); for (let i = 0; i < 80 && !mkLoaded(); i++) await new Promise(r => setTimeout(r, 100));
  A.newProject({init: true});
  out.tracks = A.tracks().map((t, i) => [t.name, A.getSound(i).engine, A.getSound(i).name, A.k1Mods(i).length]);
  const L = i => A.k1Mods(i).map(e => e.src + ' → ' + e.dst + ' ' + e.amt);
  for (const [i, path] of [[0, ['fm', 'va']], [1, ['wt', 'va']], [2, ['mk', 'va']], [3, ['fm']], [5, ['wt']]]) {
    const seq = []; for (const e of path) { A.setEngine(i, e); seq.push([e, A.getSound(i).name, L(i), A.getSound(i).p.analog, A.getSound(i).p.o2fine]); } out['sw' + i] = seq;
  }
  return out;
});
for (const k in r) console.log(k, JSON.stringify(r[k]));
console.log('errors', JSON.stringify(errs.slice(0, 4)));
await b.close();
