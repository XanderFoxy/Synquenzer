import {launch, openApp} from './v3-qa-mk2-lib.mjs';
import {mktab} from './v3-mk2-node.mjs';
const FILE = new URL('../mk-wt/index.html', import.meta.url).pathname;
const h = d => { const b = new Uint8Array(d); let x = 2166136261; for (let i = 0; i < b.length; i++) { x ^= b[i]; x = Math.imul(x, 16777619) >>> 0; } return x; };
const b = await launch(); const {page} = await openApp(b, FILE);
// the tables the live app actually built for its context (WV.built, sliced builder) vs Node mkTables
const hp = await page.evaluate(async () => { SYNQUENZER.setEngine(0, 'mk'); ensureAudio(); await new Promise(r => setTimeout(r, 400)); const M = mkLoad(); M.wv.all(); const t0 = performance.now();
  while (M.wv.WV.built.size < 64 && performance.now() - t0 < 20000) await new Promise(r => setTimeout(r, 20));
  const H = d => { const b = new Uint8Array(d); let x = 2166136261; for (let i = 0; i < b.length; i++) { x ^= b[i]; x = Math.imul(x, 16777619) >>> 0; } return x; };
  const o = []; for (let n = 1; n <= 64; n++) o.push(H(M.wv.WV.built.get(n).d)); return o; });
const T = mktab(FILE); const hn = []; for (let n = 1; n <= 64; n++) hn.push(h(T.wave(n).d));
console.log('live-built vs Node mkTables differing waves:', hp.map((x, i) => x !== hn[i] ? i + 1 : 0).filter(Boolean).join(' ') || 'none');
await b.close();
