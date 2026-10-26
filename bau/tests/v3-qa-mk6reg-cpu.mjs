// QA regression MK6: worklet cost with the sequencer OFF, base 4.12.0 vs new 4.14.0, alternating
// (1) app probe "Kern"/"+FX" (live AudioContext, 4 s each), (2) offline mkRender wall time of a 4-voice chord, 8 s
import { chromium } from 'playwright';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const files = {base: S + 'mk6-base-4.12.0.html', new: S + 'mk-br-MK6/index.html'};
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const res = {base: [], new: []};
for (let round = 0; round < +(process.env.ROUNDS || 3); round++) for (const [name, file] of (round % 2 ? Object.entries(files).reverse() : Object.entries(files))) {
  const ctx = await br.newContext({viewport: {width: 844, height: 390}});
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + file); await page.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await page.evaluate(() => { const Q = window.SYNQUENZER; Q.newProject({init: true}); Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.openEditor(); });
  await page.waitForTimeout(1200);
  const r = await page.evaluate(async () => {
    const out = {};
    // offline: INIT + a busy sound (patches, LFO, unison off, 4 voices), 8 s, best of 3
    const s = factorySound(INIT_IDS.mk); Object.assign(s.p.mk.t[0].f, {cut: 70, res: 60, eg: 30}); s.p.mk.t[0].p[0] = {s: 2, d: 4, i: 40}; s.p.mk.t[0].p[1] = {s: 0, d: 0, i: 10};
    const ev = []; for (let t = 0; t < 8; t += .5) for (const n of [48, 55, 60, 64]) { ev.push([t, 'on', n, .8, n * 100 + t * 2]); ev.push([t + .45, 'off', n, 0, n * 100 + t * 2]); }
    const ts = []; for (let k = 0; k < 3; k++) { const t0 = performance.now(); await SYNQUENZER.mkRender(s, ev, {sec: 8}); ts.push(performance.now() - t0); }
    out.offMs = Math.round(Math.min(...ts));
    ensureAudio(); await new Promise(r => setTimeout(r, 400));
    const o = await mkLoad().probe(['kern', 'fx'], {sec: 4});
    out.probe = {load_med: o.load_med, load_max: o.load_max, q: o.quantum_max_ms, cases: (o.cases || []).map(c => c.load_med != null ? +(+c.load_med).toFixed(3) : JSON.stringify(c).slice(0, 80))};
    return out; });
  res[name].push(r); console.log('round', round, name, JSON.stringify(r), errs.length ? errs : '');
  await ctx.close();
}
for (const k of ['base', 'new']) console.log(k, 'offline ms', res[k].map(x => x.offMs).join(' '), '| probe load_med', res[k].map(x => x.probe.load_med).join(' '));
await br.close();
