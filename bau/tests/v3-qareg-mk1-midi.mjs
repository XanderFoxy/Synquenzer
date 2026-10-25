import { open, APP } from './v3-qareg-mk1-pw.mjs';
const {b, p, errs} = await open({width: 390, height: 844}, APP);
const r = await p.evaluate(async () => { const Q = window.SYNQUENZER; const got = [];
  window.claude = {use: async k => (k === 'downloads' ? {save: async ({filename, data}) => { got.push({filename, type: data.type, bytes: Array.from(new Uint8Array(await data.arrayBuffer()))}); }} : null)};
  await Q.loadDemo(); Q.setEngine(0, 'mk'); await new Promise(r => setTimeout(r, 500));
  await Q.exportMidi({mode: 'all'}); await new Promise(r => setTimeout(r, 1000));
  return got.map(g => { const s = String.fromCharCode(...g.bytes); return {filename: g.filename, type: g.type, len: g.bytes.length, pk: s.slice(0, 2), names: (s.match(/Synth \d \([^)]*\)/g) || []).slice(0, 6)}; }); });
console.log(JSON.stringify(r), errs); await b.close();
