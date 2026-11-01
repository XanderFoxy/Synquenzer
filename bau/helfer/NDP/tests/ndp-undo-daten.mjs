// Instrument-Wahl (Kopf-Knopf, echter Touch): alle Pads Quelle North mit Rollen-Programm, ein Undo; jede Geste ein Undo, Redo, Anzeige folgt;
// Speichern/Laden deep-equal (Datei + Speicher nach Neuladen); keine zweite Datenhaltung; Bibliothek (eigenes Programm im PROG-Rad);
// alte Projekte Zeichen für Zeichen gleich gegen R-4300; Offline-Render bitgleich gegen R-4300
import {launch, open, info, tap, ctr, drag, md, report, BASE, FILE} from './ndp-lib.mjs';
const b = await launch(), rows = [];
const drumJ = p => p.evaluate(() => JSON.stringify(SYNQUENZER.project().tracks[4].sound));
let p = await open(b, 'H');
await p.evaluate(() => { SYNQUENZER.selectTrack(4); SYNQUENZER.openEditor(); }); await p.waitForTimeout(200);
const s0 = await drumJ(p), u0 = await p.evaluate(() => SYNQUENZER.gestures().undo);
const hk = await p.evaluate(() => { const r = document.querySelector('#drumSheet .ndpk').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
await tap(p, ...hk); await p.waitForTimeout(400);
const sw = await p.evaluate(() => DRUM_VOICES.map(v => { const s = SYNQUENZER.project().tracks[4].sound.p.slots[v.id].md, r = MDX.roleProg(v.id), f = r ? MDN.fromSpec(r) : MDN.init();
  return {id: v.id, src: s.src, ok: Object.keys(f).filter(k => k !== 'mMono' && k !== 'mCrv').every(k => s[k] === f[k])}; }));
rows.push({n: 'Instrument-Wahl North: alle 12 Pads Quelle North', ok: sw.every(x => x.src === 'md'), d: sw.filter(x => x.src !== 'md').map(x => x.id).join(',')});
rows.push({n: 'Instrument-Wahl North: jedes Pad = Programm seiner Rolle (MDX.roleProg)', ok: sw.every(x => x.ok), d: sw.filter(x => !x.ok).map(x => x.id).join(',')});
rows.push({n: 'Instrument-Wahl = ein Undo', ok: (await p.evaluate(() => SYNQUENZER.gestures().undo)) === u0 + 1});
rows.push({n: 'Platte nach der Wahl offen', ok: (await info(p)).open});
await p.evaluate(() => undo()); await p.waitForTimeout(150);
rows.push({n: 'Undo der Wahl: Drum-Sound deep-equal wie vorher', ok: (await drumJ(p)) === s0});
await p.evaluate(() => redo()); await p.waitForTimeout(150);
// jede Geste ein Undo; Anzeige folgt dem Undo
let I = await info(p); const kd = I.knobs.find(k => k.key === 'mDec');
const v0 = (await md(p, 'kick')).mDec, ub = await p.evaluate(() => SYNQUENZER.gestures().undo);
await drag(p, ...ctr(kd), -60); const v1 = (await md(p, 'kick')).mDec;
const ua = await p.evaluate(() => SYNQUENZER.gestures().undo);
rows.push({n: 'Regler-Geste = genau ein Undo', ok: v1 !== v0 && ua === ub + 1, d: v0 + '→' + v1});
const undoBtn = (await info(p)).hits.find(h => h.a === 'ndpu'); await tap(p, ...ctr(undoBtn)); await p.waitForTimeout(150);
I = await info(p);
rows.push({n: '↶ der Platte: Wert zurück, Regler und Display folgen', ok: (await md(p, 'kick')).mDec === v0 && I.knobs.find(k => k.key === 'mDec').val === v0 && I.seg.trim() === String(v0), d: 'seg ' + I.seg});
const redoBtn = I.hits.find(h => h.a === 'ndpr'); await tap(p, ...ctr(redoBtn)); await p.waitForTimeout(150);
rows.push({n: '↷ der Platte: Wert wieder da', ok: (await md(p, 'kick')).mDec === v1});
const hc = await p.evaluate(() => (typeof historyCheck === 'function' ? historyCheck() : true));
rows.push({n: 'historyCheck() = true', ok: hc === true});
// ALLE KANÄLE: ein Zug = alle Kanäle gleich, ein Undo
await tap(p, ...ctr((await info(p)).hits.find(h => h.a === 'all'))); await p.waitForTimeout(60);
I = await info(p); const ub2 = await p.evaluate(() => SYNQUENZER.gestures().undo);
await drag(p, ...ctr(I.knobs.find(k => k.key === 'mDec')), -40);
const decs = await p.evaluate(() => DRUM_VOICES.map(v => SYNQUENZER.project().tracks[4].sound.p.slots[v.id].md.mDec));
rows.push({n: 'ALLE KANÄLE: DECAY auf allen 12 gleich, ein Undo', ok: decs.every(x => x === decs[0]) && (await p.evaluate(() => SYNQUENZER.gestures().undo)) === ub2 + 1, d: decs.join(',')});
await tap(p, ...ctr((await info(p)).hits.find(h => h.a === 'all'))); await p.waitForTimeout(60);
// keine zweite Datenhaltung: Plattenzustand ist nicht im Projekt
const pj = await p.evaluate(() => SYNQUENZER.serialize());
rows.push({n: 'keine eigenen Felder im Projekt (ndp, Platte, SCL)', ok: !/ndp|"scl"|Platte/.test(pj)});
// Speichern/Laden deep-equal (Datei)
const f1 = await p.evaluate(() => SYNQUENZER.serialize());
await p.evaluate(j => SYNQUENZER.importJSON(j), f1); await p.waitForTimeout(400);
const f2 = await p.evaluate(() => SYNQUENZER.serialize());
const strip = s => { const o = JSON.parse(s); delete o.savedAt; delete o.id; return JSON.stringify(o.project ? o.project.tracks : o.tracks); };
rows.push({n: 'Datei speichern → laden: deep-equal', ok: strip(f1) === strip(f2)});
// Speicher nach Neuladen
const pr1 = await p.evaluate(() => JSON.stringify(SYNQUENZER.project().tracks[4].sound));
await p.evaluate(() => SYNQUENZER.save()); await p.waitForTimeout(500);
await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 30000}); await p.waitForTimeout(500);
const pr2 = await p.evaluate(() => JSON.stringify(SYNQUENZER.project().tracks[4].sound));
rows.push({n: 'Speichern → Neuladen: Drum-Sound deep-equal', ok: pr1 === pr2});
// Bibliothek: eigenes Programm sichern, im PROG-Rad wählbar
await p.evaluate(async () => { SYNQUENZER.selectTrack(4); SYNQUENZER.openEditor(); SYNQUENZER.ndpOpen(); await mdLibSave('kick', 'NDP Test', 'bd'); });
await p.waitForTimeout(200);
const inList = await p.evaluate(() => mdLibList().some(u => u.name === 'NDP Test'));
rows.push({n: 'Bibliothek: eigenes Programm gesichert, in der Programm-Liste', ok: inList});
await p.ctx.close();
// alte Projekte Zeichen für Zeichen gleich, Renders bitgleich: R-4300 gegen NDP
const hash = `(async () => { const out = []; const H = a => { let h = 2166136261 >>> 0; const u = new Uint32Array(a.buffer, a.byteOffset, a.length); for (let i = 0; i < u.length; i++) { h ^= u[i]; h = Math.imul(h, 16777619) >>> 0; } return h; };
  const walk = x => { if (!x) return; if (x instanceof Float32Array) out.push(H(x)); else if (x instanceof AudioBuffer) { for (let c = 0; c < x.numberOfChannels; c++) out.push(H(x.getChannelData(c))); } else if (Array.isArray(x)) x.forEach(walk); else if (typeof x === 'object') Object.values(x).forEach(walk); };
  SYNQUENZER.setPadSource('kick', 'md'); SYNQUENZER.setPadSource('snare', 'md'); SYNQUENZER.setPadSource('hatC', 'md');
  const r = await SYNQUENZER.mdRender([[0, 'kick', .9], [.25, 'snare', .7], [.5, 'hatC', .5], [.75, 'kick', 1, 1]], {sec: 1.5}); walk(r); return out.join(','); })()`;
