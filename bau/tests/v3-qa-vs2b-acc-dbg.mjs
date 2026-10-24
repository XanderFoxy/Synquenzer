import {loadDsp} from './v3-vs2-corpus.mjs';
import {sing, score} from './v3-qa-vs2b-acc-synth.mjs';
const DN = loadDsp('../dirigent-wt/index.html'), DO = loadDsp('v3-vs2b-base.html');
export function dbg(notes, o, win) {
  const s = sing(notes, o), tr = DN.pyin(s.x, {fs: 16000});
  const fmt = ns => ns.map(n => `[${n.t0.toFixed(3)}-${n.t1.toFixed(3)} ${n.n} ${n.m}]`).join(' ');
  const nN = DN.segment(tr, {snap: false, tuning: o.tuning == null ? 'auto' : o.tuning}).notes, nO = DO.segment(tr, {snap: false, tuning: o.tuning == null ? 'auto' : o.tuning}).notes;
  console.log('truth', s.truth.map(t => `[${t.on.toFixed(3)}-${t.off.toFixed(3)} ${t.midi}]`).join(' '));
  console.log('NEW  ', fmt(nN)); console.log('OLD  ', fmt(nO));
  if (win) { const hop = tr.hop / tr.fs; let line = ''; for (let i = Math.round(win[0] / hop); i < Math.round(win[1] / hop); i++) line += `${(i * hop).toFixed(3)}:${tr.f0[i] > 0 ? (69 + 12 * Math.log2(tr.f0[i] / 440)).toFixed(2) : '--'}/${(tr.e10 || tr.rms)[i].toFixed(0)}/${s.pitch[Math.round(i * hop * 16000)] ? s.pitch[Math.round(i * hop * 16000)].toFixed(2) : 'x'} `; console.log(line); }
  return {s, tr, nN, nO};
}
if (process.argv[1].endsWith('v3-qa-vs2b-acc-dbg.mjs')) {
  const args = JSON.parse(process.argv[2]); dbg(args.notes, args.o || {}, args.win);
}
