// VS-P-05 (FP-DSP wie VS3/VS4): kein Knacken bei Schleife, Take-Wechsel, A/B Roh│Sauber, Säubern-Änderung, Stopp – und mit
// arbeitendem Spitzen-Schutz. Mitschnitt aller Ausgänge (ScriptProcessor), M-KLICK = 2. Differenz ≤ 1,5 × Krümmung des Tons.
import {open, sleep} from './v3-vs3-h.mjs';
const APP = process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-br-VSP/index.html';
const BASE_APP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-base-B.html';
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
if (!process.env.ONLY4) {
// S1: Schleife, Take-Wechsel mitten im Ton, Stopp (zwei Sinus-Takes 440/660 Hz)
{
  const {H, p, sr} = await setup(APP);
  const sine = f => { const x = []; for (let i = 0; i < sr * 2; i++) x.push(Math.round(Math.sin(2 * Math.PI * f * i / sr + 0.7) * 16000)); return x; };
  await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 1}), [sine(440), sr]);
  await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 1}), [sine(660), sr]);
  await p.evaluate(() => { if (SYNQUENZER.vpInfo) { SYNQUENZER.vpInfo(); return SYNQUENZER.vpWait(); } });
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
  await p.evaluate(() => { if (SYNQUENZER.vpInfo) { SYNQUENZER.vpInfo(); return SYNQUENZER.vpWait(); } });
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
  await p.evaluate(() => { if (SYNQUENZER.vpInfo) { SYNQUENZER.vpInfo(); return SYNQUENZER.vpWait(); } });
  const vi = await p.evaluate(id => SYNQUENZER.vpInfo().takes[id].heard, r0.id);
  await capOn(p); await p.evaluate(() => SYNQUENZER.launchScene(0));
  await sleep(4700); const lim = await p.evaluate(() => SYNQUENZER.vpInfo().src.some(s => s.lim)); await p.evaluate(() => SYNQUENZER.stop()); await sleep(500);
  const r = await capRes(p), curv = r.lp * Math.pow(2 * Math.PI * F / sr, 2);
  ok(lim && vi.lim > 0 && r.d2 <= 1.5 * curv, `Spitzen-Schutz aktiv (−${vi.grDb} dB, ${vi.lim} Abschnitte, GainNode im Stück: ${lim}): 2. Differenz ${r.d2.toFixed(5)} ≤ 1,5 × örtliche Krümmung ${curv.toFixed(5)} (Faktor ${(r.d2 / curv).toFixed(2)}, Spitze ${r.pk.toFixed(3)})`);
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2))); await H.br.close();
}
}
// S4: neuer, noch ungemessener 16-Takt-Take kommt beim Spielen dazu (Overdub-Weg tkInject → tkTrackResync, wie ● REC beim Fertigwerden):
// Stille-Dauer (5-ms-Fenster < −40 dBFS) beim Wechsel und Knacken – 4.23.0 gegen VS-P
{
  const gaps = {};
  for (const f of [BASE_APP, APP]) {
    const {H, p, sr} = await setup(f);
    const sine = (fr, sec) => { const x = []; for (let i = 0; i < sr * sec; i++) x.push(Math.round(Math.sin(2 * Math.PI * fr * i / sr + 0.7) * 12000)); return x; };
    await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 16}), [sine(440, 32.5), sr]);
    await p.evaluate(() => { if (SYNQUENZER.vpInfo) { SYNQUENZER.vpInfo(); return SYNQUENZER.vpWait(); } });
    await capOn(p); await p.evaluate(() => SYNQUENZER.launchScene(0)); await sleep(1500);
    await p.evaluate(([pc, sr]) => { SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 16}); }, [sine(440, 32.5), sr]);
    await sleep(2500); const vi = await p.evaluate(() => SYNQUENZER.vpInfo ? SYNQUENZER.vpInfo() : {}); await p.evaluate(() => SYNQUENZER.stop()); await sleep(400);
    const r = await capRes(p), curv = r.pk * Math.pow(2 * Math.PI * 440 / sr, 2);
    const g = await p.evaluate(() => { const cat = b => { const n = b.reduce((a, x) => a + x.length, 0), y = new Float32Array(n); let o = 0; for (const x of b) { y.set(x, o); o += x.length; } return y; };
      const y = cat(window.__cap), W = Math.round(window.__ctx.sampleRate * .005); let i0 = 0; while (i0 < y.length && Math.abs(y[i0]) < 1e-3) i0++;
      let i1 = y.length - 1; while (i1 > 0 && Math.abs(y[i1]) < 1e-3) i1--; let n = 0;
      for (let i = i0 + 4 * W; i + W < i1 - 4 * W; i += W) { let e = 0; for (let k = i; k < i + W; k++) e += y[k] * y[k]; if (10 * Math.log10(e / W + 1e-20) < -40) n++; }
      return n * 5; });
    const v = await p.evaluate(() => SYNQUENZER.version); gaps[v] = g; gaps[v + 'k'] = r.d2 / curv;
    console.log(`  ${v}: neuer Take beim Spielen – Stille beim Wechsel ${g} ms, 2. Differenz Faktor ${(r.d2 / curv).toFixed(2)}` + (vi.deferred != null ? `, Neu-Planung ${vi.deferred} × abgewartet, längstes Häppchen ${vi.maxMs} ms` : ''));
    if (f === APP) ok(r.d2 / curv <= Math.max(1.5, 1.1 * gaps['4.23.0k']) && g <= gaps['4.23.0'] + 60, `neuer Take beim Spielen: Stille ${g} ms (4.23.0: ${gaps['4.23.0']} ms; Messen darf höchstens +60 ms kosten), 2. Differenz Faktor ${(r.d2 / curv).toFixed(2)} (4.23.0: ${gaps['4.23.0k'].toFixed(2)} – der Wechsel selbst ist VS3-Verhalten)`);
    ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2))); await H.br.close();
  }
}
console.log(fail ? `\n${fail} FEHLER` : '\nALLE OK'); process.exit(fail ? 1 : 0);
