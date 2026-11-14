// VX1R Zugänge-Test (Schritt 4) – Kopf aus vx1r-ed-test.mjs.
// VX1R Editor-Test (Schritt 3): Gesang-Editor = PianoRoll mit opts.audio. Synthetischer Gesang wie im Kern-Test, Take per tkInject.
// Prüft per Touch (CDP): Öffnen, Stücke als Noten (Anker, Silben), Werkzeugleiste (nur Gesang-Werkzeuge, ✕ sichtbar, ≥ 44 px),
// Tipp = wählen / Mehrfachwahl, waagrecht ziehen rastet mit dem ANKER auf 1/8 ein (ein Undo), senkrecht = Tonhöhe (G2, ein Undo),
// QUANT.-Blatt, Teilen/Verbinden, ↶, hochkant + quer 926×428 / 926×370 ohne Überlappung, keine Fehler. Aufruf: node vx1r-ed-test.mjs <index.html> <fotos>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
const file = path.resolve(process.argv[2]), out = path.resolve(process.argv[3] || 'fotos');
let bad = 0, all = 0;
const ok = (c, m, d) => { all++; if (c) console.log('OK ' + m + (d ? ' – ' + d : '')); else { bad++; console.log('FEHLER ' + m + (d ? ' – ' + d : '')); } };
const info = (m, d) => console.log('INFO ' + m + (d ? ' – ' + d : ''));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch();
const errs = [];
const H = `const wait = ms => new Promise(r => setTimeout(r, ms));`;
const run = (p, fn, arg) => p.evaluate('(async () => { ' + H + ' return (' + fn.toString() + ')(' + JSON.stringify(arg == null ? null : arg) + '); })()');
const tdrag = async (cdp, pts, step = 16) => { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: pts[0][0], y: pts[0][1], id: 1}]}); for (let i = 1; i < pts.length; i++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: pts[i][0], y: pts[i][1], id: 1}]}); await sleep(step); } await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); };
const ttap = async (cdp, x, y) => { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id: 1}]}); await sleep(40); await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); };
const line = (a, z, n = 12) => Array.from({length: n + 1}, (_, i) => [a[0] + (z[0] - a[0]) * i / n, a[1] + (z[1] - a[1]) * i / n]);
// Layout: sichtbare Knöpfe im Editor, Überlappung, ✕, Größe
const layout = p => run(p, () => {
  const sh = EL.rollSheet, R = sh.getBoundingClientRect(), vis = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'; };
  const bs = [...sh.querySelectorAll('button')].filter(vis).map(e => { const r = e.getBoundingClientRect(); return {t: e.textContent.trim(), x: r.left, y: r.top, w: r.width, h: r.height, r: r.right, b: r.bottom}; });
  const vw = innerWidth, vh = innerHeight, ov = [];
  for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) { const a = bs[i], c = bs[j]; if (a.x < c.r - 1 && c.x < a.r - 1 && a.y < c.b - 1 && c.y < a.b - 1) ov.push(a.t + '/' + c.t); }
  const x = bs.find(z => z.t === '✕'), main = ED.roll.el.main.getBoundingClientRect(), keys = ED.roll.el.keys.getBoundingClientRect();
  // Trefferfläche: Knopf + Ränder der Leiste (wie die App misst: Höhe der Leiste)
  return {bs: bs.map(z => z.t), ov, x: x && {x: x.x, y: x.y, r: x.r, b: x.b, in: x.x >= 0 && x.r <= vw && x.y >= 0 && x.b <= vh}, small: bs.filter(z => z.h < 30).map(z => z.t + ':' + Math.round(z.h)),
    hmin: Math.round(Math.min(...bs.map(z => z.h))), main: {w: Math.round(main.width), h: Math.round(main.height)}, keys: Math.round(keys.width), sheet: {t: Math.round(R.top), b: Math.round(R.bottom)}, vw, vh, hsc: document.documentElement.scrollWidth > vw};
});

// Schritt 4: Zugänge (Matrix ✎ / Clip-Blatt / Takes-Blatt / Song), Wiedergabe während ▶, Speichern (.json-Hinweis, Container-Rundlauf), Guide

// Takes-Blatt mit [✎ Bearbeiten]: hochkant + quer, ✕ sichtbar, keine Überlappung
try {
  const ctx = await b.newContext({viewport: {width: 428, height: 926}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  const p = await ctx.newPage();
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
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

  for (const [w, h] of [[428, 926], [926, 428], [926, 370]]) {
    await p.setViewportSize({width: w, height: h}); await sleep(700);
    await run(p, async o => { closePop(); await wait(150); SYNQUENZER.tkSheet({t: o.st, s: 0}); await wait(600); }, r0);
    const L = await run(p, () => { const pe = UI.pop && UI.pop.el; if (!pe) return null; const b = pe.querySelector('[data-a="vx1r"]') || pe.querySelector('[data-a="wp"]'); b.scrollIntoView({block: 'nearest'});
      const vis = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'; };
      const hd = e => !!(e.closest('.origs') || (pe._psh && pe._psh.contains(e))), hb = Math.max(0, ...[...pe.querySelectorAll('.origs')].concat(pe._psh ? [pe._psh] : []).map(e => e.getBoundingClientRect().bottom));   // klebender Kopf: Inhalt rollt darunter (wie in der Basis)
      const bs = [...pe.querySelectorAll('button')].filter(vis).filter(e => hd(e) || e.getBoundingClientRect().top >= hb - 1).map(e => { const r = e.getBoundingClientRect(); return {t: e.textContent.trim().slice(0, 18), x: r.left, y: r.top, r: r.right, b: r.bottom, h: r.height}; });
      const ov = []; for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) { const a = bs[i], c = bs[j]; if (a.x < c.r - 1 && c.x < a.r - 1 && a.y < c.b - 1 && c.y < a.b - 1) ov.push(a.t + '/' + c.t); }
      const x = [...document.querySelectorAll('.pop button')].find(z => z.textContent.trim() === '✕' && vis(z)), xr = x && x.getBoundingClientRect(), br = b.getBoundingClientRect(), pr = pe.getBoundingClientRect();
      return {ov, x: !!xr && xr.left >= 0 && xr.right <= innerWidth && xr.top >= 0 && xr.bottom <= innerHeight, bh: Math.round(br.height), bin: br.top >= pr.top - 1 && br.bottom <= pr.bottom + 1, hsc: document.documentElement.scrollWidth > innerWidth}; });
    ok(L && L.x, '✕ sichtbar (' + w + '×' + h + ')'); ok(L && !L.ov.length, 'keine Überlappung im Takes-Blatt (' + w + '×' + h + ')', L && L.ov.join(', '));
    ok(L && L.bh >= 44 && L.bin, '[✎ Bearbeiten] ≥ 44 px und im Blatt (' + w + '×' + h + ')', JSON.stringify(L && {bh: L.bh, bin: L.bin})); ok(L && !L.hsc, 'kein waagrechter Bildlauf (' + w + '×' + h + ')');
    await p.screenshot({path: out + '/vx1r-takes-' + w + 'x' + h + '.png'});
  }
} catch (e) { bad++; console.log('FEHLER Ausnahme – ' + (e && e.stack || e)); }
ok(!errs.length, 'keine Fehler in der Konsole', errs.slice(0, 5).join(' | '));
await b.close();
console.log(`\n${all - bad}/${all} OK`);
process.exit(bad ? 1 : 0);
