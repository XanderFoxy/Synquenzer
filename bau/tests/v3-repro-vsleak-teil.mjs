// QA VS2: FANG TEIL in ♪ SPIELEN (clip change, 8 s no key) with 🎤 on over the speaker, app output audible to the mic
import { chromium } from 'playwright';
import { INIT, EXE } from './v3-vs2-h.mjs';
const SCR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const FILES = {base: SCR + 'synq-snapshots/V2d-fix.html', new: SCR + 'dirigent-wt/index.html'};
const BLEED = () => { const oc = AudioNode.prototype.connect; window.__toDest = [];
  AudioNode.prototype.connect = function (d, ...a) { if (d && d instanceof AudioDestinationNode) window.__toDest.push(this); return oc.call(this, d, ...a); };
  window.__bleed = g0 => { const F = window.__fake, ctx = window.__ctx; const g = ctx.createGain(); g.gain.value = g0; oc.call(g, F.bus); for (const n of window.__toDest) { try { oc.call(n, g); } catch (e) {} } return window.__toDest.length; }; };
for (const name of ['new']) {
  const br = await chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']});
  const p = await (await br.newContext({viewport: {width: 390, height: 844}})).newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.addInitScript(INIT); await p.addInitScript(BLEED);
  await p.goto('file://' + FILES[name]); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version); await p.waitForTimeout(500);
  await p.evaluate(() => { const Q = SYNQUENZER; Q.play(); Q.stop(); return Q.stimmeStart({route: 'speaker', cal: false}); });
  await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live', null, {timeout: 10000}); await p.waitForTimeout(600);
  await p.evaluate(() => window.__bleed(0.028));
  await p.evaluate(async () => { const Q = SYNQUENZER; await Q.loadDemo(); Q.setBpm(120); Q.launchScene(0); });
  await p.waitForTimeout(2500); await p.evaluate(() => SYNQUENZER.launchClip(1, 1)); await p.waitForTimeout(6000);
  const r = await p.evaluate(() => { const b = document.getElementById('bFang'); return {mode: SYNQUENZER.runtime().fangMode, label: b.textContent, lit: b.className}; });
  await p.evaluate(() => document.getElementById('bFang').click()); await p.waitForTimeout(2500);
  r.after = await p.evaluate(() => ({pops: [...document.querySelectorAll('.pop')].filter(x => getComputedStyle(x).display !== 'none' && x.getBoundingClientRect().height > 0).map(x => x.className), mel: (SYNQUENZER.project().tracks[5] || {clips: []}).clips.map((c, i) => c ? i + ':' + c.notes.length : null).filter(Boolean)}));
  console.log(name, JSON.stringify(r), 'errs', JSON.stringify(errs));
  await br.close();
}
