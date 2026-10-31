// G9D T10: Einbau – echter Kern (Haupt-Faden = Worker), Silben-Muster laden (Cache synq-g9-v1, SHA-256, ohne Server 'einfach'),
// Marken-Haken (G9-08), wpLyrics mit ly, Erkennungs-Ablauf mit Ersatz-Modell (G9-28, G9-38, G9-56), Undo-Fußabdruck (G9-57)
import {launch, open, clickTake, mkTake, sleep, report, deq, U, V, LY, SET, ks, NET, server} from './h.mjs';
const ok = report(); const br = await launch();

// ---------- 1) Muster über den Server, Cache, Prüfsumme ----------
{
  NET.hits.length = 0;
  const {ctx, p, errs} = await open(br);
  ok(!NET.hits.some(h => h.url.includes('/vendor/g9/')), 'Start: kein Abruf unter vendor/g9/');
  ok(await p.evaluate(() => SYNQUENZER.g9Info().loaded === false && document.getElementById('sq-g9-src') && typeof g9On === 'undefined'), 'Start: Block sq-g9-src nicht ausgewertet');
  const kernStart = await p.evaluate(() => SYNQUENZER.g9Info().kern);
  ok(kernStart === null, 'Start: Kern-Fabrik nicht ausgeführt (' + kernStart + ')');
  await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(200);
  const tk = await clickTake(p, Array.from({length: 12}, (_, k) => .3 + k * .25), 4);
  await p.evaluate(r => SYNQUENZER.g9Text(r, true), tk.ref); await sleep(600);
  const m1 = await p.evaluate(() => [SYNQUENZER.g9SylMode('de'), SYNQUENZER.g9SylMode('en')]);
  ok(m1[0] === 'muster', 'Text-Modus öffnet → deutsches Muster geladen (' + m1.join('/') + ')');
  ok(NET.hits.filter(h => h.url.endsWith('de-x-syllable.wasm')).length === 1 && !NET.hits.some(h => h.url.endsWith('en-us.wasm')), 'nur die Sprache des Takes geladen, ein GET');
  ok(await p.evaluate(() => SYNQUENZER.g9Syl('Gedanken', 'de').join('-')) === 'Ge-dan-ken' && await p.evaluate(() => SYNQUENZER.g9Syl('Abend', 'de').join('-')) === 'A-bend', 'g9Syl mit Muster: Ge-dan-ken, A-bend');
  const inCache = await p.evaluate(async () => { const c = await caches.open('synq-g9-v1'); return (await c.keys()).map(r => r.url.split('/').pop()); });
  ok(inCache.includes('de-x-syllable.wasm'), 'Cache synq-g9-v1 enthält das Muster');
  ok(await p.evaluate(() => SYNQUENZER.g9SylLoad('en')) === 'muster' && await p.evaluate(() => SYNQUENZER.g9Syl('little', 'en').join('-')) === 'lit-tle', 'englisches Muster auf Wunsch (lit-tle)');
  const info = await p.evaluate(() => SYNQUENZER.g9Info());
  ok(info.syl.de === 'muster' && !info.ph, 'Info-Zeile ohne „vereinfacht“ (ph false)');
  // Worker = Haupt-Faden: Merkmale und Muster im Worker
  const same = await p.evaluate(async id => {
    const f = await SYNQUENZER.g9Feat(id), b = g9FeatSrc(id), loc = g9K().feat(b.getChannelData(0), b.sampleRate, wpMarks(id));
    const wk = await g9Call({op: 'g9a', ly: null, marks: wpMarks(id), feat: f, step: {op: 'ganz', text: 'Gedanken sind frei und schön', lang: 'de'}});
    const lc = g9K().apply(null, wpMarks(id), f, {op: 'ganz', text: 'Gedanken sind frei und schön', lang: 'de'});
    return {feat: JSON.stringify(f) === JSON.stringify(loc), al: JSON.stringify(wk.s) === JSON.stringify(lc.s), how: WP.how, wk: !!WP.w};
  }, tk.id);
  ok(same.feat && same.al && same.wk, 'G9-01 Worker = Haupt-Faden: Merkmale (g9f) und Ausrichtung mit Muster (g9a) gleich');
  // Neu laden: Muster aus dem Cache, kein zweiter Abruf
  const n0 = NET.hits.filter(h => h.url.includes('/vendor/g9/')).length;
  await p.reload(); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version); await sleep(300);
  const m2 = await p.evaluate(async () => { SYNQUENZER.g9Info(); return await SYNQUENZER.g9SylLoad('de'); });
  ok(m2 === 'muster' && NET.hits.filter(h => h.url.includes('/vendor/g9/')).length === n0, 'zweites Laden aus dem Cache (kein Abruf), offline-fähig');
  ok(errs.length === 0, 'keine Konsolen-Fehler ' + errs.join('|'));
  await ctx.close();
}
// Prüfsumme falsch → 'einfach' + Meldung; Server weg → 'einfach'; file:// → 'einfach' + Info-Zeile
{
  const {ctx, p} = await open(br);
  await p.route('**/de-x-syllable.wasm', r => r.fulfill({status: 200, contentType: 'application/wasm', body: Buffer.alloc(94905, 7)}));
  const m = await p.evaluate(() => SYNQUENZER.g9SylLoad('de'));
  const err = await p.evaluate(() => G9.sylFail && G9.sylFail.de);
  ok(m === 'einfach' && /Prüfsumme/.test(err || ''), 'SHA-256 falsch → Abbruch mit Meldung, vereinfachte Trennung (' + err + ')');
  const inC = await p.evaluate(async () => (await (await caches.open('synq-g9-v1')).keys()).length);
  ok(inC === 0, 'falsche Datei nicht im Cache');
  await ctx.close();
}
{
  NET.block = true; const {ctx, p} = await open(br);
  ok(await p.evaluate(() => SYNQUENZER.g9SylLoad('de')) === 'einfach', 'Server nicht erreichbar → einfach'); NET.block = false; await ctx.close();
}
{
  const {ctx, p, errs} = await open(br, {file: true});
  await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(200);
  const tk = await clickTake(p, Array.from({length: 8}, (_, k) => .3 + k * .3), 4);
  await p.evaluate(r => SYNQUENZER.g9Text(r, true), tk.ref); await sleep(500);
  await SET(p, tk.id, {op: 'text', text: 'Gedanken sind frei', lang: 'de'}); await sleep(100);
  const st = await p.evaluate(() => [SYNQUENZER.g9SylMode('de')]);
  const infoTxt = await p.evaluate(() => { const E = WP.ed; return g9InfoLine(E, wpMarks(E.id) || []); });
  const ly = await LY(p, tk.id);
  ok(st[0] === 'einfach' && /Silbentrennung vereinfacht/.test(infoTxt) && ly.s.filter(s => s.p === .5).length >= 3, 'file:// (Artifact/offline): App läuft, Vokalkern-Regel, Silben p 0,5, Info „Silbentrennung vereinfacht“');
  ok(errs.length === 0, 'file://: keine Konsolen-Fehler ' + errs.join('|'));
  await ctx.close();
}

