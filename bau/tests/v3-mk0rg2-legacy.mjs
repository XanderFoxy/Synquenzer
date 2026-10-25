// QA regression MK0: legacy inputs through importJSON / parseFile: synthetic v1 object, raw v2 project (no wrapper), WP2 autosave
// (format 2 with patch), format-3 with fm2 sound, single fm2 sound file, project with odd sounds; base vs new
import { open, NEW, BASE, OUT } from './v3-mk0rg2-lib.mjs';
import fs from 'fs';
const [which] = process.argv.slice(2);
const {p, errs, close} = await open(which === 'base' ? BASE : NEW, 'P1', false);
const v2 = JSON.parse(fs.readFileSync('/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/v3-qa-vs2reg/dirigent-v2.json', 'utf8'));
const r = await p.evaluate(async (v2) => {
  const Q = window.SYNQUENZER, out = {};
  const sum = () => { const P = Q.project(); return {f: P.format, bpm: P.bpm, tr: P.tracks.map(t => [t.kind, t.sound && t.sound.engine, t.sound && t.sound.name, t.clips.filter(Boolean).length].join(' '))}; };
  const v1 = {v: 1, bpm: 98, quant: '1/8', tracks: [{type: 'synth', engine: 'fm', name: 'Eins', tone: .3, vol: .6, clips: [{bars: 1, notes: [{t: 0, d: .5, n: 60, v: .8}, {t: 1, d: .5, n: 64, v: .8}]}]}, {type: 'synth', engine: 'wt', name: 'Zwei', clips: []}, {type: 'synth', engine: 'va'}, {type: 'synth'}, {type: 'drum', clips: [{bars: 1, notes: [{t: 0, d: .1, n: 36, v: 1}]}]}]};
  out.v1 = [Q.importJSON(JSON.stringify(v1)), sum()];
  out.v2raw = [Q.importJSON(JSON.stringify(v2.project)), sum()];
  const wp2 = JSON.parse(JSON.stringify(v2.project)); wp2.format = 2; out.wp2 = [Q.importJSON(JSON.stringify({app: 'SYNQUENZER', kind: 'project', format: 2, project: wp2})), sum()];
  const f3 = JSON.parse(Q.serialize()); const pj = f3.project || f3; pj.tracks[1].sound = {$: 'snd', v: 1, name: 'Alt FM', engine: 'fm2', cat: 'fm', p: {fm2: {ratio: 3}}, mods: [], fx: {}}; pj.tracks[2].sound = {engine: 'analog', p: {cutoff: 2000, newThing: 1}, name: 'X', extra: 1}; pj.tracks[3].sound = {engine: 'VA', p: {}}; pj.tracks[0].sound = 'kaputt';
  if (f3.project) f3.format = 3; else f3.format = 3;
  out.f3 = [Q.importJSON(JSON.stringify(f3)), sum()];
  out.sound1 = Q.importSounds ? JSON.stringify(await Q.importSounds({$: 'snd', v: 1, name: 'Ein FM2', engine: 'fm2', cat: 'fm', p: {fm2: {}}, mods: [], fx: {}})).replace(/u-[a-z0-9-]+/g, 'ID') : null;
  out.libE = Q.library().map(x => x.engine + ':' + x.name);
  out.ser = Q.serialize().length;
  return out; }, v2);
r.errs = errs.slice();
fs.writeFileSync(OUT + `legacy-${which}-P1.json`, JSON.stringify(r, null, 1)); console.log(which, 'done'); await close();
