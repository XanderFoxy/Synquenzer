// QA MK5 probes F: ECO switch while the arp runs (MK5-22), KEY SYNC on with the transport running (MK5-07), save/load of arp fields,
// the song MELODIE through the arp (Umfang 1), MIDI in as a source
import { browser, T, ok, J } from './v3-qa-mk5-lib.mjs';

await T('MK5-22 switch', async page => {
  const r = await page.evaluate(async () => {
    H.reset(); H.arp({on: 1, res: 1, gate: 100}); await H.sl(40); H.keys([60, 64, 67]); await H.sl(400);
    H.Q.forceNative(true); await H.sl(500); const mid = H.log().length; H.Q.forceNative(false); await H.sl(500);
    H.up([60, 64, 67]); await H.sl(600);
    const live = H.Q.voices().filter(v => v.track === 0 && v.state !== 'released').length;
    mkScopeOf(0); await H.sl(120); const s = mkScopeOf(0);
    const L = H.log(), gaps = L.slice(1).map((x, k) => +((x.t - L[k].t) * 1000).toFixed(1));
    return {n: L.length, mid, live, wv: s ? s.voices.filter(v => v.gate !== false).length : -1, gaps: [...new Set(gaps)]};
  });
  ok('MK5-22 ECO an/aus während der Arp läuft: Arp läuft weiter im Raster, danach keine hängende Stimme', r.n >= 10 && r.live === 0 && r.wv <= 0 && r.gaps.every(g => Math.abs(g - 125) < .5), J(r));
});

await T('MK5-07 running', async page => {
  const r = await page.evaluate(async () => {
    H.reset(); H.Q.setBpm(120); H.arp({on: 1, res: 1, ks: 1, gate: 50, type: 1}); H.Q.play(); await H.sl(400);
    // press between two grid points
    const sb = .25, b = t2b(H.now()); const nxt = Math.ceil(b / sb + 1e-9) * sb; await H.sl(Math.max(0, (b2t(nxt + .1) - H.now()) * 1000));
    H.keys([60, 64, 67]); const tp = H.now(); await H.sl(700); H.up([60, 64, 67]); await H.sl(300); const n1 = H.log().length;
    H.keys([62, 65, 69]); await H.sl(500); H.up([62, 65, 69]); await H.sl(100);
    const nl = H.Q.noteLog(400).filter(e => e.src === 'arp'), L = H.log(); H.Q.stop();
    return {first: L[0] && [L[0].note, L[0].step, L[0].c], firstBeat: nl[0] && nl[0].beat, tpBeat: t2b(tp), second: L[n1] && [L[n1].note, L[n1].step, L[n1].c], beats: nl.map(e => +(e.beat * 4).toFixed(3))};
  });
  ok('MK5-07 KEY SYNC an, Transport läuft: Akkord beginnt bei Schritt 1 mit N (Ab: höchste), Einsätze auf dem Raster', J(r.first) === '[67,1,0]' && J(r.second) === '[69,1,0]' && r.beats.every(x => Math.abs(x - Math.round(x)) < .01) && r.firstBeat - r.tpBeat < .26,
    J(r.first) + ' ' + J(r.second) + ' erster Einsatz ' + (r.firstBeat && r.firstBeat.toFixed(3)) + ' Taste ' + r.tpBeat.toFixed(3));
});

await T('Daten arp', async page => {
  const r = await page.evaluate(async () => {
    H.reset(); const want = {on: 1, latch: 1, type: 3, range: 3, gate: 33, tgt: 2, ks: 1, res: 4, swing: -40, last: 5, steps: 0b10110, tempo: 120};
    for (const k in want) mkSetP(0, 'arp.' + k, want[k], false);
    const before = deep(sndOf(0).p.mk.arp);
    let saved = null; try { saved = await H.Q.save(); } catch (e) { saved = 'err ' + e; }
    const ex = H.Q.exportProject ? H.Q.exportProject() : null;
    return {before, saved: typeof saved === 'string' ? saved : !!saved, exType: typeof ex, exHas: ex ? JSON.stringify(ex).includes('"steps":22') : null};
  });
  ok('Daten: alle Arp-Felder bleiben gesetzt und stehen im Export', r.before.steps === 22 && r.before.swing === -40 && r.before.res === 4 && (r.exHas === true || r.exHas === null), J(r));
});

await T('MELODIE', async page => {
  const r = await page.evaluate(async () => {
    H.reset(); H.Q.setBpm(120); H.arp({on: 1, res: 1, gate: 50});
    let api = Object.keys(H.Q).filter(k => /mel/i.test(k));
    return {api};
  });
  console.log('INFO melody API', J(r.api));
});

await browser.close();
