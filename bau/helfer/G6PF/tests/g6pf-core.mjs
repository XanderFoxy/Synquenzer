// G6P-50, 51, 53, 54, 55 (+ G6P-08 geteilte Stücke beim Aufräumen) – gezielt für G6+f
import {open, withTake, ok, done, sleep, stable} from './h.mjs';
const H = await open(); const p = H.p;
const {ids: [lead]} = await withTake(p, [0]);
const R0 = {t: null, s: 0};
await p.evaluate(() => { window.__r = {t: stimmeT(), s: 0}; });
// ---------- G6P-51 Duplizieren ----------
const n0 = await p.evaluate(() => Object.keys(S.takes).length);
const leadJson = await p.evaluate(id => JSON.stringify(S.takes[id]), lead);
const dup = await p.evaluate(() => SYNQUENZER.g6pDuplizieren(__r, false));
ok(Array.isArray(dup) && dup.length === 1, 'Duplizieren legt eine neue Take-Kennung an: ' + JSON.stringify(dup));
const d = dup[0], inf = await p.evaluate(() => SYNQUENZER.g6pfInfo(__r));
const T = await p.evaluate(id => S.takes[id], d), L = JSON.parse(leadJson);
ok(T.of === lead && T.src === 'dup' && JSON.stringify(T.chunks) === JSON.stringify(L.chunks), `neue Kennung teilt die Stücke des Leads (of=${T.of}, src=${T.src}, chunks=${T.chunks})`);
ok(!('lyrics' in T) && T.follow === L.follow && T.len === L.len && T.sr === L.sr, 'Felder übernommen (follow, len, sr), lyrics nicht');
ok(inf.last.ms <= 100, `Anlegen ${inf.last.ms} ms (≤ 100 ms, kein PCM-Kopieren)`);
ok(inf.lanes && inf.lanes.lanes.length === 1 && inf.lanes.lanes[0].role === 'free' && inf.lanes.lanes[0].name === 'Gegenstimme 1', 'Spur „Gegenstimme 1“ (role free): ' + JSON.stringify(inf.lanes));
const v0 = inf.stelle.voices[0];
ok(v0.take.take === d && v0.pan === 0 && v0.db === 0 && JSON.stringify(v0.dbl) === '[{"ms":0,"ct":0,"p":0}]' && v0.rule === 'free', 'Stimme: eine Kopie ohne Versatz/Verstimmung, Pan Mitte, 0 dB: ' + JSON.stringify(v0));
ok(inf.origins.length === 1 && /^Gegenstimme 1 \(aus Take 1\)$/.test(inf.origins[0].label), 'Takes-Blatt-Herkunft: ' + JSON.stringify(inf.origins.map(o => o.label)));
ok(await p.evaluate(() => !!(G2.ed && G2.ed.id !== S.tracks[stimmeT()].clips[0].audio.take)), 'Noten-Editor der Kopie öffnet sich direkt');
await p.evaluate(() => g2Close());
ok(await p.evaluate(([a, b]) => SYNQUENZER.g6pfSharedBuf(a, b), [lead, d]), 'Kopie benutzt denselben Puffer wie der Lead (kein zweites Laden)');
// gehörte Fassung der Kopie = Lead (bitgleich), bis man sie ändert
await stable(p, lead); await stable(p, d);
const hl = await p.evaluate(id => SYNQUENZER.g6pfHeard(id, __r, 0, 384000), lead), hd = await p.evaluate(id => SYNQUENZER.g6pfHeard(id, __r, 0, 384000), d);
const same = (a, b) => a && b && a.data.length === b.data.length && a.data.every((x, i) => x === b.data[i]);
ok(same(hl, hd), `Kopie im Fenster bitgleich zum Lead (${hl && hl.data.length} Werte)`);
// Note ▲ in der Kopie ⇒ Lead bitgleich
const hl0 = hl;
const sh = await p.evaluate(id => g2NoteShift(id, 2, 2), d);
ok(sh === true, 'Note ▲▲ in der Kopie (ein Undo, Art takes)');
await stable(p, d); await stable(p, lead);
const hd2 = await p.evaluate(id => SYNQUENZER.g6pfHeard(id, __r, 0, 384000), d), hl2 = await p.evaluate(id => SYNQUENZER.g6pfHeard(id, __r, 0, 384000), lead);
ok(same(hl0, hl2) && !same(hd2, hl2), `Kopie geändert, Lead bitgleich (Lead gleich ${same(hl0, hl2)}, Kopie anders ${!same(hd2, hl2)})`);
ok(await p.evaluate(id => S.takes[id].pitch == null || !S.takes[id].pitch.notes.some(n => n.sh), lead), 'Lead-Take ohne Verschiebung');
await p.evaluate(() => undo());
// [Background] ⇒ Werte wie Tabelle; zweite Gegenstimme auf der anderen Seite
const d2 = await p.evaluate(() => SYNQUENZER.g6pDuplizieren(__r, false)); await p.evaluate(() => g2Close());
const ln = await p.evaluate(() => S.tracks[stimmeT()].chor.lanes.map(l => l.id + ':' + l.name));
ok(ln.length === 2 && /Gegenstimme 2/.test(ln[1]), 'zweite Gegenstimme: ' + ln.join(', '));
await p.evaluate(() => { SYNQUENZER.g6pBackground('c1'); SYNQUENZER.g6pBackground('c2'); });
const vs = await p.evaluate(() => SYNQUENZER.g6pfInfo(__r).stelle.voices);
ok(vs[0].pan === -0.6 && vs[1].pan === 0.6 && vs.every(v => v.w === 0.15 && v.db === 0 && JSON.stringify(v.dbl) === '[{"ms":12,"ct":-6,"p":-1},{"ms":24,"ct":8,"p":1}]' && v.rev === 0.5 && v.dly === 0.1), '[Background]: Pan −0,6/+0,6, Breite 0,15, Kopien 12/−6/−1 · 24/+8/+1, Hall 0,5, Echo 0,1: ' + JSON.stringify(vs.map(v => [v.pan, v.w, v.rev, v.dly])));
// Kopien mit Verstimmung werden gerechnet (Worker), Chor bereit
const rd = await p.evaluate(async () => { for (let n = 0; n < 600; n++) { const x = tkRef(__r); if (g6Ready(x.a) && !G6.job.size) return true; await new Promise(r => setTimeout(r, 25)); } return false; });
ok(rd, 'Kopien der Gegenstimmen gerechnet (g6Ready)');
const auto = await p.evaluate(async () => { for (let n = 0; n < 400; n++) { const a = g6Auto(tkRef(__r).a); if (a != null) return a; await new Promise(r => setTimeout(r, 25)); } return null; });
ok(auto != null && auto > 0 && auto < 1, 'Auto-Pegel der Take-Stimmen gemessen: ' + auto);
// ---------- G6P-53 Undo ----------
const before = await p.evaluate(() => serialize());
const d3 = await p.evaluate(() => SYNQUENZER.g6pDuplizieren(__r, false)); await p.evaluate(() => g2Close());
await p.evaluate(() => undo());
ok(await p.evaluate(() => serialize()) === before, '↶ nach Duplizieren ⇒ Projekt deep-equal (1 Schritt)');
ok(await p.evaluate(id => !S.takes[id], d3[0]), '↶: neue Kennung aus S.takes verschwunden');
await p.evaluate(() => redo()); ok(await p.evaluate(id => !!S.takes[id], d3[0]), '↷ bringt sie zurück'); await p.evaluate(() => undo());
const gc = await p.evaluate(async () => { await tkGc(); return {gc: SYNQUENZER.tkInfo().gc, keys: await SYNQUENZER.tkKeys()}; });
ok(gc.keys.some(k => k.startsWith(lead + ':')), `[Aufräumen] löscht keine Lead-Stücke (${JSON.stringify(gc.gc)})`);
// ---------- G6P-08 (Teil): Lead-Kennung weg, Duplikat behält die geteilten Stücke ----------
const gc2 = await p.evaluate(async ([lead, d]) => { const keep = deep(S.takes); delete S.takes[lead]; UNDO.length = 0; REDO.length = 0; await tkGc(); const k = await SYNQUENZER.tkKeys(); S.takes = keep; return {k, gc: SYNQUENZER.tkInfo().gc}; }, [lead, d]);
ok(gc2.k.filter(k => k.startsWith(lead + ':')).length === L.chunks.length, `geteilte Stücke bleiben, auch wenn die Lead-Kennung fehlt (${JSON.stringify(gc2.gc)})`);
// ---------- ZIP ----------
const z = await p.evaluate(() => SYNQUENZER.tkZipInfo());
const nTk = await p.evaluate(() => Object.keys(S.takes).length);
ok(z.files.filter(f => /^takes\/.*\.wav$/.test(f.name)).length === 3, 'ZIP: Lead + 2 Gegenstimmen je als eigenes WAV: ' + z.files.map(f => f.name).join(', '));
const zr = await p.evaluate(() => SYNQUENZER.tkZipRoundtrip());
const zj = JSON.parse(zr.json).project.takes;
ok(Object.keys(zj).every(id => zj[id].chunks.every(k => k.startsWith(id + ':'))), 'ZIP-Projekt: jede Kopie mit eigenen Stück-Namen');
ok(Object.values(zj).filter(t => t.src === 'dup' && t.of === lead).length === 2, 'ZIP-Projekt: src/of erhalten');
// Speichern → Laden deep-equal
const s1 = await p.evaluate(() => serialize());
const s2 = await p.evaluate(s => { const o = importJSON(s); return serialize(); }, s1).catch(e => 'ERR ' + e);
if (s1 !== s2) { const A = JSON.stringify(JSON.parse(s1).project), B = JSON.stringify(JSON.parse(s2).project); let j = 0; while (A[j] === B[j]) j++; console.log('PDIFF', j, A.slice(j - 100, j + 100), '\n', B.slice(j - 100, j + 100)); let i = 0; while (s1[i] === s2[i]) i++; console.log('DIFF', i, s1.slice(Math.max(0, i - 40), i + 60), '\n', String(s2).slice(Math.max(0, i - 40), i + 60)); if (0) console.log( s1.slice(i - 80, i + 120), '\n----\n', String(s2).slice(i - 80, i + 120)); }
ok(s1 === s2, 'Speichern → Laden deep-equal (' + s1.length + ' Zeichen)');
ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 3)));
await H.br.close(); done();
