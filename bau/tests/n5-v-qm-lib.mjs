// QA musiker (VV1): shared setup — a real song: parts, chords, melody, FM + MS 2000 (arp) tracks, a STIMME take
export { open } from './n5-v-qa-lib.mjs';
export const OUTQ = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/n5-v-qm-out/';
export async function buildSong(p, o = {}) {
  return p.evaluate(async (o) => {
    const A = SYNQUENZER, out = {};
    A.setMetronome && A.setMetronome(false);
    // MS 2000 arp sound on Synth 4, its clip = Synth 1's scene-1 clip
    if (o.mk !== false) {
      A.setEngine(3, 'mk'); mkLoad(); if (window.MKK && MKK.decodeAll) await MKK.decodeAll();
      A.selectTrack(3); A.browserTap(o.mkId || 'f-mk-k115'); try { closeBrowser(false); } catch (e) {}
      const c0 = A.getClip(0, 0); A.setClip(3, 0, c0); A.setClip(3, 1, A.getClip(2, 0));
      out.mk = {eng: S.tracks[3].sound.engine, arp: !!(S.tracks[3].sound.p.mk && S.tracks[3].sound.p.mk.arp && S.tracks[3].sound.p.mk.arp.on), name: S.tracks[3].sound.name};
    }
    // a sung-like take on STIMME (scene 1, 2 s)
    if (o.take !== false) {
      const sr = 48000, n = sr * 2, pcm = new Array(n);
      for (let k = 0; k < n; k++) { const t = k / sr; pcm[k] = Math.round(9000 * Math.sin(2 * Math.PI * 220 * t + 2 * Math.sin(2 * Math.PI * 5 * t)) * Math.min(1, t * 20, (2 - t) * 20)); }
      const r = await A.tkInject({pcm, sr, scene: 0, len: 1}); out.take = r;
    }
    const nt = NT(), st = typeof stimmeT === 'function' ? stimmeT() : -1;
    const lanes = Array.from({length: nt}, () => []);
    lanes[0] = [{bar: 0, slot: 0}];
    lanes[1] = [{bar: 2, slot: 0}, {bar: 6, slot: 1}];
    lanes[2] = [{bar: 6, slot: 0}, {bar: 10, slot: 1}];
    if (o.mk !== false) lanes[3] = [{bar: 2, slot: 0}, {bar: 6, slot: 1}, {bar: 10, slot: -1}];
    lanes[4] = [{bar: 0, slot: 1}, {bar: 2, slot: 0}];
    if (st >= 0) lanes[st] = [{bar: 6, slot: 0}, {bar: 7, slot: -1}, {bar: 8, slot: 0}, {bar: 9, slot: -1}];
    const mel = {5: {notes: [[24, 72], [26, 74], [28, 76], [30, 74], [32, 72], [34, 71], [36, 69], [40, 72], [42, 76], [44, 79], [46, 77], [48, 76]].map(([t, n]) => ({t, d: 1.5, n, v: .8}))}};
    const bars = o.bars || 12;
    A.setSong({bars, lanes, carrier: [], mel, melodyTrack: 5, marks: [{id: 'm1', a: 0, len: 2, name: 'Intro'}, {id: 'm2', a: 2, len: 4, name: 'Strophe'}, {id: 'm3', a: 6, len: 4, name: 'Refrain'}, {id: 'm4', a: 10, len: 2, name: 'Outro'}].filter(m => m.a < bars)});
    A.songSetChord(6, 'Am'); A.songSetChord(10, 'F');
    await new Promise(r => setTimeout(r, 600));
    out.song = {bars: S.song.bars, carrier: S.song.carrier.map(c => [c.beat, c.target ? prettyTarget(c.target) : null]), mel: (S.song.mel[5] || {notes: []}).notes.length, nt, st};
    return out;
  }, o);
}
// live capture of the master (ScriptProcessor on the ceiling) while the song (or a range) plays once + 5 s tail
export async function liveCap(p, range, tailMs = 5000) {
  return p.evaluate(async ({range, tailMs}) => {
    const c = AU.ctx, sp = c.createScriptProcessor(4096, 2, 2), LL = [], RR = [];
    let on = false; sp.onaudioprocess = e => { if (!on) return; LL.push(new Float32Array(e.inputBuffer.getChannelData(0))); RR.push(new Float32Array(e.inputBuffer.getChannelData(1))); };
    AU.M.ceil.connect(sp); sp.connect(c.destination);
    clearLog(); on = true;
    if (range) SYNQUENZER.songSelect(range.a, range.b - 1); else SYNQUENZER.songSelect(null);
    songPlayStart(range ? range.a : 0);
    const endB = range ? (range.b - range.a) * 4 : null;
    await new Promise(res => { const iv = setInterval(() => { if (endB != null && R.songPlay && songBeatOf(audBeat()) >= (range.b) * 4 - .02) songPlayEnd(true); if (!R.playing) { clearInterval(iv); res(); } }, 10); });
    const log = noteLog(4096);
    await new Promise(r => setTimeout(r, tailMs));
    on = false; AU.M.ceil.disconnect(sp); sp.disconnect();
    const n = LL.reduce((a, x) => a + x.length, 0), o = new Int16Array(n * 2); let k = 0;
    for (let j = 0; j < LL.length; j++) for (let i = 0; i < LL[j].length; i++, k++) { o[2 * k] = Math.max(-32768, Math.min(32767, Math.round(LL[j][i] * 32767))); o[2 * k + 1] = Math.max(-32768, Math.min(32767, Math.round(RR[j][i] * 32767))); }
    const u8 = new Uint8Array(o.buffer); let s = ''; for (let q = 0; q < u8.length; q += 32768) s += String.fromCharCode.apply(null, u8.subarray(q, q + 32768));
    SYNQUENZER.songSelect(null);
    return {sr: c.sampleRate, b64: btoa(s), log};
  }, {range: range || null, tailMs});
}
export const notesOf = log => log.filter(e => e.src !== 'click').map(e => [e.track, e.src === 'own' ? 'clip' : e.src, e.out, +(+e.beat).toFixed(3), +(+e.vel).toFixed(3)]).sort((a, b) => a[3] - b[3] || a[0] - b[0] || a[2] - b[2]);
export function diffNotes(a, b) { const ka = new Map(), kb = new Map(); for (const x of a) { const k = JSON.stringify(x); ka.set(k, (ka.get(k) || 0) + 1); } for (const x of b) { const k = JSON.stringify(x); kb.set(k, (kb.get(k) || 0) + 1); }
  const onlyA = [], onlyB = []; for (const [k, n] of ka) { const m = kb.get(k) || 0; for (let j = m; j < n; j++) onlyA.push(k); } for (const [k, n] of kb) { const m = ka.get(k) || 0; for (let j = m; j < n; j++) onlyB.push(k); } return {onlyA, onlyB}; }
