// QA V2d′ audible check at the master (AudioWorklet capture): Überschreiben ab T2 / Ersetzen T2–3 with NOTEN Synth 2 and
// Vorlauf AUS (the transport starts right at the take's first bar) — the old Synth-2 notes must be silent from T2 on (K2-21)
import { openT, mk } from './v3-qa2d2-lib.mjs';
const {check, done} = mk();
async function run(mode) {
  const {b, p, errs} = await openT({width: 390, height: 844}, false);
  const r = await p.evaluate(async mode => {
    const Q = window.SYNQUENZER; Q.newProject({init: true}); ensureAudio(); const c = AU.ctx;
    const src = `class R extends AudioWorkletProcessor{process(i){const x=i[0]&&i[0][0];if(x)this.port.postMessage(x.slice(0));return true;}}registerProcessor('qa2d2-rec',R);`;
    await c.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src));
    const n = new AudioWorkletNode(c, 'qa2d2-rec'); const buf = new Float32Array(c.sampleRate * 12); let k = 0, on = false, t0 = 0;
    n.port.onmessage = e => { if (!on) return; const d = e.data; for (let i = 0; i < d.length && k < buf.length; i++) buf[k++] = d[i]; };
    AU.analyser.connect(n);
    const K = {root: 9, scale: 'aeolian'};
    Q.setClip(1, 0, {len: 1, key: K, notes: [{t: 0, d: 3.6, n: 57, v: .8}]});
    Q.setSong({bars: 5, lanes: [[], [{bar: 0, slot: 0}], [], [], [], []], carrier: [], mel: {}, melodyTrack: 5, marks: []});
    Q.setBpm(120); Q.selectTrack(1);
    on = true; t0 = c.currentTime;
    if (mode === 'none') Q.songPlay(1);
    else if (mode === 'over') Q.songRecFrom({from: 1, mode: 'over', targets: {clips: false, chords: false, notes: true}, preroll: 0});
    else Q.songRecRange(1, 2, 'replace', {clips: false, chords: false, notes: true}, {preroll: 0});
    const st = R.startTime;                                        // transport beat 0 = song bar 2 (T2) here
    await new Promise(r => setTimeout(r, 6500));
    if (mode === 'over') Q.songRecEnd();
    on = false; Q.stop(); AU.analyser.disconnect(n);
    const x = buf.subarray(0, k), sr = c.sampleRate, off = Math.round((st - t0) * sr);
    const lvl = (a0, a1) => { const a = off + Math.round(a0 * sr), e = off + Math.round(a1 * sr); let s = 0, m = 0; for (let i = Math.max(0, a); i < Math.min(x.length, e); i++) { s += x[i] * x[i]; m++; } return m ? +(10 * Math.log10(s / m + 1e-12)).toFixed(1) : null; };
    return {T2a: lvl(0, .3), T2: lvl(.05, 1.6), T3: lvl(2.05, 3.6), T4: lvl(4.05, 5.6)};
  }, mode);
  r.errs = errs; await b.close(); return r;
}
const base = await run('none'), ovr = await run('over'), rep = await run('replace');
console.log(JSON.stringify({base, ovr, rep}));
check('base: Synth 2 sounds in T2–T4', base.T2 > -60 && base.T3 > -60 && base.T4 > -60, base);
check('Überschreiben ab T2, Vorlauf aus: T2 silent (≥ 30 dB below base, first 0.3 s too)', base.T2 - ovr.T2 >= 30 && base.T2a - ovr.T2a >= 30, {base, ovr});
check('Ersetzen T2–3, Vorlauf aus: T2 silent (≥ 30 dB below base), T4 back', base.T2 - rep.T2 >= 30 && base.T2a - rep.T2a >= 30 && Math.abs(base.T4 - rep.T4) <= 3, {base, rep});
check('0 console errors', [base, ovr, rep].every(r => !r.errs.length), [base, ovr, rep].map(r => r.errs));
process.exit(done() ? 1 : 0);
