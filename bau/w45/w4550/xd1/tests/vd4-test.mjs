// VD4: Regie-Vorschau live beim Komponieren – Bild-im-Bild über Matrix/Song (Regie ⇄ App, Tippen = VD3-Menü, Ziehen/Andocken,
// ✕, Video-Blatt › Extras, Guide), live = Video-Render (Ansichts-Kennung an 3 Stellen), aus = 0 Bilder, CPU an/aus, hochkant + quer.
// Aufruf: node vd4-test.mjs <index.html> <ordner>   (der Grundstand basis.html liegt eine Ebene über index.html)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs'; import path from 'path';
const APP = path.resolve(process.argv[2]), OUT = path.resolve(process.argv[3] || path.dirname(APP)), BASE = path.resolve(path.dirname(APP), '../basis.html');
fs.mkdirSync(OUT, {recursive: true});
const R = []; const ok = (id, c, txt, info) => { R.push([id, !!c]); console.log((c ? 'OK ' : 'FEHLER ') + id + ' ' + txt + (info != null ? ' — ' + JSON.stringify(info).slice(0, 700) : '')); };
const errs = [];
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
async function open(file, w, h, ctx) {
  const c = ctx || await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  const p = await c.newPage(); p.setViewportSize({width: w, height: h});
  p.on('pageerror', e => errs.push('PAGEERR ' + e)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1400);
  await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading', null, {timeout: 15000}).catch(() => {});
  return p;
}
// der Song: Intro (Bass, Drums, ab Takt 3 Fläche) · Strophe (Gegenmelodie) · Refrain; Takt 9–10 „Klavier“ (deine Wahl in der Video-Spur)
const SONG = (klav) => {
  const A = SYNQUENZER; A.setMetronome && A.setMetronome(false);
  const syn = (n0, pat) => ({len: 1, notes: pat.map(([t, d, n, v]) => ({t, d, n: n0 + n, v}))});
  A.setClip(0, 0, syn(36, [[0, .5, 0, .9], [1, .5, 0, .6], [2, .5, 7, .8], [3, .5, 5, .5]]));
  A.setClip(1, 0, syn(72, [[0, 1.5, 0, .5], [1.5, .5, 2, .7], [2, 1, 4, .95], [3, 1, 7, .4]]));
  A.setClip(2, 0, syn(60, [[0, 4, 0, .6], [0, 4, 4, .55], [0, 4, 7, .5]]));
  A.setClip(DRUM_T, 0, {len: 1, notes: [[0, 36, .95], [1, 38, .8], [2, 36, .9], [3, 38, .85], [0, 42, .5], [.5, 42, .4], [1, 42, .5], [1.5, 42, .4]].map(([t, n, v]) => ({t, d: .25, n, v}))});
  const nt = NT(), lanes = Array.from({length: nt}, () => []);
  lanes[0] = [{bar: 0, slot: 0}]; lanes[1] = [{bar: 4, slot: 0}]; lanes[2] = [{bar: 2, slot: 0}]; lanes[DRUM_T] = [{bar: 0, slot: 0}];
  A.setSong({bars: 12, lanes, carrier: [], marks: [{id: 'm1', a: 0, len: 4, name: 'Intro'}, {id: 'm2', a: 4, len: 4, name: 'Strophe'}, {id: 'm3', a: 8, len: 4, name: 'Refrain'}]});
  if (klav) SYNQUENZER.vd3.set(8, 10, 'klav');
  return {bars: S.song.bars, bpm: S.bpm};
};
const tapEl = async (p, sel) => { const r = await p.evaluate(sel => { const e = typeof sel === 'string' ? document.querySelector(sel) : null; if (!e) return null; const q = e.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; }, sel); if (r) await p.touchscreen.tap(r[0], r[1]); await p.waitForTimeout(250); return !!r; };
const info = p => p.evaluate(() => SYNQUENZER.vd4.info());
const settle = (p, ms) => p.waitForTimeout(ms || 450);
// the important elements (must stay free) and whether the window touches one
const FREE = (p) => p.evaluate(() => {
  const w = document.querySelector('.vd4w'); if (!w) return null; const r = w.getBoundingClientRect(), ga = EL.gridArea.getBoundingClientRect();
  const sel = UI.songView ? ['#top', '#side', '#strip', '#carrier', '#modebar', '#kbArea'] : ['#top', '#side', '#strip', '#carrier', '#modebar', '#kbArea', '#partBar', '#clipGrid .th', '#clipGrid .stp', '#clipGrid .scn', '#clipGrid .corner', '#clipGrid .szb'];
  const els = []; for (const s of sel) for (const e of document.querySelectorAll(s)) if (e.getClientRects().length) els.push([s, e.getBoundingClientRect()]);
  if (UI.songView) { if (SV.labs) els.push(['Spaltennamen', SV.labs.getBoundingClientRect()]); for (const k of Object.keys(SV.btn || {})) { const e = SV.btn[k]; if (e && e.getClientRects && e.getClientRects().length) els.push(['Song-Taste ' + k, e.getBoundingClientRect()]); }
    const wr = SV.wrap.getBoundingClientRect(); els.push(['Taktleiste', {left: wr.left, right: wr.right, top: wr.top, bottom: wr.top + SV.rulerH}]); }
  const hit = els.filter(([, q]) => q.width !== 0 && r.left < q.right - .5 && r.right > q.left + .5 && r.top < q.bottom - .5 && r.bottom > q.top + .5).map(([s]) => s);
  const inGa = r.left >= ga.left - .5 && r.right <= ga.right + .5 && r.top >= ga.top - .5 && r.bottom <= ga.bottom + .5;
  const k = s => { const e = w.querySelector(s); const q = e.getBoundingClientRect(); return {w: Math.round(q.width), h: Math.round(q.height), inView: q.left >= 0 && q.top >= 0 && q.right <= innerWidth && q.bottom <= innerHeight}; };
  return {rect: {x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height)}, hit, inGa, x: k('.vd4x'), m: k('.vd4m'), n: els.length};
});
const RECTS = p => p.evaluate(() => ['#top', '#clipGrid', '#songView', '#partBar', '#strip', '#carrier', '#modebar', '#kbArea', '#side'].map(s => { const e = document.querySelector(s); if (!e || !e.getClientRects().length) return [s, null]; const q = e.getBoundingClientRect(); return [s, [q.x, q.y, q.width, q.height].map(v => Math.round(v * 10) / 10)]; }));
const cdpOf = async p => p.context().newCDPSession(p);
const taskMs = async cdp => { const m = await cdp.send('Performance.getMetrics'); const g = n => (m.metrics.find(x => x.name === n) || {}).value || 0; return {task: g('TaskDuration') * 1000, script: g('ScriptDuration') * 1000, layout: g('LayoutDuration') * 1000}; };

