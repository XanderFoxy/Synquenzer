// VV-LOGO: [Abbrechen] while the Abspann runs (real-time way): the job ends with „abgebrochen“, the logo video stops,
// the next export works and has its Abspann again.
import * as L from './vvl-lib.mjs';
const C = [], X = {};
const s = await L.serve('mp4');
const {b, p, errs} = await L.open(s.url);
await L.song(p);
await p.evaluate(() => { SYNQUENZER.vvTest({noVE: true}); window.__vv = SYNQUENZER.vvMake({fmt: '16:9'}).then(x => ({ok: x.dur}), e => ({err: String(e && e.message || e)})); });
// wait until the logo plays (the song ~11 s, then 1 s Abblende)
await p.waitForFunction(() => VVL.v && !VVL.v.paused && VVL.v.currentTime > .3, null, {timeout: 40000, polling: 50});
X.at = await p.evaluate(() => VVL.v.currentTime);
await p.evaluate(() => SYNQUENZER.vvCancel());
X.r = await p.evaluate(() => window.__vv);
X.after = await p.evaluate(() => ({paused: VVL.v.paused, t: VVL.v.currentTime, busy: VV.busy, job: !!VV.job}));
C.push(['Abbruch im Abspann → „abgebrochen“', X.r.err === 'abgebrochen', X.r]);
C.push(['Logo-Video steht, Job frei', X.after.paused && !X.after.busy && !X.after.job, X.after]);
await p.evaluate(() => SYNQUENZER.vvTest({opus: true}));
X.again = await p.evaluate(() => SYNQUENZER.vvMake({fmt: '9:16'}).then(x => ({dur: x.dur, logo: x.logo})));
C.push(['nächstes Video wieder mit Abspann', X.again.logo && Math.abs(X.again.dur - (X.again.logo.at + 4.5)) < 1e-6, X.again]);
C.push(['keine Konsolenfehler', errs.length === 0, errs]);
L.report('cancel', C, X);
await b.close(); await s.close();
