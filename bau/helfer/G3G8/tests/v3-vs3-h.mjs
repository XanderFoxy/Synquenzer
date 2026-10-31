// VS3 Browser-Harness: wie v3-vs2-h (Mikro-Attrappe im selben AudioContext), dazu Loopback (App-Ausgang → Mikro mit Laufzeit)
import {chromium} from 'playwright';
import {INIT as INIT2, b64, resample} from './v3-vs2-h.mjs';
export {b64, resample};
export const EXE = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
export const APP = new URL('../index.html', import.meta.url).pathname;
const LOOP = () => {
  window.__outs = [];
  const oc = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (d, ...r) { try { if (typeof AudioDestinationNode !== 'undefined' && d instanceof AudioDestinationNode) window.__outs.push(this); } catch (e) {} return oc.call(this, d, ...r); };
  // Loopback: alles, was die App ausgibt, kommt um sec Sekunden verzögert ins Mikrofon (Kabel)
  window.__loop = sec => { const F = window.__fake, ctx = window.__ctx; if (!F || !F.bus) return false; const dl = ctx.createDelay(1); dl.delayTime.value = sec; const g = ctx.createGain(); g.gain.value = 0.7; for (const n of window.__outs) { try { n.connect(dl); } catch (e) {} } dl.connect(g); g.connect(F.bus); window.__loopN = {dl, g}; return true; };
  window.__unloop = () => { const L = window.__loopN; if (L) { try { L.g.disconnect(); } catch (e) {} window.__loopN = null; } };
  // Ausgang mitschneiden (Pegel): Analyser an allen Ausgängen
  window.__tap = () => { const ctx = window.__ctx, a = ctx.createAnalyser(); a.fftSize = 8192; for (const n of window.__outs) { try { n.connect(a); } catch (e) {} } window.__an = a; return true; };
  window.__lvl = () => { const a = window.__an; if (!a) return null; const b = new Float32Array(a.fftSize); a.getFloatTimeDomainData(b); let s = 0; for (const v of b) s += v * v; const f = new Float32Array(a.frequencyBinCount); a.getFloatFrequencyData(f); let mi = 0; for (let i = 1; i < f.length; i++) if (f[i] > f[mi]) mi = i; return {rmsDb: 10 * Math.log10(s / b.length + 1e-20), peakHz: mi * window.__ctx.sampleRate / a.fftSize}; };
};
export async function open(o = {}) {
  const br = o.br || await chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = o.ctx || await br.newContext({viewport: o.viewport || {width: 390, height: 844}, hasTouch: !!o.touch, isMobile: !!o.mobile, deviceScaleFactor: o.dpr || 1});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(INIT2); await p.addInitScript(LOOP);
  await p.goto(o.url || 'file://' + (o.file || APP)); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version);
  await p.waitForTimeout(500);
  return {br, ctx, p, errs};
}
export async function micOn(p, route = 'wired') {
  await p.evaluate(r => { SYNQUENZER.play(); SYNQUENZER.stop(); return SYNQUENZER.stimmeStart({route: r, cal: false}); }, route);
  await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live' && SYNQUENZER.vsClock().ring && SYNQUENZER.vsClock().ring.end > 0, null, {timeout: 8000});
  await p.waitForTimeout(500);
  return p.evaluate(() => SYNQUENZER.vsClock().sr);
}
export const sleep = ms => new Promise(r => setTimeout(r, ms));
