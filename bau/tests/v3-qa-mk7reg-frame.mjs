// QA MK7 regression: inside a sandboxed iframe (Claude viewer stand-in: no same-origin -> storage throws, no mic)
import { chromium } from 'playwright';
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-mk7reg/';
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
for (const [vp, w, h] of [['P1', 390, 844], ['L1', 844, 390]]) for (const n of ['base', 'new']) {
  const ctx = await br.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true});
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + D + 'frame-' + n + '.html'); await p.waitForTimeout(500);
  const f = p.frames().find(x => x !== p.mainFrame());
  await f.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  const r = await f.evaluate(async () => { const Q = SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)); const o = {};
    o.storage = JSON.stringify(Q.storage()).slice(0, 120); o.mic = typeof micAvail === 'function' ? micAvail() : null;
    await Q.loadDemo(); Q.setBpm(240); Q.clearLog(); Q.launchScene(0); await sl(2500); o.notes = Q.noteLog(4000).length; o.te = Q.tickErrors();
    Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.openEditor(); await sl(800); o.ed = Q.runtime().editor;
    // the wave list and the Stimme / mic entries
    o.stimme = Q.stimme ? Q.stimme().avail : null;
    Q.closeEditor(); await sl(200);
    await Q.save().catch(e => (o.saveErr = String(e))); o.saved = true;
    Q.stop(); await sl(200);
    return o; });
  console.log(vp, n, JSON.stringify(r), 'errs', JSON.stringify(errs.filter(e => !/net::|Failed to load resource/.test(e))));
  await p.screenshot({path: D + 'frame-' + vp + '-' + n + '.png'});
  await ctx.close();
}
await br.close();
