// T1 Taktarten – Abnahme T1-01 … T1-07 (SPEC §6). Playwright + Chromium, iPhone-Maße mit Touch.
// Aufruf: node t1-taktarten.mjs <index.html>
import { chromium } from 'playwright';
const FILE = process.argv[2];
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await b.newContext({ viewport: { width: 428, height: 926 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 });
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + FILE); await p.waitForTimeout(1500);
let fail = 0; const ok = (id, c, i) => { if (!c) fail++; console.log((c ? 'PASS ' : 'FAIL ') + id + (i ? ' — ' + i : '')); };
const E = (f, a) => p.evaluate(f, a);
const sleep = ms => p.waitForTimeout(ms);

// ---------- T1-01 Metronom je Taktart: Klicks sample-genau, Betonung auf 1, Zwischen-Zählzeiten leise ----------
await E(() => { const Q = window.SYNQUENZER; Q.loadDemo(); });
await sleep(300);
for (const ts of ['4/4', '3/4', '2/4', '5/4', '6/8', '7/8', '12/8']) {
  await E(ts => {
    const Q = window.SYNQUENZER; if (R.playing) Q.stop(); Q.setSongTs(ts, {quiet: true}); Q.setBpm(240); S.settings.metro = true;
    window.__ck = []; if (!window.__ckW) { const o = window.click; window.click = function (t, acc, soft) { window.__ck.push([t, !!acc, !!soft]); return o.apply(this, arguments); }; window.__ckW = 1; }
    Q.play();
  }, ts);
  const d = await E(ts => tsOf(ts).b * 2 * 0.25 * 1000 + 250, ts);
  await sleep(d);
  const r = await E(ts => {
    const st = R.startTime, sp = spb(), sr = AU.ctx.sampleRate, D = tsOf(ts), ck = window.__ck.slice(); window.SYNQUENZER.stop();
    const want = []; for (let bar = 0; bar < 2; bar++) for (let k = 0; k < D.n; k++) want.push({b: bar * D.b + k * D.u, lv: D.acc[k]});
    const got = ck.map(([t, a, s]) => ({b: (t - st) / sp, smp: Math.round((t - st) * sr), a, s})).filter(x => x.b < 2 * D.b - 1e-6);
    let bad = [];
    want.forEach((w, i) => { const g = got[i]; if (!g || g.smp !== Math.round(w.b * sp * sr) || g.a !== (w.lv === 2) || g.s !== (w.lv === 0)) bad.push(i + ':' + JSON.stringify(w) + '≠' + JSON.stringify(g)); });
    return {n: got.length, want: want.length, bad: bad.slice(0, 3), grid: grid().beatsPerBar, bb: D.b};
  }, ts);
  ok('T1-01 Metronom ' + ts + ': ' + r.want + ' Klicks sample-genau, Betonung auf 1', r.n === r.want && !r.bad.length, r.n + '/' + r.want + ' ' + r.bad.join(' '));
  ok('T1-02 Raster ' + ts + ': grid().beatsPerBar = ' + r.bb, r.grid === r.bb, 'grid ' + r.grid);
}
// Einzähler in 3/4 und 6/8: 1 Takt der Taktart, Eins betont
for (const ts of ['3/4', '6/8']) {
  await E(ts => { const Q = window.SYNQUENZER; Q.setSongTs(ts, {quiet: true}); S.settings.metro = false; window.__ck = []; ensureAudio(); startTransport(1); }, ts);
  await sleep(1300);
  const r = await E(ts => { const st = R.startTime, sp = spb(), D = tsOf(ts), ck = window.__ck.map(([t, a, s]) => [+((t - st) / sp).toFixed(6), a, s]); window.SYNQUENZER.stop(); return {ck, D, ciB: R.ciB}; }, ts);
  const neg = r.ck.filter(x => x[0] < 0), exp = Array.from({length: r.D.n}, (_, k) => -r.D.b + k * r.D.u);
  ok('T1-01 Einzähler ' + ts + ': ' + r.D.n + ' Klicks ab −' + r.D.b + ', Eins betont', neg.length === r.D.n && neg.every((x, i) => Math.abs(x[0] - exp[i]) < 1e-9) && neg[0][1] && neg.slice(1).every(x => !x[1]), JSON.stringify(neg));
}

