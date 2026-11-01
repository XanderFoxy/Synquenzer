// G10g Daten-Regeln: (1) G7 nutzt dieselbe Tonart-Quelle wie G2 (neue Takes), alte Takes rechnen weiter mit g7Key;
// (2) Song-Stimme mit Tonart „Auto“: jede Note bekommt die Tonart der Szene an ihrem Takt; (3) Auto liest bei Weich/Hart neu;
// (4) „Schläge je Takt“ kommt aus der Hilfsfunktion (grid().beatsPerBar). Szenen/Transponieren werden dafür im Test nachgestellt.
import {launch, open, takeIn, edOpen, sleep, ok, done} from './lib.mjs';
const br = await launch(), p = await open(br, 428, 926);
const mel = [64.2, 65.1, 67.2, 69.1, 71.2, 72.1].map(m => ({m, d: 0.32}));
const T = await takeIn(p, mel); await edOpen(p, T.ref);
await p.evaluate(r => SYNQUENZER.g2Quantize(r, {q: true, mode: 'hard', str: 1}), T.ref);
await p.evaluate(r => SYNQUENZER.g10gKey(r, {root: 2, scale: 'dorian'}), T.ref);   // eigene Wahl: D Dorisch
// (1) Transponieren nachstellen: outPitch zeichnet die Tonart auf, mit der G7 rechnet
const R1 = await p.evaluate(id => {
  const keys = [], o = window.outPitch; window.outPitch = (st, key, q, t) => { keys.push(key.root + '/' + key.scale); return q + 2; };
  try { const a = g7SegOf(id), P = S.takes[id].pitch, sh = g7Shift(id, a, P), clipKey = g7Key(a); return {keys: [...new Set(keys)], sh, clipKey: clipKey.root + '/' + clipKey.scale}; } finally { window.outPitch = o; }
}, T.id);
ok(R1.keys.length === 1 && R1.keys[0] === '2/dorian', `G7 rechnet mit der G2-Tonart (D Dorisch): ${R1.keys.join(',')} (Clip-Tonart g7Key wäre ${R1.clipKey})`);
ok(Array.isArray(R1.sh) && R1.sh.every(x => x === 2), 'G7 verschiebt jede Note (+2 im Test)');
// alter Take (ohne v/src): G7 bleibt bei g7Key
const R2 = await p.evaluate(id => {
  const P = JSON.parse(JSON.stringify(S.takes[id].pitch)); delete P.v; delete P.rt; P.key = {root: 2, scale: 'dorian'};
  const keys = [], o = window.outPitch; window.outPitch = (st, key, q) => { keys.push(key.root + '/' + key.scale); return q; };
  try { g7Shift(id, g7SegOf(id), P); const k = g7Key(g7SegOf(id)); return {keys: [...new Set(keys)], g7: k.root + '/' + k.scale}; } finally { window.outPitch = o; }
}, T.id);
ok(R2.keys.length === 1 && R2.keys[0] === R2.g7, `alter Take: G7 rechnet weiter mit g7Key (${R2.keys.join(',')})`);
// (2) Song-Stimme, Tonart Auto: Szene 1 bis Takt 2, Szene 2 ab Takt 3 (nachgestellt), Stück beginnt in Takt 2
const R3 = await p.evaluate(id => {
  const sv = {seg: window.g7SegOf, sc: window.g2SongScene, sk: window.sceneKeyOf}, v = {id: 'vx', take: id, bar: 2, len: 2, in: 0, out: 3.2, at: 0};
  const song0 = S.song; if (!S.song) S.song = {}; S.song.vox = [v];
  window.g7SegOf = x => x === id ? v : sv.seg(x);
  window.g2SongScene = bar => bar <= 2 ? 1 : 2;
  window.sceneKeyOf = si => si === 1 ? {root: 0, scale: 'ionian'} : si === 2 ? {root: 9, scale: 'aeolian'} : null;
  try {
    const P = S.takes[id].pitch; P.key = {root: 0, scale: 'ionian', src: 'auto'};
    const ks = g10gKeys(id, P), bpb = g10gBpb();
    return {ks: ks.map(k => k.root + '/' + k.scale), t0: P.notes.map(n => n.t0), bpb, plan: g10gPlan(id, P, null).notes.map(n => n.to)};
  } finally { Object.assign(window, {g7SegOf: sv.seg, g2SongScene: sv.sc, sceneKeyOf: sv.sk}); delete S.song.vox; if (!song0) S.song = song0; }
}, T.id);
const want = R3.t0.map(t => (t < 2 ? '0/ionian' : '9/aeolian'));
ok(JSON.stringify(R3.ks) === JSON.stringify(want), `Song-Stimme Auto: Tonart je Note nach Takt ${R3.ks.join(' ')} (Takt = ${R3.bpb} Schläge aus grid())`);
ok(R3.plan.length === 6, 'Plan je Note mit der Tonart ihres Takts: ' + R3.plan.join(' '));
// (3) Auto liest bei Weich/Hart neu: Szene 2 bekommt eine andere Tonart → Hart → key folgt
await p.evaluate(r => SYNQUENZER.g10gKey(r, {src: 'auto'}), T.ref);
const R4 = await p.evaluate(([id, ref]) => { const o = window.sceneKeyOf; window.sceneKeyOf = si => (si === 1 ? {root: 7, scale: 'mixolydian'} : o(si));
  return SYNQUENZER.g2Quantize(ref, {q: true, mode: 'soft', str: 1}).then(() => { const k = S.takes[id].pitch.key, ks = g10gKeys(id, S.takes[id].pitch); window.sceneKeyOf = o; return {k, ks: ks && ks[0]}; }); }, [T.id, T.ref]);
ok(R4.k.root === 7 && R4.k.scale === 'mixolydian' && R4.k.src === 'auto', `Auto + Weich: Tonart neu gelesen → ${JSON.stringify(R4.k)}`);
ok(!p.errs.length, 'Konsole sauber ' + JSON.stringify(p.errs.slice(0, 2)));
await br.close(); done();
