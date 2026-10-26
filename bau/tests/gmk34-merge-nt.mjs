// G-MK34-merge: MK2-fix note tables (octave waves 35, 61-64) on T2 in Schicht / Split, plus MK4 effects (App mkRender, Chromium)
import {chromium} from 'playwright';
const FILE = process.env.MK_FILE;
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const page = await (await b.newContext({viewport: {width: 844, height: 390}})).newPage(); const errs = [];
page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto('file://' + FILE);
await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
const res = await page.evaluate(async () => {
  SYNQUENZER.setEngine(0, 'mk');
  const base = deep(sndOf(0)), out = [], SR = 48000;
  const rms = (x, a, z) => { let e = 0; for (let i = Math.round(a * SR); i < Math.round(z * SR); i++) e += x[i] * x[i]; return 10 * Math.log10(e / ((z - a) * SR) + 1e-30); };
  const ev = [[0, 'on', 57, .8], [.6, 'off', 57]];
  for (const wn of [35, 61, 64]) {
    const c2 = 2 * (wn - 1);
    const s0 = deep(base); s0.p.mk.mode = 0; Object.assign(s0.p.mk.t[0].o1, {w: 5, c2});
    const one = await SYNQUENZER.mkRender(s0, ev, {sec: .9, seed: 3});
    const s1 = deep(base); s1.p.mk.mode = 1; s1.p.mk.t[0].a.lvl = 0; Object.assign(s1.p.mk.t[1].o1, {w: 5, c2});
    const two = await SYNQUENZER.mkRender(s1, ev, {sec: .9, seed: 3});
    const s2 = deep(s1); s2.p.mk.dly = Object.assign({}, s2.p.mk.dly, {dep: 100});
    const dl = await SYNQUENZER.mkRender(s2, ev, {sec: 1.6, seed: 3});
    out.push({wn, single: +rms(one.l, .2, .55).toFixed(2), t2: +rms(two.l, .2, .55).toFixed(2), echo: +rms(dl.l, .8, 1.5).toFixed(1), dry: +rms(two.l, .75, .85).toFixed(1)});
  }
  return out;
});
let bad = 0;
for (const r of res) { const ok = Math.abs(r.single - r.t2) < .5 && r.single > -40 && r.echo - r.dry > 30; if (!ok) bad++;
  console.log((ok ? 'PASS ' : 'FAIL ') + `Welle ${r.wn}: Einzeln T1 ${r.single} dB, Schicht nur T2 ${r.t2} dB (Δ ≤ 0,5 dB), T2 + DELAY 100 Echo ${r.echo} dB (ohne ${r.dry}; ≥ 30 dB darüber)`); }
console.log((errs.length ? 'FAIL ' : 'PASS ') + 'Konsole: ' + (errs.join(' | ') || 'keine Fehler')); if (errs.length) bad++;
await b.close(); process.exitCode = bad ? 1 : 0; console.log(bad ? bad + ' FAIL' : 'alles bestanden');