/* ======================= 1. Grundstand: aus = kein Fenster, kein Bild; nichts anders als 4.48.1 ======================= */
let p = await open(APP, 428, 926);
await p.evaluate(SONG, false); await settle(p, 600);
const shotV = await p.screenshot(); const rectsV = await RECTS(p);
await p.evaluate(() => setSongView(true)); await settle(p, 600); const shotVs = await p.locator('#gridArea').screenshot();
await p.evaluate(() => setSongView(false)); await settle(p, 400);
const a0 = await p.evaluate(() => ({pref: uiPrefs().vd4on, el: !!document.querySelector('.vd4w'), css: !!document.getElementById('vd4css'), on: SYNQUENZER.vd4.on()}));
await p.mouse.click(5, 300).catch(() => {});
await p.evaluate(() => { SYNQUENZER.vd4.reset(); songPlayStart(0); }); await p.waitForTimeout(2500);
const a1 = await p.evaluate(() => ({frames: SYNQUENZER.vd4.info().frames, playing: R.playing, el: !!document.querySelector('.vd4w')}));
await p.evaluate(() => songPlayEnd(true)); await settle(p, 600);
ok('VD4-01', !a0.pref && !a0.el && !a0.css && !a0.on && a1.playing && a1.frames === 0 && !a1.el, 'Aus (Grundstand): kein Fenster, kein Stil, beim Abspielen 0 Bilder (uiFrame prüft nur VD4.on)', {a0, a1});
await p.close();
let pb = await open(BASE, 428, 926); await pb.evaluate(SONG, false); await settle(pb, 600);
const shotB = await pb.screenshot(); const rectsB = await RECTS(pb);
await pb.evaluate(() => setSongView(true)); await settle(pb, 600); const shotBs = await pb.locator('#gridArea').screenshot();
await pb.close();
if (!shotB.equals(shotV)) { fs.writeFileSync(OUT + '/dbg-aus-matrix.png', shotV); fs.writeFileSync(OUT + '/dbg-basis-matrix.png', shotB); }
ok('VD4-02', shotB.equals(shotV) && shotBs.equals(shotVs) && JSON.stringify(rectsB) === JSON.stringify(rectsV), 'Aus = wie 4.48.1: Matrix-Bild pixelgleich, Song-Fläche pixelgleich, alle Flächen an derselben Stelle', {matrix: shotB.equals(shotV), song: shotBs.equals(shotVs), rects: JSON.stringify(rectsB) === JSON.stringify(rectsV)});

/* ======================= 2. Video-Blatt › Extras „Live-Vorschau“, Guide ======================= */
const sheetM = async (p) => p.evaluate(() => { const r = e => { if (!e) return null; const q = e.getBoundingClientRect(); return [q.x, q.y, q.width, q.height].map(Math.round); };
  return {btns: [...document.querySelectorAll('.vd3-box .rb')].filter(b => !b.classList.contains('vd4-lv')).map(r), acts: r(document.querySelector('.vvacts')), ctl: (() => { const c = document.querySelector('.vvctl'); return [c.scrollHeight, c.clientHeight]; })(),
    lv: (() => { const b = document.querySelector('.vd4-lv'); return b ? {r: r(b), txt: b.textContent, inBox: !!b.closest('.vd3-box'), inRow: !!b.closest('.vd4-vr'), pressed: b.getAttribute('aria-pressed')} : null; })(), stage: r(document.querySelector('.vvstage'))}; });
const sheetRes = {};
for (const [w, h] of [[428, 926], [926, 428], [926, 370]]) {
  const pa = await open(APP, w, h), pz = await open(BASE, w, h);
  for (const q of [pa, pz]) { await q.evaluate(SONG, false); await q.evaluate(() => vvOpen()); await settle(q, 700); }
  const A = await sheetM(pa), Z = await sheetM(pz); sheetRes[w + 'x' + h] = {A, Z};
  if (w === 428) await pa.screenshot({path: OUT + '/vd4-videoblatt-hochkant.png'}); else if (h === 370) await pa.screenshot({path: OUT + '/vd4-videoblatt-quer370.png'});
  await pa.close(); await pz.close();
}
{ const P = sheetRes['428x926'], L = sheetRes['926x428'], L3 = sheetRes['926x370'];
  ok('VD4-03', P.A.lv && P.A.lv.inBox && P.A.lv.r[3] >= 44 && /Live-Vorschau beim Komponieren/.test(P.A.lv.txt) && /aus$/.test(P.A.lv.txt) && JSON.stringify(P.A.btns.map(x => [x[0], x[2], x[3]])) === JSON.stringify(P.Z.btns.map(x => [x[0], x[2], x[3]])) && JSON.stringify(P.A.acts) === JSON.stringify(P.Z.acts),
    'Video-Blatt hochkant: Extras hat die Zeile „Live-Vorschau beim Komponieren · aus“ (44 px) unter Titel/Rand/Making-of/Schnitt; diese Tasten und [Vorschau]/[Video erstellen] bleiben, wo sie waren (die Bühne gibt 48 px ab)', {lv: P.A.lv, acts: [P.A.acts, P.Z.acts], stage: [P.A.stage, P.Z.stage]});
  // XD1-Anpassung (XD1 Punkt 2, bewusst geändert): quer liegt die Taste wie hochkant im Extras-Kasten der rechten Spalte – keine Zeile mehr unter der
  // Bühne; die Bühne ist darum wieder so groß wie ohne VD4 (Basis), die rechte Spalte rollt dafür (wie quer 370 schon vorher)
  const lvOk = X => X.A.lv && X.A.lv.inBox && !X.A.lv.inRow && X.A.lv.r[3] >= 44 && X.A.lv.r[1] >= Math.max(...X.A.btns.map(b => b[1] + b[3])) && /Live-Vorschau beim Komponieren/.test(X.A.lv.txt) && JSON.stringify(X.A.stage) === JSON.stringify(X.Z.stage) && X.A.acts && X.A.acts[1] < X.A.stage[1] + 400;
  ok('VD4-04', lvOk(L) && lvOk(L3),
    'Video-Blatt quer (926×428 und 926×370, XD1): die Live-Vorschau liegt im Extras-Kasten der rechten Spalte unter Titel/Rand/Making-of/Schnitt (wie hochkant); die Bühne ist so groß wie ohne VD4', {lv428: L.A.lv, lv370: L3.A.lv, ctl: [L.A.ctl, L.Z.ctl, L3.A.ctl, L3.Z.ctl], stage: [L.A.stage, L.Z.stage, L3.A.stage, L3.Z.stage], acts: [L.A.acts, L3.A.acts]}); }

