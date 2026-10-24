// QA group: ▶2 while a FANG TEIL part (Strophe) loops – does scene 2 come in?
import {open, check, done, tapEl, tapText} from './v3-qa-grp-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const how = process.argv[2] || 'touch';
const {br, p, errs, E} = await open({mic: false});
await E(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); });
await tapText(p, 'button.scn', /^▶\s*1/); await p.waitForFunction(() => SYNQUENZER.runtime().playing);
await tapEl(p, '#segTr');
await E(([seq, b0, off]) => new Promise(res => { let k = 0; const iv = setInterval(() => { const b = audBeat(); if (k < seq.length && b >= b0 + 4 * k + off) { SYNQUENZER.keyOn(seq[k], .8, 'c' + k); const kk = k; setTimeout(() => SYNQUENZER.keyOff(0, 'c' + kk), 100); k++; } if (k >= seq.length) { clearInterval(iv); res(); } }, 2); }), [[57, 53, 48, 55, 57, 53, 48, 55], 8, 0.05]);
await p.waitForFunction(() => audBeat() >= 40.3, null, {polling: 5});
await tapEl(p, '#bFang'); await sleep(100);
await tapText(p, '.pop.fsheet button', /ALS TEIL/); await sleep(200);
console.log('after ALS TEIL', JSON.stringify(await E(() => ({part: SYNQUENZER.runtime().part, slots: SYNQUENZER.runtime().slots, kb: SYNQUENZER.runtime().kbMode}))));
await p.waitForFunction(() => audBeat() >= 45, null, {polling: 5});
if (how === 'touch') console.log('tap ▶2', JSON.stringify(await tapText(p, 'button.scn', /^▶\s*2/)));
else await E(() => SYNQUENZER.launchScene(1));
await sleep(50);
console.log('right after', JSON.stringify(await E(() => ({b: audBeat(), q: SYNQUENZER.runtime().queued, part: SYNQUENZER.runtime().part, pend: SYNQUENZER.partInfo().partPend}))));
for (const x of [48.2, 52.2, 56.2, 60.2, 64.2]) { await p.waitForFunction(x => audBeat() >= x, x, {polling: 5}); console.log(x, JSON.stringify(await E(() => ({slots: SYNQUENZER.runtime().slots, part: SYNQUENZER.runtime().part, cs: SYNQUENZER.runtime().cstart})))); }
console.log('errs', errs);
await br.close();