// ---------- T1-03 Wechsel im Song: Teil in 3/4 zwischen 4/4 ----------
const s3 = await E(async () => {
  const Q = window.SYNQUENZER; Q.loadDemo(); await new Promise(r => setTimeout(r, 200));
  Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}, {scene: 0, bars: 2}]);
  const sg = JSON.parse(JSON.stringify(Q.project().song));
  sg.marks = [{id: 'M1', a: 0, len: 2, part: null}, {id: 'M2', a: 2, len: 2, part: null}, {id: 'M3', a: 4, len: 2, part: null}];
  sg.carrier = [{beat: 0, target: null}, {beat: 13, target: {root: 7, kind: 'single'}}];   // Takt 4, Schlag 2 (4/4)
  Q.setSong(sg);
  const before = Q.taktInfo(7);
  Q.setMarkTs('M2', '3/4');
  const after = Q.taktInfo(7), car = S.song.carrier.map(c => c.beat);
  // Offline-Durchlauf: Ereignisse über b2t
  const ev = []; const o = window.drumHit; window.drumHit = function (n, v, t) { ev.push([n, t]); return o.apply(this, arguments); };
  let t0 = null; const ow = window.vvRenderAudio0;
  const v = await Q.vvRender({}); window.drumHit = o;
  const sp = spb(), first = Math.min(...ev.map(e => e[1])), rel = ev.map(e => +((e[1] - first) / sp).toFixed(4));
  // erwartet: jeder Block spielt seinen Drum-Clip ab dem eigenen Taktstrich (0, 8, 14) in Schleife
  const want = new Set(); for (const [a, z, sc] of [[0, 8, 0], [8, 14, 1], [14, 22, 0]]) { const c = S.tracks[DRUM_T].clips[sc]; if (!c) continue; const L = clipB(c); for (let o = a; o < z - 1e-9; o += L) for (const n of c.notes) if (o + n.t < z - 1e-9 && n.t < L) want.add(+(o + n.t).toFixed(4)); }
  const got = new Set(ev.map(e => +((e[1] - first) / sp).toFixed(4)));
  const miss = [...want].filter(x => !got.has(x)), extra = [...got].filter(x => !want.has(x));
  return {before: before.bars.map(x => x.beat), after: after.bars.map(x => x.beat + ':' + x.ts), car, songSec: v.songSec, sp, rel: [...new Set(rel)].sort((a, b) => a - b), marks: S.song.marks, miss, extra, nw: want.size};
});
ok('T1-03 Taktkarte 4/4 | 3/4 | 4/4: Taktstriche 0 4 8 11 14 18 22', s3.after.join(' ') === '0:4/4 4:4/4 8:3/4 11:3/4 14:4/4 18:4/4 22:4/4', s3.after.join(' '));
ok('T1-03 Träger hinter dem Wechsel bleibt an seinem Takt (Takt 4 Schlag 2 → Schlag 12)', s3.car.includes(12) && !s3.car.includes(13), JSON.stringify(s3.car));
ok('T1-03 Offline-Länge = 22 Schläge', Math.abs(s3.songSec - 22 * s3.sp) < 1e-9, s3.songSec + ' s');
ok('T1-03 Drum-Schläge = Clips ab den Taktstrichen 0 / 8 / 14 (sample-genau über b2t)', s3.nw > 10 && !s3.miss.length && !s3.extra.length, s3.nw + ' erwartet; fehlen ' + s3.miss.join(',') + '; zu viel ' + s3.extra.join(','));
// Metronom im Song: Betonung auf 0 4 8 11 14 18
const s3m = await E(async () => {
  const Q = window.SYNQUENZER; Q.setBpm(240); S.settings.metro = true; window.__ck = [];
  Q.songPlay(0); await new Promise(r => setTimeout(r, 22 * .25 * 1000 + 300));
  const st = R.startTime, sp = spb(), ck = window.__ck.map(([t, a]) => [+((t - st) / sp).toFixed(6), a]); Q.stop();
  return ck.filter(x => x[1]).map(x => x[0]).filter(x => x < 22);
});
ok('T1-03 Metronom im Song: Einsen auf 0 4 8 11 14 18', s3m.join(' ') === '0 4 8 11 14 18', s3m.join(' '));
// Teil-Sprung / Schleife über den 3/4-Teil
const s3l = await E(async () => {
  const Q = window.SYNQUENZER; S.settings.metro = true; S.song.loop = {on: true, a: 2, b: 4}; window.__ck = [];
  Q.songPlay(2); await new Promise(r => setTimeout(r, 14 * .25 * 1000 + 200));
  const st = R.startTime, sp = spb(), ck = window.__ck.map(([t, a]) => [+((t - st) / sp).toFixed(6), a]); Q.stop(); S.song.loop = {on: false, a: 0, b: 0};
  return ck.filter(x => x[1]).map(x => x[0]).filter(x => x < 13);
});
ok('T1-03 Schleife über den 3/4-Teil: Einsen alle 3 Schläge', s3l.slice(0, 4).join(' ') === '0 3 6 9', s3l.join(' '));

