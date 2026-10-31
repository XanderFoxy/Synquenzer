import {open, sleep} from './n4-vs-l-h.mjs';
const H = await open({}), p = H.p;
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });
const sine = (f, n) => { const x = []; for (let i = 0; i < n; i++) x.push(Math.round(Math.sin(2 * Math.PI * f * i / 48000) * 9000)); return x; };
var r = await p.evaluate(pc => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 2, len: 2}), sine(220, 96000));
await p.evaluate(t => { SYNQUENZER.selectTrack(t); SYNQUENZER.selectSlot(t, 2); }, r.track); await sleep(600);
console.log(JSON.stringify(r), await p.evaluate(t => { const c = document.querySelector('[data-t="' + t + '"][data-s="2"]'); return c ? c.outerHTML.slice(0, 600) : [...document.querySelectorAll('[data-t="' + t + '"]')].map(e => e.className).join('|'); }, r.track));
await H.br.close();
