// G6+g Abnahme: G6P-60 … G6P-63 (+ Smoke, Bildschirmfotos). Aufruf: node tests/g6pg.mjs
import { open, sing, chor, sleep, HERE } from './lib.mjs';
import path from 'path';
const SHOT = path.resolve(HERE, '../shots'); const res = []; let fail = 0;
const ok = (id, c, info) => { res.push((c ? '✓ ' : '✗ ') + id + (info ? ' · ' + info : '')); if (!c) fail++; };
// ---------- G6P-60: Tabelle + Kontrast (rein rechnerisch, im Browser die App-Funktionen) ----------
const lum = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4)); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
{
  const {b, p, errs} = await open();
  const T = await p.evaluate(() => {
    const S = SYNQUENZER, o = [];
    // Stufen (v2: d + 7·o)
    [[2, 'c3', '3'], [-2, 'c3', '3'], [9, 'c3', '10'], [-9, 'c3', '10'], [4, 'c5', '5'], [-4, 'c5', '5'], [5, 'c6', '6'], [-5, 'c6', '6'], [7, 'c8', '8'], [-7, 'c8', '8'], [14, 'c8', '8'],
     [3, 'c4', '4'], [-3, 'c4', '4'], [1, 'c2', '2'], [6, 'c2', '7'], [-6, 'c2', '7'], [0, 'c1', '1'], [11, 'c5', '5']].forEach(([D, c, d]) => { const r = S.g6pgCls(D); o.push(['D' + D, r.c === c && r.dig === d, r.c + r.dig]); });
    // Halbtöne (v1: iv)
    [[3, 'c3', '3'], [4, 'c3', '3'], [-4, 'c3', '3'], [16, 'c3', '10'], [7, 'c5', '5'], [9, 'c6', '6'], [-12, 'c8', '8'], [12, 'c8', '8'], [5, 'c4', '4'], [0, 'c1', '1']].forEach(([iv, c, d]) => { const r = S.g6pgSemi(iv); o.push(['iv' + iv, r.c === c && r.dig === d, r.c + r.dig]); });
    // Rollen + Akkord-Rolle (häufigstes Intervall, Gleichstand: kleineres)
    const rl = [['st+2', 'c3'], ['oct-1', 'c8'], ['uni', 'c1'], ['st+2/o+1', 'c3'], ['free', 'cF'], ['st-4', 'c5']].map(([ro, c]) => [ro, S.g6pgRole(ro).c === c, S.g6pgRole(ro).c]);
    const ch = S.g6pgRole('ch+1', {n: [{d: 2}, {d: 4}, {d: 4}, {d: 2}, {d: 5}]}), ch2 = S.g6pgRole('root-', {n: [{d: -4}, {d: -4}, {d: -9}]});
    rl.push(['ch+1 Gleichstand→3', ch.c === 'c3', ch.c], ['root- häufig 5', ch2.c === 'c5', ch2.c]);
    return {o: o.concat(rl), pal: S.g6pgPal()};
  });
  const bad = T.o.filter(x => !x[1]); ok('G6P-60 Tabelle', bad.length === 0, T.o.length + ' Fälle' + (bad.length ? ' falsch: ' + JSON.stringify(bad) : ''));
  const cd = Object.entries(T.pal.dark).map(([k, v]) => [k, cr(v, '#0e1014'), cr(v, '#15171b')]), cl = Object.entries(T.pal.light).map(([k, v]) => [k, cr(v, '#ffffff'), cr(v, '#f4f1ea')]);
  const mind = Math.min(...cd.flatMap(x => [x[1], x[2]])), minl = Math.min(...cl.flatMap(x => [x[1], x[2]]));
  ok('G6P-60 Kontrast', mind >= 3 && minl >= 3, 'dunkel min ' + mind.toFixed(2) + ' : 1, hell min ' + minl.toFixed(2) + ' : 1');
  await b.close();
}
// ---------- G6P-61: Schatten im Noten-Editor ----------
{
  const {b, p, errs} = await open();
  await sing(p); const I = await chor(p, 'drei');
  ok('Vorbereitung Chor', !!(I && I.chor), I && I.chor ? I.chor.rec + ' · ' + I.chor.voices.length + ' Stimmen' : 'kein Chor');
  await p.evaluate(() => SYNQUENZER.g2Open()); await sleep(1200);
  const G = await p.evaluate(() => { const g = SYNQUENZER.g2Geom(), geo = SYNQUENZER.g6pgGeo(), hit = SYNQUENZER.g6pgHit(); return {g, geo, hit}; });
  // Start ± 1 px, Zeile = Ton der Stimme
  let worst = 0, rowBad = 0, cnt = 0;
  const X = t => G.g.x + (t - G.g.view.a) / G.g.view.W * G.g.w, Y = q => G.g.y + G.g.h - (q - G.g.lo + .5) * G.g.rowH;
  const vis = G.geo.notes.filter(n => X(n.t1) > G.g.x && X(n.t0) < G.g.x + G.g.w);
  for (const n of vis) { const h = G.hit.find(z => z.k === n.k && Math.abs(z.x0 - X(n.t0)) < 3 && Math.abs(z.y - Y(n.p)) < .6); cnt++; if (!h) { rowBad++; continue; } worst = Math.max(worst, Math.abs(h.x0 - X(n.t0))); }
  ok('G6P-61 Lage', rowBad === 0 && worst <= 1 && cnt > 0, cnt + ' Schatten · Start max Δ ' + worst.toFixed(2) + ' px · falsche Zeile ' + rowBad);
  // Pixel: Mitte eines Schattens zeigt die Farbe der Spur (nicht vom Lead-Block verdeckt)
  const pick = await p.evaluate(G => {
    const E = G2.ed, cv = E.cv, g = cv.getContext('2d'), dpr = cv.width / cv.clientWidth, out = [];
    const pal = SYNQUENZER.g6pgPal().dark;
    const lead = (E.blk || []).map(b => ({x0: b.x0, x1: b.x1, y: b.y}));
    for (const h of SYNQUENZER.g6pgHit()) { if (h.k < 0) continue; const rc = cv.getBoundingClientRect(), cx = (h.x0 + h.x1) / 2 - rc.left, cy = h.y - rc.top;
      if (lead.some(b => cx >= b.x0 - 2 && cx <= b.x1 + 2 && Math.abs(cy - b.y) < E.rowH)) continue;
      const d = g.getImageData(Math.round(cx * dpr), Math.round(cy * dpr), 1, 1).data; const n = G.geo.notes.find(z => z.k === h.k); out.push({k: h.k, c: n && G.geo.lanes[h.k].c, px: [d[0], d[1], d[2]]});
      if (out.length > 8) break; }
    return {out, pal};
  }, G);
  const hx = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16));
  let pxOk = 0; for (const o of pick.out) { const nn = G.geo.notes.filter(z => z.k === o.k); const col = hx(pick.pal[nn[0].c]); const bg = [14, 16, 20];
    // gemischt mit Alpha .34: Farbanteil > 20 % in Richtung der Spurfarbe
    const dot = [0, 1, 2].reduce((s, i) => s + (o.px[i] - bg[i]) * (col[i] - bg[i]), 0) / [0, 1, 2].reduce((s, i) => s + (col[i] - bg[i]) ** 2, 0); if (dot > .2) pxOk++; }
  ok('G6P-61 Pixel', pick.out.length > 0 && pxOk === pick.out.length, pxOk + '/' + pick.out.length + ' Schatten in Spurfarbe');
  await p.screenshot({path: SHOT + '/g2-schatten-P3.png'});
  // Legende: Chips je Spur, ≥ 44 × 44
  const L = await p.evaluate(() => [...document.querySelectorAll('#wpSheet .g6pgleg button')].map(b => { const r = b.getBoundingClientRect(); return {a: b.dataset.a, w: r.width, h: r.height}; }));
  ok('G6P-61 Legende', L.length >= 2 * I.chor.voices.length && L.every(x => x.w >= 44 && x.h >= 44), L.length + ' Knöpfe, min ' + Math.min(...L.map(x => x.w)).toFixed(0) + '×' + Math.min(...L.map(x => x.h)).toFixed(0));
  // Auge blendet aus
  const id0 = G.geo.lanes[0].id;
  await p.click('#wpSheet .g6pgleg button[data-a=eye][data-id="' + id0 + '"]'); await sleep(150);
  const hid = await p.evaluate(() => SYNQUENZER.g6pgHit().filter(h => h.k === 0).length);
  ok('G6P-61 Auge', hid === 0, 'Schatten Stimme 0 nach Auge: ' + hid);
  await p.click('#wpSheet .g6pgleg button[data-a=eye][data-id="' + id0 + '"]'); await sleep(150);
  // Solo über die Legende, endet beim Schließen
  await p.click('#wpSheet .g6pgleg button[data-a=solo][data-k="1"]'); await sleep(100);
  const s1 = await p.evaluate(() => G6.solo);
  await p.evaluate(() => SYNQUENZER.g2Close()); await sleep(100);
  const s2 = await p.evaluate(() => G6.solo);
  ok('G6P-61 Solo', s1 === 1 && s2 == null, 'Solo offen ' + s1 + ' · nach Schließen ' + s2);
  // Tipp auf einen Schatten öffnet die Stimme (Lead grau)
  await p.evaluate(() => SYNQUENZER.g2Open()); await sleep(600);
  const tgt = await p.evaluate(() => { const E = G2.ed, lead = E.blk || [], rc = E.cv.getBoundingClientRect();
    for (const h of SYNQUENZER.g6pgHit()) { if (h.k < 0) continue; const cx = (h.x0 + h.x1) / 2, cy = h.y; if (lead.some(b => cx - rc.left >= b.x0 - 8 && cx - rc.left <= b.x1 + 8 && Math.abs(cy - rc.top - b.y) < Math.max(16, E.rowH))) continue; return {x: cx, y: cy, k: h.k}; } return null; });
  if (tgt) { await p.touchscreen.tap(tgt.x, tgt.y); await sleep(700); }
  const op = await p.evaluate(() => ({voice: G2.ed && G2.ed.voice, lead: SYNQUENZER.g6pgHit().filter(h => h.k === -1).length, cur: !!document.querySelector('#wpSheet .g6pgc.cur')}));
  ok('G6P-61 Tipp öffnet', !!tgt && op.voice === tgt.k && op.lead > 0 && op.cur, 'Stimme ' + (tgt && tgt.k) + ' → Editor ' + op.voice + ' · Lead grau ' + op.lead);
  await p.screenshot({path: SHOT + '/g2-chorstimme-P3.png'});
  await p.evaluate(() => SYNQUENZER.g2Close());
  // Marken-/Wellen-Editor: Linien
  const wpo = await p.evaluate(() => { const r = {t: stimmeT(), s: 0}; return typeof wpOpen === 'function' ? wpOpen(r) !== false : false; }); await sleep(900);
  const wl = await p.evaluate(() => { const E = WP.ed; if (!E) return null; const pal = SYNQUENZER.g6pgPal().dark, geo = SYNQUENZER.g6pgGeo(), g = E.cv.getContext('2d'), dpr = E.cv.width / E.cv.clientWidth;
    // Farbe genau auf einer Linie: eine Note mitten im Bild suchen, Pixel in Spaltenmitte von oben nach unten abtasten
    const W = E.cv.clientWidth, n = geo.notes.find(z => { const a = E.X(z.t0), b = E.X(z.t1); return a > 4 && b < W - 4 && b - a > 6; }); if (!n) return {n: 0};
    const xx = Math.round((E.X(n.t0) + E.X(n.t1)) / 2 * dpr), col = pal[n.c], c = [1, 3, 5].map(i => parseInt(col.slice(i, i + 2), 16)), H = E.cv.height; let found = 0;
    const d = g.getImageData(xx, 0, 1, H).data; for (let y = 0; y < H; y++) { const e = Math.abs(d[y * 4] - c[0]) + Math.abs(d[y * 4 + 1] - c[1]) + Math.abs(d[y * 4 + 2] - c[2]); if (e < 40) found++; }
    return {n: 1, found, leg: document.querySelectorAll('#wpSheet .g6pgc').length}; });
  ok('G6P-61 Wellen-Editor', wpo && wl && wl.found >= 2 && wl.leg > 0, JSON.stringify(wl));
  await p.screenshot({path: SHOT + '/wp-linien-P3.png'});
  await p.evaluate(() => wpClose());
  ok('Fehlerfrei (61)', errs.length === 0, JSON.stringify(errs.slice(0, 3)));
  await b.close();
}
// ---------- G6P-62: Bildzeit 4 Stimmen auf 32-s-Take, Cache beim Zoomen/Scrollen ----------
{
  const {b, p, errs} = await open({width: 390, height: 844});
  const mid = []; for (let i = 0; i < 64; i++) mid.push([60, 62, 64, 65, 67, 69, 71, 72][i % 8]);
  await sing(p, mid);
  // v2-Daten (Schnittstelle G6+a, §2.2) direkt setzen: 4 Stimmen, Spuren an der STIMME-Spur
  const n4 = await p.evaluate(async () => {
    const st = stimmeT(), c = S.tracks[st].clips[0], A = await g2Analyse(c.audio.take); const ln = A.notes;
    const mk = (rule, d, o) => ({lane: 'c' + (rule.length + d + 9), rule, db: 0, pan: 0, w: .5, dbl: [{ms: 12, ct: -6, p: -1}], n: ln.map(n => ({t0: n.t0, t1: n.t1, m: n.m, d, o, iv: 0}))});
    const V = [mk('st+2', 2, 0), mk('st+4', 4, 0), mk('oct+1', 0, 1), mk('st-5', -5, 0)];
    V.forEach((v, k) => { v.lane = 'c' + (k + 1); });
    c.audio.chor = {v: 2, style: null, grp: {below: 8}, voices: V};
    S.tracks[st].chor = {lanes: [{id: 'c1', role: 'st+2', name: 'Chor Terz oben'}, {id: 'c2', role: 'st+4', name: 'Chor Quinte oben'}, {id: 'c3', role: 'oct+1', name: 'Chor Oktave oben'}, {id: 'c4', role: 'st-5', name: 'Chor Sexte unten'}]};
    return {notes: ln.length, dur: c.audio.out};
  });
  ok('Vorbereitung 32 s', n4.dur >= 31.9 && n4.notes >= 50, n4.notes + ' Noten · ' + n4.dur + ' s');
  const T = await p.evaluate(async () => {
    SYNQUENZER.g2Open(); await new Promise(r => setTimeout(r, 900));
    const E = G2.ed, t = []; const meas = k => { const a = []; for (let i = 0; i < k; i++) { const t0 = performance.now(); g2Paint(); a.push(performance.now() - t0); } a.sort((x, y) => x - y); return a[Math.floor(a.length * .95)]; };
    meas(10); SYNQUENZER.g6pgReset();
    const withC = meas(80), st1 = SYNQUENZER.g6pgInfo().st;
    // Zoomen + Scrollen: Geometrie bleibt (Treffer), Bild wird je Ansicht neu
    SYNQUENZER.g6pgReset(); E.zoom = 2; g2Paint(); for (let i = 0; i < 20; i++) { E.va += .4; g2Paint(); } E.zoom = 0; g2Paint();
    const st2 = SYNQUENZER.g6pgInfo().st;
    const lanes = SYNQUENZER.g6pgLanes().map(l => l.c + l.dig + ':' + l.name);
    const keep = deep(S.tracks[stimmeT()].clips[0].audio.chor); delete S.tracks[stimmeT()].clips[0].audio.chor; meas(10); const without = meas(80);
    S.tracks[stimmeT()].clips[0].audio.chor = keep; g2Paint();
    return {withC, without, st1, st2, lanes, geo: SYNQUENZER.g6pgGeo().notes.length};
  });
  ok('G6P-62 Bildzeit', T.withC - T.without <= 2, 'p95 mit Chor ' + T.withC.toFixed(2) + ' ms, ohne ' + T.without.toFixed(2) + ' ms (Δ ' + (T.withC - T.without).toFixed(2) + ') · ' + T.geo + ' Schatten');
  ok('G6P-62 Puffer ohne Änderung', T.st1.geo === 0 && T.st1.img === 0 && T.st1.imgHit >= 80, JSON.stringify(T.st1));
  ok('G6P-62 Zoom/Scroll Cache', T.st2.geo === 0 && T.st2.geoHit >= 22 && T.st2.img >= 20, JSON.stringify(T.st2));
  ok('v2-Spuren Farben', JSON.stringify(T.lanes) === JSON.stringify(['c33:Chor Terz oben', 'c55:Chor Quinte oben', 'c88:Chor Oktave oben', 'c66:Chor Sexte unten']), JSON.stringify(T.lanes));
  // v2: Ton = Stufe vom Lead-Ziel in der Tonart (C-Dur: E → Terz oben G)
  const tone = await p.evaluate(() => { const g = SYNQUENZER.g6pgGeo(), L = g2Notes(S.tracks[stimmeT()].clips[0].audio.take); const out = [];
    for (const n of g.notes.filter(z => z.k === 0).slice(0, 8)) { const l = L.find(z => Math.abs(z.t0 - n.t0) < 1e-4); out.push([Math.round(l.m), n.p]); } return out; });
  const exp = {60: 64, 62: 65, 64: 67, 65: 69, 67: 71, 69: 72, 71: 74, 72: 76};
  ok('v2 Stufen-Ton', tone.length === 8 && tone.every(([l, q]) => exp[l] === q), JSON.stringify(tone));
  await p.screenshot({path: SHOT + '/g2-v2-4stimmen-P3.png'});
  ok('Fehlerfrei (62)', errs.length === 0, JSON.stringify(errs.slice(0, 3)));
  await b.close();
}
// ---------- G6P-63: Selbst singen v2 ----------
{
  const {b, p, errs} = await open();
  await sing(p); await chor(p, 'drei');
  await p.evaluate(async () => { await SYNQUENZER.g6Wait(); });
  await p.evaluate(() => { SYNQUENZER.play(); launchClip(stimmeT(), 0); }); await sleep(3000);
  const before = await p.evaluate(() => deep(S.tracks[stimmeT()].clips[0].audio.chor.voices[1]));
  await p.evaluate(() => SYNQUENZER.g6pgSing(null, 1)); await sleep(400);
  const A = await p.evaluate(() => ({i: SYNQUENZER.g6pgInfo(), nodes: SYNQUENZER.g6Nodes()}));
  const lr = A.i.lead.filter(x => x.G > 0).map(x => 20 * Math.log10(Math.max(1e-9, x.g / x.G)));
  const others = A.nodes.filter(n => n.k.split(':')[1] !== '1').every(n => n.g < 1e-3), tgt = A.nodes.filter(n => n.k.split(':')[1] === '1').every(n => n.g > .5);
  ok('G6P-63 Lead −12 dB', lr.length > 0 && lr.every(d => Math.abs(d + 12) <= .5), 'Lead ' + lr.map(d => d.toFixed(2) + ' dB').join(', '));
  ok('G6P-63 Führung/andere stumm', others && tgt, 'Ziel hörbar ' + tgt + ' · andere stumm ' + others + ' ' + JSON.stringify(A.nodes.map(n => n.k.replace(/^[^:]*/, '') + '=' + n.g.toFixed(2))));
  await p.evaluate(() => SYNQUENZER.g6pgLeadQ(false)); await sleep(300);
  const B = await p.evaluate(() => SYNQUENZER.g6pgInfo().lead);
  ok('G6P-63 Schalter aus ⇒ Lead stumm', B.length > 0 && B.every(x => x.g < 1e-3), JSON.stringify(B.map(x => +x.g.toFixed(4))));
  await p.evaluate(() => SYNQUENZER.g6pgLeadQ(true));
  // Editor offen: Ziel kräftig, Rest blass (Bild), Legende zeigt [Lead leise]
  await p.evaluate(() => SYNQUENZER.g2Open()); await sleep(700);
  const lq = await p.evaluate(() => !!document.querySelector('#wpSheet .g6pglq.on'));
  await p.screenshot({path: SHOT + '/g2-selbst-singen-P3.png'});
  ok('G6P-63 Hervorhebung/Schalter sichtbar', lq, 'Lead leise sichtbar ' + lq);
  await p.evaluate(() => SYNQUENZER.g2Close());
  // Aufnahme ersetzt die Stimme (Overdub-Haken wie ● REC); als v2 markiert → dblOff, Pan/Pegel bleiben; ein Undo-Schritt
  await p.evaluate(() => { S.tracks[stimmeT()].clips[0].audio.chor.v = 2; });
  const u0 = await p.evaluate(() => UNDO.length);
  await sing(p, [64, 65, 67, 69, 71, 69, 67, 65]);
  const C = await p.evaluate(() => ({v: deep(S.tracks[stimmeT()].clips[0].audio.chor.voices[1]), arm: G6.arm, solo: G6.solo, u: UNDO.length}));
  ok('G6P-63 Aufnahme ersetzt', !!C.v.take && C.v.dblOff === true && C.v.pan === before.pan && C.v.db === before.db && C.arm == null && C.solo == null && C.u - u0 === 1,
    'take ' + !!C.v.take + ' · dblOff ' + C.v.dblOff + ' · pan ' + C.v.pan + '/' + before.pan + ' · db ' + C.v.db + '/' + before.db + ' · Undo +' + (C.u - u0));
  ok('Fehlerfrei (63)', errs.length === 0, JSON.stringify(errs.slice(0, 3)));
  await b.close();
}
console.log(res.join('\n')); console.log(fail ? fail + ' FEHLER' : 'alle grün');
process.exit(fail ? 1 : 0);
