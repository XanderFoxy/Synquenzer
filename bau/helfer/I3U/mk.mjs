// I3U build: copies the sources in src/ into index.html between the markers /*@@NAME@@*/ … /*@@/NAME@@*/.
// node mk.mjs [--out <file>]   (default: index.html in place)
import fs from 'fs'; import path from 'path'; import {fileURLToPath} from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const MAP = {FORMSTUB: 'form-stub.js', API: 'api.js', FORMCLEAN: 'formclean.js', FORMUI: 'formui.js', NEIGEN: 'neigen.js'};
const oi = process.argv.indexOf('--out'), out = oi > 0 ? path.resolve(process.argv[oi + 1]) : path.join(HERE, 'index.html');
let s = fs.readFileSync(path.join(HERE, 'index.html'), 'utf8');
for (const [k, f] of Object.entries(MAP)) {
  const fp = path.join(HERE, 'src', f); if (!fs.existsSync(fp)) continue;
  let src = fs.readFileSync(fp, 'utf8').replace(/\s+$/, '') + '\n';
  if (/<\/script/i.test(src)) throw new Error(f + ': enthält </script');
  src = src.replace(/^if \(typeof module[^\n]*\n/m, '');      // the Node export line stays out of the page
  const a = `/*@@${k}@@*/\n`, b = `/*@@/${k}@@*/`, i = s.indexOf(a), j = s.indexOf(b);
  if (i < 0 || j < i) throw new Error('Marke fehlt: ' + k);
  s = s.slice(0, i + a.length) + src + s.slice(j);
}
fs.writeFileSync(out, s);
console.log('gebaut →', out, (s.length / 1024).toFixed(0) + ' KB');
