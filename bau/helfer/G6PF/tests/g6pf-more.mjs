// G6P-50 (Entkoppeln), G6P-52 (Transponieren), G6P-54 (Song-Stück), G6P-55 (Ganze Spur, 512-Grenze)
import {open, withTake, ok, done, sleep, stable} from './h.mjs';
const H = await open(); const p = H.p;
const {ids} = await withTake(p, [0, 1, 2]);
const lead = ids[0];
await p.evaluate(() => { window.__r = {t: stimmeT(), s: 0}; });
const same = (a, b) => a && b && a.data.length === b.data.length && a.data.every((x, i) => x === b.data[i]);
// ---------- G6P-50 Entkoppeln ----------
ok(await p.evaluate(() => SYNQUENZER.g6Make(__r, 'terz', 'up', '80')), 'Chor Terz oben (v1) gerechnet');
ok(await p.evaluate(() => SYNQUENZER.g6Wait(__r)), 'Chor-Stimmen fertig');
// Tonhöhe je Kopie (Autokorrelation über alle stimmhaften 60-ms-Fenster, Median) – vorher/nachher
const PITCH = `window.__f0 = (d, sr) => { const out = []; const W = Math.round(.06 * sr); for (let o = Math.round(.5 * sr); o + W + 2000 < d.length && out.length < 60; o += Math.round(.25 * sr)) { let e = 0; for (let i = 0; i < W; i++) e += d[o + i] * d[o + i]; if (e / W < 1e-5) continue;
  let best = 0, bl = 0; for (let l = Math.round(sr / 900); l < Math.round(sr / 90); l++) { let s = 0, a = 0, b = 0; for (let i = 0; i < W; i++) { s += d[o + i] * d[o + i + l]; a += d[o + i] * d[o + i]; b += d[o + i + l] * d[o + i + l]; } const r = 2 * s / (a + b); if (r > best) { best = r; bl = l; } } if (best > .8) out.push(1200 * Math.log2(sr / bl)); } return out; };`;
