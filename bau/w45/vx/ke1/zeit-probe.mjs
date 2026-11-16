// KE1 Konzept: Zeit je Versuch (warm), wenn die Engine EINMAL geladen ist und nur der Prozessor je Versuch neu entsteht
// (so wuerde ein Nachbau-Worker arbeiten). Keine Audiodateien. Aufruf: nice -n 10 node vx/ke1/zeit-probe.mjs
const SP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad';
process.env.MK_FILE = process.env.MK_FILE || SP + '/rel-4780/index.html';
const {makeScope, mkPatch} = await import(SP + '/dirigent-test/v3-mk1-node.mjs');
const FILE = process.env.MK_FILE;
function run(procs, G, sr, sec, flat, pmk) {
  const N = Math.round(sec * sr / 128) * 128;
  const P = new procs['dirigent-analog']({processorOptions: {patch: flat, mods: [], mk: pmk}});
  P.onMsg({tempo: {bpm: 120, start: null}}); P.onMsg({mkSeed: 1});
  P.onMsg({ev: [[0, 1, 1, 57, 0.8, -1], [Math.min(0.6, sec * 0.6), 2, 1]]});
  const L = new Float32Array(128), R = new Float32Array(128); let e = 0;
  for (let f = 0; f < N; f += 128) { G.currentFrame = f; P.process([], [[L, R]]); for (let i = 0; i < 128; i++) e += L[i] * L[i]; }
  return e;
}
const out = {};
for (const sr of [24000, 48000]) {
  const t0 = performance.now(); const {G, procs} = makeScope(sr, FILE); out['laden_' + sr] = Math.round(performance.now() - t0);
  const va = {eng: 0, o1w: 0, o2w: 1, o1lvl: 1, o2lvl: .5, o3lvl: 0, cutoff: 1500, res: .3, fenv: .4, fD: .25, aA: .005, aD: .3, aS: .6, aR: .2, poly: 6, mode: 0};
  const mk = mkPatch({o1: {w: 0, c1: 0, c2: 0}, o2: {w: 1, mod: 0, semi: 0, tune: 0}, mix: {o1: 127, o2: 64, n: 0}, f: {type: 0, cut: 80, res: 30, eg: 20}});
  for (const [nm, flat, pmk] of [['va', va, null], ['mk', {eng: 3}, mk]]) {
    run(procs, G, sr, 1.0, flat, pmk); run(procs, G, sr, 1.0, flat, pmk);   // aufwaermen
    const ts = []; for (let k = 0; k < 8; k++) { const a = performance.now(); run(procs, G, sr, 1.0, flat, pmk); ts.push(performance.now() - a); }
    ts.sort((a, b) => a - b); out[nm + '_' + sr + '_ms_je_1s'] = +ts[4].toFixed(1);
  }
}
console.log(JSON.stringify(out));
