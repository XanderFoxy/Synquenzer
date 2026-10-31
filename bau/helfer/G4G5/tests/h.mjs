// G4/G5-Harness (nach VS-P n4-vs-p-h.mjs): Mikro-Attrappe, Mitschnitt beliebiger Knoten, BS.1770 im Browser
// VS-P Harness: Mikro-Attrappe im selben AudioContext (v3-vs2-h INIT), Mitschnitt beliebiger Knoten, BS.1770-Bibliothek im Browser
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
import {INIT, b64, resample} from './vs2h.mjs';
import {renderVoice} from './corpus.mjs';
export {b64, resample};
export const S = '/home/user/Synquenzer/bau/helfer/G4G5/tests';
export const SCR = process.env.G4OUT || '/tmp/claude-0/-home-user-Synquenzer/29223b23-4473-59d0-bff6-414411fb3e0d/scratchpad/out';
export const APP = '/home/user/Synquenzer/bau/helfer/G4G5/index.html', BASE = '/home/user/Synquenzer/bau/werkzeug/vs-base-B.html', OUT = SCR;
const LIB = fs.readFileSync(S + '/lib.mjs', 'utf8').replace(/^export /gm, '');
const CAP = `
window.__L = (() => { ${LIB}; return {kq, lufs, truePeakDb, rmsDbF}; })();
// Mitschnitt: node → ScriptProcessor (2 Kanäle), gestartet/gestoppt per Name
window.__caps = {};
window.__cap = (name, node) => { const ctx = window.__ctx, sp = ctx.createScriptProcessor(4096, 2, 2), g = ctx.createGain(); g.gain.value = 0;
  sp.channelCountMode = 'explicit'; sp.channelInterpretation = 'speakers';
  const C = {L: [], R: [], on: true, t0: null}; sp.onaudioprocess = e => { if (!C.on) return; if (C.t0 == null) C.t0 = e.playbackTime; C.L.push(new Float32Array(e.inputBuffer.getChannelData(0))); C.R.push(new Float32Array(e.inputBuffer.getChannelData(1))); };
  node.connect(sp); sp.connect(g); g.connect(ctx.destination); C.sp = sp; C.node = node; window.__caps[name] = C; return true; };
window.__capGet = name => { const C = window.__caps[name]; C.on = false; try { C.node.disconnect(C.sp); } catch (e) {} const cat = a => { const n = a.reduce((s, x) => s + x.length, 0), y = new Float32Array(n); let o = 0; for (const x of a) { y.set(x, o); o += x.length; } return y; }; return {L: cat(C.L), R: cat(C.R), t0: C.t0}; };
window.__capStat = (name, skipSec) => { const c = window.__capGet(name), sr = window.__ctx.sampleRate, k = Math.round((skipSec || 0) * sr), L = c.L.subarray(k), R = c.R.subarray(k);
  const lu = window.__L.lufs([L, R], sr); return {lufs: lu.lufs, blocks: lu.blocks, tp: window.__L.truePeakDb([L, R]), rmsL: window.__L.rmsDbF(L), sec: +(L.length / sr).toFixed(2)}; };
`;
export async function open(o = {}) {
  const br = o.br || await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await br.newContext({viewport: o.viewport || {width: 390, height: 844}, hasTouch: !!o.touch, isMobile: !!o.mobile});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(INIT); await p.addInitScript(CAP);
  await p.goto('file://' + (o.file || APP)); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version);
  await p.waitForTimeout(400);
  return {br, ctx, p, errs};
}
export async function micOn(p, route = 'wired') {
  await p.evaluate(r => { SYNQUENZER.play(); SYNQUENZER.stop(); return SYNQUENZER.stimmeStart({route: r, cal: false}); }, route);
  await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live' && SYNQUENZER.vsClock().ring && SYNQUENZER.vsClock().ring.end > 0, null, {timeout: 10000});
  await p.waitForTimeout(500);
  return p.evaluate(() => SYNQUENZER.vsClock().sr);
}
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export async function waitBeat(p, b) { await p.waitForFunction(b => { const c = SYNQUENZER.vsClock(); return c.playing && (c.now - c.outLat - c.start) / c.spb >= b; }, b, {timeout: 120000, polling: 20}); }
export async function idle(p) { await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy && !SYNQUENZER.tkInfo().pend.length && SYNQUENZER.tkInfo().writes === 0, null, {timeout: 60000}); await sleep(200); }
// gesungene Phrase (16 kHz Korpus-Stimme → sr), RMS der stimmhaften Teile auf rmsDb gesetzt
export function voice(bars, bpm, sr, rmsDb, o = {}) {
  const sp = 60 / bpm, mel = [57, 60, 62, 64, 65, 64, 62, 60, 59, 62, 64, 67, 65, 64, 62, 60], notes = [];
  for (let b = 0; b < bars * 4; b += 1) { if (b % 8 === 7) continue; notes.push({on: 0.04 + b * sp, dur: sp * 0.92, midi: mel[(b >> 0) % mel.length] - (o.low ? 12 : 0), legato: b % 2 === 1, rest: 0}); }
  const x16 = renderVoice(notes, {voice: o.voice || 'male', seed: o.seed || 5, sigma: 10, vib: [25, 45], bpm}).x;
  let y = resample(x16, 16000, sr);
  let ss = 0, nv = 0; const thr = 0; let pk = 0; for (const v of y) pk = Math.max(pk, Math.abs(v));
  for (let i = 0; i < y.length; i++) { const a = Math.abs(y[i]); if (a > pk * 0.02) { ss += y[i] * y[i]; nv++; } }
  // RMS über die gesungenen Abschnitte (Fenster mit Signal), nicht über Pausen
  const W = Math.round(sr * 0.05); let s2 = 0, n2 = 0; for (let k = 0; k + W <= y.length; k += W) { let e = 0; for (let i = k; i < k + W; i++) e += y[i] * y[i]; if (e / W > (pk * 0.05) ** 2) { s2 += e; n2 += W; } }
  const g = Math.pow(10, rmsDb / 20) / Math.sqrt(s2 / n2); for (let i = 0; i < y.length; i++) y[i] *= g;
  return y;
}
