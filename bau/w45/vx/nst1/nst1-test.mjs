// NST1-Test „Je Note weiterschalten“. Aufruf: node nst1-test.mjs <index.html> [ordner]   (Basis = basis.html daneben; Fotos in <ordner>/fotos)
// Abschnitte: A aus = wie Basis · B Zähler/Muster/Verbund/Akkord/Rückstellen/Rücknahme · C Klang (Render: VA, Engine mk, FM, WT) ·
// D klickfrei (Spitzen) · E CPU vorher/nachher · F Speichern/Laden, Undo · G Bedienung per Touch hochkant/quer (Fotos) · H Guide · I Startzeit
import { createRequire } from 'node:module'; import path from 'node:path'; import fs from 'node:fs';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
const file = path.resolve(process.argv[2]), out = path.resolve(process.argv[3] || path.dirname(file)), basis = path.join(path.dirname(file), 'basis.html');
const fotos = path.join(out, 'fotos'); fs.mkdirSync(fotos, {recursive: true});
let bad = 0, all = 0; const res = [];
const ok = (c, m, d) => { all++; const s = (c ? 'OK ' : 'FEHLER ') + m + (d != null ? ' – ' + (typeof d === 'string' ? d : JSON.stringify(d)) : ''); if (!c) bad++; console.log(s); res.push(s); };
const info = (m, d) => { const s = 'INFO ' + m + (d != null ? ' – ' + (typeof d === 'string' ? d : JSON.stringify(d)) : ''); console.log(s); res.push(s); };
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const errs = [];
async function page(w, h, f) {
  const p = await b.newPage({viewport: {width: w || 428, height: h || 926}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + (f || file)); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 60000}); await p.waitForTimeout(1200);
  p.cdp = await p.context().newCDPSession(p);
  return p;
}
const H = `const wait = ms => new Promise(r => setTimeout(r, ms));
  const host = async () => { ensureAudio(); for (let k = 0; k < 100 && SynthHost.state !== 'ready' && SynthHost.state !== 'failed'; k++) await wait(100); return SynthHost.state; };
  const synth = () => S.tracks.findIndex(t => t.kind === 'synth');
  const N = SYNQUENZER.nst1, lane = (i, p, lo, hi) => N.lane(i, p, lo, hi);
  const solo = (i, notes, bars) => { for (const t of S.tracks) t.clips = t.clips.map(() => null); S.tracks[i].clips[0] = normClip({len: bars || 2, key: Object.assign({}, S.key), notes}, 'synth', S.key); SYNQUENZER.songFromChain([{scene: 0, bars: bars || 2}]); };
  const render = async () => { VV.cancel = false; const t0 = performance.now(); const s = await vvRenderAudio({range: {a: 0, b: S.song.bars, sel: false}}); return {sr: s.sr, l: s.ch[0], r: s.ch[1], ms: performance.now() - t0}; };
  const live = (i, n, t) => spawnVoice(i, n, .8, t, {src: 'live'});`;
