/* ===== BM4 (Nachtrag 7 section 1.14): the Bit Mask arpeggiator core BMARP, next to ARPC in the shared block sq-arp-src.
   Pure functions (no engine, no track): the 26 patterns in play order, the step length (SPD free / song clock). ARPC's planner
   (held set, live / clip sources, timing) takes them over once BM6 brings the engine 'bm' (see CHANGES BM4). ===== */
const BMARP = (function () {
  'use strict';
  const T = ['off', '1oct', 'dbl', '2oct', 'alt', '3oct', 'pong', 'pon2', 'pon3', 'rnd', 'rnd2', 'rnd3', 'min', 'maj', 'sus2', 'sus4', '7th', 'min2', 'maj2', 'su22', 'su42', '7th2', '1o', '2o', '3o', '5th', '5th2'];
  // fixed patterns: semitones over the last key, played ascending and repeated
  const FIX = {min: [0, 3, 7], maj: [0, 4, 7], sus2: [0, 2, 7], sus4: [0, 5, 7], '7th': [0, 4, 7, 10], '1o': [0], '2o': [0, 12], '3o': [0, 12, 24], '5th': [0, 7], '5th2': [0, 7, 12, 19]};
  for (const k of ['min', 'maj', 'sus2', 'sus4', '7th']) FIX[k === 'sus2' ? 'su22' : k === 'sus4' ? 'su42' : k + '2'] = FIX[k].concat(FIX[k].map(x => x + 12));
  const md = (a, n) => ((a % n) + n) % n;
  const mix = (h, c) => { let x = (h ^ Math.imul(c | 0, 0x9e3779b1)) >>> 0; x ^= x >>> 16; x = Math.imul(x, 0x85ebca6b) >>> 0; x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35) >>> 0; x ^= x >>> 16; return x >>> 0; };
  const oct = (keys, n) => { const U = []; for (let o = 0; o < n; o++) for (const k of keys) U.push(k + 12 * o); return U; };
  const pong = U => (U.length < 2 ? U : U.concat(U.slice(1, -1).reverse()));
  // the sequence of one cycle for the held keys in play order (t1 ... tn); RND has none (see step)
  function seq(t, keys) {
    if (!keys.length) return [];
    switch (t) {
      case '1oct': return keys.slice();
      case 'dbl': { const o = []; for (const k of keys) o.push(k, k); return o; }
      case '2oct': return oct(keys, 2);
      case '3oct': return oct(keys, 3);
      case 'alt': { const o = []; for (const k of keys) o.push(k, k + 12); return o; }
      case 'pong': return pong(keys);
      case 'pon2': return pong(oct(keys, 2));
      case 'pon3': return pong(oct(keys, 3));
      default: { const f = FIX[t]; if (f) { const last = keys[keys.length - 1]; return f.map(x => last + x); } return []; }
    }
  }
  // the note of step c (0, 1, 2 ...); seed = project id + track uid (RND: + the step counter); null = nothing to play
  function step(t, keys, c, seed) {
    if (!keys.length || t === 'off') return null;
    if (t === 'rnd' || t === 'rnd2' || t === 'rnd3') { const U = oct(keys, t === 'rnd' ? 1 : t === 'rnd2' ? 2 : 3); const x = U[mix(seed >>> 0, c) % U.length]; return x <= 127 ? x : null; }
    const s = seq(t, keys); if (!s.length) return null; const n = s[md(c, s.length)]; return n <= 127 ? n : null;
  }
  // the step length: transport stopped = free sixteenths at SPD BPM; running = the song is the clock, the division nearest (log) to SPD / song BPM
  const DIV = [[.25, '1/4', 1], [.5, '1/8', .5], [.75, '1/8T', 1 / 3], [1, '1/16', .25], [1.5, '1/16T', 1 / 6], [2, '1/32', .125]];
  function div(spd, bpm, running) {
    spd = Math.max(20, Math.min(400, +spd || 120));
    if (!running) return {sec: 60 / spd / 4, name: 'frei', beats: spd ? bpm / spd / 4 : 0};
    const r = spd / bpm; let best = DIV[0], bd = Infinity; for (const d of DIV) { const x = Math.abs(Math.log(r / d[0])); if (x < bd - 1e-12) { bd = x; best = d; } }
    return {sec: best[2] * 60 / bpm, name: best[1], beats: best[2]};
  }
  return {T, FIX, seq, step, div};
})();
