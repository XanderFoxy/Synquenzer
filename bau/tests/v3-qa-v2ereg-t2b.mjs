import { open, APP } from './v3-v2d-pw.mjs';
import fs from 'fs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/V2d′-fix.html';
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2ereg/';
const file = fs.readFileSync(D + 't2-base-project.json', 'utf8');
for (const [name, f] of [['base', BASE], ['new', APP]]) {
  const {b, p, errs} = await open({width: 390, height: 844}, f);
  const r = await p.evaluate(async t => { const Q = window.SYNQUENZER; Q.importJSON(t); const s1 = Q.serialize(); await Q.newProject({init: true}); Q.importJSON(s1); const s2 = Q.serialize();
    const diffs = []; const walk = (a, b, path) => { if (diffs.length > 20) return; if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') { if (JSON.stringify(a) !== JSON.stringify(b)) diffs.push(path + ': ' + JSON.stringify(a).slice(0, 80) + ' → ' + JSON.stringify(b).slice(0, 80)); return; }
      for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) walk(a[k], b[k], path + '.' + k); };
    walk(JSON.parse(s1), JSON.parse(s2), ''); return diffs; }, file);
  console.log(name, JSON.stringify(r, null, 1), errs);
  await b.close();
}
