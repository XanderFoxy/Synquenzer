// SX11 tests: shared setup (open the app, a song with bass, pluck, pad, lead, busy drums and a melody; four marks)
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '../../../..');
export const APP = process.env.SX_APP || path.resolve(HERE, '../index.html');
export const OLD = path.resolve(ROOT, 'bau/snapshots/R-4300.html');
export const OUT = process.env.SX_OUT || path.resolve(HERE, 'out');
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
// 12 bars: Intro 1–2, Strophe 3–6, Refrain 7–10, Outro 11–12. Tracks: S1 Moog-Bass, S2 FM-Pluck (Akkorde), S3 Fläche, S4 Lead,
// DR (Kick, Snare, 16tel-Hi-Hat, offene Hi-Hat, Becken), MEL (Melodie-Clip). Every track plays scene 0 from bar 1 (S4 from bar 3)
export async function buildSong(p, o = {}) {
  return p.evaluate(o => {
    const A = SYNQUENZER; A.setMetronome && A.setMetronome(false);
    const nt = NT(), pk = S.key;
    const N = (t, d, n, v = .8, x) => Object.assign({t, d, n, v}, x || null);
    const bass = [], pl = [], pad = [], ld = [], dr = [], mel = [];
    for (let b = 0; b < 4; b++) { bass.push(N(b, .5, 36), N(b + .5, .5, 48)); }
    for (const b of [0, 1.5, 2, 3.5]) for (const n of [60, 64, 67]) pl.push(N(b, .4, n, .7));
    for (const n of [60, 64, 67, 71]) pad.push(N(0, 4, n, .6));
    for (const [t, n] of [[0, 72], [.75, 74], [1.5, 76], [2.25, 79], [3, 77]]) ld.push(N(t, .5, n, .7));
    for (let k = 0; k < 16; k++) dr.push(N(k * .25, .1, 42, k % 2 ? .5 : .8, k === 6 ? {r: 2} : null));
    dr.push(N(0, .1, 36, 1), N(2, .1, 36, 1), N(1, .1, 38, .9), N(3, .1, 38, .9), N(1.5, .1, 46, .7), N(3.5, .1, 46, .7), N(0, .1, 49, .8));
    for (const [t, n] of [[0, 72], [1, 76], [2, 79], [3, 76]]) mel.push(N(t, .9, n, .8));
    const cl = [bass, pl, pad, ld, dr, mel];
    if (o.cats) { S.tracks[0].sound = factorySound('f-moog-bass'); S.tracks[1].sound = factorySound('f-fm-pluck'); S.tracks[2].sound = factorySound('f-rom-flaeche'); S.tracks[3].sound = factorySound('f-mini-lead'); }
    for (let t = 0; t < 6; t++) { S.tracks[t].clips = emptyClips(); S.tracks[t].clips[0] = normClip({len: 1, notes: cl[t]}, t === DRUM_T ? 'drum' : 'synth', pk); }
    const lanes = Array.from({length: nt}, () => []);
    for (let t = 0; t < 6; t++) lanes[t] = t === 3 ? [{bar: 0, slot: -1}, {bar: 2, slot: 0}] : [{bar: 0, slot: 0}];
    A.setSong({bars: 12, lanes, carrier: [], mel: {}, xp: [],
      marks: [{id: 'M1', a: 0, len: 2, name: 'Intro'}, {id: 'M2', a: 2, len: 4, name: 'Strophe'}, {id: 'M3', a: 6, len: 4, name: 'Refrain'}, {id: 'M4', a: 10, len: 2, name: 'Outro'}]});
    restoreSong(JSON.parse(songSnapshot())); songTidy(S.song); songChanged(); UNDO.length = 0; REDO.length = 0;
    return {bars: S.song.bars, marks: S.song.marks.map(m => [m.id, m.a, m.len]), cats: S.tracks.map(t => t.sound && t.sound.cat)};
  }, o);
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
