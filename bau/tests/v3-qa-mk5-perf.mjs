// QA MK5-16: the arp's cost per scheduler tick with a FINE clock (served with COOP/COEP -> crossOriginIsolated -> 5 µs timer
// instead of 100 µs). 4 AM tracks, 4-bar chord clips, arp 1/24, 120 BPM, 10 s. Measures ARPC.tick + ARPC.clip per tick.
import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
const FILE = process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK5/index.html';
const html = fs.readFileSync(FILE);
const srv = http.createServer((q, s) => { s.writeHead(200, {'Content-Type': 'text/html; charset=utf-8', 'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Embedder-Policy': 'require-corp'}); s.end(html); });
await new Promise(r => srv.listen(0, '127.0.0.1', r)); const port = srv.address().port;
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const P = (a, q) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * q))] : 0; };
const RUNS = +(process.env.RUNS || 3);
for (let run = 0; run < RUNS; run++) {
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true}); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('http://127.0.0.1:' + port + '/'); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.storage().booted, null, {timeout: 30000});
  const r = await p.evaluate(async () => {
    const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms));
    const iso = window.crossOriginIsolated;
    // timer resolution
    let res = 1; { let a = performance.now(); for (let k = 0; k < 2000; k++) { const b = performance.now(); if (b !== a) { res = Math.min(res, b - a); a = b; } } }
    await Q.loadDemo(); Q.setBpm(120); ensureAudio(); await sl(1200);
    const CH = [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]];
    for (let t = 0; t < 4; t++) { Q.setEngine(t, 'mk'); const notes = []; CH.forEach((c, k) => c.forEach(n => notes.push({t: k * 4, d: 4, n: n + 12 * (t % 2), v: .8}))); Q.setClip(t, 0, {len: 4, notes});
      Q.mkSet(t, 'arp.on', 1); Q.mkSet(t, 'arp.res', 0); Q.mkSet(t, 'arp.range', 2); Q.mkSet(t, 'arp.type', t % 4); }
    Q.selectTrack(0); Q.openEditor(); await sl(300); if (window.MKUI) MKUI.setWahl(2, 7);
    await sl(300);
    const ak = [], ck = [], tk = []; let cur = 0, curC = 0;
    const f = ARPC.tick, fc = ARPC.clip;
    ARPC.tick = (n, h) => { const a = performance.now(); f(n, h); cur += performance.now() - a; };
    ARPC.clip = (...x) => { const a = performance.now(); const r = fc(...x); curC += performance.now() - a; return r; };
    clearInterval(AU.timer); AU.timer = setInterval(() => { cur = 0; curC = 0; const a = performance.now(); tick(); tk.push(performance.now() - a); ak.push(cur + curC); ck.push(curC); }, TICK_MS);
    Q.clearLog(); Q.launchScene(0); await sl(600);
    tk.length = 0; ak.length = 0; ck.length = 0;
    await sl(10000);
    const arpN = [0, 1, 2, 3].map(t => Q.arpLog(t).length); Q.stop();
    return {iso, res, tk, ak, ck, arpN, TICK_MS};
  });
  const nz = r.ak.filter(x => x > 0);
  console.log(JSON.stringify({run, iso: r.iso, timerRes_ms: +r.res.toFixed(4), ticks: r.ak.length, TICK_MS: r.TICK_MS,
    arp_p50: +P(r.ak, .5).toFixed(4), arp_p95: +P(r.ak, .95).toFixed(4), arp_p99: +P(r.ak, .99).toFixed(4), arp_max: +Math.max(...r.ak).toFixed(4),
    clip_p95: +P(r.ck, .95).toFixed(4), tick_p95: +P(r.tk, .95).toFixed(4), over03: r.ak.filter(x => x > .3).length, arpN: r.arpN, errs: errs.length}));
  await ctx.close();
}
await b.close(); srv.close();
