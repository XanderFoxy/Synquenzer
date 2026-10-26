// QA G-MK6: ● AUFN. with detached (staccato) notes vs. one held note, default KEY SYNC Timbre, no song (touch on CUTOFF)
import {open, sleep, check, done} from './v3-qa-gmk6-tl.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
const TR = 2;
await T.openEd(TR); await T.toMk();
console.log('bass clip', JSON.stringify(await E(() => SYNQUENZER.getClip(0, 0).notes.map(n => [n.t, n.d]))));
const run = async (mode, ks) => {
  await E(([t, ks]) => { const Q = SYNQUENZER; Q.setBpm(120); Q.mkSet(t, 't.0.f.cut', 40); Q.mkSet(t, 't.0.e2.a', 0); Q.mkSet(t, 't.0.e2.s', 127); Q.mkSet(t, 't.0.seq.ks', ks); Q.mkSet(t, 't.0.seq.last', 16); for (let s = 0; s < 16; s++) Q.mkSet(t, 't.0.seq.q.0.v.' + s, 0); MKUI.setWahl(2, 10); MKUI.viewOpen('schritte'); }, [TR, ks]);
  await sleep(400);
  const n0 = await E(t => AU.synth[t] ? AU.synth[t].mkRecN || 0 : 0, TR);
  await T.tapMk('rec', 400);
  // notes: staccato 1/8 (150 ms on, 100 ms off) or one held note
  await E(mode => { window.__nt = []; if (mode === 'held') SYNQUENZER.keyOn(57, .8, 'h'); else { let k = 0; window.__iv = setInterval(() => { SYNQUENZER.keyOn(45 + (k % 2) * 12, .8, 'n' + k); const kk = k; setTimeout(() => SYNQUENZER.keyOff(0, 'n' + kk), 150); k++; }, 250); } }, mode);
  await sleep(200);
  await T.sweep('k0', -100, 90, 40);   // ~3.6 s CUTOFF up (16 steps at 1/16, 120 BPM = 2 s)
  let n = n0; for (let i = 0; i < 40 && n === n0; i++) { await sleep(150); n = await E(t => AU.synth[t].mkRecN || 0, TR); }
  await E(() => { clearInterval(window.__iv); SYNQUENZER.keyOff(0, 'h'); }); await sleep(300);
  const last = await E(t => AU.synth[t].mkRecLast, TR), lcd = await T.lcd2();
  return {done: n > n0, from: last && last.from, to: last && last.to, v: last && last.v.join(','), lcd};
};
const a = await run('held', 1); console.log('held', JSON.stringify(a));
check('AUFN. KEY SYNC Timbre, one held note: steps from…16', a.done && a.to === 16 && a.to - a.from >= 8, a);
const b = await run('staccato', 1); console.log('staccato', JSON.stringify(b));
check('AUFN. KEY SYNC Timbre (default), staccato 1/8 notes: records up to LÄNGE (16), not just 1–2 steps', b.done && b.to === 16 && b.to - b.from >= 8, b);
const c = await run('staccato', 2); console.log('staccato Stimme', JSON.stringify(c));
check('AUFN. KEY SYNC Stimme, staccato 1/8 notes: records up to LÄNGE (16)', c.done && c.to === 16 && c.to - c.from >= 8, c);
console.log('errs', JSON.stringify(errs));
await T.br.close(); done();
