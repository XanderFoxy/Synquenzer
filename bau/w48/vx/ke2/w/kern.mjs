// Lädt den KE1-Kern (Worker-Quelltext) aus einer Synquenzer-HTML in Node. kern(file) -> KE1C
import fs from 'node:fs';
export function kern(file, tpl) {
  const s = fs.readFileSync(file, 'utf8');
  const blk = id => { const m = s.match(new RegExp('<script type="text/plain" id="' + id + '">([\\s\\S]*?)</script>')); if (!m) throw new Error(id); return m[1]; };
  const wk = blk('sq-worklet-src'), mt = blk('sq-mk-src'), a = mt.indexOf('/*MKT{*/'), b = mt.indexOf('/*}MKT*/');
  const ke = blk('sq-ke1-src'), cut = ke.indexOf('const KE1X'), coreTxt = ke.slice(0, cut);
  const f0 = new Function(coreTxt + '\n;return {ke1WkCompose, ke1CoreFn};')();
  const src = f0.ke1WkCompose(wk, mt.slice(a, b + 8), f0.ke1CoreFn.toString());
  const C = new Function(src + '\n;return KE1C;')();
  if (tpl) C.setTpl(tpl);
  return C;
}
