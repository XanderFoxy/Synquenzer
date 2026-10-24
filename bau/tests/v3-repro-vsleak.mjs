// Independent repro: 🎤 on, route speaker, app output leaks into fake mic at gain G (12 ms delay).
// Keys on an empty Synth 3 slot, then FANG via a real UI click. Logs lit messages vs last key time.
import { chromium } from 'playwright';
import { INIT, EXE } from './v3-vs2-h.mjs';
const FILE = 'file:///tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-wt/index.html';
const LEAK = () => {
  const oc = AudioNode.prototype.connect; window.__dst = [];
  AudioNode.prototype.connect = function (d, ...a) { if (d instanceof AudioDestinationNode) window.__dst.push(this); return oc.call(this, d, ...a); };
  window.__leak = g0 => { const ctx = window.__ctx, g = ctx.createGain(); g.gain.value = g0; const dl = ctx.createDelay(0.1); dl.delayTime.value = 0.012; oc.call(g, dl); oc.call(dl, window.__fake.bus); let n = 0; for (const x of window.__dst) { try { oc.call(x, g); n++; } catch (e) {} } return n; };
};
const gains = (process.argv[2] || '0,0.1,0.01').split(',').map(Number);
for (const G of gains) {
  const br = await chromium.launch({executablePath: EXE, args: ['--autoplay-policy=no-user-gesture-required']});
  const p = await (await br.newContext({viewport: {width: 390, height: 844}})).newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.addInitScript(INIT); await p.addInitScript(LEAK);
  await p.goto(FILE); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version); await p.waitForTimeout(500);
  await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); return SYNQUENZER.stimmeStart({route: 'speaker', cal: false}); });
  await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live', null, {timeout: 10000}); await p.waitForTimeout(800);
  const route = await p.evaluate(() => SYNQUENZER.stimme().route);
  if (G > 0) await p.evaluate(g => window.__leak(g), G);
  // log every lit message the worklet sends (wrap the global function)
  await p.evaluate(() => { window.__lit = []; const o = window.vsLitMsg; window.vsLitMsg = (run, d) => { window.__lit.push([Math.round(performance.now()), d.lit]); return o(run, d); }; });
  await p.evaluate(() => { const Q = SYNQUENZER; Q.newProject({init: true}); Q.setBpm(120);
    Q.setClip(4, 0, {len: 1, key: {root: 9, scale: 'aeolian'}, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 1, d: .1, n: 42, v: .7}, {t: 2, d: .1, n: 38, v: .9}, {t: 3, d: .1, n: 42, v: .7}]});
    Q.selectSlot(2, 0); Q.launchScene(0); });
  const wb = b => p.waitForFunction(x => SYNQUENZER.runtime().beat > x, b, {timeout: 40000, polling: 10});
  const ns = [72, 74, 76, 79, 76, 74, 72, 71], keyT = [], greenDuringKeys = [];
  await wb(3.8);
  for (let k = 0; k < 8; k++) { await wb(4 + k - .03); keyT.push(await p.evaluate(n => { SYNQUENZER.tap(n, 300); return Math.round(performance.now()); }, ns[k]));
    await p.waitForTimeout(150); greenDuringKeys.push(await p.evaluate(() => SYNQUENZER.vsInfo().litKey)); }
  await wb(12.6);
  const before = await p.evaluate(() => ({mode: SYNQUENZER.runtime().fangMode, label: document.getElementById('bFang').textContent,
    capLastMax: Math.round(Math.max(...CAP.last)), lastVoice: Math.round(VS.lastVoice), lit: window.__lit.slice(), info: (({litN, voiceRecent}) => ({litN, voiceRecent}))(SYNQUENZER.vsInfo())}));
  const lastKey = keyT[keyT.length - 1];
  const litAfterLastKey = before.lit.filter(x => x[0] > lastKey);
  await p.click('#bFang'); await p.waitForTimeout(3000);
  const after1 = await p.evaluate(() => { const Q = SYNQUENZER, c = Q.getClip(2, 0), m = Q.project().tracks[5];
    return {synth3: c ? c.notes.map(n => n.n).join(',') : null, mel: m ? m.clips.map((c, i) => c ? i + ':' + c.notes.map(n => n.n).join(',') : null).filter(Boolean) : null,
      pops: [...document.querySelectorAll('.pop')].filter(x => x.offsetParent).map(x => x.className), undo: JSON.stringify(Q.undoInfo().top && Q.undoInfo().top.label)}; });
  console.log(`== gain ${G} route ${route}`);
  console.log(' keys at', keyT.join(' '), '| litKey 150ms after each key:', greenDuringKeys.join(' '));
  console.log(' before FANG:', JSON.stringify({mode: before.mode, label: before.label, info: before.info, capLastMax: before.capLastMax, lastVoice: before.lastVoice, lastVoiceMinusLastKey: before.lastVoice - lastKey}));
  console.log(' lit msgs total', before.lit.length, '| after last key:', JSON.stringify(litAfterLastKey));
  console.log(' after FANG click:', JSON.stringify(after1));
  // can the user recover? drop the result sheet via the UI-equivalent and tap FANG again right away
  if (after1.mel && after1.mel.length) {
    await p.evaluate(() => { try { SYNQUENZER.vsResultDrop(); } catch (e) {} });
    await p.waitForTimeout(300);
    const m2 = await p.evaluate(() => ({mode: SYNQUENZER.runtime().fangMode, label: document.getElementById('bFang').textContent}));
    await p.click('#bFang').catch(e => m2.clickErr = String(e).slice(0, 80)); await p.waitForTimeout(3000);
    m2.after = await p.evaluate(() => { const c = SYNQUENZER.getClip(2, 0); return {synth3: c ? c.notes.map(n => n.n).join(',') : null, pops: [...document.querySelectorAll('.pop')].filter(x => x.offsetParent).map(x => x.className)}; });
    console.log(' second FANG after Verwerfen:', JSON.stringify(m2));
  }
  console.log(' errs', JSON.stringify(errs.slice(0, 3)));
  await br.close();
}
