import {render, mkDefaults} from './v3-mk1-node.mjs';
import {mKlick} from './v3-mk1-ana.mjs';
const FILE = process.env.MK_FILE, SR = 48000, M = x => Math.round(x * 100) / 100;
const prog = (top, fx) => { const p = mkDefaults(); if (fx) { p.mfx = {type: 1, spd: 64, dep: 80}; p.dly = {type: 0, sync: 0, time: 70, note: 8, dep: 90}; p.eq = {lf: 320, lg: 3, hf: 6000, hg: -3}; }
  p.t[0].o1.w = 2; p.t[0].f.cut = 100; p.t[1].o1.w = 1; p.t[1].o1.c1 = 40; p.t[1].f.cut = 90; p.t[1].trans = 12; p.t[1].a.lvl = 110; Object.assign(p, top); return p; };
const chord = [[0, 'on', 57, .8], [0, 'on', 61, .8], [0, 'on', 64, .8]];
for (const fx of [false, true]) for (const seed of [1, 2, 3]) {
  const x = render(prog({mode: 0}, fx), chord, {file: FILE, sec: 1.2, seed, at: [[.5, {mkSet: {mode: 1}}]]});
  const y = render(prog({mode: 0}, fx), chord, {file: FILE, sec: 1.2, seed});
  const kx = [mKlick(x.l, SR, [0]), mKlick(x.r, SR, [0])], ky = [mKlick(y.l, SR, [0]), mKlick(y.r, SR, [0])];
  console.log('fx', fx, 'seed', seed, 'switch L/R', kx.map(k => M(k.worst) + '@' + M(k.at)).join(' '), '| no switch', ky.map(k => M(k.worst) + '@' + M(k.at)).join(' '));
}
