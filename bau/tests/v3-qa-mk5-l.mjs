// QA MK5 probe L: 40 s stress — 2 arp tracks, scene switches, live keys, edits of TYP/AUFLÖSUNG/LATCH/TEMPO while playing:
// no hanging voice (engine scope), no console error, the arp keeps sounding
import { browser, T, ok, J } from './v3-qa-mk5-lib.mjs';
await T('Stress', async page => {
  const r = await page.evaluate(async () => {
    H.reset(0); H.reset(1); H.Q.setBpm(128);
    H.arp({on: 1, res: 1, gate: 80, type: 2, range: 2}, 0); H.arp({on: 1, res: 0, gate: 40, type: 4, range: 1, ks: 1}, 1);
    const CH = [[60, 64, 67], [57, 60, 64], [53, 57, 60, 65], [55, 59, 62]];
    for (let s = 0; s < 3; s++) for (const t of [0, 1]) H.Q.setClip(t, s, {len: 1, notes: CH[(s + t) % 4].map(n => ({t: 0, d: 4, n: n - 12 * t, v: .8}))});
    H.Q.launchScene(0); H.Q.play(); await H.sl(500);
    let seed = 7; const rnd = () => { seed = (seed * 1103515245 + 12345) >>> 0; return seed / 4294967296; };
    const t0 = performance.now(); let maxLiveArp = 0, ops = [];
    while (performance.now() - t0 < 40000) {
      const x = rnd();
      if (x < .3) { const s = Math.floor(rnd() * 4); H.Q.launchScene(s === 3 ? 0 : s); ops.push('S' + s); }
      else if (x < .45) { const ns = CH[Math.floor(rnd() * 4)].map(n => n + 12); H.Q.selectTrack(0); H.keys(ns); await H.sl(300 + rnd() * 600); H.up(ns); ops.push('K'); }
      else if (x < .55) { H.arp({type: Math.floor(rnd() * 6)}, Math.floor(rnd() * 2)); ops.push('T'); }
      else if (x < .62) { H.arp({res: Math.floor(rnd() * 6)}, Math.floor(rnd() * 2)); ops.push('R'); }
      else if (x < .68) { H.arp({latch: rnd() < .5 ? 1 : 0}, 0); ops.push('L'); }
      else if (x < .72) { H.Q.setBpm(100 + Math.floor(rnd() * 60)); ops.push('B'); }
      else if (x < .76) { H.Q.stopTrackNow(Math.floor(rnd() * 2)); ops.push('X'); }
      else if (x < .8) { const t = Math.floor(rnd() * 2); S.tracks[t].mute = true; UI.dirty.strip = true; await H.sl(900); S.tracks[t].mute = false; UI.dirty.strip = true; ops.push('M'); }
      await H.sl(400 + rnd() * 900); ops.push("[" + H.Q.arpLog(0).length + (S.tracks[0].mute ? "m" : "") + "," + (R.slot[0]) + "," + (ARPC.info(0) ? ARPC.info(0).held : "-") + "]");
      // hanging check while running: an arp proxy older than 2.5 s that is not released
      const now = H.now(); const old = VOICES.filter(v => !v.dead && v.src === 'arp' && v.state !== 'released' && now - v.start > 2.5).length; maxLiveArp = Math.max(maxLiveArp, old);
    }
    S.tracks[0].mute = false; S.tracks[1].mute = false; H.arp({latch: 0}, 0);
    const n0 = H.Q.arpLog(0).length, n1 = H.Q.arpLog(1).length;
    H.Q.stop(); await H.sl(1500);
    const sc = []; for (const t of [0, 1]) { mkScopeOf(t); } await H.sl(150); for (const t of [0, 1]) { const s = mkScopeOf(t); sc.push(s ? s.voices.filter(v => v.gate !== false).length : -1); }
    const pv = H.Q.voices().filter(v => v.state !== 'released').length;
    return {ops: ops.join(''), n0, n1, maxLiveArp, sc, pv, tickErr: H.Q.tickErrors ? H.Q.tickErrors() : null};
  });
  ok('Stress 40 s (Szenen, Tasten, TYP/AUFLÖSUNG/LATCH/TEMPO, Spur-Stopp, stumm): keine hängende Arp-Stimme, nach Stopp 0 Stimmen, keine tick-Fehler', r.maxLiveArp === 0 && r.sc.every(x => x <= 0) && r.pv === 0 && r.n0 > 50 && r.n1 > 50 && (!r.tickErr || !r.tickErr.n), J(r));
});
await browser.close();
