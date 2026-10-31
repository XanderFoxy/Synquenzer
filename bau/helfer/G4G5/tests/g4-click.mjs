// Kein Knacken: gehaltener Ton auf der STIMME-Spur, während des Spielens A/B ×4, Voreinstellung/Aus, Regler (Neurechnen) –
// Mitschnitt am Spur-Ausgang, 2. Differenz gegen die Krümmung des Tons
import {open, sleep, APP} from './h.mjs';
const FILE = process.argv[2] || APP;
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const H = await open({file: FILE}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject({init: true}); SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(120); }); await sleep(300);
const sr = await p.evaluate(() => window.__ctx.sampleRate), f = 330, n = sr * 8;
const pcm = Array.from({length: n}, (_, i) => Math.round(9000 * Math.sin(2 * Math.PI * f * i / sr) * Math.min(1, i / (0.05 * sr), (n - i) / (0.05 * sr))));
const r = await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 4}), [pcm, sr]);
for (let k = 0; k < 6; k++) { await p.evaluate(id => SYNQUENZER.g4Played(id), r.id); await sleep(150); await p.evaluate(() => SYNQUENZER.g4Wait(30000)); }
await p.evaluate(() => { window.__cap('v', AU.tracks[stimmeT()].cut); SYNQUENZER.launchScene(0); });
await sleep(1500);
const acts = [['A/B', () => SYNQUENZER.g4AB(true)], ['A/B', () => SYNQUENZER.g4AB(false)], ['A/B', () => SYNQUENZER.g4AB(true)], ['A/B', () => SYNQUENZER.g4AB(false)], ['Präsenz', () => SYNQUENZER.g4Set({pre: 7})], ['Aus', () => SYNQUENZER.g4Off()], ['Gesang Synthpop', () => SYNQUENZER.g4Preset()]];
for (const [nm, fn] of acts) { await p.evaluate(fn); await sleep(700); }
const c = await p.evaluate(() => { const c = window.__capGet('v'); return Array.from(c.L); });
await p.evaluate(() => SYNQUENZER.stop());
const x = Float32Array.from(c); let mx = 0, at = 0, pk = 0; const k0 = Math.round(0.3 * sr);
for (let i = k0; i < x.length - 2; i++) { const d = Math.abs(x[i + 1] - 2 * x[i] + x[i - 1]); if (d > mx) { mx = d; at = i; } pk = Math.max(pk, Math.abs(x[i])); }
const curv = pk * (2 * Math.PI * f / sr) ** 2 * 4;   // Krümmung eines Tons mit Pegel pk (Sinus: 2. Differenz ≈ A·ω²; ×4 Reserve für Obertöne der Kette)
ok(mx <= curv * 1.5, `2. Differenz max ${mx.toExponential(2)} bei ${(at / sr).toFixed(3)} s gegen Ton-Krümmung ${curv.toExponential(2)} (Soll ≤ 1,5×) – ${acts.length} Wechsel im Spielen`);
const sw = await p.evaluate(() => (WP.swLog || []).map(s => s.kind + ':' + s.bad));
console.log('  Überblendungen (wpSwitch):', sw.join(' '));
if (H.errs.length) ok(false, 'Konsolenfehler ' + H.errs.slice(0, 3));
await H.br.close(); console.log(fail ? `FEHLER: ${fail}` : 'ALLE OK'); process.exit(fail ? 1 : 0);
