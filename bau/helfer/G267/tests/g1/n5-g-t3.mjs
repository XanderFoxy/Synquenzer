// G1 Leistung (FP-IPHONE): 60-s-Take (240 Silben), Editor „Ganz“, Tipp 1/8 → Animation; Zeichenzeit je Bild, longtasks, CPU ×4 gedrosselt
import {launch, openG, sleep, toI16, SR} from './n5-g-h.mjs';
import {voice} from '../vs-dsp/test-signals.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const notes = []; for (let k = 0; k < 236; k++) notes.push({t: 0.5 + k * 0.25 + ((k * 37) % 13 - 6) * 0.009, d: 0.11, f0: [220, 247, 262, 294][k % 4], vowel: 'aeiou'[k % 5], cons: k % 2 === 1});
const x = voice(SR, 60, notes, {seed: 3}).x; { let sd = 5; for (let i = 0; i < x.length; i++) { sd = (sd * 16807) % 2147483647; x[i] += 0.0005 * (sd / 2147483647 * 2 - 1); } }
const br = await launch(null);
const H = await openG(br, {viewport: {width: 926, height: 428}, touch: true, mobile: true}), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
const r1 = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 1, len: 16}), toI16(x)); const id = r1.id;
await p.evaluate(id => SYNQUENZER.wpDetect(id), id);
await p.evaluate(r => SYNQUENZER.wpOpen({t: r.track, s: 1}), r1); await sleep(400);
for (let i = 0; i < 4; i++) { const z = await p.evaluate(() => document.querySelector('#wpSheet .wpz').textContent); if (z === 'Ganz') break; await p.tap('#wpSheet .wpz'); await sleep(150); }
const THR = +(process.env.THR || 1); if (THR > 1) { const cdp = await p.context().newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', {rate: THR}); }
await p.evaluate(() => { window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({entryTypes: ['longtask']});
 });
// Zeichenzeit: wpPaint direkt messen (eine Zeichnung mit beiden Wellenformen)
const t = await p.evaluate(() => { const a = []; for (let i = 0; i < 10; i++) { const t0 = performance.now(); wpPaint(); a.push(performance.now() - t0); } return a; });
await p.evaluate(() => { window.__fg = []; let l = performance.now(); const t0 = l; const f = () => { const n = performance.now(); window.__fg.push(n - l); l = n; if (n - t0 < 1200) requestAnimationFrame(f); }; requestAnimationFrame(f); });
await p.tap('#wpSheet .wpchips button[data-v="1/8"]'); await sleep(1500);
const fg = await p.evaluate(() => window.__fg); const fs = fg.slice().sort((a, b) => b - a);
console.log('  Bildabstände (ms), die 5 längsten:', fs.slice(0, 5).map(v => v.toFixed(0)).join(' '), '| Bilder', fg.length);
if (process.env.LT) for (let r = 0; r < 4; r++) { await p.tap('#wpSheet .wpchips button[data-v="' + ['1/16', '1/8', '1/4', '1/8'][r] + '"]'); await sleep(1300); }
const t2 = await p.evaluate(() => { const a = []; for (let i = 0; i < 10; i++) { const t0 = performance.now(); wpPaint(); a.push(performance.now() - t0); } return a; });
const lt = await p.evaluate(() => window.__lt), I = await p.evaluate(id => SYNQUENZER.wpInfo(id), id);
const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
console.log('  marks', I.warp && I.warp.map.src.length - 2, 'render', JSON.stringify(I.last));
ok(med(t2) < 12, 'Zeichnen je Bild (CPU ×' + THR + '): vorher ' + med(t).toFixed(1) + ' ms, quantisiert (zwei Wellenformen) ' + med(t2).toFixed(1) + ' ms');
ok(!lt.some(d => d > 50), 'longtasks beim Tipp + Animation (CPU ×' + THR + '): ' + JSON.stringify(lt));
ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2)));
await br.close();
console.log(fail ? 'FAIL ' + fail : 'ALL OK');
