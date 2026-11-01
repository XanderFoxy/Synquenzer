// I3b M-FORM in Node: the 20 target forms of B.3 9.1, 10 human-like scribbles each (fixed seed), cleaned with FORMCLEAN (cycle 1/1,
// grid 1/16) -> structure equal? Plus I3-12 ramp, I3-13 stairs, I3-14 no false straightening / off, I3-15 overpaint, I3-16 time,
// I3-38 dotted / triplet grids. node i3-korpus.mjs
import fs from 'fs'; import path from 'path'; import {fileURLToPath} from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const FC = new Function(fs.readFileSync(path.join(HERE, '../src/formclean.js'), 'utf8').replace(/^if \(typeof module[^\n]*\n/m, '') + '\nreturn FORMCLEAN;')();
const FM = new Function(fs.readFileSync(path.join(HERE, '../src/form.js'), 'utf8').replace('window.FORM = FORM;', '') + '\nreturn FORM;')();
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
let seed = 20261101; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const LIB = FM.lib();
// sine: b per quarter by best fit (determined once here)
function sinB() { let best = 0, be = 1e9; for (let b = -100; b <= 100; b++) { const k = .06 * b; let e = 0; for (let i = 0; i <= 48; i++) { const s = i / 48, g = Math.abs(k) < 1e-4 ? s : (Math.exp(k * s) - 1) / (Math.exp(k) - 1); e += (g - Math.sin(s * Math.PI / 2)) ** 2; } if (e < be) { be = e; best = b; } } return best; }
const SB = sinB();
const stair = (n, ys) => { const L = 768 / n, k = []; ys.forEach((y, i) => k.push([Math.round(i * L), y, 0, 0])); k.push([768, ys[ys.length - 1], 0, 0]); return k; };
const T = [
  ['Rampe auf', [[0, -1000, 1, 0], [768, 1000, 0, 0]]], ['Rampe ab', [[0, 1000, 1, 0], [768, -1000, 0, 0]]],
  ['Dreieck', [[0, -1000, 1, 0], [384, 1000, 1, 0], [768, -1000, 0, 0]]],
  ['Säge mit Kante', [[0, -1000, 1, 0], [384, 1000, 0, 0], [384, -1000, 1, 0], [768, 1000, 0, 0]]],
  ['Rechteck halb', [[0, 1000, 0, 0], [384, -1000, 0, 0], [768, -1000, 0, 0]]],
  ['Treppe 4 auf', stair(4, [-750, -250, 250, 750])], ['Treppe 4 ab', stair(4, [750, 250, -250, -750])],
  ['Treppe 8 auf', stair(8, [-875, -625, -375, -125, 125, 375, 625, 875])],
  ['Treppe 16 auf', stair(16, Array.from({length: 16}, (_, i) => -1000 + 125 * i))],
  ['Bogen', [[0, -1000, 2, -60], [384, 1000, 2, 60], [768, -1000, 0, 0]]],
  ['Sinus', [[0, 0, 2, -SB], [192, 1000, 2, SB], [384, 0, 2, -SB], [576, -1000, 2, SB], [768, 0, 0, 0]]],
  ['Pumpen', LIB.Pumpen.k], ['Gate', LIB.Gate.k], ['Triller', LIB.Triller.k],
  ['Rampe + Halten', [[0, -1000, 1, 0], [576, 1000, 0, 0], [768, 1000, 0, 0]]],
  ['Halten + Rampe ab + Halten', [[0, 1000, 0, 0], [192, 1000, 1, 0], [576, -1000, 0, 0], [768, -1000, 0, 0]]],
  ['Abklingen', [[0, 1000, 2, -80], [768, -1000, 0, 0]]], ['Anschwellen', [[0, -1000, 2, 80], [768, 1000, 0, 0]]],
  ['Achtel-Puls', [0, 1, 2, 3].flatMap(q => [[192 * q, 1000, 0, 0], [192 * q + 96, 0, 0, 0]]).concat([[768, 0, 0, 0]])],
  ['Gemischt', [[0, -1000, 1, 0], [192, 500, 0, 0], [384, -500, 2, -50], [768, 1000, 0, 0]]],
];
// a human-like stroke over the whole cycle: 60 Hz, 0.3..1.5 s, jitter sigma 1.5 % of the height (30), 4 % overshoot at corners
function scribble(k) {
  // the finger moves at an even speed along the drawn path (vertical edges get their samples), 60 Hz, 0.3..1.5 s
  const f = {v: 1, k}, S = FC.sample(f), P = [[0, S[0]]];
  for (let i = 0; i < k.length; i++) { const q = k[i]; if (i && q[0] === k[i - 1][0]) P.push([q[0], q[1]]); }
  const path = []; let L = 0;
  for (let x = 0; x <= 768; x++) { const y = S[x]; if (x && k.some((q, i) => i && q[0] === x && k[i - 1][0] === x)) { const y0 = k.find((q, i) => i < k.length - 1 && k[i + 1][0] === x && q[0] === x)[1]; path.push([x, y0, L]); L += Math.abs(y - y0) * .384; }
    if (path.length) { const p = path[path.length - 1]; L += Math.hypot(x - p[0], (y - p[1]) * .384); } path.push([x, y, L]); }
  const sec = .3 + 1.2 * rnd(), n = Math.max(20, Math.round(sec * 60)), pts = [];
  let j = 0;
  for (let i = 0; i <= n; i++) {
    const s = i / n * L; while (j < path.length - 2 && path[j + 1][2] < s) j++;
    const a = path[j], b = path[j + 1], w = b[2] > a[2] ? (s - a[2]) / (b[2] - a[2]) : 0;
    const u = Math.min(768, Math.max(0, a[0] + (b[0] - a[0]) * w)), y = a[1] + (b[1] - a[1]) * w;
    pts.push([u, Math.max(-1000, Math.min(1000, y + gauss() * 30))]);
  }
  return pts;
}
// structure: the non-empty sections with their kind (hold / straight / curve) and the edges; hold heights, edge ticks
function struct(k) {
  const s = []; for (let i = 0; i < k.length - 1; i++) { const a = k[i], b = k[i + 1]; if (b[0] <= a[0]) continue; s.push({x0: a[0], x1: b[0], t: a[2], y: a[1], e: i > 0 && k[i - 1][0] === a[0] ? 1 : (i > 0 && k[i - 1][2] === 0 && k[i - 1][1] !== a[1] ? 1 : 0)}); }
  return s;
}
function same(A, B) {
  const a = struct(A), b = struct(B); if (a.length !== b.length) return 'Zahl ' + b.length + '≠' + a.length;
  for (let i = 0; i < a.length; i++) {
    const ta = a[i].t === 2 ? 2 : a[i].t, tb = b[i].t;
    if (ta !== tb) return 'Art ' + i + ': ' + tb + '≠' + ta;
    if (Math.abs(a[i].x0 - b[i].x0) > 1) return 'Lage ' + i + ': ' + b[i].x0 + '≠' + a[i].x0;
    if (ta === 0 && Math.abs(a[i].y - b[i].y) > 20) return 'Stufe ' + i + ': ' + b[i].y + '≠' + a[i].y;
  }
  return '';
}
const R16 = FC.raster(4, .25);
const cleanPts = (pts, prev, on, R_) => { const raw = FC.newRaw(), r = FC.paint(raw, pts); R_ = R_ || R16; return FC.clean(raw, r.u0, r.u1, prev || null, {lines: R_.lines, Z: R_.Z, on: on !== false}); };
if (process.env.DBG) { const k = T[+process.env.DBG][1]; for (let r = 0; r < 2; r++) { const pts = scribble(k), raw = FC.newRaw(), q = FC.paint(raw, pts); let j = 0; for (let x = 1; x <= 768; x++) if (Math.abs(raw[x] - raw[x - 1]) >= 100) j++;
  const res = FC.clean(raw, q.u0, q.u1, null, {lines: R16.lines, Z: R16.Z, on: true}); console.log(T[+process.env.DBG][0], 'pts', pts.length, 'jumps', j, res && res.err, res && res.f && JSON.stringify(res.f.k)); } process.exit(0); }
let total = 0, good = 0, worst = 0; const per = [];
for (const [name, k] of T) {
  let g = 0, why = '';
  for (let r = 0; r < 10; r++) { const res = cleanPts(scribble(k)); const w = res && res.f ? same(k, res.f.k) : 'kein Ergebnis'; if (!w) g++; else why = why || w; }
  total += 10; good += g; per.push(name + ' ' + g + '/10' + (why ? ' (' + why + ')' : '')); if (g < 10) worst++;
}
ok('I3-11 Korpus strukturgleich ≥ 90 %', good / total >= .9, (100 * good / total).toFixed(0) + ' % (' + good + '/' + total + ')');
console.log('      ' + per.join('\n      '));
// I3-12 a ramp with jitter -> exactly one straight, ends on the grid
{ let n1 = 0; for (let r = 0; r < 20; r++) { const res = cleanPts(scribble(T[0][1])); const s = struct(res.f.k); if (s.length === 1 && s[0].t === 1) n1++; } ok('I3-12 Rampe → genau eine Gerade', n1 >= 19, n1 + '/20'); }
// I3-13 stairs 4/8/16: equal lengths (exactly the grid) and heights +-5
for (const idx of [5, 7, 8]) { let n1 = 0; for (let r = 0; r < 10; r++) { const res = cleanPts(scribble(T[idx][1])); const s = struct(res.f.k).filter(q => q.t === 0); const L = s.map(q => q.x1 - q.x0); const okL = L.every(l => Math.abs(l - L[0]) <= 1); const d = s.slice(1).map((q, i) => q.y - s[i].y); if (okL && d.every(x => Math.abs(x - d[0]) <= 5)) n1++; } ok('I3-13 ' + T[idx][0] + ': gleich lang, gleich hoch', n1 >= 9, n1 + '/10'); }
// I3-14 sine / arc / pump: curves or >= 4 sections, RMS to the model <= 5 %, no stair; cleaning off: RMS to the raw <= 1.5 %
{ let bad = 0; for (const idx of [9, 10, 11]) for (let r = 0; r < 5; r++) { const res = cleanPts(scribble(T[idx][1])); const S1 = FC.sample(res.f), S0 = FC.sample({v: 1, k: T[idx][1]}); let e = 0; for (let x = 0; x <= 768; x++) e += (S1[x] - S0[x]) ** 2; e = Math.sqrt(e / 769) / 2000; const st = struct(res.f.k); if (e > .05 || (st.filter(q => q.t === 0).length >= 3 && idx !== 11)) bad++; } ok('I3-14 keine falsche Begradigung (Sinus, Bogen, Pumpen)', bad === 0, bad + ' von 15 daneben'); }
{ const pts = scribble(T[10][1]), raw = FC.newRaw(), r = FC.paint(raw, pts), res = FC.clean(raw, r.u0, r.u1, null, {lines: R16.lines, Z: R16.Z, on: false}); const S1 = FC.sample(res.f); let e = 0, n = 0; for (let x = 0; x <= 768; x++) if (raw[x] === raw[x]) { e += (S1[x] - raw[x]) ** 2; n++; } e = Math.sqrt(e / n) / 2000; ok('I3-14 Aufräumen aus: RMS zur Rohform ≤ 1,5 %, nur Geraden', e <= .015 && struct(res.f.k).every(q => q.t === 1), (e * 100).toFixed(2) + ' %, ' + (res.f.k.length - 1) + ' Abschnitte'); }
// I3-15 overpaint the 2nd quarter only -> knots outside [quarter 2 +- 1 field] deep-equal
{ const prev = {v: 1, k: T[7][1]}, pts = []; for (let i = 0; i <= 30; i++) pts.push([192 + i / 30 * 192, 600 + gauss() * 20]);
  const res = cleanPts(pts, prev); const out = k => k.filter(q => q[0] < 192 - 48 || q[0] > 384 + 48).map(q => q.join(',')).join(' ');
  ok('I3-15 Übermalen nur im 2. Viertel: Rest Knoten für Knoten gleich', res && res.f && out(res.f.k) === out(prev.k), res && res.f ? '' : 'kein Ergebnis'); }
// I3-16 time: <= 5 ms median
{ const ms = []; for (let r = 0; r < 40; r++) { const pts = scribble(T[r % 20][1]), t0 = performance.now(); cleanPts(pts); ms.push(performance.now() - t0); } ms.sort((a, b) => a - b); const md = ms[ms.length >> 1]; ok('I3-16 Aufräumen ≤ 5 ms (Median)', md <= 5, md.toFixed(2) + ' ms, max ' + ms[ms.length - 1].toFixed(1)); }
// I3-38 dotted and triplet cycles
{ const a = FC.raster(3, .25), b = FC.raster(3, 1 / 6), c = FC.raster(2 / 3, .25), d = FC.raster(.75, .25);
  ok('I3-38 1/2. mit 1/16 → 12 Felder auf Vielfachen von 64', a.N === 12 && a.lines.every(x => x % 64 === 0), a.N + ' Felder');
  ok('I3-38 1/2. mit 1/16T → 18 Felder, Linien gerundet', b.N === 18 && b.lines.every((x, i) => Math.abs(x - Math.min(768, i * 768 / 18)) <= .5), b.N + ' Felder');
  ok('I3-38 1/4T mit 1/16 → Linien 0, 288, 576, „2 Felder + Rest“', JSON.stringify(c.lines) === '[0,288,576,768]' && c.rest && FC.rasterText('1/4T', c).includes('2 Felder + Rest'), JSON.stringify(c.lines) + ' ' + FC.rasterText('1/4T', c));
  ok('I3-38 1/8. mit 1/16 → 3 Felder', d.N === 3, d.N + ' Felder'); }
// I3-03 (part) main-thread FORM.eval: edges of 1 ms, no NaN, triller at 1/32: 0.667 ms floor
{ let nan = 0; for (const [, k] of T) for (let i = 0; i < 1000; i++) { const v = FM.eval({v: 1, k}, rnd(), .001, {wrap: true, cyc: 2}); if (!(v === v)) nan++; } ok('I3-03 FORM.eval ohne NaN (20 Formen × 1000 Phasen)', nan === 0); }
console.log(fails ? 'FEHLER: ' + fails : 'ALLES GRÜN');
process.exit(fails ? 1 : 0);
