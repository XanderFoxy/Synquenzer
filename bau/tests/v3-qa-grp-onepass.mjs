// QA group: ▶1, wait w bars, play Am F C G once (on time), FANG TEIL 10 % into the next bar → which part?
import {open, check, done, tapEl, tapText} from './v3-qa-grp-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
for (const w of [0, 1, 2]) {
  const {br, p, errs, E} = await open({mic: false});
  await E(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); });
  await tapText(p, 'button.scn', /^▶\s*1/); await p.waitForFunction(() => SYNQUENZER.runtime().playing);
  await tapEl(p, '#segTr'); await sleep(200); await tapText(p, '#coach button', /Verstanden/);
  const b0 = w * 4;
  await E(([seq, b0]) => new Promise(res => { let k = 0; const iv = setInterval(() => { const b = audBeat(); if (k < seq.length && b >= b0 + 4 * k + (b0 + 4 * k === 0 ? 0.3 : 0.03)) { SYNQUENZER.keyOn(seq[k], .8, 'c' + k); const kk = k; setTimeout(() => SYNQUENZER.keyOff(0, 'c' + kk), 100); k++; } if (k >= seq.length) { clearInterval(iv); res(); } }, 2); }), [[57, 53, 48, 55], b0]);
  await p.waitForFunction(x => audBeat() >= x, b0 + 16.4, {polling: 5});
  await tapEl(p, '#bFang'); await sleep(120);
  const fp = await E(() => { const f = SYNQUENZER.fangPart(); return f && {len: f.len, ch: f.chords.ch.map(c => +c.b.toFixed(2) + ':' + (c.tg ? c.tg.name : 'ORIG')).join(' '), end: f.endText}; });
  console.log(`wait ${w} bar(s):`, JSON.stringify(fp));
  check(`▶1, ${w} bar(s) waiting, Am F C G once, FANG TEIL → 4-bar part Am F C G`, fp && fp.len === 4 && !/ORIG/.test(fp.ch), fp && fp.ch);
  await br.close();
}
done();
