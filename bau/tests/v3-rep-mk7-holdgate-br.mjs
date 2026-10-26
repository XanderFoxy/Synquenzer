// Independent Chromium repro: held vocoder sound (voc.hold) with SCHWELLE > 0, no modulator source, app worklet.
import { chromium } from 'playwright';
const FILE = new URL('../mk-br-MK7/index.html', import.meta.url).pathname, EXE = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const br = await chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']});
const p = await (await br.newContext({viewport: {width: 390, height: 844}})).newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
await p.evaluate(() => { ensureAudio(); }); await p.waitForFunction(() => SynthHost.state === 'ready', null, {timeout: 10000});
const r = await p.evaluate(async () => {
  const Q = SYNQUENZER; Q.setEngine(0, 'mk'); await new Promise(r => setTimeout(r, 300));
  Q.mkSet(0, 'mode', 3); await new Promise(r => setTimeout(r, 200));
  const lev = (x, a, b) => { let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i]; return +(10 * Math.log10(s / (b - a) + 1e-30)).toFixed(1); };
  const out = {mode: Q.mkGet(0).mode, voc: (({th, gs, efs}) => ({th, gs, efs}))(Q.mkGet(0).voc)};
  for (const [th, gs] of [[0, 0], [1, 0], [15, 64], [15, 127]]) {
    const s = Q.getSound(0); s.p.mk.mode = 3; s.p.mk.voc.hold = new Array(16).fill(85); s.p.mk.voc.th = th; s.p.mk.voc.gs = gs;
    const a = await Q.mkRender(s, [[0, 'on', 57, .8]], {sec: 2.5});
    out['th' + th + ' gs' + gs] = {'0-0.1s': lev(a.l, 0, 4800), '0.5-1s': lev(a.l, 24000, 48000), '2-2.5s': lev(a.l, 96000, 120000)};
  }
  return out;
});
console.log(JSON.stringify(r, null, 1)); console.log('errs', errs);
await br.close();
