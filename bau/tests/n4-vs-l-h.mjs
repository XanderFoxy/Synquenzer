// N4 VS-L Harness: wie v3-vs3-h (Mikro-Attrappe im selben AudioContext), App = Zweig VS-L
import {chromium} from 'playwright';
import {INIT as INIT2, b64, resample} from './v3-vs2-h.mjs';
import {renderVoice} from './v3-vs2-corpus.mjs';
export {b64, resample, renderVoice};
export const APP = process.env.APP || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-br-VSL/index.html';
export async function open(o = {}) {
  const br = o.br || await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = o.ctx || await br.newContext({viewport: o.viewport || {width: 390, height: 844}, hasTouch: !!o.touch, isMobile: !!o.mobile, deviceScaleFactor: o.dpr || 1});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(INIT2);
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
export const LEAD = 0.04;
// Gesang: notes [[beat, dur, midi]...] bei bpm
export const sing = (notes, bpm) => renderVoice(notes.map(([b, d, m], k) => ({on: LEAD + b * 60 / bpm, dur: d * 60 / bpm, midi: m, legato: false, rest: k ? 0.1 : 0})), {voice: 'male', seed: 3, sigma: 12, vib: [20, 40], bpm}).x;
export async function playAt(p, x, beat, sr, start) { const y = resample(x, 16000, sr); return p.evaluate(([b, beat, st, lead]) => { if (st) SYNQUENZER.play(); const c = SYNQUENZER.vsClock(); const t = c.start + beat * c.spb - lead; window.__fake.play(b, t); return t; }, [b64(y), beat, !!start, LEAD]); }
export async function waitBeat(p, b) { await p.waitForFunction(b => { const c = SYNQUENZER.vsClock(); return c.playing && (c.now - c.outLat - c.start) / c.spb >= b; }, b, {timeout: 180000, polling: 20}); }
export async function idle(p) { await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy && !SYNQUENZER.tkInfo().pend.length && SYNQUENZER.tkInfo().writes === 0, null, {timeout: 60000}); await sleep(150); }
export const deq = (a, b) => JSON.stringify(sortK(a)) === JSON.stringify(sortK(b));
export function sortK(o) { if (Array.isArray(o)) return o.map(sortK); if (o && typeof o === 'object') { const r = {}; for (const k of Object.keys(o).sort()) r[k] = sortK(o[k]); return r; } return o; }
// 16-Takt-Melodie (je Takt 2 Töne, kurze Lücken < 1 Takt)
export function mel16(bars = 16) { const sc = [57, 60, 62, 64, 65, 67, 69, 67]; const out = []; for (let b = 0; b < bars; b++) { out.push([b * 4, 1.6, sc[b % 8]]); out.push([b * 4 + 2, 1.6, sc[(b + 3) % 8]]); } return out; }
export async function rmsDb(p, id, a, b) { return p.evaluate(async ([id, a, b]) => { const s = await SYNQUENZER.tkPcmRange(id, a, b); if (!s || !s.length) return -200; let q = 0; for (const v of s) q += v * v; return 10 * Math.log10(q / s.length / 32767 / 32767 + 1e-20); }, [id, a, b]); }
