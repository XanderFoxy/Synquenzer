import fs from 'fs';
const src = fs.readFileSync('v3-qa-mk1-fuzz.mjs', 'utf8').replace("rep.sort(", "globalThis.REPDONE=1;rep.sort(")
  .replace("const r = render(p, ev, {sec: SEC + 2.5, seed: it + 1, at});", "const r = render(p, ev, {sec: SEC + 2.5, seed: it + 1, at}); if (process.env.IT && +process.env.IT === it) { console.log(JSON.stringify(T)); console.log(JSON.stringify(at.map(a=>[+a[0].toFixed(3), a[1]]))); console.log('mkT', JSON.stringify(r.P.mk.T.e2), JSON.stringify({asg:r.P.mk.T.asg,gate:r.P.mk.T.a.gate})); console.log(JSON.stringify(r.P.mk.V.filter(v=>v.on).map(v=>({id:v.id,note:v.note,gate:v.gate,e2s:v.e2s,e2:v.e2,gt:v.gt,fade:v.fade,ghost:v.ghost,isLine:v.isLine,st:v.st})))); }");
fs.writeFileSync('v3-qa-mk1-fuzz-dbg2.mjs', src);
