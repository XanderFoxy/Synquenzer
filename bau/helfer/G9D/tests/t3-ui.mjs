// G9U T3: Text-Modus mit Touch (Chromium, hasTouch) – G9-30, G9-31, G9-33, G9-34, G9-37, G9-39
import {launch, open, clickTake, sleep, report, deq, U, V, LY, SET, ks} from './h.mjs';
const ok = report(); const br = await launch(); const {p, errs, ctx} = await open(br, {viewport: {width: 428, height: 926}});
await p.evaluate(() => { SYNQUENZER.newProject(); SYNQUENZER.setBpm(120); }); await sleep(300);
const T = Array.from({length: 16}, (_, k) => 0.3 + k * 0.22);
const tk = await clickTake(p, T, 4), id = tk.id;
const U0 = (await U(p)).n;
await p.evaluate(r => SYNQUENZER.wpOpen(r), tk.ref); await sleep(200);
const sh0 = await p.evaluate(() => { const r = document.getElementById('wpSheet').getBoundingClientRect(); return {y: r.top, h: r.height}; });
await p.evaluate(r => SYNQUENZER.g9Text(r, true), tk.ref); await sleep(250);
const sh1 = await p.evaluate(() => { const r = document.getElementById('wpSheet').getBoundingClientRect(); return {y: r.top, h: r.height}; });
ok(deq(sh0, sh1), 'Blatt-Höhe Marken-Modus = Text-Modus (±0 px): ' + JSON.stringify(sh1));
const G = () => p.evaluate(() => SYNQUENZER.g9Geom()), I = () => p.evaluate(() => SYNQUENZER.g9Info()), PL = () => p.evaluate(() => SYNQUENZER.g9PlayLog());
const tapX = async (x, y) => { await p.touchscreen.tap(x, y); await sleep(60); };
let g = await G();
// ---------- G9-30 Tipp: Rahmen im selben Bild, Vorspielen [t_k, t_k+1) ----------
await p.evaluate(() => { window.__pu = []; document.addEventListener('pointerup', () => window.__pu.push(performance.now()), true); });
let n30 = 0, dt = [], dS = [];
for (const k of [0, 3, 7, 12, 15]) {
  g = await G(); const s = g.sx[k], y = g.wave.y + g.wave.h / 2;
  await tapX((s[0] + s[1]) / 2, y);
  const i = await I(), pl = (await PL()).pop(), pu = await p.evaluate(() => window.__pu[window.__pu.length - 1]);
  const t0 = tk.marks[k].t, t1 = k + 1 < tk.marks.length ? tk.marks[k + 1].t : 4;
  const want = [t0, Math.min(t0 + 4, Math.max(t1, t0 + .12))];
  if (i.ed.sel === k && pl && pl.k === k && Math.abs(pl.a - want[0]) <= .001 && Math.abs(pl.b - want[1]) <= .001 && pl.map === null) n30++; else console.log('   Tipp', k, JSON.stringify(pl), want);
  dt.push(pl.tap - pu); dS.push((pl.when - pl.at) * 1000);
}
ok(n30 === 5, 'G9-30 Tipp wählt den Abschnitt und spielt genau [t_k, t_k+1) ±1 ms (' + n30 + '/5)');
ok(Math.max(...dt) <= 16.7, 'G9-30 Rahmen + Vorspiel-Auftrag im selben Ereignis: ' + Math.max(...dt).toFixed(2) + ' ms nach pointerup (≤ 16,7)');
ok(Math.max(...dS) <= 30, 'G9-30 Ton startet ' + Math.max(...dS).toFixed(1) + ' ms nach dem Tipp (+ Ausgabe-Verzögerung; ≤ 30)');
// A/B → Roh-Take
await p.evaluate(() => SYNQUENZER.wpAB(true)); g = await G(); await tapX((g.sx[5][0] + g.sx[5][1]) / 2, g.bar.y + 22);
let pl = (await PL()).pop(); ok(pl.ab && pl.raw && pl.k === 5, 'G9-30 A/B: Roh-Take, Tipp auf die Leiste wählt ebenso');
await p.evaluate(() => SYNQUENZER.wpAB(false));
// Tipp direkt nach Quantisieren (neue Fassung rechnet noch) → Quell-Zeiten; danach Karte der gelieferten Fassung
await p.evaluate(r => { SYNQUENZER.wpQuantize(r, {grid: '1/8', strength: 1, mode: 'slice'}); }, tk.ref);
await p.evaluate(() => SYNQUENZER.g9Sel(6)); pl = (await PL()).pop();
const wi = await p.evaluate(id => SYNQUENZER.wpInfo(id), id);
ok(pl.k === 6 && (pl.map === null ? Math.abs(pl.a - tk.marks[6].t) < .001 : true), 'G9-30 Tipp während die Fassung rechnet: Bereich nach der Karte des gelieferten Puffers (' + (pl.map ? 'Karte ' + pl.map : 'Quell-Zeiten') + ')');
await p.evaluate(id => SYNQUENZER.wpPlayed(id, 0, 1), id);
await p.evaluate(() => SYNQUENZER.g9Sel(6)); pl = (await PL()).pop();
const W2 = (await p.evaluate(id => SYNQUENZER.wpInfo(id), id)).warp.map, warp = t => { const s = W2.src, d = W2.dst; let k = 0; while (k < s.length - 2 && t > s[k + 1]) k++; return d[k] + (t - s[k]) * (d[k + 1] - d[k]) / (s[k + 1] - s[k]); };
ok(pl.map && Math.abs(pl.a - warp(tk.marks[6].t)) <= .001 && Math.abs(pl.b - warp(tk.marks[7].t)) <= .001, 'G9-30 fertige Fassung: [warp(t_k), warp(t_k+1)) ±1 ms (' + pl.a + '…' + pl.b + ')');
await p.evaluate(() => SYNQUENZER.undo());   // Quantisieren zurück
// ---------- G9-31 Schreiben ----------
await p.evaluate(() => { window.__md = 0; const o = markDirty; window.markDirty = function () { window.__md++; return o.apply(this, arguments); }; });
g = await G(); await tapX((g.sx[0][0] + g.sx[0][1]) / 2, g.wave.y + 10);
let i0 = await I(); ok(i0.ed.sel === 0 && i0.ed.focus, 'Tipp → Feld hat den Fokus (Tastatur geht auf)');
const nPl = (await PL()).length;
await p.keyboard.type('L'); i0 = await I();
const pl1 = await PL();
ok(pl1.length === nPl, 'G9-31 erster Tastendruck: Abschnitt hat gerade (≤ 1,5 s) gespielt → kein zweites Vorspielen');
const pulse = await p.evaluate(() => performance.now() - WP.ed.g9.pulse); ok(pulse < 300, 'G9-31 erster Tastendruck: Einrast-Puls');
await p.keyboard.type('iebe'); i0 = await I();
ok(i0.ed.prev && i0.ed.prev.length === 2 && i0.ed.prev[0].x === 'Lie' && i0.ed.prev[1].x === 'be', 'Vorschau „Lie|be“ vor der Leertaste: ' + JSON.stringify(i0.ed.prev));
const prevS = i0.ed.prev;
await p.keyboard.press('Space'); await sleep(50);
let ly = await LY(p, id), v = await V(p, id); i0 = await I(); pl = (await PL()).pop();
ok(ly && ly.s.length === 2 && ly.s[0].x === 'Lie' && ly.s[1].x === 'be' && v.syl[0].k === 0 && v.syl[1].k === 1, 'G9-31 „Liebe“ + Leertaste → Lie|be auf Abschnitt 1 und 2');
ok(deq(prevS.map(s => [s.x, s.t]), ly.s.map(s => [s.x, s.t])), 'G9-06 Vorschau = Ergebnis nach der Leertaste');
ok(i0.ed.sel === 2 && pl.k === 2 && i0.ed.focus, 'Rahmen auf dem nächsten Abschnitt, der spielt; Fokus bleibt');
const u31 = await U(p); ok(u31.top.kind === 'ly' && u31.top.label === 'Songtext: Liebe', 'ein Undo „Songtext: Liebe“');
// Bindestrich: nächste Silbe desselben Worts
await p.keyboard.type('Feu-'); i0 = await I(); pl = (await PL()).pop();
ok(i0.ed.fk === 3 && pl.k === 3, 'G9-31 Bindestrich → Rahmen auf der nächsten Silbe (Abschnitt 4), der spielt');
await p.keyboard.type('er'); await p.keyboard.press('Enter'); await sleep(40);
v = await V(p, id); i0 = await I();
ok(v.syl.slice(2).map(s => s.x + '@' + s.k).join(' ') === 'Feu@2 er@3' && i0.ed.sel === 4 && i0.ed.focus, 'G9-31 Eingabe-Taste „Weiter“ = übernehmen + nächster Abschnitt, Fokus bleibt');
// Fokus-Verlust („Fertig“) → geändertes Wort übernommen
await p.keyboard.type('mir'); await p.evaluate(() => document.activeElement.blur()); await sleep(150);
v = await V(p, id); ok(v.syl[4] && v.syl[4].x === 'mir' && v.syl[4].k === 4, 'G9-31 „Fertig“ (blur) → geändertes Wort übernommen');
// Ersetzen per Tipp: Wort markiert im Feld, neues Wort ersetzt genau dieses Wort
g = await G(); await tapX((g.sx[1][0] + g.sx[1][1]) / 2, g.bar.y + 22); i0 = await I();
ok(i0.ed.field === 'Liebe' && await p.evaluate(() => { const f = document.activeElement; return f.selectionStart === 0 && f.selectionEnd === f.value.length; }), 'Tipp auf „be“: ganzes Wort „Liebe“ markiert im Feld');
await p.keyboard.type('Herz'); await p.keyboard.press('Space'); await sleep(40);
v = await V(p, id); ok(v.syl.map(s => s.x + '@' + s.k).join(' ') === 'Herz@0 Feu@2 er@3 mir@4', 'Ersetzen „Liebe“ → „Herz“: Rest bleibt, Abschnitt 2 = Melisma: ' + v.cells[1].kind);
const tst = await p.evaluate(() => document.getElementById('toast').textContent); ok(/Liebe → Herz/.test(tst) && /Rückgängig/.test(tst), 'Toast „Liebe → Herz“ [Rückgängig]');
// Löschen: antippen, Feld leeren, Leertaste
await tapX((g.sx[4][0] + g.sx[4][1]) / 2, g.bar.y + 22);
await p.keyboard.press('Backspace'); await p.keyboard.press('Space'); await sleep(40);
v = await V(p, id); ok(!v.syl.some(s => s.x === 'mir') && /mir gelöscht/.test(await p.evaluate(() => document.getElementById('toast').textContent)), 'Wort löschen: antippen, Lösch-Taste, Leertaste → „mir gelöscht“');
// Lösch-Taste im leeren Feld: zur vorigen Silbe, nichts löschen
const lyB = await LY(p, id); await p.keyboard.press('Backspace'); i0 = await I();
ok(i0.ed.sel === 3 && i0.ed.field === 'Feuer' && deq(await LY(p, id), lyB), 'Lösch-Taste im leeren Feld → vorige Silbe gewählt, Wort markiert, nichts gelöscht');
// [+] Wort einfügen
await tapX((g.sx[2][0] + g.sx[2][1]) / 2, g.bar.y + 22); await p.keyboard.press('Backspace'); await p.keyboard.type('du');
g = await G(); await tapX(g.btn.ins.x + 22, g.btn.ins.y + 22); await sleep(40);
v = await V(p, id); ok(v.syl.map(s => s.x + '@' + s.k).join(' ') === 'Herz@0 du@2 Feu@3 er@4', '[+] fügt „du“ vor Abschnitt 3 ein, der Rest rückt nach: ' + v.syl.map(s => s.x + '@' + s.k).join(' '));
// Tastendruck-Handler mit 4× Drossel
const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', {rate: 4});
await p.evaluate(() => { G9.kts = []; }); await tapX((g.sx[9][0] + g.sx[9][1]) / 2, g.bar.y + 22);
for (const w of ['Sehnsucht', 'Gedanken', 'wunderbar']) { await p.keyboard.type(w, {delay: 15}); await p.keyboard.press('Space'); }
await cdp.send('Emulation.setCPUThrottlingRate', {rate: 1});
i0 = await I(); ok(i0.kt.med <= 2 && i0.kt.max <= 6, 'G9-31 Tastendruck → Vorschau (4× Drossel): Median ' + i0.kt.med.toFixed(2) + ' ms, Max ' + i0.kt.max.toFixed(2) + ' ms (n ' + i0.kt.n + ')');
ok(await p.evaluate(() => window.__md) >= 7, '„geändert“: markDirty bei jedem Schritt (' + await p.evaluate(() => window.__md) + ')');
// ---------- G9-34 Fokus und Haptik-Label ----------
await p.evaluate(() => { G9.hap.length = 0; G9.hits = 0; });
g = await G();
const targets = [['welle', g.wave.x + g.wave.w / 2, g.wave.y + 20], ['leiste', g.bar.x + g.bar.w / 3, g.bar.y + 22], ['prev', g.btn.prev.x + 22, g.btn.prev.y + 22], ['next', g.btn.next.x + 22, g.btn.next.y + 22], ['sr', g.btn.sr.x + g.btn.sr.w / 2, g.btn.sr.y + 30], ['sl', g.btn.sl.x + g.btn.sl.w / 2, g.btn.sl.y + 30]];
let n34 = 0;
for (const [nm, x, y] of targets) {
  const h0 = (await p.evaluate(() => SYNQUENZER.g9HapLog())).length, c0 = await p.evaluate(() => G9.hits | 0);
  await tapX(x, y);
  const hl = await p.evaluate(() => SYNQUENZER.g9HapLog()), c1 = await p.evaluate(() => G9.hits | 0);
  const one = hl.length === h0 + 1 && hl[hl.length - 1].active === true, btnOnce = nm === 'welle' || nm === 'leiste' ? true : c1 === c0 + 1;
  if (one && btnOnce) n34++; else console.log('   Label', nm, JSON.stringify(hl.slice(h0)), c1 - c0);
}
ok(n34 === targets.length, 'G9-34 genau ein Label-Klick je Tipp, danach activeElement = Feld, Klick-Behandlung genau einmal (' + n34 + '/' + targets.length + ')');
{ const h0 = (await p.evaluate(() => SYNQUENZER.g9HapLog())).length, va0 = await p.evaluate(() => WP.ed.va);
  await p.evaluate(async ([x, y]) => { const t = document.elementFromPoint(x, y); const ev = (type, xx) => t.dispatchEvent(new PointerEvent(type, {bubbles: true, pointerId: 7, pointerType: 'touch', clientX: xx, clientY: y, isPrimary: true})); ev('pointerdown', x); for (let d = 4; d <= 60; d += 8) ev('pointermove', x - d); ev('pointerup', x - 60); t.dispatchEvent(new MouseEvent('click', {bubbles: true, clientX: x - 60, clientY: y})); }, [g.wave.x + g.wave.w / 2, g.wave.y + 30]);
  await sleep(50); const hl = await p.evaluate(() => SYNQUENZER.g9HapLog()), va1 = await p.evaluate(() => WP.ed.va);
  ok(hl.length === h0 && va1 !== va0, 'G9-34 Ziehen schwenkt (va ' + va0.toFixed(3) + ' → ' + va1.toFixed(3) + '), kein Label-Klick danach'); }
