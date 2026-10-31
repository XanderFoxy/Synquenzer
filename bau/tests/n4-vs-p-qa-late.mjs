// QA: erste Wiedergabe direkt nach einer Aufnahme (● REC mit 🎤, Transport danach gestoppt): setzt der Take pünktlich ein?
// Vergleich 4.23.0 (BASE) ↔ VS-P. Gemessen: Start des ersten STIMME-Stücks gegen den Clip-Anfang (Kontextzeit) + Mitschnitt.
import {open, micOn, sleep, APP, BASE, mysing, recMic} from './n4-vs-p-qa-h.mjs';
const BARS = +(process.argv[2] || 4), BPM = +(process.argv[3] || 120), CLP = +(process.argv[4] || 0);
for (const f of [BASE, APP]) {
  const H = await open({file: f}), p = H.p, sr = await micOn(p, 'wired');
  // Gesang setzt sofort am Takt-Anfang ein (t0 = 0.02 s)
  const y = mysing(BARS * 4 * 60 / BPM + 0.3, sr, -28, 77, {t0: 0.02}).y;
  const tk = await recMic(p, y, {len: BARS, bpm: BPM});
  const st0 = await p.evaluate(id => { const b = TK.buf.get(id); return {hasBuf: !!b, measured: typeof VP !== 'undefined' && b ? VP.m.has(b) : null, queued: typeof VP !== 'undefined' ? VP.q.length : null}; }, tk.id);
  if (CLP) { await p.evaluate(() => { SYNQUENZER.vpWait && SYNQUENZER.vpInfo(); }); await p.evaluate(() => SYNQUENZER.vpWait && SYNQUENZER.vpWait());
    await p.evaluate(([id, c]) => SYNQUENZER.clSet(id, c), [tk.id, CLP]); await p.waitForFunction(() => !CL.job.size && !CL.calc.size, null, {timeout: 120000}); await sleep(2000);
    console.log('  Säubern', CLP, '% fertig; gespielter Puffer = Roh?', await p.evaluate(id => tkPlayBuf(id, null) === tkBuffer(id), tk.id)); }
  await sleep(1500);
  // Szene starten (Transport stand) und das erste STIMME-Stück abfangen
  const r = await p.evaluate(async ([st]) => {
    const c = window.__ctx; window.__cap('v', AU.tracks[st].cut);
    const t0 = c.currentTime; SYNQUENZER.launchScene(2); for (let i = 0; i < NT(); i++) if (i !== st) R.slot[i] = -1;
    let first = null; const T = performance.now();
    while (performance.now() - T < 3000) { const s = TK.src.find(x => x.i === st && !x.dead); if (s) { first = {start: s.start, off: s.off, ain: s.o && s.o.a ? s.o.a.in : null}; break; } await new Promise(r => setTimeout(r, 2)); }
    await new Promise(r => setTimeout(r, 2500));
    const cl = S.tracks[st].clips[2], a = cl.audio, clipT = b2t(R.cstart[st] + a.at);
    const cap = window.__capGet('v'), sr = c.sampleRate, d = cap.L; let on = -1; for (let i = 0; i < d.length; i++) if (Math.abs(d[i]) > 0.003) { on = i; break; }
    SYNQUENZER.stop();
    const prof = []; { const k0 = Math.round((clipT - cap.t0) * sr), W = Math.round(0.02 * sr); for (let k = 0; k < 25; k++) { let e = 0; for (let i = k0 + k * W; i < k0 + (k + 1) * W; i++) e += (d[i] || 0) ** 2; prof.push(+(10 * Math.log10(e / W + 1e-20)).toFixed(1)); } }
    const pcs = TK.src.filter(x => x.i === st).map(x => ({G: x.G, lim: !!x.lim, start: +(x.start - clipT).toFixed(3), off: x.off}));
    return {prof, pcs, first, clipT, ain: a.in, onsetCap: on < 0 ? null : cap.t0 + on / sr, measuredNow: typeof VP !== 'undefined' ? VP.runs : null};
  }, [tk.st]);
  const lateMs = r.first ? (r.first.start - r.clipT) * 1000 : null, offMs = r.first ? (r.first.off - r.ain) * 1000 : null;
  console.log(`${await p.evaluate(() => SYNQUENZER.version)}: ${BARS} Takte @${BPM}: nach Aufnahme gemessen=${st0.measured} · erstes STIMME-Stück ${lateMs == null ? 'keins' : lateMs.toFixed(1) + ' ms nach Clip-Anfang, Versatz im Take +' + offMs.toFixed(1) + ' ms (Anfang fehlt)'}; hörbarer Einsatz ${r.onsetCap == null ? '-' : ((r.onsetCap - r.clipT) * 1000).toFixed(1) + ' ms nach Clip-Anfang'}`);
  console.log('  Pegel je 20 ms ab Clip-Anfang (dB):', r.prof.join(' ')); console.log('  Stücke', JSON.stringify(r.pcs));
  if (H.errs.length) console.log('Konsole', H.errs.slice(0, 2));
  await H.br.close();
}
