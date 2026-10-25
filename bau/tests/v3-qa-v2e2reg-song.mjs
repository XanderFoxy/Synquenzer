// QA regression V2e′: a song built from parts (placePart insert/replace/append), own clips (makeOwn + edit), marks move/copy,
// chords; playback noteLog, MIDI song export, serialize → import roundtrip, undo chain — base vs new
import { open, NEW, BASE } from './v3-qa-v2e2reg-pw.mjs';
const res = {};
for (const [name, file] of [['base', BASE], ['new', NEW]]) {
  const {b, p, errs} = await open({width: 390, height: 844}, file);
  const r = await p.evaluate(async () => { const Q = window.SYNQUENZER, sl = ms => new Promise(r => setTimeout(r, ms)), o = {};
    Q.newProject({init: true}); Q.setBpm(240); const K = {root: 9, scale: 'aeolian'}, N = (t, n, d) => ({t, d: d || .4, n, v: .8});
    Q.setClip(0, 0, {len: 1, key: K, notes: [N(0, 57), N(1, 60), N(2, 64), N(3, 60)]}); Q.setClip(0, 1, {len: 2, key: K, notes: [N(0, 53), N(4, 55)]});
    Q.setClip(1, 0, {len: 1, key: K, notes: [N(0, 69, 1.5), N(2, 72, 1.5)]}); Q.setClip(1, 1, {len: 1, key: K, notes: [N(.5, 76, .3), N(2.5, 74, .3)]});
    Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 2, d: .1, n: 38, v: .9}]}); Q.setClip(4, 1, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 3, d: .1, n: 42, v: .9}]});
    Q.setPart(0, {name: 'Strophe', slots: [{s: 0}, {s: 0}, null, -1, {s: 0}, -1], chords: {len: 2, ch: [{b: 0, tg: Q.parseChord('Am')}, {b: 4, tg: Q.parseChord('F')}]}});
    Q.setPart(1, {name: 'Refrain', slots: [{s: 1}, {s: 1}, null, -1, {s: 1}, -1], chords: {len: 2, ch: [{b: 0, tg: Q.parseChord('C')}, {b: 4, tg: Q.parseChord('G')}]}});
    const steps = [];
    const sg = () => { const s = Q.song(); return s ? JSON.stringify({bars: s.bars, lanes: s.lanes, marks: (s.marks || []).map(m => [m.a, m.len, m.name || m.part || null]), car: s.carrier.map(c => c.beat + ':' + (c.target ? c.target.name : '-')), own: Object.keys(s.own || {}).length}) : null; };
    steps.push(['place0', JSON.stringify(Q.placePart('P1', 0, 'insert'))]);
    steps.push(['place1end', JSON.stringify(Q.placePart('P2', 2, 'insert'))]);
    steps.push(['place0ins', JSON.stringify(Q.placePart('P1', 2, 'insert'))]);
    steps.push(['place1repl', JSON.stringify(Q.placePart('P2', 0, 'replace'))]);
    o.song1 = sg();
    const own = Q.makeOwn(0, 2, false); steps.push(['own', JSON.stringify(own)]);
    const oc = Q.ownClip(0, 2); o.ownClip = oc && JSON.stringify(oc).slice(0, 200);
    if (oc && oc.notes) { oc.notes.push({t: 1.5, d: .25, n: 67, v: .9}); }
    o.song2 = sg();
    const mk = Q.songMarks(); o.marks = JSON.stringify(mk).slice(0, 400);
    const m0 = (mk.marks || mk || [])[0]; if (m0 && m0.id) { steps.push(['copy', JSON.stringify(Q.markAction(m0.id, 'copy', Q.song().bars))]); }
    o.song3 = sg(); o.steps = steps;
    // play the song
    Q.clearLog(); Q.songPlay(0);
    const wb = b => new Promise(res => { const f = () => (Q.runtime().beat > b ? res() : setTimeout(f, 10)); f(); });
    const total = Q.song().bars * 4; await wb(Math.min(total, 40) - .2); Q.stop(); await sl(200);
    o.log = Q.noteLog(4000).filter(n => n.beat != null && n.beat >= 0).map(n => n.track + '@' + n.beat.toFixed(2) + ':' + n.out + (n.src ? '/' + n.src : '')).sort();
    // MIDI song export
    const got = []; window.claude = {use: async k => (k === 'downloads' ? {save: async ({filename, data}) => { got.push({filename, bytes: Array.from(new Uint8Array(await data.arrayBuffer()))}); }} : null)};
    await Q.exportMidi({mode: 'song'}); await sl(800); o.midi = got.map(g => { const z = g.bytes, nl = z[26] | z[27] << 8, xl = z[28] | z[29] << 8, cs = z[18] | z[19] << 8 | z[20] << 16, d = z.slice(30 + nl + xl, 30 + nl + xl + cs); return g.filename + ':' + d.length + ':' + d.join(','); });
    // roundtrip
    const s1 = Q.serialize(); const before = sg(); await Q.newProject({init: true}); o.imp = Q.importJSON(s1); o.rt = sg() === before;
    // undo chain back to the empty song
    let u = 0; while (Q.song() && Q.song().bars && u < 30) { Q.undo(); u++; } o.undos = u; o.songAfterUndo = sg();
    o.te = Q.tickErrors(); return o; });
  r.errs = errs.slice(); res[name] = r; await b.close();
}
for (const k of Object.keys(res.new)) { const A = res.base[k], B = res.new[k];
  if (k === 'log') { const miss = A.filter(x => !B.includes(x)), extra = B.filter(x => !A.includes(x)); console.log('log', A.length, B.length, miss.length || extra.length ? 'DIFF miss=' + JSON.stringify(miss.slice(0, 20)) + ' extra=' + JSON.stringify(extra.slice(0, 20)) : 'same'); continue; }
  const s = JSON.stringify(A) === JSON.stringify(B); console.log(k, s ? 'same' : 'DIFF', JSON.stringify(B).slice(0, 700), s ? '' : '\n   base ' + JSON.stringify(A).slice(0, 700)); }
