// G267 Zusatz: Tipp [1/8] sofort nach dem Öffnen (Marken noch nicht gesucht) – springen die Marken sichtbar? Meldung?
// A/B „Original“: Marken gleiten zurück an die Quelle (≤ 250 ms), wieder A/B: zurück auf die Linien. 120 BPM, P1 Touch.
import {launch, openG, sleep, toI16, SR, OUTG} from './n5-g-h.mjs';
import {voice} from '../vs-dsp/test-signals.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const OFF = [0, 60, -60, 45, -50, 60, -60, 0, 55, -45, 60, -60, 30, -30];
const notes = OFF.map((o, k) => ({t: 0.5 + k * 0.25 + o / 1000, d: 0.11, f0: [220, 247, 262, 294][k % 4], vowel: 'aeiou'[k % 5], cons: k % 2 === 1}));
const x = voice(SR, 4, notes, {seed: 3}).x; { let sd = 5; for (let i = 0; i < x.length; i++) { sd = (sd * 16807) % 2147483647; x[i] += 0.0005 * (sd / 2147483647 * 2 - 1); } }
const br = await launch(null);
const H = await openG(br, {viewport: {width: 390, height: 844}, touch: true, mobile: true}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome(false); }); await sleep(300);
const r1 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 1, len: 2}), toI16(x)); const id = r1.id;
const rec = () => p.evaluate(() => { window.__fr = []; const t0 = performance.now(); const f = () => { const g = SYNQUENZER.wpGeom(); if (g) window.__fr.push({t: performance.now() - t0, m: g.marks.slice(), s: g.src.slice()}); if (performance.now() - t0 < 1500) requestAnimationFrame(f); }; requestAnimationFrame(f); });
const dur = async () => { const fr = (await p.evaluate(() => window.__fr)).filter(f => f.m.length); if (!fr.length) return {dur: null}; const fin = fr[fr.length - 1].m;
  const first = fr.findIndex((f, i) => i && f.m.length === fr[i - 1].m.length && f.m.some((v, k) => Math.abs(v - fr[i - 1].m[k]) > 0.01)); if (first < 0) return {dur: null, n: 0, frames: fr.length, firstN: fr[0].m.length};
  let last = first; for (let i = first; i < fr.length; i++) if (fr[i].m.some((v, k) => Math.abs(v - fin[k]) > 0.01)) last = i + 1;
  return {dur: fr[Math.min(last, fr.length - 1)].t - fr[first - 1].t, n: last - first, fin, src: fr[fr.length - 1].s}; };
// 1) öffnen + sofort tippen (über die Bedienung: Zelle ✎ wäre schöner; Editor per API, Tipp per Touch)
await p.evaluate(r => SYNQUENZER.wpOpen({t: r.track, s: 1}), r1);
await rec();
await p.tap('#wpSheet .wpchips button[data-v="1/8"]'); await sleep(1600);
const D1 = await dur(), toast = await p.evaluate(() => document.getElementById('toast').textContent), mv = await p.evaluate(id => SYNQUENZER.wpMoved(id), id);
console.log('  sofort-Tipp:', JSON.stringify({dur: D1.dur, n: D1.n, frames: D1.frames, firstN: D1.firstN}));
ok(D1.dur != null && D1.dur <= 250 && D1.n >= 3, `Tipp [1/8] sofort nach dem Öffnen (Marken noch nicht gesucht): Marken springen sichtbar ${D1.dur == null ? 'NICHT (erscheinen gleich auf der Linie)' : D1.dur.toFixed(0) + ' ms, ' + D1.n + ' Zwischenbilder'}`);
ok(toast === mv + ' Einsätze gerückt', `Meldung „${toast}“ (Karte ${mv})`);
// 2) A/B → Original: Marken gleiten an die Quelle
await rec(); await p.tap('#wpSheet .wpab'); await sleep(1600);
const D2 = await dur();
const atSrc = D2.fin && D2.fin.every((v, k) => Math.abs(v - D2.src[k]) < 0.01);
ok(D2.dur != null && D2.dur <= 250 && atSrc, `A/B „Original“: Marken gleiten ${D2.dur && D2.dur.toFixed(0)} ms zurück an die Quelle (${atSrc})`);
await rec(); await p.tap('#wpSheet .wpab'); await sleep(1600);
const D3 = await dur();
ok(D3.dur != null && D3.dur <= 250, `A/B zurück: Marken gleiten ${D3.dur && D3.dur.toFixed(0)} ms wieder auf die Linien`);
ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2)));
await br.close();
console.log(fail ? 'FAIL ' + fail : 'ALL OK');
