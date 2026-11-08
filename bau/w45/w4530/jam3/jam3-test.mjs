// JAM3-Test: Perform-Spur im Song (Mitschnitt von Stottern, Filter-Fahrt, Gruppen-Stumm, Blende A↔B → song.pf; Wiedergabe, Video-Ton, MIDI,
// ↶, Speichern/Laden, Zeile PERFORM mit Block-Menü per Finger) und Rückung mit ⇅-festen Spuren (Wiedergabe, MIDI, Song transponieren, 4.52.0).
// Abschnitt 7 (JAM3-P): die Befunde 1–7 der Prüfung (Rückung beim Verschieben/Kopieren, Blöcke beim Takte-Bearbeiten, ↶ während ▶,
// 4.52-Dateien, PERFORM-Mitschnitt über einen fertigen Song per Finger, zwei Bahnen bei 926×370, Einhänge-Zeilen).
// Gemessen wird am Perform-Prozessor selbst: jedes angewandte Ereignis meldet seinen Frame (live, ▶ SONG, Offline-Render des Videos);
// Gruppen-Rampen (jam2Ramp) und Blende (v6a an den Morph-Kern) werden mit ihrer Zeit mitgeschrieben. Touch per CDP (hochkant und quer).
// Aufruf: node jam3-test.mjs <index.html> <ordner>   (absolute Pfade; Basis = ../basis.html neben dem Ordner der index.html; Fotos in <ordner>/fotos)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import path from 'node:path';
import fs from 'node:fs';
const file = path.resolve(process.argv[2]), out = path.resolve(process.argv[3] || path.dirname(file));
const basis = path.resolve(path.dirname(file), '..', 'basis.html');
const fotos = path.basename(out) === 'fotos' ? out : path.join(out, 'fotos');
fs.mkdirSync(fotos, {recursive: true});
let bad = 0, all = 0;
const ok = (c, m, d) => { all++; if (c) console.log('OK ' + m + (d ? ' – ' + d : '')); else { bad++; console.log('FEHLER ' + m + (d ? ' – ' + d : '')); } };
const info = (m, d) => console.log('INFO ' + m + (d ? ' – ' + d : ''));
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const errs = [];
async function page(w, h, f) {
  const p = await b.newPage({viewport: {width: w, height: h}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + (f || file)); await p.waitForTimeout(1600);
  p.cdp = await p.context().newCDPSession(p);
  return p;
}
const tDown = (p, x, y) => p.cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id: 1, radiusX: 4, radiusY: 4, force: 1}]});
const tMove = (p, x, y) => p.cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x, y, id: 1, radiusX: 4, radiusY: 4, force: 1}]});
const tUp = p => p.cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
const ctr = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, l: r.left, t: r.top}; }, sel);
async function tap(p, x, y) { await tDown(p, x, y); await p.waitForTimeout(60); await tUp(p); await p.waitForTimeout(250); }
async function tapSel(p, sel) { const c = await ctr(p, sel); if (!c) return false; await tap(p, c.x, c.y); return true; }
const run = (p, fn, arg) => p.evaluate('(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)); const songEnd = async (sb, ms) => { const t0 = performance.now(); while (performance.now() - t0 < (ms || 14000)) { if (!R.songPlay || !R.playing) return true; const b = songBeatOf(audBeat()); if (b != null && b >= sb) return true; await wait(40); } return false; }; return (' + fn.toString() + ')(' + JSON.stringify(arg == null ? null : arg) + '); })()');
// MIDI-Datei → Noten {ch, b (Schlag), n, v}
const MIDI = `window.__midi = by => { let o = 14; const div = (by[12] << 8) | by[13], notes = [];
  while (o < by.length) { const len = (by[o + 4] << 24) | (by[o + 5] << 16) | (by[o + 6] << 8) | by[o + 7]; let p = o + 8, end = p + len, tk = 0, rs = 0;
    while (p < end) { let d = 0, c; do { c = by[p++]; d = (d << 7) | (c & 127); } while (c & 128); tk += d; let st = by[p]; if (st & 128) p++; else st = rs;
      if (st === 0xFF) { p++; let l = 0; do { c = by[p++]; l = (l << 7) | (c & 127); } while (c & 128); p += l; continue; }
      if (st === 0xF0 || st === 0xF7) { let l = 0; do { c = by[p++]; l = (l << 7) | (c & 127); } while (c & 128); p += l; continue; }
      rs = st; const hi = st & 0xF0, ch = st & 15, a = by[p++], b2 = hi === 0xC0 || hi === 0xD0 ? 0 : by[p++]; if (hi === 0x90 && b2 > 0) notes.push({ch, b: tk / div, n: a, v: b2}); }
    o = end; }
  return notes; };`;
