// QA group G-P1b – Xander's flow on P1 (touch): Strophe + Refrain with FANG TEIL → ＋ Song, ▶ SONG, part taps in the song,
// sing over it (🎤, fake mic, wired) → FANG 🎤 → MELODIE clip, result sheet OK; then ● REC with 🎤 on an empty scene.
import {open, OUT, check, done, tapEl, tapText, eq} from './v3-qa-grp-lib.mjs';
import {micOn, resample, b64} from './v3-vs2-h.mjs';
import {renderVoice} from './v3-vs2-corpus.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const {br, p, errs, E} = await open();
const ab = () => E(() => audBeat());
const waitA = (b, ms = 120000) => p.waitForFunction(b => audBeat() >= b, b, {timeout: ms, polling: 5});
await E(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); });
const mic = await micOn(p, 'wired'); console.log('mic', JSON.stringify(mic));
await E(() => SYNQUENZER.stop());
await sleep(300);
// in-page chord player (presses 30 ms late = on the beat by ear)
const chords = (seq, b0, off = 0.06) => E(([seq, b0, off]) => new Promise(res => { let k = 0; const iv = setInterval(() => { const b = audBeat(); if (k < seq.length && b >= b0 + 4 * k + off) { SYNQUENZER.keyOn(seq[k], .8, 'c' + k); const kk = k; setTimeout(() => SYNQUENZER.keyOff(0, 'c' + kk), 100); k++; } if (k >= seq.length) { clearInterval(iv); res(); } }, 2); }), [seq, b0, off]);
const R = {Am: 57, F: 53, C: 48, G: 55, Dm: 50, E: 52};
// ---- Strophe
await tapText(p, 'button.scn', /^▶\s*1/); await p.waitForFunction(() => SYNQUENZER.runtime().playing);
await tapEl(p, '#segTr'); await sleep(300);
const co = await tapText(p, '#coach button', /Verstanden/); console.log('coach dismissed', !!co);
await chords(['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G'].map(c => R[c]), 8);
await waitA(40.3); await tapEl(p, '#bFang'); await sleep(120);
let fp = await E(() => SYNQUENZER.fangPart());
check('Strophe: 4 bars, name Strophe', fp && fp.len === 4 && fp.suggest.name === 'Strophe', fp && {len: fp.len, n: fp.suggest.name, clips: fp.clips});
await tapText(p, '.pop.fsheet button', /Song/); await sleep(150);
let st = await E(() => ({parts: SYNQUENZER.parts().filter(Boolean).map(x => x.name + ':' + x.len), marks: SYNQUENZER.songMarks().map(m => m.name + '@' + m.a + '+' + m.len), part: SYNQUENZER.runtime().part}));
check('Strophe on the Teil-Leiste and at the song end', eq(st.parts, ['Strophe:4']) && eq(st.marks, ['Strophe@0+4']), st);
// ---- Refrain: ▶2 then F G C C ×2
const t2 = await tapText(p, 'button.scn', /^▶\s*2/); console.log('tap ▶2 at', (await ab()).toFixed(2));
let nb = Math.ceil(await ab() / 4) * 4; await waitA(nb + 0.2);
const b0 = nb + 4; console.log('refrain chords from', b0, 'slots', JSON.stringify(await E(() => SYNQUENZER.runtime().slots)), 'part', JSON.stringify(await E(() => SYNQUENZER.runtime().part)));
await chords(['F', 'G', 'C', 'C', 'F', 'G', 'C', 'C'].map(c => R[c]), b0);
await waitA(b0 + 32.3); await tapEl(p, '#bFang'); await sleep(120);
fp = await E(() => SYNQUENZER.fangPart());
check('Refrain: 4 bars F G C C, name Refrain', fp && fp.len === 4 && fp.suggest.name === 'Refrain', fp && {len: fp.len, n: fp.suggest.name, ch: fp.chords.ch.map(c => c.b + ':' + (c.tg ? c.tg.name : 'O')).join(' '), clips: fp.clips, end: fp.endText});
await p.screenshot({path: OUT + 'flow2-refrain-sheet.png'});
await tapText(p, '.pop.fsheet button', /Song/); await sleep(150);
st = await E(() => ({parts: SYNQUENZER.parts().filter(Boolean).map(x => x.name + ':' + x.len), marks: SYNQUENZER.songMarks().map(m => m.name + '@' + m.a + '+' + m.len), bars: SYNQUENZER.song().bars, lanes: SYNQUENZER.song().lanes, carrier: SYNQUENZER.song().carrier.map(c => c.beat + ':' + (c.target ? c.target.name : 'O'))}));
check('Song = [Strophe 0–4, Refrain 4–8]', eq(st.marks, ['Strophe@0+4', 'Refrain@4+4']) && st.bars === 8, st);
await p.screenshot({path: OUT + 'flow2-after-refrain.png'});
// ---- song view + ▶ SONG
await tapEl(p, '.corner'); await sleep(200);
check('song view open', await E(() => SYNQUENZER.runtime().song.view));
await p.screenshot({path: OUT + 'flow2-songview.png'});
await E(() => SYNQUENZER.stop()); await sleep(1300);
await E(() => SYNQUENZER.songLoop(true));
await E(() => SYNQUENZER.clearLog());
await tapEl(p, '#bPlay'); await sleep(200);
let rt = await E(() => SYNQUENZER.runtime().song); console.log('song play', JSON.stringify({play: rt.play, beat: rt.beat, loop: rt.loop}));
check('▶ SONG plays', rt.play);
// listen 8 bars: carrier per bar = Am F C G F G C C
await waitA(32.5);
const per = await E(() => { const L = SYNQUENZER.noteLog(3000).filter(n => n.track === 0 && n.clipNote === 36 && (n.beat % 4) < 0.05); return L.map(n => [+n.beat.toFixed(2), n.out]); });
console.log('bass downbeats in song', JSON.stringify(per));
// part tap while the song runs: tap STROPHE during the Refrain → next Strophe mark (loop wraps to bar 1)
rt = await E(() => SYNQUENZER.runtime().song); console.log('song beat now', rt.beat);
await E(() => SYNQUENZER.songView(false)); await sleep(200);   // back to clips (the Teil-Leiste is not in P song view)
const pk = await E(() => [...document.querySelectorAll('.pk')].map(k => k.textContent.trim()));
console.log('part keys', pk);
// wait until we are in the Refrain (song bars 5–8), then tap STROPHE
await p.waitForFunction(() => { const b = SYNQUENZER.runtime().song.beat; return b != null && (b % 32) >= 17 && (b % 32) < 18; }, null, {timeout: 60000, polling: 10});
const sb0 = await E(() => SYNQUENZER.runtime().song.beat);
await tapText(p, '.pk', /STROPHE/); await sleep(100);
const after = await E(() => ({rt: SYNQUENZER.runtime().song, part: SYNQUENZER.runtime().part, pend: SYNQUENZER.partInfo().partPend}));
console.log('tap STROPHE at song beat', sb0.toFixed(2), JSON.stringify(after));
await p.waitForFunction(x => SYNQUENZER.runtime().song.beat >= x, Math.ceil(sb0 / 4) * 4 + 0.5, {timeout: 20000, polling: 10});
const jumped = await E(() => SYNQUENZER.runtime().song);
check('Teil-Tipp im Song springt zur Strophe-Marke (N7S-25b)', jumped.play && (jumped.beat % 32) < 1, {beat: jumped.beat, play: jumped.play, view: jumped.view});
console.log('errs so far', errs);
// save state for later steps
const proj = await E(() => SYNQUENZER.project());
import('fs').then(fs => fs.writeFileSync(OUT + 'flow2-project.json', JSON.stringify(proj)));
await sleep(200);
await E(() => SYNQUENZER.stop());
await br.close();
done();
