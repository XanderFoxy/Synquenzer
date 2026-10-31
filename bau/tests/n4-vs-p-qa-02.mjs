// QA VS-P-02: Demo-Projekt, Gesang über das echte Mikro (● REC mit 🎤 auf MELODIE, Szene 1), alle Regler Standard → Lautheit je Spur-Ausgang
import {open, micOn, sleep, APP, mysing, recMic} from './n4-vs-p-qa-h.mjs';
const FILE = process.argv[2] || APP, LV = +(process.argv[3] || -28);
const H = await open({file: FILE}), p = H.p;
await p.evaluate(() => { SYNQUENZER.loadDemo(); }); await sleep(300);
const sr = await micOn(p, 'wired'), bpm = await p.evaluate(() => S.bpm);
const y = mysing(4 * 4 * 60 / bpm + 0.5, sr, LV, 99).y;
const tk = await recMic(p, y, {len: 4, scene: 0, track: 5, bpm});
await p.evaluate(() => SYNQUENZER.vpWait && SYNQUENZER.vpWait());
const st0 = await p.evaluate(() => S.tracks.map(t => [t.name, t.kind, t.sound && t.sound.fx.vol, t.sound && t.sound.fx.pan, !!t.stimme, t.mute]));
await p.evaluate(() => { for (let i = 0; i < NT(); i++) if (AU.tracks[i]) window.__cap('t' + i, AU.tracks[i].cut); SYNQUENZER.launchScene(0); });
await sleep(4 * 4 * 60 / bpm * 2 * 1000 + 1500);
const st = await p.evaluate(() => { const o = []; for (let i = 0; i < NT(); i++) if (window.__caps['t' + i]) o.push([i, S.tracks[i].name, S.tracks[i].kind, !!S.tracks[i].stimme, (S.tracks[i].sound || {}).name, window.__capStat('t' + i, 0.5)]); return o; });
await p.evaluate(() => SYNQUENZER.stop());
console.log('App', await p.evaluate(() => SYNQUENZER.version), 'Take', tk.id, 'Takt', tk.len, 'Tracks', JSON.stringify(st0));
let syn = -Infinity, all = -Infinity, vox = null;
for (const [i, nm, kind, isSt, snd, v] of st) { console.log(`  ${i} ${nm.padEnd(8)} ${kind.padEnd(5)} ${String(snd).padEnd(14)} ${v.lufs} LUFS  TP ${v.tp}`); if (!isFinite(v.lufs)) continue;
  if (isSt) vox = v.lufs; else { all = Math.max(all, v.lufs); if (kind === 'synth') syn = Math.max(syn, v.lufs); } }
const d = vox - syn;
console.log(`Stimme ${vox} LUFS · lauteste Synth-Spur ${syn} → ${d.toFixed(2)} LU (Soll −3 … +3) · lauteste Spur ${all} → ${(vox - all).toFixed(2)} LU`);
console.log(d <= 3 && d >= -3 ? 'VS-P-02 ✓' : 'VS-P-02 ✗');
if (H.errs.length) console.log('Konsole:', H.errs.slice(0, 3));
await H.br.close();
