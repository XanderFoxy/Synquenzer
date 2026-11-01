// G6+g Prüf-Hilfen: App laden, synthetischen Gesang einspielen, Chor rechnen
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('/opt/node22/lib/node_modules/playwright');
import path from 'path'; import { fileURLToPath } from 'url';
export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const APP = process.env.APP || path.resolve(HERE, '../index.html');
export async function open(vp = {width: 390, height: 844}) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']});
  const ctx = await b.newContext({viewport: vp, hasTouch: true, deviceScaleFactor: 2});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + APP); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.tkInject, null, {timeout: 20000});
  await p.waitForTimeout(600);
  return {b, p, errs};
}
// Gesang: Töne (MIDI) je ½ s, Obertöne, Vibrato ±25 ct, kurze Pausen
export async function sing(p, midis = [60, 62, 64, 65, 67, 65, 64, 62]) {
  return p.evaluate(async ms => {
    const sr = 48000, dur = .5, n = Math.round(ms.length * dur * sr), pcm = new Array(n).fill(0); let ph = 0;
    for (let i = 0; i < n; i++) {
      const t = i / sr, k = Math.floor(t / dur), lt = t - k * dur, on = lt > .02 && lt < dur - .04;
      const f = 440 * Math.pow(2, (ms[k] - 69 + .25 * Math.sin(2 * Math.PI * 5.5 * t) / 12) / 12); ph += 2 * Math.PI * f / sr;
      const env = on ? Math.min(1, (lt - .02) / .02, (dur - .04 - lt) / .02) : 0;
      pcm[i] = Math.round(9000 * env * (Math.sin(ph) + .5 * Math.sin(2 * ph) + .3 * Math.sin(3 * ph) + .15 * Math.sin(4 * ph)));
    }
    const r = await SYNQUENZER.tkInject({pcm, sr, scene: 0, len: 2});
    return r;
  }, midis);
}
export async function chor(p, rec = 'terz') {
  return p.evaluate(async rec => { const R = {t: null, s: 0}; const st = SYNQUENZER.tkWhere ? null : null;
    for (let i = 0; i < 200; i++) { const ok = await SYNQUENZER.g6Make(null, rec, 'up', '80'); if (ok) break; await new Promise(r => setTimeout(r, 50)); }
    return SYNQUENZER.g6Info(); }, rec);
}
export const sleep = ms => new Promise(r => setTimeout(r, ms));