await p.evaluate(() => { UI.haptics = false; WP.ed && EL.wpSheet.classList.remove('hap'); });
{ const h0 = (await p.evaluate(() => SYNQUENZER.g9HapLog())).length; await tapX(g.btn.next.x + 22, g.btn.next.y + 22);
  const vis = await p.evaluate(() => [...document.querySelectorAll('#wpSheet .g9hl')].filter(n => getComputedStyle(n).display !== 'none').length);
  ok((await p.evaluate(() => SYNQUENZER.g9HapLog())).length === h0 && vis === 0, 'G9-34 UI.haptics aus → keine Label-Schicht, kein Label-Klick'); }
await p.evaluate(() => { UI.haptics = true; EL.wpSheet.classList.add('hap'); });
await p.evaluate(() => SYNQUENZER.g9Text(null, false));
ok(await p.evaluate(() => document.querySelectorAll('#wpSheet .g9hl').length) === 0, 'G9-34 keine Label-Schicht im Marken-Modus');
// ---------- G9-33 Undo-Zählung: 10 Wörter, Ganzer Text, Löschen, Einfügen, 2 Verschieben, Verschmelzen, Trennen, Erkennen = 18 ----------
while ((await U(p)).n > U0) await p.evaluate(() => SYNQUENZER.undo());
const S0 = await p.evaluate(() => SYNQUENZER.project().takes); const n0 = (await U(p)).n;
await p.evaluate(() => { G9.rec = {cached: () => true, size: () => ({mb: 78}), recognize: async (id, o) => ({lang: 'de', words: [{w: 'Herz', a: 3.15, b: 3.3, p: .4}, {w: 'Schmerz', a: 3.37, b: 3.6}]})}; window.__md = 0; });
const ws = ['Liebe', 'ist', 'ein', 'Feuer', 'in', 'mir', 'so', 'hell', 'und', 'heiß'];
let k = 0; for (const w of ws) { const r = await SET(p, id, {op: 'word', k, text: w}); k = (await V(p, id)).syl.at(-1).k + 1; if (!r.ok) console.log('   Wort', w, r); }
await SET(p, id, {op: 'text', text: 'Liebe ist ein Feuer\nin mir so hell', lang: 'de'});
await SET(p, id, {op: 'del', k: 2}); await SET(p, id, {op: 'ins', k: 2, text: 'oft'}); await SET(p, id, {op: 'shift', k: 3, d: 1}); await SET(p, id, {op: 'shift', k: 4, d: -1});
await SET(p, id, {op: 'merge', k: 0}); await SET(p, id, {op: 'split', k: 0});
await p.evaluate(id => SYNQUENZER.g9Recognize(id, {lang: 'de', mode: 'fill'}), id);
const n18 = (await U(p)).n - n0, md = await p.evaluate(() => window.__md);
ok(n18 === 18, 'G9-33 genau 18 Undo-Schritte (' + n18 + ')');
ok(md >= 18, 'G9-33 „geändert“ nach jedem Schritt sofort (markDirty ' + md + '×)');
const S1 = await p.evaluate(() => SYNQUENZER.project().takes);
for (let q = 0; q < 18; q++) await p.evaluate(() => SYNQUENZER.undo());
ok(deq(await p.evaluate(() => SYNQUENZER.project().takes), S0), 'G9-33 alle zurück = S.takes deep-equal zum Anfang');
for (let q = 0; q < 18; q++) await p.evaluate(() => SYNQUENZER.redo());
ok(deq(await p.evaluate(() => SYNQUENZER.project().takes), S1), 'G9-33 alle vor = deep-equal zum Ende');
ly = await LY(p, id); ok(ly.src && ly.s.some(s => s.x === 'Herz' && s.p === .4), 'Erkennen (angedockt, Test-Erkenner): Lücken gefüllt, unsicheres Wort mit p');
// ---------- G9-37 Treffer-Regel (rein) + ◀ ▶ ----------
await p.evaluate(() => SYNQUENZER.g9Text(null, true));
const hit = (sx, x) => p.evaluate(([sx, x]) => g9HitK({g9: {sx}}, x), [sx, x]);
let a = 0; const SA = [[0, 80], [80, 98], [98, 178]]; for (let d = -22; d <= 22; d += 5.5) if (await hit(SA, 89 + d) === 1) a++;
ok(a === 9, 'G9-37 (a) 18-px-Abschnitt zwischen 80-px-Abschnitten: Tipps ±22 px um die Mitte wählen ihn (' + a + '/9)');
let b = 0; const SB = [[0, 80]].concat(Array.from({length: 5}, (_, q) => [80 + q * 18, 98 + q * 18]), [[170, 250]]);
for (let q = 1; q <= 5; q++) { const c = 89 + (q - 1) * 18; let all = true; for (const d of [-8, -4, 0, 4, 8]) if (await hit(SB, c + d) !== q) all = false; if (all) b++; }
ok(b === 5, 'G9-37 (b) fünf benachbarte 18-px-Abschnitte: Tipp ±8 px um jede Mitte wählt genau diesen (' + b + '/5)');
await p.evaluate(() => SYNQUENZER.g9Sel(0)); g = await G();
let c = 0; for (let q = 1; q < 16; q++) { await tapX(g.btn.next.x + 22, g.btn.next.y + 22); const i = await I(), l = (await PL()).pop(); if (i.ed.sel === q && l.k === q) c++; }
for (let q = 14; q >= 0; q--) { await tapX(g.btn.prev.x + 22, g.btn.prev.y + 22); const i = await I(), l = (await PL()).pop(); if (i.ed.sel === q && l.k === q) c++; }
ok(c === 30, 'G9-37 (c) ▶ ◀ erreichen jeden Abschnitt der Reihe nach und spielen ihn (' + c + '/30)');
{ const z = await p.evaluate(() => { const E = WP.ed; return {zoom: E.zoom, z0: E.g9.zoom0}; }); const ORD = [0, 4, 2, 1];
  ok(ORD.indexOf(z.zoom) - ORD.indexOf(z.z0) <= 1 && z.zoom !== 0 ? z.zoom >= 1 : true, 'G9-37 Zoom: höchstens eine Stufe feiner als der Marken-Modus, nie feiner als 1 Takt (' + z.z0 + ' → ' + z.zoom + ')'); }
