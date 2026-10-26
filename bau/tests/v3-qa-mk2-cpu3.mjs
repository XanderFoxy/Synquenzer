// CPU by register: 4 voices in a low chord (C2-C3) / mid / high, stored single wave vs saw (INIT base), own process per run
import {execFileSync} from 'child_process';
const FILE = new URL('../mk-wt/index.html', import.meta.url).pathname;
if (process.argv[2] === 'one') {
  process.env.MK_FILE = FILE;
  const {renderW, mkPatch} = await import('./v3-mk2-node.mjs');
  const w = process.argv[3], notes = JSON.parse(process.argv[4]);
  const p = w === 'saw' ? {o1: {w: 0}} : {o1: {w: 5, c2: 2 * (+w) - 2}}, ns = w === 'saw' ? [] : [+w];
  const ev = []; for (let t = 0; t < 24; t += .5) for (const nt of notes) { ev.push([t, 'on', nt, .8]); ev.push([t + .45, 'off', nt]); }
  const q = renderW(mkPatch(p), ev, {sec: 24, quantumMs: true}, ns).qms, per = 375, win = [];
  for (let s = 4; s < 24; s++) win.push(q.slice(s * per, (s + 1) * per).reduce((a, b) => a + b, 0));
  win.sort((a, b) => a - b); console.log(win[Math.floor(win.length / 4)].toFixed(4)); process.exit(0);
}
const run = (w, notes) => +execFileSync(process.execPath, [new URL(import.meta.url).pathname, 'one', w, JSON.stringify(notes)], {encoding: 'utf8'}).trim();
for (const [name, notes] of [['low C2-C3', [36, 40, 43, 48]], ['mid C4-C5', [60, 64, 67, 72]], ['high C6', [84, 88, 91, 96]]]) for (const w of ['12', '23']) {
  const r = []; for (let i = 0; i < 5; i++) { const a = run('saw', notes), c = run(w, notes); r.push(c / a); } r.sort((x, y) => x - y);
  console.log(name, 'wave', w, 'median ratio', r[2].toFixed(3), 'all', r.map(x => x.toFixed(3)).join(' '));
}
