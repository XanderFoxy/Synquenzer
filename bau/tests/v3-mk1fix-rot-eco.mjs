// MK1-fix: (1) rotate with the synth editor open -> the head is fitted anew; (2) ECO badge (forceNative) on the engine key in P1/P2/P3/W
import {chromium} from 'playwright';
const SP = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad';
const FILE = process.env.MK_FILE || SP + '/mk-wt/index.html', FONTS = 'file://' + SP + '/dirigent-wt/fonts/';
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
let fails = 0; const ok = (c, m) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + m); };
const boot = async (w, h) => { const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true}); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000});
  await p.evaluate(async F => { const f = [['Barlow Semi Condensed', 'barlow-semi-condensed', [500, 600, 700]], ['JetBrains Mono', 'jetbrains-mono', [500, 700]]];
    const st = document.createElement('style'); st.textContent = f.map(([fam, file, ws]) => ws.map(w => `@font-face{font-family:"${fam}";font-weight:${w};src:url(${F}${file}-latin-${w}-normal.woff2) format("woff2")}`).join('')).join(''); document.head.appendChild(st);
    await Promise.all(['500 10px "Barlow Semi Condensed"', '700 10px "Barlow Semi Condensed"', '600 10px "Barlow Semi Condensed"'].map(s => document.fonts.load(s))); await document.fonts.ready; }, FONTS);
  return {ctx, p, errs}; };
const head = () => { const hd = document.querySelector('#synthSheet .sh-head'), e = hd.querySelector('.seg.eng'), hr = hd.getBoundingClientRect(); return {chip: e.classList.contains('engchip'), over: [...hd.querySelectorAll('button')].filter(x => x.offsetParent && x.getBoundingClientRect().right > hr.right + .5).length, keys: [...e.children].map(x => x.textContent.trim())}; };
// (1) rotation
for (const [a, z] of [[[390, 844], [844, 390]], [[844, 390], [390, 844]], [[428, 926], [926, 428]]]) {
  const {ctx, p, errs} = await boot(...a);
  await p.evaluate(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await p.waitForTimeout(300);
  const h0 = await p.evaluate(head);
  await p.setViewportSize({width: z[0], height: z[1]}); await p.waitForTimeout(500);
  const h1 = await p.evaluate(head);
  const fresh = await (async () => { const B = await boot(...z); await B.p.evaluate(() => { SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); }); await B.p.waitForTimeout(300); const r = await B.p.evaluate(head); await B.ctx.close(); return r; })();
  ok(h1.chip === fresh.chip && h1.over === 0 && !errs.length, `rotate ${a.join('x')} -> ${z.join('x')}: ${h0.chip ? 'chip' : 'keys'} -> ${h1.chip ? 'chip' : 'keys'} (fresh open ${fresh.chip ? 'chip' : 'keys'}), over ${h1.over}${errs.length ? ' ERR ' + errs : ''}`);
  await ctx.close();
}
// (2) ECO badge
for (const [w, h, tag] of [[390, 844, 'P1'], [375, 667, 'P2'], [320, 568, 'P3'], [844, 1180, 'W'], [428, 926, 'P 428'], [844, 390, 'L1']]) for (const eng of ['analog', 'mk']) {
  const {ctx, p, errs} = await boot(w, h);
  const r = await p.evaluate(async e => { SYNQUENZER.forceNative(true); SYNQUENZER.selectTrack(0); if (e === 'mk') SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.openEditor(); await new Promise(r => setTimeout(r, 300));
    const seg = document.querySelector('#synthSheet .sh-head .seg.eng'), btn = seg.querySelector('button.eco'), pill = document.querySelector('#synthSheet .ecob');
    const bs = btn ? getComputedStyle(btn, '::before') : null, br = btn ? btn.getBoundingClientRect() : null;
    return {eco: trackEco(0), chip: seg.classList.contains('engchip'), btn: btn ? btn.textContent.trim() : null, on: btn ? btn.classList.contains('on') : null, before: bs ? bs.content : null, col: bs ? bs.color : null, hitH: bs ? parseFloat(bs.height) : null, btnH: br ? br.height : null,
      pill: pill ? getComputedStyle(pill).display : null, land: innerWidth > innerHeight}; }, eng);
  const want = r.land ? (r.pill !== 'none' && r.before === '""' || r.before === 'none' || r.before === "''") : r.before === '"ECO"';
  ok(r.eco && r.btn && want && r.hitH >= 44 - .5 && (eng !== 'mk' || r.chip || r.on) && !errs.length, `ECO ${tag} ${eng}: key '${r.btn}' (on ${r.on}) ::before ${r.before} ${r.col} hit ${r.hitH}px, pill ${r.pill}${errs.length ? ' ERR ' + errs : ''}`);
  if (process.env.SHOT && !r.land) await p.screenshot({path: `${SP}/dirigent-test/v3-mk1fix-hdr/eco-${tag.replace(' ', '')}-${eng}.png`, clip: {x: 0, y: 0, width: w, height: 110}});
  await ctx.close();
}
console.log(fails ? fails + ' FEHLER' : 'alles bestanden'); await b.close(); process.exit(fails ? 1 : 0);
