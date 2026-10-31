// Stereo-Mitschnitt des App-Ausgangs (AudioWorklet, Blöcke in Ankunftsreihenfolge wie VS5a-fix2, beide Kanäle)
export async function rec2Start(p) {
  return p.evaluate(async () => {
    if (!window.__ctx) ensureAudio();
    const ctx = window.__ctx; if (ctx.state !== 'running') await ctx.resume();
    if (!window.__qr2) {
      const src = "class R extends AudioWorkletProcessor{process(i){const a=i[0];this.port.postMessage({l:a&&a[0]?a[0].slice(0):null,r:a&&a[1]?a[1].slice(0):(a&&a[0]?a[0].slice(0):null)});return true;}}registerProcessor('qarec2',R);";
      await ctx.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src));
      const n = new AudioWorkletNode(ctx, 'qarec2', {numberOfInputs: 1, numberOfOutputs: 1, channelCount: 2, channelCountMode: 'explicit'});
      n.port.onmessage = e => { if (window.__q2on) window.__q2.push(e.data); };
      for (const o of window.__outs) { try { o.connect(n); } catch (e) {} }
      const g = ctx.createGain(); g.gain.value = 0; n.connect(g); g.connect(ctx.destination); window.__qr2 = n;
    }
    window.__q2 = []; window.__q2on = true; return ctx.sampleRate;
  });
}
export async function rec2Stop(p) {
  return p.evaluate(() => {
    window.__q2on = false; const Q = window.__q2, n = Q.length * 128, l = new Float32Array(n), r = new Float32Array(n);
    Q.forEach((q, k) => { if (q.l) l.set(q.l, k * 128); if (q.r) r.set(q.r, k * 128); });
    return {sr: window.__ctx.sampleRate, l: Array.from(l), r: Array.from(r)};
  });
}
// Lautheit (BS.1770: K-Filter, 400-ms-Blöcke, absolutes Tor −70 LUFS, relatives Tor −10 LU), beide Kanäle
export function lufs(l, r, sr) {
  const kf = x => { // Vorfilter (Shelf) + RLB (Hochpass), Koeffizienten für 48 kHz
    const b1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], a1 = [1, -1.69065929318241, 0.73248077421585], b2 = [1, -2, 1], a2 = [1, -1.99004745483398, 0.99007225036621];
    const f = (x, b, a) => { const y = new Float64Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const v = x[i], o = b[0] * v + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2; x2 = x1; x1 = v; y2 = y1; y1 = o; y[i] = o; } return y; };
    return f(f(x, b1, a1), b2, a2); };
  const L = kf(l), Rr = kf(r), B = Math.round(0.4 * sr), H = Math.round(0.1 * sr), z = [];
  for (let s = 0; s + B <= L.length; s += H) { let e = 0; for (let i = s; i < s + B; i++) e += L[i] * L[i] + Rr[i] * Rr[i]; z.push(e / B); }
  const ld = e => -0.691 + 10 * Math.log10(e + 1e-20);
  let g = z.filter(e => ld(e) > -70); if (!g.length) return -99;
  const m = g.reduce((a, b) => a + b, 0) / g.length; g = g.filter(e => ld(e) > ld(m) - 10);
  return ld(g.reduce((a, b) => a + b, 0) / g.length);
}
