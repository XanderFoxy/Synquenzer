// QA V2d′: fresh page, the take's START creates the AudioContext (first audio gesture); Überschreiben ab T4, NOTEN Synth 2,
// Vorlauf aus; capture at the master right after START; other tracks muted. Compare with an already running context.
import { openT, mk, SETUP } from './v3-qa2d2-lib.mjs';
const {check, done} = mk();
async function run(warm) {
  const {b, p, errs} = await openT({width: 390, height: 844}, false);
  await p.evaluate(SETUP(true));
  if (warm) { await p.evaluate(() => ensureAudio()); await p.waitForTimeout(400); }
  const r = await p.evaluate(async () => {
    const Q = window.SYNQUENZER;
    for (let i = 0; i < S.tracks.length; i++) if (i !== 1) S.tracks[i].mute = true;
    Q.selectTrack(1); Q.clearLog();
    Q.songRecFrom({from: 3, mode: 'over', targets: {clips: false, chords: false, notes: true}, preroll: 0});
    const c = AU.ctx, st = R.startTime;
    const src = `class R extends AudioWorkletProcessor{process(i){const x=i[0]&&i[0][0];if(x)this.port.postMessage({t:currentTime,x:x.slice(0)});return true;}}registerProcessor('qa2d2-rec6',R);`;
    await c.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src));
    const n = new AudioWorkletNode(c, 'qa2d2-rec6'); const chunks = [];
    n.port.onmessage = e => chunks.push(e.data);
    AU.analyser.connect(n);
    await new Promise(r => setTimeout(r, 900));
    Q.songRecEnd(); Q.stop(); AU.analyser.disconnect(n);
    // RMS between song beat 12 and 13 (T4 first beat) = transport [st, st + spb]
    let s = 0, m = 0, first = chunks.length ? chunks[0].t : null; const sr = c.sampleRate, B = spb();
    for (const ch of chunks) for (let i = 0; i < ch.x.length; i++) { const t = ch.t + i / sr; if (t >= st && t < st + B) { s += ch.x[i] * ch.x[i]; m++; } }
    return {db: m ? +(10 * Math.log10(s / m + 1e-12)).toFixed(1) : null, m, capStart: first != null ? +(first - st).toFixed(3) : null, log: Q.noteLog(20).filter(x => x.track === 1).map(x => [x.beat, x.src, x.clipNote])};
  });
  r.errs = errs; await b.close(); return r;
}
const warm = await run(true), cold = await run(false);
console.log(JSON.stringify({warm, cold}));
check('warm context: T4 first beat silent', warm.db != null && warm.db < -90, warm);
check('cold context (START = first audio gesture): T4 first beat silent', cold.db != null && cold.db < -90, cold);
process.exit(done() ? 1 : 0);
