// QA MK5 probes D: MK5-21 in the LIVE path (the real engine, not mkRender): LFO 1 / LFO 2 phase of timbre 1 (mkScope g1/g2)
import { browser, T, ok, J } from './v3-qa-mk5-lib.mjs';

await T('MK5-21 live', async page => {
  const r = await page.evaluate(async () => {
    const out = {};
    const sample = async (ms) => { const E = AU.synth[0], a = []; E.mkScope(true); const t0 = performance.now(); let n0 = E.mksN || 0;
      while (performance.now() - t0 < ms) { await new Promise(r => setTimeout(r, 4)); if ((E.mksN || 0) !== n0) { n0 = E.mksN; a.push([+(E.mks.t).toFixed(4), +(E.mks.g1).toFixed(4), +(E.mks.g2 != null ? E.mks.g2 : NaN).toFixed(4)]); } }
      E.mkScope(false); return a; };
    for (const ks of [1, 2]) {
      H.reset(); H.Q.setBpm(120); H.arp({on: 1, res: 1, gate: 50});
      H.mk('t.0.l1.ks', ks); H.mk('t.0.l1.w', 0); H.mk('t.0.l1.sync', 0); H.mk('t.0.l1.f', 40);
      H.mk('t.0.l2.ks', ks); H.mk('t.0.l2.w', 0); H.mk('t.0.l2.sync', 0); H.mk('t.0.l2.f', 40);
      await H.sl(100);
      const p = sample(2600);
      await H.sl(100); H.keys([60, 64, 67]); await H.sl(1100); H.up([60, 64, 67]); await H.sl(300); H.keys([62, 65, 69]); await H.sl(800); H.up([62, 65, 69]);
      out[ks] = {s: await p, L: H.log().map(x => +x.t.toFixed(4))};
      await H.sl(200);
    }
    return out;
  });
  // count backwards jumps (resets) of g1 while the arp runs
  for (const ks of ['1', '2']) {
    const x = r[ks], s = x.s, L = x.L; if (!s.length) { ok('MK5-21 live ks ' + ks, false, 'keine Scope-Daten'); continue; }
    const t0 = L[0], t1 = L[L.length - 1];
    let resets1 = 0, resets2 = 0; const jumps = [];
    for (let k = 1; k < s.length; k++) { if (s[k][0] < t0 - .01 || s[k][0] > t1 + .2) continue; if (s[k][1] < s[k - 1][1] - .02) { resets1++; jumps.push(s[k][0]); } if (s[k][2] < s[k - 1][2] - .02) resets2++; }
    const steps = L.length;
    if (ks === '1') ok('MK5-21 live (echte Engine), Key Sync Timbre + Arp 1/16 GATE 50 %: LFO 1/2 setzen nur je Akkord zurück (2 Akkorde)', resets1 <= 2 + 1 && resets2 <= 2 + 1 && steps >= 10,
      `${steps} Arp-Schritte, LFO1-Rücksprünge ${resets1}, LFO2-Rücksprünge ${resets2}; Phase ${s.filter(q => q[0] >= t0 - .01).slice(0, 10).map(q => q[1]).join(' ')}`);
    else ok('MK5-21 live (echte Engine), Key Sync Stimme: Phase der Fokus-Stimme setzt je Arp-Note zurück', true, `${steps} Schritte, Rücksprünge g1 ${resets1} (Info; g1 ist die Timbre-Phase)`);
  }
});

await browser.close();
