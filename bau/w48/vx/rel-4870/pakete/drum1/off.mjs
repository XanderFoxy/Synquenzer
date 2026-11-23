// Offline-Auswertung: node off.mjs <code.js> [lieder] → Treffer je Lied auf den gedumpten Drum-Ebenen (dump/*.f32), ±50 ms
import fs from 'node:fs'; import vm from 'node:vm';
const code = fs.readFileSync(process.argv[2], 'utf8'), ctx = {Math, Float32Array, Float64Array, Uint8Array, Int32Array, Map, Set, Array, Object, console, performance};
vm.createContext(ctx); vm.runInContext(code + '\nthis.H=spk11bHits;', ctx);
const tot = {}; const names = (process.argv[3] || 'bauer,dicht,intro,p80,p128,p174,hart').split(',');
for (const n of names) {
  if (!fs.existsSync('dump/' + n + '.f32')) continue;
  const J = JSON.parse(fs.readFileSync('dump/' + n + '.json')), b = fs.readFileSync('dump/' + n + '.f32'), x = new Float32Array(b.buffer, b.byteOffset, b.length / 4);
  const nS = Math.floor((x.length / J.sr - 0.1) / J.stepS), t0 = performance.now(), hs = ctx.H(x, J.sr, J.stepS, nS, null, {spb: Math.round(J.bar / J.stepS)}), ms = performance.now() - t0;
  const hits = hs.map(h => [J.a0 + h.k * J.stepS, h.w]);
  const sc = (w, tru) => { const pr = hits.filter(x => x[1] === w); let hit = 0; const used = new Set(); for (const t of tru) { const i = pr.findIndex((x, k) => !used.has(k) && Math.abs(x[0] - t) <= 0.05); if (i >= 0) { used.add(i); hit++; } } return {wahr: tru.length, treffer: hit, zuviel: pr.length - hit}; };
  const z = {kick: sc('k', J.truth.kick), snare: sc('s', J.truth.snare), hihat: sc('h', J.truth.hat)};
  for (const [w, v] of Object.entries(z)) { const t = tot[w] || (tot[w] = {wahr: 0, treffer: 0, zuviel: 0}); t.wahr += v.wahr; t.treffer += v.treffer; t.zuviel += v.zuviel; }
  console.log(n.padEnd(6) + ' kick ' + z.kick.treffer + '/' + z.kick.wahr + ' +' + z.kick.zuviel + ' · snare ' + z.snare.treffer + '/' + z.snare.wahr + ' +' + z.snare.zuviel + ' · hihat ' + z.hihat.treffer + '/' + z.hihat.wahr + ' +' + z.hihat.zuviel + ' · ' + ms.toFixed(1) + ' ms ' + JSON.stringify(hs.info && hs.info.lern || ''));
}
const f = w => tot[w] ? tot[w].treffer + '/' + tot[w].wahr + ' +' + tot[w].zuviel : '-';
console.log('SUMME kick ' + f('kick') + ' · snare ' + f('snare') + ' · hihat ' + f('hihat'));
