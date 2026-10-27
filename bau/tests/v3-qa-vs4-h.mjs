// QA VS4 harness: REAL Chromium fake mic from a WAV file (--use-file-for-fake-audio-capture), plus an optional
// loopback "speaker" path (app output -> delay -> [tanh] -> gain -> mic bus) inserted behind the real MediaStreamSource.
import {chromium} from 'playwright';
import fs from 'fs';
export const EXE = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
export const APP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-br-VS4/index.html';
export const DIR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/qa-vs4';
fs.mkdirSync(DIR, {recursive: true});
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export function writeWav(path, x, sr) {
  const n = x.length, b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVE', 8); b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(x[i] * 32767))), 44 + i * 2);
  fs.writeFileSync(path, b);
}
const INIT = () => {
  const O = window.AudioContext;
  window.AudioContext = class extends O { constructor(o) { super(o); window.__ctx = this; } };
  window.webkitAudioContext = window.AudioContext;
  window.__outs = [];
  const oc = AudioNode.prototype.connect, od = AudioNode.prototype.disconnect;
  AudioNode.prototype.connect = function (d, ...r) { try { if (d instanceof AudioDestinationNode && !this.__qa) window.__outs.push(this); } catch (e) {} return oc.call(this, d, ...r); };
  // the real mic source is routed through a bus (voice gain) so a loopback can be mixed into "the microphone"
  const cms = O.prototype.createMediaStreamSource;
  O.prototype.createMediaStreamSource = function (st) {
    const s = cms.call(this, st), vg = this.createGain(), bus = this.createGain(); vg.__qa = bus.__qa = 1;
    oc.call(s, vg); oc.call(vg, bus);
    window.__mic = {s, vg, bus, n: (window.__mic ? window.__mic.n : 0) + 1};
    s.connect = (d, ...r) => oc.call(bus, d, ...r); s.disconnect = (...r) => od.apply(bus, r);
    return s;
  };
  window.__gum = 0; const og = navigator.mediaDevices && navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
  if (og) navigator.mediaDevices.getUserMedia = c => { window.__gum++; window.__gumC = c; return og(c); };
  window.__voice = g => { if (window.__mic) window.__mic.vg.gain.value = g; return !!window.__mic; };
  window.__loop = (sec, gain, sat, hp) => {
    const ctx = window.__ctx, M = window.__mic; if (!M) return false;
    const dl = ctx.createDelay(1); dl.delayTime.value = sec; const g = ctx.createGain(); g.gain.value = gain; dl.__qa = g.__qa = 1;
    let last = dl;
    if (hp) { const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp; f.Q.value = 0.707; f.__qa = 1; oc.call(dl, f); last = f; }
    if (sat) { const ws = ctx.createWaveShaper(), c = new Float32Array(4096); for (let i = 0; i < c.length; i++) { const x = (i / (c.length - 1) * 2 - 1) * 4; c[i] = Math.tanh(x) / 1; } ws.curve = c; const pre = ctx.createGain(); pre.gain.value = 0.25 * sat; pre.__qa = ws.__qa = 1; oc.call(last, pre); oc.call(pre, ws); last = ws; }
    for (const n of window.__outs) { try { oc.call(n, dl); } catch (e) {} }
    oc.call(last, g); oc.call(g, M.bus); window.__loopN = {dl, g}; return true;
  };
  window.__unloop = () => { const L = window.__loopN; if (L) { try { od.call(L.g); } catch (e) {} window.__loopN = null; } };
  window.__click = (amp) => { const ctx = window.__ctx, M = window.__mic, n = Math.round(ctx.sampleRate * 0.01), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < 24; i++) d[i] = amp * (i % 2 ? -1 : 1); const s = ctx.createBufferSource(); s.buffer = b; s.__qa = 1; oc.call(s, M.bus); const t = ctx.currentTime + 0.15; s.start(t); return t; };
  window.__tap = () => { const ctx = window.__ctx, a = ctx.createAnalyser(); a.fftSize = 8192; a.__qa = 1; for (const n of window.__outs) { try { oc.call(n, a); } catch (e) {} } window.__an = a; return true; };
  window.__lvl = () => { const a = window.__an; if (!a) return null; const b = new Float32Array(a.fftSize); a.getFloatTimeDomainData(b); let s = 0, pk = 0; for (const v of b) { s += v * v; pk = Math.max(pk, Math.abs(v)); } return {rmsDb: 10 * Math.log10(s / b.length + 1e-20), pk}; };
  // recorder of all app outputs (ScriptProcessor) for click/dropout analysis
  window.__recOut = () => { const ctx = window.__ctx, sp = ctx.createScriptProcessor(4096, 1, 1), g = ctx.createGain(); sp.__qa = g.__qa = 1; g.gain.value = 0; window.__rec = []; sp.onaudioprocess = e => window.__rec.push(new Float32Array(e.inputBuffer.getChannelData(0))); for (const n of window.__outs) { try { oc.call(n, sp); } catch (e) {} } oc.call(sp, g); oc.call(g, ctx.destination); window.__sp = sp; };
};
export async function launch(wav) {
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
  await p.goto(o.url || 'file://' + (o.file || APP)); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version);
  await sleep(500);
  return {ctx, p, errs, reqs};
}
// mic on, then align: click into the mic bus at a known context time → peak in the ring → nudge latency so bus time == ring time
export async function micOn(p, route) {
  await p.evaluate(r => { SYNQUENZER.play(); SYNQUENZER.stop(); return SYNQUENZER.stimmeStart({route: r, cal: false}); }, route);
  await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live' && SYNQUENZER.vsClock().ring && SYNQUENZER.vsClock().ring.end > 0, null, {timeout: 15000});
  await sleep(600);
  const sr = await p.evaluate(() => SYNQUENZER.vsClock().sr);
  await p.evaluate(() => window.__voice(0)); await sleep(150);
  const when = await p.evaluate(() => window.__click(0.9)); await sleep(700);
  const D = await p.evaluate(([when, sr]) => { const a = Math.round(when * sr) - 200, r = SYNQUENZER.stimmeRead(a, a + Math.round(sr * 0.4)); if (!r) return null; let mi = 0; for (let i = 0; i < r.mic.length; i++) if (Math.abs(r.mic[i]) > Math.abs(r.mic[mi])) mi = i; return (r.a + mi - when * sr) / sr * 1000; }, [when, sr]);
  const cur = await p.evaluate(() => SYNQUENZER.stimme().latMs);
  if (D != null) await p.evaluate(d => SYNQUENZER.stimmeNudge(d), D - cur);
  await p.evaluate(() => window.__voice(1));
  return {sr, D, lat0: cur};
}
export async function idle(p) { await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy && !SYNQUENZER.tkInfo().pend.length && SYNQUENZER.tkInfo().writes === 0, null, {timeout: 60000}); await sleep(200); }
export const deq = (a, b) => JSON.stringify(sortK(a)) === JSON.stringify(sortK(b));
function sortK(o) { if (Array.isArray(o)) return o.map(sortK); if (o && typeof o === 'object') { const r = {}; for (const k of Object.keys(o).sort()) r[k] = sortK(o[k]); return r; } return o; }
export function resample(x, from, to) { const r = from / to, n = Math.floor(x.length / r), y = new Float32Array(n); for (let i = 0; i < n; i++) { const q = i * r, k = Math.floor(q), f = q - k; y[i] = (x[k] || 0) * (1 - f) + (x[k + 1] || 0) * f; } return y; }
const db = v => 10 * Math.log10(v + 1e-30);
// align known voice y (periodic, period P samples) inside raw take; then masks + metrics for raw and cleaned
export function measure(raw, cl, y1, sr) {
  const P = y1.length, n = raw.length, reps = Math.ceil(n / P) + 2, y = new Float32Array(P * reps); for (let k = 0; k < reps; k++) y.set(y1, k * P);
  const D = 32, env = (a, len) => { const o = new Float32Array(Math.ceil(len / D)); for (let i = 0; i < len; i++) o[(i / D) | 0] += Math.abs(a[i]); return o; };
  const er = env(raw, n), ey = env(y, y.length), mr = er.reduce((s, v) => s + v, 0) / er.length;
  let best = -1e30, bl = 0;
  for (let l = -Math.ceil(P / D); l <= 0; l++) { let s = 0; for (let j = 0; j < er.length; j++) { const k = j - l; if (k >= 0 && k < ey.length) s += ey[k] * (er[j] - mr); } if (s > best) { best = s; bl = l; } }
  let fb = -1e30, off = bl * D;
  for (let d = -2 * D; d <= 2 * D; d++) { const o = bl * D + d; let s = 0; for (let i = 0; i < n; i += 2) { const k = i - o; if (k >= 0 && k < y.length) s += y[k] * raw[i]; } if (s > fb) { fb = s; off = o; } }
  const yy = new Float32Array(n); for (let i = 0; i < n; i++) { const k = i - off; if (k >= 0 && k < y.length) yy[i] = y[k]; }
  let pk = 0; for (const v of y1) pk = Math.max(pk, Math.abs(v));
  const W = Math.round(0.04 * sr), pause = new Uint8Array(n), voiced = new Uint8Array(n); let run = 0;
  for (let i = 0; i < n; i++) { if (Math.abs(yy[i]) > pk * 1e-3) run = W; else if (run > 0) run--; pause[i] = run === 0 ? 1 : 0; voiced[i] = Math.abs(yy[i]) > pk * 0.05 ? 1 : 0; }
  for (let i = n - 1, r2 = 0; i >= 0; i--) { if (Math.abs(yy[i]) > pk * 1e-3) r2 = W; else if (r2 > 0) r2--; if (r2) pause[i] = 0; }
  const pw = (z, m) => { let s = 0, c = 0; for (let i = 0; i < n; i++) if (m[i]) { s += z[i] * z[i]; c++; } return s / Math.max(1, c); };
  // projection SDR (scale-invariant) over the whole take, voiced region
  const sdr = z => { let a = 0, b = 0; for (let i = 0; i < n; i++) { a += yy[i] * z[i]; b += yy[i] * yy[i]; } const g = a / b; let s = 0, e = 0; for (let i = 0; i < n; i++) { const t = g * yy[i]; s += t * t; e += (z[i] - t) ** 2; } return {g, sdr: db(s / e)}; };
  const sr0 = sdr(raw), sc = sdr(cl);
  // longest run (10 ms frames) inside sung notes where cleaned is < −40 dB relative to the raw frame
  const F = Math.round(0.01 * sr); let worst = 0, rr = 0;
  for (let k = 0; k + F <= n; k += F) { let a = 0, b = 0, v = 0; for (let i = k; i < k + F; i++) { a += raw[i] * raw[i]; b += cl[i] * cl[i]; v += voiced[i]; } if (v > F * 0.8) { if (b < a * 1e-4) { rr += 10; worst = Math.max(worst, rr); } else rr = 0; } else rr = 0; }
  return {offMs: +(off / sr * 1000).toFixed(1), pauseMs: Math.round(pause.reduce((s, v) => s + v, 0) / sr * 1000), voicedMs: Math.round(voiced.reduce((s, v) => s + v, 0) / sr * 1000),
    echoToVoiceDb: +db(pw(raw, pause) / pw(yy, voiced)).toFixed(1), erleDb: +db(pw(raw, pause) / pw(cl, pause)).toFixed(1),
    sdrRaw: +sr0.sdr.toFixed(1), sdrClean: +sc.sdr.toFixed(1), gRaw: +(20 * Math.log10(sr0.g)).toFixed(2), gClean: +(20 * Math.log10(sc.g)).toFixed(2), gapMs: worst};
}
