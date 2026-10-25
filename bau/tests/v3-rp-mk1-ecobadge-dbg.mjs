import { chromium } from 'playwright';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
for (const [w,h,tag] of [[390,844,'P1'],[844,1180,'W']]) {
const ctx = await b.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 2});
const p = await ctx.newPage();
await p.goto('file://' + S + 'mk-wt/index.html'); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime, null, {timeout: 20000});
await p.waitForTimeout(800);
const r = await p.evaluate(async () => { const Q = window.SYNQUENZER; Q.forceNative(true); await new Promise(r => setTimeout(r, 400)); Q.selectTrack(0); Q.openEditor(); await new Promise(r => setTimeout(r, 900));
  return {iw: innerWidth, ih: innerHeight, want: engChipWanted(), segs: [...document.querySelectorAll('#synthSheet .seg.eng')].map(s => s.className + ' n=' + s.children.length + ' ' + s.innerText.replace(/\s+/g,' ')), tr0: S.tracks[0].name, eng: S.tracks[0].sound.engine}; });
console.log(tag, JSON.stringify(r));
await p.screenshot({path: S + `dirigent-test/v3-rp-mk1-ecobadge-dbg-${tag}.png`, clip: {x: 0, y: 0, width: w, height: 140}});
await ctx.close(); }
await b.close();
