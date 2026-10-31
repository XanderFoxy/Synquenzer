// S2 Abnahme: S2-01 … S2-03 (Chromium, Touch auf Marke / Bereich-Leiste, Master-Mitschnitt)
import {launch, open, sleep, deq, tally, OUT, recStart, recStop} from './h.mjs';
import {songABA, tapMark} from './lib.mjs';
const ok = tally();
const br = await launch();
const strip = s => { const o = JSON.parse(JSON.stringify(s)); delete o.marks; return o; };
// song range [a, e) as comparable data (own clip ids replaced by their content)
const cutData = (p, a, e) => p.evaluate(([a, e]) => {
  // what sounds per bar: per track slot, own clip content (not its id), clip phase; Träger changes (repeats dropped); melody; voice
  const song = S.song, st = [];
  for (let x = a; x < e; x++) { const z = songStateAt(song, x); st.push(z.lanes.map(l => l.slot < 0 ? -1 : [l.slot, l.ph, l.own ? JSON.stringify(Object.assign({}, song.own[l.own], {from: null})) : null]).concat([z.xp])); }
  let last = 'null'; for (const c of song.carrier) { if (c.beat > a * 4 + 1e-6) break; last = JSON.stringify(c.target); }
  const car = [[0, last]]; for (const c of song.carrier) { if (c.beat <= a * 4 + 1e-6) continue; if (c.beat >= e * 4 - 1e-6) break; const k = JSON.stringify(c.target); if (k === last) continue; car.push([+(c.beat - a * 4).toFixed(4), k]); last = k; }
  const mel = {}; for (const k in song.mel) { const ns = song.mel[k].notes.filter(n => n.t >= a * 4 - .25 - 1e-9 && n.t < e * 4 - .25 - 1e-9).map(n => [+(n.t - a * 4).toFixed(4), n.d, n.n, n.v]); if (ns.length) mel[k] = ns; }
  const vox = (song.vox || []).filter(v => v.bar >= a && v.bar < e).map(v => Object.assign({}, v, {id: null, bar: v.bar - a}));
  return {st, car, mel, vox};
}, [a, e]);
// real audio + note log of the song from bar 0 over n bars
async function play(p, n) {
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(400);
  await recStart(p);
  await p.evaluate(() => { SYNQUENZER.clearLog(); SYNQUENZER.songPlay(0); });
  await p.waitForFunction(() => R.songPlay && R.playing);
  const st = await p.evaluate(() => ({t0: b2t(R.songPlay.off), b0: R.songPlay.off, spBar: 4 * spb()}));
  await p.waitForFunction(([t0, e]) => window.__ctx.currentTime > t0 + e, [st.t0, n * st.spBar + 0.3], {timeout: 90000, polling: 50});
  const c = await recStop(p); const log = await p.evaluate(() => SYNQUENZER.noteLog(4096)); await p.evaluate(() => SYNQUENZER.stop());
  const g330 = []; for (let k = 0; k < n; k++) { const a = Math.round((st.t0 + k * st.spBar) * c.sr) - c.f0, m = Math.round(st.spBar * c.sr), w = 2 * Math.PI * 330 / c.sr; let re = 0, im = 0, s = 0; for (let i = 0; i < m; i++) { const v = c.y[a + i] || 0; re += v * Math.cos(w * i); im += v * Math.sin(w * i); s += v * v; } g330.push(+(10 * Math.log10((re * re + im * im) / (m * m) + 1e-14)).toFixed(1)); }
  const db = []; for (let k = 0; k < n; k++) { const a = Math.round((st.t0 + k * st.spBar) * c.sr) - c.f0, m = Math.round(st.spBar * c.sr); let s = 0; for (let i = Math.max(0, a); i < a + m; i++) s += (c.y[i] || 0) ** 2; db.push(+(10 * Math.log10(s / m + 1e-14)).toFixed(2)); }
  const ev = log.filter(e => e.beat != null).map(e => ({tr: e.track, b: +(e.beat - st.b0).toFixed(3), n: e.out, src: e.src}));
  return {db, ev, g330};
}
const evBars = (ev, a, e) => ev.filter(x => x.b >= a * 4 - 1e-6 && x.b < e * 4 - 1e-6).map(x => x.tr + '@' + (x.b - a * 4).toFixed(3) + ':' + x.n).sort();
// ---------- S2-01 / S2-03: one mark + song melody + own clip + song voice → Zusammenfassen ----------
{
  const H = await open(br), p = H.p;
  // a take (voice) first: it adds the STIMME track
  const sr = await p.evaluate(() => { ensureAudio(); return window.__ctx.sampleRate; });
  const pcm = Array.from({length: Math.round(sr * 1.6)}, (_, i) => Math.round(9000 * Math.sin(2 * Math.PI * 330 * i / sr) * Math.min(1, i / 400, (sr * 1.6 - i) / 400)));
  const tk = await p.evaluate(([pcm, sr]) => SYNQUENZER.tkInject({pcm, sr, scene: 7, len: 1}), [pcm, sr]);
  await songABA(p);
  await p.evaluate(tk => {
    const D = SYNQUENZER, s = D.project().song;
    s.mel[3] = {len: s.bars, key: {root: 0, scale: 'ionian'}, notes: [{t: 0.5, d: .5, n: 72, v: .8}, {t: 2, d: .5, n: 76, v: .8}, {t: 4.5, d: .5, n: 79, v: .8}, {t: 6, d: .5, n: 74, v: .8}, {t: 9, d: .5, n: 60, v: .8}]};
    s.vox = [{bar: 0, len: 2, take: tk.id, in: 0, out: 1.6, at: 0.25}];
    D.setSong(s); D.makeOwn(0, 1);
  }, tk);
  await p.evaluate(() => SYNQUENZER.songView(true)); await sleep(300);
  const b = await p.evaluate(() => ({song: SYNQUENZER.project().song, parts: SYNQUENZER.parts()}));
  ok(b.song.vox && b.song.vox.length === 1 && b.song.lanes[0].some(e => e.own) && b.song.mel[3].notes.length === 5, 'Aufbau: Song mit Melodie (S4), eigenem Clip (S1 T2) und Stimme (T1–2)');
  const r0 = await play(p, 4);
  await tapMark(p, 'M1');
  const sb = await p.$('.msheet button[data-s012="sum"]'); const sbr = sb && await sb.boundingBox();
  ok(sbr && sbr.width >= 44 && sbr.height >= 44, 'S2 Marken-Blatt hat [Zusammenfassen] ' + JSON.stringify(sbr && [Math.round(sbr.width), sbr.height]));
  await sb.tap(); await sleep(200);
  const ttl = await p.evaluate(() => { const q = document.querySelector('.s2sum'); return q && {h: q.querySelector('h4').textContent, ph: q.querySelector('.mn-in').placeholder}; });
  ok(ttl && /Takt 1–2/.test(ttl.h) && ttl.ph === 'Strophe 2', 'S2 Namens-Blatt „Zusammenfassen · Takt 1–2“, Vorschlag ' + JSON.stringify(ttl));
  await p.screenshot({path: OUT + '/s2-name-P1.png'});
  await p.tap('.s2sum button[data-a="ok"]'); await sleep(200);
  const a = await p.evaluate(() => ({song: SYNQUENZER.project().song, parts: SYNQUENZER.parts(), marks: SYNQUENZER.songMarks()}));
  const np = a.parts[2];
  ok(np && np.name === 'Strophe 2' && np.len === 2 && np.mel && np.mel[3].length === 4 && np.own && Object.keys(np.own).length === 1 && np.vox && np.vox.length === 1, 'S2-01 neuer Teil „Strophe 2“ mit Lanes, Melodie (4 Noten), eigenem Clip, Stimme ' + JSON.stringify(np && {len: np.len, mel: np.mel && np.mel[3].length, own: np.own && Object.keys(np.own), vox: np.vox}));
  ok(deq(strip(a.song), strip(b.song)) && a.marks[0].part === 'P3' && a.marks[0].len === 2 && !a.marks[0].dev, 'S2-01 der Song selbst unverändert (deep-equal ohne Marken), Marke T1–2 = neuer Teil, kein „′“');
  // the new part elsewhere: placed behind the end it must hold the same as T1–2
  await p.evaluate(() => SYNQUENZER.placePart('P3', 99, 'insert')); await sleep(100);
  const d1 = await cutData(p, 0, 2), d2 = await cutData(p, 6, 8);
  ok(deq(d1, d2), 'S2-01 Teil an T7–8 eingesetzt = T1–2 (je Takt: Clip, Phase, eigener Clip, Träger, Melodie, Stimme gleich)' + (deq(d1, d2) ? '' : ' ' + JSON.stringify(d1).slice(0, 300) + ' / ' + JSON.stringify(d2).slice(0, 300)));
  const r1 = await play(p, 8);
  const e1 = evBars(r1.ev, 0, 2), e2 = evBars(r1.ev, 6, 8);
  ok(e1.length > 20 && deq(e1, e2), `S2-01 hörbar gleich: ${e1.length} Noten in T1–2 = T7–8 (Spur, Schlag, Ton)` + (deq(e1, e2) ? '' : ' ' + JSON.stringify(e1.filter(x => !e2.includes(x)).slice(0, 5)) + ' / ' + JSON.stringify(e2.filter(x => !e1.includes(x)).slice(0, 5))));
  ok(Math.abs(r1.db[0] - r1.db[6]) < 0.6 && Math.abs(r1.db[1] - r1.db[7]) < 0.6 && Math.abs(r1.db[0] - r0.db[0]) < 0.6, 'S2-01 Pegel je Takt T1/T2 ' + r1.db.slice(0, 2) + ' = T7/T8 ' + r1.db.slice(6, 8) + ' dB (vorher ' + r0.db.slice(0, 2) + ')');
  ok(r1.g330[0] > r1.g330[2] + 15 && Math.abs(r1.g330[6] - r1.g330[0]) < 1.5, 'S2-01 Stimme (330 Hz) klingt in T7 wie in T1: ' + r1.g330[0] + ' / ' + r1.g330[6] + ' dB (T3 ohne Stimme ' + r1.g330[2] + ')');
  // S2-03: undo, save / load
  await p.evaluate(() => SYNQUENZER.undo()); await p.evaluate(() => SYNQUENZER.undo()); await sleep(100);
  const u = await p.evaluate(() => ({song: SYNQUENZER.project().song, parts: SYNQUENZER.parts()}));
  ok(deq(u.song, b.song) && deq(u.parts, b.parts), 'S2-03 Undo (Einsetzen, Zusammenfassen) → deep-equal');
  await p.evaluate(() => SYNQUENZER.sumMark('M1', 'Vers')); await p.evaluate(() => SYNQUENZER.placePart('P3', 99, 'insert'));
  const rt = await p.evaluate(() => { const a = SYNQUENZER.project(); importProject(JSON.parse(serializeProject()), []); const b = SYNQUENZER.project(); return {a: [a.parts, a.song], b: [b.parts, b.song]}; });
  ok(deq(rt.a, rt.b) && rt.b[0][2].mel && rt.b[0][2].own && rt.b[0][2].vox, 'S2-03 Speichern/Laden deep-equal (Part.mel/own/vox, Song)');
  ok(!H.errs.length && !H.reqs.length, 'keine Konsolenfehler, kein Netz ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.ctx.close();
}
// ---------- S2-02: two chained parts selected (gelbe Auswahl) → one part ----------
{
  const H = await open(br), p = H.p;
  await songABA(p);
  await p.evaluate(() => { const D = SYNQUENZER, s = D.project().song; s.mel[3] = {len: s.bars, key: {root: 0, scale: 'ionian'}, notes: [{t: 1, d: .5, n: 72, v: .8}, {t: 9, d: .5, n: 67, v: .8}]}; D.setSong(s); D.songView(true); });
  await sleep(300);
  const b = await p.evaluate(() => ({song: SYNQUENZER.project().song, parts: SYNQUENZER.parts()}));
  await p.evaluate(() => SYNQUENZER.songSelect(0, 3)); await sleep(200);
  await p.tap('#rangeBar button[data-a="more"]'); await sleep(200);
  const it = await p.$$eval('.pop button[data-a]', bs => bs.map(b => b.textContent.trim()));
  ok(it.includes('Zusammenfassen'), 'S2-02 Bereich-Leiste ⋯ hat „Zusammenfassen“: ' + it.join(' · '));
  await p.tap('.pop button[data-a="s2sum"]'); await sleep(200);
  await p.tap('.s2sum button[data-n="Refrain"]'); await sleep(200);
  const a = await p.evaluate(() => ({song: SYNQUENZER.project().song, parts: SYNQUENZER.parts(), marks: SYNQUENZER.songMarks()}));
  const np = a.parts[2];
  ok(np && np.len === b.parts[0].len + b.parts[1].len && np.name === 'Refrain 2', 'S2-02 ein Teil mit der Summe der Längen (' + (np && np.len) + ' = 2 + 2), Name ' + (np && np.name));
  ok(a.marks.length === 2 && a.marks[0].a === 0 && a.marks[0].len === 4 && a.marks[0].part === 'P3' && deq(strip(a.song), strip(b.song)), 'S2-02 eine Marke T1–4 statt zwei, der Song selbst deep-equal');
  await p.evaluate(() => SYNQUENZER.placePart('P3', 99, 'insert'));
  { const x = await cutData(p, 0, 4), y = await cutData(p, 6, 10); ok(deq(x, y), 'S2-02 eingesetzt an T7–10 = T1–4 (Daten)' + (deq(x, y) ? '' : ' ' + JSON.stringify(x) + ' / ' + JSON.stringify(y))); }
  const r = await play(p, 10);
  const e1 = evBars(r.ev, 0, 4), e2 = evBars(r.ev, 6, 10);
  ok(e1.length > 30 && deq(e1, e2), `S2-02 klingt gleich: ${e1.length} Noten T1–4 = T7–10; Pegel ` + r.db.slice(0, 4) + ' / ' + r.db.slice(6, 10));
  await p.evaluate(() => SYNQUENZER.undo()); await p.evaluate(() => SYNQUENZER.undo());
  ok(deq(await p.evaluate(() => ({song: SYNQUENZER.project().song, parts: SYNQUENZER.parts()})), b), 'S2-03 Undo → deep-equal');
  // formats: the name sheet and the ⋯ list
  for (const [nm, w, h] of [['P1', 390, 844], ['P2', 375, 667], ['P3', 320, 568], ['L1', 844, 390], ['L2', 667, 375], ['W', 926, 428]]) {
    await p.evaluate(() => { if (UI.pop) closePop(); }); await p.setViewportSize({width: w, height: h}); await sleep(300);
    await p.evaluate(() => SYNQUENZER.openSum(0, 3)); await sleep(200);
    const L = await p.evaluate(() => { const q = document.querySelector('.s2sum'), bad = []; for (const b of q.querySelectorAll('button')) { const k = b.getBoundingClientRect(); if (!k.width) continue; const sc = b.closest('.cp-sc'), sr = sc && sc.getBoundingClientRect(); if (sr && (k.right > sr.right + 1 || k.left < sr.left - 1)) continue; if (k.height < 43.5 || k.width < 43.5 || b.scrollWidth > b.clientWidth + 1 || k.bottom > innerHeight + .5) bad.push(b.textContent.trim() + ' ' + Math.round(k.width) + '×' + Math.round(k.height)); } const h4 = q.querySelector('h4'); if (h4.scrollWidth > h4.clientWidth + 1) bad.push('h4'); return {bad, sw: document.scrollingElement.scrollWidth <= innerWidth}; });
    await p.screenshot({path: OUT + `/s2-name-${nm}.png`});
    ok(!L.bad.length && L.sw, `S2 ${nm}: Namens-Blatt ≥ 44 px, nichts abgeschnitten ` + JSON.stringify(L));
  }
  ok(!H.errs.length && !H.reqs.length, 'keine Konsolenfehler, kein Netz ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.ctx.close();
}
await br.close();
process.exit(ok.done() ? 1 : 0);
