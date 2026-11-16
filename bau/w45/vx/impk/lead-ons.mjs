// IMPK: Einsätze des Gesang-Wegs an der synthetischen Vokal-Melodie (chr2/chr3, 120 BPM, 44,1 kHz) – Abstand zum wahren Ton-Anfang.
// Aufruf: node lead-ons.mjs <html> [sr]   (Kopie von vx/imp2b/work/lead-ons.mjs, Haken an peaks()/impkPeaks())
import fs from 'node:fs';
import { makeVoices } from '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vx/chr3/src/synth.mjs';
const core = f => { let H = fs.readFileSync(f, 'utf8'); const i = H.indexOf('function imp1Core() {'), j = H.indexOf('const IMP1 = {', i); let s = H.slice(i, j).replace(/const ons = (impkPeaks\(on, fps, fe\)|peaks\(on, fps\));/, m => m + ' if (globalThis.__ons) globalThis.__ons(ons, fps);'); return new Function(s + '\nreturn imp1Core;')()(); };
const SR = 44100, MEL = [[72, 1], [74, 1], [76, 2], [77, 1], [76, 1], [74, 2], [72, 1], [79, 1], [77, 1], [76, 1], [74, 2], [72, 2]];
const L = makeVoices({mel: MEL.map(([m, d]) => [m - 12, d]), iv: [0], sr: SR}).voices[0].y;
const q16 = Float32Array.from(L, s => Math.max(-32768, Math.min(32767, Math.round(s * 32767))) / 32768);
let tr = [0.25]; for (const [, d] of MEL) tr.push(tr[tr.length - 1] + d * .5); tr = tr.slice(0, -1);
globalThis.__ons = (ons, fps) => { const e = ons.map(o => { const k = tr.reduce((b, t, i) => Math.abs(t - o.t) < Math.abs(tr[b] - o.t) ? i : b, 0); return (o.t - tr[k]) * 1000; });
  console.log('fps', fps.toFixed(3), 'n', ons.length, 'davon > 40 ms daneben', e.filter(x => Math.abs(x) > 40).length); console.log(ons.map((o, i) => o.t.toFixed(3) + '(' + e[i].toFixed(0) + 'ms,w' + o.w.toFixed(1) + ')').join(' ')); };
const C = core(process.argv[2]); const r = C.analyse(q16, 44100, {}, () => {}); console.log('bpm', r.bpm, 'roh', r.bpmRoh, 't1', r.t1);
