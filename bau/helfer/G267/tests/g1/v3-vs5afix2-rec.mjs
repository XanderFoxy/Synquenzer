// VS5a-fix2: output recorder that places the quanta in ARRIVAL order (the AudioWorklet's currentFrame repeats one value now and
// then while the main thread changes the graph – placing by currentFrame then leaves a false 128-sample hole: "dip"/"click")
export async function recStart(p) {
  return p.evaluate(async () => {
    if (!window.__ctx) ensureAudio();
    const ctx = window.__ctx; if (ctx.state !== 'running') await ctx.resume();
    if (!window.__qrs) {
      const src = "class R extends AudioWorkletProcessor{process(i){const c=i[0]&&i[0][0];this.port.postMessage({f:currentFrame,d:c?c.slice(0):null});return true;}}registerProcessor('qarecs',R);";
      await ctx.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src));
      const n = new AudioWorkletNode(ctx, 'qarecs', {numberOfInputs: 1, numberOfOutputs: 1, channelCount: 1, channelCountMode: 'explicit'});
      n.port.onmessage = e => { if (window.__qon) window.__qr.push(e.data); };
      for (const o of window.__outs) { try { o.connect(n); } catch (e) {} }
      const g = ctx.createGain(); g.gain.value = 0; n.connect(g); g.connect(ctx.destination); window.__qrs = n;
    }
    window.__qr = []; window.__qon = true; return ctx.sampleRate;
  });
}
export async function recStop(p) {
  return p.evaluate(() => {
    window.__qon = false; const R = window.__qr; if (!R.length) return null;
    // place by currentFrame, except a repeated currentFrame: that quantum is the one after the previous (its own label is stale)
    const f0 = R[0].f, pos = [], gaps = []; let prevL = null, prevP = null;
    for (const r of R) { const P = prevL != null && r.f === prevL ? prevP + 128 : r.f; if (prevL != null && r.f !== prevL + 128) gaps.push([prevL / window.__ctx.sampleRate, r.f - prevL]); pos.push(P); prevL = r.f; prevP = P; }
    const n = Math.max(...pos) + 128 - f0, y = new Array(n).fill(0); let over = 0;
    R.forEach((r, k) => { if (r.d) for (let i = 0; i < r.d.length; i++) y[pos[k] - f0 + i] = r.d[i]; });
    const seen = new Set(); for (const q of pos) { if (seen.has(q)) over++; seen.add(q); }
    return {f0, sr: window.__ctx.sampleRate, y, gaps, frameOff: over};
  });
}
