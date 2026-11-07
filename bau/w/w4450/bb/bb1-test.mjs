// BB1 – Werkzeugkasten: ein gezieltes Playwright-Skript (Figuren, Akkorde C | Am | F | G je Kategorie, Rhythmus/Swing, neue Version /
// neuer Clip / Original bleibt / Undo, [mit Klang] + Echo, Vorschau im Kontext und im Lauf, Speichern/Laden, alte Projekte, Pegel der
// neuen Klänge, Blatt hochkant 428×926 und quer 926×428 (Tasten ≥ 44 px, ✕ sichtbar), ROLLE-Knopf, Fotos).
// node bb1-test.mjs <index.html> [basis.html]
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const file = process.argv[2], basis = process.argv[3] || null;
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w4450/bb/';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const results = []; const ok = (name, pass, info) => { results.push({name, pass: !!pass, info}); console.log((pass ? 'OK   ' : 'FAIL ') + name + (info !== undefined ? '  ' + JSON.stringify(info).slice(0, 600) : '')); };
async function page(f, w, h) {
  const p = await b.newPage({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  p.errs = []; p.on('pageerror', e => p.errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') p.errs.push(m.text()); });
  await p.goto('file://' + f); await p.waitForFunction(() => window.SYNQUENZER && window.SQMK, null, {timeout: 60000});
  await p.waitForTimeout(600);
  return p;
}
// die Szene: Synth 3 (Fläche) spielt C | Am | F | G (4 Takte), Bass/Sequenz/Stabs leer (4 Takte), Drums: ein Grundbeat
const SETUP = async () => {
  await SYNQUENZER.newProject();
  const ch = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]], pad = [];
  ch.forEach((c, k) => c.forEach(n => pad.push({t: k * 4, d: 4, n, v: .7})));
  SYNQUENZER.setClip(2, 0, {len: 4, notes: pad});
  for (const t of [0, 1, 3]) SYNQUENZER.setClip(t, 0, {len: 4, notes: []});
  const dr = []; for (let i = 0; i < 16; i++) { dr.push({t: i, d: .1, n: 36, v: .8}); if (i % 2) dr.push({t: i, d: .1, n: 38, v: .8}); }
  for (let i = 0; i < 32; i++) dr.push({t: i * .5, d: .1, n: 42, v: .6});
  SYNQUENZER.setClip(4, 0, {len: 4, notes: dr});
};
const ROOT = [0, 9, 5, 7], PCS = [[0, 4, 7], [9, 0, 4], [5, 9, 0], [7, 11, 2]];

/* ---------- 1. hochkant 428×926: Daten, Akkorde, Ziele, Undo, Klang, Speichern/Laden ---------- */
const P = await page(file, 428, 926);
const reg = await P.evaluate(() => {
  const F = SYNQUENZER.bb1.figs(), by = {}, gen = {};
  for (const f of F) { by[f.r] = (by[f.r] || 0) + 1; gen[f.g] = (gen[f.g] || 0) + 1; }
  const L = BB1_SND.list, names = factoryNames(), dup = L.filter(f => names.filter(n => n.toLowerCase() === f.name.toLowerCase()).length > 1).map(f => f.name);
  const missing = F.filter(f => f.snd && !FACTORY_BY_ID.has(f.snd)).map(f => f.id);
  return {n: F.length, by, gen, genres: SYNQUENZER.bb1.genres().length, roles: SYNQUENZER.bb1.roles(), snd: {n: L.length, role: L.every(f => soundRole(f) === 'wkz'), chip: BROLES[BROLES.length - 1][0] === 'wkz', label: ROLE_LABEL.wkz,
    lib: L.every(f => SYNTH_LIB.indexOf(f) >= 0 && SYNTH_LIB.indexOf(f) < SYNTH_LIB.findIndex(x => x.cat === 'init')), clean: L.every(f => { const s = factorySound(f.id); return s && s.origin === f.id && !soundEdited(s); }), dup}, missing};
});
ok('≥ 30 Figuren, alle 6 Rollen, jede Rolle ≥ 4', reg.n >= 30 && reg.roles.length === 6 && reg.roles.every(r => reg.by[r] >= 4), {n: reg.n, by: reg.by});
ok('8 Genres, jedes mit ≥ 3 Figuren', reg.genres === 8 && Object.keys(reg.gen).length === 8 && Object.values(reg.gen).every(v => v >= 3), reg.gen);
ok('Klänge: Kategorie „Werkzeugkasten“ (Chip am Ende, vor INIT), laden unverändert, Namen eindeutig', reg.snd.n === 6 && reg.snd.role && reg.snd.chip && reg.snd.label === 'Werkzeugkasten' && reg.snd.lib && reg.snd.clean && !reg.snd.dup.length && !reg.missing.length, reg.snd);

await P.evaluate(SETUP);
const ctx = await P.evaluate(() => SYNQUENZER.bb1.ctx(0, 0));
ok('Akkorde der Stelle: C | Am | F | G aus den Noten der Szene', ctx && ctx.line === 'C | Am | F | G' && ctx.how === 'notes', ctx && {line: ctx.line, how: ctx.how});

// je Kategorie eine Figur über C | Am | F | G (Ergebnis ohne Einsetzen)
const cat = await P.evaluate(() => {
  const B = SYNQUENZER.bb1, o = {};
  for (const [t, id] of [[0, 'disco-galopp'], [0, 'euro-rolling'], [0, 'njs-bass'], [1, 'arp-auf'], [1, 'pluck-16'], [3, 'disco-brass'], [3, 'fanfare-stack'], [3, 'house-piano'], [1, 'pad-bewegung'], [1, 'antwort-auf'], [4, 'snare-wirbel'], [4, 'tom-fill'], [4, 'openhat-offbeat'], [4, 'clap-aufbau']]) {
    const x = B.build(t, 0, id); o[id] = x ? {notes: x.notes, gen: x.gen, len: x.len} : null;
  }
  return o;
});
const bar = n => Math.min(3, Math.floor(n.t / 4 + 1e-6));
{ // Bass: Grundton am Taktanfang folgt den Akkorden, Lage tief; Rhythmus des Galopps (0 · ½ · ¾ je Schlag)
  const n = cat['disco-galopp'].notes, down = [0, 1, 2, 3].map(k => n.filter(x => Math.abs(x.t - 4 * k) < 1e-6).map(x => x.n % 12));
  const rhy = [...new Set(n.map(x => +(x.t % 1).toFixed(3)))].sort();
  ok('Bass Disco-Galopp: Grundton je Takt = C A F G, Lage 33…59, Rhythmus 0 · ½ · ¾', down.every((d, k) => d.length === 1 && d[0] === ROOT[k]) && n.every(x => x.n >= 33 && x.n <= 59) && JSON.stringify(rhy) === '[0,0.5,0.75]', {down, rhy, lo: Math.min(...n.map(x => x.n)), hi: Math.max(...n.map(x => x.n))});
  const r = cat['euro-rolling'].notes; ok('Eurodance-Rolling-Bass: die Eins frei, drei Sechzehntel je Schlag, Akkordtöne', r.every(x => Math.abs(x.t % 1) > 1e-6) && r.length === 48 && r.every(x => PCS[bar(x)].includes(x.n % 12)), {n: r.length});
  const j = cat['njs-bass'].notes, odd = j.filter(x => Math.abs((x.t * 4) % 2 - 1) < .4).map(x => +((x.t * 4) % 1).toFixed(3));
  ok('New-Jack-Swing-Bass: Swing (2. Sechzehntel um 0,06 Schlag später) und Akkordtöne', odd.length > 0 && odd.every(v => Math.abs(v - .24) < .01) && j.every(x => PCS[bar(x)].includes(x.n % 12)), {odd: [...new Set(odd)]});
}
{ // Sequenz: nur Akkordtöne des Takts, Lage mittel
  const a = cat['arp-auf'].notes; ok('Sequenz Arp aufwärts: nur Akkordtöne des Takts, 55…84', a.length === 64 && a.every(x => PCS[bar(x)].includes(x.n % 12) && x.n >= 55 && x.n <= 84), {n: a.length});
  const q = cat['pluck-16'].notes; ok('16tel-Pluck: 64 Sechzehntel, Akkordtöne', q.length === 64 && q.every(x => PCS[bar(x)].includes(x.n % 12)));
}
{ // Stabs: Akkord in der Mitte, Stapel mit Grundton darunter; Fanfare; House-Piano mit Septime (keine Sekunde unten)
  const s = cat['disco-brass'].notes, at = t => s.filter(x => Math.abs(x.t - t) < 1e-6).map(x => x.n).sort((a, c) => a - c);
  const groups = [0, 4, 8, 12].map(t => at(t));
  ok('Stabs Disco-Brass: je Takt der Akkord (C · Am · F · G) gestapelt, Grundton unten, Lage 40…80', groups.every((g, k) => g.length === 4 && g[0] % 12 === ROOT[k] && g.slice(1).every(n => PCS[k].includes(n % 12)) && g[0] >= 40 && g[3] <= 80), groups);
  const f = cat['fanfare-stack'].notes; ok('Fanfaren-Stack: Akkordtöne, ≥ 3 Stimmen je Stoß', f.length >= 80 && f.every(x => PCS[bar(x)].includes(x.n % 12)), {n: f.length});
  const h = cat['house-piano'].notes, h0 = h.filter(x => x.t === 0).map(x => x.n).sort((a, c) => a - c);
  ok('House-Piano: Septime dabei, keine Sekunde ganz unten', h0.length === 4 && h0.some(n => n % 12 === 11) && h0[1] - h0[0] > 2, h0);
}
{ // Pads: Haltetöne je Akkord, nur die obere Stimme bewegt sich
  const pd = cat['pad-bewegung'].notes, held = pd.filter(x => x.d >= 3.99);
  ok('Pads Haltetöne mit Bewegung: je Takt 2 liegende Akkordtöne + Oberstimme, Akkord C · Am · F · G', held.length === 8 && held.every(x => PCS[bar(x)].includes(x.n % 12)) && pd.length === 20, {held: held.length, n: pd.length});
}
{ // Lead-Füller: nur in den Lücken am Ende jeder Zwei-Takt-Phrase, Akkordtöne
  const l = cat['antwort-auf'].notes; ok('Lead-Füller Antwort: Takt 2 und 4, Schlag 3–4, Akkordtöne', l.length === 10 && l.every(x => (x.t >= 6 - 1e-6 && x.t < 8) || (x.t >= 14 - 1e-6 && x.t < 16)) && l.every(x => PCS[bar(x)].includes(x.n % 12)), l.map(x => x.t));
}
{ // Drums-Füller: im letzten Takt, eigene Pads ersetzt, der Rest bleibt
  const s = cat['snare-wirbel'].notes, sn = s.filter(x => x.n === 38 && x.t >= 12), kick = s.filter(x => x.n === 36).length, hat = s.filter(x => x.n === 42).length;
  ok('Drums Snare-Wirbel: Snare-Lauf im letzten Takt (12 Schläge), Bassdrum und Hi-Hat bleiben', sn.length === 12 && kick === 16 && hat === 32, {sn: sn.length, kick, hat});
  const tm = cat['tom-fill'].notes, toms = tm.filter(x => [45, 47, 50].includes(x.n));
  ok('Drums Tom-Wirbel: 8 Toms auf Schlag 15–16, Snare bleibt', toms.length === 8 && toms.every(x => x.t >= 14) && tm.filter(x => x.n === 38).length === 8, {toms: toms.map(x => x.t)});
  const oh = cat['openhat-offbeat'].notes; ok('Open-Hat im Offbeat: 16 offene, die geschlossene im Offbeat macht Platz', oh.filter(x => x.n === 46).length === 16 && !oh.some(x => x.n === 42 && Math.abs(x.t % 1 - .5) < 1e-6), {open: oh.filter(x => x.n === 46).length});
  const cb = cat['clap-aufbau'].notes.filter(x => x.n === 39); ok('Clap-Aufbau (4 Takte): 8 Viertel, 8 Achtel, 16 Sechzehntel, lauter werdend', cb.length === 8 + 8 + 16 && cb.filter(x => x.t < 8).length === 8 && cb.filter(x => x.t >= 12).length === 16 && cb[cb.length - 1].v > cb[0].v, {n: cb.length});
}

// Einsetzen ohne Song: neuer Clip (Original bleibt), Undo, Redo
const neu = await P.evaluate(() => {
  const o0 = JSON.stringify(S.tracks[0].clips[0]), tg = SYNQUENZER.bb1.targets(0, 0).map(z => z.k), u0 = UNDO.length;
  const r = SYNQUENZER.bb1.insert(0, 0, 'disco-galopp', {ziel: 'neu'});
  const nc = r && S.tracks[0].clips[r.s2], a = {tg, r, orig: JSON.stringify(S.tracks[0].clips[0]) === o0, n: nc ? nc.notes.length : 0, key: nc && nc.key, u: UNDO.length - u0, label: UNDO[UNDO.length - 1].label};
  undo(); a.afterUndo = !S.tracks[0].clips[r.s2] && JSON.stringify(S.tracks[0].clips[0]) === o0;
  redo(); a.afterRedo = !!S.tracks[0].clips[r.s2] && S.tracks[0].clips[r.s2].notes.length === a.n;
  undo();
  return a;
});
ok('ohne Song: Ziel „Neuer Clip“ (Szene 2), Original bleibt, ein Undo, Redo', neu.tg.join() === 'neu,hier' && neu.r.k === 'neu' && neu.r.s2 === 1 && neu.orig && neu.n === 48 && neu.u === 1 && neu.label === 'Werkzeugkasten: Disco-Galopp' && neu.afterUndo && neu.afterRedo, neu);
// ein kurzer Clip wächst auf die Länge der Akkorde
const grow = await P.evaluate(() => { SYNQUENZER.setClip(0, 5, {len: 1, notes: []}); const B = SYNQUENZER.bb1.build(0, 5, 'oktav-disco', 'hier'); return B && {len: B.len, n: B.notes.length}; });
ok('kurzer Clip (1 Takt) in einer leeren Szene: bleibt 1 Takt (Tonart)', grow && grow.len === 1 && grow.n === 8, grow);
const grow2 = await P.evaluate(() => { SYNQUENZER.setClip(0, 0, {len: 1, notes: []}); const B = SYNQUENZER.bb1.build(0, 0, 'oktav-disco', 'neu'); const r = {len: B.len, roots: [0, 4, 8, 12].map(t => B.notes.find(n => Math.abs(n.t - t) < 1e-6).n % 12)}; SYNQUENZER.setClip(0, 0, {len: 4, notes: []}); SYNQUENZER.clearClip && SYNQUENZER.clearClip(0, 5); return r; });
ok('1-Takt-Bass unter 4 Takten Akkorden: wächst auf 4 Takte und folgt C A F G', grow2.len === 4 && grow2.roots.join() === ROOT.join(), grow2);

// mit Song: neue Version v2 (SX9) an den Stellen von v1, Original bleibt, ein Undo; mit Klang + Echo in derselben Gruppe
const ver = await P.evaluate(() => {
  songFromChain([{scene: 0, bars: 4}]);
  S.fxBus.echo = Object.assign({}, S.fxBus.echo, {divL: '1/4', fb: .2}); applyFxBus();
  const o0 = JSON.stringify(S.tracks[0].clips[0]), snd0 = S.tracks[0].sound.origin, u0 = UNDO.length;
  const tg = SYNQUENZER.bb1.targets(0, 0);
  const r = SYNQUENZER.bb1.insert(0, 0, 'disco-echo', {ziel: 'ver', klang: true});
  const song = S.song, L = sx9List(song, 0, 0), v = L[0] && song.own[L[0].id], at = [0, 1, 2, 3].map(x => { const h = sx9At(song, 0, x); return h ? h.v : null; });
  const a = {tg: tg.map(z => z.k + (z.v ? z.v : '')), r, vers: L.map(q => q.v), vn: v ? v.notes.length : 0, from: v && v.from, at, orig: JSON.stringify(S.tracks[0].clips[0]) === o0,
    snd: S.tracks[0].sound.origin, echo: {divL: S.fxBus.echo.divL, fb: S.fxBus.echo.fb}, dly: S.tracks[0].sound.fx.dly, u: UNDO.length - u0, top: UNDO[UNDO.length - 1].kind, items: (UNDO[UNDO.length - 1].items || []).map(x => x.kind)};
  a.save = SYNQUENZER.serialize();
  undo();
  a.undo = {vers: sx9List(S.song, 0, 0).length, snd: S.tracks[0].sound.origin === snd0, echo: S.fxBus.echo.divL === '1/4' && Math.abs(S.fxBus.echo.fb - .2) < 1e-9, orig: JSON.stringify(S.tracks[0].clips[0]) === o0, at: sx9At(S.song, 0, 0).v};
  redo();
  a.redo = {vers: sx9List(S.song, 0, 0).length, snd: S.tracks[0].sound.origin, echo: S.fxBus.echo.divL};
  return a;
});
ok('mit Song: Ziele Neue Version v2 · Neuer Clip · Diesen Clip', ver.tg.join() === 'ver2,neu,hier', ver.tg);
ok('Neue Version v2 mit den Noten der Figur, spielt an allen 4 Takten, v1 (Original) unverändert', ver.r && ver.r.k === 'ver' && ver.vers.join() === '2' && ver.vn === 32 && ver.from && ver.from.s === 0 && ver.at.every(v => v === 2) && ver.orig, {r: ver.r, at: ver.at, vn: ver.vn});
ok('[mit Klang]: Disco-Echo-Bass + Echo 1/8 punktiert (Send 35 %) – eine Undo-Gruppe (Song + Klang + Echo)', ver.snd === 'f-bb-disco-bass' && ver.echo.divL === '1/8.' && Math.abs(ver.echo.fb - .38) < 1e-9 && Math.abs(ver.dly - .35) < 1e-9 && ver.u === 1 && ver.top === 'group' && ver.items.join() === 'song,sound,fx', {snd: ver.snd, echo: ver.echo, items: ver.items});
ok('↶ holt alles zurück (Version weg, Klang, Echo, v1 spielt), ↷ wieder da', ver.undo.vers === 0 && ver.undo.snd && ver.undo.echo && ver.undo.orig && ver.undo.at === 1 && ver.redo.vers === 1 && ver.redo.snd === 'f-bb-disco-bass' && ver.redo.echo === '1/8.', {undo: ver.undo, redo: ver.redo});

// Speichern → Laden: Version, Klang, Echo gleich
const rt = await P.evaluate(async (save) => {
  const a = {own: JSON.stringify(S.song.own), snd: JSON.stringify(S.tracks[0].sound), echo: JSON.stringify(S.fxBus.echo), clip: JSON.stringify(S.tracks[0].clips[0])};
  await SYNQUENZER.importJSON(typeof save === 'string' ? save : JSON.stringify(save)); await new Promise(r => setTimeout(r, 250));
  const b2 = {own: JSON.stringify(S.song.own), snd: JSON.stringify(S.tracks[0].sound), echo: JSON.stringify(S.fxBus.echo), clip: JSON.stringify(S.tracks[0].clips[0])};
  const s1 = SYNQUENZER.serialize(); await SYNQUENZER.importJSON(typeof s1 === 'string' ? s1 : JSON.stringify(s1)); await new Promise(r => setTimeout(r, 200));
  const s2 = SYNQUENZER.serialize();
  return {own: a.own === b2.own, snd: a.snd === b2.snd, echo: a.echo === b2.echo, clip: a.clip === b2.clip, stable: JSON.stringify(s1) === JSON.stringify(s2), v2: sx9List(S.song, 0, 0).map(q => q.v).join(), edited: SYNQUENZER.soundEdited(0)};
}, ver.save);
ok('Speichern → Laden: Version v2, Klang, Echo, Original gleich; Laden stabil', rt.own && rt.snd && rt.echo && rt.clip && rt.stable && rt.v2 === '2' && !rt.edited, rt);

// Diesen Clip: ersetzt, ein Undo
const hier = await P.evaluate(() => { const o0 = JSON.stringify(S.tracks[3].clips[0]); const r = SYNQUENZER.bb1.insert(3, 0, 'offbeat-akkorde', {ziel: 'hier'}); const n = S.tracks[3].clips[0].notes.length; undo(); return {r, n, back: JSON.stringify(S.tracks[3].clips[0]) === o0}; });
ok('Diesen Clip: Noten ersetzt (48), ↶ holt den Clip zurück', hier.r && hier.r.k === 'hier' && hier.n === 48 && hier.back, hier);
// Drums auf der Drum-Spur als neue Version, Grundmuster-Fall (Akkord-Zeile, Spur folgt)
const dv = await P.evaluate(() => { const o0 = JSON.stringify(S.tracks[4].clips[0]); const r = SYNQUENZER.bb1.insert(4, 0, 'tom-fill', {}); const L = sx9List(S.song, 4, 0); const v = L.length && S.song.own[L[0].id]; const a = {r, toms: v ? v.notes.filter(n => [45, 47, 50].includes(n.n)).length : 0, orig: JSON.stringify(S.tracks[4].clips[0]) === o0}; undo(); return a; });
ok('Drums-Füller als neue Version der Drum-Spur, Original bleibt', dv.r && dv.r.k === 'ver' && dv.toms === 8 && dv.orig, dv);
const gm = await P.evaluate(() => {
  const C = chordTarget(0, 'maj'), Am = chordTarget(9, 'min'), F = chordTarget(5, 'maj'), G = chordTarget(7, 'maj');
  SYNQUENZER.setChordRow('S3', {len: 4, ch: [{b: 0, tg: C}, {b: 4, tg: Am}, {b: 8, tg: F}, {b: 12, tg: G}]});
  SYNQUENZER.setClip(0, 2, {len: 4, notes: []});
  const x = SYNQUENZER.bb1.ctx(0, 2), B = SYNQUENZER.bb1.build(0, 2, 'oktav-disco', 'neu');
  return {how: x.how, gm: x.gm, line: x.line, written: [...new Set(B.notes.map(n => n.n % 12))], snd: [0, 4, 8, 12].map(t => B.snd.find(n => Math.abs(n.t - t) < 1e-6).n % 12), len: B.len};
});
ok('Akkord-Zeile C | Am | F | G (Spur folgt): Grundmuster auf C geschrieben, klingt als C A F G', gm.how === 'row' && gm.gm && gm.line === 'C | Am | F | G' && gm.written.join() === '0' && gm.snd.join() === ROOT.join(), gm);
ok('hochkant ohne Fehler (Daten)', P.errs.length === 0, P.errs.slice(0, 3));

/* ---------- 2. Blatt hochkant: Clip-Blatt [Werkzeugkasten ▾], Tasten, ✕, Vorschau, Einsetzen per Tipp, ROLLE ---------- */
await P.evaluate(SETUP);
await P.evaluate(() => openClipSheet(0, 0)); await P.waitForTimeout(250);
const cbtn = await P.evaluate(() => { const b = document.querySelector('#clipSheet .bb1cb'); if (!b) return null; const r = b.getBoundingClientRect(); return {h: Math.round(r.height), vis: r.bottom <= innerHeight && r.top >= 0}; });
ok('Clip-Blatt: [Werkzeugkasten ▾] da, 44 px', cbtn && cbtn.h >= 44 && cbtn.vis, cbtn);
await P.tap('#clipSheet .bb1cb'); await P.waitForTimeout(300);
const geo = p => p.evaluate(() => {
  const P = document.querySelector('.pop.bb1s'); if (!P) return null; const r = P.getBoundingClientRect();
  const bs = [...P.querySelectorAll('button')].filter(x => x.getBoundingClientRect().width > 0);
  const small = bs.filter(x => x.getBoundingClientRect().height < 43.5).map(x => x.textContent.trim().slice(0, 20) + ':' + Math.round(x.getBoundingClientRect().height));
  const X = P.querySelector('.ms-x').getBoundingClientRect();
  const cut = [...P.querySelectorAll('.bb1-roles .rb')].filter(x => x.scrollWidth > x.clientWidth + 1 || x.getBoundingClientRect().right > innerWidth + .5).map(x => x.textContent);
  return {top: Math.round(r.top), h: Math.round(r.height), inView: r.top >= 0 && r.bottom <= innerHeight + .5, small, x: {w: X.width, h: X.height, vis: X.top >= 0 && X.right <= innerWidth + .5 && X.left >= 0}, cut, n: bs.length};
});
const gP = await geo(P);
ok('Blatt hochkant: im Bild, alle Tasten ≥ 44 px, ✕ sichtbar (44 × 44), Rollen-Reiter ganz lesbar', gP && gP.inView && !gP.small.length && gP.x.vis && gP.x.w >= 44 && gP.x.h >= 44 && !gP.cut.length, gP);
const st0 = await P.evaluate(() => SYNQUENZER.bb1.state());
ok('Blatt öffnet mit der passenden Rolle (leerer Synth 1 = Bass) und dem Ziel „Neuer Clip“', st0.open && st0.role === 'bass' && st0.ziel === 'neu', st0);
await P.tap('.pop.bb1s button[data-gen="disco"]'); await P.waitForTimeout(150);
const nDisco = await P.evaluate(() => document.querySelectorAll('.pop.bb1s button[data-fig]').length);
ok('Genre-Filter Disco-Pop: 3 Bass-Figuren', nDisco === 3, nDisco);
await P.tap('.pop.bb1s button[data-gen="alle"]'); await P.waitForTimeout(150);
await P.tap('.pop.bb1s button[data-fig="disco-echo"]'); await P.waitForTimeout(450);
const pv = await P.evaluate(() => ({st: SYNQUENZER.bb1.state(), voices: VOICES.filter(v => !v.dead && v.src === 'audition').length, ctxTracks: [...new Set(VOICES.filter(v => !v.dead && v.src === 'audition').map(v => v.track))]}));
ok('Tipp auf eine Figur = Vorschau im Kontext (Figur + Fläche der Szene)', pv.st.fig === 'disco-echo' && pv.st.pv && !pv.st.pv.swap && pv.voices > 0 && pv.ctxTracks.includes(0) && pv.ctxTracks.includes(2), pv);
await P.tap('.pop.bb1s button[data-bb="klang"]'); await P.waitForTimeout(150);
await P.screenshot({path: OUT + 'bb1-p-blatt.png'});
await P.tap('.pop.bb1s button[data-bb="ins"]'); await P.waitForTimeout(350);
const ins = await P.evaluate(() => ({open: SYNQUENZER.bb1.state().open, pv: SYNQUENZER.bb1.state().pv, c1: S.tracks[0].clips[1] && S.tracks[0].clips[1].notes.length, snd: S.tracks[0].sound.origin, label: UNDO[UNDO.length - 1].label, toast: [...document.querySelectorAll('.toast,#toast')].map(x => x.textContent).join(' ')}));
ok('[Einsetzen] per Tipp: neuer Clip Szene 2 (32 Noten) mit Klang, Blatt zu, Vorschau aus', !ins.open && !ins.pv && ins.c1 === 32 && ins.snd === 'f-bb-disco-bass' && ins.label === 'Werkzeugkasten: Offbeat-Staccato mit Echo', ins);
// ROLLE: [Werkzeugkasten] direkt hinter [Spielweise], Trefferfläche ≥ 44 px
await P.evaluate(() => { closeSheets(); openRoll(0, 0); }); await P.waitForTimeout(400);
const ro = await P.evaluate(() => { const acts = ED.roll && ED.roll.el.acts; if (!acts) return null; const ch = [...acts.children], i = ch.findIndex(x => x.classList.contains('bb1rb')), b = ch[i];
  if (b) b.scrollIntoView({inline: 'center'}); const r = b ? b.getBoundingClientRect() : null, af = b ? getComputedStyle(b, '::after') : null;
  return {i, prev: i > 0 ? ch[i - 1].textContent : null, h: r && Math.round(r.height), hit: r && Math.round(r.height + parseFloat(af.bottom) * -1 + parseFloat(af.top) * -1)}; });
ok('ROLLE: [Werkzeugkasten] direkt hinter [Spielweise], Trefferfläche ≥ 44 px', ro && ro.prev === 'Spielweise' && ro.hit >= 44, ro);
await P.waitForTimeout(150);
await P.screenshot({path: OUT + 'bb1-p-rolle.png', clip: {x: 0, y: 0, width: 428, height: 926}});
await P.evaluate(() => { const b = document.querySelector('#rollSheet .bb1rb'); b.click(); }); await P.waitForTimeout(300);
ok('ROLLE-Knopf öffnet das Blatt für diesen Clip', (await P.evaluate(() => { const s = SYNQUENZER.bb1.state(); return s.open && s.t === 0 && s.s === 0; })));
await P.tap('.pop.bb1s .ms-x'); await P.waitForTimeout(150);
ok('✕ schließt das Blatt', !(await P.evaluate(() => SYNQUENZER.bb1.state().open)));
ok('Blatt hochkant ohne Fehler', P.errs.length === 0, P.errs.slice(0, 3));

/* ---------- 3. Vorschau im Lauf: der laufende Clip hört die Figur, ✕ holt das Original zurück (kein Undo, nichts gespeichert) ---------- */
const live = await P.evaluate(async () => {
  closeSheets(); SYNQUENZER.setClip(0, 0, {len: 4, notes: [{t: 0, d: 1, n: 36, v: .8}, {t: 4, d: 1, n: 33, v: .8}]});
  launchScene(0); await new Promise(r => setTimeout(r, 400));
  const o0 = JSON.stringify(S.tracks[0].clips[0]), u0 = UNDO.length;
  SYNQUENZER.bb1.open(0, 0); SYNQUENZER.bb1.act('button[data-fig="hinrg-16"]');
  await new Promise(r => setTimeout(r, 300));
  const st = SYNQUENZER.bb1.state(), during = S.tracks[0].clips[0].notes.length, sched = VOICES.filter(v => !v.dead && v.track === 0 && v.src === 'clip').length;
  SYNQUENZER.bb1.act('.ms-x'); await new Promise(r => setTimeout(r, 100));
  const a = {playing: R.playing, swap: st.pv && st.pv.swap, during, sched, back: JSON.stringify(S.tracks[0].clips[0]) === o0, undo: UNDO.length - u0};
  stop(); return a;
});
ok('Vorschau im Lauf: Clip spielt die Figur (64 Noten), ✕ → Original exakt zurück, kein Undo-Schritt', live.playing && live.swap && live.during === 64 && live.back && live.undo === 0, live);
ok('Vorschau ohne Fehler', P.errs.length === 0, P.errs.slice(0, 3));

/* ---------- 4. Pegel der neuen Klänge: trocken (Vorhör-Phrase, 112 BPM) + Song-Render ---------- */
const lv = await P.evaluate(async () => {
  mkLoad();
  const db = x => x > 0 ? 20 * Math.log10(x) : -999;
  function biq(x, b0, b1, b2, a1, a2) { const y = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const v = b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; } return y; }
  const kw = x => biq(biq(x, 1.53512485958697, -2.69169618940638, 1.19839281085285, -1.69065929318241, .73248077421585), 1, -2, 1, -1.99004745483398, .99007225036621);
  function lufs(l, r, sr) { const L = kw(l), R = kw(r), N = Math.round(.4 * sr), H = Math.round(.1 * sr), z = []; for (let s = 0; s + N <= L.length; s += H) { let a = 0; for (let i = s; i < s + N; i++) a += L[i] * L[i] + R[i] * R[i]; z.push(a / N); }
    const lk = q => -.691 + 10 * Math.log10(q); let g = z.filter(q => lk(q) > -70); if (!g.length) return -999; const m1 = g.reduce((a, q) => a + q, 0) / g.length; g = g.filter(q => lk(q) > lk(m1) - 10); return lk(g.reduce((a, q) => a + q, 0) / g.length); }
  const meas = (l, r, sr) => { let pk = 0, nan = 0; for (let i = 0; i < l.length; i++) { if (!isFinite(l[i]) || !isFinite(r[i])) nan++; pk = Math.max(pk, Math.abs(l[i]), Math.abs(r[i])); } return {peak: +db(pk).toFixed(1), lufs: +lufs(l, r, sr).toFixed(1), nan}; };
  const out = [];
  for (const f of BB1_SND.list) {
    const o = {name: f.name}, snd = factorySound(f.id), ph = SQF.PREVIEW[f.demo], spb = 60 / 112, sec = SQF.PREVIEW_SEC[f.demo] + 2.5;
    const ev = []; ph.forEach(([bt, d, n, v], k) => { ev.push([bt * spb, 'on', n, v, 1000 + k]); ev.push([(bt + d) * spb, 'off', n, v, 1000 + k]); }); ev.sort((a, c) => a[0] - c[0]);
    const r = await mkRender(snd, ev, {sec, bpm: 112}); o.dry = meas(r.l, r.r, 48000);
    await SYNQUENZER.newProject(); SYNQUENZER.setSound(0, factorySound(f.id));
    SYNQUENZER.setClip(0, 0, {len: 2, notes: ph.map(([t, d, n, v]) => ({t, d, n, v}))}); songFromChain([{scene: 0, bars: 2}]);
    await SYNQUENZER.vvRender({range: {a: 0, b: 2}}); o.song = meas(VV.last.ch[0], VV.last.ch[1], VV.last.sr);
    out.push(o);
  }
  return out;
});
for (const o of lv) console.log('      ' + o.name.padEnd(20) + ('trocken ' + o.dry.lufs + ' LUFS, Spitze ' + o.dry.peak + ' dBFS').padEnd(40) + 'Song ' + o.song.lufs + ' LUFS, Spitze ' + o.song.peak + ' dBFS');
ok('Pegel trocken −18 ± 1,5 LUFS, Spitze ≤ −1 dBFS, kein NaN', lv.every(o => Math.abs(o.dry.lufs + 18) <= 1.5 && o.dry.peak <= -1 && !o.dry.nan), lv.map(o => o.name + ' ' + o.dry.lufs + '/' + o.dry.peak));
ok('Song-Render: nicht stumm (> −30 LUFS), Spitze ≤ −1 dBFS', lv.every(o => o.song.lufs > -30 && o.song.peak <= -1 && !o.song.nan), lv.map(o => o.name + ' ' + o.song.lufs + '/' + o.song.peak));
ok('Pegel-Lauf ohne Fehler', P.errs.length === 0, P.errs.slice(0, 3));
await P.close();

