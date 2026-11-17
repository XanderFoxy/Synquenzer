// CMD2 – Werks-Kit „Elektro-Maschine“ auf 4.79 + Tasten-Umlegung im DAW-Projekt-Import.
// T1–T6 wie CMD1 (Kit-Eintrag, laden, spielen, MIDI, Klang in der App = Nachbau, Speichern/Laden). Neu:
//  T7 Lautheit je Pad (24 Schläge mit frischem Zufall, K-bewertet 0–400 ms, Median, relativ zum Kick) ±1 dB gegen das Ziel
//     (Ziel-Datei privat: CMD2_ZIEL, je Pad dB rel. Kick, gemessen am Original-Einzelschlag),
//  T8 Import einer DAW-Datei (privat: CMD2_CBP): Kit „Elektro-Maschine“, Notenzahl je Pad im Song (MIDI-Export, wie gehört) =
//     Notenzahl je Taste der Datei nach Umlegung, Zeile im Import-Blatt, ein ↶ / ↷, Speichern/Laden bitgleich, Neuladen,
//  T9 Datei mit GM-Drums (öffentliche Testdatei): Kit und Noten wie bisher.
// Aufruf: [CMD2_ZIEL=… CMD2_CBP=…] node cmd2-test.mjs <index.html (absolut)> [fotos-ordner] [privat-fotos-ordner]
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
const here = path.dirname(new URL(import.meta.url).pathname);
const file = process.argv[2]; if (!file) { console.log('Aufruf: node cmd2-test.mjs <index.html> [fotos] [privat-fotos]'); process.exit(2); }
const FOT = process.argv[3] || null, PFOT = process.argv[4] || null;
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const res = []; const ok = (name, cond, info) => { res.push({name, ok: !!cond}); console.log((cond ? 'OK     ' : 'FEHLER ') + name + (info !== undefined ? ' · ' + JSON.stringify(info) : '')); };
const N = 'Elektro-Maschine';
async function page(vp) {
  const ctx = await b.newContext({viewport: vp || {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1800);
  await p.evaluate(() => {
    window.__W = ms => new Promise(r => setTimeout(r, ms));
    // Szene 0 = nur die Drum-Spur: 2 Takte, alle 12 Pads je eine Achtel (Anschlag 100) + Kick/Hat-Groove; Song = diese Szene
    window.__clip = () => { for (const t of S.tracks) t.clips = t.clips.map(() => null);
      const notes = DRUM_VOICES.map((sl, i) => ({t: i * .5, d: .25, n: sl.gm, v: 100 / 127}));
      for (let b = 0; b < 4; b++) { notes.push({t: 6 + b * .5, d: .25, n: 36, v: .8}); notes.push({t: 6.25 + b * .5, d: .2, n: 42, v: .6}); }
      S.tracks[DRUM_T].clips[0] = normClip({len: 2, key: Object.assign({}, S.key), notes}, 'drum', S.key); R.selS = 0;
      SYNQUENZER.songFromChain([{scene: 0, bars: 2}]); return S.tracks[DRUM_T].clips[0].notes.length; };
    window.__R = async bars => { ensureAudio(); drumBufs(); const MR = Math.random; Math.random = () => .3125; try { VV.cancel = false; const r = await vvRenderAudio({range: {a: 0, b: bars || 2, sel: false}}); return {L: Float32Array.from(r.ch[0]), R: Float32Array.from(r.ch[1] || r.ch[0]), sr: r.sr || 44100}; } finally { Math.random = MR; } };
    window.__same = (A, B) => { const bad = []; for (const k in B) { const a = A[k], v = B[k]; if (typeof v === 'number' ? Math.abs(a - v) > 1e-9 : a !== v) bad.push(k + ':' + a + '≠' + v); } return bad; };
  });
  return {ctx, p, errs};
}

// T1 – Kit-Eintrag, Name, Vorbild-Zeile, Browser-Liste, 12 Klänge
{ const {ctx, p, errs} = await page();
  const r = await p.evaluate((N) => ({
    names: KIT_NAMES.length, once: KIT_NAMES.filter(n => n === N).length, ref: KIT_REF[N] || null,
    fac: DRUM_FACTORY.filter(f => f.name === N).map(f => f.id), byId: FACTORY_BY_ID.has('f-kit-elektro-maschine'),
    list: kitList().some(k => k.name === N && !k.off), data: Object.keys(KIT_DATA()[N] || {}).length,
    voices: (typeof slotSources === 'function' ? slotSources('kick') : []).filter(x => x.kit === N).length,
    others: ['808', '909', 'Rom Pop', 'Disko 85'].every(n => KIT_NAMES.includes(n)),
    texts: JSON.stringify(cmdKitData()) + ' ' + (KIT_REF[N] || '') + ' ' + DRUM_FACTORY.find(f => f.name === N).tip}), N);
  // Marken-/Gerätenamen: allgemeine Liste + (nur lokal) die Namen der Vorlagen aus einer privaten Datei (CMD1_MARKEN, ein Wort je Zeile)
  { let words = ['roland', 'korg', 'linn', 'akai', 'yamaha', 'oberheim', 'e-mu', 'emu ', 'elektron', 'tr-'];
    try { if ((process.env.CMD2_MARKEN || process.env.CMD1_MARKEN)) words = words.concat(fs.readFileSync((process.env.CMD2_MARKEN || process.env.CMD1_MARKEN), 'utf8').split('\n').map(w => w.trim().toLowerCase()).filter(Boolean)); } catch (e) {}
    const low = r.texts.toLowerCase(); r.brand = words.filter(w => low.includes(w)); r.brandN = words.length; delete r.texts; }
  ok('T1a Kit genau einmal in der Werksliste (jetzt 8 Werks-Kits)', r.once === 1 && r.names === 8 && r.others, r);
  ok('T1b Kit-Eintrag im Reiter Kits + ladbar per id + Vorbild-Zeile', r.fac.length === 1 && r.byId && r.list && !!r.ref, r);
  ok('T1c 12 Stimmen-Daten + Klang im Instrument-Browser (Elektro-Maschine · KICK)', r.data === 12 && r.voices === 1, r);
  ok('T1d keine Marken-/Gerätenamen in Kit-Daten, Tipp und Vorbild', r.brand.length === 0, {gefunden: r.brand, geprueft: r.brandN});
  ok('T1e Start ohne Fehler', errs.length === 0, errs.slice(0, 3));
  await ctx.close(); }

// T2/T3/T5 – laden, spielen, MIDI
{ const {ctx, p, errs} = await page();
  const r = await p.evaluate(async (N) => {
    const o = {}; ensureAudio(); drumBufs(); await __W(300);
    o.name = SYNQUENZER.loadKit(N); await __W(200);
    o.origin = drumSnd().origin;
    const K = cmdKitData(); o.bad = [];
    for (const sl of DRUM_VOICES) { const P = slotParams(sl.id), want = Object.assign({}, K[sl.id]); o.bad.push(...__same(P, want).map(x => sl.id + '.' + x)); }
    // spielt: jedes Pad erzeugt Quellen (Audition über die echte drumHit-Kette)
    o.pads = DRUM_VOICES.map(sl => { const h = drumHit(sl.gm, .8, AU.ctx.currentTime + .05, 'audition'); return h && h.srcs && h.srcs.length ? 1 : 0; });
    // Pedal-Hat (SHAKER, Choke 1) schließt die offene Hat
    const t = AU.ctx.currentTime + .1; drumHit(46, .8, t, 'audition'); const h2 = drumHit(70, .8, t + .05, 'audition'); o.choke = h2 && h2.chokes ? h2.chokes.length : -1;
    // Live-MIDI: Noten der Pads landen auf demselben Pad
    o.live = DRUM_VOICES.every(sl => padGmForNote(sl.gm) === sl.gm);
    // Offline-Render: 2 Takte nur Drums (alle 12 Pads + Groove) mit diesem Kit vs. 909
    o.clipNotes = __clip(); await __W(100);
    const A = await __R(2);
    // je Pad: Spitze im Fenster seines Schlags (Achtel = 0,5 Schlag) – jedes Pad ist im Mix hörbar
    { const bpm = S.bpm || S.tempo || 120, sr = A.sr, spb = 60 / bpm; o.padDb = DRUM_VOICES.map((sl, i) => { const a = Math.floor(i * .5 * spb * sr), b2 = Math.floor((i * .5 + .45) * spb * sr); let m = 0; for (let k = a; k < b2 && k < A.L.length; k++) m = Math.max(m, Math.abs(A.L[k]), Math.abs(A.R[k])); return Math.round(20 * Math.log10(m + 1e-12) * 10) / 10; }); } let e = 0, nan = 0; for (const c of ['L', 'R']) for (const v of A[c]) { if (!isFinite(v)) nan++; e += v * v; }
    o.rmsDb = Math.round(10 * Math.log10(e / (2 * A.L.length) + 1e-30) * 10) / 10; o.nan = nan;
    { let pk = 1e-9; for (const c of ['L', 'R']) for (const v of A[c]) pk = Math.max(pk, Math.abs(v)); o.peak = Math.round(20 * Math.log10(pk) * 10) / 10; }
    SYNQUENZER.loadKit('909'); await __W(200); const B = await __R(2); let d = 0, eb = 0; for (let k = 0; k < Math.min(A.L.length, B.L.length); k++) { const q = A.L[k] - B.L[k]; d += q * q; eb += B.L[k] * B.L[k]; }
    o.diff909 = Math.round(10 * Math.log10(d / Math.max(eb, 1e-20)) * 10) / 10;
    SYNQUENZER.loadKit(N); await __W(200);
    // MIDI-Export: Drum-Spur auf Kanal 10, nur Pad-Noten
    const m = buildMidi({mode: 'scene', scene: R.selS}); const by = m && m.bytes ? m.bytes : null; const ns = new Set();
    if (by) for (let i = 0; i + 2 < by.length; i++) if (by[i] === 0x99 && by[i + 2] > 0 && by[i + 1] < 128) ns.add(by[i + 1]);
    o.midiNotes = [...ns].sort((a, b) => a - b); o.midiOk = o.midiNotes.length > 0 && o.midiNotes.every(n => DRUM_GMS.includes(n));
    o.drumNotes = (S.tracks[DRUM_T].clips[R.selS] || {notes: []}).notes.length;
    return o;
  }, N).catch(e => ({err: String(e), bad: ['eval'], pads: [], live: false}));
  if (r.err) console.log('FEHLER im Ablauf: ' + r.err);
  ok('T2a Kit lädt (Name + Herkunft)', r.name === N && r.origin === 'f-kit-elektro-maschine', {name: r.name, origin: r.origin});
  ok('T2b alle 12 Pads tragen genau die Kit-Werte', r.bad.length === 0, r.bad.slice(0, 6));
  ok('T3a jedes der 12 Pads spielt', r.pads.every(x => x === 1), r.pads);
  ok('T3b 2 Takte Drums klingen (Pegel, keine NaN, unter 0 dBFS) und anders als 909', r.clipNotes >= 12 && r.nan === 0 && r.rmsDb > -45 && r.peak < 0 && r.diff909 > -20, {notes: r.clipNotes, rms: r.rmsDb, peak: r.peak, d909: r.diff909, nan: r.nan});
  ok('T3d jedes Pad im Offline-Render hörbar (Spitze > −40 dBFS)', r.padDb && r.padDb.every(v => v > -40), r.padDb);
  ok('T3c Pedal-Hat (SHAKER) schließt die offene Hat', r.choke >= 1, r.choke);
  ok('T5a MIDI-Export: Drum-Spur auf Kanal 10, nur Pad-Noten', r.midiOk || r.drumNotes === 0, {notes: r.midiNotes, clip: r.drumNotes});
  ok('T5b Live-MIDI: Pad-Note spielt dasselbe Pad', r.live);
  ok('T2c ohne Fehler', errs.length === 0, errs.slice(0, 3));
  await ctx.close(); }

// T6 – Klang in der App = gemessener Nachbau: je Pad ein Schlag durch die ganze App-Kette (Clip → Song-Render, Kit-Bus, Spur-FX)
// gegen denselben Schlag direkt aus der Drum-Engine (wie bei der Messung, dieselben Rausch-Puffer). Terzband-Form 25 Hz–16 kHz (je auf
// ihr lautestes Band normiert, Bänder bis 40 dB darunter): < 2 dB RMS, kein Band > 3,5 dB. Die Kette der App (Spur, Master) gibt an
// den Rändern (25–31 Hz, 16 kHz) bis ≈ 3 dB dazu/weg – gleich für jedes Kit.
{ const {ctx, p, errs} = await page();
  const r = await p.evaluate(async (N) => {
    const TZ = [25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000];
    const fft = (re, im) => { const n = re.length; for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
      for (let len = 2; len <= n; len <<= 1) { const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a); for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let k = 0; k < len / 2; k++) { const ur = re[i + k], ui = im[i + k], xr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci, xi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr; re[i + k] = ur + xr; im[i + k] = ui + xi; re[i + k + len / 2] = ur - xr; im[i + k + len / 2] = ui - xi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } } };
    const terz = (x, sr) => { const n = 32768, re = new Float64Array(n), im = new Float64Array(n); for (let i = 0; i < Math.min(n, x.length); i++) re[i] = x[i]; fft(re, im);
      const P = TZ.map(f => { const a = Math.ceil(f * 2 ** (-1 / 6) * n / sr), b = Math.floor(f * 2 ** (1 / 6) * n / sr); let s = 0; for (let k = a; k <= b; k++) s += re[k] * re[k] + im[k] * im[k]; return 10 * Math.log10(s + 1e-30); });
      const mx = Math.max(...P); return P.map(v => Math.max(v - mx, -40)); };
    ensureAudio(); drumBufs(); await __W(300); SYNQUENZER.loadKit(N); await __W(200);
    const out = [], vel = 100 / 127;
    for (const sl of DRUM_VOICES) {
      for (const t of S.tracks) t.clips = t.clips.map(() => null);
      S.tracks[DRUM_T].clips[0] = normClip({len: 1, key: Object.assign({}, S.key), notes: [{t: 0, d: .25, n: sl.gm, v: vel}]}, 'drum', S.key); R.selS = 0;
      SYNQUENZER.songFromChain([{scene: 0, bars: 1}]);
      const A = await __R(1), sr = A.sr, L = Math.round(.5 * sr), m = new Float32Array(L);
      let i0 = 0; for (let k = 0; k < A.L.length; k++) if (Math.abs(A.L[k]) + Math.abs(A.R[k]) > 1e-4) { i0 = Math.max(0, k - 32); break; }
      for (let k = 0; k < L && i0 + k < A.L.length; k++) m[k] = (A.L[i0 + k] + A.R[i0 + k]) / 2;
      const c = new OfflineAudioContext(1, L, sr), B = (AU.drumBufs && AU.drumBufs.white) ? AU.drumBufs : DrumSynth.buildBuffers(c);   // dieselben Rausch-Puffer wie die App
      const MR = Math.random; Math.random = () => .3125; let d;
      try { DrumSynth.hit(c, B, c.destination, Object.assign({}, DrumSynth.DEFAULTS, slotParams(sl.id)), vel, 0.001, {}); d = (await c.startRendering()).getChannelData(0); }
      finally { Math.random = MR; }
      const ta = terz(m, sr), tb = terz(d, sr); let q = 0, nb = 0, wk = 0;
      for (let k = 0; k < TZ.length; k++) if (ta[k] > -40 || tb[k] > -40) { q += (ta[k] - tb[k]) ** 2; nb++; if (Math.abs(ta[k] - tb[k]) > Math.abs(ta[wk] - tb[wk])) wk = k; }
      out.push({pad: sl.id, rms: Math.round(Math.sqrt(q / Math.max(nb, 1)) * 100) / 100, worst: TZ[wk] + ' Hz ' + Math.round((ta[wk] - tb[wk]) * 10) / 10});
    }
    return out;
  }, N).catch(e => [{pad: 'eval', rms: 99, err: String(e)}]);
  ok('T6 Klang in der App = gemessener Nachbau (Terz-Form je Pad < 2 dB RMS, kein Band > 3,5 dB)', r.length === 12 && r.every(x => x.rms < 2 && Math.abs(parseFloat(String(x.worst).split(' Hz ')[1])) < 3.5), r.map(x => x.pad + ' ' + x.rms + ' (' + x.worst + ')' + (x.err ? ' ' + x.err : '')).join(', '));
  ok('T6b ohne Fehler', errs.length === 0, errs.slice(0, 3));
  await ctx.close(); }

