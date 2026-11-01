// VV4-F App: Pegel je Spur, stumm → 0, Spitzenhalten 1,5 s, LED, Tipp Master → MASTER, CPU ≥ 2 → aus, verdeckt → aus,
// Hauptthread (Langaufgaben < 50 ms, Meter-Arbeit je Bild), keine Konsolenfehler
import { open, OUT, SONG8, check, summary } from './lib.mjs';
import fs from 'fs';
const W = +(process.env.W || 428), H = +(process.env.H || 926);
const {b, p, errs} = await open({w: W, h: H});
const info = () => p.evaluate(() => SYNQUENZER.mtrInfo());
await p.waitForTimeout(600);
let I = await info();
check('Meter gebaut (ein Worklet, 9 Eingänge)', I.built && I.ch.length === 9, {els: I.els});

// 1) Sinus −6 dBFS auf Spur 1 → −6 ± 0,5 dB (VV4-11)
await p.evaluate(() => { const c = AU.ctx; const o = c.createOscillator(), g = c.createGain(); o.frequency.value = 441; g.gain.value = .5; o.connect(g); g.connect(AU.tracks[0].cut); o.start(); window._t = {o, g}; });
await p.waitForTimeout(700);
I = await info();
check('Sinus −6 dBFS auf Spur 1 zeigt −6 ±0,5 dB (Spitze)', Math.abs(I.ch[0].pk + 6) <= .5, {pk: +I.ch[0].pk.toFixed(2), rms: +I.ch[0].rms.toFixed(2)});
check('RMS des Sinus −9 ±0,5 dB', Math.abs(I.ch[0].rms + 9.03) <= .5, I.ch[0].rms.toFixed(2));
check('andere Spuren 0 (leer)', I.ch.slice(1, 8).every(c => c.rms <= -100), I.ch.slice(1, 8).map(c => Math.round(c.rms)));
check('Master zeigt Pegel', I.ch[8].rms > -40, I.ch[8].rms.toFixed(1));
const dom = await p.evaluate(() => { const m = UI.heads[0].mt; return {clip: m.firstChild.children[1].style.clipPath, hold: m.firstChild.children[2].style.bottom}; });
check('Balken im DOM gefüllt (RMS-Schnitt)', /inset\((\d+)%/.test(dom.clip) && +dom.clip.match(/inset\((\d+)%/)[1] < 50, dom);
await p.evaluate(() => window._t.o.stop());

// 2) LED über −0,3 dBFS (an bei −0,1, aus bei −0,5)
const ledAt = async g => { await p.evaluate(g => { const c = AU.ctx; const o = c.createOscillator(), gg = c.createGain(); gg.gain.value = g; o.connect(gg); gg.connect(AU.tracks[1].cut); o.start(); o.stop(c.currentTime + .4); }, g); await p.waitForTimeout(300); const x = await info(); const d = await p.evaluate(() => UI.heads[1].mt.classList.contains('clip')); return {led: x.ch[1].led, dom: d, pk: +x.ch[1].pk.toFixed(2)}; };
const l1 = await ledAt(Math.pow(10, -.1 / 20));
check('LED an bei −0,1 dBFS (Wert und rote LED im DOM)', l1.led === 1 && l1.dom, l1);
await p.waitForTimeout(1800);
const l2 = await ledAt(Math.pow(10, -.5 / 20));
check('LED aus bei −0,5 dBFS', l2.led === 0 && !l2.dom, l2);
await p.waitForTimeout(1800);

// 3) Spitzenhalten 1,5 ±0,1 s: 80 ms bei −3 dB, danach −30 dB weiter; die Haltelinie fällt 1,5 s nach dem Ende des Stoßes
const hold = await p.evaluate(() => new Promise(res => {
  const c = AU.ctx, o = c.createOscillator(), g = c.createGain(), t0 = c.currentTime + .1, tE = t0 + .08;
  g.gain.setValueAtTime(0, 0); g.gain.setValueAtTime(.708, t0); g.gain.setValueAtTime(.0316, tE);
  o.connect(g); g.connect(AU.tracks[2].cut); o.start(); const L = [];
  const f = () => { const I = SYNQUENZER.mtrInfo(); L.push([AU.ctx.currentTime - AU.outLat, I.ch[2].hold, I.ch[2].pk]); if (AU.ctx.currentTime < tE + 2.3) requestAnimationFrame(f); else { o.stop(); res({tE, L}); } };
  requestAnimationFrame(f);
}));
const up = hold.L.find(x => x[1] > -4), down = hold.L.find(x => x[0] > hold.tE && x[1] < -20 && up && x[0] > up[0]);
const holdS = down ? down[0] - hold.tE : null;
check('Spitzenhalten 1,5 ±0,1 s', holdS != null && Math.abs(holdS - 1.5) <= .1, {s: holdS && +holdS.toFixed(3), haltDb: up && +up[1].toFixed(2)});
const mid = hold.L.find(x => x[0] > hold.tE + 1.0);
check('Haltelinie steht nach 1,0 s noch (Spitze ist schon gefallen)', mid && mid[1] > -4 && mid[2] < -25, mid && mid.map(v => +v.toFixed(2)));

// 4) Spur stumm → 0 (Demo-Szene 1 spielt)
await p.evaluate(() => SYNQUENZER.launchScene(0)); await p.waitForTimeout(2500);
I = await info();
const playing = I.ch.slice(0, 6).map(c => Math.round(c.rms));
check('Szene spielt: Spur 1 hat Pegel', I.ch[0].rms > -60, playing);
await p.evaluate(() => SYNQUENZER.setMute(0, true)); await p.waitForTimeout(2500);
I = await info();
check('Spur 1 stumm → 0 (leer), andere spielen weiter', I.ch[0].rms <= -100 && I.ch[0].pk <= -100 && I.ch.slice(1, 6).some(c => c.rms > -60), I.ch.slice(0, 6).map(c => Math.round(c.rms)));
await p.evaluate(() => SYNQUENZER.setMute(0, false));

// 5) Hauptthread: Langaufgaben während 6 s Spielen; Meter-Arbeit je Bild
await p.evaluate(() => { window._lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window._lt.push(e.duration); }).observe({type: 'longtask', buffered: false}); } catch (e) {} MTR.msMax = 0; MTR.msSum = 0; MTR.frames = 0; });
await p.waitForTimeout(6000);
const perf = await p.evaluate(() => ({lt: window._lt.slice(), frames: MTR.frames, avg: MTR.msSum / Math.max(1, MTR.frames), max: MTR.msMax, n: AU.meter.Q.cnt, lost: AU.meter.Q.lost}));
check('Hauptthread: keine Langaufgabe ≥ 50 ms (6 s Spielen)', perf.lt.every(d => d < 50), {longtasks: perf.lt.map(Math.round)});
check('Meter-Arbeit je Bild im Mittel ≤ 0,3 ms (Chromium)', perf.avg <= .3, {avgMs: +perf.avg.toFixed(4), maxMs: +perf.max.toFixed(3), frames: perf.frames});
check('Keine verlorenen Meter-Fenster', perf.lost === 0, perf.lost);

