// MK4-01 in Chromium: app mkRender (OfflineAudioContext, app worklet) of random AM sounds with effects at 0 (all Mod-FX types,
// any TEMPO / delay settings / EQ freqs), the INIT AM, a VA and an FM6 sound: MK4 against MK2 (4.10.0), max |delta|
import { chromium } from 'playwright';
const [A, B] = process.argv.slice(2);
const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
async function renders(file) {
  const ctx = await browser.newContext({viewport: {width: 844, height: 390}}); const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + file); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  const out = await page.evaluate(async () => {
    let s = 99; const rnd = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }, ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
    const res = [], ev = [[0, 'on', 48, .8], [.05, 'on', 55, .7], [.1, 'on', 64, .9], [.6, 'off', 48], [.7, 'off', 55], [.8, 'off', 64]];
    const base = factorySound(INIT_IDS.mk);
    for (let k = 0; k < 10; k++) {
      const snd = JSON.parse(JSON.stringify(base)), t = snd.p.mk.t[0];
      if (k) { t.o1.w = ri(0, 4); t.o1.c1 = ri(0, 127); t.o2.w = ri(0, 2); t.o2.mod = ri(0, 3); t.mix = {o1: ri(40, 127), o2: ri(0, 127), n: ri(0, 40)}; t.f = {type: ri(0, 3), cut: ri(30, 127), res: ri(0, 100), eg: ri(-63, 63), vel: 0, kbd: ri(-63, 63)}; t.asg = ri(0, 2); t.a.dist = ri(0, 1); t.l1.f = ri(0, 127); }
      snd.p.mk.mfx = {type: k % 3, spd: ri(0, 127), dep: 0}; snd.p.mk.dly = {type: ri(0, 2), sync: ri(0, 1), time: ri(0, 127), note: ri(0, 14), dep: 0}; snd.p.mk.eq = {lf: ri(40, 1000), lg: 0, hf: ri(1000, 18000), hg: 0};
      const r = await SYNQUENZER.mkRender(snd, ev, {sec: 1.2, seed: 5}); res.push([Array.from(r.l), Array.from(r.r)]);
    }
    for (const id of ['init-analog', 'init-fm6']) { try { const snd = factorySound(id === 'init-analog' ? INIT_IDS.analog : INIT_IDS.fm6); const r = await SYNQUENZER.mkRender(snd, ev, {sec: 1, seed: 5}); res.push([Array.from(r.l), Array.from(r.r)]); } catch (e) { res.push(['err ' + e]); } }
    return res;
  });
  await ctx.close(); return {out, errs};
}
const a = await renders(A), b = await renders(B);
let worst = 0, n = 0, nz = 0;
for (let i = 0; i < a.out.length; i++) { const x = a.out[i], y = b.out[i]; if (typeof x[0] === 'string' || typeof y[0] === 'string') { console.log('render', i, x[0], y[0]); continue; } n++; for (let c = 0; c < 2; c++) for (let j = 0; j < x[c].length; j++) { worst = Math.max(worst, Math.abs(x[c][j] - y[c][j])); if (x[c][j] !== 0) nz++; } }
console.log((worst === 0 ? 'PASS' : 'FAIL') + ' MK4-01 (Chromium mkRender) ' + n + ' Renders MK4 vs MK2: max |Δ| ' + worst + ', nonzero samples ' + nz, a.errs.concat(b.errs).join(' | '));
await browser.close();
