// SX11 3: Konsolidieren eines Teils mit Fassung (klingt wie gehört, Zurückholen = exakt), Video offline (Spur-Bilder zeigen nur, was
// klingt), North-Kit auf der Drum-Spur, Gesang + Chor-Gruppe bleiben in der leichten Fassung
import { open, buildSong, ok, summary, diff, state, playLog, notesOf, diffNotes } from './lib.mjs';
const {b, p, errs} = await open();
await buildSong(p, {cats: true});
await p.evaluate(() => { S.bpm = 240; setSongView(true); });
const strip = st => { const o = JSON.parse(JSON.stringify(st)); for (const m of o.song.marks) delete m.vr; return o; };
const s0 = await state(p);

console.log('Konsolidieren: Refrain leicht → neuer Teil');
await p.evaluate(() => SYNQUENZER.markFassungSet('M3', 'l'));
const sL = await state(p), logL = notesOf(await playLog(p));
const r = await p.evaluate(() => SYNQUENZER.konsolidierenMark('M3', 'Refrain L'));
ok(r && r.part >= 0 && r.mark, 'konsolidiert: neuer Teil „Refrain L“', r);
let st = await state(p);
const P = st.parts[r.part];
ok(P && P.len === 4 && P.own && Object.values(P.own).some(c => c.notes.every(n => n.n !== 49 && n.n !== 46)), 'der Teil enthält die ausgedünnten Drums (eigener Clip)', P && Object.keys(P.own || {}));
ok(P && P.lanes[2].every(e => e.slot < 0) && P.lanes[3].every(e => e.slot < 0) && P.lanes[0].some(e => e.slot >= 0), 'im Teil: Fläche und Lead aus, Bass an', P && P.lanes);
{ const d = diffNotes(logL, notesOf(await playLog(p))); ok(!d.onlyA.length && !d.onlyB.length, 'Song klingt nach dem Konsolidieren gleich (leicht)', d); }
await p.evaluate(k => SYNQUENZER.placePart('P' + (k + 1), 12, 'insert'), r.part);
{ const lg = notesOf(await playLog(p)), a = lg.filter(n => n[3] >= 24 && n[3] < 40).map(n => [n[0], n[2], n[3] - 24]), c = lg.filter(n => n[3] >= 48 && n[3] < 64).map(n => [n[0], n[2], n[3] - 48]);
  const d = diffNotes(a, c); ok(!d.onlyA.length && !d.onlyB.length, 'der neue Teil hinten eingesetzt klingt wie der leichte Refrain', {a: d.onlyA.slice(0, 3), b: d.onlyB.slice(0, 3)}); }
await p.evaluate(() => SYNQUENZER.undo());
ok(await p.evaluate(id => SYNQUENZER.zurueckholen(id), r.mark), 'zurückgeholt');
{ const d = diff(sL, await state(p)); ok(d.length === 0, 'Zurückholen = exakt der leichte Stand (mit Fassung)', d.slice(0, 4)); }
ok(await p.evaluate(() => SYNQUENZER.markFassungSet('M3', 'v')) && diff(strip(s0), strip(await state(p))).length === 0, 'danach [Voll] = Originale');
await p.evaluate(() => { while (UNDO.length) undo(); });
ok(diff(s0, await state(p)).length === 0, 'alles rückgängig = Anfang');

console.log('Video offline: Spur-Bilder zeigen nur, was klingt');
await p.evaluate(() => { S.bpm = 240; SYNQUENZER.markFassungSet('M3', 'l'); });
const vr = await p.evaluate(async () => { const r = await SYNQUENZER.vvRender({range: {a: 4, b: 12}}); const L = VV.last, sb = x => L.a * 4 + x;
  const at = q => { const s = vvStateAt(L, (q - L.a * 4) * 60 / L.bpm); return {slots: s.slots.slice(0, 6), own: s.own.slice(0, 6)}; };
  return {peak: r.peak, rms: r.rms, a: L.a, b: L.b, s20: at(21), s26: at(26), s38: at(38), s42: at(42), log: (L.log || []).length, keys: Object.keys(L).join(',')}; });
ok(vr.peak > .01 && vr.rms > .001, 'Render hat Klang', {peak: vr.peak, rms: vr.rms});
ok(vr.s20.slots[2] === 0 && vr.s20.slots[3] === 0 && !vr.s20.own[4], 'Strophe (voll): Fläche, Lead, Drums-Clip im Bild', vr.s20);
ok(vr.s26.slots[2] < 0 && vr.s26.slots[3] < 0 && vr.s26.slots[0] === 0 && vr.s26.slots[1] === 0, 'Refrain (leicht): Fläche und Lead ohne Clip im Bild, Bass und Akkord mit', vr.s26);
ok(vr.s26.own[4] && vr.s38.own[4], 'Refrain: Drum-Bild = der ausgedünnte eigene Clip', vr.s26);
ok(vr.s42.slots[2] === 0 && !vr.s42.own[4], 'Outro (voll): wieder alles', vr.s42);
const sh = await p.evaluate(async () => { const L = VV.last; const id = vvStateAt(L, (26 - L.a * 4) * 60 / L.bpm).own[4]; const c = S.song.own[id]; return c ? c.notes.map(n => n.n) : null; });
ok(sh && !sh.includes(49) && !sh.includes(46) && sh.filter(n => n === 42).length === 8, 'die Noten im Drum-Bild: ohne Becken / offene Hi-Hat, Achtel', sh);

