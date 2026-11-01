// VS-L-fix: Takes-Blatt A/B während ▶ (VS3-Abnahme G) – geplante Stücke und Pegel nach dem Tausch. APP=<file> node n4-vs-l-fix-ab.mjs
import {open, sleep} from './n4-vs-l-reg-vs3-h.mjs';
const sine = (sr, sec, f, a) => { const n = Math.round(sr * sec), x = new Array(n); for (let i = 0; i < n; i++) x[i] = Math.round(Math.sin(2 * Math.PI * f * i / sr) * (a || 12000)); return x; };
const H = await open(), p = H.p;
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); SYNQUENZER.setMetronome(false); });
await p.evaluate(pc => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 0, len: 1}), sine(48000, 2, 440));
await p.evaluate(pc => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 0, len: 1}), sine(48000, 2, 880));
await p.evaluate(() => { window.__tap(); SYNQUENZER.launchScene(0); }); await sleep(900);
await p.evaluate(() => SYNQUENZER.tkSheet());
const dump = () => p.evaluate(() => { const c = SYNQUENZER.vsClock(), b = t => +((t - c.start) / c.spb).toFixed(3); return {now: b(c.now), sched: +SYNQUENZER.runtime().schedBeat?.toFixed?.(3), src: SYNQUENZER.tkInfo().src.map(r => [r.take.slice(0, 3), b(r.start), b(r.end), +r.off.toFixed(3)]), lvl: window.__lvl() && +window.__lvl().peakHz.toFixed(0)}; });
const out = [];
await p.evaluate(() => document.querySelector('.pop.tksheet button[data-a="ab"]').click());
for (let k = 0; k < 30; k++) { out.push(await dump()); await sleep(80); }
console.log(JSON.stringify(out, null, 0).replace(/\},\{/g, '},\n{'));
console.log('Fehler', JSON.stringify(H.errs.slice(0, 3)));
await H.br.close();
