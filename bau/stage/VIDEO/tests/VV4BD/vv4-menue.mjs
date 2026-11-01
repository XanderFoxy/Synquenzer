// VV4-B Bild-Menü je Taktbereich: setzen / ändern / Undo über die echte Bedienung (Marken-Blatt, ⋯ der Bereich-Leiste),
// Streifen-Farbe je Wahl, Speichern/Laden (Datei + Browser-Speicher), alte Songs laden unverändert
import { open, SONG, UE, OUT } from './lib.mjs';
import fs from 'fs';
const {b, p, errs} = await open({touch: true, dpr: 2});
const res = {};
await p.evaluate(s => { SYNQUENZER.setSong(s); setSongView(true); }, SONG); await p.waitForTimeout(400);
const M2 = await p.evaluate(() => S.song.marks[1].id);
const sheet = async () => { await p.evaluate(id => { closePop(); openMarkSheet(id); }, M2); await p.waitForTimeout(250); };
// (song.ue – Paket UE – ist hier nur von Hand gesetzt und nicht im Undo: der Vergleich lässt es weg)
// one action in the UI = exactly one undo step that restores the song; redo brings it back
const act = async (name, fn, want) => {
  const b0 = await p.evaluate(() => ({s: JSON.stringify(S.song), u: (UI.undo || UI.undoStack || []).length}));
  await fn(); await p.waitForTimeout(250);
  const r = await p.evaluate(b0 => { const d = SYNQUENZER.vvDirGet(), ns = o => { const c = JSON.parse(JSON.stringify(o)); delete c.ue; return JSON.stringify(c); }; undo(); const eq = ns(S.song) === ns(JSON.parse(b0.s)); redo(); const d2 = SYNQUENZER.vvDirGet(); return {dir: d, undoGleich: eq, redoGleich: JSON.stringify(d) === JSON.stringify(d2)}; }, b0);
  res[name] = Object.assign(r, {soll: want, ok: JSON.stringify(r.dir) === JSON.stringify(want) && r.undoGleich && r.redoGleich});
};
await sheet();
res.zeile = await p.evaluate(() => [...document.querySelectorAll('.pop .vvdr button')].map(e => e.textContent.trim()));
res.zeile = {ist: res.zeile, ok: JSON.stringify(res.zeile) === JSON.stringify(['Auto', 'App', 'Song', 'Matrix', 'Spur …', 'Tastatur', 'Fokus …'])};
await act('app', () => p.tap('.pop .vvdr button[data-a="vv-app"]'), [{a: 8, b: 16, v: 'app'}]);
res.appAn = {ok: await p.evaluate(() => !!document.querySelector('.pop .vvdr button.on[data-a="vv-app"]'))};
await act('tastatur', () => p.tap('.pop .vvdr button[data-a="vv-tast"]'), [{a: 8, b: 16, v: 'tast'}]);
await sheet();
await act('pianoRoll', async () => {
  await p.tap('.pop .vvdr button[data-a="vv-spur"]'); await p.waitForTimeout(250);
  res.spurArten = await p.evaluate(() => [...document.querySelectorAll('.pop button[data-v]')].map(e => [e.dataset.v, e.textContent.trim(), e.disabled]));
  await p.tap('.pop button[data-v="roll"]'); await p.waitForTimeout(250);
  res.rollSpuren = await p.evaluate(() => [...document.querySelectorAll('.pop button[data-t]')].map(e => +e.dataset.t));
  await p.tap('.pop button[data-t="1"]');
}, [{a: 8, b: 16, v: 'roll', t: 1}]);
res.spurArten = {ist: res.spurArten, ok: JSON.stringify(res.spurArten) === JSON.stringify([['roll', 'Piano-Roll', false], ['drum', 'Drum-Sequenzer', false], ['mod', 'Modulation', false]])};
res.rollSpuren = {ist: res.rollSpuren, ok: JSON.stringify(res.rollSpuren) === JSON.stringify([0, 1])};   // Spuren mit Noten-Clips in Takt 9–16 (keine Drums)
await sheet();
res.spurAn = {ok: await p.evaluate(() => { const e = document.querySelector('.pop .vvdr button.on[data-a="vv-spur"]'); return !!e && !!e.querySelector('i'); })};
// Fokus …: ohne Übergang ist „Übergang“ aus; Clip-Zelle → Spur
await act('fokusZelle', async () => {
  await p.tap('.pop .vvdr button[data-a="vv-fokus"]'); await p.waitForTimeout(250);
  res.fokusArten = await p.evaluate(() => [...document.querySelectorAll('.pop button[data-v]')].map(e => [e.dataset.v, e.textContent.trim(), e.disabled]));
  await p.tap('.pop button[data-v="f-zelle"]'); await p.waitForTimeout(250);
  await p.tap('.pop button[data-t="0"]');
}, [{a: 8, b: 16, v: 'f-zelle', t: 0}]);
res.fokusArten = {ist: res.fokusArten, ok: JSON.stringify(res.fokusArten) === JSON.stringify([['f-zelle', 'Clip-Zelle', false], ['f-tast', 'Tastatur', false], ['f-teil', 'Teil-Kopf', false], ['f-ue', 'Übergang', true]])};
await sheet();
await act('fokusTeil', async () => { await p.tap('.pop .vvdr button[data-a="vv-fokus"]'); await p.waitForTimeout(250); await p.tap('.pop button[data-v="f-teil"]'); }, [{a: 8, b: 16, v: 'f-teil'}]);
// mit Übergang (Kante 16|17 liegt in Takt 16–17): im Teil „Refrain“ ist „Übergang“ wählbar
await p.evaluate(UE => { S.song.ue = JSON.parse(JSON.stringify(UE)); }, UE);
const M3 = await p.evaluate(() => S.song.marks[2].id);
await p.evaluate(id => { closePop(); openMarkSheet(id); }, M3); await p.waitForTimeout(250);
await act('fokusUe', async () => { await p.tap('.pop .vvdr button[data-a="vv-fokus"]'); await p.waitForTimeout(250); res.ueAn = await p.evaluate(() => !document.querySelector('.pop button[data-v="f-ue"]').disabled); await p.tap('.pop button[data-v="f-ue"]'); },
  [{a: 8, b: 16, v: 'f-teil'}, {a: 16, b: 24, v: 'f-ue'}]);
