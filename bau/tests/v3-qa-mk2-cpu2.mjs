import {execFileSync} from 'child_process';
const S = new URL('./v3-qa-mk2-cpu.mjs', import.meta.url).pathname, FILE = new URL('../mk-wt/index.html', import.meta.url).pathname;
const run = (k, b) => +execFileSync(process.execPath, [S, 'one', k, b, FILE], {encoding: 'utf8'}).trim().split('\n').pop();
for (const b of ['full', 'init']) for (const k of ['tab34', 'tab23', 'oct61']) { const r = []; for (let i = 0; i < 7; i++) { const a = run('saw', b), c = run(k, b); r.push(c / a); } r.sort((x, y) => x - y); console.log(b, k, 'median', r[3].toFixed(3), 'all', r.map(x => x.toFixed(3)).join(' ')); }
