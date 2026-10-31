// the VV3 test song: 8 bars at 120 BPM; Synth 3 = MS-Spur (LFO 1 → CUTOFF), Synth 2 = FM, Synth 1 = VA, Drums
export async function setup(p, o = {}) {
  return p.evaluate(async o => {
    SYNQUENZER.setBpm(o.bpm || 120);
    SYNQUENZER.setEngine(2, 'mk');
    const set = (k, v) => SYNQUENZER.mkSet(2, 't.0.' + k, v);
    set('l1.w', o.w != null ? o.w : 0); set('l1.sync', o.sync ? 1 : 0); set('l1.note', 3); set('l1.ks', o.ks || 0);
    set('l1.f', o.f != null ? o.f : 127 * Math.log2(20) / 10);          // W-08: 0.05 · 2^(10 v / 127) = 1 Hz
    set('p.0.s', 2); set('p.0.d', 4); set('p.0.i', 20); set('f.cut', 60); set('f.res', 30); set('f.eg', 0);
    set('e2.s', 127); set('e2.r', 30);
    if (o.seq) { set('seq.on', 1); set('seq.last', 8); set('seq.res', 9); set('seq.q.0.k', 11); for (let s = 0; s < 8; s++) set('seq.q.0.v.' + s, [0, 20, 40, 10, -20, -40, 0, 30][s]); }
    // Synth 3 plays long notes (a held chord over every bar) so the LFO sweeps the cutoff audibly
    SYNQUENZER.setClip(2, 0, {len: 2, notes: [{t: 0, d: 3.5, n: 57, v: .9}, {t: 4, d: 3.5, n: 60, v: .8}]});
    SYNQUENZER.setSong({bars: 8, lanes: [[{bar: 0, slot: 0}, {bar: 4, slot: 1}], [{bar: 0, slot: 0}], [{bar: 0, slot: 0}], [], [{bar: 0, slot: 0}, {bar: 4, slot: 1}], []],
      carrier: [], mel: {}, marks: [{id: 'm1', a: 0, len: 4, name: 'Strophe'}, {id: 'm2', a: 4, len: 4, name: 'Refrain'}]});
    return {eng: S.tracks.map(t => t.sound && t.sound.engine), l1: S.tracks[2].sound.p.mk.t[0].l1, p0: S.tracks[2].sound.p.mk.t[0].p[0]};
  }, o);
}
