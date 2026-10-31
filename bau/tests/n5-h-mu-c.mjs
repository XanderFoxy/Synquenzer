// musiker C: jede Undo-Art als einzelne Geste NACH einer Pause (wie ein Musiker: denken, dann tippen) → wie viele Ereignisse?
import {open, sleep, OUT, summ} from './n5-h-mu-lib.mjs';
import {installGestures} from './n5-h-lib.mjs';
const PAUSE = +(process.argv[2] || 4500);
const T = await open({vp: [390, 844]});
const {p, E} = T;
await installGestures(p);
await E(() => window.__setup());
await sleep(3000); await T.drain();
let n0 = await T.evN();
const names = ['clip', 'clipDel', 'sound', 'fx', 'set', 'part', 'kit', 'song', 'songChord', 'track', 'group', 'own', 'mkin', 'tflag', 'takesGroup', 'takes', 'mkslot'];
const bad = [];
for (const g of names) {
  await sleep(PAUSE);
  const u0 = await E(() => SYNQUENZER.undoInfo().n);
  await E(async g => { await window.__G[g](); }, g);
  await sleep(2800); await T.drain(); await sleep(50);
  const evs = await T.evSince(n0); n0 += evs.length;
  const u1 = await E(() => SYNQUENZER.undoInfo().n);
  const data = evs.filter(e => e.u !== 'ctx');
  const okk = data.length === 1 && data[0].u !== 'proj';
  if (!okk) bad.push(g);
  console.log(`${okk ? 'OK  ' : 'BAD '} ${g} (undo +${u1 - u0}) → ${summ(evs).join(' ; ')}`);
}
console.log('BAD:', bad.join(','), '| check', await T.hc(), 'errs', T.errs.slice(0, 3));
await T.b.close();
