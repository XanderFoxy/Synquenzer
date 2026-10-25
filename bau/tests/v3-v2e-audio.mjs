// V2e hörbar (Master-Mitschnitt per AudioWorklet): Bereich [Leeren] macht die Takte stumm (≥ 30 dB), Marken-Blatt [Löschen]
// lässt den Rest hörbar nachrücken, [×2] wiederholt die Marke hörbar, [Nur Name weg] ändert den Klang nicht; kein Knacks
import { open } from './v3-v2d-pw.mjs';
import { mkCheck } from './v3-v2d-lib.mjs';
import { SETUP } from './v3-v2d2-lib.mjs';
const {check, done} = mkCheck();
async function run(op) {
  const {b, p, errs} = await open();
  await p.evaluate(SETUP(true));
  const r = await p.evaluate(async op => {
    const Q = window.SYNQUENZER; ensureAudio(); const c = AU.ctx;
    const src = `class R extends AudioWorkletProcessor{process(i){const x=i[0]&&i[0][0];if(x)this.port.postMessage(x.slice(0));return true;}}registerProcessor('v2e-rec',R);`;
    await c.audioWorklet.addModule('data:application/javascript;base64,' + btoa(src));
    const n = new AudioWorkletNode(c, 'v2e-rec'); const buf = new Float32Array(c.sampleRate * 13); let k = 0, on = false, t0 = 0;
    n.port.onmessage = e => { if (!on) return; const d = e.data; for (let i = 0; i < d.length && k < buf.length; i++) buf[k++] = d[i]; };
    AU.analyser.connect(n);
    const strophe = Q.song().marks.find(m => m.part === 'P1').id;
    if (op === 'clear') Q.songRange('clear', 2, 3);
    else if (op === 'del') Q.markAction(strophe, 'delete');
    else if (op === 'rep') Q.markAction(strophe, 'rep', 2);
    else if (op === 'unname') Q.markAction(strophe, 'unname');
    Q.setBpm(240); Q.songPlay(0);
    await new Promise(r => setTimeout(r, 30)); on = true; t0 = c.currentTime;
    const st = R.startTime;
    await new Promise(r => setTimeout(r, 10600));
    on = false; Q.stop(); AU.analyser.disconnect(n);
    const x = buf.subarray(0, k), sr = c.sampleRate, off = Math.round((st - t0) * sr);
    const lvl = bar => { const a = off + Math.round((bar + .05) * sr), e = off + Math.round((bar + .95) * sr); let s = 0, m = 0; for (let i = Math.max(0, a); i < Math.min(x.length, e); i++) { s += x[i] * x[i]; m++; } return m ? +(10 * Math.log10(s / m + 1e-12)).toFixed(1) : null; };
    let d2 = 0; for (let i = 2; i < x.length; i++) d2 = Math.max(d2, Math.abs(x[i] - 2 * x[i - 1] + x[i - 2]));
    return {lv: Array.from({length: 10}, (_, i) => lvl(i)), d2: +d2.toFixed(4)};
  }, op);
  r.errs = errs; await b.close(); return r;
}
const base = await run('none'), clr = await run('clear'), del = await run('del'), rep = await run('rep'), unn = await run('unname');
console.log(JSON.stringify({base, clr, del, rep, unn}));
const near = (a, b, d = 3) => a != null && b != null && Math.abs(a - b) <= d;
check('hörbar: ohne Änderung klingen T1–T10', base.lv.every(v => v > -60), base.lv);
check('Bereich [Leeren] T3–4 → T3–4 ≥ 30 dB leiser, T1–2 und T5–10 wie vorher (±3 dB)', base.lv[2] - clr.lv[2] >= 30 && base.lv[3] - clr.lv[3] >= 30 && [0, 1, 4, 5, 6, 7, 8, 9].every(i => near(clr.lv[i], base.lv[i])), clr.lv);
check('Marken-Blatt [Löschen] STROPHE → ab T3 klingt, was vorher ab T7 klang (±3 dB)', [0, 1].every(i => near(del.lv[i], base.lv[i])) && [2, 3, 4, 5].every(i => near(del.lv[i], base.lv[i + 4])), del.lv);
check('Marken-Blatt [×2] → T7–10 klingen wie T3–6 (±3 dB)', [6, 7, 8, 9].every(i => near(rep.lv[i], base.lv[i - 4])) && [0, 1, 2, 3, 4, 5].every(i => near(rep.lv[i], base.lv[i])), rep.lv);
check('[Nur Name weg] ändert den Klang nicht (±1 dB)', unn.lv.every((v, i) => near(v, base.lv[i], 1)), unn.lv);
check('M-KLICK: größte 2. Differenz nach Leeren/Löschen ≤ 1,5 × ohne Änderung', clr.d2 <= 1.5 * base.d2 + 1e-4 && del.d2 <= 1.5 * base.d2 + 1e-4 && rep.d2 <= 1.5 * base.d2 + 1e-4, [base.d2, clr.d2, del.d2, rep.d2]);
check('0 Konsolenfehler', [base, clr, del, rep, unn].every(r => !r.errs.length), [base, clr, del, rep, unn].map(r => r.errs));
process.exit(done() ? 1 : 0);
