// MTX3b – Einzelspuren: Remix/Stil ohne Doppel-Schläge, Tastatur-Aufnahme, Laden im Synth-Modus, quer umblättern,
// [Auslagern ▾] im Drum-Schritt-Editor (Töne / Schritte), Drum-Schritt-Editor je Einzelspur.
// Aufruf: node mtx3b-test.mjs <index.html> <fotoordner>   (absolute Pfade). Touch über CDP, 428×926 / 926×428 / 926×370, Messungen.
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const file = process.argv[2], dir = process.argv[3];
if (!file || !dir) { console.log('Aufruf: node mtx3b-test.mjs <index.html> <fotoordner>'); process.exit(2); }
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const res = []; const ok = (name, cond, info) => { res.push({name, ok: !!cond}); console.log((cond ? 'OK     ' : 'FEHLER ') + name + (info !== undefined ? ' · ' + JSON.stringify(info) : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function open(w, h) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1600);
  await p.evaluate(() => {
    window.__W = ms => new Promise(r => setTimeout(r, ms));
    // was der Song spielt, je Pad und Spur (Treffer), und Doppel = dasselbe Pad an derselben Stelle auf zwei Spuren
    window.__pads = () => { const song = S.song, L = barBeat(song.bars), per = {}, at = new Map();
      for (let i = 0; i < NT(); i++) { const tr = S.tracks[i]; if (!tr || !(isDrum(i) || tr.dvx)) continue;
        int54MidiClips(song, i, tr, L, () => null, false, (st, en, pp) => { const id = (DRUM_BY_GM[pp] || DRUM_BY_GM[mapV1Drum(pp)] || {}).id || pp; (per[id] || (per[id] = {}))[i] = (per[id][i] || 0) + 1; const k = Math.round(st * 8) + ':' + id; if (!at.has(k)) at.set(k, new Set()); at.get(k).add(i); }); }
      let dbl = 0; for (const s of at.values()) if (s.size > 1) dbl++;
      const sum = {}; for (const id in per) sum[id] = Object.values(per[id]).reduce((a, x) => a + x, 0);
      return {per, sum, dbl}; };
    window.__clipPads = (s) => [DRUM_T].concat(S.tracks.map((x, j) => j).filter(j => S.tracks[j].dvx)).map(t => { const c = S.tracks[t].clips[s]; return t + ':' + (c ? [...new Set(c.notes.map(n => (DRUM_BY_GM[n.n] || {}).id))].sort().join('/') : '-'); }).join(' ');
    window.__R = async () => { ensureAudio(); drumBufs(); const MR = Math.random; Math.random = () => .3125; try { VV.cancel = false; const r = await vvRenderAudio({range: {a: 0, b: S.song.bars, sel: false}}); return {L: Float32Array.from(r.ch[0]), R: Float32Array.from(r.ch[1])}; } finally { Math.random = MR; } };
    window.__db = (X, Y) => { let e = 0, d = 0; const n = Math.min(X.L.length, Y.L.length); for (const c of ['L', 'R']) for (let k = 0; k < n; k++) { e += X[c][k] * X[c][k]; const q = X[c][k] - Y[c][k]; d += q * q; } return Math.round(10 * Math.log10(d / Math.max(e, 1e-20) + 1e-30) * 10) / 10; };
    window.__only = () => { for (let i = 0; i < NT(); i++) if (i !== DRUM_T) S.tracks[i].clips = S.tracks[i].clips.map(() => null); };
  });
  const cdp = await ctx.newCDPSession(p);
  const T = {
    async down(x, y) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id: 1}]}); },
    async move(x, y) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x, y, id: 1}]}); },
    async up() { await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); },
    async tap(x, y) { await this.down(x, y); await sleep(60); await this.up(); await sleep(220); },
    async hold(x, y, ms = 750) { await this.down(x, y); await sleep(ms); await this.up(); await sleep(250); },
    async drag(x0, y0, x1, y1, n = 8) { await this.down(x0, y0); for (let k = 1; k <= n; k++) { await sleep(25); await this.move(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n); } await sleep(40); await this.up(); await sleep(220); },
  };
  return {ctx, p, errs, T};
}
const R_ = (p, fn, arg) => p.evaluate(([src, a]) => { const e = (0, eval)(src)(a); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2}; }, [fn.toString(), arg]);
const popBtn = (p, sel) => R_(p, a => (UI.pop && UI.pop.el ? UI.pop.el.querySelector(a) : null), sel);
const popName = p => p.evaluate(() => (UI.pop ? UI.pop.name : null));
async function popCheck(p, label) {
  const r = await p.evaluate(() => {
    const P = UI.pop && UI.pop.el; if (!P) return null;
    const q = P.getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
    const x = [...P.querySelectorAll('button')].find(b => (b.textContent || '').trim() === '✕' && b.getClientRects().length);
    const xr = x ? x.getBoundingClientRect() : null;
    const small = [...P.querySelectorAll('button')].filter(b => b.getClientRects().length && !b.classList.contains('ux1-px')).map(b => b.getBoundingClientRect()).filter(r => r.height < 43.5 || r.width < 43.5).length;
    return {in: q.left >= 7.5 && q.top >= 7.5 && q.right <= vw - 7.5 && q.bottom <= vh - 7.5, box: [Math.round(q.left), Math.round(q.top), Math.round(q.right), Math.round(q.bottom)], x: !!xr && xr.top >= 0 && xr.right <= vw && xr.width >= 40, small, sh: P.scrollHeight > P.clientHeight + 1};
  });
  ok(label + ': Blatt ganz im Bild (8 px Rand), ✕ sichtbar, Tasten ≥ 44 px', r && r.in && r.x && r.small === 0, r);
}
async function tapPop(T, p, sel, label) { const r = await popBtn(p, sel); if (!r) { ok(label + ' (Knopf da)', false); return false; } await T.tap(r.cx, r.cy); return true; }

