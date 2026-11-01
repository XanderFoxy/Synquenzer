import {open, ok, APP, BASE} from './lib.mjs';
const id = process.argv[2] || 'f-nass-quietsch';
const PH = [[0, 'on', 48, .8], [.25, 'on', 60, .5], [.3, 'on', 64, 1], [.6, 'off', 48], [.7, 'off', 60], [.8, 'on', 67, .7], [1.1, 'off', 64], [1.2, 'off', 67]];
for (const f of [BASE, BASE, APP, APP]) { const {b, p} = await open(f);
  const r = await p.evaluate(async ([PH, id]) => { const fnv = a => { let h = 2166136261 >>> 0; const u = new Uint32Array(a.buffer); for (let i = 0; i < u.length; i++) { h ^= u[i]; h = Math.imul(h, 16777619) >>> 0; } return h.toString(16); };
    const f = FACTORY.find(x => x.id === id); const x = await mkRender(f, PH, {sec: 1.6, seed: 1}); return fnv(x.l) + ' ' + JSON.stringify((f.mods||[]).map(m=>m.src+'>'+m.dst)) + ' ' + f.p.l1shape + ' ' + f.p.l2shape; }, [PH, id]);
  console.log(f.split('/').pop(), r); await b.close(); }