// ---------- 2) Marken-Haken (G9-08), wpLyrics mit ly ----------
{
  const {ctx, p, errs} = await open(br);
  await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(200);
  const T = Array.from({length: 12}, (_, k) => .3 + k * .25), tk = await clickTake(p, T, 4), id = tk.id;
  await SET(p, id, {op: 'text', text: 'a b c d e f g h', lang: 'de'});
  const ly0 = await LY(p, id), u0 = (await U(p)).n;
  await p.evaluate(([id, t]) => SYNQUENZER.wpMark(id, 'move', 3, t), [id, tk.marks[3].t + .06]);
  let ly = await LY(p, id), mk = (await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).marks;
  ok(Math.abs(ly.s[3].t - mk[3].t) < 1e-6 && ly.s.filter((s, i) => i !== 3).every((s, i) => s.t === ly0.s.filter((q, j) => j !== 3)[i].t), 'G9-08 Marke verschoben → ihre Silbe folgt, die anderen bleiben');
  ok((await U(p)).n === u0 + 1 && (await U(p)).top.kind === 'takes', 'ein Undo (Art takes) für Marke + Silbe');
  await p.evaluate(() => SYNQUENZER.undo());
  ok(deq(await LY(p, id), ly0), '↶ stellt Marke und Silbe her');
  await p.evaluate(id => SYNQUENZER.wpMark(id, 'del', 2), id);
  ly = await LY(p, id);
  ok(ly.s.length === 8 && ly.s[2].j === 1 && ly.s[2].t === ly.s[1].t, 'G9-08 Marke gelöscht → Silbe mit der vorigen verschmolzen, 0 verloren');
  await p.evaluate(() => SYNQUENZER.undo());
  // neben einer Marke mit 3 Silben: Überzahl o
  await SET(p, id, {op: 'merge', k: 4}); await SET(p, id, {op: 'merge', k: 4});
  const lyM = await LY(p, id), k4 = lyM.s.filter(s => s.t === tk.marks[4].t).length;
  const k5 = lyM.s.findIndex((s, i) => i > 0 && s.t > tk.marks[4].t);
  const t5 = lyM.s[k5].t, mk5 = (await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).det.findIndex(m => m.t === t5);
  await p.evaluate(([id, k]) => SYNQUENZER.wpMark(id, 'del', k), [id, mk5]);
  ly = await LY(p, id);
  ok(k4 === 3 && ly.s.length === 8 && ly.s.filter(s => s.o).length === 1, 'G9-08 Marke löschen neben 3 Silben → Überzahl o, 0 Silben verloren (' + ly.s.length + ')');
  await p.evaluate(() => SYNQUENZER.undo()); await p.evaluate(() => { SYNQUENZER.undo(); SYNQUENZER.undo(); });
  ok(deq(await LY(p, id), ly0), 'zurück auf Basis');
  await p.evaluate(([id, t]) => SYNQUENZER.wpMark(id, 'add', t), [id, (tk.marks[5].t + tk.marks[6].t) / 2]);
  ly = await LY(p, id);
  ok(ly.s.every((s, i) => s.t === ly0.s[i].t), 'G9-08 Marke gesetzt → keine Silbe bewegt');
  await p.evaluate(() => SYNQUENZER.undo());
  await p.evaluate(id => SYNQUENZER.wpLyrics(id, 'eins zwei drei'), id);
  ly = await LY(p, id); const lyr = await p.evaluate(id => SYNQUENZER.wpLyrics(id), id);
  ok(ly && ly.s.map(s => s.x).join(' ') === 'eins zwei drei' && lyr === 'eins zwei drei', 'wpLyrics mit vorhandenem ly schreibt beides (§8)');
  await p.evaluate(id => SYNQUENZER.wpLyrics(id, ''), id);
  ok(!(await LY(p, id)) && !(await p.evaluate(id => SYNQUENZER.wpLyrics(id), id)), 'wpLyrics leer löscht ly und lyrics');
  ok(errs.length === 0, 'keine Konsolen-Fehler ' + errs.join('|'));
  await ctx.close();
}
// G9-57: Fußabdruck 'ly' gegen 'takes' (1200 Silben, 60 Schritte)
{
  const {ctx, p} = await open(br);
  await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(200);
  const n = 400, T = Array.from({length: n}, (_, k) => .3 + k * .25), tk = await clickTake(p, T, Math.ceil(T[n - 1] + 1));
  const txt = Array.from({length: 1200}, (_, i) => 'la' + (i % 7)).join(' ');
  await SET(p, tk.id, {op: 'text', text: txt, lang: 'de'});
  for (let i = 0; i < 60; i++) await SET(p, tk.id, {op: 'word', k: (i * 5) % tk.marks.length, text: 'wort' + i});
  const fp = await p.evaluate(() => { let ly = 0, tk = 0; for (const e of UNDO) { if (e.kind === 'ly') ly += e.before.length; } tk = JSON.stringify(S.takes).length * 60; return {ly, tk}; });
  ok(fp.ly <= 4e6, 'G9-57 60 Schritte Art ly: ' + (fp.ly / 1e6).toFixed(2) + ' MB ≤ 4 MB (als takes ≈ ' + (fp.tk / 1e6).toFixed(1) + ' MB)');
  console.log('   G9-57 ly ' + fp.ly + ' B, takes ' + fp.tk + ' B, Marken ' + tk.marks.length);
  await ctx.close();
}

