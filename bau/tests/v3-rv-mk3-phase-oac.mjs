// Independent repro (verifier): Schicht with T1 = T2 (INIT AM) in Chromium OfflineAudioContext via the app's mkRender.
// Per-note level of 16 x C4 in Schicht against Einzeln, sine (Sinus× c1 0), triangle and INIT saw; several seeds.
import {chromium} from 'playwright';
const FILE = process.env.MK_FILE || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK3/index.html';
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const ctx = await b.newContext({viewport: {width: 844, height: 390}});
const page = await ctx.newPage(); const errs = [];
page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto('file://' + FILE);
await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
const res = await page.evaluate(async () => {
  SYNQUENZER.setEngine(0, 'mk');
  const base = deep(sndOf(0)), out = {};
  out.initEqual = JSON.stringify(base.p.mk.t[0]) === JSON.stringify(base.p.mk.t[1]);
  out.initMode = base.p.mk.mode;
  const SR = 48000, rmsDb = (x, a, z) => { let e = 0; for (let i = a; i < z; i++) e += x[i] * x[i]; return 10 * Math.log10(e / (z - a) + 1e-30); };
  const ev = []; for (let k = 0; k < 16; k++) ev.push([k * .3, 'on', 60, .8], [k * .3 + .25, 'off', 60]);
  for (const [lab, o1] of [['Sinus', {w: 3, c1: 0}], ['Dreieck', {w: 2}], ['Saege (INIT)', null]]) {
    const s0 = deep(base); if (o1) for (const t of s0.p.mk.t) Object.assign(t.o1, o1);
    s0.p.mk.mode = 0;
    const one = await SYNQUENZER.mkRender(s0, [[0, 'on', 60, .8], [.25, 'off', 60]], {sec: .4, seed: 5});
    const L1 = rmsDb(one.l, Math.round(.05 * SR), Math.round(.2 * SR));
    const s1 = deep(s0); s1.p.mk.mode = 1;
    const rows = [];
    for (const seed of [5, 11, 23]) {
      const r = await SYNQUENZER.mkRender(s1, ev, {sec: 4.9, seed});
      const lv = []; for (let k = 0; k < 16; k++) lv.push(+(rmsDb(r.l, Math.round((k * .3 + .05) * SR), Math.round((k * .3 + .2) * SR)) - L1).toFixed(1));
      rows.push({seed, lv, min: Math.min(...lv), max: Math.max(...lv)});
    }
    // the same Schicht render twice with Einzeln-mode T2 muted (control: the level spread comes from T1 + T2 summing)
    out[lab] = {L1: +L1.toFixed(1), rows};
  }
  return out;
});
console.log('INIT AM: T1 deep-equal T2: ' + res.initEqual + ', MODUS ' + res.initMode);
for (const k of ['Sinus', 'Dreieck', 'Saege (INIT)']) {
  const o = res[k]; console.log(k + ': Einzeln C4 ' + o.L1 + ' dBFS');
  for (const r of o.rows) console.log('  Schicht seed ' + r.seed + ' (dB gegen Einzeln): ' + r.lv.join(' ') + '  | min ' + r.min + ' max ' + r.max);
}
console.log('errors: ' + (errs.join(' | ') || 'none'));
await b.close();
