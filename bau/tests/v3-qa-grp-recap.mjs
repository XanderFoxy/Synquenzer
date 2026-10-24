// QA group: Strophe loops (FANG TEIL part), Xander plays new chords over it (hand), FANG TEIL again → Refrain with the same clips;
// then the Refrain loop: clips start once per pass, in phase; carriers right.
import {open, check, done, tapEl, tapText} from './v3-qa-grp-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const {br, p, errs, E} = await open({mic: false});
await E(() => { SYNQUENZER.setBpm(140); SYNQUENZER.setMetronome(false); SYNQUENZER.launchScene(0); SYNQUENZER.setKbMode('transpose'); });
const chords = (seq, b0, off = 0.05) => E(([seq, b0, off]) => new Promise(res => { let k = 0; const iv = setInterval(() => { const b = audBeat(); if (k < seq.length && b >= b0 + 4 * k + off) { SYNQUENZER.keyOn(seq[k], .8, 'c' + k); const kk = k; setTimeout(() => SYNQUENZER.keyOff(0, 'c' + kk), 80); k++; } if (k >= seq.length) { clearInterval(iv); res(); } }, 2); }), [seq, b0, off]);
await chords([57, 53, 48, 55, 57, 53, 48, 55], 4);
await p.waitForFunction(() => audBeat() >= 36.3, null, {polling: 5}); await E(() => SYNQUENZER.fangTeil({})); await sleep(80);
await E(() => SYNQUENZER.fangAccept('part')); await sleep(50);
console.log('Strophe', JSON.stringify(await E(() => SYNQUENZER.parts()[0].lanes)));
// the Strophe loop runs from bar 10 (beat 40). Over it: Dm G Em Am ×2 from bar 12 (beat 48)
await chords([50, 55, 52, 57, 50, 55, 52, 57], 48);
await p.waitForFunction(() => audBeat() >= 80.3, null, {polling: 5});
console.log('before 2nd FANG', JSON.stringify(await E(() => ({part: SYNQUENZER.runtime().part, mode: SYNQUENZER.runtime().fangMode, row: SYNQUENZER.runtime().row}))));
await E(() => SYNQUENZER.fangTeil({})); await sleep(80);
const fp = await E(() => { const f = SYNQUENZER.fangPart(); return f && {len: f.len, ch: f.chords.ch.map(c => c.b + ':' + (c.tg ? c.tg.name : 'O')).join(' '), lanes: f.lanes, name: f.suggest.name, end: f.endText, clips: f.clips}; });
console.log('2nd FANG', JSON.stringify(fp));
check('re-capture over a running part: 4 bars Dm G Em Am, name Refrain', fp && fp.len === 4 && /D/.test(fp.ch) && fp.name === 'Refrain', fp && fp.ch);
await E(() => SYNQUENZER.fangAccept('part')); await E(() => SYNQUENZER.clearLog());
await p.waitForFunction(() => audBeat() >= 84 + 32.2, null, {timeout: 60000, polling: 20});
const log = await E(() => SYNQUENZER.noteLog(4096).filter(n => n.beat != null && n.beat >= 84 && n.beat < 116));
// clip starts per pass: count notes of track 2 (2-bar pad, Sz1) at bar starts; bass on downbeats with the carrier
const bass = log.filter(n => n.track === 0 && n.clipNote === 36 && n.beat % 4 < .05).map(n => [n.beat, n.out]);
console.log('bass downbeats', JSON.stringify(bass));
const pad = log.filter(n => n.track === 2).map(n => [+n.beat.toFixed(2), n.clipNote, n.out]);
console.log('pad notes', JSON.stringify(pad.slice(0, 20)));
const dbl = []; const seen = new Map(); for (const n of log) { const k = n.track + ':' + n.beat.toFixed(3) + ':' + n.clipNote; seen.set(k, (seen.get(k) || 0) + 1); } for (const [k, v] of seen) if (v > 1) dbl.push(k);
check('no doubled notes (same track/beat/note twice)', !dbl.length, dbl.slice(0, 8));
const want = {0: 'D', 1: 'G', 2: 'E', 3: 'A'};
console.log('errs', errs); await E(() => SYNQUENZER.stop()); await br.close(); done();
