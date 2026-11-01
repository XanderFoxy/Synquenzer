// 4.25.2 Abnahme K-01 … K-10 (K1 Ausklang, K2 Marken-Gesten, K3 Clip-Blatt STIMME, K4 feste Take-Nummern).
// node k.mjs <index-4252.html> [index.html = 4.25.1 zum Vergleich]
import {open, g10demo, closeAll, sleep, T, FMT, platz} from './h-lib.mjs';
const FILE = process.argv[2], PREV = process.argv[3], ok = T();
const SR = 48000;
// Gesang-Attrappe: Silben (220 Hz, 120 ms) alle 0,5 s, dazwischen Stille
const pcm = sec => { const n = Math.round(sec * SR), x = new Array(n).fill(0); for (let k = 0; k * .5 + .12 < sec; k++) { const a = Math.round((k * .5 + .05) * SR); for (let i = 0; i < .12 * SR; i++) x[a + i] = Math.round(Math.sin(2 * Math.PI * 220 * i / SR) * 9000 * Math.sin(Math.PI * i / (.12 * SR))); } return x; };
async function inject(p, o) { return p.evaluate(async o => { const r = await SYNQUENZER.tkInject(o); await SYNQUENZER.tkLoadAll(); return r; }, o); }
// ---------- K1
async function k1(file) {
  const H = await open(file), p = H.p; await g10demo(p); await p.evaluate(() => SYNQUENZER.setBpm(120));
  const r = await inject(p, {pcm: pcm(4.6), scene: 0, len: 2});
  return p.evaluate(async r => {
    ensureAudio(); const st = r.track, c = S.tracks[st].clips[0], a = c.audio, sp = spb();
    a.out = tkR6(a.in + 8 * sp); S.takes[a.take].post = {out: a.out, sec: .4};          // gemessener Ausklang am Clip-Ende (2 Takte)
    const run = () => { G3.log.length = 0; try { g3Exit(st, null, {slot: 0, cs: 0}, 2, 8, 0); g3Exit(st, null, {slot: 0, cs: 0}, 1, 4, 0); } catch (e) { return 'err ' + e.message; } return G3.log.filter(x => x.kind === 'post').map(x => x.B); };
    const before = run();
    clipLength(st, 0, -1);                                                                  // Länge −1
    const after = run();
    // K-02: linkes Reststück eines Punch: out endet mit dem Stück
    const o = {id: 'V1', bar: 0, len: 8, take: a.take, in: 1, out: tkR6(1 + 32 * sp), at: 0, gain: 1, fadeIn: .005, fadeOut: .005, alt: [{take: a.take, in: .5, out: tkR6(.5 + 32 * sp), at: 0}]};
    const tr = tkVoxTrim(o, 0, 3, sp), lim = 1 + 12 * sp;
    const seg = Object.assign({}, tr), full = g3VoxSeg(seg, sp, 0);
    return {before, after, trOut: tr.out, lim, altOut: tr.alt[0].out, altLim: .5 + 12 * sp, post: (full.g3pb || 0)};
  }, r).then(async x => { await H.close(); return Object.assign(x, {errs: H.errs}); });
}
{
  const n = await k1(FILE);
  ok('K-01 vor dem Kürzen: Ausklang am Clip-Ende (G3-Log „post“)', n.before.length === 1, JSON.stringify(n.before));
  ok('K-01 Länge −1: kein Ausklang am Ende (G3-Log leer)', Array.isArray(n.after) && n.after.length === 0, JSON.stringify(n.after));
  ok('K-02 Punch: linkes Reststück endet mit dem Stück (out ≤ in + (len·4 − at)·spb), auch in alt', n.trOut <= n.lim + 1e-6 && n.altOut <= n.altLim + 1e-6, JSON.stringify(n));
  if (PREV) { const o = await k1(PREV); console.log('INFO 4.25.1 (vorher): Ausklang nach Länge −1 ' + JSON.stringify(o.after) + ', Reststück out ' + o.trOut.toFixed(3) + ' > ' + o.lim.toFixed(3)); }
  ok('K-01/02 Konsole', !n.errs.length, n.errs.join('|').slice(0, 200));
}
// K-02/K-03 im echten Ablauf: Song-Stimme Takt 1–8, Punch „Überschreiben“ ab Takt 3 → kein Überlappen; Undo + Laden deep-equal
{
  const H = await open(FILE), p = H.p; await g10demo(p, {song: true}); await sleep(1200);
  const r = await inject(p, {pcm: pcm(17.5), scene: 0, len: 8});
  const st = await p.evaluate(r => { const sp = spb(), a = S.tracks[r.track].clips[0].audio, s = SYNQUENZER.song(); delete s.melody;
    s.vox = [{id: 'V1', bar: 0, len: 8, take: a.take, in: 0, out: tkR6(16 + .5), at: 0, gain: 1, fadeIn: .005, fadeOut: .005}]; S.takes[a.take].post = {out: tkR6(16.5), sec: .3}; SYNQUENZER.setSong(s);
    const before = JSON.stringify(SYNQUENZER.song().vox), u0 = UNDO.length;
    // Punch: Überschreiben ab Takt 3 – der Song-Weg kürzt das alte Stück mit tkVoxTrim (wie tkSongCommit)
    const v = S.song.vox[0], left = tkVoxTrim(v, 0, 2, sp);
    return {before, left, lim: left.in + (left.len * 4 - left.at) * sp, u0};
  }, r);
  ok('K-02 Reststück Takt 1–2 einer Stimme mit Ausklang überlappt nicht in Takt 3', st.left.out <= st.lim + 1e-6 && st.left.len === 2, JSON.stringify({out: st.left.out, lim: st.lim}));
  await p.evaluate(() => SYNQUENZER.save()); await sleep(800); await p.evaluate(() => SYNQUENZER.load()); await sleep(1200);   // Testdaten (von Hand gesetzt) einmal normalisieren
  await p.evaluate(() => { clipLength(SYNQUENZER.tkInfo().stimme, 0, -1); });
  const u = await p.evaluate(() => { const c1 = JSON.stringify(cleanClip(S.tracks[SYNQUENZER.tkInfo().stimme].clips[0])); undo(); const c0 = JSON.stringify(cleanClip(S.tracks[SYNQUENZER.tkInfo().stimme].clips[0])); redo(); return {c0, c1, c2: JSON.stringify(cleanClip(S.tracks[SYNQUENZER.tkInfo().stimme].clips[0]))}; });
  const pj = await p.evaluate(() => JSON.stringify(SYNQUENZER.state().project)); await p.evaluate(() => SYNQUENZER.save()); await sleep(800); await p.evaluate(() => SYNQUENZER.load()); await sleep(1200);
  const pj2 = await p.evaluate(() => JSON.stringify(SYNQUENZER.state().project));
  ok('K-03 Undo/Redo der Längenänderung und Speichern → Laden deep-equal', u.c0 !== u.c1 && u.c2 === u.c1 && pj2 === pj);
  await H.close();
}
// ---------- K2 Marken-Editor
async function cdpSwipe(p, cdp, x0, y0, dx, steps = 6) {
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: x0, y: y0, id: 1}]});
  for (let k = 1; k <= steps; k++) await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: x0 + dx * k / steps, y: y0, id: 1}]});
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
}
async function k2(file, n) {
  const H = await open(file, {viewport: {width: 390, height: 844}, touch: true, mobile: true}), p = H.p; await g10demo(p);
  const r = await inject(p, {pcm: pcm(4.2), scene: 0, len: 2});
  await p.evaluate(async r => { await SYNQUENZER.wpDetect({t: r.track, s: 0}); SYNQUENZER.wpOpen({t: r.track, s: 0}); }, r); await sleep(800);
  const cdp = await p.context().newCDPSession(p);
  const mk = () => p.evaluate(() => JSON.stringify((wpMarks(WP.ed.id) || []).map(k => k.t)));
  const g0 = await p.evaluate(() => SYNQUENZER.wpGeom()), m0 = await mk(), u0 = await p.evaluate(() => UNDO.length), v0 = g0.view.a;
  let panned = 0;
  // K-04: n Wisch-Gesten auf der Welle (unterhalb des Griff-Streifens), jeweils an einer Marke begonnen
  for (let k = 0; k < n; k++) {
    const g = await p.evaluate(() => SYNQUENZER.wpGeom()); const xs = g.marks.filter(x => x > g.x + 20 && x < g.x + g.w - 80);
    const x0 = xs.length ? xs[k % xs.length] : g.x + g.w / 2, y0 = g.y + 50 + (k % 5) * Math.max(1, (g.h - 60) / 5), dx = (k % 2 ? -1 : 1) * (20 + (k % 7) * 8);
    await cdpSwipe(p, cdp, x0, y0, dx, 4);
    const va = await p.evaluate(() => WP.ed.va); if (Math.abs(va - v0) > 1e-6) panned++;
    await p.evaluate(v => { WP.ed.va = v; wpPaint(); }, v0);   // Ansicht zurück, damit die Marken im Bild bleiben
  }
  const m1 = await mk(), u1 = await p.evaluate(() => UNDO.length);
  // K-05: Zug im Streifen + zweiter Finger → verworfen
  const g = await p.evaluate(() => SYNQUENZER.wpGeom()); const xm = g.marks.find(x => x > g.x + 40 && x < g.x + g.w - 80);
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: xm, y: g.y + 10, id: 1}]});
  for (let k = 1; k <= 4; k++) await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: xm + 8 * k, y: g.y + 10, id: 1}]});
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: xm + 32, y: g.y + 10, id: 1}, {x: xm - 60, y: g.y + 60, id: 2}]});
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: xm + 50, y: g.y + 10, id: 1}, {x: xm - 40, y: g.y + 60, id: 2}]});
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
  await sleep(200); await p.evaluate(v => { WP.ed.va = v; wpPaint(); }, v0);
  const m2 = await mk(), u2 = await p.evaluate(() => UNDO.length);
  // K-06: Zug im Streifen → Marke bewegt, genau 1 Undo
  await cdpSwipe(p, cdp, xm, g.y + 12, 30, 6); await sleep(300);
  const m3 = await mk(), u3 = await p.evaluate(() => UNDO.length);
  // Tipp zwischen zwei nahen Marken (9 px auseinander): wie bisher das Blatt der nächsten Marke, keine neue Marke
  const g2 = await p.evaluate(() => SYNQUENZER.wpGeom()); const i2 = g2.marks.findIndex((x, i) => i + 1 < g2.marks.length && g2.marks[i + 1] - x < 12 && x > g2.x + 30);
  const n0 = await p.evaluate(() => (wpMarks(WP.ed.id) || []).length);
  await p.evaluate(() => { WP.ed.sel = -1; });
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: g2.marks[i2] + 4, y: g2.y + 60, id: 1}]}); await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await sleep(300);
  const tap = await p.evaluate(() => ({n: (wpMarks(WP.ed.id) || []).length, sel: WP.ed.sel}));
  const errs = H.errs.slice(); await H.close();
  return {n, m0, m1, m2, m3, u0, u1, u2, u3, panned, errs, tap, n0};
}
{
  const r = await k2(FILE, 500);
  ok('K-04 500 Wisch-Gesten auf der Welle: 0 Marken bewegt, Ansicht verschoben', r.m1 === r.m0 && r.u1 === r.u0 && r.panned === r.n, JSON.stringify({bewegt: r.m1 !== r.m0, undo: r.u1 - r.u0, geschwenkt: r.panned}));
  ok('K-05 zweiter Finger während eines Zugs: 0 Marken bewegt, 0 Undo', r.m2 === r.m0 && r.u2 === r.u0, JSON.stringify({bewegt: r.m2 !== r.m0, undo: r.u2 - r.u0}));
  ok('K-06 im Streifen ziehen: Marke bewegt, genau 1 Undo', r.m3 !== r.m0 && r.u3 === r.u0 + 1, JSON.stringify({undo: r.u3 - r.u0}));
  ok('K-06 Tipp zwischen zwei nahen Marken: Blatt der nächsten Marke, keine neue Marke (wie bisher)', r.tap.n === r.n0 && r.tap.sel >= 0, JSON.stringify(r.tap));
  ok('K-04…06 Konsole', !r.errs.length, r.errs.join('|').slice(0, 200));
  if (PREV) { const o = await k2(PREV, 40); console.log('INFO 4.25.1 (vorher), 40 Wische auf der Welle: Marken bewegt ' + (o.m1 !== o.m0) + ', Undo-Schritte ' + (o.u1 - o.u0)); }
}
// ---------- K3 Clip-Blatt
{
  const H = await open(FILE), p = H.p; await g10demo(p);
  const a = await p.evaluate(() => { SYNQUENZER.setClip(3, 0, {len: 32, notes: [{t: 0, d: 1, n: 60, v: .8}]}); openClipSheet(3, 0); const b = [...document.querySelectorAll('#clipSheet button')].find(x => x.title === 'Ein Takt mehr'); const dis = b.disabled; b.click(); return {dis, len: S.tracks[3].clips[0].len}; });
  ok('K-07 32-Takt-Clip +1 → 33', !a.dis && a.len === 33, JSON.stringify(a));
  const r = await inject(p, {pcm: pcm(4.2), scene: 1, len: 2});
  await inject(p, {pcm: pcm(4.2), scene: 1, len: 2});
  const b = await p.evaluate(r => { closeClipSheet(); openClipSheet(r.track, 1); const sub = document.querySelector('#clipSheet .csub').textContent, x2 = [...document.querySelectorAll('#clipSheet button')].find(x => x.textContent === '×2'), q = [...document.querySelectorAll('#clipSheet button')].find(x => x.textContent === 'Quantisieren…'); window.__toasts.length = 0; q.click(); return {sub, x2: x2 && x2.title, wp: !!WP.ed, sheet: document.getElementById('wpSheet').classList.contains('open'), t: window.__toasts.slice()}; }, r);
  ok('K-08 STIMME: Quantisieren… öffnet den Marken-Editor', b.wp && !b.t.some(x => /Keine Noten/.test(x)), JSON.stringify(b));
  ok('K-03/K3 Untertitel „2 Takte · Gesang · 2 Takes“, ×2 = „Doppelte Länge (Gesang einmal, danach Stille)“', /2 Takte · Gesang · 2 Takes/.test(b.sub) && b.x2 === 'Doppelte Länge (Gesang einmal, danach Stille)', JSON.stringify(b));
  await p.evaluate(() => SYNQUENZER.wpClose());
  const bad = [];
  for (const [f, [w, h]] of Object.entries(FMT)) {
    await p.setViewportSize({width: w, height: h}); await sleep(250);
    await p.evaluate(r => openClipSheet(r.track, 1), r); await sleep(250);
    const x = await p.evaluate(() => { const e = document.querySelector('#clipSheet .sh-title'), s = document.querySelector('#clipSheet .csub'), rs = s.getBoundingClientRect(); return {clip: e.scrollWidth > e.clientWidth + 1, vis: getComputedStyle(s).display !== 'none' && rs.width > 0, right: rs.right <= innerWidth + .5, txt: s.textContent}; });
    if (x.clip || !x.right) bad.push(f + ' ' + JSON.stringify(x));
    if (f === 'P1') { const sz = await platz(p, '#clipSheet .cgrid button'); if (sz.length) console.log('INFO Clip-Blatt (unverändert seit 4.25.0) ' + f + ': ' + sz.join(', ')); }
    await p.evaluate(() => closeClipSheet());
  }
  ok('K-09 M-PLATZ: Clip-Blatt STIMME, neuer Untertitel in 6 Formaten im Bild, nicht abgeschnitten', !bad.length, bad.join(' | ').slice(0, 400));
  ok('K3 Konsole', !H.errs.length, H.errs.join('|').slice(0, 200));
  await H.close();
}
// ---------- K4 feste Take-Nummern
{
  const H = await open(FILE), p = H.p; await g10demo(p);
  let tr = 0; for (let k = 0; k < 7; k++) { tr = (await inject(p, {pcm: pcm(1 + k * .05), scene: 2, len: 1})).track; await sleep(15); }
  const lab = () => p.evaluate(tr => { SYNQUENZER.tkSheet({t: tr, s: 2}); const L = [...document.querySelectorAll('.tk-pick b')].map(b => b.textContent.replace(/^[●○] /, '')); const d = S.tracks[tr].clips[2].audio; const segs = tkSegs(d).map(s => s.take); closePop(); return {L, segs}; }, tr);
  const a = await lab();
  // Take-id → Nummer
  const num = x => { const m = {}; x.segs.forEach((id, k) => { m[id] = x.L[k]; }); return m; };
  const n0 = num(a);
  const k3 = a.L.indexOf('Take 3');
  await p.evaluate(([tr, k]) => SYNQUENZER.tkPick({t: tr, s: 2}, k), [tr, k3]);
  const b = await lab(), n1 = num(b);
  ok('K-10 Take 3 nach oben geholt: heißt weiter „Take 3“, alle behalten ihre Nummer', b.L[0] === 'Take 3' && Object.keys(n0).every(id => n0[id] === n1[id]), JSON.stringify({vorher: a.L, nachher: b.L}));
  await p.evaluate(tr => SYNQUENZER.tkPick({t: tr, s: 2}, 0, true), tr);
  const c = await lab(), n2 = num(c);
  const exp = {}; for (const id in n0) { const k = +n0[id].slice(5); if (k === 3) continue; exp[id] = 'Take ' + (k > 3 ? k - 1 : k); }
  ok('K-10 Take 3 gelöscht: Take 1, 2 bleiben, 4…7 heißen 3…6', c.L.length === 6 && Object.keys(exp).every(id => n2[id] === exp[id]), JSON.stringify(c.L));
  ok('K4 Konsole', !H.errs.length, H.errs.join('|').slice(0, 200));
  await H.close();
}
await closeAll(); process.exit(ok.sum() ? 1 : 0);
