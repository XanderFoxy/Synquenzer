import fs from 'node:fs'; import vm from 'node:vm';
const code = fs.readFileSync(process.argv[2], 'utf8'), ctx = {Math, Float32Array, Float64Array, Uint8Array, Int32Array, Map, Set, Array, Object, console};
vm.createContext(ctx); vm.runInContext(code + '\nthis.H=spk11bHits;this.Env=spk11bEnv;', ctx);
const n = process.argv[3] || 'hart', J = JSON.parse(fs.readFileSync('dump/' + n + '.json')), b = fs.readFileSync('dump/' + n + '.f32'), x = new Float32Array(b.buffer, b.byteOffset, b.length / 4);
const sr = J.sr, stepS = J.stepS, nS = Math.floor((x.length / sr - 0.1) / stepS), spb = Math.round(J.bar / stepS);
const hs = ctx.H(x, sr, stepS, nS, null, {spb}), A = ctx.Env(x, sr), {E, O, H, F} = A;
const lab = k => { const t = J.a0 + k * stepS, nr = a => a.some(u => Math.abs(u - t) <= 0.05); return (nr(J.truth.kick) ? 'K' : '') + (nr(J.truth.snare) ? 'S' : '') + (nr(J.truth.hat) ? 'h' : ''); };
const pk = [[], [], []], dk = [];
for (let k = 0; k < nS; k++) { const c = k * stepS, f0 = Math.max(0, Math.floor((c - 0.03) * sr / H)), f1 = Math.min(F - 1, Math.ceil((c + 0.035) * sr / H)); for (let bb = 0; bb < 3; bb++) { let m = 0, mf = f0; for (let f = f0; f <= f1; f++) if (O[bb][f] > m) { m = O[bb][f]; mf = f; } pk[bb].push(m); if (!bb) { let e0 = 0; for (let f = mf; f <= Math.min(F - 1, mf + 4); f++) e0 = Math.max(e0, E[0][f]); const f2 = Math.min(F - 1, mf + Math.round(0.1 * sr / H)); dk.push(e0 > 0 ? E[0][f2] / e0 : 1); } } }
const r97 = pk.map(a => { const s = a.slice().sort((p, q) => p - q); return s[Math.floor(0.97 * (s.length - 1))]; });
const got = new Map(); for (const h of hs) got.set(h.k, (got.get(h.k) || '') + h.w);
const from = +(process.argv[4] || 32), to = +(process.argv[5] || 64);
for (let k = from; k < to; k++) console.log(String(k % spb).padStart(2), (lab(k) || '-').padEnd(4), 'nl', (pk[0][k] / r97[0]).toFixed(2), 'nm', (pk[1][k] / r97[1]).toFixed(2), 'nh', (pk[2][k] / r97[2]).toFixed(2), 'm/l', (pk[1][k] / Math.max(1e-9, pk[0][k])).toFixed(2), 'dk', dk[k].toFixed(2), '→', got.get(k) || '');
console.log(JSON.stringify(hs.info));
