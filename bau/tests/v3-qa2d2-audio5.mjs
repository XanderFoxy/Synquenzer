// QA V2d′: scenario A exactly (song 5.5 after Einfügen, 240 BPM), other tracks muted, capture at the master
import { openT, mk, SETUP } from './v3-qa2d2-lib.mjs';
const {check, done} = mk();
async function run(mode, pre) {
  const {b, p, errs} = await openT({width: 390, height: 844}, false);
  await p.evaluate(SETUP(true));
  const r = await p.evaluate(async ([mode, pre]) => {
    const Q = window.SYNQUENZER; ensureAudio(); const c = AU.ctx;
    for (let i = 0; i < S.tracks.length; i++) if (i !== 1) S.tracks[i].mute = true;
    const src = `class R extends AudioWorkletProcessor{process(i){const x=i[0]&&i[0][0];if(x)this.port.postMessage(x.slice(0));return true;}}registerProcessor('qa2d2-rec5',R);`;
    await c.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src));
    const n = new AudioWorkletNode(c, 'qa2d2-rec5'); const buf = new Float32Array(c.sampleRate * 12); let k = 0, on = false, t0 = 0;
    n.port.onmessage = e => { if (!on) return; const d = e.data; for (let i = 0; i < d.length && k < buf.length; i++) buf[k++] = d[i]; };
    AU.analyser.connect(n);
    Q.selectTrack(1); Q.clearLog();
    on = true; t0 = c.currentTime;
    if (mode === 'none') Q.songPlay(3);
    else Q.songRecFrom({from: 3, mode: 'over', targets: {clips: false, chords: false, notes: true}, preroll: pre});
    const st = R.startTime + (pre ? 4 * spb() : 0);                // transport time of song bar 4 (T4)
    await new Promise(r => setTimeout(r, 3200));
    const off = R.songPlay.off, log = Q.noteLog(100).filter(x => x.track === 1).map(x => [+(x.beat - off).toFixed(2), x.src, x.clipNote]);
    if (mode !== 'none') Q.songRecEnd();
    on = false; Q.stop(); AU.analyser.disconnect(n);
    const x = buf.subarray(0, k), sr = c.sampleRate, o = Math.round((st - t0) * sr), B = spb();
    const lvl = (a0, a1) => { const a = o + Math.round(a0 * sr), e = o + Math.round(a1 * sr); let s = 0, m = 0; for (let i = Math.max(0, a); i < Math.min(x.length, e); i++) { s += x[i] * x[i]; m++; } return m ? +(10 * Math.log10(s / m + 1e-12)).toFixed(1) : null; };
    return {T4: lvl(.01, B * .9), T5: lvl(4 * B + .01, 4 * B + B * .9), log};
  }, [mode, pre]);
  r.errs = errs; await b.close(); return r;
}
const base = await run('none', 0), a0 = await run('over', 0), a1 = await run('over', 1);
console.log(JSON.stringify({base, a0, a1}));
check('base: Synth 2 audible in T4, T5', base.T4 > -60 && base.T5 > -60, base);
check('Vorlauf aus: T4 first beat silent at the master', base.T4 - a0.T4 >= 30, {base: base.T4, a0: a0.T4, log: a0.log});
check('Vorlauf 1 Takt: T4 first beat silent at the master', base.T4 - a1.T4 >= 30, {base: base.T4, a1: a1.T4, log: a1.log});
process.exit(done() ? 1 : 0);
