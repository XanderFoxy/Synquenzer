// MTX3c – Einzelspuren-Rest: Begleiter live/Aufnahme über die Einzelspuren, FANG + Melodie-Spur = Pad-Note, kein ECO-Klang im
// Klang-Editor, Stil-Muster (Song + Matrix) in einer Szene ohne Einzelspur-Clip. Messungen je Fassung (neu ↔ basis).
// Aufruf: node mtx3c-test.mjs <index.html> <fotoordner> [basis.html]   (absolute Pfade). Touch über CDP, 428×926 / 926×428 / 926×370.
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const file = process.argv[2], dir = process.argv[3], basis = process.argv[4] || null;
if (!file || !dir) { console.log('Aufruf: node mtx3c-test.mjs <index.html> <fotoordner> [basis.html]'); process.exit(2); }
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const res = []; const ok = (name, cond, info) => { res.push({name, ok: !!cond}); console.log((cond ? 'OK     ' : 'FEHLER ') + name + (info !== undefined ? ' · ' + JSON.stringify(info) : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function open(w, h, f) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + (f || file)); await p.waitForTimeout(1600);
  await p.evaluate(() => {
    window.__W = ms => new Promise(r => setTimeout(r, ms));
    window.__until = async (bt, ms) => { const t0 = performance.now(); while (performance.now() - t0 < (ms || 40000)) { if (R.playing && AU.ctx && audBeat() >= bt) return true; await __W(8); } return false; };
    window.__chord = async (ns, hold) => { ns.forEach((n, k) => inputDown(n, 'bk' + k, .8)); await __W(hold || 90); ns.forEach((n, k) => inputUp('bk' + k)); };
    window.__pads = () => { const song = S.song, L = barBeat(song.bars), per = {}, at = new Map();
      for (let i = 0; i < NT(); i++) { const tr = S.tracks[i]; if (!tr || !(isDrum(i) || tr.dvx)) continue;
        int54MidiClips(song, i, tr, L, () => null, false, (st, en, pp) => { const id = (DRUM_BY_GM[pp] || DRUM_BY_GM[mapV1Drum(pp)] || {}).id || pp; (per[id] || (per[id] = {}))[i] = (per[id][i] || 0) + 1; const k = Math.round(st * 8) + ':' + id; if (!at.has(k)) at.set(k, new Set()); at.get(k).add(i); }); }
      let dbl = 0; for (const s of at.values()) if (s.size > 1) dbl++;
      const sum = {}; for (const id in per) sum[id] = Object.values(per[id]).reduce((a, x) => a + x, 0);
      return {per, sum, dbl}; };
    window.__clipPads = s => [DRUM_T].concat(S.tracks.map((x, j) => j).filter(j => S.tracks[j].dvx)).map(t => { const c = S.tracks[t].clips[s]; return t + ':' + (c ? [...new Set(c.notes.map(n => (DRUM_BY_GM[n.n] || {}).id))].sort().join('/') : '-'); }).join(' ');
    window.__only = () => { for (let i = 0; i < NT(); i++) if (i !== DRUM_T) S.tracks[i].clips = S.tracks[i].clips.map(() => null); };
    window.__noHH1 = () => { const c = S.tracks[DRUM_T].clips[1]; if (c) c.notes = c.notes.filter(n => n.n !== 42); };   // Szene 2 ohne HH ZU: dort hat die Einzelspur keinen Clip
    window.__R = async () => { ensureAudio(); drumBufs(); const MR = Math.random; Math.random = () => .3125; try { VV.cancel = false; const r = await vvRenderAudio({range: {a: 0, b: S.song.bars, sel: false}}); return {L: Float32Array.from(r.ch[0]), R: Float32Array.from(r.ch[1] || r.ch[0])}; } finally { Math.random = MR; } };
    window.__db = (X, Y) => { let e = 0, d = 0; const n = Math.min(X.L.length, Y.L.length); for (const c of ['L', 'R']) for (let k = 0; k < n; k++) { e += X[c][k] * X[c][k]; const q = X[c][k] - Y[c][k]; d += q * q; } return Math.round(10 * Math.log10((d + 1e-30) / (e + 1e-30)) * 10) / 10; };
  });
  const cdp = await ctx.newCDPSession(p);
  const T = {
    async down(x, y) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id: 1}]}); },
    async up() { await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); },
    async tap(x, y) { await this.down(x, y); await sleep(60); await this.up(); await sleep(250); },
  };
  return {ctx, p, errs, T};
}
const R_ = (p, sel) => p.evaluate(s => { const e = typeof s === 'string' ? document.querySelector(s) : null; if (!e || !e.getClientRects().length) return null; const r = e.getBoundingClientRect(); return {cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: r.width, h: r.height}; }, sel);