const ctxP = await b.newContext({viewport: {width: 428, height: 926}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
p = await open(APP, 428, 926, ctxP);
await p.evaluate(SONG, true); await settle(p, 400);
const g1 = await p.evaluate(() => ({s: SYNQUENZER.ui1 ? null : null, hits: ui1Search('live vorschau').map(E => E.id).slice(0, 3), hits2: ui1Search('was wird gefilmt').map(E => E.id).slice(0, 3)}));
await p.evaluate(() => ui1Jump('vd4live')); await p.waitForTimeout(1300);
const g2 = await p.evaluate(() => ({jump: UI1.lastJump, open: VV.open, lv: !!document.querySelector('.vd4-lv')}));
ok('VD4-05', g1.hits[0] === 'vd4live' && g2.jump && g2.jump.ok && g2.jump.target && g2.open && /Live-Vorschau/.test(g2.jump.txt || ''), 'Guide: „live vorschau“ findet „Live-Vorschau der Video-Regie“; der Sprung öffnet das Video-Blatt und zeigt die Taste', {g1, g2});
// an per Finger im Blatt
await tapEl(p, '.vd4-lv'); await settle(p, 300);
const g3 = await p.evaluate(() => ({on: SYNQUENZER.vd4.on(), pref: uiPrefs().vd4on, txt: document.querySelector('.vd4-lv').textContent, pressed: document.querySelector('.vd4-lv').getAttribute('aria-pressed'), frames: SYNQUENZER.vd4.info().frames, vis: SYNQUENZER.vd4.info().vis}));
await p.evaluate(() => { if (UI1.ring) ui1RingOff(); }); await settle(p, 300);
await p.screenshot({path: OUT + '/vd4-videoblatt-an-hochkant.png'});
const before = await RECTS(p);
await tapEl(p, '#vvSheet .sh-x'); await settle(p, 700);
const g4 = await info(p), after = await RECTS(p);
ok('VD4-06', g3.on && g3.pref === true && /an$/.test(g3.txt) && g3.pressed === 'true' && g3.frames === 0 && !g4.vis === false && g4.frames >= 1 && g4.el, 'Tipp auf die Zeile = an (Gerät merkt es); unter dem Blatt kein Bild, nach ✕ des Blatts zeigt sich das Fenster und zeichnet', {g3, g4: {frames: g4.frames, vis: g4.vis, cap: g4.cap}});

/* ======================= 3. Das Fenster hochkant: Größe, Platz, nichts verdeckt, nichts verschoben ======================= */
const f1 = await FREE(p), r1 = await RECTS(p);
ok('VD4-07', f1 && f1.rect.w === 110 && f1.rect.h === 196 && g4.px[0] <= 220 && g4.px[1] <= 392 && f1.inGa && f1.hit.length === 0 && g4.corner === 'br',
  'Hochkant (Matrix): 110 × 196 pt (Leinwand ≤ 2×), unten rechts in der Clip-Fläche angedockt – Kopf, Spurköpfe, Stopp-Spalte, Szenen-Kopf, Teil-Leiste, Spur-Zeile, Träger, Modusleiste, Tastatur frei', {f1, px: g4.px, corner: g4.corner});
ok('VD4-08', f1.x.w >= 44 && f1.x.h >= 44 && f1.x.inView && f1.m.w >= 44 && f1.m.h >= 44 && f1.m.inView && JSON.stringify(after) === JSON.stringify(before) && JSON.stringify(r1) === JSON.stringify(rectsV),
  '✕ und [Regie ⇄] je ≥ 44 × 44 und sichtbar; das Fenster verschiebt nichts (alle Flächen wie ohne Fenster)', {x: f1.x, m: f1.m});
await p.screenshot({path: OUT + '/vd4-hochkant-matrix.png'});
await p.evaluate(() => setSongView(true)); await settle(p, 700);
const f2 = await FREE(p);
ok('VD4-09', f2 && f2.inGa && f2.hit.length === 0 && f2.rect.w === 110, 'Hochkant (Song): unten rechts auf der Zeitleiste – Song-Tasten, Taktleiste und Spaltennamen frei', f2);
await p.screenshot({path: OUT + '/vd4-hochkant-song.png'});
// Video-Spur (VD3) an: die Taktleiste wird höher – das Fenster bleibt darunter
await p.evaluate(() => SYNQUENZER.vd3.cut(true)); await settle(p, 700);
const f2b = await FREE(p); await p.evaluate(() => SYNQUENZER.vd3.cut(false)); await settle(p, 500);
ok('VD4-10', f2b && f2b.hit.length === 0, 'Mit Video-Spur (Schnitt-Modus) bleibt die Spur frei', f2b);

/* ======================= 4. Live = Video-Render (Ansichts-Kennung an 3 Stellen) ======================= */
// Messfühler um vvDrawRun (den Zeichner, den Video und Fenster teilen): welches Bild (rt.cur) bei welchem Song-Schlag
await p.evaluate(() => { const o = window.vvDrawRun; window.__vd4o = o; window.__L = {job: [], pip: []};
  window.vvDrawRun = function (g, W, H, view, st, rt) { const r = o.apply(this, arguments); const c = rt && rt.cur; const e = {sb: st.sb, v: c ? c.v : view, t: c && c.t != null ? c.t : null, k: c ? c.k : -1};
    if (rt && rt === VV.lastRt && VV.busy) __L.job.push(e); else if (rt && VD4.rt && rt === VD4.rt) __L.pip.push(e); return r; }; });
const vm = await p.evaluate(async () => { SYNQUENZER.vvTest({size: [216, 384]}); const T0 = performance.now(); try { const r = await SYNQUENZER.vvMake({fmt: '9:16', view: 'auto', range: {a: 0, b: 12}}); return {ok: true, how: r.how, dur: r.dur, ms: Math.round(performance.now() - T0), cuts: r.cuts, n: __L.job.length}; } catch (e) { return {ok: false, err: String(e && e.message || e), n: __L.job.length}; } finally { SYNQUENZER.vvTest({}); } });
const jobShots = await p.evaluate(() => (VV.lastRt ? VV.lastRt.shots.map(s => [s.a, s.b, s.v, s.t]) : null));
// live: die drei Stellen nacheinander ab ihrem Takt abspielen (Song-Ansicht, Fenster an, Regie)
await p.evaluate(() => { setSongView(true); SYNQUENZER.vd4.mode('regie'); }); await settle(p, 400);
const PL = [{bar: 0, why: 'Teil-Anfang (App)'}, {bar: 4, why: 'neuer Clip (Noten · SYN 2)'}, {bar: 8, why: 'deine Wahl (Klavier)'}];
const places = [];
for (const P of PL) {
  await p.evaluate(b => { __L.pip.length = 0; SYNQUENZER.vd4.reset(); songPlayStart(b); }, P.bar);
  await p.waitForTimeout(3600);
  const pip = await p.evaluate(() => __L.pip.slice());
  const pic = await p.evaluate(() => SYNQUENZER.vd4.png()), cur = (await info(p)).cur;
  await p.evaluate(() => songPlayEnd(true)); await settle(p, 300);
  fs.writeFileSync(`${OUT}/vd4-live-takt${P.bar + 1}-fenster.png`, Buffer.from(pic, 'base64'));
  // the render's picture at the same song beat (video frame of the job)
  const sbx = cur && cur.sb != null ? cur.sb : P.bar * 4 + 2;
  const vf = await p.evaluate(sb => { const r = VV.last; if (!r) return null; const t = (r.lead || 0) + (sb - barBeat(r.a)) * 60 / r.bpm; return SYNQUENZER.vvShot(t, 'auto', '9:16', 'app'); }, sbx);
  if (vf) fs.writeFileSync(`${OUT}/vd4-live-takt${P.bar + 1}-video.png`, Buffer.from(vf, 'base64'));
  // compare inside the shot (after the cut blend): every live frame with the render frame of the same beat (± 1 Bild)
  const shot = jobShots.find(s => P.bar >= s[0] && P.bar < s[1]);
  const job = await p.evaluate(() => __L.job.map(e => [e.sb, e.v, e.t, e.k]));
  const cmp = pip.filter(e => e.sb != null && e.sb >= shot[0] * 4 + 3 && e.sb < shot[1] * 4 - .1).map(e => {
    let best = null, bd = 1e9; for (const j of job) { const d = Math.abs(j[0] - e.sb); if (d < bd) { bd = d; best = j; } }
    return {sb: +e.sb.toFixed(2), pip: [e.v, e.t, e.k], job: best ? [best[1], best[2], best[3]] : null, d: +bd.toFixed(3)}; });
  const same = cmp.length >= 5 && cmp.every(c => c.job && c.d < .12 && c.pip[0] === c.job[0] && c.pip[1] === c.job[1] && c.pip[2] === c.job[2]);
  places.push({bar: P.bar, why: P.why, shot, n: cmp.length, same, first: cmp[0], last: cmp[cmp.length - 1], cap: (await info(p)).cap});
}
await p.evaluate(() => { window.vvDrawRun = window.__vd4o; });
ok('VD4-11', vm.ok && vm.n > 100 && places.every(x => x.same) && new Set(places.map(x => x.first && x.first.pip[0] + '|' + x.first.pip[1])).size === 3,
  'Live = Video: an 3 Stellen (Teil-Anfang, neuer Clip, deine Wahl „Klavier“) zeigt das Fenster beim Abspielen Bild für Bild dieselbe Ansicht (Ansicht, Spur, Schnitt-Nr.) wie der echte Video-Render an demselben Song-Schlag', {render: vm, places});

/* ======================= 5. Regie ⇄ App ======================= */
await p.evaluate(() => { SV.pos = 8; UI.dirty.song = true; }); await settle(p, 600);
const m0 = await info(p), h0 = await p.evaluate(() => SYNQUENZER.vd4.hash());
await tapEl(p, '.vd4w .vd4m'); await settle(p, 500);
const m1 = await info(p), h1 = await p.evaluate(() => SYNQUENZER.vd4.hash()), pm = await p.evaluate(() => uiPrefs().vd4m);
await p.screenshot({path: OUT + '/vd4-hochkant-app.png'});
await tapEl(p, '.vd4w .vd4m'); await settle(p, 500);
const m2 = await info(p), h2 = await p.evaluate(() => SYNQUENZER.vd4.hash());
ok('VD4-12', m0.m === 'regie' && m0.cur.v === 'klav' && m1.m === 'app' && pm === 'app' && /App-Bild/.test(m1.cap) && h1 !== h0 && m2.m === 'regie' && h2 === h0 && /Klavier/.test(m2.cap),
  'Umschalter im Fenster (Finger): Regie (hier Klavier) ⇄ App-Bild der Original-App und zurück – gleiches Bild wie vorher, Wahl gemerkt', {m0: m0.cap, m1: m1.cap, m2: m2.cap, h: [h0, h1, h2]});
// App läuft live mit der Matrix (Szene spielt, kein Song); Regie bleibt dabei ein Standbild der Song-Stelle
await p.evaluate(() => setSongView(false)); await settle(p, 400);
await p.evaluate(() => { SYNQUENZER.vd4.mode('app'); SYNQUENZER.vd4.reset(); launchScene(0); }); await p.waitForTimeout(2000);
const ma = await info(p);
await p.evaluate(() => { SYNQUENZER.vd4.mode('regie'); }); await p.waitForTimeout(600); await p.evaluate(() => SYNQUENZER.vd4.reset()); await p.waitForTimeout(1500);
const mr = await info(p);
await p.evaluate(() => { if (R.playing) stop(); }); await settle(p, 600);
ok('VD4-13', ma.live && ma.frames >= 12 && ma.cur.live && mr.frames === 0, 'App-Bild läuft live mit der Matrix (≈ 10 Bilder/s); Regie folgt dem Song – während nur die Matrix spielt, steht ihr Bild (0 neue Bilder)', {app: {frames: ma.frames, live: ma.live}, regie: {frames: mr.frames, live: mr.live}});

/* ======================= 6. Tippen = Ansicht für diesen Bereich wählen (VD3-Menü) ======================= */
await p.evaluate(() => { if (R.playing) stop(); setSongView(true); SV.pos = 4; UI.dirty.song = true; }); await settle(p, 700);
const t0 = await info(p);
await p.touchscreen.tap(t0.rect.x + t0.rect.w / 2, t0.rect.y + t0.rect.h / 2 + 30); await settle(p, 400);
const t1 = await p.evaluate(() => ({pop: UI.pop && UI.pop.name, head: (document.querySelector('.vd3pop .vd3h b') || {}).textContent, opts: [...document.querySelectorAll('.vd3pop .vd3g .rb')].map(b => b.textContent.trim()), minH: Math.min(...[...document.querySelectorAll('.vd3pop button')].map(b => b.getBoundingClientRect().height))}));
await p.screenshot({path: OUT + '/vd4-hochkant-tippen-menue.png'});
await tapEl(p, '.vd3pop .vd3g .rb[data-v="klav"]'); await settle(p, 700);
const t2 = await info(p), v2 = await p.evaluate(() => JSON.parse(JSON.stringify(S.song.video || [])));
await p.evaluate(() => SYNQUENZER.undo()); await settle(p, 700);
const t3 = await info(p);
ok('VD4-14', t0.cur.v === 'roll' && t0.capAuto && t1.pop === 'vd3cut' && /Takt 5–6/.test(t1.head || '') && t1.opts.includes('Klavier') && t1.minH >= 44 && v2.some(e => e.a === 4 && e.b === 6 && e.v === 'klav') && t2.cur.v === 'klav' && !t2.capAuto && /Klavier/.test(t2.cap) && t3.cur.v === 'roll' && t3.capAuto,
  'Tipp aufs Fenster = Menü der Video-Spur für den Bereich an dieser Stelle (Takt 5–6); „Klavier“ gewählt → das Fenster zeigt sofort Klavier (volles Schild = deine Wahl); ↶ → wieder Auto (gestrichelt)', {t0: t0.cap, t1, t2: t2.cap, t3: t3.cap});

/* ======================= 7. Ziehen / Andocken / gemerkt ======================= */
await p.evaluate(() => setSongView(false)); await settle(p, 600);
const pj0 = await p.evaluate(() => serializeProject());
const d0 = await info(p), cdp = await cdpOf(p);
const sx = d0.rect.x + d0.rect.w / 2, sy = d0.rect.y + d0.rect.h / 2 + 30, ex = d0.geo.gx + d0.geo.L + 30, ey = d0.geo.gy + d0.geo.T + 40;
await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: sx, y: sy}]});
const mid = [];
for (let k = 1; k <= 10; k++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: sx + (ex - sx) * k / 10, y: sy + (ey - sy) * k / 10}]}); if (k === 5) mid.push(await info(p)); }
await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await settle(p, 500);
const d1 = await info(p), pref1 = await p.evaluate(() => uiPrefs().vd4pos), pop1 = await p.evaluate(() => !!UI.pop), f3 = await FREE(p), pj1 = await p.evaluate(() => serializeProject());
await p.screenshot({path: OUT + '/vd4-hochkant-oben-links.png'});
ok('VD4-15', mid[0].drag && Math.abs(mid[0].rect.x - (sx + (ex - sx) / 2 - d0.rect.w / 2)) < 3 && d1.corner === 'tl' && pref1 && pref1.p === 'tl' && Math.abs(d1.rect.x - (d1.geo.gx + d1.geo.L)) < 1.5 && Math.abs(d1.rect.y - (d1.geo.gy + d1.geo.T)) < 1.5 && !pop1 && f3.hit.length === 0 && pj0 === pj1,
  'Ziehen mit dem Finger: das Fenster folgt, loslassen = an die nächste Ecke (oben links) angedockt; kein Menü, nichts darunter verändert (Projekt gleich), Spurköpfe/Szenen-Kopf frei', {mitte: mid[0].rect, ende: d1.rect, corner: d1.corner, pref1});
