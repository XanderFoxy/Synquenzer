if (!ONLY || ONLY === 'T8') {
  const srv = server(); const {ctx, page, errs} = await setup(srv); await go(page);
  const meas = async () => page.evaluate(async () => {
    ensureAudio(); const c = AU.ctx; await c.resume(); const an = c.createAnalyser(); an.fftSize = 4096; AU.masterSum.connect(an);
    const v = auditionStart(0, 57, .8); await new Promise(r => setTimeout(r, 250)); const b = new Float32Array(4096), f = new Float32Array(2048); let e = 0, n = 0; const spec = new Float32Array(2048);
    for (let k = 0; k < 10; k++) { await new Promise(r => setTimeout(r, 40)); an.getFloatTimeDomainData(b); for (const x of b) { e += x * x; n++; } an.getFloatFrequencyData(f); for (let i = 0; i < f.length; i++) spec[i] += Math.pow(10, f[i] / 10); }
    if (v) v.release(nowT()); await new Promise(r => setTimeout(r, 600)); try { AU.masterSum.disconnect(an); } catch (e) {}
    let num = 0, den = 0; for (let i = 0; i < spec.length; i++) { num += i * spec[i]; den += spec[i]; }
    return {rmsDb: 10 * Math.log10(e / n), centroidHz: num / den * c.sampleRate / 4096};
  });
  await page.evaluate(x => SYNQUENZER.setSound(0, x), X);
  const a = await meas();
  await page.evaluate(() => loadPreset(0, INIT_IDS.analog)); await page.waitForTimeout(300);
  const b = await meas();
  const ed = await page.evaluate(() => SYNQUENZER.getSound(0).engine);
  console.log('wrapped', JSON.stringify(a), 'INIT VA', JSON.stringify(b), 'now', ed);
  ok('T8 wrapped track sounds like INIT VA (±1.5 dB, centroid ±10%)', Math.abs(a.rmsDb - b.rmsDb) < 1.5 && Math.abs(a.centroidHz / b.centroidHz - 1) < .1, JSON.stringify({a, b}));
  ok('T8 no console errors', errs.length === 0, errs.join(' | ').slice(0, 300));
  await ctx.close();
}
