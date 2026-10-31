// G9U T5: alte Projekte (G9-50), Regeln (Marken, Version, CLOUD, MS 2000, kein Supabase), Blätter [Ganzer Text] / [Erkennen], Start lädt nichts
import {launch, open, clickTake, sleep, report, deq, U, V, LY, SET, DIR} from './h.mjs';
import fs from 'fs'; import path from 'path';
const ok = report(), br = await launch();
const ROOT = path.resolve(DIR, '../../../..'), BASE = path.join(ROOT, 'bau/snapshots/stage-ges2.html'), APP = path.join(DIR, '../index.html');
const T = Array.from({length: 16}, (_, k) => 0.3 + k * 0.22);
// ---------- G9-50: Projekt aus dem Vorgänger (VS5b-lyrics und ohne) → Laden + Speichern Zeichen für Zeichen gleich ----------
let J0;
{ const ctx = await br.newContext({viewport: {width: 428, height: 926}}), p = await ctx.newPage();
  await p.goto('file://' + BASE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version); await sleep(300);
  await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(200);
  const a = await clickTake(p, T, 4, 0), b = await clickTake(p, T.slice(0, 8), 2.2, 1);
  await p.evaluate(id => SYNQUENZER.wpLyrics(id, 'Lie-be ist ein Feu-er in mir so hell und heiß da drau-ßen'), a.id);
  J0 = await p.evaluate(() => SYNQUENZER.serialize()); await ctx.close(); }
const {p, errs, reqs} = await open(br);
ok(!reqs.some(u => /vendor\/g9|sq-g9|transformers|onnx/i.test(u)) && !(await p.evaluate(() => G9.loaded)), 'Start: Block sq-g9-src nicht ausgewertet, kein Abruf unter vendor/g9/');
await p.evaluate(j => SYNQUENZER.importJSON(j), J0); await sleep(400);
const J1 = await p.evaluate(() => SYNQUENZER.serialize());
const strip = j => { const o = JSON.parse(j).project; return JSON.stringify(o.takes) + '|' + JSON.stringify(o.tracks) + '|' + JSON.stringify(o.song); };
const TK = j => JSON.parse(j).project.takes;
ok(strip(J1) === strip(J0) && TK(J1) && Object.keys(TK(J1)).length === 2, 'G9-50 Vorgänger-Projekt (mit und ohne VS5b-Text) → Laden + Speichern: Takes und Spuren Zeichen für Zeichen gleich');
ok(!(await p.evaluate(() => G9.loaded)), 'G9-50 ohne Bedienung wird nichts umgewandelt (Block nicht geladen, kein ly)');
// den Take mit Text in Szene 0 öffnen; dafür die Marken erkennen (Audio fehlt nach importJSON in dieser Seite → neu einspielen)
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(200);
const tk = await clickTake(p, T, 4, 0), id = tk.id;
await p.evaluate(id => SYNQUENZER.wpLyrics(id, 'Lie-be ist ein Feu-er in mir so hell und heiß da drau-ßen'), id);
await p.evaluate(r => SYNQUENZER.wpOpen(r), tk.ref); await sleep(300);
// Ausgangsbild erst, wenn die Wellenform fertig ist (zwei gleiche Bilder nacheinander; Puffer/Analyse kommen asynchron)
let px0 = null; for (let q = 0; q < 20; q++) { const a = await p.evaluate(() => { wpPaint(); return WP.ed.cv.toDataURL(); }); if (a === px0) break; px0 = a; await sleep(150); }
const g0 = await p.evaluate(() => SYNQUENZER.wpLyrGeom());
await p.evaluate(r => SYNQUENZER.g9Text(r, true), tk.ref); await sleep(200);
const v0 = await V(p, id), g1 = await p.evaluate(() => SYNQUENZER.wpLyrGeom());
{ const wg = await p.evaluate(() => SYNQUENZER.wpGeom()); const same = g1.length === g0.length && g1.every((o, i) => o.text === g0[i].text && (o.k < 0 || Math.abs(o.x + wg.x - wg.marks[o.k]) < .6));
  ok(same, 'G9-50 Text-Modus zeigt den VS5b-Text wie VS5b: gleiche Silben, jede an ihrer Marke (±0,6 px)'); }
