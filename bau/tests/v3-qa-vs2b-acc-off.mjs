// QA VS2b acceptance (offline FANG path): independent synthetic singing → app pyin + segment (4.5.2) vs 4.5.1.
// node v3-qa-vs2b-acc-off.mjs [case…]
import {loadDsp} from './v3-vs2-corpus.mjs';
import {sing, score, rng} from './v3-qa-vs2b-acc-synth.mjs';
const DN = loadDsp(process.env.NEWF || '../dirigent-wt/index.html'), DO = loadDsp('v3-vs2b-base.html');
const only = process.argv.slice(2);
const VO = [['male', 50], ['female', 62]];
function run(notesFn, o = {}) {
  const res = {n: {sung: 0, hit: 0, extra: 0, miss: 0, det: 0, ex: [], mi: []}, o: {sung: 0, hit: 0, extra: 0, miss: 0, det: 0, ex: [], mi: []}, counts: []};
  for (const seed of o.seeds || [1, 2]) for (const [voice, b] of VO) {
    const notes = notesFn(b, seed, voice), CL = process.env.CLEAN, s = sing(notes, {voice, seed, sigma: o.sigma == null ? 6 : o.sigma, snr: CL ? 50 : o.snr, rev: CL ? false : o.rev, wet: o.wet, rt: o.rt});
    const tr = DN.pyin(s.x, {fs: 16000});
    for (const [k, D] of [['n', DN], ['o', DO]]) {
      const ns = D.segment(tr, {snap: false, tuning: o.tuning == null ? 'auto' : o.tuning}).notes, sc = score(ns, s.truth, o.tol || 0.1), R = res[k];
      for (const q of ['sung', 'hit', 'extra', 'miss', 'det']) R[q] += sc[q];
      if (R.ex.length < 3 && sc.exEx.length) R.ex.push([voice, seed, ...sc.exEx[0]]); if (R.mi.length < 3 && sc.exMiss.length) R.mi.push([voice, seed, ...sc.exMiss[0]]);
      if (k === 'n') res.counts.push(ns.map(n => n.n));
    }
  }
  return res;
}
const fmt = R => `${R.hit}/${R.sung} hit, +${R.extra} extra, -${R.miss} miss`;
const out = (name, r, verdict) => console.log(`${verdict} ${name}: NEW ${fmt(r.n)}${r.n.ex.length ? ' ex' + JSON.stringify(r.n.ex) : ''}${r.n.mi.length ? ' mi' + JSON.stringify(r.n.mi) : ''} | OLD ${fmt(r.o)}`);
let bad = 0; const V = (c) => { if (!c) bad++; return c ? 'PASS' : 'FAIL'; };
const want = c => !only.length || only.some(x => c.startsWith(x));