/* ---------- 5. quer 926×428 ---------- */
const L = await page(file, 926, 428);
await L.evaluate(SETUP);
await L.evaluate(() => openClipSheet(3, 0)); await L.waitForTimeout(250);
await L.tap('#clipSheet .bb1cb'); await L.waitForTimeout(300);
await L.tap('.pop.bb1s button[data-role="stab"]'); await L.waitForTimeout(150);
await L.tap('.pop.bb1s button[data-fig="disco-brass"]'); await L.waitForTimeout(300);
const gL = await geo(L);
ok('Blatt quer: im Bild, alle Tasten ≥ 44 px, ✕ sichtbar, Rollen-Reiter ganz lesbar', gL && gL.inView && !gL.small.length && gL.x.vis && !gL.cut.length, gL);
await L.screenshot({path: OUT + 'bb1-l-blatt.png'});
await L.evaluate(() => closePop());
await L.evaluate(() => { closeSheets(); openClipSheet(4, 0); }); await L.waitForTimeout(250);
await L.tap('#clipSheet .bb1cb'); await L.waitForTimeout(300);
const dq = await L.evaluate(() => ({st: SYNQUENZER.bb1.state(), roles: [...document.querySelectorAll('.pop.bb1s [data-role]')].map(b => b.dataset.role), klang: !!document.querySelector('.pop.bb1s [data-bb="klang"]'), n: document.querySelectorAll('.pop.bb1s [data-fig]').length}));
ok('Drum-Clip: nur „Drums-Füller“ (6 Figuren), kein [mit Klang]', dq.roles.join() === 'drum' && dq.n === 6 && !dq.klang, dq);
const gD = await geo(L); ok('Drum-Blatt quer: Tasten ≥ 44 px, ✕ sichtbar', gD && !gD.small.length && gD.x.vis, gD);
ok('quer ohne Fehler', L.errs.length === 0, L.errs.slice(0, 3));
await L.close();

