// MK5-16 / PE1 / FP-IPHONE: four AM tracks arpeggiate 4-bar chord clips at 1/24 (120 BPM) for 10 s with the editor open on ARP A.
// The arp's share of every scheduler tick (ARPC.tick, p95 ≤ 0.3 ms), the whole tick (p95 ≤ 4 ms), rAF median ≥ 55 fps, no longtask
// > 50 ms, no console errors. base = 4.12.0 (the same steps, arp off). Usage: node v3-mk5-perf.mjs [throttle]
import { chromium } from 'playwright';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const APP = S + 'mk-br-MK5/index.html', BASE = S + 'mk5-base-4.12.0.html', THR = +process.argv[2] || 1;
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
let fails = 0; const ok = (id, c, info) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + id + (info ? ' — ' + info : '')); };
const P95 = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length * .95)] : 0; };
for (const [name, file] of [['base', BASE], ['neu', APP], ['base', BASE], ['neu', APP]]) {
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true}); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(() => { window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({entryTypes: ['longtask']}); } catch (e) {} });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.storage().booted, null, {timeout: 30000});
  if (THR > 1) { const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', {rate: THR}); }
  const r = await p.evaluate(async (isNew) => {
    const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms));
    await Q.loadDemo(); Q.setBpm(120); ensureAudio(); await sl(1200);
    const CH = [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]];
    for (let t = 0; t < 4; t++) { Q.setEngine(t, 'mk'); const notes = []; CH.forEach((c, k) => c.forEach(n => notes.push({t: k * 4, d: 4, n: n + 12 * (t % 2), v: .8}))); Q.setClip(t, 0, {len: 4, notes});
      if (isNew) { Q.mkSet(t, 'arp.on', 1); Q.mkSet(t, 'arp.res', 0); Q.mkSet(t, 'arp.range', 2); Q.mkSet(t, 'arp.type', t % 4); } }
    Q.selectTrack(0); Q.openEditor(); await sl(300); if (isNew && window.MKUI) MKUI.setWahl(2, 7);
    // the whole scheduler tick, timed in its own interval (same TICK_MS)
    const tk = [], ak = []; clearInterval(AU.timer); AU.timer = setInterval(() => { const a = performance.now(); tick(); tk.push(performance.now() - a); }, TICK_MS);
    if (isNew) { const f = ARPC.tick; ARPC.tick = (n, h) => { const a = performance.now(); f(n, h); ak.push(performance.now() - a); }; }
    Q.clearLog(); Q.launchScene(0); await sl(600);
    tk.length = 0; ak.length = 0; const t0 = performance.now(); window.__lt.length = 0; const fr = []; let on = true, w0 = performance.now(), wn = 0;
    const raf = () => { const n = performance.now(); wn++; if (n - w0 >= 1000) { fr.push(wn * 1000 / (n - w0)); w0 = n; wn = 0; } if (on) requestAnimationFrame(raf); }; requestAnimationFrame(raf);
    await sl(10000); on = false;
    const lt = window.__lt.filter(x => x[0] >= t0), arpN = isNew ? [0, 1, 2, 3].map(t => Q.arpLog(t).length) : null;
    fr.sort((a, b) => a - b); Q.stop();
    return {tk, ak, lt: lt.map(x => x[1]), fpsMed: +fr[fr.length >> 1].toFixed(1), arpN, notes: Q.noteLog(4000).length};
  }, name === 'neu');
  const o = {tickP95: +P95(r.tk).toFixed(3), arpP95: +P95(r.ak).toFixed(4), arpMax: +Math.max(0, ...r.ak).toFixed(3), ticks: r.tk.length, fps: r.fpsMed, lt: r.lt, arpN: r.arpN, errs: errs.length};
  console.log(name, JSON.stringify(o));
  if (name === 'neu') {
    ok(`MK5-16 Arp-Anteil je tick (4 Spuren, 1/24, ×${THR}): p95 ≤ 0,3 ms`, o.arpP95 <= .3 * THR, o.arpP95 + ' ms (max ' + o.arpMax + ')');
    ok(`MK5-16 PE1 (×${THR}): rAF-Median ≥ 55 fps, keine longtask > 50 ms, tick-p95 ≤ 4 ms, Arp spielt, keine Fehler`, o.fps >= 55 && !o.lt.some(x => x > 50) && o.tickP95 <= 4 && r.arpN.every(n => n > 100) && !errs.length, JSON.stringify(o));
  }
  await ctx.close();
}
await b.close(); process.exit(fails ? 1 : 0);
