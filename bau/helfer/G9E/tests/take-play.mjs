// G9M: Gesang-Take aufnehmen (Fake-Mikro, Szene 1, 4 Takte), Mikro aus, nur STIMME spielt → Pegel; dazu clPlayHash.
// node take-play.mjs <index.html>
import {open, micOn, g10demo, closeAll, sleep, waitBeat, T} from './h-lib.mjs';
const FILE = process.argv[2], ok = T();
const H = await open(FILE), p = H.p; await g10demo(p); await micOn(p);
const st = await p.evaluate(() => SYNQUENZER.tkInfo().stimme);
await p.evaluate(s => { for (let i = 0; i < NT(); i++) { R.slot[i] = -1; R.pend[i] = null; } SYNQUENZER.selectSlot(s, 0); SYNQUENZER.rec(); }, st);
await waitBeat(p, 4 * 4 - 3.7); await p.evaluate(() => SYNQUENZER.rec()); await waitBeat(p, 4 * 4 + .3);
await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy && !SYNQUENZER.tkInfo().pend.length && SYNQUENZER.tkInfo().writes === 0 && SYNQUENZER.runtime().rec.state === 'off', null, {timeout: 30000}); await sleep(400);
await p.evaluate(() => { SYNQUENZER.stop(); SYNQUENZER.stimmeStop('aus'); }); await sleep(500);
const tk = await p.evaluate(() => Object.keys(SYNQUENZER.takes()));
ok('Take angelegt', tk.length === 1, JSON.stringify(tk));
const hash = tk.length ? await p.evaluate(id => SYNQUENZER.clPlayHash(id), tk[0]) : null;
ok('Abspiel-Puffer vorhanden', !!hash, hash);
// nur die STIMME-Spur in Szene 1, andere Spuren leer
await p.evaluate(s => { for (let i = 0; i < NT(); i++) { if (i !== s) { R.slot[i] = -1; R.pend[i] = null; stopTrackNow(i); } } SYNQUENZER.g10OutRms(); SYNQUENZER.selectSlot(s, 0); }, st);
await p.evaluate(s => { for (let i = 0; i < NT(); i++) if (i !== s) SYNQUENZER.setClip(i, 0, null); SYNQUENZER.play(); }, st);
await waitBeat(p, 8.2);
const rms = await p.evaluate(() => SYNQUENZER.g10OutRms(0.5, 8));
ok('Take klingt beim Abspielen (Ausgang > −60 dB)', rms != null && rms > -60, 'RMS ' + (rms == null ? null : rms.toFixed(1)) + ' dB');
await p.evaluate(() => SYNQUENZER.stop());
ok('Konsole', !H.errs.length, H.errs.join('|').slice(0, 300));
console.log('MESS', JSON.stringify({rms: rms && +rms.toFixed(2), hash}));
ok.sum(); await closeAll();
