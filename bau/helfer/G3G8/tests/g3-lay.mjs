// G3-05: M-PLATZ der Song-Ansicht mit Schwänzchen in allen Formaten (P1 390×844, P2 375×667, P3 320×568, L1 844×390, L2 667×375, XL 926×428)
import {fresh, ok, fails, sleep, tones, singAt, waitBeat, idle} from './g3-lib.mjs';
import fs from 'fs';
const OUT = new URL('./out/', import.meta.url).pathname; fs.mkdirSync(OUT, {recursive: true});
const H = await fresh(), p = H.p;
await p.evaluate(() => { SYNQUENZER.setRecOptions({countIn: 0, length: 2}); SYNQUENZER.selectSlot(0, 1); SYNQUENZER.play(); });
await singAt(p, tones([[10, .9, 659.26, .3], [11, .9, 659.26, .3], [12, 3.5, 440, .3], [16, 5, 392, .3]], H.sr, 10), 10);
await waitBeat(p, 8.5); await p.evaluate(() => SYNQUENZER.rec());
await waitBeat(p, 20.3); await idle(p, 40000);
await p.evaluate(() => SYNQUENZER.stop());
const sti = await p.evaluate(() => SYNQUENZER.tkInfo().stimme), nt = await p.evaluate(() => SYNQUENZER.project().tracks.length);
const lanes = Array.from({length: nt}, (_, t) => (t === sti || t === 5 ? [{bar: 2, slot: 1}, {bar: 4, slot: -1}] : t === 0 ? [{bar: 0, slot: 0}] : []));
await p.evaluate(o => SYNQUENZER.setSong(o), {bars: 8, lanes, carrier: [], mel: {}, marks: [{id: 'M1', a: 0, len: 2, part: 'S1'}, {id: 'M2', a: 2, len: 2, part: 'S2'}]});
const F = [['P1', 390, 844], ['P2', 375, 667], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375], ['XL', 926, 428]];
for (const [nm, w, h] of F) {
  await p.setViewportSize({width: w, height: h}); await p.evaluate(() => SYNQUENZER.songView(false)); await sleep(500);
  const d0 = await p.evaluate(() => ({sh: document.documentElement.scrollHeight, sw: document.documentElement.scrollWidth, ih: innerHeight, iw: innerWidth}));
  await p.evaluate(t => { SYNQUENZER.selectTrack(t); SYNQUENZER.songView(true); }, sti); await sleep(700);
  const d1 = await p.evaluate(() => ({sh: document.documentElement.scrollHeight, sw: document.documentElement.scrollWidth, ih: innerHeight, iw: innerWidth}));
  const g = await p.evaluate(() => SYNQUENZER.g3Info());
  const cv = await p.evaluate(() => { const c = [...document.querySelectorAll('canvas')].filter(c => c.offsetParent && c.getBoundingClientRect().width > 100).map(c => { const r = c.getBoundingClientRect(); return {id: c.id, cls: c.className, x: r.left, y: r.top, w: r.width, h: r.height}; }); return c; });
  const sv = cv.find(c => /sv|song/i.test(c.id + ' ' + c.cls)) || cv[0];
  const tails = g.drawn;
  let mel = tails.find(d => d.t === 5 && d.what === 'notes');
  if (!mel) { await p.evaluate(() => SYNQUENZER.trackBank(0)); await sleep(500); mel = (await p.evaluate(() => SYNQUENZER.g3Info())).drawn.find(d => d.t === 5 && d.what === 'notes'); if (mel) await p.screenshot({path: OUT + 'g3-' + nm + '-song-melodie.png'}); await p.evaluate(() => SYNQUENZER.trackBank(1)); await sleep(400); }
  const pre = tails.find(d => d.t === sti && d.what === 'pre'), post = tails.find(d => d.t === sti && d.what === 'post');
  const inside = tails.every(d => d.x0 >= -1 && d.x1 <= (sv ? sv.w : 1e9) + 1 && d.y >= 0 && d.y + d.h <= (sv ? sv.h : 1e9) + 1);
  ok(pre && post && mel, `${nm}: Schwänzchen gezeichnet – Anlauf ${pre ? (pre.x1 - pre.x0).toFixed(1) : '–'} px, Ausklang ${post ? (post.x1 - post.x0).toFixed(1) : '–'} px, Auftakt-Noten ${mel ? (mel.x1 - mel.x0).toFixed(1) : '–'} px`);
  ok(inside, `${nm}: alle Schwänzchen im Bild der Song-Ansicht (${sv ? Math.round(sv.w) + '×' + Math.round(sv.h) : '?'})`);
  ok(d1.sw <= d1.iw && d1.sh <= d0.sh && d0.sh <= d0.ih + 1, `${nm}: kein Layout-Sprung, kein waagrechtes Rollen (${JSON.stringify(d0)} → ${JSON.stringify(d1)})`);
  await p.screenshot({path: OUT + 'g3-' + nm + '-song.png'});
}
ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 3)));
await H.br.close();
console.log(fails() ? `FEHLER: ${fails()}` : 'ALLE OK'); process.exit(fails() ? 1 : 0);
