// QA regression (V2e): a V2d′-fix project (parts placed, chords, melody, own clip, marks) → file → V2e: plays the same,
// V2e save/load round trip, song MIDI notes unchanged (meta aside)
import { open, APP } from './v3-v2d-pw.mjs';
import { SETUP } from './v3-v2d2-lib.mjs';
import fs from 'fs';
const BASE = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/synq-snapshots/V2d′-fix.html';
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-v2ereg/';
const waitSong = (p, x, to = 60000) => p.waitForFunction(v => { const s = window.SYNQUENZER.runtime().song; return s && s.beat != null && s.beat >= v; }, x, {timeout: to, polling: 10});
const grab = p => p.evaluate(() => window.SYNQUENZER.noteLog(6000).filter(n => n.beat != null && n.beat >= 0).map(n => n.track + '@' + (n.songBeat != null ? n.songBeat : n.beat).toFixed(2) + ':' + n.out).sort());
const midiNotes = async p => p.evaluate(async () => { const Q = window.SYNQUENZER; const got = [];
  window.claude = {use: async k => (k === 'downloads' ? {save: async ({filename, data}) => { got.push({filename, bytes: new Uint8Array(await data.arrayBuffer())}); }} : null)};
  await Q.exportMidi({mode: 'song'}); await new Promise(r => setTimeout(r, 800));
  const z = got[0] && got[0].bytes; if (!z) return null; const dv = new DataView(z.buffer); const nl = dv.getUint16(26, true), xl = dv.getUint16(28, true), cs = dv.getUint32(18, true);
  const m = z.slice(30 + nl + xl, 30 + nl + xl + cs);
  // parse SMF: per track list of [absTick, status, d1, d2] for note on/off, plus meta text events
  const out = {notes: [], meta: []}; let i = 14, tr = 0;
  const vlq = () => { let v = 0, c; do { c = m[i++]; v = (v << 7) | (c & 127); } while (c & 128); return v; };
  while (i < m.length) { i += 4; const len = (m[i] << 24) | (m[i + 1] << 16) | (m[i + 2] << 8) | m[i + 3]; i += 4; const end = i + len; let t = 0, rs = 0;
    while (i < end) { t += vlq(); let st = m[i]; if (st & 128) i++; else st = rs;
      if (st === 0xff) { const ty = m[i++], l = vlq(); const tx = String.fromCharCode(...m.slice(i, i + l)); if (ty >= 1 && ty <= 7) out.meta.push(tr + '@' + t + ':' + ty.toString(16) + ':' + tx); i += l; }
      else if (st === 0xf0 || st === 0xf7) { const l = vlq(); i += l; }
      else { rs = st; const hi = st & 0xf0; const n1 = m[i++]; const n2 = (hi === 0xc0 || hi === 0xd0) ? null : m[i++]; if (hi === 0x90 || hi === 0x80) out.notes.push(tr + '@' + t + ':' + (hi === 0x90 && n2 ? 'on' : 'off') + ':' + n1); }
    } i = end; tr++; }
  out.notes.sort(); return out; });
const res = {};
// 1) base builds and saves
{ const {b, p, errs} = await open({width: 390, height: 844}, BASE);
  await p.evaluate(SETUP(true));
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.songLoopRange({on: false}); });
  const file = await p.evaluate(() => window.SYNQUENZER.serialize());
  fs.writeFileSync(D + 't2-base-project.json', file);
  res.baseInfo = await p.evaluate(() => { const s = window.SYNQUENZER.song(); return {bars: s.bars, marks: s.marks, mt: s.melodyTrack, car: s.carrier.length}; });
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.clearLog(); Q.songPlay(0); });
  await waitSong(p, 4 * 11 - .5);
  res.baseLog = await grab(p);
  await p.evaluate(() => window.SYNQUENZER.stop());
  res.baseMidi = await midiNotes(p);
  res.baseErrs = errs.slice();
  await b.close(); }
// 2) new opens the base file
const file = fs.readFileSync(D + 't2-base-project.json', 'utf8');
{ const {b, p, errs} = await open({width: 390, height: 844}, APP);
  res.imp = await p.evaluate(t => window.SYNQUENZER.importJSON(t), file);
  res.newInfo = await p.evaluate(() => { const s = window.SYNQUENZER.song(); return {bars: s.bars, marks: s.marks, mt: s.melodyTrack, car: s.carrier.length}; });
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setBpm(240); Q.clearLog(); Q.songPlay(0); });
  await waitSong(p, 4 * 11 - .5);
  res.newLog = await grab(p);
  await p.evaluate(() => window.SYNQUENZER.stop());
  res.newMidi = await midiNotes(p);
  // song view shows the marks
  await p.evaluate(() => window.SYNQUENZER.songView(true)); await p.waitForTimeout(400);
  res.svMarks = await p.evaluate(() => window.SYNQUENZER.svLayoutInfo().marks.map(m => m.label));
  await p.screenshot({path: D + 't2-new-P1.png'});
  // V2e round trip: serialize → new project → import → identical project + same playback; save() → load()
  res.rt = await p.evaluate(async () => { const Q = window.SYNQUENZER; const s1 = Q.serialize(); const a = JSON.parse(s1); await Q.newProject({init: true}); const ok = Q.importJSON(s1); const s2 = Q.serialize(); const b2 = JSON.parse(s2);
    const strip = o => { const x = JSON.parse(JSON.stringify(o)); for (const k of ['id', 'uid', 'mt', 'ct', 'name', 'savedAt', 'modified', 'created']) delete x[k]; if (x.project) for (const k of ['id', 'uid', 'mt', 'ct', 'name', 'savedAt', 'modified', 'created']) delete x.project[k]; return JSON.stringify(x); };
    await Q.save(); const ld = await Q.load(); const s3 = Q.serialize();
    return {ok, same: strip(a) === strip(b2), ld, same3: strip(a) === strip(JSON.parse(s3)), len: s1.length}; });
  await p.evaluate(() => { const Q = window.SYNQUENZER; Q.setBpm(240); Q.clearLog(); Q.songPlay(0); });
  await waitSong(p, 4 * 11 - .5);
  res.rtLog = await grab(p);
  await p.evaluate(() => window.SYNQUENZER.stop());
  res.newErrs = errs.slice();
  res.te = await p.evaluate(() => window.SYNQUENZER.tickErrors());
  await b.close(); }
const cmp = (A, B) => { const miss = A.filter(x => !B.includes(x)), extra = B.filter(x => !A.includes(x)); return A.length + ' ' + B.length + (miss.length || extra.length ? ' DIFF miss=' + JSON.stringify(miss.slice(0, 12)) + ' extra=' + JSON.stringify(extra.slice(0, 12)) : ' same'); };
console.log('baseInfo', JSON.stringify(res.baseInfo));
console.log('newInfo ', JSON.stringify(res.newInfo), 'imp', res.imp);
console.log('svMarks', JSON.stringify(res.svMarks));
console.log('log base→new', cmp(res.baseLog, res.newLog));
console.log('log new round trip', cmp(res.newLog, res.rtLog));
console.log('rt', JSON.stringify(res.rt));
console.log('midi notes', res.baseMidi && res.newMidi ? cmp(res.baseMidi.notes, res.newMidi.notes) : 'missing ' + !!res.baseMidi + ' ' + !!res.newMidi);
console.log('midi meta base', JSON.stringify(res.baseMidi && res.baseMidi.meta));
console.log('midi meta new ', JSON.stringify(res.newMidi && res.newMidi.meta));
console.log('errs', JSON.stringify(res.baseErrs), JSON.stringify(res.newErrs), 'te', res.te);
