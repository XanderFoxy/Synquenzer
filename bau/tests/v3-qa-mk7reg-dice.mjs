// QA MK7 regression: 🎲 with a seeded Math.random: the same 150 rolls in base and new, offline level of each (MK1-31 flake check)
import { open, APP } from './v3-qa-mk7reg-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk6-base-4.12.0.html';
const out = {};
for (const [name, file] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open({width: 844, height: 390}, file);
  out[name] = await p.evaluate(async () => { let seed = 4242; Math.random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const Q = SYNQUENZER; Q.newProject({init: true}); Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.openEditor(); await new Promise(r => setTimeout(r, 500));
    const lv = [];
    for (let k = 0; k < 150; k++) { Q.randomize(0); const s = JSON.parse(JSON.stringify(Q.getSound(0))); const x = (await Q.mkRender(s, [[0, 'on', 48, .8], [1, 'off', 48]], {sec: 1.6})).l; let e = 0; for (let i = 0; i < x.length; i++) e += x[i] * x[i]; lv.push(+(10 * Math.log10(e / x.length + 1e-20)).toFixed(2)); }
    return lv; });
  out[name + 'Errs'] = errs; await b.close();
}
const sil = a => a.map((v, k) => v < -60 ? k + ':' + v : null).filter(Boolean);
console.log('same levels', JSON.stringify(out.base) === JSON.stringify(out.new), 'silent base', sil(out.base), 'silent new', sil(out.new), 'errs', JSON.stringify(out.baseErrs), JSON.stringify(out.newErrs));
