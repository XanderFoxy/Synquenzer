// PERC: CPU-Messung – (A) Drum-Spur mit 12 North-Pads, 16tel; (B) dazu eine North-Spur (Synth 4), 16tel über alle 12 Kanäle.
// Last = Anteil der Echtzeit, den die Engine selbst misst (Berichte {t:'load'} je Knoten, MDX.cpu()); je Phase 10 s, Mittel und Spitze.
import { chromium } from 'playwright';
import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = process.argv[2] || path.resolve(HERE, '../index.html');
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 428, height: 926}});
await p.goto('file://' + APP); await p.waitForTimeout(1500); await p.mouse.click(5, 300);
await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 10000}).catch(() => {});
const r = await p.evaluate(async () => {
  const A = SYNQUENZER, T = 3, sleep = ms => new Promise(r => setTimeout(r, ms));
  for (let i = 0; i < NT(); i++) if (i !== 4 && i !== T) for (let s = 0; s < NS(); s++) A.clearClip(i, s);
  for (const id of MDX.ORDER) A.setPadSource(id, 'md');
  const dr = []; for (let k = 0; k < 16; k++) dr.push({t: k / 4, d: .25, n: [36, 42, 38, 42][k % 4], v: .8}); for (let k = 0; k < 16; k += 2) dr.push({t: k / 4 + .125, d: .1, n: 46, v: .5});
  A.setClip(4, 0, {len: 1, notes: dr});
  const meas = async sec => { const L = []; for (let k = 0; k < sec * 2; k++) { await sleep(500); L.push(MDX.cpu()); } L.sort((a, b) => a - b); return {avg: +(L.reduce((s, x) => s + x, 0) / L.length).toFixed(4), max: +L[L.length - 1].toFixed(4), p50: +L[L.length >> 1].toFixed(4)}; };
  A.launchScene(0); A.play(); await sleep(1500);
  const a = await meas(10); const lateA = MDX.info().late;
  A.stop(); await sleep(300);
  setEngine(T, 'north');
  const pat = []; for (let bar = 0; bar < 4; bar++) for (let k = 0; k < 16; k++) pat.push({t: bar * 4 + k / 4, d: .2, n: 60 + ((k * 5 + bar) % 12), v: .6 + .4 * ((k % 4) === 0)});
  A.setClip(T, 0, {len: 4, notes: pat});
  A.launchScene(0); A.play(); await sleep(1500);
  const bb = await meas(10); const q = A.percInfo().tracks.find(x => x.i === T);
  A.stop();
  return {A_drum12: a, B_drum12_plus_north: bb, delta: +(bb.avg - a.avg).toFixed(4), nodes: MDX.info().nodes, percLoadLast: q && q.load, late: MDX.info().late, sr: AU.ctx.sampleRate, lateA};
});
console.log(JSON.stringify(r));
await b.close();
process.exit(r.B_drum12_plus_north.avg < .5 ? 0 : 1);
