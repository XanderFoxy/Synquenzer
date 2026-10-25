// QA V2d′: scenario A at the master — 4-bar Synth-2 clip started at T3, Überschreiben ab T4 with Vorlauf aus
import { openT, mk } from './v3-qa2d2-lib.mjs';
const {check, done} = mk();
async function run(mode) {
  const {b, p, errs} = await openT({width: 390, height: 844}, false);
  const r = await p.evaluate(async mode => {
    const Q = window.SYNQUENZER; Q.newProject({init: true}); ensureAudio(); const c = AU.ctx;
    const src = `class R extends AudioWorkletProcessor{process(i){const x=i[0]&&i[0][0];if(x)this.port.postMessage(x.slice(0));return true;}}registerProcessor('qa2d2-rec2',R);`;
    await c.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src));
    const n = new AudioWorkletNode(c, 'qa2d2-rec2'); const buf = new Float32Array(c.sampleRate * 12); let k = 0, on = false, t0 = 0;
    n.port.onmessage = e => { if (!on) return; const d = e.data; for (let i = 0; i < d.length && k < buf.length; i++) buf[k++] = d[i]; };
    AU.analyser.connect(n);
    const K = {root: 9, scale: 'aeolian'};
    Q.setClip(1, 1, {len: 4, key: K, notes: [0, 4, 8, 12].map((t, i) => ({t, d: 3.6, n: 57 + i * 2, v: .8}))});
    Q.setSong({bars: 7, lanes: [[], [{bar: 2, slot: 1, re: 1}], [], [], [], []], carrier: [], mel: {}, melodyTrack: 5, marks: []});
    Q.setBpm(120); Q.selectTrack(1);
    on = true; t0 = c.currentTime;
    if (mode === 'none') Q.songPlay(3);
    else Q.songRecFrom({from: 3, mode: 'over', targets: {clips: false, chords: false, notes: true}, preroll: 0});
    const st = R.startTime;
    await new Promise(r => setTimeout(r, 4600));
    const log = Q.noteLog(100).filter(x => x.track === 1).map(x => [+x.beat.toFixed(2), x.src, x.clipNote]);
    if (mode !== 'none') Q.songRecEnd();
    on = false; Q.stop(); AU.analyser.disconnect(n);
    const x = buf.subarray(0, k), sr = c.sampleRate, off = Math.round((st - t0) * sr);
    const lvl = (a0, a1) => { const a = off + Math.round(a0 * sr), e = off + Math.round(a1 * sr); let s = 0, m = 0; for (let i = Math.max(0, a); i < Math.min(x.length, e); i++) { s += x[i] * x[i]; m++; } return m ? +(10 * Math.log10(s / m + 1e-12)).toFixed(1) : null; };
    return {T4a: lvl(0, .3), T4: lvl(.05, 1.6), T5: lvl(2.05, 3.6), log};
  }, mode);
  r.errs = errs; await b.close(); return r;
}
const base = await run('none'), ovr = await run('over');
console.log(JSON.stringify({base, ovr}));
check('base sounds', base.T4 > -60 && base.T5 > -60, base);
check('A at the master: T4 silent with Vorlauf aus', base.T4 - ovr.T4 >= 30 && base.T4a - ovr.T4a >= 30, {base, ovr});
check('noteLog agrees with what is heard (no clip note logged at 0 while silent)', !(ovr.T4 < -100 && ovr.log.some(x => x[1] === 'clip' && x[0] < 1)), ovr.log);
process.exit(done() ? 1 : 0);
