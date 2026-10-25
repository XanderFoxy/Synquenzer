// QA V2e′ t12: drop while the song plays (L8: effective at the next bar line), audio continuity during drag/unfold
import { openVp, T, SETUP55, sleep, mkCheck } from './v3-qa-v2e2-lib.mjs';
const VP = process.argv[2] || 'P1';
const {check, done} = mkCheck();
const {b, p, errs, cdp} = await openVp(VP);
const t = T(p, cdp), E = t.E;
await E(SETUP55(false)); await E(() => window.SYNQUENZER.songView(true)); await sleep(300);
// capture audio
await E(async () => {
  ensureAudio(); const c = AU.ctx;
  const src = `class R extends AudioWorkletProcessor{process(i){const x=i[0]&&i[0][0];if(x)this.port.postMessage(x.slice(0));return true;}}registerProcessor('qa-rec',R);`;
  await c.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src));
  const n = new AudioWorkletNode(c, 'qa-rec'); window.__buf = new Float32Array(c.sampleRate * 30); window.__k = 0; window.__on = false;
  n.port.onmessage = e => { if (!window.__on) return; const d = e.data; for (let i = 0; i < d.length && window.__k < window.__buf.length; i++) window.__buf[window.__k++] = d[i]; };
  AU.analyser.connect(n); window.__recn = n; return 1;
});
await E(() => { const Q = window.SYNQUENZER; Q.setBpm(120); Q.clearLog(); window.__on = true; window.__t0 = AU.ctx.currentTime; Q.songPlay(0); window.__st = R.startTime; return 1; });
// wait into bar 4 (beat 12..16), song view open in P1: the part bar is not visible → go to the clip view to drag
await p.waitForFunction(() => window.SYNQUENZER.runtime().song.beat >= 12.3, null, {timeout: 20000, polling: 5});
await E(() => window.SYNQUENZER.songView(false)); await sleep(150);
const k0 = await t.key(0);
await t.down(k0.x, k0.y); await sleep(1120);
let inf = await t.info();
await t.glide(k0.x, k0.y, inf.canvas.x + 5 * 36 + 4 - inf.x0, inf.canvas.y + inf.canvas.h * .5, 8, 16);
const dn = await t.drag(); console.log('drag', JSON.stringify(dn));
await t.up(); await sleep(150);
const beatAtAsk = await E(() => window.SYNQUENZER.runtime().song.beat);
await t.tapPop('Einfügen');
const beatAtDrop = await E(() => window.SYNQUENZER.runtime().song.beat);
console.log('song beat at ask', beatAtAsk, 'at drop', beatAtDrop);
await p.waitForFunction(() => window.SYNQUENZER.runtime().song.beat >= 30, null, {timeout: 30000, polling: 5});
const res = await E(() => { window.__on = false; window.SYNQUENZER.songPlay(false);
  const log = window.SYNQUENZER.noteLog(600).filter(x => x.track === 0).map(x => ({b: +x.beat.toFixed(2), n: x.out, src: x.src}));
  const sr = AU.ctx.sampleRate, x = window.__buf.subarray(0, window.__k);
  // RMS per 50 ms, and 2nd-difference max
  const win = Math.round(sr * .05), rms = []; for (let i = 0; i + win <= x.length; i += win) { let s = 0; for (let j = i; j < i + win; j++) s += x[j] * x[j]; rms.push(+(10 * Math.log10(s / win + 1e-12)).toFixed(1)); }
  let d2 = 0, at = 0; for (let i = 2; i < x.length; i++) { const v = Math.abs(x[i] - 2 * x[i - 1] + x[i - 2]); if (v > d2) { d2 = v; at = i; } }
  return {log, rms, d2: +d2.toFixed(4), d2t: +(at / sr).toFixed(3), off: +(window.__st - window.__t0).toFixed(3), song: window.SYNQUENZER.song().marks.map(m => m.part + '@' + m.a)};
});
console.log('marks', res.song.join(' '));
console.log('bass log', res.log.map(x => x.b + ':' + x.n).join(' '));
// expected: from bar 5 (beat 20) the Strophe bass (45 → transposed by carrier Am F C G) at beats 20,22,24,26,...; bar 4 (beats 16–20) still REFRAIN bass (41 slot 2)
const before = res.log.filter(x => x.b >= 16 && x.b < 20), after = res.log.filter(x => x.b >= 20 && x.b < 36);
check(`${VP} L8: bar 5 starts the part (bass notes every 2 beats from beat 20)`, after.length >= 6 && after[0].b === 20, after.slice(0, 4));
// dropouts: any 50-ms window much quieter than its neighbours while playing (beats 4..30 = 2..15 s)
const r = res.rms, off = res.off; const dips = [];
for (let i = Math.ceil((off + 2.2) / .05); i < Math.min(r.length - 1, Math.floor((off + 14.5) / .05)); i++) if (r[i] < -70 && r[i - 1] > -50 && r[i + 1] > -50) dips.push([+(i * .05 - off).toFixed(2), r[i]]);
console.log('rms (2..15 s) min', Math.min(...r.slice(Math.ceil((off + 2.2) / .05), Math.floor((off + 14.5) / .05))), 'd2', res.d2, 'at', res.d2t);
check(`${VP} no dropout while dragging / dropping / unfolding`, dips.length === 0, dips);
check('0 console errors', errs.length === 0, errs);
await b.close();
process.exit(done());
