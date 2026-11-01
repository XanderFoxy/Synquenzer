// G6+h Testdaten: synthetischer Gesang + Song mit Begleitung G–Em–C–D (G-Dur) und Song-Stimme(n)
// synthetischer Gesang (48 kHz): je Schlag eine Note (Obertöne 1…8, Vibrato ±25 ct, 20-ms-Hülle, kleine Lücke)
export function sing(midis, bpm, sr = 48000) {
  const spb = 60 / bpm, n = Math.round(midis.length * spb * sr), y = new Int16Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr, k = Math.floor(t / spb), m = midis[Math.min(k, midis.length - 1)], tn = t - k * spb;
    const f = 440 * Math.pow(2, (m - 69 + 0.25 * Math.sin(2 * Math.PI * 5.5 * t) / 100 * 4 / 4) / 12);
    ph += 2 * Math.PI * f / sr;
    const env = Math.min(1, tn / 0.02, Math.max(0, (spb - 0.04 - tn) / 0.02));
    let s = 0; for (let h = 1; h <= 8; h++) s += Math.sin(h * ph) / h;
    y[i] = Math.round(env * 0.22 * s * 32767 / 1.6);
  }
  return Array.from(y);
}
// G-Dur: Begleitung G – Em – C – D (Synth 1, Szene 1 = Slot 0), Lead nur Akkordtöne
export const CH = [[55, 59, 62], [52, 55, 59], [48, 52, 55], [50, 54, 57]], PCS = CH.map(c => c.map(x => x % 12).sort((a, b) => a - b));
export const LEAD = [67, 71, 74, 71, 64, 67, 71, 67, 72, 76, 67, 76, 74, 78, 69, 78];
export async function setup(p, o) {
  o = o || {};
  return p.evaluate(async ([lead, CH, o]) => {
    SYNQUENZER.setBpm(o.bpm || 120);
    const notes = []; CH.forEach((c, bar) => c.forEach(n => notes.push({t: bar * 4, d: 4, n, v: 0.8})));
    SYNQUENZER.setClip(0, 0, {len: 4, key: {root: 7, scale: 'ionian', src: 'user'}, notes});
    const r = await SYNQUENZER.tkInject({pcm: lead, sr: 48000, scene: 1, len: 4});
    const st = SYNQUENZER.tkInfo().stimme, dur = lead.length / 48000, bars = o.bars || 16;
    const lanes = []; for (let i = 0; i < 6; i++) lanes.push([]);
    lanes[0] = [{bar: 0, slot: 0}];
    const vox = (o.at || [8]).map((bar, k) => ({id: 'V' + (k + 1), bar, len: 4, take: r.id, in: 0, out: dur, at: 0}));
    SYNQUENZER.setSong({bars, lanes, vox, marks: o.marks || [], carrier: [], xp: [], mel: o.mel || {}, loop: {on: false, a: 0, b: bars}});
    return {id: r.id, st, song: SYNQUENZER.project().song};
  }, [sing(LEAD, o.bpm || 120), CH, o]);
}
export default {sing, setup, CH, PCS, LEAD};
