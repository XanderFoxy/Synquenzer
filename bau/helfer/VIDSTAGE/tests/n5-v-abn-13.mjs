// memory kept after a finished 3-min video job (sheet closed): the offline render buffer in VV.last
import { open } from './n5-v-abn-lib.mjs';
const {b, p, errs} = await open();
const r = await p.evaluate(async () => {
  const bars = 84, lanes = [[], [], [], [], [], []], marks = [];
  for (let k = 0; k < bars; k += 8) { lanes[0].push({bar: k, slot: 0}); lanes[4].push({bar: k, slot: 0}); marks.push({id: 'm' + k, a: k, len: Math.min(8, bars - k), name: 'Strophe'}); }
  SYNQUENZER.setSong({bars, lanes, carrier: [], mel: {}, marks}); SYNQUENZER.vvTest({opus: true});
  SYNQUENZER.vvOpen(); const x = await SYNQUENZER.vvMake({fmt: '9:16', view: 'song'}); SYNQUENZER.vvClose();
  await new Promise(r => setTimeout(r, 2000));
  const B = VV.last && VV.last.buf; return {dur: x.dur, sheetOpen: VV.open, keptFrames: B ? B.length : 0, keptCh: B ? B.numberOfChannels : 0, keptMB: B ? +(B.length * B.numberOfChannels * 4 / 1048576).toFixed(1) : 0, blobMB: +(VV.res.blob.size / 1048576).toFixed(1)};
});
console.log(JSON.stringify(Object.assign(r, {errs})));
await b.close();
