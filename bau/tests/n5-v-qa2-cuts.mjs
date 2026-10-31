// QA VV2-03: random songs → cut list rules (bar lines, ≥ 2 bars, ≤ 8 bars without a cut inside parts > 8 bars), determinism
import { open } from './n5-v-lib.mjs';
const {b, p, errs} = await open();
const clips = await p.evaluate(() => S.tracks.map(t => t.clips.map((c, s) => (c ? s : -1)).filter(s => s >= 0)));
console.log('clips per track', JSON.stringify(clips));
const res = await p.evaluate(({clips, N, seed0, withUser}) => {
  let seed = seed0; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const fails = [], stats = {songs: 0, shots: 0, maxNoCut: 0};
  for (let k = 0; k < N; k++) {
    const bars = 4 + Math.floor(rnd() * 40), marks = []; let a = 0, id = 1;
    while (a < bars) { const len = Math.min(bars - a, 1 + Math.floor(rnd() * 18)); if (rnd() < .85) marks.push({id: 'm' + id++, a, len, name: 'T' + id}); a += len; }
    const lanes = clips.map((cs, t) => { const l = []; if (!cs.length) return l; let x = 0; while (x < bars) { if (rnd() < .5) l.push({bar: x, slot: rnd() < .25 ? -1 : cs[Math.floor(rnd() * cs.length)]}); x += 1 + Math.floor(rnd() * 6); } return l; });
    SYNQUENZER.setSong({bars, lanes, carrier: [], mel: {}, marks});
    if (withUser) { const ua = Math.floor(rnd() * bars), ub = Math.min(bars, ua + 1 + Math.floor(rnd() * 6)); const v = ['song', 'matrix', 'spur'][Math.floor(rnd() * 3)]; SYNQUENZER.vvDirSet(ua, ub, v, v === 'spur' ? 0 : undefined); }
    const c1 = SYNQUENZER.vvCuts({range: {a: 0, b: bars}}), c2 = SYNQUENZER.vvCuts({range: {a: 0, b: bars}});
    stats.songs++; stats.shots += c1.shots.length;
    const sh = c1.shots, user = S.song.video || [];
    const f = [];
    if (c1.hash !== c2.hash) f.push('hash');
    if (sh[0].a !== 0 || sh[sh.length - 1].b !== bars) f.push('cover');
    for (let i = 0; i < sh.length; i++) { const s = sh[i]; if (!Number.isInteger(s.a) || !Number.isInteger(s.b)) f.push('notbar ' + s.a); if (i && sh[i - 1].b !== s.a) f.push('gap');
      if (i && (sh[i - 1].v === s.v && (s.v !== 'spur' || sh[i - 1].t === s.t))) f.push('samePic ' + s.a);
      const isUser = user.some(u => u.a <= s.a && s.b <= u.b && u.v === s.v);
      const touchesUser = user.some(u => u.a < s.b && u.b > s.a);
      if (s.b - s.a < 2 && !touchesUser) f.push('short ' + (s.a + 1) + '–' + s.b + ' (' + s.v + ',' + s.why + ')'); }
    // ≤ 8 bars without a cut inside parts > 8
    for (const m of S.song.marks) { if (m.len <= 8) continue; const pe = m.a + m.len;
      for (const s of sh) { const ov = Math.min(s.b, pe) - Math.max(s.a, m.a); if (ov > stats.maxNoCut) stats.maxNoCut = ov; if (ov > 8) { const touchesUser = user.some(u => u.a < s.b && u.b > s.a); f.push((touchesUser ? 'U-' : '') + 'noCut ' + ov + ' in part ' + (m.a + 1) + '–' + pe + ' shot ' + (s.a + 1) + '–' + s.b + ' ' + s.v + '/' + s.why); } } }
    // also: a song stretch without any marks longer than 8 (no rule in spec for that; just info)
    if (f.length) fails.push({k, bars, marks: S.song.marks.map(m => [m.a, m.len]), user, shots: sh.map(s => [(s.a + 1) + '–' + s.b, s.v + (s.t != null ? s.t : ''), s.why]), f});
  }
  return {stats, nf: fails.length, fails: fails.sort((x, y) => Math.max(...y.f.map(s => +(s.match(/noCut (\d+)/) || [0, 0])[1])) - Math.max(...x.f.map(s => +(s.match(/noCut (\d+)/) || [0, 0])[1]))).slice(0, 3).map(x => JSON.stringify(x)), kinds: [...new Set(fails.flatMap(x => x.f.map(y => y.split(' ')[0])))]};
}, {clips, N: +(process.argv[2] || 300), seed0: +(process.argv[3] || 7), withUser: process.argv[4] === 'user'});
console.log(JSON.stringify(res, null, 1).slice(0, 6000)); console.log('errs', errs.slice(0, 3));
await b.close();
