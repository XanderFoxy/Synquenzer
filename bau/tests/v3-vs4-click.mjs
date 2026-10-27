// FP-DSP: kein Knacken beim A/B Roh │ Sauber und beim Umschalten auf eine neu gesäuberte Fassung während des Spielens (Mitschnitt aller Ausgänge)
import {open, sleep} from './v3-vs3-h.mjs';
const APP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vs-br-VS4/index.html';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const runs = +(process.argv[2] || 3), all = [];
for (let run = 0; run < runs; run++) {
  const H = await open({file: APP}), p = H.p;
  await p.evaluate(() => { SYNQUENZER.newProject({init: true}); SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(120); });
  await sleep(300);
  const sr = await p.evaluate(() => window.__ctx.sampleRate), F = 440;
  const x = []; let s = 9; for (let i = 0; i < sr * 2; i++) { s = (s * 16807) % 2147483647; const nz = (s / 2147483647 - 0.5) * 6; x.push(Math.round((i < sr * 0.4 ? 0 : Math.sin(2 * Math.PI * F * i / sr + 0.7) * 16000 * Math.min(1, (i - sr * 0.4) / (sr * 0.02))) + nz)); }
  const r = await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 1}), [x, sr]);
  await p.evaluate(id => SYNQUENZER.clSet(id, 100), r.id); await p.evaluate(id => SYNQUENZER.clWait(id), r.id);
  await p.evaluate(() => { const ctx = window.__ctx, sp = ctx.createScriptProcessor(4096, 2, 2), buf = []; for (const n of window.__outs) { try { n.connect(sp); } catch (e) {} } sp.onaudioprocess = e => buf.push(new Float32Array(e.inputBuffer.getChannelData(0))); const g = ctx.createGain(); g.gain.value = 0; sp.connect(g); g.connect(ctx.destination); window.__cap = buf; window.__sp = sp; });
  await p.evaluate(() => SYNQUENZER.launchScene(0));
  await sleep(2700); await p.evaluate(() => SYNQUENZER.clAB('roh'));
  await sleep(700); await p.evaluate(() => SYNQUENZER.clAB('sauber'));
  await sleep(700); await p.evaluate(() => SYNQUENZER.clAB('roh'));
  await sleep(500); await p.evaluate(() => SYNQUENZER.clAB('sauber'));
  await sleep(300); await p.evaluate(id => SYNQUENZER.clSet(id, 40), r.id);          // neue Fassung wird gerechnet und eingeblendet
  await p.evaluate(id => SYNQUENZER.clWait(id), r.id); await sleep(1200);
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(500);
  const res = await p.evaluate(() => { const b = window.__cap, n = b.reduce((a, x) => a + x.length, 0), y = new Float32Array(n); let o = 0; for (const x of b) { y.set(x, o); o += x.length; }
    let pk = 0, d2 = 0, at = 0, on = 0; for (let i = 2; i < n; i++) { const v = Math.abs(y[i]); if (v > pk) pk = v; if (v > 1e-3) on++; if (i % 4096 < 2) continue; const d = Math.abs(y[i] - 2 * y[i - 1] + y[i - 2]); if (d > d2) { d2 = d; at = i; } }
    const big = []; for (let i = 2; i < n; i++) { if (i % 4096 < 2) continue; const d = Math.abs(y[i] - 2 * y[i - 1] + y[i - 2]); if (d > 0.0021) big.push([i, +(i / window.__ctx.sampleRate).toFixed(3), +d.toFixed(4), +y[i].toFixed(3)]); }
    let first = 0; while (first < n && Math.abs(y[first]) < 1e-3) first++;
    return {n, pk, d2, at, on, nb2: Array.from(y.subarray(at - 12, at + 12)).map(v => +v.toFixed(3)), big: big.slice(0, 20), nb: big.length, first: +(first / window.__ctx.sampleRate).toFixed(3)}; });
  console.log(JSON.stringify({first: res.first, nb: res.nb, big: res.big.slice(0, 4), around: res.nb2}));
  const curv = res.pk * Math.pow(2 * Math.PI * F / sr, 2);
  all.push(res.d2 / curv);
  ok(res.on > sr * 3 && res.d2 <= 1.5 * curv, `Lauf ${run + 1}: M-KLICK 2. Differenz ${res.d2.toFixed(5)} ≤ 1,5 × Krümmung ${curv.toFixed(5)} (Faktor ${(res.d2 / curv).toFixed(2)}; hörbar ${(res.on / sr).toFixed(1)} s, Spitze ${res.pk.toFixed(3)})`);
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.br.close();
}
console.log('Faktoren', all.map(v => v.toFixed(2)).join(' '));
console.log(fail ? `\n${fail} FEHLER` : '\nALLE OK'); process.exit(fail ? 1 : 0);