// ======================= 1 · Remix / Stil / Grundmuster / Stil-Klang: keine Doppel-Schläge (428×926, Messungen) =======================
{
  const {ctx, p, errs} = await open(428, 926);
  const r = await p.evaluate(async () => {
    const o = {}; __only(); SYNQUENZER.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 1}]);
    // Bezug ohne Aufteilen: Stil-Muster und Stil 70 %
    o.p0 = __pads();
    SYNQUENZER.gr2.remix('italo', {k: 100, art: 'm'}); o.refM = __pads(); const A = await __R(); undo();
    SYNQUENZER.gr2.remix('italo', {k: 70, art: 'u'}); o.refU = __pads(); undo();
    gen4DoScene(0, gr2Style('italo'), 70, {src: new Map()}, false); o.refG4 = __clipPads(0) + ' n=' + S.tracks[DRUM_T].clips[0].notes.length; o.refG4n = S.tracks[DRUM_T].clips[0].notes.length; undo();
    o.split = SYNQUENZER.mtx3.split(); o.p1 = __pads();
    o.role = [DRUM_T].concat(o.split).map(t => SYNQUENZER.gr2.role(t, 0));
    const u0 = UNDO.length;
    SYNQUENZER.gr2.remix('italo', {k: 100, art: 'm'}); o.m = __pads(); o.mUndo = UNDO.length - u0;
    o.mOwn = Object.values(S.song.own || {}).filter(c => c && c.from && o.split.includes(c.from.t)).length;
    const B = await __R(); o.dbM = __db(A, B);
    undo(); o.mBack = __pads();
    SYNQUENZER.gr2.remix('italo', {k: 70, art: 'u'}); o.u = __pads(); undo();
    // GEN4 Szene an Ort und Stelle, ein ↶
    const n0 = UNDO.length; gen4DoScene(0, gr2Style('italo'), 70, {src: new Map()}, false); o.g4 = __clipPads(0); o.g4undo = UNDO.length - n0;
    o.g4n = o.split.concat([DRUM_T]).reduce((a, t) => a + (S.tracks[t].clips[0] ? S.tracks[t].clips[0].notes.length : 0), 0);
    o.g4seed = o.split.map(t => S.tracks[t].clips[0].seed === S.tracks[DRUM_T].clips[0].seed);
    undo(); o.g4back = __clipPads(0);
    // Matrix-Remix (neue Szene, Stil-Muster)
    const mx = SYNQUENZER.gen3.mxRemix('italo', {src: 0, k: 70, art: 'm'}); o.mx = mx && mx.dst; o.mxc = mx && mx.dst != null ? __clipPads(mx.dst) : null;
    o.mxDrum = mx && mx.dst != null ? o.split.map(t => { const c = S.tracks[t].clips[mx.dst]; return !!c && 'seed' in c; }) : null;
    undo();
    // Grundmuster auf DRUMS (Szene 0)
    const st1 = (GR1_STYLES[0] || {}).id || null; o.gr1 = st1;
    if (st1) { gr1Pattern(DRUM_T, 0, st1); o.gr1c = __clipPads(0); undo(); }
    // Stil-Klang (SND1): Drive/Hall/Echo der Drums auch auf den Einzelspuren, ein ↶, Noten unverändert
    const nb = __pads(); const s0 = UNDO.length;
    SYNQUENZER.snd1.apply('italo', 'mix', {commit: true});
    const D = S.tracks[DRUM_T].sound.fx || {}; o.snd = o.split.map(j => ['drive', 'rev', 'dly'].every(k => (S.tracks[j].sound.fx || {})[k] === D[k]));
    o.sndIs = o.split.map(j => SYNQUENZER.mtx3.info().is[j]); o.sndSame = JSON.stringify(__pads()) === JSON.stringify(nb); o.sndUndo = UNDO.length - s0;
    return o;
  });
  console.log('  Bezug ohne Aufteilen (Treffer je Pad): Stil-Muster ' + JSON.stringify(r.refM.sum) + ' · Stil 70 % ' + JSON.stringify(r.refU.sum));
  ok('Remix-Rolle: Einzelspuren = Drums (wie DRUMS)', r.role && r.role.every(x => x === 'dr'), r.role);
  ok('GR2 Stil-Muster mit Einzelspuren: keine Doppel-Schläge', r.m.dbl === 0, {dbl: r.m.dbl});
  ok('GR2 Stil-Muster: Treffer je Pad = ohne Aufteilen', JSON.stringify(r.m.sum) === JSON.stringify(r.refM.sum) || Object.keys(r.refM.sum).every(k => r.m.sum[k] === r.refM.sum[k]), {mit: r.m.sum, ohne: r.refM.sum});
  ok('GR2 Stil-Muster: HH-Muster landet auf der Spur HH ZU', r.m.per.hatC && Object.keys(r.m.per.hatC).join() === String(r.split[0]) && r.mOwn >= 1, {hatC: r.m.per.hatC, versionen: r.mOwn});
  ok('GR2 Stil-Muster: Summen-Audio = ohne Aufteilen (≤ −60 dB)', r.dbM <= -60, r.dbM + ' dB');
  ok('GR2: ein ↶ (Remix samt Einzelspuren)', r.mUndo === 1 && JSON.stringify(r.mBack) === JSON.stringify(r.p1), {schritte: r.mUndo});
  ok('GR2 Stil 70 %: keine Doppel, Treffer je Pad = ohne Aufteilen', r.u.dbl === 0 && Object.keys(r.refU.sum).every(k => r.u.sum[k] === r.refU.sum[k]), {mit: r.u.sum, ohne: r.refU.sum});
  ok('GEN4 Szene: jede Spur nur ihr Pad, Saat bleibt, ein ↶', /^4:[^ ]*/.test(r.g4) && !/4:[^ ]*hatC/.test(r.g4) && /6:hatC( |$)/.test(r.g4) && /7:snare( |$)/.test(r.g4) && r.g4seed.every(Boolean) && r.g4undo === 1, {g4: r.g4, seed: r.g4seed, undo: r.g4undo});
  ok('GEN4 Szene: Schläge gesamt = ohne Aufteilen', r.g4n === r.refG4n, {mit: r.g4n, ohne: r.refG4n});
  ok('Matrix-Remix (neue Szene): Einzelspuren bekommen ihren Drum-Clip (Saat), DRUMS ohne HH/SNARE', r.mxc && /6:hatC( |$)/.test(r.mxc) && /7:snare( |$)/.test(r.mxc) && !/4:[^ ]*(hatC|snare)/.test(r.mxc) && r.mxDrum.every(Boolean), {mxc: r.mxc, drum: r.mxDrum});
  ok('Grundmuster auf DRUMS: ausgelagerte Pads nicht doppelt', !r.gr1 || (r.gr1c && !/4:[^ ]*(hatC|snare)/.test(r.gr1c)), {stil: r.gr1, c: r.gr1c});
  ok('Stil-Klang: Drive/Hall/Echo der Drums auch auf den Einzelspuren, Noten gleich, ein ↶', r.snd.every(Boolean) && r.sndIs.every(Boolean) && r.sndSame && r.sndUndo === 1, {snd: r.snd, is: r.sndIs, undo: r.sndUndo});
  ok('Remix-Teil: keine Konsolenfehler', errs.length === 0, errs.slice(0, 3));
  await ctx.close();
}