// ======================= 1 · Stil-Muster in einer Szene ohne Einzelspur-Clip (Song-Remix, A/B, Matrix) – neu ↔ basis =======================
async function remixRun(f) {
  const {ctx, p, errs} = await open(428, 926, f);
  const r = await p.evaluate(async () => {
    const o = {}; __only(); __noHH1(); SYNQUENZER.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]);
    // Bezug ohne Aufteilen
    SYNQUENZER.gr2.remix('italo', {k: 100, art: 'm'}); o.ref = __pads(); const A = await __R(); undo();
    o.split = SYNQUENZER.mtx3.split(); o.hh = o.split.find(j => S.tracks[j].dvx.v === 'hatC'); o.hhClips = S.tracks[o.hh].clips.map(c => !!c);
    o.p1 = __pads();
    const u0 = UNDO.length, t0 = performance.now();
    SYNQUENZER.gr2.remix('italo', {k: 100, art: 'm'}); o.ms = Math.round(performance.now() - t0); o.m = __pads(); o.undoN = UNDO.length - u0;
    const B = await __R(); o.db = __db(A, B);
    o.hhVer = Object.values(S.song.own || {}).filter(c => c && c.from && c.from.t === o.hh).map(c => ({s: c.from.s, v: c.ver, n: c.notes.length, pads: [...new Set(c.notes.map(n => n.n))].join('/'), seed: c.seed, gr: c.gr && c.gr.s}));
    gr2AB('a', 0, S.song.bars, 'italo'); o.a = __pads();
    gr2AB('b', 0, S.song.bars, 'italo'); o.b = __pads();
    // Zusammenführen nach dem Remix: die Version von HH ZU in Szene 2 kommt zurück nach DRUMS (Treffer je Pad gleich, Summe gleich)
    const C = await __R(); SYNQUENZER.mtx3.merge(); o.mg = __pads(); o.mgLeft = S.tracks.filter(t => t && t.dvx).length; const D = await __R(); o.mgDb = __db(C, D); undo(); o.mgBack = __pads();
    undo(); undo(); undo(); o.back = __pads();
    // Matrix-Remix der Szene 2 (dort kein HH-ZU-Clip) → neue Szene
    const mx = SYNQUENZER.gen3.mxRemix('italo', {src: 1, k: 100, art: 'm'}); o.mx = mx && mx.dst; o.mxc = mx && mx.dst != null ? __clipPads(mx.dst) : null;
    o.mxSeed = mx && mx.dst != null && S.tracks[o.hh].clips[mx.dst] ? S.tracks[o.hh].clips[mx.dst].seed === S.tracks[DRUM_T].clips[mx.dst].seed : null;
    undo(); o.mxBack = mx && mx.dst != null ? __clipPads(mx.dst) : null;
    return o;
  });
  await ctx.close(); return {r, errs};
}
{
  const N = await remixRun(file), B0 = basis ? await remixRun(basis) : null, r = N.r;
  const hhOn = x => (x.per.hatC || {});
  console.log('  Bezug ohne Aufteilen (Treffer je Pad): ' + JSON.stringify(r.ref.sum) + ' · HH ZU = Spur ' + r.hh + ' · Clips je Szene ' + JSON.stringify(r.hhClips));
  if (B0) console.log('  Basis 4.70.0: Stil-Muster HH je Spur ' + JSON.stringify(hhOn(B0.r.m)) + ' (DRUMS = 4) · Matrix ' + B0.r.mxc);
  ok('Stil-Muster: Szene 2 ohne HH-ZU-Clip – HH landet auf HH ZU, nicht auf DRUMS', !hhOn(r.m)[4] && hhOn(r.m)[r.hh] === r.ref.sum.hatC, {hatC: hhOn(r.m), bezug: r.ref.sum.hatC});
  ok('Stil-Muster: Treffer je Pad = ohne Aufteilen, 0 Doppel', Object.keys(r.ref.sum).every(k => r.m.sum[k] === r.ref.sum[k]) && r.m.dbl === 0, {mit: r.m.sum, ohne: r.ref.sum, dbl: r.m.dbl});
  ok('Stil-Muster: Summen-Audio = ohne Aufteilen (≤ −60 dB)', r.db <= -60, r.db + ' dB');
  ok('Stil-Muster: Version der Einzelspur in Szene 2 (nur HH, Stil italo), ein ↶', r.hhVer.some(v => v.s === 1 && v.pads === '42' && v.gr === 'italo') && r.undoN === 1, {ver: r.hhVer, undo: r.undoN});
  ok('A/B: A = Original (HH wie aufgeteilt), B = Remix wieder ganz', JSON.stringify(r.a.sum) === JSON.stringify(r.p1.sum) && JSON.stringify(r.b.per) === JSON.stringify(r.m.per), {a: r.a.sum, p1: r.p1.sum, b: hhOn(r.b)});
  ok('↶ holt den Stand vor dem Remix zurück', JSON.stringify(r.back.per) === JSON.stringify(r.p1.per), {back: r.back.sum});
  ok('Matrix-Remix aus Szene 2: HH in einem Clip von HH ZU (Saat wie DRUMS), DRUMS ohne HH; ↶ leert ihn', r.mxc && !/^4:[^ ]*hatC/.test(r.mxc) && new RegExp(r.hh + ':hatC').test(r.mxc) && r.mxSeed === true && new RegExp(r.hh + ':-').test(r.mxBack), {c: r.mxc, back: r.mxBack});
  ok('Zusammenführen nach dem Remix: HH zurück auf DRUMS, Treffer je Pad gleich, Summe gleich (≤ −60 dB), ↶ wieder aufgeteilt', r.mgLeft === 0 && (r.mg.per.hatC || {})[4] === r.ref.sum.hatC && Object.keys(r.ref.sum).every(k => r.mg.sum[k] === r.ref.sum[k]) && r.mgDb <= -60 && JSON.stringify(r.mgBack.per) === JSON.stringify(r.m.per), {hatC: r.mg.per.hatC, db: r.mgDb});
  console.log('  Zeit Remix (Song, 4 Takte): ' + r.ms + ' ms');
  ok('Remix: keine Konsolenfehler', N.errs.length === 0, N.errs.slice(0, 3));
  if (B0) ok('Basis-Bezug: in 4.70.0 blieb das HH dort auf DRUMS (Befund nachgestellt)', (hhOn(B0.r.m)[4] || 0) > 0, hhOn(B0.r.m));
}