await p.reload(); await p.waitForTimeout(1500); await p.evaluate(SONG, true); await settle(p, 900);
const d2 = await info(p);
ok('VD4-16', d2.on && d2.el && d2.corner === 'tl' && Math.abs(d2.rect.x - d1.rect.x) < 1.5 && Math.abs(d2.rect.y - d1.rect.y) < 1.5 && d2.frames >= 1, 'Nach Neuladen: wieder an, an derselben Ecke (Gerät merkt Ein/Aus, Ansicht, Ecke)', {d2: {corner: d2.corner, rect: d2.rect, m: d2.m}});

/* ======================= 8. Kosten: Bilder/s, Zeichenzeit, CPU an/aus, verdeckt, Stillstand ======================= */
const cdp2 = await cdpOf(p); await cdp2.send('Performance.enable');
await p.evaluate(() => { setSongView(true); SYNQUENZER.vd4.mode('regie'); }); await settle(p, 500);
const playFor = async (ms) => { await p.evaluate(() => { SYNQUENZER.vd4.reset(); songPlayStart(0); }); await p.waitForTimeout(400); const m0 = await taskMs(cdp2); const f0 = (await info(p)).frames; await p.waitForTimeout(ms); const m1 = await taskMs(cdp2); const i1 = await info(p); await p.evaluate(() => songPlayEnd(true)); await settle(p, 500);
  return {task: +((m1.task - m0.task) / (ms / 1000)).toFixed(1), script: +((m1.script - m0.script) / (ms / 1000)).toFixed(1), frames: i1.frames - f0, fps: +((i1.frames - f0) / (ms / 1000)).toFixed(1), avg: i1.avg, max: i1.msMax}; };
