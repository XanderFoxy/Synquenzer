import {launch, open, J} from './v3-qa-mk3-lib.mjs';
const b = await launch();
const {ctx, page, errs} = await open('L1');
await page.evaluate(async () => { ensureAudio(); await new Promise(q => setTimeout(q, 800)); const D = SYNQUENZER; D.mkSet(0, 'mode', 1); D.mkSet(0, 't.1.o1.w', 5); D.mkSet(0, 't.1.o1.c2', 2 * 29); D.mkSet(0, 't.0.a.lvl', 0); try { Autosave.now ? Autosave.now() : Autosave.save(); } catch (e) {} });
await page.waitForTimeout(1500);
const meas = () => page.evaluate(async () => {
  const E = AU.synth[0]; const an = AU.ctx.createAnalyser(); an.fftSize = 16384; E.node.connect(an);
  inputDown(57, 'qw', .9); await new Promise(q => setTimeout(q, 900)); const x = new Float32Array(an.fftSize); an.getFloatTimeDomainData(x); inputUp('qw'); await new Promise(q => setTimeout(q, 300)); E.node.disconnect(an);
  const sr = AU.ctx.sampleRate, f0 = 220, N = x.length, H = k => { let re = 0, im = 0; for (let i = 0; i < N; i++) { const w = .5 - .5 * Math.cos(2 * Math.PI * i / N), a = 2 * Math.PI * k * f0 * i / sr; re += x[i] * w * Math.cos(a); im += x[i] * w * Math.sin(a); } return 20 * Math.log10(Math.hypot(re, im) + 1e-12); };
  const s = deep(sndOf(0)); const r = await SYNQUENZER.mkRender(s, [[0, 'on', 57, .9]], {sec: 1}); const y = r.l.slice(48000 - N, 48000);
  const Ho = k => { let re = 0, im = 0; for (let i = 0; i < N; i++) { const w = .5 - .5 * Math.cos(2 * Math.PI * i / N), a = 2 * Math.PI * k * f0 * i / sr; re += y[i] * w * Math.cos(a); im += y[i] * w * Math.sin(a); } return 20 * Math.log10(Math.hypot(re, im) + 1e-12); };
  const hl = [1, 2, 3, 4, 5, 6, 7, 8].map(H), ho = [1, 2, 3, 4, 5, 6, 7, 8].map(Ho); return {live: hl.map(v => +(v - hl[0]).toFixed(1)), off: ho.map(v => +(v - ho[0]).toFixed(1)), liveH1: +hl[0].toFixed(1), offH1: +ho[0].toFixed(1)}; });
console.log('same page, T2 wave 30 alone:', J(await meas()));
await page.reload(); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
await page.evaluate(async () => { ensureAudio(); await new Promise(q => setTimeout(q, 2500)); });
console.log('after reload, editor not opened:', J(await meas()), J(await page.evaluate(() => SYNQUENZER.mkGet(0).t[1].o1)));
await ctx.close(); await b.close();
