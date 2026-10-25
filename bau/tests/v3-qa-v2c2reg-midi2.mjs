// QA regression V2c′: MIDI export „mit Träger“ in a NEW project (Eine Skala on) with scale-own clips: scene under a latched Träger,
// song with song chords; must equal 4.5.2 byte for byte. Plus the same with a foreign tone to show the change is limited to it.
import { open, APP } from './v3-v2d-pw.mjs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/VS2b-fix.html';
const res = {};
for (const [name, file] of [['base', BASE], ['new', APP]]) for (const foreign of [false, true]) {
  const {b, p, errs} = await open({width: 390, height: 844}, file);
  const r = await p.evaluate(async foreign => { const Q = window.SYNQUENZER, got = [];
    window.claude = {use: async k => (k === 'downloads' ? {save: async ({filename, data}) => { got.push({filename, bytes: Array.from(new Uint8Array(await data.arrayBuffer()))}); }} : null)};
    Q.newProject({init: true}); Q.setBpm(120); const K = {root: 9, scale: 'aeolian'}, N = (t, n, d) => ({t, d: d || .4, n, v: .8});
    Q.setClip(0, 0, {len: 1, key: K, notes: [N(0, 57), N(1, 60), N(2, foreign ? 63 : 64), N(3, 62)]}); Q.setClip(1, 0, {len: 1, key: K, notes: [N(0, 69, 1.5), N(2, 72, 1.5)]});
    Q.setClip(1, 1, {len: 1, key: K, notes: [N(0, 76), N(2, 74)]});
    Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 2, d: .1, n: 38, v: .9}]});
    Q.songFromChain([{scene: 0, bars: 2}, {scene: 1, bars: 2}]);
    let sc = null; try { sc = [Q.songSetChord(0, 'F'), Q.songSetChord(1, 'G'), Q.songSetChord(2, 'Dm'), Q.songSetChord(3, 'E')]; } catch (e) { sc = String(e); }
    Q.setKbMode('transpose'); Q.keyOn(65, .8); await new Promise(r => setTimeout(r, 120)); Q.keyOff(65); await new Promise(r => setTimeout(r, 200));
    const car = Q.runtime().carrier;
    for (const mode of ['scene', 'song']) { await Q.exportMidi({mode, scene: 0, withCarrier: true}); await new Promise(r => setTimeout(r, 600)); }
    const un = z => { let i = 0; const dv = new DataView(new Uint8Array(z).buffer); const nl = dv.getUint16(i + 26, true), xl = dv.getUint16(i + 28, true), cs = dv.getUint32(i + 18, true); return z.slice(i + 30 + nl + xl, i + 30 + nl + xl + cs); };
    // note-on events per track: [ch, note]
    const ons = d => { const out = []; for (let i = 0; i + 2 < d.length; i++) if ((d[i] & 0xf0) === 0x90 && d[i + 2] > 0 && d[i + 1] < 128) out.push((d[i] & 15) + ':' + d[i + 1]); return out.join(' '); };
    return {car: car && car.name, sc: JSON.stringify(sc), song: JSON.stringify(Q.project().song && Q.project().song.carrier).slice(0, 200), files: got.map(g => ({f: g.filename, ons: ons(un(g.bytes))}))}; }, foreign);
  r.errs = errs.slice(); res[name + (foreign ? '-foreign' : '')] = r; await b.close();
}
for (const k of ['', '-foreign']) { const A = res['base' + k], B = res['new' + k]; console.log('==', k || 'in-scale');
  for (const f of Object.keys(B)) { const s = JSON.stringify(A[f]) === JSON.stringify(B[f]); console.log('  ' + f, s ? 'same' : 'DIFF', JSON.stringify(B[f]).slice(0, 700), s ? '' : '\n    base ' + JSON.stringify(A[f]).slice(0, 700)); } }
