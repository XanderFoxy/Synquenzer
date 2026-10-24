import {CONDS, melFor, renderContour} from './v3-vs2b-synth.mjs';
import {resample} from './v3-vs2b-real.mjs';
import {make} from './v3-vs2b-live.mjs';
const [file, cond, voice, seedS, a0, a1] = process.argv.slice(2);
process.argv[2] = file;
const c = CONDS[cond], seed = +seedS, base = voice === 'male' ? 52 : 64;
const notes = melFor(seed * 131 + base + cond.length, base, c), sig = renderContour(notes, {voice, seed, snr: c.snr});
const x = resample(sig.x, 16000, 48000), W = make(48000, {src: 'voice', lock: false});
const out = [[new Float32Array(128)]], z = new Float32Array(128); let last = -9, lines = [];
for (let i = 0; i + 128 <= x.length; i += 128) { globalThis.currentFrame = i; W.p.process([[x.subarray(i, i + 128)], [z]], out);
  const t = i / 48000; if (t < +a0 || t > +a1) continue; const rh = W.p.rh; const v = rh && rh.length ? rh[rh.length - 1] : NaN;
  const key = v + ':' + W.p.lit; if (key !== last) { last = key; lines.push(`${t.toFixed(3)} sm=${isNaN(v) ? '-' : v.toFixed(2)} lit=${W.p.lit} c=${W.p.cv && W.p.cv.length ? W.p.med(W.p.cv).toFixed(2) : '-'} dv=${W.p.dv.length}`); } }
console.log(notes.filter(n => n.on < +a1 && n.on + n.dur > +a0).map(n => JSON.stringify({on: +n.on.toFixed(3), d: +n.dur.toFixed(3), m: n.midi, g: n.glide, vib: n.vib && n.vib.map(v => +v.toFixed(2))})).join('\n'));
console.log(lines.join('\n'));
