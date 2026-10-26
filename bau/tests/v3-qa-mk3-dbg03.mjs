import {render, mkDefaults} from './v3-mk1-node.mjs';
import {db, rms} from './v3-mk1-ana.mjs';
const NEW = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK3/index.html';
const C = x => JSON.parse(JSON.stringify(x));
const EVS = [[0, 'on', 48, .8], [.05, 'on', 55, .7], [.1, 'on', 60, .9], [.15, 'on', 64, .6], [.2, 'on', 67, .8], [.45, 'off', 48], [.5, 'on', 72, 1], [.6, 'off', 55], [.7, 'off', 60], [.8, 'on', 43, .5], [.9, 'off', 64], [1.0, 'off', 67], [1.1, 'off', 72], [1.2, 'off', 43]];
const md = (x, y) => { let m = 0, at = 0; for (let i = 0; i < x.l.length; i++) { const e = Math.max(Math.abs(x.l[i] - y.l[i]), Math.abs(x.r[i] - y.r[i])); if (e > m) { m = e; at = i; } } return m.toExponential(2) + ' @' + (at / 48000).toFixed(3) + 's'; };
const P0 = [{s: 0, d: 0, i: 0}, {s: 2, d: 4, i: 0}, {s: 3, d: 0, i: 0}, {s: 4, d: 5, i: 0}];
function run(lab, a2, p2, ev) {
  const mk = lvl => { const p = mkDefaults(); p.mode = 1; p.tv = 1; p.t[0].p = C(P0); p.t[1].p = C(p2 || P0); Object.assign(p.t[1].a, a2, lvl != null ? {lvl} : {}); return p; };
  const A = render(mk(0), ev || EVS, {file: NEW, sec: 1.6, seed: 14}), B = render(mk(null), ev || EVS, {file: NEW, sec: 1.6, seed: 14, at: [[0, {mkSolo: 1}]]});
  const S = render((() => { const p = mkDefaults(); p.t[0].p = C(P0); return p; })(), ev || EVS, {file: NEW, sec: 1.6, seed: 14});
  console.log(lab.padEnd(44), 'T2 lvl0 vs solo1:', md(A, B), ' | Single(T1) vs solo1:', md(S, B), ' | Single vs T2lvl0:', md(S, A));
}
run('T2 a only (lvl85 pan61 gate1 dist1 vel-3 kbd-60)', {lvl: 85, pan: 61, gate: 1, dist: 1, vel: -3, kbd: -60});
run('T2 lvl 85 only', {lvl: 85});
run('T2 a.kbd -60 only', {lvl: 85, kbd: -60});
run('T2 a.gate 1 only', {lvl: 85, gate: 1});
run('T2 a.dist 1 only', {lvl: 85, dist: 1});
run('T2 INIT (lvl 127)', {});
run('T2 INIT, 2 notes only', {}, null, [[0, 'on', 48, .8], [.05, 'on', 55, .7], [.6, 'off', 48], [.7, 'off', 55]]);
run('T2 INIT, 3 notes (T1 steals)', {}, null, [[0, 'on', 48, .8], [.05, 'on', 55, .7], [.1, 'on', 60, .7], [.6, 'off', 48], [.7, 'off', 55], [.8, 'off', 60]]);
{
  const PP = [{s: 5, d: 1, i: 3}, {s: 6, d: 4, i: 56}, {s: 5, d: 5, i: -48}, {s: 4, d: 2, i: -2}];
  for (const [lab, pp] of [['all 4', PP], ['amp only', [P0[0], P0[1], PP[2], P0[3]]], ['no amp', [PP[0], PP[1], P0[2], PP[3]]]]) {
    const p = mkDefaults(); p.mode = 1; p.tv = 1; p.t[0].p = C(P0); p.t[0].a.lvl = 0; p.t[1].p = C(pp); p.t[1].a.lvl = 0;
    const r = render(p, EVS, {file: NEW, sec: 1.6, seed: 14}); console.log('both PEGEL 0, T2 patches', lab, 'level', db(rms(r.l) + rms(r.r)).toFixed(1), 'dB');
    run('T2 patches ' + lab, {lvl: 85}, pp);
  }
}
