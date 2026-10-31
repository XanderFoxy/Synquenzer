// QA musiker: A/B Roh│Sauber beim Spielen mit einem 16-Takt-Take, in dem der Spitzen-Schutz arbeitet (Dauerton 440 Hz + Plosive).
// Gesucht: Lücke/Aussetzer beim Wechsel (neues Stück setzt zu spät ein), 2. Differenz (Knacken). node n4-vs-p-qam-ab.mjs <app> [plosive=1]
import {open, sleep, APP} from './n4-vs-p-qa-h.mjs';
const FILE = process.argv[2] || APP, PLO = process.argv[3] !== '0';
const H = await open({file: FILE}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject({init: true}); SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(120); });
await sleep(300);
const sr = await p.evaluate(() => window.__ctx.sampleRate), sec = 32, N = sec * sr, F = 440, A0 = 0.02;
const y = new Float32Array(N); let s = 9; for (let i = 0; i < N; i++) { s = (s * 16807) % 2147483647; y[i] = A0 * Math.sin(2 * Math.PI * F * i / sr + .7) + (s / 2147483647 - .5) * 2e-4; }
const BT = []; if (PLO) for (let t = 0.6; t < sec - 0.5; t += 2.4) { const i0 = Math.round(t * sr), n = Math.round(0.006 * sr); BT.push(t); for (let j = 0; j < n; j++) y[i0 + j] += 0.6 * Math.sin(Math.PI * j / n) * Math.sin(2 * Math.PI * 180 * j / sr); }
const pcm = Array.from(y, v => Math.max(-32768, Math.min(32767, Math.round(v * 32767))));
const r0 = await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 16}), [pcm, sr]);
await p.evaluate(id => SYNQUENZER.clSet(id, 100), r0.id); await p.evaluate(id => SYNQUENZER.clWait(id), r0.id);
await p.evaluate(() => { if (SYNQUENZER.vpInfo) { SYNQUENZER.vpInfo(); return SYNQUENZER.vpWait(); } });
await p.evaluate(() => SYNQUENZER.clAB('roh')); await sleep(200);
await p.evaluate(() => { if (SYNQUENZER.vpInfo) { SYNQUENZER.vpInfo(); return SYNQUENZER.vpWait(); } });
await p.evaluate(() => SYNQUENZER.clAB('sauber'));
const vi = await p.evaluate(id => SYNQUENZER.vpInfo ? SYNQUENZER.vpInfo().takes[id] : null, r0.id);
console.log(FILE.split('/').slice(-2).join('/'), await p.evaluate(() => SYNQUENZER.version), 'Plosive', BT.length, 'vp', JSON.stringify(vi));
const st = await p.evaluate(() => SYNQUENZER.tkInfo().stimme);
await p.evaluate(() => { const c = window.__ctx; window.__sw = []; const o0 = window.tkStartSrc; window.tkStartSrc = function (o) { const t0 = performance.now(), ct = c.currentTime; const rr = o0(o); window.__sw.push({ct: +ct.toFixed(4), when: rr ? +rr.start.toFixed(4) : null, ms: +(performance.now() - t0).toFixed(1)}); return rr; }; });
// Mitschnitt L = STIMME-Eingang, R = Bezugston aus Oszillator (Aussetzer der Umgebung erkennen)
await p.evaluate(st => { const ctx = window.__ctx, sp = ctx.createScriptProcessor(4096, 2, 2), mg = ctx.createChannelMerger(2), A = [], B = [];
  AU.tracks[st].trackIn.connect(mg, 0, 0); const os = ctx.createOscillator(), og = ctx.createGain(); os.frequency.value = 997; og.gain.value = .5; os.connect(og); og.connect(mg, 0, 1); os.start();
  mg.connect(sp); sp.onaudioprocess = e => { A.push(new Float32Array(e.inputBuffer.getChannelData(0))); B.push(new Float32Array(e.inputBuffer.getChannelData(1))); };
  const z = ctx.createGain(); z.gain.value = 0; sp.connect(z); z.connect(ctx.destination); window.__A = A; window.__B = B; window.__SP = sp; SYNQUENZER.launchScene(0); }, st);
