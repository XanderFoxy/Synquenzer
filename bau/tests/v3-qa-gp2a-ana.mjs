// offline: 2nd-difference click metric of the action run vs the base run (same song, no actions)
import fs from 'fs';
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-gp2a/';
const load = tag => { const b = fs.readFileSync(D + tag + '-audio.f32'); const x = new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4); const m = JSON.parse(fs.readFileSync(D + tag + '-meta.json')); return {x, m}; };
const blocks = (x, sr, ms = 10) => { const W = Math.round(sr * ms / 1000), out = []; for (let i = 2; i + W <= x.length; i += W) { let mx = 0; for (let k = i; k < i + W; k++) { const d = Math.abs(x[k] - 2 * x[k - 1] + x[k - 2]); if (d > mx) mx = d; } out.push(mx); } return out; };
const B = load('base'), L = load('long');
const sr = B.m.sr;
const bb = blocks(B.x, sr), lb = blocks(L.x, sr);
const pct = (a, q) => { const s = a.slice().sort((u, v) => u - v); return s[Math.floor(q * (s.length - 1))]; };
const tStopB = B.x.length / sr - 6, tStopL = L.x.length / sr - 6;
const bbp = bb.slice(0, Math.floor(tStopB * 100)), lbp = lb.slice(0, Math.floor(tStopL * 100));
console.log('base: max', Math.max(...bbp).toFixed(3), 'p99.9', pct(bbp, .999).toFixed(3), 'p99', pct(bbp, .99).toFixed(3));
console.log('long: max', Math.max(...lbp).toFixed(3), 'p99.9', pct(lbp, .999).toFixed(3), 'p99', pct(lbp, .99).toFixed(3));
const bmax = Math.max(...bbp);
const t0 = L.m.f0 / sr;
// blocks above the base maximum
const hi = []; lbp.forEach((v, j) => { if (v > bmax) hi.push({t: +(t0 + j * .01).toFixed(2), v: +v.toFixed(3)}); });
console.log('long blocks above base max', hi.length, JSON.stringify(hi.slice(0, 30)));
// per action: max in [ta, ta + 2 s]
for (const a of L.m.acts) { const j0 = Math.floor((a.t - t0) * 100), j1 = j0 + 200; const w = lb.slice(Math.max(0, j0), j1); const mx = Math.max(...w); console.log(a.n.padEnd(60), 'beat', a.b.toFixed(1), 'max2nd', mx.toFixed(3), mx > 1.5 * bmax ? '<<< > 1.5× base max' : ''); }
// level per second: compare long vs base RMS (dropouts/inaudible stretches)
const rms = (x, a, b) => { let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i]; return 10 * Math.log10(s / (b - a) + 1e-20); };
const lowL = []; for (let s = 1; s < tStopL - 1; s++) { const r = rms(L.x, s * sr, (s + 1) * sr); if (r < -30) lowL.push([s, +r.toFixed(1)]); }
console.log('long: seconds below -30 dBFS', JSON.stringify(lowL));
