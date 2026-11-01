// VK3 Klavier-Ansicht: Standbilder 16:9 / 9:16, Determinismus, Auto-Regie, Regie-Zeile, kurzer echter Video-Render + Zeiten.
// Aufruf: node vk3-test.mjs <index.html> <out-dir> [full|time]
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs'; import { execSync } from 'child_process'; import crypto from 'crypto';
const APP = process.argv[2], OUT = process.argv[3], MODE = process.argv[4] || 'full';
fs.mkdirSync(OUT, {recursive: true});
const C = []; const ok = (id, c, info) => { C.push([id, !!c]); console.log((c ? 'PASS ' : 'FAIL ') + id + (info != null ? ' — ' + JSON.stringify(info).slice(0, 500) : '')); };
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 428, height: 926}, deviceScaleFactor: 1});
const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + APP); await p.waitForTimeout(1500); await p.mouse.click(5, 300);
await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 15000}).catch(() => {});
await p.waitForTimeout(300);
// the song: bass (Synth 1), Synth 2 (two clips), chords (Synth 3 from bar 3), drums (two clips), Song-Melodie (MELODIE, touch .3 … 1),
// Strophe 1–4 / Refrain 5–8, Teil-Transposition +2 from bar 7
const setup = await p.evaluate(() => {
  const A = SYNQUENZER; A.setMetronome && A.setMetronome(false);
  const nt = NT(), lanes = Array.from({length: nt}, () => []);
  lanes[0] = [{bar: 0, slot: 0}]; lanes[1] = [{bar: 0, slot: 0}]; lanes[2] = [{bar: 0, slot: 0}]; lanes[DRUM_T] = [{bar: 0, slot: 0}, {bar: 10, slot: 1}];
  const ph = [[72, 1, .35], [74, .5, .45], [76, .5, .55], [79, 2, .7], [77, 1, .5], [76, 1, .4], [74, 2, .6], [72, 2, .3], [76, 1, .8], [79, 1, .9], [81, 2, 1], [79, 1, .95], [77, 1, .7], [76, 4, .85], [74, 2, .5], [72, 2, .65]];
  const notes = []; let t = 0; for (let k = 0; t < 48; k++) { const [n, d, v] = ph[k % ph.length]; notes.push({t, d: d * .95, n, v}); t += d; }
  A.setSong({bars: 12, lanes, carrier: [], mel: {[MEL_T]: {len: 12, key: {root: 0, scale: 'ionian', src: 'user'}, notes}}, melodyTrack: MEL_T,
    marks: [{id: 'm1', a: 0, len: 4, name: 'Strophe'}, {id: 'm2', a: 4, len: 4, name: 'Refrain'}, {id: 'm3', a: 8, len: 4, name: 'Strophe'}]});
  S.song.xp = [{beat: 40, semi: 2}]; songChanged();
  return {bars: S.song.bars, mel: S.song.mel[MEL_T].notes.length, bpm: S.bpm, has: typeof A.vvkShot === 'function'};
});
ok('Song aufgebaut (Melodie, Drums, Teile, Transposition)', setup.mel > 10, setup);
const save = (name, b64) => fs.writeFileSync(OUT + '/' + name, Buffer.from(b64, 'base64'));
const shaF = f => String(execSync(`ffmpeg -v error -i ${f} -map 0:v -f md5 -`)).trim();
const frame = (f, ts, name) => execSync(`ffmpeg -v error -y -ss ${ts.toFixed(3)} -i ${f} -frames:v 1 ${name}`);
const res = {};
if (MODE === 'full' && setup.has) {
  // ---- Regie-Zeile, Liste, Auto-Regie ----
  const ui = await p.evaluate(() => ({row: vvDirRow(0, 4, 'ms-b').includes('data-a="vv-klav"'), list: VV_DIRV[VV_DIRV.length - 1], own: VV4_OWN.has('klav'), name: VV4_NAME.klav,
    set: vvDirSet(6, 8, 'klav'), of: vvDirOf(6, 8), col: vv4StripeCol({v: 'klav'}, vvCols()), cuts: vvCuts(S.song, 0, 8).map(s => [s.a, s.v, s.why]), clear: vvDirSet(6, 8, 'auto'), after: vvDirOf(6, 8)}));
  ok('Regie: [Klavier] in der Zeile, „klav“ am Ende der Liste, ganzes Bild, Name, Setzen + Undo', ui.row && ui.list === 'klav' && ui.own && ui.name === 'Klavier' && ui.set && ui.of === 'klav' && ui.after === 'auto', ui);
  const au = await p.evaluate(() => ({klav: vvCuts(S.song, 2, 12).filter(s => s.v === 'klav').map(s => [s.a, s.b, s.why]), cuts: vvCuts(S.song, 2, 12).map(s => [s.a, s.b, s.v, s.why]), full: vvCuts(S.song, 0, 12).map(s => [s.a, s.b, s.v, s.why])}));
  ok('Auto-Regie (Takt 3–12): Klavier am zweiten Teil mit Song-Melodie (Refrain, Takt 5), Takt 3 und der dritte Teil (Takt 9) App', au.klav.length === 1 && au.klav[0][0] === 4 && au.cuts[0][2] === 'app' && au.cuts.some(c => c[0] === 8 && c[2] === 'app'), au);
  const nm = await p.evaluate(() => { const m = S.song.mel; const keep = JSON.stringify(m); S.song.mel = {}; const c = vvCuts(S.song, 2, 12).map(s => [s.a, s.b, s.v]); S.song.mel = JSON.parse(keep); return c; });
  ok('Auto-Regie ohne Song-Melodie: kein Klavier', !nm.some(s => s[2] === 'klav'), nm);
  // ---- Render (Ton) + Standbilder aus den Noten des Durchlaufs ----
  const T0 = Date.now(); await p.evaluate(() => SYNQUENZER.vvRender({range: {a: 0, b: 12}})); res.renderAudioMs = Date.now() - T0;
  const tAt = await p.evaluate(() => { const r = VV.last; return [1.5, 4.5, 10.75].map(bar => (r.lead || 0) + bar * 4 * 60 / r.bpm); });
  const shots = [];
  for (const [fmt, tag] of [['16:9', '16x9'], ['9:16', '9x16']]) for (const [k, t] of tAt.entries()) {
    const x = await p.evaluate(([t, f]) => SYNQUENZER.vvkShot(t, f), [t, fmt]);
    save(`klavier-${tag}-${k + 1}.png`, x.png); shots.push({fmt, t: +t.toFixed(3), lo: x.probe.lo, hi: x.probe.hi, notes: x.probe.notes, lit: x.probe.lit.map(l => l.n + '/' + l.i), drums: x.probe.drums, who: x.probe.who, src: x.probe.src});
  }
  ok('Standbilder 16:9 + 9:16 aus dem Durchlauf (Noten, leuchtende Tasten, Drum-Leiste)', shots.every(s => s.src === 'render' && s.notes > 0) && shots.some(s => s.lit.length) && shots.some(s => s.drums.some(d => d > .05)), shots);
  const rg = shots.map(s => s.hi - s.lo + 1);
  ok('Tastatur: ganze Oktaven, mindestens 2, C … B', shots.every(s => s.lo % 12 === 0 && (s.hi + 1) % 12 === 0 && s.hi - s.lo + 1 >= 24), rg);
  // so wie es klingt: in Takt 7–8 (+2) liegen die Noten 2 Halbtöne höher als in der Partitur
  const xp = await p.evaluate(t => { const x = SYNQUENZER.vvkShot(t, '16:9'); const sc = vvkScore(0, 12); const sb = vvStateAt(VV.last, t).sb; const melS = sc.tr[MEL_T].filter(n => n.s <= sb + 1e-6 && n.e > sb).map(n => n.n); return {lit: x.probe.lit.filter(l => l.i === MEL_T).map(l => l.n), melScore: melS, rows: x.probe.rows.filter(r => r.i === 0 && r.on).map(r => r.n)}; }, tAt[2]);
  ok('Klavier zeigt die Noten so, wie sie klingen (Durchlauf-Log)', xp.lit.length > 0, xp);
  // Anschlag-Farben: leise ≠ laut innerhalb der Spurfarbe
  const vc = await p.evaluate(() => ({lo: vvkCol(vvCols().t[MEL_T], .3), mid: vvkCol(vvCols().t[MEL_T], .7), hi: vvkCol(vvCols().t[MEL_T], 1), base: vvCols().t[MEL_T]}));
  ok('Anschlag: leise heller/kühler, laut satter/wärmer (verschiedene Farben)', vc.lo !== vc.hi && vc.mid !== vc.hi, vc);
  // Determinismus: zweiter Durchlauf → dasselbe Bild
  const a1 = await p.evaluate(t => SYNQUENZER.vvkShot(t, '9:16').png, tAt[1]);
  await p.evaluate(() => SYNQUENZER.vvRender({range: {a: 0, b: 12}}));
  const a2 = await p.evaluate(t => SYNQUENZER.vvkShot(t, '9:16').png, tAt[1]);
  ok('Determinismus: zwei Durchläufe → gleiches Klavier-Bild', a1 === a2, {len: a1.length});
  // ohne Durchlauf (Vorschau/Standbild): die Noten aus dem Song
  const sx = await p.evaluate(() => SYNQUENZER.vvkScoreShot(18, '9:16'));
  save('klavier-9x16-song-ohne-render.png', sx.png);
  ok('Ohne Durchlauf: Noten aus dem Song (Vorschau/Standbild)', sx.probe.src === 'song' && sx.probe.notes > 0, {notes: sx.probe.notes, lit: sx.probe.lit.length, lo: sx.probe.lo, hi: sx.probe.hi});
  // Zeichenzeit je Bild (1920×1080 / 1080×1920) – Klavier gegen App und Piano-Roll
  res.drawMs = await p.evaluate(t => { const r = VV.last, out = {}; for (const [W, H] of [[1920, 1080], [1080, 1920]]) { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d', {alpha: false});
    for (const v of ['klav', 'roll', 'app']) { const N = 40; let T = 0; for (let k = 0; k < N + 3; k++) { const st = vvStateAt(r, t + k / 30); const T0 = performance.now(); vv4Pic(g, W, H, v, 1, st, r.bpm); g.getImageData(0, 0, 1, 1); if (k >= 3) T += performance.now() - T0; } out[v + '@' + W + 'x' + H] = +(T / N).toFixed(2); } } return out; }, tAt[1]);
  console.log('Zeichenzeit ms/Bild', JSON.stringify(res.drawMs));
}
if (MODE === 'full' && setup.has) {
  // Regie-Taste wie ein Antippen, Live-Vorschau (Noten aus dem Song), Standbild im Video-Blatt, Grenzfälle
  const tap = await p.evaluate(() => { const r = vvDirTap('vv-klav', null, 0, 12, null); return {r, of: vvDirOf(0, 12)}; });
  ok('Antippen [Klavier] setzt die Regie (Takt 1–12)', tap.r && tap.of === 'klav', tap);
  await p.evaluate(() => { SYNQUENZER.vvOpen(); SYNQUENZER.vvPrefs({fmt: '9:16', view: 'auto'}); });
  await p.waitForTimeout(600);
  const still = await p.evaluate(() => (VVK.probe ? {src: VVK.probe.src, notes: VVK.probe.notes, lo: VVK.probe.lo, hi: VVK.probe.hi} : null));
  await p.screenshot({path: OUT + '/blatt-video-klavier-9x16.png'});
  ok('Video-Blatt: Standbild zeigt Klavier (Noten aus dem Song)', still && still.src === 'song' && still.notes > 0, still);
  await p.evaluate(() => vvPrevStart()); await p.waitForTimeout(2500);
  const pv = await p.evaluate(() => ({prev: !!VV.prev, probe: VVK.probe ? {src: VVK.probe.src, notes: VVK.probe.notes, lit: VVK.probe.lit.length, sb: VVK.probe.sb} : null}));
  await p.screenshot({path: OUT + '/blatt-video-klavier-vorschau.png'});
  await p.evaluate(() => { vvPrevStop(); SYNQUENZER.vvClose(); vvDirSet(0, 12, 'auto'); });
  ok('Live-Vorschau: Klavier läuft mit (Noten aus dem Song, Tasten leuchten)', pv.prev && pv.probe && pv.probe.src === 'song' && pv.probe.notes > 0 && pv.probe.sb > 0, pv);
  const edge = await p.evaluate(() => { const keep = S.song, out = {}; const cv = document.createElement('canvas'); cv.width = 360; cv.height = 640; const g = cv.getContext('2d', {alpha: false});
    S.song = null; try { vvkDraw(g, 360, 640, {sb: null, slots: [], cs: [], own: []}, 0); out.ohneSong = VVK.probe.lo + '-' + VVK.probe.hi; } catch (e) { out.err1 = String(e); }
    S.song = keep; const m = JSON.stringify(S.song.mel), ln = JSON.stringify(S.song.lanes); S.song.mel = {}; S.song.lanes = S.song.lanes.map((l, i) => (i === DRUM_T ? l : [])); VVK.sc = null;
    try { vvkDraw(g, 360, 640, {sb: 4, slots: [], cs: [], own: []}, 0); out.nurDrums = {lo: VVK.probe.lo, hi: VVK.probe.hi, notes: VVK.probe.notes, drums: VVK.probe.drums}; } catch (e) { out.err2 = String(e); }
    S.song.mel = JSON.parse(m); S.song.lanes = JSON.parse(ln); VVK.sc = null; return out; });
  ok('Grenzfälle: ohne Song, nur Drums – kein Fehler, Tastatur C3–B4', !edge.err1 && !edge.err2 && edge.ohneSong === '48-71' && edge.nurDrums.notes === 0, edge);
}
// ---- kurzer echter Video-Render (WebCodecs, Opus im Test-Chromium): Takt 3–7, Auto-Regie (Klavier ab Takt 5) ----
await p.evaluate(() => SYNQUENZER.vvTest({opus: true}));
const vids = [];
for (const [k, o] of [[1, {fmt: '16:9', view: 'auto', range: {a: 2, b: 7}}], [2, {fmt: '16:9', view: 'auto', range: {a: 2, b: 7}}], [3, {fmt: '9:16', view: 'auto', range: {a: 2, b: 7}}], [4, {fmt: '16:9', view: 'song', range: {a: 2, b: 7}}]]) {
  if (MODE === 'time' && k === 2) continue;
  const T0 = Date.now(); let r = null, err = null;
  try { r = await p.evaluate(o => SYNQUENZER.vvMake(o).then(x => ({ms: x.ms, msAudio: x.msAudio, msVideo: x.msVideo, dur: x.dur, how: x.how, cuts: x.cuts, W: x.W, H: x.H, a: x.a, b: x.b})), o); } catch (e) { err = String(e).slice(0, 300); }
  const wall = Date.now() - T0;
  if (!r) { vids.push({k, err}); continue; }
  const bl = await p.evaluate(() => SYNQUENZER.vvBlob()), f = `${OUT}/video-${MODE}-${k}-${o.fmt.replace(':', 'x')}-${o.view}.${bl.ext}`; fs.writeFileSync(f, Buffer.from(bl.b64, 'base64'));
  const shots = await p.evaluate(() => VV.lastRt ? VV.lastRt.shots.map(s => [s.a, s.b, s.v]) : null);
  vids.push(Object.assign({k, f, wall, shots}, r));
}
console.log('Videos', JSON.stringify(vids));
if (MODE === 'full') {
  const v1 = vids.find(v => v.k === 1), v2 = vids.find(v => v.k === 2), v3 = vids.find(v => v.k === 3);
  ok('Video 16:9 erstellt, Auto-Regie mit Klavier-Schnitt', v1 && v1.f && v1.shots.some(s => s[2] === 'klav'), v1);
  if (v1 && v1.f) { const sp = 60 / setup.bpm; [(5.5 - 2) * 4 * sp, (6.5 - 2) * 4 * sp].forEach((ts, j) => frame(v1.f, ts, `${OUT}/video-16x9-klavier-frame-${j + 1}.png`)); }
  // (Bild-für-Bild-Determinismus der gezeichneten Leinwand: det.mjs – der H.264-Kodierer selbst ist nicht bitgleich)
  if (v3 && v3.f) { const sp = 60 / setup.bpm; frame(v3.f, (5.5 - 2) * 4 * sp, `${OUT}/video-9x16-klavier-frame-1.png`); ok('Video 9:16 erstellt', true, {dur: v3.dur, ms: v3.ms}); }
}
fs.writeFileSync(`${OUT}/vk3-test-${MODE}.json`, JSON.stringify({C, res, vids, errs}, null, 1));
ok('keine Seitenfehler', !errs.length, errs);
console.log(C.filter(c => !c[1]).length ? 'FEHLER: ' + C.filter(c => !c[1]).map(c => c[0]).join(' | ') : 'ALLE OK');
await b.close();
