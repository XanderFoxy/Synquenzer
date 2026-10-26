// QA MK5 probe K: transport stopped, song swing 30 %, arp 1/16, W-35 = 0, tempo change while holding: swing stays on the even steps
import { browser, T, ok, J } from './v3-qa-mk5-lib.mjs';
await T('Swing Tempo', async page => {
  const r = await page.evaluate(async () => {
    const out = [];
    for (const wait of [690, 760]) {
      H.reset(); H.Q.setBpm(120); S.settings.swing = .3; H.arp({on: 1, res: 1, gate: 30}); await H.sl(40); H.keys([60, 64, 67]); await H.sl(wait);
      const L0 = H.log(); const tc = H.now(); H.Q.setBpm(100); await H.sl(1400); H.up([60, 64, 67]); await H.sl(40); S.settings.swing = 0;
      const L = H.log(); const t0 = L[0].t;
      out.push({tc: +((tc - t0) * 1000).toFixed(1), ts: L.map(x => +((x.t - t0) * 1000).toFixed(1)), steps: L.map(x => x.c)});
    }
    return out;
  });
  for (const x of r) {
    // offsets: between consecutive steps the interval alternates long/short (swing); after the tempo change the pattern of long/short must continue with the same parity
    const d = x.ts.slice(1).map((t, k) => +(t - x.ts[k]).toFixed(1));
    const longAt = d.map((v, k) => [k, v]);
    // with swing, intervals alternate: step0->1 long (+off), 1->2 short; the even-index interval (0,2,4..) must stay long
    const bpmAt = k => (x.ts[k + 1] <= x.tc + 1 ? 120 : 100), base = k => 60 / bpmAt(k) / 4 * 1000;
    const wrong = d.map((v, k) => [k, v, base(k)]).filter(([k, v, b]) => x.ts[k] > x.tc + 150 && ((k % 2 === 0) !== (v > b + 1)));
    ok('Transport steht, Song-Swing 30 %, Tempo 120 → 100 im Lauf: Swing bleibt auf den geraden Schritten', wrong.length === 0, 'Wechsel bei ' + x.tc + ' ms; Abstände ' + d.join(' ') + (wrong.length ? ' | falsch: ' + J(wrong.slice(0, 4)) : ''));
  }
});
await browser.close();
