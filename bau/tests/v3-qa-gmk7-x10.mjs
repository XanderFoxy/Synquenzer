// HALTEN (TIMBRE) then other knob gestures: does the held formant survive?
import {open, sleep} from './v3-qa-gmk7-tl.mjs';
import {setupProject} from './v3-qa-gmk7-setup.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
const log = (...a) => console.log(...a);
await setupProject(E);
await E(() => { SYNQUENZER.setEngine(2, 'mk'); SYNQUENZER.mkSet(2, 'mode', 3); SYNQUENZER.mkIn(2, 'e2', 3); SYNQUENZER.launchScene(0); SYNQUENZER.play(); });
await T.openEd(2); await sleep(1500);
const H = async l => { const m = await T.pm(2); log(l.padEnd(40), 'hold', m.voc.hold ? 'yes' : 'NO', 'efs', m.voc.efs, 'fs', m.voc.fs, '| lcd', await T.lcd2(), '| top', JSON.stringify(await T.undoTop())); };
await T.tapMk('timbre', 800); await H('TIMBRE → HALTEN');
await T.w1(/FILTER/); await sleep(300);
await T.sweep('k0', -50, 15, 20); await H('FORMANT drag up');
await T.sweep('k3', 40, 15, 20); await H('FOLGER drag down');
await T.tapTxt('#synthSheet .hb.ur', /^↶$/, 300); await H('↶');
await T.sweep('k3', -10, 8, 20); await H('FOLGER drag up a little');
await T.tapTxt('#synthSheet .hb.ur', /^↶$/, 300); await H('↶');
// FOLGER knob tap / double tap (Standard)?
log('errs', errs);
await T.br.close();
