// V2d′ hörbar (Master-Mitschnitt per AudioWorklet): Ersetzen/Überschreiben schalten die alten Noten der Ziel-Spur hörbar stumm
// (≥ 30 dB), Overdub nicht; nach dem Bereich klingt der alte Inhalt wieder; kein Knacks (2. Differenz wie ohne Aufnahme)
import { open } from './v3-v2d-pw.mjs';
import { mkCheck } from './v3-v2d-lib.mjs';
const {check, done} = mkCheck();
async function run(mode) {
  const {b, p, errs} = await open();
  const r = await p.evaluate(async mode => {
    const Q = window.SYNQUENZER; Q.newProject({init: true}); ensureAudio(); const c = AU.ctx;
    const src = `class R extends AudioWorkletProcessor{process(i){const x=i[0]&&i[0][0];if(x)this.port.postMessage(x.slice(0));return true;}}registerProcessor('v2d2-rec',R);`;
    await c.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src));
    const n = new AudioWorkletNode(c, 'v2d2-rec'); const buf = new Float32Array(c.sampleRate * 14); let k = 0, on = false, t0 = 0;
    n.port.onmessage = e => { if (!on) return; const d = e.data; for (let i = 0; i < d.length && k < buf.length; i++) buf[k++] = d[i]; };
    AU.analyser.connect(n);
    const K = {root: 9, scale: 'aeolian'};
    Q.setClip(1, 0, {len: 1, key: K, notes: [{t: 0, d: 3.6, n: 57, v: .8}]});
    Q.setSong({bars: 5, lanes: [[], [{bar: 0, slot: 0}], [], [], [], []], carrier: [], mel: {}, melodyTrack: 5, marks: []});
    Q.setBpm(120); Q.selectTrack(1);
    if (mode === 'none') Q.songPlay(0);
    else if (mode === 'over') Q.songRecFrom({from: 1, mode: 'over', targets: {clips: false, chords: false, notes: true}, preroll: 1});
    else Q.songRecRange(1, 2, mode, {clips: false, chords: false, notes: true}, {preroll: 1});
    await new Promise(r => setTimeout(r, 30)); on = true; t0 = c.currentTime;
    const st = R.startTime;                                     // transport beat 0 = song bar 1 (the take starts at bar 2 with Vorlauf)
    await new Promise(r => setTimeout(r, 9200));
    if (mode === 'over') Q.songRecEnd();
    on = false; Q.stop(); AU.analyser.disconnect(n);
    const x = buf.subarray(0, k), sr = c.sampleRate, off = Math.round((st - t0) * sr);
    const lvl = bar => { const a = off + Math.round((bar * 2 + .4) * sr), e = off + Math.round((bar * 2 + 1.4) * sr); let s = 0, m = 0; for (let i = Math.max(0, a); i < Math.min(x.length, e); i++) { s += x[i] * x[i]; m++; } return m ? +(10 * Math.log10(s / m + 1e-12)).toFixed(1) : null; };
    let d2 = 0; for (let i = 2; i < x.length; i++) d2 = Math.max(d2, Math.abs(x[i] - 2 * x[i - 1] + x[i - 2]));
    return {lv: [0, 1, 2, 3, 4].map(lvl), d2: +d2.toFixed(4), secs: +(k / sr).toFixed(2)};
  }, mode);
  r.errs = errs; await b.close(); return r;
}
const base = await run('none'), rep = await run('replace'), ovd = await run('overdub'), ovr = await run('over');
console.log(JSON.stringify({base, rep, ovd, ovr}));
check('hörbar: ohne Aufnahme klingt die Spur in allen Takten', base.lv.every(v => v > -60), base.lv);
check('hörbar: Ersetzen T2–3 → Synth 2 in T2–3 ≥ 30 dB leiser, T1 und T4 wie vorher (±3 dB)', base.lv[1] - rep.lv[1] >= 30 && base.lv[2] - rep.lv[2] >= 30 && Math.abs(base.lv[0] - rep.lv[0]) <= 3 && Math.abs(base.lv[3] - rep.lv[3]) <= 3, rep.lv);
check('hörbar: Overdub → alle Takte wie ohne Aufnahme (±3 dB)', ovd.lv.every((v, i) => Math.abs(v - base.lv[i]) <= 3), ovd.lv);
check('hörbar: Überschreiben ab T2 → stumm bis zum Ende (≥ 30 dB)', [1, 2, 3].every(i => base.lv[i] - ovr.lv[i] >= 30) && Math.abs(base.lv[0] - ovr.lv[0]) <= 3, ovr.lv);
check('M-KLICK: größte 2. Differenz mit Stummschaltung ≤ 1,5 × ohne Aufnahme', rep.d2 <= 1.5 * base.d2 + 1e-4 && ovr.d2 <= 1.5 * base.d2 + 1e-4, [base.d2, rep.d2, ovr.d2]);
check('0 Konsolenfehler', [base, rep, ovd, ovr].every(r => !r.errs.length), [base, rep, ovd, ovr].map(r => r.errs));
process.exit(done() ? 1 : 0);
