// V6A in der Matrix: Teil mit Gleiten „2 T“ (Fahrt ab dem Taktstrich über 8 Schläge), KZ6 (im ◆-Editor folgt der gedrehte Regler der
// Hand, die anderen fahren weiter), KZ5 (■ und wieder ▶: der Zustand gilt sofort), ECO-Klang (nativ): neue Töne haben den Zustand,
// die Spur-Lautstärke fährt als AudioParam-Stufen ohne Fehler
import { open, setup, ok, done } from './v6a-lib.mjs';
const { b, p, errs } = await open();
const t = await setup(p, { scenes: 2, len: 1 });
const r = await p.evaluate(async (t) => {
  const Q = window.SYNQUENZER, o = {}, wait = bb => new Promise(res => { const f = () => (t2b(nowT()) >= bb ? res() : setTimeout(f, 10)); f(); });
  setP(t, 'cutoff', 2400); setP(t, 'res', .1);
  Q.v6aSetState(t, 1, {p: {cutoff: 400, res: .5}});
  // part P1 = scene 2 on this track, glide 2 T
  Q.launchScene(1); await new Promise(r => setTimeout(r, 300)); Q.partFromNow(0); Q.stop(); await new Promise(r => setTimeout(r, 200));
  Q.v6aPartGlide(0, {x: 'bar2'});
  Q.launchScene(0); if (!R.playing) Q.play(); await wait(1.2);
  Q.v6aProbe(t, ['cutoff', 'res']);
  Q.launchPart(0); o.tap = t2b(nowT());
  await wait(4.3);
  // KZ6: ◆ editor of the clip of scene 2 while it glides: turn res by hand – res follows the hand, cutoff glides on
  Q.selectTrack(t); Q.selectSlot(t, 1); Q.openEditor(); Q.v6aEdit(t); o.edSlot = Q.v6aEditing() && Q.v6aEditing().s;
  setP(t, 'res', .2);
  await wait(12.6);
  const pr = Q.v6aProbeData(t), st0 = R.startTime, sp = spb(), sr = AU.ctx.sampleRate;
  o.log = pr.map(x => [(x.f / sr - st0) / sp, x.v[0], x.v[1]]);
  Q.v6aDone();
  o.after = Q.v6aState(t, 1);
  // KZ5: stop and play again – the state of the playing clip at once
  Q.stop(); await new Promise(r => setTimeout(r, 200));
  Q.v6aProbe(t, ['cutoff']); Q.launchScene(1); if (!R.playing) Q.play(); await new Promise(r => setTimeout(r, 400));
  const k = Q.v6aProbeData(t); o.restart = k.length ? k[0].v[0] : null; o.restartAll = k.every(x => x.v[0] === k[0].v[0]);
  Q.stop();
  // ECO (native): forceNative, the next note of scene 2 has the state's cutoff, fx.vol glides as steps (no exception)
  forceNative(true); await new Promise(r => setTimeout(r, 100));
  Q.v6aSetState(t, 1, {p: {cutoff: 400}, fx: {vol: .3}}); Q.v6aSetGlide(t, 1, {x: 'bar1'});
  Q.launchScene(0); if (!R.playing) Q.play(); await wait(1.5); Q.launchScene(1); await wait(5);
  const v = VOICES.filter(x => x.track === t && !x.dead && !x.wk).pop(); o.nativeCut = v && v.P ? v.P.cutoff : null;
  o.run = Q.v6aInfo().run[t]; o.tickErr = Q.tickErrors ? Q.tickErrors() : null;
  Q.stop(); forceNative(false);
  return o;
}, t);
const L = r.log;
const first = L.find(x => x[1] < 2399.99), done1 = L.find(x => x[1] === 400);
ok('MX-1 Teil mit „2 T“: Fahrt beginnt am Taktstrich (Schlag 4, ±2 Blöcke)', first && Math.abs(first[0] - 4) < .012, first && first[0].toFixed(4));
ok('MX-2 Teil mit „2 T“: Ziel am Schlag 12 (±2 Blöcke)', done1 && Math.abs(done1[0] - 12) < .012, done1 && done1[0].toFixed(4));
ok('MX-3 KZ6 ◆-Editor öffnet den Clip von Szene 2', r.edSlot === 1);
const handAt = L.find(x => x[0] > 4.4 && Math.abs(x[2] - .2) < 1e-9), resAfter = L.filter(x => x[0] > (handAt ? handAt[0] : 99)).every(x => Math.abs(x[2] - .2) < 1e-9);
const cutOn = L.filter(x => x[0] > 5 && x[0] < 11.9).map(x => x[1]); let mono = cutOn.length > 50; for (let k = 1; k < cutOn.length; k++) if (cutOn[k] > cutOn[k - 1] + 1e-9) mono = false;
ok('MX-4 KZ6: Resonanz folgt der Hand (0,2) und bleibt dort', !!handAt && resAfter, handAt && handAt[0].toFixed(3));
ok('MX-5 KZ6: Cutoff fährt weiter bis zum Ziel', mono && done1, cutOn.length + ' Werte');
ok('MX-6 ◆ nach dem Editor: Hand-Wert gemerkt (res 0,2), Cutoff-Ziel bleibt', r.after && r.after.p.res === .2 && r.after.p.cutoff === 400, JSON.stringify(r.after));
ok('MX-7 KZ5: ■ und ▶ mit Szene 2 – Zustand sofort, keine Fahrt', r.restart === 400 && r.restartAll, String(r.restart));
ok('MX-8 ECO-Klang: neue Note hat den Cutoff des Zustands', r.nativeCut === 400, String(r.nativeCut));
ok('MX-9 ECO-Klang: Spur-Lautstärke fährt (AudioParam-Stufen), keine Fehler im Takt', r.run && Math.abs(r.run.b.vol - .3) < 1e-9 && (!r.tickErr || !r.tickErr.n), JSON.stringify(r.run) + ' ' + JSON.stringify(r.tickErr));
ok('MX-E keine Fehler', !errs.length, errs.join(' | ').slice(0, 300));
await b.close(); process.exit(done() ? 1 : 0);
