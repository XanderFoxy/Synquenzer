// iPhone point MK4 in Chromium: song running (one short note per bar on the AM track), DELAY Sync 1/8 TIEFE 60; echo lag per bar
// at 120 BPM, then BPM 90 while playing; tick errors, console errors
import { chromium } from 'playwright';
const FILE = process.argv[2];
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await browser.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});
const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
await page.evaluate(() => { SYNQUENZER.newProject({init: true}); }); await page.waitForTimeout(300);
const r = await page.evaluate(async () => {
  const Q = SYNQUENZER; ensureAudio(); Q.setBpm(120); Q.setEngine(0, 'mk');
  await new Promise(r => setTimeout(r, 400));
  Q.mkSet(0, 't.0.a.gate', 1); Q.mkSet(0, 'dly.sync', 1); Q.mkSet(0, 'dly.note', 5); Q.mkSet(0, 'dly.dep', 60);
  Q.setClip(0, 0, {len: 1, notes: [{t: 0, d: .05, n: 72, v: .9}]});
  await new Promise(r => setTimeout(r, 200));
  const c = AU.ctx, E = AU.synth[0]; const sp = c.createScriptProcessor(1024, 2, 2), z = c.createGain(); z.gain.value = 0; const L = [];
  let mark = -1; sp.onaudioprocess = e => { L.push(Float32Array.from(e.inputBuffer.getChannelData(0))); };
  E.node.connect(sp); sp.connect(z); z.connect(c.destination);
  Q.launchClip(0, 0); Q.play();
  await new Promise(r => setTimeout(r, 4500));
  mark = L.reduce((a, b) => a + b.length, 0); Q.setBpm(90);
  await new Promise(r => setTimeout(r, 6000));
  Q.stop(); try { E.node.disconnect(sp); } catch (e) {} sp.disconnect();
  const n = L.reduce((a, b) => a + b.length, 0), l = new Float32Array(n); let o = 0; for (const b of L) { l.set(b, o); o += b.length; }
  return {sr: c.sampleRate, l: Array.from(l), mark, te: Q.tickErrors()};
});
// onsets: rising over 0.02 after >= 0.3 s of nothing that loud; per onset the first echo by cross-correlation (100 ... 450 ms)
const x = r.l, sr = r.sr, on = []; let last = -1e9;
for (let i = 0; i < x.length; i++) if (Math.abs(x[i]) > .02 && i - last > .6 * sr) { on.push(i); last = i; } else if (Math.abs(x[i]) > .02) last = Math.max(last, i - .3 * sr);
const res = [];
for (const i0 of on) { let pk = 0; for (let i = i0; i < i0 + Math.round(.02 * sr); i++) pk = Math.max(pk, Math.abs(x[i])); const th = .1 * pk;
  let s0 = i0; while (s0 > 0 && Math.abs(x[s0 - 1]) > th * .05) s0--; let a = i0; while (Math.abs(x[a]) < th) a++;
  let e = a + Math.round(.1 * sr); while (e < x.length && Math.abs(x[e]) < th * .5) e++;   // the first sample of the echo over half the threshold (echo ~ -6.5 dB)
  let a2 = a; while (Math.abs(x[a2]) < th * .5) a2++;
  res.push({t: +(i0 / sr).toFixed(2), after: i0 > r.mark, ms: +((e - a2) / sr * 1000).toFixed(2)}); }
console.log(JSON.stringify(res));
const pre = res.filter(q => !q.after), post = res.filter(q => q.after && q.t > r.mark / sr + 0.1);
console.log((pre.length >= 1 && pre.every(q => Math.abs(q.ms - 250) < .1) ? 'PASS' : 'FAIL') + ' laufender Song 120 BPM: Echo jeder Note nach 250 ms');
console.log((post.length >= 1 && post.every(q => Math.abs(q.ms - 333.33) < .1) ? 'PASS' : 'FAIL') + ' nach BPM 90 im laufenden Song: Echo nach 333,33 ms');
console.log((r.te === 0 ? 'PASS' : 'FAIL') + ' Tick-Fehler ' + r.te + '; ' + (errs.length ? 'FAIL Konsolenfehler ' + errs.join(' | ') : 'PASS keine Konsolenfehler'));
await browser.close();