// ======================= 2 · Begleiter live + Aufnahme über die Einzelspuren (428×926) =======================
async function begRun(f) {
  const {ctx, p, errs} = await open(428, 926, f);
  const r = await p.evaluate(async () => {
    const o = {}; ensureAudio(); await __W(400); SYNQUENZER.setBpm(150);
    const B = SYNQUENZER.beg1; B.open(); await __W(300); const pd = () => JSON.stringify(B.pattern().m.dr); o.pat0 = pd(); B.close(); await __W(200);
    o.split = SYNQUENZER.mtx3.split(); o.hh = o.split.find(j => S.tracks[j].dvx.v === 'hatC');
    B.open(); await __W(300); o.tg = B.state().tg; o.pat1 = pd(); clearLog();
    await __chord([60, 64, 67]); await __W(250);
    await __until(8.05);
    const L = noteLog(4096).filter(e => e.beat != null && e.beat < 8);
    o.by = {}; for (const e of L) { const k = e.track + ':' + e.src + ':' + (e.track === DRUM_T || S.tracks[e.track].dvx ? e.out : 'n'); o.by[k] = (o.by[k] || 0) + 1; }
    o.hhBeg = L.filter(e => e.src === 'beg' && e.out === 42).map(e => e.track);
    o.hhClip = L.filter(e => e.src !== 'beg' && e.track === o.hh).length;
    SYNQUENZER.stop(); await __W(500);
    o.left = HITS.filter(h => !h.dead && h.b3c).length;
    // ● Aufnahme der Band → neue Szene: HH in einem Clip von HH ZU, DRUMS ohne HH; ein ↶
    B.rec(); await __chord([60, 64, 67]); await __W(200); await __until(5.0); B.rec(); await __until(8.4); SYNQUENZER.stop(); await __W(500);
    const sc = B.state().last ? B.state().last.scene : -1; o.rec = {sc, pads: sc >= 0 ? __clipPads(sc) : null};
    if (sc >= 0) { undo(); o.rec.back = __clipPads(sc); }
    // „nur die Band“, dann Drum-Ziel „aus“: HH ZU wird still wie DRUMS
    launchScene(0); await __until(2); B.close(); await __W(300); SYNQUENZER.stop(); await __W(300);
    B.open(); await __W(200); await __chord([60, 64, 67]); await __W(250); await __until(2.2);
    o.keep = {drums: R.slot[DRUM_T], hh: R.slot[o.hh]};
    BEG1.tgo.dr = -1; beg1TgSync(true); await __W(100); o.off = {drums: R.slot[DRUM_T], hh: R.slot[o.hh]};
    SYNQUENZER.stop(); await __W(300); BEG1.tgo.dr = undefined; delete BEG1.tgo.dr; B.close();
    return o;
  });
  await ctx.close(); return {r, errs};
}
{
  const N = await begRun(file), B0 = basis ? await begRun(basis) : null, r = N.r;
  const cnt = (a, t) => a.filter(x => x === t).length;
  if (B0) console.log('  Basis 4.70.0: Band-HH auf Spur ' + JSON.stringify({drums: cnt(B0.r.hhBeg, 4), hh: cnt(B0.r.hhBeg, B0.r.hh)}));
  ok('Begleiter live: Band-HH über den Kanal von HH ZU (DRUMS 0)', r.hhBeg.length >= 8 && cnt(r.hhBeg, r.hh) === r.hhBeg.length, {hh: cnt(r.hhBeg, r.hh), drums: cnt(r.hhBeg, 4), tg: r.tg});
  ok('Begleiter live: gleich viele Band-HH wie in der Basis (nur der Kanal anders)', !B0 || B0.r.hhBeg.length === r.hhBeg.length, {neu: r.hhBeg.length, basis: B0 && B0.r.hhBeg.length});
  if (B0) console.log('  Basis 4.70.0: Band-Muster der Drums nach dem Aufteilen ' + (B0.r.pat0 === B0.r.pat1 ? 'gleich' : 'anders (Ersatz-Pads)'));
  ok('Begleiter: Band-Muster der Drums nach dem Aufteilen = vorher (Pads des Kits inkl. Einzelspuren)', r.pat0 === r.pat1, r.pat0 === r.pat1 ? 'gleich' : {vor: r.pat0.slice(0, 120), nach: r.pat1.slice(0, 120)});
  ok('Begleiter live: der eigene Clip von HH ZU schweigt in der Band (kein Doppel)', r.hhClip === 0, r.hhClip);
  ok('Begleiter: nach ■ keine geplanten Band-Schläge übrig', r.left === 0, r.left);
  ok('Begleiter ● Aufnahme: HH in einem Clip von HH ZU (neue Szene), DRUMS dort ohne HH; ↶ leert beide', r.rec.pads && new RegExp(r.hh + ':hatC').test(r.rec.pads) && !/^4:[^ ]*hatC/.test(r.rec.pads) && /^4:- /.test(r.rec.back || '') && new RegExp(r.hh + ':-').test(r.rec.back || ''), r.rec);
  ok('„Nur die Band“ behält HH ZU mit DRUMS; Drum-Ziel aus → HH ZU still wie DRUMS', r.keep.drums >= 0 && r.keep.hh === r.keep.drums && r.off.drums === -1 && r.off.hh === -1, {keep: r.keep, aus: r.off});
  ok('Begleiter: keine Konsolenfehler', N.errs.length === 0, N.errs.slice(0, 3));
}

