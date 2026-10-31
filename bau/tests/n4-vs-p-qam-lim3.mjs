// QA musiker: Diagnose Spitzen-Schutz im Song ab Takt n – effektive Verstärkung um eine Spitze gegen die Hüllkurve
import {open, sleep, APP} from './n4-vs-p-qa-h.mjs';
import {sung, truePeakDb} from './n4-vs-p-lib.mjs';
const FILE = process.argv[2] || APP, BPM = +(process.argv[3] || 120);
const H = await open({file: FILE}), p = H.p;
await p.evaluate(b => { SYNQUENZER.newProject({init: true}); SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(b); }, BPM);
await sleep(300);
const sr = await p.evaluate(() => window.__ctx.sampleRate), bar = 240 / BPM, sec = 4 * bar;
const y = sung(sec, sr, -36, {seed: 5}).y, SP = [];
for (let t = 0.75; t < sec - 0.3; t += 1) { const i0 = Math.round(t * sr), n = Math.round(0.004 * sr); SP.push(i0); for (let j = 0; j < n; j++) y[i0 + j] = 0.98 * Math.sin(Math.PI * j / n) * Math.sign(Math.sin(2 * Math.PI * 250 * j / sr) + 1e-9); }
const pcm = Array.from(y, v => Math.max(-32768, Math.min(32767, Math.round(v * 32767)))), yq = Float32Array.from(pcm, v => v / 32767);
const r = await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 4}), [pcm, sr]);
await p.evaluate(() => { SYNQUENZER.vpInfo(); return SYNQUENZER.vpWait(); });
const st = await p.evaluate(() => SYNQUENZER.tkInfo().stimme), E = await p.evaluate(id => SYNQUENZER.vpEnv(id), r.id), env = E.env, K = E.K;
await p.evaluate(st => { SYNQUENZER.setTrackFx(st, 'vol', 1); const lanes = []; for (let i = 0; i < NT(); i++) lanes.push(i === st ? [{bar: 0, slot: 0}] : []); SYNQUENZER.setSong({bars: 4, lanes, carrier: [], mel: {}}); }, st);
console.log(await p.evaluate(() => SYNQUENZER.version), 'BPM', BPM, 'g', E.g.toFixed(3));
for (const from of [0, 1, 2, 3]) {
  await p.evaluate(st => { window.__cap('v', AU.tracks[st].cut); window.__cap('raw', AU.tracks[st].trackIn); }, st);
  // Stück-Infos mitschreiben
  await p.evaluate(f => { SYNQUENZER.songPlay(f); }, from);
  await sleep(700);
  const src = await p.evaluate(() => { const c = window.__ctx; return SYNQUENZER.vpInfo().src.map(s => ({start: +s.start.toFixed(5), G: +(s.G || 0).toFixed(3), lim: s.lim})).concat(TK.src.filter(r => !r.dead).map(r => ({off: +r.off.toFixed(5), when: +r.start.toFixed(5), cur: +c.currentTime.toFixed(4)}))); });
  await sleep((4 - from) * bar * 1000);
  const o = await p.evaluate(() => { const C = window.__capGet('v'), R2 = window.__capGet('raw'); return {L: Array.from(C.L), I: Array.from(R2.L), t0: C.t0, t1: R2.t0}; });
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(400);
  const L = Float32Array.from(o.L), I = Float32Array.from(o.I);
  // Ausgang/Eingang der Spur: effektive Verstärkung der Kette (Ausgang = Eingang × Fader × Pan); Eingang = nach Stück-Gain (enthält Hüllkurve)
  // Eingang trackIn = Quelle × lim × G → Verhältnis Eingang / (Take × g) = Hüllkurve, Take-Ausrichtung über die erste Spitze
  let i0 = -1; for (let i = 0; i < I.length; i++) if (Math.abs(I[i]) > 0.3) { i0 = i; break; }
  const sp = SP.find(s => s >= from * bar * sr); let best = null;
  for (let d = -300; d <= 300; d++) { let e = 0; for (let k = -2000; k < -200; k++) { const a = i0 + k, b = sp + k + d; if (a < 0 || b < 0) continue; e += I[a] * yq[b]; } if (!best || e > best.e) best = {d, e}; }
  const D = sp + best.d - i0;   // Take-Index = Eingangsindex + D
  // effektive Hüllkurve um die Spitze
  const rows = []; let worst = 0;
  for (let k = sp - 40; k < sp + Math.round(.004 * sr) + 20; k += 8) { const i = k - D; const x = yq[k]; if (Math.abs(x) < 0.05) continue; const ge = I[i] / (x * E.g), ee = env[Math.floor(k / K)]; rows.push(`${k - sp}:${ge.toFixed(3)}/${ee.toFixed(3)}`); }
  console.log(`  ab Takt ${from + 1}: D=${D} (Take ${(D / sr).toFixed(4)} s vor Eingang) Stücke ${JSON.stringify(src)}`);
  console.log('    Spitze: Sample: effektiv/Hüllkurve', rows.slice(0, 40).join(' '));
  const pk = SP.filter(s => s >= from * bar * sr + 1000).map(s => truePeakDb([L.subarray(s - D - 300, s - D + 500)]));
  console.log('    Ausgang wahre Spitze je Spitze', JSON.stringify(pk));
}
console.log('  Konsole:', JSON.stringify(H.errs.slice(0, 3)));
await H.br.close();