ok(deq(v0.cells.slice(0, 16).map(c => c.x.join('')), 'Lie be ist ein Feu er in mir so hell und heiß da drau ßen'.split(' ').concat(['', '']).slice(0, 16).map((x, i) => x)) , 'G9-50 Leiste: eine Silbe je Marke von links (wie VS5b)');
await p.evaluate(() => SYNQUENZER.g9Text(null, false)); await sleep(150);
ok(await p.evaluate(() => { wpPaint(); return WP.ed.cv.toDataURL(); }) === px0, 'G9-50 Marken-Modus nach dem Text-Modus pixelgleich zu vorher (Wellenform mit VS5b-Text)');
ok(!(await LY(p, id)), 'G9-50 Ansehen wandelt nicht um (kein ly)');
const u0 = (await U(p)).n;
await SET(p, id, {op: 'shift', k: 4, d: 1});
let ly = await LY(p, id); const u1 = await U(p);
ok(ly && ly.src === 'vs5b' && ly.s.length === 15 && u1.n === u0 + 1 && u1.top.kind === 'ly', 'G9-50 erste Änderung wandelt in ly um (src „vs5b“, alle 15 Silben, ein Undo) ' + JSON.stringify([ly && ly.src, ly && ly.s.length, u1.n - u0, u1.top]));
ok(/Lie-be ist ein Feu-er/.test((await p.evaluate(id => SYNQUENZER.project().takes[id], id)).lyrics), 'lyrics wird als Klartext mitgeführt');
await p.evaluate(() => SYNQUENZER.undo()); const tb = await p.evaluate(id => SYNQUENZER.project().takes[id], id);
ok(!tb.ly && tb.lyrics === 'Lie-be ist ein Feu-er in mir so hell und heiß da drau-ßen', '↶ → wieder nur VS5b-Text');
// ---------- [Ganzer Text] per Touch ----------
await p.evaluate(r => SYNQUENZER.g9Text(r, true), tk.ref); await sleep(150);
let g = await p.evaluate(() => SYNQUENZER.g9Geom());
await p.touchscreen.tap(g.btn.tx.x + g.btn.tx.w / 2, g.btn.tx.y + 22); await sleep(200);
const pop = await p.evaluate(() => { const t = document.querySelector('.pop.g9txt textarea'); if (!t) return null; const r = t.getBoundingClientRect(); return {v: t.value, h: r.height, lh: parseFloat(getComputedStyle(t).lineHeight), langs: [...document.querySelectorAll('.pop.g9txt .g9lang button')].map(b => b.textContent), ok: !!document.querySelector('.pop.g9txt .g9ok')}; });
ok(pop && pop.v === 'Liebe ist ein Feuer in mir so hell und heiß da draußen' || (pop && /Lie-?be ist/.test(pop.v)), '[Ganzer Text] vorbelegt mit dem vorhandenen Text: „' + (pop && pop.v) + '“');
ok(pop && pop.h >= 5 * pop.lh - 1 && deq(pop.langs, ['Deutsch', 'Englisch', 'Auto']) && pop.ok, '≥ 5 Zeilen sichtbar (' + (pop && pop.h.toFixed(0)) + ' px), Wahl [Deutsch] [Englisch] [Auto], [✓ Verteilen]');
await p.evaluate(() => { document.querySelector('.pop.g9txt textarea').value = 'Ich sing ein Lied\nfür dich allein'; });
const bOk = await p.evaluate(() => { const r = document.querySelector('.pop.g9txt .g9ok').getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; });
await p.touchscreen.tap(bOk.x, bOk.y); await sleep(200);
ly = await LY(p, id); const lineStarts = ly ? ly.s.filter(s => s.w === 2).map(s => s.x) : [];
ok(ly && ly.src === 'eingefuegt' && deq(lineStarts, ['Ich', 'für']) && (await U(p)).top.label === 'Songtext eingefügt', '[✓ Verteilen]: ein Undo „Songtext eingefügt“, Zeilenanfänge w: 2 (' + lineStarts.join(', ') + ')');
// leer + ✓ = Text löschen
await p.evaluate(id => SYNQUENZER.g9Set(id, {op: 'text', text: ''}), id);
const tdel = await p.evaluate(id => SYNQUENZER.project().takes[id], id); ok(!tdel.ly && !tdel.lyrics, 'leer + ✓ löscht ly und lyrics');
await p.evaluate(() => SYNQUENZER.undo());
// ---------- [Erkennen] ----------
g = await p.evaluate(() => SYNQUENZER.g9Geom());
ok(!g.btn.rec, '[Erkennen] ohne angedockte Erkennung ausgeblendet (Stopp-Punkt 1)');
await p.evaluate(() => { G9.rec = {cached: () => true, size: () => ({mb: 78}), recognize: async () => ({lang: 'de', words: [{w: 'Sonne', a: 0.3, b: 0.7}, {w: 'scheint', a: 0.74, b: 1.0, p: .3}]})}; SYNQUENZER.g9Text(null, false); SYNQUENZER.g9Text(null, true); });
await sleep(150); g = await p.evaluate(() => SYNQUENZER.g9Geom());
ok(g.btn.rec && g.btn.rec.w >= 64 && g.btn.rec.h >= 44 - .5, '[Erkennen] mit angedockter Erkennung sichtbar (' + (g.btn.rec && g.btn.rec.w.toFixed(0) + '×' + g.btn.rec.h.toFixed(0)) + ')');
await p.touchscreen.tap(g.btn.rec.x + g.btn.rec.w / 2, g.btn.rec.y + 20); await sleep(200);
const rs = await p.evaluate(() => { const q = document.querySelector('.pop.g9rs'); return q ? q.textContent : null; });
ok(rs && /Lücken füllen/.test(rs) && /Alles ersetzen/.test(rs) && /Sprachmodell auf diesem Gerät: 78 MB/.test(rs) && /Neue Aufnahmen automatisch erkennen/.test(rs), 'Erkennen-Blatt: Lücken füllen / Alles ersetzen, Modell-Zeile, Sprache, Schalter');
const bAll = await p.evaluate(() => { const b = [...document.querySelectorAll('.pop.g9rs button')].find(x => x.textContent === 'Alles ersetzen').getBoundingClientRect(); return {x: b.left + b.width / 2, y: b.top + b.height / 2}; });
await p.touchscreen.tap(bAll.x, bAll.y); await sleep(300);
ly = await LY(p, id);
ok(ly && ly.src === 'erkannt' && ly.s.map(s => s.x).join(' ') === 'Son ne scheint' && (await U(p)).top.label === 'Erkennen', 'Alles ersetzen: erkannte Worte als Silben an den Marken (' + (ly && ly.s.map(s => s.x + '@' + s.t).join(' ')) + ')');
ok(ly.s[2].p === .3, 'unsicheres Wort trägt p (blass in der Leiste)');
// ---------- Regeln ----------
const H = fs.readFileSync(APP, 'utf8'), B = fs.readFileSync(BASE, 'utf8');
ok((H.match(/MS 2000/g) || []).length === 1, '„MS 2000“ genau 1× in der App');
ok(H.includes("\n  live: true,") && (H.match(/^ {2}live: true,.*$/m) || [])[0] === (B.match(/^ {2}live: true,.*$/m) || [])[0], 'CLOUD-Zeile „  live: true,“ unverändert');
ok((H.match(/^const VERSION = .*$/m) || [])[0] === (B.match(/^const VERSION = .*$/m) || [])[0], 'VERSION-Zeile unverändert: ' + (H.match(/^const VERSION = .*$/m) || [])[0]);
// N8-10: Marken in neuen/geänderten Zeilen
const bl = new Set(B.split('\n')), added = H.split('\n').filter(l => !bl.has(l));
const RX = /\b(yamaha|montage|modx|super ?knob|korg|microkorg|wavestate|opsix|modwave|nord(?!en)|kodamo|essencefm|mask ?1(?![0-9])|elektron|digitone|octatrack|machinedrum|serum|vital|bitwig|kilohearts|xfer|procreate|waveshaper|animoog|moog|ableton|logic ?pro|garageband|melodyne|dubler|vochlea|humtap|whisper|openai|hugging ?face)\b/i;
const hits = added.filter(l => RX.test(l));
ok(hits.length === 0, 'N8-10 keine Marken in ' + added.length + ' neuen Zeilen' + (hits.length ? ': ' + hits.map(l => l.slice(0, 80)).join(' | ') : ''));
ok(!added.some(l => /supabase|fetch\(/i.test(l)), 'kein Supabase-/Netz-Aufruf in den neuen Zeilen');
ok(errs.length === 0, 'keine Konsolen-Fehler ' + errs.join(' | '));
process.exitCode = ok.done(); await br.close();
