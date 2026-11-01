// SX8 Abnahme: Pinch-Zoom im Song (CDP-Zwei-Finger-Touch), 428×926 und 926×428. node sx8-abnahme.mjs [app.html] [shots-dir]
import { chromium } from 'playwright';
import path from 'path';
const APP = path.resolve(process.argv[2] || new URL('../index.html', import.meta.url).pathname), OUT = process.argv[3] || '.';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = []; const ok = (n, c, d) => { res.push([n, !!c]); console.log((c ? 'OK  ' : 'FEHL') + ' ' + n + (d != null ? ' · ' + JSON.stringify(d) : '')); };
const SONG = {bars: 64, lanes: [[{bar: 0, slot: 0}, {bar: 16, slot: 1}], [{bar: 0, slot: 0}], [], [{bar: 8, slot: 0}]],
  marks: [{a: 0, len: 8, name: 'Intro'}, {a: 8, len: 16, name: 'Strophe'}, {a: 24, len: 8, name: 'Refrain'}, {a: 32, len: 16, name: 'Strophe 2'}, {a: 48, len: 2, name: 'Fill'}, {a: 50, len: 14, name: 'Outro'}]};
async function run(w, h, tag) {
  const b = await chromium.launch(); const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + APP); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime, null, {timeout: 20000}); await sleep(1200);
  const cdp = await ctx.newCDPSession(p), T = (type, pts) => cdp.send('Input.dispatchTouchEvent', {type, touchPoints: pts});
  await p.evaluate(s => { SYNQUENZER.setSong(s); setSongView(true); }, SONG); await sleep(300);
  const I = () => p.evaluate(() => SYNQUENZER.sx8Info()), cv = await p.evaluate(() => SYNQUENZER.svLayoutInfo().canvas);
  const cy = cv.y + cv.h * .55, cx = cv.x + cv.w / 2, R = Math.floor(cv.w / 2 - 10);   // beide Finger auf der Leinwand
  const pinch = async (d0, d1, n = 10, mid) => {
    await T('touchStart', [{x: cx - d0, y: cy, id: 1}]); await sleep(20);
    await T('touchStart', [{x: cx - d0, y: cy, id: 1}, {x: cx + d0, y: cy, id: 2}]); await sleep(20);
    await p.evaluate(() => { window.__f = []; const f = t => { __f.push(t); if (__f.length < 400) window.__fr = requestAnimationFrame(f); }; window.__fr = requestAnimationFrame(f); });
    for (let k = 1; k <= n; k++) { const d = d0 + (d1 - d0) * k / n; await T('touchMove', [{x: cx - d, y: cy, id: 1}, {x: cx + d, y: cy, id: 2}]); await sleep(16); if (k === (n >> 1) && mid) await mid(); }
    const fr = await p.evaluate(() => { cancelAnimationFrame(__fr); const d = __f.slice(1).map((t, i) => t - __f[i]); d.sort((a, b) => a - b); return {n: d.length, med: d[d.length >> 1], p90: d[Math.floor(d.length * .9)]}; });
    await T('touchEnd', [{x: cx + d1, y: cy, id: 2}]); await sleep(20); await T('touchEnd', []); await sleep(120);
    return fr;
  };
  // 1 Aufzoomen: während der Geste nur Transform (cellW bleibt), am Ende neu gezeichnet; Bilder/s
  let midI = null; const fr = await pinch(40, 56, 10, async () => { midI = await I(); });
  const a = await I();
  ok(tag + ' Geste = nur Transform', midI && midI.pinch && /scaleX/.test(midI.xf) && midI.cellW === 36, midI && {cw: midI.cellW, xf: midI.xf.slice(0, 40)});
  ok(tag + ' Zoom rein ×1,4', Math.abs(a.cellW - 36 * 1.4) < 2 && a.xf === '' && !a.pinch, a.cellW);
  ok(tag + ' ≥ 59 Bilder/s (Median ≤ 17 ms)', fr.med <= 17, fr);
  // 2 bis „Schläge sehen“ (max) und Schläge sichtbar
  await pinch(20, R, 12); const mx = await I(); ok(tag + ' max = Schläge (192 px/Takt)', Math.abs(mx.cellW - 192) < .01, mx.cellW);
  await p.screenshot({path: `${OUT}/sx8-${tag}-schlaege.png`});
  // 3 weit raus = ganzer Song, Farbblöcke, Griffe weg
  await p.evaluate(() => { S.song.loop = {on: true, a: 0, b: 2}; UI.dirty.song = true; });
  await pinch(R, 10, 14); await pinch(R, 10, 14); const mn = await I();
  ok(tag + ' min = ganzer Song + Blöcke', Math.abs(mn.cellW - mn.fit) < .01 && mn.blocks, {cw: mn.cellW, fit: mn.fit});
  ok(tag + ' Griffe aus bei kleinem Zoom', mn.grips === null);
  await p.screenshot({path: `${OUT}/sx8-${tag}-bloecke.png`});
  // 4 Doppeltipp mit zwei Fingern: zurück auf 36, noch einmal = ganzer Song
  const tap2 = async () => { await T('touchStart', [{x: cx - 30, y: cy, id: 1}, {x: cx + 30, y: cy, id: 2}]); await sleep(60); await T('touchEnd', []); await sleep(90); };
  await tap2(); await tap2(); await sleep(350); const t1 = await I();
  await tap2(); await tap2(); await sleep(350); const t2 = await I();
  ok(tag + ' Doppeltipp 2 Finger ⇄ ganzer Song', Math.abs(t1.cellW - 36) < .01 && Math.abs(t2.cellW - t2.fit) < .01, [t1.cellW, t2.cellW]);
  // 5 Zoom je Projekt gemerkt (UI-Einstellung), Projekt unverändert
  const pr = await p.evaluate(() => ({pref: SYNQUENZER.sx8Info().pref, inProj: JSON.stringify(S).includes('sx8')}));
  ok(tag + ' Zoom gemerkt, nicht im Projekt', Math.abs(pr.pref - t2.cellW) < .01 && !pr.inProj, pr);
  // 6 Marke weit ziehen → Mini-Karte (bei 36 px passt der Song nicht)
  await tap2(); await tap2(); await sleep(350);
  const mk = await p.evaluate(() => SYNQUENZER.svLayoutInfo().marks.find(m => m.label.startsWith('STROPHE')));
  const my = cv.y + 8 + (await p.evaluate(() => SV.blS | 0)), mx0 = cv.x + mk.x0 + 20;
  await T('touchStart', [{x: mx0, y: my, id: 1}]); await sleep(560);
  for (let k = 1; k <= 12; k++) { await T('touchMove', [{x: mx0 + k * 18, y: my + k * 6, id: 1}]); await sleep(20); }
  await sleep(80); const mm = await I(); await p.screenshot({path: `${OUT}/sx8-${tag}-minikarte.png`});
  ok(tag + ' Mini-Karte beim weiten Ziehen', mm.mm);
  await p.evaluate(() => drgCancel()); await T('touchEnd', []); await sleep(300);
  ok(tag + ' Mini-Karte weg nach dem Ziehen', !(await I()).mm);
  // 7 Song unverändert, keine Fehler
  ok(tag + ' keine Seitenfehler', !errs.length, errs.slice(0, 3));
  await b.close();
}
await run(428, 926, 'P'); await run(926, 428, 'L');
const bad = res.filter(r => !r[1]).length; console.log(bad ? bad + ' FEHL' : 'ALLE OK (' + res.length + ')'); process.exit(bad ? 1 : 0);