// ======================= 2 · Tastatur-Aufnahme auf einer Einzelspur · 3 · Laden im Synth-Modus (428×926) =======================
{
  const {ctx, p, errs} = await open(428, 926);
  const r = await p.evaluate(async () => {
    const o = {}; __only(); const m = SYNQUENZER.mtx3.split(); const j = m[0];
    S.settings.countIn = 0; S.settings.inQuant = '1/16';
    selectTrack(j); selectSlot(j, 3); launchScene(0); ensureAudio(); play(); await __W(400);
    recPress(); await __W(300);
    for (const n of [60, 64, 67, 72]) { inputDown(n, 'mk' + n, .8); await __W(90); inputUp('mk' + n); await __W(260); }
    stop(); await __W(400);
    const c = S.tracks[j].clips.find((x, s) => x && s >= 2);
    o.rec = c ? {n: c.notes.length, gm: [...new Set(c.notes.map(x => x.n))], d: [...new Set(c.notes.map(x => x.d))], seed: 'seed' in c} : null;
    // 3 · Synth-Modus: anderer Klang auf der Einzelspur, Drum-Felder an den Noten; Speichern/Laden verlustfrei
    const h = m[0], c0 = S.tracks[h].clips[0]; c0.notes[0].a = 1; c0.notes[1].p = .5; c0.notes[2].r = 3; c0.notes[3].m = .1; c0.lanes = {42: {len: 12}};
    S.tracks[h].sound.name = 'Mein Synth';
    const before = JSON.stringify(S.tracks[h].clips.map(x => (x ? cleanClip(x) : null)));
    const fo = SQStore.buildProjectFile(S, null, VERSION), txt = JSON.stringify(fo); o.put = sx14Put(txt);
    const after = JSON.stringify(S.tracks[h].clips.map(x => (x ? cleanClip(x) : null)));
    o.l5 = {same: before === after, is: SYNQUENZER.mtx3.info().is[h], a: S.tracks[h].clips[0].notes[0].a, p: S.tracks[h].clips[0].notes[1].p, r: S.tracks[h].clips[0].notes[2].r, lanes: JSON.stringify(S.tracks[h].clips[0].lanes)};
    // zurück zum Drum-Ton: Einzelspur wieder aktiv mit allen Feldern
    S.tracks[h].sound.name = S.tracks[h].dvx.sn; const t2 = JSON.stringify(SQStore.buildProjectFile(S, null, VERSION)); sx14Put(t2);
    o.l5b = {is: SYNQUENZER.mtx3.info().is[h], same: JSON.stringify(S.tracks[h].clips.map(x => (x ? cleanClip(x) : null))) === after};
    // altes Projekt ohne dvx (Standard-Projekt, wie 4.66): Rundreise gleich
    SYNQUENZER.mtx3.merge(); const old = JSON.stringify(SQStore.buildProjectFile(S, null, VERSION)).replace(/"dvx":\{[^}]*\}/g, '');
    sx14Put(old); const old2 = JSON.stringify(SQStore.buildProjectFile(S, null, VERSION));
    o.old = {same: JSON.parse(old).tracks ? JSON.stringify(JSON.parse(old).tracks) === JSON.stringify(JSON.parse(old2).tracks) : JSON.stringify(JSON.parse(old)) === JSON.stringify(JSON.parse(old2)), nt: NT()};
    return o;
  });
  ok('Tastatur-Aufnahme auf HH ZU: jede Taste = Schlag des Pads (GM 42, Schrittlänge 0,1, Saat)', r.rec && r.rec.n >= 3 && r.rec.gm.length === 1 && r.rec.gm[0] === 42 && r.rec.d.every(x => x <= .1 + 1e-9) && r.rec.seed, r.rec);
  ok('Laden im Synth-Modus: Drum-Felder (Akzent, Chance, Wirbel, Timing, D1-Spur) bleiben – Rundreise gleich', r.put && r.l5.same && !r.l5.is && r.l5.a === 1 && r.l5.p === .5 && r.l5.r === 3, r.l5);
  ok('zurück zum Drum-Ton nach Laden: Einzelspur aktiv, Felder gleich', r.l5b.is && r.l5b.same, r.l5b);
  ok('altes Projekt ohne dvx: Rundreise gleich', r.old.same, r.old);
  ok('Aufnahme/Laden: keine Konsolenfehler', errs.length === 0, errs.slice(0, 3));
  await ctx.close();
}

