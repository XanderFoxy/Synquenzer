import {open, sleep} from './v3-vs3-h.mjs';
import {chromium} from 'playwright';
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
for (const [k, w, h] of [['P1', 390, 844], ['L1', 844, 390]]) {
  const ctx = await br.newContext({viewport: {width: w, height: h}, deviceScaleFactor: 2}); const H = await open({br, ctx}), p = H.p;
  await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });
  const x = []; for (let i = 0; i < 48000 * 8; i++) x.push(Math.round(Math.sin(2 * Math.PI * 220 * i / 48000) * 12000 * Math.abs(Math.sin(i / 20000))));
  const r = await p.evaluate(pc => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 2, len: 1}), x);
  await p.evaluate(id => SYNQUENZER.setSong({bars: 8, lanes: [[{bar: 0, slot: 0}], [{bar: 0, slot: 0}], [], [], [{bar: 0, slot: 0}], [], []], carrier: [], mel: {}, vox: [{id: 'V1', bar: 1, len: 4, take: id, in: 0, out: 8, at: 0}, {id: 'V2', bar: 6, len: 2, take: id, in: 2, out: 6, at: 0}]}), r.id);
  await p.evaluate(() => SYNQUENZER.songView(true)); await sleep(800);
  await p.screenshot({path: `v3-vs3-${k}-song.png`});
  // Tipp auf die Song-Stimme → Takes-Blatt
  const info = await p.evaluate(() => SYNQUENZER.svLayoutInfo ? SYNQUENZER.svLayoutInfo() : null);
  const cv = await p.evaluate(() => { const c = [...document.querySelectorAll('#songView canvas')].find(x => x.getBoundingClientRect().width > 100); const r = c.getBoundingClientRect(); return [r.left, r.top]; });
  const row = info.rows.indexOf('ST');
  if (row > 0) { await p.mouse.click(cv[0] + info.cellW * 2.5, cv[1] + info.rulerH + (row - 1) * info.rowH + info.rowH / 2); await sleep(400);
    console.log(k, 'Tipp auf Song-Stimme →', await p.evaluate(() => { const e = document.querySelector('.pop.tksheet h4'); return e ? e.textContent : 'kein Blatt'; })); }
  console.log(k, JSON.stringify(info).slice(0, 120), JSON.stringify(H.errs));
  await ctx.close();
}
await br.close();
