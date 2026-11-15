import {execFileSync} from 'child_process';
for (const v of JSON.parse(process.argv[2])) { const run = h => execFileSync('node', ['-e', `globalThis.__PF=${JSON.stringify(v)};import('./${h}')`, 'x', 'core-sw.js'], {encoding: 'utf8'}).trim().split('\n');
  const a = run('hk.mjs').pop().replace('SUMME ', '').replace(/"gef":10,"fp":0,|,"same":true|"n":1[35],/g, ''), b = run('hd.mjs').filter(l => l.startsWith('HD')).pop(); console.log(JSON.stringify(v), a, b); }
