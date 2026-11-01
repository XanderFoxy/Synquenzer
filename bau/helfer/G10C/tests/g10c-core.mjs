// G10c Kern: feste Nummern, A/B, Löschen + Undo/Redo, Name/Farbe/★ (UI + Speichern/Laden/ZIP), Andere löschen, Aufräumen
import {boot, ok, inject, sheet, R0, labels, touchDrag, pcmBursts} from './lib.mjs';
const {b, p, errs} = await boot({width: 428, height: 926});
const ids = await inject(p, 7);
await sheet(p); await p.waitForTimeout(200);
let L = await labels(p);
ok(JSON.stringify(L) === JSON.stringify(['Take 7', 'Take 6', 'Take 5', 'Take 4', 'Take 3', 'Take 2', 'Take 1']), 'sieben Takes, neu oben: ' + L.join(','));
ok(await p.$eval('.tksheet .g10c-sum', e => e.textContent.startsWith('7 Aufnahmen in Szene 1 · oben = hörbar · neu oben')), 'Kopfzeile „7 Aufnahmen in Szene 1 · oben = hörbar · neu oben“');
const nos0 = (await p.evaluate(() => SYNQUENZER.g10cInfo())).segs.map(s => s.no);
ok(nos0.join() === '7,6,5,4,3,2,1', 'feste Nummern beim Anlegen vergeben (no): ' + nos0.join());
// Take 3 nach oben (Tipp)
await p.tap('.tksheet .g10c-pick[data-k="4"]'); await p.waitForTimeout(150);
L = await labels(p);
ok(L[0] === 'Take 3' && L.slice(1).join() === 'Take 7,Take 6,Take 5,Take 4,Take 2,Take 1', 'Take 3 nach oben: heißt weiter Take 3, alle anderen behalten ihre Nummer');
ok(await p.$eval('.tksheet .g10c-row[data-k="0"] .g10c-st', e => e.textContent === 'hörbar') && await p.$eval('.tksheet .g10c-row[data-k="1"] .g10c-st', e => e.textContent === 'stumm'), 'hörbar/stumm sichtbar');
const audioTop = await p.evaluate(() => { const st = SYNQUENZER.tkInfo().stimme; return S.tracks[st].clips[0].audio.take; });
ok(audioTop === ids[2], 'der hörbare Take ist Take 3 (Audio oben)');
// A/B
await p.tap('.tksheet button[data-a="ab"]'); await p.waitForTimeout(100);
L = await labels(p); ok(L[0] === 'Take 7' && L[1] === 'Take 3', 'A/B tauscht die zwei obersten, Nummern bleiben');
await p.tap('.tksheet button[data-a="ab"]'); await p.waitForTimeout(100);
// Take 3 löschen (✕) → 1,2,4..7 bleiben
const u0 = (await p.evaluate(() => SYNQUENZER.undoInfo())).n;
await p.tap('.tksheet .g10c-row[data-k="0"] .tk-del'); await p.waitForTimeout(150);
L = await labels(p);
ok(L.join() === 'Take 7,Take 6,Take 5,Take 4,Take 2,Take 1', 'Take 3 gelöscht: Nummern bleiben fest (' + L.join(',') + ')');
ok((await p.evaluate(() => SYNQUENZER.undoInfo())).n === u0 + 1, 'Löschen = genau 1 Undo');
ok(await p.$eval('#toast, .toast', e => /Take 3 gelöscht/.test(e.textContent)).catch(() => false), 'Hinweis „Take 3 gelöscht“ mit Rückgängig');
await p.evaluate(() => undo()); await p.waitForTimeout(150);
L = await labels(p); ok(L[0] === 'Take 3' && L.length === 7, 'Undo holt Take 3 zurück (oben, hörbar)');
await p.evaluate(() => redo()); await p.waitForTimeout(150);
L = await labels(p); ok(L.length === 6 && !L.includes('Take 3'), 'Redo löscht ihn wieder');
// neuer Take nach Löschen: nächste Nummer = 8
await inject(p, 1); await sheet(p); await p.waitForTimeout(150);
L = await labels(p); ok(L[0] === 'Take 8', 'neuer Take nach dem Löschen heißt Take 8');
// Bearbeiten über Halten (450 ms)
const bx = await p.$eval('.tksheet .g10c-pick[data-k="2"]', e => { const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
await touchDrag(p, bx[0], bx[1], bx[0], bx[1], 1, 600); await p.waitForTimeout(150);
ok(await p.$('.tksheet .g10c-ed[data-k="2"]') != null, 'Halten öffnet Bearbeiten (Name, Farben, ★, Löschen)');
const t2 = (await labels(p))[2];
ok((await p.evaluate(() => SYNQUENZER.g10cInfo())).segs[0].take !== null && (await labels(p))[0] === 'Take 8', 'Halten hat den Take nicht gewählt');
await p.fill('.tksheet .g10c-name', 'Strophe gut');
await p.tap('.tksheet button[data-a="g10c-edok"]'); await p.waitForTimeout(120);
ok(await p.$eval('.tksheet .g10c-row[data-k="2"] .g10c-nm', e => e.textContent) === 'Strophe gut', 'Name gespeichert und gezeigt (' + t2 + ')');
await p.tap('.tksheet .g10c-row[data-k="2"] button[data-a="g10c-ed"]'); await p.waitForTimeout(80);
await p.tap('.tksheet .g10c-sw[data-v="1"]'); await p.waitForTimeout(80);
await p.tap('.tksheet .g10c-row[data-k="2"] button[data-a="g10c-fav"]'); await p.waitForTimeout(80);
await p.tap('.tksheet .g10c-row[data-k="4"] button[data-a="g10c-ed"]'); await p.waitForTimeout(80);
await p.tap('.tksheet .g10c-sw[data-v="3"]'); await p.waitForTimeout(80);
let info = await p.evaluate(() => SYNQUENZER.g10cInfo());
ok(info.segs[2].name === 'Strophe gut' && info.segs[2].tag === 1 && info.segs[2].fav === true && info.segs[4].tag === 3, 'Name/grün/★ an Take ' + info.nos[2] + ', rot an Take ' + info.nos[4]);
const un = (await p.evaluate(() => SYNQUENZER.undoInfo())).n;
await p.evaluate(() => undo()); info = await p.evaluate(() => SYNQUENZER.g10cInfo());
ok(!info.segs[4].tag, 'Undo nimmt die Farbe zurück'); await p.evaluate(() => redo());
// Felder wandern mit dem Stück: Take mit Name nach oben holen
await p.tap('.tksheet .g10c-pick[data-k="2"]'); await p.waitForTimeout(100);
info = await p.evaluate(() => SYNQUENZER.g10cInfo());
ok(info.segs[0].name === 'Strophe gut' && info.segs[0].fav && info.segs[1].name == null && info.segs.filter(s => s.name === 'Strophe gut').length === 1, 'Name/★ gehören zum Stück (nach oben geholt, kein Rest am alten Platz)');
// Andere Takes löschen (★ bleiben)
await sheet(p); await p.waitForTimeout(100);
const favs = (await p.evaluate(() => SYNQUENZER.g10cInfo())).segs.filter((s, k) => k > 0 && s.fav).length;
await p.evaluate(() => { const r = TK.sheet; const a = tkRef(r).a; a.alt[2].fav = true; });   // noch ein ★ in alt
const u1 = (await p.evaluate(() => SYNQUENZER.undoInfo())).n;
await p.tap('.tksheet button[data-a="g10c-oth"]'); await p.waitForTimeout(150);
info = await p.evaluate(() => SYNQUENZER.g10cInfo());
ok(info.segs.length === 2 && info.segs[0].name === 'Strophe gut' && info.segs[1].fav, 'Andere Takes löschen: hörbarer + ★ bleiben (' + info.nos.join(',') + ')');
ok((await p.evaluate(() => SYNQUENZER.undoInfo())).n === u1 + 1, 'Andere Takes löschen = genau 1 Undo');
// Aufräumen: Größe vorher ±5 % gegen tatsächlich frei
const est = await p.evaluate(() => SYNQUENZER.g10cGcEstimate());
await p.waitForTimeout(100);
const lab = await p.$eval('.tksheet button[data-a="gc"]', e => e.textContent);
ok(est.bytes > 0 && /Aufräumen · \d+ MB/.test(lab), 'Aufräumen zeigt die Größe: ' + lab + ' (' + est.bytes + ' B, ' + est.drop + ' Takes)');
await p.tap('.tksheet button[data-a="gc"]'); await p.waitForTimeout(150);
ok(await p.$('.tksheet .g10c-ask') != null, 'Aufräumen fragt nach (endgültig, Verlauf wird geleert)');
const keysBefore = await p.evaluate(async () => { let n = 0; for (const k of await kv.akeys()) { const b = await kv.aget(k); n += b ? b.byteLength : 0; } return n; });
const res = await p.evaluate(() => SYNQUENZER.g10cGcRun());
const keysAfter = await p.evaluate(async () => { let n = 0; for (const k of await kv.akeys()) { const b = await kv.aget(k); n += b ? b.byteLength : 0; } return n; });
const freed = keysBefore - keysAfter;
ok(Math.abs(freed - est.bytes) <= est.bytes * .05, 'Aufräumen: frei ' + freed + ' B, gemeldet ' + est.bytes + ' B (±5 %)');
info = await p.evaluate(() => SYNQUENZER.g10cInfo());
ok(info.segs.length === 2 && (await p.evaluate(() => SYNQUENZER.tkLoadAll())).length >= 1, 'die übrigen Takes klingen weiter (geladen)');
// WAV-Dateiname mit dem Namen des gewählten Stücks (G10-22)
await p.evaluate(() => { window.__dl = []; window.deliver = async (base, bytes, kind) => { window.__dl.push(base + '.' + kind); return true; }; });
await p.tap('.tksheet button[data-a="wav"]'); await p.waitForTimeout(300);
const dl = await p.evaluate(() => window.__dl);
ok(dl.length === 1 && /-Strophe-gut\.wav$/.test(dl[0]), 'WAV-Dateiname enthält den Namen: ' + dl[0]);
// Speichern/Laden deep-equal (über die Datei)
const canon = `const C = v => Array.isArray(v) ? v.map(C) : v && typeof v === 'object' ? Object.keys(v).sort().reduce((o, k) => (o[k] = C(v[k]), o), {}) : v;`;
const before = await p.evaluate(canon + `; JSON.stringify(C(SYNQUENZER.project().tracks[SYNQUENZER.tkInfo().stimme].clips[0].audio))`);
await p.evaluate(() => importJSON(JSON.stringify(projectFileObj(S, false, true)))); await p.waitForTimeout(400);
const after = await p.evaluate(canon + `; JSON.stringify(C(SYNQUENZER.project().tracks[SYNQUENZER.tkInfo().stimme].clips[0].audio))`);
const s1 = await p.evaluate(() => serialize()); await p.evaluate(() => importJSON(JSON.stringify(projectFileObj(S, false, true)))); await p.waitForTimeout(300);
ok(s1 === await p.evaluate(() => serialize()), 'Laden → Speichern → Laden: Datei Zeichen für Zeichen gleich');
ok(before === after && after.includes('"name":"Strophe gut"') && after.includes('"fav":true'), 'Speichern → Laden: deep-equal, auch in alt');
// ZIP
const z = await p.evaluate(() => SYNQUENZER.tkZipRoundtrip());
ok(z.ok && z.json && z.json.includes('"name":"Strophe gut"') && z.json.includes('"tag":1') && z.json.includes('"fav":true'), 'ZIP enthält Name/Farbe/★');
// Kopie: Clip kopieren über cleanClip/normalize
const cp = await p.evaluate(() => { const st = SYNQUENZER.tkInfo().stimme, c = S.tracks[st].clips[0]; const n = tkNormAudio(JSON.parse(JSON.stringify(cleanClip(c).audio))); return JSON.stringify(n) === JSON.stringify(tkNormAudio(c.audio)); });
ok(cp, 'Kopie (cleanClip → normalisiert) behält die Felder');
// Wisch nach links löscht
await sheet(p); await p.waitForTimeout(100);
const rb = await p.$eval('.tksheet .g10c-pick[data-k="1"]', e => { const r = e.getBoundingClientRect(); return [r.left + r.width * .8, r.top + r.height / 2]; });
await touchDrag(p, rb[0], rb[1], rb[0] - 160, rb[1] + 4, 12); await p.waitForTimeout(150);
info = await p.evaluate(() => SYNQUENZER.g10cInfo());
ok(info.segs.length === 1, 'Wisch nach links löscht den Take');
await p.evaluate(() => undo()); await p.waitForTimeout(100);
ok((await p.evaluate(() => SYNQUENZER.g10cInfo())).segs.length === 2, '↶ holt ihn zurück');
// Bildlauf ohne Wisch löscht nichts
await touchDrag(p, rb[0], rb[1], rb[0], rb[1] - 60, 8); await p.waitForTimeout(100);
ok((await p.evaluate(() => SYNQUENZER.g10cInfo())).segs.length === 2, 'senkrecht ziehen löscht nichts');
// ✕ schließt
await p.tap('.tksheet .g10c-x'); await p.waitForTimeout(100);
ok(await p.$('.tksheet') == null, '✕ schließt das Blatt');
ok(errs.length === 0, 'keine Fehler in der Konsole ' + JSON.stringify(errs));
await b.close();
