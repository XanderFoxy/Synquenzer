// QA MK1: which paths report an id as ended twice (or while it still sounds)?
import {makeScope, mkPatch} from './v3-mk1-node.mjs';
const SR = 48000;
function run(name, over, evs, sets) {
  const {G, procs} = makeScope(SR);
  const P = new procs['dirigent-analog']({processorOptions: {patch: {eng: 3}, mods: [], mk: mkPatch(over)}});
  P.onMsg({tempo: {bpm: 120, start: null}}); P.onMsg({mkSeed: 1});
  P.onMsg({ev: evs});
  const L = new Float32Array(128), R = new Float32Array(128); const log = []; const cnt = {};
  const sets_ = (sets || []).slice();
  for (let f = 0; f < SR * 3; f += 128) {
    while (sets_.length && sets_[0][0] * SR <= f) P.onMsg(sets_.shift()[1]);
    G.currentFrame = f; P.__msgs = []; P.process([], [[L, R]]);
    for (const m of P.__msgs) if (m.end) for (const id of m.end) { cnt[id] = (cnt[id] || 0) + 1; const sounding = P.mk.V.some(v => v.on && !v.ghost && v.id === id && v.gate); const held = P.mk.keys.some(k => k.id === id); log.push(`t=${(f / SR).toFixed(3)} end ${id}${sounding ? ' (STILL GATED VOICE)' : ''}${held ? ' (KEY STILL HELD)' : ''}`); }
  }
  const dup = Object.entries(cnt).filter(([, c]) => c > 1).map(([k]) => k);
  console.log(name + ': ' + (dup.length ? 'DUPLICATE end for ' + dup.join(',') : 'ok') + '\n   ' + log.join('\n   '));
}
// mono, last priority: A held, B legato, B released (back to A), A released
run('Mono legato A-B-(B up)-(A up)', {asg: 0}, [[0, 1, 1, 60, .8, -1], [.3, 1, 2, 64, .8, -1], [.6, 2, 2], [.9, 2, 1]]);
// mono: A, A up, B (not legato)
run('Mono A up then B', {asg: 0}, [[0, 1, 1, 60, .8, -1], [.3, 2, 1], [.35, 1, 2, 64, .8, -1], [.7, 2, 2]]);
// mono: A up during release then B pressed (line voice reused)
run('Mono A, A up, B within release', {asg: 0, e2: {r: 60}}, [[0, 1, 1, 60, .8, -1], [.3, 2, 1], [.4, 1, 2, 64, .8, -1], [.7, 2, 2]]);
run('Unison A, A up, B within release', {asg: 2, e2: {r: 60}}, [[0, 1, 1, 60, .8, -1], [.3, 2, 1], [.4, 1, 2, 64, .8, -1], [.7, 2, 2]]);
run('Mono Low prio: A low held, B high pressed+released', {asg: 0, prio: 1}, [[0, 1, 1, 60, .8, -1], [.3, 1, 2, 64, .8, -1], [.6, 2, 2], [.9, 2, 1]]);
run('Poly 5 keys low prio, waiting key released', {asg: 1, prio: 1}, [[0, 1, 1, 60, .8, -1], [0, 1, 2, 62, .8, -1], [0, 1, 3, 64, .8, -1], [0, 1, 4, 65, .8, -1], [.1, 1, 5, 67, .8, -1], [.3, 2, 5], [.6, 2, 1], [.6, 2, 2], [.6, 2, 3], [.6, 2, 4]]);
run('Poly same note again in release', {asg: 1, e2: {r: 60}}, [[0, 1, 1, 60, .8, -1], [.2, 2, 1], [.3, 1, 2, 60, .8, -1], [.6, 2, 2]]);
run('Assign Poly->Mono at 3 held keys', {asg: 1}, [[0, 1, 1, 60, .8, -1], [0, 1, 2, 64, .8, -1], [0, 1, 3, 67, .8, -1], [1, 2, 1], [1.2, 2, 2], [1.4, 2, 3]], [[.5, {mkSet: {'t.0.asg': 0}}]]);
run('Assign Mono->Poly at 3 held keys', {asg: 0}, [[0, 1, 1, 60, .8, -1], [0, 1, 2, 64, .8, -1], [0, 1, 3, 67, .8, -1], [1, 2, 1], [1.2, 2, 2], [1.4, 2, 3]], [[.5, {mkSet: {'t.0.asg': 1}}]]);
