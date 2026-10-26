// QA G-MK5: songwriting project with MS 2000 arps:
//  t0 bass = MS 2000, arp off; t1 FM pluck (unchanged); t2 pad = MS 2000 ARP Wechsel 1 · 1/16 · 2 Okt · GATE 60 (clip chords feed it)
//  t3 lead = MS 2000 ARP Zufall · 1/8 · KEY SYNC an · LÄNGE 6 with step 4 off (melody clips feed it); t4 drums; scenes 1–4 filled
export async function setupProject(E) {
  return E(async () => {
    const Q = SYNQUENZER;
    Q.setMetronome && Q.setMetronome(false);
    const ch = (a, b) => ({len: 2, key: {root: 0, scale: 'ionian'}, notes: [...a.map(n => ({t: 0, d: 3.8, n, v: .6})), ...b.map(n => ({t: 4, d: 3.8, n, v: .6}))]});
    Q.setClip(2, 0, ch([60, 64, 67], [57, 60, 64])); Q.setClip(2, 1, ch([65, 69, 72], [67, 71, 74])); Q.setClip(2, 2, ch([62, 65, 69], [64, 67, 71])); Q.setClip(2, 3, ch([60, 64, 67, 71], [65, 69, 72, 76]));
    const mel = base => ({len: 1, notes: [[0, 1.9, 0], [2, 1.9, 4], [0, 1.9, 7], [2, 1.9, 9]].map(([t, d, n]) => ({t, d, n: base + n, v: .8}))});
    Q.setClip(3, 1, mel(72)); Q.setClip(3, 2, mel(74)); Q.setClip(3, 3, mel(71));
    for (const t of [0, 1, 4]) { const a = Q.getClip(t, 0), b = Q.getClip(t, 1); if (a) Q.setClip(t, 2, a); if (b || a) Q.setClip(t, 3, b || a); }
    if (!Q.getClip(0, 1)) Q.setClip(0, 1, Q.getClip(0, 0));
    for (const t of [0, 2, 3]) Q.setEngine(t, 'mk');
    const S_ = (t, o) => { for (const k in o) Q.mkSet(t, k, o[k]); };
    S_(0, {'t.0.f.cut': 60, 't.0.f.res': 40, 't.0.e2.s': 100, 't.0.e2.r': 25});
    S_(2, {'t.0.e2.a': 0, 't.0.e2.d': 50, 't.0.e2.s': 80, 't.0.e2.r': 20, 't.0.f.cut': 85, 'arp.on': 1, 'arp.type': 2, 'arp.res': 1, 'arp.range': 2, 'arp.gate': 60});
    S_(3, {'t.0.f.cut': 95, 't.0.e2.r': 30, 't.0.o1.w': 1, 'arp.on': 1, 'arp.type': 4, 'arp.res': 3, 'arp.ks': 1, 'arp.last': 6, 'arp.steps': 255 & ~8});
    return {engines: [0, 1, 2, 3, 4].map(t => Q.getSound(t).engine), arp: [2, 3].map(t => Q.mkGet(t).arp), clips: [0, 1, 2, 3, 4].map(t => [0, 1, 2, 3].map(s => !!Q.getClip(t, s)))};
  });
}
