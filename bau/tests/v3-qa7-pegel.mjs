import * as Q from './v3-qa7-lib.mjs';
const {SR, render, vocSnd, noise, rms, db, ok} = Q;
const br = await Q.launch(); const {page} = await Q.openApp(br);
const base = await Q.baseMk(page);
const sec = 3; const rows = []; let worst = 0;
for (const v of ['a', 'i', 'u']) {
  const m = Float32Array.from(await page.evaluate(([sec, v]) => SYNQUENZER.mkVowel({f0: 120, v: [v], seg: 3, sec, sr: 48000, rms: -20}), [sec, v]));
  for (const [nm, voc, t0, ev] of [
    ['INIT Säge C3+E3+G3', {}, {mix: {o1: 127, o2: 0, n: 0}}, [[0, 'on', 48, .8], [0, 'on', 52, .8], [0, 'on', 55, .8]]],
    ['RESO 64 Säge C3', {res: 64}, {mix: {o1: 127, o2: 0, n: 0}}, [[0, 'on', 48, .8]]],
    ['RESO 127 Säge C4', {res: 127}, {mix: {o1: 127, o2: 0, n: 0}}, [[0, 'on', 60, .8]]],
    ['RESO 64 Rauschen', {res: 64}, {mix: {o1: 0, o2: 0, n: 127}}, [[0, 'on', 48, .8]]]]) {
    const s = vocSnd(base, voc, t0);
    const a = await render(page, s, ev, {sec, inputs: {e2: m}, at: [[1.0, {set: {mkLim: 1}}]]});
    const b = await render(page, s, ev, {sec, inputs: {e2: m}});
    const d = db(rms(a.l, 1.5 * SR, 3 * SR) + 0) - db(rms(b.l, 1.5 * SR, 3 * SR));
    worst = Math.max(worst, Math.abs(d)); rows.push(`${nm}, Vokal ${v}: ${d >= 0 ? '+' : ''}${d.toFixed(2)} dB`);
  }
}
console.log(rows.join('\n'));
ok('MK7-11 Begrenzer Stufe 1 M-PEGEL ± 1 dB', worst <= 1, 'max |Δ| ' + worst.toFixed(2) + ' dB');
Q.summary(); await br.close();
