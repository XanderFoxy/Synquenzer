// ARP1-Test „Arp für jede Synth-Spur“. Aufruf: node arp1-test.mjs <index.html> [ordner] [abschnitte, z. B. ABC]   (Basis = basis.html daneben)
// A Basis-gleich (Bild, Datei, MS-Platte/Bit Mask unverändert) · B Kern (Muster Note für Note, Raten, Triolen, Swing, Oktave „Da dub“,
// Key Sync, Latch, Live) · C Planer = Rechnung, Matrix + Song (Echtzeit) = Offline-Render · D MIDI-Export · E Festschreiben + ↶ ·
// F Speichern/Laden, Undo, Spur duplizieren · G keine hängenden Noten (Stopp, Szenenwechsel, stumm, Klangwechsel, Arp aus) ·
// H Bedienung per Touch hochkant/quer (Fotos) · I Guide · K Kosten (tick, Blatt laden, Startzeit) · Z 3 Minuten Wiedergabe
// Nur eigene Testnoten (C-Dur-Akkorde, Oktav-Bass-Figuren), kein Lied.
import { createRequire } from 'node:module'; import path from 'node:path'; import fs from 'node:fs';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
const file = path.resolve(process.argv[2]), out = path.resolve(process.argv[3] || path.dirname(file)), basis = path.join(path.dirname(file), 'basis.html');
const ONLY = process.argv[4] || 'ABCDEFGHIKZ';
const fotos = path.join(out, 'fotos'); fs.mkdirSync(fotos, {recursive: true});
let bad = 0, all = 0; const res = [];
const ok = (c, m, d) => { all++; const s = (c ? 'OK ' : 'FEHLER ') + m + (d != null ? ' – ' + (typeof d === 'string' ? d : JSON.stringify(d)) : ''); if (!c) bad++; console.log(s); res.push(s); };
const info = (m, d) => { const s = 'INFO ' + m + (d != null ? ' – ' + (typeof d === 'string' ? d : JSON.stringify(d)) : ''); console.log(s); res.push(s); };
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const errs = [];
async function page(w, h, f, quiet) {
  const p = await b.newPage({viewport: {width: w || 428, height: h || 926}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  if (!quiet) { p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); }
  await p.goto('file://' + (f || file)); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 60000}); await p.waitForTimeout(1200);
  p.cdp = await p.context().newCDPSession(p);
  return p;
}
const H = `const wait = ms => new Promise(r => setTimeout(r, ms));
  const host = async () => { ensureAudio(); for (let k = 0; k < 100 && SynthHost.state !== 'ready' && SynthHost.state !== 'failed'; k++) await wait(100); return SynthHost.state; };
  const va = () => S.tracks.findIndex(t => t.kind === 'synth' && t.sound.engine === 'analog');
  const A = SYNQUENZER.arp1;
  const solo = (i, notes, bars, songBars) => { for (const t of S.tracks) t.clips = t.clips.map(() => null); S.tracks[i].clips[0] = normClip({len: bars || 1, key: Object.assign({}, S.key), notes}, 'synth', S.key); SYNQUENZER.songFromChain([{scene: 0, bars: songBars || bars || 1}]); };
  const rend = async bars => { VV.cancel = false; const t0 = performance.now(); const s = await vvRenderAudio({range: {a: 0, b: bars || S.song.bars, sel: false}}); s.ms = performance.now() - t0; return s; };
  const lg = (s, i, src) => (s.log || []).filter(e => e.track === i && (!src || e.src === src) && !e.removed).map(e => ({b: e.beat, p: e.out, d: +(e.dur / spb()).toFixed(4), src: e.src})).sort((x, y) => x.b - y.b || x.p - y.p);
  const chordClip = (ps, d) => ps.map(n => ({t: 0, d: d || 4, n, v: .8}));
  const mapP = (i, n) => mapOut(i, S.tracks[i].clips[0].key, n, Infinity);`;