// ======================= 3 · FANG + Melodie-Spur auf einer Einzelspur (428×926) =======================
async function fangRun(f) {
  const {ctx, p, errs} = await open(428, 926, f);
  const r = await p.evaluate(async () => {
    const o = {}; ensureAudio(); await __W(400);
    o.split = SYNQUENZER.mtx3.split(); const j = o.hh = o.split.find(x => S.tracks[x].dvx.v === 'hatC');
    selectTrack(j); launchScene(0); await __until(1);
    for (const q of [1, 1.5, 2, 2.5]) { await __until(4 + q); inputDown(60, 'k1', .8); inputDown(64, 'k2', .6); await __W(60); inputUp('k1'); inputUp('k2'); }
    await __until(7.5); R.selS = 2; const fo = capture(); const fc = S.tracks[j].clips.find((c, s) => c && s >= 1);
    o.fang = {ok: fo, n: fc ? fc.notes.length : 0, pads: fc ? [...new Set(fc.notes.map(n => n.n))].join('/') : '', d: fc ? [...new Set(fc.notes.map(n => n.d))].join('/') : '', seed: fc ? typeof fc.seed : null};
    SYNQUENZER.stop(); await __W(400);
    // Melodie-Spur: [● MEL.] während der Song spielt
    SYNQUENZER.songFromChain([{scene: 0, bars: 4}]); setMelodyTrack(j); songPlayStart(0); await __until(1); melRecStart();
    for (const q of [1, 2, 3]) { await __until(4 + q); inputDown(62, 'm1', .9); inputDown(65, 'm2', .5); await __W(80); inputUp('m1'); inputUp('m2'); }
    await __until(8); melRecEnd(); const m = curMel(S.song);
    o.mel = {n: m.notes.length, pads: [...new Set(m.notes.map(x => x.n))].join('/'), d: [...new Set(m.notes.map(x => x.d))].join('/')};
    SYNQUENZER.stop(); await __W(300);
    return o;
  });
  await ctx.close(); return {r, errs};
}
{
  const N = await fangRun(file), B0 = basis ? await fangRun(basis) : null, r = N.r;
  if (B0) console.log('  Basis 4.70.0: FANG ' + JSON.stringify(B0.r.fang) + ' · Melodie ' + JSON.stringify(B0.r.mel));
  ok('FANG auf HH ZU: Schläge des Pads (GM 42, Schritt 0,1, ein Schlag je Stelle, Saat)', r.fang.ok && r.fang.n === 4 && r.fang.pads === '42' && r.fang.d === '0.1' && r.fang.seed === 'number', r.fang);
  ok('Melodie-Spur HH ZU ([● MEL.]): Pad-Note 42, Schritt 0,1, ein Schlag je Stelle', r.mel.n === 3 && r.mel.pads === '42' && r.mel.d === '0.1', r.mel);
  ok('FANG / Melodie: keine Konsolenfehler', N.errs.length === 0, N.errs.slice(0, 3));
}

