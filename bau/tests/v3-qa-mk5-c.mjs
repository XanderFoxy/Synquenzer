// QA MK5 probes C: MK5-15 cleanup with held / latched keys (transport stopped and running), MK5-14 FANG with the arp
import { browser, T, ok, J } from './v3-qa-mk5-lib.mjs';

await T('MK5-15 held', async page => {
  const r = await page.evaluate(async () => {
    const out = {}, sp = () => 60 / S.bpm / 4;
    const sounding = async () => { mkScopeOf(0); await H.sl(120); const s = mkScopeOf(0); return s ? s.voices.filter(v => v.gate !== false).length : -1; };
    const check = async (name, o) => {
      H.reset(); H.Q.setBpm(120); H.arp({on: 1, res: 1, gate: 100, latch: o.latch ? 1 : 0}); if (o.play) { H.Q.play(); await H.sl(200); }
      await H.sl(40); H.keys([60, 64, 67]); await H.sl(450); if (o.latch) { H.up([60, 64, 67]); await H.sl(150); }
      const t = H.now(); await o.act(); await H.sl((sp() + .12) * 1000 + 80);
      const late = H.log().filter(x => x.t > t + sp() + .1).length, sv = await sounding();
      out[name] = {late, sounding: sv, arpLive: H.Q.voices().filter(v => v.track === 0 && v.src === 'arp' && v.state !== 'released').length};
      if (!o.latch) H.up([60, 64, 67]); S.tracks[0].mute = false; H.Q.stop(); H.Q.panic(); H.Q.setEngine(0, 'mk'); await H.sl(100);
    };
    await check('Transport steht, LATCH, ■ Stopp', {latch: 1, act: async () => H.Q.stop()});
    await check('Transport läuft, LATCH, ■ Stopp', {latch: 1, play: 1, act: async () => H.Q.stop()});
    await check('Transport steht, Tasten gehalten, Arp aus', {act: async () => H.arp({on: 0})});
    await check('Transport steht, Tasten gehalten, Spur stumm', {act: async () => { S.tracks[0].mute = true; UI.dirty.strip = true; }});
    await check('Transport steht, LATCH, Spur stumm', {latch: 1, act: async () => { S.tracks[0].mute = true; UI.dirty.strip = true; }});
    await check('Transport steht, LATCH, Engine-Wechsel', {latch: 1, act: async () => H.Q.setEngine(0, 'analog')});
    await check('Transport steht, LATCH, Panik', {latch: 1, act: async () => H.Q.panic()});
    return out;
  });
  for (const k in r) { const x = r[k]; ok('MK5-15 ' + k + ': kein Arp-Schritt nach ≤ 1 Schritt, 0 klingende Stimmen', x.late === 0 && x.sounding <= 0 && x.arpLive === 0, J(x)); }
});

await T('MK5-14 FANG', async page => {
  const r = await page.evaluate(async () => {
    H.reset(); H.Q.setBpm(120); H.arp({on: 1, res: 1, gate: 50}); H.Q.play(); await H.sl(300);
    const b0 = Math.ceil(t2b(H.now()) + 1e-9); await H.sl((b2t(b0) - H.now()) * 1000 + 2);
    H.keys([60, 64, 67]); await H.sl(1800); H.up([60, 64, 67]); await H.sl(300);
    const arpN = H.log().length;
    let res = null; try { res = H.Q.capture(); } catch (e) { res = 'err ' + e; }
    await H.sl(300);
    const clips = []; for (let s = 0; s < 8; s++) { const c = S.tracks[0].clips[s]; if (c) clips.push({s, notes: c.notes.map(n => n.n).sort((a, b) => a - b), dur: c.notes.map(n => +n.d.toFixed(2))}); }
    H.Q.stop();
    return {arpN, res: typeof res === 'object' ? J(res) : String(res), clips};
  });
  const c = r.clips[0];
  ok('MK5-14 FANG mit Arp: nimmt die gespielten Tasten auf (C E G als Akkord), keine Arp-Noten', c && J([...new Set(c.notes)]) === '[60,64,67]' && c.notes.length === 3, J(r));
});

await browser.close();