const cOn1 = await playFor(5000);
// verdeckt: Klang-Editor offen, Song spielt → keine Bilder
await p.evaluate(() => { SYNQUENZER.vd4.reset(); songPlayStart(0); openEditor(); }); await p.waitForTimeout(2000);
const cov = await info(p); await p.evaluate(() => { closeEditor(); }); await p.waitForTimeout(1200); const cov2 = await info(p);
// verdeckt von einem großen Fenster (Mix & Master): keine Bilder; ein kleines Fenster (Menü der Video-Spur) daneben zählt nicht
await p.evaluate(() => { mx2Sheet(); SYNQUENZER.vd4.reset(); }); await p.waitForTimeout(1500); const covMx = await info(p); await p.evaluate(() => closePop()); await p.waitForTimeout(1000); const covMx2 = await info(p);
await p.evaluate(() => songPlayEnd(true)); await settle(p, 500);
// Stillstand: nichts ändert sich → keine Bilder
await p.evaluate(() => SYNQUENZER.vd4.reset()); await p.waitForTimeout(3000); const still = await info(p);
// aus per ✕
await tapEl(p, '.vd4w .vd4x'); await settle(p, 400);
const off = await p.evaluate(() => ({on: SYNQUENZER.vd4.on(), el: !!document.querySelector('.vd4w'), pref: uiPrefs().vd4on}));
const cOff1 = await playFor(5000);
await p.evaluate(() => SYNQUENZER.vd4.on(true)); await settle(p, 600);
const cOn2 = await playFor(5000);
await p.evaluate(() => SYNQUENZER.vd4.on(false)); await settle(p, 300);
const cOff2 = await playFor(5000);
const onT = (cOn1.task + cOn2.task) / 2, offT = (cOff1.task + cOff2.task) / 2;
ok('VD4-17', cOn1.fps >= 8 && cOn1.fps <= 11.5 && cOn1.avg < 8 && cov.frames === 0 && cov2.frames > 0 && covMx.frames === 0 && covMx2.frames > 0 && still.frames === 0, 'An: gedrosselt auf ≈ 10 Bilder/s, kleine Zeichenzeit je Bild; verdeckt (Klang-Editor bzw. Mix & Master offen) 0 Bilder, danach weiter; Stillstand ohne Änderung 0 Bilder', {on: cOn1, editor: cov.frames, danach: cov2.frames, mix: covMx.frames, danach2: covMx2.frames, still: still.frames});
ok('VD4-18', !off.on && !off.el && off.pref === false && cOff1.frames === 0 && cOff2.frames === 0, '✕ = aus: Fenster weg, Gerät merkt „aus“; beim Abspielen 0 Bilder (gemessen)', {off, cOff1, cOff2});
ok('VD4-19', true, `CPU (Hauptfaden, Song spielt, je 5 s, 2 Läufe): an ${onT.toFixed(1)} ms/s · aus ${offT.toFixed(1)} ms/s · Zeichnen ${cOn1.avg} ms/Bild (max ${cOn1.max}) bei ${cOn1.fps} Bildern/s ≈ ${(cOn1.avg * cOn1.fps / 10).toFixed(1)} % eines Kerns`, {on: [cOn1, cOn2], off: [cOff1, cOff2]});
fs.writeFileSync(OUT + '/vd4-cpu.json', JSON.stringify({on: [cOn1, cOn2], off: [cOff1, cOff2], onT, offT}, null, 1));
// das Projekt kennt kein VD4
const pj2 = await p.evaluate(() => serializeProject());
ok('VD4-20', !/vd4/.test(pj2) && pj0 === pj1, 'Nichts im Projekt: Ein/Aus, Ansicht und Ecke sind Geräte-Einstellungen (alte Projekte laden gleich)', {vd4InProject: /vd4/.test(pj2)});
await p.close(); await ctxP.close();

