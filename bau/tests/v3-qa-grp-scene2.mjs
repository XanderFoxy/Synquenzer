// QA group: why does a touch on ▶2 not launch scene 2 after FANG TEIL?
import {open, OUT, tapEl, tapText} from './v3-qa-grp-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const variant = process.argv[2] || 'fang';
const {br, p, errs, E} = await open({mic: false});
await E(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); });
await tapText(p, 'button.scn', /^▶\s*1/); await p.waitForFunction(() => SYNQUENZER.runtime().playing);
const probe = async label => { const r = await E(() => { const b = [...document.querySelectorAll('button.scn')][1], rc = b.getBoundingClientRect(), el = document.elementFromPoint(rc.x + rc.width / 2, rc.y + rc.height / 2); return {hit: el === b || b.contains(el), el: el && (el.id || el.className || el.tagName) + ' ' + (el.textContent || '').trim().slice(0, 40), pop: window.UI && UI.pop ? UI.pop.name : null}; }); console.log(label, JSON.stringify(r)); };
if (variant === 'plain') { await sleep(2500); await probe('plain'); }
if (variant === 'transpose') { await tapEl(p, '#segTr'); await E(() => SYNQUENZER.keyOn(57, .8, 'x')); await sleep(100); await E(() => SYNQUENZER.keyOff(0, 'x')); await sleep(2500); await probe('transpose'); }
if (variant === 'fang') {
  await tapEl(p, '#segTr');
  await E(([seq, b0, off]) => new Promise(res => { let k = 0; const iv = setInterval(() => { const b = audBeat(); if (k < seq.length && b >= b0 + 4 * k + off) { SYNQUENZER.keyOn(seq[k], .8, 'c' + k); const kk = k; setTimeout(() => SYNQUENZER.keyOff(0, 'c' + kk), 100); k++; } if (k >= seq.length) { clearInterval(iv); res(); } }, 2); }), [[57, 53, 48, 55], 4, 0.05]);
  await p.waitForFunction(() => audBeat() >= 20.3, null, {polling: 5});
  await tapEl(p, '#bFang'); await sleep(100); await probe('sheet open');
  await tapText(p, '.pop.fsheet button', /ALS TEIL/); await sleep(200); await probe('after ALS TEIL');
  await sleep(4000); await probe('after 4 s');
}
const t = await tapText(p, 'button.scn', /^▶\s*2/); await sleep(60);
console.log('queued', JSON.stringify(await E(() => SYNQUENZER.runtime().queued)));
await p.screenshot({path: OUT + 'scene2-' + variant + '.png'});
await br.close();
