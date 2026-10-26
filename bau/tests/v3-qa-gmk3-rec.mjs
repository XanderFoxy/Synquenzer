// QA G-MK3: analysis 2 on the recorder of v3-qa-gmk2a-rec.mjs (window.__q stays in the page):
//  - isolated transients: 2-ms HP-5 kHz energy > +6 dB over the MAX of its ±100 ms neighbourhood (±6 ms excluded), level > −60 dB,
//    not within 12 ms after an own onset / ±30 ms of an own offset (master: any track, drums 40 ms)  → real clicks, not waveform edges
//  - holes: 5-ms RMS inside a held note (onset + 60 ms … offset − 10 ms) more than 30 dB under the median of that note's windows
export {recStart} from './v3-qa-gmk2a-rec.mjs';
export async function recAnalyse2(E, tStop) {
  return E(tStop => {
    const Q = window.__q; clearInterval(Q.poll); clearInterval(Q.hb); cancelAnimationFrame(Q.raf); for (const x of SYNQUENZER.noteLog(4096)) Q.notes.set(x.seq, x);
    try { AU.M.ceil.disconnect(Q.node); } catch (e) {}
    const sr = Q.sr, N = Q.n, t0 = Q.f0 / sr;
    const notes = [...Q.notes.values()].filter(n => n.time != null);
    const gapT = Q.gaps.map(([a, b]) => [(a + 4096 - Q.f0) / sr + t0 - .012, (b - Q.f0) / sr + t0 + .012]);
    const inGap = t => gapT.some(([a, b]) => t >= a && t <= b);
    const hp = (inp, f, q) => { const w = 2 * Math.PI * f / sr, a = Math.sin(w) / (2 * q), cw = Math.cos(w), b0 = (1 + cw) / 2, b1 = -(1 + cw), b2 = b0, a0 = 1 + a, a1 = -2 * cw, a2 = 1 - a; const y = new Float32Array(inp.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < inp.length; i++) { const v = (b0 * inp[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = inp[i]; y2 = y1; y1 = v; y[i] = v; } return y; };
    const out = {};
    Q.taps.forEach((tap, j) => {
      const x = Q.bufs[j].subarray(0, N);
      const tr = tap === 'master' ? null : +tap.slice(1);
      const own = notes.filter(n => tr == null || n.track === tr);
      const ons = own.map(n => n.time).sort((a, b) => a - b), offs = own.filter(n => n.dur != null).map(n => n.time + n.dur).sort((a, b) => a - b);
      const drumOn = notes.filter(n => n.track === 4).map(n => n.time).sort((a, b) => a - b);
      const last = (arr, t) => { let lo = 0, hi = arr.length - 1, r = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (arr[m] <= t + .0025) { r = m; lo = m + 1; } else hi = m - 1; } return r < 0 ? -1e9 : arr[r]; };
      const nextOf = (arr, t) => { let lo = 0, hi = arr.length - 1, r = 1e9; while (lo <= hi) { const m = (lo + hi) >> 1; if (arr[m] >= t - .0025) { r = arr[m]; hi = m - 1; } else lo = m + 1; } return r; };
      const near = t => t - last(ons, t) <= .012 || (tr == null && t - last(drumOn, t) <= .04) || Math.abs(t - last(offs, t)) <= .03 || Math.abs(nextOf(offs, t) - t) <= .03 || inGap(t);
      let nan = 0, peak = 0; for (let i = 0; i < N; i++) { const v = x[i]; if (v !== v) nan++; else if (Math.abs(v) > peak) peak = Math.abs(v); }
      const h = hp(hp(x, 5000, .5412), 5000, 1.3066);
      const W = Math.round(sr * .002), e = []; for (let i = 0; i + W <= N; i += W) { let s = 0; for (let k = i; k < i + W; k++) s += h[k] * h[k]; e.push(s / W + 1e-20); }
      const clicks = [];
      for (let k = 50; k < e.length - 50; k++) { const t = t0 + k * W / sr; if (t > tStop) break; if (e[k] < 1e-6) continue; let mx = 0; for (let q = k - 50; q <= k + 50; q++) if (Math.abs(q - k) > 3 && e[q] > mx) mx = e[q]; const db = 10 * Math.log10(e[k] / (mx + 1e-20)); if (db > 6 && !near(t)) clicks.push({t: +t.toFixed(3), db: +db.toFixed(1), lv: +(10 * Math.log10(e[k])).toFixed(1)}); }
      const W5 = Math.round(sr * .005), r5 = []; for (let i = 0; i + W5 <= N; i += W5) { let s = 0; for (let k = i; k < i + W5; k++) s += x[k] * x[k]; r5.push(10 * Math.log10(s / W5 + 1e-20)); }
      const holes = [];
      if (tr != null) for (const n of own) { if (n.dur == null || n.dur < .12) continue; const a = n.time + .06, b = n.time + n.dur - .01; const ka = Math.ceil((a - t0) * sr / W5), kb = Math.floor((b - t0) * sr / W5); if (kb - ka < 4) continue; const seg = r5.slice(ka, kb).slice().sort((p, q) => p - q), med = seg[seg.length >> 1]; if (med < -60) continue; for (let k = ka; k < kb; k++) { const t = t0 + k * W5 / sr; if (t > tStop || inGap(t)) continue; if (r5[k] < med - 30) holes.push({t: +t.toFixed(3), db: +r5[k].toFixed(1), med: +med.toFixed(1), note: n.out}); } }
      const rms1 = []; for (let i = 0; i + sr <= N; i += sr) { let s = 0; for (let k = i; k < i + sr; k++) s += x[k] * x[k]; rms1.push(+(10 * Math.log10(s / sr + 1e-20)).toFixed(1)); }
      out[tap] = {nan, peakDb: +(20 * Math.log10(peak + 1e-12)).toFixed(1), clicks, holes, rms1};
    });
    const secs = N / sr;
    return {secs: +secs.toFixed(1), t0, gaps: Q.gaps.length, notes: notes.length, acts: Q.acts, vc: Q.vc, lt: Q.lt, stall: Q.stall, late: Q.late, fps: +(Q.frames / secs).toFixed(1), taps: out};
  }, tStop);
}
