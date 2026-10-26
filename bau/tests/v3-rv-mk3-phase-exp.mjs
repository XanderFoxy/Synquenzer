// verifier experiment: same 16 x C4 Schicht test on the original and on a copy with a timbre-independent start phase
import {render, mkDefaults} from './v3-mk1-node.mjs';
import {db, rms} from './v3-mk1-ana.mjs';
const SR = 48000, ORIG = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK3/index.html', EXP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/rv-mk3-phase-exp/index.html';
const prog = (mode, o1) => { const p = mkDefaults(); p.mode = mode; for (const t of p.t) Object.assign(t.o1, o1); return p; };
for (const file of [ORIG, EXP]) for (const [lab, o1] of [['Sinus', {w: 3, c1: 0}], ['Saege', {w: 0}]]) {
  const L1 = db(rms(render(prog(0, o1), [[0, 'on', 60, .8]], {file, sec: .5, seed: 5}).l, 4800, 24000));
  const ev = []; for (let k = 0; k < 16; k++) ev.push([k * .3, 'on', 60, .8], [k * .3 + .25, 'off', 60]);
  const r = render(prog(1, o1), ev, {file, sec: 4.9, seed: 5});
  const lv = []; for (let k = 0; k < 16; k++) lv.push(db(rms(r.l, Math.round((k * .3 + .05) * SR), Math.round((k * .3 + .2) * SR))) - L1);
  console.log((file === ORIG ? 'ORIGINAL ' : 'EXPERIMENT ') + lab + ': ' + lv.map(x => x.toFixed(1)).join(' ') + ' | min ' + Math.min(...lv).toFixed(1) + ' max ' + Math.max(...lv).toFixed(1));
}
