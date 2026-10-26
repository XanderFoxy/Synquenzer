// FP-DSP: kein Knacken – Take-Wechsel (A/B) während des Spielens, Clip-Schleife, Stopp; Mitschnitt aller Ausgänge (ScriptProcessor)
import {open, sleep} from './v3-vs3-h.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const H = await open(), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject({init: true}); SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(120); });
await sleep(300);
const sr = await p.evaluate(() => window.__ctx.sampleRate);
const sine = f => { const n = sr * 2, x = []; for (let i = 0; i < n; i++) x.push(Math.round(Math.sin(2 * Math.PI * f * i / sr + 0.7) * 16000)); return x; };
const r1 = await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 1}), [sine(440), sr]);
await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 1}), [sine(660), sr]);
await p.evaluate(() => { const ctx = window.__ctx, sp = ctx.createScriptProcessor(4096, 2, 2), buf = []; for (const n of window.__outs) { try { n.connect(sp); } catch (e) {} } sp.onaudioprocess = e => buf.push(new Float32Array(e.inputBuffer.getChannelData(0))); const z = ctx.createGain(); z.gain.value = 0; sp.connect(z); z.connect(ctx.destination); window.__cap = buf; });
await p.evaluate(() => { window.__t0 = window.__ctx.currentTime; SYNQUENZER.launchScene(0); });
await sleep(3300);                                   // eine Schleifen-Grenze (2 s) liegt darin
await p.evaluate(() => SYNQUENZER.tkPick({t: SYNQUENZER.tkInfo().stimme, s: 0}, 1, false));   // A/B mitten im Ton
await sleep(1500);
await p.evaluate(() => SYNQUENZER.stop());
await sleep(600);
const res = await p.evaluate(() => { const b = window.__cap, n = b.reduce((a, x) => a + x.length, 0), y = new Float32Array(n); let o = 0; for (const x of b) { y.set(x, o); o += x.length; }
  let pk = 0, d2 = 0, at = 0; for (let i = 2; i < n; i++) { const v = Math.abs(y[i]); if (v > pk) pk = v; if (i % 4096 < 2) continue; /* Blockgrenze des Mitschnitts (ScriptProcessor verliert dort manchmal Samples) */ const d = Math.abs(y[i] - 2 * y[i - 1] + y[i - 2]); if (d > d2) { d2 = d; at = i; } }
  let on = 0; for (let i = 0; i < n; i++) if (Math.abs(y[i]) > 1e-3) on++;
  const big = []; for (let i = 2; i < n; i++) { if (i % 4096 < 2) continue; const d = Math.abs(y[i] - 2 * y[i - 1] + y[i - 2]); if (d > 0.01) big.push([i, +d.toFixed(3), +y[i - 2].toFixed(3), +y[i - 1].toFixed(3), +y[i].toFixed(3)]); }
  return {n, pk, d2, at, on, big: big.slice(0, 12), nb: big.length, first: b.slice(0, 3).map(x => x.length)}; });
console.log(JSON.stringify(res)); console.log(JSON.stringify(await p.evaluate(() => ({t0: window.__t0, st: SYNQUENZER.tkInfo().starts}))));
const curv = res.pk * Math.pow(2 * Math.PI * 660 / sr, 2);
ok(res.on > sr * 3, `Take klingt (${(res.on / sr).toFixed(1)} s hörbar, Spitze ${res.pk.toFixed(3)})`);
ok(res.d2 <= 1.5 * curv, `M-KLICK (2. Differenz) ${res.d2.toFixed(5)} ≤ 1,5 × Krümmung des 660-Hz-Tons ${curv.toFixed(5)} (Schleife, A/B, Stopp)`);
ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2)));
void r1;
await H.br.close();
console.log(fail ? `\n${fail} FEHLER` : '\nalles grün'); process.exit(fail ? 1 : 0);
