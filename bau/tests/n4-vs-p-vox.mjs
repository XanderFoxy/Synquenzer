// VS-P Punkt 4: Auto-Pegel gilt auch für song.vox (● SONG mit 🎤, Punch über 8 Takte) – Ausgang STIMME −16 ± 1,5 LUFS; Pegel-Regler relativ; Mute
import {open, micOn, sleep, waitBeat, idle, b64, APP} from './n4-vs-p-h.mjs';
import {sung} from './n4-vs-p-lib.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const H = await open({file: process.argv[2] || APP}), p = H.p, sr = await micOn(p, 'wired');
await p.evaluate(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); });
await p.evaluate(() => SYNQUENZER.setSong({bars: 8, lanes: [[{bar: 0, slot: 0}], [], [], [], [], []], carrier: [], mel: {}}));
await p.evaluate(() => SYNQUENZER.songRecFrom({from: 0, mode: 'over', targets: {clips: false, chords: false, mel: true}, preroll: false}));
await p.waitForFunction(() => SYNQUENZER.runtime().song.play && SYNQUENZER.vsClock().playing, null, {timeout: 5000});
const y = sung(16.5, sr, -32, {seed: 71}).y;
await p.evaluate(b => { const c = SYNQUENZER.vsClock(), off = SYNQUENZER.runtime().song.off || 0; window.__fake.play(b, c.start + off * c.spb); }, b64(y));
await waitBeat(p, 32.2); await p.evaluate(() => SYNQUENZER.songRecEnd({beat: 32})); await idle(p);
const v = await p.evaluate(() => SYNQUENZER.tkInfo().vox); await p.evaluate(() => SYNQUENZER.stop()); await sleep(400);
ok(v && v.length === 1 && v[0].len === 8, 'song.vox Takt 1–8: ' + JSON.stringify(v && v.map(x => [x.bar, x.len])));
await p.evaluate(() => SYNQUENZER.vpWait());
async function playSong(sec, vol, mute) {
  await p.evaluate(([vol, mute]) => { const st = SYNQUENZER.tkInfo().stimme; SYNQUENZER.setTrackFx(st, 'vol', vol); setMute(st, !!mute); window.__cap('v', AU.tracks[st].cut); for (let i = 0; i < NT(); i++) if (AU.tracks[i] && i !== st) AU.tracks[i].cut.gain.value = 0; SYNQUENZER.songPlay(); }, [vol, mute]);
  await sleep(sec * 1000); const o = await p.evaluate(() => window.__capStat('v', 0.3)); await p.evaluate(() => SYNQUENZER.stop()); await sleep(400); return o;
}
const a = await playSong(16.3, .8), b = await playSong(16.3, .4), m = await playSong(6, .8, true);
const inf = await p.evaluate(id => SYNQUENZER.vpInfo().takes[id], v[0].take);
ok(Math.abs(a.lufs + 16) <= 1.5, `song.vox: Take ${inf.heard.lufs} LUFS, Ausgleich ${inf.heard.gDb} dB → Ausgang STIMME ${a.lufs} LUFS, ${a.tp} dBTP (Soll −16 ± 1,5)`);
ok(Math.abs((b.lufs - a.lufs) - 20 * Math.log10(.16 / .64)) <= .3, `Pegel-Regler wirkt zusätzlich: 0,8 → 0,4 = ${(b.lufs - a.lufs).toFixed(2)} dB (Soll ${(20 * Math.log10(.16 / .64)).toFixed(2)} dB)`);
ok(m.lufs == null || m.lufs < -70, `Mute: Ausgang ${m.lufs == null ? 'still' : m.lufs + ' LUFS'}`);
ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2)));
await H.br.close();
console.log(fail ? `\n${fail} FEHLER` : '\nALLE OK'); process.exit(fail ? 1 : 0);
