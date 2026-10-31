// VS-P-05 (FP-DSP wie VS3/VS4): kein Knacken bei Schleife, Take-Wechsel, A/B Roh│Sauber, Säubern-Änderung, Stopp – und mit
// arbeitendem Spitzen-Schutz. Mitschnitt aller Ausgänge (ScriptProcessor), M-KLICK = 2. Differenz ≤ 1,5 × Krümmung des Tons.
import {open, sleep} from './v3-vs3-h.mjs';
const APP = process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-br-VSP/index.html';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
// Mitschnitt: Kanal 0 = alle Ausgänge (links), Kanal 1 = Bezugston 997 Hz direkt aus einem Oszillator – springt auch er an derselben
// Stelle, war es ein Aussetzer der Test-Umgebung (Audio-Faden unter Last / ScriptProcessor), nicht der App
const capOn = p => p.evaluate(() => { const ctx = window.__ctx, sp = ctx.createScriptProcessor(4096, 2, 2), A = [], B = [], mg = ctx.createChannelMerger(2), sum = ctx.createGain();
  sum.channelCount = 2; sum.channelCountMode = 'explicit'; for (const n of window.__outs) { try { n.connect(sum); } catch (e) {} }
  const sp1 = ctx.createChannelSplitter(2); sum.connect(sp1); sp1.connect(mg, 0, 0);
  const os = ctx.createOscillator(), og = ctx.createGain(); os.frequency.value = 997; og.gain.value = .5; os.connect(og); og.connect(mg, 0, 1); os.start();
  mg.connect(sp); sp.onaudioprocess = e => { A.push(new Float32Array(e.inputBuffer.getChannelData(0))); B.push(new Float32Array(e.inputBuffer.getChannelData(1))); };
  const z = ctx.createGain(); z.gain.value = 0; sp.connect(z); z.connect(ctx.destination); window.__cap = A; window.__capR = B; });
const capRes = p => p.evaluate(() => { const cat = b => { const n = b.reduce((a, x) => a + x.length, 0), y = new Float32Array(n); let o = 0; for (const x of b) { y.set(x, o); o += x.length; } return y; };
  const y = cat(window.__cap), rf = cat(window.__capR), n = y.length, cr = 0.5 * Math.pow(2 * Math.PI * 997 / window.__ctx.sampleRate, 2), bad = new Uint8Array(n);
  let envGl = 0; for (let i = 2; i < n; i++) if (Math.abs(rf[i] - 2 * rf[i - 1] + rf[i - 2]) > 1.5 * cr) { envGl++; for (let k = Math.max(0, i - 3); k < Math.min(n, i + 3); k++) bad[k] = 1; }
  let pk = 0, d2 = 0, at = 0, on = 0; for (let i = 2; i < n; i++) { const v = Math.abs(y[i]); if (v > pk) pk = v; if (v > 1e-3) on++; if (bad[i]) continue; const d = Math.abs(y[i] - 2 * y[i - 1] + y[i - 2]); if (d > d2) { d2 = d; at = i; } }
  const W = Math.round(window.__ctx.sampleRate * .01); let lp = 0; for (let i = Math.max(0, at - W); i < Math.min(n, at + W); i++) lp = Math.max(lp, Math.abs(y[i]));
  return {n, pk, d2, at, on, lp, envGl}; });
