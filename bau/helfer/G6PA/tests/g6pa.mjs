// G6+0 / G6+a – Abnahmen G6P-01 … G6P-09, G6P-K1 (Daten), Regel 28 (Format/JSON gegen 4.25.2)
import {launch, open, ok, done, OLD, APP} from './lib.mjs';
const b = await launch();
const tone = (f, sec) => Array.from({length: Math.round(48000 * sec)}, (_, i) => Math.round(9000 * Math.sin(2 * Math.PI * f * i / 48000 + 3 * Math.sin(2 * Math.PI * 5 * i / 48000))));
const V1 = {rec: 'terz', dir: 'up', mix: '80', voices: [{name: 'Terz oben', n: [{t0: .1, t1: .9, m: 57, iv: 4}], pan: -0.6, db: 0, vol: 1, rev: .75, dly: .12}]};
const v2 = take => ({v: 2, style: 'gospel', grp: {below: 6, hp: 120, mid: -1, midF: 300, air: 2, sib: -12, rev: .5, pre: '1/32', dly: 0}, rec: 'drei', dir: 'up', mix: '80', voices: [
  {lane: 'c1', rule: 'ch+1', n: [{t0: .1, t1: .5, m: 57, d: 2, iv: 4}, {t0: .5, t1: .9, m: 59, d: 2, o: 1, x: -1, iv: 14}], db: 0, pan: -0.45, w: .25,
    dbl: [{ms: 9, ct: -10, p: -1}, {ms: 21, ct: 5, p: 0}, {ms: 34, ct: 12, p: 1}], name: 'Chor Sopran', vol: 1, rev: .5, dly: 0},
  {lane: 'c2', rule: 'free', n: [{t0: .1, t1: .9, m: 57, d: 0, iv: 0}], db: -3, pan: .6, w: .15, dbl: [{ms: 12, ct: -6, p: -1}, {ms: 24, ct: 8, p: 1}], take: {take, in: 0, out: 1, at: 0}, dblOff: true,
    name: 'Gegenstimme 1', vol: 1, rev: .5, dly: 0}]});
const LANES = {lanes: [{id: 'c1', role: 'ch+1', name: 'Chor Sopran'}, {id: 'c2', role: 'free', name: 'Gegenstimme 1', mute: true}, {id: 'c3', role: 'st+2', name: 'Chor Terz oben'}], cpl: false, ref: -1.94, off: 1.5};
// Projekt: STIMME-Clip Szene 0 (Lead), Szene 1 (zweiter Take → nur als Chor-Stimme benutzt)
async function setup(p, chorFn) {
  return p.evaluate(async ([pcmA, pcmB, V1]) => {
    SYNQUENZER.newProject(); await sleep(200);
    const a = await SYNQUENZER.tkInject({pcm: pcmA, sr: 48000, scene: 0, len: 1}), c = await SYNQUENZER.tkInject({pcm: pcmB, sr: 48000, scene: 1, len: 1});
    SYNQUENZER.clearClip(a.track, 1);
    return {lead: a.id, voice: c.id, st: a.track};
  }, [tone(220, 1.2), tone(277, 1.2), V1]);
}
const proj = p => p.evaluate(() => SYNQUENZER.serialize());

