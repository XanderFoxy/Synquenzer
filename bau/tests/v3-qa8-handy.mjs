import {launch, open} from './v3-qa8-lib.mjs';
import fs from 'fs';
const MESS = fs.readFileSync('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-mk8-mess.js', 'utf8');
const b = await launch(); const {page: p} = await open(b, 'P1');
await p.evaluate(MESS);
const r = await p.evaluate(async () => { mkLoad(); await MKF.decodeAll(); const o = [];
  for (let bk = 1; bk <= 8; bk++) for (let s = 1; s <= 16; s++) { if (MKF.roleOf(bk, s)[0] !== 'bass') continue; const snd = factorySound(MKF.facRec(bk, s).id);
    for (const seed of [2, 3]) { const q = await SYNQUENZER.mkRender(snd, [[0, 'on', 36, .8], [.6, 'off', 36]], {sec: .7, seed}); o.push([MKF.label(bk, s), seed, +MK8M.handyRel(q.l).toFixed(1)]); } }
  return o; });
const bad = r.filter(x => x[2] < -20);
console.log('basses', r.length / 2, 'min HANDYrel', Math.min(...r.map(x => x[2])), 'below −20:', JSON.stringify(bad));
await b.close();
