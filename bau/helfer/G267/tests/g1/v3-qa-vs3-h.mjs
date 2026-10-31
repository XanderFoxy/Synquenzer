// QA VS3 harness: real Chromium fake mic from WAV file (--use-file-for-fake-audio-capture)
import {chromium} from 'playwright';
import fs from 'fs';
export const EXE = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
export const APP = '/home/user/Synquenzer/bau/helfer/G267/index.html';
export const DIR = '/home/user/Synquenzer/bau/helfer/G267/tests/g1/out';
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export function writeWav(path, x, sr) {
  const n = x.length, b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVE', 8); b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(x[i] * 32767))), 44 + i * 2);
  fs.writeFileSync(path, b);
}
// voice-like tone: fundamental + harmonics, slight vibrato
export function tone(f, sec, sr, amp = 0.3) { const n = Math.round(sec * sr), y = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { const ff = f * (1 + 0.004 * Math.sin(2 * Math.PI * 5.5 * i / sr)); ph += 2 * Math.PI * ff / sr; const env = Math.min(1, i / (0.01 * sr), (n - i) / (0.02 * sr)); y[i] = amp * env * (Math.sin(ph) + 0.4 * Math.sin(2 * ph) + 0.2 * Math.sin(3 * ph)) / 1.6; } return y; }
export function concat(...a) { const n = a.reduce((s, x) => s + x.length, 0), y = new Float32Array(n); let o = 0; for (const x of a) { y.set(x, o); o += x.length; } return y; }
const INIT = () => {
  const O = window.AudioContext;
  window.AudioContext = class extends O { constructor(o) { super(o); window.__ctx = this; } };
  window.webkitAudioContext = window.AudioContext;
  window.__outs = [];
  const oc = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (d, ...r) { try { if (d instanceof AudioDestinationNode) window.__outs.push(this); } catch (e) {} return oc.call(this, d, ...r); };
  window.__gum = 0; const og = navigator.mediaDevices && navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
  if (og) navigator.mediaDevices.getUserMedia = c => { window.__gum++; window.__gumC = c; return og(c); };
  window.__tap = () => { const ctx = window.__ctx, a = ctx.createAnalyser(); a.fftSize = 8192; for (const n of window.__outs) { try { n.connect(a); } catch (e) {} } window.__an = a; return true; };
  window.__lvl = () => { const a = window.__an; if (!a) return null; const b = new Float32Array(a.fftSize); a.getFloatTimeDomainData(b); let s = 0, pk = 0; for (const v of b) { s += v * v; pk = Math.max(pk, Math.abs(v)); } const f = new Float32Array(a.frequencyBinCount); a.getFloatFrequencyData(f); let mi = 1; for (let i = 2; i < f.length; i++) if (f[i] > f[mi]) mi = i; return {rmsDb: 10 * Math.log10(s / b.length + 1e-20), pk, peakHz: mi * window.__ctx.sampleRate / a.fftSize}; };
  // recorder of all outputs (ScriptProcessor) for click analysis
  window.__recOut = () => { const ctx = window.__ctx, sp = ctx.createScriptProcessor(4096, 1, 1), g = ctx.createGain(); g.gain.value = 0; window.__rec = []; sp.onaudioprocess = e => window.__rec.push(new Float32Array(e.inputBuffer.getChannelData(0))); for (const n of window.__outs) { try { n.connect(sp); } catch (e) {} } sp.connect(g); g.connect(ctx.destination); window.__sp = sp; };
};
export async function launch(wav, o = {}) {
  const args = ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'];
  if (wav) args.push('--use-file-for-fake-audio-capture=' + wav);
  return chromium.launch({executablePath: EXE, args});
}
export async function open(br, o = {}) {
  const ctx = o.ctx || await br.newContext({viewport: o.viewport || {width: 390, height: 844}, hasTouch: !!o.touch, isMobile: !!o.mobile});
  const p = await ctx.newPage(); const errs = [], reqs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('request', r => reqs.push({t: Date.now(), u: r.url().slice(0, 100)}));
  await p.addInitScript(INIT);
  await p.goto(o.url || 'file://' + APP); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version);
  await sleep(500);
  return {ctx, p, errs, reqs};
}
export async function micOn(p, route = 'wired') {
  await p.evaluate(r => { SYNQUENZER.play(); SYNQUENZER.stop(); return SYNQUENZER.stimmeStart({route: r, cal: false}); }, route);
  await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live' && SYNQUENZER.vsClock().ring && SYNQUENZER.vsClock().ring.end > 0, null, {timeout: 10000});
  await sleep(500);
  return p.evaluate(() => SYNQUENZER.vsClock().sr);
}
export async function waitBeat(p, b) { await p.waitForFunction(b => { const c = SYNQUENZER.vsClock(); return c.playing && (c.now - c.outLat - c.start) / c.spb >= b; }, b, {timeout: 60000, polling: 20}); }
export async function idle(p) { await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy && !SYNQUENZER.tkInfo().pend.length && SYNQUENZER.tkInfo().writes === 0, null, {timeout: 30000}); await sleep(200); }
// pitch of Int16 array segment via autocorrelation
export function pitch(x, sr) { const n = Math.min(x.length, 4096); let best = 0, bl = 0; for (let l = Math.floor(sr / 1000); l < Math.floor(sr / 70); l++) { let s = 0; for (let i = 0; i < n - l; i++) s += x[i] * x[i + l]; if (s > best) { best = s; bl = l; } } return bl ? sr / bl : 0; }
export function rmsDb(x, sc = 32767) { let s = 0; for (const v of x) s += (v / sc) ** 2; return 10 * Math.log10(s / Math.max(1, x.length) + 1e-20); }
export const deq = (a, b) => JSON.stringify(sortK(a)) === JSON.stringify(sortK(b));
function sortK(o) { if (Array.isArray(o)) return o.map(sortK); if (o && typeof o === 'object') { const r = {}; for (const k of Object.keys(o).sort()) r[k] = sortK(o[k]); return r; } return o; }
