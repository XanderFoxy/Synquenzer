// VS2 Browser-Harness: Chromium mit Mikro-Attrappe im selben AudioContext (getUserMedia → MediaStreamDestination);
// __fake.play(Float32 base64, ctxTime) spielt ein Signal ins „Mikrofon“.
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
export const EXE = undefined;
export const FILE = 'file:///home/user/Synquenzer/bau/helfer/G4G5/index.html';
export const INIT = () => {
  const O = window.AudioContext;
  window.AudioContext = class extends O { constructor(o) { super(o); window.__ctx = this; } };
  window.webkitAudioContext = window.AudioContext;
  const F = window.__fake = {gum: 0, srcs: []};
  if (!navigator.mediaDevices) return;
  navigator.mediaDevices.getUserMedia = async () => {
    F.gum++;
    const ctx = window.__ctx, dest = ctx.createMediaStreamDestination(); dest.channelCount = 1;
    const g = ctx.createGain(); g.connect(dest); F.dest = dest; F.bus = g;
    const nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = nb.getChannelData(0); let s = 12345;
    for (let i = 0; i < d.length; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 2147483647 - 0.5) * 0.0008; }
    const ns = ctx.createBufferSource(); ns.buffer = nb; ns.loop = true; ns.connect(g); ns.start();
    return dest.stream;
  };
  F.play = (b64, when, sr) => {
    const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    const x = new Float32Array(u.buffer), ctx = window.__ctx, b = ctx.createBuffer(1, x.length, sr || ctx.sampleRate); b.getChannelData(0).set(x);
    const src = ctx.createBufferSource(); src.buffer = b; src.connect(F.bus); src.start(when); F.srcs.push(src); return when;
  };
};
export async function open(o = {}) {
  const br = await chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await br.newContext({viewport: o.viewport || {width: 390, height: 844}, hasTouch: !!o.touch, isMobile: !!o.mobile, deviceScaleFactor: o.dpr || 1});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(INIT);
  await p.goto(o.file ? 'file://' + o.file : FILE); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version);
  await p.waitForTimeout(400);
  return {br, p, errs};
}
export const b64 = x => Buffer.from(new Float32Array(x).buffer).toString('base64');
// 16 kHz → Kontext-Rate (linear)
export function resample(x, from, to) { const r = from / to, n = Math.floor(x.length / r), y = new Float32Array(n); for (let i = 0; i < n; i++) { const p = i * r, k = Math.floor(p), f = p - k; y[i] = (x[k] || 0) * (1 - f) + (x[k + 1] || 0) * f; } return y; }
// Mikro starten (Kabel-Weg ohne Pieptöne) und die Laufzeit der Attrappe messen → Latenz der App darauf setzen
export async function micOn(p, route = 'wired') {
  await p.evaluate(r => { SYNQUENZER.play(); SYNQUENZER.stop(); return SYNQUENZER.stimmeStart({route: r, cal: false}); }, route);
  await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live' && SYNQUENZER.vsClock().ring && SYNQUENZER.vsClock().ring.end > 0, null, {timeout: 8000});
  await p.waitForTimeout(600);
  // Klick ins Mikro bei bekannter Zeit → Spitze im Ringpuffer → Laufzeit D
  const sr = await p.evaluate(() => SYNQUENZER.vsClock().sr);
  const click = new Float32Array(Math.round(sr * 0.01)); for (let i = 0; i < click.length; i++) click[i] = (i < 24 ? 0.8 : 0) * (i % 2 ? -1 : 1);
  const when = await p.evaluate(([b, sr]) => { const t = window.__ctx.currentTime + 0.15; window.__fake.play(b, t, sr); return t; }, [b64(click), sr]);
  await p.waitForTimeout(600);
  const D = await p.evaluate(([when, sr]) => { const a = Math.round(when * sr) - 200, r = SYNQUENZER.stimmeRead(a, a + Math.round(sr * 0.3)); if (!r) return null; let mi = 0; for (let i = 0; i < r.mic.length; i++) if (Math.abs(r.mic[i]) > Math.abs(r.mic[mi])) mi = i; return (r.a + mi - when * sr) / sr * 1000; }, [when, sr]);
  const cur = await p.evaluate(() => SYNQUENZER.stimme().latMs);
  if (D != null) await p.evaluate(d => SYNQUENZER.stimmeNudge(d), D - cur);
  return {D, sr};
}
