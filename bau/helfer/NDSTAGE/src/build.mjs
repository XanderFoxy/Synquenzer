// Builds bau/helfer/ND13/index.html from the base app (bau/werkzeug/vs-base-B.html) + ND1/ND3 blocks + one-line hooks.
// Usage: node build.mjs   (idempotent: always starts from the base)
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
const HERE = path.dirname(url.fileURLToPath(import.meta.url)), ROOT = path.join(HERE, '..', '..', '..', '..');
const base = fs.readFileSync(path.join(ROOT, 'bau/werkzeug/vs-base-B.html'), 'utf8');
// the worklet text in the app: block comments after the header, full-line comments and indentation removed (budget)
const strip = t => { const i = t.indexOf("'use strict';"); const head = "/* SYNQUENZER drum model engine worklet 'synq-md' (Nachtrag 6, ND1). The commented source with the message protocol is md-worklet.js in the repo. */\n", body = t.slice(i).replace(/\/\*[\s\S]*?\*\//g, ''); return head + body.split('\n').map(l => l.replace(/\s+\/\/ .*$/, '').trim()).filter(l => l && !l.startsWith('//')).join('\n') + '\n'; };
const wk = strip(fs.readFileSync(path.join(HERE, 'md-worklet.js'), 'utf8')), host = fs.readFileSync(path.join(HERE, 'md-host.js'), 'utf8');
let progs = fs.readFileSync(path.join(HERE, 'md-progs.js'), 'utf8');
const lvf = path.join(HERE, 'md-levels.json'); if (fs.existsSync(lvf)) progs = progs.replace('  /*LV*/\n', '  Object.assign(LV, ' + JSON.stringify(JSON.parse(fs.readFileSync(lvf, 'utf8'))) + ');\n');
for (let i = 0; i < wk.length; i++) if (wk.charCodeAt(i) > 127) throw new Error('worklet not ASCII at ' + i);
if (/<\/script/i.test(wk) || /nord/i.test(wk + host + progs)) throw new Error('script tag or brand word in a block');
let s = base; const once = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) throw new Error('anchor ' + n + 'x: ' + a.slice(0, 60)); s = s.replace(a, b); };
// 1. worklet source (text/plain, loaded only by MDX.load)
once("registerProcessor('dirigent-hall', DirigentHall);\n</script>\n", "registerProcessor('dirigent-hall', DirigentHall);\n</script>\n<script type=\"text/plain\" id=\"sq-md-src\">\n" + wk + "</script>\n");
// 2. main-thread blocks after SynthHost
once("  window.SynthHost = H;\n})();\n</script>\n", "  window.SynthHost = H;\n})();\n</script>\n<script>\n" + host + progs + "/* /ND1 /ND3 */\n</script>\n");
// 3. hooks (one line each)
once("if (N && N.E && !N.gone) s += N.E.load || 0; } catch (e) {} return s; }", "if (N && N.E && !N.gone) s += N.E.load || 0; } catch (e) {} try { s += MDX.cpu(); } catch (e) {} return s; }   /* ND1: engine load */");
once("  try { const N = PV.chain; if (N && N.E && !N.gone) N.E.set(limited(N.sound.p)); } catch (e) {}\n", "  try { const N = PV.chain; if (N && N.E && !N.gone) N.E.set(limited(N.sound.p)); } catch (e) {}\n  try { MDX.setLim(LIM.level); } catch (e) {}   /* ND1: limiter stage to the drum model engine */\n");
once("    storage: kv ? kv.mode : 'memory', hint: AU.hint};", "    md: MDX.info(),   /* ND1 */\n    storage: kv ? kv.mode : 'memory', hint: AU.hint};");
once("  mkRender: (sound, ev, o) => mkRender(sound, ev, o),", "  mdInfo: () => MDX.info(), mdRender: o => MDX.render(o), mdTest: m => Promise.all([...MDX.nodes].map(E => E.test(m))),   /* ND1 test API */\n  mkRender: (sound, ev, o) => mkRender(sound, ev, o),");
once("'vsInfo', 'vsResult', 'vsAnalyseSignal', 'vsClock']);", "'vsInfo', 'vsResult', 'vsAnalyseSignal', 'vsClock', 'mdInfo', 'mdRender', 'mdTest']);");
fs.writeFileSync(path.join(HERE, '..', 'index.html'), s);
console.log('index.html', s.length, 'bytes (+' + (s.length - base.length) + ')', 'worklet', wk.length, 'host+progs', host.length + progs.length);