// T4 – Speichern/Laden: Projekt-JSON hin und zurück, und Seite neu laden (Autosave)
{ const ctx = await b.newContext({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + file); await p.waitForTimeout(1800);
  const r1 = await p.evaluate(async (N) => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    SYNQUENZER.loadKit(N); await w(200); drumSet('kick', 'frq', 61.5);   // eigene Änderung muss mit
    const j = serializeProject(), P = JSON.parse(j), d = P.tracks[DRUM_T].sound;
    SYNQUENZER.loadKit('808'); await w(150); const mid = drumSnd().name;
    applyProject(JSON.parse(j), {}); await w(300);
    const back = drumSnd().name, kf = slotParams('kick').frq, hc = slotParams('hatC').mDec;
    try { if (autosave && autosave.flush) await autosave.flush(); } catch (e) {}
    await w(800);
    return {jsonName: d.name, jsonKick: d.p.slots.kick.frq, mid, back, kf, hc, want: cmdKitData().hatC.mDec};
  }, N).catch(e => ({err: String(e)}));
  ok('T4a Projekt-JSON trägt Kit + eigene Änderung, Laden stellt es wieder her', r1.jsonName === N && r1.jsonKick === 61.5 && r1.mid === '808' && r1.back === N && r1.kf === 61.5 && Math.abs(r1.hc - r1.want) < 1e-9, r1);
  await p.reload(); await p.waitForTimeout(2200);
  const r2 = await p.evaluate(() => ({name: drumSnd().name, kf: slotParams('kick').frq, origin: drumSnd().origin})).catch(e => ({err: String(e)}));
  ok('T4b nach Neuladen der Seite: Kit + Änderung noch da', r2.name === N && r2.kf === 61.5, r2);
  ok('T4c ohne Fehler', errs.length === 0, errs.slice(0, 3));
  await ctx.close(); }

