import { chromium } from 'playwright';
const FILE = process.argv[2], OUT = process.argv[3] || 'v3-mk5-shots';
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
const FMT = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375], W: [844, 1180]};
for (const f in FMT) {
  const [w, h] = FMT[f]; const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: f !== 'W', deviceScaleFactor: 2}); const p = await ctx.newPage();
  await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  await p.evaluate(F => { const f = [['Barlow Semi Condensed', 'barlow-semi-condensed', [500, 600, 700]], ['JetBrains Mono', 'jetbrains-mono', [500, 700]]];
    const st = document.createElement('style'); st.textContent = f.map(([fam, file, ws]) => ws.map(w => `@font-face{font-family:"${fam}";font-weight:${w};src:url(${F}${file}-latin-${w}-normal.woff2) format("woff2")}`).join('')).join(''); document.head.appendChild(st); return document.fonts.ready; },
    'file:///tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-wt/fonts/');
  await p.evaluate(async () => { const Q = SYNQUENZER; Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.openEditor(); ensureAudio(); await new Promise(r => setTimeout(r, 600));
    Q.mkSet(0, 'arp.on', 1); Q.mkSet(0, 'arp.last', 6); Q.mkSet(0, 'arp.steps', 255 & ~2 & ~16); MKUI.setWahl(2, 8); Q.keyOn(60, .8, 's1'); Q.keyOn(64, .8, 's2'); Q.keyOn(67, .8, 's3'); });
  const halves = await p.evaluate(() => /halb/.test(SYNQUENZER.mkPanel().fmt));
  for (const hf of halves ? ['A', 'B'] : ['']) {
    if (hf) { await p.evaluate(h => { ED.tab = h === 'A' ? 'links' : 'rechts'; safeRebuild(buildSynthEd); }, hf); await p.waitForTimeout(300); }
    await p.waitForTimeout(250); await p.screenshot({path: `${OUT}/mk5-${f}${hf ? '-' + hf : ''}.png`});
  }
  await ctx.close();
}
await b.close();
