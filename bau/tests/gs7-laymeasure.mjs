import {open, sleep} from './v3-vs3-h.mjs';
import {chromium} from 'playwright';
const APP = process.argv[2];
const sine = (sr, sec, f, a) => { const n = Math.round(sr * sec), x = new Array(n); for (let i = 0; i < n; i++) x[i] = Math.round(Math.sin(2 * Math.PI * f * i / sr) * (a || 9000) + ((i * 7919) % 600) - 300); return x; };
const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
for (const [w, h] of [[667, 375], [844, 390], [926, 428]]) {
  const ctx = await br.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const H = await open({file: APP, br, ctx}), p = H.p;
  await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });
  const r = await p.evaluate(pc => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 0, len: 2}), sine(48000, 3, 330));
  await p.evaluate(r => { SYNQUENZER.clSet(r.id, 60); }, r); await p.evaluate(id => SYNQUENZER.clWait(id), r.id);
  await p.evaluate(r => SYNQUENZER.tkSheet({t: r.track, s: r.scene}), r); await sleep(400);
  console.log(w, h, JSON.stringify(await p.evaluate(() => { const P = document.querySelector('.pop.tksheet'); const cs = getComputedStyle(P); return {sh: P.scrollHeight, ch: P.clientHeight, pad: cs.paddingTop + ' ' + cs.paddingBottom, kids: [...P.children].map(e => { const s = getComputedStyle(e); return e.tagName + '.' + e.className + ' ' + Math.round(e.getBoundingClientRect().height) + ' m' + s.marginTop + '/' + s.marginBottom; })}; })));
  await ctx.close();
}
await br.close();
