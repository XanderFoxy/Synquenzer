// S1: is the FANG button tappable (portrait) when the pass with played notes is complete? + scene launch during a pass
import {launch, open, sleep, tally} from '../h.mjs';
const ok = tally(); const br = await launch();
async function setup(p, bpm) {
  await p.evaluate(bpm => { const D = SYNQUENZER, nt = D.NT(); D.setBpm(bpm); D.setMetronome && D.setMetronome(false);
    D.setPart(0, {name: 'Strophe', slots: Array.from({length: nt}, (_, t) => D.getClip(t, 0) ? {s: 0} : -1), chords: {len: 4, ch: [{b: 0, tg: null}]}}); selectTrack(3); }, bpm);
}
const pass = p => p.evaluate(() => { const rp = R.part, L4 = partLen(S.parts[rp.i]) * 4; return {st: rp.startBeat, L4, k: Math.floor((audBeat() - rp.startBeat) / L4)}; });
const waitB = (p, b) => p.waitForFunction(b => audBeat() >= b, b, {timeout: 60000, polling: 5});
for (const bpm of [100, 120]) {
  const H = await open(br), p = H.p; await setup(p, bpm);
  await p.evaluate(() => SYNQUENZER.play()); await sleep(300);
  await p.tap('#partBar .pk[data-i="0"]');
  await p.waitForFunction(() => R.part && R.part.i === 0, null, {timeout: 5000});
  const q = await pass(p), A = q.st + (q.k + 1) * q.L4;
  await waitB(p, A + 1); await p.evaluate(() => { SYNQUENZER.keyOn(72, .8, 'n'); setTimeout(() => SYNQUENZER.keyOff(72, 'n'), 300); });
  await waitB(p, A + q.L4 + 0.25);
  const st = await p.evaluate(() => ({vis: getComputedStyle(document.getElementById('bFang')).visibility, mode: fangMode(), s1: SYNQUENZER.s1Active()}));
  ok(st.vis === 'visible', `${bpm} bpm, 4-Takt-Teil, Note in Takt 1 gespielt: direkt nach dem Durchlauf ist FANG antippbar (${JSON.stringify(st)})`);
  await H.ctx.close();
}
// scene launch in bar 3 of a pass → FANG
{
  const H = await open(br), p = H.p; await setup(p, 240);
  await p.evaluate(() => SYNQUENZER.play()); await sleep(300);
  await p.tap('#partBar .pk[data-i="0"]');
  await p.waitForFunction(() => R.part && R.part.i === 0, null, {timeout: 5000});
  const q = await pass(p), A = q.st + (q.k + 1) * q.L4;
  await waitB(p, A + 7.5); await p.evaluate(() => SYNQUENZER.launchScene(1));
  await waitB(p, A + q.L4 + 0.5);
  const st = await p.evaluate(() => ({part: R.part, s1: SYNQUENZER.s1Active(), vis: getComputedStyle(document.getElementById('bFang')).visibility}));
  if (st.vis === 'visible') await p.tap('#bFang'); else await p.evaluate(() => fangTap());
  await sleep(300);
  const sh = await p.evaluate(() => ({s1: !!document.querySelector('.s1sheet'), pop: UI.pop && UI.pop.name, toast: (document.querySelector('.toast') || {}).textContent}));
  ok(sh.s1, '(Szenenwechsel) Teil läuft, Sz2 in Takt 3 gestartet, FANG → Blatt „TEIL ÜBERARBEITET“: ' + JSON.stringify(st) + ' ' + JSON.stringify(sh));
  await H.ctx.close();
}
await br.close(); process.exit(ok.done() ? 1 : 0);
