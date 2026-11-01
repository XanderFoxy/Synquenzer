// SX714 Abnahme SX7: Lautsprecher an, unter der Linie wischen (Touch) → Schläge klingen, Blitz am Taktstrich, ▼ bleibt, nichts hängt
import { open, buildSong, tapEl, swipe, OUT } from './lib.mjs';
const res = {};
for (const [w, h, N] of [[428, 926, 'P'], [926, 428, 'L']]) {
  const {b, p, errs} = await open(w, h); await buildSong(p);
  await p.evaluate(() => { try { closeEditor(); } catch (e) {} closeSheets && closeSheets(); setSongView(true); }); await p.waitForTimeout(500);
  const r = {};
  r.btn = await tapEl(p, '.sv-scr', 300);
  r.on = await p.evaluate(() => ({on: SX7.on, line: !SX7.ln.hidden, pressed: document.querySelector('.sv-scr').getAttribute('aria-pressed')}));
  r.top = await p.evaluate(() => [...document.querySelectorAll('.sv-top > *')].filter(e => !e.hidden).map(e => { const q = e.getBoundingClientRect(); return [e.className.replace(/rb sv-b /, '').split(' ')[0], Math.round(q.width), Math.round(q.height)]; }));
  const cv = await p.evaluate(() => { const q = SV.cv.getBoundingClientRect(); return {x: q.x, y: q.y, w: q.width, h: q.height, rh: SV.rowH, ru: SV.rulerH}; });
  const y = cv.y + cv.ru + cv.rh * 1.5, x0 = cv.x + cv.w * .8, x1 = cv.x + cv.w * .2;
  await p.evaluate(() => { SX7.n = 0; SX7.fl = 0; });
  // nach links wischen = vorwärts durch den Song
  await swipe(p, x0, y, x1, 24, 30, {mid: async () => { r.mid = await p.evaluate(() => ({beat: SX7.b, x: SV.x, voices: SX7.vs.filter(v => !v.dead).length + SX7.hs.filter(h => !h.dead).length})); if (N === 'P') await p.screenshot({path: OUT + 'sx7-wischen-' + N + '.png'}); }});
  r.after = await p.evaluate(() => ({n: SX7.n, fl: SX7.fl, pos: SV.pos, start: songStartBar(), lineBar: Math.floor((SV.x + SV.w / 2) / SV.cellW), x: SV.x, mom: SV.vx}));
  await p.waitForTimeout(900);
  r.haengt = await p.evaluate(() => { const c = AU.ctx.currentTime; return VOICES.filter(v => !v.dead && v.src === 'audition' && !(v.stopAt < c + .05)).length; });
  // zurück bis vor Takt 1 (Takt 1 erreichbar)
  await swipe(p, x1, y, x1 + cv.w * .75, 20, 20); await swipe(p, x1, y, x1 + cv.w * .75, 20, 20);
  r.home = await p.evaluate(() => ({pos: SV.pos, x: SV.x}));
  // ▶ startet ab der Marke
  await swipe(p, x0, y, x0 - cv.w * .3, 16, 25);
  r.mk = await p.evaluate(() => SV.pos);
  await p.evaluate(() => togglePlay()); await p.waitForTimeout(300);
  r.play = await p.evaluate(() => ({playing: R.playing, bar0: R.songPlay && R.songPlay.bar0}));
  await p.evaluate(() => togglePlay()); await p.waitForTimeout(200);
  await p.screenshot({path: OUT + 'sx7-' + N + '.png'});
  // aus: Ansicht wieder normal
  await tapEl(p, '.sv-scr', 300); r.aus = await p.evaluate(() => ({on: SX7.on, line: !SX7.ln.hidden, x: SV.x}));
  r.errs = errs; res[N] = r; await b.close();
}
console.log(JSON.stringify(res, null, 1));