async function setup(file) { const H = await open({file}), p = H.p; await p.evaluate(() => { SYNQUENZER.newProject({init: true}); SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(120); }); await sleep(300); return {H, p, sr: await p.evaluate(() => window.__ctx.sampleRate)}; }
const res = [];
// S1: Schleife, Take-Wechsel mitten im Ton, Stopp (zwei Sinus-Takes 440/660 Hz)
{
  const {H, p, sr} = await setup(APP);
  const sine = f => { const x = []; for (let i = 0; i < sr * 2; i++) x.push(Math.round(Math.sin(2 * Math.PI * f * i / sr + 0.7) * 16000)); return x; };
  await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 1}), [sine(440), sr]);
  await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 1}), [sine(660), sr]);
  await p.evaluate(() => { SYNQUENZER.vpInfo(); return SYNQUENZER.vpWait(); });
  await capOn(p); await p.evaluate(() => SYNQUENZER.launchScene(0));
  await sleep(3300); await p.evaluate(() => SYNQUENZER.tkPick({t: SYNQUENZER.tkInfo().stimme, s: 0}, 1, false));
  await sleep(1500); await p.evaluate(() => SYNQUENZER.stop()); await sleep(600);
  const r = await capRes(p), curv = r.pk * Math.pow(2 * Math.PI * 660 / sr, 2);
  ok(r.on > sr * 3 && r.d2 <= 1.5 * curv, `Schleife + Take-Wechsel + Stopp: 2. Differenz ${r.d2.toFixed(5)} ≤ 1,5 × Krümmung ${curv.toFixed(5)} (Faktor ${(r.d2 / curv).toFixed(2)}, hörbar ${(r.on / sr).toFixed(1)} s, Spitze ${r.pk.toFixed(3)}; Aussetzer der Umgebung ${r.envGl})`);
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2))); await H.br.close();
}
// S2: A/B Roh│Sauber, neue Säubern-Stärke beim Spielen, Stopp (440 Hz, Säubern 100 → 40 %)
for (let run = 0; run < 2; run++) {
  const {H, p, sr} = await setup(APP), F = 440;
  const x = []; let s = 9; for (let i = 0; i < sr * 2; i++) { s = (s * 16807) % 2147483647; const nz = (s / 2147483647 - 0.5) * 6; x.push(Math.round((i < sr * 0.4 ? 0 : Math.sin(2 * Math.PI * F * i / sr + 0.7) * 16000 * Math.min(1, (i - sr * 0.4) / (sr * 0.02))) + nz)); }
  const r0 = await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 1}), [x, sr]);
  await p.evaluate(id => SYNQUENZER.clSet(id, 100), r0.id); await p.evaluate(id => SYNQUENZER.clWait(id), r0.id);
  await p.evaluate(() => { SYNQUENZER.vpInfo(); return SYNQUENZER.vpWait(); });
  await capOn(p); await p.evaluate(() => SYNQUENZER.launchScene(0));
  await sleep(2700); await p.evaluate(() => SYNQUENZER.clAB('roh'));
  await sleep(700); await p.evaluate(() => SYNQUENZER.clAB('sauber'));
  await sleep(700); await p.evaluate(() => SYNQUENZER.clAB('roh'));
  await sleep(500); await p.evaluate(() => SYNQUENZER.clAB('sauber'));
  await sleep(300); await p.evaluate(id => SYNQUENZER.clSet(id, 40), r0.id);
  await p.evaluate(id => SYNQUENZER.clWait(id), r0.id); await sleep(1200);
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(500);
  const r = await capRes(p), curv = r.pk * Math.pow(2 * Math.PI * F / sr, 2), vi = await p.evaluate(id => SYNQUENZER.vpInfo().takes[id], r0.id);
  ok(r.on > sr * 3 && r.d2 <= 1.5 * curv, `Lauf ${run + 1} A/B + Säubern 100 → 40 % + Stopp: 2. Differenz ${r.d2.toFixed(5)} ≤ 1,5 × ${curv.toFixed(5)} (Faktor ${(r.d2 / curv).toFixed(2)}; Ausgleich roh ${vi.raw && vi.raw.gDb} dB, gesäubert ${vi.heard && vi.heard.gDb} dB)`);
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2))); await H.br.close();
}
// S3: Spitzen-Schutz arbeitet (440 Hz leise, dazu zwei weiche 200-Hz-Stöße ×15 von 12 ms) – Schleife und Stopp
{
  const {H, p, sr} = await setup(APP), F = 440;
  const x = []; for (let i = 0; i < sr * 2; i++) { const t = i / sr; let v = Math.sin(2 * Math.PI * F * t + 0.7) * 0.061; for (const c of [0.5, 1.2]) { const u = t - c; if (u >= 0 && u < 0.012) v += 0.9 * Math.pow(Math.sin(Math.PI * u / 0.012), 2) * Math.sin(2 * Math.PI * 200 * u); } x.push(Math.round(v * 32767)); }
  const r0 = await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 1}), [x, sr]);
  await p.evaluate(() => { SYNQUENZER.vpInfo(); return SYNQUENZER.vpWait(); });
  const vi = await p.evaluate(id => SYNQUENZER.vpInfo().takes[id].heard, r0.id);
  await capOn(p); await p.evaluate(() => SYNQUENZER.launchScene(0));
  await sleep(4700); const lim = await p.evaluate(() => SYNQUENZER.vpInfo().src.some(s => s.lim)); await p.evaluate(() => SYNQUENZER.stop()); await sleep(500);
  const r = await capRes(p), curv = r.lp * Math.pow(2 * Math.PI * F / sr, 2);
  ok(lim && vi.lim > 0 && r.d2 <= 1.5 * curv, `Spitzen-Schutz aktiv (−${vi.grDb} dB, ${vi.lim} Abschnitte, GainNode im Stück: ${lim}): 2. Differenz ${r.d2.toFixed(5)} ≤ 1,5 × örtliche Krümmung ${curv.toFixed(5)} (Faktor ${(r.d2 / curv).toFixed(2)}, Spitze ${r.pk.toFixed(3)})`);
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2))); await H.br.close();
}
console.log(fail ? `\n${fail} FEHLER` : '\nALLE OK'); process.exit(fail ? 1 : 0);
