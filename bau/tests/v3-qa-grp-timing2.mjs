// QA group: late chords (75 ms) → FANG TEIL loop: which pitch does the bass play on each loop downbeat?
import {open, check, done, tapEl, tapText} from './v3-qa-grp-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const off = +(process.argv[2] || 0.15);
const {br, p, errs, E} = await open({mic: false});
await E(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); });
await tapText(p, 'button.scn', /^▶\s*1/);
await p.waitForFunction(() => SYNQUENZER.runtime().playing);
await tapEl(p, '#segTr');
const seq = [57, 53, 48, 55, 57, 53, 48, 55];
await E(([seq, b0, off]) => new Promise(res => { let k = 0; const iv = setInterval(() => { const b = audBeat(); if (k < seq.length && b >= b0 + 4 * k + off) { SYNQUENZER.keyOn(seq[k], .8, 'c' + k); const kk = k; setTimeout(() => SYNQUENZER.keyOff(0, 'c' + kk), 100); k++; } if (k >= seq.length) { clearInterval(iv); res(); } }, 2); }), [seq, 8, off]);
await p.waitForFunction(() => audBeat() >= 40.4, null, {polling: 5});
await tapEl(p, '#bFang'); await sleep(100);
const fp = await E(() => { const f = SYNQUENZER.fangPart(); return {len: f.len, ch: f.chords.ch.map(c => +c.b.toFixed(2) + ':' + (c.tg ? c.tg.name : 'ORIG')).join(' ')}; });
console.log('part', JSON.stringify(fp));
await tapText(p, '.pop.fsheet button', /ALS TEIL/); await sleep(100);
await p.waitForFunction(() => audBeat() >= 44 + 4 * 17, null, {timeout: 120000, polling: 50});
const pi = await E(() => SYNQUENZER.partInfo().part);
console.log('R.part', JSON.stringify(pi));
// bass (track 0, demo clip in C: downbeat note 36) – what sounded in the first 0.3 beat of each bar
const log = await E(() => SYNQUENZER.noteLog(4000).filter(n => n.track === 0 && n.beat >= 44 && (n.beat % 4) < 0.35).map(n => [+n.beat.toFixed(2), n.clipNote, n.out, n.dur && +n.dur.toFixed(3)]));
console.log('bass on downbeats', JSON.stringify(log));
const NAME = {33: 'A', 45: 'A', 41: 'F', 36: 'C(=orig or C)', 31: 'G', 43: 'G'};
for (const [b, cn, out] of log) if (cn === 36) process.stdout.write(`${b}:${NAME[out] || out} `);
console.log();
await E(() => SYNQUENZER.stop()); await br.close();
