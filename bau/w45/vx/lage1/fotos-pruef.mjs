// LAGE1 Prüfung: Fotos für Xander (iPhone 12 Pro Max, deviceScaleFactor 2, Touch). node fotos-pruef.mjs <abs. index.html>
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright/index.js');
import path from 'node:path';
const file = path.resolve(process.argv[2]), here = path.dirname(new URL(import.meta.url).pathname), fotos = path.join(here, 'fotos');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const errs = [];
async function page(W, H) {
  const ctx = await b.newContext({viewport: {width: W, height: H}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage(), cdp = await ctx.newCDPSession(p);
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + file); await p.waitForFunction(() => typeof BOOT !== 'undefined' && BOOT.done && window.SYNQUENZER, null, {timeout: 90000}); await sleep(700);
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts.map((q, i) => ({x: q[0], y: q[1], id: i, radiusX: 2, radiusY: 2, force: 1}))});
  const tap = async q => { await touch('touchStart', [q]); await sleep(60); await touch('touchEnd', []); await sleep(300); };
  const btn = sel => p.evaluate(s => { const e = UI.pop && UI.pop.el.querySelector(s); if (!e) return null; e.scrollIntoView({block: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, sel);
  return {ctx, p, tap, btn};
}
const setup = `(() => { setSongView(false); for (let i = 1; i < NT(); i++) if (S.tracks[i].kind === 'synth') S.tracks[i].clips[0] = null;
  S.tracks[0].clips[0] = normClip({len: 2, key: {root: 0, scale: 'ionian', src: 'auto'}, notes: [0, 1, 2, 3, 4, 5, 6, 7].map(k => ({t: k, d: .5, n: k % 2 ? 67 + (k % 4 === 1 ? 0 : 4) : 55, v: .8}))}, 'synth', S.key);
  S.tracks[2].clips[0] = normClip({len: 1, key: {root: 0, scale: 'ionian', src: 'auto'}, notes: [{t: 0, d: 1, n: 40, v: .8}]}, 'synth', S.key);
  clipChanged(0, 0); clipChanged(2, 0); selectTrack(0); openRoll(0, 0); ED.roll.centerOn(63); })()`;
// 1 + 2: Teilen in eine Spur mit kürzerem Clip – das Blatt sagt, welche Noten bleiben (hochkant + quer)
for (const [W, H] of [[428, 926], [926, 428]]) {
  const X = await page(W, H);
  await X.p.evaluate(setup); await sleep(300);
  await X.tap(await X.p.evaluate(() => { const e = ED.roll.el.acts.querySelector('.lage1rb'); e.scrollIntoView({inline: 'center', block: 'nearest'}); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }));
  await X.p.evaluate(() => { SYNQUENZER.lage1.set('tab', 'teilen'); SYNQUENZER.lage1.set('part', 'oben'); SYNQUENZER.lage1.setB(64); ED.roll.centerOn(63); });
  let tg = ''; for (let k = 0; k < 8 && !/Synth 3/.test(tg); k++) { tg = await X.p.evaluate(() => UI.pop.el.querySelector('[data-a="tgt"]').textContent); if (!/Synth 3/.test(tg)) await X.tap(await X.btn('[data-a="tgt"]')); }
  await sleep(300);
  await X.p.screenshot({path: path.join(fotos, 'pruef-teilen-kurzer-clip-' + W + 'x' + H + '.png')});
  await X.ctx.close();
}
// 3: FILT-Zeile frei – der Schalter macht das Blatt zu (quer, wo die Zeile ganz unten liegt)
{
  const X = await page(926, 428);
  await X.p.evaluate(setup); await sleep(300);
  await X.p.evaluate(() => { const c = S.tracks[0].clips[0]; c.notes.forEach((n, k) => { n.fc = [0, 24, -16, 40, 0, -32, 12, 48][k]; if (!n.fc) delete n.fc; }); clipChanged(0, 0); SYNQUENZER.lage1.open('filter'); });
  await sleep(250);
  await X.tap(await X.btn('[data-a="lane"]')); await sleep(500);
  await X.p.screenshot({path: path.join(fotos, 'pruef-filt-zeile-frei-926x428.png')});
  await X.ctx.close();
}
await b.close();
console.log('Fotos fertig', JSON.stringify(errs));