// ---------- T1-04 Drum-Pattern-Umrechnung ----------
const s4 = await E(() => {
  const Q = window.SYNQUENZER, N = [];
  for (const t of [0, 2]) N.push({t, d: .1, n: 36, v: .9}); for (const t of [1, 3]) N.push({t, d: .1, n: 38, v: .9}); for (let k = 0; k < 8; k++) N.push({t: k * .5, d: .1, n: 42, v: .6});
  const c = {len: 1, key: {root: 0, scale: 'ionian'}, notes: N}, f = (cc, n) => cc.notes.filter(x => x.n === n).map(x => x.t).join(',');
  const out = {};
  for (const ts of ['3/4', '6/8', '5/4', '7/8', '12/8', '2/4']) { const r = Q.convClip(c, ts); out[ts] = {k: f(r, 36), s: f(r, 38), h: f(r, 42), ts: r.ts}; }
  const back = Q.convClip(Q.convClip(c, '6/8'), '4/4'); out.rt = {k: f(back, 36), s: f(back, 38), h: f(back, 42), ts: back.ts || null};
  return out;
});
const W4 = {'3/4': ['0,2', '1', '0,0.5,1,1.5,2,2.5'], '6/8': ['0', '1.5', '0,1,1.5,2.5'], '5/4': ['0,2,4', '1,3', '0,0.5,1,1.5,2,2.5,3,3.5,4,4.5'],
  '7/8': ['0,2', '1,3', '0,0.5,1,1.5,2,2.5,3'], '12/8': ['0,3', '1.5,4.5', '0,1,1.5,2.5,3,4,4.5,5.5'], '2/4': ['0', '1', '0,0.5,1,1.5']};
for (const ts of Object.keys(W4)) { const g = s4[ts], w = W4[ts]; ok('T1-04 Drum 4/4 → ' + ts + ' (Bass ' + w[0] + ' · Snare ' + w[1] + ')', g.k === w[0] && g.s === w[1] && g.h === w[2] && g.ts === ts, JSON.stringify(g)); }
ok('T1-04 4/4 → 6/8 → 4/4 = Original', s4.rt.k === '0,2' && s4.rt.s === '1,3' && s4.rt.h === '0,0.5,1,1.5,2,2.5,3,3.5' && s4.rt.ts === null, JSON.stringify(s4.rt));
// Schritte-Ansicht eines 3/4-Drum-Clips: 12 Schritte, Zellen ≥ 44 px
const s4b = await E(async () => {
  const Q = window.SYNQUENZER; Q.loadDemo(); await new Promise(r => setTimeout(r, 200));
  Q.setSongTs('3/4', {quiet: true}); R.selS = 0;
  const c = S.tracks[DRUM_T].clips[0]; Q.setClipTs(DRUM_T, 0, '3/4');
  openRoll(DRUM_T, 0); await new Promise(r => setTimeout(r, 300));
  const cells = [...document.querySelectorAll('.pg-dsteps .se-row .se-cell')].map(e => e.getBoundingClientRect());
  Q.toggleStep('kick', 11, 0); const has = S.tracks[DRUM_T].clips[0].notes.some(n => n.n === 36 && Math.abs(n.t - 2.75) < 1e-9);
  return {n: cells.length, minW: Math.min(...cells.map(r => r.width)), minH: Math.min(...cells.map(r => r.height)), has, len: clipB(S.tracks[DRUM_T].clips[0])};
});
ok('T1-04 Schritte 3/4: 12 Zellen, ≥ 44 px, Schritt 12 = Schlag 2¾', s4b.n === 12 && s4b.minW >= 44 && s4b.minH >= 40 && s4b.has && s4b.len === 3, JSON.stringify(s4b));
await E(() => { try { closeEditor(); } catch (e) {} });

