// G9B T3: Regel 28 als Differenz-Test – dieselbe Bedienung in der Basis (4.26.0, basis.html) und in G9B (4.26.2):
// VS5a-Marken (Worker), VS5b-Songtext, Marken setzen/verschieben/löschen OHNE ly, Quantisieren/Dehnen (Klang-Prüfsumme),
// Projekt-JSON (Zeichen für Zeichen nach Ersetzen der Zufalls-IDs), Laden + Speichern eines alten Projekts
import {launch, open, clickTake, mkTake, sleep, report} from './h.mjs';
import path from 'path'; import fs from 'fs';
const ok = report(), br = await launch();
async function run(p) {
  await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
  const a = await clickTake(p, Array.from({length: 14}, (_, k) => .3 + k * .23 + (k % 3) * .02), 4, 0);
  const b = await mkTake(p, [0.5, 0.75, 1.0, 1.5, 1.75, 2.25, 2.5, 3.0], 4, 1);
  const out = {ma: a.marks, mb: b.marks};
  await p.evaluate(id => SYNQUENZER.wpLyrics(id, 'Lie-be ist ein Feu-er in mir'), b.id);
  out.lyr = await p.evaluate(id => SYNQUENZER.wpLyr(id), b.id);
  await p.evaluate(([id, t]) => SYNQUENZER.wpMark(id, 'add', t), [b.id, 1.25]);
  await p.evaluate(([id, t]) => SYNQUENZER.wpMark(id, 'move', 2, t), [b.id, b.marks[2].t + .03]);
  await p.evaluate(id => SYNQUENZER.wpMark(id, 'del', 4), b.id);
  out.lyr2 = await p.evaluate(id => SYNQUENZER.wpLyr(id), b.id);
  await p.evaluate(r => SYNQUENZER.wpQuantize(r, {grid: '1/16'}), a.ref);
  const pa = await p.evaluate(id => SYNQUENZER.wpPlayed(id), a.id);
  await p.evaluate(r => SYNQUENZER.wpQuantize(r, {grid: '1/16'}), b.ref); await p.evaluate(id => SYNQUENZER.wpMode(id, 'stretch'), b.id);
  const pb = await p.evaluate(id => SYNQUENZER.wpPlayed(id), b.id);
  const h = d => { let x = 0x811c9dc5; for (const v of d) { x ^= Math.round(v * 1e7) | 0; x = Math.imul(x, 0x01000193) >>> 0; } return x; };
  out.ha = pa && h(pa.data); out.hb = pb && h(pb.data); out.na = pa && pa.n; out.nb = pb && pb.n;
  // Projekt: IDs durch Nummern ersetzen
  let js = JSON.stringify(await p.evaluate(() => SYNQUENZER.project()));
  [a.id, b.id].forEach((id, i) => { js = js.split(id).join('#T' + i); });
  out.proj = js.replace(/"name":"Projekt · [^"]*"/, '"name":0').replace(/"(created|at|saved|t)":\s*"?\d{10,}[^,}]*/g, '"$1":0').replace(/"(id|uid)":"[^"]+"/g, '"$1":0');
  out.undo = await p.evaluate(() => SYNQUENZER.undoInfo().n);
  return out;
}
const A = await open(br, {}); const ga = await run(A.p);
const B0 = await open(br, {page: 'basis.html'}); const gb = await run(B0.p);
for (const k of ['ma', 'mb', 'lyr', 'lyr2', 'ha', 'hb', 'na', 'nb', 'undo']) ok(JSON.stringify(ga[k]) === JSON.stringify(gb[k]), 'Regel 28 gleich wie Basis: ' + k + (k[0] === 'h' ? ' (' + ga[k] + ')' : ''));
ok(ga.proj === gb.proj, 'Projekt-JSON Zeichen für Zeichen gleich wie Basis (' + ga.proj.length + ' Zeichen)');
if (ga.proj !== gb.proj) { let i = 0; while (ga.proj[i] === gb.proj[i]) i++; console.log("   ab", i, JSON.stringify(ga.proj.slice(Math.max(0, i - 60), i + 60)), "\n   ", JSON.stringify(gb.proj.slice(Math.max(0, i - 60), i + 60))); }
// altes Projekt (Basis gespeichert) in G9B laden + speichern → gleich
const old = await A.p.evaluate(() => JSON.stringify(SYNQUENZER.project()));
const G = await open(br, {});
const imp = async pg => pg.evaluate(async t => { importJSON(t); await new Promise(r => setTimeout(r, 400)); return JSON.stringify(SYNQUENZER.project()); }, old);
const back = await imp(G.p);
const Bp = await open(br, {page: 'basis.html'});
const backB = await imp(Bp.p);
ok(back === backB, 'G9-50 Basis-Projekt laden + speichern: G9B Zeichen für Zeichen gleich wie die Basis selbst (' + back.length + ' Zeichen)');
ok(A.errs.length === 0 && G.errs.length === 0, 'keine Konsolen-Fehler ' + A.errs.concat(G.errs).join('|'));
const f = ok.done(); await br.close(); process.exit(f ? 1 : 0);
