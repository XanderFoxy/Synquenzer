// QA G-MK7: songwriting project for the vocoder group check
//  t0 bass  = Moog-Bass (VA) – later MS 2000 with OSZ 1 = Eingang (E1 = drums)
//  t1 pluck = FM
//  t2 pad   = Rom-Fläche chords – later MS 2000 Vocoder (E2 = t3 lead)
//  t3 lead  = Mini-Lead melody (the "voice" for the vocoder), scenes 1–4
//  t4 drums; scenes 1–4 filled
export async function setupProject(E) {
  return E(async () => {
    const Q = SYNQUENZER;
    await Q.loadDemo();
    Q.setMetronome && Q.setMetronome(false);
    const mel = (base) => ({len: 1, notes: [[0, .45, 0], [.5, .45, 2], [1, .9, 4], [2, .45, 7], [2.5, .45, 5], [3, .9, 4]].map(([t, d, n]) => ({t, d, n: base + n, v: .8}))});
    Q.setClip(3, 0, mel(72)); Q.setClip(3, 1, mel(74)); Q.setClip(3, 2, mel(71)); Q.setClip(3, 3, mel(69));
    for (const t of [0, 1, 2, 4]) { const a = Q.getClip(t, 0), b = Q.getClip(t, 1); if (a) Q.setClip(t, 2, a); if (b || a) Q.setClip(t, 3, b || a); }
    if (!Q.getClip(0, 1)) Q.setClip(0, 1, Q.getClip(0, 0));
    return {clips: [0, 1, 2, 3, 4].map(t => [0, 1, 2, 3].map(s => !!Q.getClip(t, s))), uids: Q.tracks().map(t => t.uid)};
  });
}