// T7 – Lautheit je Pad: 24 Schläge je Pad mit frischem Zufall und frischen Rausch-Puffern (wie verschiedene Schläge in der App),
// Anschlag 100, K-bewertet 0–400 ms, Median relativ zum Median des Kicks; Ziel aus der privaten Datei (CMD2_ZIEL)
{ const Z = process.env.CMD2_ZIEL && fs.existsSync(process.env.CMD2_ZIEL) ? JSON.parse(fs.readFileSync(process.env.CMD2_ZIEL, 'utf8')) : null;
  if (!Z) console.log('HINWEIS T7 übersprungen: CMD2_ZIEL (private Ziel-Datei) fehlt');
  else { const {ctx, p, errs} = await page();
    const r = await p.evaluate(async ([N, NN]) => {
      ensureAudio(); drumBufs(); await __W(200); SYNQUENZER.loadKit(N); await __W(200);
      const bq = (b, a, x) => { const y = new Float64Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const v = b[0] * x[i] + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; } return y; };
      const loud = x => { const n = 19200, z = new Float64Array(n); z.set(x.subarray(0, n)); const y = bq([1, -2, 1], [1, -1.99004745483398, 0.99007225036621], bq([1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585], z)); let s = 0; for (let i = 0; i < n; i++) s += y[i] * y[i]; return 10 * Math.log10(s / n + 1e-30) - 0.691; };
      const seed = s => { let x = (s >>> 0) || 1; Math.random = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; };
      const MR = Math.random, out = {};
      try {
        for (const sl of DRUM_VOICES) {
          const L = [];
          for (let j = 0; j < NN; j++) {
            const sd = (701 + j) * 7919 + 13; seed(sd * 3 + 1); const B = DrumSynth.buildBuffers(new OfflineAudioContext(1, 48000, 48000)); seed(sd);
            const c = new OfflineAudioContext(1, 24000, 48000);
            DrumSynth.hit(c, B, c.destination, Object.assign({}, DrumSynth.DEFAULTS, slotParams(sl.id)), 100 / 127, 0.001, {});
            L.push(loud((await c.startRendering()).getChannelData(0)));
          }
          L.sort((a, b) => a - b); out[sl.id] = {med: L[L.length >> 1], min: L[0], max: L[L.length - 1]};
        }
      } finally { Math.random = MR; }
      return out;
    }, [N, 24]).catch(e => ({err: String(e)}));
    if (r.err) console.log('FEHLER im Ablauf: ' + r.err);
    const k = r.kick ? r.kick.med : NaN, rows = [];
    let all = !r.err;
    for (const pad of Object.keys(Z)) { if (pad === 'kick') continue; const x = r[pad]; const d = x ? x.med - k - Z[pad] : NaN; rows.push(pad + ' ' + (x ? (x.med - k).toFixed(1) : '?') + '/' + Z[pad].toFixed(1) + ' (' + (d >= 0 ? '+' : '') + (isFinite(d) ? d.toFixed(1) : '?') + ')'); if (!(Math.abs(d) <= 1)) all = false; }
    ok('T7 Lautheit je Pad im Median ±1 dB am Ziel (24 Schläge, relativ zum Kick; Ist/Ziel (Abweichung) dB)', all, rows.join(', '));
    ok('T7b ohne Fehler', errs.length === 0, errs.slice(0, 3));
    await ctx.close(); } }

