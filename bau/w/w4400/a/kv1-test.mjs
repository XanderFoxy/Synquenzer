// KV1-Test: die Regler fahren sichtbar mit, wenn ein Clip-Klangzustand ◆ greift (Szene, Song-Teil, Rückfahrt, Hand, Querformat)
import { chromium } from 'playwright';
const f = process.argv[2], dir = process.argv[3] || '.';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const errs = [];
async function page(w, h) {
  const p = await b.newPage({viewport: {width: w, height: h}, hasTouch: true});
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + f); await p.waitForTimeout(1500);
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.v6aSetState(2, 0, {p: {cutoff: 300}}); Q.v6aSetState(2, 1, {p: {cutoff: 8000}});
    Q.v6aSetGlide(2, 0, {x: 'bar1'}); Q.v6aSetGlide(2, 1, {x: 'bar1'}); Q.selectTrack(2); Q.openEditor(); });
  await p.waitForTimeout(400);
  await p.evaluate(() => { const t = [...document.querySelectorAll('#synthSheet button')].find(x => x.textContent.trim() === 'FILTER'); t.click(); });
  await p.waitForTimeout(400);
  return p;
}
const read = p => p.evaluate(() => {
  const k = document.querySelector('#synthSheet .knob[data-key="cutoff"]'), Q = window.SYNQUENZER, rt = Q.state().runtime;
  const r = KV1.run[2], t = kv1T();
  return {beat: +rt.beat.toFixed(2), txt: k ? k.querySelector('.kn').textContent : '?', n: k ? +(+k.getAttribute('aria-valuenow')).toFixed(3) : -1, amb: !!(k && k.classList.contains('kv1')),
    grund: Q.getParam(2, 'cutoff'), on: KV1.on, ph: r && r.t1 > r.t0 ? +Math.min(1, Math.max(0, (t - r.t0) / (r.t1 - r.t0))).toFixed(2) : null,
    xy: (document.querySelector('#synthSheet .xy .xv') || {}).textContent || ''};
});
async function follow(p, label, ms, shots) {
  const out = []; const t0 = Date.now(); let k = 0;
  while (Date.now() - t0 < ms) {
    const o = await read(p); out.push(o);
    if (shots && o.ph != null) { const want = shots[k]; if (want && ((want.at === 0 && o.ph > 0 && o.ph < .2) || (want.at === .5 && o.ph >= .45 && o.ph < .7) || (want.at === 1 && o.ph >= 1))) { await p.screenshot({path: dir + '/' + want.name}); k++; } }
    await p.waitForTimeout(90);
  }
  console.log(label + ':', out.map(o => `${o.beat}|${o.txt}|${o.n}${o.amb ? '*' : ''}${o.ph != null ? '@' + o.ph : ''}`).join('  '));
  return out;
}
const mono = (xs, up) => xs.every((x, j) => !j || (up ? x >= xs[j - 1] - 1e-3 : x <= xs[j - 1] + 1e-3));
const res = {};
// A: Szene 1 -> 2 (Hochkant), Fotos Anfang / Mitte / Ende
{
  const p = await page(428, 926);
  await p.evaluate(() => window.SYNQUENZER.launchScene(0)); await p.waitForTimeout(1500);
  const a0 = await read(p);
  await p.evaluate(() => window.SYNQUENZER.launchScene(1));
  const A = await follow(p, 'A Szene 1->2', 6500, [{at: 0, name: 'kv1-anfang.png'}, {at: .5, name: 'kv1-mitte.png'}, {at: 1, name: 'kv1-ende.png'}]);
  const ns = A.map(o => o.n), moving = A.filter(o => o.amb).length, mids = new Set(A.filter(o => o.ph > 0 && o.ph < 1).map(o => o.txt)).size;
  res.A = {start: a0.txt, end: A[A.length - 1].txt, grund: A[A.length - 1].grund, monoton: mono(ns, true), zwischenwerte: mids, amberBilder: moving, amberAmEnde: A[A.length - 1].amb, xyEnde: A[A.length - 1].xy, aus: !A[A.length - 1].on};
  // Rückfahrt Szene 2 -> 1 und eine Hand während der Fahrt (setParam = Griff an den Regler)
  await p.evaluate(() => window.SYNQUENZER.launchScene(0));
  const B = await follow(p, 'A Rueckfahrt', 3200);
  res.Rueck = {monotonFallend: mono(B.map(o => o.n), false), letzter: B[B.length - 1].txt};
  // die Hand greift mitten in der nächsten Fahrt an den CUTOFF-Regler (echte Zeiger-Ereignisse): kein Sprung, danach zeigt er den Griff-Wert
  await p.evaluate(() => window.SYNQUENZER.launchScene(1));
  let o; for (let k = 0; k < 80; k++) { o = await read(p); if (o.ph != null && o.ph >= .4 && o.ph < 1) break; await p.waitForTimeout(60); }
  const bx = await p.evaluate(() => { const r = document.querySelector('#synthSheet .knob[data-key="cutoff"] svg').getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
  const vorGriff = await read(p);
  await p.mouse.move(bx.x, bx.y); await p.mouse.down(); await p.mouse.move(bx.x, bx.y - 4); await p.mouse.move(bx.x, bx.y - 6);   // 2 px über die Schwelle
  const imGriff = await read(p);
  const H = await follow(p, 'A Hand', 2600);
  await p.mouse.up();
  const nach = await read(p);
  res.Hand = {grundklangVorher: vorGriff.grund, vorGriff: vorGriff.txt + ' (n ' + vorGriff.n + ')', imGriff: imGriff.txt + ' (n ' + imGriff.n + ')', sprungN: +(imGriff.n - vorGriff.n).toFixed(3), haeltWert: new Set(H.map(x => x.txt)).size === 1, nachEnde: nach.txt, grundklangJetzt: nach.grund, amberNachGriff: H.some(x => x.amb)};
  await p.evaluate(() => window.SYNQUENZER.stop()); await p.close();
}
// B: konsolidierter Song-Teil (Kette Szene 1 · 2 Takte, Szene 2 · 2 Takte) als Teil abgespielt
{
  const p = await page(428, 926);
  const kon = await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]); return Q.konsolidieren(0, 3, 'KV1'); });
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.launchPart(Q.parts().findIndex(x => x && x.name === 'KV1')); });
  const P = await follow(p, 'B Song-Teil', 11500);
  const up = P.filter(o => o.beat >= 7.5 && o.beat <= 12.5).map(o => o.n), dn = P.filter(o => o.beat >= 15.5 && o.beat <= 20.5).map(o => o.n);
  res.Teil = {kon: !!kon, vorher: P[0].txt, bis8: P.filter(o => o.beat < 7.9).map(o => o.txt).pop(), nach12: P.filter(o => o.beat > 12.3 && o.beat < 15.5).map(o => o.txt).pop(),
    hochMonoton: mono(up, true), hochSchritte: new Set(up).size, runterMonoton: mono(dn, false), runterSchritte: new Set(dn).size};
  // ◆ bearbeiten: die bisherige Anzeige (Arbeitskopie) bleibt, kein Fahren
  await p.evaluate(() => window.SYNQUENZER.v6aEdit(2)); await p.waitForTimeout(300);
  const e1 = await read(p); await p.waitForTimeout(1500); const e2 = await read(p);
  res.Raute = {a: e1.txt, b: e2.txt, amber: e1.amb || e2.amb};
  await p.evaluate(() => { window.SYNQUENZER.v6aDone(); window.SYNQUENZER.stop(); }); await p.close();
}
// C: Querformat, Foto mitten in der Fahrt
{
  const p = await page(926, 428);
  await p.evaluate(() => window.SYNQUENZER.launchScene(0)); await p.waitForTimeout(1500);
  await p.evaluate(() => window.SYNQUENZER.launchScene(1));
  const C = await follow(p, 'C quer', 4200, [{at: .5, name: 'kv1-quer-mitte.png'}]);
  res.Quer = {ende: C[C.length - 1].txt, zwischenwerte: new Set(C.filter(o => o.ph > 0 && o.ph < 1).map(o => o.txt)).size};
  await p.close();
}
// D: Kosten – ohne Fahrt kein Malen (KV1.on bleibt aus), Editor zu = kein Aufruf
{
  const p = await page(428, 926);
  await p.evaluate(() => window.SYNQUENZER.launchScene(0)); await p.waitForTimeout(2500);
  res.Ruhe = await p.evaluate(async () => { let calls = 0; const o = window.kv1Paint; window.kv1Paint = function () { calls++; return o.apply(this, arguments); };
    await new Promise(r => setTimeout(r, 1500)); window.kv1Paint = o; return {on: KV1.on, paintAufrufe: calls}; });
  await p.close();
}
console.log(JSON.stringify(res, null, 1));
console.log('errors', JSON.stringify(errs));
await b.close();
