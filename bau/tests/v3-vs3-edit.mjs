import {open, sleep} from './v3-vs3-h.mjs';
const H = await open(), p = H.p;
await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.stop(); });
const x = []; for (let i = 0; i < 48000; i++) x.push(Math.round(Math.sin(i / 20) * 9000));
const r = await p.evaluate(pc => SYNQUENZER.tkInject({pcm: pc, sr: 48000, scene: 0, len: 1}), x);
await p.evaluate(t => { SYNQUENZER.selectTrack(t); SYNQUENZER.selectSlot(t, 0); }, r.track); await sleep(300);
await p.click('#bEdit'); await sleep(400);
console.log('✎ →', await p.evaluate(() => { const e = document.querySelector('.pop.tksheet h4'); return e ? e.textContent : 'kein Blatt'; }), 'Leiste:', await p.evaluate(() => document.getElementById('stSub').textContent), JSON.stringify(H.errs));
await H.br.close();