// ---------- 3) Erkennungs-Ablauf mit Ersatz-Modell (G9b-2 fehlt) ----------
{
  const {ctx, p, errs} = await open(br);
  await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(200);
  const T = [0.5, 0.9, 1.3, 2.4, 2.8, 3.2, 4.4, 4.8];
  const tk = await mkTake(p, T, 6), id = tk.id;
  ok(tk.marks.length >= 8, 'gesungener Take mit ' + tk.marks.length + ' Marken');
  await p.evaluate(r => SYNQUENZER.wpOpen(r), tk.ref); await p.evaluate(() => SYNQUENZER.g9Text(null, true)); await sleep(300);
  ok(await p.evaluate(() => WP.ed.g9.rb.hidden === true && !G9.rec), 'ohne Sprachmodell: [Erkennen] ausgeblendet (Stopp-Punkt 1)');
  // Ersatz-Modell: liefert die wahren Wörter je Fenster (Zeiten über die Zeit-Karte zurück)
  await p.evaluate(T => {
    window.__truth = [{text: 'Liebe', a: T[0], b: T[2] + .3}, {text: 'ist', a: T[3], b: T[3] + .35}, {text: 'ein', a: T[4], b: T[4] + .35}, {text: 'Feuer', a: T[5], b: T[5] + .38}, {text: 'da', a: T[7], b: T[7] + .35}];
    window.__calls = []; window.__ms = 0;
    SYNQUENZER.g9AsrSim(async (x, o) => {
      window.__calls.push(o.k); if (window.__ms) await new Promise(r => setTimeout(r, window.__ms));
      const w = window.__truth.map(t => ({text: t.text, start: o.toStream(t.a) - o.a, end: o.toStream(t.b) - o.a})).filter(t => t.start >= -1e-6 && t.start < o.b - o.a);
      return {words: w, lang: o.lang === 'auto' ? 'de' : o.lang};
    });
  }, T);
  ok(await p.evaluate(() => WP.ed.g9.rb.hidden === false), 'mit angedocktem Modell: [Erkennen] sichtbar');
  const sv0 = await p.evaluate(() => G9.saves), u0 = (await U(p)).n;
  const res = await p.evaluate(id => SYNQUENZER.g9Recognize(id, {lang: 'auto'}), id);
  let ly = await LY(p, id);
  ok(res && res.words.length === 5 && res.lang === 'de' && res.chunks >= res.lo && res.chunks <= res.hi, 'g9Recognize → 5 Wörter, Sprache de, ⌈L/30⌉ ≤ chunks ≤ ⌈L/24⌉ (' + (res && res.chunks) + ')');
  ok(ly && ly.src === 'erkannt' && ly.s.map(s => s.x).join('|') === 'Lie|be|ist|ein|Feu|er|da', 'Silben erkannt + ausgerichtet: ' + (ly && ly.s.map(s => s.x).join('|')));
  const kk = ly.s.map(s => tk.marks.findIndex(m => Math.abs(m.t - s.t) < 1e-6));
  ok(kk.every(k => k >= 0) && Math.abs(tk.marks[kk[0]].t - T[0]) < .06 && Math.abs(tk.marks[kk[2]].t - T[3]) < .06, 'jede Silbe an einer Marke, Wortanfänge an den Einsätzen');
  ok((await U(p)).n === u0 + 1 && (await U(p)).top.label === 'Erkennen' && await p.evaluate(() => G9.saves) > sv0, '[Erkennen] = ein Undo „Erkennen“; saveNow vorher');
  await p.evaluate(() => SYNQUENZER.undo());
  // Lücken füllen: feste Silbe bleibt
  await SET(p, id, {op: 'word', k: kk[0], text: 'Herz'});
  await p.evaluate(id => SYNQUENZER.g9Recognize(id, {lang: 'de', mode: 'fill'}), id);
  ly = await LY(p, id);
  ok(ly.s[0].x === 'Herz' && ly.s[0].u === 1 && ly.s.some(s => s.x === 'Feu'), 'Lücken füllen: feste Silbe bleibt, Rest erkannt');
  for (let i = 0; i < 2; i++) await p.evaluate(() => SYNQUENZER.undo());
  // [Stopp]: fertige Fenster bleiben
  await p.evaluate(() => { window.__ms = 400; window.__calls = []; });
  const pr = p.evaluate(id => SYNQUENZER.g9Recognize(id, {lang: 'de'}), id);
  await sleep(150);
  const st = await p.evaluate(() => { const t0 = performance.now(); SYNQUENZER.g9RecStop(); return {ms: performance.now() - t0, w: G9.w, jobs: G9.job.size}; });
  const r2 = await pr;
  ok(st.ms <= 500 && st.w === null && st.jobs === 0 && r2.stopped, 'G9-28 [Stopp] → Worker beendet, „gestoppt“ in ' + st.ms.toFixed(1) + ' ms');
  // Aufnahme hat Vorrang: Mikrofon-Start hält die Erkennung an, danach geht es weiter, kein Fenster doppelt
  await p.evaluate(() => { window.__ms = 300; window.__calls = []; G9.saves = 0; });
  const pr3 = p.evaluate(id => SYNQUENZER.g9Recognize(id, {lang: 'de'}), id);
  await sleep(100);
  const hold = await p.evaluate(() => { const t0 = performance.now(); MICTAP.users.add('test'); g9MicOn(); return {ms: performance.now() - t0, hold: G9.hold, w: G9.w}; });
  ok(hold.hold && hold.w === null && hold.ms < 100, 'G9-56 Mikrofon-Start → Erkennung beendet binnen ' + hold.ms.toFixed(1) + ' ms (hold)');
  await sleep(700);
  const during = await p.evaluate(() => ({n: G9.job.size, msg: G9.recMsg}));
  ok(during.n === 1 && /wartet/.test(during.msg || ''), 'während das Mikrofon läuft: wartet („' + during.msg + '“)');
  await p.evaluate(() => MICTAP.users.delete('test'));
  const r3 = await pr3;
  const calls = await p.evaluate(() => window.__calls.slice());
  ok(r3 && r3.words.length === 5 && !(await p.evaluate(() => G9.hold)), '2 s nach dem Mikrofon weiter, Ergebnis vollständig');
  ok(calls.filter(k => k === 0).length <= 2 && await p.evaluate(() => G9.saves) >= 2, 'angefangenes Fenster neu, fertige nicht doppelt; saveNow vor jedem Start (' + calls.join(',') + ')');
  for (let i = 0; i < 1; i++) await p.evaluate(() => SYNQUENZER.undo());
  ok(errs.length === 0, 'keine Konsolen-Fehler ' + errs.join('|'));

  // ---------- G9-38 automatische Erkennung ----------
  await p.evaluate(() => { window.__ms = 200; });
  const tk2 = await mkTake(p, T, 6, 1);
  const ub = (await U(p)).n;
  await p.evaluate(id => g9AutoQueue(id), tk2.id);
  await p.waitForFunction(id => SYNQUENZER.g9Ly(id), tk2.id, {timeout: 10000});
  ly = await LY(p, tk2.id);
  ok(ly && ly.src === 'erkannt' && (await U(p)).n === ub, 'G9-38 neuer Take → Text erscheint ohne Bedienung, ohne eigenen Undo-Schritt');
  // Undo eines Quantisierens, dessen Schnappschuss älter ist als das Ergebnis → erkannter Text bleibt
  const tk3 = await mkTake(p, T, 6, 2);
  await p.evaluate(() => { window.__ms = 600; });
  await p.evaluate(id => g9AutoQueue(id), tk3.id); await sleep(100);
  await p.evaluate(r => SYNQUENZER.wpQuantize(r, {grid: '1/16'}), tk3.ref);
  await p.waitForFunction(id => SYNQUENZER.g9Ly(id), tk3.id, {timeout: 10000});
  await p.evaluate(() => SYNQUENZER.undo());
  ok(!!(await LY(p, tk3.id)), 'G9-38 Undo eines Quantisierens (älterer Schnappschuss) lässt den erkannten Text stehen');
  // Undo der Aufnahme nimmt den Text mit
  await p.evaluate(() => SYNQUENZER.undo());
  ok(!(await p.evaluate(id => !!(SYNQUENZER.project().takes || {})[id], tk3.id)), 'Undo der Aufnahme: Take und Text weg');
  // Tippen vor dem Ergebnis → verworfen; mit „aus“ geschieht nichts
  const tk4 = await mkTake(p, T, 6, 3);
  await p.evaluate(id => g9AutoQueue(id), tk4.id); await sleep(80);
  await SET(p, tk4.id, {op: 'word', k: 0, text: 'mein'});
  await sleep(1500);
  ly = await LY(p, tk4.id);
  ok(ly.s.length === 1 && ly.s[0].x === 'mein' && /verworfen/.test(await p.evaluate(() => G9.recMsg || '')), 'G9-38 Tippen vor dem Ergebnis → Ergebnis verworfen, getippter Text bleibt');
  await p.evaluate(() => { const P = stProf(); P.g9 = Object.assign({}, P.g9, {auto: false}); });
  const tk5 = await mkTake(p, T, 6, 4);
  const q = await p.evaluate(id => g9AutoQueue(id), tk5.id); await sleep(800);
  ok(q === false && !(await LY(p, tk5.id)), 'G9-38 Schalter aus → nichts');
  ok(errs.length === 0, 'keine Konsolen-Fehler ' + errs.join('|'));
  await ctx.close();
}
const f = ok.done(); await br.close(); process.exit(f ? 1 : 0);