const res = {};
let fix0 = null, fix1 = null;
for (const [tag, file] of [['base', BASE], ['ndp', FILE]]) {
  p = await open(b, 'H', {file});
  if (!fix0) { fix0 = await p.evaluate(() => SYNQUENZER.serialize()); }
  // dieselbe Datei (ohne und mit North-Pads) in beide Fassungen laden und wieder speichern
  await p.evaluate(j => SYNQUENZER.importJSON(j), fix0); await p.waitForTimeout(300);
  const demo = await p.evaluate(() => SYNQUENZER.serialize());
  const r = await p.evaluate(hash);
  if (!fix1) fix1 = await p.evaluate(() => SYNQUENZER.serialize());
  await p.evaluate(j => SYNQUENZER.importJSON(j), fix1); await p.waitForTimeout(300);
  const withMd = await p.evaluate(() => SYNQUENZER.serialize());
  const loud = await p.evaluate(async () => { const r = await SYNQUENZER.mdRender([[0, 'kick', .9]], {sec: .5}); let m = 0; const w = x => { if (x instanceof Float32Array) { for (const v of x) m = Math.max(m, Math.abs(v)); } else if (x instanceof AudioBuffer) { for (let c = 0; c < x.numberOfChannels; c++) w(x.getChannelData(c)); } else if (x && typeof x === 'object') Object.values(x).forEach(w); }; w(r); return m; });
  res[tag] = {demo, r, withMd, loud}; await p.ctx.close();
}
const norm = s => s;
rows.push({n: 'Datei ohne North-Pads: laden → speichern Zeichen für Zeichen gleich wie R-4300', ok: norm(res.base.demo) === norm(res.ndp.demo) && res.ndp.demo === fix0, d: res.base.demo.length + ' / ' + res.ndp.demo.length});
rows.push({n: 'Datei mit North-Pads: laden → speichern Zeichen für Zeichen gleich wie R-4300', ok: norm(res.base.withMd) === norm(res.ndp.withMd) && res.ndp.withMd === fix1});
rows.push({n: 'Render nicht stumm (Spitze ' + res.ndp.loud.toFixed(3) + ')', ok: res.ndp.loud > .01});
rows.push({n: 'Offline-Render North bitgleich zu R-4300', ok: !!res.base.r && res.base.r === res.ndp.r, d: res.ndp.r.slice(0, 40)});
await b.close();
process.exit(report(rows) ? 0 : 1);
