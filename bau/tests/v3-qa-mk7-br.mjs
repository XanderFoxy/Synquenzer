// QA MK7 in Chromium (FP-SICHER client side, FP-IPHONE, touch at 390x844 and 844x390). Usage: node v3-qa-mk7-br.mjs [index.html]
import { chromium } from 'playwright';
import path from 'path';
import { INIT, EXE } from './v3-mk7-vsh.mjs';
const FILE = path.resolve(process.argv[2] || new URL('../mk-br-MK7/index.html', import.meta.url).pathname), ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
let fails = 0, n = 0; const ok = (id, c, info) => { n++; if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const T = async (id, f) => { if (ONLY && !ONLY.test(id)) return; try { await f(); } catch (e) { ok(id, false, 'Fehler ' + String(e.stack || e).slice(0, 600)); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const LT = () => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({entryTypes: ['longtask']}); } catch (e) {} };
const AS = () => { try { Object.defineProperty(navigator, 'audioSession', {value: {type: 'auto'}, configurable: true}); } catch (e) {} };
const br = await chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']});
async function open(vp) {
  const ctx = await br.newContext({viewport: vp || {width: 390, height: 844}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(INIT); await p.addInitScript(LT); await p.addInitScript(AS);
  await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  await p.evaluate(() => { ensureAudio(); }); await p.waitForFunction(() => SynthHost.state === 'ready', null, {timeout: 10000});
  return {ctx, p, errs};
}
// ---------------- FP-SICHER: foreign data only as data ----------------
await T('SICHER-norm', async () => {
  const {ctx, p, errs} = await open();
  const r = await p.evaluate(() => {
    const Q = SYNQUENZER; Q.setEngine(0, 'mk'); const s = JSON.parse(JSON.stringify(Q.getSound(0)));
    const bad = JSON.parse('{"__proto__": {"polluted": 1}, "hold": [null, "7", 1e9, -5, 3.5, {}, [], true, "abc", 1e-9, 127, 128, 0, -0, 64, 64, 99, 99, 99], "chl": "xx", "chp": [1e9, -1e9, "<b>", null], "efs": 1e400, "th": "64", "gs": -1e9, "res": null, "fs": 99, "cut": -999, "msrc": 1e6, "lvl": NaN}'.replace('NaN', '"NaN"'));
    s.p.mk.mode = 3; s.p.mk.voc = bad;
    const o = SQStore.normalizeSound(s), v = o && o.p.mk.voc;
    const nums = k => typeof v[k] === 'number' && isFinite(v[k]);
    return {ok: !!v, hold: v && v.hold, chl: v && v.chl, chp: v && v.chp, sc: v && ['efs', 'th', 'gs', 'res', 'fs', 'cut', 'msrc', 'lvl'].map(k => k + '=' + v[k]), allNum: v && ['efs', 'th', 'gs', 'res', 'fs', 'cut', 'msrc', 'lvl', 'dir', 'hpl', 'hpg', 'ins', 'mint', 'dist', 'vel', 'kbd'].every(nums), polluted: ({}).polluted};
  });
  const holdOk = r.hold === null || (Array.isArray(r.hold) && r.hold.length === 16 && r.hold.every(x => Number.isInteger(x) && x >= 0 && x <= 127));
  const chOk = Array.isArray(r.chl) && r.chl.length === 16 && r.chl.every(x => x >= 0 && x <= 127) && Array.isArray(r.chp) && r.chp.length === 16 && r.chp.every(x => x >= -63 && x <= 63);
  ok('FP-SICHER normalizeSound mit fremdem voc', r.ok && holdOk && chOk && r.allNum && r.polluted === undefined, 'hold ' + JSON.stringify(r.hold) + ' · chl[0..3] ' + JSON.stringify(r.chl && r.chl.slice(0, 4)) + ' · chp[0..3] ' + JSON.stringify(r.chp && r.chp.slice(0, 4)) + ' · ' + (r.sc || []).join(' ') + ' · polluted ' + r.polluted);
  const m = await p.evaluate(() => [normMkIn({e1: 't:../../x', e2: 'MIC', e1Dry: 'no'}), normMkIn({e1: 't:abcdefghij', e2: 'mic', e2Dry: 0, x: '<script>'}), normMkIn('mic'), normMkIn({e1: 't:ABCDEFGHIJ'})]);
  ok('FP-SICHER normMkIn', m[0] === null && m[1] && m[1].e1 === 't:abcdefghij' && m[1].e2 === 'mic' && !('x' in m[1]) && m[2] === null && m[3] === null, JSON.stringify(m));
  ok('FP-SICHER keine Konsolenfehler (norm)', !errs.length, errs.join(' | ').slice(0, 300));
  await ctx.close();
});
await T('SICHER-load', async () => {
  const {ctx, p, errs} = await open();
  // a project (e.g. from the partner) with E2 = microphone on a vocoder track and a hostile track name
  const r = await p.evaluate(async () => {
    const Q = SYNQUENZER; Q.setEngine(0, 'mk'); const s = Q.getSound(0); s.p.mk.mode = 3; s.p.mk.voc.hold = new Array(16).fill(70); applySound(0, s);
    const pj = JSON.parse(serializeProject()); pj.tracks[0].mkIn = {e1: null, e2: 'mic', e1Dry: 1, e2Dry: 1}; pj.tracks[1].name = '<img src=x onerror="window.__xss=1">'; pj.tracks[2].mkIn = {e1: 't:' + pj.tracks[0].uid, e2: null, e1Dry: 0, e2Dry: 1};
    const n = normalizeProject(pj); applyProject(n, {});
    await new Promise(r => setTimeout(r, 800)); try { mkInRoute(); } catch (e) {}
    await new Promise(r => setTimeout(r, 500));
    return {fake: window.__fake.gum, tap: Q.mkInInfo().mic.gum, mk0: JSON.stringify(S.tracks[0].mkIn), mk2: JSON.stringify(S.tracks[2].mkIn || null), name1: S.tracks[1].name};
  });
  ok('FP-SICHER Projekt mit E2 = Mikrofon laden: kein getUserMedia', r.fake === 0 && r.tap === 0, JSON.stringify(r));
  // the source list shows the hostile name as text
  await p.evaluate(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await sleep(500);
  await p.evaluate(() => { MKUI.setWahl(1, 3); MKUI.P.shift = 1; MKUI.render(); });
  const kb = await p.evaluate(() => { const e = document.querySelector('#synthSheet .mkx[data-k="k0"]'), q = e.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2 + 6]; });
  await p.touchscreen.tap(kb[0], kb[1]); await sleep(400);
  const L = await p.evaluate(() => ({rows: [...document.querySelectorAll('.pop .plist.mksrc button')].map(b => b.textContent), img: document.querySelectorAll('.pop img').length, xss: window.__xss}));
  ok('FP-SICHER fremder Spurname in QUELLE nur als Text', L.xss === undefined && L.img === 0 && L.rows.some(x => x.includes('<img')), 'Zeilen ' + L.rows.length + ' · img ' + L.img + ' · __xss ' + L.xss + ' · ' + (L.rows.find(x => x.includes('img')) || '').slice(0, 80));
  // the hostile name in the LCD after choosing it
  const pick = await p.evaluate(() => { const b = [...document.querySelectorAll('.pop .plist.mksrc button[data-v^="t:"]')].find(x => x.textContent.includes('<img')); if (!b) return null; const q = b.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; });
  if (pick) { await p.touchscreen.tap(pick[0], pick[1]); await sleep(300); }
  const l2 = await p.evaluate(() => ({lcd: ED.lcd ? ED.lcd.textContent : '', img: ED.lcd ? ED.lcd.querySelectorAll('img').length : -1, xss: window.__xss, e2: JSON.stringify(S.tracks[0].mkIn)}));
  ok('FP-SICHER fremder Spurname im LCD nur als Text', l2.xss === undefined && l2.img === 0, JSON.stringify(l2).slice(0, 300));
  ok('FP-SICHER keine Konsolenfehler (load)', !errs.length, errs.join(' | ').slice(0, 300));
  await ctx.close();
});
// ---------------- FP-IPHONE: microphone, audio session, background ----------------
await T('IPHONE-bg', async () => {
  const {ctx, p, errs} = await open();
  await p.evaluate(() => { const Q = SYNQUENZER; Q.setEngine(0, 'mk'); const s = Q.getSound(0); s.p.mk.mode = 3; applySound(0, s); Q.selectTrack(0); Q.openEditor(); });
  await sleep(400);
  await p.evaluate(() => SYNQUENZER.mkIn(0, 'e2', 'mic'));
  const ok1 = await p.evaluate(() => vocMicStart()); await sleep(500);
  const a = await p.evaluate(() => ({on: vocMicOn(), as: navigator.audioSession.type, gum: window.__fake.gum, rs: MICTAP.stream ? MICTAP.stream.getTracks().map(t => t.readyState).join() : ''}));
  const tr = await p.evaluate(() => { window.__trk = MICTAP.stream.getTracks()[0]; return true; });
  await p.evaluate(() => { Object.defineProperty(document, 'hidden', {get: () => true, configurable: true}); Object.defineProperty(document, 'visibilityState', {get: () => 'hidden', configurable: true}); document.dispatchEvent(new Event('visibilitychange')); });
  await sleep(300);
  const b = await p.evaluate(() => ({on: vocMicOn(), as: navigator.audioSession.type, rs: window.__trk.readyState, users: [...MICTAP.users].join(), e2: JSON.stringify(S.tracks[0].mkIn)}));
  ok('FP-IPHONE Vocoder-Mikrofon: Sitzung und Hintergrund', ok1 && a.on && a.as === 'play-and-record' && !b.on && b.rs === 'ended' && b.as === 'playback', 'an: ' + JSON.stringify(a) + ' · Seite versteckt: ' + JSON.stringify(b));
  await p.evaluate(() => { Object.defineProperty(document, 'hidden', {get: () => false, configurable: true}); Object.defineProperty(document, 'visibilityState', {get: () => 'visible', configurable: true}); document.dispatchEvent(new Event('visibilitychange')); });
  await sleep(500);
  const c = await p.evaluate(() => ({on: vocMicOn(), gum: window.__fake.gum, lcd: ED.lcd ? ED.lcd.textContent : ''}));
  ok('FP-IPHONE zurück im Vordergrund: kein getUserMedia ohne Tipp', !c.on && c.gum === 1, JSON.stringify(c));
  ok('FP-IPHONE keine Konsolenfehler (bg)', !errs.length, errs.join(' | ').slice(0, 300));
  await ctx.close();
});
// ---------------- FP-IPHONE: rAF and longtasks in the vocoder flows, P1 and L1, touch ----------------
for (const [fmt, vp] of [['P1', {width: 390, height: 844}], ['L1', {width: 844, height: 390}]]) await T('IPHONE-perf-' + fmt, async () => {
  const {ctx, p, errs} = await open(vp);
  await p.evaluate(() => { const Q = SYNQUENZER; Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.openEditor(); }); await sleep(800);
  await p.evaluate(() => { window.__lt.length = 0; });
  const steps = {};
  const mark = async (k, f) => { await p.evaluate(() => { window.__lt.length = 0; }); const t0 = Date.now(); await f(); await sleep(400); steps[k] = {ms: Date.now() - t0, lt: await p.evaluate(() => window.__lt.slice())}; };
  await mark('Synth→Vocoder', () => p.evaluate(() => { MKUI.setv(MKUI.KN.mode, 1, false); MKUI.render(); }));
  await mark('QUELLE-Liste (Touch)', async () => { await p.evaluate(() => { MKUI.setWahl(1, 3); MKUI.P.shift = 1; MKUI.render(); });
    const kb = await p.evaluate(() => { const e = document.querySelector('#synthSheet .mkx[data-k="k0"]'), q = e.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2 + 6]; }); await p.touchscreen.tap(kb[0], kb[1]); await sleep(300);
    const pk = await p.evaluate(() => { const b = document.querySelector('.pop .plist.mksrc button[data-v^="t:"]'); if (!b) return null; const q = b.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2, q.width, q.height]; });
    steps.row = pk; if (pk) await p.touchscreen.tap(pk[0], pk[1]); });
  const e2 = await p.evaluate(() => JSON.stringify(S.tracks[0].mkIn || null));
  ok('TOUCH ' + fmt + ' QUELLE 2 per Tipp gewählt', /"e2":"t:/.test(e2) && steps.row && steps.row[3] >= 44, 'mkIn ' + e2 + ' · Zeile ' + (steps.row ? steps.row[2].toFixed(0) + '×' + steps.row[3].toFixed(0) : '–'));
  await mark('16 BÄNDER öffnen', () => p.evaluate(() => { MKUI.P.bA = 'chl'; MKUI.viewOpen('baender'); }));
  // play: source track 1 plays a chord, the vocoder track 0 a chord; measure rAF and longtasks for 5 s
  await p.evaluate(() => { const E = AU.synth[1]; E.on(9e6, 57, .8, AU.ctx.currentTime + .02); E.on(9e6 + 1, 64, .8, AU.ctx.currentTime + .02); E.flush();
    const A = AU.synth[0]; for (const [k, nt] of [[0, 48], [1, 52], [2, 55], [3, 59]]) A.on(8e6 + k, nt, .8, AU.ctx.currentTime + .02); A.flush(); window.__lt.length = 0; });
  // touch drag on band 5 (CDP touch events) during playback
  const col = await p.evaluate(() => { const e = document.querySelector('#synthSheet .mkx[data-k="b4"]'); if (!e) return null; const q = e.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2, q.width, q.height]; });
  const u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n), v0 = await p.evaluate(() => SYNQUENZER.mkGet(0).voc.chl[4]);
  const cdp = await ctx.newCDPSession(p);
  if (col) { const [x, y] = col; await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y}]}); for (let k = 1; k <= 12; k++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x, y: y + k * 4}]}); await sleep(16); } await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); }
  await sleep(200);
  const v1 = await p.evaluate(() => SYNQUENZER.mkGet(0).voc.chl[4]), u1 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
  ok('TOUCH ' + fmt + ' 16 BÄNDER: Band 5 per Finger ziehen = ein Undo', col && v1 < v0 && u1 === u0 + 1, 'Säule ' + (col ? col[2].toFixed(0) + '×' + col[3].toFixed(0) : '–') + ' · K-PEGEL 5 ' + v0 + ' → ' + v1 + ' · Undo +' + (u1 - u0));
  const r = await p.evaluate(async () => { const t0 = performance.now(); const fps = []; let last = t0, worst = 0;
    await new Promise(res => { const f = () => { const n = performance.now(); const d = n - last; if (n - t0 > 100) { fps.push(1000 / d); worst = Math.max(worst, d); } last = n; if (n - t0 < 5000) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
    fps.sort((a, b) => a - b); const E = AU.synth[0]; return {fps: +fps[fps.length >> 1].toFixed(1), worst: Math.round(worst), lt: window.__lt.slice(), lv: E.mkLv ? E.mkLv.b.filter(x => x > 0).length : -1, load: E.load}; });
  ok('FP-IPHONE ' + fmt + ' rAF ≥ 55 fps, keine longtask > 50 ms (Vocoder spielt, 16 BÄNDER offen)', r.fps >= 55 && !r.lt.some(x => x[1] > 50), JSON.stringify(r));
  const bad = Object.entries(steps).filter(([k, v]) => v && v.lt && v.lt.some(x => x[1] > 50));
  ok('FP-IPHONE ' + fmt + ' Bedien-Schritte ohne longtask > 50 ms', !bad.length, Object.entries(steps).filter(([k]) => k !== 'row').map(([k, v]) => k + ' ' + v.ms + ' ms lt ' + JSON.stringify(v.lt)).join(' · '));
  ok('FP-IPHONE ' + fmt + ' keine Konsolenfehler', !errs.length, errs.join(' | ').slice(0, 300));
  await ctx.close();
});
await br.close();
console.log((fails ? 'FEHLER ' : 'OK ') + (n - fails) + '/' + n);
