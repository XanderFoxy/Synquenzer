// QA G-MK4: songwriting project with MS 2000 sounds using the MK4 program effects:
//  t0 bass  = Säge, EQ TIEF +6 dB @ 120 Hz, HOCH −4 dB
//  t1 pluck = short amp, DELAY Stereo Sync 1/8 TIEFE 60, MOD-FX Cho/Flg TIEFE 40
//  t2 pad   = slow amp, MOD-FX Ensemble TIEFE 127, DELAY Kreuz Sync 3/16 TIEFE 50, EQ HOCH −6
//  t3 lead  = MOD-FX Phaser TIEFE 90 TEMPO 30, DELAY L/R ZEIT 90 (Sync aus) TIEFE 45
//  t4 drums; 4 scenes; two own programs written (Seite B): "Pluck Echo" (delay) and "Pluck Trocken" (no effects)
export async function setupProject(E) {
  return E(async () => {
    const Q = SYNQUENZER;
    Q.setMetronome && Q.setMetronome(false);
    const mel = (base) => ({len: 1, notes: [[0, .45, 0], [.5, .45, 2], [1, .9, 4], [2, .45, 7], [2.5, .45, 5], [3, .9, 4]].map(([t, d, n]) => ({t, d, n: base + n, v: .8}))});
    Q.setClip(3, 1, mel(72)); Q.setClip(3, 2, mel(74)); Q.setClip(3, 3, mel(71));
    for (const t of [0, 1, 2, 4]) { const a = Q.getClip(t, 0), b = Q.getClip(t, 1); if (a) Q.setClip(t, 2, a); if (b || a) Q.setClip(t, 3, b || a); }
    if (!Q.getClip(0, 1)) Q.setClip(0, 1, Q.getClip(0, 0));
    if (!Q.getClip(2, 0)) Q.setClip(2, 0, Q.getClip(2, 1));
    if (!Q.getClip(1, 0)) Q.setClip(1, 0, mel(67));
    for (const t of [0, 1, 2, 3]) Q.setEngine(t, 'mk');
    const S = (t, o) => { for (const k in o) Q.mkSet(t, k, o[k]); };
    S(0, {'t.0.f.cut': 70, 't.0.f.res': 30, 't.0.e2.s': 100, 't.0.e2.r': 25, 'eq.lf': 120, 'eq.lg': 6, 'eq.hg': -4});
    S(1, {'t.0.e2.a': 0, 't.0.e2.d': 45, 't.0.e2.s': 0, 't.0.e2.r': 30, 't.0.f.cut': 90, 'dly.type': 0, 'dly.sync': 1, 'dly.note': 5, 'dly.dep': 60, 'mfx.type': 0, 'mfx.dep': 40});
    await Q.saveSound(1, 'Pluck Echo', 'new');
    S(2, {'t.0.e2.a': 60, 't.0.e2.r': 60, 't.0.f.cut': 95, 'mfx.type': 1, 'mfx.dep': 127, 'dly.type': 1, 'dly.sync': 1, 'dly.note': 7, 'dly.dep': 50, 'eq.hg': -6});
    S(3, {'t.0.f.cut': 100, 't.0.e2.r': 30, 'mfx.type': 2, 'mfx.dep': 90, 'mfx.spd': 30, 'dly.type': 2, 'dly.sync': 0, 'dly.time': 90, 'dly.dep': 45});
    const s1 = JSON.parse(JSON.stringify(Q.getSound(1)));
    S(1, {'dly.dep': 0, 'mfx.dep': 0}); await Q.saveSound(1, 'Pluck Trocken', 'new');
    S(1, {'dly.dep': 60, 'mfx.dep': 40});
    return {engines: [0, 1, 2, 3, 4].map(t => Q.getSound(t).engine), fx: [0, 1, 2, 3].map(t => { const m = Q.mkGet(t); return [m.mfx, m.dly, m.eq]; }), lib: Q.library().filter(s => s.engine === 'mk').map(s => s.name), clips: [0, 1, 2, 3, 4].map(t => [0, 1, 2, 3].map(s => !!Q.getClip(t, s)))};
  });
}
