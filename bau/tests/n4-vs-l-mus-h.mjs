// QA-Harness VS-L (Tester): Mikro-Attrappe im selben AudioContext (wie VS2/VS3), Gesang vorab dekodiert und genau geplant
import {chromium} from 'playwright';
import {INIT as INIT2, b64, resample} from './v3-vs2-h.mjs';
import {renderVoice} from './v3-vs2-corpus.mjs';
export const DIR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad';
export const NEW = DIR + '/vs-br-VSL/index.html', OLD = DIR + '/vs-base-B.html';
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const LEAD = 0.04;
const OUT = () => {
  window.__outs = [];
  const oc = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (d, ...r) { try { if (typeof AudioDestinationNode !== 'undefined' && d instanceof AudioDestinationNode) window.__outs.push(this); } catch (e) {} return oc.call(this, d, ...r); };
  window.__tap = () => { const ctx = window.__ctx, a = ctx.createAnalyser(); a.fftSize = 4096; for (const n of window.__outs) { try { n.connect(a); } catch (e) {} } window.__an = a; return true; };
  window.__lvl = () => { const a = window.__an; if (!a) return null; const b = new Float32Array(a.fftSize); a.getFloatTimeDomainData(b); let s = 0; for (const v of b) s += v * v; return 10 * Math.log10(s / b.length + 1e-20); };
  window.__toasts = [];
  const watch = () => { const t = document.getElementById('toast'); if (!t) return setTimeout(watch, 50); new MutationObserver(() => { const x = t.textContent.trim(); if (x && window.__toasts[window.__toasts.length - 1] !== x) window.__toasts.push(x); }).observe(t, {subtree: true, childList: true, characterData: true}); };
  document.addEventListener('DOMContentLoaded', watch);
};
export async function start(file, bpm, o = {}) {
  const br = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await br.newContext({viewport: o.viewport || {width: 390, height: 844}, hasTouch: !!o.touch, isMobile: !!o.touch});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(INIT2); await p.addInitScript(OUT);
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version); await sleep(400);
  await p.evaluate(r => { SYNQUENZER.play(); SYNQUENZER.stop(); return SYNQUENZER.stimmeStart({route: r, cal: false}); }, o.route || 'wired');
  await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live' && SYNQUENZER.vsClock().ring && SYNQUENZER.vsClock().ring.end > 0, null, {timeout: 8000});
  await sleep(400);
  const sr = await p.evaluate(() => SYNQUENZER.vsClock().sr);
  if (o.demo) await p.evaluate(() => SYNQUENZER.loadDemo());
  await p.evaluate(([bpm, mel, len]) => { SYNQUENZER.setBpm(bpm); SYNQUENZER.setMetronome(false); SYNQUENZER.setRecOptions({countIn: 0, length: len}); if (mel != null && SYNQUENZER.vsSet) SYNQUENZER.vsSet({mel}); }, [bpm, o.mel == null ? null : o.mel, o.len || 'auto']);
  await sleep(2500);
  return {br, ctx, p, errs, sr, bpm, ver: await p.evaluate(() => SYNQUENZER.version), close: () => br.close()};
}
export const sing = (notes, bpm, seed = 3) => renderVoice(notes.map(([b, d, m], k) => ({on: LEAD + b * 60 / bpm, dur: d * 60 / bpm, midi: m, legato: false, rest: k ? 0.1 : 0})), {voice: 'male', seed, sigma: 12, vib: [20, 40], bpm}).x;
// n Takte Gesang ab Schlag 0, je Takt 2 Töne (Lücken < 1 Takt), Tonhöhe + tr
export function melN(bars, tr = 0) { const sc = [57, 60, 62, 64, 65, 67, 69, 67]; const out = []; for (let b = 0; b < bars; b++) { out.push([b * 4, 1.6, sc[b % 8] + tr]); out.push([b * 4 + 2, 1.6, sc[(b + 3) % 8] + tr]); } return out; }
let PREN = 0;
export async function prep(H, x) { const y = resample(x, 16000, H.sr), k = 'g' + (++PREN); await H.p.evaluate(([b, k]) => { const bin = atob(b), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); const x = new Float32Array(u.buffer), ctx = window.__ctx, buf = ctx.createBuffer(1, x.length, ctx.sampleRate); buf.getChannelData(0).set(x); (window.__pre = window.__pre || {})[k] = buf; }, [b64(y), k]); return k; }
export async function fire(H, k, beat) { return H.p.evaluate(([k, beat, lead]) => { const c = SYNQUENZER.vsClock(), t = c.start + beat * c.spb - lead, F = window.__fake, src = window.__ctx.createBufferSource(); src.buffer = window.__pre[k]; src.connect(F.bus); src.start(t); F.srcs.push(src); return {t, now: c.now}; }, [k, beat, LEAD]); }
export async function waitBeat(p, b) { await p.waitForFunction(b => { const c = SYNQUENZER.vsClock(); return c.playing && (c.now - c.outLat - c.start) / c.spb >= b; }, b, {timeout: 300000, polling: 10}); }
export const beatNow = p => p.evaluate(() => { const c = SYNQUENZER.vsClock(); return (c.now - c.outLat - c.start) / c.spb; });
export async function idle(p) { await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy && !SYNQUENZER.tkInfo().pend.length && SYNQUENZER.tkInfo().writes === 0, null, {timeout: 90000}); await sleep(250); }
export const stInfo = (p, scene) => p.evaluate(async s => { const I = SYNQUENZER.tkInfo(), st = I.stimme; const c = st >= 0 ? SYNQUENZER.getClip(st, s) : null, m = SYNQUENZER.getClip(5, s); const tk = c && c.audio ? SYNQUENZER.takes()[c.audio.take] : null;
  return {st, len: c && c.len, audio: c && c.audio ? JSON.parse(JSON.stringify(c.audio)) : null, takeSec: tk && +(tk.len / tk.sr).toFixed(3), sr: tk && tk.sr, mel: m && {len: m.len, n: m.notes.length}, last: I.last && {late: I.last.late, pre: I.last.pre}, cstart: st >= 0 ? SYNQUENZER.runtime().cstart[st] : null, slot: st >= 0 ? SYNQUENZER.runtime().slots[st] : null}; }, scene);