res.ueAn = {ok: res.ueAn === true};
// zurück auf Auto
await p.evaluate(id => { closePop(); openMarkSheet(id); }, M3); await p.waitForTimeout(250);
await act('auto', () => p.tap('.pop .vvdr button[data-a="vv-auto"]'), [{a: 8, b: 16, v: 'f-teil'}]);
await p.evaluate(() => closePop());
// ⋯ der Bereich-Leiste: Takt 5–8 → Spur … → Drum-Sequenzer → Drums
await p.evaluate(() => SYNQUENZER.songSelect(4, 7)); await p.waitForTimeout(250);
await p.tap('#rangeBar button[data-a="more"]'); await p.waitForTimeout(300);
await act('bereichDrum', async () => {
  await p.tap('.pop .vvdr button[data-a="vv-spur"]'); await p.waitForTimeout(250);
  await p.tap('.pop button[data-v="drum"]'); await p.waitForTimeout(250);
  res.drumSpuren = await p.evaluate(() => [...document.querySelectorAll('.pop button[data-t]')].map(e => +e.dataset.t));
  await p.tap('.pop button[data-t="4"]');
}, [{a: 4, b: 8, v: 'drum', t: 4}, {a: 8, b: 16, v: 'f-teil'}]);
res.drumSpuren = {ist: res.drumSpuren, ok: JSON.stringify(res.drumSpuren) === JSON.stringify([4])};
await p.evaluate(() => { SV.sel = null; rangeBarSync(); closePop(); });
await p.evaluate(() => { SYNQUENZER.vvDirSet(0, 2, 'mod', 0); SYNQUENZER.vvDirSet(2, 4, 'matrix'); SYNQUENZER.vvDirSet(24, 26, 'f-tast'); SYNQUENZER.vvDirSet(26, 28, 'spur', 1); SYNQUENZER.vvDirSet(28, 30, 'song'); SYNQUENZER.vvDirSet(30, 32, 'f-zelle', 1); });
// Streifen: Farbe je Wahl (an der rechten Kante jedes Eintrags gemessen, die Kamera sitzt links)
res.streifen = await p.evaluate(() => {
  const cv = document.createElement('canvas'); cv.width = 1400; cv.height = 8; const g = cv.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, 1400, 8);
  vvDrawStripe(g, S.song, x => x * 40, 1400, 0, 8);
  const px = (x, y) => Array.from(g.getImageData(x, y, 1, 1).data.slice(0, 3)), hex = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const near = (a, b) => a.every((v, k) => Math.abs(v - b[k]) <= 3);
  const C = vvCols(), out = [];
  for (const e of S.song.video) {
    const x = e.b * 40 - 6, fill = px(x, 3), edge = px(x, 1), line = px(x, 5);
    const want = hex(vv4StripeCol(e, C).startsWith('#') ? vv4StripeCol(e, C) : '#000000');
    const ok = e.v.startsWith('f-') ? near(edge, want) && near(fill, [0, 0, 0]) : ['roll', 'drum', 'mod'].includes(e.v) ? near(fill, want) && near(line, hex(VV4_TYPECOL[e.v])) : near(fill, want);
    out.push({v: e.v, t: e.t, fill, edge, line, want, ok});
  }
  const cols = new Set(S.song.video.filter(e => !VV4_TRK.includes(e.v)).map(e => vv4StripeCol(e, C)));
  return {eintraege: out, ok: out.every(o => o.ok), songStreifen: SV.vvS === 8};
});
res.streifen.ok = res.streifen.ok && res.streifen.songStreifen;
await p.screenshot({path: OUT + '/vv4-menue-streifen.png'});
// Speichern → Laden (Datei) deep-equal; Browser-Speicher über Neuladen
res.speichernLaden = await p.evaluate(() => {
  const strip = x => x.replace(/"sum":"[0-9a-f]+"/g, '').replace(/"id":"p-[a-z0-9-]+"/g, '');
  const s1 = serialize(), d0 = SYNQUENZER.vvDirGet(); applyProject(normalizeProject(projFromFile(JSON.parse(s1))), {}); const d1 = SYNQUENZER.vvDirGet();
  return {d0, d1, ok: JSON.stringify(d0) === JSON.stringify(d1) && strip(serialize()) === strip(s1)};
});
await p.evaluate(() => SYNQUENZER.save()); await p.waitForTimeout(1500);
const P0 = await p.evaluate(() => (S.song || {}).video); await p.reload(); await p.waitForTimeout(2500);
const P1 = await p.evaluate(() => (S.song || {}).video);
res.neuLaden = {P0, P1, ok: JSON.stringify(P0) === JSON.stringify(P1) && !!P1 && P1.some(e => e.v === 'f-tast')};
// alter Song (Einträge aus 4.26.1: auto / song / matrix / spur) lädt unverändert
res.alterSong = await p.evaluate(S0 => {
  const old = [{a: 0, b: 4, v: 'spur', t: 2}, {a: 4, b: 8, v: 'matrix'}, {a: 8, b: 12, v: 'song'}];
  SYNQUENZER.setSong(S0); S.song.video = JSON.parse(JSON.stringify(old));
  const s1 = serialize(); applyProject(normalizeProject(projFromFile(JSON.parse(s1))), {});
  return {ist: SYNQUENZER.vvDirGet(), ok: JSON.stringify(SYNQUENZER.vvDirGet()) === JSON.stringify(old)};
}, SONG);
// Takte einfügen vor einem neuen Eintrag verschiebt ihn (wie die alten)
res.einfuegen = await p.evaluate(() => { SYNQUENZER.vvDirSet(12, 14, 'roll', 1); songRange('insertEmpty', 1, 2); const d = SYNQUENZER.vvDirGet(); undo(); return {ist: d, ok: JSON.stringify(d.find(e => e.v === 'roll')) === JSON.stringify({a: 14, b: 16, v: 'roll', t: 1})}; });
res.errs = errs; res.ok = Object.values(res).every(x => !x || x.ok !== false) && !errs.length;
fs.mkdirSync(OUT, {recursive: true}); fs.writeFileSync(OUT + '/vv4-menue.json', JSON.stringify(res, null, 1));
for (const k of Object.keys(res)) if (res[k] && res[k].ok !== undefined) console.log(k, res[k].ok ? 'OK' : 'FEHLER ' + JSON.stringify(res[k]).slice(0, 700));
console.log('Konsolenfehler', errs.length, JSON.stringify(errs).slice(0, 300), 'GESAMT', res.ok ? 'GRÜN' : 'ROT');
await b.close();
