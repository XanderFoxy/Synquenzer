// T2: Stimme-FANG with real fake mic melody → MELODIE + STIMME same take; notes vs take audio; undo/redo; save/reload; WAV
import {launch, open, micOn, waitBeat, idle, sleep, writeWav, tone, concat, pitch, rmsDb, deq, DIR} from './v3-qa-vs3-h.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const SR = 48000, wav = DIR + '/t2.wav';
const midiF = m => 440 * 2 ** ((m - 69) / 12);
const MEL = [57, 60, 64, 65, 64, 62, 60, 64, 67, 65, 64, 62, 60, 59, 57, 57];   // 16 beats = 8 s at 120
writeWav(wav, concat(...MEL.map(m => concat(tone(midiF(m), 0.42, SR), new Float32Array(Math.round(0.08 * SR))))), SR);
const br = await launch(wav);
const ctx = await br.newContext({viewport: {width: 390, height: 844}});
let H = await open(br, {ctx}), p = H.p;
const sr = await micOn(p);
await p.evaluate(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); SYNQUENZER.selectSlot(0, 1); SYNQUENZER.play(); });
await waitBeat(p, 20.3);
const u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
ok(await p.evaluate(() => SYNQUENZER.vsFang({})), 'Stimme-FANG accepted');
await idle(p);
const r = await p.evaluate(() => SYNQUENZER.vsResult()); console.log('result', JSON.stringify(r).slice(0, 300));
const I = await p.evaluate(() => SYNQUENZER.tkInfo());
const mel = await p.evaluate(s => SYNQUENZER.getClip(5, s), r.scene), stc = await p.evaluate(([t, s]) => SYNQUENZER.getClip(t, s), [I.stimme, r.scene]);
ok(mel && stc && stc.audio && mel.take === stc.audio.take, 'same take id MELODIE/STIMME: ' + (mel && mel.take) + ' / ' + (stc && stc.audio && stc.audio.take));
console.log('mel notes', mel && mel.notes.length, JSON.stringify(mel && mel.notes.slice(0, 6)), 'len', mel && mel.len, 'stc', JSON.stringify(stc && stc.audio), stc && stc.len);
ok(await p.evaluate(() => SYNQUENZER.undoInfo().n) === u0 + 1, 'one undo step for FANG');
// compare notes against audio in take: pitch at note mid
const tk = await p.evaluate(() => SYNQUENZER.takes()), m = tk[stc.audio.take];
const pcm = await p.evaluate(id => SYNQUENZER.tkPcmRange(id), stc.audio.take);
let match = 0, tot = 0; const rows = [];
for (const n of mel.notes) {
  // note start in clip steps (1/16) → beats; take position = in + (beat - at) * 0.5
  const beat = n.t, dur = n.d;
  const tsec = stc.audio.in + (beat + Math.min(dur, 0.8) * 0.5 - stc.audio.at) * 0.5, k = Math.round(tsec * m.sr) - 1024;
  if (k < 0 || k + 2048 > pcm.length) continue;
  const f = pitch(pcm.slice(k, k + 2048), m.sr), mm = 69 + 12 * Math.log2(f / 440); tot++;
  const pn = n.n; if (Math.abs(mm - pn) < 0.6) match++; rows.push([beat, pn, +mm.toFixed(1)]);
}
console.log('note vs audio', JSON.stringify(rows));
ok(tot > 4 && match / tot >= 0.9, `notes line up with take audio: ${match}/${tot}`);
await p.evaluate(() => SYNQUENZER.vsResultOk && SYNQUENZER.vsResultOk());
await p.evaluate(() => SYNQUENZER.undo());
const a1 = await p.evaluate(([s, id]) => ({mel: SYNQUENZER.getClip(5, s), st: SYNQUENZER.tkInfo().stimme, tk: !!(SYNQUENZER.takes() || {})[id]}), [r.scene, stc.audio.take]);
ok(!a1.mel && a1.st === -1 && !a1.tk, 'undo removes both ' + JSON.stringify(a1));
await p.evaluate(() => SYNQUENZER.redo());
const a2 = await p.evaluate(([s, id]) => { const st = SYNQUENZER.tkInfo().stimme; return {mel: SYNQUENZER.getClip(5, s), stc: st >= 0 ? SYNQUENZER.getClip(st, s) : null, tk: !!(SYNQUENZER.takes() || {})[id]}; }, [r.scene, stc.audio.take]);
ok(a2.mel && a2.stc && a2.tk && deq(a2.stc, stc) && deq(a2.mel, mel), 'redo restores both deep-equal');
// WAV export bit-identical
const w = await p.evaluate(id => SYNQUENZER.tkWavInfo(id), stc.audio.take);
ok(w && w.same && w.bits === 16 && w.sr === m.sr, 'WAV ' + JSON.stringify(w));
// save + reload
await p.evaluate(() => SYNQUENZER.stop());
const h0 = await p.evaluate(id => SYNQUENZER.tkPcmHash(id), stc.audio.take), P0 = await p.evaluate(() => SYNQUENZER.project());
await sleep(2500); await p.close();
H = await open(br, {ctx}); p = H.p; await sleep(1500);
const h1 = await p.evaluate(id => SYNQUENZER.tkPcmHash(id), stc.audio.take), P1 = await p.evaluate(() => SYNQUENZER.project());
const strip = P => { const c = JSON.parse(JSON.stringify(P)); delete c.ui; return c; };
ok(h1 === h0, 'reload: take bit-identical ' + h1);
ok(deq(strip(P0), strip(P1)), 'reload: project deep-equal');
if (!deq(strip(P0), strip(P1))) { for (const k of Object.keys(P0)) if (!deq(P0[k], P1[k])) console.log('  diff key', k, JSON.stringify(P0[k]).slice(0, 200), '|', JSON.stringify(P1[k]).slice(0, 200)); }
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); window.__tap(); SYNQUENZER.setMetronome(false); });
await p.evaluate(s => SYNQUENZER.launchScene(s), r.scene); await sleep(1500);
const lv = await p.evaluate(() => window.__lvl()); console.log('after reload playing:', JSON.stringify(lv));
await p.evaluate(() => SYNQUENZER.stop());
ok(!H.errs.length, 'no console errors ' + JSON.stringify(H.errs.slice(0, 3)));
await br.close();
console.log(fail ? fail + ' FAIL' : 'all ok');
