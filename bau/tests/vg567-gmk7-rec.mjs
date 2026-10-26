// G-MK7: recAnalyse with extra source tracks per tap (a vocoder / Eingang track follows the onsets of its source tracks)
export {recStart} from './v3-qa-gmk2a-rec.mjs';
export async function recAnalyse7(E, tStop, extra = {}) {
  return E(([tStop, extra]) => {
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
      const xt = extra[tap] || []; const own = notes.filter(n => tr == null || n.track === tr || xt.includes(n.track));
      const ons = own.map(n => n.time).sort((a, b) => a - b), offs = own.filter(n => n.dur != null).map(n => n.time + n.dur).sort((a, b) => a - b);
      const drumOn = notes.filter(n => n.track === 4).map(n => n.time).sort((a, b) => a - b);
      const last = (arr, t) => { let lo = 0, hi = arr.length - 1, r = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (arr[m] <= t + .0025) { r = m; lo = m + 1; } else hi = m - 1; } return r < 0 ? -1e9 : arr[r]; };
      const near = t => t - last(ons, t) <= (tr == null ? .008 : .012) || (tr == null && t - last(drumOn, t) <= .04) || Math.abs(t - last(offs, t)) <= .03 || inGap(t);
      let nan = 0, peak = 0; for (let i = 0; i < N; i++) { const v = x[i]; if (v !== v) nan++; else if (Math.abs(v) > peak) peak = Math.abs(v); }
      const h = hp(hp(x, 5000, .5412), 5000, 1.3066);
      const W = Math.round(sr * .002), e = []; for (let i = 0; i + W <= N; i += W) { let s = 0; for (let k = i; k < i + W; k++) s += h[k] * h[k]; e.push(s / W + 1e-20); }
      const flags = [];
      for (let k = 10; k < e.length - 10; k++) { const t = t0 + k * W / sr; if (t > tStop) break; const nb = e.slice(k - 10, k + 11).filter((_, q) => q !== 10).sort((a, b) => a - b), med = nb[10]; const db = 10 * Math.log10(e[k] / med); if (db > 6 && e[k] > 1e-9 && !near(t)) flags.push({t: +t.toFixed(3), db: +db.toFixed(1), lv: +(10 * Math.log10(e[k])).toFixed(1)}); }
      const W5 = Math.round(sr * .005), r5 = []; for (let i = 0; i + W5 <= N; i += W5) { let s = 0; for (let k = i; k < i + W5; k++) s += x[k] * x[k]; r5.push(10 * Math.log10(s / W5 + 1e-20)); }
      const mean = a => 10 * Math.log10(a.reduce((s, v) => s + Math.pow(10, v / 10), 0) / a.length);
      const drops = []; for (let k = 10; k < r5.length - 10; k++) { const t = t0 + k * W5 / sr; if (t > tStop) break; if (!inGap(t) && r5[k] < -70 && mean(r5.slice(k - 10, k)) > -35 && mean(r5.slice(k + 1, k + 11)) > -35) drops.push({t: +t.toFixed(3), db: +r5[k].toFixed(0)}); }
      const rms1 = []; for (let i = 0; i + sr <= N; i += sr) { let s = 0; for (let k = i; k < i + sr; k++) s += x[k] * x[k]; rms1.push(+(10 * Math.log10(s / sr + 1e-20)).toFixed(1)); }
      // per-track (raw worklet output): sustained-zone detector – HP energy > 10 dB over the ±20 ms median while the 2-ms RMS stays
      // above −60 dB in ±20 ms (no gaps), away from own on/offs; plus a 2nd-difference spike detector (discontinuities)
      let sflags = [], d2f = [], snips = [];
      if (tr != null) {
        const r2 = []; for (let i = 0; i + W <= N; i += W) { let s = 0; for (let k = i; k < i + W; k++) s += x[k] * x[k]; r2.push(10 * Math.log10(s / W + 1e-20)); }
        const next = (arr, t) => { let lo = 0, hi = arr.length - 1, r = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (arr[m] >= t) { r = m; hi = m - 1; } else lo = m + 1; } return r < 0 ? 1e9 : arr[r]; };
        const nearOwn = t => t - last(ons, t) <= .015 || next(ons, t) - t <= .003 || t - last(offs, t) <= .03 || next(offs, t) - t <= .005 || inGap(t);
        for (let k = 10; k < e.length - 10; k++) { const t = t0 + k * W / sr; if (t > tStop) break; let mn = 1e9; for (let q = k - 10; q <= k + 10; q++) mn = Math.min(mn, r2[q]); if (mn < -60) continue; const nb = e.slice(k - 10, k + 11).filter((_, q) => q !== 10).sort((a, b) => a - b), med = nb[10]; const db = 10 * Math.log10(e[k] / med); if (db > 10 && 10 * Math.log10(e[k]) > -75 && !nearOwn(t)) sflags.push({t: +t.toFixed(4), db: +db.toFixed(1), lv: +(10 * Math.log10(e[k])).toFixed(1), rms: +r2[k].toFixed(1)}); }
        const B = Math.round(sr * .001); const d2 = new Float32Array(N); for (let i = 2; i < N; i++) d2[i] = x[i] - 2 * x[i - 1] + x[i - 2];
        const mb = []; for (let i = 0; i + B <= N; i += B) { let m = 0, s = 0; for (let k = i; k < i + B; k++) { const a = Math.abs(d2[k]); if (a > m) m = a; s += d2[k] * d2[k]; } mb.push([m, s / B]); }
        for (let k = 10; k < mb.length - 10; k++) { const t = t0 + k * B / sr; if (t > tStop) break; let s = 0; for (let q = k - 10; q <= k + 10; q++) if (q !== k) s += mb[q][1]; const rm = Math.sqrt(s / 20) + 1e-9; const ratio = 20 * Math.log10(mb[k][0] / rm); const kk = Math.floor(k * B / W); let mn = 1e9; for (let q = Math.max(0, kk - 10); q <= Math.min(r2.length - 1, kk + 10); q++) mn = Math.min(mn, r2[q]); if (mn < -60) continue; if (ratio > 20 && mb[k][0] > 1e-4 && !nearOwn(t)) d2f.push({t: +t.toFixed(4), db: +ratio.toFixed(1), amp: +mb[k][0].toExponential(1)}); }
        for (const f of sflags.concat(d2f).slice(0, 24)) { const i0 = Math.max(0, Math.round((f.t - t0 - .03) * sr)); snips.push({t: f.t, i0, d: Array.from(x.subarray(i0, i0 + Math.round(sr * .06))).map(v => +v.toFixed(5))}); }
      }
      out[tap] = {nan, peakDb: +(20 * Math.log10(peak + 1e-12)).toFixed(1), flags, drops, rms1, sflags, d2f, snips};
    });
    const secs = N / sr;
    return {secs: +secs.toFixed(1), t0, gaps: Q.gaps.length, notes: notes.length, acts: Q.acts, vc: Q.vc, lt: Q.lt, stall: Q.stall, late: Q.late, fps: +(Q.frames / secs).toFixed(1), taps: out};
  }, [tStop, extra]);
}
