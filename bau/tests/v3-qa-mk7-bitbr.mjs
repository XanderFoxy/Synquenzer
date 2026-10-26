// QA MK7-12 in Chromium: synth programs without input through the app's own mkRender (OfflineAudioContext, real node with the new
// input) — MK7 against 4.12.0, bit-equal
import { chromium } from 'playwright';
const D = new URL('..', import.meta.url).pathname, FILES = {mk7: D + 'mk-br-MK7/index.html', pre: D + 'synq-snapshots/G-MK34-merge.html'};
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const out = {};
for (const [k, f] of Object.entries(FILES)) {
  const p = await (await br.newContext()).newPage(); await p.goto('file://' + f); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  out[k] = await p.evaluate(async () => {
    const Q = SYNQUENZER, res = {}, ev = [[0, 'on', 48, .8], [0, 'on', 64, .8], [.6, 'off', 48], [.9, 'off', 64]];
    const pick = x => Array.from(x.filter((_, i) => i % 7 === 0));
    Q.setEngine(0, 'mk'); let s = Q.getSound(0); s.p.mk.t[0].o1 = {w: 1, c1: 40, c2: 30}; s.p.mk.t[0].mix = {o1: 127, o2: 60, n: 30}; s.p.mk.t[0].f.res = 90;
    let r = await Q.mkRender(s, ev, {sec: 1.2}); res.amSingle = pick(r.l);
    s.p.mk.mode = 1; s.p.mk.mfx = Object.assign(s.p.mk.mfx || {}, {type: 1, spd: 50, dep: 80}); r = await Q.mkRender(s, ev, {sec: 1.2}); res.amDualFx = pick(r.l);
    Q.setEngine(2, 'analog'); s = Q.getSound(2); r = await Q.mkRender(s, ev, {sec: 1.2}); res.va = pick(r.l);
    return res;
  });
}
for (const c of Object.keys(out.mk7)) { const a = out.mk7[c], b = out.pre[c]; let md = 0; for (let i = 0; i < a.length; i++) md = Math.max(md, Math.abs(a[i] - b[i])); let e = 0; for (const v of a) e = Math.max(e, Math.abs(v)); console.log(c + ': max |Δ| = ' + md + ' (Spitze ' + e.toFixed(3) + ', n ' + a.length + ')'); }
await br.close();
