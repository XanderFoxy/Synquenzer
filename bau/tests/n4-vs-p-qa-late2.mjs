// QA: Aufnahme endet beim Spielen (Länge n), Transport läuft weiter: setzt der neue Take beim ersten Durchgang pünktlich ein?
import {open, micOn, sleep, APP, BASE, mysing, waitBeat, b64} from './n4-vs-p-qa-h.mjs';
const BARS = +(process.argv[2] || 4), BPM = +(process.argv[3] || 40);
for (const f of [BASE, APP]) {
  const H = await open({file: f}), p = H.p, sr = await micOn(p, 'wired');
  const y = mysing(BARS * 4 * 60 / BPM + 0.3, sr, -28, 78, {t0: 0.02}).y;
  await p.evaluate(([len, bpm]) => { SYNQUENZER.setBpm(bpm); SYNQUENZER.setMetronome(false); SYNQUENZER.setRecOptions({countIn: 0, length: len}); SYNQUENZER.selectSlot(0, 2); }, [BARS, BPM]);
  await p.evaluate(([b]) => { SYNQUENZER.play(); const c = SYNQUENZER.vsClock(); window.__fake.play(b, c.start + 4 * c.spb - 0.04); }, [b64(y)]);
  await waitBeat(p, 3.6); await p.evaluate(() => SYNQUENZER.rec());
  // Stücke der STIMME-Spur mitschreiben
  await p.evaluate(() => { window.__pcs = []; window.__iv = setInterval(() => { for (const s of TK.src) if (!s.dead && !window.__pcs.some(x => x.key === s.key && Math.abs(x.start - s.start) < 1e-6)) window.__pcs.push({key: s.key, start: s.start, off: s.off, ain: s.o && s.o.a ? s.o.a.in : null, t: window.__ctx.currentTime}); }, 3); });
  await waitBeat(p, 4 + BARS * 4 * 2 + 1);
  const r = await p.evaluate(() => { clearInterval(window.__iv); const st = SYNQUENZER.tkInfo().stimme, cl = S.tracks[st].clips[2]; return {st, slot: R.slot[st], pcs: window.__pcs, ain: cl && cl.audio ? cl.audio.in : null, cs: R.cstart[st], clipStartT: b2t(R.cstart[st]), sp: spb(), len: cl ? cl.len : null}; });
  await p.evaluate(() => SYNQUENZER.stop());
  console.log(await p.evaluate(() => SYNQUENZER.version), `${BARS} Takte @${BPM}: STIMME-Slot ${r.slot}`);
  for (const x of r.pcs) { const L = r.len * 4 * r.sp, k = Math.round((x.start - r.clipStartT) / L), exp = r.clipStartT + k * L; console.log(`   Stück ${x.key.slice(0, 30)} Start ${(x.start - exp) * 1000 >= 0 ? '+' : ''}${((x.start - exp) * 1000).toFixed(1)} ms gegen Durchgang-Anfang, Versatz im Take ${((x.off - r.ain) * 1000).toFixed(1)} ms`); }
  await H.br.close();
}
