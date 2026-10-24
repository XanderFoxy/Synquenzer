// V2d test helpers (in-page setup of the song from song-delta 5.5)
export const SETUP55 = `(() => {
  const Q = window.SYNQUENZER;
  Q.newProject({init: true});
  const N = (t, n, d) => ({t, d: d || .5, n, v: .8});
  const K = {root: 9, scale: 'aeolian'};
  Q.setClip(0, 0, {len: 1, key: K, notes: [N(0, 45), N(2, 45)]});            // Bass Sz1 (1 Takt)
  Q.setClip(0, 2, {len: 2, key: K, notes: [N(0, 41), N(4, 43), N(6, 43)]});  // Bass Sz3 (2 Takte)
  Q.setClip(1, 1, {len: 4, key: K, notes: [N(0, 60, 4)]});                   // Fläche Sz2
  Q.setClip(2, 2, {len: 1, key: K, notes: [N(0, 72, .25), N(1, 74, .25)]});  // Sequenz Sz3
  Q.setClip(3, 3, {len: 1, key: K, notes: [N(0, 64)]});                      // Intro-Klang Sz4
  Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 2, d: .1, n: 36, v: .9}]});   // Drums Sz1
  Q.setClip(4, 1, {len: 1, key: K, notes: [{t: 0, d: .1, n: 38, v: .9}, {t: 1, d: .1, n: 42, v: .9}]});   // Drums Sz2
  const C = n => Q.parseChord(n);
  Q.setSong({bars: 7, lanes: [[{bar: 3, slot: 2}], [{bar: 3, slot: 1}], [{bar: 3, slot: 2}], [{bar: 0, slot: 3}, {bar: 2, slot: -1}], [{bar: 2, slot: 1}, {bar: 3, slot: 1, re: 1}], []],
    carrier: [{beat: 0, target: C('Am')}, {beat: 8, target: C('G')}, {beat: 12, target: C('F')}, {beat: 16, target: C('G')}, {beat: 20, target: C('Am')}],
    mel: {5: {notes: [{t: 2, d: 1, n: 76, v: .8}, {t: 7.8, d: .5, n: 77, v: .8}, {t: 10, d: 1, n: 79, v: .8}, {t: 24, d: 1, n: 81, v: .8}]}}, melodyTrack: 5,
    marks: [{id: 'M1', a: 0, len: 2, part: 'S4', name: 'Intro'}, {id: 'M2', a: 3, len: 4, part: 'P2'}]});
  Q.setPart(1, {name: 'Refrain', slots: [{s: 2}, {s: 1}, {s: 2}, -1, {s: 1}, -1], chords: {len: 4, ch: [{b: 0, tg: C('F')}, {b: 4, tg: C('G')}, {b: 8, tg: C('Am')}]}});
  Q.setPart(0, {name: 'Strophe', lanes: [[{bar: 0, slot: 0}], [{bar: 0, slot: 1}], [{bar: 0, slot: -1}], [{bar: 0, slot: -1}], [{bar: 0, slot: 0}], [{bar: 0, slot: -1}]],
    chords: {len: 4, ch: [{b: 0, tg: C('Am')}, {b: 4, tg: C('F')}, {b: 8, tg: C('C')}, {b: 12, tg: C('G')}]}, src: 'fang', len: 4});
  Q.setBpm(240); return 1;
})()`;
export const lanesOf = `(() => window.SYNQUENZER.song().lanes)()`;
export function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
export function mkCheck() {
  const res = []; const check = (id, ok, info) => { res.push({id, ok: !!ok}); console.log((ok ? 'PASS ' : 'FAIL ') + id + (info !== undefined ? ' ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); };
  return {res, check, done: () => { const f = res.filter(r => !r.ok); console.log(`\n${res.length - f.length}/${res.length} passed` + (f.length ? ' FAILED: ' + f.map(r => r.id).join(', ') : '')); return f.length; }};
}