// RMS (dBFS) eines Take-Stücks in Sekunden [a, b)
export const takeDb = (p, id, a, b) => p.evaluate(async ([id, a, b]) => { const m = SYNQUENZER.takes()[id]; if (!m) return -300; const s = await SYNQUENZER.tkPcmRange(id, Math.max(0, Math.round(a * m.sr)), Math.max(0, Math.round(b * m.sr))); if (!s || !s.length) return -200; let q = 0; for (const v of s) q += v * v; return +(10 * Math.log10(q / s.length / 32767 / 32767 + 1e-20)).toFixed(1); }, [id, a, b]);
// welcher Teil eines gesungenen Takts (Schläge x0..x1, absolut) im Clip abgespielt wird (Clip-Anfang cs, Länge L Takte): Pegel der gespielten Stelle
export async function sungBarHeard(p, info, cs, x0, x1, spb) {
  const a = info.audio, L = info.len * 4;
  const c0 = ((x0 - cs) % L + L) % L, c1 = c0 + (x1 - x0);
  // Clip-Schlag c → Take-Sekunde in + (c - at)·spb, nur wenn at ≤ c und Take-Sekunde < out
  const t0 = a.in + (c0 - a.at) * spb, t1 = a.in + (c1 - a.at) * spb;
  const lo = Math.max(t0, a.in), hi = Math.min(t1, a.out);
  if (hi - lo < 0.05) return {played: 0, db: -200, t0: +t0.toFixed(3), t1: +t1.toFixed(3)};
  return {played: +((hi - lo) / (t1 - t0)).toFixed(3), db: await takeDb(p, a.take, lo, hi), t0: +t0.toFixed(3), t1: +t1.toFixed(3)};
}
export const deq = (a, b) => JSON.stringify(sortK(a)) === JSON.stringify(sortK(b));
export function sortK(o) { if (Array.isArray(o)) return o.map(sortK); if (o && typeof o === 'object') { const r = {}; for (const k of Object.keys(o).sort()) r[k] = sortK(o[k]); return r; } return o; }
export const snap = p => p.evaluate(() => { const P = SYNQUENZER.project(); return {tracks: P.tracks.map(t => ({clips: t.clips, stimme: t.stimme || false, name: t.name})), song: P.song || null, takes: P.takes || null}; });
// --- Musiker-Ergänzungen ---
export async function tapSel(H, sel) { const q = await H.p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); if (!r.width) return null; return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }, sel); if (!q) return false; await H.p.touchscreen.tap(q.x, q.y); return true; }
export const toasts = p => p.evaluate(() => window.__toasts.slice());
export const undoN = p => p.evaluate(() => SYNQUENZER.undoInfo().n);
