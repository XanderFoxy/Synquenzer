// VS5b T3: heard e2e – Dehnen on a click take, output recorded: onsets on the 1/16 grid; A/B original off grid; mode switch while
// playing (wpSwitch, no hole); Audio folgt on a take without map → Dehnen
import {launch, open5, sleep, clicks, toI16, onsetsRise, SR} from './n4-vs-p-reg-gs7-v3-vs5b-h.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const br = await launch(null);
const H = await open5(br), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); }); await sleep(300);
const OFF = [12, -18, 30, -8, 45, -40, 20, 0, 22, -26, 15, -5];
const T = OFF.map((o, k) => 0.5 + k * 0.25 + o / 1000), x = clicks(T, 3.5);
async function playRec(sec) {
  await p.evaluate(() => { SYNQUENZER.stop(); window.__recOut(); });
  await p.evaluate(() => { SYNQUENZER.launchScene(1); SYNQUENZER.play(); });
  await sleep(sec * 1000);
  return p.evaluate(() => { SYNQUENZER.stop(); const a = window.__rec; let n = 0; for (const b of a) n += b.length; const y = new Float32Array(n); let o = 0; for (const b of a) { y.set(b, o); o += b.length; } window.__sp.disconnect(); return {y: Array.from(y), sr: window.__ctx.sampleRate}; });
}
await p.evaluate(() => SYNQUENZER.play()); await sleep(400); await p.evaluate(() => SYNQUENZER.stop()); await sleep(200);
const r1 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 1, len: 2}), toI16(x));
const id = r1.id;
await p.evaluate(id => SYNQUENZER.wpDetect(id), id);
await p.evaluate(r => SYNQUENZER.wpQuantize({t: r.track, s: 1}, {grid: '1/16', strength: 1, mode: 'stretch'}), r1);
await p.evaluate(id => SYNQUENZER.wpPlayed(id, 0, 1), id);
const rec = await playRec(4.5), YY = Float32Array.from(rec.y);
const on = onsetsRise(YY, rec.sr).slice(0, 12), iv = on.slice(1).map((t, k) => (t - on[k]) * 1000), offGrid = iv.map(v => Math.abs(v - Math.round(v / 125) * 125));
console.log('  intervals ms', iv.map(v => v.toFixed(1)).join(' '));
ok(on.length >= 10 && offGrid.filter(e => e <= 2.5).length >= iv.length - 1, 'heard (Dehnen 1/16): onset intervals on the grid ±2.5 ms: ' + offGrid.map(e => e.toFixed(1)).join(' '));
await p.evaluate(() => SYNQUENZER.wpAB(true)); await sleep(100);
const rec0 = await playRec(4.5), on0 = onsetsRise(Float32Array.from(rec0.y), rec0.sr).slice(0, 12), iv0 = on0.slice(1).map((t, k) => (t - on0[k]) * 1000);
ok(iv0.filter(v => Math.abs(v - Math.round(v / 125) * 125) > 5).length >= 6, 'A/B original heard: off grid ' + iv0.map(v => v.toFixed(1)).join(' '));
await p.evaluate(() => SYNQUENZER.wpAB(false));
// switch Scheiben ↔ Dehnen while playing: wpSwitch log, worst deviation ≤ 3 dB, no errors
await p.evaluate(() => { window.__recOut(); SYNQUENZER.launchScene(1); SYNQUENZER.play(); }); await sleep(700);
for (const m of ['slice', 'stretch', 'slice', 'stretch']) { await p.evaluate(([r, m]) => SYNQUENZER.wpMode({t: r.track, s: 1}, m), [r1, m]); await sleep(600); }
const sw = await p.evaluate(() => SYNQUENZER.wpSwitchInfo(true)); await p.evaluate(() => SYNQUENZER.stop());
const real = sw.filter(s => s.pairs > 0);
console.log('  switches', JSON.stringify(real.map(s => ({kind: s.kind, bad: s.bad, ms: s.ms}))));
ok(real.length >= 3 && real.every(s => s.bad <= 3 && s.ms < 20), 'mode switch while playing: ' + real.length + ' crossfaded version switches, worst ' + Math.max(...real.map(s => s.bad)).toFixed(2) + ' dB, main thread ≤ ' + Math.max(...real.map(s => s.ms)) + ' ms');
// Audio folgt on a take without map → Dehnen
await p.evaluate(id => SYNQUENZER.wpQuantize(id, {grid: 'off'}), id);
await p.evaluate(id => SYNQUENZER.setClip(5, 0, {len: 2, notes: [{t: 0.05, d: 0.4, n: 60, v: 0.8}, {t: 0.53, d: 0.4, n: 62, v: 0.8}], take: id}), id);
await p.evaluate(() => SYNQUENZER.quantizeClip(5, 0, {grid: '1/16'})); await sleep(400);
const WF = (await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).warp;
ok(WF && WF.mode === 'stretch', 'Audio folgt on a sung take without map → Dehnen (' + (WF && WF.mode) + ')');
ok(!H.errs.length, 'no console errors ' + JSON.stringify(H.errs.slice(0, 2)));
await br.close();
console.log(fail ? 'FAIL ' + fail : 'ALL OK');
