class SynqStimme extends AudioWorkletProcessor {
  constructor(o) {
    super();
    const p = (o && o.processorOptions) || {};
    this.B = p.block || 4096; this.on = true; this.n = 0; this.f0 = 0; this.last = -1; this.gaps = 0; this.q = 0;
    this.m = new Int16Array(this.B); this.r = new Int16Array(this.B); this.d = new Int16Array((this.B / 3 | 0) + 3); this.dn = 0; this.d0 = -1;
    this.pk = new Float32Array(this.B / 128 + 2); this.rm = new Float32Array(this.B / 128 + 2); this.rp = 0;
    const T = 47, h = new Float32Array(T), fc = 6800 / sampleRate; let s = 0;
    for (let i = 0; i < T; i++) { const k = i - (T - 1) / 2, w = 0.42 - 0.5 * Math.cos(2 * Math.PI * i / (T - 1)) + 0.08 * Math.cos(4 * Math.PI * i / (T - 1));
      h[i] = (k === 0 ? 2 * fc : Math.sin(2 * Math.PI * fc * k) / (Math.PI * k)) * w; s += h[i]; }
    for (let i = 0; i < T; i++) h[i] /= s;
    this.h = h; this.T = T; this.H = new Float32Array(2 * T); this.hp = 0;
    this.port.onmessage = e => { const d = e.data; if (!d) return; if (d.stop) this.on = false; if (d.cfg) this.cfg = d.cfg; if (d.mask) { this.mk.push(d.mask); if (this.mk.length > 64) this.mk.shift(); } };
    // VS2 live MPM (McLeod/Wyvill) on the 3:1 signal: window 640 (40 ms), hop 160 (10 ms), FFT 1024; key on after 2 equal hops
    this.cfg = p.mpm || null; this.mk = []; this.mW = 640; this.mN = 1024; this.mHop = 160; this.mb = new Float32Array(640); this.mp = 0; this.mc = 0;
    this.re = new Float64Array(1024); this.im = new Float64Array(1024); this.nn = new Float64Array(660); this.xw = new Float64Array(640);
    this.rev = new Uint16Array(1024); this.cs = new Float64Array(512); this.sn = new Float64Array(512);
    for (let i = 0; i < 1024; i++) { let r = 0; for (let k = 0; k < 10; k++) r |= ((i >> k) & 1) << (9 - k); this.rev[i] = r; }
    for (let i = 0; i < 512; i++) { this.cs[i] = Math.cos(2 * Math.PI * i / 1024); this.sn[i] = -Math.sin(2 * Math.PI * i / 1024); }
    this.lit = -1; this.cand = -1; this.cn = 0; this.off = 0; this.mt = 0; this.mcount = 0;
    // VS2-fix Übersprech-Sperre (Lautsprecher): die Referenz (was die App spielt) läuft durch denselben 3:1-Dezimierer in einen Ring;
    // eine Tonhöhe zählt nur als Stimme, wenn das Mikro dort deutlich mehr Energie hat als das Übersprechen der Referenz erklärt
    this.hw = new Float64Array(640); for (let j = 0; j < 640; j++) this.hw[j] = 0.5 - 0.5 * Math.cos(2 * Math.PI * j / 639);
    this.HR = new Float32Array(2 * T); this.rb = new Float32Array(8192); this.rn = 0; this.pR = 0; this.bleedN = 0;
  }
  gh(x, o, msk, f) { const fs = sampleRate / 3; if (f >= fs / 2) return 0; const c = 2 * Math.cos(2 * Math.PI * f / fs), hw = this.hw; let s1 = 0, s2 = 0; for (let j = 0; j < 640; j++) { const v = x[(o + j) & msk] * hw[j] + c * s1 - s2; s2 = s1; s1 = v; } return s1 * s1 + s2 * s2 - c * s1 * s2; }
  bleed(f) {
    const cf = this.cfg, L = Math.max(0, Math.min(7000, Math.round((cf.lat || 0) * sampleRate / 3000))); let pm = 0, pr = 0, er = 0;
    let eb = 0; for (let j = 0; j < 640; j++) eb += this.xw[j] * this.xw[j];
    for (let h = 1; h <= 3; h++) pm += this.gh(this.xw, 0, 1023, h * f);
    for (let k = -1; k <= 2; k++) { const d = L + 160 * k; if (d < 0) continue; const o = ((this.pR - 640 - d) % 8192 + 8192) % 8192; let q = 0, qb = 0; for (let h = 1; h <= 3; h++) q += this.gh(this.rb, o, 8191, h * f); for (let j = 0; j < 640; j++) { const v = this.rb[(o + j) & 8191]; qb += v * v; } if (q > pr) pr = q; if (qb > er) er = qb; }
    return pm < cf.bl * pr || eb < (cf.bb || 0) * er;     // an der Tonhöhe erklärt – oder insgesamt nicht mehr als das Übersprechen
  }
  fft(re, im, sg) {
    const N = 1024, rev = this.rev, cs = this.cs, sn = this.sn;
    for (let i = 0; i < N; i++) { const j = rev[i]; if (j > i) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
    for (let s = 2; s <= N; s <<= 1) { const hh = s >> 1, st = N / s;
      for (let i = 0; i < N; i += s) for (let k = 0; k < hh; k++) { const wr = cs[k * st], wi = sg * sn[k * st], a = i + k, c = a + hh, xr = re[c] * wr - im[c] * wi, xi = re[c] * wi + im[c] * wr; re[c] = re[a] - xr; im[c] = im[a] - xi; re[a] += xr; im[a] += xi; } }
  }
  ge(x, W, fs, f) { if (f >= fs / 2) return 0; const c = 2 * Math.cos(2 * Math.PI * f / fs); let s1 = 0, s2 = 0; for (let j = 0; j < W; j++) { const v = x[j] * (0.5 - 0.5 * Math.cos(2 * Math.PI * j / (W - 1))) + c * s1 - s2; s2 = s1; s1 = v; } return s1 * s1 + s2 * s2 - c * s1 * s2; }
  mpm(F) {
    const W = this.mW, fs = sampleRate / 3, cf = this.cfg, inst = cf.src === 'inst', fmin = inst ? 40 : 55, fmax = inst ? 1600 : 1050;
    for (let i = this.mk.length - 1; i >= 0; i--) { const m = this.mk[i]; if (m[1] < F - 3 * W - 48000) this.mk.splice(i, 1); else if (m[1] >= F - 3 * W && m[0] <= F) return; }
    const re = this.re, im = this.im, x = this.xw; let e = 0;
    for (let j = 0; j < W; j++) { const v = this.mb[(this.mp + j) % W]; x[j] = v; re[j] = v; im[j] = 0; e += v * v; }
    for (let j = W; j < 1024; j++) { re[j] = 0; im[j] = 0; }
    if (e / W > 1e-6) {
      this.fft(re, im, 1);
      for (let k = 0; k < 1024; k++) { re[k] = re[k] * re[k] + im[k] * im[k]; im[k] = 0; }
      this.pend = true; this.pF = F; this.pE = e; this.pR = this.rn;             // the second half runs in the next render quantum (no spike)
      return;
    }
    this.mpm2(F, 0, 0);
  }
  mpm2(F, f, cl) {
    const W = this.mW, fs = sampleRate / 3, cf = this.cfg, inst = cf.src === 'inst', fmin = inst ? 40 : 55, fmax = inst ? 1600 : 1050;
    const re = this.re, im = this.im, x = this.xw, pe = this.pend; this.pend = false;
    if (pe) {
      const e = this.pE;
      this.fft(re, im, -1);
      const tMax = Math.min(W - 2, Math.ceil(fs / fmin)), tMin = Math.max(2, Math.floor(fs / fmax)), n = this.nn;
      let m = 2 * e;
      for (let t = 0; t <= tMax + 1; t++) { n[t] = m > 0 ? 2 * (re[t] / 1024) / m : 0; m -= x[t] * x[t] + x[W - 1 - t] * x[W - 1 - t]; }
      let pos = false, mx = -1, mi = -1, top = 0, k = -1, nk = 0; const keys = this.keys || (this.keys = new Int16Array(400));
      for (let t = 1; t <= tMax; t++) {
        if (!pos && n[t] > 0 && n[t - 1] <= 0) { pos = true; mx = -1; mi = -1; }
        else if (pos && n[t] <= 0) { pos = false; if (mi > 0 && nk < 400) keys[nk++] = mi; }
        if (pos && t >= tMin && n[t] > mx && n[t] >= n[t - 1] && n[t] >= n[t + 1]) { mx = n[t]; mi = t; }
      }
      if (pos && mi > 0 && nk < 400) keys[nk++] = mi;
      for (let q = 0; q < nk; q++) if (n[keys[q]] > top) top = n[keys[q]];
      for (let q = 0; q < nk; q++) if (n[keys[q]] >= 0.9 * top) { k = keys[q]; break; }
      if (k > 0) { const a = n[k - 1], b = n[k], c = n[k + 1], den = a - 2 * b + c, sh = den < 0 ? 0.5 * (a - c) / den : 0; f = fs / (k + sh); cl = b - 0.25 * (a - c) * sh; }
      if (f && inst && cf.lock) for (let g = 0; g < 2 && 2 * f <= 1600; g++) { const od = this.ge(x, W, fs, 3 * f) + this.ge(x, W, fs, 5 * f) + this.ge(x, W, fs, 7 * f), ev = this.ge(x, W, fs, 2 * f) + this.ge(x, W, fs, 4 * f) + this.ge(x, W, fs, 6 * f); if (ev > 0 && od < 0.1 * ev && ev > 0.5 * this.ge(x, W, fs, f)) f *= 2; else break; }
    }
    if (f > 0 && cl >= (inst ? 0.85 : 0.8) && cf.bl > 0 && this.bleed(f)) { f = 0; this.bleedN++; }   // nur Übersprechen der App
    if (f > 0 && cl >= (inst ? 0.85 : 0.8)) {
      const note = Math.round(69 + 12 * Math.log2(f / 440)); this.off = 0;
      if (note === this.cand) this.cn++; else { this.cand = note; this.cn = 1; }
      if (this.cn >= 2 && note !== this.lit) { this.lit = note; this.port.postMessage({lit: note, f: Math.max(F, currentFrame), c: Math.round(cl * 100) / 100}); }
    } else { this.cand = -1; this.cn = 0; if (++this.off >= 3 && this.lit >= 0) { this.lit = -1; this.port.postMessage({lit: -1, f: Math.max(F, currentFrame)}); } }
  }
  flush() {
    if (!this.n) return;
    const n = this.n, msg = {f0: this.f0, m: this.m.slice(0, n), r: this.r.slice(0, n), d: this.d.slice(0, this.dn), d0: this.d0,
      pk: this.pk.slice(0, this.q), rm: this.rm.slice(0, this.q), rp: this.rp, gaps: this.gaps};
    this.port.postMessage(msg, [msg.m.buffer, msg.r.buffer, msg.d.buffer, msg.pk.buffer, msg.rm.buffer]);
    this.n = 0; this.q = 0; this.dn = 0; this.d0 = -1; this.rp = 0;
  }
  process(inputs) {
    if (!this.on) return false;
    const a = inputs[0] && inputs[0][0], b = inputs[1] && inputs[1][0], L = a ? a.length : b ? b.length : 128;
    if (this.last >= 0 && currentFrame !== this.last && this.calls > 64) this.gaps++;
    this.calls = (this.calls || 0) + 1; this.last = currentFrame + L;
    if (this.n + L > this.B) this.flush();
    if (this.pend) this.mpm2(this.pF, 0, 0);
    if (this.n === 0) this.f0 = currentFrame;
    const h = this.h, T = this.T, H = this.H, m = this.m, r = this.r, o = this.n;
    let pk = 0, ss = 0, rp = this.rp;
    for (let i = 0; i < L; i++) {
      const x = a ? a[i] : 0, y = b ? b[i] : 0, ax = x < 0 ? -x : x, ay = y < 0 ? -y : y;
      if (ax > pk) pk = ax; if (ay > rp) rp = ay; ss += x * x;
      m[o + i] = x >= 1 ? 32767 : x <= -1 ? -32767 : Math.round(x * 32767);
      r[o + i] = y >= 1 ? 32767 : y <= -1 ? -32767 : Math.round(y * 32767);
      H[this.hp] = x; H[this.hp + T] = x; this.HR[this.hp] = y; this.HR[this.hp + T] = y; this.hp = this.hp + 1 === T ? 0 : this.hp + 1;
      const F = currentFrame + i;
      if (F % 3 === 2) {
        let acc = 0; const base = this.hp; for (let k = 0; k < T; k++) acc += h[k] * H[base + k];
        if (this.cfg && this.cfg.bl > 0) { let ar = 0; const HR = this.HR; for (let k = 0; k < T; k++) ar += h[k] * HR[base + k]; this.rb[this.rn & 8191] = ar; this.rn++; }
        if (this.d0 < 0) this.d0 = (F - 2) / 3;
        this.d[this.dn++] = acc >= 1 ? 32767 : acc <= -1 ? -32767 : Math.round(acc * 32767);
        if (this.cfg) { this.mb[this.mp] = acc; this.mp = this.mp + 1 === 640 ? 0 : this.mp + 1; if (++this.mc >= 640 && this.mc % 160 === 0) this.mpm(F); }
      }
    }
    this.pk[this.q] = pk; this.rm[this.q] = Math.sqrt(ss / L); this.q++; this.rp = rp;
    this.n += L;
    if (this.n >= this.B) this.flush();
    return true;
  }
}
