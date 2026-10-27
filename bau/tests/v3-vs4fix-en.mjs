import fs from 'fs';
import {DIR} from './v3-qa-vs4-h.mjs';
const core = await import('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-dsp/clean.mjs');
const rd = f => { const b = fs.readFileSync(f); return new Float32Array(b.buffer, b.byteOffset, b.length / 4); };
const mic = rd(DIR + '/cap-sat6-0-mic.f32'), ref = rd(DIR + '/cap-sat6-0-ref.f32'), sr = 44100, n = mic.length, OFF = +process.env.OFF;
const en = (y, a, b) => { let e = 0; for (let i = a; i < b; i++) e += y[i] * y[i]; return (10 * Math.log10(e / (b - a) + 1e-20)).toFixed(1); };
console.log('mic window', en(mic, OFF, n), 'per s', Array.from({length: Math.floor((n - OFF) / sr)}, (_, k) => en(mic, OFF + k * sr, OFF + (k + 1) * sr)).join(' '));
for (const o of JSON.parse(process.argv[2])) {
  const t0 = Date.now(), y = core.clean(mic, ref, sr, Object.assign({way: 'notes'}, o));
  console.log(JSON.stringify(o).padEnd(36), 'out', en(y, OFF, n), 'per s', Array.from({length: Math.floor((n - OFF) / sr)}, (_, k) => en(y, OFF + k * sr, OFF + (k + 1) * sr)).join(' '), Date.now() - t0, 'ms');
}
