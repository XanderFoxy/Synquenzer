// V6A auf allen Worklet-Engines: MS-2000-Platte (eng 3: Timbre-Pfade 'mk.t.0.f.cut' gleiten, Filtertyp springt am Taktstrich mit
// Überblendung) und FM (Makro fmBright gleitet; Operator-Pegel 'fm6.ops.N.ol' wechseln am Taktstrich als ganzer Satz mit 30-ms-Blende)
import { open, setup, ok, done } from './v6a-lib.mjs';
const { b, p, errs } = await open();
const t = await setup(p, { scenes: 2, len: 1 });
const r = await p.evaluate(async (t) => {
  const Q = window.SYNQUENZER, o = {}, wait = bb => new Promise(res => { const f = () => (t2b(nowT()) >= bb ? res() : setTimeout(f, 10)); f(); });
  // eng 3
  Q.setEngine(t, 'mk'); await new Promise(r => setTimeout(r, 400));
  const pm = S.tracks[t].sound.p.mk; o.mkCut0 = pm.t[0].f.cut;
  Q.v6aSetState(t, 1, {p: {'mk.t.0.f.cut': 20, 'mk.t.0.f.res': 90, 'mk.t.0.f.type': 2}, x: 'bar1'});
  o.eff = (Q.v6aEff(t) || {}).p; 
  Q.launchScene(0); if (!R.playing) Q.play(); await wait(1.2);
  Q.v6aProbe(t, ['t.0.f.cut', 't.0.f.res', 't.0.f.type']);
  Q.launchScene(1); await wait(8.3);
  const sr = AU.ctx.sampleRate, z = R.startTime, sp = spb();
  o.mk = Q.v6aProbeData(t).map(x => [(x.f / sr - z) / sp, x.v[0], x.v[1], x.v[2]]);
  Q.stop(); await new Promise(r => setTimeout(r, 200));
  // FM
  Q.setEngine(t, 'fm'); await new Promise(r => setTimeout(r, 300));
  const f6 = S.tracks[t].sound.p.fm6; o.ol0 = f6.ops[1].ol; o.br0 = S.tracks[t].sound.p.fmBright;
  Q.v6aSetState(t, 1, null);
  Q.v6aSetState(t, 1, {p: {fmBright: .8, 'fm6.ops.1.ol': Math.max(0, o.ol0 - 30)}, x: 'bar1'});
  o.engOk = !!Q.v6aState(t, 1) && Q.v6aState(t, 1).eng === 'fm6';
  Q.launchScene(0); if (!R.playing) Q.play(); await wait(1.2);
  Q.v6aProbe(t, ['fmBright']);
  const sent = []; const E = AU.synth[t], post = E.node.port.postMessage.bind(E.node.port); E.node.port.postMessage = m => { if (m && m.v6a) sent.push(m.v6a); post(m); };
  Q.launchScene(1); await wait(8.3);
  o.fm = Q.v6aProbeData(t).map(x => [(x.f / AU.ctx.sampleRate - R.startTime) / spb(), x.v[0]]);
  o.fmMsg = sent.map(m => ({k: m.k, hasFm: !!m.fm, ol: m.fm && m.fm.ops ? m.fm.ops[1].ol : null, t0: (m.t0 - R.startTime) / spb()}));
  E.node.port.postMessage = post; Q.stop();
  o.tickErr = Q.tickErrors();
  return o;
}, t);
const mk = r.mk, m0 = mk.find(x => x[1] !== r.mkCut0), mE = mk.find(x => x[1] === 20);
ok('ENG-1 eng 3: Cutoff-Pfad gleitet ab dem Taktstrich (1 T: Schlag 4 → 8)', m0 && Math.abs(m0[0] - 4) < .02 && mE && Math.abs(mE[0] - 8) < .02, (m0 && m0[0].toFixed(3)) + ' → ' + (mE && mE[0].toFixed(3)));
ok('ENG-2 eng 3: Resonanz erreicht 90, Filtertyp wechselt am Taktstrich auf 2', mk.some(x => x[2] === 90) && mk.filter(x => x[0] > 4.02).every(x => x[3] === 2) && mk.filter(x => x[0] < 3.98).every(x => x[3] !== 2));
const f0 = r.fm.find(x => Math.abs(x[1] - r.br0) > 1e-9), fE = r.fm.find(x => x[1] === .8);
ok('ENG-3 FM: Helligkeit (Makro) gleitet 4 → 8', r.engOk && f0 && Math.abs(f0[0] - 4) < .02 && fE && Math.abs(fE[0] - 8) < .02, (f0 && f0[0].toFixed(3)) + ' → ' + (fE && fE[0].toFixed(3)));
const fm = r.fmMsg.find(x => x.hasFm);
ok('ENG-4 FM: Operator-Pegel als ganzer Satz am Taktstrich (fm im Morph)', fm && fm.ol === Math.max(0, r.ol0 - 30) && Math.abs(fm.t0 - 4) < .02, JSON.stringify(r.fmMsg).slice(0, 200));
ok('ENG-E keine Fehler', !errs.length && !(r.tickErr && r.tickErr.n), errs.join(' | ').slice(0, 300) + JSON.stringify(r.tickErr));
await b.close(); process.exit(done() ? 1 : 0);
