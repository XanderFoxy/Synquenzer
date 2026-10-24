// QA VS2b: the same legato phrase with continuous vibrato ±80 ct (5.5 Hz) into the app's fake mic (wired route), base vs new:
// which keyboard keys light (class .vs on #kb keys) during each sung note
import fs from 'fs';
import {chromium} from 'playwright';
import {INIT, EXE, b64, micOn} from './v3-vs2-h.mjs';
const SCR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const FILES = {base: SCR + 'synq-snapshots/G-P1b-gruppe-fix.html', new: SCR + 'dirigent-wt/index.html'};
const x48 = new Float32Array(fs.readFileSync(SCR + 'dirigent-test/v3-qa-vs2breg/vib80-legato-48k.f32').buffer.slice(0));
const ns = [[60, 0.6], [62, 0.6], [64, 0.6], [65, 0.6], [67, 0.6], [65, 0.6], [64, 0.6], [62, 0.6]];
for (const name of ['base', 'new']) {
  const br = await chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']});
  const ctx = await br.newContext({viewport: {width: 390, height: 844}}); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(INIT); await p.goto('file://' + FILES[name]); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version); await p.waitForTimeout(400);
  const m = await micOn(p, 'wired');

  const T = await p.evaluate(b => { const ctx = window.__ctx, t = ctx.currentTime + 0.3; window.__trace = []; let last = null;
    window.__iv = setInterval(() => { const k = [...document.querySelectorAll('#kb .key.vs')].map(e => e.dataset.n || e.getAttribute('data-n') || e.textContent).join('+'); const l = window.SYNQUENZER.vsInfo().lit; const s = l + '|' + k; if (s !== last) { last = s; window.__trace.push([ctx.currentTime, l, k]); } }, 4);
    window.__fake.play(b, t, 48000); return t; }, b64(x48));
  await p.waitForTimeout(6500);
  const tr = await p.evaluate(() => { clearInterval(window.__iv); return window.__trace; });
  // per note (start of the sung note = T + 0.2 + offset): set of lit notes (vsInfo().lit) shown after the first 100 ms
  let t = T + 0.2; const per = [];
  for (const [mm, d] of ns) { const a = t + 0.1, b = t + d; let cur = -1; const shown = new Set();
    for (const [ct, l] of tr) { if (ct < a) cur = l; else if (ct < b) { if (cur >= 0) shown.add(cur); cur = l; } } if (cur >= 0) shown.add(cur);
    per.push(mm + ': ' + [...shown].join('/')); t += d; }
  const kbKeys = [...new Set(tr.map(x => x[2]).filter(Boolean))].slice(0, 12);
  console.log(name, '| sung → lit (vsInfo().lit, from +100 ms):', per.join('  '), '| keys with .vs seen:', JSON.stringify(kbKeys), '| errs', JSON.stringify(errs));
  await br.close();
}
