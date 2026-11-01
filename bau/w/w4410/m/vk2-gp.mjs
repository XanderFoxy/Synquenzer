// VK2 Gegenprüfung: leerer Song, nur Drums, Standbild ohne Render (vvStill), Determinismus gleicher Zeitpunkt, 9:16,
// Regie-Taste bei iPhone-Breite, Basis-Pegel-Schwankung (Behauptung des Helfers)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/';
const APP = process.argv[2] || D + 'w4410/m/index.html', MODE = process.argv[3] || 'copy';
const OUT = D + 'w4410/m/';
const { buildSong } = await import(D + 'dirigent-test/n5-v-qm-lib.mjs');
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await b.newPage({viewport: {width: 428, height: 926}});
const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + APP); await p.waitForTimeout(1500);
await p.mouse.click(5, 300);
await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 15000}).catch(() => {});
const res = {};
const h = s => { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; } return x.toString(16); };
const shot = async (t, v, fmt) => h(await p.evaluate(([t, v, fmt]) => SYNQUENZER.vvShot(t, v, fmt), [t, v, fmt]));
const render = (a, bb) => p.evaluate(async ([a, bb]) => { const r = await SYNQUENZER.vvRender({range: {a, b: bb}}); return {dur: +r.dur.toFixed(3), nt: !!VV.last.nt, log: !!VV.last.log}; }, [a, bb]);
if (MODE === 'basis') {
  // the claim: the meter differs from render to render already in the base file (Song view)
  res.song = await buildSong(p);
  res.r1 = await render(4, 10); const A1 = [await shot(3, 'song', '16:9'), await shot(6, 'song', '16:9')];
  res.r2 = await render(4, 10); const A2 = [await shot(3, 'song', '16:9'), await shot(6, 'song', '16:9')];
  await p.evaluate(() => { VV.noMtr = true; });
  await render(4, 10); const B1 = [await shot(3, 'song', '16:9'), await shot(6, 'song', '16:9')];
  await render(4, 10); const B2 = [await shot(3, 'song', '16:9'), await shot(6, 'song', '16:9')];
  res.basisSongGleichMitMeter = A1.join() === A2.join(); res.basisSongGleichOhneMeter = B1.join() === B2.join();
  res.errs = errs; console.log(JSON.stringify(res, null, 1)); await b.close(); process.exit(0);
}
// 1) empty song (no lanes): still without render (vvStill, Regie kino), a render, pictures 16:9 + 9:16
res.leer = await p.evaluate(async () => {
  const A = SYNQUENZER, nt = NT(); A.setMetronome && A.setMetronome(false);
  A.setSong({bars: 4, lanes: Array.from({length: nt}, () => []), carrier: [], mel: {}, marks: []});
  await new Promise(r => setTimeout(r, 300));
  A.vvDirSet(0, 4, 'kino');
  vvOpen(); await new Promise(r => setTimeout(r, 400));
  let still = 'ok'; try { vvStill(); } catch (e) { still = String(e); }
  const pr = VK2.probe ? {rows: VK2.probe.rows.length, bar: VK2.probe.bar, held: VK2.probe.held} : null;
  vvClose();
  return {still, pr, dir: A.vvDirGet()};
});
res.leer.r = await render(0, 4);
for (const fmt of ['16:9', '9:16']) {
  const png = await p.evaluate(fmt => SYNQUENZER.vvShot(1.2, 'kino', fmt), fmt); if (png) fs.writeFileSync(OUT + 'vk2-gp-leer-' + fmt.replace(':', 'x') + '.png', Buffer.from(png, 'base64'));
  res.leer['probe' + fmt] = await p.evaluate(fmt => { const q = SYNQUENZER.vk2At(1.2, fmt); return q ? {bar: q.bar, step: q.step, rows: q.rows.length, morph: q.morph, held: q.held} : null; }, fmt);
}
// 2) only drums
res.drums = await p.evaluate(async () => {
  const A = SYNQUENZER, nt = NT(), lanes = Array.from({length: nt}, () => []); lanes[DRUM_T] = [{bar: 0, slot: 0}];
  A.setSong({bars: 4, lanes, carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 4, name: 'Beat'}]});
  await new Promise(r => setTimeout(r, 300)); A.vvDirSet(0, 4, 'kino');
  return {drumT: DRUM_T, kind: vk2Kind(DRUM_T), clipNotes: (S.tracks[DRUM_T].clips[0] || {notes: []}).notes.length};
});
res.drums.r = await render(0, 4);
for (const fmt of ['16:9', '9:16']) {
  const png = await p.evaluate(fmt => SYNQUENZER.vvShot(2.05, 'kino', fmt), fmt); if (png) fs.writeFileSync(OUT + 'vk2-gp-drums-' + fmt.replace(':', 'x') + '.png', Buffer.from(png, 'base64'));
  res.drums['probe' + fmt] = await p.evaluate(fmt => { const q = SYNQUENZER.vk2At(2.05, fmt); const d = q.rows.find(r => r.i === DRUM_T); return {bar: q.bar, step: q.step, drum: d, morph: q.morph}; }, fmt);
}
// the same moment twice (and after a 9:16 picture in between): identical
const d1 = await shot(2.05, 'kino', '16:9'), d2 = await shot(2.05, 'kino', '9:16'), d3 = await shot(2.05, 'kino', '16:9');
res.drums.gleichStand = d1 === d3;
// 3) the full song with glides (as the helper), the same moment twice, the auto video around a cut into kino (blend)
res.voll = await buildSong(p);
await p.evaluate(() => {
  const Q = SYNQUENZER;
  Q.v6aSetState(1, 0, {p: {cutoff: 4000, res: .15}}); Q.v6aSetState(1, 1, {p: {cutoff: 300, res: 1.0, aA: .25, aR: 1.4}, x: 'bar2'});
  delete S.song.video; Q.vvDirSet(6, 9, 'kino');
});
res.voll.r = await render(4, 10);
res.voll.cuts = await p.evaluate(() => SYNQUENZER.vvCuts({range: {a: 4, b: 10}}).shots.map(s => [s.a, s.b, s.v]));
const spb = await p.evaluate(() => 60 / VV.last.bpm), lead = await p.evaluate(() => VV.last.lead || 0);
const tm = lead + 2.9 * 4 * spb;
res.voll.gleich = (await shot(tm, 'kino', '9:16')) === (await shot(tm, 'kino', '9:16')) && (await shot(tm, 'kino', '16:9')) === (await shot(tm, 'kino', '16:9'));
// a blend picture at the cut into kino (auto view): no error, saved
const tb = lead + 2 * 4 * spb + .12;
const pb = await p.evaluate(t => SYNQUENZER.vvShot(t, 'auto', '16:9'), tb); fs.writeFileSync(OUT + 'vk2-gp-blende.png', Buffer.from(pb, 'base64'));
res.voll.probeMorph = await p.evaluate(t => { const q = SYNQUENZER.vk2At(t, '9:16'); return {morph: q.morph, ms: q.ms}; }, tm);
// draw time at full size (60 frames, 16:9 and 9:16)
res.zeit = await p.evaluate(([lead, spb]) => {
  const r = VV.last, out = {};
  for (const [fmt, W, H] of [['16:9', 1920, 1080], ['9:16', 1080, 1920]]) for (const v of ['kino', 'song']) {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d', {alpha: false}), rt = vvRun({range: {a: r.a, b: r.b}, bpm: r.bpm, cam: 'kamera'});
    vvDrawShot(g, W, H, rt, {k: 0, v, t: null}, vvStateAt(r, lead), 0);
    const T0 = performance.now(); for (let f = 0; f < 60; f++) { const t = lead + 2 * 4 * spb + f / 30; vvDrawShot(g, W, H, rt, {k: 0, v, t: null}, vvStateAt(r, t), t); } g.getImageData(0, 0, 1, 1);
    out[fmt + ' ' + v] = +((performance.now() - T0) / 60).toFixed(2);
  }
  return out;
}, [lead, spb]);
// 4) the Regie row at iPhone width (portrait, sheet ~ 396 px): does [Mäusekino] fit (no clipped text), 44 px high?
res.reihe = await p.evaluate(() => {
  const d = document.createElement('div'); d.className = 'msheet'; d.style.cssText = 'position:fixed;left:16px;top:16px;width:396px;z-index:99999;background:#000';
  d.innerHTML = vvDirRow(0, 2, 'ms-b'); document.body.appendChild(d);
  const bs = [...d.querySelectorAll('button')].map(x => ({t: x.textContent, w: Math.round(x.getBoundingClientRect().width), h: Math.round(x.getBoundingClientRect().height), clip: x.scrollWidth > x.clientWidth + 1}));
  d.remove(); return bs;
});
res.errs = errs;
console.log(JSON.stringify(res, null, 1));
await b.close();
