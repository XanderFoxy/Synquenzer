// Audio-Prüfung im Browser (offline gerendert, gleicher Weg wie beim Abspielen): Dehnen ohne Knackser, Timing-Schicht deckungsgleich
const { chromium } = require('playwright'); const fs = require('fs');
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall/roh/';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 428, height: 926 } });
  const p = await ctx.newPage(); await p.route('**/*', r => r.request().url().startsWith('http://localhost:9123/') ? r.continue() : r.abort());
  p.on('pageerror', e => console.log('pageerror', e.message));
  await p.goto('http://localhost:9123/the-wall/werkstatt2/index.html'); await p.waitForFunction(() => window.__ws2 && window.__ws2.PRUEF);
  const r = await p.evaluate(async () => {
    const w = window.__ws2, S = w.SIL, ORD = w.ORD, sr = 48000;
    const klicks = x => { // 1-ms-Rahmen: Sprungmaß |dx| gegen Umgebung (±20 ms Median)
      const m = 48, n = Math.floor(x.length / m), pk = new Float32Array(n); for (let i = 0; i < n; i++) { let v = 0; for (let j = i * m + 1; j < (i + 1) * m; j++) { const d = Math.abs(x[j] - x[j - 1] - (x[j - 1] - (j > 1 ? x[j - 2] : 0))); if (d > v) v = d } pk[i] = v }
      let z = 0, worst = 0; for (let i = 20; i < n - 20; i++) { const u = Array.from(pk.slice(i - 20, i + 20)).sort((a, b) => a - b)[20]; const q = pk[i] / (u + 1e-5); if (q > worst) worst = q; if (q > 6) z++ } return { z, worst: +worst.toFixed(1) } };
    const out = { dehnen: [] };
    for (const [txt, ms] of [['hyp', 80], ['hyp', -60], ['see', 120], ['Wel', 50], ['know', -40]]) {
      const i = ORD.find(j => S[j].text.toLowerCase().startsWith(txt.toLowerCase())), a = S[i].a, dT = { [i]: ms / 1000 };
      const x0 = (await w.renderOffline(a - 1.2, a + 1.2, {}, false)).x, x1 = (await w.renderOffline(a - 1.2, a + 1.2, dT, false)).x;
      const P = w.plan(dT).filter(q => q.k && q.k !== 1).map(q => [+q.d0.toFixed(3), +q.d1.toFixed(3), +q.k.toFixed(3)]);
      out.dehnen.push({ silbe: S[i].text, ms, gedehnt: P, ohne: klicks(x0), mit: klicks(x1), wsola_ms: (w.MESS.dehn || []).slice(-2) });
    }
    // Timing-Schicht hörbar: 30–45 s offline, Hülle 10 ms
    const T = w.timingPlan(); const x = (await w.renderOffline(30, 45, null, false, T)).x; const env = [];
    for (let i = 0; i + 480 <= x.length; i += 480) { let s = 0; for (let j = i; j < i + 480; j++) s += x[j] * x[j]; env.push(+(10 * Math.log10(s / 480 + 1e-12)).toFixed(2)) }
    out.timing = { stuecke: T.length, gedehnt: T.filter(q => q.k !== 1).length, env, klicks: klicks(x) };
    return out;
  });
  fs.writeFileSync(OUT + 'test_audio.json', JSON.stringify(r));
  console.log(JSON.stringify(r.dehnen, null, 0)); console.log('timing', r.timing.stuecke, r.timing.gedehnt, JSON.stringify(r.timing.klicks));
  await b.close();
})();
