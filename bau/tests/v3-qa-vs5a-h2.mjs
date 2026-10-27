// QA VS5a helpers (tester): output recorder via AudioWorklet (frame-exact), percussive beatbox-like sounds, onset at -20 dB of the event peak
export * from './v3-vs5a-h.mjs';
export const QOUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/qa-vs5a';
// sounds (sr 48000): 'b' kick (2 ms attack, 90→50 Hz), 'k' snare (1 ms attack, noise + 190 Hz), 't' hat (0.5 ms attack, HP noise)
export function beatbox(events, len, sr = 48000) {
  const n = Math.round(len * sr), y = new Float32Array(n);
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
  for (let i = 0; i < n; i++) y[i] = 0.0004 * rnd();
  for (const e of events) {
    const i0 = Math.round(e.t * sr); let ph = 0, hp1 = 0, prev = 0;
    for (let i = 0; i < 0.2 * sr && i0 + i < n; i++) {
      const u = i / sr; let v = 0;
      if (e.s === 'b') { const f = 50 + 40 * Math.exp(-u / 0.03); ph += 2 * Math.PI * f / sr; v = 0.6 * Math.sin(ph) * Math.exp(-u / 0.09) * Math.min(1, u / 0.002); }
      else if (e.s === 'k') { ph += 2 * Math.PI * 190 / sr; v = (0.35 * rnd() * Math.exp(-u / 0.05) + 0.25 * Math.sin(ph) * Math.exp(-u / 0.04)) * Math.min(1, u / 0.001); }
      else { const r = rnd(); hp1 = r - prev; prev = r; v = 0.3 * hp1 * Math.exp(-u / 0.025) * Math.min(1, u / 0.0005); }
      y[i0 + i] += v;
    }
  }
  return y;
}
// onsets: event = |x| rises above thrAbs after >= 40 ms quiet (peak of previous 40 ms < thrAbs/3); onset = first sample >= 10 % of the event peak (first 30 ms)
export function onsets20(y, sr, thrAbs = 0.02) {
  const ms = Math.max(1, Math.round(sr / 1000)), nE = Math.floor(y.length / ms), env = new Float32Array(nE), out = [];
  for (let k = 0; k < nE; k++) { let m = 0; for (let i = k * ms; i < (k + 1) * ms; i++) m = Math.max(m, Math.abs(y[i])); env[k] = m; }
  for (let k = 20; k < nE; k++) {
    if (env[k] < thrAbs) continue;
    let pr = 0; for (let j = k - 20; j <= k - 3; j++) pr = Math.max(pr, env[j]);
    if (env[k] < 4 * pr) continue;
    const a = (k - 3) * ms; let pk = 0; for (let j = a; j < Math.min(y.length, a + 30 * ms); j++) pk = Math.max(pk, Math.abs(y[j]));
    let j = a; while (j < y.length && Math.abs(y[j]) < 0.1 * pk) j++;
    out.push(j / sr); k += 40;
  }
  return out;
}
export async function recStart(p) {
  return p.evaluate(async () => {
    if (!window.__ctx) ensureAudio();
    const ctx = window.__ctx; if (ctx.state !== 'running') await ctx.resume();
    if (!window.__qrn) {
      const src = "class R extends AudioWorkletProcessor{process(i){const c=i[0]&&i[0][0];this.port.postMessage({f:currentFrame,d:c?c.slice(0):null});return true;}}registerProcessor('qarec',R);";
      await ctx.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src));
      const n = new AudioWorkletNode(ctx, 'qarec', {numberOfInputs: 1, numberOfOutputs: 1, channelCount: 1, channelCountMode: 'explicit'});
      n.port.onmessage = e => { if (window.__qon) window.__qr.push(e.data); };
      for (const o of window.__outs) { try { o.connect(n); } catch (e) {} }
      const g = ctx.createGain(); g.gain.value = 0; n.connect(g); g.connect(ctx.destination); window.__qrn = n;
    }
    window.__qr = []; window.__qon = true; return ctx.sampleRate;
  });
}
export async function recStop(p) {
  return p.evaluate(() => {
    window.__qon = false; const R = window.__qr; if (!R.length) return null;
    const f0 = R[0].f, n = R[R.length - 1].f + 128 - f0, y = new Array(n).fill(0);
    for (const r of R) if (r.d) for (let i = 0; i < r.d.length; i++) y[r.f - f0 + i] = r.d[i];
    return {f0, sr: window.__ctx.sampleRate, y};
  });
}