// 1 hysteresis duration sweep (legato excursion with 15 ms transitions)
if (want('HYS-DUR')) for (const dev of [1, -1, 2]) for (const d of [40, 55, 65, 80, 95, 120]) {
  const fn = b => [{on: 0.3, dur: 0.5, midi: b, vowel: 'a'}, {on: 0.8, dur: d / 1000, midi: b + dev, glide: 0.015, vowel: 'a'}, {on: 0.8 + d / 1000, dur: 0.5, midi: b, glide: 0.015, vowel: 'a'}];
  const r = run(fn, {sigma: 0, tuning: 0, seeds: [1, 2, 3]}), cnt = r.counts.map(c => c.length);
  const exp = d <= 55 ? 1 : d >= 95 ? 3 : null, okc = exp == null || cnt.every(c => c === exp);
  console.log(`${exp == null ? 'INFO' : V(okc)} HYS-DUR dev ${dev} st ${d} ms: note counts ${JSON.stringify(cnt)} (expect ${exp == null ? 'either' : exp}); notes ${JSON.stringify(r.counts[0])}`);
}
// 2 hysteresis magnitude sweep (250 ms)
if (want('HYS-CT')) for (const dev of [0.4, 0.5, 0.7, 0.85, -0.5, -0.7]) {
  const fn = b => [{on: 0.3, dur: 0.5, midi: b, vowel: 'o'}, {on: 0.8, dur: 0.25, midi: b + dev, glide: 0.02, vowel: 'o'}, {on: 1.05, dur: 0.5, midi: b, glide: 0.02, vowel: 'o'}];
  const r = run(fn, {sigma: 0, tuning: 0, seeds: [1, 2, 3]}), cnt = r.counts.map(c => c.length);
  const exp = Math.abs(dev) <= 0.5 ? 1 : 3;
  console.log(`${V(cnt.every(c => c === exp))} HYS-CT dev ${dev * 100} ct 250 ms: counts ${JSON.stringify(cnt)} (expect ${exp}); ${JSON.stringify(r.counts[0])}`);
}
// 3 vibrato sweep: one held 1.2 s note between context notes
if (want('VIB') && !only.includes('VIBLEG')) for (const jit of [0, 1]) for (const hz of [4.5, 5, 5.5, 6.5, 7.5]) for (const ct of [50, 80, 100, 130]) {
  const fn = b => [{on: 0.3, dur: 0.5, midi: b - 2, cons: 'l'}, {on: 1.0, dur: 1.2, midi: b, cons: 'n', vib: {ct, hz, delay: 0.15, jit}}, {on: 2.4, dur: 0.5, midi: b + 3, cons: 'd'}];
  const r = run(fn, {seeds: [1, 2, 3]});
  out(`VIB ${hz} Hz ±${ct} ct${jit ? ' irregular' : ''}`, r, V(r.n.extra === 0 && r.n.miss === 0));
}
// 4 vibrato on legato semitone/whole-tone steps
if (want('VIBLEG')) for (const ct of [60, 100]) for (const hz of [5, 6]) {
  const fn = b => [{on: 0.3, dur: 0.8, midi: b, vib: {ct, hz, delay: 0.12}}, {on: 1.1, dur: 0.8, midi: b + 1, glide: 0.08, vib: {ct, hz, delay: 0.12}}, {on: 1.9, dur: 0.8, midi: b + 3, glide: 0.08, vib: {ct, hz, delay: 0.12}}, {on: 2.7, dur: 0.8, midi: b + 2, glide: 0.08, vib: {ct, hz, delay: 0.12}}];
  const r = run(fn, {seeds: [1, 2, 3]});
  out(`VIBLEG ±${ct} ct ${hz} Hz`, r, V(r.n.extra === 0 && r.n.miss === 0));
}
// 5 scoops into detached notes
if (want('SCOOP')) for (const st of [1, 2, 3, 4, -1, -2]) for (const ms of [60, 100, 140, 180]) {
  if (st < 0 && ms > 140) continue;
  const fn = (b, seed) => { const steps = [0, 2, 4, 1, 3]; return steps.map((s, k) => ({on: 0.3 + k * 0.85, dur: 0.6, midi: b + s, scoop: [st, ms / 1000], vib: {ct: 30, hz: 5.5, delay: 0.25}, cons: ['', 'l', 'd', 'n', ''][k]})); };
  const r = run(fn);
  out(`SCOOP ${st > 0 ? 'below' : 'above'} ${Math.abs(st)} st ${ms} ms`, r, V(r.n.extra === 0 && r.n.miss === 0));
}
// 6 falls at the end of detached notes
if (want('FALL')) for (const st of [2, 4, 6]) for (const ms of [80, 120, 160, 220]) {
  const fn = b => [0, 3, 1, 5].map((s, k) => ({on: 0.3 + k * 0.95, dur: 0.65, midi: b + s, fall: [st, ms / 1000, 9], vib: {ct: 35, hz: 5.5, delay: 0.25}}));
  const r = run(fn);
  out(`FALL ${st} st ${ms} ms`, r, V(r.n.extra === 0 && r.n.miss === 0));
}
// 7 legato glides between two notes
if (want('GLIDE')) for (const iv of [1, 2, 3, 5, 7, -1, -2, -3, -5, -7]) for (const g of [60, 120, 180, 250]) {
  const fn = b => [{on: 0.3, dur: 0.55, midi: b, vowel: 'a'}, {on: 0.85, dur: 0.55, midi: b + iv, glide: g / 1000, vowel: 'o'}, {on: 1.7, dur: 0.5, midi: b + 2, cons: 'd'}];
  const r = run(fn);
  out(`GLIDE ${iv > 0 ? '+' : ''}${iv} st ${g} ms`, r, V(r.n.extra === 0 && r.n.miss === 0));
}
// 8 runs (real short notes must stay)
if (want('RUN')) {
  const C = [0, 2, 4, 5, 7, 9, 11, 12, 14]; const up = b => { const sc = []; for (let m = b - 5; m <= b + 14; m++) if ([0, 2, 4, 5, 7, 9, 11].includes(((m % 12) + 12) % 12)) sc.push(m); return sc; };
  for (const [bpm, leg, name] of [[120, 1, 'RUN 1/16 120 BPM legato'], [132, 1, 'RUN 1/16 132 BPM legato'], [160, 0, 'RUN 1/8 160 BPM staccato']]) {
    const fn = b => { const sc = up(b), st = sc.findIndex(m => m >= b), d = leg ? 60 / bpm / 4 : 60 / bpm / 2, seq = [0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1, 0, 1];
      return seq.map((q, k) => ({on: 0.3 + k * d, dur: leg ? d : d - 0.04, midi: sc[st + q], glide: leg && k ? 0.025 : 0, cons: leg ? '' : 'd'})).map(n => (n.glide || delete n.glide, n)); };
    const r = run(fn, {seeds: [1, 2, 3]}); out(name, r, V(r.n.miss <= 0.03 * r.n.sung && r.n.extra <= 0.03 * r.n.sung));
  }
}
// 9 repeated syllables on one pitch ("la la la")
if (want('REP')) { const fn = b => Array.from({length: 8}, (_, k) => ({on: 0.3 + k * 0.25, dur: 0.25 + 0.03, midi: b + (k >= 4 ? 2 : 0), cons: 'l'})).map((n, k, a) => n);
  const r = run(fn, {seeds: [1, 2, 3]}); out('REP la-la 1/8 120 BPM', r, V(r.n.hit >= r.o.hit && r.n.extra <= r.o.extra)); }
