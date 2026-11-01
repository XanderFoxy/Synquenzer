// SX9 Abnahme (schlank): Versionen eines Clips — Zell-Blatt ≥ 44 px (428×926 und 926×428, Touch), ＋ / Tipp / [Überall v2],
// Schild auf der Zelle, Editor-Kopf, 1 Undo je Geste, Phase bleibt, Kopieren ohne zweites v2, Speichern/Laden, MIDI.
// Aufruf: APP=/pfad/index.html node sx9-abnahme.mjs  (playwright muss auflösbar sein)
import { chromium } from 'playwright';
const APP = process.env.APP || new URL('../index.html', import.meta.url).pathname, OUT = process.env.OUT || '.';
const SONG = {bars: 16, lanes: [[{bar: 0, slot: 0}], [{bar: 0, slot: 0}], [], [], [{bar: 0, slot: 0}], []], carrier: [], mel: {},
  marks: [{id: 'm1', a: 0, len: 4, name: 'Strophe'}, {id: 'm2', a: 4, len: 4, name: 'Refrain'}, {id: 'm3', a: 8, len: 4, name: 'Strophe'}, {id: 'm4', a: 12, len: 4, name: 'Refrain'}]};
const res = {}, fail = [];
const ok = (k, c, info) => { res[k] = c ? 'ok' : ['FEHLER', info]; if (!c) fail.push(k); };
async function open(w, h) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const p = await b.newPage({viewport: {width: w, height: h}, deviceScaleFactor: 2, hasTouch: true, isMobile: true});
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + APP); await p.waitForTimeout(1500);
  await p.evaluate(s => { SYNQUENZER.setSong(s); setSongView(true); }, SONG); await p.waitForTimeout(300);
  return {b, p, errs};
}
const small = p => p.evaluate(() => [...document.querySelectorAll('.pop .sx9-v, .pop button[data-a^="sx9"]')].map(e => { const q = e.getBoundingClientRect(); return {t: e.textContent.trim() || e.getAttribute('aria-label'), w: q.width, h: q.height, in: q.right <= innerWidth + .5 && q.bottom <= innerHeight + .5 && q.top >= -.5}; }));
const state = p => p.evaluate(() => ({vers: sx9List(S.song, 1, 0), at: Array.from({length: 16}, (_, x) => { const h = sx9At(S.song, 1, x); return h ? h.v : 0; }),
  cs: Array.from({length: 16}, (_, x) => +(((x * 4 - laneOriginAt(S.song.lanes[1], x).cs) % (S.tracks[1].clips[0].len * 4)) + 0).toFixed(3)), undo: UNDO.length}));

