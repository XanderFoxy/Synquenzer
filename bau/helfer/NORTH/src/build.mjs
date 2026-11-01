// NDSTAGE: puts the ND1 worklet source (md-worklet.js, stripped like ND13/src/build.mjs) and the ND1/ND3 main-thread block
// (md-host.js + md-progs.js + md-levels.json) into bau/helfer/NDSTAGE/index.html. Idempotent: replaces the existing blocks.
// Usage: node bau/helfer/NDSTAGE/src/build.mjs
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
const HERE = path.dirname(url.fileURLToPath(import.meta.url)), OUT = path.join(HERE, '..', 'index.html');
const strip = t => { const i = t.indexOf("'use strict';"); const head = "/* SYNQUENZER drum model engine worklet 'synq-md' (Nachtrag 6, ND1). The commented source with the message protocol is md-worklet.js in the repo. */\n", body = t.slice(i).replace(/\/\*[\s\S]*?\*\//g, ''); return head + body.split('\n').map(l => l.replace(/\s+\/\/ .*$/, '').trim()).filter(l => l && !l.startsWith('//')).join('\n') + '\n'; };
const wk = strip(fs.readFileSync(path.join(HERE, 'md-worklet.js'), 'utf8')), host = fs.readFileSync(path.join(HERE, 'md-host.js'), 'utf8');
let progs = fs.readFileSync(path.join(HERE, 'md-progs.js'), 'utf8');
const lvf = path.join(HERE, 'md-levels.json'); if (fs.existsSync(lvf)) progs = progs.replace('  /*LV*/\n', '  Object.assign(LV, ' + JSON.stringify(JSON.parse(fs.readFileSync(lvf, 'utf8'))) + ');\n');
for (let i = 0; i < wk.length; i++) if (wk.charCodeAt(i) > 127) throw new Error('worklet not ASCII at ' + i);
if (/<\/script/i.test(wk + host + progs) || /nord/i.test(wk + host + progs)) throw new Error('script tag or brand word in a block');
let s = fs.readFileSync(OUT, 'utf8');
const rep = (re, val, what) => { const m = s.match(re); if (!m || s.split(m[0]).length !== 2) throw new Error('block ' + what); s = s.replace(m[0], () => val); };
rep(/<script type="text\/plain" id="sq-md-src">\n[\s\S]*?<\/script>\n/, '<script type="text/plain" id="sq-md-src">\n' + wk + '</script>\n', 'worklet');
rep(/<script>\n\/\* ND1 ===== drum model engine[\s\S]*?\/\* \/ND1 \/ND3 \*\/\n<\/script>\n/, '<script>\n' + host + progs + '/* /ND1 /ND3 */\n</script>\n', 'host');
fs.writeFileSync(OUT, s);
console.log('index.html', s.length, 'bytes; worklet', wk.length, 'host+progs', host.length + progs.length);