// ---------- T1-05 Undo/Redo und Speichern/Laden ----------
const s5 = await E(async () => {
  const Q = window.SYNQUENZER; Q.loadDemo(); await new Promise(r => setTimeout(r, 200));
  Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}, {scene: 0, bars: 2}]);
  const j0 = JSON.stringify(Q.project()), u0 = UNDO.length;
  Q.setSongTs('6/8', {quiet: true}); const j1 = JSON.stringify(Q.project()), u1 = UNDO.length;
  Q.undo(); const j2 = JSON.stringify(Q.project());
  Q.redo(); const j3 = JSON.stringify(Q.project());
  Q.setMarkTs && (S.song.marks = [{id: 'M1', a: 0, len: 2, part: null}, {id: 'M2', a: 2, len: 2, part: null}]);
  const u2 = UNDO.length; Q.setMarkTs('M2', '7/8'); const u3 = UNDO.length, j4 = JSON.stringify(Q.project()); Q.undo(); const j5ts = S.song.marks[1].ts || null; Q.redo();
  const u4 = UNDO.length; Q.setClipTs(DRUM_T, 0, '12/8'); const u5 = UNDO.length, cj = JSON.stringify(Q.getClip(DRUM_T, 0)); Q.undo(); const cj2 = JSON.stringify(Q.getClip(DRUM_T, 0)); Q.redo();
  const ser = serialize(), pf = SQStore.parseFile(ser, {normalizeProject}), back = pf.project, p1 = JSON.parse(serializeProject()), p2 = JSON.parse(JSON.stringify(back, stripReplacer));
  delete p1.ui; delete p2.ui;
  const fmt = JSON.parse(ser).format;
  return {one: u1 - u0 === 1 && u3 - u2 === 1 && u5 - u4 === 1, undo: j2 === j0, redo: j3 === j1, ts: JSON.parse(j1).ts, mark: JSON.parse(j4).song.marks[1].ts, j5ts, clipTs: JSON.parse(cj).ts, cl2: JSON.parse(cj2).ts || null,
    deep: JSON.stringify(p1) === JSON.stringify(p2), fmt, sts: back.ts, mts: back.song.marks[1].ts, cts: back.tracks[DRUM_T].clips[0].ts};
});
ok('T1-05 je Aktion genau 1 Undo-Schritt (Song, Teil, Clip)', s5.one);
ok('T1-05 Undo stellt alles wieder her, Redo wieder 6/8', s5.undo && s5.redo && s5.ts === '6/8');
ok('T1-05 Teil 7/8: Undo/Redo', s5.mark === '7/8' && s5.j5ts === null);
ok('T1-05 Clip 12/8: Undo/Redo', s5.clipTs === '12/8' && s5.cl2 === null);
ok('T1-05 Speichern → Laden deep-equal (S.ts, marks[].ts, clip.ts), Format 7', s5.deep && s5.sts === '6/8' && s5.mts === '7/8' && s5.cts === '12/8' && s5.fmt === 7, JSON.stringify({deep: s5.deep, fmt: s5.fmt}));

// ---------- T1-06 MIDI-Export: FF 58 ----------
const s6 = await E(() => {
  const Q = window.SYNQUENZER; Q.setSongTs(null, {quiet: true}); S.song.marks = [{id: 'M1', a: 0, len: 2, part: null}, {id: 'M2', a: 2, len: 2, part: null, ts: '3/4'}]; tkBump();
  const m = buildMidi({mode: 'song'}), a = Array.from(m.bytes || m.data || m);
  // erste Spur (Tempo) lesen: Delta-Zeiten + Meta-Ereignisse
  let i = 14; const out = []; if (String.fromCharCode(...a.slice(i, i + 4)) !== 'MTrk') return {err: 'kein MTrk'};
  const len = (a[i + 4] << 24) | (a[i + 5] << 16) | (a[i + 6] << 8) | a[i + 7]; let k = i + 8, tk = 0; const end = k + len;
  const vlq = () => { let v = 0, c; do { c = a[k++]; v = (v << 7) | (c & 127); } while (c & 128); return v; };
  while (k < end) { tk += vlq(); if (a[k] === 0xFF) { const ty = a[k + 1]; k += 2; const l = vlq(); out.push({tk, ty, d: a.slice(k, k + l)}); k += l; } else break; }
  const scn = buildMidi({mode: 'scene', scene: 0}), plain = Array.from(scn.bytes || scn.data || scn);
  return {ts: out.filter(e => e.ty === 0x58).map(e => e.tk + ':' + e.d.join('.')), mk: out.filter(e => e.ty === 6).map(e => e.tk), keys: Object.keys(m).slice(0, 5), plainHas: plain.join(',').includes('255,88,4,4,2,24,8')};
});
ok('T1-06 MIDI Song: FF 58 4/4 bei 0, 3/4 bei Tick 3840 (Takt 3), 4/4 bei 6720 (Takt 5)', s6.ts && s6.ts.join(' ') === '0:4.2.24.8 3840:3.2.24.8 6720:4.2.24.8', JSON.stringify(s6));
ok('T1-06 MIDI Marken an den Taktstrichen der Taktkarte', s6.mk && s6.mk.includes(3840), JSON.stringify(s6.mk));
ok('T1-06 MIDI Szene 4/4 unverändert (FF 58 04 04 02 18 08)', s6.plainHas);
const s6b = await E(() => { const r = []; for (const ts of ['6/8', '7/8', '12/8', '5/4']) { const m = t1TsMeta(ts, 0); r.push(ts + '=' + m.b.slice(3).join('.')); } return r; });
ok('T1-06 FF 58 Werte (6/8 → 6.3.36.8, 7/8 → 7.3.12.8, 12/8 → 12.3.36.8, 5/4 → 5.2.24.8)', s6b.join(' ') === '6/8=6.3.36.8 7/8=7.3.12.8 12/8=12.3.36.8 5/4=5.2.24.8', s6b.join(' '));

