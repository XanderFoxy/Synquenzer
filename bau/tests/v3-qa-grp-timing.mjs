// QA group: FANG TEIL with human chord timing (early/late presses) – what part comes out, and does the loop sound right?
import {open, OUT, check, done, tapEl, tapText} from './v3-qa-grp-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const offs = (process.argv[2] || '-0.5,-0.2,0.05,0.15,0.3').split(',').map(Number);
const extra = process.argv[3] === 'cont';
for (const off of offs) {
  const {br, p, errs, E} = await open({mic: false});
  await E(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); });
  await tapText(p, 'button.scn', /^▶\s*1/);
  await p.waitForFunction(() => SYNQUENZER.runtime().playing);
  await tapEl(p, '#segTr');
  const ROOT = {Am: 57, F: 53, C: 48, G: 55};
  const seq = ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G'].concat(extra ? ['Am'] : []);
  const b0 = 8;
  // in-page scheduler: press the root at beat b0 + 4k + off (audible beat), release 100 ms later
  await E(([seq, b0, off]) => new Promise(res => { let k = 0; const iv = setInterval(() => { const b = audBeat(); if (k < seq.length && b >= b0 + 4 * k + off) { const n = seq[k]; window.__pressed = (window.__pressed || []).concat([+b.toFixed(3)]); SYNQUENZER.keyOn(n, .8, 'c' + k); const kk = k; setTimeout(() => SYNQUENZER.keyOff(0, 'c' + kk), 100); k++; } if (k >= seq.length) { clearInterval(iv); res(); } }, 2); }), [seq.map(s => ROOT[s]), b0, off]);
  await p.waitForFunction(() => audBeat() >= 40.4, null, {polling: 5});
  await tapEl(p, '#bFang'); await sleep(100);
  const fp = await E(() => { const f = SYNQUENZER.fangPart(); return f && {len: f.len, rule: f.end.rule, ch: f.chords.ch.map(c => +c.b.toFixed(2) + ':' + (c.tg ? c.tg.name : 'ORIG')).join(' '), end: f.endText, period: f.period}; });
  const pressed = await E(() => window.__pressed);
  await tapText(p, '.pop.fsheet button', /ALS TEIL/); await sleep(100);
  // listen to the loop for 2 passes: the carrier in effect on each downbeat (outPitch of a clip note at that beat) + any ORIGINAL blips
  const L = fp.len; const from = Math.ceil(await E(() => audBeat()) / 4) * 4 + 4;
  await p.waitForFunction(x => audBeat() >= x, from + L * 8 + 1, {timeout: 120000, polling: 50});
  const tl = await E(f => SYNQUENZER.timeline().filter(e => e.beat != null && e.beat >= f - 0.01).map(e => [+e.beat.toFixed(2), e.name || 'ORIG']), from);
  // bass notes (track 0) heard on the downbeats
  const log = await E(f => SYNQUENZER.noteLog(4000).filter(n => n.track === 0 && n.beat >= f - .01).map(n => [+n.beat.toFixed(2), n.clipNote, n.out]), from);
  const blips = tl.filter(([b, n]) => n === 'ORIG');
  console.log(`\noff ${off}${extra ? ' (+Am)' : ''}: pressed ${JSON.stringify(pressed)}`);
  console.log('  part', JSON.stringify(fp));
  console.log('  loop carrier', JSON.stringify(tl.slice(0, 12)));
  console.log('  bass', JSON.stringify(log.slice(0, 12)));
  check(`off ${off}: 4-bar part Am F C G`, fp.len === 4, fp.ch);
  check(`off ${off}: no ORIGINAL blip in the loop`, !blips.length, blips);
  check(`off ${off}: no console errors`, !errs.length, errs);
  await E(() => SYNQUENZER.stop()); await br.close();
}
done();
