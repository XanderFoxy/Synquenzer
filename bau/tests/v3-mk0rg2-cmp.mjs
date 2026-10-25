import fs from 'fs'; import { OUT } from './v3-mk0rg2-lib.mjs';
const [pre, ...vps] = process.argv.slice(2);
for (const vp of vps) { const A = JSON.parse(fs.readFileSync(OUT + `${pre}-base-${vp}.json`)), B = JSON.parse(fs.readFileSync(OUT + `${pre}-new-${vp}.json`));
  for (const k of Object.keys(Object.assign({}, A, B))) { const a = JSON.stringify(A[k]), b = JSON.stringify(B[k]); console.log(vp, k, a === b ? 'same' : 'DIFF', (b || '').slice(0, 500), a === b ? '' : '\n      base ' + (a || '').slice(0, 500)); } }