// 10 detached notes in a room: reverb tail between notes
if (want('TAIL')) for (const wet of [-20, -16, -12]) for (const gap of [60, 100, 150, 250]) {
  const fn = b => [0, 2, 4, 2, 5, 4].map((s, k) => ({on: 0.3 + k * (0.45 + gap / 1000), dur: 0.45 + 0.03, midi: b + s, cons: ['', 'd', 'l', 's', 'n', 'd'][k]}));
  const r = run(fn, {wet, rt: 0.4});
  out(`TAIL wet ${wet} dB gap ${gap} ms`, r, V(r.n.extra === 0 && r.n.miss === 0));
}
// 11 realistic mix: random melodies with everything
if (want('MIX')) { const tot = {n: {sung: 0, hit: 0, extra: 0, miss: 0}, o: {sung: 0, hit: 0, extra: 0, miss: 0}}; const exs = [];
  for (const seed of [11, 12, 13, 14, 15, 16]) {
    const fn = (b, sd) => { const r = rng(sd * 31 + b), CM = [0, 2, 4, 5, 7, 9, 11], sc = []; for (let m = b - 5; m <= b + 12; m++) if (CM.includes(((m % 12) + 12) % 12)) sc.push(m);
      let idx = sc.findIndex(m => m >= b), t = 0.3; const out = [], sb = 0.6;
      for (let k = 0; k < 20; k++) { const beats = [0.5, 0.5, 1, 1, 1.5, 2][Math.floor(r() * 6)], dur = beats * sb; let st = [-2, -1, -1, 1, 1, 2, 3, -3][Math.floor(r() * 8)]; if (idx + st < 0 || idx + st >= sc.length) st = -st; idx += st;
        const leg = k > 0 && r() < 0.4 && !out[k - 1].fall, n = {on: t, dur, midi: sc[idx]};
        if (leg) n.glide = 0.05 + r() * 0.15; else n.cons = ['', 'l', 'd', 'n', 's'][Math.floor(r() * 5)];
        if (!leg && r() < 0.4) n.scoop = [(r() < 0.75 ? 1 : -1) * (0.8 + r() * 2), 0.05 + r() * 0.1];
        if (dur >= 0.55) n.vib = {ct: 40 + r() * 80, hz: 5 + r() * 1.5, delay: 0.15 + r() * 0.1, jit: 1};
        out.push(n); t += dur;
        if (r() < 0.35) { n.fall = r() < 0.6 ? [1.5 + r() * 3.5, 0.08 + r() * 0.12, 8] : undefined; if (!n.fall) delete n.fall; t += 0.1 + r() * 0.3; }
      }
      for (let k = 1; k < out.length; k++) if (out[k].glide && out[k - 1].fall) { delete out[k].glide; out[k].on += 0.15; for (let j = k + 1; j < out.length; j++) out[j].on += 0.15; }
      return out; };
    const r = run(fn, {seeds: [seed], wet: -18, rt: 0.35, snr: 32});
    for (const k of ['n', 'o']) for (const q of ['sung', 'hit', 'extra', 'miss']) tot[k][q] += r[k][q];
    if (r.n.ex.length) exs.push(...r.n.ex.slice(0, 2));
  }
  const F = R => (2 * R.hit / (R.sung + R.hit + R.extra + (R.sung - R.hit - R.miss))).toFixed(3);
  console.log(`${V(tot.n.extra <= 0.04 * tot.n.sung && tot.n.miss <= 0.03 * tot.n.sung)} MIX: NEW ${fmt(tot.n)} | OLD ${fmt(tot.o)} ex ${JSON.stringify(exs.slice(0, 6))}`);
}
console.log('bad', bad);