const run = (p, fn, arg) => p.evaluate('(async () => { ' + H + ' return (' + fn.toString() + ')(' + JSON.stringify(arg == null ? null : arg) + '); })()');
const tDown = (p, x, y) => p.cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id: 1, radiusX: 4, radiusY: 4, force: 1}]});
const tUp = p => p.cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
async function tap(p, x, y) { await tDown(p, x, y); await p.waitForTimeout(60); await tUp(p); await p.waitForTimeout(300); }
async function hold(p, x, y, ms) { await tDown(p, x, y); await p.waitForTimeout(ms || 700); await tUp(p); await p.waitForTimeout(350); }
const ctr = (p, sel) => p.evaluate(s => { const e = typeof s === 'string' ? document.querySelector(s) : null; if (!e || !e.getClientRects().length) return null; const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height}; }, sel);
async function tapSel(p, sel) { const c = await ctr(p, sel); if (!c) return false; await tap(p, c.x, c.y); return true; }
// Tonhöhe je Note (Nulldurchgänge, Sinus) und Helligkeit (Steigungs-Effektivwert)
const zc = (x, a, n, sr) => { let z = 0, f = -1, l = -1; for (let k = a + 1; k < a + n; k++) if (x[k - 1] < 0 && x[k] >= 0) { const fr = k - 1 + x[k - 1] / (x[k - 1] - x[k]); if (f < 0) f = fr; l = fr; z++; } return z > 1 ? (z - 1) * sr / (l - f) : 0; };
const bright = (x, a, n, sr) => { let num = 0, den = 0; for (let k = a + 1; k < a + n; k++) { const d = x[k] - x[k - 1]; num += d * d; den += x[k] * x[k]; } return Math.sqrt(num / (den || 1)) * sr / (2 * Math.PI); };
const first = (x, thr) => { for (let k = 0; k < x.length; k++) if (Math.abs(x[k]) > thr) return k; return -1; };
const perNote = (x, sr, spbS, n, f) => { const t0 = first(x, 1e-3), v = []; for (let q = 0; q < n; q++) v.push(f(x, Math.round(t0 + q * spbS + .05 * sr), Math.round(.12 * sr), sr)); return v; };
const semis = v => v.map(h => +(12 * Math.log2(h / v[0])).toFixed(2));
try {
  /* ================= A: Je Note aus = wie die Basis ================= */
  for (const [w, h, n] of [[428, 926, 'hochkant'], [926, 428, 'quer']]) {
    const A = await page(w, h, basis), B = await page(w, h);
    const sa = await A.screenshot(), sb = await B.screenshot();
    ok(Buffer.compare(sa, sb) === 0, 'A1 Start-Bild pixelgleich zur Basis (' + n + ')');
    await A.close(); await B.close();
  }
  {
    const p = await page();
    const r = await run(p, async () => {
      const i = synth(), s = JSON.stringify(S.tracks[i].sound), n = SQStore.normalizeSound(JSON.parse(s));
      const ser = SYNQUENZER.serialize();
      return {noNst: !('nst' in n) && !/"nst"/.test(ser), clean: N.clean({z: [{p: 'x y', a: 0, b: 1}]}), clean2: N.clean({z: [{p: 'o1semi', a: 2, b: -1}], n: 99, m: 'xx', v: 'yy', s: -5}),
        hook: typeof nst1Voice === 'function', state: N.state(i)};
    });
    ok(r.noNst, 'A2 Klang ohne Je-Note-Feld: Speicherstand ohne „nst“ (bitgleiches Format wie 4.78.0)');
    ok(r.clean === null && r.clean2 && r.clean2.n === 8 && r.clean2.m === 'up' && r.clean2.v === 'gleich' && r.clean2.z[0].a === 1 && r.clean2.z[0].b === 0, 'A3 Bereinigen: kaputte Pfade fallen weg, Werte werden begrenzt', r.clean2);
    await p.close();
  }

  /* ================= B: Zähler, Muster, Verbund, Akkord, Rückstellen, Rücknahme ================= */
  {
    const p = await page();
    const r = await run(p, async () => {
      await host(); const i = synth(); applySound(i, factorySound(INIT_IDS.analog));
      const o = {};
      const set = c => N.set(i, Object.assign({on: 1, n: 4, m: 'up', v: 'gleich', ak: 0, rs: 1, s: 7}, c));
      const L1 = [lane(i, 'o1semi', 0, 12)], L2 = [lane(i, 'o2semi', -12, 12), lane(i, 'o3semi', -12, 12)], L3 = [lane(i, 'o1fine', -50, 50), lane(i, 'o2fine', -50, 50), lane(i, 'o3fine', -50, 50)];
      const seq = (c, n) => { set(c); return N.sim(i, n || 12); };
      o.up = seq({z: L1}).map(x => x[0]); o.dn = seq({z: L1, m: 'dn'}).map(x => x[0]); o.ud = seq({z: L1, m: 'ud'}).map(x => x[0]);
      o.fix = seq({z: L1, m: 'fix', f: [2, 0, 3, 1]}).map(x => x[0]);
      o.rnd = seq({z: L1, m: 'rnd', n: 6, s: 12345}, 400).map(x => x[0]); o.rnd2 = seq({z: L1, m: 'rnd', n: 6, s: 12345}, 400).map(x => x[0]); o.rnd3 = seq({z: L1, m: 'rnd', n: 6, s: 999}, 400).map(x => x[0]);
      o.rnd2s = seq({z: L1, m: 'rnd', n: 2, s: 5}, 50).map(x => x[0]);
      o.gegen = seq({z: L2, n: 5, v: 'gegen'}); o.gleich = seq({z: L2, n: 5, v: 'gleich'}); o.pp = seq({z: L2, n: 4, v: 'pp'});
      o.spreiz = seq({z: L3, n: 4, v: 'spreiz', m: 'ud'}, 16); o.spreizT = N.tab(i);
      o.wav = seq({z: [lane(i, 'o1w', 0, 3), lane(i, 'o2w', 0, 3)], n: 4, v: 'spreiz', m: 'rnd', s: 3}, 200); o.wavT = N.tab(i);
      o.rndG = seq({z: L2, n: 6, v: 'gegen', m: 'rnd', s: 11}, 200);
      // live: genau ein Schritt je Note, Akkord = ein Schritt, „jede Note“
      set({z: L1, n: 8}); N.reset(i); N.log(true);
      const c = AU.ctx, t0 = c.currentTime + .2;
      for (let q = 0; q < 6; q++) { const v = live(i, 60 + q, t0 + q * .1); if (v) v.release(t0 + q * .1 + .05); }
      o.one = N.log().map(l => l.k);
      N.reset(i); N.log(true); const t1 = c.currentTime + .2;
      for (const n of [60, 64, 67]) { const v = live(i, n, t1); if (v) v.release(t1 + .1); }
      for (const n of [62, 65]) { const v = live(i, n, t1 + .02); if (v) v.release(t1 + .1); }   // 20 ms später: noch derselbe Akkord
      for (const n of [60, 64]) { const v = live(i, n, t1 + .3); if (v) v.release(t1 + .4); }
      o.chord = N.log().map(l => [l.k, l.idx[0]]);
      set({z: L1, n: 8, ak: 1}); N.reset(i); N.log(true); const t2 = c.currentTime + .2;
      for (const n of [60, 64, 67]) { const v = live(i, n, t2); if (v) v.release(t2 + .1); }
      o.chordEach = N.log().map(l => [l.k, l.idx[0]]);
      // Rücknahme (cancelTrackFrom) und dieselbe Note neu geplant
      set({z: L1, n: 8}); N.reset(i); N.log(true); const t3 = c.currentTime + .5;
      for (let q = 0; q < 4; q++) live(i, 60, t3 + q * .25);
      cancelTrackFrom(i, t3 + .5 - 1e-3);                                                   // die Noten 3 und 4 fallen weg
      for (let q = 2; q < 4; q++) live(i, 62, t3 + q * .25);                                // neu geplant (andere Tonhöhe)
      o.cancel = N.log().map(l => l.k);
      N.reset(i); N.log(true); const t4 = c.currentTime + .5; live(i, 60, t4); live(i, 60, t4 + .25); live(i, 60, t4 + .25);   // dieselbe Note zweimal geplant
      o.respawn = N.log().map(l => l.k);
      // Lock gewinnt; Vorschau / Vorhören zählen nicht
      N.reset(i); const ov = nst1Voice(i, 60, c.currentTime + .1, {src: 'clip', lk: [LKT.o1semi.wi, 5]}, S.tracks[i].sound);
      o.lock = ov.lk; N.reset(i); N.log(true);
      nst1Voice(i, 60, c.currentTime + .1, {src: 'preview'}, S.tracks[i].sound); nst1Voice(i, 60, c.currentTime + .2, {src: 'audition'}, S.tracks[i].sound);
      o.prev = N.log().length;
      // Rückstellen: ▶ (runId), Clip-Start mit „neu ab Clip“ an / aus
      set({z: L1, n: 8, rs: 1}); N.reset(i); N.log(true);
      const tt = () => c.currentTime + .3;
      live(i, 60, tt()); live(i, 60, tt() + .1);
      R.runId++; live(i, 60, tt() + .2);
      R.cstart[i] = (R.cstart[i] || 0) + 4; live(i, 60, tt() + .3); live(i, 60, tt() + .4);
      set({z: L1, n: 8, rs: 0}); live(i, 60, tt() + .5); R.cstart[i] += 4; live(i, 60, tt() + .6);
      o.rs = N.log().map(l => l.k);
      set({z: L1, n: 8}); N.reset(i); N.log(true);
      return o;
    });
    const eq = (a, e) => JSON.stringify(a) === JSON.stringify(e);
    ok(eq(r.up, [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3]), 'B1 Hoch (4 Schritte): 1 2 3 4 1 2 …', r.up.join(''));
    ok(eq(r.dn, [3, 2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0]), 'B1 Runter', r.dn.join(''));
    ok(eq(r.ud, [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1]), 'B1 Hoch-Runter (ohne doppelte Spitze)', r.ud.join(''));
    ok(eq(r.fix, [2, 0, 3, 1, 2, 0, 3, 1, 2, 0, 3, 1]), 'B1 Fest (Liste 3-1-4-2)', r.fix.join(''));
    const rep = a => a.some((x, k) => k && x === a[k - 1]);
    const cover = a => new Set(a).size;
    ok(!rep(r.rnd) && cover(r.rnd) === 6 && !rep(r.rnd2s), 'B2 Zufall: in 400 Noten nie zweimal derselbe Schritt hintereinander, alle 6 Stufen kommen vor (auch bei 2 Schritten: Wechsel)', {wdh: rep(r.rnd), stufen: cover(r.rnd)});
    ok(eq(r.rnd, r.rnd2) && !eq(r.rnd, r.rnd3), 'B2 Zufall mit Saat: gleiche Saat = gleiche Folge (Song/Video gleich), andere Saat = andere Folge');
    const hist = [0, 0, 0, 0, 0, 0]; r.rnd.forEach(x => hist[x]++);
    ok(Math.min(...hist) > 40, 'B2 Zufall gleichmäßig verteilt (400 Noten, je Stufe > 40)', hist.join('/'));
    ok(r.gegen.every(x => x[1] === 4 - x[0]) && r.gegen.some(x => x[0] === x[1]), 'B3 Gegenläufig: Bahn 2 = gespiegelte Treppe (hoch ↔ runter), sie kreuzen sich in der Mitte', r.gegen.slice(0, 5).map(x => x.join('/')).join(' '));
    ok(r.gleich.every(x => x[0] === x[1]), 'B3 Gleich: beide Bahnen auf derselben Stufe');
    const ppMoves = r.pp.slice(1).map((x, k) => [x[0] !== r.pp[k][0], x[1] !== r.pp[k][1]]);
    ok(ppMoves.every(([a, c]) => a !== c), 'B3 Ping-Pong: je Note bewegt sich genau eine Bahn, reihum', r.pp.slice(0, 6).map(x => x.join('/')).join(' '));
    const sp = r.spreiz.map(ix => ix.map((q, j) => r.spreizT[j].vals[q]));
    const lo = Math.max(...sp.map(v => v[1])), mid = [Math.min(...sp.map(v => v[0])), Math.max(...sp.map(v => v[0]))], hi = Math.min(...sp.map(v => v[2]));
    ok(sp.every(v => v[1] < v[0] && v[0] < v[2]) && lo < mid[0] && mid[1] < hi, 'B3 Spreizen (3 Sägen, Verstimmung): Tiefe < Mitte < Höhe bei jeder Note, Bereiche getrennt – nie ein perfekter Layer', {tiefe_max: +lo.toFixed(1), mitte: mid.map(x => +x.toFixed(1)), hoehe_min: +hi.toFixed(1)});
    const sd = sp.map(v => v[1] - (sp[0][1])); const sh = sp.map(v => v[2] - sp[0][2]);
    ok(sd.slice(1, 4).every(x => x <= 0) && sh.slice(1, 4).every(x => x >= 0), 'B3 Spreizen: Tiefe läuft abwärts, Höhe aufwärts (andere Richtung)', {tiefe: sp.slice(0, 4).map(v => +v[1].toFixed(1)), hoehe: sp.slice(0, 4).map(v => +v[2].toFixed(1))});
    const wv = r.wav.map(ix => ix.map((q, j) => r.wavT[j].vals[q]));
    ok(wv.every(v => v[0] !== v[1]) && new Set(wv.map(v => v.join())).size >= 4, 'B3 Wellen-Zufall gespreizt: Osz 1 und Osz 2 nie dieselbe Welle (200 Noten)', [...new Set(wv.map(v => v.join('+')))].slice(0, 6).join(' '));
    ok(r.rndG.some(x => x[0] !== 5 - x[1]) && !rep(r.rndG.map(x => x[0])) && !rep(r.rndG.map(x => x[1])), 'B3 Zufall gegenläufig: jede Bahn würfelt selbst (keine Spiegelung), keine Wiederholung je Bahn');
    ok(eq(r.one, [0, 1, 2, 3, 4, 5]), 'B4 Jede neue Note (verschiedene Tonhöhen, nacheinander) = genau ein Schritt', r.one.join(','));
    ok(eq(r.chord.map(x => x[0]), [0, 0, 0, 0, 0, 1, 1]) && r.chord.slice(0, 5).every(x => x[1] === r.chord[0][1]), 'B4 Akkord-Regel: Töne mit ≤ 35 ms Abstand = ein Schritt (alle Töne denselben Wert), der nächste Akkord = nächster Schritt', r.chord.map(x => x.join(':')).join(' '));
    ok(eq(r.chordEach.map(x => x[0]), [0, 1, 2]), 'B4 Schalter „jede Note“: jeder Ton eines Akkords ein eigener Schritt (Treppe im Akkord)', r.chordEach.map(x => x.join(':')).join(' '));
    ok(eq(r.cancel, [0, 1, 2, 3, 2, 3]), 'B5 Neu-Planung (cancelTrackFrom): gestrichene Noten zählen nicht, die neu geplanten bekommen ihre Schritte (kein Sprung)', r.cancel.join(','));
    ok(eq(r.respawn, [0, 1, 1]), 'B5 Dieselbe Note noch einmal geplant (gleiche Zeit + Taste) = derselbe Schritt', r.respawn.join(','));
    ok(r.lock && r.lock.length === 2 && r.lock[1] === 5, 'B6 Ein Noten-Lock auf demselben Regler gewinnt (Je Note fügt nichts hinzu)', r.lock);
    ok(r.prev === 0, 'B6 Browser-Vorschau und Vorhören im Noten-Editor zählen nicht');
    ok(eq(r.rs, [0, 1, 0, 0, 1, 0, 1]), 'B7 Rückstellen: ▶ = Schritt 1; Clip-/Szenenstart mit „neu ab Clip: Start“ = Schritt 1; „weiterzählen“ zählt über den Clipstart weiter (jede Änderung der Einstellung beginnt neu)', r.rs.join(','));
    await p.close();
  }

  /* ================= C: Klang je Engine (App-eigener Render: Song → OfflineAudioContext → Worklet) ================= */
  {
    const p = await page();
    const r = await run(p, async () => {
      const st = await host(), i = synth(), o = {host: st};
      const eight = Array.from({length: 8}, (_, k) => ({t: k, d: .5, n: 60, v: .8}));
      // VA: Osz 1 Sinus, Intervall 0…12 hoch
      applySound(i, factorySound(INIT_IDS.analog)); for (const [k, v] of [['o1w', 3], ['o1lvl', 1], ['o2lvl', 0], ['o3lvl', 0], ['analog', 0], ['cutoff', 20000], ['aA', .002], ['aS', 1], ['aR', .03]]) setP(i, k, v);
      solo(i, eight); N.set(i, {on: 1, n: 4, m: 'up', z: [lane(i, 'o1semi', 0, 12)]});
      let s = await render(); o.va = {sr: s.sr, x: Array.from(s.l), wk: !!(s && SynthHost.state === 'ready')};
      // gegenläufig mit 2 Osz: Osz 1 aus, Osz 2 allein (Bahn 1) – dann Osz 3 allein (Bahn 2)
      for (const [k, v] of [['o1lvl', 0], ['o2lvl', 1], ['o2w', 3], ['o3lvl', 0], ['o3w', 3], ['o2fine', 0], ['o3oct', 0]]) setP(i, k, v);
      N.set(i, {on: 1, n: 5, m: 'up', v: 'gegen', z: [lane(i, 'o2semi', -6, 6), lane(i, 'o3semi', -6, 6)]});
      s = await render(); o.g2 = Array.from(s.l);
      setP(i, 'o2lvl', 0); setP(i, 'o3lvl', 1); s = await render(); o.g3 = Array.from(s.l);
      // Engine mk: Osz 2 Intervall (Osz 1 stumm)
      mkLoad(); for (let k = 0; k < 100 && !mkLoaded(); k++) await wait(100);
      applySound(i, factorySound(INIT_IDS.mk)); await wait(300);
      const mk = S.tracks[i].sound.p.mk; SQMK.mkPathSet(mk, 't.0.mix.o1', 0); SQMK.mkPathSet(mk, 't.0.mix.o2', 127); applySound(i, S.tracks[i].sound);
      N.set(i, {on: 1, n: 4, m: 'up', z: [lane(i, 'mk.t.0.o2.semi', 0, 12)]}); s = await render(); o.mk = Array.from(s.l);
      // FM: OP 1 Verhältnis ×1 … ×4
      applySound(i, factorySound(INIT_IDS.fm6)); await wait(300);
      N.set(i, {on: 1, n: 4, m: 'up', z: [lane(i, 'fm6.ops.0.coarse', 1, 4)]}); s = await render(); o.fm = Array.from(s.l);
      // WT (nativ): Position 0 … 1
      applySound(i, factorySound(INIT_IDS.wt)); await wait(300);
      N.set(i, {on: 1, n: 4, m: 'up', z: [lane(i, 'wt.pos', 0, 1)]}); s = await render(); o.wt = Array.from(s.l);
      o.spb = spb(); return o;
    });
    const sr = r.va.sr, S_ = r.spb * sr;
    ok(r.host === 'ready', 'C0 Worklet (Studio-Klang) geladen – die Messungen laufen über den Worklet-Weg', r.host);
    const va = semis(perNote(r.va.x, sr, S_, 8, zc));
    ok(va.every((v, q) => Math.abs(v - [0, 4, 8, 12][q % 4]) < .15), 'C1 Analog: 8 gleiche Noten C4, Intervall Osz 1 hoch in 4 Schritten → gemessen ' + va.join(' / ') + ' HT');
    const g2 = semis(perNote(r.g2, sr, S_, 5, zc)), g3 = semis(perNote(r.g3, sr, S_, 5, zc));
    ok(g2.every((v, q) => Math.abs(v - 3 * q) < .2) && g3.every((v, q) => Math.abs(v + 3 * q) < .2), 'C2 Gegenläufig gemessen: Osz 2 steigt (' + g2.join(' ') + '), Osz 3 fällt (' + g3.join(' ') + ') – sie kreuzen sich bei Note 3');
    const mk = semis(perNote(r.mk, sr, S_, 8, zc));
    ok(mk.every((v, q) => Math.abs(v - [0, 4, 8, 12][q % 4]) < .2), 'C3 Engine mk: Osz 2 Intervall je Note → ' + mk.join(' / ') + ' HT');
    const fm = semis(perNote(r.fm, sr, S_, 8, zc));
    ok(fm.every((v, q) => Math.abs(v - [0, 12, 19.02, 24][q % 4]) < .2), 'C4 FM: OP 1 Verhältnis ×1 ×2 ×3 ×4 je Note → ' + fm.join(' / ') + ' HT');
    const wt = perNote(r.wt, sr, S_, 8, bright), wr = wt.map(v => +(v / wt[0]).toFixed(2));
    ok(wr[1] > wr[0] && wr[2] > wr[1] && wr[3] > wr[2] && Math.abs(wr[4] - 1) < .05, 'C5 Wavetable (nativer Weg): Position je Note → Helligkeit steigt ' + wr.join(' / '));
    await p.close();
  }

  /* ================= D: klickfrei (Spitzen-Messung: größte Sample-Differenz / Sinus-Steigung) ================= */
  {
    const p = await page();
    const r = await run(p, async () => {
      await host(); const i = synth(), out = {};
      for (const mode of [0, 1, 2]) for (const nst of [0, 1]) {
        applySound(i, factorySound(INIT_IDS.analog));
        for (const [k, v] of [['o1w', 2], ['o1lvl', 1], ['o2lvl', 0], ['o3lvl', 0], ['analog', 0], ['cutoff', 20000], ['aA', .002], ['aS', 1], ['aR', .05], ['mode', mode], ['drive', 0]]) setP(i, k, v);
        solo(i, Array.from({length: 8}, (_, k) => ({t: k, d: 1, n: 60, v: .8})));
        if (nst) N.set(i, {on: 1, n: 2, m: 'up', z: [lane(i, 'o1w', 2, 3)]}); else N.set(i, null);
        const s = await render(), x = s.l; let mx = 0, amp = 0;
        for (let k = 1; k < x.length; k++) { const d = Math.abs(x[k] - x[k - 1]); if (d > mx) mx = d; if (Math.abs(x[k]) > amp) amp = Math.abs(x[k]); }
        out[['POLY', 'MONO', 'LEGATO'][mode] + (nst ? '+JeNote' : '')] = +(mx / (amp * 2 * Math.PI * 261.63 / s.sr)).toFixed(2);
      }
      return out;
    });
    ok(Object.values(r).every(v => v < 1.5), 'D1 klickfrei: Wellen-Wechsel Dreieck ↔ Sinus je Note, lückenlose Noten – Spitze/Sinus-Steigung ≤ 1,5 in POLY, MONO, LEGATO (vor NST1W: MONO/LEGATO 17,7)', r);
    await p.close();
  }

  /* ================= E: CPU vorher / nachher ================= */
  {
    const tm = async (f, nst) => {
      const p = await page(428, 926, f);
      const r = await run(p, async nst => {
        await host(); const i = synth(); applySound(i, factorySound(INIT_IDS.analog));
        const notes = []; for (let k = 0; k < 32; k++) for (const n of [48, 55, 60, 64, 67, 71]) notes.push({t: k * .5, d: .45, n, v: .8});
        solo(i, notes, 4);
        if (nst && typeof N !== 'undefined' && N) N.set(i, {on: 1, n: 8, m: 'rnd', v: 'gegen', ak: 1, z: [lane(i, 'o1w', 0, 3), lane(i, 'o2semi', -12, 12), lane(i, 'o3fine', -50, 50)]});
        if (N) N.cpuReset();
        const ms = []; for (let k = 0; k < 3; k++) ms.push((await render()).ms);
        return {ms, cpu: N ? N.cpu() : null};
      }, nst);
      await p.close(); return r;
    };
    // Basis hat kein SYNQUENZER.nst1: dort N = undefined → der Helfer fängt das ab
    const base = await (async () => { const p = await page(428, 926, basis); const r = await p.evaluate('(async () => { ' + H.replace("const N = SYNQUENZER.nst1, lane = (i, p, lo, hi) => N.lane(i, p, lo, hi);", "const N = null, lane = null;") + ` await host(); const i = synth(); applySound(i, factorySound(INIT_IDS.analog));
        const notes = []; for (let k = 0; k < 32; k++) for (const n of [48, 55, 60, 64, 67, 71]) notes.push({t: k * .5, d: .45, n, v: .8}); solo(i, notes, 4);
        const ms = []; for (let k = 0; k < 3; k++) ms.push((await render()).ms); return {ms}; })()`); await p.close(); return r; })();
    const off = await tm(file, false), on = await tm(file, true);
    const med = a => a.slice().sort((x, y) => x - y)[1];
    info('E1 Render-Zeit 4 Takte, 192 Noten (6er-Akkorde, 8 Stimmen), je 3 Läufe, Median ms: Basis ' + med(base.ms).toFixed(0) + ' · NST1 aus ' + med(off.ms).toFixed(0) + ' · NST1 an (3 Bahnen, jede Note) ' + med(on.ms).toFixed(0), {basis: base.ms.map(Math.round), aus: off.ms.map(Math.round), an: on.ms.map(Math.round)});
    ok(med(off.ms) < med(base.ms) * 1.15, 'E1 Je Note aus: Render-Zeit wie Basis (± 15 %, 4 Kerne geteilt)');
    ok(med(on.ms) < med(base.ms) * 1.25, 'E2 Je Note an (3 Bahnen, 192 Noten): Render-Zeit höchstens + 25 % (Paare je Note-an, im Audio-Faden keine Zuweisung)');
    ok(on.cpu && on.cpu.n >= 192 && on.cpu.avgMs < .3, 'E3 Haupt-Faden je Note: Schritt + Paare im Mittel < 0,3 ms', on.cpu);
  }

  /* ================= F: Speichern / Laden, Undo ================= */
  {
    const p = await page();
    const r = await run(p, async () => {
      await host(); const i = synth(), o = {};
      const u0 = UNDO.length; N.preset(i, 'radio'); o.u1 = UNDO.length - u0; o.get = N.get(i);
      o.mods = S.tracks[i].sound.mods.some(m => m.src === 'menv' && m.dst === 'o2pitch');
      const json = SYNQUENZER.serialize(); o.inJson = /"nst":\{/.test(json);
      SYNQUENZER.importJSON(json); await wait(400);
      const i2 = synth(); o.after = N.get(i2);
      // Bibliothek / Klang-Datei: normalizeSound behält das Feld
      o.norm = !!SQStore.normalizeSound(JSON.parse(JSON.stringify(S.tracks[i2].sound))).nst;
      // Undo: Schnellwahl = ein Schritt; ↶ = ohne Je Note und ohne die Begleit-Änderungen; ↷ = wieder da
      N.set(i2, null); const n0 = UNDO.length; N.preset(i2, 'radio'); N.preset(i2, 'gegen'); o.u2 = UNDO.length - n0;   // nach dem Laden ist die ↶-Liste neu
      undo(); o.undo1 = N.get(i2) && N.get(i2).pr; undo(); o.undo2 = N.get(i2); redo(); o.redo = N.get(i2) && N.get(i2).pr;
      // jede Änderung im Blatt = ein Schritt (Muster, Schritte, Bereich): über die Knöpfe
      selectTrack(i2); ED.tab = 'osc'; openEditor(); await wait(200); N.open(i2); await wait(300);
      const P = document.querySelector('.pop.nst1pop'), n1 = UNDO.length;
      P.querySelector('button[data-m="dn"]').click(); await wait(50);
      document.querySelector('.pop.nst1pop button[data-n="6"]').click(); await wait(50);
      document.querySelector('.pop.nst1pop button[data-r="0b-"]').click(); await wait(50);
      o.u3 = UNDO.length - n1; o.cfg = N.get(i2);
      closePop(); closeEditor();
      // MIDI-Export unberührt: dieselben Bytes mit und ohne Je Note
      const mid = () => { const m = SYNQUENZER.buildMidi({mode: 'all'}); const u = m && (m.bytes || m.data || m); return u && u.length != null ? Array.from(u).join(',') : JSON.stringify(m); };
      N.set(i2, null); const m1 = mid(); N.preset(i2, 'radio'); const m2 = mid(); o.midi = m1 === m2 && m1.length > 100; o.midiLen = m1.split(',').length;
      // Engine mk: ⋯-Menü hat den Eintrag (Platten-Editor), Ziele der Engine
      mkLoad(); for (let k = 0; k < 100 && !mkLoaded(); k++) await wait(100);
      applySound(i2, factorySound(INIT_IDS.mk)); await wait(300); selectTrack(i2); openEditor(); await wait(500);
      const em = [...document.querySelectorAll('#synthSheet .hb.edm')].find(x => x.getClientRects().length && getComputedStyle(x).display !== 'none');
      if (em) { openEdMore(em, i2); await wait(200); }
      o.mkMenu = !!document.querySelector('.pop button[data-a="nst1"]'); o.mkKinds = N.kinds(i2).map(k => k.l); o.mkPre = N.presets(i2).map(x => x.l);
      closePop(); closeEditor();
      return o;
    });
    ok(r.u1 === 1 && r.get && r.get.on === 1 && r.get.pr === 'Sendersuche', 'F1 Schnellwahl Sendersuche = ein ↶-Schritt (Je Note + Begleit-Änderungen zusammen)', {schritte: r.u1});
    ok(r.mods, 'F1 Sendersuche setzt Hüllk. 2 → Osz-2-Tonhöhe (Gleiten) nur, wenn noch keine Route auf Osz 2 liegt');
    ok(r.inJson && JSON.stringify(r.after) === JSON.stringify(r.get), 'F2 Speichern → Laden: Je-Note-Einstellung bitgleich zurück');
    ok(r.norm, 'F2 Klang sichern / Klang-Datei (normalizeSound): Feld bleibt erhalten');
    ok(r.u2 === 2 && r.undo1 === 'Sendersuche' && r.undo2 === null && r.redo === 'Sendersuche', 'F3 ↶ ↷: Schnellwahl zurück auf die vorige, noch einmal ↶ = Je Note weg, ↷ = wieder da', {u2: r.u2, undo1: r.undo1, undo2: r.undo2, redo: r.redo});
    ok(r.u3 === 3 && r.cfg.m === 'dn' && r.cfg.n === 6, 'F4 Im Blatt: Muster, Schritte, Bereich = je ein ↶-Schritt', {schritte: r.u3, m: r.cfg.m, n: r.cfg.n});
    ok(r.midi, 'F5 MIDI-Export unberührt: alle Szenen als MIDI mit und ohne Je Note bytegleich', {bytes: r.midiLen});
    ok(r.mkMenu && r.mkKinds.length === 5 && r.mkPre.length === 3, 'F6 Engine mk: ⋯-Menü hat „Je Note weiterschalten“, Ziele ' + r.mkKinds.join(' · ') + ', Schnellwahl ' + r.mkPre.join(' · '));
    await p.close();
  }

  /* ================= G: Bedienung per Touch (hochkant / quer), Fotos ================= */
  for (const [w, h, n] of [[428, 926, 'hochkant'], [926, 428, 'quer']]) {
    const p = await page(w, h);
    await run(p, async () => { await host(); const i = S.tracks.findIndex(t => t.kind === 'synth' && t.sound.engine === 'analog'); selectTrack(i); ED.tab = 'osc'; ED.sub.osc = 'o2'; openEditor(); await wait(500); });
    // ⋯ → Eintrag „Je Note weiterschalten“
    const more = await p.evaluate(() => { const b = [...document.querySelectorAll('#synthSheet .hb.edm')].find(x => x.getClientRects().length && getComputedStyle(x).display !== 'none'); if (!b) return null; const r = b.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
    ok(!!more, 'G1 ' + n + ': ⋯ im Klang-Editor sichtbar');
    if (more) await tap(p, more.x, more.y);
    const ent = await ctr(p, '.pop button[data-a="nst1"]');
    ok(!!ent && ent.h >= 43.5, 'G1 ' + n + ': ⋯-Menü hat „Je Note weiterschalten“ (≥ 44 px)', ent);
    await p.screenshot({path: path.join(fotos, 'nst1-menue-' + n + '.png')});
    if (ent) await tap(p, ent.x, ent.y);
    await p.waitForTimeout(300);
    let st = await p.evaluate(() => { const P = document.querySelector('.pop.nst1pop'); if (!P) return null; const r = P.getBoundingClientRect(); const small = [...P.querySelectorAll('button')].filter(b => b.getClientRects().length && !b.classList.contains('ux1-px')).map(b => b.getBoundingClientRect()).filter(q => q.height < 43.5 || q.width < 30).length; return {in: r.left >= 7.5 && r.top >= 7.5 && r.right <= innerWidth - 7.5 && r.bottom <= innerHeight - 7.5, small, scroll: P.scrollHeight > P.clientHeight}; });
    ok(st && st.in && st.small === 0, 'G2 ' + n + ': Blatt „Je Note“ ganz im Bild (8 px Rand), alle Tasten ≥ 44 px hoch' + (st && st.scroll ? ', innen rollbar' : ''), st);
    // Tipp auf die Schnellwahl „Sendersuche“
    await tapSel(p, '.pop.nst1pop button[data-pr="radio"]');
    let g = await p.evaluate(() => ({c: SYNQUENZER.nst1.get(R.selT), mark: [...document.querySelectorAll('#synthSheet .hb.edm')].some(b => b.classList.contains('n1on'))}));
    ok(g.c && g.c.on === 1 && g.c.pr === 'Sendersuche', 'G3 ' + n + ': Tipp „Sendersuche“ → Je Note an, 2 Bahnen (Osz 2 Intervall + Verstimmung), Zufall', g.c && {z: g.c.z.map(z => z.p), m: g.c.m});
    ok(g.mark, 'G3 ' + n + ': Strich am ⋯ zeigt „Je Note an“');
    await p.screenshot({path: path.join(fotos, 'nst1-sendersuche-' + n + '.png')});
    // Muster-Bild „Runter“ antippen (rollt ggf. ins Bild)
    await p.evaluate(() => { const b = document.querySelector('.pop.nst1pop button[data-m="dn"]'); if (b) b.scrollIntoView({block: 'center'}); }); await p.waitForTimeout(150);
    await tapSel(p, '.pop.nst1pop button[data-m="dn"]');
    g = await p.evaluate(() => SYNQUENZER.nst1.get(R.selT));
    ok(g && g.m === 'dn' && !g.pr, 'G4 ' + n + ': Bild-Knopf „Runter“ antippen → Muster Runter (Schnellwahl-Name fällt weg)');
    await p.evaluate(() => { const b = document.querySelector('.pop.nst1pop button[data-a="probe"]'); if (b) b.scrollIntoView({block: 'center'}); }); await p.waitForTimeout(150);
    await p.screenshot({path: path.join(fotos, 'nst1-blatt-unten-' + n + '.png')});
    // ▶ 8 Noten
    await run(p, async () => { N.log(true); }); await tapSel(p, '.pop.nst1pop button[data-a="probe"]'); await p.waitForTimeout(400);
    const pr = await run(p, async () => N.log().map(l => l.k));
    ok(pr.length === 8 && pr.every((k, q) => k === q), 'G5 ' + n + ': „▶ 8 Noten“ spielt 8 Noten ab Schritt 1 (jede ein Schritt)', pr.join(','));
    // schließen: Tipp daneben
    await run(p, async () => closePop()); await p.waitForTimeout(200);
    // Regler lange drücken → Chip „Je Note“ (Osz 3 HT)
    await run(p, async () => { N.set(R.selT, null); ED.sub.osc = 'o3'; safeRebuild(buildSynthEd); await wait(400); });
    const kn = await ctr(p, '#synthSheet .knob[data-key="o3semi"]');
    ok(!!kn, 'G6 ' + n + ': Regler Osz 3 HT sichtbar');
    if (kn) {
      await tDown(p, kn.x, kn.y); await p.waitForTimeout(750); await tUp(p); await p.waitForTimeout(400);
      const chip = await ctr(p, '.pop.pk .pchip[data-act$="nst1"]');
      ok(!!chip, 'G6 ' + n + ': Regler lange drücken → Auswahl hat den Chip „Je Note“', chip);
      await p.screenshot({path: path.join(fotos, 'nst1-regler-chip-' + n + '.png')});
      if (chip) await tap(p, chip.x, chip.y);
      await p.waitForTimeout(400);
      g = await p.evaluate(() => ({c: SYNQUENZER.nst1.get(R.selT), open: !!document.querySelector('.pop.nst1pop')}));
      ok(g.c && g.c.on === 1 && g.c.z.length === 1 && g.c.z[0].p === 'o3semi' && g.open, 'G6 ' + n + ': Chip antippen → Je Note an für Osz 3 Intervall, Blatt offen', g.c && g.c.z.map(z => z.p));
      await p.screenshot({path: path.join(fotos, 'nst1-vom-regler-' + n + '.png')});
      // zweiter Regler (Osz 2 HT) dazu → Verbund aus 2 Bahnen
      await run(p, async () => { closePop(); ED.sub.osc = 'o2'; safeRebuild(buildSynthEd); await wait(400); });
      const k2 = await ctr(p, '#synthSheet .knob[data-key="o2semi"]');
      if (k2) { await tDown(p, k2.x, k2.y); await p.waitForTimeout(750); await tUp(p); await p.waitForTimeout(400); const c2 = await ctr(p, '.pop.pk .pchip[data-act$="nst1"]'); if (c2) await tap(p, c2.x, c2.y); await p.waitForTimeout(300); }
      g = await p.evaluate(() => SYNQUENZER.nst1.get(R.selT));
      ok(g && g.z.map(z => z.p).join() === 'o2semi,o3semi', 'G7 ' + n + ': zweiten Regler (Osz 2 HT) lange drücken › Je Note → Verbund Osz 2 + Osz 3 (on the fly)', g && g.z.map(z => z.p));
    }
    await run(p, async () => { closePop(); closeEditor(); });
    await p.close();
  }

  /* ================= H: Guide ================= */
  {
    const p = await page();
    const r = await run(p, async () => ({s1: SYNQUENZER.ui1 ? null : null, hits: ui1Search('sendersuche').map(E => E.id), hits2: ui1Search('je note').map(E => E.id), hits3: ui1Search('treppe').map(E => E.id)}));
    ok(r.hits.includes('nst1') && r.hits2.includes('nst1'), 'H1 Guide: Suche „Sendersuche“ / „je note“ findet „Je Note weiterschalten“', r);
    const g = await run(p, async () => { const E = ui1Entries().find(x => x.id === 'nst1'); const okGo = E.go(); await wait(500); return {okGo, open: !!document.querySelector('.pop.nst1pop'), d: E.d}; });
    ok(g.okGo && g.open, 'H2 Guide-Sprung öffnet Klang-Editor + Blatt „Je Note“');
    info('H3 Guide-Text', g.d);
    await p.close();
  }

  /* ================= I: Startzeit (bis SYNQUENZER bereit), Basis gegen NST1 abwechselnd ================= */
  {
    const T = {b: [], n: []};
    for (let k = 0; k < 4; k++) for (const [key, f] of [['b', basis], ['n', file]]) {
      const p = await b.newPage({viewport: {width: 428, height: 926}}); const t0 = Date.now();
      await p.goto('file://' + f); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 60000});
      const nav = await p.evaluate(() => { const e = performance.getEntriesByType('navigation')[0]; return e ? e.domContentLoadedEventEnd : 0; });
      T[key].push(Date.now() - t0); await p.close(); void nav;
    }
    const med = a => { const s = a.slice().sort((x, y) => x - y); return (s[1] + s[2]) / 2; };
    info('I1 Startzeit bis bereit (ms, 4 Läufe je Fassung, abwechselnd)', {basis: T.b, nst1: T.n});
    ok(med(T.n) < med(T.b) * 1.1 + 30, 'I1 Startzeit nicht messbar schlechter (Median NST1 ' + med(T.n) + ' ms gegen Basis ' + med(T.b) + ' ms)');
  }
  ok(!errs.length, 'Z Konsole ohne Fehler', errs.slice(0, 5));
} catch (e) { ok(false, 'Abbruch: ' + (e && e.stack || e)); }
await b.close();
console.log('ERGEBNIS ' + (all - bad) + '/' + all);
fs.writeFileSync(path.join(out, 'test-ergebnis.txt'), res.join('\n') + '\nERGEBNIS ' + (all - bad) + '/' + all + '\n');
