// CHOR-SPUREN Prüf-Hilfen: App laden (Touch), synthetischen Gesang einspielen, Chor-Stil setzen
import { createRequire } from 'module'; const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
import path from 'path'; import { fileURLToPath } from 'url';
export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const APP = () => process.env.APP || path.resolve(HERE, '../index.html');
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export async function open(vp = {width: 428, height: 926}) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await b.newContext({viewport: vp, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + APP()); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.tkInject, null, {timeout: 30000});
  await p.waitForTimeout(500);
  return {b, p, errs};
}
// Gesang: Töne (MIDI) je ½ s (bei 120 BPM = 1 Schlag), Obertöne, Vibrato, kurze Pausen; Begleitung C-Dur in Szene 1 (Synth 1)
export async function sing(p, midis = [60, 64, 67, 65, 64, 62, 64, 60, 60, 64, 67, 65, 64, 62, 64, 60], o = {}) {
  return p.evaluate(async ([ms, o]) => {
    SYNQUENZER.setBpm(120);
    SYNQUENZER.setClip(0, 0, {len: 4, key: {root: 0, scale: 'ionian', src: 'user'}, notes: [0, 4, 8, 12].map(t => [48, 52, 55].map(n => ({t, d: 4, n, v: .7}))).flat()});
    const sr = 48000, dur = .5, n = Math.round(ms.length * dur * sr), pcm = new Array(n).fill(0); let ph = 0;
    for (let i = 0; i < n; i++) {
      const t = i / sr, k = Math.floor(t / dur), lt = t - k * dur, on = lt > .02 && lt < dur - .04;
      const f = 440 * Math.pow(2, (ms[k] - 69 + .25 * Math.sin(2 * Math.PI * 5.5 * t) / 12) / 12); ph += 2 * Math.PI * f / sr;
      const env = on ? Math.min(1, (lt - .02) / .02, (dur - .04 - lt) / .02) : 0;
      pcm[i] = Math.round(9000 * env * (Math.sin(ph) + .5 * Math.sin(2 * ph) + .3 * Math.sin(3 * ph) + .15 * Math.sin(4 * ph)));
    }
    return SYNQUENZER.tkInject({pcm, sr, scene: o.scene || 0, len: o.len || 4});
  }, [midis, o]);
}
// Stil-Tipp (G6+d) auf die Stelle, warten bis gerechnet
export async function style(p, id = 'pop', r = null) {
  return p.evaluate(async ([id, r]) => {
    const R0 = r || {t: stimmeT(), s: R.selS}; let ok = false;
    for (let i = 0; i < 200 && !ok; i++) { ok = await SYNQUENZER.g6pStyle(R0, id); if (!ok) await new Promise(q => setTimeout(q, 50)); }
    for (let i = 0; i < 400; i++) { const x = tkRef(R0); if (x && g6Ready(x.a)) break; await new Promise(q => setTimeout(q, 50)); }
    const x = tkRef(R0); return x && x.a.chor ? JSON.parse(JSON.stringify(x.a.chor)) : null;
  }, [id, r]);
}
export function report(name) {
  const res = []; let fail = 0;
  return {ok: (id, c, info) => { const s = (c ? '✓ ' : '✗ ') + id + (info ? ' · ' + info : ''); res.push(s); console.log(s); if (!c) fail++; }, res, get fail() { return fail; }, name};
}
