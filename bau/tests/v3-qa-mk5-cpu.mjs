// QA MK5-16 with a precise clock: the page served with COOP/COEP (crossOriginIsolated -> performance.now ~5 µs), 4 AM tracks
// arpeggiate 4-bar chord clips at 1/24, 120 BPM, editor open on ARP A; ARPC.tick per call p50/p95/p99/max; throttle x1 and x4.
import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
const FILE = process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK5/index.html';
const html = fs.readFileSync(FILE);
const srv = http.createServer((q, s) => { s.writeHead(200, {'Content-Type': 'text/html; charset=utf-8', 'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Embedder-Policy': 'require-corp'}); s.end(html); });
await new Promise(r => srv.listen(0, '127.0.0.1', r)); const port = srv.address().port;
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const P = (a, q) => { const s = a.slice().sort((x, y) => x - y); return s.length ? +s[Math.min(s.length - 1, Math.floor(s.length * q))].toFixed(4) : 0; };
for (const THR of (process.env.THR || '1,1,1,1').split(',').map(Number)) {
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true}); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto('http://127.0.0.1:' + port + '/'); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.storage().booted, null, {timeout: 30000});
  if (THR > 1) { const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', {rate: THR}); }
  const r = await p.evaluate(async () => {
    const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms));
    await Q.loadDemo(); Q.setBpm(120); ensureAudio(); await sl(1200);
    const CH = [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]];
    for (let t = 0; t < 4; t++) { Q.setEngine(t, 'mk'); const notes = []; CH.forEach((c, k) => c.forEach(n => notes.push({t: k * 4, d: 4, n: n + 12 * (t % 2), v: .8}))); Q.setClip(t, 0, {len: 4, notes});
      Q.mkSet(t, 'arp.on', 1); Q.mkSet(t, 'arp.res', 0); Q.mkSet(t, 'arp.range', 2); Q.mkSet(t, 'arp.type', t % 4); }
    Q.selectTrack(0); Q.openEditor(); await sl(300); MKUI.setWahl(2, 7);
    const ak = [], st = [], gn = []; const LN = () => [0,1,2,3].reduce((a, t) => a + Q.arpLog(t).length, 0); const f = ARPC.tick; ARPC.tick = (n, h) => { const a = performance.now(); f(n, h); ak.push(performance.now() - a); };
    const sp = window.spawnWkVoice; void sp;
    const fs = ARPC.live; void fs;
    Q.clearLog(); Q.launchScene(0); await sl(600); ak.length = 0;
    // also a live chord on track 0 during the run (the held set grows with live keys)
    await sl(10000);
    Q.stop();
    return {ak, gn, coi: crossOriginIsolated, arpN: [0, 1, 2, 3].map(t => Q.arpLog(t).length)};
  });
  console.log(JSON.stringify({THR, coi: r.coi, n: r.ak.length, p50: P(r.ak, .5), p95: P(r.ak, .95), p99: P(r.ak, .99), max: P(r.ak, 1), arpN: r.arpN, errs: errs.length}));
  await ctx.close();
}
await b.close(); srv.close();