// Hilfen für T8/T9: Standard-MIDI-Datei lesen (Laufstatus, Meta, SysEx) → Note-an je Taste auf Kanal 10
function midiCount(bytes) {
  const u = Uint8Array.from(bytes), c = {}; let i = 14;
  while (i + 8 <= u.length) {
    const len = (u[i + 4] << 24 | u[i + 5] << 16 | u[i + 6] << 8 | u[i + 7]) >>> 0, end = i + 8 + len; let j = i + 8, st = 0;
    if (String.fromCharCode(u[i], u[i + 1], u[i + 2], u[i + 3]) === 'MTrk') while (j < end) {
      while (u[j] & 0x80) j++; j++;                                   // Delta-Zeit
      let s = u[j]; if (s & 0x80) j++; else s = st;
      if (s === 0xFF) { j++; let l = 0; do { l = (l << 7) | (u[j] & 0x7f); } while (u[j++] & 0x80); j += l; continue; }
      if (s === 0xF0 || s === 0xF7) { let l = 0; do { l = (l << 7) | (u[j] & 0x7f); } while (u[j++] & 0x80); j += l; continue; }
      st = s; const t = s & 0xF0, n2 = t === 0xC0 || t === 0xD0 ? 1 : 2;
      if (t === 0x90 && (s & 15) === 9 && u[j + 1] > 0) c[u[j]] = (c[u[j]] || 0) + 1;
      j += n2;
    }
    i = end;
  }
  return c;
}
// Erwartung aus der Datei: Import-Kern der BASIS (4.79, ohne CMD2) liest die Tasten roh; Umlegung wie im Auftrag
const CMD2_MAP = {37: 36, 38: 38, 39: 39, 41: 45, 42: 42, 43: 47, 44: 70, 45: 50, 46: 46};
function erwartung(cbp) {
  const html = fs.readFileSync(path.join(here, '..', '..', 'synq-snapshots', 'R-4790.html'), 'utf8');
  const a = html.indexOf('<script type="text/plain" id="sq-xla-src">'), b2 = html.indexOf('</script>', a);
  const m = {exports: {}}; new Function('module', 'self', html.slice(html.indexOf('>', a) + 1, b2))(m, undefined);
  const M = m.exports.read(new Uint8Array(fs.readFileSync(cbp)));
  const per = [], pad = {}, uniq = new Set();
  for (const t of M.tracks) if (t.role === 'drums' && t.sounding) {
    const k = {}; for (const n of t.notes) { k[n.n] = (k[n.n] || 0) + 1; const q = CMD2_MAP[n.n]; pad[q] = (pad[q] || 0) + 1; uniq.add(n.tick + ':' + q); }
    per.push({spur: t.idx + 1, tasten: k});
  }
  const pu = {}; for (const x of uniq) { const q = x.split(':')[1]; pu[q] = (pu[q] || 0) + 1; }
  return {per, pad, pu};
}
async function importiere(p, b64, name) {
  return p.evaluate(async ([b64, name]) => {
    const s = atob(b64), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
    const sum = await xlaFile(u.buffer, name); const c = XLA.cur; if (!sum || !c) return {err: 'Datei nicht geöffnet: ' + (c && c.err)};
    const res = await xlaBuild(c); await __W(200);
    const sheet = (document.querySelector('.xlainfo') ? [...document.querySelectorAll('.xlainfo')].map(e => e.textContent).join(' | ') : '');
    return {drumKit: sum.drumKit, drumMap: sum.drumMap, drums: sum.drums.length, factory: res.tracks[DRUM_T] && res.tracks[DRUM_T].sound.factory, sheet};
  }, [b64, name]);
}

