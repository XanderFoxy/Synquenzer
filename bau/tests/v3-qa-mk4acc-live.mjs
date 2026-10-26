// QA (acceptance lens) MK4 in Chromium: the LIVE engine of track 1 (real AudioContext, recorder on the track node), effects set
// through the panel gestures, delay time against the song tempo (120 -> 90 BPM), persistence through save + reload, probe "+FX"
// really runs effects. Usage: node v3-qa-mk4acc-live.mjs <index.html>
import { chromium } from 'playwright';
import path from 'path';
const FILE = path.resolve(process.argv[2]);
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const ctx = await browser.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
const page = await ctx.newPage(); const errs = [];
page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
await page.evaluate(() => { SYNQUENZER.newProject({init: true}); });
await page.waitForTimeout(400);
await page.evaluate(() => { ensureAudio(); SYNQUENZER.setBpm(120); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); });
await page.waitForTimeout(800);
const box = k => page.evaluate(k => { const e = document.querySelector('#synthSheet .mkx[data-k="' + k + '"]'); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height}; }, k);
async function drag(k, dy, steps) { const b = await box(k); const x = b.x + b.w / 2, y = b.y + b.h / 2 + 6; await page.mouse.move(x, y); await page.mouse.down(); for (let s = 1; s <= steps; s++) await page.mouse.move(x, y - dy * s / steps); await page.mouse.up(); await page.waitForTimeout(80); }
async function tapK(k) { const b = await box(k); await page.mouse.click(b.x + b.w / 2, b.y + b.h / 2 + 6); await page.waitForTimeout(200); }
async function pick(re) { const p = await page.evaluate(src => { const R = new RegExp(src); const b = [...document.querySelectorAll('.pop .plist button')].find(x => R.test(x.textContent.replace(/\s+/g, ' ').trim())); if (!b) return null; const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, re.source); if (p) { await page.mouse.click(p[0], p[1]); await page.waitForTimeout(200); } return !!p; }
// --- the panel: EDIT-WAHL 2 -> DELAY (list), TEMPO SYNC an (list), NOTE 1/8, TIEFE up (drag); a short gate sound
const sel = await (async () => { await tapK('w2'); return pick(/^6 DELAY/); })();
const sync = await (async () => { await tapK('k1'); return pick(/^(\d+ )?an\b/i); })();
await page.evaluate(() => { SYNQUENZER.mkSet(0, 'dly.note', 5); SYNQUENZER.mkSet(0, 't.0.a.gate', 1); });
await drag('k3', 90, 14);
const st = await page.evaluate(() => ({dly: SYNQUENZER.mkGet(0).dly, pi: SYNQUENZER.mkPanel()}));
ok('L-UI EDIT-WAHL 2 → DELAY, TEMPO SYNC an (Listen), TIEFE gezogen', sel && sync && st.dly.sync === 1 && st.dly.dep > 30 && st.pi.knobs[2].l === 'NOTE', JSON.stringify(st.dly) + ' disp ' + st.pi.disp);
// --- recorder on the live node of track 1
async function rec(fn, ms) {
  return page.evaluate(async ([src, ms]) => {
    const c = AU.ctx, E = AU.synth[0]; if (!E || !E.node) return {err: 'kein Knoten'};
    const sp = c.createScriptProcessor(1024, 2, 2), z = c.createGain(); z.gain.value = 0; const L = [], R = [];
    sp.onaudioprocess = e => { L.push(Float32Array.from(e.inputBuffer.getChannelData(0))); R.push(Float32Array.from(e.inputBuffer.getChannelData(1))); };
    E.node.connect(sp); sp.connect(z); z.connect(c.destination);
    await new Promise(r => setTimeout(r, 150));
    await (new Function('return (async () => {' + src + '})()'))();
    await new Promise(r => setTimeout(r, ms));
    try { E.node.disconnect(sp); } catch (e) {} sp.disconnect(); z.disconnect();
    const n = L.reduce((a, b) => a + b.length, 0), l = new Float32Array(n), r = new Float32Array(n); let o = 0; for (let i = 0; i < L.length; i++) { l.set(L[i], o); r.set(R[i], o); o += L[i].length; }
    return {sr: c.sampleRate, l: Array.from(l), r: Array.from(r)};
  }, [fn, ms]);
}
// onset of the dry burst = first sample over thr; echo lag = argmax of the cross-correlation of that burst with the rest
function echoLag(x, sr, lo, hi) {
  let i0 = -1; for (let i = 0; i < x.length; i++) if (Math.abs(x[i]) > 1e-3) { i0 = i; break; }
  if (i0 < 0) return {err: 'stumm'};
  const n = Math.round(.03 * sr); let e0 = 0; for (let i = 0; i < n; i++) e0 += x[i0 + i] ** 2;
  let best = 0, bl = -1; for (let L = Math.round(lo * sr); L <= Math.round(hi * sr); L++) { let c = 0; for (let i = 0; i < n && i0 + i + L < x.length; i++) c += x[i0 + i] * x[i0 + i + L]; if (c > best) { best = c; bl = L; } }
  return {i0, lag: bl, ms: bl / sr * 1000, g: 10 * Math.log10(best / e0 + 1e-30)};
}
const a = await rec("SYNQUENZER.keyOn(72, .9); await new Promise(r => setTimeout(r, 25)); SYNQUENZER.keyOff(72);", 900);
const ea = a.l ? echoLag(a.l, a.sr, .15, .6) : a;
ok('L-120 Live-Spur: Echo der Note nach 250 ms ± 1 Sample (1/8 bei 120 BPM), Pegel nach TIEFE', ea.lag != null && Math.abs(ea.lag - Math.round(.25 * a.sr)) <= 1, JSON.stringify(ea) + ' TIEFE ' + st.dly.dep + ' (soll ' + (20 * Math.log10(st.dly.dep / 127)).toFixed(1) + ' dB)');
await page.evaluate(() => SYNQUENZER.setBpm(90)); await page.waitForTimeout(150);
const b = await rec("SYNQUENZER.keyOn(72, .9); await new Promise(r => setTimeout(r, 25)); SYNQUENZER.keyOff(72);", 1000);
const eb = b.l ? echoLag(b.l, b.sr, .15, .6) : b;
ok('L-90 Song-Tempo 90 BPM: Echo nach 333,33 ms (folgt dem Tempo)', eb.lag != null && Math.abs(eb.lag - Math.round(b.sr * 60 / 90 / 2)) <= 1, JSON.stringify(eb));
const lcd = await page.evaluate(() => { MKUI.lcdOf(MKUI.knobs()[2]); return ED.lcd ? ED.lcd.innerText.replace(/\s+/g, ' ') : ''; });
ok('L-LCD NOTE-LCD nennt die Zeit im Song-Tempo (1/8 bei 90 BPM = 333 ms)', /333/.test(lcd), lcd);
await page.evaluate(() => SYNQUENZER.setBpm(120));
// --- MOD-FX Ensemble through the panel: mono note becomes stereo (L != R) on the live node
await tapK('w2'); await pick(/^5 MOD-FX/);
await tapK('k0'); await pick(/^(\d+ )?Ensemble/);
await drag('k2', 120, 14);
await page.evaluate(() => { SYNQUENZER.mkSet(0, 'dly.dep', 0); SYNQUENZER.mkSet(0, 't.0.a.gate', 0); });
const mf = await page.evaluate(() => SYNQUENZER.mkGet(0).mfx);
const c = await rec("SYNQUENZER.keyOn(60, .9); await new Promise(r => setTimeout(r, 600)); SYNQUENZER.keyOff(60);", 300);
let dd = 0, ss = 0; if (c.l) for (let i = 0; i < c.l.length; i++) { dd += (c.l[i] - c.r[i]) ** 2; ss += (c.l[i] + c.r[i]) ** 2; }
ok('L-ENS Ensemble (Panel, TIEFE ' + mf.dep + '): die Live-Spur wird stereo (L−R ≥ −20 dB gegen L+R)', mf.type === 1 && mf.dep > 60 && 10 * Math.log10(dd / ss) > -20, JSON.stringify(mf) + ' L−R/L+R ' + (10 * Math.log10(dd / ss)).toFixed(1) + ' dB');
// --- EQ through the panel: TIEF-GAIN -> stored on 0.5 dB steps
await tapK('w2'); await pick(/^7 EQ/);
await drag('k1', 45, 9);
const eq = await page.evaluate(() => SYNQUENZER.mkGet(0).eq);
ok('L-EQ TIEF-GAIN gezogen → 0,5-dB-Raster', eq.lg !== 0 && Number.isInteger(eq.lg * 2), JSON.stringify(eq));
// --- persistence: save, reload, the effect blocks are back, the live engine gets them (buffer, echo)
await page.evaluate(() => { SYNQUENZER.mkSet(0, 'dly.dep', 70); SYNQUENZER.mkSet(0, 'dly.type', 2); SYNQUENZER.mkSet(0, 'eq.hf', 2500); SYNQUENZER.mkSet(0, 'eq.hg', -6.5); });
const before = await page.evaluate(() => { const m = SYNQUENZER.mkGet(0); return JSON.stringify({mfx: m.mfx, dly: m.dly, eq: m.eq}); });
await page.evaluate(() => SYNQUENZER.save()); await page.waitForTimeout(800);
await page.reload(); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000}); await page.waitForTimeout(800);
const after = await page.evaluate(() => { const m = SYNQUENZER.mkGet(0); return m ? JSON.stringify({mfx: m.mfx, dly: m.dly, eq: m.eq}) : 'null'; });
ok('L-SAVE Speichern + Neu laden behält MOD-FX, DELAY, EQ', before === after, before + ' → ' + after);
await page.evaluate(() => { ensureAudio(); SYNQUENZER.selectTrack(0); }); await page.waitForTimeout(600);
const mem = await page.evaluate(() => SYNQUENZER.mkInfo ? SYNQUENZER.mkInfo().fxBytes : (typeof mkInfo === 'function' ? mkInfo().fxBytes : null));
ok('L-SAVE nach dem Laden hat die Spur ihren Delay-Puffer (Sound mit TIEFE > 0)', mem > 2e6, 'fxBytes ' + mem);
// --- probe "+FX": the probe engines really carry effects (each reports its delay buffer) and cost more than "Kern"
const pr = await page.evaluate(async () => {
  const M = mkLoad(); const orig = SynthHost.track, made = [];
  SynthHost.track = function () { const E = orig.apply(this, arguments); made.push({E, mk: arguments[5]}); return E; };
  let r; try { r = await M.probe(['kern', 'fx'], {sec: 4}); } finally { SynthHost.track = orig; }
  return {r: {cases: r.cases.map(x => ({fall: x.fall, load: x.load_med, ok: x.frames_ok}))}, fx: made.map(m => ({mfx: m.mk && m.mk.mfx && m.mk.mfx.dep, dly: m.mk && m.mk.dly && m.mk.dly.dep, mem: m.E.mkFxB || 0}))};
});
const fxE = pr.fx.slice(4);
ok('L-PROBE „+FX“: die 4 Probe-Engines haben MOD-FX/DELAY an und melden ihren Delay-Puffer', fxE.length === 4 && fxE.every(x => x.mfx > 0 && x.dly > 0 && x.mem > 2e6), JSON.stringify(pr));
ok('L-ERR keine Konsolenfehler', !errs.length, errs.join(' | ').slice(0, 400));
await browser.close();
console.log(fails ? fails + ' FAIL' : 'alles bestanden');