// Wechsel zwischen den Plosiven (je 1,5 s nach einem Plosiv, wo der Schutz nicht wirkt)
const T0 = Date.now(); const tog = ['roh', 'sauber', 'roh', 'sauber', 'roh', 'sauber'];
for (let k = 0; k < tog.length; k++) { const at = 2.1 + k * 2.4 + 0.1; while (Date.now() - T0 < at * 1000) await sleep(5); await p.evaluate(v => SYNQUENZER.clAB(v), tog[k]); }
await sleep(1500);
const o = await p.evaluate(() => { window.__SP.onaudioprocess = null; const cat = b => { const n = b.reduce((a, x) => a + x.length, 0), y = new Float32Array(n); let k = 0; for (const x of b) { y.set(x, k); k += x.length; } return y; }; return {A: Array.from(cat(window.__A)), B: Array.from(cat(window.__B)), sw: window.__sw}; });
await p.evaluate(() => SYNQUENZER.stop());
const A = Float32Array.from(o.A), B = Float32Array.from(o.B), n = A.length;
// Umgebung: Bezugston-Sprünge
const cr = 0.5 * Math.pow(2 * Math.PI * 997 / sr, 2), bad = new Uint8Array(n); let envGl = 0;
for (let i = 2; i < n; i++) if (Math.abs(B[i] - 2 * B[i - 1] + B[i - 2]) > 1.5 * cr) { envGl++; for (let k = Math.max(0, i - 200); k < Math.min(n, i + 200); k++) bad[k] = 1; }
// Plosiv-Bereiche ausnehmen (−40 … +20 ms um jede Stelle > 0.15)
const plo = new Uint8Array(n); for (let i = 0; i < n; i++) if (Math.abs(A[i]) > 0.15) { for (let k = Math.max(0, i - Math.round(.04 * sr)); k < Math.min(n, i + Math.round(.02 * sr)); k++) plo[k] = 1; }
// 1-ms-Pegel des Tons; Lücke = Fenster < 30 % des Mittels der Nachbarn (±20 ms)
const W = Math.round(sr * 0.001), m = Math.floor(n / W), e = new Float32Array(m);
for (let k = 0; k < m; k++) { let s2 = 0; for (let i = k * W; i < k * W + W; i++) s2 += A[i] * A[i]; e[k] = Math.sqrt(s2 / W); }
const gaps = []; let started = false;
for (let k = 25; k < m - 25; k++) { if (bad[k * W] || plo[k * W]) continue; let nb = 0, c = 0; for (let j = k - 20; j <= k + 20; j++) if (Math.abs(j - k) > 3) { nb += e[j]; c++; } nb /= c; if (nb > 0.005 && e[k] < 0.3 * nb) { if (!gaps.length || k - gaps[gaps.length - 1][1] > 3) gaps.push([k, k]); else gaps[gaps.length - 1][1] = k; } }
// 2. Differenz außerhalb der Plosive
const curv = A0 * 6 * Math.pow(2 * Math.PI * F / sr, 2); let d2 = 0, at = 0; for (let i = 2; i < n; i++) { if (bad[i] || plo[i]) continue; const d = Math.abs(A[i] - 2 * A[i - 1] + A[i - 2]); if (d > d2) { d2 = d; at = i; } }
let lp = 0; for (let i = Math.max(0, at - 400); i < Math.min(n, at + 400); i++) if (!plo[i]) lp = Math.max(lp, Math.abs(A[i]));
const lcurv = lp * Math.pow(2 * Math.PI * F / sr, 2);
console.log('  Stücke beim Wechsel (ct, when, ms in tkStartSrc):', JSON.stringify(o.sw.filter(s => s.ms > 0).slice(0, 12)));
console.log('  Lücken im Ton (ms-Fenster, Länge ms):', JSON.stringify(gaps.map(([a, b]) => [+(a / 1000).toFixed(3), b - a + 1])), ' Aussetzer der Umgebung', envGl);
console.log(`  2. Differenz außerhalb der Plosive ${d2.toFixed(5)} bei ${(at / sr).toFixed(3)} s, örtliche Krümmung ${lcurv.toFixed(5)} → Faktor ${(d2 / lcurv).toFixed(2)}`);
console.log('  Konsole', JSON.stringify(H.errs.slice(0, 2)));
await H.br.close();