/* ---------------- G6+0 ---------------- */
{
  const p = await open(b);
  const ids = await setup(p);
  const V1b = JSON.parse(JSON.stringify(V1)); V1b.voices.push({name: 'Stimme 2', n: [{t0: .1, t1: .9, m: 57, iv: 0}], pan: .6, db: 0, vol: 1, rev: .5, dly: 0, take: {take: ids.voice, in: 0, out: 1, at: 0}});
  await p.evaluate(([c, st]) => SYNQUENZER.g6pSet({t: st, s: 0}, c), [V1b, ids.st]);
  // G6P-01: ZIP enthält die selbst gesungene Stimme; leeres Profil → Import → Take da, PCM gleich, geladen
  const z = await p.evaluate(() => SYNQUENZER.tkZipInfo());
  const hasV = z.files.some(f => f.name === 'takes/' + ids.voice + '.wav');
  const h0 = await p.evaluate(id => SYNQUENZER.tkPcmHash(id), ids.voice), bytes = await p.evaluate(() => SYNQUENZER.tkZipBytes());
  const q = await open(b);
  await q.evaluate(async arr => { await SYNQUENZER.tkImportZip(arr); await sleep(600); }, bytes);
  const r1 = await q.evaluate(async id => { const l = await SYNQUENZER.tkLoadAll(); return {hash: await SYNQUENZER.tkPcmHash(id), loaded: l.includes(id), chor: !!(SYNQUENZER.g6pInfo({t: stimmeT(), s: 0}).chor || {}).voices}; }, ids.voice);
  ok('G6P-01 ZIP enthält Chor-Take; Import auf leerem Profil: Take da, PCM gleich, geladen', hasV && r1.hash === h0 && r1.loaded && r1.chor, {hasV, r1, h0});
  // Gegenprobe 4.25.2: dort fehlt der Take im ZIP
  const o = await open(b, OLD); const ido = await setup(o);
  const V1o = JSON.parse(JSON.stringify(V1b)); V1o.voices[1].take.take = ido.voice;
  await o.evaluate(([c, st]) => g6Edit({t: st, s: 0}, 'x', au => { au.chor = c; }), [V1o, ido.st]);
  const zo = await o.evaluate(() => SYNQUENZER.tkZipInfo());
  ok('G6P-01 Gegenprobe: 4.25.2 verliert den Chor-Take im ZIP (Fehler bestätigt)', !zo.files.some(f => f.name === 'takes/' + ido.voice + '.wav'));
  await q.ctx.close();

  // G6P-03 (Teil 2): Wiedergabe / tkLoadAll räumt den Chor-Take nicht ab, kein erneutes tkLoad
  const lc = await p.evaluate(async id => { let n = 0; const f = window.tkLoad; window.tkLoad = x => { if (x === id && !TK.buf.has(x) && !TK.wait.has(x)) n++; return f(x); };
    for (let k = 0; k < 10; k++) { tkLoadAll(); await sleep(30); } SYNQUENZER.launchScene(0); await sleep(3000); SYNQUENZER.stop(); window.tkLoad = f; return {n, buf: TK.buf.has(id)}; }, ids.voice);
  ok('G6P-03 Chor-Take bleibt im Speicher, 0 erneute tkLoad', lc.buf && lc.n === 0, lc);

  // G6P-03: zwei Clips mit demselben Take, Pegel der Stimme in Clip B → Knoten von Clip A unverändert
  const two = async (pg) => pg.evaluate(async ([st]) => {
    const A = S.tracks[st].clips[0]; S.tracks[st].clips[2] = deep(A); clipChanged(st, 2);
    g6Edit({t: st, s: 2}, 'x', au => { au.chor.voices[0].db = 6; });
    await ensureAudio(); g6Apply(S.tracks[st].clips[0].audio, st, true); await sleep(80);
    const nA = () => [...G6.nodes.entries()].filter(([k]) => k.startsWith(g6Sid(S.tracks[st].clips[0].audio) + ':')).map(([k, N]) => N.inp.gain.value);
    const before = nA(); g6Apply(S.tracks[st].clips[2].audio, st, true); await sleep(120);
    return {before, after: nA()};
  }, [ids.st]);
  const t3 = await two(p);
  ok('G6P-03 zwei Clips, ein Take: Pegel in Clip B ändert Clip A nicht', t3.before.length > 0 && JSON.stringify(t3.before) === JSON.stringify(t3.after), t3);

  // G6P-02: Selbst singen scharf → Blatt schließen → Solo aus, Lead hörbar; Aufnahme-Start schaltet Führung wieder; Laden/Render setzen aus
  const s2 = await p.evaluate(async st => {
    const r = {t: st, s: 0}; SYNQUENZER.launchScene(0); await sleep(700);
    SYNQUENZER.g6Sheet(r); SYNQUENZER.g6Arm(r, 1); await sleep(150);
    const lead = () => TK.src.filter(x => !x.dead && x.aud && x.aud.chor).map(x => +x.g.gain.value.toFixed(4));
    const armed = {solo: G6.solo, lead: lead()};
    closePop(); await sleep(150);
    const closed = {solo: G6.solo, arm: !!G6.arm, lead: lead(), G: TK.src.filter(x => !x.dead && x.aud && x.aud.chor).map(x => +(+x.G).toFixed(4))};
    g6ArmGo(0); const go = G6.solo;
    g6RenderHold(); const hold = {solo: G6.solo, arm: G6.arm}; 
    SYNQUENZER.stop(); importJSON(SYNQUENZER.serialize()); await sleep(300);
    return {armed, closed, go, hold, load: {solo: G6.solo, arm: G6.arm, nodes: G6.nodes.size}};
  }, ids.st);
  ok('G6P-02 scharf: Führung solo, Lead stumm', s2.armed.solo === 1 && s2.armed.lead.every(x => x === 0), s2.armed);
  ok('G6P-02 Blatt zu: Solo aus, Lead wieder auf Pegel, scharf bleibt (für ●)', s2.closed.solo === null && s2.closed.arm && JSON.stringify(s2.closed.lead) === JSON.stringify(s2.closed.G), s2.closed);
  ok('G6P-02 Aufnahme-Start: Führung wieder solo', s2.go === 1, s2.go);
  ok('G6P-02 Render-Halt: Solo und scharf ausgesetzt', s2.hold.solo === null && s2.hold.arm === null, s2.hold);
  ok('G6P-02 Laden: Solo/scharf aus, Knoten geleert', s2.load.solo === null && s2.load.arm === null && s2.load.nodes === 0, s2.load);
  // G6+0 (4): selbst gesungene Stimme = ein Knoten; Knoten-Freigabe nach dem Stopp
  const s4 = await p.evaluate(async st => { SYNQUENZER.launchScene(0); await sleep(1500); const keys = [...G6.nodes.keys()]; SYNQUENZER.stop(); await sleep(2600); return {keys, after: G6.nodes.size}; }, ids.st);
  ok('G6+0 Knoten je Stück: Stimme 2 (selbst gesungen) 1 Knoten, Terz 2; nach Stopp freigegeben', s4.keys.filter(k => k.split(':')[1] === '1').length === 1 && s4.keys.filter(k => k.split(':')[1] === '0').length === 2 && s4.after === 0, s4);
  ok('G6+0 keine Konsolenfehler', !p.errs.length, p.errs);
  await p.ctx.close(); await o.ctx.close();
}

