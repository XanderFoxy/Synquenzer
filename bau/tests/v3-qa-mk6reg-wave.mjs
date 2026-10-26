// QA regression MK6: stored-wave renders (MK2-12 method) repeated in base and new: how often does a wave come out wrong?
import { chromium } from 'playwright';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const files = {base: S + 'mk6-base-4.12.0.html', new: S + 'mk-br-MK6/index.html'};
const WAVES = (process.env.WAVES || '30,36,12,47,58').split(',').map(Number), REP = +(process.env.REP || 6);
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const res = {};
for (let round = 0; round < +(process.env.ROUNDS || 2); round++) for (const [name, file] of Object.entries(files)) {
  const ctx = await br.newContext({viewport: {width: 844, height: 390}});
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + file); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.openEditor(); });
  await page.waitForTimeout(1500);
  const r = await page.evaluate(async ([WAVES, REP]) => {
    const M = MKUI.MKTAB, SR = 48000, F = 187.5, note = 69 + 12 * Math.log2(F / 440), out = [];
    const amp = (x, i0, n, f) => { let re = 0, im = 0, ws = 0; for (let i = 0; i < n; i++) { const w = .5 - .5 * Math.cos(2 * Math.PI * i / n), a = 2 * Math.PI * f * i / SR; re += x[i0 + i] * w * Math.cos(a); im += x[i0 + i] * w * Math.sin(a); ws += w; } return 2 * Math.hypot(re, im) / ws; };
    for (let rep = 0; rep < REP; rep++) for (const n of WAVES) {
      const s = factorySound(INIT_IDS.mk); Object.assign(s.p.mk.t[0], {o1: {w: 5, c1: 0, c2: 2 * n - 2}, f: Object.assign(s.p.mk.t[0].f, {cut: 127, res: 0}), a: Object.assign(s.p.mk.t[0].a, {gate: 1})});
      const x = (await SYNQUENZER.mkRender(s, [[0, 'on', note, .8]], {sec: .5})).l, rr = M.r(n), ft = F / rr, P = Math.round(SR / ft * 8), i0 = 9600;
      const ref = M.isOct(n) ? M.harm(n, F).A : M.data()[n].a, mx = Math.max(...Array.from({length: 16}, (_, k) => ref[k + 1] || 0));
      const d = []; for (let k = 1; k <= 16; k++) { const L0 = 20 * Math.log10((ref[k] || 1e-12) / mx); if (L0 < -40) continue; d.push(20 * Math.log10(amp(x, i0, P, k * ft) + 1e-12) - L0); }
      const med = d.slice().sort((a, b) => a - b)[d.length >> 1], dev = Math.max(...d.map(v => Math.abs(v - med)));
      // where in time does it change? spectrum deviation in 4 windows
      let saw = null; if (dev > 1) { const ds = []; for (let k = 1; k <= 16; k++) ds.push(20 * Math.log10(amp(x, i0, P, k * ft) + 1e-12) + 20 * Math.log10(k)); const m2 = ds.slice().sort((a, b) => a - b)[8]; saw = +Math.max(...ds.map(v => Math.abs(v - m2))).toFixed(2);
        // the same in 4 windows over the note (early / late) to see whether it changes during the render
        saw = [saw, [2400, 9600, 14400, 19200].map(j => { const dd = []; for (let k = 1; k <= 16; k++) { const L0 = 20 * Math.log10((ref[k] || 1e-12) / mx); if (L0 < -40) continue; dd.push(20 * Math.log10(amp(x, j, P, k * ft) + 1e-12) - L0); } const md = dd.slice().sort((a, b) => a - b)[dd.length >> 1]; return +Math.max(...dd.map(v => Math.abs(v - md))).toFixed(1); }).join('/')]; }
      out.push([n, +dev.toFixed(2), saw ? JSON.stringify(saw) : '']);
    }
    return out; }, [WAVES, REP]);
  (res[name] = res[name] || []).push(...r);
  console.log('round', round, name, 'bad', r.filter(x => x[1] > 1).map(x => x.join(':')).join(' ') || '-', 'errs', errs.length);
  await ctx.close();
}
for (const k of Object.keys(res)) console.log(k, 'renders', res[k].length, 'bad', res[k].filter(x => x[1] > 1).length);
await br.close();
