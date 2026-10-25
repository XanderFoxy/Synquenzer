import {open, OUT, sleep, check, done} from './v3-qa-gp2a-lib.mjs';
const T = await open({mic: false}); const {p, E, errs} = T;
await E(() => { SYNQUENZER.setBpm(160); SYNQUENZER.setMetronome(false); });
const beat = () => E(() => SYNQUENZER.runtime().beat);
const waitB = b => p.waitForFunction(b => SYNQUENZER.runtime().playing && SYNQUENZER.runtime().beat >= b, b, {timeout: 60000, polling: 5});
const ROOT = {Am: 57, F: 53, C: 48, G: 55, Dm: 50, Em: 52};
async function fangRun(scene, seq) {
  const b = await T.tapTxt('button.scn', new RegExp('^▶\\s*' + scene)); 
  await p.waitForFunction(() => SYNQUENZER.runtime().playing, null, {timeout: 5000});
  await T.tapSel('#segTr'); await sleep(80);
  await E(() => { const c = document.querySelector('#coach button'); if (c && c.getClientRects().length) c.click(); });
  let b0 = Math.ceil((await beat() + 0.6) / 4) * 4; 
  for (let k = 0; k < seq.length; k++) { await waitB(b0 + k * 4 - 0.15); await E(n => SYNQUENZER.keyOn(n, .8, 'ch'), ROOT[seq[k]]); await sleep(100); await E(() => SYNQUENZER.keyOff(0, 'ch')); }
  await waitB(b0 + seq.length * 4 + 0.25);
  const lab = await E(() => document.getElementById('bFang').textContent);
  await T.tapSel('#bFang'); await sleep(200);
  const fp = await E(() => { const f = SYNQUENZER.fangPart(); return f && {len: f.len, name: f.suggest && f.suggest.name, ch: f.chords && f.chords.ch.map(c => c.b + ':' + (c.tg && c.tg.name)), clips: f.clips, end: f.endText}; });
  return {b0, lab, fp};
}
const r1 = await fangRun(1, ['Am', 'F', 'C', 'G']);
console.log('fang1', JSON.stringify(r1));
await T.shot('x2-fsheet1');
console.log('pop', await T.pop(), JSON.stringify(await T.popTexts()));
await T.tapSel('.fsheet .fs-ok'); await sleep(250);
console.log('parts', JSON.stringify(await E(() => SYNQUENZER.parts().filter(Boolean).map(x => ({name: x.name, len: x.len, lanes: x.lanes})))));
console.log('keys', JSON.stringify(await E(() => [...document.querySelectorAll('#partBar .pk')].map(k => k.textContent))));
console.log('undo', JSON.stringify(await T.undoTop()), await T.undoN());
const r2 = await fangRun(2, ['F', 'G', 'Am', 'Am']);
console.log('fang2', JSON.stringify(r2));
console.log('pop', await T.pop(), JSON.stringify(await T.popTexts()));
await T.shot('x2-fsheet2');
await T.tapSel('.fsheet .fs-ok'); await sleep(250);
await E(() => SYNQUENZER.stop()); await sleep(300);
console.log('keys', JSON.stringify(await E(() => [...document.querySelectorAll('#partBar .pk')].map(k => k.textContent))));
await T.shot('x2-after');
console.log('errs', errs);
await T.br.close();
