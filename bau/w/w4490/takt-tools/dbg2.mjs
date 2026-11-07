import {open, KOPIE} from '../takt/pruef/h.mjs';
const {b, p, errs} = await open(KOPIE, 428, 926);
const r = await p.evaluate(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  stop(); SYNQUENZER.loadDemo(); await wait(100); setProjectKey({root: 0, scale: 'ionian'});
  const syn = [0, 1, 2, 3].filter(k => S.tracks[k] && S.tracks[k].kind === 'synth' && !percIs(S.tracks[k]));
  const tb = syn[0], tc = syn[2] != null ? syn[2] : syn[1], tl = syn[3] != null ? syn[3] : syn[1], N = (t, n, d) => ({t, n, d, v: .8}), K = {root: 0, scale: 'ionian', src: 'user'};
  const ch = [[0, 60], [0, 64], [0, 67], [2, 64], [2, 67], [2, 71], [4, 65], [4, 69], [4, 72], [6, 67], [6, 71], [6, 74]].map(([t, n]) => N(t, n, 1.9));
  const lead = [[0, 72, 1.9], [2, 71, 1.9], [4, 72, 1.9], [6, 74, .6], [6.66, 71, .6], [7.33, 67, .6]].map(([t, n, d]) => N(t, n, d));
  S.tracks[tl].clips[0] = {len: 2, key: Object.assign({}, K), notes: lead}; S.tracks[tc].clips[0] = {len: 2, key: Object.assign({}, K), notes: ch}; S.tracks[tb].clips[0] = {len: 2, key: Object.assign({}, K), notes: [[0, 36], [2, 40], [4, 41], [6, 43]].map(([t, n]) => N(t, n, 1.8))};
  S.scenes[0].chords = null;
  const P = tktModePlan(S.key, 'g');
  const out = {syn, tl, tc, tb, others: []};
  for (let j = 0; j < NT(); j++) { const tr = S.tracks[j]; const x = tr.clips[0]; out.others.push([j, tr.kind, isDrum(j), percIs(tr), !!tr.stimme, x ? clipB(x) : null, x && x.notes ? x.notes.filter(n => n.t < 7.16 && n.t + n.d > 6.66).map(n => n.n) : null, x && x.notes ? x.notes.filter(n => n.t < 6.5 && n.t + n.d > 6).map(n => n.n) : null]); }
  const n = lead[4], hf = tktHarmFn(P, 0, tl, S.tracks[tl].clips[0]); out.h = hf(n, lead);
  const ps = []; tktHAt(lead, n.t, .5, ps); for (let j = 0; j < NT(); j++) { if (j === tl) continue; const tr = S.tracks[j]; if (tr.stimme || isDrum(j) || percIs(tr)) continue; const x = tr.clips[0]; if (x && x.notes) tktHAt(x.notes, ((n.t % clipB(x)) + clipB(x)) % clipB(x), .5, ps); }
  out.ps = ps; out.det = Harmony.detectChord(ps);
  return out;
});
console.log(JSON.stringify(r)); await b.close();
