// Lücke beim Fertigwerden eines Takes (● REC mit 🎤 als Overdub beim Spielen): 4.23.0 gegen VS-P
import {open, micOn, sleep, waitBeat, idle, b64, APP, BASE} from './n4-vs-p-h.mjs';
for (const f of (process.argv[2] ? [process.argv[2]] : [BASE, APP])) {
  const H = await open({file: f}), p = H.p, sr = await micOn(p, 'wired');
  await p.evaluate(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); SYNQUENZER.setRecOptions({countIn: 0, length: 4}); SYNQUENZER.selectSlot(0, 2); });
  const tone = (fr, sec) => { const y = new Float32Array(Math.round(sec * sr)); for (let i = 0; i < y.length; i++) y[i] = 0.05 * Math.sin(2 * Math.PI * fr * i / sr) * (1 + 0.3 * Math.sin(2 * Math.PI * 3 * i / sr)); return y; };
  // erster Take (440 Hz), dann Stopp
  await p.evaluate(([b]) => { SYNQUENZER.play(); const c = SYNQUENZER.vsClock(); window.__fake.play(b, c.start + 4 * c.spb - 0.04); }, [b64(tone(440, 9))]);
  await waitBeat(p, 3.6); await p.evaluate(() => SYNQUENZER.rec()); await waitBeat(p, 21); await idle(p); await p.evaluate(() => SYNQUENZER.stop()); await sleep(500);
  // Overdub (660 Hz) beim Spielen, STIMME-Ausgang mitschneiden
  await p.evaluate(() => { const st = SYNQUENZER.tkInfo().stimme; window.__cap('v', AU.tracks[st].cut); SYNQUENZER.selectSlot(st, 2); });
  await p.evaluate(([b]) => { SYNQUENZER.play(); const c = SYNQUENZER.vsClock(); window.__fake.play(b, c.start + 4 * c.spb - 0.04); }, [b64(tone(660, 9))]);
  await waitBeat(p, 3.6); await p.evaluate(() => SYNQUENZER.rec()); await waitBeat(p, 21);
  await idle(p); await sleep(1500);
  const r = await p.evaluate(() => { const c = window.__capGet('v'), y = c.L, sr = window.__ctx.sampleRate, W = Math.round(sr * .005), lv = [];
    for (let i = 0; i + W < y.length; i += W) { let e = 0; for (let k = i; k < i + W; k++) e += y[k] * y[k]; lv.push(10 * Math.log10(e / W + 1e-20)); }
    // nach dem ersten Klang: längste Strecke < −40 dBFS (in 5-ms-Fenstern), außer am Anfang/Ende
    const on = lv.findIndex(v => v > -40); let last = lv.length - 1; while (last > 0 && lv[last] < -40) last--; let run = 0, best = 0, at = 0;
    for (let k = on; k <= last; k++) { if (lv[k] < -40) { run++; if (run > best) { best = run; at = k; } } else run = 0; }
    const zc = (a, b) => { let z = 0; for (let i = Math.max(1, a); i < b; i++) if ((y[i - 1] < 0) !== (y[i] < 0)) z++; return Math.round(z / 2 / ((b - a) / sr)); };
    const hz = []; for (let t = 0; t + 1 < y.length / sr; t += 1) hz.push(zc(Math.round(t * sr), Math.round((t + 1) * sr)));
    return {hz: hz.join(','), sec: +(y.length / sr).toFixed(1), gapMs: best * 5, atSec: +(at * W / sr).toFixed(2), v: SYNQUENZER.version, vp: SYNQUENZER.vpInfo ? (({deferred, gated, maxMs, sync}) => ({deferred, gated, maxMs, sync}))(SYNQUENZER.vpInfo()) : null, starts: SYNQUENZER.tkInfo().starts}; });
  console.log(JSON.stringify(r));
  await p.evaluate(() => SYNQUENZER.stop()); await H.br.close();
}