console.log('North-Kit auf der Drum-Spur');
const kn = await p.evaluate(() => { const K = MDX.kits[0]; SYNQUENZER.setSound(DRUM_T, factorySound(kitId(K.name))); return K.name + ' · ' + (S.tracks[DRUM_T].sound.name); });
await p.evaluate(() => { S.bpm = 240; });
{ const lg = notesOf(await playLog(p)), D = lg.filter(n => n[0] === 4 && n[3] >= 24 && n[3] < 40);
  ok(D.length === 48 && !D.some(n => n[2] === 49 || n[2] === 46), 'North-Kit „' + kn + '“: leichte Drums (48 Schläge, ohne Becken)', D.length); }
const vn = await p.evaluate(async () => { const r = await SYNQUENZER.vvRender({range: {a: 6, b: 10}}); return {peak: r.peak, rms: r.rms}; });
ok(vn.peak > .01, 'North klingt im Render des leichten Refrains', vn);
await p.evaluate(() => { while (UNDO.length) undo(); });

console.log('Gesang + Chor-Gruppe');
const sr = 48000, n = sr * 2, pcm = Array.from({length: n}, (_, k) => Math.round(9000 * Math.sin(2 * Math.PI * 220 * k / sr) * Math.min(1, k / 800, (n - k) / 800)));
const tk = await p.evaluate(async pcm => { const r = await SYNQUENZER.tkInject({pcm, sr: 48000, scene: 0, len: 1}); return r; }, pcm);
ok(tk && tk.track >= 6, 'STIMME-Spur mit Take', tk);
const ch = await p.evaluate(async t => { const lanes = S.song.lanes.map(l => deep(l)); while (lanes.length < NT()) lanes.push([]); lanes[t] = [{bar: 0, slot: 0}];
  SYNQUENZER.setSong(Object.assign(deep(S.song), {lanes})); const r = SYNQUENZER.g6Make({t, s: 0}, 'terz', 'up', '80'); await SYNQUENZER.g6Wait({t, s: 0}); SYNQUENZER.g6pConvert({t, s: 0}); await SYNQUENZER.g6pWait({t, s: 0}); const i = SYNQUENZER.g6Info({t, s: 0});
  return {ok: !!r, v: i.chor ? (i.chor.v || 1) : 0, voices: i.chor ? i.chor.voices.length : 0}; }, tk.track);
ok(ch.voices >= 1 && ch.v === 2, 'Chor-Gruppe gemacht (' + ch.voices + ' Stimme(n), v' + ch.v + ')', ch);
const rol = await p.evaluate(() => SYNQUENZER.markRollen('M3'));
ok(rol[tk.track] === 'mel', 'STIMME-Spur = Gesang (bleibt)', rol);
const before = await p.evaluate(t => ({lane: JSON.stringify(S.song.lanes[t]), clip: JSON.stringify(S.tracks[t].clips[0])}), tk.track);
await p.evaluate(() => SYNQUENZER.markFassungSet('M3', 'l'));
const aft = await p.evaluate(t => ({lane: JSON.stringify(S.song.lanes[t]), clip: JSON.stringify(S.tracks[t].clips[0]), info: SYNQUENZER.markFassungInfo('M3')}), tk.track);
ok(before.lane === aft.lane && before.clip === aft.clip, 'leicht: Gesang und Chor unverändert (Spur-Eintrag, Clip mit Chor)');
ok(!aft.info.l.some(x => x.t === tk.track), 'der Gesang steht nicht in der leichten Auswahl', aft.info.l);
const play = t => p.evaluate(async t => { S.bpm = 120; songPlayStart(6); await new Promise(r => setTimeout(r, 1500)); const i = SYNQUENZER.tkInfo(), c = SYNQUENZER.g6pInfoC(); stop(); await new Promise(r => setTimeout(r, 200)); return {src: i.src.filter(x => x.i === t).length, copies: c.copies, live: c.live}; }, t);
const pl = await play(tk.track);
await p.evaluate(() => SYNQUENZER.markFassungSet('M3', 'v'));
const pv = await play(tk.track);
ok(pl.src >= 1 && pl.src === pv.src, 'im leichten Refrain spielt der Gesang wie im vollen (Take-Quellen ' + pl.src + '/' + pv.src + ')', {pl, pv});
ok(pl.copies >= 1 && pl.copies === pv.copies, 'und die Chor-Gruppe wie im vollen (Chor-Kopien im Klangweg ' + pl.copies + '/' + pv.copies + ')', {pl, pv});
ok(errs.length === 0, 'keine Konsolenfehler', errs);
await b.close();
process.exit(summary('SX11-KON-Video') ? 1 : 0);
