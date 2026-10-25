// QA V2e t7: edits while the song plays (touch, P1): ×2 / Löschen / Leeren mid-bar → no restart, no stuck note, effect at the
// next bar line; master capture: M-KLICK (HP 5 kHz, 2-ms windows ≤ +6 dB over the median ±20 ms, except 3 ms after onsets)
import { openVp, mk, SETUP, mkCheck } from './v3-qa-v2e-lib.mjs';
const {check, done} = mkCheck();
async function run(op) {
  const {b, p, errs, cdp} = await openVp('P1');
  const T = mk(p, cdp), {E} = T;
  await E(SETUP(true)); await E(() => window.SYNQUENZER.songView(true)); await p.waitForTimeout(300);
  await E(async () => {
    ensureAudio(); const c = AU.ctx;
    const src = `class R extends AudioWorkletProcessor{process(i){const x=i[0]&&i[0][0];if(x)this.port.postMessage(x.slice(0));return true;}}registerProcessor('qa-rec',R);`;
    await c.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src));
    const n = new AudioWorkletNode(c, 'qa-rec'); window.__buf = new Float32Array(c.sampleRate * 14); window.__k = 0; window.__on = false;
    n.port.onmessage = e => { if (!window.__on) return; const d = e.data; for (let i = 0; i < d.length && window.__k < window.__buf.length; i++) window.__buf[window.__k++] = d[i]; };
    AU.analyser.connect(n); window.__n = n;
  });
  // prepare the gesture: open the sheet / selection before playing
  if (op === 'rep' || op === 'del') await T.tapCv(3 * 36 + 10, 9);
  if (op === 'clear') { await T.tapCv(3 * 36 + 10, 9); await T.tapCv(3 * 36 + 10, 9); }   // bar 4 selected inside STROPHE
  await E(() => { const Q = window.SYNQUENZER; Q.setBpm(240); Q.clearLog(); Q.songPlay(0); window.__t0 = AU.ctx.currentTime; window.__on = true; window.__st = R.startTime; });
  await p.waitForFunction(() => { const s = window.SYNQUENZER.runtime().song; return s.beat != null && s.beat >= 13.5; }, null, {timeout: 20000, polling: 5});
  let at = null;
  if (op === 'rep') { const bt = await T.popBtn('×2'); at = await E(() => window.SYNQUENZER.runtime().song.beat); await T.tap(bt.x, bt.y, 30); }
  if (op === 'del') { const bt = await T.popBtn('Löschen'); at = await E(() => window.SYNQUENZER.runtime().song.beat); await T.tap(bt.x, bt.y, 30); }
  if (op === 'clear') { const m = await T.rect('#rangeBar [data-a="more"]'); at = await E(() => window.SYNQUENZER.runtime().song.beat); await T.tap(m.x + m.w / 2, m.y + m.h / 2, 120); await T.tapPop('Leeren', 30); }
  await p.waitForTimeout(5200);
  const r = await E(async () => {
    window.__on = false; const x = window.__buf.subarray(0, window.__k), sr = AU.ctx.sampleRate;
    const log = window.SYNQUENZER.noteLog(800).filter(n => n.beat != null).map(n => [n.track, n.out, +n.beat.toFixed(3), +(n.dur || 0).toFixed(3)]);
    window.SYNQUENZER.songPlay(false);
    // M-KLICK: one-pole-ish HP 5 kHz (biquad via OfflineAudioContext would be better; use 2nd order RBJ)
    const f0 = 5000, Q = .7071, w0 = 2 * Math.PI * f0 / sr, al = Math.sin(w0) / (2 * Q), cs = Math.cos(w0);
    const b0 = (1 + cs) / 2, b1 = -(1 + cs), b2 = (1 + cs) / 2, a0 = 1 + al, a1 = -2 * cs, a2 = 1 - al;
    const y = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < x.length; i++) { const v = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; }
    const W = Math.round(sr * .002), E = []; for (let i = 0; i + W <= y.length; i += W) { let s = 0; for (let j = i; j < i + W; j++) s += y[j] * y[j]; E.push(10 * Math.log10(s / W + 1e-14)); }
    const off = (window.__st - window.__t0) * sr, bps = 240 / 60;
    const onsets = log.map(l => off + (l[2]) / bps * sr);   // transport beats → samples (song started at transport 0?)
    const bad = [];
    for (let k = 10; k < E.length - 10; k++) {
      const nb = E.slice(k - 10, k + 11).filter((_, j) => j !== 10).sort((a, b) => a - b), med = nb[10];
      if (E[k] > med + 6 && E[k] > -70) { const s0 = k * W; if (!onsets.some(o => s0 >= o - W && s0 - o <= sr * .003 + W)) bad.push([+(s0 / sr).toFixed(3), +(E[k] - med).toFixed(1)]); }
    }
    AU.analyser.disconnect(window.__n);
    return {log, bad: bad.slice(0, 12), nbad: bad.length, len: x.length / sr, off: off / sr};
  });
  r.at = at; r.errs = errs; await b.close(); return r;
}
for (const op of ['none', 'rep', 'del', 'clear']) {
  const r = await run(op);
  const bass = r.log.filter(l => l[0] === 0).map(l => l[1] + '@' + l[2]);
  const dr = r.log.filter(l => l[0] === 4).map(l => l[1] + '@' + l[2]);
  console.log(op, 'at', r.at && r.at.toFixed(2), 'bass', bass.join(' '), '\n   drums', dr.join(' '), '\n   klick', r.nbad, JSON.stringify(r.bad), 'errs', r.errs.length);
  // duplicates (same track, same note, same beat) = a restart
  const keys = r.log.map(l => l[0] + ':' + l[1] + ':' + l[2]); const dup = keys.filter((k, i) => keys.indexOf(k) !== i);
  check(op + ': keine doppelten Anschläge (kein Neustart)', !dup.length, dup);
  check(op + ': M-KLICK ohne Treffer', r.nbad === 0, r.bad);
  check(op + ': 0 Konsolenfehler', !r.errs.length, r.errs);
}
process.exit(done() ? 1 : 0);