// 6) CPU-Begrenzer Stufe ≥ 2 → aus (keine Nachrichten, keine Arbeit), < 2 → wieder an
await p.evaluate(() => { LIM.last = performance.now() + 1e9; LIM.level = 2; });
await p.waitForTimeout(300);
const c0 = await p.evaluate(() => ({n: AU.meter.Q.cnt, f: MTR.frames, on: MTR.on}));
await p.waitForTimeout(1000);
const c1 = await p.evaluate(() => ({n: AU.meter.Q.cnt, f: MTR.frames, on: MTR.on, filled: [...document.querySelectorAll('.mtr .r')].filter(e => !/100%/.test(e.style.clipPath || '100%')).length}));
check('CPU-Stufe 2: Meter aus (0 Nachrichten, 0 Bild-Arbeit, Balken leer)', !c1.on && c1.n - c0.n <= 1 && c1.f === c0.f && c1.filled === 0, {c0, c1});
await p.evaluate(() => { LIM.level = 0; }); await p.waitForTimeout(800);
const c2 = await p.evaluate(() => ({n: AU.meter.Q.cnt, on: MTR.on}));
check('CPU-Stufe 0: Meter wieder an', c2.on && c2.n > c1.n + 10, c2);
await p.evaluate(() => { LIM.last = 0; });

