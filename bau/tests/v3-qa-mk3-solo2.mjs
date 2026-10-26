import {launch, open, tap, drag, lcd, panel, undoN, mkg, leds, J, pickPop} from './v3-qa-mk3-lib.mjs';
const b = await launch();
const {ctx, page, errs} = await open('L1');
console.log('before: AU.ctx', await page.evaluate(() => !!AU.ctx), 'AU.synth[0]', await page.evaluate(() => !!(AU.synth && AU.synth[0])));
await page.evaluate(() => { SYNQUENZER.mkSet(0, 'mode', 1); SYNQUENZER.mkSet(0, 't.0.o1.w', 3); SYNQUENZER.mkSet(0, 't.1.o1.w', 3); SYNQUENZER.mkSet(0, 't.1.trans', 24); MKUI.render(); });
await tap(page, 'shift'); await tap(page, 'timbre');
console.log('after SHIFT+TIMBRE: panel.solo', (await panel(page)).solo, 'leds', await leds(page), 'AU.ctx', await page.evaluate(() => AU.ctx && AU.ctx.state), 'AU.synth[0]', await page.evaluate(() => !!(AU.synth && AU.synth[0] && AU.synth[0].node)));
// now play a key (as a touch on the app keyboard would: inputDown)
const res = await page.evaluate(async () => { ensureAudio(); await new Promise(q => setTimeout(q, 1200)); inputDown(64, 'qs', .9); await new Promise(q => setTimeout(q, 150));
  const E = AU.synth[0]; if (!E || !E.node) return 'kein Knoten'; const an = AU.ctx.createAnalyser(); an.fftSize = 32768; an.smoothingTimeConstant = 0; E.node.connect(an); await new Promise(q => setTimeout(q, 900));
  const F = new Float32Array(an.frequencyBinCount); an.getFloatFrequencyData(F); const bin = AU.ctx.sampleRate / an.fftSize, f0 = 440 * 2 ** ((64 - 69) / 12), at = f => { const k = Math.round(f / bin); return Math.max(F[k - 2], F[k - 1], F[k], F[k + 1], F[k + 2]); };
  inputUp('qs'); return {T1: at(f0), T2: at(f0 * 4), uiSolo: MKUI.P.solo}; });
console.log('first note after solo set before the audio engine existed:', J(res));
await ctx.close(); await b.close();
