// QA G-MK2a: songwriting project with MS 2000 sounds using MK2 features:
//  t0 bass   = Speicherwelle 12 (Bass 5) + PATCH LFO 1 → CUTOFF
//  t1 pluck  = Rauschen (CUTOFF 30 / RESO 110, pitched noise) + PATCH EG 1 → CUTOFF
//  t2 pad    = Speicherwelle 63 (Stimme 3, octave wave) + PATCH LFO 2 → PAN
//  t3 lead   = Sinus× (X-MOD 40, OSZ 2 Dreieck +12) + PATCH MOD-RAD → TONHÖHE
//  t4 drums; 4 scenes; two own programs written (Seite B)
export async function setupProject(E) {
  return E(async () => {
    const Q = SYNQUENZER;
    Q.setMetronome(false);
    const mel = (base) => ({len: 1, notes: [[0, .45, 0], [.5, .45, 2], [1, .9, 4], [2, .45, 7], [2.5, .45, 5], [3, .9, 4]].map(([t, d, n]) => ({t, d, n: base + n, v: .8}))});
    Q.setClip(3, 1, mel(72)); Q.setClip(3, 2, mel(74)); Q.setClip(3, 3, mel(71));
    for (const t of [0, 1, 2, 4]) { const a = Q.getClip(t, 0), b = Q.getClip(t, 1); if (a) Q.setClip(t, 2, a); if (b || a) Q.setClip(t, 3, b || a); }
    if (!Q.getClip(0, 1)) Q.setClip(0, 1, Q.getClip(0, 0));
    if (!Q.getClip(2, 0)) Q.setClip(2, 0, Q.getClip(2, 1));
    for (const t of [0, 1, 2, 3]) Q.setEngine(t, 'mk');
    const S = (t, o) => { for (const k in o) Q.mkSet(t, k, o[k]); };
    S(0, {'t.0.o1.w': 5, 't.0.o1.c2': 22, 't.0.f.cut': 75, 't.0.f.res': 30, 't.0.f.eg': 30, 't.0.e1.d': 50, 't.0.e2.s': 100, 't.0.e2.r': 30, 't.0.p.1.i': 12});
    S(1, {'t.0.o1.w': 6, 't.0.o1.c1': 30, 't.0.o1.c2': 110, 't.0.e2.d': 50, 't.0.e2.s': 0, 't.0.e2.r': 30, 't.0.p.0.s': 0, 't.0.p.0.d': 4, 't.0.p.0.i': 20, 't.0.a.lvl': 110});
    S(2, {'t.0.o1.w': 5, 't.0.o1.c2': 124, 't.0.e2.a': 60, 't.0.e2.r': 60, 't.0.f.cut': 95, 't.0.p.2.s': 3, 't.0.p.2.d': 6, 't.0.p.2.i': 45, 't.0.l2.f': 50});
    S(3, {'t.0.o1.w': 3, 't.0.o1.c1': 40, 't.0.o2.w': 2, 't.0.o2.semi': 12, 't.0.f.cut': 100, 't.0.e2.r': 30, 't.0.vib': 20, 't.0.p.3.s': 7, 't.0.p.3.d': 0, 't.0.p.3.i': 10});
    await Q.saveSound(0, 'Bass Welle', 'new'); await Q.saveSound(2, 'Pad Stimme', 'new');
    return {engines: [0, 1, 2, 3, 4].map(t => Q.getSound(t).engine), waves: [0, 1, 2, 3].map(t => Q.mkGet(t).t[0].o1), lib: Q.library().filter(s => s.engine === 'mk').map(s => s.name)};
  });
}
