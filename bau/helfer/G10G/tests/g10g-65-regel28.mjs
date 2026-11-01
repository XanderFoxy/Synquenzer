// G10-65 (M-G28): alte Takes ohne v → Render bitgleich; alte Projekte laden/speichern Zeichen für Zeichen gleich; Tonart-Erkennung und
// Leitern (Harmony.SCALES, KeyDetect) anderer Spuren unverändert. Vergleich gegen die Basis R-4300 (4.30.0) im selben Browser.
import {launch, open, voice, sleep, ok, done, hash, BASE, APP} from './lib.mjs';
const br = await launch();
const B = await open(br, 428, 926, BASE), N = await open(br, 428, 926, APP);
const mel = [64.4, 65.6, 67.3, 62.6, 60.4, 64.7, 69.5].map(m => ({m, d: 0.3})), V = voice(mel);
async function oldTake(p) {   // Take einspielen und in der Basis-Logik quantisieren + eine Note verschieben (alte Felder)
  const r = await p.evaluate(pcm => SYNQUENZER.tkInject({pcm, sr: 48000, scene: 1, len: 3}), V.pcm), ref = {t: r.track, s: 1};
  await p.evaluate(ref => SYNQUENZER.g2Analyse(ref), ref);
  return {ref, id: r.id};
}
// 1) Basis erzeugt einen „alten“ Take mit Tonhöhe (Hart 80 %, Note 3 +2) und speichert
const TB = await oldTake(B);
await B.evaluate(r => SYNQUENZER.g2Quantize(r, {q: true, mode: 'hard', str: 0.8}), TB.ref);
await B.evaluate(r => SYNQUENZER.g2Note(r, 'shift', 3, 2), TB.ref);
const PB = await B.evaluate(id => S.takes[id].pitch, TB.id);
ok(PB && !('v' in PB) && !('src' in PB.key) && PB.notes.every(n => !('nq' in n)), 'Basis-Take hat nur alte Felder: ' + JSON.stringify(Object.keys(PB)) + ' key ' + JSON.stringify(PB.key));
const JB = await B.evaluate(() => SYNQUENZER.serialize());
// 2) Laden/Speichern: dieselbe Datei in beiden Fassungen geladen und wieder gespeichert → Zeichen für Zeichen gleich
const rtB = await B.evaluate(j => { SYNQUENZER.importJSON(j); return SYNQUENZER.serialize(); }, JB); await sleep(300);
const rtN = await N.evaluate(j => { SYNQUENZER.importJSON(j); return SYNQUENZER.serialize(); }, JB); await sleep(300);
const canon = x => Array.isArray(x) ? x.map(canon) : x && typeof x === 'object' ? Object.keys(x).sort().reduce((o, k) => (o[k] = canon(x[k]), o), {}) : x;
const tkOf = j => { const o = JSON.parse(j), q = o.project || o; return JSON.stringify(canon(q.takes)); };
ok(rtN === rtB, `Projekt laden + speichern: G10g = 4.30.0 Zeichen für Zeichen (${rtN.length} Zeichen)`);
ok(tkOf(rtN) === tkOf(JB), 'takes-Teil inhaltlich gleich der gespeicherten Datei (Feld-Reihenfolge ordnet schon 4.30.0 beim Laden um)');
// 3) Render bitgleich: derselbe Take (gleiche Proben) mit der alten Tonhöhe in beiden Fassungen
await N.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(200);
await B.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(200);
const T1 = await oldTake(B), T2 = await oldTake(N);
for (const [p, T] of [[B, T1], [N, T2]]) await p.evaluate(([id, P]) => { S.takes[id].pitch = JSON.parse(JSON.stringify(P)); g2After(id); }, [T.id, PB]);
const hB = await B.evaluate(r => SYNQUENZER.g2Played(r), T1.ref), hN = await N.evaluate(r => SYNQUENZER.g2Played(r), T2.ref);
ok(hB && hN && !hB.raw && hash(hB.data) === hash(hN.data), `Render alter Take: ${hash(hB.data)} (4.30.0) = ${hash(hN.data)} (G10g)`);
const planB = await B.evaluate(id => JSON.stringify(g2Plan(id)), T1.id), planN = await N.evaluate(id => JSON.stringify(g2Plan(id)), T2.id);
ok(planB === planN, 'Plan an den Kern gleich (keine v/rt, gleiche Ziele)');
const kB = await B.evaluate(id => G2P.planKey(g2Plan(id)), T1.id), kN = await N.evaluate(id => G2P.planKey(g2Plan(id)), T2.id);
ok(kB === kN, `Render-Cache-Schlüssel gleich (${kB})`);
// 4) Editor öffnen, zeichnen, schließen ändert am alten Take nichts (kein Undo, kein Feld); Chip sagt „fest“
const st0 = await N.evaluate(() => [JSON.stringify(S.takes), UNDO.length]);
await N.evaluate(r => SYNQUENZER.g2Open(r), T2.ref); await sleep(400);
const chip = await N.evaluate(() => document.querySelector('#wpSheet .g10g-kc').textContent);
await N.evaluate(() => SYNQUENZER.g2Close()); await sleep(100);
const st1 = await N.evaluate(() => [JSON.stringify(S.takes), UNDO.length]);
ok(st0[0] === st1[0] && st0[1] === st1[1], 'alter Take: Editor öffnen/schließen ändert nichts');
ok(/fest/.test(chip), `alter Take: Tonart bleibt eingefroren, Chip „${chip}“`);
// 5) Weich/Hart erneut auf dem alten Take: Tonart bleibt die eingefrorene (kein Neu-Lesen ohne src)
await N.evaluate(() => { S.key = {root: 2, scale: 'dorian'}; });
await N.evaluate(r => SYNQUENZER.g2Quantize(r, {q: true, mode: 'soft', str: 1}), T2.ref);
const kk = await N.evaluate(id => S.takes[id].pitch.key, T2.id);
ok(JSON.stringify(kk) === JSON.stringify(PB.key), `Weich auf altem Take: key bleibt ${JSON.stringify(kk)} (Projekt-Tonart inzwischen D Dorisch)`);
// 6) Tonart-Erkennung und Leitern anderer Spuren unverändert
const probe = () => { const sets = [[60, 64, 67, 72, 67, 64], [57, 60, 64, 69, 64, 60, 57], [62, 65, 69, 72, 71, 69, 65, 62], [55, 59, 62, 65, 67, 71], [61, 64, 68, 71, 73]];
  return JSON.stringify({H: Harmony.SCALES, K: KeyDetect.SCALES, d: sets.map(s => KeyDetect.detectKey(s.map((n, i) => ({t: i * .5, d: .5, n, v: .8})), {fallback: {root: 0, scale: 'ionian'}})), api: sets.map(s => SYNQUENZER.detectKey(s.map((n, i) => ({t: i * .5, d: .5, n, v: .8}))))}); };
const pB = await B.evaluate(probe), pN = await N.evaluate(probe);
ok(pB === pN, 'Harmony.SCALES, KeyDetect.SCALES und detectKey (5 Proben) gleich wie 4.30.0');
const scB = await B.evaluate(() => { SYNQUENZER.setClip(0, 1, {len: 2, notes: [{t: 0, d: 1, n: 57, v: .8}, {t: 1, d: 1, n: 60, v: .8}, {t: 2, d: 1, n: 64, v: .8}, {t: 3, d: 1, n: 62, v: .8}]}); return JSON.stringify(sceneKeyOf(1)); });
const scN = await N.evaluate(() => { SYNQUENZER.setClip(0, 1, {len: 2, notes: [{t: 0, d: 1, n: 57, v: .8}, {t: 1, d: 1, n: 60, v: .8}, {t: 2, d: 1, n: 64, v: .8}, {t: 3, d: 1, n: 62, v: .8}]}); return JSON.stringify(sceneKeyOf(1)); });
ok(scB === scN, `Szenen-Tonart gleich: ${scN}`);
ok(!B.errs.length && !N.errs.length, 'Konsole sauber ' + JSON.stringify(B.errs.concat(N.errs).slice(0, 2)));
await br.close(); done();
