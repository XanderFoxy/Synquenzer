// G6+d gezielt: G6P-33 (v1 → v2, ↶ deep-equal), G6P-35 (selbst gesungene Stimme bleibt beim Stilwechsel), G6P-34 (keine Fernwirkung,
// [Auf alle Chor-Stellen] ein Undo), Grenzen 6 Stimmen / 8 Spuren (graue Spur übernehmen), [Background] links/rechts + ganze Spur.
import { chromium } from 'playwright';
import path from 'path'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const file = process.argv[2] || path.join(here, '..', 'index.html');
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 390, height: 844}});
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + file); await p.waitForTimeout(1200);
const out = await p.evaluate(async () => {
  const D = window.SYNQUENZER, out = {}, ok = (k, v, info) => { out[k] = v ? 'ok' : 'FEHLER ' + JSON.stringify(info === undefined ? null : info).slice(0, 500); };
  const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b), clone = x => JSON.parse(JSON.stringify(x));
  const sing = (mids, f0) => { const sr = 48000, seg = 0.4, pcm = []; for (const m of mids) { const f = 440 * Math.pow(2, (m - 69 + (f0 || 0)) / 12), n = Math.round(seg * sr);
    for (let i = 0; i < n; i++) { const t = i / sr, e = Math.min(1, i / 480, (n - i) / 480) * (i < n - 2400 ? 1 : 0); let y = 0; for (let h = 1; h <= 6; h++) y += Math.sin(2 * Math.PI * f * h * t) / h; pcm.push(Math.round(9000 * e * y)); } } return {pcm, sr}; };
  const mel = [60, 62, 64, 65, 67, 69, 71, 72];
  const i0 = await D.tkInject(Object.assign(sing(mel), {scene: 0, len: 2})); const st = i0.track, r0 = {t: st, s: 0}, r1 = {t: st, s: 1};
  await D.tkInject(Object.assign(sing(mel.slice().reverse()), {scene: 1, len: 2}));
  // v1-Chor (4.25) mit selbst gesungener Stimme 1 an Stelle 0
  await D.g6Make(r0, 'terz', 'up', '80'); await D.g6Wait(r0);
  D.g6Arm(r0, 0); await D.tkInject(Object.assign(sing(mel, 4), {scene: 0, len: 2}));
  const v1 = D.g6Info(r0).chor, fx1 = clone(D.getBusFx());
  ok('Vorbereitung v1 + selbst gesungen', v1 && !v1.v && v1.voices[0].take, v1);
  const nU = D.undoInfo().n;
  // G6P-33: Stil auf v1 → v2, ein Undo; ↶ ⇒ v1 deep-equal, Spuren wie vorher
  await D.g6pStyle(r0, '80'); const c80 = D.g6Info(r0).chor;
  const kept = c80.voices.find(v => v.take);
  ok('G6P-33 v1 → v2', c80.v === 2 && c80.style === '80' && D.undoInfo().n === nU + 1 && kept && kept.rule === 'free' && eq(kept.take, v1.voices[0].take), {n: D.undoInfo().n, nU, kept});
  D.undo();
  ok('G6P-33 ↶ = v1 deep-equal', eq(D.g6Info(r0).chor, v1) && D.g6pLanes() === null && eq(D.getBusFx(), fx1), D.g6pLanes());
  D.redo(); const red = D.g6Info(r0).chor;
  ok('G6P-33 ↷ = v2', eq(red, c80));
  // G6P-35: Stilwechsel → die Take-Stimme bleibt deep-equal (Noten, take, Pegel, Pan, Doppel)
  await D.g6pStyle(r0, 'gospel'); const cg = D.g6Info(r0).chor, kg = cg.voices.find(v => v.take);
  const pick = v => v && {lane: v.lane, rule: v.rule, n: v.n, db: v.db, pan: v.pan, w: v.w, dbl: v.dbl, take: v.take, dblOff: v.dblOff, name: v.name};
  ok('G6P-35 Take-Stimme bleibt', eq(pick(kg), pick(kept)) && kg.rev === 0.5 && cg.voices.filter(v => !v.take).length === 3, {kg, kept});
  // G6P-34: zweite Stelle mit anderem Stil ⇒ erste unverändert; [Auf alle Chor-Stellen] ⇒ grp gleich, ein Undo
  const first = D.g6Info(r0).chor; await D.g6pStyle(r1, 'ballade');
  ok('G6P-34 keine Fernwirkung', eq(D.g6Info(r0).chor, first) && D.g6Info(r1).chor.style === 'ballade');
  const c1b = D.g6Info(r1).chor, nA = D.undoInfo().n; D.g6pGrpAll(r0);
  ok('G6P-34 Auf alle Stellen', eq(D.g6Info(r1).chor.grp, first.grp) && D.undoInfo().n === nA + 1 && eq(D.g6Info(r0).chor, first));
  D.undo(); ok('G6P-34 ↶', eq(D.g6Info(r1).chor, c1b));
  // Grenze 6 Stimmen: Stelle 0 mit 4 Take-Stimmen + Gospel (3) ⇒ Toast, nichts ändert sich
  const c0 = S.tracks[st].clips[0].audio.chor, base = clone(c0), tk = c0.voices.find(v => v.take);
  for (let k = 0; k < 3; k++) c0.voices.push(Object.assign(clone(tk), {lane: 'x' + k}));
  const big = clone(c0), lb = D.g6pLanes(), okL = await D.g6pStyle(r0, 'barber');
  ok('Grenze 6 Stimmen', okL === false && eq(S.tracks[st].clips[0].audio.chor, big) && eq(D.g6pLanes(), lb));
  S.tracks[st].clips[0].audio.chor = base;
  // Grenze 8 Spuren: alle 8 an einer anderen Stelle benutzt ⇒ Toast, Daten gleich; eine graue ⇒ übernommen und umbenannt
  const L = S.tracks[st].chor.lanes; while (L.length < 8) L.push({id: 'c' + (L.length + 1), role: 'st+' + ((L.length % 3) + 3), name: 'Platz ' + L.length});
  for (const l of L) l.role = l.role === 'free' ? 'free' : 'st+6';   // keine Rolle von „Rock-Shout“ vorhanden
  const c1 = S.tracks[st].clips[1].audio.chor; c1.voices = L.map((l, k) => Object.assign(clone(c1.voices[0]), {lane: l.id})).slice(0, 8);
  const all0 = clone(S.tracks[st].chor), s0 = clone(S.tracks[st].clips[0].audio.chor);
  const ok8 = await D.g6pStyle(r0, 'rock');
  ok('Grenze 8 Spuren', ok8 === false && eq(S.tracks[st].chor, all0) && eq(S.tracks[st].clips[0].audio.chor, s0));
  c1.voices = c1.voices.filter(v => v.lane !== 'c7' && v.lane !== 'c8');   // c7, c8 grau (an Stelle 0 nur die Take-Stimme)
  const usedAt0 = new Set(s0.voices.filter(v => v.take).map(v => v.lane)); const grey = L.filter(l => !usedAt0.has(l.id) && !c1.voices.some(v => v.lane === l.id)).map(l => l.id);
  const okG = await D.g6pStyle(r0, 'rock'); const lanesG = D.g6pLanes().lanes, cr = D.g6Info(r0).chor;
  ok('Graue Spur übernommen', okG && lanesG.length === 8 && cr.voices.filter(v => !v.take).every(v => grey.includes(v.lane)) && lanesG.some(l => l.name === 'Chor Unisono') && lanesG.some(l => l.name === 'Chor Oktave unten'), {grey, lanesG, lanes: cr.voices.map(v => v.lane)});
  // [Background]: zwei freie Gegenstimmen ⇒ links / rechts, Doppel aus der Tabelle; ganze Spur ⇒ alle Stellen dieser Spur, ein Undo
  S.tracks[st].chor.lanes = [{id: 'c1', role: 'free', name: 'Gegenstimme 1'}, {id: 'c2', role: 'free', name: 'Gegenstimme 2'}];
  const tv = clone(tk); delete tv.dblOff;
  const mk = (lane) => Object.assign(clone(tv), {lane, rule: 'free', db: -3, pan: 0, w: 0, dbl: [{ms: 0, ct: 0, p: 0}], dblOff: true});
  S.tracks[st].clips[0].audio.chor = {v: 2, style: null, grp: clone(first.grp), voices: [mk('c1'), mk('c2')], rec: 'unisono', dir: 'up', mix: '80'};
  S.tracks[st].clips[1].audio.chor = {v: 2, style: null, voices: [mk('c1')], rec: 'unisono', dir: 'up', mix: '80'};
  const T = D.g6pStyles().bg, nB = D.undoInfo().n;
  D.g6pBackground(r0, 'c1'); D.g6pBackground(r0, 'c2');
  const vb = D.g6Info(r0).chor.voices;
  ok('Background links/rechts', vb[0].pan === -0.6 && vb[1].pan === 0.6 && eq(vb[0].dbl, T.voice.dbl) && vb[0].w === 0.15 && vb[0].db === 0 && !vb[0].dblOff && eq(D.g6Info(r0).chor.grp, first.grp), vb);
  const c1before = clone(D.g6Info(r1).chor); const nW = D.undoInfo().n; D.g6pBackground(r0, 'c1', true);
  const w1 = D.g6Info(r1).chor;
  ok('Background ganze Spur', D.undoInfo().n === nW + 1 && w1.voices[0].pan === -0.6 && eq(w1.grp, T.grp), w1);
  D.undo(); ok('Background ↶', eq(D.g6Info(r1).chor, c1before));
  ok('Undo-Zähler', D.undoInfo().n === nB + 2);
  return out;
});
console.log(JSON.stringify(out, null, 1)); console.log('pageerrors', JSON.stringify(errs));
const bad = Object.entries(out).filter(([k, v]) => String(v).startsWith('FEHLER'));
console.log(bad.length ? 'FEHLER: ' + bad.length : 'ALLE OK'); await b.close(); process.exit(bad.length || errs.length ? 1 : 0);
