import { chromium } from 'playwright';
const FILE = process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK5/index.html';
const ARPON = process.argv[3] !== '0';
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await browser.newContext({viewport: {width: 844, height: 390}}); const page = await ctx.newPage(); const errs = [];
page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto('file://' + FILE); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
const r = await page.evaluate(async (ARPON) => {
  const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); ensureAudio(); await sl(1200);
  Q.setEngine(0, 'mk'); Q.setEngine(1, 'mk');
  for (let t = 0; t < 4; t++) for (let s = 0; s < 8; s++) if (S.tracks[t].clips[s]) S.tracks[t].clips[s] = null;
  const A = (o, t) => { for (const k in o) mkSetP(t, 'arp.' + k, o[k], false); };
  Q.setBpm(160);
  if (ARPON) { A({on: 1, res: 0, gate: 100, type: 3, range: 2}, 0); A({on: 1, res: 2, gate: 80, latch: 1, type: 4}, 1); }
  Q.setClip(0, 0, {len: 1, notes: [60, 64, 67].map(n => ({t: 0, d: 4, n, v: .8}))});
  Q.setClip(0, 1, {len: 1, notes: [57, 60, 64].map(n => ({t: 0, d: 2, n, v: .8}))});
  Q.setClip(1, 0, {len: 2, notes: [48, 55].map(n => ({t: 0, d: 1, n, v: .8}))});
  Q.setClip(1, 1, {len: 1, notes: [50, 57].map(n => ({t: 2, d: 1, n, v: .8}))});
  await sl(1500);
  const c0 = JSON.stringify(S.tracks.map(t => t.clips));
  Q.launchScene(0); Q.play(); await sl(2400); Q.launchScene(1); await sl(3000); Q.launchScene(0); await sl(2200);
  const c1 = JSON.stringify(S.tracks.map(t => t.clips));
  Q.stop();
  const vs = []; for (const ms of [0, 300, 600, 1200, 2000]) { await sl(ms ? ms - (vs.length ? [0,300,600,1200][vs.length-1] : 0) : 0); vs.push({ms, v: VOICES.filter(v => !v.dead && v.track <= 1).map(v => ({tr: v.track, out: v.out, src: v.src, st: +(v.start - AU.ctx.currentTime).toFixed(2), end: +(v.end - AU.ctx.currentTime).toFixed(2), rel: isFinite(v.relT) ? +(v.relT - AU.ctx.currentTime).toFixed(2) : null, state: v.state}))}); }
  let diff = null; if (c0 !== c1) { const a = JSON.parse(c0), b = JSON.parse(c1); diff = []; a.forEach((t, i) => t.forEach((c, s) => { if (JSON.stringify(c) !== JSON.stringify(b[i][s])) diff.push({i, s, a: c, b: b[i][s]}); })); }
  return {same: c0 === c1, diff: diff && JSON.stringify(diff).slice(0, 1500), vs};
}, ARPON);
console.log(JSON.stringify(r, null, 1).slice(0, 5000)); console.log('errs', errs.slice(0, 3));
await browser.close();
