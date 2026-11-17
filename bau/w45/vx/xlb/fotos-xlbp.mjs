// XLB-P: Fotos für Xander (iPhone 12 Pro Max, deviceScaleFactor 2): Song-Editor mit 12 Spuren (Spuren 9–12 in Farbe), Matrix quer mit
// Szenen 9–10 und ＋ Szene, Szenen-Blatt ([SZ] halten, echte Berührung über CDP). Nur Testdaten (keine Songtitel).
// Aufruf: node fotos-xlbp.mjs <index.html> <fotoordner>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const [file, dir] = process.argv.slice(2); fs.mkdirSync(dir, {recursive: true});
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errs = [];
async function open(w, h) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1800);
  return {ctx, p, cdp: await ctx.newCDPSession(p)};
}
const MK = p => p.evaluate(() => {
  switchProject(newProject(), {first: true});
  while (NS() < 10) SYNQUENZER.xl.addScene(true);
  while (NT() < 12) addTrack();
  const K = {root: 0, scale: 'ionian'};
  for (let t = 0; t < NT(); t++) for (let s = 0; s < NS(); s++) {
    if ((t + s) % 3 && !(s >= 8 && t >= 8)) continue;
    S.tracks[t].clips[s] = normClip(isDrum(t) ? {len: 1, key: K, notes: [0, 1, 2, 3].map(k => ({t: k, d: .25, n: k % 2 ? 38 : 36, v: .8}))}
      : {len: 1, key: K, notes: [{t: 0, d: .5, n: 48 + (t % 12), v: .8}, {t: 1, d: .5, n: 52 + (s % 5), v: .7}, {t: 2, d: .5, n: 55, v: .7}, {t: 3, d: .5, n: 57, v: .7}]}, isDrum(t) ? 'drum' : 'synth', S.key);
    clipChanged(t, s);
  }
  const lanes = Array.from({length: NT()}, (_, t) => [0, 1, 2, 3, 4, 5].map(bar => ({bar, slot: [0, 8, 9, 3, 8, 9][bar]})).filter(e => S.tracks[t].clips[e.slot]));
  S.song = normSong({bars: 6, lanes}, S.key, NT()); songChanged(); hideToast();
});
// 1) Song-Editor hochkant: alle Spuren in ihrer Farbe
{
  const {ctx, p} = await open(428, 926); await MK(p);
  await p.evaluate(async () => { setSongView(true); await new Promise(r => setTimeout(r, 300)); if (typeof setTrackBank === 'function') {} hideToast(); });
  await sleep(700); await p.screenshot({path: dir + '/xlbp-song-hochkant.png'}); await ctx.close();
}
// 2) Matrix quer: Szenen 9–10 + ＋ Szene
{
  const {ctx, p} = await open(926, 428); await MK(p);
  await p.evaluate(() => { xlShowScene(8); hideToast(); }); await sleep(600);
  await p.screenshot({path: dir + '/xlbp-matrix-quer.png'}); await ctx.close();
}
// 3) Szenen-Blatt hochkant: [SZ] halten (Berührung)
{
  const {ctx, p, cdp} = await open(428, 926); await MK(p);
  await p.evaluate(() => { xlShowScene(8); hideToast(); }); await sleep(500);
  const r = await p.evaluate(() => { const e = UI.szb.getBoundingClientRect(); return {x: e.left + e.width / 2, y: e.top + e.height / 2}; });
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: r.x, y: r.y, id: 1}]}); await sleep(700);
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await sleep(500);
  const open_ = await p.evaluate(() => !!document.querySelector('.xlbank'));
  await p.screenshot({path: dir + '/xlbp-blatt-hochkant.png'}); await ctx.close();
  console.log('Blatt offen', open_);
}
console.log('Konsole', JSON.stringify(errs));
await b.close();
