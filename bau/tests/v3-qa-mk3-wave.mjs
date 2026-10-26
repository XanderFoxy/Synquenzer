import {launch, open, J} from './v3-qa-mk3-lib.mjs';
const b = await launch();
const {ctx, page, errs} = await open('L1');
await page.evaluate(async () => { ensureAudio(); await new Promise(q => setTimeout(q, 800)); const D = SYNQUENZER; D.mkSet(0, 'mode', 1); D.mkSet(0, 't.1.o1.w', 5); D.mkSet(0, 't.1.o1.c2', 2 * 29); D.mkSet(0, 't.0.o1.w', 0); try { Autosave.now ? Autosave.now() : Autosave.save(); } catch (e) {} });
await page.waitForTimeout(1500);
console.log('before reload mkInfo', J(await page.evaluate(() => SYNQUENZER.mkInfo())));
await page.reload(); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
await page.evaluate(async () => { ensureAudio(); await new Promise(q => setTimeout(q, 2500)); });
const r = await page.evaluate(async () => { const m = SYNQUENZER.mkGet(0); const info = SYNQUENZER.mkInfo(); return {mode: m.mode, w: m.t[1].o1.w, c2: m.t[1].o1.c2, info}; });
console.log('after reload (no editor opened):', J(r));
// live vs offline: play the note on the live engine and compare spectrum shape with mkRender (wave 30 vs placeholder saw)
const cmp = await page.evaluate(async () => {
  const E = AU.synth[0]; if (!E || !E.node) return 'kein Knoten';
  const an = AU.ctx.createAnalyser(); an.fftSize = 8192; an.smoothingTimeConstant = 0; E.node.connect(an);
  const s = deep(sndOf(0)); s.p.mk.t[0].a.lvl = 0; const q = deep(sndOf(0)); q.p.mk.t[0].a.lvl = 0; SYNQUENZER.mkSet(0, 't.0.a.lvl', 0);
  await new Promise(q => setTimeout(q, 200)); inputDown(57, 'qw', .9); await new Promise(q => setTimeout(q, 700));
  const F = new Float32Array(an.frequencyBinCount); an.getFloatFrequencyData(F); inputUp('qw');
  const bin = AU.ctx.sampleRate / an.fftSize, f0 = 220, h = []; for (let k = 1; k <= 8; k++) { const i = Math.round(k * f0 / bin); h.push(Math.max(F[i - 1], F[i], F[i + 1])); }
  const r = await SYNQUENZER.mkRender(s, [[0, 'on', 57, .9]], {sec: .8}); // offline spectrum
  const N = 8192, x = r.l.slice(19200, 19200 + N); const ho = []; for (let k = 1; k <= 8; k++) { let re = 0, im = 0; for (let i = 0; i < N; i++) { const w = .5 - .5 * Math.cos(2 * Math.PI * i / N), a = 2 * Math.PI * k * f0 * i / AU.ctx.sampleRate; re += x[i] * w * Math.cos(a); im += x[i] * w * Math.sin(a); } ho.push(20 * Math.log10(Math.hypot(re, im) + 1e-12)); }
  const rel = a => a.map(v => +(v - a[0]).toFixed(1)); return {live: rel(h), offline: rel(ho), info: SYNQUENZER.mkInfo()};
});
console.log('T2 alone, harmonics 1..8 relative to H1 — live', J(cmp.live), ' offline', J(cmp.offline), J(cmp.info));
console.log('errs', errs);
await ctx.close(); await b.close();
