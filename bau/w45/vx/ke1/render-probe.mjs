// KE1 Inventar: Probe, ob die echte App-Engine (Worklet-Text aus rel-4780/index.html) in Node rendert.
// Nutzt die vorhandenen Harness-Dateien dirigent-test/v3-mk1-node.mjs (makeScope/render) und v3-mk2-node.mjs (Speicherwellen).
// Aufruf: nice -n 10 node vx/ke1/render-probe.mjs   (schreibt keine Audiodateien, nur Kennzahlen)
const SP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad';
process.env.MK_FILE = process.env.MK_FILE || SP + '/rel-4780/index.html';
const {render, mkPatch} = await import(SP + '/dirigent-test/v3-mk1-node.mjs');
const {renderW} = await import(SP + '/dirigent-test/v3-mk2-node.mjs');
const FILE = process.env.MK_FILE;
const stat = (x, sr) => {
  let pk = 0, e = 0; for (const v of x) { const a = Math.abs(v); if (a > pk) pk = a; e += v * v; }
  // grobe Grundfrequenz: Nulldurchgaenge (steigend) im Bereich 0,2 ... 0,6 s
  let z = 0, a0 = Math.round(0.2 * sr), a1 = Math.round(0.6 * sr); for (let i = a0 + 1; i < a1; i++) if (x[i - 1] < 0 && x[i] >= 0) z++;
  return {peakDb: +(20 * Math.log10(pk + 1e-12)).toFixed(1), rmsDb: +(10 * Math.log10(e / x.length + 1e-20)).toFixed(1), zcHz: +(z / 0.4).toFixed(1), finite: x.every(Number.isFinite)};
};
const ev = [[0, 'on', 57, 0.8], [0.8, 'off', 57]];   // A3 = 220 Hz, 0,8 s gehalten
const out = {};
let t0 = performance.now();
// VA (eng 0): Saege + Puls, Tiefpass, Huellkurven
const va = render(null, ev, {file: FILE, eng: 0, sec: 1.2, flat: {o1w: 0, o2w: 1, o1lvl: 1, o2lvl: .5, o3lvl: 0, cutoff: 1500, res: .3, fenv: .4, fD: .25, aA: .005, aD: .3, aS: .6, aR: .2, poly: 6, mode: 0}});
out.va = Object.assign(stat(va.l, va.sr), {ms: Math.round(performance.now() - t0)});
// MS 2000 (eng 3): Saege, OSC2 Rechteck, Filter LPF24
t0 = performance.now();
const mk = render(mkPatch({o1: {w: 0, c1: 0, c2: 0}, o2: {w: 1, mod: 0, semi: 0, tune: 0}, mix: {o1: 127, o2: 64, n: 0}, f: {type: 0, cut: 80, res: 30, eg: 20}}), ev, {file: FILE, sec: 1.2, mw0: 0});
out.ms2000 = Object.assign(stat(mk.l, mk.sr), {ms: Math.round(performance.now() - t0)});
// MS 2000 Speicherwelle Nr. 23 (OSC1 w 5, STEUER 2 = 2n-2 = 44)
t0 = performance.now();
const sw = renderW(mkPatch({o1: {w: 5, c1: 0, c2: 44}, mix: {o1: 127, o2: 0, n: 0}}), ev, {file: FILE, sec: 1.2, mw0: 0}, [23]);
out.ms2000_speicherwelle23 = Object.assign(stat(sw.l, sw.sr), {ms: Math.round(performance.now() - t0)});
console.log(JSON.stringify(out));
