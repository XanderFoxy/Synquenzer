// Regel 28 / M-G28: alte Projekte laden und speichern Zeichen für Zeichen gleich (Basis 4.30.0 ↔ G10a). Format bleibt 5.
import {launch, open, sleep, idle, report, voice, BASE} from './lib.mjs';
const R = report('REGEL-28');
const br = await launch();
const sr = 48000, pcm = []; for (const v of voice(220, 3, sr, .3)) pcm.push(Math.round(v * 32767));
// in der Basis: Demo + ein Projekt mit Song, STIMME-Clip, Take mit Anlauf/Ausklang und Song-Stimme
const {p: pb} = await open(br, {app: BASE});
const texts = await pb.evaluate(async pcm => {
  const out = {};
  SYNQUENZER.loadDemo(); await new Promise(r => setTimeout(r, 500)); out.demo = serializeProject();
  SYNQUENZER.newProject({init: true}); await new Promise(r => setTimeout(r, 400));
  const inj = await SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 1});
  const m = S.takes[inj.id]; m.pre = {in: .5, sec: .4}; m.post = {out: 2.5, sec: .3};
  const lanes = Array.from({length: 8}, () => []); lanes[inj.track] = [{bar: 0, slot: 0}];
  SYNQUENZER.setSong({bars: 2, lanes, vox: [{id: 'V1', bar: 0, len: 1, take: inj.id, in: .5, out: 2.5, at: 0}]});
  await new Promise(r => setTimeout(r, 300)); out.voc = serializeProject();
  return out;
}, pcm);
const {p: pn, errs} = await open(br);
for (const k of Object.keys(texts)) {
  const rt = async pg => pg.evaluate(t => { const r = parseProjectFile(JSON.parse(t)); switchProject(r.project, {}); return serializeProject(); }, texts[k]);
  const a = await rt(pb), b = await rt(pn);
  R.check(`${k}: Laden + Speichern in G10a = Basis (Zeichen für Zeichen)`, a === b, a === b ? a.length : {len: [a.length, b.length], at: [...a].findIndex((c, i) => c !== b[i])});
  R.check(`${k}: G10a speichert wie gelesen`, b === await rt(pn));
}
const dn = await pn.evaluate(async () => { SYNQUENZER.loadDemo(); await new Promise(r => setTimeout(r, 500)); return serializeProject(); });
const noId = t => t.replace(/"(id|uid)":"[^"]*"/g, '"$1":""');   // IDs sind bei jedem Anlegen neu (auch Basis ↔ Basis)
R.check('Demo neu angelegt: identisch zur Basis (bis auf neue IDs)', noId(dn) === noId(texts.demo));
R.check('keine Seitenfehler', errs.length === 0, errs.slice(0, 3));
await br.close(); R.done();
