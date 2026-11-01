// Video (VV1–VV4) und GarageBand-Instrumental berücksichtigen Locks und Reihen: der Offline-Render (vvRenderAudio, derselbe Planer)
// schickt dieselben Note-an mit Paaren bzw. Reihen-Ereignisse und klingt danach; VV3 zeichnet den Wert der klingenden Note.
// Messung je Note (Zeit aus dem Ereignis-Mitschnitt): Helligkeit = Energie der 1. Differenz / Energie (der Render selbst ist
// je Lauf um einige 100 Samples verschoben, darum kein Sample-Vergleich zwischen zwei Läufen).
import {open, ok, APP} from './lib.mjs';
const {b, p, errs} = await open(APP);
const r = await p.evaluate(async () => {
  const t = S.tracks.findIndex(x => x.kind === 'synth'), lanes = [];
  for (let i = 0; i < NT(); i++) lanes.push(i === t ? [{bar: 0, slot: 0}] : []);
  SYNQUENZER.setSong({bars: 2, lanes, carrier: [], mel: {}, marks: []});
  const sound = SQStore.normalizeSound(JSON.parse(JSON.stringify(FACTORY_BY_ID.get('f-init-analog')))); Object.assign(sound.p, {cutoff: 400, res: .3, fenv: 0});
  S.tracks[t].sound = sound; applySound(t);
  const notes = [0, 1, 2, 3, 4, 5, 6, 7].map(k => ({t: k * .5, d: .4, n: 57 + (k % 3) * 2, v: .8}));
  const T0 = SynthHost.track; let log = [];
  SynthHost.track = function (...a) { const E = T0.apply(this, a); const on = E.on, ln = E.lane; E.on = (...x) => { log.push(['on', x[3], x[1], !!(x[6] && x[6].length)]); return on(...x); }; E.lane = (...x) => { log.push(['ln', x[0], x[4], x[3]]); return ln(...x); }; return E; };
  const ren = async () => { log = []; const x = await vvRenderAudio({range: {a: 0, b: 2}}); const sr = x.sr || AU.ctx.sampleRate, ch = x.ch[0];
    const br = log.filter(e => e[0] === 'on').map(e => { const i0 = Math.round((e[1] + .03) * sr), i1 = Math.round((e[1] + .2) * sr); let a = 0, d = 0; for (let i = i0 + 1; i < i1; i++) { a += ch[i] * ch[i]; const q = ch[i] - ch[i - 1]; d += q * q; } return +(d / Math.max(a, 1e-12) * 1e3).toFixed(3); });
    return {br, ons: log.filter(e => e[0] === 'on').map(e => e[3]), lanes: log.filter(e => e[0] === 'ln').length}; };
  SYNQUENZER.setClip(t, 0, {len: 1, notes}); const plain = await ren();
  SYNQUENZER.setClip(t, 0, {len: 1, notes: notes.map((n, k) => (k === 2 ? Object.assign({}, n, {lk: {v: {cutoff: .9}}}) : n))}); const lock = await ren(), lock2 = await ren();
  SYNQUENZER.setClip(t, 0, {len: 1, notes, ln: [{p: 'cutoff', len: 8, g: '1/8', st: [{i: 1, v: .9}]}]}); const lane = await ren();
  SynthHost.track = T0;
  const st = vv3VaState(t, 1, {nt: {[t]: Object.assign([{a: .5, e: {out: 57, vel: .8, dur: 1, lk: {cutoff: .9}}}], {mx: 0})}});
  return {plain, lock, lock2, lane, vvCut: st && st.p.cutoff, want: SYNQUENZER.lkFromN('cutoff', .9), base: sound.p.cutoff, ggb: typeof ggbRender === 'function' && /vvRenderAudio\(/.test(ggbRender.toString())};
}).catch(e => ({err: String(e)}));
if (r.err) console.log(r.err);
const P = r.plain.br, L = r.lock.br, L2 = r.lock2.br, N = r.lane.br, k = [2, 10];
const near = (a, b2) => Math.abs(a / b2 - 1) < .1;
ok(r.lock.ons.filter(x => x).length === 2 && k.every(j => L[j] > 3 * P[j]) && P.every((x, j) => k.includes(j) || near(L[j], x)) && L.every((x, j) => near(x, L2[j])),
  `Video-Ton mit Lock auf Note 3: Note-an mit Paar ${r.lock.ons.filter(x => x).length}× (2 Durchläufe); Helligkeit Note 3 ${L[2]} gegen ohne ${P[2]} (> 3×), übrige Noten ± 10 % gleich, zweiter Render gleich`);
ok(r.lane.lanes > 0 && N[1] > 3 * P[1] && N[9] > 3 * P[9] && near(N[0], P[0]), `Video-Ton mit freier Reihe (Schritt 2 auf Cutoff): ${r.lane.lanes} Reihen-Ereignisse; Note 2 Helligkeit ${N[1]} gegen ${P[1]}, Note 1 unverändert`);
ok(r.vvCut != null && Math.abs(r.vvCut - r.want) < 1e-6 && r.base === 400, `VV3: Regler-Bild der klingenden Note zeigt den Lock (${r.vvCut && r.vvCut.toFixed(0)} Hz), Grundwert ${r.base} Hz bleibt`);
ok(r.ggb, 'GarageBand-Instrumental (ggbRender) rendert über vvRenderAudio – derselbe Planer, Locks und Reihen inklusive');
ok(!errs.length, 'Konsole ohne Fehler: ' + errs.slice(0, 2).join(' | '));
await b.close();
