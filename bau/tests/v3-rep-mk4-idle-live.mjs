// Independent repro, LIVE path: real AudioContext, track 1 = AM, edits through SYNQUENZER.mkSet (what the panel calls),
// notes through SYNQUENZER.keyOn/keyOff, recorder on the track node. TIEFE 127 -> 0 while the track is silent; the attack
// of the next note vs the attack of a later note with TIEFE 0 throughout (onset-aligned windows).
// Usage: node v3-rep-mk4-idle-live.mjs <index.html>
import { chromium } from 'playwright';
import path from 'path';
const FILE = path.resolve(process.argv[2]);
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await browser.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
const page = await ctx.newPage(); const errs = [];
page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
await page.evaluate(() => { SYNQUENZER.newProject({init: true}); });
await page.waitForTimeout(400);
await page.evaluate(() => { ensureAudio(); SYNQUENZER.setBpm(120); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); });
await page.waitForTimeout(800);
const out = await page.evaluate(async () => {
  const S = (p, v) => SYNQUENZER.mkSet(0, p, v);
  for (const [p, v] of [['t.0.o1.w', 0], ['t.0.f.cut', 90], ['t.0.f.res', 20], ['t.0.f.eg', 30], ['t.0.e1.a', 0], ['t.0.e1.d', 50], ['t.0.e1.s', 0], ['t.0.e1.r', 30],
    ['t.0.e2.a', 0], ['t.0.e2.d', 60], ['t.0.e2.s', 0], ['t.0.e2.r', 30], ['mfx.type', 1], ['mfx.spd', 64], ['mfx.dep', 127]]) S(p, v);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const c = AU.ctx, E = AU.synth[0]; if (!E || !E.node) return {err: 'kein Knoten'};
  const sp = c.createScriptProcessor(1024, 2, 2), z = c.createGain(); z.gain.value = 0; const L = [], R = [];
  let rec = false; sp.onaudioprocess = e => { if (!rec) return; L.push(Float32Array.from(e.inputBuffer.getChannelData(0))); R.push(Float32Array.from(e.inputBuffer.getChannelData(1))); };
  E.node.connect(sp); sp.connect(z); z.connect(c.destination);
  await wait(300);
  const take = async () => { L.length = 0; R.length = 0; rec = true; await wait(100); SYNQUENZER.keyOn(64, .9); await wait(300); SYNQUENZER.keyOff(64); await wait(400); rec = false; await wait(50);
    const n = L.reduce((a, b) => a + b.length, 0), l = new Float32Array(n); let o = 0; for (const b of L) { l.set(b, o); o += b.length; } return l; };
  // note 1 with Ensemble 127, then silence, then TIEFE -> 0 while silent
  SYNQUENZER.keyOn(60, .9); await wait(300); SYNQUENZER.keyOff(60); await wait(1500);
  S('mfx.dep', 0); await wait(700);
  const a = await take();                 // first note after the silent edit
  await wait(1500);
  const b = await take();                 // a later note, TIEFE 0 throughout
  await wait(1500);
  const b2 = await take();                // another later note (noise floor of the comparison)
  E.node.disconnect(sp); sp.disconnect(); z.disconnect();
  const sr = c.sampleRate, db = x => 20 * Math.log10(x + 1e-30);
  const on = x => { for (let i = 0; i < x.length; i++) if (Math.abs(x[i]) > 1e-3) return i; return -1; };
  const rms = (x, i0, i1) => { let e = 0; for (let i = i0; i < i1; i++) e += x[i] * x[i]; return Math.sqrt(e / (i1 - i0)); };
  const W = [[0, 5], [5, 10], [10, 20], [20, 40], [40, 80], [100, 250]];
  const lv = x => { const i0 = on(x); return W.map(([u, v]) => db(rms(x, i0 + Math.round(u * sr / 1000), i0 + Math.round(v * sr / 1000)))); };
  const A = lv(a), B = lv(b), B2 = lv(b2);
  return {sr, mfx: SYNQUENZER.mkGet(0).mfx, windows_ms: W.map(w => w.join('-')).join(' / '),
    firstNoteAfterSilentEdit_minus_later: A.map((x, i) => (x - B[i]).toFixed(2)).join(' / '),
    laterNote2_minus_later: B2.map((x, i) => (x - B[i]).toFixed(2)).join(' / ')};
});
console.log(JSON.stringify(out, null, 1));
console.log('console errors:', errs.length ? errs.slice(0, 5) : 'none');
await browser.close();
