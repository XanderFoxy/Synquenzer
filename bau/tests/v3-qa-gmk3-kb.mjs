import {open, sleep} from './v3-qa-gmk3-tl.mjs';
for (const vp of [{width: 390, height: 844}, {width: 844, height: 390}]) {
  const T = await open({viewport: vp}); const {E} = T;
  const r = await E(async () => { const out = []; for (let t = 0; t < 4; t++) { SYNQUENZER.selectTrack(t); SYNQUENZER.openEditor(); await new Promise(r => setTimeout(r, 400)); const ks = [...document.querySelectorAll('#kb .key')].filter(k => k.getClientRects().length); const labels = ks.map(k => (k.querySelector('.cl') || {}).textContent).filter(Boolean); out.push({t, kbOct: S.tracks[t].kbOct, keys: ks.length, labels}); } return out; });
  console.log(vp.width, JSON.stringify(r));
  await T.br.close();
}