// 7) verdeckt → aus: Seite unsichtbar (document.hidden); Ansicht zugedeckt (Klang-Editor)
await p.evaluate(() => { Object.defineProperty(document, 'hidden', {configurable: true, get: () => true}); });
await p.waitForTimeout(600);
const h1 = await p.evaluate(() => ({on: MTR.on, n: AU.meter.Q.cnt})); await p.waitForTimeout(500); const h2 = await p.evaluate(() => AU.meter.Q.cnt);
check('Seite verdeckt (hidden) → Meter aus', !h1.on && h2 - h1.n <= 1, {h1, h2});
await p.evaluate(() => { delete document.hidden; }); await p.waitForTimeout(600);
check('Seite wieder sichtbar → an', (await info()).on);

// 8) Tipp auf den Master-Balken → MASTER-Seite (Matrix), dann im Song
await p.evaluate(() => SYNQUENZER.stopAllClips && SYNQUENZER.stopAllClips());
const mb = await p.evaluate(() => { const r = UI.mtrM.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height}; });
await p.mouse.click(mb.x, mb.y); await p.waitForTimeout(700);
let pg = await p.evaluate(() => ({ed: R.editor, tab: ED.tab, sub: ED.sub.fx, grm: !!document.querySelector('.grm'), song: !!UI.songView}));
check('Matrix: Tipp Master → MASTER-Seite', pg.ed && pg.grm && !pg.song, pg);
await p.screenshot({path: `${OUT}/app-master-seite-${W}x${H}.png`});
// verdeckt durch den Editor?
const cov = await p.evaluate(() => ({on: MTR.on, vis: MTR.vis}));
console.log('  (Editor offen: Meter', JSON.stringify(cov), ')');
await p.evaluate(() => closeEditor()); await p.waitForTimeout(400);
await p.evaluate(s => SYNQUENZER.setSong(s), SONG8);
await p.evaluate(() => setSongView(true)); await p.waitForTimeout(500);
const sb = await p.evaluate(() => { const r = SV.mtrM.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height}; });
await p.mouse.click(sb.x, sb.y); await p.waitForTimeout(700);
pg = await p.evaluate(() => ({ed: R.editor, sub: ED.sub.fx, dfx: ED.dFx, grm: !!document.querySelector('.grm'), song: !!UI.songView}));
check('Song: Tipp Master → MASTER-Seite', pg.ed && pg.grm && pg.song, pg);
await p.evaluate(() => closeEditor()); await p.waitForTimeout(300);
// the TAKT cell / song labels keep their old taps (a track label still selects the track)
const lab = await p.evaluate(() => { const d = SV.labs.querySelector('.sv-l.trk[data-t="2"]'); const r = d.getBoundingClientRect(); return {x: r.left + 20, y: r.top + r.height / 2}; });
await p.mouse.click(lab.x, lab.y); await p.waitForTimeout(300);
check('Song: Spur-Name wählt weiter die Spur', (await p.evaluate(() => R.selT)) === 2);
await p.evaluate(() => setSongView(false)); await p.waitForTimeout(300);
const cn = await p.evaluate(() => { const r = UI.corner.getBoundingClientRect(); return {x: r.left + r.width * .6, y: r.top + r.height / 2}; });
await p.mouse.click(cn.x, cn.y); await p.waitForTimeout(400);
check('Matrix: SONG ⇄ schaltet weiter um (Tipp neben dem Balken)', await p.evaluate(() => !!UI.songView));

check('Keine Konsolenfehler', errs.length === 0, errs);
const S_ = summary();
fs.writeFileSync(`${OUT}/t-app-${W}x${H}.json`, JSON.stringify(S_, null, 1));
await b.close();
