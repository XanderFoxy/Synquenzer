import { open, SONG8 } from './n5-v-lib.mjs';
const {b, p, errs} = await open();
const r = await p.evaluate(async (s) => {
  SYNQUENZER.setSong(s); clearLog(); songPlayStart(0); const o = [];
  for (let k = 0; k < 8; k++) { await new Promise(r => setTimeout(r, 500)); o.push([LOG.n, R.playing, +audBeat().toFixed(2), VOICES.length]); }
  songPlayEnd(true); return {o, n: noteLog(4096).length};
}, SONG8);
console.log(JSON.stringify(r), errs); await b.close();
