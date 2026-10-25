// QA V2d′ helpers (independent from the builder's): launcher with touch, CDP touch with exact timing, song-ruler taps
import { chromium } from 'playwright';
export const APP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-wt/index.html';
export async function openT(vp = {width: 390, height: 844}, touch = true) {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({viewport: vp, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1});
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + APP); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime, null, {timeout: 20000});
  await p.waitForTimeout(800);
  const cdp = await ctx.newCDPSession(p);
  return {b, p, errs, cdp};
}
export const down = (cdp, x, y) => cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id: 1}]});
export const up = cdp => cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
export async function tapXY(p, cdp, x, y, ms = 60) { await down(cdp, x, y); await p.waitForTimeout(ms); await up(cdp); await p.waitForTimeout(120); }
export async function center(p, sel) {
  return p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); if (!r.width) return null; return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }, sel);
}
export async function tapSel(p, cdp, sel, ms = 60) { const c = await center(p, sel); if (!c) throw new Error('no element ' + sel); await tapXY(p, cdp, c.x, c.y, ms); }
// page coordinates of the middle of ruler number `bar` (0-based) in the song view
export async function rulerXY(p, bar) {
  return p.evaluate(bar => { const r = SV.cv.getBoundingClientRect(); return {x: r.left + (bar + .5) * SV.cellW - SV.x, y: r.top + SV.rulerH / 2}; }, bar);
}
export async function waitSong(p, x, timeout = 40000) {
  await p.waitForFunction(v => { const s = window.SYNQUENZER.runtime().song; return s.beat != null && s.beat >= v; }, x, {timeout, polling: 4});
}
export async function note(p, n, ms = 150) {
  await p.evaluate(x => window.SYNQUENZER.keyOn(x, .8, 'qn' + x), n);
  await p.waitForTimeout(ms);
  await p.evaluate(x => window.SYNQUENZER.keyOff(x, 'qn' + x), n);
}
export const projSong = p => p.evaluate(() => JSON.stringify(window.SYNQUENZER.song()));
export const clipsJSON = p => p.evaluate(() => { const P = window.SYNQUENZER.project(); return JSON.stringify((P.project || P).tracks.map(t => t.clips)); });
export function mk() {
  const res = []; const check = (id, ok, info) => { res.push({id, ok: !!ok}); console.log((ok ? 'PASS ' : 'FAIL ') + id + (info !== undefined ? ' ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); };
  return {check, done: () => { const f = res.filter(r => !r.ok); console.log(`\n${res.length - f.length}/${res.length} passed` + (f.length ? ' FAILED: ' + f.map(r => r.id).join(' | ') : '')); return f.length; }};
}
// the song of song-delta 5.5 plus a Fläche note in every bar (Sz2 4-bar clip) and an extra Sz4 Fläche clip; ins: after placePart insert at T3
export const SETUP = ins => `(() => {
  const Q = window.SYNQUENZER;
  Q.newProject({init: true});
  const N = (t, n, d) => ({t, d: d || .5, n, v: .8});
  const K = {root: 9, scale: 'aeolian'};
  Q.setClip(0, 0, {len: 1, key: K, notes: [N(0, 45), N(2, 45)]});
  Q.setClip(0, 2, {len: 2, key: K, notes: [N(0, 41), N(4, 43), N(6, 43)]});
  Q.setClip(1, 1, {len: 4, key: K, notes: [N(0, 60, 1), N(4, 62, 1), N(8, 64, 1), N(12, 65, 1)]});
  Q.setClip(1, 3, {len: 1, key: K, notes: [N(0, 67), N(2, 67)]});
  Q.setClip(2, 2, {len: 1, key: K, notes: [N(0, 72, .25), N(1, 74, .25)]});
  Q.setClip(3, 3, {len: 1, key: K, notes: [N(0, 64)]});
  Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 2, d: .1, n: 36, v: .9}]});
  Q.setClip(4, 1, {len: 1, key: K, notes: [{t: 0, d: .1, n: 38, v: .9}, {t: 1, d: .1, n: 42, v: .9}]});
  const C = n => Q.parseChord(n);
  Q.setSong({bars: 7, lanes: [[{bar: 3, slot: 2}], [{bar: 3, slot: 1}], [{bar: 3, slot: 2}], [{bar: 0, slot: 3}, {bar: 2, slot: -1}], [{bar: 2, slot: 1}, {bar: 3, slot: 1, re: 1}], []],
    carrier: [{beat: 0, target: C('Am')}, {beat: 8, target: C('G')}, {beat: 12, target: C('F')}, {beat: 16, target: C('G')}, {beat: 20, target: C('Am')}],
    mel: {5: {notes: [{t: 2, d: 1, n: 76, v: .8}, {t: 7.8, d: .5, n: 77, v: .8}, {t: 10, d: 1, n: 79, v: .8}, {t: 24, d: 1, n: 81, v: .8}]}}, melodyTrack: 5,
    marks: [{id: 'M1', a: 0, len: 2, part: 'S4', name: 'Intro'}, {id: 'M2', a: 3, len: 4, part: 'P2'}]});
  Q.setPart(1, {name: 'Refrain', slots: [{s: 2}, {s: 1}, {s: 2}, -1, {s: 1}, -1], chords: {len: 4, ch: [{b: 0, tg: C('F')}, {b: 4, tg: C('G')}, {b: 8, tg: C('Am')}]}});
  Q.setPart(0, {name: 'Strophe', lanes: [[{bar: 0, slot: 0}], [{bar: 0, slot: 1}], [{bar: 0, slot: -1}], [{bar: 0, slot: -1}], [{bar: 0, slot: 0}], [{bar: 0, slot: -1}]],
    chords: {len: 4, ch: [{b: 0, tg: C('Am')}, {b: 4, tg: C('F')}, {b: 8, tg: C('C')}, {b: 12, tg: C('G')}]}, src: 'fang', len: 4});
  ${ins ? "Q.placePart(0, 2, 'insert');" : ''}
  Q.setBpm(240); Q.clearLog(); return 1;
})()`;
// fresh playback of the song from bar 0 up to song beat upTo; returns noteLog of track (or all)
export async function playLog(p, upTo, track) {
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setBpm(240); Q.clearLog(); Q.songPlay(0); });
  await waitSong(p, upTo);
  const log = await p.evaluate(t => window.SYNQUENZER.noteLog(2000).filter(n => t == null || n.track === t), track);
  await p.evaluate(() => window.SYNQUENZER.songPlay(false));
  await p.waitForTimeout(200);
  return log;
}
