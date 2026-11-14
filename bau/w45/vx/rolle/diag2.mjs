import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const file = process.argv[2];
const b = await chromium.launch();
const H = `const wait = ms => new Promise(r => setTimeout(r, ms));`;
const run = (p, fn, arg) => p.evaluate('(async () => { ' + H + ' return (' + fn.toString() + ')(' + JSON.stringify(arg == null ? null : arg) + '); })()');
const p = await (await b.newContext({viewport: {width: 428, height: 926}, deviceScaleFactor: 2, hasTouch: true, isMobile: true})).newPage();
p.on('pageerror', e => console.log('ERR', String(e)));
await p.goto('file://' + file); await p.waitForTimeout(1500);
const SR = 48000, PK = .07, ANCH = [.52, 1.03, 1.47, 2.04, 2.47, 3.02], F = [220, 247, 262, 294, 330, 220];
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
    return {id: r.id, st: stimmeT()};
}, {SR, PK, ANCH, F});
const id = r0.id;
// Silbe li
await run(p, o => { selectSlot(o.st, 0); openRoll(o.st, 0); }, r0);
const E = await run(p, async o => {
  for (let i = 0; i < 200 && !(window.__vx1.ed() && window.__vx1.ed().n >= 6 && window.__vx1.ed().notes[0].tx); i++) await wait(50);
  ED.roll.fitView('clip'); await wait(400);
  const P = CanvasRenderingContext2D.prototype, F0 = P.fillText, M0 = P.measureText, txt = [], ms = [];
  P.fillText = function (s, x, y, mw) { txt.push({s, x, y, mw}); return F0.call(this, s, x, y, mw); };
  P.measureText = function (s) { const r = M0.call(this, s); if (['la','le','li','lo','lu','na'].includes(s)) ms.push({s, w: r.width, font: this.font}); return r; };
  ED.roll.fitView('clip'); await wait(400); P.fillText = F0; P.measureText = M0;
  const out = {txt: txt.filter(z => ['la','le','li','lo','lu','na'].includes(z.s)), ms};
  const orig = vx1rDeco;
  const ns = VX1E.clip.notes;
  const res = ns.map(nt => { const r = ED.roll._xy(nt.t, nt.n); const p = nt._p; return {tx: p && p.tx, an: p && p.an, t: nt.t, d: nt.d, a: nt._a, x: r && r.x}; });
  // ruler / bar buttons info
  const bs = [...EL.rollSheet.querySelectorAll('button')].filter(e => e.getBoundingClientRect().width > 0).map(e => { const r = e.getBoundingClientRect(); return {t: e.textContent.trim().slice(0, 20), cls: e.className, par: e.parentElement.className, h: r.height, w: r.width, top: r.top}; });
  const bar = ED.roll.el.bar.getBoundingClientRect(), cs = getComputedStyle(ED.roll.el.bar);
  return {out, res, bs, bar: {h: bar.height, top: bar.top, pad: cs.padding, bb: cs.borderBottomWidth}};
}, r0);
console.log(JSON.stringify(E));
await b.close();
