// S012 test harness (Chromium, real touch via hasTouch/isMobile, output recorder)
import {createRequire} from 'module';
const require_ = createRequire(import.meta.url);
let PW; try { PW = require_('playwright'); } catch (e) { PW = require_('/opt/node22/lib/node_modules/playwright'); }
const {chromium} = PW;
import path from 'path'; import {fileURLToPath} from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
export const APP = process.env.S012_APP || path.resolve(HERE, '../index.html');
export const OUT = process.env.S012_OUT || '/tmp/s012-out';
import fs from 'fs'; fs.mkdirSync(OUT, {recursive: true});
export const sleep = ms => new Promise(r => setTimeout(r, ms));
const INIT = () => {
  const O = window.AudioContext;
  window.AudioContext = class extends O { constructor(o) { super(o); window.__ctx = this; } };
  window.webkitAudioContext = window.AudioContext;
  window.__outs = [];
  const oc = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (d, ...r) { try { if (d instanceof AudioDestinationNode) window.__outs.push(this); } catch (e) {} return oc.call(this, d, ...r); };
};
export const launch = () => chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
export async function open(br, o = {}) {
  const ctx = await br.newContext({viewport: o.viewport || {width: 390, height: 844}, hasTouch: o.touch !== false, isMobile: o.touch !== false});
  const p = await ctx.newPage(); const errs = [], reqs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('request', r => { const u = r.url(); if (!u.startsWith('file:') && !u.startsWith('data:') && !u.startsWith('blob:')) reqs.push(u.slice(0, 100)); });
  await p.addInitScript(INIT);
  await p.goto('file://' + APP); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version);
  await sleep(400);
  return {ctx, p, errs, reqs};
}
export const deq = (a, b) => JSON.stringify(sortK(a)) === JSON.stringify(sortK(b));
export function sortK(o) { if (Array.isArray(o)) return o.map(sortK); if (o && typeof o === 'object') { const r = {}; for (const k of Object.keys(o).sort()) r[k] = sortK(o[k]); return r; } return o; }
export function tally() { let fail = 0, n = 0; const ok = (c, m) => { n++; console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; return c; }; ok.done = () => { console.log(fail ? `FAIL ${fail}/${n}` : `ALL OK ${n}/${n}`); return fail; }; return ok; }
// output recorder (AudioWorklet, frame exact)
export async function recStart(p) {
  return p.evaluate(async () => {
    if (!window.__ctx) ensureAudio();
    const ctx = window.__ctx; if (ctx.state !== 'running') await ctx.resume();
    if (!window.__qrn) {
      const src = "class R extends AudioWorkletProcessor{process(i){const c=i[0]&&i[0][0];this.port.postMessage({f:currentFrame,d:c?c.slice(0):null});return true;}}registerProcessor('qarec',R);";
      await ctx.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src));
      const n = new AudioWorkletNode(ctx, 'qarec', {numberOfInputs: 1, numberOfOutputs: 1, channelCount: 1, channelCountMode: 'explicit'});
      n.port.onmessage = e => { if (window.__qon) window.__qr.push(e.data); };
      for (const o of window.__outs) { try { o.connect(n); } catch (e) {} }
      const g = ctx.createGain(); g.gain.value = 0; n.connect(g); g.connect(ctx.destination); window.__qrn = n;
    }
    window.__qr = []; window.__qon = true; return ctx.sampleRate;
  });
}
export async function recStop(p) {
  return p.evaluate(() => {
    window.__qon = false; const R = window.__qr; if (!R.length) return null;
    const f0 = R[0].f, n = R[R.length - 1].f + 128 - f0, y = new Array(n).fill(0);
    for (const r of R) if (r.d) for (let i = 0; i < r.d.length; i++) y[r.f - f0 + i] = r.d[i];
    return {f0, sr: window.__ctx.sampleRate, y};
  });
}
// tap an element by selector + text regex with a real touch
export async function tapText(p, sel, re) { const els = await p.$$(sel); for (const e of els) { const t = (await e.textContent()) || ''; if (re.test(t) && await e.isVisible()) { await e.tap(); return true; } } return false; }
