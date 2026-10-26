// QA MK5 probe H: MK5-13 / MK5-15 with a REAL part change (Teilwechsel) at the bar line: no hanging arp note
import { browser, T, ok, J } from './v3-qa-mk5-lib.mjs';
await T('MK5-13 Teil', async page => {
  const r = await page.evaluate(async () => {
    H.reset(); H.Q.setBpm(150); H.arp({on: 1, res: 1, gate: 100, type: 0, ks: 1});
    const spb_ = 60 / 150;
    H.Q.setClip(0, 0, {len: 1, notes: [60, 64, 67].map(n => ({t: 0, d: 4, n, v: .8}))});
    H.Q.setClip(0, 1, {len: 1, notes: [62, 65, 69].map(n => ({t: 0, d: 4, n, v: .8}))});
    const nt = S.tracks.length, sl0 = Array(nt).fill(null), sl1 = Array(nt).fill(null), sl2 = Array(nt).fill(null);
    sl0[0] = {s: 0}; sl1[0] = {s: 1}; sl2[0] = -1;
    H.Q.setPart(0, {name: 'A', slots: sl0}); H.Q.setPart(1, {name: 'B', slots: sl1}); H.Q.setPart(2, {name: 'C', slots: sl2});
    H.Q.launchPart(0); await H.sl(50); if (!R.playing) H.Q.play(); await H.sl(4 * 4 * spb_ * 1000 * .6);
    H.Q.launchPart(1); const b1 = Math.ceil(t2b(H.now()) / 4 + 1e-9) * 4; await H.sl(((b1 - t2b(H.now())) * spb_ + 1.0) * 1000);
    const nl = H.Q.noteLog(800).filter(e => e.src === 'arp');
    const after = nl.filter(e => e.beat >= b1 - 1e-3).map(e => e.out), over = nl.filter(e => e.beat < b1 - 1e-3 && e.beat + e.dur / spb_ > b1 + 1e-3).map(e => [e.beat, e.dur, e.out]);
    // part with the track off: the arp ends at the bar line
    H.Q.launchPart(2); const b2 = Math.ceil(t2b(H.now()) / 4 + 1e-9) * 4; await H.sl(((b2 - t2b(H.now())) * spb_ + spb_ / 4 + .35) * 1000);
    const late = H.Q.noteLog(800).filter(e => e.src === 'arp' && e.beat >= b2 - 1e-3).length;
    mkScopeOf(0); await H.sl(120); const s = mkScopeOf(0); const wv = s ? s.voices.filter(v => v.gate !== false).length : -1;
    const pi = H.Q.partInfo();
    H.Q.stop(); await H.sl(300); const end = H.Q.voices().filter(v => v.track === 0 && v.state !== 'released').length;
    return {b1, b2, after: after.slice(0, 8), afterBad: after.filter(n => ![62, 65, 69].includes(n)).length, over, late, wv, end, part: pi && pi.part && pi.part.i};
  });
  ok('MK5-13 Teilwechsel am Taktstrich (Teil A → B): ab dem Strich nur der neue Akkord, keine Note über den Strich', r.after.length >= 4 && r.afterBad === 0 && r.over.length === 0, J(r));
  ok('MK5-15 Teilwechsel auf „Spur aus“: kein Arp-Schritt nach dem Strich, 0 klingende Stimmen', r.late === 0 && r.wv <= 0 && r.end === 0, J({late: r.late, wv: r.wv, end: r.end}));
});
await browser.close();
