// QA musiker: Spitzen-Schutz – Lage der Hüllkurve gegen die Spitze im Live-Ausgang, gemessen mit einem Dauerton (1 kHz) als Messträger
// node n4-vs-p-qam-lim9.mjs <app> <runs> <resync|song|scene>
import {open, sleep, APP} from './n4-vs-p-qa-h.mjs';
import {truePeakDb} from './n4-vs-p-lib.mjs';
const FILE = process.argv[2] || APP, RUNS = +(process.argv[3] || 4), MODE = process.argv[4] || 'resync';
const H = await open({file: FILE}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject({init: true}); SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(120); });
await sleep(300);
const sr = await p.evaluate(() => window.__ctx.sampleRate), N = 8 * sr, y = new Float32Array(N), A0 = 0.02;
for (let i = 0; i < N; i++) y[i] = A0 * Math.sin(2 * Math.PI * 1000 * i / sr);
const CL = (() => { let s = 7, z = 0, m = 0; const n = Math.round(0.004 * sr), a = new Float32Array(n); for (let j = 0; j < n; j++) { s = (s * 16807) % 2147483647; const w = s / 2147483647 * 2 - 1; z = z + 0.5 * (w - z); a[j] = z; m = Math.max(m, Math.abs(z)); } for (let j = 0; j < n; j++) a[j] /= m; return a; })();
const SPT = []; for (let k = 0; k < 8; k++) { const i0 = Math.round((0.75 + k) * sr); SPT.push(i0); for (let j = 0; j < CL.length; j++) y[i0 + j] += 0.95 * Math.sin(Math.PI * j / CL.length) * CL[j]; }
const pcm = Array.from(y, v => Math.max(-32768, Math.min(32767, Math.round(v * 32767))));
const r = await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 4}), [pcm, sr]);
await p.evaluate(() => { if (SYNQUENZER.vpInfo) { SYNQUENZER.vpInfo(); return SYNQUENZER.vpWait(); } });
const st = await p.evaluate(() => SYNQUENZER.tkInfo().stimme), E = await p.evaluate(id => SYNQUENZER.vpEnv ? SYNQUENZER.vpEnv(id) : {env: [1, 1], K: 16, g: 1}, r.id), env = E.env || [1, 1], K = E.K, g = E.g;
const envAt = n => { const b = n / K, i = Math.floor(b), f = b - i; if (i < 0 || i + 1 >= env.length) return 1; return env[i] * (1 - f) + env[i + 1] * f; };
await p.evaluate(st => { SYNQUENZER.setTrackFx(st, 'vol', 1); const lanes = []; for (let i = 0; i < NT(); i++) lanes.push(i === st ? [{bar: 0, slot: 0}] : []); SYNQUENZER.setSong({bars: 4, lanes, carrier: [], mel: {}}); }, st);
console.log(FILE.split('/').slice(-2).join('/'), await p.evaluate(() => SYNQUENZER.version), MODE, 'g', g.toFixed(3), 'min env', Math.min(...env).toFixed(3));
for (let run = 0; run < RUNS; run++) {
  await p.evaluate(st => window.__cap('in', AU.tracks[st].trackIn), st);
  const at = 1.6 + run * 0.29;
  if (MODE === 'resync') await p.evaluate(at => { SYNQUENZER.launchScene(0); setTimeout(() => tkTrackResync(SYNQUENZER.tkInfo().stimme), at * 1000); }, at);
  else if (MODE === 'song') await p.evaluate(b => SYNQUENZER.songPlay(b), 1 + run % 3);
  else await p.evaluate(() => SYNQUENZER.launchScene(0));
  await sleep(MODE === 'resync' ? at * 1000 + 2600 : 3200);
  const I = Float32Array.from(await p.evaluate(() => Array.from(window.__capGet('in').L)));
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(400);
  // Spitzen im Mitschnitt (> 0.3), Ton-Amplitude per 1-ms-RMS (×√2), Verlauf 3 … 60 ms nach der Spitze gegen die Hüllkurve
  const out = []; const W = Math.round(sr * 0.001);
  for (let i = 1; i < I.length - sr * 0.1; i++) {
    if (Math.abs(I[i]) < 0.3) continue;
    // Spitzen-Mitte: Maximum in den nächsten 4 ms
    let im = i; for (let k = i; k < i + CL.length; k++) if (Math.abs(I[k]) > Math.abs(I[im])) im = k;
    const tp = truePeakDb([I.subarray(i - 200, i + CL.length + 200)]);
    // Ton-Amplitude nach der Spitze
    const amp = []; for (let ms = 6; ms < 80; ms += 2) { const a = i + Math.round(ms / 1000 * sr); let s = 0; for (let k = a; k < a + W; k++) s += I[k] * I[k]; amp.push([ms, Math.sqrt(2 * s / W) / (A0 * g)]); }
    // welche Take-Position der Spitze passt zur gemessenen Erholung? Spitzen-Anfang im Take = SPT[j]; δ so, dass envAt(SPT[j] + (ms in samples) + δ) ≈ amp
    let best = null;
    for (const s0 of SPT) for (let d = -Math.round(.03 * sr); d <= Math.round(.03 * sr); d += 4) { let e = 0; for (const [ms, a] of amp) e += (envAt(s0 + Math.round(ms / 1000 * sr) + d) - a) ** 2; if (!best || e < best.e) best = {d, e, s0}; }
    out.push({t: +(i / sr).toFixed(3), tp, envVsAudioMs: +(best.d / sr * 1000).toFixed(2)});
    i += Math.round(sr * 0.3);
  }
  console.log(`  Lauf ${run} ${MODE === 'resync' ? 'Neu-Planung ' + at.toFixed(2) + ' s' : MODE === 'song' ? 'Song ab Takt ' + (2 + run % 3) : 'Szene'} (+ = Hüllkurve kommt später als die Spitze):`, JSON.stringify(out));
}
console.log('  Konsole', JSON.stringify(H.errs.slice(0, 2)));
await H.br.close();
