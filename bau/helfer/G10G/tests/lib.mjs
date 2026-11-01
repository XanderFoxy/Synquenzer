// G10g-Testhilfe: Browser, App öffnen, synthetischer Gesang (Vokale mit Teiltönen + stimmlose Zischlaute dazwischen)
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '../../../..');
export const APP = process.env.APP || path.join(ROOT, 'bau/helfer/G10G/index.html');
export const BASE = path.join(ROOT, 'bau/snapshots/R-4300.html');
export const SR = 48000;
export const sleep = ms => new Promise(r => setTimeout(r, ms));
let fail = 0, pass = 0;
export const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (c) pass++; else fail++; return !!c; };
export const done = () => { console.log(fail ? `FAIL ${fail} (PASS ${pass})` : `ALL PASS (${pass})`); process.exit(fail ? 1 : 0); };
export async function launch() {
  return chromium.launch({args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']});
}
export async function open(br, w, h, file = APP, touch = true) {
  const ctx = await br.newContext({viewport: {width: w, height: h}, hasTouch: touch, isMobile: touch, deviceScaleFactor: 2});
  const p = await ctx.newPage(); p.errs = [];
  p.on('pageerror', e => p.errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') p.errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1200);
  await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); });
  await p.waitForTimeout(200);
  p.ctx = ctx;
  return p;
}
// Melodie: [{m (MIDI), d (s)}], zwischen den Noten Zischlaut (s) 70 ms + 30 ms Stille; Anfang 0,25 s Stille
export function voice(mel, o = {}) {
  const gapS = o.gapS == null ? 0.07 : o.gapS, sil = 0.03, lead = 0.25;
  let len = lead; for (const n of mel) len += n.d + gapS + sil; len += 0.3;
  const N = Math.round(len * SR), y = new Float32Array(N);
  let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
  for (let i = 0; i < N; i++) y[i] = 0.0003 * rnd();
  let t = lead; const marks = [];
  for (const n of mel) {
    // Zischlaut (Hochpass-Rauschen) vor dem Vokal
    const s0 = Math.round(t * SR), sL = Math.round(gapS * SR); let lp = 0;
    for (let i = 0; i < sL; i++) { const r = rnd(); lp = 0.6 * lp + 0.4 * r; const hp = r - lp; y[s0 + i] += 0.05 * hp * Math.sin(Math.PI * i / sL); }
    marks.push({kind: 's', t0: t, t1: t + gapS});
    t += gapS + sil;
    const v0 = Math.round(t * SR), vL = Math.round(n.d * SR); let ph = 0;
    const f0 = 440 * Math.pow(2, (n.m - 69) / 12);
    for (let i = 0; i < vL; i++) {
      const tt = i / SR; let f = f0 * (1 + 0.004 * Math.sin(2 * Math.PI * 5.2 * tt));
      if (n.oct && tt > n.d * 0.35 && tt < n.d * 0.65) f *= 2;          // eingestreuter Oktav-Fehler (mittlerer Teil eine Oktave höher)
      ph += 2 * Math.PI * f / SR; let s = 0;
      for (let h = 1; h <= 12; h++) if (h * f < 7000) s += Math.sin(h * ph) / h * (h === 2 || h === 3 ? 1.4 : 1);
      const env = Math.min(1, i / (0.02 * SR)) * Math.min(1, (vL - i) / (0.03 * SR));
      y[v0 + i] += 0.12 * s * env;
    }
    marks.push({kind: 'v', t0: t, t1: t + n.d, m: n.m});
    t += n.d;
  }
  return {pcm: Array.from(y, v => Math.max(-32768, Math.min(32767, Math.round(v * 32767)))), marks, len};
}
// Take einspielen, Tonhöhe-Blatt öffnen, auf die Analyse warten
export async function takeIn(p, mel, o = {}) {
  const V = voice(mel, o), len = Math.ceil(V.len / 2 + 0.5);   // 120 BPM: 2 s je Takt
  const r = await p.evaluate(([pcm, len]) => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 1, len}), [V.pcm, len]);
  const ref = {t: r.track, s: 1};
  await p.evaluate(async ref => { await SYNQUENZER.g2Analyse(ref); }, ref);
  return {ref, id: r.id, V};
}
export async function edOpen(p, ref) { await p.evaluate(ref => SYNQUENZER.g2Open(ref), ref); await sleep(400); }
export async function played(p, ref) { return p.evaluate(ref => SYNQUENZER.g2Played(ref), ref); }
export function hash(a) { let h = 0x811c9dc5; const f = new Float32Array(a), u = new Uint8Array(f.buffer); for (let i = 0; i < u.length; i++) { h ^= u[i]; h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16) + ':' + a.length; }
// echte App-Schrift (wie gmk8b-hit44) – für Maße und Bilder
export async function fonts(p) {
  const FD = 'file://' + path.join(ROOT, 'fonts') + '/';
  const f = [['Barlow Semi Condensed', 'barlow-semi-condensed', [500, 600, 700]], ['JetBrains Mono', 'jetbrains-mono', [500, 700]]];
  await p.addStyleTag({content: f.map(([fam, file, ws]) => ws.map(wt => `@font-face{font-family:"${fam}";font-style:normal;font-weight:${wt};src:url(${FD}${file}-latin-${wt}-normal.woff2) format("woff2")}`).join('')).join('')});
  await p.evaluate(async () => { await Promise.all(['500 12px "Barlow Semi Condensed"', '700 12px "Barlow Semi Condensed"', '700 12px "JetBrains Mono"'].map(s => document.fonts.load(s))); await document.fonts.ready; UI.kbRelayout = true; window.dispatchEvent(new Event('resize')); });
}
