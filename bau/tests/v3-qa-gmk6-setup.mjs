// QA G-MK6: songwriting project with MS 2000 sounds using the mod sequencer (MK6):
//  t0 bass  = MS 2000, SEQ 1 → CUTOFF Glatt (KEY SYNC Stimme)
//  t1 pluck = FM (unchanged)
//  t2 pad   = MS 2000 trance gate: SEQ 1 → AMP PEGEL Stufe (0/−63), SEQ 2 → CUTOFF Glatt ramp, SEQ 3 → PAN Glatt; KEY SYNC aus (song grid)
//  t3 lead  = MS 2000, SEQ 1 → TONHÖHE Stufe (0/12/7), SEQ 2 → OSZ 1 STEUER 1 Glatt; KEY SYNC Timbre
//  t4 drums; scenes 1–4 filled
export async function setupProject(E) {
  return E(async () => {
    const Q = SYNQUENZER;
    Q.setMetronome && Q.setMetronome(false);
    const mel = (base) => ({len: 1, notes: [[0, .45, 0], [.5, .45, 2], [1, .9, 4], [2, .45, 7], [2.5, .45, 5], [3, .9, 4]].map(([t, d, n]) => ({t, d, n: base + n, v: .8}))});
    Q.setClip(3, 1, mel(72)); Q.setClip(3, 2, mel(74)); Q.setClip(3, 3, mel(71));
    for (const t of [0, 1, 2, 4]) { const a = Q.getClip(t, 0), b = Q.getClip(t, 1); if (a) Q.setClip(t, 2, a); if (b || a) Q.setClip(t, 3, b || a); }
    if (!Q.getClip(0, 1)) Q.setClip(0, 1, Q.getClip(0, 0));
    for (const t of [0, 2, 3]) Q.setEngine(t, 'mk');
    const S = (t, o) => { for (const k in o) Q.mkSet(t, k, o[k]); };
    const V = (t, k, f) => { for (let s = 0; s < 16; s++) Q.mkSet(t, 't.0.seq.q.' + k + '.v.' + s, f(s)); };
    S(0, {'t.0.f.cut': 60, 't.0.f.res': 40, 't.0.e2.s': 100, 't.0.e2.r': 25, 't.0.seq.on': 1, 't.0.seq.ks': 2, 't.0.seq.res': 3, 't.0.seq.q.0.k': 11, 't.0.seq.q.0.m': 0});
    V(0, 0, s => Math.round(35 * Math.sin(s / 16 * 2 * Math.PI)));
    S(2, {'t.0.e2.a': 0, 't.0.e2.s': 127, 't.0.e2.r': 40, 't.0.f.cut': 70, 't.0.f.res': 30, 't.0.seq.on': 1, 't.0.seq.ks': 0, 't.0.seq.res': 3,
      't.0.seq.q.0.k': 15, 't.0.seq.q.0.m': 1, 't.0.seq.q.1.k': 11, 't.0.seq.q.1.m': 0, 't.0.seq.q.2.k': 16, 't.0.seq.q.2.m': 0});
    V(2, 0, s => ([0, 0, -63, 0, 0, -63, 0, -63, 0, 0, -63, 0, 0, -63, -63, 0][s])); V(2, 1, s => s * 3 - 20); V(2, 2, s => Math.round(40 * Math.sin(s / 8 * Math.PI)));
    S(3, {'t.0.f.cut': 95, 't.0.e2.r': 30, 't.0.o1.w': 1, 't.0.seq.on': 1, 't.0.seq.ks': 1, 't.0.seq.res': 3, 't.0.seq.q.0.k': 1, 't.0.seq.q.0.m': 1, 't.0.seq.q.1.k': 4, 't.0.seq.q.1.m': 0});
    V(3, 0, s => [0, 12, 7, 0, 12, 7, 0, 5, 0, 12, 7, 0, 12, 7, 5, 3][s]); V(3, 1, s => Math.round(50 * Math.sin(s / 16 * 2 * Math.PI)));
    return {engines: [0, 1, 2, 3, 4].map(t => Q.getSound(t).engine), seq: [0, 2, 3].map(t => Q.mkGet(t).t[0].seq), clips: [0, 1, 2, 3, 4].map(t => [0, 1, 2, 3].map(s => !!Q.getClip(t, s)))};
  });
}