// T8 – Import der echten Projektdatei (nur lokal)
{ const CBP = process.env.CMD2_CBP && fs.existsSync(process.env.CMD2_CBP) ? process.env.CMD2_CBP : null;
  if (!CBP) console.log('HINWEIS T8 übersprungen: CMD2_CBP (private Projektdatei) fehlt');
  else { const E = erwartung(CBP), {ctx, p, errs} = await page();
    const r0 = await importiere(p, fs.readFileSync(CBP).toString('base64'), 'Test').catch(e => ({err: String(e)}));
    if (r0.err) console.log('FEHLER im Ablauf: ' + r0.err);
    ok('T8a Import-Blatt: Drum-Spuren erkannt → Kit Elektro-Maschine, Zeile nennt Kit und Umlegung', r0.drumKit === 'kit:elektro' && r0.factory === 'kit:elektro' && r0.drumMap && r0.drumMap.length === r0.drums && /DRUMS: .* → Kit Elektro-Maschine · Tasten umgelegt/.test(r0.sheet), {drumKit: r0.drumKit, umgelegt: r0.drumMap && r0.drumMap.length, drums: r0.drums, zeile: /→ Kit [^|·]*(· Tasten umgelegt)?/.exec(r0.sheet || '') ? /→ Kit [^|·]*(· Tasten umgelegt)?/.exec(r0.sheet)[0] : ''});
    if (PFOT) for (const [w, h, tag] of [[428, 926, 'hoch'], [926, 428, 'quer']]) { await p.setViewportSize({width: w, height: h}); await p.waitForTimeout(400);
      await p.evaluate(() => { const e = [...document.querySelectorAll('.xlainfo')].find(x => /DRUMS:/.test(x.textContent)); if (e) e.scrollIntoView({block: 'center'}); }); await p.waitForTimeout(250);
      await p.screenshot({path: PFOT + '/cmd2-import-blatt-' + tag + '.png'}); }
    await p.setViewportSize({width: 428, height: 926});
    const r = await p.evaluate(async () => {
      const o = {}, u0 = UNDO.length, prevKit = drumSnd().origin, prevName = S.name;
      o.applied = await xlaApply(); await __W(500);
      const cnt = () => { const m = buildMidiSong(false); return m && m.bytes ? Array.from(m.bytes) : []; };
      o.undoN = UNDO.length - u0; o.kind = UNDO.length ? UNDO[UNDO.length - 1].kind : ''; o.kit = drumSnd().origin; o.kitName = drumSnd().name; o.midi = cnt();
      o.sel = drumSnd().p && drumSnd().p.slots ? Object.keys(drumSnd().p.slots).length : 0;
      undo(); await __W(600); o.undoKit = drumSnd().origin; o.undoName = S.name; o.prevKit = prevKit; o.prevName = prevName;
      redo(); await __W(600); o.redoKit = drumSnd().origin; o.midiRedo = cnt();
      const j = serializeProject(); applyProject(JSON.parse(j), {}); await __W(400); o.same = serializeProject() === j; o.loadKit = drumSnd().origin; o.midiLoad = cnt();
      try { if (autosave && autosave.flush) await autosave.flush(); } catch (e) {} await __W(800);
      return o;
    }).catch(e => ({err: String(e)}));
    if (r.err) console.log('FEHLER im Ablauf: ' + r.err);
    const got = r.midi ? midiCount(r.midi) : {}, want = E.pu, keys = [...new Set(Object.keys(got).concat(Object.keys(want)))].sort((a, b) => a - b);
    const diff = keys.filter(k => (got[k] || 0) !== (want[k] || 0)).map(k => k + ':' + (got[k] || 0) + '≠' + (want[k] || 0));
    ok('T8b Import: Kit Elektro-Maschine auf der Drum-Spur', r.applied === true && r.kit === 'f-kit-elektro-maschine' && r.kitName === N, {kit: r.kit, name: r.kitName});
    ok('T8c Song spielt je Pad genau die Noten der Datei (MIDI-Export wie gehört = Notenzahl je Taste nach Umlegung)', keys.length > 0 && diff.length === 0, {pads: got, datei_je_spur: E.per, abweichung: diff, gleichzeitig_doppelt: Object.keys(E.pad).filter(k => E.pad[k] !== E.pu[k]).map(k => k + ':' + E.pad[k] + '→' + E.pu[k])});
    ok('T8d Import ist EIN ↶-Schritt; ↶ bringt das vorige Projekt, ↷ den Import (gleiche Noten)', r.undoN === 1 && r.kind === 'xla' && r.undoKit === r.prevKit && r.undoName === r.prevName && r.redoKit === 'f-kit-elektro-maschine' && JSON.stringify(midiCount(r.midiRedo || [])) === JSON.stringify(got), {undo: r.undoN, kind: r.kind, nachUndo: r.undoKit, nachRedo: r.redoKit});
    ok('T8e Speichern/Laden bitgleich (Projekt-JSON), Kit und Noten bleiben', r.same === true && r.loadKit === 'f-kit-elektro-maschine' && JSON.stringify(midiCount(r.midiLoad || [])) === JSON.stringify(got), {same: r.same, kit: r.loadKit});
    await p.reload(); await p.waitForTimeout(2400);
    const r2 = await p.evaluate(() => { const m = buildMidiSong(false); return {kit: drumSnd().origin, midi: m && m.bytes ? Array.from(m.bytes) : []}; }).catch(e => ({err: String(e)}));
    ok('T8f nach Neuladen der Seite: Kit und Noten noch da', r2.kit === 'f-kit-elektro-maschine' && JSON.stringify(midiCount(r2.midi || [])) === JSON.stringify(got), {kit: r2.kit});
    ok('T8g ohne Fehler', errs.length === 0, errs.slice(0, 3));
    await ctx.close(); } }