// der Song für die Perform-Tests: 4 Teile à 2 Takte (240 BPM = 1 s je Takt), Spur 3 hat in Szene 2 einen ◆ (Cutoff / 6) – B für die Blende
const SETUP = async () => {
  SYNQUENZER.setBpm(240);
  const t = 2, tr = S.tracks[t]; SYNQUENZER.st.set(t, 1, {eng: tr.sound.engine, p: {cutoff: tr.sound.p.cutoff / 6}});
  songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}, {scene: 0, bars: 2}, {scene: 1, bars: 2}]); songChanged();
  return {t, c0: tr.sound.p.cutoff};
};
try {
  /* ---------- 1 Ohne Perform-Daten: Song-Ansicht pixelgleich zur Basis (hochkant, quer), Datenfeld fehlt ---------- */
  for (const [w, h, n] of [[428, 926, 'hochkant'], [926, 428, 'quer']]) {
    const shot = async f => { const q = await page(w, h, f); await run(q, SETUP); await run(q, async () => { setSongView(true); await wait(600); }); const s = await q.screenshot(); const has = await run(q, () => ({pf: 'pf' in S.song, lab: !!document.querySelector('.sv-l.j3-pl'), rows: svLayoutInfo().rowH})); await q.close(); return {s, has}; };
    const A = await shot(basis), B = await shot();
    ok(Buffer.compare(A.s, B.s) === 0 && !B.has.pf && !B.has.lab, 'Song ohne Perform-Daten: Bild pixelgleich zur Basis, kein Feld song.pf, keine Zeile PERFORM (' + n + ' ' + w + '×' + h + ')', 'Zeilenhöhe ' + B.has.rows + ' px');
  }

  /* ---------- 2 Mitschnitt mit allen vier Perform-Arten (● über den Song, Leiste offen), dann ▶ SONG und Video-Ton ---------- */
  const P = await page(428, 926);
  await run(P, SETUP);
  await run(P, async () => {
    ensureAudio(); await wait(400); SYNQUENZER.jam2.open(); await wait(900);
    window.__vl = []; const E = AU.synth[2], o0 = E.v6a; E.v6a = o => { if (o && o.t0 != null && o.k && o.k.includes('cutoff')) window.__vl.push([o.t0, o.v[o.k.indexOf('cutoff')]]); return o0(o); };
    window.__rl = []; const r0 = jam2Ramp; window.jam2Ramp = (Pm, v, tt) => { window.__rl.push([v, tt]); return r0(Pm, v, tt); };
  });
  const REC = await run(P, async () => {
    const J = SYNQUENZER.jam2, J3 = SYNQUENZER.jam3, o = {u0: UNDO.length, before: songSnapshot()};
    songRecStart({targets: {clips: true}, from: 0, preroll: false}); await wait(60);
    o.T = {st: R.startTime, off: R.songPlay.off, spb: spb(), sr: AU.ctx.sampleRate};
    o.recOn = J3.recOn();
    await wait(700); o.red = document.getElementById('jam2Bar').classList.contains('j3rec'); J.st(.25); await wait(520); J.stUp(.25);                                      // Stottern 1/16
    await wait(200); for (const x of [-.25, -.5, -.75, -.95]) { J.flt(x); await wait(70); } await wait(250); J.fltRel();   // Filter-Fahrt (Tiefpass)
    J.tap('dr'); await wait(1400); J.tap('dr'); await wait(500);                                    // DRUMS aus am Takt, wieder an am Takt
    J.bSrc('s1'); J.blend(.5); await wait(320); J.blend(1); await wait(320); J.blendUp(); await wait(320); J.blend(0); await wait(60); J.blendUp();   // Blende A→B und zurück
    await wait(900);
    o.lg = await J3.log(); o.vl = window.__vl.splice(0); o.rl = window.__rl.splice(0); o.apLeft = J3.rec() ? J3.rec().ap : null;
    songRecEnd(); await wait(300);
    o.pf = J3.pf(); o.undo = UNDO.length - o.u0; o.label = UNDO.length ? UNDO[UNDO.length - 1].label : ''; o.toast = String(UI.lastToast || ''); o.after = songSnapshot();
    SYNQUENZER.stop(); await wait(600);
    return o;
  });
  await P.screenshot({path: path.join(fotos, 'jam3-aufnahme-ende-hochkant.png')});
  const kinds = (REC.pf || []).map(x => x.k).sort().join(',');
  ok(REC.recOn && REC.red, 'Während ● SONG: die Leiste schreibt mit (roter Rand oben = landet im Song, spätestens nach ½ s)');
  ok(kinds === 'ab,f,m,st', 'Mitschnitt: Stottern, Filter-Fahrt, DRUMS aus und Blende A→B stehen als Blöcke in song.pf', JSON.stringify((REC.pf || []).map(x => x.k + '@' + x.b.toFixed(3) + '+' + x.d.toFixed(3))));
  const st = (REC.pf || []).find(x => x.k === 'st'), fl = (REC.pf || []).find(x => x.k === 'f'), mu = (REC.pf || []).find(x => x.k === 'm'), ab = (REC.pf || []).find(x => x.k === 'ab');
  ok(st && st.u === .25 && Math.abs(st.s / .25 - Math.round(st.s / .25)) < 1e-9 && st.s <= st.b && mu && mu.g === 'dr' && mu.b % 4 === 0 && mu.d % 4 === 0 && fl && fl.c.length >= 4 && ab && ab.c.length >= 3,
    'Blöcke: Stottern 1/16 mit dem Stück im Raster, DRUMS aus von Taktstrich zu Taktstrich, Filter-Kurve, Blende-Kurve', 'Stück ab Schlag ' + (st && st.s) + ', stumm ' + (mu && mu.b + '–' + (mu.b + mu.d)) + ', ' + (fl && fl.c.length) + ' / ' + (ab && ab.c.length) + ' Punkte');
  ok(REC.undo === 1 && /PERFORM \d+ Bl/.test(REC.toast), 'Ein ↶-Schritt für den ganzen Mitschnitt (mit der Aufnahme), Meldung nennt PERFORM', REC.label + ' · ' + REC.toast);
  ok(REC.apLeft === 0, 'Jedes Ereignis hat seinen wirklichen Frame vom Prozessor bekommen (keine Meldung offen)');
  // ▶ SONG: dieselben Ereignisse an denselben Frames (Song-Schlag), dieselben Rampen, dieselbe Blende
  const PLAY = await run(P, async () => {
    const J3 = SYNQUENZER.jam3, n0 = ((await J3.log()) || []).length; window.__vl.length = 0; window.__rl.length = 0;
    songPlayFrom(0); await wait(40); const T = {st: R.startTime, off: R.songPlay.off, spb: spb(), sr: AU.ctx.sampleRate};
    await songEnd(31.95); await wait(150); const lg = await J3.log(); SYNQUENZER.stop(); await wait(500);
    return {T, lg: (lg || []).slice(n0), vl: window.__vl.splice(0), rl: window.__rl.splice(0), act: J3.act(), node: SYNQUENZER.jam2.state().node};
  });
  const sbF = (T, f) => f / T.sr / T.spb - T.st / T.spb - T.off, sbT = (T, t) => (t - T.st) / T.spb - T.off, fr = T => 1 / (T.sr * T.spb);
  const evs = (T, L, lim) => (L || []).map(e => ({k: e[0], sb: sbF(T, e[1]), v: e[2]})).filter(e => e.sb < (lim || 31.9));
  const A = evs(REC.T, REC.lg), Bp = evs(PLAY.T, PLAY.lg), tol = Math.max(fr(REC.T), fr(PLAY.T)) * 1.01;
  const same = (X, Y) => X.length === Y.length && X.every((e, i) => e.k === Y[i].k && Math.abs(e.sb - Y[i].sb) <= tol && (e.k === 1 || e.v === Y[i].v));
  ok(A.length >= 6 && same(A, Bp), '▶ SONG = Mitschnitt: Stottern an/aus und jeder Filter-Punkt am selben Frame im Song (±1 Frame), dieselben Werte', A.length + ' Ereignisse, größte Abweichung ' + Math.max(0, ...A.map((e, i) => Bp[i] ? Math.abs(e.sb - Bp[i].sb) * REC.T.spb * 1000 : 99)).toFixed(3) + ' ms');
  const rA = REC.rl.map(x => [x[0], +sbT(REC.T, x[1]).toFixed(5)]), rB = PLAY.rl.map(x => [x[0], +sbT(PLAY.T, x[1]).toFixed(5)]).filter(x => x[1] < 31.9);
  ok(rA.length === 2 && JSON.stringify(rA) === JSON.stringify(rB), '▶ SONG = Mitschnitt: DRUMS-Rampen auf denselben Song-Schlägen', JSON.stringify(rA) + ' │ ' + JSON.stringify(rB));
  const inAb = x => x[0] >= ab.b - 1e-3 && x[0] <= ab.b + ab.d + .5;
  const vA = REC.vl.map(x => [+sbT(REC.T, x[0]).toFixed(4), Math.round(x[1])]).filter(inAb), vB = PLAY.vl.map(x => [+sbT(PLAY.T, x[0]).toFixed(4), Math.round(x[1])]).filter(inAb);
  ok(vA.length >= 3 && JSON.stringify(vA) === JSON.stringify(vB), '▶ SONG = Mitschnitt: die Blende fährt den Morph-Kern zu denselben Zeiten auf dieselben Werte (Cutoff der Spur 3)', JSON.stringify(vA));
  ok(!PLAY.act && PLAY.node, '■: die Perform-Spur ist aus (der Prozessor bleibt, weil die Leiste offen ist)');
  // Video-Ton (Offline-Render, derselbe Weg): Ereignisse am selben Song-Schlag; gemessen gegen denselben Song ohne Perform-Spur. Der Render der
  // Basis ist nicht bitgleich (Rauschen und freie Phasen in den Worklets), darum Pegel/Höhen über Bereiche, Drums allein (VA1 „eine Spur“)
  // und die Selbstähnlichkeit im Stottern
  const VV = await run(P, async () => {
    const J3 = SYNQUENZER.jam3, dr = S.tracks.findIndex(t => t && t.kind === 'drum');
    const rend = async only => { VA1.only = only ? {tracks: new Set([dr])} : null; try { const r = await vvRenderAudio({range: {a: 0, b: S.song.bars}}); await wait(250); return {L: r.ch[0].slice(), sr: r.sr, last: J3.vvLast(), lead: r.lead || 0}; } finally { VA1.only = null; } };
    const a = await rend(), b2 = await rend(), d = await rend(true), pf = S.song.pf; delete S.song.pf; songChanged(); const c = await rend(), e = await rend(true); S.song.pf = pf; songChanged();
    const sp = spb(), sr = a.sr, ix = (X, sb) => Math.min(X.L.length, Math.round(X.lead * sr + sb * sp * sr));
    const rms = (X, s0, s1) => { const i0 = ix(X, s0), i1 = ix(X, s1); let q = 0; for (let i = i0; i < i1; i++) q += X.L[i] * X.L[i]; return Math.sqrt(q / Math.max(1, i1 - i0)) + 1e-9; };
    const hf = (X, s0, s1) => { const i0 = ix(X, s0), i1 = ix(X, s1); let q = 0; for (let i = i0 + 1; i < i1; i++) q += (X.L[i] - X.L[i - 1]) ** 2; return Math.sqrt(q / Math.max(1, i1 - i0)) + 1e-9; };
    const db = (f, X, Y, s0, s1) => +(20 * Math.log10(f(X, s0, s1) / f(Y, s0, s1))).toFixed(2);
    const st = pf.find(q => q.k === 'st'), fl = pf.find(q => q.k === 'f'), mu = pf.find(q => q.k === 'm'), ab = pf.find(q => q.k === 'ab'), endAll = Math.max(...pf.map(q => q.b + q.d));
    const Lf = Math.round(st.u * sp * sr), cor = (X, s0, s1) => { const i0 = ix(X, s0), n = ix(X, s1) - i0 - Lf; let q = 0, e1 = 0, e2 = 0; for (let i = i0; i < i0 + n; i++) { q += X.L[i] * X.L[i + Lf]; e1 += X.L[i] ** 2; e2 += X.L[i + Lf] ** 2; } return +(q / Math.sqrt(e1 * e2 + 1e-12)).toFixed(4); };
    const fA = fl.b + fl.c[fl.c.length - 1][0] + .25;
    return {log: a.last && a.last.log, log2: b2.last && b2.last.log, T: a.last && a.last.T, T2: b2.last && b2.last.T,
      out: {pre: [db(rms, a, c, 0, st.b - .25), db(hf, a, c, 0, st.b - .25)], post: [db(rms, a, c, endAll + 1, 31.5), db(hf, a, c, endAll + 1, 31.5)], span: [+(st.b - .25).toFixed(2), +(endAll + 1).toFixed(2)]},
      mute: db(rms, d, e, mu.b + .25, mu.b + mu.d), muteRef: [db(rms, d, e, 0, Math.min(st.b, mu.b) - .25)], flt: db(hf, a, c, fA, fl.b + fl.d), fltSpan: [+fA.toFixed(2), +(fl.b + fl.d).toFixed(2)],
      corA: cor(a, st.b + 2 * st.u, st.b + st.d - st.u), corC: cor(c, st.b + 2 * st.u, st.b + st.d - st.u)};
  });
  const Vv = VV.T ? evs(VV.T, VV.log) : [], Vv2 = VV.T2 ? evs(VV.T2, VV.log2) : [];
  ok(Vv.length >= 6 && same(A, Vv) && same(A, Vv2), 'Video-Ton (Offline-Render, zweimal): der Perform-Prozessor wendet jedes Ereignis am selben Song-Frame an wie live (±1 Frame)', Vv.length + ' Ereignisse');
  ok([...VV.out.pre, ...VV.out.post].every(x => Math.abs(x) < 1), 'Video-Ton vor und nach den Blöcken: Pegel und Höhen wie ohne Perform-Spur (± 1 dB)', 'vor Schlag ' + VV.out.span[0] + ': ' + VV.out.pre.join(' / ') + ' dB, ab Schlag ' + VV.out.span[1] + ': ' + VV.out.post.join(' / ') + ' dB');
  ok(VV.mute <= -20 && Math.abs(VV.muteRef[0]) < 1.5, 'Video-Ton, nur die Drum-Spur: im Block DRUMS aus still bis auf den Hall der Schläge davor (≥ 20 dB leiser als ohne Spur), davor gleich', 'im Block ' + VV.mute + ' dB, davor ' + VV.muteRef[0] + ' dB');
  ok(VV.flt <= -10, 'Video-Ton in der Filter-Fahrt (Tiefpass fast zu, Schlag ' + VV.fltSpan.join('–') + '): Höhen deutlich weniger als ohne Spur', VV.flt + ' dB');
  ok(VV.corA > .98 && VV.corC < .9, 'Video-Ton im Stottern 1/16: der Ton wiederholt sich genau im 1/16-Abstand (Korrelation), ohne Spur nicht', VV.corA + ' gegen ' + VV.corC);
  // MIDI: DRUMS aus = die Drum-Noten im Block fehlen; ohne Perform-Spur sind sie da
  const MD = await P.evaluate(MIDI + `; (() => { const m = buildMidi({mode: 'song'}); const pf = S.song.pf, x = pf.find(q => q.k === 'm'); const n1 = __midi(m.bytes).filter(q => q.ch === 9);
    delete S.song.pf; songChanged(); const n0 = __midi(buildMidi({mode: 'song'}).bytes).filter(q => q.ch === 9); const v1 = va1MidiSong(va1MidiTracks(), true), dv = v1 ? __midi(v1.bytes).filter(q => q.ch === 9) : []; S.song.pf = pf; songChanged();
    const v2 = va1MidiSong(va1MidiTracks(), true), dv2 = v2 ? __midi(v2.bytes).filter(q => q.ch === 9) : [];
    const inB = q => q.b >= x.b - 1e-6 && q.b < x.b + x.d - 1e-6; return {a: x.b, e: x.b + x.d, with: n1.filter(inB).length, without: n0.filter(inB).length, outW: n1.filter(q => !inB(q)).length, outO: n0.filter(q => !inB(q)).length, va: dv2.filter(inB).length, va0: dv.filter(inB).length}; })()`);
  ok(MD.without > 4 && MD.with === 0 && MD.outW === MD.outO && MD.va === 0 && MD.va0 === MD.without, 'MIDI (Song und je Spur): DRUMS aus = die Drum-Noten in Schlag ' + MD.a + '–' + MD.e + ' fehlen, sonst alles gleich', 'ohne Spur ' + MD.without + ' Schläge im Block, mit ' + MD.with + '; außerhalb ' + MD.outW + ' = ' + MD.outO);
  // ↶ / ↷ und Speichern/Laden
  const UR = await run(P, async () => {
    const pf = JSON.stringify(S.song.pf), o = {};
    undo(); await wait(100); o.a = {pf: 'pf' in S.song, row: !!document.querySelector('.sv-l.j3-pl')};
    redo(); await wait(100); o.b = JSON.stringify(S.song.pf) === pf;
    const j = serializeProject(); o.inFile = /"pf":\[/.test(j); applyProject(normalizeProject(JSON.parse(j)), {ui: true}); await wait(400);
    o.c = JSON.stringify(S.song.pf) === pf; o.j2 = serializeProject() === j;
    return o;
  });
  ok(!UR.a.pf && UR.b, '↶ nimmt den ganzen Mitschnitt zurück (song.pf weg), ↷ bringt ihn wieder');
  ok(UR.inFile && UR.c && UR.j2, 'Speichern/Laden: die Perform-Spur bleibt genau gleich (Datei byte-gleich nach dem Laden)');
  // Zeile PERFORM in der Song-Ansicht (hochkant): Blöcke lesbar, Foto
  await run(P, async () => { SYNQUENZER.jam2.close(); await wait(500); setSongView(true); await wait(600); });
  const ROW = await run(P, () => { const L = svLayoutInfo(), g = SYNQUENZER.jam3.geo(), lab = document.querySelector('.sv-l.j3-pl'), r = lab && lab.getBoundingClientRect(); return {L: {rowH: L.rowH, canvas: L.canvas}, g, lab: r ? {h: Math.round(r.height), t: lab.textContent, top: Math.round(r.top)} : null, names: S.song.pf.map(x => jam3Name(x))}; });
  await P.screenshot({path: path.join(fotos, 'jam3-song-perform-hochkant.png')});
  ok(ROW.g.pfH >= 16 && ROW.lab && ROW.lab.t === 'PERFORM' && ROW.g.geo.length === 4 && ROW.names.includes('Stottern 1/16') && ROW.names.includes('DRUMS aus') && ROW.names.includes('A→B') && ROW.names.includes('Filter'),
    'Song-Ansicht: schmale Zeile PERFORM unter MELODIE mit lesbaren Blöcken', 'Zeile ' + ROW.g.pfH + ' px (Spur-Zeilen ' + ROW.L.rowH + ' px), ' + ROW.names.join(' · '));

  /* ---------- 3 Block-Menü und Ziehen per Finger (hochkant, dann quer) ---------- */
  const blockAt = async (p, k) => run(p, k => { const pf = S.song.pf, j = pf.findIndex(x => x.k === k), g = SYNQUENZER.jam3.geo(), q = g.geo.find(z => z.j === j), c = svLayoutInfo().canvas; return q ? {j, x: c.x + (q.x0 + q.x1) / 2, y: c.y + (q.y0 + q.y1) / 2, w: q.x1 - q.x0, blk: pf[j]} : null; }, k);
  const menuInfo = p => p.evaluate(() => { const P_ = UI.pop && UI.pop.name === 'jam3pf' ? UI.pop.el : null; if (!P_) return null; const r = P_.getBoundingClientRect(), bs = [...P_.querySelectorAll('button')].map(x => { const q = x.getBoundingClientRect(); return {t: x.textContent.trim(), a: x.dataset.a, w: Math.round(q.width), h: Math.round(q.height), vis: q.width > 0 && q.bottom <= innerHeight + .5 && q.top >= -.5 && q.right <= innerWidth + .5}; }); return {r: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], bs}; });
  for (const [p, n] of [[P, 'hochkant']]) {
    const s0 = await blockAt(p, 'st');
    await tap(p, s0.x, s0.y);
    const m1 = await menuInfo(p);
    ok(m1 && ['del', 'len', 'val', 'x'].every(a => m1.bs.some(x => x.a === a && x.vis)) && m1.bs.every(x => x.w >= 44 && x.h >= 44), 'Tipp auf einen Block (' + n + '): Menü [Löschen] [Länge] [Wert] mit ✕, alle Tasten ≥ 44 px und im Bild', m1 ? m1.bs.map(x => x.t + ' ' + x.w + '×' + x.h).join(', ') : 'kein Menü');
    const u0 = await run(p, () => UNDO.length);
    const vb = m1.bs.find(x => x.a === 'val'), vc = await p.evaluate(() => { const b = UI.pop.el.querySelector('[data-a="val"]').getBoundingClientRect(); return {x: b.left + b.width / 2, y: b.top + b.height / 2}; });
    await tap(p, vc.x, vc.y);
    const m2 = await menuInfo(p);
    await p.screenshot({path: path.join(fotos, 'jam3-block-menue-wert-' + n + '.png')});
    const u8 = await p.evaluate(() => { const b = UI.pop.el.querySelector('[data-a="u"][data-v="0.5"]'); if (!b) return null; const q = b.getBoundingClientRect(); return {x: q.left + q.width / 2, y: q.top + q.height / 2}; });
    if (u8) await tap(p, u8.x, u8.y);
    const a1 = await run(p, () => { const x = S.song.pf.find(q => q.k === 'st'); return {u: x.u, s: x.s, b: x.b, undo: UNDO.length}; });
    ok(vb && m2 && m2.bs.some(x => x.a === 'u') && u8 && a1.u === .5 && a1.undo === u0 + 1 && a1.s <= a1.b && Math.abs(a1.s / .5 - Math.round(a1.s / .5)) < 1e-9, 'Wert ▾ → 1/8: das Stottern hat jetzt Raster 1/8 (Stück im 1/8-Raster), ein ↶', JSON.stringify(a1));
    const lc = await p.evaluate(() => { const b = UI.pop && UI.pop.el.querySelector('[data-a="len"]'); if (!b) return null; const q = b.getBoundingClientRect(); return {x: q.left + q.width / 2, y: q.top + q.height / 2}; });
    if (lc) await tap(p, lc.x, lc.y);
    const l1 = await p.evaluate(() => { const b = [...UI.pop.el.querySelectorAll('[data-a="d"]')].find(x => x.textContent.trim() === '1 Takt'); if (!b) return null; const q = b.getBoundingClientRect(); return {x: q.left + q.width / 2, y: q.top + q.height / 2}; });
    if (l1) await tap(p, l1.x, l1.y);
    const a2 = await run(p, () => { const x = S.song.pf.find(q => q.k === 'st'); return {d: x.d, undo: UNDO.length}; });
    ok(l1 && a2.d === 4 && a2.undo === u0 + 2, 'Länge ▾ → 1 Takt: der Block ist 4 Schläge lang, ein ↶', JSON.stringify(a2));
    const xb = await p.evaluate(() => { const b = UI.pop && UI.pop.el.querySelector('[data-a="x"]'); if (!b) return null; const q = b.getBoundingClientRect(); return {x: q.left + q.width / 2, y: q.top + q.height / 2}; });
    if (xb) await tap(p, xb.x, xb.y);
    ok(xb && !(await menuInfo(p)), '✕ schließt das Menü');
    // ziehen = verschieben (Filter um einen Takt nach rechts)
    const f0 = await blockAt(p, 'f'), cw = await run(p, () => SV.cellW);
    await tDown(p, f0.x, f0.y); await p.waitForTimeout(40);
    for (let k = 1; k <= 8; k++) { await tMove(p, f0.x + cw * k / 8, f0.y); await p.waitForTimeout(30); }
    await p.screenshot({path: path.join(fotos, 'jam3-block-ziehen-' + n + '.png')});
    await tUp(p); await p.waitForTimeout(300);
    const a3 = await run(p, () => { const x = S.song.pf.find(q => q.k === 'f'); return {b: x.b, undo: UNDO.length, pop: !!UI.pop}; });
    const dB = a3.b - f0.blk.b;
    ok(Math.abs(dB - 4) < .26 && Math.abs(dB / .25 - Math.round(dB / .25)) < 1e-6 && a3.undo === u0 + 3 && !a3.pop, 'Block ziehen (' + n + '): der Filter wandert um gut einen Takt (im 1/16-Raster), ein ↶, kein Menü', 'um ' + dB + ' Schläge');
    // Löschen
    const m0 = await blockAt(p, 'm'); await tap(p, m0.x, m0.y);
    const dc = await p.evaluate(() => { const b = UI.pop && UI.pop.el.querySelector('[data-a="del"]'); if (!b) return null; const q = b.getBoundingClientRect(); return {x: q.left + q.width / 2, y: q.top + q.height / 2}; });
    if (dc) await tap(p, dc.x, dc.y);
    const a4 = await run(p, () => ({k: S.song.pf.map(x => x.k).sort().join(','), undo: UNDO.length}));
    ok(dc && a4.k === 'ab,f,st' && a4.undo === u0 + 4, 'Löschen: der Block DRUMS aus ist weg, ein ↶', a4.k);
    const a5 = await run(p, async () => { for (let k = 0; k < 4; k++) undo(); await wait(200); return {k: S.song.pf.map(x => x.k).sort().join(','), st: S.song.pf.find(x => x.k === 'st').u}; });
    ok(a5.k === 'ab,f,m,st' && a5.st === .25, '4× ↶: alle Änderungen am Block zurück (je Aktion ein Schritt)');
  }
  // quer: dieselbe Zeile und das Menü
  {
    const Q = await page(926, 428);
    await run(Q, SETUP);
    const pfj = await run(P, () => JSON.stringify(S.song.pf));
    await run(Q, async pf => { S.song.pf = JSON.parse(pf); songChanged(); setSongView(true); await wait(700); }, pfj);
    const g = await run(Q, () => ({g: SYNQUENZER.jam3.geo(), L: svLayoutInfo(), lab: (() => { const r = document.querySelector('.sv-l.j3-pl').getBoundingClientRect(); return [Math.round(r.top), Math.round(r.height)]; })()}));
    await Q.screenshot({path: path.join(fotos, 'jam3-song-perform-quer.png')});
    ok(g.g.pfH >= 16 && g.g.geo.length === 4 && Math.abs(g.lab[0] - (g.L.canvas.y + g.g.y0)) <= 1, 'Quer 926×428: Zeile PERFORM unten, Beschriftung auf der Höhe ihrer Zeile', 'Zeile ' + g.g.pfH + ' px, Spur-Zeilen ' + g.L.rowH + ' px');
    const s0 = await blockAt(Q, 'ab'); await tap(Q, s0.x, s0.y);
    const vc = await Q.evaluate(() => { const b = UI.pop && UI.pop.el.querySelector('[data-a="val"]'); if (!b) return null; const q = b.getBoundingClientRect(); return {x: q.left + q.width / 2, y: q.top + q.height / 2}; });
    if (vc) await tap(Q, vc.x, vc.y);
    const m = await menuInfo(Q);
    await Q.screenshot({path: path.join(fotos, 'jam3-block-menue-quer.png')});
    ok(m && m.bs.every(x => x.w >= 44 && x.h >= 44 && x.vis) && m.bs.some(x => x.a === 'dp') && m.bs.some(x => x.a === 'x' && x.vis), 'Quer: Block-Menü der Blende (Wert = bis 25/50/75/100 %), ✕ sichtbar, Tasten ≥ 44 px im Bild', m ? 'Blatt ' + m.r.join(',') : 'kein Menü');
    const dp = await Q.evaluate(() => { const b = UI.pop.el.querySelector('[data-a="dp"][data-v="0.5"]'); const q = b.getBoundingClientRect(); return {x: q.left + q.width / 2, y: q.top + q.height / 2}; });
    await tap(Q, dp.x, dp.y);
    const a = await run(Q, () => Math.max(...S.song.pf.find(x => x.k === 'ab').c.map(q => q[1])));
    ok(Math.abs(a - .5) < 1e-6, 'Blende „bis 50 %“: die Kurve reicht nur noch bis zur Mitte', 'höchster Wert ' + a);
    for (const [w, h] of [[926, 370]]) {
      await Q.setViewportSize({width: w, height: h}); await Q.waitForTimeout(700);
      const g2 = await run(Q, async () => { closePop(); await wait(300); svLayout(); await wait(200); const r = document.querySelector('.sv-l.j3-pl').getBoundingClientRect(); return {g: SYNQUENZER.jam3.geo(), bottom: Math.round(r.bottom), vh: innerHeight, rowH: svLayoutInfo().rowH}; });
      await Q.screenshot({path: path.join(fotos, 'jam3-song-perform-quer-370.png')});
      ok(g2.g.pfH >= 16 && g2.bottom <= g2.vh, 'Quer 926×370: Zeile PERFORM ganz im Bild', 'Zeile ' + g2.g.pfH + ' px, Spur-Zeilen ' + g2.rowH + ' px');
    }
    await Q.close();
  }

  /* ---------- 4 Ohne Aufnahme bleibt die Leiste Spielzustand; neuer Song mit der Leiste; Hand gewinnt; Kanten-Blende ---------- */
  const SP = await run(P, async () => {
    const J = SYNQUENZER.jam2, J3 = SYNQUENZER.jam3, o = {};
    J.open(); await wait(600);
    const p0 = serializeProject(), u0 = UNDO.length;
    songPlayFrom(0); await wait(300); J.st(.5); await wait(300); J.stUp(.5); J.flt(-.6); await wait(200); J.fltRel(); J.hold('bass', true); await wait(200); J.hold('bass', false); await wait(200); SYNQUENZER.stop(); await wait(500);
    o.spiel = serializeProject() === p0 && UNDO.length === u0;
    // Hand gewinnt: ein Stottern der Hand übertönt das Stottern der Spur
    J3.sentClear(); songPlayFrom(0); await wait(200);
    const x = S.song.pf.find(q => q.k === 'st'), sp = spb(), tAt = R.startTime + (x.b + R.songPlay.off) * sp; await wait(Math.max(0, (tAt - AU.ctx.currentTime) * 1000 - 400));
    J.st(1); await wait(Math.max(0, (tAt - AU.ctx.currentTime) * 1000) + 300); o.handHeld = J.state().st.held.slice(); const sent = J3.sent().filter(e => e[3] !== 'rec'); J.stUp(1);
    o.trackSt = sent.filter(e => e[0] === 'st').length; SYNQUENZER.stop(); await wait(400);
    J.close(); await wait(600);
    // neuer Song: ● ohne Song, Leiste offen, DRUMS halten → Block ab Takt 1
    const keep = serializeProject(); S.song = null; songChanged(); J.open(); await wait(700);
    songRecStart(); await wait(60); while (R.songRec && R.songRec.pending) await wait(20);
    await wait(300); J.hold('dr', true); await wait(900); J.hold('dr', false); await wait(700); songRecEnd(); await wait(300);
    o.neu = S.song ? (S.song.pf || []).map(x => x.k + ':' + x.g + ':' + x.lv) : null; o.neuToast = String(UI.lastToast || '');
    SYNQUENZER.stop(); await wait(300); J.close(); await wait(500);
    applyProject(normalizeProject(JSON.parse(keep)), {ui: true}); await wait(400);
    return o;
  });
  ok(SP.spiel, 'Ohne Aufnahme: Stottern, Filter, Gruppen bei ▶ SONG gespielt – Projekt byte-gleich, kein ↶ (reiner Spielzustand)');
  ok(SP.handHeld.length === 1 && SP.trackSt === 0, 'Die Hand gewinnt: hält der Finger ein Stottern, setzt das Stottern der Spur nicht ein', 'Stottern der Spur gesendet: ' + SP.trackSt);
  ok(SP.neu && SP.neu.join() === 'm:dr:stumm' && /PERFORM 1 Block/.test(SP.neuToast), 'Neuer Song (● ohne Song) mit DRUMS halten: ein Block DRUMS aus, Meldung nennt ihn', JSON.stringify(SP.neu) + ' · ' + SP.neuToast);
  // Blende, die zwischen dem Gleiten einer Song-Kante (einen Schlag voraus) und dem Taktstrich beginnt: kein Zurückspringen auf den alten Zustand
  const KB = await run(P, async () => {
    const t = 2, J3 = SYNQUENZER.jam3; S.song.pf = S.song.pf.filter(x => x.k !== 'ab'); songChanged();
    const c0 = S.tracks[t].sound.p.cutoff, ab = {k: 'ab', b: 15.4, d: 2, B: {[S.tracks[t].uid]: {eng: S.tracks[t].sound.engine, p: {cutoff: c0 * 2}}}, c: [[0, .5, 0, .04]], e: .3}; J3.put(ab);
    window.__vl.length = 0; songPlayFrom(0); await wait(40); const T = {st: R.startTime, off: R.songPlay.off, spb: spb()};
    await songEnd(18); SYNQUENZER.stop(); await wait(300); undo(); await wait(100);
    return {c0, v: window.__vl.splice(0).map(x => [+((x[0] - T.st) / T.spb - T.off).toFixed(3), Math.round(x[1])]).filter(x => x[0] > 14.5 && x[0] < 17.5)};
  });
  const mid = Math.round(Math.sqrt(KB.c0 * KB.c0 * 2)), inK = KB.v.filter(x => x[0] > 15 && x[0] < 16);
  ok(inK.length >= 1 && inK.every(x => Math.abs(x[1] - mid) <= 2), 'Blende der Spur beginnt, während die Song-Kante schon gleitet: A ist das Ziel der Kante (Mitte zu B), kein Rücksprung auf den alten ◆', JSON.stringify(KB.v) + ' (Mitte ' + mid + ' Hz)');
  // Aufnahme über den Song mit Schleife: DRUMS halten und Filter über den Sprung → je ein Block bis zum Schleifen-Ende und einer ab ihrem Anfang
  const LP = await run(P, async () => {
    const J = SYNQUENZER.jam2, J3 = SYNQUENZER.jam3, keep = serializeProject();
    songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]); S.song.loop = {on: true, a: 0, b: 2}; songChanged(); J.open(); await wait(600);
    songRecStart({targets: {clips: true}, from: 0, preroll: false}); await wait(60);
    await wait(1250); J.hold('dr', true); JAM2.f.drag = true; J.flt(-.5); await wait(450); J.flt(-.7); await wait(600); J.hold('dr', false); JAM2.f.drag = false; J.fltRel();
    await wait(200); await songEnd(7.5, 4000); songRecEnd(); await wait(300); const pf = J3.pf();   // Ende im letzten Takt der Schleife (die Aufnahme gilt bis zu ihrem Takt) SYNQUENZER.stop(); await wait(300); J.close(); await wait(500);
    applyProject(normalizeProject(JSON.parse(keep)), {ui: true}); await wait(300);
    return pf;
  });
  const lm = (LP || []).filter(x => x.k === 'm'), lf = (LP || []).filter(x => x.k === 'f');
  ok(lm.length === 2 && lm.some(x => x.b === 0) && lm.some(x => Math.abs(x.b + x.d - 8) < 1e-6) && lf.length === 2 && lf.some(x => x.b === 0 && x.c[0][1] === -.7) && lf.some(x => Math.abs(x.b + x.d - 8) < 1e-6),
    'Schleife (Takt 1–2) beim Aufnehmen: DRUMS aus und Filter über den Sprung gehalten → je ein Block bis zum Schleifen-Ende und einer ab ihrem Anfang (Filter mit dem letzten Wert)', JSON.stringify((LP || []).map(x => x.k + '@' + x.b.toFixed(2) + '+' + x.d.toFixed(2))));
  await P.close();

  /* ---------- 5 Rückung nimmt feste Spuren mit (MELODIE ⇅ fest), Drums nie; Song transponieren lässt sie aus ---------- */
  const R0 = await page(926, 428);
  const RK0 = await run(R0, async () => {
    SYNQUENZER.setBpm(240);
    const ft = S.tracks.findIndex(t => t && t.mel), c0 = S.tracks[1].clips[0];
    for (const s of [0, 1]) { const c = JSON.parse(JSON.stringify(c0)); c.notes = [{t: 0, d: 1, n: 72, v: .8}, {t: 2, d: 1, n: 76, v: .8}]; delete c.st; S.tracks[ft].clips[s] = c; }
    songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}, {scene: 0, bars: 2}, {scene: 1, bars: 2}]); songChanged(); setSongView(true); await wait(400);
    return {ft, follow: S.tracks[ft].follow, marks: S.song.marks.map(x => ({id: x.id, a: x.a})), u0: UNDO.length};
  });
  const lay = await run(R0, () => svLayoutInfo()), mk = lay.marks.find(x => x.id === RK0.marks[3].id);
  await tap(R0, lay.canvas.x + (mk.x0 + mk.x1) / 2, lay.canvas.y + lay.rulerH / 2);
  if ((await R0.evaluate(() => UI.pop && UI.pop.el && UI.pop.el.dataset.wgt)) !== 'a') await tapSel(R0, '.wg-tabs [data-t="a"]');
  await tapSel(R0, '.msheet .j2rk [data-jrk="1"]'); await R0.waitForTimeout(300);
  await R0.screenshot({path: path.join(fotos, 'jam3-rueckung-quer.png')});
  const RK1 = await run(R0, () => ({toast: String(UI.lastToast || ''), rk: S.song.marks.find(x => x.a === 6).rk, xp: JSON.stringify(S.song.xp), undo: UNDO.length, fest: SYNQUENZER.jam3.festL()}));
  ok(RK0.follow === false && RK1.rk === 1 && RK1.undo === RK0.u0 + 1 && /alles außer Drums/.test(RK1.toast) && !/rückt nicht mit/.test(RK1.toast), 'Rückung +1 am 4. Teil (Touch, quer): Marke trägt die Rückung, Meldung „– alles außer Drums“, ein ↶', RK1.toast);
  await run(R0, () => closePop());
  const PL = await run(R0, async ft => {
    SYNQUENZER.clearLog(); songPlayFrom(0); await wait(60); const off = R.songPlay ? R.songPlay.off : 0; await songEnd(31.95); await wait(150); SYNQUENZER.stop(); await wait(200);
    const L = SYNQUENZER.noteLog(8192).filter(e => e.src !== 'click' && e.src !== 'audition' && e.beat != null);
    const pick = (lo, hi) => L.filter(e => e.beat - off >= lo - 1e-6 && e.beat - off < hi - 1e-6).map(e => ({t: e.track, b: +(e.beat - off - lo).toFixed(3), n: e.out, src: e.src}));
    const A = pick(8, 16), B = pick(24, 32), key = e => e.t + '@' + e.b + ':' + e.src, byKey = new Map(); for (const e of A) { const k = key(e); (byKey.get(k) || byKey.set(k, []).get(k)).push(e.n); }
    const r = {fest: [0, 0], fol: [0, 0], dr: [0, 0]};
    for (const e of B) { const a = byKey.get(key(e)); if (!a) continue; const tr = S.tracks[e.t]; const g = e.t === ft ? 'fest' : tr.kind === 'drum' || percIs(tr) ? 'dr' : tr.follow !== false ? 'fol' : null; if (!g) continue; r[g][1]++; if (a.includes(g === 'dr' ? e.n : e.n - 1)) r[g][0]++; }
    return r;
  }, RK0.ft);
  ok(PL.fest[1] >= 4 && PL.fest[0] === PL.fest[1], '▶ SONG: MELODIE (⇅ fest) spielt im 4. Teil +1 Halbton gegen den 2. Teil (gleiche Clips)', PL.fest.join('/') + ' Noten');
  ok(PL.fol[1] > 5 && PL.fol[0] === PL.fol[1] && PL.dr[1] > 5 && PL.dr[0] === PL.dr[1], '▶ SONG: Bass/Akkorde/Synths +1, Drums unverändert', 'folgend ' + PL.fol.join('/') + ', Drums ' + PL.dr.join('/'));
  const MR = await R0.evaluate(MIDI + `; ((ft) => { const ch = midiCh(ft), notes = m => __midi(m.bytes);
    const pick = (L, lo, hi, f) => L.filter(x => x.b >= lo - 1e-6 && x.b < hi - 1e-6 && f(x)).map(x => (x.b - lo).toFixed(3) + ':' + x.n).sort();
    const one = () => { const v = va1MidiSong(va1MidiTracks(), true), L = notes(v); return {fA: pick(L, 8, 16, x => x.ch === ch), fB: pick(L, 24, 32, x => x.ch === ch), sA: pick(L, 8, 16, x => x.ch !== ch && x.ch !== 9), sB: pick(L, 24, 32, x => x.ch !== ch && x.ch !== 9), sA0: pick(L, 8, 16, x => x.ch !== ch && x.ch !== 9), dA: pick(L, 8, 16, x => x.ch === 9), dB: pick(L, 24, 32, x => x.ch === 9)}; };
    const sh = (l, d) => l.map(s => { const [t, n] = s.split(':'); return t + ':' + (+n + d); }).sort(), eq = (a, b2) => JSON.stringify(a) === JSON.stringify(b2);
    const a = one(), kb = vvkScore(0, 8), kbA = kb.tr[ft].filter(x => x.s >= 8 && x.s < 16).map(x => x.n), kbB = kb.tr[ft].filter(x => x.s >= 24 && x.s < 32).map(x => x.n);
    const L0 = notes(va1MidiSong(va1MidiTracks(), true)); const fol0 = pick(L0, 8, 16, x => x.ch !== ch && x.ch !== 9);
    gr1XpShift(2); const b2 = one(); const fol2 = b2.sA;
    return {fest: a.fB.length > 0 && eq(sh(a.fA, 1), a.fB), syn: a.sB.length > 0 && eq(sh(a.sA, 1), a.sB), dr: a.dB.length > 0 && eq(a.dA, a.dB), kb: kbA.length > 0 && eq(kbA.map(n => n + 1), kbB),
      tFest: eq(b2.fA, a.fA) && eq(b2.fB, a.fB), tSyn: eq(sh(fol0, 2), fol2) && eq(sh(a.sB, 2), b2.sB), tDr: eq(b2.dA, a.dA), xp: JSON.stringify(S.song.xp), n: [a.fB.length, a.sB.length, a.dB.length]}; })(${RK0.ft})`);
  ok(MR.fest && MR.syn && MR.dr, 'MIDI je Spur: MELODIE (fest) und Synths im 4. Teil +1, Drums gleich – wie die Wiedergabe', 'Noten fest/Synth/Drums ' + MR.n.join('/'));
  ok(MR.kb, 'Video-Tastatur (Klavier im Video): MELODIE im 4. Teil +1');
  ok(MR.tFest && MR.tSyn && MR.tDr, '„Song transponieren +2“: Synths +2, MELODIE (⇅ fest) bleibt wo sie war (2. Teil ±0, 4. Teil +1), Drums gleich', MR.xp);
  // ↶ der Rückung, Speichern/Laden
  const RU = await run(R0, async () => {
    undo(); await wait(80); const a = {rk: S.song.marks.find(x => x.a === 6).rk || 0, fest: SYNQUENZER.jam3.fest(28)};
    undo(); await wait(80); const b2 = {rk: S.song.marks.find(x => x.a === 6).rk || 0, fest: SYNQUENZER.jam3.fest(28), xp: JSON.stringify(S.song.xp || [])};
    redo(); await wait(80); const j = serializeProject(); applyProject(normalizeProject(JSON.parse(j)), {ui: true}); await wait(300);
    return {a, b: b2, c: {rk: S.song.marks.find(x => x.a === 6).rk, fest: SYNQUENZER.jam3.fest(28), fest2: SYNQUENZER.jam3.fest(12)}};
  });
  ok(RU.a.rk === 1 && RU.a.fest === 1 && RU.b.rk === 0 && RU.b.fest === 0 && RU.c.rk === 1 && RU.c.fest === 1 && RU.c.fest2 === 0, '↶ nimmt erst „Song transponieren“, dann die Rückung (samt fester Spuren) zurück; ↷ + Speichern/Laden: die Rückung bleibt', JSON.stringify(RU));
  const G7T = await run(R0, async () => {
    const st = tkEnsureTrack([]); if (st < 0) return null; S.tracks[st].follow = false;
    const n0 = G7.n; songPlayFrom(0); await wait(60); const off = R.songPlay.off;
    await songEnd(26.5); const a = g7Moves(st, b2t(off + 26)), b2 = g7Moves(st, b2t(off + 10)), n1 = G7.n; SYNQUENZER.stop(); await wait(300);
    return {st, part4: a, part2: b2, g7: n1 - n0};
  });
  ok(G7T && G7T.part4 && !G7T.part2 && G7T.g7 >= 1, 'Gesang: eine STIMME mit ⇅ fest rückt im 4. Teil mit (G7 „folgt“ über dieselbe Tonhöhen-Rechnung), im 2. Teil nicht; G7 rechnet beim Wechsel neu', JSON.stringify(G7T));
  await R0.close();
  // Song aus 4.52.0 mit Rückung: lädt und klingt wie bisher (JAM3-P: keine Übernahme aus der Fassungsnummer – sie erkannte Stufen falsch und
  // JAM3 schreibt dieselbe Fassung); die Rückung im Marken-Blatt einmal neu antippen nimmt MELODIE mit (ein ↶)
  {
    const OB = await page(926, 428, basis);
    const j452 = await run(OB, async () => {
      SYNQUENZER.setBpm(240); const ft = S.tracks.findIndex(t => t && t.mel), c0 = S.tracks[1].clips[0];
      for (const s of [0, 1]) { const c = JSON.parse(JSON.stringify(c0)); c.notes = [{t: 0, d: 1, n: 72, v: .8}]; delete c.st; S.tracks[ft].clips[s] = c; }
      songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}, {scene: 0, bars: 2}, {scene: 1, bars: 2}]); songChanged();
      SYNQUENZER.jam2.rkSet(S.song.marks.find(x => x.a === 6).id, 1); return {j: serializeProject(), ver: VERSION};
    });
    await OB.close();
    const NB = await page(926, 428);
    const MG = await run(NB, async a => {
      const load = w => { const p = JSON.parse(a.j); if (w) Object.defineProperty(p, '_newer', {value: {f: 0, w}, configurable: true}); return normalizeProject(p); };
      const p1 = load(SQStore.verCode(a.ver)), p0 = load(0);
      applyProject(p1, {ui: true}); await wait(300);
      const id = S.song.marks.find(x => x.a === 6).id, o = {ver: a.ver, rk1: p1.song.marks.map(m => m.rk || 0), rk0: p0.song.marks.map(m => m.rk || 0), xp: JSON.stringify(S.song.xp), fest: SYNQUENZER.jam3.fest(26), tag: SYNQUENZER.jam2.tag(id), u0: UNDO.length};
      o.neu = SYNQUENZER.jam2.rkSet(id, 1); o.rk2 = S.song.marks.map(m => m.rk || 0); o.fest2 = SYNQUENZER.jam3.fest(26); o.fest2a = SYNQUENZER.jam3.fest(20); o.xp2 = JSON.stringify(S.song.xp); o.u1 = UNDO.length;
      return o;
    }, j452);
    ok(MG.ver === '4.52.0' && JSON.stringify(MG.rk1) === '[0,0,0,0]' && JSON.stringify(MG.rk0) === '[0,0,0,0]' && MG.fest === 0 && MG.tag === ' +1' && MG.xp === '[{"beat":24,"semi":1}]', 'Song aus 4.52.0 mit Rückung: lädt wie er war – Rückung in song.xp und Anzeige „+1“, MELODIE (⇅ fest) klingt wie in 4.52.0 (alte Projekte klingen gleich)', JSON.stringify(MG));
    ok(MG.neu === true && JSON.stringify(MG.rk2) === '[0,0,0,1]' && MG.fest2 === 1 && MG.fest2a === 0 && MG.xp2 === MG.xp && MG.u1 === MG.u0 + 1, 'Rückung „+1“ im Marken-Blatt neu angetippt: MELODIE rückt jetzt mit, song.xp bleibt, ein ↶');
    await NB.close();
  }

  /* ---------- 7 Prüfung (JAM3-P): die Befunde 1–7 des unabhängigen Prüfers ---------- */
  {
    // Befund 1: Rückung am 4. Teil, dann Teil 2 ans Ende kopieren bzw. Teil 4 nach vorn verschieben – MELODIE (⇅ fest) spielt in jedem Teil
    // um dieselbe Stufe wie Bass/Akkorde (song.xp), auch nach dem verschobenen Teil (vorher blieb sie bis zum Ende +1)
    const P7 = await page(926, 428);
    const RS = async () => {
      SYNQUENZER.setBpm(240);
      const ft = S.tracks.findIndex(t => t && t.mel), c0 = S.tracks[1].clips[0];
      for (const s of [0, 1]) { const c = JSON.parse(JSON.stringify(c0)); c.notes = [{t: 0, d: 1, n: 72, v: .8}, {t: 2, d: 1, n: 76, v: .8}]; delete c.st; S.tracks[ft].clips[s] = c; }
      songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}, {scene: 0, bars: 2}, {scene: 1, bars: 2}]); songChanged();
      SYNQUENZER.jam2.rkSet(S.song.marks.find(x => x.a === 6).id, 1);
      ensureAudio(); await wait(300);
      return ft;
    };
    const PLAY = async ft => {
      const E = S.song.bars * 4; SYNQUENZER.clearLog(); songPlayFrom(0); await wait(60); const off = R.songPlay ? R.songPlay.off : 0; await songEnd(E - .05, 30000); await wait(150); SYNQUENZER.stop(); await wait(200);
      const L = SYNQUENZER.noteLog(16384).filter(e => e.beat != null && e.src !== 'click' && e.src !== 'audition' && e.track === ft);
      return S.song.marks.slice().sort((a, b) => a.a - b.a).map(m => {
        const lo = barBeat(m.a), hi = barBeat(m.a + m.len), xp = vvAppXpAt(S.song, lo), mel = [...new Set(L.filter(e => e.beat - off >= lo - 1e-6 && e.beat - off < hi - 1e-6).map(e => e.out))].sort((a, b) => a - b);
        return {a: m.a, xp, fest: SYNQUENZER.jam3.fest(lo), mel: mel.join(','), ok: mel.join(',') === [72 + xp, 76 + xp].join(',')};
      });
    };
    const ft7 = await run(P7, RS);
    await run(P7, () => { const m = S.song.marks.find(x => x.a === 2); return markAction(m.id, 'copy', S.song.bars); });
    const K1 = await run(P7, PLAY, ft7);
    ok(K1.length === 5 && K1.every(x => x.ok && x.fest === x.xp) && K1[4].xp === 0, 'Befund 1 – Rückung +1 am 4. Teil, Teil 2 ans Ende kopiert: der neue Teil spielt MELODIE wieder ohne Rückung (wie Bass/Akkorde), der 4. Teil +1', JSON.stringify(K1.map(x => x.a + ':' + x.mel + '/' + x.xp)));
    await run(P7, () => undo());
    await run(P7, () => { const m = S.song.marks.find(x => x.a === 6); return markAction(m.id, 'move', 2); });
    const K2 = await run(P7, PLAY, ft7);
    ok(K2.length === 4 && K2.every(x => x.ok && x.fest === x.xp) && K2[1].xp === 1 && K2[2].xp === 0 && K2[3].xp === 0, 'Befund 1 – Teil 4 nach vorn verschoben: die Rückung geht mit dem Teil, die Teile danach spielen MELODIE wieder wie Bass/Akkorde (vorher +1 bis zum Ende)', JSON.stringify(K2.map(x => x.a + ':' + x.mel + '/' + x.xp)));
    const K3 = await run(P7, async () => {
      undo(); await wait(50);
      const id2 = S.song.marks.find(x => x.a === 2).id; SYNQUENZER.jam2.rkSet(S.song.marks.find(x => x.a === 4).id, 1);   // Rückung auch am 3. Teil: 0,0,1,2
      const st = () => S.song.marks.slice().sort((x, y) => x.a - y.a).map(m => SYNQUENZER.jam3.fest(barBeat(m.a)) + '/' + vvAppXpAt(S.song, barBeat(m.a))).join(' ');
      const o = {a: st()};
      markAction(id2, 'delete'); o.del = st(); undo(); await wait(50);
      const lv0 = [0, 1, 2, 3, 4, 5, 6, 7].map(b => SYNQUENZER.jam3.lv(b)).join(','); s2Sum(2, 6, 'Zus'); await wait(50);
      o.sum = [0, 1, 2, 3, 4, 5, 6, 7].map(b => SYNQUENZER.jam3.lv(b)).join(','); o.lv0 = lv0; o.mk = JSON.stringify(S.song.marks.find(x => x.a === 2));
      const j = serializeProject(); applyProject(normalizeProject(JSON.parse(j)), {ui: true}); await wait(200);
      o.sumLaden = [0, 1, 2, 3, 4, 5, 6, 7].map(b => SYNQUENZER.jam3.lv(b)).join(',');
      return o;
    });
    ok(K3.a === '0/0 0/0 1/1 2/2' && K3.del === '0/0 1/1 2/2' && K3.lv0 === K3.sum && K3.sum === K3.sumLaden && K3.lv0 === '0,0,0,0,1,1,2,2', 'Befund 1 – Teil löschen und Zusammenfassen über zwei Rückungen: feste Spuren bleiben in jedem Teil auf der Stufe von song.xp (auch nach Speichern/Laden)', JSON.stringify(K3));
    await P7.close();
  }
  {
    // Befund 2: Takte/Teil löschen, Szene einfügen, Teil ×2 mitten in einem langen Block DRUMS aus – der Rest bleibt stumm
    const P8 = await page(428, 926);
    const B2 = await run(P8, async () => {
      SYNQUENZER.setBpm(240);
      songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}, {scene: 0, bars: 2}, {scene: 1, bars: 2}]); songChanged();
      const J3 = SYNQUENZER.jam3, show = () => (J3.pf() || []).map(x => x.k + '@' + x.b + '+' + x.d).join(' '), o = {};
      J3.put({k: 'm', b: 8, d: 24, g: 'dr', lv: 'stumm'});
      markAction(S.song.marks.find(m => m.a === 2).id, 'delete'); o.teil = show(); undo(); await wait(50);
      songRange('delete', 4, 5); o.takte = show(); undo(); await wait(50);
      placePart('S1', 4); o.einf = show(); undo(); await wait(50);
      markAction(S.song.marks.find(m => m.a === 4).id, 'rep', 2); o.wdh = show(); undo(); await wait(50);
      o.zurueck = show();
      S.song.pf = []; songChanged(); J3.put({k: 'f', b: 8, d: 24, c: [[0, -.5], [10, -.9]]});
      markAction(S.song.marks.find(m => m.a === 2).id, 'delete'); o.filter = JSON.stringify(J3.pf());
      return o;
    });
    ok(B2.teil === 'm@8+16' && B2.takte === 'm@8+16' && B2.einf === 'm@8+8 m@24+16' && B2.wdh === 'm@8+32' && B2.zurueck === 'm@8+24', 'Befund 2 – DRUMS aus Takt 3–8: Teil 2 löschen / Takte 5–6 löschen → Rest bleibt (m@8+16); Szene an Takt 5 → davor und dahinter stumm; Teil 3 ×2 → alles stumm; ↶ stellt ihn her', JSON.stringify(B2));
    ok(B2.filter === '[{"k":"f","b":8,"d":16,"c":[[0,-0.5],[2,-0.9]]}]', 'Befund 2 – Filter-Fahrt über einen gelöschten Teil: der Rest der Kurve rückt nach (ab dem Schnitt mit dem letzten Wert)', B2.filter);
    // Befund 3: ↶/↷ irgendeiner Aktion während ▶ SONG mitten in DRUMS aus + Filter – beide laufen weiter; Löschen des Blocks beendet ihn
    const B3 = await run(P8, async () => {
      ensureAudio(); await wait(400);
      songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}, {scene: 0, bars: 2}, {scene: 1, bars: 2}]); songChanged();
      const J3 = SYNQUENZER.jam3, dr = S.tracks.findIndex(t => t && t.kind === 'drum');
      J3.put({k: 'm', b: 8, d: 16, g: 'dr', lv: 'stumm'}); J3.put({k: 'f', b: 8, d: 16, c: [[0, -.8]]});
      const gain = () => { const o = JAM2.ng[dr]; return o ? +o.n.gain.value.toFixed(3) : null; }, res = {};
      const one = async (label, act) => {
        songPlayFrom(0); await wait(40); await songEnd(10.2); const a = gain(); const lg0 = ((await J3.log()) || []).length;
        act(); await wait(30); await songEnd(16.5); const b = gain(); const lg = ((await J3.log()) || []).slice(lg0); await songEnd(20.5); const c = gain();
        SYNQUENZER.stop(); await wait(400);
        res[label] = {a, b, c, rel: lg.filter(e => e[0] === 3 && e[2] === 9).length};
      };
      await one('trans', () => { gr1XpShift(1); undo(); });
      await one('name', () => { const m = S.song.marks[0]; markAction(m.id, 'rename', {name: 'X'}); undo(); });
      await one('redo', () => { const m = S.song.marks[0]; markAction(m.id, 'rename', {name: 'Y'}); undo(); redo(); });
      await one('weg', () => { songEdit('weg', sg => { sg.pf = sg.pf.filter(q => q.k !== 'm'); }); });
      return res;
    });
    const k3 = x => x && x.a === -1 && x.b === -1 && x.c === -1 && x.rel === 0;
    ok(k3(B3.trans) && k3(B3.name) && k3(B3.redo), 'Befund 3 – ↶/↷ während ▶ SONG (Song transponieren + ↶, Name + ↶, Name + ↶ + ↷): DRUMS bleiben stumm bis zum Blockende, der Filter wird nicht losgelassen', JSON.stringify(B3));
    ok(B3.weg && B3.weg.a === -1 && B3.weg.b === 0 && B3.weg.c === 0, 'Befund 3 – Block während ▶ gelöscht: DRUMS kommen zurück (gelöschte Blöcke enden weiter sofort)', JSON.stringify(B3.weg));
    await P8.close();
  }
  {
    // Befund 4: 4.52.0 „Song transponieren +2“, dann Szene 1 als Teil ans Ende – keine Rückung erfunden; derselbe Song aus JAM3 nach Speichern/Laden gleich
    const OB = await page(926, 428, basis);
    const A452 = await run(OB, async () => {
      SYNQUENZER.setBpm(240); songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}, {scene: 0, bars: 2}, {scene: 1, bars: 2}]); songChanged();
      gr1XpShift(2); placePart('S1', S.song.bars); return {f: SQStore.serializeProjectFile(S, [], VERSION), j: serializeProject()};
    });
    await OB.close();
    const NB = await page(926, 428);
    const A4 = await run(NB, async a => {
      const p = normalizeProject(JSON.parse(a.j)), o = {rkDatei: p.song.marks.map(m => m.rk || 0).join(',')};
      applyProject(p, {ui: true}); await wait(200); o.fest = [0, 32].map(b => SYNQUENZER.jam3.fest(b)).join(','); o.tag = SYNQUENZER.jam2.tag(S.song.marks.find(m => m.a === 8).id);
      songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}, {scene: 0, bars: 2}, {scene: 1, bars: 2}]); songChanged(); gr1XpShift(2); placePart('S1', S.song.bars);
      const s0 = songSnapshot(), j = serializeProject(); applyProject(normalizeProject(JSON.parse(j)), {ui: true}); await wait(200);
      o.jam3 = S.song.marks.map(m => m.rk || 0).join(','); o.gleich = songSnapshot() === s0; o.fest2 = SYNQUENZER.jam3.fest(33);
      return o;
    }, A452);
    ok(A4.rkDatei === '0,0,0,0,0' && A4.fest === '0,0' && A4.tag === ' −2' && A4.jam3 === '0,0,0,0,0' && A4.gleich && A4.fest2 === 0, 'Befund 4 – 4.52.0: „Song transponieren +2“ + Teil ans Ende → beim Laden keine Rückung (MELODIE klingt wie in 4.52.0); derselbe Song aus JAM3: Speichern/Laden ändert nichts', JSON.stringify(A4));
    await NB.close();
  }
  {
    // Befund 5: fertiger Song mit Melodie, Perform-Leiste offen – ● SONG per Finger: Start-Blatt ohne ✓ (nur PERFORM), START frei, nur Filter
    // gespielt → Melodie, Clips, Akkorde unverändert, nur der Block PERFORM ist neu; ● zeigt „PERF…“; Leiste zu → Ziele wie bisher (✓NOTEN)
    for (const [w, h, n] of [[428, 926, 'hochkant'], [926, 428, 'quer']]) {
      const P5 = await page(w, h);
      const v0 = await run(P5, async () => {
        SYNQUENZER.setBpm(120);
        songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}, {scene: 0, bars: 2}, {scene: 1, bars: 2}]); songChanged();
        const mt = S.song.melodyTrack, m = S.song.mel[mt] || (S.song.mel[mt] = melEmpty()); m.notes = []; for (let b = 0; b < 32; b += 1) m.notes.push({t: b, d: .5, n: 72 + (b % 5), v: .8}); m.len = S.song.bars; songChanged();
        setSongView(true); ensureAudio(); await wait(400); SYNQUENZER.jam2.open(); await wait(900); UI.recPre = false; await wait(200);
        return {snap: songSnapshot(), lab: SV.btn.bRec.lastChild.textContent, u0: UNDO.length};
      });
      await tapSel(P5, '.sv-rec'); await P5.waitForTimeout(300);
      const sh = await P5.evaluate(() => { const e = document.querySelector('.rstart'); if (!e) return null; const g = e.querySelector('.rs-go'); return {on: e.querySelectorAll('.rs-t.on').length, dis: !!g.disabled, txt: e.innerText.replace(/\s+/g, ' ')}; });
      await P5.screenshot({path: path.join(fotos, 'jam3p-start-perform-' + n + '.png')});
      await tapSel(P5, '.rstart .rs-go'); await P5.waitForTimeout(1500);
      const f = await ctr(P5, '#jam2Bar .j2-f .j2-rail');
      if (f) { await tDown(P5, f.x, f.y); for (let k = 1; k <= 10; k++) { await tMove(P5, f.x - f.w * .4 * k / 10, f.y); await P5.waitForTimeout(60); } await P5.waitForTimeout(700); await tUp(P5); await P5.waitForTimeout(1200); }
      await tapSel(P5, '.sv-rec'); await P5.waitForTimeout(500);
      const v1 = await run(P5, async b0 => {
        const a = JSON.parse(b0), z = JSON.parse(songSnapshot()), pf = z.pf; delete z.pf; delete a.pf;
        const o = {gleich: JSON.stringify(a) === JSON.stringify(z), pf: (pf || []).map(x => x.k), toast: String(UI.lastToast || ''), undo: UNDO.length};
        SYNQUENZER.stop(); await wait(300); SYNQUENZER.jam2.close(); await wait(700); svButtons(); o.labZu = SV.btn.bRec.lastChild.textContent; o.tgZu = recTargets();
        return o;
      }, v0.snap);
      ok(sh && sh.on === 0 && !sh.dis && /PERFORM/.test(sh.txt) && /PERF/.test(v0.lab), 'Befund 5 – Start-Blatt mit offener Perform-Leiste (' + n + '): kein ✓-Ziel, START frei, der Text nennt PERFORM; ● zeigt „' + v0.lab + '“', sh ? sh.txt.slice(0, 160) : 'kein Blatt');
      ok(v1.gleich && v1.pf.join() === 'f' && /PERFORM 1 Block/.test(v1.toast) && v1.undo === v0.u0 + 1, 'Befund 5 – nur Filter gespielt (' + n + '): Melodie/Clips/Akkorde unverändert, ein Block PERFORM, ein ↶', v1.toast);
      ok(v1.tgZu.mel && !v1.tgZu.pf && /MEL/.test(v1.labZu), 'Befund 5 – Leiste zu: ● nimmt wieder auf wie bisher (✓NOTEN), ● zeigt „' + v1.labZu + '“');
      await P5.close();
    }
  }
  {
    // Befund 6: zwei Bahnen bei 926×370 mit vollem GL1-Projekt – die Spur-Zeilen bleiben ≥ 17 px, MELODIE behält „S4 ▾ · ⇅ fest“
    const gsrc = fs.readFileSync('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w4492/gl1/gl1-test.mjs', 'utf8');
    const grab = k => JSON.parse(new RegExp('const ' + k + ' = (".*?");\\n').exec(gsrc)[1]);
    for (const [w, h] of [[926, 370], [926, 428], [428, 926]]) {
      const P6 = await page(w, h);
      await P6.addScriptTag({content: grab('HELP_SETUP')});
      await P6.evaluate(() => __gl1Setup()); await P6.evaluate(() => { SYNQUENZER.chsOpen(true); setSongView(true); svLayout(); UI.dirty.song = true; svDraw(true); }); await P6.waitForTimeout(500);
      const r = await run(P6, async () => {
        const J3 = SYNQUENZER.jam3, mel = () => document.querySelector('.sv-l.sv-lm').innerText.replace(/\s+/g, ' ');
        const a = {rowH: SV.rowH, mel: mel()};
        J3.put({k: 'f', b: 20, d: 4, c: [[0, -.5], [1, -.9]]}); J3.put({k: 'm', b: 0, d: 16, g: 'dr', lv: 'stumm'}); J3.put({k: 'st', b: 4, d: 2, u: .25, g: 'all', s: 4}); await wait(400); svDraw(true);
        const g = J3.geo(); return {a, rowH: +SV.rowH.toFixed(2), mel: mel(), pfH: g.pfH, n: SV.pfN, lanes: new Set(g.geo.map(q => Math.round(q.y0))).size, flat2: EL.songView.classList.contains('gl1flat2')};
      });
      await P6.screenshot({path: path.join(fotos, 'jam3p-zwei-bahnen-' + w + 'x' + h + '.png')});
      ok(r.rowH >= 17 && !r.flat2 && /⇅ fest/.test(r.mel) && r.n === 2 && r.lanes === 2 && r.pfH <= 30 && (w !== 926 || h !== 370 || r.pfH < 30), 'Befund 6 – zwei Bahnen ' + w + '×' + h + ': PERFORM ' + r.pfH + ' px, Spur-Zeilen ' + r.rowH + ' px (≥ 17), MELODIE „' + r.mel + '“', JSON.stringify(r));
      await P6.close();
    }
  }
  {
    // Befund 7: jede geänderte Zeile außerhalb des JAM3-Blocks trägt „JAM3“; der Worklet-Quelltext JAM2_PROC_SRC bleibt ASCII wie in der Basis
    const T = fs.readFileSync(file, 'utf8').split('\n'), BL = new Set(fs.readFileSync(basis, 'utf8').split('\n'));
    const s0 = T.findIndex(l => l.includes('JAM3-BEGIN')), s1 = T.findIndex(l => l.includes('JAM3-END ====='));
    const bad = T.map((l, i) => [i + 1, l]).filter(([i, l]) => (i - 1 < s0 || i - 1 > s1) && !BL.has(l) && !l.includes('JAM3'));
    const src = /const JAM2_PROC_SRC = `([\s\S]*?)`;/.exec(T.join('\n')), na = src ? [...src[1]].filter(c => c.charCodeAt(0) > 127).length : -1;
    ok(!bad.length && na === 0, 'Befund 7 – Einhänge-Zeilen: alle neuen/geänderten Zeilen außerhalb des Blocks tragen „JAM3“; JAM2_PROC_SRC reines ASCII', bad.slice(0, 3).map(x => x[0] + ': ' + x[1].slice(0, 60)).join(' | ') + (na ? ' · Nicht-ASCII ' + na : ''));
  }

  /* ---------- 6 Guide, Pflichtregeln im Text ---------- */
  {
    const G = await page(428, 926);
    const GU = await run(G, () => ({pf: ui1Search('perform spur').map(e => e.id), rk: (ui1Entries().find(x => x.id === 'jam2rk') || {}).d}));
    ok(GU.pf.includes('jam3pf') && /alles außer Drums|Alles außer Drums/.test(GU.rk || ''), '„Wo finde ich …?“: Perform-Spur im Song; Rückung: „Alles außer Drums rückt mit“', GU.rk);
    await G.close();
  }
  const txt = fs.readFileSync(file, 'utf8'), bas = fs.readFileSync(basis, 'utf8');
  const cnt = (s, w) => s.split(w).length - 1;
  const words = ['Korg', 'microKORG', 'RADIAS', 'DWGS', 'Kodamo', 'Mask1', 'Nord', 'Clavia', 'Elektron', 'Octatrack'];
  const more = words.filter(w => cnt(txt, w) > cnt(bas, w));
  ok(!more.length && cnt(txt, 'MS 2000') === 1 && cnt(txt, '  live: true,') === 1, 'Pflichtwörter: keines häufiger als in der Basis, „MS 2000“ 1×, „  live: true,“ 1×', more.join(', '));
  ok(!errs.length, 'keine Seitenfehler', errs.slice(0, 3).join(' | '));
} catch (e) { bad++; all++; console.log('FEHLER Abbruch – ' + (e && e.stack || e)); }
await b.close();
console.log((bad ? 'FEHLER' : 'OK') + ' JAM3: ' + (all - bad) + '/' + all + ' bestanden');
process.exit(bad ? 1 : 0);
