// QA G-MK3: songwriting project with MS 2000 sounds using MK3 features
//  t0 "Split Bass": Split at G3 (55): T1 bass (Säge, CUTOFF 70), T2 lead (Puls) · clips across the split
//  t1 FM pluck (unchanged)
//  t2 "Layer Pad": Schicht 2+2, T1 Säge pad, T2 Dreieck +12 HT, pan L/R, Werckmeister III
//  t3 "Duo Lead": Schicht 3+1, T1 Säge lead (vibrato), T2 Mono Rechteck (Portamento)
//  t4 drums; 4 scenes; "Split Bass" and "Layer Pad" written to the library
export async function setupProject(E) {
  return E(async () => {
    const Q = SYNQUENZER;
    Q.setMetronome(false);
    const N = (t, d, n, v) => ({t, d, n, v: v || .8});
    Q.setClip(0, 1, {len: 1, notes: [N(0, .4, 36), N(.5, .4, 43), N(1, .9, 67), N(2, .4, 41), N(2.5, .4, 48), N(3, .9, 72)]});
    Q.setClip(0, 2, Q.getClip(0, 0)); Q.setClip(0, 3, Q.getClip(0, 1));
    const mel = (base) => ({len: 1, notes: [[0, .45, 0], [.5, .45, 2], [1, .9, 4], [2, .45, 7], [2.5, .45, 5], [3, .9, 4]].map(([t, d, n]) => N(t, d, base + n))});
    Q.setClip(3, 1, mel(72)); Q.setClip(3, 2, mel(74)); Q.setClip(3, 3, mel(71));
    Q.setClip(2, 2, Q.getClip(2, 0)); Q.setClip(2, 3, Q.getClip(2, 1));
    for (const t of [1, 4]) { const a = Q.getClip(t, 0), b = Q.getClip(t, 1); Q.setClip(t, 2, a); Q.setClip(t, 3, b || a); }
    for (const t of [0, 2, 3]) Q.setEngine(t, 'mk');
    const S = (t, o) => { for (const k in o) Q.mkSet(t, k, o[k]); };
    S(0, {mode: 2, split: 55, 't.0.f.cut': 70, 't.0.f.res': 30, 't.0.f.eg': 25, 't.0.e1.d': 50, 't.0.e2.s': 100, 't.0.e2.r': 20,
      't.1.o1.w': 1, 't.1.o1.c1': 30, 't.1.f.cut': 100, 't.1.e2.a': 8, 't.1.e2.r': 40, 't.1.a.lvl': 100, 't.1.vib': 15});
    S(2, {mode: 1, tv: 1, scale: 5, 't.0.e2.a': 60, 't.0.e2.r': 60, 't.0.f.cut': 90, 't.0.a.pan': -40, 't.0.a.lvl': 100,
      't.1.o1.w': 2, 't.1.o2.semi': 12, 't.1.mix.o2': 60, 't.1.e2.a': 70, 't.1.e2.r': 60, 't.1.a.pan': 40, 't.1.a.lvl': 100});
    S(3, {mode: 1, tv: 2, 't.0.f.cut': 100, 't.0.e2.r': 30, 't.0.vib': 20, 't.0.a.lvl': 100,
      't.1.asg': 0, 't.1.o1.w': 1, 't.1.trans': 12, 't.1.porta': 30, 't.1.f.cut': 90, 't.1.a.lvl': 80});
    await Q.saveSound(0, 'Split Bass', 'new'); await Q.saveSound(2, 'Layer Pad', 'new');
    return {engines: [0, 1, 2, 3, 4].map(t => Q.getSound(t).engine), modes: [0, 2, 3].map(t => [Q.mkGet(t).mode, Q.mkGet(t).tv, Q.mkGet(t).split, Q.mkGet(t).scale]), lib: Q.library().filter(s => s.engine === 'mk').map(s => s.name), u: Q.undoInfo().n};
  });
}
