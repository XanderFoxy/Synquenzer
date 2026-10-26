// Independent repro of MK2-09 (octave-table waves vs saw): own Node process per case, interleaved pairs; three metrics
import {execFileSync} from 'child_process';
const FILE = new URL('../mk-wt/index.html', import.meta.url).pathname;
if (process.argv[2] === 'one') {
  process.env.MK_FILE = FILE;
  const {renderW, mkPatch, mktab} = await import('./v3-mk2-node.mjs');
  const w = +process.argv[3], base = process.argv[4], sec = +process.argv[5] || 20;
  const B = base === 'full' ? {mix: {o1: 127, o2: 64}, o2: {w: 1, semi: 7}, f: {type: 0, cut: 80, res: 60, eg: 30}} : {};
  const p = JSON.parse(JSON.stringify(B)); p.o1 = w === 0 ? {w: 0} : {w: 5, c2: 2 * w - 2};
  if (w && process.argv[6] === 'chk') { const T = mktab(); const x = T.wave(w); console.error('wave', w, 'oct', x.o, 'r', x.r); }
  const ev = []; for (let t = 0; t < sec; t += .5) for (const nt of [48, 55, 60, 64]) { ev.push([t, 'on', nt, .8]); ev.push([t + .45, 'off', nt]); }
  const t0 = performance.now(); const R = renderW(mkPatch(p), ev, {sec, quantumMs: true}, w ? [w] : []); const tot = performance.now() - t0;
  const q = R.qms, per = 375, win = []; for (let s = 4; s < sec; s++) win.push(q.slice(s * per, (s + 1) * per).reduce((a, b) => a + b, 0));
  win.sort((a, b) => a - b); const qs = q.slice(4 * per).sort((a, b) => a - b);
  let rms = 0; for (let i = 0; i < R.l.length; i++) rms += R.l[i] * R.l[i];
  console.log(JSON.stringify({q25: win[win.length >> 2], wmed: win[win.length >> 1], qmed: qs[qs.length >> 1] * 375, rms: Math.sqrt(rms / R.l.length)}));
  process.exit(0);
}
const run = (w, b) => JSON.parse(execFileSync(process.execPath, [new URL(import.meta.url).pathname, 'one', String(w), b, '20'], {encoding: 'utf8'}).trim().split('\n').pop());
const med = a => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; };
const waves = (process.argv[2] || '61,35,62,63,64,23,12').split(',').map(Number), bases = (process.argv[3] || 'init,full').split(','), P = +process.argv[4] || 7;
for (const b of bases) for (const w of waves) {
  const r = {q25: [], wmed: [], qmed: []}; let rms;
  for (let i = 0; i < P; i++) { const a = run(0, b), c = run(w, b); for (const k in r) r[k].push(c[k] / a[k]); rms = [a.rms, c.rms]; }
  console.log(b, 'wave', w, Object.entries(r).map(([k, v]) => k + ' ' + med(v).toFixed(3) + ' [' + Math.min(...v).toFixed(3) + '-' + Math.max(...v).toFixed(3) + ']').join(' | '), 'rms saw/wave', rms.map(x => x.toFixed(3)).join('/'));
}
