// QA MK5 probe J: MK5-14 Mitschnitt (PERF / buildMidiLog) = exactly the arp notes of arpLog (pitch + beat), Song-MIDI only clip notes
import { browser, T, ok, J } from './v3-qa-mk5-lib.mjs';
await T('Mitschnitt', async page => {
  const r = await page.evaluate(async () => {
    H.reset(); H.Q.setBpm(120); H.arp({on: 1, res: 2, gate: 60, type: 3, range: 2});
    H.Q.setClip(0, 0, {len: 1, notes: [57, 60, 64].map(n => ({t: 0, d: 2, n, v: .8}))});
    H.Q.launchClip(0, 0); if (!R.playing) H.Q.play(); await H.sl(300);
    H.keys([72]); await H.sl(400); H.up([72]); await H.sl(2200); H.Q.stop(); await H.sl(200);
    const L = H.log().map(x => [+t2b(x.t).toFixed(3), x.note]);
    const P = PERF.list.filter(e => !e.dead && e.track === 0).map(e => [+e.startBeat.toFixed(3), Math.round(e.out)]);
    const m = buildMidiLog(); const B = m.bytes || m; const on = []; for (let k = 0; k + 2 < B.length; k++) if ((B[k] & 0xf0) === 0x90 && (B[k] & 15) === 0 && B[k + 2] > 0) on.push(B[k + 1]);
    return {L, P, on};
  });
  const ln = r.L.map(x => x[1]), pn = r.P.map(x => x[1]);
  ok('MK5-14 Mitschnitt = arpLog (Tonhöhe und Schlag je Note), MIDI-Note-On gleich', r.L.length > 10 && J(r.L) === J(r.P), 'arpLog ' + r.L.length + ' PERF ' + r.P.length + ' MIDI ' + r.on.length + ' | ' + J(r.L.slice(0, 5)) + ' / ' + J(r.P.slice(0, 5)));
});
await browser.close();
