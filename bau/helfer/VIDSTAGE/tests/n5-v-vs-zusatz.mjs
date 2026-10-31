// VIDSTAGE-Zusatz (Xander 31.10.): Z1 volle Klangqualität im Video, Z2 Wahl [Ganzer Song]/[Auswahl], Z3 Ausklang auch bei Auswahl,
// Z4 Teilname klebt im Song-Bild am linken Rand, solange der Teil läuft
import { open, SONG8 } from './n5-v-lib.mjs';
import fs from 'fs';
fs.mkdirSync('n5-v-out', {recursive: true});
const res = {};
const {b, p, errs} = await open({touch: true, dpr: 2});
await p.evaluate(s => SYNQUENZER.setSong(s), SONG8);
// --- Z1: CPU-Begrenzer live auf Stufe 3 → das Offline-Rendern rechnet mit Stufe 0, danach live wieder Stufe 3
{
  const r = await p.evaluate(async () => {
    const A = SYNQUENZER; A.vvTest({});
    LIM.level = 3; applyLimiter();
    const seen = new Set(), orig = window.limited;
    window.limited = P => { if (VV.off) seen.add(LIM.level); return orig(P); };
    let x; try { x = await A.vvRender({range: {a: 0, b: 2}}); } finally { window.limited = orig; }
    const after = LIM.level; LIM.level = 0; applyLimiter();
    return {levelsDuringRender: [...seen], levelAfter: after, dur: x.dur};
  });
  res['Z1-qualitaet'] = Object.assign(r, {ok: r.levelsDuringRender.length > 0 && r.levelsDuringRender.every(l => l === 0) && r.levelAfter === 3});
}
// --- Z3: Ausklang auch bei Auswahl (langer Hall + Echo, Auswahl Takte 1–4)
{
  const r = await p.evaluate(async () => {
    const A = SYNQUENZER; A.vvTest({});
    S.fxBus.hall.decay = 6; S.fxBus.hall.ret = 1; S.fxBus.echo.fb = .55; for (const tr of S.tracks) if (tr.sound && tr.sound.fx) { tr.sound.fx.rev = .6; tr.sound.fx.dly = .4; }
    applyFxBus(); for (let i = 0; i < NT(); i++) applyTrackParams(i, true);
    const pk = (t0, t1) => { const pcm = A.vvPcm(t0, t1), L = Uint8Array.from(atob(pcm.b64), c => c.charCodeAt(0)), d = new Int16Array(L.buffer); let m = 0; for (const v of d) m = Math.max(m, Math.abs(v) / 32767); return 20 * Math.log10(m + 1e-9); };
    const out = {};
    for (const [k, rg] of [['auswahl', {a: 0, b: 4, sel: true}], ['ganz', null]]) {
      const x = await A.vvRender(rg ? {range: rg} : {});
      out[k] = {songSec: +x.songSec.toFixed(3), tail: +x.tail.toFixed(3), capped: x.capped, songEndDb: +pk(x.songSec - .05, x.songSec).toFixed(1), tailMidDb: +pk(x.songSec + .5, x.songSec + .6).toFixed(1), endDb: +pk(Math.max(0, x.dur - .06), x.dur).toFixed(1)};
    }
    return out;
  });
  const s = r.auswahl;
  res['Z3-ausklang-auswahl'] = Object.assign(r, {ok: s.tail > .5 && s.tail <= 10.001 && s.endDb < -55 && s.tailMidDb > -60 && r.ganz.tail > .5});
}
// --- Z2: Blatt mit / ohne Auswahl
try {
  const r = await p.evaluate(async () => {
    const A = SYNQUENZER, w = ms => new Promise(r => setTimeout(r, ms)), out = {};
    const look = () => {
      const row = [...document.querySelectorAll('.vvrow')].find(x => /Bereich/i.test(x.textContent));
      const seg = row.querySelector('.seg'), txt = row.querySelector('.vvtxt'), bs = seg ? [...seg.children] : [];
      const vis = e => !!e && e.offsetParent !== null && getComputedStyle(e).display !== 'none';
      return {segShown: vis(seg), txt: vis(txt) ? txt.textContent : null, btns: bs.filter(vis).map(x => { const q = x.getBoundingClientRect(); return {t: x.textContent, w: Math.round(q.width * 10) / 10, h: Math.round(q.height * 10) / 10, on: x.classList.contains('on'), out: q.right > innerWidth || q.left < 0}; }), range: A.vvInfo().range};
    };
    // ohne Auswahl
    SV.sel = null; A.vvOpen(); await w(300); out.ohne = look(); A.vvClose(); await w(100);
    // mit Auswahl Takte 3–4
    SV.sel = {a: 2, b: 3}; A.vvOpen(); await w(300); out.mit = look();
    const bt = [...document.querySelectorAll('.vvrow .seg button')].find(x => x.textContent === 'Ganzer Song'), q = bt.getBoundingClientRect();
    return {out, tap: [q.left + q.width / 2, q.top + q.height / 2]};
  });
  await p.touchscreen.tap(r.tap[0], r.tap[1]); await p.waitForTimeout(300);
  const after = await p.evaluate(() => { const i = SYNQUENZER.vvInfo(); const on = [...document.querySelectorAll('.vvrow .seg button.on')].map(x => x.textContent); return {range: i.range, on}; });
  await p.screenshot({path: 'n5-v-out/vs-zusatz-bereich.png'});
  await p.evaluate(() => { SYNQUENZER.vvClose(); SV.sel = null; });
  const o = r.out, small = [...o.mit.btns].filter(x => x.w < 44 || x.h < 44);
  res['Z2-bereich'] = Object.assign({ohne: o.ohne, mit: o.mit, nachTippGanzerSong: after},
    {ok: !o.ohne.segShown && o.ohne.txt === 'ganzer Song' && o.ohne.range && !o.ohne.range.sel &&
      o.mit.segShown && o.mit.btns.length === 2 && small.length === 0 && !o.mit.btns.some(x => x.out) && o.mit.range.sel && o.mit.range.a === 2 && o.mit.range.b === 4 &&
      o.mit.btns.find(x => x.t === 'Auswahl').on && after.range && !after.range.sel && after.range.a === 0 && after.range.b === 8 && after.on.includes('Ganzer Song')});
} catch (e) { res['Z2-bereich'] = {fehler: String(e).slice(0, 200), ok: false}; await p.evaluate(() => { try { SYNQUENZER.vvClose(); } catch (x) {} SV.sel = null; }); }
// --- Z4: Song-Bild, langer Teil (16 Takte), Wiedergabe tief im Teil → der Name steht am linken Rand der Ansicht
{
  const r = await p.evaluate(() => {
    const A = SYNQUENZER, out = [];
    A.setSong({bars: 24, lanes: [[{bar: 0, slot: 0}], [], [], [], [{bar: 0, slot: 0}], []], carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 16, name: 'Strophe'}, {id: 'm2', a: 16, len: 8, name: 'Refrain'}]});
    for (const port of [true, false]) {
      const W = port ? 360 : 640, H = port ? 640 : 360, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const g = cv.getContext('2d'), seen = [], ft = g.fillText.bind(g);
      g.fillText = (t, x, y) => { seen.push({t: String(t), x, y}); return ft(t, x, y); };
      const labW = port ? 66 : 78;
      for (const bar of [1, 6, 10, 14, 15.5]) {
        seen.length = 0; vvDrawSong(g, W, H, {sb: bar * 4, slots: [], cs: [], own: []});
        const s = seen.find(e => e.t === 'STROPHE');
        out.push({port, bar: bar + 1, x: s ? Math.round(s.x * 10) / 10 : null, labW, inView: !!s && s.x >= labW});
      }
    }
    return out;
  });
  res['Z4-teilname'] = {proben: r, ok: r.every(e => e.inView)};
}
res.errors = errs;
console.log(JSON.stringify(res, null, 1));
console.log(Object.entries(res).filter(([k]) => k !== 'errors').map(([k, v]) => k + ' ' + (v.ok ? 'PASS' : 'FAIL')).join('\n'));
fs.writeFileSync('n5-v-out/vs-zusatz.json', JSON.stringify(res, null, 1));
await b.close();
