// KON tests: shared setup (open the app, a real song with marks, chords, melody, transposition and an own clip)
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '../../../..');
export const APP = process.env.KON_APP || path.resolve(HERE, '../index.html');
export const OLD = path.resolve(ROOT, 'bau/snapshots/R-4261.html');
export const OUT = process.env.KON_OUT || path.resolve(HERE, 'out');
const FD = 'file://' + path.resolve(ROOT, 'fonts') + '/';
export async function open(o = {}) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await b.newContext({viewport: {width: o.w || 428, height: o.h || 926}, deviceScaleFactor: o.dpr || 1, hasTouch: o.touch !== false, isMobile: o.touch !== false});
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + (o.app || APP)); await p.waitForTimeout(1200);
  const ff = [['Barlow Semi Condensed', 'barlow-semi-condensed', [500, 600, 700]], ['JetBrains Mono', 'jetbrains-mono', [500, 700]]];
  await p.addStyleTag({content: ff.map(([fam, file, ws]) => ws.map(wt => `@font-face{font-family:"${fam}";font-style:normal;font-weight:${wt};src:url(${FD}${file}-latin-${wt}-normal.woff2) format("woff2")}`).join('')).join('')});
  await p.evaluate(async () => { await document.fonts.ready; });
  if (o.touch !== false) await p.touchscreen.tap(5, 300); else await p.mouse.click(5, 300);
  await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 15000}).catch(() => {});
  await p.waitForTimeout(300);
  await p.evaluate(() => { try { if (R.editor) closeEditor(); } catch (e) {} });
  await p.waitForTimeout(200);
  return {b, ctx, p, errs};
}
// 12 bars: Intro 1–2, Strophe 3–6, Refrain 7–10, Outro 11–12; chords, a melody, +2 HT from bar 7, an own clip in bar 4 (one note more)
export async function buildSong(p) {
  return p.evaluate(() => {
    const A = SYNQUENZER; A.setMetronome && A.setMetronome(false);
    const nt = NT(), lanes = Array.from({length: nt}, () => []);
    lanes[0] = [{bar: 0, slot: 0}];
    lanes[1] = [{bar: 2, slot: 0}, {bar: 6, slot: 1}];
    lanes[2] = [{bar: 6, slot: 0}, {bar: 10, slot: 1}];
    lanes[4] = [{bar: 0, slot: 1}, {bar: 2, slot: 0}];
    const mel = {5: {notes: [[24, 72], [26, 74], [28, 76], [30, 74], [32, 72], [34, 71], [36, 69], [40, 72], [42, 76], [44, 79], [46, 77]].map(([t, n]) => ({t, d: 1.5, n, v: .8}))}};
    A.setSong({bars: 12, lanes, carrier: [], mel, melodyTrack: 5, xp: [{beat: 24, semi: 2}, {beat: 40, semi: 0}],
      marks: [{id: 'M1', a: 0, len: 2, name: 'Intro'}, {id: 'M2', a: 2, len: 4, name: 'Strophe'}, {id: 'M3', a: 6, len: 4, name: 'Refrain'}, {id: 'M4', a: 10, len: 2, name: 'Outro'}]});
    A.songSetChord(6, 'Am'); A.songSetChord(10, 'F');
    // an own clip in bar 4 (track 0): one note more there (a Bearbeitung im Song)
    A.makeOwn(0, 3, false); const o = ownRun(S.song, 0, 3), id = o && o.o.own;
    if (id) { const c = S.song.own[id]; c.notes.push({t: 0.5, d: 0.25, n: 79, v: .9}); c.notes.sort((x, y) => x.t - y.t); }
    restoreSong(JSON.parse(songSnapshot())); songTidy(S.song); songChanged(); UNDO.length = 0; REDO.length = 0;
    return {bars: S.song.bars, own: id || null, marks: S.song.marks.map(m => [m.id, m.a, m.len])};
  });
}
// one pass of the song (or [a, b)) at the current tempo: the note log
export async function playLog(p, a = 0, b = null) {
  return p.evaluate(async ({a, b}) => {
    clearLog(); SYNQUENZER.songSelect(null);
    const e = b == null ? S.song.bars : b;
    songPlayStart(a);
    await new Promise(res => { const iv = setInterval(() => { if (R.songPlay && songBeatOf(audBeat()) >= e * 4 - .02) songPlayEnd(true); if (!R.playing) { clearInterval(iv); res(); } }, 10); });
    await new Promise(r => setTimeout(r, 300));
    return noteLog(4096);
  }, {a, b});
}
export const notesOf = (log, off = 0) => log.filter(e => e.src !== 'click').map(e => [e.track, e.src === 'own' ? 'clip' : e.src, e.out, +(+e.beat - off).toFixed(3), +(+e.vel).toFixed(3)]).sort((x, y) => x[3] - y[3] || x[0] - y[0] || x[2] - y[2]);
export function diffNotes(a, b) { const ka = new Map(), kb = new Map(); for (const x of a) { const k = JSON.stringify(x); ka.set(k, (ka.get(k) || 0) + 1); } for (const x of b) { const k = JSON.stringify(x); kb.set(k, (kb.get(k) || 0) + 1); }
  const onlyA = [], onlyB = []; for (const [k, n] of ka) { const m = kb.get(k) || 0; for (let j = m; j < n; j++) onlyA.push(k); } for (const [k, n] of kb) { const m = ka.get(k) || 0; for (let j = m; j < n; j++) onlyB.push(k); } return {onlyA, onlyB}; }
// deep equal without key order; the first differences
export function diff(a, b, pth = '') {
  if (JSON.stringify(a) === JSON.stringify(b)) return [];
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b || Array.isArray(a) !== Array.isArray(b)) return [pth + ': ' + String(JSON.stringify(a)).slice(0, 120) + ' → ' + String(JSON.stringify(b)).slice(0, 120)];
  const o = []; for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) o.push(...diff(a[k], b[k], pth + '.' + k)); return o;
}
let N = 0, F = 0; const FAILS = [];
export function ok(cond, name, info) { N++; if (!cond) { F++; FAILS.push(name + (info !== undefined ? ' · ' + (typeof info === 'string' ? info : JSON.stringify(info)).slice(0, 400) : '')); console.log('  ✗', name, info !== undefined ? (typeof info === 'string' ? info : JSON.stringify(info)).slice(0, 400) : ''); } else console.log('  ✓', name); }
export function summary(tag) { console.log(`${tag}: ${N - F}/${N} grün` + (F ? ' · FEHLER: ' + FAILS.join(' | ') : '')); return F; }
// the content of [a, e) as heard (own clips by their notes, the chord / transposition rows without repeats)
export const canonCut = (p, a, e) => p.evaluate(({a, e}) => {
  const c = songCut(S.song, a, e); delete c.marks; delete c.video;
  for (const l of c.lanes) for (const x of l) if (x.own) x.own = c.own[x.own].len + ':' + JSON.stringify(c.own[x.own].notes);
  delete c.own;
  const dd = (l, k) => { const o = []; let pv = k === 'target' ? 'null' : '0'; for (const x of l) { const v = JSON.stringify(x[k]); if (v === pv) continue; pv = v; o.push(x); } return o; };
  c.carrier = dd(c.carrier, 'target'); c.xp = dd(c.xp, 'semi');
  return c;
}, {a, e});
export const state = p => p.evaluate(() => JSON.parse(JSON.stringify({song: S.song, parts: S.parts})));
