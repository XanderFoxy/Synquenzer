import { chromium } from 'playwright';
const FILE = process.argv[2];
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const p = await (await b.newContext({viewport: {width: 390, height: 844}})).newPage();
await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.storage().booted, null, {timeout: 30000});
const r = await p.evaluate(async () => {
  const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms));
  await Q.loadDemo(); Q.setBpm(120); ensureAudio(); await sl(1200);
  const CH = [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]];
  for (let t = 0; t < 4; t++) { Q.setEngine(t, 'mk'); const notes = []; CH.forEach((c, k) => c.forEach(n => notes.push({t: k * 4, d: 4, n, v: .8}))); Q.setClip(t, 0, {len: 4, notes}); Q.mkSet(t, 'arp.on', 1); Q.mkSet(t, 'arp.res', 0); Q.mkSet(t, 'arp.range', 2); }
  const acc = {sp: 0, op: 0, lg: 0, tk: 0, n: 0, no: 0};
  const sv = window.spawnVoice; // function declarations are not rebindable from here; measure via performance marks around ARPC.tick and count steps
  const f = ARPC.tick; ARPC.tick = (n, h) => { const a = performance.now(); f(n, h); acc.tk += performance.now() - a; acc.n++; };
  // microbench: outPitch and spawnVoice-free pattern
  const t0 = performance.now(); for (let k = 0; k < 20000; k++) outPitch(0, S.tracks[0].clips[0].key, 60, AU.ctx.currentTime); acc.op = (performance.now() - t0) / 20000;
  const N = [48, 55, 60, 64].map(p => ({p})); const t1 = performance.now(); for (let k = 0; k < 20000; k++) ARPC.arpPattern(k % 4, 2, N, k, 7, 4); acc.pat = (performance.now() - t1) / 20000;
  Q.launchScene(0); await sl(5000); Q.stop();
  return {tickMean: acc.tk / acc.n, outPitch: acc.op, pattern: acc.pat, n: acc.n, notes: Q.arpLog(0).length};
});
console.log(JSON.stringify(r));
await b.close();