// ======================= 4 · Klang-Editor einer Einzelspur: kein ECO-Klang (3 Größen, Touch auf den Engine-Knopf) =======================
for (const [w, h] of [[428, 926], [926, 428], [926, 370]]) {
  const {ctx, p, errs, T} = await open(w, h);
  await p.evaluate(async () => { ensureAudio(); await __W(500); const sp = SYNQUENZER.mtx3.split(); const j = sp.find(x => S.tracks[x].dvx.v === 'hatC'); selectTrack(j); openEditor(); await __W(700); });
  const st = await p.evaluate(() => ({eco: ED.eco ? !ED.eco.hidden : null, cls: ED.ecoB ? ED.ecoB.classList.contains('eco') : null, te: trackEco(R.selT), syn: !!AU.synth[R.selT], ed: R.editor, va: SynthHost.state}));
  const bt = await p.evaluate(() => { const e = ED.ecoB; if (!e || !e.getClientRects().length) return null; const r = e.getBoundingClientRect(); return {cx: r.left + r.width / 2, cy: r.top + r.height / 2, h: r.height}; });
  if (bt) await T.tap(bt.cx, bt.cy);
  const lcd = await p.evaluate(() => { const l = document.querySelector('.lcd, #lcd'); return l ? (l.textContent || '').slice(0, 60) : ''; });
  await p.screenshot({path: dir + '/mtx3c-klang-editor-' + w + 'x' + h + '.png'});
  ok(w + '×' + h + ': Klang-Editor HH ZU ohne ECO-Klang (Schild aus, VA-Knopf ohne ECO, kein ECO-Hinweis nach Tipp)', st.ed === 'synth' && st.eco === false && st.cls === false && st.te === false && !/ECO/.test(lcd), Object.assign(st, {lcd, btn: bt && Math.round(bt.h)}));
  ok(w + '×' + h + ': keine Konsolenfehler', errs.length === 0, errs.slice(0, 3));
  await ctx.close();
}
if (basis) {
  const {ctx, p} = await open(428, 926, basis);
  const st = await p.evaluate(async () => { ensureAudio(); await __W(500); const sp = SYNQUENZER.mtx3.split(); const j = sp.find(x => S.tracks[x].dvx.v === 'hatC'); selectTrack(j); openEditor(); await __W(700); return {eco: ED.eco ? !ED.eco.hidden : null, te: trackEco(R.selT)}; });
  console.log('  Basis 4.70.0: Klang-Editor HH ZU ' + JSON.stringify(st));
  await ctx.close();
}

await b.close();
const nOk = res.filter(x => x.ok).length;
console.log('\nMTX3C: ' + nOk + '/' + res.length + (nOk === res.length ? ' ALLE OK' : ' – FEHLER'));
process.exit(nOk === res.length ? 0 : 1);
