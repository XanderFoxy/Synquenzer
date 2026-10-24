import {loadDsp} from './v3-vs2-corpus.mjs';
import {sing, score} from './v3-qa-vs2b-acc-synth.mjs';
const DN = loadDsp(process.argv[2] || 'v3-fx-dbg-copy.html'), DO = loadDsp('v3-fx-452.html');
const up = b => { const sc = []; for (let m = b - 5; m <= b + 14; m++) if ([0, 2, 4, 5, 7, 9, 11].includes(((m % 12) + 12) % 12)) sc.push(m); return sc; };
for (const bpm of [120, 132]) for (const seed of [1, 2, 3]) for (const [voice, b] of [['male', 50], ['female', 62]]) {
  const sc = up(b), st = sc.findIndex(m => m >= b), d = 60 / bpm / 4, seq = [0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1, 0, 1];
  const notes = seq.map((q, k) => { const n = {on: 0.3 + k * d, dur: d, midi: sc[st + q]}; if (k) n.glide = 0.025; return n; });
  const s = sing(notes, {voice, seed, sigma: 6, snr: process.env.CLEAN ? 50 : undefined, rev: process.env.CLEAN ? false : undefined}), tr = DN.pyin(s.x, {fs: 16000});
  const a = score(DN.segment(tr, {snap: false, tuning: 'auto'}).notes, s.truth, 0.1), o = score(DO.segment(tr, {snap: false, tuning: 'auto'}).notes, s.truth, 0.1);
  if (a.miss !== o.miss || a.extra !== o.extra) { console.log(bpm, seed, voice, 'NEW miss', JSON.stringify(a.exMiss), 'ex', JSON.stringify(a.exEx), '| OLD miss', JSON.stringify(o.exMiss), 'ex', JSON.stringify(o.exEx));
    console.log('   NEW', DN.segment(tr, {snap: false, tuning: 'auto'}).notes.map(n => `${n.t0.toFixed(3)}-${n.t1.toFixed(3)}:${n.n}`).join(' '));
    console.log('   OLD', DO.segment(tr, {snap: false, tuning: 'auto'}).notes.map(n => `${n.t0.toFixed(3)}-${n.t1.toFixed(3)}:${n.n}`).join(' ')); }
}
