// G10a-Testhilfe: Chromium mit Fake-Mikro (optional WAV), Abgriff der Ausgänge, kleine Helfer
import {createRequire} from 'module';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
const require = createRequire(import.meta.url);
const {chromium} = require('playwright');
export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const APP = process.env.G10A_APP || path.resolve(HERE, '..', 'index.html');
export const BASE = path.resolve(HERE, '..', '..', '..', 'snapshots', 'R-4300.html');
export const TMP = process.env.G10A_TMP || path.join(HERE, '.tmp'); fs.mkdirSync(TMP, {recursive: true});
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export function writeWav(file, x, sr) {
  const n = x.length, b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVE', 8); b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(x[i] * 32767))), 44 + i * 2);
  fs.writeFileSync(file, b);
}
// stimmähnlicher Ton (Grundton + Obertöne, leichtes Vibrato), Hüllkurve env(t) 0…1
export function voice(f, sec, sr, amp = .3, env = null) {
  const n = Math.round(sec * sr), y = new Float32Array(n); let ph = 0;
  for (let i = 0; i < n; i++) { const t = i / sr, ff = f * (1 + .004 * Math.sin(2 * Math.PI * 5.5 * t)); ph += 2 * Math.PI * ff / sr; const e = env ? env(t) : 1; y[i] = amp * e * (Math.sin(ph) + .4 * Math.sin(2 * ph) + .2 * Math.sin(3 * ph)) / 1.6; }
  return y;
}
const INIT = () => {
  const O = window.AudioContext;
  window.AudioContext = class extends O { constructor(o) { super(o); window.__ctx = this; } };
  window.webkitAudioContext = window.AudioContext;
  window.__outs = [];
  const oc = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (d, ...r) { try { if (d instanceof AudioDestinationNode) window.__outs.push(this); } catch (e) {} return oc.call(this, d, ...r); };
  // Ausgang mitschneiden (ScriptProcessor, Kontextzeit je Block)
  window.__recOut = () => { const ctx = window.__ctx, sp = ctx.createScriptProcessor(2048, 1, 1), g = ctx.createGain(); g.gain.value = 0; window.__rec = []; sp.onaudioprocess = e => window.__rec.push({t: e.playbackTime, d: Array.from(e.inputBuffer.getChannelData(0))}); for (const n of window.__outs) { try { n.connect(sp); } catch (e) {} } sp.connect(g); g.connect(ctx.destination); window.__sp = sp; return true; };
};
export async function launch(wav) {
  const args = ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'];
  if (wav) args.push('--use-file-for-fake-audio-capture=' + wav);
  return chromium.launch({args});
}
export async function open(br, o = {}) {
  const ctx = o.ctx || await br.newContext({viewport: o.viewport || {width: 428, height: 926}, deviceScaleFactor: o.dpr || 1, hasTouch: !!o.touch, isMobile: !!o.mobile});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(INIT);
  await p.goto('file://' + (o.app || APP)); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version);
  await sleep(500);
  return {ctx, p, errs};
}
export async function micOn(p, route = 'wired') {
  await p.evaluate(r => { SYNQUENZER.play(); SYNQUENZER.stop(); return SYNQUENZER.stimmeStart({route: r, cal: false}); }, route);
  await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live' && SYNQUENZER.vsClock().ring && SYNQUENZER.vsClock().ring.end > 0, null, {timeout: 15000});
  await sleep(600);
}
export async function waitBeat(p, b) { await p.waitForFunction(b => { const c = SYNQUENZER.vsClock(); return c.playing && (c.now - c.outLat - c.start) / c.spb >= b; }, b, {timeout: 90000, polling: 20}); }
export async function idle(p) { await p.waitForFunction(() => !SYNQUENZER.tkInfo().pend.length && SYNQUENZER.tkInfo().writes === 0, null, {timeout: 30000}); await sleep(300); }
export const deq = (a, b) => JSON.stringify(sortK(a)) === JSON.stringify(sortK(b));
function sortK(o) { if (Array.isArray(o)) return o.map(sortK); if (o && typeof o === 'object') { const r = {}; for (const k of Object.keys(o).sort()) r[k] = sortK(o[k]); return r; } return o; }
// Ergebnis-Sammler
export function report(name) {
  const R = {name, ok: true, checks: []};
  R.check = (label, cond, info) => { R.checks.push({label, ok: !!cond, info: info === undefined ? null : info}); if (!cond) R.ok = false; console.log((cond ? '  ✓ ' : '  ✗ ') + label + (info !== undefined ? '  ' + JSON.stringify(info) : '')); };
  R.done = () => { fs.writeFileSync(path.join(TMP, name + '.json'), JSON.stringify(R, null, 1)); console.log((R.ok ? 'GRÜN ' : 'ROT ') + name); process.exitCode = R.ok ? 0 : 1; };
  return R;
}
