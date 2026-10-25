// QA regression V2e′: boot time; 8 s fps/long tasks with editor open (scene), with a part running, and in the song view (squares)
import { open, NEW, BASE } from './v3-qa-v2e2reg-pw.mjs';
import { chromium } from 'playwright';
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const boot = {base: [], new: []};
for (let i = 0; i < 5; i++) for (const [k, f] of [['base', BASE], ['new', NEW]]) { const p = await br.newPage({viewport: {width: 390, height: 844}}); const t0 = Date.now(); await p.goto('file://' + f); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime && window.SYNQUENZER.storage().booted, null, {polling: 5}); boot[k].push(Date.now() - t0); await p.close(); }
await br.close();
const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
console.log('boot ms', JSON.stringify(boot), 'median base', med(boot.base), 'new', med(boot.new));
for (const [name, file] of [['base', BASE], ['new', NEW]]) for (const mode of ['scene', 'part', 'song']) {
  const {b, p, errs} = await open({width: 390, height: 844}, file, true);
  await p.evaluate(async mode => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.setBpm(120);
    if (mode === 'part') { Q.setPart(0, {name: 'A', slots: [{s: 0}, {s: 0}, {s: 0}, null, {s: 0}, null], chords: {len: 4, ch: [0, 1, 2, 3].map(k => ({b: k * 4, tg: Q.parseChord(['Am', 'F', 'C', 'G'][k])}))}}); Q.launchPart(0); Q.selectSlot(0, 0); Q.openEditor(); }
    else if (mode === 'song') { Q.songFromChain([{scene: 0, bars: 8}, {scene: 1, bars: 8}, {scene: 0, bars: 8}]); Q.songView(true); Q.songPlay(0); }
    else { Q.launchScene(0); Q.selectSlot(0, 0); Q.openEditor(); } }, mode);
  await p.waitForTimeout(1500);
  const m = await p.evaluate(() => new Promise(res => {
    const lt = []; let po; try { po = new PerformanceObserver(l => { for (const e of l.getEntries()) lt.push(e.duration); }); po.observe({type: 'longtask', buffered: false}); } catch (e) {}
    const fr = []; let last = performance.now(); const t0 = last;
    const f = now => { fr.push(now - last); last = now; if (now - t0 < 8000) requestAnimationFrame(f); else { po && po.disconnect(); const s = fr.slice().sort((a, b) => a - b); res({fps: +(1000 / s[Math.floor(s.length / 2)]).toFixed(1), frames: fr.length, p95: +s[Math.floor(s.length * .95)].toFixed(1), max: +s[s.length - 1].toFixed(1), long: lt.length}); } };
    requestAnimationFrame(f);
  }));
  const te = await p.evaluate(() => window.SYNQUENZER.tickErrors());
  console.log(name, mode, JSON.stringify(m), 'te', te, 'errs', JSON.stringify(errs));
  await b.close();
}
