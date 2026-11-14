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
try {
  const ctx = await b.newContext({viewport: {width: 428, height: 926}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
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
  const id = r0.id;
  // 1 Öffnen
  const o1 = await run(p, async o => { const okk = window.__vx1.open({t: o.st, s: 0}); for (let i = 0; i < 200 && !(window.__vx1.ed() && window.__vx1.ed().n >= 6 && window.__vx1.ed().notes[0].tx); i++) await wait(50); await wait(300); return {okk, ed: window.__vx1.ed(), open: EL.rollSheet.classList.contains('open'), ed2: R.editor, at: JSON.stringify(ED.rollAt)}; }, r0);
  ok(o1.okk && o1.open && o1.ed && o1.ed.n === 6, 'Gesang-Editor öffnet (Blatt des Noten-Editors), 6 Stücke als Noten', JSON.stringify({n: o1.ed && o1.ed.n, at: o1.at}));
  ok(o1.ed && o1.ed.tool === 'select', 'Werkzeug = Wählen (Tipp wählt, Ziehen verschiebt)', o1.ed && o1.ed.tool);
  ok(o1.ed && JSON.stringify(o1.ed.notes.map(n => n.tx)) === JSON.stringify(['la', 'le', 'li', 'lo', 'lu', 'na']), 'Silben aus dem vorhandenen Text an den Stücken', JSON.stringify(o1.ed && o1.ed.notes.map(n => n.tx)));
  const pit = o1.ed.notes.map(n => n.n), exp = F.map(f => Math.round(69 + 12 * Math.log2(f / 440)));
  ok(JSON.stringify(pit) === JSON.stringify(exp), 'Stück liegt auf seiner Tonhöhe (Median)', JSON.stringify(pit) + ' / ' + JSON.stringify(exp));
  const anc = o1.ed.notes.map((n, k) => Math.abs((n.t + n.a) * .5 - ANCH[k]) * 1000);
  ok(anc.every(e => e < 6), 'Anker-Linie an der Stelle des stärksten Einsatzes (Schlag ↔ Take ±6 ms)', anc.map(e => e.toFixed(1)).join(' '));
  let L = await layout(p);
  info('Knöpfe hochkant', L.bs.join(' | '));
  ok(L.x && L.x.in, '✕ sichtbar (hochkant)'); ok(!L.ov.length, 'keine Überlappung (hochkant)', L.ov.join(', ')); ok(!L.hsc, 'kein waagrechter Seiten-Bildlauf');
  ok(!L.bs.some(t => ['✎', '⇕', '⌫', 'Pinsel', 'Schritt', 'Dupl.', '+12', '−12'].includes(t)), 'nur Gesang-Werkzeuge (kein Zeichnen/Radieren/Anschlag/Pinsel)');
  ok(['↶', '▶', 'Quant.', 'Teilen', 'Verbinden', '⤢'].every(t => L.bs.includes(t)) && L.bs.some(t => /^1\/|aus/.test(t)), 'Leiste: Raster, Quant., Teilen, Verbinden, ↶, ▶, ⤢', '');
  info('Größen', JSON.stringify({hmin: L.hmin, small: L.small, main: L.main, keys: L.keys}));
  await p.screenshot({path: out + '/vx1r-hochkant.png'});
  // 2 Tipp = wählen, zweiter Tipp = Mehrfachwahl
  let xy = await run(p, () => window.__vx1.xy(1)); await ttap(cdp, xy.x, xy.y); await sleep(250);
  xy = await run(p, () => window.__vx1.xy(2)); await ttap(cdp, xy.x, xy.y); await sleep(250);
  let e2 = await run(p, () => window.__vx1.ed());
  ok(JSON.stringify(e2.sel.sort()) === '[1,2]', 'Tipp wählt, weiterer Tipp = Mehrfachwahl', JSON.stringify(e2.sel));
  await ttap(cdp, xy.x, xy.y + 200); await sleep(200);
  e2 = await run(p, () => window.__vx1.ed()); ok(e2.sel.length === 0, 'Tipp ins Leere hebt die Wahl auf');
  // 3 waagrecht ziehen: Anker rastet auf 1/8 ein, ein Undo
  await run(p, () => { ED.roll.setGrid('1/8'); });
  const u0 = await run(p, () => UNDO.length);
  const n2 = (await run(p, () => window.__vx1.ed())).notes[2];
  const a = await run(p, () => window.__vx1.xy(2)), bx = await run(p, o => window.__vx1.beatXY(o.b, o.n), {b: n2.t + n2.d / 2 + .37, n: n2.n});
  let glow = null;
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: a.x, y: a.y, id: 1}]});
  for (const [x, y] of line([a.x, a.y], [bx.x, a.y], 10)) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x, y, id: 1}]}); await sleep(18); }
  glow = await run(p, () => (VX1E.glow ? {b: VX1E.glow.b} : null));
  await p.screenshot({path: out + '/vx1r-ziehen.png'});
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
  const m3 = await run(p, async o => { for (let i = 0; i < 100 && UNDO.length === o.u0; i++) await wait(50); await wait(300); const e = window.__vx1.ed(), n = e.notes[2], L = window.__vx1.list(o.id); return {u: UNDO.length - o.u0, lab: UNDO.length ? UNDO[UNDO.length - 1].label : '', ab: n.t + n.a, n, da: L[2].da, vd: window.__vx1.marks(o.id)[2].vd, t0: wpT0(o.id)}; }, {u0, id});
  const onGrid = Math.abs(m3.ab * 2 - Math.round(m3.ab * 2));
  ok(m3.u === 1, 'Ziehen = ein Undo-Schritt', m3.lab);
  ok(onGrid < 1e-3 && m3.ab > n2.t + n2.a + .2, 'Anker rastet auf der 1/8-Linie ein (nicht der Stück-Anfang)', 'Anker bei Schlag ' + m3.ab.toFixed(4) + ', Anfang ' + m3.n.t.toFixed(4));
  ok(m3.n.t < m3.ab - .05, 'Anschwung liegt vor der Rasterlinie', ((m3.ab - m3.n.t) * 500).toFixed(0) + ' ms vor dem Anker');
  ok(glow && Math.abs(glow.b - m3.ab) < 1e-6, 'Rasterlinie leuchtet beim Einrasten', JSON.stringify(glow));
  // 4 senkrecht ziehen = Tonhöhe +2 (G2), ein Undo
  const u1 = await run(p, () => UNDO.length), n4 = (await run(p, () => window.__vx1.ed())).notes[4];
  const p4 = await run(p, () => window.__vx1.xy(4)), q4 = await run(p, o => window.__vx1.beatXY(o.b, o.n), {b: n4.t + n4.d / 2, n: n4.n + 2});
  await tdrag(cdp, line([p4.x, p4.y], [p4.x, q4.y], 10));
  const m4 = await run(p, async o => { for (let i = 0; i < 100 && UNDO.length === o.u1; i++) await wait(50); await wait(300); const e = window.__vx1.ed(); const P = S.takes[o.id].pitch; return {u: UNDO.length - o.u1, n: e.notes[4].n, t: e.notes[4].t, sh: P && P.notes.filter(z => z.sh).map(z => [z.t0, z.t1, z.sh])}; }, {u1, id});
  ok(m4.u === 1 && m4.n === n4.n + 2, 'senkrecht ziehen = Tonhöhe +2 (G2), ein Undo', JSON.stringify(m4));
  ok(Math.abs(m4.t - n4.t) < 1e-4, 'senkrecht verschiebt nicht in der Zeit', (m4.t - n4.t).toFixed(5));
  // 5 ↶ nimmt die Tonhöhe zurück
  await ttap(cdp, ...(await run(p, () => { const b = [...ED.roll.el.bar.querySelectorAll('button')].find(z => z.textContent === '↶'); const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })));
  const m5 = await run(p, async o => { await wait(400); return window.__vx1.ed().notes[4].n; });
  ok(m5 === n4.n, '↶ nimmt die Tonhöhe zurück, der Editor folgt', String(m5));
  // 6 QUANT.-Blatt
  const tapBtn = async (txt, root) => { const c = await run(p, o => { const b = [...document.querySelectorAll(o.root + ' button')].find(z => z.textContent.trim() === o.txt && z.getBoundingClientRect().width > 0); if (!b) return null; const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, {txt, root: root || '#rollSheet'}); if (c) await ttap(cdp, c[0], c[1]); return !!c; };
  ok(await tapBtn('Quant.'), 'Quant. antippbar'); await sleep(300);
  const q6 = await run(p, () => ({open: EL.qSheet.classList.contains('open'), txt: EL.qSheet.textContent}));
  ok(q6.open && /Stärke/.test(q6.txt) && /Aus/.test(q6.txt), 'QUANT.-Blatt mit Raster und Stärke', q6.txt.slice(0, 80));
  await p.screenshot({path: out + '/vx1r-quant.png'});
  await tapBtn('1/8', '#qSheet'); const u6 = await run(p, () => UNDO.length); await tapBtn('Anwenden', '#qSheet');
  const m6 = await run(p, async o => { for (let i = 0; i < 100 && UNDO.length === o.u6; i++) await wait(50); await wait(300); const e = window.__vx1.ed(); return {u: UNDO.length - o.u6, ab: e.notes.map(n => n.t + n.a)}; }, {u6});
  ok(m6.u === 1 && m6.ab.every(v => Math.abs(v * 2 - Math.round(v * 2)) < 2e-3), 'Quantisieren (alle, 1/8, 100 %): alle Anker auf dem Raster, ein Undo', m6.ab.map(v => v.toFixed(3)).join(' '));
  // 7 Teilen an der getippten Stelle / Verbinden
  const e7 = await run(p, () => window.__vx1.ed()), n0 = e7.notes[0];
  const t7 = await run(p, o => window.__vx1.beatXY(o.b, o.n), {b: n0.t + n0.d * .7, n: n0.n}); await ttap(cdp, t7.x, t7.y); await sleep(250);
  await tapBtn('Teilen');
  const m7 = await run(p, async () => { for (let i = 0; i < 100 && window.__vx1.ed().n < 7; i++) await wait(50); await wait(200); return window.__vx1.ed(); });
  ok(m7.n === 7, 'Teilen: ein Stück mehr', String(m7.n));
  const nn = m7.notes; const sp = Math.abs(nn[1].t - (n0.t + n0.d * .7)) * 500;
  ok(sp < 15, 'Teilen an der getippten Stelle', sp.toFixed(1) + ' ms');
  await run(p, () => ED.roll.selectIdx([0, 1])); await tapBtn('Verbinden');
  const m8 = await run(p, async () => { for (let i = 0; i < 100 && window.__vx1.ed().n > 6; i++) await wait(50); await wait(200); return window.__vx1.ed().n; });
  ok(m8 === 6, 'Verbinden: wieder ein Stück', String(m8));
  // 8 quer 926×428 und 926×370
  for (const [w, h] of [[926, 428], [926, 370]]) {
    await p.setViewportSize({width: w, height: h}); await sleep(900);
    L = await layout(p);
    ok(L.x && L.x.in, '✕ sichtbar (' + w + '×' + h + ')'); ok(!L.ov.length, 'keine Überlappung (' + w + '×' + h + ')', L.ov.join(', '));
    ok(L.main.h >= 120, 'Notenfläche groß genug (' + w + '×' + h + ')', JSON.stringify(L.main));
    info('Knöpfe ' + w + '×' + h, L.bs.join(' | ') + ' · hmin ' + L.hmin);
    await p.screenshot({path: out + '/vx1r-quer-' + h + '.png'});
  }
  await p.setViewportSize({width: 428, height: 926}); await sleep(600);
  const e9 = await run(p, () => window.__vx1.ed()); ok(e9 && e9.n === 6, 'nach dem Drehen: derselbe Editor, gleiche Stücke');
  // 9 ✕ schließt
  await tapBtn('✕'); await sleep(300);
  const c9 = await run(p, () => ({open: EL.rollSheet.classList.contains('open'), ed: R.editor}));
  ok(!c9.open, '✕ schließt den Editor');
} catch (e) { bad++; console.log('FEHLER Ausnahme – ' + (e && e.stack || e)); }
ok(!errs.length, 'keine Fehler in der Konsole', errs.slice(0, 5).join(' | '));
await b.close();
console.log(`\n${all - bad}/${all} OK`);
process.exit(bad ? 1 : 0);
