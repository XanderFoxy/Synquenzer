// QA musiker: Spitzen-Schutz bei Stücken mit Versatz (Neu-Planung mitten im Clip, Song ab Takt 2, Szene neu gestartet) – jede Spitze ≤ −1 dBTP am STIMME-Ausgang (Pegel ganz auf)
import {open, sleep, b64, APP} from './n4-vs-p-qa-h.mjs';
import {sung, truePeakDb} from './n4-vs-p-lib.mjs';
const FILE = process.argv[2] || APP;
const H = await open({file: FILE}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject({init: true}); SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); SYNQUENZER.setBpm(120); });
await sleep(300);
const sr = await p.evaluate(() => window.__ctx.sampleRate);
const y = sung(8, sr, -36, {seed: 5}).y, SP = []; const CL = (() => { let s = 7, z = 0, m = 0; const n = Math.round(0.004 * sr), a = new Float32Array(n); for (let j = 0; j < n; j++) { s = (s * 16807) % 2147483647; const w = s / 2147483647 * 2 - 1; z = z + 0.5 * (w - z); a[j] = z; m = Math.max(m, Math.abs(z)); } for (let j = 0; j < n; j++) a[j] /= m; return a; })();
for (let k = 0; k < 8; k++) { const t = 0.75 + k, i0 = Math.round(t * sr), n = Math.round(0.004 * sr); SP.push(t); for (let j = 0; j < n; j++) y[i0 + j] = 0.98 * Math.sin(Math.PI * j / n) * (process.env.SPK === "clap" ? CL[j] : Math.sin(2 * Math.PI * 250 * j / sr)); }
const pcm = Array.from(y, v => Math.max(-32768, Math.min(32767, Math.round(v * 32767))));
const r = await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 4}), [pcm, sr]);
await p.evaluate(() => { SYNQUENZER.vpInfo(); return SYNQUENZER.vpWait(); });
const inf = await p.evaluate(id => SYNQUENZER.vpInfo().takes[id].heard, r.id);
console.log(FILE.split('/').slice(-2).join('/'), await p.evaluate(() => SYNQUENZER.version), 'Take', JSON.stringify(inf));
const st = await p.evaluate(() => SYNQUENZER.tkInfo().stimme);
await p.evaluate(st => SYNQUENZER.setTrackFx(st, 'vol', 1), st);
async function cas(name, startFn, sec) {
  await p.evaluate(st => { window.__cap('v', AU.tracks[st].cut); window.__cap('in', AU.tracks[st].trackIn); }, st);
  const t0 = await p.evaluate(startFn);
  await sleep(sec * 1000);
  const o = await p.evaluate(() => { const C = window.__capGet('v'), I = window.__capGet('in'); return {t0: C.t0, L: Array.from(C.L), I: Array.from(I.L), sr: window.__ctx.sampleRate}; });
  const src = await p.evaluate(() => SYNQUENZER.vpInfo().src); const verr = await p.evaluate(() => SYNQUENZER.vpInfo().err); console.log('    VP.err', verr, 'Stücke', JSON.stringify(src));
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(400);
  const L = Float32Array.from(o.L);
  // Spitzen finden: Fenster 20 ms um jede Stelle, an der der Ausgang > -12 dBFS geht
  const pk = []; let i = 0; const W = Math.round(0.02 * o.sr);
  while (i < L.length) { if (Math.abs(L[i]) > 0.25) { const a = Math.max(0, i - W), b = Math.min(L.length, i + W); pk.push([+(i / o.sr).toFixed(2), truePeakDb([L.subarray(a, b)])]); i += 2 * W; } else i++; }
  const tp = truePeakDb([L]); const II = Float32Array.from(o.I); const tpi = truePeakDb([II]); const pki = []; { let i = 0; while (i < II.length) { if (Math.abs(II[i]) > 0.25) { pki.push([+(i / o.sr).toFixed(2), truePeakDb([II.subarray(Math.max(0, i - W), i + W)])]); i += 2 * W; } else i++; } } console.log('    trackIn: TP', tpi, JSON.stringify(pki.filter(x => x[1] > -6)));
  console.log(`  ${name}: wahre Spitze gesamt ${tp} dBTP; Spitzen > −12 dBFS:`, JSON.stringify(pk.slice(0, 12)), tp <= -1 ? 'OK' : '✗ ÜBER −1 dBTP');
}
// A: Szene normal
await cas('A Szene von vorn', () => { SYNQUENZER.launchScene(0); return window.__ctx.currentTime; }, 9);
// B: Neu-Planung mitten im Clip (Take gewählt / Undo / Säubern-Weg: tkTrackResync)
await cas('B Neu-Planung bei 3,3 s', () => { SYNQUENZER.launchScene(0); setTimeout(() => tkTrackResync(SYNQUENZER.tkInfo().stimme), 3300); return 0; }, 9);
// C: Song ab Takt 2 (Stück beginnt mit Versatz 2 s)
await p.evaluate(st => { const lanes = []; for (let i = 0; i < NT(); i++) lanes.push(i === st ? [{bar: 0, slot: 0}] : []); SYNQUENZER.setSong({bars: 4, lanes, carrier: [], mel: {}}); }, st);
await cas('C Song ab Takt 2', () => { SYNQUENZER.songPlay(1); return 0; }, 7);
await cas('D Song ab Takt 3', () => { SYNQUENZER.songPlay(2); return 0; }, 5);
console.log('  Konsole:', JSON.stringify(H.errs.slice(0, 3)));
await H.br.close();
