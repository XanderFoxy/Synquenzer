// QA V2e′ helpers (independent): launch, CDP touch, song 5.5 setup
import { chromium } from 'playwright';
export const APP = process.env.APP || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2e2-app.html';
export const VPS = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [1280, 800]};
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export async function openVp(vp = 'P1') {
  const [w, h] = VPS[vp];
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PE ' + String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + APP); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime, null, {timeout: 20000});
  await p.waitForTimeout(800);
  const cdp = await ctx.newCDPSession(p);
  return {b, p, errs, cdp};
}
export function T(p, cdp) {
  const E = (f, a) => p.evaluate(f, a);
  const send = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts});
  const down = (x, y, id = 1) => send('touchStart', [{x, y, id}]);
  const move = (x, y, id = 1) => send('touchMove', [{x, y, id}]);
  const up = () => send('touchEnd', []);
  const cancel = () => send('touchCancel', []);
  const glide = async (x0, y0, x1, y1, n = 6, ms = 16) => { for (let k = 1; k <= n; k++) { await move(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n); await sleep(ms); } };
  const tap = async (x, y, w = 220) => { await down(x, y); await sleep(40); await up(); await sleep(w); };
  const rect = q => E(q => { const e = document.querySelector(q); if (!e || !e.offsetWidth) return null; const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height, cx: r.x + r.width / 2, cy: r.y + r.height / 2}; }, q);
  const info = () => E(() => window.SYNQUENZER.svLayoutInfo());
  const key = (j = 0) => E(j => { const k = document.querySelectorAll('#partBar .pk')[j]; if (!k || !k.offsetWidth) return null; const r = k.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, txt: k.textContent}; }, j);
  const songOn = () => E(() => document.getElementById('gridArea').classList.contains('song'));
  const pop = () => E(() => { const p = document.querySelector('#popLayer .pop'); return p ? p.className : null; });
  const popBtns = () => E(() => [...document.querySelectorAll('#popLayer .pop button')].filter(b => b.offsetWidth).map(b => b.dataset.a || b.textContent.trim().slice(0, 30)));
  const popBtn = txt => E(t => { const p = document.querySelector('#popLayer .pop'); if (!p) return null; const b = [...p.querySelectorAll('button')].find(x => x.offsetWidth && x.textContent.includes(t)); if (!b) return null; const r = b.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; }, txt);
  const tapPop = async (txt, w) => { const b = await popBtn(txt); if (!b) throw new Error('no pop btn ' + txt); await tap(b.x, b.y, w); };
  const full = () => E(() => { const pr = window.SYNQUENZER.project(); return JSON.stringify(pr.project || pr); });
  const data = () => E(() => { const pr = window.SYNQUENZER.project(); const P = pr.project || pr; return JSON.stringify({song: P.song, parts: P.parts, tracks: P.tracks}); });
  const clips = () => E(() => { const pr = window.SYNQUENZER.project(); const P = pr.project || pr; return JSON.stringify(P.tracks.map(t => t.clips)); });
  const undo = () => E(() => window.SYNQUENZER.undoInfo());
  const drag = () => E(() => window.SYNQUENZER.svLayoutInfo().drag);
  return {E, send, down, move, up, cancel, glide, tap, rect, info, key, songOn, pop, popBtns, popBtn, tapPop, full, data, clips, undo, drag};
}
export const SETUP55 = (ins) => `(() => {
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
  Q.setBpm(240); Q.clearLog && Q.clearLog(); return 1;
})()`;
// haptic recorder + open-time recorder
export const PREP = () => {
  const W = window; W.__hap = []; W.__open = null; W.__down = null;
  // force non-iOS haptic path and record
  try { Object.defineProperty(navigator, 'vibrate', {configurable: true, value: x => { W.__hap.push([Math.round(performance.now()), x]); return true; }}); } catch (e) {}
  const ga = document.getElementById('gridArea');
  W.__mo = new MutationObserver(() => { const on = ga.classList.contains('song'); W.__trans = W.__trans || []; W.__trans.push([Math.round(performance.now()), on]); if (on && W.__open == null) W.__open = performance.now(); });
  W.__mo.observe(ga, {attributes: true, attributeFilter: ['class']});
  document.addEventListener('pointerdown', e => { if (W.__down == null) W.__down = performance.now(); }, true);
  return 1;
};
export const RESET = () => { window.__open = null; window.__down = null; window.__hap = []; window.__trans = []; return 1; };
export function mkCheck() {
  const res = []; const check = (id, ok, info) => { res.push({id, ok: !!ok}); console.log((ok ? 'PASS ' : 'FAIL ') + id + (info !== undefined ? ' ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); };
  return {res, check, done: () => { const f = res.filter(r => !r.ok); console.log(`\n${res.length - f.length}/${res.length} passed` + (f.length ? ' FAILED: ' + f.map(r => r.id).join(' | ') : '')); return f.length; }};
}
