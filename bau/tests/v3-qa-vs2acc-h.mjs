// QA VS2 (Abnahme-Linse): eigener Harness. Mikro-Attrappe im selben AudioContext (getUserMedia → MediaStreamDestination);
// __q.play(b64 Float32, ctxTime, sr) spielt ein Signal ins „Mikrofon“; __q.loop(db, ms) legt den App-Ausgang (Lautsprecher-Übersprechen) ins Mikro.
import {chromium} from 'playwright';
export const EXE = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
export const FILE = 'file:///tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-wt/index.html';
export const VP = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180]};
const INIT = () => {
  const O = window.AudioContext;
  window.AudioContext = class extends O { constructor(o) { super(o); window.__ctx = this; const sp = window.__q.spk = O.prototype.createGain.call(this); sp.gain.value = 0; } };
  const C0 = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (d, ...a) { const r = C0.call(this, d, ...a); try { const q = window.__q; if (q && q.spk && d === this.context.destination && this !== q.spk) C0.call(this, q.spk); } catch (e) {} return r; };
  window.webkitAudioContext = window.AudioContext;
  const Q = window.__q = {gum: 0, srcs: [], label: 'Eingebautes Mikrofon'};
  if (!navigator.mediaDevices) return;
  navigator.mediaDevices.getUserMedia = async () => {
    Q.gum++;
    const ctx = window.__ctx, dest = ctx.createMediaStreamDestination(); dest.channelCount = 1;
    const g = ctx.createGain(); g.connect(dest); Q.dest = dest; Q.bus = g;
    const nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = nb.getChannelData(0); let s = 4242;
    for (let i = 0; i < d.length; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 2147483647 - 0.5) * 0.0006; }
    const ns = ctx.createBufferSource(); ns.buffer = nb; ns.loop = true; ns.connect(g); ns.start();
    const st = dest.stream; const tr = st.getAudioTracks()[0];
    try { Object.defineProperty(tr, 'label', {get: () => Q.label}); } catch (e) {}
    return st;
  };
  Q.play = (b64, when, sr) => {
    const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    const x = new Float32Array(u.buffer), ctx = window.__ctx, b = ctx.createBuffer(1, x.length, sr || ctx.sampleRate); b.getChannelData(0).set(x);
    const src = ctx.createBufferSource(); src.buffer = b; src.connect(Q.bus); src.start(when); Q.srcs.push(src); return when;
  };
  Q.loop = (db, ms) => { const ctx = window.__ctx, dl = ctx.createDelay(1); dl.delayTime.value = ms / 1000; Q.spk.gain.value = Math.pow(10, db / 20); Q.spk.connect(dl); dl.connect(Q.bus); Q.lp = {dl}; return true; };
};
export async function open(o = {}) {
  const br = await chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']});
  const vp = o.vp ? {width: VP[o.vp][0], height: VP[o.vp][1]} : {width: 390, height: 844};
  const ctx = await br.newContext({viewport: vp, hasTouch: o.touch !== false, isMobile: !!o.mobile, deviceScaleFactor: 1});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(INIT);
  await p.goto(FILE); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version);
  await p.waitForTimeout(500);
  return {br, p, errs};
}
export const b64 = x => Buffer.from(new Float32Array(x).buffer).toString('base64');
export function resample(x, from, to) { const r = from / to, n = Math.floor(x.length / r), y = new Float32Array(n); for (let i = 0; i < n; i++) { const q = i * r, k = Math.floor(q), f = q - k; y[i] = (x[k] || 0) * (1 - f) + (x[k + 1] || 0) * f; } return y; }
export const sleep = ms => new Promise(r => setTimeout(r, ms));
// eigene Stimme (unabhängig vom Korpus des Builders): Teiltöne mit Formant-Gewicht, Vibrato ab 250 ms, Anschleifen von unten,
// kurzer Konsonant am Einsatz, Pause zwischen Noten 'gap' s (0 = gebunden ohne Lücke, 'dip' = nur 12-dB-Einbruch)
export function voice(notes, o = {}) {
  const fs = o.fs || 48000, end = Math.max(...notes.map(n => n.on + n.dur)) + 0.4, N = Math.ceil(end * fs), x = new Float32Array(N);
  let seed = o.seed || 99; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const F = o.formant || [[700, 120, 1], [1150, 150, 0.45], [2500, 200, 0.2]];
  const fg = f => { let g = 0.02; for (const [c, bw, a] of F) g += a / Math.sqrt(1 + ((f - c) / (bw / 2)) ** 2); return g; };
  let ph = 0;
  notes.forEach((nt, k) => {
    const a = Math.round(nt.on * fs), len = Math.round(nt.dur * fs) - Math.round((o.gap != null ? o.gap : 0.04) * fs), cent = (nt.ct || 0) + (o.detune || 0);
    const vd = (o.vib != null ? o.vib : 40) / 100, vr = 5.5;
    for (let j = 0; j < len; j++) {
      const t = j / fs; let m = nt.m + cent / 100;
      if (o.scoop !== false && k % 2 === 0) m -= 0.8 * Math.exp(-t / 0.03);
      if (t > 0.25) m += vd * Math.min(1, (t - 0.25) / 0.1) * Math.sin(2 * Math.PI * vr * t);
      const f0 = 440 * Math.pow(2, (m - 69) / 12); ph += 2 * Math.PI * f0 / fs;
      let s = 0; const K = Math.min(40, Math.floor(7000 / f0)); for (let h = 1; h <= K; h++) s += fg(h * f0) / h * Math.sin(h * ph);
      let e = Math.min(1, t / 0.012) * Math.min(1, (len - j) / fs / 0.025);
      if (o.dip && j > len - 0.05 * fs) e *= 0.25;
      x[a + j] += 0.12 * e * s;
    }
    if (o.cons !== false) for (let j = 0; j < 0.008 * fs; j++) if (a + j - Math.round(0.004 * fs) >= 0) x[a + j - Math.round(0.004 * fs)] += (rnd() * 2 - 1) * 0.03 * Math.exp(-j / (0.003 * fs));
  });
  return x;
}
// Säge (Instrument), optional Sub −1 Okt.
export function saw(notes, o = {}) {
  const fs = o.fs || 48000, end = Math.max(...notes.map(n => n.on + n.dur)) + 0.3, N = Math.ceil(end * fs), x = new Float32Array(N);
  for (const nt of notes) {
    const f = 440 * Math.pow(2, (nt.m - 69) / 12), a = Math.round(nt.on * fs), len = Math.round((nt.dur - 0.03) * fs), K = Math.floor(9000 / f);
    for (let j = 0; j < len; j++) { const t = j / fs; let s = 0; for (let h = 1; h <= K; h++) s += Math.sin(2 * Math.PI * h * f * t) / h; if (o.sub) s += 0.6 * Math.sin(Math.PI * f * t); x[a + j] += 0.12 * s * Math.min(1, t / 0.004) * Math.min(1, (len - j) / fs / 0.01); }
  }
  return x;
}
// Mikro an über die Test-API (Weg Kabel, ohne Einmessen) und Laufzeit der Attrappe auf die Latenz der App legen
export async function micOnApi(p, route = 'wired') {
  await p.evaluate(r => { SYNQUENZER.play(); SYNQUENZER.stop(); return SYNQUENZER.stimmeStart({route: r, cal: false}); }, route);
  await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live' && SYNQUENZER.vsClock().ring && SYNQUENZER.vsClock().ring.end > 0, null, {timeout: 8000});
  await p.waitForTimeout(600);
  return calib(p);
}
export async function calib(p) {
  const sr = await p.evaluate(() => SYNQUENZER.vsClock().sr);
  const click = new Float32Array(Math.round(sr * 0.01)); for (let i = 0; i < 24; i++) click[i] = 0.8 * (i % 2 ? -1 : 1);
  const when = await p.evaluate(([b, sr]) => { const t = window.__ctx.currentTime + 0.15; window.__q.play(b, t, sr); return t; }, [b64(click), sr]);
  await p.waitForTimeout(600);
  const D = await p.evaluate(([when, sr]) => { const a = Math.round(when * sr) - 200, r = SYNQUENZER.stimmeRead(a, a + Math.round(sr * 0.3)); if (!r) return null; let mi = 0; for (let i = 0; i < r.mic.length; i++) if (Math.abs(r.mic[i]) > Math.abs(r.mic[mi])) mi = i; return (r.a + mi - when * sr) / sr * 1000; }, [when, sr]);
  const cur = await p.evaluate(() => SYNQUENZER.stimme().latMs);
  if (D != null) await p.evaluate(d => SYNQUENZER.stimmeNudge(d), D - cur);
  return {D, sr};
}
// Signal so einplanen, dass Sekunde `lead` des Signals auf Schlag `beat` liegt
export async function playAtBeat(p, x, beat, lead, sr = 48000) {
  return p.evaluate(([b, beat, lead, sr]) => { const c = SYNQUENZER.vsClock(); const t = c.start + beat * c.spb - lead; window.__q.play(b, t, sr); return t - window.__ctx.currentTime; }, [b64(x), beat, lead, sr]);
}
export async function waitBeat(p, b) { await p.waitForFunction(b => { const c = SYNQUENZER.vsClock(); return c.playing && (c.now - c.outLat - c.start) / c.spb >= b; }, b, {timeout: 90000, polling: 10}); }
export async function result(p) { await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy, null, {timeout: 20000}); await sleep(150); return p.evaluate(() => SYNQUENZER.vsResult()); }