/* ---------------- G6+a ---------------- */
{
  const p = await open(b), o = await open(b, OLD);
  // G6P-05 / Regel 28: ohne Chor und mit v1-Chor: normalisiertes JSON zeichengleich zu 4.25.2, Datei-Format 5
  const cases = [['leer', null], ['Demo', 'demo'], ['v1-Chor', V1], ['v1 + selbst gesungen', 'v1take']];
  for (const [nm, c] of cases) {
    const mk = async pg => { if (c === 'demo') { await pg.evaluate(() => SYNQUENZER.loadDemo()); await pg.waitForTimeout(400); return pg.evaluate(() => SYNQUENZER.serialize()); }
      const ids = await setup(pg); if (c) { const cc = c === 'v1take' ? Object.assign({}, V1, {voices: V1.voices.concat([{name: 'X', n: [{t0: .1, t1: .9, m: 57, iv: 0}], pan: .6, db: 0, vol: 1, rev: .5, dly: 0, take: {take: ids.voice, in: 0, out: 1, at: 0}}])}) : c;
        await pg.evaluate(([cc, st]) => g6Edit({t: st, s: 0}, 'x', au => { au.chor = cc; }), [cc, ids.st]); }
      return pg.evaluate(() => SYNQUENZER.serialize()); };
    const jo = await mk(o);
    const rn = await p.evaluate(j => { importJSON(j); const f = projectFileObj(S, true); return {s: SYNQUENZER.serialize(), fmt: f.format, file: JSON.stringify(f)}; }, jo);
    const ro = await o.evaluate(j => { importJSON(j); const f = projectFileObj(S, true); return {s: SYNQUENZER.serialize(), file: JSON.stringify(f)}; }, jo);
    const strip = s => s.replace(/"id":"[^"]*"/, '');
    ok('G6P-05 ' + nm + ': JSON zeichengleich zu 4.25.2, Datei zeichengleich, Format 5', rn.s === ro.s && rn.file === ro.file && rn.fmt === 5, {len: rn.s.length, fmt: rn.fmt, sameS: rn.s === ro.s, sameF: rn.file === ro.file});
  }
  // v1-Weg eingefroren: Funktionstexte des v1-Wegs gleich (Klang/Hall-Kopplung unverändert), Konstanten gleich
  const src = pg => pg.evaluate(() => [g6Auto, g6Buf, g6Plan, g6Key, g6Build, g6Recipe, g6Step, g6Chord, g6HallK, g6Mix, g6Make, g6Fade, g6Kill, g6Took].map(f => String(f)).join('\n') + JSON.stringify([G6_COPY, G6_MIX, G6_PAN, G6_CAL]));
  const sn = await src(p), so = await src(o);
  ok('G6P-05 v1-Rechenweg und Hall-Kopplung unverändert (Code + Konstanten gleich), Konstanten eingefroren', sn === so && await p.evaluate(() => Object.isFrozen(G6V1.MIX['80']) && G6_COPY === G6V1.COPY), {same: sn === so});

  // G6P-06: v2-Daten mit allen Feldern → Speichern/Laden, Clip kopieren/duplizieren, ZIP, Verlauf → deep-equal; Format 6 genau dann
  const ids = await setup(p);
  const exp = await p.evaluate(([c, L, st]) => { SYNQUENZER.g6pLanes(L); const ok = SYNQUENZER.g6pSet({t: st, s: 0}, c); return {ok, chor: SYNQUENZER.g6pInfo({t: st, s: 0}).chor, lanes: deep(S.tracks[st].chor), norm: g6NormChor(c)}; }, [v2(ids.voice), LANES, ids.st]);
  ok('G6P-06 v2 gesetzt, Normalisieren ist verlustfrei (alle Felder)', exp.ok && JSON.stringify(exp.chor) === JSON.stringify(exp.norm) && JSON.stringify(exp.lanes) === JSON.stringify(LANES) && exp.chor.voices[1].take && exp.chor.voices[1].dblOff && exp.chor.voices[0].n[1].o === 1 && exp.chor.voices[0].n[1].x === -1, exp);
  const J = JSON.stringify(exp.chor), JL = JSON.stringify(exp.lanes);
  const rt = await p.evaluate(async ([st]) => {
    const out = {}, get = s => JSON.stringify(((S.tracks[st].clips[s] || {}).audio || {}).chor || null), L = () => JSON.stringify(S.tracks[st].chor || null);
    out.fmt = projectFileObj(S, true).format;
    const txt = JSON.stringify(projectFileObj(S, true)); importJSON(txt); await sleep(200); out.load = [get(0), L()];
    copyClip(st, 0); pasteClip(st, 3); out.paste = get(3); duplicateClip(st, 0); out.dup = [get(1), get(0)];
    out.undo = []; SYNQUENZER.undo(); out.undo.push(get(1)); SYNQUENZER.redo(); out.undo.push(get(1));
    const zr = await SYNQUENZER.tkZipRoundtrip(); importJSON(zr.json); await sleep(200); out.zip = [get(0), L()];
    await autosave.snapshotNow(); const J0 = get(0); S.tracks[st].clips[0].audio.chor.grp.below = 12; markDirty();
    const h = await SYNQUENZER.history(); const key = h && h[0] && (h[0].key || h[0]); await SYNQUENZER.restoreHistory(key); await sleep(300); out.hist = [get(0) === J0, L(), typeof key];
    return out;
  }, [ids.st]);
  ok('G6P-06 Format 6 mit v2-Inhalt', rt.fmt === 6, rt.fmt);
  ok('G6P-06 Speichern/Laden deep-equal (Stelle + Spuren)', rt.load[0] === J && rt.load[1] === JL);
  ok('G6P-06 Clip kopieren/einfügen, duplizieren deep-equal', rt.paste === J && rt.dup[0] === J && rt.dup[1] === J, {p: rt.paste === J, d: rt.dup.map(x => x === J)});
  ok('G6P-06 ZIP-Rundweg deep-equal', rt.zip[0] === J && rt.zip[1] === JL);
  ok('G6P-06 Verlauf (Version zurückholen) deep-equal', rt.hist && rt.hist[0] && rt.hist[1] === JL, rt.hist);
  // Song-Stimme mit v2 + Song-Undo
  const sv = await p.evaluate(async ([st, c]) => {
    const pj = JSON.parse(serializeProject()); const a = pj.tracks[st].clips[0].audio;
    pj.song = pj.song || {}; pj.song.vox = [Object.assign({id: 'V1', bar: 0, len: 1}, {take: a.take, in: a.in, out: a.out, at: 0, gain: 1, fadeIn: .005, fadeOut: .005, chor: c})];
    importJSON(JSON.stringify(pj)); await sleep(200); const v = S.song.vox && S.song.vox[0];
    const t2 = JSON.parse(JSON.stringify(projectFileObj(S, true))); importJSON(JSON.stringify(t2)); await sleep(150);
    return {chor: JSON.stringify(S.song.vox[0].chor), fmt: SQStore.fmtOf(JSON.parse(serializeProject()))};
  }, [ids.st, exp.chor]);
  ok('G6P-06 Song-Stimme mit v2: Laden deep-equal', sv.chor === J && sv.fmt === 6, sv);
  // Format 5 ↔ 6 nach Inhalt
  const f56 = await p.evaluate(([st]) => { const f = () => projectFileObj(S, true).format, r = [];
    r.push(f()); S.song.vox = []; delete S.song.vox; r.push(f()); delete S.tracks[st].clips[0].audio.chor; delete S.tracks[st].clips[1].audio.chor; delete S.tracks[st].clips[3].audio.chor; r.push(f());
    delete S.tracks[st].chor; r.push(f()); S.takes[Object.keys(S.takes)[0]].src = 'dup'; r.push(f()); S.takes[Object.keys(S.takes)[0]].src = 'rec'; r.push(f()); return r; }, [ids.st]);
  ok('G6P-06 Format genau dann 6, wenn v2-Inhalt (Chor v2 / Spuren / Take dup) da ist', JSON.stringify(f56) === JSON.stringify([6, 6, 6, 5, 6, 5]), f56);
  await p.ctx.close();
}
{ // G6P-07: Format-6-Datei in 4.25.2 → Banner, Speichern gesperrt, Daten unverändert; in der neuen Fassung kein Banner
  const p = await open(b), o = await open(b, OLD);
  const ids = await setup(p);
  await p.evaluate(([c, L, st]) => { SYNQUENZER.g6pLanes(L); SYNQUENZER.g6pSet({t: st, s: 0}, c); }, [v2(ids.voice), LANES, ids.st]);
  const txt = await p.evaluate(() => JSON.stringify(projectFileObj(S, true)));
  const ro = await o.evaluate(async t => { importJSON(t); await sleep(400); return {lock: !!NV.lock, ban: !!document.getElementById('nvBan'), raw: NV.raw ? JSON.stringify(NV.raw.project.tracks[stimmeT()].chor) : null}; }, txt);
  const rn = await p.evaluate(async t => { importJSON(t); await sleep(400); return {lock: !!NV.lock, ban: !!document.getElementById('nvBan')}; }, txt);
  ok('G6P-07 4.25.2: Banner „neuere Version“, NV.lock gesetzt, gespeicherte Daten unverändert', ro.lock && ro.ban && ro.raw === JSON.stringify(JSON.parse(txt).project.tracks[ids.st].chor), ro);
  ok('G6P-07 neue Fassung liest Format 6 ohne Sperre', !rn.lock && !rn.ban, rn);
  // Autosave mit Format 6 → 4.25.2 sperrt ebenfalls
  const as = await p.evaluate(async () => { await SYNQUENZER.save(); const v = await kv.get('project'); return v && v.project && v.project.format; });
  ok('G6P-07 Autosave trägt format 6 (ältere Fassung sperrt)', as === 6, as);
  // Format 7 → neue Fassung sperrt
  const r7 = await p.evaluate(async t => { const o = JSON.parse(t); o.format = 7; importJSON(JSON.stringify(o)); await sleep(300); return !!NV.lock; }, txt);
  ok('G6P-07 Format 7 → neue Fassung sperrt (Lese-Grenze 6)', r7);
  await p.ctx.close(); await o.ctx.close();
}
{ // G6P-08: geteilte Stücke – Duplikat behält die Stücke des gelöschten Lead-Takes; ohne Duplikat werden sie gelöscht
  const p = await open(b);
  const ids = await setup(p);
  const r = await p.evaluate(async ([lead, st]) => {
    const dup = 'd' + lead.slice(1); const m = deep(S.takes[lead]); S.takes[dup] = Object.assign(m, {src: 'dup', of: lead});
    const c = S.tracks[st].clips[0]; c.audio.take = dup;                       // die Stelle spielt nur noch das Duplikat
    delete S.takes[lead]; UNDO.length = 0; REDO.length = 0;
    for (const k of await kv.keys('')) if (/^(proj:|hist:)/.test(k)) await kv.del(k);
    await SYNQUENZER.save(); const n1 = await tkGc(); const keys1 = (await kv.akeys()).filter(k => String(k).startsWith(lead + ':'));
    TK.buf.clear(); TK.missing.clear(); const pcm = await tkPcm(dup);
    // ohne Duplikat
    delete S.takes[dup]; c.audio.take = Object.keys(S.takes)[0]; await SYNQUENZER.save(); const n2 = await tkGc(); const keys2 = (await kv.akeys()).filter(k => String(k).startsWith(lead + ':'));
    return {n1, keys1, pcm: pcm ? pcm.length : 0, n2, keys2, gc: TK.gc};
  }, [ids.lead, ids.st]);
  ok('G6P-08 Lead gelöscht, Duplikat da → Stücke bleiben, Duplikat lesbar', r.keys1.length >= 1 && r.pcm === 57600, r);
  ok('G6P-08 ohne Duplikat → Stücke des Leads gelöscht (TK.gc.deleted > 0)', r.n2 > 0 && r.keys2.length === 0, {n2: r.n2, keys2: r.keys2});
  await p.ctx.close();
}
{ // G6P-09: unbekannte lane → Spur aus rule, Farbe nach Tabelle; Spur ohne Stimme bleibt; Spur-Grenze 8
  const p = await open(b);
  const ids = await setup(p);
  const r = await p.evaluate(async ([c, st]) => {
    const pj = JSON.parse(serializeProject());
    c.voices[0].lane = 'c7'; c.voices[1].lane = 'c5'; delete c.voices[1].take;      // „aus einem anderen Projekt“: Spuren gibt es hier nicht
    pj.tracks[st].clips[0].audio.chor = c; pj.tracks[st].chor = {lanes: [{id: 'c1', role: 'st-4', name: 'Leer'}]};
    importJSON(JSON.stringify(pj)); await sleep(200);
    const i = SYNQUENZER.g6pInfo({t: st, s: 0}); return {lanes: i.lanes, voices: i.chor.voices.map(v => v.lane), colors: i.colors};
  }, [v2(ids.voice), ids.st]);
  ok('G6P-09 Stimmen bekommen Spuren aus ihrer Regel, leere Spur bleibt', JSON.stringify(r.lanes.lanes.map(l => [l.id, l.role, l.name])) === JSON.stringify([['c1', 'st-4', 'Leer'], ['c2', 'ch+1', 'Chor Akkordton oben'], ['c3', 'free', 'Gegenstimme 1']]) && JSON.stringify(r.voices) === '["c2","c3"]', r);
  ok('G6P-09 Farben: Akkord-Rolle = häufigstes Intervall (Terz rot), frei gelb, Quinte unten grün', JSON.stringify(r.colors.map(c => c.tok)) === '["chor5","chor3","chorf"]', r.colors);
  const col = await p.evaluate(() => { const t = [['st+2', 'chor3', '3'], ['st-2', 'chor3', '3'], ['st+2/o+1', 'chor3', '10'], ['st+4', 'chor5', '5'], ['st-4', 'chor5', '5'], ['st+5', 'chor6', '6'], ['st-5', 'chor6', '6'],
    ['oct+1', 'chor8', '8'], ['oct-1', 'chor8', '8'], ['st+3', 'chor4', '4'], ['st+1', 'chor2', '2'], ['st+6', 'chor2', '7'], ['uni', 'chor1', '1'], ['free', 'chorf', '–'], ['st+7', 'chor8', '8'], ['oct+2', 'chor8', '8']];
    return t.filter(([r, tok, d]) => { const c = SYNQUENZER.g6pColor(r); return c.tok !== tok || c.dig !== d; }); });
  ok('G6P-09 Farbtabelle §1.6 (16 Rollen inkl. Dezime „10“, Oktave unten „8“)', col.length === 0, col);
  const names = await p.evaluate(() => ['st+2', 'st-2', 'st+3', 'st-4', 'st+5', 'oct+1', 'oct-1', 'st+2/o+1', 'ch+1', 'ch-1', 'ch-2', 'root-', 'uni', 'free'].map(r => SYNQUENZER.g6pName(r)));
  ok('G6P-09 Namen nach Tabelle §2.2', JSON.stringify(names) === JSON.stringify(['Chor Terz oben', 'Chor Terz unten', 'Chor Quarte oben', 'Chor Quinte unten', 'Chor Sexte oben', 'Chor Oktave oben', 'Chor Oktave unten', 'Chor Terz + Oktave', 'Chor Akkordton oben', 'Chor Akkordton unten', 'Chor Akkordton unten 2', 'Chor Grundton', 'Chor Unisono', 'Gegenstimme 1']), names);
  // Spur-Grenze: 8 belegt, eine grau → übernommen; keine graue → null (Daten unverändert)
  const lim = await p.evaluate(() => { const ch = {lanes: []}; for (let k = 1; k <= 8; k++) ch.lanes.push({id: 'c' + k, role: 'st+' + (k % 7 + 1) , name: 'x' + k});
    const choirs = [{voices: [1, 2, 3, 4, 5, 6, 7].map(k => ({lane: 'c' + k}))}];
    const a = g6pLaneFor(ch, 'oct-1', new Set(), choirs); const full = [{voices: [1, 2, 3, 4, 5, 6, 7, 8].map(k => ({lane: 'c' + k}))}], before = JSON.stringify(ch);
    const b2 = g6pLaneFor(ch, 'oct-2', new Set(), full); return {a: a && [a.id, a.role, a.name], b: b2, same: JSON.stringify(ch) === before}; });
  ok('G6P-09 Spur-Grenze 8: graue Spur übernommen und umbenannt; keine graue → null, nichts geändert', lim.a && lim.a[0] === 'c8' && lim.a[1] === 'oct-1' && lim.a[2] === 'Chor Oktave unten' && lim.b === null && lim.same, lim);
  // Undo: Spur umbenennen = 1 Schritt (chorlanes), Stelle setzen = 1 Gruppen-Schritt
  const u = await p.evaluate(([st]) => { const L0 = JSON.stringify(S.tracks[st].chor), n0 = UNDO.length;
    SYNQUENZER.g6pLanes(ch => { ch.lanes[0].name = 'Neu'; }, 'Umbenennen'); const n1 = UNDO.length, k1 = UNDO[UNDO.length - 1].kind; SYNQUENZER.undo(); const L1 = JSON.stringify(S.tracks[st].chor);
    SYNQUENZER.redo(); const L2 = S.tracks[st].chor.lanes[0].name; SYNQUENZER.undo();
    const C0 = JSON.stringify(S.tracks[st].clips[0].audio.chor); SYNQUENZER.g6pSet({t: st, s: 0}, null); const k2 = UNDO[UNDO.length - 1]; SYNQUENZER.undo();
    return {steps: n1 - n0, k1, back: L1 === L0, redo: L2, grp: k2.kind + ':' + k2.items.map(x => x.kind).join(','), back2: JSON.stringify(S.tracks[st].clips[0].audio.chor) === C0}; }, [ids.st]);
  ok('G6P-09/Undo: Umbenennen 1 Schritt (chorlanes) ↶↷ deep-equal; Chor löschen = Gruppe clip+chorlanes', u.steps === 1 && u.k1 === 'chorlanes' && u.back && u.redo === 'Neu' && u.grp === 'group:clip,chorlanes' && u.back2, u);
  // G6P-K1 (Daten/Faktor): Lead −6 dB gekoppelt → Chor −6 dB; getrennt → unverändert; wieder an → Abstand bleibt
  const k = await p.evaluate(([st]) => { const T = S.tracks[st], f = T.sound.fx || (T.sound.fx = {}); f.vol = .8; const db = x => 20 * Math.log10(x);
    const g0 = SYNQUENZER.g6pFader(); f.vol = .8 * Math.pow(10, -6 / 20); const g1 = SYNQUENZER.g6pFader();
    SYNQUENZER.g6pCouple(false); const st1 = deep(T.chor); f.vol = .8; const g2 = SYNQUENZER.g6pFader();
    SYNQUENZER.g6pCouple(true); const g3 = SYNQUENZER.g6pFader(); f.vol = .8 * Math.pow(10, -3 / 20); const g4 = SYNQUENZER.g6pFader();
    const u0 = UNDO.length; SYNQUENZER.undo(); SYNQUENZER.undo(); const back = T.chor ? deep(T.chor) : null; return {d1: db(g1 / g0), d2: db(g2 / g1), d3: db(g3 / g2), d4: db(g4 / g3), st1, back}; }, [ids.st]);
  ok('G6P-K1 gekoppelt: Lead −6 dB → Chor −6 dB ±0,1', Math.abs(k.d1 + 6) <= .1, k.d1);
  ok('G6P-K1 getrennt: Lead +6 dB → Chor unverändert', Math.abs(k.d2) <= .01 && k.st1.cpl === false, {d2: k.d2, st1: k.st1});
  ok('G6P-K1 wieder an: Abstand bleibt (kein Sprung), danach wieder gemeinsam', Math.abs(k.d3) <= .01 && Math.abs(k.d4 + 3) <= .1, {d3: k.d3, d4: k.d4});
  ok('G6P-09 keine Konsolenfehler', !p.errs.length, p.errs);
  await p.ctx.close();
}
await b.close(); done();
