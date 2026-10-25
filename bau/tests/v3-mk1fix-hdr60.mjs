// MK1-fix: every VA/FM/WT factory sound (+ INIT AM) after one edit: no head button beyond the edge, ✕ hit, name field >= 72 px (landscape),
// in 844x390 / 812x375 with the 47 px safe area, 667x375, 926x428 with safe area; the app's real font
import {chromium} from 'playwright';
const SP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad';
const FILE = process.env.MK_FILE || SP + '/mk-wt/index.html', FONTS = 'file://' + SP + '/dirigent-wt/fonts/';
const SA = '#app{padding-left:47px!important;padding-right:47px!important}';
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
let fails = 0;
for (const [w, h, sa] of [[844, 390, 1], [812, 375, 1], [667, 375, 0], [926, 428, 1]]) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true}); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  const font = await p.evaluate(async F => { const f = [['Barlow Semi Condensed', 'barlow-semi-condensed', [500, 600, 700]], ['JetBrains Mono', 'jetbrains-mono', [500, 700]]];
    const st = document.createElement('style'); st.textContent = f.map(([fam, file, ws]) => ws.map(w => `@font-face{font-family:"${fam}";font-weight:${w};src:url(${F}${file}-latin-${w}-normal.woff2) format("woff2")}`).join('')).join(''); document.head.appendChild(st);
    await Promise.all(['500 10px "Barlow Semi Condensed"', '700 10px "Barlow Semi Condensed"', '600 10px "Barlow Semi Condensed"'].map(s => document.fonts.load(s))); await document.fonts.ready; return [...document.fonts].some(x => x.family.includes('Barlow') && x.status === 'loaded'); }, FONTS);
  if (sa) await p.addStyleTag({content: SA});
  const ids = await p.evaluate(() => SYNQUENZER.factory().filter(f => f.engine !== 'drum').map(f => f.id).concat(['f-init-am']));
  const bad = []; const lay = {};
  for (const id of ids) {
    const r = await p.evaluate(id => { SYNQUENZER.closeEditor(); SYNQUENZER.loadPreset(0, id); SYNQUENZER.setParam(0, 'fx.vol', .5); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor();
      return new Promise(res => setTimeout(() => { const hd = document.querySelector('#synthSheet .sh-head'), hr = hd.getBoundingClientRect(), x = hd.querySelector('.sh-x'), xr = x.getBoundingClientRect();
        const hit = document.elementFromPoint(xr.left + xr.width / 2, xr.top + xr.height / 2), over = [...hd.querySelectorAll('button')].filter(e => e.offsetParent && e.getBoundingClientRect().right > hr.right + .5).length;
        const e = hd.querySelector('.seg.eng'); res({over, sw: hd.scrollWidth - hd.clientWidth, hit: !!(hit && x.contains(hit)), pv: hd.querySelector('.preset .pv').getBoundingClientRect().width, ed: !!hd.querySelector('.chg'),
          lay: (e.classList.contains('engchip') ? 'chip' : 'keys') + (hd.querySelector('.mk2z') ? '+2z' : '') + (hd.classList.contains('mkht') ? '+ht' : '') + (hd.classList.contains('mkts') ? '+ts' : '')}); }, 200)); }, id);
    lay[r.lay] = (lay[r.lay] || 0) + 1;
    if (r.over || r.sw > 0 || !r.hit || r.pv < 71.5 || !r.ed) bad.push(id + JSON.stringify(r));
  }
  if (!font || errs.length) bad.push('font ' + font + ' ' + errs.join('|'));
  if (bad.length) fails++;
  console.log((bad.length ? 'FAIL ' : 'PASS ') + w + 'x' + h + (sa ? '+SA' : '') + ': ' + ids.length + ' sounds edited, layouts ' + JSON.stringify(lay) + (bad.length ? ' :: ' + bad.slice(0, 6).join(' ') : ''));
  await ctx.close();
}
console.log(fails ? fails + ' FEHLER' : 'alles bestanden'); await b.close(); process.exit(fails ? 1 : 0);