// ======================= 5 + 6 · Drum-Editor [Auslagern ▾] und Drum-Editor je Einzelspur (Touch, 3 Größen) =======================
for (const [w, h] of [[428, 926], [926, 428], [926, 370]]) {
  const {ctx, p, errs, T} = await open(w, h);
  const tag = w + '×' + h;
  await p.evaluate(() => { __only(); SYNQUENZER.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 1}]); setSongView(false); });
  const A = await p.evaluate(async () => { window.__A = await __R(); return true; });
  await p.evaluate(() => { const v = DRUM_VOICES.findIndex(x => x.id === 'hatC'); ED.dVoice = v; openRoll(DRUM_T, 0); }); await sleep(700);
  const db = await p.evaluate(() => { const x = EL.drumSheet.querySelector('.mtx3bdb'), e = EL.drumSheet.querySelector('.dtools .mbtn:not(.mtx3bdb)'); if (!x) return null; x.scrollIntoView({inline: 'center', block: 'nearest'}); const r = x.getBoundingClientRect(), q = e ? e.getBoundingClientRect() : null; return {w: r.width, h: r.height, same: !q || Math.abs(q.height - r.height) < .5, vis: r.bottom <= innerHeight && r.top >= 0 && r.right <= innerWidth}; });
  ok(tag + ': Drum-Editor Schritte – [Auslagern ▾] in der Werkzeug-Zeile (≥ 44 px, wie [Euklid…])', db && db.h >= 43.5 && db.w >= 43.5 && db.same && db.vis, db);
  let r = await R_(p, () => EL.drumSheet.querySelector('.mtx3bdb')); if (r) await T.tap(r.cx, r.cy); await sleep(250);
  ok(tag + ': Blatt „Auslagern“ auf, HH ZU vorgewählt', (await popName(p)) === 'mtx3bout' && (await p.evaluate(() => [...UI.pop.el.querySelectorAll('.mtx3-v .mbtn.on')].map(b => b.dataset.v).join())) === 'hatC');
  await popCheck(p, 'Auslagern (Drum-Editor) ' + tag);
  await p.screenshot({path: dir + '/mtx3b-auslagern-' + w + 'x' + h + '.png'});
  if (w === 428) {
    // ganze Töne: HH ZU (alle Szenen) → neue Spur; Summe gleich; ein ↶
    await tapPop(T, p, '[data-m3b="go"]', 'Auf eigene Spur'); await sleep(400);
    const s1 = await p.evaluate(async () => { const j = NT() - 1; const B = await __R(); return {nt: NT(), j, name: S.tracks[j].name, is: SYNQUENZER.mtx3.info().is[j], c0: __clipPads(0), c1: __clipPads(1), db: __db(__A, B), ed: R.editor, ord: trackOrder().slice(-2)}; });
    ok('ganze Töne: neue Spur HH ZU (alle Szenen), DRUMS ohne HH, Drum-Editor bleibt offen', s1.nt === 7 && s1.name === 'HH ZU' && s1.is && /6:hatC/.test(s1.c0) && /6:hatC/.test(s1.c1) && !/4:[^ ]*hatC/.test(s1.c0) && s1.ed === 'drum' && s1.ord.join() === '6,4', s1);
    ok('ganze Töne: Summen-Audio gleich (≤ −60 dB)', s1.db <= -60, s1.db + ' dB');
    await p.evaluate(() => undo()); await sleep(300);
    const u1 = await p.evaluate(() => ({nt: NT(), c0: __clipPads(0)}));
    ok('↶: ein Schritt, HH wieder auf DRUMS', u1.nt === 6 && /4:[^ ]*hatC/.test(u1.c0), u1);
    // nur diese Schritte: Szene 1, zwei Schritte abwählen
    await p.evaluate(() => { closePop(); safeRebuild(buildDrumEd); }); await sleep(300);
    r = await R_(p, () => EL.drumSheet.querySelector('.mtx3bdb')); await T.tap(r.cx, r.cy); await sleep(250);
    await tapPop(T, p, '[data-m3b="steps"]', 'Nur diese Schritte'); await sleep(200);
    const st0 = await p.evaluate(() => ({n: UI.pop.el.querySelectorAll('.mtx3b-st .mbtn').length, on: UI.pop.el.querySelectorAll('.mtx3b-st .mbtn.on').length}));
    ok('Schritte: alle HH-Schritte der Szene als Knöpfe, vorgewählt', st0.n > 2 && st0.on === st0.n, st0);
    await popCheck(p, 'Auslagern Schritte hochkant');
    for (const k of [0, 1]) { const q = await R_(p, i => UI.pop.el.querySelectorAll('.mtx3b-st .mbtn')[i], k); await T.tap(q.cx, q.cy); }
    await p.screenshot({path: dir + '/mtx3b-schritte-hochkant.png'});
    const pre = await p.evaluate(() => { const c = S.tracks[DRUM_T].clips[0]; return {hh0: c.notes.filter(n => n.n === 42).length, hh1: S.tracks[DRUM_T].clips[1] ? S.tracks[DRUM_T].clips[1].notes.filter(n => n.n === 42).length : 0, on: UI.pop.el.querySelectorAll('.mtx3b-st .mbtn.on').length}; });
    await tapPop(T, p, '[data-m3b="go"]', 'Auf eigene Spur (Schritte)'); await sleep(400);
    const s2 = await p.evaluate(() => { const j = NT() - 1; return {nt: NT(), j, hj0: S.tracks[j].clips[0] ? S.tracks[j].clips[0].notes.length : 0, hj1: !!S.tracks[j].clips[1], hd0: S.tracks[DRUM_T].clips[0].notes.filter(n => n.n === 42).length, hd1: S.tracks[DRUM_T].clips[1] ? S.tracks[DRUM_T].clips[1].notes.filter(n => n.n === 42).length : 0}; });
    ok('nur diese Schritte: neue Spur hat nur die gewählten (Szene 1), DRUMS behält den Rest', s2.nt === 7 && s2.hj0 === pre.on && !s2.hj1 && s2.hd0 === pre.hh0 - pre.on && s2.hd1 === pre.hh1, {pre, s2});
    // Rest der Szene dazu (vorhandene Spur)
    await p.evaluate(() => safeRebuild(buildDrumEd)); await sleep(300);
    r = await R_(p, () => EL.drumSheet.querySelector('.mtx3bdb')); await T.tap(r.cx, r.cy); await sleep(250);
    const dazu = await p.evaluate(() => (UI.pop.el.querySelector('.mtx3-v [data-v="hatC"] small') || {}).textContent || '');
    await tapPop(T, p, '[data-m3b="steps"]', 'Nur diese Schritte (Rest)'); await tapPop(T, p, '[data-m3b="go"]', 'dazu'); await sleep(400);
    const s3 = await p.evaluate(() => ({nt: NT(), hj0: S.tracks[6].clips[0].notes.length, hd0: S.tracks[DRUM_T].clips[0].notes.filter(n => n.n === 42).length}));
    ok('Rest dazu: in die vorhandene Spur HH ZU (keine neue), DRUMS-Szene 1 ohne HH', /dazu/.test(dazu) && s3.nt === 7 && s3.hj0 === pre.hh0 && s3.hd0 === 0, {dazu, s3});
    // Remix danach: HH der Szene 2 bleibt auf DRUMS (dort keine HH-Spur), Szene 1 auf HH ZU – keine Doppel
    const rm = await p.evaluate(() => { SYNQUENZER.gr2.remix('italo', {k: 100, art: 'm'}); const x = __pads(); undo(); return x; });
    ok('Remix nach Teil-Auslagern: keine Doppel-Schläge', rm.dbl === 0, rm.sum);
  } else {
    const x = await popBtn(p, '[data-m3b="no"]'); if (x) await T.tap(x.cx, x.cy);
    ok(tag + ': ✕ schließt', (await popName(p)) == null);
    // 4 · quer: nach dem Aufteilen (Touch) blättert die Spur-Seite zu den neuen Spuren
    await p.evaluate(() => { closeEditor(); }); await sleep(300);
    const st = await R_(p, i => UI.stops[i], 4); if (st) await T.hold(st.cx, st.cy, 750);
    await tapPop(T, p, '[data-mtx3="split"]', 'In Einzelspuren aufteilen'); await sleep(250);
    await tapPop(T, p, '[data-m3="go"]', 'Aufteilen'); await sleep(500);
    const fl = await p.evaluate(() => ({nt: NT(), bank: trackBankOf(), pages: MX.pages ? MX.pages.length : 1, rows: MX.rows.slice(), vis: [6, 7].map(j => { const e = UI.stops && UI.stops[j]; if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top >= 0 && r.bottom <= innerHeight; })}));
    ok(tag + ': nach dem Aufteilen sind die neuen Spuren im Bild (Seite umgeblättert)', fl.nt === 8 && fl.rows.includes(6) && fl.rows.includes(7) && fl.vis.every(Boolean), fl);
    await p.screenshot({path: dir + '/mtx3b-quer-umgeblaettert-' + w + 'x' + h + '.png'});
  }
  // 6 · Drum-Schritt-Editor einer Einzelspur
  await p.evaluate(() => { closePop(); closeEditor(); if (!SYNQUENZER.mtx3.info().parts.length) SYNQUENZER.mtx3.split(); }); await sleep(300);
  const j = await p.evaluate(() => SYNQUENZER.mtx3.info().parts.find(k => S.tracks[k].dvx.v === 'hatC'));
  await p.evaluate(j => { selectTrack(j); openRoll(j, 0); }, j); await sleep(700);
  const v = await p.evaluate(j => { const B = EL.rollSheet.querySelector('.mtx3bd'); if (!B) return null; const cells = [...B.querySelectorAll('.se-cell')], c = S.tracks[j].clips[0], on = cells.map((x, i) => x.classList.contains('on') ? i : -1).filter(i => i >= 0);
    const want = c.notes.filter(n => n.t < dBarB(c)).map(n => Math.round(n.t / .25)).sort((a, b) => a - b);
    const sh = EL.rollSheet.getBoundingClientRect(), r0 = cells[0].getBoundingClientRect(), pb = [...B.querySelectorAll('.lacts button')].map(x => x.getBoundingClientRect());
    return {cells: cells.length, on: on.join(), want: want.join(), roll: !!ED.roll, piano: !!EL.rollSheet.querySelector('.pr-grid, canvas.pr'), cw: Math.round(r0.width), ch: Math.round(r0.height), sheetIn: sh.bottom <= innerHeight + .5 && sh.right <= innerWidth + .5, pb: pb.map(q => Math.round(q.height)), tabs: B.querySelectorAll('.se-tabs button').length}; }, j);
  ok(tag + ': Clip der Einzelspur öffnet den Drum-Schritt-Editor ihrer Pad-Zeile (keine Klaviatur)', v && v.cells === 16 && v.on === v.want && !v.roll && v.tabs === 7, v);
  ok(tag + ': Schritt-Zellen groß genug (≥ 40 px), Blatt im Bild', v && v.cw >= 40 && v.ch >= 40 && v.sheetIn, v && {cw: v.cw, ch: v.ch});
  await p.screenshot({path: dir + '/mtx3b-einzelspur-schritte-' + w + 'x' + h + '.png'});
  // leeren Schritt antippen → Schlag des Pads; ↶ nimmt ihn weg
  const free = await p.evaluate(j => { const c = S.tracks[j].clips[0], used = new Set(c.notes.map(n => Math.round(n.t / .25) % 16)); for (let i = 0; i < 16; i++) if (!used.has(i)) return i; return -1; }, j);
  const n0 = await p.evaluate(j => S.tracks[j].clips[0].notes.length, j);
  let q = await R_(p, i => EL.rollSheet.querySelectorAll('.mtx3bd .se-cell')[i], free); if (q) await T.tap(q.cx, q.cy);
  const t1 = await p.evaluate(([j, i]) => { const c = S.tracks[j].clips[0], n = c.notes.find(x => Math.abs(x.t - i * .25) < 1e-6); return {n: c.notes.length, gm: n ? n.n : null, d: n ? n.d : null, on: EL.rollSheet.querySelectorAll('.mtx3bd .se-cell')[i].classList.contains('on')}; }, [j, free]);
  ok(tag + ': Tipp auf leeren Schritt = Schlag des Pads (GM 42, 0,1)', t1.n === n0 + 1 && t1.gm === 42 && t1.d === .1 && t1.on, t1);
  q = await R_(p, () => [...EL.rollSheet.querySelectorAll('.mtx3bd .lbar button')].find(b => b.textContent === '↶')); if (q) await T.tap(q.cx, q.cy); await sleep(200);
  ok(tag + ': ↶ in der Leiste nimmt den Schritt zurück', (await p.evaluate(j => S.tracks[j].clips[0].notes.length, j)) === n0);
  // CHANCE: Reiter + Spur-Streifen ziehen
  q = await R_(p, () => EL.rollSheet.querySelector('.mtx3bd .se-tabs button[data-lane="prob"]')); if (q) await T.tap(q.cx, q.cy);
  const on0 = await p.evaluate(j => { const c = S.tracks[j].clips[0], i = Math.round(c.notes[0].t / .25); return i; }, j);
  const lb = await R_(p, i => EL.rollSheet.querySelectorAll('.mtx3bd .se-bar')[i], on0);
  if (lb) await T.drag(lb.cx, lb.y + 2, lb.cx, lb.y + lb.h * .5, 6);
  const pr = await p.evaluate(j => S.tracks[j].clips[0].notes[0].p, j);
  ok(tag + ': CHANCE-Spur ziehen setzt die Chance des Schritts (wie DRUMS)', pr != null && pr < 1 && pr > .05, pr);
  // ROLLE ↔ SCHRITTE
  q = await R_(p, () => [...EL.rollSheet.querySelectorAll('.mtx3bd .lview button')].find(b => b.textContent === 'ROLLE')); if (q) await T.tap(q.cx, q.cy); await sleep(500);
  const rl = await p.evaluate(() => ({roll: !!ED.roll, back: !!(ED.laufBtn && ED.laufBtn.textContent === 'SCHRITTE')}));
  ok(tag + ': [ROLLE] zeigt die Klavierrolle, dort [SCHRITTE] statt [LAUF]', rl.roll && rl.back, rl);
  q = await R_(p, () => ED.laufBtn); if (q) await T.tap(q.cx, q.cy); await sleep(500);
  ok(tag + ': [SCHRITTE] zurück zum Drum-Schritt-Editor', await p.evaluate(() => !!EL.rollSheet.querySelector('.mtx3bd') && !ED.roll));
  // Lauflicht beim Spielen
  await p.evaluate(() => { launchScene(0); play(); }); await sleep(1200);
  const ph = await p.evaluate(() => EL.rollSheet.querySelectorAll('.mtx3bd .se-cell.ph').length);
  await p.evaluate(() => stop());
  ok(tag + ': Lauflicht im Schritt-Editor der Einzelspur', ph === 1, ph);
  ok(tag + ': keine Konsolenfehler', errs.length === 0, errs.slice(0, 3));
  await ctx.close();
}
await b.close();
const bad = res.filter(x => !x.ok);
console.log('\nERGEBNIS ' + (res.length - bad.length) + '/' + res.length + (bad.length ? ' – offen: ' + bad.map(x => x.name).join(' | ') : ' – alles OK'));
process.exit(bad.length ? 1 : 0);
