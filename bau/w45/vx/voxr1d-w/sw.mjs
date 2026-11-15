import {execFileSync} from 'child_process';
for (const v of JSON.parse(process.argv[2])) { const out = execFileSync('node', ['-e', `globalThis.__PF=${JSON.stringify(v)};import('./hk.mjs')`, 'x', 'core-sw.js'], {env: {...process.env}, encoding: 'utf8'}); const L = out.trim().split('\n').pop(); console.log(JSON.stringify(v), L.replace('SUMME ', '')); }
