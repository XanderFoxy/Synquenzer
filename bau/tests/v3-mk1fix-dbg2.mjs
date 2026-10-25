import {chromium} from 'playwright';
const SP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad';
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'});
for (const [w, h, sa] of [[667, 375, 0], [844, 390, 1], [812, 375, 1]]) {
const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true}); const p = await ctx.newPage();
await p.goto('file://' + SP + '/mk-wt/exp-dbg.html'); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted);
await p.evaluate(async F => { const f = [['Barlow Semi Condensed', 'barlow-semi-condensed', [500, 600, 700]], ['JetBrains Mono', 'jetbrains-mono', [500, 700]]];
  const st = document.createElement('style'); st.textContent = f.map(([fam, file, ws]) => ws.map(w => `@font-face{font-family:"${fam}";font-weight:${w};src:url(${F}${file}-latin-${w}-normal.woff2) format("woff2")}`).join('')).join(''); document.head.appendChild(st);
  await Promise.all(['500 10px "Barlow Semi Condensed"', '700 10px "Barlow Semi Condensed"', '600 10px "Barlow Semi Condensed"'].map(s => document.fonts.load(s))); }, 'file://' + SP + '/dirigent-wt/fonts/');
if (sa) await p.addStyleTag({content: '#app{padding-left:47px!important;padding-right:47px!important}'});
const r = await p.evaluate(() => { window.__fl = []; SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); return window.__fl; });
console.log(w + 'x' + h + (sa ? 'SA' : ''), JSON.stringify(r, null, 0)); await ctx.close(); }
await b.close();
