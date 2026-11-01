// VV4-B/D Bilder: Offline-Render eines kurzen Songs, jedes neue Bild (App, Tastatur, Piano-Roll, Drum-Sequenzer, Modulation,
// Fokus Clip-Zelle/Tastatur/Teil-Kopf/Übergang) zeichnet etwas (nicht leer) ohne Fehler; die Auto-Regie läuft Bild für Bild
// (inkl. kurzem Fokus + Blende); ein manueller Eintrag wird im Video in seinen Takten gezeichnet
import { open, OUT } from './lib.mjs';
import fs from 'fs';
const {b, p, errs} = await open({w: 428, h: 926});
const res = await p.evaluate(async () => {
  SYNQUENZER.setSong({bars: 8, lanes: [[{bar: 0, slot: 0}], [{bar: 4, slot: 0}], [], [], [{bar: 2, slot: 0}], []], carrier: [], mel: {}, xp: [],
    marks: [{id: 'm1', a: 0, len: 4, name: 'A'}, {id: 'm2', a: 4, len: 4, name: 'B'}]});
  S.song.ue = [{id: 'U1', m: S.song.marks[1].id, a: -2, len: 2, k: 'fill', t: 4, notes: []}];
  await SYNQUENZER.vvRender({});
  const r = {}, hash = s => { let h = 0; for (let k = 0; k < s.length; k += 97) h = (h * 31 + s.charCodeAt(k)) >>> 0; return h; };
  const blank = SYNQUENZER.vv4Pic(1, 'app', null, '9:16');
  SYNQUENZER.vv4FocusLog(true);
  for (const [v, t] of [['app', null], ['tast', null], ['roll', 0], ['drum', 4], ['mod', 0], ['f-zelle', 0], ['f-tast', null], ['f-teil', null], ['f-ue', null]]) {
    const out = {};
    for (const fmt of ['9:16', '16:9']) {
      const png = SYNQUENZER.vv4Pic(3, v, t, fmt), img = new Image(); img.src = 'data:image/png;base64,' + png; await img.decode();
      const c = document.createElement('canvas'); c.width = 108; c.height = 108; const g = c.getContext('2d'); g.drawImage(img, 0, 0, 108, 108);
      const d = g.getImageData(0, 0, 108, 108).data; const cols = new Set(); for (let k = 0; k < d.length; k += 16) cols.add(d[k] >> 4 << 8 | d[k + 1] >> 4 << 4 | d[k + 2] >> 4);
      out[fmt] = {farben: cols.size, len: png.length};
    }
    r[v] = Object.assign(out, {ok: out['9:16'].farben > 3 && out['16:9'].farben > 3});
  }
  const fl = SYNQUENZER.vv4FocusLog(false);
  r.fokusZoom = {z: fl.map(o => o.kind + ':' + o.z), ok: fl.length >= 4 && fl.filter(o => o.kind !== 'tast' || true).every(o => o.z >= 1 && o.z <= 3)};
  // Auto: die Schnittliste und Bild für Bild über das ganze Video (9:16, Kamera)
  const T = SYNQUENZER.vvCamTrace('auto');
  r.auto = {shots: T.shots.map(s => [s.a, s.b, s.v, s.t, s.why, s.f || null]), bilder: T.log.length, ok: T.log.length > 100 && T.shots.some(s => s.f === 'zelle') && T.shots.some(s => s.why === 'ue')};
  // manuell: Takt 5–6 → Tastatur, im Video genau dort das Tastatur-Bild
  SYNQUENZER.vvDirSet(4, 6, 'tast'); await SYNQUENZER.vvRender({});
  const T2 = SYNQUENZER.vvCamTrace('auto'), sh = T2.shots.find(s => s.a === 4);
  r.manuell = {shot: sh, ok: !!sh && sh.v === 'tast' && sh.b === 6 && T2.log.filter(e => e.v === 'tast').length > 0};
  r.leer = {len: blank.length};
  return r;
});
res.errs = errs; res.ok = Object.values(res).every(x => !x || x.ok !== false) && !errs.length;
fs.mkdirSync(OUT, {recursive: true}); fs.writeFileSync(OUT + '/vv4-bild.json', JSON.stringify(res, null, 1));
for (const k of Object.keys(res)) if (res[k] && res[k].ok !== undefined) console.log(k, res[k].ok ? 'OK' : 'FEHLER ' + JSON.stringify(res[k]).slice(0, 700));
console.log('Konsolenfehler', errs.length, JSON.stringify(errs).slice(0, 300), 'GESAMT', res.ok ? 'GRÜN' : 'ROT');
await b.close();
