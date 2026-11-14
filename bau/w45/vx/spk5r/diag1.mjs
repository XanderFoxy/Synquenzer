// SPK5-R Diagnose: nur VX1-Abschnitt 1 (Take einspielen, Analyse) – schnell
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
const file = path.resolve(process.argv[2]);
const b = await chromium.launch();
const H = `const wait = ms => new Promise(r => setTimeout(r, ms));`;
const run = (p, fn, arg) => p.evaluate('(async () => { ' + H + ' return (' + fn.toString() + ')(' + JSON.stringify(arg == null ? null : arg) + '); })()');
const SR = 48000, PK = .07, ANCH = [.52, 1.03, 1.47, 2.04, 2.47, 3.02], F = [220, 247, 262, 294, 330, 220];
const ctx = await b.newContext({viewport: {width: 428, height: 926}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
const p = await ctx.newPage(); const errs = [];
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + file); await p.waitForTimeout(1500);
const r0 = await run(p, async o => {
  const {SR, PK, ANCH, F} = o, n = Math.round(3.6 * SR), x = new Float32Array(n);
  let seed = 12345; const rnd = () => { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 4294967296 * 2 - 1; };
  const ons = ANCH.map(a => a - PK);
  for (let k = 0; k < ANCH.length; k++) {
    const on = ons[k], nx = k + 1 < ons.length ? ons[k + 1] : on + .5, f = F[k]; let lp = 0;
    for (let i = Math.round(on * SR); i < Math.round((on + .045) * SR); i++) { const u = (i / SR - on) / .045, r = rnd(); const h = r - lp; lp = r; x[i] += .12 * h * Math.sin(Math.PI * Math.min(1, u * 1.2)); }
    const v0 = on + .05, v1 = nx + .015;
    for (let i = Math.round(v0 * SR); i < Math.min(n, Math.round(v1 * SR)); i++) {
      const t = i / SR - v0, T = v1 - v0; let e = t < .02 ? Math.sin(.5 * Math.PI * t / .02) : .45 + .55 * Math.exp(-(t - .02) / .04);
      if (t > T - .012) e *= Math.max(0, (T - t) / .012);
      let s = 0; for (let h = 1; h <= 6; h++) s += Math.sin(2 * Math.PI * f * h * t) / h; x[i] += .5 * e * s / 1.6;
    }
  }
  const pcm = Array.from(x, v => Math.max(-32768, Math.min(32767, Math.round(v * 32767))));
  S.bpm = 120;
  const r = await SYNQUENZER.tkInject({pcm, sr: SR, scene: 0, at: 0, len: 2});
  await wait(300);
  const m = S.takes[r.id];
  m.marks = wpNormMarks(ons.map(t => ({t: Math.round(t * SR) / SR, conf: 1})), m.len / m.sr);
  wpSetLyrics(r.id, 'la le-li lo lu na');
  return {id: r.id};
}, {SR, PK, ANCH, F});
const A = await run(p, async o => { const an = await window.__vx1.analyse(o.id); const B = wpBase(o.id), x = B.getChannelData(0), sr = o.SR;
  const pk = o.ANCH.map(t => { let bi = 0, bv = -1; for (let i = Math.round((t - o.PK) * sr); i < Math.round((t - o.PK + .12) * sr); i++) if (Math.abs(x[i]) > bv) { bv = Math.abs(x[i]); bi = i; } return bi / sr; });
  let h = 0; for (let i = 0; i < x.length; i++) h = (h * 31 + Math.round(x[i] * 1e6)) | 0;
  return {an, L: window.__vx1.list(o.id), pk, bsr: B.sampleRate, blen: B.length, hash: h, how: WP.how, wpw: WP.w ? 'worker' : String(WP.w), st: window.__vx1.state(), ctxsr: (typeof AC !== 'undefined' && AC && AC.sampleRate) || null}; }, {id: r0.id, SR, ANCH, PK});
const e1 = A.L.map((q, k) => Math.abs(q.at - A.pk[k]) * 1000);
console.log(JSON.stringify({file: path.basename(path.dirname(file)) + '/' + path.basename(file), e1: e1.map(e => e.toFixed(2)).join(' '), uv: A.L.map(q => [q.uv[0], q.vb]), at: A.L.map(q => q.at), pk: A.pk, bsr: A.bsr, blen: A.blen, hash: A.hash, how: A.how, wpw: A.wpw, an: A.an, lastAn: A.st.lastAn, errs}));
await b.close();