// ---------- T1-07 GarageBand-Vorzähler und Video ----------
const s7 = await E(async () => {
  const Q = window.SYNQUENZER; Q.loadDemo(); await new Promise(r => setTimeout(r, 200));
  Q.songFromChain([{scene: 0, bars: 2}]); Q.setBpm(120); Q.setSongTs('6/8', {quiet: true});
  const r = await Q.ggbExport({pre: 1, remember: false}), w = Q.ggbWav(), bin = atob(w.b64), N = bin.length;
  const pcm = i => { const o = 44 + i * 4; let v = bin.charCodeAt(o) | (bin.charCodeAt(o + 1) << 8); if (v > 32767) v -= 65536; return v; };
  const sp = 60 / 120, SR = 48000, on = [], fq = [];
  for (let k = 0; k < 6; k++) { const i0 = Math.round(k * .5 * sp * SR); on.push(Math.abs(pcm(i0 + 5)) > 0); let z = 0; for (let j = 1; j < 480; j++) if ((pcm(i0 + j) >= 0) !== (pcm(i0 + j - 1) >= 0)) z++; fq.push(Math.round(z / 2 / .01)); }
  const v = await Q.vvRender({});
  return {preN: r.preN, want: Math.round(3 * sp * SR), on, fq, songSec: v.songSec, wantSec: 2 * 3 * sp};
});
ok('T1-07 GarageBand-Vorzähler 6/8: 1 Takt = 3 Schläge', s7.preN === s7.want, s7.preN + ' / ' + s7.want);
ok('T1-07 GarageBand-Klicks je Achtel, 1760 Hz auf 1, 1100 Hz sonst', s7.on.every(Boolean) && s7.fq[0] > 1600 && s7.fq.slice(1).every(f => f > 1000 && f < 1250), JSON.stringify(s7.fq));
ok('T1-07 Video: 2 Takte 6/8 = 6 Schläge', Math.abs(s7.songSec - s7.wantSec) < 1e-9, s7.songSec + ' s');

// ---------- Touch: Tempo-Fenster → Taktart ----------
await E(() => { const Q = window.SYNQUENZER; Q.loadDemo(); });
await sleep(300);
const bb = await p.locator('#bBpm').boundingBox().catch(() => null);
if (bb) { await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(300); }
const btns = await p.$$eval('.t1ts button', a => a.map(e => { const r = e.getBoundingClientRect(); return {t: e.textContent, w: r.width, h: r.height}; }));
const b34 = await p.locator('.t1ts button[data-ts="3/4"]').boundingBox().catch(() => null);
if (b34) { await p.touchscreen.tap(b34.x + b34.width / 2, b34.y + b34.height / 2); await sleep(200); }
const tsNow = await E(() => S.ts || null);
ok('T1-02 Tempo-Fenster: 7 Taktart-Knöpfe ≥ 44 px', btns.length === 7 && btns.every(x => x.w >= 44 && x.h >= 44), JSON.stringify(btns.map(x => x.t + ' ' + Math.round(x.w) + '×' + Math.round(x.h))));
ok('T1-02 Tipp auf 3/4 setzt die Song-Taktart', tsNow === '3/4', String(tsNow));
await p.screenshot({ path: process.argv[3] || '/tmp/claude-0/t1-tempo.png' });

ok('keine Seitenfehler', !errs.length, JSON.stringify(errs).slice(0, 400));
await b.close(); process.exit(fail ? 1 : 0);
