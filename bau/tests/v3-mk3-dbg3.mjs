import fs from 'fs';
const src = fs.readFileSync('v3-mk3-fpdsp.mjs', 'utf8');
// reuse the generator: eval the top part up to the render loop
const head = src.slice(0, src.indexOf('for (const [top, lab]'));
const mod = head.replace(/^import .*$/mg, '') + '\nexport {ev, at, X1, X2, prog, USC};';
fs.writeFileSync('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk3work/gen.mjs', "import {render, mkDefaults} from '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-mk1-node.mjs';\nimport {db, peak, rms} from '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-mk1-ana.mjs';\n" + mod);
const G = await import('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk3work/gen.mjs');
const {render} = await import('./v3-mk1-node.mjs');
console.log(G.ev.filter(e => e[0] > .8 && e[0] < 1.3).map(e => e.map(x => typeof x === 'number' ? +x.toFixed(3) : x).join(':')).join(' '));
console.log(G.at.filter(e => e[0] > .5 && e[0] < 1.3).map(e => e[0].toFixed(3) + JSON.stringify(e[1])).join(' '));
const r = render(G.prog({mode: 1, tv: 1, scale: 9, usc: G.USC}, G.X1, G.X2), [], {file: new URL('../mk-br-MK3/index.html', import.meta.url).pathname, sec: 1.3, raw: G.ev, at: G.at.slice()});
console.log('ended', r.msgs.filter(m => m.end).map(m => m.end).flat().join(','));
for (const [k, tm] of r.P.mk.tm.entries()) console.log('T' + (k + 1), 'keys', tm.keys.map(x => x.id + '/' + x.note).join(' '), 'voices', tm.V.filter(v => v.on).map(v => v.id + '/' + v.note + (v.ghost ? 'g' : '')).join(' '));
console.log('prog keys', r.P.mk.keys.map(x => x.id).join(' '));
for (const t of [1.0, 1.05, 1.09, 1.1, 1.15]) {
  const r2 = render(G.prog({mode: 1, tv: 1, scale: 9, usc: G.USC}, G.X1, G.X2), [], {file: new URL('../mk-br-MK3/index.html', import.meta.url).pathname, sec: t, raw: G.ev, at: G.at.slice()});
  const M = r2.P.mk; console.log(t, 'mode', M.mode, 'split', M.split, 'ended', r2.msgs.filter(m => m.end).map(m => m.end).flat().join(','), M.tm.map((tm, k) => 'T' + (k + 1) + ' cv' + tm.cv + ' ea' + tm.ea + ' k[' + tm.keys.map(x => x.id).join(' ') + '] v[' + tm.V.filter(v => v.on).map(v => v.id + (v.ghost ? 'g' : '') + (v.fade > 0 ? 'f' : '')).join(' ') + ']').join(' | '), 'pk', M.keys.map(x => x.id).join(' '));
}