{ // Hochformat 428×926: der ganze Ablauf
  const {b, p, errs} = await open(428, 926);
  const s0 = await state(p);
  await p.evaluate(() => openCellSheet(1, 13)); await p.waitForTimeout(300);
  const m1 = await small(p); ok('P-Zeile v1 ＋ ≥ 44', m1.length === 2 && m1.every(x => x.w >= 43.5 && x.h >= 43.5 && x.in), m1);
  await p.screenshot({path: OUT + '/sx9-P-blatt.png'});
  await p.tap('.pop .sx9-add'); await p.waitForTimeout(500);
  const s1 = await state(p);
  ok('＋ = v2 im zweiten Refrain, 1 Undo', s1.vers.length === 1 && s1.vers[0].v === 2 && s1.at.join('') === '1111111111112222' && s1.undo === s0.undo + 1, s1);
  ok('Phase bleibt (wie Szenen-Clip)', JSON.stringify(s1.cs) === JSON.stringify(s0.cs), [s0.cs, s1.cs]);
  const head = await p.evaluate(() => { const e = document.querySelector('#rollSheet.open .sh-title'); return e ? e.textContent : null; });
  ok('Editor-Kopf zeigt v2', /Szene 1\s*v2/.test(head || ''), head);
  await p.screenshot({path: OUT + '/sx9-P-editor.png'});
  // v2 hörbar anders: alle Noten auf 100 (wie eine Bearbeitung in ROLLE: 1 Undo 'own')
  await p.evaluate(() => { const id = sx9List(S.song, 1, 0)[0].id, m = ownModel(1, id); m.begin(); for (const n of S.song.own[id].notes) n.n = 100; m.end(true, 'Test'); closeRoll(); });
  await p.waitForTimeout(250);
  const orig = await p.evaluate(() => S.tracks[1].clips[0].notes.some(n => n.n === 100));
  ok('Original v1 unverändert', !orig);
  // Refrain 1: Tipp auf v2
  await p.evaluate(() => openCellSheet(1, 5)); await p.waitForTimeout(300);
  const m2 = await small(p); ok('P-Zeile v1 v2 ＋ Überall ≥ 44', m2.length === 4 && m2.every(x => x.w >= 43.5 && x.h >= 43.5 && x.in), m2);
  const u0 = (await state(p)).undo;
  await p.tap('.pop .sx9-v[data-a="sx9v"]:nth-of-type(2)'); await p.waitForTimeout(400);
  const s2 = await state(p);
  ok('Tipp v2 setzt nur Refrain 1, 1 Undo', s2.at.join('') === '1111222211112222' && s2.undo === u0 + 1, s2);
  await p.screenshot({path: OUT + '/sx9-P-kaestchen.png'});
  await p.evaluate(() => { songViewMode('glass'); UI.dirty.song = true; }); await p.waitForTimeout(400);
  const geo = await p.evaluate(() => SV.tileGeo.filter(g => g.t === 1).map(g => [g.a, g.b, g.ver || 1]));
  ok('Schild v2 auf den Zellen', geo.some(g => g[0] >= 4 && g[1] <= 8 && g[2] === 2) && geo.some(g => g[0] < 4 && g[2] === 1), geo);
  await p.screenshot({path: OUT + '/sx9-P-glas.png'});
  await p.evaluate(() => songViewMode('squares'));
  await p.evaluate(() => songViewMode('squares'));
  await p.evaluate(() => undo()); await p.waitForTimeout(200);
  ok('Undo nimmt genau die Geste zurück', (await state(p)).at.join('') === '1111111111112222');
  await p.evaluate(() => redo()); await p.waitForTimeout(200);
  // Überall v2
  await p.evaluate(() => openCellSheet(1, 13)); await p.waitForTimeout(300);
  await p.tap('.pop button[data-a="sx9all"]'); await p.waitForTimeout(400);
  const s3 = await state(p); ok('[Überall v2]', s3.at.join('') === '2222222222222222' && JSON.stringify(s3.cs) === JSON.stringify(s0.cs), s3);
  // Überall v1 zurück, dann Refrain 2 wieder v2 – Kopie des Refrains (Marke ⧉) macht kein zweites v2
  await p.evaluate(() => { sx9PickAll(1, 0, null); sx9Pick(1, 13, sx9List(S.song, 1, 0)[0].id); markAction(S.song.marks[3].id, 'copy', 16); });
  const s4 = await p.evaluate(() => ({vers: sx9List(S.song, 1, 0).length, bars: S.song.bars, at: Array.from({length: S.song.bars}, (_, x) => { const h = sx9At(S.song, 1, x); return h ? h.v : 0; }).join('')}));
  ok('Kopie behält dieselbe v2', s4.vers === 1 && s4.at === '11111111111122222222', s4);
  // Speichern/Laden: Version und Verweise bleiben
  const rt = await p.evaluate(() => { const a = JSON.stringify(S.song), n = normSong(JSON.parse(a), S.key, NT()); return {same: JSON.stringify(n.own) === JSON.stringify(S.song.own) && JSON.stringify(n.lanes) === JSON.stringify(S.song.lanes), ver: Object.values(n.own).map(c => c.ver)}; });
  ok('Speichern/Laden', rt.same && rt.ver.includes(2), rt);
  // MIDI nimmt v2 (Ton 100 nur in v2)
  const midi = await p.evaluate(() => { const r = buildMidiSong(false), u = r && (r.bytes || r.data || r); const a = Array.from(u instanceof Uint8Array ? u : new Uint8Array(u.buffer || u)); let n = 0; for (let i = 0; i < a.length - 2; i++) if ((a[i] & 0xf0) === 0x90 && a[i + 1] === 100 && a[i + 2] > 0) n++; return n; });
  ok('MIDI-Export nimmt v2', midi > 0, midi);
  ok('keine Fehler (Hochformat)', !errs.length, errs);
  await b.close();
}
{ // Querformat 926×428: Blatt mit v1 v2 ＋ Überall
  const {b, p, errs} = await open(926, 428);
  await p.evaluate(() => { sx9Add(1, 13); }); await p.waitForTimeout(200);
  await p.evaluate(() => openCellSheet(1, 13)); await p.waitForTimeout(300);
  const m = await small(p); ok('L-Zeile ≥ 44 und im Bild', m.length === 4 && m.every(x => x.w >= 43.5 && x.h >= 43.5 && x.in), m);
  await p.screenshot({path: OUT + '/sx9-L-blatt.png'});
  ok('keine Fehler (Querformat)', !errs.length, errs);
  await b.close();
}
console.log(JSON.stringify(res, null, 1)); console.log(fail.length ? 'FEHLER: ' + fail.join(', ') : 'ALLES OK');
process.exit(fail.length ? 1 : 0);