const run = (p, fn, arg) => p.evaluate('(async () => { ' + H + ' return (' + fn.toString() + ')(' + JSON.stringify(arg == null ? null : arg) + '); })()');
const tDown = (p, x, y) => p.cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id: 1, radiusX: 4, radiusY: 4, force: 1}]});
const tUp = p => p.cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
async function tap(p, x, y) { await tDown(p, x, y); await p.waitForTimeout(60); await tUp(p); await p.waitForTimeout(300); }
const ctr = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); if (!e || !e.getClientRects().length) return null; const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, top: r.top, bottom: r.bottom}; }, sel);
async function tapSel(p, sel) { await p.evaluate(s => { const e = document.querySelector(s); if (e) e.scrollIntoView({block: 'center'}); }, sel); await p.waitForTimeout(120); const c = await ctr(p, sel); if (!c) return false; await tap(p, c.x, c.y); return true; }
const eq = (a, e) => JSON.stringify(a) === JSON.stringify(e);
const near = (a, e, tol) => Math.abs(a - e) <= (tol || .002);
// MIDI-Datei lesen: Noten je Kanal [{t (Schlag), p, v, d}]
function midiNotes(bytes) {
  const u = Uint8Array.from(bytes); let o = 14; const ppq = (u[12] << 8) | u[13], out = [];
  while (o < u.length) {
    const len = (u[o + 4] << 24) | (u[o + 5] << 16) | (u[o + 6] << 8) | u[o + 7]; let q = o + 8; const end = q + len; let tk = 0, rs = 0; const open = new Map();
    while (q < end) {
      let d = 0, c; do { c = u[q++]; d = (d << 7) | (c & 127); } while (c & 128); tk += d;
      let st = u[q]; if (st & 128) q++; else st = rs;
      if (st === 0xFF) { q++; let l = 0; do { c = u[q++]; l = (l << 7) | (c & 127); } while (c & 128); q += l; continue; }
      rs = st; const hi = st & 0xF0, ch = st & 15;
      if (hi === 0x90 || hi === 0x80) { const p = u[q++], v = u[q++]; const k = ch + ':' + p;
        if (hi === 0x90 && v > 0) { const n = {ch, t: tk / ppq, p, v}; out.push(n); const L = open.get(k) || []; L.push(n); open.set(k, L); }
        else { const L = open.get(k); const n = L && L.shift(); if (n) n.d = tk / ppq - n.t; } }
      else if (hi === 0xC0 || hi === 0xD0) q += 1; else q += 2;
    }
    o = end;
  }
  return out.sort((x, y) => x.t - y.t || x.p - y.p);
}
try {
  /* ================= A: Basis-gleich ================= */
  if (ONLY.includes('A')) {
    for (const [w, h, n] of [[428, 926, 'hochkant'], [926, 428, 'quer']]) {
      const pa = await page(w, h, basis), pb = await page(w, h);
      ok(Buffer.compare(await pa.screenshot(), await pb.screenshot()) === 0, 'A1 Start-Bild pixelgleich zur Basis (' + n + ')');
      await pa.close(); await pb.close();
    }
    // Datei ohne Arp: dieselbe Projektdatei in Basis und ARP1 geladen und wieder gesichert = gleiche Bytes
    {
      const pa = await page(428, 926, basis), pb = await page();
      const j = await pa.evaluate(() => SYNQUENZER.serialize());
      const sa = await pa.evaluate(async j => { SYNQUENZER.importJSON(j); await new Promise(r => setTimeout(r, 500)); return SYNQUENZER.serialize(); }, j);
      const sb = await pb.evaluate(async j => { SYNQUENZER.importJSON(j); await new Promise(r => setTimeout(r, 500)); return SYNQUENZER.serialize(); }, j);
      const strip = s => s.replace(/"(saved|savedAt|mod|modified|at|t0|ts0)":\d+/g, '');
      ok(sa === sb || strip(sa) === strip(sb), 'A2 Projekt ohne Arp: in ARP1 geladen und gesichert = dieselbe Datei wie in 4.78.0 (kein Feld „arp“)', {laenge: sb.length, gleich: sa === sb, arp: /"arp":/.test(sb)});
      const r = await run(pb, async () => {
        const i = va(), o = {};
        const raw = JSON.parse(SYNQUENZER.serialize()); delete raw.sum; raw.project.tracks[i].arp = {on: 1, m: 'quatsch', r: 7, o: 9, g: 500, sw: -400, rep: 0, ks: 0, la: 1, fig: 0, x: 1};
        raw.project.tracks[i === 0 ? 1 : 0].arp = 'kaputt';
        SYNQUENZER.importJSON(JSON.stringify(raw)); await wait(500);
        o.a = S.tracks[i].arp; o.b = S.tracks[i === 0 ? 1 : 0].arp || null; o.drum = S.tracks.filter(t => t.kind === 'drum').some(t => t.arp);
        return o;
      });
      ok(r.a && eq(r.a, {on: 1, m: 'auf', r: 16, tri: 0, o: 4, g: 100, sw: -100, ks: 0, la: 1, rep: 1, fig: 0}) && r.b === null, 'A3 Laden bereinigt: unbekannte Werte → Standard/Grenzen, kaputtes Feld fällt weg', r.a);
      await pa.close(); await pb.close();
    }
    // MS-Platte (Engine mk) und Bit Mask: Arp-Noten im App-Render vorher (4.78.0) = nachher
    {
      const msRun = async f => {
        const p = await page(428, 926, f);
        const r = await run(p, async () => {
          await host(); const i = va(), o = {}; S.id = 'arp1-test-saat'; S.tracks[i].uid = 'arp1spur01';   // Zufall hängt an Projekt-ID + Spur-uid: in beiden Fassungen gleich setzen
          mkLoad(); for (let k = 0; k < 100 && !mkLoaded(); k++) await wait(100);
          applySound(i, factorySound(INIT_IDS.mk)); await wait(300);
          const mk = S.tracks[i].sound.p.mk;
          const notes = [...chordClip([60, 64, 67], 1.5), {t: 2, d: .25, n: 62, v: .8}, {t: 2.5, d: .5, n: 65, v: .9}, {t: 3.02, d: .4, n: 57, v: .7}];
          solo(i, notes, 1, 2);
          const L = [];
          for (const [ty, rg, rs, la, ks, gt, sw] of [[0, 2, 1, 0, 1, 80, 0], [6, 2, 1, 1, 1, 60, 0], [2, 3, 3, 0, 0, 100, 30], [4, 1, 0, 0, 1, 50, 0], [5, 1, 5, 0, 1, 70, -20]]) {
            mk.arp = Object.assign({}, mk.arp, {on: 1, type: ty, range: rg, res: rs, latch: la, ks, gate: gt, swing: sw}); applySound(i, S.tracks[i].sound);
            arpEndAll();   // gleicher Ausgangszustand in beiden Fassungen (4.78.0 behält nach einem Render mit Latch einen Arp-Zustand mit Render-Zeiten, siehe A5)
            const s = await rend(2); L.push(lg(s, i, 'arp').map(e => [e.b, e.p, e.d])); if (la) o.busyAfterLatch = ARPC.busy();
          }
          o.mk = L;
          // Bit Mask
          bmLoad(); for (let k = 0; k < 100 && !bmLoaded(); k++) await wait(100);
          applySound(i, factorySound(INIT_IDS.bm)); await wait(300);
          const B = [];
          for (const t of ['1oct', 'alt', 'trp', 'pon2', 'rnd2']) {
            S.tracks[i].sound.p.bm.a.ar = {t, sp: 240, ho: 0, tr: 1}; applySound(i, S.tracks[i].sound);
            arpEndAll(); const s = await rend(2); B.push(lg(s, i, 'arp').map(e => [e.b, e.p, e.d]));
          }
          o.bm = B;
          // Live (Platte, Transport steht): Tasten → Muster der Tonhöhen
          applySound(i, factorySound(INIT_IDS.mk)); await wait(200);
          S.tracks[i].sound.p.mk.arp = Object.assign({}, S.tracks[i].sound.p.mk.arp, {on: 1, type: 0, range: 2, res: 1, latch: 0, ks: 1, gate: 80}); applySound(i, S.tracks[i].sound);
          selectTrack(i); ARPC.clearLog(i);
          inputDown(60, 'm1', .8); inputDown(64, 'm2', .8); await wait(900); inputUp('m1'); inputUp('m2'); await wait(300);
          o.live = ARPC.arpLog(i).map(e => e.note).slice(0, 8);
          return o;
        });
        await p.close(); return r;
      };
      const ra = await msRun(basis), rb = await msRun(file);
      const dif = (A_, B_) => { for (let k = 0; k < A_.length; k++) if (!eq(A_[k], B_[k])) { const q = A_[k].findIndex((e, j) => !eq(e, B_[k][j])); return {fall: k, i: q, vorher: A_[k][q], nachher: B_[k][q], n: [A_[k].length, B_[k].length]}; } return null; };
      ok(ra.mk.every(x => x.length > 4) && eq(ra.mk, rb.mk), 'A4 Arp der MS-Platte (5 Einstellungen: Up, Treppe+Latch, Alt 1 ohne Key Sync mit Swing, Random, Trigger): Arp-Noten im App-Render nachher = vorher', eq(ra.mk, rb.mk) ? ra.mk.map(x => x.length) : dif(ra.mk, rb.mk));
      ok(ra.bm.every(x => x.length > 4) && eq(ra.bm, rb.bm), 'A4 Arp von Bit Mask (1oct, alt, trp, pon2, rnd2): nachher = vorher', eq(ra.bm, rb.bm) ? ra.bm.map(x => x.length) : dif(ra.bm, rb.bm));
      const cyc = L => L.length >= 6 && L.every((n, k) => n === [60, 64, 72, 76][k % 4]);
      ok(cyc(ra.live) && cyc(rb.live), 'A4 MS-Platte live (Tasten, Transport steht, Up 2 Okt.): vorher und nachher 60 64 72 76 …', {vorher: ra.live.join(' '), nachher: rb.live.join(' ')});
      info('A5 Arp-Zustand nach einem Render mit Latch (Live-Betrieb danach)', {vorher: ra.busyAfterLatch, nachher: rb.busyAfterLatch});
    }
  }

  /* ================= B: Kern – Muster, Raten, Swing, Oktave, Key Sync, Latch, Live ================= */
  if (ONLY.includes('B')) {
    const p = await page();
    const r = await run(p, async () => {
      await host(); const i = va(), o = {}; applySound(i, factorySound(INIT_IDS.analog)); S.settings.swing = 0;
      const pat = async (cfg, notes, bars) => { solo(i, notes, 1, bars || 1); A.set(i, Object.assign({on: 1, r: 16, tri: 0, o: 1, g: 80, sw: 0, ks: 1, la: 0, rep: 1, fig: 0}, cfg)); const s = await rend(bars || 1); return lg(s, i, 'arp'); };
      const CEG = chordClip([60, 64, 67], 4);
      for (const m of ['auf', 'ab', 'aufab', 'treppe', 'oktave']) o[m] = (await pat({m}, CEG)).slice(0, 8).map(e => [e.b, e.p]);
      o.gespielt = (await pat({m: 'gespielt'}, chordClip([67, 60, 64], 4))).slice(0, 6).map(e => e.p);
      o.zufall = (await pat({m: 'zufall'}, CEG)).map(e => e.p); o.zufall2 = (await pat({m: 'zufall'}, CEG)).map(e => e.p);
      { const L = await pat({m: 'akkord', o: 2, r: 8}, CEG); o.akkord = [0, .5, 1, 1.5].map(bt => L.filter(e => Math.abs(e.b - bt) < 1e-3).map(e => e.p)); }
      o.rep2 = (await pat({m: 'auf', rep: 2}, CEG)).slice(0, 8).map(e => e.p);
      o.auf2 = (await pat({m: 'auf', o: 2}, CEG)).slice(0, 8).map(e => e.p);
      o.okt1 = (await pat({m: 'oktave'}, chordClip([36], 4))).slice(0, 6).map(e => e.p);
      // Raten + Triolen: Abstände der Schritte
      o.rate = {};
      for (const [r, tri] of [[4, 0], [8, 0], [16, 0], [32, 0], [4, 1], [8, 1], [16, 1], [32, 1]]) { const L = await pat({m: 'auf', r, tri}, CEG); o.rate[r + (tri ? 'T' : '')] = {n: L.length, d: [...new Set(L.slice(1).map((e, k) => +(e.b - L[k].b).toFixed(4)))]}; }
      // Swing: eigener (ersetzt Song-Swing) und Song-Swing (Arp-Swing 0)
      o.swOwn = (await pat({m: 'auf', sw: 50}, CEG)).slice(0, 6).map(e => e.b);
      S.settings.swing = .5; o.swSong = (await pat({m: 'auf', sw: 0}, CEG)).slice(0, 6).map(e => e.b); o.swOwn2 = (await pat({m: 'auf', sw: -40}, CEG)).slice(0, 6).map(e => e.b); o.swOff = swingOffset(.25); S.settings.swing = 0;
      // Oktave auf Achteln: kurze Noten (1/16 lang auf Achtel-Plätzen) → Sechzehntel Grundton / Oktave („Da dub“)
      const ach = []; const bass = [36, 36, 43, 43, 41, 41, 40, 40]; bass.forEach((n, k) => ach.push({t: k * .5, d: .25, n, v: .8}));
      o.da = (await pat({m: 'oktave', fig: 1}, ach)).map(e => [e.b, e.p]);
      o.daOhne = (await pat({m: 'oktave', fig: 0}, ach)).map(e => [e.b, e.p]);
      o.daLang = (await pat({m: 'oktave', fig: 1}, bass.map((n, k) => ({t: k * .5, d: .5, n, v: .8})))).map(e => [e.b, e.p]);
      o.bassMap = bass.map(n => mapP(i, n));
      // Key Sync / Latch
      const two = [...chordClip([60, 64, 67], 1.25), {t: 1.25, d: 1, n: 62, v: .8}, {t: 1.25, d: 1, n: 65, v: .8}, {t: 1.25, d: 1, n: 69, v: .8}];
      o.ksOn = (await pat({m: 'auf', ks: 1}, two)).map(e => e.p).slice(5, 8); o.ksOff = (await pat({m: 'auf', ks: 0}, two)).map(e => e.p).slice(5, 8);
      o.laOff = (await pat({m: 'auf', la: 0}, chordClip([60, 64, 67], 1))).length; o.laOn = (await pat({m: 'auf', la: 1}, chordClip([60, 64, 67], 1))).length;
      // Latch endet am Szenenwechsel (Szene 2 hat auf der Spur keinen Clip)
      solo(i, chordClip([60, 64, 67], 1), 1); SYNQUENZER.songFromChain([{scene: 0, bars: 1}, {scene: 1, bars: 1}]); A.set(i, {on: 1, m: 'auf', r: 16, la: 1});
      { const s = await rend(2), L = lg(s, i, 'arp'); o.laScene = [L.filter(e => e.b < 4).length, L.filter(e => e.b >= 4).length]; }
      // Live (Transport steht): erste Note nach der Taste, nach dem Loslassen nichts mehr
      solo(i, chordClip([60], 1), 1); A.set(i, {on: 1, m: 'oktave', r: 16, g: 50}); selectTrack(i); arpSrcLoad(); ARPC.clearLog(i);
      const c = AU.ctx, t0 = c.currentTime; inputDown(48, 'k1', .8); const t1 = c.currentTime, lat = ARPC.arpLog(i)[0]; o.lat = lat ? (lat.t - t0) * 1000 : null; o.lat1 = lat ? (lat.t - t1) * 1000 : null;
      await wait(700); inputUp('k1'); await wait(400);
      // weitere 4 Anschläge: Median ab Taste (die Maschine ist beim Testlauf teils stark belastet)
      o.lats = [o.lat]; for (let q = 0; q < 4; q++) { ARPC.clearLog(i); const u0 = c.currentTime; inputDown(48, 'kq', .8); const u1 = c.currentTime, e = ARPC.arpLog(i)[0]; o.lats.push(e ? (e.t - u0) * 1000 : null); o.lat1 = Math.max(o.lat1, e ? (e.t - u1) * 1000 : 1e9); await wait(150); inputUp('kq'); await wait(250); }
      { const v = o.lats.filter(x => x != null).sort((a, b) => a - b); o.latMed = v.length === 5 ? v[2] : null; }
      ARPC.clearLog(i); inputDown(48, 'k1', .8); await wait(700); inputUp('k1'); await wait(400);
      o.liveSeq = ARPC.arpLog(i).map(e => e.note).slice(0, 6); o.liveInfo = ARPC.info(i); o.liveVoices = VOICES.filter(v => !v.dead && v.track === i && v.end > c.currentTime).length;
      o.spb = spb();
      return o;
    });
    const steps = (L, d) => L.every((e, k) => near(e[0], k * d));
    ok(eq(r.auf.map(e => e[1]), [60, 64, 67, 60, 64, 67, 60, 64]) && steps(r.auf, .25), 'B1 Auf (C-E-G, 1/16): 60 64 67 60 … auf jedem Sechzehntel', r.auf.map(e => e[1]).join(' '));
    ok(eq(r.ab.map(e => e[1]), [67, 64, 60, 67, 64, 60, 67, 64]), 'B1 Ab', r.ab.map(e => e[1]).join(' '));
    ok(eq(r.aufab.map(e => e[1]), [60, 64, 67, 64, 60, 64, 67, 64]), 'B1 Auf-Ab (Enden nicht doppelt)', r.aufab.map(e => e[1]).join(' '));
    ok(eq(r.treppe.map(e => e[1]), [60, 64, 60, 67, 60, 64, 60, 67]), 'B1 Treppe (1-2-1-3)', r.treppe.map(e => e[1]).join(' '));
    ok(eq(r.oktave.map(e => e[1]), [60, 72, 64, 76, 67, 79, 60, 72]), 'B1 Oktave über dem Akkord: je Ton Grundton + Oktave', r.oktave.map(e => e[1]).join(' '));
    ok(eq(r.okt1, [36, 48, 36, 48, 36, 48]), 'B1 Oktave über einem Ton: Da dub da dub', r.okt1.join(' '));
    ok(eq(r.gespielt, [67, 60, 64, 67, 60, 64]), 'B1 Gespielt: Reihenfolge wie eingegeben (G C E)', r.gespielt.join(' '));
    ok(r.zufall.length === 16 && r.zufall.every(x => [60, 64, 67].includes(x)) && new Set(r.zufall).size === 3 && eq(r.zufall, r.zufall2), 'B1 Zufall: nur Akkordtöne, alle kommen vor, zweiter Render gleich (Saat)', r.zufall.join(' '));
    ok(eq(r.akkord, [[60, 64, 67], [72, 76, 79], [60, 64, 67], [72, 76, 79]]), 'B1 Akkord, 2 Oktaven, 1/8: der ganze Akkord je Schritt, im Wechsel eine Oktave höher', r.akkord.map(x => x.join('/')).join(' '));
    ok(eq(r.rep2, [60, 60, 64, 64, 67, 67, 60, 60]), 'B1 Wiederholen 2×: jeder Schritt zweimal', r.rep2.join(' '));
    ok(eq(r.auf2, [60, 64, 67, 72, 76, 79, 60, 64]), 'B1 Auf über 2 Oktaven', r.auf2.join(' '));
    const RT = {4: 1, 8: .5, 16: .25, 32: .125, '4T': 2 / 3, '8T': 1 / 3, '16T': 1 / 6, '32T': 1 / 12};
    ok(Object.entries(RT).every(([k, d]) => r.rate[k].d.every(x => near(x, d, 2e-4)) && r.rate[k].n === Math.round(4 / d)), 'B2 Raten 1/4 1/8 1/16 1/32 + Triolen: Abstand 4/r (×2/3) auf ±0,0002 Schlag (Protokoll rundet auf 4 Stellen), Anzahl je Takt stimmt', Object.fromEntries(Object.entries(r.rate).map(([k, v]) => [k, v.n + '×' + v.d.join('/')])));
    ok(eq(r.swOwn.map(x => +x.toFixed(4)), [0, .3125, .5, .8125, 1, 1.3125]), 'B3 eigener Swing +50 % (1/16): jeder zweite Schritt +0,0625 Schlag', r.swOwn.join(' '));
    ok(r.swSong.every((x, k) => near(x, k * .25 + (k % 2 ? r.swOff : 0), 1e-3)) && r.swOff > 0, 'B3 Arp-Swing 0 = Song-Swing (Sechzehntel-Offbeats wie die Clip-Noten)', r.swSong.join(' '));
    ok(r.swOwn2.every((x, k) => near(x, k * .25 + (k % 2 ? -.05 : 0), 1e-3)), 'B3 eigener Swing −40 % ersetzt den Song-Swing (nicht addiert)', r.swOwn2.join(' '));
    const bm = r.bassMap, daExp = []; bm.forEach((n, k) => daExp.push([k * .5, n], [k * .5 + .25, n + 12]));
    ok(eq(r.da.map(e => [+e[0].toFixed(3), e[1]]), daExp), 'B4 Oktave auf Achteln (je 1/16 lang) mit „ganze Figur“: jedes Achtel = Sechzehntel Grundton + Oktave („Da dub“), 16 Noten', r.da.map(e => e[1]).join(' '));
    ok(r.daOhne.length === 8 && r.daOhne.every(e => near(e[0] % .5, 0)), 'B4 dasselbe ohne „ganze Figur“: nur der Grundton (das „dub“ fehlt – deshalb Standard an)', r.daOhne.length + ' Noten');
    ok(eq(r.daLang.map(e => [+e[0].toFixed(3), e[1]]), daExp), 'B4 Achtel voll gehalten: ebenfalls Da dub auf jedem Achtel', r.daLang.length + ' Noten');
    ok(eq(r.ksOn, [62, 65, 69]) && eq(r.ksOff, [69, 62, 65]), 'B5 Key Sync an: neuer Akkord beginnt bei Schritt 1 · aus: läuft mit dem Takt weiter', {an: r.ksOn, aus: r.ksOff});
    ok(r.laOff === 4 && r.laOn === 16, 'B5 Latch: Akkord 1 Schlag gehalten → ohne Latch 4 Schritte, mit Latch läuft er bis zur nächsten Note (16)', {aus: r.laOff, an: r.laOn});
    ok(r.laScene[0] === 16 && r.laScene[1] === 0, 'B5 Latch endet am Szenenwechsel (Szene 2 ohne Clip auf der Spur)', r.laScene);
    ok(r.latMed != null && r.latMed <= 15 && r.latMed >= 0 && r.lat1 <= 15, 'B6 Live: erste Arp-Note ' + (r.latMed != null ? r.latMed.toFixed(1) : '–') + ' ms nach der Taste (Median aus 5, ≤ 15 ms; ohne Warten auf ein Raster, höchstens ' + (r.lat1 != null ? r.lat1.toFixed(1) : '–') + ' ms nach der Verarbeitung)', r.lats.map(x => x == null ? '–' : x.toFixed(1)).join(' '));
    ok(eq(r.liveSeq, [48, 60, 48, 60, 48, 60]) && r.liveInfo === null && r.liveVoices === 0, 'B6 Live Oktave: 48 60 48 60 …; nach dem Loslassen kein Rest-Zustand, keine klingende Stimme', {seq: r.liveSeq, info: r.liveInfo, st: r.liveVoices});
    await p.close();
  }

  /* ================= C: Planer = Rechnung; Matrix + Song (Echtzeit) = Offline-Render ================= */
  if (ONLY.includes('C')) {
    const p = await page();
    const r = await run(p, async () => {
      await host(); const i = va(), o = {mis: [], n: 0, cases: 0}; applySound(i, factorySound(INIT_IDS.analog)); S.settings.swing = 0;
      const clips = {
        achtel: (() => { const L = []; [36, 36, 43, 43, 41, 41, 40, 38].forEach((n, k) => L.push({t: k * .5, d: k % 3 ? .25 : .5, n, v: .7 + (k % 2) * .2})); return L; })(),
        akkorde: [...[48, 52, 55].map(n => ({t: 0, d: 1.9, n, v: .8})), ...[50, 53, 57].map(n => ({t: 2, d: 1, n, v: .7})), ...[47, 50, 55, 59].map(n => ({t: 3, d: .5, n, v: .9}))],
        frei: [{t: .03, d: .4, n: 48, v: .8}, {t: .52, d: .2, n: 55, v: .8}, {t: 1.01, d: .9, n: 52, v: .8}, {t: 1.05, d: .8, n: 60, v: .7}, {t: 2.26, d: .3, n: 50, v: .8}, {t: 3.1, d: .6, n: 57, v: .9}]};
      const cfgs = [];
      for (const m of ['auf', 'ab', 'aufab', 'zufall', 'gespielt', 'treppe', 'oktave', 'akkord']) cfgs.push({m});
      for (const [r, tri] of [[4, 0], [8, 0], [32, 0], [16, 1], [8, 1]]) cfgs.push({m: 'aufab', r, tri});
      cfgs.push({m: 'auf', ks: 0}, {m: 'treppe', la: 1}, {m: 'oktave', rep: 2}, {m: 'gespielt', fig: 0}, {m: 'auf', g: 100}, {m: 'ab', g: 15}, {m: 'aufab', sw: 60}, {m: 'zufall', o: 3, rep: 3}, {m: 'oktave', o: 2, la: 1, ks: 0});
      for (const [cn, notes] of Object.entries(clips)) {
        solo(i, notes, 1, 2);
        for (const c of cfgs) {
          const cfg = Object.assign({on: 1, r: 16, tri: 0, o: 1, g: 80, sw: 0, ks: 1, la: 0, rep: 1, fig: 1}, c); A.set(i, cfg);
          const s = await rend(2), L = lg(s, i, 'arp');
          const src = []; for (const k of [0, 1]) for (const nt of S.tracks[i].clips[0].notes) src.push({on: nt.t + 4 * k, off: nt.t + 4 * k + Math.max(nt.d, 1 / 32), p: mapP(i, nt.n), v: nt.v});
          const R_ = A.render(src, cfg, {a: 0, b: 8, spb: spb(), seed: ARP1K.seedOf(i)}).map(n => ({b: +n.t.toFixed(4), p: n.p, d: n.d})).sort((x, y) => x.b - y.b || x.p - y.p);
          o.cases++; o.n += L.length;
          const same = L.length === R_.length && L.every((e, k) => Math.abs(e.b - R_[k].b) <= .002 && e.p === R_[k].p && Math.abs(e.d - R_[k].d) <= .004);
          if (!same) o.mis.push({clip: cn, c, n: [L.length, R_.length], first: L.findIndex((e, k) => !R_[k] || Math.abs(e.b - R_[k].b) > .002 || e.p !== R_[k].p || Math.abs(e.d - R_[k].d) > .004), L: L.slice(0, 12).map(e => [e.b, e.p, e.d]), R: R_.slice(0, 12).map(e => [e.b, e.p, +e.d.toFixed(4)])});
        }
      }
      // Echtzeit: Matrix (Szene läuft) und Song gegen den Offline-Render
      const rt = async song => {
        solo(i, clips.achtel, 1, 2); A.set(i, {on: 1, m: 'oktave', r: 16, o: 1, g: 70, ks: 1, fig: 1}); S.bpm = 150;
        const s = await rend(2), ref = lg(s, i, 'arp').map(e => [+e.b.toFixed(3), e.p]);
        const n0 = LOG.n; R.selS = 0;
        if (song) { setSongView(true); await wait(200); songPlayStart(0); } else { setSongView(false); await wait(200); launchScene(0); }
        await wait(2 * 4 * 60 / S.bpm * 1000 + 900);
        const got = []; for (let k = n0; k < LOG.n; k++) { const e = LOG.buf[k % 4096]; if (e && e.track === i && e.src === 'arp' && !e.removed && e.beat != null) got.push([+e.beat.toFixed(3), e.out]); }
        stop(); await wait(300); setSongView(false);
        got.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
        const g2 = got.filter(e => e[0] < 8 - 1e-6);
        return {ref, got: g2, same: ref.length > 0 && ref.length === g2.length && ref.every((e, k) => Math.abs(e[0] - g2[k][0]) <= .003 && e[1] === g2[k][1])};
      };
      o.song = await rt(true);
      o.mtx = await rt(false);
      return o;
    });
    ok(r.mis.length === 0, 'C1 Planer (App-Render) = reine Rechnung arp1Render: ' + r.cases + ' Fälle (8 Muster, 5 Raten/Triolen, KS, Latch, Wiederholen, Figur, Gate 15/100, Swing, Oktaven) × 3 Clips (Achtel mit kurzen Noten, Akkorde, unquantisiert), ' + r.n + ' Noten – Zeit ± 0,002 Schlag, Tonhöhe, Dauer', r.mis.slice(0, 2));
    ok(r.song.same, 'C2 Song in Echtzeit = Offline-Render (Oktav-Bass, 150 BPM, 2 Takte): ' + r.song.got.length + ' Arp-Noten gleich', r.song.same ? null : {ref: r.song.ref.slice(0, 10), got: r.song.got.slice(0, 10)});
    ok(r.mtx.same, 'C3 Matrix (Szene läuft) in Echtzeit = Offline-Render: ' + r.mtx.got.length + ' Arp-Noten gleich', r.mtx.same ? null : {ref: r.mtx.ref.slice(0, 10), got: r.mtx.got.slice(0, 10)});
    await p.close();
  }

  /* ================= D: MIDI-Export ================= */
  if (ONLY.includes('D')) {
    const p = await page();
    const r = await run(p, async () => {
      await host(); const i = va(), o = {}; applySound(i, factorySound(INIT_IDS.analog)); S.settings.swing = 0;
      const notes = []; [36, 36, 43, 43, 41, 41, 40, 40].forEach((n, k) => notes.push({t: k * .5, d: .25, n, v: .8}));
      solo(i, notes, 1, 2); const cfg = {on: 1, m: 'oktave', r: 16, o: 1, g: 80, ks: 1, fig: 1}; A.set(i, cfg); R.selS = 0;
      const bytes = m => (m && m.bytes ? Array.from(m.bytes) : null);
      UI.expArp = true; o.scene = bytes(SYNQUENZER.buildMidi({mode: 'scene', scene: 0})); o.song = bytes(SYNQUENZER.buildMidi({mode: 'song'}));
      o.clip = bytes(va1MidiClip(i, 0, true));
      UI.expArp = false; o.sceneOff = bytes(SYNQUENZER.buildMidi({mode: 'scene', scene: 0})); UI.expArp = true;
      const s = await rend(2); o.render = lg(s, i, 'arp').map(e => [+e.b.toFixed(3), e.p]);
      o.ch = midiCh(i); o.clipN = notes.length;
      // Mitschnitt: einmal spielen, dann als MIDI – mit und ohne Schalter dieselben Bytes (die Arp-Noten stehen schon drin, nie doppelt)
      S.bpm = 160; launchScene(0); await wait(4 * 60 / 160 * 1000 + 600); stop(); await wait(300);
      UI.expArp = true; o.log1 = bytes(SYNQUENZER.buildMidi({mode: 'log'})); UI.expArp = false; o.log2 = bytes(SYNQUENZER.buildMidi({mode: 'log'})); UI.expArp = true;
      // Export-Blatt: Zeile „Arp“ nur, wenn eine MIDI-Spur Arp an hat
      o.row = arp1ExpRow().includes('data-va="wg-arp"'); A.set(i, null); o.rowOff = arp1ExpRow() === '';
      return o;
    });
    const sc = midiNotes(r.scene).filter(n => n.ch === r.ch), off = midiNotes(r.sceneOff).filter(n => n.ch === r.ch), sg = midiNotes(r.song).filter(n => n.ch === r.ch), cl = midiNotes(r.clip).filter(n => n.ch === r.ch);
    const ref = r.render.filter(e => e[0] < 4 - 1e-6);
    ok(sc.length === ref.length && sc.every((n, k) => near(n.t, ref[k][0], .003) && n.p === ref[k][1]), 'D1 MIDI Szene „als Noten“: genau die gehörten Arp-Noten (Tick + Tonhöhe wie der App-Render), ' + sc.length + ' Noten', sc.slice(0, 6).map(n => [n.t, n.p]));
    ok(sg.length === r.render.length && sg.every((n, k) => near(n.t, r.render[k][0], .003) && n.p === r.render[k][1]), 'D2 MIDI Song: Arp-Noten über 2 Takte = App-Render', sg.length);
    ok(cl.length === ref.length && cl.every((n, k) => near(n.t, ref[k][0], .003) && n.p === ref[k][1]), 'D2 MIDI je Spur (Clip): Arp-Noten', cl.length);
    ok(off.length === r.clipN, 'D3 Schalter „wie im Clip“: nur die ' + r.clipN + ' Clip-Noten (wie bisher)', off.length);
    ok(r.log1 && r.log2 && eq(r.log1, r.log2) && midiNotes(r.log1).filter(n => n.ch === r.ch).length >= 8, 'D4 Mitschnitt: mit und ohne Schalter bytegleich (Arp-Noten einmal drin, nie doppelt)', midiNotes(r.log1 || []).filter(n => n.ch === r.ch).length);
    ok(r.row && r.rowOff, 'D5 Export-Blatt: Zeile „Arp: als Noten | wie im Clip“ nur, wenn eine Spur Arp an hat');
    await p.close();
  }

  /* ================= E: Festschreiben + ↶ ================= */
  if (ONLY.includes('E')) {
    const p = await page();
    const r = await run(p, async () => {
      await host(); const i = va(), o = {}; applySound(i, factorySound(INIT_IDS.analog)); S.settings.swing = 0;
      const notes = [...chordClip([48, 52, 55], 1.9), {t: 2, d: .25, n: 50, v: .8}, {t: 2.5, d: .25, n: 50, v: .8}, {t: 3, d: 1, n: 53, v: .8}];
      solo(i, notes, 1, 1); A.set(i, {on: 1, m: 'treppe', r: 16, o: 2, g: 70, ks: 1, fig: 1}); R.selS = 0;
      const s1 = await rend(1); o.heard = lg(s1, i, 'arp').map(e => [+e.b.toFixed(3), e.p]);
      const c0 = JSON.stringify(cleanClip(S.tracks[i].clips[0])), u0 = UNDO.length;
      o.ok = A.bake(i, 0); o.u = UNDO.length - u0; o.arpAfter = A.get(i); o.nNotes = S.tracks[i].clips[0].notes.length;
      const s2 = await rend(1); o.after = lg(s2, i).map(e => [+e.b.toFixed(3), e.p, e.src]);
      undo(); o.undoClip = JSON.stringify(cleanClip(S.tracks[i].clips[0])) === c0; o.undoArp = A.get(i);
      redo(); o.redoN = S.tracks[i].clips[0].notes.length; o.redoArp = A.get(i) && A.get(i).on;
      undo(); o.why = A.bakeWhy(i, 3); A.set(i, Object.assign(A.get(i), {on: 0})); o.whyOff = A.bakeWhy(i, 0);
      return o;
    });
    ok(r.ok && r.u === 1 && r.arpAfter && r.arpAfter.on === 0, 'E1 In den Clip schreiben: ein ↶-Schritt, danach Arp aus (Einstellung bleibt)', {schritte: r.u, notes: r.nNotes});
    ok(r.after.length === r.heard.length && r.after.every((e, k) => e[2] === 'clip' && e[0] === r.heard[k][0] && e[1] === r.heard[k][1]), 'E2 Der festgeschriebene Clip klingt wie vorher der Arp (' + r.heard.length + ' Noten, Zeit + Tonhöhe, jetzt Clip-Noten)');
    ok(r.undoClip && r.undoArp && r.undoArp.on === 1 && r.redoN === r.nNotes && r.redoArp === 0, 'E3 ↶ = alter Clip + Arp wieder an · ↷ = wieder festgeschrieben');
    ok(/kein Clip/.test(r.why) && /aus/.test(r.whyOff), 'E4 Leerer Clip / Arp aus: Knopf grau mit Grund', [r.why, r.whyOff]);
    await p.close();
  }

  /* ================= F: Speichern / Laden, Undo, Spur duplizieren ================= */
  if (ONLY.includes('F')) {
    const p = await page();
    const r = await run(p, async () => {
      await host(); const i = va(), o = {};
      const cfg = {on: 1, m: 'gespielt', r: 8, tri: 1, o: 3, g: 55, sw: -25, ks: 0, la: 1, rep: 3, fig: 0};
      A.set(i, cfg); o.get = A.get(i);
      const j = SYNQUENZER.serialize(); o.inJson = (j.match(/"arp":\{/g) || []).length;
      SYNQUENZER.importJSON(j); await wait(500); o.after = A.get(i);
      const j2 = SYNQUENZER.serialize(); o.bit = j === j2;
      // Undo je Geste; Gate-Tipps zusammengefasst
      const u0 = UNDO.length; arp1Edit(i, 'Arp-Muster', c => Object.assign(c, {m: 'auf'})); arp1Edit(i, 'Arp-Rate', c => Object.assign(c, {r: 32}));
      for (let k = 0; k < 4; k++) arp1Edit(i, 'Arp-Gate', c => Object.assign(c, {g: c.g + 5}), 'a1g');
      o.u = UNDO.length - u0; o.g = A.get(i).g;
      undo(); o.ug = A.get(i).g; undo(); o.ur = A.get(i).r; undo(); o.um = A.get(i).m; redo(); o.rm = A.get(i).m;
      // Spur duplizieren nimmt den Arp mit
      const n0 = NT(); mtxTrackDup(i, true); await wait(200); o.dup = NT() > n0 ? A.get(NT() - 1) : 'keine Spur';
      // Engine-Wechsel: auf MS-Platte ruht der Arp der Spur (kein doppelter Arp), zurück auf VA ist er wieder da
      mkLoad(); for (let k = 0; k < 100 && !mkLoaded(); k++) await wait(100);
      const s0 = soundSnapshot(i); setEngine(i, 'mk'); commitSound(i, s0, 'Klangerzeugung'); await wait(200);
      o.mkOn = A.on(i); o.mkKeep = !!A.get(i); o.mkMore = arp1MoreBtn(i);
      const s1 = soundSnapshot(i); setEngine(i, 'fm6'); commitSound(i, s1, 'Klangerzeugung'); await wait(200); o.fmOn = A.on(i);
      return o;
    });
    ok(eq(r.get, r.after) && r.inJson === 1 && r.bit, 'F1 Speichern → Laden: Arp-Einstellung bitgleich zurück, Datei gleich', r.after);
    ok(r.u === 3 && r.g === 75 && r.ug === 55 && r.ur === 8 && r.um === 'gespielt' && r.rm === 'auf', 'F2 Jede Geste ein ↶ (Gate-Tipps in 2 s zusammen): ↶ ↶ ↶ ↷ stimmt', {u: r.u, g: r.g, ug: r.ug, ur: r.ur, um: r.um, rm: r.rm});
    ok(r.dup && r.dup.m === 'auf' && r.dup.on === 1, 'F3 Spur duplizieren nimmt den Arp mit', r.dup);
    ok(r.mkOn === false && r.mkKeep && /eigenen/.test(r.mkMore), 'F4 Spur auf MS-Platte: Spur-Arp ruht (kein doppelter Arp), ⋯ verweist auf den eigenen', r.mkMore.replace(/<[^>]+>/g, ' ').trim());
    ok(r.fmOn === true, 'F4 zurück auf FM: der Arp der Spur spielt wieder');
    await p.close();
  }

  /* ================= G: keine hängenden Noten (Echtzeit) ================= */
  if (ONLY.includes('G')) {
    const p = await page();
    const r = await run(p, async () => {
      await host(); const i = va(), o = {}; applySound(i, factorySound(INIT_IDS.analog)); S.bpm = 140;
      const c = AU.ctx, notes = [...chordClip([48, 55, 60], 1), {t: 2, d: 1.5, n: 50, v: .8}, {t: 2, d: 1.5, n: 57, v: .8}];
      for (const t of S.tracks) t.clips = t.clips.map(() => null);
      S.tracks[i].clips[0] = normClip({len: 1, key: Object.assign({}, S.key), notes}, 'synth', S.key);
      S.tracks[i].clips[1] = normClip({len: 1, key: Object.assign({}, S.key), notes: [{t: 0, d: 4, n: 45, v: .8}]}, 'synth', S.key);
      A.set(i, {on: 1, m: 'auf', r: 16, o: 2, g: 90, la: 1}); setSongView(false);
      const live = () => VOICES.filter(v => !v.dead && v.track === i && v.end > c.currentTime + .05);
      const arpAfter = t => { const L = []; for (let k = 0; k < LOG.n; k++) { const e = LOG.buf[k % 4096]; if (e && e.track === i && e.src === 'arp' && !e.removed && e.time >= t) L.push(e); } return L; };
      const bar = 4 * spb();
      // Stopp mit gelatchtem Akkord
      launchScene(0); await wait(bar * 1500); stop(); const tS = c.currentTime; await wait(400); o.stop = {voices: live().length, after: arpAfter(tS + .02).length};
      // Szenenwechsel: Szene 1 (Latch) → Szene 2 (anderer Clip) → nach dem Taktstrich keine Noten des alten Akkords
      play(); await wait(bar * 1000 * .6); launchScene(1); await wait(bar * 1000 * 1.6);
      const sw = R.prev[i] ? R.prev[i].until : null, swT = sw != null ? b2t(sw) : null;
      o.scene = {sw, old: swT != null ? arpAfter(swT + .001).filter(e => e.clipNote !== 45).length : -1, neu: swT != null ? arpAfter(swT + .001).filter(e => e.clipNote === 45).length : 0};
      // stumm im Lauf
      setMute(i, true); const tM = c.currentTime; await wait(600); o.mute = {after: arpAfter(tM + .12).length, voices: live().length}; setMute(i, false); await wait(500);
      // Klangwechsel im Lauf (Werksklang FM): der Arp spielt weiter, nichts bleibt hängen
      applySound(i, factorySound(INIT_IDS.fm6)); const tK = c.currentTime; await wait(900); o.klang = {after: arpAfter(tK + .05).length, long: VOICES.filter(v => !v.dead && v.track === i && v.src === 'arp' && v.end - v.start > spb()).length};
      // Arp aus im Lauf: keine Arp-Noten mehr (bis auf die schon klingenden), die Clip-Noten kommen direkt
      launchScene(0); await wait(bar * 1000 * 1.2);
      A.set(i, Object.assign(A.get(i), {on: 0})); const tA = c.currentTime; await wait(bar * 1000 * 1.2);
      o.aus = {arp: arpAfter(tA + .02).length, clip: (() => { let n = 0; for (let k = 0; k < LOG.n; k++) { const e = LOG.buf[k % 4096]; if (e && e.track === i && e.src === 'clip' && !e.removed && e.time >= tA) n++; } return n; })(), voices: VOICES.filter(v => !v.dead && v.track === i && v.src === 'arp' && v.end > c.currentTime + .05).length};
      stop(); await wait(500); o.end = {voices: live().length, st: typeof ARP1K !== 'undefined' ? ARP1K.ST.size : -1, err: TICKERR.n};
      return o;
    });
    ok(r.stop.voices === 0 && r.stop.after === 0, 'G1 Stopp mit gelatchtem Akkord: sofort Ruhe, keine Arp-Note danach, keine Stimme hängt', r.stop);
    ok(r.scene.sw != null && r.scene.old === 0 && r.scene.neu > 0, 'G2 Szenenwechsel: nach dem Taktstrich keine Note des alten (gelatchten) Akkords, der neue Clip läuft im Arp', r.scene);
    ok(r.mute.after === 0 && r.mute.voices === 0, 'G3 Spur stumm im Lauf: keine Arp-Note mehr, nichts klingt nach', r.mute);
    ok(r.klang.after > 0 && r.klang.long === 0, 'G4 Klangwechsel im Lauf: der Arp spielt weiter, keine Stimme länger als ihr Gate', r.klang);
    ok(r.aus.arp === 0 && r.aus.clip > 0 && r.aus.voices === 0, 'G5 Arp aus im Lauf: keine Arp-Note mehr, Clip-Noten kommen direkt, nichts hängt', r.aus);
    ok(r.end.voices === 0 && r.end.st === 0 && r.end.err === 0, 'G6 Nach Stopp: keine Stimme, kein Arp-Zustand, keine Planer-Fehler', r.end);
    await p.close();
  }

  /* ================= H: Bedienung per Touch (hochkant / quer), Fotos ================= */
  if (ONLY.includes('H')) for (const [w, h, n] of [[428, 926, 'hochkant'], [926, 428, 'quer']]) {
    const p = await page(w, h);
    await run(p, async () => { await host(); const i = va(); selectTrack(i); ED.tab = 'osc'; ED.sub.osc = 'voice'; openEditor(); await wait(600); });
    const row = await ctr(p, '#synthSheet .a1row'), onB = await ctr(p, '#synthSheet .a1row button[data-a1on="1"]'), sumB = await ctr(p, '#synthSheet .a1row .a1sum');
    const fit = await p.evaluate(() => { const r = document.querySelector('#synthSheet .a1row'), b = document.querySelector('#synthSheet .sh-body'); if (!r || !b) return null; const a = r.getBoundingClientRect(), c = b.getBoundingClientRect(); return {in: a.top >= c.top - .5 && a.bottom <= c.bottom + .5 && a.right <= c.right + .5, scroll: b.scrollHeight > b.clientHeight + 1}; });
    ok(!!row && onB && onB.h >= 43.5 && sumB && sumB.h >= 43.5 && fit && fit.in, 'H1 ' + n + ': Zeile ARP unten auf OSZ › STIMME, ganz sichtbar, Tasten ≥ 44 px', {h: onB && onB.h, fit});
    await p.screenshot({path: path.join(fotos, 'arp1-stimme-' + n + '.png')});
    if (onB) await tap(p, onB.x, onB.y);
    let g = await p.evaluate(() => ({a: SYNQUENZER.arp1.get(R.selT), txt: (document.querySelector('#synthSheet .a1row .a1sum') || {}).textContent}));
    ok(g.a && g.a.on === 1 && /Auf · 1\/16/.test(g.txt), 'H2 ' + n + ': Tipp „AN“ → Arp an (Auf · 1/16 · 1 Okt.), Zusammenfassung in der Zeile', g.txt);
    await p.screenshot({path: path.join(fotos, 'arp1-stimme-an-' + n + '.png')});
    if (sumB) await tap(p, sumB.x, sumB.y);
    await p.waitForTimeout(400);
    const st = await p.evaluate(() => { const P = document.querySelector('.pop.a1pop'); if (!P) return null; const r = P.getBoundingClientRect(); const bs = [...P.querySelectorAll('button')].filter(b => b.getClientRects().length && !b.classList.contains('ux1-px')); const small = bs.map(b => b.getBoundingClientRect()).filter(q => q.height < 43.5 || q.width < 30).length; return {in: r.left >= 7.5 && r.top >= 7.5 && r.right <= innerWidth - 7.5 && r.bottom <= innerHeight - 7.5, small, n: bs.length, scroll: P.scrollHeight > P.clientHeight + 1, over: P.scrollWidth > P.clientWidth + 1}; });
    ok(st && st.in && st.small === 0 && !st.over, 'H3 ' + n + ': Blatt „Arp“ ganz im Bild (8 px Rand), alle ' + (st ? st.n : 0) + ' Tasten ≥ 44 px, nichts läuft seitlich über' + (st && st.scroll ? ', innen rollbar' : ''), st);
    await p.screenshot({path: path.join(fotos, 'arp1-blatt-' + n + '.png')});
    await tapSel(p, '.pop.a1pop button[data-q="okt"]');
    g = await p.evaluate(() => SYNQUENZER.arp1.get(R.selT));
    ok(g && g.m === 'oktave' && g.r === 16 && g.fig === 1, 'H4 ' + n + ': Schnellwahl „Oktav-Bass“ → Oktave · 1/16 · ganze Figur', g);
    await tapSel(p, '.pop.a1pop button[data-m="treppe"]');
    await tapSel(p, '.pop.a1pop button[data-tri="1"]');
    await tapSel(p, '.pop.a1pop button[data-g="-"]'); await tapSel(p, '.pop.a1pop button[data-g="-"]');
    g = await p.evaluate(() => ({a: SYNQUENZER.arp1.get(R.selT), u: UNDO.slice(-3).map(e => e.label)}));
    ok(g.a && g.a.m === 'treppe' && g.a.tri === 1 && g.a.g === 70, 'H5 ' + n + ': Muster-Bild „Treppe“, Triole, Gate ‹ ‹ (80 → 70 %, ein ↶)', {a: g.a, u: g.u});
    await p.evaluate(() => { const b = document.querySelector('.pop.a1pop button[data-a="bake"]'); if (b) b.scrollIntoView({block: 'center'}); }); await p.waitForTimeout(150);
    await p.screenshot({path: path.join(fotos, 'arp1-blatt-unten-' + n + '.png')});
    await run(p, async () => { ARPC.clearLog(R.selT); }); await tapSel(p, '.pop.a1pop button[data-a="probe"]'); await p.waitForTimeout(900);
    const pr = await run(p, async () => ARPC.arpLog(R.selT).map(e => e.note));
    ok(pr.length >= 4, 'H6 ' + n + ': ▶ Probe spielt den Arp (Treppe über C-Dur)', pr.slice(0, 8).join(' '));
    await p.waitForTimeout(300);
    const lightOk = await p.evaluate(() => !!document.querySelector('.pop.a1pop .a1dia'));
    ok(lightOk, 'H7 ' + n + ': Bild der nächsten 8 Schritte im Blatt');
    await run(p, async () => { closePop(); });
    // ⋯-Menü
    const more = await p.evaluate(() => { const b = [...document.querySelectorAll('#synthSheet .hb.edm')].find(x => x.getClientRects().length && getComputedStyle(x).display !== 'none'); if (!b) return null; const r = b.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
    if (more) await tap(p, more.x, more.y);
    const ent = await ctr(p, '.pop button[data-a="arp1"]');
    ok(!!ent && ent.h >= 43.5, 'H8 ' + n + ': ⋯-Menü hat „Arpeggiator“ (≥ 44 px)', ent);
    await p.screenshot({path: path.join(fotos, 'arp1-menue-' + n + '.png')});
    if (ent) { await tap(p, ent.x, ent.y); await p.waitForTimeout(400); }
    ok(await p.evaluate(() => SYNQUENZER.arp1.isOpen()), 'H8 ' + n + ': Tipp öffnet das Blatt');
    await run(p, async () => { closePop(); closeEditor(); });
    // Export-Blatt mit der Zeile „Arp“
    const ex = await run(p, async () => { va1Sheet(); await wait(500); const b = document.querySelector('[data-va="wg-arp"]'); if (b) b.scrollIntoView({block: 'center'}); await wait(200); const r = b ? b.getBoundingClientRect() : null; return r ? {h: r.height, n: document.querySelectorAll('[data-va="wg-arp"]').length} : null; });
    await p.screenshot({path: path.join(fotos, 'arp1-export-' + n + '.png')});
    ok(ex && ex.n === 2 && ex.h >= 43.5, 'H9 ' + n + ': Export-Blatt hat die Zeile „Arp: als Noten | wie im Clip“ (≥ 44 px)', ex);
    if (ex) { await tapSel(p, '[data-va="wg-arp"][data-v="0"]'); const v = await p.evaluate(() => UI.expArp); ok(v === false, 'H9 ' + n + ': Tipp „wie im Clip“ schaltet den MIDI-Export auf Clip-Noten'); await run(p, async () => { UI.expArp = true; closePop(); }); }
    await p.close();
  }

  /* ================= I: Guide ================= */
  if (ONLY.includes('I')) {
    const p = await page();
    const r = await run(p, async () => ({h1: ui1Search('oktavbass').map(E => E.id), h2: ui1Search('arpeggiator').map(E => E.id), h3: ui1Search('da dub').map(E => E.id), kf: (ui1Entries().find(x => x.id === 'kf1trp') || {}).w}));
    ok(r.h1.includes('arp1') && r.h2.includes('arp1') && r.h3.includes('arp1'), 'I1 Guide: Suche „Oktavbass“ / „Arpeggiator“ / „da dub“ findet den Eintrag', r);
    ok(/STIMME › ARP › Treppe/.test(r.kf || ''), 'I2 Eintrag „Arp Treppe“ nennt jetzt auch STIMME › ARP', r.kf);
    const g = await run(p, async () => { const E = ui1Entries().find(x => x.id === 'arp1'); const okGo = E.go(); await wait(600); return {okGo, open: SYNQUENZER.arp1.isOpen(), sub: ED.sub.osc, d: E.d}; });
    ok(g.okGo && g.open && g.sub === 'voice', 'I3 Guide-Sprung öffnet Klang-Editor (OSZ › STIMME) + Blatt „Arp“');
    info('I4 Guide-Text', g.d);
    await p.close();
  }

  /* ================= K: Kosten ================= */
  if (ONLY.includes('K')) {
    const p = await page();
    const r = await run(p, async () => {
      await host(); const i = va(), o = {};
      const t0 = performance.now(); arpSrcLoad(); o.arpLoad = performance.now() - t0;
      const t1 = performance.now(); arp1UiLoad(); o.uiLoad = performance.now() - t1;
      const notes = []; for (let q = 0; q < 8; q++) for (const n of [48, 52, 55, 59]) notes.push({t: q * .5, n, d: .5, v: .8});
      solo(i, notes, 1, 1); A.set(i, {on: 1, m: 'aufab', r: 32, o: 3, g: 60, ks: 1});
      launchScene(0); await wait(500);
      const T = []; for (let k = 0; k < 80; k++) { const a = performance.now(); tick(); T.push(performance.now() - a); await wait(25); }
      stop(); A.set(i, null);
      launchScene(0); await wait(500);
      const T0 = []; for (let k = 0; k < 80; k++) { const a = performance.now(); tick(); T0.push(performance.now() - a); await wait(25); }
      stop(); T.sort((x, y) => x - y); T0.sort((x, y) => x - y);
      o.tick = T[40]; o.tickMax = T[79]; o.tick0 = T0[40];
      // Adapter: kein Neubau je Blick (dasselbe Objekt solange tr.arp gleich bleibt)
      A.set(i, {on: 1, m: 'auf'}); const m1 = arp1Adapt(S.tracks[i]), m2 = arp1Adapt(S.tracks[i]); o.same = m1 === m2;
      // Muster-Rechnung gnNotes: gleiche Ergebnisse wie arpPattern (Auf, Ab, Auf-Ab, Zufall, Treppe) über 300 Zufallsfälle, Puffer bleibt gleich groß
      let diff = 0; const ty = {auf: 0, ab: 1, aufab: 2, zufall: 4, treppe: 6};
      for (let k = 0; k < 300; k++) {
        const N = []; const n = 1 + (k % 5); for (let q = 0; q < n; q++) N.push({p: 40 + ((k * 7 + q * 5) % 40), vel: .8, x: {}}); N.sort((a, b) => a.p - b.p);
        for (const [m, t] of Object.entries(ty)) { const rg = 1 + (k % 4), c = k * 3 + 1; const a = ARPC.arpPattern(t, rg, N, c, 99, 8).map(u => u.p); const mm = arp1Mk({on: 1, m, o: rg}); const b = ARP1K.gnNotes(mm, {mem: N.map(u => u.x)}, c, N, 99).map(u => u.p); if (JSON.stringify(a) !== JSON.stringify(b)) diff++; }
      }
      o.diff = diff;
      return o;
    });
    ok(r.arpLoad < 5 && r.uiLoad < 5, 'K1 Blöcke laden: Arp-Kern ' + r.arpLoad.toFixed(2) + ' ms, Blatt (sq-arp1-src) ' + r.uiLoad.toFixed(2) + ' ms (< 5 ms, einmal)');
    ok(r.tick < .5, 'K2 Planer-Durchlauf (tick) mit Arp 1/32 Auf-Ab, 3 Oktaven, 4-Ton-Akkord: Median ' + r.tick.toFixed(3) + ' ms (ohne Arp ' + r.tick0.toFixed(3) + ' ms), max ' + r.tickMax.toFixed(2) + ' ms');
    ok(r.same, 'K3 Adapter je Spur zwischengespeichert (kein Neubau je Blick des Planers)');
    ok(r.diff === 0, 'K4 gnNotes = arpPattern des MS-Arps für Auf, Ab, Auf-Ab, Zufall, Treppe (1 500 Zufallsfälle)', r.diff);
    await p.close();
    // Startzeit: Basis gegen ARP1 abwechselnd
    const T = {b: [], n: []};
    for (let k = 0; k < 4; k++) for (const [key, f] of [['b', basis], ['n', file]]) {
      const q = await b.newPage({viewport: {width: 428, height: 926}}); const t0 = Date.now();
      await q.goto('file://' + f); await q.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 60000});
      T[key].push(Date.now() - t0); await q.close();
    }
    const med = a => { const s = a.slice().sort((x, y) => x - y); return (s[1] + s[2]) / 2; };
    ok(med(T.n) < med(T.b) * 1.1 + 30, 'K5 Startzeit nicht messbar schlechter (Median ARP1 ' + med(T.n) + ' ms gegen Basis ' + med(T.b) + ' ms)', T);
  }

  /* ================= Z: 3 Minuten Wiedergabe ================= */
  if (ONLY.includes('Z')) {
    const p = await page();
    const n0 = errs.length;
    const r = await run(p, async () => {
      await host(); const o = {edits: 0};
      const syn = S.tracks.map((t, i) => i).filter(i => S.tracks[i].kind === 'synth').slice(0, 3);
      const engs = ['analog', 'fm6', 'wt'];
      syn.forEach((i, k) => { applySound(i, factorySound(INIT_IDS[engs[k]])); });
      for (const t of S.tracks) if (t.kind === 'synth') t.clips = t.clips.map(() => null);
      const [a, b2, c] = syn;
      S.tracks[a].clips[0] = normClip({len: 1, key: Object.assign({}, S.key), notes: [36, 36, 43, 43, 41, 41, 40, 40].map((n, k) => ({t: k * .5, d: .25, n, v: .8}))}, 'synth', S.key);
      S.tracks[a].clips[1] = normClip({len: 2, key: Object.assign({}, S.key), notes: [33, 33, 33, 33, 38, 38, 40, 40].map((n, k) => ({t: k, d: .5, n, v: .8}))}, 'synth', S.key);
      S.tracks[b2].clips[0] = normClip({len: 1, key: Object.assign({}, S.key), notes: [...[60, 64, 67].map(n => ({t: 0, d: 2, n, v: .7})), ...[62, 65, 69].map(n => ({t: 2, d: 2, n, v: .7}))]}, 'synth', S.key);
      S.tracks[b2].clips[1] = normClip({len: 1, key: Object.assign({}, S.key), notes: [57, 60, 64].map(n => ({t: 0, d: 1, n, v: .7}))}, 'synth', S.key);
      S.tracks[c].clips[0] = normClip({len: 1, key: Object.assign({}, S.key), notes: [72, 74, 76, 79].map((n, k) => ({t: k, d: .9, n, v: .6}))}, 'synth', S.key);
      A.set(a, {on: 1, m: 'oktave', r: 16, g: 70}); A.set(b2, {on: 1, m: 'aufab', r: 16, tri: 1, o: 2, g: 60, la: 1}); A.set(c, {on: 1, m: 'zufall', r: 32, g: 40, sw: 30, rep: 2});
      S.bpm = 128; setSongView(false); launchScene(0);
      const t0 = performance.now(), M = ['auf', 'ab', 'aufab', 'treppe', 'oktave', 'gespielt', 'akkord', 'zufall']; let k = 0, maxV = 0;
      while (performance.now() - t0 < 180000) {
        await wait(2500); k++;
        if (k % 4 === 0) launchScene(k % 8 === 0 ? 0 : 1);
        const i = syn[k % 3]; arp1Edit(i, 'Arp-Muster', cc => Object.assign(cc || {}, {m: M[k % M.length], on: k % 7 ? 1 : 0})); o.edits++;
        if (k % 11 === 0) { applySound(syn[1], factorySound(INIT_IDS[engs[(k / 11) % 3 | 0]])); }
        if (k % 13 === 0) { setMute(syn[0], true); await wait(400); setMute(syn[0], false); }
        maxV = Math.max(maxV, VOICES.filter(v => !v.dead).length);
      }
      stop(); await wait(800);
      o.voices = VOICES.filter(v => !v.dead && v.end > AU.ctx.currentTime + .05).length; o.st = ARP1K.ST.size; o.err = TICKERR.n; o.maxV = maxV; o.playing = R.playing;
      o.arpNotes = (() => { let n = 0; for (let q = Math.max(0, LOG.n - 4096); q < LOG.n; q++) { const e = LOG.buf[q % 4096]; if (e && e.src === 'arp') n++; } return n; })();
      return o;
    });
    ok(errs.length === n0 && r.err === 0, 'Z1 3 Minuten Wiedergabe (3 Spuren mit Arp: VA Oktav-Bass, FM Auf-Ab-Triolen mit Latch, WT Zufall 1/32 mit Swing; Szenenwechsel, ' + r.edits + ' Arp-Änderungen, Klangwechsel, stumm): keine Konsolen- und Planer-Fehler', errs.slice(n0, n0 + 3));
    ok(r.voices === 0 && r.st === 0, 'Z2 danach keine hängende Stimme, kein Arp-Zustand', r);
    await p.close();
  }
  ok(!errs.length, 'Konsole ohne Fehler (alle Abschnitte)', errs.slice(0, 5));
} catch (e) { ok(false, 'Abbruch: ' + (e && e.stack || e)); }
await b.close();
console.log('ERGEBNIS ' + (all - bad) + '/' + all);
if (ONLY === 'ABCDEFGHIKZ') fs.writeFileSync(path.join(out, 'test-ergebnis.txt'), res.join('\n') + '\nERGEBNIS ' + (all - bad) + '/' + all + '\n');
