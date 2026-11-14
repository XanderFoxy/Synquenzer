// VX1 Gesamt-Abnahme (Schritt 5) – Gesang-Notenrolle. Synthetischer Gesang (6 Silben: Konsonant-Rauschen + Vokal mit Gipfel), Take per tkInject.
// Prüft am gerenderten Signal und per Touch (CDP):
//  1 Analyse: Anker = lautester Spitzenwert im Einschwingbereich      2 Quantisieren: Anker auf dem Raster ±2 ms, Anschwung davor
//  3 Verschieben links: Ausklang des Vorgängers abgeschnitten + Ausblende, nicht gestaucht, kein Knacken
//  4 Verschieben rechts: Dehnung ≤ 1,5× nur im Vokal, Einsatz unverändert; darüber Lücke mit Ausblende
//  5 Tonhöhe + / − (gehört: Grundton im Ausgang)                       6 Silben-Text sichtbar (gezeichnet, unten, rechts vom Anker)
//  7 Song + Matrix öffnen denselben Editor (wie bei Instrumenten)      8 ↶ je Aktion (Ziehen, Tonhöhe, Quant., Teilen, Verbinden)
//  9 Speichern/Laden (.json) gleich, Container enthält Gesang (WAV) und klingt gleich, alte Takes unverändert
// 10 hochkant 428×926 + quer 926×428 / 926×370: keine Überlappung, ✕ sichtbar, Tasten-Trefferfläche ≥ 44 px
// Aufruf: node vx1-test.mjs <abs/index.html> <abs/fotos-ordner>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
import fs from 'node:fs';
const file = path.resolve(process.argv[2]), out = path.resolve(process.argv[3] || 'fotos');
fs.mkdirSync(out, {recursive: true});
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
// Layout eines Blatts: sichtbare Knöpfe, Überlappung, ✕, Trefferfläche (elementFromPoint um die Mitte, senkrecht und waagrecht)
const layout = (p, sel) => run(p, sel => {
  const sh = document.querySelector(sel); if (!sh) return null;
  const vis = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden' && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; };
  const els = [...sh.querySelectorAll('button')].filter(vis);
  const bs = els.map(e => { const r = e.getBoundingClientRect(); return {t: e.textContent.trim().replace(/\s+/g, ' ').slice(0, 18) || e.getAttribute('aria-label') || '?', x: r.left, y: r.top, w: r.width, h: r.height, r: r.right, b: r.bottom}; });
  const vw = innerWidth, vh = innerHeight, ov = [];
  for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) { const a = bs[i], c = bs[j]; if (a.x < c.r - 1 && c.x < a.r - 1 && a.y < c.b - 1 && c.y < a.b - 1) ov.push(a.t + '/' + c.t); }
  const hit = (e, x, y) => { const z = document.elementFromPoint(x, y); return !!z && (z === e || e.contains(z)); };
  const reach = els.map((e, i) => {
    const r = bs[i], cx = Math.min(vw - 1, Math.max(0, r.x + r.w / 2)), cy = Math.min(vh - 1, Math.max(0, r.y + r.h / 2));
    if (!hit(e, cx, cy)) return {t: r.t, h: 0, w: 0, cov: true};
    let up = 0, dn = 0, lf = 0, rt = 0;
    while (up < 30 && cy - up - 1 >= 0 && hit(e, cx, cy - up - 1)) up++;
    while (dn < 30 && cy + dn + 1 < vh && hit(e, cx, cy + dn + 1)) dn++;
    while (lf < 30 && cx - lf - 1 >= 0 && hit(e, cx - lf - 1, cy)) lf++;
    while (rt < 30 && cx + rt + 1 < vw && hit(e, cx + rt + 1, cy)) rt++;
    return {t: r.t, h: up + dn + 1, w: lf + rt + 1};
  });
  const x = bs.find(z => z.t === '✕');
  return {bs: bs.map(z => z.t), ov, reach, x: x && {in: x.x >= 0 && x.r <= vw && x.y >= 0 && x.b <= vh, cov: !(reach[bs.indexOf(x)] || {}).cov}, vw, vh, hsc: document.documentElement.scrollWidth > vw};
}, sel);
// Grundton (Autokorrelation) eines Ausschnitts
const f0of = (y, sr, a, n) => {
  let best = 0, bl = 0; const lo = Math.floor(sr / 500), hi = Math.ceil(sr / 150);
  const c = []; for (let l = lo; l <= hi; l++) { let s = 0, e1 = 0, e2 = 0; for (let i = 0; i < n; i++) { s += y[a + i] * y[a + i + l]; e1 += y[a + i] ** 2; e2 += y[a + i + l] ** 2; } c[l] = s / Math.sqrt(e1 * e2 + 1e-12); }
  for (let l = lo + 1; l < hi; l++) if (c[l] > c[l - 1] && c[l] >= c[l + 1] && c[l] > best + .02) { best = c[l]; bl = l; }
  if (!bl) return 0;
  const p = .5 * (c[bl - 1] - c[bl + 1]) / (c[bl - 1] - 2 * c[bl] + c[bl + 1]); return sr / (bl + (isFinite(p) ? p : 0));
};
const SR = 48000, PK = .07, ANCH = [.52, 1.03, 1.47, 2.04, 2.47, 3.02], F = [220, 247, 262, 294, 330, 220], SYL = ['la', 'le', 'li', 'lo', 'lu', 'na'];
try {
  const ctx = await b.newContext({viewport: {width: 428, height: 926}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
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
    return {id: r.id, st: stimmeT(), t0: wpT0(r.id), u: UNDO.length};
  }, {SR, PK, ANCH, F});
  const id = r0.id, st = r0.st;
  info('Take', JSON.stringify(r0));

  /* ---------- 1 Analyse: Anker am Spitzenwert ---------- */
  const A = await run(p, async o => { await window.__vx1.analyse(o.id); const x = wpBase(o.id).getChannelData(0), sr = o.SR;
    const pk = o.ANCH.map(t => { let bi = 0, bv = -1; for (let i = Math.round((t - o.PK) * sr); i < Math.round((t - o.PK + .12) * sr); i++) if (Math.abs(x[i]) > bv) { bv = Math.abs(x[i]); bi = i; } return bi / sr; });
    return {L: window.__vx1.list(o.id), pk}; }, {id, SR, ANCH, PK});
  const L0 = A.L;
  const e1 = L0.map((q, k) => Math.abs(q.at - A.pk[k]) * 1000);
  ok(L0.length === 6 && e1.every(e => e <= .1), '1 Anker = lautester Spitzenwert im Einschwingbereich (≤ 120 ms nach dem Einsatz, ±0,1 ms)', e1.map(e => e.toFixed(2)).join(' '));
  const e1b = L0.map((q, k) => Math.abs(q.at - ANCH[k]) * 1000);
  ok(e1b.every(e => e <= 5), '1 Anker liegt am Gipfel der Hüllkurve, nicht am Konsonanten (±5 ms)', e1b.map(e => e.toFixed(1)).join(' '));
  ok(L0.every(q => q.uv.length && q.uv[0][0] <= q.t + .005 && q.vb != null && q.vb > q.uv[0][0] && q.vb <= q.at), '1 Konsonant (stimmlos) vor dem Vokal getrennt erkannt', JSON.stringify(L0.map(q => [q.uv[0], q.vb])));
  ok(L0.every((q, k) => q.m != null && Math.round(q.m) === Math.round(69 + 12 * Math.log2(F[k] / 440))), '1 Stück liegt auf seiner Tonhöhe (Median)', L0.map(q => q.m).join(' '));

  /* ---------- 2 Quantisieren alles 1/8: Anker auf dem Raster ±2 ms (gehört), Anschwung davor ---------- */
  const Q = await run(p, async id => {
    const u0 = UNDO.length; await window.__vx1.quant(id, {grid: '1/8', strength: 1}); const du = UNDO.length - u0;
    const R = await window.__vx1.render(id); return {du, L: window.__vx1.list(id), y: R && R.y, x: Array.from(wpBase(id).getChannelData(0))};
  }, id);
  const stp = .25, grd = t => Math.round((t - r0.t0) / stp) * stp + r0.t0;
  const qe = Q.L.map(q => Math.abs(q.da - grd(q.da)) * 1000);
  ok(Q.du === 1 && qe.every(e => e <= 2), '2 Quantisieren 1/8: Anker-Ziel jedes Stücks auf der Rasterlinie (±2 ms), ein ↶-Schritt', qe.map(e => e.toFixed(2)).join(' '));
  const pkOut = Q.L.map(q => { const a = Math.round(q.dst * SR), e = Math.round((q.dst + .12) * SR); let bi = a, bv = 0; for (let i = a; i < e; i++) { const v = Math.abs(Q.y[i]); if (v > bv) { bv = v; bi = i; } } return (bi / SR - grd(bi / SR)) * 1000; });
  ok(pkOut.every(e => Math.abs(e) <= 2), '2 gehört: lautester Spitzenwert jedes Einsatzes sitzt auf dem Taktstrich (±2 ms)', pkOut.map(e => e.toFixed(2)).join(' '));
  const pre = Q.L.map(q => { const g = Math.round(q.da * SR), a = g - Math.round(.065 * SR), e = g - Math.round(.03 * SR); let s = 0; for (let i = a; i < e; i++) s += Q.y[i] * Q.y[i]; return {ms: Math.round((q.da - q.dst) * 1000), rms: +Math.sqrt(s / (e - a)).toFixed(4)}; });
  ok(pre.every(z => z.ms >= 50 && z.rms > .005), '2 Anschwung (Konsonant) klingt VOR dem Taktstrich', JSON.stringify(pre));
  await run(p, async () => { undo(); await wait(100); });

  /* ---------- 3 Verschieben nach links: Vorgänger abgeschnitten + Ausblende, nicht gestaucht, kein Knacken ---------- */
  const ML = await run(p, async o => {
    const L0 = window.__vx1.list(o.id), u0 = UNDO.length;
    await window.__vx1.move(o.id, 3, L0[3].at - .06, {grid: 'off'});
    const R = await window.__vx1.render(o.id); return {du: UNDO.length - u0, L: window.__vx1.list(o.id), y: R.y, x: Array.from(wpBase(o.id).getChannelData(0)), w: window.__vx1.warp(o.id)};
  }, {id});
  {
    const {L, y, x} = ML, q = L[3], pv = L[2];
    const dif = (a, i0, i1) => { let m = 0; for (let i = Math.max(1, i0); i < i1; i++) m = Math.max(m, Math.abs(a[i] - a[i - 1])); return m; };
    ok(ML.du === 1 && Math.abs(q.da - (L0[3].at - .06)) < 1e-4 && Math.abs(pv.dst - pv.t) < 1e-6, '3 Stück 4 um 60 ms nach links (ein ↶-Schritt), Vorgänger bleibt an seinem Platz', JSON.stringify({da: q.da, dst: q.dst, pv: pv.dst}));
    // Vorgänger gleich schnell (bitgleich) bis zur Ausblende
    const a = Math.round((pv.t + pv.an + .02) * SR), bnd = Math.round(q.dst * SR); let i = a; while (i < bnd && Math.abs(y[i] - x[i]) < 1e-7) i++;
    const fadeMs = (bnd - i) / SR * 1000;
    ok(i > a + SR * .2 && fadeMs >= 6 && fadeMs <= 36, '3 Ausklang des Vorgängers NICHT gestaucht: bitgleich bis kurz vor dem Schnitt', 'bitgleich ' + Math.round((i - a) / SR * 1000) + ' ms, dann Ausblende ' + fadeMs.toFixed(1) + ' ms bis zum verschobenen Stück');
    // Ausblende: Verstärkung y/x fällt stetig (gleiche Leistung), Rest der Silbe (60 ms) ist abgeschnitten
    const gs = []; for (let j = i; j < bnd - Math.round(.006 * SR); j++) if (Math.abs(x[j]) > .05) gs.push(y[j] / x[j]);
    const mono = gs.every((g, k) => g <= 1.0001 && g >= -1e-4 && (!k || g <= gs[k - 1] + .02));
    ok(gs.length > 20 && mono && gs[gs.length - 1] < .6, '3 Ausblende des Vorgängers (Verstärkung fällt stetig ab, kein harter Schnitt)', 'Verstärkung ' + (gs[0] || 0).toFixed(2) + ' → ' + (gs[gs.length - 1] || 0).toFixed(2) + ' (' + gs.length + ' Punkte)');
    const ref = dif(x, Math.round((pv.t + pv.an + .03) * SR), Math.round((q.t - .02) * SR)), jmp = dif(y, bnd - Math.round(.04 * SR), bnd);   // bis zum Einsatz (danach Konsonant-Rauschen)
    ok(jmp <= ref * 1.1 + .01, '3 kein Knacken am Schnitt (max. Sprung ≤ Sprung im Vokal der Quelle)', jmp.toFixed(4) + ' / ' + ref.toFixed(4) + ', harter Schnitt hätte Pegel ' + Math.abs(x[bnd]).toFixed(3));
    const s0 = Math.round(q.t * SR), d0 = Math.round(q.dst * SR), n = Math.round((q.an + .02) * SR); let eq = 0; for (let j = 0; j < n; j++) if (Math.abs(y[d0 + j] - x[s0 + j]) < 1e-7) eq++;
    ok(eq === n, '3 verschobenes Stück: Einsatz bis Anker + 20 ms bitgleich (nie gedehnt)', eq + '/' + n);
  }
  await run(p, async () => { undo(); await wait(100); });

  /* ---------- 4 Verschieben nach rechts: Vokal des Vorgängers gedehnt ≤ 1,5×, Einsatz unverändert; weiter → Lücke mit Ausblende ---------- */
  const MR = await run(p, async o => {
    const L0 = window.__vx1.list(o.id), u0 = UNDO.length;
    await window.__vx1.move(o.id, 4, L0[4].at + .08, {grid: 'off'});
    const R = await window.__vx1.render(o.id); const r1 = {du: UNDO.length - u0, L: window.__vx1.list(o.id), y: R.y};
    undo(); await wait(100); const u1 = UNDO.length;
    await window.__vx1.move(o.id, 1, L0[1].at + .3, {grid: 'off'});
    const R2 = await window.__vx1.render(o.id); const r2 = {du: UNDO.length - u1, L: window.__vx1.list(o.id), y: R2.y};
    undo(); await wait(100);
    return {r1, r2, x: Array.from(wpBase(o.id).getChannelData(0))};
  }, {id});
  {
    const x = MR.x, {L, y} = MR.r1, q = L[4], pv = L[3], lock = pv.an + .02;
    const ratio = ((q.dst - pv.dst) - lock) / ((q.t - pv.t) - lock);
    const s0 = Math.round(pv.t * SR), n = Math.round(lock * SR); let eq = 0; for (let j = 0; j < n; j++) if (Math.abs(y[Math.round(pv.dst * SR) + j] - x[s0 + j]) < 1e-7) eq++;
    ok(MR.r1.du === 1 && ratio > 1.05 && ratio <= 1.5, '4 Stück 5 um 80 ms nach rechts (ein ↶-Schritt): Platz des Vorgängers ' + ratio.toFixed(2) + '× (≤ 1,5×)');
    ok(eq === n, '4 Einsatz des Vorgängers unverändert (bis Anker + 20 ms bitgleich)', eq + '/' + n);
    const qa = Math.round(q.dst * SR), qs = Math.round(q.t * SR), qn = Math.round((q.an + .02) * SR); let eq2 = 0; for (let j = 0; j < qn; j++) if (Math.abs(y[qa + j] - x[qs + j]) < 1e-7) eq2++;
    ok(eq2 === qn, '4 Einsatz des verschobenen Stücks unverändert (bitgleich am neuen Platz)', eq2 + '/' + qn);
    const rms = (a, e) => { let s = 0; for (let i = a; i < e; i++) s += y[i] * y[i]; return Math.sqrt(s / Math.max(1, e - a)); };
    const gapR = rms(Math.round((q.dst - .03) * SR), Math.round((q.dst - .006) * SR));
    const mid = Math.round((pv.dst + lock + ((q.dst - pv.dst) - lock) * .5) * SR), f0 = f0of(y, SR, mid, 1920);
    ok(gapR > .02 && Math.abs(f0 / F[3] - 1) < .015, '4 Vokal gedehnt (keine Lücke, Tonhöhe der Silbe bleibt)', 'Pegel vor dem Nachfolger ' + gapR.toFixed(3) + ', Grundton im gedehnten Vokal ' + f0.toFixed(1) + ' Hz (Soll ' + F[3] + ')');
    // weit nach rechts: Faktor > 1,5 → Vokal höchstens 1,5× gedehnt, danach Lücke mit Ausblende
    const B = MR.r2, y2 = B.y, q2 = B.L[1], p2 = B.L[0], lk2 = p2.an + .02, need = ((q2.dst - p2.dst) - lk2) / ((q2.t - p2.t) - lk2);
    const endMax = p2.dst + lk2 + 1.5 * ((q2.t - p2.t) - lk2);   // Ende des gedehnten Vokals (höchstens 1,5×)
    let last = 0; for (let i = Math.round((p2.dst + lk2) * SR); i < Math.round((q2.dst - .006) * SR); i++) if (Math.abs(y2[i]) > .01) last = i / SR;
    let s2 = 0, n2 = 0; for (let i = Math.round((endMax + .04) * SR); i < Math.round((q2.dst - .01) * SR); i++) { s2 += y2[i] * y2[i]; n2++; }
    const dif = (a, i0, i1) => { let m = 0; for (let i = Math.max(1, i0); i < i1; i++) m = Math.max(m, Math.abs(a[i] - a[i - 1])); return m; };
    const ref = dif(x, Math.round((p2.t + lk2 + .01) * SR), Math.round((p2.end - .02) * SR)), jmp = dif(y2, Math.round((p2.dst + lk2) * SR), Math.round(q2.dst * SR));
    ok(B.du === 1 && need > 1.5 && last <= endMax + .036 && n2 > 0 && Math.sqrt(s2 / n2) < .002, '4 weiter rechts (Platz ' + need.toFixed(2) + '×): Vokal höchstens 1,5× gedehnt, danach natürliche Lücke', 'Klang endet ' + ((last - endMax) * 1000).toFixed(0) + ' ms nach 1,5×-Ende, Lücke ' + Math.round(n2 / SR * 1000) + ' ms');
    ok(jmp <= ref * 1.1 + .01, '4 Ausblende vor der Lücke ohne Knacken', jmp.toFixed(4) + ' / ' + ref.toFixed(4));
  }

  /* ---------- 5 Tonhöhe + / − (gehört) und ↶ je Schritt ---------- */
  const PT = await run(p, async o => {
    const g = async () => { const R = await window.__vx1.render(o.id); const L = window.__vx1.list(o.id), q = L[2]; return {y: R.y.slice(Math.round((q.dst + q.an + .08) * o.SR), Math.round((q.dst + q.an + .08) * o.SR) + 4000)}; };
    await window.__vx1.quant(o.id, {grid: '1/8', strength: 1});
    const u0 = UNDO.length, a = await g();
    const p1 = await window.__vx1.pitch(o.id, 2, 1), u1 = UNDO.length, b = await g();
    const p2 = await window.__vx1.pitch(o.id, 2, -2), u2 = UNDO.length, c = await g();
    const n3 = S.takes[o.id].pitch.notes.filter(n => n.sh).map(n => n.sh);
    undo(); await wait(150); const d = await g(); undo(); await wait(150); const e = await g();
    return {a: a.y, b: b.y, c: c.y, d: d.y, e: e.y, p1, p2, du1: u1 - u0, du2: u2 - u1, n3};
  }, {id, SR});
  {
    const f = k => f0of(PT[k], SR, 0, 1920), fa = f('a'), fb = f('b'), fc = f('c'), fd = f('d'), fe = f('e'), st = z => 12 * Math.log2(z / fa);
    ok(PT.p1 === true && PT.du1 === 1 && Math.abs(st(fb) - 1) < .2, '5 Tonhöhe +1 (ein ↶-Schritt): gehörter Grundton steigt um einen Halbton', fa.toFixed(1) + ' → ' + fb.toFixed(1) + ' Hz (' + st(fb).toFixed(2) + ' HT)');
    ok(PT.p2 === true && PT.du2 === 1 && Math.abs(st(fc) + 1) < .2, '5 Tonhöhe −2 (ein ↶-Schritt): gehörter Grundton −1 Halbton gegenüber dem Original', fc.toFixed(1) + ' Hz (' + st(fc).toFixed(2) + ' HT)');
    ok(Math.abs(st(fd) - 1) < .2 && Math.abs(st(fe)) < .2, '5 ↶ nimmt jede Tonhöhen-Änderung einzeln zurück', fd.toFixed(1) + ' → ' + fe.toFixed(1) + ' Hz');
    ok(Math.abs(fa / F[2] - 1) < .015, '5 Original-Tonhöhe im Ausgang unverändert (Zeitkarte ändert die Tonhöhe nicht)', fa.toFixed(1) + ' Hz');
  }
  await run(p, async () => { undo(); await wait(150); });   // Quantisieren zurück → Original

  /* ---------- 7a Matrix: Clip wählen + ✎ (wie bei Instrumenten) → Gesang-Editor ---------- */
  const tapEl = async (sel, txt) => { const c = await run(p, o => { const b = [...document.querySelectorAll(o.sel)].find(z => (!o.txt || z.textContent.trim() === o.txt) && z.getBoundingClientRect().width > 0 && !z.disabled); if (!b) return null; b.scrollIntoView({block: 'nearest'}); const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, {sel, txt}); if (c) await ttap(cdp, c[0], c[1]); return !!c; };
  const waitEd = n => run(p, async n => { for (let i = 0; i < 200 && !(window.__vx1.ed() && window.__vx1.ed().n >= n && window.__vx1.ed().notes.some(z => z.tx)); i++) await wait(50); await wait(250); return window.__vx1.ed(); }, n);
  const edSig = () => run(p, () => ({sheet: !!EL.rollSheet.classList.contains('open'), ed: R.editor, pr: !!(ED.roll && ED.roll.el && ED.roll.el.main && ED.roll.el.keys && EL.rollSheet.contains(ED.roll.el.main)), vx: !!(ED.rollAt && ED.rollAt.vx), take: VX1E.id,
    bar: [...EL.rollSheet.querySelectorAll('.pr-bar button')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.trim()).filter(t => !/^1\/|^aus/.test(t)).join('|'), keys: ED.roll.el.keys.getBoundingClientRect().width}));
  const closeEd = () => run(p, async () => { closeRoll(); closePop(); await wait(250); });
  await run(p, o => { setSongView(false); selectSlot(o.st, 0); }, r0); await sleep(250);
  ok(await tapEl('#bEdit'), '7 Matrix: ✎ antippbar');
  const eM = await waitEd(6), sM = await edSig();
  ok(eM && eM.n === 6 && sM.sheet && sM.ed === 'roll' && sM.pr && sM.vx && sM.take === id, '7 Matrix: Gesang-Clip + ✎ öffnet den Gesang-Editor (Blatt + PianoRoll des Noten-Editors)', JSON.stringify(sM));
  // dieselbe PianoRoll wie bei Instrumenten: gleiche Tastatur-Breite, gleiches Blatt
  const sI = await run(p, async () => { const t = S.tracks.findIndex(z => z.kind === 'synth' && !z.stimme); closeRoll(); await wait(200); selectSlot(t, 0); openRoll(t, 0); await wait(400); const r = {sheet: EL.rollSheet.classList.contains('open'), ed: R.editor, pr: !!(ED.roll && EL.rollSheet.contains(ED.roll.el.main)), vx: !!(ED.rollAt && ED.rollAt.vx), keys: ED.roll.el.keys.getBoundingClientRect().width}; closeRoll(); await wait(200); return r; });
  ok(sI.sheet && sI.pr && !sI.vx && sI.keys === sM.keys, '7 derselbe Editor wie bei Instrumenten (gleiches Blatt, gleiche Tastatur links)', 'Tastatur ' + sM.keys + ' / ' + sI.keys + ' px');

  /* ---------- 6 Silben-Text sichtbar: gezeichnet im Stück, unten, rechts vom Anker ---------- */
  await run(p, o => { selectSlot(o.st, 0); openRoll(o.st, 0); }, r0); await waitEd(6);
  const TX = await run(p, async o => {
    ED.roll.fitView('clip'); await wait(300);
    const P = CanvasRenderingContext2D.prototype, F0 = P.fillText, R0 = P.fillRect, txt = [], anc = [];
    P.fillText = function (s, x, y, mw) { if (ED.roll.el.main.contains(this.canvas)) { const m = this.getTransform(); txt.push({s, x: m.a * x + m.e, y: m.d * y + m.f, fs: String(this.fillStyle)}); } return F0.call(this, s, x, y, mw); };
    P.fillRect = function (x, y, w, h) { if (ED.roll.el.main.contains(this.canvas) && String(this.fillStyle).toLowerCase() === '#f4f1ea' && w === 2) { const m = this.getTransform(); anc.push({x: m.a * (x + 1) + m.e, y0: m.d * y + m.f, y1: m.d * (y + h) + m.f}); } return R0.call(this, x, y, w, h); };
    try { ED.roll.fitView('clip'); await wait(400); } finally { P.fillText = F0; P.fillRect = R0; }
    const mn = ED.roll.el.main, cv = mn.tagName === 'CANVAS' ? mn : mn.querySelector('canvas'), sc = cv.width / cv.getBoundingClientRect().width;
    return {txt: txt.filter(z => o.SYL.includes(z.s)), anc, sc, rowH: ED.roll._xy(0, 60).y - ED.roll._xy(0, 61).y};
  }, {SYL});
  {
    const got = SYL.map(s => TX.txt.find(z => z.s === s));
    const pos = got.map(z => { if (!z) return null; const a = TX.anc.filter(q => z.y >= q.y0 && z.y <= q.y1 + 1).sort((u, v) => Math.abs(z.x - u.x) - Math.abs(z.x - v.x))[0]; return a ? {dx: +((z.x - a.x) / TX.sc).toFixed(1), low: +((z.y - a.y0) / (a.y1 - a.y0)).toFixed(2), col: z.fs} : null; });
    info('Silben gezeichnet', JSON.stringify({rowH: TX.rowH, sc: TX.sc, pos}));
    ok(got.every(Boolean), '6 Silben-Text in jedem Stück gezeichnet (la le li lo lu na)', got.map(z => z ? z.s : '–').join(' '));
    ok(pos.every(z => z && z.dx >= 3 && z.low >= .5), '6 Silbe klein unten im Stück, rechts vom Anker (nie über der Anker-Linie)', JSON.stringify(pos.map(z => z && [z.dx, z.low])));
    ok(TX.anc.length >= 6, '6 Anker-Linien gezeichnet', String(TX.anc.length));
  }
  await p.screenshot({path: out + '/vx1-editor-hochkant.png'});

  /* ---------- 8 ↶ je Aktion per Touch (waagrecht ziehen, Quant.-Blatt, Teilen, Verbinden) ---------- */
  await run(p, () => ED.roll.setGrid('1/8'));
  const U = [];
  const undoBtn = async () => { await tapEl('#rollSheet .pr-bar button', '↶'); await sleep(450); };
  {
    const u0 = await run(p, () => UNDO.length), e = await run(p, () => window.__vx1.ed()), n2 = e.notes[2];
    const a = await run(p, () => window.__vx1.xy(2)), bx = await run(p, o => window.__vx1.beatXY(o.b, o.n), {b: n2.t + n2.d / 2 + .37, n: n2.n});
    await tdrag(cdp, line([a.x, a.y], [bx.x, a.y], 10), 18);
    const m = await run(p, async o => { for (let i = 0; i < 100 && UNDO.length === o.u0; i++) await wait(50); await wait(300); const e = window.__vx1.ed(), n = e.notes[2]; return {du: UNDO.length - o.u0, ab: n.t + n.a, t: n.t}; }, {u0});
    U.push(['Ziehen', m.du]);
    ok(m.du === 1 && Math.abs(m.ab * 2 - Math.round(m.ab * 2)) < 2e-3 && m.t < m.ab - .05, '8 Stück ziehen: Anker rastet auf 1/8, Anschwung davor, ein ↶-Schritt', 'Anker Schlag ' + m.ab.toFixed(4) + ', Anfang ' + m.t.toFixed(4));
    await undoBtn(); const b2 = await run(p, () => window.__vx1.ed().notes[2]);
    ok(Math.abs(b2.t - n2.t) < 1e-4, '8 ↶ nimmt das Ziehen zurück', b2.t.toFixed(4) + ' / ' + n2.t.toFixed(4));
  }
  {
    ok(await tapEl('#rollSheet .pr-bar button', 'Quant.'), '8 Quant. antippbar'); await sleep(350);
    let L = await layout(p, '#qSheet');
    ok(L && L.x && L.x.in && !L.ov.length, '10 QUANT.-Blatt hochkant: ✕ sichtbar, keine Überlappung', L && L.ov.join(', '));
    const smallQ = L ? L.reach.filter(z => z.h < 44 || z.w < 44).map(z => z.t + ':' + z.w + '×' + z.h) : ['?'];
    ok(!smallQ.length, '10 QUANT.-Blatt hochkant: Tasten-Trefferfläche ≥ 44 px', smallQ.join(' '));
    await p.screenshot({path: out + '/vx1-quant-hochkant.png'});
    await tapEl('#qSheet button', '1/8'); const u0 = await run(p, () => UNDO.length); await tapEl('#qSheet button', 'Anwenden');
    const m = await run(p, async o => { for (let i = 0; i < 100 && UNDO.length === o.u0; i++) await wait(50); await wait(300); return {du: UNDO.length - o.u0, ab: window.__vx1.ed().notes.map(n => n.t + n.a)}; }, {u0});
    ok(m.du === 1 && m.ab.every(v => Math.abs(v * 2 - Math.round(v * 2)) < 2e-3), '8 Quantisieren über das Blatt: alle Anker auf 1/8, ein ↶-Schritt', m.ab.map(v => v.toFixed(3)).join(' '));
    await undoBtn(); const ab = await run(p, () => window.__vx1.ed().notes.map(n => n.t + n.a));
    ok(ab.some(v => Math.abs(v * 2 - Math.round(v * 2)) > .01), '8 ↶ nimmt das Quantisieren zurück', ab.map(v => v.toFixed(3)).join(' '));
  }
  {
    const e = await run(p, () => window.__vx1.ed()), n0 = e.notes[0];
    const t = await run(p, o => window.__vx1.beatXY(o.b, o.n), {b: n0.t + n0.d * .7, n: n0.n}); await ttap(cdp, t.x, t.y); await sleep(250);
    const u0 = await run(p, () => UNDO.length); await tapEl('#rollSheet .pr-bar button', 'Teilen');
    const m = await run(p, async o => { for (let i = 0; i < 100 && window.__vx1.ed().n < 7; i++) await wait(50); await wait(250); return {n: window.__vx1.ed().n, du: UNDO.length - o.u0}; }, {u0});
    ok(m.n === 7 && m.du === 1, '8 Teilen: ein Stück mehr, ein ↶-Schritt', JSON.stringify(m));
    await run(p, () => ED.roll.selectIdx([0, 1])); const u1 = await run(p, () => UNDO.length); await tapEl('#rollSheet .pr-bar button', 'Verbinden');
    const j = await run(p, async o => { for (let i = 0; i < 100 && window.__vx1.ed().n > 6; i++) await wait(50); await wait(250); return {n: window.__vx1.ed().n, du: UNDO.length - o.u1}; }, {u1});
    ok(j.n === 6 && j.du === 1, '8 Verbinden: wieder 6 Stücke, ein ↶-Schritt', JSON.stringify(j));
    await undoBtn(); const n1 = await run(p, () => window.__vx1.ed().n); await undoBtn(); const n2 = await run(p, () => window.__vx1.ed().n);
    ok(n1 === 7 && n2 === 6, '8 ↶ nimmt Verbinden und Teilen einzeln zurück', n1 + ' → ' + n2);
  }

  /* ---------- 10 Layout hochkant + quer: keine Überlappung, ✕ sichtbar, Trefferfläche ≥ 44 px ---------- */
  const lay = async (tag, w, h) => {
    const L = await layout(p, '#rollSheet');
    ok(L.x && L.x.in && L.x.cov, '10 Gesang-Editor ' + tag + ': ✕ sichtbar und antippbar');
    ok(!L.ov.length && !L.hsc, '10 Gesang-Editor ' + tag + ': keine Überlappung, kein waagrechter Seiten-Bildlauf', L.ov.join(', '));
    return L;
  };
  {
    const L = await lay('hochkant 428×926');
    const small = L.reach.filter(z => z.h < 44 || z.w < 44).map(z => z.t + ':' + z.w + '×' + z.h);
    ok(!small.length, '10 Gesang-Editor hochkant: Tasten-Trefferfläche ≥ 44 px', small.join(' ') || L.reach.map(z => z.t + ':' + z.w + '×' + z.h).join(' '));
  }
  for (const [w, h] of [[926, 428], [926, 370]]) {
    await p.setViewportSize({width: w, height: h}); await sleep(900);
    const L = await lay('quer ' + w + '×' + h);
    // quer: Leisten wie im Noten-Editor der Instrumente (Höhe dort festgelegt) – Gesang-Knöpfe nie kleiner als die Instrumenten-Knöpfe
    const I = await run(p, async () => { const t = S.tracks.findIndex(z => z.kind === 'synth' && !z.stimme); return t; });
    const Ld = await run(p, async o => { closeRoll(); await wait(200); selectSlot(o.t, 0); openRoll(o.t, 0); await wait(500); return true; }, {t: I});
    const LI = await layout(p, '#rollSheet');
    const minI = Math.min(...LI.reach.filter(z => !z.cov && z.h).map(z => z.h)), small = L.reach.filter(z => z.h < Math.min(44, minI) || z.w < 44).map(z => z.t + ':' + z.w + '×' + z.h);
    ok(Ld && !small.length, '10 Gesang-Editor quer ' + w + '×' + h + ': Trefferfläche ≥ 44 px breit, Höhe ≥ Noten-Editor der Instrumente (' + minI + ' px, Leiste wie dort)', small.join(' ') || 'Gesang min ' + Math.min(...L.reach.map(z => z.h)) + ' px');
    await run(p, async o => { closeRoll(); await wait(200); selectSlot(o.st, 0); openRoll(o.st, 0); }, r0); await waitEd(6);
    await p.screenshot({path: out + '/vx1-editor-quer-' + h + '.png'});
  }
  await p.setViewportSize({width: 428, height: 926}); await sleep(700);
  await closeEd();

  /* ---------- 7b Song: Gesang-Block antippen → Takes-Blatt → [✎ Bearbeiten] → derselbe Editor an der Stelle ---------- */
  const s7 = await run(p, async o => { songEnsure(); if (S.song.bars < 8) S.song.bars = 8; const m = S.takes[o.id];
    S.song.vox = tkNormVox([{bar: 2, len: 3, take: o.id, in: 0, out: +(m.len / m.sr).toFixed(6), at: 0}]); songChanged(); setSongView(true); await wait(700);
    const L = svLayoutInfo(), cv = L.canvas, ri = SV.rows.indexOf(o.st); let y = null;
    for (let yy = 0; yy < cv.h; yy += 2) { if (svRowAt(yy) === ri) { let y2 = yy; while (svRowAt(y2 + 2) === ri) y2 += 2; y = (yy + y2) / 2; break; } }
    const x = (3 + .5) * SV.cellW - SV.x; return {x: cv.x + x, y: y == null ? null : cv.y + y, beat: barBeat(3) - barBeat(2)}; }, r0);
  ok(s7.y != null, '7 Song: STIMME-Zeile gefunden');
  if (s7.y != null) {
    await ttap(cdp, s7.x, s7.y); await sleep(600);
    const p7 = await run(p, () => UI.pop && UI.pop.name);
    ok(p7 === 'takes', '7 Song: Gesang-Block antippen → Takes-Blatt', String(p7));
    ok(await tapEl('.pop [data-a="vx1r"]'), '7 Song: [✎ Bearbeiten] antippbar');
    const eS = await waitEd(1), sS = await edSig();
    const at = await run(p, async () => { for (let i = 0; i < 40 && window.__vx1.at() == null; i++) await wait(50); return window.__vx1.at(); });
    ok(eS && sS.sheet && sS.ed === 'roll' && sS.pr && sS.vx && sS.take === id && sS.bar === sM.bar && sS.keys === sM.keys, '7 Song und Matrix öffnen DENSELBEN Editor (gleiches Blatt, gleiche Leiste, gleicher Take)', 'Song ' + sS.bar + ' · Matrix ' + sM.bar);
    ok(eS && JSON.stringify(eS.notes.map(n => n.tx)) === JSON.stringify(eM.notes.map(n => n.tx)), '7 Song zeigt dieselben Stücke mit Silben', JSON.stringify(eS && eS.notes.map(n => n.tx)));
    ok(at === s7.beat, '7 Song: Editor öffnet am getippten Takt', at + ' / ' + s7.beat);
    await p.screenshot({path: out + '/vx1-song-editor.png'});
    await closeEd(); await run(p, () => setSongView(false));
  }

  /* ---------- 9 Speichern/Laden (.json) gleich, Container enthält Gesang, klingt gleich; alte Takes ---------- */
  const SV = await run(p, async o => {
    await window.__vx1.quant(o.id, {grid: '1/8', strength: 1}); await window.__vx1.move(o.id, 1, window.__vx1.list(o.id)[1].da + .03, {grid: 'off'}); await window.__vx1.pitch(o.id, 3, 1);
    const sig = id => { const m = S.takes[id]; return JSON.stringify({mk: (m.marks || []).map(k => [k.t, k.an, k.vd]), w: m.warp && {mode: m.warp.mode, an: m.warp.an, src: m.warp.map.src, dst: m.warp.map.dst}, p: m.pitch && m.pitch.notes.map(n => [n.t0, n.t1, n.sh || 0]), ly: m.ly || null}); };
    const hear = async id => { await window.__vx1.render(id); const c = WP.cache.get(id); return c && c.buf ? Array.from(c.buf.getChannelData(0)) : null; };
    const same = (A, B) => { if (!A || !B || A.length !== B.length) return false; for (let i = 0; i < A.length; i++) if (A[i] !== B[i]) return false; return true; };
    const fresh = async id => { WP.cache.delete(id); WP.old && WP.old.delete(id); return hear(id); };
    const s0 = sig(o.id), y0 = await hear(o.id), txt0 = window.__vx1.list(o.id).map(q => q.tx).join(' ');
    // .json (Projekt-Datei) – Gesang-Daten am Take, Audio bleibt im Gerät
    const pr = parseAny(JSON.stringify(projectFileObj(S, false, true))); if (!pr.ok) return {err: pr.error};
    importProject(pr.project, pr.warnings); await wait(500);
    const s1 = sig(o.id), y1 = await fresh(o.id), txt1 = window.__vx1.list(o.id).map(q => q.tx).join(' ');
    // Container (Als Datei sichern mit Audio)
    const z = await tkZipBytes(), fs = await tkUnzip(z), names = fs.map(f => f.name), pj = fs.find(f => f.name === 'projekt.json');
    const wav = fs.find(f => f.name === 'takes/' + o.id + '.wav');
    const pr2 = parseAny(new TextDecoder().decode(pj.data)); if (!pr2.ok) return {err: pr2.error};
    importProject(pr2.project, pr2.warnings); await wait(500);
    const s2 = sig(o.id), y2 = await fresh(o.id);
    // alter Take (Scheiben-Karte, Marken ohne Anker) bleibt beim Normalisieren unverändert
    const m = S.takes[o.id], old = {sr: m.sr, len: m.len, chunks: m.chunks, route: m.route, latMs: m.latMs, created: m.created, src: m.src, marks: [{t: .4, conf: 1}, {t: .9, conf: .5}], warp: {mode: 'slice', grid: 'auto', res: '1/16', strength: 1, swing: .5, bpm: 120, t0: 0, map: {v: 1, src: [0, .4, .9, 3.6], dst: [0, .42, .9, 3.6]}}};
    const on = tkNormTake(JSON.parse(JSON.stringify(old)));
    return {eqJ: s0 === s1, sameJ: same(y0, y1), txt: txt0 === txt1 && txt0, eqZ: s0 === s2, sameZ: same(y0, y2), names: names.filter(n => /takes\/|manifest|projekt/.test(n)), wavN: wav ? wav.data.length : 0, hy: /"mode":"hybrid"/.test(s0), vd: /,\d+(\.\d+)?\]/.test(s0), sh: /,1\]/.test(s0),
      old: !!on && on.warp.mode === 'slice' && !on.warp.an && on.marks.every(k => k.an == null && k.vd == null) && JSON.stringify(on.warp.map) === JSON.stringify(old.warp.map)};
  }, {id});
  ok(!SV.err && SV.hy && SV.vd && SV.sh, '9 bearbeiteter Stand: Schneiden/Dehnen, eigene Ziele, Tonhöhe am Take', JSON.stringify({hy: SV.hy, vd: SV.vd, sh: SV.sh, err: SV.err}));
  ok(SV.eqJ && SV.sameJ && !!SV.txt, '9 Speichern/Laden (.json): Stücke, Anker, Tonhöhe, Silben gleich – klingt bitgleich', JSON.stringify({eq: SV.eqJ, same: SV.sameJ, txt: SV.txt}));
  ok(SV.wavN > 100000 && SV.names.includes('manifest.json') && SV.names.includes('projekt.json'), '9 Container (Als Datei sichern mit Audio) enthält den Gesang (WAV + Inhaltsliste + Projekt)', JSON.stringify({names: SV.names, wav: SV.wavN}));
  ok(SV.eqZ && SV.sameZ, '9 Container laden: gleicher Stand, klingt bitgleich', JSON.stringify({eq: SV.eqZ, same: SV.sameZ}));
  ok(SV.old, '9 alte Takes (Scheiben-Karte, Marken ohne Anker) laden unverändert');
  await p.close();
} catch (e) { bad++; console.log('FEHLER Ausnahme – ' + (e && e.stack || e)); }
ok(!errs.length, 'keine Fehler in der Konsole', errs.slice(0, 5).join(' | '));
await b.close();
console.log(`\nERGEBNIS ${all - bad}/${all}` + (bad ? ' – ' + bad + ' FEHLER' : ' – alles OK'));
process.exit(bad ? 1 : 0);