/* ---------- 6. alte Projekte unverändert: dieselbe Szene in der Basis gespeichert → hier geladen → gespeichert = gleich ---------- */
if (basis) {
  const Bp = await page(basis, 428, 926);
  const old = await Bp.evaluate(async (setup) => { await (new Function('return ' + setup)())(); songFromChain([{scene: 0, bars: 4}]); const s = SYNQUENZER.serialize(); return typeof s === 'string' ? s : JSON.stringify(s); }, SETUP.toString());
  await Bp.close();
  const Np = await page(file, 428, 926);
  const same = await Np.evaluate(async (old) => { await SYNQUENZER.importJSON(old); await new Promise(r => setTimeout(r, 250)); const s = SYNQUENZER.serialize(); const a = JSON.parse(old), b2 = JSON.parse(typeof s === 'string' ? s : JSON.stringify(s));
    const strip = o => { const x = JSON.parse(JSON.stringify(o)); for (const k of ['saved', 'savedAt', 'mt', 'ct', 'id', 'time']) delete x[k]; return JSON.stringify(x.project || x); };
    return {same: strip(a) === strip(b2), la: old.length, lb: JSON.stringify(b2).length}; }, old);
  ok('altes Projekt (Basis) lädt und speichert hier gleich', same.same, same);
  ok('Basis-Vergleich ohne Fehler', Np.errs.length === 0, Np.errs.slice(0, 3));
  await Np.close();
}
await b.close();
const fail = results.filter(r => !r.pass);
console.log('\n' + (results.length - fail.length) + '/' + results.length + ' OK' + (fail.length ? ' · FAIL: ' + fail.map(r => r.name).join(' | ') : ''));
process.exit(fail.length ? 1 : 0);
