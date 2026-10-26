import {launch, open} from './v3-qa8-lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await launch();
for (const [f, file] of [['P2'], ['L2'], ['L2', '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-mk8-base-4150.html']]) {
  const {ctx, page: p} = await open(b, f, file);
  const cdp = await ctx.newCDPSession(p);
  const send = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts});
  await p.evaluate(async () => { await SYNQUENZER.libraryReady(); SYNQUENZER.setEngine(0, 'mk'); SYNQUENZER.selectTrack(0); SYNQUENZER.openEditor(); if (window.mkProg) mkProg.select(5, 1); openBrowser(0); });
  await sleep(500);
  const r0 = await p.evaluate(() => { const rows = [...document.querySelectorAll('#sndSheet .brow')]; let sc = rows[0].parentElement; while (sc && sc.scrollHeight <= sc.clientHeight) sc = sc.parentElement; const q = sc.getBoundingClientRect(); return {x: q.x + q.width * .45, y: q.y + q.height * .7, st: sc ? sc.scrollTop : null, sh: sc && sc.scrollHeight, ch: sc && sc.clientHeight}; });
  await send('touchStart', [{x: r0.x, y: r0.y, id: 1}]); for (let k = 1; k <= 12; k++) { await send('touchMove', [{x: r0.x, y: r0.y - 4 * k, id: 1}]); await sleep(16); } await send('touchEnd', []); await sleep(500);
  const r1 = await p.evaluate(() => { const rows = [...document.querySelectorAll('#sndSheet .brow')]; let sc = rows[0].parentElement; while (sc && sc.scrollHeight <= sc.clientHeight) sc = sc.parentElement; return {st: sc ? sc.scrollTop : null, origin: S.tracks[0].sound.origin}; });
  console.log(f, file ? 'BASE' : 'MK8', 'list: scrollTop', r0.st, '→', r1.st, '(sh/ch ' + r0.sh + '/' + r0.ch + ') origin after drag', r1.origin);
  await ctx.close();
}
await b.close();