/* ======================= 9. Quer (926 × 428, 926 × 370): Größe, Platz, ✕, eigene Ecke ======================= */
const ctxL = await b.newContext({viewport: {width: 926, height: 428}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
p = await open(APP, 926, 428, ctxL);
await p.evaluate(SONG, true); await p.evaluate(() => { SYNQUENZER.vd4.on(true); SV.pos = 8; }); await settle(p, 800);
const q1 = await FREE(p), qi = await info(p);
await p.screenshot({path: OUT + '/vd4-quer-matrix.png'});
await p.evaluate(() => setSongView(true)); await settle(p, 700);
const q2 = await FREE(p);
await p.mouse.click(5, 5).catch(() => {}); await p.evaluate(() => { songPlayStart(8); }); await p.waitForTimeout(1500);
await p.screenshot({path: OUT + '/vd4-quer-song-live.png'}); const qlive = await info(p); await p.evaluate(() => songPlayEnd(true)); await settle(p, 400);
ok('VD4-21', q1 && q1.rect.w === 88 && q1.rect.h === 156 && q1.inGa && q1.hit.length === 0 && q1.x.w >= 44 && q1.x.h >= 44 && q1.x.inView && q1.m.w >= 44 && q2.hit.length === 0 && q2.inGa && qi.corner === 'br' && qlive.live,
  'Quer 926 × 428: 88 × 156 pt, unten rechts (Matrix: zwischen Spurköpfen und Stopp-Spalte; Song: unter der Taktleiste), ✕ und Umschalter ≥ 44, live im Song', {q1, q2: {rect: q2.rect, hit: q2.hit}, cap: qlive.cap});
await p.setViewportSize({width: 926, height: 370}); await settle(p, 800);
const q3 = await FREE(p);
await p.evaluate(() => setSongView(false)); await settle(p, 700);
const q4 = await FREE(p);
await p.screenshot({path: OUT + '/vd4-quer370-matrix.png'});
ok('VD4-22', q3 && q3.hit.length === 0 && q3.inGa && q3.x.inView && q4 && q4.hit.length === 0 && q4.inGa && q4.x.inView, 'Quer 926 × 370 (Safari mit Leisten): Song und Matrix – Fenster ganz in der Fläche, nichts Wichtiges verdeckt, ✕ sichtbar', {q3: {rect: q3.rect, hit: q3.hit}, q4: {rect: q4.rect, hit: q4.hit}});
// quer eigene Ecke: nach oben rechts ziehen; hochkant behält seine
const L0 = await info(p), cdq = await cdpOf(p);
const lx = L0.rect.x + L0.rect.w / 2, ly = L0.rect.y + L0.rect.h / 2 + 20;
await cdq.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: lx, y: ly}]});
for (let k = 1; k <= 6; k++) await cdq.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: lx - 10 * k, y: ly - 15 * k}]});
await cdq.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await settle(p, 500);
const L1 = await info(p), lp = await p.evaluate(() => uiPrefs().vd4pos);
await p.setViewportSize({width: 428, height: 926}); await settle(p, 800);
const L2 = await info(p);
ok('VD4-23', L1.corner === 'tr' && lp.l === 'tr' && L2.corner === 'br' && L2.rect.w === 110, 'Quer und hochkant haben je ihre Ecke (quer jetzt oben rechts, hochkant weiter unten rechts); beim Drehen wechselt die Größe', {L1: {corner: L1.corner, rect: L1.rect}, L2: {corner: L2.corner, rect: L2.rect}, lp});
// Format 16:9: das Fenster liegt quer
await p.evaluate(() => { SYNQUENZER.vvPrefs({fmt: '16:9'}); }); await settle(p, 800);
const L3 = await FREE(p); await p.screenshot({path: OUT + '/vd4-hochkant-16x9.png'});
await p.evaluate(() => { SYNQUENZER.vvPrefs({fmt: '9:16'}); }); await settle(p, 600);
ok('VD4-24', L3 && L3.rect.w === 196 && L3.rect.h === 110 && L3.hit.length === 0, 'Video-Format 16:9: das Fenster ist 196 × 110 (wie das Video), weiter frei', L3 && L3.rect);
await p.close(); await ctxL.close();

/* ======================= 10. alte Projekte laden gleich (gegen 4.48.1) ======================= */
{ const pz = await open(BASE, 428, 926); await pz.evaluate(SONG, true); await settle(pz, 400);
  const OLD = await pz.evaluate(() => serializeProject());                       // ein Projekt aus 4.48.1 (mit Song und Video-Spur)
  const pa = await open(APP, 428, 926); await pa.evaluate(() => SYNQUENZER.vd4.on(true));
  const load = (q) => q.evaluate(j => { applyProject(JSON.parse(j)); return serializeProject(); }, OLD);
  const jA = await load(pa), jZ = await load(pz); await settle(pa, 600); const iA = await info(pa);
  const norm = j => JSON.stringify(JSON.parse(j, (k, v) => (k === 'uid' || k === 'id' ? undefined : v)));
  ok('VD4-25', norm(jA) === norm(jZ) && norm(jA) === norm(OLD) && iA.el && iA.frames >= 1, 'Altes Projekt (aus 4.48.1) lädt gleich: dieselbe Projekt-Datei wie in 4.48.1, auch mit Fenster an', {lenA: jA.length, lenZ: jZ.length, frames: iA.frames});
  await pa.close(); await pz.close(); }

