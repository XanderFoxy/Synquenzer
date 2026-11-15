import {core, wav, RV, SRC} from './lib.mjs'; import {plops} from './synth.mjs'; import {plopMeas} from './meas.mjs';
import fs from 'fs';
const html = fs.readFileSync(process.argv[2], 'utf8'), a0 = html.indexOf('function vr1Make() {'), a1 = html.indexOf('\nconst VXR1 = {', a0);
const A = wav(RV + SRC[0]), sr = A.sr, v = A.x; const {x, P, T} = plops(v, sr);
for (const W of JSON.parse(process.argv[3])) for (const c of JSON.parse(process.argv[4])) {
  const K = new Function(html.slice(a0, a1).replace('function plopSin(z, g0, g1, sd, cut) {', 'function plopSin(z, g0, g1, sd, cut) { plopSin.W = ' + W + ';') + '\nreturn vr1Make;')()();
  const r = K.done(K.run(x, sr, {steps: {plop: c}})); const m = plopMeas(v, x, r.y, P, T, sr);
  console.log(W, JSON.stringify(c), 'red', m.red.join(' '), '| harm', m.harm.join(' '), '| ok', m.red.filter((d, k) => d >= 12 && Math.abs(m.harm[k]) <= 1).length); }
