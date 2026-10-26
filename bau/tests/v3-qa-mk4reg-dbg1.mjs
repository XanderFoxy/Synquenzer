import { open, APP } from './v3-qa-mk4reg-pw.mjs';
import fs from 'fs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/MK2.html';
const old = fs.readFileSync('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-mk4reg/mk2-project.json', 'utf8');
for (const f of [BASE, APP]) {
  const {b, p, errs} = await open({width: 390, height: 844}, f);
  const r = await p.evaluate(async old => { const Q = window.SYNQUENZER; const ok = Q.importJSON(old); await new Promise(r => setTimeout(r, 500)); const g = Q.getSound(0); return {ok, eng: g.engine, name: g.name, hasMk: !!g.p.mk, keys: Object.keys(g.p).slice(-8), proj: Q.project().name, n: Q.project().tracks.length}; }, old);
  console.log(f.split('/').slice(-2).join('/'), JSON.stringify(r), errs);
  await b.close();
}