/* ======================= 11. Prüfung (Befunde 1–4 des Prüfers) ======================= */
const SH = sh => JSON.stringify(sh.map(s => [s.a, s.b, s.v, s.t]));
{ // Befund 1: Clip-Blatt „Im Video“ (per Finger) und Clip löschen → das Fenster rechnet seine Regie neu (= Video-Render)
  const p = await open(APP, 428, 926); await p.evaluate(SONG, false);
  await p.evaluate(() => { SYNQUENZER.vd4.on(true); SYNQUENZER.vd4.mode('regie'); setSongView(true); SV.pos = 4; SV.lastStop = 4; UI.dirty.song = true; }); await settle(p, 900);
  const cmp = () => p.evaluate(() => { const m = s => JSON.stringify(s.map(x => [x.a, x.b, x.v, x.t])); const f = m(vvRun({view: 'auto', range: {a: 0, b: S.song.bars}}).shots); return {same: !!VD4.rt && m(VD4.rt.shots) === f, pip: VD4.rt ? m(VD4.rt.shots) : null, fresh: f, cap: SYNQUENZER.vd4.info().cap}; });
  const c0 = await cmp();
  await p.evaluate(() => openClipSheet(1, 0)); await settle(p, 600);
  const bt = await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Im Video/.test(x.textContent) && x.getClientRects().length); if (!b) return null; b.scrollIntoView({block: 'center'}); const q = b.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; });
  if (bt) { await p.touchscreen.tap(bt[0], bt[1]); await settle(p, 400); }
  const kb = await p.evaluate(() => { const b = document.querySelector('.vr1vl button[data-v="klav"]'); if (!b) return null; const q = b.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; });
  if (kb) { await p.touchscreen.tap(kb[0], kb[1]); await settle(p, 400); }
  const vid = await p.evaluate(() => S.tracks[1].clips[0].vid || null);
  await p.evaluate(() => { try { closePop(); } catch (e) {} if (R.editor === 'clip') closeClipSheet(); }); await settle(p, 900);
  const c1 = await cmp();
  await p.evaluate(() => { SYNQUENZER.vd4.reset(); songPlayStart(4); }); await p.waitForTimeout(1300);
  const lv = await info(p); await p.evaluate(() => songPlayEnd(true)); await settle(p, 400);
  fs.writeFileSync(OUT + '/vd4-pruef-im-video-klavier.png', Buffer.from(await p.evaluate(() => SYNQUENZER.vd4.png()), 'base64'));
  const rnd = await p.evaluate(async () => { SYNQUENZER.vvTest({size: [216, 384]}); try { await SYNQUENZER.vvMake({fmt: '9:16', view: 'auto', range: {a: 0, b: 12}}); return JSON.stringify(VV.lastRt.shots.map(s => [s.a, s.b, s.v, s.t])); } finally { SYNQUENZER.vvTest({}); } });
  await settle(p, 900); const c2 = await cmp();
  await p.evaluate(() => vr1SetVid(1, 0, null)); await settle(p, 700); const c3 = await cmp();
  await p.evaluate(() => clearClip(2, 0, true)); await settle(p, 900); const c4 = await cmp();
  await p.evaluate(() => SYNQUENZER.undo()); await settle(p, 900); const c5 = await cmp();
  // keine Mehrkosten beim bloßen Abspielen: der Schnittplan wird nur nach einer Änderung neu gerechnet
  await p.evaluate(() => { const o = window.vvRun; window.__vro = o; window.__vrn = 0; window.vvRun = function () { __vrn++; return o.apply(this, arguments); }; songPlayStart(0); }); await p.waitForTimeout(500);
  await p.evaluate(() => { __vrn = 0; window.__tk0 = TKGEN; }); await p.waitForTimeout(3000);
  const quiet = await p.evaluate(() => ({vvRun: __vrn, tk: TKGEN - __tk0, frames: SYNQUENZER.vd4.info().frames}));
  await p.evaluate(() => { songPlayEnd(true); window.vvRun = window.__vro; }); await settle(p, 300);
  ok('VD4-28', c0.same && bt && kb && vid === 'klav' && c1.same && /Klavier/.test(c1.cap) && lv.cur.v === 'klav' && rnd === c1.pip && c2.same && c3.same && c3.pip !== c1.pip && c4.same && c4.pip !== c3.pip && c5.same && c5.pip === c3.pip && quiet.vvRun === 0 && quiet.tk === 0,
    'Befund 1: Clip-Blatt „Im Video: Klavier“ (Finger) → das Fenster zeigt sofort Klavier, auch live ab Takt 5, und hat denselben Schnittplan wie der echte Render danach; „Auto“ zurück, Clip löschen und ↶ → jedes Mal neu = frischer Plan; Song spielt ohne Änderung: 0 neue Pläne', {c0: c0.pip, c1: c1.pip, cap: c1.cap, live: lv.cur && lv.cur.v, render: rnd, c4: c4.pip, c5: c5.same, quiet});
  await p.close(); }
{ // Befund 2: gelbe Auswahl → das Fenster rechnet den Bereich des nächsten Videos (Auswahl); außerhalb: wie ganzer Song
  const sel = [];
  for (const [a, bb] of [[1, 11], [5, 11]]) {
    const p = await open(APP, 428, 926); await p.evaluate(SONG, true);
    await p.evaluate(([a, bb]) => { SYNQUENZER.vd4.on(true); SYNQUENZER.vd4.mode('regie'); setSongView(true); SYNQUENZER.songSelect(a, bb); VV.useSel = false; }, [a, bb]); await settle(p, 900);
    // live in der Auswahl: am zweiten Takt der Auswahl
    await p.evaluate(x => { SYNQUENZER.vd4.reset(); songPlayStart(x); }, a + 1); await p.waitForTimeout(1200);
    const lv = await info(p); await p.evaluate(() => songPlayEnd(true)); await settle(p, 400);
    await p.evaluate(() => vvOpen()); await settle(p, 900);
    const segSel = await p.evaluate(() => VV.useSel !== false && vvRange(true).sel);
    await p.evaluate(() => SYNQUENZER.vvTest({size: [216, 384]}));
    await tapEl(p, '.vvbtn.go');
    await p.waitForFunction(() => !VV.busy && VV.lastRt, null, {timeout: 120000}).catch(() => {});
    await p.evaluate(() => SYNQUENZER.vvTest({})); await p.evaluate(() => { try { vvClose(); } catch (e) { closePop(); } }); await settle(p, 900);
    const r = await p.evaluate(() => { const job = VV.lastRt, whole = vvRun({view: 'auto', range: {a: 0, b: S.song.bars}}), rows = [];
      for (let x = 0; x < S.song.bars; x++) { const sb = x * 4 + 2.5, c = SYNQUENZER.vd4.shotAt(sb), j = x >= job.A && x < job.B ? vvShotAt(job, sb) : vvShotAt(whole, sb); rows.push([x + 1, x >= job.A && x < job.B ? 'video' : 'ganz', j.v + (j.t != null ? j.t : ''), c.v + (c.t != null ? c.t : '')]); }
      return {A: job.A, B: job.B, rows, diff: rows.filter(q => q[2] !== q[3])}; });
    const jl = await p.evaluate(sb => { const s = vvShotAt(VV.lastRt, sb); return s.v + (s.t != null ? s.t : ''); }, lv.cur.sb);
    sel.push({sel: [a + 1, bb + 1], segSel, A: r.A, B: r.B, diff: r.diff, liveBar: lv.cur.bar + 1, live: lv.cur.v + (lv.cur.t != null ? lv.cur.t : ''), liveVideo: jl, rows: r.rows.map(q => q.join(':')).join(' ')});
    await p.close();
  }
  ok('VD4-29', sel.every(x => x.segSel && x.A === x.sel[0] - 1 && x.B === 12 && x.diff.length === 0 && x.liveBar > x.sel[0] - 1 && x.live === x.liveVideo),
    'Befund 2: gelbe Auswahl (Takt 2–12 und 6–12), Blatt mit Vorgabe [Auswahl], [Video erstellen] per Finger → jeder Takt der Auswahl zeigt im Fenster dieselbe Ansicht wie im Video (0 Abweichungen, auch live); Takte außerhalb wie im Video des ganzen Songs', sel);
}
{ // Befund 3: Trefferfläche des Umschalters = die Pille (+ Rand), 44 px hoch; daneben = Bild (Tippen → Menü, Ziehen → Fenster wandert)
  const hit = {};
  for (const [W, H, fmt] of [[428, 926, '9:16'], [926, 428, '9:16'], [428, 926, '16:9'], [926, 428, '16:9']]) {
    const p = await open(APP, W, H); const k = `${W}x${H}-${fmt}`; await p.evaluate(SONG, false);
    await p.evaluate(f => { vvPrefSet('fmt', f); SYNQUENZER.vd4.on(true); SYNQUENZER.vd4.mode('regie'); setSongView(false); }, fmt); await settle(p, 1000);
    const g = await p.evaluate(() => { const r = e => { const q = e.getBoundingClientRect(); return {x: q.x, y: q.y, w: q.width, h: q.height}; }; return {win: r(document.querySelector('.vd4w')), m: r(document.querySelector('.vd4m')), pill: r(document.querySelector('.vd4m span')), x: r(document.querySelector('.vd4x')), xs: r(document.querySelector('.vd4x span'))}; });
    const o = {win: [g.win.w, g.win.h], toggle: [Math.round(g.m.w), Math.round(g.m.h)], pill: [Math.round(g.pill.w), Math.round(g.pill.h)], x: [g.x.w, g.x.h]};
    o.tight = g.m.w >= 44 && g.m.h >= 44 && g.m.w <= Math.max(44, g.pill.w + 12) && g.x.w >= 44 && g.x.h >= 44 && g.xs.x + g.xs.w <= g.win.x + g.win.w && g.xs.y >= g.win.y;
    // Tipp 30 px rechts neben der Pille (wo davor noch Bild ist) → VD3-Menü statt Umschalten
    const tx = g.pill.x + g.pill.w + 30, ty = g.win.y + 30;
    if (tx < g.x.x - 4) {
      await p.touchscreen.tap(tx, ty); await settle(p, 400);
      o.tap = await p.evaluate(() => ({m: VD4.m, pop: UI.pop && UI.pop.name})); await p.evaluate(() => closePop()); await settle(p, 300);
      const c = await cdpOf(p), r0 = (await info(p)).rect;
      await c.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: tx, y: ty}]});
      for (let i = 1; i <= 10; i++) { await c.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: tx - 15 * i, y: ty - 6 * i}]}); await p.waitForTimeout(16); }
      await c.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await settle(p, 500);
      const i1 = await info(p); o.drag = {moved: Math.abs(i1.rect.x - r0.x) + Math.abs(i1.rect.y - r0.y) > 20, corner: i1.corner, m: i1.m};
      await p.evaluate(() => { const o = Object.assign({}, uiPrefs().vd4pos || {}); o[vd4Land() ? 'l' : 'p'] = 'br'; setUiPref('vd4pos', o); vd4Place(false); }); await settle(p, 300);
    } else o.tap = 'kein Bild rechts der Pille (9:16: die Pille reicht bis an das ✕)';
    // die Pille selbst schaltet weiter um
    await tapEl(p, '.vd4w .vd4m span'); await settle(p, 300); o.pillTap = await p.evaluate(() => VD4.m); await p.evaluate(() => SYNQUENZER.vd4.mode('regie'));
    if (fmt === '16:9') { const r = (await info(p)).rect; await p.screenshot({path: `${OUT}/vd4-pruef-${W > H ? 'quer' : 'hochkant'}-16-9.png`, clip: {x: r.x - 12, y: r.y - 12, width: r.w + 24, height: r.h + 24}}); }
    hit[k] = o; await p.close();
  }
  const H = Object.values(hit), wide = Object.entries(hit).filter(([k]) => /16:9/.test(k)).map(([, v]) => v);
  ok('VD4-30', H.every(o => o.tight && o.pillTap === 'app') && wide.every(o => o.tap && o.tap.m === 'regie' && o.tap.pop === 'vd3cut' && o.drag.moved && o.drag.m === 'regie'),
    'Befund 3: der Umschalter reagiert nur auf der Pille (+ Rand, ≥ 44 × 44), ✕ 44 × 44 sichtbar; 16:9 hochkant/quer: Tipp 30 px rechts der Pille öffnet das Menü der Video-Spur, Ziehen von dort verschiebt das Fenster; die Pille schaltet weiter Regie ⇄ App', hit);
}
{ // Befund 4: App beim Matrix-Spielen, langer Song (160 Takte, 6 Spuren), noch kein Video in der Sitzung: kein Schnittplan je Bild
  const p = await open(APP, 428, 926);
  await p.evaluate(() => { const A = SYNQUENZER; A.setMetronome && A.setMetronome(false);
    const nt = NT(), syn = (n0, k) => ({len: 1, notes: [0, 1, 2, 3].map(t => ({t, d: .5, n: n0 + ((t * k) % 7), v: .7}))});
    for (let t = 0; t < nt; t++) for (let s = 0; s < 8; s++) { if (t === DRUM_T) A.setClip(t, s, {len: 1, notes: [{t: 0, d: .25, n: 36 + (s % 3), v: .9}, {t: 2, d: .25, n: 38, v: .8}]}); else A.setClip(t, s, syn(48 + t * 3, s + 1)); }
    const bars = 160, lanes = Array.from({length: nt}, () => []);
    for (let t = 0; t < nt; t++) for (let x = 0; x < bars; x += 2) if ((x / 2 + t) % 3) lanes[t].push({bar: x, slot: ((x * 7 + t * 3) >> 2) % 8});
    const marks = []; for (let x = 0; x < bars; x += 8) marks.push({id: 'm' + x, a: x, len: 8, name: 'T' + x});
    A.setSong({bars, lanes, carrier: [], marks}); SYNQUENZER.vd4.on(true); SYNQUENZER.vd4.mode('app'); setSongView(false); });
  await settle(p, 900);
  await p.evaluate(() => { const o = window.vvRun; window.__vro = o; window.__vr = {n: 0, ms: 0}; window.vvRun = function () { const t = performance.now(), x = o.apply(this, arguments); __vr.ms += performance.now() - t; __vr.n++; return x; }; });
  const last = await p.evaluate(() => !!VV.lastRt);
  const sc = await p.evaluate(() => { const q = document.querySelector('#clipGrid .scn').getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; });
  await p.touchscreen.tap(sc[0], sc[1]); await p.waitForTimeout(700);
  await p.evaluate(() => { SYNQUENZER.vd4.reset(); __vr.n = 0; __vr.ms = 0; }); await p.waitForTimeout(3000);
  const m = await p.evaluate(() => { const i = SYNQUENZER.vd4.info(); return {vvRun: __vr.n, ms: +__vr.ms.toFixed(1), frames: i.frames, avg: i.avg, max: i.msMax, live: i.live, songPlay: !!R.songPlay, cap: i.cap}; });
  await p.evaluate(() => { if (R.playing) stop(); window.vvRun = window.__vro; }); await settle(p, 300);
  ok('VD4-31', !last && m.live && !m.songPlay && m.frames >= 20 && m.vvRun === 0 && /App-Bild/.test(m.cap || ''),
    `Befund 4: App beim Matrix-Spielen (Szene per Finger, 160 Takte, kein Video in der Sitzung): 0 Schnittpläne in 3 s (vorher 1 je Bild), ${m.frames} Bilder, ${m.avg} ms/Bild (max ${m.max})`, m);
  await p.close(); }

/* ======================= Pflichtregeln im Text ======================= */
const src = fs.readFileSync(APP, 'utf8'), blk = src.slice(src.indexOf('/* VD4-BEGIN'), src.indexOf('/* VD4-END */'));
const bad = ['Korg', 'microKORG', 'RADIAS', 'DWGS', 'Kodamo', 'Mask1', 'Nord', 'Kompakt', 'Clavia'].filter(w => src.includes(w));
const emo = (blk.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}]/gu) || []);
ok('VD4-26', !bad.length && src.split('MS 2000').length - 1 === 1 && src.split('  live: true,').length - 1 === 1 && !emo.length && blk.length > 1000, 'Pflichtwörter: keine verbotenen Namen, „MS 2000“ genau 1×, „  live: true,“ genau 1×, keine Emojis im VD4-Block', {bad, emo});

ok('VD4-27', errs.length === 0, 'Keine Fehler in der Konsole', errs.slice(0, 5));
await b.close();
const n = R.length, f = R.filter(x => !x[1]).length;
console.log((f ? 'FEHLER ' : 'OK ') + `ERGEBNIS ${n - f}/${n}`);
fs.writeFileSync(OUT + '/vd4-test-ergebnis.json', JSON.stringify(R));
