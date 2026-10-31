import {launch} from './n5-k-blib.mjs';
const {b, p, errs} = await launch({});
const r = await p.evaluate(async () => {
  mkLoad(); for (let i = 0; i < 60 && !mkLoaded(); i++) await new Promise(r => setTimeout(r, 100));
  const out = {fmx: [], engines: {}, pegs: [], vocKeys: null, mkInitT: null};
  for (const [id, f] of FACTORY_BY_ID) {
    out.engines[f.engine] = (out.engines[f.engine] || 0) + 1;
    const s = factorySound(id);
    if (s.p && s.p.fmx) { const o = s.p.fmx.ops; if (o.some(x => x.lfoFm || x.lfoAm)) out.fmx.push([id, o.map(x => x.lfoFm), o.map(x => x.lfoAm)]); }
    if (s.p && s.p.fm6 && s.p.fm6.peg) out.pegs.push(id);
  }
  const mk = SQMK.init(); out.mkTop = Object.keys(mk); out.voc = mk.voc; out.mkInitT = Object.keys(mk.t[0]); out.mkT = mk.t[0];
  return out;
});
console.log(JSON.stringify(r, null, 0).slice(0, 4000)); console.log('errs', errs);
await b.close();
