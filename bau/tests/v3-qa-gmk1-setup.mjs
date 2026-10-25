// QA G-MK1: song-writing project with 3 MS 2000 tracks (bass, pad, lead), FM pluck, drums; 4 scenes; 2 own MS 2000 programs
export async function setupProject(E) {
  return E(async () => {
    const Q = SYNQUENZER;
    Q.setMetronome(false);
    // lead melody clips (track 3) and copies to scenes 3/4
    const mel = (base) => ({len: 1, notes: [[0, .45, 0], [.5, .45, 2], [1, .9, 4], [2, .45, 7], [2.5, .45, 5], [3, .9, 4]].map(([t, d, n]) => ({t, d, n: base + n, v: .8}))});
    Q.setClip(3, 1, mel(72)); Q.setClip(3, 2, mel(74)); Q.setClip(3, 3, mel(71));
    for (const t of [0, 1, 2, 4]) { const a = Q.getClip(t, 0), b = Q.getClip(t, 1); if (a) Q.setClip(t, 2, a); if (b || a) Q.setClip(t, 3, b || a); }
    if (!Q.getClip(0, 1)) Q.setClip(0, 1, Q.getClip(0, 0));
    if (!Q.getClip(2, 0)) Q.setClip(2, 0, Q.getClip(2, 1));
    // engines
    for (const t of [0, 2, 3]) Q.setEngine(t, 'mk');
    const S = (t, o) => { for (const k in o) Q.mkSet(t, k, o[k]); };
    S(0, {'t.0.o2.w': 1, 't.0.o2.semi': -12, 't.0.mix.o2': 80, 't.0.f.cut': 60, 't.0.f.res': 50, 't.0.f.eg': 40, 't.0.e1.d': 50, 't.0.e2.s': 100, 't.0.e2.r': 20});
    S(2, {'t.0.o1.w': 1, 't.0.o1.c1': 30, 't.0.o1.c2': 40, 't.0.l1.f': 40, 't.0.e2.a': 70, 't.0.e2.r': 70, 't.0.f.cut': 80, 't.0.f.res': 20, 't.0.mix.o1': 100});
    S(3, {'t.0.asg': 0, 't.0.porta': 40, 't.0.vib': 30, 't.0.o2.mod': 2, 't.0.o2.semi': 7, 't.0.mix.o2': 100, 't.0.f.cut': 90, 't.0.f.res': 40, 't.0.a.dist': 1});
    await Q.saveSound(0, 'Bass A', 'new'); await Q.saveSound(3, 'Lead Sync', 'new');
    return {engines: [0, 1, 2, 3, 5].map(t => Q.getSound(t).engine), lib: Q.library().filter(s => s.engine === 'mk').map(s => s.name), clips: Q.project().tracks ? 0 : (Q.project().project.tracks.map(t => t.clips.map(c => !!c)))};
  });
}
