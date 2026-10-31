// Takes-Blatt mit [♪ Tonhöhe · Noten] (und später [Chor]) in 6 Größen: alles im Bild, Tasten ≥ 44 hoch, nichts abgeschnitten
import {launch, openG, sleep, toI16} from './g1/n5-g-h.mjs';
import {voice} from './vs-dsp/test-signals.mjs';
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const br = await launch(null), H = await openG(br), p = H.p;
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
const x = voice(48000, 4, [{t: 0.2, d: 1.5, f0: 220, vowel: 'a'}, {t: 2, d: 1.5, f0: 247, vowel: 'o'}]).x;
const r = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 2}), toI16(x));
for (const [w, h, nm] of [[390, 844, 'P1'], [375, 667, 'P2'], [320, 568, 'P3'], [844, 390, 'L1'], [667, 375, 'L2'], [926, 428, 'XL']]) {
  await p.setViewportSize({width: w, height: h}); await sleep(300);
  await p.evaluate(R => SYNQUENZER.tkSheet(R), {t: r.track, s: 0}); await sleep(500);
  const lay = await p.evaluate(() => { const pop = document.querySelector('.pop.tksheet'); const out = []; for (const e of pop.querySelectorAll('button, input')) { const q = e.getBoundingClientRect(); out.push({t: e.textContent.trim().slice(0, 24), x: q.left, y: q.top, r: q.right, b: q.bottom, w: q.width, h: q.height, sw: e.scrollWidth > e.clientWidth + 1}); }
    const pr = pop.getBoundingClientRect(); return {out, W: innerWidth, H: innerHeight, pop: {t: pr.top, b: pr.bottom, sh: pop.scrollHeight, ch: pop.clientHeight}}; });
  const vis = lay.out.filter(e => e.w > 0);
  const clip = vis.filter(e => e.x < -0.5 || e.r > lay.W + 0.5 || e.sw || ((e.y < -0.5 || e.b > lay.H + 0.5) && lay.pop.sh <= lay.pop.ch + 1));
  const small = vis.filter(e => e.h < 44 - 0.5 && !/^(✕)$/.test(e.t) && e.t !== '');
  const g2 = vis.find(e => /Tonhöhe/.test(e.t));
  ok(g2 && !clip.length && !small.length, `${nm}: ♪-Knopf ${g2 ? g2.w.toFixed(0) + '×' + g2.h.toFixed(0) + ' bei y ' + g2.y.toFixed(0) : 'fehlt'}; Blatt ${lay.pop.t.toFixed(0)}–${lay.pop.b.toFixed(0)} (scroll ${lay.pop.sh}/${lay.pop.ch}); abgeschnitten ${clip.map(e => e.t).join(',') || '–'}; < 44 ${small.map(e => e.t + ' ' + e.h.toFixed(0)).join(',') || '–'}`);
  await p.screenshot({path: '/home/user/Synquenzer/bau/helfer/G267/tests/out/tksheet-' + nm + '.png'});
  await p.keyboard.press('Escape'); await p.evaluate(() => { try { document.querySelector('.pop.tksheet [data-a=x]') && document.querySelector('.pop.tksheet [data-a=x]').click(); } catch (e) {} }); await sleep(200);
}
await br.close(); console.log(fail ? fail + ' FEHLER' : 'ALLE GRÜN'); process.exit(fail ? 1 : 0);
