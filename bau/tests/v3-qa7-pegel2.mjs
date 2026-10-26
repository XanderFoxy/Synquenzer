import * as Q from './v3-qa7-lib.mjs';
const {SR, render, vocSnd, noise, sine, rms, db, ok, welch, bandE} = Q;
const br = await Q.launch(); const {page} = await Q.openApp(br);
const base = await Q.baseMk(page);
const sec = 3;
// control: synth mode, same saw notes
for (const ev of [[[0, 'on', 48, .8]], [[0, 'on', 48, .8], [0, 'on', 52, .8], [0, 'on', 55, .8]]]) {
  const s = JSON.parse(JSON.stringify(base));
  const a = await render(page, s, ev, {sec, at: [[1.0, {set: {mkLim: 1}}]]}), b = await render(page, s, ev, {sec});
  console.log('Synth-Modus Säge', ev.length, 'Noten: Stufe 1 − Stufe 0 =', (db(rms(a.l, 1.5 * SR, 3 * SR)) - db(rms(b.l, 1.5 * SR, 3 * SR))).toFixed(2), 'dB');
}
// vocoder: sine modulator at a band centre, saw carrier: per band level change
const m = Float32Array.from(await page.evaluate(sec => SYNQUENZER.mkVowel({f0: 120, v: ['a'], seg: 3, sec, sr: 48000, rms: -20}), sec));
const s = vocSnd(base, {res: 64}, {mix: {o1: 127, o2: 0, n: 0}});
const a = await render(page, s, [[0, 'on', 48, .8]], {sec, inputs: {e2: m}, at: [[0, {set: {mkLim: 1}}]]}), b = await render(page, s, [[0, 'on', 48, .8]], {sec, inputs: {e2: m}});
const N = 16384, Pa = welch(a.l, SR, sec * SR, N), Pb = welch(b.l, SR, sec * SR, N);
const R = Q.R, rows = []; for (let k = 1; k <= 16; k++) { const lo = Math.sqrt(R[k + 2] * R[k + 3]), hi = Math.sqrt(R[k + 3] * R[k + 4]); rows.push(k + ':' + db(Math.sqrt(bandE(Pa, N, lo, hi) / bandE(Pb, N, lo, hi))).toFixed(1)); }
console.log('Vocoder RESO 64 Säge C3 Vokal a, Stufe1−Stufe0 je Bandbereich (dB):', rows.join(' '));
console.log('gesamt', (db(rms(a.l, SR, 3 * SR)) - db(rms(b.l, SR, 3 * SR))).toFixed(2), 'dB');
await br.close();
