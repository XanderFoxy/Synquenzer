// QA G-MK6: ● AUFN. in the song (touch): KEY SYNC Stimme on the staccato bass, KEY SYNC Timbre, TIMBRE 2
import {open, sleep, check, done} from './vg567-gmk6-tl.mjs';
import {setupProject} from './vg567-gmk6-setup.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
await setupProject(E);
await T.tapTxt('button.scn', /^▶\s*1/); await sleep(1200);
const recOn = async (t, k, ks, last) => {
  await T.openEd(t); await E(([t, ks, last]) => { SYNQUENZER.mkSet(t, 't.0.seq.ks', ks); SYNQUENZER.mkSet(t, 't.0.seq.last', last); for (let s = 0; s < 16; s++) SYNQUENZER.mkSet(t, 't.0.seq.q.1.v.' + s, 0); SYNQUENZER.mkSet(t, 't.0.seq.q.1.k', 0); }, [t, ks, last]);
  await E(k => { MKUI.setWahl(2, 10); MKUI.viewOpen('schritte'); }, k); await sleep(400); await T.tapMk('s' + k, 300);
  const n0 = await E(t => AU.synth[t].mkRecN || 0, t);
  await T.tapMk('rec', 400);
  await T.sweep('k0', -100, 90, 40);   // CUTOFF (SPIEL) slowly up over ~3.6 s
  let n = n0; for (let i = 0; i < 40 && n === n0; i++) { await sleep(150); n = await E(t => AU.synth[t].mkRecN || 0, t); }
  const last_ = await E(t => AU.synth[t].mkRecLast, t), q = await E(([t, k]) => SYNQUENZER.mkGet(t).t[0].seq.q[k], [t, k]);
  await T.closePop(); await T.tapTxt('#synthSheet button', /^✕$/); await sleep(400);
  return {done: n > n0, last: last_, v: q.v.join(','), k: q.k};
};
const gaps = (v, from, to) => { const z = []; for (let s = from; s <= to; s++) if (v[s - 1] === 0) z.push(s); return z; };
for (const [name, t, ks] of [['bass KEY SYNC Stimme', 0, 2], ['bass KEY SYNC Timbre', 0, 1], ['bass KEY SYNC aus', 0, 0], ['pad KEY SYNC Stimme', 2, 2]]) {
  const r = await recOn(t, 1, ks, 16);
  const v = r.v.split(',').map(Number);
  const z = r.last ? gaps(v, r.last.from + 1, r.last.to) : [];   // the first written step carries the start value 0
  console.log(name, JSON.stringify(r));
  check('AUFN. ' + name + ' in the song: ends, ZIEL CUTOFF, steps from…16 all written (no 0 holes after the first)', r.done && r.k === 11 && r.last && r.last.to === 16 && z.length === 0, {from: r.last && r.last.from, to: r.last && r.last.to, holes: z, v: r.v});
}
console.log('errs', JSON.stringify(errs));
await T.br.close(); done();