// T9 – Datei mit GM-Drums (Bassdrum auf 36): keine Umlegung, Kit wie bisher (öffentliche Testdatei aus dem XLA-Paket)
{ const F = path.join(here, '..', 'xla', 'tests', 'synth-song.cbp');
  if (!fs.existsSync(F)) console.log('HINWEIS T9 übersprungen: Testdatei fehlt');
  else { const {ctx, p, errs} = await page();
    const r = await importiere(p, fs.readFileSync(F).toString('base64'), 'GM').catch(e => ({err: String(e)}));
    ok('T9 GM-Drums: Kit wie in 4.79 (nicht Elektro-Maschine), keine Umlegung, Zeile ohne „umgelegt“', !r.err && r.drumKit && r.drumKit !== 'kit:elektro' && r.drumMap.length === 0 && /→ Kit /.test(r.sheet) && !/umgelegt/.test(r.sheet), {drumKit: r.drumKit, umgelegt: r.drumMap && r.drumMap.length, err: r.err});
    ok('T9b ohne Fehler', errs.length === 0, errs.slice(0, 3));
    await ctx.close(); } }

// Fotos: Kit-Browser (Reiter Kits) und Drum-Editor Seite KIT, hochkant + quer
if (FOT) for (const [w, h, tag] of [[428, 926, 'hoch'], [926, 428, 'quer']]) {
  const {ctx, p} = await page({width: w, height: h});
  await p.evaluate((N) => { SYNQUENZER.loadKit(N); }, N); await p.waitForTimeout(300);
  await p.evaluate(() => { try { openBrowser(DRUM_T); } catch (e) {} }); await p.waitForTimeout(700);
  // die Zeile in der Liste (nicht der Name im Kopf): letzte sichtbare Fundstelle, Liste rollt mit
  await p.evaluate((N) => { const els = [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && e.textContent.trim() === N && e.offsetParent); const el = els[els.length - 1]; if (el) el.scrollIntoView({block: 'center'}); }, N);
  await p.waitForTimeout(300); await p.screenshot({path: FOT + '/cmd2-browser-' + tag + '.png'});
  await ctx.close();
}
const bad = res.filter(x => !x.ok);
console.log(bad.length ? 'FEHLER: ' + bad.length + ' von ' + res.length : 'ALLE OK: ' + res.length);
await b.close();
process.exit(bad.length ? 1 : 0);
