import { open } from './lib.mjs';
const {b, p} = await open({w: 428, h: 926});
await p.evaluate(() => { const el = document.getElementById('sq-worklet-src'); window._wsrc = el.textContent;
  el.textContent = '(function(){var s=12345;Math.random=function(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};})();\n' + window._wsrc;
  window._seed = () => { let s = 777; Math.random = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }; });
for (const t of [0, 1, 2, 4]) {
  const lanes = [[], [], [], [], [], []]; lanes[t] = [{bar: 0, slot: 0}];
  await p.evaluate(s => SYNQUENZER.setSong(s), {bars: 3, lanes, carrier: [], mel: {}, marks: []});
  const h = [];
  for (let k = 0; k < 4; k++) h.push(await p.evaluate(async () => { window._seed(); VV.noMtr = true; await SYNQUENZER.vvRender({}); let h = 2166136261 >>> 0; for (const d of VV.last.ch) { const u = new Uint32Array(d.buffer, d.byteOffset, d.length); for (let k = 0; k < u.length; k++) h = Math.imul(h ^ u[k], 16777619) >>> 0; } return h; }));
  console.log('Spur', t + 1, h.join(' '), await p.evaluate(t => S.tracks[t].sound.engine + ' ' + S.tracks[t].name, t));
}
await b.close();
