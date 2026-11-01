  /* I4c tapNotes(tr, taps, o) (Nachtrag 8 B.4 6.1-6.6): the finger gives the rhythm, the voice the pitch. DOM-free, inside the VS2
     core (main thread, worker, Node). tr = the 5-ms pitch track of pyin, taps = [{s0, s1}] in analysis seconds (s1 null = still held:
     ends at o.end), o = {scale, root, snap, tuning: 'auto', segNotes, bleed, end}. pyin and segment stay unchanged; tuning and
     snapping are the same calculation as segment's. Result like segment: {notes: [{t0, t1, m, n, raw, by: 'tipp'|'ohne'|'zwei', lv}],
     tuneCt, open: [VS2 notes without a tap], two, noTone, taps}. */
  function tapNotes(tr, taps, o) {
    o = o || {};
    const hop = tr.hop / tr.fs, nF = tr.n, unk = tr.unk || new Uint8Array(nF), E0 = tr.e10 || tr.rms;
    const fr = s => Math.max(0, Math.min(nF, Math.round(s / hop)));
    const mAt = new Float64Array(nF); for (let i = 0; i < nF; i++) mAt[i] = tr.f0[i] > 0 && !unk[i] ? midiOf(tr.f0[i]) : NaN;
    const endAll = o.end != null ? o.end : nF * hop;
    // 6.2: order, debounce (< 30 ms after the previous touch), one voice: end_i = min(release_i, start_{i+1}), length >= 25 ms
    const T0 = (taps || []).filter(t => t && isFinite(t.s0)).map(t => ({s0: +t.s0, s1: t.s1 == null || !isFinite(t.s1) ? endAll : +t.s1})).sort((a, b) => a.s0 - b.s0);
    const T = []; for (const t of T0) { if (T.length && t.s0 - T[T.length - 1].s0 < 0.03) continue; T.push(t); }
    for (let i = 0; i < T.length; i++) { const nx = T[i + 1]; T[i].e = Math.max(T[i].s0 + 0.025, Math.min(T[i].s1, nx ? nx.s0 : T[i].s1)); }
    const med = v => { if (!v.length) return NaN; const s = v.slice().sort((a, b) => a - b), h = s.length >> 1; return s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2; };
    // the 3-frame median, once for the whole track (no allocation per frame)
    const SM = new Float64Array(nF);
    for (let k = 0; k < nF; k++) {
      const a = k > 0 ? mAt[k - 1] : NaN, b = mAt[k], c = k + 1 < nF ? mAt[k + 1] : NaN;
      const na = a === a, nb = b === b, nc = c === c, cnt = (na ? 1 : 0) + (nb ? 1 : 0) + (nc ? 1 : 0);
      if (cnt === 3) SM[k] = Math.max(Math.min(a, b), Math.min(Math.max(a, b), c));
      else if (cnt === 2) SM[k] = ((na ? a : 0) + (nb ? b : 0) + (nc ? c : 0)) / 2;
      else if (cnt === 1) SM[k] = na ? a : nb ? b : c;
      else SM[k] = NaN;
    }
    const s3 = k => SM[k];
    // quiet stretches >= 45 ms within 25 ct (as segment's flat()), on the 3-frame median
    function flats(a, b) {
      const out = []; let i = a;
      while (i < b) {
        const x = s3(i); if (isNaN(x)) { i++; continue; }
        let lo = x, hi = x, j = i + 1;
        while (j < b) { const y = s3(j); if (isNaN(y)) break; const l2 = Math.min(lo, y), h2 = Math.max(hi, y); if (h2 - l2 > 0.25) break; lo = l2; hi = h2; j++; }
        if ((j - i) * hop >= 0.045) { const v = []; for (let k = i; k < j; k++) v.push(s3(k)); out.push({a: i, b: j, m: med(v)}); i = j; } else i++;
      }
      return out;
    }
    const raw = [];
    for (let i = 0; i < T.length; i++) {
      const t = T[i], nx = T[i + 1], len = t.e - t.s0, short = len < 0.15;
      // 6.3 search window [start - 60 ms, end + 40 ms]; a short tap (tone held on): to min(start + 250 ms, next start - 10 ms); never into the next tap
      let w0 = t.s0 - 0.06, w1 = short ? Math.min(t.s0 + 0.25, nx ? nx.s0 - 0.01 : Infinity) : t.e + 0.04;
      if (nx) w1 = Math.min(w1, nx.s0);
      const effEnd = short ? Math.max(t.e, w1) : t.e;
      const W0 = fr(w0), W1 = fr(w1);
      let fv = -1; for (let k = W0; k < W1; k++) if (!isNaN(mAt[k])) { fv = k; break; }
      const kStart = Math.max(t.s0, fv >= 0 ? fv * hop : t.s0) + Math.min(0.06, 0.25 * (effEnd - t.s0)), kEnd = effEnd - Math.min(0.03, 0.15 * (effEnd - t.s0));
      const kern = []; for (let k = fr(kStart); k < fr(kEnd); k++) if (!isNaN(mAt[k])) kern.push(k);
      const self = []; for (let k = fr(t.s0); k < fr(effEnd); k++) if (!isNaN(mAt[k])) self.push(k);
      let m = NaN, by = 'tipp', use = null, wN = 0;
      if (kern.length * hop >= 0.03 - 1e-9) { use = kern; } else if (self.length * hop >= 0.02 - 1e-9) use = self;
      if (use) {
        m = med(use.map(k => mAt[k])); wN = use.length;
        // two tones in one tap: two quiet stretches >= 0.8 st apart, each >= 60 ms -> the longer one (+-10 ms equal: the earlier)
        const F = effEnd - t.s0 >= 0.12 ? flats(fr(t.s0), fr(effEnd)).filter(q => (q.b - q.a) * hop >= 0.06) : [];   // two stretches of >= 60 ms need >= 120 ms
        if (F.length >= 2) {
          let best = null; for (const q of F) { if (!best || (q.b - q.a) * hop > (best.b - best.a) * hop + 0.01) best = q; }
          if (F.some(q => Math.abs(q.m - best.m) >= 0.8)) { m = best.m; by = 'zwei'; use = []; for (let k = best.a; k < best.b; k++) if (!isNaN(mAt[k])) use.push(k); wN = use.length; }
        }
        if (o.bleed && o.bleed({t0: t.s0, t1: t.e, m})) { m = NaN; use = null; }
      }
      const lvv = []; for (const k of use || []) if (E0[k] > -150) lvv.push(E0[k]);
      raw.push({t0: t.s0, t1: t.e, m, by: isNaN(m) ? 'ohne' : by, lv: lvv.length ? med(lvv) : NaN, w: wN});
    }
    // 6.4: a tap without a tone: the pitch (and level) of the previous tap with a tone within 2 s, else the next
    const toned = raw.filter(r => !isNaN(r.m));
    if (!toned.length) return {notes: [], tuneCt: 0, open: [], two: 0, noTone: raw.length, taps: T.length};
    for (let i = 0; i < raw.length; i++) {
      const r = raw[i]; if (!isNaN(r.m)) continue;
      let src = null; for (let j = i - 1; j >= 0; j--) if (raw[j].by !== 'ohne' && !isNaN(raw[j].m)) { if (r.t0 - raw[j].t0 <= 2) src = raw[j]; break; }
      if (!src) for (let j = i + 1; j < raw.length; j++) if (raw[j].by !== 'ohne' && !isNaN(raw[j].m)) { src = raw[j]; break; }
      if (src) { r.m = src.m; r.lv = src.lv; r.from = src; }
    }
    // 6.6 tuning: weighted circular mean of the fractions over the notes with a tone (weight = their counted frames), as segment
    let tune = 0;
    if (o.tuning === 'auto' || o.tuning == null) {
      let sx = 0, sy = 0; for (const r of toned) { const ph = 2 * Math.PI * (r.m - Math.round(r.m)); sx += r.w * Math.cos(ph); sy += r.w * Math.sin(ph); }
      tune = sx || sy ? Math.atan2(sy, sx) / (2 * Math.PI) : 0;
    } else tune = +o.tuning || 0;
    const notes = [];
    for (const r of raw) {
      if (isNaN(r.m)) continue;
      const mt = r.m - tune; let p = Math.round(mt);
      if (o.snap && o.scale) {
        const ins = q => !!o.scale[((q - (o.root || 0)) % 12 + 12) % 12];
        if (!ins(p)) { let lo = p - 1, hi = p + 1; while (!ins(lo) && lo > p - 6) lo--; while (!ins(hi) && hi < p + 6) hi++; p = (mt - lo) < (hi - mt) ? lo : hi; }
      }
      notes.push({t0: r.t0, t1: r.t1, m: +r.m.toFixed(3), n: p, raw: Math.round(mt), by: r.by, lv: r.lv});
    }
    // 6.5 voice without a tap: a VS2 note >= 120 ms, >= 50 % of it outside every search window -> counted, not taken
    const open = [];
    const WA = new Float64Array(T.length), WB = new Float64Array(T.length);
    for (let i = 0; i < T.length; i++) { const t = T[i], nx = T[i + 1], short = t.e - t.s0 < 0.15; WA[i] = t.s0 - 0.06; let b = short ? Math.min(t.s0 + 0.25, nx ? nx.s0 - 0.01 : Infinity) : t.e + 0.04; if (nx) b = Math.min(b, nx.s0); WB[i] = b; }
    let w0 = 0;
    for (const n of o.segNotes || []) {
      if (!(n.t1 - n.t0 >= 0.12)) continue;
      let cov = 0; const L = n.t1 - n.t0;
      while (w0 < T.length && WB[w0] < n.t0 - 0.3) w0++;
      for (let i = w0; i < T.length && WA[i] < n.t1; i++) cov += Math.max(0, Math.min(WB[i], n.t1) - Math.max(WA[i], n.t0));
      if (cov < 0.5 * L) open.push(n);
    }
    return {notes, tuneCt: Math.round(tune * 1000) / 10, open, two: raw.filter(r => r.by === 'zwei').length, noTone: raw.filter(r => r.by === 'ohne').length, taps: T.length};
  }