// ---------- G9-39 Schließen auf jedem Weg ----------
const closed = () => p.evaluate(() => ({g9: !!(WP.ed && WP.ed.g9), cls: EL.wpSheet.classList.contains('g9') || EL.wpSheet.classList.contains('g9dock'), src: !!G9.src, foc: !!(document.activeElement && document.activeElement.classList.contains('g9f'))}));
const isClosed = s => !s.g9 && !s.cls && !s.src && !s.foc;
const reopen = async () => { await p.evaluate(r => { if (!WP.ed) SYNQUENZER.wpOpen(r); SYNQUENZER.g9Text(r, true); SYNQUENZER.g9Sel(3); }, tk.ref); await sleep(80); };
const ways = [
  ['✕', async () => { g = await G(); await tapX(g.btn.x ? g.btn.x.x + 22 : 0, 0) ; await p.evaluate(() => document.querySelector('#wpSheet .sh-x').click()); }],
  ['[Text]', async () => { await p.evaluate(() => document.querySelector('#wpSheet .wptx').click()); }],
  ['Szenenwechsel', async () => { await p.evaluate(() => SYNQUENZER.launchScene ? SYNQUENZER.launchScene(1) : launchScene(1)); }],
  ['Stopp', async () => { await p.evaluate(() => SYNQUENZER.stop()); }],
  ['Ansichtswechsel', async () => { await p.evaluate(() => SYNQUENZER.songView(true)); await p.evaluate(() => SYNQUENZER.songView(false)); }],
];
let n39 = 0;
for (const [nm, fn] of ways) { await reopen(); const s0 = await closed(); await fn(); await sleep(80); const s1 = await closed(); if (s0.g9 && isClosed(s1)) n39++; else console.log('   Schließen', nm, JSON.stringify(s0), JSON.stringify(s1)); }
await reopen(); while ((await U(p)).n > U0 - 1 && (await U(p)).n > 0) await p.evaluate(() => SYNQUENZER.undo());
await sleep(100); { const s1 = await closed(); if (isClosed(s1)) n39++; else console.log('   Take gelöscht', JSON.stringify(s1)); }
ok(n39 === 6, 'G9-39 ✕, [Text], Szenenwechsel, Stopp, Ansichtswechsel, Take gelöscht → Text-Modus weg, Vorspielen endet, Fokus weg (' + n39 + '/6)');
ok(errs.length === 0, 'keine Konsolen-Fehler ' + errs.join(' | '));
process.exitCode = ok.done(); await br.close();
