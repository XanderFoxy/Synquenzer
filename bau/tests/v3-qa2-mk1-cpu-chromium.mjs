// MK1-24 cross-check in real Chromium: the worklet source of index.html, one OfflineAudioContext per config (SEC s),
// wall time of startRendering; silent configs subtract the context overhead; rounds alternate the configs.
import {chromium} from 'playwright';
import {workletSrc, mkPatch} from './v3-mk1-node.mjs';
const SEC = +(process.env.SEC || 40), ROUNDS = +(process.env.ROUNDS || 4);
const AMP = mkPatch(Object.assign({o1: {w: 0, c1: 30, c2: 40}, o2: {w: 1, mod: 2, semi: 7}, mix: {o1: 127, o2: 100, n: 40}, f: {type: 0, cut: 70, res: 100, eg: 30}, a: {dist: 1}, vib: 20}, process.env.AMPX ? JSON.parse(process.env.AMPX) : {}));
const VA = {o1w: 0, o2w: 1, o3w: 0, o1lvl: 1, o2lvl: .8, o3lvl: .6, cutoff: 900, res: .6, poly: 8};
const src = workletSrc() + `
class QaAnalog extends AnalogCore { constructor(o) { super(o); for (const m of (o.processorOptions.__init || [])) this.onMsg(m); } }
registerProcessor('qa-analog', QaAnalog);`;
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const pg = await b.newPage(); await pg.goto('file://' + new URL('./v3-qa2-blank.html', import.meta.url).pathname);
const res = await pg.evaluate(async ({src, AMP, VA, SEC, ROUNDS}) => {
  const url = 'data:application/javascript;base64,' + btoa(src);
  const ev = n => [36, 43, 48, 52].slice(0, n).map((x, k) => [0, 1, k + 1, x, .8, -1]);
  const init = (eng, n) => { const a = [{tempo: {bpm: 120, start: null}}, {mkSeed: 1}]; if (eng === 3) a.push({mkWheel: {mw0: .5}}); a.push({ev: ev(n)}); return a; };
  const cfg = {amS: [3, 0], am1: [3, 1], am4: [3, 4], vaS: [0, 0], va1: [0, 1]};
  const T = {}; for (const k in cfg) T[k] = [];
  let lvl = {};
  for (let r = 0; r < ROUNDS; r++) for (const k in cfg) {
    const [eng, n] = cfg[k], sr = 48000, ctx = new OfflineAudioContext(2, SEC * sr, sr);
    await ctx.audioWorklet.addModule(url);
    const node = new AudioWorkletNode(ctx, 'qa-analog', {numberOfInputs: 0, outputChannelCount: [2], processorOptions: {patch: Object.assign({eng}, eng === 3 ? {} : VA), mods: [], mk: eng === 3 ? AMP : null, __init: init(eng, n)}});
    node.connect(ctx.destination);
    const t0 = performance.now(); const buf = await ctx.startRendering(); T[k].push(performance.now() - t0);
    if (r === 0) { const d = buf.getChannelData(0); let a = 0; for (let i = d.length - 48000; i < d.length; i++) a += d[i] * d[i]; lvl[k] = +(10 * Math.log10(a / 48000 + 1e-30)).toFixed(1); }
  }
  return {T, lvl};
}, {src, AMP, VA, SEC, ROUNDS});
await b.close();
const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
const m = Object.fromEntries(Object.entries(res.T).map(([k, v]) => [k, med(v)]));
const am1 = m.am1 - m.amS, am4 = m.am4 - m.amS, va1 = m.va1 - m.vaS, qn = SEC * 48000 / 128;
console.log('Chromium, ' + SEC + ' s per render, median of ' + ROUNDS + ': AM 1 / VA 1 = ' + (am1 / va1).toFixed(2) + ' x ; AM 4 / VA 1 = ' + (am4 / va1).toFixed(2) + ' x');
console.log('per voice µs/quantum: VA ' + (va1 / qn * 1000).toFixed(1) + ', AM ' + (am1 / qn * 1000).toFixed(1) + ', 4 AM ' + (am4 / qn * 1000).toFixed(1));
console.log('raw ms', JSON.stringify(res.T), 'last-second level dBFS', JSON.stringify(res.lvl));
