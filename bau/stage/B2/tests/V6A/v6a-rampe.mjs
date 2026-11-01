// V6A Rampen: Cutoff-Fahrt Szene 1 → 2 („kurz“: 1 Schlag vor dem Taktstrich bis zum Taktstrich, S-Kurve), Start/Ende/Dauer je Block
import { open, setup, ok, done } from './v6a-lib.mjs';
const { b, p, errs } = await open();
const t = await setup(p);
const r = await p.evaluate(async (t) => {
  const Q = window.SYNQUENZER, out = {};
  setP(t, 'cutoff', 2400); setP(t, 'res', .1); const base = S.tracks[t].sound.p.cutoff;
  Q.v6aSetState(t, 1, {p: {cutoff: 400, res: .5}, x: 'flow'});
  out.base = base; out.st = Q.v6aState(t, 1);
  Q.launchScene(0); Q.play();
  await new Promise(r => setTimeout(r, 300));
  Q.v6aProbe(t, ['cutoff', 'res']);
  // at beat 1.x of bar 1: tap scene 2 -> next bar line = beat 4
  while (t2b(nowT()) < 1.2) await new Promise(r => setTimeout(r, 10));
  Q.launchScene(1); out.tapBeat = t2b(nowT());
  while (t2b(nowT()) < 4.6) await new Promise(r => setTimeout(r, 20));
  out.pr = Q.v6aProbeData(t); out.sr = AU.ctx.sampleRate; out.st0 = R.startTime; out.spb = spb();
  out.info = Q.v6aInfo(); out.slot = R.slot[t];
  Q.stop(); return out;
}, t);
const sr = r.sr, f3 = Math.round((r.st0 + 3 * r.spb) * sr), f4 = Math.round((r.st0 + 4 * r.spb) * sr);
const pr = r.pr.filter(x => x.n > 0 || true);
const first = pr.find(x => Math.abs(x.v[0] - r.base) > 1e-6), lastMove = [...pr].reverse().find(x => Math.abs(x.v[0] - 400) > 1e-6);
ok('V6A-R1 Zustand gespeichert', r.st && r.st.p.cutoff === 400 && r.st.x === 'flow', JSON.stringify(r.st));
ok('V6A-R2 Fahrt beginnt 1 Schlag vor dem Taktstrich (±1 Block)', first && Math.abs(first.f - f3) <= 128, first && `erster bewegter Block ${first.f}, Soll ${f3}`);
const end = pr.find(x => x.v[0] === 400);
ok('V6A-R3 Ziel genau am Taktstrich erreicht (±1 Block)', end && Math.abs(end.f - f4) <= 128 && end.v[0] === 400, end && `Ziel bei ${end.f}, Soll ${f4}`);
const mid = pr.filter(x => x.f > f3 && x.f < f4).map(x => x.v[0]);
const up = 400 > r.base; let mono = true; for (let k = 1; k < mid.length; k++) if (up ? mid[k] < mid[k - 1] - 1e-9 : mid[k] > mid[k - 1] + 1e-9) mono = false;
ok('V6A-R4 monoton mit ≥ 10 Zwischenwerten', mono && mid.length >= 10, `${mid.length} Werte`);
// S-curve in log space: at the middle the value is the geometric mean
const fm = Math.round((f3 + f4) / 2), near = pr.reduce((a, x) => (Math.abs(x.f - fm) < Math.abs(a.f - fm) ? x : a), pr[0]);
const xs = (near.f - f3) / (f4 - f3), s = xs * xs * (3 - 2 * xs), want = r.base * Math.pow(400 / r.base, s);
ok('V6A-R5 S-Kurve im Reglerraum (Frequenz logarithmisch)', Math.abs(near.v[0] / want - 1) < 1e-6, `${near.v[0].toFixed(3)} vs ${want.toFixed(3)}`);
ok('V6A-R6 linearer Schlüssel res erreicht 0,5', pr.some(x => x.v[1] === .5));
ok('V6A-R7 Spur spielt Szene 2', r.slot === 1);
ok('V6A-R8 keine Fehler', !errs.length, errs.join(' | ').slice(0, 300));
await b.close(); process.exit(done() ? 1 : 0);
