// G3/G8 Test-Hilfen (Mikro-Attrappe im selben AudioContext, wie VS2/VS3)
import {open, sleep, b64, resample} from './v3-vs3-h.mjs';
import {micOn} from './v3-vs2-h.mjs';
export {open, micOn, sleep, b64, resample};
export const BPM = 120, SB = 60 / BPM;
let fail = 0;
export const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; return c; };
export const fails = () => fail;
// Töne: [[beat, dauer, hz, amp]] → Float32 in Kontext-Rate, ab Schlag b0
export function tones(list, sr, b0) {
  let end = 0; for (const [b, d] of list) end = Math.max(end, b + d);
  const n = Math.round((end - b0) * SB * sr) + 1, x = new Float32Array(n);
  for (const [b, d, f, a] of list) {
    const i0 = Math.round((b - b0) * SB * sr), i1 = Math.round((b - b0 + d) * SB * sr), A = a || .3, ramp = Math.round(.01 * sr);
    for (let i = i0; i < i1 && i < n; i++) { const e = Math.min(1, (i - i0) / ramp, (i1 - i) / ramp); x[i] += A * e * Math.sin(2 * Math.PI * f * (i - i0) / sr); }
  }
  return x;
}
// Signal x ins Mikro, so dass Sample 0 auf Transport-Schlag beat liegt (die App misst die Laufzeit der Attrappe mit micOn)
export async function singAt(p, x, beat) {
  return p.evaluate(([b, beat]) => { const c = SYNQUENZER.vsClock(); const t = c.start + beat * c.spb; window.__fake.play(b, t); return t; }, [b64(x), beat]);
}
export async function waitBeat(p, b, to = 90000) { await p.waitForFunction(b => { const c = SYNQUENZER.vsClock(); return c.playing && (c.now - c.outLat - c.start) / c.spb >= b; }, b, {timeout: to, polling: 20}); }
export async function beatNow(p) { return p.evaluate(() => { const c = SYNQUENZER.vsClock(); return (c.now - c.start) / c.spb; }); }
export async function idle(p, to = 30000) { await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy && !SYNQUENZER.tkInfo().pend.length && SYNQUENZER.tkInfo().writes === 0, null, {timeout: to}); await sleep(150); }
export async function fresh(o = {}) { const H = await open(o); await H.p.evaluate(CAPTURE); const m = await micOn(H.p, o.route); H.sr = m && m.sr ? m.sr : m; await H.p.evaluate(bpm => { SYNQUENZER.setBpm(bpm); SYNQUENZER.setMetronome(false); }, BPM); return H; }
export const deq = (a, b) => JSON.stringify(sortK(a)) === JSON.stringify(sortK(b));
export function sortK(o) { if (Array.isArray(o)) return o.map(sortK); if (o && typeof o === 'object') { const r = {}; for (const k of Object.keys(o).sort()) r[k] = sortK(o[k]); return r; } return o; }
// Ausgang mitschneiden: ScriptProcessor an allen Ausgängen (Sample-genau, mit Kontext-Zeit)
export const CAPTURE = () => {
  window.__capStart = () => {
    const ctx = window.__ctx, sp = ctx.createScriptProcessor(4096, 1, 1), sum = ctx.createGain(); sum.gain.value = 1;
    for (const n of window.__outs) { try { n.connect(sum); } catch (e) {} }
    sum.connect(sp); const z = ctx.createGain(); z.gain.value = 0; sp.connect(z); z.connect(ctx.destination);
    const C = window.__cap = {bufs: [], t0: null, sp, sum, sr: ctx.sampleRate};
    sp.onaudioprocess = e => { if (C.t0 == null) C.t0 = e.playbackTime; C.bufs.push(new Float32Array(e.inputBuffer.getChannelData(0))); };
    return true;
  };
  // neu hinzugekommene Ausgänge (z. B. STIMME-Spur) nachträglich anhängen
  window.__capMore = () => { const C = window.__cap; if (!C) return 0; let n = 0; for (const o of window.__outs) { if (o.__cap) continue; try { o.connect(C.sum); o.__cap = 1; n++; } catch (e) {} } return n; };
  window.__capStop = () => { const C = window.__cap; if (!C) return null; C.sp.onaudioprocess = null; try { C.sum.disconnect(); C.sp.disconnect(); } catch (e) {} const n = C.bufs.reduce((s, b) => s + b.length, 0), x = new Float32Array(n); let o = 0; for (const b of C.bufs) { x.set(b, o); o += b.length; } window.__cap = null; window.__capX = x; return {t0: C.t0, sr: C.sr, n}; };
  // RMS (dBFS) und Frequenz der stärksten Spitze im Mitschnitt zwischen Kontext-Zeiten a, b
  window.__capAt = (t0, a, b) => { const x = window.__capX, sr = window.__ctx.sampleRate, i0 = Math.max(0, Math.round((a - t0) * sr)), i1 = Math.min(x.length, Math.round((b - t0) * sr)); let s = 0; for (let i = i0; i < i1; i++) s += x[i] * x[i];
    // Goertzel für ein paar Frequenzen
    const G = f => { const w = 2 * Math.PI * f / sr, c = 2 * Math.cos(w); let s1 = 0, s2 = 0; for (let i = i0; i < i1; i++) { const s0 = x[i] + c * s1 - s2; s2 = s1; s1 = s0; } return 10 * Math.log10((s1 * s1 + s2 * s2 - c * s1 * s2) / Math.max(1, (i1 - i0) ** 2) + 1e-20); };
    return {rms: 10 * Math.log10(s / Math.max(1, i1 - i0) + 1e-20), f330: G(330), f440: G(440), f523: G(523.25), f660: G(660), f880: G(880), f392: G(392)}; };
  // grösste 2. Differenz (Klick-Maß) zwischen a, b
  window.__capClick = (t0, a, b) => { const x = window.__capX, sr = window.__ctx.sampleRate, i0 = Math.max(2, Math.round((a - t0) * sr)), i1 = Math.min(x.length, Math.round((b - t0) * sr)); let m = 0, mi = 0; for (let i = i0; i < i1; i++) { const d = Math.abs(x[i] - 2 * x[i - 1] + x[i - 2]); if (d > m) { m = d; mi = i; } } return {d2: m, at: t0 + mi / sr}; };
};