await p.evaluate(PITCH);
const before = await p.evaluate(() => { const a = tkRef(__r).a, v = a.chor.voices[0]; return [0, 1].map(k => { const b = g6Buf(a, v, k); return {rms: Math.sqrt(b.getChannelData(0).reduce((s, x) => s + x * x, 0) / b.length), f0: __f0(b.getChannelData(0), b.sampleRate)}; }); });
const leadP0 = await p.evaluate(id => JSON.stringify(S.takes[id].pitch || null), lead);
const nid = await p.evaluate(() => SYNQUENZER.g6pEntkoppeln(__r, 0));
ok(typeof nid === 'string', 'Entkoppeln: neue Kennung ' + nid);
const T = await p.evaluate(id => S.takes[id], nid), L = await p.evaluate(id => S.takes[id], lead);
ok(T.of === lead && T.src === 'chor' && JSON.stringify(T.chunks) === JSON.stringify(L.chunks) && !('lyrics' in T), 'chunks = die des Leads, of/src gesetzt, lyrics nicht');
const vi = await p.evaluate(() => SYNQUENZER.g6pfInfo(__r));
const v = vi.stelle.voices[0];
ok(v.take && v.take.take === nid && JSON.stringify(v.dbl) === '[{"ms":12,"ct":-6,"p":-0.15},{"ms":24,"ct":8,"p":0.15}]' && v.lane, 'Stimme: eigener Take, Kopien wie v1 (12/−6, 24/+8), Spur ' + v.lane);
ok(vi.lanes.lanes[0].name === 'Chor Terz oben' && vi.origins[0].label === 'Chor Terz oben (aus Take 1)', 'Spur „Chor Terz oben“, Herkunft: ' + vi.origins[0].label);
ok(T.pitch && T.pitch.notes.some(n => n.sh) && T.pitch.notes.every(n => !n.sh || n.sh === 3 || n.sh === 4), 'take.pitch = Lead-Plan + Intervall je Note (sh ∈ {3, 4}): ' + JSON.stringify(T.pitch.notes.map(n => n.sh || 0)));
ok(await p.evaluate(id => JSON.stringify(S.takes[id].pitch || null), lead) === leadP0, 'Lead-Take unverändert');
await stable(p, nid);
ok(await p.evaluate(async () => { for (let n = 0; n < 800; n++) { if (g6Ready(tkRef(__r).a) && !G6.job.size) return true; await new Promise(r => setTimeout(r, 25)); } return false; }), 'entkoppelte Stimme spielbereit (beide Kopien)');
const after = await p.evaluate(() => { const a = tkRef(__r).a, v = a.chor.voices[0]; return [0, 1].map(k => { const b = g6Buf(a, v, k); return b ? {rms: Math.sqrt(b.getChannelData(0).reduce((s, x) => s + x * x, 0) / b.length), f0: __f0(b.getChannelData(0), b.sampleRate)} : null; }); });
const med = a => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; };
for (const k of [0, 1]) {
  const dDb = 20 * Math.log10(after[k].rms / before[k].rms), dCt = med(after[k].f0) - med(before[k].f0);
  ok(Math.abs(dDb) <= 0.5 && Math.abs(dCt) <= 10, `Kopie ${k + 1}: klingt wie vorher (Pegel ${dDb.toFixed(2)} dB, Tonhöhe-Median ${dCt.toFixed(1)} ct; ${after[k].f0.length} Fenster) [S: Grob-Messung, M-CT je Note folgt in G6+i]`);
}
// danach: Lead-Note ändern ⇒ Stimme bitgleich; Stimm-Note ändern ⇒ Lead bitgleich
await stable(p, lead);
const hv0 = await p.evaluate(id => SYNQUENZER.g6pfHeard(id, __r, 0, 300000), nid), hl0 = await p.evaluate(id => SYNQUENZER.g6pfHeard(id, __r, 0, 300000), lead);
await p.evaluate(id => g2NoteShift(id, 1, 1), lead); await stable(p, lead); await stable(p, nid);
const hv1 = await p.evaluate(id => SYNQUENZER.g6pfHeard(id, __r, 0, 300000), nid), hl1 = await p.evaluate(id => SYNQUENZER.g6pfHeard(id, __r, 0, 300000), lead);
ok(!same(hl0, hl1) && same(hv0, hv1), 'Lead-Note geändert ⇒ entkoppelte Stimme bitgleich');
await p.evaluate(id => g2NoteShift(id, 2, -1), nid); await stable(p, nid); await stable(p, lead);
const hv2 = await p.evaluate(id => SYNQUENZER.g6pfHeard(id, __r, 0, 300000), nid), hl2 = await p.evaluate(id => SYNQUENZER.g6pfHeard(id, __r, 0, 300000), lead);
ok(!same(hv1, hv2) && same(hl1, hl2), 'Stimm-Note geändert ⇒ Lead bitgleich');
await p.evaluate(() => { undo(); undo(); });
// Undo Entkoppeln = 1 Schritt
const sB = await p.evaluate(() => { undo(); return {ser: serialize(), has: !!S.takes[arguments[0]]}; }).catch(() => null);
ok(await p.evaluate(id => !S.takes[id] && !tkRef(__r).a.chor.voices[0].take, nid), '↶ Entkoppeln: Kennung weg, Stimme wieder errechnet (1 Schritt)');
await p.evaluate(() => redo());
// ---------- G6P-52 Transponieren (G7) ----------
const dupId = (await p.evaluate(() => SYNQUENZER.g6pDuplizieren(__r, false)))[0]; await p.evaluate(() => g2Close());
ok(await p.evaluate(id => { const x = g7SegOf(id); return x === tkRef(__r).a; }, dupId) && await p.evaluate(id => g7SegOf(id) === tkRef(__r).a, nid), 'g7SegOf findet für entkoppelte und duplizierte Takes ihre Stelle (Lead-Stück)');
await stable(p, dupId); await stable(p, lead);
const t0d = await p.evaluate(id => SYNQUENZER.g6pfHeard(id, __r, 0, 300000), dupId), t0l = await p.evaluate(id => SYNQUENZER.g6pfHeard(id, __r, 0, 300000), lead), t0n = await p.evaluate(id => SYNQUENZER.g6pfHeard(id, __r, 0, 300000), nid);
// Probe-Transponieren: +3 Halbtöne (outPitch/mapOut der App für die Dauer der Probe ersetzt)
await p.evaluate(() => { window.__op = outPitch; window.__mo = mapOut; });
await p.evaluate(() => { window.outPitch = (st, key, q) => q + 3; window.mapOut = (st, key, q) => q + 3; G7.t = 0; g7Changed(); });
const sh = await p.evaluate(([a, b, c]) => { const r = {}; for (const id of [a, b, c]) { const m = S.takes[id], P = m.pitch || g7Pitch(id, true); r[id] = P ? g7Shift(id, g7SegOf(id), P) : null; } return r; }, [lead, dupId, nid]);
ok([lead, dupId, nid].every(id => sh[id] && sh[id].length && sh[id].every(x => x === 3)), 'Transponieren (+3) nimmt Lead, Duplikat und entkoppelte Stimme mit: ' + [lead, dupId, nid].map(id => sh[id] ? sh[id].length + '×' + sh[id][0] : 'null').join(' / '));
await stable(p, dupId); await stable(p, lead);
const t1d = await p.evaluate(id => SYNQUENZER.g6pfHeard(id, __r, 0, 300000), dupId), t1l = await p.evaluate(id => SYNQUENZER.g6pfHeard(id, __r, 0, 300000), lead);
ok(!same(t0d, t1d) && same(t1d, t1l), 'transponiert: Duplikat = Lead (bitgleich, gleiche Kette)');
await p.evaluate(() => { window.outPitch = window.__op; window.mapOut = window.__mo; G7.t = null; g7Changed(); });
await stable(p, dupId); await stable(p, lead); await stable(p, nid);
const t2d = await p.evaluate(id => SYNQUENZER.g6pfHeard(id, __r, 0, 300000), dupId), t2n = await p.evaluate(id => SYNQUENZER.g6pfHeard(id, __r, 0, 300000), nid);
ok(same(t0d, t2d) && same(t0n, t2n), 'zurück auf 0 ⇒ bitgleich zur Fassung ohne Transponieren');
// ---------- G6P-55 Ganze Spur: 3 Clips + 2 Song-Stimmen ----------
await p.evaluate(([a, b]) => { songEnsure(); const mk = (id, bar, tk) => Object.assign({id, bar, len: 4}, tkNormAudio({take: tk, in: 0, out: 8, at: 0})); S.song.vox = tkNormVox([mk('V1', 8, a), mk('V2', 16, b)]); UNDO.length = 0; REDO.length = 0; }, [ids[1], ids[2]]);
const b55 = await p.evaluate(() => serialize()), nT0 = await p.evaluate(() => Object.keys(S.takes).length);
const all = await p.evaluate(() => SYNQUENZER.g6pDuplizieren(__r, true)); await p.evaluate(() => g2Close());
const st55 = await p.evaluate(() => { const st = stimmeT(), lane = SYNQUENZER.g6pfInfo().last.lane, where = []; S.tracks[st].clips.forEach((c, s) => { if (c && c.audio && c.audio.chor) { const v = c.audio.chor.voices.find(z => z.lane === lane); if (v) where.push('S' + s + ':' + v.take.take); } }); for (const v of S.song.vox) { const z = v.chor && v.chor.voices.find(q => q.lane === lane); if (z) where.push(v.id + ':' + z.take.take); } return {lane, where, name: S.tracks[st].chor.lanes.find(l => l.id === lane).name, undo: UNDO.length}; });
ok(all.length === 5 && new Set(all).size === 5 && st55.where.length === 5, `[Ganze Spur] ⇒ 5 neue Kennungen in derselben Spur „${st55.name}“: ${st55.where.join(', ')}`);
ok(st55.undo === 1, 'ein Gruppen-Undo (Clips + Song + Spur + Takes)');
await p.evaluate(() => undo()); ok(await p.evaluate(() => serialize()) === b55, '↶ ⇒ deep-equal'); await p.evaluate(() => redo());
const pit = await p.evaluate(ids => ids.map(id => JSON.stringify(S.takes[id].pitch || null)), all);
await p.evaluate(id => g2NoteShift(id, 1, 1), all[1]);
const pit2 = await p.evaluate(ids => ids.map(id => JSON.stringify(S.takes[id].pitch || null)), all);
ok(pit2[1] !== pit[1] && [0, 2, 3, 4].every(k => pit2[k] === pit[k]), 'Note ▲ an einer Stelle ⇒ die anderen vier unverändert (eigene Kennungen)');
// ---------- G6P-54 Song-Stück ----------
const nUndo = await p.evaluate(() => UNDO.length);
const sv = await p.evaluate(() => SYNQUENZER.g6pDuplizieren({vox: 'V1'}, false)); await p.evaluate(() => g2Close());
const su = await p.evaluate(() => { const u = UNDO[UNDO.length - 1]; return u.kind + ':' + u.items.map(i => i.kind).join(','); });
ok(Array.isArray(sv) && sv.length === 1 && /group:takes,song,chorlanes/.test(su), 'Song-Stimme duplizieren: 1 Song-Undo-Schritt (' + su + ')');
ok(await p.evaluate(id => g7SegOf(id) === S.song.vox.find(v => v.id === 'V1'), sv[0]), 'g7SegOf findet die Song-Stimme');
await p.evaluate(() => undo());
// ---------- 512-Grenze ----------
const lim = await p.evaluate(() => { const keep = deep(S.takes), base = Object.values(S.takes)[0]; let n = Object.keys(S.takes).length; while (n < 510) { const id = newUid(); S.takes[id] = Object.assign({}, base); n++; } const b = serialize(), r = SYNQUENZER.g6pDuplizieren(__r, true), a = serialize(); S.takes = keep; return {r, same: a === b}; });
ok(lim.r === false && lim.same, 'über 512 Takes ⇒ Toast, Daten deep-equal');
ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 3)));
await H.br.close(); done();
