import { open, APP } from './v3-qa-mk3reg-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/MK2.html';
const res = {};
for (const [name, file] of [['base', BASE], ['new', APP]]) { const {b, p, errs} = await open({width: 390, height: 844}, file, true);
  res[name] = await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.newProject({init: true}); Q.setBpm(240); Q.setEngine(0, 'mk'); Q.setEngine(1, 'mk'); await new Promise(r => setTimeout(r, 500));
    Q.mkSet(0, 'mode', 2); Q.mkSet(1, 'mode', 1); Q.mkSet(0, 'split', 64);
    const K = {root: 9, scale: 'aeolian'}, N = (t, n, d) => ({t, d: d || .4, n, v: .8});
    Q.setClip(0, 0, {len: 1, key: K, notes: [N(0, 57), N(1, 60), N(2, 64), N(3, 69)]}); Q.setClip(1, 0, {len: 1, key: K, notes: [N(0, 69, 1.5), N(0, 72, 1.5), N(2, 76, 1.5)]});
    Q.songFromChain([{scene: 0, bars: 2}]);
    const got = []; window.claude = {use: async k => (k === 'downloads' ? {save: async ({filename, data}) => { got.push({filename, z: new Uint8Array(await data.arrayBuffer())}); }} : null)};
    for (const mode of ['scene', 'all', 'song']) { await Q.exportMidi({mode, scene: 0}); await new Promise(r => setTimeout(r, 700)); }
    return got.map(g => { const z = g.z, dv = new DataView(z.buffer); const nl = dv.getUint16(26, true), xl = dv.getUint16(28, true), cs = dv.getUint32(18, true); return g.filename + ' ' + Array.from(z.slice(30 + nl + xl, 30 + nl + xl + cs)).join(','); }); });
  res[name].errs = errs; await b.close(); }
for (let i = 0; i < 3; i++) console.log(res.new[i].split(' ')[0], res.base[i] === res.new[i] ? 'same .mid bytes' : 'DIFF\n new ' + res.new[i].slice(0, 400) + '\n base ' + res.base[i].slice(0, 400));
console.log('errs', res.base.errs, res.new.errs);
