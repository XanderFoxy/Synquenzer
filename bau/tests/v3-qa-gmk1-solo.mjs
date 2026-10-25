// QA G-MK1: final project of the 3-min run, each synth track solo for 12 s in scene 3; unexplained HF bursts per track
import {open, sleep, OUT, check, done, recStart} from './v3-qa-gmk1-tl.mjs';
import fs from 'fs';
const T = await open(); const {p, E, errs} = T;
const proj = fs.readFileSync(OUT + (process.argv[2] || 'long') + '-project.json', 'utf8');
await E(s => SYNQUENZER.importJSON(s), proj); await sleep(800);
const scene = +(process.argv[3] || 2);
const out = {};
for (const solo of [0, 1, 2, 3, 'all']) {
  await E(([solo, scene]) => { const Q = SYNQUENZER; for (let t = 0; t < 6; t++) Q.setMute(t, solo !== 'all' && t !== solo); Q.setBpm(112); Q.launchScene(scene); if (!Q.runtime().playing) Q.togglePlay(); }, [solo, scene]);
  await sleep(1500);
  await recStart(E, 16);
  await sleep(12000);
  const r = await E(() => {
    const Q = window.__q; try { AU.M.ceil.disconnect(Q.node); } catch (e) {} for (const x of SYNQUENZER.noteLog(4096)) Q.notes.set(x.seq, x);
    const sr = Q.sr, N = Q.n, x = Q.buf.subarray(0, N), t0 = Q.f0 / sr;
    const gapT = Q.gaps.filter(([a, b]) => b - a > 128).map(([a, b]) => [(a + 128 - Q.f0) / sr + t0 - .012, (b - Q.f0) / sr + t0 + .012]); const inGap = t => gapT.some(([a, b]) => t >= a && t <= b);
    const hp = (inp, f, q) => { const w = 2 * Math.PI * f / sr, a = Math.sin(w) / (2 * q), cw = Math.cos(w), b0 = (1 + cw) / 2, b1 = -(1 + cw), b2 = b0, a0 = 1 + a, a1 = -2 * cw, a2 = 1 - a; const y = new Float32Array(inp.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < inp.length; i++) { const v = (b0 * inp[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = inp[i]; y2 = y1; y1 = v; y[i] = v; } return y; };
    const h = hp(hp(x, 5000, .5412), 5000, 1.3066);
    const W = Math.round(sr * .002), e = []; for (let i = 0; i + W <= N; i += W) { let s = 0; for (let k = i; k < i + W; k++) s += h[k] * h[k]; e.push(s / W + 1e-20); }
    const ns = [...Q.notes.values()].filter(n => n.time != null && n.time > t0 - 1);
    const fl = [];
    for (let j = 10; j < e.length - 10; j++) { const t = t0 + j * W / sr; if (inGap(t)) continue; const nb = e.slice(j - 10, j + 11).filter((_, k) => k !== 10).sort((a, b) => a - b), med = nb[10]; const db = 10 * Math.log10(e[j] / med); if (db > 6 && e[j] > 1e-9) { const on = ns.some(n => t - n.time >= -.002 && t - n.time <= (n.track === 4 ? .04 : .02)); if (!on) { const offs = ns.filter(n => n.dur != null && t - (n.time + n.dur) >= -.002 && t - (n.time + n.dur) < .15).map(n => n.track + '@' + Math.round((t - n.time - n.dur) * 1000)); fl.push({t: +(t - t0).toFixed(3), db: +db.toFixed(1), lv: +(10 * Math.log10(e[j])).toFixed(1), offs}); } } }
    let s = 0; for (let i = 0; i < N; i++) s += x[i] * x[i];
    return {n: fl.length, rms: +(10 * Math.log10(s / N + 1e-20)).toFixed(1), fl: fl.slice(0, 8), notes: ns.length};
  });
  out[solo] = r; console.log('solo', solo, 'unexplained', r.n, 'rms', r.rms, 'notes', r.notes, JSON.stringify(r.fl.slice(0, 5)));
}
await E(() => SYNQUENZER.togglePlay());
console.log('errs', errs);
await T.br.close();
